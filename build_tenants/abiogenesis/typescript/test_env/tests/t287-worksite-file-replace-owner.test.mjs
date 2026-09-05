import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  link,
  symlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL, fileURLToPath } from "node:url";
import test from "node:test";

import { acquireNewEmptyAppendSinkFixture } from
  "../support/new-empty-append-sink.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function coordinate(product, label) {
  return product.sha256Canonical({ label });
}

function capabilityGrantFor(product, workspaceBinding, actorRef) {
  const operationId = "abg.operation.run.invoke";
  const definitionKey = { operationId, memberKey: "invoke" };
  const operationContract = {
    contractCatalog: {
      productId: "product://abiogenesis/t287-worksite-owner-test",
      productContentDigest: coordinate(product, "product-content"),
      catalogId: "catalog://abiogenesis/t287-worksite-owner-test",
      catalogVersion: "5.0.0",
      catalogDigest: coordinate(product, "contract-catalog"),
    },
    flatRow: {
      contractId: "contract://abiogenesis/t287-worksite-owner-test/request",
      contractVersion: "5.0.0",
      contractDigest: coordinate(product, "operation-contract"),
    },
    nestedSelector: {
      selectorKind: "flat_contract",
      definitionKey: null,
      slot: null,
      definitionRef: null,
    },
  };
  const body = {
    definitionKey,
    definitionRef: "definition://abiogenesis/t287-worksite-owner-test/invoke",
    definitionDigest: coordinate(product, "definition"),
    capabilityDefinition: {
      graphId: "capability-graph://abiogenesis/t287-worksite-owner-test",
      graphVersion: "5.0.0",
      graphDigest: coordinate(product, "capability-graph"),
      capabilityId: "capability://abiogenesis/run.invoke",
      capabilityDefinitionRef:
        "capability-definition://abiogenesis/t287-worksite-owner-test",
      capabilityDefinitionDigest: coordinate(product, "capability-definition"),
    },
    operationContract,
    operationId,
    capabilityRef: "capability://abiogenesis/run.invoke",
    actorRef,
    approvalRef: workspaceBinding.authorityBasisId,
    approvalDigest: workspaceBinding.authorityBasisDigest,
    policyRef: "policy://abiogenesis/t287-worksite-owner-test",
    policyDigest: coordinate(product, "policy"),
    scopeRef: workspaceBinding.bindingId,
    scopeDigest: workspaceBinding.bindingDigest,
    authorityBasisRef: workspaceBinding.authorityBasisId,
    authorityBasisDigest: workspaceBinding.authorityBasisDigest,
  };
  const grantDigest = product.sha256Canonical(body);
  return {
    kind: "capability_grant",
    schemaVersion: "5.0.0",
    grantRef: `capability-grant://abiogenesis/${grantDigest.slice("sha256:".length)}`,
    grantDigest,
    ...body,
  };
}

