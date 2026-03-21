# SCHEMA: Fail-Closed Context Resolution With Auditable Override

**Author**: Codex
**Date**: 2026-03-21T01:40:37+11:00
**Addresses**: `specification/domain_model.md`, `specification/convergence_model.md`, `specification/requirements.md`, context-loading ambiguity in current tenant builds
**For**: all

## Summary
Missing constitutional context should be a real failure, not a sentinel string silently fed into the prompt surface. But "ignore and proceed" is also a legitimate operator action if it is explicit, auditable, and attached to the specific transition being attempted.

I propose a fail-closed default with an auditable override path. Every prompt-binding step should produce a context manifest that records which contexts were included, missing, or explicitly ignored, and the event stream should record that manifest whenever an iteration is blocked or an F_P dispatch occurs.

## Problem
The current ambiguity is not just whether missing context is fatal. It is that the system has no ratified way to distinguish:

- included context
- missing context
- context deliberately ignored by a human/operator
- digest-mismatched context

That makes omission invisible. A prompt can be bound on an incomplete constitutional surface without leaving a clean audit trail of what was absent and whether that absence was tolerated intentionally.

If context matters constitutionally, that is not acceptable.

## Proposed Contract

### 1. Context resolution fails closed by default

Resolving an edge's `context` list should produce a hard failure for any of these cases:

- `workspace://` target missing
- digest mismatch
- unsupported scheme invoked where the spec says the context is required

This failure should occur before any F_P dispatch.

The engine should not substitute a placeholder string into the prompt and continue as if the constitutional surface were intact.

### 2. "Ignore" is an explicit override, not fallback behavior

Proceeding without a context must be a deliberate operator action.

That means:
- the default engine behavior is to stop
- a human may authorize continuation
- the authorization must be recorded in the event stream

Ignoring a context is therefore a governed exception, not a resolver feature.

### 3. Every binding attempt produces a context manifest

Prompt-binding should materialize a manifest describing the effective context surface of that iteration.

Proposed manifest entry shape:

```text
ContextBinding:
  name: string
  locator: string
  digest: string
  status: one of {included, missing, digest_mismatch, unsupported, ignored}
  included_in_prompt: boolean
  reason: string?
```

For a complete binding attempt, the manifest records all declared contexts, not only the successful ones.

This solves the auditability problem directly:
- included contexts are named
- missing contexts are named
- ignored contexts are named and justified

### 4. Event recording references the manifest

The event stream should record context state at the point it matters operationally.

Recommended rule:
- when binding fails due to context resolution, emit `found{kind: context_gap}` and include either the manifest payload or a manifest path/hash
- when F_P is dispatched, `fp_dispatched` must likewise reference the context manifest used for that dispatch

This keeps the event stream auditable without requiring large inline prompt payloads everywhere.

### 5. Override must be scoped and attributable

The override should be specific, not ambient.

It should bind to:
- edge
- workflow version if known
- context name or locator
- actor
- reason

A suitable governance shape is either:
- a new approval form such as `approved{kind: "context_override", ...}`
- or an explicit override field on the event emitted by the controlled CLI path

The important point is not the exact event name. The important point is that the choice to proceed without context must be attributable and replayable.

## Proposed Flow

### Normal path

1. `bind_fd` or equivalent attempts to resolve all declared contexts.
2. A context manifest is produced.
3. If all required contexts resolve cleanly, the prompt is bound and dispatched.
4. `fp_dispatched` records the manifest reference.

### Failure path

1. One or more required contexts are missing or invalid.
2. A context manifest is produced with failure statuses.
3. The engine emits `found{kind: context_gap}` and stops.

### Override path

1. A human/operator explicitly records an override for the missing/invalid context.
2. The next binding attempt sees the override.
3. The context manifest marks the context as `ignored`, not `included`.
4. F_P dispatch proceeds, and the dispatch event records the same manifest reference.

This makes "ignore" visible without pretending the context was present.

## Proposed Spec Changes

### domain_model.md

Amend `ContextResolver` so the contract is not just `load(ctx) -> string`.

Either:
- introduce a `ContextBinding` / `ContextResolution` type and make resolution return structured metadata

or:
- keep `load(ctx) -> string` as the primitive but add a required higher-level binding structure that records resolution results for all contexts before prompt assembly

The current model is too thin for auditability.

### convergence_model.md

Add context binding as a formal precondition for F_P dispatch:

- unresolved required context blocks F_P
- explicit override can convert a blocking missing context into an auditable omission
- prompt construction consumes only `included` contexts, never `missing` placeholders

### requirements.md

Add or amend requirements so they make these conditions testable:

- missing required context blocks iteration
- digest mismatch blocks iteration
- blocked iteration emits a machine-readable context-gap record
- F_P dispatch records which contexts were included and which were ignored
- override requires actor and reason

## Why This Is The Right Meaning

This proposal preserves two things at once:

- constitutional rigor: missing context is a real defect
- operational pragmatism: a human can still say "proceed anyway"

The crucial distinction is that "proceed anyway" becomes a visible governance act instead of an invisible resolver downgrade.

That is the right shape for a methodology engine. It should not hide constitutional incompleteness, but it also should not trap operators in an all-or-nothing world when informed exception handling is needed.

## Recommended Action
1. Ratify fail-closed context resolution as the default.
2. Ratify an auditable override path for intentional omission.
3. Add a structured context manifest concept to the constitutional surface.
4. Require `found{kind: context_gap}` or equivalent when binding is blocked by context failure.
5. Require `fp_dispatched` to record the manifest actually used for prompt binding.

