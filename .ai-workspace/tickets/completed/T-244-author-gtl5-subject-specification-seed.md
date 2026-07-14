# T-244 - Author The Exact ABIogenesis 5.0 Feature Register

- id: T-244
- title: Author the exact ABIogenesis 5.0 feature register
- type: planning
- ticket_category: feature_register
- status: completed
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- owner: abiogenesis
- priority: critical
- governance_scope: SPEC_METHOD, TICKET_METHOD, ODD_METHOD
- change_class: goal_reprice
- re_entry_point: GOAL-035 feature and closure register
- created_at: 2026-07-12
- updated_at: 2026-07-15 (DS-3 and Prime closure reconciliation)
- closed_at: 2026-07-13
- source_ticket: T-242
- admission_condition: T-242 Stable-First Superseding Decision Record is present
- dependencies:
  - T-242 stable-first ruling (not T-242 closure)
  - completed T-218 revision-5 candidate and capability dispositions
  - completed T-220 and T-223 built-proof surfaces
  - A5 completed-code three-view design register and its review dispositions

## Intake Triage

1. Substantive: yes. The prior ticket mixed a GTL-5 campaign seed with the
   feature register and made the campaign the delivery mechanism.
2. F_H ruled that 5.0 is the stable full-product baseline before dogfooding.
   This ticket therefore owns the exact no-silence feature register and no
   specification, design, code, campaign, qualification, or release work.
3. The first affected layer is GOAL-035 scope, so `goal_reprice` is the one
   change class. T-249 propagates the selected truth into constitutional text.
4. This ticket depends on the recorded T-242 ruling, not T-242 closure. T-249
   depends on this register, and T-242 closes after T-249; this ordering removes
   the former dependency cycle.

## Scope Law

GOALS, INTENT, PRODUCT, and requirements own constitutional 5.0 scope. This
ticket is the sole exact derived traceability and closure register over that
scope. It cannot add, remove, or reinterpret constitutional meaning. Plan
prose, retired leaves, design commentary, campaigns, and downstream backlogs
do not create a competing register.

A row is retained when it is required by present-tense constitutional law, a
supported stable-product use case, a definition-bearing claim, or a direct F_H
ruling. Delivery difficulty changes sequencing, not scope. Only operational
self-use/dogfood evidence moves to 5.0.1 under the stable-first ruling.

`odd_glc` enablement is one downstream-consumer test. It is not the definition
of feature completeness, and odd_glc 1.0 is not a 5.0 release dependency.

Every code-bearing row must enter through a singular ticket and accepted
three-view domain/sequence/state design when execution starts. This register
does not pre-create another leaf DAG and does not authorize code.

## Exact Retained 5.0 Register

Status terms in `Built proof` are current facts, not closure claims. `candidate`
and `blocked` carry the verdicts in
`build_tenants/abiogenesis/typescript/design/A5_COMPLETED_CODE_DESIGN_STAGE_REGISTER.md`.

