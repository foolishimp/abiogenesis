# ABG-owned sandbox UAT setup — 6 October 2026

Owner request: remove obsolete tests without a current purpose; acquire the six
Hello World test workloads and full Data Mapper workload from odd_glc; run them
under ABG's own clean-deployment sandbox UAT harness without depending on
odd_glc. These are test inputs and acceptance oracles, never Product features.

Root Writer activation `T287_SANDBOX_UAT_PLAN_01` permits this new record only;
Root returns to Executive after writing it. Canonical checkout is
`/Users/jim/src/apps/abiogenesis`, main@55a8a452141caf180ea6cee6365d2a1bfb9da34e;
the existing dirty tree and accepted Hello expunction are preserved.

Root Writer activation `T287_SANDBOX_UAT_SELECTION_01` permits the current
selection paragraph in `specification/GOALS.md` and current routing fields in
T-287 only. Preimages: GOALS `73e2a0af4a6c98f6468e26cd70f3a4fd8f1e5198669c26a4c6ee2995c9bbce6d`;
T-287 `2f52ef0e10402da28edaed8105173f4c369ab468282c62468ff50c896a4aa19b`.
It records the latest owner request and closes the stale expunction activation;
it grants no Product, production code, historical evidence or release changes.

Root Worker activation `T287_SANDBOX_UAT_ARCHIVE_PRESERVATION_01` permits one
bounded test-tool repair in `scripts/clean.mjs` (preimage
`fb9a891e028881c19dd4c0239319c6d379068fe686b9949f15a4e21a9b2390c8`).
Triangulation: REQ-P-QUAL-018A/D/E requires durable non-overwriting archives;
the build cleaner deletes `test_env/evidence` on every rebuild, violating that
retained relation independently of runtime event sourcing. Build artifacts and
test evidence have different owners. Remove only the evidence deletion, retain
build-output cleaning, and verify syntax without executing destructive clean.
No historical archive bytes are touched and no runtime meaning changes.

Root Writer activation `T287_SANDBOX_UAT_TEST_GUIDE_01` permits the new
`test_env/README.md` only, documenting test ownership and the selected UAT
entrypoints. It contains no new Product law or qualification claim.

Root Writer activation `T287_SANDBOX_UAT_ARCHIVE_ROUTING_01` permits adding
`test_env/uat/runs/` to the tenant `.gitignore` (preimage
`f9c0445fbef9465115936486219ef92f9a60442246089a26a9ecb70cc2df7fb4`).
The first sealed pilot stays at its original immutable path. Future runs use
the existing canonical `test_env/test_runs/sandbox-uat/` archive convention.
Generated installations and application workspaces remain forensic artifacts,
outside the active source/test tree; no archived bytes are moved or deleted.

Authority: selected STDO `stdo://releases/v2.5.1-rc.2/`, verified manifest
`3d860ff4c1746f06ac25295a9e205cffb8e7725869615ac77cf2304b70ff2782`;
`build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md`;
Product generic ownership,
F14/F17 and S06; `REQ-P-QUAL-018A` through `018I`. Latest owner selection makes
Data Mapper an ABG-owned test workload; it does not resume odd_glc/T-043
delivery or make all seven green outcomes a new RC1 prerequisite.

```mermaid
sequenceDiagram
    participant U as ABG test workload and independent oracle
    participant I as Installed Public installer and DefinitionCall
    participant L as Installed generic default library
    participant R as HoG traversal and ABG admission
    participant A as Persistent test archive
    U->>I: Exact candidate, source input, declared capabilities
    I->>L: Invoke published lifecycle composition
    L->>R: Declared construction, assessment and execution
    R-->>U: Admitted terminal result and worksite
    U->>I: Fresh result and replay reads
    U->>A: Requests, install identity, observations, events and readback
    U->>U: Independent application acceptance; teardown after archive
```

## Dependency-ready assignments

1. Retirement Worker: inspect current tests against owning current contracts;
   delete only obsolete contract/builtin/controller tests with no remaining
   purpose. Preserve useful generic and current regressions. Pin each preimage
   before mutation and return a concise deletion/replacement ledger. Territory:
   existing `test_env` tests/support/falsifiers and necessary new test-domain
   fixtures only, excluding the new sandbox UAT territory. Localize any still
   useful donor declaration/input fixture so no executable ABG test reads
   odd_glc; donor runtime/controller code is prohibited. No production, package,
   specification or historical evidence
   writes; return script changes to Executive.
2. Workload Worker: read donor sources, preserve six original selected Hello
   workloads and complete Data Mapper source plus independent oracles and
   toolchain obligations in `test_env/fixtures/sandbox-uat/`. Record acquisition
   digests. No runtime import or execution dependency on odd_glc, no copied
   controller or implementation, no solutions or inputs in the Product package.
