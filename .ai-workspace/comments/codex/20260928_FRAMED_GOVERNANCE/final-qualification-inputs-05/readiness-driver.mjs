import fs from 'node:fs/promises';
import {constants} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {assertPinnedNode, fileSha256, materializeCommandEnvironment,
  constructPreparedObservedTask, proposedRecipeForConstructedTask} from './command-environment.mjs';
import {assertPreparationCorrespondence} from './recipe-correspondence.mjs';

const report = dirname(fileURLToPath(import.meta.url));
const base = '/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE';
const q04 = join(base, 'final-qualification-inputs-04');
const c03 = join(base, 'final-candidate-construction-04');
const packageRoot = join(c03, 'final-install/node_modules/@abiogenesis/typescript-tenant');
const read = async path => JSON.parse(await fs.readFile(path, 'utf8'));
const write = async (name, value) => fs.writeFile(join(report, name), JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
const start = performance.now();
const callCounts = {};
const firstCalls = [];
let frontier = 'exact-input-preflight';
let copied = [];
let pinsBefore;
let nodePin;

async function pinFile(path) {
  const stat = await fs.lstat(path);
  if (!stat.isFile()) throw Error('regular pinned input required: ' + path);
  return {path, bytes: stat.size, sha256: await fileSha256(path), mode: stat.mode & 0o777};
}

async function assertCut(path, bytes, sha256, verifyRecords = false) {
  const pin = await pinFile(path);
  if (pin.bytes !== bytes || pin.sha256 !== sha256) throw Error('closed cut changed: ' + path);
  const value = await read(path);
  if (verifyRecords) {
    for (const row of value.records) {
      const actual = await pinFile(join(dirname(path), row.path));
      if (actual.bytes !== row.bytes || actual.sha256 !== row.sha256 || actual.mode !== row.mode) {
        throw Error('closed cut record changed: ' + row.path);
      }
    }
  }
  return {pin, recordCount: value.records.length, recordsVerified: verifyRecords, value};
}

function unitCoordinates(product, root, roots) {
  // Exact unit coordinates adapted from the existing t287-generic-job-worksite definition.
  // The opaque unit admission field satisfies serialized shape; no event exists or is asserted.
  const digest = label => product.sha256Canonical({label, scope: 'command-preparation-unit-only'});
  const id = (scheme, value) => `${scheme}://abiogenesis/${value.slice(7)}`;
  const manifest = {workspaceId: 'workspace://command-preparation/unit-only', canonicalRoot: root,
    authorityMode: 'trusted_developer', authorizedActorRef: 'actor://command-preparation/unit-only'};
  const workspaceAuthorityBasis = product.constructWorkspaceAuthorityBasis({...manifest,
    authorityManifestRef: 'unit-manifest://command-preparation/authority',
    authorityManifestDigest: product.sha256Canonical(manifest)});
  if (workspaceAuthorityBasis.kind !== 'workspace_authority_basis') throw Error('unit authority construction refused');
  const bindingBody = {workspaceId: manifest.workspaceId,
    authorityBasisId: workspaceAuthorityBasis.authorityBasisId,
    authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest,
    authorizedActorRef: manifest.authorizedActorRef,
    productSetId: 'unit-product-set://command-preparation', productSetDigest: digest('products'),
    lockId: 'unit-lock://command-preparation', lockDigest: digest('lock'), roots};
  const bindingDigest = product.sha256Canonical(bindingBody);
  const workspaceBinding = {kind: 'workspace_binding', schemaVersion: '5.0.0',
    bindingId: id('workspace-binding', bindingDigest), bindingDigest, ...bindingBody,
    admissionEventRef: 'unit-coordinate-only://command-preparation/no-admission-event'};
  const grantBody = {
    definitionKey: {operationId: 'abg.operation.run.invoke', memberKey: 'invoke'},
    definitionRef: 'unit-definition://command-preparation/invoke', definitionDigest: digest('definition'),
    capabilityDefinition: {graphId: 'unit-capability-graph://command-preparation', graphVersion: '5.0.0',
      graphDigest: digest('capability-graph'), capabilityId: 'capability://abiogenesis/run.invoke',
      capabilityDefinitionRef: 'unit-capability-definition://command-preparation',
      capabilityDefinitionDigest: digest('capability-definition')},
    operationContract: {
      contractCatalog: {productId: 'unit-product://command-preparation', productContentDigest: digest('product'),
        catalogId: 'unit-catalog://command-preparation', catalogVersion: '5.0.0', catalogDigest: digest('catalog')},
      flatRow: {contractId: 'unit-contract://command-preparation/request', contractVersion: '5.0.0', contractDigest: digest('contract')},
      nestedSelector: {selectorKind: 'flat_contract', definitionKey: null, slot: null, definitionRef: null}},
    operationId: 'abg.operation.run.invoke', capabilityRef: 'capability://abiogenesis/run.invoke',
    actorRef: manifest.authorizedActorRef, approvalRef: workspaceAuthorityBasis.authorityBasisId,
    approvalDigest: workspaceAuthorityBasis.authorityBasisDigest,
    policyRef: 'unit-policy://command-preparation', policyDigest: digest('policy'),
    scopeRef: workspaceBinding.bindingId, scopeDigest: bindingDigest,
    authorityBasisRef: workspaceAuthorityBasis.authorityBasisId,
    authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest};
  const grantDigest = product.sha256Canonical(grantBody);
  const capabilityGrant = {kind: 'capability_grant', schemaVersion: '5.0.0',
    grantRef: id('capability-grant', grantDigest), grantDigest, ...grantBody};
  if (!product.isCapabilityGrantValue(capabilityGrant)) throw Error('unit exact grant shape refused');
  return {workspaceAuthorityBasis, workspaceBinding, capabilityGrant};
}

async function refusing(label, operation) {
  try { await operation(); }
  catch (error) { return {label, outcome: 'refused', error: {name: error.name, message: error.message}}; }
  throw Error('required negative unexpectedly accepted: ' + label);
}

try {
  const q = await assertCut(join(q04, 'freeze.json'), 1212521,
    '2296636418d8851ed2ce61932fb9be64eccecc41e445e61c1052e10745cbad97', true);
  const c = await assertCut(join(c03, 'final-freeze.json'), 140595,
    '2e3d89145eb35f7280625175144cd79c34440a14b398a68b953b6fe1453a8df5');
  const modeMap = new Map(q.value.records.map(row => [resolve(q04, row.path), row.mode]));
  const packageMetadata = await read(join(packageRoot, 'package.json'));
  const publishedRoute = packageMetadata.exports?.['./product']?.import;
  if (publishedRoute !== './build/code/src/product/index.js') throw Error('published Product route changed');
  const ownerEntry = resolve(packageRoot, publishedRoute);
  const ownerInputNames = ['package.json', 'build/code/src/product/index.js',
    'build/code/src/product/worksite_command_execution.js', 'build/code/src/product/worksite_effect.js',
    'build/code/src/product/worksite_operations.js', 'build/code/src/product/environment.js',
    'build/code/src/product/invocation.js', 'build/code/src/shared/digests.js',
    'build/code/src/shared/canonical_json.js', 'build/code/src/validator/qualification.js'];
  const ownerPins = await Promise.all(ownerInputNames.map(name => pinFile(join(packageRoot, name))));
  const rawProduct = await import(pathToFileURL(ownerEntry).href);
  const validatorRoute=packageMetadata.exports?.['./validator']?.import;
  if(validatorRoute!=='./build/code/src/validator/index.js')throw Error('published validator route changed');
  const validator=await import(pathToFileURL(resolve(packageRoot,validatorRoute)).href);

  const expectedPublic = ['constructWorkspaceAuthorityBasis', 'constructWorksiteSubject', 'observeWorksiteSubject',
    'constructObservedWorksiteCommandExecutionTask', 'isObservedWorksiteCommandExecutionTask',
    'isCapabilityGrantValue', 'sha256Canonical', 'canonicalJson'];
  if (expectedPublic.some(name => typeof rawProduct[name] !== 'function')) throw Error('required published Product member absent');
  const product = {...rawProduct};
  for (const name of expectedPublic.filter(name => !['sha256Canonical', 'canonicalJson', 'isCapabilityGrantValue'].includes(name))) {
    product[name] = (...args) => {
      callCounts[name] = (callCounts[name] ?? 0) + 1;
      if (firstCalls.length < 12) firstCalls.push({ordinal: Object.values(callCounts).reduce((a, b) => a + b, 0), operation: name});
      return rawProduct[name](...args);
    };
  }
  const q04Caller = await import(pathToFileURL(join(report, 'recipe.mjs')).href);
  const protectedPopulation=await read(join(report,'protected-inputs.json'));
  const inventory=await read(join(report,'qualification-inventory.json'));
  const selected = await q04Caller.selectedFiles();
  if (selected.length !== protectedPopulation.total || new Set(selected.map(row=>row.target)).size !== protectedPopulation.total || selected.reduce((sum,row)=>sum+row.bytes,0)!==protectedPopulation.bytes)throw Error('complete current Q05 population changed');
  nodePin = selected.find(row => row.target === 'toolchain/bin/node');
  if (nodePin.origin !== join(base,'final-candidate-construction-03/source-freeze/toolchain/bin/node') || nodePin.bytes !== 86104016 ||
      nodePin.sha256 !== 'fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f' || nodePin.mode !== 0o555) {
    throw Error('exact grant Node provenance changed');
  }
  await assertPinnedNode(nodePin);
  pinsBefore = {q04: q.pin, c03: c.pin, owner: ownerPins, selectedInputs: selected.length,
    selectedBytes: selected.reduce((sum, row) => sum + row.bytes, 0), q04RecordsVerified: q.recordCount};
  await write('input-pins.json', {kind: 'mechanical_input_pins', ...pinsBefore,
    publishedProductRoute: publishedRoute, privateImports: 0, nodePin,
    sourceFixtureToolAuthorship: 'inherited exact Q04/C03; external caller algorithm by /root/q03_input_review'});
  await write('selected-inputs.json', selected);
  const root = join(report, 'mechanical-worksite');
  await fs.mkdir(root);
  const roots = Object.fromEntries(['toolchain', 'product', 'eventLog', 'runtimeState', 'projection', 'archive']
    .map(name => [`${name}Root`, join(report, 'unit-protected-roots', name)]));
  for (const path of Object.values(roots)) await fs.mkdir(path);
  const coordinates = unitCoordinates(product, root, roots);
  await write('unit-coordinates.json', {kind: 'mechanical_unit_coordinates', runtimeAdmission: false,
    claim: 'No ProductEnvironment owner or workspace.bind operation; no admission event exists. These unit values exercise only the published pure constructor and physical reads.', ...coordinates});
  frontier = 'external-environment-materialization';
  const sourceConfig = await read(join(report, 'raw-config.json'));
  const declaredConfiguration=await read(join(report,'config.json'));
  const preparation = await materializeCommandEnvironment({product, sourceConfig, pin: nodePin, ...coordinates});
  if(product.sha256Canonical(preparation.configuration)!==product.sha256Canonical(declaredConfiguration))throw Error('current adapted config body does not equal actual environment materialization');
  await write('materialized-config.json',preparation.configuration);
  await write('environment-binding.json', preparation.binding);
  frontier = 'exact-Q05-source-copy';
  const copyStart = performance.now();
  for (const row of selected) {
    const source = await pinFile(row.origin);
    const expectedSourceMode=row.classification==='declared_recipe'?protectedPopulation.members.find(r=>r.target===row.target).sourceMode:row.mode;
    if (source.bytes !== row.bytes || source.sha256 !== row.sha256 || source.mode !== expectedSourceMode) {
      throw Error('selected source changed before copy: ' + row.origin);
    }
    const destination = resolve(root, row.target);
    if (!destination.startsWith(root + '/') || resolve(root, row.target) !== join(root, row.target)) {
      throw Error('unsafe copy target');
    }
    await fs.mkdir(dirname(destination), {recursive: true});
    await fs.copyFile(row.origin, destination, constants.COPYFILE_EXCL);
    await fs.chmod(destination, row.mode);
    const target = await pinFile(destination);
    if (target.bytes !== row.bytes || target.sha256 !== row.sha256 || target.mode !== row.mode) throw Error('copied body correspondence failed');
    copied.push({target: row.target, origin: row.origin, bytes: row.bytes, sha256: row.sha256,
      sourceMode: source.mode, destinationMode: row.mode, exactBody: true});
  }
  const copyElapsedMs = performance.now() - copyStart;
  await write('copy-correspondence.json', {kind: 'exact_Q05_copy_correspondence', files: copied.length,
    bytes: copied.reduce((sum, row) => sum + row.bytes, 0), elapsedMs: copyElapsedMs, rows: copied});
  frontier = 'complete-published-observed-task-construction';
  const constructStart = performance.now();
  const constructed = await constructPreparedObservedTask({product, preparation, pin: nodePin,
    ...coordinates, selectedFiles: selected});
  const constructElapsedMs = performance.now() - constructStart;
  await write('complete-observed-task.json', constructed.task);
  await write('normalized-configuration.json', constructed.normalized);
  const sourceRecipe=await read(join(report,'verification-recipe.json'));
  const historicalRecipe=await read(join(q04,'verification-recipe.json'));
  const proposal=proposedRecipeForConstructedTask({product,sourceRecipe,constructed});
  if(product.sha256Canonical(proposal.recipe)!==product.sha256Canonical(sourceRecipe))throw Error('actual current recipe required rebinding after Task construction');
  const recipeBytes=await fs.readFile(join(root,'recipe/verification-recipe.json'));
  const correspondence=assertPreparationCorrespondence({product,task:constructed.task,selectedFiles:selected,inventory,protectedPopulation,recipeBytes});
  await write('current-recipe-correspondence.json',correspondence);
  frontier = 'required-nearest-negatives';
  const negatives = [];
  negatives.push(await refusing('original relative PATH through complete published owner', () =>
    product.constructObservedWorksiteCommandExecutionTask({...constructed.input, commands: sourceConfig.commands})));
  for (const [label, path] of [['original worksite absolute root exposure', join(root, 'toolchain/bin')],
      ['protected absolute root exposure', join(roots.toolchainRoot, 'bin')]]) {
    const commands = structuredClone(preparation.configuration.commands);
    commands[0].environment.find(row => row.name === 'PATH').value = path + ':/usr/bin:/bin:/usr/sbin:/sbin';
    negatives.push(await refusing(label + ' through complete published owner', () =>
      product.constructObservedWorksiteCommandExecutionTask({...constructed.input, commands})));
  }
  const changedPreparation = structuredClone(preparation);
  changedPreparation.configuration.commands[0].environment.find(row => row.name === 'LANG').value = 'changed-declared-locale';
  negatives.push(await refusing('changed environment against exact external binding', () =>
    constructPreparedObservedTask({product, preparation: changedPreparation, pin: nodePin,
      ...coordinates, selectedFiles: selected})));
  const changedTask = structuredClone(constructed.task);
  changedTask.commands[0].environment.find(row => row.name === 'LANG').value = 'changed-declared-locale';
  const changedTaskAccepted = product.isObservedWorksiteCommandExecutionTask(changedTask);
  if (changedTaskAccepted) throw Error('changed task environment passed published guard with stale task identity');
  negatives.push({label: 'changed serialized task environment with stale identity', outcome: 'refused',
    owner: './product.isObservedWorksiteCommandExecutionTask', returned: changedTaskAccepted, error: null});
  const changedCommands = structuredClone(preparation.configuration.commands);
  changedCommands[0].environment.find(row => row.name === 'LANG').value = 'changed-declared-locale';
  const changedConstructedTask = product.constructObservedWorksiteCommandExecutionTask({...constructed.input, commands: changedCommands});
  const changedRecipeMatches = product.sha256Canonical(changedConstructedTask.commands) === proposal.recipe.commandConfigurationDigest;
  if (changedRecipeMatches) throw Error('changed owner-normalized environment matched prepared recipe');
  negatives.push({label: 'changed valid declared environment against exact proposed recipe', outcome: 'refused',
    owner: 'validator/qualification.ts:134-141 producer-defined canonical digest relation',
    changedTaskDigest: changedConstructedTask.taskDigest,
    changedCommandDigest: product.sha256Canonical(changedConstructedTask.commands), returned: changedRecipeMatches, error: null});
  const changedRecipe={...proposal.recipe,commandConfigurationDigest:historicalRecipe.commandConfigurationDigest};
  const changedConfigMatches = changedRecipe.commandConfigurationDigest === constructed.digests.commandConfigurationDigest;
  if (changedConfigMatches) throw Error('stale Q04 command digest matched repaired task');
  negatives.push({label: 'stale Q04 recipe configuration against complete repaired task', outcome: 'refused',
    owner: 'validator/qualification.ts:134-141 producer-defined canonical digest relation', returned: changedConfigMatches, error: null});
  negatives.push(await refusing('stale Q04 recipe body against actual current selected recipe and inventory',()=>
    assertPreparationCorrespondence({product,task:constructed.task,selectedFiles:selected,inventory,protectedPopulation,recipeBytes:Buffer.from(JSON.stringify(historicalRecipe))})));
  const crossedInventory=structuredClone(inventory);crossedInventory.members[0].digest=product.sha256Canonical('crossed-current-member-body');
  negatives.push(await refusing('changed inventory body with stale identity',()=>
    assertPreparationCorrespondence({product,task:constructed.task,selectedFiles:selected,inventory:crossedInventory,protectedPopulation,recipeBytes})));
  const changedSelected=structuredClone(selected),changedConfigRow=changedSelected.find(row=>row.target==='recipe/config.json');
  changedConfigRow.sha256=product.sha256Canonical('changed-current-config-body').slice(7);
  negatives.push(await refusing('changed current configuration body versus complete actual task observation',()=>
    assertPreparationCorrespondence({product,task:constructed.task,selectedFiles:changedSelected,inventory,protectedPopulation,recipeBytes})));
  const negativeDirectory = join(report, 'negative-inputs');
  await fs.mkdir(negativeDirectory);
  await assertPinnedNode(nodePin);
  const changedNode = join(negativeDirectory, 'changed-node-body');
  await fs.copyFile(nodePin.origin, changedNode, constants.COPYFILE_EXCL);
  await fs.chmod(changedNode, 0o755);
  const handle = await fs.open(changedNode, 'r+');
  try {
    const byte = Buffer.alloc(1);
    await handle.read(byte, 0, 1, 0); byte[0] ^= 1;
    await handle.write(byte, 0, 1, 0);
  } finally { await handle.close(); }
  await fs.chmod(changedNode, nodePin.mode);
  negatives.push(await refusing('changed Node body with same length/mode and pinned digest', () =>
    materializeCommandEnvironment({product, sourceConfig, pin: {...nodePin, origin: changedNode}, ...coordinates})));
  await write('negative-results.json', {kind: 'mechanical_nearest_negatives', count: negatives.length,
    allRefused: negatives.every(row => row.outcome === 'refused'), rows: negatives,
    changedNode: await pinFile(changedNode), qualificationExecuted: false});
  frontier='external-HOW-scope-authoring';
  const {normalizeQualificationScopeAssertion}=await import(pathToFileURL(join(report,'f11/scope-authoring.mjs')).href);
  const historicalFixture=await read(join(root,'fixture-inputs/carrier/assessment-input.json'));
  const historicalScope=historicalFixture.task.scope;
  const normalizedScope=normalizeQualificationScopeAssertion(historicalScope,validator);
  if(!validator.qualificationIdentity(normalizedScope,'scopeRef','scopeDigest','qualification-scope://abiogenesis/'))throw Error('external scope identity mismatch');
  const referenceSets=new Map(normalizedScope.referenceSets.map(set=>[set.setRef,set]));
  const decode=(coordinate,kind)=>{const value=referenceSets.get(coordinate.ref);if(!value||value.setDigest!==coordinate.digest||value.elementKind!==kind)throw Error('authoring lost reference set relation');return kind==='memberRefs'?value.values.map(n=>historicalScope.inventory.members[n].ref):value.values;};
  const expand=groups=>groups.map(group=>({groupRef:group.groupRef,memberRefs:decode(group.memberSet,'memberRefs'),rootRefs:decode(group.rootSet,'rootRefs'),surfaceRoles:decode(group.roleSet,'surfaceRoles'),ownerRefs:decode(group.ownerSet,'ownerRefs'),sourceRefs:decode(group.sourceSet,'sourceRefs')}));
  const same=(a,b)=>{if(product.sha256Canonical(a)!==product.sha256Canonical(b))throw Error('external authoring changed entire ordered relation');};
  same(expand(normalizedScope.surfaceGroups),historicalScope.surfaceGroups);same(normalizedScope.ruleGroups,historicalScope.ruleGroups);
  if(historicalScope.applicationDomains!==undefined)same(normalizedScope.applicationDomains.map(d=>({ruleGroupRef:d.ruleGroupRef,surfaceGroups:expand(d.surfaceGroups)})),historicalScope.applicationDomains);
  for(const set of referenceSets.values())if(!validator.qualificationIdentity(set,'setRef','setDigest','qualification-set://abiogenesis/'))throw Error('external set identity mismatch');
  const droppedDomain=structuredClone(historicalScope);droppedDomain.applicationDomains=(droppedDomain.applicationDomains??droppedDomain.ruleGroups.map(g=>({ruleGroupRef:g.groupRef,surfaceGroups:droppedDomain.surfaceGroups}))).slice(1);
  const missingMember=structuredClone(historicalScope);missingMember.surfaceGroups[0].memberRefs[0]='missing-member://authoring/negative';
  const authoringNegatives=[await refusing('external HOW authorer missing complete per-rule domain',()=>normalizeQualificationScopeAssertion(droppedDomain,validator)),await refusing('external HOW authorer unbound member ordinal',()=>normalizeQualificationScopeAssertion(missingMember,validator))];
  await write('scope-authoring-readiness.json',{kind:'external_HOW_authorer_mechanical_readiness',subject:'exact historical1950-member fixture only; no current scope/J/material fabricated',currentSource:'f11/scope-authoring.mjs',ruleGroups:historicalScope.ruleGroups.length,globalGroups:historicalScope.surfaceGroups.length,domains:historicalScope.applicationDomains?.length??0,referenceSets:referenceSets.size,allOriginalOrderedRelationsConserved:true,identitiesValid:true,negatives:authoringNegatives,currentC04ApplicabilityUnknown:true,actualOwnerCorrespondencePending:true});
  frontier = 'original-input-conservation';
  for (const row of copied) {
    const actual = await pinFile(row.origin);
    if (actual.bytes !== row.bytes || actual.sha256 !== row.sha256 || actual.mode !== row.sourceMode) throw Error('original input changed after readiness');
  }
  const qAfter = await assertCut(join(q04, 'freeze.json'), q.pin.bytes, q.pin.sha256, true);
  const cAfter = await assertCut(join(c03, 'final-freeze.json'), c.pin.bytes, c.pin.sha256);
  const ownerAfter = await Promise.all(ownerInputNames.map(name => pinFile(join(packageRoot, name))));
  if (product.sha256Canonical(ownerPins) !== product.sha256Canonical(ownerAfter)) throw Error('installed owner input changed');
  await assertPinnedNode(nodePin);
  await write('conservation-result.json', {kind: 'original_cut_conservation', q04Before: q.pin,
    q04After: qAfter.pin, q04AllRecordsBeforeAfter: q.recordCount,
    c03Before: c.pin, c03After: cAfter.pin, ownerInputsUnchanged: ownerPins.length,
    allSelectedOriginalBodiesModesUnchanged: copied.length, immutableNodeUnchanged: true, productMutation: false});
  const effects = {qualificationCommandsExecuted: 0, historicalTestsExecuted: 0, nativeProviderCalls: 0,
    ProductEnvironmentOwnerCalls: 0, resolverInstallBindCatalogRunJAF22Calls: 0,
    ABGAdmissionCalls: 0, newlyAdmittedEvents: 0, networkCalls: 0, privateImports: 0,
    filesystemWrites: 'new report territory only', actualFileObservations: selected.length};
  const result = {kind: 'qualification_command_preparation_readiness', status: 'CLOSED', workResult: 'GO_MECHANICAL_ONLY',
    activation: 'T287_FINAL_QUALIFICATION_INPUTS_05', frontier, completeTaskConstructed: true,
    taskRef: constructed.task.taskRef, taskDigest: constructed.task.taskDigest,
    publishedTaskGuard: true, sourceSetRef: constructed.task.sourceObservedInput.sourceSetRef,
    sourceSetDigest: constructed.task.sourceObservedInput.sourceSetDigest,
    protectedInputs: selected.length, protectedBytes: pinsBefore.selectedBytes,
    commands: constructed.task.commands.length, predicates: constructed.task.outcomePredicates.length,
    territories: constructed.task.allowedWriteTerritories.length, actualTaskDigests: constructed.digests,
    currentRecipeDigestsMatch:true,currentRecipeBodyInventoryCorrespondence:correspondence,staleQ04RecipeMatches:false,
    negatives: negatives.length, allNearestNegativesRefused: true,
    earliestOwnerCall: firstCalls[0], firstCalls, observedPublicCallCounts: callCounts, effects,
    cost: {copyElapsedMs, completeConstructionElapsedMs: constructElapsedMs,
      totalElapsedMs: performance.now() - start, processResourceUsage: process.resourceUsage(),
      heap: 'default; no NODE_OPTIONS or max-old-space-size override',
      qualificationRecipe: 'eighteen declared commands unexecuted; Q04 earlier six-case readiness passed and is not repeated'},
    currentRuntimeBindings:null,successorC04Binding:{freeze:c.pin,inventory:correspondence.inventory},actualSnapshot:null,
    observedQUAL056: null, wholeF11: null, independentJ: null, soleAF22: null, releaseAcceptance: null,
    limit: 'Exact C04/Q05 caller constructability only. Mechanical unit A/W/grant and actual copied Q05 file observations are not ABG-admitted Runtime coordinates or qualification material. C05 is not bound or claimed.'};
  await write('readiness-result.json',result);
  process.stdout.write(JSON.stringify({status: result.status, workResult: result.workResult,
    protectedInputs: selected.length, commands: result.commands, negatives: result.negatives,
    taskDigest: result.taskDigest, elapsedMs: result.cost.totalElapsedMs}) + '\n');
} catch (error) {
  await write('readiness-result.json', {kind: 'qualification_command_preparation_readiness', status: 'CLOSED',
    workResult: 'NO_GO', frontier, error: {name: error.name, message: error.message, stack: error.stack},
    originalCuts: pinsBefore ?? null, copiedInputs: copied.length, observedPublicCallCounts: callCounts,
    noAutonomousRepair: true, qualificationCommandsExecuted: 0, RuntimeAdmission: false,
    elapsedMs: performance.now() - start, processResourceUsage: process.resourceUsage()});
  process.stderr.write(error.stack + '\n');
  process.exitCode = 2;
}
