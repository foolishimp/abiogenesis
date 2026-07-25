import {
  EXECUTIVE_IDS,
  isExecutiveDeclarationDraft,
  type ExecutiveDeclarationDraft,
} from "../gtl/executive.js";
import type { JsonValue } from "../shared/canonical_json.js";
import {
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  validatePublicOperationBasis,
  type PublicOperationAdmissionBasis,
} from "./environment_admission.js";
import {
  AbgEventStore,
  admitRuntimeEventBatch,
  admitRuntimeEventTransaction,
  type RuntimeEvent,
} from "./event_store.js";

export type TuningTransitionVariant = "propose" | "ratify" | "reject";

export interface TuningTransitionAuthority {
  readonly actorRef: string;
  readonly policyRef: string;
  readonly rationale: string;
  readonly evidenceRefs: readonly string[];
}

export interface TuningProposalInput {
  readonly variant: "propose";
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly draft: ExecutiveDeclarationDraft;
  readonly authority: TuningTransitionAuthority;
}

export interface TuningDecisionInput {
  readonly variant: "ratify" | "reject";
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly draftRef: string;
  readonly draftDigest: Sha256Digest;
  readonly authority: TuningTransitionAuthority;
}

export type TuningTransitionInput =
  | TuningProposalInput
  | TuningDecisionInput;

export interface TuningTransitionAdmission {
  readonly kind: "tuning_transition_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly variant: TuningTransitionVariant;
  readonly draftRef: string;
  readonly draftDigest: Sha256Digest;
  readonly draftStatus: "open" | "ratified" | "rejected";
  readonly publicOperationEventRef: string;
  readonly transitionEventRef: string;
}

export interface TuningTransitionRefusal {
  readonly kind: "tuning_transition_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "authority_mismatch"
    | "basis_mismatch"
    | "draft_not_open"
    | "duplicate_transition"
    | "not_tuner_authored";
  readonly message: string;
}

export type TuningTransitionResult =
  | TuningTransitionAdmission
  | TuningTransitionRefusal;

