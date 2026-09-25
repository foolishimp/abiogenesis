# T-287 Governed Run Environment And Role Context Design

## Current MGMT03 Design Candidate

`T287-MGMT-03-DESIGN-01`, 2026-09-19: one `design_reframe` for the first full
ordinary odd_glc Hello lifecycle. Status: **candidate_ready for one independent
key design review at its freeze; accepted design-only by Executive after
`T287-MGMT-03-R01`, with no P0–P2 blockers; W01 now returns a frozen implementation
candidate for Executive disposition, with full runtime still unassessed**. Executive
`/root` owns continuation and disposition. There is no external Jim handoff.
The owner's exact correction is: “no you misunderstood, you have full executive authority to continue, only stop if we start churning or going off steel thread delivery.”

This section through **MGMT03 Return Boundary** supersedes the RC6 pilot's
current HOW, proposed territory and separate note-program witness. The original
pilot text is retained below as historical design, not a second active path.
Its binding/access/refusal/replay evidence and failed positive remain historical
facts; later source implementation does not turn that attempt into success.

The exact implementation baseline is
`candidates/T287-MGMT-JOIN-W01.n5DtgZ/subject` beneath
`/Users/jim/Library/Application Support/ABIogenesis/`, manifest SHA-256
`0101209ab91a0e020eeebd1785095f86059ffdb28900f951cacafdd95cf8228d`.
Preserve its supervision/cause and private hash-reuse deltas, 18+7 tests and one
live adapter oracle. None proves full Hello, full native supervision or release.

Authority: Product **STDO-Governed Run Environment**; Context 001–006/008;
Binding 001–006/009–019; Run 004/006/008–010; Instruction Assembly
001–006/008–014/016–020. The selected development frames are RC7
`STDO_REFERENCE_FRAME_BASELINE.md#derived-worker-frame` and
`ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration`.
One GTL -> HoG -> exact owner -> ABG -> replay path remains. The fifteen-family
5.0 boundary and all 5.1 deferrals remain. No context engine, frame interpreter,
provider registry, event/stop owner, new W2 arm or upstream semantic change is
selected. `a_c` accesses and validates structural relations; LLM actors apply
meaning. Access, response admission, semantic assessment and acceptance differ.

### Confirmed Current Owners And Delta

Current source already contains `gtl/stdo_run_environment.ts`,
`product/stdo_environment.ts`, `abg/stdo_environment.ts`, invocation admission,
role assembly, actor admission and replay. The pilot's assertion that these do
not exist is obsolete. Existing coverage includes semantic author/assessor,
C1 constructor and C2 command executor. Reuse those owners and their physical
access, exact inventory, byte-span, capability, event and replay checks.

Three changes form one increment:

1. Generalize the declaration/binding relation into data independent of STDO
   release names; keep the exact STDO cohort template/access adapter.
2. Declare role/context selections for the existing native leaf family and
   derive actor-facing field domains from the same Product validation owner.
3. Adopt that environment in odd_glc's existing generic lifecycle publication
   and pass its resources through the existing installed Public setup.

Confirmed gaps: `isStdoRunEnvironmentDeclaration` permits only RC6/RC7;
`stdoSourceInventory` knows the STDO installed-manifest format; the generic job
prompt serializes `predecessors: input.assets`; Requirements domain restrictions
and Design's exact binding/coverage checks are not fully disclosed. The current
odd_glc `src/native-lifecycle-declarations.mjs` selects no run environment.
The old static semantic-stage path and the ordinary `semantic_job` path remain
different carriers; fixing only the former cannot qualify this increment.

### One Minimal Declaration And Binding Contract

Use the existing three environment files; no parallel environment subsystem.
Publish a generic `RunEnvironmentDeclaration` constructor and one canonical
`ModulePublication.runEnvironments` collection selected by
`policies["abg.run_environment"]`. Selection is exact and local to the selected
Program publication; borrowed leaf declarations still resolve through existing
publication closure. Non-adopters require no corpus or Python. Dual old/new
policy or collection adoption is refused, not resolved by precedence.

The generic declaration contains only these relations:

| Data | Contract |
|---|---|
| Identity | `kind: run_environment_declaration`, schema version, declaration ref; canonical digest binds all contents. |
| Dependencies | Named immutable basis/record refs and digests; complete declared member inventories with relative paths, file/symlink identity and digests; Context members retain existing `ContextDeclaration` refs, byte counts and source bindings. Record-format validation belongs to the selected Product adapter, not generic GTL. |
| Access | Finite named required accesses: exact implementation/release/inventory, supported operation/output contract, declared inputs, finite time/output bounds, and required source/member selections. Empty tool access is lawful for an exact-byte-only generic fixture, not for the STDO template. No arbitrary command or dynamic provider lookup. |
| Roles | Exact `graphFunctionRef`, `programLocusRef`, native role, frame refs, policy ref/text/digest, access refs, required Context source spans, and identified context policy. One row for every reachable supported F_P leaf, none for an unrelated leaf. |
| Context policy | Closed selectors over admitted source, predecessor stages/semantic fields, active bindings, current candidate, worksite observation and evidence; identified/digested declared data, never a script, arbitrary JSON query or semantic relevance model. |

Keep `constructStdoRunEnvironmentDeclaration` as the STDO template entrypoint;
its successor returns this generic declaration from exact cohort data. It
requires the STDO source release manifest, released Representation program/map,
released Axiom Indexer inventory/CLI contract and explicit host executable
basis. It verifies their structural relation before publication and again at
physical observation. It does not grant access or admit runtime truth.
STDO record decoding stays in `product/stdo_environment.ts`; remove its use as
a generic GTL/ABG source-type restriction. Generic ABG checks declaration,
observed bytes/inventories, authenticated implementation/input/output and
capability equality, not STDO applicability. No RC6/RC7 generic allowlist.

Illustrative data, not a runnable declaration or allocated hash:

```text
Program.policies[abg.run_environment] = environment://odd-glc/native-lifecycle/rc7
environment.roles[requirements-author] = {
  graphFunctionRef: graph-function://odd-glc/generic-lifecycle/requirements@5,
  programLocusRef: locus://odd-glc/generic-lifecycle/requirements/author@5,
  role: author,
  frameRefs: [stdo://releases/v2.5.0-rc.7/standards/STDO_REFERENCE_FRAME_BASELINE.md#derived-worker-frame],
  policy: {policyRef, text, digest}, accessRefs: [access://odd-glc/rc7/exact-corpus],
  sourceBindings: [exact Worker, requirement-method and applicable specialist spans],
  contextPolicy: {policyRef, source: full, predecessors: declared_stage_semantics,
    contracts: owner_derived, worksite: not_required, evaluationData: excluded}
}
```

All example symbolic slots become actual exact values before package freeze.
Frame membership is structural; the declaring Product/authorized actor selects
applicability. Missing coverage or a required span/body blocks. Neither a
locator nor a semantic summary replaces inaccessible required content.

The closed selector algebra is `full_source`, `declared_predecessor_semantics`,
`active_binding_semantics`, `current_candidate`, `current_worksite`,
`admitted_execution_evidence`, `assessor_evaluation_data` and explicit
`not_required`. Its input types are the already admitted native carriers;
its output is either exact selected values with source coordinates or a typed
gap. It introduces no wildcard search, ranking or recursive policy language.
Source spans include complete owning sections/rows and any explicitly required
support, not a byte budget's prefix. Repeated identical source spans render
once with multiple dependency refs; omission never hides a distinct obligation.

