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
- change_intent: select_s1_root_artifact_carrier_development_gate
- change_class: design_reframe
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
- selected_increment_stage: v4_docs_candidate_locally_frozen_unaccepted
- stable_entry_tag: v5.0.0-dev.286
- stable_entry_commit: 3014f12571c12f97f85dfe54ca4da28e7dfee3ea
- stable_entry_tree: a399045de5d752b92c084b5b38b358aa2d1c63aa
- docs_candidate_base: 326c214c982d527c18d716e1db9637becadd5c71
- docs_candidate_base_tree: 518d37bda358f85e07ed263293909285694b5cac
- next_implementation_version_floor: 5.0.0-dev.288
- next_implementation_version_status: unavailable_until_fresh_delivery_namespace_census
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

The re-entry is `design_reframe` only:

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

The complete S1 v4 HOW candidate is
`build_tenants/abiogenesis/typescript/design/T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN.md`.
It becomes implementation authority only after the exact four-document subject
is independently accepted and delivered. The rejected docs commits
`6720c0d92647861d281a40cb3129b5ecc82af86d`,
`87d369d3c04be07a7c3a46b25f0a3324bd68e020`, and
`1e1e61af8fa185784d093be05a67942df32dc441`, and
`0d3c869f20a9defc48876de6e9a9c9ac839355a9` are evidence only. They are not
ancestors of this replacement and may not be cherry-picked wholesale.

## Ordered Work And Gates

| Order | Work/gate | Exit | Current state |
|---:|---|---|---|
| `S1-D0` | Replace the S1 design from exact stable main commit/tree. | Exactly four documentation paths state one consistent Product frame, ordered proof, technology choice, falsifiers, file order, and delivery law. | Complete in the locally frozen v4 subject; unaccepted |
| `S1-D1` | Freeze mechanical docs evidence. | Exact scope, diff check, stale/prohibited scans, base ancestry, rejected-candidate non-ancestry, clean detached status, commit/tree/parent, patch hash, and four file hashes. | Complete in the external freeze handoff; unaccepted |
| `S1-D2` | Independent design review. | No unresolved authority drift, circular identity, unconstructable result field, hidden effect, ambient dependency, evidence overclaim, delivery ambiguity, or stale current status. | Pending D1 |
| `S1-D3` | Docs verdict and delivery. | Candidate `C` remains the reviewed commit; accepted docs atomically fast-forward main to `C` and create distinct accepted archive commit `R_a`, while rejected docs create only `R_a`. Archive metadata and full-`C` ref suffix bind `C`. No Product tag or version effect. | Pending D2 |
| `S1-I0` | Re-census remote version/ref namespace and allocate one implementation subject from accepted docs. | Exact remote main/ref/tag basis and least lawful development version are frozen. `dev.288` is only a floor until this census. | Unselected until docs acceptance |
| `S1-I1` | Replace shell archive reads and construct the sole packed carrier relation. | One in-process type-aware packed snapshot; exact ABI-one/non-ABI-zero carrier law; unchanged Public verification; narrow carrier subpath only. | Unselected until I0 |
| `S1-I2` | Construct raw installed-tree observation and lexical selection. | Fresh offline extraction is proof-host preparation; descriptor-based complete walk and S1-specific comparison converge with packed verification; no Product install or runtime. | Unselected until I1 |
| `S1-I3` | Freeze independent proof inputs, run plan, pure falsifier report, and confined Cut A/B observations. | Exact immutable identity DAG, OCI receipt, pre/post snapshots, static/load closure, output inventory, closed result, and no evidence beyond the reached phase. | Unselected until I2 |
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
Status: v4 docs candidate only; unaccepted; no implementation selected
Subject: one externally frozen s1_development_candidate
Claim: packed Product/root/publication verification, fresh extracted-byte
  reproduction, private convergence, and lexical declaration selection only
