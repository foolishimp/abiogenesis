# MindForge mapping boundary and implementation recommendations

**Type:** Analysis and recommendations
**Author:** Codex
**Date:** 2026-05-04 UTC
**Reviewed artifact:** `.ai-workspace/comments/claude/20260503T150145Z_STRATEGY_mindforge-financial-ai-risk-mapping-to-gtl-abg-and-odd-sdlc.md`

This is commentary, not specification or design law.

## Claim

The Claude note is valuable as strategy intake, but it should not drive direct GTL/ABG core implementation.

MindForge is a financial-services AI governance use case. GTL/ABG is the generic language and runtime substrate. The right next move is to carve downstream product or overlay tickets that consume ABG substrate truth, not to add financial-governance carriers to GTL or ABG core by default.

## Plain-language frame

GTL and ABG are the platform layer.

GTL is the formal workflow language. It describes the work that needs to happen: the stages, inputs, outputs, roles, review points, and proof obligations. A non-technical analogy is a governed process blueprint. It says what steps exist and what must be true before work can move forward.

ABG is the runtime that executes and proves those GTL workflows. It records what happened, who or what performed the work, what evidence was admitted, which checks passed or failed, and what the current state is. A non-technical analogy is the operating record and control engine behind the blueprint. It does not decide the organization's business policy; it makes the policy-driven workflow replayable and auditable.

odd_sdlc is a downstream product built on that platform for software delivery. It uses GTL/ABG to govern the lifecycle from request through specification, design, implementation, qualification, release, deployment, observation, and retrofit.

MindForge is different. It is a financial-services AI risk-management framework. It defines governance expectations such as risk tiering, AI inventories, third-party disclosures, monitoring, review, escalation, and recertification.

The architectural question is not "can MindForge be implemented on GTL/ABG?" It can. The question is where the MindForge-specific concepts should live.

The recommendation in this note is:

```text
GTL/ABG should provide the generic governed workflow and audit substrate.
MindForge-specific risk concepts should live in a downstream AI governance product or overlay.
```

That keeps the platform reusable outside financial services while still letting a financial institution implement MindForge with strong evidence and auditability.

## Current authority boundary

Abiogenesis currently defines:

- GTL as the declaration language for graph-native workflows.
- ABG as the canonical interpreter, binding, traversal-control, event, projection, provenance, and payload-ledger substrate.
- Downstream domains as owners of asset meaning, domain HOW, domain policy overlays, query overlays, and proof interpretation.

That means MindForge can be a strong proving domain for GTL/ABG, but it does not automatically become ABG law.

The safe reading is:

```text
MindForge policy/control surface
  -> downstream ODD product or overlay
  -> GTL graph functions, jobs, roles, payload contracts, and evaluator hooks
  -> ABG admitted events, payload envelopes, evidence facts, projections, and closure truth
```

The unsafe reading is:

```text
MindForge control vocabulary
  -> new GTL/ABG core carrier families
```

That second path makes a financial-services governance framework look like generic runtime ontology before the method has proved it is generic.

## What the Claude note gets right

1. MindForge has a shape that fits ODD-style realization: typed assets, governance roles, lifecycle gates, evidence, monitoring, review, and audit.
2. ABG already has the right generic primitives for much of the proof substrate: event truth, payload admission, evaluator regimes, role/job separation, graph-function publication, selection application, and eval-suite projection.
3. odd_sdlc is relevant where an AI use case is also a software delivery worksite.
4. A separate `odd_aigovernance` or MindForge overlay product is likely cleaner than forcing all AI governance lifecycle semantics into odd_sdlc.

Those are useful conclusions.

## Main correction

The note repeatedly turns "ABG can support this" into "GTL/ABG should own this carrier." That is the boundary error.

ABG should own the generic runtime facts:

- admitted payload envelopes
- evidence admission
- event emission
- projection
- role and worker binding truth
- run and graph-call truth
- selection application
- evaluator regime boundaries
- closure relevance

The downstream MindForge product should own the domain facts:

- risk materiality taxonomy
- risk tier labels
- AI inventory schema
- third-party disclosure fields
- KRI names and formulas
- recertification cadence policy
- committee and escalation taxonomy
- MindForge-to-MAS/FEAT trace interpretation

If a later implementation proves that one of those surfaces is not financial-specific, it can re-enter abiogenesis through requirement or product repricing. Until then, the default should be downstream ownership.

## Reclassified proposed additions

### Risk materiality tier

Do not add `RiskMaterialityTier` to `Job` or `Module` in GTL core as a financial label.

Recommended shape:

- downstream carrier: `MindForgeRiskProfile` or `AiUseCaseRiskProfile`
- ABG admission: payload/evidence envelope with schema and authority refs
- GTL use: graph-function or role policy hook references the admitted risk profile
- projection: downstream risk register derives current inherent and residual risk state

If this later generalizes, the generic core candidate is not "risk tier"; it is a policy-visible routing or assurance profile reference. The domain still owns the labels.

### AI inventory

Do not treat `Module` as the AI inventory entry.

Recommended shape:

- `Module`, `Job`, and payload admissions provide source facts
- downstream `AIInventoryEntry` is a read model over admitted facts
- the inventory may live in a MindForge overlay, an `odd_aigovernance` product, or an FI-specific ODD product

