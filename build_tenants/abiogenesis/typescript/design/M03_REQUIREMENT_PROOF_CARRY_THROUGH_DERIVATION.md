# M03 Requirement Proof Carry-Through Derivation

**Ticket**: T-188
**Status**: Active design
**Date**: 2026-07-03
**Change class**: requirement_reprice -> design_reframe

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md`
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md`
- `specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md`
- `specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md`
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md`
- `.ai-workspace/tickets/active/T-188-realize-requirement-proof-carry-through.md`
- `.ai-workspace/comments/codex/20260703T083818Z_STRATEGY_recursive_llms_recursive_gtl_disambiguation_graphs.md`
- `.ai-workspace/comments/codex/20260703T174904Z_STRATEGY_prime_assurance_depth_policy_and_strength_admission.md`
- `build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_PROOF_CARRY_THROUGH_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_PROOF_CARRY_THROUGH_STRUCTURAL_CARRIER_DIAGRAM.md`

## Problem

The data-mapper witness showed a late-stage algebraic failure. ABG could run a
real traversal and produce implementation artifacts plus proof artifacts, but
the requirement pressure did not force both surfaces to prove the same admitted
requirements. Code and tests could agree with each other while agreeing on a
weaker contract than the source requirement.

The same failure appears at the plugin seam. A plugin result can carry carrier
refs and evidence refs, but today that shape is not sufficient to prove:

- which source requirement obligation the output claims to satisfy;
- which proof obligation and proof policy govern it;
- whether the evidence role is realization, verifier artifact, verifier
  execution, semantic interpretation, or human decision;
- whether the proof shape includes the required positive, negative, invariant,
  rejection-case, algebraic-law, or forbidden-behavior evidence;
- whether the proof policy declared the required depth classes for the target
  or admitted typed non-applicability, residual, or re-entry rows;
- whether proof strength was admitted by total F_D criteria or adversarial
  verification rather than worker self-report;
- whether a child traversal carries the same obligation pressure back to the
  parent instead of returning an untyped summary.

This is a generic ABG/GTL problem. It is not a data-mapper policy problem and
not an odd_glc-local gap.

## SPEC_METHOD Review

T-188 is a requirement reprice because it adds new constitutional truth:
requirement-bearing traversal must preserve paired realization/proof
obligations until closure. The requirement exists in
`REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH`; design may choose structure but
shall not weaken its closure rules.

The requirement is sufficient for design derivation because it names:

- source truth: admitted requirements, relations, spans, active traversal
  edges, plugin contracts, instruction envelopes, admitted payload/evidence,
  and assurance folds;
- authority boundary: GTL declares, ABG admits/projects/folds/closes, plugins
  produce candidate material only;
- F_D/F_P split: F_D owns total checks over known algebras, F_P may provide
  semantic adequacy evidence only;
- prime assurance split: proof coverage proves declared obligations, while
  proof-policy depth completeness proves the declared obligation set is deep
  enough and proof strength has an admitted basis;
- lifecycle signal: build through requirement law and TypeScript realization,
  assurance through differential and live proof, release through the normal RC
  gate, live use through installed sandbox traversal, telemetry through replay
  projections, retirement through supersession of requirement/proof policies.

Named lifecycle gaps for this design:

| Phase | Answer |
| --- | --- |
| intent | Answered by GOAL-028 and PRODUCT: preserve requirement pressure through traversal. |
| requirement | Answered by `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH`. |
| build | TypeScript M03 realization under T-188. |
| assurance | `test:t188`, `test:semantic`, and `test:t188:live`; negative proofs required. |
| release | Normal TypeScript RC release gate after T-188 closure. |
| deployment | Installed downstream ABG package and context bootstrap, same install model as T-186/T-187. |
| live usage | Installed sandbox run with implementation and proof artifacts. |
| observed telemetry | Replay-derived proof coverage, residual, assurance, and traversal foldback projections. |
| retirement | Requirement/proof-policy supersession; old policies remain replay history but cannot govern new closure. |

## DESIGN_MODULE_METHOD Review

The design obeys Prime Law by adding one new prime projection family and
minimal subordinate rows/extensions. It does not create a new requirements
algebra, prompt algebra, plugin runtime, ambiguity ledger, or local proof
ledger.

The prime boundary is:

```text
RequirementProofCoverageProjection
```

It is prime because closure needs one replay-derived public projection that
joins active requirement obligations, expected proof shape, admitted
realization witnesses, admitted proof witnesses, proof-policy depth
completeness, proof-strength admission, plugin-output admission, child
traversal foldback, residuals, and closure eligibility.

Everything else in this slice is subordinate unless implementation proves a
promotion need:

- requirement obligation rows;
- realization obligation rows;
- proof obligation rows;
- proof-shape rows;
- witness binding rows;
- plugin candidate binding rows;
- depth-obligation policy rows;
- proof-strength admission rows;
- traversal carry rows;
- child foldback rows;
- coverage diagnostics.

## Existing Capability Audit

| Current capability | Existing surface | T-188 decision |
| --- | --- | --- |
| Active requirement terms, relations, spans | `RequirementTerm`, `RequirementRelation`, `RequirementTestRelation`, `EdgeRequirementEnvironment` | Reuse. These identify active pressure but do not alone prove paired realization/proof closure. |
| Requirement projections and evidence roles | `RequirementProjection`, `RequirementEvidenceBinding` | Extend or project through T-188 rows. Existing role binding is not enough for proof-shape identity. |
| Requirement fold/residual/assurance | `RequirementFoldProjection`, `RequirementResidualProjection`, `RequirementAssuranceClaim` | Reuse. Fold must consume proof coverage before closure. |
| Requirement graph/refinement | `RequirementGraphProjection`, `RequirementAggregateStateProjection`, `RequirementSpanLineageProjection` | Reuse. No KAOS or SDLC proof graph reminting. |
| Instruction assembly | `CompiledPromptPlan`, `InstructionEnvelope`, `PromptManifest` | Reuse. Active realization/proof obligations become required compiler inputs. |
| Traversal-unit conformance | `GtlProgramTraversalUnitProjectionRow` | Reuse. It already requires target carrier, edge closure, selected compute composition, plugin result interface, consequence interface, and conservation basis. |
| Plugin contracts | `EnginePluginContract`, `EnginePluginInput`, compute-stage bindings | Reuse and extend by admission mapping. Plugin input remains a strict traversal bind. |
| Plugin result interface | `GtlProgramPluginResultInterfaceRow`, `AdmittedPluginResultInterfaceContract`, `AdmittedPluginResultEnvelope` | Extend minimally. Current envelope lacks source obligation refs, proof-shape refs, deterministic candidate-kind/admission-route/evidence-role classification table refs, and per-ref evidence roles. |
| Realization/proof pairing | `GtlContractFulfillmentBinding` | Reuse as the prime pairing source. T-188 contracts do not own flat obligation/proof lists; admission derives the selected requirement obligations and proof obligations from fulfillment bindings. |
| Payload/evidence truth | `payload_observed`, `evidence_admitted`, payload ledger projection | Reuse. Do not parse files/tests directly as closure truth. |
| Graph call and recursion truth | `graph_call_opened`, `frame_opened`, continuation events, span/foldback projections | Reuse. Direct GTL calls lower to ABG bind; tail calls lower to ABG continuation. |
| Requirement route event wrapper | `requirement_route_fact_projected` | Reuse for projected route facts where possible. Do not add a second event stream. |

## Decision

T-188 realizes requirement proof carry-through as a replay-derived projection
over existing GTL/ABG runtime truth.

The design adds:

1. a `RequirementProofCoverageProjection` family;
2. a minimal coverage-capable plugin-output binding extension, with candidate
   classification derived by ABG and requirement/proof pairing derived from
   `GtlContractFulfillmentBinding`;
3. semantic compiler checks that carry active realization and proof obligations
   into requirement-bearing F_P dispatch;
4. assurance fold gating over proof coverage;
5. recursive graph-call and tail-call foldback rules that preserve obligation
   lineage.

Assurance fold gating is not a second closure decision. The projection emits a
proof-coverage truth ref whose status is `eligible`, `residual`, or `blocked`.
`foldRequirementEvidence` consumes that ref before assurance-close truth: a
non-eligible proof-coverage status preserves residual or blocked pressure even
when the ordinary assurance closure decision is `close`.

The design shall not add:

- a new requirements algebra;
- a new prompt algebra;
- a new plugin algebra;
- a product-local proof ledger;
- a product-local retry controller;
- a separate ambiguity, disambiguation, entropy, or recursive-agent truth
  surface.

## Core Flow

```text
admitted requirement ledger
  -> edge requirement environment
  -> RequirementProofCoverageProjection with active obligations and proof shape
  -> instruction assembly binds active realization/proof obligations
  -> strict plugins.C.F_P input tuple
  -> plugin candidate output
  -> ABG admission against plugin result interface and proof-shape identity
  -> witness binding rows in RequirementProofCoverageProjection
  -> requirement fold consumes proof coverage
  -> residual, re-entry, continuation, block, or closure
