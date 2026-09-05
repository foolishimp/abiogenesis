<a id="w2-r3-c0-mutable-worksite-causality-design"></a>

# T-287 W2-R3-C0 Mutable-Worksite Causality Worksite-Root Reframe

**Status**: Bounded design-reframe candidate; pending independent review

**Implementation selection**: none

**Evidence selection**: none

**Change route**: `goal_reprice` selected this bounded `design_reframe`; any
later realization or evidence requires independent acceptance of these exact
design bytes and a new Executive selection

**Prior accepted relation**: `W2-R3-C0-D/I/E` remains predecessor evidence;
its `WorkspaceBinding.roots.productRoot` worksite interpretation is reopened
and does not authorize implementation

**Parent roadmap**:
[`T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN.md`](./T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN.md)

## Decision

The first implementation-bearing ABIogenesis increment is one post-binding
mutable-worksite causal relation. It publishes or replaces one file through
its declared implementation owner, admits the effect through the existing ABG
C-call spine, and makes the successor observation reconstructable by fresh
replay.

```text
ExactPrefixWorkspaceEnvironment E
  -> admitted WorkspaceAuthorityBasis A + WorkspaceBinding W
  -> unique Program-owner ProductInstall I_owner
  + Product-issued WorksiteFileReplaceRequest carrying exact A plus exact W identity/digest over O0
  -> admitted ExecutionBasis B and current O0
  + declared Program / GraphFunction / C-call locus
  + selected implementation owner
  -> closed LeafExecutionAuthority
  + current exact ABG prefix
  -> call-local WorksiteEffectAuthorization
  -> owner revalidates O0
  -> atomic file publication/replacement or typed refusal
  -> immutable WorksiteFileReplaceReceipt + O1
  -> exact-prefix specialized evidence + ordinary C-call result admission
  -> Event Calculus current(O0) -> current(O1)
  -> fresh replay projects O1
```

`A`, `W`, and `B` are unchanged across this relation. Mutable bytes, `O0`,
`O1`, receipts, replay cursors, and projection state never enter any of those
identities.

This design reframe changes only the already-bounded C0/C1/C2 realization
structure for locating authored worksite bytes. It makes no Product or
requirement delta and selects no implementation, evidence, package, live run,
or downstream odd_glc change.

## Worksite-Root Authority Relation

The existing exact-prefix environment already admits two different roots with
different owners:

- `WorkspaceAuthorityBasis A.canonicalRoot` is the mutable source worksite
  admitted for the stable workspace identity; and
- `WorkspaceBinding W.roots.productRoot` is the immutable installed
  ABIogenesis Product root used by the selected Program and GraphFunction.

They are not aliases. For every C0 request and effect, Product reconstructs
`ExactPrefixWorkspaceEnvironment E` at the invocation or predecessor prefix
and requires canonical equality of the carried `A` and `W` with
`E.workspaceAuthorityBasis` and `E.workspaceBinding`. It then resolves the
unique admitted `ProductInstall I_owner` named by the selected Program,
GraphFunction publication, and implementation-resolution owner and requires:

```text
A.authorityBasisId == W.authorityBasisId
A.authorityBasisDigest == W.authorityBasisDigest
A.workspaceId == W.workspaceId
W.roots.productRoot == I_owner.installedRoot
request.workspaceAuthorityBasis == E.workspaceAuthorityBasis
request.workspaceBindingIdentity == E.workspaceBinding.bindingId
request.workspaceBindingDigest == E.workspaceBinding.bindingDigest
LeafExecutionAuthority.workspaceBinding == E.workspaceBinding
```

All equality above is canonical closed-value equality, not label or path-text
agreement. More than one matching owner install, no matching owner install,
owner-coordinate disagreement, or any crossed/tampered authority or binding
refuses before dispatch or physical effect.

`WorksiteSubject`, `WorksiteTerritory`, `WorksiteObservation`, and the physical
target resolve only beneath `A.canonicalRoot`. Their root-relative paths are
relative to that root. The installed Product remains byte-exact across the
effect; a valid worksite effect never uses `productRoot` as the authored source
root.

The protected-root set is exact:

```text
R_protected = {
  W.roots.productRoot,
  W.roots.toolchainRoot,
  W.roots.eventLogRoot,
  W.roots.runtimeStateRoot,
  W.roots.projectionRoot,
  W.roots.archiveRoot
}
```

