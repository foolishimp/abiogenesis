# POSTMORTEM: ABIogenesis 4.6 To 5.0 Seven-Day Run

**Type:** POSTMORTEM commentary under POSTING_GUIDE  
**Period:** 2026-07-12 through 2026-07-19  
**Author:** Codex, independent reconstruction  
**Status:** current incident analysis; not specification, design, ticket, or release authority  
**Pause basis:** `232f7b2d34e765d743c885782d6305a445c96118` plus the dirty
`codex/abiogenesis-5-final-integration` working tree observed on 2026-07-19  
**Scope:** what 4.6 had already delivered, what 5.0 originally meant, how that
meaning changed, what the seven-day run built, why repeated reviews did not
produce a working product, and what must be decided before work resumes

## Executive Verdict

The run produced substantial language, runtime, contract, schema, and test
work. It did not deliver ABIogenesis 5.0.

Two different failures occurred.

1. **The original product outcome was retired.** The original 5.0 definition
   was a released 4.6/GLC stack authoring its successor through a governed
   campaign, with installed-only conformance and public consumption. On
   2026-07-13, the stable-first reprice moved operational dogfood and
   successor authorship to 5.0.1. That was a real intent change, not merely a
   release-order adjustment.
2. **The replacement product was not delivered either.** The stable-first
   target expanded into 17 feature families, a new One Surface control plane,
   bounded Consensus, a hard-break public API, self-conformance, and a new
   qualification lifecycle. Work proceeded horizontally through atoms,
   schemas, Ontology, and authority contracts. The installed end-to-end path
   remained absent until a steel-thread governor was introduced late in the
   run, and it remained red at the pause.

The central delivery error was not insufficient rigor. It was applying rigor
to components while failing to preserve one cumulative product invariant:

> A packed ABIogenesis candidate can execute one admitted GraphFunction
> through the canonical ABG root and return replay-derived truth.

That invariant was already substantially proven by 4.6. The 5.0 work did not
hold it green while changing the language and public surface. By day seven,
the source contained more capability but the product had less demonstrated
utility than the 4.6 RC5 baseline.

## Evidence Basis

This postmortem uses the following primary surfaces:

- `docs/ABIOGENESIS_RC_RELEASE_NOTE.md` at `v4.6.0-rc.3`;
- `20260710T160000Z_ANALYSIS_5_0_feature_set_and_closure_conditions.md`;
- `20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`;
- completed T-242, T-243, T-244, and T-249;
- current `specification/GOALS.md`, `INTENT.md`, and `PRODUCT.md`;
- the 2026-07-15 three-day retrospective;
- active T-268, T-270, T-272, T-274, T-275, T-276, T-278, and T-281;
- the current runtime, public SDK, tests, Git history, tags, worktrees, and
  release artifacts; and
- the focused integration test run stopped at the project-wide pause.

The postmortem distinguishes commentary and historical plans from the
authority that was live at each point. It does not treat a status board or
review assertion as proof of delivery.

## What 4.6 Already Was

The 4.6 line was not an empty bootstrap. At RC3 it already supplied:

- deterministic witness, operator, observer, and tuner substrate;
- governed plugin selection and capability-gated live F_P dispatch;
- canonical C-call identity, invocation bundles, bounded artifact paths, and
  capability provenance;
- the seven-term authored C algebra: `C.of`, `C.id`, `C.compose`, `C.edge`,
  `workflow.C`, `C.batch`, and `C.retry`;
- typed authoring and raw-admission rejection for locally decidable GTL
  category failures;
- semantic compiler diagnostics for unresolved, malformed, inadmissible, and
  lawful-but-unrealized constructs;
- compiled execution-declaration handoff into runtime;
- malformed or contradictory F_P result refusal; and
- an immutable packed snapshot with manifest, checksums, build, lint, suite,
  and source-isolation evidence.

Its exclusions were also honest. RC3 did not claim complete runtime support
for `workflow.C`, `C.batch`, or `C.retry`; executable Consensus; live campaign
closure; a 5.0 public catalog and graph shell; or self-hosting.

