# B-014 Persist And Promote Typed F_P Fulfillment Assessments Into Admitted Ledger Truth

- id: B-014
- title: Persist typed F_P fulfillment assessments and promote them into admitted published truth without collapsing domain semantics into ABG
- type: bug
- status: completed
- goal: fulfillment-assessment-carrier
- change_intent: Add a lawful substrate mechanism for typed F_P fulfillment assessments so domains can publish admitted per-obligation fulfillment truth through one persisted carrier, while ABG remains mechanism-only and does not take ownership of domain fulfillment semantics.
- change_class: realization_refactor
- re_entry_point: realized_surface
- priority: high
- intake_source: odd_sdlc B-019 target migration audit 2026-04-18; operator direction 2026-04-18
- affected_boundary: F_P result artifact contract, result ingestion, admitted assessment publication, runtime/reporting consumption of structured fulfillment assessments
- open_divergences: []
- governing_protocol: T-007
- triaged_at: 2026-04-18
- created_at: 2026-04-18
- updated_at: 2026-04-18
- reopened_at: 2026-04-18
- completed_round_1_at: 2026-04-18
- reopened_round_2_at: 2026-04-18
- round_2_intake_source: combined Codex and Claude architecture/code reviews 2026-04-18
- completed_round_2_at: 2026-04-18
- reopened_round_3_at: 2026-04-18
- round_3_intake_source: self-review against SPEC_METHOD 1.1 core-interface migration criteria 2026-04-18
- round_3_execution_at: 2026-04-18
- completed_round_4_at: 2026-04-18
- completed_round_5_at: 2026-04-18

## Round 5 Producer-Boundary Completion

Round 5 closes the last remaining divergence that was previously routed to
`B-013`.

`B-013` is now delivered:

- GTL/GraphVector publish a first-class `obligation_ledger` declaration surface
- ABIogenesis runtime reads that declaration and fails closed when `F_P` edges
  omit it
- manifest publication, prompt assembly, and ledger publication carry the
  declared policy rather than synthesizing obligation topology inside runtime

That means the old round-4 statement:

- “native obligation topology neutrality remains open and is deferred to
  `B-013`”

is no longer active.

For the fulfillment carrier family, ABIogenesis now satisfies the lawful
producer/consumer split:

- GTL/domain author the obligation-ledger declaration
- ABIogenesis validates, carries, publishes, and consumes that declaration
- ABIogenesis does not invent fulfillment obligation topology inside runtime

Code anchors:

- [obligation_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/gtl/obligation_ledger.py:1)
- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:137)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:1902)
- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:45)

Proof added in this round:

- `test_abg3_runtime_envelope.py`: `35 passed`
- `test_cli_adapter_auto.py`: `20 passed`
- `test_provenance_integration.py`: `28 passed`
- `test_m03_engine_kernel_integration.py`: `109 passed`
- `test_sandbox_usecases_fake.py`: `14 passed`
- `test_m01_gtl_core_integration.py`: `20 passed`
- `test_m02_work_publication_integration.py`: `10 passed`
- `test_usecases_u1_u4.py`: `4 passed`

## Round 4 Closeout Authority

Round 4 closes `B-014` for the scoped local carrier realization implemented in
the tree.

This section is now the operative acceptance authority for this ticket.

### Delivered And Accepted Here

`B-014` is complete for the following substrate scope:

1. manifests declare `fulfillment_obligations`
2. workers write typed `fulfillment_assessments`
3. ingestion validates identity and publishes one current file-backed
   fulfillment ledger
4. `assessed{kind: fp}` carries discovery/provenance only for that ledger
5. runtime admission, runtime fulfillment certification, live reporting, and
   topology replay consume the same current ledger closure law in the local
   workspace realization
6. approval and revocation republish the same current ledger and emit the same
   close/reopen lifecycle for that carrier

Code anchors:

- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:45)
- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:77)
- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:306)
- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:765)
- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:923)
- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:948)
- [live_status.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/live_status.py:202)
- [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:516)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:95)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:2077)

### Explicit Non-Claims

This ticket does **not** claim that ABG now provides:

- a backend-neutral truth-reference ABI
- distributed or saga-backed ledger publication
- domain fulfillment semantics inside ABG

Those remain follow-on work.

### Producer Boundary Re-Authorization (Historical, Superseded By Round 5)

This section records the round-4 interim state only.

For the current native self-hosted ABIogenesis realization, evaluator-aligned
obligation declaration is explicitly re-authorized as the local producer shape.

That means:

- ABG is **not** claiming domain-neutral obligation topology publication in this
  ticket
- the current producer law is accepted as a native self-hosting realization
  shape for the carrier
- the stronger declaration boundary was deferred to `B-013` at round 4

This re-authorization is narrow:

- it applies only to the current native ABIogenesis producer path
- it does not change the generic carrier shape
- it does not make evaluator-name identity a universal carrier law

Round 5 supersedes this temporary re-authorization by delivering
[B-013](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-013-publish-first-class-obligation-ledger-traversal-declarations-in-abg-gtl.md).

### SPEC_METHOD 1.1 Closure Reading

Under the scoped acceptance above:

- the authoritative carrier is the current file-backed published fulfillment
  ledger resolved through `resolve_published_fulfillment_ledger(...)`
- runtime, reporting, topology, and proof share one closure law for this local
  realization
- the earlier bridge paths around raw approval replay, raw `fp_assessment`
  revocation, and assessed-payload fulfillment truth are out of acceptance
- the remaining native producer shape is explicitly re-authorized rather than
  being left as a hidden bridge

So `B-014` closes as a local carrier-realization ticket, not as a full
domain-neutral obligation-declaration ticket.

## Historical Status Note

This file retains the full round-1 closeout content for audit history.

That history is intentionally **not** compressed or removed.

Current authoritative sections for the preserved historical body were:

- `Round 3 Execution Update`
- `Current Authoritative Contract`
- `Current Remaining Open Set`
- `Current Acceptance State`
- `Current Next Actions`

Everything else below is preserved for audit history and may contain claims that
were true for an earlier round but are no longer active acceptance criteria.

Where the historical sections below conflict with the round 4 closeout
authority above, the round 4 closeout authority wins.

Where the round-2 reopen sections below conflict with the earlier:

- `Resolved Migration Items`
- `Acceptance`
- `Downstream Boundary`

the round-2 reopen sections supersede them.

Where the archived round-3 reopen sections below conflict with the round-3
execution update, the execution update supersedes them.

## Historical Round 3 Reopen Intake

Round 3 reopens this ticket.

The round-2 migration materially improved the carrier, but it did not reach the
SPEC_METHOD 1.1 closure bar for a core interface migration.

Per
[SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md),
this ticket cannot remain closed while:

- an authoritative producer still writes ABIogenesis-native obligation topology
  into the carrier
- a superseded revocation path still participates in runtime closure
- topology convergence still has more than one authoritative writer

These are not cosmetic defects. They are core-interface migration failures under
the inside-out no-bridge protocol.

## Round 3 Execution Update

Round 3 execution materially changed the reopen set.

This section is now the current migration authority for the active wave. It
supersedes the earlier round-3 reopen claims where code has since moved.

### Round 3 Resolved In Code

The following reopen defects are now resolved in the tree:

1. Singular closure law for ledger-backed fulfillment edges

- ingest success no longer runs a second post-ledger closure law after the
  carrier says the edge is converged
- approval / revocation follow-ups reuse the same carrier-driven lifecycle
  helper
- `gen_gaps` and frame progress no longer certify fulfillment-managed edges
  from recomputed `bind_fd` closure; they only emit carrier-sourced catch-up
  `edge_converged` projections when a current fulfillment ledger is already
  converged

Code references:

- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:840)
- [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:280)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:89)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:926)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:2064)

2. Raw `fp_assessment` revocation is out of acceptance

- runtime closure no longer scans `revoked{kind: fp_assessment}`
- CLI governance no longer authorizes that legacy revocation kind

Code references:

- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:973)
- [cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py:419)

3. Dead admission bridge residue is removed from the consumer path

- `fh_admission_state(...)` no longer ships in the core ledger module
- resolver-facing `carry_forward` plumbing was removed from `bind_fh`,
  `bind_fp_certified`, and live-status ledger reads

Code references:

- [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py:128)
- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:905)
- [live_status.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/live_status.py:202)

4. Latent dual-match evaluator/id coupling is removed

- `obligation_for_evaluator()` now resolves only through the normalized
  `evaluator` field instead of a silent evaluator-then-id fallback

Code reference:

- [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py:174)

### Round 3 Partially Resolved

#### D3. Native Producer Boundary

This is improved but not yet fully settled.

What changed:

- manifest `fulfillment_obligations` no longer derive from the *current failing
  F_P subset*
- the native manifest producer now derives obligations from the edge's declared
  F_P evaluator set
- the worker-facing output contract now follows those declared obligations
  rather than the failing subset

Code references:

- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:129)
- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:1441)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:1886)

What remains open:

- current ABIogenesis-native obligation ids are still evaluator-aligned
- this is no longer a *failure-state* producer law, but it is still a native
  evaluator-declared producer law rather than a downstream domain-owned
  topology contract

This remaining producer-boundary question is now the only substantive open
architecture item inside `B-014`.

### Current Authoritative Contract

- authoritative carrier:
  current file-backed fulfillment ledger under `.ai-workspace/fp_ledgers`,
  read through `resolve_published_fulfillment_ledger(...)`
- authoritative closure law:
  `edge_converged = carry_converged && fulfillment_converged && admitted`
- authoritative runtime/reporting consumers:
  `bind_fh`, `bind_fp_certified`, `live_status`
- authoritative convergence projection for fulfillment-managed edges:
  carrier transition lifecycle from ingest / approval / revocation, plus
  carrier-sourced catch-up `edge_converged` projection when replay encounters a
  converged current ledger without a certificate event

### Round 3 Producer / Consumer / Projection Audit

Producers:

- native manifest producer:
  [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:1846)
- worker-facing output contract:
  [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:1429)
- ingest publisher:
  [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:720)
- approval / revocation republisher:
  [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:553)

Consumers:

- runtime admission:
  [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:905)
- runtime fulfillment certification:
  [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:948)
- live reporting:
  [live_status.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/live_status.py:186)

Projections:

- ingest close/reopen lifecycle:
  [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:840)
- approval / revocation close/reopen lifecycle:
  [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:280)
- `gen_gaps` carrier-sourced certificate catch-up:
  [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:89)
  and
  [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:886)
- frame-progress carrier-sourced certificate catch-up and step completion:
  [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:2036)
- event-stream state projections:
  [projection.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/projection.py:118),
  [frames.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/frames.py:1720),
  [graph_call.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/graph_call.py:28),
  [run.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/run.py:75)

### Round 3 Proof Snapshot

- `test_abg3_runtime_envelope.py`: `35 passed`
- `test_cli_adapter_auto.py`: `20 passed`
- `test_provenance_integration.py`: `28 passed`
- `test_m03_engine_kernel_integration.py`: `109 passed`
- `test_sandbox_usecases_fake.py`: `14 passed`

### Current Remaining Open Set

1. Native producer neutrality is not fully complete.

- the producer no longer derives obligation identity from the *current failing
  subset*
- but the current native ABIogenesis realization still declares obligations in
  evaluator-aligned terms

2. Ticket authority cleanup is in progress, not finished.

- this file is now back under `tickets/active/`
- round-1 and round-2 history are intentionally retained
- the next closeout pass must restate final delivered scope cleanly once the
  producer-boundary decision is settled

