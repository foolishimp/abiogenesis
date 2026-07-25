# REVIEW: STDO 2.0 Correctness Amplification And ABIogenesis Destination Drift

**Author**: Codex
**Date**: 2026-07-24T00:55:17Z
**Addresses**: released STDO `v2.0.0` and the ABIogenesis 5.0 M5 trajectory at `b98dc7f5be9373c9b475af558fe2dabc1bf04f80`
**Status**: Open
**Updated**: 2026-07-24T00:58:32Z

## Summary

The practical effect of STDO 2.0 on the current ABIogenesis build has become
negative.

The released STDO 2.0 text did not mandate the current engine-first trajectory.
It says that Product progress must be judged against a directly verifiable
Product outcome, that preservation and prerequisite readiness are not Product
progress, and that the default priority is the smallest supported Product path.
The active ABIogenesis plan does the opposite: it uses completion of forty
internal traversal rows as the leading work queue while the general public
catalog, SDK/CLI, dependency, human-continuation, Consensus, observer/tuner,
and downstream-consumer paths remain incomplete.

This is therefore not a simple claim that STDO contains the wrong words. It is a
more damaging result:

> STDO acted as a correctness amplifier. Once the Product destination and work
> ordering drifted, the method made the wrong work more exhaustive, more
> reviewed, more evidenced, and harder to stop.

A methodology intended for LLM-directed development must be judged by that
practical failure mode. Normatively correct clauses are insufficient when
predictable agent behavior can convert assurance inventories into Product
features and local review findings into an indefinitely expanding engine.

This post records current reality and a proposed correction. It is commentary,
not Product, requirement, design, ticket, or shared-method authority.

## Review Basis

### ABIogenesis

- branch: `codex/t286-abi5-root`
- reviewed HEAD and remote:
  `b98dc7f5be9373c9b475af558fe2dabc1bf04f80`
- completed installed root: M4 at `ffba4e71`
- active work owner: T-270
- reported gates: M4 `26/26`, M5 `70/70`
- reported conservation state: `21/40` with `19` explicit gaps
- post-M4 delta: 140 files, `+33,375/-2,037`
- current TypeScript source under `code/src`: 32,074 lines
- immutable semantic predecessor: ABIogenesis `v4.6.0-rc.5`

The tracked worktree was clean during this review. Five pre-existing untracked
Claude review posts were left untouched.

### STDO

- selected release: `v2.0.0`
- release commit:
  `94ccf4faa1c0a10b002273b1e9a9e7bf4a34753a`
- standards member-set digest:
  `284efbb31affd6772fe8e523bdd157f7f2ebe4d4d8dee7b5c9ddfd0482da93a0`
- predecessor: `v1.8.0`
- published normative increase: 8,619 to 9,482 top-level standards lines,
  `+863` or `10.01%`

The rejected executable STDO candidate and the released normative STDO 2.0 are
different subjects. This review does not conflate them.

## 1. Intended ABIogenesis 5.0 Destination

The high-altitude Product direction remains coherent:

```text
practical ABIogenesis 4.6
  -> preserve verified Product behavior and repairs
  -> retire the lowered executable declaration as rival program authority
  -> author GTL.TypeScript directly
  -> validate without lowering
  -> traverse the admitted GTL value through HoG
  -> admit runtime truth through ABG
  -> expose one general catalog, SDK, and CLI
  -> complete F_H continuation, Consensus, observer/tuner, portability,
     qualification, and release
```

`specification/PRODUCT.md:35-67` states that destination directly. It describes
a feature-complete, source-independent successor to the practical 4.6 Product
and compresses it to one public path:

```text
GTL.TypeScript source
  -> TypeScript checking
  -> GTL validation
  -> module and catalog admission
  -> program start or GraphFunction call
  -> HoG traversal
  -> F_D | F_P | F_H
  -> ABG event admission and replay
  -> typed Product outcome
```

