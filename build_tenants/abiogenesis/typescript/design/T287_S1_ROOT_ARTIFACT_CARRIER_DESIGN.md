# T-287 S1 Root Artifact Carrier Design

## Status And Authority

This design is the operative TypeScript HOW for selected increment
`ST-S01-ROOT/S1`. GOALS and T-287 select the increment. Intent, Product,
requirements, `ABI5-ROOT-001`, `ABG5-S01`, the 18-operation/56-key Public
family, and all later scenario obligations remain unchanged.

The change classes are:

- `goal_reprice` for selecting S1 as the sole current post-MVP increment; and
- `design_reframe` for introducing one package-resident immutable root
  definition and making the existing installed owner-evidence path consume its
  Product-issued verification receipt.

The immutable entry basis is `v5.0.0-dev.286`, commit
`3014f12571c12f97f85dfe54ca4da28e7dfee3ea`, tree
`a399045de5d752b92c084b5b38b358aa2d1c63aa`, package tarball SHA-256
`4fc3130cef9fda3171bb28aafffa71775328745721e305172fce9d04c9fdfe41`.
Rejected S1 candidates are donor evidence only.

## Product Frame

ABIogenesis 5.0 remains one source-independent installed Product for a trusted
developer desktop. GTL owns Program and GraphFunction declarations, Product
owns artifact verification and catalog meaning, Validator owns whole-Program
judgment, HoG owns direct traversal, and ABG exclusively owns admitted runtime
truth. Public, SDK, CLI, tests, and the root governor are projections and do not
author the root.

S1 closes only a development evidence gate corresponding to root obligation
`R1 exact artifacts verified`. Its frozen artifact is not the Product's
`pre_rc_candidate`. S1 does not close constitutional R1, `ABI5-ROOT-001`,
`ABG5-S01`, Wave 2, ABIogenesis 5.0, qualification, RC authorization, final
tap, or release. `ST-S01-ROOT/S2` through `S4` remain `UNSELECTED`.

The destination-owned module may co-publish deferred forms. The fixed root
scope is its exact all-`F_D` Program and GraphFunction slice, not a claim that
every declaration in the `ModulePublication` is `F_D`.

## Entity Classification

| Entity | Class | Owner | Lifecycle |
|---|---|---|---|
| root binding JSON | immutable Product definition | Product | checked in and content-addressed; never opened, advanced, or closed |
| root asset locator | immutable manifest coordinate | Product packaging | derived into the manifest and verified against packed bytes |
| root verification receipt | deterministic construction and evidence | Product verification | derived once from verified bytes; no event or mutable state |
| `rootCarrierConsumed` | pure observation/equality projection | root owner-evidence reducer | recomputed from existing installed Product and ABG projections |
| root governor result | derived proof reduction | qualification support | consumes owner evidence; never authors Product or runtime truth |

No root-specific runtime entity, store, registry, catalog, event, Public
operation, controller, service, callback, or mode selector is introduced.

## One Definition Authority

The sole maintained semantic definition is the checked-in canonical asset:

```text
contracts/abi5-root-binding.json
```

Its exact closed value is:

```json
{
  "kind": "abi5_root_binding",
  "schemaVersion": "5.0.0",
  "bindingId": "ABI5-ROOT-001",
  "governorId": "abg5.root.s01.hello_world@5",
  "scenarioId": "ABG5-S01",
  "moduleRef": "module://abiogenesis/conformance/hello-world@5",
  "programRef": "program://abiogenesis/conformance/hello-world@5",
  "graphFunctionRef": "graph-function://abiogenesis/conformance/hello-world@5",
  "inputContractRef": "contract://abiogenesis/conformance/hello-input@5",
  "outputContractRef": "contract://abiogenesis/conformance/hello-output@5",
  "computeRegime": "F_D"
}
```

Candidate Product identity, package version, artifact digest, publication
digest, start, closure contract, validation, leaf requirement, and runtime
coordinates are not maintained definition fields. They belong to the verified
subject or downstream owners. This keeps the semantic definition stable across
development cuts and keeps later root obligations with their owners.

TypeScript defines only the strict Valibot schema, parser, pure verifier,
receipt construction, and receipt guard. It must not export a second full-value
`ABI5_ROOT_BINDING`, generate the asset from compiled values, embed canonical
asset bytes, or accept a caller-authored substitute definition.

