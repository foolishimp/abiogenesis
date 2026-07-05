---
id: T-188
title: Realize requirement proof carry-through over paired realization and proof obligations
type: requirement_design_realization
ticket_category: requirement_proof_carry_through
status: completed
goal: >-
  Make admitted requirements carry through into paired realization obligations
  and proof obligations so generated code/artifacts and generated
  tests/proofs cannot close on a weaker contract than the source requirement.
change_intent: >-
  The odd_glc data-mapper live run exposed a substrate gap: ABG successfully
  traversed the graph and produced both implementation artifacts and proof
  artifacts, but requirement pressure did not force those surfaces to prove
  the same admitted obligations. The result was real code and real tests with
  shallow coverage over the requirement set. This is a generic ABI/GTL gap,
  not a data-mapper-specific defect.
change_class: requirement_reprice
re_entry_point: abg_requirement_proof_carry_through
owner: abiogenesis
priority: high
triaged_at: 2026-07-03
created_at: 2026-07-03
updated_at: 2026-07-05
governance_scope: STDO Method, SPEC_METHOD, DESIGN_MODULE_METHOD, ODD_METHOD, GTL, ABG Runtime, Requirements Algebra, Instruction Assembly, Assurance
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-162-realize-abg-requirements-algebra-strategy.md
  - .ai-workspace/tickets/completed/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md
  - .ai-workspace/tickets/completed/T-168-ratify-gtl-requirement-graph-and-abg-refinement-route.md
  - .ai-workspace/tickets/completed/T-182-realize-causal-carry-in-abg-instruction-rendering.md
  - .ai-workspace/tickets/completed/T-183-design-and-realize-abg-instruction-assembly-semantic-compiler.md
source_documents:
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - .ai-workspace/comments/codex/20260703T083818Z_STRATEGY_recursive_llms_recursive_gtl_disambiguation_graphs.md
  - .ai-workspace/comments/codex/20260703T132216Z_STRATEGY_recursive_obligation_state_machine.md
  - .ai-workspace/comments/codex/20260703T174904Z_STRATEGY_prime_assurance_depth_policy_and_strength_admission.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_PROOF_CARRY_THROUGH_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_PROOF_CARRY_THROUGH_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENT_PROOF_CARRY_THROUGH_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_PLUGIN_RESULT_INTERFACE_CONTRACT_DERIVATION.md
  - /Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/glc_software_build_overlay_live/data-mapper-full/20260703T043509609Z_pid38072/odd-glc-software-build-overlay-live-proof.json
review_status: ready_for_review
proof_status: passed
target_truth: >-
  ABG derives requirement-obligation identities from admitted requirement
  truth, then derives paired realization obligations and proof obligations for
  each active edge. Instruction assembly carries those obligations into F_P
  work. Runtime admission binds realization witnesses and proof witnesses back
  to the same source requirement obligation ids. Assurance fold and closure
  fail closed when an active obligation lacks realization evidence, lacks proof
  evidence, has role-mismatched evidence, has stale/forged evidence, or proves
  only a weaker contract than the admitted requirement. Requirement-bearing
  graph-function calls lower to ABG traversal bind; requirement-bearing tail
  calls lower to ABG continuation; child traversal results fold back into
  parent requirement state only through ABG admission, proof coverage,
  residual, and assurance projections.
  Dependency graph sufficiency is part of the closure surface: build, test,
  proof, release, or app-slice F_P work may dispatch only when the selected
  target has an admitted prerequisite closure or a typed no-dependency/no-op
  policy, unless the selected vector is explicitly a dependency-disambiguation
  traversal. Steel-thread selection is a downstream lifecycle policy view over
  admitted dependency-closed subgraphs; it is not ABG closure truth, dependency
  truth, or proof truth.
  Proof-policy depth completeness is also part of the closure surface:
  replay-derived coverage over declared obligations is not enough when the
  proof policy omitted required depth classes. DepthObligationPolicy remains a
  subordinate projection under proof policy. ProofStrengthAdmission must be
  F_D-checkable over a known algebra or admitted through adversarial
  verification before assurance fold may consume the strength claim.
superseded_truth: >-
  A traversal can generate code and tests as separate artifacts, accept
  command success or test success as enough proof, and close while admitted
  requirement obligations such as type shape, algebraic laws, negative cases,
  or semantic adequacy never carried into the proof surface.
closure_law: >-
  Close only when requirement law, design, TypeScript realization, synthetic
  differential tests, and at least one live installed-sandbox witness prove
  that requirement obligations produce paired realization/proof obligations,
  both witnesses bind to the same obligation ids, proof coverage is
  replay-derived, instruction assembly includes active obligations, and closure
  fails for missing proof, missing realization, role mismatch, weaker-contract
  proof, test-pass-with-uncovered-requirements, incomplete proof-policy depth,
  and unadmitted proof strength. Recursive graph-function calls must be proven
  as ABG traversal bind and tail-recursive calls as ABG continuation, with
  replay-visible obligation carry-in, candidate admission, proof coverage,
  depth completeness, strength admission, residual, and foldback.
non_closure_conditions:
  - Requirement obligations are summarized only in comments, reports, prompts,
    or test files instead of admitted/replay-derived ABI truth.
  - A generated code artifact can close without a proof obligation bound to the
    same source requirement obligation id.
  - A generated test or proof artifact can close a requirement without a
    realization witness bound to the same source requirement obligation id.
  - Passing tests, command success, worker self-report, parseable responses, or
    generated file existence become requirement closure without replay-derived
    obligation coverage.
  - A proof surface can agree with implementation on a weaker contract and
    still close the stronger admitted requirement.
  - A proof artifact, verifier execution, semantic assessment, or plugin output
    can contribute to requirement closure without preserving proof obligation
    refs, proof policy refs, expected evidence shape refs, positive/negative
    evidence shape refs when required, and proof strength or coverage-strength
    refs.
  - A covered obligation set can close while the governing proof policy lacks
    declared depth-obligation class completeness, typed non-applicability rows,
    residual rows, or re-entry rows for required depth classes.
  - `DepthObligationPolicy` is implemented as a peer proof policy, writable
    ledger, local checklist, closure enum, or product-owned truth surface
    instead of a subordinate proof-policy projection over admitted refs.
  - A proof strength label, worker self-assessment, passing command, prompt
    response shape, or caller-supplied `proofStrengthRef` becomes closure
    truth without admitted `ProofStrengthAdmission` or equivalent admitted
    F_D-checkable/adversarial verification projection.
  - Proof-strength admission is called F_D without a declared total function
    over admitted evidence, proof policy, expected evidence shape, depth
    classes, coverage rows, and typed rejection or gap outcomes.
  - Assurance fold, lifecycle closure, release proof, or downstream read-model
    closure consumes startup-carried `dependencyClosed`, `depthComplete`,
    `proofStrengthAdmitted`, or equivalent default instruction-startup flags as
    authoritative proof truth instead of deriving dependency sufficiency,
    depth completeness, and proof-strength admission from admitted
    replay-visible coverage, strength, dependency, and typed-gap projections.
  - An adversarial proof-strength route records a review result but does not
    preserve admitted adversarial attempt refs, counterexample refs when
    present, disposition, and replay identity.
  - F_P decides requirement coverage, proof completeness, role compatibility,
    or closure without F_D projection over admitted refs.
  - Downstream products mint local requirement-proof ledgers, local coverage
    tables, local closure registers, or local test-success surfaces that
    outrank ABG replay-derived coverage.
  - Instruction assembly omits active proof obligations while asking a worker
    to produce a realization artifact for the same source requirement.
  - Assurance fold, lifecycle disposition, release proof, or downstream read
    model claims closure while active requirement obligations remain uncovered,
    residualized, stale, mismatched, or semantically unresolved.
  - Traversal plugin outputs are treated as admitted realization evidence,
    proof evidence, coverage truth, closure truth, retry/re-entry truth, or
    graph-function selection truth before ABG admits them through the declared
    plugin result interface, response contract, payload/evidence law, and
    active requirement obligation ids.
  - Plugin contracts do not declare enough typed boundary information for ABG
    to prove which selected edge, node types, admitted inputs, output candidate
    kinds, evidence roles, and requirement obligation ids the plugin output is
    allowed to affect.
  - The design collapses `plugin.transform.C`, `plugin.evaluate.C`,
    `plugin.consequence.C`, or external human callout task-role outputs into
    one undifferentiated plugin result shape instead of preserving their
    API-level output mappings and admission targets.
  - External human callout is modeled as a fourth peer stage category instead
    of a task role inside a declared transform, evaluate, or consequence stage.
  - A `plugins.C.F_P` invocation accepts prompt prose, local plugin state,
    workspace paths, caller-selected refs, or partially typed runtime bundles
    instead of an algebraically composable traversal-monad input tuple.
  - A `plugins.C.F_P` output can feed payload ledgers, requirement proof
    coverage, assurance, consequence bind, continuation, or residual projection
    without composing against the selected traversal-unit output algebra and
    admitted plugin result interface.
  - `plugin.consequence.C` output is treated as traversal transition,
    next-vector selection, retry, re-entry, continuation opening, replay truth,
    or closure instead of inert candidate consequence material requiring ABG
    admission and allowed-catalog validation.
  - Plugin output classification is caller-asserted instead of ABG-derived
    from selected composition, selected stage binding, admitted plugin
    contract, admitted result interface, and candidate-kind/admission-route
    mapping.
  - Requirement/proof pairing is supplied as caller-owned flat lists instead
    of derived from `GtlContractFulfillmentBinding` or its admitted projection,
    allowing requirement obligation refs and proof refs to co-occur without
    preserving the actual pairing.
  - One plugin output can be admitted under multiple stage categories, evidence
    roles, or admission routes without an explicit replay-visible classifier.
  - A requirement-bearing graph-function call is implemented as a product-local
    runtime callback, direct vector harness, prompt shell, worker-selected next
    vector, or local traversal loop instead of ABG traversal bind.
  - A requirement-bearing tail-recursive graph-function call is implemented as
    a local retry controller instead of ABG continuation over preserved
    obligation lineage and residual pressure.
  - A child graph-function traversal returns summaries, obligation deltas,
    residuals, closure eligibility, re-entry truth, or continuation truth that
    affect the parent without ABG admission, replay-derived proof coverage,
    residual projection, and assurance foldback.
  - The design introduces a separate ambiguity, entropy, disambiguation, or
    recursive-agent truth surface that can outrank admitted GTL/ABG carriers
    and projections.
  - The semantic compiler renders an F_P prompt for build, test, proof,
    release, or app-slice work before target dependency sufficiency is known
    through admitted dependency graph truth, prerequisite closure, or an
    explicit typed no-dependency/no-op policy.
  - Dependency graph discovery is treated as product-local prompt prose,
    file-system inference, or worker-selected structure instead of admitted
    candidate dependency nodes/edges projected by ABG.
  - GLC, SDLC, or another downstream product mints a local steel-thread,
    dependency-map, proof-slice, or module-decomposition truth surface that
    outranks ABG admitted dependency graph, obligation lineage, proof
    coverage, residual, or foldback projections.
