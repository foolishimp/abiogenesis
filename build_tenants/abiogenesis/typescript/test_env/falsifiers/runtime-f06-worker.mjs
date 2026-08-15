#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import * as installedAbg from "@abiogenesis/typescript-tenant/abg";
import * as installedGtl from "@abiogenesis/typescript-tenant/gtl";
import * as installedProduct from "@abiogenesis/typescript-tenant/product";
import * as installedValidator from "@abiogenesis/typescript-tenant/validator";

const EVENT_TIME = "2026-07-31T00:00:00.000Z";

async function readInput() {
  let bytes = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) bytes += chunk;
  return JSON.parse(bytes);
}

function publicOperationBasis(
  product,
  operationId,
  scopeRef,
  scopeDigest,
  invocationRef,
  causationEventRefs = [],
) {
  const invocationPayloadDigest = product.sha256Canonical({});
  return {
    operationId,
    definitionKey: operationId,
    definitionDigest: product.sha256Canonical({
      operationId,
      schemaVersion: "5.0.0",
    }),
    authorityScopeRef: scopeRef,
    authorityScopeDigest: scopeDigest,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      invocationRef,
      operationId,
      payloadDigest: invocationPayloadDigest,
    }),
    correlationId: `correlation://s06/ax-f06/${invocationRef}`,
    eventTime: EVENT_TIME,
    causationEventRefs,
  };
}

function requireRawAdmission(validator, value, subjectKind, contractRef) {
  const admitted = validator.rawAdmitValue(value, subjectKind, contractRef);
  assert.equal(admitted.kind, "raw_admitted_value", JSON.stringify(admitted));
  return admitted;
}

function rawProgramInput(validator, publicationAdmission, program) {
  const publication = publicationAdmission.value;
  return {
    publication: publicationAdmission,
    program: requireRawAdmission(
      validator,
      program,
      "gtl_program",
      "contract://abiogenesis/gtl/program@5",
    ),
    graphFunctions: publication.graphFunctions
      .filter((value) => program.callableMembership.includes(value.name))
      .map((value) => requireRawAdmission(
        validator,
        value,
        "graph_function",
        "contract://abiogenesis/gtl/graph-function@5",
      )),
    contracts: publication.contracts.map((value) => requireRawAdmission(
      validator,
      value,
      "contract_declaration",
      "contract://abiogenesis/gtl/contract-declaration@5",
    )),
    implementationBindings: publication.implementationBindings.map((value) =>
      requireRawAdmission(
        validator,
        value,
        "implementation_binding",
        "contract://abiogenesis/gtl/implementation-binding@5",
      )),
    closureContracts: publication.closureContracts.map((value) =>
      requireRawAdmission(
        validator,
        value,
        "closure_contract",
        "contract://abiogenesis/gtl/closure-contract@5",
      )),
  };
}

function constructPublication(gtl, install) {
  return gtl.constructConsensusModulePublication({
    productId: install.productId,
    artifactDigest: install.artifactDigest,
    productContentDigest: install.productContentDigest,
    productManifestDigest: install.manifestDigest,
    packageName: install.packageName,
    packageVersion: install.packageVersion,
  });
}

