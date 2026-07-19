# REQ-R-ABG3-FN-COMPOSITION — ABG.Fn Composition Grammar

**Status**: T-283 constitutional candidate
**Category**: Constraint / Guarantee
**Date**: 2026-05-16
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [DESIGN_MODULE_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-L-GTL3-GRAPHVECTOR.md](../gtl/REQ-L-GTL3-GRAPHVECTOR.md), [REQ-L-GTL3-EVALUATOR.md](../gtl/REQ-L-GTL3-EVALUATOR.md), [REQ-L-GTL3-HOOKS.md](../gtl/REQ-L-GTL3-HOOKS.md), [REQ-R-ABG3-ASSURANCE.md](REQ-R-ABG3-ASSURANCE.md), [REQ-R-ABG3-PAYLOAD.md](REQ-R-ABG3-PAYLOAD.md), [REQ-R-ABG3-POLICY.md](REQ-R-ABG3-POLICY.md), [T-134](../../../.ai-workspace/tickets/completed/T-134-define-abg-fn-composition-grammar.md)

---

## Purpose

Define the ABG.Fn composition grammar that binds deterministic, probabilistic,
and human/held-out regimes to one replay-stable function or edge identity.

The grammar exists to keep regime authority, closure, assurance, carrier
admission, policy, standards context, and traversal optimization on one
contract surface instead of scattered across prompts, controller behavior,
payload ledgers, or local assurance code.

## Scope

ABG.Fn composition is runtime-governance law over declared GTL hosts. It is not
a product-specific schema engine, prompt strategy language, or replacement for a
GTL graph function.

GTL declares where composition attaches. The GTL validator checks the closed
composition relations. HoG consumes the selected composition during direct
traversal. ABG admits its identity and runtime facts, records evidence under
it, derives replay projections, and refuses closure when composition identity
is absent, stale, malformed, or mismatched.

## Acceptance Criteria

**REQ-R-ABG3-FN-COMP-001**: ABG shall recognize an `abg.fn_composition` contract as the replay-stable runtime grammar for how `F_D`, `F_P`, and `F_H` participate in one graph function, graph vector, evaluator, rule, or operator boundary when that boundary affects traversal selection, evidence admission, optimization, or closure.

**REQ-R-ABG3-FN-COMP-002**: An `abg.fn_composition` contract shall carry at minimum a stable `contract_ref`, normalized `contract_digest`, host binding, ordered regime bindings, standards context, policy context, carrier context, assurance context, deterministic closure contract, and optional optimization contract.

**REQ-R-ABG3-FN-COMP-003**: The host binding shall identify the owning GTL surface and shall fail closed when a vector-local, evaluator-local, rule-local, hook-local, or operator-local declaration does not match the host's graph-function ref, graph-vector ref, source node ref, target node ref, target schema ref, or owning declaration ref.

**REQ-R-ABG3-FN-COMP-004**: Every regime binding shall declare regime kind, role, order, authority, input carrier refs, output carrier refs, and evidence refs when applicable. `F_D` may own closure authority. `F_P` may construct, diagnose, repair, rank, or supply evidence. `F_H` may be present, deferred, or absentia. Non-`F_D` regimes shall not claim closure authority.

**REQ-R-ABG3-FN-COMP-005**: Standards and policy context used for construction, admission, closure, replay, fallback, escalation, and observability shall be explicit composition inputs. Replay against a different standards or policy identity shall be non-equivalent unless a declared migration or supersession policy admits the change.

**REQ-R-ABG3-FN-COMP-006**: Carrier context shall preserve selected source and target carrier refs, selected target carrier contract ref and digest where applicable, payload-ledger projection refs, and closure-precondition refs. Target satisfaction shall be evaluated under the selected carrier identity, not under file presence, worker prose, or generic payload existence.

**REQ-R-ABG3-FN-COMP-007**: Assurance context shall preserve selected edge assurance contract ref and digest where applicable, required evidence refs, closure-gate refs, and assurance projection refs. Edge assurance findings shall be interpreted under the selected composition identity and shall not become closure law by themselves.

