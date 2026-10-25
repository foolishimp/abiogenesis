#!/usr/bin/env node

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as installedAbg from "@abiogenesis/typescript-tenant/abg";
import * as installedGtl from "@abiogenesis/typescript-tenant/gtl";
import * as installedHog from "@abiogenesis/typescript-tenant/hog";
import * as installedProduct from "@abiogenesis/typescript-tenant/product";
import * as installedValidator from "@abiogenesis/typescript-tenant/validator";
import * as retryProduct from "@abiogenesis-fixtures/developer-mini-product";

const installedAbgEntryPath = fileURLToPath(
  import.meta.resolve("@abiogenesis/typescript-tenant/abg"),
);
const installedEventCalculus = await import(pathToFileURL(join(
  dirname(installedAbgEntryPath),
  "event_calculus.js",
)).href);
const installedEventStoreOwner = await import(pathToFileURL(join(
  dirname(installedAbgEntryPath),
  "event_store.js",
)).href);
const installedHogEntryPath = fileURLToPath(
  import.meta.resolve("@abiogenesis/typescript-tenant/hog"),
);
const installedRequire = createRequire(installedHogEntryPath);
const Effect = await import(pathToFileURL(
  installedRequire.resolve("effect/Effect"),
).href);
const installedLeafPortOwner = await import(pathToFileURL(join(
  dirname(installedHogEntryPath),
  "../implementation/leaf_invocation_port.js",
)).href);

const EVENT_TIME = "2026-07-31T00:00:00.000Z";
const RETRY_BUDGET = 3;
const TARGET_SUFFIX_COORDINATES = Object.freeze([
  Object.freeze({
    packageName: "@abiogenesis/typescript-tenant/abg",
    exportName: "projectExecutableRetryInput",
    requestKeys: Object.freeze([
      "graph",
      "graphFunction",
      "prefix",
      "program",
      "selector",
    ]),
  }),
  Object.freeze({
    packageName: "@abiogenesis/typescript-tenant/hog",
    exportName: "resumeProjectedRetry",
    requestKeys: Object.freeze([
      "predecessorPrefix",
      "retry",
      "runtime",
      "store",
    ]),
  }),
]);

async function readInput() {
  let bytes = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) bytes += chunk;
  return JSON.parse(bytes);
}

function basis(label, causationEventRefs = []) {
  return {
    eventTime: EVENT_TIME,
    correlationId: `correlation://s06/ax-f09/${label}`,
    causationEventRefs,
  };
}

function requireRawAdmission(validator, value, subjectKind, contractRef) {
  const admitted = validator.rawAdmitValue(value, subjectKind, contractRef);
  assert.equal(admitted.kind, "raw_admitted_value", JSON.stringify(admitted));
  return admitted;
}

function hasForbiddenCarrierField(value) {
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(hasForbiddenCarrierField);
  const forbidden = new Set([
    "inputValue",
    "program",
    "graphFunction",
    "graph",
    "cursor",
    "cCall",
  ]);
  return Object.entries(value).some(
    ([key, nested]) => forbidden.has(key) || hasForbiddenCarrierField(nested),
  );
}

function hasExactString(value, target) {
  if (value === target) return true;
  if (value === null || typeof value !== "object") return false;
  if (Array.isArray(value)) {
    return value.some((entry) => hasExactString(entry, target));
  }
  return Object.values(value).some((entry) => hasExactString(entry, target));
}

function containsCanonicalPreimage(value, digest) {
  let found = false;
  function visit(candidate) {
    if (found) return;
    try {
      if (installedProduct.sha256Canonical(candidate) === digest) {
        found = true;
        return;
      }
    } catch {
      // Runtime events are canonical JSON. Continue into any unexpected value.
    }
    if (candidate === null || typeof candidate !== "object") return;
    if (Array.isArray(candidate)) {
      for (const entry of candidate) visit(entry);
      return;
    }
    for (const entry of Object.values(candidate)) visit(entry);
  }
  visit(value);
  return found;
}

