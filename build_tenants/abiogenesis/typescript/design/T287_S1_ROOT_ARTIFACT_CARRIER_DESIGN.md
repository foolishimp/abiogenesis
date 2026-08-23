# T-287 ST-S01-ROOT/S1 v3 Artifact Carrier Design

## 1. Status And Authority

This is the complete TypeScript HOW candidate for the selected
`ST-S01-ROOT/S1` development gate. It is unaccepted. It becomes implementation
authority only if this exact four-document subject receives and delivers an
independent docs-accept verdict.

The lawful re-entry is `design_reframe`. Intent, Product, requirements, feature
membership, scenarios, the `ABI5-ROOT-001` table, obligations R1-R10, Public
contracts, owners, runtime law, and release subjects stay fixed.

The candidate starts from detached stable main commit
`326c214c982d527c18d716e1db9637becadd5c71`, tree
`518d37bda358f85e07ed263293909285694b5cac`. Rejected docs commits `6720c0d9`,
`87d369d3`, and `1e1e61af` are counterexample evidence only and are neither
ancestors nor wholesale donors.

S1 uses only the subject kind `s1_development_candidate` and the terms
development-gate proof and independent reproduction. It is not qualification.

## 2. Product Frame And Exact Stop

ABIogenesis 5.0 remains the fixed 16-family Product: `A5-F01` through
`A5-F11` and `A5-F13` through `A5-F17`. Wave 2 / `A5-F01` is current. Only S1
is selected.

GTL owns Program and GraphFunction meaning. Product owns artifact verification,
installation construction, readiness, and selection. Validator owns whole-
Program judgment. HoG owns direct traversal. ABG alone admits runtime facts.
Replay and Public are projections/transports over their owners.

S1 establishes exactly this relation:

```text
one frozen candidate basis C
  + one exact prebuilt artifact A
  + one exact immutable proof bundle G and case-law set L
  -> Cut A packed Product verification and private root receipt coordinate
  -> Cut B fresh offline extraction preparation
  -> raw installed-tree observation and packed-byte equality
  -> packed re-verification and private receipt-coordinate equality
  -> one lexical immutable root declaration selection
  -> closed development-gate result
```

Cut B package-manager extraction is proof-host preparation. It is not Product
resolution, lock construction, Product installation, `ProductInstall`
admission, or R2.

S1 stops before every Product runtime relation. It does not construct or call
Product resolve/install, `ProductInstall`, Workspace, Catalog/View, Program or
GraphFunction admission, `ProgramValidation`, materialized GTL,
`ExecutionBasis`, HoG, an owner implementation, ABG, replay, SDK/CLI, or a
governor. It creates no operation, capability, event, store, registry,
controller, or runtime identity.

| Product obligation | Owner retained after S1 | S1 state |
|---|---|---|
| R1 exact artifacts verified | later exact `pre_rc_candidate` root subject | not evaluated; S1 evidence cannot satisfy it |
| R2 clean install | Product install plus ABG admission | absent |
| R3 workspace binding | Product candidate plus ABG admission | absent |
| R4 catalog admission/narrowing | Product and Validator | absent |
| R5 target Program selected/admitted | Program/Product/Validator | absent |
| R6 GraphFunction and contracts resolved | Product | absent |
| R7 materialized GTL validated | GTL/Validator | absent |
| R8 HoG entered through Public invocation | Public/HoG | absent |
| R9 causal result and closure admitted | ABG | absent |
| R10 replay and CLI equality | replay/Public CLI | absent |

S1 therefore cannot claim `ABI5-ROOT-001`, `ABG5-S01`, any scenario,
qualification, RC eligibility, final tap, release, or selection of S2-S4.

## 3. Root Definition And Acyclic Product Identity

### 3.1 Sole authored carrier

The only authored Product-owned full root definition is canonical JSON at:

```text
contracts/abi5-root-binding.json
```

Its strict closed semantic table is the unchanged Product root table:

| Field | Fixed value |
|---|---|
| `kind` | `abi5_root_binding` |
| `schemaVersion` | `5.0.0` |
| `bindingId` | `ABI5-ROOT-001` |
| `governorRef` | `abg5.root.s01.hello_world@5` |
| `scenarioRef` | `ABG5-S01` |
| `moduleRef` | `module://abiogenesis/conformance/hello-world@5` |
| `productBoundary.subjectKind` | `pre_rc_candidate` |
| `productBoundary.requiredPayload` | one exact packed ABIogenesis Product including its destination-owned all-`F_D` conformance module |
| `runnableForm.environment` | clean source-blind trusted developer desktop installation |
| `runnableForm.entrypoint` | installed native `abg.cli` |
| `programRef` | `program://abiogenesis/conformance/hello-world@5` |
| `declaredTraversalRegime` | one all-`F_D` traversal target |
| `declaredCallableMembershipCardinality` | exactly one target membership |
| `graphFunctionRef` | `graph-function://abiogenesis/conformance/hello-world@5` |
| `inputContractRef` | `contract://abiogenesis/conformance/hello-input@5` |
| `outputContractRef` | `contract://abiogenesis/conformance/hello-output@5` |
| `expectedTerminalOutcome` | one admitted terminal Hello World result plus one causally complete replay projection |
| `nearestWeakerExclusions` | package, schema, symbol, catalog row, component test, event co-presence, or fixture-authored result without the complete installed causal path |

