# L2 common computational library execution contract

**Current status:** L1/L2 are accepted. The later accepted amendment in §8 makes
Root's closed lifetime and source/role decisions operative before separately
granted source work. Implementation, affected proof and L5 delivery acceptance
remain open; the release gate remains closed.

**Historical R-L2-001 successor record:** [independent review 01](review-L2/review-01.md) requires the bounded timing HOW clarification in §4. The rejected [original cut](review-L2/subject-01/L2-execution-contract.md) and [original freeze](L2-candidate-freeze.json) remain preserved; the ten other supported predicates retain their stated scope pending exact successor assessment. This Writer stops after the successor freeze at the USER CHECKPOINT boundary. No L3 implementation or Git action is authorized by this correction.

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
| E03 physical lifetime | New `shared/owned_process_lifetime.ts`; adopt in `abg/worker_transport.ts::runProcess`, `implementation/worksite_command_helper.ts::{runCommand,runHttpProbe}`; update `product/worksite_command_execution.ts` budget rule/calculation. One internal shared timing mechanic in the same selected module serves lifetime waits and the affected owner timers in §4. Owners retain timing policy; shared code owns physical observation/cleanup and host-compatible waits only. |
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

### R-L2-001: preserve the admitted timer domain

Executive classifies the [review finding](review-L2/review-01.md#r-l2-001--preserve-admitted-long-timer-bounds) as an E03 HOW correction under the existing HANDLERS-008 effect envelope. The supported Node host clamps a raw timer delay above `2,147,483,647` ms to 1 ms. The selected worker grace and HTTP launch/grace admit values above that host maximum; worker inactivity/absolute limits and native-supervision wakeup values also reach direct timers. Copying those raw calls would permit an early timeout, KILL or confirmation over admitted input. Do not narrow Product admission, public schema or duration values to avoid this obligation.

Use **one internal cancellable monotonic remaining-time scheduling mechanic** within `shared/owned_process_lifetime.ts`, shared by its cleanup waits and the selected owner modules. It arms only positive host-bounded chunks no greater than `2,147,483,647` ms, recomputes remaining duration from monotonic elapsed time after each wakeup, and invokes the consequential callback only when the owner-selected wait is due. Recheck rather than treating a chunk callback as deadline proof. Preserve admitted positive safe-integer bounds and the native wakeup's positive finite-number domain; arithmetic, chunk rounding and deadline representation must not overflow into infinity, truncate a large wait, or make a positive remaining wait eligible early.

Apply that mechanic to:

- Common TERM grace, KILL confirmation and bounded completion/drain scheduling for all three E03 consumers.
- Worker inactivity lease renewal, absolute timeout and native-supervision wakeup scheduling in `abg/worker_transport.ts`. The owner still decides when progress renews a lease, which timeout class applies, and whether a native wakeup is consequential; the timing mechanic does not apply that policy.
- Command timeout scheduling in `implementation/worksite_command_helper.ts`, preserving its existing admitted `timeoutMs ≤ 2,147,483,647` and grace guards. A host-safe command may require only one chunk; no wider command domain is introduced.

HTTP request socket timeouts already use `min(request.timeoutMs,500)`; HTTP/command heartbeat and polling waits are already bounded. Preserve those owner policies and their distinct roles. They neither justify leaving an affected large grace/wakeup as a raw timer nor require a new polling controller. No new scheduler, runtime owner or timing registry is selected.

Cancellation clears the active host chunk and invalidates pending callbacks; rescheduling replaces the prior generation so a stale callback cannot fire the owner action. Lease renewal retains its owner-defined deadline relation and cannot reset the separately owned absolute limit. Each still-active due schedule invokes its consequential callback exactly once; a cancelled schedule invokes it zero times. Every acquired lifetime still settles exactly once, with the first owner/observer failure conserved. Strengthening cleanup may shorten the remaining wait or escalate immediately under the existing policy, but cannot restart a full grace/confirmation period or extend the already selected final cleanup bound. Preserve actual elapsed/late/unknown observations rather than claiming timely completion from the requested delay.

The finite local falsifier uses a controlled monotonic clock and controlled host timer callbacks: host maximum minus one, maximum, maximum plus one, large admitted finite duration, positive fractional native wakeup, premature chunk callback, cancellation before/between chunks, renewal/reschedule with stale callback, absolute-limit independence, and strengthened cleanup before/during confirmation. Assert no host arm exceeds its bound, no consequential early firing, exact cancellation/reschedule behavior, first-failure preservation, exactly-once active action/lifetime completion and no final-bound extension. The existing `t287-owned-process-lifetime.test.mjs` allocation and selected worker/command test territory carry these cases; no days-long wait or new test framework is required. Controlled timing-law results do not substitute for P5 real process/installed-owner evidence or P4 actual native execution.

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

## 8. Accepted retirement amendment — 2026-10-21

The [accepted activation](realization/accepted-retirement-activation-01/activation.md)
incorporates the exact lifetime HOW plus [closed correction](realization/review-checkpoint-01/review-disposition-supplement-02.md)
(`c60296c7566ee9caae6963c9759d884b48eee2712589e5e481299e6a3843eed8`),
and source/role D1–D3 [HOW](realization/stdo3-role-source-reentry-01/HOW-proposal.md)
(`3f163754f48d72a2b8577c5c425951f8fa0ff5b9cd80da0d4042ad6084179c78`)
with its [closed review constraints](realization/review-checkpoint-01/review-disposition-supplement.md).
This later amendment controls conflicting earlier territory and retention clauses.

It explicitly supersedes the earlier ordinary companion-helper retention and
`b0582ef7…` R3.2 zero-artifact-on-transport-exception rule for genuinely assessed
but unconsumed artifacts. Final physical facts and successful Process admission
control terminality; raw exit only ends capture. Require prepared-plan
correspondence before handoff; conserve committed artifacts through later probe
failure and retain the same original Error. The complete six-step correction and
failure cases are incorporated, not reduced to these reminders.

- Lifetime Writer: five ABG files `worker_transport.ts`, `actor_process.ts`,
  `replay.ts`, `runtime_liveness.ts`, `event_calculus.ts`; the existing fresh-process
  helper and named affected cases in the accepted retirement/proof map, including
  authentic F04A/rawResultOwner artifact assessment. U1 setup/test edits belong to
  the fixture Writer. Shared lifetime/native-work-effect owners retain their contracts.
- Fixture Writer: U1 unknown-effect test/shared currentness-consumer setup and the
  language-smoke, language-structural and registered-selection private canonical/hash
  implementations. Retain changed-predecessor and supplied-context cases. Numeric-key
  ordering is shared-canonical conformance correction, not universal old/new equality;
  renderer A JSON.stringify and structural NUL semantics remain distinct.
- Role/source Writer: D1–D3's exact default-library source/generator/member,
  support/fixture and affected-test territory, plus the `root-installed-environment`
  preparation callback passing actual `bootstrapPackage`, never later `installedRoot`
  or ambient fallback. Existing P4 source spans, policy and oracle remain unchanged.

P5's existing `context.signal` cancellation guard is selected for a separate proof
activation; preserve occurred effects, finally/first failure and existing bounds.
One combined isolated candidate follows the disjoint source work, not per-stream
builds. Main generated bytes remain unchanged. This transcription grants no
source, test, runtime, build or Git effects; Root separately activates those steps.


## 9. Root-selected exact-key entrypoint amendment — 2026-10-21

Root selects the owner's identified inherited K01/D04/E01 common-entrypoint debt
for the bounded [path/grant](realization/exact-key-canonical-entrypoints-01/path-grant.md)
and [calculus amendment](calculus/L2-report.md#9-root-selected-exact-key-entrypoint-amendment--2026-10-21).
This supersedes earlier retention of the `definition_binding_mechanics`
`hasExactKeys` export name and its four caller spellings only. E01 retains the
actual Unicode NUL-joined relation and every existing domain/failure decision.
Other owners' local NUL aliases are outside this grant.

The additional exact source territory is seven production files:
`shared/{admission_predicates,operation_definition_coordinate,definition_binding_mechanics}.ts`,
`validator/conformance_definition_bindings.ts`, and
`product/{catalog,install,project_read}_definition_bindings.ts`. Delete the JSON
exact-key wrapper's duplicate algorithm while retaining its typed signature and
delegating to common `hasExactKeys`; delete the identical coordinate-private
algorithm and import that common function. Rename the shared legacy NUL
import/use/export and all nine calls across the four consumers to
`hasUnicodeNulJoinedKeys`, removing the misleading export without an alias.
There is no exact-equality substitution in the legacy NUL domain.

Only `t288-admission-predicates.test.mjs` changes in proof support: honest export
identity plus explicit absence of the old shared name. Preserve the 93 historical
preimages and the existing type/refinement/error/trace tests. Namespace/dynamic
inventory and exact body correspondence are recorded before edits; an additional
material consumer or different relation returns to Root before expansion.

The selected feedback disposition is two duplicate algorithm deletions and one
misleading export rename with existing common owners, not a performance claim.
Keep actual performance evaluation separate; the wrapper can add call overhead.
This activation permits the two live L2 append amendments, bounded work records,
those eight source/test files and mechanical source/syntax/type-shape checks only.
No build/typecheck/emission, runtime imports, test/process/provider execution,
Git, ticket/GOALS edit or Reviewer activation is granted. Main generated936 and
the frozen role/source cut remain protected. Full affected proof and independent
acceptance remain for the single combined isolated candidate.


## 10. Root-selected common-consolidation design re-entry — 2026-10-21

Root's [decision](realization/common-consolidation-reentry-01/decision.md),
[plan](realization/common-consolidation-reentry-01/plan.md) and [attributed conjunction](realization/common-consolidation-reentry-01/review-conjunction.md)
record three closed independent read-only assessments of Claude post `e567c24a…`.
The critique is substantially upheld as a selected-library design-coverage gap.
Original L1/L2 acceptance and real contractions retain their exact historical
subjects; common HOW `cb8dae9f…` is unchanged pending frame-specific proposals.
This current routing supersedes earlier candidate-ready/retention assumptions only
where the newly selected obligations require owning re-entry.

All five bounded families are selected before the combined candidate:

- C1: one EC-owned lifecycle law reused by actual projectors, canonical physical
  finalization guard and exact shared transport-field type reuse where identical.
  Keep never-created-child/exit/scope/Actor-consumption distinctions; conjoin accepted
  command/HTTP original-cause/final-facts/CLI-retention HOW `8fb5ca19…`/`93d088fb…`.
- C2: retire 11 private equalities into typed common text/digest mechanics with
  explicit owner throw/false projections. Keep seven text/throw, one digest/throw
  (`parent_rehydration`) and three digest/false (`open_call`, `c_call`, `retry`).
  No relocated unchecked JsonValue casts or shallow-shape admission of lazy views.
- C3: bounded K04/K08 checked fact read/selection; inventory 13 local one bodies
  and five common calls/three modules; retire equivalents including U1. Static
  owner payload/digest contracts preserve malformed singleton versus absence,
  admitted/raw/prospective categories, owner causal joins/identity/registries and
  justified ordered-first raw behavior supported by 17 controls.
- C4: shared synchronous canonical record framing for pendingInteractionBodyDigest,
  completedRetryProgressPlanDigest and writeReplayBody; preserve lazy/eager
  acquisition and sink-error/side-effect trace.
- C5: one shallow Boolean record mechanic with truthful typed wrappers and one
  key comparator per actual relation. Inventory five shared record/five NUL bodies
  and 38 local guard bodies/36 files. Decide NUL collisions from actual supported
  caller domains, not invalid erased tests alone; completed exact-key source remains.

The new lifecycle partition is S2/Root priority P1 and a delivery blocker: started
then unconfirmed before Run terminal disagrees between actor projector and EC;
confirmed exit then Run stop without Actor terminal consumption loses EC pending
cleanup because Run stop enumerates only actor_process_live. The latter violates
the accepted single Actor cleanup-token law. A is an observed disagreement only,
not a choice of which current implementation is correct. Root's b058 R3.1/R3.3
and d3 R2.3 reacquisition selects the token frontier at matching Run stop/failure,
distinct from pre-Run physical uncertainty and later Actor consumption; c526
preservation did not authorize a new initiation frontier. These are source counterexamples,
not observed incorrect Run closure; prior bounded no-counterexample review does
not close them. Existing physical/no-child distinctions remain valid.

Default to canonical implementation. Retention needs a concrete supported caller/
outcome distinction, falsifier and owner/disposition; absence of proof stays open.
Each target names callable contract, consumers, retired body/route, replacement,
justified variants and affected proof. Use bounded retirement/type checks, not a
generic duplication framework. Direct typed imports are valid callables. Preserve
failure/equality/admission domains until expressly decided. Later owning HOW
activation must reconcile §§1/6/9 with Product 1239–1257: optional helper deferral
applies outside this selected library. This is not an unbounded all-helper sweep.

Lifetime `4bfdf7e…`, role `17b1b6d…`, fixture `1bbc47ac…`, P5 guard `d24b8d7d…` and
exact-key `ed4ca1b…` are frozen uncommitted source increments with syntax/static
readiness only. Source retirement is retained; accepted command/HTTP helper design
remains unimplemented and must conjoin C1. Historical T288 D03/04/D07/D08/D09 uptake
remains credited; the general reader obligation does not reopen T288/T289.
Performance, a second live lazy-view bug and P5 timeout cause are not established.

Root separately activates the lifecycle/value/history design Writers. Combined
candidate, P1, P5, P4 and dependent execution are held until new design/source
conjunction and a later exact effect grant. L4 remains partial on older subjects;
L5 acceptance and release resumption remain closed. Last remote checkpoint
`400d763…` was clean/0-0/remote-equal at that historical cut; current successor is
uncommitted. This grant permits only the four current status/routing documents
and this compact re-entry record. No source/test/build/import/process/Git/Reviewer
effects; preserve prior freezes, failed cuts, common HOW and main generated936.


## 11. Root-conjoined bounded designs and source boundary — 2026-10-21

The [current conjunction](realization/common-consolidation-conjunction-01/decision.md)
ratifies the closed frame designs and literal corrections in the owning common,
terminal-quiescence and C2 HOWs. This section supersedes §10’s pending-proposal
routing and affected retention assumptions. Historical L1/L2 and frozen proposals
remain unchanged; their old live-document input pins are historical predecessors,
not failed proofs after these announced amendments.

- C1 HOW `122df37438d9f5930fcc83a3159bc0b3b8b5e6927c4546288a32d11a8a96a910`,
  freeze `6114dba2945fca732df86e852b638261da876c91df31263c8289c871137020ee`:
  accepted bounded DESIGN for one EC-owned lifecycle decision and exact consumers,
  common physical artifact-read guard and selected type-field reuse. Ratify the
  admitted pre-event matching-Run Actor census, one token/member at Run stop/failure
  until Actor consumption, and source-terminal attribution. Supersede only b058
  R3.3’s redundant serialized `cleanupPendingRows` payload clause. Preserve the
  post-Run-start prohibition; physical child/unadmitted start retains unresolved
  semantic cleanup. Source counterexamples remain implementation/proof obligations.
- Cross-consumer HOW `8fb5ca195bab507f2203a67e07937e4d7e9bab982b638ff3e974fecfd5d2d7ec`,
  freeze `93d088fb4ad4a1ed1b2a846a1bfb54e2a220012e9c6fdfbcee953c8d6eb96bf8`:
  accepted bounded DESIGN. Before fallible finalization, command/HTTP main retains
  the same immutable canonical facts and raw captures outside suppressed observers,
  preserving the original cause. Exact create-only `process-failure.json` plus the
  internal stateless inspector supplies failure-side observation without success
  exchange or ABG/Product promotion. Helper source remains unimplemented.
- C3 HOW `5e2169845cd3015ea6ed99223044b89ba7dc18788f1d73236b929f075f8356e7`,
  freeze `368854bc8bb340677e7afd278c4ca69e30b2f6355899073b426298c9fccf0e0a`:
  accepted bounded DESIGN for 13 exactly-one retirements and checked-record/digest
  composition, preserving filter/cardinality work, owner identity/joins/registry
  actions and raw/owned/prospective distinctions. Both malformed execution-basis
  null-digest partitions explicitly select owner null/refusal; common exceptions
  and later unrelated body errors remain. C3 requires truthful C5 JSON wrappers.
- C2/C4/C5 proposal `e1ebd2047eab1aa7cfb56ce7a4384279e8a40c10dbdbdaf815442707e0e89246`,
  freeze `6ef9e727844242d82295291c41847e5a1fb1417341b717c3301d53df8d1cadc0`:
  bounded callable contracts and selected retirement directions accepted, not full
  migration/source readiness. Scope is 24 simple equality bodies, three framers,
  five shared plus 38 local guards and five shared plus one private NUL key body.
  Installed equality uses exactly `(value) => product.canonicalJson(value)`;
  default-library collided/inherited keys select false through exact own-key checking.
  O-TYPE/O-RESOURCE/O-SHAPE/O-CODEC/O-SCHEMA/O-KEY and two native composite
  classifications remain OPEN. Their finite proof maps are required, not executed.

Default common implementation; a retained variant needs a supported distinguishing
input/outcome, owner and falsifier. Missing proof stays open. All selected C1–C5
work is inside the library prerequisite, with no automatic 5.1 deferral. Direct
typed imports remain valid; no generic duplication framework or new runtime is
selected. The five earlier source freezes remain static/syntax readiness only;
Root’s fresh 39-file/two-deletion custody verification adds no execution proof.

After the authorized checkpoint, Root may separately activate dependency-ready
C1/cross-consumer source while finite value owner decisions continue. C3 depends
on the accepted truthful C5 wrapper contract. An unresolved owner boundary holds
its affected value migration; complete required design/source conjunction holds
the combined candidate/build and P1/P5/P4/dependent execution. Then one isolated
candidate, proportionate affected/installed proof and independent L5 precede release
resumption. No new broad design-review campaign is selected. L4 stays partial on
older subjects; L5 and release acceptance remain absent. This transcription grants
no source/test/build/import/process/provider/Git/Reviewer effects and preserves
main generated936 and all prior frozen/failed cuts.
