# TD-60T Return: five cases that fail with their inputs present

Writer: Claude Opus 5.5. Branch `claude/td60t-class-a-triage` from
`a356416eb`, worktree `/private/tmp/abg-td60t`. Change class:
realization_refactor, test side only. No push, no tag.

**Status: four of the five cases are stale tests. They are restated and
pass with the evidence root set. Case 1 is a Product defect whose closure
is already registered as TD-50, under TD-51's open retention-lifetime
decision. Its test is unchanged and still fails.** The owner site found
here, the per-event dependency selections of the event-calculus fold, is
new evidence for TD-51; the register does not yet name it. Cases 2 and 4
are not Product defects, so the early stop did not apply.

Line numbers in test files are at `a356416eb` unless stated. The
restatements added comment lines, so later lines in the committed files sit
a few lines lower.

No file under `T/code`, `T/contracts` or `T/scripts` changed, and neither
did `T/package.json` or the manifest. Here `T` is
`build_tenants/abiogenesis/typescript`. `npm run build` in `T` leaves no
tracked change.

| Commit | Case | Content |
| --- | --- | --- |
| `7a9747e84` | 3 | basis body compared by equality (RC10 O1) |
| `8b6b85ee0` | 4 | malformed-liveness premise supplied at the RC6 read seam |
| `ee1b12247` | 5 | replay premise supplied at the guard; the case converted to its gate row |
| `2dee4b403` | 2 | prepared read projects after close; catalogue row split from case 1 |
| this commit | | this Return |

## 1. The five cases

"Last pass" and "first fail" are release cuts. Each case was run alone at
each cut, with the root set.

| Case | Failure at head | Last pass | First fail | Reading | Record |
| --- | --- | --- | --- | --- | --- |
| 1 `t287-cross-cut-public-read` "different-cut native Definition reads…" | `:121`, 12,477 reads where 1,053 are expected | rc.9 `e30ac16b4` | rc.10 `93a0de75a` | Product defect, registered | REQ-R-ABG3-PROJECTION-025; TD-50 closure; TD-51 boundary |
| 2 `t287-cross-cut-public-read` "late child proof…" | `:207`, a projection where a refusal is expected | rc.5 `f49e7533e` | rc.6 `e7179b19b` | stale | library design §10.4, RC6 |
| 3 `t287-historical-source-resource` "actual R10 ancestry…" | `:81`, strict identity of the basis body | rc.9 `e30ac16b4` | rc.10 `93a0de75a` | stale | library design §10.12, O1 lifetime (RC10) |
| 4 `r10-projection-contracts` "a prefix holding a malformed liveness event…" | `:148`, `undefined` where `invalid_history` is expected | rc.5 `f49e7533e` | rc.6 `e7179b19b` | stale | library design §10.4, RC6 |
| 5 `t287-governance-covered-source-use` "later completed work…" | `projectCCallPhase` throws | the uncommitted tree of 2026-10-09 | `67c333799`, the first commit with the file | stale | library design §4.4 |

Cuts tested:

- rc.12 `34aafb2c6`, rc.10 `93a0de75a`, rc.9 `e30ac16b4`, rc.7 `27c08ce597`,
  rc.6 `e7179b19b` and rc.5 `f49e7533e`.
- The Phase D commit `fd38e8227`. Every case except 5 passes there.

rc.11 and rc.8 were not needed, because each pass and fail boundary falls
between two adjacent tested cuts. Each file and input pin existed at every
tested cut: every case ran over the same pinned bytes.

Head and rc.12 fail the same way in every case.

| Case | head | rc.12 | rc.10 | rc.9 | rc.7 | rc.6 | rc.5 | `fd38e8227` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | fail | fail | fail | pass | pass | - | - | pass |
| 2 | fail | fail | - | - | fail | fail | pass | pass |
| 3 | fail | fail | fail | pass | pass | - | - | pass |
| 4 | fail | fail | - | - | fail | fail | pass | pass |
| 5 | fail | fail | - | - | fail | - | - | fail |

## 2. Case 1: Product defect, registered as TD-50 and TD-51

