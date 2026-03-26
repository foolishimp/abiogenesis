# ADR-024 — Preserve `markov` as a First-Class V2 Node Field

**Implements**: REQ-L-GTL2-NODE

## Status
Accepted

## Context

Phase 4e rewires the runtime from V1 `Asset/Edge/Package` to V2 `Node/GraphVector/Graph/Module`.

The current engine still depends on legacy `Asset.markov` in prompt assembly and manifest generation. V2 `Node` currently lacks a `markov` field, which creates a semantic loss risk during rewiring.

`markov` is not accidental runtime metadata. It is part of the authored graph contract and is used to express:
- upstream state guarantees on source loci
- expected satisfied conditions on target loci
- artifact truth / acceptance framing in prompts, manifests, and evaluation surfaces

## Decision

`markov` is retained as a first-class field on `gtl.graph.Node`.

Canonical V2 shape:

```python
@dataclass(frozen=True)
class Node:
    name: str
    schema: type | str = ""
    markov: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

## Rules

1. markov remains constitutional vocabulary.
2. markov is node-owned, not graph-owned, vector-owned, or engine-owned.
3. Runtime prompts/manifests may render markov, but must derive it from Node.
4. Compatibility bridges must map Node.markov → Asset.markov exactly.
5. Native V2 runtime code must read from Node.markov, not from legacy Asset.markov.
6. Future richer condition typing is allowed, but the public term markov remains stable.

## Consequences

- Phase 4e can migrate Job from Edge to GraphVector without losing acceptance semantics.
- Existing scenario expectations around source_markov and target_markov remain valid.
- graph_adapter can preserve semantics during transition.
- GTL keeps the concept where it belongs: in the language declaration surface.

## Non-Decision

This ADR does not yet define a richer typed model for individual markov clauses.
For now, `tuple[str, ...]` is sufficient and preserves the existing authored meaning.
