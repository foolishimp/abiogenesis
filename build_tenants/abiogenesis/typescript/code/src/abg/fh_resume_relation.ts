import type { ClosureContract } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  admittedConstructionComposition,
  hasAdmittedExecutionBasisAtPrefix,
  type ExecutionBasis,
} from "./execution_basis.js";
import {
  runtimeEventsFromValidatedPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  rehydrateConstructionIntentForCursorAtPrefix,
} from "./traversal_route.js";
import {
  isTraversalCursorCandidate,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export interface FhResumeSuccessorInput {
  readonly kind: "fh_resume_successor_input";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
  readonly inputContractRef: string | null;
  readonly inputValueKind: string | null;
}

export interface FhResumeSuccessorCarrier {
  readonly inputContractRef: string | null;
  readonly inputValueKind: string | null;
}

export interface FhResumeContinuationBasis {
  readonly continuationRef: string;
  readonly status: "abandoned" | "open" | "responded" | "resolved" | "superseded";
  readonly responseContractRef: string;
  readonly constructionIntentRef: string | null;
  readonly constructionIntentDigest: Sha256Digest | null;
  readonly responseRef: string | null;
  readonly responseDigest: Sha256Digest | null;
  readonly responseValue: JsonValue | null;
  readonly openedEventRef: string;
  readonly respondedEventRef: string | null;
  readonly respondedPublicOperationEventRef: string | null;
}

export interface FhResumeOperationBasis {
  readonly admissionEventRef: string;
}

function isRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deriveFhResumeSuccessorInputAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  continuation: FhResumeContinuationBasis,
  operation: FhResumeOperationBasis,
  executionBasis: ExecutionBasis,
  closureContract: Readonly<ClosureContract>,
  successorCarrier: FhResumeSuccessorCarrier,
): FhResumeSuccessorInput {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const continuationRef = continuation.continuationRef;
  if (
    continuation.status !== "responded" ||
    continuation.responseRef === null ||
    continuation.responseDigest === null ||
    !isRecord(continuation.responseValue)
  ) {
    throw new TypeError(
      "F_H successor input requires one exact responded continuation",
    );
  }
  const carrierPairIsNull = successorCarrier.inputContractRef === null &&
    successorCarrier.inputValueKind === null;
  const carrierPairIsPresent =
    typeof successorCarrier.inputContractRef === "string" &&
    successorCarrier.inputContractRef.length > 0 &&
    typeof successorCarrier.inputValueKind === "string" &&
    successorCarrier.inputValueKind.length > 0;
  if (!carrierPairIsNull && !carrierPairIsPresent) {
    throw new TypeError(
      "F_H successor input contract and value kind must be jointly null or present",
    );
  }
  if (continuation.constructionIntentRef === null) {
    if (
      successorCarrier.inputContractRef !== null &&
      successorCarrier.inputContractRef !== continuation.responseContractRef
    ) {
      throw new TypeError(
        "direct F_H continuation target and response contracts differ",
      );
    }
    return deepFreeze({
      kind: "fh_resume_successor_input" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      inputRef: continuation.responseRef,
      inputDigest: continuation.responseDigest,
      inputValue: continuation.responseValue,
      inputContractRef: successorCarrier.inputContractRef,
      inputValueKind: successorCarrier.inputValueKind,
    });
  }
  if (
    successorCarrier.inputContractRef === null ||
    successorCarrier.inputValueKind !== "action_evaluation_basis"
  ) {
    throw new TypeError(
      "construction F_H continuation requires an action_evaluation_basis successor carrier",
    );
  }
  const opened = events.find(
    (event) => event.eventId === continuation.openedEventRef,
  );
  const heldCursor =
    opened !== undefined && isRecord(opened.payload) &&
      isRecord(opened.payload.heldCursor)
      ? opened.payload.heldCursor
      : null;
  if (
    heldCursor === null ||
    !isTraversalCursorCandidate(
      heldCursor as unknown as TraversalCursorCandidate,
    ) ||
    !hasAdmittedExecutionBasisAtPrefix(prefix, executionBasis) ||
    executionBasis.basisRef !== opened?.basisId ||
    closureContract.closureContractRef !== executionBasis.closureContractRef ||
    sha256Canonical(closureContract as unknown as JsonValue) !==
      executionBasis.closureContractDigest
  ) {
    throw new TypeError(
      "construction successor input requires its exact admitted execution basis",
    );
  }
  const heldCursorCandidate =
    heldCursor as unknown as TraversalCursorCandidate;
  const intent = rehydrateConstructionIntentForCursorAtPrefix(
    prefix,
    heldCursorCandidate,
  );
  if (
    intent === null ||
    intent.constructionIntentRef !== continuation.constructionIntentRef ||
    intent.constructionIntentDigest !== continuation.constructionIntentDigest ||
    intent.executionBasisRef !== executionBasis.basisRef
  ) {
    throw new TypeError(
      "construction successor input requires its exact admitted intent",
    );
  }
  const intentEvent = events.find(
    (event) => event.eventId === intent.admissionEventRef,
  );
  const nextActionBasis =
    intentEvent !== undefined && isRecord(intentEvent.payload) &&
      isRecord(intentEvent.payload.nextActionBasis)
      ? intentEvent.payload.nextActionBasis
      : null;
  const composition = admittedConstructionComposition(executionBasis);
  const declaredPolicy =
    nextActionBasis !== null && isRecord(nextActionBasis.declaredPolicy)
      ? nextActionBasis.declaredPolicy
      : null;
  const semanticEvidenceAssetRefs =
    Array.isArray(continuation.responseValue.semanticEvidenceAssetRefs) &&
      continuation.responseValue.semanticEvidenceAssetRefs.every(
        (value) => typeof value === "string" && value.length > 0,
      )
      ? continuation.responseValue.semanticEvidenceAssetRefs as readonly string[]
      : null;
  if (
    nextActionBasis === null ||
    nextActionBasis.kind !== "next_action_basis" ||
    nextActionBasis.basisRef !== intent.nextActionBasisRef ||
    nextActionBasis.basisDigest !== intent.nextActionBasisDigest ||
    composition === null ||
    composition.compositionRef !== intent.constructionCompositionRef ||
    composition.compositionDigest !== intent.constructionCompositionDigest ||
    declaredPolicy === null ||
    sha256Canonical(declaredPolicy) !==
      sha256Canonical(composition.closurePolicy as unknown as JsonValue) ||
    semanticEvidenceAssetRefs === null ||
    semanticEvidenceAssetRefs.join("\0") !== intent.outputAssetRefs.join("\0")
  ) {
    throw new TypeError(
      "construction successor input requires its exact admitted basis, Product policy, and observed evidence",
    );
  }
  const body = {
    kind: "action_evaluation_basis" as const,
    schemaVersion: "5.0.0" as const,
    constructionIntent: intent as unknown as JsonValue,
    nextActionBasis,
    admittedEvidence: [{
      kind: "admitted_semantic_evidence" as const,
      schemaVersion: "5.0.0" as const,
      responseContractRef: continuation.responseContractRef,
      responseRef: continuation.responseRef,
      responseDigest: continuation.responseDigest,
      responseValue: continuation.responseValue,
      semanticEvidenceAssetRefs,
      admissionEventRef: continuation.respondedEventRef!,
    }],
    workspaceBinding: {
      workspaceBindingId: executionBasis.workspaceBindingId,
      workspaceBindingDigest: executionBasis.workspaceBindingDigest,
    },
    actionCatalog: {
      actionCatalogRef: intent.actionCatalogRef,
      actionCatalogDigest: intent.actionCatalogDigest,
      actionCatalogRowDigest: intent.actionCatalogRowDigest,
      selectedActionRef: intent.selectedActionRef,
    },
    closurePolicy: composition.closurePolicy,
    runtimeEvidenceEventRefs: [
      intent.admissionEventRef,
      continuation.openedEventRef,
      continuation.respondedPublicOperationEventRef!,
      continuation.respondedEventRef!,
      operation.admissionEventRef,
    ],
  };
  const runtimeEvidenceRows = body.runtimeEvidenceEventRefs.map((eventRef) =>
    events.find((event) => event.eventId === eventRef)
  );
  if (
    continuation.respondedPublicOperationEventRef === null ||
    new Set(body.runtimeEvidenceEventRefs).size !== 5 ||
    runtimeEvidenceRows.some((event) => event === undefined) ||
    runtimeEvidenceRows.some((event, index) =>
      index > 0 && event!.admissionOrdinal <=
        runtimeEvidenceRows[index - 1]!.admissionOrdinal
    )
  ) {
    throw new TypeError(
      "construction F_H continuation requires five distinct ordered runtime evidence events",
    );
  }
  const basisDigest = sha256Canonical(body as unknown as JsonValue);
  const inputValue = deepFreeze({
    ...body,
    basisRef:
      `action-evaluation-basis://abiogenesis/${basisDigest.slice("sha256:".length)}`,
    basisDigest,
  });
  const inputDigest = sha256Canonical(inputValue as unknown as JsonValue);
  return deepFreeze({
    kind: "fh_resume_successor_input" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    inputRef: inputValue.basisRef,
    inputDigest,
    inputValue: inputValue as unknown as Readonly<Record<string, JsonValue>>,
    inputContractRef: successorCarrier.inputContractRef,
    inputValueKind: successorCarrier.inputValueKind,
  });
}
