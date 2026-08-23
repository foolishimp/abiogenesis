# STRATEGY: Independent Axiom-To-Code Assurance Method

**Author**: Codex external assurance
**Date**: 2026-08-05T01:18:26Z
**Addresses**: Independent review of moving ABIogenesis 5.0 realization work and frozen candidates
**Status**: Open

## Summary

This post records the external-assurance method that detected the T-287 catalog
readiness regression while the implementation remained mechanically healthy.
It is local methodology commentary. It does not amend Product, requirements,
accepted design, T-287, STDO, implementation authority, or acceptance state.

The reusable procedure below is target direction for this external auditor.
Section 14 is dated incident evidence. Neither section selects work. Existing
F_H role delegation and Consensus-review orchestration remain separate
non-governing commentary unless adopted by a live authoritative surface. This
post does not duplicate, supersede, or assign those roles.

The method treats Product axioms and selected requirements as the restoring
force. Review supplies concrete counterexamples. Test counts, deletion volume,
reviewer agreement, and implementation momentum do not cure a violated axiom.

The review relation used here is:

```text
exact Product frame
  + live constitutional authority
  + exact realization subject
  + reachable production path
  + falsifiable proof oracle
  + installed and fresh-process behavior
  -> counterexample search
  -> continue | bounded_pause | reject_candidate | re_enter
```

## Scope

Use this method for external assurance of:

- a moving implementation when directional drift must be caught early;
- a frozen feature or slice candidate;
- a wave, qualification, RC, or release boundary; and
- a claimed authority contraction, hard break, or lifecycle deletion.

The method is review-only. The reviewer reads, reproduces, falsifies, reports,
and freezes a disposition. The reviewer does not implement the repair, create
replacement Product meaning, or turn findings into another design programme.
No worker, supervising reviewer, F_H proxy, or generated report is
self-authenticating. Each material claim remains unverified until the external
auditor grounds it in the exact live authority, code, and evidence subject.

## Core Position

The reviewer does not ask whether the patch looks coherent. The reviewer asks
whether one exact Product relation survives every downstream layer.

For each proposed delta `D` over candidate state `C`:

```text
admissible(D) =
  satisfies(Product + requirements, C + D)
  and conforms_to(selected design, C + D)
      only after the design is shown compatible with Product and requirements
  and advances(the selected Product outcome)
  and introduces no rival semantic authority
```

One counterexample is enough to reject the affected claim. Several green suites
do not outweigh it.

## 1. Establish The Product Frame

Every review begins from upstream truth, not from the worker handoff, design
receipt, diff, or failing test.

Record:

```text
fixed Product outcomes:
active wave:
selected feature and slice:
exact required outcome:
source authority:
tool or construction owner:
runtime authority:
projection owner:
explicit prohibitions:
candidate state: moving | frozen
```

For ABIogenesis, first read `specification/GOALS.md` and the active ticket to
identify the selected wave, slice, and design pointer. Then evaluate meaning in
constitutional order:

1. `specification/INTENT.md`;
2. `specification/PRODUCT.md`;
3. applicable `specification/requirements/`;
4. the selected accepted design as downstream `HOW`; and
5. code and proof as realization evidence.

The selection surfaces identify the subject. They do not let a ticket or
design outrank Intent, Product, or requirements.

Comments, generated files, donor behavior, historical commits, and reported
test results are evidence. They cannot resolve an upstream contradiction.

## 2. Classify The Relation Before Reviewing Its Implementation

Classify every affected subject as one of:

- immutable definition;
- validated input or admitted basis;
- deterministic construction;
- derived tool or cache;
- pure projection;
- runtime execution entity;
- admitted runtime event;
- Event Calculus fluent;
- observation or evidence; or
- workspace transformation.

Then name its owner and lifecycle:

```text
identity
  -> construction or admission
  -> validation
  -> use
  -> durable preservation, reconstruction, or disposal
```

This prevents a useful simplification from silently changing entity class.
Removing runtime lifecycle from a deterministic tool may be correct. Removing
the validation that makes the tool safe is a separate semantic change.

Only an exact Product or requirement grant may promote a runtime execution
entity, event, fluent, observation, evidence carrier, or workspace
transformation into ABG authority. Implementation convenience and design
placement cannot supply that grant.

