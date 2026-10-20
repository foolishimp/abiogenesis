# Mini Data Mapper Design

The F_P transform may return any bounded batch of fixed feature fragments.
The domain/F_P quality evaluator closes only features materially represented in this live design artifact.

## REQ-MDM-001

Feature-For: REQ-MDM-001
Acceptance-Covers: case-01 covers REQ-MDM-001
Design obligation: Read CSV source files with headers.

## REQ-MDM-002

Feature-For: REQ-MDM-002
Acceptance-Covers: case-02 covers REQ-MDM-002
Design obligation: Infer primitive column types from sample rows.

## REQ-MDM-003

Feature-For: REQ-MDM-003
Acceptance-Covers: case-03 covers REQ-MDM-003
Design obligation: Allow explicit target field renaming.

## REQ-MDM-004

Feature-For: REQ-MDM-004
Acceptance-Covers: case-04 covers REQ-MDM-004
Design obligation: Validate required target fields before output.

## REQ-MDM-005

Feature-For: REQ-MDM-005
Acceptance-Covers: case-05 covers REQ-MDM-005
Design obligation: Record row-level reject reasons.

## REQ-MDM-006

Feature-For: REQ-MDM-006
Acceptance-Covers: case-06 covers REQ-MDM-006
Design obligation: Emit a deterministic mapping report.

## REQ-MDM-007

Feature-For: REQ-MDM-007
Acceptance-Covers: case-07 covers REQ-MDM-007
Design obligation: Preserve source row ordering.

## REQ-MDM-008

Feature-For: REQ-MDM-008
Acceptance-Covers: case-08 covers REQ-MDM-008
Design obligation: Normalize empty strings as nulls.

## REQ-MDM-009

Feature-For: REQ-MDM-009
Acceptance-Covers: case-09 covers REQ-MDM-009
Design obligation: Expose a dry-run mode.

## REQ-MDM-010

Feature-For: REQ-MDM-010
Acceptance-Covers: case-10 covers REQ-MDM-010
Design obligation: Produce an execution summary.
