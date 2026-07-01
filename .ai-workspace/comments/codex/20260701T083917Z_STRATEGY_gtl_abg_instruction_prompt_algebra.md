# Strategy: GTL/ABG Instruction Prompt Algebra

Status: strategy commentary, not ratified specification
Date: 2026-07-01
Author: Codex
Project: Abiogenesis
Scope: ABG instruction assembly law over GTL carriers, prompt rendering, typed node-driven dispatch, compression, relevance, proportionality, and assurance

## Claim

The prompt is not a free-standing product artifact.

The prompt is the rendered operational projection of all carriers lawfully
available for one edge decision.

More precisely:

```text
Prompt(edge)
  = render(
      ABG instruction assembly law over GTL carriers
      + selected graph-function contract
      + selected graph-vector contract
      + source node type obligations
      + target node type obligations
      + composed/subtype obligations
      + admitted runtime facts
      + prior artifact/evidence refs
      + authority regime
      + product policy overlay
      + required response carrier
    )
```

The rendered prompt is an ephemeral dispatch payload. It can be digest-bound,
observed, and audited, but it is not the source of truth. Durable truth remains
the GTL declarations, ABG runtime events, admitted payloads, evidence bindings,
assurance folds, residuals, disposition facts, and replay-derived projections.

The missing GTL/ABG component is an instruction algebra that makes this
aggregate lawful, compressed, relevant, proportional, and assurable.

The important refinement is that most of this should not be runtime-dynamic.
The stable instruction shape should be compiled and assured before traversal.
Runtime should bind only live refs, ledgers, projections, evidence, and current
frame/vector state.

```text
GTL declarations
  -> semantic compiler / F_D assembly proof
  -> assured assembly rules / prompt plan
  -> ABG startup admission
  -> runtime binding of live refs and ledgers
  -> immutable InstructionEnvelope to worker
  -> ABG response admission and replay
```

F_P can be used twice, but with sharply different authority:

- at compile time, F_P may propose or review product task wording, rubrics, or
  policy content, but deterministic compiler checks own relevance, compression,
  proportionality, type coverage, and authority safety;
- at runtime, F_P performs bounded work or judgment under an already-admitted
  instruction envelope.

Neither use lets prompt prose become runtime truth. F_P never owns the assembly
law.

## Trigger

The odd_glc framework-smoke live traversal proved that the current substrate can
run a real multi-vector software-build overlay through ABG and a live F_P
worker. The proof was real, but the prompt review exposed a structural gap.

The green run:

```text
odd_glc run:
  /Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/glc_software_build_overlay_live/framework-smoke-min-fp-js/20260701T061434349Z_pid70587/odd-glc-software-build-overlay-live-proof.json

command:
  CODEX_LIVE_FP=1 ODD_GLC_LIVE_SCENARIO=framework-smoke-min-fp-js npm run test:live

duration:
  577246ms total
  576485ms proof duration

selected graph function:
  graph-function://odd_glc/software-build/framework-smoke-min-fp

event log digest:
  sha256:bfc58c8abdd1cfe094ceb401d54d30b0c592cc0a392970ed377c3fd443e4d82c
```

The six vectors were:

| Vector | Stage | Source node | Target node | Produced or executed |
| --- | --- | --- | --- | --- |
| 0 | `implementation_design` | `lifecycle_context` | `implementation_design` | `design/implementation-design.md` |
| 1 | `source` | `implementation_design` | `source_surface` | `package.json`, `src/hello.mjs` |
| 2 | `test_design` | `source_surface` | `test_design_surface` | `design/test-design.md` |
| 3 | `test_source` | `test_design_surface` | `test_source_surface` | `test/hello.test.mjs` |
| 4 | `test_execution_plan` | `test_source_surface` | `test_execution_plan` | `test-execution-plan.json` |
| 5 | `test_execution_result` | `test_execution_plan` | `test_execution_result` | `node --test test/hello.test.mjs`, exit `0`, stdout `Hello, world!\n` |

ABG emitted the expected traversal shape:

| Event kind | Count |
| --- | ---: |
| `registry_entry_admitted` | 18 |
| `graph_function_selected` | 6 |
| `graph_call_opened` | 6 |
| `frame_opened` | 6 |
| `vector_traversal_planned` | 6 |
| `fp_dispatch_requested` | 6 |
| `actor_invocation_started` | 6 |
| `actor_result_artifact_observed` | 6 |
| `actor_invocation_closed` | 6 |
| `vector_evaluated` | 6 |
| `vector_closed` | 6 |
| `terminal_reached` | 1 |
| `evidence_admitted` | 43 |
| `payload_observed` / `payload_validated` | 61 / 61 |

The traversal was real. The prompt algebra was not.

## Prompt Review Findings

Only the custom `fpDispatch` plugin wrote prompt artifacts. The default
`fpEvaluator` was configured but did not produce a separate reviewed prompt
surface. Claude's internal `advisor` tool appeared inside some worker traces;
that is worker-internal behavior, not ABG or odd_glc plugin authority.

Prompt files were written at:

```text
/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/glc_software_build_overlay_live/framework-smoke-min-fp-js/20260701T061434349Z_pid70587/instance/.ai-workspace/glc-software-build-live/framework-smoke-min-fp-js/framework-smoke-min-fp-js-vector-{0..5}-prompt.txt
```

Three defects matter:

1. Stage-irrelevant boilerplate:
   file-producing vectors repeated instructions for package, source, test,
   design, and execution-plan files even when only one path was lawful for the
   current vector. The worker had to reason around traps that should not have
   been present.

2. Confusing node-type context:
   every prompt listed the same generic refs, such as `lifecycle_context`,
   `lifecycle_artifact`, and `evidence_binding_view`, even when the vector had
   specific source and target node-type obligations. This caused padded
   `nodeTypesUsed` responses instead of precise typed reasoning.

3. Missing causal carry:
   vectors 1 through 4 saw `materializedFileCount: 0` and did not receive the
   prior stage artifact content needed for the next edge. The test design did
   not inspect the source; the test source did not inspect the test design; the
   execution plan did not inspect the test source. The traversal was real, but
   the prompt did not strongly carry staged causality.

This is not an odd_glc-only problem. It is the symptom of a GTL/ABG gap:
products are still hand-building prompt strings where ABG instruction assembly
law should derive the lawful current edge envelope from admitted GTL/ABG
carriers.

## Existing Law Is Close But Not Complete

The current constitutional surface already points toward the right split:

- GTL owns prompt construction and typed asset surfaces.
- `AssetSurface` declares renderer refs, authority slots, output-contract refs,
  proof-obligation refs, section/clause refs, and required contexts.
- ABG bind-time prompt and manifest surfaces must preserve target and
  environment asset-surface truth.
- ABG must not infer traversal, closure, scope identity, or product topology
  from prompt prose.
- Downstream products must not create second contract-law surfaces in prompt
  wrappers or local parsers.

That is necessary but insufficient.

The current law treats prompt-like assets as typed views and validates their
metadata shape. It already owns many fields that a naive new
`InstructionComposition` carrier might try to redeclare. The gap is narrower:
edge-local F_D assembly law that selects the minimal relevant carrier slice,
renders it proportionally, records what was included or omitted, and proves the
response is admissible against the target node type and output carrier.

In short:

```text
Existing GTL/ABG carriers already hold most instruction facts.
Instruction algebra must say how the current edge assembles those facts without
duplicating them.
```

## Field-Cut Decision

The deliverable should not mint a broad prompt carrier that shadows existing
GTL carriers.

| Candidate field | Existing source | Decision |
| --- | --- | --- |
| `sourceNodeTypeRefs` / `targetNodeTypeRefs` | `GraphVector` source/target nodes with `Node.typeRef` | Cut. Derive from selected edge. |
| `responseContractRef` | `AssetSurface.outputContractRefs` | Cut. Derive from target asset surface. |
| `proofObligationRefs` | `AssetSurface.proofObligationRefs` | Cut. Derive from source/target asset surfaces. |
| `authoritySlots` | `AssetSurface.authoritySlots` plus compute notation | Cut. Derive. |
| `rendererRefs` | `AssetSurface.rendererRefs` | Cut as a new declaration field. Renderer execution still needs ABG-owned binding. |
| `activeRegime` | compute notation / selected `F_D`, `F_P`, `F_H` composition | Cut. Derive. |
| `requiredCarrierClasses` | graph function, vector, node type, asset surface, payload/evidence, policy refs | Derive. It is the computed carrier aggregate, not new source truth. |
| `appliesToGraphFunctionRefs` / `appliesToVectorRefs` | no single current edge-binding surface for assembly rules | Keep. This is new binding law. |
| `sectionRules` | not currently expressed as edge-local assembly law | Keep. |
| `relevanceRules` | not currently expressed as edge-local assembly law | Keep. |
| `compressionPolicyRef` | not currently expressed as edge-local assembly law | Keep. |
| `proportionalityPolicyRef` | not currently expressed as edge-local assembly law | Keep. |

So the new law is not "declare every prompt fact again." The new law is:

```text
edge binding + section rules + relevance rules + compression policy +
proportionality policy
```

Everything else should be derived from existing GTL/ABG carriers.

## Term Disambiguation

The following names are candidate strategy vocabulary, not ratified carrier
names.