These are declarations of the eventual root. S1 proves their exact carrier and
owner relation, not callable membership, traversal, result, replay, or root
satisfaction.

`B_root` is exactly UTF-8 RFC 8785 JCS of that closed table, with no BOM,
leading/trailing whitespace, or newline.

The carrier contains no `publicationDigest`, package name/version, Product id,
publisher namespace, or other artifact-owner tuple. TypeScript supplies a
strict structural parser and canonical-byte relation, not a second full-value
constant or generated copy of the table.

### 3.2 Identity order

Use the repository's RFC 8785 JCS and SHA-256 functions. Let `B_root` be the
canonical root bytes, `Q` Product content, `P` the exact module-publication
semantic digest, `M` the final manifest digest, and `A` the packed artifact
digest. Construction is acyclic and ordered:

```text
B_root
  -> D_root = sha256(B_root)
  -> Q = digest(sorted complete payload rows including B_root)
  -> P = digest(existing publication constructed after Q)
  -> M = digest(final manifest containing Q, root locator D_root,
                publication binding P, and manifest-owned owner context)
  -> A = sha256(final packed archive bytes containing that manifest/payload)
```

No member points backward to a value that depends on itself. The manifest owns
the carrier locator and contextual publication binding. The carrier never owns
`P`, `M`, `A`, or the publication owner.

### 3.3 Conditional cardinality

The exact ABI predicate is exact package name, candidate version-derived
Product id, and manifest publisher identity—not a prefix, flag, or first match.

```text
exact ABI Product
  => exactly one rootBindingAsset locator
  => exactly one reserved root carrier in the complete packed snapshot
  => locator names that carrier
  => exactly one publication matches moduleRef plus manifest owner context

every non-ABI Product
  => zero rootBindingAsset locators
  => zero reserved root carriers anywhere in the packed snapshot
  => zero S1 receipt or selection
```

An unreferenced second valid carrier is a shadow and refuses. A malformed JSON
file claiming reserved `kind: abi5_root_binding` also refuses; it is not treated
as unrelated payload. Case-fold collisions, alternate path spellings, duplicate
canonical paths, or a copied ABI locator in a non-ABI Product refuse before a
receipt.

## 4. Sole Package Carrier Port

`package.json` adds exactly one narrow subpath:

```text
./product/s1-root-carrier
  -> build/code/src/product/s1_root_carrier.js
  -> build/code/src/product/s1_root_carrier.d.ts
```

That module has exactly one named export and no default or type export. Its
generated declaration surface is:

```ts
export declare const ABI5_S1_ROOT_CARRIER_PORT: Readonly<{
  verifyPacked(input: {
    verificationRequest: VerifyProductRequest;
    expectedRootBindingDigest: Sha256Digest;
    expectedPublicationDigest: Sha256Digest;
  }): Promise<
    | {
        kind: "s1_packed_verified";
        verifiedArtifact: VerifiedProductArtifact;
        packedSnapshotCoordinate: RefDigest;
        verificationCoordinate: RefDigest;
        rootReceiptCoordinate: RefDigest;
      }
    | S1CarrierRefusal
  >,

  verifyInstalledAndSelect(input: {
    verificationRequest: VerifyProductRequest;
    installedPackageRoot: string;
    expectedRootBindingDigest: Sha256Digest;
    expectedPublicationDigest: Sha256Digest;
    expectedCutA: {
      verificationCoordinate: RefDigest;
      rootReceiptCoordinate: RefDigest;
    };
  }): Promise<
    | {
        kind: "s1_installed_selected";
        verificationCoordinate: RefDigest;
        installedSnapshotCoordinate: RefDigest;
        rootReceiptCoordinate: RefDigest;
        selection: Abi5S1RootSelection;
      }
    | S1CarrierRefusal
  >,
}>;
```

The implementation freezes that value with `Object.freeze`.

`RefDigest` is a strict `{ref, digest}` pair. Both request objects reject unknown
keys. The existing `VerifiedProductArtifact`, `VerifyProductRequest`, Public
verification result, and exhaustive Public refusal family remain byte/schema/
semantic compatible. The port is a package proof seam, not a new
`PublicFunctionDefinition`, Public operation, mode, runtime selector, or
capability.

The broad `./product` export does not re-export this port and therefore does not
eagerly load its parser dependency or S1 interior. No root-preimage, receipt,
packed observer, installed observer, comparator, or receipt-fed selector is
exported. The private receipt body never crosses the carrier-module or returned-
evidence boundary and never enters a file, log, event, lock, install, Catalog,
replay, or proof record. Only its content-addressed coordinate crosses Cut A/B.

`verifyInstalledAndSelect` is the only selector call. It rederives the private
packed verification and snapshot, observes the installed package, admits the
separate S1 packed-expectation comparison, derives the private preimage and
receipt, compares the Cut-A verification/receipt coordinates, projects the
immutable declaration selection in the same lexical scope, and makes the
preimage/receipt unreachable before returning. There is no
`selectRoot(receipt)` or receipt parser.

Its closed refusal distinguishes a local packed/installed/preimage failure from
an exact `expectedCutA` verification/root-receipt mismatch. The result builder
maps only that reached-coordinate mismatch to `convergence_refused`; every local
Cut-B failure remains `cut_b_verification_refused`. Neither refusal returns a
selection.

## 5. Packed Product Snapshot

### 5.1 Foundation and replacement

