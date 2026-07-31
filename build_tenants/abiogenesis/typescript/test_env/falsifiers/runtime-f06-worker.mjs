#!/usr/bin/env node

import assert from "node:assert/strict";
import { basename, join } from "node:path";
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
    correlationId: `correlation://s06/ax-f06/${operationId}`,
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

async function produce(input) {
  assert.deepEqual(Object.keys(input).sort(), [
    "action",
    "packageRoot",
    "supportPath",
  ]);
  const support = await import(pathToFileURL(input.supportPath).href);
  const environment = await support.setupInstalledRootCatalog(
    { after() {} },
    input.packageRoot,
  );
  const {
    abg,
    gtl,
    product,
    validator,
    store,
    verified,
    admittedInstall,
    workspaceBinding,
    lock,
    scratch,
  } = environment;
  const publication = constructPublication(gtl, admittedInstall);
  const {
    publicationAdmission,
    publicationValidation,
    programValidations,
  } = validatePublicationAndPrograms(validator, publication);
  const catalogCandidate = product.constructCatalogAdmissionCandidate(
    workspaceBinding,
    lock,
    publicationAdmission.value,
    publicationValidation,
    programValidations,
  );
  assert.equal(
    catalogCandidate.kind,
    "catalog_admission_candidate",
    JSON.stringify(catalogCandidate),
  );
  const catalog = abg.admitCatalog(
    store,
    catalogCandidate,
    publicOperationBasis(
      product,
      "abg.operation.catalog.admit",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      "invocation://s06/ax-f06/catalog-admit",
      [workspaceBinding.admissionEventRef],
    ),
  );
  assert.equal(catalog.kind, "admitted_catalog", JSON.stringify(catalog));
  const program = publication.programs.find((candidate) =>
    candidate.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef);
  assert.notEqual(program, undefined);
  const graphFunction = publication.graphFunctions.find((candidate) =>
    candidate.name === program.starts[0]?.graphFunctionRef);
  assert.notEqual(graphFunction, undefined);
  const subjectHandle = gtl.CONSENSUS_IDS.subjectCatalogHandle;
  const viewCandidate = product.constructCatalogViewCandidate(catalog, [
    graphFunction.name,
    subjectHandle,
  ]);
  assert.equal(
    viewCandidate.kind,
    "catalog_view_candidate",
    JSON.stringify(viewCandidate),
  );
  const view = abg.narrowCatalogView(
    store,
    catalog,
    viewCandidate,
    publicOperationBasis(
      product,
      "abg.operation.catalog.view",
      catalog.catalogId,
      catalog.catalogDigest,
      "invocation://s06/ax-f06/catalog-view",
      [catalog.admissionEventRef],
    ),
  );
  assert.equal(view.kind, "catalog_view", JSON.stringify(view));
  const subjectMaterialization = gtl.constructConsensusSubjectMaterialization({
    subjectContractRef: "contract://stdo/ticket@2.2.2",
    subjectRef: "ticket://abiogenesis/T-281",
    content: "# T-281\n\nAX-F06 independently reconstructed carrier.\n",
  });
  const subject = gtl.constructConsensusSubject({
    subjectContractRef: "contract://stdo/ticket@2.2.2",
    subjectRef: "ticket://abiogenesis/T-281",
    subjectDigest: subjectMaterialization.contentDigest,
    submittingActorRef: workspaceBinding.authorizedActorRef,
    panelRef: "panel://s06/ax-f06",
    roundPolicyRef: "policy://s06/ax-f06",
    workspaceRef: workspaceBinding.workspaceId,
    ticketRef: "ticket://abiogenesis/T-281",
    ticketDigest: subjectMaterialization.contentDigest,
  });
  const semantics = await product.loadInstalledProductSemantics({
    install: admittedInstall,
    publication,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(store, install),
  });
  const applicationCandidate = product.constructCatalogApplicationCandidate(
    semantics,
    {
      catalog,
      view,
      workspaceBinding,
      lock,
      handle: subjectHandle,
      applicationVariant: "node_type",
      value: subject,
      contributorRef: workspaceBinding.authorizedActorRef,
      nodeTypeTarget: { kind: "program", programRef: program.programRef },
      candidateScope: abg.catalogApplicationCandidateScope(store),
    },
  );
  assert.equal(
    applicationCandidate.kind,
    "catalog_application_candidate",
    JSON.stringify(applicationCandidate),
  );
  const application = abg.admitCatalogApplication(
    store,
    view,
    applicationCandidate,
    publicOperationBasis(
      product,
      "abg.operation.catalog.apply",
      view.viewId,
      view.viewDigest,
      "invocation://s06/ax-f06/catalog-apply",
      [view.admissionEventRef],
    ),
  );
  assert.equal(application.kind, "catalog_application", JSON.stringify(application));
  assert.equal(abg.hasAdmittedCatalogApplication(store, application), true);
  const eventLogPath = join(scratch, "ax-f06.events.jsonl");
  store.configureDurableLog(eventLogPath);
  const prefix = store.projectReopenAuthorityAndClose();
  const handoff = {
    prefix,
    install: admittedInstall,
    workspaceBinding,
    lock,
    catalog,
    view,
    application,
    programRef: program.programRef,
    graphFunctionRef: graphFunction.name,
  };
  return {
    action: "produce",
    pid: process.pid,
    cleanupRoot: scratch,
    handoff,
    audit: {
      originatingApplicationAdmitted: true,
      exactHandoffKeys:
        Object.keys(handoff).sort().join("\0") === [
          "application",
          "catalog",
          "graphFunctionRef",
          "install",
          "lock",
          "prefix",
          "programRef",
          "view",
          "workspaceBinding",
        ].join("\0"),
      publicationMatchesInstalledIdentity:
        verified.productId === admittedInstall.productId &&
        product.sha256Canonical(publication) ===
          product.sha256Canonical(catalog.modulePublication),
      applicationDigestSelfConsistent:
        application.applicationDigest ===
          product.catalogApplicationContentDigest(applicationBody(application)),
    },
  };
}

