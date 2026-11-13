#!/bin/sh
# Exact provider-only scratch; parent Runtime TMP remains separate.
TMPDIR='/Users/jim/src/apps/abiogenesis-rc5-performance/rc5-scratch/f4-02/tmp'
NPM_CONFIG_CACHE='/Users/jim/src/apps/abiogenesis-rc5-performance/rc5-scratch/f4-02/tmp'
export TMPDIR NPM_CONFIG_CACHE
exec '/Users/jim/.local/share/claude/versions/2.1.306' "$@"
