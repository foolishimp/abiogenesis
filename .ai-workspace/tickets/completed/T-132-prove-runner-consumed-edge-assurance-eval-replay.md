---
id: T-132
title: Prove runner-consumed edge assurance eval replay
type: feature
ticket_category: edge_assurance_runtime_replay
status: completed
review_status: completed_source_scope
goal: edge-assurance-runtime-replay-proof
change_intent: Consolidate the remaining T-130/T-131 residuals into one deep runtime proof that ABG can consume declared edge assurance eval contracts across at least a three-edge GTL chain through the runner, record and admit hook findings per edge, project gain/close/residual/next-action truth, compose A-to-Z assurance evidence, and reconstruct owning outputs from replay-visible predecessor refs.
change_class: realization_refactor
re_entry_point: design
affected_boundary:
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/events/
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
  - build_tenants/abiogenesis/typescript/test_env/tests/
  - .ai-workspace/tickets/completed/T-130-define-recorded-hook-action-typing-model-for-fp-evals.md
  - .ai-workspace/tickets/completed/T-131-declare-gtl-edge-assurance-contract-for-fp-gain-and-close.md
priority: high
build_tenant: typescript
release_scope: post-T-130/T-131 deep runtime proof before downstream test35 carry-across
triaged_at: 2026-05-13T20:14:18+10:00
created_at: 2026-05-13T20:14:18+10:00
updated_at: 2026-05-13T22:15:22+10:00
completed_at: 2026-05-13T22:15:22+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
parent_tickets:
  - .ai-workspace/tickets/completed/T-130-define-recorded-hook-action-typing-model-for-fp-evals.md
  - .ai-workspace/tickets/completed/T-131-declare-gtl-edge-assurance-contract-for-fp-gain-and-close.md
related_downstream:
  - odd_sdlc/.ai-workspace/comments/codex/20260513T035126Z_data_mapper_test35_vs_ts_followup.md
current_evidence:
  - T-130 defines `HookActionRecord`, `HookFindingAdmission`, typed hook classes, and forbidden authority-field rejection. Its remaining residual is full predecessor-only replay across the general hook-action family.
  - T-131 defines `EdgeAssuranceContract`, resolution precedence, F_H absentia, `FpEdgeAssuranceEvalFinding`, `EdgeAssuranceEvaluationProjection`, and `EdgeAssuranceEvaluationReadModel`.
  - T-131 tests prove structural resolution, malformed/duplicate declaration rejection, stable config digest identity, F_H absentia action refs, admitted edge-eval projection, `qualified_defer`, F_P close non-override, and rejection of side-door closure authority.
  - `EnginePluginInput.edgeAssuranceResolution` makes the selected edge assurance contract or F_H absentia disposition visible to runtime plugins.
  - Pre-closure residual: earlier proof was object-level and deterministic-unit oriented, without a runner-consumed, event/replay-derived path from invocation to owning edge assurance output.
  - Pre-closure residual: existing test support had a three-stage GTL module shape, but T-132 needed to give the three edges real SDLC transform semantics rather than generic stage labels.
  - The synthesis -> formalization -> disambiguated-encoding morphism is generic and repeats throughout software development at multiple granularities. T-132 must prove the reusable pattern, not one product-specific lane.
  - `test_env/tests/support/t132-edge-assurance-fixtures.mjs` now defines an ABG-installer-based scenario source that declares the three-edge graph in the installed package surface and exercises runner/plugin/replay truth from inside the installed target.
  - `test_env/tests/test_t132_edge_assurance_installed_sandbox.test.mjs` proves the deterministic installed lane over the three semantic edges, including per-edge hook action/finding/admission, payload-ledger admission, assurance projection, read-model reconstruction, close/retry/qualified-defer next-action basis, composition contribution, and fail-closed negative cases.
  - `test_env/live/test_t132_edge_assurance_installed_live.test.mjs` proves the same installed lane with live Claude F_P eval callouts when `ABG_TS_T132_LIVE=1` or `CODEX_LIVE_FP=1` is set.
  - The `C -> D` hop now emits a concrete `gtl_disambiguated_design_syntax` payload with graph-function/vector binding, formal requirement refs, an explicit construction commitment, no unresolved ambiguity refs, and a close-function ref. The fixture validates that payload deterministically before admitting it as edge-assurance evidence, then lets F_P assurance own the semantic close.
  - `npm run test:t132` passed on 2026-05-13 after the typed design-syntax payload hardening.
  - `ABG_TS_T132_LIVE=1 CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=120000 npm run test:t132:live` passed on 2026-05-13 after the typed design-syntax payload hardening; latest live archive: `build_tenants/abiogenesis/typescript/test_env/test_runs/t132_edge_assurance_installed_live/20260513T120707493Z_pid86797`.
  - `npm run test:t130:t131` passed 20/20 on 2026-05-13.
  - `npm run test:semantic` passed 522/522 on 2026-05-13.
