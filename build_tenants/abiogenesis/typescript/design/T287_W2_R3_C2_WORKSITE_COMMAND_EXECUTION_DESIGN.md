# T-287 W2-R3-C2 Worksite Command Execution Design

**Status**: amended bounded child design candidate; pending independent review

**Design candidate**: `W2-R3-C2-D`

**Selected implementation/evidence**: none; amended `W2-R3-C2-I/E` remains
unselected pending independent design acceptance and a later Executive
selection

**Prior accepted two-manifest design SHA-256**:
`f4eafb82961beb6ebe47fa54eb91dc7deb470c8fb106609f7d3d12ced76d074b`

**Prior accepted amended design SHA-256**:
`f7075c286d33e6b95ae5a3481e5900e45052f65f8d434f6ee09039d29d7a12fe`

**Earlier accepted design SHA-256**:
`7f69c4c0c5e027f4025c0f3885042c65a668b4089eb139d278c0cdbc78e4f570`

**Method basis**: immutable STDO `v2.5.0-rc.4`

## 1. Claim

C2 publishes one standalone ABIogenesis GraphFunction whose single `F_P`
leaf uses the existing `worker_executes` lane to run an owner-authored ordered
command manifest inside an ABI evidence snapshot. The Product admits the
helper-observed command, report, predicate, protected-source, and residue
truth without interpreting downstream domain success. Closed execution and
fresh replay retain the same observation and its mechanical helper-artifact
join.

C2 is a sibling of C1 and C3. It does not widen C1's `closed_prompt_proof`
actor, grant tools to a construction Worker, or change C1/C3 construction
semantics beyond inheriting their corrected authority-basis carrier. Its closed
source set is the exact C1 root or accepted C3 reducer,
always through an owner-derived source-result basis carrying the existing
`WorksiteConstructionResult`. odd_glc may join that admitted construction
result and C2 execution observation and owns all domain satisfaction, review,
triage, and iteration.

## 2. Re-entry And Fixed Truth

The lawful re-entry is:

```text
design_reframe: W2-R3-C2-D
```

This selection stops at the amended design candidate. `W2-R3-C2-I` and
`W2-R3-C2-E` require independent acceptance of these exact design bytes and a
later explicit Executive selection.

Intent, Product meaning, requirements, Public operation families, event-kind
census, feature membership, scenarios, and release subjects remain fixed.
C2 realizes existing `A5-F03`, `A5-F04`, and the post-binding portion of
`A5-F10`; it adds no downstream Product semantics.

## 3. Causal Boundary

The invocation input is one closed `WorksiteCommandExecutionTask`. Public
`run.invoke#invoke` must supply a non-null owner-derived
`ProductInvocationSourceResultBasis` for the admitted C1-root or C3-reducer
result. Product semantics revalidate the exact authorized source
GraphFunction and existing construction-result contract, result value and
value digest, source invocation/run/graph-call/C-call, result-admission and
judgment events, replay identity/digest, workspace, and binding. The ABG
admitted `result://` envelope identity remains distinct from the Product
value's internal `worksite-construction-result://` identity.

Source-result rehydration also projects the source invocation's exact
`WorkspaceAuthorityBasis` and requires its complete canonical value to equal
the C2 task's `A`. A C1/C3 result with a matching binding but a different,
missing, ref-only-equal, or crossed basis is not a lawful C2 source.

The task carries the exact internal construction-result ref/digest/value.
Terminal source coordinates remain solely in the owner-derived invocation
source-result basis, where ABG can rehydrate them; the caller need not
duplicate them inside the task. The task carries no caller-authored
source-artifact authority. C2 validates its own installed publication in the
ordinary target invocation basis.

### Exact worksite-root authority

`WorksiteCommandExecutionTask` adds the exact closed field
`workspaceAuthorityBasis: WorkspaceAuthorityBasis A` alongside its existing
`workspaceBinding: WorkspaceBinding W` field.
Before the C2 leaf may open—and therefore before task/launch manifest
publication, Worker dispatch, protected-source observation, snapshot
materialization, or command/probe effect—ABG `admitExecutionBasis` projects
`ExactPrefixWorkspaceEnvironment E` at the target invocation's held
predecessor prefix and requires canonical equality:

```text
task.workspaceAuthorityBasis == E.workspaceAuthorityBasis
task.workspaceBinding == E.workspaceBinding
A.workspaceId == W.workspaceId
A.authorityBasisId == W.authorityBasisId
A.authorityBasisDigest == W.authorityBasisDigest
W.roots.productRoot == I_owner.installedRoot
```

