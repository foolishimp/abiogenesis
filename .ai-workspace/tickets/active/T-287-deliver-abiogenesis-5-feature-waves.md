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
- dependency_foundation_closure_commit: ece6597ed8846323ccab3d9a5736ecfa03f74bb3
- dependency_foundation_closure_tree: 31c9557db076ce5348184f10c9e4c8fb4d9ec92d
- carrier_amendment_basis_commit: ece6597ed8846323ccab3d9a5736ecfa03f74bb3
- carrier_amendment_basis_tree: 31c9557db076ce5348184f10c9e4c8fb4d9ec92d
- accepted_carrier_amendment_commit: 9bb230efaa5a1db06c7932a1204a5d477ead5e0f
- accepted_carrier_amendment_tree: 3ad891ec8d105edc00ebb0a088a57732e7901172
- carrier_amendment_authority_status: accepted_delivered_on_main_2026-08-23
- cut_a_convergence_capsule_disposition: closed_for_adapter_implementation
- deferred_feature: A5-F12
- proposed_goal_reprice: wave_2_odd_glc_typed_workspace_admission
- proposed_change_class: goal_reprice
- proposed_re_entry_point: specification/GOALS.md#proposed-wave-2-goal-reprice
- proposed_design_change_class: design_reframe
- proposed_design_re_entry_point: build_tenants/abiogenesis/typescript/design/T287_W2_ODD_GLC_TYPED_WORKSPACE_ADMISSION_DESIGN.md
- proposed_design_status: proposed_unratified_unselected_non_executable

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

## Proposed Wave 2 Retarget

Executive direction reprices the next bounded Wave 2 design around ABI's
generic URI-binding admission engine as consumed by an independent odd_glc
Product. The proposal does not replace the accepted S1 selection until an exact
independent goal-reprice/roadmap verdict and status child admit design work.
That verdict does not ratify the open R2/R3 design or select implementation.

The target relation is:

```text
GTL type algebra
  -> types instantiated at one independent downstream Product boundary
  -> named or hierarchical downstream frame/overlay composition
  -> ABI URI-binding admission over an unknown URI set
  -> replay-visible typed URI bindings
  -> those typed bindings carried through one graph-declared lifecycle
```

ABI owns generic handle/owner resolution, binding admission, direct HoG
traversal, ABG runtime truth, and replay. ABIogenesis Product's embedded
GTL.TypeScript language authority owns type law. The bounded ABI acceptance
fixture owns neutral type instances for the same contract class; it may not
instantiate or copy odd_glc types. Only the downstream E1 proof uses `A/B/C`
instantiated at odd_glc, whose Product owns frame composition, lifecycle
relations, and interpretation. A specialization owns domain schemas,
instructions, policies, evaluators, and rubrics. No new ABI `ReferenceFrame`,
data-mapper branch, type registry, controller, or imperative stage runner is
permitted.

The proposal's exact 56-definition force rank is `18` direct-required, `8`
transitive-required, `15` negative-only, and `15` out-of-scope. None of the
exact 17 dev.286 absent locators is direct or transitive for the selected
thread. The family remains fixed constitutional structure, not an
implementation quota.

The two first confirmed ABI design gaps are:

1. non-circular authority for pre-binding create/open/verify/resolve/install/
   bind and the subsequent Catalog/application/conformance calls; and
2. generic declaration/schema-driven construction of the exact authority
   inputs for `catalog.apply#node_type` and `catalog.apply#overlay` when the
   downstream Product contains no executable semantics provider.

GraphFunction resolution, URI-shaped Catalog handles, `DeclarationApplication`,
typed C handoff, and ABG replay already exist. They remain unproved at the full
multi-owner odd_glc scale; their existence must not be mislabeled as closure,
and the missing full-scale proof must not be mislabeled as an absent subsystem.

The proposed ordered design work is:

| Order | Gate | Exit | State |
|---:|---|---|---|
| `W2-R0` | Product/use-case conservation | Exact ABI authority and external odd_glc discriminator; no ABI release dependency or frame entity | Proposed complete; review pending |
| `W2-R1` | 18/56 force rank | Every row classified with installed status, owner, selected edge/negative, and disposition | Proposed complete; review pending |
| `W2-R2` | Typed workspace admission design | Exact pre-binding authority, URI-binding admission, Catalog/View, node-type/overlay application, Program conformance, and owner closure | Proposed; confirmed gaps open |
| `W2-R3` | Functional traversal design | One-start graph topology and exact carried-binding/effect/evidence/continuation/result/replay network with imperative falsifiers | Proposed; unselected |
| `W2-R4` | Implementation selection | Independent review accepts one exact minimal generic module/test map | Unselected |
| `W2-P0` | S1 evidence-DAG prerequisite | Exact large candidate can be enclosed and reproduced without multiplied inline bytes or hidden authority | Separate proposed design; no runtime claim |
| `W2-I0` | Admission-foundation realization | Accepted pre-binding authority and generic declaration-application gaps work source-blind and stop before start; no URI-typing traversal claim | Unselected |
| `W2-I1` | URI-binding and traversal realization | Bounded independent flavored fixture applies its own neutral GTL-defined type instances and reaches terminal result plus fresh replay through one start | Unselected |
| `W2-E0` | ABI candidate proof | Affected scenarios and negatives close on one exact candidate | Unselected |
| `W2-E1` | Real odd_glc proof | Full downstream data-mapper thread closes without ABI/odd_glc imperative lifecycle code | Downstream evidence only |

The real odd_glc/data-mapper subject force-ranks and later falsifies the generic
contract class. It is not an ABIogenesis source, build, qualification, or
release dependency. ABI's owning `A5-F17`/`ABG5-S06` gate remains a bounded
independent flavored fixture.

Until the proposal is independently accepted, the existing S1 metadata and
selection below remain historical-current authority. No proposal wording may
be cited to implement R2/R3, allocate a version, run E00, or claim progress.
Roadmap acceptance selects only decision-complete R2/R3 design work; those
relations remain unratified and implementation remains unselected.

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
- The bounded Cut-A convergence amendment retains the complete successful Cut-A
  output at the driver and projects only its verification/root-receipt pair into
  Cut B. Packed-snapshot coordinates remain outer evidence, not a Cut-B input.
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

The accepted S1 v4 HOW basis is
`build_tenants/abiogenesis/typescript/design/T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN.md`.
Its exact four-document subject was independently accepted at `701f6c018257`
and delivered with accepted archive `9fddfc815253`. Its bounded internal
two-coordinate carrier amendment was authored from dependency-closure delivery
basis `ece6597ed8846323`, independently accepted, and delivered at exact commit
`9bb230efaa5a1db06c7932a1204a5d477ead5e0f`. It is now part of the accepted HOW.
The rejected docs commits
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
| `S1-I0` | Re-census remote version/ref namespace and allocate one implementation subject from accepted docs. | Exact remote main/ref/tag basis and least lawful development version are frozen. `dev.288` is only a floor until this census. | Complete 2026-08-23; census and implementation-selection basis `bc3a9377b926`, `dev.288` available and selected but unburned |
| `S1-I1` | Replace shell archive reads and construct the sole packed carrier relation. | One in-process type-aware packed snapshot; exact ABI-one/non-ABI-zero carrier law; unchanged Public verification; narrow carrier subpath only. | Exact Lane P `3ac5f44e7c53` independently accepted; pending integration. It enables the E00 discriminator without closing the later T01 assurance corpus |
| `S1-I2` | Construct raw installed-tree observation and lexical selection. | Fresh offline extraction is proof-host preparation; descriptor-based complete walk and S1-specific comparison converge with packed verification; no Product install or runtime. | Exact Lane O `45fd35b583ca` frozen under independent review; the carrier adapter uses only the accepted fixed two-coordinate Cut-A projection; T02 assurance remains open before verdict |
| `S1-I3` | Freeze independent proof inputs, run plan, pure falsifier report, and confined Cut A/B observations. | Exact immutable identity DAG, OCI receipt, pre/post snapshots, static/load closure, output inventory, closed result, and no evidence beyond the reached phase. | Pending accepted I1+I2 integration; E00 follows focused Lane P plus the fixed I2 handshake, while activated assurance gates remain mandatory before I4 verdict |
| `S1-I4` | Independent implementation reproduction and verdict. | Exact case law reproduces. Accepted delivery atomically advances main to `C`, annotated `T_ref` to tag object `T(C)`, and archive to distinct `R_a`; rejected delivery archives only, and burns the version only after verified remote containment. | Unselected until I3 |

