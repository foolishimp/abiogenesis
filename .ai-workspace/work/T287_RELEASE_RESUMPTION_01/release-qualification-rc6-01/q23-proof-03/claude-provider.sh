#!/bin/sh
TMPDIR=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmpq23p3
NPM_CONFIG_CACHE=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmpq23p3/npm-cache
TMPPREFIX=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmpq23p3/zsh
NPM_CONFIG_UPDATE_NOTIFIER=false
NPM_CONFIG_OFFLINE=true
export TMPDIR TMPPREFIX NPM_CONFIG_CACHE NPM_CONFIG_UPDATE_NOTIFIER NPM_CONFIG_OFFLINE
exec /Users/jim/.local/share/claude/versions/2.1.306 "$@"
