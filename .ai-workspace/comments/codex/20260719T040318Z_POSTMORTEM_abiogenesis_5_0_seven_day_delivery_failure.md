# ABIogenesis 5.0 Seven-Day Delivery Postmortem

Status: open for F_H review

Classification: release-blocking delivery failure

Incident window: 2026-07-11 through 2026-07-19 AEST

Review basis:

- branch `codex/abiogenesis-5-final-integration`
- committed and remote HEAD `232f7b2d34e765d743c885782d6305a445c96118`
- the current uncommitted integration wave
- ABIogenesis `v4.6.0-rc.5` at `8d43dc8968e3df16029e6201680a0301eda035f1`
- current specification, ratified design, ticket history, commentary, release snapshots, code, and tests
- the independent whole-path findings supplied by F_H on 2026-07-19

Authority: commentary only. This post records what happened. It does not amend
GOALS, INTENT, PRODUCT, requirements, ratified design, tickets, or code.

## 1. Executive Verdict

The seven-day ABIogenesis 5.0 delivery has failed to produce a ratifiable
release candidate or one conformant installed product workflow.

The failure is not that the 4.6 to 5.0 evolution was wrong. The evolution is
still coherent:

```text
4.6: one ABG-owned start/iterate runtime
  ->
5.0: an admitted GTL program interpreted through explicit One Surface
     authorities by one ABG-owned traversal runtime
```

Consensus remains the correct proof construction over that evolved capability.
It is not a separate engine feature and it is not a reason to roll the product
back to the 4.6 implementation.

The delivery failed at integration. The lower GTL/ABG algebra and much of the
generic runtime substrate are real. The public M04 integration did not conserve
their authority model:

1. the SDK became a product-local traversal controller;
2. One Surface stage implementations were not bound to admitted program/plugin
   authority;
3. old and replacement public operation families remained live together;
4. the installed proof established event co-presence and correlation, not one
   causal Event Calculus episode;
5. nine of nineteen public operations remained unconnected;
6. the integration branch did not incorporate the ten commits between the RC3
   ancestor and the practical RC5 baseline, including the real Claude
   worker-executes transport repair.

The result is a large body of locally tested work with no accepted complete
product path. Green component gates, a strict build, focused `72/72`, and the
installed T-276 `1/1` do not overcome those defects. They prove different,
narrower properties.

Implementation remains paused. No 5.0 RC should be cut from this state.

## 2. Intended Outcome

The intended 5.0 result was a stable baseline before dogfooding begins in
5.0.1. It was meant to preserve the practical 4.6 product while refining the
language and runtime so that:

- GTL supplies the constructive program;
- GraphFunction is the sole public named callable work contract;
- the seven C terms are authorable and executable through the traversal monad;
- One Surface keeps `synthesizeModel`, `evalGap`, `evaluateNext`, and
  `evaluateAction` distinct without turning public ingress into a controller;
- `abg.cli` invokes published GraphFunctions against named, alternate, and
  temporary workspaces;
- typed F_P output is admitted defensively;
- typed F_H stop, response, and continuation are public product behavior;
- Event Calculus and replay preserve runtime truth across public operations;
- the public surface has one Prime authority and one hard break;
- Consensus is a pure GTL free construction proving that consumers can build
  the same class of governed decision network from public atoms;
- a packed, clean-install, source-blind workflow proves the released product.

The intended proof sequence was therefore:

```text
pack exact candidate
  -> clean temporary install
  -> create and bind workspace
  -> observe catalog and replay truth
  -> resolve a published GraphFunction
  -> invoke through abg.cli
  -> one admitted GTL/ABG traversal
  -> admitted result and causal replay
  -> ticket_consensus projection
  -> typed terminal or F_H continuation outcome
```

That complete sequence does not currently exist as accepted evidence.

## 3. Actual Outcome

### 3.1 Product outcome

| Claim | Current truth |
|---|---|
| Version | Still `5.0.0-dev.0` |
| 5.0 release cut | None |
| 5.0 tag | None |
| Exact immutable candidate | None |
| Ratifiable installed Hello/Consensus path | None |
| Consensus GTL body | Real and retained as a capability probe |
| Seven-term C algebra | Accepted in isolation by the latest review |
| Generic runtime substrate | Substantial, but some families require root-path revalidation |
| Public 19-operation surface | Structurally defined; functionally incomplete |
| Public operation handlers | Ten connected, nine unconnected in the reviewed wave |
| F_H respond/continue product path | Not closed |
| Event causal continuity | Not proven |
| Hard break | Failed; legacy and replacement public truth coexist |
| Release qualification | Not started against an exact 5.0 candidate |
| Practical downstream baseline | ABIogenesis `v4.6.0-rc.5`; paired GLC qualification remains outside this tree |