function isRecord(
  value: JsonValue,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function refusal(
  code: TuningTransitionRefusal["code"],
  message: string,
): TuningTransitionRefusal {
  return {
    kind: "tuning_transition_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function workspaceBasisExists(
  store: AbgEventStore,
  workspaceBindingId: string,
  workspaceBindingDigest: Sha256Digest,
): boolean {
  return store.readAll().some(
    (event) =>
      event.kind === "public_operation_artifact_admitted" &&
      isRecord(event.payload) &&
      event.payload.operationId === "abg.operation.workspace.bind" &&
      event.payload.artifactRef === workspaceBindingId &&
      event.payload.artifactDigest === workspaceBindingDigest,
  );
}

function tunerAuthoredDraft(
  store: AbgEventStore,
  draft: ExecutiveDeclarationDraft,
): boolean {
  const result = store.readAll().find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      isRecord(event.payload) &&
      event.payload.resultDigest === draft.draftDigest &&
      isExecutiveDeclarationDraft(event.payload.value) &&
      event.payload.value.draftRef === draft.draftRef,
  );
  if (result === undefined) return false;
  return store.readAll().some(
    (event) =>
      event.kind === "c_call_opened" &&
      event.aggregateId === result.aggregateId &&
      event.graphFunctionRef === EXECUTIVE_IDS.tunerGraphFunctionRef,
  );
}

function draftAdmissionEvent(
  events: readonly RuntimeEvent[],
  draftRef: string,
): RuntimeEvent | undefined {
  return events.find(
    (event) =>
      event.kind === "tuner_draft_admitted" &&
      isRecord(event.payload) &&
      event.payload.draftRef === draftRef,
  );
}

function draftDecisionEvent(
  events: readonly RuntimeEvent[],
  draftRef: string,
): RuntimeEvent | undefined {
  return events.find(
    (event) =>
      (
        event.kind === "tuner_draft_ratified" ||
        event.kind === "tuner_draft_rejected"
      ) &&
      isRecord(event.payload) &&
      event.payload.draftRef === draftRef,
  );
}

function transitionAuthority(
  input: TuningTransitionInput,
): Readonly<{
  readonly authorityRef: string;
  readonly authorityDigest: Sha256Digest;
  readonly policyDigest: Sha256Digest;
}> {
  const authorityBody = {
    operationId: "abg.operation.tuning.transition",
    variant: input.variant,
    workspaceBindingId: input.workspaceBindingId,
    workspaceBindingDigest: input.workspaceBindingDigest,
    actorRef: input.authority.actorRef,
    policyRef: input.authority.policyRef,
  };
  const authorityDigest = sha256Canonical(
    authorityBody as unknown as JsonValue,
  );
  return {
    authorityRef:
      `tuning-authority://abg/${authorityDigest.slice("sha256:".length)}`,
    authorityDigest,
    policyDigest: sha256Canonical({
      policyRef: input.authority.policyRef,
      operationId: "abg.operation.tuning.transition",
    }),
  };
}

function draftPayload(
  draft: ExecutiveDeclarationDraft,
  input: TuningTransitionInput,
  publicOperationEventRef: string,
): Readonly<Record<string, JsonValue>> {
  return {
    draftRef: draft.draftRef,
    draftDigest: draft.draftDigest,
    draft: draft as unknown as JsonValue,
    workspaceBindingId: input.workspaceBindingId,
    workspaceBindingDigest: input.workspaceBindingDigest,
    proposalKind: draft.proposalKind,
    proposerRef: draft.proposerRef,
    observerReportRef: draft.observerReportRef,
    observerReportDigest: draft.observerReportDigest,
    replaySnapshotRef: draft.replaySnapshotRef,
    replaySnapshotDigest: draft.replaySnapshotDigest,
    signalRefs: draft.signalRefs,
    signalDigests: draft.signalDigests,
    affectedDeclarationRefs: draft.affectedDeclarationRefs,
    beforeDigest: draft.beforeDigest,
    proposedAfterDigest: draft.proposedAfterDigest,
    equivalenceContractRef: draft.equivalenceContractRef,
    actorRef: input.authority.actorRef,
    policyRef: input.authority.policyRef,
    rationale: input.authority.rationale,
    evidenceRefs: input.authority.evidenceRefs,
    publicOperationEventRef,
  };
}

export function admitTuningTransition(
  store: AbgEventStore,
  input: TuningTransitionInput,
  basis: PublicOperationAdmissionBasis,
): TuningTransitionResult {
  const invalidBasis = validatePublicOperationBasis(
    basis,
    "abg.operation.tuning.transition",
  );
  if (
    invalidBasis !== null ||
    basis.authorityScopeRef !== input.workspaceBindingId ||
    basis.authorityScopeDigest !== input.workspaceBindingDigest ||
    !workspaceBasisExists(
      store,
      input.workspaceBindingId,
      input.workspaceBindingDigest,
    )
  ) {
    return refusal(
      "basis_mismatch",
      "tuning transition requires one exact admitted workspace and public-operation basis",
    );
  }
  if (
    input.authority.actorRef.length === 0 ||
    input.authority.policyRef.length === 0 ||
    input.authority.rationale.length === 0 ||
    input.authority.evidenceRefs.length === 0 ||
    input.authority.evidenceRefs.some((ref) => ref.length === 0)
  ) {
    return refusal(
      "authority_mismatch",
      "tuning transition requires visible actor, policy, rationale, and evidence",
    );
  }

  const events = store.readAll();
  let draft: ExecutiveDeclarationDraft;
  let priorAdmission: RuntimeEvent | undefined;
  if (input.variant === "propose") {
    draft = input.draft;
    if (
      !isExecutiveDeclarationDraft(draft) ||
      draft.workspaceBindingId !== input.workspaceBindingId ||
      draft.workspaceBindingDigest !== input.workspaceBindingDigest ||
      draft.proposerRef !== input.authority.actorRef
    ) {
      return refusal(
        "authority_mismatch",
        "tuning proposal differs from its exact workspace or attributed proposer",
      );
    }
    if (!tunerAuthoredDraft(store, draft)) {
      return refusal(
        "not_tuner_authored",
        "tuning proposal must be the exact admitted result of the tuner GraphFunction",
      );
    }
    if (draftAdmissionEvent(events, draft.draftRef) !== undefined) {
      return refusal(
        "duplicate_transition",
        "tuning draft is already admitted",
      );
    }
  } else {
    priorAdmission = draftAdmissionEvent(events, input.draftRef);
    if (
      priorAdmission === undefined ||
      !isRecord(priorAdmission.payload) ||
      !isExecutiveDeclarationDraft(priorAdmission.payload.draft) ||
      priorAdmission.payload.draftDigest !== input.draftDigest
    ) {
      return refusal(
        "draft_not_open",
        "tuning decision requires one exact admitted draft",
      );
    }
    draft = priorAdmission.payload.draft;
    if (
      draft.workspaceBindingId !== input.workspaceBindingId ||
      draft.workspaceBindingDigest !== input.workspaceBindingDigest
    ) {
      return refusal(
        "basis_mismatch",
        "tuning decision workspace differs from the admitted draft",
      );
    }
    if (draftDecisionEvent(events, draft.draftRef) !== undefined) {
      return refusal(
        "duplicate_transition",
        "tuning draft already has a terminal decision",
      );
    }
  }

  const admitted = admitRuntimeEventTransaction(store, () => {
    const authority = transitionAuthority(input);
    return admitRuntimeEventBatch(store, [
      () => ({
        kind: "public_operation_admitted",
        eventTime: basis.eventTime,
        aggregateType: "workspace",
        aggregateId: input.workspaceBindingId,
        parentAggregateId: null,
        causationEventRefs: [],
        correlationId: basis.correlationId,
        workflowVersion: "5.0.0",
        scopeClass: "workspace",
        basisId: input.workspaceBindingId,
        payload: {
          operationId: basis.operationId,
          definitionKey: basis.definitionKey,
          definitionDigest: basis.definitionDigest,
          invocationRef: basis.invocationRef,
          invocationDigest: basis.invocationDigest,
          variant: input.variant,
          actorRef: input.authority.actorRef,
          authorityRef: authority.authorityRef,
          authorityDigest: authority.authorityDigest,
          capabilityGrantRefs: [],
          policyRef: input.authority.policyRef,
          policyDigest: authority.policyDigest,
          workspaceBindingId: input.workspaceBindingId,
        },
      }),
      (batch) => {
        const operationEvent = batch[0]!;
        const base = draftPayload(draft, input, operationEvent.eventId);
        const decisionPayload = input.variant === "propose"
          ? base
          : {
              ...base,
              admittedEventRef: priorAdmission!.eventId,
              decisionActorRef: input.authority.actorRef,
              decisionPolicyRef: input.authority.policyRef,
            };
        return {
          kind: input.variant === "propose"
            ? "tuner_draft_admitted"
            : input.variant === "ratify"
              ? "tuner_draft_ratified"
              : "tuner_draft_rejected",
          eventTime: basis.eventTime,
          aggregateType: "workspace",
          aggregateId: draft.draftRef,
          parentAggregateId: input.workspaceBindingId,
          causationEventRefs: [operationEvent.eventId],
          correlationId: basis.correlationId,
          workflowVersion: "5.0.0",
          scopeClass: "workspace",
          basisId: input.workspaceBindingId,
          payload: decisionPayload,
        };
      },
    ]);
  });
  const operationEvent = admitted[0]!;
  const transitionEvent = admitted[1]!;
  return deepFreeze({
    kind: "tuning_transition_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    variant: input.variant,
    draftRef: draft.draftRef,
    draftDigest: draft.draftDigest,
    draftStatus: input.variant === "propose"
      ? "open" as const
      : input.variant === "ratify"
        ? "ratified" as const
        : "rejected" as const,
    publicOperationEventRef: operationEvent.eventId,
    transitionEventRef: transitionEvent.eventId,
  });
}
