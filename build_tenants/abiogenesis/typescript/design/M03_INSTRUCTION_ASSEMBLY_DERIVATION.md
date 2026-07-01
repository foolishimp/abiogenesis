# M03 Instruction Assembly Derivation

**Ticket**: T-183
**Status**: Active design
**Date**: 2026-07-01
**Change class**: requirement_reprice -> design_reframe

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`
- `specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`
- `specification/requirements/gtl/REQ-L-GTL3-NODE.md`
- `specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md`
- `specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md`
- `specification/requirements/abg/REQ-R-ABG3-BINDING.md`
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
- `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`
- `specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md`
- `.ai-workspace/tickets/active/T-183-design-and-realize-abg-instruction-assembly-semantic-compiler.md`

## Problem

T-182 proved the first causal-carry slice: ABG can bind admitted prior
artifact refs, digests, and bounded excerpts into the next F_P dispatch before
the worker runs.

That closes the immediate carry defect, but it does not yet make instruction
assembly lawful as a general capability. Product-local prompt builders can
still over-include context, omit relevant carrier truth, ask F_P to decide
relevance, carry answer-shaped markers, hide renderer authority, or duplicate
node/asset/authority truth inside prompt-specific structures.

## Decision

Instruction assembly is an ABG M03 runtime/design capability over existing
GTL/ABG carriers.

It is not a broad GTL prompt carrier. GTL already owns graph structure, node
types, asset surfaces, graph vectors, graph functions, compute notation, hooks,
and policy refs. ABG owns runtime binding, admission, projection, event truth,
transport, response admission, and replay.

`REQ-R-ABG3-INSTRUCTION-ASSEMBLY` is the requirement anchor for this design.
The design may refine how the TypeScript tenant realizes the law, but it shall
not weaken the dispatch-assurance obligations in that requirement.

The new assembly surface is narrow:

```text
InstructionAssemblyRule
  = appliesToGraphFunctionRefs
  + appliesToVectorRefs
  + sectionRules
  + relevanceRules
  + compressionPolicyRef
  + proportionalityPolicyRef
  + runtimeBindingSlotClasses
```

Every other fact must be derived from existing carriers or rejected as
duplicate authority.

## Field Cut

| Candidate field | Source truth | T-183 decision |
| --- | --- | --- |
| `sourceNodeTypeRefs` | `GraphVector.source.typeRef` and admitted node-type satisfaction | Cut from assembly rule. Derive. |
| `targetNodeTypeRefs` | `GraphVector.target.typeRef` and admitted node-type satisfaction | Cut from assembly rule. Derive. |
| `responseContractRef` | `GraphVector` target carrier contract and `AssetSurface.outputContractRefs` | Cut from assembly rule. Derive. |
| `proofObligationRefs` | `AssetSurface.proofObligationRefs` | Cut from assembly rule. Derive. |
| `authoritySlots` | `AssetSurface.authoritySlots` and selected composition authority placement | Cut from assembly rule. Derive. |
| `rendererRefs` | `AssetSurface.rendererRefs` | Cut from assembly rule. Derive. |
| `activeRegime` | selected `abg.fn_composition` and regime binding set | Cut from assembly rule. Derive. |
| `requiredCarrierClasses` | graph vector, node type, asset surface, payload ledger, requirement route, and selected composition | Cut as declaration. Compiler may project as a derived diagnostic. |
| `appliesToGraphFunctionRefs` | new rule binding | Keep. This binds the rule to a published function scope. |
| `appliesToVectorRefs` | new rule binding | Keep. This binds the rule to an edge scope. |
| `sectionRules` | new assembly policy | Keep. This controls prompt section structure without owning carrier truth. |
| `relevanceRules` | new assembly policy | Keep. F_D-resolved dependency law only. |
| `compressionPolicyRef` | new or existing policy ref | Keep. F_D validates compression against source trace. |
| `proportionalityPolicyRef` | new or existing policy ref | Keep. P0 can suppress F_P dispatch. |
| `runtimeBindingSlotClasses` | new assembly policy over existing runtime facts | Keep. Runtime slot classes name what ABG may bind later. |

## Owner Boundaries

| Surface | Owner | Rule |
| --- | --- | --- |
| Graph topology, node types, asset surfaces, graph functions, graph vectors | GTL | Declared and typechecked before ABG runtime use. |
| Instruction assembly rules | ABG design over GTL refs and policy refs | Narrow edge-bound rule surface, not duplicate carrier truth. |
| Semantic compiler | ABG F_D | Resolves existing carriers, validates rules, emits compiled plan diagnostics. |
| F_P compiler/review traversal | ABG admitted evidence only | May propose wording, clarity, or policy critique; cannot own relevance, compression, closure, or admission. |
| Compiled prompt plan | ABG startup admission/projection | Digest-pinned plan over existing carrier truth plus narrow rule refs. |
| Runtime binding slots | ABG runtime | Bind only admitted or replay-derived refs at dispatch time. |
| Renderer execution | ABG or authority-denied governed renderer plugin | Product templates are data. Product code cannot own final prompt text. |
| F_P worker response | ABG transport and response admission | Worker output is candidate evidence until admitted against response contract. |

## Compiler Responsibilities

The semantic compiler is deterministic. It shall prove:

1. source trace from rule refs to graph function, vector, node, asset surface,
   selected composition, and policy refs;
2. type coverage over source and target `Node.typeRef`;
3. response contract derivation from target carrier and asset-surface truth;
4. proof obligation, authority slot, renderer, and regime derivation;
5. relevance: every included section has a dependency edge to the current
   vector, and every required dependency is included or recorded as a named
   gap;
6. compression: included material is represented by digest/ref/excerpt/full
   policy according to declared policy and available admitted truth;
7. proportionality: P0 deterministic edges do not render or dispatch F_P;
8. no future-stage bleed;
9. no duplicate carrier declaration;
10. no answer-shaped or classifier-shaped prompt content;
11. runtime slot classes are bindable only from admitted or replay-derived
    ABG truth;
12. renderer refs resolve to ABG-owned or authority-denied governed rendering.

## Runtime Shape

```text
GTL graph/module/product declarations
  -> canonical ABG startup consumes library, overlay, node-type, policy, and assembly declarations
  -> ABG admits registry/startup truth
  -> semantic compiler resolves existing carrier truth
  -> ABG admits CompiledPromptPlan at startup
  -> ABG start/iterate selects graph function and vector
  -> ABG derives runtime binding slots from replay truth
  -> ABG materializes immutable InstructionEnvelope
  -> governed renderer produces prompt bytes and PromptManifest
  -> F_P dispatch occurs only when proportionality is not P0
  -> ABG admits or rejects response against derived response contract
