# M03 Requirement Proof Carry-Through First-Slice IACS

**Ticket**: T-188
**Status**: Active design
**Date**: 2026-07-03
**Derived from**: [M03_REQUIREMENT_PROOF_CARRY_THROUGH_DERIVATION.md](./M03_REQUIREMENT_PROOF_CARRY_THROUGH_DERIVATION.md), [M03_REQUIREMENT_PROOF_CARRY_THROUGH_STRUCTURAL_CARRIER_DIAGRAM.md](./M03_REQUIREMENT_PROOF_CARRY_THROUGH_STRUCTURAL_CARRIER_DIAGRAM.md), [T-188](../../../../.ai-workspace/tickets/active/T-188-realize-requirement-proof-carry-through.md)

## Purpose

Declare the irreducible carrier set for requirement proof carry-through. The
first slice makes requirement closure depend on replay-derived proof coverage,
not on generated files, test success, worker self-report, or plugin output
shape. The strengthened slice also makes closure depend on proof-policy depth
completeness and admitted proof strength; coverage over a shallow policy is
non-closing.

## Irreducible Architectural Carrier Set

| Carrier family | Owner | Prime status | Admission/write path | Consumers |
| --- | --- | --- | --- | --- |
| `RequirementProofCoverageProjection` | ABG requirements/projection | Prime public projection | Replay-derived from admitted requirements, traversal events, admitted payload/evidence, plugin envelopes, fulfillment bindings, and foldback truth | assurance fold, query/read models, downstream consumers |
| `RequirementObligationCoverageRow` | ABG projection | Subordinate row | Nested in `RequirementProofCoverageProjection` | closure gate, diagnostics |
| `RealizationObligationRow` | ABG projection | Subordinate row | Derived from requirement obligation plus target carrier role | instruction assembly, coverage |
| `ProofObligationRow` | ABG projection | Subordinate row | Derived from requirement obligation plus proof policy/test relation | instruction assembly, coverage |
| `ProofShapeRow` | ABG projection | Subordinate row | Derived from proof policy, expected evidence shape, positive/negative shape, strength, invariant/rejection/algebraic refs | weaker-contract rejection |
| `DepthObligationPolicyRow` | ABG projection | Subordinate row | Derived from proof policy, target refs, required depth classes, typed non-applicability/residual/re-entry rows | depth-completeness gate |
| `ProofStrengthAdmissionRow` | ABG projection/admission | Subordinate row | Derived from total F_D strength criteria or admitted adversarial verification | strength gate, assurance fold |
| `RequirementWitnessBindingRow` | ABG projection | Subordinate row | Derived from `RequirementEvidenceBinding`, payload/evidence events, plugin envelopes, and fulfillment bindings | coverage and assurance |
| `RequirementProofCarryThroughOutputEnvelope` | ABG admission/projection | Subordinate extension | Added to/adapted from admitted plugin result envelope path | proof coverage projection |
| `RequirementProofCandidateClassificationTable` | ABG admission/projection | Subordinate table | Admitted/published rule table selected by contract ref and digest | plugin output admission |
| `TraversalObligationCarryRow` | ABG traversal/projection | Subordinate row | Derived from graph call, frame/span, traversal unit, continuation, and active obligation truth | recursive foldback |
| `ChildTraversalFoldbackRow` | ABG projection | Subordinate row | Derived from child proof coverage, residual, and assurance truth | parent coverage projection |
| `ProofCoverageDiagnosticRow` | ABG projection | Subordinate row | Nested rejection/residual diagnostics | proof, tests, read models |

## Prime Decision

Only `RequirementProofCoverageProjection` is new and prime in this slice.

It is prime because no existing carrier exposes the public closure-critical
join between:

- active requirement obligations;
- realization obligations;
- proof obligations;
- proof-shape identity;
- proof-policy depth completeness;
- proof-strength admission;
- admitted realization/proof witnesses;
- plugin-output admission;
- child traversal foldback;
- residuals and closure eligibility.

The projection may be physically joined into `RequirementQueryReadModel`, but
it remains one projection family. Implementation shall not create both a
coverage projection and a peer coverage ledger.

## Explicit Non-Prime Decisions