function exactOne(values, predicate, label) {
  const matches = values.filter(predicate);
  assert.equal(matches.length, 1, `${label}: ${JSON.stringify(matches)}`);
  return matches[0];
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function axF09Terms(graphFunction) {
  const node = graphFunction.template.nodes[0];
  assert.notEqual(node, undefined, "AX-F09 root node is present");
  assert.equal(node.term.kind, "c_compose");
  const [transform, retry, downstream] = node.term.terms;
  assert.equal(transform?.kind, "c_of");
  assert.equal(transform.fibre, "F_D");
  assert.equal(retry?.kind, "c_retry");
  assert.equal(retry.term.kind, "c_of");
  assert.equal(retry.term.fibre, "F_P");
  if (downstream !== undefined) assert.equal(downstream.kind, "c_workflow");
  return {
    node,
    transform,
    retry,
    retryLeaf: retry.term,
    downstream: downstream ?? null,
  };
}

function inspectAttemptInputCoverage(
  attempts,
  {
    expectedInputRef,
    expectedInputDigest,
    expectedInputContractRef,
  },
) {
  const rows = attempts.map((event) => {
    const payload = event.payload;
    const inputValueIsRecord = isRecord(payload.inputValue);
    const canonicalInputDigestExact = inputValueIsRecord &&
      installedProduct.sha256Canonical(payload.inputValue) ===
        payload.inputDigest &&
      payload.inputDigest === expectedInputDigest;
    const exactInputRefRelation = payload.inputRef === expectedInputRef;
    const exactInputContractRelation =
      payload.inputContractRef === expectedInputContractRef;
    const {
      attemptRef: _attemptRef,
      attemptDigest: _attemptDigest,
      ...attemptBody
    } = payload;
    const computedAttemptDigest = installedProduct.sha256Canonical(
      attemptBody,
    );
    const attemptDigestCoversInputValue = inputValueIsRecord &&
      payload.attemptDigest === computedAttemptDigest &&
      payload.attemptRef ===
        `retry-attempt://abiogenesis/${computedAttemptDigest.slice("sha256:".length)}`;
    return {
      attempt: payload.attempt,
      inputValueIsRecord,
      canonicalInputDigestExact,
      exactInputRefRelation,
      exactInputContractRelation,
      attemptDigestCoversInputValue,
    };
  });
  const attemptOrdinalsExact =
    JSON.stringify(rows.map((row) => row.attempt)) === "[1,2]";
  const everyAttemptInputPreimageExact = attemptOrdinalsExact &&
    rows.every((row) =>
      row.inputValueIsRecord &&
      row.canonicalInputDigestExact &&
      row.exactInputRefRelation &&
      row.exactInputContractRelation &&
      row.attemptDigestCoversInputValue
    );
  return {
    attemptOrdinalsExact,
    everyAttemptHasRecordInputValue:
      rows.every((row) => row.inputValueIsRecord),
    everyCanonicalInputDigestExact:
      rows.every((row) => row.canonicalInputDigestExact),
    everyInputRefRelationExact:
      rows.every((row) => row.exactInputRefRelation),
    everyInputContractRelationExact:
      rows.every((row) => row.exactInputContractRelation),
    everyAttemptDigestCoversInputValue:
      rows.every((row) => row.attemptDigestCoversInputValue),
    everyAttemptInputPreimageExact,
  };
}

function inspectAttemptRouteCursorBindings(events, attempts) {
  const rows = attempts.map((attemptEvent) => {
    const routes = events.filter((event) =>
      attemptEvent.causationEventRefs.length === 1 &&
      event.eventId === attemptEvent.causationEventRefs[0] &&
      event.kind === "traversal_route_admitted" &&
      event.runId === attemptEvent.runId &&
      event.graphCallId === attemptEvent.graphCallId &&
      event.frameId === attemptEvent.frameId &&
      event.payload.routeKind === "retry" &&
      event.payload.routeRef === attemptEvent.payload.priorRouteRef &&
      event.payload.judgmentRef === attemptEvent.payload.priorJudgmentRef
    );
    const route = routes[0];
    const calls = events.filter((event) =>
      route !== undefined &&
      event.kind === "c_call_opened" &&
      event.runId === attemptEvent.runId &&
      event.graphCallId === attemptEvent.graphCallId &&
      event.frameId === attemptEvent.frameId &&
      event.causationEventRefs.includes(route.eventId) &&
      event.payload.cursorRef === route.payload.targetCursorRef &&
      event.payload.cursorDigest === route.payload.targetCursorDigest &&
      event.payload.attempt === attemptEvent.payload.attempt &&
      JSON.stringify(event.payload.retryPath) ===
        JSON.stringify(attemptEvent.payload.retryPath)
    );
    const call = calls[0];
    return {
      attempt: attemptEvent.payload.attempt,
      exactCitedRetryRoute: routes.length === 1,
      exactAttemptCCall: calls.length === 1,
      cCallCursorMatchesCitedRoute:
        route !== undefined && call !== undefined &&
        call.payload.cursorRef === route.payload.targetCursorRef &&
        call.payload.cursorDigest === route.payload.targetCursorDigest,
    };
  });
  const duplicateCursorPayloadAbsent = attempts.every((event) =>
    !Object.hasOwn(event.payload, "sourceCursor") &&
    !Object.hasOwn(event.payload, "sourceCursorRef") &&
    !Object.hasOwn(event.payload, "sourceCursorDigest")
  );
  const sourceCursorBoundThroughCitedRetryRoute =
    JSON.stringify(rows.map((row) => row.attempt)) === "[1,2]" &&
    rows.every((row) =>
      row.exactCitedRetryRoute &&
      row.exactAttemptCCall &&
      row.cCallCursorMatchesCitedRoute
    );
  return {
    everyAttemptHasExactCitedRetryRoute:
      rows.every((row) => row.exactCitedRetryRoute),
    everyAttemptHasExactRouteCausedCCall:
      rows.every((row) => row.exactAttemptCCall),
    everyRouteCausedCCallMatchesTargetCursor:
      rows.every((row) => row.cCallCursorMatchesCitedRoute),
    sourceCursorBoundThroughCitedRetryRoute,
    duplicateCursorPayloadAbsent,
  };
}

function inspectCompactRetryProgress(progress) {
  const compactProgressCoverageLawful =
    JSON.stringify(progress.map((event) => event.payload.attempt)) ===
      "[1,2]" &&
    JSON.stringify(progress.map((event) =>
      event.payload.completedAttempts)) === "[[1],[1,2]]" &&
    progress.every((event) =>
      !Object.hasOwn(event.payload, "retryFrontier") &&
      !Object.hasOwn(event.payload, "attemptFrontier") &&
      !Object.hasOwn(event.payload, "rows") &&
      !Object.hasOwn(event.payload, "reasonClasses") &&
      !Object.hasOwn(event.payload, "ownerSurfaces") &&
      !Object.hasOwn(event.payload, "sourceEventKinds")
    );
  return {
    compactProgressCoverageLawful,
    storedFullFrontierCarrierPresent: progress.some((event) =>
      Object.hasOwn(event.payload, "retryFrontier") ||
      Object.hasOwn(event.payload, "attemptFrontier") ||
      Object.hasOwn(event.payload, "rows") ||
      Object.hasOwn(event.payload, "reasonClasses") ||
      Object.hasOwn(event.payload, "ownerSurfaces") ||
      Object.hasOwn(event.payload, "sourceEventKinds")
    ),
  };
}

function scopeValueFromEvents(events, selector, executionBasis) {
  const run = exactOne(
    events,
    (event) =>
      event.kind === "run_segment_opened" &&
      event.runId === selector.runId &&
      event.basisId === executionBasis.basisRef,
    "AX-F09 run event",
  );
  const graphCall = exactOne(
    events,
    (event) =>
      event.kind === "graph_call_opened" &&
      event.runId === selector.runId &&
      event.graphCallId === selector.graphCallId &&
      event.basisId === executionBasis.basisRef,
    "AX-F09 graph-call event",
  );
  const frame = exactOne(
    events,
    (event) =>
      event.kind === "frame_opened" &&
      event.runId === selector.runId &&
      event.graphCallId === selector.graphCallId &&
      event.frameId === selector.frameId &&
      event.basisId === executionBasis.basisRef,
    "AX-F09 frame event",
  );
  const body = {
    executionBasisRef: executionBasis.basisRef,
    executionBasisDigest: executionBasis.basisDigest,
    invocationAdmissionRef: executionBasis.invocationAdmissionRef,
    invocationRef: executionBasis.invocationRef,
    programRef: executionBasis.programRef,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphRef: executionBasis.graphRef,
    runId: selector.runId,
    runDigest: run.payload.runDigest,
    runOpenEventRef: run.eventId,
    graphCallId: selector.graphCallId,
    graphCallDigest: graphCall.payload.graphCallDigest,
    graphCallOpenEventRef: graphCall.eventId,
    frameId: selector.frameId,
    frameDigest: frame.payload.frameDigest,
    frameLineageId: frame.payload.frameLineageId,
    frameOpenEventRef: frame.eventId,
  };
  const scopeDigest = installedProduct.sha256Canonical(body);
  return {
    scopeRef:
      `traversal-scope://abiogenesis/${scopeDigest.slice("sha256:".length)}`,
    scopeDigest,
    ...body,
  };
}

// The leaf port takes the owner's execution resolution
// (implementation/leaf_invocation_port.ts:914-923). The consumer process holds
// none of its inputs, so it reconstructs them cold as the support does
// (root-installed-environment.mjs:275-292, :504-556, :650-661): each Product
// verified again from the archive its install host was installed from, the
// lock over them, the install and workspace binding candidates read from the
// reopened artifact truth, the root and fixture publications, the ready
// Catalog, its view and the Product execution resolution.
async function reconstructExecutionResolution({
  artifactTruth,
  workspaceBinding,
  publication,
  program,
  graphFunction,
  childGraphFunction,
}) {
  const installHost = dirname(fileURLToPath(import.meta.url));
  const { dependencies } = JSON.parse(
    await readFile(join(installHost, "package.json"), "utf8"),
  );
  // The support admits and locks the root Product first, then the additional
  // Products (root-installed-environment.mjs:291-292, :339); the artifact truth
  // lists its rows in its own order.
  const installRows = artifactTruth.rows
    .filter((row) =>
      row.operationId === "abg.operation.product.install" &&
      isRecord(row.artifact)
    )
    .map((row) => row.artifact);
  const installCandidates = [
    ...installRows.filter((candidate) =>
      candidate.packageName === "@abiogenesis/typescript-tenant"),
    ...installRows.filter((candidate) =>
      candidate.packageName !== "@abiogenesis/typescript-tenant"),
  ];
  const admittedInstalls = installCandidates.map((candidate) => {
    const admitted = installedAbg.projectAdmittedProductInstall(
      artifactTruth,
      candidate,
    );
    assert.notEqual(admitted, null, `AX-F09 admitted ${candidate.installId}`);
    return admitted;
  });
  const verifiedProducts = [];
  for (const candidate of installCandidates) {
    const spec = dependencies?.[candidate.packageName];
    assert.equal(
      typeof spec === "string" && spec.startsWith("file:"),
      true,
      `AX-F09 install host archive for ${candidate.packageName}: ${spec}`,
    );
    // Each Product was verified under its archive's file name
    // (root-installed-environment.mjs:277, runtime-f09-product.mjs:658).
    const artifactPath = resolve(installHost, spec.slice("file:".length));
    const verified = await installedProduct.verifyProduct({
      artifactPath,
      artifactRef: basename(artifactPath),
      expectedArtifactDigest: candidate.artifactDigest,
      expectedProductContentDigest: candidate.productContentDigest,
      expectedManifestDigest: candidate.manifestDigest,
      expectedProductId: candidate.productId,
      expectedPackageName: candidate.packageName,
      expectedPackageVersion: candidate.packageVersion,
    });
    assert.equal(verified.disposition, "verified", JSON.stringify(verified));
    verifiedProducts.push(verified);
  }
  const lock = installedProduct.constructResolvedProductLock(verifiedProducts);
  assert.equal(lock.kind, "resolved_product_lock", JSON.stringify(lock));
  assert.equal(lock.lockId, workspaceBinding.lockId);
  const core = exactOne(
    verifiedProducts,
    (verified) => verified.packageName === "@abiogenesis/typescript-tenant",
    "AX-F09 verified core Product",
  );
  const rootPublication =
    installedGtl.constructWorksiteConstructionModulePublication({
      productId: core.productId,
      artifactDigest: core.artifactDigest,
      productContentDigest: core.productContentDigest,
      productManifestDigest: core.manifestDigest,
      packageName: core.packageName,
      packageVersion: core.packageVersion,
    });
  const {
    kind: _bindingKind,
    admissionEventRef: _bindingAdmissionEventRef,
    ...bindingBody
  } = workspaceBinding;
  const catalog = installedProduct.admitGraphFunctionCatalog({
    workspaceBinding: { kind: "workspace_binding_candidate", ...bindingBody },
    resolvedLock: lock,
    verifiedProducts,
    installedProducts: installCandidates,
    publications: [rootPublication, publication],
  });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const catalogView = installedProduct.narrowGraphFunctionCatalog(catalog, [
    graphFunction.name,
    childGraphFunction.name,
  ]);
  assert.equal(catalogView.kind, "graph_function_catalog_view",
    JSON.stringify(catalogView));
  const executionResolution =
    await installedProduct.ProductExecutionResolutionPort.resolve({
      catalog,
      catalogView,
      admittedInstalls,
      verifyInstallAdmission: (install) =>
        installedAbg.hasAdmittedProductInstall(artifactTruth, install),
      programRef: program.programRef,
      selection: { kind: "direct", catalogHandle: graphFunction.name },
    });
  assert.equal(
    executionResolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(executionResolution),
  );
  return { catalog, catalogView, executionResolution };
}

async function loadInstalledRetryDependencies(
  reopened,
  events,
  selector,
  basisEvent,
  invocation,
  supportPath,
) {
  const support = await import(pathToFileURL(supportPath).href);
  const packageEntryPath = fileURLToPath(
    import.meta.resolve("@abiogenesis-fixtures/developer-mini-product"),
  );
  const installedFixtureRoot = dirname(dirname(packageEntryPath));
  const [manifest, packageJson] = await Promise.all([
    readFile(
      join(installedFixtureRoot, "product-toolchain-manifest.json"),
      "utf8",
    ).then(JSON.parse),
    readFile(join(installedFixtureRoot, "package.json"), "utf8").then(
      JSON.parse,
    ),
  ]);
  const artifactTruth = installedAbg.projectExactPrefixArtifactTruth(
    reopened.prefix,
  );
  assert.equal(
    artifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
    JSON.stringify(artifactTruth),
  );
  const fixtureInstallRow = exactOne(
    artifactTruth.rows,
    (row) =>
      row.operationId === "abg.operation.product.install" &&
      isRecord(row.artifact) &&
      row.artifact.packageName === packageJson.name,
    "AX-F09 installed fixture Product",
  );
  const fixtureInstallCandidate = fixtureInstallRow.artifact;
  const admittedInstall = installedAbg.projectAdmittedProductInstall(
    artifactTruth,
    fixtureInstallCandidate,
  );
  assert.notEqual(admittedInstall, null);
  const workspaceEvent = exactOne(
    events,
    (event) =>
      event.kind === "public_operation_artifact_admitted" &&
      event.payload.operationId === "abg.operation.workspace.bind" &&
      isRecord(event.payload.artifact),
    "AX-F09 admitted workspace binding",
  );
  const workspaceBinding = installedAbg.projectAdmittedWorkspaceBinding(
    artifactTruth,
    workspaceEvent.payload.artifact,
  );
  assert.notEqual(workspaceBinding, null);
  const payloadInventory = await Promise.all(
    manifest.productRelativeLocators.map(async (path) => ({
      path,
      sha256: await installedProduct.sha256File(
        join(installedFixtureRoot, path),
      ),
    })),
  );
  const payloadInventoryVerified =
    installedProduct.payloadInventoryDigest(payloadInventory) ===
      manifest.productContentDigest;
  const productManifestDigest = installedProduct.sha256Canonical(manifest);
  const authoredPublication = retryProduct.constructAxF09Publication({
    productId: manifest.productId,
    artifactDigest: fixtureInstallCandidate.artifactDigest,
    productContentDigest: manifest.productContentDigest,
    productManifestDigest,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  });
  const publicationAdmission = requireRawAdmission(
    installedValidator,
    authoredPublication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const publication = publicationAdmission.value;
  const publicationBinding = exactOne(
    manifest.contributionManifest.publicationBindings,
    (binding) => binding.moduleRef === publication.moduleRef,
    "AX-F09 installed publication binding",
  );
  const semanticPublicationVerified =
    publicationBinding.publicationDigest ===
      installedProduct.modulePublicationSemanticDigest(publication);
  const program = exactOne(
    publication.programs,
    (candidate) =>
      candidate.programRef === retryProduct.AX_F09_RETRY_IDS.programRef,
    "AX-F09 installed Program",
  );
  const graphFunction = exactOne(
    publication.graphFunctions,
    (candidate) =>
      candidate.name === retryProduct.AX_F09_RETRY_IDS.graphFunctionRef,
    "AX-F09 installed GraphFunction",
  );
  const childGraphFunction = exactOne(
    publication.graphFunctions,
    (candidate) =>
      candidate.name === retryProduct.AX_F09_RETRY_IDS.childGraphFunctionRef,
    "AX-F09 installed child GraphFunction",
  );
  const installedDeclarationsImmutable =
    Object.isFrozen(publication) &&
    Object.isFrozen(program) &&
    Object.isFrozen(graphFunction) &&
    publication.contracts.every(Object.isFrozen) &&
    publication.implementationBindings.every(Object.isFrozen) &&
    publication.closureContracts.every(Object.isFrozen);
  const admittedExportedProgram = requireRawAdmission(
    installedValidator,
    retryProduct.AX_F09_PROGRAM,
    "gtl_program",
    "contract://abiogenesis/gtl/program@5",
  ).value;
  const admittedExportedGraphFunction = requireRawAdmission(
    installedValidator,
    retryProduct.AX_F09_GRAPH_FUNCTION,
    "graph_function",
    "contract://abiogenesis/gtl/graph-function@5",
  ).value;
  const admittedExportedChildGraphFunction = requireRawAdmission(
    installedValidator,
    retryProduct.AX_F09_CHILD_GRAPH_FUNCTION,
    "graph_function",
    "contract://abiogenesis/gtl/graph-function@5",
  ).value;
  const exportedDeclarationsMatchPublication =
    installedProduct.sha256Canonical(program) ===
      installedProduct.sha256Canonical(admittedExportedProgram) &&
    installedProduct.sha256Canonical(graphFunction) ===
      installedProduct.sha256Canonical(admittedExportedGraphFunction) &&
    installedProduct.sha256Canonical(childGraphFunction) ===
      installedProduct.sha256Canonical(admittedExportedChildGraphFunction);
  // The Program validation is the reconstructed execution resolution's own,
  // as the producer's graph validation took it
  // (root-installed-environment.mjs:669); the graph validation's identity
  // includes that validation's reference.
  const { catalog, catalogView, executionResolution } =
    await reconstructExecutionResolution({
      artifactTruth,
      workspaceBinding,
      publication,
      program,
      graphFunction,
      childGraphFunction,
    });
  const programValidation = executionResolution.programValidation;
  assert.equal(
    programValidation.kind,
    "program_validation",
    JSON.stringify(programValidation),
  );
  // The publication's own Program validation is a consistency check only: the
  // same Program and digest; the resolution validates over its narrowed
  // Catalog view, so its GraphFunction digests are a subset of the
  // publication's, and its reference differs.
  const publicationProgramValidation = installedValidator.validateProgram(
    support.rawProgramInput(installedValidator, publicationAdmission, program),
  );
  assert.equal(
    publicationProgramValidation.kind,
    "program_validation",
    JSON.stringify(publicationProgramValidation),
  );
  assert.equal(publicationProgramValidation.programRef,
    programValidation.programRef);
  assert.equal(publicationProgramValidation.programDigest,
    programValidation.programDigest);
  assert.equal(programValidation.graphFunctionDigests.every((digest) =>
    publicationProgramValidation.graphFunctionDigests.includes(digest)), true);
  const executionBasis = installedAbg.rehydrateExecutionBasis(
    reopened.store,
    basisEvent.payload.basisRef,
  );
  assert.notEqual(executionBasis, null);
  assert.equal(
    installedProduct.sha256Canonical(executionBasis.rawInputValue),
    executionBasis.rawInputDigest,
  );
  assert.equal(programValidation.programRef, executionBasis.programRef);
  assert.equal(programValidation.programDigest, executionBasis.programDigest);
  assert.equal(executionBasis.rawInputAdmissionRef,
    invocation.rawInputAdmissionRef);
  assert.equal(executionBasis.rawInputDigest, invocation.rawInputDigest);
  const graph = installedGtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocation.invocationAdmissionRef,
    admittedInputRef: invocation.rawInputAdmissionRef,
    admittedInputDigest: invocation.rawInputDigest,
    admittedInput: executionBasis.rawInputValue,
  });
  const graphValidation = installedValidator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocation.invocationAdmissionRef,
      admittedInputRef: invocation.rawInputAdmissionRef,
      admittedInputDigest: invocation.rawInputDigest,
      admittedInput: executionBasis.rawInputValue,
    },
  );
  assert.equal(
    graphValidation.kind,
    "graph_validation",
    JSON.stringify(graphValidation),
  );
  const materializedGraphImmutable = Object.isFrozen(graph);
  const implementationSet = installedAbg.rehydrateAdmittedImplementationSet(
    reopened.store,
    executionBasis.implementationSetRef,
  );
  const interactionSet = installedAbg.rehydrateAdmittedInteractionSet(
    reopened.store,
    executionBasis.interactionSetRef,
  );
  assert.notEqual(implementationSet, null);
  assert.notEqual(interactionSet, null);
  const openedTraversalScope = installedAbg.rehydrateOpenedTraversalScope(
    reopened.store,
    scopeValueFromEvents(events, selector, executionBasis),
  );
  assert.notEqual(openedTraversalScope, null);
  const terms = axF09Terms(graphFunction);
  const transformResolution =
    installedAbg.selectAdmittedImplementationResolution(
      implementationSet,
      {
        graphFunctionRef: graph.graphFunctionRef,
        nodeRef: graph.template.startNodeRef,
        programLocusRef: terms.transform.programLocusRef,
        implementationBindingRef:
          terms.transform.requirement.implementationBindingRef,
      },
    );
  assert.notEqual(transformResolution, null);
  const implementationResolution =
    installedAbg.selectAdmittedImplementationResolution(
      implementationSet,
      {
        graphFunctionRef: graph.graphFunctionRef,
        nodeRef: graph.template.startNodeRef,
        programLocusRef: terms.retryLeaf.programLocusRef,
        implementationBindingRef:
          terms.retryLeaf.requirement.implementationBindingRef,
      },
    );
  assert.notEqual(implementationResolution, null);
  const implementationBinding = exactOne(
    publication.implementationBindings,
    (candidate) =>
      candidate.bindingRef ===
        retryProduct.AX_F09_RETRY_IDS.implementationBindingRef,
    "AX-F09 installed implementation binding",
  );
  const descriptor = retryProduct.AX_F09_IMPLEMENTATION_DESCRIPTOR;
  const transformDescriptor =
    retryProduct.AX_F09_TRANSFORM_IMPLEMENTATION_DESCRIPTOR;
  const implementationDependencyChecks = {
    descriptorAccepted:
      installedProduct.isPackagedLeafImplementationDescriptor(descriptor) &&
      installedProduct.isPackagedLeafImplementationDescriptor(
        transformDescriptor,
      ),
    descriptorImmutable:
      Object.isFrozen(descriptor) && Object.isFrozen(transformDescriptor),
    implementationCallable:
      typeof retryProduct.realizeAxF09ProbabilisticPass === "function" &&
      typeof retryProduct.realizeAxF09Transform === "function",
    semanticsImmutable: Object.isFrozen(retryProduct.AX_F09_PRODUCT_SEMANTICS),
    bindingImplementationExact:
      implementationBinding.implementationRef === descriptor.implementationRef,
    bindingSymbolExact:
      implementationBinding.namedSymbol === descriptor.namedSymbol,
    admittedDescriptorExact:
      implementationResolution.implementationDescriptorDigest ===
        descriptor.descriptorDigest &&
      transformResolution.implementationDescriptorDigest ===
        transformDescriptor.descriptorDigest,
    admittedResolutionExact:
      executionBasis.implementationResolutionRef === null &&
      implementationSet.rows.includes(implementationResolution) &&
      implementationSet.rows.includes(transformResolution) &&
      executionBasis.localExecutableLeafKeys.includes(
        implementationResolution.requirementKey,
      ) &&
      executionBasis.localExecutableLeafKeys.includes(
        transformResolution.requirementKey,
      ),
  };
  const implementationDependencyVerified = Object.values(
    implementationDependencyChecks,
  ).every((value) => value === true);
  const closureContract = exactOne(
    publication.closureContracts,
    (candidate) =>
      candidate.closureContractRef === executionBasis.closureContractRef,
    "AX-F09 installed closure contract",
  );
  // The leaf semantics are the execution resolution's own, as the support
  // takes them (root-installed-environment.mjs:1090-1092).
  const semantics = executionResolution.productSemantics;
  const leafPort = await installedLeafPortOwner.constructAdmittedLeafInvocationPort({
    prefix: installedAbg.selectValidatedRuntimeEventPrefix(events),
    artifactTruth,
    implementationSet,
    executionResolution,
    semanticsProjection:
      installedProduct.projectInstalledLeafSemantics(semantics),
  });
  const requiredContractRefs = new Set([
    graphFunction.inputs[0],
    graphFunction.outputs[0],
    childGraphFunction.inputs[0],
    childGraphFunction.outputs[0],
    terms.transform.requirement.inputContractRef,
    terms.transform.requirement.outputContractRef,
    terms.transform.requirement.failureContractRef,
    terms.transform.requirement.refusalContractRef,
    terms.retryLeaf.requirement.inputContractRef,
    terms.retryLeaf.requirement.outputContractRef,
    terms.retryLeaf.requirement.failureContractRef,
    terms.retryLeaf.requirement.refusalContractRef,
    executionBasis.evidenceContractRef,
    executionBasis.resultContractRef,
    executionBasis.refusalContractRef,
    executionBasis.judgmentContractRef,
    executionBasis.rejectionContractRef,
    executionBasis.transitionContractRef,
  ]);
  const installedContractsVerified = [...requiredContractRefs].every(
    (contractRef) =>
      publication.contracts.filter((candidate) => {
        if (candidate.contractRef !== contractRef) return false;
        return programValidation.contractDigests.includes(
          installedProduct.sha256Canonical(candidate),
        );
      }).length === 1,
  );
  const declarationsMatchBasis =
    program.programRef === executionBasis.programRef &&
    installedProduct.sha256Canonical(program) === executionBasis.programDigest &&
    graphFunction.name === executionBasis.graphFunctionRef &&
    installedProduct.sha256Canonical(graphFunction) ===
      executionBasis.graphFunctionDigest &&
    graph.materializationRef === executionBasis.graphRef &&
    graph.materializationDigest === executionBasis.graphDigest &&
    graphValidation.graphRef === executionBasis.graphRef &&
    graphValidation.graphDigest === executionBasis.graphDigest &&
    closureContract.closureContractRef === executionBasis.closureContractRef &&
    installedProduct.sha256Canonical(closureContract) ===
      executionBasis.closureContractDigest;
  const executionDependenciesVerified =
    executionBasis.basisRef === basisEvent.payload.basisRef &&
    executionBasis.basisDigest === basisEvent.payload.basisDigest &&
    implementationSet.implementationSetRef ===
      executionBasis.implementationSetRef &&
    implementationSet.implementationSetDigest ===
      executionBasis.implementationSetDigest &&
    interactionSet.interactionSetRef === executionBasis.interactionSetRef &&
    interactionSet.interactionSetDigest ===
      executionBasis.interactionSetDigest &&
    Object.isFrozen(executionBasis) &&
    Object.isFrozen(implementationSet) &&
    Object.isFrozen(interactionSet) &&
    Object.isFrozen(openedTraversalScope) &&
    openedTraversalScope.executionBasisRef === executionBasis.basisRef &&
    openedTraversalScope.runId === selector.runId &&
    openedTraversalScope.graphCallId === selector.graphCallId &&
    openedTraversalScope.frameId === selector.frameId &&
    programValidation.programRef === executionBasis.programRef &&
    programValidation.programDigest === executionBasis.programDigest &&
    programValidation.graphFunctionDigests.includes(
      executionBasis.graphFunctionDigest,
    ) &&
    materializedGraphImmutable &&
    installedContractsVerified &&
    implementationDependencyVerified;
  return {
    publication,
    program,
    programValidation,
    graphFunction,
    childGraphFunction,
    graph,
    graphValidation,
    executionBasis,
    implementationSet,
    interactionSet,
    transformResolution,
    implementationResolution,
    openedTraversalScope,
    closureContract,
    artifactTruth,
    admittedInstall,
    workspaceBinding,
    leafPort,
    catalog,
    catalogView,
    continuationProductBasis: {
      artifactTruth,
      install: admittedInstall,
      workspaceBinding,
      catalogView,
      programValidation,
      graphValidation,
    },
    payloadInventoryVerified,
    semanticPublicationVerified,
    installedDeclarationsImmutable,
    materializedGraphImmutable,
    exportedDeclarationsMatchPublication,
    installedContractsVerified,
    implementationDependencyVerified,
    implementationDependencyChecks,
    declarationsMatchBasis,
    executionDependenciesVerified,
  };
}

