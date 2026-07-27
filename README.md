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
| parked design subject | S04 design frozen at `4897ead1` |
| active owners | T-281 for S06 under T-270; T-268 retains parked S04 design |
| accepted implementation base | `8865ccff844d06f4f97765f014ae2b59c1e7d84b` through S03 |
| closure state | S03 and S05 accepted; S06 selected; S04 realization unselected |
| conservation | Forty-row implementation coverage exists; exact RC5 witness reconciliation remains qualification work |
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

S06 is the selected implementation boundary. It proves one installed public
contract through the native SDK, native CLI, and a bounded Codex process
delegate, plus one independently packed flavored Product using installed
public exports and the existing catalog. The delegate is a convenience shell,
not alternate functionality.

S04 design candidate `4897ead1`, tree `11d0ef7b`, remains parked. S04
realization, complete conservation, qualification, and release remain held.

## Authority

Read in this order:

1. [GOALS.md](specification/GOALS.md)
2. [INTENT.md](specification/INTENT.md)
3. [PRODUCT.md](specification/PRODUCT.md)
4. [requirements](specification/requirements/)
5. [direct-GTL design](build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md)
6. [M5 design](build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md)
7. [S05 design delta](build_tenants/abiogenesis/typescript/design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md)
8. [S04 observer/tuner candidate design](build_tenants/abiogenesis/typescript/design/M05_S04_OBSERVER_TUNER_GLOBAL_TO_LOCAL_DESIGN.md)
9. [T-270](.ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md)
10. [T-268](.ai-workspace/tickets/active/T-268-publish-abg-5-tenant-conformance-manifest-consensus-coverage.md)

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
for a trusted developer desktop. The exact 17 outcomes, seven scenarios,
exclusions, qualification subjects, and release lifecycle are defined in
`PRODUCT.md`.

odd_glc release and ABIogenesis 5.0.1 self-use are successor work. They do not
gate ABIogenesis 5.0.
