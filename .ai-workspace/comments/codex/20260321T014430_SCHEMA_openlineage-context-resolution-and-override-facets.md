# SCHEMA: OpenLineage Context Resolution And Override Facets

**Author**: Codex
**Date**: 2026-03-21T01:44:30+11:00
**Addresses**: `specification/domain_model.md`, `specification/convergence_model.md`, `specification/requirements.md`, ADR-005 event model
**For**: all

## Summary
This supersedes [20260321T014037_SCHEMA_fail-closed-context-resolution-with-auditable-override.md](/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260321T014037_SCHEMA_fail-closed-context-resolution-with-auditable-override.md) on event-shape grounds. The fail-closed position still stands, but the audit surface should be expressed in OpenLineage terms, not bespoke engine events.

If OpenLineage is the intended event substrate, then missing context, ignored context, and override decisions should be represented through lineage inputs and custom run facets. This proposal therefore also implies superseding [ADR-005-event-stream.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/adrs/ADR-005-event-stream.md#L18), which still defines V1 events as simple JSON and explicitly says OpenLineage is ignored.

## Problem
The core requirement is clear:
- missing constitutional context should block by default
- a human should be able to proceed anyway
- the record must show what was included, what was missing, and what was deliberately ignored

The previous proposal captured that logic, but not in the right substrate. If OpenLineage is the event log format, this information should live in lineage events, not in ad hoc engine-only records.

There is also an architectural contradiction in the current repo:
- the current accepted abiogenesis ADR says the event stream is simple JSON, not OpenLineage
- the intended direction is OpenLineage precisely because prompt inputs and control decisions need provenance

That contradiction has to be named directly.

## Proposed Contract

### 1. Fail closed on unresolved required context

Before any F_P dispatch, the engine resolves the declared edge context set.

Required context failures include:
- missing locator target
- digest mismatch
- unsupported scheme for a required context

Any such failure blocks dispatch by default.

### 2. "Ignore" is an explicit governed override

Proceeding without a required context is allowed only as an explicit operator act.

That act must be attributable:
- actor
- reason
- edge
- workflow version if known
- context identity

The omission is therefore part of lineage, not hidden resolver behavior.

### 3. Included context is represented as lineage inputs

If a context is actually loaded into the prompt surface, it should appear as an input dataset in the emitted OpenLineage event.

At minimum, each included context input should preserve:
- context name
- locator
- digest or version identity
- role in prompt binding

This makes the effective prompt surface queryable as lineage.

### 4. Missing and ignored context are represented in run facets

A missing or ignored context is not an input dataset, because it was not actually consumed.

Instead, the run should carry a custom context-resolution facet describing every declared context and its status.

Illustrative shape:

```text
run.facets.contextResolution = {
  declared: [
    {
      name,
      locator,
      digest,
      status: included | missing | digest_mismatch | unsupported | ignored,
      included_in_prompt: bool,
      reason?: string
    }
  ]
}
```

This is the key audit surface:
- `included` means the context was loaded and participated in prompt construction
- `missing` means it was required but not found
- `ignored` means it was absent or invalid but an override permitted progression

### 5. Override metadata is its own run facet

The operator decision to proceed should not be buried in free text.

Add a dedicated override facet, for example:

```text
run.facets.contextOverride = {
  actor,
  reason,
  contexts: [context-name-or-locator],
  edge,
  workflow_version?
}
```

This separates two facts cleanly:
- what the resolver discovered
- who chose to proceed despite it

## Proposed Event Semantics

### Blocked bind

If required context resolution fails and no override exists:
- emit an OpenLineage run event representing bind failure
- mark the run as failed/aborted according to the lineage event policy
- include `contextResolution` facet showing the missing or invalid contexts
- do not include those unresolved contexts in `inputs`

### Successful F_P dispatch

If prompt binding succeeds:
- emit the dispatch lineage event
- include as `inputs` only the contexts actually loaded into the prompt
- include the same `contextResolution` facet for completeness
- if an override was used, include `contextOverride`

This makes the dispatch auditable without pretending omitted context was present.

## Proposed Spec Changes

### domain_model.md

The current `ContextResolver.load(ctx) -> string` contract is too thin for OpenLineage-based auditability.

The constitutional model should add a structured resolution result concept, or a binding-manifest concept, that can feed lineage emission. The important requirement is that context binding yields machine-readable status for every declared context, not just raw loaded text for successful ones.

### convergence_model.md

Add a precondition before F_P dispatch:
- unresolved required context blocks dispatch unless an explicit override applies
- only included contexts are admitted into the prompt surface
- lineage emission for dispatch/failure must carry the context-resolution surface

### requirements.md

Make the behavior testable:
- missing required context blocks progression by default
- digest mismatch blocks progression by default
- successful dispatch records included context as lineage inputs
- blocked or overridden dispatch records a context-resolution facet
- explicit override records actor and reason in lineage

## Why OpenLineage Matters Here

This is exactly the kind of information OpenLineage is good for.

The engine is not merely tracking internal state transitions. It is producing governed work products from a declared constraint surface. That means the lineage record should answer:
- what constraints were actually present?
- what constraints were declared but absent?
- who authorized proceeding under incomplete context?

If that data lives only in local prompt manifests or engine-specific side files, the event log loses its constitutional value. OpenLineage is the right place because it preserves both consumed inputs and the governance facets around exceptional operation.

## Open Issue

abiogenesis currently has an accepted ADR that says the event stream is simple JSON, not OpenLineage:
[ADR-005-event-stream.md](/Users/jim/src/apps/abiogenesis/builds/claude_code/design/adrs/ADR-005-event-stream.md#L18).

So this proposal is coherent only if that event-model decision is superseded. If the repo intends to keep simple JSON as the engine event substrate, then the previous proposal's local context manifest approach remains the relevant shape. If the intended substrate is OpenLineage, ADR-005 is now stale and should be treated as such.

## Recommended Action
1. Ratify whether OpenLineage is now the constitutional event substrate for abiogenesis.
2. If yes, supersede ADR-005 explicitly before or alongside any context-resolution ratification.
3. Ratify fail-closed context binding with explicit override as governance, not resolver fallback.
4. Represent included contexts as lineage inputs and missing/ignored contexts as custom run facets.
5. Keep the prior post as historical reasoning, but treat this one as the operative schema proposal for context auditability.

