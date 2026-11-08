# Review: RC8 reference preservation (REF-01) at `2019d62e4`

Commentary, not law. Reviewer only; no code was run by me. Written 2026-11-08T05:05Z against the report Jim pasted ("The specific copying and repeated-admission defects are resolved in RC8").

## 0. Subject

- Source: branch `codex/rc8-reference-preservation`, commit `2019d62e4` (tree `4c8a9240`), one commit over the rc.7 cut `27c08ce597`; 27 files, +1,153/−139; 13 Product source files, one design section (HOW §10.11), one new test, ten test or support files.
- Artifact: `abiogenesis-typescript-tenant-5.0.0-rc.8.tgz`, 11,027,562 B, sha256 `a178e960…`, 5,325 members. The measured archive, the byte-equal reproduction and the installed release are the same bytes.
- Install: `~/Library/Application Support/ABIogenesis/installs/5.0.0-rc.8` (2026-11-07T22:53Z), state `LOCAL_RC8_INSTALLED_UNQUALIFIED`. Not pushed; global selector unchanged.
- Records read: `rc8-reference-preservation-01/reviews/source-003`, `rc8-reference-measurement-01/{ROOT_MEASUREMENT_ACCEPTANCE_004.json, before-rc7-002, after-rc8-004 (incl. the 4 MiB cpuprofile)}`, `rc8-local-cut-01/{ROOT_FINAL_DISPOSITION.json, HANDOFF.md, install-claims-001/*, actual-001/*}`, `rc8-close-proof-01/OPERATOR_RETURN_025.json`, `rc8-resumption-20261108/*`, the ticket's RC8 rows. Source diff read in full for the 13 Product files, the design section and the new test.

## 1. Verdict

**The four "Fixed" rows are correct.** Each is in the source, in the installed artifact, and exercised by the new test. The clone is gone from the established path, the identity-keyed caches hit, the canonical compare does not run, and the run owner receives the constructed invocation, request, payload, Catalog and view by identity. This is the fix I asked for in the rc.7 transport review, done the way I asked: establish at construction, recognise by owner identity, no re-walk per call.

**The speed numbers do not carry the claim; the counters do.** The 16.8 % and 12.0 % are one sample each and sit inside the run-to-run spread of the unchanged rc.7 artifact on this host (F1). What is proven is zero detaches, zero Catalog admissions, zero comparisons and one Product input reuse per call.

**RC8 is installed and unqualified**, with nine open residual populations. One of them is new on RC8 and is caused by RC8 (F4). The per-call cost that remains is the same class of defect in other owners (F2), and the per-task cycle cost REF-01 never touched is unchanged, as the report concedes.

## 2. Reconciliation

| Report row | Verified where |
|---|---|
| Transport cloned established calls, losing identity → fixed | `installed_definition_call_transport.ts`: `isEstablishedDefinitionCall` → carry by reference; `detachDefinitionCall` kept for raw, copied and shell-mutable candidates. The held path checks `resources.eventResource !== resource` before the carry, so the selection-identity law from the held design still holds. Installed `build/code/src/public/installed_definition_call_transport.js` carries the same code. |
| First binder call recopied/rechecked Catalog and view → fixed | `static_definition_bindings.ts` `admitResources` asks `isAdmittedReadyGraphFunctionCatalog` / `isAdmittedGraphFunctionCatalogView` (WeakSet facts from `catalog.ts`) before any JSON copy; `execution_resolution.ts` compares only when `!==`. Measured: `gated.catalog` 0, `fullAdmissions` 0, `catalogComparisons` 0 per call; setup absolute 1 and 1. |
| Frozen raw values could bypass defaults/transforms/refusals → fixed | Stage-02 "frozen member reuse" removed (§10.11 "Retired inference"); test covers a transform, a schema default and a non-enumerable refusal with and without the fact table; defaulted raw start admits to `fhMode: "direct"` and the run owner receives that request. |
| Request normalisation copied the task input again → fixed | `semantics.ts` `establishCanonicalProductInput` records the canonical payload at the one constructor call site; run owner `inputReuses` 1, `inputCopies` 0 per call; `observeRunPreparationSubjects().input === call.invocation.request.input.value`. |
| Source-003: no findings | Read. Reviewer family Codex over native-Worker (Opus) code; retained evidence independently rehashed; reviewer ran no tests. Scope was the five-file stage-04 correction, not the whole cut. |
| One admission and one view at setup, zero after, across first and warm calls | `after-rc8-004/MEASUREMENT.json` counters, three calls plus two warm reads. |
| SDK call −16.8 % / −12.0 %, memory mixed, single samples | `ROOT_MEASUREMENT_ACCEPTANCE_004.json`. See F1. |
| Nine residuals, one new static-oracle incompatibility | `install-claims-001/RESIDUALS.md`; the new one is `RC8-W2-05-TOKEN-ORACLE`. See F4. |

