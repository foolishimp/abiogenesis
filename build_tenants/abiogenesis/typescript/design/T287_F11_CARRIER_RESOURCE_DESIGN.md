# T-287 F11 Carrier Resource Design

Status: proposed HOW; frozen by `T287_F11_CARRIER_RESOURCE_DESIGN_01`.
Change class: `design_reframe` of the existing qualification input, resource,
assessment, self-conformance and native proof owners. Executive acceptance and
implementation activation are separate effects.

## Outcome And Boundary

Qualification values select immutable proof material instead of carrying its
complete bodies through each task, execution basis and result. One finite
resource assertion supplies those bodies to the existing owners. Normalize
scope by interning exact ordered relation sets while retaining every rule
domain and group identity. Initial establishment validates the complete
resource-to-call-to-render relation. Later consumers authenticate the admitted
assessment and consume its established relation without repeating preparation.

Product execution/context calculus, A5-F10/F11/F15,
REQ-P-SELF-CONFORMANCE-001..010, QUAL-025/026/057/060/064/071/072 own the outcome.
GTL declares; HoG traverses; Product reconstructs declarations; the existing
leaf owner prepares and completes; ABG admits; replay reconstructs. Resources
are untrusted immutable proof preimages, not runtime entities or verdicts.
This design adds no Program, controller, store, cache, event family, public
operation, release authority or semantic-assessment substitute.

The governing development basis is STDO 2.5.1 RC2, manifest
`3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782`, and the project
`F-END-TO-END-INTERFACE-INTEGRATION` frame composed with Design, Owner,
Reuse/Foundation and Proof. C02/Q02 retain their recorded RC1 law and exact
bytes. The source pins and representation sketch are in
`.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/f11-carrier-resource-design-01/`.
The diagnosis is the pinned `20261002_F11_CARRIER_ROOT_CAUSE_AND_FIX.md`; its
measurements are not new operational results of this proposal.

## 1. One Finite Qualification Resource Assertion

Add optional `qualificationResources` to the existing Run invocation and
continuation resource assertions. It contains one or more explicit manifests
needed by that invocation and finite historical declaration preimages. The
existing owner raw-admits, detaches and freezes that assertion once. Do not
place it in `request.input`, invocation authority input slots, execution-basis
`rawInputValue`, a CCall result, or returned parent values.

The closed shape is:

```text
QualificationResourceAssertion {
  kind: "qualification_resource_assertion", schemaVersion: "1",
  manifests: QualificationResourceManifest[],
  declarationProofs: AbgHistoricalDeclarationProof[]
}
QualificationResourceManifest {
  kind: "qualification_resource_manifest", schemaVersion: "1",
  resourceRef, resourceDigest,
  subjectBasis, lawBasis, catalog, inventory,
  entries: { entryKind, coordinate, value }[],
  declarationSelections: {
    catalogBasisDigest, readinessBasisDigest, viewDigest, proofDigest
  }[]
}
QualificationResourceSelection {
  kind: "qualification_resource_selection", schemaVersion: "1",
  resource: { ref, digest }, entryKind, entry: { ref, digest }
}
QualificationLocalEntrySelection { entryKind, entry: { ref, digest } }
```

Allowed entry kinds are `inventory`, `scope`, `material`, `provenance`, `law`,
`tenant_manifest`, `coverage_catalog` and `verification_recipe`. Each retains
its existing domain data and identity rules, except the normalized scope and
external-provenance forms specified below. Material values retain exact source
ref, path, byte count, digest and body. A content digest shared by different
source refs does not merge their source identities. A material row may serve
several selections with the same exact coordinate and meaning. References
inside a manifest value, such as provenance record selections, use the local
entry-selection shape. They do not contain the enclosing manifest's coordinate;
this keeps manifest identity acyclic. A local selection resolves only in the
already selected manifest and never authorizes another resource lookup.

`resourceDigest` hashes the complete manifest except its own ref/digest;
`resourceRef = qualification-resource://abiogenesis/<digest>`. Entries resolve
only inside that exact manifest, by kind plus coordinate. Ref-only, path-only,
first-match or ambient resolution is forbidden. Every required selection has
exactly one matching entry. Duplicate manifests, duplicate entries, a ref with
different bytes, a wrong entry kind and an unbound selection refuse. The
manifest is a direct table: it contains no resource-to-resource alias, chained
locator, lazy filesystem callback or discovery instruction. Declaration
selections are exact proof dependencies, not accepted-proof flags.