After lexical normalization and no-symlink physical resolution through the
nearest existing ancestor, a subject must be a strict descendant of
`A.canonicalRoot` and must neither equal nor descend beneath any member of
`R_protected`. A territory must be contained by `A.canonicalRoot` and must not
equal or descend beneath any protected root. A broader territory does not
override the per-subject protected-root refusal: every concrete target is
checked independently. A
missing path may be created only when every existing ancestor satisfies the
same canonical and no-symlink checks. Alternate spelling, `.`/`..`, repeated
separator, case/volume alias where applicable, hard-link alias of an existing
file, symlink traversal, crossed root, or target/parent substitution visible to
the owner's final pre-effect validation refuses before write. After that final
validation, the owner performs one same-directory atomic namespace publication
or replacement. Atomic means that partial successor bytes are never visible at
the target; it is not an expected-inode compare-and-swap. An ungoverned
external or same-user target or parent namespace mutation after the final
validation and before the publication syscall is outside the trusted-developer-
desktop threat model and is the explicit C0 atomic-window P3/nonclaim. It is
distinct from C2's coherent task/launch substitution P3. This is worksite
confinement, not hostile-code containment or a new authentication system.

The authority relation is authenticated twice: basis admission authenticates
the request's full `A` and exact W identity/digest against the exact-prefix environment before
dispatch; the owner reprojects that same prefix from
`LeafExecutionAuthority.predecessorPrefix`, joins those request coordinates to
the authority's full `W`, authenticates `A`, `W`, owner install, subject,
territory, and `O0` again, and only then effects bytes. The
exact admitted basis is carried; neither ambient `cwd` nor a caller-selected
root may reconstruct it.

## Authority

The governing source routes are:

- `repo://abiogenesis/specification/PRODUCT.md#definition-tool-and-runtime-authority`
- `repo://abiogenesis/specification/PRODUCT.md#governance-and-release-boundary`
- `repo://abiogenesis/specification/requirements/abg/REQ-R-ABG3-BINDING.md`
  requirements `REQ-R-ABG3-BINDING-016..018`
- `repo://abiogenesis/specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
  requirements `REQ-R-ABG3-EVENTS-029..032`
- `repo://abiogenesis/specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md`
  requirements `REQ-R-ABG3-SAGA-FRONTIER-001`, `-004`, `-013`, and `-014`
- `repo://abiogenesis/specification/requirements/abg/REQ-R-ABG3-WORKER.md`
  requirement `REQ-R-ABG3-WORKER-006`
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-worksite-causality`

Product owns worksite observation and the file effect. The selected
implementation binding owns the physical leaf. ABG alone admits its runtime
truth. Event Calculus and replay derive currentness. Public, HoG, a worker, a
test, and a filesystem receipt do not acquire those authorities.

## Exact Carriers

The Product module owns six immutable, closed carriers. The single added full
basis field is exactly
`WorksiteFileReplaceRequest.workspaceAuthorityBasis: WorkspaceAuthorityBasis`.
It sits alongside that request's existing exact `workspaceBindingIdentity` and
`workspaceBindingDigest`; C0 does not duplicate full `W` into the request.
Subject, territory, observation, authorization, and receipt retain their
existing closed shapes. Their existing binding coordinates transitively bind
`A.authorityBasisId` and `A.authorityBasisDigest` through admitted `W`, and
their constructors/validators now require full `A` as the resolver input:

| Carrier | Exact meaning |
|---|---|
| `WorksiteSubject` | One canonical absent-or-regular-file target under `A.canonicalRoot`. Its identity retains exact W ref/digest, the canonical-root-relative path, and the canonical target locator; construction validates full `A` against `W`. |
| `WorksiteTerritory` | The exact canonical directory boundary beneath `A.canonicalRoot` within which this call may publish or replace the subject. It cannot itself lie in a protected root or be inferred from the target path after authorization; every exact subject remains independently subject to the protected-root check. |
| `WorksiteObservation` | A Product-issued absent-or-file observation of one A-resolved/W-bound subject, including existence/type, file identity where available, byte length, content digest, and its own content-derived ref/digest. It is evidence, not authority. |
| `WorksiteFileReplaceRequest` | The closed pre-basis input containing full `workspaceAuthorityBasis: A`, existing exact W identity/digest, the existing capability grant, subject, territory, `O0`, and complete replacement bytes/digest. It contains no `ExecutionBasis`, C-call, or authorization coordinate. |
| `WorksiteEffectAuthorization` | Call-local grant-use evidence joining admitted actor, the request-bound exact A/W coordinates, `B`, Program, GraphFunction, C-call, selected implementation owner/handler, effect, subject, territory, the existing admitted capability grant, and `O0`. It is not a new grant, binding, registry entry, or reusable credential. |
| `WorksiteFileReplaceReceipt` | Owner-issued immutable proof of the exact authorization, `O0`, written-content digest, atomic replacement, and successor observation `O1`. It is causal evidence, not ABG truth. |

The implementation boundary owns one additional immutable subcarrier,
`LeafExecutionAuthority`. It contains the exact `W`, `B`, Program,
GraphFunction, C-call, selected implementation resolution and binding, handler,
actor, and existing invocation-grant coordinates. HoG constructs it from the
admitted traversal closure and passes it with `LeafExecutionOccurrence`; the
leaf and Product validator must revalidate it. It is not a second grant or
runtime authority source.

The request, not `LeafExecutionAuthority`, carries full `A`. The authority's
full `W`, execution-basis input digest, and predecessor prefix join that
request to the admitted environment. The owner must reproject the environment
from that prefix, compare full request `A`, compare full authority `W`, and
cross-check the request's W identity/digest. Matching only unjoined refs or
digests is insufficient. This preserves the existing authority carrier rather
than adding a rival workspace or execution authority.

The sole selected effect identity is:

```text
effect://abiogenesis/worksite/file.replace/v1
```

The selected declared leaf is
`module://abiogenesis/worksite/c0@5` /
`graph-function://abiogenesis/worksite/file-replace@5`.  It is one `F_D`
GraphFunction with that exact effect and one binding,
`implementation-binding://abiogenesis/worksite/file-replace-fd@5`, to the
packaged `realizeWorksiteFileReplace` symbol.  It introduces no Public
operation, controller, registry, or event kind.