### 3.2 Measured delivery record

These figures describe scale and churn. Generated assets inflate line counts,
so they are not a claim that every added line is maintained source code.

| Measure | Verified value |
|---|---:|
| Commits in current history from Jul 11 through Jul 18 | 300 |
| Core integration commits from canonical GTL Consensus body through committed HEAD | 209 |
| Commits before the installed T-276 governor arrived | 174 of 209, about 83% |
| Time from the canonical GTL body to the installed governor | about 99 hours |
| Current active 5.0 tickets | 8 |
| Completed T-242 through T-280 ticket records | 27 |
| Codex commentary posts Jul 11 through Jul 19 | 204 |
| Claude commentary posts Jul 11 through Jul 19 | 15 |
| Current tracked dirty files | 257 |
| Current untracked status paths before this post | 82 |
| Current dirty tracked delta | `+20,522/-9,137` |
| Current worktree versus RC5 | 851 files, `+221,751/-11,192` |
| Product source line growth versus RC5 | about +92,397 lines |
| Test/proof line growth versus RC5 | about +94,326 lines |
| Design line growth versus RC5 | about +31,169 lines |
| Specification line growth versus RC5 | about +2,052 lines |

The current committed HEAD equals the pushed branch, but the integration that
was being reviewed is an additional large, uncommitted wave. This makes the
review basis reproducible only by preserving the current worktree, not by
checking out the branch.

### 3.3 Baseline lineage failure

The integration branch does not descend from the latest practical 4.6 release:

```text
merge-base(v4.6.0-rc.5, HEAD) = f4f081f6 (v4.6.0-rc.3)
v4.6.0-rc.5-only commits      = 10
5.0-branch-only commits       = 288
```

The ten RC5-side commits are not patch-equivalent in the 5.0 branch. They
include RC4/RC5 release work and the downstream B-001 repair that connected the
Claude `worker_executes` lane through the real `runAgentTransport` dispatch and
made failure classification lane-aware.

The current 5.0 `shared/abg_library/agent_transport.ts` confirms the regression:

- `AgentTransportRequest` has no `lane`;
- Claude dispatch always includes `--safe-mode --tools ""`;
- any tool call is classified as `contract_failure`;
- the real dispatch path cannot reproduce the RC5 Claude worker-executes proof.

This does not mean 5.0 must reuse the 4.6 runner. It means the evolutionary
branch failed to conserve a verified product capability while changing the
runtime architecture. RC5 is a behavioral and lineage tether, not a mandate to
roll back the accepted 5.0 design.

## 4. Timeline

