# T-282 - Materialize Released STDO Context

- id: T-282
- title: Materialize the selected released STDO context for qualification
- type: migration
- ticket_category: design_and_realization_migration
- status: backlog
- phase_status: held_for_m6_after_t270_m5
- review_status: stdo_2_2_2_basis_propagated_m6_realization_review_pending
- proof_status: pending
- implementation_hold: active
- implementation_hold_ref: T-270 owns M5; T-282 resumes for M6 after one exact M5 candidate exists
- implementation_hold_effect: preserve existing artifacts; no design, code, test, proof, publication, or closure promotion
- goal: GOAL-035 M6
- priority: critical
- change_class: realization_refactor plus qualification_basis_materialization
- re_entry_point: accepted Product context and qualification boundary
- created_at: 2026-07-19
- updated_at: 2026-07-31
- owner: abiogenesis
- build_tenant: typescript
- completed_dependencies:
  - T-283 exact constitutional closure
  - T-284 accepted X-to-5 correction vector
  - T-285 accepted direct-GTL traversal and installed-authority design
  - T-286 installed root closure
- remaining_dependency:
  - T-270 M5 closure over one exact candidate
- selected_method_basis:
  - STDO v2.2.2 at 0519129d63de10822ae6353fa0c5ce05d56f13e9
  - 41-member digest 4cc6a10fca6b1a2c6991664d2a7ee19220401d95f3f1c0f4fa848c6a9ed81c21
  - adoption receipt .ai-workspace/comments/codex/20260731T062823Z_DECISION_select_stdo_2_2_2_for_abiogenesis_5.md
- qualification_basis_alignment:
  - active qualification requirements select STDO v2.2.2
  - accepted M3 architecture is conserved with its historical identities explicit
  - completed T-272 is evidence only; T-270 owns current S03

## Current Disposition

T-282 remains held until M6. Milestone A was realized by T-286 and is retained
as exact installed-root evidence. STDO 2.2 qualification-basis wording and
current-owner projection are reconciled; Milestone B realization and proof
remain pending. Its remaining concerns are:

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

The ticket resumes only after T-270 closes M5 over one exact candidate. It does
not reopen the accepted direct-GTL architecture or repeat T-286.

## Two Milestones

### Milestone A - Retained Installed Direct-GTL Authority

Milestone A is complete through T-286 and remains the mandatory root governor.

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

### Milestone B - Materialize Selected STDO 2.2

Released STDO `v2.2.2` governs ABIogenesis development. Milestone B
materializes that selected basis into Product-owned context and qualification
evidence by verifying and binding:

- release tag `v2.2.2`, commit
  `0519129d63de10822ae6353fa0c5ce05d56f13e9`, and the complete 41-member
  standards inventory;
- the exact compression identity, version, and digest;
- every source reference declared by the compression against the released
  file and digest; and
- the selected released method and compression identities in the installed
  Product context and `QualificationLawBasis`.

Milestone B does not block M5 behavior. Its Product-context and qualification
binding is mandatory before exact pre-RC qualification, `ABG5-S07`, or stable
5.0 release. A future 5.1 selection of `ABG5-S04` must consume the released
method basis independently; it is not a 5.0 prerequisite.

ABIogenesis verifies the selected STDO release identity. It does not
independently re-adjudicate STDO's F_H release decision.

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

Milestone A remains closed only while:

- `ABI5-ROOT-001` runs through the source-blind installed public path;
- the exact original GTL value remains traversal authority;
- HoG traverses and ABG replay derives the typed terminal result twice;
- SDK and CLI are neutral projections of one public contract;
- no reachable rival program, selector, execution basis, or controller
  remains; and
- mutation negatives prove the removed paths cannot regain authority.

Milestone B closes only when:

- selected STDO `v2.2.2`, its 41-member distribution, and its compression
  verify by exact identity and digest;
- context materialization records their exact released basis;
- stale or mismatched method/context inputs refuse typed;
- 5.0 qualification binds the exact released `QualificationLawBasis`, and any
  future selected `ABG5-S04` independently binds its then-governing released
  basis; and
- no mutable candidate or local copy is represented as released method truth.

T-282 cannot close before M6 qualification materializes the selected method
basis and carries no current M5 implementation claim.