`I_owner` is the unique admitted ABIogenesis Product installation named by the
C2 Program/GraphFunction publication and selected implementation owner. The
owner-derived C1-root or C3-reducer source-result basis must rehydrate the same
exact-prefix environment and the same full `A`/`W` pair. Ref/digest agreement
without canonical body equality is insufficient. Missing, ambiguous, stale,
crossed, or tampered authority, binding, prefix, source environment, Program
owner, or install refuses before the first archive or Worker effect.

The admitted `ExecutionBasis B` binds the exact canonical C2 task as its raw
input. HoG may invoke the C2 leaf only after that basis and scope are admitted.
The retained eight-key C2 `LeafExecutionOccurrence` remains authority-free
with `executionAuthority: null`; neither the host nor helper pretends it can
reproject the ABG environment. They instead revalidate the closed task,
manifest, `A`/`W` joins, owner/package loci, paths, and observations that the
admitted leaf receives. Direct possession of task bytes, `canonicalRoot`, or a
helper command is not exact-prefix authority.

All original protected subjects and observations resolve under
`A.canonicalRoot`, never `W.roots.productRoot`. C2 re-observes each protected
`O1` there before snapshot creation, copies those exact bytes into the
create-only archive snapshot, and re-observes the original canonical worksite
again after Worker return and before Product completion. Both observations
must equal the replay-proven C1/C3 `O1` values. The snapshot is an evidence
copy, not a new authority basis, an `ObservationSnapshot` authority carrier,
or a substitute for current worksite truth.

The exact protected roots remain:

```text
R_protected = {
  W.roots.productRoot,
  W.roots.toolchainRoot,
  W.roots.eventLogRoot,
  W.roots.runtimeStateRoot,
  W.roots.projectionRoot,
  W.roots.archiveRoot
}
```

Original worksite subjects, source paths, declared cwd/report/module/selector/
port-file paths, and authored write territories are canonical-root-relative.
Their original-root interpretation must be confined beneath
`A.canonicalRoot` and must not equal or descend beneath any protected root;
a territory itself must not lie in one, and every concrete target remains
independently checked even when a safe broader territory contains a protected
subtree. Lexical alias, physical alias,
hard link, symlink, crossed root, or nearest-existing-parent escape refuses.
Inside execution, those same relative coordinates resolve only against the
snapshot mirror at `attemptRoot/sandbox`. The helper's create-only
`attemptRoot` writes beneath `archiveRoot` are Product-owner evidence mechanics,
not authority for a task path or command to target the original archive tree.

The complete installed owner Product is separately inventoried before and
after execution and must have zero byte/path/node-kind/symlink-target delta.
This retains `productRoot == installedRoot` as Program-owner identity while
ending its use as the authored worksite root.

## 4. Task Contract

The task binds:

- exact `workspaceAuthorityBasis: WorkspaceAuthorityBasis A`, exact
  `workspaceBinding: WorkspaceBinding W`, their closed join, and the existing
  owner-scoped direct grant;
- the complete, non-null construction result produced by the exact C1 root or
  accepted C3 reducer;
- one protected row for every ordered C1 member, including source member,
  subject, O1 observation ref/digest, file digest, and byte length; the task's
  full `A`/`W` pair applies to every row without duplication inside each row;
- ordered commands with ordinal, command ID, executable, argv, relative cwd,
  closed environment, timeout, termination grace, and expected report
  coordinates;
- ordered generic outcome predicates with stable predicate IDs; and
- disjoint allowed evidence-write entries, each an exact file or subtree.

The leaf identity is
`actor://abiogenesis/worksite/command-execution-worker@5` with its distinct
worker binding. `WorkspaceBinding.authorizedActorRef` remains the neutral root
worksite owner bound by the capability grant. It need not equal either C1 or
C2's transport-specific leaf actor.

Every cwd, report, module, selector, port-file, and write-territory path is
safe and relative to the canonical worksite and then mapped to the snapshot
mirror. Declared child executable, argv, and environment values must not expose
`A.canonicalRoot` or any original WorkspaceBinding root or contain a parent
path segment. The final `PATH` contains only non-empty absolute entries. The
task records every inherited allowlisted environment value; no undeclared
process environment crosses the helper boundary.

