# REQ-R-ABG3-PLUGIN-SEAMS — Kernel Plugin Adoption Surface

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-07-11
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md) (hook and plugin boundary declarations), [REQ-L-GTL3-HOOKS.md](../gtl/REQ-L-GTL3-HOOKS.md), [REQ-R-ABG3-PAYLOAD.md](./REQ-R-ABG3-PAYLOAD.md), [REQ-R-ABG3-HANDLERS.md](./REQ-R-ABG3-HANDLERS.md), [T-217](../../../.ai-workspace/tickets/completed/T-217-consciousness-wave-higher-order-regulation.md)

---

## Purpose

Define the kernel plugin adoption surface: how a tenant, product, or operator
adopts substrate behavior at the engine's effect seams by declared selection of
governed plugins, never by forking the kernel. Selection is declaration truth
resolved fail-closed against a governed catalog; live capabilities are
operator-injected system-level ingress under F_H approval, not a second
declaration path and not kernel replacement.

## Acceptance Criteria

**REQ-R-ABG3-PLUGIN-SEAMS-001**: The declaration-selectable bootstrap effect seams shall be exactly five named scalar seams: `fdEvaluator`, `fpEvaluator`, `fpDispatch`, `fhAdmission`, and `consequenceProjection`. Substrate effect behavior at these seams is adopted by binding governed plugins through declared selection; kernel forks are not an adoption surface.

**REQ-R-ABG3-PLUGIN-SEAMS-001a** (boundary): The five scalar seams are not the whole plugin surface. The census-bound HANDLERS registry, CCALL fibres, provider plugins (policy, assurance, identity, resolver families), event ingress, runtime event sinks, and the composed task/rule plugin stages (transform tasks, evaluation rules, consequence tasks) are separate lawful plugin surfaces governed by their own requirements (at minimum REQ-R-ABG3-HANDLERS, REQ-R-ABG3-CCALL, REQ-R-ABG3-PAYLOAD, REQ-R-ABG3-ASSURANCE, and the published `EnginePluginKind` contract). This requirement governs only the five scalar declaration-selectable bootstrap seams and claims no exhaustiveness beyond them.

**REQ-R-ABG3-PLUGIN-SEAMS-002**: The substrate shall publish a standard plugin catalog mapping governed plugin refs to the default plugin for each seam. Every catalog row's ref shall be the plugin's own declared contract ref, so selection can never bind a plugin to a seam its contract does not claim.

**REQ-R-ABG3-PLUGIN-SEAMS-003**: Plugin selection shall be declared through the declaration key `abg.plugin_selection`: an object whose keys are the five seam names and whose values are catalog refs. The sole realized attachment point is `GraphFunction.declarations`, where the selection is encoded as one tagged `json_blob` declaration. Resolution against the catalog shall fail closed: unknown seam keys, non-string refs, unknown refs, and a ref admitted for a different seam are typed rejections before any interior runs; a duplicate `abg.plugin_selection` declaration and a duplicate seam key inside the tagged object are likewise typed rejections — duplicate selection authorities fail closed.

Gap: REQ-L-GTL3-HOOKS-001 permits additional lawful attachment scopes (`GraphVector.declarations`, `Job.policy_hooks`, `Role.policy_hooks`, `Module.policy_hooks`, `CandidateFamily.policy_hints`) that the engine does not currently consume for plugin selection; `GraphFunction.declarations` is the only consumed scope. Owner: T-244 routing; implementation requires a singular realization leaf.

**REQ-R-ABG3-PLUGIN-SEAMS-004**: A declared seam selection and a caller-supplied plugin for the same seam shall be two authorities, and the engine entry shall fail closed rather than choose between them. Selection selects among governed substrate plugins only; it is not a path for product code to inject plugin bodies.

**REQ-R-ABG3-PLUGIN-SEAMS-005**: Live capabilities shall enter the adoption surface only as operator-injected capability rows extending the catalog. The capability CLASS is F_H-ratified once, constitutionally, by the admitting wave; a capability row is system-level ingress (agent, budget, environment binding) composed from declared verb arguments with documented environment fallback, admitted strictly with recorded provenance — never a kernel fork and never a rival declaration surface. Declared selection resolves over the extended catalog under the same fail-closed law.

Gap: per-instance approval attribution is not realized — an operator invocation that injects a capability row carries no per-instance actor identity, approval ref, or admitted approval event; ratification lives at the capability class only. Owner: T-244 routing; implementation requires a singular realization leaf.

**REQ-R-ABG3-PLUGIN-SEAMS-006**: A live `F_P` evaluator shall corroborate its acceptance claims mechanically: the engine derives the expected assessment identities internally from the declared vector evaluators and matches them against the worker result. When expected assessment identities derive, close eligibility requires every one attested in the review, an explicit `accepted: true`, and an explicit or defaulted close disposition of `close`; any missing attestation forces retry. An unparsable review blocks as a typed contract failure rather than resolving to acceptance.

Gap: expected assessment identities are not rendered into the PromptManifest — corroboration is engine-internal and the worker attests identities it never sees declared. The review is still extracted by a private free-text JSON-object parser rather than admitted through a declared schema; its admission is closed-key (unknown fields, malformed dispositions, duplicate or unexpected `assessmentIds` are typed rejections), but `closeDisposition` is defaulted from `accepted` when absent and an absent `assessmentIds` is tolerated as empty, so when no expected assessment identities derive a bare `{accepted: true}` review remains close-eligible with no attestation at all. Owner: T-244 routing; implementation requires a singular realization leaf.
