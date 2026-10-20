// Controlled transport conservation only: this is not independent semantic assessment.
import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir, chmod, appendFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import {runtime, schemaVersion, hash, digest, readJson, writeJson, coordinate, source, material,
  nativeVerification, createCaller, setup, recoverSetup, constructStart, prepareNative, terminal, freshRead}
  from '../support/installed-qualification-conservation.mjs';

const {product, abg, validator, gtl, preparation} = runtime;
const root = resolve(process.env.ABI5_INSTALLED_CONSERVATION_ROOT);
const packageRoot = resolve(process.env.ABI5_INSTALLED_CONSERVATION_PACKAGE_ROOT);
const archivePath = resolve(process.env.ABI5_INSTALLED_CONSERVATION_ARCHIVE);
const pinnedNode = resolve(process.env.ABI5_INSTALLED_CONSERVATION_NODE);
const originalRoot = process.env.ABI5_INSTALLED_CONSERVATION_ORIGINAL_ROOT
  ? resolve(process.env.ABI5_INSTALLED_CONSERVATION_ORIGINAL_ROOT) : null;
const evidenceRoot = process.env.ABI5_INSTALLED_CONSERVATION_EVIDENCE_ROOT
  ? resolve(process.env.ABI5_INSTALLED_CONSERVATION_EVIDENCE_ROOT) : null;
const eventLogPath = join(originalRoot ?? root, 'resources/events/runtime.events.jsonl');
const identity = preparation.constructQualificationIdentity;
const policy = preparation.QUALIFICATION_ROLE_POLICY;
const coord = (ref, valueDigest) => ({ref, digest: valueDigest});
const expectedArchiveDigest = 'sha256:c54721805a8adb73c3fa74ee8c3c04126dc5bd7ad2da542967b9292c6a4943e5';
const planSlot = 'slot://abiogenesis/t287/installed-conservation/inventory-A';
const rootA = 'fixture://abiogenesis/t287/installed-conservation/A';
const rootB = 'fixture://abiogenesis/t287/installed-conservation/B';
assert.equal(process.execPath, pinnedNode, 'caller interpreter is pinned');
assert.equal(process.env.HOME, '/Users/jim');
assert.equal(process.env.NODE_OPTIONS, undefined, 'default heap is preserved');

