# POSTMORTEM: ABIogenesis 4.6 RC5 To 5.0 Four-Week Development Arc

**Author**: Codex

**Date**: 2026-08-08T03:10:59Z

**Addresses**: the ABIogenesis 4.6-to-5.0 development arc from 2026-07-10
through 2026-08-08; immutable `v4.6.0-rc.5`; GOAL-035; T-242 through
T-287; the X, final-integration, root-build, S03/S05/S06, and Wave 1 lines;
historical commentary, ticket records, Git check-ins, archive/donor refs, and
reflog reset evidence

**Status**: Open historical postmortem; commentary only. This post does not
select a method version, Product definition, branch, design, ticket, candidate,
qualification subject, or release state.

**Evidence cutoff**: 2026-08-08. The checked-out `main` branch was
`b9c71036758c7e5c446ff55c862983704633e187`; later work was inspected across
all local refs, including `codex/t286-abi5-root`, `codex/t287-wave1`, its F02,
F03, and F04 repair branches, and the named archive/donor refs. Existing dirty
and untracked user work was not treated as accepted history and was not
modified.

## Summary

ABIogenesis 4.6 RC5 was an immutable, downstream-consumable Product candidate.
It retained a working installed M04-to-M03 execution path, replay-derived
truth, live worker transport with lane law, a clean semantic suite, and
downstream Hello World use. Four weeks later, ABIogenesis 5.0 is still not a
release: there is no `v5*` tag, no accepted immutable 5.0 RC, no final tap, and
no post-publication installed proof.

The period was not short of work. Git contains 827 unique commits dated in the
four-week observation window across all refs. The selected Wave 1 line is 645
commits ahead of the RC5 commit. Those are activity measures, not delivery
measures. The first seven-day run alone was independently verified at roughly
300 commits, 209 core integration commits, and about 99 hours from the
canonical Consensus body to the installed governor. It still ended without a
green accepted Product.

The dominant failure was **outcome substitution followed by late reset**.
Each time the complete Product outcome became difficult, work converged on a
nearby property that was easier to make rigorous: packaging equivalence,
stable-first full construction, atom census, traversal completeness,
operation-count parity, same-process proof, or design/checkpoint closure. The
property was tested and reviewed locally. A holistic, front-door, authority, or
fresh-process check then showed that the accepted Product relation had not
been preserved. By that point the correction crossed many modules,
projections, schemas, tests, tickets, and evidence surfaces, making reset
expensive.

The history also contains real improvements. The same-day Consensus revert,
the July 20 clean successor root, exact-candidate review, donor isolation, the
S06 hard-break law, and the later willingness to stop on an owner-authority gap
all prevented invalid work from becoming release truth. The problem was that
these controls usually arrived after a large implementation wave rather than
governing its first executable increment.

## Failure Inventory

### F01 — The Product called “5.0” changed meaning without changing identity

Within days, 5.0 meant a packaging fixed point, a campaign-authored successor,
a stable-first hand-authored Product with dogfood moved to 5.0.1, a
36-operation Product, a 19-operation Product, an 18-operation/56-key Product,
and later a 16-feature five-wave Product with observer/tuner deferred. Several
of those destinations were coherent in isolation. Keeping one version name
across them hid the cost and invalidation caused by each reprice.

### F02 — 4.6 was not continuously conserved as the executable tether

The first 5.0 integration line descended from RC3 while ten RC5-side commits
remained unreconciled. The branch rebuilt execution beside the working 4.6
root instead of replacing one boundary at a time while the installed
predecessor path stayed green. Later records alternated between RC3 and RC5 as
the immutable reference, and a `40/40` label appeared while every exact RC5
witness field was still pending.

### F03 — Delivery order was inverted

The work repeatedly completed internal language, traversal, schema, event,
and conservation inventories before proving a small general public Product
path. The forty-row matrix became a work queue. Consensus, the most coupled
feature, was used as the architectural forcing case before a generic installed
Hello path. Product feedback arrived after most construction decisions had
already spread.

### F04 — The realization repeatedly violated its declared owner split

The rejected implementations included an imperative plugin behind a
GraphFunction nameplate, SDK/Public-owned orchestration, inline semantic
callbacks, legacy request translation, generic dispatch, rival catalog
authority, process-local run/read state, and event presence without one causal
basis. The written architecture was often correct while the reachable path
implemented another controller.

### F05 — Ontology and Prime contraction followed construction

Thirty-six discovered behaviors were first promoted to peer public operation
identities. The family was implemented, Prime-compressed, then rejected as the
wrong Ontology and repriced. Prime removed repetition from an accidental
family; it could not correct the meaning of the family being compressed.

### F06 — Proof and progress were reported at the wrong altitude

