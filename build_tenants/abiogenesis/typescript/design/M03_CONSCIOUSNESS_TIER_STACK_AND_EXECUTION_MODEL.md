# M03 Consciousness Tier — The Stacked Hierarchy And Computational Execution Model

- status: RATIFIED 2026-07-09 (user adjudication of D-1..D-4; T-217 design basis)
- derives_from: REQ-R-ABG3-FP-CONSCIOUSNESS (FPC-001..011), PRODUCT.md
  ("the reflective boundary"; the Phase-1 foundation laws), the ratified
  2026-07-09 session laws (intent-generation loop; same manifold /
  different observables; scenarios-are-fixtures; option-2 adjudication;
  workspace-is-reality), T-032 campaign forensics, T-217 consolidation
- governing_method: DESIGN_MODULE_METHOD — one authority per concern,
  explicit derivation, boundary classification, NO new fundamental
  particles (the zoo audit in §7 is normative)

## 1. Axioms (settled by prior ratification; restated as design inputs)

A1. REALITY: the workspace is the underlying reality — mutable,
    concurrent, forever changing; known ONLY through telemetry.
A2. MEASUREMENT: telemetry is point-measurement of a region of reality
    at an instant, by an attributed instrument; stale on arrival.
A3. RECORD: replay is the append-only MEASUREMENT RECORD — epistemic
    truth, never reality itself. Projections are models over it.
A4. VIEWS: every actor operates through a bounded, admitted view; a
    tier is a coordinate choice, not an ontological layer. Recursion is
    view restriction (narrower scope, finer resolution).
A5. TRANSITIONS: defects concentrate at chart boundaries (admission /
    fold seams) — invisible to any local evaluator in principle
    (T-032: 12/12 defects). The regulation tier is the view whose
    coordinates ARE the transitions.
A6. EFFECTOR: the regulation tier acts ONLY by ticket/reprice proposal
    behind F_H (FPC-007); local-loop tightening arrives as tier OUTPUT.
A7. DRIFT: model-vs-reality divergence is the default condition; the
    system bounds it by attributed measurement, single-writer mutation
    windows, and scheduled re-measurement — never assumes it away.

## 2. The building blocks (existing; nothing new at this layer)

STRUCTURAL (GTL): Graph, Node, GraphVector, Context (snapshot-bound
external constraint = the view binding), Operator, Evaluator,
GraphFunction, RefinementBoundary / CandidateFamily (the DECLARED
lawful sub-charts — recursion targets), Module, Job, Role.

RUNTIME (ABG): append-only events + admission at every ingress (the
measurement discipline), replay-derived projections (the models),
instruction envelope + FPC-003 observation snapshot (the rendered
view), ConstructionIntentCandidate + action catalog + priority/affect
policy + progress ledger (FPC-004..010), ZoomFrame + zoomed obligation
ledger (resolution refinement), graph-span foldback + reentry frontier
+ typed change_class routing (escalation), RecursiveContinuation +
ChildFrontier (tail recursion), OutputInstanceAllocation + write roots
(single-writer mutation windows), digest-bearing evidence with actor
attribution + the provenance-scoped ledger + kernel evidence mint
(instrument classes), retry allowlist + temporal properties (budgets).

ALGORITHMIC: the C-call step (render → dispatch → admit → evaluate →
consequence); retry/re-entry; coverage/fold gating; earned-depth
derivation; the campaign loop (halt → triage → ticket → fix → resume),
now to be interiorized.

## 3. The stacked hierarchy

Each level is a VIEW over the level(s) below, built ONLY from §2 blocks.

  L5  ATLAS / RATIFICATION            constitutional surfaces + F_H.
      (exists)                        Changes only via ticket action
                                      (TICKET_METHOD). Terminates the
                                      recursion: F_H ratifies chart/law
                                      changes; nobody holds the full
                                      manifold.
        ▲ ticket / reprice drafts           │ ratified law
  L4  REGULATION TIER (the new       the SAME step function as L3,
      PRODUCT; this design)          instantiated over L2 coordinates:
        L4a Observer                 gaps → intent → drafts (FPC-007)
        L4b Tuner                    atlas+instrument optimization →
                                     declaration drafts (§13.1)
        ▲ projections (read models)         │ (no downward control path;
  L3  WORK TIER (exists)              tickets re-enter L3 as work)
      C-call episodes over worksite
      views; recursion via published
      refinements; escalation via
      reentry/change_class
        ▲ admitted measurements             │ admitted actions (typed
  L2  MODEL LAYER (exists)                  │ worker turns; effect edges
      replay-derived projections:           │ in write territories)
      coverage, folds, gap/retry/
      reentry frontiers, ledgers,
      canary, cost/timing rows
        ▲ admission (transition maps)
  L1  MEASUREMENT LAYER (exists)
      append-only attributed events;
      digests; instrument provenance
      {worker-claimed | kernel-
      witnessed | F_H-attested}
        ▲ instruments (turns, digests, reports, stamps)
  L0  REALITY — the workspace. Mutable. Not a component; the referent.