## Manifest And Cardinality

The Product manifest has one dedicated `rootBindingAsset` locator using the
existing `ProductAssetLocator` shape:

```text
{
  path: "contracts/abi5-root-binding.json",
  mediaType: "application/json",
  schemaVersion: "5.0.0",
  contentDigest: sha256(assetBytes)
}
```

The generator inventories and hashes the existing checked-in asset; it does
not author the asset. Generic payload inventory alone is not the selection
relation.

Cardinality is closed:

- an ABIogenesis 5 development or release candidate has exactly one locator
  and one exact asset at that locator; and
- unrelated or dependency Products have no root-binding locator or receipt.

The verifier enforces this relation from the manifest Product identity. It is
not a caller-selected mode and does not create a general extension registry.

## Product Verification Relation

Let `CJ` be canonical JSON and `H` be SHA-256. Product verification runs after
archive, manifest, safe-locator, payload-inventory, and Product-content checks,
and before the final `VerifiedProductArtifact.verificationDigest` is minted.

```text
verifyRootBinding(
  verified packed subject,
  rootBindingAsset locator,
  rootBindingAsset bytes,
  contribution manifest
)
  -> Abi5RootBindingVerificationReceipt
   | ProductVerificationRefusal
```

Admission requires:

```text
assetBytes = CJ(strictParse(assetBytes))
H(assetBytes) = rootBindingAsset.contentDigest
strictParse(assetBytes) = the exact closed definition above
rootBindingAsset is the manifest-selected locator
contributionManifest belongs to the same verified Product subject
exactly one contributionManifest.publicationBindings row has
  moduleRef = definition.moduleRef
```

The receipt body contains:

```text
kind = "abi5_root_binding_verification_receipt"
schemaVersion = "5.0.0"
disposition = "verified"

binding = {
  definition: parsed immutable definition,
  assetLocator: verified manifest locator
}

subject = {
  artifactRef,
  artifactDigest,
  productId,
  packageName,
  packageVersion,
  productContentDigest,
  manifestDigest,
  contributionManifestRef,
  contributionManifestDigest
}

publicationBinding = the unique selected publication binding
```

`receiptDigest = H(CJ(receipt body))` and
`receiptRef = root-binding-verification://abiogenesis/<receipt digest hex>`.
The receipt is deeply frozen.

The receipt is embedded directly in the ABIogenesis branch of the
`VerifiedProductArtifact` body before the enclosing verification digest is
computed. The packed subject coordinates in the receipt are pre-verification
inputs, so no digest cycle exists. Unrelated Product artifacts carry no root
receipt. The public `product.verify#verify` result remains its existing exact
coordinate projection; this design does not change the Public-family result
contract.

Receipt verification strict-admits the candidate and deterministically reruns
the Product relation against the same packed subject. Recomputed receipt hashes
without the owner relation do not establish validity.

This relation does not import GTL, construct a `ModulePublication`, invoke
`ConformancePort`, inspect an executable leaf, construct a catalog, or emit an
ABG event.

## Installed Consumption Relation

The verified receipt is necessary input to the existing installed path:

```text
successful installed product.verify outcome
  -> VerifiedProductArtifact root receipt
  -> receipt-selected root GraphFunction and Program coordinates
  -> ordinary installed catalog admission and view
  -> ordinary Public run.invoke
  -> ABG InvocationAdmission and ExecutionBasis
  -> HoG traversal and ordinary ABG events
  -> replay and CLI projection
```

`test_env/support/root-owner-evidence.mjs` derives the receipt from the unique
successful installed verification outcome. It must not accept a fixture-
supplied receipt or choose the root from caller request data. Its equality join
requires:

- the catalog lookup key equals the receipt GraphFunction ref;
- the run request Program and GraphFunction refs equal the receipt definition;
- the selected catalog row belongs to the receipt-selected publication
  binding and contains the root Program membership;
- the rehydrated `ExecutionBasis` names that same Program, GraphFunction,
  catalog view, workspace, implementation lineage, and contract coordinates;
- the validated root Program has exactly one callable membership and only its
  one reachable `F_D` traversal; and