### Current Acceptance State

`B-014` is now narrow.

Implemented and green in this ticket:

- typed `fulfillment_assessments`
- manifest-declared `fulfillment_obligations`
- current file-backed published fulfillment ledger
- ledger-backed `bind_fh`
- ledger-backed `bind_fp_certified`
- pointer/provenance-only `assessed{kind: fp}`
- one closure law for ledger-backed fulfillment edges
- carrier-driven close/reopen lifecycle for ingest and approval/revocation
- replay catch-up projection from the same carrier rather than a second
  closure law

The only substantive open architecture item still inside `B-014` is the native
producer boundary:

- ABIogenesis still authors native obligation identity in evaluator-aligned
  terms for its self-hosting path
- this is no longer based on the current failing subset
- but it is still not the same thing as downstream domain-owned obligation
  topology

So the ticket is:

- code-side carrier migration: substantially complete
- producer-boundary neutrality: not yet complete
- ticket authority cleanup: partly complete, still being normalized

### Current Next Actions

1. Resolve the native producer law explicitly.

Choose one:

- re-authorize evaluator-aligned native obligation declaration as the accepted
  ABIogenesis self-hosting law and close `B-014`
- or keep `B-014` active until first-class declared obligation topology lands
  through `B-013`

2. Once that decision is made, do one final ticket pass:

- restate final delivered scope
- move any remaining stale historical reopen claims under an explicit archive
  marker
- either close `B-014` or leave it narrowly active for the producer-boundary
  dependency only

### Historical Round 3 Intake Archive

The sections immediately below this point are preserved intake and deduped
analysis from earlier round-3 review passes. They are **not** the active defect
set anymore. Some items remain useful as history; others are stale against the
current tree.

### Archived Round 3 Unique Issue Register (Superseded)

#### R3-1 Producer Boundary Still Violates ABG vs Domain Separation

`B-014` claims that domains own obligation topology and ABG remains
mechanism-only. Current code does not satisfy that claim.

- `interpret.py` still writes `fulfillment_obligations` directly from
  ABIogenesis-native `fp_failing` evaluators
- obligation ids are still authored as evaluator names in the current native
  realization
- runtime closure still resolves ledger rows by evaluator mapping

Code references:

- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:1834)
- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:1012)
- [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py:263)

Why this reopens the ticket:

- the new carrier's authoritative producer is still on an ABIogenesis-internal
  topology law
- `B-014` therefore overclaims substrate/domain separation
- closure must either wait for this producer migration or explicitly route it as
  a blocking dependency rather than pretending it is already settled

Classification:

- architecture defect
- requirement mismatch
- ticket defect
- coupling violation

#### R3-2 Raw `fp_assessment` Revocation Still Lives In The Runtime Acceptance Path

The new ledger carrier is supposed to own fulfillment truth. Runtime still
contains a superseded revocation path that can reopen closure independently of
the ledger.

- `bind_fp_certified()` still scans `revoked{kind: fp_assessment}` before
  consulting the ledger
- CLI validation still authorizes `revoked{kind: fp_assessment}`

Code references:

- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:976)
- [cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py:409)

Why this reopens the ticket:

- this is bridge-state authority still participating in acceptance
- it violates the no-bridge rule for core interface migrations
- runtime can still close or open on a superseded path that is not the carrier

Classification:

- architecture defect
- hidden bridge-state logic
- requirement mismatch

#### R3-3 Topology Convergence Still Has Two Writers

`B-014` claims that `edge_converged` / `edge_reopened` are only projections of
carrier transitions. Current code still has two writers for convergence.

Carrier transition writers:

- ingest emits `edge_converged` from the ledger-backed close path
- approval/revocation follow-ups emit `edge_converged` / `edge_reopened` from
  ledger admission transitions

Replay writer:

- recursive replay still emits `edge_converged` from recomputed frame progress

Code references:

- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:1063)
- [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:441)
- [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:587)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:2022)

Consumers still treat these events as closure projections:

- [projection.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/projection.py:118)
- [frames.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/frames.py:1720)
- [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:350)

Why this reopens the ticket:

- topology still has more than one authoritative writer
- runtime/reporting/topology do not yet share one singular closure law
- the replay path can still certify independently of the carrier transition path

Classification:

- architecture defect
- requirement mismatch
- ticket defect

### Archived Round 3 SPEC_METHOD Verdict

Against the
[Core Interface Migration Rule](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md:392)
through
[Closure Criterion](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md:501),
this ticket is not lawfully complete.

The current state fails closure because:

- not every authoritative producer writes the settled contract
- a superseded authoritative runtime path still remains live
- topology convergence is still not reduced to one writer
- the ticket claims singular closure where code reality is still split

### Archived Round 3 Priority Plan

#### P0 Preserve The Landed Carrier

Do not revert:

- typed `fulfillment_assessments`
- manifest-declared obligation validation
- file-backed current ledger publication
- ledger-backed `bind_fh`
- assessed-event pointer/provenance narrowing
- approval/revocation follow-up lifecycle infrastructure

#### P1 Remove Raw `fp_assessment` Revocation From Acceptance

- remove `revoked{kind: fp_assessment}` from runtime closure law
- remove it from CLI governance unless explicitly re-authorized as
  compatibility
- if retained for compatibility, mark it compatibility-only and keep it out of
  acceptance

#### P2 Collapse Topology Convergence To One Writer

- pick one authoritative source for `edge_converged` / `edge_reopened`
- for ledger-backed fulfillment edges, convergence events must come only from
  carrier transitions
- replay/frame-progress must consume that convergence, not independently author
  it

#### P3 Resolve The Producer Boundary Honestly

Choose one of:

1. keep this ticket open until ABIogenesis stops projecting native obligation
   topology from `fp_failing`