| ID and feature (T-218 coverage) | Requirement/product authority | Built proof and design status | Remaining 5.0 work | Owner | Dependency | Exact release gate | Material risk, hedge, and F_H disposition |
|---|---|---|---|---|---|---|---|
| `A5-F01` Exact product, install, workspace, binding, lock, and ABG-owned catalog foundation (`CR-P-01/02`, `CR-M-01..08`, `CR-C-01/02`, `A5-EX1`) | PRODUCT installed-product/catalog law; REQ-P-INSTALL; REQ-P-PUBLIC-CONTRACTS; BINDING-015 | T-223 packed product/workspace/catalog foundation; `M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN` is `candidate` | Close design review; prove exact resolve/verify/install/bind/admit, dependency lock, provenance-preserving reads, explicit re-resolution, and source independence over final bytes | ABIogenesis install/catalog boundaries | accepted foundation design; publication rows | Fresh source-blind install binds exact product and workspace identities; conflicts fail typed; no mutable-source fallback | Risk: source/install/product collapse. Hedge: exact manifests, digests, explicit roots, packed fixture. Residual: trusted local filesystem. `retain_5_0` |
| `A5-F02` GTL declaration, raw admission, serialization, typecheck, GraphFunction publication, and semantic compiler (`CR-P-07`, `CR-GF-01/07`, `A5-GF1`) | PRODUCT GTL/atom law; REQ-L-GTL3 contract-law families; REQ-P-PUBLIC-CONTRACTS | T-220 gate 35/35; `M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN` is `candidate` | Accept design; publish exact native/schema/corpus contracts; ensure malformed authored and serialized GTL fails before execution; keep GraphFunction as sole callable kind | GTL authoring/admission/compiler boundaries | F01 publication substrate | Packed candidate declares, admits, typechecks, serializes, publishes, and invokes lawful GTL; malformed/category-invalid GTL is typed non-execution | Risk: LLM invents hidden structure. Hedge: native types, raw admission, semantic compiler. `retain_5_0` |
| `A5-F03` Complete seven-term C algebra, C-conformance-to-ExecutionBasis join, uniform C-call enclosure, stage interiors, hooks, node/overlay application, and runtime residuals (`CR-GF-08..12`, `CR-RL-01..06/11`, `A5-GF1`, former DS-2) | PRODUCT C/compute spine; REQ-L C algebra; REQ-R INTERPRET/FN-COMPOSITION/EVENTS/PLUGIN-SEAMS/WITNESS/ITERATION | T-259 through T-262 provide the retained generic atoms; T-271 closes complete seven-constructor interpretation; repaired T-267 closes whole-program conservation while retaining the T-270 effects fence | Bind the accepted interpreter and conservation authorities to the single public catalog router in T-270; connect F_H continuation through the same receipt family in T-272; retain T-268 as capability admission | ABIogenesis GTL/runtime semantic boundaries; separate singular leaves per accepted design | F02; T-270 then T-272/T-268 | Same admitted Consensus graph recompiles without feature-specific code; mixed and nested non-Consensus fixtures pass; public effects remain blocked until exact catalog/start authority admits them | Risk: consensus-specific atoms or another mega-leaf. Hedge: same-graph recompile oracle, non-Consensus fixtures, per-boundary leaves. `retain_5_0` |
| `A5-F04` Declared instruction/protocol assets and malformed F_P output admission before materialization or closure (`CR-GF-09/10`, PAYLOAD-028, PLUGIN-SEAMS-006) | INTENT malformed-output law; PRODUCT declared result path; REQ-R PAYLOAD/HANDLERS/PLUGIN-SEAMS; REQ-P-QUAL | T-256 closes the declared execution-context join; T-257 closes exact result-contract admission; caller-authored derivation truth and prompt/result contract substitution reject before effects | Carry admitted result truth through T-270 public invocation and T-272 continuation; prove the installed malformed-output path in T-276 and final qualification | GTL instruction declarations; ABG F_P/result admission boundaries | F02/F03; T-270/T-272 | Malformed, incomplete, contradictory, or unattributed F_P output cannot write product truth or close work; valid output retains producer, evidence, lineage, result, and replay refs | Risk: likely malformed probabilistic output. Hedge: strict declared response admission at the pre-write boundary. `retain_5_0` |
| `A5-F05` Addressable public-contract catalog, canonical schemas, vocabularies, conformance corpus, operation identities, capability identities, and generated publication parity (`CR-RL-09/10`, `A5-SP1`) | REQ-P-PUBLIC-CONTRACTS; REQ-P-SCENARIOS; PRODUCT public distribution | The current Prime-contracted public surface publishes 19 operation identities, 82 schemas, and 40 generated assets from one operation register and one schema projector; Consensus and full capability publication remain open | Publish the nine Consensus projections and two vocabularies through T-274; complete the exact 36-operation roster and 16 mandatory capability identities; project T-268 manifest coverage and prove source/generator/output parity | Public-contract compiler/generator and owning semantic modules | F01/F02/F04; T-274/T-268 and retained-feature owners | Source-blind consumer resolves every normative contract by stable identity/digest; exact census and parity gates pass; no operation/capability claim exists only in prose | Risk: subset proof presented as complete. Hedge: exact manifest census against T-244 and requirements. `retain_5_0` |
| `A5-F06` Versioned public SDK and thin `abg.cli` graph shell for workspace, install, catalog, invocation, status, result, replay, conformance, witness, observer, tuner, and lifecycle operations (`CR-C-01..06-I/09..11`, `A5-EX2/EX3`) | INTENT public CLI; PRODUCT public operator contract; REQ-P-POLICY/PUBLIC-CONTRACTS | The Prime-contracted SDK/CLI surface publishes 19 operation identities through one definition register and retained typed dispatch; complete 36-operation parity remains open | Implement the 17 retained missing identities through the existing SDK contract; T-270 supplies the public catalog entry and T-272 supplies continuation; no CLI orchestration or private runtime imports | Public SDK plus thin CLI adapter | F03-F05 | A source-blind agent completes every retained operation through SDK and CLI; both paths produce the same contract truth; CLI owns formatting/ignition only | Risk: shell becomes second controller. Hedge: operation parity and structural no-worker/event/continuation path gate. `retain_5_0` |
| `A5-F07` Complete interactive operator loop: start, truthful stop/hold/gap, lawful frontier/actions, typed F_H act, resume/restart, and convergence (`CR-GF-02-R/05/06`, `CR-C-06-R/07/08`, `CR-RL-04`) | INTENT primary workflow; PRODUCT operator loop; REQ-P-POLICY and interaction/event law | T-258 publishes typed F_H response and resume admission; T-267 preserves the static continuation locus; runtime opening and continuation remain fenced | T-272 must open interaction from current engine-held receipt truth, admit response/resume, and continue through the same T-271 interpreter and receipt family; retained read operations remain DS-5 work | ABG runtime interaction/admission/projection boundaries; SDK/CLI adapter | F03/F04/F06; T-270 before T-272 | Installed `start -> truthful stop -> inspect/actions -> agent edit or typed F_H response -> resume/start -> converged` passes without a second controller | Risk: deferral removes the actual product workflow. Hedge: definition-bearing end-to-end scenario. `retain_5_0` |
| `A5-F08` ABG SYSTEM-owned agent-invocable governed Consensus GraphFunction over ticket or typed subject (`CR-H bounded re-entry`, `A5-GF2` narrowed) | Direct F_H CR-H ruling; PRODUCT atom criterion after T-249; REQ-L GraphFunction/recursion/composition; REQ-P-SCENARIOS | The canonical pure-data GTL body, exact compiler census, closed native Consensus family, generic runtime atoms, complete interpreter, and static conservation are implemented without a Consensus runtime branch | T-274 publishes nine schema projections, two vocabularies, installed Module, and SYSTEM catalog entry; T-275 completes ticket/result projection; T-268 publishes capability coverage; T-276 proves installed scenarios | ABIogenesis owns reusable GraphFunction; hosts/catalogs own profiles/bindings/policies/overlays | F03/F04/F06/F07; T-270/T-272/T-274/T-275/T-268 | From packed candidate, an agent invokes a real ticket with two profiles; fixtures converge, recurse on dispute, and reach round-limit/F_H; same path works in current, alternate explicit, and caller-created temporary workspaces; result/replay/triage action readable; no shell orchestration or mutation | Risk: repeat imperative counterfeit. Hedge: mandatory Mermaid domain/sequence/state review, executable GTL body, semantic gap oracle. `retain_5_0` |
| `A5-F09` Public list/describe/apply semantics for `graph_function`, `node_type`, and `overlay`; only GraphFunction callable (`CR-M-05`, former T-179/T-228) | PRODUCT recursive catalog/ODD ownership; catalog/node/overlay requirements | Catalog kind vocabulary and GraphFunction selection exist; complete node/overlay public application proof is not closed | Name exact public inspect/application operations and semantic compiler checks; prove node/overlay remain typed declarations, never alternate callable programs or runtime controllers | GTL/compiler/catalog application boundaries | F02/F05/F06 | Packed fixture lists/describes all retained kinds, applies node/overlay lawfully, and refuses callable selection for non-GraphFunction rows | Risk: downstream flavor leaks into kernel or creates another controller. Hedge: three-layer ownership and callable-kind gate. `retain_5_0` |
| `A5-F10` Runtime truth: admitted events, replay ordinal, provenance, lineage, correction, continuation, consequence, projections, and typed failure (`CR-P-03`, `CR-GF-10..12`, `CR-RL-01/02/05/06`, `A5-SP3`) | PRODUCT ABG truth ownership; REQ-R EVENTS/WITNESS/ITERATION/FRAME/PAYLOAD | Large existing kernel/test corpus; T-223 result/replay steel thread; design rows expose basis-join and blocked-path gaps | Close retained runtime residuals at their semantic boundaries; ensure events are written only by admission boundaries and read models remain passive; publish exact event/diagnostic census | ABG runtime admission/projection boundaries | F03/F04/F05 | All retained installed scenarios cite attributable event, result, replay, correction, continuation, and closure truth; malformed/basis-fork paths stay typed non-close | Risk: passive carriers act as controllers or array order becomes truth. Hedge: accepted domain/sequence/state diagrams plus ordinal/store pins. `retain_5_0` |
| `A5-F11` ABIogenesis self-conformance with no product exemption (`A5-SH0`, `CR-RL-10`) | INTENT item 12; PRODUCT self-conformance; REQ-P-SELF-CONFORMANCE/QUAL | Constitutional surfaces and conformance machinery exist; complete exact-candidate audit not yet closed | Inventory exact method/rule/source and constitutional/design/code/proof/ticket/public/release surfaces; typed findings/dispositions; real-tree and seeded-negative gates; no self-host implication | T-247 compliance owner; compiler/conformance boundaries | T-249; F05; retained feature implementations | Exact candidate passes published conformance under exact bases; seeded violation fails with typed evidence; snapshot cites result | Risk: compliance by manifest assertion. Hedge: source-blind inventory, negative fixture, executable-change witness. `retain_5_0` |
| `A5-F12` Current observer/tuner as replay-grounded, draft-producing capabilities (`A5-SH4` stripped of self-build coupling) | INTENT item 11; PRODUCT observer/tuner and reflective boundary | Existing observer/tuner predecessor behavior; no exact 5.0 candidate qualification | Prove truthful halt, replay-grounded findings/drafts, actor/policy attribution, ratification/rejection, replay-visible acts, and injected negative over ordinary candidate surfaces | ABIogenesis observer/tuner GraphFunctions; T-247 qualification | F06/F10/F11 | Exact candidate installed proof shows drafts never mutate authority and one negative returns expected non-green truth | Risk: observer/tuner becomes mutation authority. Hedge: draft-only contract and attributed F_H ratification gate. `retain_5_0` |
| `A5-F13` Native no-host operation plus one bounded Codex CLI/skill compatibility projection (`CR-P-05/06`, `CR-X-01..07`, `A5-CX1`) | INTENT native/adapter law; PRODUCT host compatibility; public contract requirements | Native CLI/SDK and capability preflight substrate exists; complete operation parity not closed | Finish native retained scenarios; implement Codex projection strictly over public CLI/SDK; compare fixed digests or live schema/replay invariants; prove host failure leaves native path usable | Native SDK/CLI; Codex adapter owns projection only | F06-F08 | Native path completes with no marketplace; Codex path delegates same invocation; structural differential finds no worker/event/traversal/continuation authority | Risk: marketplace skill cohabitation creates copied controller. Hedge: one host-neutral descriptor and adapter structural gate. `retain_5_0` |
| `A5-F14` Packed candidate, clean install, Hello World, and bounded installed live proof (`CR-P-04`, `A5-EX1`, former DS-1) | INTENT source-blind install; PRODUCT distribution; REQ-P-INSTALL/QUAL/SCENARIOS | T-223 gate 70/70, packed Hello World, source isolation, and package dry-run remain green; final 5.0 installed Consensus path is not yet published | Re-run after T-270/T-272 and T-274 through T-276; prove recursive dependency materialization/cycle refusal, final exact manifest/source isolation, malformed-output refusal, and at least one live sunny-day sandbox | Packaging/install/runtime owners | F01-F06/F08 | Exact tarball fresh-installs; Hello World and a live F_P path return typed result/replay; no source/private import; cycle and malformed-output negatives pass | Risk: source-tree test mistaken for product proof. Hedge: packed-only clean root and source isolation. `retain_5_0` |
| `A5-F15` Complete qualification enforcement and one bounded self-certifying release read model (`CR-RL-07`, `A5-SP1/SP2`, `A5-R1`) | REQ-P-QUAL; RELEASE_METHOD; PRODUCT exact cut | Existing build/lint/test and candidate manifest machinery; diff witness, exemption, bypass, and exact full-product aggregation remain open | General executable census; zero unexplained legacy exemptions; packed/live-only retained proofs; red/bypass refusal; cite owning evidence without second checker | T-247 | F05/F11-F14 and all retained rows | T-247 returns one green exact-candidate compliance result; every changed executable is witnessed; mandatory red/bypass cannot promote; snapshot binds exact bytes | Risk: paper manifest or proof framework proliferation. Hedge: one read model over owning proofs plus negative gates. `retain_5_0` |
| `A5-F16` Direct immutable 5.0 RC window and final release (`A5-R1`, old DS-8 narrowed) | PRODUCT exact release; REQ-P-QUAL RC/final law; RELEASE_METHOD | 4.6 rc.3/odd_glc 0.1 release discipline is predecessor evidence; no stable 5.0 cut exists | Freeze exact candidate; publish immutable RC; qualify latest accepted RC; reconcile final-only delta; fresh-install final; push branch/tag/checksums/record | T-248 | every retained row, T-247, T-249 | Exact `5.0.0` Git/tag/tarball/manifest/checksum/install/proof identities agree after RC window; no dogfood or GLC rung | Risk: release identity diverges or dogfood silently re-enters. Hedge: exact-cut manifest and explicit no-second-rung gate. `retain_5_0` |
| `A5-F17` Downstream catalog compatibility and three-layer ownership sufficient for odd_glc (`CR-P-04`, old `A5-EX4` narrowed) | INTENT odd_glc independent product law; PRODUCT ODD ownership; ODD_METHOD | Released odd_glc 0.1/rc.3 evidence and T-223 fixture prove bounded predecessor compatibility, not odd_glc 1.0 or dogfood | Ensure retained install/catalog/node/overlay/GraphFunction/public contracts can host a declarations-only flavored catalog; use fixture/current release evidence only; do not require odd_glc 1.0 | ABIogenesis owns generic substrate; odd_glc owns its later declarations/product | F01/F02/F06/F09/F14 | Bounded downstream fixture binds and invokes without local runtime/controller; no odd_glc release or data-mapper campaign gates 5.0 | Risk: downstream product becomes hidden compiler or release dependency. Hedge: generic fixture and explicit product separation. `retain_5_0` |

