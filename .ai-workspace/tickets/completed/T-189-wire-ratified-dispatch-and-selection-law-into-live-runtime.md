---
id: T-189
title: Wire ratified instruction-assembly and selection law into the live runtime path
type: requirements_realization
ticket_category: runtime_wiring_remediation
status: completed
goal: >-
  Close the audit-confirmed gaps between ratified GTL/ABG law and the live
  runtime path: make instruction assembly mandatory and fail-closed for every
  F_P dispatch arm, extend the non-tautology dispatch gate to every arm, and
  make registry eligibility a real contract-boundary check that can reject a
  non-conformant candidate. Correct the RC4 release claim so goal narration
  matches ticket truth.
change_intent: >-
  The 2026-07-04 intent/code gap audit (v1 + v2 addendum) verified that the
  instruction-assembly guarantee is opt-in (not_configured falls through both
  dispatch sites), that composed transform.C F_P tasks bypass manifest binding
  and the non-tautology gate, and that runner registry lookup is
  self-confirming (the eligibility request is seeded from the already-selected
  entry, so no candidate can ever be rejected). One requirement loophole
  enables the first gap: REQ-R-ABG3-INSTRUCTION-ASSEMBLY-005 scopes itself to
  dispatch "governed by instruction assembly law", so an unconfigured dispatch
  is arguably ungoverned. The constitutional algebra is otherwise ahead of the
  code; this ticket wires the code up to it.
change_class: requirement_reprice
re_entry_point: abg_dispatch_and_selection_runtime_wiring
owner: abiogenesis
priority: high
triaged_at: 2026-07-05
created_at: 2026-07-05
updated_at: 2026-07-05
governance_scope: STDO Method, SPEC_METHOD, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Instruction Assembly, Registry Selection, Release Claims
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-183-design-and-realize-abg-instruction-assembly-semantic-compiler.md
  - .ai-workspace/tickets/completed/T-177-design-live-abg-runtime-graph-function-registry-lookup.md
source_documents:
  - .ai-workspace/comments/claude/20260704T043810Z_REVIEW_intent_code_gap_audit.md
  - specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md
  - specification/requirements/abg/REQ-R-ABG3-SELECTION-APPLICATION.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md
  - specification/GOALS.md
review_status: passed
proof_status: passed
target_truth: >-
  Every F_P dispatch arm in the live runner resolves through an admitted
  compiled prompt plan, immutable instruction envelope, and replayable prompt
  manifest, with the non-tautology gate applied; absent instruction-assembly
  startup at an F_P boundary resolves to blocked, not to ungoverned dispatch;
  a dispatch-site census test enumerates every arm and proves each one bound;
  registry lookup validates the selected graph function against the admitted
  registry universe plus traversal vector constraints, where absent vector
  constraints mean unconstrained rather than selected-entry-derived; and
  GOALS/release narration claims only what closed tickets prove.
superseded_truth: >-
  Instruction assembly binds only the scalar transform and scalar evaluate
  reductions and only when the caller supplies startup input; not_configured
  falls through to ungoverned dispatch; composed transform.C F_P tasks carry
  no manifest and no non-tautology check; registry eligibility is synthesized
  from the already-selected entry and cannot reject; the RC4 release paragraph
  claims fold gating and strength admission that the active T-188 ticket has
  not yet earned.
closure_law: >-
  Close only when the REQ-005 scoping loophole is repriced, both dispatch call
  sites treat not_configured as blocked, every enumerated F_P dispatch arm is
  manifest-bound and non-tautology-gated with a census test proving it,
  registry lookup rejects a selected candidate excluded by vector constraints
  in a differential proof on the live runner path, the F_P proof-lane migration to startup config is
  complete or explicitly exempted per lane, and the RC4 claim correction has
  landed in GOALS.md.
non_closure_conditions:
  - Any F_P dispatch arm can reach a worker without an admitted prompt
    manifest, including via the not_configured fall-through or any
    unconfigured-startup path.
  - The dispatch-site census is not regime-derived (covering every runner
    site whose resolved computeMeans is F_P), is not enumerated in the ticket
    record, or a covered site is unproven without a typed exemption or a
    named successor.
  - A runtime-property claim in this ticket is discharged by an algebra or
    fixture test instead of a producer-and-consumer proof on the live runner
    path.
  - Registry eligibility still cannot reject a non-conformant candidate, or
    the lookup request is still seeded from the already-selected entry's own
    fields instead of the registry universe plus declared vector constraints.
  - An existing F_P proof lane still dispatches without instruction-assembly
    startup and without a typed, recorded exemption.
  - The fail-closed realization lands before the REQ-005 reprice is ratified
    (code-first drift).
  - The non-tautology dispatch gate is absent on any F_P dispatch arm.
  - GOALS or release narration claims this ticket's target truth before
    closure, or the RC4 paragraph still claims live fold gating, resolved
    strength admission, or runner-consulted classification as shipped.