No gate borrows a later gate's evidence. A docs verdict does not allocate a
Product version. An implementation verdict does not select S2.

## S1 Acceptance Gates

| Gate | Required evidence | Immediate refusal |
|---|---|---|
| Authority | one authored `contracts/abi5-root-binding.json`; existing `productRelativeLocators` conditionally contains that fixed path; D_root derives from located bytes; acyclic root -> Product-content -> publication -> manifest -> artifact relation; exact ABI one/non-ABI zero including shadows | new manifest field/schema, generated second body, self-owned publication digest/owner tuple, or alternate selector |
| Package seam | only `./product/s1-root-carrier`, mapped directly to a module exporting only `ABI5_S1_ROOT_CARRIER_PORT` with fixed Promise methods; exact internal `RefDigest`, `S1CarrierRefusal`, `Abi5S1RootSelection`, and strict two-field `CutAConvergenceCoordinates` declarations; the driver retains full Cut-A output but passes only its verification/root-receipt pair into Cut B; one exhaustive refusal-to-result mapping | broad `./product` re-export, new Public operation, open/optional declaration shape, Cut B accepting or convergence-comparing the Cut-A packed-snapshot coordinate, rival mapping, or exported receipt/preimage/observer/selector interior |
| Packed verification | exact-bundled `tar@7.5.22` parser-only snapshot; link/type/path/PAX/duplicate/case/resource refusal; existing Product result/refusals unchanged | system `tar`, `node:child_process` in `verify_product.ts`, extraction, or second verifier |
| Installed observation | raw descriptor-based complete walk plus S1 packed expectation/comparison | symlink/hardlink/special/extra/missing/race acceptance, ProductInstall expansion, or legacy Boolean treated as S1 equality evidence |
| Load closure | Node `24.7.0` synchronous in-thread module census over one narrow self export, the frozen exact internal/dependency graph, exact relative `../../../toolchain/typescript.cjs` from `declaration_exports.ts`, and exact builtins | unexpected relative edge outside that frozen graph; source/private/ambient/global/absolute/data/network/native/Wasm/unobserved load; or governor module reachability |
| Confinement | pre-frozen platform OCI/tool closure and exact Docker Engine coordinate; offline, read-only verification mounts, scratch-only writes, caps dropped, no-new-privileges, network none | host/source mount, mutable input, unpinned tool, shell entry, or self-reported effect counter |
| Evidence | domain-separated acyclic records, coordinate-free case law, plan-before-results, independent observer artifacts, separate pure falsifier report | circular record, expected future result in bundle, observation in plan, result enclosing its run, or evidence not yet available |
| Result | exact closed phase union and sole carrier-refusal mapping; every post-Cut-A phase retains the complete successful Cut-A output; packed/installed or local snapshot failure is Cut B only, while convergence requires its projected verification/root-receipt pair plus independently successful Cut-B coordinates; every member fixes `rootQualification: not_evaluated`, `rootObligationEvaluations: 0`, and `advancementAuthorization: none` | discarded or mutated Cut-A packed evidence, local Cut-B refusal mapped to convergence, optional evidence soup, root/scenario credit, or later-stage selection |
| Governor | governor source absent from static/runtime closure; static S1-vs-pre-RC shape falsifier only | edit/import/call/test of `root-governor.mjs` or claim that current governor is S1 acceptance |
| Delivery | exact four-state CAS/lease transition: reviewed/proved `C`, distinct metadata archive commit `R_a`, archive suffix full `C`, annotated `T_ref -> T(C)` only on implementation acceptance, immutable delivery receipt, and verified remote containment | archive targeting/suffixed by the wrong OID, main advancing to `R_a`, moved/deleted archive, non-atomic accepted publication, docs tag/version effect, or unverified burn |

## Mandatory Review Preamble

Every S1 handoff and review begins with:

```text
Product: fixed ABIogenesis 5.0, A5-F01..F11 and A5-F13..F17
Selection: Wave 2 / A5-F01 / ST-S01-ROOT / S1 only
Status: v4 design and bounded two-coordinate carrier amendment accepted; I0
  complete; file-disjoint I1/I2 precursors selected; no
  implementation candidate frozen
Subject: one externally frozen s1_development_candidate
Claim: packed Product/root/publication verification, fresh extracted-byte
  reproduction, private convergence, and lexical declaration selection only
Runtime: none; R1-R10 all not evaluated
Unselected: S2-S4, scenarios, pre-RC qualification, RC, tap, release
Reference: accepted v4 design and exact delivered amendment own current HOW
```

## Deferred Assurance Register

These are assurance obligations, not selected Product outcomes, implementation
lanes, or authority to cross S1's stop.

| ID | Frame | Present evidence / counterexample | Why it does not block this docs freeze | Re-entry and trigger | Dependent boundary | Closure falsifier | Owner / status |
|---|---|---|---|---|---|---|---|
| `C-S1-CASES-01` | S1 case aggregation | E/P/T laws are defined; no one-subject aggregate exists | a docs candidate creates no S1 verdict | `realization_refactor` when K/L/F/G and concrete cases freeze | mandatory before `S1-I4` verdict | absent, crossed, or incomplete aggregate makes any S1 verdict invalid | independent assessor / deferred-required |
| `C-S1-FS-RACE-001` | T02 descriptor race | T02 names lstat/open/read/post-stat and inode-alias mutations; no executable fixture exists | the selected raw observer can reach the sunny E00 discriminator before exhaustive T02 assurance, but no I4 verdict may omit it | `realization_refactor` when the installed observer freezes | T02 raw-snapshot assurance before `S1-I4` verdict | any T02 race or alias reaches successful Cut-B coordinates | Product proof owner plus independent assessor / open-required-for-T02-before-I4-verdict |
| `C-S1-TAR-GZIP-001` | T01 gzip/tar grammar | T01 names compression, type, path, metadata, and bound mutations; no executable corpus exists | focused Lane P may enable the sunny E00 discriminator without claiming the exhaustive T01 corpus has closed | `realization_refactor` when the parser adapter freezes | T01 parser assurance before `S1-I4` verdict | alternate/malformed gzip, dangling/ambiguous metadata, or a bound breach is admitted | Product proof owner plus independent assessor / activated-required-before-I4-verdict |
| `C-S1-CUTA-PACKED-001` | Cut A/B carrier convergence | full `SuccessfulCutACoordinates` remains driver/result evidence; strict `CutAConvergenceCoordinates` projects only verification/root-receipt coordinates into Cut B, which rederives its packed snapshot locally | the packed coordinate is independently observed evidence, while the projected pair is the only causal Cut-A input to Cut B; Product and result meaning stay fixed | reactivate as `realization_refactor` if Cut B accepts/convergence-compares the Cut-A packed coordinate, the pair widens, full Cut-A evidence is lost, or result mapping changes; use the owning higher re-entry if Product meaning changes | carrier adapter, target import, E00, and every post-Cut-A result phase | full/extra packed field in `expectedCutA` is not `cut_b_verification_refused`; crossed causal pair is not `convergence_refused`; or outer packed evidence mutation is not `returned_evidence_refused` | Product proof owner plus independent assessor / closed-for-adapter-implementation on accepted delivered amendment `9bb230efaa5a` |
| `D-S1-PERM-001` | proof permission argv | OCI and Node-permission policy is selected; exact platform argv is not frozen | no ProofRunPlan or confinement claim exists | `realization_refactor` at exact tool-closure/driver freeze; `design_reframe` if policy changes | ProofRunPlan and confinement receipt | extra loader, mount, env, permission, process, network, or writable path survives argv admission | proof owner plus independent assessor / deferred |
| `D-S1-FS19-TAR-001` | FS-19 dependency/advisory | exact subject `bb1219397283` freezes the six-node bundled `tar@7.5.22` lock closure; subject-bound audit/advisory evidence is recorded below | no unresolved applicable advisory remains for the exact lock; any lock or advisory change reactivates the capsule | `realization_refactor` on lock/advisory change; `design_reframe` if the selected foundation changes | dependency admission before parser consumption | wrong/unbundled closure, unresolved provenance, or undisposed applicable advisory is accepted | Product dependency owner plus independent assessor / closed-for-parser-consumption 2026-08-23 |
| `C-R1-GOVERNOR-001` | later R1 admission | P06 is static shape evidence; governor modules are excluded from S1 | S1 evaluates zero root obligations and cannot reach R1 | later `design_reframe` when exact `pre_rc_candidate` admission is selected | R1 before any R1-R10 evaluation | S1 evidence is admitted as R1, or pre-RC subject/evidence admission remains unspecified | root/governor owner plus independent assessor / deferred-later |

