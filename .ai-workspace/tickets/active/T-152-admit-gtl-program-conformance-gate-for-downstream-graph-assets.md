---
id: T-152
title: Admit GTL program conformance gate for downstream graph assets
type: feature
ticket_category: ordinary
status: active
proof_status: pending
goal: provide one ABG-owned static GTL program admission/typecheck function that downstream products can call before ABG runtime execution to prove graph functions, graph vectors, target-carrier rows, closure rows, prompt assets, plugin contracts, public starts, overlays, and active ABG identity surfaces are lawful
change_class: requirement_reprice
change_intent: Make GTL program conformance a deterministic ABG API function with a thin CLI wrapper instead of downstream-local lint rules, MCP-shaped prompt schema, or agent-memory checks.
re_entry_point: requirements
created_at: 2026-06-08
updated_at: 2026-06-09
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
source_documents:
  - /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPH.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-OPERATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md
  - specification/requirements/gtl/REQ-L-GTL3-RULE.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - .ai-workspace/tickets/completed/T-150-promote-prompt-assets-into-gtl-typed-asset-interface.md
related_tickets:
  - T-150
  - T-151
affected_boundary:
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
    - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
    - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
    - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
    - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  design:
    - build_tenants/abiogenesis/typescript/design/README.md
    - build_tenants/abiogenesis/typescript/design/M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_GTL_PROGRAM_CONFORMANCE_GATE_STRUCTURAL_CARRIER_DIAGRAM.md
    - build_tenants/common/design/modules/M03-engine-kernel.yml
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/gtl_program_conformance.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts
    - build_tenants/abiogenesis/typescript/code/src/cli/command.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/compute_notation.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
    - build_tenants/abiogenesis/typescript/code/src/shared/engine_authority_fields.ts
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t152_contract_fulfillment_binding_api.test.mjs
target_truth: Downstream GTL/ABG programs are admitted through one ABG-owned programmatic API, `typecheckGtlProgram(...)`, with `admitGtlProgramConformanceInput(...)` as its raw-input gate and `abiogenesis-ts typecheck-gtl-program` as a thin CLI wrapper. The function evaluates the supplied GTL program inventory against GTL graph interface law, graph-vector identity law, target-carrier row law, closure row law, prompt AssetSurface view law where the downstream row declares a prompt invocation asset, supplied plugin/public-start/overlay row law, active source identity law, feature-coverage owner law, and expected coverage. Report identity is evidence-bound to the normalized audited inventory. Features without first-class inventory fields remain explicit manifest attestations until this ticket admits those fields.
superseded_truth: Downstream products can prove GTL/ABG graph conformance by local scans, prompt prose, method-in-context, or partial inventories that pass when omitted.
closure_law: This ticket closes only when the TypeScript source is tracked, exported, buildable, callable programmatically, callable through the CLI wrapper, and tested against empty/partial inventories, malformed raw input, unsatisfied graph dependencies, duplicate target/closure rows, duplicate display labels with distinct opaque vector identity, current ABG engine-authority flag bypasses, prompt asset row completeness, plugin admission, exact ABI package version, stale active ABG identity, evidence-bound report identity, and a downstream-shaped production graph-asset inventory gate.
non_closure_conditions:
  - the function is only present in build output, a temporary package, or an untracked source file
  - the CLI owns rules that the programmatic function does not own
  - downstream products maintain local GTL conformance rules instead of calling the ABG function
  - empty, partial, or caller-selected coverage can pass
  - graph vectors are keyed by display name rather than graphFunctionId, graphId, and graphVectorId
  - duplicate target-carrier or closure rows for one graph-vector identity can pass
  - raw malformed JSON can throw uncaught instead of producing deterministic issue rows
  - engine-authority fields are hand-copied across guards or silently stripped
  - prompt asset row completeness is claimed as GTL AssetSurface constitutional law without an explicit requirement home or scoped row policy
  - proof depends on a local `/tmp` package instead of the source under review or a recut release snapshot
  - a downstream-shaped proof passes by excluding current TypeScript graph assets, prompt construction assets, plugin contracts, or active source identity surfaces
review_gate: high-bar code review and downstream-shaped production-inventory proof required before release
---

# T-152: Admit GTL Program Conformance Gate For Downstream Graph Assets