**REQ-R-ABG3-FN-COMP-008**: The closure contract shall name an `F_D` closure function or closure predicate ref, required evidence refs, rejection evidence refs, replay projection ref, and closure event kind or event ref. ABG shall not infer closure from worker success, prompt-side self-assessment, passing tests, report shape, gap absence, or transport success.

**REQ-R-ABG3-FN-COMP-009**: Optimizing an `F_P`-backed or mixed-regime path into a deterministic path shall require source composition ref and digest, deterministic replacement ref, positive equivalence case refs, negative equivalence case refs, equivalence projection ref, and invalidation policy ref.

**REQ-R-ABG3-FN-COMP-010**: Composition templates or defaults shall be visible configuration or published GTL assets. They shall not be hidden hardcoded objects, null contracts, prompt conventions, parser fallbacks, or lazy filesystem reads from the replay path.

**REQ-R-ABG3-FN-COMP-011**: Runtime events, payload ledgers, assurance projections, traversal envelopes, construction observations, and construction pressure packages that consume composition truth shall carry the selected composition ref and digest or a causally linked selection ref. Replaying the same admitted events shall project the same selected composition identity.

**REQ-R-ABG3-FN-COMP-012**: Implementation shall preserve the composition grammar as an Irreducible Architectural Carrier Set with a structural carrier diagram before design-method closure. Parser, admission, projection, and typed export surfaces shall derive from that carrier set rather than from helper layout or prompt shape.

**REQ-R-ABG3-FN-COMP-013**: GTL compute notation such as `fn<A, B>.C`,
`transform.C`, `evaluate.C`, and `consequence.C` shall remain declaration
truth over selected `abg.fn_composition`. The validator checks it, HoG
traverses it, and ABG admits its runtime facts. The notation shall not create a
new execution target, closure path, ledger writer, or controller surface.

**REQ-R-ABG3-FN-COMP-014**: ABG shall preserve the ontology/epistemology split for composition-governed boundaries. GTL and product declarations identify lawful hosts, hooks, policy refs, and product read-model intent; ABG admits candidate/evaluation payloads, emits events, derives payload ledgers, derives assurance and traversal projections, folds closure, and records replay truth.

**REQ-R-ABG3-FN-COMP-015**: HoG shall traverse the exact ordered stages of the
admitted C program. For each authored stage, ABG shall admit or resume the
owning graph call and frame, admit the selected regime and implementation
binding, record task invocation and results, and expose replay-derived stage
truth to HoG for the next declared bind. After the result-bearing stage and
required downstream binds are satisfied, ABG may admit assurance, disposition,
continuation, or closure truth. Neither HoG nor ABG shall synthesize a missing
stage, force a canonical three-stage chain, rename a domain role, or count
runtime admission transitions as authored program membership.

**REQ-R-ABG3-FN-COMP-016**: Engine plugin contracts that participate in composition-governed compute shall carry explicit compute-stage category, compute means, purpose, selected composition identity at invocation, and authority-denial flags. The current ABG runtime categories are transform/candidate construction, evaluate/candidate evaluation, consequence/projection, and external human callout.

**REQ-R-ABG3-FN-COMP-017**: ABG shall treat `F_H` as an external callout regime. ABG may emit or admit callout/request/response boundary events and carriers, but the human work surface itself is outside ABG; no human callout may directly write runtime events, ledgers, traversal transitions, replay truth, or closure.

**REQ-R-ABG3-FN-COMP-018**: The plugin traversal observer and hook/action category surfaces shall use `evaluate` for the evaluation stage. ABG shall reject malformed or legacy stage-category names on the admitted category surfaces rather than silently mapping them to current authority.

**REQ-R-ABG3-FN-COMP-019**: ABG shall own evaluation-set planning, stable rule scheduling, evaluation rule admission, evaluation ledger writes, and evaluation-set projection. Product plugins may compute rule outcomes inside selected composition boundaries, but they shall not own the evaluation loop, replay order, ledger writes, assurance fold, traversal transition, or closure.