```

Recursive calls use the same flow:

```text
GTL call F -> G
  -> ABG child traversal bind
  -> active obligation carry-in
  -> child candidate admission and proof coverage
  -> child residual/coverage foldback
  -> parent RequirementProofCoverageProjection updates from replay
```

Tail calls are continuations:

```text
GTL tail call F -> F
  -> ABG continuation over same graph-function lineage
  -> preserved obligation refs
  -> preserved residual pressure refs
  -> new attempt identity
  -> replay-visible continuation/foldback truth
```

## Field Cut And Reuse

| Candidate field or concept | Source truth | Design decision |
| --- | --- | --- |
| source/target node type | GTL nodes, graph vector, node-type satisfaction | Derive; do not redeclare in proof coverage except as trace refs. |
| response contract | graph vector target carrier and instruction assembly | Derive; plugin output must match admitted response contract. |
| active requirement obligation | requirements ledger, environment, spans, relations | Subordinate row in proof coverage projection. |
| realization obligation | derived from active requirement obligation and target carrier role | Subordinate row. |
| proof obligation | derived from active requirement obligation and proof policy | Subordinate row. |
| proof shape | requirement proof policy, test relation, invariant/rejection law | Subordinate row. Required to reject weaker proof. |
| depth obligation policy | proof policy, target refs, required depth classes, typed non-applicability/residual/re-entry rows | Subordinate row. Required to reject shallow proof policy. |
| proof strength admission | admitted evidence, proof policy, expected evidence shape, depth classes, coverage rows, adversarial attempts | Subordinate row. Required to reject self-graded strength. |
| plugin candidate kind | missing from current result envelope | Minimal extension/subordinate field. |
| admission target kind | missing from current result envelope | Minimal extension/subordinate field. |
| per-ref evidence role | partial in existing requirement evidence binding | Preserve explicitly; no path-shape inference. |
| replay identity/digest | runtime event and envelope truth | Required binding field; no unpinned plugin output. |
| obligation delta | ABG projection/foldback output | Do not let plugin or graph function emit directly. |
| residual or closure eligibility | ABG residual and assurance fold | Do not let plugin or graph function emit directly. |

## Plugin Boundary

Plugins produce candidate material. They do not own admission, proof coverage,
closure, retry, re-entry, continuation, graph-function selection, prompt
assembly, evidence-role compatibility, or traversal control.

Each requirement-bearing plugin dispatch must be a typed bind over:

```text
selected program/overlay
selected graph function
selected graph vector or traversal unit
selected composition ref and digest
source and target node/type refs
active requirement obligation refs
admitted carrier refs
admitted payload/evidence refs
instruction envelope ref
response contract ref
plugin contract ref
replay identity
```

Each coverage-capable plugin output must bind back to:

```text
stage role and task role
outputCandidateKind
admissionTargetKind
output carrier refs
evidence role refs
source requirement obligation refs
proof obligation refs
proof policy refs
expected evidence shape refs
positive/negative evidence shape refs when required
proof strength refs
depth class refs
proof strength admission refs
adversarial attempt refs
counterexample refs
response contract ref
plugin result interface ref
selected composition ref and digest
replay identity and digest
```

Missing or inconsistent fields produce typed rejection or residual before
coverage or closure.

## Coverage Projection

`RequirementProofCoverageProjection` is read-only. It is built from replay and
shall expose, per active obligation:

- source requirement refs and digests;
- relation refs and span refs;
- active edge and traversal refs;
- realization obligation rows;
- proof obligation rows;
- proof-shape rows;
- admitted realization witness refs;
- admitted verifier artifact refs;
- admitted verifier execution refs;
- admitted semantic assessment refs;
- admitted human decision refs when required;
- plugin candidate admission refs;
- child traversal carry and foldback refs;
- role mismatches, stale refs, digest mismatches, weaker-contract findings,
  missing-proof rows, and missing-realization rows;
- closure eligibility and residual refs.

The projection may be embedded in or joined by `RequirementQueryReadModel`, but
it remains the one authoritative proof-coverage projection family. Downstream
products may query it; they may not write it.

## Assurance And Closure

Requirement folds and assurance claims shall consume proof coverage. A
requirement cannot close when any active applicable obligation has:

- no realization witness;
- no proof witness;
- a mismatched evidence role;
- stale, forged, or digest-mismatched refs;
- a proof shape weaker than the source requirement;
- semantic assessment required but absent;
- human decision required but absent;
- residual pressure from a child traversal foldback.

Passing tests, successful commands, file existence, parseable worker output,
and F_P self-report are evidence only. They close nothing until admitted and
projected as proof coverage.

## Recursive Graph-Function Denotation

Direct GTL graph-function calls are language-level calls. Runtime authority
stays in ABG:

```text
GTL: call G(x)
ABG: bind(parent traversal state, selected call to G)
```

The bind must preserve selected program or overlay ref, caller/callee graph
function refs, selected composition ref and digest, admitted input carrier
refs, active obligation refs, frame/span lineage refs, and replay identity.

Tail-recursive calls denote ABG continuation over the same lineage. They are
not loops in a product shell. The continuation must preserve obligation refs,
residual pressure refs, attempt identity, and replay identity.

Child traversal output affects the parent only through ABG admission, proof
coverage, residual projection, and assurance foldback.

## Implementation Slices

1. Projection kernel: derive `RequirementProofCoverageProjection` from edge
   environment, projections, test relations, proof policies, admitted
   payload/evidence, and existing fulfillment bindings.
2. Plugin-output admission binding: extend/adapt plugin result envelope
   admission to carry candidate kind, admission target, obligation refs,
   proof-shape refs, evidence roles, and replay digest.
3. Instruction assembly integration: require active realization/proof
   obligations and proof shape in requirement-bearing prompt plans.
4. Runtime bind integration: build strict `plugins.C.F_P` input tuples from
   selected traversal unit truth and reject malformed tuples before dispatch.
5. Closure gate: make requirement fold/assurance consume proof coverage.
6. Recursive foldback: project child-call carry-in and foldback over graph
   call/frame/span/continuation truth.
7. Proof lanes: add differential tests and a live installed-sandbox witness.

## Non-Closure Conditions

- A plugin output can close a requirement without source requirement obligation
  refs and proof-shape identity.
- A proof witness can satisfy a stronger requirement through a weaker response
  contract.
- A graph function or plugin emits obligation delta, residual, closure
  eligibility, continuation, re-entry, or retry truth directly.
- A child traversal returns a summary that affects parent closure without ABG
  admission and foldback projection.
- A product-local proof ledger or test-success parser outranks proof coverage.
- A separate disambiguation or ambiguity truth surface is introduced for
  recursion.
- F_D checks are claimed without a known algebra and total output domain.
- F_P validates proof completeness, role compatibility, or closure directly.
