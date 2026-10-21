# TICKETS

Tier 2. Owns the work carriers of the method: goals, tickets, sprints,
comments and execution contracts as one model; the default layout and the
bindings that locate the carriers; the sprint rules; the ticket rules,
including triage-first intake, the change class the ticket records and the
upward propagation check; the selection of the smallest lawful carrier for
a piece of work and the carrier side of execution-contract admission; the
separation of execution from verification authority; the continuity of
recorded judgment and owner rulings; condition-based closure and reuse;
test case authority; the implementation-migration ticket category with its
declaration, checklist and review rules; one-truth state projection; the
recommended ticket and sprint shape; the operating mode. It is realised
from [FOUNDATIONS](FOUNDATIONS.md), [ACTIVATION](ACTIVATION.md) and
[EVALUATION](EVALUATION.md) and is the T area named by
[SPEC_METHOD §1](SPEC_METHOD.md#method-identity): nothing here is
foundational, every clause names the principle that requires it (P0 to P6,
FOUNDATIONS §3), and each mechanism could be realised differently under the
same principles. The change classes a ticket records are
[SPEC_METHOD §4](SPEC_METHOD.md#change-classes), which is the triage target
of every clause here that names a class; the step side of admission is
[ACTIVATION §1](ACTIVATION.md#admission); the generic law of claims,
independent assessment and acceptance is EVALUATION §1, §3 and §5; the
testing law is ASSURANCE. This member defines none of those twice. Its
family table (F13) opens §5.

## 1. Work carriers

### Goals

The product definition's `ticketing.goals` binding locates the current epic
layer; `GOALS.md` is the default file (PRODUCT_DEFINITION §1). Goals are
broader than one ticket, narrower and more current than the intent surface,
and the place to state the active work wave and what matters now. Goals are
not the durable unit of execution tracking (P2, P3).

### Ticket records

Tickets are the enduring work records. Each ticket is one durable record,
one markdown file being the default carrier; the source of truth for that
unit of work; durable across sessions; and typed, so that bugs and features
share one system. A ticket is used when work needs independent durable
identity: feature work, bug tracking, spikes and chores (P3, P4b).

### Sprints

Sprints are bounded execution batches. Each sprint is one manifest under
the product definition's optional `ticketing.sprints.root` binding,
`.ai-workspace/sprints/` being the default; a control surface for a bounded
body of work; a place to batch repeated authority references, closure law,
evidence expectations and deferred local compliance debt; and closed by an
explicit sprint-close review. Sprints are not constitutional authority: they
operate under SPEC_METHOD and the project surfaces they cite
([SPEC_METHOD §4](SPEC_METHOD.md#sprint-execution-boundary) states the
sprint boundary; this member states the mechanics) (P2, P6).

A sprint may contain durable tickets, manifest-local iteration entries, or
both. Tickets carry work items that need durable identity across sessions;
manifest-local iteration entries carry small changes whose only independent
value is traceability inside the sprint. The sprint is the batch authority;
it does not erase the need for paydown tickets when close review finds debt
that must survive past the sprint (P2, P4b).

### Comments

The product definition's `ticketing.comments.root` binding is the message
board; `.ai-workspace/comments/` is the default. Comments are for publishing
ideas, strategy notes, reviews, handoffs, closure summaries, and decisions
with their reasoning. Comments are not task status authority. A comment
is a post of [POSTING_GUIDE](POSTING_GUIDE.md), which states what it
carries, its structure and its discussion state. A decision recorded in a
comment takes its authority from the surface that owns the decision, once
it is adopted there ([POSTING_GUIDE §9](POSTING_GUIDE.md#9-ratification)),
and has none of its own (P6, P3).

### Execution contracts

Tickets are durable work authority. An execution contract is the run-scoped
admitted work surface derived from a ticket, from a sprint manifest plus an
included ticket or iteration entry, or drafted during intake when no durable
or sprint-local work identity is required. The three lifetimes differ: a
ticket survives sessions and work waves; a sprint survives one bounded
execution batch and its close review; an execution contract is the current
admitted execution function for one run. Execution contracts are not a
rival backlog or a second planning surface (P0, P3).

They exist so that the system can classify the work before execution; admit
or reject the drafted classification against deterministic criteria; record
the admitted execution basis on the selected durable work carrier, including
an event log where the execution binding requires one; assemble prompts
from admitted work law instead of from raw user phrasing; and evaluate
closure against the same admitted criteria. The intended loop: work
arrives; the system selects the smallest lawful work carrier for its
required lifetime (§5); an agent drafts one run-scoped execution contract
from that carrier; the system validates and admits or rejects the contract
(ACTIVATION §1, Admission); execution may proceed in the same invocation
under the admitted contract; closure is checked against that same contract;
the resulting state still flows through normal proof, gap analysis and
repricing (P6, P2).

### Milestones and phase-scoped truth (UP-006)

A ticket may contain several closure-bearing milestones without becoming
several tickets. Each milestone has stable identity, a bounded claim,
relevant dependencies, current state, required evidence, and an explicit
relation to ticket closure (P3).

Milestone acceptance proves only its declared claim. Accepted design does
not satisfy implementation, installed proof, qualification or release.
Ticket completion requires every closure-bearing milestone to be accepted;
optional or deferred work requires an explicit disposition and owner. Each
milestone is a work claim under §7 Condition-based closure and reuse, so
its acceptance follows that condition for its own declared claim, and a
ticket is complete only when the condition holds for each of them.
Commentary and generated summaries cannot mutate milestone or ticket truth
(P6, P4b).

## 2. Layout and authority

### Default layout

The starter file layout (P2, P3):

```text
stdo_default.json

specification/
├── GOALS.md

.ai-workspace/
├── sprints/
├── tickets/
│   ├── backlog/
│   ├── active/
│   └── completed/
└── comments/
    └── <agent-id>/
```

The applicable product definition resolves POSTING_GUIDE and this member
from its exact shared installed basis (PRODUCT_DEFINITION §4); their
absence from the project tree is not absence from the governing method. A
conforming `stdo_<label>.json` definition may bind the same ticket, comment
and sprint roles to existing directories, repository resources, tracker
collections, API endpoints or product-scoped queries without restructuring
the project (PRODUCT_DEFINITION §1).

### Bindings and projections

The bindings (P6, P3): `ticketing.goals` locates the epic
layer; `ticketing.sprints.root`, when present, is the bounded
execution-batch and sprint-close review layer;
`ticketing.tickets.lanes.backlog`, `.active` and `.completed` locate the
ticket authority; `ticketing.comments.root` locates the discussion and
publication layer. The paths of the default layout are the bindings
supplied by `stdo_default.json`. The definition locates these carriers and
does not own their ticket or comment content.

There is no separate mandatory `ACTIVE_TASKS.md` in this model. A project
that wants a board view may generate one from the bound ticket authority;
that board is a projection only and does not become the source of truth
unless the product definition explicitly rebinds the ticket authority to
that carrier and no rival remains (§7).

### Carrier substitution

The durable local-file model is the default and remains valid whenever it
is selected. Another carrier is not required to reproduce its folders, but
it preserves the same ticket authority and refusal laws (§3 and §4, one
durable record). Growth the model admits includes a generated active board,
ticket dependency checks, links from tickets to scenario, requirement or
ADR surfaces, external sync with a real ticketing system, and message-board
integration through a standard tool-protocol capability. Under the bindings
above, a generated board is a projection, and a tracker that holds tickets
is lawful only as an explicit rebinding of the ticket authority by the
product definition with no rival surface remaining, so neither growth
changes the authority or refusal laws (P2, P6).

## 3. Sprint rules

### One durable record per sprint

Each sprint has one durable manifest record; the default carrier is one
markdown file. Another bound carrier preserves the same identity, required
fields, history, closure law and one-truth relation (P3, P4b). For a local file, the filename should
carry a stable id and a short slug. Recommended local-file naming:
`SPRINT-2026-04-30-process-navigator.md` and
`SPRINT-2026-05-12-dashboard-density.md`.

### Manifest fields

Each sprint manifest records at least `id`, `title`, `status`, `goal`,
`opened_at`, `updated_at`, `authority_refs`, `scope`, `excluded_boundaries`,
`expected_change_classes`, `included_tickets` or `iterations`,
`closure_trigger`, `closure_law`, `proof_surface`, `deferred_compliance`,
`non_closure_conditions` and `paydown_policy` (P4b, P2).

`authority_refs` names the upstream goals, intent, product, requirement,
design or other governing surfaces the sprint operates under.
`excluded_boundaries` names what the sprint is not allowed to change;
typical exclusions are product truth, data contracts, runtime semantics,
governance and closure law, public carrier shape and release criteria.
`deferred_compliance` names any local proof, review, accessibility,
screenshot, walkthrough, test, design wording or trace cleanup
intentionally deferred until sprint close. `paydown_policy` states how
deferred debt becomes accepted, ticketed, repriced or removed during close
review (P6).

### Sprint status

The minimum sprint status model is `active`, `closing`, `closed` and
`superseded` (P5, P3). `active`: iteration is admitted
inside the sprint boundary. `closing`: new iteration is frozen while close
review and paydown classification run. `closed`: close review finished and
all remaining debt is accepted, ticketed, repriced or removed.
`superseded`: the sprint boundary was wrong and a new authority surface,
sprint or ticket set replaced it. A project may add `planned` or
`cancelled`; those states do not replace close review.

### Sprint admission

A sprint may admit work only when the manifest makes the boundary
reviewable. Admission requires a bounded scope, cited authority, expected
change classes, explicit excluded boundaries, a closure law, non-closure
conditions, and a paydown policy for deferred compliance (P6, P2).

The sprint may batch repeated closure criteria that would otherwise be
copied into every included ticket. It may not batch away intake triage:
substantive included tickets still record their lawful `change_class` and
`re_entry_point` (§4, Triage metadata). Manifest-local iteration entries
may rely on the sprint's declared class only while they remain inside the
sprint scope and excluded boundaries (P4b).

### Compliance escrow

A sprint may defer local compliance proof only when the manifest names the
deferred proof or cleanup class; the debt is local to the sprint's admitted
surface; the expected correction cost is lower than the per-change proof
cost; the sprint is short enough that the debt remains reviewable; and the
close review classifies and pays down the debt. Deferred compliance is not
silent debt: it is escrow held by the sprint, and
[SPEC_METHOD §4](SPEC_METHOD.md#sprint-execution-boundary) states that
escrow satisfies no method, release or product closure until paid down,
accepted or repriced (P2, P4b, P6).

The following may be eligible for escrow when the governing method allows
it: screenshots or
walkthrough capture; visual review; accessibility cleanup; replay proof for
product-meaningful user-interface interactions; design wording cleanup; trace cleanup;
local realisation cleanup. The following may not be hidden in escrow: new
product truth; new
or changed data contracts; new runtime, governance, closure, provenance or
evidence semantics; missing constructive carriers; changed public
published-function or public carrier contracts; law-changing work that
needs `goal_reprice`, `intent_reprice`, `product_reprice`,
`requirement_reprice` or `design_reframe`. If one of those appears during
the sprint, the sprint records the finding and the work exits the sprint
path through a standalone ticket, a repricing action or sprint supersession
(P6).

### Close review

Sprint close begins by moving the manifest to `status: closing`. While
closing: new iteration inside that sprint is frozen; every included ticket
or iteration entry is reviewed against the manifest; accumulated evidence
is checked for durability; changed surfaces are walked against cited
authority; deferred compliance is classified; paydown tickets are opened
where debt must survive past the close review (P6, P4b).

Each reviewed item is classified as one of `accepted` (compliant under the
sprint authority), `local_paydown` (local debt remains and is captured by a
paydown ticket), `design_reframe` (the work needs design repricing),
`requirement_reprice` (the work needs requirement repricing),
`product_reprice` (the work changes product definition) or `remove` (the
work should be backed out or kept out of closure) (P5). A sprint may move to
`closed` only when every item and every debt entry is classified and the
resulting paydown or repricing work is durable. Sprint close can accept
local paydown debt only when the governing method allows that debt to
survive as explicit follow-up; it cannot accept hidden authority drift
(P6).

Close classifications and the core. A close classification is the
outcome of close review for one reviewed item, made against the sprint
authority the manifest cites; the close review must classify, under that
authority. The classification uses
[ACTIVATION §3 Disposition](ACTIVATION.md#disposition) only for its
result mapping: the candidate is the reviewed item, its boundary is the
sprint's close under the cited authority, and the classification consumes
the core results of the item's review and stays separate from them, as
acceptance stays separate from assessment
([FOUNDATIONS §4 Results](FOUNDATIONS.md#results)). Each classification
takes exactly one core value, for the predicate "the reviewed item is
accepted as compliant under the sprint authority", and the table names
the disposition whose condition it matches, where one does (P5, P6):

| Classification | Matching disposition | Core value | Ground, and how it narrows or differs from the disposition's condition |
|---|---|---|---|
| `accepted` | `accept` | satisfied | the item is compliant under the sprint authority |
| `local_paydown` | `local_repair` | falsified | local debt remains and is captured by a paydown ticket; the debt is the counterexample. The governing relation stays coherent, because an item whose governing authority must change takes a repricing classification instead. It differs from `local_repair` in where the repair is carried: by the paydown ticket, which survives the close where the method allows that debt to survive |
| `design_reframe` | `re_enter` | invalid_basis | the accepted design that governs the item must change, so the authority the sprint cites cannot support accepting it |
| `requirement_reprice` | `re_enter` | invalid_basis | a governing requirement must change, with the same consequence |
| `product_reprice` | `re_enter` | invalid_basis | the work changes the product definition, which the authority the sprint cites cannot support |
| `remove` | none | falsified | the work is backed out or kept out of closure; the reason for removal is the counterexample. No disposition of ACTIVATION §3 has this condition, because removal does not require a violated governing relation or a competing truth path |

The layer that `design_reframe`, `requirement_reprice` and
`product_reprice` name is a declared fact, not a further result: it is
the change class of [SPEC_METHOD §4](SPEC_METHOD.md#change-classes) at
which the work re-enters, and it travels with the core value as the
domain outcome (FOUNDATIONS §4 Results, Recording). The outcome of a
debt entry, accepted, ticketed, repriced or removed (Sprint status,
`closed`), is likewise classified by the close review and mapped at the
close boundary, for the predicate "the debt entry is accepted under the
sprint authority": accepted matches `accept` (`satisfied`), ticketed
matches `local_repair` (`falsified`), removed takes `falsified` with no
matching disposition, and repriced matches `re_enter`
(`invalid_basis`), on the grounds of `accepted`, `local_paydown`,
`remove` and the repricing classifications respectively. The mappings
add no disposition and no core value. The condition for `closed`
above requires an outcome for every item and debt entry, not a
`satisfied` one. 
Purpose and material relation: a consumer that combines close outcomes
with other results cannot read remaining debt, needed repricing or
removal as compliance (P5, P6).

## 4. Ticket rules

### One durable record per ticket

Each ticket has one durable authoritative record; the default carrier is
one markdown file. A repository or external tracker carrier is lawful only
when it preserves the required ticket contract, history, state transition,
stable identity, searchability and closure semantics without a co-equal
local copy (P3, P4b). For a local
file, the filename should carry a stable id and a short slug. Recommended
local-file naming:
`T-001-add-product-layer.md`, `B-002-fix-reset-manifest-id.md`,
`S-003-evaluate-integration-capability.md`,
`C-004-clean-up-trace-tags.md`.

### Multi-build-tenant independence

This clause consumes the build-tenancy bounded context
`urn:stdo:bounded-context:build-tenancy` declared by PRODUCT_DEFINITION §8.
This member owns the multi-build-tenant work-item and ticket-lifecycle
relation inside that context; it does not redefine build-tenant identity or
realisation meaning (P3, P1).

A multi-build-tenant work item is one admitted upstream work item with more
than one build-tenant execution line. The upstream authority and each
tenant-local ticket retain distinct identities and lifecycles. If one
source, product or design work item must be realised in more than one build
tenant, its tenant realisations are not tracked inside one ticket
lifecycle. The rule governs backlog and active tickets; it is not
retroactive for completed tickets unless a completed ticket is reopened or
explicitly repriced. It does not make every ticket multi-tenant: tenant
duplication is used only when the same admitted work item genuinely has
more than one tenant execution line (P3).

The three lawful cases: an upstream-only ticket (source, product or design
authority only; no tenant duplicate yet); a single-tenant ticket (one
tenant-local execution line; no sibling duplicate required); a multi-tenant
work item (one upstream authority ticket and one suffixed tenant-local
ticket per tenant execution line). For the multi-tenant case: keep the
upstream source, product or design ticket as its own authority surface;
duplicate the work item into one tenant-local ticket per build tenant;
append a build-tenant mnemonic to the base ticket id and filename; keep
status, proof, closure and reopen logic independent for each tenant.
Recommended examples: `B-030-publish-capability-profile...` as the
source ticket,
`B-030-T1-publish-capability-profile...` and
`B-030-T2-publish-capability-profile...` as the tenant tickets.

The law: one ticket does not claim closure for more than one build-tenant
lifecycle; a tenant-local blocker or false closure in one tenant is not
hidden by green status in another; tenant-local proof, repricing and
reopening remain tenant-local (P3, P6). If a tenant-local duplicate
exists, it should record `source_ticket` and `build_tenant`. The
`build_tenant` value identifies the
applicable entry in the product's `how.build_tenants` definition; a path
name, display alias or tracker label does not replace that identity unless
the product definition binds it as the identity. The unsuffixed base ticket
may remain the upstream product or design authority. If the work item is
multi-tenant, tenant execution and closure for backlog and active work live
on the suffixed duplicates; if it is single-tenant, no sibling duplicate is
required.

### Required fields

Each ticket records at least `id`, `title`, `type`, `ticket_category`,
`status`, `goal`, `change_intent`, `change_class`, `re_entry_point`,
`triaged_at`, `created_at` and `updated_at` (P4b, P3). Recommended additional fields: `priority`,
`dependencies`, `links`, `intake_source`, `affected_boundary`,
`source_ticket` when the ticket duplicates or derives from another ticket,
and `build_tenant` when the ticket is tenant-local.

For `ticket_category: implementation_migration` the ticket also carries
`migration_strategy` and `library_usage`; `governing_library` when
`library_usage` is `consume` or `extend`; and `library_rationale` when
`library_usage` is `none` (§6). A tenant-local implementation migration
also carries `build_tenant`, and `source_ticket` when it duplicates or
derives from an upstream source, product or design ticket.

For execution-contract admission the runtime-drafted contract should also
carry, at minimum, `target_truth`, `superseded_truth` when relevant,
`closure_law`, `evaluation_criteria`, `non_closure_conditions` and
`proof_surface` (§5).

### Types

The minimum common set of ticket types is `feature`, `bug`, `spike` and
`chore`. A project may add more; the default set should be enough for
most cases
(P3).

### Category

Ticket category is orthogonal to ticket type: type answers what kind of
work record this is; category answers what execution or migration
discipline governs the ticket (P3, P1). The minimum
common set is `ordinary` and `implementation_migration`, so a `feature`,
`bug`, `spike` or `chore` may carry either. `implementation_migration` is
used when the ticket is not "change code until tests pass" but a governed
replacement of one implementation truth path with another across producers,
consumers, projections and proof surfaces: a bug ticket that replaces an old
tracker or read-model family with one new authoritative carrier; a feature
ticket that introduces a new public interface and requires every producer
and consumer to migrate before closure; a refactor ticket that removes a
bridge path or compatibility facade from an authoritative contract family.

### Inside-out sequencing

For `ticket_category: implementation_migration`, ticket sequencing reflects
the inside-out rule of
[SPEC_METHOD §7](SPEC_METHOD.md#inside-out-first-sequencing) (P4b, P6). Tickets that publish or admit
the new authoritative source carrier are the upstream tickets in the wave.
Tickets that harden prompt assembly, projections, reports, dossiers, review
surfaces or other downstream consumers depend on those upstream source
tickets. A downstream ticket may carry exploratory work while the source
ticket is active, but that work is non-closure evidence until the source
carrier is admitted and authoritative. A downstream ticket does not close
while its upstream source-carrier ticket remains open. When one migration
wave introduces a new source carrier and then its prompt, projection or
read-model consumers, the dependency chain runs `source carrier ->
downstream consumers`, never the reverse.

### Change class

Ticket type and change class are orthogonal: type answers what kind of
work record this is; change class answers where the change lawfully
re-enters the constitutional chain. A ticket records the `change_class`
declared by intake triage, using the classes of
[SPEC_METHOD §4](SPEC_METHOD.md#change-classes) (P4b, P2).

Common pairings: `feature` with `goal_reprice`, `intent_reprice`,
`product_reprice`, `requirement_reprice` or `design_reframe`; `bug` with
`requirement_reprice`, `design_reframe` or `realization_refactor`; `chore`
with `design_reframe` or `realization_refactor`; `spike` as exploratory
work that still carries the current triage class and should terminate
either in a more specific downstream ticket or in an explicit decision
that no further substantive change is required.

Ticket category and change class are also orthogonal: `change_class`
governs lawful constitutional re-entry; `ticket_category` governs ticket
execution and closure discipline. A ticket may therefore be `type: bug`,
`ticket_category: implementation_migration`, `change_class: design_reframe`
without contradiction (P3).

### Upward propagation check

Triage consumes the computed classification of
[SPEC_METHOD §4](SPEC_METHOD.md#computed-classification-and-treatment) for
the declared owner and layer traversal, the complete relevant public
membership and value delta, the accepted-design scope and trace coverage,
and the rule-determined treatment. The owning work carrier references that
exact result and its residuals; a new role does not repeat an unchanged
walk (P4b, P2).

Before declaring `realization_refactor` for a bug, establish that the
current requirement and the accepted realising design govern the affected
behaviour and remain sufficient for the authorised outcome. Their presence
proves no coverage. Missing or ambiguous evidence leaves the affected
treatment unknown; it is not proof that the governing layer itself is
absent (P6).

The re-entry rule is SPEC_METHOD §4's: the
[change classes](SPEC_METHOD.md#change-classes) with their re-entry
points, and the smallest lawful re-entry that step 4 of
[Computed classification and treatment](SPEC_METHOD.md#computed-classification-and-treatment)
exposes, with the paragraph after the four steps: a candidate's public
violation does not select a new contract, and the governing owner is
re-entered only for an explicitly changed desired outcome or an
established governing insufficiency. For a bug, this check
refines that rule into an upward walk from the realised surface that
checks each layer and stops at the highest layer found missing or
insufficient for the authorised outcome, and the class is the one that
re-enters there:

| Where the walk stops | Change class | Action |
|---|---|---|
| the governing requirement is missing or insufficient | `requirement_reprice` | re-enter the requirement's owner |
| the requirement is sufficient, and the realising design is missing or insufficient | `design_reframe` | re-enter Design |
| an actual upstream Goal, Intent or Product change | `goal_reprice`, `intent_reprice` or `product_reprice` | follow the change to its owner rather than stopping at a familiar file |
| the current requirement and accepted design suffice, and the implementation deviates | `realization_refactor` | repair or reject the candidate |

Unresolved meaning remains J and a reserved choice remains O, as that
paragraph states (P2, P6).

### Triage metadata

Because tickets are the durable authority surface for work tracking, a
ticket for substantive work carries the minimum metadata required by the
intake triage of [SPEC_METHOD §4](SPEC_METHOD.md#universal-intake-triage):
the declared `change_intent`, the lawful `change_class`, the lawful
`re_entry_point`, and when triage occurred in `triaged_at` (P4b, P2). The recorded values are those intake triage declared
(Change class and Upward propagation check above).

### Status

The minimum ticket status model is `backlog`, `active` and `completed`. A
project may add `blocked`, `cancelled` or other explicit local states; the
base method starts with the three (P5, P3).

The ticket statuses, any local state a project adds, the lanes below, the
sprint statuses of §3 and the `migration_strategy` and `library_usage`
values of §6 are declared states of their carriers, not results, and map
to no core value; the recorded `change_class` is a declared state under
[SPEC_METHOD §4](SPEC_METHOD.md#change-classes). The close
classifications and debt-entry outcomes of §3
Close review are results, mapped there. An evaluation that reads a
declared state returns its own core value with its predicate under
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results). Purpose and material
relation: a declared state is never combined as an evaluation result, so
a ticket marked `completed`, or a sprint marked `closed`, cannot stand in
for a `satisfied` result (P5, P1).

### Lanes

Backlog tickets live at the product definition's
`ticketing.tickets.lanes.backlog` binding, by default
`.ai-workspace/tickets/backlog/`; active tickets at
`ticketing.tickets.lanes.active`, by default `.ai-workspace/tickets/active/`;
completed tickets move to `ticketing.tickets.lanes.completed`, by default
`.ai-workspace/tickets/completed/` (P0, P3). `backlog`
is accepted durable work that should remain visible but is not part of the
current execution focus; `active` is the current bounded execution set;
`completed` is closed work retained as history. The lanes keep the live
execution set small enough that `rg` remains fast and readable without
forcing deferred work into comments or goals.

## 5. From carrier to execution

If a derived surface or projected frame of this member is insufficient,
the actor reads this member only for the named unresolved lifecycle or
proof question and cites the clauses used (P2, P6; prompt construction is
[ACTIVATION §2](ACTIVATION.md#2-context-construction-under-an-envelope)).

Before the derivation table, the deciding routes are
[Carrier selection](#carrier-selection) for the work record and its lifetime;
[Execution contract admission](#execution-contract-admission) for execution;
[Recorded judgment and owner-ruling continuity](#recorded-judgment-and-owner-ruling-continuity)
for reusable judgments and repricing; and
[Condition-based closure and reuse](#condition-based-closure-and-reuse) for
completion. The table traces these owners; it does not decide their questions.

### Foundation to law: work carriers

This family (F13 in the index of
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law))
decides which record carries a piece of work, what that record may claim
and when the work closes. Its instance premises, which the commitments do
not supply, are named in the rows as follows: lifetimes, work and its
obligations last one run, one bounded batch or longer; several surfaces,
goals, tickets, comments, boards and summaries can each appear to state
the same work state; several tenants, one work item may be realised in
more than one build tenant; migrations, some work replaces one
authoritative truth path with another across producers, consumers and
proofs; carriers vary, a project may keep its carriers in files, trackers
or services. Each commitment's standing is written as the table of
commitments in FOUNDATIONS §3 states it.

| Premises, with standing | Consequence that follows | Rule in this member that states it | Added domain or policy choice, and its owner | Pillar |
|---|---|---|---|---|
| P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P3 (independent); P2 (independent); P6 (independent); P0 (recovered); instance: lifetimes | By P0 an actor's context does not outlive its run, and by P4b a step-produced fact that is not recorded is lost, so an obligation that must outlive the run is recorded on a carrier whose lifetime covers it before the run returns. By P2 nothing is added that the outcome does not need, so every execution runs under one run-scoped contract drawn from the smallest such carrier (an admitted ticket, a sprint entry or the run itself), and a durable ticket is created only for state that must survive; by P6 creating one needs ticket-state authority. | [Carrier selection](#carrier-selection); §1 [Goals](#goals), [Ticket records](#ticket-records), [Execution contracts](#execution-contracts) | the carrier kinds and the selection table, which apply this order to named lifetimes: a policy of this member; where each carrier lives: the product definition ([PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers)) | 1, 8, 9 |
| P6 (independent); P2 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P3 (independent); instance: lifetimes | By P6 work needs an admitted authority, and a record's presence or prose creates none, so work executes only under admitted upstream work authority, and a carrier's presence, lane, status or prose is neither the admission of a contract nor the admission of a growth basis. By P3 execution and closure bind one exact basis, so both read the same admitted contract, which shows what counts as completion and what still counts as failure. | [Carrier selection](#carrier-selection); [Execution contract admission](#execution-contract-admission); [Evaluation criteria and non-closure conditions](#evaluation-criteria-and-non-closure-conditions) | the contract's minimum fields: this member; the admission mechanism and the result and evidence surface: the product definition. The step side of admission is law at [ACTIVATION §1](ACTIVATION.md#admission), not a choice | 1, 8, 9 |
| P6 (independent); P3 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P2 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P0 (recovered); instance: several surfaces, carriers vary | By P3 one state binds one authority and basis, and by P6 a projection is not authority, so work state has one authority chain: goals own the work wave, the ticket owns its state and milestone authority its milestones, and a board, comment, index or summary is a projection that answers one question. By P5 contradictory authorities cannot both be read as satisfied, so contradiction among them blocks closure; by P4b a milestone's acceptance establishes only its own claim. A comment is a post: provisional until its content is adopted into the owning surface, with its own discussion state. Another carrier is lawful only as an explicit rebinding with no rival left. | [One-truth state projection and drift refusal (UP-009)](#one-truth-state-projection-and-drift-refusal-up-009); §1 [Comments](#comments), [Milestones and phase-scoped truth (UP-006)](#milestones-and-phase-scoped-truth-up-006); §2 [Default layout](#default-layout), [Bindings and projections](#bindings-and-projections), [Carrier substitution](#carrier-substitution); §4 [Status](#status), [Lanes](#lanes); §9 [Relationship to other surfaces](#relationship-to-other-surfaces); [POSTING_GUIDE §2](POSTING_GUIDE.md#2-boundary), [§7](POSTING_GUIDE.md#7-discussion-state-and-mutability), [§9](POSTING_GUIDE.md#9-ratification) | the default layout, the lanes and the minimum status sets: domain choices of this member, which a project may extend; a rebinding of ticket authority: the product definition; the post categories, structure and discussion states: [POSTING_GUIDE](POSTING_GUIDE.md) | 1, 6, 9 |
| P2 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P3 (independent); instance: lifetimes | By P2 closure law repeated over one bounded scope can be applied once, so a sprint batches it; by P4b a deferred proof persists until paid, and by P6 closure needs its evidence, so a sprint defers only declared local proof, as escrow paid down at close review, and never batches away triage. Law-changing work re-enters at its own layer (P2), so it leaves the sprint. By P5 each close outcome is a result, so the sprint closes only when the close review has classified every item and debt entry, each classification mapped into the core, and the follow-up work is durable. | [§3](#3-sprint-rules); §1 [Sprints](#sprints) | the manifest fields, the sprint statuses, the escrow lists and the six close classifications and the debt outcomes with their mappings: domain choices of this member; whether debt may survive as follow-up: the governing method; the decision to offer a sprint as a batching carrier at all: a policy of this member | 1, 3, 9 |
| P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P2 (independent); P6 (independent); P3 (independent); P1 (independent) | By P4b the reason a ticket exists must survive the run, so a ticket records the triage that admitted it: change intent, change class and re-entry point. By P2 work re-enters where the authorised outcome is unmet, and by P1 a familiar file carries no authority, so the upward walk checks each layer and re-enters at the highest layer found missing or insufficient, never at a familiar file. | §4 [Required fields](#required-fields), [Types](#types), [Category](#category), [Change class](#change-class), [Upward propagation check](#upward-propagation-check), [Triage metadata](#triage-metadata), [One durable record per ticket](#one-durable-record-per-ticket) | the required fields and the minimum types and categories: domain choices of this member, which a project may extend; the change classes: domain choices of [SPEC_METHOD §4](SPEC_METHOD.md#4-change-management) | 1, 9 |
| P3 (independent); P6 (independent); P1 (independent); instance: several tenants | By P3 a lifecycle binds one exact subject, and each build tenant realises a separate subject, so one ticket closes at most one build-tenant lifecycle, and proof, closure, repricing and reopening stay tenant-local. By P6 one subject's evidence decides nothing for another, so one tenant's green status hides no other tenant's blocker. | §4 [Multi-build-tenant independence](#multi-build-tenant-independence); §6 [Multi-build-tenant review](#multi-build-tenant-review) | the suffixed ticket identifier and the `source_ticket` and `build_tenant` fields: domain choices of this member; tenant identity: the product definition's tenant registry | 1, 8, 9 |
| P6 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P3 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P2 (independent); P4a (independent); P1 (independent); instance: migrations | By P6 two truth paths cannot both hold authority over one scope, and by P5 an absence is shown only by evidence, so a migration ticket closes only when the old truth path no longer holds authority in its declared scope, shown by negative or structural proof. By P1 a proxy or wrapper that imitates the new path is not it, so mixed state, proxies, wrappers and green tests alone do not count; by P4a a downstream path depends on its source, so a downstream ticket does not close while its source-carrier ticket is open. By P2 each further local rebuild adds cost with no new route to the outcome, and by P3 similar code does not establish one identity, so a credible recurrence forces an explicit library or commonisation review, never an automatic merge. | §6 [Declaration and checklist](#declaration-and-checklist), [Closure of a migration ticket](#closure-of-a-migration-ticket), [Strategy requirements](#strategy-requirements), [Recurring realisation and library declaration](#recurring-realisation-and-library-declaration), [Review disambiguation](#review-disambiguation), [Impacted interface review checklist](#impacted-interface-review-checklist), [Break order and break-to-closure map](#break-order-and-break-to-closure-map), [Mixed-state negative proof](#mixed-state-negative-proof); §4 [Inside-out sequencing](#inside-out-sequencing) | the declaration, the checklist, the strategy and library values, the recurrence thresholds, the review questions and the break order: domain choices of this member. The migration law is [SPEC_METHOD §7](SPEC_METHOD.md#7-migration), not a choice | 4, 9 |
| P6 (independent); P1 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P5 (derived from P0 and P6, with P0's open-world premise); P0 (recovered); P2 (independent); P3 (independent) | By P6 authority to author is not independent authority to verify. By P1 and P3 a verdict means only the claim it binds, so a review verdict is bounded by its claim and traceable to it. By P0 and P4b a judgment or ruling must survive a change of actor, so it is recorded once, in its original terms, and reused while it applies; by P5 changed evidence invalidates what it affects. | §7 [Execution and verification authority separation (UP-007)](#execution-and-verification-authority-separation-up-007), [Recorded judgment and owner-ruling continuity](#recorded-judgment-and-owner-ruling-continuity) | the four repricing dispositions and the predicate and refinement for a material repricing decision: this member. The assessment protocol and the reuse law are [EVALUATION §3](EVALUATION.md#3-independent-assessment) and [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse), not choices | 7, 9 |
| P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise); P2 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable) | By P5 a claim is satisfied only by valid evidence for each obligation, under the conjunction of FOUNDATIONS §4, so a work claim is complete only when every applicable obligation is satisfied and no non-closure condition remains. By P6 review evaluates and does not decide, so its occurrence is not the closing event; by P6 a test's expected result needs work authority, so it comes from admitted work authority, never from the implementation. | §7 [Condition-based closure and reuse](#condition-based-closure-and-reuse), [Test case authority](#test-case-authority) | the five-step reconciliation order: this member. The conjunction and the general test law are [FOUNDATIONS §4](FOUNDATIONS.md#conjunction-of-results) and [ASSURANCE §3](ASSURANCE.md#3-test-authority), not choices | 3, 9 |
| P1 (independent); P3 (independent); P6 (independent); P5 (derived from P0 and P6, with P0's open-world premise) | By P1 a term's spelling carries no meaning, and by P3 it resolves under one context and basis, so a ticket's terms resolve under the project's semantic resolution. By P5 an unresolved or multiply resolved material term leaves the claim undecided, so it blocks admission and closure of the affected claim until its owner resolves it. | [Bounded-context term binding](#bounded-context-term-binding) | none here: the resolution law is [PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution) | 2, 6 |
| P2 (independent); P6 (independent); P3 (independent); P4b (derived from P0 and P2, with P0's premise that step-produced facts are not re-acquirable); P0 (recovered); instance: carriers vary | By P2 the method fixes only what the outcome needs, so any carrier shape that keeps the required fields and sections is lawful. By P0 an actor holds only bounded context, so it reads this member only for the question a derived surface leaves open. | [§8](#8-recommended-shapes); §9 [Operating mode](#operating-mode); the opening paragraph of this section | the three recommended shapes, the default local-file carrier and its search commands: domain choices of this member; a policy of this member: an actor reads this member only for the question a derived surface leaves open, applying ACTIVATION §2 Acquisition | 1, 6 |

The standing of these consequences is stated in
[FOUNDATIONS §3 Foundation to law](FOUNDATIONS.md#foundation-to-law).
The table accounts for §1 to §9, and for POSTING_GUIDE §2, §7 and §9,
which have no family table of their own.

Consumers of these rows, where an actor enters them (FOUNDATIONS §3
Foundation to law, Consumers), one list per row, each consumer linked to
its own locus:

- Row 1, the carrier for a lifetime: [SPEC_METHOD §4 Carriers](SPEC_METHOD.md#carriers), which selects a change's carrier for its required lifetime and takes the smallest lawful carrier from Carrier selection; [PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers), which binds where each carrier kind lives and selects none; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 41, where a proposed change to work carriers is judged under Carrier selection; [Recorded judgment and owner-ruling continuity](#recorded-judgment-and-owner-ruling-continuity), whose record lives in the carrier selected under §5.
- Row 2, execution under admitted authority: [ACTIVATION §1 Admission](ACTIVATION.md#admission), where a contract carries the states this section names and a carrier's presence, lane or label is never admission; the [ODD family table](ODD.md#foundation-to-law), whose row for the manual walkthrough imports F13 for admission against deterministic criteria.
- Row 3, one authority chain and its projections: [PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers), whose `ticketing` bindings locate the carriers and keep the work wave with goals, ticket state with the ticket and commentary outside authority; [§8](#8-recommended-shapes), where another shape is bound under §2 only with the same fields.
- Row 4, sprints as batches: [SPEC_METHOD §4 Sprint execution boundary](SPEC_METHOD.md#sprint-execution-boundary), whose close review takes its mechanics, escrow and classifications from §3, and [Change classes](SPEC_METHOD.md#change-classes), where a close classification that names a layer is a result mapped at §3 and carries the class at which the work re-enters; [UX §12 UX sprint compliance escrow](UX.md#ux-sprint-compliance-escrow), where each finding takes one of the six close classifications, [UX §15](UX.md#15-results-of-this-profile), which maps none of them again, and the [UX family table](UX.md#foundation-to-law), whose row for scaffold, exemption and escrow imports F13; [CONFORMANCE §5](CONFORMANCE.md#5-discriminator-coverage), discriminator 48, where a sprint status or classification decides no admission, compliance or closure; [Status](#status), where the sprint statuses are declared states and the close classifications are results mapped at §3; [Condition-based closure and reuse](#condition-based-closure-and-reuse), where sprint-close law still applies to a result recorded without review; [§8](#8-recommended-shapes), whose sprint manifest carries the fields of §3.
- Row 5, the triage a ticket records and the upward walk: [SPEC_METHOD §4 Change classes](SPEC_METHOD.md#change-classes), which has the class recorded on the carrier under §4 Change class; [Sprint admission](#sprint-admission), whose included tickets still record their triage metadata; [Carrier selection](#carrier-selection), whose ticket-shaped contract carries the required fields of §4; [§8](#8-recommended-shapes), whose ordinary ticket carries the required fields and triage metadata.
- Row 6, tenant-local lifecycles: [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding), Development of several tenants, where the independence of each tenant's ticket lifecycle and the review of its tickets are this section's; [PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers), which names the multi-build-tenant work-item relation in the build-tenancy context and whose tenant registry supplies tenant identity.
- Row 7, migration tickets: [DESIGN_MODULE §10 Recurrence extraction](DESIGN_MODULE.md#recurrence-extraction), which refines the recurrence rule of Recurring realisation and library declaration as a design-review obligation for a Product that adopts that profile; [Status](#status), where `migration_strategy` and `library_usage` are declared states of their carriers; [§8](#8-recommended-shapes), whose migration ticket carries the declaration and checklist of §6.
- Row 8, authority to author, to verify and to rule: [EVALUATION §3](EVALUATION.md#3-independent-assessment), which takes from UP-007 the boundaries at which independent assessment is required and relabels no self-review in a fresh context; [EXECUTIVE_BASELINE §10](EXECUTIVE_BASELINE.md#10-derived-reviewer-frame), [§12 step 4](EXECUTIVE_BASELINE.md#4-executive-evaluates-the-work-result) and [§17](EXECUTIVE_BASELINE.md#17-actor-binding-and-independence), and the [EXECUTIVE_BASELINE family table](EXECUTIVE_BASELINE.md#foundation-to-law), whose row for the Reviewer imports F13 for when independent assessment is required; [SPEC_METHOD §4 Computed classification and treatment](SPEC_METHOD.md#computed-classification-and-treatment), where the recorded J and O continuity rules are Recorded judgment and owner-ruling continuity's; [Recurring realisation and library declaration](#recurring-realisation-and-library-declaration), where a repricing input blocks no bounded claim unless the owning authority admits the follow-up.
- Row 9, closure by condition and test authority: [SPEC_METHOD §4 Consistency gate](SPEC_METHOD.md#consistency-gate), which applies the closure condition as the gate over a change span and the ticket-local test-case rule to a code and test mismatch, and [§9](SPEC_METHOD.md#9-evidence), which names the evidence the condition requires for a realisation claim; [EXECUTIVE_BASELINE §22](EXECUTIVE_BASELINE.md#22-closure), where a work item closes by this condition, and the [EXECUTIVE_BASELINE family table](EXECUTIVE_BASELINE.md#foundation-to-law), whose row for qualification and closure imports F13 for the closure condition; [ASSURANCE §3](ASSURANCE.md#3-test-authority), where the derivation of each test case from admitted work authority is Test case authority's; [Milestones and phase-scoped truth (UP-006)](#milestones-and-phase-scoped-truth-up-006), where each milestone is a work claim under the closure condition.
- Row 10, term binding: no separate consumer applies. The resolution law a ticket's terms resolve under is [PRODUCT_DEFINITION §5](PRODUCT_DEFINITION.md#5-bounded-context-semantic-resolution)'s, as the choice column states; the block on admission and closure acts inside Execution contract admission and Condition-based closure and reuse of this member, and no section of another member names this binding.
- Row 11, carrier shape and reading this member: no separate consumer applies. A project's carrier layout is bound under [PRODUCT_DEFINITION §8](PRODUCT_DEFINITION.md#8-what-how-and-work-carriers) and scaffolded by [§12](PRODUCT_DEFINITION.md#12-bootstrap), which name their own defaults and not these shapes; the reading rule applies ACTIVATION §2 Acquisition, as the choice column states, and no other section applies it.

Each consumer applies the rule and decides nothing the owning section does
not (P2, P6).

### Carrier selection

Every execution governed by this method uses one run-scoped execution
contract. The required lifetime of the work or obligation selects the
smallest lawful source carrier: first establish the applicable upstream
work authority, then select the first matching row below. For work inside
an admitted sprint the local carrier boundary is that sprint; otherwise it
is the current run (P2, P4b, P6).

| Condition | Execution-contract source | Durable-ticket decision |
|---|---|---|
| no applicable upstream work authority exists | no execution contract is admitted | do not create a ticket as substitute authority; stop or re-enter |
| applicable authority exists and an existing admitted ticket covers the exact work | derive the run-scoped contract from that ticket | reuse it; do not create another ticket |
| applicable authority exists, no exact admitted ticket covers the work, and the work or an open obligation needs independent state beyond the local carrier boundary | one durable ticket plus the run-scoped contract | create or update the ticket only under ticket-state authority |
| applicable authority exists, no exact admitted ticket covers the work, and the work stays inside one admitted sprint with no state required after sprint close | the sprint manifest plus one manifest-local iteration entry | do not create a durable ticket |
| applicable authority exists, no exact admitted ticket or sprint covers the work, and the work ends in the current run with no independent surviving state | an intake-drafted run-scoped contract | do not create a durable ticket |

"Ticket-shaped" describes the categorisation, closure criteria, proof
surface, non-closure conditions and the other required execution-contract
fields (§4, Required fields). It creates no durable ticket identity and no
ticket-lane state (P3).

Absence of a durable ticket neither requires nor authorises creating one.
An exact product-authorised work instruction may supply the upstream work
authority for a one-run contract; a generic request or a model-widened
scope cannot. A durable ticket is created or updated only when the table
requires surviving state and the actor holds ticket-state authority. An
explicit instruction from ticket-state authority to create a durable record
selects that durability; it does not admit an execution contract or widen
its upstream work authority (P6, P2).

The step side of admission is [ACTIVATION §1](ACTIVATION.md#admission) and
is defined there once: drafting versus admission inside one invocation, the
condition under which execution may begin, what admission may never be
inferred from (including ticket or sprint presence, lane placement and
`active` status), the coordinates an admitted result carries, the recording
of every result, withheld closure and residual obligation before return,
and refusal when no durable result and evidence surface is available. This
member adds the carrier side (P6, P4b). The admission mechanism and the
durable result and evidence surface are the ones the product definition
binds. When that surface is the ticket or the sprint manifest, the admitted
result with its coordinates is recorded there. A carrier's lane, status or
prose that asserts admission without those coordinates is not admission
evidence, and the contract it describes remains drafted or rejected.

When admission is absent or rejected, ACTIVATION §1 returns the missing
work authority without execution. Before that return, an obligation that
must survive the run is carried as follows (P4b, P6): it becomes a
sprint-local entry when its lifetime stays inside the admitted sprint;
otherwise it is recorded as a durable ticket, only under ticket-state
authority; where that authority is absent, it is retained in the
contract's named durable result and evidence surface or in an
already-authorised enclosing carrier, closure is marked withheld on
ticket-state authority, and the required re-entry is returned.

Execution and closure use the same admitted categorisation, criteria,
proof surface and non-closure conditions. The resulting state still flows
through proof, gap analysis and repricing (P6, P2).

### Execution contract admission

The runtime execution flow should treat a ticket, a sprint entry or a
drafted work contract as an admission candidate, never as automatic truth;
the contract carries at minimum the states named in ACTIVATION §1
(drafted, admitted, rejected, superseded). An admitted execution contract
should be recorded on the selected durable work carrier, including an event log
where the execution binding requires one. It is available to prompt assembly
where applicable, and to later closure checking, so that execution and
closure read the same admitted basis. A binding that requires an event log
still requires that log; a human or mixed binding may select another durable
carrier under [SPEC_METHOD §11](SPEC_METHOD.md#11-build-tenant-binding)
(P6, P4b). The refusal of self-certification
is ACTIVATION §1.

Admission validates a contract against its cited product outcome,
prerequisite or experiment basis and does not admit that basis (ACTIVATION
§1). Admission or renewal of the basis belongs to the authority owning the
selected goals work wave, or its explicitly bounded proxy, and stays
durably legible in the existing goals or ticket authority
([SPEC_METHOD §3](SPEC_METHOD.md#3-outcome-conservation)). A ticket's
`active` status, its lane, or an admitted or retained contract is therefore
never the admission of a growth basis (P6, P2).

### Evaluation criteria and non-closure conditions

An execution contract should expose both what counts as progress or
completion and what still counts as failure even when some local proof is
green. At minimum it should make `evaluation_criteria` and
`non_closure_conditions` visible. These are the local gain function for
the work (P6, P2).

For implementation migrations, typical non-closure conditions are: the old
authoritative path still passes in normal execution within the declared
affected scope; mixed old and new proof is still accepted; a proxy or
partial interface implementation still stands in the acceptance path;
competing or ambiguous executable authority remains reachable on the
claimed product acceptance path; ticket wording, product wording and proof
wording are not reconciled. These conditions are not optional commentary;
they are the anti-self-deception surface for execution (P6).

Residual implementation debt outside the claimed acceptance path is not by
itself a non-closure condition. It may be deferred only under the
path-relative authority and explicit disposition rules of
[SPEC_METHOD §7](SPEC_METHOD.md#constitutional-migration-options) (P2).

### Bounded-context term binding

Ticket and work-instruction terms resolve under the bounded-context
semantic resolution of PRODUCT_DEFINITION §5. A ticket may use an
unqualified term when its cited product, re-entry surface, execution basis
and affected scope select exactly one bounded-context meaning (P1, P3).

When a ticket spans contexts, or a material term has competing meanings,
the ticket cites the applicable product-definition disambiguation or the
owner-authorised import, translation, equivalence or disambiguation
carrier; it may reference that relation rather than duplicate it. Ticket
prose, actor familiarity, a matching glossary heading, tenant placement or
comment context cannot select meaning or transfer authority (P1, P6).

An unresolved or multiply resolved material term blocks execution-contract
admission and closure for the affected claim. Opening or updating the
ticket records the pressure and does not cure it; resolution re-enters at
the authority that owns the missing context or semantic relation (P1, P5).

## 6. Implementation migration

### Declaration and checklist

A ticket with `ticket_category: implementation_migration` carries both an
explicit migration declaration block and a hard migration checklist. Both
are part of the ticket authority, not optional commentary.
[SPEC_METHOD §7](SPEC_METHOD.md#7-migration) defines the migration law;
this category defines the minimum ticket-local declaration and checklist
that a reviewer can check before accepting a closure claim on one concrete
work item, and is the local enforcement surface for the inside-out
migration law of SPEC_METHOD §7 (P6, P4b, P3).

The declaration states: the migration strategy used for this work item; the
exact affected migration scope; every explicitly excluded or disjoint
product or compatibility scope with its deterministic routing relation; the
old truth path or superseded contract; the new truth path or authoritative
contract; the producer set for the old and the new path; the consumer set
for the old and the new path; every projection, report, status surface and
proof surface derived from that contract family; and the closure law for
the migration.

The ticket carries at least this checklist in live markdown form:

```md
## Migration Checklist

- [ ] exact affected migration scope is named
- [ ] excluded or disjoint Product and compatibility scopes are named with deterministic routing
- [ ] old truth path is named explicitly
- [ ] new truth path is named explicitly
- [ ] producer set for the new truth is listed
- [ ] consumer set for the new truth is listed
- [ ] projection/read-model surfaces are listed
- [ ] old truth path is removed or explicitly demoted from authority within the affected scope
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old/new behavior are removed or repriced
- [ ] recurring realization patterns are checked against existing library/commonization surfaces
- [ ] ticket declares library usage and names the governing library or rationale
- [ ] if the work exists in more than one build tenant, this backlog/active ticket carries only one tenant lifecycle and any sibling tenant work lives on its own suffixed ticket
- [ ] ticket wording, product wording, and proof claims are reconciled before closure
```

Where no excluded or disjoint scope exists, the second item is satisfied by
declaring that absence explicitly, as the migration example of §8 writes
it; silence does not satisfy it (P6).

The required fields are `migration_strategy`, with the values
`inside_out_hard_break` and `fundamental_re_adoption`, and
`library_usage`, with the values `none`, `consume` and `extend`. When
`library_usage` is `consume` or `extend`, the ticket names the governing
reusable library or commonisation surface in `governing_library`. When it
is `none`, the ticket explains in `library_rationale` that no existing
reusable surface applies, or that the pattern is still boundary-specific,
or that it is not yet a lawful recurrence or commonisation candidate (P3,
P2).

### Closure of a migration ticket

Closure is blocked while the old authoritative interface still passes in
normal execution within the declared affected scope, unless the ticket
explicitly declares a retained compatibility feature. A deterministically
routed, non-overlapping product scope outside the declared affected scope
remains governed by its own current authority (P6, P3). Accordingly: the
old path may not remain silently authoritative within the affected scope;
mixed old and new green tests do not count as migration completion; any
retained old path within the affected scope is named as compatibility
rather than current native truth; retained compatibility is justified in
the ticket itself, never inferred from surviving code; proxy or partial
implementations do not satisfy migration closure; and if a ticket was
marked `completed` and later review shows checked closure items are false
on the current tree, the ticket is reopened or an explicitly linked
successor ticket is created, because a false closure claim is a
ticket-method defect, not only a code defect (P6, P4b).

An intermediate product-slice milestone inside an open migration ticket may
be accepted under the path-relative promotion rule of SPEC_METHOD §7, which
also states how the slice's identity and acceptance criteria derive and
that ticket wording cannot narrow that authority away. The ticket-local
consequence: the ticket remains active and does not claim migration
closure until the migration checklist and the final closure law are
satisfied; its `active` status renews none of the accepted slice's
exhausted growth authority; and removal, demotion and closure-proof work
may continue within the bound SPEC_METHOD §7 states, further material
producer or consumer growth requiring another basis admitted under
SPEC_METHOD §3 (P2, P6; §1, Milestones).

### Strategy requirements

When `migration_strategy: inside_out_hard_break`, the ticket carries a full
best-guess interface inventory for the migrating contract family; the
ordered break sequence from the deepest source truth outward; the old seam
each break intentionally severs; and the negative proof expected for each
break (P4b, P6).

When `migration_strategy: fundamental_re_adoption`, the ticket carries the
explicit selection of fundamental re-adoption by the human product
authority; the comparison with bounded evolution across product value,
feedback latency, authority risk, reversibility, total cost and retained
predecessor semantics; the bounded abort or re-entry condition; the
sideways reference line or prior implementation boundary treated as source
material; the module and interface adjudication surface; and explicit
classifications for inherited modules, interfaces, carriers, projections
and proof surfaces, each `carry_across`, `redundant` or `rewrite`
([SPEC_METHOD §7](SPEC_METHOD.md#fundamental-migration) defines the three).
Unclassified inherited implementation blocks closure (P6, P3).

### Recurring realisation and library declaration

An implementation migration ticket declares whether the active boundary is
rebuilding a pattern locally, consuming an existing reusable library or
commonisation surface, or extending that surface before the local
implementation lands; `library_usage` records which (P2, P4a).

The recurrence rule is ticket law for every implementation migration
ticket, whichever profiles the Product adopts (P2, P4a): the second
credible recurrence forces an explicit
library or commonisation review; the third local rebuild is not acceptable
by default. If review shows the same realisation pattern already exists in
two module boundaries or tickets, a third local rebuild blocks
implementation unless the ticket declares `library_usage: consume`,
declares `library_usage: extend`, or links an explicit do-not-commonise
design decision in `library_rationale`. The preferred order is
boundary-local cleanup, then a tenant-local reusable library or
commonisation surface, then shared or common propagation only through
separate design re-entry (P2, P3). A Product that adopts DESIGN_MODULE
also applies its refinement,
[§10 Recurrence extraction](DESIGN_MODULE.md#recurrence-extraction),
which makes the same rule a design-review obligation and states what
counts as a commonisation candidate; it adds no rival threshold.

A reusable pattern discovered during the active ticket remains under the
second- and third-recurrence rules. Outside those rules and the current
claim's applicable hard stops it is repricing input: it does not block the
bounded claim or require a follow-up ticket unless the owning authority
admits that follow-up (P2; §7, Execution and verification authority
separation).

### Multi-build-tenant review

When the same work item is processed across several build tenants, review
of backlog and active tickets checks that each tenant has its own suffixed
ticket; each ticket names its `build_tenant`; each tenant ticket has its
own proof surface and closure law; one tenant's green proof does not stand
in for another tenant's closure; and reopening, repricing and successor
work remain tenant-local unless the upstream source, product or design
ticket itself must change (P3, P6;
§4, Multi-build-tenant independence).

### Review disambiguation

An implementation migration ticket makes the review problem concrete enough
that an implementor cannot land a rename, adapter, wrapper or happy-path
proof and claim source-truth migration (P6, P1). For a core-interface or
carrier migration the ticket should include a `Functional Review Criteria`
section, specific to the ticket, such that a reviewer should be able to
answer these generic questions:

1. Did the change replace control-flow-owned meaning with carrier-owned,
   algebra-owned, event-owned or otherwise admitted source truth?
2. Did the change reduce or remove a semantic centre, or only rename and
   relocate it behind helpers?
3. Is the new law expressed as a typed or closed carrier, contract or
   transition family rather than an open dict, string protocol or
   config-shaped surface?
4. Is the main step readable as a pure transform over admitted truth, or
   does it still contain orchestration that decides the law procedurally?
5. Are effects pushed to the edge, such as event emission, manifest
   publication, file or output publication, or operator delivery, instead
   of being mixed into source-truth interpretation?
6. Do downstream consumers pattern-match or otherwise consume the admitted
   carrier directly, or do they reconstruct truth from payloads,
   `.get(...)`, fallback defaults, raw text or legacy files?
7. Are projections and reports derived from event or source truth, or can
   they still close independently as a second authority surface?
8. If deterministic gates, validation or other deterministic checks exist,
   do they inform the current state without structurally blocking the
   lawful constructive or probabilistic path that the admitted contract
   permits?
9. If the same realisation pattern already exists elsewhere, does the
   ticket explicitly consume or extend a reusable library or commonisation
   surface rather than rebuild it locally again?

Passing tests do not satisfy this section by themselves. A slice that keeps
the same semantic centre alive behind typed wrappers, adapter-local policy,
old lists beside new algebra, fallback config or rehydrated dict payloads
still fails migration review even when public behaviour remains green
(P6).

### Impacted interface review checklist

For a core-interface, carrier or authoritative-contract migration, the
ticket includes an `Impacted Interface Review Checklist` before tests can be
used as closure evidence. The checklist is a named walk of every live
interface that can still bypass, reinterpret, replay or project the
migrating truth path (P4b, P6).
At minimum it should enumerate, where they exist: the source-carrier builder;
closure, register and projection builders; the deepest semantic kernel and
adapter boundaries; public wrappers and the bootstrap, replay, ingest,
resume and query entrypoints; prompt, report, projection and read-model
surfaces; constructor and materialisation paths; proof lanes and
negative-proof fixtures.

Each checklist item states what counts as closure for that interface, for
example:

- "`<conformance-module>::consume_projection` consumes the admitted carrier
  or projection and does not import raw helper authority"
- "`<query-module>::project_domain` exposes a read model only and does not
  silently rebuild the carrier when publication is absent"
- "`<gap-module>::build_canonical_gap` does not aggregate open payload rows
  into an independent closure decision"

Review rules (P6): a checked box asserts truth on the current tree, not
intended direction; if review shows a checked interface item is false, the
ticket is not closure-ready; an intentionally deferred interface either
names its successor ticket or stays unchecked; compatibility shims do not
satisfy the checklist unless explicitly justified as retained
compatibility; for `inside_out_hard_break` the checklist describes the
seam inventory before tests are used as closure evidence; for
`fundamental_re_adoption` the checklist covers the inherited modules and
interfaces being carried, dropped or rewritten, and implicit carry-forward
does not count.

### Break order and break-to-closure map

An implementation migration ticket that touches a core interface includes
a `Required Break Order` or an equivalent ordered execution section. The
order starts at the authoritative source carrier and moves outward
(P4b, P6;
[SPEC_METHOD §7](SPEC_METHOD.md#hard-break-discipline)):

1. discover the full best-guess interface family;
2. publish or admit the new source carrier;
3. deliberately sever one old authoritative seam and keep it broken;
4. rebind the deepest semantic kernel to that carrier;
5. remove or demote old producers;
6. rebind old consumers;
7. reprice projections, reports, prompts, delivery bindings and tests.

When the migration has several old interfaces, the ticket also includes a
`Break-To-Closure Map` stating which break closes which closure-law clause;
without it a partial landing can look like a full landing (P6).

Reviewers treat these as explicit defects: a typed wrapper that still
carries old semantic authority; a new carrier added beside the old
authoritative read model; a proxy or partial implementation that keeps the
old interface alive behind a new name; constructor, replay, ingest, resume,
bootstrap or public-wrapper paths that bypass admission; a projection or
test that can pass without the new carrier; a fallback path that invents
missing policy, identity, target or closure truth; a downstream proof that
passes while upstream source-carrier work remains open (P6, P3).

### Mixed-state negative proof

For a migration ticket, positive behaviour proof is not enough. The proof
surface should include at least one negative or structural proof that
the old path can no longer satisfy the closure law (P6, P5). Examples: the severed seam in the current
break is rejected before downstream repair is accepted as progress;
removing the new carrier makes advancement, closure, prompt assembly or
projection fail closed rather than silently fall back; a legacy payload
without the admitted carrier is rejected instead of rehydrated into current
truth; old and new truth intentionally disagree in a fixture and the new
truth wins or the run fails closed; a same-name carrier, published
function, route, policy or projection source with different structure fails
closed instead of being accepted as equivalent; required closure proof
does not depend on undeclared local fixtures or mutable sibling workspaces.

If the old path still works in normal execution within the declared
affected scope, or remains reachable on the claimed acceptance path, the
ticket remains open unless that path is explicitly specified as retained
compatibility. A deterministically routed, non-overlapping product scope
outside the declared affected scope remains governed by its own current
authority and does not block the migration merely because its path still
works (P3, P6).

For a ticket with an `Impacted Interface Review Checklist`, the negative
proof exercises the named public consumers that matter for closure. Proving
that one legacy shim is bypassed is not sufficient when the live authority
path already bypasses that shim through other helpers, loaders or rebuild
paths (P4b, P6).

## 7. Authority, judgment, closure and state

The generic law is tier 1: a constructor's self-review is construction
output and the independent-assessment protocol is
[EVALUATION §3](EVALUATION.md#3-independent-assessment); acceptance as the
decision owner's disposition, and closure by stated condition rather than
by reviewer approval, is [EVALUATION §5](EVALUATION.md#5-acceptance); reuse
of a closed result is [ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse).
This section states what those laws require of work carriers.

### Execution and verification authority separation (UP-007)

Authority to author or implement a change is not independent authority to
verify it. What counts as independent, including that the reviewer is
not the author of the reviewed subject, and the protocol an independent
assessment follows are
[EVALUATION §3](EVALUATION.md#3-independent-assessment). Where
independent review is required, the reviewer identifies the exact
subject, basis, scope, exclusions, evidence, verdict and unresolved
findings (P6). Review
findings must cite current authority and the code or proof paths they
rest on, not only historical commentary (P6, P1).

Self-review remains useful authoring evidence and cannot be relabelled as
independent. Human authority may accept or reject the claim; it does not
make implementer self-review independent. The boundaries at which this
method requires independent assessment are this member's policy, which
EVALUATION §3 names; a governing basis may add others, as that section
states. Independent review is required at
product, qualification, release and explicitly risk-bearing boundaries that
claim it, not for every local implementation step (P6, P2).

A claimed independent review may support promotion or closure only when its
exact subject and verdict are durably traceable through an existing ticket,
commentary, qualification or release-evidence carrier. A statement that
review occurred, an unbound conversation summary or an unavailable draft is
not the review verdict. This rule requires no separate receipt, carrier or
review round (P6, P4b).

A ticket's review verdict is bounded by the exact reviewed claim and its
applicable hard stops. When a finding blocks current promotion, and what a
valid observation outside that boundary does, are stated once at
[EVALUATION §5 When a finding blocks promotion](EVALUATION.md#when-a-finding-blocks-promotion);
this carrier applies that section to a ticket's review and adds no
trigger (P2, P6).

A direct or lawfully proxied human ruling receives a durable disposition
before the next affected acceptance boundary. Its source wording stays
distinct from agent interpretation. Opening a ticket records the
obligation and does not satisfy it, and an agent cannot widen the ruling
while recording it (P6, P4b).

Where the agentic construction relation applies (ACTIVATION §1, bound to
this method by [SPEC_METHOD §8](SPEC_METHOD.md#8-bounded-execution-in-this-method)),
the active work item identifies the selected execution basis, the bounded
affected relation set, the delegated construction and assessment authority,
and the re-entry conditions. It may point to accepted design and existing
evidence carriers rather than restate them. Ticket state, ticket prose or
an admitted execution contract cannot widen that basis or substitute for
the live-surface assessment the relation requires (P6, P0).

The reviewable transition (ACTIVATION §7, Transition evidence) may be
carried by an existing ticket, commentary, commit, qualification or
release-evidence surface. No new ticket state, document type, review round
or approval ceremony is required. This member carries selection and
traceability; ACTIVATION §1 and SPEC_METHOD §8 own the execution semantics
(P2, P6).

### Recorded judgment and owner-ruling continuity

A residual judgment that another activation needs is recorded once, with
its owning work, in the existing carrier selected under §5. The record
identifies the question; the exact subject and governing basis; the
supporting computed facts and evidence; the responsible actor and its
authority; the conclusion and its scope; the uncertainty; and a concrete
revising observation that lets a consumer determine whether the conclusion
still applies. A question settled by rule needs no invented J record (P4b,
P6; C, J and O are
the annotations of [SPEC_METHOD §4](SPEC_METHOD.md#computed-classification-and-treatment)).

Later roles and resumed runs recover the result and check its
applicability rather than re-author unchanged judgment. Reuse and
invalidation are
[ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse): changed material
inputs, a declared revising observation or a changed basis invalidate
the affected result, preserving the original result and its successor
relation and keeping only demonstrably independent results, and a new
role or conversation alone invalidates nothing. For a recorded judgment
the material inputs include its supporting computed facts and evidence,
and its declared revising observation is the one the record states;
reassessment covers what the change affects. The result may reference
current C outputs; reuse cannot silently turn unknown facts into
established premises (P4b, P5). Required independent assessment may consume valid C, but
its assessor acquires sufficient exact evidence and supplies its own
judgment under the actual independence condition; reusing the author's J
cannot satisfy that condition (P6; EVALUATION §3).

A direct or lawfully proxied owner ruling is recorded in its original
wording, with its owner, exact subject and basis, permitted scope and
effects, conditions and source, separately from agent interpretation. Later
work consumes that same ruling while it applies; it neither widens the
ruling nor requests unchanged authority again. New ambiguity or a
materially changed decision returns only the affected question to its
owner. J is not O, and recording either cannot create admission,
acceptance, effects or continuation beyond the original grant (P6, P3).

These results follow the lifetime of the existing run, sprint or durable
ticket and its named result and evidence surface. They require no separate
judgment registry, no ticket per judgment and no additional approval
ceremony (P2).

Repricing gives each affected obligation a disposition in that same
carrier: retained, superseded, deferred or withdrawn, with its owning
authority and applicable evidence links. Surviving work is preserved and
changed dependencies are explained; unaffected history is not copied into
a parallel ledger. An owner decision is presented as the short consequence
delta needed to decide it, with the original ruling preserved separately.
A general instruction to continue does not accept an undisclosed
architectural or scope change (P4b, P6, P2).

The four repricing dispositions are lifecycle states of an obligation,
set by its owning authority. A state label is not an evaluation result and
has no automatic core mapping. A material repricing decision is the separate
owner decision that establishes one such state for an exact obligation,
subject and basis. Its record names the chosen disposition, the decision
owner and grant, the governing conditions, evidence, affected dependencies,
remaining obligations and any conditions for revisiting the decision (P3,
P4b, P6).

A performed evaluation of that decision answers the predicate: **the named
owner lawfully establishes the recorded disposition for this exact
obligation, subject and basis, with every applicable condition satisfied
and every surviving obligation preserved.** This is the repricing predicate
owned here; it is not candidate acceptance under
[ACTIVATION §3 Disposition](ACTIVATION.md#disposition), and it does not claim
that the underlying work was delivered. The result retains the decision,
its chosen state and its evidence, and refines the core values of
[FOUNDATIONS §4 Results](FOUNDATIONS.md#results) as follows:

| Repricing result | Core value | Meaning for the repricing predicate |
|---|---|---|
| `repricing_established` | satisfied | the exact applicable owner decision, authority, evidence and preservation of surviving obligations establish the predicate |
| `repricing_falsified` | falsified | a counterexample defeats the predicate, including a disposition outside the actor's grant or contrary to an applicable obligation |
| `repricing_indeterminate` | indeterminate | admissible evidence cannot decide whether the decision meets an applicable condition; the undecided condition and needed evidence remain explicit |
| `repricing_out_of_frame` | out_of_frame | a material relation or capability needed to evaluate the decision is undeclared in the frame; the missing relation or capability remains explicit |
| `repricing_invalid_basis` | invalid_basis | the decision is evaluated on an absent, stale, ambiguous or mismatched required basis that cannot support the predicate |

An evaluation that was not performed has no result. The evaluation records
all applicable failure grounds and supplies no decision authority; the
state changes only through the owner's authorised act. A lawful deferral
may therefore yield `repricing_established` while the delivery claim remains
failed or outstanding. An unauthorised `withdrawn` label cannot close an
obligation. Neither retention nor a satisfied repricing predicate establishes
delivery, and a superseded, deferred or withdrawn state cannot erase
unresolved obligations or evidence (P5, P1, P6).

### Condition-based closure and reuse

A work claim is complete only when every applicable declared obligation is
satisfied by valid evidence for its exact subject, basis and scope; every
required judgment and owner ruling is present and applicable; and no active
non-closure condition remains. A mandatory obligation whose applicability is
unknown, or whose evidence is insufficient, withholds the dependent claim;
evidence presence alone is not satisfaction. The existing owner decides any
reserved acceptance (P6, P5).
This condition is the
[conjunction of results](FOUNDATIONS.md#conjunction-of-results) with the
declared obligations as required coverage. This section owns the
closure condition of a work claim;
[SPEC_METHOD §4 Consistency gate](SPEC_METHOD.md#consistency-gate)
applies it as the gate over a declared change span.

Review evaluates these conditions; its occurrence is not the closing event.
Where applicable law requires no independent review or reserved
acceptance, a work claim is recorded as
[ACTIVATION §1 Roles and delegation](ACTIVATION.md#roles-and-delegation)
states in Recording a result without review, with the ticket as the
existing carrier. The conditions that still apply include sprint-close
law (§3) and the design profile's law (P6, P2).

An unchanged obligation reuses valid applicable evidence and recorded J
and O under the reuse rule of
[ACTIVATION §7](ACTIVATION.md#7-closed-result-and-reuse). For a work
claim, the changed material inputs and revising observations that rule
names include a material counterexample, changed evidence and a stated
revising observation of a recorded J; with a changed basis, each
invalidates the affected claim and its dependent results before further
reliance. An unrelated observation is retained as bounded repricing input;
it does not reopen a satisfied claim or expand the work automatically.
Closure recording preserves the exact evaluated scope, the satisfied
conditions, the evidence and the remaining residuals (P4b, P2).

### Test case authority

Tests are proof projections from admitted work authority. Every
substantive test case should derive along this chain (P6, P2):

```text
ticket -> intake triage -> lawful re-entry point -> governing requirement,
design, module, published function, carrier, or closure surface -> test expectation
```

Tests do not derive authority from the current implementation. An
acceptance predicate also needs an applicable supported entry or state and
an obligation under the governing operating or threat model. Existing test
presence cannot authorise an excluded threat or retain a superseded guard.
When that responsibility changes, the affected predicates are audited, and
unsupported expectations are retired under the owning basis without
inventing a replacement guard. An actual conflict in live authority
requires re-entry, not a test-only waiver (P6, P2).

Implementation behaviour is evidence. The code is never the arbiter of a
test's expected result when code and test disagree (P6). When a ticket is
fixed and a mismatch appears between implementation behaviour and test
expectation, review reconciles the mismatch in this order:

1. the ticket's `change_intent`, `change_class`, `re_entry_point`,
   `target_truth`, `superseded_truth`, `closure_law`,
   `evaluation_criteria` and `non_closure_conditions`;
2. the ticket's intake triage and lawful owning re-entry;
3. the governing requirement, design, module, published-function, carrier
   or other cited authority surface;
4. the test case expectation;
5. the implementation.

The implementation may show that a test is stale, incomplete or too
narrow; it cannot by itself authorise changing the expected result.
Changing a test only because the current code behaves differently is a
ticket-method defect. A test that predates a lawful ticket repricing is
updated or removed only after naming the governing ticket and the authority
change that superseded the old expectation. If the ticket is stale,
ambiguous or missing the authority needed to decide the expectation, the
work re-enters triage (§4) before either the code or the test is treated as
correct. A passing test is closure evidence only when its expectation
traces back to the admitted ticket and its governing authority chain (P6,
P4b). The general test authority law is ASSURANCE §3; this clause is its
ticket-local rule.

### One-truth state projection and drift refusal (UP-009)

Work state has one authority chain: goals own the bounded work wave, the
ticket owns ticket state, milestone authority owns subordinate milestone
state (§1), and accepted design owns realisation decisions. Comments,
dashboards, registers, indexes and generated summaries are projections
(P6, P3).

Recency, visibility or repetition does not turn a projection into truth.
Contradiction between the owning ticket, its required milestones, the
current goals or the cited acceptance evidence blocks closure. Superseded
evidence remains history and cannot be projected as current acceptance
(P6, P4b).

## 8. Recommended shapes

These shapes are the recommended carriers of the fields and sections the
rules above require; a project may bind another shape that carries the
same fields (§2; P3, P4b).

The sprint manifest, carrying the fields of §3:

```md
# SPRINT-2026-04-30 Operational Projection UX Iteration

- id: SPRINT-2026-04-30-operational-projection
- status: active
- goal: operational-projection-ux
- opened_at: 2026-04-30T09:00:00Z
- updated_at: 2026-04-30T09:00:00Z

## Authority

- specification/GOALS.md#operational-projection-ux
- specification/PRODUCT.md#operational-projection
- <governing-design-surface>/OPERATIONAL_PROJECTION.md

## Scope

Iterate an operational projection surface for layout, readability,
interaction affordance, and visual evidence quality.

## Excluded Boundaries

- no product truth changes
- no data contract changes
- no runtime or governance semantics changes
- no new constructive carrier

## Expected Change Classes

- realization_refactor

## Iterations

- id: UXI-001
  intent: improve relation-line readability
  evidence_ref: screenshots/2026-04-30/UXI-001.png
  debt: accessibility contrast check pending

## Closure

- closure_trigger: timebox, changed surface volume, or design-lead close request
- closure_law: forensic walkthrough reviews each changed state against authority
- proof_surface: screenshots plus walkthrough notes
- deferred_compliance: screenshots, accessibility check, event-replay review
- non_closure_conditions: product truth or data contract drift remains hidden
- paydown_policy: open paydown tickets for accepted local debt; reprice authority drift
```

An ordinary ticket, carrying the required fields and triage metadata of §4:

```md
# T-001 Add Product Layer To SPEC_METHOD

- id: T-001
- type: feature
- ticket_category: ordinary
- status: active
- goal: methodology-bootstrap
- change_intent: make the product-definition layer explicit in the constitutional chain
- change_class: product_reprice
- re_entry_point: product
- triaged_at: 2026-04-07
- priority: high
- created_at: 2026-04-07
- updated_at: 2026-04-07

## Context

`SPEC_METHOD.md` included intent and requirements flow but omitted the explicit
product-definition layer.

## Acceptance

- `PRODUCT.md` is part of the constitutional chain
- bootstrap sequence includes `intent -> product -> requirements`
- examples and reconstruction logic reflect the new layer

## Links

- comment: `.ai-workspace/comments/<agent-id>/...`
```

An implementation migration ticket, carrying the declaration, fields and
checklist of §6:

```md
# B-010 Replace Mixed Gap Projection With One Authoritative Carrier

- id: B-010
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- library_usage: none
- library_rationale: this migration is boundary-specific and does not establish a recurring realization pattern
- status: active
- goal: operator-gap-truth
- change_intent: replace the mixed operator gap truth with one authoritative declared carrier
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-20
- created_at: 2026-04-20
- updated_at: 2026-04-20

## Migration Declaration

- affected_scope: gap projection on the declared operator-query acceptance path
- excluded_or_disjoint_scopes: none
- old_truth_path: fallback gap projection with synthetic convergence fields
- new_truth_path: explicit declared-obligation projection plus separately classified fallback gaps
- producers_old: `<gap-module>::build_fallback_gap`
- producers_new: `<obligation-module>::collect_declared_obligations`, `<gap-module>::build_canonical_gap`
- consumers_old: `<query-module>::project_gaps`, `<summary-module>::project_span`, `<review-surface>::render`
- consumers_new: `<query-module>::project_gaps`, `<summary-module>::project_span`, `<review-surface>::render`
- derived_surfaces:
  - `<query-surface>::gaps`
  - `<summary-surface>::span`
  - `<proof-surface>::first_slice_negative`
- closure_law: migration closes only when the old projection is no longer authoritative within the affected scope and mixed old/new proof does not count as acceptance

## Migration Checklist

- [ ] exact affected migration scope is named
- [ ] excluded or disjoint Product and compatibility scopes are named with deterministic routing, or explicitly declared absent
- [ ] old truth path is named explicitly
- [ ] new truth path is named explicitly
- [ ] producer set for the new truth is listed
- [ ] consumer set for the new truth is listed
- [ ] projection/read-model surfaces are listed
- [ ] old truth path is removed or explicitly demoted from authority within the affected scope
- [ ] mixed-state behavior is no longer accepted as closure evidence
- [ ] tests proving mixed old/new behavior are removed or repriced
- [ ] recurring realization patterns are checked against existing library/commonization surfaces
- [ ] ticket declares library usage and names the governing library or rationale
- [ ] if the work exists in more than one build tenant, this backlog/active ticket carries only one tenant lifecycle and any sibling tenant work lives on its own suffixed ticket
- [ ] ticket wording, product wording, and proof claims are reconciled before closure
```

## 9. Operating mode and relationships

### Operating mode

The default local-file carrier assumes that humans and agents can read the
active ticket folder directly; that backlog remains searchable durable work
without competing with the active lane for immediate attention; that `rg`
is sufficient for finding active work; and that no database or board is
required (P0, P2). Typical commands for that carrier:

```bash
rg -n "^#|^- status:|^- type:|^- goal:".ai-workspace/tickets/active
rg -n "^#|^- status:|^- type:|^- goal:".ai-workspace/tickets/backlog
rg -n "T-001|B-002".ai-workspace/tickets
```

### Relationship to other surfaces

Each surface answers one question (P3, P6). The goals surface: what broad work wave
matters now. SPEC_METHOD: what constitutional change class and re-entry
point govern the work. Sprints: what bounded execution batch is currently
pricing proof, evidence and paydown. Tickets: what durable units of work
exist and what state they are in. Comments: what was proposed, argued,
decided, reviewed or handed off. POSTING_GUIDE: how comment-layer
publications are structured and named.

The separation prevents goals becoming an overloaded backlog; active work
being diluted by every deferred ticket; comments becoming informal task
status; and task boards becoming accidental authority (§2, §7).