Runtime: none; R1-R10 all not evaluated
Unselected: S2-S4, scenarios, pre-RC qualification, RC, tap, release
Reference: T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN.md owns HOW after docs acceptance
```

## Deferred Assurance Register

These are assurance obligations, not selected Product outcomes, implementation
lanes, or authority to cross S1's stop.

| ID | Frame | Present evidence / counterexample | Why it does not block this docs freeze | Re-entry and trigger | Dependent boundary | Closure falsifier | Owner / status |
|---|---|---|---|---|---|---|---|
| `C-S1-CASES-01` | S1 case aggregation | E/P/T laws are defined; no one-subject aggregate exists | a docs candidate creates no S1 verdict | `realization_refactor` when K/L/F/G and concrete cases freeze | mandatory before `S1-I4` verdict | absent, crossed, or incomplete aggregate makes any S1 verdict invalid | independent assessor / deferred-required |
| `C-S1-FS-RACE-001` | T02 descriptor race | T02 names lstat/open/read/post-stat and inode-alias mutations; no executable fixture exists | raw observation is not implemented | `realization_refactor` when the installed observer freezes | Cut B raw snapshot | any T02 race or alias reaches successful Cut-B coordinates | Product proof owner plus independent assessor / deferred |
| `C-S1-TAR-GZIP-001` | T01 gzip/tar grammar | T01 names compression, type, path, metadata, and bound mutations; no executable corpus exists | parser foundation is not implemented | `realization_refactor` when the parser adapter freezes | Cut A packed snapshot | alternate/malformed gzip, dangling/ambiguous metadata, or a bound breach is admitted | Product proof owner plus independent assessor / deferred |
| `D-S1-PERM-001` | proof permission argv | OCI and Node-permission policy is selected; exact platform argv is not frozen | no ProofRunPlan or confinement claim exists | `realization_refactor` at exact tool-closure/driver freeze; `design_reframe` if policy changes | ProofRunPlan and confinement receipt | extra loader, mount, env, permission, process, network, or writable path survives argv admission | proof owner plus independent assessor / deferred |
| `D-S1-FS19-TAR-001` | FS-19 dependency/advisory | exact `tar@7.5.22` is selected; lock, bundled closure, provenance, and advisory disposition do not yet exist | docs add no dependency | `realization_refactor` when the dependency/lock subject freezes; `design_reframe` if selection changes | dependency admission before parser consumption | wrong/unbundled closure, unresolved provenance, or undisposed applicable advisory is accepted | Product dependency owner plus independent assessor / deferred |
| `C-R1-GOVERNOR-001` | later R1 admission | P06 is static shape evidence; governor modules are excluded from S1 | S1 evaluates zero root obligations and cannot reach R1 | later `design_reframe` when exact `pre_rc_candidate` admission is selected | R1 before any R1-R10 evaluation | S1 evidence is admitted as R1, or pre-RC subject/evidence admission remains unspecified | root/governor owner plus independent assessor / deferred-later |

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
renamed. `5.0.0-dev.288` is the next numeric floor, not a present allocation;
availability requires a fresh namespace census at implementation delivery.

## Feature-Wave Backlog And Status

| Wave | Feature families | State |
|---:|---|---|
| W1 | `A5-F10`, `A5-F02`, `A5-F03`, `A5-F04` | Accepted functional substrate; later integrated qualification remains |
| W2 | `A5-F01`, `A5-F09`, `A5-F05`, `A5-F06`, bounded early `A5-F17` | Active; only S1 v4 docs candidate selected |
| W3 | `A5-F14`, `A5-F07`, `A5-F08` | Pending W2 |
| W4 | `A5-F13`, `A5-F17`, `A5-F11` | Pending W3 |
| W5 | `A5-F15`, `A5-F16` | Pending W4 |

Current durable status is the exact stable base only. This v4 docs subject is
unaccepted and creates no S1 implementation, artifact, run plan, development-
gate result, Product tag, root result, scenario result, or release truth.