Add exact-pinned production dependency `tar@7.5.22`, including its exact lock
and `bundleDependencies` closure. Import only `Parser` from the public
`tar/parse` subpath; do not import the broad entry or any list, create, replace,
update, unpack, or extract API.

Before any S1 proof, `verify_product.ts` deletes its system `tar` calls and its
`node:child_process` import. Each Product verification invocation reads the
artifact once, hashes those bytes, and feeds the same bytes to one in-process
`tar@7.5.22` parser to construct one type-aware `PackedProductSnapshot`.
Product verification, manifest parsing, payload inventory, native-declaration
closure, root classification, and S1 preimage verification reuse that snapshot.
No archive entry is reopened and no archive is extracted.

This is a refactor of one verifier, not a second verifier. One package-internal
semantic core in `verify_product.ts` consumes an admitted snapshot. The
existing exported `verifyProduct` Promise constructs one snapshot, calls that
core, and projects its unchanged Public result. The carrier port constructs one
snapshot and calls the same core so its `VerifiedProductArtifact` and private
preimage arise from identical Product logic. The core and snapshot-bearing
return are absent from every package export.

### 5.2 Closed grammar and limits

The parser runs strict and fails closed at these fixed bounds:

| Bound | Exact ceiling |
|---|---:|
| compressed artifact bytes | 64 MiB |
| archive entries, including directories and metadata | 16,384 |
| one regular-file body | 32 MiB |
| aggregate regular-file bodies | 256 MiB |
| UTF-8 path bytes | 1,024 |
| path components | 128 |
| one PAX metadata body | 1 MiB |
| aggregate PAX metadata | 4 MiB |
| decompression ratio | 1,000 |

The compression grammar is exactly gzip tar, matching the replaced `-z`
verification path: parser `gzip` is required, Brotli/Zstd autodetection is
disabled, and uncompressed or alternate-compression input refuses.

Only regular files and canonical directory entries under exact `package/` are
admissible. Symbolic links, hard links, character/block devices, FIFO, sockets,
GNU link/name extensions, sparse entries, whiteouts, and every unsupported type
refuse. Directory entries may only name ancestors of regular files; empty or
extra directory entries refuse.

Paths must be valid UTF-8, NFC, use `/`, start exactly `package/`, and contain
no empty, `.`, `..`, absolute, drive, backslash, NUL/control, or over-limit
component. The normalized package-relative path must equal the raw effective
path. Duplicate canonical paths and ASCII case-fold collisions refuse across
all entry types.

Local PAX is allowed only for exact `path`, `size`, `mtime`, `atime`, or `ctime`
keys with one canonical value and no NUL/control data. Global PAX, duplicate or
unknown keys, link metadata, conflicting header overrides, non-canonical
numbers, truncation, checksum failure, decompression warning, or any limit
breach refuses. Parser warnings are fatal.

The snapshot contains the artifact digest/length, ordered entry headers,
canonical file paths, exact file bytes/digests/lengths, directory set, aggregate
sizes, and a domain-separated coordinate. Byte-bearing identity bodies use
unpadded base64url plus digest and length; no Buffer is JSON-coerced. It is
private deterministic observation, not Product or runtime truth.

Existing refusal shapes and codes remain closed. Archive parse/resource errors
map to existing `artifact_unreadable`; unsafe type/path/PAX/duplicate/case
relations map to existing `unsafe_locator`; exact file-set disagreement maps to
`payload_inventory_mismatch`; truncated/unavailable content maps to
`payload_unreadable`. No root-carrier, receipt, or selection code enters Public
verification; only Product's shared packed-snapshot foundation replaces the
shell mechanics.

## 6. Raw Installed Package Observation

`InstalledPackageTreeSnapshot` is a raw Product-internal filesystem observation.
It imports no `ProductInstall`, lock, Workspace, Catalog, ABG, or runtime type.
It uses Node 24.7.0 native filesystem descriptors and applies the same
applicable entry, path, file-body, and aggregate limits.

For the root and every descendant in lexical byte order, the observer performs:

1. `lstat` each path component from the admitted mount root and prove lexical
   and real containment;
2. reject a link or special node before open;
3. open with `O_RDONLY | O_NOFOLLOW` and `O_DIRECTORY` for directories;
4. compare handle `stat` with the pre-open `lstat` identity;
5. enumerate the complete directory once;
6. for a regular file, require `nlink === 1`, unique device/inode identity, and
   read its descriptor once to EOF into the bounded byte buffer;
7. compare post-read handle `stat` and post-read path `lstat` to the pre-read
   device, inode, type, size, mode, mtime-ns, and ctime-ns identity; and
8. compare each directory's post-walk identity and entry set to its pre-walk
   observation.

Any symlink, hardlink, device, FIFO, socket, unsupported node, containment
escape, identity race, unreadable entry, case collision, duplicate, or limit
breach refuses raw observation. The observer writes nothing.

The raw snapshot records root evidence realpath, ordered directories, ordered
regular-file path/bytes/digest/length rows, descriptor identities, and its own
coordinate. Its byte fields use the same unpadded-base64url/digest/length
encoding. Realpath and device/inode facts are observation evidence, never
Product identity.

S1 then derives a separate `S1PackedExpectation` from the already verified
packed snapshot and compares the raw installed snapshot against it. Equality is
exact regular-file set and bytes plus the canonical implied directory set. It
does not reuse or expand `ProductInstall`; any extra or missing path is a typed
S1 comparison refusal.