Declaration preimages resolve from the invoking owner's existing exact
Catalog/View, a directly supplied existing historical source resource, or the
explicit `declarationProofs` list. The selection includes all three historical
coordinates and the canonical complete proof digest. A current Catalog/View
may be borrowed only when all coordinates and the complete proof preimage
match that selection. Distinct roots or Views remain distinct. Ambiguous
multiple sources refuse; the caller omits redundant copies rather than relying
on a preference rule. `reconstructHistoricalDeclarationCatalog` continues to
reconstruct and compare readiness, lock, installed products, publications,
native declaration evidence and Catalog/View against the actual historical
environment. An install receipt alone supplies insufficient declaration bytes.

The caller archives complete canonical resource assertions and every selected
declaration preimage before dependent dispatch, using the existing immutable
invocation/proof archive discipline. The archive is input evidence; it emits no
runtime event and owns no lifecycle. Cold callers explicitly read and supply
these bytes through the same resource assertion. A path recorded in an archive
is evidence location, never an implicit owner read capability. No source tree,
moving installation, discarded preparation directory or process-local prior
success substitutes for a missing resource. Resource availability is a
prerequisite for dependent establishment or semantic consumption, and absence
remains a typed incomplete/refusal outcome.

## 2. Normalized Scope Conserves The Complete Domain

The new scope entry is `qualification_scope_interned`, schema version `1`.
Its body contains subject/law/catalog coordinates, an inventory coordinate,
the existing ordered `ruleGroups`, ordered global surface-group instances,
`referenceSets`, and a discriminated domain mode:

```text
domainMode: "global"                     // no applicationDomains field
domainMode: "per_rule", applicationDomains: [
  { ruleGroupRef, surfaceGroups: SurfaceGroupInstance[] }
]
SurfaceGroupInstance {
  groupRef, memberSet, rootSet, roleSet, ownerSet, sourceSet
}
ReferenceSet {
  kind: "qualification_reference_set", schemaVersion: "1",
  setRef, setDigest,
  elementKind: "rootRefs" | "surfaceRoles" | "ownerRefs" | "sourceRefs",
  encoding: "refs", values: ordered nonempty ref[]
} | {
  kind: "qualification_reference_set", schemaVersion: "1",
  setRef, setDigest, elementKind: "memberRefs",
  encoding: "member_ordinals", inventory: {ref,digest},
  values: ordered nonempty integer[]
}
```

`memberSet`, `rootSet`, `roleSet`, `ownerSet` and `sourceSet` select the exact
corresponding `elementKind` and set coordinate. Member sets use zero-based
ordinals into the exact selected inventory's ordered member array. Each
ordinal is an integer in range and resolves to that member's original ref.
The set's identity includes the inventory coordinate. All other sets retain
ordered original refs. The set digest hashes its body excluding its own
ref/digest; its ref is `qualification-set://abiogenesis/<digest>`. The normalized
scope receives a new content identity under `qualification-scope://abiogenesis/`.
Do not preserve an embedded scope's digest over different normalized bytes.

Sets are interned only when kind, encoding, inventory binding and every ordered
value agree. Do not infer set equality from a group name, owner, cardinality or
similar purpose. A set body is not a rule domain or semantic justification.
All original group instances retain their distinct `groupRef`; every original
per-rule domain retains its `ruleGroupRef`, order and group instances. The
representation permits distinct per-rule partitions, including distinct role,
owner and source relations over otherwise equal membership. It does not turn
them into one global partition.

`per_rule` requires exactly one domain for every declared rule group, with no
extras. Missing or duplicate domains, including a missing override, refuse;
there is no sparse fallback to the global groups. `global` explicitly preserves
the existing absence-of-applicationDomains meaning. Never choose a domain mode
from whether a lookup happened to succeed. Applicability, grouping, uncertainty,
inapplicability authority and residuals remain separate admitted J/O data.

The qualification owner validates effective groups without constructing one
giant expanded scope object. It resolves a referenced set once in its immutable
operation view and borrows the resulting values for each group instance. It
retains all current correspondence obligations:

- Inventory identity, unique member refs/paths and selected roots; scope,
  subject, law and catalog agreement.
- Complete unique catalog rule partition, including exact rule-source sets.
- Complete disjoint member coverage and complete root coverage for the global
  partition and each per-rule domain, independently.
