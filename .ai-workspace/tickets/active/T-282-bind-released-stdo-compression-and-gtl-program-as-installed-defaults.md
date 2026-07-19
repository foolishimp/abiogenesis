# T-282 - Restore Installed GTL Authority And Gate STDO Compression Adoption

- id: T-282
- title: Restore installed GTL authority and gate STDO compression adoption
- type: bug
- ticket_category: implementation_migration
- status: active
- phase_status: phase_a_current_basis_repair_ready_phase_b_admitted_blocked_by_stdo_2_0_tap
- review_status: amended_for_direct_fh_product_ruling_independent_review_pending
- proof_status: pending
- goal: >-
    GOAL-035 for both phases. Phase A advances the installed runtime path.
    Phase B supplies mandatory DS-6 qualification lineage and is not a T-276
    runtime prerequisite.
- priority: critical
- change_intent: >-
    First restore the already-authorized ABIogenesis installed GTL authority
    path against the exact current work basis, without waiting for STDO 2.0.
    Then, after STDO 2.0 is tapped, bind its authoritative released sources as
    qualification law and its released compression separately as the selected
    cold-agent context projection. Both milestones preserve one Product
    manifest definition, ordinary catalog and program admission, and ABG
    runtime authority.
- change_class: product_reprice
- re_entry_point: >-
    specification/PRODUCT.md Installed And Catalog Product / Conformance And
    Reflective Product / Stable Baseline And Successor Dogfood
- affected_requirement_surfaces:
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-QUAL.md
- triaged_at: 2026-07-19
- created_at: 2026-07-19
- updated_at: 2026-07-19
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-186
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap,
    build_tenants/abiogenesis/typescript/code/src/app/m04/toolchain_binding,
    and build_tenants/abiogenesis/typescript/code/src/cli
- dependencies:
  - T-186 versioned ABG/GTL context bootstrap
  - T-187 installed-context and program-shape conformance guardrails
  - T-280 four atomic One Surface semantic authority functions
  - T-270 admitted public `run.invoke` execution authority
  - T-274 published GTL Module and GraphFunction contribution
  - T-281 canonical Product-manifest and public-definition publication
- phase_a_method_basis: specification_methodology@f28e0d8003da6ce202cf1d517577b5c6ff01448b
- phase_a_method_basis_role: provisional_work_and_recovery_basis_not_final_5_0_qualification_law
- phase_b_dependencies:
  - exact tapped STDO 2.0 release manifest
  - released `stdo_compressed.md` and its declared-source mapping
  - specification/GOALS.md and specification/PRODUCT.md direct F_H selection
- affected_feature_rows:
  - A5-F01
  - A5-F06
  - A5-F07
  - A5-F14
  - A5-F15
- downstream_dependencies:
  - T-276 consumes Phase A repair readiness and supplies its installed root proof
  - T-247 and T-248 consume Phase A plus completed Phase B lineage verification
  - Phase B does not block T-276 runtime or installed-path work
- authority_refs:
  - specification/GOALS.md GOAL-035
  - specification/GOALS.md Method qualification lineage
  - specification/PRODUCT.md Installed And Catalog Product
  - specification/PRODUCT.md Conformance And Reflective Product
  - specification/PRODUCT.md Stable Baseline And Successor Dogfood
  - specification/PRODUCT.md Public Operator Contract
  - specification/PRODUCT.md Public Operation Behavior Matrix context-bootstrap ownership
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/product/REQ-P-POLICY.md 054, 056..058
  - specification/requirements/product/REQ-P-QUAL.md 057A..057C
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md 001..016
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-POLICY.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/authority_compressions/README.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/authority_compressions/stdo_compressed.md
  - .ai-workspace/tickets/completed/T-244-author-gtl5-subject-specification-seed.md A5-F01/A5-F06/A5-F07/A5-F14/A5-F15
  - .ai-workspace/tickets/active/T-276-prove-installed-consensus-workspace-scenarios.md

## Review Disposition

T-282 is amended in place after collective review. The accepted direction is
retained: one manifest authority, generated context, GraphFunction/program
separation, ordinary admission, T-276 as installed governor, and transactional
legacy retirement. This exact revision still requires independent review
before Phase A code crosses its design gate.

