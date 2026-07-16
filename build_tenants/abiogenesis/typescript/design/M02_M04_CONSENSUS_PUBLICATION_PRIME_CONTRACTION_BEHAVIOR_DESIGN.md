# M02-M04 Consensus Publication Prime Contraction Behavior Design

**Status**: Accepted - T-274A waits for T-281 Phase A closure; T-274B remains gated

**Date**: 2026-07-15

**Ticket**: `T-274`

**Change class**: `design_reframe`

**Governing design**: [ADR-044](./adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md)

**Governing Ontology**: [ABIogenesis Public Control-Plane Ontology `/9`](./ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md)

**Census rows**: `PC-001`, `PC-002`

## Boundary

This design governs two separately gated parts of T-274. T-274A projects the
nine required Consensus schema identities and two closed vocabularies from the
existing native family through the private native projector accepted under
T-281 Phase A. T-274B later publishes those verified assets, the admitted T-252
Module, one SYSTEM-owned GraphFunction contribution declaration, and its
separate AF-08 admission into the installed `Catalog`. Neither phase executes
Consensus, admits domain results, projects a ticket result, publishes
capability coverage, or introduces a second GraphFunction body.

One native `ConsensusContractFamily` owns field and value-domain meaning. Nine
closed schema projections and two vocabularies derive from it. Public identity
remains plural because consumers locate and admit each contract independently;
authorship remains singular.

The schema projector emits nine closed physical JSON Schema assets from that
single native family. This matches the existing file-level public locator and
verifier without adding an embedded-resource resolver. Every later public
catalog row retains its own contract ID, version, native symbol, schema resource
ID, asset digest, and authority refs. Physical-file identity and bytes remain
subordinate publication facts; no generated asset becomes an authoring source.

T-274A stops after deterministic schema/vocabulary generation, native parity,
cross-projection negatives, and exact byte/digest reproduction. It exports no
product contract, writes proof output only to a temporary directory, and makes
no packed, installed, Module, callable, catalog, or runtime claim.

T-274B starts only after the accepted T-281 P1 and T-270 inputs exist. The
contribution declaration derives from the admitted T-252 Module and its
exact outer GraphFunction. AF-24 publishes that declaration through the
`ContributionManifest`; AF-08 separately admits it into the installed
`Catalog`. The `PublicContractCatalog` contains only public contract/function
definition truth. `ABG_CONSENSUS_MODULE_DECLARATIONS` is retired as a maintained
Consensus source. Generic Review declarations remain independent.

In T-274B, the Module and GraphFunction remain GTL declarations. Neither is a
`GtlProgram`, public invocation, selected action, `ConstructionIntent`, or
runtime authority. The callable row is eligible for invocation only when the
separately admitted program named by `abg.operation.run.invoke` contains the
exact GraphFunction. Catalog, result, and replay observation use the closed
`abg.operation.project.read` relation. This publication boundary adds no
Consensus operation and no legacy `catalog.invoke` facade.

## Ontology Slice

This design projects the ratified Ontology; it does not originate another
semantic model.

| Carrier | Ontology classification | Lifecycle and authority |
|---|---|---|
| `ConsensusContractFamily` | Prime product-definition family under `AF-24` | authored once; changed meaning versions the family; product contract publisher owns projection |
| `ABG_CONSENSUS_GTL_MODULE` | existing admitted GTL Module | GTL admission owns declaration truth; T-274 may serialize and publish but cannot reinterpret it |
| outer Consensus `GraphFunction` | existing sole named callable declaration | Module-owned declaration; becomes executable only as a member of a separately admitted `GtlProgram` |
| `ConsensusPublicContractRow` | addressable `PublicContractCatalog` row | AF-24 derives it from the family; changed definition versions the row; prior rows remain historical contract evidence |
| `ConsensusGraphFunctionContribution` | addressable `ContributionManifest` declaration | AF-24 derives it from the exact Module and GraphFunction; immutable per digest; carries no program or selection authority |
| `AdmittedConsensusCatalogRow` | existing admitted `Catalog` projection | AF-08 admits the exact contribution under a workspace binding; catalog admission does not prove program membership |
| `ConsensusSchemaAsset` | subordinate generated packaging | one generated file per public schema projection; changed bytes create a new digest and never a new domain author |
| `GtlProgram`, `PublicInvocation<run.invoke>`, `ConstructionIntent` | referenced execution carriers | outside T-274 ownership; T-270/ABG admit and interpret them |