Green unit, semantic, M4, M5, package, matrix, and same-process scenario gates
proved real bounded properties. They did not prove that a clean installed user
could author, publish, invoke, continue, replay, and read one general Product
path. `40/40`, `70/70`, `123/123`, `181/181`, and large review counts were at
times allowed to imply Product proximity that they did not establish.

### F07 — Assurance checked frames more reliably than direction

Implementer, self-reviewer, delegated F_H proxy, and assurance roles were
frequently correlated. Independent review often arrived after local closure
pressure. Even genuinely independent reviews checked conformance to an
accepted plan without asking whether the plan put a user outcome on the
critical path. The reviewer’s July 24 correction described this precisely:
the reviews audited each frame and did not audit the road.

### F08 — Work in progress exceeded integration and review capacity

At the first pause, the record contained 28 ABIogenesis-related worktrees,
eight active critical tickets, 217 dated comment artifacts in seven days, 257
tracked changes, and roughly 82 untracked paths on the integration line.
Planning, proof, code, generated projections, and reviews all expanded at the
same time. Exact-basis comparison became difficult and accepted local cuts
outran the integrated Product.

### F09 — Forward repair was preferred after the reset threshold had passed

Many correct findings produced another carrier, design section, candidate,
checkpoint, schema projection, or review round. The local repair was often
sound, but its blast radius enlarged the same unproven path. Reset generally
occurred only after days of repair or after a huge donor candidate made the
authority violation undeniable.

### F10 — Closure claims outran the selected design method

S03, S05, and S06 behavior was appended after the accepted M05 traversal
design without re-deriving the affected Ontology, atomic-function family,
whole-family Prime contraction, IACS, three semantic views, axiom matrix, and
module-owned proof. Working behavior was promoted as accepted design closure.
The July 25 audit correctly retained the behavior as stock while reopening the
closure claims.

### F11 — The public hard break repeatedly became a dual path

The intended relation was simple:

```text
admit
  -> select exact definition
  -> call concrete owner port
  -> project outcome
```

Rejected S06 work instead projected the new exact family into
`RootPublicInvocation`, retained the legacy semantic switch, used
`indexedRequest ?? legacyRequestPayload`, and kept most owner behavior behind
translation or generic dispatch. Compatibility was not a requirement, but it
survived as implementation structure.

### F12 — Same-process identity was mistaken for durable Product authority

WeakMaps, WeakSets, context maps, remembered reopen authority, object brands,
global-tail currentness, and executor-local retry inputs made equal durable
facts behave differently after restart. Same-process green tests preserved
working stock but did not prove fresh-process equality or replay sufficiency.

### F13 — One Truth and release state splintered

At the evidence cutoff, checked-out `main` selected STDO 2.2.0, 17 Product
outcomes, T-270, and S05 reconciliation. The later Wave 1 line selected STDO
2.2.2, 16 features, T-287, deferred A5-F12/S04 to 5.1, and selected A5-F10
catalog/runtime recovery. Neither line is a released 5.0 Product. Historical
truth is preserved, but current branch, method, Product count, ticket owner,
and frontier are not singular across the repository refs.

## Reset Ledger

| Reset | Date | Work discarded or demoted | Return point or compensation |
|---|---|---|---|
| `R0` | Jul 12 | 5,293-line imperative Consensus realization, 46 files | Revert `2c85a889`; retain the review and re-enter at lawful GTL design |
| `R1` | Jul 19 | Seven-day final-integration delivery claim after roughly 99 hours | Pause at `232f7b2d`; write the RC5 tether and delivery postmortems; open root-governor recovery |
| `R2` | Jul 20–21 | X and final-integration as successor merge bases | Freeze them at `676766a6` and `3c2d86d4`; build a zero-inherited installed root through T-283–T-286 |
| `R3` | Jul 24–26 | Engine-first M5 ordering, S03/S05 closure, S06 promotion, and observer/tuner expansion | Declare the hold at `b98dc7f5`; retain `bcd8769a` only as behavioral stock; archive observer/tuner at `87c7e6d6`; reopen design closure and reclose S03 from `8865ccff` |
| `R4` | Jul 30 | S06 public-facade candidate `e5902c55`, 107 files and about `+80,979/-4,942` | Preserve donor; actual reflog reset to accepted design cut `4d70778e` |
| `R5` | Jul 31 | Dual-Public candidate `935b11dd`, 136 files and about `+59,383/-5,707` | Preserve donor branch; return to `08cd7485`; require the hard-break construction map |
| `R6` | Aug 1 | Rejected Increment 1 plus W1.1a implementation and two design candidates | Stash rejected normalization residue; preserve `96b131c1`, `f97a995b`, and `5cd1bec2` as donors; reset to `50e8a5c7` or `2685b805` |

The ledger distinguishes an ordinary corrective commit from a reset: a reset
removed a line or closure claim from successor authority, preserved it only as
evidence/donor stock, and returned execution to an earlier satisfying cut.

