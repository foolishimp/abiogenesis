# T-287 - Deliver ABIogenesis 5.0 Feature Waves

- id: T-287
- type: feature
- ticket_category: implementation_migration
- status: active
- goal: GOAL-035
- priority: critical
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- change_intent: implement_s1_root_artifact_carrier_development_gate
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/design/T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN.md
- retriaged_at: 2026-08-23
- migration_strategy: inside_out_hard_break
- selected_method: STDO v2.2.2
- governing_library: effect@3.22.1
- immutable_reference_product: v4.6.0-rc.5
- selected_wave: W2
- selected_feature: A5-F01
- selected_slice: ST-S01-ROOT
- selected_increment: S1
- selected_increment_stage: i1_i2_parallel_selected
- stable_entry_tag: v5.0.0-dev.286
- stable_entry_commit: 3014f12571c12f97f85dfe54ca4da28e7dfee3ea
- stable_entry_tree: a399045de5d752b92c084b5b38b358aa2d1c63aa
- docs_candidate_base: 326c214c982d527c18d716e1db9637becadd5c71
- docs_candidate_base_tree: 518d37bda358f85e07ed263293909285694b5cac
- accepted_design_commit: 701f6c018257d271465860ecb097b44381d614d0
- accepted_design_tree: e7de434638c6b669ba935bbaaf69193ad4999922
- accepted_design_archive: archive/t287-s1-docs-accepted-701f6c018257d271465860ecb097b44381d614d0
- implementation_selection_basis_commit: bc3a9377b926f6d1f01c681571b6e2cb740e967c
- implementation_selection_basis_tree: 12f8067ca616c139cf17829bb0e91a5aeadf09db
- next_implementation_version_floor: 5.0.0-dev.288
- next_implementation_version_status: selected_unburned_after_remote_census_2026-08-23
- dependency_foundation_candidate: bb1219397283b35fd1154a035acf6e7c2eb83179
- dependency_foundation_tree: 418baba396dfd2e991cc2bfc1dfc52f0b2109939
- dependency_foundation_lock_sha256: 408e19fd723ecd5bc8bfe1a9832fc98e4872fa98aef324eed4eb66853f40d890
- deferred_feature: A5-F12

## Outcome

Deliver the fixed ABIogenesis 5.0 Product through five installed feature waves.
The current selection is the non-closing `ST-S01-ROOT/S1` development gate for
Wave 2 / `A5-F01`.

S1 must prove and independently reproduce one exact prebuilt
`s1_development_candidate` relation: the packed ABI Product has exactly one
canonical Product-owned root definition and matching owner publication; every
non-ABI Product has zero such definitions; unchanged Product verification
accepts the exact packed bytes; a fresh offline package extraction has the same
complete bytes; and Product issues one private-preimage-fed lexical declaration
selection before runtime.

Product and requirements define WHAT. The accepted TypeScript design defines
HOW. This ticket owns selection, order, gates, status, and nonclosure only.

## Current Product Frame

```text
Product:
  fixed ABIogenesis 5.0, A5-F01..F11 and A5-F13..F17

Selection:
  Wave 2 / A5-F01 / ST-S01-ROOT / S1 only

Subject:
  one externally frozen s1_development_candidate

S1 claim:
  exact packed Product/root/publication verification
  + exact ABI-one/non-ABI-zero carrier cardinality
  + byte-equal fresh offline extraction
  + private preimage/receipt convergence
  + one lexical root declaration selection

S1 stop:
  before Product resolve/install, ProductInstall, Workspace, Catalog/View,
  Program/GF/contracts/Validation, GTL materialization, ExecutionBasis, HoG,
  owner invocation, ABG, replay, SDK/CLI, or governor evaluation

Unselected and unclaimed:
  S2-S4; constitutional R1-R10; every Product scenario; complete one-family
  closure; pre-RC qualification; RC; final tap; release

Prohibited:
  duplicate/generated root truth; root publicationDigest or artifact-owner
  tuple; caller/transported/persisted receipt; Public expansion; broad eager
  Product re-export; source/private/ambient fallback; rival verifier, install,
  selector, controller, registry, Catalog, event writer/store, or runtime
```

