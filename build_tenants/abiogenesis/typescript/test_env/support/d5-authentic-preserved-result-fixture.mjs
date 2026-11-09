import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { setupInstalledRootCatalog, setupInstalledRootInvocation } from "./root-installed-environment.mjs";

// Test-owned declaration bundle and workflow-root driver for the preserved
// Construction proposal consumer. Every runtime coordinate comes from the
// installed owners; the only controlled premises are the semantic candidates
// and the Construction protocol bytes emitted by the explicit local executable.
const exec = promisify(execFile);
const schemaVersion = "5.0.0";
const placeholder = `sha256:${"0".repeat(64)}`;
const scope = "abi5-tests/d5-recovery";
export const D5_RECOVERY_IDS = Object.freeze({
  productId: `product://${scope}@5.0.0`, packageName: "@abi5-tests/d5-recovery", packageVersion: "5.0.0",
  moduleRef: `module://${scope}@5`, descriptorRef: `descriptor://${scope}@5`, contributionManifestRef: `contribution-manifest://${scope}@5`,
  sourceProductId: `product://${scope}-source@5.0.0`, sourcePackageName: "@abi5-tests/d5-recovery-source",
  sourceModuleRef: `module://${scope}/source@5`, sourceDescriptorRef: `descriptor://${scope}/source@5`,
  sourceContributionManifestRef: `contribution-manifest://${scope}/source@5`,
  sourceDeclarationRef: `declaration://${scope}/source@5`, sourceGraphFunctionRef: `graph-function://${scope}/source@5`,
  sourceProgramRef: `program://${scope}/source@5`, sourceStartRef: `start://${scope}/source@5`, sourceGraphRef: `graph://${scope}/source@5`,
  sourceClosureRef: `contract://${scope}/source/closure@5`, sourceRoleRef: `role://${scope}/source@5`,
  contextRef: `context://${scope}/source@5`, memberRef: `member://${scope}/source@5`,
  requirementRef: `requirement://${scope}/answer@5`, obligationRef: `obligation://${scope}/answer@5`,
  realizationContractRef: `contract://${scope}/realization@5`, proofContractRef: `contract://${scope}/proof@5`,
  proofPolicyRef: `policy://${scope}/answer@5`, proofShapeRef: `shape://${scope}/answer@5`,
  lifecycleRef: `declaration://${scope}/lifecycle@5`, stageRef: `declaration://${scope}/design@5`,
  stageGraphFunctionRef: `graph-function://${scope}/design@5`, authorLocusRef: `locus://${scope}/design/author@5`,
  assessorLocusRef: `locus://${scope}/design/assessor@5`, criterionRef: `criterion://${scope}/design/targets-and-command@5`,
  preparationGraphFunctionRef: `graph-function://${scope}/preparation@5`, preparationClosureRef: `contract://${scope}/preparation/closure@5`,
  programRef: `program://${scope}/semantic@5`, startRef: `start://${scope}/semantic@5`, graphFunctionRef: `graph-function://${scope}/semantic@5`,
  commandId: `command://${scope}/verify@5`,
});
export const D5_SOURCE_TEXT = "Implement answer() returning 42 and verify it.\n";
export const D5_SOURCE_QUOTE = "Implement answer() returning 42 and verify it.";
export const D5_IMPLEMENTATION_PREIMAGE = "export const answer = () => 0;\n";
export const D5_IMPLEMENTATION_PROPOSAL = "export const answer = () => 42;\n";
export const D5_VERIFIER_TEXT = "import { strict as assert } from 'node:assert';\nimport { answer } from './app.mjs';\nassert.equal(answer(), 42);\n";
export const D5_PROTOCOL = Object.freeze({ sessionId: "d5-controlled-session", toolUseId: "d5-proposal",
  acknowledgment: "Structured output provided successfully" });
export const D5_TRANSPORT_MODES = Object.freeze(["proposal", "nonzero", "timeout", "crossed_id", "crossed_session"]);

function sourceDeclaration(gtl, product) {
  const ids = D5_RECOVERY_IDS, bytes = Buffer.from(D5_SOURCE_TEXT);
  const member = { memberRef: ids.memberRef, path: "source/answer.md", byteCount: bytes.length, digest: product.sha256Bytes(bytes) };
  const binding = { contextRef: ids.contextRef, memberRef: ids.memberRef, memberDigest: member.digest, startByte: 0,
    endByte: bytes.length, spanDigest: member.digest };
  const declaration = gtl.constructRequirementHandoffDeclaration({ declarationRef: ids.sourceDeclarationRef,
    graphFunctionRef: ids.sourceGraphFunctionRef, sourceRoleRef: ids.sourceRoleRef,
    context: { contextRef: ids.contextRef, sourceLocator: ids.sourceProductId, inventoryDigest: product.sha256Canonical([member]), members: [member] },
    terms: [{ requirementRef: ids.requirementRef, sourceBindings: [binding] }],
    fulfillmentBindings: [{ requirementRef: ids.requirementRef, obligationRef: ids.obligationRef,
      realizationContractRef: ids.realizationContractRef, proofContractRef: ids.proofContractRef,
      proofPolicyRef: ids.proofPolicyRef, proofShapeRef: ids.proofShapeRef }] });
  const input = product.constructRequirementHandoffInput({ kind: "requirement_handoff_input", schemaVersion,
    declarationRef: declaration.declarationRef, sourceRoleRef: declaration.sourceRoleRef,
    members: [{ memberRef: ids.memberRef, base64: bytes.toString("base64") }] });
  return { declaration, input, binding };
}