required_work:
  - >-
    Phase 0 - Release-claim correction: edit the GOALS.md RC4 paragraph to
    claim what RC4 ships (carry-through algebra, admission checks,
    digest-bound coverage refs) and not live fold gating; cite T-188 as
    active for the remainder.
  - >-
    Phase 1 - Requirement reprice: amend -005 or add the next unused clause
    (-017 at time of writing; -013 through -016 are already live registry
    lookup and successor law — verify the next free ID against the live file
    before writing): every F_P dispatch is governed by instruction assembly
    law; absent or unresolved instruction-assembly startup at an F_P boundary
    resolves to blocked. Remove the "governed by" escape. Update the
    requirement family's index/derives surfaces alongside the clause
    (constitutional propagation).
  - >-
    Phase 2 - Fail-closed binding: treat bindInstructionAssemblyForFpEffect
    kind not_configured as blocked at both call sites
    (engine_runner.ts:5927 and :6401 handle only "blocked" today); migrate
    every existing F_P-dispatching proof lane to supply instruction-assembly
    startup, or record a typed exemption per lane. The migration is the bulk
    of this phase; instructionAssemblyStartup is optional on the engine
    request (engine_runner.ts:283/:321) and every current caller relies on
    that.
  - >-
    Phase 3 - All-arms binding: route composed transform.C tasks whose
    computeMeans is F_P through the same bindInstructionAssemblyForFpEffect
    helper (per-task, computeStageRole transform) before batch dispatch; the
    non-tautology envelope gate rides along to every arm. Add the
    dispatch-site census test with a REGIME-DERIVED census definition: the
    census covers every EnginePluginInput/effect construction site in the
    runner whose resolved computeMeans/regime is F_P — including the scalar
    transform and scalar evaluate reductions, composed_stage_task_batch_run
    for BOTH transform and consequence stage roles, and
    evaluation_rule_batch_evaluate — not a hand-named arm list. Each covered
    site is proven manifest-bound and non-tautology-gated, or carries a
    typed recorded exemption (e.g. a site constitutionally constrained to
    F_D). A newly added F_P-capable site fails the census by construction.
  - >-
    Phase 4 - Boundary-true registry lookup: treat admitted runtime registry
    entries as the candidate universe. A traversal vector may constrain the
    allowable universe by candidate identity, interface, source/target
    contract, context, authority, overlay, namespace, version, provenance,
    readiness, proof, or policy refs. If a vector declares no constraint for a
    field, that field is unconstrained; the runner shall not fill it from the
    already-selected entry. Add live-runner differentials proving both sides:
    no vector constraints allow the selected registered graph function, and a
    vector candidate allow-list or contract constraint can reject the selected
    graph function before invocation.
  - >-
    Phase 5 - Proof and record: create the test:t189 npm script owning the
    regime-derived arm census and the live-path registry rejection
    differential (the script does not exist yet; creating it is closure
    work); run the census, differential, regression, and semantic gates;
    record per-site census results in the execution record; open successor
    tickets for anything deferred rather than closing over it.
acceptance_criteria:
  - REQ-R-ABG3-INSTRUCTION-ASSEMBLY states that every F_P dispatch is
    governed and that absent startup resolves to blocked; no "governed by"
    scoping escape remains.
  - Both dispatch call sites terminate on not_configured; no F_P transition
    is yielded with an unbound envelope.
  - The test:t189 script exists and owns the regime-derived dispatch-site
    census plus the live-path registry rejection differential.
  - The census covers every runner site whose resolved computeMeans is F_P
    (scalar transform, scalar evaluate, composed transform tasks, composed
    consequence tasks, evaluation-rule batches, and any newly added site)
    and proves manifest binding and non-tautology on each, or records a
    typed exemption for sites constitutionally constrained away from F_P.
  - Composed transform.C F_P tasks dispatch with admitted manifests; a
    mutation removing the manifest fails the census.
  - Registry lookup rejects a vector-excluded or non-conformant selected
    candidate in a live-path differential; eligibility is computed from the
    admitted registry universe plus vector constraints, not selected-entry
    fallback fields.
  - All F_P proof lanes supply startup config or carry a typed exemption
    recorded in the execution record.
  - The GOALS.md RC4 paragraph matches shipped truth and cites T-188 as the
    active carrier for fold gating.
