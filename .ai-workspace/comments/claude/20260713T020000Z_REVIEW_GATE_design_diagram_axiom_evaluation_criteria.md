# REVIEW GATE: Design-Diagram Evaluation Criteria Against The Axioms

**Type:** REVIEW-GATE criteria (commentary — the operational checklist the
reviewer seat will apply; ratification into method law is F_H/writer work).
**Author:** claude · 2026-07-13
**Authority:** F_H mandate 2026-07-13: *"going forward i need a mandatory
mermaid diagram that shows 1. the domain model, 2. sequence diagram, 3. the
state machine — this will force a disambiguation… the design can then be
evaluated against our AXIOMS — and then coding can continue."* Back-fill
ordered for all now-completed code.
**Calibration case:** commit `945b5a2` (rejected). Each criterion below names
how it would have caught that failure at design time — the criteria are
failure-derived, not invented.

---

## 0. The gate, stated once

No realization ticket proceeds to code until its design carries all three
mermaid diagrams and each has passed the axiom evaluation below. The diagrams
are DESIGN surfaces (HOW), living with the ticket/design record — they do not
outrank specification, and prose cannot substitute for them: the diagrams
exist precisely because prose lets category errors hide.

## 1. Domain model (`classDiagram` / `erDiagram`) — ownership disambiguation

Every entity on the diagram must carry its **owning layer** as a stereotype:
`<<GTL declaration>>`, `<<ABG runtime aggregate>>`, `<<ABG contract/atom>>`,
`<<odd_* domain declaration>>`, `<<F_P artifact>>`, `<<F_H act>>`.

Checks (each names its axiom):

- **D1 — No homeless entities.** An entity that cannot name a lawful owner
  layer is the disambiguation trigger — design stops until it has one.
  *(Three-layer ownership.)* — `945b5a2`: "ConsensusRound, owned by an engine
  plugin" has no lawful stereotype; caught here.
- **D2 — Constructive carriers are graph entities.** Anything named
  "GraphFunction" must decompose on the diagram into Graph/GraphVector/Node/
  declared boundaries — a GraphFunction entity with no graph children is a
  nameplate. *(ODD carrier law.)* — would have exposed the empty nameplate.
- **D3 — New engine entities demand justification.** Any new
  `<<ABG runtime>>` entity must cite which atom-criterion gap it fills and why
  no free construction suffices. *(Atom criterion: higher-order networks
  require no new engine law.)* — would have forced "why is a consensus panel
  new engine law?"
- **D4 — Truth entities are replay-derived.** Ledgers, registers, results,
  decisions must show their derivation edge from admitted events — a truth
  entity with a mutable-store edge is a rival ledger. *(Replay-is-truth;
  read models never rival.)*
- **D5 — Declarations are data.** Policies, profiles, panels, budgets appear
  as declaration entities consumed by the runtime — never as code entities
  owning behavior. *(Declarations-as-data; policy is input, not engine.)*

## 2. Sequence diagram (`sequenceDiagram`) — interaction lawfulness

Lifelines are restricted to lawful actors: `GTL program surface`,
`ABG engine`, `F_D fold`, `F_P worker turn`, `F_H gate`, `plugin (named
authority)`, `abg.cli / SDK caller`, `workspace`. Every arrow must be
authorizable by an axiom on request.

- **S1 — Prompts render only from the engine.** Any arrow where a plugin or
  product code assembles a prompt is a local prompt shell. *(Installed-context
  prohibition: no local prompt shells.)* — `945b5a2`: `plugin → reviewerPrompt()`
  is drawn, and dies, here.
- **S2 — Fan-out is traversal.** Parallel work over declared items must
  appear as engine-traversed vectors/subwork (GraphCall/Frame per item), not
  as a loop inside one lifeline. *(No local traversal loops; scenario 05
  aggregate law.)* — the reviewer fan-out inside one plugin dispatch is
  visible as a self-loop; caught.
- **S3 — Execution lives in the F_P turn.** Builds/tests/generation arrows
  originate from the worker-turn lifeline and return typed results for
  admission; the framework never invokes the subject toolchain. *(EXECUTION
  DEFAULT.)*
- **S4 — Closure arrows end at ABG or F_H only.** No plugin, worker, or
  product lifeline may emit a closure/status arrow. *(Plugin authority limits;
  review-never-owns-status.)* — plugin-side `reduce → outcome` classification
  becomes visible as a closure arrow from a plugin; forced to move behind a
  declared evaluator surface or an ABG fold.