## Intake Triage

Smallest lawful re-entry point: `requirement_reprice`.

Reason: T-150 promoted prompt `AssetSurface` into a GTL typed asset interface.
A downstream ODD product integration exposed a broader single-control-point
requirement: downstream products need a deterministic ABG function that checks
their GTL program inventory before ABG runtime execution.

This is a hard admission/typecheck boundary for current GTL/ABG program shape.

## Scope

- Provide `admitGtlProgramConformanceInput(raw)` for raw JSON/API input.
- Provide `typecheckGtlProgram(raw)` as the programmatic gate.
- Provide `formatGtlProgramConformanceIssues(issues)` for human-readable output.
- Provide `abiogenesis-ts typecheck-gtl-program --input <json>` as a thin CLI
  wrapper over the programmatic function.
- Single-source engine-authority field vocabulary for GTL binding rows, ABG
  plugin contracts, provider outputs, and hook findings.
- Use a downstream-shaped production inventory as the proving domain without
  naming or depending on any downstream ticket.

## Audit Checklist

- [x] Source file is tracked and exported from the TypeScript tenant package.
- [x] CLI wrapper delegates to `typecheckGtlProgram(...)`; it does not own
  separate conformance rules.
- [x] Raw malformed input returns deterministic issue rows.
- [x] Expected coverage requires every coverage key and nonzero counts.
- [x] Empty or partial inventories fail closed.
- [x] Graph function interfaces match environment requires/provides.
- [x] Graph traversal derives every graph output from graph inputs and prior
  vector outputs.
- [x] Vector source and target nodes are declared in the graph.
- [x] Target-carrier rows are keyed by graphFunctionId, graphId, and
  graphVectorId.
- [x] Edge-closure rows are keyed by graphFunctionId, graphId, and graphVectorId.
- [x] Exactly one target-carrier row exists for every graph-vector identity.
- [x] Exactly one edge-closure row exists for every graph-vector identity.
- [x] Duplicate display labels with distinct opaque identities are lawful.
- [x] Prompt invocation asset rows are admitted AssetSurface rows with row-local
  rendered-view, constructor, output-contract, authority-slot, proof, node, and
  evidence bindings.
- [x] Plugin contracts are admitted through ABG plugin admission.
- [x] Current engine-authority flags such as `mayWriteLedgers` and
  `maySelectTraversal` are rejected.
- [x] Unknown GTL fulfillment-binding fields fail instead of being stripped.
- [x] Active source identity rows reject stale ABG 3.x URI/path/package forms
  and pre-RC1 labels through the ABG programmatic gate.
- [x] Report identity includes normalized inventory digests.
- [ ] A downstream consumer consumes this ABG function and no product-local
  replacement.
- [ ] A clean downstream live lane passes after the graph inventory gate.

## T-153 Feature-Coverage Checklist

T-153 establishes `REQ-L-GTL3-CONTRACT-LAW-API` as the constitutional reload
surface. This T-152 gate must grow from current graph-asset conformance into a
feature-coverage typechecker over every T-153 capability family.

Principle: every T-153 family in a downstream program must be either
represented by typed program inventory, explicitly declared `not_used` with
reason refs, or rejected as missing coverage. A caller-selected partial
inventory is not admissible.

- [x] Add an admitted `GtlProgramFeatureCoverageManifest` input owned by ABG,
  not by downstream-local prose.
- [x] Require the feature manifest to enumerate every
  `REQ-L-GTL3-CONTRACT-LAW-API` capability family.
- [x] Fail closed when any T-153 feature family is absent from the manifest.
- [x] Fail closed when a feature is marked `not_used` but matching inventory
  rows exist.
- [x] Bind report identity to the normalized feature manifest and per-feature
  disposition rows.
- [x] Graph structure and interface: materialized graph functions, graph
  vectors, input/output derivability, and vector source/target declaration are
  checked today.