required_work:
  - >-
    Phase 0 - Requirement law: Ratify
    REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH and reconcile it with
    requirements algebra, instruction assembly, payload/evidence, and
    assurance law. This includes clauses `032` through `037` for
    proof-policy depth completeness, subordinate `DepthObligationPolicy`,
    typed depth incompleteness outcomes, `ProofStrengthAdmission`, and
    F_D-checkable or adversarially verified proof strength.
  - >-
    Phase 1 - Design pack: Produce a DESIGN_MODULE_METHOD derivation, IACS,
    and structural carrier diagram for requirement obligation identities,
    paired realization/proof obligations, proof-shape identity, traversal
    plugin contracts, strict traversal-monad plugin input/output algebra,
    per-stage plugin API output mappings, coverage projection, coverage events
    or admitted payload shapes, recursive graph-function call denotation,
    child traversal frame/span and foldback projection, tail-recursive
    continuation over preserved obligation lineage, instruction-assembly
    binding, proof-policy depth completeness, proof-strength admission,
    assurance-fold gating, and query surfaces. The design shall prove that
    `DepthObligationPolicy` is subordinate to proof policy and that
    `ProofStrengthAdmission` is subordinate to proof coverage/assurance, not a
    peer closure surface.
  - >-
    Phase 2 - Semantic compiler integration: Extend the compiler so active
    requirement obligations become explicit instruction-plan coverage inputs.
    The compiler must reject prompt plans that ask for a realization artifact
    while omitting proof obligations for the same requirement ids. The compiler
    must also prove that each `plugins.C.F_P` input tuple is total over known
    selected program, graph, vector, composition, node type, obligation,
    payload/evidence, response-contract, plugin-contract, and replay algebras.
    The compiler must also derive dependency-sufficiency instruction truth and
    reject F_P dispatch for build/test/proof/release/app-slice work when the
    target prerequisite closure is unknown, unless the selected vector is
    explicitly a dependency-disambiguation traversal.
    The compiler must also derive proof-policy depth instruction truth for
    requirement-bearing target work. A target-work prompt that claims build,
    test, proof, release, or app-slice closure must reject with
    `depth_policy_incomplete`, `missing_depth_obligation_class`,
    `depth_class_not_applicable_unjustified`, or
    `proof_strength_not_admitted` when the selected proof policy has not
    declared required depth classes or admitted strength criteria. F_P
    validation traversals may propose depth or strength critiques only as
    evidence; the compiler approval remains F_D over known algebra and
    admitted inputs.
  - >-
    Phase 3 - Runtime projection: Implement replay-derived coverage projection
    from admitted requirements, edge environments, payload/evidence events,
    verifier artifacts, verifier executions, semantic assessments, and
    admitted plugin result envelopes or actor outputs that bind to declared
    plugin contracts, per-stage API output mappings, proof-shape identity, and
    active obligation ids. Runtime projection must also bind
    requirement-bearing graph-function calls as ABG child traversal frames or
    spans, bind tail-recursive calls as ABG continuation over the same
    graph-function lineage, and fold child obligation results back into parent
    requirement state only through admitted coverage, residual, and assurance
    projections. Runtime projection must also expose proof-policy depth
    completeness and proof-strength admission rows sufficient for assurance
    fold to reject shallow policies and weak evidence without asking the
    worker to self-grade closure.
    The design shall answer the pre-implementation fork as: existing
    hook/result-interface carriers are not sufficient by themselves; T-188
    needs a minimal output-carrier extension for candidate-kind/admission-route
    mapping, source requirement obligation refs, per-ref evidence role, replay
    identity/digest, proof-shape identity, and ABG-derived classification.
  - >-
    Phase 4 - Closure gating: Make assurance fold or convergence consume
    requirement proof coverage before requirement closure. Missing realization,
    missing proof, role mismatch, stale refs, semantic unresolved state, and
    weaker-contract proof shall preserve residual or route re-entry instead of
    closing. Closure shall also fail when proof coverage is complete but
    proof-policy depth completeness is incomplete, or when proof strength has
    not been admitted through F_D-checkable criteria or adversarial
    verification.
  - >-
    Phase 5 - Differential tests: Add tests for missing proof, missing
    realization, proof-role mismatch, test-pass-with-uncovered-requirement,
    weaker-contract implementation/proof agreement, F_P self-approval, and
    downstream local coverage ledger attempts. Include plugin seam tests where
    a plugin returns candidate output for the wrong edge, wrong evidence role,
    wrong obligation id, insufficient proof strength, missing proof-shape
    identity, or with forbidden authority; ABG shall reject or residualize
    those candidates before coverage or closure. Include strict
    traversal-monad tests where a plugin input omits or mismatches selected
    composition, selected vector, node type, response contract, plugin contract,
    active obligation ids, or admitted carrier refs; dispatch shall fail before
    F_P. Include recursive-call tests where a graph-function call opens a child
    traversal with obligation carry-in and foldback, and tail-recursion tests
    where retry or continuation is ABG continuation rather than product-local
    loop state. Include prime-assurance tests where happy-path-only proof
    coverage is complete but depth policy is incomplete, where a required
    negative/boundary/regression/invariant/dependency/semantic-adequacy depth
    class is missing, where a not-applicable row is unjustified, where a
    worker-supplied strength label is rejected, and where adversarial
    verification finds a counterexample.
  - >-
    Phase 6 - Live witness: Re-run a GLC-style installed-sandbox scenario that
    includes implementation and verifier artifacts. The witness shall show
    requirement obligations carried into both surfaces and shall include at
    least one negative or residual case where a requirement remains uncovered
    or depth-incomplete rather than silently closing. The live witness shall
    distinguish coverage-complete-but-shallow from coverage-complete-and-deep
    by showing the former residualizes or re-enters and the latter is eligible
    only after proof strength is admitted.
  - >-
    Phase 7 - Proof lane wiring: Add focused package scripts `test:t188` and
    `test:t188:live` or ratified equivalent commands so the closure proof
    commands are executable release gates rather than aspirational names.
acceptance_criteria:
  - Active requirement obligations have stable replay-derived ids.
  - Each active obligation derives paired realization and proof obligations or
    a typed gap/residual.
  - Realization and proof witnesses bind to the same source obligation ids.
  - Instruction assembly includes the active obligation/proof shape for
    requirement-bearing F_P work.
  - Instruction assembly includes dependency-sufficiency truth for
    requirement-bearing build/test/proof/release/app-slice F_P work.
  - The semantic compiler rejects target work with
    `dependency_sufficiency_gap`, `typed_prerequisite_gap`,
    `unresolved_requirement_node`, or `missing_dependency_edge` when the
    target prerequisite closure is unknown.
  - The semantic compiler allows dependency-disambiguation traversal before a
    dependency graph is sufficient, but does not let that traversal claim
    target build/test/proof/release closure.
  - Steel-thread or proof-slice selection is admitted only as policy-selection
    fact or traversal candidate over ABG dependency-closed subgraph truth.
  - Proof coverage is replay-derived and read-only.
  - Closure fails when code/artifact evidence exists but proof evidence is
    missing.
  - Closure fails when proof/test evidence exists but realization evidence is
    missing.
  - Closure fails when proof evidence targets a weaker contract than the
    admitted requirement.
  - Closure fails when proof evidence lacks proof obligation refs, proof policy
    refs, expected evidence shape refs, positive/negative evidence shape refs
    when required, or proof strength refs sufficient to compare it with the
    admitted requirement obligation.
  - Closure fails when proof coverage is complete over declared obligations
    but the governing proof policy lacks declared depth-obligation class
    completeness for the selected target.
  - `DepthObligationPolicy` or equivalent projection is subordinate to proof
    policy and carries required depth classes, typed not-applicable rows,
    residual/re-entry rows, and required adversarial checks without becoming a
    peer closure surface.
  - The semantic compiler rejects target work with
    `depth_policy_incomplete`, `missing_depth_obligation_class`,
    `depth_class_not_applicable_unjustified`, or
    `proof_strength_not_admitted` when depth or strength authority is absent.
  - `ProofStrengthAdmission` preserves strength refs, source obligation refs,
    proof obligation refs, proof policy refs, expected evidence shape refs,
    depth class refs, verifier/adversarial attempt refs, counterexample refs
    when present, disposition, and replay identity.
  - Proof strength is admitted only by a total F_D criterion over known
    admitted proof/evidence/depth algebra or by admitted adversarial
    verification; F_P strength self-assessment remains evidence only.
  - Coverage-capable plugin outputs carry or replay-derive
    `outputCandidateKind`, `admissionTargetKind`,
    `sourceRequirementObligationRefs`, per-output or per-evidence-role refs,
    and replay identity/digest.
  - Closure fails when proof role does not match the active proof obligation.
  - Passing tests alone do not close requirements with uncovered obligations.
  - Downstream consumers can query proof coverage without access to admission,
    emission, fold, or closure commands.
  - Traversal plugin contracts are typed candidate-output boundaries, not
    requirement coverage, evidence admission, selection, retry, re-entry, or
    closure authority.
  - The design preserves separate API-level output mappings for
    `plugin.transform.C`, `plugin.evaluate.C`, `plugin.consequence.C`, and
    external human callout task-role outputs.
  - Plugin outputs cannot affect requirement proof coverage until ABG admits
    them against declared plugin result interfaces, response contracts,
    evidence roles, and active requirement obligation ids.
  - `plugins.C.F_P` dispatch fails before worker invocation when its input
    tuple is not algebraically composable with the selected traversal unit.
  - `plugins.C.F_P` output fails admission when it is not algebraically
    composable with the selected traversal-unit output contract and active
    obligation ids.
  - `plugin.consequence.C` outputs are admitted only as candidate consequence
    material and cannot directly transition traversal or select the next unit.
  - Plugin output category is ABG-derived and cross-category unique or
    explicitly disambiguated.
  - External human callout is modeled as a task role within a declared stage,
    not as a fourth peer stage.
  - Requirement-bearing GTL graph-function calls are realized as ABG traversal
    bind with replay-visible caller/callee, composition, frame/span, input,
    obligation, and replay identity.
  - Requirement-bearing tail-recursive graph-function calls are realized as ABG
    continuation over preserved obligation lineage and residual pressure.
  - Child traversal output affects parent obligation state only through ABG
    admission, proof coverage, residual, and assurance foldback projections.
  - No ambiguity, entropy, disambiguation, recursive-agent, local retry, or
    direct-vector truth surface is introduced as a peer source of traversal or
    closure truth.
  - `test:t188` and `test:t188:live` or ratified equivalents exist and execute
    the synthetic and live proof lanes.
