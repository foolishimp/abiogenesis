# T-287 Wave 1 First Run HoldsAt Implementation Transition

Status: frozen worker implementation subject for independent assessment. This
post is commentary evidence. It does not accept the slice, `A5-F10`, Phase 1,
Wave 1, or any Product outcome.

Transition time: `2026-08-02T04:26:47Z`

## Authority Re-baseline

The implementation was re-baselined from the live local consumer in this
order: repo `AGENTS.md`; `specification/GOALS.md`; `INTENT.md`; `PRODUCT.md`;
applicable ABG and Product requirements; the TypeScript design index; the
operative `ABI5_REALIZATION_CONSTITUTION.md`; active T-287; the sole active
Wave 1 worker bootstrap; and the approved worker/assessor plan.

The selected method remains immutable STDO `v2.2.2`, commit
`0519129d63de10822ae6353fa0c5ce05d56f13e9`, member-set digest
`4cc6a10fca6b1a2c6991664d2a7ee19220401d95f3f1c0f4fa848c6a9ed81c21`.
No mutable `specification_methodology` or T-005 surface was consumed.

The active entity row is Run:

```text
not_open -> active -> closed | stopped | failed
```

ABG runtime-event admission remains the sole transition owner. Typed Event
Calculus over one explicit validated immutable event prefix remains the sole
selected Run-lifecycle projection.

## Exact Subject

```text
repository: /Users/jim/src/apps/abiogenesis-5-root-build
branch: codex/t287-wave1
HEAD: c0859be7fb0c779bf8a95be5b5b3c19e06c046c9
commit created: no
whole tracked worktree diff object: 6670ddfd4620cfa5587bed2221c41f41deb3469e
implementation tracked diff object: 80858192efb2444514ee82d751916b830643c832
event_prefix.ts blob: d37b020223b9927721622ba9b288a87f899c1632
m5-event-calculus-runtime.test.mjs blob: 62e37926457c5f22dcb1817f0176b8db1a89e0ad
candidate-basis fixture blob: c13803903f64863a1b066b34983b859c5a875101
```

The whole tracked diff identity includes pre-existing Product-control edits to
GOALS, T-287, and the TypeScript design index. The implementation diff identity
is computed only over the authorized tracked implementation, package-test, and
derived-candidate files. The two untracked implementation files are bound by
their separate blob identities above.

## Worktree Classification

Preserved Product-control or pre-existing work:

- `specification/GOALS.md`;
- `.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`;
- `build_tenants/abiogenesis/typescript/design/README.md`;
- new `build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md`;
- the renamed sole Wave 1 worker bootstrap, manifesto, approved assessment,
  and other pre-existing commentary.

The worker did not edit those surfaces.

Authorized implementation and proof work:

- `code/src/abg/event_calculus.ts`;
- new `code/src/abg/event_prefix.ts`;
- `code/src/abg/replay.ts`;
- `code/src/abg/runtime_failure.ts`;
- `code/src/abg/index.ts`;
- `package.json`;
- new `test_env/tests/m5-event-calculus-runtime.test.mjs`;
- `test_env/tests/m5-installed-fan-out.test.mjs`;
- `test_env/tests/m5-installed-recursion.test.mjs`; and
- generated exact-candidate digest refresh in
  `test_env/fixtures/abi5-root-candidate-basis.json`.

## Implementation

### Validated immutable event prefix

`selectValidatedRuntimeEventPrefix(events, scope?)` receives no store. It
requires one frozen explicit snapshot, validates total gap-free ordinals,
reuses the existing pure causal-scope selector, rejects unknown or cross-Run
causes, preserves original admission order, and returns a frozen selected
prefix.

`replay` and `admitRuntimeFailure` each take one `store.readAll()` snapshot at
their owning boundary and pass that value through the same prefix relation.
The former local replay ordinal loop is removed.

### Typed Event Calculus

The existing closed M05 event-effect law remains selected. Its current string
coordinates are adapted into immutable typed fluents and patterns without
changing the serialized fluent vocabulary. The pure kernel:

```text
deriveRuntimeEventCalculusProjection(events)
```

receives no store, prefix selector, actor, append port, or caller axiom. It
applies effects in the fixed order:

```text
terminate -> clip -> declip bookkeeping -> initiate
```

It returns canonically ordered immutable holds and effect rows. Identical
dynamic effect members already present in selected M05 route law are
normalized to one key; initiate-plus-terminate contradiction still fails
closed. Each effect row detaches and freezes its source-event copy, so the pure
kernel does not mutate caller input.

The public ABG index exports typed carrier construction, key/match/query,
closed projection, and the two selected Run adapters. It does not export the
prefix relation, module-only law validators, a store-backed projector, or a
caller-configurable axiom seam.

### Consumers and competing-path removal

- `replay` derives `activeFluents` and active Run status from the one typed
  projection.
- `admitRuntimeFailure` requires
  `HoldsAt(run_active(runId))` before its existing append.
- The raw terminal-kind absence scan is removed.
- The copied fan-out and recursion Set folds are removed and use the installed
  closed projection/key API.

No event-store, durable append, transaction, lock, reopen, event contract,
event kind, schema, GTL, validator, HoG, Public, catalog, continuation, retry,
closure, SDK, CLI, qualification, release, or external-dependency
implementation was edited.