For the first declaration, raw-source routes are explicit. All actors receive
their complete selected Worker or Reviewer section, plus
`SPEC_METHOD.md#constitutional-chain` and `#probabilistic-work-boundary`.
Intent/Product add `SPEC_METHOD.md#reconstruction-litmus`; Requirements add
`#requirement-categories` and `#reconstruction-litmus`; Design and C1 add
`#design-rule` and
`DESIGN_MODULE_METHOD.md#decision-complete-symbolic-design`; Evidence and C2
add `SPEC_METHOD.md#proof-target-identity-and-adequacy-stdo-up-001` and
`#semantic-evidence-and-projection-separation-stdo-up-008`. Those paths resolve
under the exact RC7 `standards/` root. Each role also selects its applicable
Product/Design/Effect/Proof row from
`STDO_REFERENCE_FRAME_BASELINE.md#derived-generic-specialist-frame-set`, with
that section's boundary text. The native stage task/rubric fixes the exact
local outcome; framework roles do not replace it.

The two existing odd_glc `assetSurface.standardsRefs` also resolve to exact
frozen local Context source spans: generic lifecycle meaning and requirements-
algebra consumption clauses. Supply the selected applicable generic clauses,
not an unresolvable relative path, historical capability names as new authority,
or illustrative Hello examples as solution assistance. The owning consumer
publication freezes these source identities independently of the runtime STDO
release. Its declaration holds refs/digests, not the job or hidden oracle.
Changing those source bytes requires explicit new declaration/binding; the
mutable sibling checkout is never consulted during replay.

### Exact RC7 Access And Runtime Dependency Decision

ABI development selects `stdo://releases/v2.5.0-rc.7/`, source-manifest SHA-256
`1f56029380604b0879fe322047fa8b38060297ba86b54bc8db8450d01ec034ae`.
Runtime adoption declares that same exact external cohort independently.
odd_glc's source-development RC4 Product Definition is unchanged; runtime RC7
adoption is not a method migration. Do not copy or edit external Product bytes.

Current RC7 has four indexes: two Executive indexes and T009 complete-update
Worker/Reviewer indexes. None declares ordinary Hello lifecycle applicability.
Do not reuse their names as if they did, author another map, or start a
Representation release project. Select the existing released `a_c validate`
operation with `--program`, invocation-local `--bindings`, and `--emit-map`
to a new file in the already authorized temporary-support directory. Stdout is
the validation report. Compare its valid status, exact program digest and
resolved source digests; compare the emitted map's complete canonical value
and self-digest to the exact released map. Preserve stdout and emitted-map
bytes with process/input/output identities. Missing or different map/source
bytes refuse. This uses the released tool's map construction, never an ABI
reimplementation. The explicit adapter output contract is the pinned released
`ac.py::report`/`instantiate` contract, bound by executable and companion
inventory digests, not an invented upstream version label. Specifically the
owner consumes `axiom-indexer.validation-report` schema 1: `program_uri`,
`program_sha256`, `resolved_sources`, `status` and empty `diagnostics`; it also
consumes `axiom-indexer.logical-constraint-map` schema 1 from `--emit-map`,
checking the complete value against the declared released map. Counts are
informational, not acceptance. This proves actual structural corpus access,
source resolution and map freshness by the selected tool. It proves neither
selected-frame retrieval nor applicability nor semantic application.

Required role/task laws are delivered as declared exact source spans from the
verified source Context; any required axiomatic row is also a declared exact
member/span, not an inferred closure. The tool report/map are admitted access
evidence, not role instructions or permission. Unneeded full map, report and
complete-update scope text do not enter actor context. The manifest preserves
their evidence refs/digests and `omitted_not_required` body disposition. This
is explicit whole-corpus structural-access evidence plus independently exact
source-span retrieval by the Product observation owner, not a claim that the released map
contains a task-specific index or that `validate` judges semantic correctness.
Existing `project` remains a supported exact adapter operation for declarations
whose selected indexes really apply; it is not the Hello selection.

**Python runs at runtime for this adopting environment.** The resource assertion
supplies an explicit canonical `pythonPath` plus exact executable digest bound
by the declaration; record reported version and the declared supported Python
runtime contract during preparation. The selected released entry is a
Python 3 CLI; no upstream supported-version range was found in its installed
output contract. Bind one exact tested Python 3 executable/version from the
verified preparation cohort and retain the tool's successful structural check;
do not invent a broad compatibility promise or use PATH discovery. This exact
host runtime selection is a setup input frozen before implementation proof,
not an ambient dependency or a new Product version policy. Missing/incompatible runtime refuses
before dependent dispatch. No installer, download, vendoring, port or fallback
is selected. The generic exact-byte fixture uses no process/runtime dependency.
The physical owner keeps the existing fixed argv/no-shell mechanics, finite
bounds, confined temporary support and visible cleanup failures. Permission
must cover the selected `validate` operation and emitted temporary map; the
old project-only permission does not authorize it implicitly.

### Native Leaf Family And Explicit Role/Stage Mapping

Consolidate the existing `stdoRoleForDeclaredLeaf` relation as one
`nativeContextLeafFamily` projection, consumed by declaration validation, HoG
basis construction and assembly. It is a closed table over existing declared
implementation/input/output identities and stage roles, not a registry or new
work selector. HoG still selects the actual C leaf. No new arm is needed.

| Existing actual call | Declared actor frame and native posture | Required context |
|---|---|---|
| `generic-lifecycle/{intent,product,requirements,design,evidence}@5`, each `/author@5` locus | `author`; RC7 Worker plus selected task-family source spans; closed prompt | Complete original source and task; declared predecessor semantics; owner-derived author domain. Design adds current inventory and active binding coverage. Evidence adds actual artifact/command evidence, never hidden evaluation data. |
| Same five functions, each `/assessor@5` locus | `assessor`; RC7 Reviewer plus corresponding task-family spans; closed prompt | Same governing source/predecessor meaning, exact current unassessed candidate, ordered rubric and current-candidate reference domain. Evidence assessor alone receives independent evaluation data. |
| `WORKSITE_CONSTRUCTION_IDS.graphFunctionRef` / its existing candidate locus | `constructor`; RC7 Worker plus applicable Design/Effect source spans; closed prompt | Assessed Design, complete governing source, selected targets, active paired obligations, current replacement preimages and declared dependencies. Returns replacement bytes only. |
| `WORKSITE_COMMAND_EXECUTION_IDS.graphFunctionRef` / its existing command-execution locus | `command_executor`; RC7 Worker plus Effect/Proof source spans; `worker_executes` | Exact admitted command task, executable/cwd/env/time/write bounds, snapshot inputs and required observations. No Reviewer authority merely because commands run tests. |
| Existing intake/context/plan/parent/bridge/publication/evidence-input/terminal F_D leaves | No F_P frame or prompt | Existing deterministic input/effect contracts; no unnecessary actor dispatch. C0 alone performs the declared application writes and admits successor observations. |

The five stage names/loci above come from odd_glc's current publication factory;
C1/C2 refs come from installed exported identities, not copied string guesses.
Author and assessor remain native semantic actors; engagement-frame application
does not create an Executive runtime role. No frame text confers effects.

### One Owner-Derived Actor Contract And Context Projection

Add pure `projectSemanticJobActorContract(envelope, stageRef, role, retainedTerms)`
in `product/semantic_job.ts`. It returns contract identity, eligible sets,
cross-field obligations and typed issue data from existing validation relations.
Refactor `deriveSemanticJobAsset`, `deriveSemanticJobAssessment` and
`semanticJobDesignMatches` to consume that same relation. Assembly renders its
result, not private copies of rules. Existing boolean/null compatibility helpers
may wrap the detailed result; native refusal evidence carries field/path,
expected domain/rule and actual mismatch without an expected semantic answer.

The contract exposes at least:

- `asset.statements[].requirementRefs` and `obligationRefs`: incoming grounded
  requirements (including expressly retained terms) and active assessed
  obligations only; never same-response candidate IDs. At first Requirements
  those sets may be empty: `[]` is lawful, invented future runtime IDs are not.
