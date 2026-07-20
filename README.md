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
| current work owner | `T-286` M4 installed direct-GTL root |
| Product definition | accepted in `specification/PRODUCT.md` |
| implementation | active only for exact `ABI5-ROOT-001`; RC5, X, and final-integration remain sideways donor evidence |
| replacement design | accepted under T-285 at SHA-256 `9faeb41d...92f0` |
| delivery governor | `ABI5-ROOT-001`, red at frontier `R1` |
| qualification method | tapped STDO 2.0 required before self-conformance and release |

The source branch history and the semantic Product origin are distinct. The
future correction vector must reconcile every practical RC5 behavior even
where Git ancestry branched below RC5.

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
9. [T-286](.ai-workspace/tickets/active/T-286-establish-installed-abi5-root.md)

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

Do not implement against a donor line. Establish `ABI5-ROOT-001` under T-286
from the accepted direct-GTL design before horizontal feature work.

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