R5 remains Program selection/admission, R6 GraphFunction and contract
resolution, R7 materialized GTL validation, R8 HoG entry, R9 ABG result and
closure, and R10 replay/CLI equality. S1 does not move or satisfy them.

## Re-entry Disposition

The accepted design re-entry was `design_reframe`. The selected implementation
re-entry is `realization_refactor` only:

- Intent, Product, requirements, feature membership, scenarios, root table,
  R1-R10 predicate, and release subjects do not change.
- The Wave 2 / `A5-F01` exit does not change.
- Design selects the smallest artifact-to-declaration-selection seam and its
  proportional development proof.
- Any need to change Product meaning, a requirement, an exact Public operation-
  family request/result/refusal schema, an owner, runtime event law,
  obligation, or release subject stops this increment and returns to the owning
  re-entry.

## Governing Order

1. `specification/GOALS.md`
2. `specification/INTENT.md`
3. `specification/PRODUCT.md`
4. applicable `specification/requirements/`
5. accepted design indexed by
   `build_tenants/abiogenesis/typescript/design/README.md`
6. `build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md`
7. this ticket

The accepted S1 v4 HOW is
`build_tenants/abiogenesis/typescript/design/T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN.md`.
Its exact four-document subject was independently accepted at `701f6c018257`
and delivered with accepted archive `9fddfc815253`. The rejected docs commits
`6720c0d92647861d281a40cb3129b5ecc82af86d`,
`87d369d3c04be07a7c3a46b25f0a3324bd68e020`, and
`1e1e61af8fa185784d093be05a67942df32dc441`, and
`0d3c869f20a9defc48876de6e9a9c9ac839355a9` are evidence only. They are not
ancestors of this replacement and may not be cherry-picked wholesale.

## Ordered Work And Gates

| Order | Work/gate | Exit | Current state |
|---:|---|---|---|
| `S1-D0` | Replace the S1 design from exact stable main commit/tree. | Exactly four documentation paths state one consistent Product frame, ordered proof, technology choice, falsifiers, file order, and delivery law. | Complete at accepted design `701f6c018257` |
| `S1-D1` | Freeze mechanical docs evidence. | Exact scope, diff check, stale/prohibited scans, base ancestry, rejected-candidate non-ancestry, clean detached status, commit/tree/parent, patch hash, and four file hashes. | Complete; exact accepted subject frozen |
| `S1-D2` | Independent design review. | No unresolved authority drift, circular identity, unconstructable result field, hidden effect, ambient dependency, evidence overclaim, delivery ambiguity, or stale current status. | Complete; three independent Max frames accepted |
| `S1-D3` | Docs verdict and delivery. | Candidate `C` remains the reviewed commit; accepted docs atomically fast-forward main to `C` and create distinct accepted archive commit `R_a`, while rejected docs create only `R_a`. Archive metadata and full-`C` ref suffix bind `C`. No Product tag or version effect. | Complete; `C=701f6c018257`, `R_a=9fddfc815253` |
| `S1-I0` | Re-census remote version/ref namespace and allocate one implementation subject from accepted docs. | Exact remote main/ref/tag basis and least lawful development version are frozen. `dev.288` is only a floor until this census. | Complete 2026-08-23; remote main `bc3a9377b926`, `dev.288` available and selected but unburned |
| `S1-I1` | Replace shell archive reads and construct the sole packed carrier relation. | One in-process type-aware packed snapshot; exact ABI-one/non-ABI-zero carrier law; unchanged Public verification; narrow carrier subpath only. | Active from exact dependency foundation `bb1219397283`; packed/verifier lane |
| `S1-I2` | Construct raw installed-tree observation and lexical selection. | Fresh offline extraction is proof-host preparation; descriptor-based complete walk and S1-specific comparison converge with packed verification; no Product install or runtime. | Selected; parallel installed/carrier lane with fixed private handshake to I1 |
| `S1-I3` | Freeze independent proof inputs, run plan, pure falsifier report, and confined Cut A/B observations. | Exact immutable identity DAG, OCI receipt, pre/post snapshots, static/load closure, output inventory, closed result, and no evidence beyond the reached phase. | Pending accepted I1+I2 integration and required capsule gates |
| `S1-I4` | Independent implementation reproduction and verdict. | Exact case law reproduces. Accepted delivery atomically advances main to `C`, annotated `T_ref` to tag object `T(C)`, and archive to distinct `R_a`; rejected delivery archives only, and burns the version only after verified remote containment. | Unselected until I3 |

