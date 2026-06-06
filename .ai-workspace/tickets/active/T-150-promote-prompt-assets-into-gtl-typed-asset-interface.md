---
id: T-150
title: Promote prompt assets into the GTL typed asset interface
type: feature
ticket_category: ordinary
status: active
proof_status: gtl_scope_closure_ready_downstream_steel_thread_pending
goal: move the prompt-as-code contract proven in odd_sdlc T-191 into GTL as a first-class typed asset interface, so downstream products declare prompt invocation assets through GTL AssetSurface truth instead of local prompt registries
change_class: requirement_reprice
change_intent: Promote the prompt-as-code asset shape proven in odd_sdlc T-191 into GTL as generic typed asset interface law, while keeping downstream prompt authority values and runtime enforcement outside GTL.
re_entry_point: requirements
created_at: 2026-06-06
updated_at: 2026-06-06
triaged_at: 2026-06-06
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
source_documents:
  - /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-NODE.md
  - specification/requirements/gtl/REQ-L-GTL3-INTERFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/carriers.ts
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/backlog/T-191-establish-typed-prompt-contract-model.md
related_tickets:
  - T-107
  - T-116
  - T-127
  - T-128
  - T-143
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/backlog/T-191-establish-typed-prompt-contract-model.md
affected_boundary:
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-NODE.md
    - specification/requirements/gtl/REQ-L-GTL3-INTERFACE.md
    - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
    - new_or_existing: specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  design:
    - build_tenants/abiogenesis/typescript/design/GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md
    - build_tenants/abiogenesis/typescript/design/GTL_3_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/GTL_3_INTERFACE_CONTRACTS.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/carriers.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/constructors.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/admission/carriers.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/carriers.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/constructors.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/admission/carriers.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/serialization/carriers.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/index.ts
  downstream_proving_domain:
    - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/prompt_assets.ts
    - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/plugins/evaluate/prompts.ts
    - /Users/jim/src/apps/odd_sdlc/build_tenants/typescript/code/src/operator/plugins/transform/launch_contract.ts
requirement_home: specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
target_truth: GTL AssetSurface is rich enough to declare prompt invocation assets, prompt sections/clauses, constructor bindings, renderer bindings, proof obligations, and generic authority-slot shape as typed asset interface truth. GTL owns opaque authority-kind-ref slots, disposition labels such as normal/bounded_fallback/forbidden_routine, and fallback precondition refs. Downstream SDLC prompt assets provide product-local authority vocabulary and assignment policy over that shape. Rendered prompt text is always a view over typed asset truth.
superseded_truth: Downstream products create local prompt asset registers because GTL AssetSurface only carries kind, requiredContexts, standardsRefs, and outputContractRefs. Prompt line provenance, authority slot shape, fallback preconditions, renderer identity, and clause intent are encoded in product-local code rather than in the GTL typed asset interface.
closure_law: This ticket closes only when GTL requirements and design define a full typed asset interface for renderer-backed prompt assets, the TypeScript GTL carriers/admission/serialization expose that interface without creating a new topology object, focused tests prove prompt asset declarations round-trip through GTL publication/admission and chain composition, GTL admission validates declaration shape rather than product authority policy values, and one odd_sdlc prompt family is re-pointed as a downstream steel thread consuming GTL prompt asset surfaces rather than owning the prompt asset ontology.
non_closure_conditions:
  - prompt asset support is added as a second topology object beside Node, GraphVector, GraphFunction, Job, or Module
  - GTL imports odd_sdlc, data_mapper, product-specific prompt vocabulary, or SDLC-only clause names as language law
  - ABG runtime or F_D code infers prompt semantics from rendered Markdown
  - rendered prompt text becomes authority instead of a view over typed asset truth
  - authority compression, fallback policy, clause intent, renderer identity, or proof obligation remains only in downstream prompt code
  - GTL carriers bake in downstream authority-kind values such as bootstrap, intent, runtime forensics, or sibling workspace history
  - GTL admission enforces concrete downstream authority-policy values instead of only validating declaration shape and fallback-precondition presence
  - downstream products must maintain a parallel prompt registry after the GTL typed asset interface exists
  - compatibility wrappers preserve two prompt asset truth surfaces instead of migrating callers to the GTL interface
review_gate: implementation review required before release
---

# T-150: Promote Prompt Assets Into The GTL Typed Asset Interface

## Intake Triage

Smallest lawful re-entry point: `requirement_reprice`.

Reason: odd_sdlc T-191 proved the immediate prompt-control need, but its SDLC
register is a downstream prototype. The durable home is GTL: prompts are
renderer-backed typed assets produced from declared authority, contexts,
constructors, policy refs, and proof obligations. If GTL does not carry that
interface, each downstream ODD product will keep rebuilding its own prompt
asset registry and the system will drift back into a zoo of local prompt
types.

This is not an ABG runtime decision and not F_D semantic evaluation. GTL
declares the typed asset interface. ABG and downstream runtimes may admit,
project, render, and replay those declarations. F_P still owns semantic
construction or evaluation judgment.

