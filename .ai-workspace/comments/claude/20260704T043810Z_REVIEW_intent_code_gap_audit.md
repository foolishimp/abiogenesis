# Review: Intent↔Code Gap Audit — Assumed-Correctness Failures Across the Traversal Monad

**Status**: review commentary, not ratified specification
**Date**: 2026-07-04
**Author**: Claude
**Project**: Abiogenesis
**Scope**: full `intent -> product -> specification -> design -> code` sweep for the failure class exposed by the evaluate-F_P bypass: guarantees the algebra declares but the live runtime does not enforce
**Method**: census-driven, chain-traced, adversarially verified. Six parallel census dimensions, each finding re-tested by an independent skeptic (real-gap vs code-actually-realizes-it). Findings below are the ones that survived adversarial verification; refuted ones are listed under Refuted.

---

## 1. The systemic finding

**The algebra is comprehensive and correct in isolation. The gap is the wiring from that algebra into the live traversal and closure path — and it is largely opt-in, partial, or absent. The proofs that should have caught this hand-wire the missing connections, so nothing fails.**

The evaluate-F_P bypass was not an anomaly. It is the dominant shape of defect in this substrate right now. Across six dimensions, every confirmed finding is one of five variants of the same root cause:

- **declared_not_wired** — a carrier/projection is defined, typed, tested, re-exported, but never produced or consumed by the runner.
- **proven_one_arm** — a guarantee is enforced on one arm of a fan-out (one stage, one reduction) and assumed for all.
- **caller_asserted / presence_not_differential** — a fact intent says must be substrate-derived is instead read from the presence of caller-supplied ref lists.
- **two_truth** — one fact in two divergable carriers (flat lists vs. binding-derived sets; design diagram vs. code).

The authority chain is sound down to design. Intent (INTENT/PRODUCT) asserts the guarantees; specification ratifies them correctly (REQ-R-ABG3-INSTRUCTION-ASSEMBLY-005/-011, REQUIREMENT-PROOF-CARRY-THROUGH-013/-018); the design packs even specify the exact wiring ("closure gate: make requirement fold consume proof coverage"). **The break is at the code↔design seam — the runtime wiring — and it is masked because the tests exercise the algebra in isolation and the "live" lanes reconstruct by hand the connections the engine omits.**

---

## 2. Blockers (confirmed real_gap)

### B1 — The instruction-assembly guarantee is opt-in, not enforced
`REQ-R-ABG3-INSTRUCTION-ASSEMBLY-005` is absolute: no governed F_P dispatch without an admitted plan, immutable envelope, and replayable manifest; `-008` requires fail-closed *before* weakened dispatch. But `instructionAssemblyRuntimeForStartup` returns `null` whenever the caller omits startup input (`engine_runner.ts:562-565`); with `runtime===null`, `bindInstructionAssemblyForFpEffect` returns `{kind:'not_configured'}` (`:828-834`); and at both dispatch sites only `kind==='blocked'` terminates (`:5816`, `:6290`) — **`not_configured` falls through, so even the two bound arms (scalar transform, scalar evaluate) fire with no manifest and no non-tautology check.** No assertion anywhere forces the runtime non-null before an F_P transition is yielded.
**Fix:** treat `not_configured` as `blocked` (fail closed) at both sites, or assert `instructionAssemblyRuntime !== null` whenever an F_P-regime transition is about to be yielded.

### B2 — The T-188 proof-coverage projection is never produced by the engine and never gates closure
*(Three independent dimensions converged here — highest confidence in the audit.)* The design is explicit (`M03_REQUIREMENT_PROOF_CARRY_THROUGH_DERIVATION.md:361` "make requirement fold/assurance consume proof coverage"; REQ -013/-037). But `projectRequirementProofCoverage`, `admitRequirementProofCarryThroughOutput`, and `requirementAbgTruthRefFromRequirementProofCoverage` have **zero callers repo-wide outside their own file and the index re-export**. The live edge-close route `emitRequirementRouteFactsForEdgeClose` (`engine_runner.ts:3545`) calls `projectRequirementFoldFromAssuranceClosure` **without** any coverage argument (`requirements_route.ts:1046`; the interface has no coverage field, `:241`). **The entire carry-through machinery we spent this arc reviewing — fields, pairing, depth, classification — is not wired into closure. Requirement fold closes on the assurance decision alone.**
**Fix:** call `projectRequirementProofCoverage` in the iterate()/close path for requirement-bearing edges, admit plugin outputs through `admitRequirementProofCarryThroughOutput`, and thread the replay-derived coverage status into the fold so closure blocks/residualizes when coverage is not eligible.