```text
remove unlawful lifecycle authority
  !=
remove required semantic validation
```

## 3. Build A Claim-Evidence Vector

Do not audit a summary sentence in isolation. Expand every material claim into
its required evidence.

| Reported claim | Evidence required |
|---|---|
| Build passes | One isolated build of the exact subject; no semantic conclusion |
| Catalog authority removed | Rival event, registry, replay, object-identity, and process-local paths are unreachable while selected readiness remains |
| Conservation passes | The conserved rows retain their original oracle and execute through the selected path |
| Installed chain passes | Each obligation crosses the installed, source-blind Product path and is not a renamed unit test |
| Full suite passes | One frozen subject, isolated build/package environment, complete required test roster, and unchanged load-bearing oracles |
| Fresh-process equality holds | A second process reconstructs from durable authority without originating objects or ambient context |
| Net code deletion | No selected capability, refusal, provenance relation, or authority boundary was deleted with the redundancy |

An evidence vector is incomplete when one row is supported only by a label,
count, generated receipt, or worker report.

Grade each atomic claim independently:

- `confirmed`: direct live evidence establishes the claim;
- `qualified`: the core claim is true but its scope or stated consequence is
  too broad;
- `unproven`: available evidence does not reach the claimed relation;
- `contaminated`: shared state or an unstable subject invalidates the evidence;
  and
- `contradicted`: live evidence establishes the opposite result.

A status report can therefore contain confirmed mechanics and a contradicted
semantic conclusion at the same time.

## 4. Trace One Load-Bearing Relation End To End

Follow the selected relation through:

```text
Product outcome
  -> requirement
  -> accepted design placement
  -> public or owner ingress
  -> concrete production callable
  -> authority consumed
  -> result or refusal
  -> event and Event Calculus consequence, when runtime
  -> replay or projection
  -> installed consumer
  -> negative proof
```

At every edge, ask:

- Does the downstream carrier preserve the exact upstream identity?
- Does the concrete owner receive all required authority?
- Is any required basis fetched from object memory or ambient context?
- Can an unrelated basis be substituted?
- Does the refusal happen before an effect?
- Can a second process derive the same answer?
- Does another path decide the same meaning?

Record an authority contradiction at the earliest owning layer. A design that
conflicts with Product or requirements does not push the contradiction down
into code. It supports a recommendation for the smallest lawful upstream
re-entry to the actor holding that authority.

This trace is more reliable than line-reviewing a large patch uniformly. It
concentrates review depth at the relations whose failure changes Product
behavior.

## 5. Review Deletions As Semantic Changes

A hard break contains two independent questions:

1. Which obsolete authority must disappear?
2. Which selected behavior must survive through the replacement relation?

Use a deletion ledger:

| Deleted surface | Authority or behavior carried | Required disposition |
|---|---|---|
| Rival registry, event, fluent, authoritative cache, controller, or adapter | Unselected authority | Delete and prove unreachable |
| Readiness, identity, provenance, compatibility, refusal, or installed behavior | Selected Product meaning | Preserve through the one lawful owner |
| Generated projection | Derived view | Regenerate from the selected source |
| Legacy semantic test | Obsolete oracle | Delete only after the replacement oracle is installed |

The number of deleted lines is not evidence of successful contraction. The
relevant measure is reachable semantic authorities and retained Product
behavior.

A discardable cache is lawful when loss changes neither meaning nor acceptance
and the cache is not required to recover, interpret, continue, or admit truth.
Only a required or authoritative cache belongs in the deletion row above.

## 6. Search For Counterexamples Before Reading Green Paths

Start with mutations that distinguish authority from convenient construction:

- equal identity with unequal content;
- duplicate invocation or admission;
- shuffled input order;
- direct dependency versus transitive dependency;
- missing dependency edge;
- incompatible Product or contract;
- unrelated workspace, lock, install, or publication;
- cross-Run or cross-prefix substitution;
- two interleaved Runs;
- restart without originating objects;
- cache loss;
- retry after failed admission;
- effect before refusal;
- stale projection against a newer durable prefix;
- forged digest-consistent carrier;
- caller-supplied currentness;
- terminal, consumed, superseded, or abandoned reuse; and
- absent provenance with otherwise valid content.

