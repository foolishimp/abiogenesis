# ABIogenesis 5.0 Three-Day Delivery And Design-Churn Postmortem

Status: final historical commentary

Classification: delivery-process incident; Product direction retained

Incident window: 2026-07-24 through 2026-07-27 AEST

Authority: commentary only. This post records what happened and why. It does
not amend `GOALS.md`, `INTENT.md`, `PRODUCT.md`, requirements, accepted design,
tickets, code, scenario acceptance, qualification, or release truth.

This post follows the earlier
`.ai-workspace/comments/codex/20260719T040318Z_POSTMORTEM_abiogenesis_5_0_seven_day_delivery_failure.md`.
That post records the failed X integration trajectory. This post records the
subsequent direct-GTL recovery line's two delivery-process failures and the
design-led correction that restored convergence.

## 1. Executive Verdict

The direct-GTL ABIogenesis 5.0 Product direction remains viable. The
architecture did not fail during this incident.

Delivery discipline failed twice:

1. internal traversal and conservation assurance replaced the next public
   Product outcome as the work selector; and
2. after that was corrected, implementation and correlated self-review outran
   the atomic design of S03, S05, and S06.

The first failure produced sideways engine growth. The second produced repeated
candidate, review, repair, and refreeze cycles over code whose complete Product
function had not yet been resolved symbolically.

The corrective design pause on 2026-07-27 worked. It changed the development
relation from:

```text
implementation
  -> local semantic discovery
  -> worker self-review
  -> another repair
  -> another candidate
  -> repeat
```

to:

```text
complete Product function
  -> global constraints
  -> atomic relations and composition
  -> local module and interface projections
  -> falsification conditions
  -> accepted design
  -> one coherent implementation cut
  -> independent handoff
```

S05 is not accepted at the reviewed candidate. Its remaining findings are
bounded design-conformance defects. They do not justify another Product reset,
another zero-inherited rebuild, a new runtime, or another ticket programme.

## 2. Exact Review Basis

The natural three-development-day window is:

- starting checkpoint:
  `d0b516f2dc11919dee58ee44242f60bb9b3cbd80`;
- first drift checkpoint:
  `b98dc7f5be9373c9b475af558fe2dabc1bf04f80`;
- accepted S03 implementation:
  `8865ccff844d06f4f97765f014ae2b59c1e7d84b`;
- accepted S05 design:
  `283325aa082844ad4691ca07bb39882fda7152dc`;
- frozen S05 realization candidate:
  `3a10bd562193e4028c38a37208cd6d8175be2609`;
- candidate tree:
  `1a89378f3027443b37953e08a64520a39abf8d44`;
- evidence head and remote branch:
  `16b30f39c5bd6ed0fe7f7844b4fa81f2b1af85b4`; and
- branch:
  `codex/t286-abi5-root`.

The frozen candidate, its accepted authority, branch history, tracked
specification, design, tickets, commentary, code, and tests are the evidence
for this post.

A concurrent uncommitted S05 repair exists after the frozen head. It is outside
this postmortem subject. Pre-existing untracked review and strategy posts are
also excluded and were not used as authority.

## 3. Intended Recovery Outcome

The accepted 5.0 direction is:

```text
developer-authored GTL.TypeScript
  -> non-lowering validation
  -> admitted Product, install, workspace, lock, catalog, and implementation basis
  -> direct HoG traversal
  -> ABG admission, events, replay, continuation, and closure
  -> public SDK and thin CLI projection
```

The recovery line was meant to evolve the practical 4.6 Product into one
source-independent and feature-complete 5.0 Product without restoring:

- semantic compilation;
- a lowered executable Program;
- a Public, SDK, CLI, fixture, worker, or installer controller;
- a second runtime or event authority; or
- caller-authored replay, continuation, admission, or closure truth.

