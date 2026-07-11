# T-220 - Close The Typed GTL/C Algebra Authoring Loop

- id: T-220
- title: Close the typed GTL/C algebra authoring loop
- type: bug
- ticket_category: contract_law_enforcement
- status: completed
- goal: abg-5-0-self-hosting (candidate leaf under T-218)
- priority: critical
- owner: abiogenesis
- build_tenant: typescript
- governance_scope: STDO Method
- change_class: requirement_reprice
- re_entry_point: specification/requirements/gtl
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- closed_at: 2026-07-11
- implementation_authorization: authorized by F_H direction on 2026-07-11
- intake_source: >-
    An LLM agent inferred a new vector-local dispatch carrier from a downstream
    execution census even though the existing GraphFunction, GraphVector,
    C-program, fibre, plugin, handler, and traversal boundaries already made
    that inference unlawful. TypeScript compilation, the command named
    lint:semantic, focused tests, and the optional GTL program conformance gate
    did not reject the category error.
- change_intent: >-
    Make the existing GTL/C structure executable as an LLM authoring grammar.
    Encode each locally decidable axiom with native TypeScript types and API
    signatures; apply the same judgments when admitting serialized data; make
    the ABG semantic compiler report irreducible reference, completeness, and
    whole-program gaps with stable diagnostic identities and lawful repair
    affordances; and prevent untyped paths from reaching execution.
- operating_assumption: >-
    The current product runs on one developer desktop. Native in-process code
    is trusted. Malformed authored GTL and malformed or contradictory F_P
    output are the defended boundaries; hostile local-object forgery,
    filesystem tampering, and cryptographic substitution are out of scope.
- dependencies:
  - T-219 specification reconciliation supplies the current WHAT baseline
  - T-218 references T-220 rather than duplicating this delivery body
  - completed T-143, T-152, T-185, and T-187 remain predecessor evidence, not closure substitutes
- links:
  - `.ai-workspace/tickets/completed/T-218-abg-5-0-self-hosting-release-wave.md`
  - `.ai-workspace/tickets/completed/T-219-spec-reconciliation-what-from-realized-how.md`
  - `.ai-workspace/tickets/completed/T-143-define-gtl-compute-notation-types-over-ratified-carriers.md`
  - `.ai-workspace/tickets/completed/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md`
  - `.ai-workspace/tickets/completed/T-185-ratify-gtl-program-overlay-and-abg-traversal-monad.md`
  - `.ai-workspace/tickets/completed/T-187-add-semantic-compiler-guardrails-for-installed-context-and-program-shape.md`
  - `build_tenants/abiogenesis/design/ABG_3_UNIFORM_C_CALL_ENVELOPE_DESIGN.md`
- source_documents:
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
  - specification/requirements/gtl/REQ-L-GTL3-ATTRS.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPOSE.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-CCALL.md
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md
- affected_boundary:
  - GTL C-algebra requirements and authoring API
  - GraphFunction and GraphVector declaration typing and admission
  - HoG program syntax and normalization
  - ABG GTL program conformance diagnostics
  - compiled execution-declaration handoff and F_P response admission
  - semantic test and bypass-guard lanes
- target_truth: >-
    An LLM authors canonical GTL data only through a published typed grammar.
    Locally decidable category mistakes do not typecheck. The same mistakes in
    untyped input fail admission or semantic compilation with stable domain
    diagnostic identities.
    Cross-program gaps are reported by the semantic compiler with admissible
    repair moves. Only typed, admitted, and compiled program declarations reach
    ABG execution; the runner does not invent types from observed behavior.
    Probabilistic F_P output is admitted against its response contract before
    it can become accepted assessment or closure truth; raw diagnostic evidence
    and non-close retry truth may remain replay-visible.
- superseded_truth: >-
    Prose context, agent memory, open string-keyed declaration bags, structural
    object compatibility, ordinary TypeScript compilation, ESLint, focused
    happy-path tests, or a caller-selected partial conformance inventory are
    sufficient to prevent an LLM from misunderstanding GTL/ABG structure.