### C-S1-CUTA-PACKED-001 Closure Disposition

The candidate's exact closure disposition is the narrow causal projection
selected under
`realization_refactor` from basis
`ece6597ed8846323ccab3d9a5736ecfa03f74bb3`. `verifyPacked` still returns the
complete `SuccessfulCutACoordinates`, including `packedSnapshotCoordinate`.
The external proof driver retains that complete object in every reached phase
after Cut A and constructs the strict positional fragment:

```text
CutAConvergenceCoordinates = {
  verificationCoordinate,
  rootReceiptCoordinate
}
```

Only that exact two-field fragment is passed as `expectedCutA` to
`verifyInstalledAndSelect`. Cut B accepts no discriminator, schema field,
digest, packed-snapshot coordinate, or other extra field in the fragment. Cut B
rederives its own packed snapshot, Product verification, and private receipt;
it constructs `SuccessfulCutBCoordinates` before comparing only the two causal
coordinates. A mismatch embeds exact `expectedCutA` and exact
`successfulCutB`. The outer driver independently validates the complete
retained Cut-A evidence and the exact projection before admitting any returned
selection.

Closure has three exact falsifiers. Supplying the full Cut-A object or any extra
`packedSnapshotCoordinate` as `expectedCutA` yields
`carrier_request_refused/cut_b/cut_a_coordinates_invalid`, mapped only to
`cut_b_verification_refused`. Crossing either causal coordinate after both cuts
succeed yields only `convergence_refused`. Mutating or crossing the retained
outer Cut-A `packedSnapshotCoordinate` while the causal pair remains valid
yields only `returned_evidence_refused`. Any implementation that does not
preserve those partitions reactivates this capsule before target import or
E00. File-disjoint packed-parser/verifier and raw-observer/comparator precursor
lanes remain lawful. This exact subject closes the carrier adapter to this
handshake only after independent acceptance and delivery; until then the
adapter, target import, and E00 remain blocked.

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
| W2 | `A5-F01`, `A5-F09`, `A5-F05`, `A5-F06`, bounded early `A5-F17` | Active; accepted S1 v4 design and bounded carrier amendment with file-disjoint I1/I2 precursors selected |
| W3 | `A5-F14`, `A5-F07`, `A5-F08` | Pending W2 |
| W4 | `A5-F13`, `A5-F17`, `A5-F11` | Pending W3 |
| W5 | `A5-F15`, `A5-F16` | Pending W4 |

Stable selection and delivery bases are accepted S1 v4 design
`701f6c018257d271465860ecb097b44381d614d0`, reviewed repo-local execution
selection `bc3a9377b926f6d1f01c681571b6e2cb740e967c`, implementation activation
`ea970995c1bc820e529ffb89e0e231193dcbfa3b`, and dependency-closure delivery
plus accepted delivered carrier amendment
`9bb230efaa5a1db06c7932a1204a5d477ead5e0f`. I0 selected unburned
`5.0.0-dev.288`; file-disjoint I1/I2 precursor implementation is active. No S1 implementation
candidate, artifact, run plan, development-gate result, Product tag, root
result, scenario result, or release truth exists yet.

Executive sequencing remains narrow: focused Lane P enables E00 after accepted
precursor integration;
`C-S1-TAR-GZIP-001` stays activated and required before I4/verdict, and
`C-S1-FS-RACE-001` stays open through T02 and required before I4/verdict. This
sequencing grants no assurance closure, Product credit, or later selection.