The case expects each history read to decode the extent once in 64 KiB
chunks and to read each body once by location:

- reads = ⌈13,540,472 / 65,536⌉ + 846 = 1,053 (`:121`);
- bytes = 2 × 13,540,472 (`:124`).

At head it fails at `:121` with 12,477 reads. rc.10 fails the same way;
rc.9 passes.

### The reads

A probe ran the case's own fixture and Definition calls at head. It
assigned every read on the log to its row.

| Member | Reads | Chunk reads | Body reads | Non-basis rows (809) | Basis rows (37) | Bytes read |
| --- | --- | --- | --- | --- | --- | --- |
| `run_status`, `run_result`, `run_replay` (each) | 12,477 | 207, one pass | 12,270 | each read once | 11,461 reads, at most 809 for one row | 638,565,434 |
| `graph_call_result`, `graph_call_replay` (each) | 93,748 | 207, one pass | 93,541 | each read once | 92,732 reads, at most 4,029 for one row | 4,139,848,395 |

The expected byte count is 27,080,944, so a graph-call read moves 153
times that for a 13.5 MB extent. The decode happens once. Every extra read
is a basis body.

This settles the open point in TD-51's evidence, "that the 2,845 held
re-reads are basis bodies is likely". On this fixture they are all basis
bodies.

### The owner sequence

From captured stacks of the `run_status` basis reads (28 distinct stacks):

1. `RuntimeEventCalculusDerivation.advance` (`abg/event_calculus.ts:247-255`)
   calls `eventCalculusDependencies` once per folded event (`:253`).
2. `eventCalculusDependencies` (`:91`) selects the event's dependencies from
   the cut before it, by key. Its `add` (`:99`) and `addPhysicalDependencies`
   (`:100-104`) call `indexedRuntimeEvents`. So does
   `worksiteSelectedOccurrenceDependencies` (`abg/c_call_outcome.ts:337-341`).
   That stack alone accounts for 7,700 of the 11,461 basis reads.
3. `indexedRuntimeEvents` (`abg/event_prefix.ts:748-749`) runs
   `selection.select(key).materialize()`.
4. `RuntimeHistorySelection.materialize` (`abg/runtime_history.ts:567-571`)
   creates a new selected-body map on every call.
5. `RuntimeHistory.event` (`:316-342`) keeps a basis body only while an
   open run operation scope holds its invocation (`:330-340`). A historical
   read opens no scope, so each call reads the basis body again through
   `readRuntimeHistoryRowBytes` (`abg/event_store.ts:3670`). That function
   checks the file identity and the row digest each time.

The fold reaches this from `projectArtifactTruth` through
`runtimeEventCalculusEffectsByKind`. One captured path enters through the
Definition binding's environment read (`projectExactPrefixWorkspaceEnvironment`
→ `projectOwnedPrefixArtifactTruth`). The graph-call members read about
eight times more; I did not capture their stacks, so the reason for that
difference is not established.

Before RC10, `#verifiedBodies` kept basis bodies too, so each was read once.
RC10's O1 lifetime (`93a0de75a`) stopped keeping them outside a run
operation scope. The per-event dependency selections then turned into
per-event physical reads.

### Classification

Product defect. The sentence it contradicts is REQ-R-ABG3-PROJECTION-025:
"An internal function or role boundary shall not by itself trigger complete
history reconstruction or reauthentication." Each per-event dependency
selection inside one fold re-reads and re-authenticates the same basis rows.

The O1 lifetime does not make the case stale. Library design §10.12 says:
"without a handle the row is checked cold and the history keeps its basis
body only in the consumer-local selected-body map". That sentence lets a
historical read check a basis row cold. It sets no consumer scope as small
as one `materialize()` call, and it does not allow re-checking a row 4,029
times inside one read.

The register holds the closure and the open decision:

- TD-50's closure is this case's assertion: "A cold read authenticates each
  row once; the body-read counter is at most the row count."
- TD-51's boundary rules out the obvious repair: "Do not re-retain basis
  bodies: RC10 released them at the operation lifetime to discharge RC9 F1
  ... A retention-lifetime decision is needed."

