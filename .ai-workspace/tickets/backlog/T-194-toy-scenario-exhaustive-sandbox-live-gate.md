---
id: T-194
title: Toy-scenario exhaustive installed-sandbox live gate (rc.7 release gate)
type: proof_realization
ticket_category: release_gate_live_proof
status: backlog
goal: >-
  Create a toy GTL scenario proven exhaustively live from a
  snapshot-installed sandbox: real installer, real installed package, the
  PUBLIC start path, a real LLM worker, and the full T-188 carry-through
  chain (requirement declarations + carry-through startup as PRODUCT data)
  asserted from emitted replay events — closeable branch eligible+satisfied
  AND depth-shallow branch residual+no_close_preserved. This lane is the
  rc.7 release gate and discharges the review's question A (the T-188 live
  proof ran over a harness basis, not an installed sandbox).
change_class: realization_refactor
re_entry_point: installed_sandbox_carry_through_live_gate
owner: abiogenesis
priority: high
created_at: 2026-07-05
updated_at: 2026-07-05
governance_scope: RELEASE_METHOD, T-188 closure record, T-184 canonical lane
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-188-realize-requirement-proof-carry-through.md
  - .ai-workspace/tickets/completed/T-184-consolidate-canonical-installed-live-hello-world-proof.md
source_documents:
  - test_env/sandbox/test_t180_glc_hello_world_bootstrap_live.test.mjs
review_status: pending
proof_status: pending
target_truth: >-
  A digest-pinned sandbox live artifact proves the carry-through chain on
  the installed public path; rc.7 cites this artifact; no RC after rc.6
  claims carry-through without it.