async function ownerEnvironment(product) {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-t287-worksite-owner-"));
  const productRoot = join(scratch, "product");
  await mkdir(productRoot);
  const actorRef = "actor://abiogenesis/t287/worksite-owner";
  const bindingBody = {
    workspaceId: "workspace://abiogenesis/t287/worksite-owner",
    authorityBasisId: "workspace-authority://abiogenesis/t287/worksite-owner",
    authorityBasisDigest: coordinate(product, "workspace-authority"),
    authorizedActorRef: actorRef,
    productSetId: "product-set://abiogenesis/t287/worksite-owner",
    productSetDigest: coordinate(product, "product-set"),
    lockId: "lock://abiogenesis/t287/worksite-owner",
    lockDigest: coordinate(product, "lock"),
    roots: {
      toolchainRoot: join(scratch, "toolchain"),
      productRoot,
      eventLogRoot: join(scratch, "events"),
      runtimeStateRoot: join(scratch, "runtime"),
      projectionRoot: join(scratch, "projections"),
      archiveRoot: join(scratch, "archive"),
    },
  };
  const bindingDigest = product.sha256Canonical(bindingBody);
  const workspaceBinding = {
    kind: "workspace_binding",
    schemaVersion: "5.0.0",
    bindingId: `workspace-binding://abiogenesis/${bindingDigest.slice("sha256:".length)}`,
    bindingDigest,
    ...bindingBody,
    admissionEventRef: "event://abiogenesis/t287/worksite-owner/binding",
  };
  const graphFunctionRef = "graph-function://abiogenesis/t287/worksite-owner";
  const implementationRowBody = {
    requirementKey: "requirement://abiogenesis/t287/worksite-owner",
    requirementKeyDigest: coordinate(product, "requirement-key"),
    catalogBasisDigest: coordinate(product, "catalog-basis"),
    catalogViewDigest: coordinate(product, "catalog-view"),
    publicationDigest: coordinate(product, "publication"),
    programValidationRef: "program-validation://abiogenesis/t287/worksite-owner",
    graphFunctionRef,
    graphFunctionDigest: coordinate(product, "graph-function"),
    graphFunctionOwnerProductId: "product://abiogenesis/t287-worksite-owner",
    graphFunctionPublicationDigest: coordinate(product, "graph-publication"),
    nodeRef: "node://abiogenesis/t287/worksite-owner",
    programLocusRef: "program-locus://abiogenesis/t287/worksite-owner",
    implementationBindingRef:
      "implementation-binding://abiogenesis/t287/worksite-owner",
    implementationRef: "implementation://abiogenesis/t287/worksite-owner",
    packageName: "@abiogenesis/t287-worksite-owner",
    packageVersion: "5.0.0",
    modulePath: "./worksite-owner.js",
    namedSymbol: "replaceWorksiteFile",
    implementationOwnerProductId: "product://abiogenesis/t287-worksite-owner",
    computeRegime: "F_D",
    inputContractRef: "contract://abiogenesis/t287-worksite-owner/input",
    outputContractRef: "contract://abiogenesis/t287-worksite-owner/output",
    failureContractRef: "contract://abiogenesis/t287-worksite-owner/failure",
    refusalContractRef: "contract://abiogenesis/t287-worksite-owner/refusal",
    implementationBindingDigest: coordinate(product, "implementation-binding"),
    implementationDescriptorDigest: coordinate(product, "implementation-descriptor"),
    implementationPublicationDigest: coordinate(product, "implementation-publication"),
  };
  const leafResolutionCandidateDigest = product.sha256Canonical(
    implementationRowBody,
  );
  const implementationRow = {
    kind: "admitted_implementation_resolution_row",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    leafResolutionCandidateRef:
      `leaf-resolution-candidate://abiogenesis/${leafResolutionCandidateDigest.slice("sha256:".length)}`,
    leafResolutionCandidateDigest,
    ...implementationRowBody,
  };
  const implementationSetBody = {
    invocationAdmissionRef: "invocation-admission://abiogenesis/t287/worksite-owner",
    invocationRef: "invocation://abiogenesis/t287/worksite-owner",
    resolutionSetCandidateRef: "resolution-set://abiogenesis/t287/worksite-owner",
    resolutionSetCandidateDigest: coordinate(product, "resolution-set"),
    resolutionSetValidationRef:
      "resolution-validation://abiogenesis/t287/worksite-owner",
    resolutionSetValidationDigest: coordinate(product, "resolution-validation"),
    catalogViewId: "catalog-view://abiogenesis/t287/worksite-owner",
    catalogViewDigest: coordinate(product, "catalog-view"),
    publicationDigest: coordinate(product, "publication"),
    programValidationRef: "program-validation://abiogenesis/t287/worksite-owner",
    executableLeafKeys: [implementationRow.requirementKey],
    rows: [implementationRow],
  };
  const implementationSetDigest = product.sha256Canonical(implementationSetBody);
  const implementationSet = {
    kind: "admitted_implementation_set",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    implementationSetRef:
      `implementation-set://abiogenesis/${implementationSetDigest.slice("sha256:".length)}`,
    implementationSetDigest,
    ...implementationSetBody,
    admissionEventRef: "event://abiogenesis/t287/worksite-owner/implementation-set",
  };
  const basisBody = {
    basisClass: "root",
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    actorRef,
    programRef: "program://abiogenesis/t287/worksite-owner",
    programDigest: coordinate(product, "program"),
    graphFunctionRef,
    graphFunctionDigest: implementationRow.graphFunctionDigest,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationSetDigest: implementationSet.implementationSetDigest,
    interactionSetRef: "interaction-set://abiogenesis/t287/worksite-owner",
    refusalValueKind: "worksite_effect_refusal",
    evidenceContractRef: "contract://abiogenesis/t287-worksite-owner/evidence",
    judgmentContractRef: "contract://abiogenesis/t287-worksite-owner/judgment",
    rejectionContractRef: "contract://abiogenesis/t287-worksite-owner/rejection",
    transitionContractRef: "contract://abiogenesis/t287-worksite-owner/transition",
    closureContractRef: "contract://abiogenesis/t287-worksite-owner/closure",
    closureContractDigest: coordinate(product, "closure"),
    terminalPredicateRef: "predicate://abiogenesis/t287-worksite-owner/terminal",
    replayProjectionRef: "projection://abiogenesis/t287-worksite-owner/replay",
  };
  const basisDigest = product.sha256Canonical(basisBody);
  const executionBasis = {
    kind: "execution_basis",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    basisRef: `execution-basis://abiogenesis/${basisDigest.slice("sha256:".length)}`,
    basisDigest,
    ...basisBody,
    admissionEventRef: "event://abiogenesis/t287/worksite-owner/basis",
  };
  return {
    scratch,
    product,
    workspaceBinding,
    executionBasis,
    implementationSet,
    implementationRow,
    capabilityGrant: capabilityGrantFor(product, workspaceBinding, actorRef),
  };
}

