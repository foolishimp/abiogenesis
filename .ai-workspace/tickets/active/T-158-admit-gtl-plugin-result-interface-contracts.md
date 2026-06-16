---
id: T-158
title: Admit GTL plugin result interface contracts
status: active
change_class: requirement_reprice
re_entry_point: requirements
owner: abiogenesis
created: 2026-06-16
source: odd_sdlc data-mapper steel-thread live run exposed downstream parsing of F_P/evaluator result files as de facto API truth
related_tickets:
  - .ai-workspace/tickets/active/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md
  - .ai-workspace/tickets/active/T-156-admit-consequence-allowed-traversal-catalog.md
  - .ai-workspace/tickets/active/T-157-admit-runtime-start-traversal-strategy-selection.md
governance_scope: STDO Method, ODD_METHOD, DESIGN_MODULE_METHOD
---

# T-158: GTL Plugin Result Interface Contracts

## Intake

Downstream `odd_sdlc` data-mapper steel-thread proof reached a component-code
frontier where the design-depth `F_P.evaluate` result contained the accepted
register evidence, but the downstream product still had to inspect local
`fp_evaluate_result.json`, rule-outcome files, register sidecars, and archive
lineage to decide which typed register was current.

That is the wrong authority shape. GTL already declares plugin, hook, rule,
compute-notation, and carrier output law. ABG must admit plugin result envelopes
against those declared typed interfaces and expose one admitted result surface to
downstream products. Downstream products may interpret admitted results, but they
must not reconstruct plugin APIs from file layout or tolerate multiple result
shapes as compatibility law.

## Target Truth

GTL declares typed plugin result interfaces for each hook/regime/stage boundary
that ABG invokes or admits. For `F_P` transform/evaluate/consequence and
deterministic rule outputs, the GTL declaration names the selected
`abg.fn_composition`, selected regime binding, stage role, rule refs, expected
output carrier families, produced carrier refs, evidence refs, and terminal or
continuation semantics required at that boundary.

ABG admits a plugin result envelope against that interface before any downstream
product consumes it. The admitted envelope is the single source of truth for
plugin output identity and carrier selection. Product-local filesystem scans,
shape probing, fallback aliases, or hand-written result parsers are not contract
law.

## Superseded Truth

- Downstream products infer current plugin output by scanning operator archives.
- Product code accepts multiple historical `fp_evaluate_result.json` shapes as
  compatibility law.
- Rule outcome sidecars or result files act as selector APIs without ABG
  admission against a GTL-declared interface.
- `typecheckGtlProgram(...)` validates traversal and plugin declarations but
  cannot validate the output interface consumed by plugins.

## Required Shape

- Extend GTL contract-law requirements so hook/plugin declarations can name
  typed result interfaces and output carrier contracts for transform/evaluate/
  consequence stages.
- Extend ABG plugin contract admission with a prime carrier such as
  `AdmittedPluginResultEnvelope` or equivalent. The exact name is a design
  choice; the invariant is that ABG owns admission of selected composition,
  stage role, result carrier family, produced refs, evidence refs, and any
  terminal/continuation semantics.
- Extend `typecheckGtlProgram(...)` so static conformance rejects malformed or
  incomplete plugin result interface declarations before downstream products
  build over them.
- Ensure ABG runtime/result-ingress emits or projects the admitted envelope as
  replay-visible truth before downstream product consumers can select carriers
  from it.
- Provide negative proof that a downstream product cannot satisfy the interface
  by local archive scan, direct file path convention, missing selected
  composition, wrong stage role, undeclared carrier family, stale output ref, or
  duplicate ambiguous produced register.

## Boundary Notes

- GTL owns the typed interface declarations.
- ABG owns admission, replay-visible result truth, payload ledger, and runtime
  consequences of admitted plugin results.
- Downstream products own domain interpretation of admitted result carriers.
- SDLC may fail closed when an admitted result envelope is absent; it must not
  implement a parallel envelope compiler.

## Closure Criteria

- Requirements and singular design/IACS define the plugin result interface
  carrier, owners, states, non-closure signals, and reference-to-target
  derivation.
- `typecheckGtlProgram(...)` validates plugin result interface declarations for
  hook/regime/stage boundaries.
- Runtime admission validates actual plugin outputs against the declared
  interface and emits/replays one admitted result envelope.
- Existing plugin paths, including `F_P.evaluate` rule-result outputs used by
  downstream SDLC, consume the admitted envelope rather than product-local shape
  probing.
- Negative tests reject missing selected composition, mismatched regime binding,
  undeclared output carrier family, direct file-path selector authority,
  ambiguous produced refs, and engine-authority smuggling.
- Downstream proof shows `odd_sdlc` can consume a design-depth evaluator result
  through the admitted envelope without local archive scanning or compatibility
  aliases.

## Non-Closure Conditions

- Any downstream product must parse raw plugin result files to identify the
  current typed output carrier.
- Multiple result shapes are accepted as permanent compatibility law.
- Plugin outputs can influence traversal, closure, payload ledger, events,
  projection, or continuation before ABG admission.
- The conformance gate cannot prove the typed result interface declared by GTL.

## Implementation Ledger

- [x] 2026-06-16: Added `GtlProgramPluginResultInterfaceRow` to the GTL
  program conformance input and public type export.
- [x] 2026-06-16: `admitGtlProgramConformanceInput(...)` now admits
  `pluginResultInterfaces` rows as first-class compiler input.
- [x] 2026-06-16: `typecheckGtlProgram(...)` now rejects plugin result
  interface rows that do not resolve to a compute stage, mismatch selected
  composition/digest/stage role/compute means, fail to cover stage output
  carriers, omit required identity fields, use empty selector authority, or
  cite local result files such as `fp_evaluate_result.json` as selector law.
- [x] 2026-06-16: Inventory digests include `pluginResultInterfaces`, so report
  identity changes when the typed result interface surface changes.
- [ ] Runtime plugin result ingress still needs an admitted replay-visible
  result envelope. The compiler slice does not by itself replace downstream
  consumption of historical result files.
- [ ] SDLC must consume the admitted runtime envelope once ABG publishes it and
  remove product-local result-shape probing.

## Current Proof

- `cd build_tenants/abiogenesis/typescript && npm run build:semantic`
  passed on 2026-06-16.
- `cd build_tenants/abiogenesis/typescript && node --test
  test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs` passed 44/44
  on 2026-06-16.
- Focused negative proof: `T-158 GTL program typechecker rejects malformed
  plugin result interfaces` rejects mismatched stage role, mismatched compute
  means, undeclared output carrier, missing identity fields, and direct local
  `fp_evaluate_result.json` selector authority.

## Current Non-Closure

The static compiler gate is implemented. This ticket cannot close until ABG
also admits actual runtime plugin result envelopes and downstream consumers use
that admitted envelope instead of local archive/result-file selectors.