### B3 — The T-188 "live" proof hand-wires the connection the engine omits (masquerade)
`test_t188_requirement_proof_carry_through_live.test.mjs:340-353,412-460` runs a real F_P worker, then **constructs** `contract()`, `classificationTable()`, `carryEnvelope()`, `dependencyTruth()`, `proofDepthTruth()` as in-test fixtures and calls the projection/admission directly on them. It proves the algebra in isolation while *reconstructing by hand* the producer→consumer wiring B2 shows the engine never performs. This is exactly why B1/B2 stayed invisible: the "live" lane is green because it fakes the runtime.
**Fix:** the live lane must drive coverage through the actual engine run and assert engine-emitted events/projection carry the status and that closure is withheld — no reconstructed coverage or fold.

---

## 3. Majors (confirmed real_gap)

### M1 — Composed transform.C F_P tasks bypass instruction assembly
`bindInstructionAssemblyForFpEffect` is applied only to the scalar transform reduction (`engine_runner.ts:5806`). Composed transform tasks dispatch via `composed_stage_task_batch_run` stageRole `transform` (`:5710`) with `regime = plugin.contract.computeMeans` (may be F_P) and **no manifest, no envelope, no actorInvocationRef**. Design `M03_COMPOSED_C_STAGE_SET_DERIVATION.md:80-85` explicitly sanctions F_P transform tasks — so this is a live, permitted, unbound arm. *(proven_one_arm — the scalar reduction was bound and the guarantee assumed for the batch.)*

### M2 — Non-tautology gate (REQ-011) applied to only two of ≥five F_P dispatch arms
Non-tautology enforcement lives inside `renderPromptManifest`/envelope-binding (`instruction_assembly.ts:1619`), invoked only for scalar transform (`:5806`) and scalar evaluate (`:6280`). The composed transform batch (`:5710`), consequence batch (`:5337`, `:6937`), and evaluation register-rule batch (`:6138`) dispatch with the gate absent. The session's spine — "the prompt must not carry the answer" — guards two arms; the rest are ungated.

### M3 — `proofStrengthAdmitted` / `depthComplete` are presence checks, not admitted verdicts
Design demands strength "admitted by total F_D criteria or adversarial verification rather than worker self-report" (`DERIVATION.md:47,226`). `deriveProofStrengthAdmitted` (`instruction_assembly.ts:577-588`) returns `true` purely on **list non-emptiness** (`proofStrengthAdmissionRefs.length>0 && counterexampleRefs.length===0 && (fdCriterionRefs.length>0 || adversarialVerificationRefs.length>0)`); the refs are only `requireStringArray`-validated (`:848-868`), never resolved against the admitted ledger. So "strength admitted" = "caller supplied some strength strings." *(presence_not_differential — and it feeds the closure gate.)*
**Fix:** resolve each ref against the admitted payload/evidence ledger (existence + role + digest), and require `adversarialVerificationRefs` to bind to an admitted verifier-execution event with a passing outcome, before raising the flag.

### M4 — Runner registry lookup is self-confirming
`REQ-R-ABG3-SELECTION-APPLICATION-001` requires ABG to *enumerate* interface-conformant candidates for a contract boundary. Instead `runtimeRegistrySelectionForTransition` finds the entry matching `basis.graphFunction`, then builds the `RegistryLookupRequest` **from that already-selected entry's own fields** (`engine_runner.ts:3701-3778`). The eligibility request is synthesized from the answer, so **no candidate can ever be rejected and no contract-boundary enumeration occurs** — the selection is tautological. *(This is the live-runner form of the T-177 concern.)*
**Fix:** build the lookup request from the traversal edge's own required interface/source/target/authority/proof refs, not from the candidate it already picked.

### M5 — Substrate-derived classification exists but the live runner never calls it
`admitRequirementProofCarryThroughOutput` genuinely derives `outputCandidateKind` from `(stageRole, admissionTargetKind, evidenceRoleRefs)` and rejects a mismatching caller assertion (`requirement_proof_carry_through.ts:863-911`) — the fix from the prior review is real. But the function is **only re-exported (`index.ts:1181`), never imported in the runner**. So on the live F_P output path, candidate kind remains caller-asserted; the derivation is dead code. *(declared_not_wired — the fix landed in the algebra, not in the path.)*