notes:
  - Scope boundary - this ticket does NOT carry the carry-through consumption
    wiring (M5 output admission, B2 coverage producer/threading, M3 strength
    ledger resolution, B3 engine-driven live lane, M7 diagram reconcile).
    Those are T-188's open closure gates and remain owned there. This ticket
    covers audit findings B1, M1, M2, M4 plus the R1 requirement reprice and
    R3 release-claim correction.
  - Finding anchors (audit post v2, file:line verified 2026-07-05) -
    B1 engine_runner.ts:853 not_configured return, :5927/:6401 blocked-only
    checks; M1/M2 bindInstructionAssemblyForFpEffect has exactly two call
    sites (scalar transform, scalar evaluate); M4
    registryEntryForExecutionBasis engine_runner.ts:3812 seeds the request
    from the selected entry at :3837.
  - Gate instantiation, precisely - four of the five standing gates from the
    audit addendum (wiring-proof, arm-census, fail-closed-default,
    release-claim) are instantiated as this ticket's non_closure_conditions,
    plus one ticket-specific migration-completeness condition.
    Constitutional-propagation applies to Phase 1's ratified clause and is
    carried inside the Phase 1 work item. Ratifying the gate set as reusable
    ticket law (TICKET_METHOD vs ABI-local template) is a separate decision
    outside this ticket's scope; this note does not mint a different gate
    set.
proof_commands:
  - git diff --check
  - rg -n "An F_P dispatch shall not occur|Every F_P dispatch is governed|Absent, unresolved, unadmitted, or non-matching instruction-assembly startup|shall resolve to blocked" specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md
  - rg -n "admitted registry entries as the candidate universe|absent vector or edge constraint shall mean that field is unconstrained|shall not fill an absent constraint from the already-selected candidate" specification/requirements/abg/REQ-R-ABG3-SELECTION-APPLICATION.md
  - npm run test:t189 --prefix build_tenants/abiogenesis/typescript
  - npm run test:t183 --prefix build_tenants/abiogenesis/typescript
  - npm run test:t177 --prefix build_tenants/abiogenesis/typescript
  - npm run test:t188 --prefix build_tenants/abiogenesis/typescript
  - npm run test:semantic --prefix build_tenants/abiogenesis/typescript
  - "diagnostic only, not closure proof: rg -n 'not_configured' build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts"
  - "diagnostic only, not closure proof: rg -c 'bindInstructionAssemblyForFpEffect\\(' build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts"
---

# T-189: Wire Ratified Dispatch And Selection Law Into The Live Runtime

The 2026-07-04 audit's finding, condensed: the algebra is ratified and correct;
the wiring is opt-in, one-armed, or self-confirming. This ticket is the
remediation wave for the findings NOT owned by T-188.

## Finding-to-phase map

| Audit finding | Class | Phase | Requirement authority |
| --- | --- | --- | --- |
| RC4 claim races active T-188 (v2 A3) | release-claim | 0 | GOALS truthfulness / release framing |
| B1 not_configured falls through | requirement loophole + code | 1, 2 | REQ-...-INSTRUCTION-ASSEMBLY-005/-008 + new clause (-017 at time of writing) |
| M1 composed transform F_P bypass | proven_one_arm | 3 | REQ-...-INSTRUCTION-ASSEMBLY-005 |
| M2 non-tautology on 2 of N arms | proven_one_arm | 3 | REQ-...-INSTRUCTION-ASSEMBLY-011 |
| M4 self-confirming registry lookup | presence_not_differential | 4 | REQ-R-ABG3-SELECTION-APPLICATION-001 |

Eight of nine open audit findings need zero requirement work — the clauses
already command the fixes. The single reprice here (Phase 1) closes the one
loophole that made opt-in dispatch technically lawful.

## Sequencing law

Phase 0 lands immediately (one paragraph, no dependencies). Phase 1 lands
before Phase 2 (no code-first). Phases 2 and 3 share the census test and land
together or in that order. Phase 4 is independent and may proceed in parallel.
T-188's own gates (output admission, coverage producer and threading, strength
ledger resolution, engine-driven live lane) are prerequisite to any successor
release claiming requirement-proof carry-through; they are not this ticket's
scope and this ticket must not be cited as delivering them.

## Why the migration is the bulk

Making instruction assembly mandatory flips every existing caller:
`instructionAssemblyStartup` is optional on the engine request and every
current F_P proof lane relies on that default. The census will enumerate the
lanes; each one gains startup config or a typed exemption with a recorded
reason. Opt-in was the path of least migration — that is exactly how the gap
survived T-183's closure — so the migration ledger is the honest cost of
closing it.

