# ABG sandbox UAT

The six original language workloads and full Data Mapper are independent test
inputs under `test_env/fixtures/sandbox-uat`. They are excluded from the ABG
package. The runner uses the current Public installer and an ordinary external
test consumer selecting the published default Executive/lifecycle library.
It imports no odd_glc runtime, controller or test helper.

From this TypeScript tenant:

```sh
node scripts/sandbox-uat.mjs list
node scripts/sandbox-uat.mjs preflight --config test_env/uat/config.example.json --all
node scripts/sandbox-uat.mjs prepare --config test_env/uat/config.example.json --case basic-cli
node --test test_env/uat/harness.test.mjs
```

The same entrypoints are available as `npm run test:uat:list`,
`test:uat:preflight`, `test:uat:prepare` and `test:uat:run`; put the runner
arguments after `--`. `npm test` runs current local owner regressions and
the harness checks without rebuilding or dispatching a model. Installed
language, package-boundary and full conservation checks have separate
`test:installed:language`, `test:boundary` and `test:m5:conservation` routes.
The explicit `test:public-groups` route requires both
`ABI5_PUBLIC_GROUPS_PACKAGE_ROOT` and `ABI5_PUBLIC_GROUPS_BASELINE`; it is
outside the default test selection.

Copy the example to an explicit operator configuration, set the actual package,
source revision metadata, interpreter/toolchain paths and selected provider model.
`sourceCommit` must be nonempty; the immutable archive digest selects the
candidate, while this field records its source history without a Git lookup.
Provider dispatch is
disabled in the example. With the selected provider enabled, these commands
perform native work and can incur provider costs:

```sh
node scripts/sandbox-uat.mjs run --config /absolute/operator-config.json --case basic-cli
node scripts/sandbox-uat.mjs run --config /absolute/operator-config.json --all
```

`provider.maxTurns` and `provider.maxBudgetUsd` are optional. When supplied,
they must be positive and their corresponding Claude flags are passed; omission
passes neither flag. The disabled-provider example uses a finite recursion bound
of 1000, actor idle/absolute limits of 18030000/18040000 ms, and a driver limit
of 18060000 ms. For the declared five-hour session, Root monitors the global
execution deadline from actual native execution start. At 18000000 ms, or
earlier based on observed progress, stop owned C2 helpers/commands before
providers while the CLI is alive. Resolve each admitted occurrence/task/attempt
to its exact launch/helper arguments and live PID/PGID ancestry. Helper TERM/INT
stops its detached active command, but a result artifact is not guaranteed;
preserve its actual absence. Then stop providers using existing group supervision.
The additional 30/40/60 seconds cover drainage only; recording and setup grace
cannot extend execution. This caller policy adds no runtime watchdog or planner.
An explicit `commandTimeoutOverrides` object maps declared command IDs to
positive effective timeouts. The acquired request remains byte-identical; a
small archive record retains the timing delta. An instruction added to the
existing work orders declares the latest user timing authority while preserving
historic acquired operational metadata. The existing independent
checker compares the actual effective command plan, preserving all predicates,
argv, environment, report, depth and mutation obligations.

To continue supplied material in a fresh Run:

```sh
node scripts/sandbox-uat.mjs resume --from /absolute/sealed-archive --config /absolute/operator-config.json --case data-mapper-full
```

The configuration selects `resumeEvidence.observation` and `.freeze` using
explicit file paths and SHA-256 digests. The original four inputs are acquired
again; only authenticated retained author files within the original write
grants are copied into the new clean worksite. The runner checks both ends of
the transfer, rejects symlinks or existing destinations, and records provenance.
The sealed source archive and event file remain unchanged. This is ordinary
fresh supplied-work invocation with source `none`, empty observations and null
synthesis, not restoration of old parents or reuse of old producer credit.
Actual current observations, commands, independent UAT, fresh reads and the
original complete oracle are still required. Preparation grants do not authorize
native execution; Root releases it after the frozen subject's independent review.

`prepare` creates a fresh source-blind bootstrap from the selected immutable
archive, then current Public DefinitionCalls verify, resolve and clean-install
ABG and the external test declarations, create/bind the workspace, admit/narrow
the catalog, check the selected Program and resolve its lifecycle input. It
performs no provider dispatch and earns no application UAT pass. `run` prepares
a new sandbox and invokes one native default-library composition; the harness
does not schedule its semantic stages or author runtime events.
The unchanged trusted-bootstrap Product API checks both retained admitted
installed payloads immediately before dispatch and again afterward. Any false
or missing owner result refuses before fresh installed CLI reads or importing
the installed Product, with both small identity/check records archived. Runtime
metadata agreement alone cannot establish unchanged installed files.

Each command writes a new scenario-first timestamp/UUID directory under the
configured stable archive root (by default, `test_env/test_runs/sandbox-uat`).
It retains package/source identities, install
and installer receipts, request/result JSON, all CLI stdout/stderr, the actual
worksite, native actor archives, event file and genuine closes. A completed
Run receives separate fresh CLI result/replay reads with unchanged event bytes
and matching terminal Result/producer/value. Native independent UAT and the
separate local full-worksite oracle must both support all original obligations.
Missing evidence, a refusal or unmet criteria stays non-green.
For an actual `admitted_source_result` invocation, the caller uses the installed
ABG admission owners at the exact authenticated prefix to identify the current
invocation and its Run binding. Native admission already checked its immutable
source basis. Only original C2 Result/call tuples in that retained governance
state may join earlier-Run observations into the independent oracle; exact owned
event identity and the published C2 judgment remain required. Supplied JSON,
unrelated historical observations and copied rows earn no source-use credit.
Original command/report/mutation guards and fresh whole-outcome UAT/closure still
apply; historical assessment never completes the new Run.
Each run also retains the exact acquired manifest and selected authenticated
source/rubric/request/checker bytes under `oracle-inputs/`, before dispatch.
The independent checker is imported from that archived snapshot after its
manifest and asset pins are checked again. Its relative acceptance reads stay
in the archive; later changes to the ambient fixture tree cannot change the
selected judgment. Other scenarios and build caches are not copied.

No automatic cleanup deletes sandbox or evidence. `summary.json` and
`SEALED.json` terminate each new archive; later commands use new paths. A first
integration refusal stops the selection and is returned with its exact stage
for owner triage. Preparation and local checks do not establish live provider
reachability, repeatability, release qualification or human acceptance.
The installer manifest is the canonical artifact-truth projection selected
by the actual Public install receipt and durable prefix; it is not a guessed
`installer-manifest.json` file in the installed package.

Data Mapper retains every original stage, depth and mutation obligation. The
source's 28 actual stage rows and legacy 26-stage wording remain recorded;
the final preparation document alone cannot establish its application output.
The configured JDK environment must match executed SBT command bindings.
