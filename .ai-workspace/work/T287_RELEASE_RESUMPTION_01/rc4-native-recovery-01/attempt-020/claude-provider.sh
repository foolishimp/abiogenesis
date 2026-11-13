#!/bin/sh
# Root-selected provider-only temporary storage; Runtime parent environment is unchanged.
TMPDIR='/Users/jim/src/apps/abiogenesis-rc4-native-recovery/rc4-scratch/native-recovery-20/tmp'
NPM_CONFIG_CACHE='/Users/jim/src/apps/abiogenesis-rc4-native-recovery/rc4-scratch/native-recovery-20/tmp'
export TMPDIR NPM_CONFIG_CACHE
exec '/Users/jim/.local/share/claude/versions/2.1.306' "$@"