- the existing replay basis and CLI outcome derive from the same admitted
  invocation.

The reducer exposes one boolean `rootCarrierConsumed` plus the owner-issued
receipt/equality evidence needed to falsify it. `root-governor.mjs` consumes
that relation and the evidence-carried definition. It retains only the
constitutional binding identity as a fixed expectation; parallel hard-coded
module, Program, GraphFunction, and contract selectors are removed.

Actual all-`F_D` closure first belongs to the normal R7 ProgramValidation and
ExecutionBasis equality. R9 C-call evidence corroborates the executed fibre.
S1 fixes the expected regime but does not pull either later owner judgment into
the R1-only verifier.

The receipt is not copied into the lock, install, catalog, Public invocation,
ABG event, or replay carrier. Existing artifact/content/manifest equality and
install-time re-verification keep those owners on the same installed bytes.

## Implementation Ownership

| Path | Authorized change |
|---|---|
| `contracts/abi5-root-binding.json` | add the sole fixed semantic definition |
| Product manifest schema/type | add the dedicated conditional locator |
| `scripts/generate-product-manifest.mjs` | inventory and hash the checked-in asset |
| `code/src/product/contracts.ts` | add strict definition, locator, receipt, and verified-artifact refinement types |
| `code/src/product/root_binding.ts` | add parser, pure verification relation, receipt construction, and guard; no fixed-value constant |
| `code/src/product/verify_product.ts` | issue the receipt before the verified-artifact digest |
| `code/src/product/index.ts` | export types, parser/guard, and verification relation as needed; no definition value or generated bytes |
| root CLI/evidence/governor support | replace hard-coded or caller-selected root coordinates with the verified receipt |
| focused S1 and existing root-governor tests | prove exact packed verification, consumption, and bounded falsifiers |

GTL, Validator, install, environment, catalog algorithms, Public, ABG, HoG,
and Implementation remain generic owners and acquire no root-specific semantic
branch. Generic install code may carry only the already-verified artifact
unchanged.

## Proof And Review Cuts

The frozen S1 artifact is built once. Its candidate basis is held outside the
candidate and outside the test source tree. The source-blind proof creates a
fresh consumer host, installs only the prebuilt tarball, imports only installed
package exports, and verifies exact artifact, Product content, manifest,
package, and root coordinates. The R1-only cut creates no catalog, workspace,
invocation, ABG event, or replay.

The installed consumption cut uses the same artifact and existing installed
root path. It proves `rootCarrierConsumed` and the receipt-to-catalog-to-basis
equality without claiming later constitutional obligations on this development
subject.

Deep review occurs once for each irreducible seam:

1. immutable definition versus derived asset locator and receipt;
2. Product verification and conditional carrier cardinality; and
3. installed receipt-to-catalog-to-ExecutionBasis consumption.

Manifest inventory, digests, package load, exact fields, receipt reproduction,
and repeated fixed-coordinate mutations are mechanical checks. They do not
create per-field or per-owner design reviews.

Required falsifiers are:

- missing, altered, duplicate, wrong-path, wrong-media-type, or wrong-digest
  root asset;
- stale external artifact, Product-content, or manifest basis, including after
  internally recomputing a mutated candidate's manifest;
- wrong binding, governor, scenario, module, Program, GraphFunction, input,
  output, or compute regime;
- duplicate or absent matching publication binding;
- a root locator or receipt on an unrelated Product;
- a self-consistent forged receipt with recomputed ref/digest;
- correct receipt with crossed catalog publication, Program, GraphFunction,
  contract, run request, or ExecutionBasis;
- source-tree, private-build-path, ambient-package, or fixture substitution;
  and
- any refusal that performs owner execution or appends an ABG event.

## Stop Conditions

Stop and re-enter the owning authority if implementation needs to change a
root identity, scenario subject, R1 meaning, Public operation/result contract,
semantic owner, event kind, 18/56-family identity, or Product requirement.
Stop on a second maintained definition, runtime registry, new catalog, root
event, direct leaf bypass, source import, fixture-authored truth, or adjacent
receipt that the installed owner path does not consume.

After one candidate passes worker readiness checks, freeze it and stop editing.
S1 acceptance does not authorize S2. A later increment requires another
explicit goal selection.