Every ref is derived from canonical carrier bytes. Equality requires ref,
digest, and covered coordinates to agree. A label, path spelling, caller
object, ambient current directory, fixture, or owner self-report cannot supply
a missing coordinate.

The existing Product `CapabilityGrant` remains the authority coordinate. The
request carries that exact grant into basis admission. It cannot carry `B`, the
C-call, or the authorization: `B` hashes its raw input, so doing so would create
a self-referential identity. After `B` and the C-call exist, the call-local
authorization proves exact grant use at that call. It does not mint, widen,
cache, or replace the grant.

Before owner invocation, the admitted C-call basis and validated current prefix
must agree that `O0` is current for the exact `A`, `W`, `B`, and subject. A
Product observation, caller assertion, matching file digest, or path under
`productRoot` cannot establish runtime currentness.

## Owner Effect

The Product constructs the subject, territory, `O0`, and request before basis
admission from exact `A` and `W`. The existing basis event projects the
exact-prefix environment, validates the closed request against its exact
authority basis, workspace binding, actor, Program, GraphFunction, owner
Product install, and exact `run.invoke` capability grant, and makes `O0`
current. The selected GraphFunction must declare
`effect://abiogenesis/worksite/file.replace/v1`; its C-call, implementation
resolution, binding, and handler must agree with `LeafExecutionAuthority`.
Only after `B` and the C-call exist does Product construct the call-local
authorization from the admitted request and that exact authority subcarrier.
Before writing, the implementation owner must:

1. reproject the exact-prefix environment and revalidate every authorization
   coordinate, full `A`, full `W`, and the unique Program-owner install against
   the selected call;
2. resolve the subject and territory canonically under `A.canonicalRoot`,
   refuse a subject equal to or beneath `R_protected`, refuse a territory itself
   in `R_protected`, and never let a broader territory override the subject
   check;
3. refuse a directory, non-regular, aliased, symlinked, or out-of-territory
   subject while preserving an exact absent observation as a lawful create
   pre-state;
4. re-observe the subject and require exact equality with `O0`; and
5. require the fixed effect identity and selected handler coordinate.

The owner inventories the installed owner Product at `I_owner.installedRoot`
before the effect. It stages the complete successor bytes beside the worksite
target. Immediately before the physical effect it repeats the canonical
target/parent-locus and exact-`O0` validation above, then commits with one same-
directory atomic namespace publication or replacement. The atomic guarantee is
no partial successor visibility, not an expected-inode compare-and-swap. It then
observes `O1` from the committed target, re-inventories the owner Product,
requires a zero path/content/topology delta, and returns the receipt. It does
not mutate `A`, `W`, `B`, the installed Product, Program, GraphFunction,
Catalog, overlay, grant, or event store.

