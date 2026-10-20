// Supplied exact domain instances. Installed canonical owners alone prepare,
// execute, admit and authenticate this genuine independent assessment.
import assert from 'node:assert/strict';
import {readFile, mkdir, stat} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {runtime, schemaVersion, hash, digest, readJson, writeJson, coordinate, source, material,
  nativeVerification, createCaller, constructStart, prepareNative, terminal, freshRead}
  from './support/installed-qualification-conservation.mjs';

const {product, abg, validator, gtl, preparation} = runtime;
const repo = '/Users/jim/src/apps/abiogenesis';
const root = resolve(process.env.ABI5_GENUINE_ROOT);
const originalRoot = join(repo, '.ai-workspace/work/T287_CONTEXT_CONSERVATION_02');
const packageRoot = join(repo, '.ai-workspace/work/T287_CONTEXT_PROJECTION_PACKAGE_02/consumer/node_modules/@abiogenesis/typescript-tenant');
const archivePath = join(repo, '.ai-workspace/work/T287_CONTEXT_PROJECTION_PACKAGE_02/packs/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz');
const archiveDigest = 'sha256:214c576620c5f552cbf22a82f8f318638903013ca23ff49e42496b2d190a47f6';
const pinnedNode = join(repo, '.ai-workspace/work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/toolchain/bin/node');
const eventLogPath = join(originalRoot, 'resources/events/runtime.events.jsonl');
const historicalHandoff = join(repo, '.ai-workspace/work/T287_CONTEXT_CONSERVATION_02/fresh/read-af22-run_replay-handoff.json');
const constructionRoot = join(repo, '.ai-workspace/evidence/T287_REFERENCE_ATTRIBUTION_REPAIR_01/source-construction');
const currentConstructionRoot = join(repo, '.ai-workspace/evidence/T287_CONTEXT_PROJECTION_REPAIR_01/source-construction');
const mode = process.env.ABI5_GENUINE_MODE ?? 'prepare';
assert(['prepare', 'flow', 'cold'].includes(mode));
const frozenInputRoot = resolve(process.env.ABI5_GENUINE_INPUT_ROOT ?? root);
const policy = preparation.QUALIFICATION_ROLE_POLICY;
const identity = preparation.constructQualificationIdentity;
const coord = (ref, valueDigest) => ({ref, digest: valueDigest});
const actualAuthor = 'actor://codex/root/public_preparation_worker';
const ruleRef = 'rule://abiogenesis/self-conformance/5479c7c8062549b2353ba65cb38a14dcc3f0f2e1184dbbd042fad53a97558fca@2';
const slotRef = 'slot://abiogenesis/t287/genuine-context-assessment-04';
const started = performance.now();
const metrics = () => ({elapsedMs: performance.now() - started, currentRssBytes: process.memoryUsage().rss,
  currentHeapUsedBytes: process.memoryUsage().heapUsed, cumulativePeakRssBytes: process.resourceUsage().maxRSS * 1024});
const deadline = () => assert(performance.now() - started < (mode === 'prepare' ? 120000 : 600000), 'selected phase exceeds granted process cap');
const pin = async path => {const bytes = await readFile(path); return {path, bytes: bytes.length, digest: digest(bytes)};};
let phase = 'prerequisites';
assert.equal(process.execPath, pinnedNode);
assert.equal(process.env.HOME, '/Users/jim');
assert.equal(process.env.NODE_OPTIONS, undefined);
assert.equal(process.env.TMPDIR, join(originalRoot, 'tmp'));
if (mode === 'prepare') assert.equal(process.env.ABG_TS_CLAUDE_COMMAND, undefined, 'phase1 has no CLI dispatch configuration');
else assert.equal(process.env.ABG_TS_CLAUDE_COMMAND, '/Users/jim/.local/bin/claude');