## 5. Snapshot And Effect Boundary

Before execution, the ABI owner resolves every protected subject beneath
`A.canonicalRoot`, re-observes every protected `O1` through no-symlink
confinement, and verifies exact file bytes, digest, length, full `A`, and full
`W`. It then materializes a create-only ordered snapshot under the unique
attempt's archive/evidence root. Snapshot members bind their C1/C3 source
member, `A`/`W`, canonical-root-relative path, and `O1` coordinates. Their
canonical vector digest identifies the snapshot.

Before that first re-observation, snapshot/result materialization, declared
command, task-module import, report read, HTTP launch, or probe, the helper must
close its own invocation preflight. Before that preflight completes, the helper
may only read and validate the public Product-task manifest, the private launch
envelope, and their canonical path topology.

One exact attempt root contains two distinct manifest loci:

```text
attemptRoot = archiveRoot/worksite-command-execution/<taskDigest>/<attemptDigest>
taskManifestPath = attemptRoot/task.json
launchManifestPath = attemptRoot/launch.json
```

`task.json` is the sole authoritative carrier of the complete Product
`WorksiteCommandExecutionTask`. Its bytes are exactly the task's canonical JSON
followed by one LF byte. The public 12-key
`WorksiteCommandExecutionHelperPlan` adds no launch-envelope field:
`taskManifestPath`, `taskManifestDigest`, and `taskManifestByteLength` identify
those exact `task.json` bytes. The plan derives the private launch path
structurally as literal sibling `launch.json` when it constructs
`toolCommand`; no host, helper, completion path, or validator may recover that
path by parsing `toolCommand`.

The sole Worker-visible `--task` argument identifies the ABI-private canonical
`launch.json`. The flag is a compatibility spelling; it does not make the
private envelope a Product-task manifest. The launch envelope does not duplicate
the Product task value. Its exact body contains:

- the exact Product `taskRef` and `taskDigest`;
- the structurally derived `taskManifestPath` and its exact public
  task-manifest digest and byte length;
- the complete exact `LeafExecutionOccurrence`, its canonical digest, the
  exact ABI leaf `attemptRef`, and
  `attemptDigest = sha256Canonical({ attemptRef })`;
- the task-owned canonical `archiveRoot`, exact `attemptRoot`, and structurally
  derived `launchManifestPath`; and
- the exact installed helper module and admitted implementation/package
  coordinates.

The authority-free C2 `LeafExecutionOccurrence` is normative, not an open
record. It is one admitted I-JSON object with exactly these eight keys:
`cCallRef`, `runId`, `graphCallId`, `frameId`, `programLocusRef`,
`taskOrdinal`, `attempt`, and `executionAuthority`. `cCallRef`, `runId`,
`graphCallId`, and `frameId` are strings whose trimmed form is non-empty;
`programLocusRef` is exactly
`node://abiogenesis/worksite/command-execution/fp@5`; `taskOrdinal` is `null`
or a non-negative safe integer; `attempt` is a positive safe integer; and
`executionAuthority` is exactly `null`. No additional key is admitted.
`occurrenceDigest = sha256Canonical(occurrence)`.

The attempt identity is retained exactly from the current implementation:

```text
attemptRefDigest = sha256Canonical({
  cCallRef: occurrence.cCallRef,
  runId: occurrence.runId,
  graphCallId: occurrence.graphCallId,
  frameId: occurrence.frameId,
  taskOrdinal: occurrence.taskOrdinal,
  attempt: occurrence.attempt
})
attemptRef = worksite-command-attempt://abiogenesis/<lower-case attemptRefDigest body>
attemptDigest = sha256Canonical({ attemptRef })
```

The URI suffix is exactly the 64-character lower-case hexadecimal body after
removing the `sha256:` prefix from `attemptRefDigest`.

The host and helper independently enforce the exact occurrence key set and
constraints, recompute `occurrenceDigest`, `attemptRef`, and `attemptDigest`,
and join them to the envelope and attempt locus. An extra occurrence key,
non-null authority, wrong C2 program locus, or crossed occurrence, attempt,
digest, or locus refuses before protected-O1 observation or any helper
execution effect.

