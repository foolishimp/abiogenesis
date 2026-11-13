# RELEASE

Tier 2. Owns release publication: the release-publication bounded
context, release identities, project-qualified refs and the project
subtree, historical ref conservation, the three phases with candidate
construction, immutable RC or stable publication, exact-cut qualification and
monotonic version-line advancement, the selector and its relation to
consumer adoption, naming, release-scoped assets and the Product subject,
coordinated release-matched asset cohorts, acceptance, external
qualification dependencies and successor baseline conservation
(STDO-UP-015) with its disposition values. Its family table (F15) is §1
Foundation to law. It consumes [FOUNDATIONS](FOUNDATIONS.md) (§2 the
product lineage objects, among them the release objects candidate source,
release cut, release subject and version-line selector, defined there
once; §4 [Results](FOUNDATIONS.md#results), the core result algebra, and
[Conjunction of results](FOUNDATIONS.md#conjunction-of-results)),
[ACTIVATION §3 Effects](ACTIVATION.md#effects) (the result of an intended
effect), [IDENTITY](IDENTITY.md) (object identity and its boundary with release
version), [EVALUATION](EVALUATION.md) (§1 claims, §5 acceptance),
[AXIOMATIC_CALCULUS §7](AXIOMATIC_CALCULUS.md#7-layers) (AC-020, layer
and release separation) and [§8](AXIOMATIC_CALCULUS.md#8-calculus-identity)
(the calculus identity record issued at a release),
[SPEC_METHOD §6](SPEC_METHOD.md#6-lineage-and-release) (lineage and the
release version boundary) and
[PRODUCT_DEFINITION §4](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager)
(the installed release basis, the adoption plan and the toolchain manager);
it defines none of those twice. Git, tag, branch, the `stdo://` URI forms
and the Product names of the Specification Stack are this Product's
realisation and toolchain terms. Every clause names the principle that
requires it (P0 to P6, FOUNDATIONS §3).

## 1. Context and position

This member owns the release-publication bounded context
`urn:stdo:bounded-context:release-publication` under the selected complete
STDO basis. It owns the identities and transitions used to qualify,
publish and select released cuts. It does not own Product meaning or
consumer adoption; the consumer side of adoption is PRODUCT_DEFINITION §4
(P6, P3).

Release process is distinct from live project specification. Live
specification defines the current constitutional truth of the project.
Release process defines how one published point-in-time cut is evaluated,
bounded, named, published and made discoverable (P3).

The release authority selects one of two disjoint cut profiles (P3, P6):

- RC: product-local `v<version>-rc.<n>`, with a mutable `v<version>`
  version-line selector naming the greatest published positive RC ordinal;
- stable-v1: product-local `v<major>.<minor>.<patch>`, with no RC suffix and
  no separate mutable selector at that ref, under
  [§2 Stable cuts](#stable-cuts).

Both profiles identify immutable published releases. The RC suffix does not
make a published release provisional or require a second final cut. The
stable profile is an explicit naming and discovery choice, not stronger
semantic qualification. Equal product-local names do not collapse different
Products. A mutable RC selector remains discovery, never an exact
constitutional, dependency, evidence or replay basis (P3, P6).

Release handling is downstream of intake triage. A bug, feature,
regression or release blocker first receives its change class, lawful
re-entry point, affected scope, downstream proof obligations and
version-line disposition
([SPEC_METHOD §4](SPEC_METHOD.md#universal-intake-triage)). The existence
of an RC window does not authorise untriaged mutation (P0, P6).

Results. This member defines no result values of its own. Where it says
that an operation is refused, stops or fails closed, the operation does
not complete; its intended effect, with any part of it that began, is
reported under [ACTIVATION §3 Effects](ACTIVATION.md#effects), never as
`completed`.
Where it calls a release state invalid or a cohort incomplete, or says
that a verification fails, the condition named is a counterexample to the
predicate that check evaluates, and the check returns its value under
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results). What the disposition
values of §9 are, §9 states. Purpose and material relation: release
outcomes combine with every other result in the one core, so a refused
publication or a failed verification is never read as a published or
qualified cut (P5, P6).

### Foundation to law: release and successor conservation

This family (F15 in the index of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law))
decides how a product's releases are identified, published, qualified,
accepted and selected, and how a successor conserves its predecessor's
claims. Its instance premises, which the commitments do not supply, are
named in the rows as follows: recursive products, a released product may
build other products and the next version of itself; published cuts, a
project publishes point-in-time cuts of its product for review, replay and
adoption by consumers it does not control; mutable carriers, the carrier
that holds a release has movable names and may hold several independently
released projects; derived assets, some products are released with
derived or distributed assets that must match their source; external
services, some claims depend on services outside the carrier; successor
lines, a product evolves from a predecessor release whose claims may
affect it. The index also assigns to this family
[FOUNDATIONS §2 Product lineage objects](FOUNDATIONS.md#product-lineage-objects);
the table traces that section in its first two rows, whose rule column
names it, and owns none of it. Each commitment's standing is written as
the table of commitments in FOUNDATIONS §3 states it.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P3 (independent); P6 (independent); instance: recursive products | By P3 each object binds its own identity and basis, so substrate, development product, source project, release cut, product, install, artifact and product definition are distinct objects. A mutable source workspace binds no fixed identity and so is not called a product; by P6 binding grants nothing, so an install acting as builder substrate is bound as a development product and transfers no meaning or authority to the product being authored, and a product definition is a source-project surface, not the released artifact. | [FOUNDATIONS §2 Product lineage objects](FOUNDATIONS.md#product-lineage-objects), the taxonomy and its governing rules | the eight roles, their concept identities and the compiler analogy as the intended model: choices of FOUNDATIONS §2; their application to lineage: [SPEC_METHOD §6](SPEC_METHOD.md#6-lineage-and-release) (family F10) | 1, 2 |
| P3 (independent); P6 (independent); instance: published cuts, mutable carriers | By P3 an identity binds exact content, so a candidate source, a release cut, a release subject and a version-line selector are distinct, and equal version text collapses none. A selector or mutable carrier may move and a release cut never moves, so a selector is discovery, not identity and not an exact basis; by P6 sharing a carrier grants nothing, so material does not become a member by sharing one. | [FOUNDATIONS §2 Product lineage objects](FOUNDATIONS.md#product-lineage-objects), Release objects; [§1](#1-context-and-position), the selector paragraph; [§2](#2-release-identities) | the four generic objects: choices of FOUNDATIONS §2; their realisation as Git branches, tags and aliases in the seven identities: domain choices of this member | 1, 2 |
| P3 (independent); P6 (independent); P0 (recovered); instance: published cuts | By P6 an authority owns only what it is admitted to decide, so release process is separate from live specification and owns neither Product meaning nor consumer adoption. By P3 and P0 a release changes what consumers bind, so release handling follows intake triage, and an open release window authorises no untriaged change. | [§1](#1-context-and-position) | the bounded-context identity and the cut and selector name forms: domain choices of this member; triage: [SPEC_METHOD §4](SPEC_METHOD.md#4-change-management) (family F11) | 1, 9 |
| P5 (derived from P0 and P6, with P0's open-world premise); P6 (independent) | By P5 a value decides only what its evidence establishes, and by P6 an operation's outcome is not its acceptance, so a refused, stopped or fail-closed release operation, an invalid state and a failed check report in the one core, and none is read as success. | [§1](#1-context-and-position), Results | none | 3, 9 |
| P3 (independent); P6 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); instance: mutable carriers | By P3 a cut must be re-acquirable from what it binds, so a cut binds the namespace, exact ref and commit, subtree root and tree, member inventory, claims and dispositions, and an inventory without these is not a reacquirable identity. By P6 and P1 a name or path grants no membership, so each project's refs carry the namespace Product release authority assigns, and a tag over a shared commit makes no sibling a member. By P4b published identities are not erased, so existing refs and public URIs are conserved, never recreated or moved. | [§2](#2-release-identities), Project-qualified Git refs, Project-subtree release identity, Historical ref and public-URI conservation; [§5](#5-naming); [§6 Product subject and repository carrier](#product-subject-and-repository-carrier) | the ref shapes, the namespace pattern, the canonical root spelling, the naming examples and the unqualified single-project profile: domain choices of this member; each namespace, the three allocated ones included: the Product release authority | 1, 2, 8 |
| P3 (independent); P6 (independent); P0 (recovered); P5 (derived from P0 and P6, with P0's open-world premise); instance: published cuts | By P3 review and replay need one fixed subject, so publication fixes one exact immutable subject, and a change to any qualifying byte, a release-scoped asset included, needs a higher immutable cut. By P6 and P0 consumers rely only on what was released, so mutable candidate source is non-operative for released consumers. | [§3](#3-phases), Mutable candidate construction and Immutable RC publication; [§6 Release-scoped assets](#release-scoped-assets) | the division into three phases (mutable candidate construction; immutable publication; exact-cut qualification, acceptance and explicit adoption), the rule that there is no second final cut, the ten publication steps, the six release-scoped surfaces and the RC ordinal: domain choices of this member | 1, 9 |
| P6 (independent); P1 (independent); P3 (independent); instance: published cuts | By P3 and P6 a verdict holds for the exact subject and claim it binds, so qualification binds the exact cut, claims, basis, each claimed property with its observation boundary, evidence, verdicts, gaps and successor relation, and acceptance is the acceptance authority's verdict over the exact immutable cut. By P1 a weaker kind of evidence does not stand for a stronger claim. A verdict moves no selector, and a change to a qualifying byte leaves the verdict on the old cut. | [§3 Exact-cut qualification](#exact-cut-qualification); [§8 Acceptance criteria](#acceptance-criteria) | the seven acceptance criteria: domain choices of this member; the generic claim and acceptance law: [EVALUATION §1](EVALUATION.md#1-claims) and [§5](EVALUATION.md#5-acceptance) (family F6); acceptance of each cut: the human Product authority | 7, 9 |
| P3 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P6 (independent); instance: published cuts, mutable carriers | By P3 a selector names an existing cut and never governs, so it advances strictly by ordinal, only to an existing immutable cut, and is refused otherwise; it answers which highest cut exists, never which cut governs a consumer. By P6 a consumer's basis changes only by its own authority, so it changes only by an explicit adoption whose presented plan is accepted; by P5 drift invalidates that acceptance, and resolution fails closed. | [§3 Monotonic version-line advancement](#monotonic-version-line-advancement); [§4](#4-selector-and-consumer-adoption) | the seven advancement steps, the four refusal conditions and the channel URI as discovery selector: domain choices of this member; the adoption plan, its hashing and the manager commands: [PRODUCT_DEFINITION §4](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager) (family F12) | 1, 9 |
| P3 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P5 (derived from P0 and P6, with P0's open-world premise); P6 (independent); instance: derived assets, mutable carriers | By P3 matching is a relation between exact versions, so a declared cohort carries one exact version suffix, and equal versions establish matching only. By P4b and P5 a derived member depends on its source, so a missing, stale or differently versioned member makes the cohort incomplete, and a source change invalidates the derived members, which are regenerated and released under the new cut. By P6 a partial cohort is not the declared one, so publication is atomic or refused, each ref guarded against an unexpected remote state, and verification refuses a partial cohort. | [§7](#7-coordinated-release-matched-asset-cohorts), Two-commit construction and one publication transaction, Qualification and recovery | declaring each cohort: the declaring Product authority; the five members of the STDO stack cohort, the two-commit construction and the per-ref lease: domain choices of this member; any same-version recovery: separately authorised recovery law | 1, 6, 9 |
| P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); instance: external services | By P5 a skipped evaluation has no result, and by P6 a claim is qualified only on its evidence, so a claim that depends on an external service is qualified against a healthy dependency or narrowed before acceptance, and a skipped evaluation establishes nothing about the dependent capability. | [§8 External qualification dependencies](#external-qualification-dependencies) | none | 9 |
| P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P3 (independent); P6 (independent); P1 (independent); P5 (derived from P0 and P6, with P0's open-world premise); instance: successor lines | By P4b and P3 a successor evolves one exact, immutable predecessor whose established claims persist, so it names that predecessor, and every predecessor claim that can affect it receives one disposition. By P6 and P1 a disposition is a claim evaluated on evidence, so naming or code similarity does not prove conservation, and a missing patch does not prove loss when a successor-native realisation preserves behaviour; by P5 an unresolved disposition leaves a gap, so the affected claim cannot be qualified; a changed deterministic kind preserves exact legacy standing and evaluates successor eligibility with its declared remediation status. | [§9](#9-successor-baseline-conservation-stdo-up-015), including [Deterministic-kind migration](#deterministic-kind-migration) | the four disposition values: this member, restating UP-015; each removal: the current Product authority; the record of a successor's dispositions: that successor's construction; the three eligibility/remediation cases: this member, distinct from semantic disposition values; the selected bounded successor or remediation: the operation owner | 1, 9 |
| P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P6 (independent); instance: successor lines | By P4b a change on a support line persists into what the successor retains, and by P6 its effect needs a disposition by evidence, so where a maintenance or support line may affect retained claims, the release basis names its watched source, observation boundary, inclusion policy and successor candidate, and relevant changes receive a disposition at integration and at qualification. | [§9](#9-successor-baseline-conservation-stdo-up-015), the support-line paragraph | the record, branch strategy, comparison and proof mechanism: the consumer; a policy of this member: the four items the release basis names (watched source, observation boundary, inclusion policy, successor candidate) | 1, 9 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law).
The table accounts for §1 to §9 and for FOUNDATIONS §2 Product lineage
objects. §10 records open questions and decides nothing.

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, the lineage objects: [SPEC_METHOD §6](SPEC_METHOD.md#6-lineage-and-release), where the roles are applied to lineage and the product definition is the source project's present-tense surface; [EXECUTIVE_BASELINE §6 Product-chain basis](EXECUTIVE_BASELINE.md#product-chain-basis), whose basis records the distinct role of every lineage object in a chain, and the [EXECUTIVE_BASELINE family table](EXECUTIVE_BASELINE.md#foundation-to-law), whose row for the Product chain imports F15; [WORLD_MODEL §2](WORLD_MODEL.md#2-role-and-imports) and [Builder Project specialisation](WORLD_MODEL.md#builder-project-specialisation), which import the lineage concepts and narrow Source Project without aliasing it; the [ODD family table](ODD.md#foundation-to-law), whose row for builder, release and source distinctions imports F15.
- Row 2, release objects and release identities: [IDENTITY §9](IDENTITY.md#9-release-version-boundary), where the immutable cut is the only exact operative release identifier and the selector only names the highest-ordinal published cut; [SPEC_METHOD §6](SPEC_METHOD.md#6-lineage-and-release), where the mutable tag is a discovery selector and not a dependency, evidence or constitutional basis; [PRODUCT_DEFINITION §4](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager), where the definition's channel selector takes its alias semantics from the release law and is not operative authority; [ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope), Acquisition, where a candidate source or a version-line selector is no substitute for the exact selected basis; the [ODD family table](ODD.md#foundation-to-law), whose row for builder, release and source distinctions imports F15 for the selected release and mutable source.
- Row 3, position and triage: [ODD §15](ODD.md#15-release-boundary), where publication, selector advancement and acceptance stay a process surface apart from graph truth; [SPEC_METHOD §6](SPEC_METHOD.md#6-lineage-and-release), where the cut is release metadata and not part of the live project specification; [§3 Mutable candidate construction](#mutable-candidate-construction), where bounded fixes follow intake triage, and [Immutable RC publication](#immutable-rc-publication), step 1, which confirms the triaged scope.
- Row 4, results of release operations: the clauses of this member that refuse, stop, fail closed or find a state invalid report under it: [§2 Historical ref and public-URI conservation](#historical-ref-and-public-uri-conservation), [§3 Immutable RC publication](#immutable-rc-publication) and [Monotonic version-line advancement](#monotonic-version-line-advancement), [§4](#4-selector-and-consumer-adoption), and [§7](#7-coordinated-release-matched-asset-cohorts) with [Two-commit construction and one publication transaction](#two-commit-construction-and-one-publication-transaction) and [Qualification and recovery](#qualification-and-recovery); no section of another member applies it, and PRODUCT_DEFINITION §4 maps its manager's outcomes into the core through ACTIVATION §3 without this paragraph.
- Row 5, refs, subtree, conservation, naming and the Product subject: [§3 Immutable RC publication](#immutable-rc-publication), steps 6 and 7, which record the namespace, subtree root and tree and create the project-qualified tags; [§3 Exact-cut qualification](#exact-cut-qualification), which binds the namespace, qualified ref, tag object, commit, trees and declared member set; [§4](#4-selector-and-consumer-adoption), whose channel resolution enumerates a namespace's published tags, preserved historical cuts included; [§7](#7-coordinated-release-matched-asset-cohorts), whose cut names and refs render the cohort suffix and whose cut tags are create-only; otherwise no separate consumer applies: the ref shapes, namespaces and the Product subject are this member's domain choices, and the installed-manifest binding of PRODUCT_DEFINITION §4 names the cut's tag object, commit, tree and inventory without naming this section.
- Row 6, candidate construction, immutable publication and release-scoped assets: [AXIOMATIC_CALCULUS §8](AXIOMATIC_CALCULUS.md#8-calculus-identity), whose edition identity record is issued at the release of its bytes and nowhere earlier; [§7](#7-coordinated-release-matched-asset-cohorts) and [Two-commit construction and one publication transaction](#two-commit-construction-and-one-publication-transaction), where derived members are regenerated and released under the new cut and the cut tags are published atomically or refused; [§8 Acceptance criteria](#acceptance-criteria), where release-scoped assets describe the exact cut; [§3 Exact-cut qualification](#exact-cut-qualification), where a qualifying-byte change leaves the verdict on the old cut and a higher cut is published.
- Row 7, exact-cut qualification and acceptance criteria: [FOUNDATIONS §4 Change impact and evidence reuse](FOUNDATIONS.md#change-impact-and-evidence-reuse), where the acceptance criteria are the mandatory gates that stay applicable irrespective of the selection of checks; [§7 Qualification and recovery](#qualification-and-recovery), whose content, local-ref-graph and post-publication qualification bind the exact cut; [§8 External qualification dependencies](#external-qualification-dependencies), where a dependent claim is qualified or narrowed before acceptance; [§9](#9-successor-baseline-conservation-stdo-up-015), where an unresolved disposition blocks qualification of the affected claim.
- Row 8, selector advancement and consumer adoption: [ODD §4](ODD.md#4-method-library-classes), where the selected immutable cut is consumer authority and mutable source and the moving selector cannot repair, replace or outrank it; [PRODUCT_DEFINITION §4](PRODUCT_DEFINITION.md#4-shared-installed-release-basis-and-toolchain-manager), whose `adopt` resolves the selector only to present an exact digest-bound plan and whose `sync` never consults it; [SPEC_METHOD §6](SPEC_METHOD.md#6-lineage-and-release), where the selector cannot silently change a consumer selection.
- Row 9, release-matched cohorts: [PRODUCT_DEFINITION §4 Explicit complete consumer update](PRODUCT_DEFINITION.md#explicit-complete-consumer-update), which binds the complete companion population of one exact upstream cohort and verifies its dependency closure before relying on it; otherwise no separate consumer applies: declaring a cohort is the declaring Product authority's act under this section, and SPEC_METHOD §6 refers the process for cutting a release to §2 to §8 and applies none of it.
- Row 10, external qualification dependencies: no separate consumer applies. The rule acts inside this member's qualification and acceptance (§3 Exact-cut qualification, §8 Acceptance criteria), where a claim that depends on an external service is qualified against a healthy dependency or narrowed; the result of a clean skip is FOUNDATIONS §4 Results', Not performed, which this section applies, and no section of another member names this section.
- Row 11, successor baseline conservation: [EVALUATION §5](EVALUATION.md#5-acceptance), where a successor's acceptance evidence includes the disposition record and an unresolved disposition blocks acceptance; [SPEC_METHOD §2 Requirement categories and classification](SPEC_METHOD.md#requirement-categories-and-classification), where each predecessor claim takes its disposition by this section's predicates and no lifecycle status supplies it, and [§7 Fundamental migration](SPEC_METHOD.md#fundamental-migration), where no migration class is or supplies a disposition; [FOUNDATIONS §1](FOUNDATIONS.md#1-vocabulary-of-standing), which keeps the standing of a commitment apart from a disposition, and [§4 Preservation through construction](FOUNDATIONS.md#preservation-through-construction), where a change to the governing meaning follows the successor rules; [TICKETS §7 Recorded judgment and owner-ruling continuity](TICKETS.md#recorded-judgment-and-owner-ruling-continuity) and [ODD §11.5D](ODD.md#115d-constructive-evaluation-and-yield-loop), which keep repricing dispositions and closure decisions apart from the disposition of a predecessor claim; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminators 7, 8 and 49; [§2 Project-subtree release identity](#project-subtree-release-identity) and [§3 Exact-cut qualification](#exact-cut-qualification), which bind the dispositions and the successor relation this section requires; the selected work carrier records the disposition values and supplies no decision by its presence. Deterministic-kind migration is consumed by [AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds) and [§7](AXIOMATIC_CALCULUS.md#7-layers), [ODD §5](ODD.md#probabilistic-compute) and [§11.7A](ODD.md#117a-conforming-agentic-development), whose unresolved admission-gate eligibility stays open under the migration relation, [TRAVERSAL_OCCURRENCE kind binding](TRAVERSAL_OCCURRENCE.md#closed-constraint-judgment-residual-and-stop-kinds), [DESIGN_MODULE §2](DESIGN_MODULE.md#2-graph-execution-alignment-and-escalation), [EVALUATION §2](EVALUATION.md#2-separation), and [CONFORMANCE D301-08](CONFORMANCE.md#deterministic-kind-and-continuation-discriminators).
- Row 12, support lines: no separate consumer applies. The record, branch strategy, comparison and proof mechanism are the consumer's, as the choice column states; a release basis that names a watched source does so under this paragraph, and no section of another member names it.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

## 2. Release identities

The release-publication context distinguishes (P3):

- Project Release Namespace: a stable repository-local key assigned by
  the Product release authority to one independently released source
  project;
- Project Subtree: the exact repository-relative source-project root and
  Git tree object selected for one cut;
- Candidate Source: the candidate source of FOUNDATIONS §2, the mutable
  source-project state constructing a possible successor;
- RC Branch: a mutable project-qualified carrier for the current
  candidate window;
- Immutable Release Cut: an annotated project-qualified Git tag plus its
  exact Product release subject (FOUNDATIONS §2), under the selected RC or
  stable profile; publication, qualification and acceptance retain their
  respective meanings; it realises the release cut;
- Version-Line Selector: the mutable project-qualified tag alias naming
  the highest-ordinal published immutable RC cut for that project and
  version line; it realises the version-line selector of FOUNDATIONS §2;
  and
- Release Branch: an optional mutable project-qualified convenience
  carrier aligned to the same latest-published commit as the selector.

Equal version text does not collapse these identities. Branches and the
version-line selector may move. An immutable release tag never moves (P3).

### Project-qualified Git refs

`<project>` is one explicit Project Release Namespace. It matches
`[a-z0-9]+(?:[-_][a-z0-9]+)*`, contains no slash, is unique within the
release source, and remains stable for the continuing release line. It is
assigned by the Product release authority. A directory name, display name,
definition label, package name or matching version cannot infer or
reassign it (P3, P6).

A shared release source uses these exact ref shapes for an RC-profile
publication (P3):

```text
RC branch:              refs/heads/rc/<project>/<version>
immutable RC cut tag:   refs/tags/<project>/v<version>-rc.<n>
version-line selector:  refs/tags/<project>/v<version>
release branch:         refs/heads/release/<project>/<version>
```

The short Git tag names are therefore `<project>/v<version>-rc.<n>` and
`<project>/v<version>`. A shared release source does not publish a future
cut or selector under the unqualified `v<version>-rc.<n>` or `v<version>`
refs (P3).

A single-project release source may retain the unqualified ref profile
only while it has exactly one independently released project and its
release record declares that profile. Adding a second independently
released project requires project-qualified refs before either project
publishes another cut (P3).

For the Specification Stack shared source, the allocated namespaces are
`specification_methodology`, `axiom_indexer` and `stdo_representation`.
These keys distinguish release refs; they do not merge the three Products
or imply a dependency or composition relation (P3, P6).

### Stable cuts

The `stable-v1` profile publishes an immutable release directly as
`refs/tags/<project>/v<major>.<minor>.<patch>`. Each numeric component is a
nonnegative decimal integer, with no leading zero except the single digit
`0`. The tag is annotated, targets a commit and contains exactly one
standalone annotation line (P3):

```text
STDO-Release-Profile: stable-v1
```

Its exact release declaration names the same stable cut, declared payload,
source selection and predecessor. The installed manifest records
`release.profile = "stable-v1"` alongside the complete identity of
[Project-subtree release identity](#project-subtree-release-identity).
An RC manifest retains its prior shape; adding stable support must not
change the canonical bytes of a historical release manifest (P3, P4b).

The stable coordinate is available only on a fresh version line with no
same-version RC tag in either the historical or project-qualified namespace
and no historical unqualified bare-version tag. The stable tag itself is
create-only. A same-line collision or a missing, duplicated or different
profile marker refuses stable acquisition; bare spelling or annotation alone
cannot turn an RC selector into an immutable cut (P3, P5).

There is no separate version-line selector or RC branch for this profile.
A channel `stdo://channels/<major>.<minor>.<patch>` may discover that exact
immutable stable tag; its cut ordinal is absent (`null`), and resolution
must verify the stable profile and complete identity. That channel route
creates neither another tag nor mutable alias semantics. Consumer adoption
still follows §4 (P3, P6).

A published stable tag never moves. Any change to its qualifying bytes
requires a new version and a new immutable cut, not an RC added to the
already stable line. Historical RC lines keep their selector semantics,
refs, objects, peels and URIs; this profile neither finalises nor renames
them. An RC-labelled published release remains a proper release (P3, P4b).

### Project-subtree release identity

In a shared release source, an immutable cut binds all of (P3):

- the Project Release Namespace and owning Product authority;
- the exact qualified Git ref and annotated tag object;
- the peeled commit and repository-root tree;
- the normalised repository-relative Project Subtree root at that commit;
- the Git tree object at that exact Project Subtree root;
- the declared Product member inventory and release-scoped claim bytes;
  and
- the predecessor and successor dispositions required by §9.

The Project Subtree root is a locator inside the exact peeled commit, not
Product identity. Its canonical spelling is the slash-separated Git path
from the repository root, with no leading or trailing slash and no empty,
`.` or `..` component; `.` alone denotes the repository root. Each
non-root component names the exact tree entry bytes traversed at that
commit. Moving a source project changes this locator and its cut identity
without reassigning the Project Release Namespace. If the source project
occupies the repository root, its project-subtree tree equals the
repository-root tree (P3).

A tag over a monorepo commit does not make sibling subtrees Product
members. Unrelated sibling bytes remain carrier state outside the declared
Product subject. Conversely, a member inventory or payload digest without
the qualified ref, commit, Project Subtree root and Project Subtree tree is
not a complete reacquirable release identity (P3, P6).

### Historical ref and public-URI conservation

Project qualification is prospective. Existing unqualified refs retain
their names, objects, peels and public links. A historical tag object may
remain reachable through an additional archival ref, but it is not
recreated, re-annotated, moved or replaced. An immutable historical tag
remains the same object regardless of which preserving ref reaches it
(P3, P4b).

Product-local cut names and public logical release URIs also remain
unchanged. An RC logical STDO release remains
`stdo://releases/v<version>-rc.<n>/`; a stable release uses
`stdo://releases/v<major>.<minor>.<patch>/`. The project-qualified Git ref is
transport identity and is not inserted into that URI. Resolution binds
the public logical cut to its exact historical or project-qualified Git
ref and fails closed if one project-local coordinate names different tag
objects (P3, P5).

When one version line spans the transition, latest means the greatest
positive RC ordinal across that project's preserved historical cuts and
its qualified future cuts. The first qualified publication creates the
qualified selector. The historical unqualified selector is preserved at
its existing object and ceases to be the current selector for the shared
source; it is not force-moved to imitate the qualified namespace (P3).

## 3. Phases

The release process has three phases (P0, P3, P6):

1. mutable candidate construction;
2. immutable publication under the selected profile, with RC selector
   advancement only for an RC line; and
3. exact-cut qualification, acceptance and explicit consumer adoption.

An accepted RC needs no second final cut. RC publication immediately makes
the new highest ordinal discoverable through its selector. Stable publication
makes its one exact tag discoverable under the stable profile. Acceptance is
a verdict over the exact immutable subject, not a second carrier. A change
to qualifying bytes requires a higher RC on an applicable RC line or a new
version after a stable cut (P3, P6).

### Mutable candidate construction

During candidate construction (P0, P6):

- bounded fixes are allowed after intake triage;
- qualification and operator review may continue;
- release notes may remain draft until publication;
- the candidate branch may move; and
- mutable source is explicitly non-operative for released consumers.

The intended Product boundary, release-scoped claims, excluded
source-project state and qualification basis become explicit before
publication. A material scope change is repriced instead of being silently
absorbed (P2, P6).

### Immutable RC publication

A published RC cut exists to provide one exact subject for review, replay
and possible acceptance. To publish it, the project (P3, P5, P6):

1. confirms the triaged scope and lawful constitutional re-entry;
2. declares the exact Product release subject and release-scoped claim
   set;
3. reconciles the release note and other release-facing assets to that
   subject;
4. runs the proportionate pre-RC qualification and operator checks;
5. commits the exact carrier;
6. resolves and records the exact Project Release Namespace, Project
   Subtree root and Project Subtree tree;
7. creates one annotated immutable `<project>/v<version>-rc.<n>` tag and
   an annotated `<project>/v<version>` selector tag over that same commit
   in a shared release source;
8. atomically pushes the carrier, RC branch, immutable RC tag, selector
   and optional release branch where the transport supports it;
9. verifies remotely that the immutable tag, selector and release branch
   resolve to the highest published RC commit; and
10. records enough ref, subtree, identity and inventory evidence to
    reacquire the cut without trusting a mutable checkout.

Each published RC tag is immutable. Further work increments `<n>` on the
same version line when the intended line remains applicable. It does not
require a minor-version increment merely because review found a bounded
repair. A published higher RC without matching selector advancement is an
invalid, fail-closed release state; it never authorises resolution of the
older cut as the version-line latest (P3, P5).

### Immutable stable publication

Stable publication applies the same scope, source reconciliation, proportionate
checks, exact carrier, subtree and inventory obligations as RC publication.
It instead creates one stable-v1 annotated tag and any explicitly selected
release branch, with no RC branch or separate selector. Before publication,
verify the fresh-line conditions of [Stable cuts](#stable-cuts), bind remote
absence for the immutable tag and bind every mutable destination's expected
object. Publish the selected refs atomically where supported; a changed
expectation stops publication for reconciliation. Read back the remote tag
object, commit, subtree and declared assets. The release is publicly classified
as a normal published release; release-host flags do not replace exact identity
or qualification evidence (P3, P5, P6).

### Exact-cut qualification

Qualification binds (P6, P3):

- the Project Release Namespace, qualified immutable release ref, annotated tag
  object, peeled commit, repository tree, Project Subtree root and tree,
  and declared Product member set;
- the exact release-scoped claim bytes;
- the governing Product and release basis;
- each claimed property and its observation boundary;
- evidence subjects, owner verdicts and unresolved gaps; and
- the complete successor relation to the declared predecessor (§9).

Evidence matches the claim. Source success does not prove packaged or
installed behaviour; packaging equivalence does not prove semantic
behaviour; artifact presence does not prove usability unless presence is
the exact claim (P6, P1; EVALUATION §1 is the generic claim law).

A cut is accepted only when the required exact-cut review and operator
checks are complete and the human authority accepts that exact subject. If
review requires a qualifying-byte change, the verdict stays on its original
subject and the applicable successor rule is used. Acceptance does not move
an immutable tag or create another final carrier (P6, P3).

### Monotonic version-line advancement

On an RC-profile line, version-line advancement makes the newly published highest RC for one
Project Release Namespace discoverable (P3, P5):

1. identify the exact new immutable RC tag, ordinal and peeled commit;
2. confirm that no higher RC ordinal already exists on that line;
3. confirm the project-qualified selector is absent or currently resolves
   to a lower RC ordinal on the same project line;
4. atomically create or force-update the annotated `<project>/v<version>`
   selector to the new highest RC commit;
5. create or update `release/<project>/<version>` to the same commit when
   that optional carrier is used;
6. push the carrier, RC branch, immutable RC tag, selector and optional
   release branch atomically where the transport supports it; and
7. verify remotely that the selector peels to the highest RC commit and
   that the matching immutable annotated RC tag exists.

Advancement is refused when the target has no matching immutable annotated
RC tag, any higher ordinal already exists, the selector would move to a
lower RC, or the selector and release branch would not align to the same
highest commit (P5).

Forward movement is strictly monotonic by RC ordinal. A later defect is
repaired through a higher immutable RC, not by moving an old RC tag or
rolling the selector backward. The selector is therefore equivalent to
`v<version>-rc.latest`, while every concrete RC tag remains addressable
(P3).

## 4. Selector and consumer adoption

An RC-profile version-line selector answers only (P6, P3):

> Which highest-ordinal published immutable RC cut currently exists on
> this version line?

It never answers:

> Which exact STDO cut governs this consumer?

A Product Definition may retain `stdo://channels/<version>` as its
discovery selector, but its operative basis is the exact
`stdo://releases/v<version>-rc.<n>/` or stable
`stdo://releases/v<major>.<minor>.<patch>/` URI and installed-manifest digest,
the installed release basis of PRODUCT_DEFINITION §4. Moving the Git
version-line selector does not update any consumer. Adoption is a separate
explicit Product-Definition transition that resolves, presents, installs,
verifies and pins the selected immutable cut. RC resolution requires an
annotated selector with a distinct peeled commit; absence of a peeled
selector ref fails closed and cannot be interpreted as a lightweight
selector whose tag object is its commit (P6, P3, P5).

For an RC line, channel resolution enumerates the published RC tags for the selected
Project Release Namespace, including preserved unqualified historical cuts
during a namespace transition, selects the greatest positive ordinal,
requires that cut and the current selector to be annotated tags peeling to
the same commit, and fails closed when the selector lags or points
elsewhere. Channel adoption also refuses a same-line target whose ordinal
is below the Product Definition's current exact basis. A consumer that
intentionally retains an older cut names that immutable RC URI and digest
explicitly and uses exact-basis operations such as `sync`; it does not
express that choice through the latest-version channel (P5, P6).

For a stable line, channel resolution returns its verified stable-v1 cut
without ordinal comparison or a separate selector. A legacy bare selector is
never admitted as a stable exact basis; an ambiguous profile is refused. The
same digest-bound adoption operation applies to either profile (P3, P5, P6).

Presentation and mutation are separate invocations. The read-only plan,
the Adoption Plan of PRODUCT_DEFINITION §4, binds the current Product
Definition bytes and basis to the target immutable cut, annotated tag
object, peeled commit, tree and installed-manifest digest, then emits a
deterministic plan digest. Mutation requires that exact digest as the
operator's acceptance and re-derives it before changing any Product
Definition. Selector, target, manifest or definition drift invalidates the
acceptance. A fleet uses the same law with one aggregate digest over all
exact per-definition plans. Planning inside a mutating invocation is not
external presentation and cannot authorise itself. The plan's hashing rule
and the manager's command boundaries are PRODUCT_DEFINITION §4 (P6, P3).

This split lets operators refer to `v<version>` for the latest published
RC without repeatedly incrementing the version line, while every governed
project retains reproducible exact-cut authority and changes only through
explicit adoption (P2, P3, P6).

## 5. Naming

The shared-source RC-profile naming shape is (P3):

- RC branch: `rc/<project>/<version>`;
- immutable RC tag: `<project>/v<version>-rc.<n>`;
- optional release branch: `release/<project>/<version>`; and
- mutable version-line selector tag: `<project>/v<version>`.

For example, on an RC line:

- candidate branch: `rc/example/3.0.0`;
- first immutable cut: `example/v3.0.0-rc.1`;
- second immutable cut: `example/v3.0.0-rc.2`;
- latest-release branch: `release/example/3.0.0`; and
- latest-published selector: `example/v3.0.0`.

A stable example is `example/v3.0.2`, with the stable-v1 marker and no
separate selector. The published tag is immutable.

The unqualified RC profile remains lawful only under the single-project and
historical-conservation conditions of §2. Projects may choose another
spelling only in a release source whose ref policy proves collision
freedom and preserves the same project namespace, mutable carrier,
immutable cut and mutable selector distinctions (P3).

## 6. Release-scoped assets and the Product subject

### Release-scoped assets

An immutable release cut may carry release-scoped surfaces such as (P3, P6):

- release notes;
- release and installed-distribution manifests;
- dependency declarations;
- package or installed-carrier metadata;
- qualification receipts; and
- branch and tag identity declarations.

Before publication, each used surface is reconciled to the exact cut
subject. After publication, changing one of those bytes requires the
applicable immutable successor: a higher RC or a new version after stable. The
version-line selector has no content-reconciliation phase because it adds
no new Product bytes (P3).

Exact version and cut identity belong in release-scoped carriers and
consumer basis bindings (P3). How a live constitutional surface, Product
and requirements surfaces included, uses version labels is the
[SPEC_METHOD §2 Specification surface rule](SPEC_METHOD.md#specification-surface-rule).

### Product subject and repository carrier

Before qualification, the project declares (P3, P6):

- its Project Release Namespace and exact Project Subtree root;
- the exact Product member set or artifact constituting the release
  subject;
- the release-scoped claim surfaces describing that subject; and
- co-located mutable source-project fields excluded from both.

A repository commit carries those declared sets but does not make every
co-located file or sibling Project Subtree a Product member. The exact
Project Subtree tree and Product member inventory distinguish the subject
from the wider carrier. Once the immutable cut is published, no post-review
carrier delta is admitted into that cut. Publication-caused ticket or
source-work bookkeeping is recorded afterward on the continuing source
branch and cannot move the immutable cut tag (P3, P6).

## 7. Coordinated release-matched asset cohorts

A Product authority may declare an explicit cross-Product Release-Matched
Asset Cohort when one source corpus and its required distributed or
derived assets need to remain usable as one versioned set. The declaring
relation names every required Product and asset, the exact source
dependency, its owning authorities, the qualification boundary and the
publication transaction. Path co-location, equal version text or a common
actor cannot infer the relation (P3, P6).

For the existing RC-profile cohort, every required member uses one exact version suffix
`<version>-rc.<n>`. Product-local cut names and refs render it as
`v<version>-rc.<n>`; embedded asset-version fields render the same suffix
without `v`. Qualification normalises only that leading cut-name marker
and requires exact suffix equality. Equal versions establish release
matching only. They do not collapse Product identities, member
inventories, tags, acceptance judgments or release authorities (P3, P6).

For a release-matched STDO stack, the closed cohort contains all of (P3,
P4b):

1. the exact STDO standards corpus cut;
2. the distributed `spec` plugin and host assets carried by that STDO cut;
3. the exact Axiom Indexer mechanics Product used to validate and project
   the index;
4. the exact STDO Representation Product; and
5. its released `a_c.STDO` axiomatic program and logical constraint map
   or equivalent semantic index, with the complete source-STDO member
   inventory, member digests, member-set digest and exact cut identity
   used to derive it.

The cohort is incomplete when a required member is missing, stale,
differently versioned, built from another source cut, or unable to
reproduce its declared source-member and digest closure. A change to any
source member covered by the index invalidates the old derived candidate
for the successor cohort. The index is regenerated, mechanically
validated, independently qualified where required, and released under the
same new cut name. A stale index may remain immutable history; it cannot
accompany the changed source as the current cohort (P3, P5, P6).

### Two-commit construction and one publication transaction

Exact installed-manifest identity includes the annotated STDO tag object,
so a same-commit carrier containing both that identity and derived child
bytes would be self-referential. A coordinated STDO cohort therefore uses
this bounded two-commit construction (P3, P5):

1. commit A freezes the exact STDO corpus, plugin, release record and
   their qualification bytes;
2. the annotated STDO cut tag is created locally over commit A but is not
   pushed;
3. that exact local cut is installed and verified, producing the manifest
   identity used by every derived Product and index;
4. the Axiom Indexer, STDO Representation, semantic-index bytes and cohort
   record are derived and frozen in commit B;
5. prepublication qualification evaluates commit B against the exact
   local STDO tag before child immutable tags are created;
6. annotated child cut tags and every Product-local RC branch,
   version-line selector and optional release branch are prepared
   locally;
7. a mandatory post-tag, pre-push gate re-runs qualification over every
   local annotated tag object and peel, selector, RC and release branch,
   normalised version mapping, target commit and the exact closed ref
   set; it also fetches and binds the expected remote object ID or
   required absence for every destination ref; and
8. one transport transaction atomically publishes only that qualified
   carrier branch and complete Product ref set.

If the remote does not support atomic ref publication, publication
refuses. The process has no sequential-push fallback. Every immutable cut
tag is create-only and therefore requires bound remote absence. Every
mutable carrier, RC branch, selector and release branch uses an explicit
per-ref compare-and-swap lease, such as
`--force-with-lease=<ref>:<expected-oid>`, in that same atomic
transaction. A missing expected ref, unexpected existing tag or changed
remote object ID stops publication; the operator refetches and repeats
complete content and local-ref-graph qualification before constructing
another push. A lease mismatch never falls back to an unguarded force, a
partial push or an in-place expectation update (P5, P3).

Remote verification fails closed when any required cohort ref is absent,
lightweight, differently versioned, points to the wrong Product commit, or
has a selector or release branch that does not match its immutable cut.
Post-publication bookkeeping may use a later commit, but it cannot move
any immutable cohort tag (P5, P3).

### Qualification and recovery

Prepublication content qualification binds the exact commit-A STDO tag
and manifest, commit-B source tree, all Product-local target refs, version
markers, Product member inventories, semantic-index bytes and complete
source-corpus digest closure. It proves that the frozen candidate can be
tagged without changing a qualifying byte. After tag and mutable ref
creation, local-ref-graph qualification binds their annotated objects,
peels, target commits, exact push set, and every fetched remote expected
object ID or required absence to that unchanged content result.
Post-publication qualification verifies the same relation from remote refs
and refuses a partial cohort (P6, P3, P5).

A historically published source cut may be the basis of a later
same-version backfill only when separately authorised recovery law names
that exception. Every recovered asset still binds the exact historical cut
and same cut name, and remote completeness remains mandatory. Recovery
cannot move the historical tag, add bytes to its Product subject, or be
represented as an atomic cohort that existed at the original publication.
Normal successor publication uses the atomic cohort process above (P3,
P6).

Adding or changing this cohort law changes qualifying bytes of this
member. It governs only an immutable successor that contains those bytes
and cannot retroactively make an earlier cut a coordinated cohort (P3).

## 8. Acceptance

### Acceptance criteria

A release cut may be accepted when (P6, P3):

- proportionate prepublication qualification passed for the declared subject;
- independent exact-cut review passed where required;
- required operator review is complete;
- the intended release scope and successor relation are stable;
- release-scoped assets accurately describe the exact cut;
- all release-blocking gaps, including the findings that block promotion
  under [EVALUATION §5 When a finding blocks promotion](EVALUATION.md#when-a-finding-blocks-promotion),
  are closed or the claimed scope is explicitly narrowed; and
- the human Product authority accepted the exact immutable cut identity.

Each criterion is a mandatory gate in the sense of
[FOUNDATIONS §4 Change impact and evidence reuse](FOUNDATIONS.md#change-impact-and-evidence-reuse):
it applies irrespective of any selection of checks after a change, and
retained evidence satisfies it only under the validity conditions stated
there (P6).

Acceptance attaches to that immutable cut identity. It neither advances
nor rolls back the version-line selector. Consumer adoption separately
evaluates the exact latest target presented by the channel and mutates
only after its digest-bound plan is accepted (P6, P3; EVALUATION §5 is
the generic acceptance law).

### External qualification dependencies

Some claims depend on external backends, transports or operator-facing
services outside the local carrier. Such a dependency may remain out of
Product for carrier and migration classification while still blocking the
dependent release claim (P6, P5).

A clean skip caused by an unhealthy external dependency is an evaluation
not performed, which has no result
([FOUNDATIONS §4 Results](FOUNDATIONS.md#results), Not performed). It may
preserve correct Product classification, but it cannot establish that the
dependent capability passed. The claim is either qualified against a
healthy dependency or narrowed before acceptance (P6, P5).

## 9. Successor baseline conservation (STDO-UP-015)

A successor identifies the exact predecessor immutable cut whose semantic
claims it evolves. That origin remains immutable for the candidate. Every
predecessor claim capable of affecting the successor receives one semantic
disposition (P4b, P3, P6):

- conserved: the successor retains the claim;
- superseded: an accepted successor relation replaces it;
- intentionally removed: current Product authority removes it; or
- not applicable: it has no successor effect, with a bounded reason.

Evidence for a disposition is retained or reassessed under
[FOUNDATIONS §4 Change impact and evidence reuse](FOUNDATIONS.md#change-impact-and-evidence-reuse):
a `conserved` reading made on an earlier successor text applies to a later
one only where the owning text and the consumer bindings that carry it
are unchanged, or the change is shown not to affect the claim (P3, P6).

An unresolved disposition blocks qualification of the affected claim.
Conservation is semantic: patch absence does not prove loss when a
successor-native realisation preserves behaviour, and naming or code
similarity does not prove conservation without relevant evidence (P6,
P1). The comparison that decides `conserved` is made on the same material
case, scope and authority: what must happen, what may happen, what is
prohibited, and what follows when a trigger, exception or required
premise is absent, in the owning text and in the consumer bindings that
apply it, with the counterexamples that would expose a changed decision.
Modal wording is judged by that meaning: indicative wording can state a
binding law, and rewriting "must" or "shall" is neither conservation nor
supersession by itself; an obligation stays obligatory, a preference
stays a preference, and every permitted exception and scope condition
survives, or the claim is not conserved. A statement that a whole
package's wording is equivalent establishes none of this for any claim
(P6, P1). A `conserved` disposition recorded
before this test applied is re-evaluated under it before the affected
claim qualifies; until then its standing is `unresolved`.

Each disposition is a claim the successor makes about one predecessor
claim ([EVALUATION §1](EVALUATION.md#1-claims)), not a result value; its
predicate is its value's wording above. It is distinct from the decision
owner's disposition of an assessed candidate
([ACTIVATION §3 Disposition](ACTIVATION.md#disposition)), which is an
acceptance result. Qualification evaluates each
disposition on evidence and records a value of the core result algebra
([FOUNDATIONS §4 Results](FOUNDATIONS.md#results)) with that predicate.
An unresolved disposition states no claim and so has no result: in the
qualification of the affected claim it is a planned assessment without a
closed result, which is why it blocks that qualification
([FOUNDATIONS §4 Conjunction of results](FOUNDATIONS.md#conjunction-of-results),
Gaps). Purpose and material relation: a recorded disposition establishes
nothing until it is evaluated, so no disposition stands as a result (P6,
P5).

Where a maintenance or support line may affect retained claims, the
release basis identifies the watched source, observation boundary,
inclusion policy and successor candidate. Relevant changes receive
semantic disposition at material integration and exact-cut qualification.
The consumer owns its record, branch strategy, comparison and proof
mechanism (P4b, P6).

[EVALUATION §5](EVALUATION.md#5-acceptance) states what acceptance
requires of the disposition record; it applies this section and is not
part of it (P4b, P6).

### Deterministic-kind migration

A successor that adopts the total deterministic kind of
[AXIOMATIC_CALCULUS §5](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds)
preserves each existing evaluation operation's unchanged subject, admissible
reads, witness/log outputs, permitted writes, stops/results, authority and
invalidation conditions. That profile alone does not
establish the new kind's totality, closed dependencies or declared outcomes.
The old deterministic evaluation/proof definition supplies no general
termination argument. Assess each proposed use against this relation (P3, P6):

| Evidence and declared migration status | Successor disposition |
|---|---|
| Establishes the new totality, closed-dependency and outcome contract | Map to common F_D plus the unchanged operation profile and exact traversal binding. Preserve the evidence and grants. |
| New-kind eligibility is unestablished, and the owner has identified the missing evidence or a separately declared bounded successor and its remediation obligation | Keep that identified migration pending. The legacy operation retains only its lawful standing on its exact old basis while it remains applicable; it gains no successor F_D standing. A narrower domain or fuel-bounded implementation has its own contract, identity, exhaustion outcomes and affected preservation evidence; it does not retrospectively prove the old operation total or preserve every old continuation. |
| New-kind eligibility is unestablished and no supported remediation or successor classification has been selected | Retain the exact legacy meaning and evidence with an explicit unresolved successor-classification obligation until its owner disposes it. The legacy operation retains only its lawful standing on its exact old basis while applicable. Grant neither new F_D standing nor an automatic F_P label; the affected successor claim stays open. |

An old deterministic evaluator with unestablished termination or an
undeclared material dependency takes the second or third row, even if it
preserves the judged subject: the second row requires an identified evidence
gap/remediation or selected bounded successor; absent that, the third records
the unresolved classification. Evidence alone need not choose the owner's
remediation. This relation imposes no general decision procedure for totality.
These eligibility/remediation cases are not additional semantic dispositions
under this section. Generic role descriptions and schematic traversal contracts are not concrete
operations with an implementation to qualify; their use still binds the
kind and operation contracts when instantiated.

ODD admission and closure retain their named operation owners under
[AXIOMATIC_CALCULUS §5's authority boundary](AXIOMATIC_CALCULUS.md#5-traversals-and-functor-kinds).
Exhaustion
retains the evaluated predicate and its signature/traversal stop mapping,
as [the conformance examples](examples/DETERMINISTIC_CONTRACTS.md) distinguish.

Immutable consumers keep their selected edition's meaning. New consumers
explicitly select the complete successor and operation profiles. A stable
concept URN is not its immutable calculus edition
([AXIOMATIC_CALCULUS §8](AXIOMATIC_CALCULUS.md#8-calculus-identity)). Migration
records the old release, manifest, member and clauses and the applicable row
above. Current URN lookup never reinterprets history. A versioned import or
alias records its justified supersession and grants no broader permission.
Disposition and qualification retain the separate obligations of this
section; unresolved mappings block the affected successor claim.

Broadening operation purpose while strengthening totality, dependency and
evidence requirements is a substantive semantic change. A patch-shaped
version label by itself promises no compatibility. The release's version
assessment identifies the selected predecessor, affected consumer mappings
and remaining obligations. This relation settles no general version-line
policy and waives no acceptance gate.

## 10. Open questions

These questions remain open (P2):

- What exact qualification bundle is mandatory for each Product class?
- What version-line compatibility rule requires a new `<version>` rather
  than a higher RC ordinal?
