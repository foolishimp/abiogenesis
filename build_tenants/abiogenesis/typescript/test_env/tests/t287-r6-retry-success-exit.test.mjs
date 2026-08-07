import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
const FAN_OUT_PROGRAM_REF = "program://t287/test/retry-fan-out@5";
const FAN_OUT_GRAPH_FUNCTION_REF =
  "graph-function://t287/test/retry-fan-out@5";
const FAN_OUT_GRAPH_REF = "graph://t287/test/retry-fan-out@5";
const FAN_OUT_NODE_REF = "node://t287/test/retry-fan-out@5";
const IDENTITY_PROGRAM_REF = "program://t287/test/retry-identity@5";
const IDENTITY_GRAPH_FUNCTION_REF =
  "graph-function://t287/test/retry-identity@5";
const IDENTITY_GRAPH_REF = "graph://t287/test/retry-identity@5";
const IDENTITY_NODE_REF = "node://t287/test/retry-identity@5";
const FH_PROGRAM_REF = "program://t287/test/retry-fh@5";
const FH_GRAPH_FUNCTION_REF = "graph-function://t287/test/retry-fh@5";
const FH_GRAPH_REF = "graph://t287/test/retry-fh@5";
const FH_NODE_REF = "node://t287/test/retry-fh@5";
const FH_INPUT_CONTRACT_REF =
  "contract://t287/test/consensus-resolution-input@5";
const FH_ROOT_CLOSURE_CONTRACT_REF =
  "closure://t287/test/retry-fh-root@5";

function extendContributionMembership(
  contribution,
  programRef,
) {
  return {
    ...structuredClone(contribution),
    programMembershipRefs: [
      ...contribution.programMembershipRefs,
      programRef,
    ],
    readinessPrerequisiteRefs: [
      ...contribution.readinessPrerequisiteRefs,
      programRef,
    ],
  };
}

function publicationWithRootVariant(base, input) {
  const sourceContribution = base.contributions.find((candidate) =>
    candidate.handle === input.sourceGraphFunctionRef);
  assert.ok(sourceContribution);
  const childContributions = input.childRefs.map((childRef) => {
    const contribution = base.contributions.find((candidate) =>
      candidate.handle === childRef);
    assert.ok(contribution);
    return extendContributionMembership(contribution, input.program.programRef);
  });
  return Object.freeze({
    ...base,
    programs: [...base.programs, input.program],
    graphFunctions: [...base.graphFunctions, input.graphFunction],
    contributions: [
      ...base.contributions.filter((candidate) =>
        !input.childRefs.includes(candidate.handle)),
      ...childContributions,
      {
        ...structuredClone(sourceContribution),
        handle: input.graphFunction.id,
        declarationOrContractRef: input.graphFunction.id,
        programMembershipRefs: [input.program.programRef],
        readinessPrerequisiteRefs: [input.program.programRef],
      },
    ],
  });
}

function retryWorkflowPublication(gtl, base) {
  const workflow = base.graphFunctions.find((candidate) =>
    candidate.id ===
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
    id: GRAPH_FUNCTION_REF,
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
    candidate.handle === workflow.id);
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
    candidate.id ===
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
    id: RECURSION_GRAPH_FUNCTION_REF,
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
    candidate.handle === source.id);
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

function retryFanOutPublication(gtl, base) {
  const source = base.graphFunctions.find((candidate) =>
    candidate.id === gtl.FAN_OUT_HELLO_IDS.graphFunctionRef);
  const sourceProgram = base.programs.find((candidate) =>
    candidate.programRef === gtl.FAN_OUT_HELLO_IDS.programRef);
  assert.ok(source);
  assert.ok(sourceProgram);
  const sourceTerm = source.template.nodes[0].term;
  assert.equal(sourceTerm.kind, "c_compose");
  assert.equal(sourceTerm.terms[0].kind, "c_batch");
  const childRefs = [
    gtl.FAN_OUT_HELLO_IDS.elementGraphFunctionRef,
    gtl.FAN_OUT_HELLO_IDS.reducerGraphFunctionRef,
  ];
  const graphFunction = Object.freeze({
    ...structuredClone(source),
    id: FAN_OUT_GRAPH_FUNCTION_REF,
    template: {
      ...structuredClone(source.template),
      graphRef: FAN_OUT_GRAPH_REF,
      startNodeRef: FAN_OUT_NODE_REF,
      terminalNodeRefs: [FAN_OUT_NODE_REF],
      nodes: [{
        nodeRef: FAN_OUT_NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.compose(
          gtl.C.retry(gtl.C.retry(sourceTerm.terms[0], 2), 2),
          sourceTerm.terms[1],
        ),
      }],
    },
    tags: [...source.tags, "t287-test-only"],
  });
  const program = Object.freeze({
    ...structuredClone(sourceProgram),
    programRef: FAN_OUT_PROGRAM_REF,
    starts: [{
      startRef: "start://t287/test/retry-fan-out@5",
      graphFunctionRef: FAN_OUT_GRAPH_FUNCTION_REF,
    }],
    callableMembership: [FAN_OUT_GRAPH_FUNCTION_REF, ...childRefs],
  });
  return {
    publication: publicationWithRootVariant(base, {
      sourceGraphFunctionRef: source.id,
      graphFunction,
      program,
      childRefs,
    }),
    programRef: program.programRef,
    graphFunctionRef: graphFunction.id,
    childRefs,
    input: gtl.constructFanOutHelloInput(["Ada", "Grace", "Margaret"]),
  };
}

function retryIdentityPublication(gtl, base) {
  const source = base.graphFunctions.find((candidate) =>
    candidate.id === gtl.HELLO_WORLD_IDS.graphFunctionRef);
  const sourceProgram = base.programs.find((candidate) =>
    candidate.programRef === gtl.HELLO_WORLD_IDS.programRef);
  assert.ok(source);
  assert.ok(sourceProgram);
  const next = source.template.nodes[0].term;
  const graphFunction = Object.freeze({
    ...structuredClone(source),
    id: IDENTITY_GRAPH_FUNCTION_REF,
    template: {
      ...structuredClone(source.template),
      graphRef: IDENTITY_GRAPH_REF,
      startNodeRef: IDENTITY_NODE_REF,
      terminalNodeRefs: [IDENTITY_NODE_REF],
      nodes: [{
        nodeRef: IDENTITY_NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.compose(
          gtl.C.retry(
            gtl.C.retry(
              gtl.C.id(gtl.cCarrier(source.inputs[0])),
              2,
            ),
            2,
          ),
          next,
        ),
      }],
    },
    tags: [...source.tags, "t287-test-only"],
  });
  const program = Object.freeze({
    ...structuredClone(sourceProgram),
    programRef: IDENTITY_PROGRAM_REF,
    starts: [{
      startRef: "start://t287/test/retry-identity@5",
      graphFunctionRef: IDENTITY_GRAPH_FUNCTION_REF,
    }],
    callableMembership: [IDENTITY_GRAPH_FUNCTION_REF],
  });
  return {
    publication: publicationWithRootVariant(base, {
      sourceGraphFunctionRef: source.id,
      graphFunction,
      program,
      childRefs: [],
    }),
    programRef: program.programRef,
    graphFunctionRef: graphFunction.id,
    childRefs: [],
    input: gtl.constructHelloWorldInput("Identity"),
  };
}

function unresolvedConsensusResolution(product) {
  const subjectDigest = product.sha256Canonical({
    subject: "T-287 retry F_H completion",
  });
  const terminalOutcome = {
    kind: "consensus_round_outcome",
    schemaVersion: "5.0.0",
    roundRef: "consensus-round://t287/retry-fh/1",
    outcome: "escalate_fh",
    findingSetRefs: ["review-findings://t287/retry-fh/1"],
    rulingRefs: [],
    evidenceRefs: ["evidence://t287/retry-fh/1"],
  };
  const result = {
    kind: "consensus_result_candidate",
    schemaVersion: "5.0.0",
    subjectRef: "ticket://abiogenesis/T-287",
    subjectDigest,
    panelRef: "panel://t287/retry-fh",
    policyRef: "policy://t287/retry-fh@1",
    roundRefs: [terminalOutcome.roundRef],
    findingSetRefs: [...terminalOutcome.findingSetRefs],
    submitterResponseRefs: ["submitter-response://t287/retry-fh/1"],
    rulings: [],
    classification: "unresolved_disagreement",
    dissentProfileRefs: ["reviewer-profile://t287/retry-fh/dissent"],
    terminalOutcome,
    evidenceRefs: [...terminalOutcome.evidenceRefs],
    lineageRefs: [terminalOutcome.roundRef],
    contractFailureRef: null,
  };
  const body = {
    kind: "consensus_resolution",
    resolutionKind: "round_decision",
    schemaVersion: "5.0.0",
    outcome: terminalOutcome,
    result,
    resolutionTerminal: false,
  };
  const decisionDigest = product.sha256Canonical(body);
  return {
    ...body,
    decisionRef:
      `consensus-round-decision://abg/${
        decisionDigest.slice("sha256:".length)
      }`,
    decisionDigest,
  };
}