async function inspectInstalledTargetSuffix(dependencies) {
  const abgEntryPath = fileURLToPath(import.meta.resolve(
    "@abiogenesis/typescript-tenant/abg",
  ));
  const abgDeclarationSource = await readFile(
    join(dirname(abgEntryPath), "index.d.ts"),
    "utf8",
  );
  const projectorExportPresent =
    typeof installedAbg.projectExecutableRetryInput === "function";
  const retryAttemptFrontierTypeExportPresent =
    /\bRetryAttemptFrontier\b/u.test(abgDeclarationSource);
  const executableRetryInputTypeExportPresent =
    /\bExecutableRetryInput\b/u.test(abgDeclarationSource);
  const fullFrontierAssertionExportPresent =
    typeof installedAbg.assertFullRetryAttemptFrontier === "function" ||
    /\bassertFullRetryAttemptFrontier\b/u.test(abgDeclarationSource);
  const resumeExportPresent =
    typeof installedHog.resumeProjectedRetry === "function";
  return {
    coordinates: TARGET_SUFFIX_COORDINATES,
    coordinateCount: TARGET_SUFFIX_COORDINATES.length,
    dependenciesReady:
      dependencies.declarationsMatchBasis &&
      dependencies.executionDependenciesVerified,
    projectorExportPresent,
    retryAttemptFrontierTypeExportPresent,
    executableRetryInputTypeExportPresent,
    fullFrontierAssertionExportPresent,
    resumeExportPresent,
    disposition:
      projectorExportPresent && resumeExportPresent
        ? "installed_suffix_available"
        : "installed_suffix_exports_absent",
  };
}

async function installAttemptWorker(root) {
  const counterPath = join(root, "attempt.count");
  const command = join(root, "ax-f09-worker-command.cjs");
  await writeFile(
    command,
    [
      "#!/usr/bin/env node",
      "const { existsSync, readFileSync, writeFileSync } = require('node:fs');",
      "let prompt = '';",
      "process.stdin.setEncoding('utf8');",
      "process.stdin.on('data', (chunk) => { prompt += chunk; });",
      "process.stdin.on('end', () => {",
      "  const counterPath = process.env.ABG_AX_F09_COUNTER;",
      "  const prior = existsSync(counterPath) ? Number(readFileSync(counterPath, 'utf8')) : 0;",
      "  const attempt = prior + 1;",
      "  writeFileSync(counterPath, String(attempt));",
      "  const mode = process.env.ABG_AX_F09_ATTEMPT_MODE;",
      "  const inputLine = prompt.split(/\\r?\\n/).find((line) => line.startsWith('{'));",
      "  const input = inputLine === undefined ? null : JSON.parse(inputLine);",
      "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
      // The transport failure signal digests stdout, so the two A attempts
      // print the same bytes.
      "  const label = mode === 'aba' && attempt <= 3 ? (attempt === 2 ? 'b' : 'a') : String(attempt);",
      "  console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: `attempt ${label}` }] } }));",
      "  if (mode !== 'aba' && attempt === 1) return;",
      "  const result = {",
      "    kind: 'developer_greeting_output',",
      "    schemaVersion: '5.0.0',",
      "    message: input?.message ?? 'unavailable'",
      "  };",
      // A structured request reads only the successful host carrier's
      // structured_output; the native result assessment rejects a string
      // there, so the transport fails with contract_failure.
      "  const rendered = mode === 'aba' && attempt <= 3 ? (attempt === 2 ? '{not-json-b' : '{not-json-a') : mode !== 'aba' && attempt === 2 ? '{not-json' : result;",
      "  console.log(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, structured_output: rendered }));",
      "});",
      "",
    ].join("\n"),
    "utf8",
  );
  await chmod(command, 0o755);
  return { command, counterPath };
}

async function constructP1Environment(input) {
  const support = await import(pathToFileURL(input.supportPath).href);
  const ids = retryProduct.AX_F09_RETRY_IDS;
  // The support's installed environment is the current form of every step
  // this worker used to construct privately: Product verification, the
  // resolved lock, both installs, the workspace binding, the ready Catalog,
  // Program validation, the Product execution resolution, the one run.invoke
  // grant and its authority, invocation admission, the execution basis and
  // the leaf port (root-installed-environment.mjs, setupInstalledRootCatalog
  // through setupInstalledRootExecutionBasis). The AX-F09 fixture enters as
  // the one additional installed Product.
  const catalogEnvironment = await support.setupInstalledRootCatalog(
    { after() {} },
    input.packageRoot,
    {
      frozenArtifact: input.frozenArtifact,
      authorizedActorRef: "actor://developer.example/trusted-developer",
      programRef: ids.programRef,
      graphFunctionRef: ids.graphFunctionRef,
      prepareAdditionalProducts: async () => [{
        artifactPath: input.fixtureArtifactPath,
        artifactRef: input.fixtureArtifactRef,
        basis: input.fixtureBasis,
        ids,
        loadInstalledPublication: async ({ verified }) =>
          retryProduct.constructAxF09Publication({
            productId: verified.productId,
            artifactDigest: verified.artifactDigest,
            productContentDigest: verified.productContentDigest,
            productManifestDigest: verified.manifestDigest,
            packageName: verified.packageName,
            packageVersion: verified.packageVersion,
          }),
      }],
    },
  );
  // The Run reaches the child workflow's GraphFunction, so the view admits
  // both declared GraphFunctions, as this worker's view did.
  const catalogView = catalogEnvironment.product.narrowGraphFunctionCatalog(
    catalogEnvironment.catalog,
    [ids.graphFunctionRef, ids.childGraphFunctionRef],
  );
  assert.equal(
    catalogView.kind,
    "graph_function_catalog_view",
    JSON.stringify(catalogView),
  );
  const nonceSubject = `restart-private-${randomUUID()}`;
  const invocationInput = {
    kind: "developer_greeting_output",
    schemaVersion: "5.0.0",
    message: nonceSubject,
  };
  const environment = await support.setupInstalledRootExecutionBasis(
    { after() {} },
    input.packageRoot,
    {
      existingEnvironment: { ...catalogEnvironment, catalogView },
      programRef: ids.programRef,
      graphFunctionRef: ids.graphFunctionRef,
      input: invocationInput,
      publicInvocationRef: "invocation://s06/ax-f09/run-invoke",
    },
  );
  // Fixture-only access to the same installed owner-internal module imported
  // by this environment's HoG. The package barrel intentionally exposes no
  // split transition ingress.
  const retryOwner = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/abg/retry.js",
  )).href);
  const cCallOwner = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/hog/ccall_lifecycle.js",
  )).href);
  const structuralOwner = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/hog/structural_transition.js",
  )).href);
  const eventStoreOwner = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
  const eventCalculusOwner = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/abg/event_calculus.js",
  )).href);
  const {
    abg,
    store,
    graph,
    graphFunction,
    publication,
    workspaceBinding,
    programValidation,
    graphValidation,
  } = environment;
  const admittedInstall = environment.additionalAdmittedInstalls[0];
  const installedRoot = environment.additionalInstallCandidates[0].installedRoot;
  const childGraphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === ids.childGraphFunctionRef,
  );
  assert.notEqual(childGraphFunction, undefined);
  const terms = axF09Terms(graphFunction);
  assert.equal(
    terms.retry.budget,
    input.retryBudget ?? RETRY_BUDGET,
  );
  const transformResolution =
    abg.selectAdmittedImplementationResolution(
      environment.implementationSet,
      {
        graphFunctionRef: graph.graphFunctionRef,
        nodeRef: graph.template.startNodeRef,
        programLocusRef: terms.transform.programLocusRef,
        implementationBindingRef:
          terms.transform.requirement.implementationBindingRef,
      },
    );
  assert.notEqual(transformResolution, null);
  const implementationResolution =
    abg.selectAdmittedImplementationResolution(
      environment.implementationSet,
      {
        graphFunctionRef: graph.graphFunctionRef,
        nodeRef: graph.template.startNodeRef,
        programLocusRef: terms.retryLeaf.programLocusRef,
        implementationBindingRef:
          terms.retryLeaf.requirement.implementationBindingRef,
      },
    );
  assert.notEqual(implementationResolution, null);
  const artifactTruth = environment.artifactTruth;
  return {
    ...environment,
    tenantRoot: environment.installedRoot,
    verified: environment.additionalVerified[0],
    admittedInstall,
    installedRoot,
    childGraphFunction,
    invocationInput,
    interactionSet: environment.executionBasisAdmission.interactionSet,
    implementationResolution,
    transformResolution,
    continuationProductBasis: {
      artifactTruth,
      install: admittedInstall,
      workspaceBinding,
      catalogView: environment.catalogView,
      programValidation,
      graphValidation,
    },
    retryOwner,
    cCallOwner,
    structuralOwner,
    eventStoreOwner,
    eventCalculusOwner,
    actorRuntimeBinding: { workspaceBinding, artifactTruth },
    nonceSubject,
    eventLogPath: join(environment.scratch, "runtime", "events.jsonl"),
  };
}

async function rejectAttempt(
  environment,
  stop,
  inputValue,
  failureClass,
) {
  const {
    abg,
    cCallOwner,
    graph,
    program,
    graphFunction,
    graphValidation,
    executionBasis,
    implementationSet,
    leafPort,
    retryOwner,
    actorRuntimeBinding,
    closureContract,
    opened,
    store,
  } = environment;
  const lifecycle = await Effect.runPromise(
    cCallOwner.evaluateExecutableCCall({
      store,
      predecessorPrefix:
        environment.eventStoreOwner.selectHeldEventStoreDurablePrefix(store),
      executionBasis,
      openedTraversalScope: opened.scope,
      program,
      graphFunction,
      graph,
      graphValidation,
      stop,
      implementationSet,
      leafPort,
      input: inputValue,
      closureContract,
      actorRuntimeBinding,
      scopeClass: "root",
      clock: {
        eventTime: EVENT_TIME,
        correlationId: `correlation://s06/ax-f09/attempt-${
          stop.cursor.attempt
        }`,
      },
      ordinal: stop.cursor.attempt,
    }),
  );
  assert.equal(
    lifecycle.kind,
    "c_call_retry",
    JSON.stringify(lifecycle),
  );
  const admitted = lifecycle.outcome;
  const transitionPrefix = abg.projectRuntimeTruthAtDurablePrefix(
    admitted.successorPrefix,
    stop.cursor.runId,
  ).authorityPrefix;
  const transition = retryOwner.admitRetryRuntimeFailureTransition(
    store,
    transitionPrefix,
    executionBasis,
    graph,
    graphFunction,
    stop.cursor,
    admitted.cCall,
    admitted.source,
    admitted.failureCandidate,
    admitted.failureValueKind,
    basis(`attempt-${stop.cursor.attempt}/retry-transition`),
  );
  assert.equal(
    transition.kind,
    "retry_runtime_failure_transition_admission",
    JSON.stringify(transition),
  );
  assert.equal(transition.disposition, "retry");
  assert.equal(transition.progress.progressClass, "retry");
  assert.equal(transition.progress.failureClass, failureClass);
  const failureSignalRef = transition.close.signal.failureSignalRef;
  return {
    cCall: admitted.cCall,
    transition,
    failureSignalRef,
    progress: transition.progress,
  };
}