The amendment repairs twelve defects:

1. STDO 2.0 adoption no longer blocks ABIogenesis recovery.
2. Product-fixed, published-declaration, and applied-program authority are
   separate.
3. Both executable CLI runtime-binding bypasses are retired.
4. `product.materialize(context_bootstrap)` owns context generation.
5. All four affected requirement families are in the re-entry span.
6. Compression verification follows the released source subset declared by the
   compression rather than equating it with the full distribution.
7. The complete installed operation chain is explicit.
8. Mutable candidate evidence is distinguished from Product-manifest truth.
9. Product-owned GTL ordering is no longer attributed to T-280's four atomic
   semantic functions.
10. The provisional Phase A work basis and final qualification basis are exact
    and distinct.
11. Product materialization crosses the immutable-artifact boundary through an
    admitted event before replay may use it.
12. STDO 2.0 is mandatory at DS-6 but cannot serialize or delay T-276.

## Context

The currently installed path has two independent executable binding bypasses:

- the installer generates `.abiogenesis/cli-runtime.mjs` containing a private
  GraphFunction, Module, policy, and ExecutionBasis; and
- the CLI prefers an arbitrary workspace
  `.abiogenesis/typescript-runtime.mjs` before that generated file.

Neither file is a neutral projection of admitted Product, workspace, catalog,
and AF-10 truth. Both can author topology or runtime authority outside the
ordinary public path.

The installer also copies a standards directory without selecting a complete
method release, and it authors ABG/GTL context as a TypeScript string. Source
`AGENTS.md` and `CLAUDE.md` still expose a `4.6.0-rc.3` GTL bootloader and
stale operative-path claims.

STDO 2.0 is a separate shared-method amendment. Its development proceeds in
parallel with ABIogenesis recovery. The exact tapped STDO 2.0 release is a 5.0
DS-6 qualification prerequisite, not an ABG runtime or T-276 prerequisite.
The current `stdo_compressed.md` remains a candidate read model until STDO 2.0
is tapped.

## Two Milestones

### Phase A - Restore The Installed GTL Authority Path

Phase A is part of GOAL-035 and may begin immediately. It consumes exact
provisional work basis
`specification_methodology@f28e0d8003da6ce202cf1d517577b5c6ff01448b`.
T-282 records and conserves that selection for recovery work; it does not
mislabel it as the final 5.0 `QualificationLawBasis` or infer a current/latest
method version.

Phase A:

- establishes one Product-fixed system One Surface basis;
- publishes declaration basis for Modules and GraphFunctions;
- creates workspace-specific program authority only through AF-10
  `catalog.apply(overlay)`;
- removes both CLI executable binding bypasses;
- routes context generation through
  `product.materialize(context_bootstrap)`; and
- advances the existing T-276 source-blind installed governor.

Phase A is the only T-282 milestone that T-276 and the current ABIogenesis 5.0
runtime recovery consume. Its closure receipt is completed by the T-276 root
proof rather than required before that proof, avoiding a dependency cycle.

### Phase B - Bind Released STDO 2.0 Qualification Lineage

Phase B is admitted 5.0 qualification work and is blocked only by the immutable
STDO 2.0 tap. It is not upstream of Phase A, T-270/T-272 runtime integration,
or T-276 scenario development. It joins Phase A and T-276 evidence only at
T-247 exact-candidate basis construction.

Phase B begins after STDO 2.0 is tapped as one immutable release. The direct F_H
Product ruling is already recorded in GOALS and PRODUCT. Phase B verifies the
tapped release's authoritative sources and separately verifies its released
compression projection and declared-source mapping. If that binding changes
packaged context bytes, rerun only the affected install, context,
installed-smoke, conformance, and qualification gates before qualification.

## Delivery Governor

Phase A is a direct prerequisite contribution to the existing T-276 steel
thread. It does not create another product wave or scenario driver. Phase B
runs in parallel and joins only at T-247; neither the STDO tap nor Phase B may
hold the T-276 frontier open.

```text
immutable packaged Product
  -> product.install
  -> workspace.create
  -> workspace.bind
  -> catalog.admit
  -> catalog.view
  -> catalog.apply
  -> run.invoke
  -> ABG events and replay
  -> typed result
```

