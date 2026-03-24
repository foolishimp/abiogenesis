# ADR-028: Bootloader Document as Graph Asset

**Status**: Accepted
**Date**: 2026-03-24
**Implements**: REQ-F-BOOTDOC-001, REQ-F-BOOTDOC-002, REQ-F-BOOTDOC-003
**Derives from**: INT-002 (Bootloader Documents as Graph Assets)

## Context

GTL_BOOTLOADER.md is a hand-maintained markdown document that references type names, primitives, and axioms defined in `gtl/core.py`. No deterministic evaluator checks it for consistency. When types are renamed, added, or removed in the GTL core module, the bootloader document drifts silently. The drift is caught only by human inspection, not by the system.

This is the same class of problem that F_D evaluators solve for code and tests — an untested artifact that works until it doesn't.

## Decision

### bootloader_doc as graph asset (REQ-F-BOOTDOC-001)

`bootloader_doc` is a convergence-tracked asset in ABG's own Package:

- Asset type: `bootloader_doc`, id_format: `BOOTDOC-{SEQ}`
- Lineage: `[design]` — the bootloader is derived from the design layer
- Markov conditions: `type_names_consistent`, `axiom_references_correct`

### F_D evaluator: gtl_type_consistency (REQ-F-BOOTDOC-002)

A deterministic evaluator on the `design→bootloader_doc` edge checks type name consistency:

```
gtl_type_consistency:
  source: gtl/core.py (exported type names)
  target: GTL_BOOTLOADER.md (type references)
  pass:   every exported GTL type appears in the bootloader
  fail:   exit 1 with gap list of missing types
```

Exported types include at minimum: `Asset`, `Edge`, `Evaluator`, `Job`, `Operator`, `Package`, `Worker`, `F_D`, `F_P`, `F_H`. The evaluator extracts these from the GTL core module — not from a hardcoded list.

Changing a type name in `gtl/core.py` without updating GTL_BOOTLOADER.md causes failure. This is the design intent — the bootloader must track the kernel's type surface.

### Convergence gate (REQ-F-BOOTDOC-003)

`bootloader_doc` convergence is checked before ABG's own `code↔unit_tests` edge proceeds. Tests exercise bootloader-installed workspaces, so a stale bootloader means tests run against wrong constraints.

`gen-gaps` reports `bootloader_doc` with delta > 0 when the consistency check fails. After the bootloader is updated and re-assessed, delta returns to 0. The update mechanism is hand-authoring now; F_P synthesis is a future capability, not a current requirement.

## Scope boundary

This ADR covers ABG's own bootloader document (`GTL_BOOTLOADER.md` checked against `gtl/core.py`). Domain packages (e.g. genesis_sdlc) replicate this pattern for their own bootloader documents (e.g. `SDLC_BOOTLOADER.md` checked against `sdlc_graph.py`) — that is a domain-package design decision, not an ABG requirement.

## Consequences

- GTL_BOOTLOADER.md becomes a convergence-tracked artifact — drift is caught by F_D, not by humans reading diffs
- Type renames in `gtl/core.py` surface as delta > 0 on the `design→bootloader_doc` edge
- Bootloader consistency is a prerequisite for ABG's test gate — stale bootloaders block `code↔unit_tests`
- Domain packages can adopt the same pattern independently, using their own evaluators and source-of-truth modules
