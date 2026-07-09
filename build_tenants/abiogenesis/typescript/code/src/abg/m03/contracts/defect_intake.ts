// Implements: REQ-R-ABG3-WITNESS-002 — ticket DRAFTS are generated FROM
// admitted defect-intake records. The draft is a derived projection: the
// gap-to-intent seam stops at the draft; the ticket itself is the sole
// effector behind F_H (FPC-007/-019), so nothing here writes anything.
// Observer/tuner separation holds by construction: an intake carries
// diagnosis and triage authority only, never optimisation terms.

import type {
  DefectIntakeAdmittedEvent,
  GraphChangeClass,
  GraphReentryPoint,
  RuntimeEvent
} from "./carriers.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";

export interface TicketDraftProjection {
  readonly kind: "ticket_draft_projection";
  readonly draftRef: string;
  readonly intakeRef: string;
  readonly haltDiagnosisRef: string;
  readonly title: string;
  readonly owner: string;
  readonly changeClass: GraphChangeClass;
  readonly reEntryPoint: GraphReentryPoint;
  readonly evidenceRefs: readonly string[];
  readonly triagedBy: string;
}

export function deriveAdmittedDefectIntakeEvents(
  events: readonly RuntimeEvent[]
): readonly DefectIntakeAdmittedEvent[] {
  return Object.freeze(
    events.filter(
      (event): event is DefectIntakeAdmittedEvent =>
        event.kind === "defect_intake_admitted"
    )
  );
}

export function deriveTicketDraftFromIntake(
  intake: DefectIntakeAdmittedEvent
): TicketDraftProjection {
  return Object.freeze({
    kind: "ticket_draft_projection",
    draftRef: `ticket-draft:${stableSha256Digest({
      intakeRef: intake.intakeRef
    })}`,
    intakeRef: intake.intakeRef,
    haltDiagnosisRef: intake.haltDiagnosisRef,
    title: intake.summary,
    owner: intake.owner,
    changeClass: intake.changeClass,
    reEntryPoint: intake.reEntryPoint,
    evidenceRefs: intake.evidenceRefs,
    triagedBy: intake.triagedBy
  });
}

export function deriveTicketDraftsFromIntakes(
  events: readonly RuntimeEvent[]
): readonly TicketDraftProjection[] {
  return Object.freeze(
    deriveAdmittedDefectIntakeEvents(events).map(deriveTicketDraftFromIntake)
  );
}