M4's installed Hello World root was a bootstrap traversal: the equivalent of a
language's first NOP or Hello World. It proved minimum package, install,
validation, traversal, event, replay, and CLI connectivity. Once green, it was
supposed to become a regression witness, not the continuing definition of
Product progress.

The next Product outcomes were supposed to advance through the installed public
path:

1. independently authored GTL Product;
2. complete S02 and live F_P;
3. One Surface and durable F_H continuation;
4. ordinary-path Consensus;
5. native and downstream portability;
6. observer/tuner and self-conformance;
7. qualification and release.

## 4. Measured Development Record

From `d0b516f2` through `16b30f39`:

| Measure | Value |
|---|---:|
| Elapsed development window | about 79 hours |
| First-parent commits | 93 |
| Commits on July 24 | 18 |
| Commits on July 25 | 43 |
| Commits on July 26 | 27 |
| Commits on July 27 through the freeze | 5 |
| Net tree change | 305 files, `+58,664/-5,593` |
| Cumulative commit editing | `+71,498/-18,560` |
| TypeScript source at the starting checkpoint | 73 files, 27,694 lines |
| TypeScript source at the frozen candidate | 88 files, 54,699 lines |
| Net test and proof change | approximately `+19,343/-226` |
| Documentation, method, or chore commits | 50 |
| Feature, fix, or repair commits | 38 |
| Design-labelled commits | 3 |
| Test-labelled commits | 2 |
| New tracked commentary posts | 52 |
| Checkpoint posts | 18 |
| Decision posts | 14 |
| Review posts | 13 |
| Commit subjects explicitly freezing, recording, or checkpointing a candidate | 24 |

These measures are not Product progress. They show the activity-to-outcome
ratio and the concentration of candidate churn. July 25 and July 26 alone
contained seventy commits.

## 5. Timeline And Rulings

| Phase | Exact span | Activity | Product consequence | Ruling |
|---|---|---|---|---|
| Sideways internal expansion | `331d5767..b98dc7f5` | fan-out/fan-in, replay lifecycle repair, durable event-history reopening | useful ABG stock; S02 remained open; conservation still reported `21/40` | wrong Product frontier |
| First Product-frontier correction | `51628cef` | rebind delivery to an independently authored installed GTL Product; demote the forty-row matrix to assurance | restored the public consumer as discriminator | correct reset |
| External Product and corrected S02 | `51628cef..12e0f8cd` | independent packed mini-product, non-empty dependency lock, caller-supplied publication, SDK/CLI path, durable F_H | first material consumer-observable advance of the period | retain |
| First S03 construction | `12e0f8cd..684d91c1` | One Surface, construction evidence, closure basis, gap re-entry, projections, public control, correction outcomes | substantial S03 capability; authority still being sealed after implementation | valuable but prematurely accepted in pieces |
| Premature S05/S06 expansion | `684d91c1..bcd8769a` | close S03, design and implement S05, declare S05 closed, accept S06 design, implement portability | useful Consensus and portability stock; false S03/S05/S06 closure | reject closure, retain stock |
| Design-method reset and S03 reclosure | `862a39d9..2fbf1a41` | reopen S03/S05, hold S06, adopt STDO 2.2, repair provenance, actor, continuation, and Product authority | S03 accepted at `8865ccff` | necessary correction |
| S05 code-first repair loop | `c4a0f42d..7c27f0aa` | repeated ordinary-path, source-truth, escalation, authority, One Surface, package, provenance, and submitter-loop repairs | strong Consensus behavior; no stable semantic cut | churn |
| S05 design pause | `f51cf8df..cbe9f33e` | isolate and repair one global-to-local S05 constraint network, then directly accept it | complete design basis established without runtime edits | successful correction |
| Accepted-design realization | `3a10bd56` | one implementation cut across 26 files, followed by one handoff at `16b30f39` | S05 largely realized; bounded conformance findings remain | repair once, do not reset |

## 6. Incident One: Assurance Became The Work Selector