async function restore(caller) {
  const old = await readJson(join(originalRoot, 'setup-observation.json'));
  const environment = caller.refresh();
  assert.equal(environment.productInstalls.length, 1);
  const install = environment.productInstalls[0], v = caller.native.verified;
  assert.deepEqual(coord(install.installId, hash(install)), old.install);
  for (const key of ['artifactDigest', 'productContentDigest', 'manifestDigest', 'productId', 'packageVersion'])
    assert.equal(v[key], install[key]);
  caller.state.resolvedLock = environment.resolvedProductLock;
  const constructors = ['constructConsensusModulePublication', 'constructHelloWorldModulePublication',
    'constructDefaultGovernanceLibraryModulePublication', 'constructSelfConformanceModulePublication',
    'constructRequirementHandoffModulePublication', 'constructSemanticRevisionModulePublication',
    'constructSemanticStageModulePublication', 'constructWorksiteCommandExecutionModulePublication',
    'constructWorksiteCommandForwardModulePublication', 'constructWorksiteConstructionModulePublication',
    'constructNativeWorkspaceWorkModulePublication'];
  const publications = constructors.map(name => gtl[name]({...v, productManifestDigest: v.manifestDigest}));
  assert.deepEqual(publications.map(p => [p.moduleRef, product.modulePublicationSemanticDigest(p)]).sort(),
    v.contributionManifest.publicationBindings.map(p => [p.moduleRef, p.publicationDigest]).sort());
  const admitted = abg.projectAdmittedProductInstallByAdmissionEventRef(environment.artifactTruth, install.admissionEventRef);
  caller.state.catalog = product.CatalogOperationPort.admit({kind: 'catalog_admit_packet', schemaVersion, memberKey: 'admit',
    readinessBasis: {workspaceBinding: environment.workspaceBindingCandidate, resolvedLock: environment.resolvedProductLock,
      verifiedProducts: [v], installedProducts: [admitted.candidate], publications}});
  assert.equal(caller.state.catalog.kind, 'graph_function_catalog', caller.state.catalog.code);
  const programs = publications.flatMap(p => p.programs).filter(p => ['program://abiogenesis/qualification/assess@5',
    gtl.SELF_CONFORMANCE_IDS.programRef, 'program://abiogenesis/qualification/exact-candidate@5'].includes(p.programRef));
  assert.equal(programs.length, 3);
  caller.state.catalogView = product.narrowGraphFunctionCatalog(caller.state.catalog,
    [...new Set(programs.flatMap(p => p.callableMembership))].sort());
  const view = caller.state.catalogView;
  assert.equal(hash({view: coord('graph-function-catalog-view://abiogenesis/' + view.viewDigest.slice(7), view.viewDigest),
    effectiveHandles: [...view.allowlist], residuals: []}),
    (await readJson(join(originalRoot, 'setup-view-observation.json'))).valueDigest);
  await writeJson(join(root, 'reuse-observation.json'), {status: 'ordinary_current_boundary_restored_without_replay',
    install: old.install, binding: old.binding, prefix: caller.state.closeHandoff.prefix,
    catalogDigest: caller.state.catalog.basisDigest, viewDigest: view.viewDigest,
    originalInstallAdmissionRef: install.admissionEventRef, providerCalls: 0, ...metrics()});
  return install;
}

