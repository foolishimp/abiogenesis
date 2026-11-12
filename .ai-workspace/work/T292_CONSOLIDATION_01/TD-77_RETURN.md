# TD-77 Return: a reader and a recorded Product lock

Writer: Claude Opus 5.5. Branch `claude/td77-recorded-lock-truth` from local
`main` at `c1f655735`, worktree `/private/tmp/abg-td77`. T is
`build_tenants/abiogenesis/typescript`. No push, no tag.

**Status: stopped at step 1 (trace). The stop condition of ruling 6 holds:
on every recorded cut that decodes today, the recorded capability graph
cannot establish the recorded capability identities. A graph row carries
only the contracts it owns. The relation that the contracts'
`capabilityIdentities` record is the register's projected-contract list,
and the graph does not record it. On every recorded toolchain lock row, from
`5.0.0-dev.286` to `5.0.0-rc.12`, 37 of the 54 contracts that carry
identities differ from what the graph gives. No design, code or test is
edited.**

(Skeleton, committed before any other step. The remaining sections follow.)

## 3. Recorded material

### 3.1 What a lock row carries and which digest binds each part

Read from `product/environment.ts` (`isResolvedProductLock`, `:544-760`;
`lockRowGraphMatchesCatalog`, `:764-789`), `shared/capability_contracts.ts`
and `product/public_contract_publication.ts`.

| Part | What binds it | Checked today by the lock guard |
| --- | --- | --- |
| lock | `lockDigest = sha256Canonical({rows, dependencyEdges, nativeContractClosureDigest})`; `lockId = product-lock://abiogenesis/<hex>` | recomputed (`:753-759`) |
| `nativeContractClosureDigest` | produced by `linkNativeContractSet` when the lock is constructed | shape only (`isSha256Digest`) |
| `dependencyEdges` | lock digest | re-derived from the rows' `declaredDependencies` (`:733-744`), acyclic |
| row identity fields (`artifactDigest`, `productContentDigest`, `manifestDigest`, `descriptorRef`, `provenanceRef`, `publisherNamespace`, `packageName`, `packageVersion`) | lock digest only | shape only; the contribution manifest must repeat `productId`, `packageVersion`, `descriptorRef`, `productContentDigest` |
| `contributionManifest` | `contributionManifestDigest = sha256Canonical(contributionManifest)` | recomputed (`:617`); it repeats the catalog id and digest and the graph coordinate (`:619-636`) |
| `capabilityDefinitionGraph` | each row's `capabilityDefinitionDigest = sha256Canonical(row without ref and digest)`, `capabilityDefinitionRef = capability-definition://abiogenesis/<hex>`; `graphDigest = sha256Canonical(graph without graphDigest)`; dependencies carry the dependency's ref and digest | `isCapabilityDefinitionGraph` (`capability_contracts.ts:407`): strict schema, row digests, graph digest, and equality with `constructCapabilityDefinitionGraph` over the reader's register |
| `capabilityDefinitionGraphAsset` | `contentDigest = sha256Bytes(canonicalJson(graph))`; fixed path and media type | recomputed (`:637-642`) |
| `publicContracts` | each `contractDigest` is the digest of an asset's bytes or of a native declaration inventory (`scripts/generate-product-manifest.mjs:528-933`); no contract digest covers `capabilityIdentities` | shape by `parseProductPublicContract`; `capabilityIdentities` compared with the reader's register (`:674-679`) |
| `publicContractRefs`, `publicCapabilityRefs`, `declaredCapabilityRefs` | lock digest | re-derived from the contracts and the graph (`:654-673`) |
| catalog (`catalogId`, `catalogDigest`) | `catalogDigest = sha256Canonical({schemaVersion, catalogId, catalogVersion, catalogSchemaPath, catalogSchemaDigest, rows})` (`public_contract_publication.ts:745-760`); the catalog body is not a field of the row | shape only; equal to the contribution manifest's; every flat owner coordinate in the graph carries it (`lockRowGraphMatchesCatalog`) |

### 3.2 Does the recorded graph alone determine every recorded contract's capability identities?

No, on every recorded toolchain row.

A graph row has exactly these keys on every one of the 142 distinct
non-empty recorded graphs: `boundedProofRefs`, `capabilityDefinitionDigest`,
`capabilityDefinitionRef`, `capabilityId`, `capabilityVersion`,
`dependentCapabilities`, `effectRefs`, `owningPublicContracts`. The only
contract relation is `owningPublicContracts`: flat coordinates for the
register's `owningPublicContractIds` and `operation_definition_slot`
coordinates (slots `request`, `result`, `refusal`, `non_terminal`) for its
`owningPublicDefinitionKeys`; every slot coordinate names an operation's
flat row. The register's `projectedPublicContractIds`, which
`capabilityRefsForContract` reads and which every recorded
`capabilityIdentities` was generated from
(`scripts/generate-product-manifest.mjs:988-996` asserts this at build),
is not recorded in the graph.

Two kinds of difference, the same on every graph:

1. **36 projected-only contracts.** They carry capability identities, and
   their `contractId` occurs nowhere in the recorded graph, nor in the row's
   contribution manifest (checked by string over one graph per distinct
   graph digest, 142 graphs, and on the rc.12 and rc.10 fixture graphs):
   the fifteen `abg.contract.*` roots (`abg.contract.abg.c-call-root`,
   `…environment-admission`, `…execution-basis-root`,
   `…invocation-root-admission`, `…open-call-root`, `…replay-root`,
   `abg.contract.gtl.materialization-root`, `…root-declaration`,
   `…validation-root`, `abg.contract.hog.graph-function-catalog`,
   `…judgment-transition-root`, `…traversal-root`,
   `abg.contract.product.implementation-resolution-root`,
   `…invocation-root`, `…verification`), eighteen `abg.schema.*` contracts
   (the eleven Consensus and review schemas, `consensus-escalation-decision`,
   `consensus-ruling-overlay`, `consensus-submitter-profile`,
   `consensus-submitter-response`, and `product-toolchain-manifest`,
   `public-contract-catalog`, `public-operation-contract`,
   `public-operation-invocation`, `public-operation-outcome`) and three
   `abg.vocabulary.*` contracts.
2. **`abg.operation.run.invoke`.** The graph rows that own it are
   `catalog.invoke-graph-function@5`, `graph-function.consensus@5` and
   `runtime.execute-seven-term-c@5`; the recorded identities are the first
   and the third. The Consensus row owns the operation and does not project
   it (`capability_contracts.ts:91`). So the relation fails whether
   "project" is read as "own" or not; owning contracts are no stand-in.

### 3.3 Per cut

Every log under the evidence root that carries a `product.install` artifact
admission publishing `interaction.respond` (the finding's 411, 24.56 GB),
plus the two tracked fixtures and the live rc.12 store, read without
decoding (`/private/tmp/abg-td77-work/scripts/lock-graph-census2.py`, which
streams every log, the 14 over 300 MB included). The cut is the toolchain
row's `packageVersion`. "Project on base" and "refused at decode" are the
finding's base probe (`/private/tmp/abg-td25m-work/many-base.jsonl`); the
fixtures and the live store project on base.

| Cut (toolchain row `packageVersion`) | Logs | Project on base | Refused at decode on base | Over 300 MB, not probed | Distinct graphs | Contracts per row | With identities | Identities the graph cannot establish |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `5.0.0-dev.286` (D1, D2, D4 campaigns, W2 steel sequence) | 147 | 45 | 102 | 0 | 54 | 54/60 | 54 | 37 |
| `5.0.0-rc.1` | 169 | 0 | 168 | 1 | 67 | 60/61/75 | 54 | 37 |
| `5.0.0-rc.2` | 6 | 0 | 1 | 5 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.3` (rc4 native recovery) | 55 | 42 | 8 | 5 | 8 | 75 | 54 | 37 |
| `5.0.0-rc.4` | 2 | 1 | 0 | 1 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.5` | 3 | 2 | 0 | 1 | 3 | 75 | 54 | 37 |
| `5.0.0-rc.6` (rc6 release qualification) | 5 | 4 | 0 | 1 | 4 | 75 | 54 | 37 |
| `5.0.0-rc.7` | 1 | 1 | 0 | 0 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.8` | 2 | 2 | 0 | 0 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.9` (rc9 owner reuse, rc10 retention) | 3 | 3 | 0 | 0 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.10` (rc11 effect phases 1 and 2, rc11 qualification, both fixtures) | 20 | 20 | 0 | 0 | 1 | 75 | 54 | 37 |
| `5.0.0-rc.12` (live default-library store) | 1 | 1 | 0 | 0 | 1 | 75 | 54 | 37 |
| total | 414 | 121 | 279 | 14 | 142 + 1 | | | |

No recorded lock names `5.0.0-rc.11`: the rc11 evidence areas record
`5.0.0-rc.10` locks, and a search of every `*.jsonl` under
`work/`, `comments/` and `evidence/` finds no `typescript-tenant@5.0.0-rc.11`
and no `typescript-tenant@5.0.0-rc.12` outside the live store. Non-toolchain
rows (27 distinct Products, among them `default-library-witness/consumer@5`,
`selected-action/product@5`, the D-campaign fixtures) have empty graphs and
no contract with identities; for them the question does not arise.

### 3.4 What else recorded commits to the identities

The lock digest commits to everything in the lock. Apart from it, one
recorded digest commits to the identities: the catalog digest. On every
distinct recorded toolchain catalog (35 catalog digests over the 13 cuts,
logs under 512 MB, `/private/tmp/abg-td77-work/scripts/catalog-digest-check2.mjs`),
`catalogDigest` recomputes from the row alone, with the catalog digest
formula over the row's own `publicContracts` and with `catalogSchemaPath`
and `catalogSchemaDigest` read from the row's own
`abg.schema.public-contract-catalog` contract (`assetLocator.path`,
`assetLocator.contentDigest`). The catalog schema path and digest are
recorded nowhere else in the lock or the store. The graph's flat owner
coordinates carry the same catalog digest, and their row digests and the
graph digest bind it. So the recorded graph binds the recorded identities
through the catalog digest, but does not determine them. Non-toolchain rows
have no catalog-schema contract, so their catalog digest does not recompute
from the row; they carry no identities.