async function fixture(caller, install) {
  const catalogBytes = await readFile(join(packageRoot, 'contracts/qualification/rule-catalog.json'));
  const catalog = JSON.parse(catalogBytes), law = await readJson(join(packageRoot, 'contracts/qualification/law-basis.json'));
  const coverage = await readJson(join(packageRoot, 'contracts/qualification/coverage.json'));
  assert.equal(coverage.lawBasis.digest, law.lawBasisDigest);
  assert(validator.qualificationCoverageIsPublished(coverage));
  const lawBasis = coord(law.lawBasisRef, law.lawBasisDigest);
  const catalogCoordinate = coord(catalog.catalogRef, digest(catalogBytes));
  const fixtureOwnerRoot = originalRoot ?? root, fixtureRoot = join(fixtureOwnerRoot, 'fixture');
  if (!originalRoot) await mkdir(fixtureRoot, {recursive: true});
  const authorRef = 'actor://abiogenesis/t287/installed-conservation/fixture-worker';
  const activationRef = pathToFileURL(join(fixtureRoot, 'activation.json')).href;
  const preimageRef = pathToFileURL(join(fixtureRoot, 'preimage.json')).href;
  const deltaRef = pathToFileURL(join(fixtureRoot, 'delta.patch')).href;
  const closureRef = pathToFileURL(join(fixtureRoot, 'closure.json')).href;
  const scopeRefs = [rootA + '/member.mjs', rootB + '/member.mjs'];
  if (!originalRoot) await writeJson(join(fixtureRoot, 'activation.json'), {kind: 'external_fixture_worker_activation',
    grant: pathToFileURL(join(root, 'grant.md')).href, authorRef, actorIdentityRef: authorRef,
    authorityRef: policy.authorityRef, scopeRefs, controlledTransport: true,
    semanticIndependentAssessment: false, startedAt: new Date().toISOString()});
  if (!originalRoot) await writeJson(join(fixtureRoot, 'preimage.json'), {members: [], disposition: 'new bounded fixture files absent'});
  const subjectMaterial = [];
  for (const [index, text] of ['export const a = 1;\n', 'export const b = 2;\n'].entries()) {
    const path = 'fixture/' + (index === 0 ? 'A' : 'B') + '/member.mjs', physical = join(fixtureOwnerRoot, path);
    if (!originalRoot) {
      await mkdir(join(root, 'fixture', index === 0 ? 'A' : 'B'), {recursive: true});
      await writeFile(physical, text, {flag: 'wx'});
    }
    const bytes = await readFile(physical);
    assert.equal(bytes.toString('utf8'), text);
    subjectMaterial.push(material(scopeRefs[index], path, bytes));
  }
  const patch = subjectMaterial.map(m => '--- /dev/null\n+++ ' + m.path + '\n@@ -0,0 +1,1 @@\n+' +
    Buffer.from(m.contentBase64, 'base64').toString('utf8')).join('');
  if (!originalRoot) await writeFile(join(fixtureRoot, 'delta.patch'), patch, {flag: 'wx'});
  else assert.equal(await readFile(join(fixtureRoot, 'delta.patch'), 'utf8'), patch);
  if (!originalRoot) await writeJson(join(fixtureRoot, 'closure.json'), {kind: 'external_fixture_worker_closure', authorRef,
    actor: authorRef, members: subjectMaterial.map(source), completedAt: new Date().toISOString(),
    claim: 'actual byte construction; controlled test only'});
  const records = [];
  for (const name of ['activation.json', 'preimage.json', 'delta.patch', 'closure.json']) {
    const path = join(fixtureRoot, name);
    records.push(material(pathToFileURL(path).href, 'fixture/' + name, await readFile(path)));
  }
  for (const m of subjectMaterial) records.push(material(m.ref + '/postimage', m.path, Buffer.from(m.contentBase64, 'base64')));
  if (originalRoot) {
    const oldFreeze = await readJson(join(evidenceRoot, 'predecessor-freeze-selection.json'));
    for (const pin of oldFreeze.fixturePins) {
      const bytes = await readFile(pin.path);
      assert.equal(bytes.length, pin.bytes); assert.equal(digest(bytes), 'sha256:' + pin.sha256);
    }
    assert.equal((await readJson(join(fixtureRoot, 'activation.json'))).authorRef, authorRef);
    assert.equal((await readJson(join(fixtureRoot, 'closure.json'))).authorRef, authorRef);
  }
  const inventory = identity({kind: 'qualification_subject_inventory', selectedRoots: [rootA, rootB], coverage: 'incomplete',
    members: subjectMaterial.map(m => ({...source(m), surfaceRoles: ['code'], classificationEvidenceRefs: []}))},
    'inventoryRef', 'inventoryDigest', 'qualification-inventory://abiogenesis/');
  const inventoryCoordinate = coord(inventory.inventoryRef, inventory.inventoryDigest);
  const claims = install.capabilityDefinitionGraph.rows.flatMap(row => {
    const publicContractRefs = install.publicContracts.filter(c => c.owningProduct === install.productId &&
      c.capabilityIdentities.includes(row.capabilityId)).map(c => c.contractId);
    return publicContractRefs.length === 0 ? [] : [{claimRef: 'claim://abiogenesis/t287/installed-conservation/' + row.capabilityId,
      capabilityRef: row.capabilityId, publicContractRefs, evidenceRefs: [pathToFileURL(archivePath).href]}];
  });
  assert(claims.length > 0);
  const tenant = identity({kind: 'tenant_conformance_manifest', schemaVersion, productId: install.productId,
    capabilityDefinitionGraph: coord(install.capabilityDefinitionGraph.graphId, install.capabilityDefinitionGraph.graphDigest),
    publicContractCatalog: coord(install.catalogId, install.catalogDigest), claims},
    'manifestRef', 'manifestDigest', 'tenant-conformance-manifest://abiogenesis/');
  const verifiedArtifact = caller.native.verified;
  assert.equal(verifiedArtifact.artifactDigest, install.artifactDigest);
  assert.equal(verifiedArtifact.manifestDigest, install.manifestDigest);
  assert.equal(verifiedArtifact.productContentDigest, install.productContentDigest);
  assert.equal(verifiedArtifact.productId, install.productId);
  assert.equal(verifiedArtifact.packageVersion, install.packageVersion);
  const basis = identity({kind: 'exact_candidate_qualification', projection: 'basis', schemaVersion,
    subjectKind: 'pre_rc_candidate', productId: install.productId, productVersion: install.packageVersion,
    sourceInventory: inventoryCoordinate, artifact: coord(verifiedArtifact.artifactRef, verifiedArtifact.artifactDigest),
    productManifest: coord('product-manifest://abiogenesis/' + install.manifestDigest.slice(7), install.manifestDigest),
    productContentDigest: install.productContentDigest,
    toolchain: coord('toolchain://abiogenesis/' + install.manifestDigest.slice(7), install.manifestDigest),
    installedProduct: coord(install.installId, hash(install)), workspaceBinding: caller.state.binding, prospectiveRelease: null,
    tenantManifest: coord(tenant.manifestRef, tenant.manifestDigest), coverageCatalog: coord(coverage.catalogRef, coverage.catalogDigest), lawBasis},
    'basisRef', 'basisDigest', 'qualification-basis://abiogenesis/');
  const subjectBasis = coord(basis.basisRef, basis.basisDigest);
  const chain = {activationRef, preimageRef, deltaRef, closureRef, authorRef, actorIdentityRef: authorRef,
    authorityRef: policy.authorityRef, scopeRefs, postimageMembers: subjectMaterial.map(source),
    changes: subjectMaterial.map(m => ({memberRef: m.ref, patchPath: m.path, preimageMemberRef: null, postimageMemberRef: m.ref + '/postimage'})),
    attributionSources: records.filter(m => [activationRef, closureRef].includes(m.ref)).map(m => ({sourceRef: m.ref,
      startByte: 0, endByte: m.byteCount, spanDigest: m.digest}))};
  const provenance = {kind: 'external_construction', subjectInventory: inventoryCoordinate,
    recordSet: coordinate('records://abiogenesis/t287/installed-conservation', records), records, chains: [chain],
    acknowledgmentSelectionRef: null};
  const authorityMaterial = await Promise.all(catalog.sources.map(async row => ({...row,
    contentBase64: (await readFile(join(packageRoot, row.path))).toString('base64')})));
  const roleSources = policy.authoritySourceRefs.map(ref => catalog.sources.find(row => row.ref === ref));
  assert(roleSources.every(Boolean));
  const inventoryMaterial = material(inventory.inventoryRef, inventory.inventoryRef, Buffer.from(product.canonicalJson(inventory)));
  const taskMaterial = [...roleSources.map(row => authorityMaterial.find(m => m.ref === row.ref)), inventoryMaterial, ...subjectMaterial];
  const declarationProof = {kind: 'abg_historical_declaration_proof', schemaVersion,
    catalog: caller.state.catalog, catalogView: caller.state.catalogView};
  const declarationSelection = {catalogBasisDigest: caller.state.catalog.basisDigest,
    readinessBasisDigest: caller.state.catalog.readinessBasisDigest, viewDigest: caller.state.catalogView.viewDigest,
    proofDigest: hash(declarationProof)};
  const resourceProvenance = {...provenance, records: records.map(m => ({entryKind: 'material', entry: coord(m.ref, m.digest)}))};
  const provenanceCoordinate = coordinate('provenance://abiogenesis/t287/installed-conservation', resourceProvenance);
  const entries = [{entryKind: 'inventory', coordinate: inventoryCoordinate, value: inventory},
    {entryKind: 'law', coordinate: lawBasis, value: law},
    {entryKind: 'tenant_manifest', coordinate: coord(tenant.manifestRef, tenant.manifestDigest), value: tenant},
    {entryKind: 'coverage_catalog', coordinate: coord(coverage.catalogRef, coverage.catalogDigest), value: coverage},
    {entryKind: 'provenance', coordinate: provenanceCoordinate, value: resourceProvenance}];
  for (const m of [...authorityMaterial, inventoryMaterial, ...subjectMaterial, ...records]) {
    if (!entries.some(entry => entry.entryKind === 'material' && entry.coordinate.ref === m.ref))
      entries.push({entryKind: 'material', coordinate: coord(m.ref, m.digest), value: m});
  }
  const manifest = identity({kind: 'qualification_resource_manifest', schemaVersion: '1', subjectBasis, lawBasis,
    catalog: catalogCoordinate, inventory: inventoryCoordinate, entries, declarationSelections: [declarationSelection]},
    'resourceRef', 'resourceDigest', 'qualification-resource://abiogenesis/');
  const resource = coord(manifest.resourceRef, manifest.resourceDigest);
  const selection = (entryKind, entry) => ({kind: 'qualification_resource_selection', schemaVersion: '1', resource, entryKind, entry});
  const role = {roleRef: 'qualification-role://abiogenesis/inventory@5', authorityRef: policy.authorityRef, sourceBindings: roleSources,
    actorRef: policy.actorRefs[0], workerBindingRef: policy.workerBindingRef, rendererRef: policy.rendererRef,
    materializationPlanRef: policy.materializationPlanRef, independence: 'author_distinct'};
  const contextRef = 'context://abiogenesis/t287/installed-conservation/inventory';
  const members = taskMaterial.map(m => ({memberRef: m.ref, path: m.path, digest: m.digest, byteCount: m.byteCount}));
  const criterion = {criterionRef: 'criterion://abiogenesis/t287/installed-conservation/inventory-A',
    ruleRef: inventory.inventoryRef, surfaceRef: rootA, evidenceRole: 'inventory_coverage'};
  const task = identity({kind: 'qualification_assessment_task', schemaVersion, representation: 'resource_refs_v1', resource,
    slotRef: planSlot, taskOrdinal: 0, subjectBasis, lawBasis, catalog: catalogCoordinate, inventory: inventoryCoordinate, role,
    context: {contextRef, sourceLocator: 'material://abiogenesis/t287/installed-conservation', inventoryDigest: hash(members), members},
    declarations: [declarationSelection], assetSurface: {kind: 'qualification_assessment', requiredContexts: [contextRef],
      standardsRefs: policy.authoritySourceRefs, outputContractRefs: [gtl.QUALIFICATION_IDS.assessmentRaw],
      constructorRef: 'constructor://abiogenesis/t287/installed-conservation/fixture', rendererRef: policy.rendererRef,
      proofObligationRefs: ['proof://abiogenesis/t287/installed-conservation/supplied-material'],
      authoritySlots: [{authorityKindRef: policy.authorityRef, disposition: 'normal', fallbackPreconditionRefs: []}]},
    material: taskMaterial.map(m => selection('material', coord(m.ref, m.digest))), subjectMembers: subjectMaterial.map(source),
    coverage: [criterion], provenance: selection('provenance', provenanceCoordinate), priorEvidenceRefs: [],
    residuals: ['Controlled conservation fixture; inventory and whole-candidate qualification remain incomplete.']},
    'taskRef', 'taskDigest', 'qualification-task://abiogenesis/');
  const plan = identity({kind: 'qualification_assessment_plan', subjectBasis, lawBasis,
    slots: [{slotRef: planSlot, task: coord(task.taskRef, task.taskDigest), taskOrdinal: 0,
      graphFunctionRef: gtl.QUALIFICATION_IDS.assessGraph, programLocusRef: 'node://abiogenesis/qualification/assess@5', role, coverage: [criterion]}],
    coverage: [criterion], sharedCoverage: 'disjoint', ownerAuthorityRef: policy.authorityRef, ownerActorRef: caller.actorRef},
    'planRef', 'planDigest', 'qualification-plan://abiogenesis/');
  const assessmentInput = {kind: 'qualification_assessment_input', schemaVersion, task, plan};
  const assertion = {kind: 'qualification_resource_assertion', schemaVersion: '1', manifests: [manifest], declarationProofs: [declarationProof]};
  const invokingAssertion = {...assertion, declarationProofs: []}; // Product adds its actual current declaration proof.
  const prepared = preparation.prepareQualificationAssessment(assessmentInput, preparation.acquireQualificationResources(assertion));
  const raw = {kind: 'qualification_raw_judgment', schemaVersion, criteria: [{...criterion, disposition: 'falsified',
    applicability: 'applicable', reason: 'Controlled A counterexample: the supplied immutable inventory explicitly declares incomplete coverage.',
    sourceRefs: [inventory.inventoryRef, ...scopeRefs], evidenceRefs: [], residuals: []}],
    residuals: ['Controlled transport only; semantic independent assessment and whole-candidate qualification remain open.'],
    attributions: [{activationRef, authorRef, actorIdentityRef: authorRef, authorityRef: policy.authorityRef, scopeRefs,
      disposition: 'established', sourceRefs: [activationRef, preimageRef, deltaRef, closureRef],
      reason: 'Controlled fixture attribution is grounded in the actual activation, preimage, patch, closure and byte-identical postimages.'}]};
  const selfBase = {kind: 'self_conformance_input', schemaVersion, representation: 'resource_refs_v1', resource, basis,
    law: selection('law', lawBasis), inventory: selection('inventory', inventoryCoordinate),
    tenantManifest: selection('tenant_manifest', coord(tenant.manifestRef, tenant.manifestDigest)),
    authorityMembers: authorityMaterial.map(m => selection('material', coord(m.ref, m.digest))), applications: [], evidenceCitations: [],
    qualification: {plan, sourceMembers: subjectMaterial.map(m => selection('material', coord(m.ref, m.digest))),
      coverageCatalog: selection('coverage_catalog', coord(coverage.catalogRef, coverage.catalogDigest))}};
  await writeJson(join(root, 'qualification-resource.json'), assertion);
  await writeJson(join(root, 'assessment-input.json'), assessmentInput);
  await writeJson(join(root, 'controlled-raw.json'), raw);
  const prompt = Buffer.from(prepared.request.prompt);
  await writeJson(join(root, 'controlled-binding.json'), {promptBytes: prompt.length, promptDigest: digest(prompt), rawDigest: hash(raw)});
  const executable = join(root, 'controlled-actor.mjs');
  const program = `#!${pinnedNode}\n// Controlled ActorProcess fixture; zero real model/provider calls.\n` +
    `import assert from 'node:assert/strict';\nimport {readFileSync,appendFileSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\n` +
    `const root=${JSON.stringify(root)},read=n=>JSON.parse(readFileSync(root+'/'+n,'utf8'));\n` +
    `const binding=read('controlled-binding.json'),raw=read('controlled-raw.json'),chunks=[];\n` +
    `for await(const chunk of process.stdin)chunks.push(chunk);\nconst bytes=Buffer.concat(chunks);\n` +
    `assert.equal(bytes.length,binding.promptBytes);assert.equal('sha256:'+createHash('sha256').update(bytes).digest('hex'),binding.promptDigest);\n` +
    `appendFileSync(root+'/actor-exchanges.jsonl',JSON.stringify({pid:process.pid,execPath:process.execPath,promptDigest:binding.promptDigest,promptBytes:bytes.length,controlledTransport:true,realProviderCalls:0})+'\\n');\n` +
    `console.log(JSON.stringify({type:'system',subtype:'init'}));\nconsole.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(raw),structured_output:raw}));\n`;
  await writeFile(executable, program, {flag: 'wx'});
  await chmod(executable, 0o700);
  process.env.ABG_TS_CLAUDE_COMMAND = executable;
  process.env.ABG_TS_FP_TIMEOUT_MS = '60000';
  process.env.ABG_TS_FP_ABSOLUTE_TIMEOUT_MS = '120000';
  const metrics = {subjectBasis, resource, inventoryMembers: inventory.members.length, inventoryCoverage: inventory.coverage,
    selectedRoots: inventory.selectedRoots, declaredSlots: plan.slots.length, coverageClaims: coverage.claims.length,
    fullPublishedCoverage: true, materialBytes: entries.filter(e => e.entryKind === 'material').reduce((n, e) => n + e.value.byteCount, 0),
    assertionBytes: Buffer.byteLength(JSON.stringify(assertion)), promptBytes: prompt.length,
    assessmentInputBytes: Buffer.byteLength(JSON.stringify(assessmentInput)), realProviderCalls: 0, semanticIndependentAssessment: false};
  await writeJson(join(root, 'fixture-observation.json'), metrics);
  console.log(JSON.stringify({phase: 'fixture-ready', ...metrics}));
  return {assessmentInput, assertion: invokingAssertion, prepared, raw, basis, coverage, selfBase, resource,
    declarations: [declarationSelection], makeProof: (prefix, selections) => ({kind: 'qualification_proof_resource', schemaVersion,
      representation: 'resource_refs_v1', resource, prefix, declarations: [declarationSelection], selections})};
}