function cCallFor(product, environment, suffix) {
  const { executionBasis, implementationRow, implementationSet } = environment;
  const commonIdentity = {
    basisId: executionBasis.basisRef,
    graphCallId: `graph-call://t287/worksite/${suffix}`,
    frameId: `frame://t287/worksite/${suffix}`,
    vectorIndex: 0,
    stageRole: `worksite-file-replace-${suffix}`,
    taskOrdinal: null,
    attempt: 1,
    programLocusRef: implementationRow.programLocusRef,
    retryPath: [],
  };
  const cCallDigest = product.sha256Canonical(commonIdentity);
  return {
    kind: "c_call",
    schemaVersion: "5.0.0",
    cCallRef: `c-call:${cCallDigest}`,
    cCallDigest,
    callClass: "leaf",
    ...commonIdentity,
    runId: `run://t287/worksite/${suffix}`,
    graphFunctionRef: executionBasis.graphFunctionRef,
    edgeRef: `edge://t287/worksite/${suffix}`,
    batchRef: null,
    regime: implementationRow.computeRegime,
    armId: `arm://t287/worksite/${suffix}`,
    compositionRef: null,
    implementationSetRef: implementationSet.implementationSetRef,
    implementationRequirementKey: implementationRow.requirementKey,
    implementationBindingRef: implementationRow.implementationBindingRef,
    implementationRef: implementationRow.implementationRef,
    interactionSetRef: executionBasis.interactionSetRef,
    interactionRequirementKey: null,
    interactionKind: null,
    actorCapabilityRef: null,
    responseContractRef: null,
    continuationContractRef: null,
    childGraphFunctionRef: null,
    inputContractRef: implementationRow.inputContractRef,
    outputContractRef: implementationRow.outputContractRef,
    failureContractRef: implementationRow.failureContractRef,
    refusalContractRef: implementationRow.refusalContractRef,
    refusalValueKind: executionBasis.refusalValueKind,
    evidenceContractRef: executionBasis.evidenceContractRef,
    judgmentContractRef: executionBasis.judgmentContractRef,
    rejectionContractRef: executionBasis.rejectionContractRef,
    transitionContractRef: executionBasis.transitionContractRef,
    closureContractRef: executionBasis.closureContractRef,
    closureContractDigest: executionBasis.closureContractDigest,
    judgmentPredicateRef: executionBasis.terminalPredicateRef,
    terminalPredicateRef: executionBasis.terminalPredicateRef,
    replayProjectionRef: executionBasis.replayProjectionRef,
    terminalKind: "completed",
    openedEventRef: `event://t287/worksite/${suffix}/opened`,
    fibreSelectedEventRef: `event://t287/worksite/${suffix}/fibre-selected`,
  };
}