## Scope

This ticket closes existing language structure. It does not add a feature,
new graph carrier, new C primitive, new stage role, new fibre, new plugin seam,
new traversal controller, or downstream-specific execution route.

The canonical authored form remains pure data. Native TypeScript interfaces,
generics, discriminated unions, opaque types, constructors, and API patterns
are its executable grammar in the TypeScript tenant; they are not a second
constitutional syntax.

## Structural Axioms

| ID | Axiom | Native type/API enforcement | Semantic compiler enforcement |
|---|---|---|---|
| `AX-T220-01` | `GraphFunction` is the published callable constructive carrier; `GraphVector` is an internal adjacency boundary beneath it. | Distinct host types, declaration APIs, refs, constructors, and entry signatures. | Reject bare-vector publication, start, job targeting, controller use, and category-wrong refs. |
| `AX-T220-02` | A GTL program/overlay binds graph functions and policy; a workspace is instance state; neither is interchangeable with a graph function or ABG traversal. | Distinct program, function, workspace, admitted-basis, and projection types. | Resolve joins and reject direct-vector/plugin/worker traversal substitutes. |
| `AX-T220-03` | C is compute. Its generator set is exactly `C.of`, `C.id`, `C.compose`, `C.edge`, `workflow.C`, `C.batch`, and `C.retry`; `C.edge` fields are direct atomic `C.of` leaves, and batch compatibility is per ordered task. | Closed discriminated union and exhaustive constructors; composition preserves input/output types; edge fields and batch carriers/cardinality are type constrained. | Decode canonical data, resolve named lifts from the bound root, check per-task program cardinality, and report unsupported realization as a typed gap. |
| `AX-T220-04` | Stage role and fibre are orthogonal. `{F_D,F_P,F_H}` is interior data; changing the declared fibre does not alter graph topology or C-call spine shape. | Role/fibre-indexed stages and implementation bindings; no observed-result-to-fibre coercion. | Preserve the declared fibre and reject undeclared arms or mismatched bindings. Cross-version F_P-to-F_D annealing equivalence is a separately governed declaration change. |
| `AX-T220-05` | Plugins and handlers realize one selected C interior. They do not author program shape, select traversal, emit runtime truth, own continuation, or close work. Domain C carrier continuity and implementation transport-carrier admission are distinct judgments. | Authority-denied interfaces omit those capabilities and bindings name program/role/fibre/arm; each seam retains its own published carrier contract. | Reject authority-bearing or unmatched implementation rows before execution without equating an engine-plugin envelope to a domain C carrier. |
| `AX-T220-06` | The seven execution declarations compiled by this ticket have one host scope, value kind, precedence law, composition law, and interpreter owner; opaque config is not executable meaning. | Host-indexed declaration builders, a published execution-declaration law table, and branded admitted forms. | Reject unknown reserved keys, wrong hosts, wrong value kinds, duplicates, contradictory HoG selectors, and duplicate plugin authorities. Wider legacy-key metadata remains a separately routed registry requirement. |
| `AX-T220-07` | Runtime observations and downstream censuses are evidence, never declaration authorship. Selection chooses only among declared terms. | Selection APIs require a typed declared candidate set. | Prove selected program, stage, fibre, and implementation membership from admitted declarations. |
| `AX-T220-08` | Authored, admitted, compiled, and runtime carriers are distinct language states. Native code uses typed constructors; serialized data uses raw admission. | Opaque/nominal types and constructor APIs prevent ordinary authoring mistakes. | Compile admitted declarations before effects and reject malformed serialized state; hostile in-process object fabrication is outside the desktop trust boundary. |
| `AX-T220-09` | Diagnostics are part of the LLM authoring protocol. | Typed C diagnostic and repair carriers plus stable typed admission refusals. | C/conformance diagnostics carry identity, subject, violated axiom, expected/actual relation, evidence, and admissible repairs; direct execution admission refuses with a stable boundary/reason. |
| `AX-T220-10` | F_P output is response data, not accepted assessment or closure truth. | The worker contract publishes a response carrier; domain artifact extensions are governed by their selected declared schema. | Admit required identity/evidence and cross-field invariants before acceptance or closure; malformed output becomes blocked/rejected and contradictory output can produce only non-close retry/blocked truth. |