### M6 — Coverage status reaches the fold as an unresolved, non-digest-bound caller string
`sourceTruthRefsByRequirementId` splices caller coverage strings into the fold source refs with **no `resolveAdmittedRef`** (contrast the assurance ref resolved just above), and the ref digest binds only `[projectionRef, requirementId]` — **not the status token** (`requirements_route.ts:758,784-802`; `requirement_proof_carry_through.ts:458-464`). Even once B2 is wired, eligibility could be self-asserted and forged. *(caller_asserted; violates REQ-018 F_D-replay-derived coverage.)*

### M7 — Structural-carrier diagram declares a row projection the code doesn't have
The diagram you just added (`M03_..._STRUCTURAL_CARRIER_DIAGRAM.md:115-256`) declares `RequirementProofCoverageProjection` as prime with `coverageRows/witnessRows/foldbackRows/closureEligibility`; the code interface carries only flat string-ref arrays plus a scalar status (`requirement_proof_carry_through.ts:152-170`). Design and code disagree on the prime carrier's shape. *(two_truth, design↔code.)*
**Fix:** reconcile the diagram to the flat carrier, or realize the row carriers — but one of them, not both.

---

## 4. The pattern per chain layer

- **Intent / Product** — the guarantees are asserted and correct: traversal monad owns closure; one truth surface; F_D/F_P boundary; obligation carry-through; no product-local shells.
- **Specification** — the requirement clauses are ratified and correct (REQ-005/-011 absolute manifest + non-tautology; -013/-018 coverage-gates-closure). No defect here.
- **Design** — the derivation packs specify the wiring precisely ("fold consumes coverage before assurance-close"). No defect here either — the design *told the code what to wire*.
- **Code** — the carriers and algebras are built and unit-tested, but the **runtime wiring** (produce coverage in iterate, consume it in fold, bind every dispatch arm, resolve every gating ref against the ledger, enumerate candidates at the boundary) is where it breaks. The break is code-vs-design, and it is invisible because the isolation tests and hand-wired "live" lanes never exercise the missing edges.

The lesson generalizes the evaluate bug exactly: **a guarantee proven on one arm, or proven against a constructed fixture, is not proven for the runtime.**

---

## 5. Recommended standing gates

1. **Dispatch-site census as a non-closure gate.** No F_P/F_H invocation path may reach a worker without resolving through an admitted manifest. `not_configured` must be `blocked`. Enforce with a test that enumerates every dispatch site and asserts manifest binding + non-tautology on each — one shared binding helper for all F_P-regime stage tasks, not per-reduction copies.
2. **Producer–consumer wiring assertion.** Any projection a requirement names as a closure gate must have a live producer in `iterate()` and a live consumer in the fold, asserted by a wiring test — not a fixture. A projection with zero runner callers is a defect by construction.
3. **Live proofs drive the real engine end-to-end.** No hand-constructed coverage/contract/fold in a `:live` lane. The live lane asserts engine-emitted events carry the status and that closure is withheld when coverage is ineligible.
4. **Derive-don't-assert, and resolve-don't-count.** Every closure-gating boolean resolves its refs against the admitted ledger (existence + role + digest) and reflects an admitted verdict — never list presence, never a caller string.
5. **Census-not-single-instance.** A guarantee is proven only when every arm of its fan-out (every stage, entry point, reduction, product) is enumerated. Bind the guarantee to the census, not to the first green test.

---

## 6. Refuted (adversarial verifier rejected these — do not action)

- **Consequence.C is not a bypass** — it is constrained to F_D reduction, so it needs no manifest (verified against `fn_composition.ts` and the composed-stage design). Human_callout is F_H, not an F_P worker. So transform (composed) is the live unbound F_P arm, not consequence.
- Registry selection "gated behind optional startup," node-type close-gate "never invoked," and the candidate-classification two-truth were each rechecked and found realized-or-benign.

## 7. Coverage and limitations

