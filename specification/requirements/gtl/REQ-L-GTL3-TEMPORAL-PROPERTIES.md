# REQ-L-GTL3-TEMPORAL-PROPERTIES — GTL Temporal Property Law

**Status**: Active

GTL declares temporal-logic properties over the ABG event trace as a Rule
kind. ABG checks them as total deterministic functions over finite replay
traces with three-valued verdicts. This family is the dynamic enforcement
half of the authoring-loop law (`REQ-L-GTL3-LAWS`); the static half owns
authoring diagnostics.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-001**: A temporal property is a GTL `Rule`
with `kind: "temporal_property"`. The property formula, consequence class,
gate point, and identity travel as data in `Rule.config`. The property layer
introduces no rival GTL ontology: no new first-class structural type, no
second rule surface, and no property carrier outside `Rule`.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-002**: Property atoms quantify over the
replay trace only. An atom is either an event-occurrence atom (an admitted
runtime event kind, optionally guarded by field-equality pairs) or a
fluent-hold atom naming a fluent from the one runtime event-calculus
vocabulary (`RUNTIME_FLUENT_NAME_VALUES`). Properties shall not quantify
over node state, workspace state, worker output shape, or any surface not
derived from admitted replay events. New propositions enter by extending the
one fluent vocabulary with axioms in the one event calculus, never by a
second vocabulary.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-003**: The formula grammar is a closed
operator set: boolean `not`, `and`, `or`, `implies`; past-time `yesterday`,
`once`, `historically`, `since`; future-time `next`, `eventually`,
`globally`, `until`. An unknown operator, malformed formula, or unknown atom
fails admission closed with a typed issue; it shall not degrade to a
vacuously satisfied property.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-004**: Verdicts are three-valued over the
finite trace: `satisfied`, `violated`, `undetermined`. Past-time formulas
evaluate stepwise and are decidable at every step. Future-time obligations
that the finite trace has not yet decided are `undetermined`, never
implicitly satisfied and never implicitly violated. Satisfied-by-default at
end of trace is masquerade.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-005**: Vacuity is first-class. For an
implication-shaped property the checker counts antecedent witnesses; a
verdict with zero witnesses is `vacuous`, and a vacuous verdict shall not
count as `satisfied` for any gate, closure, release, or downstream
interpretation. Witness counts are carried on the verdict.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-006**: Every property declares a
consequence class. `safety_gate` properties must be past-time decidable and
may block online at their declared gate point. `liveness_residual`
properties never block: `violated` and `undetermined` verdicts route to
residual pressure through the existing residual carriers. A liveness verdict
that blocks traversal, or a safety verdict that silently passes on
violation, is unlawful.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-007**: Gate points are declared, closed
vocabulary: `dispatch` (evaluated against the trace prefix before an F_P
dispatch arm fires; a violated safety property blocks that dispatch with a
typed reason) and `closure` (evaluated at edge close; a violated safety
property contributes no-close pressure). Blocking is replay-visible; a
property-blocked step names the property and the implicated refs.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-008**: Property verdicts are typed,
replay-visible carriers emitted through the canonical event path: a verdict
event preserves property ref, formula digest, verdict status, vacuity,
witness count, implicated event refs, evaluation point, and replay identity.
Verdicts are projections over admitted events; they shall not re-derive or
write residual, continuation, coverage, or closure truth — they read those
surfaces and report against them.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-009**: The GTL module `rules` list is the
authoring home for temporal properties. Runtime ingress is the engine-start
passthrough family (one authority; every public seam forwards it) until the
execution basis carries module rules directly — basis-carried rules are the
named successor, and a second ingress side-door is unlawful. Startup
admission of a property set is fail-closed per `-003`.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-010**: The standing audit gates are the
first declared property set: dispatch-requires-manifest lineage,
closure-requires-coverage on declared carry-through edges, no worker
invocation without admitted startup, rejected payloads mint no coverage
truth, and selection-requires-authority. Enforcement follows proof: a
property gates only after it carries a mutation differential (trace edit
flips `satisfied` to `violated`), a vacuity differential (witness removal
yields `vacuous`, not `satisfied`), and — for `liveness_residual` — an
undetermined-routing differential (no block, residual pressure present).

**REQ-L-GTL3-TEMPORAL-PROPERTIES-011**: The property checker is a total
deterministic function over the finite replay trace and the declared
property set. It consumes the one event-calculus projection for fluent
atoms. Checker outcomes are typed; a checker error is a blocked evaluation
with a typed reason, never a silent skip.

**REQ-L-GTL3-TEMPORAL-PROPERTIES-012**: This family leaves the T-119
scheduling-law census disposition unchanged: scheduling enforcement remains
typed-exempt pending the timer-provider seam. Temporal properties quantify
over traces, not clocks, and introduce no wall-clock reads.