| Date | Change or decision | What was genuinely established | What was absent or later rejected |
|---|---|---|---|
| Jul 11 | RC3 and early installed SDK/CLI steel thread | Exact RC3 cut; packed topology; one live Claude invocation; SDK/CLI equivalence | Outcome was a truthful nonterminal assurance stop; no full C runtime, Consensus, or F_H continuation |
| Jul 11-12 | Stable-first course correction | 5.0 is the full stable product; dogfooding moves to 5.0.1 | Earlier package fixed point and GLC-over-ABG ladder were not self-hosting proof |
| Jul 12 | First Consensus implementation at `945b5a27` | Focused tests and packed matrices exercised intended behaviors | Entire constructive body was 1,363 lines of imperative plugin orchestration; no graph; reverted at `2c85a889` |
| Jul 12 | Mandatory domain, sequence, and state designs | The category error became visible; generic missing atoms were identified | Still no installed Consensus execution |
| Jul 13 | Canonical pure GTL Consensus body at `754341ab` | Real GTL data over public constructors; valid capability probe | Body admission and compiler proof were not an installed product workflow |
| Jul 13-14 | T-255 through T-267 generic runtime wave | Typed handoff, F_P admission, F_H carriers, HOF, batch, retry, recurse, and conservation components | Most closures were self-reviewed locally; no independent full authority-path proof |
| Jul 13-14 | RC4/RC5 support repair on another line | Real Claude dispatch and lane-aware classification proven through `runAgentTransport` | The 5.0 integration line did not absorb those commits |
| Jul 14 | First holistic DS-1 to DS-3 review | Found incomplete census, recurse parent bypass, whole-program loss, missing callers, and disconnected F_H lifecycle | Earlier DS completion claims were false as integrated-product claims |
| Jul 14-15 | Repairs and first whole-project Prime pass | Important substrate defects fixed; duplicate authorship reduced | Prime ran after substantial duplication already existed; still no installed Consensus path |
| Jul 15 | Three-day retrospective and ontology re-entry | Recognized target, category, false closure, and operation-surface errors | Correct lessons were documented but not yet embodied in one executable delivery governor |
| Jul 15-16 | T-278 repair rounds and ratification | Accepted 27 atomic families, seven compositions, 19 public operations, One Surface, and hard break | Ratification explicitly did not accept provisional T-270/T-272 runtime code |
| Jul 16-17 | T-280/T-281 and public-family work | Private One Surface/compiler and definition-family structure gained focused proof | Publication and functional installed behavior remained absent |
| Jul 17 | T-276 installed governor introduced | First continuous source-blind clean-install probe since T-223; failed honestly at preflight | It arrived after 83% of core integration commits and initially reached zero target invocations |
| Jul 18 | Operation/schema and T-270 integration wave | Lower algebra, compiler, conservation, interpreter, and private definition surfaces stayed focused-green | Public join remained uncommitted and incomplete |
| Jul 18-19 | T-276 made green; independent whole-path review | Seven-term C algebra and traversal substrate accepted in isolation | Green installed proof rejected: SDK controller, unauthorised callbacks, dual public truth, noncausal events, incomplete handlers |
| Jul 19 | RC5 tether analysis | Correctly identified the practical baseline and some lost behavior | Its prescription to restore the old runner overreached; F_H rejected rollback framing and paused work |

## 5. Technical Failure Analysis

### 5.1 A correct target was repeatedly replaced by a nearby property

The build repeatedly proved properties that resembled the requested outcome but
were not equivalent to it:

| Requested property | Substitute that passed |
|---|---|
| Self-hosting/evolved builder capability | Deterministic packaging fixed point |
| Consensus as a GTL free construction | Imperative plugin with a GraphFunction identity |
| Complete runtime algebra | Authorable or locally callable constructors |
| One public product surface | Published identity and schema counts |
| Admitted semantic implementation authority | Locally unique inline callbacks |
| One Event Calculus episode | Events with shared identifiers and expected counts |
| Hard break | Replacement family added while legacy exports remained |
| Installed generic GraphFunction invocation | One Sunny-specific installed path |
| Release readiness | Large focused and semantic suites without a conformant installed workflow |

This was the main recurring defect. The tests were often accurate about the
property they encoded. The encoded property was weaker or categorically
different from the product claim.

### 5.2 The first Consensus realization hid the graph in a plugin

The first Consensus implementation placed reviewer fan-out, prompt assembly,
rounds, retry, reduction, and closure inside a TypeScript plugin. The catalog
published a GraphFunction name, but the body was not a GTL graph.

That violated the product at its centre and concealed the exact gaps the proof
was supposed to discover: generic fan-out, program selection, `workflow.C`,
`C.batch`, and `C.retry` runtime realization. The same-day revert was correct,
but the error consumed time and showed that local tests and review had not asked
the category question: "where is the constructive carrier?"

### 5.3 The repaired substrate outran product integration

The replacement process correctly built a real Consensus GTL body and generic
atoms. It then expanded into a long sequence of compiler, carrier, conservation,
interpreter, admission, publication, schema, and ontology tickets.

Much of that work is valid. The delivery error was allowing local closure to
stand in for composition. The root installed path was absent for about four
days and 174 of 209 core integration commits. There was no executable governor
forcing every slice to preserve or advance:

```text
published graph -> public invoke -> one traversal -> event/replay -> result
```

Consequently, locally correct components accumulated around an invalid join.

### 5.4 The public SDK became a second controller

The accepted design says public ingress admits and transports, while one
admitted GTL program and one ABG interpreter own traversal. It explicitly makes
an SDK-selected F_P branch, a raw declaration read, another C-call, or another
controller a hard stop.

The current M04 `run.invoke` implementation nevertheless performs:

- One Surface selection;
- compilation and execution preparation;
- direct GraphFunction execution;
- lifecycle event concatenation;
- post-action evaluation;
- consequence disposition routing.

