# M03 GTL Program Conformance Gate First Slice IACS

**Status**: Active
**Date**: 2026-06-09
**Ticket**: T-152
**Derived from**: [REQ-L-GTL3-CONTRACT-LAW-API.md](../../../../specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md), [PRODUCT.md](../../../../specification/PRODUCT.md), [M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md](./M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md), [M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md](./M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md), [M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md](./M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md), [GTL_ASSET_SURFACE_PROMPT_INTERFACE_DERIVATION.md](./GTL_ASSET_SURFACE_PROMPT_INTERFACE_DERIVATION.md), T-150, T-152, T-153

## Purpose

Declare the irreducible carrier set for the ABG-owned static GTL program
conformance gate. This boundary admits a downstream GTL/ABG program inventory
before runtime traversal and emits a deterministic report over the supplied
graph, target-carrier, closure, prompt, plugin, public-start, feature-coverage,
and source-identity surfaces.

The gate is not a graph traversal and does not replace GTL graph algebra. It is
an ABG admission/typecheck boundary over a declared program inventory.

## Reference-To-Target Derivation

| Source pressure | Target boundary decision |
| --- | --- |
| T-150 proved typed prompt asset surfaces but left downstream graph inventories able to construct local checks. | `typecheckGtlProgram(...)` becomes the ABG-owned programmatic gate; CLI use remains a wrapper. |
| T-153 established `REQ-L-GTL3-CONTRACT-LAW-API` as the GTL reload router. | `GtlProgramFeatureCoverageManifest` requires one row for every T-153 feature family. |
| odd_sdlc T-194 needed one proof over production graph assets, target-carrier rows, closure rows, prompts, plugins, overlays, and active ABG identity. | `GtlProgramConformanceInput` admits those row families as one inventory boundary and binds report identity to normalized inventory digests. |
| Prior scanner-style proof could infer hooks or F-star composition from unrelated rows. | Only first-class graph/algebra carriers or first-class inventory rows may drive deterministic observation; attestation-only families cannot be reconstructed from proxy carriers. |
| Caller-owned manifests could label ownership as though it were ABG truth. | `GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS` is the ABG-owned owner map; supplied rows must match it. |

## Irreducible Architectural Carrier Set

This slice introduces seven prime carrier families:

1. `GtlProgramConformanceInput`
2. `GtlProgramConformanceInputAdmission`
3. `GtlProgramFeatureCoverageManifest`
4. `GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS`
5. `GtlProgramInventoryDigests`
6. `GtlProgramConformanceIssue`
7. `GtlProgramConformanceReport`

`GtlProgramConformanceInput` is prime because it is the single admitted
inventory boundary. Downstream products may supply row families, but the gate
does not admit partial inventory as a complete program scope.

`GtlProgramConformanceInputAdmission` is prime because raw JSON/API input is
collapsed once into typed carrier truth. Semantic checks consume this admitted
carrier rather than raw caller objects.

`GtlProgramFeatureCoverageManifest` is prime because every T-153 capability
family must be explicitly classified as `present` or `not_used` in one surface.
The manifest is the feature-disposition truth; tests, prompts, and downstream
read models do not own a parallel checklist.

`GTL_PROGRAM_T153_FEATURE_OWNER_CLASSIFICATIONS` is prime static rule truth
because owner classification is ABG-owned admission law, not caller testimony.

`GtlProgramInventoryDigests` is prime because report identity must bind to the
audited graph/module/vector/row/source inventory, not to issue counts alone.

`GtlProgramConformanceIssue` is prime because admission failure is a typed
diagnostic carrier with rule, surface, and severity identity.

`GtlProgramConformanceReport` is prime because it is the only outcome carrier
for the static gate. It may be rendered by the CLI, but the CLI cannot own a
separate pass/fail truth.

## Subordinate Payload Register

