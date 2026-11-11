# TD-59 Return: the fourteen failures at the release base, and the r1 to r3 basis

Writer: Claude Opus 5.5. Branch `claude/td59-failures-at-base` from
`4108746ba`, worktree `/private/tmp/abg-td59`. Change class:
realization_refactor, test side only. No push, no tag.

**Status: 12 of the 14 base failures are discharged and 2 stay red.** Each of
the 12 is now a pass, a skip with its reason, or a retirement with a
tombstone. r1 to r3 derive the expected identity from the packed artifact by
default and read the committed fixture only under
`ABI5_CANDIDATE_BASIS_SOURCE=committed`. They pass in both modes.

The 2 red cases:

- `witness-reprice-definition-binding`, the profile reprice case. Ruling 4
  takes its second branch: the reads show a second pass over the
  population. The test is unchanged and goes to TD-51 (section 5).
- `t287-governed-context` GC03. This is a new observation and needs a
  ruling. With ruling 3 applied, the STDO 3.0.2 pins pass. The released
  GC03 then refuses every granted key with `basis_stale`, because the
  Product definition names STDO 3.0.4 (section 4).

No file under `T/code` or `T/contracts` changed, and neither did
`T/package.json` or the manifest. Here `T` is
`build_tenants/abiogenesis/typescript`.

| Commit | Ruling | Content |
| --- | --- | --- |
| `e0e5668bf` | 1b | HS03 oracle through the evidence root |
| `9ae4ee27a` | 1c | exact014 retired; candidate-only projected-schema case kept |
| `54180fa4e` | 1a | retained RC5 history gated through the evidence root; input variable and proof write removed |
| `ad97acb08` | 2 | two route cases restated on non-basis bodies |
| `0ecc0f315` | 3 | GC03 recipe resolves `stdo://releases/v3.0.2/` |
| `c8572fbd9` | outside the rulings | GC03 reads the Construction task from the Result's own basis (RC7 shape) |
| `7366d6390` | 1a | RC5 log hashed once per file run; cases check file identity |
| `c32a0ab1e` | 5 | r1 to r3 identity derived from the pack by default; `committed` source |
| this commit | | this Return |

## 1. Before and after

Each file was run alone with
`node --experimental-vm-modules --test --test-concurrency=1`, with
`TMPDIR=/private/tmp/abg-td59-tmp`. "Unset" means `ABI5_EVIDENCE_ROOT` was
unset. "Set" means it was `/Users/jim/src/apps/abiogenesis/.ai-workspace`.
Counts are tests / pass / fail / skip, taken from the TAP summary. The before
runs are at `4108746ba`. The after runs are one sequential sweep at
`c32a0ab1e`, with the default basis source.

| File | Before, unset | Before, set | After, unset | After, set |
| --- | --- | --- | --- | --- |
| `witness-reprice-definition-binding` | 15/14/1/0 | 15/14/1/0 | 15/14/1/0 | 15/14/1/0 |
| `t287-framework-handoff-types` | 6/5/1/0 | 6/5/1/0 | 6/6/0/0 | 6/6/0/0 |
| `t287-calculus-fold` | 25/23/2/0 | 25/23/2/0 | 25/23/0/2 | 25/25/0/0 |
| `t287-route-reconstruction` | 13/8/2/3 | 13/9/2/2 | 13/10/0/3 | 13/11/0/2 |
| `t287-governed-context` | 15/14/1/0 | 15/14/1/0 | 15/14/1/0 | 15/14/1/0 |
| `t287-single-address-space-consolidation` | 12/5/7/0 | 12/5/7/0 | 12/6/0/6 | 12/12/0/0 |
| `r1-packed-artifact` | 1/1/0/0 | 1/1/0/0 | 1/1/0/0 | 1/1/0/0 |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 | 1/1/0/0 | 1/1/0/0 |
| `r3-workspace-binding` | 1/1/0/0 | 1/1/0/0 | 1/1/0/0 | 1/1/0/0 |
| Total | 89/72/14/3 | 89/73/14/2 | 89/76/2/11 | 89/85/2/2 |

Skips after the change:

- Root unset: 9 cases skip with
  `ABI5_EVIDENCE_ROOT unset; requires <path> (<sha256 prefix>)`. They are
  the two HS03 cases, the six retained-history cases, and the S01 route
  subtest, which skipped at base too. Two route cases skip on
  `P0_RETAINED_NATIVE_SCRATCH`.
