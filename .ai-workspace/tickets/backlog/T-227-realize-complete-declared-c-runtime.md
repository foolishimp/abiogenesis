# T-227 - Realize Complete Declared C Runtime

- id: T-227
- title: Realize complete declared C runtime and response path
- type: feature
- ticket_category: implementation_migration
- status: backlog
- goal: abg-5-0-full-product-delivery
- phase: DS-2
- priority: high
- change_intent: >-
    Implement the approved C-runtime design inside-out and migrate the DS-1
    GraphFunction path to a complete declared multi-stage program.
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/code
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-226
- build_tenant: typescript
- admission_condition: T-226 is completed and its design is current
- migration_strategy: inside_out_hard_break
- library_usage: consume
- governing_library: existing M01 typed C, M03 uniform C-call/traversal/plugin/result/event, and M04 public adapter modules
- old_truth_path: partial C-call strangler with pending arms/site brackets/old antecedents, scalar/bootstrap plugin execution, optional worker-artifact schema, private review JSON extraction, generic-only refinement declaration parsing, and rival continuation-transition export
- new_truth_path: compiled seven-term C program through one uniform C-call resolver/envelope plus semantically admitted refinement declarations, one declared prompt/result/admission/materialization/assessment/consequence path, and one continuation projection
- old_producer_set: pending unenclosed C arms and site brackets, scalar bootstrap plugin declarations, generic-only refinement attrs admission, optional instruction artifactSchemas, private review JSON extraction/defaulting, and continuation-transition adapter builders
- new_producer_set: M01 compiled C-program/refinement-semantic admission plus M03 uniform C-call, declared instruction/result, response-admission, event, and singular projection builders
- old_consumer_set: evaluation-rule/F_H/F_D paths outside the full envelope, old dispatch antecedent gates, scalar plugin invocation, semantic compilation accepting generic-only refinement attrs, private parser/materializer/assessment paths, array-order folds, and M04 consumers of the rival transition projection
- new_consumer_set: M01 semantic compiler diagnostics, M03 uniform C-call/traversal/materialization/assessment/consequence/closure/replay, and M04 public result/replay/continuation adapters consuming admitted carriers
- projection_surfaces: C-call spine and audit equality, semantic diagnostics, result, evidence, replay, continuation, consequence, residual, and close-eligibility projections
- affected_boundary: M01 compiled C/refinement declaration admission and M03 declared execution/result/runtime truth
- dependencies:
  - T-226
- authority_refs:
  - specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT.md
  - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-CCALL.md
  - specification/requirements/abg/REQ-R-ABG3-PLUGIN-SEAMS.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/mapping/REQ-M-GTL3-CAPABILITY.md
  - .ai-workspace/tickets/backlog/T-226-design-complete-declared-c-runtime.md

## Target Truth

All seven C terms execute from compiled declarations; declared stage interior
selection, hook scopes, response admission, materialization, F_D assessment,
consequence, replay, and closure remain ABG-owned. The DS-1 Hello World path
reruns as a multi-stage declared program. Every 5.0-reachable task/arm enters
the same C-call spine and enclosure, with selection-row gate antecedents and
per-arm archive/replay audit equality.

## Required Work

1. Implement the approved carriers and migrations in dependency order.
2. Remove or reconcile the rival continuation-transition export.
3. Correct replay ordinal, per-store emitter, and typed basis-fork behavior.
4. Complete all current declaration hook scopes and exact conflict law.
5. Retire the CCALL strangler window: enclose evaluation-rule batches, F_H
   admission, and F_D mechanical transform; publish program declarations;
   rebind gate antecedents to `c_call_fibre_selected`; delegate and retire site
   brackets; prove spine shape/order/count and per-arm audit equality.
6. Enforce the declared result contract and one close-eligibility predicate.
7. Close PAYLOAD-028's universal gap: every worker-authored file artifact has
   one declared schema used for worker instruction, response admission, and
   materialization; an undeclared artifact fails before materialization.
8. Close PLUGIN-SEAMS-006's residual: expected assessment identities and the
   declared review schema are rendered into the PromptManifest, response
   admission does not rely on private free-text extraction or default a missing
   close disposition, and omitted required attestation cannot become close-eligible.
