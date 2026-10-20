import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  publicOperationBasis,
  requireRawAdmission,
  setupInstalledRootCatalog,
} from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("W2-03 request selection is owned only by ProductExecutionResolutionPort", async () => {
  const publicSource = await readFile(
    join(root, "code/src/public/operations.ts"),
    "utf8",
  );
  const productSource = await readFile(
    join(root, "code/src/product/execution_resolution.ts"),
    "utf8",
  );
  const publicStart = publicSource.indexOf("async function applyRunInvoke(");
  const publicEnd = publicSource.indexOf(
    "\nasync function projectCurrentOutcome(",
    publicStart,
  );
  const productStart = productSource.indexOf(
    "async function resolveProductExecution(",
  );
  const productEnd = productSource.indexOf(
    "\nexport const ProductExecutionResolutionPort",
    productStart,
  );
  assert.notEqual(publicStart, -1);
  assert.notEqual(publicEnd, -1);
  assert.notEqual(productStart, -1);
  assert.notEqual(productEnd, -1);
  const publicInvoke = publicSource.slice(publicStart, publicEnd);
  const productResolution = productSource.slice(productStart, productEnd);

  assert.match(publicInvoke, /selection: executionSelection/u);
  assert.match(publicInvoke, /executionResolution\.program/u);
  assert.match(publicInvoke, /executionResolution\.selectedCatalogEntry/u);
  assert.match(publicInvoke, /executionResolution\.resolvedProgramStart/u);
  assert.match(publicInvoke, /executionResolution\.programInstall/u);
  assert.doesNotMatch(publicInvoke, /resolveProgramStart\s*\(/u);
  assert.doesNotMatch(
    publicInvoke,
    /lookupGraphFunction(?:Definition)?\s*\(/u,
  );
  assert.doesNotMatch(publicInvoke, /resolveExactMatch\s*\(/u);
  assert.doesNotMatch(publicInvoke, /publicationMatches|readinessInstallMatches/u);

  assert.match(
    productResolution,
    /resolveProgramDeclarationClosure\([\s\S]*input\.selection\.kind === "direct"/u,
  );
  assert.match(
    productResolution,
    /lookupGraphFunction\([\s\S]*input\.selection\.catalogHandle/u,
  );
  assert.match(productResolution, /resolveProgramStart\(program,/u);
  assert.match(
    productResolution,
    /lookupGraphFunctionDefinition\([\s\S]*resolved\.start\.graphFunctionRef/u,
  );
  assert.match(
    productResolution,
    /input\.selection\.kind === "admitted"[\s\S]*input\.selection\.graphFunctionRef/u,
  );
});

function readinessCatalogView(environment, allowlist) {
  const catalog = environment.product.admitGraphFunctionCatalog({
    workspaceBinding: environment.bindingCandidate,
    resolvedLock: environment.lock,
    verifiedProducts: [environment.verified],
    installedProducts: [environment.installCandidate],
    publications: [environment.publication],
  });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  assert.ok(catalog.readinessBasis);
  for (const handle of allowlist) {
    const dispositions = catalog.rowDispositions.filter(
      (row) => row.handle === handle,
    );
    assert.equal(dispositions.length, 1, JSON.stringify(dispositions));
    assert.equal(dispositions[0].disposition, "admitted");
  }
  const view = environment.product.narrowGraphFunctionCatalog(
    catalog,
    allowlist,
  );
  assert.equal(view.kind, "graph_function_catalog_view", JSON.stringify(view));
  return { catalog, view };
}

test("non-root alias selection admits a distinct catalogHandle for one exact definition", async (context) => {
  const environment = await setupInstalledRootCatalog(context, root);
  const {
    product,
    abg,
    gtl,
    validator,
    store,
    artifactTruth,
    verified,
    installCandidate,
    admittedInstall,
    lock,
    bindingCandidate,
    workspaceBinding,
    publication,
    programValidations,
  } = environment;
  for (const field of [
    "programMembershipRefs",
    "readinessPrerequisiteRefs",
    "compatibilityRefs",
    "provenanceRefs",
  ]) {
    const duplicatePublication = structuredClone(publication);
    const contribution = duplicatePublication.contributions.find(
      (row) => row.handle === gtl.HELLO_WORLD_IDS.graphFunctionRef,
    );
    assert.ok(contribution);
    assert.ok(contribution[field].length > 0, `${field} duplicate witness`);
    contribution[field].push(contribution[field][0]);
    const duplicateRefusal = product.admitGraphFunctionCatalog({
      workspaceBinding: bindingCandidate,
      resolvedLock: lock,
      verifiedProducts: [verified],
      installedProducts: [installCandidate],
      publications: [duplicatePublication],
    });
    assert.equal(
      duplicateRefusal.kind,
      "catalog_construction_refusal",
      JSON.stringify(duplicateRefusal),
    );
    assert.equal(duplicateRefusal.code, "duplicate_contribution_reference");
    assert.equal(
      duplicateRefusal.message.includes(field),
      true,
      duplicateRefusal.message,
    );
  }
  const program = publication.programs.find(
    (row) => row.programRef === gtl.HELLO_WORLD_DIRECT_IDS.programRef,
  );
  const graphFunction = publication.graphFunctions.find(
    (row) => row.name === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  const priorProgramValidation = programValidations.find(
    (row) => row.programRef === gtl.HELLO_WORLD_DIRECT_IDS.programRef,
  );
  assert.ok(program);
  assert.ok(graphFunction);
  assert.ok(priorProgramValidation);
  assert.equal(priorProgramValidation.kind, "program_validation");
  assert.equal(program.starts.length, 0);
  assert.equal(program.publicAssetTargets, undefined);
  const { catalog, view: catalogView } = readinessCatalogView(
    environment,
    [gtl.HELLO_WORLD_DIRECT_IDS.handle],
  );
  const executionResolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls: [admittedInstall],
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(artifactTruth, install),
    programRef: program.programRef,
    selection: {
      kind: "direct",
      catalogHandle: gtl.HELLO_WORLD_DIRECT_IDS.handle,
    },
  });
  assert.equal(
    executionResolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(executionResolution),
  );
  assert.equal(
    executionResolution.selectedCatalogEntry.handle,
    gtl.HELLO_WORLD_DIRECT_IDS.handle,
  );
  assert.equal(executionResolution.resolvedProgramStart, null);
  assert.deepEqual(executionResolution.programInstall, admittedInstall);
  const programValidation = executionResolution.programValidation;
  const selectedRow = product.lookupGraphFunction(
    catalogView,
    gtl.HELLO_WORLD_DIRECT_IDS.handle,
  );
  assert.ok(selectedRow);
  assert.notEqual(selectedRow.handle, selectedRow.definitionRef);
  const input = gtl.constructHelloWorldInput("World");
  const rawInput = requireRawAdmission(
    validator,
    input,
    "invocation_input",
    gtl.HELLO_WORLD_IDS.inputContractRef,
  );
  const rawRequest = requireRawAdmission(
    validator,
    {
      kind: "public_invocation",
      schemaVersion: "5.0.0",
      operationId: "abg.operation.run.invoke",
      variant: "direct",
      invocationRef: "invocation://t286/r5/run-invoke",
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/r5/run-invoke",
      payload: {
        programRef: program.programRef,
        catalogHandle: gtl.HELLO_WORLD_DIRECT_IDS.handle,
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    program,
    [],
  );
  const actorRef = "actor://abiogenesis/t286/trusted-developer";
  const capabilityGrant = product.constructCapabilityGrant(policy, actorRef);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    selectedRow,
    policy,
    [capabilityGrant],
  );
  assert.equal(authority.kind, "invocation_authority", JSON.stringify(authority));
  const invocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    selectedRow,
    rawRequest,
    rawInput,
    policy,
    [capabilityGrant],
    authority,
  );
  assert.equal(invocation.kind, "public_invocation_candidate", JSON.stringify(invocation));
  assert.equal(invocation.catalogHandle, gtl.HELLO_WORLD_DIRECT_IDS.handle);
  assert.equal(invocation.selectedDefinitionRef, graphFunction.name);
  assert.equal(invocation.graphFunctionRef, graphFunction.name);
  assert.notEqual(invocation.catalogHandle, invocation.graphFunctionRef);
  const admissionInput = {
    artifactTruth,
    invocation,
    rawRequest,
    rawInput,
    programPublication: executionResolution.programPublication,
    executionResolution: executionResolution.resolution,
    program,
    graphFunction,
    programValidation,
    workspaceBinding,
    catalogView,
    policy,
    capabilityGrants: [capabilityGrant],
    authority,
  };
  const eventCountBeforeNegatives = store.readAll().length;
  const wrongHandleRequest = requireRawAdmission(
    validator,
    {
      kind: "public_invocation",
      schemaVersion: "5.0.0",
      operationId: "abg.operation.run.invoke",
      variant: "direct",
      invocationRef: "invocation://t286/r5/wrong-handle",
      eventTime: "2026-07-21T00:00:00.000Z",
      correlationId: "correlation://t286/r5/wrong-handle",
      payload: {
        programRef: program.programRef,
        catalogHandle: "gtl://abiogenesis/conformance/absent/call@5",
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const wrongHandleInvocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    selectedRow,
    wrongHandleRequest,
    rawInput,
    policy,
    [capabilityGrant],
    authority,
  );
  assert.equal(wrongHandleInvocation.kind, "public_invocation_candidate");
  const wrongHandleRefusal = abg.admitInvocation(
    store,
    {
      ...admissionInput,
      invocation: wrongHandleInvocation,
      rawRequest: wrongHandleRequest,
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      wrongHandleInvocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(wrongHandleRefusal.code, "selection_mismatch");

  const wrongDefinitionRefusal = abg.admitInvocation(
    store,
    {
      ...admissionInput,
      graphFunction: {
        ...graphFunction,
        name: "graph-function://abiogenesis/conformance/absent@5",
      },
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(wrongDefinitionRefusal.code, "selection_mismatch");

  const directSupervisedRefusal = abg.admitInvocation(
    store,
    {
      ...admissionInput,
      program: {
        ...program,
        policies: {
          ...program.policies,
          "abg.root_mode": "supervised",
        },
      },
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(directSupervisedRefusal.code, "selection_mismatch");

  const malformedInput = requireRawAdmission(
    validator,
    { kind: "wrong_input", schemaVersion: "5.0.0", subject: "World" },
    "invocation_input",
    gtl.HELLO_WORLD_IDS.inputContractRef,
  );
  const malformedContractRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, rawInput: malformedInput },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(malformedContractRefusal.code, "contract_mismatch");

  const missingGrantRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, capabilityGrants: [] },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(missingGrantRefusal.code, "capability_mismatch");

  const duplicateGrantRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, capabilityGrants: [capabilityGrant, capabilityGrant] },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(duplicateGrantRefusal.code, "capability_mismatch");

  const missingMembershipRefusal = abg.admitInvocation(
    store,
    { ...admissionInput, program: { ...program, callableMembership: [] } },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(missingMembershipRefusal.code, "selection_mismatch");

  const changedViewRefusal = abg.admitInvocation(
    store,
    {
      ...admissionInput,
      catalogView: { ...catalogView, entries: [], byHandle: {} },
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(changedViewRefusal.code, "selection_mismatch");

  const changedWorkspaceRefusal = abg.admitInvocation(
    store,
    {
      ...admissionInput,
      workspaceBinding: {
        ...workspaceBinding,
        roots: { ...workspaceBinding.roots, productRoot: "/tmp/not-the-admitted-product" },
      },
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(changedWorkspaceRefusal.code, "workspace_not_admitted");

  const invocationAdmissionReceipt = abg.admitInvocation(
    store,
    admissionInput,
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
      [workspaceBinding.admissionEventRef],
    ),
  );
  assert.equal(
    invocationAdmissionReceipt.kind,
    "invocation_admission_receipt",
    JSON.stringify(invocationAdmissionReceipt),
  );
  const invocationAdmission = invocationAdmissionReceipt.admission;
  assert.equal(invocationAdmission.disposition, "admitted");
  assert.equal(
    invocationAdmission.programRef,
    gtl.HELLO_WORLD_DIRECT_IDS.programRef,
  );
  assert.equal(
    invocationAdmission.catalogHandle,
    gtl.HELLO_WORLD_DIRECT_IDS.handle,
  );
  assert.equal(invocationAdmission.graphFunctionRef, gtl.HELLO_WORLD_IDS.graphFunctionRef);
  assert.equal(invocationAdmission.selectedDefinitionRef, graphFunction.name);
  assert.equal(
    invocationAdmission.programValidationRef,
    programValidation.validationRef,
  );
  const rootCoordinate = gtl.rootCTraversalCoordinate(
    graphFunction.template.startNodeRef,
  );
  const rootTerm = gtl.resolveCProgramTermAtSourcePath(
    graphFunction.template,
    rootCoordinate.nodeRef,
    rootCoordinate.termPath,
  );
  assert.notEqual(rootTerm.kind, "c_source_path_refusal");
  assert.deepEqual(invocationAdmission.gtlEntryCoordinate, rootCoordinate);
  assert.deepEqual(invocationAdmission.gtlEntryTerm, rootTerm);
  assert.equal("selectedFibreRef" in invocationAdmission, false);
  assert.equal("selectedFibreDigest" in invocationAdmission, false);
  assert.equal("selectedPlanRef" in invocationAdmission, false);
  assert.equal("selectedPlanDigest" in invocationAdmission, false);
  assert.equal(invocationAdmission.inputContractRef, gtl.HELLO_WORLD_IDS.inputContractRef);
  assert.equal(invocationAdmission.outputContractRef, gtl.HELLO_WORLD_IDS.outputContractRef);
  assert.equal(Object.isFrozen(invocationAdmission), true);
  assert.equal("graph" in invocationAdmission, false);
  assert.equal("executionBasis" in invocationAdmission, false);
  assert.equal("rootMode" in invocation, false);
  assert.equal("until" in invocation, false);

  const admittedPrefix = invocationAdmissionReceipt.successorPrefix;
  const admittedArtifactTruth = abg.projectExactPrefixArtifactTruth(
    admittedPrefix,
  );
  assert.equal(
    admittedArtifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
  );
  const clonedInvocationRefusal = abg.admitInvocation(
    store,
    {
      ...admissionInput,
      artifactTruth: admittedArtifactTruth,
      invocation: structuredClone(invocation),
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
    ),
  );
  assert.equal(clonedInvocationRefusal.code, "duplicate_invocation");
  assert.equal(store.readAll().length, eventCountBeforeNegatives + 2);

  const events = store.readAll();
  assert.deepEqual(events.slice(-2).map((event) => event.kind), [
    "public_operation_admitted",
    "invocation_admitted",
  ]);
  assert.deepEqual(
    events.map((event) => event.admissionOrdinal),
    Array.from({ length: events.length }, (_, index) => index + 1),
  );
  assert.equal(events.at(-1).causationEventRefs[0], events.at(-2).eventId);

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-non-root-alias-selection.json"),
    `${JSON.stringify({
      kind: "abi5_non_root_alias_selection_evidence",
      schemaVersion: "5.0.0",
      evidenceId: "ABI5-ALIAS-SELECTION-001",
      obligation: "catalog_handle_alias_selects_exact_definition",
      result: "satisfied",
      sourceImportUsed: false,
      artifactDigest: verified.artifactDigest,
      workspaceBindingId: workspaceBinding.bindingId,
      catalogViewId: catalogView.viewId,
      invocationRef: invocation.invocationRef,
      invocationDigest: invocation.invocationDigest,
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      invocationAdmissionDigest: invocationAdmission.invocationAdmissionDigest,
      programRef: invocationAdmission.programRef,
      graphFunctionRef: invocationAdmission.graphFunctionRef,
      inputContractRef: invocationAdmission.inputContractRef,
      outputContractRef: invocationAdmission.outputContractRef,
      actorRef: invocationAdmission.actorRef,
      authorityRef: invocationAdmission.authorityRef,
      capabilityGrantRefs: invocationAdmission.capabilityGrantRefs,
      eventStoreDigest: store.digest(),
      eventKinds: events.map((event) => event.kind),
      mutation: {
        malformedInputRefusal: malformedContractRefusal.code,
        wrongHandleRefusal: wrongHandleRefusal.code,
        wrongDefinitionRefusal: wrongDefinitionRefusal.code,
        missingCapabilityRefusal: missingGrantRefusal.code,
        duplicateCapabilityRefusal: duplicateGrantRefusal.code,
        missingMembershipRefusal: missingMembershipRefusal.code,
        changedCatalogViewRefusal: changedViewRefusal.code,
        changedWorkspaceRefusal: changedWorkspaceRefusal.code,
        clonedInvocationRefusal: clonedInvocationRefusal.code,
        duplicateEventCountUnchanged:
          store.readAll().length === eventCountBeforeNegatives + 2,
      },
      authorityBoundary: {
        graphMaterialized: false,
        executionBasisCreated: false,
        hogEntered: false,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});

test("R5 start admission resolves one exact Product start before its catalog definition", async (context) => {
  const environment = await setupInstalledRootCatalog(context, root);
  const {
    product,
    abg,
    gtl,
    validator,
    store,
    artifactTruth,
    admittedInstall,
    workspaceBinding,
    publication,
    programValidations,
  } = environment;
  const program = publication.programs.find(
    (row) => row.programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  const graphFunction = publication.graphFunctions.find(
    (row) => row.name === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  const priorProgramValidation = programValidations.find(
    (row) => row.programRef === gtl.HELLO_WORLD_IDS.programRef,
  );
  assert.ok(program);
  assert.ok(graphFunction);
  assert.ok(priorProgramValidation);
  assert.equal(priorProgramValidation.kind, "program_validation");
  assert.equal(program.starts.length, 1);
  assert.equal(
    program.policies["abg.default_start_ref"],
    gtl.HELLO_WORLD_IDS.startRef,
  );
  const { catalog, view: catalogView } = readinessCatalogView(
    environment,
    [
      gtl.HELLO_WORLD_IDS.graphFunctionRef,
      gtl.HELLO_WORLD_DIRECT_IDS.handle,
    ],
  );
  assert.equal(catalogView.entries.length, 2);
  const canonicalLookup = product.lookupGraphFunctionDefinition(
    catalogView,
    graphFunction.name,
    program.programRef,
  );
  assert.equal(canonicalLookup.kind, "graph_function_definition_lookup_exact");
  assert.equal(canonicalLookup.entry.handle, gtl.HELLO_WORLD_IDS.graphFunctionRef);
  const directLookup = product.lookupGraphFunctionDefinition(
    catalogView,
    graphFunction.name,
    gtl.HELLO_WORLD_DIRECT_IDS.programRef,
  );
  assert.equal(directLookup.kind, "graph_function_definition_lookup_exact");
  assert.equal(directLookup.entry.handle, gtl.HELLO_WORLD_DIRECT_IDS.handle);
  assert.ok(catalog.readinessBasis);
  const executionResolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls: [admittedInstall],
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(artifactTruth, install),
    programRef: program.programRef,
    selection: {
      kind: "start",
      scope: "program",
      target: "next",
      until: "converged",
      rootMode: "direct",
    },
  });
  assert.equal(
    executionResolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(executionResolution),
  );
  const programValidation = executionResolution.programValidation;
  const resolvedStart = executionResolution.resolvedProgramStart;
  assert.ok(resolvedStart);
  assert.equal(
    resolvedStart.kind,
    "resolved_program_start",
    JSON.stringify(resolvedStart),
  );
  assert.equal(
    executionResolution.selectedCatalogEntry.handle,
    gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.deepEqual(executionResolution.programInstall, admittedInstall);
  const start = resolvedStart.start;
  assert.equal(start.startRef, gtl.HELLO_WORLD_IDS.startRef);
  const input = gtl.constructHelloWorldInput("World");
  const rawInput = requireRawAdmission(
    validator,
    input,
    "invocation_input",
    gtl.HELLO_WORLD_IDS.inputContractRef,
  );
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    program,
    [],
  );
  const actorRef = "actor://abiogenesis/t286/trusted-developer";
  const capabilityGrant = product.constructCapabilityGrant(policy, actorRef);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    canonicalLookup.entry,
    policy,
    [capabilityGrant],
  );
  assert.equal(authority.kind, "invocation_authority");

  const requestValue = (invocationRef, target) => ({
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.run.invoke",
    variant: "start",
    invocationRef,
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: `${invocationRef}/correlation`,
    payload: {
      programRef: program.programRef,
      scope: "program",
      target,
      until: "converged",
      rootMode: "direct",
    },
  });
  const admitCandidate = (rawRequest) => {
    const invocation = product.constructStartInvocation(
      workspaceBinding,
      catalogView,
      program,
      canonicalLookup.entry,
      rawRequest,
      rawInput,
      policy,
      [capabilityGrant],
      authority,
    );
    assert.equal(invocation.kind, "public_invocation_candidate");
    return {
      invocation,
      input: {
        artifactTruth,
        invocation,
        rawRequest,
        rawInput,
        programPublication: executionResolution.programPublication,
        executionResolution: executionResolution.resolution,
        program,
        graphFunction,
        programValidation,
        workspaceBinding,
        catalogView,
        policy,
        capabilityGrants: [capabilityGrant],
        authority,
      },
    };
  };

  const wrongRequest = requireRawAdmission(
    validator,
    requestValue(
      "invocation://t286/r5/start-wrong",
      "asset:gtl://abiogenesis/conformance/absent@5",
    ),
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const wrong = admitCandidate(wrongRequest);
  const eventCountBefore = store.readAll().length;
  const wrongStartRefusal = abg.admitInvocation(
    store,
    wrong.input,
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      wrong.invocation.publicRequestInvocationRef,
      [],
      "start",
    ),
  );
  assert.equal(wrongStartRefusal.code, "selection_mismatch");
  assert.equal(store.readAll().length, eventCountBefore);

  const exactRequest = requireRawAdmission(
    validator,
    requestValue("invocation://t286/r5/start-exact", "next"),
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const exact = admitCandidate(exactRequest);
  const admissionReceipt = abg.admitInvocation(
    store,
    exact.input,
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      exact.invocation.publicRequestInvocationRef,
      [workspaceBinding.admissionEventRef],
      "start",
    ),
  );
  assert.equal(
    admissionReceipt.kind,
    "invocation_admission_receipt",
    JSON.stringify(admissionReceipt),
  );
  const admission = admissionReceipt.admission;
  assert.equal(admission.publicStart.startRef, start.startRef);
  assert.equal(admission.publicStart.graphFunctionRef, start.graphFunctionRef);
  assert.equal(admission.selectedDefinitionRef, start.graphFunctionRef);
  assert.equal(admission.catalogHandle, gtl.HELLO_WORLD_IDS.graphFunctionRef);
});