async function advanceRetry(environment, attemptResult) {
  const { abg, hog, store, executionBasis, graph, opened, program } = environment;
  const selector = {
    kind: "retry_frontier_selector",
    schemaVersion: "5.0.0",
    runId: opened.scope.runId,
    graphCallId: opened.scope.graphCallId,
    frameId: opened.scope.frameId,
    retryBoundaryRef: attemptResult.progress.retryBoundaryRef,
    retryProgressRef: attemptResult.progress.progressRef,
  };
  const retry = abg.projectExecutableRetryInput({
    prefix: attemptResult.transition.successorPrefix,
    selector,
    program: environment.program,
    graphFunction: environment.graphFunction,
    graph,
  });
  assert.equal(retry.kind, "executable_retry_input", JSON.stringify(retry));
  abg.assertFullRetryAttemptFrontier(retry.retryFrontier);
  const runtime = {
    executionBasis,
    openedTraversalScope: opened.scope,
    program: environment.program,
    graphFunction: environment.graphFunction,
    graph,
    graphValidation: environment.graphValidation,
    eventTime: EVENT_TIME,
    correlationId: `correlation://s06/ax-f09/retry/${retry.nextAttempt}`,
  };
  const prefixCount = store.readAll().length;
  const forgedValidation = hog.resumeProjectedRetry({
    store,
    predecessorPrefix: attemptResult.transition.successorPrefix,
    retry,
    runtime: {
      ...runtime,
      graphValidation: structuredClone(environment.graphValidation),
    },
  });
  assert.equal(forgedValidation.kind, "projected_retry_resume_refusal");
  assert.equal(forgedValidation.code, "runtime_basis_mismatch");
  assert.equal(store.readAll().length, prefixCount);
  const malformedTime = hog.resumeProjectedRetry({
    store,
    predecessorPrefix: attemptResult.transition.successorPrefix,
    retry,
    runtime: { ...runtime, eventTime: "not-a-timestamp" },
  });
  assert.equal(malformedTime.kind, "projected_retry_resume_refusal");
  assert.equal(malformedTime.code, "runtime_basis_mismatch");
  assert.equal(store.readAll().length, prefixCount);
  // A Public outcome that carries the store deep-freezes it, so the faults
  // below intercept reads on its class, for this store only.
  const storePrototype = Object.getPrototypeOf(store);
  const originalReadAll = storePrototype.readAll;
  const beforeFailureEvents = originalReadAll.call(store);
  const beforeFailureDigest = store.digest();
  const beforeFailureBytes = await readFile(environment.eventLogPath, "utf8");
  // The route admission reads the store once (its frame liveness); that read
  // sees no events, so the route is refused inside its transaction.
  storePrototype.readAll = function routeFailureRead() {
    if (this !== store) return originalReadAll.call(this);
    if (new Error().stack?.includes("admitRoute")) return Object.freeze([]);
    return originalReadAll.call(this);
  };
  const routeFailure = hog.resumeProjectedRetry({
    store,
    predecessorPrefix: attemptResult.transition.successorPrefix,
    retry,
    runtime,
  });
  storePrototype.readAll = originalReadAll;
  assert.equal(routeFailure.kind, "projected_retry_resume_refusal");
  assert.equal(routeFailure.code, "retry_route_refused");
  assert.deepEqual(store.readAll(), beforeFailureEvents);
  assert.equal(store.digest(), beforeFailureDigest);
  assert.equal(await readFile(environment.eventLogPath, "utf8"),
    beforeFailureBytes);
  // The attempt admission reads the store only through its expected-prefix
  // digest, after the route is staged; that digest differs, so the attempt
  // is refused and the staged route rolls back with it.
  const originalDigest = storePrototype.digest;
  storePrototype.digest = function attemptFailureDigest(...args) {
    if (this === store && new Error().stack?.includes("admitRetryAttempt")) {
      return `sha256:${"0".repeat(64)}`;
    }
    return originalDigest.apply(this, args);
  };
  const attemptFailure = hog.resumeProjectedRetry({
    store,
    predecessorPrefix: attemptResult.transition.successorPrefix,
    retry,
    runtime,
  });
  storePrototype.digest = originalDigest;
  assert.equal(attemptFailure.kind, "projected_retry_resume_refusal");
  assert.equal(attemptFailure.code, "retry_attempt_refused");
  assert.deepEqual(store.readAll(), beforeFailureEvents);
  assert.equal(store.digest(), beforeFailureDigest);
  assert.equal(await readFile(environment.eventLogPath, "utf8"),
    beforeFailureBytes);
  const resumed = hog.resumeProjectedRetry({
    store,
    predecessorPrefix: attemptResult.transition.successorPrefix,
    retry,
    runtime,
  });
  assert.equal(resumed.kind, "projected_retry_resume", JSON.stringify(resumed));
  const projectedPrefixCount = store.readAll().length;
  const stalePrefix = hog.resumeProjectedRetry({
    store,
    predecessorPrefix: attemptResult.transition.successorPrefix,
    retry,
    runtime,
  });
  assert.equal(stalePrefix.kind, "projected_retry_resume_refusal");
  assert.equal(stalePrefix.code, "prefix_mismatch");
  assert.equal(store.readAll().length, projectedPrefixCount);
  const commonExecution = {
    store,
    predecessorPrefix: resumed.successorPrefix,
    executionBasis,
    openedTraversalScope: opened.scope,
    program: environment.program,
    graphFunction: environment.graphFunction,
    graph,
    graphValidation: environment.graphValidation,
    programValidation: environment.programValidation,
    implementationSet: environment.implementationSet,
    interactionSet: environment.interactionSet,
    continuationProductBasis: environment.continuationProductBasis,
    leafPort: environment.leafPort,
    closureContract: environment.closureContract,
    actorRuntimeBinding: environment.actorRuntimeBinding,
    eventTime: EVENT_TIME,
    correlationId: `correlation://s06/ax-f09/carrier/${retry.nextAttempt}`,
  };
  const cyclicInputValue = {};
  cyclicInputValue.self = cyclicInputValue;
  await assert.rejects(
    () => hog.executeGraphTraversal({
      ...commonExecution,
      projectedRetryResume: { ...resumed, inputValue: cyclicInputValue },
    }),
    (error) =>
      error instanceof TypeError &&
      error.message ===
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
  );
  assert.equal(store.readAll().length, projectedPrefixCount);
  await assert.rejects(
    () => hog.executeGraphTraversal({
      ...commonExecution,
      projectedRetryResume: resumed,
      input: environment.invocationInput,
      inputDigest: environment.rawInput.subjectDigest,
    }),
    (error) =>
      error instanceof TypeError &&
      error.message ===
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
  );
  assert.equal(store.readAll().length, projectedPrefixCount);
  const runEvent = store.readAll().find((event) =>
    event.kind === "run_segment_opened" &&
    event.runId === opened.scope.runId);
  assert.ok(runEvent);
  const {
    runId: _originalRunId,
    runDigest: _originalRunDigest,
    ...originalRunBody
  } = runEvent.payload;
  const unrelatedRunBody = {
    ...originalRunBody,
    invocationRef: `${originalRunBody.invocationRef}/unrelated-tail`,
  };
  const unrelatedRunDigest = environment.product.sha256Canonical(
    unrelatedRunBody,
  );
  const unrelatedRunId =
    `run://abiogenesis/${unrelatedRunDigest.slice("sha256:".length)}`;
  const {
    eventId: _runEventId,
    admissionOrdinal: _runAdmissionOrdinal,
    payloadDigest: _runPayloadDigest,
    eventContractDigest: _runEventContractDigest,
    ...runCandidate
  } = runEvent;
  const [unrelatedRunEvent] = environment.eventStoreOwner.admitRuntimeEventBatch(
    store,
    [() => ({
      ...runCandidate,
      aggregateId: unrelatedRunId,
      causationEventRefs: [runEvent.causationEventRefs[0]],
      correlationId:
        `${runEvent.correlationId}/unrelated-physical-tail`,
      runId: unrelatedRunId,
      payload: {
        runId: unrelatedRunId,
        runDigest: unrelatedRunDigest,
        ...unrelatedRunBody,
      },
    })],
  );
  assert.equal(unrelatedRunEvent.runId, unrelatedRunId);
  const unrelatedTailPrefix =
    environment.eventStoreOwner.selectHeldEventStoreDurablePrefix(store);
  const tailBoundCount = store.readAll().length;
  await assert.rejects(
    () => hog.executeGraphTraversal({
      ...commonExecution,
      predecessorPrefix: unrelatedTailPrefix,
      projectedRetryResume: {
        ...resumed,
        successorPrefix: unrelatedTailPrefix,
      },
    }),
    (error) =>
      error instanceof TypeError &&
      error.message ===
        "diagnostic://abiogenesis/hog/projected-retry-projection-mismatch@5",
  );
  assert.equal(store.readAll().length, tailBoundCount);
  const nextStop = hog.traverseFromCursor(
    {
      program,
      graphFunction: environment.graphFunction,
      graph,
      graphValidation: environment.graphValidation,
      executionBasis,
      openedTraversalScope: opened.scope,
    },
    resumed.nextCursor,
  );
  assert.equal(
    nextStop.kind,
    "traversal_stop_ref",
    JSON.stringify(nextStop),
  );
  return {
    stop: nextStop,
    retry,
    resumed,
    controls: {
      forgedGraphValidationRefusedPurely: true,
      malformedEventTimeRefusedPurely: true,
      stalePrefixRefusedWithoutMutation: true,
      routeFailureRolledBack: true,
      attemptFailureRolledBackRoute: true,
      cyclicCarrierMappedToExactDiagnostic: true,
      projectedXorRejectsRawIngress: true,
      unrelatedRunTailSubstitutionRefused: true,
    },
  };
}

async function advanceOwnerToLocus(
  environment,
  opened,
  initial,
  inputValue,
  correlationId,
) {
  let cursor = initial.kind === "traversal_stop_ref"
    ? initial.cursor
    : initial;
  for (let routeOrdinal = 0; routeOrdinal < 64; routeOrdinal += 1) {
    assert.equal(cursor.kind, "traversal_cursor", JSON.stringify(cursor));
    const traversed = environment.hog.traverseFromCursor(
      {
        program: environment.program,
        graphFunction: environment.graphFunction,
        graph: environment.graph,
        graphValidation: environment.graphValidation,
        executionBasis: environment.executionBasis,
        openedTraversalScope: opened.scope,
      },
      cursor,
    );
    if (traversed.kind === "traversal_stop_ref") {
      return traversed;
    }
    assert.equal(
      traversed.kind,
      "traversal_cursor",
      JSON.stringify(traversed),
    );
    const term = environment.hog.resolveTraversalTerm(
      environment.graph,
      cursor,
    );
    assert.notEqual(term.kind, "traversal_refusal", JSON.stringify(term));
    assert.notEqual(term.kind, "c_of");
    assert.notEqual(term.kind, "c_workflow");
    const advanced = environment.structuralOwner.advanceStructuralTransition({
      store: environment.store,
      predecessorPrefix:
        environment.eventStoreOwner.selectHeldEventStoreDurablePrefix(
          environment.store,
        ),
      executionBasis: environment.executionBasis,
      openedTraversalScope: opened.scope,
      graph: environment.graph,
      graphFunction: environment.graphFunction,
      leafPort: environment.leafPort,
      cursor,
      input: inputValue,
      term,
      ordinal: routeOrdinal,
      structuralOrdinal: routeOrdinal,
      eventTime: EVENT_TIME,
      correlationId,
    });
    assert.equal(
      advanced.kind,
      "structural_advance",
      JSON.stringify(advanced),
    );
    cursor = advanced.cursor;
  }
  assert.fail("structural owner did not reach one exact executable locus");
}