function lifecycleDeclaration(gtl, product, binding) {
  const ids = D5_RECOVERY_IDS, S = gtl.SEMANTIC_STAGE_IDS;
  const taskData = {}, evaluationData = {};
  const stage = { declarationRef: ids.stageRef, graphFunctionRef: ids.stageGraphFunctionRef,
    authorLocusRef: ids.authorLocusRef, assessorLocusRef: ids.assessorLocusRef, predecessorStageRefs: [],
    assetSurface: { kind: "d5_recovery_worksite_design", requiredContexts: [ids.contextRef], standardsRefs: [],
      outputContractRefs: [S.workerContractRef], constructorRef: S.constructorRef, rendererRef: S.rendererRef,
      proofObligationRefs: [ids.obligationRef], authoritySlots: [] },
    purpose: "Pair the granted implementation and verifier targets with the source obligation and select the one declared command.",
    requiredContent: ["One selected implementation and one selected verifier tied to the same obligation, and the declared command."],
    rubric: [{ criterionRef: ids.criterionRef,
      instruction: "Assess whether the Design pairs both granted targets with the source obligation and selects only the declared command." }],
    bodyCapabilities: ["worksite_design"],
    assembly: { ruleRef: `${ids.stageRef}/assembly`, graphFunctionRef: ids.stageGraphFunctionRef,
      sectionOrder: ["role", "source", "obligations", "predecessors", "worksite", "evidence", "task", "response"],
      proportionalityPolicy: "declared_semantic_assessment", maxPromptBytes: 1_000_000, contentPolicy: "role_scoped_worksite",
      worksiteContentByRole: { author: "current_inventory", assessor: "current_inventory" } } };
  const lifecycle = gtl.constructSemanticLifecycleDeclaration({ declarationRef: ids.lifecycleRef,
    sourceDeclarationRef: ids.sourceDeclarationRef, taskDataDigest: product.sha256Canonical(taskData),
    evaluationDataDigest: product.sha256Canonical(evaluationData),
    proofPolicies: [{ policyRef: ids.proofPolicyRef, sourceRequirementRef: ids.requirementRef, sourceBindings: [binding],
      scope: "controlled D5 recovery composition fixture", realizationMeaning: ["The implementation returns 42."],
      proofMeaning: ["The verifier invokes the implementation and checks 42."],
      unprovedScope: ["Semantic model quality, application qualification, and command execution are not established by this preserved-proposal fixture."],
      closureRule: "The fixture selects its two target roles and preserves exact owner joins; only the read-only recovery projection is claimed.",
      obligationRef: ids.obligationRef }],
    proofShapes: [{ proofShapeRef: ids.proofShapeRef,
      requiredEvidenceRoles: ["realization", "verifier_artifact", "verifier_execution", "semantic_assessment"],
      sharedBasis: ["complete_source", "requirement_and_obligation", "current_worksite", "admitted_result"],
      requiredContent: ["One selected implementation and one selected verifier tied to the same obligation."],
      nativeCarrierBoundary: "Actual owners issue the source, asset, assessment, bridge, Construction and physical-process coordinates; the controlled semantic candidate is a test premise.",
      requirementRef: ids.requirementRef, obligationRef: ids.obligationRef,
      roleContractRefs: { realization: ids.realizationContractRef, proof: ids.proofContractRef } }],
    stages: [stage] });
  return { lifecycle, stage, taskData, evaluationData };
}

// select -> workflow.C(Construction) -> prepare (retained entry) -> workflow.C(C2).
function preparationGraph(gtl, product, natives) {
  const ids = D5_RECOVERY_IDS, c1 = product.WORKSITE_CONSTRUCTION_IDS, c2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
  const p = product.WORKSITE_PREPARATION_IDS;
  const all = natives.flatMap(x => x.graphFunctions);
  const c1Graph = all.find(g => g.name === c1.graphFunctionRef), c2Graph = all.find(g => g.name === c2.graphFunctionRef);
  assert.ok(c1Graph && c2Graph, "installed Construction and C2 GraphFunctions");
  const c2Publication = natives.find(x => x.graphFunctions.includes(c2Graph));
  const name = ids.preparationGraphFunctionRef, node = role => `${name}/${role}`;
  const pure = (role, bindingRef, predicateRef) => {
    const binding = c2Publication.implementationBindings.find(b => b.bindingRef === bindingRef);
    assert.ok(binding, `installed preparation binding ${bindingRef}`);
    return { nodeRef: node(role), nodeKind: "c_locus", term: gtl.C.of({
      input: gtl.cCarrier(binding.inputContractRef), output: gtl.cCarrier(binding.outputContractRef),
      programLocusRef: node(role), stageRole: role, fibre: "F_D", armId: `${node(role)}/arm`,
      compositionRef: null, vectorIndex: 0, judgmentPredicateRef: predicateRef, resultBearing: false,
      requirement: { kind: "executable_leaf_requirement", implementationBindingRef: bindingRef,
        inputContractRef: binding.inputContractRef, outputContractRef: binding.outputContractRef,
        evidenceContractRef: c2.evidenceContractRef, failureContractRef: binding.failureContractRef,
        refusalContractRef: binding.refusalContractRef, judgmentContractRef: c2.judgmentContractRef } }) };
  };
  const call = (role, graph) => ({ nodeRef: node(role), nodeKind: "c_locus",
    term: gtl.workflow.C(gtl.cGraphFunctionRef({ graphFunctionRef: graph.name,
      input: gtl.cCarrier(graph.inputs[0]), output: gtl.cCarrier(graph.outputs[0]) })) });
  const provided = [c1.taskContractRef, c1.resultContractRef, p.boundInputContractRef, c2.taskContractRef, c2.observationContractRef];
  const graph = { kind: "graph_function", name, version: schemaVersion,
    environment: { requires: [p.inputContractRef], provides: provided, carries: [p.inputContractRef, ...provided] },
    inputs: [p.inputContractRef], outputs: [c2.observationContractRef], effects: [...new Set([...c1Graph.effects, ...c2Graph.effects])],
    tags: ["d5-recovery-preparation"],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": ids.preparationClosureRef,
      "abg.child_closure_contract": ids.preparationClosureRef, "abg.failure_contract": c2.failureContractRef,
      "abg.evidence_contract": c2.evidenceContractRef, "abg.judgment_contract": c2.judgmentContractRef,
      "abg.judgment_predicate": p.rootPredicateRef, "abg.transition_contract": c2.transitionContractRef },
    template: { kind: "inline_graph", graphRef: `${name}/graph`, startNodeRef: node("select"), terminalNodeRefs: [node("execute")],
      nodes: [pure("select", p.selectBindingRef, p.selectPredicateRef), call("construct", c1Graph),
        pure("prepare", p.prepareBindingRef, p.preparePredicateRef), call("execute", c2Graph)],
      edges: [gtl.graphEdge({ fromNodeRef: node("select"), toNodeRef: node("construct") }),
        gtl.graphEdge({ fromNodeRef: node("construct"), toNodeRef: node("prepare"), inputBinding: product.worksiteRetentionBinding(false) }),
        gtl.graphEdge({ fromNodeRef: node("prepare"), toNodeRef: node("execute") })], applications: [] } };
  const closure = gtl.closureContract({ ...c2Publication.closureContracts.find(c => c.closureContractRef === c2.closureContractRef),
    closureContractRef: ids.preparationClosureRef, predicateRef: p.rootPredicateRef, closureScope: "graph_call",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] });
  return { graph, closure,
    closureDeclaration: { ...c2Publication.contracts.find(c => c.contractRef === c2.closureContractRef), contractRef: ids.preparationClosureRef },
    membership: [c1.graphFunctionRef, c1.vectorApplicationGraphFunctionRef, c1.fileReplaceGraphFunctionRef, c1.reducerGraphFunctionRef, c2.graphFunctionRef] };
}