The inventory is compliance projection, not GTL publication law.

### Risk taxonomy

Do not add MindForge risk dimensions as GTL ontology.

Recommended shape:

- downstream taxonomy asset
- payload contract for per-dimension inherent and residual assessment
- F_P evaluator for semantic risk judgment
- F_D envelope only for schema, identity, digest, authority, and completeness mechanics

This preserves the F_P/F_D boundary. Semantic risk judgment is not deterministic runtime mechanics.

### Third-party disclosure

Do not extend `AgentTransportContract` as the primary carrier for MindForge AI Card disclosure.

Recommended shape:

- `ThirdPartyDisclosure` as downstream admitted payload class
- evidence adapter maps provider disclosures into ABG payload/evidence facts
- `AgentTransportContract` continues to govern invocation transport and environment policy
- downstream projection joins disclosure evidence to transport/use-case facts

The disclosure record and the transport contract are related, but they are not the same surface.

### KRI projections

Do not claim ABG already realizes MindForge KRIs.

Recommended shape:

- ABG emits the event and payload truth needed for replay
- downstream product publishes KRI projection definitions
- odd_sdlc may publish examples only for software-delivery KRIs
- MindForge overlay publishes financial AI risk KRI definitions

KRI names such as drift, hallucination rate, model-change events, fairness metrics, and vendor-risk indicators are domain policy unless generalized through later method work.

### Recertification cadence

Do not add recurrence as a hidden runtime loop in ABG.

Recommended shape:

- downstream graph function declares recertification work
- schedule/cadence is product policy or orchestration above the ABG kernel
- ABG records the resulting job/run/event/projection truth when the work is invoked

ABG can prove the review happened. It should not become the FI's calendar policy engine.

### Multi-level escalation

Do not encode committee hierarchy in ABG.

Recommended shape:

- GTL `Role` declares semantic capability classes
- downstream product defines committee and approver role taxonomy
- `CandidateFamily` can declare lawful escalation paths
- ABG applies externally selected paths and records provenance

ABG owns lawful selection application. Domain policy owns which escalation path is required.

## odd_sdlc recommendation

Use odd_sdlc only when the MindForge-controlled use case is software delivery.

For broader enterprise AI governance, create a separate downstream ODD product or overlay. Working names:

- `odd_aigovernance`
- `mindforge_overlay`
- FI-specific `odd_ai_risk`

The clean product split is:

```text
abiogenesis
  owns GTL/ABG substrate

odd_sdlc
  owns software delivery lifecycle

odd_aigovernance or MindForge overlay
  owns AI governance lifecycle, risk taxonomy, inventory, KRI, disclosure, and recertification policy
```

This keeps abiogenesis generic and keeps odd_sdlc from becoming the dumping ground for every AI governance concern.

## External source status correction

The Claude note should update its source framing before reuse.

The MAS media release dated 20 March 2026 says Project MindForge Phase Two concluded with publication of the AI Risk Management Toolkit. It also says MAS was reviewing responses to the earlier consultation and that the Operationalisation Handbook will be periodically updated to reflect supervisory expectations.

Recommended wording:

> MAS published the MindForge AI Risk Management Toolkit on 20 March 2026 after Phase Two of Project MindForge. The toolkit supports financial institutions while MAS reviews consultation feedback on proposed AI Risk Management Guidelines. Treat the handbook as current industry implementation guidance that may be updated as supervisory expectations settle.

Avoid saying that the January 2026 copies are canonical-current unless they have been checked against MAS's March 2026 publication surface.

## Recommended ticket carve-out

Create tickets in this order.

1. **MindForge overlay product intake**
   - Scope: product or intent reprice for a downstream ODD product or overlay, not abiogenesis core.
   - Output: choose `odd_aigovernance` vs `mindforge_overlay` vs FI-specific product.

2. **MindForge control-surface model**
   - Scope: downstream requirements/design.
   - Output: typed assets for risk profile, inventory entry, disclosure, KRI definition, recertification profile, and escalation policy.

3. **ABG substrate mapping**
   - Scope: downstream design over existing abiogenesis substrate.
   - Output: map each domain asset to payload contracts, evidence adapters, evaluator hooks, role hooks, graph functions, and projections.

4. **Consideration 5 proof slice**
   - Scope: one end-to-end worked graph function.
   - Output: inherent risk assessment, control selection, residual risk assessment, pre-deployment review, deployment gate, monitoring projection, and recertification re-entry.

5. **Generic-core gap review**
   - Scope: abiogenesis only after the proof slice.
   - Output: list of substrate gaps that are demonstrably generic, with proposed lawful re-entry points.

Do not start with abiogenesis carrier additions. Start with the downstream proof slice and let generic substrate gaps surface from use.

## Direct recommendation

Accept the Claude note as a strategy input.

Do not implement its proposed GTL/ABG additions as written.

Use it to open a downstream design discussion for a MindForge overlay or `odd_aigovernance` product. Keep abiogenesis changes limited to generic substrate gaps discovered by that downstream proof, and require each such gap to cite the exact existing authority boundary it extends.