The implementation-private launch-manifest body has one exact key set: its kind
and schema version plus the fields above. It excludes its own
`launchManifestRef`, `launchManifestDigest`, byte digest, and byte length.
`launchManifestDigest = sha256Canonical(body)` and `launchManifestRef` is the
corresponding ABI launch-manifest identity. The full envelope has exactly the
body fields plus those two identity fields and is published as canonical JSON
with one trailing LF. The implementation-private launch plan, not the envelope
or public helper plan, retains the full-envelope byte digest and byte length.
Neither the envelope nor those private identities changes the Product task,
result, observation, Public, or publication contracts.

Before Worker dispatch, the ABI implementation publishes `task.json`
create-only first, reobserves its exact bytes, digest, byte length, canonical
path, and single-link state, and only then publishes `launch.json` create-only
as the last readiness marker. It reobserves the launch envelope's exact bytes,
identity, digest, byte length, canonical path, and single-link state before
dispatch. Partial publication fails closed: an extant `task.json` without the
final valid `launch.json`, or either failed publication/currentness check,
causes no Worker dispatch, fallback, repair, or automatic retry.

The host, helper, and completion path each independently derive the literal
`task.json`, `launch.json`, `result.json`, and `sandbox` siblings from the exact
attempt root. They do not trust caller-supplied sibling coordinates or parse a
command string. The two manifest paths must be distinct canonical, non-symlink,
non-aliased regular files with distinct filesystem identities and `nlink === 1`.
The helper validates the launch-envelope schema and identity, rederives every
task/occurrence/attempt/helper/package/locus join, reads the exact referenced
bare task manifest, admits it as the Product task, and requires its canonical
bytes/ref/digest/length to equal the envelope and public-plan coordinates. The
actual `--task` subject must equal the rederived `launchManifestPath`. Only then
does the helper derive `artifactPath = attemptRoot/result.json` and
`sandboxRoot = attemptRoot/sandbox` and require both absent before any helper
execution effect.

A bare Product task passed as `--task`, swapped `task.json`/`launch.json`, an
unchanged file copied to another otherwise well-shaped locus, crossed or
internally incoherent task/occurrence/attempt/helper/package coordinates, a
same-inode manifest pair, a task-manifest hard link, wrong digest segment,
changed path, relative path, `.`/`..` alias, alternate filename or depth,
malformed/noncanonical/stale bytes, symlink, alias, escape, partial publication,
or pre-existing result or sandbox refuses before protected-O1 re-observation,
snapshot/result materialization, probe launch, task-module import, or
declared-command execution. The later Product join separately proves that all
independently derived coordinates and current bytes remain exact.

All declared command cwd, report reads, module imports, report walks, and HTTP
probes resolve their canonical-root-relative coordinates inside that snapshot
mirror through canonical, no-symlink
confinement. The helper inventories snapshot path/content/node-kind/symlink-
target state before and after execution. Every created, changed, or deleted
path must match exactly one declared file or subtree territory. Protected
snapshot members must remain byte-exact.

The helper separately inventories the admitted Program-owner install at
`W.roots.productRoot == I_owner.installedRoot` before and after and requires
zero path/content/node-kind/symlink-target delta. Product delta rows can never
cite snapshot write authority. It also re-observes every original `O1` under
`A.canonicalRoot` after the Worker returns and requires exact equality with its
pre-snapshot and replay-proven observation.

This is a trusted-developer-desktop boundary, not hostile-code containment.
The exact owner-authored commands may use host toolchains and caches. C2 does
not claim to observe permissions, ownership, timestamps, xattrs, or effects
outside the governed roots. `effects: []` means C2 declares no canonical-
worksite or installed-Product mutation effect; archive snapshot/result
materialization is ABI evidence mechanics.

## 6. Exact Worker And Helper Join

The ABI implementation writes the create-only canonical bare Product task at
`task.json`, then writes the create-only canonical private launch envelope at
`launch.json` as the final dispatch-readiness marker. The public
`WorksiteCommandExecutionHelperPlan` retains exactly its predecessor 12-key
shape. Its task-manifest path/digest/byte-length fields bind the exact bare
`task.json`; its one-argument `toolCommand`, tool-input digest, and tool-input
byte length bind the structurally derived `launch.json` command. The
implementation-private launch plan alone retains launch-envelope
identity/path/digest/byte-length coordinates. Only the installed helper and
private launch-manifest path cross the Worker boundary in one short Bash tool
call:

```text
node <installed ABI helper> --task <attemptRoot/launch.json>
```

