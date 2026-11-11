Cut from `build_tenants/abiogenesis/typescript/design/T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md` at commit `39d6cb975`, lines 720-881, 938-1007, verbatim.


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

   The covered-source comparison reuses this material owner for the specifically
   canonical C2 renderer Context. ABG supplies the actual causal old/current
   ProductInstalls; Product binds the complete publication to each exact installed
   manifest publication binding and reads its existing declared Context inventory
   path and renderer member. Canonical confined paths, complete record inventory,
   member digests/lengths and source-span bounds authenticate material before
   byte-for-byte consumed-span comparison. These are transient reads with no
   tool launch, new observation, retained Context cache or receipt authority.
   Proven member/span location changes and derived inventory identities may
   differ in private consumed meaning; every other declared field/order remains
   exact. This does not apply to whole-member, corpus/tool-access or unknown
   Context consumption, and does not change complete public evidence or policy.
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
