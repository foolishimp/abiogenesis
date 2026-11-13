# Root selection: complete the affected common-library caller migration

This is the owner's explicit T-287 continuation under the outcome and authority
in [CONTEXT_AND_CAUSAL_MAP.md](CONTEXT_AND_CAUSAL_MAP.md). Read that whole map
before this increment. The selected predecessor is immutable RC5 f49e7533e.
The isolated successor is `/Users/jim/src/apps/abiogenesis-single-address-space`,
branch `codex/single-address-space-consolidation`. No new release is selected.

## Product and integration disposition

The fixed ABIogenesis Product requires one ABG-owned event stream and lawful
native work, effects, admitted results and fresh replay. Internal same-address-
space work already has owner-issued prefixes, authenticated instruction facts,
body references and acquired-resource lifetimes. The common library design
§§9.1,10.4,11,13 already selects reuse. The changed layer is realization and
affected HOW/caller documentation, not Product, requirements or serialized
Public semantics. The observed problem is incomplete use of existing owners.

The independent max source audit of frozen f49 found:

1. `abg/native_work_reacquisition.ts:222,265` uses the expanding
   `authenticateNativeInstructionAssemblyBasis` although neither caller consumes
   its `events` output. `authenticateOwnedNativeInstructionAssemblyBasis` exists
   and supplies their required facts without that complete-history output.
2. `abg/runtime_liveness.ts:72,88,143,394` uses readAll→validated-prefix rather
   than `selectRuntimeEventPrefixFromStore`. Its three last-ordinal reads can
   use `runtimeEventPrefixExtent` instead of obtaining the last payload.
3. Graph-application, continuation, open-call, c-call and traversal-route owners
   contain equivalent direct readAll routes. The complete affected caller
   census must classify each as migrate, legitimately complete output, raw/cold
   input, or canonical in-memory fallback. A test alone is not a supported
   consumer justifying a leftover adapter.
4. Maintained `test_env/uat/public-setup.mjs` closes/reopens successive direct
   calls although `runInstalledDefinitionCallWithResource` and the existing
   acquired resource support borrowed ownership. Preserve actual final close,
   failure cleanup, cold reopen and authority/currentness; do not add a session
   manager or alternate invoker.
5. `implementation/default_library.ts` hashes input again although the native
   invocation port supplies the checked input digest. Bind the exact call
   contract before replacing the duplicate. Preserve ingress and output checks.

Reviewer `/root/rc5_method_review` returned these read-only findings; no code or
test execution was performed by that reviewer. Its suggested six-call first
increment is useful sequencing, but Root does not accept that subset as closure
of the owner's complete affected-path request. The full map and remaining
callers must remain in the same native work/acceptance context.

## Measured discriminator and root cause

The exact closed RC4 log and ordinal23799 are bound in the causal map. Root's
read-only [measurement](owned-history-r1/OWNED_HISTORY_MEASUREMENT.json) imports
the installed RC4 owners without acquiring append ownership or changing source.
Actual process session40705 completed exit0, chunkbcf0b7; log hash unchanged.

| Path at the same historical cut | Wall ms | Physical bytes read | Result |
|---|---:|---:|---|
| Cold readonly authentication, separate |14835.474|666189062|Authenticated 25016-row history|
| Existing owned prefix + first frame context |1963.666|51567041|Exact context|
| Full-history materialization + new validated prefix |6891.170|425363929|Expanded prefix|
| Frame context from expanded prefix |248.259|0|Same exact context|
| Existing owned prefix + repeated frame context |0.252|0|Same exact context|

Expanding prefix checks call `isImmutableRuntimeValue`4,559,844 times and
`sha256Canonical`11,674 times. Instrumented heapUsed moves293.5→797.1MB in that
phase. CPU samples locate canonical writing/hashing and immutable-value walks.
These are not source-reported guesses: the identical result was compared in the
same process. Inspector affects absolute timings. First projection still reads
needed history; warm reuse retains its existing supported calculation. This
proves avoidable repeated acquisition/work for this path, not the CPU share of
every event-log silence, and it does not promise a total-workflow speedup.

The first diagnostic incorrectly required non-null CCall context for an F_P
fibre, where the existing relation deliberately returns null. Its failed
assertion and profile remain preserved. The corrected run projects the frame
actually named by event23800. [Exact operator triage](OWNED_HISTORY_TRIAGE_01.json).
No Product defect or failed candidate is inferred from that diagnostic mistake.

## Selected native construction and permitted solution space

One native coding Worker should complete the equivalent internal caller
migration, required narrow type/owner plumbing, explicit retirement, affected
documentation and meaningful proof in the existing libraries. Work starts with
the measured history bypass and follows its actual producer/consumer cone.
It also completes the supported supplied-digest and borrowed-resource caller
paths where the established contract fits. The Worker may choose implementation
order and helper placement, but must not create another generic layer, store,
registry, event writer, authority brand or cache. Shared mechanics remain at
their current canonical owners; ordinary callers consume them.

If an existing owner cannot preserve the required result, stop that dependent
change and return the concrete relation/counterexample for Root triage. Do not
silently substitute a weaker check, semantic summary or a second implementation.
Explicit full-output APIs and genuine cold/raw/mutable boundaries stay distinct.

The large observed read set and UAT search are operator/caller preparation work
in the same causal map. Do not pass old archives, entire event/helper bodies or
unrelated history as ordinary task context. Retain exact locators and hashes and
read the required source/evidence through their existing owners. Required
compilation and test inputs remain complete. Every included input group needs
an actual consumer; every omitted large member retains its custody route.

The new campaign uses immutable installed RC5 and the maintained SDK setup path.
Until its caller change is built and proven, the initial setup uses the existing
released path, with setup timing separate. This is not silent reuse of a dirty
builder or a claim that the candidate already improved startup.

## Closure and continuity

The native task and independent review must retain the original outcome, all
R1-R7 rows, the five concrete bypass families above, and the full affected caller
map. New facts refine this carrier; they do not replace the objective with the
latest local symptom. Return per row: measured cause, canonical owner, migrated
callers, deleted path or concrete retention reason, proof and remaining limit.

Use focused affected owner tests, an actual installed producer→consumer/reopen
path and identical-input captured-history measurements. Preserve task/context
values, event/results, stale/copied/foreign/rollback refusals, post-effect
observation and resource closure. Measure setup, actor launch, between-task,
wrapper and cold read costs separately. Count repeated materialization, reads,
hashing/encoding and worksite observation rather than accepting a wall-time-only
claim. Inspect the complete frozen delta once at max alongside C2. Reuse all
still-valid RC5 evidence; whole qualification is not repeated.

Root alone conjoins acceptance. A smaller payload, helper refactor, local pass
or one migrated call cannot close this whole request. Unknown causes remain
explicit; no manufactured all-clear, new release or speculative cleanup follows.