closure_evidence:
  - `npx eslint --max-warnings=0 test_env/tests/support/t132-edge-assurance-fixtures.mjs test_env/tests/test_t132_edge_assurance_installed_sandbox.test.mjs test_env/live/test_t132_edge_assurance_installed_live.test.mjs` passed on 2026-05-13.
  - `npm run test:t132` passed on 2026-05-13.
  - `ABG_TS_T132_LIVE=1 CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=120000 npm run test:t132:live` passed on 2026-05-13 with live archive `build_tenants/abiogenesis/typescript/test_env/test_runs/t132_edge_assurance_installed_live/20260513T120707493Z_pid86797`.
  - `npm run test:t130:t131` passed 20/20 on 2026-05-13.
  - `npm run test:semantic` passed 522/522 on 2026-05-13.
target_truth: A declared GTL edge assurance eval contract is not only a carrier shape. In a runner path over at least a three-edge GTL chain, ABG must pass each edge's resolved assurance contract to the F_P eval boundary, record hook actions, admit or reject returned edge-eval findings, derive edge assurance evaluation projections/read models per edge, compose local edge contributions into an A-to-Z assurance basis, and reconstruct owning outputs from replay-visible predecessor refs without plugin-written closure, ledger, event, projection, or vector-selection authority. The proof chain must model three distinct software-development transforms: information synthesis into requirements, requirements formalization into logical syntax, and design encoding into disambiguated syntax. The design-encoding hop must carry concrete typed syntax rather than a label: an F_D-valid `gtl_disambiguated_design_syntax` payload bound to the GTL graph/vector and source formal requirement authority, with F_P assurance providing the semantic close over that admitted evidence. This chain is a recurring SDLC morphism that can be nested or repeated at different scales wherever informal material is synthesized, formalized, and encoded into a disambiguated construction surface.
closure_law: Close only when deterministic tests prove the edge assurance eval path is consumed through ABG runtime/replay boundaries across a minimum three-edge GTL chain rather than direct object wiring: selected contract -> plugin input -> hook action record -> returned finding -> F_D design-syntax validation where the edge declares a typed encoding payload -> admission -> assurance projection/closure fold -> edge assurance evaluation projection/read model -> next-action basis for each edge, plus compound A-to-Z composition evidence. The proof must include negative cases showing that missing hook records, unrecorded admissions, rejected findings, side-door plugin authority, replay lineage drift, and premature compound close fail closed.
non_closure_conditions:
  - Edge assurance projection remains only a pure object composition test with no runner or replay proof.
  - Hook action records are not represented in replay-visible event or projection truth for the evaluated edge.
  - A plugin output can influence closure, ledger, projection, vector selection, or next action without an admitted hook finding.
  - Predecessor refs are present as labels but the owning output cannot be reconstructed from them.
  - The F_P edge-eval path can bypass `EnginePluginInput.edgeAssuranceResolution`.
  - The proof closes one assured edge while leaving intermediate edges or A-to-Z composition unmeasured.
  - A local edge close is treated as compound traversal close without admitted composition contribution from each required edge.
  - The `C -> D` hop only names disambiguated design syntax but does not emit a concrete typed syntax payload that binds graph/vector, formal requirement authority, construction commitment, ambiguity policy, and close-function refs.
  - Downstream odd_sdlc must still maintain a product-local meta-contract to define edge gain and close because ABG does not expose enough runtime/replay truth.
