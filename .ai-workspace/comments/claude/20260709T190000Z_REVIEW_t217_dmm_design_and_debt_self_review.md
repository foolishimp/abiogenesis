# T-217 deep self-review: DMM design lens + codebase debt lens (2026-07-09, commentary — not law)

Scope: the consciousness-wave design surfaces under DESIGN_MODULE_METHOD
(one authority per concern, explicit derivation, compression,
single-surface truth) and a tech-debt census of the delivered code.
Companion to the parallel codex round.

## Lens 1 — the design under DMM

**D-1 HIGH (authority flow): the session-allowlist law has no
requirement anchor.** Ratified into design SS8 and the ticket
(2026-07-09) — the allowed graph-function set as an admitted initial
condition of the root frame — but zero grep hits across
WITNESS/TUNER/FPC families. Design derives from requirements; a
ratified design law without a constitutional parent inverts the flow.
OWED: a requirement_reprice row — WITNESS-009 refinement or new row:
the session's allowed set is an ADMITTED initial condition of the root
frame; enforcement at selection/admission; inherited down recursive
frames (narrowing only); violations fail closed as selection
rejections; the full catalog remains declared module truth (FPC-004
preserved).

**D-2 MEDIUM (explicit derivation, staleness): the design doc's
realization truth predates the delivered wave.**
- SS6 derivation table names ZERO of the six delivered contract modules
  (declaration_reprice, run_segments, workspace_hygiene,
  halt_diagnosis, defect_intake, replay_attestation), none of the five
  operator routes, not the diff-execution gate.
- SS5 decomposition says contracts are "extended only by the T-215
  witness event registrations" — eight witness kinds now exist
  (reprice, segment, resumed, stopped, hygiene, intake, attestation +
  the conflict/fork law) plus read models.
- SS5/SS6 claim "abg/m03 runner — EXISTS, unchanged; the tier adds NO
  runner mechanics" (line 178) — literally false: the runner gained
  the reprice guard, the fork guard, and segment-stamp emission. The
  truthful law: ADMISSION GUARDS at the startup boundary, zero
  traversal-mechanics change. That distinction is load-bearing and
  should be stated, not blurred.
- DMM disposition (compression over boilerplate): refresh the ONE wave
  doc's SS5/SS6 tables with the realization map rather than minting six
  per-module *_DERIVATION.md docs — the modules are small,
  requirement-annotated, and share one design basis; the table is the
  compressed single surface. State that choice explicitly in the doc.

**D-3 MEDIUM (single-surface truth): the ticket carries a live-looking
copy of dead design prose.** The T-217 "holistic ontology &
epistemology" section (~70 lines) was ratified INTO design SS8-SS9;
the ticket copy is history but reads as live law (769-line ticket).
FIX (one line): banner the section "ratified into design SS8-SS9 —
the design doc is the live authority; this copy is intake history" so
future edits cannot land in the dead copy. PRODUCT.md and the
requirement families are constitutionally DISTINCT statements
(different layers of the authority flow), not duplication — no action.

**D-4 LOW: GOALS Phase 6 wording predates the mechanical predicate.**
"zero monitor law-repairs" is now WITNESS-004's "zero admitted reprice
events" + the citability predicate. Consistent in meaning; cite the
predicate at the next GOALS touch so the gate reads mechanical.

**D-5 LOW: the SS7 zoo-audit accepted list is narrower than delivered.**
It accepts "T-215 witness event registrations"; the wave also
registered replay_log_attested (T-211-sourced) and the fork/conflict
law rows. All are the same witness-registration CLASS — name the class
and count so the audit stays exhaustive.

**D-6 (holds):** no rival ontology surfaced; every delivered module
header cites its requirement IDs; the self-certified-ref discipline is
uniform across all seven minted identities; the no-new-particles law
held through five slices and four hostile rounds — every addition is a
registration, a read model, a guard, or a route over existing carriers.

## Lens 2 — codebase debt census (10 probes, 251 source files)

Marker hygiene is clean (P2: ZERO TODO/FIXME/HACK in code/src) — the
debt below is structural and unmarked; this census is its marker.

**C-1 STRUCTURAL (P8): eight event kinds carry no basis/run scope** —
the registry publication family (entry admitted/rejected, plugin
advice x2), graph-function selection x2, node-type satisfaction, and
workspace installation. They pass every basis filter, so shared stores
blend them across runs (the S2-e1 governing-set fold and the S5 fork
scan both lean on this null-scope behavior deliberately; the hazard is
everything else). The runtimeEventBasisId extractor exists and is
itself dead. DISPOSITION: Phase 2 kernel boundary — add scope refs or
per-run registry scoping; requires an EVENTS-family reprice (4.5-line
carrier shapes).

