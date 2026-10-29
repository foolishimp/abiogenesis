#!/bin/sh
# RP-2 operator configuration: this driver's 16 GiB heap is explicit and local.
# No NODE_OPTIONS or global environment mutation. Checked on a 128 GiB host.
exec node --max-old-space-size=16384 "$(dirname "$0")/exact-candidate-qualification.mjs" "$@"