- `predecessorStatementRefs`: incoming admitted statement IDs only;
  `requirementCandidates[].parentRequirementRefs`: incoming grounded terms.
  Quote rules preserve exact unique original-source spans and member identities.
- `bindings[].requirement`: explicit `candidate` same-response candidateRef
  versus `existing` incoming requirementRef; installed template set;
  `previousVersionRef`: null for a new requirement binding or its exact active
  version. Candidate refs are structurally checked after the response; their
  values are not guessed by the pre-dispatch contract. Only satisfied separate
  assessment activates the binding.
- Design: every grounded requirement needs an active binding; every active
  obligation needs both an implementation target and a verifier target. Each
  target's `bindingVersionRefs` is exactly the active versions selected by its
  `obligationRefs`, not an arbitrary subset. Expose allowed roles, path/root
  rules, target/command bounds, command and nested-launch capabilities,
  dependencyPaths/readRoots and readiness-versus-fulfillment distinction.
- Assessor: only the current candidate's statements are eligible for
  `criteria[].statementRefs`; exact rubric order and one outcome per criterion;
  empty citation lists are lawful where no statement is cited. No author
  evaluationData, expected disposition or oracle reaches the candidate writer.

The Design author (sole `worksite_design` capability), ordinary or authenticated
revision, returns the closed `semantic_job_design_response` transport form. Only its
typed reference fields use zero-based integer selections: statement/pressure
requirement refs select `actorContract.requirementRefs`; statement/target
obligation refs select `obligationRefs`; predecessor statement refs select
`predecessorStatementRefs`; quote member refs select `sourceMemberRefs`; target
binding versions select `design.active` by `versionRef`. These ordered domains
are bound to the exact admitted input and actor-contract identity. For a revision,
rendering and expansion use its current envelope, expressly retained terms and
current command limits through the same actor-contract projection; the ordinary
current-only domain cannot substitute for that revision domain. The Product
materializer accepts the declared envelope, never a caller-supplied domain. Empty
domains require empty reference arrays; malformed or out-of-range selections
are refused. The author retains every reference choice and its order.

The Product-owned materializer expands those fields into the unchanged
`semantic_job_asset_candidate` before the ordinary canonical candidate
relation. Statements, pressure, exact quote text, paths, roles, instructions,
commands and arbitrary predicate payloads remain authored data; property names
inside arbitrary payloads never trigger expansion. Requirement candidates and
binding proposals remain empty for this Design-only form. No target, coverage
choice, disposition or semantic meaning is inferred. Raw response structural
validation is distinct from input-bound expansion and canonical admission.
Independent assessors receive the complete canonical candidate. Other stages,
assessors and legacy non-job revisions retain their existing raw forms; historical canonical
candidates, Public output and replay relations remain unchanged. Native
transport failure cannot be salvaged through this materializer.

Context projection is deterministic selection over this contract plus the
declared stage dependencies. For each predecessor retain asset/stage/digest and
assessment disposition identities, complete semantic statement/requirement/
pressure/design bodies actually required, active binding identities and their
meaning. Omit transport source envelopes, repeated embedded observations,
historical inactive binding bodies and duplicated assessment evidence unless
the selected contract requires them. Do not summarize semantic content. The
assessor receives the full current candidate; the original source remains full.
Stage declarations currently require all their predecessor stages; preserve
that meaning, even where it costs context. Compression is no permission to
drop source, unresolved pressure, direct dependencies or original rubrics.

Every selected item has a source ref/digest, field/span selector and disposition
in the immutable assembly envelope/manifest. Both admitted runtime input and
selected-view digests are retained: adding unrelated input may change the
input digest without changing prompt content or selected-view digest. Prove
context invariance, not whole-manifest equality. Bounds refuse, never truncate.
No actor-side filesystem fallback exists on closed-prompt calls.

Design uses the admitted `generic-lifecycle/context` observation before Design;
pre-dispatch checks currentness against the same stable WorkspaceBinding.
C1 uses admitted target/dependency preimages; C0 supplies successor observations;
C2 consumes its actual snapshot. Evidence uses admitted post-execution artifacts
and observations, labels the pre-Design inventory historical, and must not
relabel it as current. A relevant physical change requires existing observation
refresh/re-entry before dependent dispatch; a private read cannot repair stale
evidence. Keep candidate/unassessed work and prior observations intact. Broad
partial-result reuse and selected correction execution remain MGMT05, not a
condition silently weakened to get Hello through.

### Existing Owner Join And Public Ingress Disposition

1. Exact public verify/resolve/install/bind/catalog admission supplies immutable
   owners and workspace coordinates. Ordinary input is job data, not an
   environment declaration or pre-authored solution.
2. `prepareProductRunInvocation` resolves the Program/publication, raw input,
   authority and capabilities. The environment resource assertion contains only
   physical locators and explicit permission, never ready-made access results.
3. The existing Product observation owner verifies declared exact dependency
   bytes and permission, executes the pinned access contract, and returns
   observations. ABG admits environment/access evidence in the same invocation
   transaction before any dependent work. No implicit upgrade or second Run.
4. `hog/ccall_lifecycle.ts::evaluateExecutableCCall` derives the already selected
   leaf's native basis. Assembly joins its role row, admitted access, current
   input, owner-derived field contract and declared context policy.
5. Existing actor admission rederives plan/envelope/manifest and request equality
   before dispatch. Native response validation, distinct assessment, ordinary
   Consequence, C0 effects, closure and replay retain ownership.

The eleven Public-start slots are not an unresolved external handoff. Their
current derivation/validation owners are explicitly retained:

| Slot | Existing derivation / checking owner |
|---|---|
| `workspace_binding` | Public bind receipt; exact-prefix workspace projection; `authorityMatches`. |
| `product_set` | Admitted install receipts/exact-prefix installs; `authorityMatches`. |
| `dependency_lock` | Public resolve and bound lock; `authorityMatches`. |
| `catalog_scope` | Admitted catalog/view/allowlist; resolution plus `authorityMatches`. |
| `execution_program` | Exact catalog-selected Program/digest; `authorityMatches`. |
| `graph_function` | Existing resolution/membership; null for this `target: next` Program start, exact identity for callable entry; `authorityMatches`. |
| `input_contract` | Resolved declared input contract plus raw admission, exact Public request/slot checks; no harness-minted admitted input. |
| `session_policy` | `constructRootInvocationPolicy` rederived by run preparation; `authorityMatches`. |
| `capability_grants` | Existing `constructCapabilityGrant` over fixed packet/admitted install/binding; run preparation rederives and checks exact set. |
| `actor` | External resolved trusted-developer actor, workspace authorized actor and `constructInvocationAuthority`; exact attribution check. No STDO role grants actor authority. |
| `transport_steering` | Exact existing event-resource/close-handoff assertion digest; `authorityMatches` and event-resource admission. |

`verification_references` and `execution_basis` remain null/forbidden as the
fixed start definition requires; they are not extra caller authorities to mint.
Install/bind operation identity stays with the selected installed Public
definition, fixed Product source packet, owner artifact/definition digests and
admission-capability construction/validation in the existing install/environment
owners. The runner submits Public calls; it cannot invent install/bind events.

These are implemented owner routes, not a claim that all their negative cases
are qualified. MGMT03 must prove exact positive equality and one crossed
operation/authority-coordinate refusal before dependent effects. Wider identity
matrix, external authentication and multi-principal qualification remain held;
complete ingress authority qualification is not claimed by context integration.
Binding 006's external authentication boundary is unchanged, not waived.

### Compatibility, Event Evidence And Replay