The intended 5.0 Product is not a compiler project and is not an internal
runtime-completeness programme. It is the externalized and feature-complete
evolution of 4.6.

## 2. The Operational Destination Changed

The active M5 plan replaced the Product destination with a nearby internal
property.

`specification/GOALS.md:109` makes M5 closure depend on:

- all forty traversal rows;
- the fibre differential;
- S02, S03, S05, and S06;
- observer/tuner realization; and
- the seventeen-family ledger.

The execution order at `specification/GOALS.md:135-142` then places complete
graph/C traversal and the forty-row matrix before:

- F_H response and continuation;
- One Surface;
- Consensus;
- observer/tuner;
- downstream portability; and
- the general public and host projections.

`specification/PRODUCT.md:660` reinforces that ordering by defining complete
execution of every retained graph relation, every C constructor, and the whole
4.6 traversal matrix as one Product outcome.

This is not equivalent to preserving 4.6.

The immutable RC5 note explicitly says that complete runtime realization of
`workflow.C`, `C.batch`, and `C.retry` was not a 4.6 claim. It also says that
live observer/tuner, executable Consensus, sticky sessions, the 5.0 catalog,
graph shell, public consumption, and self-hosting were future work. A lawful
term in the 4.6 authoring algebra is not automatically a realized 4.6 Product
behavior, and preservation of its identity is not an obligation to implement
its complete runtime before delivering the 5.0 public Product.

The current operational destination has therefore become:

```text
complete a generic traversal/event engine constructor by constructor
  -> then expose the remaining Product
```

That is not the accepted high-altitude destination:

```text
evolve the practical 4.6 Product into one general, source-independent,
feature-complete 5.0 Product
```

## 3. Installed Evidence Of The Drift

The code is internally substantial but remains externally conformance-specific.

### Catalog admission is not general

`build_tenants/abiogenesis/typescript/code/src/public/operations.ts:447-480`
accepts a `module_publication` operation but does not consume an independently
authored module publication. It constructs
`constructHelloWorldModulePublication` inside the public operation.

### Public invocation is feature-specific

`build_tenants/abiogenesis/typescript/code/src/public/operations.ts:668-740`
admits only four built-in contract families:

- Hello World;
- F_P Hello;
- bounded-recursion Hello; and
- fan-out Hello.

Every other admitted GraphFunction contract is refused because the Product has
no corresponding hard-coded input admission function.

### Product dependency truth is absent

`build_tenants/abiogenesis/typescript/code/src/product/environment.ts:23-30`
defines `dependencyEdges` as an empty tuple. Its lock constructor hashes and
returns an empty dependency set regardless of the installed Product set.

### Product progress is being reported at the wrong altitude

The plan reports `21/40` traversal progress and `70/70` M5 tests. Those figures
are truthful about their bounded suites. They are not evidence that an
independent developer can publish an arbitrary lawful GTL module, admit it,
resolve dependencies, invoke or start it through the public shell, stop at an
F_H boundary, respond, continue the same run, or construct Consensus through
ordinary public contracts.

The tests are proving increasingly exact internal properties of a narrow
installed demonstration. The Product remains narrow.

## 4. What Released STDO 2.0 Actually Says

The released method does not prescribe the current work order.

### Product Outcome Conservation

`SPEC_METHOD.md:553-572` says:

- every Product-bearing wave identifies one directly verifiable Product
  outcome;
- only material advance against that outcome projects Product progress;
- prerequisite readiness and preservation do not count as Product progress;
- unresolved gaps block the affected path, not unrelated work globally; and
- outcome success is necessary evidence, not complete Product closure.

### Proportional Method And Delivery

`SPEC_METHOD.md:574-606` says:

- method cost is judged by ambiguity removed versus reasoning complexity
  introduced;
- duplicated truth and expanded reconciliation paths are disproportionate;
- the default priority is the smallest supported Product path; and
- this priority relation is not a fixed global execution sequence.

