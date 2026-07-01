# M03 Instruction Assembly First-Slice IACS

**Ticket**: T-183
**Status**: Active design
**Date**: 2026-07-01
**Derived from**: [M03_INSTRUCTION_ASSEMBLY_DERIVATION.md](./M03_INSTRUCTION_ASSEMBLY_DERIVATION.md), [M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_FIRST_SLICE_IACS.md](./M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_FIRST_SLICE_IACS.md), [M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md](./M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md), [M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md](./M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md), [T-183](../../../../.ai-workspace/tickets/active/T-183-design-and-realize-abg-instruction-assembly-semantic-compiler.md)

## Purpose

Declare the irreducible carrier set for ABG instruction assembly. The first
slice compiles edge-bound prompt plans from existing GTL/ABG carriers, admits
the plan at startup, binds runtime refs into immutable envelopes, renders by an
ABG-owned renderer, and emits replayable prompt manifests.

This IACS prevents a second prompt shell. Product policy can configure section,
compression, proportionality, and wording rules as data, but product code cannot
own relevance, runtime binding, final rendering, worker dispatch, response
admission, closure, or replay truth.

## Irreducible Architectural Carrier Set

| Carrier family | Owner | Prime status | Admission/write path | Consumers |
| --- | --- | --- | --- | --- |
| `InstructionAssemblyRule` | ABG startup/design over GTL refs and admitted policy refs | Subordinate declaration | Consumed during canonical startup; never emitted as runtime truth by itself | semantic compiler |
| `CompiledPromptPlan` | ABG semantic compiler | Prime admitted startup projection | F_D compiler admits or rejects after total known-algebra checks and optional admitted F_P validation evidence | runtime binding, proof, replay |
| `RuntimeBindingSlot` | ABG instruction assembly | Subordinate row | Derived into `CompiledPromptPlan` from rules and existing carriers | runtime envelope materialization |
| `InstructionEnvelope` | ABG runtime | Prime runtime payload | ABG binds live refs from admitted/replay truth immediately before renderer/transport | governed renderer, transport |
| `PromptManifest` | ABG runtime/projection | Prime replay payload | ABG emits or projects manifest after rendering; replay reproduces digest | proof, audit, downstream read models |
| `PromptCompilerDiagnostic` | ABG semantic compiler | Subordinate row | Nested under accepted/rejected compiled-plan result | proof and negative diagnostics |
| `GovernedRendererBinding` | ABG instruction assembly | Subordinate policy binding | First slice uses ABG-owned renderer; delegated renderer binding remains subordinate until admitted plugin law needs promotion | renderer execution |
| `SemanticReviewGate` | existing ABG/GTL conformance | Reused subordinate evidence gate | Existing `semanticReviewGates` admission, not new truth | compiler evidence only |
| `PromptAssetRow` | existing ABG/GTL conformance | Reused subordinate prompt asset law | Existing `promptAssets` conformance, not new truth | field-cut derivation and prompt asset validation |

## Carrier Consolidation

`InstructionAssemblyRule` is subordinate because it binds edge scopes to policy
refs. It does not own node types, response contracts, proof obligations,
authority slots, renderer refs, active regimes, carrier classes, runtime refs,
or prompt text.

`CompiledPromptPlan` is prime because it is the first admitted ABG projection
that says a rule, carrier set, and policy set are dispatch-eligible. Runtime
shall not invent a plan after traversal starts.

`InstructionEnvelope` is prime because it is the immutable runtime payload over
which rendering and dispatch occur. It binds live refs but does not admit worker
response truth.

`PromptManifest` is prime because it is the replay surface for rendered prompt
identity: plan ref, envelope ref, renderer identity, included/omitted/gap
carrier decisions, prompt digest, and response contract.

`SemanticReviewGate` and `PromptAssetRow` are explicitly reused. T-183 shall not
mint replacements for them.

## Known Algebra Register

Every F_D compiler decision in this slice is allowed only when the listed
algebra is implemented as a total function over admitted inputs and typed
outputs.

