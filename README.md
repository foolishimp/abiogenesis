# ABIogenesis

ABIogenesis is an LLM-first GTL.TypeScript execution Product. It publishes
typed graph Programs and GraphFunctions, validates them without lowering,
traverses them directly through HoG, and records causal runtime truth through
ABG.

## Current Source State

The source project is preparing ABIogenesis 5.0 as the direct feature-complete
successor to the immutable 4.6 RC5 Product origin.

| Surface | Current state |
|---|---|
| Product definition | `specification/PRODUCT.md` |
| selected implementation outcome | Close `ABG5-S06` |
| planned 5.1 input | S04 design frozen at `4897ead1` under backlogged T-268 |
| active owners | T-281 for S06 under T-270 |
| accepted implementation base | `8865ccff844d06f4f97765f014ae2b59c1e7d84b` through S03 |
| closure state | S03 and S05 accepted; S06 native design `4f80f84a` accepted; supplemental parent `2bb7b594` accepted; nested catalog-authority replacement `356aa6a2` frozen for review; realization held; A5-F12/S04 deferred to 5.1 |
| conservation | implementation coverage exists; exact RC5 witness reconciliation remains qualification work |
| method | Released STDO `v2.2.0` at `5326562f075d60052806d0d2c79d3db49671a8ea` |

`specification/GOALS.md` is the current work-selection surface. Repository
history, comments, completed tickets, reviews, and archived branches explain
prior work but do not select implementation.

## Product Architecture

```text
GTL.TypeScript declarations
  -> native type checking
  -> raw admission
  -> non-lowering GTL validation
  -> admitted Product, workspace, lock, catalog, and implementation basis
  -> direct HoG traversal
  -> F_D | F_P | F_H implementation seam
  -> ABG admission, events, replay, continuation, and closure
  -> SDK / CLI projection
```

The boundaries are strict:

- GTL owns Program topology and contracts.
- GraphFunction is the callable work contract and graph template, not the
  whole Program.
- HoG owns direct traversal mechanics.
- ABG owns admitted runtime truth.
- Module and catalog own publication and discoverability.
- Implementation bindings realize declared leaf seams only.
- SDK and CLI are thin invocation and projection shells.

A generated Program, compiled execution plan, implementation-only callable,
hidden default, adapter selector, private event writer, public controller, or
feature-specific runtime is not a lawful substitute.

## Current Work

S06 implementation candidates `4f9bf707` and `51664393`, plus design candidate
`b645595c`, are returned evidence. The accepted realization basis is design
`4f80f84a`, tree
`7070dca7`, in `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md`: exact
proposal/admission stages, sole named-symbol contract authority, per-symbol
namespace/star coverage, cross-Product augmentation refusal, and one admitted
native-closure digest in the existing resolved lock. Its bounded Section 8
realization at candidate `4953508d`, tree `cd8bf69d`, is returned evidence.
Supplemental design
`M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` has accepted
parent `2bb7b594`, tree `c57c237e`. Candidates `8eb7564c` and `5770755a`
remain returned evidence. Catalog-preserving candidate `458ce3c2`, tree
`b5c7a1eb`, is also returned. Replacement `356aa6a2`, tree `4af5ada4`,
preserves acyclic digest staging and the extant flat carrier, derives the
complete nested contract join from the family, exposes mandatory catalog gaps
for T-270 closure before unified M5, and removes the undefined witness digest.
It is frozen for one independent delta review. Realization remains held. The
Codex delegate remains a convenience shell, not alternate functionality.

`A5-F12` and `ABG5-S04` are planned 5.1 work. Their design candidate
`4897ead1`, tree `11d0ef7b`, remains immutable future input under backlogged
T-268. Complete conservation, qualification, and release remain held until S06
closes.

## Authority

Read in this order:

1. [GOALS.md](specification/GOALS.md)
2. [INTENT.md](specification/INTENT.md)
3. [PRODUCT.md](specification/PRODUCT.md)
4. [requirements](specification/requirements/)
5. [direct-GTL design](build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md)
6. [M5 design](build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md)
7. [S05 design delta](build_tenants/abiogenesis/typescript/design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md)
8. [S06 native-contract design](build_tenants/abiogenesis/typescript/design/M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md)
9. [S06 public-function and occurrence design](build_tenants/abiogenesis/typescript/design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md)
10. [T-281](.ai-workspace/tickets/active/T-281-publish-prime-19-operation-definition-family.md)
11. [T-270](.ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md)

`PRODUCT.md` is the sole complete 5.0 Product-definition surface.
Requirements decompose it. GOALS selects one current Product outcome. Design
and code define HOW without redefining Product meaning.

## Repository Structure

```text
specification/                                 constitutional WHAT
build_tenants/abiogenesis/typescript/design/   TypeScript realization design
build_tenants/abiogenesis/typescript/code/     TypeScript realization
build_tenants/abiogenesis/typescript/test_env/ TypeScript proof lanes
.ai-workspace/tickets/active/                  current execution contracts
.ai-workspace/tickets/backlog/                 later selected Product outcomes
.ai-workspace/tickets/completed/               historical work records
.ai-workspace/comments/                        analysis, review, and postmortems
```

## Release Boundary

ABIogenesis 5.0 targets one source-independent package-first TypeScript Product
for a trusted developer desktop. The exact 16 selected outcomes, five selected
pre-RC scenarios, release scenario, exclusions, qualification subjects, and
release lifecycle are defined in `PRODUCT.md`.

The planned 5.1 observer/tuner Product, odd_glc release, and ABIogenesis 5.0.1
self-use are successor work. They do not gate ABIogenesis 5.0.