New source selects only the canonical generic collection/policy. Preserve the
existing old STDO declaration/evidence decoding for exact historical contracts;
it is not a competing live selector. An old pilot source Program may execute
only under its original supported contract/executable, or be explicitly
republished/rebound through the new constructor. Do not mutate its declaration,
retarget its Run or silently normalize its stored digests into the new form.

The new invocation payload uses `runEnvironment`; extend only existing
`invocation_admitted` variants and existing native validation/reconstruction.
Use one successor current descriptor
`abg.event-contract.root/p5-run-environment-role-context@1`; derive its digest
from the actual canonical descriptor, never prose. L remains byte-exact. The
retained accepted candidate retains its original p4 replay executable; this
fresh p5 Hello does not qualify a p4-to-p5 in-place migration. Unknown old
current-profile digests visibly refuse rather than being relabeled. No profile
registry, event kind, storage migration or history rewrite is introduced.

Prompt plan/envelope/manifest bind the generic environment, actual native role,
frame/policy/access identities, owner-contract projection, selections and
included/omitted content. `abg/replay.ts` projects these from authenticated
invocation/actor-binding events. Fresh CLI result/replay plus the existing
installed public ABG SDK exact-prefix/semantic replay reader must reproduce
the same joins with corpus/tool paths unavailable and without a new retrieval.
The CLI's current summary does not magically expose all ownerFacts; retain the
SDK-to-CLI prefix identity join for this detailed proof. Missing evidence is a
typed defect, not an empty context. Access reuse is invocation/basis scoped;
cross-Run caching is unselected.

### Bounded Implementation Territory And First Proof

This is the grant requested after the single key review, not an active write
grant. Relative ABI paths are under `build_tenants/abiogenesis/typescript/`:

- `code/src/gtl/{stdo_run_environment,contracts,canonicalization,index}.ts`:
  one generic declaration, explicit template, native-leaf family and exports.
- `code/src/validator/validation.ts`,
  `code/src/owner_bindings/run_invocation.ts`,
  `code/src/product/{stdo_environment,run_invocation_operation,index}.ts`:
  raw schema/closure, physical exact access/template adapter and resource join.
- `code/src/abg/{stdo_environment,invocation_admission,invocation_execution_truth,instruction_assembly,actor_process,event_store,event_contract_profiles,event_prefix,replay}.ts`:
  generic evidence and exact profile/admission/assembly/reconstruction joins.
- `code/src/hog/ccall_lifecycle.ts`,
  `code/src/product/semantic_job.ts`: shared native-family basis and the single
  contract/context projection consumed by both validation and assembly.
- Existing `test_env/tests/t287-stdo-run-environment.test.mjs`,
  `test_env/tests/t287-stdo-run-environment-installed.mjs`,
  `test_env/support/stdo-environment-pilot.mjs`; new bounded
  `test_env/tests/t287-management-context.test.mjs` and its named fixture folder.
  Existing source/semantic-job tests affected by the new export need an exact
  additional path grant before edits; do not expand territory by inference.

One corresponding odd_glc Worker grant is needed for only
`build_tenants/odd_glc/typescript/src/native-lifecycle-declarations.mjs`,
`test/full-sandbox-declarations.mjs`, `test/full-sandbox-support.mjs`,
`scripts/full-sandbox.mjs` if argument plumbing requires it, and one named
structural fixture/test. The current Writer has read-only access there.
The publication constructor accepts exact environment data as configuration,
never a job or oracle. The same builder publication serves both ordinary jobs.
No odd_glc Product Definition migration or new lifecycle topology is requested.

Build/package/install only in a new isolated candidate copied from the accepted
join. Generated contracts/profile/manifest/build outputs are confined there;
do not run the destructive canonical build or edit dependencies, version or
lockfiles. Preserve the accepted 25-test/probe subject separately. A necessary
unnamed source, Public semantic contract or runtime-effect change returns to
Executive before mutation.

Cheap structural readiness, before any paid actor:

1. All twelve actual F_P loci resolve once to the family/role/environment;
   missing/mismatched role, source span, permission or access output refuses
   before dispatch. An F_D leaf never gains an actor call.
2. Minimal non-STDO exact-byte constitution (one source, role and policy)
   traverses the same declaration, physical binding, admission and assembly
   owners without Python, STDO IDs or an engine release allowlist. This proves
   genericity only, not a second supported constitutional Product.
3. Wrong source/member/map/runtime executable digest and absent Python refuse;
   an exact present runtime can execute the declared released access operation
   under a separately granted structural test. A plausible supplied receipt
   cannot bypass actual observation.
4. Add unrelated corpus/workspace material outside declared selected
   dependencies: included context/selected-view digest remains unchanged.
   Mutating an immutable dependency itself instead correctly refuses. Change
   a relevant workspace file: stale input blocks; an admitted successor view
   supplies new bytes under unchanged workspace authority and binding.
5. Naive Requirements responses use empty incoming domains, same-response
   candidate bindings and varied candidate IDs; illegal same-response use in
   incoming-only fields yields a named domain error. Test a legitimate
   existing binding supersession and wrong previousVersionRef.
6. Naive Design variations add/reorder lawful configuration files and target
   names without fixed Hello layout; accept equivalent valid coverage. Missing
   verifier target or wrong active binding-version set gives the exact shared
   rule/path rejection. Assessor predecessor citations refuse; empty current
   citation is allowed. Neither repair inserts an expected answer.
7. Replay regenerates the actual selected prompt bytes/digests without live
   filesystem/tool access. Prior prompts remain unchanged. Accepted supervision
   and hash-reuse deltas remain in the composed candidate and their focused
   checks remain applicable; no unrelated requalification campaign.

Then use the existing sunny-day runner, not a separate note or Requirements
probe. From odd_glc's TypeScript tenant, under separate implementation/setup
and paid grants:

```sh
node scripts/full-sandbox.mjs prepare /absolute/frozen-candidate-basis.json /absolute/new-empty-resource-root
ODD_GLC_ALLOW_FULL_SANDBOX_LIVE=1 node scripts/full-sandbox.mjs run /absolute/new-empty-resource-root/jobs/basic-cli/prepared.json
node scripts/full-sandbox.mjs read /absolute/new-empty-resource-root/jobs/basic-cli/prepared.json
```

`prepare` reuses installed Public verify/resolve/install/bind/catalog/conformance
and produces both ordinary input records; only `basic-cli` launches in MGMT04.
Supply exact environment resources/permission in that prepared start. Its
ordinary source and independent oracle remain external to generic builder
bytes; preserve source digest before launch. The runner's existing two-hour
process timeout is not a grant: the activation prospectively selects a finite
whole-run envelope, twelve actor attempts, explicit model/xhigh, output
preservation and stops, with no automatic retry. Do not run these commands in
the design activation.

MGMT04 needs actual Intent/Product/Requirements/Design author-assessor pairs,
current context, assessed binding/Design, C1 byte return, C0 publication, C2
worker-executed real verification, Evidence author/assessor, native closure
and fresh installed result/replay. Preserve all twelve requests/responses and
their environment/policy/current-view identities, exact application artifacts,
actual commands/predicates, cause/time observations and independent application
assessment. A shape check, clean refusal or access success alone is not the
full Hello positive. Failure returns the first evidenced cause and retained
state; it does not authorize another attempt.

### MGMT03 Return Boundary

Discretionary choices are the generic declaration in the existing files, raw
source-role delivery plus released `validate`/map equality (not an unsuitable
index), exact-byte non-STDO fixture, shared Product field/context projection,
fresh p5 resource and reuse of the existing full-sandbox runner. They require
the one key design review, not a competing architecture campaign.

