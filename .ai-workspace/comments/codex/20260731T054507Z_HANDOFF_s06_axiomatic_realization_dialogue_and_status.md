# HANDOFF: S06 Axiomatic Realization Dialogue And Status

**Author**: Codex

**Date**: 2026-07-31T05:45:07Z

**Addresses**: T-281/T-270 ABIogenesis 5.0 S06 realization planning, authority constraints, Gate 1 findings, current status, and forward plan at `08cd748515d3776bc6637412ceb2f99b27fc8a98`

**Status**: Open

## Correction Recorded After This Dialogue

Direct F_H corrected the governing method selection on 2026-07-31:
STDO `v2.2.2` is the current ABIogenesis 5.0 basis. The quoted historical
assistant statement below that treated live `v2.2.0` text as controlling is
preserved because this post records the dialogue as it occurred, but that
statement is superseded. The Gate 1 review's 2.2.2 basis and its code findings
are not quarantined on version grounds.

## Summary

This post preserves the complete substantive user-assistant dialogue that
established the current S06 realization control model.

The dialogue moved through four material corrections:

1. repeated implementation and review cycles had created unacceptable churn;
2. independent review was reduced to three load-bearing frozen gates;
3. Product, ticket, and accepted-design axioms replaced review as the restoring
   force; and
4. runtime truth was stated precisely as ABG-admitted event history interpreted
   by Event Calculus, with replay as deterministic reconstruction and
   projection.

Gate 1 then exposed a constitutional contradiction rather than an
implementation inconvenience:

- the current realization uses process-local Product setup and invocation
  authority;
- deleting that state leaves no defined way to resolve the complete verified
  Product and resolved-lock bodies from their public `{ref,digest}` coordinates;
- accepted native-contract design retains private verification evidence in one
  opaque root-operation context; and
- accepted S05 design makes `CatalogApplication` originating-store-local,
  no-event, and revoked at context close.

Those accepted lifecycle clauses cannot simultaneously satisfy the newly
required fresh-process verification/resolution and event-derived application
rehydration relations. No implementation should proceed until direct F_H
dispositions that contradiction.

This is commentary, not specification, requirement, accepted design, ticket
authority, or implementation authority.

## Record Boundary

This record includes all substantive user-facing dialogue from the S06
realization instruction through the request to preserve the dialogue. It
excludes system/developer instructions, tool invocations, raw tool output, and
transient progress messages.

The repository basis when this post was requested was:

| Field | Value |
|---|---|
| repository | `abiogenesis-5-root-build` |
| branch | `codex/t286-abi5-root` |
| HEAD | `08cd748515d3776bc6637412ceb2f99b27fc8a98` |
| tracked tree | clean |
| original untracked commentary | eight posts, preserved |
| additional prior commentary | `20260731T051841Z_REVIEW_abiogenesis_5_0_function_to_axiom_gate_1.md` |
| untracked count before this post | nine |
| untracked count after this post | ten |
| production/specification/design/schema/test edits | none |

## Substantive Dialogue

### 1. Realization instruction

#### User

````text
Continue ABIogenesis 5.0 S06 realization.

Repo: /Users/jim/src/apps/abiogenesis-5-root-build
Branch: codex/t286-abi5-root
Required HEAD: 08cd748515d3776bc6637412ceb2f99b27fc8a98

The tracked tree must initially be clean. Preserve the eight existing untracked
commentary posts.

This is a hard-break realization. There is no backward-compatibility objective.

Required architecture:

  admit
    -> select exact definition
    -> call concrete owner port
    -> project outcome

Before editing, evaluate implementation complexity and produce a concise map of:
- all 18 operations and 56 definition keys;
- each concrete Product, ABG, Validator, or release owner;
- legacy carriers, parsers, schemas, and tests that must be deleted;
- generated projections;
- the smallest vertical implementation sequence.

Then implement directly. Do not build adapters.

Forbidden in the replacement production path:
- RootPublicInvocation
- ROOT_PUBLIC_OPERATION_DEFINITIONS
- legacyRequest
- indexedRequest ?? legacyRequest
- Public semantic operation switches
- Public-owned catalog aggregation
- process-local run/read authority

There must be:
- one Public operation family;
- one ABG-owned admitted catalog;
- owner-local semantic contracts and ports;
- run/read truth derived from ABG events and replay;
- the accepted PFC-F08 attempt/refusal relation;
- SDK, CLI, and Codex as projections of the same exact contract.