The current helper-plan predicate is current-only. Product helper-plan
construction, Product observation construction and admission, completion, and
`exactExchange` all require the structurally derived `launch.json` command and
input identity. They do not admit the immediately preceding 12-key plan whose
otherwise one-argument command names `task.json`; recomputing a current
observation ref/digest around that prior plan cannot make it current. Historical
validity is evaluated only by the exact immutable predecessor Product/artifact,
not by a permissive current legacy reader.

The Worker prompt contains exactly that command plus task-owned semantic
coordinates; it contains neither `artifactPath` nor `sandboxRoot` in command
or prose and does not expose the private envelope body. The Worker must make
exactly that one tool call. ABG records the tool-use ref, tool name, canonical
input digest, and byte length, deduplicating repeated stream records and
refusing malformed or conflicting tool-use identity. Raw tool input remains in
the transport artifact and is not copied into events.

After the Node executable and installed helper module, the helper accepts
exactly the two-element argv vector `--task`, `<attemptRoot/launch.json>`. It
refuses a missing flag, missing or empty value, duplicate `--task`, legacy `--artifact`
or `--sandbox`, any unknown flag, positional argument, or leading/trailing
extra argument before reading launch bytes or causing an effect. After argv
admission it reads the canonical envelope once, validates its exact byte and
identity form, validates the task/occurrence/attempt joins, independently
reconstructs the archive/task/attempt locus and all literal siblings, then reads
and validates the exact canonical bare task bytes. It requires task and launch
to be distinct paths and filesystem nodes, each canonical, non-symlink,
single-linked, and byte-current. It validates result and sandbox absence before
protected-O1 re-observation, snapshot/result materialization, probe launch,
task-module import, or declared-command execution. Missing, crossed, swapped,
copied, same-inode, malformed, noncanonical, stale, aliased, symlinked,
escaped, partially published, or output-colliding input therefore refuses with
zero helper execution effect; no sibling path is caller-selected.

The helper executes the task's exact argv/cwd/environment rows in order,
captures streams, observes declared reports, derives predicates, inventories
residue, and publishes one create-only canonical `result.json`. Successful
publication requires cleanup of its temporary name to succeed and the final
artifact to remain a canonical, non-symlink regular file with `nlink === 1`;
cleanup failure is not swallowed. The Worker may only echo the helper-produced
command and predicate rows. Product construction requires byte-for-byte
canonical equality with the validated artifact and carries artifact ref,
digest, length, and path into the admitted observation.

The host and Product do not normalize, repair, strip, translate, or reissue a
wrong Worker command. The host never invokes the helper as a fallback and no
automatic retry follows helper preflight refusal or transport-identity
failure. Exact one-Bash input identity remains the acceptance relation; the
helper-side preflight prevents protected-O1 observation, snapshot/result
materialization, probe launch, task-module import, and declared-command work
from preceding exact envelope validation and derived-sibling absence checks.
Exact Worker input comparison remains the later Product gate.

On the stated trusted-developer-desktop boundary, helper preflight does not
confine arbitrary shell actions that a Worker may place before or around the
helper call and does not claim an altered or composite Bash input is
side-effect-free. Existing `exactExchange` still rejects any such input after
the Worker observation; the host does not repair or replay it.

Product completion independently rederives and revalidates the exact
plan-derived bare task-manifest bytes, digest, byte length, canonical path, and
single-link state plus the exact private launch-manifest bytes, identity,
digest, byte length, canonical path, and single-link state. It requires the two
manifests and final helper artifact to remain distinct filesystem nodes, the
artifact to remain canonical with `nlink === 1`, and the sandbox to exist only
at its exact canonical derived sibling. A missing, changed, crossed, swapped,
same-inode, hard-linked, or noncanonical task manifest, launch manifest, or
helper artifact prevents completion even if Worker response bytes exist. No
refusal is retried or normalized.

Each command result distinguishes an ordinary integer exit status from
timeout, process signal, signal sequence, and confirmed termination. A
non-zero command exit is a truthful admitted observation, not transport
failure.

The configured actor inactivity timeout must exceed the closed sum of command
and probe timeout/grace budgets plus helper overhead. The absolute timeout must
exceed both. Helper heartbeats are diagnostic only; liveness does not depend on
nested tool output forwarding. Helper and command processes use process-group
termination on supported hosts.

## 7. Mechanical Predicate Surface

The helper, not the Worker or downstream caller, produces one ordered typed
observation for every declared predicate ID. Supported generic kinds are:

- `process_exit` and `stdout_exact` from an exact command row;
- `test_pass_count` from exact Node output or the declared JUnit set;
- `module_export_return_exact` from one confined snapshot module import/call;
- `http_response_exact` from an actual helper-owned loopback server launch and
  Node HTTP request;
- `module_set_exact` and `file_count` from caller-declared selectors over the
  protected path vector; and
- `test_report_set_exact`, `test_report_failure_count`, and
  `test_report_error_count` from the caller-declared report base/selector.

JUnit handling uses the accepted ABI 4.6 element-scoped law: comments and
CDATA are inert, aggregate attributes are ignored, testcase elements alone
count, and failure/error/skipped precedence is exact. Report set discovery is
generic and declaration-owned; ABI contains no Scala, Data Mapper, or odd_glc
path convention. Each actual report observation derives a ref/digest from the
command coordinate, expected coordinate, path, state, byte length, and file
digest. Predicate evidence cites those derived refs.

For dynamic loopback isolation, the HTTP launch argv contains exactly one
`{ABI_HTTP_PORT_FILE}` placeholder and declares one allowed port-file path.
The helper substitutes its snapshot absolute path, observes the create-only
decimal port chosen after bind-to-port-zero, issues the actual request, and
records request, selected-port file, response, and launched-process
termination truth.

F_D judgment admits a well-formed execution observation without interpreting
whether exit codes, bodies, exports, counts, or report sets satisfy odd_glc.
Contradictory or free model-authored predicate rows cannot cross admission.

## 8. Publication And Lifecycle

C2 publishes one standalone GTL module, Program, GraphFunction, graph, and
single `F_P` node through the existing Product declaration and manifest
machinery. It adds no Public operation or event kind. C1 and C2 may be present
in one CatalogView; C3 may be present in that same view. Causal C2 invocation
uses the owner-derived admitted result of exactly the C1 root or accepted C3
reducer and no other producer.

The existing HoG/ABG lifecycle admits the invocation, evaluates the leaf,
admits the exact result and F_D judgment, closes the run, and exposes the same
observation through fresh replay. Async leaf completion is only the existing
port's ability to await governed transport; it grants no new effect owner.

Validated helper dispositions remain distinct in C-call failure/replay:
`helper_protected_mismatch`, `helper_product_mismatch`, and
`helper_territory_mismatch`. Missing/malformed helper evidence, wrong lane,
wrong tool identity, missing tool use, crossed task/source/workspace rows,
authority-basis rows, cardinality/order/ID errors, and stale O1 fail closed.

## 9. Root Proof Matrix And Evidence Gate

The shared C0 matrix and C1 propagation/C3 cases are normative. C2 additionally
requires:

| Case | Required construction | Required result |
|---|---|---|
| Distinct worksite/install | Use `A.canonicalRoot != I_owner.installedRoot`, with replayed C1/C3 `package.json` at `A.canonicalRoot/package.json`. | C2 protects and re-observes that worksite file, copies its exact bytes into the snapshot, and never reads it from installed `productRoot`. |
| Exact-prefix preflight | Tamper or cross full task `A`, task `W`, source-result environment, predecessor prefix, owner Product, or installation while retaining plausible refs/digests. | Refusal precedes `task.json`, `launch.json`, snapshot/result publication, Worker dispatch, protected read, and command/probe effect. |
| Alias and protected roots | Use lexical aliases, symlink ancestors, hard-link aliases, crossed roots, a target beneath a protected root, or a territory itself inside one. | Host/helper refuses at the owning pre-effect seam; no snapshot command begins and no protected byte changes. |
| Snapshot mapping | Use canonical-root-relative cwd, report, module, selector, port-file, and evidence-write paths. | Every execution read/write resolves only beneath the exact snapshot mirror; each snapshot member binds the original `A`/`W` subject and replayed `O1`. |
| Worksite currentness | Drift an original protected worksite file before snapshot or after Worker return. | Pre-snapshot or completion re-observation refuses; stale bytes cannot be admitted as C2 observation truth. |
| Product conservation | Inventory `W.roots.productRoot == I_owner.installedRoot` around success and every refusal. | Installed payload is byte/path/topology exact with zero Product delta. |
| C3 and replay | Consume a lawful same-basis C3 reducer result, close C2, reopen, and replay; separately offer mixed-basis C3 input. | Same-basis source/snapshot/observation replay byte-equally; mixed-basis aggregation or C2 source join refuses before effect. |