During this run, RC4 and RC5 were published on the support line. The later
RC5 tether analysis records a clean `1435/1435` semantic suite and six live
downstream Hello World applications through odd_glc. It also records the
working ownership boundary: M04 admits and forwards, while M03 owns traversal,
plugin resolution, events, replay, and continuation.

This was the incremental base. It should have remained the behavioral oracle
throughout 5.0 construction.

## Original 5.0 Goal

The original direction-setting statement was:

> The release after which a released GLC runs over a released ABG, ABG builds
> ABG under SPEC_METHOD conformance, and a stranger can consume the substrate
> without reading the source tree.

The original feature set had two prerequisites and 27 features.

### Gate 0

| ID | Original outcome |
|---|---|
| `G1` | Ship final 4.6.0 as the stable predecessor. |
| `G2` | Lawfully admit self-hosting, externalization, and the changed 5.0 direction into GOALS and INTENT. |

### Self-Hosting And Governed Successor Authorship

| ID | Original feature |
|---|---|
| `F1` | Self-hosting closure invariant and maturity method. |
| `F2` | ABG-builds-ABG acceptance campaign over the installed prior release. |
| `F3` | SPEC_METHOD conformance audit of ABIogenesis itself. |
| `F4` | Non-interchangeable source, install, lane, sandbox, and builder path carriers. |
| `F5` | Job-bound materialization plan with protected write/delete boundaries. |
| `F6` | Execute B-010 so released ABIogenesis governs successor source development. |
| `F25` | `SCN-ABG-SOFTWARE-BUILD`, with the next ABIogenesis source as the campaign subject. |
| `F26` | Observer/tuner supervision over the real ABIogenesis build campaign. |
| `F27` | Citable frozen-law certification over campaign replay, not a naked test count. |

### Specification And Conformance As Product

| ID | Original feature |
|---|---|
| `F7` | Extract a tenant-independent conformance suite as a versioned artifact. |
| `F8` | Publish a consumer-discoverable function catalog. |
| `F9` | Characterize worker reliability with pass-at-k evidence. |
| `F10` | Publish a generic test-harness qualification family. |
| `F11` | Fail closed when undeclared F_D checks leak into probabilistic closure. |
| `F12` | Require causal-predecessor identity on admitted carriers. |
| `F13` | Ratify comment-to-spec and F_H review lifecycle law. |
| `F14` | Prime-compress handler authority and require equivalence identity. |
| `F15` | Resolve event scope-class and null-run blending semantics. |

### Externalization

| ID | Original feature |
|---|---|
| `F16` | Publishable license and package metadata. |
| `F17` | Registry or tagged-artifact publication with SemVer discipline. |
| `F18` | Curated public API and breaking-change policy. |
| `F19` | Typed, decoupled agent-CLI capability. |
| `F20` | Portable consumer documentation and a fresh-install consumer gate. |
| `F21` | Public runtime-transition ingress and embedded SDK entrypoint. |
| `F22` | Registry retirement, revocation, supersession, and non-graph lifecycle. |

### Tenant Multiplication And Runtime Hygiene

| ID | Original feature |
|---|---|
| `F23` | A tenant-onboarding pack usable without reading the TypeScript source. |
| `F24` | Four named runtime-law residual repairs from the 4.6 review. |

The original whole-release gate required all admitted feature rows, a real
ABG-builds-ABG campaign, released GLC over released ABG, installed-only
conformance, exact snapshots, and a clean campaign before the RC claim.

That was ambitious, but it was coherent. Its organizing outcome was governed
successor authorship over the working released substrate.

## How The Target Changed

The name "5.0" survived several materially different products.