The existing `installedProductContentMatches(...)` remains only its legacy
Boolean compatibility projection over a distinct `ProductInstallExpectation`
derived from its existing input family. It is not S1 equality evidence, gains
no S1 mode, and does not become another verifier. Both projections reuse the
one raw observer; their expectations and result meanings remain separate.

## 7. Private Preimage, Receipt, And Selection

The module-private pure verifier consumes admitted bytes, not caller-authored
receipt structure:

```text
verifyAbi5RootPreimage(
  VerifiedProductArtifact,
  PackedProductSnapshot,
  canonical manifest bytes,
  exact root bytes,
  exact contextual publication bytes,
  expected D_root,
  expected P
)
  -> opaque VerifiedAbi5RootPreimage | private refusal
```

It proves in order: request/result identity; `M`; complete snapshot and `Q`;
ABI-one/non-ABI-zero cardinality; exact locator and `D_root`; strict carrier
shape/canonical bytes; exact `moduleRef` plus manifest owner-context
publication selection; and existing `P` equality. Only success constructs an
unexported nominal brand.

Receipt derivation closes over that brand. Its body binds artifact,
verification, B/Q/P/M, locator, publication owner context, and carrier semantic
projection; its coordinate is domain-separated. Cut B reconstructs the same
body from fresh local evidence and compares only the coordinate supplied from
Cut A. Selection then projects the carrier declaration plus B/Q/P/M and owner
coordinates. It asserts no Program membership/validation, compute, runtime, or
root result.

## 8. Module Closure And Independent Confinement

### 8.1 Exact module census

The proof basis is exact Node `24.7.0`. A proof-bundle bootstrap calls
`node:module.registerHooks()` synchronously in-thread before dynamically
importing the target. Async loader threads are not used.

The exact bootstrap file is the direct Node entrypoint and contains the hook
functions. Its own bytes and unavoidable pre-registration builtin loads are
frozen G/tool-closure inputs; it imports no candidate or dependency before
registration. An extra preload, `--require`, `--import`, or other pre-hook module
refuses from the OCI process receipt. From the target dynamic import onward,
every resolve/load is hook-observed.

The only root package specifier admitted is:

```text
@abiogenesis/typescript-tenant/product/s1-root-carrier
```

The frozen static module closure contains exact module heads and importer ->
specifier -> resolved-target edges. It admits only:

- that one self subpath and exact internal relative edges inside the verified
  ABI package root;
- exact bundled dependency heads/edges whose resolved files and owning
  `package.json` remain below that root; and
- a closed, sorted, exact resolved-`node:` builtin allowlist with no wildcard;
  a bundled dependency's frozen bare builtin specifier is allowed only when its
  exact static edge resolves to the corresponding allowlisted `node:` URL.

Each file-module resolve/load pair is censused as resolved URL, realpath,
format, importer, specifier, exact base64url bytes/digest/length, owner package
root/name/version, and exact owner `package.json` base64url bytes/digest/length.
A load hook returns the same source bytes it records; census bytes cannot be a
second read substituted for executed bytes.
A builtin row instead records its exact `node:` URL/name, importer, specifier,
`builtin` format, and the frozen Node executable/tool-closure coordinate; it
does not invent a realpath or owner `package.json`. Every observed edge must be
in the static closure and every required runtime edge must be observed. A
resolved row without a load row, a load without a resolved row, or a returned
result before census closure refuses.

Source, test, fixture, checkout, private package subpath, ambient/global module,
absolute specifier, unexpected builtin edge, alternate URL scheme/casing,
`data:`, network URL, native addon, Wasm, symlink/realpath escape, unexpected
format, dependency-owner mismatch, or unobserved load refuses. Static closure
and runtime census must both exclude `root-governor.mjs`, every governor owner
module, and every prohibited runtime owner.

`verify_product.ts` removal of `node:child_process` is a precondition to static
closure freeze. Static graph plus runtime census—not V8 call counts or Product
counters—prove the narrow port cannot reach an external process or absent
owner.

### 8.2 OCI/tool closure

The proof uses one pre-frozen platform-specific OCI Node 24.7.0 image and tool
closure. `S1ToolClosure` fixes image manifest digest, platform OS/architecture,
rootfs layer digests, Node executable path/version/digest, npm `11.5.1` CLI
path/version/bytes/digest and dependency closure, bundled `tar@7.5.22` closure,
and the exact Docker Engine server version/API/OS/kernel/architecture/runtime/
storage/cgroup/security coordinate. A different platform or Engine coordinate
is a different plan.

Every image invocation uses `--pull=never`, a direct Node entrypoint, no shell,
`--read-only`, `--network=none`, `--cap-drop=ALL`,
`--security-opt=no-new-privileges:true`, and exact plan-bound
memory/`--pids-limit`/CPU/time
ceilings. Candidate source is never mounted. The container root is read-only;
artifact, Cut-A package, basis, bundle, and prepared Cut-B package mounts are
read-only during verification. The only writable verification filesystem is
bounded `nodev,nosuid,noexec` evidence tmpfs.

The process receives only a closed, sorted, plan-valued environment allowlist;
no host environment is inherited. `NODE_OPTIONS`, `NODE_PATH`, loader/preload
variables, proxy variables, and registry credentials are absent. Any required
temporary, locale/timezone, or npm configuration value names only the declared
scratch/tool closure and is recorded in the OCI receipt.