Nonterminal dispositions were initially thrown rather than returned as typed
continuation truth. This is imperative orchestration over the traversal monad,
not one interpretation of the admitted composition.

The design was substantially correct. The code-to-design conformance proof was
not. Three diagrams and focused tests did not mechanically prove the absence of
a second controller in the full call path.

### 5.5 Semantic implementation authority was not admitted

The One Surface runtime checked callback kind, stage identity, and local
uniqueness, then invoked caller-supplied functions. The published system program
declared an empty `pluginContractRefs` set.

This means schema and carrier admission existed, but the implementation that
gave the stage its meaning was not selected through admitted program/plugin
authority. Tests showed that an inline callback could supply semantic meaning
and receive admitted evidence. The path was typed, but it was not governed by
the declared program.

### 5.6 Event proof confused correlation with causation

The installed proof observed a public admission episode and traversal events
with shared identifiers and expected counts. The lifecycle factories did not
carry the required causal parent, and the events were emitted as an independent
prelude.

The proof therefore established:

```text
public admission exists
AND traversal events exist
AND identifiers correlate
```

It did not establish:

```text
public admission
  CAUSES basis admission
  CAUSES graph-call/frame/vector traversal
  CAUSES result/hold/closure
  CAUSES replay-derived fluent delta
```

Event Calculus is meant to be the state-preserving connective tissue between
public operations. Co-presence is insufficient.

### 5.7 Prime compressed authorship but did not enforce singular live truth

Prime was initially treated as a local carrier annotation. Whole-family
contraction arrived only after substantial implementation and design growth.
Later work correctly reduced duplicate schema, operation, capability, scenario,
and proof authorship.

However:

- the Prime gate originally allowed authority growth when authoring-source count
  fell;
- local source contraction did not prove whole-package authority singularity;
- the replacement public operation family was published while the legacy DS1
  family remained exported;
- counts such as 19 operations, 62 keys, and 196 schema slots proved structural
  completeness, not executable ownership.

Prime must be transactional at the hard break: replacement and deletion are one
change, followed by an export-level proof that no second authority survives.

### 5.8 The stable release was not conserved into the evolution branch

The 5.0 branch remained based on RC3 while RC4 and RC5 repaired the real Claude
transport on `support/4.6.x`. The integration work never reconciled those ten
commits.

This is a source-line control failure. A release intended to evolve the last
practical product must explicitly conserve, supersede, or reject each later
baseline fix. It cannot silently branch below the latest working cut.

## 6. Why Review And Gates Failed

### 6.1 Review scope was local when the claims were global

Most tickets were reviewed against their own declarations, fixtures, focused
tests, and diagrams. That was useful for local defects. It could not establish
that all pieces composed through one authority path.

Examples:

- T-252 proved a canonical graph body, not installed invocation;
- T-253/T-254 proved generic relation authoring, not runtime use;
- T-257 proved F_P result admission, not public traversal ownership;
- T-267/T-271 proved conservation and interpretation in focused lanes, not the
  M04 root join;
- T-280 proved One Surface stages locally, not that the SDK would not control
  them;
- T-281 proved the operation family shape, not handler connection or deletion
  of the old family;
- T-276 proved its own assertions, but those assertions omitted semantic
  authority and causal-parent obligations.

The first independent whole-path review came after roughly 200 core integration
commits.

### 6.2 The implementer, self-reviewer, and delegated F_H seat collapsed

Delegated authority accelerated local decisions, but the same delivery line
frequently authored, tested, self-reviewed, recorded acceptance, and closed the
slice. Independent review later reopened several of those closures.

Self-review is valuable for defect discovery. It is not independent assurance
for a root architectural claim. The status vocabulary did not consistently
preserve that distinction.

### 6.3 Gates checked proxies

| Gate | What it usefully checked | What it did not check |
|---|---|---|
| Mermaid | Required design files, syntax, domain/sequence/state views | Code follows the diagrams; no second controller exists |
| Prime | Declared source counts and later some authority conservation | One live exported authority across the whole package |
| Governance | Ticket/reference shape | Product closure or implementation correctness |
| Schema/publication | Identity, schema, asset parity | Handler behavior or traversal authority |
| Focused runtime | Local carrier and transition outcomes | Full installed ownership and causal chain |
| T-276 installed | Source-blind pack/install and its asserted path | Admitted implementation authority and Event Calculus causality |
| Full semantic suite | Broad regression against encoded expectations | That the expectations equal the current product claim |