- [x] Core graph algebra: explicitly cover `edge`, `compose`, `substitute`,
  `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, `identity`, and
  `same_object` as named algebra capabilities, not only as materialized vector
  reachability.
- [ ] Composition law: verify composed source/target contracts by identity
  across graph-function/vector composition rows.
- [ ] Substitution law: verify substituted inner graph interface, provided
  outputs, inherited constraints, and no hidden source/target rewrite.
- [ ] Recursion law: verify `recurse(graph_function, termination, foldback)`
  declarations with explicit termination, foldback, lineage, bounds, and
  preserved outer interface.
- [ ] Fan-out/fan-in/gate/promote law: verify operation-specific input/output
  contracts and decision or aggregation declarations.
- [x] Operator declarations: verify `Operator` rows, regime, binding, tags, and
  vector/module attachment.
- [x] Evaluator declarations: verify first-class `Evaluator` rows, regime,
  binding, consumed-field refs, tags, and vector/module attachment.
- [x] Rule declarations: verify first-class rule identity, rule kind, config
  digest, tags, and vector/module attachment.
- [x] `F_*` compute composition: verify `abg.fn_composition`, `fn<A, B>.C`,
  `transform.C`, `evaluate.C`, `consequence.C`, regime-binding refs,
  stage-binding refs, and closure contract refs as first-class rows.
- [x] Plugin contracts: ABG `EnginePluginContract` admission is checked today
  for supplied plugin rows.
- [x] Hook boundary declarations: verify hook refs, host refs,
  declaration-source kind/ref, precedence rank, concerns, and plugin-contract
  refs as first-class rows.
- [x] Target-carrier contract law: full visible target-carrier row fields are
  checked today.
- [x] Prompt construction and typed assets: rendered prompt invocation
  `AssetSurface` rows, renderer refs, digest policy, constructor refs, proof
  refs, output contracts, authority slots, GTL node, and evidence refs are
  checked today.
- [x] Selection/refinement/synthesis/sub-work: verify `RefinementBoundary`,
  `CandidateFamily`, selection-boundary, synthesis, and sub-work rows as
  first-class language configuration surfaces.
- [x] Module/public-start coverage: module publication, overlays, and public
  start rows are checked today for supplied rows.
- [x] Job and Role binding: verify `Job`, `Role`, contract target refs,
  capability refs, policy hook refs, and public callable graph-function refs.
- [x] External tool gates: verify declared external tool/MCP gate refs as
  ABG-admitted payload/tool boundaries, never as GTL contract-law source.
- [x] Active source identity: stale ABG 3.x URI/path/package forms are checked
  today.
- [x] Owner-disposition report: emit per-feature classification as
  GTL-declared, ABG-admitted/interpreted, downstream product meaning, or
  rejected missing coverage; ABG owns and enforces the owner-classification map
  rather than trusting caller-supplied manifest labels.
- [x] Design Module Method boundary assets: declare the T-152 IACS,
  reference-to-target derivation, subordinate payload register, deterministic
  observation rule, and structural carrier diagram.
- [x] Negative tests prove every open T-153 feature family fails when omitted
  from a program that claims full GTL/ABG conformance.
- [ ] A downstream consumer supplies the feature manifest from production graph
  assets, prompt assets, plugin contracts, overlays, public starts,
  target-carrier rows, and source identity rows.

## Non-Closure Carried Open

The first closure target is a static program gate for the current GTL/ABG
published program inventory. Full algebra-trace checking for every GTL algebra
operation (`compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, and
`promote`) may require a later normalized algebra AST carrier if the current
published carriers cannot reconstruct the trace without adding caller-owned
truth. This ticket must not claim more than it proves.

## Bug Triage - 2026-06-08

Finding: the 4.0.0-rc.2 `typecheckGtlProgram(...)` source-identity scanner
rejected common prose labels such as `abg-3.7`, `ABG 3.7`, `ABG37`, `rc13`, and
`3.9.0-rc.13`, but it missed active URI/path/package identities:

- `runtime://abg/3.8/...`
- `runtime://abg-3-6-live`
- `abg://3.7/...`
- `package:@abiogenesis/typescript-tenant@3.9.0-rc.13#...`

STDO triage: `realization_refactor` inside this active T-152
`requirement_reprice`. The requirement and target truth already require active
source identity law to be enforced by the ABG-owned programmatic gate. No new
constitutional product behavior is introduced; the realization failed to cover
all known stale ABG identity spellings.

