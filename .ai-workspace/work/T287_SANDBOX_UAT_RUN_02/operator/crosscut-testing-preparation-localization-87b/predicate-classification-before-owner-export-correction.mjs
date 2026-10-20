import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const phase=dirname(fileURLToPath(import.meta.url));
const old=join(dirname(phase),'crosscut-installed-source-context-proof-82');
const setup=JSON.parse(await readFile(join(old,'execution-authority-root/setup.json'),'utf8'));
const measurement=JSON.parse(await readFile(join(phase,'measurement-final.json'),'utf8'));
const load=name=>import(pathToFileURL(join(setup.installedRoot,'build/code/src',name+'.js')));
const [product,abg]=await Promise.all(['product/index','abg/index'].map(load));
const events=abg.readRuntimeEventsAtDurablePrefix(measurement.authenticated.originalFinalPrefix,{requireCurrent:true});
const input=events.find(e=>e.admissionOrdinal===103).payload.rawInputValue;
assert.equal(product.isGovernanceWorkState(input),true);
assert.equal(product.sha256Canonical(input),measurement.authenticated.nativeInputDigest);
const truth=abg.projectOwnedPrefixArtifactTruth(measurement.authenticated.historical);
const env=abg.projectWorkspaceEnvironmentFromArtifactTruth(truth,{ref:setup.workspaceBinding.bindingId,digest:setup.workspaceBinding.bindingDigest});
assert.equal(env.kind,'exact_prefix_workspace_environment');
assert.deepEqual(env.workspaceAuthorityBasis,setup.workspaceAuthority);
assert.deepEqual(env.workspaceBinding,setup.workspaceBinding);
const protectedSubjects=input.original.testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({
  workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
  relativePath,subjectUri:pathToFileURL(resolve(env.workspaceAuthorityBasis.canonicalRoot,relativePath)).href}));
assert.ok(protectedSubjects.every(product.isWorksiteSubject));
const original={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding,
  protectedSubjects,...product.governanceTestingConfiguration(input)};
let originalError;
try{product.constructWorksiteCommandConfiguration(original);}catch(e){originalError={name:e.name,message:e.message};}
assert.deepEqual(originalError,{name:'TypeError',message:'worksite command configuration requires exact A/W, subjects and explicit arrays'});
assert.deepEqual(original.allowedWriteTerritories,[]);
// Pure configuration witness only; the separately selected successor must perform a real evidence-file effect.
const next=product.constructWorksiteCommandConfiguration({...original,allowedWriteTerritories:[{pathKind:'subtree',relativePath:'evidence'}]});
assert.equal(next.commands.length,original.commands.length);
assert.equal(next.predicates.length,original.outcomePredicates.length);
const result={status:'sole-configuration-precondition-localized',inputDigest:measurement.authenticated.nativeInputDigest,
  originalError,commandsArray:true,commandCount:original.commands.length,outcomePredicatesArray:true,predicateCount:original.outcomePredicates.length,
  allFourSubjectsCanonical:protectedSubjects.length===4&&protectedSubjects.every(product.isWorksiteSubject),
  exactAuthorityBindingJoin:'canonical configuration owner accepted unchanged A/W with only one declared evidence territory',
  allowedWriteTerritories:original.allowedWriteTerritories,soleRejectedInitialPredicate:'allowedWriteTerritories.length === 0',
  unchangedConfigurationOtherwiseConstructible:true,newPureTerritory:next.allowedWriteTerritories[0],
  genericStateDomain:'original testing arrays are accepted generically; delegated C2 retains its stricter command/evidence declaration precondition',
  owningHow:'T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md observed-source arm preserves unchanged command/predicate/write-territory declarations',
  disposition:'fixture omitted C2 precondition; no source repair inferred',
  nextSelectedFixture:'declare evidence subtree and have the original literal command actually write evidence/literal.txt, preserving stdout and exit7',
  limits:'No second port.invoke, actor, event admission, assessment, or file effect. Positive pure configuration is not execution credit.'};
await writeFile(join(phase,'predicate-classification.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:result.status,soleRejectedInitialPredicate:result.soleRejectedInitialPredicate,allFourSubjectsCanonical:result.allFourSubjectsCanonical}));
