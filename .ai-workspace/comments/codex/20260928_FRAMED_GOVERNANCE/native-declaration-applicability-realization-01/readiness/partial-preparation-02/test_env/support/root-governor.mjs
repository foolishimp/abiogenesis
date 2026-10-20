import { isDeepStrictEqual } from "node:util";

export const ABI5_ROOT_BINDING = "ABI5-ROOT-001";
export const ABI5_ROOT_GOVERNOR = "abg5.root.s01.hello_world@5";
export const ABI5_ROOT_PROGRAM_REF =
  "program://abiogenesis/conformance/hello-world@5";
export const ABI5_ROOT_DEFINITION_REF =
  "graph-function://abiogenesis/conformance/hello-world@5";

const OBLIGATIONS = Object.freeze([
  "R1",
  "R2",
  "R3",
  "R4",
  "R5",
  "R6",
  "R7",
  "R8",
  "R9",
  "R10",
]);

const ROOT_OPERATION_ORDER = Object.freeze([
  "abg.operation.product.verify",
  "abg.operation.product.resolve",
  "abg.operation.product.install",
  "abg.operation.workspace.bind",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.view",
  "abg.operation.run.invoke",
]);

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function succeeded(outcome, operationId) {
  return isRecord(outcome) &&
    outcome.kind === "public_outcome" &&
    outcome.schemaVersion === "5.0.0" &&
    outcome.operationId === operationId &&
    outcome.disposition === "succeeded";
}

function oneOwnerFact(view, owner, predicate = () => true) {
  if (!Array.isArray(view?.ownerFacts)) return null;
  const matches = view.ownerFacts.filter((fact) =>
    fact?.owner === owner && predicate(fact)
  );
  return matches.length === 1 ? matches[0] : null;
}

function exactTransportChain(transport) {
  const transportRuns = transport?.transportRuns;
  if (
    !Array.isArray(transportRuns) ||
    transportRuns.length !== ROOT_OPERATION_ORDER.length
  ) return false;
  for (const [index, transportRun] of transportRuns.entries()) {
    const request = transportRun?.transportRequest;
    const result = transportRun?.transportResult;
    const expectedOperationId = ROOT_OPERATION_ORDER[index];
    if (
      transportRun?.executor !== "abg.cli" ||
      request?.kind !== "abg_cli_transport_request" ||
      request?.schemaVersion !== "5.0.0" ||
      !isRecord(request.acquisition) ||
      !isRecord(request.invocation) ||
      request.invocation.operationId !== expectedOperationId ||
      typeof request.invocation.invocationRef !== "string" ||
      request.invocation.invocationRef.length === 0 ||
      result?.kind !== "abg_cli_transport_result" ||
      result?.schemaVersion !== "5.0.0" ||
      result.disposition !== "completed" ||
      result.acquisitionKind !== request.acquisition?.kind ||
      !isRecord(result.outcome) ||
      result.outcome.operationId !== expectedOperationId ||
      result.outcome.invocationRef !== request.invocation.invocationRef
    ) return false;
    if (index === 0) {
      if (
        request.acquisition.kind !== "new" ||
        result.entryPrefix?.kind !== "durable_prefix_coordinate" ||
        result.entryPrefix?.prefixLength !== 0 ||
        result.closeHandoff?.reopenAuthority?.eventLogPath !==
          request.acquisition.eventLogPath ||
        result.entryPrefix?.eventLogRef !==
          result.closeHandoff?.prefix?.eventLogRef
      ) return false;
    } else if (
      request.acquisition.kind !== "reopen" ||
      !isDeepStrictEqual(
        request.acquisition.closeHandoff,
        transportRuns[index - 1]?.transportResult?.closeHandoff,
      ) ||
      !isDeepStrictEqual(
        result.entryPrefix,
        request.acquisition.closeHandoff.prefix,
      )
    ) return false;
  }
  if (
    new Set(transportRuns.map(
      (transportRun) => transportRun.transportRequest.invocation.invocationRef,
    ))
      .size !== ROOT_OPERATION_ORDER.length
  ) return false;
  return isDeepStrictEqual(
    transport.finalCloseHandoff,
    transportRuns.at(-1)?.transportResult?.closeHandoff,
  );
}

