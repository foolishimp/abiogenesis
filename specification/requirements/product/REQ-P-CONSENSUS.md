# REQ-P-CONSENSUS - Agent-Invocable Consensus GraphFunction

**Status**: Active - bounded S05 requirement reprice accepted; design reframe current under T-270
**Category**: Capability / Constraint / Verification
**Date**: 2026-07-12
**Repriced**: 2026-07-26
**Derives from**: [PRODUCT.md](../../PRODUCT.md),
[REQ-L-GTL3-GRAPHFUNCTION.md](../gtl/REQ-L-GTL3-GRAPHFUNCTION.md),
[REQ-L-GTL3-HOF.md](../gtl/REQ-L-GTL3-HOF.md),
[REQ-L-GTL3-RECURSE.md](../gtl/REQ-L-GTL3-RECURSE.md),
[REQ-L-GTL3-C-ALGEBRA.md](../gtl/REQ-L-GTL3-C-ALGEBRA.md),
[REQ-P-PUBLIC-CONTRACTS.md](REQ-P-PUBLIC-CONTRACTS.md),
[REQ-P-CATALOG.md](REQ-P-CATALOG.md),
[REQ-P-INSTALL.md](REQ-P-INSTALL.md),
[TICKET_METHOD.md](../../../.genesis/docs/standards/TICKET_METHOD.md)
**Wave**: ABIogenesis 5.0

---

## Purpose

Publish one bounded, agent-invocable Consensus capability as a SYSTEM-owned GTL
free construction. A calling agent invokes the function through `abg.cli`,
HoG traverses its declared reviewer fan-out, exact attributed submitter
response, reduction, bounded verification rounds, result admission, and replay
without a feature-specific engine service, plugin controller, or shell loop.

## Identity And Ownership

**REQ-P-CONSENSUS-001**: ABIogenesis 5.0 shall publish exactly one canonical
Consensus GraphFunction under handle
`gtl://abg/consensus/submitter-reviewer-rounds`, graph-function ref
`graph-function://abg/consensus/submitter-reviewer-rounds`, and SYSTEM owner
`owner://abg/substrate`. It shall be an admitted callable `graph_function` row in
the ABIogenesis product catalog.

**REQ-P-CONSENSUS-002**: The canonical Consensus function shall have one
published executable GTL graph body admitted through raw GTL admission and GTL
validation. A catalog declaration, contract nameplate, engine plugin,
imperative service method, host-language reviewer loop, or adapter interception
without that executable graph body shall not satisfy this requirement.

**REQ-P-CONSENSUS-003**: ABIogenesis owns the reusable function, its outer
contracts, and its closed result vocabularies. Downstream products and hosts may
contribute reviewer profiles, subject bindings, policies, and overlays through
declared catalog surfaces. They shall not replace the graph body, execute a
second panel loop, emit ABG truth, or decide Consensus closure.

## Public Contracts

**REQ-P-CONSENSUS-004**: The public contract catalog shall locate canonical
schemas for `abg.schema.consensus-subject`,
`abg.schema.consensus-panel`, `abg.schema.consensus-reviewer-profile`,
`abg.schema.consensus-submitter-profile`,
`abg.schema.consensus-submitter-response`,
`abg.schema.consensus-escalation-decision`,
`abg.schema.review-findings`, `abg.schema.review-rulings`,
`abg.schema.consensus-round-policy`, `abg.schema.consensus-round-outcome`,
`abg.schema.consensus-result`, and
`abg.schema.ticket-consensus-projection`. Their native and serialized forms
shall have the same field and value-domain meaning. The public contract catalog
shall also publish the closed F_H decision roster
`accept_with_dissent | reject` as
`abg.vocabulary.consensus-fh-decision`.

**REQ-P-CONSENSUS-005**: A Consensus subject shall bind an exact subject
contract, subject ref and digest, submitting actor, selected reviewer-panel ref,
round-policy ref, and explicit invocation workspace identity. A ticket subject
shall bind the ticket ref and digest; path presence or mutable prose alone shall
not identify the reviewed subject.

**REQ-P-CONSENSUS-006**: Each reviewer profile shall carry a stable profile
identity, role or worker-selection contract, configuration digest, instruction
and result-contract refs, and declared capability requirements. Each admitted
finding set shall carry the profile identity and configuration digest,
invocation ref, source round ref and ordinal, panel ref and position, exact
reviewer-task ref and digest, C-call attempt ref, output digest, evidence refs,
typed findings, and typed residuals or refusal. Those fields form one reviewer
result-occurrence identity and shall equal the expected admitted task occurrence
before vector assembly. Reviewer attribution shall not be inferred from
completion order or adapter position. A panel shall resolve to an explicit
non-empty reviewer vector; duplicate profile identities shall fail admission,
and the product shall not hard-code one panel cardinality.