- Distinct group identities, bound roots, exact aggregate surface roles,
  nonempty unique owner/source refs and bound sources.
- Exact task-selected subject members and required source material for each
  selected rule/surface/role; complete classification of each declared domain.

These checks are the relation currently owned by
`qualificationScopeCorrespondence`, `qualificationRuleSurfaces`,
`qualificationTaskScopeMatches` and `evaluateSelfConformance`. Normalization
changes their representation, not their meaning. Root/owner/source adequacy
that currently requires judgment still requires it. Member ordinals grant no
authority and an ordinal list from another inventory refuses even if its length
or visible strings happen to agree.

The frozen 1,950-member/2,137-rule fixture round-trips every scope field exactly.
Its 187 domains and 777 domain groups remain distinct. The report's pure sketch
has 517 interned sets; normalized scope is 2,051,550 canonical bytes and its
separate inventory is 870,019 bytes, versus the 43,152,263-byte embedded scope.
This proves representation conservation and size only. It is neither installed
owner proof nor a speed, memory, semantic-sufficiency or qualification result.

## 3. Compact Semantic Input And Exact Raw Identity

New authoring uses an explicit `representation: "resource_refs_v1"` task
discriminant within the existing qualification contract family. Keep task
kind/schema version, slot/ordinal, subject/law/catalog/inventory, role, Context
metadata, asset surface, selected subject-member metadata, ordered coverage,
prior evidence and residuals as semantic data. Replace:

| Embedded task field | Reference form |
| --- | --- |
| `scope` | Exact scope resource selection |
| `declarations` | Ordered exact declaration selections |
| `material` | Ordered material resource selections |
| `provenance` | Exact provenance resource selection |

The task also binds the exact manifest coordinate. Its resource selections
cannot select another subject/law/catalog/inventory. Context members still bind
source ref/path/digest/byte count, and their inventory digest remains computed
from that ordered metadata. No inaccessible locator supplies assessor context.

The compact task's canonical ref/digest covers the discriminant, manifest and
every selector plus all retained semantic fields. Plan identity continues to
cover its complete ordered slot/coverage/role relations; slots select the new
task coordinate and ordinal. Raw input identity hashes the actual compact
`{kind,schemaVersion,task,plan}` bytes. Neither an expanded surrogate nor the
old input digest is substituted into input admission, materialization,
deterministic evidence, transport or result provenance. Changed resource
content changes the manifest, task, plan and dependent call identities.

Reference-form proof and self-conformance input/result carriers also have the
explicit `resource_refs_v1` discriminant. Reject mixed embedded/reference forms
within one current carrier; historical decoding is the separate relation in
section 9. A judgment's task branch fixes its representation and all source
identity predicates hash that actual branch.

Separate raw shape/identity predicates from owner establishment. Product/raw
admission checks the complete declared serialized form and task/plan
self-correspondence. It cannot establish bytes that it has not acquired.
The existing Run resource/preparation owner resolves all required preimages and
checks raw material/scope constraints before invocation/basis effects. The
CCall-specific native checks in section 4 occur at their actual pre-dispatch
frontier. Known missing or malformed resources do not wait for actor preparation
to refuse. Before dependent actor dispatch or effect, the qualification owner
must complete every required current owner relation in section 4.
Renaming the old material guard to a shape guard while dropping establishment
is invalid. Missing resources are not an empty material list or a pass.

External provenance keeps every activation, preimage, delta, closure, author,
actor, authority, scope, postimage member, change and attribution span. Normalize
its `records` to ordered local material-entry selections in the same manifest. The
original `recordSet` digest is still checked against the canonical ordered
complete record values, not the selector array. The provenance entry receives
its own new identity. Preserve exact source-byte and span checks, actual patch
and currentness relations, native producer admission, F_H acknowledgment when
required, and author/assessor/peer independence. Sharing record bodies never
turns construction metadata into an admitted authorship judgment.

## 4. Initial Establishment And Rendering

The invoking owner obtains one operation-local resolved resource view through
existing native proof operations. It is bound to the actual raw-admitted input,
occurrence, root execution basis and validated predecessor prefix. A JSON copy,
equal carrier, caller receipt or generic `validated: true` cannot obtain that
view. The view is discardable; raw/cold acquisition can reconstruct it from the
declared resources and history. It is not required process-local authority.

Establishment performs, once per distinct dependency within that operation:

1. Raw assertion/manifest/entry identity and unique selection checks; complete
   body/base64/byte-count/digest and UTF-8/span checks where currently required.