The register does not name this owner site. TD-51 lists
`projectOwnedRunReplayContext`, `projectRetainedWorksiteInputAtPrefix` and
the liveness fold. The event-calculus per-event dependency path above is new
evidence for TD-51; recording it in the register is the Executive's call.

The repair is that decision. It means either a selected-body map that lives
as long as one read operation, or a fold that does not materialize its
dependencies per event.

Nothing changed in the case. Its catalogue row was split from case 2's row
(section 7). I added no root-free reproduction: a basis row read twice needs
a run history with basis rows, and TD-50's closure lane already exists as
this case.

The probe is `/private/tmp/abg-td60t-work/probe/probe1.mjs` (per-row read
classifier) with `probe2.mjs` (owner stacks). Its output is in
`/private/tmp/abg-td60t-work/probe2-run_status.txt`. Scratch, not committed.

## 3. Case 2: stale, restated (`2dee4b403`)

### The failure

The case prepares a `graph_call_result` read on the closed-owner
coordinate, changes byte 0 of the scratch log, and then calls
`prepared.project(proof)`. At `:207` it expects `abg_project_read_refusal`
and gets `abg_project_read_projection`. rc.6 fails the same way; rc.5
passes.

### What changed at rc.6

The child declaration callback `terminalDeclaration`
(`abg/project_read_ports.ts:303`) reads `projectExactPrefixWorkspaceEnvironment`
(`:367`).

- At rc.5 that reader called `projectExactPrefixArtifactTruth(prefix)`
  (`abg/environment_admission.ts:489` at `f49e7533e`). That is a cold
  reconstruction, so it read and authenticated the changed log and refused.
- At rc.6 it calls `projectOwnedPrefixArtifactTruth(prefix)` (`:491` at
  `e7179b19b`, `:492` at head). After the owner closes, the exact
  coordinate's retained authenticated selection serves that read
  (`projectOwnedRuntimeHistoryAtDurablePrefix`, `abg/event_store.ts:3611`).

### The record

Library design §10.4, row "Runtime history prefixes and held event
resources", added at rc.6 `e7179b19b`:

> `readOwnedRuntimeEventPrefixAtDurablePrefix` is the explicit fresh read:
> it borrows only an actively owned selection, and a copied or closed-owner
> coordinate is authenticated cold. `projectOwnedRuntimeEventPrefixAtDurablePrefix`
> and `projectOwnedPrefixArtifactTruth` are pure historical projections: the
> exact coordinate's retained immutable authenticated selection serves them
> after its owner closes, and an unbound or copied coordinate is
> authenticated cold.

`T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md` agrees, and has since
`67c333799`, before rc.5. It does not say whether a post-close callback
re-authenticates; the RC6 sentence settles that. "A caller that separately retains the authenticated owner
prefix or validated snapshot keeps its existing immutable post-close reads
and preparation callbacks; close does not purge that evidence."

### The restatement

- `:207`: `prepared.project(proof)` now equals the warm projection
  (`deepEqual` with `warm.value`), where it was expected to refuse.
- The comment above it names the record.
- `:208` is unchanged: a fresh preparation after the change still returns
  `null`.
- Every other assertion is unchanged.

Root set: the case passes, `:208` included. This is the first run of
`:208` at head, because the case used to stop at `:207`. Root unset: it
skips. The file is 5/4/1/0 with the root set (827 s); the one failure is
case 1. With the root unset it is 5/1/0/4.

### What a prepared historical read proves (question d)

At preparation, by reading:

- `prepareRead` (`abg/project_read_ports.ts:686`, read at `:711`) calls
  `readOwnedRuntimeEventPrefixAtDurablePrefix`. For a closed-owner
  coordinate that is the cold read `readOwnedRuntimeHistoryAtDurablePrefix`
  (`abg/event_store.ts:3637`).
- The cold read checks the device, the inode and the path identity, and
  that the file is at least `prefixLength` bytes long.
