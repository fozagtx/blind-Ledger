import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const ARB_RPC = process.env.ARBITRUM_SEPOLIA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
      evmVersion: "cancun",
    },
  },
  networks: {
    arbSepolia: {
      url: ARB_RPC,
      chainId: 421614,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      arbitrumSepolia: process.env.ARBISCAN_API_KEY ?? "",
    },
  },
};

export default config;