| Term | Meaning | Owner |
| --- | --- | --- |
| `InstructionAssemblyRule` | Narrow assembly rule bound to graph-function/vector refs. It declares section rules, relevance rules, compression policy, and proportionality policy. It does not redeclare node types, response contracts, proof refs, authority slots, or renderer refs. | ABG rendering law over GTL carriers, with product policy refs where needed |
| `CompiledPromptPlan` | Startup-admitted compiler output that proves one assembly rule is complete, relevant, proportional, type-covered, authority-safe, and derivable from existing GTL/ABG carriers. | semantic compiler output, admitted by ABG |
| `RuntimeBindingSlot` | Declared placeholder for live ABG refs such as graph call, frame, vector, evidence ledger, payload, residual, continuation, or worker invocation identity. | assembly law declares slot class; ABG binds values |
| `InstructionEnvelope` | Runtime packet for one dispatch, produced by binding live ABG refs into an admitted compiled plan. It may render to text, JSON, tool calls, or another transport-specific shape. | ABG |
| `Prompt` | Textual rendering of an instruction envelope for an LLM worker. It is a view, not authority. | ABG rendering over admitted plan |
| `PromptManifest` | Replay-visible record of source carrier refs, bound runtime refs, included refs, omitted refs, digests, section identities, and renderer identity used to create the prompt. | ABG |
| `PromptDigest` | Digest of the rendered prompt or normalized envelope. Useful for audit and replay; not proof of correctness by itself. | ABG |
| `ResponseContract` | GTL-declared output carrier shape required from the worker. | GTL |
| `ResponseAdmission` | ABG parsing, validation, evidence binding, and event emission over the worker result. | ABG |
| `ProductTaskOverlay` | Domain-owned values that fill lawful instruction slots without owning traversal or prompt grammar. | downstream product |
| `PolicyOverlay` | Domain-owned F_P/F_H rubrics, risk appetite, escalation thresholds, or reviewer stance carried as data/policy refs. | downstream product, admitted by ABG |

The important boundary is:

```text
Existing GTL carriers declare graph, vector, node type, asset surface,
response, authority, and policy truth.
ABG rendering law and admitted policy refs declare how the current edge
assembles those carriers.
ABG admits compiled prompt plans, binds live runtime refs, renders, dispatches,
observes, admits, and projects.
Products provide domain values and policy overlays.
Plugins invoke workers over immutable envelopes.
```

## Carrier Aggregate

The instruction envelope should be the aggregate of these carrier families.

| Category | Source truth | Prompt role | Owner |
| --- | --- | --- | --- |
| Graph-function contract | Published `GraphFunction` or selected registry entry | Names the reusable program being traversed. | GTL, selected by ABG |
| Graph-vector contract | Selected internal vector and source/target endpoints | Defines the current edge. | GTL, advanced by ABG |
| Source node type | `Node.typeRef`, schema, markov, asset surface, contexts | Defines what the worker is transforming or judging from. | GTL |
| Target node type | `Node.typeRef`, schema, markov, asset surface, output contracts | Defines what the worker must produce. | GTL |
| Type composition | composed/subtype obligations | Carries inherited or strengthened obligations. | GTL |
| Authority regime | selected `F_D` / `F_P` / `F_H` composition and role binding | Defines what the worker may judge, propose, or never claim. | GTL + ABG |
| Runtime facts | frame, graph call, vector, event, evidence, replay refs | Provides current traversal truth. | ABG |
| Prior artifacts | admitted payloads, materialized files, result refs, digests | Provides causal stage carry. | ABG |
| Residual/pressure | admitted residuals, gaps, continuation/re-entry refs | Explains unresolved pressure when relevant. | ABG |
| Product vocabulary | lifecycle stage names, domain names, user-facing terms | Makes the task meaningful to the product. | downstream product |
| Product task overlay | stage-specific work instructions and allowable artifacts | Fills domain content into GTL slots. | downstream product |
| Product policy overlay | rubrics, risk, escalation, acceptance interpretation | Configures F_P/F_H judgment without owning closure. | downstream product |
| Response contract | JSON schema or carrier contract for the worker response | Makes the output admissible. | GTL |
| Transport binding | worker identity, command, timeout, environment, capture policy | Delivers the envelope without owning semantics. | ABG |

If a prompt sentence cannot be traced to one of these families or to renderer
grammar, it is suspect.

## Node Typing Is Central

Node typing should drive the instruction. It should not appear as a generic
label list for the worker to echo back.

For a vector `A -> B`, the envelope must answer:

- What is the source node type `A`?
- What source asset surface and required contexts are already admitted?
- What target node type `B` must be produced or judged?
- What output contract, proof obligations, and authority slots attach to `B`?
- Are there composed or subtype obligations that preserve or strengthen base
  type obligations?
- What previous artifacts or evidence satisfy the source side?
- What target obligations remain unsatisfied before dispatch?
- What exact response shape lets ABG admit, bind, and prove the result?

The worker should not receive all product node refs equally. It should receive
the effective source and target obligations for the current edge and any
contextually required inherited obligations.

Example:

```text
Vector:
  test_design_surface -> test_source_surface

Relevant:
  source type: test design document
  target type: executable test source
  prior artifact: test design content and digest
  target output: test file path, content, dependency constraints

Irrelevant:
  package creation instructions
  source implementation instructions
  execution result instructions
  generic lifecycle node labels not active on this edge
```

## Compression

Compression is lawful omission, not vague summarization.

The renderer should reduce the carrier aggregate to the minimal sufficient
slice for the current edge. Each omitted carrier should be either irrelevant by
declared rule, available by reference only, or explicitly recorded as an
unanswered gap.

Compression dimensions:

| Dimension | Compression rule |
| --- | --- |
| Authority compression | Include only the active authority regime and prohibitions needed for this dispatch. Do not restate the full governance universe. |
| Type compression | Include the effective source and target node-type obligations. Do not list every product node type. |
| Evidence compression | Include prior artifacts by digest, role, path, and focused excerpt when content is required. Keep non-critical evidence as refs. |
| Task compression | Include only the current edge's allowed actions and output paths. Do not repeat future-stage instructions. |
| Response compression | Require the smallest output carrier that ABG can parse and admit. Do not ask for narrative self-assessment unless it is a declared response field. |
| History compression | Include causally required prior stage outputs. Omit unrelated chronology. |
| Policy compression | Include active rubric/policy refs and the concrete decision points they govern. Keep inactive policy as refs. |
| Error compression | Include only current blockers, residuals, or retry causes relevant to this edge. |

Compression should be machine-checkable. A prompt section should have an
explicit dependency on source type, target type, evidence, authority, policy, or
response contract. A section with no dependency is drift.

Compression is therefore an F_D assembly decision. It is not an F_P judgment.
The compiler may use F_P to draft candidate product wording or review whether
human-authored policy text is understandable, but the include/omit decision for
a carrier must be deterministically provable from declared dependencies. If an
LLM decides which carriers are relevant for the LLM prompt, minimality cannot be
proved.

## Relevance

Relevance is the edge-local relation between a carrier and the decision being
asked of the worker.

Candidate relevance classes:

| Class | Include form | Meaning |
| --- | --- | --- |
| `edge_critical` | full section or full normalized value | Without it, the worker cannot perform the current edge. |
| `type_critical` | effective source/target obligations | Without it, the worker cannot satisfy typed output. |
| `evidence_critical` | digest + focused content/excerpt | Prior artifact content must causally shape the output. |
| `policy_critical` | active rule text or resolved policy ref | The worker is making a bounded F_P/F_H judgment under that policy. |
| `authority_critical` | active permissions/prohibitions | The worker might otherwise claim runtime authority it does not have. |
| `diagnostic_only` | ref + one-line summary | Useful for audit, not needed for the decision. |
| `ref_only` | stable ref/digest | Available for provenance, not required in rendered text. |
| `forbidden` | omitted and recorded as forbidden | Would create confusion, authority leak, or future-stage bleed. |
| `gap` | named missing-input gap | Required by law but unavailable; dispatch should block or explicitly defer. |

The odd_glc framework-smoke prompt failed this relevance test: future-stage
file instructions were rendered into current-stage prompts, while prior-stage
artifact content that was evidence-critical was absent.

Relevance is also F_D. A carrier is included when the selected graph function,
selected vector, source/target node type, asset surface, policy ref, response
contract, or runtime binding slot declares a dependency on it. Otherwise it is
ref-only, diagnostic-only, forbidden, or a gap. F_P does not arbitrate
relevance.

## Proportionality

Proportionality controls prompt weight relative to edge complexity and risk.
It prevents both underprompting and overprompting.

Candidate levels:

| Level | Use | Envelope shape |
| --- | --- | --- |
| `P0 deterministic` | F_D-only checks, schema, digests, known command result | No LLM prompt and no F_P dispatch. ABG performs deterministic validation. |
| `P1 narrow judgment` | One bounded F_P classification or small transform | Source/target type, one evidence slice, one response contract. |
| `P2 typed artifact generation` | Produce one artifact from admitted source evidence | Current edge only, target obligations, prior artifact excerpt, strict output. |
| `P3 staged causal chain` | Multi-vector artifact construction where each output feeds the next | Current edge plus carried prior-stage artifacts and lineage summary. |
| `P4 high-risk or recursive` | Re-entry, non-closed residual, executive pressure, recursion, release-risk interpretation | Full authority regime, pressure refs, policy refs, typed gaps, escalation options, strict admission contract. |

The framework-smoke software-build traversal is at least `P3`. It has multiple
causal vectors. Treating each prompt as an isolated `P1` task produced a weak
proof even though the traversal events were real.

Proportionality is not about making prompts long. It is about matching prompt
content to the edge's legal and causal burden.

`P0` is a first-class outcome, not a small prompt. If the edge can close through
deterministic schema, digest, command-result, or replay checks, ABG should not
dispatch an F_P worker at all. Proportionality is both a correctness rule and a
cost rule.

## Assurance

Instruction assurance proves the prompt envelope was lawful before worker
dispatch and that the response can be admitted after worker return.

Required assurance questions:

1. Source trace:
   does every rendered prompt section trace to a GTL declaration, ABG event,
   admitted payload/evidence ref, product overlay ref, or renderer grammar?

2. Coverage:
   are all target node-type obligations represented either in the prompt, in an
   attached manifest, or as a named blocking gap?

3. Minimality:
   are all included sections relevant to the current edge under declared
   relevance rules?

4. Causality:
   are prior artifacts required by the source node type or vector contract
   included by digest and content/excerpt where needed?

5. Authority:
   does the envelope exclude runtime authority verbs the worker does not own,
   such as emit, admit, mint, select, open, close, route, or supervise?