## 3. What this cut gets right

- **Freeze once, at construction.** `establishExactDefinitionCall` runs the existing full admission once, deep-freezes its output with one walk that descends through already-frozen containers (the `deepFreeze` gap I flagged), and records the output in a WeakMap keyed by the invocation object. The raw input is never recorded.
- **Identity, not a re-walk.** `isDeeplyFrozen` runs on the Catalog miss path and once per new worker contract (`deepFrozenChecks` 1, 0, 0). No per-call walk of the 20 MB Catalog.
- **Equality is unreachable on the held path.** `canonicalEquals` is unchanged (and still has no identity shortcut by design); the call sites test `!==` first and the counters show it never runs for the Catalog or view.
- **Measured equals installed.** The RC7 defect (six members differed) is closed: the archive under test, the clean reproduction and the installed release are byte-equal.
- **A broad population ran.** 208 inventory files; 192 whole-file credits, 986 passes, 227 historical skips; 16 files in separate populations (4 accepted whole, 3 casewise, 9 open). RC7 had no broad run at all.
- **Counters are observation-only and unexported**, as in §10.9.

## 4. Findings

**F1. The speed-up is one sample inside host variance.** Three runs of equivalent source, same fixture, same host:

| Run (UTC, 7 Nov) | Artifact | `sdk_call_1MiB` | `sdk_call_4MiB` |
|---|---|---|---|
| 00:12 (rc7 carriage actual-002) | rc.7 source, pre-cut archive | 4.12 s | 4.29 s |
| 03:12 (before-rc7-002) | installed rc.7 | 3.60 s | 4.08 s |
| 04:45 (after-rc8-004) | rc.8 | 2.99 s | 3.59 s |

The rc.7 artifact alone moved 12.6 % and 4.9 % between two runs three hours apart with no source change. A single-sample 16.8 % / 12.0 % is therefore not separable from that spread. The acceptance record says this ("no statistical speedup qualification"); the report's lead sentence should say it too. The defensible statement is: the clone and re-admission are gone (counters), and the matched pair moved about 0.5 s on a 3.6 to 4.1 s call, n = 1. Construction grew 0.81→0.84 s and 0.89→0.90 s, which is the establishment walk and is also n = 1.

**F2. What remains per call is the same defect in other owners.** My aggregation of Codex's 4 MiB profile (3,853 ms sampled, third call, parent only; inclusive frames overlap and must not be added):

| Frame | Inclusive | Share |
|---|---|---|
| `writeCanonicalJson` | 1,651 ms | 43 % |
| `sha256Canonical` | 901 ms | 23 % |
| `(idle)` — awaiting the child actor process and fsync | 888 ms | 23 % |
| `runRuntimeEventTransaction` (append path) | 655 ms | 17 % |
| `canonicalEquals` | 597 ms | 15 % |
| `projectExactExecutionBasisRecordAtPrefix` | 398 ms | 10 % |
| `deriveWorkspaceEnvironment` (from artifact-truth rows) | 289 ms | 7.5 % |
| `admitExecutionBasis` | 281 ms | 7.3 % |
| `installedPayloadMatchesGraphCarrier` | 211 ms | 5.5 % |
| `admitOwnedCCallResult` | 199 ms | 5.2 % |
| `admitExactInvocation` | 173 ms | 4.5 % |

Self time: canonical JSON 821 ms, hashing 710 ms, equality 259 ms, JSON admission 143 ms. Two thirds of the call is canonical serialisation, hashing and canonical comparison, and most of it is over data that did not change between calls of the same held session:

- The execution basis record is re-projected from its event row on every call: `admitJson` of the raw input value (the 1 to 4 MiB task input), a canonical digest of it, and a canonical digest of the body (`execution_basis_record.ts` `EXECUTION_BASIS_RECORD`).
- The workspace environment is re-derived from the artifact-truth rows on every call (`environment_admission.ts`).
- The installed Product content is re-verified on every call: an `lstat` walk of the installed payload tree, a canonical compare of the file list, a read of the graph asset, file hashing (`install_product.ts` `installedPayloadMatchesGraphCarrier`, reached through `verifyInstalledContent`).

These are folds of immutable rows and immutable bytes. The held design's rule is to fold once and hold the fold for the life of the session; REF-01 applied it to the call, not to these owners. The same shape fixes it: the owner that admitted the basis, the environment and the install content in this process records the fact by identity (prefix object or install identity) and later calls take it by identity. Expected effect: roughly 1 to 1.3 s of the 3.6 s call, which is larger than REF-01's. The append path (`runRuntimeEventTransaction`) is new work per call and is not in this class. Scope: `realization_refactor`, same class as REF-01; it should go through the same counters-first acceptance.

**F3. The carrier sentence I asked to be rewritten still stands.** `installed_definition_call_transport.ts:424–425` still reads "semantic data is detached, while the exact owner-issued physical selection survives". It now describes only the non-established path. One-line fix; the design section is correct.

**F4. The new static-oracle red is caused by RC8 and should be closed, not carried.** `t287-w2-05-install-catalog-owner-chain.test.mjs:1584` bans `WeakMap|new Map` in the owner chain. RC8 adds exactly three: `selectedDefinitions`, `establishedInvocations` (WeakMaps carrying admission facts) and `gatedResourceMembers` (a counter Map). The oracle exists to keep hidden per-process state out of the admission chain, and §10.11 introduces hidden per-process state by design, classified as owner-local derived facts. I agree with the capsule: amend the oracle to a named allowlist of those three identifiers and keep the regex for everything else. That is a one-file test change; leaving it open puts a deterministic red into the next broad run.

**F5. One worker-contract copy per call remains, at the producer.** `actor_process.ts:1050` builds a fresh `constructKnownWorkerTransportContract("claude", {…environment})` per actor launch, so X6 copies it every call (`contractCopies` 1). The object is small; the fix is to construct it once per runtime and pass the frozen object. Low priority.

**F6. Proof shape.** The REF-01 proof is one TAP test with one pass that carries all the assertions (identity at the run owner, counters, copied shell, defaulted raw start, rebox, frozen Catalog copy, binder transform/default/non-enumerable, shallow-frozen shell, worker plan). That is a good test. It runs in the `test:unit` lane only if listed there; I did not confirm the lane membership. The broad run is not green: nine populations open, and 227 historical skips are carried without explanation in the records I read.

**F7. The cycle cost is unchanged, as the report says.** The final disposition's intervals for the last author task: prepared→dispatch 127 s, SDK call 237 s of which the focused proof was 1.4 s. REF-01 moved about half a second per call. The 56 minutes of fixed cost per task from my build-cycle diagnosis is where the time still goes.

## 5. Against the acceptance list from the rc.7 transport review

| Acceptance | RC8 |
|---|---|
| Catalog admissions per held session = 1 | Yes, setup absolute 1; 0 after. |
| `canonicalEquals` count on the held path = 0 | Yes for Catalog and view (`catalogComparisons`, `viewComparisons` 0). The function still runs 597 ms per call from other owners (F2). |
| `invocation.request` identity at the run owner | Yes, and the nested payload too. |
| Call wall and RSS before/after on 1 and 4 MiB | Done, n = 1; RSS mixed (F1). |
| One CPU profile of a single call | Done; attribution in F2. |
| History counters unchanged | Warm calls: 0 decodes, 0 reopens, 0 cold reads. |

## 6. Limits

I ran no code and no tests. Profile attribution is my own aggregation of Codex's `4MiB-profile.cpuprofile` (self time by frame; inclusive by ancestor chain, de-duplicated per label); one profiled call, parent process only. I did not re-run the broad population, did not verify the 227 historical skips, and did not read the nine residual review records beyond the capsule text. Source-003's reviewer and the Root are Codex; the Worker was Opus; I am a third family on the source only.
