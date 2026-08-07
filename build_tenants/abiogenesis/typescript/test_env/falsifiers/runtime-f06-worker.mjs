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
      .filter((value) => program.callableMembership.includes(value.id))
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
  const catalog = product.buildGraphFunctionCatalog([publication]);
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const program = publication.programs.find((candidate) =>
    candidate.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef);
  assert.notEqual(program, undefined);
  const graphFunction = publication.graphFunctions.find((candidate) =>
    candidate.id === program.starts[0]?.graphFunctionRef);
  assert.notEqual(graphFunction, undefined);
  const subjectHandle = gtl.CONSENSUS_IDS.subjectCatalogHandle;
  const view = product.narrowGraphFunctionCatalog(catalog, [
    graphFunction.id,
    subjectHandle,
  ]);
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
    submittingActorRef: workspaceBinding.authorizedActorRef,
    panelRef: "panel://s06/ax-f06",
    roundPolicyRef: "policy://s06/ax-f06",
    workspaceRef: workspaceBinding.workspaceId,
    ticketRef: "ticket://abiogenesis/T-281",
    ticketDigest: subjectMaterialization.contentDigest,
  });
  const target = { kind: "program", programRef: program.programRef };
  const targetDigest = product.sha256Canonical(target);
  const valueDigest = product.sha256Canonical(subject);
  const application = product.applyCatalogDeclaration(view, {
    applicationKind: "node_type",
    handle: subjectHandle,
    targetRef: `catalog-target://abiogenesis/${targetDigest.slice("sha256:".length)}`,
    targetDigest,
    appliedValueRef: `catalog-value://abiogenesis/${valueDigest.slice("sha256:".length)}`,
    appliedValueDigest: valueDigest,
  });
  assert.equal(application.kind, "declaration_application", JSON.stringify(application));
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
    graphFunctionRef: graphFunction.id,
  };
  return {
    action: "produce",
    pid: process.pid,
    cleanupRoot: scratch,
    handoff,
    audit: {
      originatingApplicationPure: true,
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
        catalog.publicationDigests.includes(
          product.modulePublicationSemanticDigest(publication),
        ),
      applicationDigestSelfConsistent:
        application.applicationDigest === product.sha256Canonical({
          kind: application.kind,
          schemaVersion: application.schemaVersion,
          catalogBasisDigest: application.catalogBasisDigest,
          viewDigest: application.viewDigest,
          declaration: application.declaration,
          targetRef: application.targetRef,
          targetDigest: application.targetDigest,
          appliedValueRef: application.appliedValueRef,
          appliedValueDigest: application.appliedValueDigest,
        }),
    },
  };
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
      catalog.publicationDigests.includes(
        installedProduct.modulePublicationSemanticDigest(publication),
      );
    assert.equal(publicationMatchesP1, true);
    const { programValidations } = validatePublicationAndPrograms(
      installedValidator,
      publication,
    );
    const program = publication.programs.find((candidate) =>
      candidate.programRef === programRef);
    const graphFunction = publication.graphFunctions.find((candidate) =>
      candidate.id === graphFunctionRef);
    assert.notEqual(program, undefined);
    assert.notEqual(graphFunction, undefined);
    const reconstructedApplication = installedProduct.applyCatalogDeclaration(view, {
      applicationKind: application.declaration.declarationKind,
      handle: application.declaration.handle,
      targetRef: application.targetRef,
      targetDigest: application.targetDigest,
      appliedValueRef: application.appliedValueRef,
      appliedValueDigest: application.appliedValueDigest,
    });
    const applicationStructurallyExact =
      installedProduct.canonicalJson(reconstructedApplication) ===
        installedProduct.canonicalJson(application);
    const installAdmitted = installedAbg.hasAdmittedProductInstall(store, install);
    const workspaceAdmitted = installedAbg.hasAdmittedWorkspaceBinding(
      store,
      workspaceBinding,
    );
    assert.equal(installAdmitted, true);
    assert.equal(workspaceAdmitted, true);
    assert.equal(applicationStructurallyExact, true);
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
      graphFunction.id,
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
        [workspaceBinding.admissionEventRef],
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
        catalogPure: true,
        viewPure: true,
        publicationMatchesP1,
        applicationStructurallyExact,
        reconstructedApplicationPure: true,
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
