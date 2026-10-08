---
kind: authority_compression_asset
asset_ref: authority-compression://stdo/ticket-method/v1
source_ref: ../TICKET_METHOD.md
source_digest: f031ce7fb3b5b366ffaee5996ae76e861697ad86897cc04c06b67da249fe0eca
compression_profile: prompt_authority_compact_v1
target_prompt_families:
  - transform
  - evaluate_design_depth
  - evaluate_review_grade
generated_by: codex
generated_at: 2026-09-20
stale_if_source_digest_changes: true
---

# TICKET_METHOD Compressed Authority

## Governing Claim

A ticket is a durable work carrier. Every execution uses a distinct run-scoped
execution contract with explicit intake, smallest lawful re-entry, target truth,
superseded truth, closure law, non-closure conditions, proof, and admission
state. Required carrier lifetime decides whether that contract derives from a
durable ticket, a sprint-local entry, or an intake draft.

## Carrier-Binding Compression

- The applicable `stdo_<label>.json` Product Definition Overlay locates
  `ticketing.goals`, the ticket root and backlog/active/completed lanes, the
  comments root, and an optional sprint root.
- `.ai-workspace/` and one Markdown file per ticket or sprint are the default
  local carrier, not universal repository layout.
- Another repository or tracker carrier is lawful only when it preserves stable
  identity, the complete required contract, history, state transitions,
  searchability, closure, and one authoritative record without a co-equal copy.
- Reuse an existing admitted ticket when it covers the exact work. Use a
  manifest-local iteration entry when admitted-sprint work needs no state after
  sprint close. Use an intake-drafted run-scoped contract when work is outside
  a sprint, bounded to one run, and needs no independent surviving state.
- After upstream work authority is established, use the first applicable
  carrier in this order: exact admitted ticket; durable ticket for state beyond
  the admitted sprint or, outside a sprint, beyond the current run; sprint-local
  entry; one-run intake draft. Create or update a durable ticket only under
  ticket-state authority. Without upstream work authority, stop rather than
  creating a ticket as substitute authority.
- An explicit instruction from ticket-state authority may select a durable
  record. It does not admit execution or widen upstream work authority.
- `Ticket-shaped` describes execution-contract fields. It does not create
  durable ticket identity, ticket-lane state, or execution admission.
- Comment carriers may be local or external but remain commentary. Their
  visibility, recency, or location cannot turn them into ticket state or
  Product, requirement, or design truth.

## Build-Tenancy Compression

- An upstream-only work item needs no tenant duplicate. A single-tenant work
  item needs only its one tenant execution ticket.
- When one admitted upstream work item has more than one tenant execution line,
  retain the upstream source, Product, or design ticket and create one suffixed
  tenant-local ticket per build tenant.
- Each tenant ticket names `source_ticket` and `build_tenant` and carries its
  own status, proof surface, closure law, reopening, and repricing.
- `build_tenant` identifies the applicable Product Definition Overlay's
  `how.build_tenants` entry; a path or display alias is insufficient unless the
  overlay binds it as the identity.
- One tenant's green proof or closure cannot close, hide, or substitute for
  another tenant's lifecycle. Tenant-local pressure remains local unless it
  requires a change to the upstream authority.

## Prompt-Relevant Rules

- Do not treat ticket prose as product truth when requirements or design already
  own the matter.
- Resolve material ticket terms through their bounded-context identity, owning
  authority, selected basis, and affected scope. Unqualified use is lawful only
  when those coordinates select exactly one concept.
- A cross-context or multiply defined term cites the applicable Product
  Definition Overlay disambiguation or owner-authorized semantic relation.
  Ticket prose, glossary match, actor familiarity, comments, and tenant location
  cannot select meaning. Unresolved or multiply resolved material meaning
  blocks execution-contract admission and affected closure.
- Use neutral capability and authority identities in reusable method examples.
  A downstream Product or implementation may supply evidence for its own
  ticket; it does not become constitutional precedent.
- Use tickets to identify active work scope, closure law, proof obligations,
  and open pressure.
- Absence of a durable ticket neither requires nor authorizes creating one. A
  generic request to work cannot admit model-widened scope or substitute for
  upstream work-wave authority.
- Draft, validate, admit, and execute may occur in one invocation. Drafting and
  admission remain distinct; no separate turn, ticket, or approval ceremony is
  required. A drafted or rejected contract stops before execution.
- Ticket creation, lane placement, and `active` status do not admit an execution
  contract. The drafting model cannot self-admit; deterministic admission or an
  exact human override remains required. The admitted result names its
  Product-bound mechanism and authority, exact contract identity or digest,
  decision, and evidence.
- Every admitted contract names one Product-bound durable result/evidence
  surface. Record every result, withheld closure, and residual there before
  return; a conversation return alone is insufficient. Without that authorized
  surface, admission refuses.