## Enforcement Order

Use the earliest boundary capable of deciding a claim:

1. Native TypeScript type and API matching for local structure.
2. Runtime admission applying the same rules to canonical serialized data.
3. Semantic compilation for references, reachability, completeness, identity,
   equivalence, catalog membership, conservation, and other global facts.
4. Lint/source guards only to prevent duplicate parsers, raw runner
   reads, or unregistered semantic keys from bypassing those authorities.
5. F_P response admission for likely malformed or contradictory worker output;
   runtime does not repair authored law or treat worker text as truth.

## Risk-Weighted Defensive Allocation

These are planning priors per LLM-authored or worker-mediated change, not
measured production frequencies. They allocate engineering effort and shall be
revised from replay evidence.

| Failure class | Directional prior | Defensive move | T-220 disposition |
|---|---:|---|---|
| Native GTL carrier/category mismatch | 15-35% | typed constructors, generics, discriminated unions, type tests | mandatory now |
| Malformed serialized GTL shape/value/duplicate | 10-25% | closed raw admission plus exact diagnostics | mandatory now |
| Unresolved ref or catalog/program membership | 8-20% | semantic compiler over the submitted root | mandatory now |
| Role/fibre/arm or implementation mismatch | 5-15% | semantic compiler and execution-declaration admission | mandatory now |
| No, truncated, or invalid F_P JSON | 3-10% | JSON-object extraction to typed blocked result | mandatory boundary verification |
| Valid F_P JSON with wrong shape or missing evidence | 2-8% | closed result/artifact admission before replay projection | mandatory boundary verification |
| Wrong F_P edge or assessment membership | 1-5% | identity and expected-membership admission | mandatory boundary verification |
| Contradictory F_P disposition or omitted attestation | 1-5% | one closure predicate and corroboration checks | mandatory boundary verification |
| Misspelled optional F_P response field | 0.5-3% | exact response-key admission | fixed and pinned |
| Duplicate authored execution authority | 0.5-3% | duplicate-key/authority rejection during admission | keep because cheap |
| Accidental stale local plan/basis | 0.1-1% | ordinary construction-time coherence only | no adversarial hardening |
| Hostile reflected-symbol or local-object forgery | <0.01% | none for this product stage | explicitly out of scope |
| Cryptographic/filesystem tamper | <0.01% | none for this product stage | explicitly out of scope |

## Delivery Sequence

### P1 - Ratify The C Algebra Requirement

Promote the seven signatures, composition laws, named-boundary law, stage/fibre
orthogonality, admission behavior, and diagnostic obligations from PRODUCT and
the ratified uniform-C-call design into one GTL requirement family.

### P2 - Native Typed Authoring Surface

Implement the seven-term C algebra, host-indexed declarations, opaque admitted
states, and typed construction/composition APIs. Provide compile-time positive
and `@ts-expect-error` negative cases representative of LLM authoring.

### P3 - Admission And Semantic Gaps

Decode serialized programs and declarations into the same types. Extend the
existing ABG conformance authority with exact diagnostic identities and repair
affordances for host, value-kind, duplicate, reference, membership, and
unrealized-algebra gaps reachable from the submitted conformance root. It may
report an unimplemented lawful primitive as a gap; it may not reinterpret or
silently lower it into different structure. This judgment covers the submitted
root; selection of the product-authoritative root remains a product/install
binding obligation for T-218.

### P4 - Compiled Handoff And Response Boundary