2. explicitly route that producer migration to `B-013` as a blocking dependency
   and remove all language in `B-014` that claims the producer boundary is
   already clean

No third option is lawful. The ticket may not remain closed while claiming a
separation that code does not implement.

#### P4 Rewrite The Ticket From Code Reality

After the code migration:

- remove the current completed-round claims that overstate closure
- restate delivered substrate truth exactly
- state any remaining routed dependencies without pretending they are already
  satisfied

### Archived Round 3 Acceptance Supersession

`B-014` may close again only when all of the following are true:

1. every authoritative producer writes the same settled carrier contract
2. no raw `fp_assessment` revocation path remains authoritative in runtime
3. `edge_converged` / `edge_reopened` have exactly one authoritative writer for
   the ledger-backed fulfillment path
4. runtime, reporting, topology, and proof share one closure law for this
   interface family
5. no bridge-state semantics remain in the acceptance path

## Archived Round 3 Supplemental Deduped Findings

The additional review intake for round 3 is **not** a new issue family. It
mostly sharpens and disambiguates the existing reopen set. This section records
the deduped, non-overlapping active defects so the ticket has one authoritative
issue register.

### Archived Deduped Issue Set (Superseded)

#### D1. Closure Law Is Still Bifurcated Between Carrier Truth And Post-Ledger Lifecycle Truth

This is now the primary reopen issue.

Current code has two materially different closure laws:

- runtime and reporting close from the current fulfillment ledger
- proof, graph-call/run terminality, and topology still depend on a second
  post-ledger lifecycle that can fail even after the ledger is converged

Evidence:

- ledger closure is computed from `carry_converged && fulfillment_converged && admitted` in
  [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:382)
- runtime certification reads the ledger carrier in
  [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:995)
- live reporting reads the same carrier in
  [live_status.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/live_status.py:200)
- ingest can still emit `closure_failed` / `graph_call_failed` / `run_failed`
  after `proof_passed` because post-ledger closure policy or target-binding
  checks fail in
  [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:823)
  and
  [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:891)
- approval follow-ups repeat the same split lifecycle in
  [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:273),
  [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:316),
  and
  [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:707)

Why this is unique:

- this is broader than the old “two topology writers” finding
- the real issue is that the ledger can say “closed now” while proof/run/graph
  lifecycle still says “not closed”
- topology duplication is one consequence of this broader split

Classification:

- architecture defect
- code bug
- hidden bridge-state logic

#### D2. Carrier Mutation And Lifecycle Emission Are Not Semantically Atomic

Approval and revocation can mutate the current ledger before the matching
lifecycle is emitted, and that lifecycle can still be skipped.

Evidence:

- follow-ups update the stored ledger first in
  [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:707)
- if manifest recovery fails, the function returns without emitting the matching
  success lifecycle in
  [fulfillment_followups.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_followups.py:719)

Why this is unique:

- this is not just “closure law split” in the abstract
- it is the concrete mechanism by which the carrier can become admitted or
  converged while proof/topology remain stale
- until this is fixed, projection discipline is still broken even if the ticket
  claims one carrier

Classification:

- code bug
- architecture defect

#### D3. Native ABIogenesis Obligation Topology Is Still An Authoritative Producer

This sharpens and extends `R3-1`.

The producer problem is not only manifest authoring. The worker-facing contract
is also still shaped around ABIogenesis-native failing evaluators.

Evidence:

- manifest generation still synthesizes `fulfillment_obligations` from failing
  F_P evaluators in
  [interpret.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/interpret.py:1834)
- the F_P prompt/output contract is still organized around `pre.failing_evaluators`
  in
  [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:1460)

Why this is unique:

- this is the producer-side bridge prohibition failure
- the ticket cannot lawfully claim topology neutrality while the core producer
  path still derives obligation identity from runtime evaluator failure state

Classification:

- coupling violation
- architecture defect
- requirement mismatch

#### D4. The Ticket Is Still Not Auditable As The Migration Authority

This sharpens the ticket-defect side of the reopen.

The file still carries:

- `status: active` but lives under `tickets/completed/`
- completed-round closeout claims
- multiple reopen rounds
- no single declared inventory of every producer, consumer, projection, and
  proof surface required by SPEC_METHOD 1.1

Evidence:

- ticket status and location mismatch in
  [B-014](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-014-persist-and-promote-typed-fp-fulfillment-assessments-into-admitted-ledger-truth.md)
- completed-round claim in
  [B-014](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-014-persist-and-promote-typed-fp-fulfillment-assessments-into-admitted-ledger-truth.md)
- active reopen register beginning in
  [B-014](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-014-persist-and-promote-typed-fp-fulfillment-assessments-into-admitted-ledger-truth.md)

Why this is unique:

- this is not just documentation drift
- under SPEC_METHOD 1.1 the ticket must itself be the auditable authority for
  the migration wave
- right now it is preserving history, which is correct, but it still needs a
  clearer active-wave authority section or a move back under `tickets/active/`

Classification:

- ticket defect
- requirement mismatch

#### D5. Dead Admission Bridge Code Still Ships In Core

This is lower priority than `R3-2`, but it is still a real cleanup item.

Evidence:

- `fh_admission_state(...)` still ships in
  [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py:128)
- `carry_forward` is still threaded through resolver-facing signatures in
  [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py:199),
  [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:909),
  and
  [live_status.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/live_status.py:197)

Why this is unique:

- this code is no longer the primary closure bug
- but it still leaves the old admission model sitting in the core module after
  the migration that was supposed to remove it
- if retained, it must be explicitly classified as non-authoritative scaffolding
  and scheduled for deletion before closure

Classification:

- hidden bridge-state logic

### Archived Round 3 Deduped Mapping

To avoid duplicate issue tracking:

- `R3-1` is now sharpened by `D3`
- `R3-2` remains valid as the raw `fp_assessment` revocation bridge defect
- `R3-3` is broadened and superseded by `D1`
- `D2` is the concrete semantic-atomicity sub-defect under `D1`
- `D4` is the active ticket-authority defect
- `D5` is low-priority bridge-code residue

### Archived Round 3 Updated Next Actions

The dependency order is now:

1. make carrier truth and lifecycle truth singular (`D1`)
2. make carrier mutation and lifecycle emission semantically atomic (`D2`)
3. remove raw `fp_assessment` revocation from acceptance (`R3-2`)
4. resolve the producer boundary honestly (`D3`)
5. rewrite / relocate the ticket so it is auditable as the active migration authority (`D4`)
6. delete dead admission-bridge residue (`D5`)

## Archived Round 3 Supplemental Intake B (Claude) — Deduped Triage

This intake was reviewed against the current code after the round-3 reopen. It
contained both useful sharpeners and several findings that are now stale against
the current tree. The goal here is to keep the ticket's active defect set
accurate.

### New Unique Active Additions

#### D3a. `obligation_for_evaluator()` Still Embeds A Latent Evaluator/Id Coupling Break

This is a real new addition to the active set.

`bind_fp_certified()` still resolves the obligation row through
`obligation_for_evaluator(ledger_data, ev.name)`, and the helper still matches
by `evaluator` first and only then by `id`.

Evidence:

- [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:1012)
- [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py:263)

Why this is unique:

- this is not the same as `D3`'s producer-side topology complaint
- this is the consumer-side latent break that will surface when obligation ids
  stop coinciding with evaluator names in a downstream migration
- the current native evaluator-aligned shape masks the defect in tests

Classification:

- code bug (latent)
- coupling violation

#### D5a. Dead `fh_admission_state()` Bridge Logic Is Also Not Reset-Scoped

This sharpens `D5`.

The dead admission bridge logic still ships in core and still ignores reset
boundaries.

Evidence:

- `latest_fp_assessed_event()` is reset-aware in
  [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py:97)
- `fh_admission_state()` is not reset-scoped in
  [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py:128)

Why this is unique:

- this is not currently an active production split because `bind_fh()` no
  longer falls back to `fh_admission_state()`
- but it means the dead bridge code is not just leftover, it is leftover in a
  semantically unsafe form
- if any consumer revives it, post-reset admission will be stale by design

Classification:

- hidden bridge-state logic
- architecture risk

### Sharpeners To Existing Active Issues

#### D3 Sharpener: Ticket Namespace Law Is Still Self-Contradictory

The Claude intake is correct that the ticket still says two incompatible things:

- the architectural reading prohibits ABIogenesis from deriving domain
  obligation identity
- the namespace boundary text accepts ABIogenesis-native evaluator-derived
  obligation ids as the current realization

This does not create a new issue family. It strengthens `D3` and `D4`:

- `D3` because the producer boundary is still not clean
- `D4` because the ticket still cannot be used as a clean acceptance authority

### Routed But Not Reopen-Critical

#### R-B15-1. Absolute `published_ledger_path` In Events Remains A Local-Realization Fragility

The absolute path risk is real, but it stays routed to `B-015` rather than
expanding the `B-014` reopen set.

Evidence:

- [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:769)

Why it is routed:

- this is part of the local file-backed realization's portability limit
- it does not by itself create a second closure law inside the current local
  workspace scope
- it belongs to backend-neutral / distributed reference work

### Stale Or Already-Resolved Intake Items

The following Claude intake items are **not** added to the active defect set
because they are stale against the current code:

1. `bind_fh()` dual-resolution / pre-F_P admission fallback

- stale because `bind_fh()` now requires a ledger and does not fall through to
  `fh_admission_state()`
- current evidence:
  [binding.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/binding.py:905)

2. `assessed{kind: fp}` still mandates `fulfillment_status`

- stale because the current event payload written by ingest is pointer/provenance-only
- CLI governance for `assessed{kind: fp}` now requires only:
  `obligation_id`, `spec_hash`, `published_ledger_path`
- current evidence:
  [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:765)
  and
  [cli_adapter.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/cli_adapter.py:399)

3. duplicate admission derivation between file write and resolver overlay

- stale because the current resolver is a loader, not the old overlay model
- current evidence:
  [fulfillment_ledger.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/fulfillment_ledger.py:199)

4. sparse obligations array with missing rows omitted

- stale because the ledger now emits explicit missing rows
- current evidence:
  [result_ingest.py](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py:334)

### Archived Round 3 Deduped Mapping B

After this intake:

- `D1` remains the primary closure-law split
- `D2` remains the semantic atomicity bug under `D1`
- `D3` is sharpened by the namespace contradiction and the new latent
  evaluator/id consumer coupling `D3a`
- `D4` remains the ticket-authority defect
- `D5` is sharpened by `D5a`
- the absolute-path portability concern remains routed to `B-015`

## Historical Round 2 Closeout

Round 2 is now implemented and closed.

The current local realization is:

- one current-truth carrier: the current file-backed fulfillment ledger under
  `.ai-workspace/fp_ledgers/<manifest_id>.json`
- one discovery/provenance event: `assessed{kind: fp}` now carries pointer and
  provenance only, not per-obligation fulfillment truth fields
- one admission path: `approved` / `revoked` update the current ledger by
  republishing it
- one closure lifecycle: post-ingest approval and revocation now emit the same
  proof / closure / convergence / run / graph-call lifecycle used by the
  current carrier
- one topology projection law: `edge_converged` and `edge_reopened` are
  projections of the carrier transition, not rival closure surfaces

Round-2 proof slice:

- `test_abg3_runtime_envelope.py`: `35 passed`
- `test_cli_adapter_auto.py`: `20 passed`
- `test_provenance_integration.py`: `28 passed`
- `test_m03_engine_kernel_integration.py`: `109 passed`
- `test_sandbox_usecases_fake.py`: `14 passed`