| Date | Target called 5.0 | Consequence |
|---|---|---|
| Before 2026-07-12 | Two-stage `C1/C2` packaging fixed point over already-authored source | Proved packaging equivalence, not successor authorship; added an up-front runtime rewrite. |
| 2026-07-12 correction | Restore campaign-as-builder over 4.6 plus GLC | Recovered the original meaning and identified GTL-5 subject authoring as the real work. |
| 2026-07-12 R4 | Feature-complete 5.0 RC, GLC 1.0 over it, then 5.0 final authored as an odd_glc target | Preserved operational self-use as the final proof. |
| 2026-07-13 stable-first | Directly hand-author and release stable 5.0; defer campaign and self-use to 5.0.1 | Removed the defining original acceptance proof and turned 5.0 into a large conventional full-product build. |
| 2026-07-13 | Make bounded Consensus a mandatory flagship 5.0 feature | Chose the most demanding GraphFunction as the first architectural forcing case. |
| 2026-07-13 to 2026-07-15 | Treat 36 discovered behaviors as the public operation roster | Built and reviewed a public family before deriving its product Ontology. |
| 2026-07-15 to 2026-07-16 | Reprice to 27 atomic families, seven compositions, and 19 public operations | Invalidated the 36-operation delivery model and required a hard-break public migration during the same release run. |

The first point at which the original plot was lost was the stable-first
interpretation on 2026-07-13. The ruling that stable 5.0 precedes dogfooding
lawfully removed self-host evidence from the 5.0 release gate. The plan then
made a stronger inference: installed 4.6, GLC, and the campaign would not build
5.0 at all. That inference replaced the original construction model.

This did not make the replacement target invalid. It did mean the run was no
longer delivering the originally defined 5.0. That distinction was hidden by
retaining the same version name and much of the same feature language.

## Replacement 5.0 Scope At The Pause

The current T-244 projection contains 17 retained feature families. Their
release-gate status at the pause is below.

| Feature | Pause state |
|---|---|
| `A5-F01` install/workspace/catalog | Predecessor evidence and partial 5.0 contracts; no exact target packed proof. |
| `A5-F02` GTL declaration/admission/compiler | Substantial implementation; packed target publication and installed proof open. |
| `A5-F03` seven-term C/HOF/retry/recurse/interpreter | Substantial lower runtime delivered; public admitted-program integration open. |
| `A5-F04` instruction and F_P-result admission | Core admission delivered; installed malformed-path proof and public carry-through open. |
| `A5-F05` one 19-operation contract family | Private P1 family built; public P2 hard break and parity open. |
| `A5-F06` SDK and thin CLI | Eleven target operation identities appear in the dirty SDK; eight remain absent and the SDK still owns runtime orchestration. |
| `A5-F07` complete One Surface loop | Four authority functions exist, but no lawful installed end-to-end loop closes. |
| `A5-F08` bounded Consensus | GTL body, generic atoms, and native definitions exist; installed invocation count remains zero in persisted steel-thread evidence. |
| `A5-F09` catalog view/apply/invoke | Partial target operations; no complete packed callable path. |
| `A5-F10` event/replay/lineage truth | Rich substrate exists; current integration still has causal-parent and basis-identity defects. |
| `A5-F11` self-conformance | No exact 5.0 candidate verdict. |
| `A5-F12` observer/tuner | Predecessor capability only; no accepted 5.0 target qualification. |
| `A5-F13` native plus Codex projection | No exact 19-operation parity or structural differential closure. |
| `A5-F14` packed Hello and live F_P proof | 4.6 predecessor proof only; no exact 5.0 candidate proof. |
| `A5-F15` exact-candidate qualification family | Specified but no frozen candidate or reduced verdict. |
| `A5-F16` immutable RC and stable release | No 5.0 RC, tag, release snapshot, or stable cut. |
| `A5-F17` downstream compatibility | Predecessor evidence only; no target hard-break proof. |

**Exact release result: 0 of 17 feature families meets its stated 5.0 release
gate.** This does not mean no implementation exists. It means component proof
was repeatedly mistaken for proximity to product closure.

## Seven-Day Timeline

### Day 1: Product Correction And Immediate Category Failure