### Lifecycle Completeness

| Entity | Declare/create | Read/project | Update/transition | Delete/retire |
|---|---|---|---|---|
| `ConsensusContractFamily` | product definition register under `AF-24` | schema/native projections | semantic change creates a versioned family | superseded family remains historical contract evidence |
| `ConsensusPublicContractRow` | `AF-24` derives nine rows and two vocabulary rows | `AF-03 project(publicContractCatalog, rows)` | changed definition creates a new row version/digest and current projection | prior rows remain historical evidence; no public retirement operation |
| `ConsensusGraphFunctionContribution` | `AF-24` derives one contribution manifest row from exact admitted Module/GraphFunction | `AF-03 project(contributionManifest, declarations)` | changed Module/body/function creates a new contribution version/digest | prior contribution truth remains history; no compatibility alias |
| `AdmittedConsensusCatalogRow` | `AF-08` admits the exact contribution under one binding | `AF-03 project(catalog, callable)` | a new admitted contribution creates new catalog/current-view truth | prior catalog truth remains replay evidence; Catalog has no retirement operation |
| `ConsensusSchemaAsset` | deterministic schema projector emits nine assets | later public catalog locator names the exact resource file | changed family regenerates bytes/digest | historical asset remains publication evidence |

### Authority And Function Derivation

| Function | Proposer | Verifier/admitter | Executor | Projector/retirement owner | Ontology disposition |
|---|---|---|---|---|---|
| project nine schemas and two vocabularies | product build authority | T-274A native/schema parity and closed-resource verifier; later product contract admission | accepted strict native projector | T-274A owns private projection; `AF-24` owns later publication | subordinate projection of one family; no new atom |
| publish Consensus contribution | product build authority citing the admitted Module | Module/body/function/digest/SYSTEM-owner verifier | deterministic publication generator | `AF-24` publishes the `ContributionManifest` | contribution declaration; no program, catalog-admission, or invocation authority |
| admit Consensus catalog row | exact workspace binding plus contribution manifest | AF-08 contribution and binding verifier | ABG catalog admission | admitted `Catalog` and its current views | existing catalog authority; does not prove GtlProgram membership |
| read catalog/result/replay truth | admitted public caller | `PublicFunctionDefinition<project.read>` admission | `AF-03` projection | owning catalog/ABG projector | referenced public operation; T-274 does not execute it |
| invoke the callable | admitted caller plus admitted GTL program | T-270/ABG verify program membership, authority, selection, and intent | admitted program interpreted through `AF-11..AF-15` | ABG runtime/replay owners | outside T-274; only `abg.operation.run.invoke`, never a private or legacy route |

Projection loss is deliberate: the publication design omits traversal
interiors, current eligibility, intent admission, continuation, and closure. It
fails if any omitted authority is reconstructed from Module bytes, the callable
row, a schema locator, or an adapter.

## Irreducible Architectural Carrier Set

- `ConsensusContractFamily`: one native domain authoring model
- `ABG_CONSENSUS_GTL_MODULE`: admitted GTL Module publication/body authority
- `ConsensusPublicContractRow`: one independently admitted public projection
- `ConsensusGraphFunctionContribution`: one SYSTEM-owned contribution declaration
- existing admitted `Catalog`: AF-08 admission authority, not another authoring source

Subordinate values are vocabulary assets, schema asset bytes, asset digests,
projection digests, locators, generated files, and installed
inventory rows.

## Prime Contraction Review

