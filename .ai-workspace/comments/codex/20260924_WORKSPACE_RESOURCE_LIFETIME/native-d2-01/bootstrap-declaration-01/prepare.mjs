import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const dir = fileURLToPath(new URL('.', import.meta.url));
const read = async name => JSON.parse(await readFile(dir + name, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inputs = await read('inputs.json');
const requireHash = async row => assert.equal(hash(await readFile(row.path)), row.sha256, row.path);
await requireHash(inputs.sourceReturn); await requireHash(inputs.frozenSubject); await requireHash(inputs.generatedSubject);
for (const row of (JSON.parse(await readFile(inputs.frozenSubject.path, 'utf8'))).files) await requireHash({ path: row.path, sha256: row.afterSha256 });
for (const row of JSON.parse(await readFile(inputs.generatedSubject.path, 'utf8'))) await requireHash({ path: row.path, sha256: row.afterSha256 });
await requireHash(inputs.gtlPublicEntry); await requireHash(inputs.producer.publication); await requireHash(inputs.historicalLifecycle.definition);
// Only the candidate's public ./gtl entry is imported. No runtime or private owner calls.
const g = await import(pathToFileURL(inputs.gtlPublicEntry.path).href);
const required = ['constructSemanticJobLifecycleDeclaration','constructSemanticRevisionGraphFunction','constructSemanticRevisionSelectionGraphFunction',
  'constructSemanticClosureContract','constructRunEnvironmentDeclaration','modulePublication','constructNativeWorkspaceWorkModulePublication',
  'constructWorksiteCommandExecutionModulePublication','constructSemanticRevisionModulePublication','nativeContextLeafFamily','graphEdge','cGraphFunctionRef','cCarrier'];
for (const name of required) assert.equal(typeof g[name], 'function', 'missing public GTL export: ' + name);
const original = await read('original-dev8-publication.json');
const lifecycle = g.constructSemanticJobLifecycleDeclaration(await read('original-lifecycle.json'));
assert.equal(JSON.stringify(lifecycle), JSON.stringify(original.semanticJobLifecycle));
const oldEnvironment = g.constructRunEnvironmentDeclaration(structuredClone(original.runEnvironments[0]));
const oldProgram = original.programs[0], identity = inputs.prospectivePublicationIdentity;
const n = g.SEMANTIC_STAGE_IDS, r = g.SEMANTIC_REVISION_IDS, w = g.NATIVE_WORKSPACE_WORK_IDS;
const zero = 'sha256:' + '0'.repeat(64);
// Prospective dependency declarations only; zero coordinates are not installed artifact claims.
const authoringBasis = { productId: 'product://abiogenesis/typescript-tenant@5.0.0-rc.1', packageName: '@abiogenesis/typescript-tenant',
  packageVersion: '5.0.0-rc.1', artifactDigest: zero, productContentDigest: zero, productManifestDigest: zero };
const native = g.constructNativeWorkspaceWorkModulePublication(authoringBasis);
const commands = g.constructWorksiteCommandExecutionModulePublication(authoringBasis);
const revision = g.constructSemanticRevisionModulePublication(authoringBasis);
const commandRole = oldEnvironment.roles.find(row => row.role === 'command_executor');
assert.ok(commands.graphFunctions.some(row => row.name === commandRole.graphFunctionRef));
const graphs = [], programs = [], closures = [];
const ref = name => `graph-function://odd-glc/native-semantic-revision/${name}@5`;
const close = (name, predicateRef, resultContractRef, closureScope = 'graph_call') => {
  const closureContractRef = `contract://odd-glc/fresh-native-lifecycle/revision-${name}/closure@5`;
  closures.push(g.constructSemanticClosureContract({ closureContractRef, predicateRef, resultContractRef, closureScope }));
  return closureContractRef;
};
const leaf = (name, role, predicate, result, extra = {}) => {
  const closureContractRef = close(name, predicate, result);
  const graph = g.constructSemanticRevisionGraphFunction({ graphFunctionRef: ref(name), role, closureContractRef,
    childClosureContractRef: closureContractRef, ...extra });
  graphs.push(graph); return graph;
};
const root = (name, chain, predicate, result) => {
  const graphFunctionRef = ref(name), closureContractRef = close(name + '-root', predicate, result, 'run');
  const nodes = chain.map((graph, i) => ({ nodeRef: graphFunctionRef + '/step-' + i, nodeKind: 'c_locus',
    term: g.workflow.C(g.cGraphFunctionRef({ graphFunctionRef: graph.name, input: g.cCarrier(graph.inputs[0]), output: g.cCarrier(graph.outputs[0]) })) }));
  const carriers = [...new Set(chain.flatMap(graph => [...graph.inputs, ...graph.outputs]))];
  const graph = { kind: 'graph_function', name: graphFunctionRef, version: '5.0.0', inputs: [chain[0].inputs[0]], outputs: [result],
    environment: { requires: [chain[0].inputs[0]], provides: carriers, carries: carriers }, effects: [...new Set(chain.flatMap(graph => graph.effects))],
    tags: ['odd-glc', 'native-semantic-revision'], declarations: { 'abg.compute_regime': 'mixed', 'abg.closure_contract': closureContractRef,
      'abg.evidence_contract': n.evidenceContractRef, 'abg.judgment_contract': n.judgmentContractRef, 'abg.judgment_predicate': r.stepPredicateRef,
      'abg.transition_contract': n.transitionContractRef }, template: { kind: 'inline_graph', graphRef: graphFunctionRef + '/graph',
      startNodeRef: nodes[0].nodeRef, terminalNodeRefs: [nodes.at(-1).nodeRef], nodes, applications: [],
      edges: nodes.slice(1).map((node, i) => g.graphEdge({ fromNodeRef: nodes[i].nodeRef, toNodeRef: node.nodeRef })) } };
  graphs.push(graph);
  const programRef = `program://odd-glc/native-semantic-revision/${name}@5`;
  programs.push({ ...structuredClone(oldProgram), programRef, starts: [{ startRef: programRef + '/start', graphFunctionRef }], closureContractRef,
    callableMembership: [graphFunctionRef, ...chain.map(graph => graph.name), ...(chain.some(graph => graph.effects.includes(w.effectUri)) ? [w.graphFunctionRef, commandRole.graphFunctionRef] : [])],
    policies: { ...oldProgram.policies, 'abg.default_start_ref': programRef + '/start' } });
};
const acquire = leaf('acquire', 'nativeIntake', r.nativeIntakePredicateRef, r.selectionInputContractRef);
const select = g.constructSemanticRevisionSelectionGraphFunction({ graphFunctionRef: ref('select'), lifecycleRef: lifecycle.declarationRef, sealRequest: true,
  closureContractRef: close('select', r.nativeRequestPredicateRef, r.requestContractRef), childClosureContractRef: close('seal', r.nativeRequestPredicateRef, r.requestContractRef) });
graphs.push(select); root('intake', [acquire, select], r.nativeRequestPredicateRef, r.requestContractRef);
const stages = lifecycle.stages.map((stage, i) => leaf('stage-' + i, 'projection', r.assessorPredicateRef, r.envelopeContractRef, { stage }));
const construction = leaf('construction', 'nativeConstruction', r.nativeEvidencePredicateRef, r.envelopeContractRef);
const terminal = leaf('terminal', 'terminal', r.terminalPredicateRef, r.outputContractRef);
const evidence = lifecycle.stages.findIndex(stage => stage.bodyCapabilities.includes('application_assessment'));
assert.ok(evidence >= 0);
for (const [name, index, entry] of [['construction-repair', evidence, 'construction_repair'],
  ...lifecycle.stages.map((stage, i) => ['from-' + stage.declarationRef.split('/').at(-1).replace('@5', ''), i, stage.declarationRef])]) {
  const projection = leaf(name + '-projection', 'projection', r.projectionPredicateRef, r.envelopeContractRef, { nativeEntry: entry });
  root(name, [projection, ...(index < evidence ? stages.slice(index, evidence) : []),
    ...(entry === lifecycle.stages[evidence].declarationRef ? [] : [construction]), ...stages.slice(evidence), terminal], r.projectionPredicateRef, r.outputContractRef);
}
// Preserve the original environment. New exact Program/locus bindings reuse its same immutable source, frames and accesses.
const allGraphs = [...original.graphFunctions, ...graphs, ...native.graphFunctions, ...commands.graphFunctions];
const roleSource = new Map(oldEnvironment.roles.map(row => [row.role, row]));
const authorPolicy = 'Derive only the declared affected semantic asset from authenticated current context and preserved source obligations. Return the closed candidate JSON; use no tools or file writes.';
assert.ok((await readFile(inputs.frozenGlcDeclarationSource.path, 'utf8')).includes(authorPolicy));
const environments = programs.map(program => {
  const roles = allGraphs.filter(graph => program.callableMembership.includes(graph.name)).flatMap(graph => graph.template.nodes.flatMap(node =>
    g.cLeafTerms(node.term).filter(leaf => leaf.fibre === 'F_P').map(leaf => {
      const role = g.nativeContextLeafFamily(graph, leaf); assert.ok(role, 'unclassified actor ' + graph.name);
      const source = roleSource.get(role === 'author' ? 'constructor' : role); assert.ok(source, 'unavailable original role context ' + role);
      const row = { ...structuredClone(source), graphFunctionRef: graph.name, programLocusRef: leaf.programLocusRef, role };
      if (role === 'author') {
        row.policy = { policyRef: 'policy://odd-glc/fresh-native-lifecycle/author@5', text: authorPolicy, digest: 'sha256:' + hash(authorPolicy) };
        row.contextPolicy = { policyRef: 'policy://odd-glc/fresh-native-lifecycle/author/selection@5', selectors: ['current_worksite'] };
      }
      return row;
    })));
  const declarationRef = oldEnvironment.declarationRef + '/native-revision-' + program.programRef.split('/').at(-1).replace('@5', '');
  program.policies[g.RUN_ENVIRONMENT_POLICY] = declarationRef;
  return g.constructRunEnvironmentDeclaration({ ...structuredClone(oldEnvironment), declarationRef, roles });
});
const template = original.contracts[0];
const publication = g.modulePublication({ ...structuredClone(original), kind: 'module_publication', moduleVersion: '5.0.0',
  owningProductId: identity.productId, descriptorRef: identity.descriptorRef, contributionManifestRef: identity.contributionManifestRef,
  artifactDigest: zero, productContentDigest: zero, productManifestDigest: zero,
  semanticJobLifecycle: lifecycle, runEnvironments: [oldEnvironment, ...environments],
  graphFunctions: [...original.graphFunctions, ...graphs], programs: [oldProgram, ...programs],
  contracts: [...original.contracts, ...closures.map(c => ({ ...template, contractRef: c.closureContractRef }))],
  closureContracts: [...original.closureContracts, ...closures],
  contributions: [...original.contributions.map(c => ({ ...c, owningProductId: identity.productId, provenanceRefs: [zero, zero] })),
    ...graphs.map(graph => ({ handle: graph.name, kind: 'graph_function', declarationOrContractRef: graph.name, owningProductId: identity.productId,
      programMembershipRefs: programs.filter(p => p.callableMembership.includes(graph.name)).map(p => p.programRef),
      readinessPrerequisiteRefs: programs.filter(p => p.callableMembership.includes(graph.name)).map(p => p.programRef),
      compatibilityRefs: ['compatibility://abiogenesis/major/5'], provenanceRefs: [zero, zero] }))] });
assert.deepEqual(publication.semanticJobLifecycle, original.semanticJobLifecycle);
assert.deepEqual(publication.runEnvironments.find(e => e.declarationRef === oldEnvironment.declarationRef), original.runEnvironments[0]);
for (const graph of original.graphFunctions) assert.deepEqual(publication.graphFunctions.find(g => g.name === graph.name), graph);
assert.deepEqual(publication.programs.find(p => p.programRef === oldProgram.programRef), oldProgram);
assert.equal(g.validSemanticJobLifecyclePublication(publication, [...native.contracts, ...commands.contracts]), true);
assert.equal(new Set(publication.graphFunctions.map(g => g.name)).size, publication.graphFunctions.length);
for (const program of programs) {
  const declared = publication.programs.find(p => p.programRef === program.programRef);
  for (const ref of declared.callableMembership) assert.equal(allGraphs.filter(g => g.name === ref).length, 1, 'callable closure ' + ref);
  const env = publication.runEnvironments.find(e => e.declarationRef === declared.policies[g.RUN_ENVIRONMENT_POLICY]);
  assert.equal(g.isRunEnvironmentDeclaration(env), true);
  const actors = allGraphs.filter(g => declared.callableMembership.includes(g.name)).flatMap(graph => graph.template.nodes.flatMap(node =>
    g.cLeafTerms(node.term).filter(leaf => leaf.fibre === 'F_P').map(leaf => ({ graph, leaf }))));
  assert.equal(actors.length, env.roles.length);
  for (const { graph, leaf } of actors) assert.equal(env.roles.filter(role => role.graphFunctionRef === graph.name && role.programLocusRef === leaf.programLocusRef && role.role === g.nativeContextLeafFamily(graph, leaf)).length, 1);
}
const write = async (name, value) => { const bytes = JSON.stringify(value, null, 2) + '\n'; await writeFile(dir + name, bytes); return { path: dir + name, sha256: hash(bytes), byteCount: Buffer.byteLength(bytes) }; };
const output = await write('prospective-publication.json', publication);
const report = { status: 'CLOSED_public_GTL_declaration_constructed_not_installed', publicEntry: inputs.gtlPublicEntry, publicInterfaces: required,
  prospectivePublication: output, originalLifecycleUnchanged: true, originalEnvironmentUnchanged: true, originalGraphsAndProgramUnchanged: true,
  declaredPrograms: programs.map(p => ({ programRef: p.programRef, start: p.starts[0], environment: p.policies[g.RUN_ENVIRONMENT_POLICY],
    actorLoci: environments.find(e => e.declarationRef === p.policies[g.RUN_ENVIRONMENT_POLICY]).roles.length })),
  checks: ['frozen source/generated postimages', 'exact archive lifecycle/stage equality', 'exact original role environment', 'all original graphs/Program unchanged',
    'public lifecycle publication contract relation', 'public environment construction', 'exact per-Program actor bindings', 'unique callable closure'],
  dependencyPublicationScope: 'Public factory values with zero artifact coordinates for authoring checks only; later installed core validation still required.',
  suffixSelection: 'NONE: all six alternatives are declared; source review is evaluating whether ordinary terminal request exposes sufficient selection fields. No stage is inferred or hardcoded.',
  limitations: ['No installed Product/Program validation or native acquisition/eligibility', 'No package identity accepted: dev.10 is prospective authoring input only',
    'Existing original environment/resources remain historical input; new per-Program role bindings require later installed admission',
    'No runtime owner, private leaf extraction, Run, journal, workspace or paid effect'] };
await write('construction-result.json', report);
console.log(JSON.stringify({ status: report.status, publication: output, programs: report.declaredPrograms.map(p => [p.programRef,p.actorLoci]), suffixSelection: report.suffixSelection }));