## Explicit Non-5.0 Dispositions

These rows prevent exclusions and successor work from disappearing by silence.

| ID | Candidate scope | Disposition and re-entry trigger |
|---|---|---|
| `A5-D01` | P4/I4/B5/S5/C1/C2/R5 two-stage self-host and operational self-use proof (old `A5-SH1..SH3`) | `deferred_to_5_0_1_dogfood`. Exact 4.6 rc.3 remains evidence only. Installed stable 5.0 plus odd_glc 1.0 first governs the 5.0.1 subject through T-245/T-246. No 5.0 self-host capability or release gate remains. |
| `A5-D02` | odd_glc 1.0 maturation, full data-mapper campaign, and released ABG/GLC pair | `deferred_to_post_5_0`. These are downstream/dogfood work after T-248, not missing 5.0 functionality. |
| `A5-D03` | Update, disable, unbind, uninstall, retirement, revocation, and supersession (`CR-M-10A/B`) | `deferred`. Re-enters with a concrete installed-product lifecycle use case; initial exact install/bind remains F01. |
| `A5-D04` | Generic Review product, unrelated homeostatic GF2 compositions, scheduler, automatic wake, recurrence, and direct ticket mutation (remaining `CR-H`) | `excluded`. Only bounded agent-invocable Consensus F08 is admitted. Re-entry requires a new concrete product use case and product/intent decision. |
| `A5-D05` | Hosted registry/storefront, ranking, billing, signing, licensing, IAM/RBAC, multi-user administration (`CR-M-09`) | `excluded` on the trusted-desktop boundary. Re-enters with a hosted/multi-user product decision. |
| `A5-D06` | Multiple host adapters, generic pass@k/harness products (`A5-Q1/Q2`) | `excluded`. One bounded Codex projection remains F13; additional hosts or research products require demand. |
| `A5-D07` | Hostile local-object/filesystem forgery, cryptographic substitution, remote attestation, and tamper-proofing | `excluded`. Re-enters only if the trust boundary changes or a supported-path reproduction requires it. |
| `A5-D08` | Universal proof-carry-through migration for every legacy edge (`CR-RL-12`) | `deferred`. New retained proof-bearing paths declare required carry-through; universal migration re-enters with a universal coverage claim. |
| `A5-D09` | Shared promotion-method law (`CR-SM-01`) | `deferred_to_method_intake`. Requires specification_methodology authority; it is not silently made an ABIogenesis engine feature. |
| `A5-D10` | Full installed-product source-governance induction (`B-010`) | `deferred_to_5_0_1_dogfood`. Manual STDO plus accepted-design gates govern 5.0 construction; installed stable 5.0/odd_glc 1.0 governs the successor only. |