const contribution = (productId, programRef) => g => ({ handle: g.name, kind: "graph_function", declarationOrContractRef: g.name,
  owningProductId: productId, programMembershipRefs: [programRef], readinessPrerequisiteRefs: [programRef],
  compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [placeholder, placeholder] });

/** Two consumer publications in two test Products: the requirement-handoff
 * source (its own ABI handoff semantics) and the semantic lifecycle/Program
 * (ABI semantic-stage semantics), which depends on the source Product. */
function d5Publications(gtl, product, abiBasis) {
  const ids = D5_RECOVERY_IDS, S = gtl.SEMANTIC_STAGE_IDS, P = product.WORKSITE_PREPARATION_IDS;
  const natives = [gtl.constructWorksiteConstructionModulePublication, gtl.constructWorksiteCommandExecutionModulePublication,
    gtl.constructRequirementHandoffModulePublication, gtl.constructSemanticStageModulePublication].map(construct => construct(abiBasis));
  const [, , nativeHandoff, nativeSemantic] = natives;
  const source = sourceDeclaration(gtl, product);
  const { lifecycle, stage, taskData, evaluationData } = lifecycleDeclaration(gtl, product, source.binding);
  const sourcePublication = gtl.constructRequirementHandoffConsumerPublication({ productId: ids.sourceProductId,
    packageName: ids.sourcePackageName, packageVersion: ids.packageVersion, artifactDigest: placeholder,
    productContentDigest: placeholder, productManifestDigest: placeholder }, nativeHandoff, source.declaration, {
    moduleRef: ids.sourceModuleRef, programRef: ids.sourceProgramRef, startRef: ids.sourceStartRef, graphRef: ids.sourceGraphRef,
    closureContractRef: ids.sourceClosureRef, descriptorRef: ids.sourceDescriptorRef, contributionManifestRef: ids.sourceContributionManifestRef }, [
    { contractRef: ids.realizationContractRef, contractVersion: schemaVersion, contractKind: "output", valueKind: "worksite_construction_result" },
    { contractRef: ids.proofContractRef, contractVersion: schemaVersion, contractKind: "output", valueKind: "worksite_command_execution_observation" }]);
  const closures = [];
  const close = (label, predicateRef, resultContractRef, closureScope = "graph_call") => {
    const closureContractRef = `contract://${scope}/${label}/closure@5`;
    closures.push(gtl.constructSemanticClosureContract({ closureContractRef, predicateRef, resultContractRef, closureScope }));
    return closureContractRef;
  };
  const stageGraph = gtl.constructSemanticStageGraphFunction(stage, close("design-stage", S.assessorPredicateRef, S.envelopeContractRef));
  const bridge = (label, operation, predicateRef, resultContractRef) => gtl.constructSemanticBridgeGraphFunction({
    graphFunctionRef: `graph-function://${scope}/${label}@5`, nodeRef: `node://${scope}/${label}@5`, operation,
    closureContractRef: close(label, predicateRef, resultContractRef) });
  const worksite = preparationGraph(gtl, product, natives);
  const chain = [stageGraph, bridge("design-worksite", "design_worksite", S.bridgePredicateRef, P.inputContractRef), worksite.graph,
    bridge("evidence-input", "evidence_input", S.evidenceInputPredicateRef, S.envelopeContractRef),
    bridge("terminal", "envelope_output", S.terminalPredicateRef, S.outputContractRef)];
  const rootClosureRef = close("root", S.lifecyclePredicateRef, S.outputContractRef, "run");
  const nodes = chain.map((g, i) => ({ nodeRef: `${ids.graphFunctionRef}/step-${i}`, nodeKind: "c_locus",
    term: gtl.workflow.C(gtl.cGraphFunctionRef({ graphFunctionRef: g.name, input: gtl.cCarrier(g.inputs[0]), output: gtl.cCarrier(g.outputs[0]) })) }));
  const carried = [...new Set(chain.flatMap(g => [...g.inputs, ...g.outputs]))];
  const root = { kind: "graph_function", name: ids.graphFunctionRef, version: schemaVersion,
    environment: { requires: [S.envelopeContractRef], provides: carried, carries: carried },
    inputs: [S.envelopeContractRef], outputs: [S.outputContractRef], effects: [...new Set(chain.flatMap(g => g.effects))],
    tags: ["d5-recovery-fixture"],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": rootClosureRef, "abg.evidence_contract": S.evidenceContractRef,
      "abg.judgment_contract": S.judgmentContractRef, "abg.judgment_predicate": S.lifecycleStepPredicateRef,
      "abg.transition_contract": S.transitionContractRef, "abg.failure_contract": S.failureContractRef },
    template: { kind: "inline_graph", graphRef: `${ids.graphFunctionRef}/graph`, startNodeRef: nodes[0].nodeRef,
      terminalNodeRefs: [nodes.at(-1).nodeRef], nodes,
      edges: nodes.slice(1).map((n, i) => gtl.graphEdge({ fromNodeRef: nodes[i].nodeRef, toNodeRef: n.nodeRef })), applications: [] } };
  const semanticGraphs = [...chain, root];
  const nativeClose = nativeSemantic.contracts.find(c => c.contractRef === S.closureContractRef);
  const lifecyclePublication = gtl.modulePublication({ kind: "module_publication", moduleVersion: schemaVersion, moduleRef: ids.moduleRef,
    owningProductId: ids.productId, artifactDigest: placeholder, productContentDigest: placeholder, productManifestDigest: placeholder,
    descriptorRef: ids.descriptorRef, contributionManifestRef: ids.contributionManifestRef,
    productSemanticsBinding: nativeSemantic.productSemanticsBinding, semanticLifecycle: lifecycle,
    contracts: [...closures.map(c => ({ ...nativeClose, contractRef: c.closureContractRef })), worksite.closureDeclaration],
    evaluators: [], rules: [], implementationBindings: [], closureContracts: [...closures, worksite.closure],
    graphFunctions: semanticGraphs,
    programs: [{ kind: "gtl_program", programRef: ids.programRef, version: schemaVersion, moduleRef: ids.moduleRef,
      starts: [{ startRef: ids.startRef, graphFunctionRef: ids.graphFunctionRef }],
      callableMembership: [...new Set([...semanticGraphs.map(g => g.name), ...worksite.membership])], closureContractRef: rootClosureRef,
      policies: { "abg.root_mode": "direct", "abg.compute_regime": "mixed", "abg.default_start_ref": ids.startRef,
        "abg.semantic_lifecycle": lifecycle.declarationRef } }],
    contributions: semanticGraphs.map(contribution(ids.productId, ids.programRef)) });
  return { sourcePublication, lifecyclePublication, source, lifecycle, stage, taskData, evaluationData };
}