function requestFor(product, environment, subject, territory, observation, bytes) {
  const request = product.constructWorksiteFileReplaceRequest({
    workspaceBinding: environment.workspaceBinding,
    capabilityGrant: environment.capabilityGrant,
    subject,
    territory,
    predecessorObservation: observation,
    replacementBytes: Buffer.from(bytes),
  });
  return request;
}

function authorizationFor(product, environment, request, suffix) {
  const cCall = cCallFor(product, environment, suffix);
  const authorization = product.constructWorksiteEffectAuthorization({
    workspaceBinding: environment.workspaceBinding,
    request,
    executionBasis: environment.executionBasis,
    cCall,
    implementationSet: environment.implementationSet,
  });
  assert.equal(
    authorization.kind,
    "worksite_effect_authorization",
    JSON.stringify(authorization),
  );
  return { authorization, cCall };
}

function subjectFor(product, environment, relativePath) {
  return product.constructWorksiteSubject({
    workspaceBinding: environment.workspaceBinding,
    subjectUri: pathToFileURL(join(
      environment.workspaceBinding.roots.productRoot,
      ...relativePath.split("/"),
    )).href,
    relativePath,
  });
}

function territoryFor(product, environment, relativeRoot) {
  return product.constructWorksiteTerritory({
    workspaceBinding: environment.workspaceBinding,
    territoryUri: pathToFileURL(join(
      environment.workspaceBinding.roots.productRoot,
      ...relativeRoot.split("/"),
    )).href,
    relativeRoot,
  });
}