- Root set: only the two `P0_RETAINED_NATIVE_SCRATCH` route cases skip.
  They are outside TD-59 (TD-60).
- The two failures in both modes are witness-reprice (section 5) and GC03
  (section 4).

With the root unset, the base shows 14 failures, as the review records:
consolidation 7, calculus-fold 2, route-reconstruction 2, framework-handoff 1,
GC03 1 and witness-reprice 1. Setting the root changes no base failure.
It runs one more route subtest, the S01 replay digests.

## 2. Ruling 1: input gates

### 1a. `t287-single-address-space-consolidation` (commits `54180fa4e`, `7366d6390`)

At base, the six retained-history cases read `ABI5_CONSOLIDATION_INPUTS`,
which defaults to `<repo>/consolidation-inputs/native-02`, and fail with
ENOENT. The final case fails because their records are missing.

I ran a diagnostic at base with the variable pointed at the archived
sandbox. All six cases passed (160 s), so the evidence did not show a
superseded-cut claim or a Product defect, and nothing is retired. The
review's concern about `requireCurrent` does not apply:
`readOwnedRuntimeHistoryAtDurablePrefix` checks that the extent is current
(`size === prefixLength`), not that the profile is current.

Where the inputs are. All three are under the evidence root, and all three
match their pins.

| Input | Path under `ABI5_EVIDENCE_ROOT` | sha256 | bytes |
| --- | --- | --- | --- |
| `EXTERNAL_READ_RESOURCES.json` | `work/T287_RELEASE_RESUMPTION_01/single-address-space-consolidation-01/runtime-001/resources/archives/worksite-command-execution/2b3dea4f…3097/306d3afd…3073643/sandbox/consolidation-inputs/native-02/` | `5934e009…4eac` | 1,105 |
| `MEASURED_BASELINE.json` | same directory | `774df745…5a06` | 5,575 |
| RC5 event log | `work/T287_RELEASE_RESUMPTION_01/rc5-performance-01/runtime-001/resources/events/runtime.events.jsonl` | `53207945…cf20c` | 586,361,364 |

How the log is gated:

- One module-level gate in the test file calls `evidenceInput` on each of
  the three inputs. That one call reads and hashes the log.
- The gate checks:
  - the records say `readOnly: true`;
  - the records name the RC5 pin (`eventLogSha256`, `eventLogBytes`);
  - the hashed file has the pinned size.
- The gate keeps the log's evidence-root path and its file identity at the
  hash: device, inode, size, mtime and ctime.
- No case hashes the log again (`7366d6390`). Each site that used to hash it
  now asserts that identity, plus the byte length where it reads the bytes:
  - retainedHistory, before and after its reads;
  - livenessFork's read, whose full-log coordinate takes the gate-verified
    digest;
  - classification;
  - run-invocation pairs;
  - `retainedOwnedPrefix`, before and after, for both of its callers.
- `54180fa4e` alone left ten more hashes of the log per set-mode run. Nine
  were checks: seven code sites, two of which run once for each of
  `retainedOwnedPrefix`'s two callers. The tenth was livenessFork's
  full-log coordinate digest.
- `54180fa4e`'s message claims the log "is hashed once per file run by the
  gate", which is true only after `7366d6390`. `7366d6390`'s own message
  says "nine more times"; the count is ten, including the coordinate
  digest.
- The installed case keeps its own hashes, of its own log.
- Without the root the six cases skip with the owner's reason
  (`ABI5_EVIDENCE_ROOT unset; requires work/T287_…`). The records name the
  log by its recorded absolute path. `retainedProfile` still checks that
  path, while the cases read the evidence-root path, which holds the same
  bytes.
- Nothing is written under the root.

Removed:

- `ABI5_CONSOLIDATION_INPUTS` and its default path.
- `consolidationInputs()`.
- `writeProof()` and `proofPath`, which wrote to `T/artifacts`.
- The now-unused `tenantRoot` and `sha256Bytes` in the support module.

The final case now passes the proof record to `t.diagnostic`.

### 1b. `t287-calculus-fold` HS03 (commit `e0e5668bf`)

The two HS03 actual-stream cases read the oracle through `evidenceInput`.
The oracle is at
`work/T287_RELEASE_RESUMPTION_01/rc12-executive-01-evidence/liveness-h/oracle/hs03-metadata.json`,
46,684,229 bytes, matching the existing pin. The `liveness-l2` copy is
byte-identical.