Cut B preparation is a distinct observed step. It starts from an empty declared
scratch root and invokes the pinned npm CLI directly through pinned Node with
`--offline --ignore-scripts --no-audit --no-fund --omit=dev`; npm cache/config/
prefix are empty, bounded, and scratch-local. The produced package root is
snapshotted, frozen, and remounted read-only before Cut B verification. It is
never called Product installation.

Node's permission model denies child process/worker and limits filesystem read/
write to declared mounts, but is defense-in-depth only. Acceptance derives
from OCI configuration, independent observations, static closure, runtime
census, and snapshots.

The bounded claim is: no admitted external-network effect, external-process
effect, or out-of-scratch write effect occurred during Product cuts. Docker
`network=none` still leaves loopback. The proof does not claim loopback absent
or claim that prohibited attempts never occurred; it claims they could not
produce an admitted external effect and records any observed refusal.

### 8.3 Observer-owned evidence

An independent host observer, not the candidate, produces for each preparation
and cut:

- an OCI confinement receipt from frozen run configuration and Engine inspect;
- pre/post snapshots of every input mount and every scratch root;
- the complete module resolve/load census;
- process exit/status and exact stdout/stderr byte digests; and
- an exact output inventory with no extra, missing, or overwritten result.

There are no empty self-reported effect counters. Read-only equality comes from
pre/post snapshots and mount receipts. Absent owner/process claims come from the
static graph, lexical module closure, runtime census, and OCI process boundary.

## 9. Proof Identity DAG

### 9.1 Identity rule

Every proof identity uses domain-separated RFC 8785 JCS:

```text
digest_D(x) = sha256(UTF8("abi5-s1/v3/" + D + NUL) + JCS(body_D(x)))
ref_D(x)    = fixed scheme for D + digest hex
```

`body_D` omits that record's own ref/digest. Domain labels are fixed per record
kind. Raw bytes in a JCS body use unpadded base64url paired with digest and
length. No subordinate record contains its enclosing result, run, delivery
receipt, or archive coordinate. No record contains an enclosing archive commit.

### 9.2 Immutable pre-run records

| Record | Exact content | Forbidden content |
|---|---|---|
| `S1CandidateBasis` (`C`) | stable entry; exact candidate commit/tree/package identity; artifact ref/digest/length/integrity; D_root/Q/P/M; manifest locator and contextual publication-owner coordinates | copied root semantic body; host path; PID; observation; run/result/archive |
| `S1CaseLawSet` (`L`) | coordinate-free ordered case ids, mutation algebra, owner boundary, expected phase/refusal law, archive/tree limits, module allowlist law, and evidence requirements | candidate/artifact/basis coordinate; host path/realpath; PID; expected output file; run/result/archive |
| `PurePreimageFalsifierReport` (`F`) | independent actual pure carrier/locator/publication/receipt/selection case inputs/outputs, production module digest, dispositions, and assessor identity | candidate E2E result; host effect claim; run/archive coordinate |
| `ProofBundleManifest` (`G`) | exact inventory of immutable driver, hook, static module graph, tool closure, Cut-A package closure, case inputs, L, and F; sorted path/digest/length rows | itself in its inventory; expected future result/output; PID; installed root; host realpath; observation; census; run/result/archive |
| `ProofRunPlan` | exact C/G/L/tool-closure coordinates, ordered cases, logical mount roles, confinement policy, and output grammar | direct F coordinate; PID; installed package root; host realpath; preparation/host observation; module census; actual output/result; enclosing run/archive |

`S1CaseLawSet` is coordinate-free in the candidate/run sense; its own
domain-separated identity is allowed. `ProofBundleManifest` inventories inputs
only and explicitly excludes its own bytes. Expected dispositions live in L,
not in G and not as pre-authored result files.

Only a structurally valid, coordinate-admitted plan can open a run. A plan
shape/identity failure produces no S1 result or run record. The admitted plan
is frozen before any actual preparation observation or result.

### 9.3 Post-plan observations and enclosure

Actual facts use separate records:

```text
CutAPreparationObservation -> CutAHostObservation
CutBPreparationObservation -> CutBHostObservation
OciConfinementReceipt
InputAndScratchSnapshotPair
ModuleCensus
ExactOutputInventory
S1DevelopmentGateResult
ProofRunRecord(plan, reached observations, result)
```

Preparation records carry actual PIDs, host/container realpaths, mount
identities, and installed-root facts only after those facts exist. Host
observations carry actual census/output/exit facts only after the cut. The
result freezes after the plan and after its last cited observation.
`ProofRunRecord` is created last and wraps the plan, reached observations, and
result; the result never names or encloses the run record.

## 10. Ordered Cuts And Closed Result

### 10.1 Procedure

1. Freeze one clean implementation commit/tree, build once, pack once, and move
   the artifact outside the checkout.
2. An independent assessor freezes C, coordinate-free L, tool closure, static
   module graph, Cut-A package closure, separate F, G, then the run plan in that
   order. No build, pack, basis generation, or expected result occurs in-run.
3. Open the run from the admitted frozen plan, then admit every plan-referenced
   and G-inventoried immutable input, including F. A missing, malformed, or
   crossed input yields `input_refused`.
4. Admit F against L and the exact production module digest. Any failed or
   incomplete pure law yields `pure_falsifier_refused`.
5. Prepare Cut A: validate OCI configuration and prove the read-only Cut-A
   package tree equals the packed regular-file snapshot before target import.
