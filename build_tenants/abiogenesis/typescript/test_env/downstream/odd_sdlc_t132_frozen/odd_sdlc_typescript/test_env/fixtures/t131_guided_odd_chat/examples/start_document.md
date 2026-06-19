# Example Start Document — Branch Lobby Kiosk

This is a sample source document used by the T-131 odd_chat smoke tests. It
feeds the `document_to_requirements` deployed domain so the
`observe_document → derive_requirement_candidates → accept_requirements`
lawful actions have a concrete input to operate on.

The document is intentionally short, mixed-clarity, and contains both clear
constraints and ambiguous wording so the `observe_document` step has real
work to do (named claims, named ambiguities, named missing context).

## Context

A regional retail bank wants to install a self-service kiosk in each branch
lobby. The kiosk will answer routine product questions, hand off complex
cases to a teller, and never give personalised financial advice.

## Goals

- Customers waiting in the branch lobby can ask basic product questions and
  get correct answers without joining the teller queue.
- A branch manager can disable the kiosk at any time without involving IT.
- The kiosk must not provide personalised advice and must hand off to a
  teller when an interaction is out of scope.

## Constraints

- Operates on the bank's existing branch network; no external cloud
  dependencies during a customer interaction.
- All customer-facing answers must cite an internal product document.
- All interactions are logged for compliance review.
- The kiosk language must match the branch's primary regional language.

## Open Questions

- Should the kiosk be authenticated against the customer's account, or
  remain anonymous?
- What is the upper bound on response latency the branch manager will
  accept before it is considered "slow"?
- Does the compliance log need to retain the question text verbatim, or
  only a category code?

## Stakeholders

- Branch manager (operates the kiosk, can disable it).
- Customer (interacts with it).
- Compliance officer (reviews logs).
- IT operations (installs, patches, monitors the kiosk).