## Execution Record

- 2026-07-05: Ticket created as active from the audit v2 work plan
  (`.ai-workspace/comments/claude/20260704T043810Z_REVIEW_intent_code_gap_audit.md`
  §A7). No phases executed yet.
- 2026-07-05: Pre-implementation review repairs (codex findings, verified
  against code before applying): (1) clause-ID collision fixed — -013..-016
  already live (-013 is registry lookup law); Phase 1 now targets -017 or an
  -005 amendment with an ID-agnostic proof grep on the fail-closed text;
  (2) census redefined as REGIME-DERIVED over every runner site whose
  resolved computeMeans is F_P (composed consequence tasks and
  evaluation-rule batches included — 41 computeMeans resolution points exist
  in the runner; hand-named arm lists are fragile), typed exemptions for
  F_D-constrained sites; (3) creating test:t189 is now explicit Phase 5
  closure work (script does not exist yet); (4) presence/count greps
  demoted to labeled diagnostics — closure proofs are the census and the
  registry rejection differential; (5) gate-instantiation note corrected:
  four gates instantiated + ticket-specific migration-completeness;
  constitutional-propagation carried inside Phase 1.
- 2026-07-05: Phase 0 and Phase 1 implemented. `GOALS.md` no longer claims
  RC4 ships live T-188 fold/depth gates; it states RC4 ships the first
  carrier/admission algebra and keeps T-188 active for live fold gating,
  strength resolution, producer threading, and requirement-pressure
  consumption. `REQ-R-ABG3-INSTRUCTION-ASSEMBLY-017` ratifies that every
  F_P dispatch is governed by instruction assembly and absent/unresolved
  startup blocks before worker/plugin/evaluator/closure paths.
- 2026-07-05: Phases 2 and 3 implemented. The runner now treats
  `not_configured` as blocked at scalar F_P dispatch/evaluate sites, binds
  composed transform/consequence F_P task batches, and binds evaluation-rule
  F_P batches through admitted prompt manifests before plugin invocation.
  The migrated shared M03/M04/M05 proof lanes now supply instruction startup
  through admitted config instead of relying on the old optional default.
- 2026-07-05: Phase 4 implemented. Runtime registry lookup now derives its
  eligibility boundary from the traversal edge declaration when present; the
  T-189 differential proves a declared non-conformant selected candidate is
  rejected on the live runner path before invocation.
- 2026-07-05: Added ABG production helper
  `constructDefaultInstructionAssemblyStartupForBasis(...)` so installed
  contexts and proof scripts export startup data from admitted basis truth
  instead of reconstructing local prompt/registry surfaces. Updated the
  installer runtime binding and installed proof templates to use this helper.
- 2026-07-05: Proofs run and passed:
  `npm run test:t189` (3/3), `npm run test:t183` (16/16),
  `npm run test:t188` (20/20), `npm run test:t177` (16/16),
  `npm run test:semantic` (1037/1037), and `git diff --check`.
  Focused migration regressions included T-107/T-116/T-128/T-132/T-144 and
  M04/M05 installed public-start paths.
- 2026-07-05: Post-review remediation reopened proof status to partial and
  tightened Phase 3/4. `test:t189` now includes a source-derived runner
  dispatch census over the seven `bindInstructionAssemblyForFpEffect` sites,
  ten `resolvedRegime === "F_P"` branches, and both F_P yield sites. Runtime
  registry lookup now treats the admitted registry as the universe and vector
  declarations as optional constraints; absent constraints no longer fall back
  to the selected entry. Added a vector candidate allow-list rejection proof
  alongside the declared target-contract mismatch proof. Focused reruns passed:
  `npm run test:t189` (5/5) and `npm run test:t177` (16/16). Full semantic
  rerun still pending for this remediation.
- 2026-07-05: Post-review remediation proof completed. `git diff --check`
  passed, the instruction-assembly and selection-law proof greps passed,
  `npm run test:t183` (16/16), `npm run test:t188` (20/20),
  `npm run test:t177` (16/16), `npm run test:t189` (5/5), and
  `npm run test:semantic` (1039/1039) all passed. Proof status restored to
  passed after the full rerun.
- 2026-07-05: Ticket closed for the RC5 release source cut. Closure rests on
  ratified instruction-assembly law, ratified registry universe plus
  vector-constraint selection law, runner fail-closed wiring across F_P sites,
  the source-derived dispatch census, vector constraint differentials, and the
  full semantic rerun recorded above.
