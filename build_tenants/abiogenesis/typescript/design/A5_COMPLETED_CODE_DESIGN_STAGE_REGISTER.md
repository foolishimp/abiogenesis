# A5 Completed-Code Design Stage Register

**Status**: Active retrospective design gate
**F_H mandate**: 2026-07-12 three-view Mermaid design before coding
**Shared method authority**: `specification_methodology` commit `b3e5e4a`
**Tenant authority**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md)

## Scope

This register covers the reviewed code-bearing 5.0 stages, including the
retrospective stages completed before the rejected Consensus implementation
and the accepted replacement stages added afterward. It groups code by durable
semantic checkpoint, not by file or mechanical commit.

The code line is frozen for new product implementation until every non-accepted
design below receives an independent axiom review and an F_H `accepted` or
explicit rework disposition. Retrospective diagrams describe the current code
against prior authority; they may not normalize a code-first category error.

## Stable-First Authority Basis

The stable-first ruling is persisted by checkpoint `7107604`: ABIogenesis 5.0
is the complete stable baseline, and recursive dogfooding begins with the 5.0.1
successor after odd_glc 1.0 matures over exact installed 5.0. The retired
self-host/GLC campaign ladder is not a 5.0 qualification or release gate. This
register remains a derived design-review surface; GOALS, INTENT, PRODUCT, and
requirements own product scope, while T-244 traces feature closure.

## Registered Stages