Delete the legacy carrier, parser, schema, and legacy-semantic tests. Preserve
lawful scenario meaning by rewriting tests against the exact family.

The rejected realization is available only as donor evidence at:
  donor/s06-rejected-dual-public-realization-20260731
  commit 935b11dd63721b8ba135045580fa5d6c38b85f03

Do not check out or cherry-pick that donor wholesale. Re-adopt only isolated
owner-local contract/schema/native-analysis code after proving it has no
dependency on the legacy Public family.

The accepted design remains authoritative. Do not reopen design, S04, post-S06
Prime compression, M6, or M7.

Stop immediately if implementation requires a compatibility facade, second
authority path, semantic behavior in Public, or another catalog.
````

### 2. Churn concern and request for proportional review

#### User

````text
we have had repeated false starts, we have had to through away hours and sometimes days worth of work
````

#### User

````text
i need you come up with a plan that will have proportional opportunities for independent review
````

### 3. Three-gate review correction

#### User

````text
The proposed plan is directionally right but too review-dense. Three exhaustive pre-edit maps plus three intermediate semantic
reviews risks recreating the churn.

Use three independent review gates, with mechanical checks between them.

 Gate                        Subject                                            Independent review
━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. Construction map         Exact 56-key → concrete owner-export map,          One constructability reviewer and one authority
                             legacy deletion set, and installed vertical         reviewer
                             path
──────────────────────────  ─────────────────────────────────────────────────  ─────────────────────────────────────────────────
 2. Architecture sentinel    One complete installed path: verify → resolve →    One cold reviewer checks only singular
                             install → bind → catalog admit/view → invoke →     authority and forbidden bridges
                             replay-derived read
──────────────────────────  ─────────────────────────────────────────────────  ─────────────────────────────────────────────────
 3. Frozen candidate         Complete 18/56 realization, projections,           Two heterogeneous reviewers: architecture/
                             deletion, tests and package                        authority and installed Product behavior

Implementation between gates:

1. Start clean at 08cd7485; donor 935b11dd is evidence only.
2. Produce the construction map before editing. Missing concrete owner meaning is a stop, not permission to invent it.
3. Implement the sentinel path directly:

admit → select definition → concrete owner port → project outcome

4. At Gate 2, reject the cut if any of these exist:
    - legacy carrier or parser;
    - new-to-old translation;
    - Public semantic switch;
    - second catalog admission;
    - process-local run truth;
    - owner port represented only by a string or interface.

5. Once the sentinel passes, implement the remaining definitions and variants without further semantic review interruptions.
6. Generate schemas, SDK, CLI and catalog rows from the single family. Verify generators and exact-set equality; do not line-
   review every generated file.

7. Delete the legacy family, parser, schema and compatibility tests.
8. Run focused tests, full M5/M4 and reproducible packaging.
9. Freeze one exact candidate and stop editing for Gate 3.
10. Aggregate final findings once. If repair is required, review only the repaired relations—not the complete corpus again.

Review rules:

- Reviewers inspect frozen checkpoints, never a moving tree.
- Findings must cite a violated accepted invariant.
- Future generality and cleanup are deferred.
- Reviewers do not author replacement features.
- Mechanical checks are continuous; independent semantic review is reserved for the three load-bearing boundaries.

That gives early interception, a mid-course architecture check, and final independent assurance without turning every
implementation step into another review cycle.
````

### 4. Review is not the restoring force

#### User

````text
drift happens less at straight path disambiguation and more at directional decisions which lead us away from the axioms, axioms should constrain the opportunity for drift
````

#### User

````text
id rather force axiomatic constraints - including product and ticket, if they had been followed, drift would have been reset
````

#### Assistant

````text
You’re right. My previous framing made review the restoring force. The restoring force should be the constitutional axioms;
review only supplies counterexamples.

Define the fixed basis:

A = Product axioms
  ∪ ticket execution boundary
  ∪ accepted design relations

For every proposed change Δ:

admissible(Δ) =
  satisfies(A, current_state + Δ)
  ∧ advances(selected_Product_outcome)

The consequences must be hard:

admissible = true   → continue
admissible = false  → stop immediately
                      preserve the delta as evidence
                      reset to the last satisfying cut

No forward repair campaign. No green test can cure an axiom violation.