Residuals: actual implementation and structural evidence; full Hello; integrated
supervision and wider native-cost evidence; MGMT05 correction/partial reuse;
MGMT06 non-Hello job; full ingress negative matrix; selected keyed-accounting
application witness; D5/D6 and human same-RC acceptance. Unsupported native
leaf families, cross-publication environment selection, cross-Run access cache,
in-place current-profile migration, broad resilience/storage/recovery and 5.1
work stay excluded. Exclusions bound claims; none permits missing mandatory
authority, context or admission on the selected path. Executive consumes the
frozen return and separately activates one independent key review, then bounded
implementation. The Writer stops here without self-acceptance.

## Historical RC6 Pilot Design — Nonoperative

The text below is retained verbatim after its former document title. Its
status, source selection, planned nonexistent files, territory, estimate and
standalone witness were written for the earlier pilot. They confer no current
grant and are superseded by the MGMT03 candidate above. Historical evidence
remains at the original linked pilot records and executable/candidate cut.

## Status And Exact Boundary

Stage A R1 successor candidate for `ABG5-ENV-PILOT-01_STAGE_A_R1`. Executive
selected local repair of two S2/P1 composition findings in the predecessor;
targeted independent recheck and Executive disposition are pending. The
predecessor and supplied review/disposition remain preserved in the pilot
records. The four requirement deltas are unchanged. This document does not authorize Stage
B, accept its own requirement changes, or claim implementation, installed
qualification, D1/D2 readiness or Product closure.

