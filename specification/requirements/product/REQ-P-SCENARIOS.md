# REQ-P-SCENARIOS — Product Scenarios

**Status**: Active
**Category**: Verification
**Date**: 2026-03-24
**Derives from**: INT-001 (installed product behavior and public invocation), [PRODUCT.md](../../PRODUCT.md), [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md) (Verification Layers)
**Wave**: 1

---

## Purpose

Product scenarios are the operational meaning layer. They validate that the GTL/ABG system can actually do what the words describe.

## Acceptance Criteria

**REQ-P-SCENARIOS-001**: Every claimed GTL capability shall have at least one concrete product scenario that validates it end-to-end.

**REQ-P-SCENARIOS-002**: Scenarios shall be concrete use cases, not rewrites of requirement text. They test operational meaning, not spec coverage.

**REQ-P-SCENARIOS-003**: When a scenario cannot be written, the capability is not yet real. When a scenario fails, the gap is between actual behavior and claimed capability.

**REQ-P-SCENARIOS-004**: Research-product-lab qualification shall include
scenario families for extraction, synthesis, transformation, fan-out, ambiguity
harvesting, and gap evaluation when ABIogenesis is claimed as a substrate for
ODD-native downstream products.

**REQ-P-SCENARIOS-005**: Each research scenario shall state its source
requirement authority, graph-function carrier, expected proof lane, and
non-closure conditions. Scenario prose alone is not closure evidence.

**REQ-P-SCENARIOS-006**: Scenario implementation shall prefer outcome code
through graph functions first, declarative carrier publication second, and
minimal imperative binding only where substrate delivery requires it.

**REQ-P-SCENARIOS-007**: Scenario proof shall not copy retired downstream
imperative orchestration as product law. Retired products may supply feature
inventory, witness pressure, and comparison evidence, but accepted behavior
shall be expressed through tenant-neutral GTL, ABG, ODD requirements and the
released tenant's derived design and proof lanes.

## ABIogenesis 5.0 Bounded Scenario Catalog

The ABIogenesis 5.0 release claim is bounded to these end-to-end operational
scenarios:

| Scenario | Concrete use case | Required completion truth |
|---|---|---|
| `ABG5-S01` | Exact installed catalog and Hello World | Install and bind exact product artifacts without mutable-source imports; list and describe retained catalog rows; narrow the session allowlist; invoke one published Hello World GraphFunction through the public SDK or CLI; read its typed result and replay. |
| `ABG5-S02` | Declared constructive program | Execute one multi-stage GTL program using the complete seven-term C algebra through declared stage interiors; reject malformed GTL before execution and malformed, incomplete, or contradictory F_P output before materialization or closure. |
| `ABG5-S03` | Primary public operator loop | Start, receive one truthful stop, hold, or gap, inspect the replay-derived frontier and lawful actions, remove one ambiguity through an agent edit or typed F_H act, resume or start again, and converge through the public contract. |
| `ABG5-S04` | ABIogenesis self-conformance and reflective path | Apply the published self-conformance contract to the exact candidate's complete frozen subject inventory under its exact method/rule/source basis, pass the real-tree and seeded-negative gates, and prove observer/tuner truthful halt, grounded drafts, attribution, ratification, rejection, replay, and one injected negative on the frozen candidate and release path without a product exemption or silent authority mutation. |
| `ABG5-S05` | Agent-invocable Consensus | Through `abg.cli`, invoke the packed candidate's published SYSTEM-owned Consensus GraphFunction over one real ticket and at least two differently attributed reviewer profiles; prove agreement closure, dispute recursion, and round-limit or unresolved-dispute F_H escalation through typed result and replay in existing, alternate, and temporary workspace applications, without shell-owned orchestration or ticket mutation. |
| `ABG5-S06` | Native and Codex public projections | Complete one public-contract invocation with no marketplace host, then complete the equivalent invocation through the Codex CLI or skill projection with no adapter-owned runtime behavior. |
| `ABG5-S07` | Exact release reproduction | Publish and qualify an immutable ABIogenesis 5.0 RC cut descended from the accepted exact candidate; tap the final version with only reconciled version/release-asset deltas; then fresh-install and verify the released ABG product, manifests, checksums, identity, lineage, and release records without rebuilding or mutable-source fallback. |

**REQ-P-SCENARIOS-008**: ABIogenesis 5.0 delivery shall close every scenario in
the bounded catalog above. The pre-RC exact-source-candidate gate shall close
`ABG5-S01` through `ABG5-S06` and establish release eligibility. `ABG5-S07`
closes only after publication and shall append its terminal released-product
result to the same release read model; it shall not be a prerequisite for the
pre-release verdict. A post-5.0 odd_glc or 5.0.1 dogfood campaign is successor
evidence, not another 5.0 scenario. Adding another definition-bearing 5.0
release scenario requires product/scenario repricing; it shall not be implied
by a broad headline or an unrelated test.

**REQ-P-SCENARIOS-009**: Each bounded scenario shall identify the exact installed product and tenant-conformance manifest identities it exercises, its public GraphFunction or operator entry, its expected typed result and replay evidence, and its non-closure conditions.

**REQ-P-SCENARIOS-010**: Scenario fixtures and adapters may provide declared inputs and attributed external ignition. They shall not invoke workers directly, emit ABG events, construct continuations, retry traversal, widen catalog views, decide closure, or otherwise replace the public contract and ABG runtime being proved.

**REQ-P-SCENARIOS-011**: Evidence from the owning installed, compiler, runtime, campaign, and release gates may satisfy the bounded scenarios directly. ABIogenesis 5.0 qualification shall not require a parallel scenario runtime, a second semantic checker, or a new release-wide harness.