function retryFhPublication(gtl, _base, environment) {
  const base = gtl.constructConsensusModulePublication({
    productId: environment.verified.productId,
    artifactDigest: environment.verified.artifactDigest,
    productContentDigest: environment.verified.productContentDigest,
    productManifestDigest: environment.verified.manifestDigest,
    packageName: environment.verified.packageName,
    packageVersion: environment.verified.packageVersion,
  });
  const source = base.graphFunctions.find((candidate) =>
    candidate.id === gtl.CONSENSUS_IDS.escalationGraphFunctionRef);
  const sourceProgram = base.programs.find((candidate) =>
    candidate.callableMembership.includes(source?.id));
  const sourceInputContract = base.contracts.find((candidate) =>
    candidate.contractRef === gtl.CONSENSUS_IDS.resolutionContractRef);
  const sourceClosureContract = base.closureContracts.find((candidate) =>
    candidate.closureContractRef ===
      gtl.CONSENSUS_IDS.finalizationClosureContractRef);
  assert.ok(source);
  assert.ok(sourceProgram);
  assert.ok(sourceInputContract);
  assert.ok(sourceClosureContract);
  const sourceTerm = source.template.nodes[0].term;
  assert.equal(sourceTerm.kind, "c_compose");
  const sourceFh = sourceTerm.terms[0];
  assert.equal(sourceFh.kind, "c_of");
  const fh = gtl.C.of({
    input: gtl.cCarrier(FH_INPUT_CONTRACT_REF),
    output: gtl.cCarrier(sourceFh.outputCarrierRef),
    programLocusRef: FH_NODE_REF,
    stageRole: sourceFh.stageRole,
    fibre: "F_H",
    armId: sourceFh.armId,
    compositionRef: sourceFh.compositionRef,
    vectorIndex: sourceFh.vectorIndex,
    judgmentPredicateRef: sourceFh.judgmentPredicateRef,
    resultBearing: sourceFh.resultBearing,
    requirement: {
      ...structuredClone(sourceFh.requirement),
      requestContractRef: FH_INPUT_CONTRACT_REF,
    },
  });
  const childRefs = [gtl.CONSENSUS_IDS.escalationFinalizerGraphFunctionRef];
  const startRef = "start://t287/test/retry-fh@5";
  const graphFunction = Object.freeze({
    ...structuredClone(source),
    id: FH_GRAPH_FUNCTION_REF,
    environment: {
      ...structuredClone(source.environment),
      requires: source.environment.requires.map((contractRef) =>
        contractRef === source.inputs[0]
          ? FH_INPUT_CONTRACT_REF
          : contractRef),
    },
    inputs: [FH_INPUT_CONTRACT_REF],
    template: {
      ...structuredClone(source.template),
      graphRef: FH_GRAPH_REF,
      startNodeRef: FH_NODE_REF,
      terminalNodeRefs: [FH_NODE_REF],
      nodes: [{
        nodeRef: FH_NODE_REF,
        nodeKind: "c_locus",
        term: gtl.C.compose(
          gtl.C.retry(gtl.C.retry(fh, 2), 2),
          sourceTerm.terms[1],
        ),
      }],
    },
    declarations: {
      ...structuredClone(source.declarations),
      "abg.closure_contract": FH_ROOT_CLOSURE_CONTRACT_REF,
    },
    tags: [...source.tags, "t287-test-only"],
  });
  const {
    actionCatalog: sourceActionCatalog,
    constructionComposition: _sourceConstructionComposition,
    publicAssetTargets: sourcePublicAssetTargets,
    ...sourceProgramBody
  } = structuredClone(sourceProgram);
  assert.ok(sourceActionCatalog);
  assert.ok(sourcePublicAssetTargets);
  const {
    catalogDigest: _sourceCatalogDigest,
    catalogRef: _sourceCatalogRef,
    ...sourceActionCatalogBody
  } = sourceActionCatalog;
  const actionCatalogBody = {
    ...sourceActionCatalogBody,
    rows: sourceActionCatalog.rows.map((row) => ({
      ...row,
      programRef: FH_PROGRAM_REF,
      graphFunctionRef: FH_GRAPH_FUNCTION_REF,
      targetProgramLocusRef: FH_GRAPH_FUNCTION_REF,
    })),
  };
  const actionCatalogDigest = environment.product.sha256Canonical(
    actionCatalogBody,
  );
  const program = Object.freeze({
    ...sourceProgramBody,
    programRef: FH_PROGRAM_REF,
    starts: [{
      startRef,
      graphFunctionRef: FH_GRAPH_FUNCTION_REF,
    }],
    callableMembership: [FH_GRAPH_FUNCTION_REF, ...childRefs],
    closureContractRef: FH_ROOT_CLOSURE_CONTRACT_REF,
    actionCatalog: {
      ...actionCatalogBody,
      catalogRef:
        `action-catalog://product/${
          actionCatalogDigest.slice("sha256:".length)
        }`,
      catalogDigest: actionCatalogDigest,
    },
    publicAssetTargets: sourcePublicAssetTargets.map((target) => ({
      ...target,
      handle: FH_GRAPH_FUNCTION_REF,
      assetRef: FH_GRAPH_FUNCTION_REF,
      startRef,
    })),
    policies: {
      "abg.root_mode": "direct",
      "abg.compute_regime": "mixed",
    },
  });
  return {
    publication: publicationWithRootVariant({
      ...base,
      closureContracts: [
        ...base.closureContracts,
        {
          ...structuredClone(sourceClosureContract),
          closureContractRef: FH_ROOT_CLOSURE_CONTRACT_REF,
          closureScope: "run",
          eventKindRefs: [
            "terminal_reached",
            "frame_closed",
            "graph_call_closed",
            "run_closed",
          ],
        },
      ],
      contracts: [
        ...base.contracts,
        {
          ...structuredClone(sourceInputContract),
          contractRef: FH_INPUT_CONTRACT_REF,
          contractKind: "input",
        },
      ],
    }, {
      sourceGraphFunctionRef: source.id,
      graphFunction,
      program,
      childRefs,
    }),
    programRef: program.programRef,
    graphFunctionRef: graphFunction.id,
    childRefs,
    input: unresolvedConsensusResolution(environment.product),
    interaction: {
      capabilityRef: gtl.CONSENSUS_IDS.actorCapabilityRef,
    },
  };
}

async function executeTestGraph(context, constructFixture, options = {}) {
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
  const fixture = constructFixture(gtl, environment.publication, environment);
  await options.prepareStore?.({ environment, fixture });
  const publicationAdmission = requireRawAdmission(
    validator,
    fixture.publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const publication = publicationAdmission.value;
  const program = publication.programs.find((candidate) =>
    candidate.programRef === fixture.programRef);
  const graphFunction = publication.graphFunctions.find((candidate) =>
    candidate.id === fixture.graphFunctionRef);
  assert.ok(program);
  assert.ok(graphFunction);
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
    [
      fixture.graphFunctionRef,
      ...(fixture.childRefs ?? [fixture.childRef]).filter(Boolean),
    ],
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
      graphFunctionRef: graphFunction.id,
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
    fixture.interaction === undefined
      ? []
      : programValidation.interactionLeafRows.map((row) => ({
          requirementKey: row.requirementKey,
          requirementKeyDigest: row.requirementKeyDigest,
          actorCapabilityRef: row.requirement.actorCapabilityRef,
        })),
    fixture.interaction === undefined ? ["F_D"] : ["F_D", "F_H"],
  );
  const actorRef = workspaceBinding.authorizedActorRef;
  const grants = [
    product.constructCapabilityGrant(policy, actorRef),
    ...(fixture.interaction === undefined
      ? []
      : [
          product.constructCapabilityGrant(
            policy,
            actorRef,
            "abg.operation.interaction.respond",
            fixture.interaction.capabilityRef,
          ),
          product.constructCapabilityGrant(
            policy,
            actorRef,
            "abg.operation.run.continue",
            fixture.interaction.capabilityRef,
          ),
        ]),
  ];
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    graphFunction.id,
    policy,
    grants,
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
    grants,
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
    capabilityGrants: grants,
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
  const traversalExecutionInput = {
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
  };
  let completion = await graphExecute.executeGraphTraversal(
    traversalExecutionInput,
  );
  if (fixture.interaction !== undefined) {
    completion = await completeFhInteraction({
      ...environment,
      actorRef,
      catalogView,
      closureContract,
      completion,
      execution,
      fixture,
      graph,
      graphExecute,
      graphFunction,
      invocationAdmission,
      leafPort,
      policy,
      program,
      programValidation,
      requestValue,
      traversalExecutionInput,
    });
  }
  return {
    completion,
    events: store.readAll(),
    environment,
    execution,
    fixture,
    graph,
    graphFunction,
    opened,
    program,
    traversalExecutionInput,
  };
}

