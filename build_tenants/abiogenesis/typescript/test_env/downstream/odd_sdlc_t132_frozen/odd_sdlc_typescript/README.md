# odd_sdlc TypeScript Tenant

This tenant is the planned ODD-native TypeScript realization of `odd_sdlc`.

It realizes the singleton `specification/` surface. It does not define a rival
product constitution.

Current status: bounded RC-qualified package surface.

The tenant exports strict SDLC carriers, graph publication, pure workspace
ingress, query and gap projections, public ABG handoff, hook contracts,
traceability closure, triage routing, operational transition surfaces, and an
RC qualification report. It also publishes a bounded `odd-sdlc-ts` CLI adapter
over those surfaces, package-backed install/normalize and release-cut
adapters, and a live external `F_P` data_mapper qualification lane.
It does not claim full Python operational replacement until side-by-side
archive comparison and final T-041 review close.

## Commands

```bash
npm run build:semantic
npm run lint:semantic
npm run test:semantic
npm run test:t038
npm run test:t058
npm run test:t059
ODD_SDLC_TS_LIVE_FP=1 npm run test:live
node build/semantic/code/src/cli/main.js rc-report
node build/semantic/code/src/cli/main.js install --target /tmp/odd-sdlc-target
node build/semantic/code/src/cli/main.js release-cut --archive-root /tmp/odd-sdlc-release
```