The parent contract is
[`PRODUCT.md#stdo-governed-run-environment`](../../../../specification/PRODUCT.md#stdo-governed-run-environment),
under GOAL-035 and
[T-287's course correction](../../../../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#stdo-run-environment-course-correction).
The decomposition is `requirement_reprice` plus `design_reframe`, not another
Product or feature family. The affected existing families are F02/F04/F07/F10/F17.
F08, F12, whole-run Executive oversight and native human-response resumption
retain their 5.1 boundaries.

The slice is one ordinary installed public Program invocation whose declared
STDO environment is physically resolved, whose required `a_c` retrieval really
runs through the installed owner path, whose dependent LLM calls receive the
admitted content, and whose evidence survives fresh replay. One repeatable
invocation-bound environment/access relation is the deliverable. It is not the
complete course correction.

Workspace-refresh and partial-work-reuse implementation are the **next slice**.
Existing current-observation, assessment, retained-result and invalidation law
remains operative. This slice neither weakens it nor demonstrates it. The
retired failed Runs, assessor-prompt patch and pending integrated package retain
their original exact subjects and dispositions.

## Source And Requirement Trace

| Governing relation | Owning source | Bounded realization |
|---|---|---|
| First-class, snapshot-bound Context; explicit STDO adoption | GTL Context 001–006, new 008 | Typed environment declaration selects existing Context data and immutable external dependencies. |
| Exact Program, workspace, authority, environment and capability | ABG Binding 002–005, 009–014, 016–018, new 019 | Existing public-invocation binding owners verify the declaration, resource assertions and observed access before admitting dependent work. |
| One Run and replay truth | ABG Run 004, 006, 008–009, new 010 | Environment and access are evidence in the existing invocation/dispatch event spine, not another aggregate or ledger. |
| Declared roles, sufficient content, immutable prompt and non-tautology | Instruction Assembly 001–006, 008–014, 017–018, new 019–020 | Existing native assembly adds exact environment/policy/content to its role and evidence sections; missing evidence blocks. |
| Fixed semantic-stage owner split | `T287_D1_REQUIREMENT_LIFECYCLE_DESIGN.md`, Native semantic stages and Role-scoped context | Preserve native author/assessor leaves, candidate admission, judgment and ordinary consequence. No host prompt or role-selection override. |
| Stable authority versus mutable observation | `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`, `T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md` | Pin this Run's governing dependency cut; preserve existing workspace and reuse semantics as open follow-on proof. |

Operative method is the exact RC6 basis selected by `stdo_abiogenesis.json`:
`stdo://releases/v2.5.0-rc.6/`, source-manifest SHA-256
`bed7535a5feddc5e874993ff96d1f5f27e2a0fff63f366fc3b1fec3e301dd9e0`.
The matched Representation and Axiom dependency inventories are the released
cohort selected by that Definition's composition, not copied ABI source data.
Their release records remain their owners of member identity and CLI contract.

Design evaluation uses the exact installed
`STDO_REFERENCE_FRAME_BASELINE.md#derived-worker-frame`, its
`#derived-generic-specialist-frame-set` Design/Design Component acquisition,
and `ABI5_REALIZATION_CONSTITUTION.md#53-six-frame-atlas` through the adopted
Project frame basis. The selected Representation map routes to these sources;
the stale ABI map supplies no premise. Worker self-check does not supply the
required independent review.

## Existing Owners And The Actual Gap

The live source at the activation checkpoint already provides:

- `gtl/requirement_handoff.ts`: `ContextDeclaration`, exact member inventory
  and source bytes/requirements joins. Reuse this Context shape; do not create
  an STDO-only replacement for Context.
- `gtl/contracts.ts`: `GtlProgram.policies`, `GraphFunction.environment` and
  immutable `ModulePublication` declaration collections.
- `product/declaration_closure.ts`, `catalog_operations.ts` and
  `validator/validation.ts`: unique published-owner closure and Program
  validation. Reachability and published identity, not a host directory scan,
  choose the environment.
- `product/run_invocation_operation.ts` and `owner_bindings/run_invocation.ts`:
  exact public preparation, resource assertions, policy/capability/authority
  joins and the installed owner composition around ABG admission and HoG.
- `abg/invocation_admission.ts`, `invocation_execution_truth.ts` and
  `execution_basis.ts`: admitted invocation/Program/workspace/runtime basis.
- `abg/semantic_stage.ts`, `instruction_assembly.ts` and `actor_process.ts`:
  current C-call authentication, native plan/envelope/manifest, actual prompt
  equality and transport-event admission before LLM process start.
- `abg/event_store.ts` and `event_contract_profiles.ts`: closed payload variants,
  exact profile descriptor/digest and the existing native admission validator.
  An added payload field must be declared here before it can be admitted.
- `abg/event_prefix.ts`, Event Calculus and `replay.ts`: canonical event
  validation and reconstruction, reached publicly through existing reads.

There is no current typed STDO run-environment collection, declaration-linked
external cohort resource binding, actual required `a_c` access receipt or
admitted STDO role-policy/content relation in these owners. In particular,
`standardsRefs`, installed development skills and source-file locators do not
establish that relation. The current semantic-stage LLM lane is closed-prompt
with zero tools. Retain it: the declared binding-time access owner retrieves
the corpus before dispatch and supplies its exact content to assembly. The
LLM need not acquire filesystem or command execution authority to consume it.

## Declaration And Capability Contract

Publish a reusable data constructor/template from the installed GTL export,
`constructStdoRunEnvironmentDeclaration`. It produces declaration data only.
Add a closed optional `ModulePublication.stdoRunEnvironments` collection; a
Program adopts exactly one member through
`policies["abg.stdo_run_environment"] = declarationRef`. No ambient/default
adoption or fallback from a missing ref is permitted. A non-adopting Program
keeps its existing behavior and does not require STDO resources.

For this slice the selected declaration is co-located in the Program's exact
owning publication. The template is reused as data in that publication, not
through a new catalog target. Cross-publication environment lookup is not
selected; an unresolved local selection refuses rather than scanning other
publications. Existing cross-Product implementation ownership is unchanged.

The first declaration has one identity/digest and these closed relations:

| Coordinate | Required meaning |
|---|---|
| source basis | Immutable release URI and exact source-manifest digest; the exact standards member inventory remains sourced from that manifest. |
| representation basis | Immutable Representation Product/release identity and complete published-member inventory digest, plus exact axiomatic-program and map members, byte digests and their declared semantic identities. File digest and the program/map's canonical self-digest are distinct coordinates. |
| access implementation | Exact released Axiom Product identity, complete member inventory, executable member/digest and supported CLI/output-contract version. A Python executable is separately identified host mechanics, not the Axiom Product identity. |
| contexts | Existing `ContextDeclaration` values for required source/policy members, with exact locators, member refs, byte counts, digests and inventory digest. These bytes are constraints/input, not grant or judgment. |
| required access | Named access selections over the declared exact program/map: explicit duplicate-free, URI-sorted `frameIndexRefs`, `mode: materialized`, the permitted `a_c project` operation and declared finite output/time bounds. No inferred selection. |
| role policy | Exact GF/C-locus and semantic role, source-owned frame refs, identified instruction-policy text/ref/digest, selected access refs and required Context source bindings. A source binding uses the existing exact member plus half-open byte span/span-digest relation; no prose-based slicing or inferred summary. Coverage must be complete for the selected dependent leaves. |

The template is reusable without embedding ABI's mutable source path. The pilot
instantiates the Definition-selected RC6 cohort. Another basis is neither an
automatic upgrade nor assumed compatible: its complete declared dependency and
output contract must be supported and independently selected before use.

The complete typed companion inventories and their immutable release-record
URI/content identity are declared from the independently verified release
record. The current companion payloads do not contain their release record.
Carry that exact record as external dependency evidence in the invocation
resource set, not a mutable-source or network lookup. Verify its declared
digest and the selected record-to-inventory relation, then every installed
member and symlink target; a caller-authored alternative inventory is not a
released basis. The source Product's installed `manifest.json` is verified
directly against its declared digest. No companion is repackaged or edited.

Raw admission and whole-Program validation reject duplicate/dangling refs,
ambiguous publication owners, missing required role rows, conflicting Context
members, unknown operations/modes and a declared access selector absent from
the exact map. Validation decides structural coverage, not whether a selected
frame or policy is semantically appropriate for the task. That judgment remains
with the declaring Product and its required assessment. Supporting clauses and
residuals are not relabeled as frames.

The public invocation's existing owner resource assertion gains one optional
closed `stdoEnvironmentResources` member. It supplies external installation
locators and explicit permitted access, not a declaration or a successful
result. Bind its capability to the exact actor, existing invocation authority,
Program/environment digest, named read-only dependencies and fixed operation.
The existing run-invocation authority/policy grant must cover that exact
selected Program and this declared dependency-observation use; the caller must
also explicitly supply the matching access permission. A locator alone, GTL
adoption alone or a generic ability to spawn processes is insufficient.

This is a narrow resource-capability binding within existing invocation
authority, not a new public capability-grant service or public operation.
External authentication and physical OS access retain Binding 006 ownership.
The installed owner validates the resolved assertion against the admitted
actor/authority and declared scope; it never treats an arbitrary assertion as
an ABG event. The assertion cannot contain a ready-made projection, output
bytes, observation receipt, alternate executable implementation, role text,
selected frame or revised expected digest. Existing Public input and authority
slots remain controlling; no second mintable approval or process-local grant
registry is introduced.

The access binding is a restriction/projection of that existing authority plus
the actor's explicit resource permission, never another approval. The closed
permission names the same authority ref/digest and actor, environment
ref/digest, exact installation roots, `project`-only read scope and one
temporary-support directory beneath the existing authorized archive root.
Equality and subset checks against those declared coordinates are total.
Scope mismatch or absent explicit permission refuses before physical access;
GTL declarations cannot manufacture the missing permission. No arbitrary
command, environment-variable override or widened read/write root is accepted.

The external STDO installs remain external Products. They are not relabeled as
ABI `ProductInstall` packages, installed by the pilot, or inserted into a
stable `WorkspaceBinding` merely because they are read. Their exact resources
are invocation-bound declared Context dependencies. A changed dependency basis
requires environment re-entry; ordinary worksite content changes do not.

## One Existing-Owner Admission Route

The installed `run.invoke` owner composition performs this dependency cone:

1. Prepare the exact public invocation through Product resolution and its
   existing authority checks. Resolve the environment only from the selected
   admitted Program/publication closure. Check the explicit resource/access
   assertion against that declaration and invocation authority. For an
   adopting Program, missing required resources refuse here.
2. Through the Product-owned dependency-observation helper, resolve the supplied
   install roots and verify complete Source/Representation/Axiom released
   inventories, exact member bytes and all declared Context/policy members.
   Refuse mismatches before invoking `a_c`. Never search a sibling checkout,
   mutable selector, PATH for `a_c`, download, install, update or rewrite maps.
3. Execute the exact declared `a_c project` from its verified Axiom install.
   Use native argument-vector process mechanics, no shell or LLM tool lane.
   Invocation-local URI bindings resolve only the selected installed source.
   A bounded temporary bindings file is an owner-created physical support
   artifact, outside all immutable installs and task content. Its creation and
   cleanup are included in the permitted resource operation; failure is visible.
   Omit `--output` entirely: even `--output -` names a file in this release.
   Preserve the complete stdout bytes, exit code, input/dependency digests,
   argument vector, process/implementation identity and bounded failure data.
4. Check the released output contract, canonical projection digest, exact
   program/map/source identities, requested index set, declared materialized
   closure and resolved source digests. Retain qualifications, conditions,
   exceptions, ordered argument relations and residual routes unchanged. Check
   exact declared source-span bytes for any required role-policy/source
   re-entry not materialized by the projection, against the complete verified
   member. Exit zero or parseable JSON alone is not
   success. The helper does not evaluate a premise, apply an axiom or infer
   task applicability. It uses the released tool instead of reproducing it.
   ABI checks the output contract, internal byte/ref joins and the authenticated
   tool/input/selection relation; it does not reimplement `a_c` validation,
   map instantiation or closure construction as a parallel algorithm.
5. ABG validates the observation/declaration/capability joins and admits the
   complete `stdoEnvironment` evidence in the existing `invocation_admitted`
   payload and digest under the exact successor current-profile variants below,
   inside the existing invocation transaction. No Run,
   dependent C call, F_P dispatch or semantic success exists if this gate
   refuses. The access observation is physical evidence until this admission;
   a fixture-authored receipt cannot enter through the resource assertion.
6. Existing execution-basis admission and HoG traversal consume the invocation
   join. At each supported semantic dependent C-call, native assembly obtains
   the exact environment from that admitted root relation, including ordinary
   child basis lineage, and binds the selected role policy and access content.
   Unknown/missing coverage or another declared environment fails closed;
   child entry cannot drop or silently replace the root governing basis.
7. Existing actor admission checks the actual request against the regenerated
   native plan, envelope and manifest before process start. The Worker creates
   candidate content; the separate Evaluator produces assessment; ordinary
   declared judgment/Consequence determines progress or truthful block through
   ABG. Access success never preselects any of those outcomes.

The access prerequisite is declared environment binding/observation, not an
undeclared semantic graph stage. It creates no second traversal loop and does
not replace `C.edge`, `C.compose`, existing semantic-stage composition or HoG's
linear Worker -> Evaluator -> Consequence relation. Pure mechanics remain
native filesystem/process primitives; the irreducible local code is exact
binding, fixed invocation of the released tool, evidence admission and joins.
New helpers remain subordinate to the existing Product/ABG owners above.

## Exact Event-Contract Integration And Historical Boundary

This is a narrow current-profile amendment to
`T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md` sections 2–3, not a new
storage or compatibility mechanism. `event_store.ts::ROOT_EVENT_CONTRACTS`
owns the new `invocation_admitted` payload arms. Preserve its two existing
arms unchanged for non-adopting invocations. Add exactly two corresponding
STDO arms, one per existing arm, with `stdoEnvironment` added to both the
allowed and required key sets. Preserve each original arm's expected values,
nullable keys and workspace-envelope relation. The new field is a non-null
closed evidence object, validated through the ABG environment contract during
admission and authenticated reconstruction. Arbitrary extra keys still refuse;
the native event validator must select exactly one matching arm. The original
arms cannot authorize an adopting invocation to omit required evidence: the
Program/declaration gate and invocation-digest reconstruction enforce that
relation before dependent execution.

Leave `LEGACY_ROOT_EVENT_CONTRACTS`, its digest preimage and
`LEGACY_ROOT_EVENT_CONTRACT_DIGEST` byte-for-byte unchanged. No legacy payload
arm acquires this field. The candidate current profile is explicitly named
`abg.event-contract.root/p4-stdo-run-environment@1` in
`event_contract_profiles.ts::ROOT_CURRENT_EVENT_PROFILE_REF`. Its descriptor
retains the current aggregate/event-kind census, exact existing current arms,
the two additional invocation arms, L identity and unchanged store-assigned
stamp contract. Its full digest D4 is computed by the existing canonical
descriptor constructor; prose does not allocate a runtime digest. D4 must
differ from L and the predecessor current-profile digest D3. The isolated
source/package freeze must publish the exact descriptor and computed D4 in
the normal generated native contract/manifest before installed preparation.
No event-kind, stamp format, profile registry, validator plugin or new ledger
is introduced.

The installed pilot creates a fresh ordinary event resource under D4; both its
preliminary source invocation and counted environment invocation use that same
current profile. Fresh replay authenticates original D4 stamps and body/digest
joins, never today's unstamped superset. The retained uniform-L validator and
original L projections remain exact. The existing one witnessed L-to-current
transition law, if separately exercised, resolves current to D4; this pilot
does not exercise, extend or claim that transition. No current-profile change
is permitted inside its two-invocation witness.

Predecessor P3/D3-stamped inputs, including mixed L/D3 histories, are outside
this new pilot cut's two-profile L/D4 input boundary and must visibly refuse
as unknown exact profiles. Preserve their bytes and predecessor executable;
do not relabel them D4, strip stamps, import them through L, rewrite history,
or infer a D3-to-D4 transition. This is not a claim of in-place P3 upgrade or
of retrospective P3 replay support by the pilot package. Supporting such an
upgrade is an explicit residual requiring its own owning design/grant; it is
not implemented as a storage, recovery or multi-profile expansion here.

Focused proof must establish accepted D4 STDO arms, unchanged D4 non-adopting
arms, rejection of extra/missing/malformed STDO evidence, unchanged L table and
digest, refusal of STDO fields under L and of original D3 stamps under D4, and
fresh D4 replay. Admission tests use the native validator, not just a schema
fixture. These are integration obligations, not results of this design review.

## Evidence, Instructions And Replay

The invocation evidence contains declaration identity and bytes, release and
complete inventory identities, exact resource/capability basis, observed member
identities, each actual access input/selection/output and its byte/canonical
digests, and required Context/policy source spans with their complete member
identities. These are immutable
observations of the admitted cut, not a second current-environment store.
Do not retain credentials or ambient process environment values in evidence.

Reuse native assembly's fixed section order. The `role` section joins the
native role contract with the declared STDO frame/policy data; `evidence`
contains the role's exact admitted corpus projection and required source
content. Existing source, obligations, predecessors, worksite, task and
response sections keep their meanings. The author receives no assessor-only
oracle or forced disposition. Generic structural validation does not claim to
detect all answer-shaped prose; native semantic evaluation and independent
differential proof still own that boundary.

Plan/envelope/manifest identity covers the environment-admission ref/digest,
role/locus, frame refs, policy ref/digest, access observation refs/digests,
included content and any explicit non-required omission. Required content is
included intact; declared bounds can block, never silently truncate. Existing
actor transport stores the plan/envelope/manifest. Later comparison re-derives
them from admitted content, not today's filesystem. Non-adopting calls keep
their declared assembly; an adopting call may not use that path to ignore its
environment.

Fresh event-prefix validation and invocation reconstruction authenticate the
new evidence body and its causal join. Existing execution-basis projection
reaches it by `invocationAdmissionRef`; existing replay evidence exposes the
same environment/access and dispatch manifests through public result/replay.
Concretely, extend `replay.ts::projectOwnerFacts` with the authenticated
invocation-environment value and the matching instruction-assembly values
projected from existing admitted invocation/actor-binding payloads. The existing
public CLI `run_replay` response carries replay coordinates, status and terminal
result; it does not carry `ownerFacts`. Fresh proof pairs that unchanged public
CLI result/replay with the installed public ABG SDK's existing exact-prefix
readers and `projectRunSemanticReplayProjection`. A fresh permission-restricted
process obtains `RunSemanticRelationView.ownerFacts` through that export over
the identical admitted durable prefix and Run, and verifies the SDK view's
identity against the CLI replay coordinate. It does not derive substitute
semantic facts or introduce another read API. Result evidence coordinates link
to that same replay; do not assert that the current C-call-only `run_evidence`
selector already renders these payloads.
Owner-fact rows are read models with exact source-event/atom joins, not new
runtime owners or persisted records.
No new event kind, Event Calculus fluent, Run aggregate, archive or read API is
needed. Missing or tampered admitted content yields a typed replay defect or
invalid prefix, not a fabricated empty environment. Historical invocations
retain their original schema/meaning within the explicit profile boundary
above; unsupported historical profiles refuse rather than being relabeled.
Absence of the declaration is not a fallback for an adopting Program.

Replay runs with the access implementation and source roots unavailable and
must still reproduce the recorded evidence and prompts. A new invocation must
perform/validate its required access under its own basis. This pilot reuses one
valid access observation only within the same admitted invocation and declared
roles. Cross-Run caching, semantic validity after changed observations,
workspace refresh and partial-result reuse are not implemented or claimed here.

Refusals retain the existing public envelope. Declaration/input mismatch maps
to `invalid_program` or `invalid_input`; absent/unpermitted/unavailable access
maps to `invalid_capability`, with stable `issuePaths` identifying the failing
environment/member/selection. The native owner keeps distinct typed causes:
missing binding, identity mismatch, access not permitted, access unavailable,
tool failure, invalid projection and declared-bound overflow. After admission,
missing/stale role evidence uses existing native assembly refusal. No new
public operation or universal STDO startup mode is introduced.

## Small Ordinary Program Witness

Use one prospectively fixed consumer publication in the pilot proof workspace,
not odd_glc and not an ABI source import. Construct it with installed GTL
exports and the already packaged semantic author/assessor implementation
bindings. One semantic stage uses existing `C.compose(author, assessor)` and
ordinary terminal projection; no C0/C1/C2 mutation or new provider is needed.
Its small original task is to produce and assess a source-grounded note about
the selected released corpus material. Keep its exact task, source Context,
rubric and output contracts fixed before the first native call.

The source packet contains the question and a small exact selection of Source
STDO excerpts, with their immutable member/span joins; it contains no model
answer. Freeze this prospective setup as two explicit public invocations:

1. Run the existing installed F_D requirement-handoff Program as preliminary
   source preparation. It does not adopt this STDO environment and is not the
   counted pilot invocation. Preserve its actual public request, admitted
   events, close handoff, result and fresh result/replay reads. A failed source
   invocation stops setup; no authored output may replace it.
2. Call the existing installed Product export
   `constructSemanticStageEnvelope` as explicit caller-side input construction,
   with `sourceHandoff` equal to that actual admitted result value, the fixed
   lifecycle/task/rubric data and `worksite: null`. This pure constructor emits
   an initial `SemanticStageEnvelope` with empty assets and no assessment; it
   neither traverses a graph nor supplies semantic interpretation or authority.
   Preserve its exact inputs/output and byte/digest joins to the source result.
3. Submit that envelope through ordinary installed input admission and the
   semantic Program's public start operation. This is the one counted
   STDO-environment invocation, containing native author/assessor composition
   and terminal projection. Continue the actual close-handoff history under
   the same D4 resource; retain the two distinct invocation identities.

This is the existing setup relation demonstrated structurally in
`test_env/tests/t287-d1-semantic-stage.test.mjs` around its `source_handoff` and
`semantic_composition` phases, not evidence that this pilot has run. The
second start uses the existing direct-input `sourceBasis: {kind: "none"}`
route, as that test does; it does not pretend the wrapped envelope is the
unchanged requirement-handoff result or invent an admitted source-result
carrier for a converted value. Conserved source history plus the explicit
constructor/input equality is the proof join; no new cross-Run causation or
reuse authorization is claimed. The harness transports these declared values
and records observations; it cannot privately convert, author or admit source
meaning, candidate assets, assessments or runtime facts. There is no packaged
handoff-output-to-envelope graph bridge and none is proposed.

This gives existing source-quote validation genuine source text to bind.
Required `a_c` output is independently retrieved and
admitted by the native environment owner and supplied in the corpus-evidence
section; a prebuilt source packet or a stored expected projection never
substitutes for actual required access. The fixed source selection is not a
claim to cover the complete STDO corpus or perform its complete-update task.

The declared corpus-access subject is the RC6
`urn:stdo-representation:frame-index:t009:complete-update-worker` materialized
view. The note concerns that view as source material; it does **not** perform,
approve or claim a complete consumer update. Its role policy separately names
the source-owned Worker frame for construction and Reviewer frame for
assessment. Retrieving a frame-index as task material does not appoint its
frame or satisfy its literal premises. Required raw role-frame source is
included through its exact Context route where the materialized view does not
supply it. Independent intake must judge these selections appropriate to the
prospective note task, rather than treating map membership as applicability.

Do not seed a response, expected judgment, canned critique or successful
assessor outcome in the declaration or fixture. The output/rubric states what
must be assessed; actual semantic results remain unknown until the native
probe. A truthful falsified/indeterminate assessment or ordinary malformed
output does not become a pass for semantic completion. The record separates
successful binding/access/dispatch from the actual semantic outcome.

The proposed discriminator set is deliberately small:

| Case | Decisive observation |
|---|---|
| Installed positive | Exact packed ABI/D4 and external RC6 dependency identities; actual preliminary F_D source invocation and explicit installed envelope construction; one counted ordinary environment invocation; real installed `a_c` process/output; admitted matching environment/access; separate native author and assessor requests carrying their declared policies/content; ordinary result or truthful semantic block. A completed-path claim additionally requires actual admitted satisfactory assessment and terminal result. |
| Missing binding | Same fixed Program with required resource omitted; typed refusal; no `a_c` execution when it cannot be bound, no dependent LLM or C-call effect. |
| Mismatched dependency | Same fixed declaration with wrong tool/member/map/source bytes or install mapping; typed identity refusal before dependent dispatch; changing the request's expected digest cannot repair the fixed declaration. |
| Access refusal | Exact declaration but permission denied or declared `a_c` unavailable/failing; typed access failure and no dependent LLM dispatch, even if a fixture offers plausible output JSON. |
| Fresh replay | New process, no source imports or access-tool execution; identical admitted environment/access, role manifests and result/disposition. Removing or changing their event-bound support refuses reconstruction. |
| Non-adopting control | Existing ordinary installed invocation with no STDO declaration/resources continues under its existing contract; no hidden mandatory environment. |

Focused deterministic tests inspect structural/capability/byte joins, refusal
ordering and replay. Native proof uses the actual exact installed `a_c` and
actual LLM transport; a fake executable, source-loaded helper or fixture-written
ABG event cannot establish the positive claim. Tests may vary fixtures for
negative cases without editing immutable installations. Preserve original
negative artifact identities and the actual failed result.

## Proposed Stage B Territory And Effort

This is a proposed exact territory for Executive selection after review, not an
active write grant. Paths are relative to `build_tenants/abiogenesis/typescript/`.
Some may prove unchanged; no unnamed path becomes writable by necessity.

Production paths:

- new `code/src/gtl/stdo_run_environment.ts`;
- `code/src/gtl/contracts.ts`, `code/src/gtl/index.ts`,
  `code/src/gtl/canonicalization.ts`, `code/src/gtl/declarations.ts`;
- `code/src/validator/validation.ts`;
- `code/src/product/run_invocation_operation.ts`;
- new `code/src/product/stdo_environment.ts` for exact physical binding and
  access observation using the released tool and native process primitives;
- `code/src/owner_bindings/run_invocation.ts`;
- new `code/src/abg/stdo_environment.ts` for admission checks and pure
  event-bound projection, with no private event writer;
- `code/src/abg/invocation_admission.ts`,
  `code/src/abg/invocation_execution_truth.ts`,
  `code/src/abg/event_store.ts`, `code/src/abg/event_contract_profiles.ts`,
  `code/src/abg/execution_basis.ts`, `code/src/abg/semantic_stage.ts`,
  `code/src/abg/instruction_assembly.ts`, `code/src/abg/actor_process.ts`,
  `code/src/abg/event_prefix.ts`, `code/src/abg/replay.ts`.

Proof paths:

- new `test_env/support/stdo-environment-pilot.mjs`;
- new `test_env/tests/t287-stdo-run-environment.test.mjs`;
- new `test_env/tests/t287-stdo-run-environment-installed.mjs`;
- the pilot commentary directory for exact fixture/package/run/access
  observations, preimages, frozen manifests and closed returns.

Build/package outputs belong in an isolated candidate copy under the pilot
evidence directory: generated `build/`, existing generator-owned `contracts/`
outputs and `product-toolchain-manifest.json`, one tarball and clean install.
Use the normal package generator there, whose ordinary build replaces several
generated directories. Do not run that destructive generated-output workflow
over the canonical dirty worktree. No generator-source, dependency, package
version, lockfile, Goals, Product, STDO install, sibling or release change is
proposed. Freeze any changed generated output with the candidate.

Expected remaining work, subject to independent design review: roughly
70–110 minutes for the declaration/binding/assembly and exact event-contract integration and focused
structural tests; 35–60 minutes for one package/install and bounded native
positive/negative/replay evidence; 20–40 minutes for independent review and
bounded repairs if authorized. These are planning ranges, not guarantees or
Product timing law. A new public semantic contract, new owner class, broad
provider change or failure requiring a wider cone returns to Executive before
implementation. Stop at the absolute pilot cap even if proof remains open.

## Residuals And Freeze Consumer

Independent Design/Design Component review must judge the declaration/access
permission boundary, the pre-admission physical observation path and its
authority, content sufficiency, exact replay join and witness scope. This
author's self-check cannot decide their acceptance.

Workspace/read-only-dependency refresh, partial authored work surviving
assessment correction, selective evidence invalidation/reuse and role-policy
tuning across successor observations remain next-slice work under their
existing requirements and D1/D2 HOW. Their absence prevents course-correction
readiness, even if this pilot's smaller installed witness passes. General
non-semantic-stage F_P integration, cross-Run access reuse and other STDO tool
operations are also unclaimed; adopting unsupported dependent loci refuse
rather than silently losing environment coverage.

No full D1/D2 or Data Mapper campaign, storage/locking/recovery expansion,
automatic retry, universal STDO enforcement, new frame interpreter,
qualification or release work is selected. Executive `/root` consumes the
frozen requirement/design delta and its evidence manifest. Only its later
bounded grant, after required independent review, can activate implementation.