| Candidate | Decision | Reason |
| --- | --- | --- |
| `Ambiguity` / `Disambiguation` carrier | Rejected | Narrative only. Replay truth is coverage, residual, assurance, and closure disposition. |
| Product-local proof ledger | Rejected | Violates ABG-owned proof coverage and closure. |
| Product-local retry controller | Rejected | Tail recursion denotes ABG continuation. |
| New plugin algebra | Rejected | Existing hook/plugin/result-interface algebra is extended by minimal fields. |
| New prompt algebra | Rejected | T-183 instruction assembly remains the prompt-plan authority. |
| New requirements algebra | Rejected | T-188 projects over T-162/T-164/T-168 requirements algebra. |
| Separate recursive-agent runtime | Rejected | Direct calls lower to ABG bind; tail calls lower to ABG continuation. |

## Existing Carrier Reuse

| Existing carrier or function | Reuse decision |
| --- | --- |
| `EdgeRequirementEnvironment` | Source of active requirement, relation, span, prior fold, and residual pressure context. |
| `RequirementProjection` | Source of target/evidence role projection; may be extended or joined but not forked. |
| `RequirementEvidenceBinding` | Source of admitted/non-closing/rejected evidence binding; T-188 adds proof-shape join, not a replacement. |
| `RequirementFoldProjection` | Closure fold carrier; must consume proof coverage before satisfied state. |
| `RequirementResidualProjection` | Residual carrier for uncovered or weaker proof. |
| `RequirementAssuranceClaim` | Assurance summary; must reflect proof coverage state. |
| `CompiledPromptPlan` | Carries active realization/proof obligations into F_P dispatch. |
| `InstructionEnvelope` | Runtime pre-dispatch input; must include proof obligation refs where requirement-bearing. |
| `PromptManifest` | Replay proof of prompt content; not proof coverage by itself. |
| `GtlProgramTraversalUnitProjectionRow` | Selected traversal-unit source truth for strict plugin bind. |
| `GtlProgramPluginResultInterfaceRow` | Declared result interface; T-188 adds proof-carry fields/admission mapping. |
| `AdmittedPluginResultEnvelope` | Admission envelope; add candidate/admission/obligation/proof-shape binding rather than new envelope family. |
| `GtlContractFulfillmentBinding` | Prime source for realization/proof pairing. T-188 derives requirement-obligation and proof-obligation lists from this binding and does not accept contract-owned flat pairing lists as authority. |
| `EnginePluginInput` | Reuse selected-edge identity and runtime binding truth. |
| `RequirementRouteFactProjectedRuntimeEvent` | Reuse route fact wrapper where T-188 projection emits runtime fact payloads. |

## Minimal Extension Fields

Coverage-capable plugin output admission requires the following subordinate
fields or replay-derived equivalents:

| Field | Purpose | Promotion status |
| --- | --- | --- |
| `outputCandidateKind` | Names the kind of candidate material produced. | Subordinate field. |
| `admissionTargetKind` | Names the ABG admission route for the candidate. | Subordinate field. |
| `RequirementProofCandidateClassificationTable` | Deterministic ABG table tying stage role, admission target, evidence role, and candidate kind. The contract points at the table ref/digest; admission derives the candidate kind from the table before comparing any envelope assertion. | Subordinate table; not a plugin-owned classifier. |
| `fulfillmentBindings` | Carries `GtlContractFulfillmentBinding` rows into admission. | Subordinate source-truth input; not a second pairing carrier. |
| `sourceRequirementObligationRefs` | Binds output to source obligation pressure. | Subordinate field. |
| `evidenceRoleRefs` | Classifies realization/proof/semantic/human roles without path inference. | Subordinate field. |
| `proofObligationRefs` | Binds proof witness to proof obligation identity. | Subordinate field. |
| `proofPolicyRefs` | Names policy governing proof sufficiency. | Subordinate field. |
| `expectedEvidenceShapeRefs` | Names expected proof shape. | Subordinate field. |
| `positiveEvidenceShapeRefs` | Names required positive evidence shape. | Subordinate field. |
| `negativeEvidenceShapeRefs` | Names required negative evidence shape. | Subordinate field. |
| `proofStrengthRefs` | Names strength relation for weaker-contract rejection. | Subordinate field. |
| `depthClassRefs` | Names the proof-policy depth class carried by the witness. | Subordinate field. |
| `proofStrengthAdmissionRefs` | Names admitted strength basis. | Subordinate field. |
| `adversarialAttemptRefs` | Names adversarial verification attempts when required. | Subordinate field. |
| `counterexampleRefs` | Names admitted counterexamples when present. | Subordinate field. |
| `replayIdentity` / `replayDigest` | Binds output to replay and forgery checks. | Subordinate field. |