Context materialization is a distinct Product operation over the selected
binding, not a replacement for any step in that runtime chain:

```text
workspace.bind
  -> product.materialize(context_bootstrap)
  -> generated context manifest and projections
```

## Three Program Authorities

The migration preserves three different authorities:

| Authority | Scope and owner | Lawful carrier |
|---|---|---|
| `systemOneSurfaceProgramBasis` | Product-selected admitted GTL composition; PRODUCT and REQ-M-GTL3-PROGRAM-TRAVERSAL own ordering. T-280 supplies the four semantic authority functions but does not own program ordering. T-281/T-282 publish the exact manifest coordinate; T-270 consumes it. | Canonical Product-manifest reference and digest for the product-owned admitted GTL program basis |
| `publishedDeclarationBasis` | Product-published Module and GraphFunction contribution owned by T-274 and the public catalog publisher | Module, GraphFunction, catalog contribution, and exact digests |
| `appliedTargetProgramBasis` | Workspace-specific effective program created by AF-10 | Immutable `DeclarationApplication` output of `catalog.apply(overlay)` |

The canonical Product manifest may bind the first two. It shall not contain,
precompute, or imply an `appliedTargetProgramBasis`.

`catalog.apply(overlay)` alone creates the applied target program. Its result
preserves distinct target and application identities. `run.invoke` consumes
that applied basis and proves that the selected GraphFunction is a member of
the applied program and retained by the selected catalog view.

`Default` therefore means an explicitly Product-selected base program that
still crosses ordinary installation, binding, catalog admission, view,
application, One Surface intent admission, and ABG execution. It never means
that a Product manifest, CLI, plugin, or omitted input directly creates the
workspace-specific applied program.

## Target Truth

ABIogenesis has one Product-manifest definition and one immutable packaged
Product-manifest instance for a release candidate or Product.

Mutable candidate and work evidence belongs under `.ai-workspace`. It may
cite a candidate Product manifest but is not another Product manifest.
Installer manifests, install provenance, workspace bindings, catalog
applications, and runtime projections are distinct derived carriers. They cite
the packaged Product manifest and do not author a rival Product definition.

For Phase A, ProductToolchainManifest v2 binds:

- exact provisional method work basis
  `specification_methodology@f28e0d8003da6ce202cf1d517577b5c6ff01448b`;
- `systemOneSurfaceProgramBasis`; and
- each `publishedDeclarationBasis` included in the Product.

For Phase B, `QualificationLawBasis` binds the tapped STDO 2.0 release and its
authoritative released source refs and digests. The Product and context
materialization basis separately bind released `stdo_compressed.md` identity,
digest, and declared-source mapping. `ExactCandidateQualification` binds both
lineages without promoting the compression to constitutional law.

ProductToolchainManifest v2 is a transactional schema hard break. It retains
the exact Product identity/version/content digest, public-contract catalog
coordinate and digest, runtime-system profile coordinate and digest, and
product-relative inventory, and adds the exact method work-basis coordinate,
`systemOneSurfaceProgramBasis`, `publishedDeclarationBasis` coordinates, and
Product-owned context-input coordinates with their digests. The publisher,
admitter, installer, verifier, SDK/CLI reader, schema, fixtures, and package
assets move together. ABIogenesis 5.0 refuses schema v1; no compatibility
facade, dual manifest reader, or inferred field preserves it.

The resulting execution relation remains:

```text
admitted GTL composition owns traversal topology
  -> named GraphFunction is the callable work contract
  -> admitted plugin contract binds only its implementation seam
  -> ABG interprets, admits, executes, records, and replays
```

T-282 defines no new GTL atom, program, GraphFunction, plugin, controller,
event family, public operation, or applied-program constructor.

## Migration Declaration

- old_truth_path: >-
    hard-coded installed context; legacy SDLC/GTL bootloader sections;
    installer-generated private Module, GraphFunction, policy, and
    ExecutionBasis in cli-runtime.mjs; arbitrary workspace
    typescript-runtime.mjs preferred by the CLI; and install-local
    Product-manifest-shaped truth
- new_truth_path: >-
    one immutable packaged Product manifest plus exact installed and workspace
    projections; Product-fixed One Surface and published declaration bases;
    workspace-specific AF-10 application; neutral CLI projection; Product-owned
    context materialization; and ABG execution over admitted truth