proof_commands:
  - git diff --check
  - rg -n "REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-0(01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37)" specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md
  - rg -n "REQ-R-ABG3-INSTRUCTION-ASSEMBLY-016" specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md
  - sed -n '360,800p' .ai-workspace/tickets/active/T-188-realize-requirement-proof-carry-through.md | rg -n "DerivedDependencyInstructionTruth|dependency_sufficiency_gap|typed_prerequisite_gap|unresolved_requirement_node|missing_dependency_edge|admit_project_dependency_graph|derive_dependency_closed_subgraphs|select_software_build_steel_thread_view|TypedPrerequisiteGaps"
  - rg -n "DepthObligationPolicy|ProofStrengthAdmission|depth_policy_incomplete|missing_depth_obligation_class|depth_class_not_applicable_unjustified|proof_strength_not_admitted|adversarial_counterexample_found" specification/requirements/abg/REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH.md .ai-workspace/tickets/active/T-188-realize-requirement-proof-carry-through.md
  - cd build_tenants/abiogenesis/typescript && npm run test:t188
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - cd build_tenants/abiogenesis/typescript && CODEX_LIVE_FP=1 npm run test:t188:live
notes:
  - >-
    The data mapper is a witness for the gap, not the source of ABI policy.
    ABI owns the generic carry-through mechanism; odd_glc and other downstream
    products own their domain requirement content and proof policies.
  - >-
    This ticket does not authorize local product coverage ledgers or
    product-local closure registers. Products may provide declarations,
    verifier commands, semantic rubrics, and evidence; ABG owns admission,
    projection, assurance fold, residual, and closure truth.
---

# T-188: Requirement Proof Carry-Through

This ticket is active. It exists because the generated realization and proof
surfaces must be paired by admitted requirement obligations, not merely
produced in the same run.

## Design Disambiguation Before Execution

This ticket shall not implement a new requirements algebra, prompt algebra, or
plugin runtime. The design work must first show how the existing algebras
compose at traversal time.

The current substrate already has:

- graph algebra for selected program, graph overlay, graph function, vector,
  node type, and traversal identity;
- instruction assembly for compiled prompt plans, causal carry, renderer
  authority, response contracts, and non-tautology;
- requirements algebra for admitted requirement terms, relations, spans,
  projections, evidence bindings, fold, residual, disposition, and query;
- payload/evidence admission for runtime artifacts, verifier artifacts,
  verifier executions, and semantic assessments;
- plugin and hook surfaces for declared hook refs, compute-plugin categories,
  plugin result interfaces, and admitted plugin result envelopes;
- assurance and convergence for closure, residual, continuation, and re-entry.

The unresolved design seam is:

```text
selected traversal edge
  -> instruction envelope
  -> plugin / worker / verifier / tool
  -> candidate output
  -> ABG admission
  -> requirement proof coverage
  -> assurance fold / residual / closure
```

## Explicit Dependency Graph And Steel-Thread Design

T-188 treats dependency graph truth as generic ABI/GTL substrate and steel
thread as downstream lifecycle policy over that truth.

Use one edge orientation:

```text
a -> b means b depends on a.
```

Let:

```text
R0 = bootstrap requirement source supplied by workspace/config
R  = admitted requirement nodes
D  = admitted dependency / design / module / artifact / proof nodes
V  = R union D
G  = (V, E, type, source)

E = E_RR union E_DD union E_RD

E_RR subset R x R  requirement-to-requirement dependency
E_DD subset D x D  dependency-to-dependency dependency
E_RD subset R x D  requirement-to-dependency obligation binding
```

The prerequisite closure of a target set is:

```text
Pred*(S) =
  least fixed point containing S and every x where x -> y and y in S
```

A dependency-closed candidate subgraph for target `T` is:

```text
Candidate(T) = induced_subgraph(G, Pred*(T))
```

Generic substrate functions:

```text
bootstrap_requirements:
  Bootstrap.R -> RequirementSet

admit_project_dependency_graph:
  { RequirementGraph, DependencyNodeDeclarations, DependencyEdgeDeclarations }
    -> { DependencyGraphProjection, TypedPrerequisiteGaps }

derive_dependency_closed_subgraphs:
  { DependencyGraphProjection, ObligationLineage, ProofPolicy, TargetRefs }
    -> { CandidateSubgraphs, UncoveredObligations, TypedPrerequisiteGaps }
```

Downstream lifecycle policy may then define:

```text
select_software_build_steel_thread_view:
  { CandidateSubgraphs, LifecyclePolicy }
    -> { SelectedThreadView, Rationale }
```

The first three are ABI/GTL substrate capabilities. The last is GLC/SDLC
policy. A selected steel-thread view may become an admitted policy-selection
fact or traversal candidate. It does not become dependency truth, proof truth,
closure truth, or a local controller.

The compiler and runtime shall therefore enforce:

```text
Steel thread is selected from a sufficiently disambiguated dependency graph,
not from raw requirements.
```

For app-building, "sufficiently disambiguated" normally means admitted
requirements, module/dependency candidate nodes, requirement-to-dependency
bindings, target artifact/proof surfaces, and explicit typed prerequisite gaps
or residuals. Product/F_P output may propose these nodes and edges, but ABG
must admit/project them before F_D prerequisite closure or prompt relevance can
consume them.

## Semantic Compiler Design Impact

The semantic compiler is the dispatch-assurance gate for dependency graph
maturity. It must reject target work prompts that would bypass dependency
sufficiency.

Add or map a derived instruction truth shape:

```text
DerivedDependencyInstructionTruth = {
  dependencyGraphRef,
  dependencyGraphDigest,
  targetRefs,
  prerequisiteNodeRefs,
  prerequisiteEdgeRefs,
  dependencyClosed,
  typedPrerequisiteGapRefs,
  noDependencyPolicyRef
}
```

This is ABG-derived instruction truth over admitted dependency graph,
obligation lineage, proof policy, runtime refs, and typed gap refs. It is not
product policy and not a new GTL declaration surface.

The semantic compiler's known-algebra set shall include or be explicitly
mapped to:

```text
dependency_graph_projection
prerequisite_closure
dependency_sufficiency
obligation_lineage
proof_coverage
```

Compiler behavior:

| State | Required compiler decision |
| --- | --- |
| Raw requirements exist but no dependency graph exists | Compile only dependency-disambiguation traversal, not build/test/proof/release/app target work. |
| Dependency graph exists but target prerequisite closure has typed missing-node or missing-edge gaps | Reject target work with typed prerequisite gaps. |
| Dependency graph is sufficient for the target | Render only the dependency-closed subgraph relevant to the selected target. |
| P0 deterministic edge can discharge through admitted truth | Render no F_P prompt. |
| F_P validation traversal reviews a candidate prompt plan | Admit the review only as evidence; F_D still approves or rejects. |

New or mapped compiler issue kinds:

```text
dependency_sufficiency_gap
typed_prerequisite_gap
unresolved_requirement_node
missing_dependency_edge
```

Prompt relevance becomes:

```text
selected vector
  + admitted prerequisite closure
  + active obligations
  + proof policy
  + admitted causal inputs
```

not:

```text
selected vector + local prompt context
```

This is the compiler-level guard against shallow smoke-test prompts pretending
to be lifecycle/build prompts.

## Prime Assurance Depth And Strength Design

T-188's coverage machine is necessary but not sufficient. It proves that
admitted evidence covers declared obligations. It does not, by itself, prove
that the proof policy declared enough obligations to make the closure claim
deep.

The prime assurance signal is:

```text
declared proof-policy depth completeness
```

This is subordinate to proof policy. It is not a new proof policy, depth
ledger, local checklist, or closure surface.

The derived subordinate projection is:

```text
DepthObligationPolicy = {
  proofPolicyRef,
  targetRefs,
  requiredDepthClassRefs,
  declaredDepthObligationRefs,
  notApplicableRows,
  residualRows,
  reentryRows,
  requiredAdversarialCheckRefs,
  replayIdentity
}
```

The default depth classes for software-build and GLC-style lifecycle work are
policy declarations, not ABG product policy. The generic projection must be
able to check classes such as:

| Depth class | Required signal |
| --- | --- |
| positive behavior | intended path evidence |
| negative / rejection behavior | invalid or forbidden case evidence |
| boundary / error behavior | edge-case or failure-mode evidence |
| regression behavior | existing guarantee preservation evidence |
| invariant / algebraic law | structural law evidence |
| integration / dependency behavior | dependency-composition evidence |
| semantic adequacy | admitted semantic assessment evidence |

If a depth class does not apply, the proof policy must carry typed
non-applicability, residual, or re-entry truth. Omission is a typed gap.

Compiler issue kinds:

```text
depth_policy_incomplete
missing_depth_obligation_class
depth_class_not_applicable_unjustified
proof_strength_not_admitted
proof_strength_not_adversarially_verified
adversarial_counterexample_found
```

Proof strength is a separate admitted projection:

```text
ProofStrengthAdmission = {
  strengthRef,
  sourceRequirementObligationRefs,
  proofObligationRefs,
  proofPolicyRefs,
  expectedEvidenceShapeRefs,
  depthClassRefs,
  verifierRefs,
  adversarialAttemptRefs,
  counterexampleRefs,
  disposition,
  replayIdentity
}
```

The design rule is strict:

```text
coverage complete
  + depth policy incomplete
  -> non-closing residual / re-entry / block

coverage complete
  + depth policy complete
  + proof strength not admitted
  -> non-closing residual / re-entry / block
```

An F_D proof-strength criterion is lawful only as a total function over a known
algebra and admitted inputs. It must name the admitted evidence rows, proof
policy, expected evidence shape, depth classes, coverage rows, and typed
rejection or gap outcomes. Otherwise the strength route must be adversarial
verification evidence admitted by ABG. In both cases, F_P may propose strength
or critique strength, but it cannot approve its own strength claim.

Instruction assembly shall carry depth and strength pressure when target work
is requirement-bearing:

```text
DerivedProofDepthInstructionTruth = {
  depthPolicyRef,
  depthPolicyDigest,
  requiredDepthClassRefs,
  declaredDepthObligationRefs,
  typedDepthGapRefs,
  proofStrengthAdmissionRefs,
  adversarialVerificationRefs
}
```

`DerivedProofDepthInstructionTruth` is a compiler/projection payload over
proof policy, coverage, and admitted evidence. It is not a GTL declaration
carrier and not a product-local proof checklist.

The plugin may produce candidate material only. It may not own admission,
requirement coverage, closure, retry, re-entry, graph-function selection,
prompt assembly, evidence role compatibility, or traversal control.

The traversal monad is strict. A plugin call is not a free callback inside a
worker shell; it is a typed bind in the selected `TraversalUnit<A, B>`.
Therefore `plugins.C.F_P` inputs and outputs must be algebraically composable
over admitted GTL/ABG carriers.

For T-188, traversal plugin declaration and output-envelope fields are
separate. The declaration says what a plugin is allowed to produce. The output
envelope says what one admitted result actually produced. The two shall not be
collapsed into one carrier.

Plugin contract declaration fields:

| Field | Purpose | Owner |
| --- | --- | --- |
| `pluginRef` | stable plugin identity | GTL declaration / ABG admission |
| `stageRole` / `taskRole` / `purpose` | `transform`/candidate construction, `evaluate`/candidate evaluation, `consequence`/projection, or external human callout as a task role inside one of those stages | GTL compute notation / ABG admission |
| `appliesToGraphFunctionRefs` | callable graph-function scope | GTL declaration |
| `appliesToGraphVectorRefs` | edge/vector scope | GTL declaration |
| `sourceNodeTypeRefs` / `targetNodeTypeRefs` | typed traversal boundary or admitted type family | GTL declaration |
| `inputCarrierRefs` | admitted refs the plugin may read | ABG runtime binding |
| `selectedTraversalRefs` | selected program/overlay, graph function, graph vector or traversal unit, frame/span, and composition refs/digests | ABG traversal replay |
| `requiredRequirementObligationRefs` or classes | obligation pressure the plugin must address | ABG requirements projection |
| `proofObligationRefs` / `proofPolicyRefs` | proof obligations and policies the output may satisfy | ABG requirements projection |
| `depthPolicyRefs` / `requiredDepthClassRefs` | subordinate proof-policy depth classes the output may affect | ABG requirements projection |
| `expectedEvidenceShapeRefs` | required positive, negative, invariant, rejection-case, algebraic-law, or forbidden-behavior evidence shape | ABG requirements projection |
| `proofStrengthRefs` | declared coverage or proof-strength relation used to reject weaker-contract proof | ABG requirements projection |
| `requiredAdversarialCheckRefs` | adversarial verification required before strength admission | ABG requirements projection |
| `outputCandidateKinds` | candidate artifact/evidence/assessment kinds the plugin may return | GTL/ABG contract |
| `admissionTargetKinds` | ABG admission route for each candidate kind | ABG admission law |
| `proofRoleRefs` | realization, verifier-artifact, verifier-execution, or semantic-assessment role | requirements algebra |
| `fdValidationPredicateRefs` | total checks ABG applies after output | ABG F_D law |
| `authorityDenied` | forbidden plugin authorities | GTL declaration / ABG admission |
| `replayIdentityPolicyRefs` | required replay/provenance identity policy | GTL declaration / ABG admission |

Admitted output-envelope fields:

| Field | Purpose | Owner |
| --- | --- | --- |
| `stageRole` / `taskRole` | realized stage/task category for this result | ABG-derived classification |
| `outputCandidateKind` | candidate kind this result produced | admitted output envelope |
| `admissionTargetKind` | ABG admission route for this result | admitted output envelope |
| `sourceRequirementObligationRefs` | source obligation ids the output claims to carry | ABG requirements projection / output envelope |
| `evidenceRoleRefs` | realization, verifier-artifact, verifier-execution, or semantic-assessment roles for this output | admitted output envelope |
| `proofObligationRefs` / `proofPolicyRefs` | proof shape the output claims to satisfy | admitted output envelope |
| `depthClassRefs` | depth classes this output claims to address | admitted output envelope |
| `expectedEvidenceShapeRefs` / `positiveEvidenceShapeRefs` / `negativeEvidenceShapeRefs` | expected proof-shape identity for this output | admitted output envelope |
| `proofStrengthRefs` | coverage-strength relation for this output | admitted output envelope |
| `proofStrengthAdmissionRefs` / `adversarialAttemptRefs` / `counterexampleRefs` | admitted strength and adversarial verification refs when this output participates in closure | admitted output envelope / ABG proof projection |
| `replayIdentity` / `replayDigest` | result identity and digest used for admission/replay | ABG runtime truth |

The strict input tuple for a requirement-bearing `plugins.C.F_P` dispatch is:

```text
(
  selectedProgramOrOverlayRef,
  selectedGraphFunctionRef,
  selectedGraphVectorOrTraversalUnitRef,
  selectedCompositionRef,
  selectedCompositionDigest,
  sourceNodeRef,
  targetNodeRef,
  sourceTypeRef,
  targetTypeRef,
  activeRequirementObligationRefs,
  admittedCarrierRefs,
  admittedPayloadEvidenceRefs,
  instructionEnvelopeRef,
  dependencyInstructionTruthRef,
  dependencyInstructionTruthDigest,
  proofDepthInstructionTruthRef,
  proofDepthInstructionTruthDigest,
  dependencyGraphRef,
  dependencyGraphDigest,
  typedPrerequisiteGapRefs,
  responseContractRef,
  pluginContractRef,
  replayIdentity
)
```

For target build/test/proof/release/app-slice work, `instructionEnvelopeRef`
shall dereference to replay-visible `DerivedDependencyInstructionTruth`, and
the tuple shall carry the dependency instruction truth ref/digest explicitly.
Dependency-disambiguation vectors may carry typed prerequisite gaps as their
target pressure; target artifact vectors may not treat those gaps as closure.

The strict output tuple for a requirement-bearing `plugins.C.F_P` result is:

```text
(
  stageRole,
  taskRole,
  outputCandidateKind,
  admissionTargetKind,
  outputCarrierRefs,
  producedCarrierRefs,
  evidenceRoleRefs,
  sourceRequirementObligationRefs,
  proofObligationRefs,
  proofPolicyRefs,
  depthClassRefs,
  expectedEvidenceShapeRefs,
  positiveEvidenceShapeRefs,
  negativeEvidenceShapeRefs,
  proofStrengthRefs,
  proofStrengthAdmissionRefs,
  adversarialAttemptRefs,
  counterexampleRefs,
  responseContractRef,
  pluginResultInterfaceRef,
  selectedCompositionRef,
  selectedCompositionDigest,
  replayIdentity,
  replayDigest
)
```

ABG shall reject or residualize any input or output tuple that is not
composable with the selected traversal-unit algebra. Prompt prose, local
workspace paths, plugin-local state, and caller-selected refs are not sufficient
composition inputs unless they have already entered as admitted carrier,
payload, evidence, or workspace-binding truth.

The API-level output mapping is part of the contract. The design shall keep the
stage categories separate:

| Stage category | Plugin responsibility | ABG responsibility |
| --- | --- | --- |
| `plugin.transform.C` | Produce candidate realization, artifact, payload, or evidence material in the declared output carrier shape. | Admit or reject the candidate under target carrier, response contract, payload/evidence law, selected edge, and active requirement obligations. |
| `plugin.evaluate.C` | Produce candidate evaluation findings, metrics, semantic judgments, residual proposals, or disposition proposals in the declared evaluation output shape. | Admit or reject the finding, project evaluation-set truth, and feed assurance/residual law without letting the finding own closure. |
| `plugin.consequence.C` | Produce candidate consequence projection or candidate `ConsequenceTraversalAction` material in the declared consequence output shape. | Admit or reject the consequence candidate through ABG consequence admission and allowed traversal catalog law before any traversal transition, continuation, re-entry, retry, or next-unit selection. |
| external human callout task role | Produce candidate human decision material inside a declared transform, evaluate, or consequence stage. | Admit or reject the human decision under that stage's admission law and project its effect through ABG assurance, continuation, or re-entry law. |

The design shall reuse the existing plugin result interface and hook model
unless it proves a specific expressiveness gap. Current plugin result
interface rows preserve stage, carrier, identity, selector-authority, and
evidence refs, but they do not by themselves prove proof-obligation identity,
expected evidence-shape identity, or proof-strength identity. The T-188 design
must either map those refs from existing requirements/proof carriers into the
admission path or add the minimal missing declaration/admission fields. Any new
carrier must be a subordinate payload/projection in the DMM IACS, not a
parallel plugin truth surface.

The design fork is answered for T-188:

```text
Can the existing GTL hook/plugin-result declarations plus ABG admission
express every candidate-output boundary needed for requirement proof
carry-through?

No. They are close, but not sufficient by themselves.
```

The missing surface is not a new plugin algebra. It is a minimal output-carrier
extension and admission mapping for:

- `outputCandidateKind`
- `admissionTargetKind`
- `sourceRequirementObligationRefs`
- per-output or per-evidence-role refs
- `replayIdentity` / `replayDigest`
- proof-shape identity refs: `proofObligationRefs`, `proofPolicyRefs`,
  expected positive/negative evidence shape refs, and proof-strength refs
- depth-policy identity refs: `depthPolicyRefs`, `depthClassRefs`,
  required adversarial check refs, proof-strength admission refs,
  adversarial attempt refs, and counterexample refs when present

The design shall reuse `GtlContractFulfillmentBinding` or its admitted
projection for realization/proof pairing where sufficient. It shall reuse
`EnginePluginInput` for selected-edge identity rather than re-carrying a
parallel edge identity on output carriers. Category classification shall be
ABG-derived and cross-category unique unless explicitly disambiguated by an
admitted classifier.

This answer is now part of the ticket. Realization may start only after the
design pack shows exactly where the minimal extension lands and proves it does
not create a duplicate plugin algebra, duplicate requirement algebra, or
product-local proof surface.

## Reviewable Implementation Breakdown

### Phase A - Requirement And Design Alignment

- Dependency sufficiency is anchored by
  `REQ-R-ABG3-INSTRUCTION-ASSEMBLY-016`. Realization shall trace compiler
  dependency-sufficiency rejection to that clause and to clauses `004A`,
  `006`, `008`, and `015`.
- Update the T-188 design pack so dependency graph sufficiency is represented
  as ABG-derived instruction truth, not product policy.
- Extend the structural carrier diagram with
  `DerivedDependencyInstructionTruth` as a subordinate instruction/projection
  payload, not a new GTL declaration carrier.
- Extend the structural carrier diagram with
  `DerivedProofDepthInstructionTruth`, `DepthObligationPolicy`, and
  `ProofStrengthAdmission` as subordinate proof-policy/projection payloads.
  The diagram shall show they do not write runtime truth, select traversal, or
  close requirements.

### Phase B - Compiler Surface

- Extend instruction assembly known algebra or add a mapping table for:
  `dependency_graph_projection`, `prerequisite_closure`,
  `dependency_sufficiency`, `obligation_lineage`, and `proof_coverage`.
- Extend instruction assembly known algebra or add a mapping table for:
  `proof_policy_depth_completeness`, `depth_obligation_policy`,
  `proof_strength_admission`, `adversarial_verification`, and
  `coverage_strength`.
- Add typed compiler issues for dependency sufficiency gaps.
- Add typed compiler issues for depth policy and proof strength gaps.
- Extend compile input or derived truth mapping so target work sees
  prerequisite closure and typed prerequisite gaps.
- Reject build/test/proof/release/app-slice prompts when dependency
  sufficiency is unknown.
- Reject build/test/proof/release/app-slice prompts when proof-policy depth is
  incomplete or proof strength is not admitted for a closure-bearing target.
- Allow dependency-disambiguation vectors to dispatch before graph sufficiency,
  while preventing them from closing target work.

### Phase C - Runtime / Projection Binding

- Map admitted requirement graph, dependency node declarations, dependency
  edge declarations, obligation lineage, and proof policy into the compiler
  dependency truth.
- Map proof policy, depth-class declarations, not-applicable/residual/re-entry
  rows, expected evidence shapes, proof coverage, and strength/adversarial
  verification refs into compiler proof-depth truth.
- Preserve dependency graph refs and digests in prompt plan/envelope/manifest
  replay where they affect dispatch.
- Ensure child traversal foldback and proof coverage consume admitted
  dependency graph truth rather than worker summary text.
- Ensure assurance fold consumes proof-depth completeness and strength
  admission before closure eligibility.

### Phase D - Plugin Output Carry-Through

- Add or map minimal output-carrier fields:
  `outputCandidateKind`, `admissionTargetKind`,
  `sourceRequirementObligationRefs`, per-evidence-role refs,
  `replayIdentity`, `replayDigest`, proof obligation/policy/shape/strength
  refs, depth class refs, proof-strength admission refs, adversarial attempt
  refs, and counterexample refs.
- Carry `GtlContractFulfillmentBinding` or its admitted projection in the
  selected plugin contract. Derive the contract's requirement-obligation set
  and paired proof-obligation set from that binding, and reject any flat
  contract list or output envelope that diverges from the derived pairing.
- Keep transform/evaluate/consequence/human-callout task-role output mappings
  distinct.
- Derive category classification in ABG from selected composition, selected
  stage binding, admitted plugin contract, result interface, and
  candidate-kind/admission-route/evidence-role mapping. The selected
  `outputCandidateKind` must match exactly one deterministic classification
  rule; allowed-set membership alone is not admission.

### Phase E - Tests And Live Proof

- Add compile-level differential tests:
  - no dependency graph + target work => rejected;
  - no dependency graph + dependency-disambiguation vector => allowed;
  - missing prerequisite node => typed gap;
  - missing prerequisite edge => typed gap;
  - sufficient dependency graph => prompt renders only dependency-closed
    relevant subgraph;
  - P0 dependency/proof closure => no F_P prompt.
  - coverage complete + depth policy incomplete => rejected/non-closing;
  - missing required depth class => typed gap;
  - unjustified not-applicable depth class => typed gap;
  - worker-supplied proof strength without admission => rejected/non-closing;
  - adversarial counterexample => rejected/non-closing.
- Add runtime tests for child traversal foldback over admitted dependency graph
  and proof coverage.
- Add plugin-output tests for wrong obligation id, wrong evidence role, weaker
  proof shape, wrong admission target, category collision, allowed-but-
  misclassified candidate kind, and flat proof lists that do not preserve the
  `GtlContractFulfillmentBinding` pairing.
- Add live installed-sandbox witness that produces a shallow-code/shallow-test
  failure before the fix and preserves residual instead of closing.

## Closure Checklist

- [x] Requirement authority for dependency sufficiency is explicit or traced to
      existing instruction assembly clauses.
- [x] Design pack lists dependency graph sufficiency as ABG-derived
      instruction truth.
- [x] No new ambiguity/disambiguation/steel-thread truth carrier is introduced.
- [x] No product-local dependency graph, proof-slice, or steel-thread ledger
      outranks ABG projections.
- [x] Compiler rejects target work prompts when dependency sufficiency is
      unknown.
- [x] Compiler allows only dependency-disambiguation traversal before
      dependency graph sufficiency.
- [x] Prompt manifests replay dependency graph refs/digests when they affect
      dispatch.
- [x] Plugin output carry-through fields preserve obligation identity, proof
      shape, evidence role, admission route, and replay identity.
- [x] Plugin output classification is derived from a selected
      `RequirementProofCandidateClassificationTable` over deterministic
      stage/admission-target/evidence-role antecedents; the output envelope
      assertion is compared to the derived kind and cannot define category
      truth.
- [x] Requirement/proof pairing is derived from
      `GtlContractFulfillmentBinding` truth; contract-owned flat
      requirement/proof lists are not accepted as pairing authority, and
      output envelopes must carry every proof ref required by each binding.
- [x] Design pack and IACS classify `DepthObligationPolicy`,
      `DerivedProofDepthInstructionTruth`, and `ProofStrengthAdmission` as
      subordinate proof-policy/projection payloads, not peer algebras.
- [x] Compiler rejects coverage-complete target work when proof-policy depth
      completeness is missing, incomplete, unjustified, or not replay-derived.
- [x] Compiler rejects proof-strength self-report unless strength is admitted
      through total F_D criteria or adversarial verification.
- [x] Proof coverage and assurance closure consume admitted plugin outputs and
      dependency graph truth, proof-depth completeness, and strength admission,
      not worker self-report or file/test existence.
- [x] Synthetic tests cover dependency sufficiency, missing node/edge gaps,
      weaker-contract proof, missing proof, missing realization, and plugin
      category collisions.
- [x] Synthetic tests cover caller-forged dependency/depth/strength booleans,
      asserted candidate-kind mismatch against table-derived classification,
      and partial proof-pair carry-through.
- [x] Synthetic tests cover `depth_policy_incomplete`,
      `missing_depth_obligation_class`,
      `depth_class_not_applicable_unjustified`,
      `proof_strength_not_admitted`, and
      `adversarial_counterexample_found`.
- [x] Live installed-sandbox proof demonstrates residual preservation for
      under-covered or depth-incomplete requirements and closure for a fully
      covered, depth-complete, strength-admitted slice.

## Execution Record