## Proportional Proof

The focused lane proves:

- empty/full and Run-scoped prefix selection;
- original order, frozen output, ordinal-gap refusal, unknown-cause refusal,
  and cross-Run-cause refusal;
- closed-law missing/duplicate axiom refusal;
- malformed-pattern and initiate-plus-terminate contradiction refusal;
- pure input non-mutation and immutable detached output;
- `run_segment_opened` initiation and inertia through graph-call/frame events;
- exact Run identity mismatch;
- identical typed projection after durable reopen;
- lawful R9 closure terminates `run_active` and initiates `run_closed`;
- second reopen preserves projection plus replay status/digest;
- `runtime_failure_observed` terminates the exact active Run; and
- admitted `run_stopped` makes a later runtime-failure call throw before both
  memory and durable append.

The optional internal clip/declip injection proof is deferred under Worker
Correction 1 section 5. No selected event in this slice declares clip/declip
effects, and adding an alternate axiom or public test kernel would widen the
closed Product law. The production kernel retains the mechanics in the fixed
fold order.

## Verification Results

Final-subject targeted results:

| Command | Result |
|---|---|
| `npm run build` | pass |
| `npm run test:m5:event-calculus` | pass, 5/5 |
| `npm run test:m5:reopen` | pass, 8/8 |
| `npm run test:r9` | pass, 12/12 |
| `npm run test:m5:fan-out` | pass, 2/2 |
| `npm run test:m5:recursion` | pass, 3/3 |
| `git diff --check` | pass |

The approved full `npm run test:m5` command completed before the final
source-event detachment purity correction. It passed 179 of 185 tests and
failed six. The final correction does not change lifecycle meaning; all
targeted installed lanes were rerun after it and passed. The six full-suite
failures remain diagnosed findings, not accepted proof:

1. `S05 ABG binds each durable Run to its exact admitted invocation` reads a
   static R10 event/transcript proof whose Product-content and manifest
   identities predate the authorized candidate refresh. The reconstructed
   `ProductSemanticsBasis` therefore no longer matches the live generated
   Product. Updating that static proof family is outside the authorized
   candidate-basis refresh.
2. Five installed Consensus failure scenarios first admit `run_stopped`, then
   the Public operation catch path calls the active-only
   `admitRuntimeFailure`. The new query correctly refuses because
   `run_stopped` terminated `run_active`. The thrown guard is then projected as
   a Public refusal instead of the prior failed outcome. Preserving the prior
   Consensus behavior requires a correction to failure/stop ordering or its
   Public/HoG topology outside the approved files and explicit non-changes.

The worker made no out-of-scope correction for either finding.

## Candidate Refresh Evidence

`node scripts/refresh-candidate-basis.mjs` was explicitly authorized as the
derived exact-candidate proof refresh. The pre/post fixture identities are:

```text
pre fixture blob: 40d45a01e532f9817a167f25705ccfbf3fef9c0c
post fixture blob: c13803903f64863a1b066b34983b859c5a875101

pre artifactDigest: sha256:287263398b31ea39b94cd140071f00b3ef372df6f4cdc6df06698ac67bb0673b
post artifactDigest: sha256:70322fa9c07d2dce6178339352530e7b0d4892181921395161d240ee4dfab32c
pre productContentDigest: sha256:6ca5d00ab0cca17080370eafaa744005110ca3cf2114784f195e5037f2d74428
post productContentDigest: sha256:e01f838c942aca0ec3257dda643e9047ca61ca9f2f4df8032f0b27bce29bd42e
pre manifestDigest: sha256:9b72ab3fbfc3a830bf22840ae3587acd0a855cd8ea84353f3a3bad868c376df6
post manifestDigest: sha256:0899a1e4460dd35133478eb8951d852d44efdbdd3cdddacb751c683ec329a889
```

The fixture diff changes only those three derived digests. `kind`,
`schemaVersion`, `productId`, `packageName`, and `packageVersion` are unchanged.
A second refresh over the frozen source reproduced the exact same post values.
No schema or package identity drift entered through the refresh.

## Self-review Verdicts

- Design: not reopened. The implementation remains inside the accepted Run
  lifecycle row and two accepted common-catalog additions.
- Constructability: pass for the bounded kernel, prefix, replay, and admission
  composition.
- Implementation: the selected functions preserve role-bound technology and
  authority seams. No store enters the pure prefix/EC relations; no projector
  appends or selects Product meaning; no duplicate local fold remains in the
  approved consumers.
- Proof: targeted proof passes. Complete full-suite proof is not green because
  of the two diagnosed adjacent integration classes above.
- Advancement: held for independent assessment. The worker does not accept the
  slice or widen into Public/HoG/static-proof repair.

## Additional Adjacent Finding

Two falsifier helpers outside the approved migration list still call the now
typed `eventCalculusEffect` as if its effect members were strings:

- `test_env/falsifiers/runtime-lanes.mjs`; and
- `test_env/falsifiers/runtime-f09-worker.mjs`.

Their later migration should use `runtimeFluentKey`. They were not edited
because the approved plan selected only the fan-out and recursion copied-fold
helpers.

## Assessor Disposition

Pending /root independent review.