```json prime-contraction
{
  "schemaVersion": 1,
  "iacs": [
    "ConsensusContractFamily",
    "ABG_CONSENSUS_GTL_MODULE",
    "ConsensusPublicContractRow",
    "ConsensusGraphFunctionContribution"
  ],
  "authoritativeCarriers": [
    "ConsensusContractFamily",
    "ABG_CONSENSUS_GTL_MODULE",
    "ConsensusPublicContractRow",
    "ConsensusGraphFunctionContribution"
  ],
  "subordinatePayloads": [
    "ConsensusSchemaDefinitionProjection",
    "ConsensusVocabularyProjection",
    "ConsensusSchemaAsset",
    "ConsensusSchemaAssetDigest",
    "ConsensusProjectionDigest",
    "ConsensusSchemaLocator",
    "ConsensusInstalledInventoryRow"
  ],
  "promotionTests": [
    {
      "candidate": "ConsensusContractFamily",
      "verdict": "promote",
      "reason": "It owns the closed native fields and value domains from which every Consensus schema and vocabulary projection derives."
    },
    {
      "candidate": "ABG_CONSENSUS_GTL_MODULE",
      "verdict": "promote",
      "reason": "It is the admitted GTL publication/body authority and the only lawful source for the installed callable declaration; it is not the admitted runtime program."
    },
    {
      "candidate": "ConsensusPublicContractRow",
      "verdict": "promote",
      "reason": "Each later public row is independently versioned, located, admitted, and consumed even though its shape is derived."
    },
    {
      "candidate": "ConsensusGraphFunctionContribution",
      "verdict": "promote",
      "reason": "The SYSTEM-owned declaration is independently addressed in the ContributionManifest; AF-08 catalog admission and current selection remain separate ABG and program authority."
    },
    {
      "candidate": "ConsensusSchemaAsset",
      "verdict": "remain_subordinate",
      "reason": "Each generated file packages one derived resource and owns no domain or callable meaning."
    }
  ],
  "recurrenceReview": {
    "status": "commonize_tenant",
    "ref": "build_tenants/abiogenesis/typescript/design/A5_PRIME_CONTRACTION_CENSUS.md#pc-001---consensus-contract-family-authorship"
  },
  "authoritySourceCount": {
    "before": 13,
    "after": 12
  },
  "authoringSourceCount": {
    "before": 13,
    "after": 2
  },
  "disposition": "migrate_authority",
  "ownerTicket": "T-274"
}
```

The authority count preserves nine schema rows, two vocabulary rows, and one
callable row while retiring the rival callable declaration and treating all
generated schema assets as packaging rather than authority. The authoring count contracts the eleven
potential schema/vocabulary authors plus two callable declarations to one
contract family plus one admitted Module.

## Domain View

```mermaid
classDiagram
  direction LR
  class ConsensusContractFamily {
    <<prime authority>>
    +nine closed variants
    +two native enum rosters
  }
  class NativeSchemaProjector {
    <<T281 Phase A mechanism>>
    +seven closed mappings
    +no extension registry
  }
  class ConsensusSchemaProjection {
    <<prime public identity>>
    +contractId
    +version
    +resourceId
    +projectionDigest
  }
  class ConsensusSchemaAsset {
    <<subordinate packaging>>
    +relativePath
    +assetDigest
    +one exact resource
  }
  class ConsensusVocabularyProjection {
    <<prime public identity>>
    +vocabularyId
    +values
  }
  class CanonicalModule {
    <<prime GTL publication authority>>
    +body digest
  }
  class ConsensusGraphFunction {
    <<prime GTL callable declaration>>
    +functionRef
    +functionDigest
  }
  class ContributionManifest {
    <<product publication authority>>
    +declarationRef
  }
  class AdmittedCatalog {
    <<AF08 admission authority>>
    +catalogRef
  }
  class GtlProgram {
    <<referenced admitted program>>
    +programRef
    +programBasis
  }
  class PublicRunInvokeDefinition {
    <<referenced public definition>>
    +operation run.invoke
  }
  class PublicProjectReadDefinition {
    <<referenced public definition>>
    +operation project.read
  }
  class CallableCatalogRow {
    <<admitted catalog projection>>
    +handle
    +owner
    +module digest
    +GraphFunction ref
  }
  class LegacyConsensusDeclaration {
    <<retired duplicate>>
  }

  ConsensusContractFamily --> NativeSchemaProjector : one authoring input
  NativeSchemaProjector --> ConsensusSchemaProjection : derives nine
  ConsensusContractFamily --> ConsensusVocabularyProjection : derives two
  ConsensusSchemaProjection --> ConsensusSchemaAsset : emits exact file
  CanonicalModule *-- ConsensusGraphFunction : owns declaration
  ConsensusGraphFunction --> ContributionManifest : AF24 publishes
  ContributionManifest --> AdmittedCatalog : AF08 admits under binding
  AdmittedCatalog *-- CallableCatalogRow : projects exact callable
  GtlProgram --> ConsensusGraphFunction : binds exact member
  PublicRunInvokeDefinition ..> GtlProgram : requires separately admitted
  PublicProjectReadDefinition ..> CallableCatalogRow : projects declaration truth
  LegacyConsensusDeclaration ..> CallableCatalogRow : replaced by
```

## Execution View