- `decodeRuntimeHistoryDescriptor` (`:3773`) then reads `[0, prefixLength)`
  in 64 KiB chunks. It checks every row's physical digest and the running
  prefix digest against the coordinate's `prefixDigest`.
- The cold read checks identity again and binds the authenticated selection
  to the coordinate.
- The whole acquired prefix is therefore authenticated byte for byte at
  preparation. The case observes the cold read at `:195` and `:201`
  (reads > 0).

At projection, by reading: `project` re-runs the projectors over the
prepared prefix. The declaration callback is served by the retained
selection. The only physical reads are lazy body reads by location
(`readRuntimeHistoryRowBytes`, `:3670`). Each checks the file identity, the
size and that row's own sha256.

Detection of a one-byte change at unchanged length:

- **Inside the acquired prefix.** The next explicit fresh read or
  preparation detects it through the prefix digest (observed at `:208`, and
  at `t287-historical-source-resource` `:112`). A prepared projection
  detects it only if it lazily re-reads the changed row.
  - Byte 0 is in row 1, a `public_operation_artifact_admitted` body that the
    history keeps, so it is not re-read. The restated `:207` passes
    (observed).
  - A changed basis row would be re-read and refuse at its row digest. That
    is by reading; I did not probe it.
- **Beyond the acquired prefix.** No read of this coordinate detects it,
  because a read requires only size ≥ `prefixLength`. In this fixture the
  prefix is the whole 13,540,472-byte scratch file, so no byte lies beyond
  it.

The case changes a byte inside the prefix, after a closed-owner
preparation, in a row that is not re-read.

### The same-boundary proof (question d)

The 2026-11-06 held-graph interface design (revision 3, S1) is realized as
library design §10.9 (RC7 HS01). Its proof is "complete warm/cold equality
at one committed boundary" (§10.9 Proof, REQ-R-ABG3-PROJECTION-025's last
sentence).

In code it is the `RC7 fixed admission:` case
(`test_env/tests/t287-default-library.test.mjs:2517`):

- It calls `heldReadbacks` before the outer close and `freshReadbacks` after
  it, and compares the typed terminal, the value, the producer and the
  projection basis.
- A held read must return its unchanged entry prefix (`exactReadReceipt`,
  `abg/exact_prefix_bindings.ts:64`;
  `acquiredAbgEventResourceCompletionCorresponds`,
  `abg/definition_event_resource.ts:139`).

That proof compares warm and cold reads of unchanged committed bytes at one
boundary. It says nothing about bytes changed after the boundary, so the
case's mutation is outside it. The design leaves physical mutation to the
explicit fresh read: "Portable close detachment, explicit fresh reads,
physical mutation uncertainty, ... remain unchanged" (recovery design,
"Operational history representation"). The case keeps that check at `:208`.

## 4. Case 3: stale, restated (`7a9747e84`)

At `:81` the case asserted `strictEqual(result.input.value,
f.ancestor.rawInputValue)`. That is reference identity between the
ancestor basis body that the leaf owner returns and the one that a separate
read of the same prefix returns. No run operation scope is open, so under
the O1 lifetime each read decodes its own body. rc.10 fails; rc.9 passes.

The record is library design §10.12, O1 lifetime (RC10), added at
`93a0de75a`:

> Active identity and work reuse are preserved for repeated reads inside an
> open scope; strict reference identity for completed historical calls is
> intentionally not retained, while equality and refusal are.

The restatement changes `:81` from `strictEqual` to `deepEqual`, with a
comment naming the record. `:82` already compared the whole input by
value. No other assertion changed.

Assertions that had not run at head now run and pass:

- `:83` and `:93`: the same live resource returns the same result object;
- `:86` and `:87`: cold copies reconstruct;
- `:110-112`: a closed owner re-reads and refuses a changed byte.

Root set: 4/4 pass (333 s). Root unset: 1 pass, 3 skip.

A residual: the diagnostic at `:115` still reports `borrowedAncestor:true`.
It is not an assertion and nothing reads it. I left it unchanged.

## 5. Case 4: stale, restated (`8b6b85ee0`)

