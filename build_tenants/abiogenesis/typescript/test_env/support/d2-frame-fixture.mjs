import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, chmod } from 'node:fs/promises';
import { dirname, join, basename, resolve, relative, isAbsolute, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

// Test data and declarations only: no independent evaluator, runtime, or grants.
// Packaging/native-call construction follows single-start-worksite-program.mjs
// and the retained D1/D2 installed fixture. Nothing executes on module import.
const execFileAsync = promisify(execFile);
const scope = 'd2-frame.example/mechanical';
const ref = (kind, name) => `${kind}://${scope}/${name}@5`;
const ids = Object.freeze({ productId: ref('product', 'fixture'), packageName: '@d2-frame.example/mechanical', packageVersion: '5.0.0',
  moduleRef: ref('module', 'lifecycle'), sourceModuleRef: ref('module', 'source'), programRef: ref('program', 'initial'),
  sourceProgramRef: ref('program', 'source'), selectionProgramRef: ref('program', 'selection'), repairProgramRef: ref('program', 'repair'),
  sourceDeclarationRef: ref('declaration', 'source'), lifecycleRef: ref('declaration', 'lifecycle'),
  descriptorRef: ref('descriptor', 'fixture'), contributionManifestRef: ref('contribution-manifest', 'fixture'),
  catalogRef: ref('catalog', 'fixture'), provenanceRef: ref('provenance', 'mechanical-only') });
const paths = ['app.mjs', 'check.mjs', ...Array.from({ length: 20 }, (_, i) => `dep${String(i + 1).padStart(2, '0')}.mjs`)];
const files = Object.fromEntries(paths.map((path, index) => [path, index < 2 ? '' : `export default ${index - 1};\n`]));
const goodApp = paths.slice(2).map((p, i) => `import n${i} from './${p}';`).join('\n') +
  `\nexport const total = [${paths.slice(2).map((_, i) => `n${i}`).join(',')}].reduce((sum, n) => sum + n, 0);\n`;
const goodCheck = "import assert from 'node:assert/strict';\nimport { total } from './app.mjs';\nassert.equal(total, 210);\nconsole.log(JSON.stringify({total, dependencies:20}));\n";
const sourceText = 'Mechanical fixture: construct a 22-file dependency-free Node application. app.mjs sums exports 1 through 20 from dep01.mjs through dep20.mjs; check.mjs imports the application, asserts 210, and prints {"total":210,"dependencies":20} plus one newline. A declared defective first construction returns 0 and has a failing verifier. Repair only app.mjs and check.mjs; retain all twenty dependency bytes and file identities. This is transport and causal evidence, not semantic or application qualification.\n';
export const D2_FRAME_SPECIFICATION = Object.freeze({ paths, relativeCwd: 'app', repairedPaths: paths.slice(0, 2),
  retainedPaths: paths.slice(2), stdout: '{"total":210,"dependencies":20}\n', sourceText });

export function confined(root, path) {
  const suffix = relative(resolve(root), resolve(path));
  return suffix !== '' && !isAbsolute(suffix) && suffix !== '..' && !suffix.startsWith('..' + sep);
}
const exact = (rows, label) => { assert.equal(rows.length, 1, label); return rows[0]; };

export function nativePublications(gtl, abiArtifact) {
  const basis = { productId: abiArtifact.productId, artifactDigest: abiArtifact.artifactDigest,
    productContentDigest: abiArtifact.productContentDigest, productManifestDigest: abiArtifact.manifestDigest,
    packageName: abiArtifact.packageName, packageVersion: abiArtifact.packageVersion };
  return [gtl.constructHelloWorldModulePublication, gtl.constructConsensusModulePublication,
    gtl.constructWorksiteConstructionModulePublication, gtl.constructWorksiteCommandExecutionModulePublication,
    gtl.constructRequirementHandoffModulePublication, gtl.constructSemanticStageModulePublication,
    gtl.constructSemanticRevisionModulePublication].map(fn => fn(basis));
}

export function constructD2FrameDeclarations({ product, gtl, abiArtifact, abiPublications }) {
  const D = gtl.SEMANTIC_STAGE_IDS, R = gtl.SEMANTIC_REVISION_IDS;
  const C1 = product.WORKSITE_CONSTRUCTION_IDS, C2 = product.WORKSITE_COMMAND_EXECUTION_IDS;
  const P = product.WORKSITE_PREPARATION_IDS, W = product.WORKSITE_REVISION_IDS;
  assert.ok(W?.inputContractRef && W.observationContractRef, 'candidate must publish the D2 E_D/C2 seam');
  const native = id => exact(abiPublications.filter(p => p.moduleRef === id), id);
  const c1Pub = native(C1.moduleRef), c2Pub = native(C2.moduleRef), semanticPub = native(D.moduleRef);
  const placeholder = `sha256:${'0'.repeat(64)}`;
  const consumerBasis = { ...ids, artifactDigest: placeholder, productContentDigest: placeholder, productManifestDigest: placeholder };
  const member = { memberRef: ref('member', 'requirement'), path: 'mechanical-requirement.txt',
    byteCount: Buffer.byteLength(sourceText), digest: product.sha256Bytes(sourceText) };
  const contextRef = ref('context', 'source'), requirementRef = ref('requirement', 'sum-twenty'), obligationRef = ref('obligation', 'sum-twenty');
  const sourceBindings = [{ contextRef, memberRef: member.memberRef, memberDigest: member.digest,
    startByte: 0, endByte: member.byteCount, spanDigest: member.digest }];
  const binding = { obligationRef, requirementRef, realizationContractRef: ref('contract', 'realization'),
    proofContractRef: ref('contract', 'proof'), proofPolicyRef: ref('policy', 'mechanical'), proofShapeRef: ref('proof-shape', 'mechanical') };
  const declaration = gtl.constructRequirementHandoffDeclaration({ declarationRef: ids.sourceDeclarationRef,
    graphFunctionRef: ref('graph-function', 'source'), sourceRoleRef: ref('role', 'mechanical-requirement'),
    context: { contextRef, sourceLocator: 'fixture://d2-frame/mechanical-requirement',
      inventoryDigest: product.sha256Canonical([member]), members: [member] },
    terms: [{ requirementRef, sourceBindings }], fulfillmentBindings: [binding] });
  const source = { declaration, input: product.constructRequirementHandoffInput({ kind: 'requirement_handoff_input',
    schemaVersion: '5.0.0', declarationRef: declaration.declarationRef, sourceRoleRef: declaration.sourceRoleRef,
    members: [{ memberRef: member.memberRef, base64: Buffer.from(sourceText).toString('base64') }] }) };
  const roleContracts = [['realization', 'worksite_construction_result'], ['proof', 'worksite_command_execution_observation']]
    .map(([role, valueKind]) => ({ contractRef: binding[`${role}ContractRef`], contractKind: 'output', contractVersion: '5.0.0', valueKind }));
  const sourcePublication = gtl.constructRequirementHandoffConsumerPublication(consumerBasis,
    native(gtl.REQUIREMENT_HANDOFF_IDS.moduleRef), declaration, { moduleRef: ids.sourceModuleRef, programRef: ids.sourceProgramRef,
      startRef: ref('start', 'source'), graphRef: ref('graph', 'source'), closureContractRef: ref('contract', 'source-closure'),
      descriptorRef: ids.descriptorRef, contributionManifestRef: ids.contributionManifestRef }, roleContracts);
  const scenario = { kind: 'd2_mechanical_fixture', specification: D2_FRAME_SPECIFICATION, semanticQualification: false };
  const oracle = { stdout: D2_FRAME_SPECIFICATION.stdout, exitCode: 0, repairedFiles: 2, snapshotFiles: 22 };
  const names = ['intent', 'product', 'requirements', 'design'];
  const lifecycle = gtl.constructSemanticLifecycleDeclaration({ declarationRef: ids.lifecycleRef,
    sourceDeclarationRef: declaration.declarationRef, taskDataDigest: product.sha256Canonical(scenario),
    evaluationDataDigest: product.sha256Canonical(oracle), proofPolicies: [{ policyRef: binding.proofPolicyRef,
      sourceRequirementRef: requirementRef, sourceBindings, scope: 'Declared mechanical 22-file fixture only',
      realizationMeaning: ['Native C0 receipts over actual selected files'], proofMeaning: ['Native C2 command observations'],
      unprovedScope: ['Semantic adequacy', 'DataMapper UAT', 'D1-D6 qualification'], closureRule: 'Keep application coverage non-closing', obligationRef }],
    proofShapes: [{ proofShapeRef: binding.proofShapeRef, requiredEvidenceRoles: ['realization', 'verifier_artifact', 'verifier_execution'],
      sharedBasis: ['Exact declared workspace and target identities'], requiredContent: ['Actual command streams and exit status'],
      nativeCarrierBoundary: 'Only ABG admission and replay establish runtime truth', requirementRef, obligationRef,
      roleContractRefs: { realization: binding.realizationContractRef, proof: binding.proofContractRef } }],
    stages: names.map((name, index) => ({ declarationRef: ref('stage', name), graphFunctionRef: ref('graph-function', name),
      authorLocusRef: ref('locus', `${name}-author`), assessorLocusRef: ref('locus', `${name}-assessor`),
      predecessorStageRefs: names.slice(0, index).map(n => ref('stage', n)),
      assetSurface: { kind: `${name}_mechanical_carrier`, requiredContexts: [contextRef], standardsRefs: [],
        outputContractRefs: [D.workerContractRef], constructorRef: D.constructorRef, rendererRef: D.rendererRef,
        proofObligationRefs: [obligationRef], authoritySlots: [] },
      purpose: `Retain the declared ${name} carrier without claiming semantic qualification`,
      requiredContent: ['Exact source and obligation relation; Design declares all 22 targets and one command'],
      rubric: [{ criterionRef: ref('criterion', `${name}-carrier`), instruction: 'Mechanical deterministic carrier witness only; do not claim semantic qualification' }],
      bodyCapabilities: name === 'design' ? ['worksite_design'] : [],
      assembly: { ruleRef: ref('assembly', name), graphFunctionRef: ref('graph-function', name),
        sectionOrder: ['role', 'source', 'obligations', 'predecessors', 'worksite', 'evidence', 'task', 'response'],
        contentPolicy: 'full_source_and_predecessors', proportionalityPolicy: 'declared_semantic_assessment', maxPromptBytes: 1048576 } })) });
  const closures = [];
  const semanticClose = (name, predicateRef, resultContractRef, closureScope = 'graph_call') => {
    const closureContractRef = ref('contract', `${name}-closure`);
    closures.push(gtl.constructSemanticClosureContract({ closureContractRef, predicateRef, resultContractRef, closureScope }));
    return closureContractRef;
  };
  const call = graph => gtl.workflow.C(gtl.cGraphFunctionRef({ graphFunctionRef: graph.name,
    input: gtl.cCarrier(graph.inputs[0]), output: gtl.cCarrier(graph.outputs[0]) }));
  function worksite(revision) {
    const p = revision ? W : P, c = revision ? W : C2, label = revision ? 'repair-worksite' : 'initial-worksite';
    const graphFunctionRef = ref('graph-function', label), closureContractRef = ref('contract', `${label}-closure`);
    const c1Graph = exact(c1Pub.graphFunctions.filter(g => g.name === C1.graphFunctionRef), 'C1');
    const c2Graph = exact(c2Pub.graphFunctions.filter(g => g.name === c.graphFunctionRef), 'selected C2');
    const c2Close = exact(c2Pub.closureContracts.filter(c => c.closureContractRef === C2.closureContractRef), 'C2 closure');
    closures.push(gtl.closureContract({ ...c2Close, closureContractRef, predicateRef: P.rootPredicateRef,
      resultContractRef: c.observationContractRef, closureScope: 'graph_call',
      eventKindRefs: ['terminal_reached', 'frame_closed', 'graph_call_closed'] }));
    const n = role => ref('node', `${label}-${role}`);
    const pure = (role, bindingRef, predicate) => {
      const b = exact(c2Pub.implementationBindings.filter(b => b.bindingRef === bindingRef), bindingRef);
      return { nodeRef: n(role), nodeKind: 'c_locus', term: gtl.C.of({ input: gtl.cCarrier(b.inputContractRef),
        output: gtl.cCarrier(b.outputContractRef), programLocusRef: n(role), stageRole: role, fibre: 'F_D',
        armId: `${n(role)}/arm`, compositionRef: null, vectorIndex: 0, judgmentPredicateRef: predicate, resultBearing: false,
        requirement: { kind: 'executable_leaf_requirement', implementationBindingRef: b.bindingRef,
          inputContractRef: b.inputContractRef, outputContractRef: b.outputContractRef,
          evidenceContractRef: C2.evidenceContractRef, failureContractRef: b.failureContractRef,
          refusalContractRef: b.refusalContractRef, judgmentContractRef: C2.judgmentContractRef } }) };
    };
    const provided = [C1.taskContractRef, C1.resultContractRef, p.boundInputContractRef, c.taskContractRef, c.observationContractRef];
    return { kind: 'graph_function', name: graphFunctionRef, version: '5.0.0',
      inputs: [p.inputContractRef], outputs: [c.observationContractRef],
      environment: { requires: [p.inputContractRef], provides: provided, carries: [p.inputContractRef, ...provided] },
      effects: [...new Set([...c1Graph.effects, ...c2Graph.effects])], tags: ['mechanical-only'],
      declarations: { 'abg.compute_regime': 'mixed', 'abg.closure_contract': closureContractRef,
        'abg.child_closure_contract': closureContractRef, 'abg.failure_contract': C2.failureContractRef,
        'abg.evidence_contract': C2.evidenceContractRef, 'abg.judgment_contract': C2.judgmentContractRef,
        'abg.judgment_predicate': P.rootPredicateRef, 'abg.transition_contract': C2.transitionContractRef },
      template: { kind: 'inline_graph', graphRef: ref('graph', label), startNodeRef: n('select'), terminalNodeRefs: [n('execute')],
        applications: [], nodes: [pure('select', p.selectBindingRef, p.selectPredicateRef),
          { nodeRef: n('construct'), nodeKind: 'c_locus', term: call(c1Graph) }, pure('prepare', p.prepareBindingRef, p.preparePredicateRef),
          { nodeRef: n('execute'), nodeKind: 'c_locus', term: call(c2Graph) }],
        edges: [gtl.graphEdge({ fromNodeRef: n('select'), toNodeRef: n('construct') }),
          gtl.graphEdge({ fromNodeRef: n('construct'), toNodeRef: n('prepare'),
            inputBinding: revision ? product.worksiteRevisionRetentionBinding() : product.worksiteRetentionBinding() }),
          gtl.graphEdge({ fromNodeRef: n('prepare'), toNodeRef: n('execute') })] } };
  }
  const stages = lifecycle.stages.map(s => gtl.constructSemanticStageGraphFunction(s, semanticClose(s.declarationRef,
    D.assessorPredicateRef, D.envelopeContractRef)));
  const oldBridge = (name, operation, predicate, output) => gtl.constructSemanticBridgeGraphFunction({
    graphFunctionRef: ref('graph-function', name), nodeRef: ref('node', name), operation,
    closureContractRef: semanticClose(name, predicate, output) });
  const initialChain = [...stages, oldBridge('initial-bridge', 'design_worksite', D.bridgePredicateRef, P.inputContractRef), worksite(false),
    oldBridge('initial-evidence', 'evidence_input', D.evidenceInputPredicateRef, D.envelopeContractRef),
    oldBridge('initial-output', 'envelope_output', D.terminalPredicateRef, D.outputContractRef)];
  const revisionGraph = (name, role, predicate, output) => gtl.constructSemanticRevisionGraphFunction({ graphFunctionRef: ref('graph-function', name),
    closureContractRef: semanticClose(name, predicate, output), childClosureContractRef: ref('contract', `${name}-closure`), role });
  const repairChain = [revisionGraph('projection', 'projection', R.projectionPredicateRef, R.envelopeContractRef),
    revisionGraph('repair-bridge', 'bridge', R.bridgePredicateRef, W.inputContractRef), worksite(true),
    revisionGraph('repair-evidence', 'evidenceInput', R.evidenceInputPredicateRef, R.envelopeContractRef),
    revisionGraph('repair-output', 'terminal', R.terminalPredicateRef, R.outputContractRef)];
  function root(name, chain, predicate, output) {
    const closureRef = semanticClose(`${name}-root`, predicate, output, 'run');
    const nodes = chain.map((graph, ordinal) => ({ nodeRef: ref('node', `${name}-step-${ordinal}`),
      nodeKind: 'c_locus', term: call(graph) }));
    const carries = [...new Set(chain.flatMap(g => [...g.inputs, ...g.outputs]))];
    return { kind: 'graph_function', name: ref('graph-function', `${name}-root`), version: '5.0.0',
      environment: { requires: chain[0].inputs, provides: carries, carries }, inputs: chain[0].inputs, outputs: [output],
      effects: [...new Set(chain.flatMap(g => g.effects))], tags: ['mechanical-only'],
      declarations: { 'abg.compute_regime': 'mixed', 'abg.closure_contract': closureRef, 'abg.evidence_contract': D.evidenceContractRef,
        'abg.judgment_contract': D.judgmentContractRef, 'abg.judgment_predicate': predicate, 'abg.transition_contract': D.transitionContractRef },
      template: { kind: 'inline_graph', graphRef: ref('graph', `${name}-root`), startNodeRef: nodes[0].nodeRef,
        terminalNodeRefs: [nodes.at(-1).nodeRef], nodes,
        edges: nodes.slice(1).map((node, index) => gtl.graphEdge({ fromNodeRef: nodes[index].nodeRef, toNodeRef: node.nodeRef })),
        applications: [] } };
  }
  const initial = root('initial', initialChain, D.lifecyclePredicateRef, D.outputContractRef);
  const repair = root('repair', repairChain, R.projectionPredicateRef, R.outputContractRef);
  const selectionClose = semanticClose('selection', R.selectionPredicateRef, R.selectionContractRef, 'run');
  const selection = gtl.constructSemanticRevisionSelectionGraphFunction({ graphFunctionRef: ref('graph-function', 'selection'),
    closureContractRef: selectionClose, lifecycleRef: lifecycle.declarationRef });
  const c1Membership = [C1.graphFunctionRef, C1.vectorApplicationGraphFunctionRef, C1.fileReplaceGraphFunctionRef, C1.reducerGraphFunctionRef];
  const programs = [[ids.programRef, initial, initialChain, [...c1Membership, C2.graphFunctionRef]],
    [ids.selectionProgramRef, selection, [], []], [ids.repairProgramRef, repair, repairChain, [...c1Membership, W.graphFunctionRef]]]
    .map(([programRef, graph, chain, nativeRefs]) => ({ kind: 'gtl_program', programRef, version: '5.0.0', moduleRef: ids.moduleRef,
      starts: [{ startRef: `${programRef}/start`, graphFunctionRef: graph.name }],
      callableMembership: [graph.name, ...chain.map(g => g.name), ...nativeRefs], closureContractRef: graph.declarations['abg.closure_contract'],
      policies: { 'abg.root_mode': 'direct', 'abg.compute_regime': graph === selection ? 'F_P' : 'mixed',
        'abg.default_start_ref': `${programRef}/start`, 'abg.semantic_lifecycle': lifecycle.declarationRef } }));
  const graphs = [...initialChain, initial, selection, ...repairChain, repair];
  const { requirementHandoffs: _handoffs, ...base } = sourcePublication;
  const consumerPublication = gtl.modulePublication({ ...base, moduleRef: ids.moduleRef, semanticLifecycle: lifecycle,
    productSemanticsBinding: semanticPub.productSemanticsBinding, programs, graphFunctions: graphs, closureContracts: closures,
    contracts: closures.map(c => ({ contractRef: c.closureContractRef, contractKind: 'closure', contractVersion: '5.0.0', valueKind: 'semantic_stage_closure' })),
    contributions: graphs.map(graph => ({ handle: graph.name, kind: 'graph_function', declarationOrContractRef: graph.name,
      owningProductId: ids.productId, programMembershipRefs: programs.filter(p => p.callableMembership.includes(graph.name)).map(p => p.programRef),
      readinessPrerequisiteRefs: programs.filter(p => p.callableMembership.includes(graph.name)).map(p => p.programRef),
      compatibilityRefs: ['compatibility://abiogenesis/major/5'], provenanceRefs: [placeholder] })) });
  return { ids, source, lifecycle, scenario, oracle, sourcePublication, consumerPublication };
}

export async function prepareD2FrameProduct({ scratch, product, gtl, abiArtifact }) {
  assert.ok(product.isVerifiedProductArtifact(abiArtifact), 'actual verified native artifact required');
  const bundle = constructD2FrameDeclarations({ product, gtl, abiArtifact, abiPublications: nativePublications(gtl, abiArtifact) });
  const data = p => { const { kind, moduleVersion, artifactDigest, productContentDigest, productManifestDigest, ...rest } = p; return rest; };
  const publicationData = [data(bundle.sourcePublication), data(bundle.consumerPublication)];
  const materialize = (identity, value) => gtl.modulePublication({ kind: 'module_publication', moduleVersion: '5.0.0', ...value,
    artifactDigest: identity.artifactDigest, productContentDigest: identity.productContentDigest, productManifestDigest: identity.manifestDigest,
    contributions: value.contributions.map(c => ({ ...c, provenanceRefs: [identity.artifactDigest, identity.manifestDigest] })) });
  const values = { 'package.json': { name: ids.packageName, version: ids.packageVersion, type: 'module',
    exports: { './publication': './build/publication.json', './source-publication': './build/source-publication.json' },
    files: ['build', 'contracts', 'product-toolchain-manifest.json'] }, 'build/source-publication.json': publicationData[0],
    'build/publication.json': publicationData[1], 'contracts/mechanical-specification.json': D2_FRAME_SPECIFICATION,
    'contracts/public-contract-catalog.schema.json': { $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: 'https://d2-frame.example/mechanical/catalog@5', type: 'object' } };
  const sourceRoot = join(scratch, 'consumer-source'); await mkdir(sourceRoot);
  for (const [path, value] of Object.entries(values)) {
    await mkdir(dirname(join(sourceRoot, path)), { recursive: true });
    await writeFile(join(sourceRoot, path), product.canonicalJson(value) + '\n', { flag: 'wx' });
  }
  const graph = product.constructCapabilityDefinitionGraph([]), graphBytes = product.capabilityDefinitionGraphAssetBytes(graph);
  const graphCoordinate = product.capabilityDefinitionGraphCoordinate(graph), graphPath = product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH;
  await mkdir(dirname(join(sourceRoot, graphPath)), { recursive: true }); await writeFile(join(sourceRoot, graphPath), graphBytes, { flag: 'wx' });
  const locators = Object.keys(values).sort(), inventory = await Promise.all(locators.map(async path => ({ path, sha256: await product.sha256File(join(sourceRoot, path)) })));
  const productContentDigest = product.payloadInventoryDigest(inventory), catalogSchemaPath = 'contracts/public-contract-catalog.schema.json';
  const catalogBody = { schemaVersion: '5.0.0', catalogId: ids.catalogRef, catalogVersion: '5.0.0', catalogSchemaPath,
    catalogSchemaDigest: await product.sha256File(join(sourceRoot, catalogSchemaPath)), rows: [] };
  const catalog = { ...catalogBody, catalogDigest: product.sha256Canonical(catalogBody) }, placeholder = `sha256:${'0'.repeat(64)}`;
  const drafts = publicationData.map(p => materialize({ artifactDigest: placeholder, productContentDigest, manifestDigest: placeholder }, p));
  const contributionManifest = { kind: 'product_contribution_manifest', schemaVersion: '5.0.0', contributionManifestRef: ids.contributionManifestRef,
    productId: ids.productId, productVersion: ids.packageVersion, descriptorRef: ids.descriptorRef, productContentDigest,
    publicContractCatalogId: catalog.catalogId, publicContractCatalogDigest: catalog.catalogDigest, capabilityDefinitionGraph: graphCoordinate,
    publicationBindings: drafts.map(p => ({ moduleRef: p.moduleRef, publicationDigest: product.modulePublicationSemanticDigest(p) })),
    rows: drafts.flatMap(p => p.contributions.map(({ provenanceRefs: _refs, ...c }) => ({ moduleRef: p.moduleRef, ...c, provenanceRef: ids.provenanceRef }))) };
  const manifest = { kind: 'abg_product_toolchain_manifest', schemaVersion: '5.0.0', productId: ids.productId,
    packageName: ids.packageName, packageVersion: ids.packageVersion, productContentDigest, productRelativeLocators: locators,
    descriptorRef: ids.descriptorRef, publisherNamespace: 'd2-frame.example', contributionManifestRef: ids.contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest), contributionManifest,
    compatibilityRefs: ['compatibility://abiogenesis/major/5'], declaredDependencies: [{ kind: 'requires', productId: abiArtifact.productId,
      packageVersion: abiArtifact.packageVersion, compatibilityRef: 'compatibility://abiogenesis/major/5',
      requiredContractRefs: ['abg.contract.gtl.root-declaration', 'abg.schema.public-operation-invocation'],
      requiredCapabilityRefs: ['abg.capability.catalog.invoke-graph-function@5', 'abg.capability.gtl.declare@5'] }],
    provenanceRef: ids.provenanceRef, declaredCapabilityRefs: [], capabilityDefinitionGraph: { ...graphCoordinate,
      assetLocator: { path: graphPath, mediaType: 'application/json', schemaVersion: '5.0.0', contentDigest: product.sha256Bytes(graphBytes) } }, publicContractCatalog: catalog };
  await writeFile(join(sourceRoot, 'product-toolchain-manifest.json'), product.canonicalJson(manifest) + '\n', { flag: 'wx' });
  const artifacts = join(sourceRoot, 'artifacts'); await mkdir(artifacts);
  const { stdout } = await execFileAsync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', artifacts], { cwd: sourceRoot, maxBuffer: 10485760 });
  const artifactPath = join(artifacts, JSON.parse(stdout)[0].filename);
  const basis = { productId: ids.productId, packageName: ids.packageName, packageVersion: ids.packageVersion,
    artifactDigest: await product.sha256File(artifactPath), productContentDigest, manifestDigest: product.sha256Canonical(manifest) };
  return { ...bundle, artifactPath, artifactRef: basename(artifactPath), basis, sourceRoot, manifest,
    async loadInstalledPublications({ installedRoot }) {
      return Promise.all(['build/source-publication.json', 'build/publication.json'].map(async path => {
        const bytes = await readFile(join(installedRoot, path));
        assert.equal(product.sha256Bytes(bytes), inventory.find(row => row.path === path).sha256);
        return materialize(basis, JSON.parse(bytes));
      }));
    } };
}