- producers_old:
  - `installedAbgGtlContextContent(...)`
  - `installedCliRuntimeBindingSource(...)`
  - `runtimeBindingCandidates(...)`
  - legacy `SDLC_BOOTLOADER` and `GTL_BOOTLOADER` marked sections
  - installer-written rival `abg_product_toolchain_manifest` shape
- producers_new:
  - canonical Product-contract publisher
  - Product-owned admitted One Surface GTL program declaration
  - T-280 four atomic One Surface semantic functions
  - T-274 published declaration contribution
  - AF-10 `catalog.apply(overlay)`
  - `product.materialize(context_bootstrap)`
  - neutral manifest/binding/application runtime projection
- consumers_old:
  - installer topology verification
  - `.abiogenesis/context/ABG_GTL_CONTEXT.md`
  - `AGENTS.md` and `CLAUDE.md`
  - workspace toolchain binding
  - CLI runtime bootstrap and conformance inventory
- consumers_new:
  - Product install and workspace-binding projections
  - Product-materialization context manifest and projections
  - catalog admission, view, and application
  - public `run.invoke` and ABG replay
  - semantic compiler and GTL program conformance
  - T-276 installed scenario and exact-candidate qualification
- closure_law: >-
    Phase A closes its 5.0 obligation only when the complete installed operation
    chain executes through T-276, both CLI binding bypasses are absent, context
    materialization is Product-owned, and all Product, declaration,
    application, install, workspace, event, and replay identities remain
    distinct. Phase A closure unblocks runtime and DS-5 work. T-282 remains
    active until Phase B binds the exact tapped STDO 2.0 authoritative-source
    and released-compression lineages into T-247 qualification. Phase B cannot
    hold Phase A or T-276 runtime work open.

## Requirement Re-Entry

The direct F_H ruling re-entered at PRODUCT. Its accepted delta now propagates
through four requirement families:

### REQ-P-INSTALL

- Require installed Product and workspace projections to cite the one immutable
  packaged Product manifest.
- Retire executable workspace runtime files as selection authority.
- Require the supported installed chain and fail closed on any bypass.
- Keep candidate/work evidence under `.ai-workspace` without relabeling it as
  Product truth.

### REQ-P-PUBLIC-CONTRACTS

- Publish `systemOneSurfaceProgramBasis` and
  `publishedDeclarationBasis` coordinates without publishing an applied
  workspace program.
- Preserve `catalog.apply` and `run.invoke` as separate public authorities.
- Forbid a CLI runtime module or manifest field from becoming execution
  authority.

### REQ-P-POLICY

- Preserve the exact
  `product.install -> workspace.create -> workspace.bind -> catalog.admit ->
  catalog.view -> catalog.apply -> run.invoke` chain.
- Keep context generation behind
  `abg.operation.product.materialize(context_bootstrap)`.
- Forbid omitted-input or implicit runtime defaults under this ticket.

### REQ-P-QUAL

- Bind exact Product manifest, tapped STDO 2.0 authoritative method-law basis,
  separately verified compression projection, system One Surface basis,
  published declaration bases, AF-10 applied target program, install,
  workspace, catalog, event, and replay evidence.
- Refuse qualification when the law basis names a different STDO release, when
  compression is treated as law, or when any source/compression input is
  candidate, mixed-version, stale, missing, or digest-mismatched.

## CLI Hard Break

The migration transactionally retires both current executable binding paths:

1. the installer shall no longer generate a private GraphFunction, Module,
   policy, start intent, or ExecutionBasis in `.abiogenesis/cli-runtime.mjs`;
2. the CLI shall no longer search for or import arbitrary workspace
   `.abiogenesis/typescript-runtime.mjs`; and
3. no fallback ordering shall preserve either path under another filename.

If a local runtime projection file remains necessary, it must be a verified
neutral projection of:

- immutable Product-manifest ref and digest;
- installed Product and workspace-binding refs and digests;
- admitted catalog basis ref and digest; and
- AF-10 DeclarationApplication ref, target ref, and digests.

