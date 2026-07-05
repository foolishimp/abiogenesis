# REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH — Requirement Proof Carry-Through

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-07-03
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-M-GTL3-PROGRAM-TRAVERSAL.md](../mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md), [REQ-L-GTL3-HOOKS.md](../gtl/REQ-L-GTL3-HOOKS.md), [REQ-L-GTL3-COMPUTE-NOTATION.md](../gtl/REQ-L-GTL3-COMPUTE-NOTATION.md), [REQ-R-ABG3-FN-COMPOSITION.md](REQ-R-ABG3-FN-COMPOSITION.md), [REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md](REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md), [REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md](REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md), [REQ-R-ABG3-ASSURANCE.md](REQ-R-ABG3-ASSURANCE.md), [REQ-R-ABG3-PAYLOAD.md](REQ-R-ABG3-PAYLOAD.md), [REQ-R-ABG3-PROJECTION.md](REQ-R-ABG3-PROJECTION.md), [REQ-R-ABG3-CONVERGENCE.md](REQ-R-ABG3-CONVERGENCE.md)

---

## Purpose

Define the ABG-owned carry-through law that keeps requirement pressure bound
to both realization evidence and proof evidence until closure.

The gap this closes is the late-stage algebraic failure where a traversal
produces code or another realization artifact, and also produces tests or
proof artifacts, but the admitted requirement obligations do not force those
two surfaces to prove the same requirement terms. In that failure mode, code
and tests can agree on a weaker shape while the original requirement pressure
silently disappears.

The requirement also closes the related depth failure where coverage is
complete over a shallow declared obligation set. Closure requires both
coverage over declared obligations and proof-policy depth completeness for the
target being closed.

## Scope

This requirement applies to admitted requirement terms, requirement graph
relations, edge requirement environments, instruction assembly, graph-function
call denotation, traversal frames and continuations, payload and evidence
admission, assurance fold projection, residual projection, foldback, and
convergence.

It is language-agnostic. Software source and software tests are one proof
binding. Other domains may bind model artifacts, process artifacts, operating
procedures, simulation output, human review packets, verifier executions, or
semantic interpretation evidence. The invariant is the same: each applicable
requirement obligation shall carry into paired realization and proof witnesses
before closure.