export async function observeFixtureWorksite({ product, workspaceAuthorityBasis, workspaceBinding, capabilityGrant, nodeExecutable }) {
  const root = workspaceAuthorityBasis.canonicalRoot, targetInputs = [], contents = [];
  for (const path of paths) {
    const relativePath = `app/${path}`, fullPath = join(root, relativePath);
    const subject = product.constructWorksiteSubject({ workspaceAuthorityBasis, workspaceBinding, subjectUri: pathToFileURL(fullPath).href, relativePath });
    const territory = product.constructWorksiteTerritory({ workspaceAuthorityBasis, workspaceBinding,
      territoryUri: pathToFileURL(join(root, 'app')).href, relativeRoot: 'app' });
    const predecessorObservation = await product.observeWorksiteSubject(workspaceAuthorityBasis, workspaceBinding, subject);
    assert.equal(predecessorObservation.kind, 'worksite_observation');
    targetInputs.push({ subject, territory, predecessorObservation });
    contents.push(predecessorObservation.state === 'absent' ? '' : (await readFile(fullPath)).toString('base64'));
  }
  const targets = product.constructWorksiteConstructionTask({ workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    targets: targetInputs, prompt: 'Derive mechanical fixture target coordinates only; not dispatched' }).targets;
  const commandId = ref('command', 'check'), commands = [{ commandId, executable: nodeExecutable, args: ['check.mjs'], relativeCwd: 'app',
    environment: [{ kind: 'worksite_command_environment_entry', schemaVersion: '5.0.0', name: 'PATH', value: '/usr/bin:/bin' }],
    timeoutMs: 10000, terminationGraceMs: 1000, expectedReports: [] }];
  return { workspaceAuthorityBasis, workspaceBinding, capabilityGrant,
    targets: paths.map((path, index) => ({ target: exact(targets.filter(t => t.subject.relativePath === `app/${path}`), path),
      base64: contents[index], role: index === 0 ? 'implementation' : index === 1 ? 'verifier' : 'configuration' })),
    commands, outcomePredicates: [{ predicateId: ref('predicate', 'exit'), predicateKind: 'process_exit', declaration: { validationCommandId: commandId, equals: 0 } },
      { predicateId: ref('predicate', 'stdout'), predicateKind: 'stdout_exact', declaration: { validationCommandId: commandId, equals: D2_FRAME_SPECIFICATION.stdout } }],
    allowedWriteTerritories: [{ pathKind: 'subtree', relativePath: 'd2-frame-evidence' }] };
}