6. Register synchronous hooks, dynamically import only the narrow subpath, call
   `verifyPacked`, and freeze Cut-A host evidence.
7. In a distinct preparation container, perform fresh offline npm extraction
   into empty scratch; observe/freeze it and remount the package root read-only.
8. In a fresh verification container/process, register hooks, import the same
   narrow subpath from the installed root, and call
   `verifyInstalledAndSelect` with the exact Cut-A coordinate pair.
9. Independently compare Cut A/B verification and receipt coordinates, then
   validate the returned selection, census, confinement, snapshots, and exact
   output inventory.
10. Freeze one result variant, then the enclosing run record. Stop.

### 10.2 Exact result union

Every variant has exact common fields:

```text
kind = abi5_s1_development_gate_result
schemaVersion = 5.0.0
subjectKind = s1_development_candidate
plan = exact admitted ProofRunPlan coordinate
rootQualification = not_evaluated
rootObligationEvaluations = 0
advancementAuthorization = none
resultRef/resultDigest = domain-separated identity envelope, excluded from body
```

The closed variants and their only additional evidence are:

| Disposition | Evidence retained |
|---|---|
| `input_refused` | plan plus canonical input attempt and exact input refusal; no admitted C/G/L/F or preparation fact beyond what admission reached |
| `pure_falsifier_refused` | admitted C/G/L, F attempt/report, and exact pure-law refusal; no Cut A fact |
| `cut_a_preparation_refused` | admitted C/G/L/F plus the exact reached prefix of Cut-A preparation observation, confinement receipt, and snapshots; no Cut-A host or Cut-B fact |
| `cut_a_verification_refused` | successful Cut-A preparation plus the exact reached prefix of Cut-A host observation, module census, output inventory, and Product/S1 refusal; no Cut-B fact |
| `cut_b_preparation_refused` | complete Cut-A verification/receipt coordinates plus the exact reached prefix of Cut-B preparation observation, confinement receipt, and snapshots; no Cut-B host fact |
| `cut_b_verification_refused` | successful Cut-B preparation plus the exact reached prefix of Cut-B host observation, module census, output inventory, and Product/S1 refusal |
| `convergence_refused` | both reached cut outputs and the first exact verification/root-receipt coordinate inequality, or the exact packed-expectation/raw-installed-snapshot comparison refusal; no admitted returned selection |
| `returned_evidence_refused` | converged cut coordinates plus the observed but unadmitted return and the exact selection/census/confinement/snapshot/output-inventory refusal |
| `evidence_complete` | C/G/L/F, both preparation and host observations, both confinement receipts/snapshot pairs/censuses/output inventories, equal verification and receipt coordinates, installed snapshot equality, and the admitted selection coordinate |

There are no nullable future fields, optional evidence bags, pass booleans,
`root_satisfied`, or later-phase coordinates. A phase retains only evidence
constructable by then. Each `reached` value is a closed ordinal-prefix variant
for that phase: it requires the terminal refusal and every predecessor record
that completed, and has no field for an unstarted producer. It does not add a
tenth result disposition.

## 11. Falsifiers And Claim Proportionality

| ID | Lane and mutation | Required result/claim |
|---|---|---|
| `E00` | exact C/G/L/F, artifact, Cut-A closure, and fresh Cut-B extraction | `evidence_complete` only |
| `E01` | admitted plan references crossed C/G/L/tool closure, or its G inventory has missing/malformed/crossed F or another immutable input | `input_refused`; no Product import; invalid plan shape/identity creates no run/result |
| `E02` | fixed candidate basis plus one-byte/substituted artifact | `cut_a_verification_refused` with existing `artifact_digest_mismatch`; no inner-validator credit |
| `E03` | Cut-A package mount or module edge crossed; source/private/ambient/governor load attempted | preparation/verification refusal at confinement or census |
| `E04` | Cut-B preparation uses network, scripts, nonempty cache/root, wrong npm/image/Engine coordinate, or unpinned tool | `cut_b_preparation_refused` |
| `E05` | installed root has changed byte, extra/missing path, case collision, symlink, hardlink, device/FIFO, or identity race | `cut_b_verification_refused` before receipt/selection |
| `E06` | crossed Cut-A verification or receipt coordinate | `convergence_refused`; selection not admitted |
| `E07` | returned selection/body/census/snapshot/output inventory crossed or extra | `returned_evidence_refused` |
| `P01` | strict carrier missing/extra/wrong-domain field or noncanonical bytes | independent F records exact shape/canonical refusal |
| `P02` | ABI missing/duplicate/unreferenced-shadow carrier; non-ABI copied locator/carrier | independent F records exact one/zero cardinality refusal |
| `P03` | unsafe/crossed locator or D_root | independent F records locator/digest refusal |
| `P04` | publication absent/ambiguous/wrong owner/wrong P | independent F records exact contextual publication refusal |
| `P05` | caller-forged receipt/preimage/brand or receipt-fed selector call | unconstructable/export absent; independent F records forgery refusal |
| `P06` | static S1 result assigned/admitted as a pre-RC governor subject | static type/shape falsifier fails on literal subject kind; governor is untouched |
| `T01` | separately basis-authorized parser fixture has link/special/duplicate/case/path/PAX/malformed/resource violation | packed-snapshot foundation test refuses; it is not a mutated-candidate inner claim |
| `T02` | observer fixture changes between lstat/open/read/post-stat or aliases inode | raw installed observer refuses; no `ProductInstall` evidence claimed |

