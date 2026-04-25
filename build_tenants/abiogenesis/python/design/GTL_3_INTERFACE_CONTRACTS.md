# GTL 3 Interface Contracts

**Status**: Active
**Date**: 2026-04-05
**Derived from**: [README.md](../../../../specification/requirements/gtl/README.md), [TESTCASE_AUTHORITY.md](../../../../specification/scenarios/TESTCASE_AUTHORITY.md), [GTL_3_MODULE_DESIGN.md](./GTL_3_MODULE_DESIGN.md)

## Purpose

Define the concrete interface and serialization contracts that the python GTL 3
implementation shall realize.

This surface is specific enough to derive tests and code edits without
inventing semantics.

## Governing Requirement Surfaces

- `REQ-L-GTL3-ATTRS`
- `REQ-L-GTL3-CONTEXT`
- `REQ-L-GTL3-GRAPHVECTOR`
- `REQ-L-GTL3-GRAPHFUNCTION`
- `REQ-L-GTL3-HOOKS`
- `REQ-L-GTL3-ROLE`
- `REQ-L-GTL3-JOB`
- `REQ-L-GTL3-MODULE`
- `REQ-L-GTL3-IDENTITY`
- `REQ-L-GTL3-LAWS`

## Concrete Contracts

### Attrs And Context

- `Attrs` is the immutable ordered metadata/config carrier for public GTL
  declaration surfaces
- `Context` is language-owned declaration truth with `name`, `locator`, and
  `digest`

### GraphVector

The GTL 3 python shape is:

```python
@dataclass(frozen=True)
class GraphVector:
    name: str
    source: Node | tuple[Node, ...]
    target: Node
    operators: tuple = ()
    evaluators: tuple = ()
    contexts: tuple[Context, ...] = ()
    rule: Any = None
    allows_subwork: bool = False
    declarations: Attrs = field(default_factory=Attrs)
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

Contract truths:

- `declarations` is the canonical transition-governance carrier for invariant
  transition description, dispatch, evaluation, escalation, proof, closure,
  hook refs, and opaque config
- `operators`, `evaluators`, `rule`, and `allows_subwork` remain direct local
  surfaces and are not removed by the richer declaration model
- `GraphVector` remains internal realized graph structure rather than the
  public callable work-entry carrier
- serialization and frame publication shall preserve `declarations`

### GraphFunction

- `GraphFunction` is the sole public named callable carrier of GTL 3
- `GraphFunction.declarations` is the canonical graph-function governance and
  publication declaration surface
- hook attachment remains a stable hook reference plus opaque config, not raw
  callable injection as language truth
- template coercion to `TemplateRef` remains part of construction-time
  publication truth
- semantic jobs bind published graph functions by identity and do not target
  bare internal vectors

### Role, Job, And Module

- `Role.policy_hooks` is an external policy input surface
- semantic `Job` contracts bind published graph functions through
  `ContractRef(kind="graph_function", target_id=...)`
- a published graph function bound by a semantic job is a callable work-entry
  carrier, not a hidden structural alternative in selection validation
- `Module` publishes graphs, graph functions, refinement boundaries, candidate
  families, jobs, roles, operators, evaluators, rules, imports, and metadata

## Hook Attachment Contract

GTL 3 does not define a policy semantic language.

The hook attachment contract is:

- stable hook reference
- opaque configuration
- inspectable location on a GTL declaration surface

Lawful hook-bearing surfaces:

- `GraphFunction.declarations`
- `GraphVector.declarations`
- `Role.policy_hooks`
- `CandidateFamily.policy_hints`

Lawful hook concerns:

- dispatch
- evaluation
- escalation
- deterministic proof
- closure

## Replay And Serialization Contract

- graph publication and graph-function publication remain replayable
- graph-vector and graph-function declarations remain inspectable after
  serialization
- identity-bearing GTL types preserve opaque ids across publication and replay