- A surviving obligation becomes durable only when it outlives the local
  carrier boundary: the admitted sprint when inside one, otherwise the current
  run. Without ticket-state authority, retain it in the contract's named durable
  result/evidence surface or an already-authorized enclosing carrier, withhold
  closure, and return re-entry pressure rather than manufacturing or losing a
  ticket.
- A ticket closes only when its closure law is met and every non-closure
  condition is avoided or explicitly repriced.
  Every applicable obligation must actually be satisfied by valid exact
  evidence, required judgments and owner rulings; evidence presence and review
  occurrence alone do not close it. An authorized Writer may record a
  sufficient bounded result directly when no independent or reserved condition
  applies. Preserve applicable sprint-close and design-method obligations.
- Triage consumes the source-bound computed walk owned by
  `SPEC_METHOD.md#computed-classification-and-treatment`; missing coverage
  evidence is unknown, not proof that a requirement or design is absent.
  Candidate nonconformance permits repair/rejection under sufficient unchanged
  law; changed desired meaning or established insufficiency re-enters its owner.
- Record a reusable residual judgment once in the existing carrier with its
  question, exact subject/basis, supporting C/evidence, actor/authority,
  conclusion/scope, uncertainty and revising observation. A rule-settled
  question needs no invented J. Preserve original owner rulings and their
  conditions separately from interpretations; consume sufficient existing
  authority without asking for it again. Neither record creates authority.
- Reuse valid support across roles and resumption. A material invalidator
  revises affected claims; preserve unrelated support only where independence
  is established. Shared C does not replace a required assessor's independent
  acquisition and judgment. Use the existing carrier lifetime and proof route,
  with no new judgment registry or ticket per decision.
- Repricing dispositions each affected obligation as retained, superseded,
  deferred or withdrawn in the existing carrier with owner/evidence links.
  Preserve surviving work and changed dependencies without copying unaffected
  history. Present a short consequence delta for decision; preserve original
  owner wording separately. "Continue" accepts no undisclosed architecture or
  scope change.
- A test predicate needs a supported entry/state and governing obligation under
  the operating/threat model. Audit affected predicates when responsibility
  changes; existing tests cannot authorize an excluded threat or retain a
  superseded guard. Unsupported expectations need no replacement guard; a
  conflict in live authority returns to its owner.
- Review findings must cite current authority and code/proof paths, not only
  historical commentary.
- Prompt migration work must update tickets when the prompt contract itself is
  the work item.
- Milestone acceptance proves only its bounded claim; design, implementation,
  qualification, and release remain distinct closure boundaries.
- Implementer self-review is not independent review. Human acceptance does not
  relabel it. An independent-review claim supports promotion or closure only
  when its exact subject and verdict are durably traceable in an existing
  ticket, commentary, qualification, or release-evidence carrier; no separate
  receipt or review round is required.
- A review finding blocks when it falsifies the exact claim, contradicts
  causally applicable authority, exposes competing or ambiguous authority,
  violates safety or retained accepted behavior, or establishes a durable
  architectural decision that forecloses an admitted Product outcome. Other
  observations are repricing input and do not automatically widen the subject
  or require another ticket, artifact, review, or implementation increment.
- Execution-contract admission validates against a cited growth basis; it does
  not admit or renew that basis. Admission or renewal belongs to the Goals
  work-wave owner or explicitly bounded proxy and remains durably legible in
  existing Goals or ticket authority.
- Where Agentic Construction Execution applies, the active work item identifies
  the selected execution basis, bounded affected relations, delegated
  construction and assessment authority, and re-entry conditions. It may cite
  accepted design and existing evidence rather than restating them. Ticket
  state, prose, and execution-contract admission cannot widen that basis or
  substitute for required live-surface assessment.
- Existing ticket, commentary, commit, qualification, or release evidence may
  carry the transition. Do not create a ticket state machine, mandatory artifact,
  review round, or approval ceremony. Ticket Method carries selection and
  traceability; Spec Method owns execution semantics.
- A Product-slice milestone may close under singular authority across the full
  causal closure of its acceptance path while its enclosing migration remains
  visibly active. Its claim cannot exclude causally applicable Product,
  requirement, design, or retained-predecessor authority. Slice acceptance does
  not satisfy migration closure, and active ticket status does not renew the
  slice's exhausted growth authority. Bounded retirement proof may continue;
  material producer or consumer growth requires another live admitted basis.
- Fundamental re-adoption requires the ticket to bind the explicit human
  selection, comparison with bounded evolution, and abort or re-entry
  condition.
- A migration ticket binds its exact affected scope plus every excluded or
  disjoint Product or compatibility scope and deterministic routing relation.
- Ticket and milestone truth outrank comments, dashboards, indexes, and other
  state projections; contradiction blocks closure.

## Fallback Rule

If this compressed asset is insufficient, read the raw ticket method only for
the named unresolved lifecycle/proof question and cite the source lines used.