That projection contains no authored GTL topology, selector, callable,
implementation function, plugin choice, policy default, start intent,
ExecutionBasis, event, or closure decision. ABG resolves executable
implementation from the installed Product and admitted catalog only after
ordinary public admission.

The hard break includes production code, installers, tests, fixtures, and live
lanes that currently write or prefer `typescript-runtime.mjs` or the authored
`cli-runtime.mjs`. A test-only bypass is still a reachable rival authority.

## Context Ownership

`abg.operation.product.materialize(context_bootstrap)` is the semantic owner
of context generation.

The installer may verify and install immutable Product assets. Workspace
binding may select exact Product identity. Neither may author context semantics
or independently render agent instructions.

The context materialization implementation:

- consumes an admitted target workspace and exact selected Product binding;
- resolves Product-owned context inputs by exact reference and digest;
- renders one deterministic context asset and materialization manifest;
- marker-projects that same content into `AGENTS.md` and `CLAUDE.md`;
- preserves unrelated project-owned guidance; and
- records created, refreshed, preserved, or refused surfaces as typed results;
  and
- admits the immutable artifact through the generic
  `public_operation_artifact_admitted` boundary event before replay or
  `project.read` may use its availability as runtime truth.

The materialized files remain immutable external artifact truth. The admitted
boundary event establishes their runtime availability; replay derives the
availability fluent, and `project.read` exposes that derived state. The file
write, event admission, fluent derivation, and projection are one T-276
causality chain, not correlated evidence.

Legacy `4.6.0-rc.3`, `SDLC_BOOTLOADER`, and `GTL_BOOTLOADER` authority is
retired transactionally when the Product-owned context path is promoted.
Instructions that name a missing resolved-runtime file as operative authority
must either point to a real derived projection or be removed.

## Phase B Compression Verification

ABIogenesis verifies released STDO input in three separate steps:

1. verify the exact tapped STDO release manifest and its complete released file
   inventory;
2. verify the selected compression identity, path, and digest against that
   release; and
3. for each source reference declared by the compression, resolve the
   corresponding released file and verify its declared digest.

The compression-declared source subset need not equal the complete standards
distribution. The release manifest owns the complete inventory; the
compression owns the subset from which it was derived.

ABIogenesis verifies that the selected release is tapped and that its assets
match. It does not independently adjudicate, recreate, or reinterpret STDO's
F_H acceptance receipt.

Candidate STDO compression may be used only in a clearly provisional
development sandbox. It cannot project released Product, install, context, or
qualification truth.

## Execution Plan

### Phase A

1. Propagate the accepted Product ruling through the four requirement families.
2. Accept a design that separates the three program authorities and defines the
   neutral CLI projection.
3. Publish and admit ProductToolchainManifest v2 with system One Surface,
   published declaration, exact work-basis, and context-input coordinates.
4. Retire both executable CLI binding bypasses in one promoted cut.
5. Move context generation behind
   `product.materialize(context_bootstrap)`, admit its immutable artifact
   boundary event, and retire legacy bootloaders.
6. Prove the complete installed public chain through the existing T-276 driver.
7. Record the Phase A closure receipt without waiting for the STDO 2.0 tap.

### Phase B

1. Wait for the exact tapped STDO 2.0 release.
2. Verify the release, authoritative sources, compression, and declared source
   subset separately.
3. Bind authoritative sources into `QualificationLawBasis` and the compression
   projection into Product/context materialization without conflating them.
4. Construct the T-247 exact candidate over Phase A and Phase B lineages.
5. Rerun the affected install, context, installed-smoke, conformance, and
   qualification gates against that exact candidate.

## Milestones