Six dimensions ran; three agents failed mid-run (schema-retry / stream stall) — traceability had partial coverage, so the ungrounded-code and intent-unrealized sweeps are less complete than the dispatch/closure/selection/proof-coverage sweeps. The strongest result (B2) was found independently by three dimensions and adversarially confirmed, so confidence there is high. This post is commentary; each finding cites file:line for direct verification before any re-entry is opened. The natural re-entry is a `realization_refactor` wave that wires the existing algebra into the live path (B2/M1/M2/M5/M6) plus a `design_reframe`-scoped fail-closed change for B1, with the standing gates in §5 added as non-closure conditions so the class cannot recur.

---

# Addendum v2 — 2026-07-05: the operative chain is ticket → implementation

**Status**: review commentary, extends v1 above; v1 body is preserved as the dated record.
**Prompted by**: product-owner observation that intent/goals (and to a lesser extent product) are not updated by the constitutional changes — the truth enters through tickets, and the real gap to measure is ticket ↔ implementation.
**Method**: every v1 finding re-verified against current main (post `d113b64` "Earn T-188", post `4.2.0-rc.4` cut); constitutional surfaces reviewed separately (2026-07-05 product review); ticket census over the completed T-16x/T-18x wave.

## A1. Self-evaluation of v1

**What held.** Every v1 finding was adversarially verified and every post-audit event moved exactly where the audit pointed: the next substrate commit (`d113b64`) attempted the B2 fix, and the next release claim (`4.2.0-rc.4`) claimed the B2 property. The taxonomy (declared_not_wired / proven_one_arm / caller_asserted / presence_not_differential / two_truth) needed no revision — post-audit events produced fresh instances of two of the classes.

**What v1 got wrong.** §4 says of Intent/Product/Specification: "No defect here." That row is wrong in direction. Those layers are not *contradicted* — they are **vacant**. INTENT's last entry is INT-007 (2026-03-25); everything the product now is — requirements algebra, runtime registry, node types, instruction assembly, carry-through, program-traversal mapping — entered law with no intent entry, anchoring generically to INT-001 (57 of 64 intent citations). PRODUCT.md is `Status: Draft` and contains zero mentions of instruction assembly, the registry, or carry-through — three capability families it ships in RC4 and that the installed downstream context already teaches. GOALS.md, chartered as the bounded work-wave surface, is a 370-line ledger holding one active goal plus full release-cut forensics. v1 audited the **nominal** authority chain (`intent -> product -> spec -> design -> code`) and located the break at code↔design. The **operative** chain is:

```text
strategy post -> ticket -> { requirement, design, code, proof } in one wave
```

Truth is authored at the ticket layer and **degrades with distance from it in both directions**: upward, the constitutional narration (INTENT/GOALS/PRODUCT) drifts stale because nothing binds it into the wave; downward, the runtime wiring drifts opt-in because the proofs that discharge non_closure_conditions are algebra-level, not path-level. The healthy spine is ticket + requirement + design pack. Requirements stay current precisely because tickets bind them (`requirement_reprice` waves); INTENT stays frozen precisely because nothing does.

## A2. v1 finding status on current main (post-d113b64, post-RC4)

| Finding | Status 2026-07-05 | Evidence |
| --- | --- | --- |
| B1 opt-in instruction assembly | **Open** | Exactly two `=== "blocked"` checks (engine_runner.ts:5927, :6401); zero `not_configured` comparisons anywhere — it still falls through both dispatch sites |
| B2 coverage never gates closure | **Half-fixed (consumer only)** | Fold now *accepts* `proofCoverageTruthRefsByRequirementId` (requirements_route.ts:198, :744) but defaults `?? []` (:758); producer `projectRequirementProofCoverage` still has **zero callers**; the runner call (engine_runner.ts:3653) passes nothing |
| B3 live proof hand-wires | **Open** | The rewritten live lane (+490 lines in d113b64) still constructs `carryEnvelope()/classificationTable()/proofDepthTruth()` fixtures (8 constructor hits) |
| M1 composed transform F_P bypass | **Open** | `bindInstructionAssemblyForFpEffect` still has exactly 2 call sites (scalar transform, scalar evaluate) |
| M2 non-tautology on 2 of ≥5 arms | **Open** | same two call sites |
| M3 presence-derived strength/depth | **Open** | `deriveProofStrengthAdmitted` verbatim: non-emptiness of caller ref lists |
| M4 self-confirming registry lookup | **Open** | `registryEntryForExecutionBasis` (:3812) still seeds the request from the already-selected entry (:3837) |
| M5 classification not consulted by runner | **Open** | `admitRequirementProofCarryThroughOutput`: 0 references in engine_runner.ts |
| M6 coverage status not digest-bound | **FIXED** | `requirementAbgTruthRefFromRequirementProofCoverage` now takes `Pick<..., "status">` — the status token is inside the digest (requirement_proof_carry_through.ts:447-449) |
| M7 diagram vs code drift | Not re-checked | — |