For each mutation, record:

```text
test ingress:
process boundary:
fixture or carrier source:
mutation:
observable oracle:
expected refusal or equality:
earlier prerequisite that could mask the defect:
paired positive control:
```

A negative test is useful only when it reaches the intended relation. Failure
at packaging, parsing, an absent export, or an unrelated prerequisite does not
prove the target refusal.

## 7. Inspect Proof Semantics, Not Test Names

For every green proof claimed at a load-bearing boundary:

1. identify the production callable actually invoked;
2. identify the exact state or authority supplied;
3. identify the assertion that would fail under the target mutation;
4. confirm that the fixture does not construct the desired answer itself;
5. confirm that the test is included in the governing suite;
6. confirm that installed tests consume the package rather than source paths;
7. confirm that a fresh-process test really launches another process; and
8. confirm that generated artifacts bind the same exact candidate.

Common false proofs include:

- creating an empty store, invoking no owner admission, then asserting the
  store remains empty;
- renaming a pure component test after an installed obligation;
- deleting the negative case that the new implementation fails;
- building an authoritative-looking carrier in the test;
- checking a digest without admission or provenance;
- running only a single process against a process-local registry; and
- omitting the new proof file from the aggregate script or governor.

## 8. Separate Live Monitoring From Frozen Review

### Moving-tree monitoring

Use moving-tree review only to detect directional deviations whose continued
spread would increase repair cost:

- a second semantic authority appears;
- a selected capability or refusal is removed;
- process-local state becomes required for currentness or continuation;
- a compatibility translation enters the replacement path;
- tests are rewritten to accept the defect;
- new unselected events, stores, controllers, or catalogs appear; or
- authority text is changed to justify an implementation already in motion.

Moving-tree findings are warnings or bounded pauses. They are not acceptance
judgments because the subject is not stable.

A moving-tree review never returns `PASS`. Absence of a current counterexample
means monitoring continues; it does not establish candidate acceptance.

Record a read-only observation identity when useful:

```text
HEAD:
tracked patch digest:
untracked manifest digest:
observation time:
active build or test processes:
```

### Frozen-candidate review

Acceptance review requires:

- exact base commit and tree;
- exact tracked patch identity;
- exact intended untracked-file manifest;
- exact generated, package, and proof identities;
- no worker edits during review; and
- one governing authority basis.

If the subject moves, freeze the finding against the observed sample and start
candidate review only after the worker freezes again.

## 9. Use Independent Lenses, Not Reviewer Votes

For high-risk authority work, split assurance into independent bounded lanes:

### Authority lane

Checks:

- Product and requirement preservation;
- entity classification and owner;
- singular authority;
- forbidden bridges;
- capability deletion;
- lifecycle and provenance; and
- scope and milestone drift.

### Constructability lane

Checks:

- reachable production call path;
- installed package exports and dependencies;
- fresh-process reconstruction;
- failure timing and mutation reachability;
- test inclusion and oracle validity;
- build/package isolation; and
- exact candidate reproducibility.

Both lanes inspect the same subject without consuming each other's conclusions.
The external auditor reproduces both evidence sets against live files and
reports the resulting counterexamples. The applicable F_H and Product-authority
surfaces retain advancement and repricing authority. Agreement increases
confidence; it never substitutes for evidence. One valid counterexample
outweighs a vote.

## 10. Protect Qualification From Mechanical Contamination

Build and package commands may share mutable outputs. Parallel test lanes are
unsafe when any lane cleans, rebuilds, packs, regenerates manifests, or rewrites
proof artifacts in the same checkout.

Qualification rules:

- coding lanes may run independently only when edit and output ownership is
  disjoint;
- package and installed-product qualification runs serially unless each run
  has an isolated worktree and output root;
- one stable tree is built once for the final qualification sequence;
- active process census precedes a supposedly isolated run;
- module-not-found, missing-manifest, and digest mismatch failures during
  overlapping builds are classified as contaminated evidence; and
- contaminated auditor output is discarded. It is not evidence against the
  code and does not validate the worker's earlier report.

## 11. Detect Cancerous Growth By Authority, Not Volume

Large diffs increase review cost. They are not intrinsically cancerous.