```

Instruction assembly, renderer, prompt policy, runtime binding policy, and
compiled prompt plan selection use the same admitted registry/startup truth as
graph-function selection. There is no product-local prompt-loader, file scan,
local registry, or parallel selection path.

## Candidate Design Surfaces

| Candidate | Prime status | Rationale |
| --- | --- | --- |
| `InstructionAssemblyRule` | Candidate subordinate declaration | Needed to bind section/relevance/compression/proportionality policy to edge scopes. It must not redeclare carrier truth. |
| `CompiledPromptPlan` | Candidate admitted startup projection | Needed to pin compiler output and avoid runtime prompt invention. |
| `RuntimeBindingSlot` | Candidate subordinate row | Needed to specify which live refs may be bound at dispatch. |
| `InstructionEnvelope` | Candidate runtime attempt payload | Needed as immutable pre-render input to renderer/transport. |
| `PromptManifest` | Candidate replay projection/event payload | Needed to replay rendered prompt digest and included/omitted carrier decisions. |
| `GovernedRendererBinding` | Candidate policy binding | Needed only if existing renderer refs do not already carry enough authority-denied execution law. |

These names are design candidates. The IACS must prove whether each is prime,
subordinate, or reducible to an existing carrier before realization.

## Renderer Boundary

Renderer execution is part of ABG instruction assembly. A product may supply
templates, grammar refs, rubrics, or style policy as admitted data. It may not
execute final rendering, bind runtime refs, add hidden instructions, omit
required sections, select graph functions, admit response truth, or close
traversal.

If renderer execution is delegated, the delegated renderer is a governed
authority-denied plugin over an immutable envelope. Its output is admitted or
rejected by ABG before transport.

## P0 No-Dispatch Rule

Proportionality is not only a prompt-size policy. It is a dispatch decision.

When the compiler and runtime can close an edge through deterministic truth,
such as schema, digest, replay, command result, known carrier identity, or
admitted proof rows, the edge is P0. P0 edges shall not emit
`fp_dispatch_requested` and shall not invoke an F_P worker.

## Non-Tautology Gate

The prompt manifest must be differentially tested. If the compiled envelope is
mutated to carry the expected answer, selected classifier, disposition marker,
or equivalent answer-shaped instruction, the proof must fail. This gate
institutionalizes the failures previously caught by review in answer-carrying
fixtures and marker-driven dispositions.

## Module Lifecycle Checklist

| Phase | T-183 answer |
| --- | --- |
| intent | Answer: make F_P instruction construction typed, relevant, compressed, proportional, replayable, and non-tautological without product-local prompt shells. |
| requirement | Answer: `REQ-R-ABG3-INSTRUCTION-ASSEMBLY` is the constitutional anchor. This design refines the TypeScript HOW after that requirement reprice. |
| build | Answer: TypeScript M03 design and realization are the first build tenant. No code starts before IACS and structural carrier diagram resolve prime/subordinate status. |
| assurance | Answer: `test:t183`, `test:semantic`, negative differential tests, prompt-manifest replay, and `test:t183:live`. |
| release | Answer: release eligibility requires T-183 closure plus the existing TS release gate. No RC may claim instruction assembly readiness from T-182 alone. |
| deployment | Answer: compiled prompt plans are admitted through canonical ABG startup, alongside product GTL declarations and registry config. |
| live usage | Answer: `runEngineStart` and iterate consume admitted compiled plans; runtime binds envelopes and dispatches only through ABG transport. |
| observed telemetry | Answer: prompt manifests, response admission/rejection, renderer diagnostics, P0 no-dispatch rows, and non-tautology failures are replay-visible. |
| retirement | Gap: prompt-plan supersession/retirement event semantics are not yet ratified. The first implementation may reject stale digests, but lifecycle retirement law must be resolved before long-lived plan registries are claimed. |

## Open Design Gaps

1. Carrier status: prove which candidate surfaces are prime, subordinate, or
   reducible.
2. Renderer execution: decide whether the first slice uses an ABG-owned
   renderer only or admits an authority-denied governed renderer plugin.
3. Prompt-plan retirement: define supersession/retirement semantics before
   claiming long-lived prompt-plan registry behavior.
4. Full-content body storage: T-182 supports bounded excerpts; full-content
   rendering requires a storage/admission policy before use.

## Immediate Next Work

1. Create the T-183 IACS.
2. Create the T-183 structural carrier diagram.
3. Then implement only the smallest compiler slice that can prove the field cut
   and prompt-manifest replay.
