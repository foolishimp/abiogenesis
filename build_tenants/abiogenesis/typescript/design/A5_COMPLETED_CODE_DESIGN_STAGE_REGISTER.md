# A5 Completed-Code Design Stage Register

**Status**: Active retrospective design gate
**F_H mandate**: 2026-07-12 three-view Mermaid design before coding
**Shared method authority**: `specification_methodology` commit `b3e5e4a`
**Tenant authority**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md)

## Scope

This register covers every code-bearing 5.0 candidate stage completed before
the rejected Consensus implementation. It groups code by durable semantic
checkpoint, not by file or mechanical commit.

The code line is frozen for new product implementation until every non-accepted
design below receives an independent axiom review and an F_H `accepted` or
explicit rework disposition. Retrospective diagrams describe the current code
against prior authority; they may not normalize a code-first category error.

## Authority Conflict For Review

The direct F_H ruling says ABIogenesis 5.0 is the stable baseline and recursive
dogfooding begins with its successor. Live T-242, PRODUCT, and GOALS surfaces
still retain a 5.0 self-host/GLC campaign ladder. This design package does not
silently choose between them and does not treat a downstream GLC product as a
compiler. F_H review must disposition and persist that authority conflict
before any affected design is accepted or implementation resumes.

## Registered Stages

| Stage | Ticket and commits | Three-view design | Current verdict | Coding consequence |
|---|---|---|---|---|
| Typed C-algebra authoring, raw admission, and semantic compilation | T-220; `014448f` | [M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md](./M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md) | `candidate` | The authoring/compiler code is frozen. Any dependent feature requiring `workflow.C`, `C.batch`, or `C.retry` remains blocked because those runtime terms are `semantic_not_realized`. |
| Execution-declaration compilation and basis-owned runtime handoff | T-220 P4; `014448f` | [M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md](./M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md) | `candidate` | The handoff code is frozen. It cannot certify a constructive C body because the separate C-conformance result is not bound into `ExecutionBasis`. |
| Malformed and contradictory F_P output admission plus ABG-owned producer attribution | T-220 P4 and T-223; `014448f`, `28da030` | [M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md](./M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md) | `blocked` | Producer attribution is a passing subclaim; admission remains frozen because G1-G5 require disposition and raw-to-close impossibility is not yet proven. |
| Installed product, workspace, binding, and catalog foundation | T-223 foundation; `f572ee9` | [M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md](./M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md) | `candidate` | Foundation code is frozen pending cross-view axiom review. |
| Public-contract assembly, generated schemas, publication, and parity | T-223 publication; `b445eb1` | [M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md](./M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md) | `candidate` for DS-1; complete 5.0 `blocked` | Static-publication code is frozen. The exact subset proof cannot stand in for the missing operation, capability, schema, vocabulary, and corpus rows. |
| Public SDK, CLI, capability preflight, invocation, result, and replay | T-223 public surface; `b445eb1`, `779eb07`, `28da030` | [M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md](./M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md) | `blocked` | Thin adapter and live-preflight subclaims remain reviewable, but `catalog.invoke` depends on blocked F_P and instruction designs, lacks the C-conformance-to-basis join, and has no public typed F_H exit. |
| Instruction startup, declared protocol source, rendering, and live-plugin prompt handoff | T-223 instruction path; `b445eb1`, `28da030` | [M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md](./M03_INSTRUCTION_PROTOCOL_BEHAVIOR_DESIGN.md) | `blocked` | The manifest/render/transport tail is reusable, but M03 currently authors protocol text and asserted refs that GTL must declare. |
| Packed candidate, clean install, bounded negatives, and installed live proof | T-223 installed vertical; `779eb07`, `28da030` | [M02_M05_PACKED_INSTALLED_VERTICAL_BEHAVIOR_DESIGN.md](./M02_M05_PACKED_INSTALLED_VERTICAL_BEHAVIOR_DESIGN.md) | `blocked` | Two-product packaging and observed evidence are candidate subclaims; F_P admission and instruction placement prevent acceptance of the full live vertical. |
| Reverted imperative Consensus implementation | rejected `945b5a2`; revert `2c85a88` | [M03_CONSENSUS_REJECTED_AS_BUILT_BEHAVIOR_DESIGN.md](./M03_CONSENSUS_REJECTED_AS_BUILT_BEHAVIOR_DESIGN.md) | `rejected` | No code or contract salvage by presumption. A future GTL design must expose missing atoms as gaps before implementation. |

## Non-Code Dispositions

The following completed records do not own a separate completed-code design
stage:

- T-221 is a release-line disposition, not product code.
- T-222 is the design authority consumed by T-223 and is evaluated through the
  T-223 semantic-stage views in this register.
- T-224 through T-241 were retired, repriced, or contain design, qualification,
  release, ticket, or specification records rather than completed 5.0 product
  code on the current line.
- The untracked self-build design pack is future design work and is outside
  this register until separately admitted.

## Evaluation Order

1. Verify each Mermaid asset parses.
2. Apply its cross-view invariants.
3. Evaluate its axiom matrix against live PRODUCT, requirements, Design Module,
   and ODD law.
4. Reconcile the diagrams against the cited implementation paths and tests.
5. For GraphFunction boundaries, admit the exact GTL body and run the current
   ABG semantic compiler, retaining every typed gap. GLC may supply optional
   downstream-consumer evidence only.
6. Record `accepted`, `rejected`, or `blocked` without changing code to make the
   diagram easier to approve.
7. Obtain F_H ratification before changing the registered implementation or
   starting the next product-code stage.

## Next-Code Boundary

No Consensus rebuild or other dependent feature may enter code while
`workflow.C`, `C.batch`, or `C.retry` is a relied-on unrealized constructor.
The lawful next design must author its GraphFunction body in GTL. Compiler gaps
are demand evidence for the missing algebra; they are not permission to move
workflow, prompt, traversal, recursion, or closure into a plugin.