At `b98dc7f5`, the branch reported:

- M4 `26/26`;
- M5 `70/70`;
- traversal conservation `21/40`;
- 32,074 TypeScript source lines; and
- a post-M4 delta of approximately `+33,375/-2,037`.

The code contained real fan-out, recursion, retry, F_P, event, replay, and
durable-history work. The operational frontier nevertheless remained an
internal traversal inventory.

The forty-row conservation matrix had become:

```text
complete a generic traversal and event engine constructor by constructor
  -> then expose the remaining Product
```

That was not the Product destination:

```text
evolve the practical 4.6 Product
  -> one general source-independent installed path
  -> complete 5.0 Product behavior
```

The failure was sequencing, not necessarily the local correctness of the
runtime work. Fan-out and durable history later supported S03 and S05. They
were initially elaborated before an independent consumer proved that the
public extension mechanism worked.

The active method amplified the drift:

1. an internal completeness property became the work frontier;
2. each implementation slice introduced a real local authority or lifecycle
   question;
3. reviewers correctly found local defects;
4. each repair made the internal engine more coherent;
5. green internal evidence was reported as delivery progress; and
6. the public Product remained behind the engine.

No individual finding needed to be false for their aggregate direction to be
wrong.

## 7. First Correction: Restore The Public Product Frontier

Commit `51628cef` made the decisive correction:

- M4 became a bootstrap and regression witness rather than a perpetual
  Product-progress governor;
- the forty-row matrix became assurance and qualification evidence rather than
  the implementation queue;
- the first independently authored installed GTL Product became the active
  discriminator; and
- only seams exposed by that public path could select implementation.

This correction did not discard the runtime. It retained `b98dc7f5` and changed
what selected further work.

The corrected path delivered:

- a separately packed developer mini-product;
- non-empty exact dependency locking;
- caller-supplied Module, Program, GraphFunction, contracts, judgment, and
  implementation publication;
- product-neutral catalog, SDK, and CLI invocation;
- direct GTL validation, HoG traversal, ABG events, and replay;
- live F_P;
- durable F_H hold, read, response, reopen, and continuation; and
- corrected S02.

This was genuine Product progress.

## 8. Incident Two: Scenario Closure Outran Design

After the first reset, the implementation moved quickly:

```text
S03 close
  -> S05 design
  -> S05 implementation
  -> S05 closure
  -> S06 design
  -> S06 portability implementation
```

The entire promotion from S03 closure through S06 implementation occurred in
about three hours on July 25.

The later audit proved that the claimed closure outran design:

- the accepted M05 Ontology still classified One Surface, Consensus,
  observer/tuner, and public breadth as deferred;
- S03, S05, and S06 were appended after the accepted Ontology and views;
- the appended sections did not perform complete affected atomic-function
  derivation, whole-family Prime contraction, IACS reconciliation, three-view
  reconciliation, and axiom evaluation;
- integration tests demonstrated executable behavior but not a complete
  design-to-code projection; and
- the same builder context authored, self-reviewed, repaired, and accepted
  successive cuts.

Commit `bcd8769a` therefore became behavioral stock. Its S03, S05, and S06
closure claims were withdrawn. The direct-GTL architecture and useful code
were retained.

## 9. Incident Three: Self-Review Turned Design Discovery Into Candidate Churn

S03 recovery eventually produced the accepted implementation at `8865ccff`.
It took five major candidate waves:

- `19f50c17`;
- `48beb3f3`;
- `5956d533`;
- `1d8fd3b0`; and
- `8865ccff`.

S05 then repeated the pattern more intensely. From S05 selection through
`7c27f0aa`, twenty-two commits changed code, tests, design, tickets, evidence,
and candidate identity.

The sequence repaired, in separate waves:

- ordinary installed path;
- escalation source truth;
- authority relations;
- review findings;
- Product and One Surface path;
- clean-checkout packaging;
- design provenance;
- submitter response; and
- submitter review-loop binding.

