import type {
  AssessedRuntimeEvent,
  CanonicalRuntimeEvent,
  RuntimeEvent
} from "./carriers.js";
import { assertCanonicalRuntimeEventSequence } from "./event_admission.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  deriveReplayAdmittedRuntimeResultRelation
} from "./replay_admitted_runtime_result.js";

export interface RuntimeResultAssessmentSubject {
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly runtimeResult: {
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  };
}

export interface ResultAssessmentRuntimeSubjectRelation {
  readonly kind: "result_assessment_runtime_subject_relation";
  readonly assessment: {
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  };
  readonly runtimeSubject: RuntimeResultAssessmentSubject;
  readonly assessmentContract: {
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  };
  readonly obligationIds: readonly string[];
  readonly assessedEventRefs: readonly string[];
  readonly evidenceEventRefs: readonly string[];
  readonly replay: {
    readonly ref: string;
    readonly digest: `sha256:${string}`;
  };
}

function assessmentDigest(ref: string): `sha256:${string}` {
  const match = /^assessment:([0-9a-f]{64})$/u.exec(ref);
  if (match?.[1] === undefined) {
    throw new TypeError(
      "result assessment relation requires assessment:<64-hex> identity"
    );
  }
  return `sha256:${match[1]}`;
}

function sameRuntimeSubject(
  event: AssessedRuntimeEvent,
  subject: RuntimeResultAssessmentSubject
): boolean {
  return (
    event.basisId === subject.basisId &&
    event.graphCallId === subject.graphCallId &&
    event.frameId === subject.frameId &&
    event.vectorIndex === subject.vectorIndex &&
    event.runtimeResultRef === subject.runtimeResult.ref &&
    event.runtimeResultDigest === subject.runtimeResult.digest
  );
}

function sameLocus(
  left: {
    readonly basisId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly vectorIndex: number;
    readonly edge: string;
  },
  right: AssessedRuntimeEvent
): boolean {
  return (
    left.basisId === right.basisId &&
    left.graphCallId === right.graphCallId &&
    left.frameId === right.frameId &&
    left.vectorIndex === right.vectorIndex &&
    left.edge === right.edge
  );
}