```yaml
milestones:
  - id: phase-a-requirement-authority
    state: pending
    depends_on: []
    proof_scope: four-family propagation of the accepted Product delta
    closure_required_for_5_0: true
  - id: phase-a-program-and-cli-design
    state: pending
    depends_on: [phase-a-requirement-authority]
    proof_scope: three program authorities plus neutral CLI projection
    closure_required_for_5_0: true
  - id: phase-a-hard-break
    state: pending
    depends_on: [phase-a-program-and-cli-design]
    proof_scope: both executable binding bypasses retired transactionally
    closure_required_for_5_0: true
  - id: phase-a-context-owner
    state: pending
    depends_on: [phase-a-requirement-authority]
    proof_scope: product.materialize context generation and legacy retirement
    closure_required_for_5_0: true
  - id: phase-a-installed-root-proof
    state: pending
    depends_on: [phase-a-hard-break, phase-a-context-owner]
    proof_scope: T-276 source-blind complete installed operation chain
    closure_required_for_5_0: true
  - id: phase-b-fh-adoption-ruling
    state: completed
    depends_on: []
    proof_scope: specification/GOALS.md and specification/PRODUCT.md exact F_H Product ruling
    closure_required_for_5_0: true
  - id: phase-b-released-compression
    state: blocked_by_stdo_2_0_tap
    depends_on: [phase-b-fh-adoption-ruling]
    proof_scope: tapped STDO release, authoritative sources, compression, and declared-source verification
    closure_required_for_5_0: true
  - id: phase-a-independent-closure-review
    state: pending
    depends_on: [phase-a-installed-root-proof]
    proof_scope: Phase A final delta, old-authority absence, and installed root causality
    closure_required_for_5_0: true
  - id: phase-b-qualification-lineage
    state: pending
    depends_on: [phase-b-released-compression, phase-a-installed-root-proof]
    proof_scope: T-247 exact qualification basis plus affected-gate delta
    closure_required_for_5_0: true
  - id: independent-final-closure-review
    state: pending
    depends_on: [phase-a-independent-closure-review, phase-b-qualification-lineage]
    proof_scope: complete T-282 same-candidate lineage and final delta
    closure_required_for_5_0: true
```

## Phase A Acceptance Criteria

- [ ] Exact provisional work basis
      `specification_methodology@f28e0d8003da6ce202cf1d517577b5c6ff01448b`
      is recorded without relabeling it as final STDO 2.0 qualification law.
- [ ] ProductToolchainManifest v2 is the only admitted Product manifest schema;
      v1 and any compatibility facade are absent from exports and production
      consumers.
- [ ] One canonical Product-manifest definition binds its exact work basis,
      `systemOneSurfaceProgramBasis`, published declaration bases, and
      Product-owned context inputs, but no applied workspace program.
- [ ] No Product manifest contains an `appliedTargetProgramBasis`.
- [ ] AF-10 alone creates the workspace-specific applied target program.
- [ ] `run.invoke` consumes that applied basis and proves selected
      GraphFunction membership in the same view and program.
- [ ] The installed public chain is exactly
      `product.install -> workspace.create -> workspace.bind -> catalog.admit ->
      catalog.view -> catalog.apply -> run.invoke`.
- [ ] `product.materialize(context_bootstrap)` owns context generation.
- [ ] Neither `typescript-runtime.mjs` nor authored `cli-runtime.mjs` is
      executable selection or ExecutionBasis authority.
- [ ] Any retained runtime projection is neutral, digest-verified, and contains
      no topology, selector, callable, policy default, or ExecutionBasis.
- [ ] Generated context is deterministic, manifest-recorded, marker-idempotent,
      and preserves project-owned guidance.
- [ ] Materialized context becomes runtime truth only through an admitted
      artifact-boundary event, replay-derived availability fluent, and
      `project.read` projection with causal predecessor continuity.
- [ ] No current instruction surface advertises `4.6.0-rc.3`,
      GraphFunction-as-program, workspace-as-controller, mutable source as
      installed Product, or a missing runtime projection as current authority.
- [ ] ABG owns admission, selection, execution, events, replay, continuation,
      and closure on the public path.
- [ ] T-276 proves the same chain from packed source-blind installed bytes.
- [ ] Phase A emits a qualification-ready projection that binds the same work
      basis, Product, declaration, applied-program, install, workspace, event,
      and replay identities and digests without projecting a final verdict.

## Phase B Acceptance Criteria

- [x] GOALS and PRODUCT directly admit STDO 2.0 as the mandatory ABIogenesis
      5.0 qualification lineage without making it a runtime prerequisite.
- [ ] The tapped release manifest and full inventory verify.
- [ ] `QualificationLawBasis` names the exact tapped STDO 2.0 authoritative
      source identities and digests.
- [ ] The compression identity and digest verify against the release.
- [ ] Every compression-declared source ref verifies against its released file.
- [ ] ABIogenesis does not adjudicate STDO's F_H receipt.
- [ ] The selected compression remains a derived read model and does not replace
      source constitutional authority.