## Target Model

Extend the GTL typed asset surface, without adding a new topology prime, so a
Node or GraphFunction/GraphVector output can declare a renderer-backed prompt
asset with these subordinate contracts:

- asset kind and schema ref
- required contexts and installed standards or compression refs
- constructor refs and input asset kinds
- renderer refs and rendered-view digest policy
- section/part kinds for rendered assets
- clause/fragment kinds for rendered assets
- opaque authority-kind refs grouped into normal, bounded fallback, and
  forbidden routine slots
- fallback precondition refs
- proof obligation refs
- output contract refs

The primitive remains `AssetSurface`. Prompt assets are one declared asset
surface shape, not a new GTL public work carrier.

## Boundary Rules

- GTL declares prompt asset interface truth.
- GTL admission validates declaration shape: slot disposition labels,
  fallback-precondition presence, refs, constructor refs, renderer refs, and
  proof refs.
- ABG interprets declarations, admits payloads/events, projects replay truth,
  and enforces runtime authority use through assurance/policy contracts.
- Downstream products bind domain-specific prompt clauses and product authority
  to the GTL interface.
- F_D may validate envelope, declared metadata, schema, digest, refs, and
  fallback-policy shape.
- F_D must not infer semantic meaning from rendered prompt text.
- F_P owns semantic judgment inside the declared prompt contract.

## Work Ledger

| id | task | closure proof | status |
| --- | --- | --- | --- |
| P-010 | Add or extend GTL requirements for full `AssetSurface` typed interface support. | `REQ-L-GTL3-ASSET-SURFACE` defines renderer-backed prompt asset declarations without making a new topology prime | complete |
| P-020 | Update GTL design surfaces with IACS and structural carrier diagram changes. | diagram shows `Node.assetSurface` plus subordinate prompt asset interface fields and no new public carrier | complete |
| P-030 | Extend TypeScript GTL carriers, constructors, admission, and serialization. | semantic build and tests prove declarations round-trip and invalid prompt asset interfaces fail admission | complete |
| P-040 | Add prompt asset declaration fixtures/tests. | tests cover normal authority, bounded fallback, forbidden routine authority, renderer refs, proof obligations, and chain composition | complete |
| P-050 | Define and prove downstream migration seam for odd_sdlc T-191. | one odd_sdlc prompt family uses GTL prompt asset surfaces as the steel thread; local SDLC register is marked transitional | pending |
| P-060 | Prove no F_D semantic drift. | tests/source review prove no Markdown parsing or semantic prompt classification in GTL/ABG deterministic code | complete |

## Proof Requirements

- Static proof: `AssetSurface` remains subordinate to existing GTL carriers and
  does not become a new topology object or public execution target.
- Static proof: prompt asset declarations preserve constructor refs, renderer
  refs, authority kinds, fallback preconditions, proof obligations, and
  output contract refs through admission and serialization.
- Negative proof: forbidden-routine disposition shape and fallback authority
  without precondition fail GTL declaration admission; concrete downstream
  authority values are not embedded in GTL.
- Negative proof: rendered Markdown text is not parsed to infer clause type,
  authority kind, or semantic intent.
- Downstream proof: odd_sdlc T-191 can consume GTL prompt asset surface truth
  and remove or demote its local prompt register.

## Current Verification

- `npm run test:semantic` passes: 682/682, including the T-150 synthetic
  prompt-asset cases and existing M01/M02/M03+ semantic regressions.
- `npm run test:t150` passes: 7/7, including declaration-shape rejection,
  GTL source purity, local live-style rendered-view proof, graph-function
  chain composition, anti-topology guard, and M02 module publication.
- `npm run test:t009` passes: 25/25, proving M01 compatibility and canonical
  identity across existing graph-function composition paths.
- `npm run test:t010` passes: 5/5, proving M02 publication still preserves
  graph-function-first work truth.
- `npm run lint:semantic`, `npm run lint:test-harness`, direct ESLint over
  `test_env/tests/test_t150_gtl_prompt_asset_surface.test.mjs`, and
  `git diff --check` pass.
- `npm pack --dry-run` passes for `@abiogenesis/typescript-tenant@3.9.0-rc.12`.
- GTL does not embed downstream authority-kind values; the T-150 test scans the
  GTL carrier, constructor, admission, and serialization source for known
  SDLC-local values and Markdown parser drift.
- Prompt asset support remains subordinate to `AssetSurface`; the T-150 test
  guards against prompt-specific topology tokens in GTL production source and
  against `AssetSurface` promotion into M02 public work carriers.
- Remaining before closure: P-050 downstream steel thread in odd_sdlc T-191.

## Notes

The current odd_sdlc T-191 source shape is acceptable as a proving-domain
bridge: constructor-first typed clauses, admission over declared metadata, and
Markdown as rendered view. This ticket exists to move that interface down into
GTL so the next downstream product does not rebuild it.
