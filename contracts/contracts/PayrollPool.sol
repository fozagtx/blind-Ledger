// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint128, InEuint128, TASK_MANAGER_ADDRESS} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {ITaskManager} from "@fhenixprotocol/cofhe-contracts/ICofhe.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title PayrollPool - Confidential, recurring payroll for DAOs on Fhenix CoFHE.
/// @notice Per-payee salaries are encrypted (euint128); only the payee can unseal
///         their own amount off-chain. Aggregate payroll is also encrypted.
///         Periods are advanced by the owner OR an authorized keeper (e.g. a
///         Vercel cron job), gated by `periodInterval` so a leaked keeper key
///         can't fast-forward the schedule.
contract PayrollPool {
    using SafeERC20 for IERC20;

    address public immutable owner;
    IERC20 public immutable token;

    // Encrypted aggregate of all assigned salaries (per cycle).
    euint128 private totalAllocated;

    struct Payee {
        euint128 encAmount;
        bool exists;
    }
    mapping(address => Payee) private payees;
    address[] private payeeAddresses;

    // ---- Recurring period state ----
    uint256 public currentPeriod;       // starts at 1 in constructor
    uint256 public lastPeriodAt;        // timestamp of last advance
    uint256 public periodInterval;      // minimum seconds between advances

    // address => allowed to call advancePeriod (besides owner)
    mapping(address => bool) public keepers;

    // period => payee => state
    mapping(uint256 => mapping(address => bool)) public claimRequestedIn;
    mapping(uint256 => mapping(address => bool)) public claimedIn;

    // ---- Events ----
    event FundsDeposited(address indexed from, uint256 amount);
    event PayeeAdded(address indexed payee);
    event PayeeRemoved(address indexed payee);
    event ClaimRequested(address indexed payee, uint256 indexed period);
    event SalaryClaimed(address indexed payee, uint256 indexed period, uint256 amount);
    event PeriodAdvanced(uint256 indexed newPeriod, address indexed by);
    event KeeperSet(address indexed keeper, bool allowed);
    event PeriodIntervalUpdated(uint256 newInterval);

    // ---- Errors ----
    error NotOwner();
    error NotOwnerOrKeeper();
    error NotPayee();
    error AlreadyExists();
    error AlreadyClaimedThisPeriod();
    error AlreadyRequestedThisPeriod();
    error NotRequestedThisPeriod();
    error DecryptionNotReady();
    error InsufficientPoolBalance();
    error ZeroAddress();
    error PeriodTooSoon();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    modifier onlyOwnerOrKeeper() {
        if (msg.sender != owner && !keepers[msg.sender]) revert NotOwnerOrKeeper();
        _;
    }

    constructor(IERC20 _token, uint256 _periodInterval) {
        if (address(_token) == address(0)) revert ZeroAddress();
        owner = msg.sender;
        token = _token;
        periodInterval = _periodInterval;
        currentPeriod = 1;
        lastPeriodAt = block.timestamp;

        totalAllocated = FHE.asEuint128(0);
        FHE.allowThis(totalAllocated);
        FHE.allow(totalAllocated, msg.sender);
    }

    // ---------------------------------------------------------------------
    // Admin
    // ---------------------------------------------------------------------

    function depositFunds(uint256 amount) external onlyOwner {
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit FundsDeposited(msg.sender, amount);
    }

    function addPayee(address payee, InEuint128 calldata encAmount) external onlyOwner {
        if (payee == address(0)) revert ZeroAddress();
        if (payees[payee].exists) revert AlreadyExists();

        euint128 amount = FHE.asEuint128(encAmount);

        payees[payee] = Payee({encAmount: amount, exists: true});
        payeeAddresses.push(payee);

        totalAllocated = FHE.add(totalAllocated, amount);

        FHE.allowThis(amount);
        FHE.allowThis(totalAllocated);
        FHE.allow(amount, payee);
        FHE.allow(totalAllocated, owner);

        emit PayeeAdded(payee);
    }

    function removePayee(address payee) external onlyOwner {
        Payee storage p = payees[payee];
        if (!p.exists) revert NotPayee();

        totalAllocated = FHE.sub(totalAllocated, p.encAmount);
        FHE.allowThis(totalAllocated);
        FHE.allow(totalAllocated, owner);

        uint256 n = payeeAddresses.length;
        for (uint256 i = 0; i < n; i++) {
            if (payeeAddresses[i] == payee) {
                payeeAddresses[i] = payeeAddresses[n - 1];
                payeeAddresses.pop();
                break;
            }
        }
        delete payees[payee];

        emit PayeeRemoved(payee);
    }

    function setKeeper(address keeper, bool allowed) external onlyOwner {
        if (keeper == address(0)) revert ZeroAddress();
        keepers[keeper] = allowed;
        emit KeeperSet(keeper, allowed);
    }

    function setPeriodInterval(uint256 newInterval) external onlyOwner {
        periodInterval = newInterval;
        emit PeriodIntervalUpdated(newInterval);
    }

    // ---------------------------------------------------------------------
    // Period advance (owner OR keeper)
    // ---------------------------------------------------------------------

    /// @notice Advance the payroll period. Gated by periodInterval so a leaked
    ///         keeper key can't fast-forward.
    function advancePeriod() external onlyOwnerOrKeeper {
        if (block.timestamp < lastPeriodAt + periodInterval) revert PeriodTooSoon();
        currentPeriod += 1;
        lastPeriodAt = block.timestamp;
        emit PeriodAdvanced(currentPeriod, msg.sender);
    }

    function nextPeriodAt() external view returns (uint256) {
        return lastPeriodAt + periodInterval;
    }

    // ---------------------------------------------------------------------
    // Payee claim (2-step async decrypt, per period)
    // ---------------------------------------------------------------------

    /// @notice Step 1: payee queues threshold-network decryption for the current period.
    function requestClaim() external {
        Payee storage p = payees[msg.sender];
        if (!p.exists) revert NotPayee();
        uint256 period = currentPeriod;
        if (claimedIn[period][msg.sender]) revert AlreadyClaimedThisPeriod();
        if (claimRequestedIn[period][msg.sender]) revert AlreadyRequestedThisPeriod();

        // v0.1.3 of cofhe-contracts doesn't wrap decrypt in the FHE library;
        // call the threshold-network task manager directly. Re-queueing the
        // same handle is fine — same plaintext is returned each period.
        ITaskManager(TASK_MANAGER_ADDRESS).createDecryptTask(
            uint256(euint128.unwrap(p.encAmount)),
            msg.sender
        );
        claimRequestedIn[period][msg.sender] = true;
        emit ClaimRequested(msg.sender, period);
    }

    /// @notice Step 2: finalize once the threshold network has processed.
    function finalizeClaim() external {
        Payee storage p = payees[msg.sender];
        if (!p.exists) revert NotPayee();
        uint256 period = currentPeriod;
        if (claimedIn[period][msg.sender]) revert AlreadyClaimedThisPeriod();
        if (!claimRequestedIn[period][msg.sender]) revert NotRequestedThisPeriod();

        (uint128 amount, bool ready) = FHE.getDecryptResultSafe(p.encAmount);
        if (!ready) revert DecryptionNotReady();

        uint256 amount256 = uint256(amount);
        if (token.balanceOf(address(this)) < amount256) revert InsufficientPoolBalance();

        claimedIn[period][msg.sender] = true;
        token.safeTransfer(msg.sender, amount256);
        emit SalaryClaimed(msg.sender, period, amount256);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    /// @notice Returns the encrypted handle as uint256 — cofhejs.unseal expects bigint ctHash.
    function getPayeeEncryptedAmount(address payee) external view returns (uint256) {
        return uint256(euint128.unwrap(payees[payee].encAmount));
    }

    function getAggregatePayroll() external view returns (uint256) {
        return uint256(euint128.unwrap(totalAllocated));
    }

    function getPayeeCount() external view returns (uint256) {
        return payeeAddresses.length;
    }

    function getPayeeAt(uint256 i) external view returns (address) {
        return payeeAddresses[i];
    }

    function getRemainingBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getPayeeStatus(address payee)
        external
        view
        returns (bool exists, bool requested, bool claimed, bool ready, uint256 period)
    {
        Payee storage p = payees[payee];
        period = currentPeriod;
        exists = p.exists;
        requested = claimRequestedIn[period][payee];
        claimed = claimedIn[period][payee];
        if (exists && requested && !claimed) {
            (, ready) = FHE.getDecryptResultSafe(p.encAmount);
        }
    }
}