async function main() {
  const nominalStarted = performance.now(), native = await nativeVerification(packageRoot, archivePath);
  await writeJson(join(root, 'nominal-verification-observation.json'), {elapsedMs: performance.now() - nominalStarted,
    executingArtifact: coord(native.verified.artifactRef, native.verified.artifactDigest),
    manifestDigest: native.verified.manifestDigest, currentRssBytes: process.memoryUsage().rss,
    currentHeapUsedBytes: process.memoryUsage().heapUsed, cumulativePeakRssBytes: process.resourceUsage().maxRSS * 1024,
    standing: 'actual owner-issued nominal verification', realProviderCalls: 0});
  const caller = createCaller({root, native, eventLogPath});
  const environment = originalRoot ? await recoverSetup(caller, {originalRoot, evidenceRoot}) : await setup(caller);
  await writeJson(join(root, 'setup-observation.json'), {status: 'complete', install: coord(environment.install.installId, hash(environment.install)),
    binding: caller.state.binding, prefix: caller.state.closeHandoff.prefix, elapsedMs: environment.elapsedMs,
    calls: caller.state.calls.length, reusedSetup: !!originalRoot, singletonProducts: 1, programs: 3, realProviderCalls: 0});
  const packet = await fixture(caller, environment.install), flowStarted = performance.now();
  const deadline = () => assert(performance.now() - flowStarted < 300000, 'flow exceeds complete phase budget');
  const assessmentCall = await constructStart(caller, 'program://abiogenesis/qualification/assess@5',
    gtl.QUALIFICATION_IDS.assessGraph, packet.assessmentInput, packet.assertion);
  const assessmentOwner = await prepareNative(caller, assessmentCall);
  assert.equal(preparation.prepareQualificationAssessment(packet.assessmentInput, assessmentOwner.qualificationResources).request.prompt,
    packet.prepared.request.prompt, 'actual preparation agrees with controlled prompt');
  const assessed = await caller.invoke('assessment', assessmentCall), judgment = terminal(assessed, 'qualification_judgment');
  assert(validator.isQualificationJudgment(judgment.value));
  assert.deepEqual(judgment.value.raw, packet.raw);
  assert.equal(judgment.value.source.cCallRef, judgment.producer.cCallRef);
  const judgmentSelection = {kind: 'judgment_selection', selectionRef: 'selection://abiogenesis/t287/installed-conservation/A',
    slotRef: planSlot, task: coord(packet.assessmentInput.task.taskRef, packet.assessmentInput.task.taskDigest),
    programRef: judgment.producer.program.ref, invocationAdmissionRef: judgment.producer.invocationAdmissionRef, result: judgment.result};
  const proof = packet.makeProof(caller.state.closeHandoff.prefix, [judgmentSelection]);
  assert.deepEqual(abg.projectQualificationJudgment(proof, packet.assessmentInput.plan, judgmentSelection,
    assessmentOwner.qualificationResources), judgment.value);
  assert.equal(abg.projectQualificationJudgment(proof, packet.assessmentInput.plan, judgmentSelection), null);
  assert.equal(abg.projectQualificationJudgment(proof, packet.assessmentInput.plan, {...judgmentSelection,
    result: {...judgmentSelection.result, digest: hash('nearest crossed Result')}}, assessmentOwner.qualificationResources), null);
  assert.deepEqual(abg.projectQualificationJudgment(proof, packet.assessmentInput.plan, judgmentSelection,
    assessmentOwner.qualificationResources), judgment.value, 'restore original without rerunning producer');
  await writeJson(join(root, 'assessment-conservation.json'), {status: 'authenticated', result: judgment.result,
    valueDigest: judgment.valueDigest, producer: judgment.producer, source: judgment.value.source,
    crossedResultRefused: true, missingResourceRefused: true, semanticIndependentAssessment: false});
  deadline();
  const selfInput = {...packet.selfBase, qualification: {...packet.selfBase.qualification, proof}};
  const selfCall = await constructStart(caller, gtl.SELF_CONFORMANCE_IDS.programRef, gtl.SELF_CONFORMANCE_IDS.graphFunctionRef,
    selfInput, packet.assertion);
  const selfOwner = await prepareNative(caller, selfCall);
  const evaluated = await caller.invoke('f11', selfCall), selfResult = terminal(evaluated, 'self_conformance_result');
  assert(validator.isSelfConformanceResult(selfResult.value));
  const findings = selfResult.value.findings.filter(f => f.diagnostic === 'inventory_coverage_assessment_required');
  const failed = findings.find(f => f.disposition === 'failed' && f.provenance === 'J');
  const uncovered = findings.find(f => f.disposition === 'blocked_incomplete' && f.provenance === 'J_required');
  assert(failed, 'A known failure is preserved by F11');
  assert.deepEqual(failed.surfaceRefs, [rootA]);
  assert(failed.evidenceRefs.includes(judgment.result.ref), 'A retains original native Result citation');
  assert(uncovered, 'B remains explicitly uncovered outside the finite authentic plan');
  assert.deepEqual(uncovered.surfaceRefs, [rootB]);
  assert.deepEqual(uncovered.evidenceRefs, []);
  assert(selfResult.value.findings.some(f => f.diagnostic === 'verification_material_missing'));
  await writeJson(join(root, 'f11-conservation.json'), {status: 'preserved', result: selfResult.result, valueDigest: selfResult.valueDigest,
    producer: selfResult.producer, disposition: selfResult.value.disposition, failed, uncovered,
    findings: selfResult.value.findings.length, qualificationVerdict: selfResult.value.qualificationVerdict,
    semanticIndependentAssessment: false});
  deadline();
  const selfSelection = {kind: 'self_conformance_selection', selectionRef: 'selection://abiogenesis/t287/installed-conservation/F11',
    slotRef: 'node://abiogenesis/qualification/self-conformance@5', programRef: selfResult.producer.program.ref,
    invocationAdmissionRef: selfResult.producer.invocationAdmissionRef, result: selfResult.result};
  const verdictProof = packet.makeProof(caller.state.closeHandoff.prefix, [selfSelection]);
  const summary = abg.projectQualificationSelfConformance(verdictProof, selfSelection, packet.basis, selfOwner.qualificationResources);
  assert(summary, 'native F11 Result authenticates for AF22');
  const verdictInput = {kind: 'qualification_verdict_input', schemaVersion, slotRef: 'node://abiogenesis/qualification/exact-candidate@5',
    basis: packet.basis, coverage: packet.coverage, selectionRef: selfSelection.selectionRef, selfConformance: summary, proof: verdictProof};
  const verdictCall = await constructStart(caller, 'program://abiogenesis/qualification/exact-candidate@5',
    gtl.QUALIFICATION_IDS.verdictGraph, verdictInput, packet.assertion);
  const qualified = await caller.invoke('af22', verdictCall), verdict = terminal(qualified, 'exact_candidate_qualification');
  assert(validator.isQualificationVerdict(verdict.value));
  assert.equal(verdict.value.disposition, 'red');
  assert.deepEqual(verdict.value.selfConformance, summary);
  assert.equal(summary.assessment.ref, selfResult.result.ref, 'sole AF22 names actual F11 Result');
  const selections = [[assessed, judgment, 'assessment'], [evaluated, selfResult, 'f11'], [qualified, verdict, 'af22']]
    .map(([observation, result, label]) => ({label, run: observation.receipt.ownerOutput.value.run,
      slots: Object.fromEntries(['workspace_binding', 'product_set', 'dependency_lock'].map(key =>
        [key, observation.call.invocation.invocationAuthority.slots[key]])), terminalDigest: hash(result),
      result: result.result, producer: result.producer, ...(label === 'assessment' ? {source: result.value.source} : {})}));
  const exchanges = (await readFile(join(root, 'actor-exchanges.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(exchanges.length, 1, 'read/restore never reruns original ActorProcess');
  assert.equal(exchanges[0].execPath, pinnedNode);
  await writeJson(join(root, 'read-selection.json'), {binding: caller.state.binding, closeHandoff: caller.state.closeHandoff, selections});
  await writeJson(join(root, 'flow-observation.json'), {status: 'passed', archiveDigest: expectedArchiveDigest,
    subjectBasis: coord(packet.basis.basisRef, packet.basis.basisDigest), findingsPreserved: true, uncoveredCoverageExplicit: true,
    soleAF22Disposition: verdict.value.disposition, af22Result: verdict.result, f11Assessment: summary.assessment,
    prefix: caller.state.closeHandoff.prefix, actorExchanges: exchanges.length, realProviderCalls: 0,
    semanticIndependentAssessment: false, wholeCandidateQualification: false, elapsedMs: performance.now() - flowStarted});
  return {claims: 'controlled installed conservation; cold reads run separately', actorExchanges: exchanges.length};
}

async function cold() {
  const selected = await readJson(join(root, 'read-selection.json'));
  const native = await nativeVerification(packageRoot, archivePath);
  const caller = createCaller({root, native, binding: selected.binding, closeHandoff: selected.closeHandoff, eventLogPath});
  const reads = [];
  for (const selection of selected.selections) for (const memberKey of ['run_result', 'run_replay'])
    reads.push(await freshRead(caller, selection, memberKey));
  const exchanges = (await readFile(join(root, 'actor-exchanges.jsonl'), 'utf8')).trim().split('\n');
  assert.equal(exchanges.length, 1);
  await writeJson(join(root, 'cold-read-observation.json'), {status: 'passed', reads, actorExchanges: exchanges.length,
    realProviderCalls: 0, prefix: caller.state.closeHandoff.prefix, processId: process.pid,
    semanticIndependentAssessment: false, wholeCandidateQualification: false});
}

test(process.env.ABI5_INSTALLED_CONSERVATION_MODE === 'cold' ? 'fresh process Public Result/replay retain original producers'
  : 'native controlled A failure survives uncovered B through F11 and sole AF22', async t => {
  try {
    const result = process.env.ABI5_INSTALLED_CONSERVATION_MODE === 'cold' ? await cold() : await main();
    t.diagnostic(JSON.stringify(result ?? {status: 'cold reads agree'}));
  } catch (error) {
    await writeJson(join(root, 'first-failure.json'), {status: 'stopped', message: String(error), stack: error.stack,
      name: error.name, code: error.code ?? null, actual: typeof error.actual === 'object' ? hash(error.actual ?? null) : error.actual ?? null,
      expected: typeof error.expected === 'object' ? hash(error.expected ?? null) : error.expected ?? null,
      processId: process.pid, stoppedAt: new Date().toISOString(), semanticIndependentAssessment: false});
    throw error;
  }
});
