# T-264 - Close Proportional Conformance Inventory

- id: T-264
- status: completed
- phase_status: closed_structural_inventory_realized
- review_status: self_reviewed_passed
- implementation_admission: admitted_after_t263_closure
- delivery_phase: DS-1
- change_class: design_reframe
- owner: abiogenesis
- priority: high
- source_ticket: T-252
- dependency: T-263
- design_ref: build_tenants/abiogenesis/typescript/design/M03_PROPORTIONAL_CONFORMANCE_INVENTORY_BEHAVIOR_DESIGN.md
- review_ref: .ai-workspace/comments/codex/20260713T025317Z_REVIEW_t264_proportional_conformance_design.md
- self_review_ref: .ai-workspace/comments/codex/20260713T034004Z_SELF_REVIEW_t264_proportional_conformance_inventory.md
- authority_refs:
  - specification/GOALS.md DS-1
  - specification/PRODUCT.md compiler owns whole-program conformance
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md
  - specification/requirements/abg/REQ-R-ABG3-PLUGIN-SEAMS.md
  - specification/requirements/abg/REQ-R-ABG3-HANDLERS.md
  - specification/requirements/mapping/REQ-M-GTL3-CAPABILITY.md

## Boundary

Close one conformance read-model defect covering
`conformance_inventory_extraction`, `conformance_scope_proportionality`,
`effect_declaration_inventory_enforcement`, and
`plugin_handler_declaration_inventory_enforcement`: feature presence derives
from submitted structure, required effect/plugin/handler declarations are
inventoried exactly, and legitimately unused feature families do not require
invented nonzero inventory.

## T-252 Census Gap Ownership

- gap_family: conformance_inventory_extraction
- gap_family: conformance_scope_proportionality
- gap_family: effect_declaration_inventory_enforcement
- gap_family: plugin_handler_declaration_inventory_enforcement

## Entry And Exit

Resolve the design's effect-capability authority gap and accept the three-view
conformance design before code. The T-252 root must retain
real atom/runtime gaps while losing only unsupported present-without-inventory
and universal-nonzero noise. A broader non-Consensus program must prove that
actual missing mandatory inventory still fails. Inventory must distinguish and
cross-check GraphFunction transitive effect refs, GraphFunction-hosted
`abg.plugin_selection`, exact per-program/stage/arm `abg.hog_handler_bindings`
and configs, and structurally applicable Module Jobs/Roles. Domain
`Operator.binding` is not a plugin or handler inventory source. Declaration
inventory remains separate from proof that the compiler probe executed no
runner, transport, event, archive, workspace, or product effect.

## Non-Closure

Marking present features `not_used`, weakening mandatory evidence, hard-coded
Consensus exceptions, reporting `pluginContractCount = 0` while plugin/handler
declarations exist, requiring invented nonzero Job/Role counts for direct catalog
invocation, treating declaration counts as execution evidence, accepting direct
plugin URIs in `Operator.binding`, or deleting full-root conformance to make the
census green.

## F_H Authority Ruling

`REQ-M-GTL3-CAPABILITY` places effect compatibility in a separate exact tenant
capability profile. No admitted profile carrier is available in the current
conformance input or T-252 Module. F_H accepted the narrow boundary on
2026-07-13: T-264 stops at exact matchable effect-requirement projection, and
actual effect-to-capability compatibility moves to the first boundary that
admits the exact tenant profile, currently T-255/DS-4. Name- or URI-based
inference remains non-closure.

## Closure Disposition

Closed on 2026-07-13 at the accepted narrowed boundary. M03 now requires an
explicit conformance scope, permits omitted assertion carriers only for bounded
submitted-structure probes, and derives structural applicability plus exact
effect, plugin-selection, HOG program/handler/config, Module Job, and Module
Role inventory from admitted GTL. Complete-program claims retain their
coverage and feature-manifest obligations while structurally optional families
may lawfully remain zero.

The unchanged T-252 body reports 7 GraphFunctions, 35 GraphVectors, 93 effect
requirement rows, 10 plugin selections, 34 HOG programs, 11 handler bindings,
0 handler configs, 0 Jobs, and 0 Roles. It retains 695 real conformance issues
and no longer emits expected-coverage or feature-manifest noise. Actual
effect-to-capability compatibility is not claimed and remains owned by
T-255/DS-4 behind an exact tenant profile.

## Closure Evidence

- `npm run test:t264`: 82/82 GTL-law tests and 106/106 focused plus legacy
  conformance tests.
- Full semantic suite: 1,587/1,587 tests passed.
- Packed/publication gate: 70/70 tests passed after deterministic publication
  regeneration; constitutional drift gate: 13/13 tests passed.
- The registered design gate rendered all 3 diagrams with Mermaid 11.3.0.
- Strict semantic TypeScript compilation and the GTL authority guard passed.
- A non-Consensus Module proves derived effects, Jobs, Roles, and structural
  feature applicability.
- Negative fixtures prove fail-closed scope admission, duplicate effects,
  transitive effects, effect/plugin authority separation, plugin authority
  exclusion from `Operator.binding`, unused handler configs, and exact missing
  plugin/handler diagnostics.
- T-252 body digest remains
  `sha256:e4555c21cdb4292b64f7f4d5a625c2a520195aa8d6e9c759498eed4bf28d0ea0`.
- Regenerated T-252 manifest digest is
  `sha256:6ba07d11efc6b34b895a30ec6688d2e6e2d3a10871da11f350b41f446edc0b41`;
  its derived-inventory digest is
  `sha256:795387deaa63932ea568959cbc322ae926f16eb7bddc66b21129dad8bb20d779`.
- The successor census now has 16 active families, 0 duplicate owners, and 0
  unowned families.
