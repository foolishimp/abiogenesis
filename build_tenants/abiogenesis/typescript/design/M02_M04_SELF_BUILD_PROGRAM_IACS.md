# M02/M04 Self-Build Program IACS

**Derived from**: `M02_M04_SELF_BUILD_PROGRAM_DERIVATION.md`
**Scope**: B5 carrier ownership, identity, side effects, and consumers

## Authoritative Carriers

| Carrier | Owner | Producer | Consumer | Persistence |
|---|---|---|---|---|
| `SelfBuildProgramManifest` | M02 GTL publication | T-225 B5 publisher | I4 ordinary Module admission; I1 specialized admission/catalog | frozen canonical Module bytes |
| `SelfBuildManifestMetadataV1` | M02 B5 specialization | specialized constructor/admitter | compatibility, input/result/equivalence gates | one Module metadata entry |
| `SelfBuildCompatibilityProfile` | M02 B5 specialization | B5 publisher | stage binding preflight | inside B5 identity |
| `SelfBuildSourceInputV1` | M04 public invocation | DS-5 stage input publisher | StartIntent input admission and B5 GraphFunction | immutable stage input |
| `SelfBuildProgramResultV1` | M03 runtime result contract | selected B5 GraphFunction through ABG | DS-5 stage/equivalence gate | result plus replay refs |
| `SelfBuildEquivalenceContractV1` | M02 B5 specialization | B5 publisher | DS-5 comparator/projection | inside B5 identity |
| `SelfBuildCompatibilityResult` | M04 binding preflight | selected builder/profile comparison | public start and result | stage evidence |
| `SelfBuildSourceIsolationResult` | M03/M05 proof projection | traced stage execution | result and release gate | stage evidence |
| `B5FeasibilityProof` | M05 qualification | T-225 installed proof | T-233/T-234 intake | durable proof record |

`SelfBuildProgramManifest` is a specialized `Module`; it is not a second
envelope family beside `Module`.

## Subordinate Values

| Value | Reason subordinate |
|---|---|
| selected GraphFunction ref/digest | field of B5 identity, not independent publication |
| exact I4 export inventory | compatibility evidence, not a new API facade |
| Module GraphFunction list | pure read of admitted Module, not 5.0 catalog truth |
| job-local work/output paths | invocation facts, excluded from B5 identity |
| feasibility marker bytes | one proof artifact, not the self-build result contract |
| stage adapter arguments | proof-harness ingress only, no runtime authority |

## Identity Rules

1. B5 identity is `(manifestId, manifestVersion, manifestDigest)`.
2. One identity resolves to one exact canonical Module byte sequence.
3. The manifest digest omits only its own nested value from the RFC 8785 basis.
4. The GraphFunction digest covers the selected canonical GraphFunction.
5. Selected GraphFunction id and name both equal `graphFunctionRef`.
6. The Module contains exactly one Job targeting that GraphFunction.
7. Stage one and stage two cite the same B5 bytes and observed digest.
8. S5 and builder identities are stage inputs, not B5 identity fields.

## Compatibility Arms

| Arm | Required identity | Required contract evidence | Forbidden inference |
|---|---|---|---|
| `exact_predecessor` | T-221 package, tarball digest, installed-manifest digest | exact common public export symbols | any 5.0 catalog/SDK/CLI capability |
| `candidate_line` | exact installed 5.0 candidate plus range `>=5.0.0-0 <5.1.0-0` | B5 schema/native row and required 5.0 contracts/capabilities | satisfaction from predecessor or ambient package |

One selected product satisfies one whole arm. There is no fallback order.

## Side-Effect Rules

- B5 admission and compatibility comparison are pure.
- Module listing is pure.
- Only ABG public start may open GraphCall/runtime truth.
- Process execution uses the installed standard handler selected by declared
  B5 program law.
- Materialization writes only below the job-bound output root.
- Event emission uses the ABG event sink; the adapter does not emit.
- S5, B5, and the installed builder remain read-only.
- The candidate is not executable as I1 until stage one converges and the
  candidate is independently installed.

## Cross-Line Ingress

### I4

```text
exact installed identity
  -> read frozen B5 Module bytes
  -> admitModule
  -> admit StartIntent and execution basis
  -> inspect Module.graphFunctions
  -> publicStartAsync
  -> ABG result/events
```

### I1

```text
exact installed identity and resolved lock
  -> verify B5 specialized schema/digest
  -> install/bind/admit B5 contribution
  -> catalog list/describe/invoke
  -> same Module/GraphFunction and ABG runtime meaning
  -> public result/replay
```

The different ingress profiles do not change B5 bytes or GraphFunction
meaning.

## Error Families

| Error family | Stable reason class |
|---|---|
| `self_build_manifest_invalid` | schema or specialized metadata refusal |
| `self_build_identity_mismatch` | manifest/GraphFunction digest or identity mismatch |
| `self_build_builder_incompatible` | no complete compatibility arm matches |
| `self_build_common_export_missing` | exact I4 public symbol absent |
| `self_build_contract_missing` | required candidate contract/capability row absent |
| `self_build_source_invalid` | S5 identity/root/inventory refusal |
| `self_build_source_isolation_failed` | S5 executable import or root violation |
| `self_build_output_invalid` | output root or result/artifact refusal |
| `self_build_not_converged` | truthful runtime stop/residual result |
| `self_build_equivalence_failed` | DS-5 declared comparison mismatch |

## Prohibited Ownership

The B5 publisher, compatibility preflight, proof adapter, catalog, and CLI do
not select workers, open GraphCalls, run traversal loops, emit runtime events,
advance continuations, decide closure, or repair results. Those remain ABG
runtime responsibilities.

## Mixed-State Law

- B5 schema present but wrong digest: refuse before start.
- Exact I4 selected but a candidate-line capability is requested: refuse the
  profile; do not widen I4.
- Candidate selected but the predecessor arm matches: refuse; profile mixing
  is not compatibility.
- B5 admitted but S5 changed: refuse the stage input.
- Artifact exists without converged runtime/result truth: retain artifact as
  non-close evidence only.
- C1 and C2 each converge but use different B5 or S5 identity: equivalence is
  ineligible, not failed-by-content.

## Realization Boundary

T-225 owns schema/types/admission, exact B5 publication, and the I4 feasibility
proof. T-233/T-234 own the full stage controller, C1/C2 results, and
equivalence execution. No T-225 fixture behavior may become a second DS-5
controller.