The issue was not insufficient gate count. It was missing property alignment.

### 6.4 Status projection became work

The seven-day window produced 219 Codex/Claude commentary posts and repeated
ticket, GOALS, board, design, decision, self-review, and closure projections.
Many corrections were necessary. Repeatedly restating progress across these
surfaces did not advance the installed product and sometimes left mutually
stale claims.

This was the ticket churn F_H repeatedly warned against. Documentation should
have served as guardrails around a running steel thread. Instead, delivery was
often governed by the documentation sequence itself.

### 6.5 Proportionality and probability were recorded but not enforced

The target is a single-developer desktop product. Likely failures are malformed
GTL and malformed F_P output. Hostile in-process tampering and adversarial local
filesystem attacks have materially lower delivery probability and impact for
this release.

The build had already learned this during the T-217 review loop, but it did not
consistently apply the lesson. It continued to spend heavily on universal
contracts, census machinery, and defensive structure before proving the sunny
installed path. Some of that work is reusable; its sequence was disproportional.

Misplaced hedging became technical debt because it complicated the likely path
without protecting the current use case.

## 7. Root Causes

### 7.1 Primary root cause

Delivery was optimized for local ticket closure and formal surface completion,
not for continuous proof of the product's defining installed behavior.

### 7.2 Contributing causes

1. **Substituted-property acceptance.** Tests and reviews repeatedly accepted a
   nearby property under the stronger product headline.
2. **Late steel thread.** The source-blind installed governor arrived after 83%
   of the core integration commits.
3. **Non-independent architectural closure.** Delegated self-review closed
   slices whose claims required root-path review.
4. **Unconserved release lineage.** RC4/RC5 fixes landed outside the 5.0 branch
   and were never reconciled.
5. **Design-to-code gap.** The accepted design forbade a second controller, but
   no executable invariant proved controller absence.
6. **Local Prime application.** Source contraction was evaluated within slices
   before singular live authority was proven across the package.
7. **Generated and projection amplification.** Large schema, catalog, fixture,
   test, and commentary surfaces made functional incompleteness hard to see.
8. **Parallel integration without one composition gate.** Multiple worktrees
   improved local throughput while increasing provenance and join risk.
9. **Failure to obey repeated F_H direction.** Requests for proportionality,
   fewer tickets, sunny-day skeletons, and a steel thread were translated into
   more framework work before product proof.

### 7.3 Five-whys compression

```text
Why is there no ratifiable 5.0 workflow?
  Because the installed path violates traversal ownership, semantic authority,
  event causality, and the hard break.

Why did it still pass tests?
  Because the tests checked counts, correlation, local callbacks, and focused
  outcomes rather than those root properties.

Why were the root properties absent from the tests?
  Because tickets and reviews decomposed the build locally and the installed
  governor arrived late.

Why did local decomposition govern delivery?
  Because progress was measured by leaf closure and projection completeness,
  not movement of one executable product path.

Why was that allowed after repeated corrections?
  Because the pen-holder did not convert the user's proportionality and
  steel-thread rulings into a non-negotiable merge condition.
```

## 8. Accountability

The pen-holder is accountable for the delivery failure.

Specific Codex errors were:

1. formalizing the user's self-hosting intent as the wrong fixed-point proof;
2. implementing Consensus as imperative plugin orchestration despite explicit
   graph-first product law;
3. allowing locally green tickets to be reported as phase completion without
   independent composition proof;
4. discovering Prime after duplication had spread instead of applying
   contraction before design;
5. permitting the public SDK to acquire orchestration authority even though the
   accepted design forbade it;
6. accepting an installed proof that counted correlated events rather than
   proving causality;
7. failing to atomically remove the legacy operation surface;
8. failing to reconcile RC4/RC5 support fixes into the evolutionary branch;
9. introducing the installed delivery governor much too late;
10. continuing paperwork and framework work after repeated F_H requests for a
    working sunny-day skeleton;
11. responding to the latest audit with an overbroad recommendation to restore
    the 4.6 runner, instead of first distinguishing a behavioral tether from an
    architectural rollback.

Claude and independent review also accepted some false closures or missed
category defects. That does not reduce pen-holder accountability. F_H should
not have had to repeatedly rediscover whether the implementation matched the
product's basic structural model.

