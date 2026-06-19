# ODD SDLC TypeScript Blocking Reason Carriers

## Authority

- Ticket: `.ai-workspace/tickets/completed/T-086-promote-typescript-rejection-reasons-to-closed-blocking-reason-carriers.md`
- Requirements: `specification/requirements/12-declarative-operational-state-transitions.md`
- Design dependencies:
  - `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_DETERMINISTIC_TRAVERSAL_STATE_MACHINE.md`
  - `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TRAVERSAL_ASSURANCE_INTEGRATION.md`

## Design Claim

Blocked deterministic admissions must be represented by a closed carrier, not by a free string. The string form remains only as a compatibility projection for existing CLI, archive, and test consumers.

## Carrier

`SdlcBlockingReason` is the prime failure carrier:

- `code`: closed stable reason code
- `reasonClass`: machine-readable class for event calculus and gap triage
- `lawfulReentryPoint`: next lawful re-entry target
- `message`: human-readable summary
- `detail`: optional dynamic evidence, never the reason identity
- `evidenceRefs`: refs supporting the block

The carrier is defined in `code/src/shared/blocking_reason.ts` so install, operator, postflight, gap dossier, and CLI summary surfaces can share one reason law.

## Obligation Reason Codes

Traversal obligation assessment failures are closed blocking reasons, not
substring-classified prose:

- `obligation_unassessed`
- `obligation_status_unassessed`
- `obligation_blocked_without_evidence`
- `obligation_assessment_extra`

These codes preserve the failed obligation id as `detail`. Missing or
unassessed declared obligations re-enter as `same_edge_retry`. Extra
assessments and unevidenced blocked assessments re-enter as
`repair_worker_output`.

## Surfaces

- Operator summary exposes `blockingReasons: SdlcBlockingReason[]` and keeps `blockingReason: string | null` as a derived compatibility field.
- Postflight result exposes `blockingReasonCarriers: SdlcBlockingReason[]` and keeps `blockingReasons: string[]` as a derived compatibility field.
- Gap dossier reasons carry the typed `blockingReason` and derive `reasonClass` from that carrier, removing substring classification.
- Install rejection exposes `blockingReason: SdlcBlockingReason` and keeps `reason` as a compatibility projection.

## Boundary

This design does not make ABG own SDLC domain policy. ABG receives replayable failure truth. ODD SDLC owns the domain-specific reason catalog and maps local failures into closed carriers before archive or projection.