Compile execution declarations once while constructing the execution basis and
have the runner consume that typed handoff. Add a source guard that fails on
new unregistered reserved declaration keys and on raw semantic interpretation
introduced in runner code. Admit F_P evaluator responses through a closed
schema and one contradiction-free closure predicate. Give TypeScript and
ESLint honest host-tool names; the semantic command must run semantic proof.

### P5 - LLM Authoring Corpus

The T-220 conformance corpus shall include canonical positive programs and the
initiating failure classes:

- all seven C constructors, carrier composition, identity, edge-leaf role law,
  batch cardinality, retry budget, and raw/native admission parity;
- stage role/fibre/arm declaration shape without inferred carriers or arms;
- execution declaration attached to an illegal host, wrong value kind,
  duplicated, malformed, or placed in contradictory selector authority;
- unresolved workflow reference versus lawful but unrealized workflow, batch,
  and retry constructors;
- malformed F_P response evidence rejected or blocked by result admission;
  contradictory evaluation evidence projected only as non-close retry/blocked
  truth;
- runner-local raw declaration parsing or an unregistered reserved key.

Diagnostics must be sufficient for an LLM to select a lawful constructor or
route a genuine language gap without source-tree reach-down. Repair affordances
do not perform or authorize the repair.

## Evaluation Criteria

- The requirements name every structural axiom and every seven-term C law.
- Native types reject all locally decidable category mismatches.
- Serialized and typed authoring routes agree on the structural
  acceptance/rejection relation; raw admission and semantic compilation add
  stable domain diagnostic identities.
- The compiler reports irreducible gaps reachable from its bound root rather
  than letting runtime discover authored meaning.
- Invalid authored GTL produces no worker, plugin, archive, traversal, or
  success/assessment/closure effect; diagnostic blocked and terminal events may
  report the refusal. Inadmissible F_P output produces no accepted result truth.
- Existing lawful programs preserve canonical identity and runtime meaning.
- No downstream execution pattern becomes GTL or ABG ontology.
- The test corpus reproduces the initiating LLM misunderstanding and rejects it.

## Requirement Proof Map

| Requirements | Direct proving surface |
|---|---|
| `-001`..`-005` | `t220_c_algebra_types.ts`; `test_t220_c_algebra.test.mjs` constructor census, composition, identity, edge-role, raw parity |
| `-006` | typed `CGraphFunctionRef<A,B>` cases plus unresolved-ref and `semantic_not_realized` compiler differentials in `test_t220_declaration_law.test.mjs`; wire-level outer identity remains the scoped residual below |
| `-007`..`-008` | native batch/retry type cases; batch cardinality, retry budget, and unrealized-constructor diagnostics in `test_t220_c_algebra.test.mjs` |
| `-009` | role/fibre type cases plus the existing T-200 engine fibre-substitution spine-shape proof in `test_t200_c_call_envelope.test.mjs` |
| `-010` | `test_t220_execution_basis_coherence.test.mjs` and the T-205 handler binding/registry cases in `test_t200_c_call_envelope.test.mjs` |
| `-011`..`-013` | `t220_declaration_law_types.ts`; `test_t220_declaration_law.test.mjs` host/value/duplicate/unknown-field admission cases |
| `-014`..`-015` | C and declaration diagnostic/repair cases in `test_t220_c_algebra.test.mjs` and `test_t220_declaration_law.test.mjs` |
| `-016` | basis-time syntax, handler, interpreter-anchor, and unsupported-regime refusals in `test_t220_execution_basis_coherence.test.mjs` |
| `-017` | the complete `npm run test:gtl-law` positive/negative corpus and `guard:gtl-law` bypass check |
| `-018` | `test_t220_fp_output_admission.test.mjs` plus accepted-with-retry and omitted-attestation differentials in `test_t217_standard_live_fp_dispatch.test.mjs` |

## Closure Law

Close only when the requirement, typed API, raw admission, semantic compiler,
runtime entry, diagnostic/repair protocol, bypass guard, and LLM-authored
positive/negative corpus agree on the same scoped axioms; all focused and full
package gates are green; and malformed canonical GTL cannot reach execution
through a raw execution declaration bag or a runner-local parser. Declared
execution references must resolve within the submitted root. Existing F_P
result admission must reject malformed output and prevent contradictory output
from becoming accepted replay truth.