## Analysis By Phase

## Phase 0 — 4.6 baseline and unstable 5.0 definition

**Period**: Jul 10–13. **Primary records**: T-242, T-243, T-249; the 5.0
course-correction commentary; `945b5a27`, `2c85a889`, and `7107604b`.

### Failures realized in this phase

- **F01**: the packaging fixed point proved equivalence of already-authored
  source rather than governed successor authorship. The correction restored a
  campaign-as-builder relation, then stable-first moved campaign authorship
  and dogfood to 5.0.1 while retaining the 5.0 name.
- **F02**: T-243 explicitly made 4.6 predecessor evidence rather than the
  installed builder or continuous execution substrate. That was lawful under
  the stable-first ruling, but it also removed the strongest practical tether
  from the construction loop.
- **F03/F04**: bounded Consensus was admitted as a flagship feature and almost
  immediately implemented as 5,293 lines of imperative plugin orchestration
  behind a GraphFunction label.

### Compensations pursued against those failures

- T-242/T-249 performed a full constitutional reprice rather than silently
  changing the plan. Intent, Product, requirements, scenarios, GOALS, and the
  release ladder were aligned at `7107604b` and closed at `b6a7e876`.
- Review of `945b5a27` identified the category error within seven hours. The
  complete 46-file realization was reverted by `2c85a889` the same day.
- `00e74f53` replaced the plugin-first implementation with a lawful pure GTL
  target and a compiler-gap census. Consensus-specific runtime authority was
  explicitly forbidden.
- T-243 retained immutable 4.6 evidence, while later RC4/RC5 support work
  continued on its own line.

### Disposition

The **revert was effective**: the invalid carrier did not become Product
truth. The **stable-first compensation was only partially effective**: it
created one constitutional truth, but it also transformed a bounded
successor-authorship outcome into a broad greenfield full-Product build. The
new destination was coherent on paper and much more expensive to verify
incrementally.

## Phase 1 — Seven-day stable-first build blitz

**Period**: Jul 12–19. **Primary records**: T-250 through T-281; the July 15
three-day retrospective; the two July 19 seven-day postmortems; independent
verification at `b321547f`; pause basis `232f7b2d`.

### Failures realized in this phase

- **F02/F03**: the integration line was built from RC3 and did not absorb ten
  RC5-only commits. Work expanded horizontally through language atoms,
  traversal, schemas, runtime, public contracts, One Surface, Consensus, and
  qualification before a general installed path was green.
- **F05**: 36 discovered behaviors became public operation identities. Prime
  contraction followed implementation; T-278 then rejected the ontology and
  repriced the surface to 19 operations.
- **F04/F11/F12**: the SDK became a second controller; semantic callbacks were
  not admitted through the program; event evidence showed correlation more
  readily than causation; legacy and replacement public paths coexisted; eight
  or more operations were unconnected; `run.invoke` remained feature-specific.
- **F06/F07**: local tickets and tests closed while DS1–DS3 holistic review
  later found parent-rebind bypass, false census closure, whole-program loss,
  disconnected joins, and result erasure. The implementer/self-review/proxy
  loop repeatedly accepted a nearby property.
- **F08/F09**: 28 worktrees, eight active critical tickets, hundreds of
  comments and commits, generated surfaces, and a large dirty integration wave
  exceeded the capacity to hold one exact Product subject.
- On day six, the first installed governor honestly reported 16 missing target
  identities, 16 retired identities, and zero target/workspace invocations.
  At the pause, none of the 17 feature-family release gates was complete.

### Compensations pursued against those failures

- T-250 and T-251 introduced version-basis and entry gates. T-252 and the
  language/runtime tickets replaced the imperative Consensus carrier with
  public GTL atoms and explicit compiler gaps.
- Independent DS1–DS3 review reopened T-262, T-267, T-270/T-271, and related
  paths after false closure. Negative tests were added for authority bypasses
  rather than relying only on sunny-path counts.
- T-277 applied project-wide Prime contraction. T-278 then derived a public
  control-plane Ontology, and T-280 separated the four One Surface authorities
  without adding another public controller.
- T-276 was promoted to an installed, source-blind delivery governor.
- The July 15 retrospective explicitly stated “Ontology before operations,”
  “Prime across the whole family,” “One Surface as an authority chain,” and
  “green tests do not prove authority conservation.”
- The July 19 RC5 tether and postmortems re-established the smallest useful
  invariant: a packed candidate executes one admitted GraphFunction through
  the canonical root and returns replay-derived truth.

### Disposition

The compensations produced valuable design, code, refusal tests, and an honest
governor. They **did not recover delivery inside the run**. Ontology, Prime,
independent review, and the steel thread arrived after the large horizontal
wave. The run ended after roughly seven days and 99 hours with no accepted
5.0 Product. This was the first multi-day stop.