export function deriveResultAssessmentRuntimeSubjectRelation(input: {
  readonly events: readonly RuntimeEvent[];
  readonly assessmentRef: string;
  readonly runtimeSubject: RuntimeResultAssessmentSubject;
}): ResultAssessmentRuntimeSubjectRelation {
  const events = input.events;
  assertCanonicalRuntimeEventSequence(
    events,
    "ResultAssessmentRuntimeSubjectRelation.events"
  );
  const assessedRows = events.filter(
    (event): event is CanonicalRuntimeEvent & AssessedRuntimeEvent =>
      event.kind === "assessed" && event.assessmentRef === input.assessmentRef
  );
  if (assessedRows.length === 0) {
    throw new TypeError(
      "result assessment relation requires replay-admitted assessed truth"
    );
  }
  if (assessedRows.some((event) => !sameRuntimeSubject(event, input.runtimeSubject))) {
    throw new TypeError(
      "result assessment relation differs from the exact runtime subject"
    );
  }
  const targetRelation = deriveReplayAdmittedRuntimeResultRelation({
    events,
    runtimeResultRef: input.runtimeSubject.runtimeResult.ref,
    runtimeResultDigest: input.runtimeSubject.runtimeResult.digest
  });
  if (
    targetRelation.subject.basisId !== input.runtimeSubject.basisId ||
    targetRelation.subject.graphCallId !== input.runtimeSubject.graphCallId ||
    targetRelation.subject.frameId !== input.runtimeSubject.frameId ||
    targetRelation.subject.vectorIndex !== input.runtimeSubject.vectorIndex
  ) {
    throw new TypeError(
      "result assessment relation differs from the T-271 runtime subject"
    );
  }
  const contractRefs = new Set(
    assessedRows.map(
      (event) =>
        `${event.assessmentContractRef}\u0000${event.assessmentContractDigest}`
    )
  );
  if (contractRefs.size !== 1) {
    throw new TypeError(
      "result assessment relation contains multiple assessment contracts"
    );
  }
  if (
    assessedRows.some(
      (event) =>
        event.assessmentContractRef !== targetRelation.targetContract.ref ||
        event.assessmentContractDigest !== targetRelation.targetContract.digest
    )
  ) {
    throw new TypeError(
      "result assessment relation differs from the replay-admitted target contract"
    );
  }
  const first = assessedRows[0];
  if (first === undefined) {
    throw new TypeError("result assessment relation lost assessed truth");
  }
  const targetObservedRows = events.filter(
    (event) => event.eventId === targetRelation.targetAdmission.observedEventRef
  );
  const targetObserved = targetObservedRows[0];
  if (
    targetObservedRows.length !== 1 ||
    targetObserved === undefined ||
    targetObserved.kind !== "payload_observed" ||
    !sameLocus(targetObserved, first) ||
    targetObserved.authorityRef === null
  ) {
    throw new TypeError(
      "result assessment relation requires one exact target observation authority"
    );
  }
  const targetAuthorityRows = events.filter(
    (event) =>
      event.kind === "authority_snapshot_admitted" &&
      event.eventAdmissionOrdinal < targetObserved.eventAdmissionOrdinal &&
      sameLocus(event, first) &&
      event.authoritySnapshotRef === targetObserved.authorityRef
  );
  const targetAuthority = targetAuthorityRows[0];
  if (
    targetAuthorityRows.length !== 1 ||
    targetAuthority === undefined ||
    targetAuthority.kind !== "authority_snapshot_admitted" ||
    targetAuthority.authorityRefs.length === 0 ||
    new Set(targetAuthority.authorityRefs).size !==
      targetAuthority.authorityRefs.length
  ) {
    throw new TypeError(
      "result assessment relation requires one exact complete target authority snapshot"
    );
  }
  const obligationIds = [...new Set(assessedRows.map((event) => event.obligationId))];
  if (obligationIds.length !== assessedRows.length) {
    throw new TypeError(
      "result assessment relation contains duplicate obligation truth"
    );
  }
  if (
    obligationIds.length !== targetAuthority.authorityRefs.length ||
    obligationIds.some(
      (obligationId) => !targetAuthority.authorityRefs.includes(obligationId)
    )
  ) {
    throw new TypeError(
      "result assessment relation requires the complete replay-authority obligation set"
    );
  }

  const evidenceEventRefs: string[] = [];
  for (const assessed of assessedRows) {
    if (
      assessed.evidenceEventRefs.length === 0 ||
      new Set(assessed.evidenceEventRefs).size !==
        assessed.evidenceEventRefs.length ||
      assessed.evidenceEventRefs.some(
        (eventRef) =>
          !targetRelation.targetAdmission.evidenceEventRefs.includes(eventRef)
      )
    ) {
      throw new TypeError(
        "result assessment relation requires exact evidence event refs for every obligation"
      );
    }
    for (const evidenceEventRef of assessed.evidenceEventRefs) {
      const evidenceRows = events.filter(
        (event) => event.eventId === evidenceEventRef
      );
      const evidence = evidenceRows[0];
      if (
        evidenceRows.length !== 1 ||
        evidence === undefined ||
        evidence.kind !== "evidence_admitted" ||
        evidence.eventAdmissionOrdinal >= assessed.eventAdmissionOrdinal ||
        !sameLocus(evidence, assessed) ||
        !evidence.complete ||
        evidence.shallow ||
        evidence.contradictsAuthority ||
        evidence.deferred
      ) {
        throw new TypeError(
          "result assessment relation requires every assessed evidence event ref to resolve exactly"
        );
      }
      const snapshots = events.filter(
        (event) =>
          event.kind === "authority_snapshot_admitted" &&
          event.eventAdmissionOrdinal < evidence.eventAdmissionOrdinal &&
          sameLocus(event, assessed) &&
          event.authoritySnapshotRef === evidence.authorityRef &&
          event.authorityRefs.includes(assessed.obligationId) &&
          event.authorityDigest === evidence.authorityDigest &&
          event.inputDigest === evidence.inputDigest &&
          event.closureCapable &&
          !event.contradictoryAuthority &&
          event.deferredAuthorityRefs.length === 0 &&
          event.providerRefs.length > 0
      );
      const snapshot = snapshots[0];
      if (
        snapshots.length !== 1 ||
        snapshot === undefined ||
        snapshot.kind !== "authority_snapshot_admitted"
      ) {
        throw new TypeError(
          "result assessment relation requires one exact target authority snapshot"
        );
      }
      const validatedRows = events.filter(
        (event) =>
          event.eventId === targetRelation.targetAdmission.validatedEventRef
      );
      const validated = validatedRows[0];
      if (
        validatedRows.length !== 1 ||
        validated === undefined ||
        validated.kind !== "payload_validated"
      ) {
        throw new TypeError(
          "result assessment relation requires one exact validation for every evidence event"
        );
      }
      const observedRows = events.filter(
        (event) => event.eventId === targetRelation.targetAdmission.observedEventRef
      );
      const observed = observedRows[0];
      if (
        observedRows.length !== 1 ||
        observed === undefined ||
        observed.kind !== "payload_observed" ||
        observed.eventAdmissionOrdinal <= snapshot.eventAdmissionOrdinal ||
        observed.eventAdmissionOrdinal >= validated.eventAdmissionOrdinal ||
        validated.eventAdmissionOrdinal >= evidence.eventAdmissionOrdinal ||
        !sameLocus(observed, assessed) ||
        observed.payloadRef !== assessed.runtimeResultRef ||
        observed.digest !== assessed.runtimeResultDigest ||
        observed.payloadRef !== evidence.payloadRef ||
        observed.digest !== validated.digest ||
        observed.contractRef !== validated.contractRef ||
        observed.sourceEventRef !== targetRelation.cCall.ref ||
        observed.authorityRef !== snapshot.authoritySnapshotRef ||
        observed.inputDigest !== evidence.inputDigest ||
        !snapshot.providerRefs.includes(observed.producerRef) ||
        !evidence.providerRefs.every((providerRef) =>
          snapshot.providerRefs.includes(providerRef)
        )
      ) {
        throw new TypeError(
          "result assessment relation requires one exact observed and provider-bound evidence payload"
        );
      }
      evidenceEventRefs.push(evidence.eventId);
    }
  }

  const admissionRows = events.filter(
    (event) =>
      event.kind === "public_operation_admitted" &&
      "definitionKey" in event &&
      event.eventAdmissionOrdinal < first.eventAdmissionOrdinal &&
      event.definitionKey.operationId === "abg.operation.result.assess" &&
      event.invocationAuthorityRef === first.authorityRef &&
      event.actorRef === first.actor
  );
  if (
    first.authorityRef === null ||
    assessedRows.some(
      (event) =>
        event.authorityRef !== first.authorityRef ||
        event.actor !== first.actor
    ) ||
    admissionRows.length !== 1
  ) {
    throw new TypeError(
      "result assessment relation requires one exact public invocation authority"
    );
  }
  const replayDigest = stableSha256Digest({
    assessmentRef: input.assessmentRef,
    runtimeSubject: input.runtimeSubject,
    assessedEventRefs: assessedRows.map((event) => event.eventId),
    evidenceEventRefs
  });
  return Object.freeze({
    kind: "result_assessment_runtime_subject_relation",
    assessment: Object.freeze({
      ref: input.assessmentRef,
      digest: assessmentDigest(input.assessmentRef)
    }),
    runtimeSubject: Object.freeze({
      ...input.runtimeSubject,
      runtimeResult: Object.freeze({ ...input.runtimeSubject.runtimeResult })
    }),
    assessmentContract: Object.freeze({
      ref: first.assessmentContractRef,
      digest: first.assessmentContractDigest
    }),
    obligationIds: Object.freeze(obligationIds),
    assessedEventRefs: Object.freeze(
      assessedRows.map((event) => event.eventId)
    ),
    evidenceEventRefs: Object.freeze([...new Set(evidenceEventRefs)]),
    replay: Object.freeze({
      ref: `replay:result-assessment:${input.assessmentRef.slice("assessment:".length)}`,
      digest: replayDigest
    })
  });
}
