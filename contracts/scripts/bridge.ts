// Bridges native ETH from Ethereum Sepolia → Arbitrum Sepolia using Arbitrum's
// official L1 Inbox contract. Uses PRIVATE_KEY from .env.
//
// Takes ~10-15 min for the L2 to credit the deposit.
import { createPublicClient, createWalletClient, formatEther, http, parseEther } from "viem";
import { sepolia, arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

// Arbitrum Sepolia's Inbox contract, deployed on Ethereum Sepolia (L1 side).
// depositEth() is payable; the L2 credits msg.sender with the deposited amount.
const ARB_SEPOLIA_INBOX_ON_SEPOLIA = "0xaAe29B0366299461418F5324a79Afc425BE5ae21" as const;

const inboxAbi = [
  {
    type: "function",
    name: "depositEth",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "payable",
  },
] as const;

async function main() {
  const pk = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  if (!pk) throw new Error("PRIVATE_KEY not set in .env");
  const account = privateKeyToAccount(pk);

  const sepClient = createPublicClient({ chain: sepolia, transport: http() });
  const arbClient = createPublicClient({ chain: arbitrumSepolia, transport: http() });
  const wallet = createWalletClient({ account, chain: sepolia, transport: http() });

  const sepBal = await sepClient.getBalance({ address: account.address });
  const arbBal = await arbClient.getBalance({ address: account.address });
  console.log(`Address:       ${account.address}`);
  console.log(`Sepolia    :   ${formatEther(sepBal)} ETH`);
  console.log(`Arb Sepolia:   ${formatEther(arbBal)} ETH`);
  console.log("");

  // Bridge most of the balance, leaving ~0.005 for L1 gas (depositEth is cheap).
  const reserve = parseEther("0.005");
  if (sepBal <= reserve) throw new Error(`Not enough Sepolia ETH (need > ${formatEther(reserve)})`);
  const amount = sepBal - reserve;
  console.log(`Bridging ${formatEther(amount)} ETH → Arbitrum Sepolia...`);

  const hash = await wallet.writeContract({
    address: ARB_SEPOLIA_INBOX_ON_SEPOLIA,
    abi: inboxAbi,
    functionName: "depositEth",
    value: amount,
  });
  console.log(`L1 tx: https://sepolia.etherscan.io/tx/${hash}`);

  const receipt = await sepClient.waitForTransactionReceipt({ hash });
  console.log(`L1 confirmed in block ${receipt.blockNumber}. Gas used: ${receipt.gasUsed}`);
  console.log("");
  console.log("Bridge submitted. L2 credits typically arrive in 10-15 min.");
  console.log("Run `pnpm bridge:status` to poll the Arb Sepolia balance.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