## Non-Closure Conditions

- Any load-bearing structural rule remains prose-only.
- A T-220-owned execution declaration remains untyped or lacks published
  precedence/composition/owner law at its interpretation boundary.
- The seven C constructors are only labels without native type relations.
- `typecheckGtlProgram` passes while a declared execution reference is absent
  from the submitted root.
- Malformed or contradictory F_P output becomes accepted assessment or closure
  truth, or produces a close-eligible continuation. Non-close retry
  continuation remains lawful.
- A command named semantic runs only `tsc` or ESLint.
- Tests accept generic failure instead of the exact diagnostic identity.
- The compiler silently repairs, selects, or authors program terms.
- The ticket adds product capability or downstream-specific runtime structure.

## Execution Record

- 2026-07-11: F_H directed immediate implementation and validation, followed by
  T-217 closure and T-218 start.
- 2026-07-11: the uncommitted vector-local plugin/HOG routing detour was removed
  before implementation; it is evidence for the negative corpus, not precedent.
- 2026-07-11: implemented the seven-term native C algebra, opaque constructor
  admission, raw/native cardinality parity, direct-leaf `C.edge`, typed
  GraphFunction attachment, rich C diagnostics, and unresolved-reference versus
  unrealized-constructor classification.
- 2026-07-11: compiled HoG program/catalog/selector/ladder, handler attachment,
  and plugin selection declarations once at `ExecutionBasis` admission. Runner
  selection consumes the typed compiled carrier and the source guard rejects
  runner-local declaration parsing.
- 2026-07-11: repriced the trust boundary after F_H correction. The desktop
  process is trusted; hostile local-object and tamper defenses are not closure
  work. Retained native construction, raw admission, semantic compilation, and
  F_P result admission as the probability-weighted defensive boundaries.
- 2026-07-11: final objective gates passed: focused T-220 law 35/35,
  semantic lint 0, full semantic tenant 1430/1430, declared-artifact
  T-183/T-188 regression set 54/54, and `git diff --check` clean.
- 2026-07-11: two bounded independent reviews reported no remaining code or
  claim blockers under the trusted-desktop, malformed-GTL/malformed-F_P scope.
- 2026-07-11: closed the likely malformed-data paths found by bounded review:
  raw declaration wrappers and GraphFunction/GraphVector hosts reject unknown
  fields, canonical scalars reject non-finite numbers, and the live F_P
  evaluator rejects a misspelled optional disposition instead of defaulting it
  to close.

## Scoped Residuals

- Product/install binding of the authoritative conformance root is routed to
  T-218. T-220 proves the submitted root; the product binding selects which
  submitted root is authoritative for the release.
- A total expected execution-declaration inventory is not present in the
  current `GtlProgramExpectedCoverage` carrier. T-220 proves declared-reference
  completeness; T-218 owns release-manifest completeness rather than inferring
  missing declarations from absence.
- Precedence, composition, and interpretation-owner metadata for registered
  semantic declaration keys outside the seven execution keys above is routed
  to the T-218 candidate register as a distinct language-registry requirement.
- Runtime realization of lawful `workflow.C`, `C.batch`, and `C.retry` syntax is
  not delivered by this closure ticket; until separately authorized it remains
  a stable `semantic_not_realized` result.
- Exact serialized certification of a child GraphFunction's outer generic
  contract is not invented by T-220. The native `CGraphFunctionRef<A,B>` binds
  the admitted function and C carrier refs; serialized compilation proves the
  named function resolves. A stronger wire-level contract identity requires a
  separately ratified language contract.
- T-220 preserves the currently declared fibre but does not infer declaration
  revision history. F_P-to-F_D annealing requires the tuner/equivalence
  contract to compare a prior and proposed declaration; that cross-version
  admission remains outside this local compiler slice.