- **S5 — Admission before consumption.** Every artifact crossing from an F_P
  lifeline passes through an `admit` arrow before any consumer reads it.
  *(Evidence provenance; payload law.)*
- **S6 — Every message is typed.** Arrows carry contract refs, not prose.
  *(Typed carriers; closed vocabularies.)*

## 3. State machine (`stateDiagram-v2`) — truthful state and transition law

- **M1 — States are replay-derivable.** Each state names the event(s) that
  witness it; a state with no witnessing event is hidden controller memory.
  *(Event-authoritative aggregates; scenario 05/06.)*
- **M2 — Transitions name their authorizing law.** Operator, evaluator, rule,
  hook, policy, or F_H act — per transition. A transition authorized by
  "code" fails. *(Governed transition surfaces; scenario 02.)*
- **M3 — Recursion is declared.** Iteration/rounds appear as declared graph
  recursion with explicit termination and foldback law — not as engine retry
  re-entry. *(REQ-L-GTL3-RECURSE: "expose termination and foldback without
  hidden interpreter strategy.")* — `945b5a2`: rounds-as-engine-retries cannot
  be drawn as lawful states; the diagram forces either declared recursion (a
  graph) or an honest admission of the hack. Caught.
- **M4 — Terminals are truthful.** Every terminal state maps to a typed
  terminal transition (`converged`, `gap_stop`, `human_gate_required`, …) —
  no soft-flag exits. *(Truthful stop/hold/gap law.)*
- **M5 — Human gates are states, not annotations.** F_H adjudication appears
  as an explicit state whose exits are F_H acts. *(F_D/F_P/F_H boundary; the
  scarcest resource is modeled, not implied.)*
- **M6 — Budgets bound the machine.** Round/retry budgets appear as guard
  conditions on transitions with a declared exhaustion state. *(Bounded
  sub-work; declared round budget.)*

## 4. Cross-diagram consistency (the disambiguation payoff)

- **X1 —** Every domain entity that appears in the sequence diagram carries
  the same owner stereotype in both.
- **X2 —** Every state-machine transition appears as at least one sequence
  arrow whose lifeline may lawfully cause it.
- **X3 —** Every typed vocabulary on any diagram (`closed_done | recurse |
  escalate_fh`, ruling kinds, dispositions) must already exist as declared
  closed vocabulary, or the design names the declaration it will add — no
  diagram-invented enums.
- **X4 — The gap register.** Anything the design CANNOT express in GTL/graph
  terms is recorded on the design as a typed gap (candidate demand signal for
  missing atoms — e.g. `C.batch`/`C.retry`/`workflow.C`), never silently
  realized in imperative code. The gaps are the discovery output the campaign
  model consumes; hiding them in a plugin is the `945b5a2` failure.

## 5. Evaluation protocol

1. Writer attaches the three diagrams to the design leaf (mermaid source in
   the ticket/design surface, rendered or renderable).
2. Reviewer applies D1–D5, S1–S6, M1–M6, X1–X4; each check gets pass /
   fail-with-line / not-applicable-with-reason. Findings classify per
   DEC-5.0-PROP-001 ruling #8.
3. **Fail on any D/S/M/X check = design does not proceed to code.** The gate
   is the disambiguation, not the reviewer's taste: a failed check means the
   design is ambiguous or unlawful at a named point.
4. F_H evaluates the passed design against the AXIOMS for ratification; only
   then does coding continue.
5. Back-fill: completed code gets the same three diagrams drawn FROM the code
   as-built; every check that fails on the as-built diagram is a typed defect
   row (fix, reprice, or accept-as-debt — F_H's ruling). The rejected
   `945b5a2` is the calibration case and should be back-filled first: its
   as-built diagrams document the anti-pattern; its lawful redesign's diagrams
   become the first artifacts through the gate.

## 6. Boundary

Reviewer-seat criteria, derived from the constitution as it stands (verbatim
citations noted per check) and from one calibrated failure. Not law until
ratified: where the mandate lives (repo DESIGN_MODULE_METHOD vs shared
specification_methodology) is F_H's call — per the workspace rule, shared law
lands upstream first. The criteria will be revised as the first back-fill
rounds expose gaps in the checks themselves.