async function completeFhInteraction(runtime) {
  const {
    abg,
    actorRef,
    admittedInstall,
    catalogView,
    closureContract,
    completion: held,
    execution,
    fixture,
    graph,
    graphExecute,
    hog,
    hogExecute,
    invocationAdmission,
    product,
    program,
    requestValue,
    store,
    traversalExecutionInput,
    workspaceBinding,
  } = runtime;
  assert.equal(held.disposition, "held", JSON.stringify(held));
  assert.ok(held.continuationRef);
  assert.ok(held.heldInteraction);
  let continuation = abg.replay(store, {
    runId: held.heldInteraction.cCall.runId,
  }).continuations.find((row) =>
    row.continuationRef === held.continuationRef);
  assert.equal(continuation?.status, "open");
  const respondOperation = abg.admitContinuationPublicOperation(
    store,
    invocationAdmission,
    "abg.operation.interaction.respond",
    continuation,
    "answer_escalation",
    actorRef,
    fixture.interaction.capabilityRef,
    publicOperationBasis(
      product,
      "abg.operation.interaction.respond",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      "invocation://t287/r6/retry-fh/respond",
    ),
  );
  const semanticBasis = abg.projectFhInteractionSemanticBasis(
    store,
    continuation,
  );
  assert.ok(semanticBasis);
  const responseBody = {
    kind: "consensus_escalation_decision",
    schemaVersion: "5.0.0",
    roundDecision: fixture.input,
    decision: "accept_with_dissent",
    humanActorRef: actorRef,
    rationaleRef: "rationale://t287/retry-fh/accepted",
  };
  const decisionDigest = product.sha256Canonical(responseBody);
  const responseCandidate = {
    ...responseBody,
    decisionRef:
      `consensus-escalation-decision://abg/${
        decisionDigest.slice("sha256:".length)
      }`,
    decisionDigest,
  };
  const semantics = await product.loadInstalledProductSemantics({
    install: admittedInstall,
    publication: fixture.publication,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(store, install),
  });
  const response = product.evaluateInstalledInteractionResponse(
    semantics,
    { ...semanticBasis, actingActorRef: actorRef },
    responseCandidate,
  );
  assert.ok(response, "installed Product accepts the exact F_H decision");
  const responded = abg.admitFhInteractionResponse(
    store,
    continuation,
    respondOperation,
    continuation.responseContractRef,
    response,
    {
      eventTime: requestValue.eventTime,
      correlationId: `${requestValue.correlationId}/fh-response`,
      causationEventRefs: [],
    },
  );
  continuation = abg.replay(store, {
    runId: held.heldInteraction.cCall.runId,
  }).continuations.find((row) =>
    row.continuationRef === held.continuationRef);
  assert.equal(continuation?.status, "responded");
  const continueOperation = abg.admitContinuationPublicOperation(
    store,
    invocationAdmission,
    "abg.operation.run.continue",
    continuation,
    "current_intent",
    actorRef,
    fixture.interaction.capabilityRef,
    publicOperationBasis(
      product,
      "abg.operation.run.continue",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      "invocation://t287/r6/retry-fh/continue",
    ),
  );
  const rehydrated = abg.rehydrateFhContinuation(
    store,
    continuation,
    {
      install: admittedInstall,
      workspaceBinding,
      catalogView,
      program,
      graph,
      closureContract,
    },
    continueOperation,
  );
  assert.ok(rehydrated, "exact responded continuation rehydrates");
  const heldCursor = hog.rehydrateHeldInteractionCursor(
    store,
    rehydrated.heldInteraction.cursor,
  );
  assert.ok(heldCursor, "exact held interaction cursor rehydrates");
  const successorInput = abg.deriveFhResumeSuccessorInput(
    store,
    continuation,
    continueOperation,
    execution.executionBasis,
    closureContract,
  );
  const successorCursor = hog.deriveInteractionResumeCursor(
    heldCursor,
    {
      inputRef: successorInput.inputRef,
      inputDigest: successorInput.inputDigest,
    },
  );
  assert.equal(successorCursor.kind, "traversal_cursor",
    JSON.stringify(successorCursor));
  const resume = abg.admitFhInteractionResume(
    store,
    continuation,
    continueOperation,
    execution.executionBasis,
    closureContract,
    successorInput,
    successorCursor,
    store.digest(),
    {
      eventTime: requestValue.eventTime,
      correlationId: `${requestValue.correlationId}/fh-resume`,
      causationEventRefs: [],
    },
  );
  let resumed = hogExecute.completeInteractionResume({
    store,
    executionBasis: execution.executionBasis,
    graph,
    heldInteraction: {
      ...rehydrated.heldInteraction,
      cursor: heldCursor,
    },
    successorCursor,
    resume,
    closureContract,
    clock: {
      eventTime: requestValue.eventTime,
      correlationId: `${requestValue.correlationId}/hog/resume`,
    },
  });
  if (resumed.disposition === "advanced") {
    assert.ok(resumed.nextCursor);
    assert.ok(resumed.resultValue);
    const resumedInputDigest = product.sha256Canonical(resumed.resultValue);
    resumed = await graphExecute.executeGraphTraversal({
      ...traversalExecutionInput,
      resume: {
        cursor: resumed.nextCursor,
        input: resumed.resultValue,
        inputDigest: resumedInputDigest,
      },
    });
  }
  assert.equal(responded.responseRef, resume.responseRef);
  return resumed;
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

function assertNestedSuccessfulRetryExit(
  execution,
  completionClass,
  expectedDepth = 2,
) {
  assertAtomicSuccessfulRetryExit(execution);
  const completed = execution.events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "completed" &&
    event.payload.completionClass === completionClass);
  assert.equal(completed.length, expectedDepth,
    "one completed row is admitted for every exited retry boundary");
  assert.deepEqual(
    completed.map((event) => event.payload.completedRetryDepth),
    Array.from({ length: expectedDepth }, (_, index) => expectedDepth - index),
    "completed depth is exact inner-to-outer",
  );
  assert.deepEqual(
    completed.map((event) => event.payload.predecessorProgressRef),
    [
      null,
      ...completed.slice(0, -1).map((event) => event.payload.progressRef),
    ],
    "each outer completion is chained to the immediately preceding inner row",
  );
  const progressRefs = completed.map((event) => event.payload.progressRef);
  const progressEventRefs = completed.map((event) => event.eventId);
  const route = execution.events.find((event) =>
    event.kind === "traversal_route_admitted" &&
    progressRefs.every((ref) =>
      event.payload.consumedAvailabilityRefs.includes(ref)));
  assert.ok(route);
  assert.deepEqual(
    route.payload.consumedAvailabilityRefs.slice(-expectedDepth),
    progressRefs,
    "route consumes the exact complete progress chain",
  );
  const routeIndex = execution.events.findIndex((event) =>
    event.eventId === route.eventId);
  const finalProgressIndex = execution.events.findIndex((event) =>
    event.eventId === completed.at(-1).eventId);
  assert.equal(routeIndex, finalProgressIndex + 1,
    "route is admitted immediately after the final staged progress row");
  assert.deepEqual(
    route.causationEventRefs.filter((eventRef) =>
      progressEventRefs.includes(eventRef)),
    progressEventRefs.toReversed(),
    "route causation names the exact completion chain outer-to-inner",
  );
  for (const [index, progress] of completed.entries()) {
    assert.equal(progress.causationEventRefs.length, 2);
    assert.equal(
      progress.causationEventRefs[1],
      index === 0
        ? progress.payload.completionWitnessEventRef
        : completed[index - 1].eventId,
    );
  }
  return { completed, route };
}