Candidate `48103ed9` was reported review-clean and acceptable. The next
requirement inspection found that the complete attributed submitter-response
relation between the reviewer findings vector and the next reviewer round was
absent.

That omission was not an isolated implementation typo. Its first repair
candidate changed nineteen files by `+2,756/-452`.

The causal conclusion is:

> The repeated findings were projections of one under-resolved Consensus
> function, not a series of unrelated local bugs.

Exact hashes, reproducible packages, green integration tests, and repeated
review could not reconstruct a Product algebra that had not been made complete
at design altitude.

## 10. Why Review Did Not Stop The Churn

The reviews were often locally correct. Their role and timing were wrong.

The worker repeatedly:

1. implemented a partial semantic cut;
2. issued or consumed a review from substantially the same context;
3. treated each finding as authority for another implementation patch;
4. froze a new candidate;
5. regenerated package and proof evidence; and
6. repeated before the complete function was independently reconstructed.

This produced correlated review:

- the reviewer inherited the builder's decomposition;
- tests encoded the current implementation's carrier inventory;
- exact-cut review checked a locally bounded subject;
- missing global relations stayed outside the subject until a later review
  happened to ask the right question; and
- each mechanically strong candidate increased confidence without resolving
  the whole Product function.

The root defect was not insufficient review effort. It was using review to
discover the design serially after code existed.

## 11. Why The Design Pause Worked

Implementation stopped at `7c27f0aa`.

The new S05 design resolved, before code resumed:

- complete Product entities and relations;
- identity and cardinality;
- Product, GTL, HoG, ABG, implementation, Public, and F_H authority;
- reviewer and submitter occurrence lineage;
- round, recursion, escalation, hold, continuation, result, replay, and closure
  lifecycle;
- total round and F_H algebras;
- atomic functions and higher-order composition;
- whole-family Prime contraction;
- IACS projection;
- module and interface direction;
- domain, sequence, and lifecycle views;
- cross-view axiom evaluation;
- module-owned proof boundaries; and
- explicit falsification conditions.

The design was frozen, repaired once, and directly accepted at `283325aa`.
Commit `3a10bd56` then projected it without modifying specification or design.

The activity pattern changed:

| Before design pause | After design acceptance |
|---|---|
| 22 S05 patch and refreeze commits | one implementation commit |
| design changed with semantic code repairs | design and specification unchanged |
| repeated partial candidates | one candidate and one handoff |
| worker self-review selected more work | worker stopped at the review boundary |
| each finding discovered another relation | current findings are visible as design-conformance differences |

Immediately before the pause, `code/src` contained 52,711 TypeScript lines. The
frozen realization contains 54,699. Approximately 96% of the final source
volume already existed. Line count is not Product completion, but it confirms
that the design pass organized, contracted, and completed retained behavior
rather than initiating another rebuild.

## 12. Product Capability Actually Gained

The incident produced substantial retained value:

- non-lowering GTL validation and direct HoG entry;
- independent developer-authored Product installation and invocation;
- generic publication, dependency, catalog, SDK, and CLI seams;
- live F_P transport with typed malformed-output refusal;
- B-001 worker-lane conservation;
- retry, recursion, gate, workflow, fibre, and fan-out/fan-in execution;
- durable event reopening;
- explicit ABG-owned event, result, judgment, replay, and closure truth;
- durable F_H hold, response, and same-Run continuation;
- One Surface construction, replay-derived frontier, gap re-entry, correction,
  and public control;
- ordinary GTL Consensus across existing, alternate, and temporary workspaces;
- reproducible installed packages; and
- reusable independent-catalog portability stock.

The honest scenario coordinate at the frozen head is:

| Scenario | Current truth |
|---|---|
| `ABG5-S01` | accepted installed bootstrap and retained regression root |
| `ABG5-S02` | corrected and green |
| `ABG5-S03` | accepted at `8865ccff` |
| `ABG5-S04` | observer/tuner and self-conformance not delivered |
| `ABG5-S05` | accepted design; realization largely complete but candidate not accepted |
| `ABG5-S06` | useful portability stock exists; scenario held and unaccepted |
| `ABG5-S07` | qualification and release subject not started |

The forty-row matrix remains implementation coverage. It is not forty Product
features and is not complete RC5 qualification.

## 13. Current S05 Residual

Independent code review of frozen candidate `3a10bd56` found bounded
conformance defects:

1. downstream profiles, policies, and ruling overlays do not enter through the
   accepted catalog contribution relation;
2. F_H finalization rewrites the admitted terminal round outcome instead of
   preserving its `escalate_fh` history while changing the final
   classification;
3. mandatory public Consensus schema and vocabulary rows are absent;
4. the native internal result candidate and serialized public result use one
   contract identity with different field requirements;
5. the accepted public `ticket.consensus` read is not wired through Public;
6. realization promoted a `ConsensusFinalizationState` carrier and topology not
   present in the accepted atomic design;
7. its validator can accept a false terminal `closed_done` state carrying an
   unresolved `escalate_fh` result; and
8. root compute and effect declarations understate the F_H boundary.

These findings block S05 acceptance. They do not invalidate:

- direct GTL;
- generic Public, HoG, and ABG ownership;
- same-Run continuation;
- the ordinary-path Consensus construction;
- the accepted S03 base; or
- the 5.0 Product direction.

They should be consolidated once and repaired as one affected conformance
delta.

## 14. Root Causes

### 14.1 Primary cause: wrong work selector

Assurance and conservation evidence became the active frontier. Internal
completeness was optimized before public Product feedback.

### 14.2 Primary cause: semantic design occurred in code

The complete S03 and S05 functions were not resolved as atomic constraint
networks before implementation. Code and review selected authority, topology,
lifecycle, carrier, failure, and closure relations.

### 14.3 Primary cause: worker and reviewer roles collapsed

The same context authored, reviewed, repaired, and refroze work. Review findings
became automatic authority for further growth.

### 14.4 Contributing cause: exactness substituted for completeness

Candidate hashes, tree identities, package digests, deterministic builds, and
green tests were accurate. They established exactness of the selected subject,
not completeness of the selected Product function.

### 14.5 Contributing cause: high-capability execution amplified ambiguity

High-effort agents could elaborate every locally discovered relation. When the
global design was under-specified and no stop condition separated work from
review, capability increased the amount and internal coherence of side growth.

The model was not the sole cause. The work contract allowed local discoveries,
self-review, and implementation momentum to keep selecting more work.

### 14.6 Contributing cause: proportionality was applied locally

Each repair could be justified as removing a named ambiguity. The aggregate
cost and absence of Product-outcome movement were not used to stop the series.

Proportionality must compare total reasoning and reconciliation complexity
against disambiguation of the selected Product outcome, not justify each local
addition independently.

## 15. Five-Why Compression

1. **Why did S05 require repeated repair?**

   Each review found another missing authority, lifecycle, or causal relation.

2. **Why were those relations missing?**

   The complete Consensus algebra had not been resolved before coding.

3. **Why did coding continue?**

   Co-evolution was treated as permission for implementation to discover
   material design, while every green checkpoint authorized another slice.

4. **Why did review not stop it?**

   Worker and reviewer contexts were correlated, and reviews inspected
   successive bounded cuts rather than independently reconstructing the whole
   Product function.

5. **Why did the aggregate direction remain hard to challenge?**

   Exact identities, tests, evidence, and local correctness increased
   confidence faster than consumer-observable Product truth advanced.

## 16. Corrective Controls Already Adopted

### 16.1 One Product outcome selects work

`GOALS.md` selects one unresolved consumer-observable outcome. Assurance,
preservation, code volume, tests, reviews, and implementation momentum do not
select work.

