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
| current work owner | `T-270` M5 parent with repriced T-272 active for S03 |
| Product definition | accepted in `specification/PRODUCT.md` |
| implementation | M4 `26/26`, M5 `96/96`; S02 complete; accepted S03 composition/evidence/closure base at `686d18bf`; durable external-Product gap stop, exact single-use ProductSet-bound re-entry, convergence, side-effect-free resolved status/result/replay/lawful-action projection, and typed Product-derived `reprice_required` stop accepted through `f611a72d`; the retained live F_P receipt belongs to an earlier package; S03 remains open |
| replacement design | M3 accepted under T-285; M5 base accepted at `d6da4269`; T-272 Sections 12 through 12.7 accepted at complete-design SHA-256 `ad54dc33...fd441` |
| delivery governor | `ABG5-S03`; green `ABI5-ROOT-001`, `ABI5-M5-EXT-001`, and corrected S02 remain regressions |
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

Do not implement against a donor line. Preserve `ABI5-ROOT-001`, but do not
project further bootstrap or internal-matrix work as Product progress. Current
work closes `ABG5-S03` through the already-green independently packed developer
Product: GTL owns One Surface ordering, public read/respond/continue operations
resume exact durable truth, and ABG replay yields the same-run typed outcome.
The supervised Program-start path now carries distinct Product-owned model,
gap, next-action, approval, action-evaluation, evidence-ledger, closure-
candidate, and refreshed model/gap/next-action values. Explicit observation,
next-action, and action-evaluation bases bind those projections to the exact
workspace, action catalog, admitted evidence, closure policy, and replay scope.
ABG admits and replays the selected action, exact `ConstructionIntent`, and
governed construction delta, including the exact admitted action evaluation;
terminal authority depends on every run-causal intent reaching replay-visible
convergence rather than a stage label. Post-resume failures become ABG truth.
The same external Product can now emit a typed no-action projection, stop under
an ABG-admitted `gap_stop`, expose that gap through a replay-derived read, and
re-enter once from a fresh context against the exact lock, ProductSet,
WorkspaceBinding, Program, public start, and append-only source truth. The
re-entered Program then follows its ordinary F_H and governed closure path.
From the exact resolved continuation authority, a fresh public context now
projects status, admitted result, ordered replay, and lawful actions without
appending runtime truth or invoking Product logic. Retained consequence and
runtime-disposition behavior remains.
Missing detail is added to T-270, T-272, or the later held owner; it does not
create a new ticket hierarchy.

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