## Phase 2 — Product re-adoption and the clean installed root

**Period**: Jul 19–21. **Primary records**: T-283 through T-286; recovery ref
`1b8b2b0a`; archive refs `676766a6` and `3c2d86d4`; exact root
`ffba4e71`/`e0575b82`.

### Failures realized in this phase

- **F01/F13**: the prior tree contained multiple constitutional and execution
  authorities. A Product definition, public-operation count, ticket queue,
  design set, generated projection, and integration branch could each imply a
  different 5.0 destination.
- **F02/F04**: X and final-integration contained useful behavior but also
  compiled plans, generated/default runtime programs, installer/CLI execution
  basis, feature controllers, and parallel event/result truth. They could not
  lawfully serve as successor merge bases.
- **F06/F09**: even the corrective work needed repeated exact candidates.
  T-284 went through superseded and rejected correction-vector candidates;
  T-285 went through several constructability/design reviews. Exact counts and
  authority wording were still easy to make locally plausible and globally
  false.

### Compensations pursued against those failures

- T-283 held the nine active realization tickets and reified one complete
  Product destination before code resumed. Rival compiled-program and
  controller authority was explicitly retired.
- T-284 froze X, final-integration, and a rejected stash as immutable donor
  evidence. Its correction vector separated three questions that earlier work
  conflated: predecessor semantic disposition, 5.0 target coverage, and
  carrier action.
- The selected migration was fundamental re-adoption: no inherited TypeScript
  implementation, no wholesale donor file, and an explicit target claim,
  owner, stripped authority, and proof for every admitted interior.
- T-285 accepted one direct-GTL design with Ontology, atomic functions, Prime,
  IACS, three views, native constructability, and rival-authority absence
  tests before implementation.
- T-286 deleted 1,657 inherited Product files from the construction boundary,
  then advanced one installed `R1 -> R10` frontier. The exact root passed
  deterministic package proof, clean installation, direct HoG traversal,
  ABG event/replay truth, thin CLI projection, twelve real-path mutations, and
  two decorrelated exact-subject reviews.

### Disposition

This was the **strongest compensation in the four-week arc**. It converted the
postmortem invariant into one source-independent installed root and made old
authority absent by default. It was expensive—69 commits from the recovery
entry to the first exact root—but it produced a bounded green base rather than
another broad candidate. Its limitation was scope: M4 proved one all-F_D root,
not the later M5 Product families.

## Phase 3 — M5 engine expansion and destination drift

**Period**: Jul 22–25. **Primary records**: T-270; M05 design; `ffba4e71` to
`b98dc7f5`; the July 24 correctness-amplifier review and Claude correction;
`bcd8769a`; the July 25 Prime/design-gate audit.

### Failures realized in this phase

- **F03/F06**: 69 commits in roughly three days advanced internal traversal to
  `b98dc7f5`. The plan treated forty internal rows as the frontier while the
  public front door could admit only built-in Hello, F_P, recursion, and
  fan-out families; `catalog.admit` constructed Hello internally; dependency
  truth was empty.
- The accepted plan and five consecutive reviews reported exact local facts,
  B-001 conservation, lifecycle repair, packaging, and green gates. None asked
  what a new user could now do. The review function amplified the wrong
  sequence.
- **F10**: the next 45 commits moved through external Product, F_H
  continuation, S03, S05 Consensus, S06 portability, and claimed `40/40`
  conservation. S03/S05/S06 had bypassed the design gate after M05 Section 11.
- **F02/F06**: every `witness46` field still said immutable RC5 reconciliation
  was pending, even while the matrix was reported proven.
- **F08/F09**: observer/tuner work grew another 1,677 lines while the affected
  S03/S05/S06 closures were already unsound.

### Compensations pursued against those failures

- The July 24 review stopped the remaining nineteen traversal rows and
  reclassified the forty-row matrix as conservation/regression evidence, not
  the Product work queue or Product progress.
- The public vertical sequence was restored: independent module publication,
  generic contract-bound invocation, real dependency resolution, F_H
  continuation, ordinary-path Consensus, portability, qualification, release.
- Claude’s reviewer correction added four standing gates: Product-outcome
  delta first, destination review at plan acceptance, public front-door probe,
  and recorded law used as a pass/fail gate rather than background fact.
- The July 25 audit retained M03, M4, and M05 through Section 11; rejected S03
  and S05 closure and S06 promotion; returned the 40-row claim to unresolved;
  and required one bounded `design_reframe` rather than another Product reset.
- Observer/tuner WIP was stashed and preserved at `87c7e6d6` before S03
  correction. Released STDO 2.2 was explicitly adopted and the selected
  governance basis reconciled.

