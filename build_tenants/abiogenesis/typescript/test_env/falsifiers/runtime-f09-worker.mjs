#!/usr/bin/env node

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as installedAbg from "@abiogenesis/typescript-tenant/abg";
import * as installedGtl from "@abiogenesis/typescript-tenant/gtl";
import * as installedHog from "@abiogenesis/typescript-tenant/hog";
import * as installedProduct from "@abiogenesis/typescript-tenant/product";
import * as installedValidator from "@abiogenesis/typescript-tenant/validator";
import * as retryProduct from "@abiogenesis-fixtures/developer-mini-product";

const EVENT_TIME = "2026-07-31T00:00:00.000Z";
const RETRY_BUDGET = 3;
const PLACEHOLDER_DIGEST = `sha256:${"0".repeat(64)}`;
const TARGET_SUFFIX_COORDINATES = Object.freeze([
  Object.freeze({
    packageName: "@abiogenesis/typescript-tenant/abg",
    exportName: "projectExecutableRetryInput",
    requestKeys: Object.freeze([
      "graph",
      "graphFunction",
      "prefix",
      "program",
      "reopenedStore",
      "selector",
    ]),
  }),
  Object.freeze({
    packageName: "@abiogenesis/typescript-tenant/hog",
    exportName: "resumeProjectedRetry",
    requestKeys: Object.freeze([
      "prefix",
      "reopenedStore",
      "retry",
      "runtime",
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
    correlationId: `correlation://s06/ax-f09/${operationId}`,
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
      .map((value) =>
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

async function loadInstalledRetryDependencies(
  reopened,
  events,
  selector,
  basisEvent,
  invocation,
) {
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
  const publication = retryProduct.constructAxF09Publication({
    productId: manifest.productId,
    artifactDigest: PLACEHOLDER_DIGEST,
    productContentDigest: manifest.productContentDigest,
    productManifestDigest,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
  });
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
  const installedDeclarationsImmutable =
    Object.isFrozen(publication) &&
    Object.isFrozen(program) &&
    Object.isFrozen(graphFunction) &&
    publication.contracts.every(Object.isFrozen) &&
    publication.implementationBindings.every(Object.isFrozen) &&
    publication.closureContracts.every(Object.isFrozen);
  const exportedDeclarationsMatchPublication =
    installedProduct.sha256Canonical(program) ===
      installedProduct.sha256Canonical(retryProduct.AX_F09_PROGRAM) &&
    installedProduct.sha256Canonical(graphFunction) ===
      installedProduct.sha256Canonical(retryProduct.AX_F09_GRAPH_FUNCTION);
  const publicationAdmission = requireRawAdmission(
    installedValidator,
    publication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  const programValidation = installedValidator.validateProgram(
    rawProgramInput(installedValidator, publicationAdmission, program),
  );
  assert.equal(
    programValidation.kind,
    "program_validation",
    JSON.stringify(programValidation),
  );
  const graph = installedGtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocation.invocationAdmissionRef,
    admittedInputRef: invocation.rawInputAdmissionRef,
    admittedInputDigest: invocation.rawInputDigest,
  });
  const graphValidation = installedValidator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocation.invocationAdmissionRef,
      admittedInputRef: invocation.rawInputAdmissionRef,
      admittedInputDigest: invocation.rawInputDigest,
    },
  );
  assert.equal(
    graphValidation.kind,
    "graph_validation",
    JSON.stringify(graphValidation),
  );
  const materializedGraphImmutable = Object.isFrozen(graph);
  const executionBasis = installedAbg.rehydrateExecutionBasis(
    reopened.store,
    basisEvent.payload.basisRef,
  );
  assert.notEqual(executionBasis, null);
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
  const retryNode = graphFunction.template.nodes[0];
  assert.equal(retryNode.term.kind, "c_retry");
  assert.equal(retryNode.term.term.kind, "c_of");
  const leaf = retryNode.term.term;
  const implementationResolution =
    installedAbg.selectAdmittedImplementationResolution(
      implementationSet,
      {
        graphFunctionRef: graph.graphFunctionRef,
        nodeRef: graph.template.startNodeRef,
        programLocusRef: leaf.programLocusRef,
        implementationBindingRef:
          leaf.requirement.implementationBindingRef,
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
  const implementationDependencyChecks = {
    descriptorAccepted:
      installedProduct.isPackagedLeafImplementationDescriptor(descriptor),
    descriptorImmutable: Object.isFrozen(descriptor),
    implementationCallable:
      typeof retryProduct.realizeAxF09ProbabilisticPass === "function",
    semanticsImmutable: Object.isFrozen(retryProduct.AX_F09_PRODUCT_SEMANTICS),
    bindingImplementationExact:
      implementationBinding.implementationRef === descriptor.implementationRef,
    bindingSymbolExact:
      implementationBinding.namedSymbol === descriptor.namedSymbol,
    admittedDescriptorExact:
      implementationResolution.implementationDescriptorDigest ===
        descriptor.descriptorDigest,
    admittedResolutionExact:
      executionBasis.implementationResolutionRef === null &&
      implementationSet.rows.includes(implementationResolution) &&
      executionBasis.localExecutableLeafKeys.includes(
        implementationResolution.requirementKey,
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
  const requiredContractRefs = new Set([
    graphFunction.inputs[0],
    graphFunction.outputs[0],
    leaf.requirement.inputContractRef,
    leaf.requirement.outputContractRef,
    leaf.requirement.failureContractRef,
    leaf.requirement.refusalContractRef,
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
    program,
    graphFunction,
    graph,
    graphValidation,
    executionBasis,
    implementationSet,
    interactionSet,
    openedTraversalScope,
    closureContract,
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

function inspectInstalledTargetSuffix(dependencies) {
  const projectorExportPresent =
    typeof installedAbg.projectExecutableRetryInput === "function";
  const resumeExportPresent =
    typeof installedHog.resumeProjectedRetry === "function";
  return {
    coordinates: TARGET_SUFFIX_COORDINATES,
    coordinateCount: TARGET_SUFFIX_COORDINATES.length,
    dependenciesReady:
      dependencies.declarationsMatchBasis &&
      dependencies.executionDependenciesVerified,
    projectorExportPresent,
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
      "  const inputLine = prompt.split(/\\r?\\n/).find((line) => line.startsWith('{'));",
      "  const input = inputLine === undefined ? null : JSON.parse(inputLine);",
      "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
      "  console.log(JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: `attempt ${attempt}` }] } }));",
      "  if (attempt === 1) return;",
      "  const result = {",
      "    kind: 'developer_greeting_output',",
      "    schemaVersion: '5.0.0',",
      "    message: input?.message ?? 'unavailable'",
      "  };",
      "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: attempt === 2 ? '{not-json' : JSON.stringify(result) }));",
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
  const environment = await support.setupInstalledRootCatalog(
    { after() {} },
    input.packageRoot,
  );
  const {
    abg,
    gtl,
    hog,
    hogInstalledProduct,
    product,
    validator,
    verified: rootVerified,
    artifactPath: rootArtifactPath,
    scratch,
  } = environment;
  const rootReverified = await product.verifyProduct({
    artifactPath: rootArtifactPath,
    artifactRef: basename(rootArtifactPath),
    expectedArtifactDigest: rootVerified.artifactDigest,
    expectedProductContentDigest: rootVerified.productContentDigest,
    expectedManifestDigest: rootVerified.manifestDigest,
    expectedProductId: rootVerified.productId,
    expectedPackageName: rootVerified.packageName,
    expectedPackageVersion: rootVerified.packageVersion,
  });
  assert.equal(
    rootReverified.disposition,
    "verified",
    JSON.stringify(rootReverified),
  );
  const fixtureVerified = await product.verifyProduct({
    artifactPath: input.fixtureArtifactPath,
    artifactRef: input.fixtureArtifactRef,
    expectedArtifactDigest: input.fixtureBasis.artifactDigest,
    expectedProductContentDigest: input.fixtureBasis.productContentDigest,
    expectedManifestDigest: input.fixtureBasis.manifestDigest,
    expectedProductId: input.fixtureBasis.productId,
    expectedPackageName: input.fixtureBasis.packageName,
    expectedPackageVersion: input.fixtureBasis.packageVersion,
  });
  assert.equal(
    fixtureVerified.disposition,
    "verified",
    JSON.stringify(fixtureVerified),
  );
  const lock = product.constructResolvedProductLock([
    rootReverified,
    fixtureVerified,
  ]);
  assert.equal(lock.kind, "resolved_product_lock", JSON.stringify(lock));
  const rootConsumer = join(scratch, "ax-f09-root-consumer");
  const fixtureConsumer = join(scratch, "ax-f09-fixture-consumer");
  const [rootInstallCandidate, fixtureInstallCandidate] = await Promise.all([
    product.installProduct({
      artifactPath: rootArtifactPath,
      targetRoot: rootConsumer,
      verifiedArtifact: rootReverified,
      resolvedLock: lock,
    }),
    product.installProduct({
      artifactPath: input.fixtureArtifactPath,
      targetRoot: fixtureConsumer,
      verifiedArtifact: fixtureVerified,
      resolvedLock: lock,
    }),
  ]);
  assert.equal(
    rootInstallCandidate.disposition,
    "materialized",
    JSON.stringify(rootInstallCandidate),
  );
  assert.equal(
    fixtureInstallCandidate.disposition,
    "materialized",
    JSON.stringify(fixtureInstallCandidate),
  );
  const store = new abg.AbgEventStore();
  const admittedRootInstall = abg.admitProductInstall(
    store,
    rootInstallCandidate,
    publicOperationBasis(
      product,
      "abg.operation.product.install",
      rootInstallCandidate.installId,
      rootInstallCandidate.productContentDigest,
      "invocation://s06/ax-f09/root-install",
    ),
  );
  const admittedInstall = abg.admitProductInstall(
    store,
    fixtureInstallCandidate,
    publicOperationBasis(
      product,
      "abg.operation.product.install",
      fixtureInstallCandidate.installId,
      fixtureInstallCandidate.productContentDigest,
      "invocation://s06/ax-f09/fixture-install",
    ),
  );
  assert.equal(
    admittedRootInstall.kind,
    "product_install",
    JSON.stringify(admittedRootInstall),
  );
  assert.equal(
    admittedInstall.kind,
    "product_install",
    JSON.stringify(admittedInstall),
  );
  const productSet = product.constructProductSet(
    [admittedRootInstall, admittedInstall],
    lock,
  );
  assert.equal(productSet.kind, "product_set", JSON.stringify(productSet));
  const workspaceRoot = join(scratch, "ax-f09-workspace");
  await mkdir(workspaceRoot, { recursive: true });
  const authorityManifest = {
    workspaceId: "workspace://s06/ax-f09",
    canonicalRoot: workspaceRoot,
    authorityMode: "trusted_developer",
    authorizedActorRef: "actor://developer.example/trusted-developer",
  };
  const workspaceAuthority = product.constructWorkspaceAuthorityBasis({
    ...authorityManifest,
    authorityManifestRef: "manifest://s06/ax-f09/workspace-authority",
    authorityManifestDigest: product.sha256Canonical(authorityManifest),
  });
  assert.equal(
    workspaceAuthority.kind,
    "workspace_authority_basis",
    JSON.stringify(workspaceAuthority),
  );
  const workspaceCandidate = product.constructWorkspaceBinding(
    workspaceAuthority,
    productSet,
    lock,
    {
      toolchainRoot: rootConsumer,
      productRoot: fixtureInstallCandidate.installedRoot,
      eventLogRoot: join(workspaceRoot, ".ai-workspace/events"),
      runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
      projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
      archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
    },
  );
  assert.equal(
    workspaceCandidate.kind,
    "workspace_binding_candidate",
    JSON.stringify(workspaceCandidate),
  );
  const workspaceBinding = abg.admitWorkspaceBinding(
    store,
    workspaceCandidate,
    publicOperationBasis(
      product,
      "abg.operation.workspace.bind",
      workspaceCandidate.bindingId,
      workspaceCandidate.bindingDigest,
      "invocation://s06/ax-f09/workspace-bind",
      [
        admittedRootInstall.admissionEventRef,
        admittedInstall.admissionEventRef,
      ],
    ),
  );
  assert.equal(
    workspaceBinding.kind,
    "workspace_binding",
    JSON.stringify(workspaceBinding),
  );
  const installedRoot = fixtureInstallCandidate.installedRoot;
  const publication = retryProduct.constructAxF09Publication({
    productId: fixtureVerified.productId,
    artifactDigest: fixtureVerified.artifactDigest,
    productContentDigest: fixtureVerified.productContentDigest,
    productManifestDigest: fixtureVerified.manifestDigest,
    packageName: fixtureVerified.packageName,
    packageVersion: fixtureVerified.packageVersion,
  });
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
    validator.validateProgram(rawProgramInput(validator, publicationAdmission, program)));
  assert.equal(
    programValidations.every((value) => value.kind === "program_validation"),
    true,
    JSON.stringify(programValidations.filter((value) => value.kind !== "program_validation")),
  );
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
      "invocation://s06/ax-f09/catalog-admit",
      [workspaceBinding.admissionEventRef],
    ),
  );
  assert.equal(catalog.kind, "admitted_catalog", JSON.stringify(catalog));
  const program = publication.programs.find(
    (candidate) =>
      candidate.programRef === retryProduct.AX_F09_RETRY_IDS.programRef,
  );
  const graphFunction = publication.graphFunctions.find(
    (candidate) =>
      candidate.name === retryProduct.AX_F09_RETRY_IDS.graphFunctionRef,
  );
  assert.notEqual(program, undefined);
  assert.notEqual(graphFunction, undefined);
  assert.equal(
    graphFunction.template.nodes[0].term.budget,
    RETRY_BUDGET,
  );
  const viewCandidate = product.constructCatalogViewCandidate(
    catalog,
    [graphFunction.name],
  );
  assert.equal(
    viewCandidate.kind,
    "catalog_view_candidate",
    JSON.stringify(viewCandidate),
  );
  const catalogView = abg.narrowCatalogView(
    store,
    catalog,
    viewCandidate,
    publicOperationBasis(
      product,
      "abg.operation.catalog.view",
      catalog.catalogId,
      catalog.catalogDigest,
      "invocation://s06/ax-f09/catalog-view",
      [catalog.admissionEventRef],
    ),
  );
  assert.equal(catalogView.kind, "catalog_view", JSON.stringify(catalogView));
  const nonceSubject = `restart-private-${randomUUID()}`;
  const invocationInput = {
    kind: "developer_greeting_output",
    schemaVersion: "5.0.0",
    message: nonceSubject,
  };
  const rawInput = requireRawAdmission(
    validator,
    invocationInput,
    "invocation_input",
    graphFunction.inputs[0],
  );
  const rawRequest = requireRawAdmission(
    validator,
    {
      kind: "public_invocation",
      schemaVersion: "5.0.0",
      operationId: "abg.operation.run.invoke",
      variant: "direct",
      invocationRef: "invocation://s06/ax-f09/run-invoke",
      eventTime: EVENT_TIME,
      correlationId: "correlation://s06/ax-f09/run-invoke",
      payload: {
        programRef: program.programRef,
        graphFunctionRef: graphFunction.name,
      },
    },
    "public_operation_request",
    "contract://abiogenesis/public/run-invoke-request@5",
  );
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    program,
    [],
    ["F_P"],
  );
  const actorRef = workspaceBinding.authorizedActorRef;
  const capabilityGrant = product.constructCapabilityGrant(policy, actorRef);
  const invocationAuthority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    program.programRef,
    graphFunction.name,
    policy,
    [capabilityGrant],
  );
  assert.equal(
    invocationAuthority.kind,
    "invocation_authority",
    JSON.stringify(invocationAuthority),
  );
  const invocation = product.constructDirectInvocation(
    workspaceBinding,
    catalogView,
    program,
    graphFunction,
    rawRequest,
    rawInput,
    policy,
    [capabilityGrant],
    invocationAuthority,
  );
  assert.equal(
    invocation.kind,
    "public_invocation_candidate",
    JSON.stringify(invocation),
  );
  const programValidation = programValidations.find(
    (candidate) => candidate.programRef === program.programRef,
  );
  assert.notEqual(programValidation, undefined);
  const invocationAdmission = abg.admitInvocation(
    store,
    {
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
      capabilityGrants: [capabilityGrant],
      authority: invocationAuthority,
    },
    publicOperationBasis(
      product,
      "abg.operation.run.invoke",
      workspaceBinding.bindingId,
      workspaceBinding.bindingDigest,
      invocation.invocationRef,
      [catalogView.admissionEventRef],
    ),
  );
  assert.equal(
    invocationAdmission.kind,
    "invocation_admission",
    JSON.stringify(invocationAdmission),
  );
  const graph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
  });
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
    },
  );
  assert.equal(
    graphValidation.kind,
    "graph_validation",
    JSON.stringify(graphValidation),
  );
  const implementationModules = await Promise.all(
    [...new Set(
      publication.implementationBindings.map((binding) => binding.modulePath),
    )].map((modulePath, index) =>
      import(
        `${pathToFileURL(join(installedRoot, modulePath)).href}?ax-f09=${Date.now()}-${index}`
      )),
  );
  const packagedImplementations = implementationModules.flatMap((module) =>
    Object.values(module).filter(product.isPackagedLeafImplementationDescriptor));
  const resolutionSetCandidate = product.resolveImplementationSet(
    catalogView,
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
      catalogView,
      publication,
      programValidation,
      packagedImplementations,
    );
  assert.equal(
    resolutionSetValidation.kind,
    "implementation_resolution_set_validation",
    JSON.stringify(resolutionSetValidation),
  );
  const node = graphFunction.template.nodes[0];
  const closureContract = publication.closureContracts.find(
    (candidate) => candidate.closureContractRef === program.closureContractRef,
  );
  assert.notEqual(closureContract, undefined);
  const executionBasisAdmission = abg.admitExecutionBasis(
    store,
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
    basis("execution-basis"),
  );
  assert.equal(
    executionBasisAdmission.kind,
    "execution_basis_admission",
    JSON.stringify(executionBasisAdmission),
  );
  const implementationResolution =
    abg.selectAdmittedImplementationResolution(
      executionBasisAdmission.implementationSet,
      {
        graphFunctionRef: graph.graphFunctionRef,
        nodeRef: graph.template.startNodeRef,
        programLocusRef: node.term.term.programLocusRef,
        implementationBindingRef:
          node.term.term.requirement.implementationBindingRef,
      },
    );
  assert.notEqual(implementationResolution, null);
  const semantics = await product.loadInstalledProductSemantics({
    install: admittedInstall,
    publication,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(store, install),
  });
  const semanticsProjection = product.projectInstalledLeafSemantics(semantics);
  const leafPort = await hogInstalledProduct.bindInstalledLeafInvocationPort({
    store,
    install: admittedInstall,
    implementationSet: executionBasisAdmission.implementationSet,
    publication,
    semanticsProjection,
  });
  return {
    ...environment,
    store,
    verified: fixtureVerified,
    admittedInstall,
    workspaceBinding,
    lock,
    installedRoot,
    publication,
    program,
    graphFunction,
    programValidation,
    catalog,
    catalogView,
    invocationInput,
    rawInput,
    invocationAdmission,
    graph,
    graphValidation,
    closureContract,
    executionBasis: executionBasisAdmission.executionBasis,
    implementationSet: executionBasisAdmission.implementationSet,
    implementationResolution,
    leafPort,
    actorRuntimeBinding: { workspaceBinding },
    nonceSubject,
  };
}

async function rejectAttempt(environment, stop, inputValue, failureClass) {
  const {
    abg,
    graph,
    program,
    executionBasis,
    implementationSet,
    implementationResolution,
    leafPort,
    actorRuntimeBinding,
    opened,
    store,
  } = environment;
  const openedCCall = abg.openCCall(
    store,
    executionBasis,
    opened.scope,
    program,
    graph,
    stop,
    implementationSet,
    implementationResolution,
    basis(`attempt-${stop.cursor.attempt}/c-call-open`),
  );
  assert.equal(
    openedCCall.kind,
    "c_call_admission",
    JSON.stringify(openedCCall),
  );
  const cCall = openedCCall.cCall;
  const contracts = leafPort.resolveProbabilisticWorkerContracts(
    implementationResolution,
    inputValue,
  );
  assert.notEqual(contracts, null);
  let observation = null;
  const realized = await leafPort.invoke(
    implementationResolution,
    inputValue,
    {
      occurrence: {
        cCallRef: cCall.cCallRef,
        runId: cCall.runId,
        graphCallId: cCall.graphCallId,
        frameId: cCall.frameId,
        programLocusRef: cCall.programLocusRef,
        taskOrdinal: cCall.taskOrdinal,
        attempt: cCall.attempt,
      },
      invokeWorker: async (request) => {
        observation = await abg.invokeActorProcess({
          store,
          executionBasis,
          scope: opened.scope,
          cCall,
          expectedInputDigest: stop.cursor.inputDigest,
          expectedInstructionContractRef: contracts.instructionContractRef,
          expectedResultContractRef: contracts.resultContractRef,
          runtime: actorRuntimeBinding,
          request,
          dispatchOrdinal: 1,
          basis: basis(`attempt-${stop.cursor.attempt}/actor`),
        });
        return observation;
      },
    },
  );
  assert.notEqual(observation, null);
  assert.equal(
    failureClass === "no_output"
      ? observation.failureClass === "no_output" &&
        observation.disposition === "failure"
      : observation.disposition === "success",
    true,
    JSON.stringify(observation),
  );
  const evidenceCandidate = abg.deriveProbabilisticTransportEvidence(
    cCall,
    observation,
    realized.resultCandidate,
    contracts.instructionContractRef,
  );
  const evidence = abg.admitEvidence(
    store,
    cCall,
    evidenceCandidate,
    cCall.evidenceContractRef,
    stop.cursor.inputDigest,
    basis(`attempt-${stop.cursor.attempt}/evidence`),
    contracts.instructionContractRef,
  );
  assert.equal(
    evidence.kind,
    "admitted_c_call_evidence",
    JSON.stringify(evidence),
  );
  const outputKind = leafPort.contractValueKind(
    cCall.outputContractRef,
    "output",
  );
  assert.notEqual(outputKind, null);
  const resultRejection = abg.admitResult(
    store,
    cCall,
    realized.resultCandidate,
    "success",
    cCall.outputContractRef,
    outputKind,
    (value) =>
      leafPort.validateContractValue(cCall.outputContractRef, "output", value),
    [evidence],
    basis(`attempt-${stop.cursor.attempt}/result`),
  );
  assert.equal(
    resultRejection.kind,
    "c_call_admission_rejection",
    JSON.stringify(resultRejection),
  );
  assert.equal(resultRejection.stage, "result");
  const rejected = abg.completeRejectedCCall(
    store,
    cCall,
    resultRejection,
    basis(`attempt-${stop.cursor.attempt}/retry-judgment`),
    "retry",
  );
  assert.equal(rejected.disposition, "retry");
  const failureSignalRef = failureClass === "no_output"
    ? realized.resultCandidate.diagnosticRef
    : resultRejection.diagnosticRef;
  assert.equal(typeof failureSignalRef, "string");
  const progress = abg.admitRetryProgress(
    store,
    graph,
    stop.cursor,
    cCall,
    rejected,
    failureClass,
    failureSignalRef,
    basis(`attempt-${stop.cursor.attempt}/retry-progress`),
  );
  assert.equal(
    progress.kind,
    "retry_progress_admission",
    JSON.stringify(progress),
  );
  return {
    cCall,
    observation,
    realized,
    resultRejection,
    rejected,
    failureSignalRef,
    progress,
  };
}

function advanceRetry(environment, stop, attemptResult, retryInput) {
  const { abg, hog, store, executionBasis, graph, opened, program } = environment;
  const step = hog.deriveRetryTraversalStep(graph, stop.cursor, retryInput);
  assert.equal(step.kind, "traversal_step", JSON.stringify(step));
  assert.notEqual(step.targetCursor, null);
  const replay = abg.replay(store, { runId: opened.scope.runId });
  const proposal = hog.proposeRetryRoute(
    graph,
    step,
    attemptResult.cCall,
    attemptResult.progress,
    replay,
    attemptResult.cCall.transitionContractRef,
  );
  assert.equal(
    proposal.kind,
    "traversal_route_candidate",
    JSON.stringify(proposal),
  );
  const route = abg.admitRoute(
    store,
    executionBasis,
    graph,
    stop.cursor,
    step.targetCursor,
    replay,
    proposal,
    basis(`attempt-${stop.cursor.attempt}/retry-route`),
    { cCall: attemptResult.cCall, progress: attemptResult.progress },
  );
  assert.equal(
    route.kind,
    "admitted_traversal_route",
    JSON.stringify(route),
  );
  const cursor = hog.applyRoute(step, route);
  assert.equal(cursor.kind, "traversal_cursor", JSON.stringify(cursor));
  const attempt = abg.admitRetryAttempt(
    store,
    executionBasis,
    graph,
    cursor,
    route.admissionEventRef,
    basis(`attempt-${cursor.attempt}/retry-attempt`),
  );
  assert.equal(
    attempt.kind,
    "retry_attempt_admission",
    JSON.stringify(attempt),
  );
  const nextStop = hog.traverseFromCursor(
    {
      program,
      graph,
      graphValidation: environment.graphValidation,
      executionBasis,
      openedTraversalScope: opened.scope,
    },
    cursor,
  );
  assert.equal(
    nextStop.kind,
    "traversal_stop_ref",
    JSON.stringify(nextStop),
  );
  return nextStop;
}

async function produceFrontier(input) {
  assert.deepEqual(
    Object.keys(input).sort(),
    [
      "action",
      "fixtureArtifactPath",
      "fixtureArtifactRef",
      "fixtureBasis",
      "packageRoot",
      "supportPath",
    ],
  );
  const environment = await constructP1Environment(input);
  const worker = await installAttemptWorker(environment.scratch);
  process.env.ABG_TS_CLAUDE_COMMAND = worker.command;
  process.env.ABG_AX_F09_COUNTER = worker.counterPath;
  process.env.ABG_TS_FP_TIMEOUT_MS = "10000";
  const eventLogPath = join(environment.scratch, "ax-f09.events.jsonl");
  environment.store.configureDurableLog(eventLogPath);
  const opened = environment.abg.openCall(
    environment.store,
    environment.executionBasis,
    basis("open"),
  );
  assert.equal(opened.kind, "open_call_admission", JSON.stringify(opened));
  environment.opened = opened;
  const traversal = environment.hog.traverse({
    program: environment.program,
    graph: environment.graph,
    graphValidation: environment.graphValidation,
    executionBasis: environment.executionBasis,
    openedTraversalScope: opened.scope,
  });
  assert.equal(traversal.kind, "traversal_step", JSON.stringify(traversal));
  const initialCursor = traversal.sourceCursor;
  const cursorAdmission = environment.abg.admitInitialTraversalCursor(
    environment.store,
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
  let stop = environment.hog.advanceStructuralTraversal({
    store: environment.store,
    program: environment.program,
    graph: environment.graph,
    graphValidation: environment.graphValidation,
    executionBasis: environment.executionBasis,
    openedTraversalScope: opened.scope,
    initial: traversal,
    clock: {
      eventTime: EVENT_TIME,
      correlationId: "correlation://s06/ax-f09/structural",
    },
  });
  assert.equal(stop.kind, "traversal_stop_ref", JSON.stringify(stop));
  const retryInput = {
    value: environment.invocationInput,
    inputRef: stop.cursor.inputRef,
    inputDigest: stop.cursor.inputDigest,
    inputContractRef: environment.graphFunction.inputs[0],
  };
  assert.equal(
    environment.product.sha256Canonical(retryInput.value),
    retryInput.inputDigest,
  );
  const first = await rejectAttempt(
    environment,
    stop,
    environment.invocationInput,
    "no_output",
  );
  stop = advanceRetry(environment, stop, first, retryInput);
  assert.equal(stop.cursor.attempt, 2);
  const second = await rejectAttempt(
    environment,
    stop,
    environment.invocationInput,
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
  const firstProgressFluent =
    `retry_progress_available(${first.progress.progressRef})`;
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
  );
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
  assert.equal(new Set(cCallEvents.map((event) => event.aggregateId)).size, 2);
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
  assert.equal(beforeCloseEvents.at(-1).eventId, second.progress.admissionEventRef);
  assert.equal(
    beforeCloseEvents.some(
      (event) =>
        event.kind === "retry_attempt_opened" && event.payload.attempt === 3,
    ),
    false,
  );
  assert.equal(await readFile(worker.counterPath, "utf8"), "2");
  const prefix = environment.store.projectReopenAuthorityAndClose();
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
    prefix,
    retry: {
      runId: second.cCall.runId,
      graphCallId: second.cCall.graphCallId,
      frameId: second.cCall.frameId,
      retryBoundaryRef: second.progress.retryBoundaryRef,
      retryProgressRef: second.progress.progressRef,
    },
  };
  const retainedAudit = await inspectHandoff(handoff);
  return {
    action: "produce_frontier",
    pid: process.pid,
    cleanupRoot: environment.scratch,
    handoff,
    retainedAudit,
    audit: {
      exactHandoffKeys:
        Object.keys(handoff).join("\0") === "prefix\0retry" &&
        Object.keys(handoff.retry).sort().join("\0") ===
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
        new Set(cCallEvents.map((event) => event.aggregateId)).size,
      completeCCallHistories,
      retryRouteCount: retryRoutes.length,
      secondProgressIsSoleHeldRetryFluent:
        heldRetryProgressRefs.length === 1 &&
        heldRetryProgressRefs[0] === second.progress.progressRef,
      effectCount: actorStarts.length,
      workerCount: Number(await readFile(worker.counterPath, "utf8")),
      secondProgressIsDurableTail:
        beforeCloseEvents.at(-1).eventId === second.progress.admissionEventRef,
      attemptThreeAbsent: !beforeCloseEvents.some(
        (event) =>
          event.kind === "retry_attempt_opened" && event.payload.attempt === 3,
      ),
      attemptThreeRouteAbsent: retryRoutes.length === 2,
      attemptThreeCCallAbsent: cCallEvents.length === 2,
      attemptThreeEffectAbsent:
        actorStarts.length === 2 &&
        Number(await readFile(worker.counterPath, "utf8")) === 2,
      preimagesHashToAttemptDigests: attempts.every(
        (event) =>
          event.payload.inputDigest ===
            environment.product.sha256Canonical(environment.invocationInput),
      ),
      attemptPayloadHasInputValue: attempts.some(
        (event) => Object.hasOwn(event.payload, "inputValue"),
      ),
      attemptPayloadHasSourceCursor: attempts.some(
        (event) =>
          Object.hasOwn(event.payload, "sourceCursor") ||
          Object.hasOwn(event.payload, "sourceCursorRef") ||
          Object.hasOwn(event.payload, "sourceCursorDigest"),
      ),
      durableRowsEqualClosedStore: true,
      completeDurablePrefixScanned: durableEvents.length === beforeCloseEvents.length,
      durablePrefixContainsNonce,
      durablePrefixContainsCanonicalInputPreimage,
    },
  };
}

async function inspectHandoff(handoff) {
  assert.deepEqual(Object.keys(handoff).sort(), ["prefix", "retry"]);
  assert.deepEqual(Object.keys(handoff.retry).sort(), [
    "frameId",
    "graphCallId",
    "retryBoundaryRef",
    "retryProgressRef",
    "runId",
  ]);
  const reopened = installedAbg.reopenEventStore(handoff.prefix);
  assert.equal(
    reopened.kind,
    "reopened_event_store_context",
    JSON.stringify(reopened),
  );
  try {
    const events = reopened.store.readAll();
    const selector = handoff.retry;
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
    const progressCarriesFullFrontier = progress.some((event) =>
      Object.hasOwn(event.payload, "retryFrontier") ||
      Object.hasOwn(event.payload, "attemptFrontier") ||
      (
        Array.isArray(event.payload.rows) &&
        Array.isArray(event.payload.reasonClasses) &&
        Array.isArray(event.payload.ownerSurfaces) &&
        Array.isArray(event.payload.sourceEventKinds)
      ));
    const currentProgressIsNumericCoverageOnly = progress.every((event) =>
      Array.isArray(event.payload.completedAttempts) &&
      !Object.hasOwn(event.payload, "retryFrontier") &&
      !Object.hasOwn(event.payload, "attemptFrontier") &&
      !Object.hasOwn(event.payload, "rows") &&
      !Object.hasOwn(event.payload, "reasonClasses") &&
      !Object.hasOwn(event.payload, "ownerSurfaces") &&
      !Object.hasOwn(event.payload, "sourceEventKinds"));
    const basisEvent = exactOne(
      events,
      (event) =>
        event.kind === "basis_admitted" &&
        event.runId === undefined &&
        event.payload.graphFunctionRef ===
          retryProduct.AX_F09_RETRY_IDS.graphFunctionRef,
      "AX-F09 execution-basis event",
    );
    const invocation = installedAbg.rehydrateInvocationAdmission(
      reopened.store,
      basisEvent.payload.invocationAdmissionRef,
    );
    assert.notEqual(invocation, null);
    const dependencies = await loadInstalledRetryDependencies(
      reopened,
      events,
      selector,
      basisEvent,
      invocation,
    );
    const targetSuffix = inspectInstalledTargetSuffix(dependencies);
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
      attemptPayloadHasInputValue: attempts.some((event) =>
        Object.hasOwn(event.payload, "inputValue")),
      attemptPayloadHasSourceCursor: attempts.some(
        (event) =>
          Object.hasOwn(event.payload, "sourceCursor") ||
          Object.hasOwn(event.payload, "sourceCursorRef") ||
          Object.hasOwn(event.payload, "sourceCursorDigest"),
      ),
      progressCarriesFullFrontier,
      currentProgressIsNumericCoverageOnly,
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
      retryBudget: dependencies.graphFunction.template.nodes[0].term.budget,
      targetSuffixCoordinatesExact,
      targetSuffixDisposition: targetSuffix.disposition,
      targetSuffixDependenciesReady: targetSuffix.dependenciesReady,
      projectorExportPresent: targetSuffix.projectorExportPresent,
      resumeExportPresent: targetSuffix.resumeExportPresent,
      completeDurablePrefixContainsCanonicalInputPreimage,
      completeDurablePrefixHasNoExecutablePreimage:
        !completeDurablePrefixContainsCanonicalInputPreimage,
    };
  } finally {
    reopened.store.closeDurableLog();
  }
}

async function inspectFrontier(input) {
  assert.deepEqual(Object.keys(input).sort(), ["action", "handoff"]);
  return {
    action: "inspect_frontier",
    pid: process.pid,
    audit: await inspectHandoff(input.handoff),
  };
}
const input = await readInput();
const output = input.action === "produce_frontier"
  ? await produceFrontier(input)
  : input.action === "inspect_frontier"
    ? await inspectFrontier(input)
    : (() => {
        throw new TypeError(`unknown AX-F09 worker action ${String(input.action)}`);
      })();
process.stdout.write(`${JSON.stringify(output)}\n`);