If later selected after independent acceptance of this design,
`W2-R3-C2-E` must prove from an installed package without a live model:

1. public C1-root or accepted C3-reducer invocation and closure, owner-derived
   source-result basis, then public C2 invocation from the same shared
   CatalogView;
2. exact `worker_executes` actor/binding/lane, argv/cwd/environment, one helper
   tool invocation whose command contains only `--task
   <attemptRoot/launch.json>`, helper artifact, admitted observation,
   `run_closed`, and byte-equal fresh replay;
3. the exact unchanged public 12-key helper-plan and observation shape, with
   `taskManifestPath` naming authoritative bare `task.json`, its digest and
   length matching the exact LF-terminated file bytes, `toolCommand` and its
   input identity naming structurally derived `launch.json`, and no private
   launch-plan fields entering Product task/result/observation or replay;
   evidence must also construct the immediately preceding one-argument
   `--task <attemptRoot/task.json>` 12-key plan, recompute its tool-input
   identity and every current observation ref/digest around it, and prove that
   current Product construction, observation admission, and `exactExchange`
   refuse that otherwise self-consistent hybrid rather than minting a current
   observation; historical truth remains only under its exact immutable
   predecessor Product/artifact;
4. absence of `artifactPath` and `sandboxRoot` from the Worker prompt and tool
   command, with both paths independently derived from the exact attempt root
   and exactly equal to the retained plan;
5. host publication of `task.json` first and `launch.json` last, exact
   reobservation of both before dispatch, and fail-closed partial publication
   with no Worker dispatch, fallback, normalization, or retry;
6. direct installed-helper success for exactly one `--task
   <attemptRoot/launch.json>` argument plus refusal of a missing flag/value,
   duplicate `--task`, legacy `--artifact`/`--sandbox`, unknown flag, bare
   positional argument, or any extra argument;
7. helper refusal when `--task` names bare `task.json`, either manifest is
   missing or stale, or the bare task bytes/ref/digest/length do not equal the
   launch envelope and public-plan coordinates;
8. refusal of swapped manifests, an unchanged valid task or launch file copied
   to another path, crossed or internally incoherent task, occurrence/digest,
   attempt ref/digest, installed-helper, package, archive, or canonical-locus
   coordinates, plus an extra occurrence key, non-null execution authority,
   wrong C2 `programLocusRef`, or any violation of the exact occurrence scalar
   constraints;
9. refusal of a wrong task- or attempt-digest segment, wrong filename/depth,
   `.`/`..` or repeated-separator alias, symlink, escape, task-manifest hard
   link, launch-manifest hard link, or same-inode task/launch pair, with zero
   protected read or execution effect;
10. refusal when either exact derived sibling `result.json` or `sandbox`
    already exists, with zero protected-O1 read, declared-command sentinel,
    snapshot/result materialization, probe launch, or task-module import;
11. successful result publication only after non-swallowed temporary-name
    cleanup and final `result.json` `nlink === 1`, plus completion refusal after
    a result hard-link alias appears;
12. later `exactExchange` refusal of altered or composite Bash input, with no
    host normalization, fallback helper, or automatic retry and without a claim
    that earlier arbitrary shell effects are undone or confined;
13. helper-derived command, report, HTTP, module, filesystem, and JUnit rows,
    with a non-zero command exit admitted as observation;
14. refusal of wrong lane, no/malformed/conflicting tool use, wrong cardinality,
    order, ID, full authority basis, source basis, workspace binding, report,
    snapshot, helper artifact, and protected O1;
15. post-helper/pre-completion drift falsifiers for `task.json`, `launch.json`,
    and protected O1, each reaching and refusing at its exact completion gate;
16. refusal of undeclared snapshot create/change/delete, drift in the original
    canonical worksite, and any installed Product path/content/topology delta;
17. construction-time refusal of normalized root aliases and parent-path
    escapes through every command executable/argv/environment and HTTP-launch
    executable/argv/environment carrier, plus symlink traversal, unsafe PATH,
    and too-short declared inactivity/absolute budgets; and
18. a fake in-flight helper call beyond the former 60-second boundary under an
    explicit larger actor inactivity lease, plus full process-tree termination
    on timeout.

## 10. Retained Failure And Superseded Five-Path I/E Plan