2. Exact scope/inventory/catalog correspondence and role/context/material/
   provenance/subject-member correspondence, retaining every check in section 2.
3. Actual historical environment/install/lock and declaration reconstruction;
   exact root Catalog/View, Program, GraphFunction, output-contract owner,
   implementation set/binding and materialized graph/CCall joins. Child entry
   and parent ancestry remain those of the admitted execution basis.
4. Current selected-no-evidence call, raw input and causal producer, slot,
   ordinal, graph locus, published role policy, owner actor/authority,
   capability, frame and permitted effects. Currentness is checked at the actual
   pre-dispatch frontier, not inferred from a historical material digest.

Extend `NativeLeafProofOperations` with a qualification assessment preparation
operation bound to the exact input/occurrence. Thread resources from the Run
owner through `leaf_invocation_port` into that operation and
`realizeQualificationAssessment`. Supply the same explicit dependency in the
supported direct/cold fallback. The implementation receives a borrowed resolved
task view and constructs the worker request from it; it does not privately open
an archive or invent a context reader.

`qualificationWorkerRequest` and its material/selected-subject/construction
helpers consume that resolved view. They render the same selected role,
criteria, exact effective groups, assessed members, source populations, full
selected source bodies, attribution spans, qualifications and residuals.
Declaration/readiness bodies and enclosing historical carriers are not prompt
content unless explicitly selected as material. Preserve the existing raw
response schema and required grouping/unknown/refusal meaning.

For a frozen same-coordinate compatibility rendering, require the retained
prompt SHA `35d718313300c7feb1ebc64d699c373c58dd9de868bc68c9c14a83e7d7ee4264`.
Production reference-form scope/task identities and successor subject/law may
change printed coordinates. Bind that intentional metadata delta explicitly;
the source-body, ordering, selected-domain and rubric comparison must identify
every other change. Prompt size or hash alone cannot prove material sufficiency.

Prepared request and completion borrow the same established view. Do not
re-resolve/decode/hash full bodies merely because execution crosses a helper or
role boundary. Raw/copied ingress, a new cold acquisition or a material
invalidator performs its necessary checks. No cross-invocation warmed fact is
accepted without the new owning basis.

### 4.1 External Source Delta Constraint

The selected source cut owns the current delta: its replacement and addition
rows, checked against the pinned predecessor and current member manifests.
External preparation projects that delta into `lawfulSuccessorChanges.sourceChanges`
with unique complete path/body/bytes/mode/preimage/postimage/author correspondence
and exact accessible original row references. `selectedRelation` describes
provenance/history; it is not change-selection authority. The consumer verifies
that correspondence before body materialization and rendering. Missing, extra,
duplicate, wrong-cut or altered postimage/author rows refuse. Preserve source
labels and original records; do not guess a whitelist or weaken nonempty.
The preparation grant carries this relation into preflight and resource/request
reproof. An integration failure returns to multi-frame Executive triage.

```mermaid
sequenceDiagram
    participant Cut as Selected source cut
    participant Build as Candidate construction
    participant View as Frozen supplier view
    participant Delta as Delta preparation
    participant Packet as Packet preparation
    Cut->>Build: Selected source bodies and attribution
    Build->>View: Current bodies and copy/build provenance
    Cut->>Delta: Approved replacements and additions
    View->>Delta: Current tuples and their role bindings
    Note over Cut,Delta: Source meaning is conserved; historical and current copy/build roles remain distinct.
    Delta->>Delta: Check complete current delta and role-aware correspondence
    Delta->>Packet: Authentic delta before packet materialization
```

The arrows are agent design constraints, not an execution plan. Each provenance
role is checked against its actual producer; source authorship and current
copy/build attribution are distinct. A failed join returns to Executive
triangulation before any selected repair or retry.

## 5. Completion, Admission And Successful Judgment

Completion preserves actual actor/worker/implementation/transport bindings,
tool-call restriction, response artifact, observation, request/prompt digests,
raw value digest and typed failure distinction. A provider failure creates no
qualification judgment. A response parse or successful process is not semantic
satisfaction or full F11 completion.

The successful `QualificationJudgment` contains the compact task and the
existing compact plan, raw J, native basis and complete existing source
provenance. It carries no scope, declaration/readiness, source-body or record
preimage. `source.inputDigest` is the actual compact raw-input digest. Its
judgment ref/digest covers those actual result bytes. Task and plan are retained
by value here because their compact semantic content is needed by existing
slot/coverage consumers; they do not expand resource selections during result
construction or persistence.