| Shape | Status | Why not prime |
| --- | --- | --- |
| `GtlProgramFeatureCoverageRow` | subordinate under `GtlProgramFeatureCoverageManifest` | one row is not a complete feature-coverage surface |
| `GtlProgramCoverageCounts` / expected and observed count aliases | subordinate under input/report | counts constrain completeness but do not carry independent program identity |
| `GtlProgramTargetCarrierRow` | subordinate under `GtlProgramConformanceInput` | target-carrier truth is evaluated only as part of one program inventory |
| `GtlProgramEdgeClosureRow` | subordinate under `GtlProgramConformanceInput` | closure rows are checked against materialized graph-vector identity and cannot close alone |
| `GtlProgramOverlayRow` | subordinate under `GtlProgramConformanceInput` | overlay rows prove publication/binding coverage only inside the admitted inventory |
| `GtlProgramPublicStartRow` | subordinate under `GtlProgramConformanceInput` | public-start rows bind graph-function refs but do not own runtime start truth |
| `GtlProgramPromptAssetRow` | subordinate under `GtlProgramConformanceInput` | prompt rows are typed asset-surface views, not prompt-authority law |
| `GtlProgramSourceIdentityRow` | subordinate under `GtlProgramConformanceInput` | source text is scanned for identity drift but does not become source authority |
| raw plugin contract rows | subordinate under `GtlProgramConformanceInput` | plugins are boundary inventory; engine authority remains denied by ABG plugin admission |

## Runtime Re-Entry Inventory Boundary

T-152 also verifies that a downstream program inventory exposes enough runtime
re-entry truth for ABG to route nonlocal repair pressure after the static gate
admits the program. That inventory is static proof of available ABG surfaces,
not a second execution law.

`ConsequenceTraversalAction` is therefore not an eighth prime conformance-gate
carrier. It is a runtime-authorship adjunct under the M03 construction and
continuation designs. The static gate proves the necessary plugin, graph-vector,
target-carrier, overlay, and re-entry route rows exist; runtime execution occurs
only when an admitted `ConsequenceProjectionOutcome` carries an admitted
`ConsequenceTraversalAction` and the engine projects it into:

1. `ConstructionActionRow`
2. `ConstructionObservationSnapshot` pressure and upstream-reentry triage
3. `ObservationToActionBindingProjection`
4. `ConstructionPriorityProjection`
5. `ConstructionIntentCandidate`
6. `ConstructionIntentAdmission`
7. `AdmittedConstructionIntent`
8. `ConstructionGraphActionInvocation`

The bridge rejects engine-authority payloads at consequence-action admission,
requires absolute `graph-reentry-point://<GraphReentryPoint>/<vectorIndex>`
targets for `reenter_graph_span`, preserves `graphSpanRef` as provenance in the
construction observation/action/intent surfaces, and invokes the selected action
through the construction runner. The runner records construction events,
`graph_reentry_planned`, `graph_reentry_applied`, graph runtime events, and
`construction_delta_observed` as replay-visible truth before deriving the next
projection.

The gate may report that the route inventory is present. It must not infer that
a product is allowed to issue private cursor moves, local retry loops, or
product-owned re-entry events.

## Deterministic Observation Rule

Only features with first-class graph/algebra carriers or first-class inventory
rows may drive deterministic contradiction checks.

Deterministically observed in this slice:

- graph structure and graph-vector edge law
- `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`,
  and `identity` carrier signatures
- target-carrier rows
- edge-closure rows
- prompt asset rows
- module publication
- active source identity rows

Attestation-only until first-class inventory fields exist:

- `same_object`
- operator/evaluator/rule field law
- F-star compute composition
- hook precedence and hook boundary declarations
- selection/refinement/synthesis/sub-work field law
- public-start, job, and role binding field law
- external tool gates

Attestation-only features still require a manifest row, owner classification,
requirement refs, and evidence or reason refs. They do not produce
present-without-inventory or not-used contradiction failures until a later
ticket admits first-class inventory fields for that feature.

## Module-Derived Proof Map

| Proof lane | Design source | Required assertion |
| --- | --- | --- |
| raw input collapse | input admission | malformed raw JSON produces typed issues, not runtime exceptions |
| complete feature manifest | feature manifest | every T-153 feature family has one row |
| owner truth | owner classification map | spoofed caller owner classification fails closed |
| proxy rejection | deterministic observation rule | target carriers do not imply hooks; plugin rows do not imply F-star composition |
| graph algebra carriers | deterministic observation rule | claimed deterministic algebra features require matching carrier signatures |
| inventory identity | inventory digests | report ref changes when audited inventory changes |
| target-carrier law | target row subordinate payload | lossy target-carrier rows fail closed |
| source identity law | source identity row subordinate payload | stale active ABG identity forms fail closed |
