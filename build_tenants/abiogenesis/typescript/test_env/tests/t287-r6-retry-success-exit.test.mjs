import assert from "node:assert/strict";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import {
  publicOperationBasis,
  rawProgramInput,
  requireRawAdmission,
  setupInstalledRootCatalog,
} from "../support/root-installed-environment.mjs";

const root = resolve(import.meta.dirname, "../..");
const PROGRAM_REF = "program://t287/test/retry-workflow@5";
const GRAPH_FUNCTION_REF = "graph-function://t287/test/retry-workflow@5";
const GRAPH_REF = "graph://t287/test/retry-workflow@5";
const NODE_REF = "node://t287/test/retry-workflow@5";
const RECURSION_PROGRAM_REF =
  "program://t287/test/retry-deferred-application@5";
const RECURSION_GRAPH_FUNCTION_REF =
  "graph-function://t287/test/retry-deferred-application@5";
const RECURSION_GRAPH_REF =
  "graph://t287/test/retry-deferred-application@5";
const RECURSION_NODE_REF =
  "node://t287/test/retry-deferred-application@5";

function retryWorkflowPublication(gtl, base) {
  const workflow = base.graphFunctions.find((candidate) =>
    candidate.name ===
      "graph-function://abiogenesis/conformance/hello-workflow@5");
  const childRef = workflow.template.nodes[0].term.graphFunctionRef;
  const sourceProgram = base.programs.find((candidate) =>
    candidate.programRef ===
      "program://abiogenesis/conformance/hello-workflow@5");
  assert.ok(workflow);
  assert.ok(sourceProgram);
  const workflowTerm = gtl.workflow.C(gtl.cGraphFunctionRef({
    graphFunctionRef: childRef,
    input: gtl.cCarrier(workflow.inputs[0]),
    output: gtl.cCarrier(workflow.outputs[0]),
  }));
  const graphFunction = Object.freeze({
    ...structuredClone(workflow),
    name: GRAPH_FUNCTION_REF,
    template: {
      ...structuredClone(workflow.template),
      graphRef: GRAPH_REF,
      startNodeRef: NODE_REF,
      terminalNodeRefs: [NODE_REF],
      nodes: [{
        nodeRef: NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.retry(workflowTerm, 2),
      }],
    },
    tags: [...workflow.tags, "t287-test-only"],
  });
  const program = Object.freeze({
    ...structuredClone(sourceProgram),
    programRef: PROGRAM_REF,
    starts: [{
      startRef: "start://t287/test/retry-workflow@5",
      graphFunctionRef: GRAPH_FUNCTION_REF,
    }],
    callableMembership: [GRAPH_FUNCTION_REF, childRef],
  });
  const sourceContribution = base.contributions.find((candidate) =>
    candidate.handle === workflow.name);
  const childContribution = base.contributions.find((candidate) =>
    candidate.handle === childRef);
  assert.ok(sourceContribution);
  assert.ok(childContribution);
  return {
    publication: Object.freeze({
    ...base,
    programs: [...base.programs, program],
    graphFunctions: [...base.graphFunctions, graphFunction],
    contributions: [
      ...base.contributions.filter((candidate) =>
        candidate.handle !== childRef),
      {
        ...structuredClone(childContribution),
        programMembershipRefs: [
          ...childContribution.programMembershipRefs,
          PROGRAM_REF,
        ],
        readinessPrerequisiteRefs: [
          ...childContribution.readinessPrerequisiteRefs,
          PROGRAM_REF,
        ],
      },
      {
        ...structuredClone(sourceContribution),
        handle: GRAPH_FUNCTION_REF,
        declarationOrContractRef: GRAPH_FUNCTION_REF,
        programMembershipRefs: [PROGRAM_REF],
        readinessPrerequisiteRefs: [PROGRAM_REF],
      },
    ],
    }),
    programRef: PROGRAM_REF,
    graphFunctionRef: GRAPH_FUNCTION_REF,
    childRef,
    input: gtl.constructHelloWorldInput("World"),
  };
}