function eventCandidate(event, overrides = {}) {
  const {
    eventId: _eventId,
    admissionOrdinal: _admissionOrdinal,
    payloadDigest: _payloadDigest,
    ...candidate
  } = event;
  return { ...candidate, ...overrides };
}

async function forgeEventAt(execution, targetEventRef, overrides) {
  const eventStoreApi = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
  const forgedStore = new eventStoreApi.AbgEventStore();
  for (const event of execution.events) {
    const admitted = eventStoreApi.admitRuntimeEvent(
      forgedStore,
      eventCandidate(
        event,
        event.eventId === targetEventRef ? overrides : {},
      ),
    );
    if (event.eventId === targetEventRef) return { forgedStore, admitted };
    assert.equal(admitted.eventId, event.eventId);
  }
  assert.fail(`target event ${targetEventRef} was absent`);
}

function durableEvents(path) {
  const value = readFileSync(path, "utf8").trim();
  return value.length === 0
    ? []
    : value.split(/\r?\n/u).map((line) => JSON.parse(line));
}

function exactFanOutCompletionEvent(execution) {
  const rows = execution.events.filter((event) =>
    event.kind === "fan_out_completion_admitted" &&
    event.payload.completionKind === "complete_vector");
  assert.equal(rows.length, 1, "one exact complete-vector carrier is admitted");
  return rows[0];
}

function exactFanOutProjectionAuthority(execution, completionEvent) {
  const application = execution.graph.template.applications.find((candidate) =>
    candidate.relationKind === "fan_out" &&
    candidate.applicationRef === completionEvent.payload.applicationRef);
  assert.ok(application);
  return {
    graph: execution.graph,
    application,
    basisId: completionEvent.basisId,
    runId: completionEvent.runId,
    graphCallId: completionEvent.graphCallId,
    frameId: completionEvent.frameId,
  };
}

async function exactFanOutProjector(execution) {
  return import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/fan_out_projection.js",
  )).href);
}

async function eventStoreApi(execution) {
  return import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
}

async function retryApi(execution) {
  return import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/retry.js",
  )).href);
}

async function traversalRouteApi(execution) {
  return import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/traversal_route.js",
  )).href);
}

function fanOutFinalSourceCursor(
  execution,
  completionEvent,
  events = execution.events,
) {
  const finalRow = completionEvent.payload.taskRows.at(-1);
  assert.ok(finalRow);
  const opened = events.find((event) =>
    event.kind === "c_call_opened" &&
    event.aggregateId === finalRow.cCallRef);
  assert.ok(opened);
  const body = {
    programRef: execution.execution.executionBasis.programRef,
    executionBasisRef: execution.execution.executionBasis.basisRef,
    traversalScopeRef: execution.opened.scope.scopeRef,
    runId: opened.runId,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    graphRef: execution.graph.materializationRef,
    inputRef: finalRow.inputMemberRef,
    inputDigest: finalRow.inputMemberDigest,
    currentNodeRef: FAN_OUT_NODE_REF,
    position: "at_term",
    termPath: [
      "node",
      FAN_OUT_NODE_REF,
      "c",
      "terms",
      "0",
      "term",
      "term",
      "tasks",
      String(finalRow.ordinal),
    ],
    taskOrdinal: finalRow.ordinal,
    attempt: opened.payload.attempt,
    retryPath: opened.payload.retryPath,
  };
  const cursorDigest = execution.environment.product.sha256Canonical(body);
  const cursor = {
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...body,
  };
  assert.equal(cursor.cursorRef, opened.payload.cursorRef);
  assert.equal(cursor.cursorDigest, opened.payload.cursorDigest);
  return { cursor, opened, finalRow };
}

function fanOutContinuationCursor(execution, sourceCursor, completion) {
  const continuation = execution.environment.gtl.deriveCContinuationTarget(
    execution.graph,
    {
      nodeRef: sourceCursor.currentNodeRef,
      termPath: sourceCursor.termPath,
      taskOrdinal: sourceCursor.taskOrdinal,
      attempt: sourceCursor.attempt,
      retryPath: sourceCursor.retryPath,
      inputRef: sourceCursor.inputRef,
      inputDigest: sourceCursor.inputDigest,
    },
    {
      inputRef: completion.outputVectorRef,
      inputDigest: completion.outputVectorDigest,
    },
  );
  assert.equal(continuation.kind, "c_continuation_target",
    JSON.stringify(continuation));
  assert.equal(continuation.disposition, "advance");
  const body = {
    programRef: sourceCursor.programRef,
    executionBasisRef: sourceCursor.executionBasisRef,
    traversalScopeRef: sourceCursor.traversalScopeRef,
    runId: sourceCursor.runId,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    graphRef: sourceCursor.graphRef,
    inputRef: continuation.inputRef,
    inputDigest: continuation.inputDigest,
    currentNodeRef: continuation.nodeRef,
    position: "at_term",
    termPath: continuation.termPath,
    taskOrdinal: continuation.taskOrdinal,
    attempt: continuation.attempt,
    retryPath: continuation.retryPath,
  };
  const cursorDigest = execution.environment.product.sha256Canonical(body);
  return {
    kind: "traversal_cursor",
    schemaVersion: "5.0.0",
    cursorRef:
      `traversal-cursor://abiogenesis/${cursorDigest.slice("sha256:".length)}`,
    cursorDigest,
    ...body,
  };
}

function workflowCCallValue(execution, opened, fibre) {
  const basis = execution.execution.executionBasis;
  return {
    kind: "c_call",
    schemaVersion: "5.0.0",
    cCallRef: opened.payload.cCallRef,
    cCallDigest: opened.payload.cCallDigest,
    callClass: "workflow",
    basisId: basis.basisRef,
    runId: opened.runId,
    graphFunctionRef: basis.graphFunctionRef,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    edgeRef: basis.entryRef,
    vectorIndex: opened.payload.vectorIndex,
    stageRole: "workflow",
    batchRef: opened.payload.batchRef,
    taskOrdinal: opened.payload.taskOrdinal,
    attempt: opened.payload.attempt,
    programLocusRef: opened.payload.programLocusRef,
    retryPath: opened.payload.retryPath,
    regime: "F_D",
    armId: "arm://abiogenesis/workflow.C@5",
    compositionRef: null,
    implementationSetRef: basis.rootImplementationSetRef,
    implementationRequirementKey: null,
    implementationBindingRef: null,
    implementationRef: null,
    childGraphFunctionRef: opened.payload.childGraphFunctionRef,
    inputContractRef: execution.graph.template.applications.find(
      (candidate) => candidate.relationKind === "fan_out",
    ).inputMemberContractRef,
    outputContractRef: execution.graph.template.applications.find(
      (candidate) => candidate.relationKind === "fan_out",
    ).outputMemberContractRef,
    failureContractRef: opened.payload.failureContractRef,
    refusalContractRef: basis.refusalContractRef,
    refusalValueKind: basis.refusalValueKind,
    evidenceContractRef: basis.evidenceContractRef,
    judgmentContractRef: basis.judgmentContractRef,
    rejectionContractRef: basis.rejectionContractRef,
    transitionContractRef: basis.transitionContractRef,
    closureContractRef: basis.closureContractRef,
    closureContractDigest: basis.closureContractDigest,
    judgmentPredicateRef:
      execution.graphFunction.declarations["abg.judgment_predicate"],
    terminalPredicateRef: basis.terminalPredicateRef,
    replayProjectionRef: basis.replayProjectionRef,
    terminalKind: basis.terminalKind,
    openedEventRef: opened.eventId,
    fibreSelectedEventRef: fibre.eventId,
  };
}