async function instances(caller, install) {
  phase = 'domain-instance-construction';
  const catalogBytes = await readFile(join(packageRoot, 'contracts/qualification/rule-catalog.json'));
  const catalog = JSON.parse(catalogBytes), law = await readJson(join(packageRoot, 'contracts/qualification/law-basis.json'));
  const coverage = await readJson(join(packageRoot, 'contracts/qualification/coverage.json'));
  assert.equal(coverage.lawBasis.digest, law.lawBasisDigest);
  assert(validator.qualificationCoverageIsPublished(coverage));
  const selectedRule = catalog.rules.find(r => r.ruleRef === ruleRef);
  assert(selectedRule);
  assert.equal(selectedRule.governedClaim, 'REQ-P-SELF-CONFORMANCE-007A');
  assert.equal(selectedRule.sourceRef, 'repo://abiogenesis/specification/requirements/product/REQ-P-SELF-CONFORMANCE.md');
  assert.equal(selectedRule.startByte, 4093); assert.equal(selectedRule.endByte, 4568);
  assert.equal(selectedRule.spanDigest, 'sha256:84a350c441e9c4ceb5d01165c27611ba793913af20a37db4225badefe3767638');
  const lawBasis = coord(law.lawBasisRef, law.lawBasisDigest), catalogCoordinate = coord(catalog.catalogRef, digest(catalogBytes));
  const authorityMaterial = await Promise.all(catalog.sources.map(async row => {
    const bytes = await readFile(join(packageRoot, row.path));
    assert.equal(digest(bytes), row.digest); assert.equal(bytes.length, row.byteCount);
    return {...row, contentBase64: bytes.toString('base64')};
  }));
  const roleSources = policy.authoritySourceRefs.map(ref => catalog.sources.find(row => row.ref === ref));
  assert(roleSources.every(Boolean));
  const activation = await readJson(join(constructionRoot, 'activation.json'));
  const closure = await readJson(join(constructionRoot, 'closure.json'));
  const currentActivation = await readJson(join(currentConstructionRoot, 'activation.json'));
  const currentClosure = await readJson(join(currentConstructionRoot, 'closure.json'));
  for (const record of [activation, closure, currentActivation, currentClosure]) assert.equal(record.authorRef, actualAuthor);
  assert.equal(activation.scopeRefs.length, 2, 'historical two-file scope is preserved');
  assert.equal(currentActivation.scopeRefs.length, 1, 'actual renderer chain is qualifier-only');
  const proofMember = closure.members.find(m => m.path.endsWith('/abg/qualification_proof.ts'));
  const qualifierMember = currentClosure.members.find(m => m.path.endsWith('/validator/qualification.ts'));
  assert(proofMember && qualifierMember);
  const subjectMaterial = [];
  for (const [m, owner] of [[proofMember, constructionRoot], [qualifierMember, currentConstructionRoot]]) {
    const bytes = await readFile(m.path), retained = await readFile(join(owner, 'postimages', m.path.split('/').at(-1)));
    assert(bytes.equals(retained)); assert.equal(digest(bytes), m.digest); assert.equal(bytes.length, m.byteCount);
    assert.equal(m.ref, pathToFileURL(m.path).href);
    subjectMaterial.push(material(m.ref, m.path, bytes));
  }
  assert.deepEqual(subjectMaterial.map(m => [m.byteCount, m.digest]), [
    [82296, 'sha256:9b6b1ec6e0489455fb3aeadc3ebcbaf93459cf5a0cb65db13215c683a3e996e8'],
    [63412, 'sha256:0ee4bc36215f6fa7832d87d06f70e58909f75aa4d3b4c21d13bee59f55675ad5']]);
  const inventory = identity({kind: 'qualification_subject_inventory', selectedRoots: subjectMaterial.map(m => m.ref),
    coverage: 'incomplete', members: subjectMaterial.map(m => ({...source(m), surfaceRoles: ['code'], classificationEvidenceRefs: []}))},
    'inventoryRef', 'inventoryDigest', 'qualification-inventory://abiogenesis/');
  const inventoryCoordinate = coord(inventory.inventoryRef, inventory.inventoryDigest);
  const claims = install.capabilityDefinitionGraph.rows.flatMap(row => {
    const publicContractRefs = install.publicContracts.filter(c => c.owningProduct === install.productId &&
      c.capabilityIdentities.includes(row.capabilityId)).map(c => c.contractId);
    return publicContractRefs.length === 0 ? [] : [{claimRef: 'claim://abiogenesis/t287/genuine-context-assessment-04/' + row.capabilityId,
      capabilityRef: row.capabilityId, publicContractRefs, evidenceRefs: [pathToFileURL(archivePath).href]}];
  });
  const tenant = identity({kind: 'tenant_conformance_manifest', schemaVersion, productId: install.productId,
    capabilityDefinitionGraph: coord(install.capabilityDefinitionGraph.graphId, install.capabilityDefinitionGraph.graphDigest),
    publicContractCatalog: coord(install.catalogId, install.catalogDigest), claims},
    'manifestRef', 'manifestDigest', 'tenant-conformance-manifest://abiogenesis/');
  const v = caller.native.verified;
  const basis = identity({kind: 'exact_candidate_qualification', projection: 'basis', schemaVersion,
    subjectKind: 'pre_rc_candidate', productId: install.productId, productVersion: install.packageVersion,
    sourceInventory: inventoryCoordinate, artifact: coord(v.artifactRef, v.artifactDigest),
    productManifest: coord('product-manifest://abiogenesis/' + install.manifestDigest.slice(7), install.manifestDigest),
    productContentDigest: install.productContentDigest,
    toolchain: coord('toolchain://abiogenesis/' + install.manifestDigest.slice(7), install.manifestDigest),
    installedProduct: coord(install.installId, hash(install)), workspaceBinding: caller.state.binding, prospectiveRelease: null,
    tenantManifest: coord(tenant.manifestRef, tenant.manifestDigest), coverageCatalog: coord(coverage.catalogRef, coverage.catalogDigest), lawBasis},
    'basisRef', 'basisDigest', 'qualification-basis://abiogenesis/');
  const subjectBasis = coord(basis.basisRef, basis.basisDigest);
  const records = [];
  const record = async path => material(pathToFileURL(path).href, path, await readFile(path));
  const originalRecords = await Promise.all(['activation.json', 'preimage.json', 'delta.patch', 'closure.json']
    .map(name => record(join(constructionRoot, name))));
  const currentRecords = await Promise.all(['activation.json', 'preimage.json', 'delta.patch', 'closure.json']
    .map(name => record(join(currentConstructionRoot, name))));
  assert.equal(originalRecords[2].byteCount, 2711);
  assert.equal(currentRecords[2].byteCount, 2102);
  const originalProofPreimage = await record(join(constructionRoot, 'preimages/qualification_proof.ts'));
  const originalQualifierPreimage = await record(join(constructionRoot, 'preimages/qualification.ts'));
  const currentQualifierPreimage = await record(join(currentConstructionRoot, 'preimages/qualification.ts'));
  assert.equal(currentQualifierPreimage.digest, 'sha256:8f92906d0fd7e2ecc36fbfbe0795bd582f561448d0ffd4a0bc4ab4bfecec099c');
  assert.equal(currentQualifierPreimage.byteCount, 63484);
  // Historical qualifier postimage body is this exact immutable physical preimage.
  // It is deliberately never published at the current qualifier's canonical URI.
  records.push(...originalRecords, originalProofPreimage, originalQualifierPreimage,
    ...currentRecords, currentQualifierPreimage, ...subjectMaterial);
  const contextPaths = [
    'build_tenants/abiogenesis/typescript/code/src/validator/qualification_contracts.ts',
    'build_tenants/abiogenesis/typescript/code/src/validator/qualification_resources.ts',
    'build_tenants/abiogenesis/typescript/code/src/validator/self_conformance.ts',
    'build_tenants/abiogenesis/typescript/code/src/validator/self_conformance_contracts.ts',
    'build_tenants/abiogenesis/typescript/code/src/shared/digests.ts',
    'build_tenants/abiogenesis/typescript/code/src/shared/immutable.ts',
    'build_tenants/abiogenesis/typescript/code/src/shared/canonical_json.ts',
    'build_tenants/abiogenesis/typescript/design/T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN.md',
    'build_tenants/abiogenesis/typescript/design/T287_F11_CARRIER_RESOURCE_DESIGN.md',
    'build_tenants/abiogenesis/typescript/design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md',
    '.ai-workspace/work/T287_REFERENCE_ATTRIBUTION_REPAIR_01/grant.md',
    '.ai-workspace/work/T287_CONTEXT_PROJECTION_REPAIR_01/grant.md',
    '.ai-workspace/work/T287_GENUINE_CONTEXT_ASSESSMENT_04/grant.md',
    '.ai-workspace/work/T287_CONTEXT_PROJECTION_REPAIR_01/focused.stdout',
    '.ai-workspace/work/T287_CONTEXT_PROJECTION_PACKAGE_02/packed.stdout',
    '.ai-workspace/evidence/T287_CONTEXT_PROJECTION_PACKAGE_02/acceptance.json',
    '.ai-workspace/work/T287_CONTEXT_CONSERVATION_02/flow-observation.json',
    '.ai-workspace/work/T287_CONTEXT_CONSERVATION_02/fresh/cold-read-observation.json',
    '.ai-workspace/evidence/T287_CONTEXT_CONSERVATION_02/acceptance.json'];
  const contextMaterial = await Promise.all(contextPaths.map(path => record(join(repo, path))));
  records.push(...contextMaterial);
  const makeChain = (selectedRecords, selectedMembers, preimages) => {
    const [activationRef, preimageRef, deltaRef, closureRef] = selectedRecords.map(m => m.ref);
    return {activationRef, preimageRef, deltaRef, closureRef, authorRef: actualAuthor, actorIdentityRef: actualAuthor,
      authorityRef: policy.authorityRef, scopeRefs: selectedMembers.map(m => m.ref), postimageMembers: selectedMembers.map(source),
      changes: selectedMembers.map((m, i) => ({memberRef: m.ref, patchPath: m.path,
        preimageMemberRef: preimages[i].ref, postimageMemberRef: m.ref})),
      attributionSources: selectedRecords.filter(m => [activationRef, closureRef].includes(m.ref)).map(m => ({sourceRef: m.ref,
        startByte: 0, endByte: m.byteCount, spanDigest: m.digest}))};
  };
  const chains = [makeChain(originalRecords, [subjectMaterial[0]], [originalProofPreimage]),
    makeChain(currentRecords, [subjectMaterial[1]], [currentQualifierPreimage])];
  assert.deepEqual(chains.flatMap(c => c.scopeRefs), subjectMaterial.map(m => m.ref));
  const provenance = {kind: 'external_construction', subjectInventory: inventoryCoordinate,
    recordSet: coordinate('records://abiogenesis/t287/genuine-context-assessment-04', records), records, chains,
    acknowledgmentSelectionRef: null};
  const inventoryMaterial = material(inventory.inventoryRef, inventory.inventoryRef, Buffer.from(product.canonicalJson(inventory)));
  const taskMaterial = [...roleSources.map(row => authorityMaterial.find(m => m.ref === row.ref)), inventoryMaterial, ...records];
  assert.equal(new Set(taskMaterial.map(m => m.ref)).size, taskMaterial.length);
  assert.equal(new Set(taskMaterial.map(m => m.path)).size, taskMaterial.length);
  const declarationProof = {kind: 'abg_historical_declaration_proof', schemaVersion,
    catalog: caller.state.catalog, catalogView: caller.state.catalogView};
  const declarationSelection = {catalogBasisDigest: caller.state.catalog.basisDigest,
    readinessBasisDigest: caller.state.catalog.readinessBasisDigest, viewDigest: caller.state.catalogView.viewDigest,
    proofDigest: hash(declarationProof)};
  const resourceProvenance = {...provenance, records: records.map(m => ({entryKind: 'material', entry: coord(m.ref, m.digest)}))};
  const provenanceDigest = hash(resourceProvenance), provenanceCoordinate = coord('qualification-provenance://abiogenesis/' + provenanceDigest.slice(7), provenanceDigest);
  const entries = [{entryKind: 'inventory', coordinate: inventoryCoordinate, value: inventory},
    {entryKind: 'law', coordinate: lawBasis, value: law},
    {entryKind: 'tenant_manifest', coordinate: coord(tenant.manifestRef, tenant.manifestDigest), value: tenant},
    {entryKind: 'coverage_catalog', coordinate: coord(coverage.catalogRef, coverage.catalogDigest), value: coverage},
    {entryKind: 'provenance', coordinate: provenanceCoordinate, value: resourceProvenance}];
  for (const m of [...authorityMaterial, inventoryMaterial, ...records])
    if (!entries.some(entry => entry.entryKind === 'material' && entry.coordinate.ref === m.ref))
      entries.push({entryKind: 'material', coordinate: coord(m.ref, m.digest), value: m});
  const manifest = identity({kind: 'qualification_resource_manifest', schemaVersion: '1', subjectBasis, lawBasis,
    catalog: catalogCoordinate, inventory: inventoryCoordinate, entries, declarationSelections: [declarationSelection]},
    'resourceRef', 'resourceDigest', 'qualification-resource://abiogenesis/');
  const resource = coord(manifest.resourceRef, manifest.resourceDigest);
  const selection = (entryKind, entry) => ({kind: 'qualification_resource_selection', schemaVersion: '1', resource, entryKind, entry});
  const role = {roleRef: 'qualification-role://abiogenesis/rule@5', authorityRef: policy.authorityRef, sourceBindings: roleSources,
    actorRef: policy.actorRefs[0], workerBindingRef: policy.workerBindingRef, rendererRef: policy.rendererRef,
    materializationPlanRef: policy.materializationPlanRef, independence: 'author_distinct'};
  const contextRef = 'context://abiogenesis/t287/genuine-context-assessment-04';
  const members = taskMaterial.map(m => ({memberRef: m.ref, path: m.path, digest: m.digest, byteCount: m.byteCount}));
  const criterion = {criterionRef: 'criterion://abiogenesis/t287/genuine-context-assessment-04/007A',
    ruleRef, surfaceRef: subjectMaterial[0].ref, evidenceRole: 'semantic_assessment'};
  const task = identity({kind: 'qualification_assessment_task', schemaVersion, representation: 'resource_refs_v1', resource,
    slotRef, taskOrdinal: 0, subjectBasis, lawBasis, catalog: catalogCoordinate, inventory: inventoryCoordinate, role,
    context: {contextRef, sourceLocator: 'material://abiogenesis/t287/genuine-context-assessment-04', inventoryDigest: hash(members), members},
    declarations: [declarationSelection], assetSurface: {kind: 'qualification_assessment', requiredContexts: [contextRef],
      standardsRefs: policy.authoritySourceRefs, outputContractRefs: [gtl.QUALIFICATION_IDS.assessmentRaw],
      constructorRef: 'constructor://abiogenesis/t287/genuine-context-assessment-04/supplied-instance', rendererRef: policy.rendererRef,
      proofObligationRefs: ['proof://abiogenesis/t287/genuine-context-assessment-04/007A-context-attribution-conservation'],
      authoritySlots: [{authorityKindRef: policy.authorityRef, disposition: 'normal', fallbackPreconditionRefs: []}]},
    material: taskMaterial.map(m => selection('material', coord(m.ref, m.digest))), subjectMembers: subjectMaterial.map(source),
    coverage: [criterion], provenance: selection('provenance', provenanceCoordinate),
    priorEvidenceRefs: contextMaterial.filter(m => m.path.endsWith('.json') || m.path.endsWith('.stdout')).map(m => m.ref),
    residuals: ['Inventory deliberately includes only the actual two repaired Source files; whole-candidate coverage and RC qualification are incomplete.',
      'Supporting Source, law, HOW, grant and historical bounded observations are supplied context, not additional assessed members or semantic acceptance.',
      'Both original Source construction activations/closures retain actual file-grant authority and historical scopes. Current04 grant assigns independent qualification of the selected proof-only and current qualifier-only chains; attribution warrant is an independent assessment obligation.']},
    'taskRef', 'taskDigest', 'qualification-task://abiogenesis/');
  const plan = identity({kind: 'qualification_assessment_plan', subjectBasis, lawBasis,
    slots: [{slotRef, task: coord(task.taskRef, task.taskDigest), taskOrdinal: 0, graphFunctionRef: gtl.QUALIFICATION_IDS.assessGraph,
      programLocusRef: 'node://abiogenesis/qualification/assess@5', role, coverage: [criterion]}],
    coverage: [criterion], sharedCoverage: 'disjoint', ownerAuthorityRef: policy.authorityRef, ownerActorRef: caller.actorRef},
    'planRef', 'planDigest', 'qualification-plan://abiogenesis/');
  const assessmentInput = {kind: 'qualification_assessment_input', schemaVersion, task, plan};
  const assertion = {kind: 'qualification_resource_assertion', schemaVersion: '1', manifests: [manifest], declarationProofs: []};
  const prepareAssertion = {...assertion, declarationProofs: [declarationProof]};
  await writeJson(join(root, 'qualification-resource.json'), assertion);
  await writeJson(join(root, 'declaration-proof.json'), declarationProof);
  await writeJson(join(root, 'assessment-input.json'), assessmentInput);
  await writeJson(join(root, 'material-selection.json'), {selectedRule, assessedMembers: subjectMaterial.map(source),
    contextOnlyMembers: taskMaterial.filter(m => !subjectMaterial.some(s => s.ref === m.ref)).map(source),
    actualConstructionSelections: chains, historicalOriginalScopeRefs: activation.scopeRefs, originalSourceGrant: activation.grant, currentSourceGrant: currentActivation.grant, currentQualificationGrant: pathToFileURL(join(repo, '.ai-workspace/work/T287_GENUINE_CONTEXT_ASSESSMENT_04/grant.md')).href,
    contextRecordsClassification: 'Exact supplied context bytes; historical records unchanged; no retrospective ABG author claim.',
    resource, declarationSelection, materialBodyBytes: taskMaterial.reduce((n, m) => n + m.byteCount, 0)});
  phase = 'canonical-m05-preparation';
  const prepStarted = performance.now();
  const resources = preparation.acquireQualificationResources(prepareAssertion);
  const prepared = preparation.prepareQualificationAssessment(assessmentInput, resources);
  const preparationMs = performance.now() - prepStarted;
  await writeJson(join(root, 'prepared-request.json'), prepared.request);
  const prepObservation = {status: 'prepared', preparationMs, promptBytes: Buffer.byteLength(prepared.request.prompt),
    requestBytes: Buffer.byteLength(JSON.stringify(prepared.request)), assessmentInputBytes: Buffer.byteLength(JSON.stringify(assessmentInput)),
    resourceAssertionBytes: Buffer.byteLength(JSON.stringify(assertion)), resourceManifestBytes: Buffer.byteLength(JSON.stringify(manifest)),
    declarationProofBytes: Buffer.byteLength(JSON.stringify(declarationProof)), materialBodyBytes: taskMaterial.reduce((n, m) => n + m.byteCount, 0),
    provenanceBodyBytes: Buffer.byteLength(JSON.stringify(prepared.view.task.provenance)), assessedMembers: subjectMaterial.map(source),
    task: coord(task.taskRef, task.taskDigest), plan: coord(plan.planRef, plan.planDigest), resource,
    requestDigest: hash(prepared.request), promptDigest: hash(prepared.request.prompt), providerCalls: 0,
    semanticContextSufficiency: 'not yet independently assessed', transportLane: prepared.request.transportLane, ...metrics()};
  await writeJson(join(root, 'preparation-observation.json'), prepObservation);
  console.log(JSON.stringify({phase, ...prepObservation}));
  assert(preparationMs < 120000, 'preparation exceeds120s');
  const selfBase = {kind: 'self_conformance_input', schemaVersion, representation: 'resource_refs_v1', resource, basis,
    law: selection('law', lawBasis), inventory: selection('inventory', inventoryCoordinate),
    tenantManifest: selection('tenant_manifest', coord(tenant.manifestRef, tenant.manifestDigest)),
    authorityMembers: authorityMaterial.map(m => selection('material', coord(m.ref, m.digest))), applications: [], evidenceCitations: [],
    qualification: {plan, sourceMembers: subjectMaterial.map(m => selection('material', coord(m.ref, m.digest))),
      coverageCatalog: selection('coverage_catalog', coord(coverage.catalogRef, coverage.catalogDigest))}};
  await writeJson(join(root, 'continuation-inputs.json'), {selfBase, basis, criterion, declarationSelection});
  return {assessmentInput, assertion, prepared, resources, selfBase, basis, criterion, declarationSelection,
    makeProof: (prefix, selections) => ({kind: 'qualification_proof_resource', schemaVersion, representation: 'resource_refs_v1', resource,
      prefix, declarations: [declarationSelection], selections, executionSelections: []})};
}