### Disposition

The correction was **substantively right and operationally late**. It preserved
the clean root and useful behavior instead of restarting from 4.6, but it
arrived only after another three-day internal expansion and after closure had
already been projected. This phase demonstrates that an always-green root is
not sufficient if it does not govern the active Product frontier.

## Phase 4 — S03/S05 reclosure and repair-loop saturation

**Period**: Jul 25–28. **Primary records**: candidate `8865ccff`; the S03
independent review; S05 global-to-local design and realization check-ins;
accepted S05 basis later recorded as `1ddc802d`.

### Failures realized in this phase

- **F09/F10**: S03 and S05 moved through many freeze, review, provenance,
  source-truth, catalog, timeout, closure, and submitter-loop candidates.
  Findings were usually repaired forward on the same broad branch.
- **F04/F06**: Product-sealed semantics, catalog application, public read,
  exact source/result basis, and clean-checkout proof each failed at different
  points. Passing behavior did not imply a singular authority relation.
- **F08**: the volume of paired implementation/checkpoint commits made
  “candidate frozen” a frequent intermediate state rather than a rare stable
  review boundary.
- S04 observer/tuner was designed while S05 was still closing, then deferred
  to 5.1. This was another case where parallel future work increased the
  reconciliation surface before the current Product outcome was exhausted.

### Compensations pursued against those failures

- S03 was reclosed on one Product-sealed exact candidate `8865ccff`, with
  product-private semantics, explicit authority admission, mutation-sensitive
  installed proof, reproducible package identity, and an isolated independent
  review.
- S05 was re-entered at global-to-local design rather than patched only at the
  public projection. The repair bound ticket bytes, reviewer instructions,
  catalog authority, timeout/exit behavior, submitter response, recursion, and
  ordinary public projection to one Consensus path.
- S04 was parked rather than allowed to block or broaden S05/S06. Existing
  observer/tuner material remained evidence only.
- The selected Product outcome was made sequential: accept S03, then S05,
  then S06; later work had no promotion authority.

### Disposition

The compensation **recovered valuable accepted S03 and S05 stock**, but it did
not eliminate the underlying public/process-local authority inherited by the
next phase. Exact-candidate isolation improved assurance. The number of
forward repairs showed that review was still detecting architectural relations
after they had spread through realization.

## Phase 5 — S06 public hard break, two large donor resets, and Gate 1 stop

**Period**: Jul 28–Aug 1. **Primary records**: T-281; S06 handoffs and
decisions; `4d70778e`, `08cd7485`, `e5902c55`, `310966ab`, `935b11dd`;
function-to-axiom review; exact 56-key census; Gate 1 candidates
`ba2e39a4`, `29aea26d`, `2a60c2b7`, and `3f80ba23`.

### Failures realized in this phase

- **F05/F09**: S06 went through native contract, public/native occurrence,
  contracted family, digest algebra, catalog preservation, nested catalog,
  full closure, bounded refusal, and closed-refusal design candidates. Each
  locally necessary relation changed the next candidate’s blast radius.
- **F11**: `e5902c55` claimed to close the installed public family but changed
  107 files with about 80,979 insertions and preserved public-facade drift. The
  branch was reset to `4d70778e`; a small native salvage was retained only as
  donor material.
- **F11/F12**: the next large donor `935b11dd` built much of the exact
  family/schema surface across 136 files, but routed it through the legacy
  family, semantic switch, request fallback, generic dispatch, and
  process-local state. It was returned to donor status and the accepted branch
  remained at `08cd7485`.
- **F06/F07**: the initial control proposal reacted with too many exhaustive
  maps and semantic reviews. That risked recreating churn through assurance
  density rather than constraining the directional decision.
- Gate 1 then found a real constructability contradiction: the selected
  `run.continue/current_intent` port required admitted Continuation,
  ConstructionIntent, and AdmittedContinuationInput, while the retry fixture
  supplied only an internal durable retry frontier. No implementation-only
  choice could bridge the gap lawfully.

### Compensations pursued against those failures

- Direct F_H stated a non-negotiable hard break and exact forbidden symbols:
  no `RootPublicInvocation`, `ROOT_PUBLIC_OPERATION_DEFINITIONS`,
  `legacyRequest`, fallback translation, Public semantic switch, Public-owned
  catalog, process-local run/read authority, compatibility facade, or second
  catalog.
- Rejected work was preserved on named donor refs instead of being merged,
  cherry-picked wholesale, or silently deleted. Only isolated owner-local code
  with no legacy dependency could be reconsidered.
- Review was reduced to three frozen gates: construction map, one installed
  architecture sentinel, and one complete frozen candidate. Mechanical exact
  set/generator checks would run between them.
- Product, ticket, and accepted-design axioms—not review volume—became the
  restoring relation. The first counterexample required stop, donor
  preservation, reset to the last satisfying cut, and authority correction.