The native pre-admission judgment operation receives the established view and
actual prepared request. It verifies exact task/plan/raw criterion correspondence
and the existing actual actor artifact/transport relation. Extend
`NativeJudgmentProofOperations` for this assessment relation and pass it through
`qualificationResultRelation` and result-evidence lineage validation. Extend
the existing `ProductSemanticsProvider.validateResultEvidenceLineage` basis with
that nonserialized owner operation; the leaf port supplies it for the exact
candidate, rather than trusting a candidate-provided request. The latter
currently regenerates `qualificationWorkerRequest` from the result's embedded
task; it must consume the owning established request at this boundary instead.
The expected request is not supplied by the candidate result. Direct candidate
validation without an owning view must explicitly reacquire resources or refuse.

ABG still admits the actual Result, probabilistic transport evidence and
causally matching advance/reject J under the published predicate. No new receipt,
admission event or success flag is introduced. Falsified/indeterminate J remains
a valid admitted assessment whose semantic disposition is non-green downstream.

### 5.1 Shared Evidence Contract Across Result Lineage

REQ-P-QUAL-064A and REQ-P-SELF-CONFORMANCE-007A require one conserved
producer-to-consumer relation. The result-lineage handoff carries a shared
TypeScript evidence projection contract, consumed by the actual ABG result
callback, LeafInvocationPort bridge and both Product semantics hook bases.
Generic JSON records do not express this interface contract.
The framework library owns this contract once. Every participant consumes that
definition and the declared source-to-destination transformation; Product
extensions supply domain predicates through the existing hook rather than
redeclaring the framework evidence interface.

The admitted evidence and delivered projection discriminate evidenceClass.
The probabilistic_transport branch requires actorInvocationRef, actorRef,
workerBindingRef, transportBindingRef, transportBindingDigest, requestDigest,
promptDigest, transportDisposition and transportFailureClass. The common
projection requires cCallRef, cCallAttempt, evidenceRef, evidenceDigest,
evidenceClass, inputDigest and outputDigest and preserves the existing
transportDigest behavior. A successful or failed transport retains its actual
disposition and its nullable failure class. Other evidence classes preserve
optional absence and existing null behavior; they do not acquire actor data.

The ABG evidence producer checks its actual admitted body against the
appropriate discriminated type at minting. The result callback checks its
actual projection against the same delivered contract. A cast, an all-optional
projection type or candidate-derived metadata cannot establish conservation.
Each delivered lineage field equals the corresponding admitted field; the
attempt coordinate comes from the exact C call. No field is reconstructed
from the judgment candidate. Existing native-work and Consensus consumers
retain their delivered subset and existing guards.

The integration frame binds these workspace variables: the raw transport
contract and actual admitted row; the admitted type and checked producer;
the projection code and shared destination type; the actual leaf bridge;
the Product lineage predicates and prepared request; the admitted Result/J;
child terminal disposition, ordinary parent foldback and fresh result/replay.
Required fields, authority, absence/null and equality are checked at these
specific joins. A component result does not close this conjunction.

Proof exercises the actual success callback for embedded and reference tasks,
retains refusal for corrupted lineage, and checks that omitting each required
probabilistic field fails against the real shared compiler contract. Dynamic
admission and lineage checks continue to establish authentic ownership and
equality. The earliest installed composition discriminator is actual raw
response admission through Result/J, ordinary child/parent completion,
self-conformance consumption, the truthful non-green AF22 outcome for incomplete
coverage and six fresh CLI reads. A controlled response supplies only a carrier
premise; genuine independent assessment, complete qualification and release
remain separate obligations. This design introduces no new runtime entity,
event, controller, serialized carrier, Product outcome or weaker validator.
Its TypeScript declarations become more specific.

## 6. Admitted Consumption And Cold Proof

`qualification_proof.ts` must distinguish initial candidate establishment from
consumption of an admitted assessment. The current declaration fallback at
`deriveGraphOwner` (`declarationsOf(root.rawInputValue)`, currently line 149)
cannot resolve new reference tasks. Resolve their declaration selections through
the explicit acquired resource context and retain all existing Product
reconstruction and historical-environment joins. Embedded historical inputs
retain their existing decoder route. Do not infer a proof from today's install.

