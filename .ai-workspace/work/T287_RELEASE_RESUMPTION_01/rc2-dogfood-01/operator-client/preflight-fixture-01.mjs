import {readFile,writeFile,stat} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc2-dogfood-01';
const installed='/Users/jim/Library/Application Support/ABIogenesis/installs/5.0.0-rc.1/node_modules/@abiogenesis/typescript-tenant/build/code/src/product';
const {constructWorksiteCommandConfiguration,projectWorksiteCommandExecutionBudget,worksiteCommandExecutionBudgetFits}=await import(pathToFileURL(join(installed,'worksite_command_execution.js')).href);
const {constructWorksiteSubject}=await import(pathToFileURL(join(installed,'worksite_effect.js')).href);
const after=JSON.parse(await readFile(join(base,'attempt-004/diagnostic-02-after-run-resume.json'),'utf8'));
const env=after.state.environment,raw=await readFile(join(base,'workload-fixture-repair-01.json'));
const original=JSON.parse(raw),root=env.workspaceAuthorityBasis.canonicalRoot;
const authority={workspaceAuthorityBasis:env.workspaceAuthorityBasis,workspaceBinding:env.workspaceBinding};
const protectedSubjects=original.testing.selectedPaths.map(relativePath=>constructWorksiteSubject({...authority,relativePath,subjectUri:pathToFileURL(join(root,relativePath)).href}));
const config=constructWorksiteCommandConfiguration({...authority,protectedSubjects,commands:original.testing.commands,outcomePredicates:original.testing.outcomePredicates,allowedWriteTerritories:original.testing.allowedWriteTerritories},null);
const budget=projectWorksiteCommandExecutionBudget(original.testing);
const provider=JSON.parse(await readFile(join(base,'budget-004.json'),'utf8')).provider;
if(!worksiteCommandExecutionBudgetFits(budget.requiredExecutionBudgetMs,provider))throw new Error('C2 enclosing budget insufficient');
const pendingConstruction=[]; let bytes=0;
for(const p of original.readRoots){let s;try{s=await stat(join(root,p));}catch(e){if(e.code==='ENOENT'&&original.workOrders.construction.writeRoots.includes(p)){pendingConstruction.push(p);continue;}throw e;}if(!s.isFile())throw new Error('Expected exact file '+p);bytes+=s.size;}
for(const source of original.sources){const digest='sha256:'+createHash('sha256').update(await readFile(join(root,source.path))).digest('hex');if(digest!==source.digest)throw new Error('Input digest differs: '+source.path);}
for(const order of Object.values(original.workOrders)){
 for(const p of order.writeRoots)if(!original.readRoots.some(r=>p===r||p.startsWith(r+'/')))throw new Error('Unreadable write root '+p);
 for(const p of order.readFirst)if(!original.readRoots.includes(p)||pendingConstruction.includes(p))throw new Error('Read-first outside existing observed files '+p);
}
if(bytes>original.maxContextBytes||original.readRoots.length>original.maxContextFiles)throw new Error('Context bound exceeded');
const {assessmentSelection}=await import('./consumer.mjs');
const {isNativeWorkspaceAssessmentSelection}=await import(pathToFileURL(join(installed,'native_workspace_assessment.js')).href);
const producer=JSON.parse(await readFile(join(base,'assessment-configuration-discriminator-001.json'),'utf8')).producer;
const asset=async path=>({path,digest:'sha256:'+createHash('sha256').update(await readFile(join(root,path))).digest('hex')});
const selection={resultContract:assessmentSelection.resultContract,schemaAsset:assessmentSelection.schemaAsset,sources:await Promise.all(original.assessment.sources.map(asset)),candidate:await asset(original.assessment.candidatePath),rubric:await asset(original.assessment.rubricPath),producer};
if(!isNativeWorkspaceAssessmentSelection(selection))throw new Error('Invalid assessment role/schema selection');
if(pendingConstruction.some(p=>!original.testing.selectedPaths.includes(p)))throw new Error('Unexpected missing Construction output');
const record={assessmentSelection:'accepted by exact installed pure validator; prior real producer used only for shape check, no UAT admission',pendingConstruction,at:new Date().toISOString(),classification:'Pure exact installed configuration and physical input checks; no native task admission, model call, command execution or success evidence',inputSha256:createHash('sha256').update(raw).digest('hex'),commandConfiguration:'accepted',requiredExecutionBudgetMs:budget.requiredExecutionBudgetMs,limitsFit:true,commands:config.commands.length,protectedFiles:protectedSubjects.length,readFiles:original.readRoots.length,readBytes:bytes,sourceDigests:'matched',writeReadScope:'covered',contextBounds:'within'};
await writeFile(join(base,'fixture-repair-01-preflight-02.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(record));