- The exact 18-operation/56-key owner census and PFC-F08 refusal relation made
  missing owner meaning explicit. The Gate 1 reviewer rejected the map rather
  than inventing a continuation adapter.
- STDO 2.2.2 identity was frozen explicitly before later work, and an Increment
  0A falsifier baseline was banked before feature expansion.

### Disposition

The **hard-break compensation worked as a rejection mechanism**: two enormous
dual-authority candidates did not become the successor. The Gate 1 stop was a
healthy refusal of implementation fiction. It remained economically late: the
forbidden bridge was detected after tens of thousands of generated and
realization lines had been produced. S06 itself did not close.

## Phase 6 — Feature-wave reprice, W1.1a resets, and runtime recovery

**Period**: Aug 1–8. **Primary records**: T-287; `codex/t287-wave1`; donor refs
`96b131c1`, `f97a995b`, and `5cd1bec2`; accepted HoldsAt checkpoint
`1f6a8607`; latest W1/F02/F03/F04 heads `dd935a1c`, `e1f483ad`, `86f01529`,
and `01951d18`.

### Failures realized in this phase

- **F09/F12**: the first post-Gate increment left downstream normalization
  residue and was stashed as rejected work. W1.1a implementation `96b131c1`
  proceeded while the ticket still selected donor review, a blocked review was
  not fully discharged, and mechanical success preceded authority review. It
  was preserved and reset to `50e8a5c7`.
- Two replacement design attempts, `f97a995b` and `5cd1bec2`, were also
  preserved as rejected donors and reset to `2685b805`. Exact-prefix artifact
  truth and its construction relation had not been lawfully closed.
- **F01/F13**: the active plan changed again from sequential S05/S06 delivery
  to T-287’s five feature waves. A5-F12/S04 moved to 5.1, the Product count
  moved from 17 to 16 on the Wave 1 line, and T-270/T-281 were superseded there
  while remaining current/historical on other refs.
- **F06/F09**: Aug 2–7 then accumulated another long recovery run through
  Event Calculus, replay, continuation, retry, closure, catalog contraction,
  terminal authority, and repeated candidate freeze/repair/replace commits.
  This is valuable recovery stock, but Wave 1 is not closed on one installed
  candidate.
- **F02**: RC5 conservation was still being repaired on Aug 7. Separate
  branches had to reconcile RC5 witnesses, separate the RC5 census from
  current traversal status, and bank a dependency map.

### Compensations pursued against those failures

- T-287 reduced execution authority to one ticket and one selected feature
  slice. Every handoff had to restate the Product frame, source/tool/runtime
  split, prohibited authorities, and exact installed outcome.
- The control loop now stops forward repair after two rejected candidates on
  one frozen boundary and reassesses altitude, common building blocks, and
  whether unresolved questions belong in authority, design, code, or tests.
- Rejected W1.1a candidates were preserved as evidence and not promoted.
  Progress was explicitly defined as an independently reviewed Product slice,
  not a commit, changed-file count, build, digest, or time spent.
- The accepted first A5-F10 slice introduced one typed Event Calculus
  `HoldsAt` relation and removed copied replay/currentness folds. Later work
  reconstructed continuation, retry, closure, and recursion through admitted
  events and replay.
- The current catalog recovery plan contracts catalog lifecycle/event truth
  into one reconstructible HoG dictionary while reserving ABG/Event Calculus
  for execution and workspace-transformation truth. Compatibility and old
  registry authority are forbidden.
- F02, F03, and F04 were isolated into bounded repair branches: canonical GTL
  admission/conformance, RC5 census/evidence separation, and probabilistic
  result admission. This reduces cross-feature repair coupling.

### Disposition

The compensation is **directionally stronger but incomplete**. It has better
donor hygiene, explicit stop rules, typed event truth, smaller repair branches,
and clearer conservation evidence. It has not yet produced a singular Wave 1
candidate, M5 closure, M6 qualification, M7 release, or a `v5*` tag. The
repository still exposes competing current read models across refs.

## Compensation Effectiveness

### Compensations that held

1. **Immediate full revert of a category error** — `2c85a889` removed the
   imperative Consensus realization before more code depended on it.
2. **Immutable donor/archive preservation** — rejected stock remained
   inspectable without remaining executable authority.
3. **Zero-inherited installed root** — T-286 made rival execution paths absent
   and proved one packed path through real mutations.
4. **Exact-subject independent review** — S03 and M4 review against frozen
   commits was materially more reliable than moving-tree review.
5. **Hard-break axioms and stop-on-missing-owner** — S06 Gate 1 refused to
   invent a compatibility or continuation carrier.
6. **Separating RC5 census from current traversal status** — the Aug 7 evidence
   work stopped a coverage matrix from silently claiming predecessor closure.