```mermaid
sequenceDiagram
  participant Family as Consensus Contract Family
  participant Generator as T281 Native Schema Projector
  participant AVerifier as T274A Schema Verifier
  participant Publisher as AF24 Product Contract Publisher
  participant Module as Admitted T-252 Module
  participant Contracts as Public Contract Catalog
  participant Contributions as Contribution Manifest
  participant Catalog as AF08 Admitted Catalog
  participant Verifier as Installed Verifier
  participant Runtime as T-270 and ABG

  rect rgb(245, 248, 250)
    Note over Family,AVerifier: T274A private schema projection
    Family->>Generator: derive nine closed resource schemas
    Family->>Generator: derive two vocabularies from native enums
    Generator-->>AVerifier: nine temp files plus two temp vocabulary files
    AVerifier->>AVerifier: native parity closed substitution and reproducible bytes
    alt malformed unsupported or divergent projection
      AVerifier-->>Family: typed build failure and no public output
    else exact private projection set
      AVerifier-->>Publisher: verified projection identities bytes and digests
    end
  end
  rect rgb(250, 248, 245)
    Note over Publisher,Runtime: T274B later public and installed publication
  Publisher->>Contracts: publish nine schema rows and two vocabulary rows
  Module->>Publisher: exact GraphFunction declaration and body digest
  Publisher->>Contributions: publish one SYSTEM-owned GraphFunction contribution
  Contracts->>Verifier: locate exact resource file identity and digest
  Contributions->>Verifier: verify Module function owner and body digests
  Verifier->>Verifier: verify asset digest projection digest native parity and Module round-trip
  Contributions->>Catalog: AF08 admit exact contribution under workspace binding
  Catalog-->>Runtime: declaration row available to project.read and run.invoke admission
  Runtime->>Runtime: require separately admitted GtlProgram binding exact GraphFunction before selection or intent
  end
```

## State View

```mermaid
stateDiagram-v2
  [*] --> FamilyAuthored: T277 supplied one closed native family
  FamilyAuthored --> Rejected: F_D finds open fields or duplicate native roster
  FamilyAuthored --> Projected: T281 projector derives nine files and two vocabularies
  Projected --> Rejected: F_D finds duplicate resource ID or cross-projection acceptance
  Projected --> SchemaVerified: T274A proves native parity bytes and digests
  SchemaVerified --> Rejected: F_D finds stale asset or projection digest
  SchemaVerified --> T274AComplete: temp-only schema checkpoint
  T274AComplete --> AwaitingPublicationInputs: no public or installed claim
  AwaitingPublicationInputs --> Rejected: T281 P1 or T270 input diverges
  AwaitingPublicationInputs --> ContractsPublished: AF24 derives rows after prerequisites
  ContractsPublished --> Rejected: F_D cannot resolve exact resource file identity
  ContractsPublished --> ContributionPublished: AF24 derives contribution from Module and GraphFunction
  ContributionPublished --> Rejected: F_D finds owner handle body source or target mismatch
  ContributionPublished --> CatalogAdmitted: AF08 admits exact contribution under binding
  CatalogAdmitted --> Rejected: catalog row claims program selection invocation or legacy operation authority
  CatalogAdmitted --> PublicationOnly: separate contract and catalog truth support project.read and run.invoke admission
  PublicationOnly --> Installed: installer preserves exact assets and rows
  Installed --> Rejected: installed round-trip or source-isolation proof fails
  Installed --> [*]
  Rejected --> [*]
```

Transition ownership is explicit: T-274A owns only private schema and
vocabulary projection plus exact verification. T-274B owns AF-24
public-contract and contribution-manifest projection, and AF-08 admission
of the contribution into the existing `Catalog`; the existing schema generator
owns deterministic schema projection; M02 owns Module and GraphFunction
declaration admission; installer and verification surfaces own the installed
round-trip. T-270 and ABG alone admit the later program-bound public invocation,
action selection, `ConstructionIntent`, and traversal.

## Ontology Cross-View Evaluation

