---
id: T-200
title: HoG — the uniform C-call envelope; the monad as GTL-declared program
status: active
class: design_reframe + requirement_reprice
opened: 2026-07-06
design: build_tenants/abiogenesis/design/ABG_3_UNIFORM_C_CALL_ENVELOPE_DESIGN.md (RATIFIED §1-§15.2, incl. sovereignty by necessity)
requirements: specification/requirements/abg/REQ-R-ABG3-CCALL.md (-001..-014, Active)
absorbs: T-198 (frame-identity scoping, via -004)
progress: P0+P1 EARNED; P2 CLEARED AS VISIBILITY/PARITY CHECKPOINT (codex round 4 + user): all site brackets live (transform.F_P, evaluate.F_P/F_D, consequence x2, batch per-task, sub_traversal), injective digest cCallRef, closed-surface spine x5, resolver orphan-proof; granularity CONFIRMED spine-per-task; acceptance item 4 (one resolver entry) EARNS AT STRANGLER STEP 2; t200 15/15, suite 1110/1110
acceptance: §Acceptance below; T-200 closes on a fresh green standing gate carrying the -012 audit; the campaign's clean data-mapper run on the 4.4.0-rc.1 substrate closes T-195
---

# T-200: Heart of Gold

ABG is the code engine. GTL is the language. HoG.GTL is the
system-level composition — HoG IS ABG running HoG.GTL. One locus-only
spine per C call; fibres {F_D, F_P, F_H} as admitted interior; programs
as GTL-declared compositions over seven primitives; the baked bootstrap
triple as P0 and nothing richer in code.

## Problem (evidence)

One compute ontology in law, several in realization: evaluator sessions
invisible in replay (47 archived vs 30 evented, run 15); temporal gates
vacuous off the transform arm; per-arm retry detours; F_D defaults
patched with markers; dispatch_required as a transform-arm special
case; the edge program hidden inside an ~8k-line state machine.

## Execution plan (current, post-§15)

- **P1 — COMPLETE**: test:t200 7/7 (incl. the round-3 closed-key-set
  negative control); suite 1102/1102; factories/types/vocabularies
  exported via the contracts index.
- **P2 — the GTL-program interpreter (strangler; load-bearing)**
  - 2a GTL carriers for the C algebra: program declarations (roles,
    result-bearing role, fibre selections, proportionality) as typed
    rows in the conformance family; catalog identity `gtl://abg/hog/*`;
    startup admission fail-closed; census derives from the admitted
    program (role × fibre).
  - 2b `resolveCCall` interpreting the BAKED P0 TRIPLE (no GTL needed
    to boot); declared programs override per overlay/edge.
  - 2c spine emission wraps fibre interiors, in order: transform.F_P →
    evaluate.F_P (finding #11 dies) → F_D lanes (deterministic evidence
    per -012) → composed per-task spines with batchRef (-005) → F_H.
  - 2d construction/consequence inner runs become the first
    `sub_traversal` evidence rows (-013).
  - Differentials: parity on t072/t145/t146/t183 (event-count updates
    honest); archives≡replay on the p4 lane; NEGATIVE free-floating
    fibre event → drift diagnostic; program-membership enclosure check.
  - **GÖDEL CHECKPOINT: user reviews parity + audit evidence.**
  - **DECISION POINT (user): spine-per-task granularity confirmation on
    instrumented composed lanes.**
- **P3 — gates re-anchored**: five standing gates bind
  `c_call_fibre_selected` (single-event guards, -010); pre-envelope
  replay via the -011 adapter; m04 `pending` projection generalizes
  dispatch_required (named gap resolved). T-195 interlock: T-192 gate
  Rules re-authored on the constructor (cast retired). NEGATIVE:
  no_declared_check never satisfies. ALSO IN P3 (from checkpoint):
  evaluation-rule batch + fh_admit spines (their antecedents);
  enclosure standing witness (free-floating fibre event -> conformance
  diagnostic, red-path differential); evaluator EXTERNAL-session parity
  proven on live lanes; GTL catalog publication of program declarations.
- **P4 — retry law at the spine** (-009): arm-parity differential +
  NEGATIVE non-allowlisted blocks identically. T-195 interlock:
  coerceRuntimeBinding structural admission; stall-classification
  single module. odd_glc #5b guards retired at repin.
- **P5 — erase pass**: per-arm resolvers, C3 markers, dispatch_required
  specialness, PublicTerminalKind + transport-trio consolidation;
  enclosure witness over REAL t194 replay; erase register (design §6)
  checked off. Gate: full battery.
- **P6 — proof + closure**: -012 audit equality automated INTO
  test:t194:sandbox-live; substitution differential (evaluate F_P→F_D:
  identical spine shape, tags only). T-200 CLOSES on the fresh green
  gate.
- **P7 — RC ritual**: authored 4.4.0-rc.1 note (drift witnesses
  standing); earn set; sourceClean; snapshot; GOALS record (no
  active-ticket refs); toolchain install; odd_glc repin + campaign
  vector-16 sbt spawn-null fix (odd_glc-side); data-mapper live run on
  the envelope substrate → clean run closes T-195.

## Acceptance

1. archives ≡ external-work-bearing spine invocations, per arm/fibre,
   automated in the standing gate (-012); F_D calls carry deterministic
   evidence artifacts.
2. Fibre substitution changes tags/evidence class, never spine shape
   (-007 differential).
