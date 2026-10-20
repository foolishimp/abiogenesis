# L2 common computational library execution contract

**Status:** Executive-selected L2 candidate for independent design assessment. This document records `/root` Executive's conjunction; the separately activated Writer has not accepted, implemented or executed it. The general ABIogenesis 5.0 release campaign still waits for L5 library delivery acceptance.

## 1. Exact subject and controlling decisions

[Shared activation](activation.md), [basis](basis.json) SHA-256 `39481bf3d0c77efc9da91139f933c2d59884e8eb6b42bded78eda603df8b6dbb` and [frontier](frontier.md) preserve HEAD `727f1dbcab3c198f7704735fdf91b994b7aac243` plus the actual dirty bytes. Method is `stdo://releases/v3.0.0-rc.1/`, manifest `069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232`, empty composition; the current project frame applies.

The accepted [library design](../../../build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md) is SHA-256 `cb8dae9f7e684f9b6be730b74125294524ecd7e4d1f035fc03734d7ff1d1160b`; the accepted [prerequisite plan freeze](../T287_COMMON_LIBRARY_DELIVERY_PLAN_01/candidate-freeze.json) is `d2cb0f2e7c3967a64d5719e29c9b1ce21f3a47fd61988e9645e4000607c90a0e`. Product's fifteen selected families, sole ABG event authority, GTL/HoG allocation, seven C constructors, three static binders and admitted foundations remain intact.

Executive consumed these closed reports:

| Report | Exact SHA-256 | Conjoined selection |
|---|---|---|
| [Calculus/domain](calculus/L2-report.md) | `784b0bc807710f5e14930730bb13475096da0595c0fae9b9d06d71d5119e00d6` | D02–D04 six-file contraction; E01/E02 concrete retained domains; K01–K11 routes; current public STDO specialization and actual standalone STDO3 native consumer. |
| [Effects/foundations](effects/L2-report.md) | `4161ee63119c9b7490f0feb9cabe4c1d03b2c5ce6c040fb610af12737b998e66` | E03 one common physical lifetime with three consumers; U1 separate mandatory scoped unknown-effect currentness repair; E04 concrete retained filesystem/archive domains. |
| [Installed proof](proof/L2-report.md) | `7beb5ee434076ed1e9e89759f4c237264318fbdb7c479f241a4893e41c337487` | P1–P5 participants/oracles, V1–V7 finite population, earliest discriminator, isolated source/package proof, baseline/candidate work accounting and two-sided retirement evidence. |

These reports remain byte-for-byte preserved. Their detailed domain, effect, refusal, consumer and proof contracts are incorporated by reference. The Executive's explicit refinements in §§3–5 below control the identified report conflict and open details. They are recorded decisions, not authority delegated to a Worker or inferred from unclosed peer findings.

## 2. Production and proof territories

This is the selected future L3 boundary, not an immediate edit/effect grant. All production coordinates below are relative to `build_tenants/abiogenesis/typescript/code/src/`.

| Territory | Exact production files and change boundary |
|---|---|
| D02–D04 | `product/environment_definition_bindings.ts`, `product/verification_definition_bindings.ts`, `product/execution_resolution.ts`, `shared/definition_binding_mechanics.ts`, `shared/rooted_topology_partition.ts`, `abg/event_body_encoding.ts`. Reuse existing equalities, `product/exact_match.ts` and `shared/admission_predicates.ts`; remove exactly the selected private algorithms while retaining owner projections, predicates and failures. |
| K11 standalone STDO3 | `gtl/stdo_run_environment.ts`, current `constructStdoRunEnvironmentDeclaration` only. Generic schema/acquisition/evidence/assembly are consumed unchanged; historical schemas and Runs retain their basis. |
| E03 physical lifetime | New `shared/owned_process_lifetime.ts`; adopt in `abg/worker_transport.ts::runProcess`, `implementation/worksite_command_helper.ts::{runCommand,runHttpProbe}`; update `product/worksite_command_execution.ts` budget rule/calculation. Shared code owns physical observation/cleanup only. |
| E03 exact source correspondence | `gtl/worksite_command_execution.ts`: synchronize the emitted Product member digest, byte count and renderer source-span coordinates after the isolated build. Preserve renderer meaning and owner policy; verify the actual emitted bytes. Never patch generated output to force correspondence. |
| U1 existing admitted-task relation | New internal `abg/native_work_effect.ts`; update `abg/event_calculus.ts`, `abg/runtime_history.ts`, `abg/native_worksite_execution.ts`. Reuse one authenticated task join for transport exception and unconfirmed termination; propagate scoped currentness withdrawal through indexed/lazy/full/cold paths. No new event, resource, Result, runtime owner or public carrier. |

