import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import {
  importInstalledPackageExport,
  runInstalledCli,
} from "../support/root-cli-environment.mjs";
import { setupInstalledRootCatalog } from "../support/root-installed-environment.mjs";
import { runAxPfcF08 } from "./pfc-f08-lane.mjs";

const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;

const PROJECT_READ_KEYS = Object.freeze([
  "catalog_list",
  "catalog_describe",
  "workspace_status",
  "run_status",
  "graph_call_status",
  "run_result",
  "graph_call_result",
  "run_evidence",
  "graph_call_evidence",
  "result_evidence",
  "assessment_evidence",
  "witness_evidence",
  "install_evidence",
  "release_evidence",
  "workspace_replay",
  "run_replay",
  "graph_call_replay",
  "interaction_replay",
  "continuation_replay",
  "c_call_replay",
  "workspace_gaps",
  "run_gaps",
  "run_lawful_actions",
  "ticket_consensus",
]);

const EXACT_FAMILY = Object.freeze({
  "abg.operation.workspace.create": Object.freeze(["clean", "imported"]),
  "abg.operation.workspace.open": Object.freeze(["open"]),
  "abg.operation.project.read": PROJECT_READ_KEYS,
  "abg.operation.product.verify": Object.freeze(["verify"]),
  "abg.operation.product.resolve": Object.freeze(["resolve"]),
  "abg.operation.product.install": Object.freeze(["install"]),
  "abg.operation.workspace.bind": Object.freeze(["bind"]),
  "abg.operation.catalog.admit": Object.freeze(["admit"]),
  "abg.operation.catalog.view": Object.freeze(["allowlist"]),
  "abg.operation.catalog.apply": Object.freeze(["node_type", "overlay"]),
  "abg.operation.run.invoke": Object.freeze(["invoke", "start"]),
  "abg.operation.run.continue": Object.freeze([
    "current_intent",
    "selected_action",
  ]),
  "abg.operation.interaction.respond": Object.freeze([
    "select",
    "approve",
    "reject",
    "assess",
    "answer_escalation",
  ]),
  "abg.operation.result.assess": Object.freeze(["assess"]),
  "abg.operation.witness.admit": Object.freeze([
    "reprice",
    "attest",
    "hygiene-stamp",
    "intake",
    "run-resumed",
    "run-stopped",
  ]),
  "abg.operation.conformance.evaluate": Object.freeze(["gtl_program"]),
  "abg.operation.product.materialize": Object.freeze([
    "context_bootstrap",
    "configuration",
  ]),
  "abg.operation.release.snapshot": Object.freeze([
    "published_rc",
    "tapped_release",
  ]),
});