| Axiom | Ontology/domain evidence | Sequence evidence | State evidence | Native/admission enforcement | Verdict |
|---|---|---|---|---|---|
| one Consensus contract author | one `ConsensusContractFamily`; schemas/assets subordinate | one accepted projector derives all resources | duplicate roster or open field rejects before projection | closed native variants and one generator basis | pass |
| Module and GraphFunction are not the program | Module owns GraphFunction; GtlProgram separately binds it; catalog row only projects contribution admission | runtime must receive a separately admitted program and prove membership | authority claim on the catalog row enters `Rejected` | T-270/ABG program-membership admission; T-274 cannot construct it | pass |
| public-contract and contribution catalogs remain distinct | AF-24 contract rows and contribution manifest feed separate carriers; AF-08 alone admits Catalog | sequence publishes then admits through separate participants | ContractsPublished and CatalogAdmitted are separate states | distinct native manifests and admission APIs | pass |
| publication does not select or invoke | callable row is declaration/publication truth only | publication ends before T-270 selection, intent, and traversal | `PublicationOnly` precedes installation; no running state exists | no runtime handler or operation is owned here | pass |
| one current public operation truth | `run.invoke` and `project.read` are referenced accepted definitions | downstream consumes only those definitions | legacy or feature-specific operation claim rejects | hard-break catalog/public-definition parity | pass |
| nine identities do not create nine authors | nine physical projections share one family while retaining addressability | generator emits per-resource files and digests from one input | cross-projection substitution rejects | native/schema parity plus exact file-locator admission | pass |

## Migration

### T-274A

1. Consume the completed T-281 Phase A projector; do not author another
   projector, transform registry, schema DSL, or converter exception.
2. Project the existing closed `ConsensusContractFamily` into nine exact
   physical schema assets.
3. Derive both vocabularies from the existing native enum rosters.
4. Prove closed native/schema parity, cross-projection refusal, exact resource
   IDs, and byte/digest reproducibility from a clean tree.
5. Stop with temp-only verified bytes. Publish or commit no schema asset, row,
   Module, contribution, catalog, install, operation, or capability claim.

### T-274B

1. Require accepted T-281 P1 definition truth and closed T-270 catalog
   invocation authority before public publication.
2. Publish per-resource rows with separate projection and asset digests.
3. Derive the Consensus callable declaration from the admitted Module and
   outer GraphFunction; migrate all probe and test consumers.
4. Remove the maintained `ABG_CONSENSUS_MODULE_DECLARATIONS` source.
5. Regenerate publication artifacts and prove installed source isolation.

## Negative Proof

- findings cannot admit as rulings
- round outcome cannot admit as final result
- final result cannot admit as ticket projection
- any other public cross-projection substitution fails
- an unknown field or enum value fails native and serialized admission
- a locator with the correct directory but wrong resource file or ID fails
- a correct resource with a stale schema or asset digest fails
- removing or mutating the canonical Module prevents callable publication
- the retired declaration cannot reconstruct the callable
- installed publication resolves without importing source files

## Stop Conditions

- stop if nine generated files become nine authored models or drift from the
  one native family
- stop if T-274 authors a projector, converter exception, or schema DSL beside
  the accepted T-281 Phase A mechanism
- stop if path identity substitutes for exact resource identity and digest
- stop if a generated file or row becomes a second domain author
- stop if callable publication can succeed without the exact admitted Module
- stop if the Module, GraphFunction, or callable row is treated as the admitted
  `GtlProgram`, selected action, intent, or runtime authority
- stop if `catalog.invoke`, a Consensus-specific operation, or a compatibility
  alias survives beside `abg.operation.run.invoke`
- stop if catalog/result/replay observation bypasses
  `abg.operation.project.read`
- stop if Review declarations are removed merely because they share a file
- stop if T-274A publishes or installs anything before T-274B prerequisites
  close
- stop if a T-274A proof asset appears in `npm pack --dry-run`

## Phase-Split Verdict

`accepted_phase_split_t274a_dependency_gated`.

The earlier accepted design correctly preserved one Consensus authoring family
and the separate contract, contribution, and catalog authorities, but it
assumed one physical schema document with embedded addressable definitions.
The current locator and verifier are file-level. Extending them solely to keep
one physical file would add a new resolver and more failure surface without
reducing authoring truth. This repair therefore keeps one native family and
one projector while emitting nine generated physical schema assets. T-274A
proves those private projections early; T-274B retains all public and installed
publication. No product identity, semantic authority, or public operation
changes.

Independent review accepted the exact semantic candidate digest
`a370f6c894e08f966714d5b5541c9e02091b19be6768d5f4383773287cbc600e`.
T-274A implementation may begin only after T-281 Phase A implementation closes;
T-274B remains fenced behind T-281 P1 and T-270.
