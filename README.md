# ABIogenesis

ABIogenesis is an LLM-first GTL.TypeScript execution product. It publishes
typed graph programs and GraphFunctions, validates them without lowering,
traverses them directly through HoG, and records causal runtime truth through
ABG.

## Current Source State

The source project is preparing ABIogenesis 5.0 as the direct feature-complete
successor to the immutable 4.6 RC5 Product origin.

| Surface | State |
|---|---|
| current work owner | `T-270` M5 parent; accepted design implementation active |
| Product definition | accepted in `specification/PRODUCT.md` |
| implementation | M4 root retained at `21166b11`; M5 `70/70`, conservation `21/40`; fan-out/fan-in and exact durable event-history reopening complete; S02 and F_H continuation open |
| replacement design | M3 accepted under T-285; M5 delta accepted at `d6da4269`, SHA-256 `80269e73...c0f3` |
| delivery governor | `ABI5-ROOT-001`, green and mandatory at every promoted checkpoint |
| method governance | released STDO `v2.0.0`, commit `94ccf4fa...753a`, selected for development and qualification |

The source branch history and the semantic Product origin are distinct. The
accepted correction vector requires every practical RC5 behavior to be
reconciled even where Git ancestry branched below RC5.

## Product Architecture

```text
GTL.TypeScript declarations
  -> native type checking
  -> raw admission
  -> non-lowering GTL validation
  -> direct HoG traversal
  -> declared F_D | F_P | F_H implementation seam
  -> ABG event and result admission
  -> replay, continuation, correction, and closure
  -> SDK / CLI projection
```

The boundaries are strict:

- GTL owns program structure and contracts.
- GraphFunction is the named callable work contract and replayable graph
  template, not the whole program.
- HoG owns direct traversal mechanics.
- ABG owns admitted runtime truth.
- Module and catalog own publication and discoverability.
- Implementation bindings realize declared leaf seams only.
- SDK and CLI are thin invocation and projection shells.

A generated HoG program, compiled execution plan, implementation-only
callable, hidden default, adapter selector, private event writer, or
feature-specific controller is not a lawful substitute.

## Constitutional Authority

Read in this order:

1. [GOALS.md](specification/GOALS.md)
2. [INTENT.md](specification/INTENT.md)
3. [PRODUCT.md](specification/PRODUCT.md)
4. [GTL requirements](specification/requirements/gtl/)
5. [ABG requirements](specification/requirements/abg/)
6. [mapping requirements](specification/requirements/mapping/)
7. [Product requirements](specification/requirements/product/)
8. [accepted direct-GTL design](build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md)
9. [T-270](.ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md)
10. [completed T-286](.ai-workspace/tickets/completed/T-286-establish-installed-abi5-root.md)

`PRODUCT.md` is the one complete 5.0 Product-definition surface. Requirements
decompose it. Goals select the current wave and exact root. Design and code do
not redefine it.

## Repository Structure

```text
specification/                               constitutional WHAT
build_tenants/common/design/                 prior shared design; held for re-derivation
build_tenants/abiogenesis/typescript/design/ prior TypeScript design evidence
build_tenants/abiogenesis/typescript/code/   primary TypeScript realization
build_tenants/abiogenesis/typescript/test_env/ TypeScript proof lanes
build_tenants/abiogenesis/python/            withdrawn historical reference
.ai-workspace/tickets/                       durable work items
.ai-workspace/comments/                      strategy, review, and evidence
```

## Current Work Rule

Do not implement against a donor line. Preserve the completed
`ABI5-ROOT-001` while T-270 extends the same accepted direct-GTL architecture.
The bounded generic-traversal design delta is accepted and M5 implementation is
active. Missing detail is added to existing tickets; it does not create a new
ticket hierarchy.

Existing tests and commands remain current-state probes only. They are not
5.0 Product evidence until the accepted design maps them onto the exact root,
Product scenarios, and qualification subjects.

## Released Product Boundary

ABIogenesis 5.0 targets one source-independent package-first TypeScript Product
for a trusted developer desktop. It includes installed GTL, HoG, ABG, catalog,
public contracts, SDK, CLI, conformance, qualification, and release evidence.
The exact 17 outcomes, seven scenarios, exclusions, and release lifecycle are
defined in `PRODUCT.md`.

odd_glc and ABIogenesis 5.0.1 are successor consumers. They do not gate the
5.0 release.