Cancerous growth is self-justifying semantic expansion. Indicators include:

- a repair creates another registry, ledger, event family, controller, runtime,
  catalog, or currentness path;
- an adapter translates new contracts into an obsolete authority;
- Public switches on operation identity to supply owner semantics;
- a test-side constructor fabricates authority unavailable to users;
- a local implementation gap expands Product or ticket meaning;
- new commentary or design is written mainly to ratify code already present;
- each finding produces another general framework rather than one bounded
  correction; or
- proof generation grows while installed behavior remains absent.

Pure helper duplication, module placement, formatting, and later compression
are proportionality findings after singular authority and selected behavior are
proven. They do not stop 5.0 by themselves.

## 12. Grade Findings Against Accepted Invariants

Every blocking finding contains:

```text
severity:
violated Product or requirement relation:
reachable production path:
concrete counterexample:
observable consequence:
why existing proof does not establish the claim:
smallest bounded disposition:
```

Use these dispositions as review recommendations. They do not themselves
accept, reject, pause, or reprice the work:

- `continue`: no load-bearing counterexample;
- `continue_with_monitor`: advisory risk without current Product violation;
- `bounded_pause`: stop only the affected lane while unrelated work proceeds;
- `reject_candidate`: the frozen subject violates selected behavior or
  singular authority;
- `re_enter`: Product, requirement, or materially different authority meaning
  must change; and
- `qualification_invalid`: mechanical evidence is contaminated or does not
  bind the exact subject.

Do not prescribe callable names, helper placement, field names, or replacement
features when the worker can choose them inside accepted authority.

## 13. Thresholds For Recommending A Hold

Return a `bounded_pause`, `reject_candidate`, or `re_enter` recommendation when
evidence establishes:

- a second reachable authority for the same semantic fact;
- a selected Product capability or refusal has disappeared;
- process-local state changes durable, replay, or fresh-process behavior;
- new input is translated into an obsolete semantic family;
- Public or a projection authors owner meaning;
- runtime truth is not derived from admitted ABG events and Event Calculus;
- an installed consumer needs the source checkout;
- an effect can occur before required validation or refusal;
- a proof oracle was weakened to fit the implementation; or
- the candidate identity cannot be established.

Recommend holding only the affected lane when the defect is bounded. Identify
unrelated construction whose Product oracles remain unchanged and may lawfully
continue. Recommend upstream re-entry only for a real Product/requirement
contradiction or materially different lawful architectures. The actor holding
live F_H or Product authority decides and executes the transition.

## 14. Worked Example: Catalog Readiness Versus Catalog Lifecycle

This is a non-reproducible dated account of a rejected moving-tree observation,
not proof against the current repair. The recorded hashes identify the sample
that the auditor observed, but no immutable patch bundle, authority snapshot,
untracked bytes, or canonical reproduction procedure was retained:

```text
observation time: 2026-08-04T23:00:58Z
HEAD: a1fa19f68213aa0773b88b3b6ef9ba2e41f5ee99
tracked patch sha256: 597c8c703face59c5fa5258841c64bf3945bf792e56491180701a1468b89a4f9
untracked manifest sha256: 8af439b570d02eea552c9d8607440f0763552b3137c82ec93b7dbf6d35618141
combined observation sha256: c56e8ff9cda951edcac59b88ddaeb81e60ba4147b3ac6bf35118d203b2985077
```

The account therefore preserves the reasoning pattern only. It cannot satisfy
the frozen-subject or cold-reproduction standard defined by this method.

At that observation, the T-287 contraction correctly targeted:

- catalog registry membership;
- catalog runtime events and Event Calculus fluents;
- replay-owned catalog lifecycle;
- object-identity admission brands; and
- process-local catalog state.

The observed implementation also removed the separate readiness relation required by
`REQ-P-CATALOG-014` and `REQ-P-CATALOG-029`.

The dated evidence lived in:

- `specification/PRODUCT.md`, especially `A5-F01`;
- `specification/requirements/product/REQ-P-CATALOG.md`;
- `build_tenants/abiogenesis/typescript/code/src/public/operations.ts`,
  `applyCatalogAdmit`;