For S06, the forced axioms include:

- one Public algebra;
- hard replacement, not compatibility;
- Public = admit → select → owner port → project;
- one concrete semantic owner per definition;
- one ABG-owned admitted catalog;
- ABG event/replay truth for run and read;
- projections cannot author meaning;
- PFC-F08 has the exact designed attempt/refusal relation;
- S06 cannot select Prime compression, S04, M6 or M7;
- donor code carries no authority.

The ticket must state both the axioms and their executable falsifiers:

 Axiom                    Immediate falsifier
━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 One Public algebra       Legacy carrier/parser remains reachable
───────────────────────  ───────────────────────────────────────────────────────────
 Hard replacement         New request translates into an old request
───────────────────────  ───────────────────────────────────────────────────────────
 Concrete ownership       Public switches on operation identity to supply semantics
───────────────────────  ───────────────────────────────────────────────────────────
 ABG catalog authority    Product/Public constructs an admitted catalog identity
───────────────────────  ───────────────────────────────────────────────────────────
 Replay truth             Run truth depends on a process-local registry
───────────────────────  ───────────────────────────────────────────────────────────
 Derived projections      SDK, CLI or schemas contain an independent roster
───────────────────────  ───────────────────────────────────────────────────────────
 Ticket boundary          Later-milestone behavior enters the diff

The first appearance of RootPublicInvocation translation would therefore have invalidated the realization immediately and reset
it to 08cd7485.

Independent review then becomes narrow:

> Find a concrete counterexample to the Product, ticket, or design axioms.

If none exists, implementation continues. If one exists, the cut loses authority and resets. Review does not prescribe extra
work, broaden the design, or create a repair programme.

The cold-session instruction should explicitly say:

> Product, T-270/T-281, and accepted S06 design are axiomatic constraints. You may not reinterpret or trade them against
> compatibility, test preservation, implementation effort, or donor behavior. At the first counterexample, stop, report it, and
> return to the last axiom-satisfying cut.
````

### 5. Event Calculus correction

#### User

````text
replay truth is the event calculus
````

#### Assistant

````text
Correct. “Replay truth” was imprecise.

The authority relation is:

ABG-admitted event history
  + Event Calculus
  → runtime truth

runtime truth
  → replay-derived reconstruction and projection

Replay does not own truth. It reproduces or projects the Event Calculus result.

The axiom should be:

> ABG exclusively owns admitted runtime events and the Event Calculus that derives runtime truth. Replay reconstructs that truth
> deterministically. Public, Product, adapters, and process-local indexes may neither author nor override it.

A process-local index is lawful only as a disposable cache proven equivalent to the Event Calculus. It cannot be required to
recover, interpret, or continue a run.
````

### 6. Gate 1 findings

#### User

````text
## Findings

1. Critical — RootOperationState is a second runtime authority, not a cache.

abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/public/operations.ts:64 keeps a process-local
WeakMap<RootOperationContext, RootOperationState>. The public operation chain then uses that object to decide whether prior
verification, resolution, installation, workspace, catalog, view, and application facts exist.

For example:

- product.resolve reads verified products from memory at abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/
  public/operations.ts:535.

- product.install reads verification and lock state at abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/
  public/operations.ts:591.

- workspace.bind resolves installs through the same registry.
- catalog.admit, catalog.view, catalog.apply, and run.invoke continue the same chain.

The actual abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/product/root_operation_state.ts:61 contains
eight mutable maps and a mutable duplicate-invocation set.

Consequences:

- The same durable event log behaves differently after a process restart.
- An invocation reference is meaningful only while its originating JavaScript object remains alive.
- ABG-admitted installation/catalog facts are insufficient to drive later operations.
- The public layer determines prerequisite truth independently of replay.

This class and every lookup through it must be removed. The replacement cannot be another registry hidden behind a different
type.

2. Critical — verification and resolution currently have no durable truth to reconstruct.

Deleting RootOperationState exposes a deeper missing carrier.

applyVerify computes a VerifiedProductArtifact, stores it only in memory, and returns a narrowed outcome at abiogenesis-5-root-
build/build_tenants/abiogenesis/typescript/code/src/public/operations.ts:481. It emits no ABG event and does not return the
complete verified carrier needed by later operations.

applyResolve likewise constructs the complete ResolvedProductLock, stores it only in memory, and returns an informational
projection at abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/public/operations.ts:535.

