# ADR-024 — Markov as a First-Class Node Field

**Implements**: REQ-L-GTL2-NODE

## Status
Accepted

## Context

`markov` is part of the authored graph contract. It expresses declared state and acceptance conditions at a node locus. The runtime renders and interprets those conditions in prompts, manifests, and evaluation surfaces, but it does not own them.

`markov` is not accidental runtime metadata. It is part of the authored graph contract and is used to express:
- upstream state guarantees on source loci
- expected satisfied conditions on target loci
- artifact truth / acceptance framing in prompts, manifests, and evaluation surfaces

## Decision

`markov` is a first-class field on `gtl.graph.Node`.

Canonical shape:

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
4. Runtime code reads from `Node.markov`.
5. Future richer condition typing is allowed, but the public term markov remains stable.

## Consequences

- Existing scenario expectations around source_markov and target_markov remain valid.
- GTL keeps the concept where it belongs: in the language declaration surface.

## Non-Decision

This ADR does not yet define a richer typed model for individual markov clauses.
For now, `tuple[str, ...]` is sufficient and preserves the existing authored meaning.