6. Output admissibility:
   does the required response shape match a GTL response contract that ABG can
   parse, validate, and admit?

7. Replay:
   can the prompt manifest be replayed from the event log and admitted
   declarations to reproduce the same rendered digest?

8. Negative proof:
   do tests fail when the prompt omits required prior evidence, includes
   future-stage boilerplate, includes forbidden authority, or asks for output
   outside the target type?

9. Non-tautology:
   does the prompt avoid carrying the answer as an instruction or marker? The
   response must be caused by the worker's bounded construction or judgment,
   not by a prefilled conclusion.

10. Proportionality:
    does the envelope match the declared proportionality level for the edge?

These are not style checks. They are algebraic checks over the carrier
aggregate.

Non-tautology should be treated as a lead gate, not a minor check. The proof
must show that the worker's output was caused by bounded construction or
judgment, not transcription of a classifier, expected answer, or prompt-carried
marker. A future realization should include a differential mutation: inject the
expected answer or classifying marker into the generated envelope and prove the
assurance gate fails. That turns the review rule used throughout this work into
machine-checked law.

## Proposed Architecture

The clean solution has four layers, not one runtime prompt factory and not one
fat new prompt carrier.

### 1. Existing GTL Source Carriers

Most instruction facts already have a lawful home:

- selected `GraphFunction`;
- selected `GraphVector`;
- source and target `Node.typeRef`;
- source and target `AssetSurface`;
- `AssetSurface.outputContractRefs`;
- `AssetSurface.proofObligationRefs`;
- `AssetSurface.authoritySlots`;
- `AssetSurface.rendererRefs`;
- compute notation / selected `F_D`, `F_P`, `F_H` composition;
- product policy overlays admitted through existing policy surfaces.

The new work must not redeclare those facts. It should declare how the current
edge assembles them.

Candidate narrow assembly rule:

```text
InstructionAssemblyRule {
  id
  appliesToGraphFunctionRefs
  appliesToVectorRefs
  sectionRules
  relevanceRules
  compressionPolicyRef
  proportionalityPolicyRef
  runtimeBindingSlots
}
```

This rule is stable assembly law over existing carriers. It does not execute
the worker, select graph functions, emit runtime events, inspect live ledgers,
or redefine node type, asset surface, response, authority, proof, or renderer
truth.

### 2. Semantic Compiler / F_P-Assisted Construction

The semantic compiler should turn existing GTL declarations, the narrow
assembly rule, and product overlays into a compiled prompt plan. It may use
F_P traversal to draft or review product-language content, but F_D owns the
assembly proof.

Compile-time F_P may answer questions such as:

- is product task wording understandable for the selected vector?
- does the human-authored rubric appear ambiguous?
- does a proposed domain policy overlay carry enough domain context?
- is the product task overlay specific enough to be validated by F_D rules?

F_D compiler checks must answer:

- are the source and target node-type obligations derived from the selected
  vector?
- are output contracts, proof obligations, authority slots, renderer refs, and
  active regime derived from existing carriers rather than redeclared?
- are the section rules complete and non-duplicative?
- does each prompt section have a lawful source carrier dependency?
- are future-stage or irrelevant sections excluded?
- is the proportionality level mechanically justified for the edge?
- does the response contract give ABG enough structure to admit the result?
- are authority prohibitions explicit and not hidden in prose?

Compile-time F_P may not:

- assert runtime truth;
- select the graph function for a live traversal;
- admit evidence or payloads;
- decide closure;
- substitute for ABG replay or ledgers.

Candidate compiler output:

```text
CompiledPromptPlan {
  planRef
  instructionAssemblyRuleRef
  graphFunctionRefs
  vectorRefs
  derivedNodeTypeCoverage
  derivedAssetSurfaceCoverage
  derivedResponseContractRefs
  sectionPlan
  relevanceProof
  compressionProof
  proportionalityLevel
  authorityProof
  runtimeBindingSlotManifest
  rendererExecutionBinding
  compilerEvidenceRefs
  digest
}
```

The compiler output is the stable artifact that should be admitted at startup.
This is where compression, relevance, proportionality, type coverage, and
authority safety are assured before runtime.

### 3. ABG Startup Admission

ABG startup should consume product GTL declarations, product registry/library
entries, graph overlays, node types, policy overlays, assembly rules, and
compiled prompt plans through the canonical startup path.

The startup task is to admit the compiled surface, not to invent it.

Candidate startup checks:

- the compiled plan digest matches the declared GTL source and assembly rule;
- every graph function and vector ref exists in the admitted registry/module
  surface;
- every node type ref resolves and is non-callable where required;
- every runtime binding slot is a known ABG slot class;
- every response contract is derived from `AssetSurface.outputContractRefs` and
  parseable by ABG admission;
- product overlays fill only declared product-owned slots;
- renderer execution is ABG-owned or delegated only to an authority-denied
  governed renderer plugin over an immutable envelope;
- no GTL declaration imports ABG runtime modules;
- no product-local shell claims prompt rendering or invocation authority.