---

# T-132: Prove Runner-Consumed Edge Assurance Eval Replay

## Consolidation

This ticket absorbs the remaining residuals from T-130 and T-131.

From T-130:

- general predecessor-only replay for hook action -> finding -> admission ->
  owning output,
- proof that the hook-action model is not merely an object-level guard.

From T-131:

- deep runner/replay proof for the edge assurance eval path,
- proof that edge assurance projection is consumed as runtime/replay truth,
- carry-across readiness for downstream test35 parity.

T-130 and T-131 remain the carrier/design slices. T-132 is the runtime/replay
proof slice.

## Required Runtime Chain

The proof must establish this chain over at least three GTL edges. The intended
minimum fixture is semantic, not merely ordinal:

```text
A: source information / product intent / stakeholder material
-> B: synthesized requirements
-> C: requirements in formal logical syntax
-> D: design encoded in disambiguated syntax
```

Each edge in the chain must carry or resolve an edge assurance contract. The
proof cannot use a single assured edge as a proxy for the compound traversal.
It also cannot collapse the formal-requirements step into design or code.

## Required Edge Semantics

The three minimum edges have different gain and close semantics:

| Edge | Transform | Assurance target |
|---|---|---|
| `A -> B` | synthesize relevant information into requirements | requirements are complete against the source information surface and current product intent |
| `B -> C` | transform requirements into formal logical syntax | each requirement has a precise logical formulation with preserved authority and traceability |
| `C -> D` | encode design in disambiguated syntax | design commitments are encoded against the formal requirements without ambiguity or hidden interpretation |

The edge assurance contract for each hop must name its own target outcome,
authority surface, evidence policy, gain report, residual pressure, continuation
basis, and composition contribution. The test fixture may use compact synthetic
refs, but the refs must distinguish the three transforms.

## Repeated SDLC Morphism

This proof is generic. The `A -> B -> C -> D` chain is not a one-off SDLC
example; it is a repeated software-development morphism:

```text
informal / heterogeneous material
-> synthesized outcome surface
-> formal logical or typed formulation
-> disambiguated construction syntax
```

The same pattern can appear at different scales:

- product discovery to requirements,
- requirements to formal obligation surfaces,
- formal obligations to design commitments,
- design commitments to implementation syntax,
- defects or gaps to repair obligations,
- repair obligations to patch design and code.

T-132 must prove the reusable assurance mechanics for this morphism: each edge
has its own gain and close function, and the compound traversal only closes when
the admitted contributions compose.

For each edge, establish:

```text
GraphVector.declarations["abg.edge_assurance_contract"]
-> resolveEdgeAssuranceContract
-> EnginePluginInput.edgeAssuranceResolution
-> F_P eval boundary returns FpEdgeAssuranceEvalFinding
-> HookActionRecord is replay-visible
-> HookFindingAdmission is replay-visible
-> AssuranceProjection + AssuranceClosureDecision are replay-derived
-> EdgeAssuranceEvaluationProjection is replay-derived
-> EdgeAssuranceEvaluationReadModel exposes gain/close/residual/next-action basis
```

For the full chain, establish:

```text
edge_0.compositionContributionRef
edge_1.compositionContributionRef
edge_2.compositionContributionRef
-> compound A-to-Z assurance basis
-> no compound close until each required edge contribution is admitted
```

The owning outputs must be reconstructable from predecessor refs and admitted
runtime facts, not from private runner locals.

## Required Test Shape

- Positive runner path: a declared edge assurance contract is visible in
  `EnginePluginInput` for each edge in a minimum three-edge GTL chain; each eval
  hook returns a constrained finding; ABG records and admits each finding; and
  each edge assurance evaluation projection/read model is derived from
  replay-visible truth.