async function main() {
  phase = 'immutable-verification-and-current-boundary';
  const native = await nativeVerification(packageRoot, archivePath, archiveDigest);
  const selected = await readJson(join(originalRoot, 'read-selection.json'));
  const handoff = await readJson(historicalHandoff);
  assert.equal(hash(handoff.closeHandoff), handoff.handoffDigest);
  const log = await readFile(eventLogPath), physical = await stat(eventLogPath);
  assert.equal(log.length, 5302025); assert.equal(digest(log), 'sha256:7208244c234cedf06b5785a1faecec4606063b40e87cf58b883109057bd33666');
  assert.equal(physical.dev, 16777231); assert.equal(physical.ino, 465654884);
  await writeJson(join(root, 'entry-handoff.json'), handoff);
  const caller = createCaller({root, native, binding: selected.binding, closeHandoff: handoff.closeHandoff, eventLogPath});
  const install = await restore(caller);
  let packet;
  if (mode === 'prepare') {
    packet = await instances(caller, install);
    deadline();
    const after = await readFile(eventLogPath), afterPhysical = await stat(eventLogPath);
    assert(log.equals(after)); assert.equal(afterPhysical.dev, physical.dev); assert.equal(afterPhysical.ino, physical.ino);
    await writeJson(join(root, 'phase1-observation.json'), {status: 'prepared_frozen_input_pending_independent_review',
      inputDigest: hash(packet.assessmentInput), requestDigest: hash(packet.prepared.request),
      promptBytes: Buffer.byteLength(packet.prepared.request.prompt), currentPrefix: caller.state.closeHandoff.prefix,
      nativeCalls: 0, nativeDispatches: 0, cliInvocations: 0, realProviderCalls: 0, newEvents: 0,
      actualLogDevice: physical.dev, actualLogInode: physical.ino,
      semanticContextSufficiency: 'not yet independently assessed', phase2RequiresRootFollowup: true, ...metrics()});
    console.log(JSON.stringify({phase: 'phase1-complete-no-dispatch', ...metrics()}));
    return;
  }
  const assessmentInput = await readJson(join(frozenInputRoot, 'assessment-input.json'));
  const assertion = await readJson(join(frozenInputRoot, 'qualification-resource.json'));
  const declarationProof = await readJson(join(frozenInputRoot, 'declaration-proof.json'));
  const resources = preparation.acquireQualificationResources({...assertion, declarationProofs: [declarationProof]});
  const prepared = preparation.prepareQualificationAssessment(assessmentInput, resources);
  assert.deepEqual(prepared.request, await readJson(join(frozenInputRoot, 'prepared-request.json')));
  const continuation = await readJson(join(frozenInputRoot, 'continuation-inputs.json'));
  packet = {assessmentInput, assertion, prepared, resources, ...continuation,
    makeProof: (prefix, selections) => ({kind: 'qualification_proof_resource', schemaVersion, representation: 'resource_refs_v1', resource: assessmentInput.task.resource,
      prefix, declarations: [continuation.declarationSelection], selections, executionSelections: []})};
  deadline(); phase = 'native-assessment-preparation';
  const assessmentCall = await constructStart(caller, 'program://abiogenesis/qualification/assess@5',
    gtl.QUALIFICATION_IDS.assessGraph, packet.assessmentInput, packet.assertion);
  const assessmentOwner = await prepareNative(caller, assessmentCall);
  assert.equal(preparation.prepareQualificationAssessment(packet.assessmentInput, assessmentOwner.qualificationResources).request.prompt,
    packet.prepared.request.prompt, 'native owning request agrees with measured Public preparation');
  phase = 'native-independent-Claude-dispatch';
  await writeJson(join(root, 'dispatch-ready.json'), {status: 'ready', command: process.env.ABG_TS_CLAUDE_COMMAND,
    modelSelection: 'unchanged configured CLI model', providerRoute: 'native ActorProcess Claude OAuth firstParty',
    closedPromptProof: true, tools: '', inactivityMs: 120000, absoluteMs: 360000,
    inputDigest: hash(packet.assessmentInput), requestDigest: hash(packet.prepared.request), ...metrics()});
  console.log(JSON.stringify({phase, status: 'dispatching', promptBytes: Buffer.byteLength(packet.prepared.request.prompt), ...metrics()}));
  const assessed = await caller.invoke('assessment', assessmentCall), judgment = terminal(assessed, 'qualification_judgment');
  await writeJson(join(root, 'assessment-terminal.json'), judgment);
  await writeJson(join(root, 'actual-raw.json'), judgment.value.raw);
  assert(validator.isQualificationJudgment(judgment.value));
  assert.equal(judgment.value.source.cCallRef, judgment.producer.cCallRef);
  assert.equal(judgment.value.source.promptDigest, hash(packet.prepared.request.prompt));
  assert.equal(judgment.value.source.requestDigest, hash(packet.prepared.request));
  assert.equal(judgment.value.source.actorRef, policy.actorRefs[0]);
  assert.notEqual(judgment.value.source.actorRef, actualAuthor);
  const judgmentSelection = {kind: 'judgment_selection', selectionRef: 'selection://abiogenesis/t287/genuine-context-assessment-04',
    slotRef, task: coord(packet.assessmentInput.task.taskRef, packet.assessmentInput.task.taskDigest),
    programRef: judgment.producer.program.ref, invocationAdmissionRef: judgment.producer.invocationAdmissionRef, result: judgment.result};
  const proof = packet.makeProof(caller.state.closeHandoff.prefix, [judgmentSelection]);
  assert.deepEqual(abg.projectQualificationJudgment(proof, packet.assessmentInput.plan, judgmentSelection,
    assessmentOwner.qualificationResources), judgment.value);
  const authors = abg.projectQualificationConstructionAuthors(proof, packet.assessmentInput.plan, judgment.value,
    assessmentOwner.qualificationResources);
  await writeJson(join(root, 'assessment-authentication.json'), {status: 'authentic', result: judgment.result,
    valueDigest: judgment.valueDigest, producer: judgment.producer, source: judgment.value.source, constructionAuthors: authors,
    genuineNativeModelRoute: true, controlledTransport: false, ...metrics()});
  assert.deepEqual(authors, [actualAuthor], 'actual native construction attribution must be grounded without fabricated acknowledgment');
  const raw = judgment.value.raw, criterion = raw.criteria[0];
  assert.notEqual(criterion.disposition, 'indeterminate', 'genuine indeterminate: route retained, context sufficiency remains open');
  assert.notEqual(criterion.applicability, 'unknown', 'genuine applicability unresolved');
  assert(raw.attributions.every(a => a.disposition === 'established'), 'genuine attribution uncertainty');
  console.log(JSON.stringify({phase: 'genuine-J-authenticated', disposition: criterion.disposition,
    applicability: criterion.applicability, constructionAuthors: authors, result: judgment.result, ...metrics()}));
  deadline(); phase = 'native-F11-preparation';
  const selfInput = {...packet.selfBase, applications: [{ruleRef: criterion.ruleRef, surfaceRef: criterion.surfaceRef,
    applicability: criterion.applicability, premiseEvidenceRefs: criterion.sourceRefs, evaluationEvidenceRefs: [judgment.result.ref], rulingEvidenceRefs: []}],
    qualification: {...packet.selfBase.qualification, proof}};
  await writeJson(join(root, 'f11-input.json'), selfInput);
  const selfCall = await constructStart(caller, gtl.SELF_CONFORMANCE_IDS.programRef, gtl.SELF_CONFORMANCE_IDS.graphFunctionRef,
    selfInput, packet.assertion);
  await prepareNative(caller, selfCall);
  phase = 'native-F11-consumption';
  const evaluated = await caller.invoke('f11', selfCall), selfResult = terminal(evaluated, 'self_conformance_result');
  await writeJson(join(root, 'f11-terminal.json'), selfResult);
  assert(validator.isSelfConformanceResult(selfResult.value));
  const finding = selfResult.value.findings.find(f => f.diagnostic === 'semantic_assessment_required' &&
    f.provenance === 'J' && f.ruleRef === ruleRef && f.surfaceRefs.includes(packet.criterion.surfaceRef));
  assert(finding, 'native F11 must consume the actual bounded genuine assessment');
  const expectedDisposition = criterion.applicability === 'inapplicable' ? 'inapplicable_with_reason' :
    criterion.disposition === 'falsified' ? 'failed' : 'passed';
  assert.equal(finding.disposition, expectedDisposition);
  assert(finding.evidenceRefs.includes(judgment.result.ref), 'F11 keeps the original actual native Result citation');
  assert(selfResult.value.findings.some(f => f.disposition === 'blocked_incomplete' && f.provenance === 'J_required'),
    'unassessed whole-candidate obligations stay explicit');
  assert.notEqual(selfResult.value.disposition, 'passed', 'bounded pilot cannot establish whole qualification');
  const selections = [[assessed, judgment, 'assessment'], [evaluated, selfResult, 'f11']].map(([observation, result, label]) => ({label,
    run: observation.receipt.ownerOutput.value.run,
    slots: Object.fromEntries(['workspace_binding', 'product_set', 'dependency_lock'].map(key =>
      [key, observation.call.invocation.invocationAuthority.slots[key]])), terminalDigest: hash(result), result: result.result,
    producer: result.producer, ...(label === 'assessment' ? {source: result.value.source} : {})}));
  await writeJson(join(root, 'read-selection.json'), {binding: caller.state.binding, closeHandoff: caller.state.closeHandoff, selections});
  const newEvents = (await readFile(eventLogPath)).subarray(5302025).toString('utf8').trim().split('\n').map(JSON.parse);
  const closures = newEvents.filter(e => e.kind === 'run_closed');
  assert.equal(closures.length, 2);
  await writeJson(join(root, 'flow-observation.json'), {status: 'passed_bounded_genuine', criterion: packet.criterion,
    actualDisposition: criterion.disposition, actualApplicability: criterion.applicability, actualSource: judgment.value.source,
    judgmentResult: judgment.result, f11Result: selfResult.result, f11Finding: finding, f11Disposition: selfResult.value.disposition,
    findings: selfResult.value.findings.length, outstanding: selfResult.value.findings.filter(f => f.disposition === 'blocked_incomplete').length,
    closedRuns: closures.map(e => ({runRef: e.aggregateId, eventId: e.eventId})),
    actorTransportBindings: newEvents.filter(e => e.kind === 'actor_transport_binding_admitted').map(e => ({eventId: e.eventId,
      command: e.payload.command, actorRef: e.payload.actorRef, lane: e.payload.lane, cwd: e.payload.cwd,
      archiveRoot: e.payload.archiveRoot, paths: e.payload.paths, timeoutMs: e.payload.timeoutMs, absoluteTimeoutMs: e.payload.absoluteTimeoutMs})),
    currentPrefix: caller.state.closeHandoff.prefix, wholeCandidateQualification: false, controlledTransport: false, ...metrics()});
  console.log(JSON.stringify({phase: 'native-F11-conserved', disposition: finding.disposition, f11Disposition: selfResult.value.disposition,
    originalJudgment: judgment.result, f11Result: selfResult.result, closedRuns: closures.length, ...metrics()}));
}

