#!/bin/sh
TMPDIR=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmpq23p
NPM_CONFIG_CACHE=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmpq23p/npm-cache
export TMPDIR NPM_CONFIG_CACHE
exec /Users/jim/.local/share/claude/versions/2.1.306 "$@"