The remaining non-blocking work is still routed:

- `B-013` for first-class declared obligation topology and native
  failing-evaluator projection
- `B-015` for backend-neutral / distributed reference and resolver work

## Governing Protocol

This ticket is governed by
[T-007](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/T-007-govern-core-interface-migrations-with-inside-out-no-bridge-protocol.md).

That means the current round is not a cleanup wave. It is an inside-out core
interface migration wave for:

- fulfillment truth
- admission truth
- convergence truth
- resolver usage across runtime/reporting/topology

Bridge-state acceptance is explicitly banned for this round.

## Architectural Reading And Evaluation Criterion

`F_D`, `F_P`, and `F_H` are generic edge-traversal functors in ABG. They are
not domain-specific concepts tied to any particular edge category.

- `F_D` owns deterministic traversal facts:
  - identity
  - binding
  - presence
  - accounting
  - mechanically decidable closure facts
- `F_P` owns probabilistic semantic work:
  - semantic construction
  - semantic sufficiency
  - fulfillment judgment where deterministic proof is insufficient
- `F_H` owns human admission where policy requires it

The boundary proven in this ticket is:

- ABG owns the generic substrate carrier:
  - typed probabilistic result carriage
  - admission carriage
  - merge/publication law
  - runtime/reporting/topology consumption hooks
- domains own the meaning:
  - what obligations exist
  - what evidence is sufficient
  - what fulfillment requires
  - how obligation topology is shaped across edges

This ticket is complete only if ABG remains mechanism-only and the local
realization reduces runtime/reporting/topology to one lawful carrier contract.

## Delivered Scope

`B-014` delivers a **local file-backed realization** of the generic fulfillment
carrier. The purpose of this ticket was to prove the utility of the carrier in
the smallest auditable substrate realization before abstracting transport or
storage.

Delivered here:

1. manifests declare `fulfillment_obligations`
2. workers write typed `fulfillment_assessments`
3. ingestion validates obligation identity and writes a merged published ledger
4. `assessed{kind: fp}` carries only discovery/provenance for that ledger
5. runtime, reporting, and topology consume the same current file-backed ledger
   truth in the current workspace realization

Not delivered here:

- a distributed ledger
- a backend-neutral resolver ABI
- domain-owned obligation topology inside ABG
- domain fulfillment semantics inside ABG

Those belong to [B-015](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-015-abstract-fulfillment-ledger-reference-and-resolution-beyond-local-files.md).

## Final Law For B-014

### ABG vs Domain Separation

ABG remains unaware of domain semantics.

ABG owns:

- the typed result carrier
- admission fields and admission resolution
- merge/publication law
- the current local file-backed realization
- the resolver contract used by runtime/reporting/topology

Domains remain responsible for:

- obligation topology
- obligation meaning
- edge-specific carry/fulfillment semantics
- edge-specific ledger structure above the substrate carrier

### Current Realization

For this ticket, the durable local publication is the file-backed ledger under:

- `.ai-workspace/fp_ledgers/<manifest_id>.json`

The authoritative carrier for runtime/reporting/topology is the **resolved
published fulfillment ledger** stored at that path. The common resolver
contract is now a locator/loader for that current ledger, not an overlay that
computes a second in-memory truth surface.

In the current realization:

- ingest writes the current ledger body
- approval and revocation republish the same ledger file with updated:
  - `admitted`
  - `admission_basis`
  - `edge_converged`
- runtime, reporting, and topology read that current ledger through the common
  resolver/loader path

`assessed{kind: fp}` is a discovery pointer to the current ledger publication.
It is not the fulfillment truth surface itself.

### Identity Law

Authoritative obligation identity comes only from manifest-declared
`fulfillment_obligations`.

If a manifest does not declare `fulfillment_obligations`, ingestion rejects the
result. `failing_evaluators` is not an authoritative fallback for obligation
identity in this ticket.

### Admission Law

Admission truth is carried only by the current fulfillment ledger.

`approved` and `revoked` do not act as consumer-side closure surfaces. They are
transition events that republish the current ledger for the same
edge/work-key/workflow-version slice.

For ledger-backed fulfillment edges:

- if no fulfillment ledger is present, the edge is not admissible yet
- `bind_fh(...)` must not close from raw approval replay
- explicit `approved_carry_forward` remains lawful only as publication-time
  authorization, not as a consumer-side fallback

### Merge Law

The current published ledger is the merged substrate truth surface for:

- deterministic carry/accounting facts
- typed fulfillment assessment facts
- admission state for admission-gated edges

It publishes:

- `carry_converged`
- `fulfillment_converged`
- `admitted`
- `edge_converged`
- `missing_count`
- `extra_count`
- `fulfilled_count`
- `partial_count`
- `blocked_count`
- `unfulfilled_count`
- per-obligation entries with:
  - `id`
  - `evaluator`
  - `statement`
  - `source_refs`
  - `assessment_present`
  - `fulfillment_status`
  - `fulfillment_detail`
  - `blocking_reasons`
  - `evidence_refs`

### Topology Law

`edge_converged` and `edge_reopened` remain the event-stream projections used
by frames and generic asset projections, but they are no longer independent
closure sources for this carrier.

For the ledger-backed path:

- ingest emits `edge_converged` directly from current ledger closure
- approval emits the same close lifecycle when it promotes the ledger into a
  converged state
- revocation emits `edge_reopened` and the corresponding proof/closure failure
  lifecycle when it demotes the ledger
- replay deduplicates convergence through the certified-key index and now
  removes stale convergence on `edge_reopened` and reset

So event-stream topology progress is a projection of the same closure law, not
a competing truth surface.

### Obligation Namespace Boundary

The carrier is obligation-id keyed and does not encode domain meaning.