9. Admit and semantically validate serialized zoom plans, foldback declarations,
   and typed composition wiring with stable diagnostics for missing authority,
   ambiguous target, identity drift, invalid parent re-evaluation, missing node,
   unknown type, weakened contract, empty wiring, and hidden coercion.
10. Publish and locate `RuntimeEvent`/`CanonicalRuntimeEvent`/
   `RUNTIME_EVENT_KIND_VALUES`, the GTL diagnostic/repair vocabulary, and one
   canonical content-addressed language conformance corpus in the product's
   cumulative public contract catalog; remove test-only corpus authority.
11. Land A5-SP3 over its correctly scoped causal carriers.
12. Prove all seven terms, scalar reduction, composition, and installed multi-stage execution.
13. Add malformed GTL compiler and malformed/contradictory F_P response differentials.

## Impacted Interface Review Checklist

- [ ] M01 C-program native builder, raw admission, semantic compiler, and
  compiled handoff publish one `(program, role, fibre, arm)` identity and no
  consumer reconstructs it from vector or plugin identity.
- [ ] M01 refinement declaration admission validates serialized zoom,
  foldback, and type-wiring semantics against the same identities and node-type
  law as the native interfaces; generic declaration shape alone cannot pass.
- [ ] exact event/diagnostic/repair symbols and value rosters plus the language
  conformance corpus resolve through verified product-contract-catalog rows;
  package/test filesystem scanning is unnecessary and inadmissible.
- [ ] execution-declaration and plugin-selection builders consume the compiled
  handoff, resolve every current hook attachment scope under one precedence law,
  and reject unresolved, duplicate, conflicting, or cross-program bindings.
- [ ] every reachable stage task and F_D/F_P/F_H arm emits exactly one ordered
  locus-only C-call spine; fibre evidence is enclosed; program membership is
  admitted; selection is the gate antecedent; no legacy site bracket remains authoritative.
- [ ] instruction assembly and PromptManifest render the declared artifact
  schemas, expected assessment identities, and exact response contract used by admission.
- [ ] response/review admission consumes the declared contract directly; it
  rejects private free-text extraction, missing close disposition, omitted
  required attestation, contradictory truth, unknown fields, and undeclared artifacts.
- [ ] materialization consumes only admitted schema-bound artifact rows and
  cannot write or certify an undeclared worker-authored file.
- [ ] standard F_D assessment consumes admitted artifacts/evidence and does not
  reclassify semantic per-obligation F_P judgment or execute subject work.
- [ ] consequence, residual, continuation, and re-entry builders consume
  admitted result/assessment truth and cannot emit or apply traversal advice directly.
- [ ] engine iteration, retry, closure, and all-seven-term execution consume the
  new carrier and cannot fall back to scalar/bootstrap identity reconstruction.
- [ ] event emission and latest-fold projections use store-scoped/ordinal truth;
  replay array order cannot select a different current fact.
- [ ] the rival continuation-transition export is removed or demoted so M04
  status, result, replay, resume, and installed consumers use one projection algebra.
- [ ] packed installed Hello World and multi-stage proof lanes import only
  published contracts and fail when the compiled C/result carrier is removed.
- [ ] malformed GTL, malformed F_P, missing schema/attestation, mixed old/new,
  and causal-predecessor fixtures each fail at their named owning boundary.

## Required Break Order

1. Census every producer, consumer, projection, prompt, result, continuation,
   export, and proof surface in the checklist.
2. Publish/admit the compiled C identity, program catalog, uniform C-call
   resolution/enclosure contract, refinement declaration semantics, and one
   declared instruction/result contract.
3. Sever optional-schema, private-parser, missing-disposition default, and
   scalar identity-reconstruction seams; preserve their negative failures.
4. Rebind the deepest M03 stage-selection and all-seven-term execution kernel.
5. Rebind hook resolution, instruction assembly, response admission, and materialization.
6. Rebind F_D assessment, consequence, residual, continuation, replay, and closure.
7. Replace the rival continuation export and array-order/store-global residuals.
8. Rebind M04 projections, public consumers, installed fixtures, and tests; then
   remove or reprice every mixed-state test.