`abg/actor_process.ts` is an inspected causal/identity/order dependency, not an additional selected semantic rewrite. Existing downstream U1 consumers—native C2, `execution_basis.ts`, `worksite_input_provenance.ts`, `default_library.ts`, `semantic_job.ts` and `semantic_revision.ts`—retain their owners and consume the corrected shared invalidation gate. A discovered need to change their contracts or expand production territory returns to Executive before that edit.

E04 preserves the named install payload inventory, inode-sensitive protected inventory, logical worksite inventory, exact-file persistence, create-only publication, guarded worksite replacement, snapshot materialization and archive fast/fallback reader. Their domain differences are specified in [effects E04](effects/L2-report.md#e04-explicit-retained-domains-and-usable-common-routes). No walker, archive parser or generic write abstraction is added.

The finite proof/support territory is:

- New bounded work records beneath this delivery directory: `proof/run-installed.mjs`, its frozen L4 configuration/oracles, source/package manifests, isolated baseline/candidate work and disposable evidence/source mirrors. The immutable `proof/baseline/source/` and closed report/receipt files are never execution working directories.
- New tenant support `test_env/support/stdo3-run-environment.mjs`: exact current standalone declaration/resources for P4. Reuse current `test_env/support/registered-graph-selection.mjs`, `installed-language-test.mjs`, `language-smoke-fixture.mjs`, `test_env/uat/public-setup.mjs`, and existing `fixtures/registered-selection-product/{index,native}.mjs` / `fixtures/language-smoke/{program,leaf}.mjs` through their declared interfaces. Existing historical companion helpers and receipts remain unchanged; the new proof must not silently call them.
- New focused tenant cases: `test_env/tests/t287-common-computational-library.test.mjs` (D02–D04), `t287-stdo3-run-environment.test.mjs` (K11), `t287-owned-process-lifetime.test.mjs` (E03 and actual installed command/HTTP use), and `t287-native-work-unknown-effect.test.mjs` (U1). These names are allocation for the bounded proof, not new production interfaces.
- Existing affected case files may be extended only for the selected obligations: `t288-admission-predicates.test.mjs`, `m5-s06-prime.test.mjs`, `t287-w2-05-static-binding-algebra.test.mjs`, `t287-static-declaration-closure.test.mjs`, `t287-tv5-rooted-topology-partition.test.mjs`, `t287-event-body-encoding.test.mjs`, `m5-worker-transport.test.mjs`, `t287-worksite-command-execution.test.mjs`, `t287-native-workspace-work.test.mjs`, `m5-terminal-quiescence-owner.test.mjs`. All other report-named existing tests are unchanged reusable support unless Executive admits a demonstrated affected edit.

The source-owned generator, package/lock/tsconfig and public contracts are validation inputs. No dependency/range/schema change is selected. Generated build, manifest and package artifacts are produced only in new isolated stages under the later grant. Main-tree generated bytes remain unchanged.

## 3. Domain and STDO source decisions

D02 preserves canonical-text false-on-encoding-error and exact ref-plus-digest equality. D03 preserves zero/one/multiple/duplicate multiplicity and candidate identity, with the existing `ambiguous` or `null` owner projections. D04 preserves the fixed unique witness-key domain and JSON-parsed canonical physical-row codec ingress at all three Event Store decode joins; it does not claim equivalence for arbitrary descriptor/proxy objects.

E01 retains every current NUL-joined caller and its historical domain; no delimiter-collision relation is silently certified as exact-key equality. E02 retains named text/digest/coordinate/native equalities, Product closure/reachability, actual immutable-object reuse, call-local module acquisition and exact-prefix derivation. No broader equality, solver, cache or immutable brand is selected.

K11 retains the generic constructor/validator and requires at least one unique explicitly declared STDO source with exact release URI shape and `stdo_source_manifest@1` record. Additional explicit dependencies remain lawful, disambiguated by dependency/basis identity and Context/role source bindings. An ambient install or label is insufficient.

Standalone data selects `corpusAccess:null`, `accesses:[]`, role `accessRefs:[]`, resource `pythonPath:null` and permitted `read_context`; actual record/member/span acquisition remains mandatory. If corpus access is explicitly selected, retain the existing source/representation/tool/role-access checks. No current generic runtime restriction to historical STDO 2.5, historical receipt migration or new schema is inferred.

P4's exact consumer is STDO 3.0.0 RC1 with the manifest above and actual `EXECUTIVE_BASELINE.md` member `fcef434630e270d216f494de97ee727ad46690db89a4b73edac4b88ff921c62e`; use the complete current `### Executive` and `### The three duties` spans as defined in the proof report. Source access proves access; its semantic use is assessed separately.

## 4. E03 physical facts, capture and bounded time

Executive selects `createOwnedProcessLifetime(child,bounds,observations)` as one attempt-local physical mechanism with termination request and completion. The [effects callable contract](effects/L2-report.md#callable-contract-and-irreducible-remainder) binds ownership, signal/probe/escalation, callback ordering, first failure, scope, uncertainty, disposal and cleanup. Node plus this existing physical remainder is selected; no package replacement or second process framework.

POSIX owned group absence, Windows direct-child termination, direct exit, stdio close, no-child launch failure, present/unknown scope and stream disposal stay separate facts. Each owner retains its existing projection; worker and command `terminationConfirmed` are not collapsed into one shared Boolean. A signal, child close or successful HTTP response does not prove group absence. No universal descendant claim covers a process that escapes its owned group.

Executive settles the HTTP capture boundary explicitly:

- Worker and command preserve their current direct-exit result/capture cuts.
- HTTP diagnostic stdout/stderr capture continues through actual stdio close if it occurs within the bounded lifetime; otherwise it ends at the final bounded drain/disposal. Direct exit alone does not end HTTP diagnostic capture.
- Late HTTP diagnostic bytes are never native result, HTTP-response or admission meaning. Response/port observations retain their own capture and predicate contracts.
- Finite late-output and inherited-pipe cases must distinguish all three owner boundaries.

For **each command and each HTTP probe**, the declared upper-bound calculation includes two `terminationGraceMs` phases and an additional bounded drain `min(terminationGraceMs,250)`. HTTP also retains its request timeout; all operations retain their declared launch/command timeout. The 5,000 ms owner allowance remains separate and does not hide per-operation cleanup. Preserve `required < inactivity`, `required < absolute`, and `absolute > inactivity`. Test exact-fit rejection, one-below/above, multiple operations and large grace against the displayed rule and calculation.

Every post-launch path finalizes through the shared lifetime, including invalid/missing port, request failure, observer error and unexpected owner exception. The first owner/observer error survives cleanup. Unresolved physical completion stops dependent work; no retry, success, rollback or terminal ABG closure is inferred. Retire duplicated signal/probe/escalation/confirmation/drain loops and the obsolete HTTP `waitForExit` once unreachable; retain the distinct emergency parent-exit best-effort path.

## 5. U1 unknown effect and P2 prefix conservation

U1 is a mandatory separate K08/K12 causal correction, not incidental cleanup refactoring. Reuse the admitted task relation as `abg/native_work_effect.ts::projectNativeWorkUnknownEffectTask(event,priorEvents,ownedPrefix?)`. Both `actor_invocation_failed/transport_exception` and `actor_process_termination_unconfirmed` require the exact native F_P task, actor/process/call/binding/basis/invocation/grant and causal prerequisites specified in the effects report.

The actual cause must belong to the admitted selected prefix; its optional prerequisite prefix is **before** the cause. Indexed selection alone is not authentication. Reject missing/foreign/ambiguous/after-prefix prerequisites and substituted causes. No started child gives no unknown-effect task; a valid read-only task has empty affected write scope.

Event Calculus withdraws only affected predecessor C0 currentness and preserves cleanup uncertainty, failure and unaffected observations. Runtime-history selectors include both causes as candidate worksite dependencies; indexed dependencies supply the same exact causal support as full arrays. Native source invalidation consumes the common join and existing path containment/intersection, retaining canonical-root and cause-owned binding checks. Verify indexed/lazy/full/incremental/cold agreement and the actual downstream gates. Do not invent changes, an after-observation, Result, rollback or successor.

Executive resolves the report conflict concerning P2: the sentence “P stays unchanged” in effects E04 is **not** an unconditional installed oracle. The actual acquired operation receipt/close handoff and owner projection control. Preserve any returned admitted successor, require no second admitted install, retain the original admitted install and account for both physical roots and residue. Assert unchanged prefix only when actual owner facts establish that equality. A refused outer operation or `target_failure` alone does not establish unchanged prefix or physical failure.

P2 uses fresh resources after P1 and a new materialization target for the same exact artifact/lock/scope under a distinct invocation. It does not retry, reuse, rebind, delete or migrate continuation17 or its held historical residue.

## 6. Finite proof contract and ordering

The proof report's P1–P5 labels control the installed lanes; effects P1–P12 are local case partitions nested under P5/related V obligations, not replacement lane names.

| Lane | Required actual join and independent oracle |
|---|---|
| P1 first | Installed Public workspace/verify/resolve/install/bind/catalog/view/Program conformance from staged `public-setup`, then first and warm exact execution resolution. Compare owner outputs with frozen fixture identities and Program expectations; include copy/mutate/crossed-lock negatives. No native actor. |
| P2 after P1 | Fresh second physical install with actual handoff; no second ABG admission, original install retained and physical candidate/residue inspected. Use §5's actual-prefix oracle. No retry or cleanup of residue. |
| P3 | Independently packaged language-smoke producer, actual installed Public start/external F_D result, new CLI result/replay reads and closed-prefix conservation. Literal greeting plus fixture outcome oracle; no F_P inference. |
| P4 | Current standalone STDO3 declaration → actual acquisition/admission/role projection/native request → one native registered selector → declared external F_D child → fresh reads after only the disposable source mirror becomes unavailable. Oracle selects A and exact compact JSON `{"service":"Atlas","status":"healthy"}` for the fixed recipient task. |
| P5 | All three actual E03 consumers including installed command and HTTP routes; separately authenticated U1 owner population and actual downstream currentness gates. Physical, controlled projection, native semantic and installed participant evidence remain separately labelled. |

P1 precedes paid native work. P2/P3 and mandatory local process/currentness checks precede P4. Within P4, constructor/permission/source/span/role/bound negatives must reject before actor launch. The frozen task, source factory/spans, policy, publication, participant, oracle and limits precede inspection of output.

P4 selects the proof report's exact Claude executable `/Users/jim/.local/share/claude/versions/2.1.303`, SHA-256 `d2da3b003dc08b88b7230469014fe3e1dc6fe94bc8f648e89b34175d30269370`, model `claude-opus-5-5`, effort `xhigh`, no tools, fallback, session persistence or semantic retry. Preserve 120,000 ms inactivity, 600,000 ms absolute and 1,000 ms grace. Availability is an execution prerequisite; no unperformed assessment receives a result. One native positive dispatch is the selected semantic population, under a later explicit L4 effect grant.

V1–V7 are allocated exactly by the [proof coverage table](proof/L2-report.md#capability-and-finite-case-coverage) and the reports' case partitions. They include the three static binders, all seven C constructors through their owning supported proofs, all partition refusals, exact closure/reuse, prefix/resource/codec versions and failures, current input/context, process uncertainty and complete-path costs. Unchanged evidence requires exact support matching; skip/count/file presence alone provides no closure.

P5 must include real disposable POSIX group/pipe/descendant cases, controlled probe/observer error laws, owner-specific capture and bounds, and a separately labelled Windows direct-child branch. A macOS run is not live Windows proof. U1 includes affected/sibling/other-workspace/prior-successor/absent-file/root/subtree/empty-write/overlap, forged or foreign cause, wrong grant/binding/call, missing or duplicate prerequisites, altered digest, causal order and later exit. Do not force unsafe unkillable processes merely to create uncertainty.

## 7. Source/package identity, measurements and exit

Preserve the non-executed [baseline manifest](proof/baseline/source-manifest.json), SHA-256 `4f4fa05d92e306327f921dcaa6e14f81d851a84d8727b9c3fc391a30e66f37d9`. Build separate baseline and candidate work copies from frozen inventory. Exclude old build/node_modules; use an independently inventoried dependency copy or authorized offline locked installation, never a mutable main-tree dependency symlink or silent network fallback.

The proof report's isolated TypeScript/generator/pack/install command forms and external declaration-only consumer are selected. No main-tree build/clean/prepack/test alias runs. Source-owned coordinate updates must match actual isolated emitted bytes before generator acceptance. Record toolchain, package/lock, pack list, artifact digest, manifest, installed exports and exact consumer source. Historical helpers/evidence are excluded from current-path proof by identity, not rewritten.

`proof/run-installed.mjs` is bounded glue for the four P1–P4 modes in the proof report; P5 is allocated to the focused source/installed cases above. It imports only the selected stage, uses exclusively new resources, retains evidence before cleanup, aborts on the first failed prerequisite and never falls back to main-tree or historical roots. It creates no production framework.

Before measuring, freeze the output correspondence. Unchanged contract/graph/value facts compare exactly; changed artifact/content/environment identities retain explicit producer-derived correspondence. Never globally remove digests, refs, paths or currentness to manufacture equivalence.

Measure baseline/candidate P1 and P3 on equivalent workloads, separating cold start, first/warm resolution, close/reopen and fresh read. P4 baseline specialization refusal versus candidate acceptance is a capability discriminator, not a speed ratio; one native execution records its actual cost. Include acquisition/native calls, bytes read/hashed/encoded/written, selector/suffix/body work, retained/sample/peak memory with actual scope, process cleanup counters, wall/CPU, package/temp/evidence footprint and instrumentation overhead. No speedup, universal minimum or heap limit is asserted in advance.

Two-sided retirement proves the new route is reached and the superseded selected algorithm is absent/unreachable in source, emitted modules, package and relied-on assurance support. Owner projections or deliberately retained non-equivalent E04 routines are not counted as failed contraction. Any path-sensitive mutation check uses a separate disposable copy.

L2 independent assessment and Executive disposition precede L3. L3 freezes implementation, support runner and oracles; L4 additionally freezes exact toolchain/candidate/resources and effect grant before execution. Basis drift, an unsupported owner change, missing prerequisite, first genuine failed seam, unconfirmed physical completion or required actor unavailability stops dependent work and returns exact causal evidence. Preserve first failure, actual prefix, physical residue and uncertainty; no blind retry, relabelled success or hidden effect loss.

Only conjoined applicable executed obligations plus independent assessment can support L5 library delivery acceptance. That opens the release-resumption gate; genuine lifecycle, qualification and human release acceptance remain later Product decisions. This L2 candidate itself establishes none of those outcomes.