The case stubs `readRuntimeEventsAtDurablePrefix` in `./event_store.js` for
the read owner `abg/project_read_ports.js`. The owner then reads:

- the unaltered rows, which must project;
- the rows plus one malformed `runtime_activity_probe_observed` event, for
  which four reads must refuse with `invalid_history`.

At head the third read returns a projection, so `.code` is `undefined`
(`:148`). rc.6 fails; rc.5 passes.

### Question e: does the stub still intercept?

No.

- At rc.5, `prepareRead` read its rows with `readRuntimeEventsAtDurablePrefix`
  from `./event_store.js` (`abg/project_read_ports.ts:710` at `f49e7533e`).
- At rc.6 it reads them with `readOwnedRuntimeEventPrefixAtDurablePrefix`
  from `./event_prefix.js` (`:706` at `e7179b19b`, `:711` at head). Its only
  import from `./event_store.js` is `captureDurablePrefixCoordinate`.
- Every read in the case therefore projected the real S01 log, and the
  malformed event never reached the owner.

The store-file seam is not available. The S01 log has the legacy profile,
and stamping the probe event under it refuses: "event kind is not in the
selected exact profile". The current profile refuses the S01 log as a whole
(the file's first case asserts that).

The real seam is the module the owner now imports. Supplied there as
`selectValidatedRuntimeEventPrefix(rows)`, the owner behaves as follows:

- the unaltered rows project, and the workspace replay has one effect row
  per event (the positive controls at `:120-125`);
- all four reads over the malformed event refuse with `invalid_history`,
  "ABG project read owner projectors refused the durable event history".
  That is the projector catch of `projectPreparedRead` (`:1848`), which the
  case's comment at `:143-146` names.

The stub was called six times, once per read.

The record is library design §10.4, row "Runtime history prefixes and held
event resources", added at rc.6 `e7179b19b`. It lists "project-read
preparation" among the callers that borrow the owned prefix and names
`readOwnedRuntimeEventPrefixAtDurablePrefix` "the explicit fresh read".

The restatement:

- the stub moves to `'./event_prefix.js':{readOwnedRuntimeEventPrefixAtDurablePrefix:()=>selectValidatedRuntimeEventPrefix(rows)}`
  (already imported at `:14`);
- a comment names the record;
- no assertion changes.

Root set: 11/11 pass. Root unset: 1 pass, 10 skip.

## 6. Case 5: stale, restated and converted (`ee1b12247`)

### The failure

The case loads `abg/invocation_admission` with `./replay.js` stubbed so that
`replayValidatedRuntimeEventPrefix` returns a controlled replay. The
source-result derivation no longer calls that function.
`deriveSourceResultBasisAtPrefix` (`abg/invocation_admission.ts:430`) calls
`projectRuntimeReplayGuard(runPrefix,prefix)` (`:442`) and
`projectReplayCCallGuardAtPrefix(runPrefix, …)` (`:445`).

The real guard runs over the fixture rows, which hold no `c_call_opened`,
and `projectCCallPhase` throws "CCall c-call://covered-source violates the
atomic open/fibre pair or exact phase cardinality".

### History

- The owner changed at `67c333799` (2026-10-21). Its parent `727f1dbca` has
  `replayValidatedRuntimeEventPrefix(runPrefix, prefix)` at `:424`;
  `67c333799` has `projectRuntimeReplayGuard(runPrefix,prefix)` at `:434`.
- `67c333799` is also the first commit with the test file, so the case fails
  at every committed cut. I tested head, rc.12, rc.7 and `fd38e8227`.
- Its last recorded passes are runs of the uncommitted tree on 2026-10-09:
  `work/T287_SANDBOX_UAT_RUN_02/operator/portable-close-handoff-repair-225/commands/focused-02.result.json`
  and `source-repair-governance-covered-source-use-143/commands/focused-04.stdout.log`.

### The record

Library design §4.4, from `c2432eb85` (2026-10-22):

> The body's digest is the replay state witness, computed by the replay
> owner for every guard it derives (`projectRuntimeReplayGuard`) ... and
> stored ... as `sourceReplayDigest` in the invocation source-result basis.

TD-10 (closed at `6071e6936`) moved the remaining narrow readers to the
guard.

### The restatement

- The stub supplies the same controlled replay at `projectRuntimeReplayGuard`.
  `projectReplayCCallGuardAtPrefix` returns that replay's CCall row by
  `cCallRef`.
- A comment names the record.
- No assertion changes. The owner now takes `resultValue` from the result
  row (`:446`), so the replay row's `resultValue` is unused. I left it in
  place.

### Gate conversion

- The case reads its fixture through its own row,
  `governance-covered-fixture-completed-work`.
- The row is now `runs_with_root`, `conversion: done`, `variables: []`,
  `formerVariables: ["ABG_GOVERNANCE_COVERED_FIXTURE"]`, in the shape of the
  sibling row. `recorded` is kept.
- The header comment at `:16-19` is updated, and `completedFixturePath` and
  the variable read are removed.
- The sibling row `governance-covered-fixture` is unchanged.

Results:

- Root set, `ABG_GOVERNANCE_COVERED_FIXTURE` unset: the case passes; the
  file is 9/7/0/2.
- Root unset: the case skips with "evidence gate
  governance-covered-fixture-completed-work: ABI5_EVIDENCE_ROOT unset; …";
  the file is 9/3/0/6.

## 7. Changed assertions and catalogue rows

Lines are at `a356416eb`.

| File | Line | Before | After | Reason |
| --- | --- | --- | --- | --- |
| `t287-cross-cut-public-read` | `:207` | `prepared.project(...)` refuses | equals `warm.value` | §10.4 RC6: a retained authenticated selection serves a prepared historical read after close |
| `t287-historical-source-resource` | `:81` | `strictEqual` basis body | `deepEqual` | §10.12 O1: no strict identity for completed historical calls |
| `r10-projection-contracts` | `:116-118` | stub `./event_store.js` `readRuntimeEventsAtDurablePrefix` | stub `./event_prefix.js` `readOwnedRuntimeEventPrefixAtDurablePrefix` | §10.4 RC6: the owner's read seam moved; no assertion changed |
| `t287-governance-covered-source-use` | `:406` | stub `replayValidatedRuntimeEventPrefix` | stub `projectRuntimeReplayGuard`, `projectReplayCCallGuardAtPrefix` | §4.4: the source derivation reads the guard; no assertion changed |
| `t287-governance-covered-source-use` | `:20-23`, `:265` | `ABG_GOVERNANCE_COVERED_FIXTURE` | `evidenceGate('governance-covered-fixture-completed-work')` | TD-60 gate conversion |

No assertion was removed.

Catalogue (`test_env/support/evidence-gates.json`):

| Row | Before | After |
| --- | --- | --- |
| `d2-continuation-09-store-cross-cut-reads` | `failing_with_input_present`, cases 1 and 2, `suiteSkips` 2 | `failing_with_input_present`, case 1 only, `suiteSkips` 1, note gives the TD-60T reading |
| `d2-continuation-09-store-late-child-proof` (new) | — | `runs_with_root`, case 2, `suiteSkips` 1, same inputs |
| `d2-continuation-09-store-borrowed-ancestry` | `failing_with_input_present` | `runs_with_root` |
| `s01-program-selection-store-malformed-liveness` | `failing_with_input_present` | `runs_with_root` |
| `governance-covered-fixture-completed-work` | `failing_with_input_present`, variable | `runs_with_root`, `conversion: done`, `formerVariables` |

The total of `suiteSkips` is unchanged: 236, equal to the suite base.
`verifyEvidenceGateCatalogue()` with the root set returns:

- `{gates: 137, rowsWithInputs: 40, inputsChecked: 239}` after the commits
  for cases 3, 4 and 5;
- `{gates: 138, rowsWithInputs: 41, inputsChecked: 239}` after the split.

Only `evidence-root.mjs` reads the catalogue. No test checks its titles or
`suiteSkips`.

## 8. Files before and after

Each file was run alone with
`node --experimental-vm-modules --test --test-concurrency=1 --test-reporter=tap`,
`TMPDIR=/private/tmp/abg-td60t-tmp`. Counts are tests / pass / fail / skip.
"Before" is the triaged case only, run alone at `a356416eb`.

| File | Case before, set | After, set | After, unset |
| --- | --- | --- | --- |
| `t287-cross-cut-public-read` | cases 1 and 2 fail | 5/4/1/0 (case 1 fails) | 5/1/0/4 |
| `t287-historical-source-resource` | case 3 fails | 4/4/0/0 | 4/1/0/3 |
| `r10-projection-contracts` | case 4 fails | 11/11/0/0 | 11/1/0/10 |
| `t287-governance-covered-source-use` | case 5 fails | 9/7/0/2 | 9/3/0/6 |

The two skips in the governance file with the root set are its
`ABG_GOVERNANCE_COVERED_PROOF_ROOT` and
`ABG_GOVERNANCE_COVERED_C2_MATERIAL_SELECTORS` cases, which are outside
TD-60T.

## 9. Scratch worktrees

Each was created with
`git -C /Users/jim/src/apps/abiogenesis worktree add --detach --no-checkout`,
a sparse cone of `build_tenants` and `specification`, `node_modules` copied
from this tenant, and `npm run build`. All seven were removed with
`git worktree remove --force`. `git worktree list` shows none of them.

- `/private/tmp/abg-td60t-at-34aafb2c6` (rc.12)
- `/private/tmp/abg-td60t-at-93a0de75a` (rc.10)
- `/private/tmp/abg-td60t-at-e30ac16b4` (rc.9)
- `/private/tmp/abg-td60t-at-27c08ce597` (rc.7)
- `/private/tmp/abg-td60t-at-e7179b19b` (rc.6)
- `/private/tmp/abg-td60t-at-f49e7533e` (rc.5)
- `/private/tmp/abg-td60t-at-fd38e8227` (Phase D)

No other worktree was touched. `abg-td25r` and `abg-td69r`, present when
the package started, had already gone from the list when I removed mine. I
did not remove them.

## 10. Deviations

1. **Lockfiles.** At every cut `package-lock.json` differs from this
   tenant's only in the package's own version string: two lines,
   `5.0.0-rc.N`. The dependency set is identical, so I copied
   `node_modules` instead of skipping the cut. Nothing was installed from
   the network.
2. **Build side effects in scratch worktrees.** `npm run build` at
   `fd38e8227`, `93a0de75a` and `e30ac16b4` rewrote two tracked digest
   files in those worktrees: `contracts/capabilities/capability-definition-graph.json`
   and `product-toolchain-manifest.json`. They were removed with the
   worktrees.
3. **Case 1's row changed although case 1 did not.** The shared row
   `d2-continuation-09-store-cross-cut-reads` could not keep a true status
   once case 2 passed. Following TD-60's split of the governance row, case 2
   moved to a new row. Case 1's row lost case 2's title, its `suiteSkips`
   went from 2 to 1, and its observed text and note were rewritten. Its
   status is unchanged.
4. **Case 4's seam.** The brief suggested a store file. That seam cannot
   hold the event (section 5), so the owner's actual import is the seam.
5. **Tap output written into `T`.** An early run script wrote two tap files
   into `T`. They were moved to `/private/tmp/abg-td60t-work/` before any
   commit, and the tree was clean.

## 11. Residuals

- Case 1 stays red until TD-50 and TD-51 are repaired. TD-51's
  retention-lifetime decision chooses the repair: how long the
  consumer-local selected-body map of §10.12 lives, or a fold that does not
  materialize its dependencies per event. On this fixture a graph-call read moves
  4.1 GB for a 13.5 MB log. Production histories with more basis rows grow
  with rows × basis rows.
- The diagnostic `borrowedAncestor:true` in `t287-historical-source-resource`
  (`:115`) now describes an equal body, not a borrowed one.
- The controlled replay row in case 5 still carries `resultValue`, which the
  owner no longer reads from the replay.
