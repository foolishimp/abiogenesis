# Review: ABIogenesis 5.0.0-rc.4 local unqualified cut

Reviewer post. Commentary, not law. Read-only review under the owner's brief
of 2026-11-03 ("RC4 has just been released, i want a thorough review"): no
Product edit, no dispatch, no provider call, no writable runtime call, no push.
Severity S0 (blocks the claim) to S4 (cosmetic). The review fixes the Reviewer
frame of the installed STDO 3.0.2 Executive Baseline over the ABI5 Project
Reference-Frame Basis.

## Subjects evaluated

| Subject | Coordinate | Independently verified |
|---|---|---|
| RC4 source cut | `3c113133d96d013743c1c1ec77d562abb0b2c05b`, tree `6ff1f9c51c…`, branch `codex/rc4-native-recovery` (worktree `abiogenesis-rc4-native-recovery`, tracked clean) | fresh sparse worktree at the commit; rebuilt; packed |
| RC4 release directory | `~/Library/Application Support/ABIogenesis/releases/5.0.0-rc.4/` | `shasum -c SHA256SUMS`: 11 of 11 OK |
| RC4 archive | `abiogenesis-typescript-tenant-5.0.0-rc.4.tgz` `sha256:f59c8ffe…5f70`, 10,971,457 B, 5,321 members | extracted; byte-equal to the install; reproduced from source by `npm pack --ignore-scripts` |
| RC4 install | `…/installs/5.0.0-rc.4/node_modules/@abiogenesis/typescript-tenant`, install id `product-install://@abiogenesis/typescript-tenant/5.0.0-rc.4/41c0540f…/021a96e7…` | installed module re-verified with the Product's own verify, lock and content-match owners; results identical to the stored `verification.json`, `resolved-lock.json`, `installation.json` |
| Cut record | `LOCAL_CUT_RECORD.json` kind `local_unqualified_development_candidate`; published, qualified, tagsCreated, selectorChanged all `false` | read; matches the claim text in `BOUNDED_CANDIDATE_CLAIM.md` and `RESIDUALS.md` |
| Acceptance chain | `.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc4-native-recovery-01/` attempts 001–021, `local-cut-rc4-01/` | read by path (HANDOFF, FINAL_INSTALL_VERIFICATION, INPUT_MANIFEST, installer, receipts, attempt-021 ROOT_FINAL_ACCEPTANCE, C2_OBSERVED_SUMMARY, CLOSURE_OBSERVED, PROVIDER_MEASUREMENTS, SETUP_TIMING_COMPARISON) |
| Campaign event log | `runtime-003` closed prefix, 879,927,317 B at attempt-021 closure | census by kind, aggregate and Run (own scripts) |
| Code delta RC3 → RC4 | `bcb1faf63..3c113133d`: 35 code files, +2,868/−418; 28 contract files, +309/−26; design diff 858 lines | every hunk read |
| main | `f63f030b9`; RC4 is not an ancestor; merge-base `5b793c65e`; no tag `v5.0.0-rc.4` | `git` |

Authority loaded: repo `AGENTS.md`, `specification/GOALS.md`, `PRODUCT.md`,
`T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md`,
`T287_NATIVE_WORKSPACE_WORK_DESIGN.md`,
`T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md`, `DEFECT_DISPOSITIONS.md`,
`CURRENT_T287_SELECTION.md`, the RC3 `F4_DEFERRAL.md`.

## Verdict

RC4 is what it says it is: a correct, reproducible, bounded local unqualified
cut. The archive, the install and a clean rebuild of the committed source are
byte-equal where the claim says they are; the installer's own checks re-run
identically; the record claims nothing it does not hold. The RC3 findings that
mattered are repaired on this path (F1 pin, F2 fixture, F6 residue, F7 scope).

RC4 is not a release and the record does not yet carry a release. Two gaps
stop a 5.0.0 claim, neither a Product defect found by this review:

1. the cut lives on an unmerged, untagged side branch and its entire
   acceptance chain is untracked on main (S3, scope);
2. the retained-route body copy deferred at RC3 (F4) fired its own trigger on
   the first real workload and is now 18.6% of the campaign log (S3, design
   decision pending).

