---
id: T-205
title: HoG iteration 2 — the standard worker plugin lifts into the substrate
status: completed
class: design_reframe
opened: 2026-07-06
depends: T-200 (SATISFIED — closed 2026-07-06; the interpretation seam landed here at B2)
requirements: REQ-R-ABG3-CCALL-014/-017 (programs/ladders consumed); REQ-R-ABG3-HANDLERS-001/-014 (B1 handler-law authority)
acceptance: THE INTERNAL-EVERYTHING GATE first — ABG's own sandbox lanes prove catalogs/ladders/resume/re-entry/handlers with a real worker and -012 green, BEFORE any glc step; 4.5.0-rc.1 cuts on that gate. Then: a product on the standard F_P path ships ZERO plugin code —
  declarations only (catalog + selections + response contracts +
  materialization specs + calibration); the odd_glc data-mapper runs on
  the substrate's standard worker plugin with its binding reduced to
  declarations; -012 audit green on the result.
progress: B1 AUTHORED (REQ-R-ABG3-HANDLERS-001..-014, codex review requested). B-PREP PINNED (engine differentials, review-independent): re-entry continues from the frontier, closed C calls stay closed, FRESH ATTEMPT WINDOW after exhaustion is engine law (fixed worker re-attempts and converges), cCallRefs unique across resume, combined replay enclosure-clean — the odd_glc resume flag is pure scaffolding, no new engine law.
---

# T-205: The Plugin Lift

## Problem

The last downstream-encoded piece is THE PLUGIN: odd_glc's generated
binding hand-implements the F_P worker loop — transport invocation,
manifest→prompt consumption, response parsing, file materialization,
post-validation execution, evidence archiving, evaluator prompting.
Under the algebra these are GENERIC F_P/F_D mechanics (the substrate
already owns runAgentTransport, manifests, payload admission, the
attached-worker path); only the DOMAIN DATA is lawfully downstream.
Downstream plugin code is where campaign bugs #1/#3b/#4/#5/#9/#10/#11
all lived — every one a generic-mechanics defect encoded downstream.

## Target

`standardFpWorkerPlugin(declarations)` — substrate-owned, configured
entirely by admitted declarations:
- transport: the known-agent contract + env ingress (exists);
- prompt: the rendered manifest (exists) + per-stage
  instructionCategoryRefs (-016 prompt-level tuning);
- response: declared response contracts (JSON schemas are already
  scenario data);
- materialization + post-validation: declared file specs and execution
  plans run as F_D interiors (the deterministic machinery exists);
- evidence/archives: engine-owned, spine-enclosed (-006/-012).
Downstream keeps: domain declarations ONLY (catalogs, selections,
contracts, calibration/latitude). The plugin SEAM remains for exotic
fibres; the standard path needs no code.

## The factoring (user, ratification-grade): category vs functor

A plugin is TWO things, and only one of them is code:
- its CATEGORY — the declared composition: program/catalog/ladder,
  stage roles, contracts, response shapes, evidence classes, budgets.
  This is GTL structure (-014..-017) — the work already done. It is
  data, admitted fail-closed, drift-witnessed, tunable.
- its FUNCTOR — the effect handler: the mapping from a declared leaf
  morphism to the world. Invoke a transport; spawn a process; write
  files; await a human. Small, effectful, irreducible.
The substrate ships STANDARD HANDLERS per effect signature (F_P
agent-transport, F_D process-execution, F_D materialization, F_H
human-gate); the census binds armId → handler ref + declared config.
Custom handlers remain the plugin seam. "Plugin" stops meaning
"downstream program" and starts meaning "handler binding".

## Handler classes (user extension: the capability outcall)

Two handler classes realize a leaf, same obligations, different depth:
- PIPELINE HANDLERS (standard, substrate-shipped): realize the
  CONSTRUCTED F_P/F_D interior — manifest render → transport → payload
  admission (or plan execution). The substrate composes the interior;
  the handler runs its steps.