**C-2 STRUCTURAL (P3): two monoliths.** gtl_program_conformance.ts
14,133 lines; engine_runner.ts 10,241 lines / 135 internal functions /
5 real entry points / one ~8,700-line export gap, accreting FP
dispatch + FD authority + composed-stage execution + instruction
assembly + assurance gating + actor lifecycle + candidate selection.
DISPOSITION: Phase 2 — split by concern behind the 5 entry points;
section-banner the conformance file as interim.

**C-3 STRUCTURAL (P4): helper duplication WITH SEMANTIC DRIFT.**
freezeStringArray x24 (canonical exists in runtime_support, imported
5x) in four genuinely different variants; assertNonEmptyString x10
with return-type drift; isRecord x6. A blind merge is UNSAFE —
signatures must be reconciled first. DISPOSITION: Phase 2
commonization rider, inventory attached.

**C-4 STRUCTURAL (P9): the process-global admission ordinal**
(emit.ts:16) — every ordering consumer transitively assumes one
process-global monotone counter; no store/run-scoped emitter context
exists. Same seam as the T-195 caller-context flag and the attestation
follow-up. DISPOSITION: Phase 2 — store-scoped emitter handle threaded
through emit.

**C-5 STRUCTURAL (P7): ~8 test-side ExecutionBasis reconstructions**
across the t217 suite mark a missing kernel API: derive a
route-invocable basis identity from replayed basis_admitted truth.
DISPOSITION: small kernel API (rides S6 or Phase 2); delete the
per-test reconstructions.

**C-6 STRUCTURAL (P5): barrel over-export.** contracts/index.ts
re-exports 1,053 identifiers into the public package API; 372 have
ZERO consumers anywhere (product, tests, downstream) and 149 more are
test-only. DISPOSITION: split genuine public carrier types from
internal *Row/*Issue/*Kind implementation types; verify against
external installs before pruning; release-hygiene item.

**C-7 (P10): exactly two env-steering reads** — ABG_TS_CODEX_MODEL and
ABG_TS_CODEX_SANDBOX (transport_contracts.ts:93,101) — the literal
WITNESS-010 target ("env steering becomes declared command
arguments"). DISPOSITION: promote to declared transport verb arguments
with the grammar realization (Phase 2); the other 10 process.env reads
are lawful spawn passthrough.

**C-8 HYGIENE (P6): t217 fixture inlining with drift** —
t217Declaration x2 signatures, startupConfig x2 forms, across 7 test
files. DISPOSITION: hoist into support/ before S6 authors more.

**C-9 HYGIENE (P1): as-unknown-as is down to 7 in code/src** — five
are the guarded CLI ingress narrowings (accepted as incremental per
codex P2b), one is temporal_properties.ts:397 dynamic-field gymnastics
(replace with a typed accessor at next touch).

## Combined verdict and fix ordering

DISCHARGED WITH THIS REVIEW: D-1 (WITNESS-015 anchors the
session-allowlist law — the authority flow is restored), D-3 (the
ticket's synthesis copy is bannered as intake history), D-5 (the zoo
audit names the eight-kind witness-registration class).

AT PHASE 1 EXIT (blocking the exit evidence): D-2 — refresh the design
doc's SS5/SS6 tables with the delivered realization map, including the
truthful runner statement (admission guards at the startup boundary,
zero traversal-mechanics change). C-8 fixture hoist before S6.

PHASE 2 (the kernel-boundary/cleanup phase, which already owns T-208
commonization, T-209 remainder, D3 eviction): C-1 event scoping
(+EVENTS reprice), C-2 monolith splits, C-3 helper reconciliation,
C-4 store-scoped emitter (with the T-195 flag), C-5 basis-from-replay
API, C-7 env-to-verb promotion (grammar), the
latestAdmittedEventsPerEdge ordinal sweep (already routed), C-9's
temporal accessor.

RELEASE HYGIENE (4.6 cut prep): C-6 barrel split after external-install
verification.

D-4 rides the next GOALS touch. The wave's own discipline held: zero
unmarked-debt markers because every deferral was ticket-recorded; the
census found structure, not surprises.