3. Harness Worker: `test_env/uat/`, `scripts/sandbox-uat.mjs`, and package test
   scripts only. Use installed canonical owner exports/Public DefinitionCall,
   public installer and generic default library. Provide seven-case selection,
   finite execution settings, persistent scenario-first archives, fresh read
   checks and truthful failure/block outcomes. No new runtime or private event
   writer. Non-paid readiness checks first; a prepared harness is not a live UAT
   pass. Reuse current caller machinery rather than donor orchestration.
4. Root joins closed returns, records current selection and runner routing under
   a separate Writer grant, then activates independent frozen-subject review.

Workers own their return records under this directory. Each assignment binds
exact affected preimages before edits and records commands and result limits.
No Git effects, release publication, destructive cleanup of retained archives,
or paid seven-case campaign is selected by this setup increment.

## Exit proof

Seven original workloads resolve locally with independent acceptance oracles;
removed tests have an evidenced obsolete owner or a current replacement;
runner lists/prepares/selects cases without odd_glc; exact clean installation
and actual generic runtime behavior are separately checked; archives survive
teardown and any incomplete application outcome remains non-green. Full live
UAT results, release qualification and human acceptance remain separate claims.

Integration failures stop at the first failing relation and return to Executive
triage across Product, Design, interface, identity/effects and Proof. Repair
only the needed generic seam, never weaken a workload or restore builtin Hello.

## Bounded integration triage

`T287_UAT_CONSUMER_PACKAGE_02`: first basic-cli preparation refuses consumer
verification. The test publisher omitted package `exports`; owning
`verify_product.ts:1090` requires an export record, so it returns
`identity_mismatch` although name/version agree. Product identity/discoverability
law is correct; test artifact construction missed it. Only workspace creation
and packing occurred; no installed join, Run or UAT credit. Harness Worker may
pin and repair its consumer package metadata, derive successor content/manifest
through current APIs, and perform one fresh provider-free preparation. The first
sealed archive remains unchanged. No production repair or weakened check.

Command-oracle correspondence consumes the selected installed public C2
judgment predicate and its direct admitted task/result, which already checks
exact command vectors and captured environments. The read-side oracle does not
import a private matcher or reproduce environment normalization. It conjoins
actual C2 owner coordinates, selected source/tool bindings and application
acceptance. Missing lineage stays non-green.

Root Reviewer activation `T287_SANDBOX_UAT_WORKLOAD_REVIEW_01` reacquires only
the closed workload subject `bf9d87db9e4822deea6d30bc493819a520a4a44295b74ee56b7efa5a199f0b02`
and its original donor input byte relation. Scope is external test definitions
and a pure independent observation checker, never ABG runtime authority. Effects
are read-only checks and `workloads/review.md` as reviewer return; no repair.

Root Reviewer activation `T287_SANDBOX_UAT_RETIREMENT_REVIEW_01` independently
reacquires `retirement/retirement.json` at SHA-256
`3be5db69ee5d663e4290b2cca12768c9c73067574a20e032a1f11b0b3915d4b0`
and its non-executable undo archive at
`13422c341971c5128373fd22f3ed18510c71f489834fb4b85924f35ccf16b489`.
Frame: current generic test duties and obsolete invocation/builtin boundaries;
effects: read-only subject inspection and `retirement/review.md`, no repair.

Root Worker readiness activation `T287_SANDBOX_UAT_JOIN_CHECK_01` permits one
execution of the new default `npm test` against the frozen join, with output
and summary only under `joined-readiness/`. It invokes no build, cleaner,
provider, release or Git operation. Readiness stays distinct from UAT or
qualification; any failure returns to Executive before repair or retry.

`T287_UAT_ORACLE_SNAPSHOT_03`: independent harness review found that the first
acquisition authenticates fixture inputs, but the later oracle import and its
local manifest/rubric reads use the moving fixture tree. For a long native Run,
the judged acceptance material can differ from the selected immutable input.
Product generic/runtime ownership is unaffected. The violated test identity
and postmortem relation is REQ-P-QUAL-018B/D; initial hash and preparation checks
missed the later use. Harness Worker may pin its frozen preimages, snapshot
the authenticated selected acquisition assets and exact manifest into the new
run archive before dispatch, and import the archived checker/rubric there.
Territory remains harness modules/tests/docs and its own return records only;
no fixture, Product, runtime, Git or prior archive effects. Add one bounded
mutation discriminator showing ambient edits cannot change the selected
checker. Reuse unchanged Public installation evidence, rerun affected local
harness checks, freeze a successor, stop, and return for independent review.
The same caller correction enforces the existing 018C source-commit metadata
requirement: operator config supplies a nonempty sourceCommit; omission must
refuse rather than archive null. The package digest remains candidate identity,
so this creates no checkout/Git requirement or dirty-source qualification claim.