The current `projectQualificationJudgment` regenerates the worker request around
line 504 and re-enters `projectQualificationConsumer`, whose phase predicate is
initial selected-no-evidence. Replace that consumption path with an admitted
assessment projection in the same ABG qualification owner. It authenticates:

- Exact proof prefix/store and its relation to the current consumer prefix;
  the selected Result, actual assessment CCall, native preparation cut,
  invocation, Program, root/child basis, GraphFunction/locus, implementation
  owner, input/result contracts and published judgment predicate.
- Actual admitted compact input identity, task/plan/slot/ordinal/role/coverage
  relation and exact manifest/declaration selections; matching successful
  Result, probabilistic transport evidence and causally matching advance J.
- Actual actor invocation, worker, transport binding, request/prompt/raw/
  observation digests and the `actor_result_artifact_observed` JSON value;
  unique eligible producer and declared wrapper/child foldback, never an equal
  body from a competing producer.
- Original construction/provenance and any required owner ruling; current
  consumer subject/law/inventory/scope/material correspondence and required
  author/peer independence, with existing source invalidation and physical
  currentness checks at their own boundaries.

These are checks of the admitted owner result and its actual evidence, not a
new execution of rendering or preparation. Do not regenerate the full worker
request to consume that fact after Result and advance J. Initial establishment
and result-lineage admission have already bound that request. Before Result,
before J, on a mismatched request/artifact/evidence, or with a crossed producer,
the admitted-consumption route refuses. A successful tuple or matching digest
without those events establishes nothing.

Thread the explicit resource context through `nativeState`/`producerForResult`,
`resolveQualificationAssessments`, construction-author/ruling projections and
execution-source proofs where their declared selections require it. Each
historical root uses its own declaration selector and prefix. Existing
`QualificationProofResource` becomes a discriminated reference form with
declaration selections; its prefixes, evidence selections and original
execution-source coordinates remain semantic data. Full historical declaration
proofs move into the resource assertion rather than being copied into that
proof field. Existing R10 `historicalSource` alone is not this F11 contract.

Cold establishment and cold semantic assessment consumption receive the
immutable assertions explicitly from the archived bytes, reopen the existing
event resource and reconstruct through the same owners. Close/reidentify
durable coordinates only through the existing exact-prefix mechanism. An
unrelated store, future cut, missing dependency, wrong View/catalog, crossed
manifest or changed selected source refuses. Advancing unrelated history does
not invalidate an immutable established fact; actual dependencies and the
requested current use decide applicability. Physical currentness is never
derived from a frozen source body.

## 7. F11 Input, Scope Output And AF22

Reference-form `SelfConformanceInput` retains exact candidate basis,
applications, evidence citations, plan and qualification evidence selections.
Replace its full scope/inventory/law/tenant/authority/source/coverage/recipe
bodies with typed selections into the same finite resource assertion. Preserve
the existing nullable/optional meanings explicitly; absence is not a populated
empty entry. This closes the downstream cone instead of re-embedding assessment
proof into the F11 entry. Resolve original execution material through its
existing native proof owner, not a caller-authored replacement.

`evaluateSelfConformance` receives the owner-resolved view and admitted
assessment projection. Its full catalog/member/rule/domain checks, source-byte
correspondence, actual verification evidence, attribution, applicability and
sufficiency judgments remain complete. It does not materialize a 43 MB scope
for each assessment comparison. Compare authenticated identities and exact
selected source relations after establishment, retaining the complete actual
body relation as the raw/cold fallback.

`SelfConformanceResult.scope` is an exact scope resource selection, not the
complete scope currently returned at `self_conformance.ts:255`. Preserve exact
subject/law/inventory/input/owner identities, complete rule applications,
findings, evidence citations, verification and disposition. Its result digest
hashes the actual compact bytes. A resolved scope projection can supply full
groups only when the caller provides its complete resource assertion; the
selector itself is not supplied source content. Missing mandatory coverage or
unknown grouping still blocks F11; scope sharing cannot create a pass.

The sole AF22 continues to consume the exact whole admitted F11 result through
`projectQualificationSelfConformance` and existing same-subject/same-law proof.
Its reference-form proof selects declaration preimages from resources. It does
not re-run initial J preparation, mint a per-behavior Result or interpret a
resource receipt as a qualification verdict. F11 findings and the AF22 verdict
retain distinct owners. No release gate or bypass changes.

## 8. Child, Continuation And Supported Read Consumers