Candidate startup event/projection families:

```text
instruction_plan_admitted
instruction_plan_rejected
instruction_plan_registry_projection
instruction_plan_startup_binding_projected
```

Names are illustrative. The key is that admitted plans become startup truth
available to traversal without letting products inject a second prompt system.

### 4. ABG Runtime Binding

At traversal time ABG should bind live values into the admitted plan. Runtime
does not decide the instruction algebra. It fills declared slots with current
truth.

Runtime-bound values include:

- graph call ref;
- frame ref;
- graph function ref;
- vector ref and vector index;
- source and target node refs;
- selected F_D/F_P/F_H composition ref;
- current evidence ledger refs;
- prior payload refs and digests;
- materialized artifact refs and approved excerpts;
- residual, continuation, and re-entry refs when relevant;
- current policy/admission state;
- worker invocation identity;
- event/log refs.

Candidate runtime output:

```text
InstructionEnvelope {
  envelopeRef
  compiledPlanRef
  graphCallRef
  frameRef
  vectorRef
  boundRuntimeRefs
  includedCarrierRefs
  omittedCarrierRefs
  gapRefs
  renderedPromptDigest
  responseContractRef
}
```

Candidate runtime events/projections:

```text
instruction_envelope_bound
instruction_prompt_rendered
instruction_dispatch_requested
instruction_response_observed
instruction_response_admitted
instruction_response_rejected
instruction_manifest_projected
```

The rendered prompt is now a view over `InstructionEnvelope`. The durable truth
is the compiled plan plus runtime-bound refs plus ABG response admission.

## Layered Assurance

The assurance split should be explicit.

| Layer | Question | Proof owner |
| --- | --- | --- |
| Existing GTL source | Are graph, vector, node type, asset surface, response, proof, authority, renderer, and compute-regime facts already present in their proper carriers? | GTL requirements/compiler |
| Assembly rule | Does the rule only bind graph-function/vector refs plus section, relevance, compression, and proportionality rules? | ABG rendering law + admitted policy refs |
| Semantic compiler | Is the plan complete, relevant, compressed, proportional, type-covered, authority-safe, and derived rather than redeclared? | F_D compiler proof; optional F_P review is evidence only |
| ABG startup | Is the compiled plan admitted, digest-pinned, registry-visible, and valid for this product graph? | ABG startup/admission |
| ABG runtime binding | Are live refs real, current, admitted, and sufficient for this edge? | ABG runtime |
| Worker dispatch | Did the plugin receive only the immutable envelope/prompt and transport config? | ABG transport/plugin proof |
| Response admission | Did the worker output satisfy the response carrier and evidence obligations? | ABG admission/projection |
| Product interpretation | Does the downstream product read admitted truth without creating a second truth surface? | product read-model proof |

This split is the key design point. It prevents three failures:

- a runtime prompt renderer inventing semantic meaning on the fly;
- a compile-time prompt artifact pretending to contain live ledger truth.
- a new instruction carrier shadowing node type, asset surface, response,
  proof, authority, renderer, or compute-regime truth that already has a home.

## Stable Versus Dynamic Content

Most instruction material is stable and should be compiled.

| Stable compiled content | Runtime-bound content |
| --- | --- |
| section grammar | graph call ref |
| relevance rules | frame ref |
| compression policy | vector ref and index |
| proportionality level | selected registry entry |
| source/target node-type obligation mapping | source/target node refs |
| composed/subtype obligation mapping | evidence ledger refs |
| authority prohibitions | payload refs and digests |
| response contract | materialized artifact refs |
| product stage vocabulary | residual and continuation refs |
| task overlay slot definitions | policy/admission current state |
| renderer ref | worker invocation identity |
| negative proof expectations | event/log refs |

Dynamic ledgers plug into declared runtime slots. They do not change the
assembly rule itself.

## Renderer Ownership

Renderer execution is a hard authority boundary.

`AssetSurface.rendererRefs` may name renderer contracts or templates, but a
product renderer must not become a product-local prompt shell. If product code
can execute the renderer and inject final text, then product code controls the
last semantic surface before F_P dispatch. That recreates the side-door prompt
authority this design is meant to remove.

The acceptable forms are:

- ABG-owned renderer execution over an admitted compiled prompt plan;
- a governed renderer plugin that receives an immutable envelope, has explicit
  authority-denial flags, and returns rendered bytes plus diagnostics only;
- product-supplied grammar/templates as admitted data, not executable authority.

The renderer may format and serialize. It may not select graph functions, omit
required sections, add hidden instructions, bind runtime refs, admit response
truth, or decide closure.

## Plugin Boundary

Plugins receive an immutable instruction envelope or rendered prompt. They do
not decide the envelope's legal content, select graph functions, emit runtime
events, admit payloads, or close traversal.

A plugin may:

- invoke a configured worker;
- pass the rendered prompt and attached files to transport;
- return raw response bytes, stdout/stderr, exit status, tool traces, and
  observed files to ABG;
- include transport diagnostics.

A plugin may not:

- add hidden authority instructions;
- omit required carrier sections;
- inject unadmitted policy;
- interpret the response as ABG truth;
- select the next graph function;
- turn tool success into closure.

If the worker uses internal tools, such as an advisor tool inside Claude, that
tool use is worker-internal unless ABG admits it as evidence or a payload. It
is not automatically ABG plugin behavior.

## Current Defect Pattern

The current product-local prompt pattern fails in two opposite ways:

1. Over-broad prompt:
   broad boilerplate tells the worker about future stages, all possible files,
   and generic node labels. This lowers relevance and confuses the worker.

2. Under-carried prompt:
   prior admitted artifacts are missing or only counted, so later stages cannot
   causally depend on earlier outputs.

That combination is dangerous. It makes the prompt both too large and too
weak.

The right compression is not shorter prose. The right compression is an
assured compiled plan whose runtime binding selects the minimal sufficient
carrier slice for the active edge.

## Candidate Compiled Plan Shape

A compiled prompt plan for one vector class should be shaped like this:

```text
1. Stable identity
   instructionAssemblyRuleRef
   compiledPlanRef
   graphFunctionRef
   vectorRef

2. Derived edge contract
   source node type obligations derived from selected vector
   target node type obligations derived from selected vector
   response contract refs derived from target AssetSurface
   proof obligation refs derived from source/target AssetSurface
   authority slots derived from AssetSurface and compute notation
   renderer refs derived from AssetSurface

3. Task slot model
   product stage label slot
   current edge objective slot
   allowed artifact role slots
   policy/rubric slots

4. Runtime binding slots
   graphCallRef
   frameRef
   vectorIndex
   priorArtifactRefs
   evidenceLedgerRefs
   residualRefs
   continuationRefs

5. Rendering rules
   section order
   F_D relevance inclusion rules
   compression limits
   excerpt policy
   diagnostic/ref-only policy
   proportionality level

6. Response contract
   exact machine-readable output carrier derived from GTL
   required fields
   admission rejection conditions
```

At runtime ABG binds the slots and renders a prompt. The prompt should look
simple because the algebra has already done the heavy work.

## Candidate Runtime Prompt Shape

A runtime prompt for one bound vector should include only the bound edge's
effective envelope:

```text
1. Dispatch identity
   graphCallRef
   frameRef
   graphFunctionRef
   vectorRef
   vectorIndex
   compiledPlanRef

2. Current edge
   sourceNodeRef
   sourceNodeTypeRef
   sourceAssetSurfaceRef
   targetNodeRef
   targetNodeTypeRef
   targetAssetSurfaceRef

3. Current task
   stage label
   edge objective
   allowed materialization targets
   forbidden actions

4. Prior evidence
   only refs/content required by this edge's source and target obligations
   digest, path, role, short excerpt or full content by compiled policy

5. Active policy
   only policy refs active for this edge
   escalation options if applicable

6. Authority boundary
   what the worker may propose
   what the worker may not claim

7. Response contract
   exact machine-readable output carrier
   required fields
   rejection conditions
```

Every section is generated by admitted plan plus runtime binding. No section is
a hand-maintained prompt paragraph that drifts from carriers.

## Successor Work

This should become an ABI/GTL ticket, not odd_glc-local refactoring.

Suggested work:

0. Causal-carry fix:
   ship a standalone ABG rendering-resolution fix that pulls admitted prior
   payload/evidence/artifact truth into the current prompt when the selected
   source or target node type requires it. This uses existing T-180 node types
   plus existing payload/evidence events. It should not wait for a new carrier
   or full registry integration.

1. Requirement reprice:
   define narrow instruction assembly law: edge binding plus F_D section,
   relevance, compression, and proportionality rules. Do not define a broad
   GTL prompt carrier that redeclares node type, asset surface, response,
   proof, authority, renderer, or compute-regime truth.

2. Design:
   produce an IACS and structural carrier diagram for
   `InstructionAssemblyRule`, `CompiledPromptPlan`, `RuntimeBindingSlot`,
   `InstructionEnvelope`, `PromptManifest`, governed renderer binding, and
   response admission.

3. Compiler:
   implement semantic compiler support for instruction assembly. F_D must own
   relevance, compression, proportionality, type coverage, and authority
   checks. F_P may propose or review product wording/rubric content, but its
   output is evidence only until F_D validates the plan.

4. Type integration:
   make node type obligations first-class inputs to the compiler. Source and
   target type contracts, composed type obligations, subtype strengthening,
   asset surfaces, proof obligations, and response contracts must drive prompt
   sections and response validation.

5. Startup admission:
   make ABG startup consume compiled prompt plans through the same
   canonical product GTL declaration/config path used for graph functions,
   overlays, node types, registry entries, and policy overlays.

6. Runtime binding:
   bind only declared runtime slots from replay-derived or admitted ABG truth.
   Missing required slots must block or emit typed gap truth before dispatch.

7. Registry integration:
   ensure runtime graph-function selection and compiled prompt-plan
   selection share the admitted startup and registry path. Products must not
   select prompt templates through local shells.

