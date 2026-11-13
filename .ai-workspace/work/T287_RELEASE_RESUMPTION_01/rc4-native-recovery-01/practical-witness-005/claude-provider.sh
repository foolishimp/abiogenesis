#!/bin/sh
set -eu
: "${ABG_WITNESS_PROVIDER_TMP:?Root-selected existing provider leaf required}"
case "$ABG_WITNESS_PROVIDER_TMP" in
  "/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/practical-witness-005"/setup-host/abi5-root-env-*/workspace/operator-scratch/tmp) ;;
  *) echo 'Provider leaf outside selected witness worksite' >&2; exit 64;;
esac
test -d "$ABG_WITNESS_PROVIDER_TMP"
export TMPDIR="$ABG_WITNESS_PROVIDER_TMP"
export NPM_CONFIG_CACHE="$ABG_WITNESS_PROVIDER_TMP"
exec "/Users/jim/.local/share/claude/versions/2.1.306" "$@"
