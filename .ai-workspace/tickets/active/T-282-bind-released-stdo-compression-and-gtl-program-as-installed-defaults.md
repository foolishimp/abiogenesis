# T-282 - Restore Installed GTL Authority And Adopt Released STDO Context

- id: T-282
- title: Restore installed GTL authority and adopt released STDO context
- type: migration
- ticket_category: design_and_realization_migration
- status: active
- phase_status: held_pending_t284_vector_and_m3_design
- review_status: repriced_under_t283_candidate
- proof_status: pending
- implementation_hold: active
- implementation_hold_ref: T-284 correction vector and M3 design gate
- implementation_hold_effect: preserve existing artifacts; no design, code, test, proof, publication, or closure promotion
- goal: GOAL-035 milestones M3, M4, and M6
- priority: critical
- change_class: design_reframe_after_T283; final carrier disposition pending X vector
- re_entry_point: accepted direct-GTL realization design
- created_at: 2026-07-19
- updated_at: 2026-07-20
- owner: abiogenesis
- build_tenant: typescript
- dependencies:
  - T-283 exact constitutional closure
  - accepted X-to-5 correction vector
  - accepted direct-GTL traversal and installed-authority design
- phase_b_dependency:
  - exact tapped and installed STDO 2.0 release and compression

## Current Disposition

T-282 remains held evidence during T-284. Its original concerns are valid:

- installer-generated runtime files currently author private program,
  GraphFunction, policy, and execution-basis truth;
- CLI runtime discovery can prefer arbitrary workspace executable files;
- installed context and bootloader projections can drift from selected Product
  and method identity; and
- Product, install, workspace, catalog, invocation, and method context require
  one source-independent installed path.

Its prior realization model is not retained as authority. In particular,
`catalog.apply(overlay)` does not mint an effective workspace program and no
Product manifest supplies an implicit default program. The accepted 5.0
Product makes programs named GTL declarations, GraphFunctions their callable
members, HoG the direct executor, and ABG the runtime truth substrate.

The ticket may resume only after T-283 closes, X is frozen and classified, and
the replacement direct-GTL design is accepted.

## Two Milestones

### Milestone A - Restore Installed Direct-GTL Authority

Milestone A is required for `ABI5-ROOT-001` and does not wait for STDO 2.0.

It shall establish this installed chain:

```text
verify exact packaged Product
  -> install exact Product
  -> bind workspace to exact Product set
  -> admit and narrow installed catalog
  -> resolve one named admitted GTL program or GraphFunction member
  -> validate the original GTL value
  -> invoke through the public contract
  -> HoG traverses the admitted GTL directly
  -> ABG admits events, result, replay, continuation, and closure
  -> CLI renders the typed outcome
```

`catalog.apply` remains the Product operation for admitted non-callable node
types or overlays. It shall not create a program, callable, topology, selector,
execution basis, or default.

### Milestone B - Adopt Tapped STDO 2.0

Milestone B begins only after STDO 2.0 is tapped as one immutable release.
ABIogenesis shall verify and bind:

- the exact released method manifest and full release inventory;
- the exact compression identity, version, and digest;
- every source reference declared by the compression against the released
  file and digest; and
- the selected released method and compression identities in the installed
  Product context and `QualificationLawBasis`.

Milestone B does not block `ABI5-ROOT-001` or behavior development for
`ABG5-S02`, `S03`, `S05`, and `S06`. It is mandatory before `ABG5-S04`, exact
pre-RC qualification, `ABG5-S07`, or stable 5.0 release.

ABIogenesis verifies the tapped STDO release state. It does not independently
re-adjudicate STDO's F_H release decision.

## Authority Model

| Authority | Owner | Lawful carrier |
|---|---|---|
| immutable Product identity and installed payload inventory | released ABIogenesis Product | one packaged Product manifest and exact artifacts |
| GTL program and callable membership | Product-published Module and catalog declarations | admitted original GTL program plus named GraphFunction templates and digests |
| workspace/product truth | Product install and workspace binding | immutable install records, dependency lock, workspace binding, and admitted catalog identity |
| public invocation truth | public contract admission | exact program start or GraphFunction call, catalog view, contracts, input, actor, and execution basis |
| direct traversal | HoG | traversal of the admitted GTL program and materialized GraphFunction graph |
| runtime truth | ABG | admitted events, frames, C calls, evidence, results, judgments, replay, continuation, and closure |
| installed method context | Product materialization over selected method release | generated context manifest and projections citing exact released STDO and compression identities |

No manifest, context file, CLI adapter, SDK wrapper, workspace file, fixture,
plugin, or installer script may author topology, select a hidden program,
construct an execution basis, emit ABG truth, or decide continuation or
closure.

## One Manifest Definition

ABIogenesis has one Product-manifest definition and one immutable packaged
instance per candidate or released Product. Mutable candidate and work
evidence belongs under `.ai-workspace`; it may cite the Product manifest but is
not another Product manifest.

Installer manifests, install provenance, dependency locks, workspace
bindings, catalog views, context-materialization manifests, invocation
descriptors, and runtime projections are distinct derived carriers. They cite
their authority basis and do not re-author Product truth.

## Context Materialization

Installed context generation is owned by the Product behavior corresponding to
`product.materialize(context_bootstrap)`. The installer may invoke that
behavior after the workspace is bound; it shall not own or hard-code the
context content.

The materialization function consumes exact Product, workspace, selected
method release, compression, and source-reference identities. It produces a
manifested read model. It does not install a method, choose a GTL program,
admit a catalog, construct runtime authority, or become a second Product
definition.

## Transactional Retirement

Milestone A shall retire in one accepted cut:

- installer-generated executable `cli-runtime.mjs` authority;
- arbitrary workspace `typescript-runtime.mjs` preference;
- any private Module, GraphFunction, GTL program, selector, policy, or
  `ExecutionBasis` authored by those files;
- any compiled-plan, generated HoG-program, runtime-program catalog, or
  implementation-only callable used as program authority; and
- stale bootloader text that assigns execution to ABG or presents a mutable
  method candidate as installed law.

The replacement CLI binding shall be a verified neutral projection over the
packaged Product manifest, workspace binding, admitted catalog, public
invocation, and ABG result. It contains no authored topology, selection,
callable implementation, execution basis, event, continuation, or closure
logic.

The migration is not complete while old and new executable authority paths
coexist on a reachable installed route.

## Design Gate

Before implementation, the accepted replacement design shall prove both:

1. the positive supported path from packaged Product through original GTL,
   HoG, ABG, replay, and typed CLI outcome; and
2. real-path mutation or absence proof for every rival installer, CLI,
   workspace, compiled-plan, generated-program, and default-program authority.

The design shall map every affected existing file and contract to retain,
refactor, replace, create, delete, or archive under the accepted X vector.

## Acceptance

Milestone A closes only when:

- `ABI5-ROOT-001` runs through the source-blind installed public path;
- the exact original GTL value remains traversal authority;
- HoG traverses and ABG replay derives the typed terminal result twice;
- SDK and CLI are neutral projections of one public contract;
- no reachable rival program, selector, execution basis, or controller
  remains; and
- mutation negatives prove the removed paths cannot regain authority.

Milestone B closes only when:

- tapped STDO 2.0 and its compression verify by exact identity and digest;
- context materialization records their exact released basis;
- stale or mismatched method/context inputs refuse typed;
- `ABG5-S04` and qualification bind the same `QualificationLawBasis`; and
- no mutable candidate or local copy is represented as released method truth.

T-282 cannot close during T-283 and carries no current implementation-complete
claim.
