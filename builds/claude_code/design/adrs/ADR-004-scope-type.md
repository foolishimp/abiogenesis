# ADR-004: Scope Type — No Ambient Inference

**Status**: accepted
**Date**: 2026-03-15
**Derives from**: 20260315T070000_STRATEGY_abiogenesis-approved-execution-plan.md (Phase 1)

## Decision

Every command requires an explicit `Scope` object. Ambiguous scope fails closed.

```python
@dataclass
class Scope:
    package: Package       # GTL Package — the topology
    workspace_root: Path   # filesystem root
    feature: Optional[str] # feature vector ID (None = all features)
    edge: Optional[str]    # edge name override (None = topological selection)
    build: str             # build identity (default: "claude_code")
```

`/gen-gaps` with no explicit scope: requires `--feature` or fails with an error message
explaining which scopes exist. It never infers from ambient workspace heuristics.

## Rationale

- Ambient scope inference creates hidden state — the same command produces different
  results depending on workspace conditions the user didn't specify
- `Scope` is a value object — immutable, serialisable, auditable
- V1 single-tenant: `build = "claude_code"` always; multi-tenant deferred to V2

## Consequences

- All three commands take `Scope` as first parameter
- CLI flags `--feature` and `--edge` map directly to Scope fields
- Missing `--feature` when multiple features exist: informative error, not a guess
- V2 extension: `Scope.tenant` field added here when multi-tenant scheduling arrives