Two invariants make the stack sound rather than decorative:
- SINGLE TRUTH: L2 views are projections with admission at the
  boundary, NEVER data forks. All levels share one record (L1).
- NO CONTROL PATH DOWNWARD from L4: its outputs are L5-bound drafts
  that re-enter L3 as ordinary admitted work. The loop closes THROUGH
  the manifold (reality → telemetry → model → gap → intent → ticket →
  action → reality), not through a command hierarchy.

## 4. The computational execution model

ONE universal step function at every tier — the existing C-call:

  step(frame):
    view      := render(projection over replay, envelope contract)   # F_D
    candidate := dispatch(F_P worker turn over view)                 # bounded (FPC-002)
    admitted  := admit(candidate payloads)                           # F_D, typed rejection
    verdict   := evaluate(F_P judgment inside typed boundary)        # calibrated instrument
    outcome   := consequence(verdict) ∈
                 { advance | retry | recurse | foldback | escalate }  # typed, total

Episodes are tail recursion over (continuation, child frontier); a
tier is DEFINED by three parameters of this one function — nothing else
differs:

| parameter | L3 work tier | L4a observer | L4b tuner |
|---|---|---|---|
| view coordinates | worksite assets, contracts, admitted priors | L2 projections: gap_stops, folds, frontiers, drift facts, cost rows, constitutional surface (the internal model) | L2 cost/timing/retry aggregates + -012/witness read models + replay shape statistics |
| action catalog (FPC-004) | constructive graph actions in write territories | { derive (read-model work), zoom (drill), draft ticket/reprice (escalate), request F_H } — NO constructive actions | { tune report, propose draft (declaration drafts only, §13.1), request ratification } |
| effector admission | artifact/payload admission (this wave's law) | draft admission: a ticket draft is ADMITTED DATA (owner, change_class, re-entry point, evidence refs) — malformed triage is a typed rejection | draft admission + equivalence-contract obligation on any F_P→F_D annealing proposal |

THE OBSERVER'S DECISION ALGEBRA (derived, not stipulated — it is
consequence() under the L4a catalog, and it matches FPC-007's outcome
set exactly):
- RESOLVE-IN-VIEW: the gap closes by derivation over existing
  projections (e.g. recompute, cross-check, classify) — no effector.
- DRILL: open a declared sub-view (ZoomFrame / refinement) on a run,
  vector, or turn — narrower scope, finer resolution; recursion, and
  it composes: drill again inside the drilled frame.
- ESCALATE: the gap is a transition/atlas defect — emit a triaged
  ticket/reprice DRAFT behind F_H. (The T-032 monitor's constitutional
  error was resolving-in-view what demanded escalation; the catalog now
  makes that unrepresentable: L4a has no constructive actions.)

SCHEDULING: event-driven, not polled. The observer episode wakes on
projection deltas — gap_stop, residual fold, terminal, retry-frontier
stall, drift-mismatch fact — via the existing pressure/frontier
machinery. The tuner wakes on episode/campaign close and on cost-ledger
thresholds. Idle tiers cost nothing.

TERMINATION AND PROGRESS: per-frame budgets (retry allowlist, temporal
properties) + the FPC-010 progress ledger applied TO THE TIER ITSELF:
same blocker + same material digest = stagnation → escalate, never
spin. Self-observation is lawful (the tier's replay is one more L2
region) but bounded by the same ledger — no navel-gazing loops.

COST MODEL: one F_P invocation is the unit of probabilistic compute
(FPC-002); F_D derivations are total and cheap; a view's serialization
IS the context spend, so view design is the economic surface. Session
affinity (T-110, Phase 4) = caching a rendered view across the steps of
one episode. Recursion depth is bounded by declared refinements.

RE-MEASUREMENT (the A7 realization): a scheduled GRAPH FUNCTION (an L3
job — not new machinery) re-digests declared evidence territories and
emits ordinary attributed measurement events; L2 derives drift facts by
comparing against recorded digests; drift facts are gap pressure the
observer wakes on. Hygiene = periodic metrology, expressed as work.