function retryDeferredApplicationPublication(gtl, base) {
  const source = base.graphFunctions.find((candidate) =>
    candidate.name ===
      "graph-function://abiogenesis/conformance/bounded-recursion@5");
  const sourceProgram = base.programs.find((candidate) =>
    candidate.programRef ===
      "program://abiogenesis/conformance/bounded-recursion@5");
  assert.ok(source);
  assert.ok(sourceProgram);
  const sourceTerm = source.template.nodes[0].term;
  const sourceApplication = source.template.applications[0];
  const childRef = sourceApplication.graphFunctionRef;
  const application = gtl.recurseApplication({
    inputContractRef: sourceApplication.inputContractRef,
    outputContractRef: sourceApplication.outputContractRef,
    graphFunctionRef: sourceApplication.graphFunctionRef,
    terminationRuleRef: sourceApplication.terminationRuleRef,
    terminationEvaluatorRefs: sourceApplication.terminationEvaluatorRefs,
    terminationFieldRef: sourceApplication.terminationFieldRef,
    foldback: sourceApplication.foldback,
    bound: sourceApplication.bound,
  });
  const leaf = gtl.C.of({
    input: gtl.cCarrier(sourceTerm.inputCarrierRef),
    output: gtl.cCarrier(sourceTerm.outputCarrierRef),
    programLocusRef: sourceTerm.programLocusRef,
    stageRole: sourceTerm.stageRole,
    fibre: sourceTerm.fibre,
    armId: sourceTerm.armId,
    compositionRef: application.applicationRef,
    vectorIndex: sourceTerm.vectorIndex,
    judgmentPredicateRef: sourceTerm.judgmentPredicateRef,
    resultBearing: sourceTerm.resultBearing,
    requirement: structuredClone(sourceTerm.requirement),
  });
  const graphFunction = Object.freeze({
    ...structuredClone(source),
    name: RECURSION_GRAPH_FUNCTION_REF,
    template: {
      ...structuredClone(source.template),
      graphRef: RECURSION_GRAPH_REF,
      startNodeRef: RECURSION_NODE_REF,
      terminalNodeRefs: [RECURSION_NODE_REF],
      nodes: [{
        nodeRef: RECURSION_NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.retry(leaf, 2),
      }],
      applications: [application],
    },
    tags: [...source.tags, "t287-test-only"],
  });
  const program = Object.freeze({
    ...structuredClone(sourceProgram),
    programRef: RECURSION_PROGRAM_REF,
    starts: [{
      startRef: "start://t287/test/retry-deferred-application@5",
      graphFunctionRef: RECURSION_GRAPH_FUNCTION_REF,
    }],
    callableMembership: [RECURSION_GRAPH_FUNCTION_REF, childRef],
  });
  const sourceContribution = base.contributions.find((candidate) =>
    candidate.handle === source.name);
  const childContribution = base.contributions.find((candidate) =>
    candidate.handle === childRef);
  assert.ok(sourceContribution);
  assert.ok(childContribution);
  const publication = Object.freeze({
    ...base,
    programs: [...base.programs, program],
    graphFunctions: [...base.graphFunctions, graphFunction],
    contributions: [
      ...base.contributions.filter((candidate) =>
        candidate.handle !== childRef),
      {
        ...structuredClone(childContribution),
        programMembershipRefs: [
          ...childContribution.programMembershipRefs,
          RECURSION_PROGRAM_REF,
        ],
        readinessPrerequisiteRefs: [
          ...childContribution.readinessPrerequisiteRefs,
          RECURSION_PROGRAM_REF,
        ],
      },
      {
        ...structuredClone(sourceContribution),
        handle: RECURSION_GRAPH_FUNCTION_REF,
        declarationOrContractRef: RECURSION_GRAPH_FUNCTION_REF,
        programMembershipRefs: [RECURSION_PROGRAM_REF],
        readinessPrerequisiteRefs: [RECURSION_PROGRAM_REF],
      },
    ],
  });
  return {
    publication,
    programRef: RECURSION_PROGRAM_REF,
    graphFunctionRef: RECURSION_GRAPH_FUNCTION_REF,
    childRef,
    input: {
      kind: "bounded_recursion_state",
      schemaVersion: "5.0.0",
      blockedChildRemaining: null,
      remaining: 0,
      terminal: true,
      trace: [],
    },
  };
}

