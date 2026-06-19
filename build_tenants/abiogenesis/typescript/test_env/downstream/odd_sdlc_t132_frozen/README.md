# Frozen odd_sdlc T-132 Sandbox

This directory contains an ABI-owned frozen copy of the odd_sdlc TypeScript
tenant sandbox used for the T-132 JavaScript hello-world live build loop.

Source copy:

- copied from `/Users/jim/src/apps/odd_sdlc/build_tenants/typescript`
- kept as a downstream fixture inside ABI so ABI/GTL changes can be tested
  before odd_sdlc consumes a release candidate

Purpose:

- exercise current GTL/ABG changes against a non-trivial downstream ODD
  implementation before cutting an ABI release candidate
- keep the downstream framework stable while ABI/GTL changes
- update this frozen copy deliberately only when the downstream interface
  contract changes

Runtime rule:

- the ABI wrapper test copies this frozen source into a per-run workspace
- the per-run copy rewrites `@abiogenesis/typescript-tenant` to the current ABI
  TypeScript package root
- the copied odd_sdlc T-132 sandbox then installs GTL/ABG plus odd_sdlc into
  its own sandbox and performs the live `gaps -> start` build loop

Generated artifacts, `node_modules`, old test runs, build output, and tarballs
are intentionally excluded from the frozen source copy.