async function produceFrontier(input) {
  assert.deepEqual(
    Object.keys(input).sort(),
    [
      "action",
      "fixtureArtifactPath",
      "fixtureArtifactRef",
      "fixtureBasis",
      "frozenArtifact",
      "packageRoot",
      "supportPath",
    ],
  );
  const environment = await constructP1Environment(input);
  await mkdir(environment.workspaceBinding.roots.runtimeStateRoot, {
    recursive: true,
  });
  const worker = await installAttemptWorker(
    environment.workspaceBinding.roots.runtimeStateRoot,
  );
  process.env.ABG_TS_CLAUDE_COMMAND = worker.command;
  process.env.ABG_AX_F09_COUNTER = worker.counterPath;
  process.env.ABG_TS_FP_TIMEOUT_MS = "10000";
  const eventLogPath = environment.eventLogPath;
  const opened = environment.abg.openTraversalScope(
    environment.store,
    environment.eventStoreOwner.selectHeldEventStoreDurablePrefix(
      environment.store,
    ),
    {
      kind: "root",
      executionBasis: environment.executionBasis,
    },
    basis("open"),
  );
  assert.equal(
    opened.kind,
    "traversal_scope_open_admission",
    JSON.stringify(opened),
  );
  environment.opened = opened;
  const entryMismatchSnapshot = {
    events: environment.product.canonicalJson(environment.store.readAll()),
    digest: environment.store.digest(),
    bytes: await readFile(eventLogPath, "utf8"),
  };
  const forgedEntryInput = {
    ...environment.invocationInput,
    message: `${environment.invocationInput.message}::forged-entry`,
  };
  await assert.rejects(
    () => environment.hog.executeGraphTraversal({
      store: environment.store,
      predecessorPrefix:
        environment.eventStoreOwner.selectHeldEventStoreDurablePrefix(
          environment.store,
        ),
      executionBasis: environment.executionBasis,
      openedTraversalScope: opened.scope,
      program: environment.program,
      graphFunction: environment.graphFunction,
      graph: environment.graph,
      graphValidation: environment.graphValidation,
      programValidation: environment.programValidation,
      implementationSet: environment.implementationSet,
      interactionSet: environment.interactionSet,
      continuationProductBasis: environment.continuationProductBasis,
      leafPort: environment.leafPort,
      closureContract: environment.closureContract,
      actorRuntimeBinding: environment.actorRuntimeBinding,
      input: forgedEntryInput,
      inputDigest: environment.product.sha256Canonical(forgedEntryInput),
      eventTime: EVENT_TIME,
      correlationId: "correlation://s06/ax-f09/forged-entry",
    }),
    (error) =>
      error instanceof TypeError &&
      error.message ===
        "diagnostic://abiogenesis/hog/execution-basis-input-mismatch@5",
  );
  assert.deepEqual(
    {
      events: environment.product.canonicalJson(environment.store.readAll()),
      digest: environment.store.digest(),
      bytes: await readFile(eventLogPath, "utf8"),
    },
    entryMismatchSnapshot,
  );
  const traversal = environment.hog.traverse({
    program: environment.program,
    graphFunction: environment.graphFunction,
    graph: environment.graph,
    graphValidation: environment.graphValidation,
    executionBasis: environment.executionBasis,
    openedTraversalScope: opened.scope,
  });
  assert.equal(traversal.kind, "traversal_cursor", JSON.stringify(traversal));
  const initialCursor = traversal;
  const cursorAdmission = environment.abg.admitInitialTraversalCursor(
    environment.store,
    environment.eventStoreOwner.selectHeldEventStoreDurablePrefix(
      environment.store,
    ),
    environment.executionBasis,
    opened.scope,
    environment.graph,
    environment.graphValidation,
    initialCursor,
    basis("initial-cursor"),
  );
  assert.equal(
    cursorAdmission.kind,
    "traversal_cursor_admission",
    JSON.stringify(cursorAdmission),
  );
  let stop = await advanceOwnerToLocus(
    environment,
    opened,
    traversal,
    environment.invocationInput,
    "correlation://s06/ax-f09/structural",
  );
  assert.equal(stop.kind, "traversal_stop_ref", JSON.stringify(stop));
  assert.equal(stop.programLocusRef,
    retryProduct.AX_F09_RETRY_IDS.transformLocusRef);
  const transformedLifecycle = await Effect.runPromise(
    environment.cCallOwner.evaluateExecutableCCall({
    store: environment.store,
    predecessorPrefix:
      environment.eventStoreOwner.selectHeldEventStoreDurablePrefix(
        environment.store,
      ),
    executionBasis: environment.executionBasis,
    openedTraversalScope: opened.scope,
    program: environment.program,
    graphFunction: environment.graphFunction,
    graph: environment.graph,
    graphValidation: environment.graphValidation,
    stop,
    implementationSet: environment.implementationSet,
    leafPort: environment.leafPort,
    input: environment.invocationInput,
    closureContract: environment.closureContract,
    actorRuntimeBinding: environment.actorRuntimeBinding,
    scopeClass: "root",
    clock: {
      eventTime: EVENT_TIME,
      correlationId: "correlation://s06/ax-f09/transform",
    },
    ordinal: 0,
  }),
  );
  assert.equal(
    transformedLifecycle.kind,
    "c_call_evaluation",
    JSON.stringify(transformedLifecycle),
  );
  const transformed = transformedLifecycle.completion;
  assert.equal(transformed.disposition, "advanced", JSON.stringify(transformed));
  assert.notEqual(transformed.nextCursor, null);
  assert.notEqual(transformed.resultRef, null);
  assert.equal(isRecord(transformed.resultValue), true);
  const transformedInput = transformed.resultValue;
  const transformedInputDigest = environment.product.sha256Canonical(
    transformedInput,
  );
  assert.notEqual(transformedInputDigest, environment.rawInput.subjectDigest);
  assert.equal(transformed.nextCursor.inputDigest, transformedInputDigest);
  stop = await advanceOwnerToLocus(
    environment,
    opened,
    transformed.nextCursor,
    transformedInput,
    "correlation://s06/ax-f09/retry-entry",
  );
  assert.equal(stop.kind, "traversal_stop_ref", JSON.stringify(stop));
  assert.equal(stop.programLocusRef, retryProduct.AX_F09_RETRY_IDS.locusRef);
  let activeFrontier = environment.abg.projectDeclaredCRetryFrontier(
    environment.abg.selectValidatedRuntimeEventPrefix(
      environment.store.readAll(),
    ),
    environment.graph,
    stop.cursor,
    environment.graphFunction,
  );
  assert.notEqual(activeFrontier, null);
  assert.equal(
    activeFrontier.state,
    "attempt_active",
    JSON.stringify(activeFrontier),
  );
  let activeAttempt = activeFrontier.active.attempt;
  assert.equal(
    environment.product.sha256Canonical(activeAttempt.inputValue),
    activeAttempt.inputDigest,
  );
  const firstAttemptEvent = environment.store.readAll().find((event) =>
    event.eventId === activeAttempt.admissionEventRef);
  assert.equal(firstAttemptEvent?.kind, "retry_attempt_opened");
  assert.deepEqual(firstAttemptEvent.causationEventRefs, [
    firstAttemptEvent.causationEventRefs[0],
  ], "ordinary first retry is sourced and caused by its exact current route");
  assert.equal(Object.hasOwn(firstAttemptEvent.payload, "inputSourceEventRef"), false);
  assert.equal(Object.hasOwn(firstAttemptEvent.payload, "inputValueKind"), false);
  const first = await rejectAttempt(
    environment,
    stop,
    transformedInput,
    "no_output",
  );
  const advanced = await advanceRetry(environment, first);
  stop = advanced.stop;
  assert.equal(stop.cursor.attempt, 2);
  activeFrontier = environment.abg.projectDeclaredCRetryFrontier(
    environment.abg.selectValidatedRuntimeEventPrefix(
      environment.store.readAll(),
    ),
    environment.graph,
    stop.cursor,
    environment.graphFunction,
  );
  assert.notEqual(activeFrontier, null);
  assert.equal(
    activeFrontier.state,
    "attempt_active",
    JSON.stringify(activeFrontier),
  );
  activeAttempt = activeFrontier.active.attempt;
  const second = await rejectAttempt(
    environment,
    stop,
    transformedInput,
    "contract_failure",
  );
  assert.notEqual(first.failureSignalRef, second.failureSignalRef);
  const beforeCloseEvents = environment.store.readAll();
  const attempts = beforeCloseEvents.filter(
    (event) => event.kind === "retry_attempt_opened",
  );
  const progress = beforeCloseEvents.filter(
    (event) => event.kind === "retry_progress_recorded",
  );
  const actorStarts = beforeCloseEvents.filter(
    (event) => event.kind === "actor_invocation_started",
  );
  const cCallEvents = beforeCloseEvents.filter(
    (event) => event.kind === "c_call_opened",
  );
  const retryCCallEvents = cCallEvents.filter(
    (event) =>
      event.payload.programLocusRef === retryProduct.AX_F09_RETRY_IDS.locusRef,
  );
  const retryRoutes = beforeCloseEvents.filter(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.routeKind === "retry",
  );
  const completeCCallKinds = [
    "c_call_opened",
    "c_call_fibre_selected",
    "c_call_evidenced",
    "c_call_result_admitted",
    "c_call_judged",
  ];
  const completeCCallHistories = [first.cCall, second.cCall].every((cCall) => {
    const kinds = beforeCloseEvents
      .filter((event) => event.aggregateId === cCall.cCallRef)
      .map((event) => event.kind);
    return completeCCallKinds.every((kind) => kinds.includes(kind));
  });
  const firstProgressFluent = environment.eventCalculusOwner
    .constructScopedRetryFluent(
      "retry_progress_available",
      {
        runId: environment.opened.scope.runId,
        graphCallId: environment.opened.scope.graphCallId,
        frameId: environment.opened.scope.frameId,
        retryBoundaryRef: first.progress.retryBoundaryRef,
        authorityRef: first.progress.progressRef,
      },
    ).fluentRef;
  const consumedRetryProgressRefs = new Set(
    retryRoutes.flatMap((event) =>
      event.payload.consumedAvailabilityRefs.filter((ref) =>
        ref.startsWith("retry-progress://"))),
  );
  const heldRetryProgressRefs = progress
    .map((event) => event.payload.progressRef)
    .filter((ref) => !consumedRetryProgressRefs.has(ref));
  const firstProgressConsumptionRoute = retryRoutes.find((event) =>
    event.payload.consumedAvailabilityRefs.includes(first.progress.progressRef));
  assert.notEqual(firstProgressConsumptionRoute, undefined);
  const firstRouteEffect = environment.abg.eventCalculusEffect(
    firstProgressConsumptionRoute,
    beforeCloseEvents.filter((event) =>
      event.admissionOrdinal < firstProgressConsumptionRoute.admissionOrdinal),
  );
  const attemptInputCoverage = inspectAttemptInputCoverage(attempts, {
    expectedInputRef: transformed.resultRef,
    expectedInputDigest: transformedInputDigest,
    expectedInputContractRef:
      axF09Terms(environment.graphFunction).retryLeaf.requirement
        .inputContractRef,
  });
  const attemptRouteCursorBinding = inspectAttemptRouteCursorBindings(
    beforeCloseEvents,
    attempts,
  );
  const compactRetryProgress = inspectCompactRetryProgress(progress);
  assert.deepEqual(attempts.map((event) => event.payload.attempt), [1, 2]);
  assert.deepEqual(progress.map((event) => event.payload.attempt), [1, 2]);
  assert.deepEqual(
    progress.map((event) => event.payload.failureClass),
    ["no_output", "contract_failure"],
  );
  assert.deepEqual(
    attempts.map((event) => event.payload.retryPath),
    [[1], [2]],
  );
  assert.deepEqual(
    progress.map((event) => event.payload.completedAttempts),
    [[1], [1, 2]],
  );
  assert.equal(
    new Set(retryCCallEvents.map((event) => event.aggregateId)).size,
    2,
  );
  assert.equal(completeCCallHistories, true);
  assert.equal(retryRoutes.length, 2);
  assert.equal(
    firstRouteEffect.terminates
      .map(environment.abg.runtimeFluentKey)
      .includes(firstProgressFluent),
    true,
  );
  assert.deepEqual(heldRetryProgressRefs, [second.progress.progressRef]);
  assert.equal(actorStarts.length, 2);
  // Activity probe observations follow an attempt; the tail that advances the
  // retry is the last event that is not one.
  const durableRetryTail = beforeCloseEvents
    .filter((event) => event.kind !== "runtime_activity_probe_observed")
    .at(-1);
  assert.equal(durableRetryTail.eventId, second.progress.admissionEventRef);
  assert.equal(
    beforeCloseEvents.some(
      (event) =>
        event.kind === "retry_attempt_opened" && event.payload.attempt === 3,
    ),
    false,
  );
  assert.equal(await readFile(worker.counterPath, "utf8"), "2");
  const selector = {
    kind: "retry_frontier_selector",
    schemaVersion: "5.0.0",
    runId: second.cCall.runId,
    graphCallId: second.cCall.graphCallId,
    frameId: second.cCall.frameId,
    retryBoundaryRef: second.progress.retryBoundaryRef,
    retryProgressRef: second.progress.progressRef,
  };
  const projectedRetry = environment.abg.projectExecutableRetryInput({
    prefix: second.transition.successorPrefix,
    selector,
    program: environment.program,
    graphFunction: environment.graphFunction,
    graph: environment.graph,
  });
  assert.equal(
    projectedRetry.kind,
    "executable_retry_input",
    JSON.stringify(projectedRetry),
  );
  environment.abg.assertFullRetryAttemptFrontier(
    projectedRetry.retryFrontier,
  );
  assert.equal(projectedRetry.nextAttempt, 3);
  assert.deepEqual(projectedRetry.nextRetryPath, [3]);
  const retainedAttemptFluent = environment.eventCalculusOwner
    .constructScopedRetryFluent("retry_attempt_active", {
      runId: selector.runId,
      graphCallId: selector.graphCallId,
      frameId: selector.frameId,
      retryBoundaryRef: selector.retryBoundaryRef,
      authorityRef: projectedRetry.sourceAttempt.attemptRef,
    });
  const retainedProgressFluent = environment.eventCalculusOwner
    .constructScopedRetryFluent("retry_progress_available", {
      runId: selector.runId,
      graphCallId: selector.graphCallId,
      frameId: selector.frameId,
      retryBoundaryRef: selector.retryBoundaryRef,
      authorityRef: projectedRetry.progress.progressRef,
    });
  const retainedAudit = {
    d17Disposition: projectedRetry.disposition,
    d17ProjectionRef: projectedRetry.projectionRef,
    d17ProjectionDigest: projectedRetry.projectionDigest,
    d17FrontierRowIdentities: projectedRetry.retryFrontier.rows.map((row) => [
      row.rowRef,
      row.rowDigest,
    ]),
    scopedRetryFluentCanonical: [
      environment.product.canonicalJson(retainedAttemptFluent),
      environment.product.canonicalJson(retainedProgressFluent),
    ],
  };
  const closeHandoff = environment.store.projectReopenAuthorityAndClose();
  assert.deepEqual(
    closeHandoff.prefix,
    second.transition.successorPrefix,
  );
  const durableLogBytes = await readFile(eventLogPath, "utf8");
  const durableEvents = durableLogBytes
    .split("\n")
    .filter((line) => line.length !== 0)
    .map((line) => JSON.parse(line));
  assert.deepEqual(durableEvents, beforeCloseEvents);
  const durablePrefixContainsNonce = hasExactString(
    durableEvents,
    environment.nonceSubject,
  );
  const durablePrefixContainsCanonicalInputPreimage =
    containsCanonicalPreimage(
      durableEvents,
      environment.product.sha256Canonical(environment.invocationInput),
    );
  const handoff = {
    prefix: closeHandoff.prefix,
    reopenAuthority: closeHandoff.reopenAuthority,
    selector: {
      runId: selector.runId,
      graphCallId: selector.graphCallId,
      frameId: selector.frameId,
      retryBoundaryRef: selector.retryBoundaryRef,
      retryProgressRef: selector.retryProgressRef,
    },
    expectedExecutableRetryInputRef: projectedRetry.projectionRef,
    expectedExecutableRetryInputDigest: projectedRetry.projectionDigest,
  };
  return {
    action: "produce_frontier",
    pid: process.pid,
    cleanupRoot: environment.scratch,
    handoff,
    retainedAudit,
    audit: {
      exactHandoffKeys:
        Object.keys(handoff).join("\0") ===
          "prefix\0reopenAuthority\0selector\0expectedExecutableRetryInputRef\0expectedExecutableRetryInputDigest" &&
        Object.keys(handoff.selector).sort().join("\0") ===
          [
            "frameId",
            "graphCallId",
            "retryBoundaryRef",
            "retryProgressRef",
            "runId",
          ].join("\0"),
      handoffContainsInputValue:
        JSON.stringify(handoff).includes(environment.nonceSubject) ||
        hasForbiddenCarrierField(handoff),
      retainedAuditContainsInputValue:
        JSON.stringify(retainedAudit).includes(environment.nonceSubject) ||
        hasForbiddenCarrierField(retainedAudit),
      retryBudget: RETRY_BUDGET,
      attemptOrdinals: attempts.map((event) => event.payload.attempt),
      progressOrdinals: progress.map((event) => event.payload.attempt),
      failureClasses: progress.map((event) => event.payload.failureClass),
      retryPaths: attempts.map((event) => event.payload.retryPath),
      completedAttemptCoverage:
        progress.map((event) => event.payload.completedAttempts),
      failureSignalsDistinct:
        first.failureSignalRef !== second.failureSignalRef,
      cCallIdentityCount:
        new Set(retryCCallEvents.map((event) => event.aggregateId)).size,
      completeCCallHistories,
      retryRouteCount: retryRoutes.length,
      secondProgressIsSoleHeldRetryFluent:
        heldRetryProgressRefs.length === 1 &&
        heldRetryProgressRefs[0] === second.progress.progressRef,
      effectCount: actorStarts.length,
      workerCount: Number(await readFile(worker.counterPath, "utf8")),
      secondProgressIsDurableTail:
        durableRetryTail.eventId === second.progress.admissionEventRef,
      attemptThreeAbsent: !beforeCloseEvents.some(
        (event) =>
          event.kind === "retry_attempt_opened" && event.payload.attempt === 3,
      ),
      attemptThreeRouteAbsent: retryRoutes.length === 2,
      attemptThreeCCallAbsent: retryCCallEvents.length === 2,
      attemptThreeEffectAbsent:
        actorStarts.length === 2 &&
        Number(await readFile(worker.counterPath, "utf8")) === 2,
      attemptInputCoverage,
      attemptRouteCursorBinding,
      compactRetryProgress,
      durableRowsEqualClosedStore: true,
      completeDurablePrefixScanned: durableEvents.length === beforeCloseEvents.length,
      durablePrefixContainsNonce,
      durablePrefixContainsCanonicalInputPreimage,
      graphEntryInputDigest: environment.executionBasis.rawInputDigest,
      transformedRetryInputDigest: transformedInputDigest,
      graphEntryAndRetryInputDistinct:
        environment.executionBasis.rawInputDigest !== transformedInputDigest,
      initialEntryMismatchExactDiagnosticAndZeroAppend: true,
      projectedResumeControls: advanced.controls,
    },
  };
}