**Meta-finding (new).** The fix-commit for this audit reproduced the audit's own defect class: `d113b64` added the fold's coverage *consumer interface* without wiring the *producer* — declared_not_wired, inside the fix for declared_not_wired. Score: one finding fixed (M6), one half-fixed (B2), eight open — and one new blocker-class finding below.

## A3. New finding — the release claim races its own active ticket (blocker-class)

`GOALS.md` (RC4 paragraph) claims: *"RC4 adds T-188 requirement-proof carry-through: ABG derives dependency sufficiency, proof-depth completeness, proof-strength admission, candidate classification, requirement/proof pairing, proof coverage, residual pressure, and **fold gating from admitted substrate truth instead of caller booleans**, plugin labels, passing tests, or product-local coverage ledgers."*

Verified against the same tree: fold gating is unwired (B2 producer zero callers, `?? []` default), strength admission is still presence-of-caller-refs (M3), classification is not consulted on the live path (M5). And the ticket layer **already says so**: `T-188` sits in `tickets/active/` with `status: active` — GOAL-028's own row is Active — twelve lines above the release paragraph claiming the properties delivered. The truth-speed ordering in this workspace is now measurable:

```text
code (wiring lags) < ticket (honest: active, non_closure named) < release claim (ahead of both)
```

The ticket layer is the *most honest surface in the workspace*. The dislocation happens above it (release/goals narration claims what the active ticket has not earned) and below it (closure proofs discharge algebra, not path). **Fix:** correct the RC4 claim text to what RC4 ships (the carry-through algebra, admission checks, digest-bound coverage refs — not live fold gating), or cut RC5 with the wiring and an engine-driven live proof.

## A4. Ticket ↔ implementation census (the real gap dimension)

Closure claims measured at the ticket layer, against verified code state:

| Ticket | Closure claim | Code reality | Verdict |
| --- | --- | --- | --- |
| T-162 (completed) | requirements-algebra closure | reopened once after premature close (fold placeholder, edited frozen fixture); later landed | precedent: claim preceded wiring, then corrected |
| T-167 (completed) | non-closed route proof | synthesized fixture; superseded by T-175 live proof-of-record | precedent: masquerade, corrected via successor ticket |
| T-177 (completed) | registry "eligibility filters… validates advice against registry eligibility, emits selection truth" | runner lookup is self-confirming — request seeded from the already-selected entry, so eligibility can never reject a candidate (M4) | **closure claim exceeds wiring** |
| T-180 (completed) | node types non-callable at five surfaces, differential + live | verified differential at all five surfaces, honest partial-slice records | **earned** — closure = code |
| T-182 (completed) | causal carry: omission + drift fail-closed + live | verified omission, drift, runner-blocks, live artifact | **earned** |
| T-183 (completed) | instruction assembly under REQ-005 (absolute: no governed F_P dispatch without manifest); non_closure line 102: "A deterministic P0 edge still dispatches an F_P worker" | scalar transform + evaluate bound and proven; composed transform F_P tasks unbound (M1); binding opt-in via `not_configured` fall-through (B1) — the absolute-form claims hold only on the proven arms | **earned on the proven arms; the closure generalized past them** (proven_one_arm at closure) |
| T-184 (completed) | canonical installed live Hello World over full stack | verified as scoped (registry selection, manifests, response admission, causal carry on the canonical path) | **earned as scoped** |
| T-185 (completed) | program/library/workspace ratification **and propagation** (PRODUCT, INTENT, GTL law, scenarios, installed context) | requirement landed; wording propagated to PRODUCT/INTENT boundary text, scenario 03, installed axioms (one residue: CONTRACT-LAW-API-001) | **earned — including the constitutional propagation, because the ticket named it** |
| T-186 / T-187 (completed) | install context + conformance guardrails | not re-audited in this pass | unverified here |
| T-188 (**active**) | fold gating, strength admission, classification from admitted substrate truth | algebra + consumer interface + M6 digest fix landed; producer unwired; runner passes nothing | **honest** — the ticket does not claim what the code lacks; the release note does |