Therefore neither operation can presently be reconstructed from:

- the durable event log;
- the public response;
- an immutable input carrier; or
- an exact admitted reference.

The corrected map must choose a real authority boundary:

- Admit complete verification and resolution facts as ABG events and rehydrate them by exact reference; or
- return complete self-verifying immutable carriers and require downstream operations to supply them explicitly.

Simply deleting the maps would make product.install and every downstream operation impossible.

3. High — pendingReopenAuthority is another ambient process-local controller.

abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/public/operations.ts:59 contains mutable
pendingReopenAuthority. closeAndRememberDurableContext writes it, and reopenRememberedDurableContext silently consumes it at
abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/public/operations.ts:144.

Every non-continuation operation implicitly reopens whichever event log happens to be remembered by the context at abiogenesis-
5-root-build/build_tenants/abiogenesis/typescript/code/src/public/operations.ts:3980.

This violates explicit authority in two ways:

- The request does not identify the durable prefix it consumes.
- Operation semantics depend on the mutable history of the context object.

A fresh context cannot reproduce the product setup chain, while a retained context silently selects a prior log. Gate 1 must
delete this ambient path along with RootOperationState. Durable ingress needs an explicit authority carrier or workspace/event-
log binding.

4. High — duplicate-invocation truth is split between volatile and durable mechanisms.

For non-continuation operations, duplicate detection is performed through the in-memory set before operation dispatch at
abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/public/operations.ts:3967.

For continuation operations, that check is skipped and ABG event admission enforces durable identity.

This produces two incompatible meanings of invocation identity:

- Setup/public operations: “already seen by this process.”
- Continuation operations: “already admitted in durable ABG truth.”

It also claims the invocation reference before the operation has been admitted. A malformed or failed request can consume its
identity in the current process without any corresponding durable event, while a restart forgets the claim.

Invocation uniqueness must be derived uniformly from admitted event truth. Read-only operations may lawfully be repeatable, but
that must be an explicit operation property—not an exception implemented by bypassing a Set.

5. Medium — the retained projection carriers are correctly shaped conceptually, but their constructors overclaim “authority.”

constructPublicContinuationAuthority and constructPublicRunProjectionAuthority are exported functions that accept caller-
supplied fields and add an unkeyed canonical hash:

- abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/public/continuation_authority.ts:97
- abiogenesis-5-root-build/build_tenants/abiogenesis/typescript/code/src/public/run_projection_authority.ts:100

Anyone can construct a self-consistent carrier. The digest proves internal coherence, not admission or provenance.

The later reopen paths correctly recover much of their legitimacy by checking the carrier against ABG events. That means the
durable event prefix is the authority; these objects are reopen/projection coordinates.

The exact-contract rewrite should make that distinction structural:

- Construction from arbitrary public input must not itself produce an authoritative type.
- Parsing should yield an unverified candidate.
- Only ABG-backed rehydration should yield an admitted projection/continuation basis.
- Public code should not be able to bypass rehydration by directly calling the constructor and treating its result as
  authoritative.

## Fundamental conclusion

The Gate 1 rejection was correct, but the corrected map is still incomplete if it says only “delete RootOperationState; retain
the projection carriers.”

The real boundary is:

Delete:
  RootOperationState
  rootOperationStates
  pendingReopenAuthority
  reopenRememberedDurableContext
  process-local duplicate invocation truth
  all lookup-by-prior-invocation maps

Add or expose:
  durable verification admission/rehydration
  durable resolution admission/rehydration
  event-derived install/workspace/catalog/view/application rehydration
  explicit durable-prefix ingress
  uniform event-derived invocation identity

Retain with exact-contract rewrite:
  PublicContinuationAuthority
  PublicRunProjectionAuthority

The retained carriers are downstream projections over durable ABG truth. The current setup pipeline is not: it remains a
stateful in-process workflow controller.

No files were edited.
````

### 7. Request for full status

#### User

````text
give me a full status whats the past historical plan(s) where are we at and whats the proposed forward plan
````

#### Assistant

````text
## Bottom line

S06 implementation has not started from the required baseline. The repository is at the correct branch and HEAD, the tracked tree is clean, and Gate 1 is rejected.

