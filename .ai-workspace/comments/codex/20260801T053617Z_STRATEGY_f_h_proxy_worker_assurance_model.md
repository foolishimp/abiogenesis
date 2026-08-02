# STRATEGY: F_H Proxy Worker Assurance Model

**Author**: codex
**Date**: 2026-08-01T05:36:17Z
**Addresses**: ABIogenesis delivery delegation, independent worker control, F_H review and approval proxy
**Status**: Closed

## Summary

This post records the operating model for delegated ABIogenesis delivery. The
worker delivers independently. The Codex executive acts as the F_H review and
approval proxy: it verifies live authority, forensically reviews exact frozen
subjects, identifies drift and defects, and alone authorizes routine stage
transitions. F_H receives concise status and genuine Product decisions rather
than acting as the manual intermediary for ordinary delivery controls.

This is enduring commentary, not ratified specification, design, or method.

## Roles

### Worker

The worker:

- performs only the currently authorized stage;
- reviews donor material without treating it as authority;
- produces the exact artifact required by that stage;
- freezes one exact review subject;
- reports its commit, tree, scope, evidence, and known limitations; and
- stops without entering the next stage.

The worker does not approve its own design, plan, implementation, proof, or
stage transition.

### Codex as F_H proxy

The proxy:

- reads the live authority surfaces and repository state directly;
- reviews the exact artifact rather than relying on the worker's summary;
- traces local code through module authority, producer and consumer paths,
  durable events, Event Calculus, restart projection, Product requirements,
  and axiomatic constraints;
- reports defects with file, function, violated relation, global consequence,
  and required outcome;
- records approval on the active control surface before authorizing the next
  stage; and
- returns only genuine Product, requirement, repricing, or underdetermined
  design choices to F_H.

The proxy is not a second implementation loop. It does not silently design a
repair during code review, convert donor precedent into authority, or use an
executive ruling to bypass an unadvanced ticket stage.

### F_H

F_H retains decisions that change Product meaning, requirements, accepted
design authority, release scope, or the lawful re-entry point. F_H should not
need to police routine stage order, restate approval envelopes, reconcile
worker summaries with the tree, or detect ordinary scope drift.

## Delivery Control Loop

```text
live authority selects stage
  -> worker produces one exact stage artifact
  -> worker freezes and stops
  -> F_H proxy independently reviews exact subject
  -> PASS | REJECT | DESIGN RE-ENTRY
  -> approval is recorded on the active surface
  -> worker receives one bounded next-stage authorization
```

The selected delivery cycle is:

```text
design
  -> donor review
  -> exact file/relation coding plan
  -> approval
  -> build
  -> forensic code review
  -> test review and execution
  -> next slice
```

Conversation does not advance a stage by itself. The live ticket must select
the stage before work begins.

## Mandatory Transition Check

Before authorizing any transition, the proxy verifies:

1. the current branch, HEAD, tree, and worktree state;
2. the selected stage in the active ticket;
3. the exact output required from the preceding stage;
4. the frozen subject identity;
5. the approved files, relations, consumers, deletions, tests, and non-goals;
6. every outstanding review disposition; and
7. that approval is recorded before the worker starts the next stage.

Any stale stage, unresolved `BLOCKED` result, unapproved file expansion,
premature implementation, or changed frozen subject rejects advancement.

## Forensic Code Review

Code review is an active-surface review, not a summary review. It evaluates:

```text
function
  -> module authority
  -> producer and consumer reachability
  -> durable event admission
  -> Event Calculus truth
  -> replay and installed fresh-process reconstruction
  -> Product requirement
  -> axiomatic constraint network
```

The review must specifically test for:

- rival authority hidden behind a shared helper or projection name;
- direct raw-event folding outside Event Calculus;
- projection from mutable live process state instead of an explicit verified
  durable prefix;
- incomplete identity or authority-scope coordinates;
- weakened collision, refusal, masking, or isolation controls;
- retained legacy or process-local paths that remain reachable;
- generic metadata or schema-less semantic expansion points;
- scope expansion into unapproved modules or feature families;
- donor leakage and compatibility facades;
- tests whose oracles reproduce current implementation behavior; and
- fresh-process tests that prove existence but not equality of reconstructed
  truth.

Mechanical success cannot override an architectural or axiomatic violation.
A build, clean diff, passing test, stable digest, or absent export is evidence
only for the relation it actually proves.

## Coding Plan Contract

Before production implementation, the approved coding plan names:

- exact files to add, change, and delete;
- the single authority relation being realized;
- admitted producers and projected consumers;
- durable-prefix and Event Calculus boundaries;
- migration and reachability closures;
- refusal and collision behavior;
- exact tests and their governing oracles;
- donor relations adopted, corrected, and rejected; and
- explicit non-goals and prohibited expansion.

New modules, exports, event kinds, schemas, metadata, consumer families, or
authority carriers require plan reapproval unless already named.

## Review Dispositions

The proxy returns exactly one substantive disposition:

- `PASS`: the exact frozen subject may enter the named next stage.
- `REJECT`: the exact subject fails with bounded findings. No repair-forward
  authority exists unless separately granted.
- `DESIGN RE-ENTRY`: implementation stops because accepted authority cannot
  determine a lawful correction.

Every earlier `BLOCKED` finding receives an individual recorded disposition.
It cannot disappear inside a later aggregate summary.

If the proxy materially selected or designed the construction, it cannot be
the sole independent approver of that construction. An independent review is
required before PASS.

## Incident Lesson

Commit `96b131c1b38f62caac73199e6d6313afd4499b19` demonstrated the failure mode.
Implementation was permitted while the active ticket still selected
`donor_review`; a prior blocked review was not fully discharged; mechanical
checks substituted for authority review; and code review occurred after a
candidate had already been frozen. The commit was rejected, preserved only as
donor evidence, and active implementation authority returned to `50e8a5c7`.

The governing lesson is:

> Progress is accepted, independently reviewed Product slices—not commits,
> changed files, passing builds, stable digests, or time spent.

## Recommended Use

Reference this post when delegating an independent delivery worker to a Codex
F_H proxy. Apply the control loop before work begins. If the model is to become
shared reusable law, submit it through shared-method intake and ratification;
do not promote this commentary by precedent.
