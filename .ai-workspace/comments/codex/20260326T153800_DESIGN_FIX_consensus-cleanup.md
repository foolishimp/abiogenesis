# Consensus Cleanup Design Fix

## Problem

The current Claude design surface is internally inconsistent:

- the authority says `Consensus` is not prime GTL ontology
- the code still defines a first-class `Consensus` type
- the module design currently says `consensus()` should return a `Rule`

That last point is the real error. A `Rule` nested inside another `Rule.config`
is not compression. It increases abstraction and makes the model less clear.

## Correct V2 Design

`Rule` is the only prime GTL declaration for declarative constraints.

`consensus()` is convenience sugar for building gate approval config.

`Consensus` is not a public GTL type.

## Canonical Shape

Use this shape:

```python
@dataclass(frozen=True)
class Rule:
    name: str
    kind: str = "policy"
    config: dict = field(default_factory=dict)
    tags: tuple[str, ...] = ()


def consensus(n: int, m: int) -> dict:
    """Sugar for gate approval config."""
    if n < 1 or m < 1 or n > m:
        raise ValueError(f"consensus({n}/{m}): n must be 1..m")
    return {"kind": "consensus", "n": n, "m": m}
```

And authored usage remains:

```python
Rule(
    name="standard_gate",
    kind="gate",
    config={"approve": consensus(1, 1), "dissent": "recorded"},
)
```

This keeps:

- `Rule` as the only prime declarative constraint type
- gate behavior inside `Rule.config`
- `consensus()` as convenience sugar only
- no standalone `Consensus` ontology

## Why This Is The Right Compression

This is consistent with the active law:

- `REQ-L-GTL2-RULE-001`: `Rule` is the declarative constraint type
- `REQ-L-GTL2-RULE-004`: gate behavior is expressed via `config`
- `REQ-L-GTL2-HOF-003`: consensus belongs in gating

It also matches the design compression rule:

- if two public concepts are directly isomorphic, keep one canonical concept and
  express the other as sugar, configuration, or helper structure

`Consensus` does not survive that test as a public type.

## Required Design Corrections

Claude should make these design changes:

1. In `GTL_2_MODULE_DESIGN.md`

- change the GTL type sketch from:

```python
def consensus(n: int, m: int) -> Rule:
    """Convenience sugar for Rule(kind="consensus", config={"n": n, "m": m})."""
```

- to:

```python
def consensus(n: int, m: int) -> dict:
    """Convenience sugar for gate approval config."""
```

2. Keep the existing design statement:

- `Consensus` is rule sugar. The prime GTL declaration is `Rule`.

3. Do not introduce a `Consensus` section or type into constitutional/design
   docs as if it were equal to `Rule`.

## Required Code Direction

Claude should then align code to the design:

1. Delete the `Consensus` dataclass from `gtl/operator_model.py`
2. Make `consensus()` return a config payload dict
3. Keep `consensus` exported as sugar if desired
4. Do not export or reintroduce a `Consensus` type
5. Leave authored rule usage unchanged except for the returned value shape

## Non-Goal

Do not make `consensus()` return a `Rule`.

That would create nested rule declarations and move the model away from the
accepted `Rule(kind="gate", config=...)` shape.