2026-07-04 implementation slice:

- Added `DerivedDependencyInstructionTruth` to instruction assembly as a
  subordinate ABG-derived compiler/projection payload.
- Extended instruction assembly known algebra with dependency graph
  projection, prerequisite closure, dependency sufficiency, obligation
  lineage, and proof coverage.
- Added compiler issue kinds `dependency_sufficiency_gap`,
  `typed_prerequisite_gap`, `unresolved_requirement_node`, and
  `missing_dependency_edge`.
- Added target-work rejection and dependency-disambiguation allowance in
  `compileInstructionAssemblyPlan`.
- Tightened the compiler so a plan that declares the dependency-sufficiency
  algebra must explicitly classify as `target_work` or
  `dependency_disambiguation`; silent `not_applicable` target-work bypass is
  rejected.
- Added dependency truth refs, graph refs, typed gap refs, and dependency
  truth rendering into prompt manifest replay.
- Added `requirement_proof_carry_through.ts` as the minimal plugin output
  carry-through admission/projection surface. It preserves candidate kind,
  admission target, source obligation identity, evidence role, proof
  obligation/policy/shape/strength, replay identity, replay digest, and
  cross-category uniqueness.
- Added `test:t188` with differential compiler and plugin-output tests.
- Added `test:t188:live` package script as the live lane hook; live closure
  remains open until an installed-sandbox proof is run and recorded.
- Updated existing T-183 compiler fixtures and the T-180 GLC hello-world
  sandbox generator to declare target-work no-dependency policy explicitly.

Verification:

- `git diff --check` passed.
- Requirement clause proof for `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH`
  clauses `001` through `031` passed.
- `REQ-R-ABG3-INSTRUCTION-ASSEMBLY-016` proof grep passed.
- `npm run test:t188` passed.
- `npm run test:t183` passed.
- `npm run test:semantic` passed: 1012/1012.

2026-07-04 design strengthening:

- Added requirement clauses `032` through `037` for proof-policy depth
  completeness, subordinate `DepthObligationPolicy`, typed depth gaps,
  admitted `ProofStrengthAdmission`, F_D-checkable/adversarial strength
  admission, and assurance-fold depth gating.
- Strengthened T-188 so closure must fail for coverage-complete but
  depth-incomplete proof policies and for unadmitted proof-strength labels.
- Added `DerivedProofDepthInstructionTruth` to the ticket design as a
  subordinate compiler/projection payload.
- Added open checklist items for design-pack/IACS reconciliation, compiler
  rejection, proof-strength admission, synthetic tests, and live proof. These
  are not implemented by the earlier `test:t188` slice and remain active
  closure gates.

2026-07-04 implementation slice 2:

- Added `DerivedProofDepthInstructionTruth` to instruction assembly as a
  subordinate ABG-derived compiler/projection payload.
- Extended instruction assembly known algebra with
  `proof_policy_depth_completeness`, `depth_obligation_policy`,
  `proof_strength_admission`, `adversarial_verification`, and
  `coverage_strength`.
- Added compiler issue kinds `depth_policy_incomplete`,
  `missing_depth_obligation_class`,
  `depth_class_not_applicable_unjustified`,
  `proof_strength_not_admitted`,
  `proof_strength_not_adversarially_verified`, and
  `adversarial_counterexample_found`.
- Added proof-depth refs, depth-policy refs, typed-depth gaps,
  proof-strength admission refs, and adversarial counterexample refs to prompt
  manifest replay.
- Extended `requirement_proof_carry_through.ts` contract/envelope admission
  with depth policy refs, depth class refs, admitted strength refs, F_D
  strength criteria, adversarial attempt refs, and counterexample refs.
- Added synthetic differential tests for missing/incomplete depth policy,
  missing required depth class, unjustified not-applicable depth, unadmitted
  strength, strength with no F_D/adversarial basis, and adversarial
  counterexample.
- Focused verification: `npm run test:t188` passed 14/14.
- Remaining active closure gates: assurance fold/proof coverage consumption of
  depth and strength truth, plus live installed-sandbox proof.

2026-07-04 implementation slice 3:

- Added deterministic `RequirementProofCandidateClassificationRule` rows to
  the carry-through contract. Admission now rejects
  `candidate_classification_mismatch` when an output candidate kind is merely
  allowed but not derived from stage role, admission target, and evidence
  roles; it rejects `candidate_classification_ambiguous` when more than one
  rule matches.
- Added `GtlContractFulfillmentBinding` rows to the carry-through contract.
  Admission derives requirement obligations from `obligationRef` and paired
  proof obligations from `testOrExecutionEvidenceRefs`, then rejects
  `fulfillment_binding_gap` or `proof_pairing_mismatch` when contract flat
  lists or output envelope refs diverge from the binding-derived pairs.
- Added differential tests for allowed-but-misclassified candidate output and
  flat proof-list drift that would otherwise satisfy caller-owned lists.
- Focused verification: `npm run test:t188` passed 16/16.
- Regression verification: `npm run test:t183` passed 11/11 after adding
  explicit proof-depth truth to the T-183 target-work fixtures.
- Regression verification: `npm run test:semantic` passed 1019/1019.
- `git diff --check` passed.

2026-07-04 implementation slice 4:

- Added `RequirementProofCoverageProjection` as a replay/projection gate over
  accepted plugin carry-through admissions, dependency sufficiency truth,
  proof-depth completeness, and admitted proof-strength basis.
- Added proof-coverage truth refs and fold consumption. A non-eligible proof
  coverage status vetoes an otherwise close-capable assurance ref before
  `foldRequirementEvidence` can mark the requirement `satisfied`.
- Threaded optional proof-coverage truth refs through
  `projectRequirementFoldFromAssuranceClosure` for requirement-bearing
  T-188-style closure while preserving existing non-T-188 call compatibility.
- Added differential fold tests: eligible coverage + assurance close produces
  `satisfied`; depth-incomplete coverage + assurance close preserves residual
  as `no_close_preserved`.
- Focused verification: `npm run test:t188` passed 18/18.

2026-07-04 live proof:

- Replaced the prior `test:t188:live` alias to the generic hello-world live
  script with a dedicated T-188 live proof:
  `test_env/live/test_t188_requirement_proof_carry_through_live.test.mjs`.
- The live proof creates a fresh sandbox run, calls the live F_P worker for
  source/verifier candidate material, executes the returned subject program and
  verifier with Node.js, admits the candidate through the T-188 carry-through
  envelope, then proves both closure branches:
  - full depth + admitted strength -> proof coverage `eligible` -> fold
    `satisfied`;
  - missing negative depth class -> proof coverage `residual` -> fold
    `no_close_preserved` despite the same assurance-close truth.
- Live verification: `npm run test:t188:live` passed 1/1.
- Live artifact:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t188_requirement_proof_carry_through_live/20260703T192009119Z_pid91027/t188-requirement-proof-live-summary.json`.
- Live duration: 23642 ms.
- Regression verification after fold-gate changes:
  `npm run test:t183` passed 11/11; `npm run test:semantic` passed
  1021/1021; `git diff --check` passed.

2026-07-04 corrective one-truth slice:

- Closed the Prime defect where dependency sufficiency, proof-depth
  completeness, and proof-strength admission were caller-asserted booleans.
  `constructDerivedDependencyInstructionTruth` now derives `dependencyClosed`
  from work kind, dependency graph/digest, typed prerequisite gaps, and typed
  no-dependency policy. `constructDerivedProofDepthInstructionTruth` now
  derives `depthComplete` from depth policy identity, required/declaration/
  not-applicable depth classes, and typed depth gaps; it derives
  `proofStrengthAdmitted` from admitted strength refs plus total F_D criteria
  or adversarial verification and absence of counterexamples.
- Closed the caller-owned classification defect by introducing
  `RequirementProofCandidateClassificationTable` as the selected table ref and
  digest. Admission derives the candidate kind from stage role, admission
  target, and evidence role antecedents, then compares the envelope assertion
  to the derived kind. Empty evidence-role antecedents are rejected.
- Closed the duplicate pairing defect by removing contract-owned flat
  requirement/proof list authority. Admission derives selected requirement
  obligations and proof obligations from `GtlContractFulfillmentBinding` and
  requires each output envelope to carry every proof ref required by the
  binding.
- Updated the IACS and structural carrier diagram to use the realized carrier
  names `RequirementProofCarryThroughOutputEnvelope` and
  `RequirementProofCandidateClassificationTable` instead of the stale
  `PluginOutputProofBindingRow` label.
- Focused verification: `npm run test:t188` passed 20/20.
- Regression verification: `npm run test:t183` passed 11/11.
- Full regression verification: `npm run test:semantic` passed 1023/1023.
- `git diff --check` passed.
- Live verification after the one-truth fixes:
  `CODEX_LIVE_FP=1 npm run test:t188:live` passed 1/1.
- Live artifact:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t188_requirement_proof_carry_through_live/20260703T194603157Z_pid24161/t188-requirement-proof-live-summary.json`.
- Live duration: 17701 ms. The summary records a live worker output digest,
  source digest, verifier digest, governed traced-process subject/verifier
  runs, full coverage `eligible` -> fold `satisfied`, and shallow
  depth-incomplete coverage `residual` -> fold `no_close_preserved`.

2026-07-05 post-RC5 hazard transfer from T-189 review:

- `constructDefaultInstructionAssemblyStartupForBasis(...)` currently produces
  default instruction startup rows with `dependencyClosed: true`,
  `depthComplete: true`, and `proofStrengthAdmitted: true` for startup
  usability. Those defaults are acceptable only as startup instruction-binding
  material while fold gating derives closure eligibility from admitted
  projection truth.
- T-188 shall not close if assurance fold, lifecycle disposition, release
  proof, or downstream closure reads those startup-carried booleans as proof of
  dependency sufficiency, proof-depth completeness, or proof-strength
  admission. The closure path must consume replay-derived coverage,
  dependency, depth-policy, strength-admission, and typed-gap projections.

