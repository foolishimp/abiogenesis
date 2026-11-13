#!/bin/sh
TMPDIR=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmpd5p1
TMPPREFIX=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmpd5p1/zsh
NPM_CONFIG_CACHE=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmpd5p1/npm-cache
NPM_CONFIG_UPDATE_NOTIFIER=false
NPM_CONFIG_OFFLINE=true
export TMPDIR TMPPREFIX NPM_CONFIG_CACHE NPM_CONFIG_UPDATE_NOTIFIER NPM_CONFIG_OFFLINE
exec /Users/jim/.local/share/claude/versions/2.1.306 "$@"
