# Ticket Layer README

This folder is the local ticket authority for `abiogenesis`.

It is a practical, project-local projection of:

- [TICKET_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md)
- [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md)

It exists so the work-tracking rules are visible at the point of use, not only
in the central methodology repo.

## Purpose

This ticket layer is for durable work-item tracking.

Tickets here are used for:

- bugs
- features
- spikes
- chores

Each ticket is one markdown file and is the source of truth for that unit of
work.

This folder is not for:

- broad epic framing
- strategy notes
- reviews
- handoffs
- closure summaries

Those belong elsewhere:

- `specification/GOALS.md` is the epic/work-wave layer
- `.ai-workspace/comments/` is the discussion/publication layer

## Authority

Within this repo:

- `.ai-workspace/tickets/active/` is the authority for currently active tickets
- `.ai-workspace/tickets/completed/` is the authority for completed tickets

There is no separate board or status file that overrides these folders.

If a generated board or summary is added later, it is a projection only and not
the source of truth.

## Folder Semantics

### `active/`

Tickets in `active/` are live work records.

They may be:

- in analysis
- in implementation
- blocked on dependencies
- awaiting proof or release handling

If a ticket is still an active unit of work, it stays in `active/`.

### `completed/`

Tickets in `completed/` are closed work records.

When a ticket is completed:

1. update the ticket content and status
2. add any needed closure note
3. move the file from `active/` to `completed/`

Marking a ticket completed while leaving it in `active/` is not method-clean.

## Required Shape

Each ticket should record at least:

- `id`
- `title`
- `type`
- `status`
- `goal`
- `created_at`
- `updated_at`

Recommended additions:

- `priority`
- `dependencies`
- `links`
- `completed_at` when closed

## Method Boundary

Tickets do not replace constitutional method surfaces.

Before substantive work begins, the change still needs intake triage under
`SPEC_METHOD.md`, including:

- affected boundary
- lawful change class
- lawful re-entry point
- downstream proof span

The ticket records that durable work item.

The ticket does not bypass the method.

## Relationship To Comments

Use `.ai-workspace/comments/` for:

- strategy papers
- reviews
- handoffs
- proposals
- reasoning
- closure publications

Use tickets here for:

- tracking the durable unit of work itself

Comments may link to tickets.
Tickets may link to comments.
But comments are not task-status authority.

## Naming

Recommended ticket filename pattern:

- `B-001-some-bug.md`
- `T-003-some-feature.md`
- `S-004-some-spike.md`
- `C-005-some-chore.md`

The filename should carry:

- stable id
- short slug

## Operating Notes

Typical local inspection commands:

```bash
rg -n "^#|^- status:|^- type:|^- goal:" .ai-workspace/tickets/active
rg -n "B-001|T-003" .ai-workspace/tickets
```

When in doubt:

- put active work in `active/`
- move closed work to `completed/`
- put discussion in `.ai-workspace/comments/`
- put epic framing in `GOALS.md`
