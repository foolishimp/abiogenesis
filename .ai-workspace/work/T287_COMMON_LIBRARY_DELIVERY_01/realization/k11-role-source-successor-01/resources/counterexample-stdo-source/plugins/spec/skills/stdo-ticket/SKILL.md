---
name: stdo-ticket
description: Create or update one governed STDO work item. Use when a user says stdo ticket or explicitly asks to ticket, open, or update an STDO-governed request, bug, failed test, finding, or release issue. Do not invoke for read-only classification.
---

# STDO Ticket

Turn an intake into one durable work carrier without starting implementation.

## Select The Product Basis

Read and apply
[`PRODUCT_BASIS.md`](../../references/PRODUCT_BASIS.md) before proposing or
mutating ticket state. Continue only from its exactly-one verified selection;
that selection grants no ticket-state authority.

## Procedure

1. From the verified definition and installed basis, read Goals, Intent,
   Product, affected requirements, accepted design, ticket bindings, and
   relevant existing work. Acquire owning sections under the selected basis's
   `ACTIVATION.md` section 2, Acquisition; intake triage and change classes
   are `SPEC_METHOD.md` section 4, ticket fields `TICKETS.md` section 4.
2. Confirm explicit authority to create or update ticket state. Without it,
   return proposed triage and stop without writing.
3. Create or update a durable ticket only when the work or an open obligation
   needs independent identity, handoff, dependency, reopening, repricing, or
   closure beyond its admitted sprint or, when no sprint applies, beyond the
   current run, or when the user explicitly requests that durable record. Do
   not create a ticket merely because execution needs a run-scoped contract.
4. Identify the affected Product boundary and first changed layer.
   Consume source-bound computed owner/layer routes, complete relevant Public
   membership/value comparison and accepted-design trace coverage where
   available. Keep absent mappings or evidence explicitly unknown. Reuse a
   still-applicable classification judgment; record any residual judgment and
   its supporting facts once in this carrier. A nonconforming candidate can
   require repair under unchanged law; it does not itself select requirement
   repricing.
5. Select the smallest lawful change class: `goal_reprice`, `intent_reprice`,
   `product_reprice`, `requirement_reprice`, `design_reframe`, or
   `realization_refactor`.
6. Select type and category from the exact Product policy. Under base
   TICKETS, types are `feature`, `bug`, `spike`, or `chore`; categories are
   `ordinary` or `implementation_migration`.
7. Resolve the Product-bound lanes. Create or update one unique durable ticket
   with the exact base fields:

   - `id`, `title`, `type`, `ticket_category`, `status`, `goal`,
     `change_intent`, `change_class`, `re_entry_point`, `triaged_at`,
     `created_at`, and `updated_at`.

   For execution admission also bind `target_truth`, relevant
   `superseded_truth`, `closure_law`, `evaluation_criteria`,
   `non_closure_conditions`, and `proof_surface`. Record the affected boundary,
   governing authority, dependencies, source ticket, or build tenant where
   applicable.

8. Treat the ticket as an execution-contract source candidate, never as its own
   admission evidence. Report the derived execution-contract state as `drafted`
   unless deterministic admission or an exact human override of that contract
   is independently evidenced. Ticket creation, lane placement, and `active`
   status do not change that state.
9. Keep commentary and generated summaries subordinate to the ticket. Assign
   priority only under Product-owned policy and decision authority. When the
   Executive baseline profile is adopted, do not turn Reviewer technical severity
  directly into Executive Product priority.

For an authorized state update, evaluate the ticket's actual closure condition:
satisfied obligations, valid applicable evidence, required judgments and owner
rulings, and no active non-closure condition. Review checks that evidence when
required; occurrence of review is not the closing event. Record reusable
judgments with their question, subject/basis, support, actor/authority,
conclusion, uncertainty and revising observation. Preserve an owner's original
ruling separately from interpretation and invalidate only affected support,
under the invalidators of `ACTIVATION.md` section 7.
Use this ticket's existing proof/result routes; do not create a judgment registry.
When repricing, give each affected obligation a retained, superseded, deferred
or withdrawn disposition with its owner and applicable evidence. Preserve
surviving work and changed dependencies without duplicating unaffected history.
Present a short consequence delta for the owner decision; a general instruction
to continue does not accept undisclosed architecture or scope changes.

## Return

Return the ticket path and compact triage: boundary, change class, re-entry
point, scope, target truth, closure law, non-closure conditions, proof surface,
derived execution-contract state and evidence, and next decision. Do not edit
requirements, design, code, or tests unless the user separately authorizes
execution.