## 5. Module decomposition (one authority per concern)

| concern | authority (home) | notes |
|---|---|---|
| measurement discipline (attribution, digests, provenance classes) | abg/m03 contracts (payload ledger + event admission) — EXISTS; extended only by the T-215 witness event registrations | registrations into the existing closed event universe; not new particle classes |
| models/projections incl. drift facts, halt-diagnosis, citability predicate | abg/m03 contracts projections — EXISTS + new read models | read models only; replay-derived |
| the step function, recursion, foldback, reentry | abg/m03 runner — EXISTS, unchanged | the tier adds NO runner mechanics |
| observer/tuner products (node types, graph functions, catalogs, priority/affect policy, prompts-as-data) | a DECLARED product module (gtl://abg/consciousness/*), same shape as any odd_* product | domain vocabulary is lawful product content, not kernel particles |
| draft admission (ticket drafts, tune drafts, equivalence contracts) | abg/m03 contracts admission | the tier's effector gate |
| ratification workflow | TICKET_METHOD + F_H seat | unchanged method law |

## 6. Derivation table (requirement → design decision → realization)

| requirement | decision (this doc) | realization home |
|---|---|---|
| FPC-003 observation snapshot | the snapshot IS the view; observer's view = declared projection set + constitutional refs | product declarations + existing envelope machinery |
| FPC-004/-004A..E catalog law | per-tier catalogs as declared data (§4 table); L4a catalog contains no constructive actions | product module |
| FPC-005/-005A..E candidates + policy | observer emits ConstructionIntentCandidates ranked under a visible priority scheme; affect policy declared | product module + existing carriers |
| FPC-006/-007 admission + selection | draft admission (§5); consequence() outcome set = resolve/drill/escalate/F_H | contracts admission + runner (existing) |
| FPC-008/-009 lawful mechanics + replay-sufficiency | tier runs as ordinary episodes; every tier act is an admitted event | runner (existing) |
| FPC-010 progress ledger | applied reflexively to the tier (stagnation → escalate) | existing projection |
| T-206 walk (tuner family gap) | Phase 0 requirement_reprice: tuner verbs/drafts/ratification/equivalence as a NEW REQ family over EXISTING carriers | requirements + product module |
| T-215 rows (witness gap) | Phase 0 requirement_reprice: witness events as registrations into the closed event universe | requirements + contracts |
| A7 drift law | re-measurement as scheduled L3 work + drift facts as L2 read model | product job + projection |

## 7. The zoo audit (normative: rejected particles)

REJECTED — Measurement carrier: already exists as digest-bearing
attributed admitted events (this wave hardened provenance, mint,
supersession). The design names a DISCIPLINE, not a type.
REJECTED — View/ObservationScope carrier: already exists as instruction
envelope + FPC-003 snapshot + Context + declared projection sets.
REJECTED — supervisor node kind / monitor runtime / meta-scheduler: the
tier is ordinary episodes of the existing step function over a
different view; scheduling is the existing pressure/frontier machinery.
REJECTED — a second truth store for tier state: projections only.
ACCEPTED (bounded, pre-scoped): T-215 witness EVENT REGISTRATIONS into
the existing closed universe (reprice admission, operator F_H
lifecycle, hygiene stamps); the tuner/annealing REQUIREMENT FAMILY
(names verbs + draft states over existing carriers); product-layer NODE
TYPES for the consciousness module (userland vocabulary, the same class
as odd_glc's depth_proof_map types).

## 8. Decisions — RATIFIED (user, 2026-07-09)

D-1 RATIFIED: BOTH — wake on gap_stops, residual folds, terminals, and
     drift-mismatch facts; the FPC-010 ledger damps re-wakes on
     same-blocker/same-digest.
D-2 RATIFIED: BOTH — the T-032 ground-truth re-derivation AND a
     read-only live shadow (natural subject: the 4.5.1 frozen-law
     proving run) gate Phase 3 exit.
D-3 RATIFIED: (a) EVALUATOR CALIBRATION first (view-size reduction may
     ride if calibration lands early; annealing waits for one low-stakes
     equivalence-contract exercise).
D-4 RATIFIED: ALL-IN BUNDLED NOW — the consciousness module ships
     inside the substrate package on the 4.6 line from the first cut;
     the stable 4.5 line is the fallback for conservative consumers.