No gate borrows a later gate's evidence. A docs verdict does not allocate a
Product version. An implementation verdict does not select S2.

## S1 Acceptance Gates

| Gate | Required evidence | Immediate refusal |
|---|---|---|
| Authority | one authored `contracts/abi5-root-binding.json`; existing `productRelativeLocators` conditionally contains that fixed path; D_root derives from located bytes; acyclic root -> Product-content -> publication -> manifest -> artifact relation; exact ABI one/non-ABI zero including shadows | new manifest field/schema, generated second body, self-owned publication digest/owner tuple, or alternate selector |
| Package seam | only `./product/s1-root-carrier`, mapped directly to a module exporting only `ABI5_S1_ROOT_CARRIER_PORT` with fixed Promise methods; exact internal `RefDigest`, `S1CarrierRefusal`, and `Abi5S1RootSelection` declarations; one exhaustive refusal-to-result mapping | broad `./product` re-export, new Public operation, open/optional declaration shape, rival mapping, or exported receipt/preimage/observer/selector interior |
| Packed verification | exact-bundled `tar@7.5.22` parser-only snapshot; link/type/path/PAX/duplicate/case/resource refusal; existing Product result/refusals unchanged | system `tar`, `node:child_process` in `verify_product.ts`, extraction, or second verifier |
| Installed observation | raw descriptor-based complete walk plus S1 packed expectation/comparison | symlink/hardlink/special/extra/missing/race acceptance, ProductInstall expansion, or legacy Boolean treated as S1 equality evidence |
| Load closure | Node `24.7.0` synchronous in-thread module census over one narrow self export, the frozen exact internal/dependency graph, exact relative `../../../toolchain/typescript.cjs` from `declaration_exports.ts`, and exact builtins | unexpected relative edge outside that frozen graph; source/private/ambient/global/absolute/data/network/native/Wasm/unobserved load; or governor module reachability |
| Confinement | pre-frozen platform OCI/tool closure and exact Docker Engine coordinate; offline, read-only verification mounts, scratch-only writes, caps dropped, no-new-privileges, network none | host/source mount, mutable input, unpinned tool, shell entry, or self-reported effect counter |
| Evidence | domain-separated acyclic records, coordinate-free case law, plan-before-results, independent observer artifacts, separate pure falsifier report | circular record, expected future result in bundle, observation in plan, result enclosing its run, or evidence not yet available |
| Result | exact closed phase union and sole carrier-refusal mapping; packed/installed or local snapshot failure is Cut B only, while convergence requires independently successful coordinate-bearing Cut A/B outputs; every member fixes `rootQualification: not_evaluated`, `rootObligationEvaluations: 0`, and `advancementAuthorization: none` | local Cut-B refusal mapped to convergence, optional evidence soup, root/scenario credit, or later-stage selection |
| Governor | governor source absent from static/runtime closure; static S1-vs-pre-RC shape falsifier only | edit/import/call/test of `root-governor.mjs` or claim that current governor is S1 acceptance |
| Delivery | exact four-state CAS/lease transition: reviewed/proved `C`, distinct metadata archive commit `R_a`, archive suffix full `C`, annotated `T_ref -> T(C)` only on implementation acceptance, immutable delivery receipt, and verified remote containment | archive targeting/suffixed by the wrong OID, main advancing to `R_a`, moved/deleted archive, non-atomic accepted publication, docs tag/version effect, or unverified burn |

## Mandatory Review Preamble

Every S1 handoff and review begins with:

```text
Product: fixed ABIogenesis 5.0, A5-F01..F11 and A5-F13..F17
Selection: Wave 2 / A5-F01 / ST-S01-ROOT / S1 only
Status: v4 design accepted; I0 complete; I1/I2 selected; no implementation
  candidate frozen
Subject: one externally frozen s1_development_candidate
Claim: packed Product/root/publication verification, fresh extracted-byte
  reproduction, private convergence, and lexical declaration selection only
Runtime: none; R1-R10 all not evaluated
Unselected: S2-S4, scenarios, pre-RC qualification, RC, tap, release
Reference: accepted T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN.md owns HOW
```

## Deferred Assurance Register

These are assurance obligations, not selected Product outcomes, implementation
lanes, or authority to cross S1's stop.

| ID | Frame | Present evidence / counterexample | Why it does not block this docs freeze | Re-entry and trigger | Dependent boundary | Closure falsifier | Owner / status |
|---|---|---|---|---|---|---|---|
| `C-S1-CASES-01` | S1 case aggregation | E/P/T laws are defined; no one-subject aggregate exists | a docs candidate creates no S1 verdict | `realization_refactor` when K/L/F/G and concrete cases freeze | mandatory before `S1-I4` verdict | absent, crossed, or incomplete aggregate makes any S1 verdict invalid | independent assessor / deferred-required |
| `C-S1-FS-RACE-001` | T02 descriptor race | T02 names lstat/open/read/post-stat and inode-alias mutations; no executable fixture exists | raw observation is not implemented | `realization_refactor` when the installed observer freezes | Cut B raw snapshot | any T02 race or alias reaches successful Cut-B coordinates | Product proof owner plus independent assessor / deferred |
| `C-S1-TAR-GZIP-001` | T01 gzip/tar grammar | T01 names compression, type, path, metadata, and bound mutations; no executable corpus exists | parser foundation is not implemented | `realization_refactor` when the parser adapter freezes | Cut A packed snapshot | alternate/malformed gzip, dangling/ambiguous metadata, or a bound breach is admitted | Product proof owner plus independent assessor / deferred |
| `C-S1-CUTA-PACKED-001` | Cut A/B carrier convergence | `SuccessfulCutACoordinates` carries `packedSnapshotCoordinate`, while the accepted convergence relation compares the verification/root-receipt pair | the accepted design remains constructable and no S1 proof has run; the relation must close before the first E00 discriminator | `realization_refactor` at the I1/I2 carrier handshake | Cut A handoff, target import, and E00 | Cut B or E00 succeeds when a valid Cut-A verification/receipt pair is crossed with a different packed snapshot coordinate | Product proof owner plus independent assessor / activated-required-before-E00 |
| `D-S1-PERM-001` | proof permission argv | OCI and Node-permission policy is selected; exact platform argv is not frozen | no ProofRunPlan or confinement claim exists | `realization_refactor` at exact tool-closure/driver freeze; `design_reframe` if policy changes | ProofRunPlan and confinement receipt | extra loader, mount, env, permission, process, network, or writable path survives argv admission | proof owner plus independent assessor / deferred |
| `D-S1-FS19-TAR-001` | FS-19 dependency/advisory | exact subject `bb1219397283` freezes the six-node bundled `tar@7.5.22` lock closure; subject-bound audit/advisory evidence is recorded below | no unresolved applicable advisory remains for the exact lock; any lock or advisory change reactivates the capsule | `realization_refactor` on lock/advisory change; `design_reframe` if the selected foundation changes | dependency admission before parser consumption | wrong/unbundled closure, unresolved provenance, or undisposed applicable advisory is accepted | Product dependency owner plus independent assessor / closed-for-parser-consumption 2026-08-23 |
| `C-R1-GOVERNOR-001` | later R1 admission | P06 is static shape evidence; governor modules are excluded from S1 | S1 evaluates zero root obligations and cannot reach R1 | later `design_reframe` when exact `pre_rc_candidate` admission is selected | R1 before any R1-R10 evaluation | S1 evidence is admitted as R1, or pre-RC subject/evidence admission remains unspecified | root/governor owner plus independent assessor / deferred-later |

### D-S1-FS19-TAR-001 Closure Evidence

