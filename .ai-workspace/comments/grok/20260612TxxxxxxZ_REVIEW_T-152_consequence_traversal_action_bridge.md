# REVIEW: ABG Consequence-to-Construction Zoom Bridge (T-152)

**Author**: grok
**Date**: 2026-06-12
**Addresses**:
  - `abiogenesis/.ai-workspace/tickets/active/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md`
  - `odd_sdlc/.ai-workspace/tickets/active/T-165-define-optimising-overlay-for-landscape-conditioned-fd-specialization.md`
  - `abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/consequence_traversal_action.ts`
  - `abiogenesis/build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts`
  - `abiogenesis/build_tenants/abiogenesis/typescript/test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs`
  - Prior: odd_sdlc T-197 (E6 residual), REQ-R-ABG3-FP-CONSCIOUSNESS
**Status**: Commentary (implementation review + verification)
**Related**: T-197 E6 "typed triage + upstream_reentry primitive", T-152 gate + reentry inventory, ODD_METHOD re-entry law, DESIGN_MODULE_METHOD carrier discipline

## STDO Context (read first per rules)

This is a realization increment inside the ABG substrate (abiogenesis) under active T-152. It delivers the missing primitive called out in T-197 E6 (nonlocal repair-surface yield / upstream re-entry routing) and referenced in the T-152 checklist.

Entry surfaces read (abiogenesis + cross to odd_sdlc):
- abiogenesis/README.md, AGENTS.md, CLAUDE.md, specification/PRODUCT.md, INTENT.md
- specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md (and related FPC-00x for construction consciousness/reentry)
- T-152 ticket (checklist items for consequence traversal action now marked done)
- T-165 ticket (records ABG substrate bridge complete; SDLC F_D optimizer consumption remains open)
- Shared: SPEC_METHOD, TICKET_METHOD, DESIGN_MODULE_METHOD, ODD_METHOD

Governance: This is ABG-owned carrier + admission + execution law (no product drift). Change class is realization under T-152 (the ticket owning the gate + reentry surfaces). No requirement_reprice or design_reframe here; it completes the substrate side of a prior design commitment.

## What Was Implemented (per user description + direct inspection)

**New admitted carrier**:
- `ConsequenceTraversalAction` (kind: "consequence_traversal_action").
- Extends the constructive `CONSTRUCTIVE_CONSTRUCTION_ACTION_KIND_VALUES` with "non_admit".
- Carries full provenance: consequenceRef, strategyDecisionRef, parentObligationRef, selected* refs (graphFunction/overlay/refinement/candidate/target), graphVector/graphSpan/reentryTarget, asset refs, requiredAuthorityRefs, evidence/foldback policies, nonAdmissionReasonRefs.
- Strict executable assertions (selectedGraphFunctionRef + requiredAuthorityRefs required unless non_admit; reenter_graph_span requires graphVectorRef + reentryTargetRef; internal vector targets require refinement/candidate/published target authority).

**Admission hygiene (the "exact regression")**:
- `admitConsequenceTraversalAction` calls `assertNoEngineAuthorityFields(record, label, "consequence traversal action cannot own engine authority")`.
- Rejects payloads carrying engine-authority fields (mayWriteLedgers, maySelectTraversal, etc.) before any execution path.
- This is the validation that "rejects engine-authority payloads before they can execute".

**Outcome carrier update**:
- `ConsequenceProjectionOutcome` (in plugins.ts) now carries `traversalAction: ConsequenceTraversalAction | null` (optional, admitted).

**The bridge (projection, no new hidden paths)**:
- `constructConstructionActionRowFromConsequenceTraversalAction(action)` — projects to existing `ConstructionActionRow` (eligibleReasonRefs from consequence + strategy + proportionality; hookSourceRefs from overlay; defaultPolicyRefs from evidence/foldback).
- `constructConstructionIntentCandidateFromConsequenceTraversalAction(...)` — projects to `ConstructionIntentCandidate` with proper binding/priority/obligation/lawfulBasis wiring, episode context, and rationale citing the consequence action.
- Uses the existing construction catalog/intent machinery (constructConstructionActionRow, constructConstructionIntentCandidate, etc.).

**Focused proof**:
- `test_t152_consequence_traversal_action_bridge.test.mjs`:
  - Builds basis + raw consequence outcome carrying `traversalAction` (reenter_graph_span to targetVectorIndex).
  - Admits the outcome (verifies traversalAction present and kind).
  - Runs `runConstructionIntentStep` with the projected admission/intent/catalog/priority.
  - Verifies end-to-end: consequence selection -> admission -> construction action/intent -> ABG executes (graph_reentry_applied events, selected vector cursor, etc.).
  - Separate test for admission rejecting engine-authority.
- 2/2 passing on current tree.

**Ticket updates** (durable, per TICKET_METHOD):
- T-152: checklist items 168-173 explicitly cover the carrier, rejection, projection, execution, and replay-visible re-entry. Marked done.
- T-165 (odd_sdlc): "ABG follow-through status, 2026-06-12" records the substrate bridge complete + test name. Correctly scopes remaining work: "It does not by itself wire the SDLC optimizer/data-mapper lane to consume the bridge; that remains P2/P3 SDLC work below."