async function inspectHandoff(handoff, supportPath) {
  assert.deepEqual(Object.keys(handoff).sort(), [
    "expectedExecutableRetryInputDigest",
    "expectedExecutableRetryInputRef",
    "prefix",
    "reopenAuthority",
    "selector",
  ]);
  assert.deepEqual(Object.keys(handoff.selector).sort(), [
    "frameId",
    "graphCallId",
    "retryBoundaryRef",
    "retryProgressRef",
    "runId",
  ]);
  const reopened = installedAbg.reopenEventStore(handoff.reopenAuthority);
  assert.equal(
    reopened.kind,
    "reopened_event_store_context",
    JSON.stringify(reopened),
  );
  try {
    assert.deepEqual(reopened.prefix, handoff.prefix);
    const events = installedAbg.readRuntimeEventsAtDurablePrefix(
      handoff.prefix,
    );
    const exactPrefix = installedAbg.selectValidatedRuntimeEventPrefix(events);
    const selector = handoff.selector;
    const retrySelector = {
      kind: "retry_frontier_selector",
      schemaVersion: "5.0.0",
      ...selector,
    };
    const selected = events.filter(
      (event) =>
        event.kind === "retry_progress_recorded" &&
        event.runId === selector.runId &&
        event.graphCallId === selector.graphCallId &&
        event.frameId === selector.frameId &&
        event.payload.retryBoundaryRef === selector.retryBoundaryRef &&
        event.payload.progressRef === selector.retryProgressRef,
    );
    assert.equal(selected.length, 1);
    const attempts = events.filter(
      (event) =>
        event.kind === "retry_attempt_opened" &&
        event.runId === selector.runId &&
        event.graphCallId === selector.graphCallId &&
        event.frameId === selector.frameId &&
        event.payload.retryBoundaryRef === selector.retryBoundaryRef,
    );
    const progress = events.filter(
      (event) =>
        event.kind === "retry_progress_recorded" &&
        event.runId === selector.runId &&
        event.graphCallId === selector.graphCallId &&
        event.frameId === selector.frameId &&
        event.payload.retryBoundaryRef === selector.retryBoundaryRef,
    );
    const compactRetryProgress = inspectCompactRetryProgress(progress);
    const basisEvent = exactOne(
      events,
      (event) =>
        event.kind === "basis_admitted" &&
        event.runId === undefined &&
        event.payload.graphFunctionRef ===
          retryProduct.AX_F09_RETRY_IDS.graphFunctionRef,
      "AX-F09 execution-basis event",
    );
    const invocation = installedAbg.rehydrateInvocationAdmissionAtPrefix(
      exactPrefix,
      basisEvent.payload.invocationAdmissionRef,
    );
    assert.notEqual(invocation, null);
    const dependencies = await loadInstalledRetryDependencies(
      reopened,
      events,
      selector,
      basisEvent,
      invocation,
      supportPath,
    );
    const projectedRetry = installedAbg.projectExecutableRetryInput({
      prefix: handoff.prefix,
      selector: retrySelector,
      program: dependencies.program,
      graphFunction: dependencies.graphFunction,
      graph: dependencies.graph,
    });
    assert.equal(
      projectedRetry.kind,
      "executable_retry_input",
      JSON.stringify(projectedRetry),
    );
    assert.equal(
      projectedRetry.projectionRef,
      handoff.expectedExecutableRetryInputRef,
    );
    assert.equal(
      projectedRetry.projectionDigest,
      handoff.expectedExecutableRetryInputDigest,
    );
    installedAbg.assertFullRetryAttemptFrontier(
      projectedRetry.retryFrontier,
    );
    const attemptFluent = installedEventCalculus.constructScopedRetryFluent(
      "retry_attempt_active",
      {
        runId: selector.runId,
        graphCallId: selector.graphCallId,
        frameId: selector.frameId,
        retryBoundaryRef: selector.retryBoundaryRef,
        authorityRef: projectedRetry.sourceAttempt.attemptRef,
      },
    );
    const progressFluent = installedEventCalculus.constructScopedRetryFluent(
      "retry_progress_available",
      {
        runId: selector.runId,
        graphCallId: selector.graphCallId,
        frameId: selector.frameId,
        retryBoundaryRef: selector.retryBoundaryRef,
        authorityRef: projectedRetry.progress.progressRef,
      },
    );
    const targetSuffix = await inspectInstalledTargetSuffix(dependencies);
    const attemptInputCoverage = inspectAttemptInputCoverage(attempts, {
      expectedInputRef: projectedRetry.inputRef,
      expectedInputDigest: projectedRetry.inputDigest,
      expectedInputContractRef:
        axF09Terms(dependencies.graphFunction).retryLeaf.requirement
          .inputContractRef,
    });
    const attemptRouteCursorBinding = inspectAttemptRouteCursorBindings(
      events,
      attempts,
    );
    const inputDigests = [
      ...new Set(attempts.map((event) => event.payload.inputDigest)),
    ];
    assert.equal(
      inputDigests.length,
      1,
      `AX-F09 retry input digest: ${JSON.stringify(inputDigests)}`,
    );
    const [inputDigest] = inputDigests;
    const completeDurablePrefixContainsCanonicalInputPreimage =
      containsCanonicalPreimage(events, inputDigest);
    const targetSuffixCoordinatesExact =
      targetSuffix.coordinateCount === 2 &&
      JSON.stringify(targetSuffix.coordinates) ===
        JSON.stringify(TARGET_SUFFIX_COORDINATES);
    assert.equal(projectedRetry.nextAttempt, 3);
    assert.deepEqual(projectedRetry.nextRetryPath, [3]);
    const runtime = {
      executionBasis: dependencies.executionBasis,
      openedTraversalScope: dependencies.openedTraversalScope,
      program: dependencies.program,
      graphFunction: dependencies.graphFunction,
      graph: dependencies.graph,
      graphValidation: dependencies.graphValidation,
      eventTime: EVENT_TIME,
      correlationId: "correlation://s06/ax-f09/fresh-process/retry-3",
    };
    const resumed = installedHog.resumeProjectedRetry({
      store: reopened.store,
      predecessorPrefix: handoff.prefix,
      retry: projectedRetry,
      runtime,
    });
    assert.equal(
      resumed.kind,
      "projected_retry_resume",
      JSON.stringify(resumed),
    );
    const d18Events = reopened.store.readAll();
    assert.equal(
      d18Events.at(-2)?.eventId,
      resumed.routeAdmissionEventRef,
    );
    assert.equal(
      d18Events.at(-1)?.eventId,
      resumed.retryAttemptAdmissionEventRef,
    );
    assert.equal(
      d18Events.at(-2)?.admissionOrdinal + 1,
      d18Events.at(-1)?.admissionOrdinal,
    );
    const commonExecution = {
      store: reopened.store,
      predecessorPrefix: resumed.successorPrefix,
      executionBasis: dependencies.executionBasis,
      openedTraversalScope: dependencies.openedTraversalScope,
      program: dependencies.program,
      graphFunction: dependencies.graphFunction,
      graph: dependencies.graph,
      graphValidation: dependencies.graphValidation,
      programValidation: dependencies.programValidation,
      implementationSet: dependencies.implementationSet,
      interactionSet: dependencies.interactionSet,
      continuationProductBasis: dependencies.continuationProductBasis,
      leafPort: dependencies.leafPort,
      closureContract: dependencies.closureContract,
      actorRuntimeBinding: {
        workspaceBinding: dependencies.workspaceBinding,
        artifactTruth: dependencies.artifactTruth,
      },
      eventTime: EVENT_TIME,
      correlationId: "correlation://s06/ax-f09/fresh-process/execute",
    };
    const eventlessSnapshot = () => {
      const rows = reopened.store.readAll();
      return {
        events: installedProduct.canonicalJson(rows),
        prefix: installedProduct.canonicalJson(
          installedEventStoreOwner.selectHeldEventStoreDurablePrefix(
            reopened.store,
          ),
        ),
        runtimeFailureCount: rows.filter((event) =>
          event.kind === "runtime_failure").length,
        leafEffectCount: rows.filter((event) =>
          event.kind === "actor_invocation_started").length,
      };
    };
    const requireEventlessProjectedRefusal = async (
      carrier,
      expectedDiagnostic,
      overrides = {},
    ) => {
      const before = eventlessSnapshot();
      await assert.rejects(
        () => installedHog.executeGraphTraversal({
          ...commonExecution,
          ...overrides,
          projectedRetryResume: carrier,
        }),
        (error) =>
          error instanceof TypeError &&
          error.message === expectedDiagnostic,
      );
      assert.deepEqual(eventlessSnapshot(), before);
    };
    const {
      retryAttemptRef: _omittedRetryAttemptRef,
      ...missingFieldCarrier
    } = resumed;
    await requireEventlessProjectedRefusal(
      missingFieldCarrier,
      "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
    );
    await requireEventlessProjectedRefusal(
      { ...resumed, successorPrefix: handoff.prefix },
      "diagnostic://abiogenesis/hog/projected-retry-prefix-mismatch@5",
    );
    await requireEventlessProjectedRefusal(
      { ...resumed, routeAdmissionEventRef: projectedRetry.progressEventRef },
      "diagnostic://abiogenesis/hog/projected-retry-projection-mismatch@5",
    );
    const differentGraph = installedGtl.materializeGraph(
      dependencies.graphFunction,
      {
        invocationAdmissionRef:
          `${invocation.invocationAdmissionRef}/different-graph`,
        admittedInputRef: invocation.rawInputAdmissionRef,
        admittedInputDigest: invocation.rawInputDigest,
        admittedInput: dependencies.executionBasis.rawInputValue,
      },
    );
    const differentGraphValidation = installedValidator.validateGraph(
      differentGraph,
      dependencies.programValidation,
      dependencies.graphFunction,
      {
        invocationAdmissionRef: differentGraph.invocationAdmissionRef,
        admittedInputRef: differentGraph.admittedInputRef,
        admittedInputDigest: differentGraph.admittedInputDigest,
        admittedInput: dependencies.executionBasis.rawInputValue,
      },
    );
    assert.equal(
      differentGraphValidation.kind,
      "graph_validation",
      JSON.stringify(differentGraphValidation),
    );
    await requireEventlessProjectedRefusal(
      resumed,
      "diagnostic://abiogenesis/hog/projected-retry-traversal-mismatch@5",
      { graphValidation: differentGraphValidation },
    );
    const cyclicInputValue = {};
    cyclicInputValue.self = cyclicInputValue;
    await requireEventlessProjectedRefusal(
      { ...resumed, inputValue: cyclicInputValue },
      "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
    );
    await requireEventlessProjectedRefusal(
      resumed,
      "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
      {
        input: projectedRetry.inputValue,
        inputDigest: projectedRetry.inputDigest,
      },
    );
    process.env.ABG_TS_CLAUDE_COMMAND = join(
      dependencies.workspaceBinding.roots.runtimeStateRoot,
      "ax-f09-worker-command.cjs",
    );
    process.env.ABG_AX_F09_COUNTER = join(
      dependencies.workspaceBinding.roots.runtimeStateRoot,
      "attempt.count",
    );
    process.env.ABG_TS_FP_TIMEOUT_MS = "10000";
    const completion = await installedHog.executeGraphTraversal({
      ...commonExecution,
      projectedRetryResume: resumed,
    });
    const finalEvents = reopened.store.readAll();
    assert.equal(completion.disposition, "held", JSON.stringify(completion));
    assert.equal(completion.parentSuspensions.length, 1);
    const [parentSuspension] = completion.parentSuspensions;
    assert.equal(parentSuspension.kind, "held_workflow_suspension");
    assert.deepEqual(
      parentSuspension.parentGraphInput,
      dependencies.executionBasis.rawInputValue,
    );
    assert.equal(
      parentSuspension.parentGraphInputDigest,
      dependencies.executionBasis.rawInputDigest,
    );
    assert.deepEqual(parentSuspension.parentInput, projectedRetry.inputValue);
    assert.equal(parentSuspension.parentInputDigest, projectedRetry.inputDigest);
    assert.deepEqual(parentSuspension.childInput, projectedRetry.inputValue);
    assert.equal(parentSuspension.childInputDigest, projectedRetry.inputDigest);
    const childExecutionBasis = installedAbg.rehydrateExecutionBasis(
      reopened.store,
      parentSuspension.childExecutionBasisRef,
    );
    assert.notEqual(childExecutionBasis, null);
    assert.equal(childExecutionBasis.basisClass, "child");
    assert.deepEqual(childExecutionBasis.rawInputValue,
      projectedRetry.inputValue);
    assert.equal(childExecutionBasis.rawInputDigest,
      projectedRetry.inputDigest);
    const finalAttempts = finalEvents.filter((event) =>
      event.kind === "retry_attempt_opened" &&
      event.runId === selector.runId &&
      event.graphCallId === selector.graphCallId &&
      event.frameId === selector.frameId &&
      event.payload.retryBoundaryRef === selector.retryBoundaryRef);
    const finalProgress = finalEvents.filter((event) =>
      event.kind === "retry_progress_recorded" &&
      event.payload.progressClass === "retry" &&
      event.runId === selector.runId &&
      event.graphCallId === selector.graphCallId &&
      event.frameId === selector.frameId &&
      event.payload.retryBoundaryRef === selector.retryBoundaryRef);
    const finalEffects = finalEvents.filter((event) =>
      event.kind === "actor_invocation_started" &&
      event.runId === selector.runId);
    assert.deepEqual(
      finalAttempts.map((event) => event.payload.attempt),
      [1, 2, 3],
    );
    assert.deepEqual(
      finalProgress.map((event) => event.payload.attempt),
      [1, 2],
    );
    assert.equal(finalEffects.length, 3);
    assert.equal(finalEffects.at(-1)?.payload.inputDigest, projectedRetry.inputDigest);
    assert.equal(await readFile(process.env.ABG_AX_F09_COUNTER, "utf8"), "3");
    const finalPrefix = installedAbg.selectValidatedRuntimeEventPrefix(
      finalEvents,
      { runId: selector.runId },
    );
    const finalCalculus = installedAbg.deriveRuntimeEventCalculusProjection(
      finalPrefix,
    );
    const finalReplay = installedAbg.replay(reopened.store, {
      runId: selector.runId,
    });
    assert.equal(finalReplay.runtimeStatus, "held");
    const heldReplay = installedAbg.replay(reopened.store, {
      runId: completion.heldInteraction.cCall.runId,
    });
    assert.equal(heldReplay.runtimeStatus, "held");
    assert.equal(
      completion.replayState.replayDigest,
      heldReplay.replayDigest,
    );
    return {
      exactInputKeys: true,
      completeDurablePrefixEventCount: events.length,
      selectedFrontierCount: selected.length,
      selectedFrontierRefsAndDigestVerified:
        selected[0].payload.progressRef === selector.retryProgressRef &&
        selected[0].payload.retryBoundaryRef === selector.retryBoundaryRef &&
        installedProduct.sha256Canonical(selected[0].payload) ===
          selected[0].payloadDigest,
      attemptOrdinals: attempts.map((event) => event.payload.attempt),
      progressOrdinals: progress.map((event) => event.payload.attempt),
      failureClasses: progress.map((event) => event.payload.failureClass),
      attemptInputCoverage,
      attemptRouteCursorBinding,
      compactRetryProgress,
      dependenciesMatchBasis:
        dependencies.declarationsMatchBasis &&
        dependencies.executionDependenciesVerified,
      payloadInventoryVerified: dependencies.payloadInventoryVerified,
      semanticPublicationVerified: dependencies.semanticPublicationVerified,
      installedDeclarationsImmutable:
        dependencies.installedDeclarationsImmutable,
      materializedGraphImmutable:
        dependencies.materializedGraphImmutable,
      exportedDeclarationsMatchPublication:
        dependencies.exportedDeclarationsMatchPublication,
      installedContractsVerified: dependencies.installedContractsVerified,
      implementationDependencyVerified:
        dependencies.implementationDependencyVerified,
      implementationDependencyChecks:
        dependencies.implementationDependencyChecks,
      executionDependenciesVerified:
        dependencies.executionDependenciesVerified,
      installedDeclarationExportPresent:
        typeof retryProduct.constructAxF09Publication === "function" &&
        dependencies.program.programRef ===
          retryProduct.AX_F09_RETRY_IDS.programRef &&
        dependencies.graphFunction.name ===
          retryProduct.AX_F09_RETRY_IDS.graphFunctionRef,
      retryBudget: axF09Terms(dependencies.graphFunction).retry.budget,
      targetSuffixCoordinatesExact,
      targetSuffixDisposition: targetSuffix.disposition,
      targetSuffixDependenciesReady: targetSuffix.dependenciesReady,
      projectorExportPresent: targetSuffix.projectorExportPresent,
      retryAttemptFrontierTypeExportPresent:
        targetSuffix.retryAttemptFrontierTypeExportPresent,
      executableRetryInputTypeExportPresent:
        targetSuffix.executableRetryInputTypeExportPresent,
      fullFrontierAssertionExportPresent:
        targetSuffix.fullFrontierAssertionExportPresent,
      resumeExportPresent: targetSuffix.resumeExportPresent,
      d17Disposition: projectedRetry.disposition,
      d17ProjectionRef: projectedRetry.projectionRef,
      d17ProjectionDigest: projectedRetry.projectionDigest,
      d17FrontierRowIdentities: projectedRetry.retryFrontier.rows.map((row) => [
        row.rowRef,
        row.rowDigest,
      ]),
      scopedRetryFluentCanonical: [
        installedProduct.canonicalJson(attemptFluent),
        installedProduct.canonicalJson(progressFluent),
      ],
      completeDurablePrefixContainsCanonicalInputPreimage,
      d18Disposition: resumed.disposition,
      d18AtomicTailBound: true,
      projectedBranchControls: {
        missingFieldEventless: true,
        stalePredecessorEventless: true,
        routeRefMutationEventless: true,
        differentGraphValidationEventless: true,
        cyclicCarrierExactDiagnosticEventless: true,
        rawIngressXorEventless: true,
      },
      finalAttemptOrdinals:
        finalAttempts.map((event) => event.payload.attempt),
      finalProgressOrdinals:
        finalProgress.map((event) => event.payload.attempt),
      finalEffectCount: finalEffects.length,
      finalWorkerCount: Number(
        await readFile(process.env.ABG_AX_F09_COUNTER, "utf8"),
      ),
      finalCompletionDisposition: completion.disposition,
      finalRuntimeStatus: finalReplay.runtimeStatus,
      finalHeldRuntimeStatus: heldReplay.runtimeStatus,
      graphEntryInputDigest: dependencies.executionBasis.rawInputDigest,
      projectedRetryInputDigest: projectedRetry.inputDigest,
      graphEntryAndRetryInputDistinct:
        dependencies.executionBasis.rawInputDigest !==
          projectedRetry.inputDigest,
      parentGraphInputReconstructedFromBasis: true,
      parentRetryInputRemainsTransformed: true,
      childBasisInputComesFromRetryLocus: true,
      finalReplayDigest: finalReplay.replayDigest,
      finalEventCalculusCanonical:
        installedProduct.canonicalJson(finalCalculus),
    };
  } finally {
    reopened.store.closeDurableLog();
  }
}