F_D/F_P classification: F_D. The defect is deterministic lexical admission of
active source identity rows. It must be caught by `typecheckGtlProgram(...)`
before ABG runtime execution, not by F_P prompt memory, downstream-local scans,
or MCP-shaped context.

Prime law confirmation: the single truth surface remains
`typecheckGtlProgram(...)`; the CLI is still a wrapper over that function.
Downstream products must feed source identity rows into the ABG gate and must
not duplicate this rule locally as their own GTL conformance truth.

## Implementation Update - 2026-06-08

Updated `gtl_program_conformance.ts` source identity scanning:

- Normalizes `_` and `-` version separators before comparison.
- Rejects stale `runtime://abg/<version>/...` URI identities.
- Rejects stale `runtime://abg-<version>...` path identities.
- Rejects stale `abg://<version>/...` graph/policy identities.
- Rejects exact stale `@abiogenesis/...@<version>` package identities against
  `abiPackageVersion`.
- Emits deterministic `source_identity` issue rows from the programmatic gate,
  preserving the full stale URI/package token in the issue message.

Added regression coverage in
`test_t150_gtl_program_conformance_tool.test.mjs`:

- `T-152 GTL program typechecker rejects stale ABG URI and package identity forms`

Proof:

- `npm run test:t150` passed 23/23 on 2026-06-08 after the scanner update.

## Bug Triage - 2026-06-08 Target-Carrier Contract Rows

Finding: downstream conformance could pass a lossy target-carrier row that
identified the vector and target asset type but omitted the contract fields
used by runtime admission. That allowed a downstream product to keep effective
target-carrier law in local parser/admission code while ABG certified only a
summary row.

STDO triage: `realization_refactor` inside this active T-152
`requirement_reprice`, with a successor requirement consolidation filed as
T-153. T-152 already requires the ABG-owned programmatic gate to admit graph
assets, target-carrier contracts, prompt assets, plugin contracts, and
downstream graph assets. The realization was under-specified because it did not
force target-carrier contract law to be visible in the admitted program
inventory.

F_D/F_P classification: F_D. The defect is deterministic structural admission
of program inventory. It must be caught before ABG runtime execution by
`typecheckGtlProgram(...)`, not by F_P review context or SDLC-local parser
conventions.

Prime law confirmation: the single truth surface remains
`typecheckGtlProgram(...)` and its raw-input admission function. Target-carrier
rows must carry visible contract declaration fields: contract digest, template,
output surface, carrier family, envelope, fixed protocol fields,
worker-fillable fields, literal domains, schema, admission, payload ledger,
assurance, handoff projection, construction template, replay digest,
materialization policy, and closure precondition refs.

T-153 follow-up: T-153 tracks the constitutional consolidation of GTL as the
contract-law API and graph algebra. The requirement home is now
`specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`. This T-152
fix is the ABG conformance gate realization; T-153 is the REQ/Product reload
surface that prevents future reviewers from reconstructing this law from
implementation code.

## Implementation Update - 2026-06-08 Target-Carrier Contract Rows

Updated `gtl_program_conformance.ts` target-carrier admission:

- Requires full target-carrier contract declaration fields for each supplied
  row.
- Rejects missing carrier contract digest, template, envelope, output surface,
  protocol field, literal-domain, schema, admission, ledger, assurance,
  handoff, construction, replay, materialization, and closure-precondition refs.
- Compares row `schemaRef` against the vector target schema ref, while retaining
  full target node contract projection for graph closure evidence.
- Keeps rows keyed by opaque `graphFunctionId`, `graphId`, and
  `graphVectorId`; display names remain non-authority.

Added regression coverage in
`test_t150_gtl_program_conformance_tool.test.mjs`:

- `T-152 GTL program typechecker rejects lossy target-carrier contract rows`

Proof:

- `npm run test:t150` passed 24/24 on 2026-06-08 after the target-carrier row
  update.

## Bug Triage - 2026-06-08 T-153 Feature Coverage

Finding: after T-153 established `REQ-L-GTL3-CONTRACT-LAW-API` as the fast
reload authority, `typecheckGtlProgram(...)` still checked only the supplied
inventory categories. A downstream product could omit an entire T-153 capability
family from the program inventory and still receive a passing report if its
selected coverage counts matched. That preserved the same prompt/API handoff
defect at the program gate: partial caller scope could masquerade as complete
GTL/ABG conformance.