The fifth retained live failure is diagnostic evidence for this amendment.
The odd_glc basic-cli run
`repo://odd-glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/basic-cli/20260902T102307822Z_pid92983/`
used historical qualified ABI artifact SHA-256
`e0bd55d90b2a2005c2021ba75f127a6a0402a7675994a757dd350b76e16cd449`.
The Worker preserved the exact `--task` path but moved both `--artifact` and
`--sandbox` one directory above the planned attempt. The permissive helper
accepted those caller paths, executed both declared commands, and wrote the
caller-selected result and sandbox before Product completion returned
`transport_identity_mismatch` and ABG admitted `run_stopped` for
`run://abiogenesis/3ee1b3b114f8f6a5a7bb287fc7d26df69744c3afa71f089dce357251231d77b5`.
This run is retained failure evidence only. The artifact is historical C3
qualification evidence and is not an accepted artifact for this amended C2
design.

The previously accepted two-manifest design bounded a later I/E to exactly five
paths:

1. `code/src/product/worksite_command_execution.ts` for the unchanged public
   12-key helper-plan shape, exact bare-task-manifest identity, structurally
   derived one-argument `launch.json` command/input identity, current-only
   construction/admission/`exactExchange` validation, and prompt projection
   while retaining owner-private artifact and sandbox coordinates;
2. `code/src/implementation/worksite_command_execution.ts` to independently
   derive, publish, and reobserve exact canonical `task.json` first and private
   `launch.json` last before Worker entry, retain only private launch-envelope
   coordinates, and revalidate both manifests plus final result single-link
   currentness at completion;
3. `code/src/implementation/worksite_command_helper.ts` for exact argv, both
   manifest identities/bytes and canonical-locus validation, independent
   literal-sibling derivation, mandatory pre-effect result/sandbox absence, and
   non-swallowed create-only result cleanup plus final single-link validation;
4. `test_env/tests/t287-worksite-command-execution.test.mjs` for the direct
   installed-helper falsifiers, exact occurrence/attempt recomputation, the
   rehashed prior-plan current-admission refusal, and retained public
   C1/C3-to-C2 closure/replay;
   and
5. `test_env/tests/t287-worksite-branch-construction.test.mjs` only to remove
   its stale informational artifact-path prompt expectation and preserve its
   complete accepted public C3-to-C2 regression.

That five-path plan is retained historical HOW, not a current selection. The
worksite-root reframe crosses the shared C0/C1/C2 authority carriers and exact-
prefix admission seams, so no implementation territory may be inferred from
the old list. Independent acceptance must return these exact design bytes to an
Executive for a new proportional I/E selection. The private launch envelope
still changes no Product task/result/observation contract. The frozen five-path
source/evidence subject produced under the prior accepted amendment remains
unaccepted realization evidence only; it grants no implementation or artifact
acceptance for this reframed design.
No C3 semantic, requirement, Public, transport, package-export, or
product-toolchain manifest source changes are authorized.
`abg/worker_transport.ts`, `abg/transport_contracts.ts`,
`implementation/index.ts`, and `test_env/tests/m5-worker-transport.test.mjs`
remain predecessor regression inputs, not mutation authority. All I/E and
falsifiers above remain unselected until independent design review returns to
the Executive and the Executive selects a new exact realization subject.

## 11. Nonclaims

C2 does not select pre-binding admission, Product install/resolve/verify,
Catalog admission, declaration application, overlay hierarchy, URI typing,
`run.invoke#start`, a generic shell API, an OS sandbox, hostile-code
containment, downstream validation, Reviewer authority, corrective iteration,
odd_glc semantics, C3 semantic change, version allocation, qualification, RC,
tap, or release. It does not select implementation, tests, packaging, a live
rerun, or Product-goal closure.

On the trusted-developer-desktop boundary, the helper does not authenticate
ABI publication origin against a same-user actor that replaces the complete
bare task manifest and launch envelope with newly recomputed, internally
coherent values and substitutes correspondingly derived siblings. That
coherent substitution is an explicit T-287 P3/nonclaim, not a required
pre-effect falsifier and not hostile-code containment. An altered or composite
Worker Bash input remains a later `exactExchange` refusal; C2 does not claim to
prevent or undo arbitrary shell effects that precede that observation.

The required exact-prefix authentication is ABG admission consistency over an
already admitted `WorkspaceAuthorityBasis`; it does not claim external actor,
manifest-origin, or hostile-filesystem authentication. Adding such authority
would require Product/requirement re-entry and is not selected here.
