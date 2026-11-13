#!/bin/sh
# scratch10 build: the steps of `npm run build` (clean, tsc, owning generator) inside the scratch mirror.
set -e
cd "$(dirname "$0")/repo/build_tenants/abiogenesis/typescript"
node scripts/clean.mjs
node node_modules/typescript/bin/tsc -p tsconfig.json
node scripts/generate-product-manifest.mjs