- CAPABILITY HANDLERS (complete replacement): ONE plugin replaces the
  entire constructed interior — a complete outcall into a local
  downstream capability (installed product, local service, library,
  in-proc engine). No manifest, no agent transport; the capability IS
  the worker. The C call's category position is unchanged: spine,
  selection (the capability declares its regime), judgment, budgets,
  evidence (capability invocation refs) — O1–O8 hold in full, O3
  especially (the outcall's effects must be evidenced, not asserted).

This completes the BOUNDARY SPECTRUM per call, cheapest to deepest:
inline instruction category (-015) < reified stage (-014) < capability
outcall (opaque leaf, this class) < workflow.C sub-traversal
(transparent, -013). Products place each obligation at the depth its
trust and cost deserve — all four rungs declared data.

## Handler obligations (P0 requirements family, O1–O8)

O1 ARM FIDELITY: realize exactly the census-bound arm; nothing else.
O2 INTERIORS ONLY: return interior results; never mint spine or truth
   (enforced: engine-owned spine, kind-restricted sink).
O3 EVIDENCE HONESTY: outcome status and evidence refs correspond to
   real effects — archives ≡ refs, audited by -012 per configuration.
O4 TOOL EMERGENCE: tool knowledge stays inside declared handler config
   (T-030 boundary law holds AT the handler).
O5 DECLARED CONFIG ONLY: parameters come from admitted declarations
   (transport contract, env ingress, plans); no ambient authority.
O6 TYPED FAILURE: a throw IS a contract_failure blocked outcome
   (P4 executor guards make breach lawful truth).
O7 IDEMPOTENT EVIDENCE: archives keyed by cCallRef; resume-safe.
O8 BUDGET RESPECT: timeout/attempt envelopes from the selected
   configuration's ladder; overrun is a typed judgment, never a hang.

## Boundary vs T-200

T-200 closes on delegation + erase + gate (envelope law realized).
T-205 consumes that seam: catalog/selection interpretation and the
standard plugin ride the SAME resolveCCall integration point — one
seam, two tickets, T-200's oracle-equality proof first.

## Adaptive selection (-017, in scope)

The catalog is not statically bound: edge-classes declare selection
LADDERS (ordered configs + predicates over replay signals); the router
escalates the program on retry (compression descent) and toward F_H on
repeated failure. P0 realizes programRef on c_call_fibre_selected
(carrier + closed keys + all emission sites + differentials) so every
call records its governing configuration; ladder interpretation lands
with step-2 integration; per-configuration -012 cost reporting feeds
the offline tuner (§13.1 boundary holds).

## B1 review surface (handler law before code)

Authority now lives in `REQ-R-ABG3-HANDLERS-001/-014`:

- `-001/-002` O1/O2: arm fidelity and interiors-only.
- `-003` O3: evidence honesty.
- `-004/-005` O4/O5: tool emergence and declared configuration only.
- `-006/-008` O6/O8: typed failure and budget respect.
- `-007` O7: idempotent evidence.
- `-009/-010` pipeline and capability handler classes.
- `-011/-014` the interpretation family: one seam, fail-closed
  interpretation, ladder semantics, and resume semantics.

B1 cannot proceed to code while any of these review checks fail:

1. The handler law does not introduce a second compute ontology beside
   the C-call envelope.
2. The handler law does not let downstream product code implement the
   standard worker loop.
3. Pipeline and capability handlers are separated without changing the
   C-call spine, selection row, judgment vocabulary, or audit equality.
4. Handler output remains candidate interior material until ABG admits
   it.
5. Evidence honesty is replay-auditable; no handler can assert effects
   without evidence refs.
6. Hidden configuration from ambient process state, shell defaults,
   local path scans, or product prompt assembly is non-closure.
7. Failure, timeout, overrun, malformed output, and missing evidence
   become typed outcomes under the judgment router, not host exceptions
   or product controller state.
8. Resume is keyed by cCallRef plus handler binding identity, with
   digest mismatch and duplicate archive claims failing closed.
9. The interpretation family is one ABG-owned runtime family; standard
   path products declare data only.

## Plan sketch (P0 ratify before realization)

B1 ratifies and reviews handler-law requirements before realization.
P1 standard transform interior. P2 standard evaluate interior
(latitude/golden consumed). P3 deterministic interiors
(materialize/execute from declarations). P4 odd_glc adoption: binding
→ declarations; campaign reruns as the proof. Gödel checkpoints per
phase; codex review at B1/P0.

## Proof commands

```sh
rg -n "Arm fidelity|Interiors only|Evidence honesty|Tool emergence|Declared config only|Typed failure|Idempotent evidence|Budget respect|Pipeline handlers|Capability handlers|One seam|Fail-closed interpretation|Ladder semantics|Resume semantics" specification/requirements/abg/REQ-R-ABG3-HANDLERS.md
rg -n "REQ-R-ABG3-HANDLERS-001/-014|B1 review surface|standard worker loop|product prompt assembly" .ai-workspace/tickets/active/T-205-hog-iteration-2-standard-worker-plugin-lift.md
git diff --check
```

## Absorbed (board consolidation, user 2026-07-06)
- T-199 per-vector temporal formulas — subsumed by -017 ladder
  predicates (per-edge-class declared conditions).
- T-202 product-grade drift witness loader — rides this wave's gate
  infra.
- T-203b legacy sunsets (trace dual-write, branch_lease producer,
  FP-review ratification) — erase-adjacent, this wave.

## Proof commands (codex MEDIUM actioned)
```bash
cd build_tenants/abiogenesis/typescript
npm run test:t205        # all T-205 behavioral differentials (t200 + t192 lanes)
npm run test:semantic    # full suite
```
B2 status: interpretation seam LIVE (resolution at run entry, typed
fail-closed truth per codex HIGH: runtime_failure_observed +
gap_stop(hog_program_unresolvable), zero spine rows, no host
exception); declared program identity proven flowing into real replay.

## B3 status (current)
Contract + F_D handlers (strict-F_D/totality law) DONE. Interpreter
plumbing DONE: c_call_handler_execute through the effect protocol;
registry admitted AT ENTRY (admitHandlerRegistry with field validation
— codex probe pinned as differential); executability gate
binding-complete (program×stage×arm + regime match + registered
handler). REMAINING: the execution anchor (extra stages running
spine-enclosed), F_P agent-transport + F_H gate handlers, B4, B5.

## Absorbed-stub ruling (board audit 2026-07-06)
Neither absorbed stub BLOCKS functional-complete 4.5 (the clean run):
- T-202 (witness loader leaves the test lane): B6 cut QUALITY item;
  acceptable to ship rc with gate-lane witnesses as 4.4.0-rc.1 did;
  schedule with the post-run cleanup.
- T-203b (timeout dual-write sunset; branch_lease producer-or-replay;
  FP-review wired-or-ratified): erase work, post-clean-run.
T-199 repointed to T-206 (its merge note overclaimed: ladders are
attempt-based selection, not per-vector property formulas).

## B5 EARNED MAP + 4.5.0-rc.1 READINESS (2026-07-07)
The internal-everything gate items and where each earned:
- declared catalog override: LIVE LANE (t194 sandbox, real gpt-5.5
  worker) — per-configuration {gtl://sandbox/hog/lean: 6}, declared
  arms on all rows, session parity 2==2, converged, releaseGrade
  sourceClean=true classification on the run artifact;
- ladder escalation: engine battery (compression descent across
  resume, governing-attempt coherence);
- resume: engine battery (frontier holds, fresh window, -004
  replay-global attempts);
- consequence re-entry: engine battery (t152-lane: upstream landing,
  monotone spines through the loop);
- handlers end-to-end: engine battery (keystone 4-stage + triad
  6-stage, all three fibres); binding DECLARATION surface live
  (bindings/configs as GTL, registry admitted at entry);
- -012 per configuration: live-lane audit row.
READINESS: version 4.5.0-rc.1, note single-current, docs swept
(witness-driven), battery 1129/1129 + t205 13/13 + t188 32/32.
AWAITING: user code review + test-results review; B6 cut remains
blocked by the carry-through applicability remediation below.

## codex rc.1 round CLOSED + final-candidate gate (2026-07-07)
P1-a raw-field binding admission (no coercion, closed keys, probes
pinned) + P1-b closed-key program/stage admission (explicit no-spread
build; syntax layer uniform) — both fixed same-pass. Scenario-coverage
matrix posted (4 in-review gaps closed incl. declared-bindings e2e +
async driver law; 4 named gaps with phase owners). FINAL-CANDIDATE
GATE at HEAD: sourceClean=true, releaseGrade=true, installed package
4.5.0-rc.1, converged, per-config {gtl://sandbox/hog/lean: 6} — the
evidence-scope caveat is retired. Suite 1134/1134, t205 18/18.
B6 cut is paused until the carry-through applicability information-loss
defect below is reviewed and implemented.

## Self-review round applied (2026-07-07)
Post-campaign self code review (9 findings) applied in recommended
order: F1 consequence-plugin never-crash guard restored + name-derived
target (odd_glc); F3 resume verifies scenario identity (odd_glc); F2
THE BINDING UNIT LANE — pure surfaces (plan shape family, compile
attribution, re-entry target) extracted and exported from the generated
binding, generation-fidelity checks pin the escape-discipline class
(#10b/#15 signatures) permanently (odd_glc, suite 56/0); F4 second
inspect-gate exception narrowed to the pre-spawn signature (ABI); F7
attempt identity = max(attemptIndex)+1 (batch-safe by construction,
ABI); F5 consequence-plugin throws are typed blocked projections on
both drivers (run-19 #21 shape pinned as differential, ABI); F6 typed
closureFailureClass derived once at the construction boundary (carrier
+ factory + admission + projection row + typed-first consumer with
prose fallback for pre-field replays, ABI). These ride the rc.4 line.

## Remediation: live replay-log append (2026-07-07)
Observed in the odd_glc standalone sandbox run
`build_tenants/odd_glc/typescript/test_runs/glc_software_build_overlay_live/basic-cli/20260707T012039280Z_pid27983`:
the PTY trace flushed live, but the ABG replay log
`.ai-workspace/events/events.jsonl` stayed empty during execution and
only received the full event batch at process exit. That makes live
observation depend on archive inspection instead of the replay truth
surface.

Requirement authority: `REQ-R-ABG3-EVENTS-024`. Event append is a
single ABG-owned runtime sink. Products and scenario harnesses must not
create a second event writer. Process/PTY traces remain evidence
interiors; they do not substitute for replay event truth.

Implementation target:
- `createRuntimeEventLogSink(eventLogPath)` appends the canonical event
  to the workspace replay log at emission time and keeps the same event
  in the command-local payload list.
- `genesis-ts start` and `genesis-ts assess-result` use that sink
  directly; the old finalization-only batch append path is retired.
- The M04 CLI integration plugin-factory proof reads
  `.ai-workspace/events/events.jsonl` during F_P dispatch and must see
  already-emitted ABG events before the plugin emits its own probe.

## Remediation: carry-through applicability information loss (2026-07-08)

STDO status: design review required before code. No temporary odd_glc
patch is authorized.

Problem:

The data-mapper campaign exposed an ABG information-loss defect in
requirement proof carry-through. Active requirement pressure exists on a
closing edge, and `requirementProofCarryThroughStartup` may be present,
but if no matching `requirement_proof_carry_through_admitted` event is
emitted for that edge, the route currently passes an empty
`proofCoverageTruthRefsByRequirementId` row into the fold. The fold then
falls back to generic assurance closure truth.

This collapses two different information states:

- coverage is not required for this edge;
- coverage is required for this edge but missing.

Those states are not equivalent. Treating both as "no coverage refs"
lets an edge close while silently dropping requirement-proof pressure.
That violates `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-002`,
`-005`, `-010`, `-013`, `-037`, and the transition rule in `-038`.

Current code shape:

- `deriveRequirementProofCarryThroughAdmittedEvents(...)` filters
  startup entries by `entry.edge` and emits nothing for non-matching
  edges.
- `emitRequirementRouteForEdgeClose(...)` collects only emitted
  coverage refs scoped to the closing edge.
- `sourceTruthRefsByRequirementId(...)` treats absent coverage refs as
  absence, then appends scoped assurance closure truth.
- `foldRequirementEvidence(...)` already preserves no-close when it sees
  a non-eligible `abg://requirement-proof-coverage/...` truth ref, but
  it never sees one for the "required but missing" case.

Prime-law diagnosis:

The missing Prime carrier is not a downstream lifecycle slot map, a glc
coverage table, or a caller-supplied boolean. The missing derivation is
ABG-owned carry-through applicability:

`active requirement obligation x admitted carry-through contract x
edge/program locus x replay events -> requirement proof coverage
projection`

The attempted local shape `proofCoverageExpected` is not sufficient if
it is caller supplied. It is only lawful if it is an internal derived
predicate over admitted startup/program/contract truth and active
requirement projections.

Irreducible solution:

ABG shall derive carry-through applicability at the route close site from
admitted truth. For every active projected requirement on the closing
edge:

1. If no carry-through contract applies, preserve the existing
   transitional `-038` behavior and mark the gap as migration state in
   release claims.
2. If a carry-through contract applies and matching coverage exists,
   pass the existing coverage truth refs into the requirement fold.
3. If a carry-through contract applies and matching coverage is absent,
   ABG shall project a residual `requirement_proof_coverage_projection`
   for that requirement and feed its
   `abg://requirement-proof-coverage/residual/...` truth ref into the
   fold.

This reuses the existing coverage truth grammar and the existing fold
behavior. It does not mint a new closure surface. The missing information
becomes replay-derived residual pressure, so the traversal can continue,
retry, recurse, re-enter, or block through existing ABG mechanisms.

Non-solutions:

- Do not enumerate per-vector carry-through entries in odd_glc to cover
  the hole.
- Do not add a glc-local requirement-proof ledger, closure register, or
  post-processor.
- Do not let F_P, a scenario harness, or a sandbox monitor assert that
  coverage is complete.
- Do not add a caller-owned `proofCoverageExpected` flag as closure
  truth.
- Do not fail the host process when coverage is missing; project typed
  residual/no-close truth.

Review checklist before implementation:

- The applicability predicate is F_D: total over known/admitted
  requirement, edge, program, startup, contract, and replay carriers.
- Applicability has one Prime source: admitted GTL/ABG program/startup
  and active requirement projection truth. No downstream product-owned
  mirror exists.
- Absence is typed: "required but missing" emits residual coverage truth
  or an equivalent replay-visible projection, not silence.
- Existing undeclared-edge transitional behavior remains explicit under
  `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-038`; release notes do not
  claim universal coverage-gated closure while undeclared edges remain.
- The implementation composes with C-call enclosure and handler law:
  plugin outputs remain candidate interiors until ABG admits them.

Proof gates:

- Add a T-188/T-205 differential where carry-through startup exists for
  a different edge while the closing edge has active requirements:
  no matching coverage event is emitted; the fold must be
  `no_close_preserved`.
- Assert the fold source truth includes a residual
  `abg://requirement-proof-coverage/...` ref for the missing-coverage
  requirement.
- Keep the existing baseline: no carry-through declared at all retains
  the `-038` transitional path and does not silently upgrade to universal
  coverage gating.
- Keep the existing eligible and residual coverage tests: eligible
  coverage + assurance close satisfies; residual/blocked coverage
  vetoes close.
- Run `npm run test:t188`, `npm run test:t205`, and
  `npm run test:semantic`.

## Carry-through applicability IMPLEMENTED (2026-07-08)

Design review ratified with two pinned decisions, then code:

1. Predicate scope pinned (the review's one major ambiguity): owedness is
   REQUIREMENT-scoped, production is EDGE-scoped. `entry.requirementIds`
   names which requirements owe coverage wherever their pressure is
   active; `entry.edge` names only where the producer emits. An entry
   naming a foreign requirement leaves the closing requirement on the
   `-038` transitional path; an entry naming the active requirement with
   a foreign production edge preserves no-close with residual pressure.
2. F_D totality law (user, this round): F_D is a total function over a
   finite state machine, and responsibility separation is strict —
   admission collapses the open domain once at ingress; derivations are
   total over the admitted domain and never grow guards against raw
   shapes. Realized as `admitRequirementProofCarryThroughStartup` at
   engine entry (admitHandlerRegistry/temporal-startup precedent):
   inadmissible startup becomes a typed `gap_stop` terminal
   (`requirement proof carry-through startup rejected: entries[i].field`),
   never a host exception, and never runs.

Compute self-healing only — no new variable carrier, status, or event
kind. The close-site fix is one pure fold over the finite cell lattice
{not_owed, owed_uncovered, covered(eligible|residual|blocked)}:
owed_uncovered maps to the EXISTING residual status via the EXISTING
projector applied to zero admissions and the EXISTING self-certifying
truth-ref codec; the fold's first-loop veto consumes it unchanged.

Code sites (one home, requirement_proof_carry_through_producer.ts):
- `admitRequirementProofCarryThroughStartup` — the one total admission
  over the open startup ingress;
- `carryThroughEntryProducesOnEdge` — production predicate, now shared
  by the producer loop (was inline);
- `carryThroughOwedObligationRefsByRequirementId` — obligation scope;
- `deriveRequirementProofCoverageTruthRefsForEdgeClose` — scan +
  synthesis fold-input assembly, deterministic synthesized
  projectionRef over (basisId, vectorIndex, edge, requirementId);
- engine_runner: entry admission block + close-site assembly replaced by
  the contracts call (three close sites ride the one helper). Route and
  fold signatures untouched.

Differentials (9 new): owed-but-missing => no_close_preserved with
exactly one synthesized residual ref in fold source truth;
requirement-scoped control => -038 transitional close; inadmissible
startup => typed gap_stop at entry; unit lane pins determinism,
suppression-on-presence (no double projection), identity scope,
mixed per-requirement, no-owedness, and admission rejections.

Proof: t188 41/41, t205 22/22, `npm run test:semantic` 1147/1147,
`git diff --check` clean. Known residual (pre-existing, named in code):
close-site identity is basis+edge+vector; frame/run identity remains the
named follow-up. The -038 release-claim witness can now enumerate
undeclared-but-obligated edges from the same owedness function (free
consequence, not yet wired).

## Carry-through review round applied (2026-07-08, second pass)

Adversarial review (user probe) found the startup admission was a
kind-tag check, not admission — `{ contract: { kind: ... } }` passed,
then both consumers threw host exceptions (owedness map:
`fulfillmentBindings is not iterable`; producer: `contractRef must be a
non-empty string`). The open domain had survived behind the gate.

Fix (deep admission, one validator home):
- `admitRequirementProofCarryThroughStartup` now RECONSTRUCTS each
  entry through the existing carrier constructors
  (`constructRequirementProofCarryThroughContract`,
  `constructRequirementProofCandidateClassificationTable`) and
  probe-constructs the envelope template with deterministic placeholder
  refs — the constructors ARE the validators; no duplicated field rules.
  Supplied-digest tampering on the classification table fails closed for
  free (`verifiedSuppliedCarryDigest`).
- Admission returns `AdmittedRequirementProofCarryThroughStartup`
  (frozen, reconstructed). Producer emission, owedness, and the
  close-site derivation accept ONLY that type — raw startup cannot
  reach them through the public surface (review finding 2 closed).
- Runner threads the admitted carrier from the entry gate to the
  producer call and all three close sites; the raw request field is
  consumed nowhere past the gate. Child construction-episode requests
  still forward raw startup lawfully — the child run re-enters the same
  entry admission.
- `carryThroughEntryProducesOnEdge` demoted to module-local (public-API
  inflation removed).

Accepted-by-design (review finding 3): the synthesized residual carries
only the coverage truth ref; issue-kind detail is F_D re-derivable from
admitted startup + replay (deterministic), so no replay information is
lost — the product claim is fold-level no-close, not a persisted
missing-coverage diagnostic object.

New differentials: admission depth probe (kind-tag-only carrier
rejected with per-field constructor diagnostics; tampered table digest
rejected); admitted-carrier shape pinned (frozen, reconstructed
contract kind). Proof: t188 42/42, t205 22/22, semantic 1148/1148.

## Carry-through review round 3: workflow review applied (2026-07-08)

Four-lens principles workflow (parallel-truth, recurrence, F_D-totality,
prime-compression; 23 raw -> 13 deduped -> 11 adversarially CONFIRMED,
2 refuted) over the carry-through diff. It independently confirmed both
user findings from round 2 and surfaced the rest. Boundary-local set
APPLIED this wave:

- P1 null-startup hole closed: `admitRequirementProofCarryThroughStartup`
  now rejects null/non-object startup as typed `startup_not_object`
  (null is in the open ingress domain — JSON round-trips mint it).
- P1 lone-surrogate hole closed: the admission's string guard requires
  well-formed strings (`\p{Surrogate}` reject) for requirementIds and
  edge — an admitted lone surrogate previously threw URIError inside
  encodeURIComponent at ref minting on in-domain input.
- P1 closed rejection vocabulary: admission issues are typed rows
  {issueKind, at, message} (temporal-precedent shape); the gap_stop
  reason joins locus:issueKind, never pattern-matched prose.
- P5 fail-closed startup realization: one module-local
  `failClosedStartupResult` in the runner; the hog / temporal /
  carry-through entry blocks (third recurrence) rewired through it.
- P5/P3 route-close call bundle: one local
  `emitRequirementRouteCloseForEdge` closure; the three close sites
  (which this wave had edited identically three times) rewired; the next
  per-close input (frame/run identity residual) threads in one place.
- P3 owedness one home: `owedObligationRefsForEntry` now feeds BOTH the
  producer emission path and the cross-entry owedness merge — produced
  and synthesized coverage share one required-set truth (behavior
  identical; the projector already canonicalized).
- P3 ref grammar: synthesized projectionRef now scheme://
  (`carry-through-close://...`), the family's only single-colon ref
  removed.
- P4 export surface: `carryThroughOwedObligationRefsByRequirementId`
  internalized (zero external consumers; the -038 witness gets it back
  when a real consumer exists).
- P3/P5 tests: residual-ref recognition via the owning parser
  (`requirementProofCoverageStatusFromTruthRef`), raw prefix literal
  removed; the redundant suppression differential merged into the mixed
  per-requirement differential (net one fewer test, no pinned law lost);
  null-startup and lone-surrogate admission differentials added.

Refuted (recorded, no action): obligation-refs canonicalization
divergence (the projector is the one canonicalization home); comment-
prose duplication (comments are read models, one full home exists).

Cross-boundary findings escrowed to T-208 (backlog): admission-support
commonization (predicate at 4 sites, scaffold at 3), T-188 fixture
family consolidation to test_env/tests/support/, requirements_route
coverage-prepend single seam + explicit drop decision (-013 triage note).

Proof: t188 41/41, t205 22/22, semantic 1147/1147 (one fewer than round
2 by the lawful test merge), git diff --check clean.

## Carry-through self-review round (2026-07-08, post-rc.6, rides the next cut)

Self review of the full remediation wave targeting the round-3 changes
(they landed AFTER the workflow review ran and were themselves
unreviewed) plus a claims-vs-tree audit. Result: one confirmed defect
(fixed), one named residual (recorded), three suspicions checked and
cleared, no false closure claims found.

F1 CONFIRMED + FIXED — admitted carrier was not fully closed: the
admitted envelopeTemplate was a SHALLOW freeze of the raw caller object;
its arrays stayed caller-shared and mutable (probe: post-admission
`push("")` was visible inside the admitted carrier), so a mutating
caller could defeat the probe guarantee and reintroduce a mid-run host
throw at real envelope construction. The admitted template now derives
FROM the probe construction itself — constructor-frozen, canonical,
detached from caller arrays. Differential pins frozen-deep +
detached + mutation-invisible. It was the one carrier in the family
below the constructor-frozen standard.

F2 NAMED RESIDUAL — basisId and the closing vector name flow into
encodeURIComponent at residual synthesis without well-formedness
guarantees. That is basis-admission scope, a pre-existing exposure
class across the ref-minting family (route scopedClosureTruthRef
included), not carry-through ingress; noted for the basis-admission
boundary, not patched here.

Checked and cleared: temporal fail-closed block single-event ->
array emission through the shared helper (behavior-identical, suites
pin); hog block literal iterationCount 0 vs the variable (value-
identical at entry, first increment is inside the loop); emission-path
canonicalization via owedObligationRefsForEntry (projector already
canonicalized — projections bitwise identical). Claims audit: ticket
round records, rc.6 release note, and suite numbers all match the tree;
no weakened test (the one merged differential is recorded with law
preserved; changed expectations trace to the typed-vocabulary review
finding, not to implementation behavior).

CLOSURE STATEMENT: the carry-through applicability remediation is
CLOSED — implemented, three review rounds applied (design review,
adversarial probe round, 4-lens workflow round), self-review clean
after F1, differentially pinned (t188 41/41, t205 22/22, semantic
1147/1147), shipped at 4.5.0-rc.6 with F1 hardening riding main.
B6 is UNBLOCKED. Remaining before T-205 closure: user review of the
rc.6 substrate, then the B6 cut; escrow at T-208; named residuals
(frame/run close identity, -038 witness wiring, F2 basis
well-formedness) carried on their owning boundaries.

## Release-state correction: rc.7 cut (2026-07-08)

Release review (user) found the closure statement above overclaimed:
"shipped at 4.5.0-rc.6 with F1 hardening riding main" — but the rc.6
ARTIFACT (sourceCommit 6517268) predates F1 (24b8583); an installed
rc.6 carries the pre-F1 shallow-freeze admitted-template path. For glc
repin that gap is release-blocking. Recorded cuts are immutable, so the
correction is a fresh cut, not a recut: 4.5.0-rc.7 carries F1; the
repin substrate is rc.7. Verification discipline amended: the release
record now checks the PACKAGED artifact's content against the claimed
fixes, not only the manifest's sourceCommit. CLOSURE STATEMENT stands
with the substrate corrected: the remediation is closed and shipped at
4.5.0-rc.7; B6 unblocked on the rc.7 substrate.

## T-205 CLOSED (2026-07-08)

Closure basis, per the ODD A16 narrow (acceptance repriced, successor
opened — no silent acceptance drift):

EARNED AND CLOSED HERE:
- handler law ratified and realized (REQ-R-ABG3-HANDLERS-001/-014;
  B1-B3): contract + F_D handlers, interpretation seam live at entry,
  registry admitted at entry, executability gate binding-complete;
- THE INTERNAL-EVERYTHING GATE (B5 earned map): catalogs, ladders,
  resume, re-entry, handlers end-to-end proven in ABG's own lanes with a
  real worker; -012 green per configuration; final-candidate gate
  sourceClean/releaseGrade;
- carry-through applicability remediation: implemented, three review
  rounds + self-review, differentially pinned, shipped;
- B6 acts realized: 4.5.0-rc.7 cut (snapshot:release + tarball +
  checksums + release note; artifact-content verified), toolchain
  product install (product-toolchain-manifest digest pinned), odd_glc
  repinned to rc.7 (suite 59/0, F1 verified in the installed payload).
  rc.6 is superseded release history (artifact predates F1).

REPRICED OUT (successors own them):
- P4 standard-path adoption — odd_glc ships declarations only, campaign
  rerun as proof, -012 green on the standard worker plugin: T-209;
- commonization escrow (admission-support family, T-188 fixture family,
  route prepend seam): T-208;
- named residuals on their owning boundaries: frame/run close-site
  identity; -038 witness wiring (derivable from the owedness function);
  F2 basis-identifier well-formedness (basis admission); T-202/T-203b
  per the absorbed-stub ruling.

Final proof state at close: abiogenesis semantic 1147/1147, t188 41/41,
t205 22/22; odd_glc 59 pass / 0 fail on the rc.7 substrate; trees
pushed (abiogenesis 03af760+, odd_glc 399a3a4).