**REQ-R-ABG3-FN-COMP-020**: Required evaluation rules shall fail closed when absent, stale, malformed, contradictory, rejected, or admitted under a mismatched selected composition ref/digest or selected regime-binding contribution ref.

**REQ-R-ABG3-FN-COMP-021**: Every authored C stage shall use one stage-set law:
HoG preserves declared identity and order; selected implementations perform
the declared tasks; ABG admits task results and derives applicable ledgers and
projections; HoG consumes only admitted output at the next declared bind.
`transform.C`, `evaluate.C`, and `consequence.C` use this law when present;
scalar hooks are one-task reductions. Runtime-owned transitions shall not
satisfy authored-stage cardinality or conservation.

**REQ-R-ABG3-FN-COMP-022**: `TraversalUnit<A, B>` is the monadic traversal atom
advanced by HoG under one admitted GTL program, selected GraphFunction,
workspace binding, and compute basis. ABG admits each unit's result and the
next disposition: next unit, same-unit retry, graph-span or public re-entry,
reprice, yielded continuation, block, gap stop, non-admit, or terminal
projection. Neither the unit nor callable substitutes for the owning program.

**REQ-R-ABG3-FN-COMP-023**: ABG shall conserve admitted-program identity, selected action or current-intent identity, immutable workspace-binding identity, execution-basis identity, and intent-lineage across the event-sourced bind chain. A bind from `TraversalUnit<A, B>` to any next disposition shall carry or account for admitted intent refs, lineage refs, carried obligation refs, target-carrier refs, materialization/output-allocation refs, residual pressure refs, staged-authority refs, admission-strength refs, and downstream terminal pressure. Unit close may clear a pressure or obligation ref only through admitted realization evidence, refinement, named downstream deferral, block, re-entry, reprice, no-close preservation, or terminal projection; scalar unit close shall not erase an obligation vector. A materializing unit is non-conformant when staged pressure and materialization authority are exposed through divergent or undeclared admission predicates.

**REQ-R-ABG3-FN-COMP-024**: When a newly selected action requires traversal, product, or artifact materialization, ABG shall admit or validate one sufficient `ConstructionIntent` from the admitted `NextActionProjection` and lineage before dispatch. The intent shall bind the owning program, selected action, published GraphFunction membership, target obligations, immutable workspace binding, invocation authority, and execution basis. The materialization basis is insufficient when required target-carrier rows, declared file or output targets, role requirements, allowed write roots, source authority, execution/test proof expectations, or downstream pressure refs are absent or structurally mismatched while the carried lineage requires them. Insufficient construction intent fails closed before worker, tool, or plugin dispatch.

**REQ-R-ABG3-FN-COMP-025**: The ABG executive observer shall participate as an
`evaluate.C`/F_P pressure-evaluation role over a declared target workspace and
target work. Its findings may diagnose pressure, attenuation, non-attenuation,
local repair, nonlocal re-entry, reprice, block, or close-candidate state, but
they shall remain admitted findings and projection inputs. They shall not
become `consequence.C`, a graph mutation authority, a closure fold authority,
or a second continuation controller.

**REQ-R-ABG3-FN-COMP-026**: The GTL `C` algebra may compose the One Surface
functions, but neither composition nor an executor or runtime helper may merge,
substitute, or transfer authority among `synthesizeModel`, `evalGap`,
`evaluateNext`, intent admission, GraphFunction invocation, `evaluateAction`,
and continuation. Public ingress may ignite the admitted composition but shall
not own its order, retry, recursion, selection, or closure.

**REQ-R-ABG3-FN-COMP-027**: A published inner refinement shall recurse through the same declared One Surface composition and preserve program, workspace-binding, execution-basis, lineage, and outer-contract truth. Opaque worker-internal decomposition remains inside one bounded action and shall not be promoted to a hidden workflow composition or controller.