## Nothing-Lost Map

| T-218 source family | Register destination |
|---|---|
| `CR-P-01..07` | F01, F02, F06, F11, F13, F14, F17, D01/D02 |
| `CR-M-01..10B` | F01, F05, F09, D03/D05 |
| `CR-GF-01..12` | F02-F04, F07, F10 |
| `CR-C-01..11` | F01, F06, F07 |
| `CR-H-01..09` | F08 for bounded Consensus; D04 for the remainder |
| `CR-X-01..07` | F13 |
| `CR-SM-01` | D09 |
| `CR-RL-01..12` | F03-F05, F07, F10, F11, F15; D08 |
| `A5-SH0..SH4` | F11/F12; D01 removes fixed-point coupling |
| `A5-SP1..SP3`, `A5-GF1/GF2` | F02-F05, F08, F10, F15 |
| `A5-EX1..EX4`, `A5-CX1`, `A5-R1`, `A5-Q1/Q2` | F01, F05-F07, F13-F17; D02/D06 |
| Completed-code design register's nine stages | F02-F06, F08, F10, F14; rejected Consensus remains negative evidence in F08 |
| T-247 held claims | F11, F12, F15 |

## Risk And Hedge Law

Risk does not authorize a feature or a control. Each retained row names the
failure mode, proportionate hedge, and accepted residual. A hedge belongs at
the boundary that can reduce the named risk; a misplaced or permanent hedge
without a retirement trigger is technical debt. The supported environment is
one trusted developer desktop, so malformed GTL and likely malformed F_P output
receive strong treatment while hostile-local tamper work remains excluded.

