#!/usr/bin/env bash
# Idempotent patch for cofhejs@0.3.1 to use tfhe-rs safe (versioned) serialization,
# which is what the live Fhenix CoFHE testnet endpoints currently serve.
#
# Why this exists: cofhejs 0.3.1 calls legacy `.serialize()` / `.deserialize()` but
# the Fhenix server has upgraded to versioned safe serialization. We swap the calls
# in cofhejs's bundled dist so init + encrypt round-trips with the live network.
#
# Combined with `pnpm.overrides` pinning tfhe + node-tfhe to 1.5.4 (the version
# the Fhenix verifier currently understands), this restores full FHE functionality.
#
# Run as postinstall via package.json. Safe to re-run.

set -eu

ROOT="${1:-.}"

# bash 3 compatible — no mapfile, just a plain loop over find output.
patched_count=0
while IFS= read -r DIST; do
  [ -n "$DIST" ] || continue
  for FILE in node.js node.mjs web.js web.mjs; do
    [ -f "$DIST/$FILE" ] || continue
    if ! grep -q "safe_deserialize(buff" "$DIST/$FILE" 2>/dev/null; then
      sed -i.bak -E \
        -e 's/TfheCompactPublicKey\.deserialize\(buff\)/TfheCompactPublicKey.safe_deserialize(buff, 100000000n)/g' \
        -e 's/CompactPkeCrs\.deserialize\(buff\)/CompactPkeCrs.safe_deserialize(buff, 200000000n)/g' \
        -e 's/TfheCompactPublicKey\.deserialize\(fhePublicKey\)/TfheCompactPublicKey.safe_deserialize(fhePublicKey, 100000000n)/g' \
        -e 's/CompactPkeCrs\.deserialize\(crs\)/CompactPkeCrs.safe_deserialize(crs, 200000000n)/g' \
        -e 's/compactList\.serialize\(\)/compactList.safe_serialize(200000000n)/g' \
        "$DIST/$FILE"
      rm -f "$DIST/$FILE.bak"
      echo "patch-cofhejs: patched $DIST/$FILE"
      patched_count=$((patched_count + 1))
    fi
  done
done < <(find "$ROOT/node_modules/.pnpm" -maxdepth 5 -type d -path "*cofhejs*/dist" 2>/dev/null)

if [ "$patched_count" -eq 0 ]; then
  echo "patch-cofhejs: nothing to patch (already done or cofhejs not installed)."
fi