The Run owner's resource context applies to explicitly selected dependencies
of its declared child calls. A child keeps its own admitted entry/current input,
basis, frame, parent and foldback relation. Resource availability does not grant
new call rights or wider Context. A parent retains unresolved obligations when
an assessment child completes.

Continuations receive the same optional qualification resource assertion through
the existing Run resource interface. They reconstruct the admitted original
producer and current continuation position. A retained Result/J remains usable
without rerunning its actor merely to rebuild proof bodies; missing resources
for a newly needed semantic check produce a gap. A changed task/law/subject or
resource requires new dependent establishment and identities, not retargeting
the historical Result. Exact prefix/causal binding and continuation authority
remain owned by existing ABG mechanisms.

Fresh Public root Result and Run replay may return admitted compact values and
their exact resource coordinates without expanding preimages: these reads
project actual admitted values. Root projection does not automatically perform
a new self-conformance evaluation. Child R10 continues to require its existing
exact historical declaration proof and ancestry joins. Materializing a declared
graph from a compact admitted input must preserve its actual input digest and
contract; it must not demand an embedded qualification proof that no longer
exists.

Any supported read that validates or expands a qualification selection receives
the optional assertion through the existing ABG project-read resource interface,
not its semantic request. Add that narrowly scoped optional resource only where
the implemented read actually needs it; the native qualification proof functions
also accept the explicit resource context in their supported direct/cold form.
No new Public member or opaque lookup protocol follows. Ordinary projection
without expansion remains possible; a claim to resolve semantic source content
without its declared preimage refuses. Fresh reads append no events and neither
change old Result identities nor acquire authority from warm process state.

## 9. Historical Cut And Successor Discipline

Preserve the frozen C02/Q02 resources, old input/task/plan/scope/prompt digests,
failed native invocation and original event prefix byte-for-byte. Their exact
embedded forms remain historical evidence under the pinned installed owner.
Where existing supported decoders read those actually admitted forms, preserve
their identities and complete meaning; do not silently normalize old bytes into
reference-form identities. This is preservation of the actual accepted paths,
not a universal compatibility promise or permission to mutate the RC1 cut.

New authoring and changed packages create one separately frozen successor under
the live RC2 Definition, exact generated catalog/law/source/member basis and its
actual source/artifact/install identities. The retained full fixture supplies
representation/cost comparison evidence; it cannot qualify changed successor
bytes or a different law. The separate RC2 law-staging correction is a dependency
of successor qualification, not part of this design's effects. Reuse unaffected
accepted Hello/scenario evidence with its recorded limits; this design selects
no additional audit or native campaign.

## 10. Bounded Implementation Territory And Discriminator

The implementation grant should name these owner files, with changes limited
to this relation:

| Territory under `build_tenants/abiogenesis/typescript/` | Required effect |
| --- | --- |
| `code/src/validator/qualification_contracts.ts`; new `code/src/validator/qualification_resources.ts` | Closed reference forms, resource/set identities, pure complete resolver and establishment data |
| `code/src/validator/qualification.ts` | Effective scope/material/provenance checks, resolved rendering and compact judgment constructor |
| `code/src/validator/self_conformance_contracts.ts`, `self_conformance.ts`, `self_conformance_basis.ts`, `self_conformance_semantics.ts` | Compact F11 input/output, owner/resource dependence and complete admission/lineage predicates |
| `code/src/abg/qualification_proof.ts` | Declaration selection, initial/admitted distinction and complete cold consumer joins |
| `code/src/implementation/contracts.ts`, `qualification.ts`, `leaf_invocation_port.ts` | Exact native proof plumbing, borrowed request/completion and candidate admission |
| `code/src/product/run_invocation_operation.ts`, `semantics.ts`; `code/src/owner_bindings/run_invocation.ts` | Optional Run/continuation assertion admission and owned resource propagation; existing semantic-lineage callback's nonserialized owner dependency |
| `code/src/abg/project_read_definition_bindings.ts`, `project_read_ports.ts` | Only a supported read's demonstrated resource/compact-contract dependency; preserve existing projection and R10 owners |
| `code/src/gtl/self_conformance.ts` | Publish the changed existing input/output/type contracts; no new topology, regime or callable |
| `scripts/generate-qualification-rule-catalog.mjs`, `scripts/generate-product-manifest.mjs` | Project new data/native/resource schema identities using existing generators; separate law-staging authority owns law selection |
| Generated `contracts/schemas/self-conformance.schema.json`, affected existing Run/project-read binding schemas, native declarations, qualification publication, `product-toolchain-manifest.json` | Derived exact successor identities; generated by authorized build, never hand-edited into the old cut |
| New `test_env/tests/t287-qualification-carrier-resource.test.mjs`; affected existing `t287-qualification-scopes`, `producer-context`, `producer-acquisition-reuse`, `contraction` and `law` tests | Full retained fixture conservation and affected owning-boundary checks; adapt actual changed interfaces only |
| One new successor proof/preparation directory under the existing commentary carrier | Resource archive and compact caller inputs, lazy diagnostic serialization, installed accounting and cold evidence |