export function evaluateAbi5Root({ ownerEvidence }) {
  const evidence = ownerEvidence;
  const product = evidence?.product;
  const abg = evidence?.abg;
  const publicProjection = evidence?.public;
  const failures = [];
  const obligationResults = Object.fromEntries(
    OBLIGATIONS.map((id) => [id, false]),
  );
  const requireObligation = (id, condition, failure) => {
    obligationResults[id] = condition;
    if (!condition) failures.push(failure);
    return condition;
  };

  const r1 = requireObligation(
    "R1",
    evidence?.kind === "abi5_root_owner_evidence" &&
      evidence?.schemaVersion === "5.0.0" &&
      evidence?.bindingId === ABI5_ROOT_BINDING &&
      product?.verifiedProductValid === true &&
      succeeded(
        publicProjection?.verifyOutcome,
        "abg.operation.product.verify",
      ) &&
      isDeepStrictEqual(
        publicProjection?.verifyOutcome?.result,
        product?.verifiedProduct,
      ),
    "R1 lacks one Product-validated verified artifact projection",
  );

  const r2 = requireObligation(
    "R2",
    r1 &&
      product?.resolvedLockValid === true &&
      product?.verifiedProductMatchesResolvedLock === true &&
      succeeded(
        publicProjection?.resolveOutcome,
        "abg.operation.product.resolve",
      ) &&
      succeeded(
        publicProjection?.installOutcome,
        "abg.operation.product.install",
      ) &&
      isDeepStrictEqual(
        publicProjection?.resolveOutcome?.result,
        product?.resolvedLock,
      ) &&
      isDeepStrictEqual(
        product?.admittedInstall?.resolvedLock,
        product?.resolvedLock,
      ) &&
      isDeepStrictEqual(
        product?.admittedInstall?.install,
        publicProjection?.installOutcome?.result,
      ),
    "R2 lacks one ABG-projected admitted ProductInstall over the Product lock",
  );

  const r3 = requireObligation(
    "R3",
    r2 &&
      succeeded(
        publicProjection?.workspaceOutcome,
        "abg.operation.workspace.bind",
      ) &&
      isDeepStrictEqual(
        product?.admittedWorkspace?.binding,
        publicProjection?.workspaceOutcome?.result,
      ) &&
      product?.admittedWorkspace?.invocationRef ===
        publicProjection?.workspaceOutcome?.invocationRef,
    "R3 lacks one ABG-projected admitted WorkspaceBinding",
  );

  const r4 = requireObligation(
    "R4",
    r3 &&
      succeeded(
        publicProjection?.catalogOutcome,
        "abg.operation.catalog.admit",
      ) &&
      succeeded(
        publicProjection?.viewOutcome,
        "abg.operation.catalog.view",
      ) &&
      publicProjection?.catalogOutcome?.result?.basisDigest ===
        publicProjection?.viewOutcome?.result?.catalogBasisDigest &&
      publicProjection?.catalogOutcome?.result?.workspaceBindingId ===
        product?.admittedWorkspace?.binding?.bindingId &&
      publicProjection?.catalogOutcome?.result?.workspaceBindingDigest ===
        product?.admittedWorkspace?.binding?.bindingDigest,
    "R4 lacks one Product-owned Catalog and exact CatalogView projected through Public",
  );

  const r5 = requireObligation(
    "R5",
    r4 &&
      succeeded(
        publicProjection?.runOutcome,
        "abg.operation.run.invoke",
      ) &&
      publicProjection?.runRequest?.kind === "public_invocation" &&
      publicProjection?.runRequest?.operationId ===
        "abg.operation.run.invoke" &&
      publicProjection?.runRequest?.invocationRef ===
        publicProjection?.runOutcome?.invocationRef &&
      abg?.effectfulRunTruth?.disposition === "duplicate" &&
      abg?.effectfulRunTruth?.priorAdmission?.publicInvocationRef ===
        publicProjection?.runRequest?.invocationRef &&
      abg?.effectfulRunTruth?.priorAdmission?.ownerInvocationRef ===
        publicProjection?.runOutcome?.runtimeInvocationRef,
    "R5 lacks one ABG-projected exact effectful Run invocation",
  );

  const basisAtom = abg?.semanticReplay?.eventAtoms?.filter((atom) =>
    atom.eventKind === "basis_admitted"
  ) ?? [];
  const r6 = requireObligation(
    "R6",
    r5 &&
      abg?.executionBasis?.kind === "execution_basis" &&
      abg?.executionBasis?.disposition === "admitted" &&
      abg?.executionBasis?.basisClass === "root" &&
      basisAtom.length === 1 &&
      basisAtom[0]?.basisId === abg?.executionBasis?.basisRef &&
      abg?.executionBasis?.invocationRef ===
        publicProjection?.runOutcome?.runtimeInvocationRef,
    "R6 lacks one ABG-rehydrated root ExecutionBasis",
  );

  const r7 = requireObligation(
    "R7",
    r6 &&
      abg?.executionBasis?.workspaceBindingId ===
        product?.admittedWorkspace?.binding?.bindingId &&
      abg?.executionBasis?.workspaceBindingDigest ===
        product?.admittedWorkspace?.binding?.bindingDigest &&
      abg?.executionBasis?.catalogViewDigest ===
        publicProjection?.viewOutcome?.result?.viewDigest &&
      product?.selectedCatalogEntry?.handle ===
        publicProjection?.runRequest?.payload?.catalogHandle &&
      product?.selectedCatalogEntry?.definitionRef ===
        ABI5_ROOT_DEFINITION_REF &&
      Array.isArray(product?.selectedCatalogEntry?.programMembershipRefs) &&
      product.selectedCatalogEntry.programMembershipRefs.includes(
        ABI5_ROOT_PROGRAM_REF,
      ) &&
      publicProjection?.runRequest?.payload?.programRef ===
        ABI5_ROOT_PROGRAM_REF &&
      abg?.executionBasis?.programRef ===
        ABI5_ROOT_PROGRAM_REF &&
      abg?.executionBasis?.graphFunctionRef ===
        ABI5_ROOT_DEFINITION_REF &&
      abg.executionBasis.graphFunctionRef ===
        product.selectedCatalogEntry.definitionRef &&
      abg.executionBasis.graphFunctionDigest ===
        product.selectedCatalogEntry.definitionDigest,
    "R7 owner projections do not bind one exact workspace, view, Program, and GraphFunction",
  );

  const cCallFact = oneOwnerFact(
    abg?.semanticReplay,
    "c_call",
    (fact) => fact.cCallRef === publicProjection?.runOutcome?.cCallRef,
  );
  const r8 = requireObligation(
    "R8",
    r7 &&
      abg?.semanticReplay?.kind === "run_semantic_relation_view" &&
      abg?.semanticReplay?.runId === publicProjection?.runOutcome?.runId &&
      abg?.semanticReplay?.lifecycle?.traversalCursorPresent === true &&
      abg?.semanticReplay?.lifecycle?.invocationRefused === false &&
      abg?.semanticReplay?.lifecycle?.runtimeFailed === false &&
      cCallFact?.phase === "judged",
    "R8 lacks one successful ABG semantic traversal and CCall projection",
  );

  const replayedCall = abg?.replayFirst?.cCalls?.filter((call) =>
    call.cCallRef === publicProjection?.runOutcome?.cCallRef
  ) ?? [];
  const r9 = requireObligation(
    "R9",
    r8 &&
      abg?.semanticReplay?.runtimeStatus === "closed" &&
      abg?.semanticReplay?.lifecycle?.terminalReached === true &&
      abg?.semanticReplay?.lifecycle?.frameClosed === true &&
      abg?.semanticReplay?.lifecycle?.graphCallClosed === true &&
      abg?.semanticReplay?.lifecycle?.runClosed === true &&
      abg?.semanticReplay?.lifecycle?.runStopped === false &&
      replayedCall.length === 1 &&
      replayedCall[0]?.status === "judged" &&
      replayedCall[0]?.resultRef === publicProjection?.runOutcome?.resultRef &&
      replayedCall[0]?.resultContractRef ===
        publicProjection?.runOutcome?.admittedResultContractRef &&
      replayedCall[0]?.judgmentRef ===
        publicProjection?.runOutcome?.judgmentRef &&
      isDeepStrictEqual(
        replayedCall[0]?.resultValue,
        publicProjection?.runOutcome?.result,
      ),
    "R9 lacks one closed replay-owned result and judgment relation",
  );

  const rawOutcomeProjection = evidence?.transport?.transportRuns
    ?.flatMap((transportRun) =>
      transportRun?.transportResult?.outcome === undefined
        ? []
        : [transportRun.transportResult.outcome]
    ) ?? [];
  const r10 = requireObligation(
    "R10",
    r9 &&
      exactTransportChain(evidence?.transport) &&
      isDeepStrictEqual(
        rawOutcomeProjection,
        publicProjection?.transportOutcomeProjection,
      ) &&
      isDeepStrictEqual(abg?.replayFirst, abg?.replaySecond) &&
      abg?.semanticReplay?.physicalCoordinates?.scopedReplayRef ===
        abg?.replayFirst?.replayRef &&
      abg?.semanticReplay?.physicalCoordinates?.scopedReplayDigest ===
        abg?.replayFirst?.replayDigest &&
      publicProjection?.runOutcome?.replayRef === abg?.replayFirst?.replayRef &&
      publicProjection?.runOutcome?.replayDigest ===
        abg?.replayFirst?.replayDigest &&
      publicProjection?.runOutcome?.replayAgreement === true,
    "R10 raw installed CLI transports, Public outcome, and two ABG replay folds disagree",
  );

  const firstFrontier = OBLIGATIONS.find(
    (id) => obligationResults[id] !== true,
  ) ?? null;
  return Object.freeze({
    kind: "abi5_root_governor_result",
    schemaVersion: "5.0.0",
    bindingId: ABI5_ROOT_BINDING,
    governorId: ABI5_ROOT_GOVERNOR,
    disposition: r10 && failures.length === 0
      ? "root_satisfied"
      : "root_red",
    obligationResults: Object.freeze(obligationResults),
    firstFrontier,
    ownerSemanticViewRef: abg?.semanticReplay?.viewRef ?? null,
    ownerSemanticViewDigest: abg?.semanticReplay?.viewDigest ?? null,
    ownerReplayRef: abg?.replayFirst?.replayRef ?? null,
    failures: Object.freeze([...new Set(failures)]),
  });
}