- The packaging-fixed-point error was diagnosed correctly.
- Bounded Consensus was admitted as a mandatory feature.
- A 5,293-line Consensus implementation was committed with extensive tests.
- Review then found the constructive carrier was an imperative plugin behind a
  GraphFunction nameplate. The entire implementation was reverted.
- Stable-first replaced campaign-authored 5.0.

This was the first warning that implementation had begun before product
category and carrier law were stable.

### Day 2: Horizontal Atom Plan

- Entry gates, Consensus design, typed fan-out, vector selection, combinator
  applications, and native Node witnesses were designed and implemented.
- The plan estimated 4 to 7 working days to stable 5.0.
- Work was organized around completing all atoms required by Consensus before
  returning to the installed product path.
- RC4 was published on the separate 4.6 support line.

The build now had a large dependency fan-out and no cumulative installed
steel thread.

### Day 3: Runtime Expansion And Review Reopening

- Execution context, F_P admission, F_H interaction, `workflow.C`, HOF batch,
  retry, recurse, and traversal conservation were built and locally closed.
- RC5 was published with the working 4.6 product path.
- A holistic DS-1 through DS-3 review found a live parent-rebind bypass, false
  census closure, lost authored-program structure, and disconnected joins.
- Previously closed work reopened and was repaired.
- The complete C-program interpreter was added and repaired.

The review caught real defects, but only after the horizontal wave had been
declared closed. It did not install a product-level stop condition.

### Day 4: Prime Contraction After Construction

- Whole-family Prime review found repeated operation, schema, runtime, and
  Consensus authority.
- T-277 contracted the implemented model.
- The three-day retrospective correctly stated that Ontology must precede
  public operations and that green tests did not prove authority conservation.
- The 36-operation family was then found to be discovered behavior promoted
  directly into public identity.
- T-278 reopened the product shape.

This was the second warning: the build had optimized an accidental family
before deriving the product Ontology.

### Day 5: Target Reset In Place

- T-278 went through nine candidate revisions and multiple independent review
  rounds.
- The target became 27 atomic families, seven compositions, four internal One
  Surface authorities, 19 public operations, and one qualification family.
- INTENT, PRODUCT, requirements, GOALS, and T-244 were propagated and
  regenerated.
- New One Surface, operation-definition, Consensus-publication, and
  continuation designs started immediately.

This was a fundamental redesign in the middle of an implementation run, but
the run did not reset to a small executable baseline.

### Day 6: High Parallelism, Late Steel Thread

- Many owner-contract and schema-authority repairs landed across parallel
  worktrees.
- T-280 One Surface atomic authority implementation closed.
- T-281 private P1 operation definitions advanced.
- T-276 was finally promoted to delivery governor.
- Its accepted early-red proof reported 16 missing target identities, 16
  retired identities, and zero target or workspace invocations.

The first honest product-level measure arrived after most of the week had
already been spent. It proved that the product path had not started.

### Day 7: Integration Rework Without A Green Product

- T-270, T-272, T-252, T-274, and T-275 cycled through constructability,
  schema, cursor, event-basis, and authority repairs in many worktrees.
- The dirty SDK reached eleven of 19 target operation names.
- `run.invoke` still manually selected, directly executed, evaluated
  post-action state, and routed disposition instead of entering the canonical
  M03 engine root.
- One Surface stage implementations still arrived as inline callbacks while
  the published program carried an empty plugin-contract list.
- A focused test run reached 69 passing, five failing, and one cancelled when
  the pause was issued. Three failures were stale T-270 test migration; one
  showed changed event order; one showed a real runtime event basis mismatch.
- The 4.6 RC5 practical tether was finally written on 2026-07-19. It correctly
  stated that 5.0 should reuse the released M03 root and first prove installed
  Hello replacement parity.

That correction arrived at the end of the run rather than at its start.

## Where We Lost The Plot

### 1. A Release-Sequence Ruling Became A Construction-Model Rewrite