### 16.2 Bootstrap witnesses expire as progress governors

`ABI5-ROOT-001` remains a permanent regression. Repeating it after acceptance
does not count as Product progress.

### 16.3 Assurance remains subordinate

The forty-row matrix remains conservation and qualification evidence. It is not
the implementation queue.

### 16.4 Material design precedes realization

Where the complete symbolic function can fit within the available reasoning
context, identity, authority, atomic relations, composition, topology,
lifecycle, interfaces, failure, and closure are resolved at design altitude.
Code projects that design.

### 16.5 Worker and reviewer roles are separated

The worker:

- authors one coherent cut;
- performs mechanical readiness checks only;
- freezes one exact subject;
- writes one handoff; and
- stops.

Independent reviewers reconstruct and challenge semantics. Findings are
consolidated before at most one bounded repair pass.

### 16.6 Review findings do not automatically select growth

A finding blocks its exact claim. It does not independently authorize another
ticket, refactor, carrier, artifact, proof family, or future-generalization
programme.

### 16.7 Later outcomes remain held

S06, observer/tuner, conservation qualification, M6, and release receive no
implementation authority until S05 is accepted.

## 17. Required Recovery

The bounded recovery path is:

1. consolidate the current S05 findings once;
2. distinguish accepted-design requirements from any genuinely missing design
   relation;
3. prefer conforming, contracting, or deleting implementation over expanding
   design;
4. return to design or F_H only if one real authority, topology, lifecycle,
   interface, failure, or closure decision remains unresolved;
5. make one implementation repair;
6. freeze one replacement candidate;
7. run one independent exact-cut review;
8. accept or reject S05;
9. only after acceptance, select S06; and
10. reuse the retained portability stock through the same public extension
    path.

No Product rewrite, third rebuild, compiler restoration, new runtime, new event
family, new ticket hierarchy, or comprehensive method amendment is warranted.

## 18. Drift Indicators

The build is drifting again if any of the following occur:

- design changes during each implementation repair;
- more than one replacement S05 candidate is generated without F_H direction;
- the worker issues semantic verdicts over its own cut;
- review findings create new ticket or artifact families by default;
- S06 or later Product files enter the S05 repair;
- tests, proofs, comments, or code grow without closing the named public
  outcome;
- another internal ledger becomes the delivery queue;
- a new controller, event authority, result store, continuation authority, or
  runtime appears;
- the accepted global design is widened to preserve an implementation
  invention rather than testing whether that invention is necessary; or
- candidate mechanics are treated as proof that the complete Product function
  exists.

## 19. What This Postmortem Does Not Conclude

This incident does not establish that:

- Prime, IACS, Ontology, or the three views are harmful;
- design is documentation overhead;
- all co-evolution is unlawful;
- fan-out, recursion, durable history, or other retained ABG atoms are waste;
- the direct-GTL architecture should be abandoned;
- 4.6's lowered execution handoff should return;
- odd_glc should gate the ABIogenesis 5.0 release;
- Consensus should become hard-coded runtime behavior; or
- more review effort would independently solve under-specified design.

The opposite lesson holds:

> Symbolic design is valuable because it resolves global relations at a scale
> an LLM and a human can reason over. It prevents the same relations from being
> rediscovered across hundreds or thousands of lines of realization.

## 20. Final Assessment

The last three development days contain two stories.

The first is approximately two days of real Product capability buried inside
wrong-frontier work, premature closure, and recursive review churn.

The second is a design-led correction that preserved the architecture and most
of the code while restoring a direct line:

```text
Product requirement
  -> complete atomic design
  -> accepted module and interface projection
  -> one code realization
  -> independent review
```

The Product direction is credible. The execution discipline had to be repaired.

The immediate obligation is one bounded S05 conformance repair and one exact
review. A third course correction would be justified only by a new
Product-level or architectural contradiction, not by the existence of the
current finite defect list.
