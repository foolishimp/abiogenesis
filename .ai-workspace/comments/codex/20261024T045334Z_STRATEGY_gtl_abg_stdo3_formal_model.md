# STRATEGY: Continuation-preserving context in GTL, ABG and STDO 3

**Author**: Codex
**Date**: 2026-10-24T04:53:34Z
**Updated**: 2026-10-24T07:51:04Z
**Addresses**: One requirements-stage continuation case; qualified context and references; deterministic-operation contracts; experiments separating annotation and retention effects
**Status**: Open

## Summary

A requirements candidate can retain the same bytes, asset reference and asset digest while its assessment changes from unassessed to satisfied, falsified or indeterminate. Those states permit different next work. A context representation that retains only candidate identity cannot recover the required continuation.

The current implementation already preserves the decisive assessment and binding distinctions. Its revision presentation also qualifies shared references with the complete asset material. This case therefore supports using that existing construction as the baseline. It provides no evidence that typed frame annotations are necessary or preferable.

The argument below instantiates the source fixture, gives a finite interpretation and commuting proof, exhibits a failed projection, and checks a temporal repair. It also makes the proposed common `F_D` regime precise through four worked operation contracts. A separate factorial experiment can distinguish a representation benefit from the ordinary benefit of retaining relevant counterexamples.

## Analysis

### 1. The concrete candidate and its actual path

The source basis is ABI commit `91a2caa62e9c0566da0c55d35c5e6764e544537c`. This is an open strategy revision under the selected STDO 3 RC1 Writer/Design frame. Product retains the fifteen ABG5 families and the current common-library/debt selection. The work here is source inspection and a finite mathematical account, with no test or runtime execution. The component fixture supplies concrete values; its `component-only:` coordinates are not an admitted ABG episode. General GTL consumers need adopt STDO only through their declared binding. Appendix D records sources and the previous cut.