"Stable 5.0 before dogfooding" only required removing self-host proof from the
5.0 release gate. The plan also removed installed 4.6 and GLC from the
construction model and treated 5.0 as direct full-product authorship.

That widened the consequence of the ruling. The original goal was not merely
postponed; it was replaced.

### 2. Consensus Was Chosen Before The Basic Product Path

Consensus is a useful flagship feature, but it requires nearly every difficult
surface at once: fan-out, fan-in, recursion, F_H escalation, attributed F_P,
workspace binding, catalog publication, result projection, replay, and public
CLI use.

It was a good eventual acceptance scenario and a poor first steel thread. A
single installed Hello GraphFunction would have exposed the same root
ownership defects with a much smaller dependency cone.

### 3. We Built Horizontally Across The Algebra

The plan closed language relations, runtime atoms, admission carriers,
interpreters, and schemas in sequence. Each component could pass focused tests
without proving that a caller could use the product.

The traversal algebra became a library of locally green parts while the public
runtime bypassed the lawful traversal owner.

### 4. We Failed To Preserve 4.6 As The Behavioral Tether

RC5 had a working packed product, canonical M04-to-M03 ownership, plugin
resolution, replay, and six downstream Hello World uses. The 5.0 path should
have replaced one boundary at a time while those uses stayed green.

Instead, the 5.0 SDK grew a new controller that manually ordered One Surface
stages and called a Sunny-specific F_D implementation. This recreated behavior
beside the proven root rather than extending the root.

### 5. Ontology And Prime Came After Public Construction

The project first built against 36 peer operations, then Prime-compressed that
family, then discovered the family itself was wrong, then repriced it to 19.

Prime reduced duplication but could not correct the meaning of the thing being
compressed. Ontology-first became law only after the migration cost already
existed.

### 6. Work In Progress Exceeded Integration Capacity

At the pause the repository exposed 28 ABIogenesis-related worktrees, eight
active tickets, and all eight active tickets were critical. The integration
line alone carried 209 first-parent commits after its July 13 branch point,
followed by 257 tracked changes and 82 untracked paths in the dirty wave.

This made exact-basis review difficult and allowed locally accepted branches
to outrun the integrated product.

### 7. Governance Became A Parallel Product

From July 12 through July 19, the comment tree contains 217 dated artifacts.
Filename classification finds 84 self-reviews, 58 other review or review-gate
artifacts, and 52 decision artifacts.

The integration commits divide into 117 paperwork-labelled commits and 92
implementation-labelled commits. The net diff is also large in both domains:

- runtime source: 127 files, approximately 54,004 additions;
- tests: 141 files, approximately 42,022 additions;
- design: 28 files, approximately 21,359 additions;
- tickets/comments/proof: 222 files, approximately 18,093 additions; and
- specification: 29 files, approximately 1,494 additions.

The problem was not that paperwork displaced all code. The problem was that
paper and code both expanded without one installed outcome constraining them.

The constitutional read model itself drifted. Current GOALS names
`codex/t266-stage` as the sole integration line at line 62 and
`codex/abiogenesis-5-final-integration` as the singular integration line at
line 222. One-surface truth was asserted but not mechanically maintained.

## Why Multiple Reviews Did Not Produce Delivery

### Reviews Proved Local Claims, Not The Original Outcome

Most reviews asked whether one atom, schema, design, or authority join matched
its current ticket. They did not repeatedly ask whether the installed product
could run one GraphFunction. A correct local verdict could coexist with zero
product invocations.

### The Property Under Review Kept Changing

Packaging equivalence, campaign authorship, stable-first productization,
36-operation parity, and 19-operation One Surface were all reviewed under the
same 5.0 banner. Review consistency inside one target did not protect against
target substitution between reviews.

### Independent Review Happened After Closure Pressure

Important defects were found only after implementer self-review and closure:
the original Consensus category error, T-262 parent rebind, T-267 program
loss, T-271 result erasure, and later One Surface integration defects.