## Fold-Gating Wave Record (2026-07-05, Claude taking the open gates M5/B2/M3/B3)

Slice 1 COMPLETE — replay carrier layer for carry-through admissions:
- New runtime event `requirement_proof_carry_through_admitted`
  (carriers.ts: interface + RuntimeEvent union + kind list; event_factories:
  `constructRequirementProofCarryThroughAdmittedEvent` over the
  actorRuntimeScope/invocation pattern; event_admission: full field-rule
  entry; projection + retry_frontier: standalone cases).
- Proofs: build clean; test:t188 20/20; test:semantic 1053/1053.

NEXT SLICE SPEC (decided now, not improvised later): coverage is computed
AT ADMISSION TIME by the producer and carried as truth refs on the event —
`projectRequirementProofCoverage` requires full Admission objects, so
close-site reconstruction from event summaries would be reconstructed
truth (forbidden). Plan:
1. M5 producer: at the F_P result-admission site, when a carry-through
   contract is bound, run `admitRequirementProofCarryThroughOutput`, then
   `projectRequirementProofCoverage` per requirementId, then emit the
   admitted event carrying
   `requirementAbgTruthRefFromRequirementProofCoverage(...)` refs (extend
   the event with `coverageTruthRefsByRequirementId` rows or a sibling
   `requirement_proof_coverage_projected` event — prefer extending, one
   event one fact-family).
2. B2 consumer: at engine_runner.ts:3740
   (`emitRequirementRouteFactsForEdgeClose`), collect refs by
   requirementId from replay events, thread
   `proofCoverageTruthRefsByRequirementId` (interface already accepts it).
   Absent contract => absent refs => fold unchanged (no behavior flip on
   undeclared edges — the T-189 migration lesson).
3. M3: resolve `proofStrengthAdmissionRefs` / `adversarialVerificationRefs`
   / `fdStrengthCriterionRefs` against the admitted ledger before
   `deriveProofStrengthAdmitted` may return true; per ticket law
   (:1247-1253) fold gating shall NOT read default-startup booleans.
4. B3: engine-driven live lane — uncovered obligation shall not close;
   coverage removal flips disposition.

Slice 2 COMPLETE (2026-07-05) — M5 producer + B2 consumer wired:
- Engine request family `requirementProofCarryThroughStartup`
  ({contract, classificationTable, requirementIds, envelopeTemplate,
  edge?} entries) on both EngineIterate/EngineStart requests.
- M5: at the scalar F_P result-admission site (immediately after
  instruction_response_contract_admitted), the engine constructs the
  carry-through envelope (template + result-derived evidenceRefs/
  replayIdentity), runs admitRequirementProofCarryThroughOutput with the
  admitted classification table, projects coverage PER requirementId with
  obligations DERIVED FROM fulfillmentBindings (binding-derived per the
  Prime fix — the contract no longer carries flat obligation lists), and
  emits `requirement_proof_carry_through_admitted` carrying
  coverageRequirementIds + coverageTruthRefs (producer-computed truth
  refs; no close-site reconstruction).
- B2: at edge-close, refs are collected from replay events by
  requirementId and threaded through the NEW optional
  `proofCoverageTruthRefsByRequirementId` on
  EmitRequirementRouteFactsForEdgeCloseInput, forwarded to
  projectRequirementFoldFromAssuranceClosure. Absent startup => absent
  refs => fold unchanged on undeclared edges (no behavior flip).
- Proofs: build clean; test:t188 20/20; test:t189 5/5;
  test:semantic 1053/1053.
- NEXT (slice 3): the WIRING DIFFERENTIAL — engine-level t188 test
  (startup entry + attached F_P plugin -> event emitted with coverage
  refs; fold source refs include them; rejected admission -> ineligible
  coverage). Then M3 (ledger-resolved strength; fold never reads
  default-startup booleans) and B3 (engine-driven live lane: uncovered
  obligation shall not close). Per the wiring-proof gate, T-188 does NOT
  claim the runtime property delivered until slice 3's differential runs
  on the live runner path.

Slice 3 COMPLETE (2026-07-05) — the wiring differential on the live runner:
- New test lane test_t188_fold_gating_wiring.test.mjs (wired into
  test:t188): engine-level runEngineIterate with instruction-assembly +
  registry startup, an attached F_P plugin returning a result artifact,
  and a requirementProofCarryThroughStartup entry.
- PROVEN: (1) accepted path — exactly one
  requirement_proof_carry_through_admitted event, accepted=true, coverage
  refs per requirementId in the abg://requirement-proof-coverage/
  namespace, empty issueKinds; (2) DIFFERENTIAL — envelope missing the
  source obligation => accepted=false with source_obligation_gap, coverage
  truth still producer-computed (status digest-bound); (3) no startup =>
  zero carry-through events (undeclared edges unchanged).
- Fix during slice: factory fills frameLineageId: null (invocation scope
  does not carry lineage; admission rules require nullable presence).
- Proofs: test:t188 now 23/23 across both lanes; test:semantic 1053/1053.
- REMAINING GATES: M3 (resolve strength/adversarial/fd refs against the
  admitted ledger in deriveProofStrengthAdmitted; fold shall not read
  default-startup booleans) and B3 (engine-driven live lane: uncovered
  obligation shall not close; coverage removal flips disposition; fold
  source refs proven to include the threaded coverage refs on a
  requirement-bearing edge).

Slice 4 PARTIAL (2026-07-05) — M3 groundwork landed; core fix diagnosed:
- LANDED: coverageStatuses on the admitted event (carrier/factory/
  admission/emission); admitted-ledger ref scan at the M5 site (evidence_
  admitted, payload_observed/validated, actor_result_artifact_observed);
  dependencyInstructionTruth now threaded from the ADMITTED compiled plan
  (binding exposes plan; plan-derived, not synthesized); proof-depth truth
  constructed at the M5 site from envelope + contract.
- DIAGNOSED (the actual M3 defect location):
  constructDerivedProofDepthInstructionTruth IGNORES explicit booleans and
  derives internally via the PRESENCE-BASED deriveProofStrengthAdmitted —
  so ledger-resolved values computed in the runner are overwritten. The
  fix belongs INSIDE the derivation: optional admittedLedgerRefs input on
  the constructor; when provided, strength refs must RESOLVE against it
  (presence alone insufficient); absent input preserves compile-time
  behavior for startup/fixture callers. Also: an unidentified residual
  issue-kind persists in the eligible-path probe even with presence
  satisfied and dependency closed — expose coverage issueKinds per
  requirement on the admitted event (coverageIssueKinds) to make
  eligibility failures observable, then complete the differential
  (resolvable refs -> eligible; fixture refs -> not eligible). The M3
  differential test was REMOVED rather than weakened — no green-by-
  assertion-downgrade.
- Proofs at this cut: wiring lane 3/3; test:semantic 1056/1056.

## Self-Review Record (2026-07-05, full pass over the fold-gating wave)

