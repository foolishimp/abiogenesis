---
id: T-200
title: Uniform C-call envelope — the single compact traversal monad
status: active
class: design_reframe + requirement_reprice
opened: 2026-07-06
supersedes: backlog/T-200-composed-arm-dispatch-gating.md (mandate + algebra + findings carried in)
acceptance: see §6 invariants; user evaluates §2-§5 BEFORE realization begins
---

# T-200: One C-Call Envelope ("Heart of Gold")

## 1. Problem (evidence-grounded)

The engine has one ontology for traversal compute in law and several in
realization. Per the governing algebra (user, ratification-candidate):
traversal A→B carries compute C as a tuple over fibres {F_D, F_P, F_H};
each edge internally makes THREE C calls (transform, evaluate,
consequence); plugins select the fibre per call — all-F_D degenerates to
a workflow engine, all-F_H to a human process. The functor property
demands SHAPE-PRESERVING truth under fibre substitution. Today only
transform.C at F_P has the full envelope. Evidence: run-15 audit — 47
paid F_P sessions, 30 replay-visible invocations (evaluate arm invisible,
~36% undercount); temporal dispatch gates vacuous off the transform arm;
evaluator transport failures bypass the one retry allowlist; F_D defaults
patched with ad-hoc vacuity markers (T-195 C3); dispatch_required is a
transform-arm special case.

## 2. Design — the fibre bundle, used correctly

Base category: edges (A→B) × stage roles. Fibre: the regime instantiation
of one C call. The ENVELOPE is the object that lives in the BASE — it is
fibre-INDEPENDENT and identical for every C call. Only the envelope's
EVIDENCE INTERIOR lives in the fibre. Correct fibre use means: nothing in
the spine may mention a fibre; nothing in a fibre may mint spine truth.

### 2.1 The spine (uniform event skeleton, one per C call)

```
c_call_opened      {cCallRef, basisId, vectorIndex, stageRole, regime,
                    armId, manifestRef|null, attempt}
c_call_evidenced   {cCallRef, evidenceClass, evidenceRefs[]}   (0..n)
c_call_result_admitted {cCallRef, outcomeStatus, payloadRef|null,
                    responseContractRef|null}
c_call_judged      {cCallRef, judgment: advance|retry|pending|blocked|
                    escalated, reasonRef|null}
```

`cCallRef = c-call:{basisId}:{vectorIndex}:{stageRole}:{attempt}`.
The spine is THE dispatch-gate antecedent, THE retry-law subject, THE
cost-audit unit, for every arm and every fibre.

### 2.2 The fibres (evidence interiors — existing families, demoted)

- F_P: fp_dispatch_requested, actor_invocation_*, payload_*, response
  contract events — unchanged kinds, now REQUIRED to be enclosed by a
  spine instance (evidenced-by, never free-floating). Pending external
  actor = `c_call_judged{judgment: pending}` — dispatch_required becomes
  the m04 PROJECTION of a pending F_P C call on ANY arm.
- F_D: execution/command evidence (deterministic runs), or
  `evidenceClass: "default"` for the degenerate fibre — the T-195 C3
  vacuity markers are RETIRED; absence-of-declared-checks is an honest
  envelope with default evidence, not a magic ref string.
- F_H: fh_escalated/approval evidence; judgment: escalated.

### 2.3 The monad, compacted

One resolver replaces the per-arm effect zoo:

```
resolveCCall(stageRole, regime, input) -> CCallOutcome
```

Engine iterate = fold over planned vectors; bind = sequence of three
resolveCCall applications (transform, evaluate, consequence), each:
open → resolve fibre (plugin seam or engine-internal F_D) → admit →
judge → (retry law at the spine). The existing effects
(fp_dispatch/fp_evaluate/fd_evaluate/consequence_project/composed_*)
become internal fibre dispatch inside resolveCCall; the T-190 armId
census is preserved as the (stageRole × fibre) census and asserted at
the ONE entry.

## 3. Erase list (tech-debt eliminated by construction)

