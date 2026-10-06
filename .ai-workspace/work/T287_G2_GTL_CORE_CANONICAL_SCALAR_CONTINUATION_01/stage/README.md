# ABIogenesis

ABIogenesis is an LLM-first GTL.TypeScript execution Product. It publishes
typed graph Programs and GraphFunctions, validates them without lowering,
traverses them directly through HoG, and records causal runtime truth through
ABG.

## Product Architecture

```text
GTL.TypeScript declarations
  -> native type checking
  -> raw admission
  -> non-lowering whole-Program validation
  -> admitted Product, workspace, lock, catalog, and implementation basis
  -> direct HoG traversal
  -> F_D | F_P | F_H implementation seam
  -> ABG event admission, Event Calculus, replay, continuation, and closure
  -> SDK and CLI projection
```

The boundaries are strict:

- GTL owns Program topology and contracts.
- GraphFunction is the callable work contract and graph template, not the
  whole Program.
- HoG owns direct traversal mechanics.
- ABG owns admitted runtime events and Event Calculus truth.
- Replay reconstructs and projects admitted truth.
- Module and catalog own publication and discoverability.
- Implementation bindings realize declared leaf seams only.
- SDK and CLI are thin invocation and projection shells.

A generated or lowered executable Program, implementation-only callable,
hidden default, adapter selector, private event writer, Public controller,
feature-specific runtime, rival catalog, or required process-local runtime
authority is not a lawful substitute.

## Authority

Read current authority in this order:

1. [GOALS.md](specification/GOALS.md)
2. [INTENT.md](specification/INTENT.md)
3. [PRODUCT.md](specification/PRODUCT.md)
4. [requirements](specification/requirements/)
5. accepted design under `build_tenants/abiogenesis/typescript/design/`
6. active tickets under `.ai-workspace/tickets/active/`

`PRODUCT.md` is the sole complete Product-definition surface. Requirements
decompose it. GOALS selects the current epic wave. Active tickets carry the
detailed execution contract. Design and code define HOW without redefining
Product meaning.

Comments, completed tickets, reviews, generated views, and donor branches are
evidence. They do not select current work.

## Repository Structure

```text
specification/                                  constitutional WHAT
build_tenants/abiogenesis/typescript/design/    TypeScript realization design
build_tenants/abiogenesis/typescript/code/      TypeScript realization
build_tenants/abiogenesis/typescript/test_env/  TypeScript proof lanes
.ai-workspace/tickets/active/                   current execution contracts
.ai-workspace/tickets/backlog/                  deferred work
.ai-workspace/tickets/completed/                historical work records
.ai-workspace/comments/                         commentary and review evidence
```

## Release Boundary

ABIogenesis targets one source-independent, package-first TypeScript Product
for a trusted developer desktop. The selected outcomes, scenarios, exclusions,
qualification subjects, and release lifecycle are defined in `PRODUCT.md`.

Future Product work and downstream releases do not retroactively qualify the
current release subject.