The cases skip with the reason when the root is unset.
`ABI5_HS03_STREAM_METADATA` is removed.

### 1c. `t287-framework-handoff-types` exact014 (commit `9ae4ee27a`)

The equality case is retired with the tombstone `// Retired (T-292 TD-59): 'per-slot owner schemas equal the exact014 baseline archive'; equality with a package cut before RC6 is a superseded-cut claim (the T-290 C-5 class).`

The case also stated one claim about the current candidate that no other
case states: every owner slot contract has its canonical projected schema in
`PUBLIC_PROJECTION_PAYLOADS.operationSchemaAssets`. No other test reads
`operationSchemaAssets`. That claim stays as the case "every packed owner
slot contract has its canonical projected schema". It needs no baseline
and observes 224 slots and 178 contracts.

Removed: `ABI5_HC1_BASELINE_PACKAGE_PATH`, `BASELINE_SHA256`,
`baselineArchiveBytes`, `extractBytes`, `sorted`, `canonical` and the
`createHash` import.

## 3. Ruling 2: `t287-route-reconstruction` (commit `ad97acb08`)

Both cases fail at base on basis bodies. Under the RC10 O1 lifetime, the
store releases a basis body once no run operation scope holds its
invocation (`runtime_history.ts` `#basisHolds`). Both cases are restated on
non-basis bodies, and no basis-release assertion is added.

- "drop complete output then selected route…": the base fails with "the open
  store keeps the verified bodies of its current generation". The weak
  reference now holds the `c_call_result_admitted` value instead of the
  basis `rawInputValue`.
- "held history generation projection…": the base fails at `:602` with "a
  committed row decodes at most once in its generation" (18 !== 22). The
  history is now built with no basis row (`terminalOwner(t, 0)` instead of
  4). The rolled-back and committed transactions each admit one unrelated
  workspace operation (`unrelatedWorkspaceEvent`, from the consolidation
  support) instead of a basis body.

Every assertion in both cases is unchanged, and both pass in both modes. The
remaining two skips belong to `P0_RETAINED_NATIVE_SCRATCH`, a bespoke gate
outside TD-59 (TD-60).

## 4. Ruling 3: GC03 (commits `0ecc0f315`, `c8572fbd9`)

`0ecc0f315` carries out the ruling:

- `GC03_RECIPE.methodRelease` is `stdo://releases/v3.0.2/`.
- The case resolves it with `stdo resolve` and builds the recipe from that
  root.
- The case skips with a reason that names the release if it does not
  resolve.
- The Product-basis checks against `stdo_abiogenesis.json` (3.0.4) are
  unchanged.

On this host 3.0.2 resolves, the three standards match the recipe pins, and
the case gets past the step where it failed at base.

The case then fails at two later points:

1. `:817` "admitted native Construction task". The test read
   `payload.value.task`. Since RC7 (`27c08ce59`), a native workspace-work
   Result carries no task copy. It binds its admitted task by `inputDigest`,
   which is the raw input of its own execution basis
   (`product/native_workspace_work.ts:148-154`, `abg/native_worksite_execution.ts:40-57`).
   The pin failure at base hid this.

   `c8572fbd9` restates the read: the case takes the task from the one
   `basis_admitted` row the Result names. It asserts that:

   - the basis `rawInputDigest` and `graphFunctionRef` equal the Result's
     `inputDigest` and `graphFunctionRef`;
   - that digest is the task's own;
   - the task is a native workspace-work task with no assessment, as
     before.

   This commit is outside the rulings. It adds assertions and removes none.
   It is separable, and the Executive decides whether to keep it. Only its
   own assertions have run; the cold-owner section that uses the task later
   (`:885-:898`) has not run, because the case stops first at point 2.
2. The GC03 adapter refuses all three granted keys (`late/0`, `late/1`,
   `late/2`) with `gc03_refused`, "basis_stale: Native profile requires its
   exact released Product basis". The denied key `late/3` gets `key_denied`
   as intended.

   At HEAD the TAP shows this refusal as `TypeError: Cannot read properties
   of undefined (reading 'provenance')` at `:836`, because the case reads
   `source` from the `late/2` page, which is a refusal. I found the
   refusal with a temporary diagnostic of the pages; the diagnostic is not
   committed.