Fixed-basis candidate mutations own outer-boundary claims. In particular, E02
proves only the artifact digest boundary. Carrier, locator, publication, and
forgery interiors belong to independent F. F invokes only the production narrow
port over separately frozen artifacts whose recomputed outer coordinates admit
each intended inner mutation; it neither imports a private symbol nor mocks the
preimage. Parser/observer foundation fixtures have their own exact fixture
identities and never masquerade as the accepted candidate. Mock-only/unit
evidence cannot substitute for E00 and the concrete Cut A/B refusal rows.

## 12. FS-18/FS-19/FS-20 Foundation Ledger

| Generic need | Credible candidate | Lifecycle/authority result | Disposition and falsifier |
|---|---|---|---|
| type-aware tar read | system `tar` through child process | host/version drift, process effect, repeated reads, weak typed entry control | reject; OS/tool mutation changes behavior and static graph reaches child process |
| type-aware tar read | local tar/gzip/PAX parser | reproduces mature parsing/security mechanics and carries highest proof/maintenance exit cost | reject under FS-20; corpus/security fixture defeats a partial parser |
| type-aware tar read | exact-bundled `tar@7.5.22` parser-only | maintained typed parser, no extraction/process, exact dependency closure; local code retains Product path/type/cardinality/refusal meaning | select under FS-18/19; FS-20 bounds the local adapter; T01 and dependency census falsify drift |
| installed complete walk | current Boolean `installedProductContentMatches` | loses refusal/evidence detail and is coupled to ProductInstall expectation | retain only legacy projection; E05/T02 falsify use as S1 equality |
| installed complete walk | third-party path walker | adds dependency while not supplying Product containment, `O_NOFOLLOW`, descriptor identity, or expectation meaning | reject; symlink/race/hardlink fixtures |
| installed complete walk | Node descriptor primitives plus minimal Product snapshot/comparators | lowest dependency/startup cost; native identity controls; local remainder is irreducible Product meaning | select under FS-18/20 |
| module closure | async loader, subprocess tracer, V8 counters, or production counters | loader-thread/process complexity or incomplete/self-reported evidence | reject; unobserved edge and prohibited-module fixtures |
| module closure | Node 24.7.0 synchronous `registerHooks` plus static graph | in-thread exact resolve/load evidence; no Product authority; version-frozen | select; census completeness and owner-byte equality falsify drift |
| proof isolation | host conventions or Node permissions alone | ambient mounts/network/process remain underproved | reject; OCI mutation cases |
| proof isolation | pre-frozen OCI/tool closure under exact Docker Engine coordinate, with Node permissions subordinate | higher proof-host setup cost but lowest authority leakage and reproducible confinement; no Product dependency | select under FS-19; E03/E04 falsify configuration drift |
| async composition | new Effect lift/runner or controller | duplicates the existing Promise owner seam and risks runtime authority | reject; static graph/source census |
| async composition | direct fixed Promise methods | exact existing owner contract and minimal S1 surface | select |

The selected new Product dependency is only `tar@7.5.22`; its parser mechanics
replace shell mechanics and are bundled. Node and Docker remain runtime/proof
foundations, not Product semantic owners. Discovery of another generic
subproblem re-enters FS-18 before local construction.

## 13. Governor Exclusion

S1 does not edit, import, call, or test `root-governor.mjs`. It does not add a
governor guard or assert the current governor accepts/refuses S1 correctly.

The static dependency graph and both runtime censuses must show every governor
module absent. P06 proves only that the closed S1 subject/result shapes cannot
inhabit a separately declared `pre_rc_candidate` literal subject shape. That is
negative static evidence, not governor acceptance.

Exact pre-RC subject/evidence admission before R1 allocation and R1-R10
evaluation is mandatory in a later design re-entry. The current governor is not
S1 acceptance evidence.

## 14. Mechanical Implementation Order

This docs candidate changes no implementation, generated file, dependency,
test, version, or ref. After docs acceptance, one implementation subject follows
this order:

| Order | Surface | Required consequence |
|---:|---|---|
| 1 | implementation subject and `package.json` / `package-lock.json` foundation | fresh remote namespace census first; select the least available candidate version without burning it; add exact `tar@7.5.22` plus its exact bundled lock closure before any consumer; reserve only the direct S1 subpath mapping |
| 2 | `contracts/abi5-root-binding.json` | add the sole authored canonical root body; no P/owner tuple |
| 3 | new `code/src/product/packed_product_snapshot.ts` | import only `Parser` from `tar/parse`; construct one bounded parser-only snapshot and existing-refusal mapping; no extraction |
| 4 | `code/src/product/verify_product.ts` | remove system tar and `node:child_process`; consume one snapshot; preserve exact Public contract and all existing semantics |
| 5 | new `code/src/product/abi5_root_binding.ts` | strict shape, canonical relation, ABI one/non-ABI zero classifier, contextual publication selection, opaque preimage, private receipt/selection interiors |
| 6 | new `code/src/product/installed_package_tree_snapshot.ts` | descriptor-based raw walk, typed refusals, S1 expectation/comparison, and separate ProductInstall expectation/comparison |
| 7 | `code/src/product/install_product.ts` | reuse raw observer for the unchanged legacy Boolean only; no S1 mode, ProductInstall expansion, or second verifier |
| 8 | new `code/src/product/s1_root_carrier.ts` | export only the frozen two-method port; keep every interior private |
| 9 | package build and export verification | compile the complete source; prove `./product/s1-root-carrier` maps directly to the built port and broad `.`, `./product`, SDK, CLI, and Public surfaces do not re-export it |
| 10 | `scripts/generate-product-manifest.mjs` and generated Product assets | inventory the final package tree but never author root bytes; construct B -> Q -> P -> M in order; emit one conditional locator/publication binding and regenerate all derived identities |
| 11 | S1 production-unit/falsifier tests | freeze parser, tree, preimage, conditional cardinality, forgery, static-shape, and exact Public-compatibility evidence |
| 12 | external proof bundle and reproduction | freeze the implementation commit, build once and pack once to A, then freeze C/L/F/G/plan, OCI/tool closure, observations, result, run record, and independent verdict |