async function cold() {
  phase = 'separate-fresh-Public-reads';
  const inputRoot = resolve(process.env.ABI5_GENUINE_INPUT_ROOT);
  const selected = await readJson(join(inputRoot, 'read-selection.json'));
  const native = await nativeVerification(packageRoot, archivePath, archiveDigest);
  const caller = createCaller({root, native, binding: selected.binding, closeHandoff: selected.closeHandoff, eventLogPath});
  const before = await readFile(eventLogPath), physical = await stat(eventLogPath), reads = [];
  for (const selection of selected.selections) {
    const original = (await readJson(join(inputRoot, selection.label + '-handoff.json'))).closeHandoff.prefix;
    const originalProjectionBasis = coord(original.eventLogRef, original.coordinateDigest);
    for (const memberKey of ['run_result', 'run_replay']) reads.push(await freshRead(caller, selection, memberKey, originalProjectionBasis));
  }
  const after = await readFile(eventLogPath), actual = await stat(eventLogPath);
  assert(before.equals(after)); assert.equal(actual.dev, physical.dev); assert.equal(actual.ino, physical.ino);
  await writeJson(join(root, 'cold-read-observation.json'), {status: 'passed', reads, prefix: caller.state.closeHandoff.prefix,
    processId: process.pid, newEvents: 0, extraActors: 0, providerCalls: 0, genuineSubjectInputsFrom: inputRoot,
    comparison: 'Full terminal canonical hash with ONLY projectionBasis normalized to actual original handoff; current read basis separately checked.',
    wholeCandidateQualification: false, ...metrics()});
}

try {
  if (mode === 'cold') await cold(); else await main();
} catch (error) {
  await writeJson(join(root, 'first-failure.json'), {status: 'stopped', phase, message: String(error), stack: error.stack,
    name: error.name, code: error.code ?? null, actual: typeof error.actual === 'object' ? hash(error.actual ?? null) : error.actual ?? null,
    expected: typeof error.expected === 'object' ? hash(error.expected ?? null) : error.expected ?? null,
    processId: process.pid, stoppedAt: new Date().toISOString(), controlledTransport: false, ...metrics()});
  console.error(JSON.stringify({status: 'stopped', phase, message: String(error), ...metrics()}));
  process.exitCode = 1;
}