**The pattern.** Gaps concentrate exactly where a ticket's claim is a *runtime path property* but its discharging proof is an *algebra or fixture test* (T-177 eligibility, T-183 all-arms, T-188-as-released). Where the ticket's non_closure_conditions demanded path-level differentials (T-180 five-surface rejection, T-182 runner-blocks-dispatch, T-184 canonical path), closure equals code. And T-185 is the existence proof for the upward direction: **when the ticket enumerates the constitutional surfaces, they get updated in the same wave; when it doesn't (T-183, T-188), INTENT/PRODUCT/GOALS drift.** The enforcement teeth live in one place — ticket non_closure_conditions — so both drift directions have the same fix.

## A5. Standing gates, re-anchored to the ticket layer (supersedes §5's framing)

The v1 gates were stated as review-time discipline. They bind better as **standing ticket law** — STDO non_closure_conditions templated into every ticket that touches substrate law:

1. **Wiring-proof gate.** A ticket claiming a runtime property cites a producer-and-consumer call-path proof on the live runner path. An algebra/unit test over constructed carriers does not discharge a runtime claim; a projection named as a gate with zero runner callers voids the claim (B2's exact shape).
2. **Arm-census gate.** A guarantee over a fan-out (stages, dispatch sites, entry points) closes only with the census enumerated and each arm proven or explicitly deferred in the ticket record (T-183's exact shape).
3. **Fail-closed-default gate.** Absent configuration/startup/input at a governed boundary resolves to `blocked`, and a differential proves it (B1's exact shape: `not_configured` must terminate, not fall through).
4. **Constitutional-propagation gate.** A ticket that ratifies or extends law enumerates the upstream surfaces — INTENT entry or reprice, PRODUCT owns-lists, GOALS hygiene, scenarios, installed context — each as reprice-or-N/A. T-185 proves this works when named; the instruction-assembly and carry-through waves prove the drift when not.
5. **Release-claim gate.** A release note claims only what closed tickets prove; an active ticket's target_truth cannot appear in a release claim as delivered (the RC4 shape). Release claims cite the ticket IDs whose closure carries them.

## A6. Corrected model

The workspace's truth is **hourglass-shaped**. The waist — tickets, requirements, design packs — is disciplined, honest, and current. Above the waist, narration (GOALS release paragraphs, PRODUCT owns-lists, INTENT) claims or omits ahead of the record. Below it, runtime wiring lags the algebra the waist ratified. v1 measured the bottom gap; the 2026-07-05 product review measured the top gap; this addendum re-anchors both to the layer that actually carries truth. The open wiring list for the next wave is unchanged in substance: B1, B2-producer, B3, M1, M2, M3, M4, M5 (M6 done) — plus the RC4 claim correction, which is a one-paragraph GOALS edit and should land before anything else cites RC4 as carrying requirement-proof carry-through.

## A7. Work plan — requirements work vs code work, per ticket intent

Every open finding was checked against the ratified clauses to answer one question: *does meeting the ticket's intent need requirement work, or only code work?* The answer is lopsided and it confirms the hourglass: **eight of nine open findings need zero requirement work — the existing clauses already mandate the fix.** One finding needs a clause, and that is a correction to v1's own classification.

### A7.1 Correction to v1: B1 is a requirement loophole, not only a code violation

`REQ-R-ABG3-INSTRUCTION-ASSEMBLY-005` reads: *"An F_P dispatch **governed by instruction assembly law** shall not occur without an admitted compiled prompt plan…"* The scoping phrase is the loophole B1 lives in: when no `instructionAssemblyStartup` is supplied (`?:` optional at engine_runner.ts:283/:321), the dispatch is arguably *not governed*, so `not_configured` falling through is technically lawful under -005 as worded. v1 classed B1 as pure `intent_to_code`; accurately it is **`specification` (under-scoped clause) + `code` (exploits it)**. The fix therefore starts with a one-clause `requirement_reprice`, not a code patch.

### A7.2 Requirements work (three items — that is all)

| ID | Item | Change class |
| --- | --- | --- |
| R1 | Close the -005 scoping loophole: every F_P dispatch is governed by instruction assembly law; absent instruction-assembly startup at an F_P boundary resolves to `blocked`. One clause. | `requirement_reprice` (small) |
| R2 | Ratify the A5 gates (wiring-proof, arm-census, fail-closed-default, constitutional-propagation, release-claim) as standing ticket law. **Open decision: home** — `specification_methodology` TICKET_METHOD (shared law; odd_glc/odd_sdlc inherit) vs an ABI-local standing non_closure template. | method ratification |
| R3 | Correct the GOALS.md RC4 paragraph to what RC4 ships (carry-through algebra, admission checks, digest-bound coverage refs — not live fold gating). | constitutional-surface edit |

Everything else is already commanded by ratified law: `-013`/`-037` mandate the B2 wiring ("assurance fold projection **shall consume** requirement proof coverage truth / proof-policy depth completeness **before requirement closure**"), `-036` condemns M3 ("`ProofStrengthAdmission` shall be F_D-checkable or adversarially verified" — a presence check is neither), `-016`…`-018` mandate M5's admission routing, and `SELECTION-APPLICATION-001` condemns M4 ("enumerate interface-conformant candidates… without making strategic choice" — a request seeded from the already-selected entry enumerates nothing). The constitutional algebra is ahead of the code everywhere except R1.

### A7.3 Code work, sequenced by dependency

**W1 — complete T-188 (the active ticket's own mandate; no new ticket).** Order matters: M5 produces what B2 consumes.
1. **M5**: route live F_P output admission through `admitRequirementProofCarryThroughOutput` on the runner's result path — this *produces* the admissions coverage is projected from (per -016…-018).
2. **B2-producer**: call `projectRequirementProofCoverage` over those admitted outputs in the edge-close path and thread `proofCoverageTruthRefsByRequirementId` into the fold call at engine_runner.ts:3653. For requirement-bearing edges, absent/ineligible coverage residualizes or blocks — the law already decides this (-013/-037); no design fork.
3. **M3**: resolve `proofStrengthAdmissionRefs`/`adversarialVerificationRefs`/`fdStrengthCriterionRefs` against the admitted ledger (existence + role + digest; adversarial refs bind to an admitted verifier-execution with passing outcome) before `deriveProofStrengthAdmitted` may return true (per -036).
4. **B3**: rework `test:t188:live` to engine-driven (depends on 1–3). The differential: an engine run with an uncovered obligation must **not** close; a mutation removing coverage must flip the disposition.
5. **M7**: reconcile the structural-carrier diagram with the flat carrier (design-pack edit inside T-188).

T-188's remaining gates are currently recorded in prose ("runtime assurance/proof-coverage consumption path" + "live installed-sandbox proof"); they should be restated as explicit non_closure items naming M5/B2/M3/B3 so closure cannot generalize past them.

**W2 — new ticket: fail-closed universal instruction assembly (B1 + M1 + M2).** Requires R1 first. Treat `not_configured` as `blocked` at both call sites (:5927/:6401 handle only `blocked` today); bind composed transform F_P tasks through the same `bindInstructionAssemblyForFpEffect` helper (M1); the non-tautology gate rides along to every arm (M2). Closure proof = the dispatch-site census test: enumerate every F_P dispatch arm, assert manifest binding on each. **Named cost:** `instructionAssemblyStartup` is optional on the engine request, so fail-closed flips every existing F_P-dispatching caller and proof lane — the migration (add startup config to all F_P proofs) is most of this ticket's work and is why the gap survived: opt-in was the path of least migration.

**W3 — new ticket: registry lookup from the contract boundary (M4).** Independent of W1/W2. Rebuild `RegistryLookupRequest` from the traversal edge's own required interface/source/target/authority refs instead of `registryEntryForExecutionBasis` (:3812/:3837). Closure proof = a differential that is impossible today: a non-conformant candidate is enumerated and **rejected**. Zero requirement work (SELECTION-APPLICATION-001 already condemns the current shape). This completes T-177's intent, which its closure claimed.

### A7.4 Sequence

`R3` (one paragraph, lands now) → `W1` steps 1-4 (completes T-188 honestly) → `R1` → `W2` (with migration) ∥ `W3` (independent) → `R2` (the one open decision: where the gates live). After W1, RC5 can claim what RC4 claimed — truthfully.