In current ABIogenesis-native flows, manifests commonly use evaluator-aligned
obligation ids because they are built from the edge's declared `F_P`
evaluator set. That is the current native local realization shape, not a
semantic law of the carrier.

Runtime closure no longer requires `obligation.id == evaluator.name`. Closure
resolves through the carrier mapping on each obligation row using the row's
normalized `evaluator` field.

This native evaluator-aligned producer law remains an open divergence from the
stronger domain-neutral target and is routed to
[B-013](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/B-013-publish-first-class-obligation-ledger-traversal-declarations-in-abg-gtl.md).

## Historical Round 2 Resolved Migration Items

### R1. Admission Truth Is Singular At The Consumer Boundary

Resolved by:

- making ingest proof/closure read `edge_converged` from the resolved ledger
- making runtime certification read admission from the resolved ledger
- making live reporting read the same resolved ledger contract

There is no remaining consumer path in scope that may close on raw approval
events independently of the ledger resolver.

### R2. Edge Convergence Reduces To One Closure Law

Resolved by:

- deriving closure from the resolved ledger carrier
- emitting `edge_converged` at successful ingest from that carrier
- treating later `edge_converged` emissions as replay of the same law
- deduplicating replay through certified keys

Topology still uses an event projection, but not an independent truth model.

### R3. Runtime Closure No Longer Depends On Evaluator-Name Coincidence

Resolved by:

- making runtime certification resolve the current ledger first
- looking up the applicable obligation row through carrier mapping
- removing the earlier requirement that `obligation_id == ev.name`

### R4. The Ledger Is Total Over The Declared Obligation Set

Resolved by:

- publishing missing declared obligations as explicit ledger rows
- setting `expected_count` from the declared obligation set
- keeping carry/accounting readable from the ledger itself

### R5. Runtime And Reporting Use One Resolution Contract

Resolved by:

- centralizing ledger resolution in the common fulfillment-ledger helper
- making runtime certification and live reporting use that same resolver

## Historical Round 2 Acceptance Claim

This section is preserved as historical closeout material from round 2.
It is no longer the active acceptance authority for the ticket.

Round-2 claimed `B-014` was complete because the current local file-backed
realization met all of the following:

- `F_P` fulfillment is persisted in a typed per-obligation carrier
- the carrier is merged into one published ledger contract
- authoritative obligation identity comes only from manifest-declared
  obligations
- admission is not split across independent consumer truth surfaces
- runtime/reporting/topology reduce to the same resolved ledger-derived closure
  law
- runtime closure does not depend on evaluator-name coincidence
- the ledger is total over the declared obligation set
- old evaluator-only result payloads are not the accepted authoritative
  fulfillment truth
- ABG remains mechanism-only and does not own domain obligation meaning

This ticket does **not** claim backend-neutral ledger resolution or distributed
publication. Those remain follow-on substrate work.

## Proof Snapshot

Green:

- `test_abg3_runtime_envelope.py`: `31 passed`
- `test_cli_adapter_auto.py`: `20 passed`
- `test_provenance_integration.py`: `28 passed`
- `test_m03_engine_kernel_integration.py`: `109 passed`
- `test_sandbox_usecases_fake.py`: `14 passed`

Out of scope for `B-014`:

- `test_sandbox_install.py`
  - unrelated starter requirement template expectation

## Downstream Boundary

Downstream domains such as `odd_sdlc` may now build against this ABIogenesis
substrate boundary:

- typed `fulfillment_assessments`
- manifest-declared `fulfillment_obligations`
- local published ledger file as the current durable publication
- common resolved-ledger carrier for runtime/reporting/topology

They must **not** assume that ABG owns:

- domain obligation topology
- domain fulfillment semantics
- distributed ledger discovery
- backend-neutral storage abstraction

Those remain domain concerns or follow-on substrate work.

## Historical Round 2 Reopen

`B-014` is reopened again on 2026-04-18.

The combined Codex and Claude reviews identified that the round-1 closure claim
was materially overstated. The substrate landed real improvements, but the
local realization still contains duplicate truth surfaces, hidden bridge-state
logic, and boundary leakage that would produce difficult runtime bugs if left
in place.

This is a new round of work. The earlier content is retained for history; the
issue register below is the active round-2 delta set.

## Round 2 Synthesis Method

This reopen synthesizes:

- operator self-review
- Codex architecture/code review
- Claude architecture/code review

The goal of the synthesis is:

- deduplicate overlapping findings into one active issue set
- keep distinct work in distinct tickets
- preserve history without compressing the prior ticket body
- make the next migration wave auditable under SPEC_METHOD

## Round 2 Unique Active Issue Register

### U1. Post-Ingest Admission Lifecycle Is Still Split

- severity: high
- action: replace
- ticket: `B-014`

The current implementation still permits later `F_H` approval or revocation to
change runtime-resolved edge truth after ingest has already decided whether to
emit:

- `proof_passed`
- `closure_passed`
- ingest-time `edge_converged`
- graph/run terminal events

This means:

- runtime can certify a carrier state that ingest never closed
- later revocation can unset resolver truth without a compensating closure
  lifecycle

Required outcome:

- one lawful lifecycle for:
  - approval
  - revocation
  - proof
  - closure
  - `edge_converged`
  - graph/run terminality

### U2. Admission Truth Still Has A Parallel Raw-Event Closure Path

- severity: high
- action: replace
- ticket: `B-014`

`bind_fh(...)` still falls back to direct approval-event calculus when no
resolved ledger is available. That means admission can become true before there
is any lawful `F_P` publication to admit, and it means runtime still has two
admission interfaces:

- resolved ledger admission
- direct `approved` / `revoked` replay

Required outcome:

- for ledger-backed fulfillment edges, admission must not close independently
  of the authoritative carrier
- if there is no resolved fulfillment carrier, the edge is not admissible yet

