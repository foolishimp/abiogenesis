import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';

const root = dirname(fileURLToPath(import.meta.url));
const repo = '/Users/jim/src/apps/abiogenesis';
const tenant = join(repo, 'build_tenants/abiogenesis/typescript');
const stage = join(repo, '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/lifetime-stream-repair-01/stage/build_tenants/abiogenesis/typescript');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const write = (name, value) => writeFile(join(root, 'preflight-02', name), `${JSON.stringify(value, null, 2)}\n`, {flag:'wx'});
const load = path => import(pathToFileURL(join(stage, 'build/code/src', path)).href);
try {
  const product = await load('product/index.js');
  const commandProduct = await load('product/worksite_command_execution.js');
  const testPath = join(tenant, 'test_env/tests/t287-worksite-command-execution.test.mjs');
  const text = await readFile(testPath,'utf8');
  const constants = text.slice(text.indexOf('const SOURCE_RELATIVE_PATH'), text.indexOf('const proofJson'));
  const configurationFunction = text.slice(text.indexOf('function installedCommandConfiguration('), text.indexOf('test("C2 explicit zero write territory'));
  const context = vm.createContext({Buffer, process:{execPath:process.execPath}});
  const exposed = vm.runInContext(`${constants}\n${configurationFunction}\n({SOURCE_BYTES, SOURCE_RELATIVE_PATH, installedCommandConfiguration})`, context);
  const inputConfiguration = JSON.parse(JSON.stringify(exposed.installedCommandConfiguration(commandProduct.WORKSITE_COMMAND_EXECUTION_IDS)));
  const canonicalRoot = join(root,'preflight','prospective-workspace');
  const manifest = { workspaceId:'workspace://t287/p5/constructor-only', canonicalRoot, authorityMode:'trusted_developer', authorizedActorRef:'actor://t287/p5/constructor-only' };
  const workspaceAuthorityBasis = product.constructWorkspaceAuthorityBasis({...manifest, authorityManifestRef:'manifest://t287/p5/constructor-only', authorityManifestDigest:product.sha256Canonical(manifest)});
  const digest = label => product.sha256Canonical({label});
  const bindingBody = { workspaceId:manifest.workspaceId, authorityBasisId:workspaceAuthorityBasis.authorityBasisId,
    authorityBasisDigest:workspaceAuthorityBasis.authorityBasisDigest, authorizedActorRef:manifest.authorizedActorRef,
    productSetId:'product-set://t287/p5/cold',productSetDigest:digest('products'),lockId:'lock://t287/p5/cold',lockDigest:digest('lock'),
    roots:Object.fromEntries(['toolchain','product','eventLog','runtimeState','projection','archive'].map(name=>[`${name}Root`,join(root,'preflight',name)])) };
  const bindingDigest = product.sha256Canonical(bindingBody);
  const workspaceBinding = {kind:'workspace_binding',schemaVersion:'5.0.0',bindingId:`workspace-binding://abiogenesis/${bindingDigest.slice(7)}`,bindingDigest,...bindingBody,admissionEventRef:'event://t287/p5/cold-premise-not-admitted'};
  const subject = product.constructWorksiteSubject({workspaceAuthorityBasis,workspaceBinding,relativePath:exposed.SOURCE_RELATIVE_PATH,subjectUri:pathToFileURL(join(canonicalRoot,exposed.SOURCE_RELATIVE_PATH)).href});
  const input = {workspaceAuthorityBasis,workspaceBinding,protectedSubjects:[subject],...inputConfiguration};
  const normalized = commandProduct.constructWorksiteCommandConfiguration(input);
  assert.equal(commandProduct.worksiteCommandConfigurationMatches(input,JSON.parse(JSON.stringify(normalized))),true);
  assert.deepEqual(normalized.commands.map(x=>x.commandId), ['command://c2-ack/large-nonzero','command://c2-ack/small-success']);
  assert.deepEqual(normalized.predicates.map(x=>x.predicateId), ['predicate://c2-ack/nonzero','predicate://c2-ack/stdout','predicate://c2-ack/http']);
  const http = normalized.predicates[2].declaration;
  assert.equal(http.status,201); assert.equal(http.body,'abi-ok');
  assert.equal(http.launch.portFile.relativePath,'c2-source/evidence-http-port.txt');
  assert.equal(dirname(http.launch.portFile.relativePath),dirname(exposed.SOURCE_RELATIVE_PATH));
  assert.notEqual(http.launch.portFile.relativePath,exposed.SOURCE_RELATIVE_PATH);
  assert.deepEqual(normalized.allowedWriteTerritories.map(({pathKind,relativePath})=>({pathKind,relativePath})),[{pathKind:'subtree',relativePath:'evidence'},{pathKind:'file',relativePath:'c2-source/evidence-http-port.txt'}]);
  assert.equal(http.launch.args[0],exposed.SOURCE_RELATIVE_PATH);
  assert.equal(http.launch.args[1],commandProduct.WORKSITE_COMMAND_EXECUTION_IDS.httpPortFileArgumentPlaceholder);
  assert.equal(http.launch.environment.filter(x=>x.name==='PATH').length,1);
  const budget = commandProduct.projectWorksiteCommandExecutionBudget({commands:normalized.commands,outcomePredicates:normalized.predicates});
  assert.equal(budget.commandBudgetMs,14_500); assert.equal(budget.httpProbeBudgetMs,8_250);
  assert.equal(budget.requiredExecutionBudgetMs,27_750);
  assert.equal(commandProduct.worksiteCommandExecutionBudgetFits(27_750,{inactivityTimeoutMs:60_000,absoluteTimeoutMs:90_000}),true);
  assert.throws(()=>commandProduct.constructWorksiteCommandConfiguration({...input,allowedWriteTerritories:[]}),TypeError);
  const badPlaceholder = structuredClone(input);
  badPlaceholder.outcomePredicates[2].declaration.launch.args=['c2-source/service.mjs'];
  assert.throws(()=>commandProduct.constructWorksiteCommandConfiguration(badPlaceholder),TypeError);
  await write('constructor.json',{scope:'pure configuration only; cold A/W premises are not actual ABG admission and no source result is fabricated',input,normalized,budget,literalOracle:{commandBudgetMs:14500,httpProbeBudgetMs:8250,requiredExecutionBudgetMs:27750,status:201,body:'abi-ok',portFile:'c2-source/evidence-http-port.txt'},negativeOracles:['no allowed port write territory','missing exact placeholder']});
  await write('result.json',{disposition:'passed',testSha256:hash(Buffer.from(text)),pureConstructorOnly:true,fixtureProcessesLaunched:0,installedOrPublicCalls:0,physicalParentRelation:'exact port parent equals sole protected source parent materialized by helper; no actual materialization run'});
  process.stdout.write('affected pure constructor and declared snapshot-parent relation passed; no execution\n');
} catch(error) {
  await write('failure.json',{name:error.name,message:error.message,stack:error.stack,fixtureProcessesLaunched:0,installedOrPublicCalls:0});
  throw error;
}