The rejection is constitutional, not a code inconvenience: the process-independent authority requirement conflicts with accepted carrier-lifecycle design for verification/resolution and `catalog.apply`. Coding now would require inventing a durable repository, changing the exact packet grammar, moving Product meaning into ABG, or retaining process-local authority. Each is currently unauthorized.

Gate 2 has not started. No tests or packaging were run because green mechanics cannot cure this Gate 1 contradiction.

## Repository state

- Repository: `/Users/jim/src/apps/abiogenesis-5-root-build`
- Branch: `codex/t286-abi5-root`
- HEAD: `08cd748515d3776bc6637412ceb2f99b27fc8a98`
- Tracked tree: clean
- The original eight untracked commentary posts remain.
- There are now nine untracked posts: the additional file is the Gate 1 review at `.ai-workspace/comments/codex/20260731T051841Z_REVIEW_abiogenesis_5_0_function_to_axiom_gate_1.md`. No production, specification, design, schema, or test file was changed.

That Gate 1 post is commentary only. Its attempt to make STDO 2.2.2 governing and its broader F04–F14 investigation do not select work: live GOALS and AGENTS.md select immutable STDO 2.2.0. Those extra findings are quarantined from the forward plan.

## Historical plans and attempts

### 1. The original code-first delivery pattern

During July 24–27, implementation, review, repair, and refreeze repeatedly ran ahead of a complete symbolic Product function. Early S06 used:

- design `6aaedf8d`;
- acceptance record `e7c9e43e`;
- implementation `bcd8769a`.

That implementation provided useful stock but its S06 closure was withdrawn. The historical postmortem records 24 candidate/checkpoint freezes in roughly 79 hours and identifies implementation plus correlated review outrunning design as the principal churn mechanism.

The reset successfully produced:

- accepted S03: `8865ccff`;
- accepted S05 design: `283325aa`;
- accepted S05 realization: `1ddc802d`.

Those remain regression bases, not current work.

### 2. S06 inside-out repair wave

The July 28 sequence attempted recurrence contraction, installed portability, Product authority, dependency resolution, catalog readiness, and native closure:

`8c4c7866 → fd6a3f16 → ac61e080 → d9794275 → 28122033 → c0d2a3e6 → 33ab384b → 4f9bf707`

These were returned because root selection, digest closure, external symbol authority, dependency meaning, or installed-path ownership remained underdetermined.

### 3. Native-contract design-first wave

- `b645595c`: returned for proposal/admission, named-symbol ownership, and cross-Product augmentation defects.
- `4f80f84a`: repaired and accepted native-contract design.
- `51664393`, `4c3bb239`, `4953508d`: realization attempts, all returned.
- `4953508d` had substantial test/package evidence, but retained multiple Public contract authorities rather than one singular exact family.

### 4. Exact 18/56 public-family design wave

The supplemental design then moved through:

- `9fb14e68`: incomplete owner contracts and carriers.
- `8eb7564c`: incomplete constructable invocation, owner-port, and occurrence relations.
- `2bb7b594`: accepted contracted parent.
- `5770755a`: repaired the digest cycle but replaced the extant catalog.
- `458ce3c2`: preserved the catalog but had an unsatisfiable join.
- `356aa6a2`: corrected the nested join, but its 44 rows were only a diagnostic subset.
- `844df3fc`: improperly moved later T-270 publication closure into S06.
- `8dc59264`: restored bounded S06 but underconstrained common-envelope and catalog-binding refusals.
- `aa0daa62`: closed those refusals and the accepted PFC-F08 relation.

### 5. Rejected dual-Public realization

Donor `935b11dd` changed 136 files with approximately `+59,383/-5,707`. It created much of the exact-family/schema surface, but routed it through the legacy family:

- exact invocation projected into `RootPublicInvocation`;
- legacy Public semantic switch retained;
- `indexedRequest ?? legacyRequestPayload`;
- most owner behavior still reached through translation or generic dispatch;
- process-local state remained.

It is correctly preserved as donor evidence only. It cannot be merged or used as an implementation base.

### 6. Review-control plan evolution

The first proposed control plan had three exhaustive maps and three intermediate semantic reviews. You rejected it as too review-dense.

It was replaced by three frozen review gates:

| Gate | Subject | Independent review |
|---|---|---|
| 1 | 56-key construction map, concrete owners, deletion set, installed vertical path | constructability + authority |
| 2 | One complete sentinel path | one cold singular-authority reviewer |
| 3 | Complete frozen 18/56 candidate | architecture/authority + installed Product behavior |