async function admittedFinalFanOutOutcome(
  execution,
  store,
  completionEvent,
) {
  const api = await eventStoreApi(execution);
  const { cursor: sourceCursor, opened, finalRow } =
    fanOutFinalSourceCursor(execution, completionEvent, store.readAll());
  const fibre = store.readAll().find((event) =>
    event.kind === "c_call_fibre_selected" &&
    event.aggregateId === opened.aggregateId);
  assert.ok(fibre);
  const carrierStore = new api.AbgEventStore();
  for (const event of store.readAll().slice(0, fibre.admissionOrdinal)) {
    const admitted = api.admitRuntimeEvent(carrierStore, eventCandidate(event));
    assert.equal(admitted.eventId, event.eventId);
  }
  const cCall = execution.environment.abg.rehydrateWorkflowCCall(
    carrierStore,
    execution.execution.executionBasis,
    execution.execution.implementationSet,
    execution.opened.scope,
    execution.graphFunction,
    execution.graph,
    sourceCursor,
    workflowCCallValue(execution, opened, fibre),
  );
  assert.ok(cCall, "the exact workflow CCall carrier rehydrates from its open fibre");
  const resultEvent = store.readAll().find((event) =>
    event.kind === "c_call_result_admitted" &&
    event.payload.resultRef === finalRow.resultRef);
  const judgmentEvent = store.readAll().find((event) =>
    event.kind === "c_call_judged" &&
    event.payload.judgmentRef === finalRow.judgmentRef);
  assert.ok(resultEvent);
  assert.ok(judgmentEvent);
  const result = {
    ...resultEvent.payload,
    kind: "admitted_c_call_result",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    admissionEventRef: resultEvent.eventId,
  };
  const judgment = {
    ...judgmentEvent.payload,
    kind: "admitted_c_call_judgment",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    admissionEventRef: judgmentEvent.eventId,
  };
  return { cCall, result, judgment, sourceCursor };
}

function replaceMappedJson(value, eventRefMap, valueRefMap) {
  if (typeof value === "string") {
    return eventRefMap.get(value) ?? valueRefMap.get(value) ?? value;
  }
  if (Array.isArray(value)) {
    return value.map((member) =>
      replaceMappedJson(member, eventRefMap, valueRefMap));
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, member]) => [
      key,
      replaceMappedJson(member, eventRefMap, valueRefMap),
    ]));
  }
  return value;
}

function rehashMappedPayload(
  execution,
  originalPayload,
  payload,
  valueRefMap,
  refKey,
  digestKey,
  refPrefix,
) {
  const body = structuredClone(payload);
  delete body[refKey];
  delete body[digestKey];
  const digest = execution.environment.product.sha256Canonical(body);
  const ref = `${refPrefix}${digest.slice("sha256:".length)}`;
  valueRefMap.set(originalPayload[refKey], ref);
  valueRefMap.set(originalPayload[digestKey], digest);
  return { [refKey]: ref, [digestKey]: digest, ...body };
}

function rehashFanOutCompletionPayload(
  execution,
  originalPayload,
  mappedPayload,
  valueRefMap,
) {
  const taskRows = mappedPayload.taskRows.map((row) => {
    const outputMemberDigest = execution.environment.product.sha256Canonical({
      applicationInputMemberRef: row.inputMemberRef,
      ordinal: row.ordinal,
      resultRef: row.resultRef,
      resultDigest: row.resultDigest,
      value: row.value,
    });
    return {
      ...row,
      outputMemberRef:
        `fan-out-output-member://abiogenesis/${
          outputMemberDigest.slice("sha256:".length)
        }`,
      outputMemberDigest,
    };
  });
  const outputVector = {
    kind: "gtl_fan_out_vector",
    schemaVersion: "5.0.0",
    applicationRef: mappedPayload.applicationRef,
    members: taskRows.map((row) => ({
      ordinal: row.ordinal,
      inputMemberRef: row.inputMemberRef,
      outputMemberRef: row.outputMemberRef,
      value: row.value,
    })),
  };
  const outputVectorDigest = execution.environment.product.sha256Canonical(
    outputVector,
  );
  const body = {
    ...mappedPayload,
    taskRows,
    outputVectorRef:
      `graph-vector-value://abiogenesis/${
        outputVectorDigest.slice("sha256:".length)
      }`,
    outputVectorDigest,
    outputVector,
  };
  delete body.completionRef;
  delete body.completionDigest;
  const completionDigest = execution.environment.product.sha256Canonical(body);
  const completionRef =
    `fan-out-completion://abiogenesis/${
      completionDigest.slice("sha256:".length)
    }`;
  valueRefMap.set(originalPayload.completionRef, completionRef);
  valueRefMap.set(originalPayload.completionDigest, completionDigest);
  return { completionRef, completionDigest, ...body };
}

async function forgeAlienFanOutProgramLocus(execution, completionEvent) {
  const api = await eventStoreApi(execution);
  const firstRow = completionEvent.payload.taskRows[0];
  const targetOpened = execution.events.find((event) =>
    event.kind === "c_call_opened" &&
    event.aggregateId === firstRow.cCallRef);
  assert.ok(targetOpened);
  const alienProgramLocusRef =
    `workflow-locus://abiogenesis/${"f".repeat(64)}`;
  assert.notEqual(alienProgramLocusRef,
    targetOpened.payload.programLocusRef);
  const forgedStore = new api.AbgEventStore();
  const durablePath = join(
    execution.environment.scratch,
    "t287-r6-alien-fan-out-program-locus.events.jsonl",
  );
  forgedStore.configureDurableLog(durablePath);
  for (const event of execution.events.slice(
    0,
    targetOpened.admissionOrdinal - 1,
  )) {
    const admitted = api.admitRuntimeEvent(forgedStore, eventCandidate(event));
    assert.equal(admitted.eventId, event.eventId);
  }
  const eventRefMap = new Map();
  const valueRefMap = new Map();
  let forgedCompletionEvent;
  for (const original of execution.events.slice(
    targetOpened.admissionOrdinal - 1,
    completionEvent.admissionOrdinal,
  )) {
    let payload = replaceMappedJson(
      original.payload,
      eventRefMap,
      valueRefMap,
    );
    if (original.eventId === targetOpened.eventId) {
      payload.programLocusRef = alienProgramLocusRef;
      const cCallIdentity = {
        basisId: payload.basisId,
        graphCallId: payload.graphCallId,
        frameId: payload.frameId,
        vectorIndex: payload.vectorIndex,
        stageRole: payload.stageRole,
        taskOrdinal: payload.taskOrdinal,
        attempt: payload.attempt,
        programLocusRef: payload.programLocusRef,
        retryPath: payload.retryPath,
        childGraphFunctionRef: payload.childGraphFunctionRef,
        failureContractRef: payload.failureContractRef,
      };
      const cCallDigest = execution.environment.product.sha256Canonical(
        cCallIdentity,
      );
      const cCallRef = `c-call:${cCallDigest}`;
      valueRefMap.set(original.payload.cCallRef, cCallRef);
      valueRefMap.set(original.payload.cCallDigest, cCallDigest);
      payload.cCallRef = cCallRef;
      payload.cCallDigest = cCallDigest;
    } else if (original.kind === "child_foldback_admitted") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "foldbackRef",
        "foldbackDigest",
        "child-foldback://abiogenesis/",
      );
    } else if (original.kind === "c_call_evidenced") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "evidenceRef",
        "evidenceDigest",
        "evidence://abiogenesis/",
      );
    } else if (original.kind === "c_call_result_admitted") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "resultRef",
        "resultDigest",
        "result://abiogenesis/",
      );
    } else if (original.kind === "c_call_judged") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "judgmentRef",
        "judgmentDigest",
        "judgment://abiogenesis/",
      );
    } else if (original.kind === "traversal_route_admitted") {
      payload = rehashMappedPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
        "routeRef",
        "routeDigest",
        "traversal-route://abiogenesis/",
      );
    } else if (original.kind === "fan_out_completion_admitted") {
      payload = rehashFanOutCompletionPayload(
        execution,
        original.payload,
        payload,
        valueRefMap,
      );
    }
    const admitted = api.admitRuntimeEvent(forgedStore, eventCandidate(
      original,
      {
        aggregateId:
          valueRefMap.get(original.aggregateId) ?? original.aggregateId,
        parentAggregateId:
          valueRefMap.get(original.parentAggregateId) ??
          original.parentAggregateId,
        causationEventRefs: original.causationEventRefs.map((eventRef) =>
          eventRefMap.get(eventRef) ?? eventRef),
        payload,
      },
    ));
    eventRefMap.set(original.eventId, admitted.eventId);
    if (original.eventId === completionEvent.eventId) {
      forgedCompletionEvent = admitted;
    }
  }
  assert.ok(forgedCompletionEvent);
  return {
    alienProgramLocusRef,
    durablePath,
    forgedCompletionEvent,
    forgedStore,
  };
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