No field above is promoted to a peer carrier in the first slice.

## Known Algebra Register

| Algebra | Inputs | Output domain | Typed gaps/rejections |
| --- | --- | --- | --- |
| obligation derivation | requirement terms, relations, spans, edge environment | obligation rows or gap | missing span, relation ambiguity, inactive edge |
| realization/proof pairing | obligation rows, `GtlContractFulfillmentBinding`, proof policy | paired rows or gap | no realization obligation, no proof obligation, insufficient binding |
| proof-shape derivation | proof policy, test relation, requirement class | proof-shape row or gap | missing positive/negative shape, missing strength, unknown policy |
| depth-policy completeness | proof policy, target refs, depth classes, non-applicability/residual/re-entry rows | complete/incomplete/gap | depth_policy_incomplete, missing_depth_obligation_class, depth_class_not_applicable_unjustified |
| plugin input composition | traversal unit, composition, node types, instruction envelope, admitted refs | accepted input tuple or rejection | missing/mismatched vector, composition, type, response contract, plugin contract, obligation |
| plugin output admission | result interface, response contract, plugin result, replay digest | admitted candidate binding or rejection | missing candidate kind, wrong admission route, role mismatch, stale/forged digest |
| candidate classification | selected stage, admission target, evidence roles, classification rule | exactly one candidate kind or rejection | candidate_classification_mismatch, candidate_classification_ambiguous |
| fulfillment-derived pairing | `GtlContractFulfillmentBinding`, output envelope refs | preserved req/proof pair or rejection | fulfillment_binding_gap, proof_pairing_mismatch |
| evidence-role compatibility | proof obligation, evidence role, admitted evidence | compatible/incompatible/gap | path-only role, wrong role, missing semantic/human evidence |
| proof-strength comparison | source proof shape, witness proof shape | sufficient/weaker/unknown | weaker contract, no negative case, no invariant proof |
| proof-strength admission | admitted evidence, proof policy, expected evidence shape, depth classes, coverage rows, adversarial attempts | sufficient/insufficient/residual/reentry/blocked | proof_strength_not_admitted, proof_strength_not_adversarially_verified, adversarial_counterexample_found |
| recursive carry/foldback | graph call/frame/span/continuation events, child coverage | foldback row or residual | missing child coverage, lineage drift, unmatched obligation |
| closure gating | proof coverage, depth completeness, strength admission, folds, residuals, assurance | supported/partial/blocked/no_evidence | missing realization, missing proof, role mismatch, semantic unresolved, depth incomplete, strength not admitted, residual preserved |

## Module Lifecycle Confirmation

| Phase | T-188 answer |
| --- | --- |
| intent | Preserve admitted requirement pressure through realization and proof until closure. |
| requirement | `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH`. |
| build | TypeScript M03 realization under requirements algebra, plugin admission, instruction assembly, and assurance modules. |
| assurance | Differential `test:t188`, `test:semantic`, and live `test:t188:live`. |
| release | Normal TypeScript RC release only after T-188 proof lanes pass. |
| deployment | Installed package/context model from T-186/T-187. |
| live usage | Installed sandbox GLC-style run with implementation and verifier artifacts. |
| observed telemetry | Replay-derived proof coverage, residual, foldback, and assurance projections. |
| retirement | Requirement/proof-policy supersession; old projection rows remain historical replay truth. |

## Closure Proof Expectations

| Proof | Required assertion |
| --- | --- |
| missing proof | Realization witness exists, proof witness absent, closure rejected. |
| missing realization | Proof witness exists, realization witness absent, closure rejected. |
| role mismatch | Evidence role differs from proof obligation role, closure rejected. |
| weaker contract | Implementation and proof agree on a weaker behavior, stronger requirement remains residualized. |
| F_P self-approval | Worker says covered/complete, F_D coverage absent, closure rejected. |
| plugin wrong edge | Plugin output for wrong vector cannot bind coverage. |
| plugin missing proof shape | Output with evidence refs but no proof-shape identity is non-closing. |
| consequence authority | `traversalAction` output remains candidate advice until ABG admits it. |
| child summary | Child traversal summary without admitted foldback cannot affect parent closure. |
| tail retry | Retry is ABG continuation, not product-local loop state. |