### Compensations that helped but did not prevent recurrence

1. **Constitutional repricing** created aligned text, but the same 5.0 identity
   continued across materially different Products.
2. **Ontology, Prime, IACS, and three-view design** improved local boundaries,
   but were repeatedly performed after realization or were not extended when
   the boundary changed.
3. **Installed governors** were honest, but they arrived late or governed an
   accepted root rather than the active user-facing frontier.
4. **More independent review** found genuine defects, but review density could
   not compensate for a plan whose direction was wrong.
5. **Feature waves and single-ticket control** reduce WIP, but they also encode
   another Product/sequence reprice that has not yet delivered a release.

### Compensations that became part of the failure

1. **Operation, row, schema, test, review, and checkpoint counts as progress**.
2. **Forward repair after a global authority counterexample**.
3. **Generated projections before the authoritative family was singular**.
4. **Self-review or proxy F_H labels used as independence**.
5. **Compatibility/value preservation used to excuse a reachable rival path**.
6. **A new ticket, design section, or assurance artifact for every finding**.

## Root Cause

The root cause was not simply “scope creep,” “too much process,” or “bad code.”
It was a repeating causal loop:

```text
ambiguous or repriced Product outcome
  -> broad horizontal construction
  -> strong local tests and reviews
  -> local closure projected as Product progress
  -> late front-door, whole-path, authority, or restart counterexample
  -> forward repair across many projections
  -> integration and assurance saturation
  -> donor archive and reset
  -> a new control model, sequence, or Product count
  -> repeat
```

The missing control was an **early directional invariant over one current
installed Product outcome**. Axioms were often correct but were consulted as
review criteria after implementation. The durable form is executable and
immediate: the first forbidden authority, second path, fixture-only front door,
or failure to advance the selected installed outcome invalidates the cut before
its projections and compatibility surface are built.

## What The Four Weeks Actually Produced

The period did not produce ABIogenesis 5.0, but it did produce recoverable
assets:

- immutable 4.6 RC5 release and downstream evidence;
- a much clearer direct-GTL/HoG/ABG owner split;
- a source-independent installed root with causal event/replay proof;
- lawful GTL and traversal atoms, F_P admission, F_H continuation, Consensus,
  public-operation, and portability stock at varying acceptance levels;
- exact counterexamples for controller, compiled plan, event, basis, legacy
  Public, process-local identity, currentness, retry, and catalog defects;
- archive/donor refs that preserve rejected work without pretending it is the
  successor; and
- a better understanding that Event Calculus over admitted history owns
  runtime truth while replay reconstructs and projects it.

Those assets are not interchangeable. “Retain” means retain as accepted code,
provisional behavior, rejected donor, or evidence according to its exact
record. It does not mean merge the latest-looking branch.

## Recommended Action

1. **Resolve One Truth before more implementation.** Select one exact branch,
   method identity, Product feature/scenario set, ticket owner, and current
   frontier. Reconcile checked-out main and the Wave 1 line explicitly; do not
   let ref chronology decide authority.
2. **Bind the predecessor once.** Use immutable `v4.6.0-rc.5` at `8d43dc89`
   as the semantic and installed conservation basis unless direct Product
   authority explicitly selects another cut. Every claimed conserved row must
   name the exact witness and mutation.
3. **Keep one accepted installed root continuously green, but make the active
   governor user-facing.** The next Product-progress claim must add one real
   clean-installed capability through the same public root; internal readiness
   alone remains readiness.
4. **Make hard-break checks pre-edit and executable.** Scan forbidden legacy
   references and prove exact admission, definition selection, concrete owner
   invocation, ABG event truth, replay projection, and fresh-process equality
   on the first vertical slice.
5. **Enforce the reset budget.** One global authority counterexample or two
   rejected candidates on the same frozen boundary ends forward repair. Bank
   the falsifier, preserve the donor, return to the last satisfying cut, and
   correct the owning authority only.
6. **Freeze projections until source truth is singular.** Generate schemas,
   SDK, CLI, Codex, manifests, and catalogs only after the authoritative family
   and concrete owner ports pass the sentinel. Verify them mechanically by
   exact-set equality.
7. **Use independent review at three altitudes only.** Plan/design review asks
   whether the user outcome is on the critical path; sentinel review checks
   singular authority and fresh-process behavior; frozen-candidate review
   checks the complete installed Product. Local mechanical checks run between
   them.
8. **Report compensation status honestly.** Label every retained item
   `accepted`, `provisional behavior`, `rejected donor`, or `historical
   evidence`. Do not allow a green donor suite or recent branch head to promote
   itself.
9. **Do not call the arc complete until release evidence exists.** Completion
   requires one exact M5 candidate, M6 qualification against the singular
   method and RC5 witnesses, immutable RC/final-tap/stable subjects, and a
   fresh post-publication install. No current ref satisfies that predicate.

