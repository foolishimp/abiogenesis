import { indexedRuntimeEvents } from "./event_prefix.js";
import { isOptionalJsonRecord as isRecord } from "../shared/admission_predicates.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { admittedConstructionComposition, hasAdmittedExecutionBasisAtPrefix, } from "./execution_basis.js";
import { runtimeEventBodiesAtPrefix, } from "./event_prefix.js";
import { rehydrateConstructionIntentForCursorAtPrefix, } from "./traversal_route.js";
import { isTraversalCursorCandidate, } from "./traversal_cursor.js";
export function deriveFhResumeSuccessorInputAtPrefix(prefix, continuation, operation, executionBasis, closureContract, successorCarrier) {
    const events = runtimeEventBodiesAtPrefix(prefix);
    const continuationRef = continuation.continuationRef;
    if (continuation.status !== "responded" ||
        continuation.responseRef === null ||
        continuation.responseDigest === null ||
        !isRecord(continuation.responseValue)) {
        throw new TypeError("F_H successor input requires one exact responded continuation");
    }
    const carrierPairIsNull = successorCarrier.inputContractRef === null &&
        successorCarrier.inputValueKind === null;
    const carrierPairIsPresent = typeof successorCarrier.inputContractRef === "string" &&
        successorCarrier.inputContractRef.length > 0 &&
        typeof successorCarrier.inputValueKind === "string" &&
        successorCarrier.inputValueKind.length > 0;
    if (!carrierPairIsNull && !carrierPairIsPresent) {
        throw new TypeError("F_H successor input contract and value kind must be jointly null or present");
    }
    if (continuation.constructionIntentRef === null) {
        if (successorCarrier.inputContractRef !== null &&
            successorCarrier.inputContractRef !== continuation.responseContractRef) {
            throw new TypeError("direct F_H continuation target and response contracts differ");
        }
        return deepFreeze({
            kind: "fh_resume_successor_input",
            schemaVersion: "5.0.0",
            disposition: "admitted",
            inputRef: continuation.responseRef,
            inputDigest: continuation.responseDigest,
            inputValue: continuation.responseValue,
            inputContractRef: successorCarrier.inputContractRef,
            inputValueKind: successorCarrier.inputValueKind,
        });
    }
    if (successorCarrier.inputContractRef === null ||
        successorCarrier.inputValueKind !== "action_evaluation_basis") {
        throw new TypeError("construction F_H continuation requires an action_evaluation_basis successor carrier");
    }
    const opened = indexedRuntimeEvents(prefix, "id:" + continuation.openedEventRef).find((event) => event.eventId === continuation.openedEventRef);
    const heldCursor = opened !== undefined && isRecord(opened.payload) &&
        isRecord(opened.payload.heldCursor)
        ? opened.payload.heldCursor
        : null;
    if (heldCursor === null ||
        !isTraversalCursorCandidate(heldCursor) ||
        !hasAdmittedExecutionBasisAtPrefix(prefix, executionBasis) ||
        executionBasis.basisRef !== opened?.basisId ||
        closureContract.closureContractRef !== executionBasis.closureContractRef ||
        sha256Canonical(closureContract) !==
            executionBasis.closureContractDigest) {
        throw new TypeError("construction successor input requires its exact admitted execution basis");
    }
    const heldCursorCandidate = heldCursor;
    const intent = rehydrateConstructionIntentForCursorAtPrefix(prefix, heldCursorCandidate);
    if (intent === null ||
        intent.constructionIntentRef !== continuation.constructionIntentRef ||
        intent.constructionIntentDigest !== continuation.constructionIntentDigest ||
        intent.executionBasisRef !== executionBasis.basisRef) {
        throw new TypeError("construction successor input requires its exact admitted intent");
    }
    const intentEvent = indexedRuntimeEvents(prefix, "id:" + intent.admissionEventRef).find((event) => event.eventId === intent.admissionEventRef);
    const nextActionBasis = intentEvent !== undefined && isRecord(intentEvent.payload) &&
        isRecord(intentEvent.payload.nextActionBasis)
        ? intentEvent.payload.nextActionBasis
        : null;
    const composition = admittedConstructionComposition(executionBasis);
    const declaredPolicy = nextActionBasis !== null && isRecord(nextActionBasis.declaredPolicy)
        ? nextActionBasis.declaredPolicy
        : null;
    const semanticEvidenceAssetRefs = Array.isArray(continuation.responseValue.semanticEvidenceAssetRefs) &&
        continuation.responseValue.semanticEvidenceAssetRefs.every((value) => typeof value === "string" && value.length > 0)
        ? continuation.responseValue.semanticEvidenceAssetRefs
        : null;
    if (nextActionBasis === null ||
        nextActionBasis.kind !== "next_action_basis" ||
        nextActionBasis.basisRef !== intent.nextActionBasisRef ||
        nextActionBasis.basisDigest !== intent.nextActionBasisDigest ||
        composition === null ||
        composition.compositionRef !== intent.constructionCompositionRef ||
        composition.compositionDigest !== intent.constructionCompositionDigest ||
        declaredPolicy === null ||
        sha256Canonical(declaredPolicy) !==
            sha256Canonical(composition.closurePolicy) ||
        semanticEvidenceAssetRefs === null ||
        semanticEvidenceAssetRefs.join("\0") !== intent.outputAssetRefs.join("\0")) {
        throw new TypeError("construction successor input requires its exact admitted basis, Product policy, and observed evidence");
    }
    const body = {
        kind: "action_evaluation_basis",
        schemaVersion: "5.0.0",
        constructionIntent: intent,
        nextActionBasis,
        admittedEvidence: [{
                kind: "admitted_semantic_evidence",
                schemaVersion: "5.0.0",
                responseContractRef: continuation.responseContractRef,
                responseRef: continuation.responseRef,
                responseDigest: continuation.responseDigest,
                responseValue: continuation.responseValue,
                semanticEvidenceAssetRefs,
                admissionEventRef: continuation.respondedEventRef,
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
            continuation.respondedPublicOperationEventRef,
            continuation.respondedEventRef,
            operation.admissionEventRef,
        ],
    };
    const runtimeEvidenceRows = body.runtimeEvidenceEventRefs.map((eventRef) => indexedRuntimeEvents(prefix, "id:" + eventRef).find((event) => event.eventId === eventRef));
    if (continuation.respondedPublicOperationEventRef === null ||
        new Set(body.runtimeEvidenceEventRefs).size !== 5 ||
        runtimeEvidenceRows.some((event) => event === undefined) ||
        runtimeEvidenceRows.some((event, index) => index > 0 && event.admissionOrdinal <=
            runtimeEvidenceRows[index - 1].admissionOrdinal)) {
        throw new TypeError("construction F_H continuation requires five distinct ordered runtime evidence events");
    }
    const basisDigest = sha256Canonical(body);
    const inputValue = deepFreeze({
        ...body,
        basisRef: `action-evaluation-basis://abiogenesis/${basisDigest.slice("sha256:".length)}`,
        basisDigest,
    });
    const inputDigest = sha256Canonical(inputValue);
    return deepFreeze({
        kind: "fh_resume_successor_input",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        inputRef: inputValue.basisRef,
        inputDigest,
        inputValue: inputValue,
        inputContractRef: successorCarrier.inputContractRef,
        inputValueKind: successorCarrier.inputValueKind,
    });
}