**REQ-P-CONSENSUS-006A**: ABIogenesis shall publish one canonical attributed
submitter GraphFunction and submitter-response contract for Consensus. Each
invocation shall bind exactly one submitter profile whose actor is the
subject's submitting actor. The profile shall bind its stable profile identity,
role or worker-selection contract, configuration digest, instruction and
result-contract refs, and declared capabilities. The response shall bind the
exact invocation, source round identity and ordinal, complete admitted reviewer
findings-vector digest, submitter profile and actor, response identity and
digest, disposition, addressed and residual finding refs, evidence refs, and
the Product-declared response schema. Submitter instruction and task carriers
shall remain subordinate contracts inside this one Product-owned family; they
shall not become another public operation, runtime authority, or loop owner.

**REQ-P-CONSENSUS-007**: Review reduction shall emit only the closed ruling
kinds `decision_row`, `draft_ticket`, `split_ticket`, `deferment`, and
`rejected_finding`. A ruling is result data for the caller and never owns ticket
status. The public contract catalog shall publish this roster as
`abg.vocabulary.review-ruling-kind`.

**REQ-P-CONSENSUS-008**: Consensus round policy shall declare a positive round
budget, convergence rule, disagreement rule, escalation rule, and foldback
contract. Each admitted round shall bind its complete admitted reviewer
findings vector and exact admitted submitter response before returning exactly
one outcome from `closed_done | recurse_next_round | escalate_fh`, published as
`abg.vocabulary.consensus-round-outcome`. Exhaustion shall produce typed
`escalate_fh`; it shall not silently accept or start another round. The Product
round decision shall be total over the exact policy, source round, complete
findings vector, and admitted submitter response:

- a refusal-bearing complete vector produces `closed_done` with typed
  `contract_failure`;
- exact agreement produces `closed_done` with
  `unanimous_agreement`;
- material disagreement with remaining budget produces
  `recurse_next_round` and one response-bearing successor-round basis; and
- material disagreement without remaining budget, or an admitted escalation
  rule, produces `escalate_fh` with one same-Run F_H hold basis and provisional
  `unresolved_disagreement`.

The same relation shall construct the closed ruling vector from the admitted
finding occurrences and submitter response using only the roster in
REQ-P-CONSENSUS-007. No other outcome, classification, ruling kind, successor,
or hold is lawful.

**REQ-P-CONSENSUS-008A**: The final Consensus result shall bind the subject,
panel, policy, round identities, admitted finding sets, ruling rows, consensus
and dissent classification, terminal round outcome, evidence and lineage refs,
and result and replay refs. It shall distinguish unanimous agreement, partial
agreement with dissent, unresolved disagreement, and typed contract failure
without collapsing those states into one accepted boolean. One admitted
Consensus Run shall expose at most one final result. An `escalate_fh` round
decision is provisional hold basis, not a second final result: the same Run
finalizes to partial agreement when F_H chooses `accept_with_dissent`, or to
unresolved disagreement when F_H chooses `reject`.

## Constructive And Runtime Law

**REQ-P-CONSENSUS-009**: The GTL body shall express the declared reviewer vector
through lawful higher-order fan-out, collect attributed results through an
explicit vector boundary, invoke the canonical attributed submitter F_P
function over that exact admitted vector, carry the submitter response through
ordinary ABG result and judgment admission, reduce the admitted findings and
response through declared evaluation and rule surfaces, and express another
verification round through declared bounded recursion and foldback. The next
reviewer round, including round two, shall be impossible to construct, bind,
open, or execute before ABG admits the exact source-round submitter response.
Prompts, reviewer or submitter selection, merge policy, round control, and
closure classification shall be declarations or referenced contracts, not
host-language orchestration.

**REQ-P-CONSENSUS-010**: HoG shall traverse Consensus through ordinary catalog
selection inside one admitted GTL program and One Surface intent admission.
ABG shall admit its
GraphCall, frame, C-call, worker, result-admission, event, replay, continuation,
retry, and F_H boundaries. The selected Consensus GraphFunction shall be
published by that program and shall not be treated as the whole program or as a
bypass around `evaluateNext`. Consensus shall introduce no new runtime truth
writer, scheduler, automatic wake mechanism, retry loop, or closure authority.

**REQ-P-CONSENSUS-011**: Deterministic admission owns schema, digest,
attribution, panel membership, budget, exact-agreement classification, and
envelope checks. Deterministic reduction shall use declared panel ordinal and
profile identity rather than worker completion order. F_P owns reviewer
findings, disputed semantic judgment, and the exact attributed submitter
response. ABG owns admission of each reviewer result and submitter response and
the causal source-round binding consumed by foldback. Unresolved judgment routes
to F_H. F_D shall not manufacture semantic agreement, and F_P shall not waive a
failed deterministic envelope.