Independent review became a repair loop instead of an entry gate.

### Execution Authority Was Confused With Assurance Authority

Many records labeled decisions as delegated F_H acceptance based on broad
authority to continue. The three-day retrospective already identified that
execution authority did not make implementer self-review independent. The
same pattern nevertheless continued through later slices.

### Tests Were At The Wrong Altitude

Large suites proved types, constructors, rejection cases, and local semantic
relations. They did not require a clean packed caller to traverse the whole
system. Some negative fixtures constructed the state they claimed to prove the
runtime derived. Green count increased while product reachability remained
zero.

### Review Findings Generated More Structure Instead Of A Smaller Path

Findings usually produced another reprice, design packet, authority carrier,
schema family, or ticket dependency. Many were substantively correct. Their
combined response increased the graph of work instead of forcing all effort
onto one red product path.

### No Cumulative Stop-The-Line Invariant Existed

The first installed steel thread was admitted on day six. Before that, no gate
said that all feature work stops if a packed Hello GraphFunction cannot run.
Without that invariant, component closure looked like progress even when the
product regressed.

## Audit Against Core Product Primitives

| Primitive | Intended law | Pause reality |
|---|---|---|
| Traversal monad / C algebra | One admitted program traverses generic atoms while conserving basis and result. | The atoms and interpreter substantially exist, but public `run.invoke` manually orchestrates outside the canonical root. |
| GTL program and GraphFunction | GTL composition is the program; GraphFunction is its callable function. | Clarified only on day five; runtime still accepts implementation callbacks not bound through the admitted program. |
| One Surface | One authority chain from admission through action, evidence, and continuation. | Atomic authorities exist, but SDK selection, direct execution, post-action evaluation, and fallback form a second controller. |
| Prime | Derive one minimal authority family before projecting public skins. | Applied after construction, first compressing the wrong 36-operation family; 19-operation replacement remains incomplete. |
| One Truth | One current constitutional and delivery surface. | GOALS contains two different singular integration lines; tickets, branches, generated inventories, and dirty code describe different cuts. |
| Event Calculus | Effects derive causally connected runtime truth on one basis. | Separate lifecycle emission and a current event-basis mismatch prevent one causal product proof. |
| `F_P -> F_D -> F_H` | Probabilistic proposal, deterministic admission, and human authority remain distinct and connected. | Individual carriers are stronger, but public continuation and installed end-to-end authority remain incomplete. |
| Code as institution | The constitutional program remains stable over changing staff and suppliers. | The constitution expanded faster than executable institutional behavior; staff produced many lawful fragments without a functioning institution. |

## What Was Actually Delivered And Should Be Preserved

The failed product run still created valuable assets:

- 4.6 RC4 and RC5 immutable release evidence;
- canonical GraphFunction combinator applications and native Node witnesses;
- strict raw Module admission and proportional conformance inventory;
- seven-term runtime atoms for `workflow.C`, batch, retry, and recurse;
- declared execution context and strict F_P result-contract admission;
- typed public F_H carriers;
- complete C-program interpretation and improved traversal conservation;
- a pure-data Consensus GTL body and useful native schema definitions;
- One Surface authority functions and refusal contracts;
- a candidate 27/7 Prime Ontology and 19-operation projection;
- the T-276 source-blind packed governor; and
- many focused adversarial tests that document real authority failures.

These are salvageable components and evidence. None should be called a 5.0
product until it participates in the one installed path.

## What Was Not Delivered

- no final 4.6.0 prerequisite from the original plan;
- no campaign-authored ABIogenesis successor;
- no installed-product self-use or 5.0.1 dogfood proof;
- no complete public 19-operation hard break;
- no thin CLI over one lawful runtime owner;
- no installed Hello replacement-parity proof;
- no installed Consensus invocation;
- no complete F_H continuation loop;
- no exact candidate self-conformance verdict;
- no qualified 5.0 RC;
- no stable 5.0 tag, tarball, snapshot, or clean-install proof; and
- no downstream target-contract proof.