3. Gates non-vacuous on every arm that ran (-010).
4. One resolver entry; ZERO fibre names in spine code; ZERO tool names
   in substrate; nothing richer than the baked triple in engine code —
   all richer programs are admitted GTL (§15 stratification law).
5. Every spine level carries an admitted program identity (§10.1).
6. Full suite + t188/t189/t191/t192/t193 + t200 + gate sourceClean.

## Interlocks

T-195 remainder lands inside P3/P4 (named above); T-195 closes on the
clean data-mapper run. Backlog untouched by this RC: T-196, T-197,
T-199, T-201, T-202, T-203b — T-196/T-201 are consciousness-layer
organs (design §13; allocation-never-truth law §13.1) sequenced
post-RC with odd_sdlc T-166.

## Changelog (compressed)

Codex round 1 (5 findings): fibre-free spine via selection row;
full-identity cCallRef (absorbs T-198); spine-per-task;
no_declared_check; expanded ratification. Codex round 2 (5 findings):
antecedent IS the selection row (no temporal joins); PRODUCT/LAWS
amendment homes realized; manifests are fibre evidence; ticket collapsed
to current truth; -012 scoped to external-work-bearing calls. User
framings ratified into design §8-§15.2: monad-as-composed-workflow;
recursive boundary (-013); C-algebra generator set + compose closure
law; open programs (-014); tuning levers + proportionality-as-measure;
consciousness layer + solve/optimize law; campaign-hardened default
program as configuration; sovereignty by necessity (HoG.GTL).

## Non-closure

Weakened tests; fibre names in spine code; tool names in substrate;
free-floating fibre events on real replay; no_declared_check satisfying
a declared check; archives ≠ replay on any external-work-bearing arm;
engine code paths richer than the baked triple; a spine level without
admitted program identity; release claims citing active tickets.

## P2c SPLICE SPEC (execute next; facts verified at HEAD)

Transform.F_P bracket in `code/src/abg/m03/runner/engine_runner.ts`
(scalar_transform arm, armId literal at :6639):

1. OPEN — insert AFTER
   `eventState = emitRunnerEvents(eventState, instructionBinding.event);`
   (:~6671):
   construct `c_call_opened` via constructCCallOpenedEvent with locus:
   basisId = request.basis.id; graphCallId/frameId/graphFunctionId from
   the actor runtime scope used by constructActorInvocationStartedEvent
   (helper `actorRuntimeScope(actorInvocation)` in event_factories —
   reuse or mirror its field source); edge = transition.edge;
   vectorIndex = transition.vectorIndex; stageRole/armId from
   HOG_BOOTSTRAP_TRIPLE.stages[0]; attempt =
   actorInvocation.attemptIndex; taskOrdinal/batchRef null. Then
   `c_call_fibre_selected` {regime: "F_P"}. Emit both via
   emitRunnerEvents. Track `const transformCCall = { ref, evidence:
   [instructionBinding.manifest.manifestRef] }` in the attempt scope.
2. EVIDENCE — after the dispatch-candidate gate passes (:~6700) push
   the dispatch ref; after invocation events push invocation refs.
3. CLOSE (accepted) — at `attachedDecision.kind === "accepted"` block
   (:~6856, after `attachedDecision.payloadEvents` emission): emit
   c_call_evidenced (accumulated refs) + c_call_result_admitted
   {outcomeStatus from the dispatch outcome status, payloadRef from the
   attached payload ref} + c_call_judged {advance}.
4. CLOSE (rejected/blocked paths) — the payload-rejection and
   gate-block/terminal branches in the same region: judged
   {retry|blocked} with reasonRef null.
5. FALLOUT — event-sequence assertions gain spine kinds: expect red in
   test_t192_temporal_properties engine tests (exact batch kinds),
   t072/t145/t146 lanes, m03/m04 integration event lists. Update
   honestly (add the five kinds where the lane traverses the scalar
   arm); NEVER weaken semantics.
6. NEXT bracket: evaluate.F_P (armId at :7295; disposition exits
   :7522 retry / :7745 blocked / :7810 accepted) — closes finding #11.
7. THEN: -012 audit script (sessions==spine) into the t194 gate lane.

Tree state at spec time: GREEN — t200 13/13, semantic 1108/1108, all
P2a/P2a.2/P2b committed.

## P2 GÖDEL CHECKPOINT EVIDENCE (real installed run, t194 gate 20260706T061918155Z, sourceClean=true)

Spine integrity: 6 opened = 6 selected = 6 evidenced = 6 admitted =
6 judged; ZERO orphan spine rows (enclosure holds on real replay).
Triple-per-edge exact: 2 edges × 3 C calls = 6 spines.
Fibre distribution exact: 4 F_P (transform+evaluate ×2 edges) + 2 F_D
(consequence ×2) — matches the baked triple's declaration precisely.
Judgments: 6/6 advance (clean run); 5 temporal verdicts; 1 terminal.
External-session parity (-012): 2 external worker sessions == 2
transform.F_P spines. HONEST ASYMMETRY: evaluate.F_P interiors carry no
invocation events yet (in-process plugin evaluation here; on live lanes
the evaluator's external session now has a spine to reconcile against —
interior enrichment lands with P3/P4).
Deferred families (reasoned): evaluation-rule batch spine (P3, with its
gate antecedents); retry-branch bridge covered via finish() sub_traversal.