async function inspectFrontier(input) {
  assert.deepEqual(Object.keys(input).sort(), [
    "action",
    "handoff",
    "supportPath",
  ]);
  return {
    action: "inspect_frontier",
    pid: process.pid,
    audit: await inspectHandoff(input.handoff, input.supportPath),
  };
}

async function produceAba(input) {
  assert.deepEqual(
    Object.keys(input).sort(),
    [
      "action",
      "fixtureArtifactPath",
      "fixtureArtifactRef",
      "fixtureBasis",
      "frozenArtifact",
      "packageRoot",
      "retryBudget",
      "supportPath",
    ],
  );
  const environment = await constructP1Environment(input);
  const worker = await installAttemptWorker(environment.scratch);
  process.env.ABG_TS_CLAUDE_COMMAND = worker.command;
  process.env.ABG_AX_F09_COUNTER = worker.counterPath;
  // The command's A-B-A mode. A refused structured value is a transport
  // contract_failure, which the fixture's failure candidate carries.
  process.env.ABG_AX_F09_ATTEMPT_MODE = "aba";
  process.env.ABG_TS_FP_TIMEOUT_MS = "10000";
  const opened = environment.abg.openTraversalScope(
    environment.store,
    environment.eventStoreOwner.selectHeldEventStoreDurablePrefix(
      environment.store,
    ),
    {
      kind: "root",
      executionBasis: environment.executionBasis,
    },
    basis("aba-open"),
  );
  assert.equal(
    opened.kind,
    "traversal_scope_open_admission",
    JSON.stringify(opened),
  );
  const completion = await environment.hog.executeGraphTraversal({
    store: environment.store,
    predecessorPrefix:
      environment.eventStoreOwner.selectHeldEventStoreDurablePrefix(
        environment.store,
      ),
    executionBasis: environment.executionBasis,
    openedTraversalScope: opened.scope,
    program: environment.program,
    graphFunction: environment.graphFunction,
    graph: environment.graph,
    graphValidation: environment.graphValidation,
    programValidation: environment.programValidation,
    implementationSet: environment.implementationSet,
    interactionSet: environment.interactionSet,
    continuationProductBasis: environment.continuationProductBasis,
    leafPort: environment.leafPort,
    closureContract: environment.closureContract,
    actorRuntimeBinding: environment.actorRuntimeBinding,
    input: environment.invocationInput,
    inputDigest: environment.rawInput.subjectDigest,
    eventTime: EVENT_TIME,
    correlationId: "correlation://s06/ax-f09/aba",
  });
  assert.equal(completion.disposition, "held", JSON.stringify(completion));
  const events = environment.store.readAll();
  const attempts = events.filter((event) =>
    event.kind === "retry_attempt_opened");
  const failureProgress = events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "retry");
  const signals = failureProgress.map((event) =>
    event.payload.failureSignalRef);
  const workerCount = Number(await readFile(worker.counterPath, "utf8"));
  const stoppedProgress = events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "stopped");
  const terms = axF09Terms(environment.graphFunction);
  assert.notEqual(terms.downstream, null);
  const attemptFourAttempt = exactOne(
    attempts,
    (event) => event.payload.attempt === 4,
    "AX-F09 A-B-A attempt-four admission",
  );
  const attemptFourCall = exactOne(
    events,
    (event) =>
      event.kind === "c_call_opened" &&
      event.graphFunctionRef === environment.graphFunction.name &&
      event.payload.programLocusRef === terms.retryLeaf.programLocusRef &&
      event.payload.attempt === 4 &&
      JSON.stringify(event.payload.retryPath) === "[4]",
    "AX-F09 A-B-A attempt-four CCall",
  );
  const attemptFourFibre = exactOne(
    events,
    (event) =>
      event.kind === "c_call_fibre_selected" &&
      event.aggregateId === attemptFourCall.aggregateId &&
      event.payload.regime === "F_P",
    "AX-F09 A-B-A attempt-four F_P fibre",
  );
  const attemptFourResult = exactOne(
    events,
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.aggregateId === attemptFourCall.aggregateId &&
      event.payload.cCallRef === attemptFourCall.aggregateId &&
      event.payload.resultClass === "success",
    "AX-F09 A-B-A attempt-four success result",
  );
  const attemptFourJudgment = exactOne(
    events,
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === attemptFourCall.aggregateId &&
      event.payload.cCallRef === attemptFourCall.aggregateId &&
      event.payload.resultRef === attemptFourResult.payload.resultRef &&
      event.payload.judgment === "advance",
    "AX-F09 A-B-A attempt-four advance judgment",
  );
  const completedProgresses = events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "completed" &&
    event.payload.retryBoundaryRef ===
      attemptFourAttempt.payload.retryBoundaryRef);
  assert.equal(completedProgresses.length, 1);
  const [completedProgress] = completedProgresses;
  assert.equal(completedProgress.payload.completionClass, "judged_success");
  assert.equal(completedProgress.payload.completedRetryDepth, 1);
  assert.equal(
    completedProgress.payload.attemptRef,
    attemptFourAttempt.payload.attemptRef,
  );
  assert.equal(completedProgress.payload.attempt, 4);
  assert.deepEqual(completedProgress.payload.retryPath, [4]);
  assert.equal(completedProgress.payload.cCallRef, attemptFourCall.aggregateId);
  assert.equal(
    completedProgress.payload.resultRef,
    attemptFourResult.payload.resultRef,
  );
  assert.equal(
    completedProgress.payload.judgmentRef,
    attemptFourJudgment.payload.judgmentRef,
  );
  assert.equal(
    completedProgress.payload.completionWitnessEventRef,
    attemptFourJudgment.eventId,
  );
  assert.equal(completedProgress.payload.predecessorProgressRef, null);
  const attemptFourRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    event.payload.cCallRef === attemptFourCall.aggregateId);
  assert.equal(attemptFourRoutes.length, 1);
  const [attemptFourAdvanceRoute] = attemptFourRoutes;
  assert.equal(attemptFourAdvanceRoute.payload.routeKind, "advance");
  assert.equal(
    attemptFourAdvanceRoute.payload.judgmentRef,
    attemptFourJudgment.payload.judgmentRef,
  );
  assert.equal(
    attemptFourAdvanceRoute.payload.sourceCursorRef,
    completedProgress.payload.sourceCursorRef,
  );
  assert.equal(
    attemptFourAdvanceRoute.payload.sourceCursorDigest,
    completedProgress.payload.sourceCursorDigest,
  );
  assert.equal(
    attemptFourAdvanceRoute.payload.targetCursorRef,
    completedProgress.payload.targetCursorRef,
  );
  assert.equal(
    attemptFourAdvanceRoute.payload.targetCursorDigest,
    completedProgress.payload.targetCursorDigest,
  );
  assert.notEqual(attemptFourAdvanceRoute.payload.targetCursorRef, null);
  assert.deepEqual(
    attemptFourAdvanceRoute.payload.consumedAvailabilityRefs,
    [
      attemptFourJudgment.payload.judgmentRef,
      completedProgress.payload.progressRef,
    ],
  );
  assert.equal(
    attemptFourAdvanceRoute.causationEventRefs.includes(
      completedProgress.eventId,
    ),
    true,
  );
  const attemptFourTerminalRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    event.payload.routeKind === "terminal" &&
    event.payload.cCallRef === attemptFourCall.aggregateId);
  const rootClosureEvents = events.filter((event) =>
    (event.kind === "terminal_reached" &&
      event.frameId === opened.scope.frameId) ||
    (event.kind === "frame_closed" &&
      event.frameId === opened.scope.frameId) ||
    (event.kind === "graph_call_closed" &&
      event.graphCallId === opened.scope.graphCallId) ||
    (event.kind === "run_closed" && event.runId === opened.scope.runId));
  assert.deepEqual(attempts.map((event) => event.payload.attempt), [1, 2, 3, 4]);
  assert.deepEqual(
    failureProgress.map((event) => event.payload.attempt),
    [1, 2, 3],
  );
  assert.equal(failureProgress.length, 3);
  assert.equal(signals[0], signals[2]);
  assert.notEqual(signals[0], signals[1]);
  assert.equal(workerCount, 4);
  assert.equal(stoppedProgress.length, 0);
  assert.equal(attemptFourFibre.payload.cCallRef, attemptFourCall.aggregateId);
  assert.equal(
    attemptFourJudgment.payload.retryAttemptRef,
    attemptFourAttempt.payload.attemptRef,
  );
  assert.equal(attemptFourTerminalRoutes.length, 0);
  assert.equal(rootClosureEvents.length, 0);

  assert.equal(completion.parentSuspensions.length, 1);
  const [parentSuspension] = completion.parentSuspensions;
  assert.equal(parentSuspension.kind, "held_workflow_suspension");
  assert.equal(
    parentSuspension.sourceCursor.cursorRef,
    attemptFourAdvanceRoute.payload.targetCursorRef,
  );
  assert.equal(
    parentSuspension.sourceCursor.cursorDigest,
    attemptFourAdvanceRoute.payload.targetCursorDigest,
  );
  assert.equal(
    parentSuspension.parentGraph.graphFunctionRef,
    environment.graphFunction.name,
  );
  assert.equal(parentSuspension.parentCCall.callClass, "workflow");
  assert.equal(
    parentSuspension.parentCCall.graphFunctionRef,
    environment.graphFunction.name,
  );
  assert.equal(
    parentSuspension.parentCCall.childGraphFunctionRef,
    terms.downstream.graphFunctionRef,
  );
  assert.equal(
    terms.downstream.graphFunctionRef,
    environment.childGraphFunction.name,
  );
  assert.equal(
    parentSuspension.parentExecutionBasisRef,
    environment.executionBasis.basisRef,
  );
  assert.equal(
    parentSuspension.parentTraversalScope.scopeRef,
    opened.scope.scopeRef,
  );
  assert.equal(
    parentSuspension.parentGraphInputDigest,
    environment.executionBasis.rawInputDigest,
  );
  assert.equal(
    environment.product.sha256Canonical(parentSuspension.parentGraphInput),
    parentSuspension.parentGraphInputDigest,
  );
  assert.equal(
    parentSuspension.parentInputDigest,
    attemptFourResult.payload.valueDigest,
  );
  assert.equal(
    parentSuspension.childInputDigest,
    attemptFourResult.payload.valueDigest,
  );
  assert.equal(
    environment.product.sha256Canonical(parentSuspension.parentInput),
    parentSuspension.parentInputDigest,
  );
  assert.equal(
    environment.product.sha256Canonical(parentSuspension.childInput),
    parentSuspension.childInputDigest,
  );
  assert.deepEqual(parentSuspension.parentInput, parentSuspension.childInput);
  const workflowStep = environment.hog.traverseFromCursor(
    {
      program: environment.program,
      graphFunction: environment.graphFunction,
      graph: environment.graph,
      graphValidation: environment.graphValidation,
      executionBasis: environment.executionBasis,
      openedTraversalScope: opened.scope,
    },
    parentSuspension.sourceCursor,
  );
  assert.equal(workflowStep.kind, "traversal_cursor", JSON.stringify(workflowStep));
  const workflowTerm = environment.hog.resolveTraversalTerm(
    environment.graph,
    workflowStep,
  );
  assert.equal(workflowTerm.kind, "c_workflow", JSON.stringify(workflowTerm));
  assert.equal(
    workflowTerm.graphFunctionRef,
    environment.childGraphFunction.name,
  );
  const workflowCallEvents = events.filter((event) =>
    event.kind === "c_call_opened" &&
    event.aggregateId === parentSuspension.parentCCall.cCallRef);
  assert.equal(workflowCallEvents.length, 1);
  const workflowRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    event.payload.cCallRef === parentSuspension.parentCCall.cCallRef);
  assert.equal(workflowRoutes.length, 0);

  const childExecutionBasis = environment.abg.rehydrateExecutionBasis(
    environment.store,
    parentSuspension.childExecutionBasisRef,
  );
  assert.notEqual(childExecutionBasis, null);
  assert.equal(childExecutionBasis.basisClass, "child");
  assert.equal(
    childExecutionBasis.parentExecutionBasisRef,
    environment.executionBasis.basisRef,
  );
  assert.equal(
    childExecutionBasis.parentTraversalScopeRef,
    opened.scope.scopeRef,
  );
  assert.equal(
    childExecutionBasis.graphFunctionRef,
    environment.childGraphFunction.name,
  );
  assert.equal(
    childExecutionBasis.rawInputDigest,
    parentSuspension.childInputDigest,
  );
  assert.deepEqual(
    childExecutionBasis.rawInputValue,
    parentSuspension.childInput,
  );
  assert.notEqual(completion.heldInteraction, null);
  assert.notEqual(completion.heldGraph, null);
  assert.notEqual(completion.heldClosureContract, null);
  const heldInteraction = completion.heldInteraction;
  const heldCCall = heldInteraction.cCall;
  assert.equal(heldCCall.regime, "F_H");
  assert.equal(heldCCall.graphFunctionRef, environment.childGraphFunction.name);
  assert.equal(
    heldCCall.programLocusRef,
    retryProduct.AX_F09_RETRY_IDS.childLocusRef,
  );
  assert.equal(heldCCall.basisId, childExecutionBasis.basisRef);
  assert.equal(heldInteraction.result.cCallRef, heldCCall.cCallRef);
  assert.equal(heldInteraction.judgment.cCallRef, heldCCall.cCallRef);
  assert.equal(
    heldInteraction.judgment.resultRef,
    heldInteraction.result.resultRef,
  );
  assert.equal(completion.cCallRef, heldCCall.cCallRef);
  assert.equal(completion.resultRef, heldInteraction.result.resultRef);
  assert.equal(completion.judgmentRef, heldInteraction.judgment.judgmentRef);
  assert.equal(
    completion.heldGraph.graphFunctionRef,
    environment.childGraphFunction.name,
  );
  assert.equal(
    completion.heldClosureContract.closureContractRef,
    retryProduct.AX_F09_RETRY_IDS.childClosureContractRef,
  );
  const childGraphCallEvent = exactOne(
    events,
    (event) =>
      event.kind === "graph_call_opened" &&
      event.basisId === childExecutionBasis.basisRef &&
      event.graphCallId === heldCCall.graphCallId,
    "AX-F09 A-B-A child graph call",
  );
  const childFrameEvent = exactOne(
    events,
    (event) =>
      event.kind === "frame_opened" &&
      event.basisId === childExecutionBasis.basisRef &&
      event.graphCallId === heldCCall.graphCallId &&
      event.frameId === heldCCall.frameId,
    "AX-F09 A-B-A child frame",
  );
  const childScopeBody = {
    executionBasisRef: childExecutionBasis.basisRef,
    executionBasisDigest: childExecutionBasis.basisDigest,
    invocationAdmissionRef: childExecutionBasis.invocationAdmissionRef,
    invocationRef: childExecutionBasis.invocationRef,
    programRef: childExecutionBasis.programRef,
    graphFunctionRef: childExecutionBasis.graphFunctionRef,
    graphRef: childExecutionBasis.graphRef,
    runId: opened.scope.runId,
    runDigest: opened.scope.runDigest,
    runOpenEventRef: opened.scope.runOpenEventRef,
    graphCallId: childGraphCallEvent.graphCallId,
    graphCallDigest: childGraphCallEvent.payload.graphCallDigest,
    graphCallOpenEventRef: childGraphCallEvent.eventId,
    frameId: childFrameEvent.frameId,
    frameDigest: childFrameEvent.payload.frameDigest,
    frameLineageId: childFrameEvent.payload.frameLineageId,
    frameOpenEventRef: childFrameEvent.eventId,
  };
  const childScopeDigest = environment.product.sha256Canonical(childScopeBody);
  const childTraversalScope = environment.abg.rehydrateOpenedTraversalScope(
    environment.store,
    {
      scopeRef:
        `traversal-scope://abiogenesis/${childScopeDigest.slice("sha256:".length)}`,
      scopeDigest: childScopeDigest,
      ...childScopeBody,
    },
  );
  assert.notEqual(childTraversalScope, null);
  assert.equal(
    childTraversalScope.scopeRef,
    parentSuspension.childTraversalScopeRef,
  );
  assert.equal(
    childTraversalScope.executionBasisRef,
    childExecutionBasis.basisRef,
  );
  assert.equal(heldCCall.runId, childTraversalScope.runId);
  assert.equal(heldCCall.graphCallId, childTraversalScope.graphCallId);
  assert.equal(heldCCall.frameId, childTraversalScope.frameId);
  assert.equal(
    heldInteraction.cursor.traversalScopeRef,
    childTraversalScope.scopeRef,
  );
  assert.equal(
    heldInteraction.cursor.executionBasisRef,
    childExecutionBasis.basisRef,
  );
  const heldCCallEvents = events.filter((event) =>
    event.kind === "c_call_opened" &&
    event.aggregateId === heldCCall.cCallRef);
  assert.equal(heldCCallEvents.length, 1);
  const heldRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    event.payload.cCallRef === heldCCall.cCallRef);
  assert.equal(heldRoutes.length, 1);
  const [heldRoute] = heldRoutes;
  assert.equal(heldRoute.payload.routeKind, "hold");
  assert.equal(
    heldRoute.payload.judgmentRef,
    heldInteraction.judgment.judgmentRef,
  );
  assert.equal(
    heldRoute.payload.sourceCursorRef,
    heldInteraction.cursor.cursorRef,
  );
  assert.equal(heldRoute.payload.targetCursorRef, null);
  assert.deepEqual(
    heldRoute.payload.consumedAvailabilityRefs,
    [heldInteraction.judgment.judgmentRef],
  );
  const heldContinuations = events.filter((event) =>
    event.kind === "fh_interaction_opened" &&
    event.payload.cCallRef === heldCCall.cCallRef &&
    event.payload.continuationRef === completion.continuationRef);
  assert.equal(heldContinuations.length, 1);
  const heldReplay = environment.abg.replay(environment.store, {
    runId: opened.scope.runId,
  });
  assert.equal(heldReplay.runtimeStatus, "held");
  assert.deepEqual(completion.replayState, heldReplay);
  // C-6 (TD-18) held-return steel thread over the genuine A-B-A hold: the
  // store owner closes and reopens the log; the parent's held suspension is
  // derived cold from admitted events and definition inputs only, starting
  // from the continuation ref the held output names; it and the return frames
  // rebuilt from it equal the warm suspension and its frames. No production
  // operation resumes an F_H-held Run, so this is a derivability witness at
  // the cold cut, not a Run resume.
  const loadOwner = (path) => import(pathToFileURL(join(
    environment.tenantRoot,
    `build/code/src/${path}.js`,
  )).href);
  const [
    basisOwner,
    cursorOwner,
    callOwner,
    scopeOwner,
    graphMaterializer,
    rehydrationOwner,
    valueOwner,
  ] = await Promise.all([
    loadOwner("abg/execution_basis"),
    loadOwner("abg/traversal_cursor"),
    loadOwner("abg/c_call"),
    loadOwner("abg/open_call"),
    loadOwner("gtl/materialize"),
    loadOwner("hog/parent_rehydration"),
    loadOwner("shared/value/index"),
  ]);
  const { canonicalEquals } = valueOwner;
  const sha256Canonical = environment.product.sha256Canonical;
  const fieldDifferences = (left, right) =>
    [...new Set([...Object.keys(left), ...Object.keys(right)])].filter(
      (key) => !(key in left) || !(key in right) ||
        !canonicalEquals(left[key], right[key]),
    );
  const abaClose = environment.store.projectReopenAuthorityAndClose();
  // The owners above are the environment tenant's; read the log through the
  // same instance, since validated prefixes are nominal per owner module.
  const abaReopened = environment.abg.reopenEventStore(abaClose.reopenAuthority);
  assert.equal(
    abaReopened.kind,
    "reopened_event_store_context",
    JSON.stringify(abaReopened),
  );
  let coldReturn;
  try {
    assert.deepEqual(abaReopened.prefix, abaClose.prefix);
    const coldPrefix = environment.abg.selectValidatedRuntimeEventPrefix(
      environment.abg.readRuntimeEventsAtDurablePrefix(abaReopened.prefix),
    );
    const coldEvents = abaReopened.store.readAll();
    const coldHold = exactOne(
      coldEvents,
      (event) =>
        event.kind === "fh_interaction_opened" &&
        event.payload.continuationRef === completion.continuationRef,
      "C-6 cold F_H hold",
    );
    const coldHeldCall = exactOne(
      coldEvents,
      (event) =>
        event.kind === "c_call_opened" &&
        event.aggregateId === coldHold.payload.cCallRef,
      "C-6 cold held CCall",
    );
    const coldChildBasis = basisOwner.rehydrateExecutionBasisAtPrefix(
      coldPrefix,
      coldHeldCall.basisId,
    );
    assert.notEqual(coldChildBasis, null);
    const coldParentBasis = basisOwner.rehydrateExecutionBasisAtPrefix(
      coldPrefix,
      coldChildBasis.parentExecutionBasisRef,
    );
    assert.notEqual(coldParentBasis, null);
    const parentFunction = environment.leafPort.graphFunctionByRef(
      coldParentBasis.graphFunctionRef,
    );
    const childFunction = environment.leafPort.graphFunctionByRef(
      coldChildBasis.graphFunctionRef,
    );
    assert.equal(sha256Canonical(parentFunction), coldParentBasis.graphFunctionDigest);
    assert.equal(sha256Canonical(childFunction), coldChildBasis.graphFunctionDigest);
    const coldParentGraph = graphMaterializer.materializeGraph(parentFunction, {
      invocationAdmissionRef: coldParentBasis.invocationAdmissionRef,
      admittedInputRef: coldParentBasis.rawInputAdmissionRef,
      admittedInputDigest: coldParentBasis.rawInputDigest,
      admittedInput: coldParentBasis.rawInputValue,
    });
    assert.equal(coldParentGraph.materializationRef, coldParentBasis.graphRef);
    assert.equal(
      coldParentGraph.materializationDigest,
      coldParentBasis.graphDigest,
    );
    const coldParentPosition =
      cursorOwner.projectOpenedCCallTraversalInputAtPrefix(
        coldPrefix,
        coldParentGraph,
        coldChildBasis.parentCCallRef,
      );
    assert.notEqual(coldParentPosition, null);
    assert.equal(coldParentPosition.execution.basisRef, coldParentBasis.basisRef);
    const coldParentCCall = callOwner.projectOpenedCCallCarrierAtPrefix(
      coldPrefix,
      coldParentGraph,
      coldChildBasis.parentCCallRef,
      coldParentPosition.cursor,
      parentFunction,
      childFunction,
      environment.programValidation,
    );
    assert.notEqual(coldParentCCall, null);
    const coldParentScope =
      scopeOwner.projectOpenedTraversalScopeForFrameAtPrefix(
        coldPrefix,
        coldParentPosition.cursor.frameId,
      );
    const coldChildScope =
      scopeOwner.projectOpenedTraversalScopeForFrameAtPrefix(
        coldPrefix,
        coldHeldCall.frameId,
      );
    assert.notEqual(coldParentScope, null);
    assert.notEqual(coldChildScope, null);
    const coldParentClosure = environment.leafPort.closureContractByRef(
      coldParentBasis.closureContractRef,
    );
    assert.equal(
      sha256Canonical(coldParentClosure),
      coldParentBasis.closureContractDigest,
    );
    const coldApplication = coldParentCCall.batchRef === null
      ? null
      : coldParentGraph.template.applications.find((candidate) =>
          candidate.relationKind === "fan_out" &&
          candidate.batchRef === coldParentCCall.batchRef) ?? null;
    const coldScopeClass = scopeOwner.projectOpenedTraversalScopeClassAtPrefix(
      coldPrefix,
      coldParentScope,
    );
    const derivedSuspension = {
      kind: "held_workflow_suspension",
      schemaVersion: "5.0.0",
      parentExecutionBasisRef: coldParentBasis.basisRef,
      parentTraversalScope: coldParentScope,
      parentGraph: coldParentGraph,
      parentClosureContract: coldParentClosure,
      parentCCall: coldParentCCall,
      application: coldApplication,
      sourceCursor: coldParentPosition.cursor,
      parentGraphInput: coldParentBasis.rawInputValue,
      parentGraphInputDigest: coldParentBasis.rawInputDigest,
      parentInput: coldParentPosition.input.value,
      parentInputDigest: coldParentPosition.input.inputDigest,
      childExecutionBasisRef: coldChildBasis.basisRef,
      childTraversalScopeRef: coldChildScope.scopeRef,
      childInput: coldChildBasis.rawInputValue,
      childInputDigest: coldChildBasis.rawInputDigest,
      terminalMode: coldScopeClass === "root" ? "close_run" : "return_to_parent",
    };
    assert.deepEqual(
      fieldDifferences(derivedSuspension, parentSuspension),
      [],
      "cold log derivation differs from the warm held suspension",
    );
    assert.equal(canonicalEquals(derivedSuspension, parentSuspension), true);
    const coldImplementationSet =
      basisOwner.rehydrateAdmittedImplementationSetAtPrefix(
        coldPrefix,
        coldParentBasis.rootImplementationSetRef,
      );
    assert.notEqual(coldImplementationSet, null);
    const rehydrate = (suspensions) =>
      rehydrationOwner.rehydrateParentReturnFrames({
        predecessorPrefix: abaReopened.prefix,
        program: environment.program,
        programValidation: environment.programValidation,
        implementationSet: coldImplementationSet,
        leafPort: environment.leafPort,
        currentChildExecutionBasis: coldChildBasis,
        currentChildTraversalScope: coldChildScope,
        suspensions,
      });
    const warmFrames = rehydrate(completion.parentSuspensions);
    const coldFrames = rehydrate([derivedSuspension]);
    assert.equal(
      warmFrames.kind,
      "rehydrated_parent_return_frames",
      JSON.stringify(warmFrames),
    );
    assert.equal(
      coldFrames.kind,
      "rehydrated_parent_return_frames",
      JSON.stringify(coldFrames),
    );
    assert.equal(coldFrames.frames.length, 1);
    assert.deepEqual(
      fieldDifferences(coldFrames.frames[0].parent, warmFrames.frames[0].parent),
      [],
    );
    assert.deepEqual(
      fieldDifferences(coldFrames.frames[0], warmFrames.frames[0]),
      [],
    );
    assert.equal(canonicalEquals(coldFrames.frames, warmFrames.frames), true);
    const closureField = Object.keys(coldParentClosure).find((key) =>
      key !== "closureContractRef" &&
      typeof coldParentClosure[key] === "string");
    assert.notEqual(closureField, undefined);
    const mutatedClosure = rehydrate([{
      ...derivedSuspension,
      parentClosureContract: {
        ...coldParentClosure,
        [closureField]: `${coldParentClosure[closureField]}#c6-mutated`,
      },
    }]);
    assert.equal(mutatedClosure.stage, "parent-runtime", JSON.stringify(mutatedClosure));
    const mutatedInput = { ...derivedSuspension.parentInput, c6Mutated: true };
    const unsealedInput = rehydrate([{
      ...derivedSuspension,
      parentInput: mutatedInput,
    }]);
    assert.equal(unsealedInput.stage, "workflow-relation", JSON.stringify(unsealedInput));
    const resealedInput = rehydrate([{
      ...derivedSuspension,
      parentInput: mutatedInput,
      parentInputDigest: sha256Canonical(mutatedInput),
    }]);
    assert.equal(resealedInput.stage, "workflow-relation", JSON.stringify(resealedInput));
    coldReturn = {
      coldSuspensionEqualsWarm: true,
      coldFramesEqualWarm: true,
      coldFrameCount: coldFrames.frames.length,
      coldMutatedClosureStage: mutatedClosure.stage,
      coldMutatedClosureField: closureField,
      coldUnsealedInputStage: unsealedInput.stage,
      coldResealedInputStage: resealedInput.stage,
    };
  } finally {
    abaReopened.store.closeDurableLog();
  }
  return {
    action: "produce_aba",
    cleanupRoot: environment.scratch,
    audit: {
      disposition: completion.disposition,
      attemptOrdinals: attempts.map((event) => event.payload.attempt),
      failureProgressOrdinals:
        failureProgress.map((event) => event.payload.attempt),
      failureSignals: signals,
      failureClasses: failureProgress.map((event) =>
        event.payload.failureClass),
      workerCount,
      stoppedProgressCount: stoppedProgress.length,
      attemptFourDispatchReached: true,
      attemptFourResultClass: attemptFourResult.payload.resultClass,
      attemptFourJudgment: attemptFourJudgment.payload.judgment,
      attemptFourCompletedProgressCount: completedProgresses.length,
      attemptFourCompletedProgressClass:
        completedProgress.payload.completionClass,
      attemptFourCompletedRetryDepth:
        completedProgress.payload.completedRetryDepth,
      attemptFourCompletedProgressCoordinatesExact: true,
      attemptFourAdvanceRouteCount: attemptFourRoutes.length,
      attemptFourRouteKind: attemptFourAdvanceRoute.payload.routeKind,
      attemptFourRouteCoordinatesExact: true,
      attemptFourRouteToAuthoredWorkflow: true,
      attemptFourConsumedRefsExact: true,
      attemptFourTerminalRouteCount: attemptFourTerminalRoutes.length,
      rootClosureCount: rootClosureEvents.length,
      childFhGraphFunctionRef: heldCCall.graphFunctionRef,
      childFhProgramLocusRef: heldCCall.programLocusRef,
      childFhCCallCount: heldCCallEvents.length,
      childFhHoldRouteCount: heldRoutes.length,
      childFhRouteKind: heldRoute.payload.routeKind,
      childFhHoldCoordinatesExact: true,
      childFhContinuationCount: heldContinuations.length,
      parentSuspensionCount: completion.parentSuspensions.length,
      parentSuspensionKind: parentSuspension.kind,
      parentGraphFunctionRef: parentSuspension.parentGraph.graphFunctionRef,
      childGraphFunctionRef: completion.heldGraph.graphFunctionRef,
      parentChildInputDigestExact: true,
      parentChildExecutionBasisLineageExact: true,
      parentChildTraversalScopeLineageExact: true,
      parentWorkflowRouteTargetExact: true,
      parentWorkflowRouteCount: workflowRoutes.length,
      heldReplayStatus: heldReplay.runtimeStatus,
      heldReplayExact: true,
      ...coldReturn,
    },
  };
}
const input = await readInput();
const output = input.action === "produce_frontier"
  ? await produceFrontier(input)
  : input.action === "produce_aba"
    ? await produceAba(input)
  : input.action === "inspect_frontier"
    ? await inspectFrontier(input)
    : (() => {
        throw new TypeError(`unknown AX-F09 worker action ${String(input.action)}`);
      })();
process.stdout.write(`${JSON.stringify(output)}\n`);