non_closure_conditions:
  - The lane hand-calls admission, coverage, or fold (engine-emitted events
    only, parsed from the sandbox run's JSON lines).
  - The lane bypasses the installer or the public start path (direct
    runEngineIterate inside the test process is the harness lane's job, not
    this one's).
  - Requirement/carry-through declarations enter as test fixtures instead
    of product data consumed by the installed startup.
  - The shallow no-close branch is omitted (a closeable-only proof is
    presence, not differential).
required_work:
  - "SPLICE MAP (verified against the tree 2026-07-05): copy test_env/sandbox/test_t180_glc_hello_world_bootstrap_live.test.mjs to test_t194_carry_through_sandbox_live.test.mjs and modify: (1) productDeclarations block (:490) gains the toy scenario's requirement route bundle declarations; (2) the generated runtimeBindingSource (:995-1015 region) gains requirementRouteDeclarationBundle + requirementProofCarryThroughStartup on the engine start call, entries built from product-declared contract/table/template with the worker's execution evidence ref as strength; (3) the generated script emits the requirement_proof_carry_through_admitted and requirement_fold_projected events as JSON lines; (4) the test parses (parseJsonLines) and asserts BOTH branches: full-depth -> carry eligible + fold satisfied; depth-shallow -> carry residual (missing_depth_obligation_class) + fold no_close_preserved; (5) new npm script test:t194:sandbox-live, env-gated like the t180 lane; (6) record the artifact digest in the ticket and cite it in the rc.7 release note."
  - "Gate wiring: rc.7 cut requires this lane green (release-claim gate: the note cites the artifact digest)."
acceptance_criteria:
  - Both branches proven from the snapshot-installed sandbox via the public
    start path with a real LLM worker; artifact digest recorded.
  - T-188 closure record updated to cite this lane as the installed-sandbox
    discharge of review question A.
notes:
  - This is also the release-vector seed in miniature (four-recursions
    resolution 2) - the RC gate becomes an admitted proof artifact, not
    prose.
---

# T-194: Toy-Scenario Exhaustive Sandbox Live Gate

The toy scenario is the smallest program that exercises the full carry-
through chain in a real install: declared requirements, product-declared
carry-through startup, public start, real worker, engine-emitted coverage
and fold truth, both branches differentially.

## Build Scout Record (2026-07-05 — splice anchors verified, build-ready)

- The generated runtime-binding source builds ONE config object consumed by
  the installed runtime-binding convention (.abiogenesis/
  typescript-runtime.mjs): `runtimeRegistryStartup`,
  `instructionAssemblyStartup`, runId/workKey, `createPlugins` (whose
  fpDispatch already dispatches the real worker with ONLY
  instructionPromptManifest.renderedPrompt and asserts manifest-rendered
  bound refs + prior-artifact carry).
- T-194 deltas on the copy: add `requirementRouteDeclarationBundle` +
  `requirementProofCarryThroughStartup` to that binding object (product
  data), with strength refs declared in the artifact's assessment
  evidence_refs (the accepted-payload path admits them as typed evidence —
  the exact chain proven in the T-188 live lane).
- FIRST BUILD STEP (potential gap the lane exists to catch): verify the
  PUBLICSTART ADAPTER forwards requirementProofCarryThroughStartup +
  requirementRouteDeclarationBundle down to runEngineStart —
  runEngineStart/Async forwarding was fixed (T-188 slice 5), but the
  adapter layer above it (publicStart / installed cli-runtime binding
  consumption) has not been checked. If it drops either family, that is a
  P1-b-shaped finding on the public path and the first fix of this lane.
- Assertions: parse the sandbox run's emitted JSON lines for
  requirement_proof_carry_through_admitted (statuses/issueKinds) and
  requirement_fold_projected (fold.state), both branches.

## Feature-Proof Matrix (2026-07-05 — scope widened: prove ALL features from the T-188/T-189/T-191 waves in one sandbox)

One snapshot-installed sandbox, one toy scenario, a matrix of sub-runs.
Sub-runs (a)-(b) use the real LLM worker; (c)-(e) are engine/compiler
negatives inside the same installed instance (no worker cost).

| # | Feature (wave) | Proof in the toy scenario |
| --- | --- | --- |
| a1 | Registry startup/selection + node types (T-180, inherited) | lane already asserts selected entry + typed composition |
| a2 | Instruction manifests + non-tautology + causal carry (T-183/T-189) | lane already asserts renderedPrompt bound refs + prior_artifact slot; ADD: assert manifest carries no answer-shaped content for the toy edge |
| a3 | Carry-through eligible chain (T-188) | full-depth branch: carry event accepted+eligible, typed strength via assessment evidence_refs, fold satisfied |
| b | Uncovered shall not close (T-188 B3) | depth-shallow branch: carry residual + missing_depth_obligation_class + fold no_close_preserved |
| c1 | REQ-017 fail-closed (T-189) | sub-run WITHOUT instructionAssemblyStartup in the binding: engine blocks (gap_stop, no fp_dispatch_requested) — asserted from emitted events |
| c2 | Registry boundary rejection (T-189/RC5) | toy vector declares runtime_registry_candidate_refs excluding a decoy product entry: decoy enumerated-and-rejected with replay-visible selection truth |
| c3 | Rejected-payload no-emission (T-188 slice 5) | sub-run whose worker artifact omits fulfillment payload: NO carry-through event emitted (ordering gate) |
| d1 | Diagnostic identity + repair affordances (T-191 P1) | installed typecheckGtlProgram over the toy program: every issue carries a ratified ID; mapped issues carry populated repairs; unknown-ID constructor rejection asserted via installed assertRatifiedGtlProgramDiagnosticId |
| d2 | Declaration-source witness law (T-191 P2) | toy program declares declarationSourceRows: canonical_data+digest clean; module_export without digest -> module-export-round-trip diagnostic with align_digest_or_version repair |
| d3 | Golden instances (T-191 P3) | binding with instances + digest clean; digest-empty -> golden-instance-digest-required |
| d4 | Declared latitude (T-191 P4) | F_P owner route clean; F_D route -> underdetermined-owner-route-field fail-closed |
| d5 | Canonical identity coverage (T-191 review fix) | two typechecks differing only in a witness row -> different inventoryDigest + reportRef |
| e | Corpus-style exact replay (T-191 P5) | the toy program's expected diagnostic-ID set recorded in the artifact and replayed exactly by a second typecheck |

Artifact: one digest-pinned summary JSON recording every sub-run verdict —
the rc.7 note cites this single digest. Worker cost: 2 live dispatches
(a-branch + b-branch); everything else engine/compiler-level inside the
installed sandbox.

## Build Step 1 COMPLETE (2026-07-05) — public-path forwarding gap found and fixed

As predicted by the scout: the m04 adapter chain (StartContext +
publicCallableStart at BOTH start.ts sites) declared and forwarded only
runtimeRegistryStartup + instructionAssemblyStartup — it silently dropped
requirementProofCarryThroughStartup AND requirementRouteDeclarationBundle.
The P1-b defect class, one layer above the engine (engine-level forwarding
was fixed in the T-188 wave; the adapter was not). Fixed: both fields on
StartContext, forwarded at both sites. build clean; test:semantic
1059/1059. The T-194 lane will prove the forwarding live from the
installed sandbox (matrix rows a3/b depend on it).

## Row a3 EARNED (2026-07-05) — five defects found by the lane before first green

test:t194:sandbox-live 1/1: snapshot-installed sandbox, installed CLI
genesis-ts start, product-declared requirement bundle + carry-through
startup in the runtime binding, two real LLM worker dispatches, run
CONVERGED with 2 accepted+eligible carry-through admissions on
REQ-T194-001 (typed strength via the product-declared execution-evidence
ref, zero issue kinds) and requirement fold state "satisfied" — all read
from the instance's events.jsonl, no hand-called truth anywhere.

DEFECTS FOUND AND FIXED BY THIS LANE (each invisible to unit lanes):
1. m04 adapter (StartContext + both start.ts sites) dropped
   requirementProofCarryThroughStartup + requirementRouteDeclarationBundle.
2. Canonical-lane generated plans lacked proof-depth truth — T-188's
   depth_policy_incomplete gate correctly rejects them; the canonical
   release lane had been un-runnable since the T-188 wave (rc.6's live
   artifact was inherited from rc.3, hiding it).
3. Canonical-lane startup compiled no evaluate-stage plans — T-189's
   fail-closed law correctly gap-stops; second latent canonical regression.
4. CLI binding parser (interface + hasOwnField allowlist + spread) — a
   third independent seam dropping the same two fields.
5. Inherited manifest-count expectation (2) was stale: 4 manifests =
   transform + evaluate per vector = the T-189 all-arms law visibly
   working in the installed sandbox; expectation repriced in both lanes.
PATTERN (for T-193): every public seam is an independent allowlist; each
is a fresh declared_not_wired opportunity. A conformance row should assert
EngineStartRequest fields are parseable+forwardable at every seam or
carry a typed exemption.

Canonical-lane repairs (defects 2/3/5) applied to the t180 lane in the
same wave. Gates: test:semantic 1059/1059; test:t188 26/26.
Remaining matrix rows: b (stub-worker shallow/no-close), c1-c3, d1-d5, e.
- Canonical-lane verification (2026-07-05): test:hello-world:live 1/1 GREEN after the three repairs — the pre-existing release gate is restored; rc.7 may cite both lanes.

## Row b EARNED (2026-07-05) — uncovered shall not close, installed public path

test:t194:sandbox-live 1/1 with BOTH branches: instance-b (second install
from the same snapshot) runs a deterministic stub worker (zero live cost)
with carryDepthClassRefs ["positive"] only — carry admissions classify
RESIDUAL with missing_depth_obligation_class, requirement folds project
no_close_preserved, and ZERO satisfied folds exist for the shallow branch.
Combined with row a3 (eligible -> satisfied, live workers), both halves of
the T-188 depth guarantee are proven from the installed CLI public path
with product-declared truth. Harness lessons recorded: replicate the
canonical CLI invocation verbatim (--scope/--target/--until); guard
sub-run exit statuses explicitly ([0,4] = converge-or-block, anything
else fails loudly).
- Rows c1+c3 EARNED (2026-07-05, green first run): c1 fail-closed (no instruction startup -> exit 4 + gap_stop + zero dispatch + zero carry truth); c3 ordering gate (assessment-less stub artifact -> dispatch happens, payload admission rejects, ZERO carry admissions, no satisfied fold). runNegativeRow helper added (per-row instance, ~15 lines per future negative). Live cost unchanged (2 dispatches).
- Rows d1-d5 + e EARNED (2026-07-05, green first run): T-191 compiler surface proven FROM THE INSTALLED ARTIFACT — ratified identities + repairs on live issues, unratified-ID rejection, declaration-source witness law (flag + clean), golden-instance digest law, underdetermined owner-route fail-closed, inventory-digest identity coverage, and exact issue-set/digest replay (corpus semantics). The installed product carries the law, not just the source tree.

## Matrix Status (2026-07-05): 12/13 rows EARNED; c2 splice plan recorded

EARNED in test:t194:sandbox-live (1/1 green, 2 live dispatches total):
a1/a2 (inherited, incl. manifests=4 all-arms), a3 (eligible->satisfied,
live), b (shallow->residual->no_close, stub), c1 (fail-closed, no
dispatch), c3 (rejected payload mints nothing), d1-d5 + e (installed
T-191 compiler surface + exact replay).

REMAINING: c2 registry boundary rejection. MECHANISM VERIFIED: vector
declaration key `runtime_registry_candidate_refs` constrains candidate
identity refs (engine_runner reads it via graphVectorDeclarationStringList
at the registry lookup); rejections are replay-visible as
`registry_entry_rejected` events. SPLICE PLAN: binding option
`registryDecoy: true` -> (1) generated source appends one decoy entry to
the product registry startup config (clone a node_type entry with a decoy
identity ref), (2) the toy vector's declarations gain
runtime_registry_candidate_refs listing only the lawful refs, (3)
runNegativeRow("c2", {registryDecoy: true, stubDispatch: true}) asserts:
decoy enumerated (registry_entry_admitted) AND registry_entry_rejected
present for it AND selections exclude the decoy AND run still converges.
c2 is installed-path confirmation of law already unit-proven in the T-189
wave — hardening, not an rc.7 gate.

## c2 Law Findings (2026-07-05, discovered while earning the row)

1. `runtime_registry_candidate_refs` is a VECTOR-SCOPED whitelist governing
   ALL registry lookups on that vector (node types included), not a
   graph-function-only filter. A partial list starves infrastructure
   lookups and blocks the run. Documented in the lane comment.
2. Declarations are a typed SerializedAttrs carrier ({entries:[{key,
   value:{kind:"string_list",...}}]}); plain record keys spread into
   `declarations` are SILENTLY IGNORED — an undeclared-hole class for
   T-191 (a conformance row should flag unknown plain keys).
3. FAIL-CLOSED CONFIRMED with constraint: selector picks the decoy,
   eligibility rejects it (selected_candidate_not_eligible), run gap-stops
   with graph_function_selection_rejected naming the decoy — replay-visible
   selection truth, zero dispatch, zero coverage minted. Row c2 asserts
   this exact law.
4. OPEN LAW QUESTION (for external review): WITHOUT a constraint, two
   same-interface candidates yielded a SILENT PICK (decoy selected, run
   proceeded) — GOAL-005 says ambiguity fails closed. Either a lawful
   deterministic tie-break exists (locate and cite it) or unconstrained
   same-interface duplicates are a fail-open gap needing a ticket.

## MATRIX COMPLETE (2026-07-05): 13/13 rows EARNED — test:t194:sandbox-live 1/1

Row c2 earned on the fail-closed law: decoy enumerated (2 graph-function
admissions), selection rejection replay-visible
(selected_candidate_not_eligible naming the decoy), zero dispatch, zero
coverage truth, gap_stop terminal carrying the rejection reason. The
"must converge" expectation was repriced to actual law — the boundary
halts the machine rather than routing around a rival candidate.

Full matrix: a1/a2 (registry+composition+all-arms manifests), a3
(eligible->satisfied, live workers), b (shallow->residual->no_close),
c1 (fail-closed dispatch), c2 (registry boundary fail-closed), c3
(rejected-payload no-emission), d1-d5 (installed T-191 compiler surface),
e (exact replay). One lane, one run, 2 live dispatches, 6 sub-instances.
Seven defects found and fixed on the way (3 forwarding seams, 2 canonical
regressions, 1 stale expectation, 1 typed-carrier silent-ignore) + 1 open
law question (unconstrained same-interface tie-break) handed to review.
This lane is the standing rc.7 exhaustive live gate. test:semantic
1059/1059 unchanged.

## DMM Self-Review Fix Wave COMPLETE (2026-07-05) — all seven findings closed

- F1 seam sprawl: EngineStartPassthroughFields + KEYS + helper = ONE
  authority; m04 StartContext and CLI RuntimeBinding extend it; both
  start.ts spreads, both engine delegations, and the CLI parse loop
  consume it (19 hand-listed mentions -> 1 place to add a field).
- F2/F4 builder duplication + untyped template DSL: ONE shared
  glc-binding-source.mjs under sandbox/support with a TYPED variant
  surface (unknown option keys throw — the validator caught its own first
  caller bug: workspaceRoot leaking into source options). t180 1335->412
  lines, t194 1854->706, zero inline builders; canonical repairs now land
  once.
- F3 inline producer: deriveRequirementProofCarryThroughAdmittedEvents
  extracted to contracts (requirement_proof_carry_through_producer); the
  runner keeps only the accepted-payload gate position and emission.
- F5 registry ambiguity FIXED (adjudicated fail-open at the runner): no
  pre-picked candidate on duplicate basis matches; the pick law decides.
  Matrix repriced: c2a constrained -> boundary lawfully RESOLVES
  (converge, decoy never selected, eligible carry-through intact); c2b
  unconstrained -> fail closed (no_selected_candidate, replay-visible,
  zero dispatch, zero minting). Contracts differentials added.
- F6 declarations ingress: admitSerializedAttrs fails closed on unknown
  sibling keys (differential added; semantic proves no lawful caller
  relied on the hole).
- F7: row b on runNegativeRow; stringly probes -> field assertions
  (entryRef/selectedEntryRef); retention policy NAMED per DMM §6C:
  test_runs/ sub-instances accumulate per run and are cleaned manually —
  acceptable for a proof lane, revisit if disk pressure appears.
- Gates: t194 matrix 1/1 GREEN (14 rows incl. c2a/c2b); canonical
  hello-world live 1/1 GREEN on the shared builder; test:semantic
  1062/1062 (includes 3 new differentials).