- [ ] No candidate, stale, missing, mixed-version, or digest-mismatched
      compression projects released context or qualification truth.
- [ ] T-247 binds Phase A and Phase B lineages into one exact candidate and all
      affected gates rerun on that same basis.

## Mutation-Negative Cases

The supported path must refuse before effect when:

- a Product manifest contains or precomputes workspace-specific applied program
  truth;
- a Module or GraphFunction declaration is treated as a GtlProgram;
- `run.invoke` receives no matching AF-10 DeclarationApplication;
- the selected GraphFunction is outside the applied program or catalog view;
- `typescript-runtime.mjs` or authored `cli-runtime.mjs` becomes reachable;
- a neutral runtime projection contains topology, a selector, callable,
  implementation, policy default, start intent, or ExecutionBasis;
- installer code, workspace binding, CLI, or a fixture authors context outside
  `product.materialize(context_bootstrap)`;
- any step in
  `product.install -> workspace.create -> workspace.bind -> catalog.admit ->
  catalog.view -> catalog.apply -> run.invoke` is absent or substituted;
- mutable `.ai-workspace` evidence is relabeled as immutable Product-manifest
  truth;
- a candidate STDO cut is selected as released input;
- `QualificationLawBasis` selects any STDO version other than the exact tapped
  2.0 release;
- released compression is used as constitutional law or replaces its declared
  authoritative sources;
- Phase B or the STDO tap is used to block, control, or supply T-276 runtime
  behavior;
- a compression source ref does not match its corresponding released file;
- a fixture writes the refusal, event, replay row, or terminal result it later
  asserts; or
- context refresh would delete unrelated project-owned guidance.

## Non-Closure Conditions

- Phase A or T-276 waits for the STDO 2.0 tap.
- Qualification admits without exact tapped STDO 2.0 authoritative-source and
  separately verified compression lineages.
- The Product manifest contains effective workspace application truth.
- Any executable workspace runtime binding bypass survives.
- Context generation remains installer-owned or hard-coded.
- A second Product-manifest definition survives as co-equal authority.
- An omitted-input or implicit runtime default is introduced without
  `product_reprice`.
- Product, declaration, application, installer, workspace, context, and runtime
  surfaces carry conflated or divergent identities.
- Only focused/component tests are green while the T-276 installed governor is
  red or unevaluated.
- Phase B compression verification equates its source subset with the complete
  release inventory or re-adjudicates STDO governance.

## Proof Surface

### Phase A

- four-family requirement trace and accepted design;
- canonical Product manifest and Product-content digest;
- Product install, workspace binding, catalog admission, view, and AF-10
  DeclarationApplication evidence;
- neutral runtime projection schema and both old-path absence scans;
- Product-materialization context manifest, rendered digest, and marker-refresh
  evidence;
- semantic compiler and GTL program conformance over all three program
  authorities;
- public `run.invoke -> ABG replay -> typed result` evidence;
- T-276 packed source-blind installed scenario;
- qualification-ready Phase A lineage and final-delta review;
- real-path mutation negatives;
- `git diff --check`;
- `npm run test:t076`;
- `npm run test:t159`;
- `npm run test:semantic`;
- `npm run check:ds-governance`;
- `npm run check:prime-contraction`.

### Phase B

- exact F_H adoption ruling;
- tapped STDO release-manifest and inventory verification;
- compression identity and digest verification;
- per-declared-source released-file digest verification;
- affected context, conformance, qualification, and installed proof only.

## Excluded Boundaries

- no new ticket or parallel T-282 plan;
- no new STDO identity or parallel compression file;
- no STDO 2.0 runtime or T-276 prerequisite;
- no further ABIogenesis Intent or Product reprice inside Phase A realization;
- no omitted-input or implicit runtime default;
- no new GTL atom, program identity, GraphFunction, plugin category, public
  operation, controller, event family, or replay store;
- no Product-manifest ownership of workspace-specific AF-10 application truth;
- no reimplementation of T-270 selection, T-274 publication, T-280 One Surface,
  or T-276 scenario control;
- no release closure inferred from context presence, component tests, or local
  self-test success alone.