// Deterministic external actor simulator. The native owner still constructs and
// admits every candidate/assessment/selection. It performs no direct app writes;
// the only tool action is the exact ABI helper, once, for a C2 request.
export async function installD2FrameActor(path, runRoot) {
  const code = `#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {relative,isAbsolute,sep} from 'node:path';
const runRoot=${JSON.stringify(resolve(runRoot))}, good=${JSON.stringify({ ...files, 'app.mjs': goodApp, 'check.mjs': goodCheck })};
let prompt=''; process.stdin.setEncoding('utf8'); process.stdin.on('data', c=>prompt+=c);
process.stdin.on('end',()=>{
 const emit=x=>process.stdout.write(JSON.stringify(x)+'\\n');
 const schema=JSON.parse(process.argv[process.argv.indexOf('--json-schema')+1]);
 emit({type:'system',subtype:'init',model:'deterministic-mechanical-fixture-not-llm'});
 let raw;
 if(schema.properties.kind.const==='worksite_command_execution_worker_result'){
  const input=JSON.parse(prompt.split('\\n\\n')[1]); assert.deepEqual(Object.keys(input),['command']);
  const match=/^'([^']+)' '([^']+)' --task '([^']+)'$/.exec(input.command);
  assert.ok(match,'exact native helper argv required');
  assert.equal(match[1],process.execPath); assert.ok(match[2].endsWith('/build/code/src/implementation/worksite_command_helper.js'));
  for(const path of [match[2],match[3]]){const r=relative(runRoot,path);assert.ok(r&&!isAbsolute(r)&&r!=='..'&&!r.startsWith('..'+sep));}
  emit({type:'assistant',message:{content:[{type:'tool_use',id:'toolu_d2_frame_helper',name:'Bash',input}]}});
  const p=spawnSync(match[1],[match[2],'--task',match[3]],{encoding:'utf8',maxBuffer:32*1024*1024});
  assert.equal(p.status,0,p.stderr); raw=JSON.parse(p.stdout);
  emit({type:'user',message:{content:[{type:'tool_result',tool_use_id:'toolu_d2_frame_helper',content:p.stdout}]}});
 } else if(schema.properties.kind.const==='worksite_construction_worker_result'){
  const data=JSON.parse(prompt.split('\\n\\n')[1]); const repair=Object.hasOwn(data,'revisionFeedback');
  const selected=schema.properties.files.items.properties.targetRef;
  const targetRefs=selected.enum??[selected.const]; assert.equal(targetRefs.length,repair?2:22);
  raw={kind:'worksite_construction_worker_result',schemaVersion:'5.0.0',files:targetRefs.map(targetRef=>{
   const row=data.currentWorksite.find(t=>t.targetRef===targetRef); assert.ok(row); const name=row.path.split('/').at(-1); assert.ok(Object.hasOwn(good,name));
   if(repair)assert.ok(['app.mjs','check.mjs'].includes(name));
   const replacementText=!repair&&name==='app.mjs'?'export const total = 0;\\n':!repair&&name==='check.mjs'?"import assert from 'node:assert/strict';\\nimport {total} from './app.mjs';\\nassert.equal(total,-1);\\n":good[name];
   return {kind:'worksite_candidate_file',schemaVersion:'5.0.0',targetRef,replacementText};
  })};
 } else {
  const s={};for(const part of prompt.split(/^## /m).slice(1)){const cut=part.indexOf('\\n');s[part.slice(0,cut)]=JSON.parse(part.slice(cut+1).trim());}
  const q={memberRef:s.source[0].memberRef,quote:s.source[0].text};
  if(s.role.startsWith('Select the smallest')){
   const selected=s.task.targets.filter(t=>['app/app.mjs','app/check.mjs'].includes(t.target.subject.relativePath));assert.equal(selected.length,2);
   raw={kind:'semantic_revision_selection',schemaVersion:'5.0.0',parent:s.task.input.parent,causes:s.task.input.causes,mode:'construction_repair',
    selectedStageRef:null,selectedObligationRefs:s.obligations.source.map(b=>b.obligationRef),selectedTargetRefs:selected.map(t=>t.target.targetRef),reasonRef:'reason://d2-frame.example/actual-declared-command-failure@5'};
  }else if(s.role.startsWith('Independently')){
   const current=s.predecessors.at(-1);
   raw={kind:'semantic_stage_assessment_candidate',schemaVersion:'5.0.0',criteria:s.task.rubric.map(c=>({criterionRef:c.criterionRef,disposition:'satisfied',
    explanation:'Deterministic carrier witness only; no independent semantic assessment.',sourceQuotes:[q],statementRefs:current.candidate.statements.map(s=>s.statementRef)})),pressure:[]};
  }else{
   const obligations=s.obligations.sourceDeclaration.fulfillmentBindings.map(b=>b.obligationRef);
   raw={kind:'semantic_stage_asset_candidate',schemaVersion:'5.0.0',statements:[{statementRef:s.task.stageRef+'/mechanical',text:${JSON.stringify(sourceText.trim())},
    modality:'supporting',sourceQuotes:[q],requirementRefs:s.obligations.sourceDeclaration.terms.map(t=>t.requirementRef),obligationRefs:obligations,
    predecessorStatementRefs:s.predecessors.flatMap(a=>a.candidate.statements.map(s=>s.statementRef))}],requirementCandidates:[],pressure:[],
    worksiteDesign:s.task.bodyCapabilities.includes('worksite_design')?{targets:s.worksite.targets.map(t=>({targetRef:t.target.targetRef,role:t.role,
     obligationRefs:t.role==='configuration'?[]:obligations,changeInstruction:'Apply the separately declared mechanical fixture bytes; preserve dependencies during repair'})),
     commandRefs:s.worksite.commands.map(c=>c.commandId),dependencyTargetRefs:s.worksite.targets.filter(t=>t.role==='configuration').map(t=>t.target.targetRef),dependencyDisposition:'sufficient'}:null};
  }
 }
 emit({type:'result',subtype:'success',result:JSON.stringify(raw)});
});
`;
  await writeFile(path, code, { flag: 'wx' }); await chmod(path, 0o755); return path;
}