| Stage | Ticket and commits | Three-view design | Current verdict | Coding consequence |
|---|---|---|---|---|
| Typed C-algebra authoring, raw admission, and semantic compilation | T-220; `014448f` | [M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md](./M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md) | `candidate` | The base authoring/compiler code is frozen. Direct `workflow.C` is realized by T-259; direct root `C.batch` and typed HOF projection are realized by T-260; direct root `C.retry` is realized by T-261. Mixed expressions retain explicit successor gaps. |
| Exact typed HOF vector relation | T-253 | [M01_M03_TYPED_HOF_VECTOR_RELATION_BEHAVIOR_DESIGN.md](./M01_M03_TYPED_HOF_VECTOR_RELATION_BEHAVIOR_DESIGN.md) | `accepted` | Native vector boundaries and fan-out relations preserve exact admitted member and vector contracts. Runtime interpretation remains separately owned. |
| GraphVector-to-declared-C-program selection | T-254 | [M01_M03_GRAPH_VECTOR_C_PROGRAM_SELECTION_BEHAVIOR_DESIGN.md](./M01_M03_GRAPH_VECTOR_C_PROGRAM_SELECTION_BEHAVIOR_DESIGN.md) | `accepted` | One admitted GraphVector selects one declared C program without adding a second execution key or runtime controller. |
| Canonical GraphFunction combinator applications | T-265 | [M01_M02_M03_GRAPH_FUNCTION_COMBINATOR_APPLICATION_BEHAVIOR_DESIGN.md](./M01_M02_M03_GRAPH_FUNCTION_COMBINATOR_APPLICATION_BEHAVIOR_DESIGN.md) | `accepted` | Recurse, fan-in, and gate retain canonical first-class application declarations across M01/M02/M03. |
| Native Node and interface type witnesses | T-266 | [M01_M02_M03_NATIVE_NODE_INTERFACE_TYPE_WITNESS_BEHAVIOR_DESIGN.md](./M01_M02_M03_NATIVE_NODE_INTERFACE_TYPE_WITNESS_BEHAVIOR_DESIGN.md) | `accepted` | Public constructors preserve native inferred type relations while private witness authority remains outside the packed API. |
| Strict raw Module admission | T-263 | [M01_M02_STRICT_RAW_MODULE_ADMISSION_BEHAVIOR_DESIGN.md](./M01_M02_STRICT_RAW_MODULE_ADMISSION_BEHAVIOR_DESIGN.md) | `accepted` | Duplicate, unknown, malformed, and lossy raw Module fields fail before canonical admission. |
| Proportional conformance inventory | T-264 | [M03_PROPORTIONAL_CONFORMANCE_INVENTORY_BEHAVIOR_DESIGN.md](./M03_PROPORTIONAL_CONFORMANCE_INVENTORY_BEHAVIOR_DESIGN.md) | `accepted` | Conformance coverage derives from submitted structure and does not invent nonzero coverage for unused feature families. |
| Canonical Consensus GTL free construction and observed census | T-252; `abed6a0a` | [M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md](./M01_M03_CONSENSUS_GTL_FREE_CONSTRUCTION_BEHAVIOR_DESIGN.md) | `accepted` after topology and census repair | The canonical body remains pure data. Its current compiler gaps are exhaustively mapped to active owners; body closure does not imply runtime realization. |
| Direct `workflow.C` static binding and child-traversal runtime atom | T-259 | [M03_WORKFLOW_C_RUNTIME_BEHAVIOR_DESIGN.md](./M03_WORKFLOW_C_RUNTIME_BEHAVIOR_DESIGN.md) | `accepted` under delegated F_H | One direct module-contained child workflow is realized without a child catalog entry. Canonical product traversal remains startup-blocked by T-267. |
| Typed fan-out, ordinal `C.batch`, and exact fan-in runtime | T-260; `398f254` | [M03_TYPED_HOF_BATCH_RUNTIME_BEHAVIOR_DESIGN.md](./M03_TYPED_HOF_BATCH_RUNTIME_BEHAVIOR_DESIGN.md) | `accepted` and `closed` under delegated F_H | Direct root batch, runtime-cardinality fan-out, and exact fan-in are realized with structural/runtime authority separation. Nested and mixed batches remain gaps, and the T-267 startup fence remains authoritative. |
| Bounded `C.retry` runtime and one-policy join | T-261; `848a0b81` | [M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md](./M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md) | `accepted` and `closed` under delegated F_H | One direct root retry over one C.of leaf is realized with selected-Module authority, replay-derived attempt identity, bounded budget, exact historical-transition validation, and the single shared retryable-failure allowlist. Nested and mixed retry remain gaps; the T-267/T-268 startup fences remain authoritative. |
| Typed recurse policy, foldback, and replay runtime | T-262; `e09d3b65`, `7a9cfb01`, `212ea500` | [M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md](./M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md) | repaired and externally accepted | One direct recurse application is retained. The former unconditional parent-rebind admission is replaced by an exact deterministic witness and a live rejection test. T-262 is closed after the independent review accepted the proportional repair. |
| Complete structural C-program interpreter | T-271; `3e726aa1` | [M03_COMPLETE_C_PROGRAM_INTERPRETER_BEHAVIOR_DESIGN.md](./M03_COMPLETE_C_PROGRAM_INTERPRETER_BEHAVIOR_DESIGN.md) | repaired, F_H-accepted, and closed | Compile one complete admitted seven-constructor C tree once, then interpret it through retained atom laws. The repair joins exact locus/retry identity, shared retry truth, result conservation, replay-owned batch projection, and selected binding. T-267 is closed; T-270 remains the public-entry gate. |
| Traversal result-interface and bind-conservation static admission | T-267; `ce354ea7` | [M03_TRAVERSAL_RESULT_BIND_CONSERVATION_BEHAVIOR_DESIGN.md](./M03_TRAVERSAL_RESULT_BIND_CONSERVATION_BEHAVIOR_DESIGN.md) | repaired, direct-F_H accepted, and closed | Preserve every authored stage and keep ABG bind stages distinct. Static conservation admits all 35 canonical sources while retaining `effectsPermitted: false`; T-270 remains the separate runtime-start authority. |
| Execution-declaration compilation and basis-owned runtime handoff | T-220 P4; `014448f` | [M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md](./M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md) | `candidate` | The handoff code is frozen. It cannot certify a constructive C body because the separate C-conformance result is not bound into `ExecutionBasis`. |
| Malformed and contradictory F_P output admission plus ABG-owned producer attribution | T-220 P4 and T-223; `014448f`, `28da030` | [M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md](./M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md) | `blocked` | Producer attribution is a passing subclaim; admission remains frozen because G1-G5 require disposition and raw-to-close impossibility is not yet proven. |
| Installed product, workspace, binding, and catalog foundation | T-223 foundation; `f572ee9` | [M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md](./M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md) | `candidate` | Foundation code is frozen pending cross-view axiom review. |
| Public-contract assembly, generated schemas, publication, and parity | T-223 publication; `b445eb1` | [M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md](./M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md) | `candidate` for DS-1; complete 5.0 `blocked` | Static-publication code is frozen. The exact subset proof cannot stand in for the missing operation, capability, schema, vocabulary, and corpus rows. |
| Public SDK, CLI, capability preflight, invocation, result, replay, and F_H response/resume admission | T-223 public surface; T-258; `8e71464` | [M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md](./M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md) | T-258 `accepted` and `closed`; complete 5.0 surface `blocked` | The typed F_H hold, response, replay, and resume-admission boundary is realized. T-267 still owns post-resume traversal consumption; the remaining public operation families retain their own delivery owners. |
| Instruction startup, declared protocol source, rendering, and live-plugin prompt handoff | T-223 instruction path; `b445eb1`, `28da030` | [M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md](./M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md) | `blocked` | The manifest/render/transport tail is reusable, but M03 currently authors protocol text and asserted refs that GTL must declare. |
| Packed candidate, clean install, bounded negatives, and installed live proof | T-223 installed vertical; `779eb07`, `28da030` | [M02_M05_PACKED_INSTALLED_VERTICAL_BEHAVIOR_DESIGN.md](./M02_M05_PACKED_INSTALLED_VERTICAL_BEHAVIOR_DESIGN.md) | `blocked` | Two-product packaging and observed evidence are candidate subclaims; F_P admission and instruction placement prevent acceptance of the full live vertical. |
| Reverted imperative Consensus implementation | rejected `945b5a2`; revert `2c85a88` | [M03_CONSENSUS_REJECTED_AS_BUILT_BEHAVIOR_DESIGN.md](./M03_CONSENSUS_REJECTED_AS_BUILT_BEHAVIOR_DESIGN.md) | `rejected` | No code or contract salvage by presumption. A future GTL design must expose missing atoms as gaps before implementation. |
| Project-wide Prime contraction gate and migration | T-277; `8642e5f9` | [ADR-044](./adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md) | direct-F_H accepted and closed after full-tree review | The measured contractions are complete. The gate and ledger remain design authority only and cannot become product runtime truth; future semantic delivery stays with each existing owner. |
| Public operation and schema-projection Prime contraction | T-277; PC-004/PC-005 | [M04_PUBLIC_OPERATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md](./M04_PUBLIC_OPERATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md) | accepted and closed with T-277 | The current 19 operations consume one runtime definition register, one static contract map, retained typed SDK dispatch, and one shared schema-definition projector without changing public identity or behavior. |
| One Surface semantic authority family and program application | T-280; PC-007/PC-011 | [M03_M04_ONE_SURFACE_AUTHORITY_BEHAVIOR_DESIGN.md](./M03_M04_ONE_SURFACE_AUTHORITY_BEHAVIOR_DESIGN.md) | exact repaired design independently accepted; bounded implementation authorized | Keep AF-11, AF-12, AF-13, and AF-16 distinct, admit AF-14 without re-selection, and derive success or typed refusal through the existing locus-only C-call, payload-ledger, Event Calculus, and application-bound rule relation while the admitted GTL program owns composition. Independent implementation review remains required. |
| Native public-contract projection and common packet mechanism | T-281 Phase A; PC-004/PC-005 | [M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md](./M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md) | independently accepted for Phase A implementation only | Use one pinned Valibot projector with seven closed mappings and exact catalog, grant, authority, invocation, and outcome packets. No operation row, handler, SDK/CLI path, publication, or P1/P2 hard-break claim enters Phase A. |
| Public catalog invocation authority | T-270; PC-007 | [M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md](./M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md) | F_H-authorized for implementation; independent closure review pending | Derive a complete vector/locus execution-authority table from one selected catalog binding, bind it into the existing ExecutionBasis, and enter T-271 through the single public catalog router. |
| F_H runtime continuation | T-272; PC-007 | [M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md](./M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md) | F_H-authorized for implementation; independent closure review pending | Open interaction truth from an engine-held T-271 receipt, admit public response/resume, and continue through the same receipt family and interpreter. |
| Consensus public contract and callable publication | T-274; PC-001/PC-002 | [M02_M04_CONSENSUS_PUBLICATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md](./M02_M04_CONSENSUS_PUBLICATION_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md) | phase split independently accepted; T-274A dependency-gated and T-274B fenced | T-274A derives nine temp-only physical schema assets and two vocabularies from one native family through the accepted T-281 projector after that implementation closes. T-274B later derives public rows and the SYSTEM callable from the exact admitted T-252 Module after T-281 P1 and T-270. |
| Consensus closed domain family | T-275; PC-001/PC-003 | [M03_CONSENSUS_DOMAIN_FAMILY_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md](./M03_CONSENSUS_DOMAIN_FAMILY_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md) | F_H-authorized for implementation; independent closure review pending | Replace fourteen open carrier aliases with one exact discriminated family while keeping graph-only variants private and preserving existing typed-node witnesses. |
| Capability declaration graph and tenant-manifest projection | T-268; PC-006 | [M02_M04_CAPABILITY_DECLARATION_GRAPH_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md](./M02_M04_CAPABILITY_DECLARATION_GRAPH_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md) | F_H-authorized prospective design; independent closure review pending | Extend the existing capability register and derive assets, catalog rows, manifest claims, dependencies, and effects without adding a second capability model. |
| Installed Consensus scenario factorization | T-276; PC-008 | [M04_M05_INSTALLED_CONSENSUS_SCENARIO_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md](./M04_M05_INSTALLED_CONSENSUS_SCENARIO_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md) | F_H-authorized prospective design; independent closure review pending | Use one source-blind installed driver for all outcome and workspace coordinates while retaining independently replayable run archives. |