The cause of point 2 is in the released GC03. In
`gc03-adb3d8ee-1/contents/a_c/build_tenants/graphify/code/ac_support_core.py:586-592`,
the 3.0.2 native profile (`urn:a-c:fd-support:method:stdo-3.0.2:executive:1`,
the one the recipe names) requires the Product definition's
`/constitution/stdo/basis` to be exactly `stdo://releases/v3.0.2/` with the
3.0.2 manifest.

The recipe gives it the current `stdo_abiogenesis.json`, whose basis has been
`stdo://releases/v3.0.4/` since `e1bcb6ee2` (2026-11-09). Neither installed
GC03 release (`gc03-adb3d8ee-1`, `gc03-1130ca0f-1`) defines a native profile
for 3.0.4.

The packaged Product selects only the GC03 release identity. The 3.0.2 native
profile that triggers the refusal is chosen by the test's recipe, and the
register files GC03 as a stale test (TS-03). This is therefore either a
Product defect or a stale recipe:

- Product defect: the Product's selected release cannot serve the Product's
  own current basis under any native profile installed on this host.
- Stale recipe: the recipe names a superseded method profile.

I treated it under the Product-defect stop and stopped work on this case.
The classification is part of the ruling requested here.

The choices for the Executive:

- retire GC03 as a superseded-cut claim (RC2/RC3 operator sources, 3.0.2
  method profile);
- cut a GC03 release with a 3.0.4 native profile, which is a_c-side work
  plus a Product selection change;
- re-derive the recipe on a non-native profile, which skips the basis check
  but changes the claim.

I did not supply a 3.0.2 Product definition to the recipe; that would forge
the Product's identity. I did not add a second skip condition either,
because the ruling allows a skip only when the release does not resolve.

## 5. Ruling 4: `witness-reprice-definition-binding` profile reprice

The test is unchanged and stays red:
`live profile boundary: no later handoff re-reads the complete closed population (3/3)`
(`:43`, from `:248`).

The probe (`/private/tmp/abg-td59-work/probe-witness-reads.mjs`) ran the
case's own setup with the case's read meter.

The profile case has three rows:

- an entry of 1 row: `basis_admitted`, 776 bytes;
- an appended `public_operation_admitted`, 2,170 bytes;
- an appended `declaration_reprice_admitted`, 3,447 bytes.

The closed population is therefore 3 rows. The physical reads, with the
owner frames from each stack:

| Read | Class | Row | Owner frames (compiled `build/code/src`, source line in brackets) |
| --- | --- | --- | --- |
| 1 | acquisition | 1 (entry, 776 bytes) | `foldRuntimeHistoryDescriptor` ← `decodeRuntimeHistoryDescriptor` ← `reopenEventStore` ← `acquireAbgEventResource` |
| 2 | selected | 1 | `readRuntimeHistoryRowBytes` ← `RuntimeHistorySelection.materialize` ← `indexedRuntimeEvents` (`event_prefix.js:624`) ← `hasExactBasis` (`witness_admission_operation.js:355`, `.ts:603`) |
| 3 | selected | 1 again | `readRuntimeHistoryRowBytes` ← `RuntimeHistorySelection.materialize` ← `admitRootEventProfileUpgrade` (`event_store.js:2927`, `.ts:3955`) ← `witness_admission_operation.js:753` |
| 4 | selected | 3 (appended) | `readRuntimeHistoryRowBytes` ← `RuntimeHistorySelection.materialize` ← `indexedRuntimeEvents` ← `witness_definition_bindings.js:205` |

The selected reads are rows {1, 1, 3}, not the appended rows {2, 3}. Row 2
is never read. That rules out the branch that restates the bound, because
the reads are not acquisition plus one read per appended row.

Two causes combine:

- `admitRootEventProfileUpgrade` (`event_store.ts:3955`) runs
  `assertRootEventProfileBoundary([...(state.history?.select().materialize() ?? state.events), projectedPublic], …)`.
  That materializes the complete entry history a second time, for the
  prior-boundary and in-flight actor and CCall scans.
- Under O1 the basis body is not kept, so that second materialization reads
  row 1 from the file again.

The material-witness case is the comparison. It does not upgrade the
profile, and it passes: 321 acquisition chunks over a 20,972,406-byte entry
row, then selected row 1 (by `hasExactBasis`) and row 3, so 2 < 3.

