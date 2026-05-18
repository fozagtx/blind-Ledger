import { createPublicClient, formatEther, http } from "viem";
import { arbitrumSepolia, sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const pk = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  if (!pk) throw new Error("PRIVATE_KEY not set");
  const addr = privateKeyToAccount(pk).address;

  const sep = createPublicClient({ chain: sepolia, transport: http() });
  const arb = createPublicClient({ chain: arbitrumSepolia, transport: http() });
  const [sBal, aBal] = await Promise.all([
    sep.getBalance({ address: addr }),
    arb.getBalance({ address: addr }),
  ]);
  console.log(`Address:       ${addr}`);
  console.log(`Sepolia    :   ${formatEther(sBal)} ETH`);
  console.log(`Arb Sepolia:   ${formatEther(aBal)} ETH`);
}

main().catch((e) => { console.error(e); process.exit(1); });