test("T-287 R6 nested retry fan-out complete vector exits both depths with its exact final outcome", async (context) => {
  const execution = await executeTestGraph(context, retryFanOutPublication);
  const { completed } = assertNestedSuccessfulRetryExit(
    execution,
    "fan_out_success",
  );
  const witness = execution.events.find((event) =>
    event.eventId === completed[0].payload.completionWitnessEventRef);
  assert.equal(witness?.kind, "fan_out_completion_admitted");
  assert.equal(witness.payload.completionKind, "complete_vector");
  const finalRow = witness.payload.taskRows.at(-1);
  assert.deepEqual(
    completed.map((event) => [
      event.payload.cCallRef,
      event.payload.resultRef,
      event.payload.judgmentRef,
    ]),
    completed.map(() => [
      finalRow.cCallRef,
      finalRow.resultRef,
      finalRow.judgmentRef,
    ]),
    "every exited depth retains the exact final fan-out CCall outcome",
  );
});

test("T-287 R6 successful nested fan-out reopens with byte-identical history and projections", async (context) => {
  let durablePath;
  const execution = await executeTestGraph(
    context,
    retryFanOutPublication,
    {
      prepareStore({ environment }) {
        durablePath = join(
          environment.scratch,
          "t287-r6-fan-out-reopen.events.jsonl",
        );
        environment.store.configureDurableLog(durablePath);
      },
    },
  );
  assertNestedSuccessfulRetryExit(execution, "fan_out_success");
  const completionEvent = exactFanOutCompletionEvent(execution);
  const authority = exactFanOutProjectionAuthority(execution, completionEvent);
  const projector = await exactFanOutProjector(execution);
  const beforeEvents = execution.environment.store.readAll();
  const beforePrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(beforeEvents);
  const beforeCompletion = projector.projectExactFanOutCompletion(
    beforePrefix,
    {
      mode: "graph_bound",
      admissionEventRef: completionEvent.eventId,
      authority,
    },
  );
  assert.equal(beforeCompletion?.completionRef,
    completionEvent.payload.completionRef);
  const progressEvents = execution.events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "completed" &&
    event.payload.completionClass === "fan_out_success");
  const beforeProgress = progressEvents.map((event) =>
    execution.environment.abg.projectAdmittedRetryProgress(
      beforePrefix,
      event.eventId,
    ));
  assert.ok(beforeProgress.every(Boolean));
  const exactBytes = readFileSync(durablePath, "utf8");
  const reopenAuthority = execution.environment.store
    .projectReopenAuthorityAndClose();
  const reopened = execution.environment.abg.reopenEventStore(reopenAuthority);
  assert.equal(reopened.kind, "reopened_event_store_context",
    JSON.stringify(reopened));
  assert.equal(readFileSync(durablePath, "utf8"), exactBytes,
    "close and reopen do not rewrite one history byte");
  assert.deepEqual(reopened.store.readAll(), beforeEvents,
    "durable reopen reconstructs the exact event prefix");
  const reopenedPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(reopened.store.readAll());
  const reopenedCompletion = projector.projectExactFanOutCompletion(
    reopenedPrefix,
    {
      mode: "graph_bound",
      admissionEventRef: completionEvent.eventId,
      authority,
    },
  );
  assert.deepEqual(reopenedCompletion, beforeCompletion,
    "graph-bound completion projection is identical after reopen");
  assert.deepEqual(
    progressEvents.map((event) =>
      execution.environment.abg.projectAdmittedRetryProgress(
        reopenedPrefix,
        event.eventId,
      )),
    beforeProgress,
    "retry completion projections are identical after reopen",
  );
  reopened.store.closeDurableLog();
});

test("T-287 R6 stale fan-out carrier is refused by the effectful retry owner with zero durable suffix", async (context) => {
  const execution = await executeTestGraph(context, retryFanOutPublication);
  assertNestedSuccessfulRetryExit(execution, "fan_out_success");
  const completionEvent = exactFanOutCompletionEvent(execution);
  const projector = await exactFanOutProjector(execution);
  const fullPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(execution.events);
  const laterCompletion = projector.projectExactFanOutCompletion(fullPrefix, {
    mode: "graph_bound",
    admissionEventRef: completionEvent.eventId,
    authority: exactFanOutProjectionAuthority(execution, completionEvent),
  });
  assert.equal(laterCompletion?.kind, "fan_out_completion_admission");
  const api = await eventStoreApi(execution);
  const staleStore = new api.AbgEventStore();
  const durablePath = join(
    execution.environment.scratch,
    "t287-r6-stale-fan-out-carrier.events.jsonl",
  );
  staleStore.configureDurableLog(durablePath);
  const staleEvents = execution.events.slice(
    0,
    completionEvent.admissionOrdinal - 1,
  );
  for (const event of staleEvents) {
    const admitted = api.admitRuntimeEvent(staleStore, eventCandidate(event));
    assert.equal(admitted.eventId, event.eventId);
  }
  const stalePrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(staleStore.readAll());
  assert.equal(projector.projectExactFanOutCompletion(stalePrefix, {
    mode: "graph_bound",
    admissionEventRef: laterCompletion.admissionEventRef,
    authority: exactFanOutProjectionAuthority(execution, completionEvent),
  }), null, "Prefix A cannot project the later Prefix B completion carrier");
  const outcome = await admittedFinalFanOutOutcome(
    execution,
    staleStore,
    completionEvent,
  );
  const targetCursor = fanOutContinuationCursor(
    execution,
    outcome.sourceCursor,
    laterCompletion,
  );
  const beforeEvents = staleStore.readAll();
  const beforeDigest = staleStore.digest();
  const beforeBytes = readFileSync(durablePath, "utf8");
  const retry = await retryApi(execution);
  const refusal = retry.admitCompletedRetryProgress(
    staleStore,
    execution.graph,
    outcome.sourceCursor,
    targetCursor,
    {
      completionClass: "fan_out_success",
      cCall: outcome.cCall,
      result: outcome.result,
      judgment: outcome.judgment,
      completion: laterCompletion,
    },
    {
      eventTime: "2026-08-07T00:00:01.000Z",
      correlationId: "correlation://t287/r6/stale-fan-out-carrier",
      causationEventRefs: [],
    },
  );
  assert.equal(refusal.kind, "retry_admission_refusal",
    JSON.stringify(refusal));
  assert.equal(refusal.code, "attempt_mismatch");
  assert.deepEqual(staleStore.readAll(), beforeEvents,
    "the effectful retry owner appends no in-memory suffix");
  assert.equal(staleStore.digest(), beforeDigest);
  assert.equal(readFileSync(durablePath, "utf8"), beforeBytes,
    "the effectful retry owner appends no durable bytes");
  staleStore.closeDurableLog();
});

