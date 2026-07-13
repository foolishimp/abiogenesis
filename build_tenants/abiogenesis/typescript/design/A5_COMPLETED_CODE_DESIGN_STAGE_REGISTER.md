# A5 Completed-Code Design Stage Register

**Status**: Active retrospective design gate
**F_H mandate**: 2026-07-12 three-view Mermaid design before coding
**Shared method authority**: `specification_methodology` commit `b3e5e4a`
**Tenant authority**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md)

## Scope

This register covers the reviewed code-bearing 5.0 stages, including the
retrospective stages completed before the rejected Consensus implementation
and the accepted replacement stages added afterward. It groups code by durable
semantic checkpoint, not by file or mechanical commit.

The code line is frozen for new product implementation until every non-accepted
design below receives an independent axiom review and an F_H `accepted` or
explicit rework disposition. Retrospective diagrams describe the current code
against prior authority; they may not normalize a code-first category error.

## Stable-First Authority Basis

The stable-first ruling is persisted by checkpoint `7107604`: ABIogenesis 5.0
is the complete stable baseline, and recursive dogfooding begins with the 5.0.1
successor after odd_glc 1.0 matures over exact installed 5.0. The retired
self-host/GLC campaign ladder is not a 5.0 qualification or release gate. This
register remains a derived design-review surface; GOALS, INTENT, PRODUCT, and
requirements own product scope, while T-244 traces feature closure.

## Registered Stages

| Stage | Ticket and commits | Three-view design | Current verdict | Coding consequence |
|---|---|---|---|---|
| Typed C-algebra authoring, raw admission, and semantic compilation | T-220; `014448f` | [M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md](./M01_M03_TYPED_C_ALGEBRA_BEHAVIOR_DESIGN.md) | `candidate` | The base authoring/compiler code is frozen. Direct `workflow.C` is realized by T-259; direct root `C.batch` and typed HOF projection are realized by T-260; direct root `C.retry` is realized by T-261. Mixed expressions retain explicit successor gaps. |
| Direct `workflow.C` static binding and child-traversal runtime atom | T-259 | [M03_WORKFLOW_C_RUNTIME_BEHAVIOR_DESIGN.md](./M03_WORKFLOW_C_RUNTIME_BEHAVIOR_DESIGN.md) | `accepted` under delegated F_H | One direct module-contained child workflow is realized without a child catalog entry. Canonical product traversal remains startup-blocked by T-267. |
| Typed fan-out, ordinal `C.batch`, and exact fan-in runtime | T-260; `398f254` | [M03_TYPED_HOF_BATCH_RUNTIME_BEHAVIOR_DESIGN.md](./M03_TYPED_HOF_BATCH_RUNTIME_BEHAVIOR_DESIGN.md) | `accepted` and `closed` under delegated F_H | Direct root batch, runtime-cardinality fan-out, and exact fan-in are realized with structural/runtime authority separation. Nested and mixed batches remain gaps, and the T-267 startup fence remains authoritative. |
| Bounded `C.retry` runtime and one-policy join | T-261; `848a0b81` | [M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md](./M03_C_RETRY_RUNTIME_BEHAVIOR_DESIGN.md) | `accepted` and `closed` under delegated F_H | One direct root retry over one C.of leaf is realized with selected-Module authority, replay-derived attempt identity, bounded budget, exact historical-transition validation, and the single shared retryable-failure allowlist. Nested and mixed retry remain gaps; the T-267/T-268 startup fences remain authoritative. |
| Execution-declaration compilation and basis-owned runtime handoff | T-220 P4; `014448f` | [M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md](./M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md) | `candidate` | The handoff code is frozen. It cannot certify a constructive C body because the separate C-conformance result is not bound into `ExecutionBasis`. |
| Malformed and contradictory F_P output admission plus ABG-owned producer attribution | T-220 P4 and T-223; `014448f`, `28da030` | [M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md](./M03_FP_OUTPUT_ADMISSION_BEHAVIOR_DESIGN.md) | `blocked` | Producer attribution is a passing subclaim; admission remains frozen because G1-G5 require disposition and raw-to-close impossibility is not yet proven. |
| Installed product, workspace, binding, and catalog foundation | T-223 foundation; `f572ee9` | [M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md](./M02_M04_INSTALLED_CATALOG_FOUNDATION_BEHAVIOR_DESIGN.md) | `candidate` | Foundation code is frozen pending cross-view axiom review. |
| Public-contract assembly, generated schemas, publication, and parity | T-223 publication; `b445eb1` | [M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md](./M04_PUBLIC_CONTRACT_PUBLICATION_BEHAVIOR_DESIGN.md) | `candidate` for DS-1; complete 5.0 `blocked` | Static-publication code is frozen. The exact subset proof cannot stand in for the missing operation, capability, schema, vocabulary, and corpus rows. |
| Public SDK, CLI, capability preflight, invocation, result, replay, and F_H response/resume admission | T-223 public surface; T-258; `8e71464` | [M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md](./M03_M04_PUBLIC_SDK_CLI_BEHAVIOR_DESIGN.md) | T-258 `accepted` and `closed`; complete 5.0 surface `blocked` | The typed F_H hold, response, replay, and resume-admission boundary is realized. T-267 still owns post-resume traversal consumption; the remaining public operation families retain their own delivery owners. |
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

The standing structural/render command is `npm run check:design-mermaid` from
the TypeScript tenant root. It discovers only the twelve links above, requires
the ordered domain/sequence/state views, renders with the pinned local Mermaid
CLI into temporary output, and removes that output. A green render remains
syntax evidence; it does not replace independent axiom or F_H review.

1. Run the standing Mermaid structural/render command.
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
`C.retry` is a relied-on unrealized constructor.
The lawful next design must author its GraphFunction body in GTL. Compiler gaps
are demand evidence for the missing algebra; they are not permission to move
workflow, prompt, traversal, recursion, or closure into a plugin.