## Counterfactual Delivery Path

The lowest-risk path available on July 14 was:

```text
v4.6.0-rc.5 packed product and six live Hello uses
  -> preserve M04 admission and the sole M03 engine root
  -> project one 5.0 public operation onto one existing Hello GraphFunction
  -> keep packed clean-install Hello green
  -> add only the C term reached by that path
  -> bind exact F_P result admission
  -> add replay-derived result assessment
  -> add interaction.respond and run.continue
  -> publish Consensus through the same path
  -> complete the remaining public operations
  -> self-conformance, qualification, and release
```

Ontology and Prime should have fixed the public target before the first public
implementation. Consensus should have extended a working GraphFunction path,
not served as the prerequisite for creating one.

That path would not necessarily have completed all original F1-F27 scope in
seven days. It would have produced a working, inspectable 5.0 increment and a
credible release frontier instead of a large disconnected candidate.

## Root Cause

The root cause is **outcome substitution under local rigor**.

The project repeatedly replaced a difficult product outcome with a tractable
formal or component outcome:

- successor authorship became packaging equivalence;
- stable-before-dogfood became direct greenfield product construction;
- usable GraphFunction execution became a complete atom census;
- product Ontology became operation enumeration;
- One Surface became four correct functions plus an external controller;
- event truth became event presence without one causal basis; and
- delivery evidence became review and test volume.

Each substitution was internally rational and often independently reviewed.
Their composition did not preserve the original product.

## Proposed Conditions Before Resumption

These are postmortem recommendations, not current authority.

1. **Make one explicit F_H product ruling.** Decide whether 5.0 again includes
   campaign-authored self-use or remains stable-first with dogfood in 5.0.1.
   Do not retain one name over two acceptance meanings.
2. **Choose one immutable predecessor and one integration line.** Reconcile
   GOALS, snapshot the dirty evidence, and close or archive unused worktrees
   before implementation resumes.
3. **Adopt installed Hello replacement parity as the only restart gate.** No
   Consensus, remaining-operation, observer, qualification, or release work
   advances until that path is green from packed bytes.
4. **Reuse the 4.6 M03 root.** Remove SDK-owned traversal, inline stage
   implementations, duplicate lifecycle emission, and Sunny-specific runtime
   selection from the public path.
5. **Limit work in progress.** One integration ticket and one independent
   review may be active on the steel thread. Other critical tickets remain
   blocked, not concurrently active.
6. **Review outcome before component.** Every review begins with the packed
   steel-thread result, exact Git/worktree basis, and regression against 4.6
   utility. Focused proof follows only after product reachability passes.
7. **Separate execution and assurance.** Implementers do not author their own
   F_H acceptance record or relabel self-review as independent closure.
8. **Freeze the public Ontology for the restart cut.** Any proposed change to
   27/7/19 must first demonstrate that the existing target cannot carry the
   steel thread; no further count-driven reprice occurs during integration.
9. **Define progress by usable outcomes.** The next milestones are one packed
   Hello, one continuation, one Consensus outcome, 19-operation parity, one
   self-conformance verdict, and one RC. Commit, test, ticket, schema, and
   review counts are supporting evidence only.

## Final Finding

The seven-day run did not fail because the team avoided hard engineering. It
failed because hard engineering was allowed to proceed without a stable,
continuously executable product outcome.

The original 5.0 goal was coherent but was constitutionally replaced. The
replacement goal was also coherent on paper but was built in the wrong order.
Reviews improved many local surfaces and exposed several serious defects, yet
the review system had no authority to stop horizontal work until the product
worked. By the time a steel thread became the governor, most of the week and
most of the architecture had already been committed to an unproven path.

The correct recovery is not another broad reprice or another atom census. It
is to decide which 5.0 is being built, restore the released 4.6 behavior as the
tether, and permit no forward work until one packed GraphFunction traverses
the single admitted program and canonical runtime root end to end.