| Algebra | Inputs | Output domain | Gap/rejection cases |
| --- | --- | --- | --- |
| field-cut validation | assembly rule, graph vector, node types, asset surfaces, compute notation | accepted or duplicate-carrier rejection | duplicate node type, response contract, authority slot, renderer ref, active regime, or carrier class |
| source trace | rule refs, graph function, vector, policy refs, registry startup truth | trace rows or missing-source gap | unknown graph function/vector/policy ref, stale startup digest |
| type coverage | source/target nodes, node-type satisfaction projection | satisfied/unsatisfied/gap | missing type ref, unsatisfied type obligation, unadmitted satisfaction |
| response-contract derivation | target node and `AssetSurface.outputContractRefs` | response contract set or gap | missing output contract, ambiguous multiple contracts without policy |
| authority/proof/renderer derivation | asset surfaces, compute notation, renderer refs | derived coverage rows or gap | missing proof obligation, forbidden authority slot, renderer authority violation |
| relevance | declared dependency graph, source/target carriers, prior admitted artifacts/evidence | include/ref-only/omit/gap/forbidden | required input missing, dependency absent, future-stage bleed |
| compression | admitted payload/evidence content, digest/excerpt policy | digest/ref/excerpt/full/gap | excerpt unavailable, full content not admitted, digest mismatch |
| proportionality | current edge regime, deterministic closure surfaces, policy refs | P0/P1/P2/P3 or gap | P0 with F_P dispatch requested, unknown policy, deterministic proof incomplete |
| non-tautology | compiled sections, expected response contract, classifier/disposition vocabulary | clean or answer-shaped rejection | expected answer, classifier, disposition marker, or hidden authority instruction present |
| runtime binding | compiled slots, replay events, admitted refs | bound envelope or rejection | unknown/stale/forged ref, missing required slot, digest mismatch |

No implementation may label a check `F_D` without mapping it to this register
or adding a ratified entry with carrier types, operators, predicates, ordering,
output domain, and typed gaps.

## Boundary Matrix

| Boundary | May do | Shall not do |
| --- | --- | --- |
| Product/GTL declarations | Declare graph functions, overlays, node types, asset surfaces, registry entries, and data-only policy refs | Emit plan truth, render final prompts, bind runtime refs, dispatch workers, admit responses |
| ABG startup | Consume product declarations and assembly rules through the canonical registry/startup path | Load prompt plans from file scans, local shells, or product registries |
| Semantic compiler F_D | Prove field cut, source trace, type coverage, relevance, compression, proportionality, non-tautology, and runtime slot legality as total functions | Make open-ended semantic judgments or trust F_P review as approval |
| F_P validation traversal | Review wording/rubric clarity and return admitted evidence | Decide relevance, compression, proportionality, plan approval, runtime truth, selection, admission, closure, or response truth |
| Runtime binding | Bind admitted/replay refs into immutable envelopes | Bind raw product refs, stale refs, hidden prompt text, or unregistered policy |
| Renderer | Render from immutable envelope under ABG-owned or authority-denied governed execution | Add hidden instructions, omit required sections, select graph functions, admit responses, or close traversal |
| Transport/worker | Execute F_P dispatch when proportionality permits | Treat transport success or worker self-report as closure |
| Prompt manifest replay | Reproduce digest and carrier decisions from admitted declarations and events | Invent prompt content or carrier inclusion decisions |

## First-Slice Proof Expectations

| Proof lane | Design source | Required assertion |
| --- | --- | --- |
| existing compiler reuse | this IACS and derivation | T-183 code adapts existing semantic-review/prompt-asset surfaces and does not define a second compiler or prompt asset carrier |
| field cut | known algebra register | duplicate carrier declarations are rejected before plan admission |
| F_D totality | requirement and known algebra register | every accepted compiler decision has an explicit output domain and typed rejection/gap case |
| F_P evidence-only | semantic review gate reuse | F_P review output cannot approve a plan unless F_D validates all obligations |
| startup admission | registry IACS | compiled plans enter through canonical ABG startup/registry admission |
| runtime binding | runtime binding algebra | forged, stale, unknown, or missing refs reject before renderer/dispatch |
| P0 no-dispatch | proportionality algebra | deterministic P0 edge emits no `fp_dispatch_requested` |
| prompt manifest replay | manifest carrier | replay reproduces prompt digest and included/omitted/gap decisions |
| non-tautology | non-tautology algebra | answer/classifier injection makes proof fail |
| response admission | transport and response contract | worker response is admitted against derived response contract before it can support closure |

## Non-Closure Conditions

- `InstructionAssemblyRule` redeclares node type, response contract, authority,
  renderer, active-regime, or carrier-class truth.
- F_D compiler checks are implemented without a named known algebra, total
  output domain, and typed rejection/gap cases.
- F_P review output approves a plan or determines relevance, compression,
  proportionality, runtime truth, response truth, or closure.
- Compiled prompt plans are loaded through a product-local shell, file scan, or
  side registry.
- Runtime binds refs that are not admitted or replay-derived.
- Renderer execution is owned by product code or can inject hidden instructions.
- Prompt manifests cannot be replayed to the rendered digest.
- P0 edges still dispatch F_P workers.
- Existing semantic review gates or prompt asset rows are forked into a second
  truth surface.