test("T-287 R6 fully rehashed non-final fan-out provenance forgery cannot project progress or route", async (context) => {
  const execution = await executeTestGraph(context, retryFanOutPublication);
  assertNestedSuccessfulRetryExit(execution, "fan_out_success");
  const { abg, product } = execution.environment;
  const eventStoreApi = await import(pathToFileURL(join(
    execution.environment.installedRoot,
    "build/code/src/abg/event_store.js",
  )).href);
  const projector = await exactFanOutProjector(execution);
  const completionEvent = exactFanOutCompletionEvent(execution);
  const authority = exactFanOutProjectionAuthority(execution, completionEvent);
  const forgedStore = new eventStoreApi.AbgEventStore();
  for (const event of execution.events.slice(
    0,
    completionEvent.admissionOrdinal - 1,
  )) {
    const admitted = eventStoreApi.admitRuntimeEvent(
      forgedStore,
      eventCandidate(event),
    );
    assert.equal(admitted.eventId, event.eventId);
  }

  const completionBody = structuredClone(completionEvent.payload);
  delete completionBody.completionRef;
  delete completionBody.completionDigest;
  assert.ok(completionBody.taskRows.length > 1);
  assert.notEqual(
    completionBody.taskRows[0].foldbackEventRef,
    completionBody.taskRows[1].foldbackEventRef,
  );
  completionBody.taskRows[0].foldbackEventRef =
    completionBody.taskRows[1].foldbackEventRef;
  const forgedCompletionDigest = product.sha256Canonical(completionBody);
  const forgedCompletion = eventStoreApi.admitRuntimeEvent(forgedStore, eventCandidate(
    completionEvent,
    {
      payload: {
        completionRef:
          `fan-out-completion://abiogenesis/${
            forgedCompletionDigest.slice("sha256:".length)
          }`,
        completionDigest: forgedCompletionDigest,
        ...completionBody,
      },
    },
  ));

  const originalProgresses = execution.events.filter((event) =>
    event.kind === "retry_progress_recorded" &&
    event.payload.progressClass === "completed" &&
    event.payload.completionClass === "fan_out_success");
  assert.equal(originalProgresses.length, 2);
  const eventRefMap = new Map([
    [completionEvent.eventId, forgedCompletion.eventId],
  ]);
  const progressRefMap = new Map();
  const forgedProgresses = [];
  for (const original of originalProgresses) {
    const body = structuredClone(original.payload);
    delete body.progressRef;
    delete body.progressDigest;
    body.completionWitnessEventRef = forgedCompletion.eventId;
    if (body.predecessorProgressRef !== null) {
      body.predecessorProgressRef = progressRefMap.get(
        body.predecessorProgressRef,
      );
      assert.ok(body.predecessorProgressRef);
    }
    const progressDigest = product.sha256Canonical(body);
    const progressRef =
      `retry-progress://abiogenesis/${progressDigest.slice("sha256:".length)}`;
    const admitted = eventStoreApi.admitRuntimeEvent(forgedStore, eventCandidate(
      original,
      {
        causationEventRefs: original.causationEventRefs.map((eventRef) =>
          eventRefMap.get(eventRef) ?? eventRef),
        payload: { progressRef, progressDigest, ...body },
      },
    ));
    eventRefMap.set(original.eventId, admitted.eventId);
    progressRefMap.set(original.payload.progressRef, progressRef);
    forgedProgresses.push(admitted);
  }
  const originalRoute = execution.events.find((event) =>
    event.kind === "traversal_route_admitted" &&
    originalProgresses.every((progress) =>
      event.payload.consumedAvailabilityRefs.includes(
        progress.payload.progressRef,
      )));
  assert.ok(originalRoute);
  const routeBody = structuredClone(originalRoute.payload);
  delete routeBody.routeRef;
  delete routeBody.routeDigest;
  routeBody.consumedAvailabilityRefs = routeBody.consumedAvailabilityRefs.map(
    (ref) => progressRefMap.get(ref) ?? ref,
  );
  const routeDigest = product.sha256Canonical(routeBody);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  const forgedRoute = eventStoreApi.admitRuntimeEvent(forgedStore, eventCandidate(
    originalRoute,
    {
      causationEventRefs: originalRoute.causationEventRefs.map((eventRef) =>
        eventRefMap.get(eventRef) ?? eventRef),
      payload: { routeRef, routeDigest, ...routeBody },
    },
  ));
  const forgedPrefix = abg.selectValidatedRuntimeEventPrefix(
    forgedStore.readAll(),
  );
  assert.equal(projector.projectExactFanOutCompletion(forgedPrefix, {
    mode: "graph_bound",
    admissionEventRef: forgedCompletion.eventId,
    authority,
  }), null, "the rehashed carrier cannot replace exact row provenance");
  for (const progress of forgedProgresses) {
    assert.equal(abg.projectAdmittedRetryProgress(
      forgedPrefix,
      progress.eventId,
    ), null, "forged completion truth cannot project retry progress");
  }
  assert.throws(
    () => abg.projectAdmittedRecursionRoute(forgedStore, {
      runId: forgedRoute.runId,
      routeRef,
    }),
    /invalid fan-out completion truth/u,
    "a route over the forged completion and progress chain cannot project",
  );
});

test("T-287 R6 fully rehashed alien fan-out program locus is refused by graph-bound retry and route owners", async (context) => {
  const execution = await executeTestGraph(context, retryFanOutPublication);
  assertNestedSuccessfulRetryExit(execution, "fan_out_success");
  const completionEvent = exactFanOutCompletionEvent(execution);
  const authority = exactFanOutProjectionAuthority(execution, completionEvent);
  const projector = await exactFanOutProjector(execution);
  const forged = await forgeAlienFanOutProgramLocus(
    execution,
    completionEvent,
  );
  const forgedPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(forged.forgedStore.readAll());
  const eventCanonical = projector.projectExactFanOutCompletion(
    forgedPrefix,
    {
      mode: "event_canonical",
      admissionEventRef: forged.forgedCompletionEvent.eventId,
    },
  );
  assert.equal(eventCanonical?.kind, "fan_out_completion_admission",
    "the fully rehashed event carrier is internally canonical");
  assert.equal(projector.projectExactFanOutCompletion(forgedPrefix, {
    mode: "graph_bound",
    admissionEventRef: forged.forgedCompletionEvent.eventId,
    authority,
  }), null,
  "the alien workflow locus cannot join the materialized GTL Program");

  const outcome = await admittedFinalFanOutOutcome(
    execution,
    forged.forgedStore,
    forged.forgedCompletionEvent,
  );
  const targetCursor = fanOutContinuationCursor(
    execution,
    outcome.sourceCursor,
    eventCanonical,
  );
  const retry = await retryApi(execution);
  const beforeRetryEvents = forged.forgedStore.readAll();
  const beforeRetryDigest = forged.forgedStore.digest();
  const beforeRetryBytes = readFileSync(forged.durablePath, "utf8");
  const retryRefusal = retry.admitCompletedRetryProgress(
    forged.forgedStore,
    execution.graph,
    outcome.sourceCursor,
    targetCursor,
    {
      completionClass: "fan_out_success",
      cCall: outcome.cCall,
      result: outcome.result,
      judgment: outcome.judgment,
      completion: eventCanonical,
    },
    {
      eventTime: "2026-08-07T00:00:02.000Z",
      correlationId: "correlation://t287/r6/alien-locus/retry",
      causationEventRefs: [],
    },
  );
  assert.equal(retryRefusal.kind, "retry_admission_refusal",
    JSON.stringify(retryRefusal));
  assert.equal(retryRefusal.code, "attempt_mismatch");
  assert.deepEqual(forged.forgedStore.readAll(), beforeRetryEvents);
  assert.equal(forged.forgedStore.digest(), beforeRetryDigest);
  assert.equal(readFileSync(forged.durablePath, "utf8"), beforeRetryBytes,
    "retry refusal appends no durable suffix");

  const replayState = execution.environment.abg.replay(
    forged.forgedStore,
    { runId: outcome.sourceCursor.runId },
  );
  const application = authority.application;
  const routeBody = {
    routeKind: "advance",
    declarationRef: execution.graph.materializationRef,
    declarationDigest: execution.graph.materializationDigest,
    sourceCursorRef: outcome.sourceCursor.cursorRef,
    sourceCursorDigest: outcome.sourceCursor.cursorDigest,
    targetCursorRef: targetCursor.cursorRef,
    targetCursorDigest: targetCursor.cursorDigest,
    cCallRef: outcome.cCall.cCallRef,
    judgmentRef: outcome.judgment.judgmentRef,
    consumedAvailabilityRefs: [
      outcome.judgment.judgmentRef,
      application.applicationRef,
    ],
    contractRef: outcome.cCall.transitionContractRef,
    replayStateDigest: replayState.replayDigest,
  };
  const candidateDigest = execution.environment.product.sha256Canonical(
    routeBody,
  );
  const routeCandidate = {
    kind: "traversal_route_candidate",
    schemaVersion: "5.0.0",
    candidateRef:
      `route-candidate://abiogenesis/${
        candidateDigest.slice("sha256:".length)
      }`,
    candidateDigest,
    ...routeBody,
  };
  const route = await traversalRouteApi(execution);
  const beforeRouteEvents = forged.forgedStore.readAll();
  const beforeRouteDigest = forged.forgedStore.digest();
  const beforeRouteBytes = readFileSync(forged.durablePath, "utf8");
  const routeRefusal = route.admitRoute(
    forged.forgedStore,
    execution.execution.executionBasis,
    execution.graph,
    outcome.sourceCursor,
    targetCursor,
    replayState,
    routeCandidate,
    {
      eventTime: "2026-08-07T00:00:03.000Z",
      correlationId: "correlation://t287/r6/alien-locus/route",
      causationEventRefs: [],
    },
    {
      cCall: outcome.cCall,
      result: outcome.result,
      judgment: outcome.judgment,
      application,
      completion: eventCanonical,
    },
  );
  assert.equal(routeRefusal.kind, "traversal_route_admission_refusal",
    JSON.stringify(routeRefusal));
  assert.equal(routeRefusal.code, "judgment_mismatch");
  assert.deepEqual(forged.forgedStore.readAll(), beforeRouteEvents);
  assert.equal(forged.forgedStore.digest(), beforeRouteDigest);
  assert.equal(readFileSync(forged.durablePath, "utf8"), beforeRouteBytes,
    "route refusal appends no durable suffix");
  forged.forgedStore.closeDurableLog();
});

