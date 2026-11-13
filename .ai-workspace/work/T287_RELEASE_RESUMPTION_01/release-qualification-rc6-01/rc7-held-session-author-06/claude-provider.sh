#!/bin/sh
TMPDIR=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmphs6
TMPPREFIX=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmphs6/zsh
NPM_CONFIG_CACHE=/Users/jim/src/apps/abiogenesis-rc6-local-cut/tmphs6/npm-cache
NPM_CONFIG_UPDATE_NOTIFIER=false
NPM_CONFIG_OFFLINE=true
NPM_CONFIG_USERCONFIG=/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-held-session-author-06/npm-user.npmrc
NPM_CONFIG_GLOBALCONFIG=/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-inputs/rc7-held-session-author-06/npm-global.npmrc
export TMPDIR TMPPREFIX NPM_CONFIG_CACHE NPM_CONFIG_UPDATE_NOTIFIER NPM_CONFIG_OFFLINE NPM_CONFIG_USERCONFIG NPM_CONFIG_GLOBALCONFIG
exec /Users/jim/.local/share/claude/versions/2.1.306 "$@"