You then corrected the governing mechanism: Product, ticket, and accepted design axioms—not review—must restore direction. Review only supplies counterexamples.

The runtime axiom was further corrected to:

```text
ABG-admitted event history + Event Calculus
  -> runtime truth
  -> replay reconstruction and downstream projection
```

Replay does not own truth.

## Fixed target

The accepted family is exactly:

| Operation | Keys | Concrete owner port |
|---|---|---|
| `workspace.create` | `clean`, `imported` | Product `WorkspaceOperationPort.create` |
| `workspace.open` | `open` | Product `WorkspaceOperationPort.open` |
| `project.read` | 24 closed cases | Product/ABG case-indexed projection ports |
| `product.verify` | `verify` | Product `ProductVerificationPort.verify` |
| `product.resolve` | `resolve` | Product `ProductEnvironmentPort.resolve` |
| `product.install` | `install` | Product `ProductInstallPort.install` |
| `workspace.bind` | `bind` | Product `ProductEnvironmentPort.bindWorkspace` |
| `catalog.admit` | `admit` | Product `CatalogOperationPort.admit` |
| `catalog.view` | `allowlist` | Product `CatalogOperationPort.constructView` |
| `catalog.apply` | `node_type`, `overlay` | Product/ABG `CatalogOperationPort.apply` |
| `run.invoke` | `invoke`, `start` | Product/GTL/HoG/ABG `RunInvocationPort` |
| `run.continue` | `current_intent`, `selected_action` | Product/ABG/HoG `RunContinuationPort` |
| `interaction.respond` | `select`, `approve`, `reject`, `assess`, `answer_escalation` | Product/ABG `InteractionResponsePort.respond` |
| `result.assess` | `assess` | Product/ABG `ResultAssessmentPort.assess` |
| `witness.admit` | `reprice`, `attest`, `hygiene-stamp`, `intake`, `run-resumed`, `run-stopped` | ABG `WitnessAdmissionPort.admit` |
| `conformance.evaluate` | `gtl_program` | Validator `ConformancePort.evaluateGtlProgram` |
| `product.materialize` | `context_bootstrap`, `configuration` | Product `ProductMaterializationPort` |
| `release.snapshot` | `published_rc`, `tapped_release` | Product/release `ReleaseSnapshotPort` |

The 24 read cases are `catalog_list`, `catalog_describe`, `workspace_status`, `run_status`, `graph_call_status`, `run_result`, `graph_call_result`, six evidence cases, six replay cases, `workspace_gaps`, `run_gaps`, `run_lawful_actions`, and `ticket_consensus`.

## Current implementation reality

HEAD is still the legacy implementation, not a partial 18/56 realization:

- 11 operation identities and 19 member variants;
- `ROOT_PUBLIC_OPERATION_DEFINITIONS`;
- `RootPublicInvocation`;
- `parseRootPublicInvocation`;
- a Public semantic operation switch;
- generic `JsonValue` result treatment and an unconstrained result schema;
- legacy manifest/test-support projections.

It also contains:

- seven prerequisite maps plus one duplicate-invocation set in `RootOperationState`;
- a context-keyed `WeakMap`;
- `pendingReopenAuthority`;
- implicit remembered-log reopening;
- process-local duplicate detection.

The donor-only `legacyRequest`/`indexedRequest` fallback is not present at HEAD. HEAD instead remains wholly on the old family.

## Where Gate 1 failed

Gate 1 failed twice.

First, the initial deletion map wrongly included `PublicContinuationAuthority` and `PublicRunProjectionAuthority`. Accepted M05 retains them as downstream carriers over ABG truth. They must be rewritten so public parsing produces an unverified candidate and only ABG-backed rehydration produces an admitted basis, but they are not legacy state to delete.

Second, removing `RootOperationState` exposed the missing durable carrier relation:

- verification’s complete native evidence currently lives in a `WeakMap`;
- resolved-lock legitimacy includes process-local branding;
- later operations receive invocation references or `{ref,digest}` coordinates rather than complete bodies;
- the event log records setup coordinates but does not currently resolve the complete Product-owned bodies;
- therefore a fresh process cannot perform resolve/install/bind from the same durable basis.

More importantly, accepted design currently says:

- verification evidence is retained in one opaque root-operation context and callers cannot rebuild it; and
- `CatalogApplication` is admitted only in its originating store, emits no runtime event, and expires on context close.

Those clauses conflict with the newly stated requirement for durable verification/resolution and event-derived application rehydration.

This is why there is presently no admissible implementation delta:

- retaining memory violates the axiom;
- adding a hidden registry merely renames it;
- storing Product semantic bodies in ABG moves ownership;
- adding a Product repository creates an unratified authority surface;
- returning full carriers changes or clarifies the exact packet contract;
- making `catalog.apply` event-derived contradicts the accepted no-event S05 relation.

## Authority-surface inconsistency

There is also repo metadata drift:

- GOALS, the ordered-delivery table, T-270, and T-281 say one S06 realization pass is active.
- GOALS also says realization is held.
- GOALS later says S06 is not currently a realization boundary.
- AGENTS.md still describes an exact-cut review-only gate.

Your direct instruction selects realization, so this wording drift is not the principal blocker. It should nevertheless be reconciled before freezing another candidate.

## Proposed forward plan

### 0. Resolve the one constitutional contradiction

No implementation should begin until direct F_H dispositions these two relations:

1. Whether verification and resolution must survive process restart.

   If yes, the smallest singular design is complete immutable, self-verifying Product-owned carriers returned by their owner ports and explicitly supplied downstream. That avoids an ABG Product-semantic store, another catalog, and ambient lookup authority. It does require an explicit clarification of the current ref/digest-only and root-context clauses.

2. Whether `CatalogApplication` remains same-store, one-shot, and no-event, or becomes durable across restart.

   The restart requirement cannot coexist with the accepted S05 lifecycle as written. If durability governs, the narrowest relation is a Product-owned immutable application carrier plus ABG’s existing generic artifact-boundary admission and Event Calculus availability fluent—not a new event family or catalog. That requires explicit supersession of the current no-event clause.

If accepted design may not be clarified or superseded at all, S06 is blocked. There is no honest implementation workaround.

### 1. Re-freeze Gate 1

After that disposition, freeze one corrected construction map containing:

- all exact 18/56 owner exports and concrete callable ports;
- complete carrier-body and explicit durable-prefix ingress relations;
- exact deletion and retention sets;
- PFC-F08 attempt/refusal construction;
- event-derived invocation uniqueness;
- fresh-process equivalence;
- proof that any adopted donor module has no legacy-Public dependency.

Review it once: one constructability reviewer and one authority reviewer.

### 2. Implement the sentinel

Implement only:

```text
admit
  -> select exact definition
  -> concrete owner port
  -> project exact outcome

verify
  -> resolve
  -> install
  -> bind
  -> catalog admit
  -> catalog view
  -> catalog apply
  -> run.invoke
  -> ABG admitted events + Event Calculus
  -> replay
  -> project.read
```

Include deliberate fresh-process boundaries wherever the ratified lifecycle says truth must survive.

### 3. Gate 2

Freeze the sentinel and have one cold reviewer search only for:

- a legacy carrier/parser;
- new-to-old translation;
- Public semantic switching;
- second catalog admission;
- process-local authority;
- owner ports represented only by strings/interfaces;
- runtime truth not derived by Event Calculus.

### 4. Complete the family mechanically

Once Gate 2 passes:

- implement the remaining 55 definitions/variants without more semantic interruptions;
- generate native parsers, schemas, SDK, CLI, Codex transport, manifest rows, and catalog projections from the same family;
- enforce exact-set equality and generator idempotence;
- delete the legacy carrier, parser, schema, semantic switch, process state, manifest roster, support paths, and compatibility tests;
- rewrite lawful scenarios directly against the exact family.

### 5. Verify and freeze Gate 3

Run:

- focused owner/family tests;
- exact 18/56 and closed 24-read checks;
- PFC-F08 attempt/refusal mutations;
- fresh-process and Event Calculus/replay tests;
- SDK/CLI/Codex contract-equality tests;
- S03, S05, M4, and independent Product regression suites;
- reproducible package and installed-path proof.

Then freeze one exact candidate and stop editing. Gate 3 gets two reviews: architecture/authority and installed Product behavior.

Prime compression, full T-270 publication completion, unified M5, M6, M7, and S04 remain outside this plan.

