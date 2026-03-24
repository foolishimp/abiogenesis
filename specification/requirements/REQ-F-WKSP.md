# Workspace (REQ-F-WKSP-*)

**Traces to**: INT-001

### REQ-F-WKSP-001 — Workspace bootstrap creates event stream path

The engine initialises the workspace on first use.

**Acceptance Criteria**:
- AC-1: Creates the event stream storage path if absent (idempotent)
- AC-2: Binds the module-level event stream so `emit()` becomes available
- AC-3: Returns a bound EventStream ready for append/read operations
- AC-4: Safe to call on an existing workspace — never destroys existing events
