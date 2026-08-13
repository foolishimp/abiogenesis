function outcomeFor(outcomes, operationId) {
  const matches = outcomes.filter((outcome) =>
    outcome?.operationId === operationId
  );
  return matches.length === 1 ? matches[0] : null;
}

function invocationFor(transportRequests, operationId) {
  const matches = transportRequests
    .map((request) => request?.invocation)
    .filter((invocation) => invocation?.operationId === operationId);
  return matches.length === 1 ? matches[0] : null;
}

function safely(project) {
  try {
    return project();
  } catch {
    return null;
  }
}

export function projectAbi5RootOwnerEvidence({
  product,
  abg,
  run,
}) {
  const transportRuns = run.transportRuns ?? [];
  const transportRequests = transportRuns.map(
    (transportRun) => transportRun?.transportRequest ?? null,
  );
  const transportResults = transportRuns.map(
    (transportRun) => transportRun?.transportResult ?? null,
  );
  const transportOutcomeProjection = transportResults.flatMap(
    (transportResult) => transportResult?.outcome === undefined
      ? []
      : [transportResult.outcome],
  );
  const verifyOutcome = outcomeFor(
    transportOutcomeProjection,
    "abg.operation.product.verify",
  );
  const resolveOutcome = outcomeFor(
    transportOutcomeProjection,
    "abg.operation.product.resolve",
  );
  const installOutcome = outcomeFor(
    transportOutcomeProjection,
    "abg.operation.product.install",
  );
  const workspaceOutcome = outcomeFor(
    transportOutcomeProjection,
    "abg.operation.workspace.bind",
  );
  const catalogOutcome = outcomeFor(
    transportOutcomeProjection,
    "abg.operation.catalog.admit",
  );
  const viewOutcome = outcomeFor(
    transportOutcomeProjection,
    "abg.operation.catalog.view",
  );
  const runOutcome = outcomeFor(
    transportOutcomeProjection,
    "abg.operation.run.invoke",
  );
  const runRequest = invocationFor(
    transportRequests,
    "abg.operation.run.invoke",
  );
  const installRequest = invocationFor(
    transportRequests,
    "abg.operation.product.install",
  );
  const workspaceRequest = invocationFor(
    transportRequests,
    "abg.operation.workspace.bind",
  );
  const selectedCatalogEntry =
    viewOutcome?.result?.kind === "graph_function_catalog_view" &&
      typeof runRequest?.payload?.catalogHandle === "string"
      ? safely(() => product.lookupGraphFunction(
          viewOutcome.result,
          runRequest.payload.catalogHandle,
        ))
      : null;
  const finalCloseHandoff = transportRuns.at(-1)?.transportResult
    ?.closeHandoff ?? null;
  const durablePrefix = finalCloseHandoff?.prefix ?? null;
  const artifactTruth = durablePrefix === null
    ? null
    : safely(() => abg.projectExactPrefixArtifactTruth(durablePrefix));
  const resolvedLock = resolveOutcome?.result ?? null;
  const admittedInstall = artifactTruth?.kind ===
      "exact_prefix_artifact_truth_projection" &&
      typeof installRequest?.invocationRef === "string"
    ? safely(() => abg.projectAdmittedProductInstallByInvocationRef(
        artifactTruth,
        installRequest.invocationRef,
      ))
    : null;
  const admittedWorkspace = artifactTruth?.kind ===
        "exact_prefix_artifact_truth_projection" &&
      resolvedLock !== null &&
      typeof workspaceRequest?.invocationRef === "string"
    ? safely(() => abg.projectAdmittedWorkspaceBindingByInvocationRef(
        artifactTruth,
        workspaceRequest.invocationRef,
        resolvedLock,
      ))
    : null;
  const effectfulRunTruth = durablePrefix === null ||
      typeof runRequest?.invocationRef !== "string"
    ? null
    : safely(() => abg.projectEffectfulPublicInvocationTruthAtPrefix(
        durablePrefix,
        runRequest.invocationRef,
      ));
  const fullPrefix = durablePrefix === null
    ? null
    : safely(() => abg.selectValidatedRuntimeEventPrefix(
        abg.readRuntimeEventsAtDurablePrefix(durablePrefix),
      ));
  const runPrefix = fullPrefix === null || typeof runOutcome?.runId !== "string"
    ? null
    : safely(() => abg.selectValidatedRuntimeEventPrefix(
        abg.readRuntimeEventsAtDurablePrefix(durablePrefix),
        { runId: runOutcome.runId },
      ));
  const semanticReplay = fullPrefix === null || typeof runOutcome?.runId !== "string"
    ? null
    : safely(() => abg.projectRunSemanticReplayProjection(
        fullPrefix,
        runOutcome.runId,
      ));
  const replayFirst = runPrefix === null || fullPrefix === null
    ? null
    : safely(() => abg.replayValidatedRuntimeEventPrefix(runPrefix, fullPrefix));
  const replaySecond = runPrefix === null || fullPrefix === null
    ? null
    : safely(() => abg.replayValidatedRuntimeEventPrefix(runPrefix, fullPrefix));
  const basisRefs = semanticReplay?.eventAtoms
    ?.filter((atom) => atom.eventKind === "basis_admitted")
    .map((atom) => atom.basisId)
    .filter((basisRef) => typeof basisRef === "string") ?? [];
  const executionBasis = fullPrefix !== null && basisRefs.length === 1
    ? safely(() => abg.rehydrateExecutionBasisAtPrefix(
        fullPrefix,
        basisRefs[0],
      ))
    : null;

  return Object.freeze({
    kind: "abi5_root_owner_evidence",
    schemaVersion: "5.0.0",
    bindingId: "ABI5-ROOT-001",
    product: Object.freeze({
      verifiedProduct: verifyOutcome?.result ?? null,
      verifiedProductValid: safely(() =>
        product.isVerifiedProductArtifact(verifyOutcome?.result)
      ) === true,
      resolvedLock,
      resolvedLockValid: safely(() =>
        product.isResolvedProductLock(resolvedLock)
      ) === true,
      verifiedProductMatchesResolvedLock: safely(() =>
        product.verifiedArtifactMatchesResolvedLock(
          verifyOutcome?.result,
          resolvedLock,
        )
      ) === true,
      admittedInstall,
      admittedWorkspace,
      selectedCatalogEntry,
    }),
    abg: Object.freeze({
      artifactTruth,
      effectfulRunTruth,
      executionBasis,
      semanticReplay,
      replayFirst,
      replaySecond,
    }),
    public: Object.freeze({
      verifyOutcome,
      resolveOutcome,
      installOutcome,
      workspaceOutcome,
      catalogOutcome,
      viewOutcome,
      runRequest,
      runOutcome,
      transportOutcomeProjection,
    }),
    transport: Object.freeze({
      transportRequests,
      transportResults,
      transportRuns,
      finalCloseHandoff,
    }),
  });
}