The honest present status is therefore: the three-gate/axiomatic process is working—it stopped Gate 1 before another large false realization—but direct authority must now resolve one carrier-lifecycle contradiction before implementation can lawfully resume.
````

### 8. Request to preserve this dialogue

#### User

````text
this is substantive i want you to capture the full dialogue as a post
````

## Consolidated Axiomatic Basis

The dialogue establishes the following proposed fixed basis for any later S06
delta:

```text
A =
  live Product axioms
  ∪ T-270/T-281 execution boundary
  ∪ accepted S06 design relations
  ∪ direct F_H dispositions

admissible(Δ) =
  satisfies(A, current state + Δ)
  ∧ advances ABG5-S06
```

The first counterexample terminates the cut. Tests, donor behavior,
compatibility pressure, implementation effort, and local precedent cannot cure
an axiom violation.

The intended public path remains:

```text
unknown input
  -> common admission
  -> exact definition selection
  -> concrete semantic-owner port
  -> exact owner outcome
  -> Public projection
```

The intended runtime authority remains:

```text
ABG-admitted events
  + declared Event Calculus
  -> runtime fluent truth
  -> deterministic replay reconstruction
  -> downstream Public, SDK, CLI, Codex, and installed-Product projections
```

## Current Gate Verdict

Gate 1 is rejected and Gate 2 has not started.

The rejection preserves the last accepted tracked cut at `08cd7485`. The donor
at `935b11dd` remains evidence only. The exact implementation deletion map is
not frozen because deleting process-local setup state without a ratified
carrier-body relation makes the installed path non-constructable.

The following deletion direction is established but not yet an executable
construction map:

- `RootOperationState`;
- `rootOperationStates`;
- `pendingReopenAuthority`;
- remembered implicit reopen;
- process-local duplicate-invocation truth;
- lookup-by-prior-invocation maps;
- legacy `RootPublicInvocation`;
- `ROOT_PUBLIC_OPERATION_DEFINITIONS`;
- the legacy parser and schema;
- the Public semantic operation switch;
- independent SDK, CLI, manifest, or test rosters; and
- legacy-semantic compatibility tests.

The following retention direction is established:

- `PublicContinuationAuthority`, rewritten as an unverified public coordinate
  that becomes usable only after ABG-backed rehydration; and
- `PublicRunProjectionAuthority`, under the same candidate-versus-admitted
  distinction.

No equivalent retention ruling has yet been established for every other public
authority carrier.

## Exact Blocking Disposition

Direct F_H must state which relation governs each row:

| Boundary | Current accepted relation | Newly required relation | Consequence |
|---|---|---|---|
| Product verification evidence | private immutable evidence in one root-operation context; resolve consumes invocation refs | fresh process can recover the exact complete verified basis | current text does not define a lawful resolver |
| resolved Product lock | Product-owned immutable result projected by ref/digest | downstream install can recover the complete lock without prior object identity | body transport or Product-owned durable resolution must be explicit |
| durable ingress | context silently remembers and reopens one event log | every operation names the exact durable prefix it consumes | request/authority carrier relation is missing |
| invocation uniqueness | setup uses a process set; continuation uses ABG truth | one event-derived identity law, with explicit pure-read repeatability | process set must be deleted |
| CatalogApplication | one-shot, originating-store-local, no event, revoked on close | application is recoverable for a fresh process from durable admitted truth | accepted S05 lifecycle and new requirement cannot both hold |

The two coherent high-level choices are:

1. retain the accepted same-context Product/application lifecycle and narrow
   the fresh-process axiom so it applies only to admitted runtime continuation
   and read truth; or
2. retain the fresh-process axiom and directly supersede the affected
   root-context and `CatalogApplication` lifecycle clauses with exact durable
   carrier/admission relations.

There is no implementation-only third choice.

## Recommended Action

1. Direct F_H dispositions the five-row blocking table without reopening any
   unrelated S06, S04, Prime, M6, or M7 decision.
2. Reconcile the contradictory active/held wording in GOALS, T-270, T-281, and
   AGENTS.md in the same explicitly authorized authority cut.
3. Freeze the corrected Gate 1 map and submit it to exactly one constructability
   reviewer and one authority reviewer.
4. If Gate 1 passes, implement the single sentinel path and proceed through the
   already agreed three-gate plan.
5. If Gate 1 still contains a counterexample, stop at `08cd7485`; do not begin a
   forward repair campaign.