STDO triage: `realization_refactor` inside this active T-152
`requirement_reprice`. T-153 supplied the constitutional requirement surface;
this slice strengthens the ABG programmatic gate so the requirement is enforced
as deterministic F_D admission before runtime.

F_D/F_P classification: F_D. The defect is feature-coverage admission of
program inventory. It must be caught by `typecheckGtlProgram(...)`, not by
agent memory, prompt context, SDLC-local scans, or an MCP-shaped side surface.

Prime law confirmation: the single truth surface remains
`typecheckGtlProgram(...)` and `admitGtlProgramConformanceInput(...)`; the CLI
continues to call that function. Downstream products supply program inventory
and feature disposition rows, but ABG owns the T-153 feature list, requirement
trace defaults, admission issues, observed-inventory contradictions, and report
identity binding.

## Implementation Update - 2026-06-08 T-153 Feature Coverage

Updated `gtl_program_conformance.ts`:

- Added `GtlProgramFeatureCoverageManifest` with one row per
  `REQ-L-GTL3-CONTRACT-LAW-API` capability family.
- Added ABG-owned `GTL_PROGRAM_T153_FEATURE_KINDS` and default requirement
  refs for graph structure, graph algebra, operators, evaluators, rules,
  `F_*` composition, hooks, target carriers, edge closure, prompt assets,
  selection/refinement/synthesis/sub-work, module/public start, job, role,
  external tool gates, and active source identity.
- Raw-input admission now rejects missing/malformed feature manifests through
  deterministic issue rows.
- `typecheckGtlProgram(...)` now rejects absent feature rows, duplicate feature
  rows, missing required requirement refs, `present` rows without evidence,
  `not_used` rows without reasons, deterministically observed `not_used` rows
  contradicted by supplied inventory, and deterministic `present` rows with no
  matching inventory.
- The conformance report now carries the admitted feature manifest and binds
  `inventoryDigests.featureCoverageManifest` into `inventoryDigest` and
  `reportRef`.
- The public contract index exports the feature manifest types and the ABG-owned
  feature-kind constant.

## Implementation Update - 2026-06-09 Design-Method And Proxy Observation Fix

Updated `gtl_program_conformance.ts`:

- Added `GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS` as the ABG-owned owner
  map for T-153 feature rows.
- Feature manifest admission now rejects caller-spoofed `ownerClassification`
  values that do not match the ABG-owned map.
- Removed proxy observation of `hook_boundaries` from target-carrier rows.
- Removed proxy observation of `f_star_compute_composition` from plugin rows.
- Restricted present-without-inventory and not-used-contradiction checks to
  feature families with first-class deterministic observation in this slice.
- Collapsed duplicate expected/report coverage count shapes into one
  `GtlProgramCoverageCounts` carrier with stable public aliases.

Added design-method boundary assets:

- `M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md`
- `M03_GTL_PROGRAM_CONFORMANCE_GATE_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03-engine-kernel.yml` now names the GTL program conformance surface,
  programmatic interfaces, invariant, and test obligation.

Added regression coverage:

- `T-152 GTL program typechecker rejects caller-spoofed feature owner truth`
- `T-152 GTL program typechecker does not infer hooks or F-star composition from unrelated rows`
- `T-152 GTL program typechecker leaves same_object as manifest-only until a first-class carrier exists`

Added regression coverage in
`test_t150_gtl_program_conformance_tool.test.mjs`:

- `T-152 GTL program typechecker requires a complete T-153 feature manifest`
- `T-152 GTL program typechecker rejects contradictory T-153 feature disposition`
- `T-152 GTL program typechecker rejects claimed T-153 features without inventory`
- `T-152 GTL program typechecker rejects duplicate T-153 feature rows`
- `T-152 GTL program typechecker observes GTL algebra operation carriers`
- `T-152 GTL program typechecker rejects duplicate edge-closure truth for one vector identity`
- Extended report identity proof so changing a feature disposition changes
  `inventoryDigests.featureCoverageManifest` and `reportRef`.

