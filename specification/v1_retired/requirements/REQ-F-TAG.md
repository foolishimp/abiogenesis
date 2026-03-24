# Traceability (REQ-F-TAG-*, REQ-F-COV-*)

**Traces to**: INT-001

### REQ-F-TAG-001 — Implements: tags enforced on all source files

Every engine source file must trace to at least one REQ key.

**Acceptance Criteria**:
- AC-1: `check-tags --type implements` scans source files for `Implements: REQ-*` traceability markers
- AC-2: Exit 0 if every source module (excluding package init files) has ≥1 tag; exit 1 otherwise
- AC-3: Output is machine-readable (file list with tag status)

### REQ-F-TAG-002 — Validates: tags enforced on all test files

Every test file must trace to at least one REQ key.

**Acceptance Criteria**:
- AC-1: `check-tags --type validates` scans test files for `Validates: REQ-*` traceability markers
- AC-2: Exit 0 if every test module has ≥1 tag; exit 1 otherwise

### REQ-F-COV-001 — REQ key coverage enforced by check-req-coverage

Every REQ key in the Package must appear in at least one feature vector.

**Acceptance Criteria**:
- AC-1: `check-req-coverage` loads Package.requirements and scans feature vector `satisfies:` lists
- AC-2: Exit 0 if every REQ key appears in ≥1 feature vector; exit 1 with gap list otherwise
- AC-3: Coverage computable without LLM invocation — pure F_D check