Owner site for TD-51: `code/src/abg/event_store.ts:3955`. On a larger entry
history the boundary materialization reads every entry row. Neither cause
is a test defect.

## 6. Ruling 5: r1 to r3 and the candidate basis (commit `c32a0ab1e`)

Changes in `support/candidate-basis.mjs`:

- The checks move into `checkedCandidateBasis`.
- `readCandidateBasis` returns the same value as at base. I checked this by
  calling the base module and the new one on the same fixture.
- New `candidateBasisSource()` reads `ABI5_CANDIDATE_BASIS_SOURCE`. The
  default is `packed_artifact`, the same value the root harness option
  uses. Any value other than `packed_artifact` or `committed` throws.
- New `expectedCandidateBasis(packageRoot, {artifactPath, productRoot, product})`:
  - default: derives the identity from the packed archive, the same way
    `root-installed-environment.mjs:242-251` does: the archive digest by
    the packed product's `sha256File`, and the content digest, manifest
    digest, product ID, package name and version from the packed manifest;
  - `committed`: reads the fixture.

r1, r2 and r3 call `expectedCandidateBasis` and record the source with
`t.diagnostic`. r1 derives the identity before it tampers with the extracted
package.

What each mode proves (r1's header):

- Default: the pack is self-consistent, and both a tampered archive and a
  self-consistent substitution are refused (`artifact_digest_mismatch`).
- Committed: the pack also equals the separately recorded identity. This is
  the external check the cut runs after it writes the basis.

Both refusals are asserted in both modes.

Each file was run in four configurations: two basis sources, each with the
root unset and set. The table gives tests / pass / fail / skip, with the
source line `t.diagnostic` printed in each run.

| File | default, unset | default, set | `committed`, unset | `committed`, set |
| --- | --- | --- | --- | --- |
| `r1-packed-artifact` | 1/1/0/0 `packed_artifact` | 1/1/0/0 `packed_artifact` | 1/1/0/0 `committed` | 1/1/0/0 `committed` |
| `r2-clean-install` | 1/1/0/0 `packed_artifact` | 1/1/0/0 `packed_artifact` | 1/1/0/0 `committed` | 1/1/0/0 `committed` |
| `r3-workspace-binding` | 1/1/0/0 `packed_artifact` | 1/1/0/0 `packed_artifact` | 1/1/0/0 `committed` | 1/1/0/0 `committed` |

`scripts/refresh-candidate-basis.mjs` and the fixture are unchanged. The
fixture is current at base, so committed mode passes now. That is an
observation about this base, not a property of the suite.

## 7. Removed and changed assertions

| Ruling | File | Assertion | Disposition |
| --- | --- | --- | --- |
| 1a | consolidation support | `resources.value.readOnly === true` in `consolidationInputs` | moved into the test's gate |
| 1a | consolidation test | final case: `assert.ok(written.bytes > 0)` | removed with the proof write |
| 1a | consolidation test | final case: required case keys | now conditional on the gate: the 5 installed and RAW keys always, the 6 retained keys when the evidence is present. 3 keys added (`livenessFork`, `publicOperationClassification`, `globalRunInvocationPairs`); their cases record them but the base list omitted them |
| 1a | consolidation test | gate: records name the RC5 pin (sha256, bytes); hashed file has the pinned size | added |
| 1a | consolidation test | `retainedProfile`: `coordinate.eventLogRef` against the records' path | unchanged in meaning; the variable is renamed `recordedPath` because the cases read the evidence-root path |
| 1a | consolidation test | seven `sha256(log) === eventLogSha256` checks in the code, nine executions per run (retainedHistory before and after, livenessFork, classification, pairs, `retainedOwnedPrefix` before and after) | changed to file-identity equality with the identity the gate kept at its one hash, plus byte length where the case reads the bytes; livenessFork's full-log coordinate takes the gate-verified digest instead of rehashing |
| 1b | calculus-fold | `typeof path === 'string'` ("the lane supplies the pinned metadata oracle") | removed; the evidence-root owner gates the input |
| 1c | framework-handoff | exact014 drift equality and baseline `expected.size` | retired with the tombstone |
| 1c | framework-handoff | `unprojected` is empty | kept, candidate only |
| 1c | framework-handoff | `rows.size === 224` on the candidate | added |
| 2 | route-reconstruction | weak-reference subject | basis `rawInputValue` → `c_call_result_admitted` value |
| 2 | route-reconstruction | generation fixture | 4 basis rows → 0; the refused and committed admissions are unrelated workspace operations instead of basis bodies |
| 3 | governed-context | method sources | read from resolved 3.0.2 instead of the Product basis (3.0.4); skip added if 3.0.2 does not resolve |
| outside rulings | governed-context | native task source (`c8572fbd9`) | `payload.value.task` → the Result's own basis `rawInputValue`; two binding assertions added |
| 5 | r1, r2, r3 | expected identity | committed fixture → pack-derived by default, fixture under `committed` |

## 8. Qualification inventory members whose bytes changed

Each member of `test_env/qualification/inventory.json` that differs
between `4108746ba` and HEAD is listed below. Digests are the first 16 hex
digits, computed from the bytes.

| Member (under `T/test_env/`) | Inventory | Base `4108746ba` | HEAD | Inventory matched base |
| --- | --- | --- | --- | --- |
| `support/candidate-basis.mjs` | `8859410e2fa686d4` | `8859410e2fa686d4` | `e8053600a7692816` | yes |
| `tests/t287-route-reconstruction.test.mjs` | `ed9beb7e4a7e6a43` | `ed9beb7e4a7e6a43` | `28d47b53bc605f09` | yes |
| `tests/t287-calculus-fold.test.mjs` | `a0536113e290c074` | `5d243d6980631afa` | `8a8efdf2a9bbcf62` | no |
| `tests/r1-packed-artifact.test.mjs` | `60ce32386c0d26eb` | `b81187b73578f575` | `ae100e49107e6518` | no |
| `tests/r2-clean-install.test.mjs` | `6299553046912343` | `0632f6512c88693d` | `56bb75b62aef2812` | no |
| `tests/r3-workspace-binding.test.mjs` | `ea2a762829ca40f8` | `d0074e1df85d69de` | `9c5175fd35ba7fe4` | no |

All six are also named in `recipe/verification-recipe.json`, and
calculus-fold is named in `recipe/declared-commands.json`. The declared
calculus-fold command (`commands[4]`) sets `ABI5_EVIDENCE_ROOT` and never
set `ABI5_HS03_STREAM_METADATA`. Under the recipe, the two HS03 cases
failed at base; they now run through the evidence root.

The inventory and the recipe are not edited, so these six pins are now stale
(TD-63). Four of the six were already stale at base. The inventory pins many
other members that are stale at base, mostly under `T/code`, from earlier
waves; this branch does not touch them. `witness-reprice-definition-binding`, `evidence-root.mjs`,
`refresh-candidate-basis.mjs` and the basis fixture are members and
unchanged. The consolidation test and support, framework-handoff and
governed-context are not members.

## 9. Deviations

- The native-02 records are not at the path in the brief
  (`…/single-address-space-consolidation-01/native-02/`). They are inside the
  archived sandbox (section 2, 1a).
- The consolidation gate lives in the test file, not the support module.
  The support module keeps only measurement and fixture helpers, and the
  gate's reason names the test's own inputs.
- The final consolidation case requires three more keys than at base
  (section 7).
- `54180fa4e`'s message claims one hash per file run before the follow-up
  `7366d6390` makes it true.
- The consolidation file takes 523 s with the root set in the final
  sweep, against 345 s at base, because the base never ran the six
  retained cases (they failed on ENOENT at once). Their own cost at base,
  in the diagnostic run, was 160 s. Before `7366d6390` the set run took
  605 s. With the root unset it takes 355 s, against 345 s.
- `c8572fbd9` (GC03 native task source) is outside the rulings
  (section 4).

## 10. Residuals

- `witness-reprice-definition-binding` stays red. Owner site
  `event_store.ts:3955`, to TD-51.
- GC03 stays red and needs the Executive's ruling (section 4).
- The root harness (`root-installed-environment.mjs:235`) still reads the
  committed fixture in `packed_artifact` mode. It spreads the fixture before
  overriding every identity field, so the suite still needs the fixture to
  exist and to parse. r1 to r3 no longer do.
- The external-identity check moves into the cut (TD-71).
- `P0_RETAINED_NATIVE_SCRATCH` and the other bespoke gates belong to TD-60.
- The inventory digests listed in section 8 are stale (TD-63).
- The single-address-space file still installs once per installed case
  (TD-58).