The user impact is material:

- approximately seven days of delayed 5.0 delivery;
- repeated interruptions to re-explain intent and architecture;
- loss of confidence in progress reports and plans;
- a large dirty integration state requiring classification before safe reuse;
- support-line work that is absent from the 5.0 branch;
- no current release candidate to give downstream consumers.

## 9. What Worked

The postmortem should not discard valid progress.

1. **The invalid imperative Consensus implementation was reverted before a
   release.** The defect did not become a public product commitment.
2. **The canonical Consensus body is now real GTL.** It is a pure-data free
   construction over generic atoms and remains the correct capability probe.
3. **The compiler census exposed missing primitives.** Typed HOF selection,
   batch, retry, recurse, and workflow composition were driven by real demand.
4. **Non-Consensus fixtures constrained feature-shaped law.** Several generic
   atoms were proven against a second consumer.
5. **Independent reviews found structural defects.** T-262, T-267, T-271,
   T-256, Prime, ontology, and final integration defects were surfaced before a
   5.0 RC.
6. **Prime reduced genuine duplicate authorship.** The contract-family,
   operation-definition, schema, capability, and scenario contractions remain
   useful if their live authority is revalidated.
7. **Strict malformed-output admission is aligned with the real risk model.**
   T-257-style defensive handling is proportionate to likely F_P failure.
8. **T-276's source-blind pack/install concept is correct.** Its assertion set
   is insufficient, but it is the right place for product convergence.
9. **The latest holistic review stopped an invalid release.** No false 5.0 tag
   or RC was published.
10. **RC5 remains a practical fallback and behavioral oracle.** Downstream work
    is not blocked on the invalid 5.0 candidate.

## 10. Salvage Classification

This is a provisional technical classification for review, not permission to
resume implementation.

### 10.1 Retain, then revalidate at the root

- the seven-term C algebra;
- typed GraphFunction, GraphVector, Module, and program carriers;
- the canonical pure GTL Consensus body;
- typed HOF vector relations and vector-to-program selection;
- strict raw Module admission;
- strict F_P result-contract admission;
- generic `fan_out`, `fan_in`, `workflow.C`, `C.batch`, `C.retry`, and recurse
  atoms;
- the reachable graph-family compiler;
- the complete-C structural interpreter;
- T-267 whole-program conservation repairs;
- F_H public contract carriers;
- Prime contract-family and schema-authoring compression;
- the T-276 source-blind installation harness.

Retention does not mean every current implementation detail is accepted. These
surfaces have substantive value and should not be rolled back merely because
the public integration failed.

### 10.2 Rework before reliance

- M04 public SDK ownership and `run.invoke`;
- One Surface runtime implementation binding;
- public operation handler integration;
- Event Calculus parentage and replay proof;
- F_H response/continue integration;
- the generic installed Consensus path;
- public operation publication and export topology;
- release-line reconciliation with RC5;
- T-276's assertions and fixtures.

### 10.3 Remove or supersede

- SDK-owned traversal/orchestration logic;
- inline semantic callbacks without admitted program/plugin authority;
- legacy DS1 public operation exports and parallel registries;
- Sunny-specific assumptions presented as generic `run.invoke`;
- tests that accept event co-presence as causal proof;
- closure claims derived only from publication counts;
- stale ticket and status projections that conflict with the current worktree;
- the repair prescription in
  `20260719T032359Z_ANALYSIS_4_6_rc5_practical_tether_for_5_0.md` that calls for
  restoring the old 4.6 runner.

## 11. What Should Have Happened

A proportionate evolutionary delivery would have kept one installed path alive
from day one:

1. branch from or explicitly reconcile the latest practical 4.6 cut;
2. preserve one packed Hello World through every architectural change;
3. introduce the pure GTL Consensus body as a red capability probe;
4. add only the generic atom exposed by the current typed gap;
5. rerun the same installed path after every atom;
6. add F_H continuation only after terminal Consensus works;
7. derive the public operation surface from the working path and product model;
8. replace public truth atomically rather than publish then clean up;
9. run one independent whole-path conformance review before expanding the
   remaining operations;
10. qualify the exact packed candidate.

This would not have avoided all compiler or runtime work. It would have made
each addition answerable against one product outcome and would have exposed the
M04 controller and event-causality defects much earlier.

## 12. Conditions Before Restart

These are stop conditions, not a new ticket programme.