### U3. The Current-Truth Carrier Is Still Not Singular

- severity: high
- action: replace
- ticket: `B-014`

There are still multiple authoritative-seeming fulfillment surfaces:

- the file-backed base ledger under `.ai-workspace/fp_ledgers/`
- the resolved ledger overlay returned by the resolver
- `assessed{kind: fp}` event payload fields carrying fulfillment detail/status

In admission-gated cases, the file-backed ledger remains a pre-admission store
while the resolver computes the current merged truth in memory. The event
schema still exposes fulfillment fields even though the ticket claims the event
is only a discovery pointer.

Required outcome:

- one explicit current-truth carrier for runtime/reporting/topology
- backing stores and event payloads reduced to:
  - provenance
  - discovery
  - publication substrate
- no second observable fulfillment truth surface by accident

### U4. Topology, Projection, And Frame Progress Still Depend On Event Projection

- severity: high
- action: replace
- ticket: `B-014`

Generic projection, frame status, and replay still close from
`edge_converged` event projection rather than consuming the current carrier
truth directly.

This remains risky under:

- post-ingest approval
- post-closure revocation
- reset shadowing

Because runtime certification and projection do not consume the closure carrier
in the same way.

Required outcome:

- topology/projection/frame convergence must be lawful projection of the same
  carrier truth used by runtime certification
- reset, revocation, and replay must not leave stale projected convergence

### U5. ABIogenesis-Native Obligation Topology Is Still Projected From Failing Evaluators

- severity: high
- action: re-authorize or replace
- primary_related_ticket: `B-013`
- ticket_boundary: `B-014` must stop claiming this is already resolved

In the native self-hosted ABIogenesis flow, manifest
`fulfillment_obligations` are still projected from failing `F_P` evaluators.
That means ABG is still reconstructing its own obligation topology from its own
runtime failure state.

This does not belong in the generic carrier law if the goal is strict
substrate/domain separation.

Required outcome:

- either explicitly re-authorize this as a native ABG self-hosting bridge model
  and stop claiming full generic decoupling in `B-014`
- or replace it with a declared obligation surface carried through GTL/runtime

Ticket routing:

- `B-014` owns the truthfulness of its claims and any local carrier-coupling
  consequences
- `B-013` is the primary follow-on ticket for first-class declared obligation
  traversal policy

### U6. Declared Obligation Parsing Still Fails Open

- severity: medium
- action: replace
- ticket: `B-014`

Malformed `fulfillment_obligations` entries are still silently dropped rather
than failing closed. That means the declared set can shrink before carrier
publication without an explicit error.

Required outcome:

- malformed declared obligations fail closed
- the declared obligation set used for carrier publication is explicit and
  auditable

### U7. Evaluator-Name Coupling Still Leaks Through Carrier-Adjacent Interfaces

- severity: medium
- action: replace
- ticket: `B-014`
- related_ticket: `B-013`

The runtime no longer requires a pure `id == evaluator.name` law, but
evaluator-name coupling still leaks through:

- worker prompt/output contract examples
- runtime row lookup ordering
- native manifest generation assumptions

Required outcome:

- prompt and interface text must stop overstating evaluator-name identity as the
  carrier law
- current native evaluator-mapped behavior must be described honestly where it
  still exists

### U8. Reference Durability And Future Partial-Publish Semantics Remain Follow-On Work

- severity: medium
- action: defer
- primary_related_ticket: `B-015`

The current local realization still carries:

- absolute `published_ledger_path` pointers
- edge-scoped latest-assessed discovery assumptions
- whole-edge publication assumptions

These are not the primary reopen blockers for `B-014`, but they remain real
follow-on concerns for a durable reference/resolver ABI.

Ticket routing:

- `B-015` owns backend-neutral truth reference and resolution

## Round 2 Priority Plan

The next migration wave should proceed in this order:

1. Make admission truth singular.
2. Make post-ingest approval/revocation obey one lawful proof/closure
   lifecycle.
3. Make topology/projection/frame convergence consume the same effective truth
   as runtime, including reset-safe behavior.
4. Make the current-truth carrier singular and demote the file-backed store and
   `assessed{kind: fp}` payload to non-authoritative roles.
5. Fail closed on malformed declared obligations.
6. Correct worker/runtime contract language where evaluator-name coupling is
   still leaked or overstated.
7. Re-run proof only after the singular-truth model is restored.

## Round 2 Ticket Routing

### Work Remaining In B-014

`B-014` remains the active ticket for:

- singular admission truth
- singular post-ingest proof/closure lifecycle
- singular current-truth carrier semantics
- topology/projection/frame convergence alignment
- strict declaration validation
- prompt/interface honesty for the current carrier law

### Work Routed To B-013

`B-013` is the primary related ticket for:

- first-class declared obligation traversal policy
- removing or re-authorizing ABIogenesis-native obligation topology projected
  from failing evaluators

`B-014` should stop claiming that this boundary is already solved.

### Work Routed To B-015

`B-015` remains the correct ticket for:

- backend-neutral truth references
- resolver abstraction beyond local file paths
- non-local or distributed ledger publication/discovery
- future reference durability concerns

## Round 2 Acceptance Supersession

The round-1 `Acceptance` section above is retained for history only.

For the current round, `B-014` may close again only when all of the following
are true:

- no pre-`F_P` admission path exists for ledger-backed fulfillment edges
- post-ingest approval and revocation cannot leave proof, topology, and runtime
  on different closure states
- one current-truth carrier is authoritative for runtime/reporting/topology
- file-backed ledger publication and `assessed{kind: fp}` events do not remain
  rival truth surfaces
- projection and frame status are reset-safe and carrier-consistent
- malformed declared obligations fail closed
- the ticket text honestly states what remains native ABIogenesis bridge
  behavior versus what is genuinely substrate-generic