function validatePublicationAndPrograms(validator, publication) {
  const publicationAdmission = requireRawAdmission(
    validator,
    publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const contributionAdmissions = publication.contributions.map((value) =>
    requireRawAdmission(
      validator,
      value,
      "catalog_contribution",
      "contract://abiogenesis/gtl/catalog-contribution@5",
    ));
  const publicationValidation = validator.validatePublication(
    publicationAdmission,
    contributionAdmissions,
  );
  assert.equal(
    publicationValidation.kind,
    "publication_validation",
    JSON.stringify(publicationValidation),
  );
  const programValidations = publication.programs.map((program) =>
    validator.validateProgram(
      rawProgramInput(validator, publicationAdmission, program),
    ));
  assert.equal(
    programValidations.every((value) => value.kind === "program_validation"),
    true,
    JSON.stringify(
      programValidations.filter((value) => value.kind !== "program_validation"),
    ),
  );
  return { publicationAdmission, publicationValidation, programValidations };
}

function requireCaseId(caseId) {
  assert.equal(
    [
      "equal",
      "f13-duplicate",
      "f13-pure",
      "f13-semantic",
      "tampered",
    ].includes(caseId),
    true,
    `unknown installed invocation-fixture case ${String(caseId)}`,
  );
}

async function produce(input) {
  assert.deepEqual(Object.keys(input).sort(), [
    "action",
    "caseId",
    "packageRoot",
    "supportPath",
  ]);
  requireCaseId(input.caseId);
  const support = await import(pathToFileURL(input.supportPath).href);
  const environment = await support.setupInstalledRootCatalog(
    { after() {} },
    input.packageRoot,
  );
  const {
    gtl,
    product,
    validator,
    store,
    verified,
    installCandidate,
    bindingCandidate,
    lock,
    scratch,
  } = environment;
  const publication = constructPublication(gtl, installCandidate);
  validatePublicationAndPrograms(validator, publication);
  const readinessBasis = {
    workspaceBinding: bindingCandidate,
    resolvedLock: lock,
    verifiedProducts: [verified],
    installedProducts: [installCandidate],
    publications: [publication],
  };
  const catalog = product.admitGraphFunctionCatalog(readinessBasis);
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const program = publication.programs.find((candidate) =>
    candidate.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef);
  assert.notEqual(program, undefined);
  const graphFunction = publication.graphFunctions.find((candidate) =>
    candidate.name === program.starts[0]?.graphFunctionRef);
  assert.notEqual(graphFunction, undefined);
  const subjectHandle = gtl.CONSENSUS_IDS.subjectCatalogHandle;
  const allowlist = [graphFunction.name, subjectHandle];
  const view = product.narrowGraphFunctionCatalog(catalog, allowlist);
  assert.equal(view.kind, "graph_function_catalog_view", JSON.stringify(view));
  const subjectMaterialization = gtl.constructConsensusSubjectMaterialization({
    subjectContractRef: "contract://stdo/ticket@2.2.2",
    subjectRef: "ticket://abiogenesis/T-281",
    content: "# T-281\n\nAX-F06 independently reconstructed carrier.\n",
  });
  const subject = gtl.constructConsensusSubject({
    subjectContractRef: "contract://stdo/ticket@2.2.2",
    subjectRef: "ticket://abiogenesis/T-281",
    subjectDigest: subjectMaterialization.contentDigest,
    submittingActorRef: bindingCandidate.authorizedActorRef,
    panelRef: "panel://s06/ax-f06",
    roundPolicyRef: "policy://s06/ax-f06",
    workspaceRef: bindingCandidate.workspaceId,
    ticketRef: "ticket://abiogenesis/T-281",
    ticketDigest: subjectMaterialization.contentDigest,
  });
  const target = { kind: "program", programRef: program.programRef };
  const targetDigest = product.sha256Canonical(target);
  const valueDigest = product.sha256Canonical(subject);
  const applicationInput = {
    applicationKind: "node_type",
    handle: subjectHandle,
    targetRef:
      `catalog-target://abiogenesis/${targetDigest.slice("sha256:".length)}`,
    targetDigest,
    appliedValueRef:
      `catalog-value://abiogenesis/${valueDigest.slice("sha256:".length)}`,
    appliedValueDigest: valueDigest,
  };
  const application = product.applyCatalogDeclaration(view, applicationInput);
  assert.equal(
    application.kind,
    "declaration_application",
    JSON.stringify(application),
  );
  const expected = {
    publicationDigest: product.modulePublicationSemanticDigest(publication),
    catalogBasisDigest: catalog.basisDigest,
    viewDigest: view.viewDigest,
    applicationRef: application.applicationRef,
    applicationDigest: application.applicationDigest,
    programRef: program.programRef,
    graphFunctionRef: graphFunction.name,
  };
  const eventCountAtHandoff = store.readAll().length;
  const prefix = store.projectReopenAuthorityAndClose();
  const handoff = {
    allowlist,
    applicationInput,
    expected,
    prefix,
    readinessBasis,
  };
  return {
    action: "produce",
    caseId: input.caseId,
    pid: process.pid,
    cleanupRoot: scratch,
    handoff,
    audit: {
      exactHandoffKeys:
        Object.keys(handoff).sort().join("\0") === [
          "allowlist",
          "applicationInput",
          "expected",
          "prefix",
          "readinessBasis",
        ].join("\0"),
      handoffExcludesConstructedAuthorityObjects:
        !("catalog" in handoff) &&
        !("view" in handoff) &&
        !("application" in handoff),
      readinessPublicationMatchesInstalledIdentity:
        verified.productId === installCandidate.productId &&
        catalog.publicationDigests.includes(expected.publicationDigest),
      productConstructorsProducedExactInputs:
        catalog.kind === "graph_function_catalog" &&
        view.kind === "graph_function_catalog_view" &&
        application.kind === "declaration_application",
      eventCountAtHandoff,
    },
  };
}

async function consume(input) {
  assert.deepEqual(Object.keys(input).sort(), ["action", "caseId", "handoff"]);
  requireCaseId(input.caseId);
  assert.deepEqual(Object.keys(input.handoff).sort(), [
    "allowlist",
    "applicationInput",
    "expected",
    "prefix",
    "readinessBasis",
  ]);
  const reopened = installedAbg.reopenEventStore(
    input.handoff.prefix.reopenAuthority,
    input.handoff.prefix.prefix,
  );
  assert.equal(
    reopened.kind,
    "reopened_event_store_context",
    JSON.stringify(reopened),
  );
  let closed = false;
  try {
    const store = reopened.store;
    assert.deepEqual(reopened.prefix, input.handoff.prefix.prefix);
    const artifactTruth = installedAbg.projectExactPrefixArtifactTruth(
      reopened.prefix,
    );
    assert.equal(
      artifactTruth.kind,
      "exact_prefix_artifact_truth_projection",
      JSON.stringify(artifactTruth),
    );
    const {
      allowlist,
      applicationInput,
      expected,
      readinessBasis,
    } = input.handoff;
    assert.equal(readinessBasis.installedProducts.length, 1);
    assert.equal(readinessBasis.publications.length, 1);
    const installCandidate = readinessBasis.installedProducts[0];
    const admittedInstall = installedAbg.projectAdmittedProductInstall(
      artifactTruth,
      installCandidate,
    );
    const workspaceBinding = installedAbg.projectAdmittedWorkspaceBinding(
      artifactTruth,
      readinessBasis.workspaceBinding,
    );
    assert.notEqual(admittedInstall, null);
    assert.notEqual(workspaceBinding, null);
    const publication = constructPublication(installedGtl, admittedInstall);
    const publicationCanonicallyEqual =
      installedProduct.canonicalJson(publication) ===
        installedProduct.canonicalJson(readinessBasis.publications[0]);
    assert.equal(publicationCanonicallyEqual, true);
    const reconstructedReadinessBasis = {
      workspaceBinding: readinessBasis.workspaceBinding,
      resolvedLock: readinessBasis.resolvedLock,
      verifiedProducts: readinessBasis.verifiedProducts,
      installedProducts: readinessBasis.installedProducts,
      publications: [publication],
    };
    const catalog = installedProduct.admitGraphFunctionCatalog(
      reconstructedReadinessBasis,
    );
    assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
    const view = installedProduct.narrowGraphFunctionCatalog(catalog, allowlist);
    assert.equal(view.kind, "graph_function_catalog_view", JSON.stringify(view));
    const application = installedProduct.applyCatalogDeclaration(
      view,
      applicationInput,
    );
    assert.equal(
      application.kind,
      "declaration_application",
      JSON.stringify(application),
    );
    const applicationIdentityExact =
      installedProduct.modulePublicationSemanticDigest(publication) ===
        expected.publicationDigest &&
      catalog.basisDigest === expected.catalogBasisDigest &&
      view.viewDigest === expected.viewDigest &&
      application.applicationRef === expected.applicationRef &&
      application.applicationDigest === expected.applicationDigest;
    assert.equal(applicationIdentityExact, true);
    const { programValidations } = validatePublicationAndPrograms(
      installedValidator,
      publication,
    );
    const program = publication.programs.find((candidate) =>
      candidate.programRef === expected.programRef);
    const graphFunction = publication.graphFunctions.find((candidate) =>
      candidate.name === expected.graphFunctionRef);
    assert.notEqual(program, undefined);
    assert.notEqual(graphFunction, undefined);
    const programValidation = programValidations.find((candidate) =>
      candidate.programRef === program.programRef);
    assert.notEqual(programValidation, undefined);
    const inputContractRef = graphFunction.inputs[0];
    const inputContract = publication.contracts.find((candidate) =>
      candidate.contractRef === inputContractRef);
    assert.notEqual(inputContract, undefined);
    const rawInput = requireRawAdmission(
      installedValidator,
      { kind: inputContract.valueKind, schemaVersion: "5.0.0" },
      "invocation_input",
      inputContractRef,
    );
    const runtimeInvocationRef =
      `invocation://s06/ax-f06/${input.caseId}/run-invoke`;
    const rawRequest = requireRawAdmission(
      installedValidator,
      {
        kind: "public_invocation",
        schemaVersion: "5.0.0",
        operationId: "abg.operation.run.invoke",
        variant: "start",
        invocationRef: runtimeInvocationRef,
        eventTime: EVENT_TIME,
        correlationId: `correlation://s06/ax-f06/${input.caseId}/run-invoke`,
        payload: {
          programRef: program.programRef,
          startRef: program.starts[0].startRef,
          scope: "program",
          target: program.starts[0].startRef,
          until: "converged",
          rootMode: "supervised",
        },
      },
      "public_operation_request",
      "contract://abiogenesis/public/run-invoke-request@5",
    );
    const interactionCapabilities = programValidation.interactionLeafRows.map(
      (row) => ({
        requirementKey: row.requirementKey,
        requirementKeyDigest: row.requirementKeyDigest,
        actorCapabilityRef: row.requirement.actorCapabilityRef,
      }),
    );
    const declaredComputeRegimes = new Set([
      ...programValidation.executableLeafRows.map((row) => row.fibre),
      ...programValidation.interactionLeafRows.map((row) => row.fibre),
    ]);
    const allowedComputeRegimes = ["F_D", "F_P", "F_H"].filter((regime) =>
      declaredComputeRegimes.has(regime));
    const policy = installedProduct.constructRootInvocationPolicy(
      workspaceBinding,
      program,
      interactionCapabilities,
      allowedComputeRegimes,
      [application],
    );
    const actorRef = workspaceBinding.authorizedActorRef;
    const interactionCapabilityRefs = [
      ...new Set(
        interactionCapabilities.map((row) => row.actorCapabilityRef),
      ),
    ].sort();
    const capabilityGrants = [
      installedProduct.constructCapabilityGrant(policy, actorRef),
      ...interactionCapabilityRefs.flatMap((capabilityRef) => [
        installedProduct.constructCapabilityGrant(
          policy,
          actorRef,
          "abg.operation.interaction.respond",
          capabilityRef,
        ),
        installedProduct.constructCapabilityGrant(
          policy,
          actorRef,
          "abg.operation.run.continue",
          capabilityRef,
        ),
      ]),
    ];
    const selectedDefinition = installedProduct.lookupGraphFunctionDefinition(
      view,
      graphFunction.name,
      program.programRef,
    );
    assert.equal(
      selectedDefinition.kind,
      "graph_function_definition_lookup_exact",
      JSON.stringify(selectedDefinition),
    );
    const authority = installedProduct.constructInvocationAuthority(
      actorRef,
      workspaceBinding,
      view,
      program.programRef,
      selectedDefinition.entry,
      policy,
      capabilityGrants,
    );
    assert.equal(authority.kind, "invocation_authority", JSON.stringify(authority));
    const invocation = installedProduct.constructStartInvocation(
      workspaceBinding,
      view,
      program,
      selectedDefinition.entry,
      rawRequest,
      rawInput,
      policy,
      capabilityGrants,
      authority,
    );
    assert.equal(
      invocation.kind,
      "public_invocation_candidate",
      JSON.stringify(invocation),
    );
    const carrierIdentity = {
      invocationRef: invocation.invocationRef,
      invocationDigest: invocation.invocationDigest,
      publicRequestAdmissionRef: invocation.publicRequestAdmissionRef,
      publicRequestDigest: invocation.publicRequestDigest,
      rawInputAdmissionRef: invocation.rawInputAdmissionRef,
      rawInputDigest: invocation.rawInputDigest,
    };
    const invocationBasis = publicOperationBasis(
      installedProduct,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.publicRequestInvocationRef,
      [workspaceBinding.admissionEventRef],
    );
    const admitExact = (targetStore, exactArtifactTruth, exactApplication) =>
      installedAbg.admitInvocation(
        targetStore,
        {
          invocation,
          rawRequest,
          rawInput,
          modulePublication: publication,
          program,
          graphFunction,
          programValidation,
          workspaceBinding,
          artifactTruth: exactArtifactTruth,
          catalogView: view,
          catalogApplications: [exactApplication],
          policy,
          capabilityGrants,
          authority,
        },
        invocationBasis,
      );

    if (input.action === "f13_pure_projection") {
      const eventsBefore = store.readAll();
      const bytesBefore = await readFile(
        input.handoff.prefix.reopenAuthority.eventLogPath,
      );
      const prefixBefore = structuredClone(reopened.prefix);
      const firstProjection = installedProduct.narrowGraphFunctionCatalog(
        catalog,
        allowlist,
      );
      const secondProjection = installedProduct.narrowGraphFunctionCatalog(
        catalog,
        allowlist,
      );
      assert.equal(
        firstProjection.kind,
        "graph_function_catalog_view",
        JSON.stringify(firstProjection),
      );
      assert.equal(
        secondProjection.kind,
        "graph_function_catalog_view",
        JSON.stringify(secondProjection),
      );
      const eventsAfter = store.readAll();
      const bytesAfter = await readFile(
        input.handoff.prefix.reopenAuthority.eventLogPath,
      );
      const finalHandoff = store.projectReopenAuthorityAndClose();
      closed = true;
      const projectionDigests = [firstProjection, secondProjection].map(
        (projection) => installedProduct.sha256Canonical(projection),
      );
      return {
        action: input.action,
        caseId: input.caseId,
        pid: process.pid,
        handoff: finalHandoff,
        projection: {
          kind: firstProjection.kind,
          viewDigest: firstProjection.viewDigest,
          canonicalDigest: projectionDigests[0],
        },
        audit: {
          exactInputKeys: true,
          prefixReopened: true,
          admittedInstallProjected: admittedInstall !== null,
          workspaceBindingProjected: workspaceBinding !== null,
          publicationCanonicallyEqual,
          catalogConstructed: catalog.kind === "graph_function_catalog",
          viewConstructed: view.kind === "graph_function_catalog_view",
          applicationConstructed:
            application.kind === "declaration_application",
          applicationIdentityExact,
          projectionOperation: "Product.narrowGraphFunctionCatalog",
          retainedCanonicalEquality:
            projectionDigests[0] === projectionDigests[1],
          eventCountBefore: eventsBefore.length,
          eventCountAfter: eventsAfter.length,
          eventDelta: eventsAfter.length - eventsBefore.length,
          byteLengthBefore: bytesBefore.byteLength,
          byteLengthAfter: bytesAfter.byteLength,
          eventsUnchanged:
            installedProduct.canonicalJson(eventsAfter) ===
              installedProduct.canonicalJson(eventsBefore),
          bytesUnchanged: bytesAfter.equals(bytesBefore),
          prefixUnchanged:
            installedProduct.canonicalJson(finalHandoff.prefix) ===
              installedProduct.canonicalJson(prefixBefore),
          fullHandoffUnchanged:
            installedProduct.canonicalJson(finalHandoff) ===
              installedProduct.canonicalJson(input.handoff.prefix),
        },
      };
    }

    if (input.action === "f13_duplicate_retained") {
      const initialEvents = store.readAll();
      const initialBytes = await readFile(
        input.handoff.prefix.reopenAuthority.eventLogPath,
      );
      const firstResult = admitExact(store, artifactTruth, application);
      const eventsAfterFirst = store.readAll();
      const bytesAfterFirst = await readFile(
        input.handoff.prefix.reopenAuthority.eventLogPath,
      );
      const firstHandoff = store.projectReopenAuthorityAndClose();
      closed = true;
      const retryReopened = installedAbg.reopenEventStore(
        firstHandoff.reopenAuthority,
      );
      assert.equal(
        retryReopened.kind,
        "reopened_event_store_context",
        JSON.stringify(retryReopened),
      );
      assert.deepEqual(retryReopened.prefix, firstHandoff.prefix);
      let retryClosed = false;
      try {
        const retryArtifactTruth = installedAbg.projectExactPrefixArtifactTruth(
          retryReopened.prefix,
        );
        assert.equal(
          retryArtifactTruth.kind,
          "exact_prefix_artifact_truth_projection",
          JSON.stringify(retryArtifactTruth),
        );
        const retryEventsBefore = retryReopened.store.readAll();
        const retryBytesBefore = await readFile(
          firstHandoff.reopenAuthority.eventLogPath,
        );
        const retryResult = admitExact(
          retryReopened.store,
          retryArtifactTruth,
          application,
        );
        const retryEventsAfter = retryReopened.store.readAll();
        const retryBytesAfter = await readFile(
          firstHandoff.reopenAuthority.eventLogPath,
        );
        const finalHandoff =
          retryReopened.store.projectReopenAuthorityAndClose();
        retryClosed = true;
        return {
          action: input.action,
          caseId: input.caseId,
          pid: process.pid,
          handoff: finalHandoff,
          firstHandoff,
          carrierIdentity,
          firstResult: firstResult.kind === "invocation_admission_receipt"
            ? firstResult.admission
            : firstResult,
          retryResult: retryResult.kind === "invocation_admission_receipt"
            ? retryResult.admission
            : retryResult,
          audit: {
            exactInputKeys: true,
            initialPrefixReopened: true,
            admittedInstallProjected: admittedInstall !== null,
            workspaceBindingProjected: workspaceBinding !== null,
            publicationCanonicallyEqual,
            catalogConstructed: catalog.kind === "graph_function_catalog",
            viewConstructed: view.kind === "graph_function_catalog_view",
            applicationConstructed:
              application.kind === "declaration_application",
            applicationIdentityExact,
            successorPrefixReopenedExact:
              installedProduct.canonicalJson(retryReopened.prefix) ===
                installedProduct.canonicalJson(firstHandoff.prefix),
            firstEventCountBefore: initialEvents.length,
            firstEventCountAfter: eventsAfterFirst.length,
            firstEventDelta: eventsAfterFirst.length - initialEvents.length,
            firstByteLengthBefore: initialBytes.byteLength,
            firstByteLengthAfter: bytesAfterFirst.byteLength,
            firstByteDelta:
              bytesAfterFirst.byteLength - initialBytes.byteLength,
            retryEventCountBefore: retryEventsBefore.length,
            retryEventCountAfter: retryEventsAfter.length,
            retryEventDelta:
              retryEventsAfter.length - retryEventsBefore.length,
            retryByteLengthBefore: retryBytesBefore.byteLength,
            retryByteLengthAfter: retryBytesAfter.byteLength,
            retryByteDelta:
              retryBytesAfter.byteLength - retryBytesBefore.byteLength,
            retryEventsUnchanged:
              installedProduct.canonicalJson(retryEventsAfter) ===
                installedProduct.canonicalJson(retryEventsBefore),
            retryBytesUnchanged: retryBytesAfter.equals(retryBytesBefore),
            retryPrefixUnchanged:
              installedProduct.canonicalJson(finalHandoff.prefix) ===
                installedProduct.canonicalJson(firstHandoff.prefix),
            firstAppendedAtoms: eventsAfterFirst.slice(initialEvents.length).map(
              (event) => ({
                kind: event.kind,
                eventId: event.eventId,
                invocationRef: event.payload?.invocationRef ?? null,
                invocationAdmissionRef:
                  event.payload?.invocationAdmissionRef ?? null,
                invocationAdmissionDigest:
                  event.payload?.invocationAdmissionDigest ?? null,
              }),
            ),
            retryAppendedAtoms: retryEventsAfter
              .slice(retryEventsBefore.length)
              .map((event) => ({
                kind: event.kind,
                eventId: event.eventId,
                invocationRef: event.payload?.invocationRef ?? null,
                invocationAdmissionRef:
                  event.payload?.invocationAdmissionRef ?? null,
                invocationAdmissionDigest:
                  event.payload?.invocationAdmissionDigest ?? null,
              })),
          },
        };
      } finally {
        if (!retryClosed) retryReopened.store.closeDurableLog();
      }
    }

    const semanticTamper =
      input.caseId === "tampered" ||
      input.action === "f13_semantic_refusal";
    const suppliedApplication = semanticTamper
      ? {
        ...application,
        targetRef: input.caseId === "tampered"
          ? "catalog-target://abiogenesis/ax-f06-tampered"
          : "catalog-target://abiogenesis/ax-f13-semantic-tamper",
      }
      : application;
    const changedApplicationFields = Object.keys(application).filter((key) =>
      installedProduct.canonicalJson(suppliedApplication[key]) !==
        installedProduct.canonicalJson(application[key]));
    assert.deepEqual(
      changedApplicationFields,
      semanticTamper ? ["targetRef"] : [],
    );
    const retainedOriginalIdentity =
      suppliedApplication.applicationRef === application.applicationRef &&
      suppliedApplication.applicationDigest === application.applicationDigest;
    assert.equal(retainedOriginalIdentity, true);

    const eventsBefore = store.readAll();
    const bytesBefore = await readFile(
      input.handoff.prefix.reopenAuthority.eventLogPath,
    );
    const prefixBefore = structuredClone(reopened.prefix);
    const result = admitExact(store, artifactTruth, suppliedApplication);
    const eventsAfter = store.readAll();
    const bytesAfter = await readFile(
      input.handoff.prefix.reopenAuthority.eventLogPath,
    );
    const finalHandoff = store.projectReopenAuthorityAndClose();
    closed = true;
    const finalEvents = installedAbg.readRuntimeEventsAtDurablePrefix(
      finalHandoff.prefix,
    );
    const finalPrefix = installedAbg.selectValidatedRuntimeEventPrefix(
      finalEvents,
    );
    const appendedEvents = finalEvents.slice(eventsBefore.length);
    const publicAtom = appendedEvents.find((event) =>
      event.kind === "public_operation_admitted");
    const invocationAtom = appendedEvents.find((event) =>
      event.kind === "invocation_admitted");
    const expectedRefs = [application.applicationRef];
    const expectedDigests = [application.applicationDigest];
    const resultAdmission =
      result.kind === "invocation_admission_receipt"
        ? result.admission
        : null;
    const resultAdmitted = resultAdmission?.disposition === "admitted";
    const resultRefDigestExact = resultAdmitted &&
      installedProduct.canonicalJson(resultAdmission.catalogApplicationRefs) ===
        installedProduct.canonicalJson(expectedRefs) &&
      installedProduct.canonicalJson(resultAdmission.catalogApplicationDigests) ===
        installedProduct.canonicalJson(expectedDigests);
    const publicAtomRefDigestExact =
      installedProduct.canonicalJson(
        publicAtom?.payload?.catalogApplicationRefs ?? null,
      ) === installedProduct.canonicalJson(expectedRefs) &&
      installedProduct.canonicalJson(
        publicAtom?.payload?.catalogApplicationDigests ?? null,
      ) === installedProduct.canonicalJson(expectedDigests);
    const invocationAtomRefDigestExact =
      installedProduct.canonicalJson(
        invocationAtom?.payload?.catalogApplicationRefs ?? null,
      ) === installedProduct.canonicalJson(expectedRefs) &&
      installedProduct.canonicalJson(
        invocationAtom?.payload?.catalogApplicationDigests ?? null,
      ) === installedProduct.canonicalJson(expectedDigests);
    const exactInvocationAtoms =
      resultAdmitted &&
      eventsAfter.length - eventsBefore.length === 2 &&
      appendedEvents.length === 2 &&
      appendedEvents[0]?.kind === "public_operation_admitted" &&
      appendedEvents[1]?.kind === "invocation_admitted" &&
      resultRefDigestExact &&
      publicAtomRefDigestExact &&
      invocationAtomRefDigestExact &&
      installedAbg.hasAdmittedInvocationAtPrefix(finalPrefix, resultAdmission);
    const eventsUnchanged =
      installedProduct.canonicalJson(eventsAfter) ===
        installedProduct.canonicalJson(eventsBefore);
    const bytesUnchanged = bytesAfter.equals(bytesBefore);
    const prefixUnchanged =
      installedProduct.canonicalJson(finalHandoff.prefix) ===
        installedProduct.canonicalJson(prefixBefore);
    const typedEventlessRefusal =
      result.kind === "invocation_admission_refusal" &&
      eventsUnchanged &&
      bytesUnchanged &&
      prefixUnchanged;

    const audit = {
      exactInputKeys: true,
      prefixReopened: true,
      admittedInstallProjected: admittedInstall !== null,
      workspaceBindingProjected: workspaceBinding !== null,
      publicationCanonicallyEqual,
      catalogConstructed: catalog.kind === "graph_function_catalog",
      viewConstructed: view.kind === "graph_function_catalog_view",
      applicationConstructed:
        application.kind === "declaration_application",
      applicationIdentityExact,
      changedApplicationFields,
      retainedOriginalIdentity,
      eventCountBefore: eventsBefore.length,
      eventCountAfter: eventsAfter.length,
      eventDelta: eventsAfter.length - eventsBefore.length,
      byteLengthBefore: bytesBefore.byteLength,
      byteLengthAfter: bytesAfter.byteLength,
      eventsUnchanged,
      bytesUnchanged,
      prefixUnchanged,
      fullHandoffUnchanged:
        installedProduct.canonicalJson(finalHandoff) ===
          installedProduct.canonicalJson(input.handoff.prefix),
      typedEventlessRefusal,
      exactInvocationAtoms,
      resultRefDigestExact,
      publicAtomRefDigestExact,
      invocationAtomRefDigestExact,
      admittedAtFinalPrefix:
        resultAdmitted &&
        installedAbg.hasAdmittedInvocationAtPrefix(
          finalPrefix,
          resultAdmission,
        ),
      appendedAtoms: appendedEvents.map((event) => ({
        kind: event.kind,
        eventId: event.eventId,
        ...(input.action === "consume"
          ? {}
          : {
            invocationRef: event.payload?.invocationRef ?? null,
            invocationAdmissionRef:
              event.payload?.invocationAdmissionRef ?? null,
            invocationAdmissionDigest:
              event.payload?.invocationAdmissionDigest ?? null,
          }),
        catalogApplicationRefs:
          event.payload?.catalogApplicationRefs ?? null,
        catalogApplicationDigests:
          event.payload?.catalogApplicationDigests ?? null,
      })),
    };
    if (input.action !== "consume") {
      return {
        action: input.action,
        caseId: input.caseId,
        pid: process.pid,
        handoff: finalHandoff,
        carrierIdentity,
        result: resultAdmission ?? result,
        audit,
      };
    }
    return {
      action: input.action,
      caseId: input.caseId,
      pid: process.pid,
      result: resultAdmission ?? result,
      audit,
    };
  } finally {
    if (!closed) reopened.store.closeDurableLog();
  }
}

const input = await readInput();
const output = input.action === "produce"
  ? await produce(input)
  : [
      "consume",
      "f13_duplicate_fresh",
      "f13_duplicate_retained",
      "f13_pure_projection",
      "f13_semantic_corrected",
      "f13_semantic_refusal",
    ].includes(input.action)
    ? await consume(input)
    : (() => {
        throw new TypeError(
          `unknown installed invocation-fixture action ${String(input.action)}`,
        );
      })();
process.stdout.write(`${JSON.stringify(output)}\n`);
