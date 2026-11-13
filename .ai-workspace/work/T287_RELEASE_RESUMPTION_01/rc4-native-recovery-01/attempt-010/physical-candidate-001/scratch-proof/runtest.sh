#!/bin/sh
# Run node:test files in the scratch10 build; npm stays offline.
cd /Users/jim/src/apps/abiogenesis-rc4-native-recovery/rc4-scratch/native-recovery-10/repo/build_tenants/abiogenesis/typescript
export TMPDIR=/Users/jim/src/apps/abiogenesis-rc4-native-recovery/rc4-scratch/native-recovery-10/tmp
export NPM_CONFIG_CACHE=$TMPDIR NPM_CONFIG_UPDATE_NOTIFIER=false NPM_CONFIG_OFFLINE=true NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false
exec node --experimental-vm-modules --test --test-concurrency=1 "$@"