test("T-287 R6 nested retry F_H resume exits both depths through one exact continuation provenance chain", async (context) => {
  const execution = await executeTestGraph(context, retryFhPublication);
  const { completed } = assertNestedSuccessfulRetryExit(
    execution,
    "fh_resume_success",
  );
  const resume = execution.events.find((event) =>
    event.eventId === completed[0].payload.completionWitnessEventRef);
  assert.equal(resume?.kind, "fh_interaction_resume_admitted");
  const opened = execution.events.find((event) =>
    event.kind === "fh_interaction_opened" &&
    event.aggregateId === resume.aggregateId);
  const responded = execution.events.find((event) =>
    event.kind === "fh_interaction_responded" &&
    event.aggregateId === resume.aggregateId);
  assert.ok(opened);
  assert.ok(responded);
  const respondOperation = execution.events.find((event) =>
    event.eventId === responded.payload.publicOperationEventRef);
  const continueOperation = execution.events.find((event) =>
    event.eventId === resume.payload.publicOperationEventRef);
  assert.equal(respondOperation?.payload.operationId,
    "abg.operation.interaction.respond");
  assert.equal(continueOperation?.payload.operationId,
    "abg.operation.run.continue");
  assert.deepEqual(
    [opened, responded, resume].map((event) => [
      event.parentAggregateId,
      event.runId,
      event.graphCallId,
      event.frameId,
      event.payload.continuationRef,
    ]),
    [opened, responded, resume].map(() => [
      opened.frameId,
      opened.runId,
      opened.graphCallId,
      opened.frameId,
      opened.aggregateId,
    ]),
    "opened, responded, and resumed rows share one exact frame envelope",
  );
  assert.equal(opened.basisId, opened.payload.executionBasisRef);
  assert.equal(responded.basisId, opened.aggregateId);
  assert.equal(resume.basisId, opened.aggregateId);
  assert.deepEqual(responded.causationEventRefs.slice(0, 2), [
    opened.eventId,
    respondOperation.eventId,
  ]);
  assert.deepEqual(resume.causationEventRefs.slice(0, 2), [
    responded.eventId,
    continueOperation.eventId,
  ]);
  const identity = {
    continuationKind: "fh_interaction",
    runId: opened.runId,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    cCallRef: opened.payload.cCallRef,
    heldCursorRef: opened.payload.heldCursorRef,
    heldCursorDigest: opened.payload.heldCursorDigest,
    requestRef: opened.payload.requestRef,
    requestDigest: opened.payload.requestDigest,
    actorCapabilityRef: opened.payload.actorCapabilityRef,
    responseContractRef: opened.payload.responseContractRef,
    executionBasisRef: opened.payload.executionBasisRef,
    constructionIntentRef: opened.payload.constructionIntentRef ?? null,
  };
  const continuationDigest = execution.environment.product.sha256Canonical(
    identity,
  );
  assert.equal(opened.payload.continuationDigest, continuationDigest);
  assert.equal(
    opened.aggregateId,
    `continuation://abiogenesis/${continuationDigest.slice("sha256:".length)}`,
  );

  const forged = await forgeEventAt(execution, resume.eventId, {
    parentAggregateId: "frame://t287/forged-cross-scope",
  });
  assert.throws(
    () => execution.environment.abg.replay(forged.forgedStore, {
      runId: opened.runId,
    }),
    /invalid resume truth/u,
    "contract-valid cross-frame resume truth is rejected by the owner projector",
  );
});

test("T-287 R6 nested structural identity exits both retry depths without fabricating CCall truth", async (context) => {
  const execution = await executeTestGraph(context, retryIdentityPublication);
  const { completed } = assertNestedSuccessfulRetryExit(
    execution,
    "structural_identity_success",
  );
  for (const progress of completed) {
    assert.deepEqual(
      Object.keys(progress.payload).filter((key) =>
        ["cCallRef", "resultRef", "judgmentRef"].includes(key)),
      [],
      "structural progress carries no fabricated CCall outcome",
    );
  }
  const witness = execution.events.find((event) =>
    event.eventId === completed[0].payload.completionWitnessEventRef);
  assert.ok(witness);
  assert.deepEqual(
    [
      witness.runId,
      witness.graphCallId,
      witness.frameId,
      witness.materializationRef,
    ],
    [
      completed[0].runId,
      completed[0].graphCallId,
      completed[0].frameId,
      completed[0].materializationRef,
    ],
  );

  const forged = await forgeEventAt(execution, completed[0].eventId, {
    materializationRef: "graph-materialization://t287/forged-cross-scope",
  });
  const forgedPrefix = execution.environment.abg
    .selectValidatedRuntimeEventPrefix(forged.forgedStore.readAll());
  assert.equal(
    execution.environment.abg.projectAdmittedRetryProgress(
      forgedPrefix,
      forged.admitted.eventId,
    ),
    null,
    "a cursor witness from another materialization cannot complete retry truth",
  );
});

test("T-287 R6 post-staging route refusal rolls back both nested progress rows in memory and durable reopen", async (context) => {
  let control;
  const execution = await executeTestGraph(
    context,
    retryFanOutPublication,
    {
      prepareStore({ environment }) {
        const path = join(
          environment.scratch,
          "t287-r6-retry-exit-rollback.events.jsonl",
        );
        environment.store.configureDurableLog(path);
        const nativeReadAll = environment.store.readAll.bind(environment.store);
        control = {
          environment,
          injected: false,
          path,
          stagedEventRefs: [],
          stagedProgressRefs: [],
          durableProgressAtInjection: [],
          nativeReadAll,
        };
        Object.defineProperty(environment.store, "readAll", {
          configurable: true,
          value() {
            const events = nativeReadAll();
            const staged = events.filter((event) =>
              event.kind === "retry_progress_recorded" &&
              event.payload.progressClass === "completed" &&
              event.payload.completionClass === "fan_out_success");
            if (!control.injected && staged.length >= 2) {
              control.injected = true;
              control.stagedEventRefs = staged.map((event) => event.eventId);
              control.stagedProgressRefs = staged.map((event) =>
                event.payload.progressRef);
              control.durableProgressAtInjection = durableEvents(path).filter(
                (event) => event.kind === "retry_progress_recorded" &&
                  event.payload.progressClass === "completed",
              );
              return Object.freeze(events.filter((event) =>
                !control.stagedEventRefs.includes(event.eventId)));
            }
            return events;
          },
        });
      },
    },
  );
  assert.equal(control.injected, true,
    "the falsifier intervenes only after both progress rows are staged");
  assert.equal(control.stagedProgressRefs.length, 2);
  assert.deepEqual(control.durableProgressAtInjection, [],
    "uncommitted transaction rows never reach the durable log");
  assert.equal(execution.completion.disposition, "failed");
  const inMemory = control.nativeReadAll();
  assert.equal(inMemory.some((event) =>
    control.stagedEventRefs.includes(event.eventId)), false);
  assert.equal(inMemory.some((event) =>
    event.kind === "traversal_route_admitted" &&
    control.stagedProgressRefs.some((ref) =>
      event.payload.consumedAvailabilityRefs.includes(ref))), false);

  const authority = control.environment.store.projectReopenAuthorityAndClose();
  const reopened = control.environment.abg.reopenEventStore(authority);
  assert.equal(reopened.kind, "reopened_event_store_context",
    JSON.stringify(reopened));
  const durable = reopened.store.readAll();
  assert.equal(durable.some((event) =>
    control.stagedEventRefs.includes(event.eventId)), false);
  assert.equal(durable.some((event) =>
    event.kind === "traversal_route_admitted" &&
    control.stagedProgressRefs.some((ref) =>
      event.payload.consumedAvailabilityRefs.includes(ref))), false);
  reopened.store.closeDurableLog();
});