The selected callable is `graph-function://generic-job-mechanics.example/requirements@5`. Its stage is `stage://generic-job-mechanics.example/requirements@5`, with author and assessor loci `locus://generic-job-mechanics.example/requirements-author@5` and `locus://generic-job-mechanics.example/requirements-assessor@5`. The fixture gives it `requirement_refinement` capability and places it in a parent chain of named `workflow.C` calls. [Lifecycle fixture:16–23,56–75](../../../build_tenants/abiogenesis/typescript/test_env/support/t287-generic-job-lifecycle.mjs#L16)

The actual constructor uses `C.compose` over author and assessor leaves, both `F_P`, with predicates `predicate://abiogenesis/semantic-stage/authored@5` and `predicate://abiogenesis/semantic-stage/assessed@5`. GraphFunction, materialized graph, role and call remain distinct. [Stage publication:58–69](../../../build_tenants/abiogenesis/typescript/code/src/gtl/semantic_stage_publication.ts#L58)

Use the exact source text `t` below. Let `Q` abbreviate its quote on `member://generic-job-mechanics.example/request@5`, and let `p` abbreviate the two preceding Intent/Product statement references. `beforeRequirements()` constructs those predecessors with satisfied assessments. The chosen first-binding candidate is the fixture's `candidate(input, stage, proposal)`:

```text
t = 'Build an application that prints Hello World. Preserve the independent verifier.'
Q = { memberRef: 'member://generic-job-mechanics.example/request@5', quote: t }
p = ['stage://generic-job-mechanics.example/intent@5/s',
     'stage://generic-job-mechanics.example/product@5/s']
c = {
  kind: 'semantic_job_asset_candidate', schemaVersion: '5.0.0',
  asset: {
    kind: 'semantic_stage_asset_candidate', schemaVersion: '5.0.0',
    statements: [{ statementRef: 'stage://generic-job-mechanics.example/requirements@5/s',
      text: t, modality: 'supporting', sourceQuotes: [Q], requirementRefs: [],
      obligationRefs: [], predecessorStatementRefs: p }],
    requirementCandidates: [{ candidateRef: 'candidate://greeting', meaning: t,
      parentRequirementRefs: [], sourceQuotes: [Q] }],
    worksiteDesign: null, pressure: []
  },
  bindings: [{ requirement: { kind: 'candidate', ref: 'candidate://greeting' },
    previousVersionRef: null,
    templateRef: 'proof-template://generic-job-mechanics.example/native-check@5',
    scope: 'Current ordinary source', realizationMeaning: ['Actual application'],
    proofMeaning: ['Actual verifier and observed command'],
    unprovedScope: ['Semantic acceptance'], closureRule: 'Non-closing',
    requiredContent: ['Actual bytes'] }],
  design: null
}
```

This is a concrete fixture construction, with grounded terms subsequently derived from the quoted source. The fixture fixes the job basis using `component-only:invocation`, `component-only:root`, `component-only:input`, `component-only:intake` and `component-only:child`, with the corresponding declared digests. Author source is `source('requirements-author', input)`; assessor source is `source('requirements-assessor', authored)`. Each includes its C-call and actor-invocation reference, input digest, prompt digest and transport digest. The two actor references differ. These fields support this component construction; independent semantic assessment requires its wider custody and authority conditions. [Meaning fixture:19–50,170–186](../../../build_tenants/abiogenesis/typescript/test_env/tests/t287-generic-job-meaning.test.mjs#L19)

The inherited rubric has one criterion, `criterion://generic-job-mechanics.example/source@5`. The fixture assessment is a `semantic_stage_assessment_candidate` with that criterion, the current statement reference, `[Q]`, empty pressure and explanation `Mechanical owner test, not semantic acceptance`. Choose its disposition as satisfied, falsified or indeterminate, holding the other valid fields fixed. The source tests explicitly construct the satisfied and indeterminate alternatives; the falsified alternative follows the same declared domain and disposition branch. These are source-derived alternatives, not three saved LLM runs. [Rubric/template:88–105](../../../build_tenants/abiogenesis/typescript/test_env/support/t287-generic-job-intake.mjs#L88)

Write `E_U` for the authored envelope. The abbreviations `U/S/F/I` below describe its assessment state; they introduce no stored schema. `deriveSemanticJobAsset` hashes `{stageRef,candidate,groundedTerms,source}`, excluding assessment. `deriveSemanticJobAssessment` retains that asset identity and adds `{candidate,source,disposition}`. It requires an unassessed asset, valid rubric/domain and a distinct assessor actor. Only satisfied assessment activates this first proposal. [Asset/assessment:479–527](../../../build_tenants/abiogenesis/typescript/code/src/product/semantic_job.ts#L479)

| State | Assessment | New active version, first proposal | Actual next-work distinction |
|---|---|---|---|
| `U` | `null` | None | Author work has completed; declared assessor work is next. |
| `S` | Satisfied | One, ordinal zero | Assessor predicate can advance after exact derivation checks. |
| `F` | Falsified | None | Assessor judgment blocks; counterexample standing remains. |
| `I` | Indeterminate | None | Assessor judgment blocks; undecided standing remains. |

With earlier binding versions present, `F/I` preserve them; they do not erase all versions. Our selected first proposal starts with none. The general assessor predicate checks both satisfied disposition and exact reconstruction of the output from its input and assessment source. [Relation:743–746](../../../build_tenants/abiogenesis/typescript/code/src/product/semantic_job.ts#L743)

The runtime path retains those qualifications. ABG authenticates the intake, author and assessor producers against actual admitted results and judgments. HoG proposes the C-call judgment; ABG admits it before HoG selects its route; false evaluation gives `blocked`, true gives `advance`. A blocked child can retain its valid candidate, and parent foldback preserves the block. `U` has not already received an assessor-blocked judgment. [Producer authentication:134–157](../../../build_tenants/abiogenesis/typescript/code/src/abg/semantic_job.ts#L134), [judgment:66–90](../../../build_tenants/abiogenesis/typescript/code/src/hog/judgment.ts#L66), [admission:619–680](../../../build_tenants/abiogenesis/typescript/code/src/hog/ccall_lifecycle.ts#L619), [parent:674–682,747–780](../../../build_tenants/abiogenesis/typescript/code/src/hog/workflow_lifecycle.ts#L674)

### 2. A finite interpretation with an actual commuting relation

Fix the valid candidate, first proposal, job/stage/basis, sources and rubric above. Call those fixed premises `Gamma`. The formal fragment starts after selection of a valid raw assessment. It models deterministic owner processing and observations of it. The LLM's generation and the assessment's truth about the application remain outside this proof.

Define finite carriers:

- `X={r_S,r_F,r_I}`: the three valid raw assessment records just specified.
- `H={E_S,E_F,E_I}`: their distinct derived envelopes from `E_U`.
- `V={v_S,v_F,v_I}`: qualified observations retaining candidate/grounded terms, assessment disposition and assessment digest, and active binding versions, with `Gamma` available to resolve required provenance.
- `D={d_S,d_F,d_I}`: records of assessment standing, selected predicate/value, first-binding activation and blocked/advance disposition. These are mathematical readouts of owner results, not new event payloads.

Let `derive:X->H` be the selected `deriveSemanticJobAssessment` operation, `view:H->V` the qualified observation, and `j:H->D` the machine-decision readout with the exact derivation/provenance checks fixed by `Gamma`. Define observer `h:V->D` by the table:

| Raw assessment | `derive` | `view` | `j` and `h` agree on |
|---|---|---|---|
| `r_S` | `E_S` | `v_S` | Satisfied; selected predicate true; one version; advance. |
| `r_F` | `E_F` | `v_F` | Falsified; selected predicate false; no new version; blocked. |
| `r_I` | `E_I` | `v_I` | Indeterminate; selected predicate false; no new version; blocked. |

The machine actually judges the authenticated envelope. The `view/h` path is a comparison observer, not a claim that the runtime gate consumes an LLM prompt. Nor does this table make rejected child outputs eligible for all downstream author calls. Their blocked dispositions remain, while qualified read models or historical material remain inspectable.

Take a presented source category with object symbols `Raw`, `Envelope`, `View`, `Decision`; generators `derive`, `view`, `j`, `h` with the types above; and the equation `j=h o view`. This analytical signature names owner operations and observer maps; it adds no GTL nodes. Arrow equality is the least composition congruence containing that equation. The target is the full subcategory of **FinSet** on `X,H,V,D`: arrows are all typed functions, equality is pointwise, identities are identity functions and composition is ordinary function composition. It is closed under these operations, including every identity.

Map the four source objects to those four carriers and each generator to its complete table-defined function. Map every identity to the corresponding identity and every path to its composite. The three rows verify `j(E_q)=h(view(E_q))` for every `q` in `S/F/I`, so the defining equation is respected. Congruence and ordinary composition extend this to every source arrow. Identity and composition preservation follow from the path assignment. In particular, `j o derive = h o view o derive` pointwise. This proves the finite comparison, with its given `Gamma`, rather than merely asserting that a free chain has an interpretation.

`D` distinguishes falsified from indeterminate as well as separating both from satisfied. A constant terminal-object observation would satisfy generic functor laws while losing this nonconstant readout. Functoriality alone therefore cannot establish the observation's adequacy.

### 3. The failed projection and the existing correct construction

Consider the hypothetical abstraction `alpha_0(a)=(assetRef,assetDigest,candidate)`. These coordinates are equal for `E_S` and `E_I`, because their author body is fixed. Yet `j(E_S)` advances and activates a version, while `j(E_I)` blocks without activating it. If `j=hat_j o alpha_0`, both decisions would have to equal the same `hat_j` value, a contradiction. This projection fails for this decision problem. It is not the projection current code uses.

The ordinary `semanticJobActorContext` retains candidate and grounded terms together with `assessment:null` or `{disposition,assessmentDigest}`; it also retains active bindings with their version references, digests, policies and shapes. Actor transport provenance bodies are omitted from that view while runtime authentication retains the source envelope. Prompt sharing substitutes grounded requirement references or a binding's `proposalSource` only when the qualified supporting material is available. It preserves assessment and active-version distinctions. [Context:369–378](../../../build_tenants/abiogenesis/typescript/code/src/product/semantic_job.ts#L369), [sharing:395–423](../../../build_tenants/abiogenesis/typescript/code/src/product/semantic_job.ts#L395)

Revision presentation gives a second concrete construction. `constructJobInstructionAssembly` recognizes revision input. Its `predecessorMaterial` hashes the complete asset, including assessment and source, before matching historical material. A match produces a qualified `presentationRef` plus `materialDigest`; otherwise it retains the full asset. The same prompt supplies `task.historicalAssets`. Typed term references resolve through their qualified local material before comparison. [Revision recognition:695–704](../../../build_tenants/abiogenesis/typescript/code/src/abg/instruction_assembly.ts#L695), [complete-material sharing:767–790](../../../build_tenants/abiogenesis/typescript/code/src/abg/instruction_assembly.ts#L767), [local material:831–845](../../../build_tenants/abiogenesis/typescript/code/src/abg/instruction_assembly.ts#L831)

For eligible asset slots, write `pack(a,history)` for this pointer-or-body construction. With a resolvable exact local target and no digest collision in the selected population, `resolve(pack(a,history),history)=a`: an unmatched body is unchanged; a matched complete material resolves to the same qualified asset. This is a conditional reconstruction argument, not an unconditional equality theorem derived from hashing. Matching candidate bytes or asset identity alone would fail the condition when assessment differs.

The existing view plus authenticated runtime envelope is thus sufficient for the selected readout. String references can carry the required meaning when their contracts, qualifications and access are preserved. A typed annotation can still be inadequate if it drops a decisive coordinate. This case supports checking the actual construction and consumer first; a general annotation deficiency cannot be inferred from the shape of a `frameRefs` string array.

### 4. A temporal requirement that one predicate misses

Let `pi_1(q)` mean only “a satisfied assessment exists.” It is false for both `U` and `I`, so it preserves that one current predicate. It does not preserve the future behavior of `deriveSemanticJobAssessment`: on a valid satisfied input, `U` derives `S`, while `I` fails the already-assessed guard and returns `null`.

Define a small constructor protocol with states `Q={U,S,F,I}` and inputs `{read,r_S,r_F,r_I}`. `read` is an identity observation in the model, not a new GTL node. On `null` return, the modeled caller retains its previous state. “Refused” below names the reason for that pure constructor return, not an ABG admission result.

| Current state | `read` | `r_S` | `r_F` | `r_I` |
|---|---|---|---|---|
| `U` | `U`, read | `S`, derived | `F`, derived | `I`, derived |
| `S` | `S`, read | `S`, refused | `S`, refused | `S`, refused |
| `F` | `F`, read | `F`, refused | `F`, refused | `F`, refused |
| `I` | `I`, read | `I`, refused | `I`, refused | `I`, refused |

The readout includes read/derived/refused outcome, assessment standing, active-version count and next work. It records whether this step creates the first version: only `U` with `r_S` does. With that input, equal `pi_1` values hide derived/one-version versus refused/no-version behavior. Therefore no deterministic transition on that single bit can reproduce this readout for both states.

Repair the projection to retain unassessed versus each assessment disposition, the required qualified references and active version. On the fixed `Gamma`, this identifies all four model states. Let `T:Q×Input->Q` be the table's state component and `rho(q,u)` its complete readout. Define `T_hat` and `rho_hat` on repaired summaries by the same table. These `T` symbols are model transitions, distinct from Product `T`, the selected task. Every `read` cell preserves state and creates no version. Every `U` assessment cell derives its corresponding state, creating one version only for `r_S`. Every already-assessed cell preserves state, returns refused and creates no version. Thus `alpha(T(q,u))=T_hat(alpha(q),u)` and `rho(q,u)=rho_hat(alpha(q),u)` in all sixteen cells, with exact error zero.

This is preservation under fixed `Gamma`: the repaired abstraction distinguishes all four modeled states, so it performs no state aggregation within this model. The proof establishes sufficiency for the declared protocol. It establishes neither optimal compression nor a general solution to context selection. Shorter encodings or cheaper presentations may still be possible; minimum size, total cost and selection for new tasks require separate criteria and evidence.

Induction on input-word length gives the same correspondence for every finite word inside this closed protocol: the base is the initial summary; the step uses the verified cell for the next input. This proves neither changed-basis re-entry nor arbitrary observation/currentness policies. Those operations are outside the input alphabet and need their owning contracts.

Native [FOUNDATIONS, Observation sufficiency](stdo://releases/v3.0.0-rc.1/standards/FOUNDATIONS.md#4-algebra) already requires a deciding observation to separate cases with different predicate truth. This is its worked temporal instantiation, using an outcome/continuation readout. The example establishes ordinary statefulness and a sufficient retained distinction; emergence is not a consequence.

### 5. One precise `F_D` regime, four operation contracts

The namespace-convergence proposal is a single total deterministic closed-processing regime. Write `f:D_B->Outcome_B`, with declared closed domain `D_B`, immutable basis `B`, explicit material state/dependencies and one output for every input. The algorithm terminates, supported by a finite bound or well-founded argument. There is no open-world semantic choice or undeclared clock, filesystem or global input. State dependence is allowed as `f(state,input)=(nextState,value)` when those coordinates and their meaning are explicit.

Refusal and `budget_exhausted` are typed outcomes, not passes. A fuel-bounded procedure can be total by returning exhaustion, but it is a different operation from the possibly divergent procedure it bounds. Closed-domain output evidence is also distinct from changing the subject being judged. Four worked profiles make these distinctions enforceable:

| Operation | Closed input and result |
|---|---|
| Finite constructor | For `n` in `{0,1,2}`, return `{n,double:2n}`: respectively `{n:0,double:0}`, `{n:1,double:2}`, `{n:2,double:4}`. Each input has exactly one constructed record. |
| Sortedness evaluator | On lists of length at most three over `{0,1,2}`, inspect adjacent pairs. Return satisfied if none is inverted; otherwise return falsified with the first inversion. `[2,1]` returns witness `{index:0,left:2,right:1}` and leaves the original list unchanged. |
| Store-update core | Input includes a logical store state and declared grant. The complete six-case table below determines the next modeled state and decision. Physical realization remains at its effect owner. |
| Misdeclared evaluator | A procedure sorts original `[2,1]` in place to `[1,2]` and reports that the original passed sortedness. The bounded algorithm can be deterministic, yet violates the evaluate-original/read-only contract and reports the wrong subject. Construction needs its own grant and successor subject. |

Persisting the sortedness witness under a separate log grant does not perform the judged sorting operation. Its output and any log effect keep their own contracts.

For `put_A`, let logical state `w` be `absent`, `A` or `B` and grant be `allow` or `deny`:

| `w` | `allow` → modeled next state, decision | `deny` → next state, outcome |
|---|---|---|
| absent | A, request `put_A` | absent, refused |
| A | A, request `put_A` | A, refused |
| B | A, request `put_A` | B, refused |

This table classifies a closed decision/state core. An owner realizes the requested effect and records actual failure or uncertain completion separately. A deterministic request does not establish deterministic physical I/O. A full physical `F_D` claim needs its own explicit domain, dependencies, totality and outcome evidence; unmodeled mutable dependencies defeat that claim. The in-place sort example likewise shows why a regime label cannot establish authority or correctness of a particular operation contract.

Current native [a_c §5](stdo://releases/v3.0.0-rc.1/standards/AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds) restricts `F_D` at the kind level to evaluation/proof excluding the judged construction. [ABI Product](../../../specification/PRODUCT.md#compute-and-authority) also includes deterministic domain functions. The proposed alignment moves a_c's evaluation-only restriction into its operation/profile contract, while both import one total deterministic regime. Purpose, subject and write permissions remain real coordinates. Current labels are not automatically conforming to this definition. Owners must ratify the common meaning, publish versioned imports/aliases, migrate affected consumers and evidence, reprove changed relations and retire duplicate live definitions. Ratification follows this precise proposal; it cannot replace the missing definition work.

### 6. Separate the annotation experiment from retention

The first decision is whether the existing contract and materialization suffice for a concrete consumer. Here they preserve the demonstrated distinctions. If another consumer fails, compare the simplest existing-contract fix, including plain text with qualified references, before introducing a typed annotation layer.

A proposed factorial comparison should hold substantive information and access equivalent across representation rows, and vary retained counterexamples independently:

| Representation | Relevant counterexample retained | Absent | Stale or inapplicable counterexample |
|---|---|---|---|
| Existing binding/materialization | Controlled trials | Controlled trials | Controlled trials |
| Simplest contract fix, if needed | Controlled trials | Controlled trials | Controlled trials |
| Proposed typed annotation B | Controlled trials | Controlled trials | Controlled trials |

Within a retention condition, every representation supplies the same candidate, assessment/binding qualifications, material obligations and resolvable access. The ablation changes the selected counterexample, not required current assessment facts or safety permissions. Use the same frozen task/candidate, basis, outcome oracle, admission policy and effect bounds, with frozen model/tools and repeated randomized controlled trials. A stale counterexample keeps its original basis/status so applicability and invalidation can be evaluated.

Measure complete outcome quality, unsupported advances, false blocks, missed invalidations and continuation correctness. Count acquisition, rendering, reasoning, repair and assurance cost, with explicit units and boundaries. Prompt tokens alone are insufficient. Keep failed trials and unresolved obligations; a candidate response does not establish accepted continuation.

| Observed contrast | Decision it can support |
|---|---|
| Better quality or total cost for B under equivalent information/access | Evidence for selecting that representation, weighed against complexity and migration cost. |
| Benefit from retaining a relevant counterexample across representations | A context-selection/retention decision; no annotation-architecture conclusion. |
| Stale material causes unsupported reuse or false blocking | Re-enter the responsible provenance/invalidation or context implementation. |
| No useful difference, or higher total cost | Retain the existing construction or simplest adequate fix. |

Harness²'s task-level Propose–Probe–Compose supplies a method for bounded alternative probes and composition from execution contrasts; its persistent improvement harness retains adopted harnesses and evidence-supported lessons with fixed weights. [Pinned README](https://github.com/google-research/harness2/blob/1cfe254e8d25b15f37048c3730134686abe60335/README.md) This is a stateful experimental pattern, not a semantic guarantee. In a GTL account, selected registered operations can perform probes and assessment; proposals for new graph/frame definitions cross their publication owners. Dynamic generation and runtime publication remain outside [5.0 acceptance](../../../specification/PRODUCT.md#50-and-51-release-boundaries). No experiment described here has run.

### Appendix A. Mathematical toolbox and identity scope

The finite comparison above uses standard category machinery. A typed signature has object symbols and primitive arrows with source and target. Its free category has finite composable paths, empty-path identities and concatenation; associativity and units follow from path concatenation. Given equations between parallel terms, intersect all composition congruences containing them to obtain the least one. The indiscrete hom-wise relation ensures that family is nonempty. Quotient composition is well-defined because congruence respects surrounding compatible paths. [Selinger, §§2–3](https://www.mathstat.dal.ca/~selinger/papers/graphical-2up.pdf)

The earlier generic propositions retain these bounded uses:

- **P1, interpretation:** assign objects and typed primitive arrows in a target category. If every equation has equal images, the path interpretation descends to the quotient, preserves identities/composition and is uniquely determined. Section 2 supplies an actual finite instance of its equation check.
- **P2, interpretation kernel:** for parallel `f,g`, let `f~g` mean `I(f)=I(g)`. Target equality gives equivalence; functoriality gives `I(bfa)=I(b)I(f)I(a)=I(b)I(g)I(a)`, so it is a congruence. The induced functor from the quotient is faithful on each hom-set by definition. It need not be injective on objects or an equivalence.
- **P3, refinement:** on a common source, suppose `U:D_fine->D_coarse` and natural isomorphism `eta:U I_fine=>I_coarse` are supplied. Then `I_coarse(f)=eta_B U(I_fine(f)) eta_A^-1`; fine equality implies coarse equality. The converse needs additional conditions. Naturality is `J(f)eta_A=eta_B I(f)` for every typed `f:A->B`. [Riehl, §§1.3–1.5](https://emilyriehl.github.io/files/context.pdf)

These results require the stated categories and maps. A bare graph or arbitrary valid-Program set need not be closed under identities and composition. Parallel structure, retry, recursion and costs need additional operations/laws. In Set an arrow is a total function; general morphisms need not be functions. Functors are morphisms in Cat at an appropriate size. An Effect implementation does not establish a categorical model of the whole runtime, including identity traces and effects.

Four equalities stay explicit: exact encoded artifacts; constructions modulo chosen equations; behavior under a specified interpretation/domain/observation/effect model; and runtime occurrence/cause. Canonical serialization addresses the first, not the other three. A loop sum and `n(n+1)/2` agree over exact naturals by base zero and the recurrence adding `n+1`; that does not identify their syntax or bit cost. Category theory, Yoneda and universal properties use the category's chosen equality rather than providing an algorithm-identity oracle.

### Appendix B. Frame, worker and method coordinates

A unified vocabulary can retain material coordinates without preserving historical duplicate meanings: typed construction/contract, operation purpose, regime, authority, evidence/result and runtime occurrence. GTL exposes those constructions; Program owns topology, starts, membership and policies; an overlay supplies non-callable composition/binding. GraphFunction is the named callable template/outer contract, distinct from its materialized graph and runtime call. `workflow.C`, pointwise batch, bounded retry and graph recursion retain their different contracts and lineage. HoG directly traverses that admitted structure; owners realize effects; ABG admits causal runtime truth. [Product identities/algebra](../../../specification/PRODUCT.md#gtltypescript)

Native [FOUNDATIONS](stdo://releases/v3.0.0-rc.1/standards/FOUNDATIONS.md#the-frame-tuple) owns `F=<Q,B,M,C,I,A,E,X,R,J,K,D>`: evaluation family; workspace/topology basis; material relations; coordinates/equality; invariants; authority; evidence/provenance; exclusions; closed result algebra or its refinement; invalidation/rechart; actor capability; optional dependencies/overlaps/inputs/outputs. It specifies an engagement relation, not a mandatory schema. Procedures in frame prose are one architectural algorithm carrier; frames can also supply criteria and authority without prescribing an algorithm. Structure encodes relations; interpretation gives their meaning. Inference exposes consequences of premises and supplies neither a new empirical observation nor authority.

Frame definition, activated engagement, Context declaration and selected rendered view are distinct coordinates. Role expresses semantic capability, Job durable work, Worker concrete resolved actor, session/process execution realization, and runtime Frame call/attempt/lineage. Call/role/locus binds the view; no one-worker-per-unit law follows. Runtime provenance retained outside a prompt remains necessary. A fresh session or different model supplies no authorship independence. [Worker](../../../specification/requirements/abg/REQ-R-ABG3-WORKER.md#acceptance-criteria), [Frame](../../../specification/requirements/abg/REQ-R-ABG3-FRAME.md#acceptance-criteria), [independence](stdo://releases/v3.0.0-rc.1/standards/EXECUTIVE_BASELINE.md#17-actor-binding-and-independence)

STDO binds requirements calculus to computational calculus and that calculus to an execution environment. Those bindings are not automatically functors. Algorithmic steps, informational interpretation and computational realization can change independently. Its core results are satisfied, falsified, indeterminate, out_of_frame and invalid_basis; out_of_frame concerns a required relation or capability undeclared by the activated frame. An unperformed assessment has no result. Conjunction preserves failures, missing assessments and uncovered obligations; owner acceptance is separate. [SPEC_METHOD §11](stdo://releases/v3.0.0-rc.1/standards/SPEC_METHOD.md#11-build-tenant-binding), [FOUNDATIONS Results](stdo://releases/v3.0.0-rc.1/standards/FOUNDATIONS.md#results)

The selected native categorical-establishment rule additionally requires applicable a_c records/maps and demonstrated bindings with scoped evidence. Hypothesis H1 remains unresolved. Neither the finite proof nor code inspection supplies whole-tenant conformance, semantic truth of an LLM assessment or installed qualification. Native “functor kind” is a traversal classification; no compulsory `F_P->F_D->F_H` chain follows. [FOUNDATIONS formal fragment](stdo://releases/v3.0.0-rc.1/standards/FOUNDATIONS.md#4-algebra), [a_c §5](stdo://releases/v3.0.0-rc.1/standards/AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds)

### Appendix C. Retention and wider hypotheses

The temporal example is ordinary stateful processing. The [ontology's transition-preservation criterion](../../../../constraint_emergence_ontology/constraint_emergence_ontology_v3.md#what-transfers-across-domains) is useful background for selecting domain, horizon, readout and tolerance, rather than a new axiom replacing native observation sufficiency. Emergent organization or an attractor would need separately defined formation, boundary, persistence and dynamics; this example establishes none of them. A Markov projection can lose the Markov property, and lumpability needs extra conditions. [Geiger and Temmel](https://arxiv.org/abs/1212.4375v6)

Retained counterexamples, proposals and adopted constraints have different standing. A later context can use qualified evidence to change search; binding generalization needs owner adoption. Physical residue can influence execution even after failed admission; that influence is not lawful reuse. Applicable observation/admission bases, unknowns and unresolved obligations survive under [Product recovery/reuse](../../../specification/PRODUCT.md#live-state-recovery-and-valid-reuse). These wider issues motivate scoped cases, not a new store or controller.

### Appendix D. Revision and source custody

This rewrite supersedes the argument at SHA256 `91ba6228677afc384290173fc10bc7faa4578a3526bab04b44c976cf248bd640`, preserving its Date, filename and Open discussion state. Its original source cut was `23bd79b7e11f54ee3e5be5dd0d6cf31e285463a5`; the current worked-case basis is `91a2caa62e9c0566da0c55d35c5e6764e544537c`. The original seven custody files below are unchanged between them. The [earlier options post](20261023T211957Z_STRATEGY_gtl_worker_reference_frame_coherence_options.md) remains separate commentary at `62e508f208f9fd78cedd973b907a2d6f47a01b50d917c886b9f991557d187466`; its preference for investigating B is repriced by this case.

The [Definition](../../../stdo_abiogenesis.json) still selects STDO `v3.0.0-rc.1`, manifest `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`, composition `[]`, and the [project frame basis](../../../build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#governed-outcome-and-workspace). External ontology/Harness sources are conceptual inputs, not adopted Product composition. Hashes below identify source custody, not semantic acceptance. Code labels abbreviate `build_tenants/abiogenesis/typescript/code/src/`; fixture labels abbreviate that tenant's `test_env/`; the design row is tenant-relative.

| Source | SHA256 |
|---|---|
| `specification/PRODUCT.md` | `48050e7eb0bcd038e106da32705c621f63fddf6af053228626c94aa216e915cd` |
| `specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md` | `bdc3f6b3a30813c85eb48603ada692cff34222e67debd2413560aaa39a1af8c4` |
| `stdo_abiogenesis.json` | `e539f249dba55892fcc0ba13053a42870b20b445f8fddcc1e8f985744352d8a8` |
| `design/ABI5_STDO3_COMPUTATIONAL_BINDING.md` | `8b727bf268c9faf9b902c75b4af62f3757e3d6ab03ab377f4ff6060ab6c8fa75` |
| `gtl/stdo_run_environment.ts` | `ec246b14d7ca6e336af237e2c4724486b364943d2b441152cbd0aa2477ad2bb1` |
| `abg/instruction_assembly.ts` | `e884311aa485826cbd8414342dd1f56ae9a7ae6b5770890776a44300d78bae2d` |
| `gtl/serialization_contracts.ts` | `24e3cf03449ef547b6b92e28c630392e7fe19c07094551aea24d3eb6a971f1b2` |
| `product/semantic_job.ts` | `99237e4ec0d5a2382035270b4f4963419fd614297e0040912143d897b78e5bfe` |
| `product/semantic_stage.ts` | `29b28ad15eb7d43166cf45446b76524f78ecd051f736f5d827bc5f18eef100d7` |
| `abg/semantic_job.ts` | `6363c09d3cf30465a0598a2cf0f2d25651aa103a6a04a536704fc465f8268581` |
| `gtl/semantic_stage_publication.ts` | `7785f8e39cc4d22717264cf548ea07247f40b33849a527225a73b7729e33cb48` |
| `hog/judgment.ts` | `1016c37bd892f298cd8bc9db70554cdced332ab9ca6d541976d573e878d76009` |
| `hog/ccall_lifecycle.ts` | `c9a930fa7030ecbd58180229680495fba95991a7dcb4e36687fea437536b5781` |
| `hog/workflow_lifecycle.ts` | `4771e530969b5402d9a223737f43bf1b08dee9124cf0e2cc3504313c26ea8da1` |
| `support/t287-generic-job-lifecycle.mjs` | `d7f5948a0606329857de76771007f9922528440021da7ea95487ebe13d181a3f` |
| `support/t287-generic-job-intake.mjs` | `0de0dfe278cdf2c49ba7f58751476faa085acdb134cf728ae63d371a96d0a683` |
| `tests/t287-generic-job-meaning.test.mjs` | `4a055349dd59714ad3ffefd7d3a0f60d7fb8c13d0d0c89d29582228f49f8036b` |

External ontology: commit `942d4bda15c5b0f5ec5162737353cde3d06e28f3`, file SHA256 `f55ac90669ef01bed3c2fb3d19fdf24f96bc531b103ecfb4529f6da548775e11`. Harness²: commit `1cfe254e8d25b15f37048c3730134686abe60335`. Mathematical references are the primary Selinger and Riehl texts linked above. The finite table arguments are the evidence claimed here; no source suite was run.

## Recommended Action

Use the current qualified view/reference construction as the baseline for this case. Check a consumer's required continuation before proposing another representation. Investigate B only when a concrete relation cannot be preserved economically through existing contracts, or controlled information-equivalent comparisons show a useful benefit over the simplest adequate fix.

Carry the precise common `F_D` definition and four operation profiles to their semantic owners for alignment. Keep the annotation/retention factorial comparison separate from that normative decision. Any future implementation, experiment, publication or migration requires its own owner selection under the current Goals; this post selects none.