async function executeTestGraph(context, constructFixture) {
  const environment = await setupInstalledRootCatalog(context, root);
  const {
    abg,
    admittedInstall,
    gtl,
    hogInstalledProduct,
    product,
    store,
    validator,
    workspaceBinding,
  } = environment;
  const fixture = constructFixture(gtl, environment.publication);
  const publication = fixture.publication;
  const program = publication.programs.find((candidate) =>
    candidate.programRef === fixture.programRef);
  const graphFunction = publication.graphFunctions.find((candidate) =>
    candidate.name === fixture.graphFunctionRef);
  assert.ok(program);
  assert.ok(graphFunction);
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
  assert.equal(publicationValidation.kind, "publication_validation",
    JSON.stringify(publicationValidation));
  const programValidation = validator.validateProgram(
    rawProgramInput(validator, publicationAdmission, program),
  );
  assert.equal(programValidation.kind, "program_validation",
    JSON.stringify(programValidation));
  const catalog = product.buildGraphFunctionCatalog([publication]);
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const catalogView = product.narrowGraphFunctionCatalog(
    catalog,
    [fixture.graphFunctionRef, fixture.childRef],
  );
  assert.equal(catalogView.kind, "graph_function_catalog_view",
    JSON.stringify(catalogView));
  const input = fixture.input;
  const rawInput = requireRawAdmission(
    validator,
    input,
    "invocation_input",
    graphFunction.inputs[0],
  );
  const requestValue = {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.run.invoke",
    variant: "direct",
    invocationRef: "invocation://t287/r6/retry-workflow",
    eventTime: "2026-08-07T00:00:00.000Z",
    correlationId: "correlation://t287/r6/retry-workflow",
    payload: {
      programRef: program.programRef,
      graphFunctionRef: graphFunction.name,
    },
  };
  const rawRequest = requireRawAdmission(
    validator,
    requestValue,
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    program,
    [],
    ["F_D"],
  );
  const actorRef = workspaceBinding.authorizedActorRef;
  const grant = product.constructCapabilityGrant(policy, actorRef);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    graphFunction.name,
    policy,
    [grant],
  );
  assert.equal(authority.kind, "invocation_authority", JSON.stringify(authority));
  const invocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    graphFunction,
    rawRequest,
    rawInput,
    policy,
    [grant],
    authority,
  );
  assert.equal(invocation.kind, "public_invocation_candidate",
    JSON.stringify(invocation));
  const invocationAdmission = abg.admitInvocation(store, {
    invocation,
    rawRequest,
    rawInput,
    modulePublication: publication,
    program,
    graphFunction,
    programValidation,
    workspaceBinding,
    catalogView,
    policy,
    capabilityGrants: [grant],
    authority,
  }, publicOperationBasis(
    product,
    "abg.operation.run.invoke",
    workspaceBinding.bindingId,
    workspaceBinding.bindingDigest,
    invocation.invocationRef,
    [workspaceBinding.admissionEventRef],
  ));
  assert.equal(invocationAdmission.kind, "invocation_admission",
    JSON.stringify(invocationAdmission));
  const graph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
    admittedInput: input,
  });
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
      admittedInput: input,
    },
  );
  assert.equal(graphValidation.kind, "graph_validation",
    JSON.stringify(graphValidation));
  const implementationModules = await Promise.all(
    [...new Set(publication.implementationBindings.map((binding) =>
      binding.modulePath))].map((modulePath, index) =>
      import(`${pathToFileURL(join(
        environment.installedRoot,
        modulePath,
      )).href}?t287-r6=${Date.now()}-${index}`)),
  );
  const packagedImplementations = implementationModules.flatMap((module) =>
    Object.values(module).filter(product.isPackagedLeafImplementationDescriptor));
  const resolutionSetCandidate = product.resolveImplementationSet(
    catalogView,
    publication,
    programValidation,
    packagedImplementations,
  );
  assert.equal(resolutionSetCandidate.kind,
    "implementation_resolution_set_candidate",
  JSON.stringify(resolutionSetCandidate));
  const resolutionSetValidation =
    validator.validateImplementationResolutionSet(
      resolutionSetCandidate,
      catalogView,
      publication,
      programValidation,
      packagedImplementations,
    );
  assert.equal(resolutionSetValidation.kind,
    "implementation_resolution_set_validation",
  JSON.stringify(resolutionSetValidation));
  const closureContract = publication.closureContracts.find((candidate) =>
    candidate.closureContractRef === program.closureContractRef);
  assert.ok(closureContract);
  const execution = abg.admitExecutionBasis(store, {
    invocationAdmission,
    program,
    programValidation,
    graph,
    graphValidation,
    resolutionSetCandidate,
    resolutionSetValidation,
    closureContract,
  }, {
    eventTime: requestValue.eventTime,
    correlationId: requestValue.correlationId,
    causationEventRefs: [],
  });
  assert.equal(execution.kind, "execution_basis_admission",
    JSON.stringify(execution));
  const opened = abg.openCall(store, execution.executionBasis, {
    eventTime: requestValue.eventTime,
    correlationId: `${requestValue.correlationId}/open`,
    causationEventRefs: [],
  });
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
  const semantics = await product.loadInstalledProductSemantics({
    install: admittedInstall,
    publication,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(store, install),
  });
  const leafPort = await hogInstalledProduct.bindInstalledLeafInvocationPort({
    store,
    install: admittedInstall,
    implementationSet: execution.implementationSet,
    publication,
    semanticsProjection: product.projectInstalledLeafSemantics(semantics),
  });
  const childModule = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/public/child_traversal_port.js",
  )).href);
  const graphExecute = await import(pathToFileURL(join(
    environment.installedRoot,
    "build/code/src/hog/graph_execute.js",
  )).href);
  const childTraversalPreparationPort =
    childModule.bindChildTraversalPreparationPort({
      store,
      publication,
      program,
      programValidation,
      rootImplementationSet: execution.implementationSet,
      rootInteractionSet: execution.interactionSet,
    });
  const completion = await graphExecute.executeGraphTraversal({
    store,
    executionBasis: execution.executionBasis,
    openedTraversalScope: opened.scope,
    program,
    graphFunction,
    graph,
    graphValidation,
    implementationSet: execution.implementationSet,
    interactionSet: execution.interactionSet,
    continuationProductBasis: {
      install: admittedInstall,
      workspaceBinding,
      catalogView,
      programValidation,
      graphValidation,
    },
    leafPort,
    childTraversalPreparationPort,
    closureContract,
    actorRuntimeBinding: { workspaceBinding },
    input,
    inputDigest: rawInput.subjectDigest,
    eventTime: requestValue.eventTime,
    correlationId: `${requestValue.correlationId}/hog`,
  });
  return { completion, events: store.readAll() };
}