**REQ-P-CONSENSUS-011A**: Before any next-round state, reviewer task, GraphCall,
Frame, or C-call is admitted, the Product-validation and ABG-admission gate
shall refuse a missing submitter response; a response attributed to the wrong
submitter actor, profile, or configuration; a response bound to another
invocation or to a round other than the exact source round whose findings it
consumes; a forged response identity, digest, or evidence basis; and a response
not bound to the complete admitted reviewer findings vector for that source
round. Each refusal shall remain typed non-close truth, append no next-round
runtime fact, and leave the source-round evidence replayable.

**REQ-P-CONSENSUS-012**: For a ticket subject, `ticket.consensus` shall be the
ordinary typed Consensus result bound to the ticket ref and digest. The function
shall not change ticket status, write or split a ticket, invoke triage
automatically, or admit its own ruling as governance truth. The caller or F_H
may take a returned ruling through ordinary TICKET_METHOD triage and mutation.

## Workspace And Public Invocation

**REQ-P-CONSENSUS-013**: Consensus shall use one public workspace contract. The
same contract shall support an existing explicitly selected workspace, another
independently bound explicitly selected workspace root, and a caller-created
temporary workspace root. These are three applications of one contract, not
three runtime modes. A temporary root still requires admitted workspace,
stable workspace-authority basis, immutable binding, catalog, event, result,
replay, and proof identities. Ordinary observation changes shall create new
observation snapshots without changing the workspace authority or binding.

**REQ-P-CONSENSUS-014**: Per-reviewer workspace isolation and a distinct output
workspace are not implied. If a later Consensus contract requires either, it
shall declare the authority through the ordinary input/output-workspace binding
law before realization.

**REQ-P-CONSENSUS-015**: `abg.cli` shall invoke the canonical Consensus root
through the existing `start` variant of `abg.operation.run.invoke`, the
supervised One Surface Program's declared start identity, and
`until=converged`. It shall read the result and replay through the corresponding
variants of `abg.operation.project.read`. An `escalate_fh` outcome shall open a
typed hold inside that same admitted Run. `interaction.respond` shall admit the
exact actor, capability, hold, provisional unresolved result, and one decision
from `accept_with_dissent | reject`; `run.continue` shall resume the same Run,
admit exactly one final result, and close through the ordinary ABG path.
Consensus shall not add a direct support invocation, feature-specific CLI verb,
operation identity, or host-owned orchestration path.
`abg.operation.catalog.view` may narrow the admitted catalog to the Consensus
function and its declared dependencies; it shall not widen catalog authority.

**REQ-P-CONSENSUS-015A**: S05 closure requires direct human affirmation that
the repaired F_H topology preserves Product law: One Surface remains the sole
public entry, escalation remains a hold and continuation inside the same
admitted Run and causal ABG episode, and no direct support invocation or rival
selection, result, continuation, or closure authority exists. Prior
implementation, tests, review, or delegated acceptance shall not silently
supply that affirmation.

## Qualification

**REQ-P-CONSENSUS-016**: The 5.0 release gate shall invoke the packed and
installed candidate's published Consensus function over one real ticket subject
using at least two differently attributed reviewer profiles and one exact
attributed submitter profile. The proof shall enter through the admitted
program and `run.invoke`, read the typed result and replay through
`project.read`, and run through the existing, alternate, and temporary
workspace applications without source imports or shell-owned panel, submitter,
or One Surface orchestration.

**REQ-P-CONSENSUS-017**: Qualification shall include three controlled fixture
families: agreement reaches `closed_done`; a material dispute reaches
`recurse_next_round` only after the exact attributed submitter response is
admitted and rebinds the next round through declared foldback; and round
exhaustion or an unresolved dispute reaches `escalate_fh`. Qualification shall
prove that round two cannot open for missing response, wrong submitter, wrong
prior round, forged response, or response unbound from the admitted findings
vector. Malformed subjects, profiles, findings, submitter responses, rulings,
policies, and round outcomes shall remain typed non-close truth.

**REQ-P-CONSENSUS-018**: Consensus is not release-complete until the executable
GTL body, GTL validation, installed catalog row, addressable public
schemas and vocabularies including the submitter profile and response
schemas, all three fixture families, all three workspace applications,
reviewer and submitter actor attribution, exact findings-to-response-to-ABG
admission-to-next-round causality, result, and replay evidence pass over the
exact 5.0 candidate. A declaration-only entry or imperative implementation
shall fail the gate. The proof shall use only the complete Product-derived
public function family; a legacy operation identity or parallel adapter
register shall fail it. The unresolved fixture shall prove that
`interaction.respond` and `run.continue` retain the exact original Run identity,
consume one hold once, and produce one final result before ordinary closure.

## Bounded Scope

**REQ-P-CONSENSUS-019**: The bounded feature may compose reviewer assessment and
reduction inside Consensus. It does not publish a generic standalone
Review-to-ticket product, scheduler, watcher, recurrence service, automatic
ticket mutation, generic portfolio consensus service, or new engine law.
