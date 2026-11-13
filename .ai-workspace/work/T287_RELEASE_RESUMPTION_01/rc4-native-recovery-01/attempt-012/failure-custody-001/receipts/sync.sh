#!/bin/sh
# Attempt012 scratch mirror: canonical tenant sources plus only the witness subtree.
# Build outputs, packed artifacts and node_modules stay scratch-local and disposable.
set -e
ROOT=/Users/jim/src/apps/abiogenesis-rc4-native-recovery
S=$ROOT/rc4-scratch/native-recovery-12
T=$S/repo/build_tenants/abiogenesis/typescript
W=.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness
mkdir -p "$T" "$S/repo/$W"
rsync -a --delete --exclude build --exclude node_modules --exclude artifacts \
  "$ROOT/build_tenants/abiogenesis/typescript/" "$T/"
rsync -a --delete "$ROOT/$W/" "$S/repo/$W/"
cp "$ROOT/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-witness-contract.md" "$S/repo/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/"
[ -e "$T/node_modules" ] || cp -R "/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules" "$T/node_modules"