## Evidence Index

### Release and first-run evidence

- `v4.6.0-rc.5^{}` / `8d43dc8968e3df16029e6201680a0301eda035f1`
- `.ai-workspace/comments/codex/20260715T112903Z_REVIEW_abiogenesis-5-0-three-day-retrospective.md`
- `.ai-workspace/comments/codex/20260719T032359Z_ANALYSIS_4_6_rc5_practical_tether_for_5_0.md`
- `.ai-workspace/comments/codex/20260719T035900Z_POSTMORTEM_abiogenesis_5_0_seven_day_run.md`
- `.ai-workspace/comments/codex/20260719T040318Z_POSTMORTEM_abiogenesis_5_0_seven_day_delivery_failure.md`
- `.ai-workspace/comments/claude/20260719T060000Z_REVIEW_postmortem_verification_seven_day_delivery.md`

### Re-adoption and installed-root evidence

- `.ai-workspace/tickets/completed/T-283-reify-abiogenesis-5-product-definition.md`
- `.ai-workspace/tickets/completed/T-284-freeze-x-and-derive-5-correction-vector.md`
- `.ai-workspace/tickets/completed/T-285-accept-direct-gtl-traversal-realization-design.md`
- `.ai-workspace/tickets/completed/T-286-establish-installed-abi5-root.md`
- archive refs `archive/t284-x-freeze-20260720T022230Z` and
  `archive/t284-final-integration-freeze-20260720T032908Z`
- exact installed root `ffba4e71456cf19168fa2bbf2981b463e018a0cf`

### Destination and design-gate correction evidence

- `.ai-workspace/comments/codex/20260724T005517Z_REVIEW_stdo_2_0_correctness_amplifier_and_abiogenesis_destination_drift.md`
- `.ai-workspace/comments/claude/20260724T013000Z_CORRECTION_review_function_failed_to_detect_destination_drift.md`
- `.ai-workspace/comments/codex/20260725T025249Z_REVIEW_AUDIT_m5_prime_irreducibility_and_design_gate_failure.md`
- archive ref `archive/abi5-observer-tuner-wip-20260725T035544Z`
- accepted S03 candidate `8865ccff844d06f4f97765f014ae2b59c1e7d84b`

### S06 and reset evidence

- `codex/t287-wave1:.ai-workspace/comments/codex/20260731T054507Z_HANDOFF_s06_axiomatic_realization_dialogue_and_status.md`
- `codex/t287-wave1:.ai-workspace/comments/codex/20260731T063131Z_STRATEGY_abiogenesis_5_0_mvp_release_plan_corrected.md`
- `codex/t287-wave1:.ai-workspace/comments/codex/20260731T132538Z_HANDOFF_s06_gate_1_rejected_return_to_f_h.md`
- donor refs `donor/s06-public-facade-drift-e5902c55`,
  `donor/s06-native-closure-salvage`, and
  `donor/s06-rejected-dual-public-realization-20260731`
- reflog reset of `codex/t286-abi5-root` to `4d70778e` on Jul 30 and return to
  `08cd7485` after the dual-Public donor on Jul 31

### Wave 1 evidence

- `codex/t287-wave1:.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md`
- `codex/t287-wave1:.ai-workspace/comments/codex/20260801T053617Z_STRATEGY_f_h_proxy_worker_assurance_model.md`
- `codex/t287-wave1:.ai-workspace/comments/codex/20260801T172432Z_HANDOFF_wave_1_worker_bootstrap.md`
- `codex/t287-wave1:.ai-workspace/comments/codex/20260802T024114Z_ASSESSMENT_t287_wave1_phase0_and_first_holdsat_plan.md`
- donor refs `donor/rejected-w1-1a-96b131c1`,
  `donor/rejected-w1-1a-design-f97a995b`, and
  `donor/rejected-w1-1a-design-5cd1bec2`
- latest inspected heads: `dd935a1c`, `e1f483ad`, `86f01529`, and
  `01951d18`

## Final Finding

The four-week arc was a sequence of increasingly sophisticated attempts to
prevent the previous failure. Each compensation improved one dimension:
constitutional alignment, category correctness, Prime, proof, clean-root
construction, design completeness, exact review, axiomatic hard break,
fresh-process truth, or donor hygiene. The failure recurred because the
compensation was usually applied after directional work had already expanded.

The governing lesson is therefore not “add more method.” It is:

> Freeze one current Product outcome, make its smallest valuable installed path
> the active frontier, and let the first axiom counterexample reset the work
> before local rigor gives the wrong path a large blast radius.

ABIogenesis 5.0 remains recoverable from the accepted root and classified
stock. It was not delivered in this four-week arc.
