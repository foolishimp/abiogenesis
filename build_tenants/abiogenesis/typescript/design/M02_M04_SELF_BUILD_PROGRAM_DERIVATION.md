# M02/M04 Self-Build Program Derivation

**Status**: Approved design target for T-224
**Scope**: DS-1F B5 carrier and exact I4/I1 compatibility boundary
**Authority**: `REQ-R-ABG3-SELFHOSTING`, `REQ-P-INSTALL`,
`REQ-P-CATALOG`, `REQ-P-PUBLIC-CONTRACTS`, T-218, T-221, T-241

## Purpose

Define one immutable B5 self-build program that exact installed I4 can admit
and start without a compatibility patch and that an installed 5.0 candidate
can re-admit through the 5.0 catalog. This design freezes carrier meaning and
the DS-1F feasibility contract. It does not execute the two-stage build or
define a second compiler.

## Governing Correction

Exact I4 is `@abiogenesis/typescript-tenant@4.6.0-rc.3`. Its immutable product
does not contain the 5.0 public contract catalog, `AbiogenesisPublicSdk`,
`abg.cli`, or the DS-1 operation set. It does publish the GTL Module,
StartIntent, execution-basis, event, standard-handler, and public start
contracts needed by a bounded B5 program.

Therefore:

- B5 bytes and runtime meaning are common across both stages;
- ingress operation identities are not common across both stages;
- I4 uses its released public Module/start surface;
- I1 additionally uses its 5.0 product/catalog/SDK surface; and
- no adapter may make I4 appear to expose a 5.0 operation.

This is the exact predecessor profile admitted by T-241. It is not a reusable
legacy compatibility rule.

## Structural Decision

B5 is a specialized serialized GTL `Module`. It is not an outer executable
manifest containing a Module.

The Module:

- has name `abiogenesis.self_build.b5`;
- contains exactly one callable GraphFunction with id and name
  `graph-function://abiogenesis/self-build/v1`;
- contains one Job that binds that GraphFunction;
- carries ordinary supporting graph, node, role, evaluator, rule, and program
  declarations; and
- carries one reserved `abg.self_build_program_manifest` JSON metadata entry.

The metadata entry is identity and contract data. It carries no runtime
object, executable locator, selected worker, event, traversal cursor,
continuation, or closure decision.

The 5.0 schema `abg.schema.self-build-program-manifest` refines the ordinary
GTL Module schema by constraining this metadata entry and the selected
GraphFunction. Exact I4 admits the same bytes with its ordinary `admitModule`
contract. I4 is not claimed to understand the 5.0 schema identity.

## Exact Common Subset

| Meaning | Exact I4 public surface | 5.0 candidate surface | B5 use |
|---|---|---|---|
| Graph declarations | `gtl/m01` constructors, admission, serialization, C syntax v1 | same | author the selected program |
| Module publication | `gtl/m02` `admitModule`, `serializeModule` | same plus specialized B5 admission | parse and canonicalize the exact B5 bytes |
| GraphFunction binding | `admitExecutionBasis` over Module and StartIntent | same beneath catalog invocation | bind the selected id/name and Job |
| Declaration listing | `Module.graphFunctions` | same plus catalog list | prove the selected GraphFunction is present exactly once |
| Input/output intent | `admitStartIntent`, `inputBindings`, `requestedOutputs` | same | bind S5 and the job-local candidate output |
| Runtime events | explicit event sink and canonical runtime events | same beneath public result/replay | preserve execution truth |
| Public execution | `publicStartAsync` or `publicCallableStartAsync` | same plus `catalog.invoke` SDK operation | enter ABG without a private runner |
| Deterministic effects | standard process-execution and materialization handlers | same | run the declared build plan and write only the output root |
| Installed selection | exact T-221 package/tarball/manifest binding | 5.0 resolved lock and workspace binding | select one builder product |

`constructModuleLookupAuthority`, DS-1 catalog operations, and `abg.cli` are
not in the common subset. T-225 must not use them on the I4 leg.

## B5 Manifest Metadata

The reserved metadata value is a closed record:

| Field | Contract |
|---|---|
| `kind` | literal `self_build_program_manifest` |
| `schemaVersion` | integer `1` |
| `schemaRef` | `abg.schema.self-build-program-manifest` |
| `manifestId` | `self-build-program://abiogenesis/5/v1` |
| `manifestVersion` | SemVer `1.0.0` |
| `manifestDigest` | canonical B5 Module digest |
| `graphFunctionRef` | exact selected GraphFunction id/name |
| `graphFunctionDigest` | canonical selected GraphFunction digest |
| `compatibilityProfiles` | closed predecessor and candidate profiles |
| `sourceInputContract` | immutable S5 snapshot contract |
| `resultContract` | candidate/result carrier contract |
| `equivalenceContract` | C1/C2 comparison declaration |
| `requiredPluginRefs` | exact installed deterministic handler refs |
| `requiredCapabilityRefs` | exact profile-scoped capabilities |
| `feasibilityAction` | bounded DS-1F action and expected artifact contract |
| `authorityRefs` | SELFHOSTING and product requirement refs |
| `provenanceRefs` | T-224/T-225 publication refs |

Unknown fields fail specialized B5 admission. Ordinary I4 Module admission
still treats the metadata as typed serialized data; it does not infer missing
B5 meaning.

## Identity And Digest Law

B5 identity is the tuple `(manifestId, manifestVersion, manifestDigest)`.