The dependency foundation is exact commit
`bb1219397283b35fd1154a035acf6e7c2eb83179`, tree
`418baba396dfd2e991cc2bfc1dfc52f0b2109939`, parent accepted implementation
basis `ea970995c1bc820e529ffb89e0e231193dcbfa3b`. Its only changed paths are
`package.json` and `package-lock.json`; the SHA-256 of the exact
`git diff --binary --full-index ea970995..bb121939` byte serialization is
`8129e81e0df4eba141c899ce946e54f390e198b52f6ace583388d18e951b07cb`.

The exact lock SHA-256 is
`408e19fd723ecd5bc8bfe1a9832fc98e4872fa98aef324eed4eb66853f40d890`.
It resolves and bundles exactly `tar@7.5.22`,
`@isaacs/fs-minipass@4.0.1`, `chownr@3.0.0`, `minipass@7.1.3`,
`minizlib@3.1.0`, and `yallist@5.0.0`; every row has a registry URL, SRI,
license, engine constraint, and `inBundle: true`. The selected tarball has SRI
`sha512-MFO/QzvtAOmJbkhOaCTvbGcFN9L9b+JunIsDwaKljSOdcLMea3NJ1k9Usz/rjdfSXTq4dfzfeS7W4p4YOAAHeA==`
and SHA-1 `a696f998136e71487dc3f869a85bba2c67971ba9`.

From that exact clean detached subject at `2026-08-23T11:44:25Z`, under Node
`v24.7.0`, npm `11.5.1`, and registry `https://registry.npmjs.org/`, `npm ci
--ignore-scripts` and exact production `npm ls` succeeded; repeated lock
generation was byte-identical. Raw `npm audit --omit=dev --json` and full
`npm audit --json` outputs both have SHA-256
`cd50748f6f59db77d7523db926186840a9f25b5fc051ec7531c5b74af1bf3f65`
and report zero vulnerabilities at every severity. The exact production
closure `npm ls` JSON has SHA-256
`4d92346c0f48c64c70580584910c7c636b6ee2bc200a37b132dc2210e45bb9ef`;
the explicit six-package `npm ls ... --all --omit=dev` output has SHA-256
`2a479bc1a3b24add3ad6d5a9c3aa10bbb030071883e72d9dbf97ba297ac01d98`.
The exact registry metadata output has SHA-256
`e398a27040345962b81b9432a084a998539d38e5ed96a9bb5a5110f010f6503f`.
The current GitHub-reviewed `tar` advisory `GHSA-r292-9mhp-454m` affects
versions through `7.5.20` and is patched in `7.5.21`; selected `7.5.22` is
outside that range. This closes dependency consumption only. It grants no
parser, Product candidate, S1 proof, version burn, or delivery acceptance, and
reactivates before proof freeze if the lock, registry integrity, closure, or
applicable advisory census changes.

## Delivery Evidence Already Fixed

`v5.0.0-dev.287` is already burned by verified remote archive containment:

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

That immutable legacy ref predates the new full-OID archive grammar and is not
renamed. The 2026-08-23 I0 census selected `5.0.0-dev.288` as the exact
unburned implementation version. Any remote namespace change affecting that
allocation before delivery reopens I0.

## Feature-Wave Backlog And Status

| Wave | Feature families | State |
|---:|---|---|
| W1 | `A5-F10`, `A5-F02`, `A5-F03`, `A5-F04` | Accepted functional substrate; later integrated qualification remains |
| W2 | `A5-F01`, `A5-F09`, `A5-F05`, `A5-F06`, bounded early `A5-F17` | Active; accepted S1 v4 design with I1/I2 implementation selected |
| W3 | `A5-F14`, `A5-F07`, `A5-F08` | Pending W2 |
| W4 | `A5-F13`, `A5-F17`, `A5-F11` | Pending W3 |
| W5 | `A5-F15`, `A5-F16` | Pending W4 |

Current durable status is accepted S1 v4 design plus the reviewed repo-local
execution axiom and implementation activation at exact remote main
`ea970995c1bc`. I0 selected unburned
`5.0.0-dev.288`; I1/I2 implementation is active. No S1 implementation
candidate, artifact, run plan, development-gate result, Product tag, root
result, scenario result, or release truth exists yet.
