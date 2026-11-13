#!/bin/sh
# Mirror canonical tenant sources and only the default-library witness directory
# into scratch10. Build outputs, generated scratch assets and the offline
# package-root copy stay scratch-local; the canonical worksite is read only.
set -e
ROOT=/Users/jim/src/apps/abiogenesis-rc4-native-recovery
S=$ROOT/rc4-scratch/native-recovery-10
T=$S/repo/build_tenants/abiogenesis/typescript
W=.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/default-library-witness
mkdir -p "$T" "$S/repo/$W"
rsync -a --delete --exclude build --exclude node_modules --exclude artifacts \
  "$ROOT/build_tenants/abiogenesis/typescript/" "$T/"
rsync -a --delete "$ROOT/$W/" "$S/repo/$W/"
[ -e "$T/node_modules" ] || cp -R "/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules" "$T/node_modules"
