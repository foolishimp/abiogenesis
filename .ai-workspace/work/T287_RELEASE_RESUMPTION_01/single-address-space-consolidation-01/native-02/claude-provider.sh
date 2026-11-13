#!/bin/sh
# Exact provider scratch; one serial coding Worker.
TMPDIR='/Users/jim/src/apps/abiogenesis-single-address-space/consolidation-scratch/native-02/tmp'
NPM_CONFIG_CACHE='/Users/jim/src/apps/abiogenesis-single-address-space/consolidation-scratch/native-02/tmp'
export TMPDIR NPM_CONFIG_CACHE
exec '/Users/jim/.local/share/claude/versions/2.1.306' "$@"