function assertAtomicSuccessfulRetryExit(execution) {
  assert.equal(execution.completion.disposition, "closed",
    JSON.stringify(execution.completion));
  const completed = execution.events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "completed");
  assert.ok(completed.length > 0, "retry-depth exit records completion truth");
  const route = execution.events.find((event) =>
    event.kind === "traversal_route_admitted" &&
    completed.every((progress) =>
      event.payload.consumedAvailabilityRefs.includes(progress.payload.progressRef)
    ));
  assert.ok(route, "one accepted route consumes the complete retry-success suffix");
  const finalProgressIndex = execution.events.findIndex((event) =>
    event.eventId === completed.at(-1).eventId);
  const routeIndex = execution.events.findIndex((event) =>
    event.eventId === route.eventId);
  assert.equal(routeIndex, finalProgressIndex + 1,
    "completion progress and its route are one contiguous admitted suffix");
  assert.deepEqual(route.causationEventRefs.slice(0, completed.length),
    completed.toReversed().map((progress) => progress.eventId));
}

test("T-287 R6 retry-wrapped workflow success exits retry depth atomically", async (context) => {
  const execution = await executeTestGraph(
    context,
    retryWorkflowPublication,
  );
  assertAtomicSuccessfulRetryExit(execution);
});

test("T-287 R6 retry-wrapped deferred application success exits retry depth atomically", async (context) => {
  const execution = await executeTestGraph(
    context,
    retryDeferredApplicationPublication,
  );
  assertAtomicSuccessfulRetryExit(execution);
});
