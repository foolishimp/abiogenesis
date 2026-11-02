import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { promisify } from "node:util";
const exec = promisify(execFile);

/** Rehydrate the existing owners at each actual pre-dispatch cut. This does not
 * reopen the store, synthesize events or supply a caller-authenticated envelope. */
export async function verifyRetainedGenericIntakes(proof) {
  const installed = join(proof.scratch, "consumer/node_modules/@abiogenesis/typescript-tenant");
  const load = name => import(pathToFileURL(join(installed, "build/code/src", name + ".js")).href);
  const [product, store, prefixes, executions, calls, cursors, traversal, gtl, jobs] = await Promise.all([
    "product/index", "abg/event_store", "abg/event_prefix", "abg/execution_basis", "abg/c_call", "abg/traversal_cursor",
    "hog/traversal", "gtl/index", "abg/semantic_job",
  ].map(load));
  const full = proof.closeHandoff.prefix, bytes = await readFile(fileURLToPath(full.eventLogRef));
  const lines = bytes.subarray(0, full.prefixLength).toString("utf8").split("\n");
  const events = store.readRuntimeEventsAtDurablePrefix(full), owners = [];
  for (const row of proof.completed) {
    const call = JSON.parse(await readFile(join(proof.scratch, row.name + "-call.json"), "utf8"));
    const publications = call.resources.catalog.boundPublications;
    const opened = events.find(e => e.kind === "c_call_opened" && e.aggregateId === row.intake.aggregateId);
    const selected = events.find(e => e.kind === "c_call_fibre_selected" && e.aggregateId === opened.aggregateId);
    assert.ok(selected);
    const prefixBytes = Buffer.from(lines.slice(0, selected.admissionOrdinal).join("\n") + "\n");
    const body = { kind: "durable_prefix_coordinate", schemaVersion: "5.0.0", eventLogRef: full.eventLogRef,
      prefixLength: prefixBytes.length, prefixDigest: product.sha256Bytes(prefixBytes), storeIdentity: full.storeIdentity };
    const durable = { ...body, coordinateDigest: product.sha256Canonical(body) };
    const before = store.readRuntimeEventsAtDurablePrefix(durable), prefix = prefixes.selectValidatedRuntimeEventPrefix(before);
    const execution = executions.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId); assert.ok(execution);
    const publication = publications.find(p => p.programs.some(p => p.programRef === execution.programRef)); assert.ok(publication);
    const declarationGraphFunctions = publications.flatMap(p => p.graphFunctions);
    const graphFunction = declarationGraphFunctions.find(g => g.name === execution.graphFunctionRef); assert.ok(graphFunction);
    const graph = gtl.materializeGraph(graphFunction, { invocationAdmissionRef: execution.invocationAdmissionRef,
      admittedInputRef: execution.rawInputAdmissionRef, admittedInputDigest: execution.rawInputDigest, admittedInput: execution.rawInputValue });
    const cCall = calls.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId); assert.ok(cCall);
    const entered = before.find(e => e.kind === "traversal_cursor_entered" && e.basisId === opened.basisId && e.graphCallId === opened.graphCallId);
    assert.ok(entered); const cp = entered.payload;
    let cursor = cursors.constructTraversalCursorCandidate({ programRef: cp.programRef, executionBasisRef: cp.executionBasisRef,
      traversalScopeRef: cp.traversalScopeRef, runId: entered.runId, graphCallId: entered.graphCallId, frameId: entered.frameId,
      graphRef: cp.materializationRef, inputRef: cp.inputRef, inputDigest: cp.inputDigest, currentNodeRef: graph.template.startNodeRef,
      position: "at_term", termPath: cp.termPath, taskOrdinal: cp.taskOrdinal, attempt: cp.attempt, retryPath: cp.retryPath });
    assert.equal(cursor.cursorDigest, cp.cursorDigest);
    if (cursor.cursorDigest !== opened.payload.cursorDigest)
      cursor = traversal.deriveStructuralTargetCursor(graph, cursor, graph.template.nodes[0].term);
    assert.equal(cursor.cursorDigest, opened.payload.cursorDigest);
    const basis = { publication, lifecyclePublication: publication, sourcePublication: publication, graph, graphFunction,
      declarationGraphFunctions, executionBasis: execution, cCall, cursor, predecessorPrefix: durable };
    assert.ok(jobs.authenticateSemanticJobBasis(basis));
    assert.deepEqual(jobs.projectSemanticJobIntake(basis, row.input), row.intake.payload.value);
    assert.equal(jobs.semanticJobResultMatchesBasis(basis, row.input, row.intake.payload.value), true);
    owners.push({ basis, row });
  }
  for (let index = 0; index < owners.length; index++) {
    const { basis, row } = owners[index], other = owners[(index + 1) % owners.length].row;
    assert.equal(jobs.projectSemanticJobIntake(basis, other.input), null, "cross-job input is refused before dispatch");
    assert.equal(jobs.semanticJobResultMatchesBasis(basis, row.input, other.intake.payload.value), false, "cross-job envelope substitution refuses");
    const changed = structuredClone(row.input); changed.worksiteScope.writeRoots.push("outside");
    assert.equal(jobs.projectSemanticJobIntake(basis, changed), null, "changed scope cannot retain admitted input identity");
    assert.equal(jobs.authenticateSemanticJobBasis({ ...basis, executionBasis: owners[(index + 1) % owners.length].basis.executionBasis }), null,
      "another job's execution basis cannot authenticate this child");
  }
  return { jobs: owners.length, exactNativeRederivations: owners.length, crossJobRefusals: owners.length * 4, paidCalls: 0 };
}
const schemaVersion = "5.0.0";
export const intakeIds = Object.freeze({
  productId: "product://generic-job-mechanics.example/builder@5",
  packageName: "@abiogenesis-fixtures/generic-job-mechanics", packageVersion: "5.0.0",
  moduleRef: "module://generic-job-mechanics.example/builder@5",
  programRef: "program://generic-job-mechanics.example/child-intake@5",
  graphFunctionRef: "graph-function://generic-job-mechanics.example/root@5",
  intakeRef: "graph-function://generic-job-mechanics.example/intake@5",
  lifecycleRef: "declaration://generic-job-mechanics.example/lifecycle@5",
});
const ref = (kind, name) => kind + "://generic-job-mechanics.example/" + name + "@5";
/** Mechanical installed consumer data only. No request/oracle/layout is a member. */
export function genericIntakePublicationData({ gtl, abiPublication }) {
  const D = gtl.SEMANTIC_STAGE_IDS, ids = intakeIds;
  const nativeBasis = { productId: abiPublication.owningProductId, artifactDigest: abiPublication.artifactDigest,
    productContentDigest: abiPublication.productContentDigest, productManifestDigest: abiPublication.productManifestDigest,
    packageName: abiPublication.productSemanticsBinding.packageName, packageVersion: abiPublication.productSemanticsBinding.packageVersion };
  const semantic = gtl.constructSemanticStageModulePublication(nativeBasis);
  const c1 = gtl.constructWorksiteConstructionModulePublication(nativeBasis);
  const c2 = gtl.constructWorksiteCommandExecutionModulePublication(nativeBasis);
  const stage = {
    declarationRef: ref("stage", "intent"), graphFunctionRef: ref("graph-function", "intent"),
    authorLocusRef: ref("locus", "intent-author"), assessorLocusRef: ref("locus", "intent-assessor"), predecessorStageRefs: [],
    assetSurface: { kind: "ordinary_job_intent", requiredContexts: [D.jobSourceContextRoleRef], standardsRefs: [],
      outputContractRefs: [D.workerContractRef], constructorRef: D.constructorRef, rendererRef: D.rendererRef, proofObligationRefs: [], authoritySlots: [] },
    purpose: "Interpret the ordinary source without substituting caller-solved Requirements or Design.",
    requiredContent: ["Source-grounded intent and unresolved pressure"], rubric: [{ criterionRef: ref("criterion", "source"), instruction: "Assess source grounding and retain unresolved pressure." }],
    bodyCapabilities: [], assembly: { ruleRef: ref("rule", "intent"), graphFunctionRef: ref("graph-function", "intent"),
      sectionOrder: ["role", "source", "obligations", "predecessors", "worksite", "evidence", "task", "response"],
      contentPolicy: "full_source_and_predecessors", proportionalityPolicy: "declared_semantic_assessment", maxPromptBytes: 1048576 },
  };
  const lifecycle = gtl.constructSemanticJobLifecycleDeclaration({ kind: "semantic_job_lifecycle_declaration", schemaVersion,
    declarationRef: ids.lifecycleRef, intakeGraphFunctionRef: ids.intakeRef, sourceRoleRef: D.jobSourceContextRoleRef,
    bounds: { maxSourceMembers: 20, maxSourceBytes: 1048576, maxContextFiles: 50, maxContextBytes: 1048576, maxTargets: 20, maxCommands: 5 },
    proofTemplates: [{ templateRef: ref("proof-template", "native-check"),
      realizationContractRef: c1.contracts.find(c => c.valueKind === "worksite_construction_result").contractRef,
      proofContractRef: c2.contracts.find(c => c.valueKind === "worksite_command_execution_observation").contractRef,
      requiredEvidenceRoles: ["realization", "verifier_artifact", "verifier_execution", "semantic_assessment"], sharedBasis: [], requiredContent: [] }],
    stages: [stage] });
  const close = (name, predicateRef, resultContractRef, closureScope) => gtl.constructSemanticClosureContract({
    closureContractRef: ref("contract", name), predicateRef, resultContractRef, closureScope });
  const closures = [close("root-close", D.jobIntakePredicateRef, D.outputContractRef, "run"),
    close("intake-close", D.jobIntakePredicateRef, D.envelopeContractRef, "graph_call"),
    close("stage-close", D.assessorPredicateRef, D.envelopeContractRef, "graph_call")];
  const intake = gtl.constructSemanticJobGraphFunction({ graphFunctionRef: ids.intakeRef, nodeRef: ids.intakeRef + "/node",
    closureContractRef: closures[1].closureContractRef, lifecycleRef: ids.lifecycleRef, operation: "intake" });
  const stageGraph = gtl.constructSemanticStageGraphFunction(stage, closures[2].closureContractRef);
  const terminal = gtl.constructSemanticBridgeGraphFunction({ graphFunctionRef: ids.graphFunctionRef, nodeRef: ids.graphFunctionRef + "/terminal",
    closureContractRef: closures[0].closureContractRef, operation: "envelope_output" });
  const nodeRef = ids.graphFunctionRef + "/root";
  const root = { ...terminal, inputs: [D.jobInputContractRef],
    environment: { requires: [D.jobInputContractRef], provides: [D.outputContractRef], carries: [D.envelopeContractRef] },
    declarations: { ...terminal.declarations, "abg.judgment_predicate": D.jobIntakePredicateRef },
    template: { kind: "inline_graph", graphRef: ids.graphFunctionRef + "/graph", startNodeRef: nodeRef,
      terminalNodeRefs: [terminal.template.startNodeRef], edges: [gtl.graphEdge({ fromNodeRef: nodeRef, toNodeRef: terminal.template.startNodeRef })], applications: [],
      nodes: [{ nodeRef, nodeKind: "c_locus", term: gtl.workflow.C(gtl.cGraphFunctionRef({ graphFunctionRef: ids.intakeRef,
          input: gtl.cCarrier(D.jobInputContractRef), output: gtl.cCarrier(D.envelopeContractRef) })) }, terminal.template.nodes[0]] } };
  delete root.declarations["abg.child_closure_contract"];
  const graphs = [root, intake, stageGraph], program = { kind: "gtl_program", programRef: ids.programRef, version: schemaVersion,
    moduleRef: ids.moduleRef, starts: [{ startRef: ref("start", "intake"), graphFunctionRef: root.name }],
    callableMembership: graphs.map(g => g.name), closureContractRef: closures[0].closureContractRef,
    policies: { "abg.root_mode": "direct", "abg.compute_regime": "mixed", "abg.default_start_ref": ref("start", "intake"), "abg.semantic_lifecycle": ids.lifecycleRef } };
  const extraContracts = lifecycle.proofTemplates.flatMap(t => [c1.contracts.find(c => c.contractRef === t.realizationContractRef),
    c2.contracts.find(c => c.contractRef === t.proofContractRef)]);
  // Native contract/implementation values are reused; no test implementation exists.
  const neededBindings = [D.jobIntakeBindingRef, D.terminalBindingRef, D.authorBindingRef, D.assessorBindingRef];
  return { moduleRef: ids.moduleRef, owningProductId: ids.productId, descriptorRef: ref("descriptor", "builder"),
    contributionManifestRef: ref("contribution-manifest", "builder"), productSemanticsBinding: semantic.productSemanticsBinding,
    semanticJobLifecycle: lifecycle, contracts: closures.map(c => ({ contractRef: c.closureContractRef, contractKind: "closure", contractVersion: schemaVersion, valueKind: "semantic_stage_closure" })),
    implementationBindings: [],
    evaluators: [], rules: [], closureContracts: closures, programs: [program], graphFunctions: graphs,
    contributions: graphs.map(g => ({ handle: g.name, kind: "graph_function", declarationOrContractRef: g.name,
      owningProductId: ids.productId, programMembershipRefs: [ids.programRef], readinessPrerequisiteRefs: [ids.programRef], compatibilityRefs: ["compatibility://abiogenesis/major/5"] })) };
}
export async function prepareGenericJobIntakeProduct({ scratch, product, gtl, abiPublication, abiPackageArchivePath, declarationFactory = genericIntakePublicationData }) {
  const ids = intakeIds, data = declarationFactory({ product, gtl, abiPublication });
  const sourceRoot = join(scratch, "generic-job-data-product"), graph = product.constructCapabilityDefinitionGraph([]);
  const graphBytes = product.capabilityDefinitionGraphAssetBytes(graph), graphCoordinate = product.capabilityDefinitionGraphCoordinate(graph);
  // The declared managed ABI dependency is materialized from the exact ABI archive.
  const values = { "package.json": { name: ids.packageName, version: ids.packageVersion, type: "module", exports: { "./publication": "./build/publication.json" },
    files: ["build", "contracts", "product-toolchain-manifest.json"],
    dependencies: { [abiPublication.productSemanticsBinding.packageName]: `file:${abiPackageArchivePath}` } }, "build/publication.json": data,
    "contracts/public-contract-catalog.schema.json": { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object" } };
  await mkdir(sourceRoot);
  for (const [path, value] of Object.entries(values)) { await mkdir(dirname(join(sourceRoot, path)), { recursive: true });
    await writeFile(join(sourceRoot, path), product.canonicalJson(value) + "\n", { flag: "wx" }); }
  const graphPath = product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH;
  await mkdir(dirname(join(sourceRoot, graphPath)), { recursive: true }); await writeFile(join(sourceRoot, graphPath), graphBytes, { flag: "wx" });
  const locators = Object.keys(values).sort(), inventory = await Promise.all(locators.map(async path => ({ path, sha256: await product.sha256File(join(sourceRoot, path)) })));
  const productContentDigest = product.payloadInventoryDigest(inventory), placeholder = "sha256:" + "0".repeat(64);
  const materialize = (basis, installedData = data) => gtl.modulePublication({ kind: "module_publication", moduleVersion: schemaVersion, ...installedData,
    artifactDigest: basis.artifactDigest, productContentDigest: basis.productContentDigest, productManifestDigest: basis.manifestDigest,
    contributions: installedData.contributions.map(c => ({ ...c, provenanceRefs: [basis.artifactDigest, basis.manifestDigest] })) });
  const draft = materialize({ artifactDigest: placeholder, productContentDigest, manifestDigest: placeholder });
  const catalogBody = { schemaVersion, catalogId: ref("catalog", "public"), catalogVersion: schemaVersion,
    catalogSchemaPath: "contracts/public-contract-catalog.schema.json", catalogSchemaDigest: inventory.find(r => r.path.startsWith("contracts/")).sha256, rows: [] };
  const catalog = { ...catalogBody, catalogDigest: product.sha256Canonical(catalogBody) };
  const contributionManifest = { kind: "product_contribution_manifest", schemaVersion, contributionManifestRef: data.contributionManifestRef,
    productId: ids.productId, productVersion: ids.packageVersion, descriptorRef: data.descriptorRef, productContentDigest,
    publicContractCatalogId: catalog.catalogId, publicContractCatalogDigest: catalog.catalogDigest, capabilityDefinitionGraph: graphCoordinate,
    publicationBindings: [{ moduleRef: data.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(draft) }],
    rows: draft.contributions.map(({ provenanceRefs: _p, ...c }) => ({ ...c, moduleRef: data.moduleRef, provenanceRef: ref("provenance", "builder") })) };
  const manifest = { kind: "abg_product_toolchain_manifest", schemaVersion, productId: ids.productId,
    packageName: ids.packageName, packageVersion: ids.packageVersion, productContentDigest, productRelativeLocators: locators,
    descriptorRef: data.descriptorRef, publisherNamespace: "generic-job-mechanics.example", contributionManifestRef: data.contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest), contributionManifest, compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    declaredDependencies: [{ kind: "requires", productId: abiPublication.owningProductId, packageVersion: abiPublication.productSemanticsBinding.packageVersion,
      compatibilityRef: "compatibility://abiogenesis/major/5", requiredContractRefs: ["abg.contract.gtl.root-declaration", "abg.schema.public-operation-invocation"],
      requiredCapabilityRefs: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.gtl.declare@5"] }],
    provenanceRef: ref("provenance", "builder"), declaredCapabilityRefs: [], capabilityDefinitionGraph: { ...graphCoordinate,
      assetLocator: { path: graphPath, mediaType: "application/json", schemaVersion, contentDigest: product.sha256Bytes(graphBytes) } }, publicContractCatalog: catalog };
  await writeFile(join(sourceRoot, "product-toolchain-manifest.json"), product.canonicalJson(manifest) + "\n", { flag: "wx" });
  const artifacts = join(sourceRoot, "artifacts"); await mkdir(artifacts);
  const { stdout } = await exec("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts], { cwd: sourceRoot, maxBuffer: 10485760 });
  const artifactPath = join(artifacts, JSON.parse(stdout)[0].filename), basis = { productId: ids.productId, packageName: ids.packageName, packageVersion: ids.packageVersion,
    artifactDigest: await product.sha256File(artifactPath), productContentDigest, manifestDigest: product.sha256Canonical(manifest) };
  return { ids, artifactPath, artifactRef: basename(artifactPath), basis, sourceRoot,
    async loadInstalledPublication({ installedRoot }) { const bytes = await readFile(join(installedRoot, "build/publication.json"));
      assert.equal(product.sha256Bytes(bytes), inventory.find(r => r.path === "build/publication.json").sha256);
      return materialize(basis, JSON.parse(bytes)); } };
}
export function ordinaryJob(product, gtl, text, { readRoots = ["app"] } = {}) {
  return product.constructSemanticJobInput({ kind: "semantic_job_input", schemaVersion, lifecycleRef: intakeIds.lifecycleRef,
    sourceRoleRef: gtl.SEMANTIC_STAGE_IDS.jobSourceContextRoleRef, members: [{ memberRef: ref("member", "request"), path: "request.txt",
      sourceLocator: "input://generic-job-mechanics/ordinary-request", base64: Buffer.from(text).toString("base64") }],
    taskData: {}, evaluationData: {}, worksiteScope: { readRoots, writeRoots: ["app"], parentWriteRoots: ["app"], evidenceWriteRoots: ["proof"],
      executableCapabilities: [{ executable: process.execPath, relativeCwdRoots: ["."], environment: {}, maxTimeoutMs: 5000, maxTerminationGraceMs: 1000 }] } });
}
/** One generic intake start through the shipped SDK constructor; the Product
 * run owner populates request and authority, an input factory may name the
 * populated grant. Support supplies scenario data only. */
export async function constructGenericIntakeStart({ environment, publicApi, eventResource, input, inputFactory, identity, programRef }) {
  const { abg, catalog, catalogView, admittedInstalls, workspaceBinding, additionalProducts: [fixture] } = environment;
  assert.ok(inputFactory === undefined || input === undefined, "one input source per native start");
  const constructed = await publicApi.constructInstalledStartCall({
    selection: Object.freeze({ memberKey: "start", target: Object.freeze({ kind: "next" }), rootMode: "direct", fhMode: "direct" }),
    programRef: programRef ?? fixture.ids.programRef,
    catalog,
    catalogView,
    applications: Object.freeze([]),
    admittedInstalls,
    workspaceBinding,
    verifyInstallAdmission: (install) => abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    actorRef: workspaceBinding.authorizedActorRef,
    input: inputFactory === undefined ? Object.freeze({ value: input })
      : Object.freeze({ factory: ({ grants, resolution }) => inputFactory({ grants, resolution }) }),
    inputValueRef: `value://generic-job-mechanics.example/${identity}/job-input`,
    source: Object.freeze({ kind: "none" }),
    applicationResources: Object.freeze([]),
    eventResource,
    envelope: Object.freeze({
      definitionContractCoordinates: environment.verified.definitionContractCoordinates,
      requestRef: `public-request://generic-job-mechanics.example/${identity}/run-start`,
      correlationRef: `correlation://generic-job-mechanics.example/${identity}/run-start`,
      eventTime: identity === "st-1"
        ? "2026-08-21T00:00:00.000Z"
        : "2026-08-22T01:00:00.000Z",
      provenanceRefs: [`provenance://generic-job-mechanics.example/${identity}-worker`],
    }),
  });
  if (constructed.kind !== "installed_start_call") assert.fail(JSON.stringify(constructed));
  const { population } = constructed;
  return {
    call: constructed.call,
    resolution: population.resolution,
    capabilityBasis: Object.freeze({
      actorRef: workspaceBinding.authorizedActorRef,
      capabilityGrants: population.grants,
      policy: population.policy,
      productInstalls: admittedInstalls,
      program: population.resolution.program,
      programValidation: population.resolution.programValidation,
      workspaceBinding,
    }),
  };
}