## Acceptance Criteria

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-001**: ABG shall derive stable requirement obligation identities from admitted requirement terms, requirement relations, and active traversal spans. A normative requirement obligation shall preserve source requirement refs, source digest, relation refs, span refs, edge refs, and active proof policy refs.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-002**: For every active requirement obligation on an edge, ABG shall derive at least one realization obligation and at least one proof obligation or shall emit a typed gap or residual explaining why that obligation is not yet projectable. A traversal shall not close by ignoring an applicable requirement obligation.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-003**: Realization obligations and proof obligations shall share the same source requirement obligation identity. A proof artifact, verifier execution, worker judgment, test result, or semantic assessment shall not close a requirement obligation unless it is admitted against that obligation identity and compatible proof role.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-004**: Requirement proof carry-through shall distinguish realization evidence, verifier-artifact evidence, verifier-execution evidence, and semantic-interpretation evidence. One evidence role shall not satisfy another by path shape, naming convention, command success, worker self-report, or pass status alone.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-005**: ABG shall expose a replay-derived requirement proof coverage projection that shows, for each active requirement obligation, its realization obligations, proof obligations, admitted realization witnesses, admitted proof witnesses, executed verifier refs when required, semantic assessment refs when required, residuals, and closure eligibility.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-006**: The requirement proof coverage projection shall be read-only. It shall not be a writable ledger, product-local coverage table, test-report parser, closure enum, retry controller, or peer source of requirement truth.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-007**: Instruction assembly for F_P work over requirement-bearing edges shall include the active realization and proof obligations that the worker is being asked to affect. It shall not ask for a realization artifact while omitting the proof obligations that determine closure for the same source requirements.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-008**: F_D carry-through checks shall be total functions over known requirement, relation, span, asset-surface, payload, evidence, verifier, and assurance algebras. They shall return typed accepted, incomplete, malformed, missing-realization, missing-proof, role-mismatch, digest-mismatch, stale, semantic-assessment-required, human-decision-required, residual-preserved, or non-closing outcomes.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-009**: F_P may evaluate semantic adequacy of a realization witness or proof witness only as admitted evidence. F_P shall not decide that an obligation is covered, that proof is complete, that evidence roles match, or that closure is allowed without subsequent F_D projection over admitted refs.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-010**: Passing tests, successful commands, generated files, parseable responses, transport success, or worker claims shall not close requirements outside their admitted proof relation. Closure shall require replay-derived coverage of the active requirement obligations.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-011**: A proof artifact that checks only a weaker behavior than the source requirement shall leave the unmatched requirement obligation incomplete, residualized, or routed for re-entry. ABG shall not treat code/test agreement on a weaker contract as satisfaction of the stronger admitted requirement.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-012**: Requirement proof carry-through shall support differential proof where applicable. If a requirement names an invariant, rejection case, algebraic law, or forbidden behavior, the proof obligation shall record the expected positive and negative evidence shape or shall emit a typed proof-obligation gap.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-013**: ABG assurance fold projection shall consume requirement proof coverage truth before requirement closure. A vector, graph call, run, release proof, or downstream lifecycle interpretation shall not claim requirement closure while any active applicable obligation is missing realization evidence, missing proof evidence, role-mismatched, stale, semantically unresolved, or explicitly residualized.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-014**: Downstream products may declare domain requirement terms, graph overlays, product graph functions, proof policies, verifier commands, semantic rubrics, and product evidence. They shall not mint requirement proof coverage truth, local requirement-proof ledgers, local closure registers, or local proof-completeness surfaces that outrank ABG replay-derived coverage.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-015**: Query and report surfaces may summarize requirement proof coverage, but shall preserve source requirement refs, obligation ids, realization witness refs, proof witness refs, evidence role, verifier execution refs, semantic assessment refs, residual refs, and source digests sufficient for replay.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-016**: Traversal plugins that can produce realization candidates, verifier candidates, evidence candidates, or semantic-assessment candidates for requirement-bearing edges shall be governed by declared plugin contracts. The contract shall identify the applicable graph-function refs, graph-vector refs, source and target node-type refs or admitted type families, input carrier refs, required requirement obligation refs or obligation classes, output candidate kinds, admission target kinds, evidence role refs, authority-denial flags, and replay identity.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-017**: Plugin outputs shall remain candidate material until ABG admits them against the declared plugin result interface, response contract, payload/evidence admission law, and active requirement obligation ids. A plugin output shall not itself be requirement proof coverage truth, evidence admission truth, closure truth, retry truth, re-entry truth, graph-function selection truth, or traversal authority.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-018**: ABG shall reject or residualize plugin outputs that cannot be bound to the selected traversal edge, declared plugin contract, admitted response contract, required evidence role, and active requirement obligation ids. A plugin may provide semantic assessment evidence, but the requirement coverage projection shall be F_D replay-derived over admitted plugin outputs and known obligation/evidence algebras.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-019**: Requirement proof carry-through shall preserve the GTL compute-plugin category split. `plugin.transform.C` may produce candidate realization, artifact, or evidence material; `plugin.evaluate.C` may produce candidate evaluation findings, metrics, semantic judgments, residual proposals, and disposition proposals; `plugin.consequence.C` may produce candidate consequence projections or candidate consequence traversal action proposals. External human callout shall be a task role inside a declared transform, evaluate, or consequence stage, not a fourth peer stage category. Each category shall have an admitted API-level output mapping that states the exact candidate carrier shape, output carrier refs, evidence refs, identity fields, and admission target. None of those API outputs shall become admitted requirement coverage, runtime truth, traversal transition, or closure until ABG admits and projects them under the selected composition, selected edge, active requirement obligations, and evidence role.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-020**: Requirement-bearing plugin invocation shall be a strict bind inside the ABG traversal monad. Every `plugins.C.F_P` input shall be an algebraically composable tuple of selected program or overlay ref, selected graph-function ref, selected graph-vector or traversal-unit ref, selected composition ref and digest, source and target node/type refs, active requirement obligation refs, admitted carrier refs, admitted payload/evidence refs, instruction envelope ref, response contract ref, plugin contract ref, and replay identity. Missing, malformed, stale, or non-composable inputs shall produce a typed rejection or residual before worker dispatch.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-021**: Every `plugins.C.F_P` output shall be admitted only when it composes with the selected traversal-unit output algebra declared for its stage category. ABG shall validate output carrier kind, output carrier refs, evidence role, source obligation ids, target node/type compatibility, response contract, plugin result interface, selected composition identity, and replay digest before the output may feed payload ledgers, requirement proof coverage, assurance, consequence bind, continuation, or residual projection.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-022**: A proof obligation shall preserve proof-shape identity sufficient to reject weaker-contract proof. The proof obligation or equivalent admitted policy projection shall carry a stable proof obligation ref, proof policy ref, expected evidence shape refs, positive evidence shape refs, negative evidence shape refs when required, proof strength or coverage-strength refs, and any declared invariant, rejection-case, algebraic-law, or forbidden-behavior refs. Absence of this proof-shape identity shall be a typed proof-obligation gap, not an implicit permission to close from generic test success.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-023**: Any plugin result interface or API-level output mapping that can contribute to requirement proof coverage shall expose or preserve proof obligation refs, proof policy refs, expected evidence shape refs, proof strength refs, and source requirement obligation refs. A plugin output that names only carrier refs, evidence refs, response contract, and replay digest shall remain non-closing until ABG can bind it to the required proof-shape identity.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-024**: `plugin.consequence.C` outputs shall be inert candidate consequence material until ABG admits them through consequence admission and allowed traversal catalog law. A consequence plugin may propose a candidate consequence projection or candidate `ConsequenceTraversalAction`, but it shall not emit traversal transitions, select next graph functions or vectors, open continuations, perform re-entry, retry, close, or mutate replay truth. Any `traversalAction`-shaped field in a plugin outcome shall be treated as candidate advice only until ABG validates it against selected composition, allowed traversal family, active obligation refs, required authority refs, evidence policy refs, foldback policy refs, and replay identity.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-025**: The minimal plugin-output carrier extension for requirement proof carry-through shall include candidate-kind to admission-route mapping. Each coverage-capable output shall carry or replay-derive `outputCandidateKind`, `admissionTargetKind`, `sourceRequirementObligationRefs`, per-output or per-evidence-role refs, and replay identity or replay digest. ABG shall reject outputs where those fields are absent, inconsistent with the selected plugin contract, or insufficient to route admission without path-shape inference.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-026**: Plugin-output category classification shall be ABG-derived from the selected composition, selected stage binding, admitted plugin contract, admitted plugin result interface, and candidate-kind/admission-route mapping. It shall not be accepted merely because a caller labels an output as transform, evaluate, consequence, verifier, or proof evidence. ABG shall enforce cross-category uniqueness or explicit disambiguation so one plugin output cannot be admitted under two stage categories, proof roles, or admission routes without a declared and replay-visible classifier.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-027**: Existing `GtlContractFulfillmentBinding` or its admitted projection shall be reused for realization-and-proof pairing when its fields are sufficient. T-188 shall not mint a second realization/proof pairing carrier unless the design proves a specific field gap that cannot be represented by extending or projecting the existing fulfillment binding.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-028**: A requirement-bearing GTL graph-function call shall denote an ABG traversal bind, not a product-local runtime callback. The bind shall preserve selected program or overlay ref, caller graph-function ref, callee graph-function ref, selected composition ref and digest, admitted input carrier refs, active requirement obligation refs, frame or span lineage refs, and replay identity.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-029**: A requirement-bearing tail-recursive graph-function call shall denote ABG continuation over the same graph-function lineage. Tail recursion shall preserve active obligation refs, residual pressure refs, attempt or continuation identity, admitted next-input carrier refs, selected composition identity, and replay identity. A product-local loop, worker-selected next vector, local retry controller, or prompt shell shall not substitute for ABG continuation.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-030**: Child traversal output shall fold back into parent requirement state only through ABG admission, proof coverage projection, residual projection, and assurance fold. A graph function, plugin, worker, or child traversal shall not directly emit obligation delta, residual truth, closure eligibility, re-entry truth, continuation truth, or parent closure truth.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-031**: Recursive lifecycle traversal shall not introduce a separate ambiguity, entropy, disambiguation, or recursive-agent truth surface. Disambiguation language may describe unresolved obligation pressure, candidate space, evidence, coverage, residuals, and closure disposition, but replayable truth shall remain the admitted GTL/ABG carriers and projections named by this requirement.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-032**: Requirement proof carry-through shall distinguish proof coverage from proof-policy depth completeness. Proof coverage asks whether admitted evidence covers declared obligations. Proof-policy depth completeness asks whether the declared obligation set is deep enough for the selected target, proof policy, and closure claim. Coverage over a shallow proof policy shall not be sufficient closure truth.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-033**: `DepthObligationPolicy` or its admitted projection shall be subordinate to proof policy. It may declare required depth obligation classes, typed non-applicability rows, residual rows, re-entry rows, and required adversarial checks. It shall not be a writable ledger, second proof policy, closure enum, local product checklist, or peer source of requirement truth.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-034**: For every closure-bearing target, ABG shall derive depth-policy completeness from admitted proof policy, active requirement obligations, expected evidence shapes, proof-strength policy, and typed non-applicability or residual rows. Missing, unjustified, or inapplicable depth classes shall produce typed outcomes such as `depth_policy_incomplete`, `missing_depth_obligation_class`, or `depth_class_not_applicable_unjustified`, not implicit permission to close.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-035**: Proof strength shall become closure-bearing only through admitted `ProofStrengthAdmission` or an equivalent admitted projection. A proof strength admission shall preserve strength ref, source requirement obligation refs, proof obligation refs, proof policy refs, expected evidence shape refs, depth class refs, verifier refs, adversarial attempt refs when required, counterexample refs when present, disposition, and replay identity.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-036**: `ProofStrengthAdmission` shall be F_D-checkable or adversarially verified. An F_D-checkable strength criterion shall be a total function over admitted evidence, declared proof policy, expected evidence shape, depth classes, coverage rows, and typed rejection or gap outcomes. An adversarial verification result shall be admitted evidence that attempts to refute the strength claim. F_P may propose a strength judgment, but worker self-report, prompt shape, passing tests, or a caller-supplied strength label shall not become admitted proof strength.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-037**: ABG assurance fold projection shall consume both replay-derived proof coverage and proof-policy depth completeness before requirement closure. A vector, graph call, run, release proof, or downstream lifecycle interpretation shall not claim closure while depth policy is incomplete, required depth classes are missing or unjustified, proof strength is not admitted, or an admitted adversarial verification produced a blocking counterexample.

**REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-038**: Coverage-gated closure
applies to edges bearing a declared requirement proof carry-through
contract. On such edges the assurance fold shall consume replay-derived
coverage before closure per `-037`. An edge with active requirement
obligations and no declared carry-through contract is a migration gap,
not silent permission: it retains pre-carry-through closure semantics
only as a typed transitional state, and a release shall not claim
universal coverage-gated closure while such edges exist. The mandatory
carry-through witness migration closes this gap.
