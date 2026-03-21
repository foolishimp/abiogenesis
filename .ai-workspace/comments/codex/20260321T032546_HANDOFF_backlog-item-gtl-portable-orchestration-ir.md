# HANDOFF: Backlog Item Draft For GTL Portable Orchestration IR

**Author**: Codex
**Date**: 2026-03-21T03:25:46+11:00
**Addresses**: backlog capture for GTL portability/interoperability direction
**For**: claude

## Summary
This is a backlog-ready draft, aligned to `.ai-workspace/operating-standards/BACKLOG.md`, for capturing the GTL portability/interoperability direction without promoting it into active intent work yet.

No existing `BL-*.yml` items were present when I checked, so this proposes `BL-001`. Write it into `.ai-workspace/backlog/BL-001.yml` if you want it tracked formally.

## Backlog Draft

```yaml
id: BL-001
title: Preserve GTL as portable orchestration IR
status: idea
created: 2026-03-21
updated: 2026-03-21
notes: |
  Problem this solves:
  Preserve GTL as a backend-neutral orchestration representation so the same
  workflow semantics can execute across different stacks without rewriting the
  workflow meaning.

  Why this matters:
  The long-term direction includes multiple F_P workers, consensus between
  workers, dynamic workflow assembly from intent vectors, and movement between
  local and distributed execution stacks. If GTL becomes tied to one runtime,
  that portability is lost.

  Current architectural direction:
  GTL representation should be treated as the canonical orchestration IR.
  Execution stacks are backend realization targets. Candidate targets discussed
  so far include:
  - local in-process orchestration
  - AWS-native orchestration (Step Functions, Fargate, Bedrock, EventBridge)
  - Temporal
  - Prefect

  Interoperability requirement:
  Portability requires standardized handoff interfaces between orchestrators,
  workers, and runtime technologies. The primary handoff surface should be the
  event bus. OpenLineage is the chosen forward event substrate, so event/facet
  semantics must remain portable across backend targets.

  Main interface areas that would need to be standardized:
  - worker dispatch contract
  - worker result contract
  - event emission contract
  - projection/observer consumption contract

  What's uncertain:
  - how much of the compiler contract belongs in GTL itself vs backend adapters
  - whether projection semantics should be fully backend-independent or permit
    backend-specific enrichment layers
  - what the minimum standard worker interface should be
  - whether consensus semantics belong in the GTL core or an overlay package
  - how local and distributed builds should be tested for semantic equivalence

  What would need to be true before promotion:
  - the current spec/build boundary cleanup is complete
  - the OpenLineage event direction is reflected in the constitutional surface
  - there is a clearer view of the minimum execution semantics that every
    backend target must preserve
  - there is agreement that backend compilation is a strategic direction rather
    than an implementation curiosity

  Related work:
  - 20260321T032006_SCHEMA_gtl-as-portable-orchestration-ir.md
  - 20260321T030917_STRATEGY_local-dynamic-event-driven-orchestration-stack.md
  - multi-worker / consensus / dynamic workflow assembly discussions
```

## Recommended Action
1. If you want this formally tracked, write the YAML above to `.ai-workspace/backlog/BL-001.yml`.
2. Keep it as `idea` until the spec/build cleanup and OL event-model cleanup are further along.
3. Promote it only when you are ready to treat GTL backend compilation and interface standardization as active architecture work rather than future direction.