`T287_UAT_INSTALLED_IDENTITY_04`: targeted independent review found that the
existing resolver checks installed content before execution, while fresh Run
reads authenticate admitted metadata/events without an unconditional physical
payload check afterward. A controlled copy of the actual seven-file consumer
keeps manifest/admission coordinates unchanged while its semantics or an extra
build file changes. The existing public `installedProductContentMatches`
correctly refuses both; the harness did not conjoin that post-Run fact. This is
the known immutable-Product/mutable-worksite boundary, not a containment claim.
Product/identity and installed UAT proof require the same installed candidate;
initial installation checks missed later physical drift. Harness Worker may
pin the frozen runner/test/README preimages, use the unchanged bootstrap Product
API on both admitted installs before native dispatch and after it, before
executing fresh installed readers or importing the installed oracle owner,
archive the results and refuse any mismatch. No copied verifier, new Public
surface, runtime/fixture changes, prior archive changes or new provider run.
Add one bounded meaningful refusal check, rerun affected harness checks, freeze
the successor, stop and return for independent review. Unchanged Public
preparation and other frozen returns retain their existing applicability.

Root Writer closure activation `T287_SANDBOX_UAT_CLOSE_01` permits, after the
closed independent final review, `acceptance.md` here and only current routing
and bounded setup evidence in GOALS/T-287. Closure preimages: GOALS
`4bf0ffddd32e0c1b267e6d1b9b17a51ac6cf187a2561d5148404dbfdb7b572ea`;
T-287 `16350be756f6e2efbc77c0817e302134f42a9c0c22243a521ee7301ddcb98158`.
The epic remains active. Closing this setup never closes unexecuted live UAT,
complete qualification, release or human acceptance. No Git effects.

## Owner addition: recover historical-run disk space

Owner selection, 2026-10-06, adds recovery of disk space from historical runs
to this cleanup. Root Writer activation `T287_UAT_DISK_SELECTION_01` appends
this selection only (plan preimage
`3c39f3e6de1563927510dfba065717d5d75ec298212df096c8184c960d8cf9f7`).
This explicit owner request permits retiring obsolete historical run material;
the earlier setup-only prohibition on archive deletion does not block that
newly selected work. Current accepted subjects, live work, source, Git data and
the original workload inputs remain protected. Archive retirement cannot
silently retain a proof claim whose supporting bytes were removed.

Disk inventory Worker `T287_UAT_DISK_INVENTORY_01` inspects historical run
storage in this canonical ABG checkout. Frame: test observation/evidence and
disposable deployment scratch, never runtime authority. It measures allocated
space, identifies obsolete or reproducible copies and checks current evidence
references and active process use. Effects at this stage are read-only outside
`disk-recovery/`, where it returns a concise inventory and proposed exact
deletion paths. No deletion, compression, source edits, Git/worktree operation,
provider or test execution. Root selects the concrete deletion grant from that
closed inventory. Independent review then checks the exact disposition and
remaining current evidence. Reuse the setup reviews; do not repeat them.

Root Reviewer activation `T287_UAT_DISK_REVIEW_01` independently reacquires
`disk-recovery/inventory.json` at SHA-256
`3d14220374a0117c75230abb44a85941c939e639d2864519ff22365ee385f125`.
It checks the exact path boundary, root identities, tracked-file absence and
separation from current frozen subjects; writes `disk-recovery/review.md` only
and returns to Executive. It performs no deletion or test campaign.

On that closed GO, Worker activation `T287_UAT_DISK_RECOVERY_02` may remove
only the 313 generated roots enumerated in that exact inventory. This retires
their historical runnable dependency/cache state, not current proof or original
worksites. Recheck exact directory identity, tracked-path exclusions and active
use before deletion; a mismatch stops for Root disposition. Record each actual
removal, allocated bytes and fresh before/after filesystem availability under
`disk-recovery/`, then stop. No added candidates, broad directory deletion,
archive compression, source/Git/build/provider effects or replacement copies.
Root conjoins this return with the existing accepted setup; no repeated
semantic assurance is selected.

Root Writer activation `T287_UAT_SETUP_AND_DISK_CLOSE_02` permits the final
disk outcome in `acceptance.md`, the owner's added historical-run selection and
bounded completion evidence in GOALS, and current T-287 routing only. It reuses
the still-current GOALS/T-287 closure preimages recorded above, binds the closed
cleanup receipt before writing and leaves the delivery epic active. It grants
no historical rewrite, Product change, Git effect or unexecuted UAT credit.