A failed precondition or substrate operation returns typed evidence and closes
the already-open C-call through the existing failure-result and judgment path.
It makes no worksite-currentness transition and does not fabricate a receipt or
runtime outcome.

## ABG Admission And Replay

Success uses the existing exact-prefix C-call transaction path and existing
event kinds:

```text
c_call_evidenced
c_call_result_admitted
```

The specialized worksite evidence binds the validated request, exact `A`,
exact `W`, `LeafExecutionAuthority`, authorization, owner install, subject,
territory, and `O0`. The
ordinary admitted result value binds that evidence, the receipt, and `O1`.
Admission cross-validates the complete mapping before append. The existing
`basis_admitted` event initiates
`worksite_observation_current(O0)` only when its raw input is the validated
closed request, exact-prefix `A`/`W` authentication has succeeded, and all
basis/request coordinates agree. The declared dynamic
effect of that exact admitted C-call result terminates
`worksite_observation_current(O0)` and initiates
`worksite_observation_current(O1)`. Replay projects the exact current
`WorksiteObservation` only from the validated event prefix.

The physical commit and ABG append are two ordered owner boundaries, not one
transaction. If the physical commit succeeds and expected-prefix append fails:

- the worksite-specific result wrapper returns a closed
  `unadmitted_physical_commit` value carrying the receipt, `O1`, and refused
  expected prefix;
- no event from the refused batch becomes durable;
- `O1` is not runtime truth and cannot drive traversal; and
- retry requires a fresh Product observation and a new authorization.

Rollback is not inferred. A later admitted correction, compensation, or retry
requires its own selected design and causal evidence.

## Future Realization Boundary (Unselected)

No implementation or evidence work is selected by this candidate. If a later
Executive selection follows independent acceptance, the minimum C0 realization
may touch only:

- `repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/worksite_effect.ts`
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/worksite_operations.ts`
- the existing implementation contract, leaf invocation port, and HoG C-call
  lifecycle surfaces needed to deliver `LeafExecutionAuthority` to the owner;
- the existing C-call evidence/result admission, Event Calculus, replay, and
  package export surfaces needed to carry the closed worksite relation; and
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-file-replace-owner.test.mjs`
  and
  `repo://abiogenesis/build_tenants/abiogenesis/typescript/test_env/tests/t287-post-binding-worksite-write.test.mjs`.

That future realization must reuse canonical JSON/digests, immutable carriers, the
existing `WorkspaceBinding`, `ExecutionBasis`, `CapabilityGrant`, C-call event
spine, exact-prefix append, Event Calculus, and replay. It adds no public
operation, event kind, controller, registry, grant family, workspace binding,
execution basis, runtime, or general filesystem abstraction.

Its Product surface remains exactly `WORKSITE_FILE_REPLACE_EFFECT_URI`, the fixed
handler ref/digest, `constructWorksiteSubject`, `constructWorksiteTerritory`,
`observeWorksiteSubject`, `constructWorksiteFileReplaceRequest`,
`constructWorksiteEffectAuthorization`, `replaceWorksiteFile`, and validators
for the six closed carriers. No ambient resolver or owner selector is added.

## Required Proof Matrix (Unselected)

These are design-review obligations now and future evidence obligations only
after a separate I/E selection:

| Case | Required construction | Required result |
|---|---|---|
| Distinct roots | Admit `A.canonicalRoot != I_owner.installedRoot` and `W.roots.productRoot == I_owner.installedRoot`. | A `package.json` subject resolves beneath `A.canonicalRoot`; publication changes only that worksite file. |
| Installed payload conservation | Inventory the complete owner Product before and after the successful worksite effect. | Installed payload bytes, paths, node kinds, aliases, and digest remain exactly equal; Product delta is zero. |
| Exact-prefix authentication | Cross or tamper full `A`, full `W`, workspace ID, authority-basis ref/digest, predecessor prefix, Program owner, or owner install. | Basis admission or owner re-observation refuses before write at the owning seam. |
| Alias confinement | Try parent escape, alternate spelling, symlinked ancestor/target, hard-link alias, physical target outside `A.canonicalRoot`, and target/parent substitution visible at the final pre-effect validation. Do not inject an adversarial namespace race after that validation. | Every substituted or confined locus visible at the final validation refuses before write; path-text containment is not sufficient. The proof makes no expected-inode CAS or hostile-filesystem claim for the post-validation syscall window. |
| Protected roots | Target a path in or beneath Product, toolchain, event, runtime-state, projection, or archive root, or place the call's territory in one of those roots. | Refusal occurs before dispatch/effect and no protected byte changes; a broader safe territory never overrides the target check. |
| C0 replay | Admit a lawful successor `O1`, close, reopen, and replay the exact prefix. | Replay reconstructs the exact `A`/`W`-bound `O1`; it does not scan either root or derive worksite location from `productRoot`. |
| C1/C3 propagation | Enter C0 through one C1 task and through C3 branches whose C1 tasks carry the same exact full `A` and `W`. | Every C0 request preserves full `A` plus W identity/digest derived only from that task's full `W`; the owner joins those to its full admitted `W`. Any mixed-basis branch vector refuses before branch dispatch. |
| C2 source join | Re-observe the C1/C3 protected outputs for a C2 snapshot from `A.canonicalRoot`. | Snapshot source coordinates and bytes equal replayed `O1`; installed Product remains byte-exact. |

## Acceptance

The owner test proves:

- exact authorization and `O0` produce one atomic absent-to-file publication or
  file-to-file replacement, one receipt, and exact `O1`;
- `A`, `W`, and `B` identities remain unchanged and the owner Product inventory
  has zero delta;
- stale `O0`, crossed actor/authority/binding/basis/call/effect/subject/
  territory/handler, a protected target or territory, an alias, a symlink or
  non-file subject, an escaped target, and target/parent substitution visible
  at final pre-effect validation refuse before write; the proof does not inject
  an adversarial namespace race after that validation;
  and
- a substrate failure never fabricates success.

The post-binding test proves:

- one admitted call basis reaches the selected owner;
- basis admission validates the pre-basis request and makes only its exact
  `O0` current without a self-referential authorization coordinate;
- the receipt enters one exact-prefix specialized-evidence/result admission;
- Event Calculus removes currentness from `O0` and assigns it to `O1`;
- a fresh reopen and replay reconstructs the same current `O1`, receipt,
  specialized evidence, and admitted result with the original `A`, `W`, and
  `B`;
- owner refusal and substrate failure close the C-call through the ordinary
  failure-result/judgment relation and do not change worksite currentness;
- crossed or tampered worksite coordinates, event order, receipt, or replay
  identity refuse admission; and
- an injected prefix conflict after physical commit returns
  `unadmitted_physical_commit`, admits no batch member, exposes no runtime
  `O1`, and forces re-observation.

## Falsifiers

The increment fails if any of these occur:

- worksite bytes, observations, or receipts alter `WorkspaceAuthorityBasis`,
  `WorkspaceBinding`, or `ExecutionBasis` identity;
- the effect proceeds without exact actor, authority basis, workspace binding,
  grant-use, call, owner install, subject, territory, and `O0` agreement;
- the request embeds, predicts, or aliases an `ExecutionBasis`, C-call, or
  authorization coordinate;
- a path string, fixture, worker, or handler chooses authority or write
  territory;
- a worksite subject, territory, observation, or source snapshot resolves from
  `W.roots.productRoot` instead of `A.canonicalRoot`;
- the Program-owner Product root differs from its admitted installed root, or
  the installed Product has any effect delta;
- a target equals or descends beneath a protected root, its territory itself
  lies in one, or an alias/symlink reaches one;
- a write occurs after stale-observation detection;
- same-directory atomic replacement is represented as expected-inode
  compare-and-swap or hostile-filesystem containment;
- a receipt, changed file, or process-local value is treated as ABG truth;
- physical commit and ABG append are reported as one atomic transaction;
- append refusal hides the physical commit, rolls it back implicitly, or makes
  `O1` current;
- replay scans the worksite or trusts caller-supplied `O1`;
- a new event, public operation, controller, registry, grant, binding, runtime,
  or generic resource framework appears; or
- C0 evidence is reported as closure of broad R2/R3, R4, typed URI admission,
  full traversal, odd_glc, S1 P0, a Product version, qualification, or release.

## Stop And Return

This Worker stops at exact design/docs bytes for independent review. I/E,
builds, tests, model/live runs, package/manifests, Product/requirements,
odd_glc, version, and release remain unselected. A need for Product meaning,
new public contract, event kind, widened effect family, pre-binding authority,
or multi-file/compensating transaction returns to the Executive at the owning
re-entry.