`code/src/product/index.ts`, Public definitions/schemas/adapters, GTL, HoG, ABG,
replay, SDK/CLI, existing root R1-R10 tests, and every governor file are no-edit
surfaces for S1. `install_product.ts` may retain its existing Product-owned npm
process for later Product installation; only `verify_product.ts` must be free of
child-process reachability before S1 proof.

## 15. Delivery State Machine

### 15.1 Immutable archive identity

All new archive refs use full commit OIDs:

```text
refs/heads/archive/t287-s1-docs-<accepted|rejected>-<full-oid>
refs/heads/archive/t287-s1-dev<N>-<accepted|rejected>-<full-oid>
```

Every archive creation is a compare-and-swap from the all-zero OID to the exact
commit `R`. An existing ref, nonzero old value, force move, deletion, or reuse
refuses.

After verdict, delivery recreates the reviewed subject as commit `R` from the
exact reviewed tree and expected remote-main parent. Canonical
`ArchiveMetadataCore` is the canonical commit-message block of `R`, never a file
in that tree. It binds the reviewed candidate commit and patch digest, subject
kind, verdict, candidate version when applicable, delivery parent/tree,
artifact and proof coordinates when applicable, and governing design/law
coordinates. It contains neither `R`'s own commit OID, archive ref, delivery
receipt, nor remote observation; its domain-separated digest therefore has no
tree or commit cycle. A tree or parent mismatch from the reviewed subject
refuses before `R` is created.

After publication, an external `DeliveryReceipt` binds exact archive ref, full
commit OID, tree, parent, `ArchiveMetadataCore` digest, remote name, expected
and observed remote main OIDs, push transaction identity, and verified remote
containment. It is not included in the archived commit.

### 15.2 Four transitions

For this v3 docs delivery, exact expected remote main `O` is
`326c214c982d527c18d716e1db9637becadd5c71`; any different observation refuses.
An implementation delivery plan later freezes its exact accepted-docs remote
main OID before subject construction.

| Verdict | One lawful remote transition | Main/tag/version effect |
|---|---|---|
| docs accepted | one atomic push: expected remote main `O` -> docs commit `R` by fast-forward, plus accepted archive ZERO -> `R`; verify both remote OIDs | main advances; no Product tag; no version allocation/burn |
| docs rejected | create rejected docs archive ZERO -> `R`; verify remote containment; main expected OID remains unchanged | no main/tag/version effect |
| implementation accepted | after independent reproduction and verdict, one atomic push: expected remote main `O` -> `R` by fast-forward, annotated tag ZERO -> tag object, accepted archive ZERO -> `R`; verify main/tag/archive containment | one version consumed by immutable tag; no partial accepted state |
| implementation rejected | create rejected dev archive ZERO -> `R`; verify remote commit/tree/metadata containment | main/tags unchanged; version burns only after that verified containment |

The delivery plan records exact expected remote main `O` before any local ref
preparation. Local multi-ref preparation also uses explicit old OIDs. Remote
publication uses atomic push and exact leases for main/tag plus ZERO -> `R`
create-only archive. A lease mismatch or atomic-push failure creates no delivered
state. Local preparation alone never advances status or burns a version.

### 15.3 Recorded dev.287 burn

The already verified immutable record is:

```text
ref      refs/heads/archive/t287-s1-dev287-rejected-ebe619d5
commit  ebe619d5023d8d54f90f90b2ccef30086b0f0b96
tree    e313f34e99391321a5b401066b005d5b21a34f30
parent  3014f12571c12f97f85dfe54ca4da28e7dfee3ea
artifact sha256:4519f2e763e50d5903e3c7add2a4b7a658beaec17843f6c7c69bba7e4be773db
Q       sha256:99f703c576c43c474d8e8e998bfac7621cafa556954889d2e8704f0a9c6969d8
M       sha256:163df35269263e240098ca19d0beb548e724888f70ca28acf0dc709a481f62ba
version 5.0.0-dev.287
```

That historical short-suffix ref predates and is not rewritten into the new
full-OID grammar. `dev.288` is only the next numeric floor. A fresh remote tag/
archive namespace census at implementation delivery must prove it available
before allocation.

## 16. Acceptance Boundary

S1 evidence may be complete only when one exact C/G/L/F and plan, one
once-built/once-packed artifact, one confined Cut A, one fresh offline Cut B
preparation, one confined Cut B, exact packed/installed byte equality, equal
verification/receipt coordinates, one admitted lexical selection, and all
independent observer artifacts close under the exact result union.

GOALS owns current WHAT/nonclaims. T-287 owns current order/gates/status. The
design README owns routing and conditional supersession. This file alone owns
S1 HOW after acceptance.