### Proportional Design Sequencing

`DESIGN_MODULE_METHOD.md:361-399` says:

- design, implementation, and tests may co-evolve when no unresolved material
  architecture decision remains;
- a prior design gate is required only at a material durable decision; and
- another acceptance surface is disproportionate when it adds no
  disambiguation.

Against those clauses, the current ABIogenesis M5 trajectory is nonconforming.
Internal preservation and prerequisite work has been projected as Product
progress, and the forty-row inventory has become a global sequence ahead of
the smallest supported public Product path.

## 5. Why STDO Still Bears Responsibility

It is not enough to conclude that agents applied the law incorrectly.

STDO is specifically intended to govern agentic development. A predictable LLM
failure mode is therefore part of the method's design boundary.

The current failure chain is:

1. A correct high-level Product direction was expanded with an internal
   completeness requirement.
2. The completeness requirement became the M5 work frontier.
3. Each implementation slice introduced a real local authority or lifecycle
   question.
4. Reviewers correctly found many of those local defects.
5. Each repair made the internal engine more coherent.
6. Green internal evidence was projected as delivery progress.
7. The general public Product remained behind the internal engine.

No individual review finding had to be false for the aggregate direction to be
wrong. Local rigor compounded global drift.

The method currently has strong rules for:

- traceability;
- exact identity;
- authority separation;
- negative proof;
- design completeness;
- predecessor conservation; and
- review integrity.

It has weaker practical protection against:

- inflation of Product scope by assurance concerns;
- conversion of a conservation inventory into a delivery work queue;
- a minimal always-green root that does not govern the active frontier;
- repeated local review that never reprices the global direction;
- selection of a high-cost fundamental re-adoption strategy without a
  comparative value and delivery-cost decision; and
- proof volume growing while public Product capability remains unchanged.

The result is a method that can make an incorrect destination extremely
well-governed.

That is the damning lesson:

> Governance is harmful when it increases confidence, cost, and resistance to
> change faster than it increases delivered Product truth.

## 6. We Recreated Waterfall

The delivery process used short implementation and review iterations, but its
governing shape became waterfall:

```text
close the complete Product definition
  -> close the complete requirement surface
  -> accept a large realization design
  -> build an internally complete traversal/event substrate
  -> prove every internal family
  -> integrate the public Product afterward
```

Frequent commits, tests, and reviews do not make that sequence agile. They make
the waterfall increments smaller while preserving its delayed Product
feedback.

The forty-row matrix became a phase-completion gate. Review then optimized each
local implementation boundary before the Product could reveal whether that
boundary was needed, correctly shaped, or on the shortest path to user value.
This is why many reviews were individually correct while the aggregate work
continued toward the wrong destination.

Fail-fast reasoning is only useful when failure is measured against the right
surface:

> Fail fast against the current public Product outcome. A fast failure against
> an internal substitute property only accelerates movement in the wrong
> direction.

The required agile relation is:

```text
preserve one working predecessor Product path
  -> select one small public 5.0 outcome
  -> specify and design only its unresolved semantic boundary
  -> implement through the installed public path
  -> observe Product truth
  -> retain, revise, or delete
  -> select the next public outcome
```

Ontology, IACS, Prime, and semantic views remain useful when a slice crosses a
material boundary. They serve the slice and remove its ambiguity. They do not
require all future architecture to close before the first Product increment is
delivered.

The traversal matrix remains valuable as a regression and conservation
instrument. It runs behind and across Product slices. It must not become a
waterfall phase that delays the catalog, invocation shell, F_H continuation,
Consensus, or downstream use until every internal row is complete.

## 7. Value That Should Not Be Discarded

This finding does not establish that all post-M4 work is waste.

The current line contains valuable donor material:

- the non-lowering GTL validator boundary;
- direct HoG traversal primitives;
- ABG-owned event and replay truth;
- exact F_P worker transport and result admission;
- B-001 capability-lane conservation;
- installed packaging and source-blind root proof;
- opaque implementation-port work;
- append-only durable event reopening; and
- focused negative evidence against rival compiler and controller authority.

Those assets earn retention only where they support the corrected public
Product path. Their existence does not justify preserving every current
carrier, event family, route, fixture, or conformance-specific construction.

The 33,375-line post-M4 delta is donor material, not presumed Product value.

## 8. Immediate ABIogenesis Correction

The current M5 expansion should stop at
`b98dc7f5be9373c9b475af558fe2dabc1bf04f80`.

The smallest lawful correction is bounded:

1. Preserve the current branch and exact checkpoint.
2. Do not implement the remaining nineteen traversal rows under the current
   sequence.
3. Reprice the affected Product, Goal, and T-270 clauses in place; create no new
   ticket hierarchy.
4. Preserve the forty-row matrix as a semantic conservation and regression
   ledger.
5. Do not use the matrix as the Product work queue or as proof of Product
   progress.
6. Distinguish:
   - behavior actually realized by 4.6;
   - authored 4.6 algebra that was not a released runtime claim;
   - explicitly accepted new 5.0 Product behavior; and
   - successor behavior that does not gate 5.0.
7. Resume through public vertical outcomes:
   - independently authored module publication and catalog admission;
   - generic contract-bound GraphFunction invocation;
   - real Product dependency resolution;
   - program start, read, F_H response, and continuation;
   - ordinary-path Consensus;
   - observer/tuner and independent downstream portability; and
   - exact qualification and release.
8. Keep, refactor, or delete current implementation according to contribution
   to those paths.

This is a bounded Product correction. It is not another zero-inherited rebuild,
compiler restoration, ticket programme, or constitutional rewrite.

## 9. Method Follow-Up

Do not amend STDO immediately. Another constitutional reaction made before the
ABIogenesis correction produces measured results would risk repeating the same
failure.

After the corrected Product path advances, evaluate whether one small STDO
successor amendment is necessary. The candidate lessons are:

### Evolutionary predecessor default

Where a working released Product exists, preserve and modify it by default.
Fundamental re-adoption remains lawful but requires explicit human selection
against a comparative Product-value, deletion, proof, and delivery-cost case.

### Assurance subordination

A proof matrix, conservation ledger, taxonomy, gate family, or method
obligation does not become Product functionality, Product progress, or a
release blocker unless the owning Product authority explicitly makes the
corresponding behavior part of the Product.

### Public-scenario precedence

The delivery governor must exercise the current valuable public Product path.
An internal component, algebra inventory, or always-green minimal scenario
cannot govern unrelated work merely because it is exact.

### Directional stop condition

When several promoted slices increase internal proof or implementation volume
without advancing a public Product outcome, the wave must re-evaluate its
outcome and ordering before more horizontal work is accepted.

These should remain semantic laws. They must not create another workflow
engine, carrier schema, fixture programme, receipt family, or mandatory review
surface.

## Non-Conclusions

This review does not conclude that:

- direct GTL traversal is wrong;
- the lowered 4.6 executable declaration should return;
- all current M5 code should be deleted;
- Ontology, IACS, Prime, or the three semantic views are unsound;
- every internal traversal row lacks Product value;
- 4.6 should be copied wholesale; or
- released STDO 2.0 contains no value.

It concludes that STDO 2.0 has failed its practical governance purpose in this
run because it did not prevent, expose early, or cheaply stop a well-governed
movement toward the wrong operational destination.

## Recommended Action

Accept the finding as the basis for an immediate ABIogenesis work hold and one
bounded correction of the existing Product/Goal/T-270 trajectory.

Do not continue internal traversal expansion and do not open a shared-method
amendment yet. First restore a general public 4.6-to-5.0 Product path and use
its measured delivery result to judge which current implementation and which
method lesson are actually valuable.
