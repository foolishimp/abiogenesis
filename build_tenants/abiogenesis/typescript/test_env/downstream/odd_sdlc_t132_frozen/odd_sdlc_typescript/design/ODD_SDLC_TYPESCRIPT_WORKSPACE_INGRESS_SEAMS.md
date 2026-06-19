# odd_sdlc TypeScript Workspace Ingress Seams

**Status**: Active
**Date**: 2026-04-26
**Implements**: REQ-F-ODDSDLC-007, REQ-F-ODDSDLC-012, REQ-F-ODDSDLC-016, REQ-F-ODDSDLC-022, REQ-F-ODDSDLC-032
**Derives From**: `ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`, `build_tenants/python/design/REQUIREMENT_CLOSURE_CARRIER_AND_PROJECTION_BOUNDARY.md`, `.ai-workspace/tickets/backlog/T-019-split-workspace-assets-filesystem-model-and-projection-seams.md`, `.ai-workspace/tickets/completed/T-068-realize-typescript-conform-project-profile-before-product-materialization.md`

## Position

Workspace ingress is a typed admission boundary, not an installer and not a
filesystem controller.

The TypeScript tenant separates the ingress surface into these seams:

| Seam | File | Owns |
| --- | --- | --- |
| carrier vocabulary | `workspace/carriers.ts` | source input, project constraints, imported requirement authority, bootstrap lineage, and ingress report types |
| source input derivation | `workspace/source_input.ts` | digest, role detection, authority-marker extraction, ambiguity classification, source-input admission |
| project constraints | `workspace/project_constraints.ts` | closed project-profile admission and project slug parsing |
| conform project profile | `workspace/project_profile.ts` | `{documents, project_constraints} -> ConformProjectProfile` canonicalization for tenant, output root, runtime layout, modules, capabilities, execution contracts, realization mode, and overlay strategy binding |
| bootstrap lineage | `workspace/bootstrap_lineage.ts` | imported requirement seed authority and `InputSet -> Project` lineage projection |
| compatibility barrel | `workspace/ingress.ts` | export continuity only |

## Authority Rule

Ingress may admit raw workspace snapshots and project constraints into typed
truth. It may not mutate the workspace, imperatively choose a graph traversal,
publish ABG runtime facts, or infer semantic authority from path names alone.

Project constraints are input only. Downstream installed-operator handoff,
product materialization, capability gates, and execution-contract prompts
consume `ConformProjectProfile`, not direct YAML scalar scans.

## Overlay Strategy Binding

`ConformProjectProfile` is the single workspace-owned surface for profile-level
overlay selection. The admitted strategy vocabulary is closed:

- `thread`
- `breadth`
- `full_lifecycle`

`overlayStrategy` and `overlayRef` come from project/profile truth. Operator
`next` selection consumes those fields to pick the start overlay. Explicit
operator starts may also use the strategy handles as overlay aliases. The
binding is routing/admission truth only; it is not closure evidence and cannot
erase downstream pressure.

The standard conformed runtime layout is part of that same profile. Transform
assets are archived under `.ai-workspace/runtime/odd_sdlc/assets`, operator run
archives under `.ai-workspace/runtime/odd_sdlc/operator-runs`, and product
files materialize through `selected_output_root` under `build_tenants/<tenant>`.

The lawful bootstrap handoff is:

```text
{ documents } -> Fg_ingress_project -> Fg_conform_project -> downstream graph program
```

The first TypeScript slice implements the deterministic conformance carrier for
project declarations already present in the workspace. It does not encode
data_mapper or any other workload-specific target.

## T-019 Lesson

The Python `workspace_assets.py` seam-split ticket remains a Python
realization chore. The TypeScript tenant still adopts its design lesson now:
filesystem/path discovery, model vocabulary, and projection assembly must not
collapse into one mixed-concern module.

This is not a like-for-like split of Python files. The split follows ODD roles:
admitted input carrier, project constraint carrier, imported authority
projection, and bootstrap lineage projection.

Local optimization is the explicit module split. Global optimization is that
later requirement closure consumes the lineage carrier instead of rescanning
the workspace.

## Closure Check

T-031 remains closed only while:

- raw source input admission is separate from project-constraint admission
- project-constraint admission projects through `ConformProjectProfile`
- imported requirement authority is projected from admitted source inputs
- bootstrap lineage is a projection over admitted carriers
- downstream requirement closure consumes typed lineage rather than rescanning
  the fixture as a hidden recovery engine