// Physically packaged test Product, following the existing test Product
// pattern: actual payload inventory, contribution/semantic digests and archive.
async function packD5Product({ scratch, product, gtl, owner, publication, dependencies }) {
  const hash = x => product.sha256Canonical(x);
  const sourceRoot = join(scratch, `${owner.label}-product-source`);
  await mkdir(join(sourceRoot, "build"), { recursive: true });
  await mkdir(join(sourceRoot, "contracts/capabilities"), { recursive: true });
  const publicationPath = "build/publication.json";
  const payload = { "package.json": { name: owner.packageName, version: owner.packageVersion, type: "module",
    exports: { "./publication": `./${publicationPath}` }, files: ["build", "contracts", "product-toolchain-manifest.json"],
    dependencies: Object.fromEntries(dependencies.map(d => [d.packageName, `file:${d.archivePath}`])) },
    "contracts/public-contract-catalog.schema.json": { $schema: "https://json-schema.org/draft/2020-12/schema", type: "object" },
    [publicationPath]: publication };
  for (const [path, value] of Object.entries(payload)) {
    await mkdir(dirname(join(sourceRoot, path)), { recursive: true });
    await writeFile(join(sourceRoot, path), `${product.canonicalJson(value)}\n`);
  }
  const capabilityGraph = product.constructCapabilityDefinitionGraph([]);
  const graphBytes = product.capabilityDefinitionGraphAssetBytes(capabilityGraph);
  const graphCoordinate = product.capabilityDefinitionGraphCoordinate(capabilityGraph);
  await writeFile(join(sourceRoot, product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH), graphBytes);
  const productRelativeLocators = Object.keys(payload).sort();
  const inventory = await Promise.all(productRelativeLocators.map(async path => ({ path, sha256: await product.sha256File(join(sourceRoot, path)) })));
  const productContentDigest = product.payloadInventoryDigest(inventory);
  const materialize = (basis, data, publicationOwner = gtl) => publicationOwner.modulePublication({ ...structuredClone(data),
    artifactDigest: basis.artifactDigest, productContentDigest: basis.productContentDigest, productManifestDigest: basis.manifestDigest,
    contributions: data.contributions.map(c => ({ ...c, provenanceRefs: [basis.artifactDigest, basis.manifestDigest] })) });
  const draft = materialize({ artifactDigest: placeholder, productContentDigest, manifestDigest: placeholder }, publication);
  const catalogBody = { schemaVersion, catalogId: `catalog://${scope}/${owner.label}@5`, catalogVersion: schemaVersion,
    catalogSchemaPath: "contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest: await product.sha256File(join(sourceRoot, "contracts/public-contract-catalog.schema.json")), rows: [] };
  const publicContractCatalog = { ...catalogBody, catalogDigest: hash(catalogBody) };
  const provenanceRef = `provenance://${scope}/${owner.label}@5`;
  const contributionManifest = { kind: "product_contribution_manifest", schemaVersion, contributionManifestRef: draft.contributionManifestRef,
    productId: owner.productId, productVersion: owner.packageVersion, descriptorRef: draft.descriptorRef, productContentDigest,
    publicContractCatalogId: publicContractCatalog.catalogId, publicContractCatalogDigest: publicContractCatalog.catalogDigest,
    capabilityDefinitionGraph: graphCoordinate,
    publicationBindings: [{ moduleRef: draft.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(draft) }],
    rows: draft.contributions.map(c => ({ moduleRef: draft.moduleRef, handle: c.handle, kind: c.kind, declarationOrContractRef: c.declarationOrContractRef,
      owningProductId: c.owningProductId, programMembershipRefs: c.programMembershipRefs, compatibilityRefs: c.compatibilityRefs, provenanceRef,
      readinessPrerequisiteRefs: c.readinessPrerequisiteRefs })) };
  const manifest = { kind: "abg_product_toolchain_manifest", schemaVersion, productId: owner.productId, packageName: owner.packageName,
    packageVersion: owner.packageVersion, productContentDigest, productRelativeLocators, descriptorRef: draft.descriptorRef,
    publisherNamespace: "abi5-tests", contributionManifestRef: draft.contributionManifestRef, contributionManifestDigest: hash(contributionManifest),
    contributionManifest, compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    declaredDependencies: dependencies.map(d => ({ kind: "requires", productId: d.productId, packageVersion: d.packageVersion,
      compatibilityRef: "compatibility://abiogenesis/major/5", requiredContractRefs: d.requiredContractRefs,
      requiredCapabilityRefs: d.requiredCapabilityRefs })),
    provenanceRef, declaredCapabilityRefs: [], capabilityDefinitionGraph: { ...graphCoordinate, assetLocator: {
      path: product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH, mediaType: "application/json", schemaVersion,
      contentDigest: product.sha256Bytes(graphBytes) } }, publicContractCatalog };
  await writeFile(join(sourceRoot, "product-toolchain-manifest.json"), `${product.canonicalJson(manifest)}\n`);
  const artifacts = join(sourceRoot, "artifacts");
  await mkdir(artifacts);
  const { stdout } = await exec("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts], { cwd: sourceRoot, maxBuffer: 10_000_000 });
  const artifactPath = join(artifacts, JSON.parse(stdout)[0].filename);
  const basis = { productId: owner.productId, packageName: owner.packageName, packageVersion: owner.packageVersion,
    artifactDigest: await product.sha256File(artifactPath), manifestDigest: hash(manifest), productContentDigest };
  return { basis, artifactPath, artifactRef: basename(artifactPath), manifest, sourceRoot,
    async loadInstalledPublication({ installedRoot, gtl: installedGtl }) {
      const bytes = await readFile(join(installedRoot, publicationPath));
      assert.equal(product.sha256Bytes(bytes), inventory.find(row => row.path === publicationPath).sha256, "installed publication bytes");
      return materialize(basis, JSON.parse(bytes), installedGtl);
    } };
}

export async function prepareD5RecoveryProducts({ scratch, product, gtl, abiPublication, abiPackageArchivePath }) {
  assert.equal(await product.sha256File(abiPackageArchivePath), abiPublication.artifactDigest,
    "D5 fixture ABI archive differs from its publication");
  const ids = D5_RECOVERY_IDS;
  const abiBasis = { productId: abiPublication.owningProductId, artifactDigest: abiPublication.artifactDigest,
    productContentDigest: abiPublication.productContentDigest, productManifestDigest: abiPublication.productManifestDigest,
    packageName: abiPublication.productSemanticsBinding.packageName, packageVersion: abiPublication.productSemanticsBinding.packageVersion };
  const declared = d5Publications(gtl, product, abiBasis);
  const abiDependency = { productId: abiBasis.productId, packageName: abiBasis.packageName, packageVersion: abiBasis.packageVersion,
    archivePath: abiPackageArchivePath, requiredContractRefs: ["abg.contract.gtl.root-declaration", "abg.schema.public-operation-invocation"],
    requiredCapabilityRefs: ["abg.capability.catalog.invoke-graph-function@5", "abg.capability.gtl.declare@5"] };
  const source = await packD5Product({ scratch, product, gtl, publication: declared.sourcePublication, dependencies: [abiDependency],
    owner: { label: "d5-recovery-source", productId: ids.sourceProductId, packageName: ids.sourcePackageName, packageVersion: ids.packageVersion } });
  const lifecycle = await packD5Product({ scratch, product, gtl, publication: declared.lifecyclePublication, dependencies: [abiDependency,
    { productId: ids.sourceProductId, packageName: ids.sourcePackageName, packageVersion: ids.packageVersion, archivePath: source.artifactPath,
      requiredContractRefs: [], requiredCapabilityRefs: [] }],
    owner: { label: "d5-recovery", productId: ids.productId, packageName: ids.packageName, packageVersion: ids.packageVersion } });
  return { abiBasis, source, lifecycle, sourceDeclaration: declared.source, lifecycleDeclaration: declared.lifecycle,
    taskData: declared.taskData, evaluationData: declared.evaluationData };
}

// The explicit local executable selected through ABG_TS_CLAUDE_COMMAND. The
// semantic author/assessor candidates are controlled premises; Construction
// emits one StructuredOutput proposal and its acknowledgment without a result.
export async function installD5ControlledTransport(directory, mode) {
  assert.ok(D5_TRANSPORT_MODES.includes(mode), `known D5 transport mode ${mode}`);
  const path = join(directory, `d5-claude-${mode}`);
  await mkdir(directory, { recursive: true });
  const protocol = { ...D5_PROTOCOL,
    ackToolUseId: mode === "crossed_id" ? "d5-crossed-proposal" : D5_PROTOCOL.toolUseId,
    ackSessionId: mode === "crossed_session" ? "d5-crossed-session" : D5_PROTOCOL.sessionId };
  const code = `#!/usr/bin/env node
const mode = ${JSON.stringify(mode)}, protocol = ${JSON.stringify(protocol)};
const texts = ${JSON.stringify([D5_IMPLEMENTATION_PROPOSAL, D5_VERIFIER_TEXT])}, quoteText = ${JSON.stringify(D5_SOURCE_QUOTE)};
const commandRef = ${JSON.stringify(D5_RECOVERY_IDS.commandId)};
let prompt = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { prompt += chunk; });
process.stdin.on('end', () => {
  const flag = process.argv.indexOf('--json-schema');
  if (flag < 0 || process.argv[flag + 1] === undefined) throw new Error('missing declared response schema');
  const schema = JSON.parse(process.argv[flag + 1]);
  const emit = value => process.stdout.write(JSON.stringify(value) + '\\n');
  emit({ type: 'system', subtype: 'init', model: 'd5-controlled-transport' });
  if (schema.properties.files !== undefined) {
    const target = schema.properties.files.items.properties.targetRef;
    const refs = target.enum ?? [target.const];
    if (refs.length !== texts.length) throw new Error('D5 fixture expects exactly two task-derived targets');
    const input = { kind: 'worksite_construction_worker_result', schemaVersion: '5.0.0',
      files: refs.map((targetRef, index) => ({ kind: 'worksite_candidate_file', schemaVersion: '5.0.0', targetRef, replacementText: texts[index] })) };
    emit({ type: 'assistant', session_id: protocol.sessionId, message: { content: [{ type: 'tool_use', id: protocol.toolUseId, name: 'StructuredOutput', input }] } });
    emit({ type: 'user', session_id: protocol.ackSessionId, message: { content: [{ type: 'tool_result', tool_use_id: protocol.ackToolUseId, content: protocol.acknowledgment, is_error: false }] } });
    if (mode === 'nonzero') process.exitCode = 7;
    if (mode === 'timeout') setTimeout(() => {}, 600000);
    return;
  }
  const sections = {};
  for (const part of prompt.split(/^## /m).slice(1)) {
    const cut = part.indexOf('\\n');
    try { sections[part.slice(0, cut)] = JSON.parse(part.slice(cut + 1).trim()); } catch {}
  }
  const task = sections.task, source = sections.source[0];
  if (!source.text.includes(quoteText)) throw new Error('source section lacks the declared requirement text');
  const quote = { memberRef: source.memberRef, quote: quoteText };
  const obligations = sections.obligations.sourceDeclaration.fulfillmentBindings.map(b => b.obligationRef);
  const result = schema.properties.criteria !== undefined
    ? { kind: 'semantic_stage_assessment_candidate', schemaVersion: '5.0.0',
      criteria: task.rubric.map(c => ({ criterionRef: c.criterionRef, disposition: 'satisfied',
        explanation: 'Controlled D5 fixture premise; no semantic qualification.', sourceQuotes: [quote],
        statementRefs: sections.predecessors.at(-1).candidate.statements.map(s => s.statementRef) })), pressure: [] }
    : { kind: 'semantic_stage_asset_candidate', schemaVersion: '5.0.0',
      statements: [{ statementRef: task.stageRef + '/statement', text: 'Controlled D5 fixture design premise.', modality: 'supporting',
        sourceQuotes: [quote], requirementRefs: sections.obligations.sourceDeclaration.terms.map(t => t.requirementRef),
        obligationRefs: obligations, predecessorStatementRefs: [] }], requirementCandidates: [], pressure: [],
      worksiteDesign: { targets: sections.worksite.targets.map(row => ({ targetRef: row.target.targetRef, role: row.role,
        obligationRefs: obligations, changeInstruction: 'Implement the source requirement in the granted target.' })),
        commandRefs: [commandRef], dependencyTargetRefs: [], dependencyDisposition: 'sufficient' } };
  emit({ type: 'result', subtype: 'success', is_error: false, result: JSON.stringify(result), structured_output: result });
});
`;
  await writeFile(path, code);
  await chmod(path, 0o755);
  return path;
}

const PROVIDER_SELECTORS = ["ABG_TS_CLAUDE_COMMAND", "ABG_TS_CLAUDE_APPEND_ARGS", "ABG_TS_WORKER_SANDBOX",
  "ABG_TS_FP_TIMEOUT_MS", "ABG_TS_FP_ABSOLUTE_TIMEOUT_MS", "ABG_TS_FP_TERMINATION_GRACE_MS"];
/** Run one callback with only the explicitly selected local executable and
 * timer settings; every ambient provider selector is restored afterwards. */
export async function withSelectedTransport(selection, run) {
  const prior = Object.fromEntries(PROVIDER_SELECTORS.map(key => [key, process.env[key]]));
  for (const key of PROVIDER_SELECTORS) delete process.env[key];
  for (const [key, value] of Object.entries(selection)) {
    assert.ok(PROVIDER_SELECTORS.includes(key), `selected transport key ${key}`);
    process.env[key] = value;
  }
  assert.ok(typeof process.env.ABG_TS_CLAUDE_COMMAND === "string" && process.env.ABG_TS_CLAUDE_COMMAND.startsWith("/"),
    "D5 fixture requires one explicit local controlled executable");
  try { return await run(); } finally {
    for (const [key, value] of Object.entries(prior)) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
}

export function runtimeBasis(label) {
  return { eventTime: "2026-11-06T00:00:00.000Z", correlationId: `correlation://${scope}/${label}`, causationEventRefs: [] };
}

/** Installed ABI + two packaged test Products, actual install/workspace admissions and Catalog. */
export async function setupD5RecoveryEnvironment(context, packageRoot) {
  let d5;
  const environment = await setupInstalledRootCatalog(context, packageRoot, {
    candidateBasisSource: "packed_artifact", rootPublicationKind: "worksite_construction",
    prepareAdditionalProducts: async input => {
      d5 = await prepareD5RecoveryProducts(input);
      return [d5.source, d5.lifecycle];
    },
    workspaceProductIndex: 2,
    additionalCorePublicationConstructors: ["constructRequirementHandoffModulePublication", "constructSemanticStageModulePublication",
      "constructWorksiteCommandExecutionModulePublication"],
    programRef: D5_RECOVERY_IDS.sourceProgramRef, graphFunctionRef: D5_RECOVERY_IDS.sourceGraphFunctionRef, crossPublicationProgram: true,
  });
  return { ...environment, d5 };
}

function exactOne(rows, label) {
  assert.equal(rows.length, 1, `${label}: ${rows.length}`);
  return rows[0];
}

async function traverse(environment, basis, label) {
  const { abg, hog, store } = environment;
  const opened = abg.openTraversalScope(store, abg.selectHeldEventStoreDurablePrefix(store),
    { kind: "root", executionBasis: basis.executionBasis }, runtimeBasis(`${label}/open`));
  assert.equal(opened.kind, "traversal_scope_open_admission", JSON.stringify(opened));
  const completion = await hog.executeGraphTraversal({ store, predecessorPrefix: opened.successorPrefix, executionBasis: basis.executionBasis,
    openedTraversalScope: opened.scope, program: basis.program, programPublication: basis.executionResolution.programPublication,
    programValidation: basis.programValidation, graphFunction: basis.graphFunction, graph: basis.graph,
    graphValidation: basis.graphValidation, implementationSet: basis.implementationSet,
    interactionSet: basis.executionBasisAdmission.interactionSet, leafPort: basis.leafPort,
    actorRuntimeBinding: { workspaceBinding: environment.workspaceBinding, artifactTruth: basis.artifactTruth },
    input: basis.input, inputDigest: basis.rawInput.subjectDigest, closureContract: basis.closureContract,
    eventTime: "2026-11-06T00:00:00.000Z", correlationId: `correlation://${scope}/${label}/hog` });
  return { completion, runId: opened.scope.runId };
}

/** Ordinary F_D requirement-handoff Run in the same admitted environment. */
export async function runD5SourceHandoff(context, packageRoot, environment) {
  const ids = D5_RECOVERY_IDS;
  const basis = await admitD5Run(context, packageRoot, environment, { programRef: ids.sourceProgramRef,
    graphFunctionRef: ids.sourceGraphFunctionRef, label: "source", input: environment.d5.sourceDeclaration.input });
  const { completion } = await traverse(environment, basis, "source");
  assert.equal(completion.disposition, "closed", JSON.stringify(completion));
  const results = environment.store.readAll().filter(e => e.kind === "c_call_result_admitted" &&
    e.basisId === basis.executionBasis.basisRef && e.payload?.value?.kind === "requirement_handoff_output");
  const result = exactOne(results, "one admitted source handoff Result");
  return { basis, completion, sourceHandoff: result.payload.value, resultEvent: result };
}

/** Physical worksite: two regular files under the admitted workspace root. */
export async function writeD5Worksite(environment) {
  const root = environment.workspaceAuthority.canonicalRoot;
  await mkdir(join(root, "proof"), { recursive: true });
  await writeFile(join(root, "proof/app.mjs"), D5_IMPLEMENTATION_PREIMAGE, { flag: "wx" });
  await writeFile(join(root, "proof/verify.mjs"), D5_VERIFIER_TEXT, { flag: "wx" });
}

async function semanticWorksite({ product, workspaceAuthority: workspaceAuthorityBasis, workspaceBinding, capabilityGrant }) {
  const root = workspaceAuthorityBasis.canonicalRoot;
  const territory = product.constructWorksiteTerritory({ workspaceAuthorityBasis, workspaceBinding,
    territoryUri: pathToFileURL(join(root, "proof")).href, relativeRoot: "proof" });
  const rows = [];
  for (const [relativePath, role] of [["proof/app.mjs", "implementation"], ["proof/verify.mjs", "verifier"]]) {
    const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis, workspaceBinding,
      subjectUri: pathToFileURL(join(root, relativePath)).href, relativePath });
    const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
    rows.push({ subject, territory, predecessorObservation, role, base64: (await readFile(join(root, relativePath))).toString("base64") });
  }
  const task = product.constructWorksiteConstructionTask({ workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    prompt: "D5 fixture target identity derivation", targets: rows.map(({ subject, territory, predecessorObservation }) => ({ subject, territory, predecessorObservation })) });
  return { workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    targets: task.targets.map((target, index) => ({ target, base64: rows[index].base64, role: rows[index].role })),
    commands: [{ commandId: D5_RECOVERY_IDS.commandId, executable: process.execPath, args: ["verify.mjs"], relativeCwd: "proof",
      environment: {}, timeoutMs: 5000, terminationGraceMs: 250, expectedReports: [] }],
    outcomePredicates: [], allowedWriteTerritories: [] };
}

/** One ordinary invocation, graph, implementation set and execution basis
 * through the existing owners. A workflow root is not given a root leaf. */
async function admitD5Run(context, packageRoot, environment, selected) {
  const { product, abg, gtl, validator, store, catalog, admittedInstalls } = environment;
  // Each Run is admitted over the current held prefix and the exact workspace
  // artifact truth projected at it, as the existing reuse routes do.
  const held = abg.selectHeldEventStoreDurablePrefix(store);
  const current = abg.projectExactPrefixWorkspaceEnvironment(held, { ref: environment.workspaceBinding.bindingId,
    digest: environment.workspaceBinding.bindingDigest });
  assert.equal(current.kind, "exact_prefix_workspace_environment", JSON.stringify(current));
  assert.deepEqual(current.workspaceBinding, environment.workspaceBinding);
  const artifactTruth = current.artifactTruth;
  const publication = environment.publications.find(p => p.programs.some(program => program.programRef === selected.programRef));
  const catalogView = product.narrowGraphFunctionCatalog(catalog, [selected.graphFunctionRef]);
  assert.equal(catalogView.kind, "graph_function_catalog_view", JSON.stringify(catalogView));
  const resolved = await product.ProductExecutionResolutionPort.resolve({ catalog, catalogView, admittedInstalls,
    verifyInstallAdmission: install => abg.hasAdmittedProductInstall(artifactTruth, install), programRef: selected.programRef,
    selection: { kind: "direct", catalogHandle: selected.graphFunctionRef } });
  assert.equal(resolved.kind, "loaded_product_execution_resolution", JSON.stringify(resolved));
  const invocation = await setupInstalledRootInvocation(context, packageRoot, {
    existingEnvironment: { ...environment, artifactTruth, durablePrefix: held, publication, catalogView,
      programValidation: resolved.programValidation, selectedProgramRef: selected.programRef },
    programRef: selected.programRef, graphFunctionRef: selected.graphFunctionRef, publicInvocationRef: `invocation://${scope}/${selected.label}`,
    ...(selected.inputFactory === undefined ? { input: selected.input } : { inputFactory: selected.inputFactory }) });
  const { invocationAdmission, rawInput, input, program, programValidation, graphFunction, executionResolution } = invocation;
  const coordinates = { invocationAdmissionRef: invocationAdmission.invocationAdmissionRef, admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest, admittedInput: input };
  const graph = gtl.materializeGraph(graphFunction, coordinates);
  const graphValidation = validator.validateGraph(graph, programValidation, graphFunction, coordinates);
  assert.equal(graphValidation.kind, "graph_validation", JSON.stringify(graphValidation));
  const resolutionSetCandidate = product.resolveImplementationSet(catalogView, executionResolution.declarationClosure,
    programValidation, executionResolution.packagedImplementations);
  assert.equal(resolutionSetCandidate.kind, "implementation_resolution_set_candidate", JSON.stringify(resolutionSetCandidate));
  const resolutionSetValidation = validator.validateImplementationResolutionSet(resolutionSetCandidate, catalogView,
    executionResolution.declarationClosure, programValidation, executionResolution.packagedImplementations);
  assert.equal(resolutionSetValidation.kind, "implementation_resolution_set_validation", JSON.stringify(resolutionSetValidation));
  const closureContract = executionResolution.programPublication.closureContracts.find(c => c.closureContractRef === program.closureContractRef);
  assert.ok(closureContract, "selected Program closure contract");
  const executionBasisAdmission = abg.admitExecutionBasis(store, invocation.durablePrefix, { invocationAdmission, rawInputValue: input,
    program, programPublication: executionResolution.programPublication, executionResolution: executionResolution.resolution,
    programValidation, graph, graphValidation, resolutionSetCandidate, resolutionSetValidation, closureContract }, runtimeBasis(`${selected.label}/basis`));
  assert.equal(executionBasisAdmission.kind, "execution_basis_admission", JSON.stringify(executionBasisAdmission));
  const leafPort = await environment.implementationLeafPort.constructAdmittedLeafInvocationPort({
    prefix: abg.selectValidatedRuntimeEventPrefix(abg.readRuntimeEventsAtDurablePrefix(executionBasisAdmission.successorPrefix)),
    artifactTruth, implementationSet: executionBasisAdmission.implementationSet, executionResolution,
    semanticsProjection: product.projectInstalledLeafSemantics(executionResolution.productSemantics) });
  return { ...invocation, catalogView, graph, graphValidation, closureContract, executionBasisAdmission,
    implementationSet: executionBasisAdmission.implementationSet, executionBasis: executionBasisAdmission.executionBasis, leafPort };
}

/** One semantic invocation over the workflow root: stage, design bridge,
 * preparation and Construction share it. */
export function admitD5SemanticRun(context, packageRoot, environment, sourceHandoff, label) {
  const { d5 } = environment;
  return admitD5Run(context, packageRoot, environment, { programRef: D5_RECOVERY_IDS.programRef,
    graphFunctionRef: D5_RECOVERY_IDS.graphFunctionRef, label,
    inputFactory: async grant => grant.product.constructSemanticStageEnvelope({ sourceHandoff, lifecycle: d5.lifecycleDeclaration,
      taskData: d5.taskData, evaluationData: d5.evaluationData, worksite: await semanticWorksite(grant) }) });
}

/** Execute one admitted semantic Run with one selected controlled transport. */
export async function executeD5SemanticRun(environment, basis, label, selection) {
  const before = environment.store.readAll().length;
  const { completion, runId } = await withSelectedTransport(selection, () => traverse(environment, basis, label));
  return { completion, runId, before, after: environment.store.readAll().length };
}

/** The Construction F_P CCall of one Run and its one actor invocation, read
 * from admitted events; nothing here constructs a runtime coordinate. */
export function selectD5ConstructionAttempt(environment, runId) {
  const events = environment.store.readAll();
  const call = exactOne(events.filter(e => e.kind === "c_call_opened" && e.runId === runId &&
    e.graphFunctionRef === environment.product.WORKSITE_CONSTRUCTION_IDS.graphFunctionRef &&
    events.some(a => a.kind === "actor_invocation_started" && a.parentAggregateId === e.aggregateId)),
  "one Construction F_P opening in this Run");
  const started = exactOne(events.filter(e => e.kind === "actor_invocation_started" && e.parentAggregateId === call.aggregateId),
    "one Construction actor invocation");
  return { sourceCCallRef: call.aggregateId, actorInvocationRef: started.aggregateId, basisRef: call.basisId };
}

export function d5PreservedSelector(environment, attempt, historicalPrefix = environment.abg.selectHeldEventStoreDurablePrefix(environment.store)) {
  return { kind: "worksite_preserved_result_source", schemaVersion, historicalPrefix,
    sourceCCallRef: attempt.sourceCCallRef, actorInvocationRef: attempt.actorInvocationRef };
}