## Break-To-Closure Map

| Break | Old seam kept broken | Required negative proof | Closes |
|---|---|---|---|
| compiled identity | vector/plugin-derived stage identity | cross-program same-role/fibre/arm binding refuses | seven-term declared execution |
| uniform C-call enclosure | pending arms, site brackets, old dispatch antecedents | per-arm spine shape/order/count, free-floating evidence, membership, antecedent, and archive/replay differentials | CCALL strangler retirement and PRODUCT compute envelope |
| refinement declaration admission | generic attrs accept unresolved zoom/foldback/type wiring | malformed authority, identity, parent-evaluation, node/type, and wiring rows return stable diagnostics | D-12 semantic compiler closure |
| public conformance oracle | test-only corpus and implicit export scan | missing/digest-mismatched roster or corpus row refuses installed conformance | D-11/LAWS-019/027/EVENTS-029 addressability |
| declared response | optional schema/private parser/default close | undeclared artifact and omitted disposition/attestation refuse before write/close | PAYLOAD-028 and PLUGIN-SEAMS-006 |
| kernel rebind | scalar/bootstrap invocation authority | removing compiled C carrier blocks rather than falls back | all-seven-term runtime and no vector router |
| assessment/consequence | product/plugin-owned assessment or re-entry | candidate advice cannot emit/apply transition or close | F_D and ABG consequence ownership |
| replay/continuation | array order, singleton context, rival transition export | reordered replay and old export cannot change current disposition | CR-RL-01/02/05/06 |
| public/proof rebind | M04/test reconstruction from legacy payloads | packed installed public path fails closed without new carriers | installed DS-2 closure and A5-SP3 |

## Closure Law

Close when the approved multi-stage path passes through packed installed
artifacts, every admitted runtime-law residual and A5-SP3 has a focused proof,
the full deterministic suite is green, and no former authority path remains reachable.

## Migration Declaration

The authoritative source moves inside-out from the compiled `(program, role,
fibre, arm)` C carrier, uniform C-call resolver/envelope, semantically admitted
GraphFunction refinement declarations, and one declared result contract. All
compiler, runtime, prompt,
materialization, assessment, consequence, continuation, public projection, and
proof consumers migrate to that source. Scalar reduction remains a lawful
reduction of the same carrier; it is not retained as a rival authority. The
optional-schema/private-parser path and rival continuation export are removed
or made unreachable before closure. Mixed old/new proof is inadmissible.

## Migration Checklist

- [ ] old truth path is named explicitly
- [ ] new truth path is named explicitly
- [ ] producer set for the new truth is listed
- [ ] consumer set for the new truth is listed
- [ ] projection/read-model surfaces are listed
- [ ] old truth path is removed or explicitly demoted from authority
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old/new behavior are removed or repriced
- [ ] recurring realization patterns are checked against existing library/commonization surfaces
- [ ] ticket declares library usage and names the governing library or rationale
- [ ] this ticket carries only the TypeScript tenant lifecycle
- [ ] ticket wording, product wording, and proof claims are reconciled before closure

## Non-Closure Conditions

- A downstream router or vector-specific dispatcher is introduced.
- Malformed F_P output can materialize or become close-eligible.
- An undeclared worker-authored artifact is admitted or materialized.
- Expected assessment identities or schema are absent from the prompt, or
  missing disposition/attestation defaults to acceptance.
- Deterministic preflight consumes an F_P retry.
- Transitional and authoritative exports remain simultaneously public.
- A reachable evaluation-rule, F_H, F_D, composed, scalar, or recursive arm remains outside the C-call envelope.
- The implementation expands into hosted, multi-user, scheduler, or tamper scope.

## Proof Surface

- native type and raw-admission tests
- semantic compiler diagnostics
- seven-term unit/composition/runtime tests
- installed multi-stage DS-1 rerun
- focused CR-RL and A5-SP3 regressions
- full deterministic TypeScript gates and semantic lint
- phase-end code review against T-226, T-218, PRODUCT, and the GTL axioms