function sha256Bytes(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function canonicalize(value) {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function canonicalDigest(value) {
  return sha256Bytes(canonicalJson(value));
}

function jsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function relation(record) {
  return {
    disposition: "confirmed_red",
    ...record,
  };
}

function familyRows(family = EXACT_FAMILY) {
  return Object.entries(family).flatMap(([operationId, definitionKeys]) =>
    definitionKeys.map((definitionKey) => ({ operationId, definitionKey })),
  );
}

function constructFamilyMutation(rows, mutation) {
  const coordinateKey = (row) =>
    `${row.operationId}\0${row.definitionKey}`;
  switch (mutation.mutationKind) {
    case "remove":
      return rows.filter(
        (row) => coordinateKey(row) !== coordinateKey(mutation.coordinate),
      );
    case "add":
    case "duplicate":
      return [...rows, mutation.coordinate];
    case "mis_slot":
      return rows.map((row) =>
        row.operationId === mutation.coordinate.fromOperationId &&
          row.definitionKey === mutation.coordinate.definitionKey
          ? {
              operationId: mutation.coordinate.toOperationId,
              definitionKey: row.definitionKey,
            }
          : row
      );
    default:
      throw new TypeError(`unknown AX-F03 mutation ${mutation.mutationKind}`);
  }
}

function requireRawAdmission(validator, value, subjectKind, contractRef) {
  const admitted = validator.rawAdmitValue(value, subjectKind, contractRef);
  assert.equal(admitted.kind, "raw_admitted_value", JSON.stringify(admitted));
  return admitted;
}

function rawProgramInput(
  validator,
  publicationAdmission,
  program,
  graphFunctions,
) {
  const publication = publicationAdmission.value;
  return {
    publication: publicationAdmission,
    program: requireRawAdmission(
      validator,
      program,
      "gtl_program",
      "contract://abiogenesis/gtl/program@5",
    ),
    graphFunctions: graphFunctions.map((value) =>
      requireRawAdmission(
        validator,
        value,
        "graph_function",
        "contract://abiogenesis/gtl/graph-function@5",
      )),
    contracts: publication.contracts.map((value) =>
      requireRawAdmission(
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

function publicOperationBasis(
  product,
  operationId,
  authorityScopeRef,
  authorityScopeDigest,
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
    authorityScopeRef,
    authorityScopeDigest,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      invocationRef,
      operationId,
      payloadDigest: invocationPayloadDigest,
    }),
    correlationId: "correlation://increment-0a/contract-runtime",
    eventTime: "2026-07-31T00:00:00.000Z",
    causationEventRefs,
  };
}

function runtimeBasis(label) {
  return {
    eventTime: "2026-07-31T00:00:00.000Z",
    correlationId: `correlation://increment-0a/${label}`,
    causationEventRefs: [],
  };
}

function productInstallCandidate(admittedInstall) {
  const {
    kind: _kind,
    disposition: _disposition,
    admissionEventRef: _admissionEventRef,
    ...body
  } = admittedInstall;
  return {
    kind: "product_install_candidate",
    disposition: "materialized",
    ...body,
  };
}

function constructRuntimeBaseline(environment, label, allowlist) {
  const { abg, product } = environment;
  const store = new abg.AbgEventStore();
  const installCandidate = productInstallCandidate(environment.admittedInstall);
  const admittedInstall = abg.admitProductInstall(
    store,
    installCandidate,
    publicOperationBasis(
      product,
      "abg.operation.product.install",
      installCandidate.installId,
      installCandidate.productContentDigest,
      `invocation://increment-0a/${label}/product-install`,
    ),
  );
  assert.equal(admittedInstall.kind, "product_install", JSON.stringify(admittedInstall));
  const productSet = product.constructProductSet([admittedInstall], environment.lock);
  assert.equal(productSet.kind, "product_set", JSON.stringify(productSet));
  const bindingCandidate = product.constructWorkspaceBinding(
    environment.workspaceAuthority,
    productSet,
    environment.lock,
    environment.workspaceBinding.roots,
  );
  assert.equal(
    bindingCandidate.kind,
    "workspace_binding_candidate",
    JSON.stringify(bindingCandidate),
  );
  const workspaceBinding = abg.admitWorkspaceBinding(
    store,
    bindingCandidate,
    publicOperationBasis(
      product,
      "abg.operation.workspace.bind",
      bindingCandidate.bindingId,
      bindingCandidate.bindingDigest,
      `invocation://increment-0a/${label}/workspace-bind`,
      [admittedInstall.admissionEventRef],
    ),
  );
  assert.equal(
    workspaceBinding.kind,
    "workspace_binding",
    JSON.stringify(workspaceBinding),
  );
  const catalog = product.buildGraphFunctionCatalog([environment.publication]);
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  const catalogView = product.narrowGraphFunctionCatalog(catalog, allowlist);
  assert.equal(catalogView.kind, "graph_function_catalog_view", JSON.stringify(catalogView));
  return {
    store,
    admittedInstall,
    productSet,
    workspaceBinding,
    catalog,
    catalogView,
  };
}

async function loadPackagedImplementations(environment) {
  const modules = await Promise.all(
    [...new Set(
      environment.publication.implementationBindings.map(
        (binding) => binding.modulePath,
      ),
    )].map((modulePath) =>
      import(
        `${pathToFileURL(join(environment.installedRoot, modulePath)).href}?increment-0a=contract-runtime`
      )
    ),
  );
  const descriptors = modules.flatMap((module) =>
    Object.values(module).filter(environment.product.isPackagedLeafImplementationDescriptor)
  );
  assert.equal(descriptors.length > 0, true);
  return descriptors;
}

async function openRuntimePrefix({
  environment,
  label,
  publication,
  program,
  graphFunction,
  programValidation,
  packagedImplementations,
}) {
  const { abg, gtl, product, validator } = environment;
  const baseline = constructRuntimeBaseline(
    environment,
    label,
    [...new Set(program.callableMembership)].sort(),
  );
  const input = gtl.constructHelloWorldInput("Permutation");
  const rawInput = requireRawAdmission(
    validator,
    input,
    "invocation_input",
    graphFunction.inputs[0],
  );
  const invocationRef = `invocation://increment-0a/${label}/run`;
  const rawRequest = requireRawAdmission(
    validator,
    {
      kind: "public_invocation",
      schemaVersion: "5.0.0",
      operationId: "abg.operation.run.invoke",
      variant: "direct",
      invocationRef,
      eventTime: "2026-07-31T00:00:00.000Z",
      correlationId: `correlation://increment-0a/${label}/run`,
      payload: {
        programRef: program.programRef,
        graphFunctionRef: graphFunction.name,
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const policy = product.constructRootInvocationPolicy(
    baseline.workspaceBinding,
    program,
    [],
  );
  const actorRef = "actor://abiogenesis/t286/trusted-developer";
  const grant = product.constructCapabilityGrant(policy, actorRef);
  const authority = product.constructInvocationAuthority(
    actorRef,
    baseline.workspaceBinding,
    baseline.catalogView,
    program.programRef,
    graphFunction.name,
    policy,
    [grant],
  );
  assert.equal(authority.kind, "invocation_authority", JSON.stringify(authority));
  const invocation = product.constructDirectInvocation(
    baseline.workspaceBinding,
    baseline.catalogView,
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
  const invocationAdmission = abg.admitInvocation(
    baseline.store,
    {
      invocation,
      rawRequest,
      rawInput,
      modulePublication: publication,
      program,
      graphFunction,
      programValidation,
      workspaceBinding: baseline.workspaceBinding,
      catalogView: baseline.catalogView,
      policy,
      capabilityGrants: [grant],
      authority,
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      baseline.workspaceBinding.bindingId,
      baseline.workspaceBinding.bindingDigest,
      invocation.invocationRef,
      [baseline.workspaceBinding.admissionEventRef],
    ),
  );
  assert.equal(
    invocationAdmission.kind,
    "invocation_admission",
    JSON.stringify(invocationAdmission),
  );
  const materializationBasis = {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
    admittedInput: rawInput.value,
  };
  const graph = gtl.materializeGraph(graphFunction, materializationBasis);
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    materializationBasis,
  );
  assert.equal(
    graphValidation.kind,
    "graph_validation",
    JSON.stringify(graphValidation),
  );
  const resolutionSetCandidate = product.resolveImplementationSet(
    baseline.catalogView,
    publication,
    programValidation,
    packagedImplementations,
  );
  assert.equal(
    resolutionSetCandidate.kind,
    "implementation_resolution_set_candidate",
    JSON.stringify(resolutionSetCandidate),
  );
  const resolutionSetValidation =
    validator.validateImplementationResolutionSet(
      resolutionSetCandidate,
      baseline.catalogView,
      publication,
      programValidation,
      packagedImplementations,
    );
  assert.equal(
    resolutionSetValidation.kind,
    "implementation_resolution_set_validation",
    JSON.stringify(resolutionSetValidation),
  );
  const closureContract = publication.closureContracts.find(
    (candidate) => candidate.closureContractRef === program.closureContractRef,
  );
  assert.notEqual(closureContract, undefined);
  const executionAdmission = abg.admitExecutionBasis(
    baseline.store,
    {
      invocationAdmission,
      program,
      programValidation,
      graph,
      graphValidation,
      resolutionSetCandidate,
      resolutionSetValidation,
      closureContract,
    },
    runtimeBasis(`${label}/execution-basis`),
  );
  assert.equal(
    executionAdmission.kind,
    "execution_basis_admission",
    JSON.stringify(executionAdmission),
  );
  const opened = abg.openCall(
    baseline.store,
    executionAdmission.executionBasis,
    runtimeBasis(`${label}/open`),
  );
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
  return {
    ...baseline,
    input,
    rawInput,
    invocation,
    invocationAdmission,
    graph,
    graphValidation,
    resolutionSetCandidate,
    resolutionSetValidation,
    closureContract,
    executionAdmission,
    opened,
  };
}

async function runF03(harness) {
  const publicApi = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    "increment-0a=f03",
  );
  const exactRows = familyRows();
  assert.equal(Object.keys(EXACT_FAMILY).length, 18);
  assert.equal(exactRows.length, 56);
  assert.equal(
    new Set(exactRows.map((row) => `${row.operationId}\0${row.definitionKey}`))
      .size,
    56,
  );

  const liveDefinitions =
    publicApi.PUBLIC_OPERATION_SCHEMA?.$defs?.RootPublicInvocation?.oneOf ?? [];
  const liveCoordinates = liveDefinitions.map((definition) => ({
    operationId: definition.properties.operationId.const,
    definitionKey: definition.properties.variant.const,
  }));
  const targetExportPresent = Object.hasOwn(
    publicApi,
    "PUBLIC_FUNCTION_DEFINITION_FAMILY",
  );
  assert.equal(targetExportPresent, false);
  assert.equal(publicApi.ROOT_PUBLIC_OPERATION_IDS.length, 11);
  assert.equal(liveCoordinates.length, 19);

  const mutations = [
    {
      caseId: "remove-definition",
      mutationKind: "remove",
      coordinate: {
        operationId: "abg.operation.workspace.create",
        definitionKey: "imported",
      },
      resultingRowCount: 55,
      finalOracle:
        "exact family-construction refusal identifies the missing coordinate before owner-port resolution",
    },
    {
      caseId: "add-definition",
      mutationKind: "add",
      coordinate: {
        operationId: "abg.operation.tuning.transition",
        definitionKey: "transition",
      },
      resultingRowCount: 57,
      finalOracle:
        "exact family-construction refusal identifies the unexpected 5.1 coordinate before owner-port resolution",
    },
    {
      caseId: "duplicate-definition",
      mutationKind: "duplicate",
      coordinate: {
        operationId: "abg.operation.product.verify",
        definitionKey: "verify",
      },
      resultingRowCount: 57,
      finalOracle:
        "exact family-construction refusal identifies the duplicate coordinate before owner-port resolution",
    },
    {
      caseId: "mis-slot-definition",
      mutationKind: "mis_slot",
      coordinate: {
        fromOperationId: "abg.operation.catalog.view",
        toOperationId: "abg.operation.catalog.apply",
        definitionKey: "allowlist",
      },
      resultingRowCount: 56,
      finalOracle:
        "exact family-construction refusal identifies the wrong operation slot before owner-port resolution",
    },
  ];
  const mutationObservations = mutations.map((entry) => {
    const rows = constructFamilyMutation(exactRows, entry);
    const uniqueCoordinateCount = new Set(
      rows.map((row) => `${row.operationId}\0${row.definitionKey}`),
    ).size;
    assert.equal(rows.length, entry.resultingRowCount);
    return {
      caseId: entry.caseId,
      rowCount: rows.length,
      uniqueCoordinateCount,
      fixtureDigest: canonicalDigest(rows),
    };
  });

  return relation({
    relationId: "AX-F03",
    claim: "the installed Public package lacks the exact intrinsic 18/56 family",
    ingress:
      "installed @abiogenesis/typescript-tenant/public export and generated RootPublicInvocation schema projection",
    processBoundary: "static installed-package load; no semantic owner call",
    fixtureSource: {
      authority:
        "accepted S06 closed family and project.read relation in the frozen Gate 1 design",
      operationCount: 18,
      definitionCount: 56,
      rosterDigest: canonicalDigest(exactRows),
    },
    mutation: mutations,
    oracle: {
      exactFixture:
        "one 18-operation/56-definition family succeeds before projection",
      mutations:
        "remove, add, duplicate, and mis-slot each refuse before owner-port resolution and retain their distinct immutable issue coordinate",
    },
    expectedBaselineSignature: {
      targetExportPresent: false,
      liveOperationCount: 11,
      liveDefinitionCount: 19,
    },
    observedSignature: {
      targetExportPresent,
      installedExports: Object.keys(publicApi).sort(),
      liveOperationCount: publicApi.ROOT_PUBLIC_OPERATION_IDS.length,
      liveDefinitionCount: liveCoordinates.length,
      liveCoordinateDigest: canonicalDigest(liveCoordinates),
      exactFixtureOperationCount: Object.keys(EXACT_FAMILY).length,
      exactFixtureDefinitionCount: exactRows.length,
      exactFixtureRosterDigest: canonicalDigest(exactRows),
      mutationObservations,
    },
    maskControls: [
      {
        control: "accepted exact fixture has 18 operations and 56 unique rows",
        passed:
          Object.keys(EXACT_FAMILY).length === 18 &&
          exactRows.length === 56 &&
          new Set(
            exactRows.map((row) =>
              `${row.operationId}\0${row.definitionKey}`
            ),
          ).size === 56,
      },
      {
        control:
          "missing selected export is recorded as the baseline defect, not treated as a fixture failure or filled by a test-side family",
        passed: targetExportPresent === false,
      },
      {
        control: "all four frozen mutation descriptors change exactly one relation",
        passed:
          mutations.length === 4 &&
          new Set(mutations.map((entry) => entry.mutationKind)).size === 4,
      },
    ],
    cases: mutations.map((entry) => ({
      caseId: entry.caseId,
      expected: {
        baseline: "PUBLIC_FUNCTION_DEFINITION_FAMILY export absent",
        finalOracle: entry.finalOracle,
      },
      observed: {
        targetExportPresent,
        liveOperationCount: publicApi.ROOT_PUBLIC_OPERATION_IDS.length,
        liveDefinitionCount: liveCoordinates.length,
        fixture: mutationObservations.find(
          (observation) => observation.caseId === entry.caseId,
        ),
      },
      passed:
        targetExportPresent === false &&
        publicApi.ROOT_PUBLIC_OPERATION_IDS.length === 11 &&
        liveCoordinates.length === 19,
    })),
  });
}

function cloneNode(node, nodeRef, programLocusRef, resultBearing) {
  const cloned = jsonClone(node);
  cloned.nodeRef = nodeRef;
  cloned.term.programLocusRef = programLocusRef;
  cloned.term.resultBearing = resultBearing;
  return cloned;
}

function topologyFixtures(gtl, baseGraphFunction) {
  const base = jsonClone(baseGraphFunction);
  const [startNode, terminalNode] = base.template.nodes;
  assert.notEqual(startNode, undefined);
  assert.notEqual(terminalNode, undefined);
  assert.equal(startNode.term.kind, "c_of");
  assert.equal(terminalNode.term.kind, "c_of");
  const startRef = startNode.nodeRef;
  const terminalRef = terminalNode.nodeRef;
  const thirdRef = "node://abiogenesis/falsifier/topology/third@5";
  const thirdNode = cloneNode(
    terminalNode,
    thirdRef,
    "locus://abiogenesis/falsifier/topology/third@5",
    true,
  );
  const duplicateTerminal = cloneNode(
    terminalNode,
    terminalRef,
    "locus://abiogenesis/falsifier/topology/duplicate-terminal@5",
    true,
  );
  const edge = (fromNodeRef, toNodeRef) =>
    jsonClone(gtl.graphEdge({ fromNodeRef, toNodeRef }));
  const mutate = (caseId, mutationKind, template) => ({
    caseId,
    mutationKind,
    graphFunction: {
      ...jsonClone(base),
      template: {
        ...jsonClone(base.template),
        applications: jsonClone(base.template.applications),
        ...template,
      },
    },
  });
  return [
    mutate("duplicate-node", "duplicate_node_identity", {
      nodes: [jsonClone(startNode), jsonClone(terminalNode), duplicateTerminal],
      edges: [edge(startRef, terminalRef)],
      startNodeRef: startRef,
      terminalNodeRefs: [terminalRef],
    }),
    mutate("empty-terminal-set", "empty_terminal_set", {
      nodes: [
        cloneNode(
          startNode,
          startRef,
          startNode.term.programLocusRef,
          false,
        ),
        cloneNode(
          terminalNode,
          terminalRef,
          terminalNode.term.programLocusRef,
          false,
        ),
      ],
      edges: [edge(startRef, terminalRef)],
      startNodeRef: startRef,
      terminalNodeRefs: [],
    }),
    mutate("terminal-outgoing-edge", "terminal_outgoing_edge", {
      nodes: [
        cloneNode(
          startNode,
          startRef,
          startNode.term.programLocusRef,
          true,
        ),
        jsonClone(terminalNode),
      ],
      edges: [edge(startRef, terminalRef)],
      startNodeRef: startRef,
      terminalNodeRefs: [startRef, terminalRef],
    }),
    mutate("zero-outdegree-nonterminal", "zero_outdegree_nonterminal", {
      nodes: [jsonClone(startNode), jsonClone(terminalNode)],
      edges: [],
      startNodeRef: startRef,
      terminalNodeRefs: [terminalRef],
    }),
    mutate("multi-outdegree-nonterminal", "multi_outdegree_nonterminal", {
      nodes: [jsonClone(startNode), jsonClone(terminalNode), thirdNode],
      edges: [edge(startRef, terminalRef), edge(startRef, thirdRef)],
      startNodeRef: startRef,
      terminalNodeRefs: [terminalRef, thirdRef],
    }),
    mutate("unreachable-terminal", "unreachable_terminal", {
      nodes: [jsonClone(startNode), jsonClone(terminalNode), thirdNode],
      edges: [edge(startRef, terminalRef)],
      startNodeRef: startRef,
      terminalNodeRefs: [terminalRef, thirdRef],
    }),
    mutate("undeclared-cycle", "undeclared_cycle", {
      nodes: [jsonClone(startNode), jsonClone(terminalNode)],
      edges: [edge(startRef, terminalRef), edge(terminalRef, startRef)],
      startNodeRef: startRef,
      terminalNodeRefs: [terminalRef],
    }),
  ];
}

function replaceGraphFunction(publication, graphFunction) {
  return {
    ...jsonClone(publication),
    graphFunctions: publication.graphFunctions.map((candidate) =>
      candidate.name === graphFunction.name
        ? jsonClone(graphFunction)
        : jsonClone(candidate)
    ),
  };
}

async function executeTopologyFixture(
  environment,
  fixture,
  program,
  validation,
  publication,
  packagedImplementations,
) {
  const runtime = await openRuntimePrefix({
    environment,
    label: `f05/${fixture.caseId}`,
    publication,
    program,
    graphFunction: fixture.graphFunction,
    programValidation: validation,
    packagedImplementations,
  });
  const semantics = await environment.product.loadInstalledProductSemantics({
    install: runtime.admittedInstall,
    publication,
    verifyInstallAdmission: (install) =>
      environment.abg.hasAdmittedProductInstall(runtime.store, install),
  });
  const leafPort =
    await environment.hogInstalledProduct.bindInstalledLeafInvocationPort({
      store: runtime.store,
      install: runtime.admittedInstall,
      implementationSet: runtime.executionAdmission.implementationSet,
      publication,
      semanticsProjection:
        environment.product.projectInstalledLeafSemantics(semantics),
    });
  const eventCountBeforeTraversal = runtime.store.readAll().length;
  let watchdogHandle;
  const execution = await Promise.race([
    environment.hog.executeGraphTraversal({
      store: runtime.store,
      executionBasis: runtime.executionAdmission.executionBasis,
      openedTraversalScope: runtime.opened.scope,
      program,
      graphFunction: fixture.graphFunction,
      graph: runtime.graph,
      graphValidation: runtime.graphValidation,
      implementationSet: runtime.executionAdmission.implementationSet,
      interactionSet: runtime.executionAdmission.interactionSet,
      leafPort,
      closureContract: runtime.closureContract,
      input: runtime.input,
      inputDigest: runtime.rawInput.subjectDigest,
      eventTime: "2026-07-31T00:00:00.000Z",
      correlationId: `correlation://increment-0a/f05/${fixture.caseId}/hog`,
    }).then(
      (completion) => ({ kind: "completion", completion }),
      (error) => ({
        kind: "owner_throw",
        errorClass: error instanceof Error ? error.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
      }),
    ),
    new Promise((resolve) => {
      watchdogHandle = setTimeout(
        () => resolve({ kind: "watchdog" }),
        2_000,
      );
    }),
  ]);
  clearTimeout(watchdogHandle);
  assert.notEqual(
    execution.kind,
    "watchdog",
    `${fixture.caseId} did not return before the explicit watchdog`,
  );
  const runtimeEvents = runtime.store.readAll().slice(eventCountBeforeTraversal);
  const cCallEvents = runtimeEvents.filter(
    (event) => event.kind === "c_call_opened",
  );
  const resultEvents = runtimeEvents.filter(
    (event) => event.kind === "c_call_result_admitted",
  );
  return {
    executionKind: execution.kind,
    completionDisposition:
      execution.kind === "completion"
        ? execution.completion.disposition
        : null,
    ownerThrowClass:
      execution.kind === "owner_throw" ? execution.errorClass : null,
    ownerThrowMessage:
      execution.kind === "owner_throw" ? execution.message : null,
    watchdogFired: execution.kind === "watchdog",
    runtimeEventDelta: runtimeEvents.length,
    runtimeEventKinds: runtimeEvents.map((event) => event.kind),
    cCallCount: cCallEvents.length,
    resultAdmissionCount: resultEvents.length,
    executedProgramLocusRefs: cCallEvents.map(
      (event) => event.payload.programLocusRef,
    ),
  };
}

async function runF05(environment, packagedImplementations) {
  const { gtl, validator } = environment;
  const baseGraphFunction = environment.publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
  );
  const program = environment.publication.programs.find(
    (candidate) => candidate.programRef === gtl.GRAPH_EDGE_HELLO_IDS.programRef,
  );
  assert.notEqual(baseGraphFunction, undefined);
  assert.notEqual(program, undefined);
  assert.equal(baseGraphFunction.template.nodes.length, 2);
  assert.equal(baseGraphFunction.template.edges.length, 1);

  const fixtures = topologyFixtures(gtl, baseGraphFunction);
  const observations = [];
  const executableFixtures = new Map();
  for (const fixture of fixtures) {
    const publication = replaceGraphFunction(
      environment.publication,
      fixture.graphFunction,
    );
    const publicationAdmission = requireRawAdmission(
      validator,
      publication,
      "module_publication",
      "contract://abiogenesis/gtl/module-publication@5",
    );
    const admittedProgram = publicationAdmission.value.programs.find(
      (candidate) => candidate.programRef === program.programRef,
    );
    const admittedGraphFunction = publicationAdmission.value.graphFunctions.find(
      (candidate) => candidate.name === fixture.graphFunction.name,
    );
    assert.notEqual(admittedProgram, undefined);
    assert.notEqual(admittedGraphFunction, undefined);
    const validation = validator.validateProgram(
      rawProgramInput(
        validator,
        publicationAdmission,
        admittedProgram,
        [admittedGraphFunction],
      ),
    );
    const runtimeObservation =
      fixture.caseId === "duplicate-node" ||
          fixture.caseId === "undeclared-cycle"
        ? await executeTopologyFixture(
            environment,
            fixture,
            admittedProgram,
            validation,
            publication,
            packagedImplementations,
          )
        : null;
    if (runtimeObservation !== null) {
      executableFixtures.set(fixture.caseId, runtimeObservation);
    }
    observations.push({
      caseId: fixture.caseId,
      mutationKind: fixture.mutationKind,
      validationKind: validation.kind,
      disposition: validation.disposition,
      diagnostics:
        validation.kind === "program_validation" ? [] : validation.diagnostics,
      programValidationRef:
        validation.kind === "program_validation" ? validation.validationRef : null,
      executableLeafCount:
        validation.kind === "program_validation"
          ? validation.executableLeafRows.length
          : null,
      nodeCount: fixture.graphFunction.template.nodes.length,
      uniqueNodeCount: new Set(
        fixture.graphFunction.template.nodes.map((node) => node.nodeRef),
      ).size,
      terminalCount: fixture.graphFunction.template.terminalNodeRefs.length,
      edgeCount: fixture.graphFunction.template.edges.length,
      validatedProgramLocusRefs:
        validation.kind === "program_validation"
          ? validation.executableLeafRows.map((row) => row.programLocusRef)
          : [],
      runtimeObservation,
    });
  }
  assert.equal(
    observations.every(
      (entry) => entry.validationKind === "program_validation",
    ),
    true,
    JSON.stringify(observations),
  );
  const duplicate = observations.find(
    (entry) => entry.caseId === "duplicate-node",
  );
  assert.notEqual(duplicate, undefined);
  assert.equal(duplicate.nodeCount > duplicate.uniqueNodeCount, true);
  const duplicateRuntime = executableFixtures.get("duplicate-node");
  const cycleRuntime = executableFixtures.get("undeclared-cycle");
  assert.notEqual(duplicateRuntime, undefined);
  assert.notEqual(cycleRuntime, undefined);
  const duplicateFixture = fixtures.find(
    (fixture) => fixture.caseId === "duplicate-node",
  );
  assert.notEqual(duplicateFixture, undefined);
  const duplicatedNodeRef = duplicateFixture.graphFunction.template.terminalNodeRefs[0];
  const duplicateValidatedLoci = duplicate.validatedProgramLocusRefs.filter(
    (locusRef) =>
      duplicateFixture.graphFunction.template.nodes.some(
        (node) =>
          node.nodeRef === duplicatedNodeRef &&
          node.term.programLocusRef === locusRef,
      ),
  );
  assert.equal(duplicateValidatedLoci.length, 2);
  assert.equal(new Set(duplicateValidatedLoci).size, 2);
  const unexecutedValidatedDuplicateLoci = duplicateValidatedLoci.filter(
    (locusRef) => !duplicateRuntime.executedProgramLocusRefs.includes(locusRef),
  );
  assert.equal(unexecutedValidatedDuplicateLoci.length, 1);
  assert.equal(duplicateRuntime.resultAdmissionCount > 0, true);
  assert.equal(cycleRuntime.watchdogFired, false);
  assert.equal(cycleRuntime.cCallCount > 0, true, JSON.stringify(cycleRuntime));
  assert.equal(
    cycleRuntime.resultAdmissionCount > 0,
    true,
    JSON.stringify(cycleRuntime),
  );

  return relation({
    relationId: "AX-F05",
    claim:
      "whole-Program validation omits the frozen finite-topology predicate and duplicate nodes permit Validator/HoG selection divergence",
    ingress:
      "installed validator.validateProgram followed by installed ABG execution-basis admission and HoG executeGraphTraversal for the duplicate and cycle probes",
    processBoundary:
      "isolated installed owner stores; duplicate and cycle cross the real ABG/HoG boundary under a two-second watchdog with event-derived C-call and result counters",
    fixtureSource: {
      publication: "installed Hello graph-edge two-node Program",
      graphFunctionRef: baseGraphFunction.name,
      programRef: program.programRef,
      baseNodeCount: baseGraphFunction.template.nodes.length,
      baseEdgeCount: baseGraphFunction.template.edges.length,
    },
    mutation: fixtures.map((fixture) => ({
      caseId: fixture.caseId,
      mutationKind: fixture.mutationKind,
      graphDigest: canonicalDigest(fixture.graphFunction),
    })),
    oracle: {
      target:
        "each invalid topology is refused by Validator before an ABG event or leaf effect and HoG consumes that same normalized Program digest",
      diagnosticConstraint:
        "the accepted design does not ratify a new diagnostic code per mutation; this baseline records the exact current accepted result without inventing one",
    },
    expectedBaselineSignature: {
      everyMutation: "program_validation",
      duplicateSelection:
        "Validator admits two distinct executable requirements behind one node identity while HoG executes only the first selected node semantics",
      cycle:
        "the undeclared cycle reaches admitted C-call/result effects before returning under the watchdog",
    },
    observedSignature: {
      observations,
      duplicateSelection: {
        duplicatedNodeRef,
        validatedProgramLocusRefs: duplicateValidatedLoci,
        executedProgramLocusRefs: duplicateRuntime.executedProgramLocusRefs,
        unexecutedValidatedProgramLocusRefs:
          unexecutedValidatedDuplicateLoci,
      },
      cycleExecution: cycleRuntime,
    },
    maskControls: [
      {
        control:
          "every mutated publication and Program passes raw admission before topology validation",
        passed: observations.length === 7,
      },
      {
        control:
          "terminal resultBearing values are adjusted for empty/additional terminal fixtures so invalid_result_cardinality cannot mask the target omission",
        passed:
          observations.find((entry) => entry.caseId === "empty-terminal-set")
            ?.diagnostics.length === 0 &&
          observations.find(
            (entry) => entry.caseId === "terminal-outgoing-edge",
          )?.diagnostics.length === 0,
      },
      {
        control:
          "all seven probes cross the installed Validator boundary; only the frozen duplicate and cycle probes proceed to owner runtime",
        passed:
          observations.every(
            (entry) => entry.validationKind === "program_validation",
          ) && executableFixtures.size === 2,
      },
      {
        control:
          "the duplicate fixture produces two distinct validated loci behind one node identity and records the actual HoG C-call loci",
        passed:
          duplicate.nodeCount > duplicate.uniqueNodeCount &&
          duplicateValidatedLoci.length === 2 &&
          new Set(duplicateValidatedLoci).size === 2 &&
          unexecutedValidatedDuplicateLoci.length === 1 &&
          duplicateRuntime.resultAdmissionCount > 0,
      },
      {
        control:
          "the undeclared-cycle finding is an admitted C-call and result crossing, not a timeout signature",
        passed:
          cycleRuntime.watchdogFired === false &&
          cycleRuntime.cCallCount > 0 &&
          cycleRuntime.resultAdmissionCount > 0,
      },
    ],
    cases: observations.map((entry) => ({
      caseId: entry.caseId,
      expected: {
        baselineKind: "program_validation",
        target:
          "pre-effect topology refusal under one normalized Program relation",
      },
      observed: entry,
      passed:
        entry.validationKind === "program_validation" &&
        (
          entry.runtimeObservation === null ||
          (
            entry.runtimeObservation.watchdogFired === false &&
            entry.runtimeObservation.runtimeEventDelta > 0
          )
        ),
    })),
  });
}

function validateProgramVariant(
  environment,
  publication,
  programRef,
  graphFunctionOrder,
) {
  const publicationAdmission = requireRawAdmission(
    environment.validator,
    publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const program = publicationAdmission.value.programs.find(
    (candidate) => candidate.programRef === programRef,
  );
  assert.notEqual(program, undefined);
  const graphFunctions = graphFunctionOrder.map((graphFunctionRef) => {
    const graphFunction = publicationAdmission.value.graphFunctions.find(
      (candidate) => candidate.name === graphFunctionRef,
    );
    assert.notEqual(graphFunction, undefined);
    return graphFunction;
  });
  const validation = environment.validator.validateProgram(
    rawProgramInput(
      environment.validator,
      publicationAdmission,
      program,
      graphFunctions,
    ),
  );
  assert.equal(validation.kind, "program_validation", JSON.stringify(validation));
  return {
    publication: publicationAdmission.value,
    program,
    graphFunctions,
    validation,
  };
}

function f10IdentityProjection(environment, runtime, variant) {
  const replay = environment.abg.replay(runtime.store, {
    runId: runtime.opened.scope.runId,
  });
  return {
    programDigest: variant.validation.programDigest,
    graphFunctionDigests: variant.validation.graphFunctionDigests,
    requirementKeys: variant.validation.executableLeafRows.map(
      (row) => row.requirementKey,
    ),
    programValidationRef: variant.validation.validationRef,
    programValidationDigest: variant.validation.sourceDigest,
    graphValidationRef: runtime.graphValidation.validationRef,
    graphValidationDigest: runtime.graphValidation.validationDigest,
    invocationCandidateRef: runtime.invocation.invocationRef,
    invocationCandidateDigest: runtime.invocation.invocationDigest,
    invocationAdmissionRef: runtime.invocationAdmission.invocationAdmissionRef,
    invocationAdmissionDigest:
      runtime.invocationAdmission.invocationAdmissionDigest,
    executionBasisRef: runtime.executionAdmission.executionBasis.basisRef,
    executionBasisDigest: runtime.executionAdmission.executionBasis.basisDigest,
    replayDigest: replay.replayDigest,
  };
}

async function runF10Pair(
  environment,
  label,
  forward,
  reverse,
  graphFunctionRef,
  packagedImplementations,
) {
  const forwardGraphFunction = forward.publication.graphFunctions.find(
    (candidate) => candidate.name === graphFunctionRef,
  );
  const reverseGraphFunction = reverse.publication.graphFunctions.find(
    (candidate) => candidate.name === graphFunctionRef,
  );
  assert.notEqual(forwardGraphFunction, undefined);
  assert.notEqual(reverseGraphFunction, undefined);
  const forwardRuntime = await openRuntimePrefix({
    environment,
    label,
    publication: forward.publication,
    program: forward.program,
    graphFunction: forwardGraphFunction,
    programValidation: forward.validation,
    packagedImplementations,
  });
  const reverseRuntime = await openRuntimePrefix({
    environment,
    label,
    publication: reverse.publication,
    program: reverse.program,
    graphFunction: reverseGraphFunction,
    programValidation: reverse.validation,
    packagedImplementations,
  });
  return {
    forward: f10IdentityProjection(environment, forwardRuntime, forward),
    reverse: f10IdentityProjection(environment, reverseRuntime, reverse),
  };
}

function f10Equality(left, right) {
  return Object.fromEntries(
    Object.keys(left).map((key) => [
      key,
      canonicalJson(left[key]) === canonicalJson(right[key]),
    ]),
  );
}

async function runF10(environment, packagedImplementations) {
  const programRef = environment.gtl.WORKFLOW_HELLO_IDS.programRef;
  const graphFunctionRef = environment.gtl.WORKFLOW_HELLO_IDS.graphFunctionRef;
  const baseProgram = environment.publication.programs.find(
    (candidate) => candidate.programRef === programRef,
  );
  assert.notEqual(baseProgram, undefined);
  assert.equal(baseProgram.callableMembership.length, 2);
  const semanticForwardOrder = [...baseProgram.callableMembership];
  const semanticReverseOrder = [...semanticForwardOrder].reverse();
  const fixedRequirementOrder = [...semanticForwardOrder].sort();
  const semanticForward = validateProgramVariant(
    environment,
    environment.publication,
    programRef,
    fixedRequirementOrder,
  );
  const reversedMembershipPublication = jsonClone(environment.publication);
  const reversedMembershipProgram = reversedMembershipPublication.programs.find(
    (candidate) => candidate.programRef === programRef,
  );
  assert.notEqual(reversedMembershipProgram, undefined);
  reversedMembershipProgram.callableMembership = semanticReverseOrder;
  const semanticReverse = validateProgramVariant(
    environment,
    reversedMembershipPublication,
    programRef,
    fixedRequirementOrder,
  );

  const requirementForward = validateProgramVariant(
    environment,
    environment.publication,
    programRef,
    semanticForwardOrder,
  );
  const requirementReverse = validateProgramVariant(
    environment,
    environment.publication,
    programRef,
    [...semanticForwardOrder].reverse(),
  );
  const semantic = await runF10Pair(
    environment,
    "f10/semantic-membership",
    semanticForward,
    semanticReverse,
    graphFunctionRef,
    packagedImplementations,
  );
  const requirement = await runF10Pair(
    environment,
    "f10/requirement-order",
    requirementForward,
    requirementReverse,
    graphFunctionRef,
    packagedImplementations,
  );
  const semanticRepeat = await runF10Pair(
    environment,
    "f10/semantic-membership",
    semanticForward,
    semanticReverse,
    graphFunctionRef,
    packagedImplementations,
  );
  const requirementRepeat = await runF10Pair(
    environment,
    "f10/requirement-order",
    requirementForward,
    requirementReverse,
    graphFunctionRef,
    packagedImplementations,
  );
  const semanticEquality = f10Equality(semantic.forward, semantic.reverse);
  const requirementEquality = f10Equality(
    requirement.forward,
    requirement.reverse,
  );
  const propagatedKeys = [
    "programValidationRef",
    "graphValidationRef",
    "invocationAdmissionRef",
    "executionBasisRef",
    "replayDigest",
  ];
  assert.equal(
    propagatedKeys.every((key) => semanticEquality[key] === false),
    true,
    JSON.stringify(semanticEquality),
  );
  assert.equal(
    propagatedKeys.every((key) => requirementEquality[key] === false),
    true,
    JSON.stringify(requirementEquality),
  );
  assert.deepEqual(semantic, semanticRepeat);
  assert.deepEqual(requirement, requirementRepeat);

  return relation({
    relationId: "AX-F10",
    claim:
      "caller ordering of both Program GraphFunction membership and discovered GraphFunction requirements creates rival runtime identities",
    ingress:
      "installed validateProgram through exact Product invocation, ABG ExecutionBasis admission, openCall, and scoped replay",
    processBoundary:
      "four independent same-prefix stores over one installed Product, repeated once to prove deterministic propagation",
    fixtureSource: {
      publication: "installed Hello workflow Program",
      programRef,
      graphFunctionRef,
      semanticMembership: [...semanticForwardOrder].sort(),
      requirementMembership: [...fixedRequirementOrder],
    },
    mutation: {
      semanticMembership: {
        kind: "program_callable_membership_permutation",
        forwardOrder: semanticForwardOrder,
        reverseOrder: semanticReverseOrder,
      },
      requirementOrder: {
        kind: "validator_graph_function_requirement_permutation",
        forwardOrder: semanticForwardOrder,
        reverseOrder: [...semanticForwardOrder].reverse(),
      },
    },
    oracle: {
      target:
        "each equal semantic set yields equal ProgramValidation, GraphValidation, ExecutionBasis, invocation-admission, and scoped replay identities",
      independentPermutations: [
        "Program callableMembership order with fixed validator GraphFunction order",
        "validator GraphFunction requirement order with fixed Program membership",
      ],
    },
    expectedBaselineSignature: {
      semanticMembershipPropagation: Object.fromEntries(
        propagatedKeys.map((key) => [key, false]),
      ),
      requirementOrderPropagation: Object.fromEntries(
        propagatedKeys.map((key) => [key, false]),
      ),
      semanticSetsEqual: true,
      independentRepeatStable: true,
    },
    observedSignature: {
      semanticMembershipEquality: semanticEquality,
      requirementOrderEquality: requirementEquality,
      repeatStable:
        canonicalJson(semantic) === canonicalJson(semanticRepeat) &&
        canonicalJson(requirement) === canonicalJson(requirementRepeat),
    },
    maskControls: [
      {
        control:
          "semantic-membership inputs contain the same two unique refs and hold validator GraphFunction order fixed",
        passed:
          new Set(semanticForwardOrder).size === 2 &&
          canonicalJson([...semanticForwardOrder].sort()) ===
            canonicalJson([...semanticReverseOrder].sort()) &&
          canonicalJson(semanticForward.graphFunctions.map((row) => row.name)) ===
            canonicalJson(semanticReverse.graphFunctions.map((row) => row.name)),
      },
      {
        control:
          "requirement-order inputs hold the Program byte-for-byte fixed and permute only the same unique GraphFunction requirement source set",
        passed:
          canonicalJson(requirementForward.program) ===
            canonicalJson(requirementReverse.program) &&
          canonicalJson(
            requirementForward.graphFunctions.map((row) => row.name).sort(),
          ) === canonicalJson(
            requirementReverse.graphFunctions.map((row) => row.name).sort(),
          ),
      },
      {
        control:
          "both permutations preserve the same canonical executable requirement-key set",
        passed:
          canonicalJson([...semantic.forward.requirementKeys].sort()) ===
            canonicalJson([...semantic.reverse.requirementKeys].sort()) &&
          canonicalJson([...requirement.forward.requirementKeys].sort()) ===
            canonicalJson([...requirement.reverse.requirementKeys].sort()),
      },
      {
        control:
          "each lane reaches actual ABG invocation, ExecutionBasis, open-call replay and reproduces exactly on an independent store repeat",
        passed:
          propagatedKeys.every(
            (key) =>
              typeof semantic.forward[key] === "string" &&
              typeof semantic.reverse[key] === "string" &&
              typeof requirement.forward[key] === "string" &&
              typeof requirement.reverse[key] === "string",
          ) &&
          canonicalJson(semantic) === canonicalJson(semanticRepeat) &&
          canonicalJson(requirement) === canonicalJson(requirementRepeat),
      },
    ],
    cases: [
      {
        caseId: "semantic-membership-permutation",
        expected: Object.fromEntries(
          propagatedKeys.map((key) => [key, false]),
        ),
        observed: Object.fromEntries(
          propagatedKeys.map((key) => [key, semanticEquality[key]]),
        ),
        passed: propagatedKeys.every(
          (key) => semanticEquality[key] === false,
        ),
      },
      {
        caseId: "requirement-order-permutation",
        expected: Object.fromEntries(
          propagatedKeys.map((key) => [key, false]),
        ),
        observed: Object.fromEntries(
          propagatedKeys.map((key) => [key, requirementEquality[key]]),
        ),
        passed: propagatedKeys.every(
          (key) => requirementEquality[key] === false,
        ),
      },
    ],
  });
}

function verifyInvocation(harness, caseId, artifactPath, expectedArtifactDigest) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId: "abg.operation.product.verify",
    variant: "artifact",
    invocationRef: `invocation://increment-0a/f11/${caseId}`,
    eventTime: "2026-07-31T00:00:00.000Z",
    correlationId: `correlation://increment-0a/f11/${caseId}`,
    payload: {
      artifactPath,
      artifactRef: basename(artifactPath),
      ...expectedVerificationIdentity(harness.candidateBasis),
      expectedArtifactDigest,
    },
  };
}

function stableRefusalMessage(message, pathTokens) {
  return Object.entries(pathTokens)
    .sort(([left], [right]) => right.length - left.length)
    .reduce(
      (current, [path, token]) => current.split(path).join(token),
      message,
    );
}

function refusalSignature(outcome, pathTokens) {
  const message = stableRefusalMessage(
    outcome.result?.message ?? "",
    pathTokens,
  );
  const ownerRefusalCause = [
    "artifact_unreadable",
    "artifact_digest_mismatch",
  ].find((candidate) => message.includes(candidate)) ?? null;
  return {
    kind: outcome.kind,
    disposition: outcome.disposition,
    resultKind: outcome.result?.kind ?? null,
    code: outcome.result?.code ?? null,
    ownerRefusalCause,
    message,
    diagnosticRef: outcome.diagnosticRef ?? null,
  };
}

async function runSdk(publicApi, invocation) {
  const context = publicApi.createRootOperationContext(
    join(tmpdir(), `abi5-contract-${process.pid}-${Date.now()}-${Math.random()}.events.jsonl`),
  );
  try {
    return await publicApi.applyRootPublicInvocation(context, invocation);
  } finally {
    publicApi.closeRootOperationContext(context);
  }
}

async function runF11(harness) {
  const publicApi = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    "increment-0a=f11",
  );
  const fixtureRoot = join(harness.scratch, "increment-0a-f11");
  await mkdir(fixtureRoot, { recursive: true });
  const missingArtifactPath = join(fixtureRoot, "missing-product.tgz");
  await assert.rejects(access(missingArtifactPath));
  await access(harness.artifactPath);

  const sdkInvocations = {
    unreadable: verifyInvocation(
      harness,
      "sdk-unreadable",
      missingArtifactPath,
      harness.candidateBasis.artifactDigest,
    ),
    digestMismatch: verifyInvocation(
      harness,
      "sdk-digest-mismatch",
      harness.artifactPath,
      ZERO_DIGEST,
    ),
  };
  const cliInvocations = {
    unreadable: verifyInvocation(
      harness,
      "cli-unreadable",
      missingArtifactPath,
      harness.candidateBasis.artifactDigest,
    ),
    digestMismatch: verifyInvocation(
      harness,
      "cli-digest-mismatch",
      harness.artifactPath,
      ZERO_DIGEST,
    ),
  };

  const sdkUnreadable = await runSdk(publicApi, sdkInvocations.unreadable);
  const sdkDigestMismatch = await runSdk(
    publicApi,
    sdkInvocations.digestMismatch,
  );
  const cliRuns = {};
  for (const [cause, invocation] of Object.entries(cliInvocations)) {
    const transcriptPath = join(fixtureRoot, `${cause}.jsonl`);
    await writeFile(transcriptPath, `${JSON.stringify(invocation)}\n`, "utf8");
    cliRuns[cause] = await runInstalledCli(harness, {
      label: `f11-${cause}`,
      transcriptPath,
    });
    assert.equal(cliRuns[cause].outcomes.length, 1);
  }
  const pathTokens = {
    [missingArtifactPath]: "<unreadable-artifact>",
    [harness.artifactPath]: "<readable-artifact>",
  };
  const signatures = {
    sdk: {
      unreadable: refusalSignature(sdkUnreadable, pathTokens),
      digestMismatch: refusalSignature(sdkDigestMismatch, pathTokens),
    },
    cli: {
      unreadable: refusalSignature(
        cliRuns.unreadable.outcomes[0],
        pathTokens,
      ),
      digestMismatch: refusalSignature(
        cliRuns.digestMismatch.outcomes[0],
        pathTokens,
      ),
    },
  };
  for (const transport of Object.values(signatures)) {
    assert.equal(transport.unreadable.code, "owner_refusal");
    assert.equal(transport.digestMismatch.code, "owner_refusal");
    assert.equal(
      transport.unreadable.diagnosticRef,
      "diagnostic://abiogenesis/public/owner_refusal@5",
    );
    assert.equal(
      transport.digestMismatch.diagnosticRef,
      "diagnostic://abiogenesis/public/owner_refusal@5",
    );
    assert.match(transport.unreadable.message, /artifact_unreadable/u);
    assert.match(
      transport.digestMismatch.message,
      /artifact_digest_mismatch/u,
    );
    assert.equal(transport.unreadable.ownerRefusalCause, "artifact_unreadable");
    assert.equal(
      transport.digestMismatch.ownerRefusalCause,
      "artifact_digest_mismatch",
    );
  }
  assert.deepEqual(signatures.sdk.unreadable, signatures.cli.unreadable);
  assert.deepEqual(
    signatures.sdk.digestMismatch,
    signatures.cli.digestMismatch,
  );

  const caseRows = [
    ["sdk-unreadable", "sdk", "unreadable", signatures.sdk.unreadable],
    [
      "sdk-digest-mismatch",
      "sdk",
      "digest_mismatch",
      signatures.sdk.digestMismatch,
    ],
    ["cli-unreadable", "cli", "unreadable", signatures.cli.unreadable],
    [
      "cli-digest-mismatch",
      "cli",
      "digest_mismatch",
      signatures.cli.digestMismatch,
    ],
  ];
  return relation({
    relationId: "AX-F11",
    claim:
      "the common Public outcome collapses two distinct Product verification refusals into owner_refusal plus prose",
    ingress:
      "installed Public SDK applyRootPublicInvocation and installed abg.cli one-line JSONL transcripts",
    processBoundary:
      "two fresh SDK contexts and two separate CLI processes with distinct invocation refs",
    fixtureSource: {
      unreadable: {
        artifactName: basename(missingArtifactPath),
        filesystemState: "absent",
      },
      digestMismatch: {
        readableArtifact: basename(harness.artifactPath),
        expectedArtifactDigest: ZERO_DIGEST,
      },
    },
    mutation: {
      unreadable: "artifact path does not resolve to readable bytes",
      digestMismatch:
        "the installed tarball is readable but expectedArtifactDigest is all zeroes",
    },
    oracle: {
      outerEnvelope: "owner_refusal under the fixed five-code common envelope",
      nestedOwnerRefusals: [
        "artifact_unreadable",
        "artifact_digest_mismatch",
      ],
      transportRelation: "SDK and CLI expose equal typed nested values",
    },
    expectedBaselineSignature: {
      bothOuterCodes: "owner_refusal",
      bothDiagnosticRefs:
        "diagnostic://abiogenesis/public/owner_refusal@5",
      onlyProseDistinguishesCause: true,
    },
    observedSignature: {
      signatures,
      cliExitCodes: {
        unreadable: cliRuns.unreadable.exitCode,
        digestMismatch: cliRuns.digestMismatch.exitCode,
      },
    },
    maskControls: [
      {
        control:
          "unreadable fixture is absent and cannot reach digest comparison",
        passed:
          signatures.sdk.unreadable.message.includes("artifact_unreadable") &&
          signatures.cli.unreadable.message.includes("artifact_unreadable"),
      },
      {
        control:
          "digest-mismatch fixture is readable before both transports invoke verification",
        passed:
          signatures.sdk.digestMismatch.message.includes(
            "artifact_digest_mismatch",
          ) &&
          signatures.cli.digestMismatch.message.includes(
            "artifact_digest_mismatch",
          ),
      },
      {
        control:
          "the two causes use distinct invocation refs and fresh transport contexts",
        passed:
          new Set([
            ...Object.values(sdkInvocations),
            ...Object.values(cliInvocations),
          ].map((invocation) => invocation.invocationRef)).size === 4,
      },
      {
        control: "SDK and CLI normalize to the same current signature per cause",
        passed:
          canonicalJson(signatures.sdk.unreadable) ===
            canonicalJson(signatures.cli.unreadable) &&
          canonicalJson(signatures.sdk.digestMismatch) ===
            canonicalJson(signatures.cli.digestMismatch),
      },
      {
        control:
          "normalized evidence preserves the exact refusal classification while replacing scratch-specific absolute paths",
        passed:
          Object.values(signatures).every(
            (transport) =>
              transport.unreadable.ownerRefusalCause ===
                "artifact_unreadable" &&
              transport.digestMismatch.ownerRefusalCause ===
                "artifact_digest_mismatch" &&
              !transport.unreadable.message.includes(harness.scratch) &&
              !transport.digestMismatch.message.includes(harness.scratch),
          ),
      },
    ],
    cases: caseRows.map(([caseId, transport, cause, observed]) => ({
      caseId,
      expected: {
        currentOuterCode: "owner_refusal",
        targetNestedOwnerCode:
          cause === "unreadable"
            ? "artifact_unreadable"
            : "artifact_digest_mismatch",
      },
      observed,
      passed:
        observed.code === "owner_refusal" &&
        observed.diagnosticRef ===
          "diagnostic://abiogenesis/public/owner_refusal@5" &&
        observed.message.includes(
          cause === "unreadable"
            ? "artifact_unreadable"
            : "artifact_digest_mismatch",
        ) &&
        (transport === "sdk" || transport === "cli"),
    })),
  });
}

async function sourceFiles(root) {
  const files = [];
  async function visit(path) {
    const entries = await readdir(path, { withFileTypes: true });
    for (const entry of entries) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) await visit(child);
      else if (entry.isFile() && entry.name.endsWith(".ts")) files.push(child);
    }
  }
  await visit(root);
  return files.sort();
}

