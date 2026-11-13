// Pure owner configuration on genuine current runtime003 facts; no Public/Runtime admission.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {runtimeEnvironment,selectProcessEnvironment} from './setup-state.mjs';
import {workerEnvironment} from '../../rc3-dogfood-01/operator-client/runner.mjs';
const dir=fileURLToPath(new URL('.',import.meta.url)),json=async p=>JSON.parse(await readFile(p,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(join(dir,'../runtime-003/operator-resume-material.json'));assert.equal(sha(raw),'12b1d20c1375b7160e5192a5b7765b8c1a6822c746adfc039de968b389b1d565');const retained=JSON.parse(raw),w=await json(join(dir,'workload.json')),profile=await json(join(dir,'PROVIDER_PROFILE.json'));
selectProcessEnvironment(runtimeEnvironment(profile,workerEnvironment,retained).environment);
const load=p=>import(pathToFileURL(join(retained.installedRoot,'build/code/src',p+'.js')));
const product=await load('product/index'),abg=await load('abg/index'),c2=await load('product/worksite_command_execution'),actor=await load('abg/actor_process');
const prefix=retained.state.closeHandoff.prefix,logPath=fileURLToPath(prefix.eventLogRef),before=sha(await readFile(logPath));assert.equal('sha256:'+before,prefix.prefixDigest);
const truth=abg.projectOwnedPrefixArtifactTruth(prefix);assert.equal(truth.kind,'exact_prefix_artifact_truth_projection');assert(abg.validateExactPrefixArtifactTruthProjection(truth,{requireCurrent:true}));
const env=abg.projectWorkspaceEnvironmentFromArtifactTruth(truth,retained.state.binding);assert.equal(env.kind,'exact_prefix_workspace_environment');const authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
const ambient=actor.selectedWorksiteCommandAmbientEnvironment();assert.equal(ambient.find(r=>r.name==='TMPDIR')?.value,profile.runtimeEnvironment.TMPDIR);assert.equal(process.env.NPM_CONFIG_CACHE,undefined);
const subjects=w.testing.selectedPaths.map(relativePath=>product.constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(retained.workspaceAuthority.canonicalRoot,relativePath)).href}));
try{
 const configuration=c2.constructWorksiteCommandConfiguration({...authority,protectedSubjects:subjects,commands:w.testing.commands,outcomePredicates:w.testing.outcomePredicates,allowedWriteTerritories:w.testing.allowedWriteTerritories},ambient),budget=c2.projectWorksiteCommandExecutionBudget(w.testing),limits=actor.selectedWorksiteCommandExecutionLimits();
 assert(c2.worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,limits));assert.equal(configuration.commands.length,11);assert.equal(w.testing.commands[5].environment.ABI5_HC1_BASELINE_PACKAGE_PATH,'/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc4-hc1-baseline-014/b775014c1ef3c2e6f0f027236c3555702b159b673b4baf764b8bfd93f51af1db.tgz');
 assert.equal(sha(await readFile(logPath)),before);
 console.log(JSON.stringify({status:'PURE_WHOLE_CONFIGURATION_READY',sourceCommit:'3c3c6e803b02bc7078f7ff115b0dc37a04ea8a6f',authorityDigest:product.sha256Canonical(authority),prefix,ambient,configurationKind:configuration.kind,commandCount:configuration.commands.length,budget,limits,prefixUnchanged:true,providerCalls:0,RunAdmissions:0,meaning:'Pure existing constructors on genuine setup facts; no current context observation, Public call or admission.'},null,2));
}catch(error){console.log(JSON.stringify({status:'PURE_WHOLE_CONFIGURATION_REFUSED',name:error.name,message:error.message,observation:error.observation??null,providerCalls:0,RunAdmissions:0},null,2));throw error;}