Verified-then-fixed (M3 core completed as the review's fix):
1. DEAD CODE / overridden truth: the runner computed ledger-resolved
   booleans that constructDerivedProofDepthInstructionTruth IGNORED
   (derives internally, 0 reads of caller values). Fixed properly: the
   derivation itself now accepts optional admittedLedgerRefs — presence
   semantics preserved for compile-time callers, RESOLUTION semantics for
   runtime callers; runner passes the ledger set; misleading computations
   removed (derive-only placeholder fields documented).
2. M3 DIFFERENTIAL PROVEN (issue-kind axis): with the result artifact as
   the strength-admission evidence, accepted=true and
   proof_strength_not_admitted ABSENT; with unresolvable fixture refs,
   accepted=true and the issue PRESENT — list presence no longer admits
   strength. (A prior test-side bug was diagnosed en route: overriding
   envelope fd refs without aligning the contract broke envelope-contains-
   contract admission — rejected admissions produce the full issue cluster
   by design.)
3. coverageIssueKinds added to the event (eligibility failures are now
   replay-observable); factory guards parallel-array lengths; event
   lineage now threads request.basis.frameLineageId instead of hardcoded
   null.

Findings recorded, not yet fixed (named, honest):
4. TWO_TRUTH RISK: the runner's inline admitted-ledger scan duplicates
   truth that derivePayloadLedgerProjection owns. The constructor now
   takes a ref-SET input precisely so the source can swap to the ledger
   projection without changing the derivation — do that swap in the B3
   slice.
5. TEMPLATE-STAMPED ENVELOPES: startup envelopeTemplate declares the
   proof-claim fields, so admission largely checks startup against itself;
   the result contributes evidenceRefs + replayIdentity only. Lawful as
   claimed-shape + M3 resolution making claims EARN, but the M5
   differential mutates the template, not the result. B3's engine-driven
   lane must mutate RESULT-side truth.
6. PROVEN_ONE_ARM: carry-through admission covers the scalar transform
   arm only (composed transform/evaluate arms have no admission) — the
   census discipline applies; named for successor.
7. B2 CONSUMER UNPROVEN: the edge-close threading executes only when
   requirement context exists; no test drives that path yet (B3 scope:
   fold source refs must include the threaded coverage refs, and an
   uncovered obligation shall not close).
8. Vacuous composition check: contract and envelope composition refs both
   come from startup, so the admission's composition match cannot fail on
   this path; entry matching should bind to the selected plan/composition
   (successor).
9. ELIGIBILITY RESIDUAL: accepted + strength-resolved still shows one
   undischarged issue-kind before eligible status — now OBSERVABLE via
   coverageIssueKinds; diagnose in B3, do not guess.

Proofs after review fixes: wiring lane 4/4; test:semantic 1057/1057.

## External Review Adjudication #2 (2026-07-05, two codex sets; tree returned to green HEAD after a verified fix attempt)

STALE: the P0 "t188 red at :246" reviewed a mid-flight tree between
splices; committed HEAD is 24/24 with semantic 1057/1057.

REAL — verified, fix attempted this session, REVERTED to keep the tree
green; redo with the spec below (all four are accepted findings):
1. P1 ORDERING (the sharp one): carry-through admission emits BEFORE
   deriveAttachedFpResultDecision — a payload_contract_failure result
   still mints coverage referencing unadmitted evidence. FIX (validated
   to build; relocation exposes the next item): move the whole M5 block
   inside the attachedDecision.kind === "accepted" branch, after
   payloadEvents emission.
2. FIXTURE CONSEQUENCE of (1): the wiring tests' attachedResultArtifact
   is contract-rejected, so they only passed because emission preceded
   rejection (exactly the reviewer's reproduction). The fixtures must use
   the t084 attached-artifact shape AND match the basis's expected
   assessment ids (study buildThreeStageBasis evaluation policy /
   test_t084 expectedAssessmentIds derivation) so the decision is
   genuinely accepted.
3. P1/High RAW-REF MASQUERADE: admittedLedgerRefs accepts any replay
   string (artifact/result/observed refs), so Set.has proves string
   presence, not typed admission; the test used the artifact ref AS the
   strength ref. FIX: typed sources only — evidence_admitted.evidenceRef
   and payload_validated.payloadRef; with (1) in place, the artifact's
   fulfillment_assessments.evidence_refs become admitted evidence on the
   accepted path, so the fixture declares the strength URI THERE and
   resolution is genuinely typed.
4. P1 START-PATH DROP: runEngineStart/Async forward
   instructionAssemblyStartup (:8701/:8727) but NOT
   requirementProofCarryThroughStartup — public callers silently drop the
   family. FIX: forward at both delegations (one-line each).
5. High CROSS-TRAVERSAL POLLUTION: the close-side consumer collects by
   requirementId only. FIX: skip !event.accepted (rejected-admission
   coverage signals envelope defects) and scope to the closing edge
   (event.vectorIndex === input.vectorIndex); requirement-level
   cross-edge accumulation is a fold-design question to settle
   deliberately, not by default.
6. Medium: factory/admission do not cross-validate coverageStatuses /
   requirementIds against the digest-bound truth refs — needs an exported
   coverage-ref parser first (none exists); add parser + factory
   cross-check.
7. Medium ACCEPTED AS STATED: the restored M3 test proves the
   strength-issue axis only — M3 is PARTIAL (resolution mechanism earned;
   role-typed resolution, eligible-status discharge, and fold behavior
   remain). Prior record language stands corrected accordingly. B3
   remains the closure gate; do not close from this state.

Slice 5 COMPLETE (2026-07-05) — the review redo spec, executed green:
1. ORDERING FIXED: the M5 carry-through block now runs INSIDE
   attachedDecision.kind === "accepted", after payloadEvents emission — a
   payload_contract_failure result can no longer mint coverage truth.
2. TYPED STRENGTH SOURCES: admittedLedgerRefs = evidence_admitted
   .evidenceRef + payload_validated.payloadRef ONLY; raw artifact/result/
   observed refs removed (string presence cannot masquerade as admission).
3. START-PATH FORWARDING: requirementProofCarryThroughStartup forwarded at
   both runEngineStart/Async delegations.
4. CONSUMER SCOPING: edge-close threads only accepted admissions scoped to
   the closing vectorIndex (cross-traversal pollution + rejected-admission
   refs excluded); requirement-level cross-edge accumulation remains a
   deliberate fold-design decision, recorded.
5. FIXTURES: input-derived fulfilled artifacts (expected assessment ids,
   worker/backend/runtime identities from the dispatch input) — the M3
   differential now proves TYPED resolution: the artifact DECLARES the
   strength evidence in its assessment evidence_refs; the accepted payload
   admission turns it into typed truth; only then does
   proof_strength_not_admitted clear. Rejected-payload paths emit nothing.
Remaining from adjudication #2: coverage-ref parser + factory
cross-validation (item 6); role-typed (not just typed-source) strength
resolution, eligibility discharge, and fold behavior = B3 scope. M3
remains PARTIAL until those land.
- Slice-5 self-review (2026-07-05): verified single M5 block (no duplicate
  from the revert/reapply cycle), typed-source scan with zero raw
  artifact refs, both start forwards, edge-scoped consumer, clean tree at
  the slice-5 commit. RECORD CORRECTION: the slice-5 commit message says
  "t188 25/25"; the actual gate is 24/24 (20 unit + 4 wiring) — message
  overstated by one, ticket record is authoritative.

Slice 6 COMPLETE (2026-07-05) — adjudication item 6:
- Exported parseRequirementProofCoverageTruthRef (status + projectionRef +
  requirementId recovered; digest over the identity pair recomputed, fail
  closed on mismatch or malformed shape).
- Factory cross-validates coverageStatuses/coverageRequirementIds against
  each parsed truth ref at construction — a status swap throws
  differentially (tamper test), and every live emission passes the check
  (producer fields provably agree with refs).
- RESIDUAL NOTED: status is path-carried in the ref, not inside the
  digest (digest covers projectionRef+requirementId only) — binding
  status into the digest is a small successor alongside B3.
- Wiring lane 5/5; test:semantic green.
- Slice-6 correction: the item-6 commit landed with the tamper test red (commit chain gated on git diff --check only — process defect, mine); factory index export fixes it same-session. Wiring 5/5, semantic 1058/1058.

Slice 7 COMPLETE (2026-07-05) — eligibility residual diagnosed and
discharged:
- Diagnosis via the coverageIssueKinds observability: the residual was
  missing_depth_obligation_class, caused by depthPolicyRef: null (the
  derive fails closed on absent policy — correct law).
- Fix mirrors the dependency-truth pattern: depth policy ref+digest now
  come from the ADMITTED compiled plan's proofDepthInstructionTruth
  (startup-compiled truth, not runner-synthesized).
- The M3/A differential now asserts the FULL eligible chain: accepted
  admission + typed ledger-resolved strength + plan-carried depth policy
  + plan-derived dependency closure => coverageStatuses ["eligible"],
  coverageIssueKinds []. Wiring lane 5/5; test:semantic 1058/1058.
- B3 REMAINING (final gate): fold behavior on a requirement-bearing edge
  (threaded coverage refs present in fold source truth; status decoded)
  and the engine-driven uncovered-obligation-shall-not-close
  differential. Role-typed strength resolution and digest-bound status
  remain named successors.

Slice 8 COMPLETE (2026-07-05) — B3 fold differential, engine-driven:
- Requirement-bearing harness (GTL requirement bundle + span over the
  three-stage basis, first_traversal) with the route declaration bundle on
  runEngineIterate.
- PROVEN, three-way: (a) baseline without carry-through declared -> fold
  state "satisfied" (undeclared edges unchanged); (b) RESIDUAL coverage
  (unresolvable strength) -> carry event residual AND fold state
  "no_close_preserved" — UNCOVERED SHALL NOT CLOSE, engine-driven; (c)
  ELIGIBLE coverage (typed-resolved strength) -> carry eligible AND fold
  "satisfied". foldStateFromEvidence's coverage gate + B2 threading are
  therefore proven as one live chain.
- Gates: wiring lane 6/6; test:t188 26/26; test:semantic 1059/1059.

Slice 9 COMPLETE (2026-07-05) — engine-driven LIVE proof + a live-earned
law correction:
- The live lane is now engine-driven end to end: a REAL LLM worker
  produces subject+verifier; both execute for real; then BOTH scenarios
  run through runEngineIterate with the verifier-execution ref as
  strength evidence — full depth => carry eligible + fold satisfied;
  depth-shallow => carry residual (missing_depth_obligation_class) + fold
  no_close_preserved. No hand-called admission, coverage, or fold remains
  in the live lane. test:t188:live 1/1 (real worker).
- LAW CORRECTION EARNED BY THE LIVE RUN (unit lanes could not catch it):
  the slice-5 accepted-only consumer filter silently converted "output
  failed envelope law" into "no pressure". Corrected to scope-only:
  rejected ADMISSIONS carry residual coverage (no-close pressure);
  rejected PAYLOADS never emit (upstream ordering gate). Two rejections,
  two laws, now explicit in code.
- Final gates: test:t188 26/26; test:t188:live 1/1; test:t189 5/5;
  test:t191 14/14; test:semantic 1059/1059.

## Closure Record (2026-07-05)

All four audit gates realized and proven on the live runner path:
M5 (admission at the accepted-payload result site, producer-computed
coverage), B2 (edge-scoped threading into the fold), M3 (typed
ledger-resolved strength; presence insufficient; differential proven),
B3 (fold gating: uncovered/residual SHALL NOT close — engine-driven unit
differential + real-LLM live lane). Closure claims derive from admitted
substrate truth; no caller booleans, plugin labels, passing tests, or
product-local ledgers gate closure.

NAMED SUCCESSORS (recorded, not silently deferred): role-typed strength
resolution (evidence-role-partitioned ledger, swap the inline scan to
derivePayloadLedgerProjection); digest-bound coverage status; carry-
through coverage for composed/evaluate F_P arms (census discipline);
mandatory-witness migration; requirement-level cross-edge fold
accumulation decision.

## Post-Closure Adjudication Addendum (2026-07-06, codex review)

CLAIM NARROWED (accepted High): fold gating is earned FOR EDGES WITH A
DECLARED CARRY-THROUGH CONTRACT; an undeclared edge with active
obligations retains legacy closure semantics as a typed transitional
state — this is now constitutional law (REQ -038, requirement_reprice via
this adjudication) rather than an implicit test comment. The mandatory
carry-through witness migration (undeclared-obligation edges become
declared or blocked) is the named successor that retires the transitional
state; release notes shall not claim universal coverage-gated closure
until it lands.