1. Preserve the current dirty worktree as evidence before changing it.
2. F_H reviews and accepts this postmortem's factual account, especially the
   distinction between valid 5.0 evolution and invalid public integration.
3. Reconcile the ten RC5-side commits by classifying each as conserved,
   superseded by an accepted 5.0 mechanism, or still missing. No silent drop is
   allowed.
4. Produce one current whole-path model of the evolution:

   ```text
   public admission
     -> admitted GTL program and plugin authority
     -> one ABG interpreter/traversal monad
     -> one causal event episode
     -> replay-derived projection
     -> typed terminal or continuation result
   ```

5. Map the existing dirty implementation to that model as retain, rework, or
   remove. Do not create another ontology or planning programme.
6. Amend the existing T-276 installed governor so it proves controller absence,
   admitted implementation authority, causal Event Calculus parentage, no
   legacy exports, and generic GraphFunction identity.
7. Treat the same installed path as the only delivery governor:

   ```text
   Hello overlay -> generic Consensus -> F_H respond/continue
   ```

8. A subsequent slice may merge only if it moves or preserves that path.
9. Apply proportional defense: malformed GTL and malformed F_P output are in;
   hostile in-process and tamper-proof desktop hardening are out unless a
   concrete high-probability failure requires them.
10. Use one author self-review and one independent root-path review at critical
    checkpoints. Leaf acceptance must not imply product acceptance.

Until these conditions are accepted, runtime implementation remains frozen.

## 13. Evidence Index

Primary durable evidence:

- `.ai-workspace/comments/codex/20260715T112903Z_REVIEW_abiogenesis-5-0-three-day-retrospective.md`
- `.ai-workspace/comments/claude/20260713T010000Z_REVIEW_945b5a2_consensus_graphfunction_expansive.md`
- `.ai-workspace/comments/codex/20260714T012248Z_REVIEW_consolidated_ds1_ds3_adjudication.md`
- `.ai-workspace/comments/codex/20260714T170452Z_REVIEW_full_tree_checkpoint_self_review.md`
- `.ai-workspace/comments/codex/20260715T234641Z_DECISION_fh_accept_t278_v9_target_shape.md`
- `.ai-workspace/comments/codex/20260716T055554Z_DECISION_t278_ontology_ratified.md`
- `.ai-workspace/comments/codex/20260717T061159Z_CHECKPOINT_t276_governor_t281_registry_link.md`
- `.ai-workspace/comments/codex/20260718T064000Z_SELF_REVIEW_t274b1_exact_native_definition_delivery.md`
- `.ai-workspace/comments/codex/20260719T032359Z_ANALYSIS_4_6_rc5_practical_tether_for_5_0.md`
- `build_tenants/abiogenesis/typescript/design/M03_CONSENSUS_REJECTED_AS_BUILT_BEHAVIOR_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/adrs/ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/consensus_gtl_body.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/complete_c_program_runtime.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/public_sdk/sdk.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/public_contracts/abg_system_one_surface_program.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/event_factories.ts`
- `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/agent_transport.ts`
- `v4.6.0-rc.5:release_snapshots/abiogenesis-typescript-tenant/4.6.0-rc.5/release-note.md`

Commit evidence:

- `f4f081f6` - ABIogenesis 4.6.0-rc.3
- `945b5a27` - rejected imperative Consensus implementation
- `2c85a889` - revert of rejected Consensus implementation
- `754341ab` - canonical pure GTL Consensus body/probe
- `8d43dc89` - ABIogenesis 4.6.0-rc.5 release record
- `83c87dec` - T-278 `/9-candidate` target
- `59e9dce4` - T-278 ontology ratification
- `6b89ad90` - T-280 closure checkpoint
- `4cce9b79` - private 19-operation family checkpoint
- `42db6661` - T-276 installed driver
- `232f7b2d` - current committed and pushed 5.0 integration HEAD

## 14. Final Statement

The week did not produce ABIogenesis 5.0. It produced a valuable evolved
language/runtime substrate, a lawful Consensus proof body, and a large amount
of integration and proof machinery, but the current public path violates the
product's controlling axioms and has also lost verified RC5 behavior.

Calling that state close to release would repeat the exact substituted-property
failure documented here. Calling all of it wasted would also be false. The
correct disposition is to preserve the valid substrate, reject the current
public integration as a release basis, restore evolutionary conservation, and
resume only under one continuously exercised installed product path after F_H
reviews this record.