function applicationBody(application) {
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    disposition: _disposition,
    applicationId: _applicationId,
    applicationDigest: _applicationDigest,
    admissionCandidateRef: _admissionCandidateRef,
    admissionEventRef: _admissionEventRef,
    ...body
  } = application;
  return body;
}

async function consume(input) {
  assert.deepEqual(Object.keys(input).sort(), ["action", "handoff"]);
  assert.deepEqual(Object.keys(input.handoff).sort(), [
    "application",
    "catalog",
    "graphFunctionRef",
    "install",
    "lock",
    "prefix",
    "programRef",
    "view",
    "workspaceBinding",
  ]);
  const reopened = installedAbg.reopenEventStore(input.handoff.prefix);
  assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
  try {
    const store = reopened.store;
    const {
      install,
      workspaceBinding,
      lock,
      catalog,
      view,
      application,
      programRef,
      graphFunctionRef,
    } = input.handoff;
    const publication = constructPublication(installedGtl, install);
    const publicationMatchesP1 =
      installedProduct.canonicalJson(publication) ===
        installedProduct.canonicalJson(catalog.modulePublication);
    assert.equal(publicationMatchesP1, true);
    const { programValidations } = validatePublicationAndPrograms(
      installedValidator,
      publication,
    );
    const program = publication.programs.find((candidate) =>
      candidate.programRef === programRef);
    const graphFunction = publication.graphFunctions.find((candidate) =>
      candidate.name === graphFunctionRef);
    assert.notEqual(program, undefined);
    assert.notEqual(graphFunction, undefined);
    const applicationStructurallyExact =
      installedProduct.catalogApplicationContentDigest(
        applicationBody(application),
      ) === application.applicationDigest;
    const installAdmitted = installedAbg.hasAdmittedProductInstall(store, install);
    const workspaceAdmitted = installedAbg.hasAdmittedWorkspaceBinding(
      store,
      workspaceBinding,
    );
    const catalogAdmitted = installedAbg.hasAdmittedCatalog(store, catalog);
    const viewAdmitted = installedAbg.hasAdmittedCatalogView(store, view);
    const reconstructedApplicationAdmitted =
      installedAbg.hasAdmittedCatalogApplication(store, application);
    assert.equal(installAdmitted, true);
    assert.equal(workspaceAdmitted, true);
    assert.equal(catalogAdmitted, true);
    assert.equal(viewAdmitted, true);
    assert.equal(applicationStructurallyExact, true);
    assert.equal(reconstructedApplicationAdmitted, false);
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
    const rawRequest = requireRawAdmission(
      installedValidator,
      {
        kind: "public_invocation",
        schemaVersion: "5.0.0",
        operationId: "abg.operation.run.invoke",
        variant: "start",
        invocationRef: "invocation://s06/ax-f06/run-invoke",
        eventTime: EVENT_TIME,
        correlationId: "correlation://s06/ax-f06/run-invoke",
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
    const policy = installedProduct.constructRootInvocationPolicy(
      workspaceBinding,
      program,
      [],
      ["F_D", "F_P", "F_H"],
      [application],
    );
    const grant = installedProduct.constructCapabilityGrant(
      policy,
      workspaceBinding.authorizedActorRef,
    );
    const authority = installedProduct.constructInvocationAuthority(
      workspaceBinding.authorizedActorRef,
      workspaceBinding,
      view,
      program.programRef,
      graphFunction.name,
      policy,
      [grant],
    );
    assert.equal(authority.kind, "invocation_authority", JSON.stringify(authority));
    const invocation = installedProduct.constructStartInvocation(
      workspaceBinding,
      view,
      program,
      graphFunction,
      rawRequest,
      rawInput,
      policy,
      [grant],
      authority,
    );
    assert.equal(
      invocation.kind,
      "public_invocation_candidate",
      JSON.stringify(invocation),
    );
    const eventCountBefore = store.readAll().length;
    const refusal = installedAbg.admitInvocation(
      store,
      {
        invocation,
        rawRequest,
        rawInput,
        modulePublication: publication,
        program,
        graphFunction,
        programValidation: programValidations.find((candidate) =>
          candidate.programRef === program.programRef),
        workspaceBinding,
        catalogView: view,
        catalogApplications: [application],
        policy,
        capabilityGrants: [grant],
        authority,
      },
      publicOperationBasis(
        installedProduct,
        "abg.operation.run.invoke",
        workspaceBinding.bindingId,
        workspaceBinding.bindingDigest,
        invocation.invocationRef,
        [view.admissionEventRef],
      ),
    );
    return {
      action: "consume",
      pid: process.pid,
      applicationDigest: application.applicationDigest,
      refusal,
      audit: {
        exactInputKeys: true,
        prefixReopened: true,
        installAdmitted,
        workspaceAdmitted,
        catalogAdmitted,
        viewAdmitted,
        publicationMatchesP1,
        applicationStructurallyExact,
        reconstructedApplicationAdmitted,
        eventDelta: store.readAll().length - eventCountBefore,
      },
    };
  } finally {
    reopened.store.closeDurableLog();
  }
}

const input = await readInput();
const output = input.action === "produce"
  ? await produce(input)
  : input.action === "consume"
    ? await consume(input)
    : (() => {
        throw new TypeError(`unknown AX-F06 action ${String(input.action)}`);
      })();
process.stdout.write(`${JSON.stringify(output)}\n`);