8. Compression and relevance proof:
   add differential tests where irrelevant future-stage instructions are
   rejected, missing prior evidence blocks or fails the prompt proof, and
   prompt sections must trace to source carriers.

9. Proportionality proof:
   prove P0/P1/P2/P3/P4 envelope shapes differ by declared edge burden, not by
   arbitrary prompt authoring. P0 must prove no F_P dispatch.

10. Live proof:
    rerun the odd_glc framework-smoke software-build traversal with prompts
    generated from compiled prompt plans. The test should prove
    that each vector receives only its current task, the required prior
    artifacts, and the effective source/target node type obligations.

11. Negative proof:
    mutate the compiled plan or runtime binding to add future-stage boilerplate,
    omit prior artifacts, include forbidden authority, loosen response schema,
    or bind unadmitted refs, and prove ABG rejects before or after dispatch as
    appropriate.

12. Non-tautology proof:
    mutate the generated envelope to include the expected answer or classifying
    marker and prove the proof fails. This is the differential guard against
    answer-carrying prompts.

13. Renderer ownership proof:
    prove renderer execution is ABG-owned or delegated only to an
    authority-denied governed renderer plugin, and that product templates are
    admitted data rather than executable prompt shells.

## Non-Goals

- No product-local prompt shell becomes authoritative.
- No runtime prompt factory invents instruction meaning not present in the
  admitted compiled plan.
- No prompt prose becomes a graph-function catalog, registry, closure ledger,
  or continuation controller.
- No product-local parser infers GTL or ABG law from rendered prompt text.
- No worker self-assessment becomes closure truth.
- No natural-language prompt section outranks typed node, asset-surface,
  evidence, policy, or runtime refs.
- No ABG-owned renderer decides product acceptance policy.
- No GTL declaration imports ABG runtime modules.
- No compiled plan carries live ledger truth as if it were static program law.

## Acceptance Sketch

A future ticket can close only if it proves these properties:

| Property | Proof shape |
| --- | --- |
| No duplicate carrier truth | The assembly rule does not redeclare source/target node types, response contracts, proof obligations, authority slots, renderer refs, or active regime. |
| Source trace | Every compiled plan section maps to an existing declared GTL/ABG source carrier class or admitted product policy ref. |
| F_D assembly | Relevance, compression, proportionality, type coverage, and authority coverage are proved deterministically. F_P output may be evidence, not authority. |
| Startup admission | ABG admits compiled plans by digest and rejects stale, partial, or unregistered plans. |
| Runtime binding | Every dynamic value in the envelope resolves from admitted or replay-derived ABG truth. |
| Edge relevance | Removing future-stage sections does not break the current edge; adding them is rejected or marked diagnostic-only. |
| Prior artifact causality | Later vectors include and depend on admitted prior artifact refs/content required by source/target obligations. |
| Node-type precision | Effective source/target node type obligations appear; unrelated node types do not. |
| Compression | Prompt manifest records included, omitted, ref-only, diagnostic, forbidden, and gap carriers. |
| Proportionality | Envelope size, section families, and dispatch/no-dispatch decision follow declared P-level, not ad hoc template size. |
| P0 no-dispatch | A deterministic edge closes through F_D without `fp_dispatch_requested`. |
| Authority boundary | Forbidden runtime authority verbs or claims fail proof or admission. |
| Renderer ownership | Renderer execution is ABG-owned or authority-denied plugin-owned over an immutable envelope; product templates are data. |
| Response contract | Worker output parses into a GTL response contract and fails closed otherwise. |
| Replay | Event log plus declarations can reproduce prompt manifest and digest. |
| Non-tautology | Prompt does not contain the expected answer or classifying marker as authority; injecting one causes proof failure. |

## Bottom Line

The prompt should become a runtime rendering of an admitted compiled
instruction plan, not a product-local template and not a runtime-invented
semantic program.

The stable facts remain in existing GTL carriers:

```text
GraphFunction + GraphVector + Node.typeRef + AssetSurface + compute notation
```

The new assembly surface is narrow:

```text
edge binding + section rules + relevance rules + compression policy +
proportionality policy -> CompiledPromptPlan
```

The live surface belongs to ABG:

```text
CompiledPromptPlan + runtime refs -> InstructionEnvelope -> response admission
```

The product supplies overlays and policy values. Plugins invoke workers. The
worker returns candidate output. ABG admits or rejects that output.

The current product-local template style can produce working live runs, but it
cannot reliably prove compression, relevance, proportionality, causality, or
authority. That is the same class of late-stage algebraic violation seen in
earlier route, registry, recursion, and executive-observer work: a correct
runtime substrate is weakened by an unratified side surface at the boundary
where a probabilistic worker is asked to act.

GTL/ABG needs instruction assembly law so F_P prompts are typed, compiled,
F_D-proved, startup-admitted, runtime-bound, replayable carrier aggregates.
The first shippable slice is causal carry over existing admitted payload and
evidence truth. The full assembly path follows with registry/startup selection
and renderer ownership closed.