The optional stable-plan amendment A5, a mechanical commit/push guard requiring
ticket and accepted-design refs on product-code changes, remains `pending_fh`.
The mandatory gate already stands: no product code without a singular ticket,
accepted design, and phase self-review. Optional automation may enforce that
law later; it is not a release feature or prerequisite.

## Closure Condition

1. Every T-218 candidate/capability family, T-219 residual, T-247 claim, and
   completed-code design stage maps to exactly one retained or explicit
   non-5.0 disposition above.
2. Every retained row has exact authority, honest built proof, remaining work,
   owner, dependency, release gate, material risk, proportionate hedge, and F_H
   disposition.
3. Only D01/D02/D10 self-use/campaign evidence moves to the 5.0.1 era; no
   runtime, operator, Consensus, conformance, compatibility, or release
   functionality moves with it.
4. F_H confirms this register as the exact T-249 constitutional basis. T-249
   may author candidate propagation while both tickets remain active, but
   neither ticket closes before that confirmation. This ticket itself changes
   no specification, design, code, or release surface.

## Closure Record

F_H confirmation is satisfied by the direct stable-first plan approval
persisted in T-242, the exact register checkpoint `7107604`, independent Phase
1 review `d5aaa3f` (8/8), and the subsequent instruction to continue execution.
The live register contains 17 retained feature rows and 10 explicit successor
or non-5.0 dispositions. No competing live 5.0 feature list remains.