- `build_tenants/abiogenesis/typescript/test_env/tests/m5-s06-prime.test.mjs`;
  and
- `build_tenants/abiogenesis/typescript/test_env/tests/r4-catalog-admission.test.mjs`.

Those files have continued through bounded repair. Current
`applyCatalogAdmit` consumes a `readinessBasis` and calls the concrete
Product/catalog owner `admitGraphFunctionCatalog`. The case records the rejected
observation, not current behavior or permanent line numbers.

The decisive evidence was:

1. Product and requirements retained exact workspace, lock, dependency,
   compatibility, provenance, and publication coherence.
2. `applyCatalogAdmit` retrieved a workspace state but did not consume its lock
   or dependency graph before returning `buildGraphFunctionCatalog`.
3. The S06 A -> B -> C negative was replaced with a deterministic dictionary
   test that asserted dependency satisfaction was absent.
4. R4 constructed an unused empty event store and therefore proved only pure
   dictionary mechanics.
5. Aggregate build, conservation, R1-R10, and M5 counts did not exercise the
   missing relation.

The bounded correction targets both parts of the model:

```text
exact workspace binding
  + resolved lock
  + installed and verified Products
  + descriptors and contribution manifests
  + direct dependency and compatibility results
  + provenance
  + published GTL definitions
  -> pure catalog.admit readiness validation and construction
  -> ephemeral reconstructible GraphFunctionCatalog
```

`catalog.admit` remains a Public readiness operation. Public admits the request,
selects the exact Public operation definition, calls the concrete
Product/catalog owner validator-constructor, and projects its outcome. Public
does not own catalog semantics. The returned catalog is not a runtime entity
and creates no catalog runtime event, Event Calculus fluent, persistent
registry, or process-local authority.

One upstream owner/meaning contradiction remained when this post was written:

- `specification/INTENT.md` assigned product, workspace, catalog, and program
  admission to ABG;
- `REQ-P-CATALOG-009` assigned catalog admission, readiness, and selection
  truth to ABG; and
- `REQ-P-CATALOG-030` assigned runtime Product-catalog admission to ABG.

The corrected Product and contraction design instead defined eventless
deterministic readiness validation and construction through the concrete
Product/catalog owner. This is more than a wording mismatch. Commentary cannot
select the owner or reconcile the semantic relation. The authoritative Intent,
Product, and requirement surfaces must be made consistent before the final
candidate can claim complete authority consistency.

This distinction was found by tracing one selected relation across authority,
production code, negative proof, and installed behavior. A diff-only or
test-count review would have accepted the regression.

A contaminated M5 reproduction was discarded rather than counted against the
implementation. Other contemporaneous findings are omitted here because this
post does not retain their exact observation evidence.

## 15. Review Output Contract

Return a concise self-contained report:

```text
reviewer identity and non-authorship:
Product frame:
governing-basis identities:
reviewed claim:
subject identity and stability:
scope:
exclusions:
verdict:

findings, ordered by severity:
  invariant
  code path
  counterexample
  proof gap
  bounded disposition

mechanical evidence:
durable evidence references:
contamination or unverified scope:
unresolved findings:
safe work that may continue:
conditions required before freeze or advancement:
```

Qualification, RC, and release reviews add the exact release subject, claim
set, excluded state, qualification or RC/final carrier identities, and
governed final-delta identity required by the applicable release method. This
generic shape does not replace those boundary-specific fields.

Lead with the decision. Separate confirmed evidence from inference. State when
reported results were not independently reproduced.

## Recommended Action

Use this post as the local external-assurance checklist for the current T-287
implementation and subsequent ABIogenesis 5.0 feature candidates. A bootstrap
may cite it as a non-governing checklist. Operational role assignment, work
selection, and stage authority must remain on their live authoritative
surfaces.

If repeated use establishes a reusable shared law, submit the method through
shared-method intake in `specification_methodology`. Until ratified there, this
post remains ABIogenesis commentary and carries no independent authority.

For a future review instantiation, success means a cold external auditor can
reconstruct the Product frame and exact subject from durable evidence,
reproduce every decisive counterexample, and reach the same bounded disposition
without consuming the worker's or supervising reviewer's conclusions. The
non-reproducible Section 14 account illustrates the method but does not meet
that success condition.