`manifestDigest` is SHA-256 over RFC 8785 canonical serialized Module bytes
with only the nested `manifestDigest` value omitted from the digest basis.
`graphFunctionDigest` is SHA-256 over canonical serialized bytes of the
selected GraphFunction. The selected GraphFunction id and name must both equal
`graphFunctionRef`.

Absolute paths, selected builder identity, S5 instance identity, run identity,
and output locations are invocation facts and do not enter B5 identity.

Both bootstrap stages must read the same frozen B5 bytes. Reconstructing an
equivalent-looking Module from S5 or current source is not re-admission of B5.

## Compatibility Profiles

Exactly one whole profile must match one selected installed product. Fields
from different installed products or profiles cannot be combined.

### Exact predecessor

- package: `@abiogenesis/typescript-tenant@4.6.0-rc.3`;
- tarball SHA-256:
  `9cffb372c0dfc00983a5d0e882efbc3d0c3ac937a56f313000f35a4473358113`;
- installed manifest SHA-256:
  `92b3f94dd32bca9368a9511d823cc8b6e2eae75cd7168c9e901d3cbe8eadf07d`;
- exact required package exports and symbols from the common-subset matrix;
  and
- no 5.0 catalog or `@5` capability claim.

### Candidate line

- package: `@abiogenesis/typescript-tenant`;
- prerelease-aware range: `>=5.0.0-0 <5.1.0-0`;
- specialized B5 schema and native locator rows;
- required `abg.contract.gtl.m01`, `abg.contract.gtl.m02`,
  `abg.contract.abg.m03`, and `abg.contract.app.m04` rows; and
- catalog contribution/invocation, GTL admission/publication, and installed
  binding capability rows required by the selected 5.0 product.

The candidate profile is re-evaluated against exact I1 before stage two. A
version range never substitutes for the candidate artifact and manifest
digests recorded by the stage-two binding.

## S5 Input Contract

`SelfBuildSourceInputV1` is invocation data and carries:

- `sourceId` and immutable inventory digest;
- inventory algorithm and source-manifest digest;
- job-bound read-only source-root URI;
- project-relative package root;
- fresh job-local work root and separate output root;
- declared build-tool and method input refs; and
- the B5 input schema identity and digest.

Both stages bind the exact same `sourceId` and inventory digest. S5 may provide
source, package/build declarations, lockfiles, configuration, and compiler
inputs. It may not provide the builder runtime, public start adapter, worker or
provider plugin, controller, or private helper used to drive B5.

The installed builder is read-only. S5 is read-only. Build effects occur only
in the fresh work root. Candidate effects occur only in the output root.

## Result Contract

`SelfBuildProgramResultV1` carries:

- bootstrap stage and truthful terminal disposition;
- exact builder compatibility-profile result;
- B5 and S5 identities and observed digests;
- GraphCall, run, result, evidence, and replay refs;
- candidate payload inventory digest and package/export inventory;
- product, install, catalog, conformance, and source-isolation result refs;
- job-bound output root; and
- all residuals blocking convergence.

A missing artifact, invalid result, non-converged run, source-isolation
failure, or unresolved residual is non-close truth.

## Equivalence Declaration

B5 declares comparison rows. It does not embed a second comparator engine.

Byte/digest equality applies to extracted candidate payload inventories,
package identity, public exports, canonical declarations, and deterministic
compiled payloads. Canonical semantic equality applies to product/install/
catalog manifests and runtime binding meaning after removing declared
instance-local fields. Result equality applies to conformance status, finding
identities, required scenario results, and B5 input/output meaning.

Declared nondeterminism is limited to run, GraphCall, frame, event, and
archive identities; ordinals; timestamps; PIDs; durations; absolute work,
install, and archive paths; and transport transcript identity. Tar archive
bytes may differ only when the extracted immutable payload inventories agree.
Any undeclared difference fails equivalence.

## Publication Rows

T-225 publishes these 5.0 contract rows:

- `abg.schema.self-build-program-manifest`;
- `abg.schema.self-build-source-input`;
- `abg.schema.self-build-program-result`; and
- `abg.schema.self-build-equivalence`.

The manifest row has a native locator under
`@abiogenesis/typescript-tenant/gtl/m02` for the specialized type, admission,
and canonical serialization helpers. The 5.0 catalog contribution points to
the exact B5 Module/GraphFunction digest. I4 uses only ordinary Module
admission and public start.

## Failure Ownership

| Failure | Owning boundary |
|---|---|
| malformed specialized metadata or unknown field | B5 schema/admission |
| manifest or GraphFunction digest mismatch | B5 identity admission |
| wrong builder package/tarball/manifest/export set | compatibility profile |
| missing 5.0 schema/contract/capability row | 5.0 catalog readiness |
| invalid or changed S5 identity | source-input admission |
| source/runtime fallback or wrong write root | source-isolation gate |
| public start refusal or non-convergence | ABG runtime/result truth |
| missing/invalid candidate artifact | result admission |
| C1/C2 mismatch | DS-5 equivalence gate |

No failure is repaired by trying another ambient package, source import, or
compatibility wrapper.

## Break Order

1. T-225 materializes schemas and the exact B5 Module.
2. Freeze B5 identity and the feasibility artifact contract.
3. Verify exact I4 identity and public symbol inventory.
4. Prove parse, invocation binding, Module listing, and public start.
5. Prove one deterministic artifact and replay chain with source isolation.
6. Re-run specialized admission under the 5.0 candidate surface.
7. Preserve B5 bytes/digest as the DS-5 input.

T-225 may realize this order. Full C1/C2 execution remains T-233/T-234.
