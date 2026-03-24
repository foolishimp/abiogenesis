# Bootloader as Graph Asset (REQ-F-BOOTDOC-*)

**Traces to**: INT-001

### REQ-F-BOOTDOC-001 — bootloader_doc is a graph asset with design lineage

The bootloader document (GTL_BOOTLOADER.md) becomes a convergence-tracked asset in the graph, not a hand-maintained file.

**Acceptance Criteria**:
- AC-1: `bootloader_doc` asset exists in the Package with `lineage=[design]`
- AC-2: Asset has markov conditions: `type_names_consistent`, `axiom_references_correct`
- AC-3: Asset id_format is `BOOTDOC-{SEQ}`

### REQ-F-BOOTDOC-002 — F_D evaluator checks GTL type consistency

A deterministic evaluator parses type names from the GTL core module and checks they appear correctly in the GTL bootloader document.

**Acceptance Criteria**:
- AC-1: `gtl_type_consistency` F_D evaluator exists on the `design→bootloader_doc` edge
- AC-2: Evaluator extracts exported type names from the GTL core module (Asset, Edge, Evaluator, Job, Operator, Package, Worker, F_D, F_P, F_H, etc.)
- AC-3: Evaluator checks that each exported type appears in the GTL bootloader document
- AC-4: Exit 0 if all types present; exit 1 with gap list if any missing
- AC-5: Changing a type name in the GTL core module without updating the bootloader causes failure

### REQ-F-BOOTDOC-003 — Bootloader converges before downstream install gates

The bootloader must be consistent before any downstream gate that installs it into dependent projects.

**Acceptance Criteria**:
- AC-1: `bootloader_doc` convergence is checked before `code↔unit_tests` edge proceeds (since tests exercise the bootloader-installed workspace)
- AC-2: `gen-gaps` reports `bootloader_doc` with delta > 0 when consistency check fails
- AC-3: After bootloader is updated and F_P assesses it, delta returns to 0