Current non-closure: this is the feature-coverage and deterministic-inventory
admission slice. Operation-specific semantic typechecking for `compose`,
`substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, complete
operator/evaluator/rule field law, hook-precedence derivation, job/role binding
law, and external tool-gate semantics remains open in this ticket until a
normalized GTL algebra/declaration carrier is admitted or the existing carriers
are expanded enough to reconstruct those declarations without caller-owned
truth.

Narrow algebra observation now exists: the gate detects current GTL constructor
signatures for `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`,
`promote`, and `identity`, then rejects a `not_used` feature disposition when
those carrier signatures are present. This is not yet full semantic
typechecking of every algebra operation and `same_object` remains manifest-only.

Release/consumer note: this manifest gate is now part of the `4.0.0-rc.4`
source cut and still requires an immutable release snapshot plus downstream
consumer re-pin before a production graph inventory can prove through the
strengthened gate.

Proof:

- `npm run build:semantic` passed on 2026-06-08 after the feature-coverage
  update.
- `npm run test:t150` passed 30/30 on 2026-06-08 after the feature-coverage
  update.
- `npm run lint:semantic` passed on 2026-06-08 after the feature-coverage
  update.
- `npm run test:semantic` passed 751/751 on 2026-06-08 after the
  feature-coverage update.
- `npm run test:t150` passed 33/33 on 2026-06-09 after the owner-map,
  proxy-observation, and Design Module Method boundary asset update.
- `npm run lint:semantic` passed on 2026-06-09 after the owner-map and
  proxy-observation update.
- `npm run test:semantic` passed 754/754 on 2026-06-09 after the owner-map,
  proxy-observation, and Design Module Method boundary asset update.
- `git diff --check` passed on 2026-06-09 after the same update.

## Implementation Update - 2026-06-09 First-Class T-153 Inventory Rows

Updated `gtl_program_conformance.ts`:

- Added admitted row families for `same_object`, operator declarations,
  evaluator declarations, rule declarations, `F_*` compute composition, hook
  boundaries, selection/refinement/synthesis/sub-work, job bindings, role
  bindings, and external tool gates.
- Extended raw-input admission so malformed rows in every new family become
  deterministic typed issue rows rather than runtime exceptions.
- Extended normalized inventory digests so every new row family participates in
  `inventoryDigest` and `reportRef`.
- Split deterministic observation from first-class inventory backing. Existing
  GTL carrier truth can still reject false `not_used` claims, while a `present`
  feature now requires its corresponding first-class inventory rows instead of
  passing from unrelated proxy rows.
- Kept the CLI wrapper thin over `typecheckGtlProgram(...)`; the programmatic
  function remains the single rule surface.

Added regression coverage in
`test_t150_gtl_program_conformance_tool.test.mjs`:

- `T-152 GTL program typechecker requires first-class inventory for graph_algebra_same_object`
- `T-152 GTL program typechecker requires first-class inventory for operator_declarations`
- `T-152 GTL program typechecker requires first-class inventory for evaluator_declarations`
- `T-152 GTL program typechecker requires first-class inventory for rule_declarations`
- `T-152 GTL program typechecker requires first-class inventory for f_star_compute_composition`
- `T-152 GTL program typechecker requires first-class inventory for hook_boundaries`
- `T-152 GTL program typechecker requires first-class inventory for selection_refinement_synthesis_subwork`
- `T-152 GTL program typechecker requires first-class inventory for job_binding`
- `T-152 GTL program typechecker requires first-class inventory for role_binding`
- `T-152 GTL program typechecker requires first-class inventory for external_tool_gates`
- `T-152 GTL program typechecker rejects malformed first-class T-153 inventory rows`

Current non-closure:

- A downstream consumer must consume the strengthened ABG function from a
  released package and supply production graph/prompt/plugin/overlay/start/
  target-carrier inventory rows.
- A clean downstream live lane must pass against that released package.

Proof:

- `npm run build:semantic` passed on 2026-06-09 after the first-class T-153 row
  update.
- `npm run lint:semantic` passed on 2026-06-09 after the first-class T-153 row
  update.
- `npm run test:t150` passed 44/44 on 2026-06-09 after the first-class T-153
  row update.
- `npm run test:semantic` passed 765/765 on 2026-06-09 after the first-class
  T-153 row update.
- `git diff --check` passed on 2026-06-09 after the first-class T-153 row
  update.
