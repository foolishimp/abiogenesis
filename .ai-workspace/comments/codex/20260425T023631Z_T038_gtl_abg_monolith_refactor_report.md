# T-038 GTL/ABG Monolith Refactor Report

**Status**: Processed
**Ticket**: `T-038-refactor-gtl-abg-constitutional-design-monoliths-into-constituent-authority-surfaces`
**Date**: 2026-04-25

## Classification Summary

| Source | Classification | Destination |
| --- | --- | --- |
| GTL language identity, graph primacy, declaration/runtime boundary | requirement | `specification/requirements/gtl/REQ-L-GTL3-LANGUAGE.md`, `REQ-L-GTL3-GRAPH.md`, `REQ-L-GTL3-LAWS.md` |
| GTL public callable carrier, graph-function publication, module publication | requirement | `REQ-L-GTL3-GRAPHFUNCTION.md`, `REQ-L-GTL3-JOB.md`, `REQ-L-GTL3-MODULE.md` |
| GTL invariant traversal, hook surfaces, selection boundaries | requirement | `REQ-L-GTL3-GRAPHVECTOR.md`, `REQ-L-GTL3-HOOKS.md`, `REQ-L-GTL3-SELECTION-BOUNDARY.md`, `REQ-L-GTL3-SYNTHESIS.md` |
| GTL composition, substitution, recursion, higher-order operators | requirement | `REQ-L-GTL3-COMPOSE.md`, `REQ-L-GTL3-SUBSTITUTE.md`, `REQ-L-GTL3-RECURSE.md`, `REQ-L-GTL3-HOF.md` |
| GTL shared module ownership and unit-test derivation | shared_design | `build_tenants/common/design/module_decomp.md`, `M01-gtl-core.yml`, `M02-work-publication.yml` |
| ABG event substrate, replay/projection, runtime aggregate truth | requirement | `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`, `REQ-R-ABG3-PROJECTION.md`, `REQ-R-ABG3-RUN.md`, `REQ-R-ABG3-GRAPHCALL.md`, `REQ-R-ABG3-FRAME.md`, `REQ-R-ABG3-CONTINUATION.md` |
| ABG public start/resume versus internal graph-function iteration | requirement | `REQ-R-ABG3-INTERPRET.md` |
| ABG next-edge selection from replay-derived event truth | requirement | `REQ-R-ABG3-INTERPRET.md`, `REQ-R-ABG3-EVENTS.md` |
| ABG kernel ownership of materialization, traversal, projection, correction, transport | shared_design | `build_tenants/common/design/modules/M03-engine-kernel.yml` |
| Python and TypeScript carrier, package, ADR, and runtime binding choices | tenant_design | `build_tenants/abiogenesis/python/design/`, `build_tenants/abiogenesis/typescript/design/` |
| Scenario proving lanes | scenario_or_proof | `specification/scenarios/*.md` derive from requirements, intent, product, and method surfaces |
| Monolith source files | historical_or_commentary | Replaced by superseded stubs in `specification/ABG_3_CONSTITUTIONAL_DESIGN.md` and `specification/GTL_3_CONSTITUTIONAL_DESIGN.md` |
| Repeated prose that duplicated existing requirement families | duplicate | Left in requirements only; not preserved as rival doctrine |
| No active destination found | orphan | None. No unique live obligation remains only in a monolith. |

## Unique Law Moved

- GTL "not a planner/runtime event model/worker store/transport language" law is now explicit in `REQ-L-GTL3-LANGUAGE-008`.
- GTL graph-function-first, composition-first, recursion-capable, higher-order, engine-agnostic stance is now explicit in `REQ-L-GTL3-LANGUAGE-007`.
- ABG public start/resume as ignition, not iteration engine, is now explicit in `REQ-R-ABG3-INTERPRET-009`.
- ABG replay-derived graph-function iteration and next-edge selection are now explicit in `REQ-R-ABG3-INTERPRET-010` through `012`.
- ABG event envelope and authoritative event-family coverage are now explicit in `REQ-R-ABG3-EVENTS-010` and `011`.
- M03 now owns kernel-level replay-derived graph-function iteration and next-edge advancement.

## Supersession Result

The two monolith files are retained as historical locators only. Live authority now resolves through:

- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/gtl/`
- `specification/requirements/abg/`
- `specification/requirements/mapping/`
- `build_tenants/common/design/module_decomp.md`
- `build_tenants/common/design/modules/`
- tenant-local design and ADR surfaces

## Proof Results

- `rg -n "ABG_3_CONSTITUTIONAL_DESIGN|GTL_3_CONSTITUTIONAL_DESIGN" specification build_tenants .ai-workspace/tickets/backlog .ai-workspace/tickets/active` returned no live matches when run over Markdown/YAML surfaces with generated test artifacts excluded.
- `rg -n "This document is the .*constitution|constitutional authority" specification` returned no matches.
- `rg -n "Derives from.*CONSTITUTIONAL_DESIGN|Derived from.*CONSTITUTIONAL_DESIGN" specification build_tenants/common/design build_tenants/abiogenesis/typescript/design build_tenants/abiogenesis/python/design build_tenants/abiogenesis/codex/design` returned no matches.
- `git diff --check` passed.