1. Evaluate/composed-arm invisibility (finding #11) — spine covers all.
2. C3 vacuity marker refs — replaced by degenerate-fibre evidence.
3. dispatch_required transform-arm specialness — pending on any arm.
4. Per-arm retry classification detours — allowlist consumed at spine.
5. Vacuous temporal gates off-transform — gates read c_call_opened.
6. The five per-arm effect resolvers — one resolveCCall.
7. Sessions-vs-replay divergence — impossible by construction.

## 4. Requirements to ratify (P0, before any code)

REQ-R-ABG3-CCALL-001 uniformity: every C call emits exactly one spine.
-002 shape preservation: fibre substitution changes tags/evidence class,
never spine kinds or order. -003 enclosure: fibre evidence events are
lawful only inside an open spine. -004 antecedent: dispatch-point
temporal properties bind to c_call_opened{regime:F_P}. -005 pending:
external-actor waiting is a judgment, arm-independent. -006 degenerate
fibre: default/absent plugins emit honest default-evidence envelopes.
-007 retry: the one allowlist judges spine outcomes. -008 census:
(stageRole × fibre) arms are registry data, asserted at resolveCCall.
-009 replay compat: pre-envelope ledgers project a derived spine at
read time (projection adapter); no synthetic events enter truth.

## 5. Execution plan (review-react checkpoint after each phase)

- P0 ratify §4 family + amend TEMPORAL-PROPERTIES-007 (gate points) and
  the PRODUCT.md compute-tuple rider. CHECKPOINT: user reviews design.
- P1 carriers + factories + admission for the four spine kinds +
  cCallRef discipline. Differentials: admission axes, enclosure law.
- P2 resolveCCall behind a strangler seam: old resolvers delegate, spine
  emitted around existing interiors; parity differentials (every t072/
  t145/t146/t183 lane green with spine present; event-count assertions
  updated honestly). CHECKPOINT: Gödel review of parity evidence.
- P3 temporal gates re-anchored to spine antecedents; the five standing
  gates re-proven; composed/evaluate arms gain non-vacuous witnesses.
- P4 retry law at the spine; evaluator transport failures join the
  allowlist; #5b-class binding catches retired upstream.
- P5 erase pass: remove per-arm specials, markers, old direct paths
  once P2-P4 differentials hold. Drift witness: no free-floating fibre
  events (enclosure checked over real replay).
- P6 proof: t194 gate + data-mapper live run. Acceptance measured.
- P7 cut 4.4.0-rc.1 (the envelope release); odd_glc repin; campaign
  resumes on the uniform substrate.

## 6. Acceptance invariants (user-stated, measured at P6)

1. sessions-in-archives == c_call spine invocations in replay, every
   arm, every fibre (run-15 style audit, automated into the gate).
2. Fibre substitution differential: same scenario with evaluate.C
   flipped F_P→F_D fixture produces IDENTICAL spine shape, tags only.
3. Temporal dispatch gates non-vacuous on every arm that ran.
4. One resolver entry; zero fibre names in spine code; zero tool names
   anywhere in substrate (standing T-030 boundary law).
5. Full suite + t188/t189/t191/t192/t193 + gate sourceClean.

## 7. Named risks

Event-count/order assertions across the 1095-test suite (updated
honestly, never weakened); m04 public-outcome mapping for pending;
legacy replay projection (REQ -009) correctness; composed batch = one
spine per stage-task vs per batch (DESIGN DECISION for user: default =
one spine per C call, batch tasks as evidenced interior rows).

## 8. P0 Amendments — codex round 1, all five findings accepted

8.1 (High, ACCEPTED) The spine was self-violating: regime/armId sat in
c_call_opened and REQ-004 bound gates to a spine field. AMENDED: the
spine identifies the CALL LOCUS ONLY. Fibre selection is the first
interior row, itself admitted truth:

```
c_call_opened        {cCallRef, basisId, graphFunctionId, graphCallId,
                      frameId, edge, vectorIndex, stageRole,
                      taskOrdinal|null, attempt, manifestRef|null}
c_call_fibre_selected{cCallRef, regime, armId, compositionRef|null}
```

REQ-004 rebinds: dispatch-point antecedent = c_call_opened JOINED with
its fibre-selection row where regime=F_P (temporal where-guards already
express joins). Substitution now changes ONE interior row's payload;
spine kinds and order are fibre-free by construction, not by discipline.

8.2 (High, ACCEPTED) cCallRef rescoped to full replay identity:
`c-call:{basisId}:{graphCallId}:{frameId}:{vectorIndex}:{stageRole}:
{taskOrdinal|-}:{attempt}` with graphFunctionId/edge/compositionRef as
fields — recursive frames, repeated graph calls, and composed tasks
cannot collide. This REALIZES T-198 (frame-identity scoping) inside
T-200; T-198 closes into it.

8.3 (High, ACCEPTED — supersedes the §7 reserved default) One spine per
stage-TASK that can invoke a worker/plugin; the batch is a parent
grouping ref (batchRef field), never the counted call. The §6.1
invariant (sessions == spine invocations) now holds by construction for
composed batches. User may override at P0 evaluation.

8.4 (Medium, ACCEPTED) Judgment vocabulary gains `no_declared_check`,
distinct from advance: {advance, retry, pending, blocked, escalated,
no_declared_check}. Law (new REQ -010): no_declared_check is NEVER
gate-satisfying and NEVER satisfies an edge that declares required
checks — it advances only where nothing demanded the check (mirrors
T-192 vacuous-never-satisfies). This reconciles T-195 C3 with the
degenerate fibre: absence is honest, visible, and cannot masquerade as
judgment.

8.5 (Medium, ACCEPTED) P0 ratification expanded. Requirement homes:
NEW specification/requirements/abg/REQ-R-ABG3-CCALL.md (-001..-010);
AMEND REQ-L-GTL3-TEMPORAL-PROPERTIES-007 (gate points = spine+fibre
join), the retry-law clause (allowlist judges spine outcomes), the
instruction-assembly family (manifestRef binding per C call), PRODUCT.md
compute-tuple rider. Derives-from: T-190 census, T-192 temporal law,
T-188 carry (payload admission unchanged, enclosed), T-195 C3/C4
adjudications, T-030 boundary law. Non-closure proof commands:
test:semantic, test:t188, test:t189, test:t192-lane, test:t193-lane,
new test:t200 (spine admission + enclosure + substitution differential +
archives==replay audit), test:t194:sandbox-live, and the odd_glc
data-mapper live lane on the envelope release.

STATUS: design amended; awaiting user P0 evaluation before realization.