Execution-basis/event-store/body-codec rewrite, a new artifact service and
sibling changes are excluded. Compact semantic values already address their
retained-input/result amplification. If an existing record cannot establish a
listed native join, return the exact missing relation to Executive before
expanding this territory.

The first whole-path discriminator is one packed/installed ordinary Run using
the full retained scope population and explicit immutable resources: raw compact
input -> current owner establishment -> full selected prompt -> controlled
mechanical actor exchange -> admitted compact successful Result and advance J
-> ordinary child/parent closure -> fresh-process Public Result/replay -> cold
assessment consumption -> compact F11 scope output and sole AF22 disposition.
Bind the exact fixture/catalog/law relation that the installed owner permits;
do not pass historical C02 data off as successor qualification. For a successor
subject, record the lawful source/catalog/inventory changes separately from the
frozen-fixture conservation comparison. A controlled response proves transport,
carrier and admission mechanics only. The retained one-criterion task leaves
complete F11/AF22 blocked unless all independently required assessments exist.
Do not fabricate a green full-subject result to make this discriminator pass.

Select the following nearest negatives on that same full population, with
otherwise unchanged inputs and repaired identities where needed to reach the
meaningful guard:

| Mutation | Required observation |
| --- | --- |
| Omit one member from one per-rule domain; overlap two groups; omit one domain | Complete-domain refusal before actor/effect; global coverage cannot rescue it |
| Preserve two genuinely distinct per-rule partitions and all original group refs | Both resolve exactly; no global substitution or inferred applicability |
| Missing manifest/entry/preimage; wrong entry kind; crossed set inventory or out-of-range/duplicate ordinal | Typed unresolved/resource/domain refusal, including cold acquisition |
| Wrong Catalog/View/readiness, crossed historical root, duplicate exact dependency or stale source span/body | Existing declaration/material/native-owner refusal |
| Cut before Result or J; equal forged J; crossed CCall/actor/artifact/request or competing eligible producer | Admitted-consumption refusal without re-dispatch |
| Unknown/falsified grouping, missing role/material or non-independent assessor | Admitted assessment retains its meaning; complete F11/AF22 remains non-green |
| Fresh process with complete archive; fresh process missing a required resource | Exact cold agreement in the former; precise dependent semantic refusal in the latter; no events appended |
| Child success with outstanding parent work; covered continuation and changed/uncovered basis | Ordinary obligation conservation; valid reuse or refusal through existing owners |

Account for the entire installed path: semantic input, assertion/archive,
serialized CLI/authority request, prepared/expanded selected material, appended
basis/result bytes and cold-read bytes; elapsed preparation/validation/render/
admission/read phases, transformation counts and peak heap/external/RSS with
measurement scope stated. Separate one-time resource acquisition from ordinary
handoff work. Count full-body encodes, decodes, hashes and copies by dependency
extent. New basis/J/F11 result values must contain no proof preimages; ordinary
handoffs must not reacquire full resources. Distinct proof bodies are acquired
only for their genuine declared dependency, not again for each wrapper.

Use the same configuration and full fixture for baseline/comparison, and vary
unrelated old history to expose renewed copying. Declare a fixture-specific
operational envelope from the measured repaired path; this proposal invents no
universal quota or unmeasured timing target. A smaller local fixture, heap
increase, prompt trimming or warm-only pass does not close the whole-path claim.

Design readiness consists of the pinned complete relation and exact scope
round-trip. Source/build/installed readiness, actual resource availability,
mechanical whole-path cost and cold proof remain implementation obligations.
Genuine independent native F11 J, semantic sufficiency and qualification remain
separate Executive-selected work; current restricted DNS prevents that native
proof and supplies no green result. Freeze this proposal and stop before those
effects.