## Non-Code Dispositions

The following completed records do not own a separate completed-code design
stage:

- T-221 is a release-line disposition, not product code.
- T-222 is the design authority consumed by T-223 and is evaluated through the
  T-223 semantic-stage views in this register.
- T-224 through T-241 were retired, repriced, or contain design, qualification,
  release, ticket, or specification records rather than completed 5.0 product
  code on the current line.
- The untracked self-build design pack is future design work and is outside
  this register until separately admitted.

## Evaluation Order

The standing design command is `npm run check:design` from the TypeScript
tenant root. Its Mermaid lane derives its source set from the register above,
checks that completed DS-1 through DS-3 ticket design carriers are represented,
requires the ordered domain/sequence/state views, renders with the pinned local
Mermaid CLI into temporary output, and removes that output. Its prospective
Prime lane validates T-277-governed accepted designs against ADR-044. A green
render or Prime block remains deterministic evidence; neither replaces
independent axiom or F_H review.

1. Run the standing Mermaid structural/render command.
2. Apply its cross-view invariants.
3. Evaluate its axiom matrix against live PRODUCT, requirements, Design Module,
   and ODD law.
4. Reconcile the diagrams against the cited implementation paths and tests.
5. For GraphFunction boundaries, admit the exact GTL body and run the current
   ABG semantic compiler, retaining every typed gap. GLC may supply optional
   downstream-consumer evidence only.
6. Record `accepted`, `rejected`, or `blocked` without changing code to make the
   diagram easier to approve.
7. Obtain F_H ratification before changing the registered implementation or
   starting the next product-code stage.

## Next-Code Boundary

T-271 complete-program interpretation and T-267 whole-program conservation are
closed. T-270 is the next code boundary: it owns the single public catalog
entry into the accepted plan and conservation authorities. T-272 then owns
F_H continuation through that same receipt family. T-274/T-275 publish the
Consensus product surfaces; T-268 capability publication and T-276 installed
scenarios remain downstream gates.