async function runF14(harness) {
  const sourceRoot = join(harness.sourcePackageRoot, "code/src");
  const occurrences = [];
  for (const path of await sourceFiles(sourceRoot)) {
    const source = await readFile(path, "utf8");
    const sourceDigest = sha256Bytes(source);
    for (const [index, line] of source.split(/\r?\n/u).entries()) {
      for (const match of line.matchAll(/\.localeCompare\(/gu)) {
        occurrences.push({
          path: `code/src/${relative(sourceRoot, path)}`,
          line: index + 1,
          column: (match.index ?? 0) + 1,
          sourceDigest,
          source: line.trim(),
        });
      }
    }
  }
  const distribution = Object.fromEntries(
    [...new Set(occurrences.map((entry) => entry.path))]
      .sort()
      .map((path) => [
        path,
        occurrences.filter((entry) => entry.path === path).length,
      ]),
  );
  const expectedDistribution = {
    "code/src/abg/execution_basis.ts": 4,
    "code/src/abg/invocation_admission.ts": 4,
    "code/src/abg/worker_transport.ts": 1,
    "code/src/product/invocation.ts": 2,
    "code/src/product/verify_product.ts": 2,
    "code/src/shared/digests.ts": 1,
    "code/src/validator/validation.ts": 2,
  };
  assert.equal(occurrences.length, 16);
  assert.deepEqual(distribution, expectedDistribution);

  const corpus = ["Z", "a", "Å", "ä", "Ω", "😀", "é", "e\u0301", "𐐀"];
  const expectedCodeUnitOrder = [
    "Z",
    "a",
    "e\u0301",
    "Å",
    "ä",
    "é",
    "Ω",
    "𐐀",
    "😀",
  ];
  const codeUnitOrder = [...corpus].sort();
  assert.deepEqual(codeUnitOrder, expectedCodeUnitOrder);
  const corpusMetadata = corpus.map((value) => ({
    value,
    utf16CodeUnits: Array.from(
      { length: value.length },
      (_unused, index) => value.charCodeAt(index),
    ),
  }));

  return relation({
    relationId: "AX-F14",
    claim:
      "identity-bearing production paths use host localeCompare rather than one explicit Unicode code-unit relation",
    ingress:
      "static scan of every TypeScript source under code/src plus a deterministic UTF-16 corpus assertion",
    processBoundary: "source-tree scan; no host-locale divergence is required",
    fixtureSource: {
      sourceRoot: "code/src",
      expectedIdentityBearingFiles: Object.keys(expectedDistribution),
      corpusMetadata,
    },
    mutation: {
      kind: "identity_order_permutation",
      corpus,
      expectedCodeUnitOrder,
    },
    oracle: {
      target:
        "zero identity-bearing localeCompare calls and one explicit code-unit order for every identity projection",
      permittedNonIdentityLocaleCompare: [],
    },
    expectedBaselineSignature: {
      occurrenceCount: 16,
      fileCount: 7,
      distribution: expectedDistribution,
    },
    observedSignature: {
      occurrenceCount: occurrences.length,
      fileCount: Object.keys(distribution).length,
      distribution,
      occurrences,
      codeUnitOrder,
      codeUnitOrderDigest: canonicalDigest(codeUnitOrder),
    },
    maskControls: [
      {
        control:
          "the scan covers the complete production TypeScript source tree, not a hand-selected grep subset",
        passed: occurrences.length === 16,
      },
      {
        control:
          "all current occurrences are in the seven frozen identity-bearing files and none is classified as permitted non-identity ordering",
        passed:
          canonicalJson(distribution) === canonicalJson(expectedDistribution),
      },
      {
        control:
          "the comparator corpus asserts literal ASCII and non-ASCII UTF-16 order without depending on localeCompare output",
        passed:
          canonicalJson(codeUnitOrder) === canonicalJson(expectedCodeUnitOrder),
      },
    ],
    cases: [
      {
        caseId: "identity-bearing-source-scan",
        expected: expectedDistribution,
        observed: distribution,
        passed:
          occurrences.length === 16 &&
          canonicalJson(distribution) === canonicalJson(expectedDistribution),
      },
      {
        caseId: "code-unit-corpus",
        expected: expectedCodeUnitOrder,
        observed: codeUnitOrder,
        passed:
          canonicalJson(codeUnitOrder) === canonicalJson(expectedCodeUnitOrder),
      },
    ],
  });
}

export async function runContractLanes({ harness, packageRoot }) {
  const cleanups = [];
  const context = {
    after(cleanup) {
      cleanups.push(cleanup);
    },
  };
  try {
    const runtimeEnvironment = await setupInstalledRootCatalog(
      context,
      packageRoot,
    );
    const packagedImplementations = await loadPackagedImplementations(
      runtimeEnvironment,
    );
    return [
      await runF03(harness),
      await runF05(runtimeEnvironment, packagedImplementations),
      await runF10(runtimeEnvironment, packagedImplementations),
      await runF11(harness),
      await runF14(harness),
      await runAxPfcF08({ harness, packageRoot }),
    ];
  } finally {
    for (const cleanup of cleanups.reverse()) await cleanup();
  }
}
