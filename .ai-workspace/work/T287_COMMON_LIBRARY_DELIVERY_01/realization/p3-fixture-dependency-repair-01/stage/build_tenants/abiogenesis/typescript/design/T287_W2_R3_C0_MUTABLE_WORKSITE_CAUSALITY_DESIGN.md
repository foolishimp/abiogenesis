<a id="w2-r3-c0-mutable-worksite-causality-design"></a>

# T-287 W2-R3-C0 Mutable-Worksite Causality

## Proposed assessed-file parent prerequisite

Status: Executive-accepted at the ABI5_GENERIC_JOB_DESIGN_01 freeze after the
single independent review of [D1 generic-job binding](T287_D1_REQUIREMENT_LIFECYCLE_DESIGN.md#proposed-generic-job-binding-reframe)
closed satisfied. ABI5_GENERIC_JOB_IMPLEMENT_01 and its delegated physical-owner
grant authorize implementation; native effect qualification is separate. ABI's source basis is RC7.
The accepted fixed-file/B04 relation below stays accepted at its prior scope.

### Exact need and authority

product/worksite_operations.ts::inspectTargetPath currently returns
target_parent_missing when a nonfinal path segment is absent (lines 276–283 in
the recorded source). Thus an empty lawful worksite cannot receive an assessed
nested target, and observeWorksiteSubject cannot supply that file's O0 yet.
The rejected GLC preparation concealed this dependency by creating directories
in the host. That is not selected for the generic native route.

This delta realizes existing mutable-worksite construction under Product
definition/tool/runtime authority; REQ-R-ABG3-BINDING-016..018,
EVENTS-029..032, SAGA-FRONTIER-001/004/013/014 and WORKER-006 retain owner
separation, exact authority, declaration and effect law. It creates only the
missing parents necessary for assessed, authorized file targets. It is not a
general directory operation, a new Product family, an expanded filesystem
permission, or a relaxation of the current file.replace precondition.

### Narrow declared C0 relation

Declare a separate, bounded parents-for-files F_D leaf in the existing C0
module/owner, composed before ordinary target-file observation and C1. Its
closed request names the exact admitted same-job assessed-target-plan result,
full A plus exact W coordinates and existing invocation grant, declared
territories, file target paths and the owner's observed existing/absent ancestor
chain. The path set is rederived from that actual plan; callers/actors cannot
supply an unrelated directory list. The effect declaration explicitly covers
only required missing file parents. No new Public operation, event kind,
runtime engine or global directory state is introduced.

The semantic plan F_D emits this request from the satisfied Design and active
bindings. C0 rehydrates its actual producing plan/Design/job ancestry and
ordinary selected implementation/effect authority before any syscall. The
finishing semantic bridge accepts only the resulting admitted success, recovers
the exact plan/Design through native owner projection, and then makes fresh
file observations and the existing WorksiteCommandPreparationInput. This is
one declared native subgraph, not host orchestration or hidden effects inside
a read-only bridge.

The owner computes a finite, deduplicated parent-first list. For each path:

1. The ancestor is a strict descendant of A.canonicalRoot, contained by the
   pre-admitted writable territory and needed by at least one exact assessed
   file target. It neither equals nor enters any protected install/runtime root.
   A file-scoped grant that does not authorize its necessary parent refuses;
   no territory is inferred or widened after selection.
2. Every existing ancestor is canonical and a concrete directory with its
   observed physical identity. Symlinks, non-directory collisions, aliases,
   escaping paths and changed preconditions refuse. Existing directories are
   observed and retained; they are never replaced, chmodded or claimed newly
   created. Required read-only dependencies are not made writable.
3. Revalidate the actual parent locus immediately before one non-recursive
   mkdir for a declared missing child. Do not use recursive mkdir to bypass
   per-path checks. An unexpected existing path is a precondition conflict,
   not silent success. Record successful creation immediately, then observe
   its identity before proceeding to the next parent.
4. Revalidate the completed ancestor chain and return an immutable receipt
   covering the plan, authority, exact ordered existing/created outcomes and
   available observations. The original absent-or-file observation and atomic
   file.replace owner run only afterward and keep their strict old contract.

A directory syscall and ABG append are distinct boundaries. No batch-atomic
directory creation, hostile-code containment, inode CAS or expanded
post-validation race guarantee is claimed. The trusted-developer-desktop
syscall-window limitation already recorded below remains explicit.

### Partial effect, admission and replay

The receipt/failure subcarrier belongs to product/worksite_effect.ts and the
physical routine to product/worksite_operations.ts. The existing guarded C0
implementation is the only physical entry. Constructors/validators do not
expose a callable unguarded writer.

Success and failure use existing evidence/result/judgment events, with exact
closed contracts for this declared leaf. No directory-currentness fluent is
needed: receipts attest past owner operations; subsequent file owners freshly
validate ancestor state. Replay derives the admitted result and its ordered
facts without reading today's filesystem.

If any mkdir succeeds and a later mkdir, observation, wrapper check or semantic
bridge fails, retain each known creation, each verified existing-directory fact,
the first failure and later diagnostics. Missing verification is unknown, not a
success receipt. Do not delete parents or report an untouched workspace; no
cleanup/rollback campaign is selected. The failed C0 does not advance or supply
file O0. If ABG evidence/result/append refuses after physical creation, return
the existing unadmitted-physical-effect envelope extended by this closed C0
arm, preserving the owner outcome and refused prefix. Replay retains only the
durable prefix, never the process-local result. Any later attempt requires
fresh observation and authorization.

### Minimal implementation/proof cone

This proposed extension touches existing gtl/worksite_c0.ts,
product/worksite_effect.ts, product/worksite_operations.ts,
implementation/worksite_file_replace.ts, abg/c_call_outcome.ts and matching
closed owner validation/descriptor/export wiring already in the D1 cone.
abg/execution_basis.ts and product/builtin_semantics.ts authenticate the new
closed input/source relation through existing owners. HoG only forwards the
existing authority/result shape. No event-store/replay schema change or new
directory engine is selected; generic replay already preserves admitted C-call
result values. If a new replay truth mechanism proves necessary, return that
dependency rather than invent it.

Use focused existing C0 owner/admission tests with a disposable empty worksite:
real nested-parent creation then unchanged C1/C0 file replacement; already
existing parents preserved; exact-boundary/protected-root/symlink/collision and
stale-parent refusal before effect; one injected later failure after a real
parent creation; and an append refusal retaining unadmitted physical facts.
Fresh replay must agree with admitted receipts and not claim unadmitted effects.
The sunny Hello case must start without caller-created artifact directories.
Preserve the installed Product and pre-existing unrelated worksite bytes.
No broad resilience matrix or automatic runtime retry is selected.

## Preserved accepted file-replacement and B04 design


**Status**: `W2-BL-C0/B04/correction-01` accepted and closed. Independent
review returned `satisfied` for the corrected HOW, implementation and affected
proof; Executive `/root` accepts the bounded claim. No further work is selected.

**Prior accepted identity**: original design SHA-256
`1bceff03c850a28801a40ee267ed0e386173b1c50f3c9bb29cbab6556345ca06`,
under frozen subject
`ab398d004fb0ad03e0e209963326242ef5ea3383d8a96db7c79fbf32b439ebcf`.
The prior design, implementation subject and exercised evidence retain their
exact historical identities. This successor changes only the public-surface
clause in the HOW body. [T-287 W2-BL-C0](../../../../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#w2-bl-c0)
and the [corrective execution record](../../../../.ai-workspace/comments/codex/20260907T033506Z_W2_BL_C0_POST_PUBLICATION/correction-01/execution.md)
own current disposition; the parent records remain immutable. Wave 2 remains HOLD.

**Operative method**: Definition-selected immutable STDO `v2.5.0-rc.6`,
manifest `bed7535a5feddc5e874993ff96d1f5f27e2a0fff63f366fc3b1fec3e301dd9e0`.
Local axiomatic context is derived from these owners; revalidate it before use
and re-enter exact sources whenever its basis is stale or insufficient.

**Change route**: bounded HOW re-entry for the public physical-writer surface,
plus local repair under unchanged law for C0-only failure recognition and
observation first-cause preservation. The corrected frozen
implementation/proof subject has completed independent review. No carrier,
Product-meaning, syscall-window P3 or sibling-stream redesign is selected.

**B04 preimage**: `7cd8a5a905cdb02c8431b06224df5aa46cfc8f759a7dc5c1fd4712e66c652240`;
the existing atomic-publication and distinct syscall-window P3 relation below
is conserved. The single work record and frozen subject are routed by T-287.

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
  -> unique Program-owner ProductInstall I_P
  + Product-issued WorksiteFileReplaceRequest carrying exact A plus exact W identity/digest over O0
  -> admitted ExecutionBasis B and current O0
  + declared Program / GraphFunction / C-call locus
  + selected implementation owner
  -> closed LeafExecutionAuthority
  + current exact ABG prefix
  -> call-local WorksiteEffectAuthorization
  -> owner revalidates O0
  -> atomic file publication/replacement or typed refusal
  -> immutable WorksiteFileReplaceReceipt + O1, or closed partial-effect failure
  -> exact-prefix specialized evidence + ordinary C-call result admission
  -> Event Calculus current(O0) -> current(O1)
  -> fresh replay projects O1
```

`A`, `W`, and `B` are unchanged across this relation. Mutable bytes, `O0`,
`O1`, receipts, replay cursors, and projection state never enter any of those
identities.

The retained worksite-root relation locates authored bytes through `A`. The
accepted B04 delta changes only C0's post-publication failure treatment. It
preserves the fixed 16-family ABG 5.0 Product, requirements, GTL.TypeScript,
direct HoG traversal, admitted runtime ownership, and C1/C2/C3 HOW. It selects
no runtime implementation, package, live run, or downstream odd_glc change.
The separately selected single-start extension follows [the accepted single-start HOW](T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md); its owner/grant refinements below preserve that B04 law.

## Worksite-Root Authority Relation

The existing exact-prefix environment already admits two different roots with
different owners:

- `WorkspaceAuthorityBasis A.canonicalRoot` is the mutable source worksite
  admitted for the stable workspace identity; and
- `WorkspaceBinding W.roots.productRoot` is the immutable installed
  Program-owner Product root; the selected GraphFunction and implementation
  may belong to independently exact admitted dependency installations.

They are not aliases. For every C0 request and effect, Product reconstructs
`ExactPrefixWorkspaceEnvironment E` at the invocation or predecessor prefix
and requires canonical equality of the carried `A` and `W` with
`E.workspaceAuthorityBasis` and `E.workspaceBinding`. It then resolves the
unique admitted Program installation `I_P`, GraphFunction-publication
installation `I_G`, and implementation installation `I_L` from their actual
selected declarations and dependency closure. These may coincide in the
standalone case. It requires:

```text
A.authorityBasisId == W.authorityBasisId
A.authorityBasisDigest == W.authorityBasisDigest
A.workspaceId == W.workspaceId
W.roots.productRoot == I_P.installedRoot
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
  W.roots.archiveRoot,
  every admitted ProductInstall.installedRoot
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
existing closed shapes, including throughout B04. Their binding coordinates transitively bind
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
cache, or replace the grant. For an enclosing consumer Program, rehydrate
the original root invocation and preserve its exact `run.invoke#start` grant
through every child; the standalone path retains `#invoke`. A matching member
label alone is insufficient.

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
   coordinate, full `A`, full `W`, and independently exact `I_P`/`I_G`/`I_L`
   against the selected root Program, GraphFunction, implementation and call;
2. resolve the subject and territory canonically under `A.canonicalRoot`,
   refuse a subject equal to or beneath `R_protected`, refuse a territory itself
   in `R_protected`, and never let a broader territory override the subject
   check;
3. refuse a directory, non-regular, aliased, symlinked, or out-of-territory
   subject while preserving an exact absent observation as a lawful create
   pre-state;
4. re-observe the subject and require exact equality with `O0`; and
5. require the fixed effect identity and selected handler coordinate.

The owner inventories the complete deduplicated `I_P`/`I_G`/`I_L` installation
set before and after the effect, requiring zero delta for each. It stages the complete successor bytes beside the worksite
target. Immediately before the physical effect it repeats the canonical
target/parent-locus and exact-`O0` validation above, then commits with one same-
directory atomic namespace publication or replacement. The atomic guarantee is
no partial successor visibility, not an expected-inode compare-and-swap. It then
observes `O1` from the committed target, re-inventories the owner Product,
requires a zero path/content/topology delta, and returns the receipt. It does
not mutate `A`, `W`, `B`, the installed Product, Program, GraphFunction,
Catalog, overlay, grant, or event store.

A failure before publication retains the existing refusal shape and closes the
already-open C-call through the existing failure-result and judgment path,
without a worksite-currentness transition. Once `link` or `rename` has returned
success, the owner must preserve that physical fact through every later
failure. A receipt still requires an actually observed and verified `O1`.

## B04 Post-Publication Failure Relation

### Owner facts and minimal representation

Publication, observation, and ABG admission are separate boundaries. A returned
successful publication syscall establishes that the admitted replacement bytes
were published once at the authorized target. It does not establish their
present existence, a verified `O1`, successful C0 completion, or runtime truth.

`worksite_effect.ts` owns one closed, immutable C0-only failure refinement of
the existing declared `worksite_effect_refusal` value kind. Its ordinary
refusal fields retain their meaning: the requested C0 completion was refused.
The generic `WorksiteEffectRefusal` and `worksiteRefusal` constructor remain
unchanged. Only this refinement has a mandatory post-publication discriminator
and `physicalOutcome`; it is never accepted as the success output. The six
success carriers, their constructors/validators, GTL contract refs/value kinds,
GraphFunction, effect, binding, handler, and successful output remain exact.
No seventh public operation or independently published carrier is introduced.

The internal failure subcarrier is a closed sum, avoiding changes to an
already successful owner return. `publication_only` carries the owner's
record made before a receipt was available; `owner_completed` carries the
exact existing `{ authorization, receipt, successorObservation }` success
value retained before wrapper checks. The latter proves publication through
the receipt and completed owner contract; it never invents a staging locator
that the success return did not expose. The two arms contain only these facts:

| Field | Closed meaning |
|---|---|
| `authorization` (`publication_only`) | Existing complete `WorksiteEffectAuthorization`, joined to the exact request, O0, selected call, and implementation. The `owner_completed` arm retains this in its complete success value. |
| `publication` (`publication_only`) | `committed: true`, `method: link \| rename`, written digest/length, and the owner-created staging locator and file identity. The subject is already bound by authorization; this record is created immediately after the successful syscall. |
| `compensation` (`publication_only`) | `not_attempted \| succeeded \| failed \| skipped_unverified_identity` for the existing create-path target unlink only. Success attests that unlink, never semantic rollback or restored currentness. |
| `stagingCleanup` (`publication_only`) | `consumed_by_rename \| removed \| failed \| skipped_unverified_identity`; records the final bounded owner cleanup action. |
| `stagingResidue` (`publication_only`) | Final owner inspection: `absent \| owned_file \| other_path \| unknown`, with observed file identity when available. Inspection failure is `unknown`, not absence. The locator remains the one recorded at publication. |
| `postPublicationObservation` | A real Product observation obtained after publication, including a mismatch or observed absence after compensation, or `null` when none was obtained. It has no currentness claim. |
| `completedOwner` (`owner_completed`) | The inseparable existing authorization/receipt/successor value made only after a valid matching file observation and successful owner cleanup. A later failure retains it unchanged; it does not re-certify O1 or filesystem absence as current. `publication_only` contains no receipt. |
| `diagnostics` | Ordered, bounded records for executed failure stages: staging cleanup, target compensation, residue inspection, successor observation/receipt, Product inventory, or owner re-observation. Each carries the existing code/message/substrate-code information. The first causal failure remains the outer diagnostic; later failures append facts instead of replacing it. |

These are transient owner effect evidence, subsequently bound by the existing
C-call result digest. They have no independent lifecycle, event kind, ledger,
registry, authority, or mutable runtime store. The pure constructor/validator
belongs beside the existing Product carriers; direct imports suffice. The
effect may keep call-local progress while it owns the syscalls, then returns a
new frozen value only after all selected cleanup and residue observations.
No `finally` action may change the filesystem after the result has been frozen
or silently swallow a known post-publication outcome.

### Sequence and state treatment

1. Keep existing request, authority, O0, staging, confinement, installed-owner
   inventory, and final pre-effect validation. A failed publication syscall
   follows the existing pre-publication refusal path; it does not mint a commit.
2. Immediately after `link` or `rename` resolves, retain the publication record.
   Every subsequent exit carries it. No later catch may say "failed before
   commit" or replace it with an ordinary bare refusal.
3. For create, retain the existing one inline compensation attempt when staging
   unlink fails. Unlink the target only after both target and staging are
   observed to equal the recorded published staging identity. Unavailable or
   different identity skips compensation. Record success, failure, or skip and
   the primary staging error separately. Rename has no target compensation.
   There is no predecessor restoration, compensator, retry loop, or rollback
   framework. This does not change the separate pre-publication syscall-window
   P3 or claim protection from external namespace races.
4. Complete the existing bounded staging cleanup under the recorded identity
   guard, then inspect staging residue. A cleanup or inspection error preserves
   the publication and any compensation facts. Never unlink a substituted
   staging path. A valid successor observation can be retained only if actually
   obtained; alias, EIO, absent, or digest/length mismatch does not synthesize O1.
5. The wrapper carries the owner's outcome through its Product inventory and
   re-observation checks. A post-inventory read failure records conservation as
   unverified; a mismatch records the observed mismatch. Neither proves that C0
   changed the Product. Re-observation error/mismatch identifies that stage.
   Construct the existing complete success value before these fallible wrapper
   checks and retain it in the `owner_completed` failure arm if needed. A
   previously formed receipt/O1 pair survives both failures. If the owner had
   already failed, later checks append diagnostics and never replace its cause.
6. Only the complete existing sunny-day relation returns success. Every other
   known-publication case enters the same declared C0 failure slot with the
   closed physical outcome. Compensation success still enters that failure
   slot even when the target is absent again.

| Owner result and ABG outcome | Currentness allowed after fresh replay |
|---|---|
| Pre-publication refusal admitted | Existing O0 remains; no physical-publication fact or O1 is added. |
| Complete success admitted | Existing specialized success relation terminates O0 and initiates exact O1. |
| Post-publication failure admitted, with or without a prior receipt | Terminate exact O0; initiate no successor. Replay retains the admitted failure value and physical facts. This holds even after successful target compensation. |
| ABG admission/append refused after publication | The refused batch contributes no event. Replay retains precisely the original durable prefix, including its prior O0 claim where present. It cannot discover the unadmitted effect or assert physical O0 validity. The returned unadmitted envelope preserves the owner outcome; any next attempt needs fresh observation and authorization. |

### Existing event and replay treatment

Use existing `c_call_evidenced` and `c_call_result_admitted` events. Success
retains its existing `worksite_file_replace` specialized evidence with complete
receipt/O1. Failure uses the existing `deterministic` evidence class whose
output digest covers the entire refined refusal. Its result event carries
that exact value, `resultClass: failure`, and the unchanged failure contract.
The failure does not reuse success evidence requiring O1.

At `c_call_outcome.ts`, recognize the refinement only for the selected C0
F_D call/effect/binding. Re-enter the exact predecessor prefix, admitted request,
full A/W, execution basis, implementation set and selected resolution; reuse
Product authorization construction and canonical equality to authenticate the
carried authorization. Validate closed publication, compensation/residue,
observation, and completed-owner receipt joins against that request. Method agrees
with absent/file O0, staged bytes agree with replacement digest/length, and
every observed or receipt coordinate remains on the same authorized subject.
The ordinary deterministic evidence and result digest join binds all fields.
A marker, arbitrary JSON extension, owner label, or unrelated generic refusal
cannot acquire worksite-currentness effects.

The specialized recognition belongs in the existing ABG owner. Rejection of
evidence or result after known publication aborts the existing transaction,
just as complete success does today; it must not replace the outcome with a
staged generic block that discards the physical facts. Expected-prefix append
failure uses the same abort path. Extend the existing
`unadmittedPhysicalCommit` helper to recognize the closed failure refinement:
the current receipt/O1 success envelope remains byte-for-byte the same, while
the failure variant carries the intact refined refusal and refused prefix.
Missing O1 is explicit inside that variant. HoG's existing catch already passes
the owner result to this helper and remains a thin transport of its return.

The only additional currentness join is in
`event_calculus.ts:projectWorksiteTransitionForResult`: a validated admitted
C0 failure result plus its same-call deterministic evidence yields
`before = O0`, with no `after` or successor observation. Reconstruct the same
Product-owned joins from the prior admitted basis/call and result value;
require result/evidence digests, call, failure contract, and ordered prefix to
agree. Success retains the existing complete transition. The result event
terminates `worksite_observation_current(O0)` in either case, initiating O1
only for complete success. `replay.ts` accepts only a present verified
successor as a new observation candidate; its existing holds-at filter removes
terminated O0 and its C-call `resultValue` already preserves the full failure.
No additional currentness fluent, projection store, event family, filesystem
read during replay, or C-call evidence taxonomy is needed.

### Deterministic B04 acceptance matrix

Every fault runs the real C0 owner over disposable physical target and staging
paths. Injection changes only the named filesystem observation/operation or
existing append seam; it cannot fabricate an owner result, successful syscall,
receipt, O1, admitted event, or replay projection. Restore injection before the
independent filesystem oracle. Record target bytes/kind/identity and staging
bytes/kind/identity or absence, actual compensation/cleanup attempts, the exact
owner result, admitted prefix, and fresh-process replay. No LLM is required.

| ID / fault boundary | Required physical and carrier evidence | ABG and replay oracle |
|---|---|---|
| `B04-01` create publication then staging unlink failure | Cover existing compensation success, failed target unlink, and unavailable identity/skip; cover final staging cleanup success and persistent failure. Target absence after compensation, retained published target otherwise, and actual staging residue match the recorded actions. Publication remains known; no receipt is invented. The original cleanup error survives every later error. | Admit the closed failure and deterministic evidence; fresh replay preserves all facts, has no current O0/O1, and cannot advance this C0 as success. |
| `B04-02` successor observation EIO / mismatch | Cover link and rename publication, absent/non-file refusal and valid file digest/length mismatch. Publication and cleanup remain known; `publication_only` carries no receipt. Any test-authored post-publication byte change used to trigger mismatch is recorded separately; it is outside the pre-publication P3 window. | Same admitted-failure oracle; a mismatching observed file is evidence, never successful O1. |
| `B04-03` wrapper Product inventory read failure / observed mismatch | Start from a real successful owner receipt/O1; inject only the subsequent inventory observation. Preserve that exact pair and primary outcome. Independent inventory proves the actual installed Product has zero delta. Report failed verification separately from actual mutation. | Admitted failure retains receipt as history but initiates no O1; fresh replay invalidates O0. |
| `B04-04` wrapper owner re-observation EIO / mismatch | Start from the real receipt/O1; fail or mismatch only the later observation. Preserve the pair plus actual later observation, if obtained, and target/staging state. | Same admitted-failure oracle. No stale receipt becomes a success or current successor. |
| `B04-05` ABG evidence/result rejection and expected-prefix append failure | Exercise complete success, a valid post-publication failure with no O1, and one with a retained receipt. The returned unadmitted variant preserves the corresponding owner outcome and refused prefix. Physical target and staging match the owner record, including compensation. | No member of the refused batch is durable. Reopen/replay the original prefix, prove no added failure/O1/currentness transition, and prove replay did not consume the returned process value. A competing prefix advance is recorded separately. |
| `B04-06` success controls | Real absent-to-file link and file-to-file rename, complete unchanged receipt/O1, no residue, no compensation, equal before/after installed inventory and exact A/W/B. | Existing specialized evidence and success result remain unchanged; fresh replay replaces O0 with exact O1. |
| `B04-07` pre-publication controls | Stale O0, invalid authorization/protected target, and a failed link/rename syscall produce ordinary refusal; no target publication, unchanged generic refusal shape, and normal staging cleanup. | Ordinary failure path leaves O0 current and creates no publication transition. Crossed request/authorization/call, tampered receipt/digest, and unrelated refusal with an injected marker cannot acquire the B04 currentness effect. |

For `B04-01..04`, also assert that an admitted failure cannot reuse O0 to resume
the same effect; for `B04-05`, existing physical revalidation must refuse stale
O0 where target state differs. Even when compensation makes the target absent
again, the unadmitted return is not an automatic retry grant. This is a
caller's fresh-observation/authorization obligation, not a new recovery runtime.
Keep artifacts sufficient to replay the retained event prefix and compare
actual filesystem observations. Passing owner/unit probes alone does not
qualify the installed Product or close Wave 2.

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
  `unadmitted_physical_commit` value carrying the unchanged receipt/`O1`
  success envelope, or the intact B04 failure refinement when the owner or
  wrapper failed, plus the refused expected prefix;
- no event from the refused batch becomes durable;
- `O1` is not runtime truth and cannot drive traversal; and
- retry requires a fresh Product observation and a new authorization.

Rollback is not inferred. The existing inline physical compensation is recorded
under B04 above. A later admitted correction, compensation, or retry requires
its own selected design and causal evidence.

## Future Realization Boundary (Unselected)

No runtime implementation or executable evidence is activated by this candidate.
After independent acceptance, the minimum B04 implementation territory is:

- `repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/worksite_effect.ts`
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/worksite_operations.ts`
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/implementation/worksite_file_replace.ts`
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/c_call_outcome.ts`
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/event_calculus.ts`,
  only the result-to-currentness join described above; and
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/replay.ts`,
  only the guard for a transition without a successor observation.

The minimum evidence frontier is one new focused
`test_env/tests/t287-c0-post-publication-failure.test.mjs` plus the existing
`test_env/support/root-installed-environment.mjs` input-factory argument seam.
That helper already constructs and returns `workspaceAuthority`; expose that
same value to `inputFactory`, and let the new C0 fixture construct subjects and
requests with full A beneath `A.canonicalRoot`. Its composite installed
publication already includes C0. Reuse the existing fresh-process proof helper
unchanged. No Public implementation repair or copied admission algorithm is
required for this bounded installed owner/admission/replay path.

The two historical C0 tests,
`t287-worksite-file-replace-owner.test.mjs` and
`t287-post-binding-worksite-write.test.mjs`, are source references for existing
receipt and admission behavior. Their predecessor signatures/productRoot
fixtures and the latter's installed-module deletion case remain B06/historical
evidence. B04 neither repairs nor executes their entire unrelated matrix.

The tenant entrypoint is `build_tenants/abiogenesis/typescript/package.json`.
When implementation is activated, first use the existing compiler with
`tsc -p tsconfig.json --noEmit`. `npm run build` cleans/transpiles and regenerates
`product-toolchain-manifest.json`; run it only in a disposable copy bound to the
frozen current source, then run `node --test --test-concurrency=1
test_env/tests/t287-c0-post-publication-failure.test.mjs` there. The support's
existing `npm pack --ignore-scripts` and disposable install bind that candidate
for the focused installed cases. Retain source/artifact/log/prefix identities
and proof in the single C0 work directory. No build, package, install, runtime
test, or generated Product artifact is produced during this design phase.

That future realization must reuse canonical JSON/digests, immutable carriers, the
existing `WorkspaceBinding`, `ExecutionBasis`, `CapabilityGrant`, C-call event
spine, exact-prefix append, Event Calculus, and replay. It adds no public
operation, event kind, controller, registry, grant family, workspace binding,
execution basis, runtime, or general filesystem abstraction.

Its Product surface retains `WORKSITE_FILE_REPLACE_EFFECT_URI`, the fixed
handler ref/digest, `constructWorksiteSubject`, `constructWorksiteTerritory`,
`observeWorksiteSubject`, `constructWorksiteFileReplaceRequest`,
`constructWorksiteEffectAuthorization`, and validators for the existing closed
carriers. The low-level physical writer `replaceWorksiteFile` is an internal
module dependency of the existing guarded `realizeWorksiteFileReplace` owner;
it is not exposed by the Product public entrypoint. Supported physical writes
pass through that owner's existing current-prefix, C-call-phase and exact
admitted raw-input joins before invoking the helper. Constructing or validating
an authorization does not independently permit physical invocation. Read-only
observation and constructors retain their existing roles. No wrapper,
controller, authority, token, catalog, ambient resolver or owner selector is
added, and no hostile same-process containment is claimed.

## Retained Worksite-Root Proof Matrix (Outside B04 Selection)

These predecessor root/composition obligations remain retained evidence scope.
They are not added to B04 closure; the deterministic B04 matrix above owns the
selected failure mechanism and its conserved controls:

| Case | Required construction | Required result |
|---|---|---|
| Distinct roots | Admit `A.canonicalRoot != I_P.installedRoot` and `W.roots.productRoot == I_P.installedRoot`. | A `package.json` subject resolves beneath `A.canonicalRoot`; publication changes only that worksite file. |
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
- pre-publication owner refusal closes the C-call through the ordinary
  failure-result/judgment relation without changing worksite currentness;
- an admitted B04 post-publication failure preserves physical facts and
  terminates O0 without initiating O1, including after physical compensation;
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
- a later cleanup, observation, inventory, or admission failure discards known
  publication, compensation, staging residue, or an already formed receipt;
- an admitted post-publication failure leaves O0 current or initiates an
  unverified successor, or refused append changes the prior replay prefix;
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
