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
| selected outcome | Reconcile and reclose `ABG5-S05` |
| active owner | T-270 |
| accepted implementation base | `8865ccff844d06f4f97765f014ae2b59c1e7d84b` through S03 |
| closure state | S03 accepted; S05 design-only gate current; implementation held; S06 open and unselected |
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

S05 reconciliation is the only current frontier. Its complete global-to-local
design must be independently reviewed and directly accepted before
implementation resumes. The design must:

1. retain the packed SYSTEM-owned Consensus GraphFunction as an ordinary
   admitted GTL callable;
2. prove agreement, dispute recursion, and unresolved same-Run F_H
   continuation through ordinary HoG, ABG, replay, `project.read`, and CLI
   paths;
3. reconcile the affected Consensus Ontology, atomic functions, Prime, IACS,
   module ownership, three views, operational lifecycle, and module proof;
4. preserve accepted S03, the external Product, M4, package reproducibility,
   and applicable negatives; and
5. introduce no Consensus-specific command, runner, controller, scheduler,
   event family, result store, continuation, or closure path.

S06, observer/tuner, complete conservation, qualification, and release remain
blocked until GOALS selects them.

## Authority

Read in this order:

1. [GOALS.md](specification/GOALS.md)
2. [INTENT.md](specification/INTENT.md)
3. [PRODUCT.md](specification/PRODUCT.md)
4. [requirements](specification/requirements/)
5. [direct-GTL design](build_tenants/abiogenesis/typescript/design/M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md)
6. [M5 design](build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md)
7. [S05 design delta](build_tenants/abiogenesis/typescript/design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md)
8. [T-270](.ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md)

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