- Positive semantic chain path: the three edges represent information synthesis,
  formal logical requirement formulation, and disambiguated design encoding.
- Positive genericity path: the proof names this as a reusable SDLC morphism,
  not a product-specific special case.
- Positive compound path: admitted composition contributions from all three
  edges form the A-to-Z assurance basis.
- Positive replay path: reconstruct the hook action -> finding -> admission ->
  owning projection chain from predecessor refs for each edge.
- Negative: closing only the first or terminal edge cannot close the compound
  A-to-Z traversal.
- Negative: missing intermediate edge assurance contribution keeps compound
  closure open or retryable.
- Negative: a returned finding without a recorded hook action fails closed.
- Negative: an admission not listed by the hook action fails closed.
- Negative: rejected findings and unadmitted evidence cannot feed projection.
- Negative: plugin output with closure/ledger/event/projection/vector-selection
  authority fields fails closed.
- Negative: replay lineage drift between hook action, finding, admission,
  selected contract, assurance projection, or closure decision fails closed.
- Negative: missing `EnginePluginInput.edgeAssuranceResolution` prevents the
  edge assurance eval path from claiming closure.

## Downstream Carry-Across Gate

This ticket does not implement odd_sdlc parity itself. It creates the ABG proof
surface needed before odd_sdlc carries test35 behavior across.

After T-132, downstream can bind:

- requirement-authority closure,
- obligation/evidence ledger measurement,
- behavioral fulfillment,
- residual pressure and continuation,
- A-to-Z composition contribution,

to GTL/ABG carriers instead of a product-local meta-contract.

## Acceptance

- [x] Runner proof consumes a declared edge assurance eval contract through
      `EnginePluginInput.edgeAssuranceResolution` for every edge in a minimum
      three-edge GTL chain.
- [x] The chain semantics are explicit: `A -> B` synthesizes requirements from
      source information, `B -> C` formalizes requirements into logical syntax,
      and `C -> D` encodes design into disambiguated syntax.
- [x] The `C -> D` edge emits and deterministically validates a concrete
      `gtl_disambiguated_design_syntax` payload before that payload is admitted
      as evidence for F_P edge assurance.
- [x] The proof preserves the reusable SDLC morphism: synthesis ->
      formalization -> disambiguated construction syntax.
- [x] Hook action, returned finding, admission, and owning projection are
      replay-visible facts per edge, not only direct object wiring.
- [x] Predecessor refs reconstruct hook action -> finding -> admission ->
      owning edge assurance evaluation projection/read model for each edge.
- [x] Positive close, retry, and qualified-defer paths route next-action basis
      through replay-derived projection truth.
- [x] Compound A-to-Z proof uses admitted composition contributions from all
      required edges and rejects premature compound close from a local edge close.
- [x] Negative tests fail closed for missing hook action, unrecorded admission,
      rejected finding, unadmitted evidence, side-door plugin authority fields,
      lineage drift, missing intermediate edge contribution, and premature
      compound close.
- [x] T-130's remaining predecessor-only replay residual is closed or narrowed
      to a separately scoped hook-class family if it cannot be closed here.
- [x] T-131's downstream carry-across residual is explicitly reduced to an
      odd_sdlc integration ticket, with ABG source-scope proof complete.

## Proof Commands

Proof commands:

```bash
cd build_tenants/abiogenesis/typescript
npx eslint --max-warnings=0 test_env/tests/support/t132-edge-assurance-fixtures.mjs test_env/tests/test_t132_edge_assurance_installed_sandbox.test.mjs test_env/live/test_t132_edge_assurance_installed_live.test.mjs
npm run test:t132
ABG_TS_T132_LIVE=1 CODEX_LIVE_FP=1 ABG_TS_LIVE_AGENT=claude ABG_TS_LIVE_TIMEOUT_MS=120000 npm run test:t132:live
npm run test:t130:t131
npm run test:semantic
```