Verification executed (relative to workspace root):
- `cd abiogenesis/build_tenants/abiogenesis/typescript && npm run build:semantic` → clean (tsc passed).
- `node --test test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs` → 2/2 pass (34ms + 1.5ms).

## STDO / ODD / Design Compliance

**ODD_METHOD**:
- Graph functions + vectors remain the irreducible execution unit.
- ABG owns admission of the new carrier, the projection into construction intent, the re-entry execution (`graph_reentry_applied`), events, replay, and foldback.
- Consequence (product F_P/F_D plugin) only returns a typed `traversalAction` selection inside its `ConsequenceProjectionOutcome`. It does not own runtime execution, continuation, or re-entry.
- Exactly matches "let ABG own continuation and re-entry after each publish boundary" and "product commands and services as cooperative bounded-step subsystems that publish assets or evidence and return control to ABG".
- No product-local shadow re-entry loop or engine-authority smuggling.

**DESIGN_MODULE_METHOD** (carrier + module discipline):
- New carrier is immutable typed, with explicit construction transforms (no hidden orchestration).
- Reuses existing `ConstructionActionRow` / `ConstructionIntentCandidate` / catalog / intent machinery (low coupling, total semantic transforms at the boundary).
- Validation and rejection are at the admission edge (explicit effect boundary).
- No mutable shared state or imperative fallback for authority.
- Traceable to the construction IACS-style surfaces already present in the ABG design.

**TICKET_METHOD / SPEC_METHOD**:
- Work lives inside the durable active ticket (T-152) that owns the conformance gate + reentry inventory.
- Cross-ticket note in T-165 is pure status (no code drift across sibling repos).
- Traces to REQ-R-ABG3-FP-CONSCIOUSNESS (FPC-00x for typed construction consciousness, observation-to-action binding, reentry routing, lawful bindings).
- Directly closes the "missing primitive" gap called out in T-197 E6 (typed upstream_reentry triage + ABG-owned yield basis instead of same-edge retry).
- No requirement_reprice or design_reframe; this is the realization that completes the substrate commitment.

**Authority / Leakage**:
- `assertNoEngineAuthorityFields` is called on every admission (the "exact regression" the user called out).
- All provenance is carried visibly in the carrier (consequenceRef, strategy refs, requiredAuthorityRefs, etc.).
- No new engine-authority surfaces; consequence selection becomes executable only after ABG admission and projection into the construction path.
- Matches the T-197 target truth: "ABG owns ... continuation, replay... SDLC may construct product candidates/read models over admitted evidence".

**Cross-Repo Hygiene**:
- abiogenesis owns the carrier + bridge + test (lawful for ABG substrate).
- odd_sdlc T-165 only records status ("ABG substrate is done, while SDLC optimizer consumption remains").
- No code changes or drift into odd_sdlc in this increment.

## Code Review Notes (from direct file reads + test run)

**Strengths**:
- Carrier shape is complete and mirrors the construction action catalog (good reuse, no duplication of authority concepts).
- Admission + construct functions are strict (asserts + freezes + validation).
- Bridge functions are thin, pure projections that preserve all necessary provenance for later replay/closure.
- Test is minimal, focused, and proves the exact described flow (including the rejection case the user highlighted).
- "non_admit" handling is explicit and fails closed on projection (correct).
- Evidence policy / foldback policy / proportionality refs are wired through (supports the consciousness loop reqs).

**Minor / Non-Blocking Observations** (not defects):
- The carrier re-exports the constructive kinds + adds "non_admit" — this is intentional for consequence to be able to say "I evaluated this but it is not admissible as construction."
- The test uses a three-stage F_D basis and manually constructs the world/admission — appropriate for a focused substrate regression (not a full SDLC optimizer test; that remains in T-165 scope).
- No IACS/diagram update needed here because this is an incremental carrier inside the existing construction episode surfaces (already covered by the T-152 design ownership).

**No issues found** that would block merge or require re-entry. The implementation is declarative, admitted, provenance-preserving, and keeps the ODD ownership split intact.

## Verification Confirmation

Both commands executed successfully from the workspace root:
- Semantic build: clean.
- Focused test: 2/2 passing with the exact behaviors described (admission + re-entry execution; engine-authority rejection).

## Recommendation

This is a clean, STDO-conformant delivery of the re-entry primitive. It can be closed for the ABG substrate side.

Remaining work (correctly scoped):
- SDLC-side consumption in T-165 (F_D optimizer / data-mapper lane wiring the consequence plugin to emit the new traversalAction and consume the re-entry evidence).
- Any higher-order policy or overlay specialization that chooses when to emit `reenter_graph_span` vs. same-edge.

No further action required on this increment. The bridge is now available for downstream use without violating ABG ownership or creating hidden control paths.

(Commentary only — the ticket checklists and the focused test remain the governed proof surfaces.)