async function resolvesToSamePhysicalPath(canonicalPath, alternatePath) {
  try {
    return await realpath(canonicalPath) === await realpath(alternatePath);
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function execute(product, environment, request, suffix) {
  const { authorization, cCall } = authorizationFor(
    product,
    environment,
    request,
    suffix,
  );
  const input = {
    workspaceBinding: environment.workspaceBinding,
    request,
    executionBasis: environment.executionBasis,
    cCall,
    implementationSet: environment.implementationSet,
    authorization,
  };
  assert.equal(product.isWorksiteFileReplaceInput(input), true);
  return {
    authorization,
    cCall,
    result: await product.replaceWorksiteFile(input),
  };
}

test("T-287 C0 Product owner atomically replaces one W-bound worksite file and fails closed", async (context) => {
  const loadedProduct = await import(
    `${pathToFileURL(join(root, "build/code/src/product/index.js")).href}?t287-c0=${Date.now()}`
  );
  const implementation = await import(
    `${pathToFileURL(join(root, "build/code/src/implementation/index.js")).href}?t287-c0=${Date.now()}`,
  );
  const abg = await import(
    `${pathToFileURL(join(root, "build/code/src/abg/index.js")).href}?t287-c0=${Date.now()}`,
  );
  const residuePrefix = await acquireNewEmptyAppendSinkFixture(
    context,
    abg.createNewEmptyAppendSink,
    "abi5-t287-c0-owner-residue-",
  );
  const environment = await ownerEnvironment(loadedProduct);
  context.after(async () => rm(environment.scratch, { force: true, recursive: true }));
  const { product, workspaceBinding, executionBasis } = environment;
  assert.equal(product.isWorksiteFileReplaceInput(null), false);
  const bindingBefore = product.canonicalJson(workspaceBinding);
  const basisBefore = product.canonicalJson(executionBasis);
  const productRoot = workspaceBinding.roots.productRoot;

  const relativeRoot = "t287-c0-worksite";
  await mkdir(join(productRoot, relativeRoot), { recursive: true });
  const territory = territoryFor(product, environment, relativeRoot);
  assert.equal(territory.kind, "worksite_territory", JSON.stringify(territory));

  const relativePath = `${relativeRoot}/message.txt`;
  const subject = subjectFor(product, environment, relativePath);
  assert.equal(subject.kind, "worksite_subject", JSON.stringify(subject));
  const absent = await product.observeWorksiteSubject(workspaceBinding, subject);
  assert.equal(absent.kind, "worksite_observation", JSON.stringify(absent));
  assert.equal(absent.state, "absent");

  const createRequest = requestFor(
    product,
    environment,
    subject,
    territory,
    absent,
    "hello\n",
  );
  assert.equal(product.isWorksiteFileReplaceRequest(createRequest), true);
  const wrongOperationRequest = structuredClone(createRequest);
  wrongOperationRequest.capabilityGrant.operationId = "abg.operation.project.read";
  wrongOperationRequest.capabilityGrant.definitionKey.operationId =
    "abg.operation.project.read";
  {
    const { kind: _kind, schemaVersion: _schemaVersion, grantRef: _grantRef, grantDigest: _grantDigest, ...grantBody } =
      wrongOperationRequest.capabilityGrant;
    wrongOperationRequest.capabilityGrant.grantDigest = product.sha256Canonical(grantBody);
    wrongOperationRequest.capabilityGrant.grantRef =
      `capability-grant://abiogenesis/${wrongOperationRequest.capabilityGrant.grantDigest.slice("sha256:".length)}`;
  }
  assert.equal(product.isWorksiteFileReplaceRequest(wrongOperationRequest), false);
  const selfReferentialRequest = structuredClone(createRequest);
  selfReferentialRequest.executionBasisRef = executionBasis.executionBasisRef;
  assert.equal(
    product.isWorksiteFileReplaceRequest(selfReferentialRequest),
    false,
    "the pre-basis request is closed and cannot carry an ExecutionBasis coordinate",
  );
  const created = await execute(product, environment, createRequest, "create");
  assert.equal(created.result.kind, "worksite_file_replace_result", JSON.stringify(created.result));
  assert.equal(created.result.disposition, "committed");
  assert.equal(created.result.successorObservation.state, "file");
  assert.equal(await readFile(join(productRoot, relativePath), "utf8"), "hello\n");
  assert.equal(product.isWorksiteFileReplaceReceipt(created.result.receipt), true);
  const unadmitted = implementation.unadmittedPhysicalCommit(created.cCall.cCallRef, {
    kind: "worksite_file_replace_output",
    schemaVersion: "5.0.0",
    authorization: created.authorization,
    receipt: created.result.receipt,
    successorObservation: created.result.successorObservation,
  }, residuePrefix.prefix);
  assert.deepEqual(unadmitted, {
    kind: "unadmitted_physical_commit",
    schemaVersion: "5.0.0",
    disposition: "unadmitted_physical_commit",
    cCallRef: created.cCall.cCallRef,
    receipt: created.result.receipt,
    receiptRef: created.result.receipt.receiptRef,
    receiptDigest: created.result.receipt.receiptDigest,
    successorObservation: created.result.successorObservation,
    successorObservationRef: created.result.successorObservation.observationRef,
    successorObservationDigest: created.result.successorObservation.observationDigest,
    refusedExpectedPrefix: residuePrefix.prefix,
    diagnosticRef: "diagnostic://abiogenesis/worksite/unadmitted-physical-commit@5",
  });
  const {
    kind: _receiptKind,
    schemaVersion: _receiptVersion,
    receiptRef,
    receiptDigest,
    ...receiptBody
  } = created.result.receipt;
  assert.equal(product.sha256Canonical(receiptBody), receiptDigest);
  assert.equal(
    receiptRef,
    `worksite-file-replace-receipt://abiogenesis/${receiptDigest.slice("sha256:".length)}`,
  );

  const replaceRequest = requestFor(
    product,
    environment,
    subject,
    territory,
    created.result.successorObservation,
    "goodbye\n",
  );
  const replaced = await execute(product, environment, replaceRequest, "replace");
  assert.equal(replaced.result.kind, "worksite_file_replace_result", JSON.stringify(replaced.result));
  assert.equal(await readFile(join(productRoot, relativePath), "utf8"), "goodbye\n");
  assert.notEqual(
    replaced.result.successorObservation.observationRef,
    created.result.successorObservation.observationRef,
  );
  assert.equal(product.canonicalJson(workspaceBinding), bindingBefore);
  assert.equal(product.canonicalJson(executionBasis), basisBefore);

  const staleRequest = requestFor(
    product,
    environment,
    subject,
    territory,
    replaced.result.successorObservation,
    "must-not-write\n",
  );
  const staleAuthorization = authorizationFor(
    product,
    environment,
    staleRequest,
    "stale",
  );
  await writeFile(join(productRoot, relativePath), "external-change\n", "utf8");
  const stale = await product.replaceWorksiteFile({
    workspaceBinding,
    request: staleRequest,
    executionBasis,
    cCall: staleAuthorization.cCall,
    implementationSet: environment.implementationSet,
    authorization: staleAuthorization.authorization,
  });
  assert.equal(stale.kind, "worksite_effect_refusal");
  assert.equal(stale.code, "stale_observation");
  assert.equal(await readFile(join(productRoot, relativePath), "utf8"), "external-change\n");

  for (const invalidPath of ["../escape.txt", "/absolute.txt", "nul\0.txt"]) {
    const invalid = subjectFor(product, environment, invalidPath);
    assert.equal(invalid.kind, "worksite_effect_refusal", invalidPath);
    assert.equal(invalid.code, "invalid_relative_path", invalidPath);
  }

  await mkdir(join(productRoot, relativeRoot, "allowed"), { recursive: true });
  const narrowTerritory = territoryFor(
    product,
    environment,
    `${relativeRoot}/allowed`,
  );
  const current = await product.observeWorksiteSubject(workspaceBinding, subject);
  const outsideRequest = requestFor(
    product,
    environment,
    subject,
    narrowTerritory,
    current,
    "outside\n",
  );
  assert.equal(outsideRequest.kind, "worksite_effect_refusal");
  assert.equal(outsideRequest.code, "subject_outside_territory");

  const symlinkPath = `${relativeRoot}/linked.txt`;
  await symlink("message.txt", join(productRoot, symlinkPath));
  const linkedSubject = subjectFor(product, environment, symlinkPath);
  const linked = await product.observeWorksiteSubject(workspaceBinding, linkedSubject);
  assert.equal(linked.kind, "worksite_effect_refusal");
  assert.equal(linked.code, "symlink_forbidden");

  const directoryPath = `${relativeRoot}/directory-target`;
  await mkdir(join(productRoot, directoryPath));
  const directorySubject = subjectFor(product, environment, directoryPath);
  const directoryTarget = await product.observeWorksiteSubject(
    workspaceBinding,
    directorySubject,
  );
  assert.equal(directoryTarget.kind, "worksite_effect_refusal");
  assert.equal(directoryTarget.code, "target_not_file");

  const hardLinkPath = `${relativeRoot}/hard-linked.txt`;
  await link(
    join(productRoot, relativePath),
    join(productRoot, hardLinkPath),
  );
  const hardLinkedSubject = subjectFor(product, environment, hardLinkPath);
  const hardLinked = await product.observeWorksiteSubject(
    workspaceBinding,
    hardLinkedSubject,
  );
  assert.equal(hardLinked.kind, "worksite_effect_refusal");
  assert.equal(hardLinked.code, "aliased_subject");

  const canonicalCaseParent = `${relativeRoot}/CanonicalParent`;
  const canonicalCasePath = `${canonicalCaseParent}/CanonicalLeaf.txt`;
  await mkdir(join(productRoot, canonicalCaseParent));
  await writeFile(join(productRoot, canonicalCasePath), "canonical-case\n", "utf8");
  const canonicalCaseSubject = subjectFor(
    product,
    environment,
    canonicalCasePath,
  );
  const canonicalCaseObservation = await product.observeWorksiteSubject(
    workspaceBinding,
    canonicalCaseSubject,
  );
  assert.equal(
    canonicalCaseObservation.kind,
    "worksite_observation",
    JSON.stringify(canonicalCaseObservation),
  );
  assert.equal(canonicalCaseObservation.state, "file");
  for (const [label, alternateCasePath] of [
    [
      "parent-spelling",
      `${relativeRoot}/canonicalparent/CanonicalLeaf.txt`,
    ],
    [
      "leaf-spelling",
      `${canonicalCaseParent}/canonicalleaf.txt`,
    ],
  ]) {
    const alternateCaseSubject = subjectFor(
      product,
      environment,
      alternateCasePath,
    );
    assert.equal(
      alternateCaseSubject.kind,
      "worksite_subject",
      JSON.stringify(alternateCaseSubject),
    );
    const samePhysicalPath = await resolvesToSamePhysicalPath(
      join(productRoot, canonicalCasePath),
      join(productRoot, alternateCasePath),
    );
    const alternateCaseObservation = await product.observeWorksiteSubject(
      workspaceBinding,
      alternateCaseSubject,
    );
    if (!samePhysicalPath) {
      assert.equal(
        alternateCaseObservation.kind,
        "worksite_observation",
        `${label}: a case-sensitive filesystem preserves a distinct absent target`,
      );
      assert.equal(alternateCaseObservation.state, "absent", label);
      continue;
    }
    assert.equal(
      alternateCaseObservation.kind,
      "worksite_effect_refusal",
      `${label}: alternate spelling must not observe the canonical physical leaf`,
    );
    assert.equal(alternateCaseObservation.code, "aliased_subject", label);
    const alternateCaseRequest = requestFor(
      product,
      environment,
      alternateCaseSubject,
      territory,
      alternateCaseObservation,
      "must-not-authorize\n",
    );
    assert.equal(alternateCaseRequest.kind, "worksite_effect_refusal", label);
    assert.equal(alternateCaseRequest.code, "invalid_coordinate", label);
    const alternateCaseAuthorization = product.constructWorksiteEffectAuthorization({
      workspaceBinding,
      request: alternateCaseRequest,
      executionBasis,
      cCall: cCallFor(product, environment, `alias-${label}`),
      implementationSet: environment.implementationSet,
    });
    assert.equal(
      alternateCaseAuthorization.kind,
      "worksite_effect_refusal",
      label,
    );
    assert.equal(alternateCaseAuthorization.code, "invalid_coordinate", label);
    const fabricatedAliasObservationBody = {
      workspaceBindingIdentity:
        alternateCaseSubject.workspaceBindingIdentity,
      subjectRef: alternateCaseSubject.subjectRef,
      subjectDigest: alternateCaseSubject.subjectDigest,
      state: "file",
      fileIdentity: canonicalCaseObservation.fileIdentity,
      fileDigest: canonicalCaseObservation.fileDigest,
      byteLength: canonicalCaseObservation.byteLength,
    };
    const fabricatedAliasObservationDigest = product.sha256Canonical(
      fabricatedAliasObservationBody,
    );
    const fabricatedAliasObservation = {
      kind: "worksite_observation",
      schemaVersion: "5.0.0",
      observationRef:
        `worksite-observation://abiogenesis/${fabricatedAliasObservationDigest.slice("sha256:".length)}`,
      observationDigest: fabricatedAliasObservationDigest,
      ...fabricatedAliasObservationBody,
    };
    assert.equal(
      product.isWorksiteObservation(fabricatedAliasObservation),
      true,
      label,
    );
    const fabricatedAliasRequest = requestFor(
      product,
      environment,
      alternateCaseSubject,
      territory,
      fabricatedAliasObservation,
      "must-not-write-through-alias\n",
    );
    assert.equal(
      fabricatedAliasRequest.kind,
      "worksite_file_replace_request",
      label,
    );
    const ownerRefusal = await execute(
      product,
      environment,
      fabricatedAliasRequest,
      `alias-owner-${label}`,
    );
    assert.equal(ownerRefusal.result.kind, "worksite_effect_refusal", label);
    assert.equal(ownerRefusal.result.code, "aliased_subject", label);
    assert.equal(
      await readFile(join(productRoot, canonicalCasePath), "utf8"),
      "canonical-case\n",
      label,
    );
  }

  const crossedRequest = structuredClone(createRequest);
  crossedRequest.subject.subjectDigest = product.sha256Canonical({ crossed: true });
  assert.equal(product.isWorksiteFileReplaceRequest(crossedRequest), false);
  const crossedBindingRequest = structuredClone(createRequest);
  crossedBindingRequest.workspaceBindingDigest = product.sha256Canonical({ crossed: "binding" });
  assert.equal(product.isWorksiteFileReplaceRequest(crossedBindingRequest), false);

  const authorizedInput = {
    workspaceBinding,
    request: createRequest,
    executionBasis,
    cCall: created.cCall,
    implementationSet: environment.implementationSet,
    authorization: created.authorization,
  };
  for (const [field, value] of [
    ["actorRef", "actor://abiogenesis/crossed"],
    ["workspaceBindingIdentity", "workspace-binding://abiogenesis/crossed"],
    ["executionBasisRef", "execution-basis://abiogenesis/crossed"],
    ["cCallRef", "c-call:sha256:crossed"],
    ["subjectRef", "worksite-subject://abiogenesis/crossed"],
    ["territoryRef", "worksite-territory://abiogenesis/crossed"],
    ["implementationSetRef", "implementation-set://abiogenesis/crossed"],
    ["implementationSetDigest", product.sha256Canonical({ crossed: "implementation-set" })],
    ["leafResolutionCandidateRef", "leaf-resolution-candidate://abiogenesis/crossed"],
    ["leafResolutionCandidateDigest", product.sha256Canonical({ crossed: "leaf-candidate" })],
    ["implementationBindingDigest", product.sha256Canonical({ crossed: "binding" })],
    ["implementationRef", "implementation://abiogenesis/crossed"],
  ]) {
    const crossed = structuredClone(created.authorization);
    crossed[field] = value;
    const {
      kind: _kind,
      schemaVersion: _schemaVersion,
      authorizationRef: _authorizationRef,
      authorizationDigest: _authorizationDigest,
      ...body
    } = crossed;
    crossed.authorizationDigest = product.sha256Canonical(body);
    crossed.authorizationRef =
      `worksite-effect-authorization://abiogenesis/${crossed.authorizationDigest.slice("sha256:".length)}`;
    assert.equal(product.isWorksiteEffectAuthorization(crossed), true, field);
    assert.equal(
      product.isWorksiteFileReplaceInput({
        ...authorizedInput,
        authorization: crossed,
      }),
      false,
      field,
    );
  }
  for (const [field, value] of [
    ["effectUri", "effect://abiogenesis/worksite/crossed"],
    ["handlerRef", "handler://abiogenesis/worksite/crossed"],
    ["handlerDigest", product.sha256Canonical({ crossed: "handler" })],
  ]) {
    const crossed = structuredClone(created.authorization);
    crossed[field] = value;
    const {
      kind: _kind,
      schemaVersion: _schemaVersion,
      authorizationRef: _authorizationRef,
      authorizationDigest: _authorizationDigest,
      ...body
    } = crossed;
    crossed.authorizationDigest = product.sha256Canonical(body);
    crossed.authorizationRef =
      `worksite-effect-authorization://abiogenesis/${crossed.authorizationDigest.slice("sha256:".length)}`;
    assert.equal(product.isWorksiteEffectAuthorization(crossed), false, field);
  }

  const failureRoot = `${relativeRoot}/failure`;
  await mkdir(join(productRoot, failureRoot));
  const longName = "x".repeat(240);
  const failurePath = `${failureRoot}/${longName}`;
  await writeFile(join(productRoot, failurePath), "preserve-me\n", "utf8");
  const failureSubject = subjectFor(product, environment, failurePath);
  const failureTerritory = territoryFor(product, environment, failureRoot);
  const failureO0 = await product.observeWorksiteSubject(
    workspaceBinding,
    failureSubject,
  );
  const failureRequest = requestFor(
    product,
    environment,
    failureSubject,
    failureTerritory,
    failureO0,
    "must-not-commit\n",
  );
  const failed = await execute(product, environment, failureRequest, "io-failure");
  assert.equal(failed.result.kind, "worksite_effect_refusal");
  assert.equal(failed.result.code, "filesystem_refused");
  assert.equal(
    await readFile(join(productRoot, failurePath), "utf8"),
    "preserve-me\n",
  );
});