A third gap is closed by this review's own run: the final 23-file code delta
after the last full owner-chain test run was accepted on a narrower lane set,
so the record lacked a green owner chain on the shipped code. Every recorded
lane is green on a clean build of the shipped tree once the environment holds
the tracked fixtures (lane table under "Executed"). What remains is a record
gap (S4).

The code delta is clean work inside the existing owners. The pending-execution
arm, the impact relation, protected write roots, retained-source body carriage
and the typed call population all do what the design says, fail closed, and
add no store, service or second event stream.

## Findings, ranked

### A. Unmerged, untagged, untracked (S3, certain, scope)

- Coordinate: `3c113133d` on `codex/rc4-native-recovery`; main `f63f030b9`
  has no Product code change since the merge-base `5b793c65e`; main's working
  tree holds modified `specification/GOALS.md`, the T-287 ticket,
  `rc3-dogfood-01/NEXT_ACTIVATION_LIMITS.md`, `OVERNIGHT_STATUS.md`, and the
  whole `rc4-native-recovery-01/` tree untracked.
- Consequence: the only durable statement of RC4 is a directory under
  `~/Library/Application Support` plus an untracked workspace. A `git clone`
  of main cannot find the cut, its claim or its acceptance.
- Correction: commit the acceptance chain by path (on the branch or on main,
  owner's choice), record the cut commit in the ticket, and either merge the
  branch or state in GOALS.md that main stays at `5b793c65e` until the merge.
  Tagging is the owner's call; the record says `tagsCreated: false` honestly.

### B. No recorded owner-chain run on the shipped code (S4 after this review's run; S3 as found)

- Coordinate: the last full focused, affected and artifact lane run is
  attempt-011 at `4fda33bb6` (focused 127 tests, 115 pass, 12 skip; affected
  111/105/6; artifact 2/2). Since then: `4fda33bb6..1100bd8f2` changes 23
  code files (+1,969/−341); `1100bd8f2..72eea8f0c` is the rc.4 identity pair;
  `72eea8f0c..3c113133d` changes no code. Attempt-018 at `1100bd8f2` ran 12
  C2 commands (source-correspondence over five binding and intake tests,
  type-proof, installed-bootstrap-read, installed-pending-retained,
  current-intent, selected-action, artifact, uat-harness, plus toolchain,
  seeds, build and package) and attempt-021 ran 10 (harness 32, raw 3,
  physical 2, installed-language 1, identity-inventory, plus the same five
  preparation commands). Neither ran the focused owner chain or the affected
  owner tests.
- Consequence: the event-body, worksite-command, governed-context, cold-record
  decoder, store-reopen, calculus-state-transfer and route-cursor lanes have no
  recorded result on the code that ships.
- Executed here: the full lane set on a clean build of `3c113133d` (table
  under "Executed") is green. Focused: 115 pass, 0 fail, 12 skipped, the
  attempt-011 tally exactly. Affected: 107 pass, 0 fail, 6 skipped, two more
  tests than at `4fda33bb6`, both green. Pending-retained: 3 of 3.
- Correction: cite a run of these lanes on `3c113133d` in the acceptance
  chain (this post serves until the owner records one).

### C. F4 retained-route body copy is now material (S3, certain, design)

- Coordinate: RC3 `F4_DEFERRAL.md` deferred the copy on a capsule of
  163,413 B, 0.673% of a 24,293,608 B basic-cli log, with the trigger "next
  selected heavy actual workflow".
- Measured on the campaign log at attempt-021 closure:

  | Scope | `traversal_route_admitted` bytes | Share |
  |---|---|---|
  | whole `runtime-003` prefix (879,927,317 B) | 163,410,528 | 18.6% |
  | the cut Run (125.2 MB; 28 route events) | 36.8 MB | 29% |

  Result bodies in the same Run: 74.4 MB across 19 events. Per-Run closed
  logs across the campaign range 45–329 MB against the B11 baseline of
  1.34 GB, so F5 (log mass) is measured and improved, and the remaining mass
  is route copies plus Result births.
- Consequence: the deferral's own trigger has fired; the capsule basis was
  unrepresentative by two orders of magnitude.
- Correction: an owner decision, not a patch. Either the route carries an
  admitted-member reference like the Result path (a `design_reframe` of the
  route carrier; the P1 reference mechanics already exist), or the deferral
  is re-recorded with the new numbers and a new trigger. Not a reason to
  re-cut RC4; it is a reason not to call RC4 5.0.0.

### D. Small items (S4)

- `build_tenants/abiogenesis/typescript/release-claim.md:1,3,13,14` still
  names `5.0.0-rc.3`. The file is not in the archive `files` list, so nothing
  shipped is wrong; the source tree contradicts its own package version.
- `specification/GOALS.md:22,28,42` carry three "Current selection" headings
  (one current, two historical) and attempt history in the live surface.
  Active surfaces stay present tense; history belongs in the ticket or a post.
- The C2 recipes depend on `rc3-operator-inputs/` and `rc4-operator-inputs/`
  (20 directories), untracked in the rc4 worktree; the attempt-021 seeds
  differ from tracked `contracts/` in 26 files. A re-run from a clean clone
  cannot reproduce the recorded C2 chain without them.
- `npm run lint` without a recipe argument crashes with
  `ERR_INVALID_ARG_TYPE` from `scripts/lint-verification.mjs:5` instead of a
  usage message. Not in the recorded C2 set; found by this review's runner.
- `abg/event_prefix.ts:830` `readable` on `WorksiteContextBodyUse` has no
  caller; only the resolver reads it (`:966`). Dead contract surface since
  RC3 (F8).
- `abg/construction_continuation.ts:181` throws `TypeError` on duplicate
  pending-execution use admissions, where every other anomaly in the same
  projection yields no candidate. Inside an owner it becomes a stage fault;
  from `populateRunContinuationAtDurablePrefix` it propagates as a throw.
  One fail mode would be cleaner; no path produces the duplicate today
  because `selectPendingExecutionUse` refuses on the first use.
- The default-library, fulfillment and governed-context tests read their
  fixtures from `.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/`
  and from `specification/PRODUCT.md`. The commentary surface is not a
  fixture surface by the repo's own rule, and a tenant-only checkout cannot
  run its own owner lanes (the environment note above).
- Attempt-020's `symlink_forbidden` native failure (event 36055) was caused
  by operator-created links (`SYMLINK_CLEANUP.json`), not by the Product.
  The record says so; repeated here so nobody reopens it as P-class.
- 019's "red" was not a C2 red: `C2_BUDGET_READINESS.json` records
  `fits: true` (required 1,096,750 ms against limits 4,500,000 and
  5,400,000 ms). 019 r1 stopped on zero-provider operator refusals and r2 was
  dispatched; 020 then repaired the setup proof. No Product finding.

## RC3 findings on the RC4 path

| RC3 | Status at `3c113133d` | Evidence |
|---|---|---|
| F1 stale C2 source pin | repaired | `gtl/worksite_command_execution.ts:36–40` pins `sha256:89dbe9ba…7f3c`/118,773 B; equals the archive's `build/code/src/product/worksite_command_execution.js` and `contracts/worksite/command-execution-context.inventory.json`; `npm run build` passes and regenerates the manifest |
| F2 fixture line | repaired | `t287-event-body-encoding.test.mjs:12` imports `validatedRuntimeEventPrefixBeforeEvent`; lane result in the table below |
| F3 identity formula under unchanged schema | declared | `design/T287_NATIVE_WORKSPACE_WORK_DESIGN.md:297–303` states the pre-P1 boundary; `product/worksite_effect.ts` keeps `schemaVersion "5.0.0"` |
| F4 route copy | open, trigger fired | finding C |
| F5 log mass | measured | per-Run 45–329 MB vs 1.34 GB; finding C table |
| F6 `inSourceContextCarriage` residue | removed | absent from `abg/native_work_reacquisition.ts` at RC4 |
| F7 53-path completion scope | narrowed | the P1 close used the bounded set; RC4 adds R1–R5, HC1, HC2 on top |
| F8 dead `readable` | open | finding D |
| F9 disk | resolved | 92% used, 158 GiB free after this review's scratch worktrees were removed |

## Code delta, inspected by owner

Every hunk of `bcb1faf63..3c113133d` under `code/src` was read against the
design. Observations, no defect unless marked:

- `abg/construction_continuation.ts` (+411): `derivePendingExecutionContinuations`
  walks root → child chain over admitted basis, frame, call, foldback and
  route facts; any ambiguity (two open calls, two unfolded children, two
  routes to one cursor, a basis under the pending call) yields no candidate.
  Identity is the hash of the body including `causedByEventRef`. Only
  `undispatched` is resumable; `selectPendingExecutionUse` refuses
  `effect_unknown` with `replay_mismatch` before comparing the cursor. The
  cold validator `projectPendingExecutionOperation` re-runs the same predicate
  at the operation's own predecessor. `rematerializeAdmittedBasisGraph` is now
  the one rule for all three continuation preparations.
- `hog/graph_execute.ts` (+215), `hog/recursion_lifecycle.ts`: restoration
  rematerializes each child level and checks basis digest, class, parent call,
  parent basis, parent scope and run; workflow returns reuse
  `rehydrateParentReturnFrames`; recursion returns use the new
  `rehydrateOwnedRecursionChildFoldFrame` (exactly one `c_call_judged` for the
  child's input, non-terminal decision, attempt below bound, child digest
  equals the restored Result). Parent frames are restored with
  `structuralOrdinal: 0`, the same convention as the construction-resume path
  at `graph_execute.ts:809`. The deepest frame re-enters only the admitted
  pending cursor and its progressed input.
- `abg/traversal_cursor.ts`: cold read of the recursion re-entry route (same
  term, attempt + 1, input = the consumed foldback's child Result).
- `abg/native_work_effect.ts`, `abg/native_worksite_execution.ts`,
  `abg/calculus/axioms.ts`: one impact relation `changedPaths ∪ (W \ R)`,
  unknown after-state impacts all of W. Checked by hand on three cases (path
  outside R under W; path inside R not changed; subtree root over R): all
  conservative in the right direction. `product/native_workspace_work.ts:88`
  drops the old requirement that W lie within R, as the design says.
- `product/worksite_operations.ts` `checkWorksiteWriteRoots`,
  `product/worksite_effect.ts` `protectedWorksiteWriteRoot`: planned W against
  binding roots by declared path and by resolved location, install roots by
  resolved location, links at any existing component refuse. Called from
  `implementation/native_workspace_work.ts:112–122` before observation and
  dispatch; refusal is by throw, consistent with the adjacent authority checks.
- `abg/event_prefix.ts` (R2): own-Run holder preferred; a holder in another
  Run is used only when `sourceUseDeclaresMember` finds the exact member in a
  selected native Result's admitted task context; the resolver applies the
  same check after byte verification. `abg/invocation_admission.ts` keeps the
  producer's Run coordinates on a retained source.
- `abg/instruction_assembly.ts`: a `binding` section (Run, invocation, root,
  start, executing GraphFunction, declared recursion, predecessor) with
  `bindingDigest` in the assembly identity; a null binding fails closed to
  `unknown_dependency`.
- `public/binding/owner_contract_source_set.ts`,
  `public/installed_definition_call_transport.ts` (HC1): type-level family
  of 56 members from the existing source relation; the type-proof lane is the
  check.
- `abg/project_read_definition_bindings.ts`, `owner_bindings/run_invocation.ts`,
  `product/run_invocation_operation.ts`,
  `public/installed_public_definition_call.ts` (HC2): population shares the
  select-resolve-prepare sequence and the expected-slot constructor with the
  owners; `checkedInstalledCall` admits the constructed call through
  `admitExactDefinitionCall` before it is typed; a pending-execution selection
  populates the `current_intent` member with the `pendingCursor` variant.
- Contracts: `run/continue/request.schema.json` gains the union;
  `native-runtime-observation.json` +85 lines; new
  `contracts/governed-context/host_adapter.py` (GC03 bridge, `-I -S -B`,
  inventory and member digests verified, JSONL protocol). Not executed here.

## Executed

| Step | Result |
|---|---|
| `shasum -c SHA256SUMS` in the release directory | 11 OK |
| installed module re-verify (own `verify_rc4.mjs` over the Product's verify, lock, install, content-match owners) | identical to the stored records |
| archive extract vs install | 5,321 members byte-equal |
| fresh worktree at `3c113133d`, `npm run build` | passes; 793 build members, manifest, graph and `package.json` equal the archive |
| `npm pack --ignore-scripts` from the rebuilt tree | digest `f59c8ffe…5f70` reproduced |
| predecessor archive `4589f5c5` (attempt-018, `1100bd8f2`) vs RC4 | 6 files differ, all identity or generator output |
| event-log census (`census.py`, `census2.py`) | finding C numbers |

Lane run on the rebuilt `3c113133d` tree, `env -i`, no network, no provider,
`TMPDIR` under the scratchpad:

| Lane | Source of the recipe | Result |
|---|---|---|
| `lint:imports` | mine | OK (28 shared modules; 3 forbidden pairs hold) |
| `lint:lifecycle` | mine | OK (290 modules; 7 allow-listed sites) |
| `lint:calculus` | mine | OK |
| `lint` | mine | not applicable: needs a recipe argument (finding D) |
| `lint:evidence` | mine | not applicable: needs the repo's `.ai-workspace/evidence/TREE_MIRROR_INVENTORY.json`, absent from the sparse worktree |
| `test:unit` | mine | 84 tests, 78 pass, 0 fail, 6 skipped |
| UAT harness, full | attempt-021 `harness` | 32 pass, 0 fail |
| 011 focused owner chain | attempt-011 | 127 tests: 115 pass, 0 fail, 12 skipped (see the environment note) |
| 011 affected owner tests | attempt-011 | 113 tests: 107 pass, 0 fail, 6 skipped |
| 011 artifact tests | attempt-011 | 2 pass, 0 fail |
| 018 type-proof | attempt-018 | 6 pass, 0 fail |
| 018 installed-bootstrap-read | attempt-018 | 3 pass, 0 fail |
| 018 installed-pending-retained | attempt-018 | 3 pass, 0 fail (54 s recursive-workflow resumption through the cold `pending_execution` arm) |
| 018 current-intent | attempt-018 | 1 pass, 0 fail |
| 018 selected-action | attempt-018 | 1 pass, 0 fail |
| 018 uat-harness | attempt-018 | 4 pass, 0 fail |
| 021 identity-inventory | attempt-021 | `RC4_IDENTITY_PAYLOAD_AND_INSTALL_VERIFIED` against archive `f59c8ffe…5f70` |
| 021 harness | attempt-021 | 32 pass, 0 fail |
| 021 raw | attempt-021 | 3 pass, 0 fail |
| 021 physical | attempt-021 | 2 pass, 0 fail |
| 021 installed-language | attempt-021 | 1 pass, 0 fail |

Environment note. The first run of the focused, affected and pending-retained
lanes was red for environment reasons only: 24 tests read fixtures under
`.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/` (tracked, 31,867
files) that my sparse worktree lacked; five bound Unix sockets under a scratch
`TMPDIR` longer than the 104-byte `sun_path` limit (`listen EINVAL`); one read
`specification/PRODUCT.md`. With the tracked fixture tree and `specification/`
added to the worktree and `TMPDIR` in the user's private temp directory (the
recorded recipes set none), all pass. No Product code changed between runs;
the `GC03 real owner allowed denied cold tamper` test passed on its own third
run after the `specification/` add, so the focused tally above counts it green.

## Claim classification

| Claim in the record | Class |
|---|---|
| archive, install and source correspond | verified here |
| installer checks (manifest digests, tool realpaths, HEAD, clean diff, confinement) | re-run here, identical |
| R1–R5 accepted at `1100bd8f2` (practical-witness-005) | read; the pending-execution recovery was exercised with a scripted model stand-in, as the design states |
| HC1 typing, HC2 population | code read; lanes above |
| provider measurements (selector 2.81 USD, Construction 48 turns 3.57 USD) | read, not reproduced; no provider call in this review |
| "not a causal benchmark" on setup timing (48.2 s vs 18.8 s warm control) | agreed; the record already says so |
| qualified, published, tagged | claimed false; true |

## Limits

- No provider call, no native actor, no `odd_glc` scenario. The runtime
  lanes above are deterministic scratch installs and harness fixtures.
- The GC03 host adapter was read, not run.
- The design's own open items stand as written: scripted stand-in for the
  model process, `entryRouteRef` unexercised, `effect_unknown` not resumable,
  a Root installed witness still required before any 5.0.0 claim.
- Same-family limit: this reviewer and the RC4 constructor's reviewers are
  Claude-family models; the Codex side was not read, by standing instruction.

Scratch: `scratchpad/rc4_review/` in this session (`archive/`,
`verify_rc4.mjs`, `census.py`, `census2.py`, `run_lanes.sh`, `rerun_lanes.sh`,
`lanes.log`, `lanes2.log`, `code.diff`, `design.diff`, `contracts.diff`); the
`subject/` worktree was removed after the runs. Repository unchanged except
this post.
