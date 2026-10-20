import fs from 'node:fs';import ts from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript/lib/typescript.js';
const root='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/';
const mapWords=(s,map)=>{for(const [a,b]of Object.entries(map))s=s.replace(new RegExp('\\b'+a+'\\b','g'),b);return s;};
const baseImport='import { completePublicOutcome, type OwnedOutcomeValue } from "../abg/c_call_outcome.js";\nimport * as OwnedOutcome from "../abg/c_call_outcome.js";\nimport * as OwnedReplay from "../abg/replay.js";\n';
function migrate(name,names,types){
 const path=root+'hog/'+name+'.ts';let orig=fs.readFileSync(path,'utf8'), sf=ts.createSourceFile(path,orig,ts.ScriptTarget.Latest,true), fns=sf.statements.filter(ts.isFunctionDeclaration), first=fns[0].getStart(sf);
 const fnNames=Object.fromEntries(names.map(n=>[n,n.replace(/^(complete|hold|advance)/,m=>m+'Owned')]));
 let head=orig.slice(0,first),body=mapWords(orig.slice(first),{...types,...fnNames});
 for(const n of Object.values(fnNames))body=body.replace('export function '+n,'/** @internal Same current completion with a selected guard receipt. */\nexport function '+n);
 let wrappers='';
 for(const fn of fns.filter(f=>names.includes(f.name.text))){
  const n=fn.name.text,params=fn.parameters.map(p=>p.getText(sf)).join(',\n  '),args=fn.parameters.map(p=>p.name.getText(sf)).join(', '),ret=fn.type.getText(sf);
  wrappers+=`\nexport function ${n}(\n  ${params}\n): ${ret} { return completePublicOutcome<${ret}>(${fnNames[n]}(${args})); }\n`;
 }
 for(const n of ['admitCCallResult','admitCCallJudgment','admitCCallCompletion','admitCCallRejection'])body=body.replaceAll('Abg.'+n,'OwnedOutcome.'+n.replace('admit','admitOwned'));
 body=body.replaceAll('Abg.projectRuntimeTruthAtDurablePrefix','OwnedReplay.projectOwnedRuntimeTruthAtDurablePrefix');
 head=head.replace('  projectExecutableTraversalCompletion,','  projectOwnedExecutableTraversalCompletion as projectExecutableTraversalCompletion,').replace('  replayAtDurable,','  ownedReplayAtDurable as replayAtDurable,');
 const aliases=Object.entries(types).map(([a,b])=>`/** @internal */\nexport type ${b} = OwnedOutcomeValue<${a}>;`).join('\n');
 fs.writeFileSync(path,head+'\n'+baseImport+aliases+'\n'+body+wrappers);
}
migrate('interaction_lifecycle',['holdInteraction'],{'InteractionHoldEvaluation':'OwnedInteractionHoldEvaluation'});
migrate('interaction_resume',['completeInteractionResume'],{'ExecutableTraversalCompletion':'OwnedExecutableTraversalCompletion'});
migrate('retry_lifecycle',['advanceRetryLifecycle'],{'RetryLifecycleStep':'OwnedRetryLifecycleStep'});
let p=root+'hog/graph_execute.ts',s=fs.readFileSync(p,'utf8'),sf=ts.createSourceFile(p,s,ts.ScriptTarget.Latest,true);
const first=sf.statements.find(ts.isFunctionDeclaration).getStart(sf), async=sf.statements.find(x=>ts.isFunctionDeclaration(x)&&x.name.text==='executeGraphTraversal');
const originalAsync=async.getText(sf);let head=s.slice(0,first),body=s.slice(first,async.getStart(sf));
const types={'ExecutableTraversalCompletion':'OwnedExecutableTraversalCompletion','TraversalMachineState':'OwnedTraversalMachineState','MachineReturnFrame':'OwnedMachineReturnFrame','MachineRecursionReturnFrame':'OwnedMachineRecursionReturnFrame','RecursionChildFoldFrame':'OwnedRecursionChildFoldFrame','TraversalLocusEvaluation':'OwnedTraversalLocusEvaluation','CCallLifecycleEvaluation':'OwnedCCallLifecycleEvaluation','ExecuteGraphTraversalResult':'ExecuteOwnedGraphTraversalResult'};
body=mapWords(body,{...types,'executeGraphTraversalEffect':'executeOwnedGraphTraversalEffect'});
const privateStart=head.indexOf('type MachineLocusStep');head=head.slice(0,privateStart)+mapWords(head.slice(privateStart),types);
const replacements={evaluateExecutableCCall:'evaluateOwnedExecutableCCall',beginWorkflowLocus:'beginOwnedWorkflowLocus',completeWorkflowLocus:'completeOwnedWorkflowLocus',beginRecursionApplication:'beginOwnedRecursionApplication',completeRecursionChild:'completeOwnedRecursionChild',restoreDeferredRecursion:'restoreOwnedDeferredRecursion',holdInteraction:'holdOwnedInteraction',completeInteractionResume:'completeOwnedInteractionResume',advanceRetryLifecycle:'advanceOwnedRetryLifecycle'};
for(const [a,b]of Object.entries(replacements))head=head.replace(new RegExp('(?<![A-Za-z])'+a+'(?=[, }\\n])','g'),b+' as '+a);
head=head.replace('  projectExecutableTraversalCompletion,','  projectOwnedExecutableTraversalCompletion as projectExecutableTraversalCompletion,').replace('  projectHeldTraversalCompletion,','  projectOwnedHeldTraversalCompletion as projectHeldTraversalCompletion,');
const imports=`\nimport { completePublicOutcome } from "../abg/c_call_outcome.js";\nimport type { OwnedExecutableTraversalCompletion } from "./traversal_completion.js";\nimport type { OwnedTraversalMachineState, OwnedMachineReturnFrame, OwnedMachineRecursionReturnFrame } from "./evaluation_frame.js";\nimport type { OwnedRecursionChildFoldFrame } from "./recursion_lifecycle.js";\nimport type { OwnedTraversalLocusEvaluation } from "./workflow_lifecycle.js";\nimport type { OwnedCCallLifecycleEvaluation } from "./ccall_lifecycle.js";\n/** @internal */\nexport type ExecuteOwnedGraphTraversalResult = OwnedExecutableTraversalCompletion | GraphTraversalEntryRefusal | GraphTraversalFailureResult;\n`;
body=body.replace('export function executeOwnedGraphTraversalEffect','/** @internal Ordinary Run execution retains no complete historical replay vector. */\nexport function executeOwnedGraphTraversalEffect');
s=head+imports+body+`\nexport function executeGraphTraversalEffect(input: ExecuteGraphTraversalRequest): Effect.Effect<ExecuteGraphTraversalResult, never> {\n return Effect.map(executeOwnedGraphTraversalEffect(input), result => completePublicOutcome<ExecuteGraphTraversalResult>(result));\n}\n`+originalAsync+'\n';fs.writeFileSync(p,s);
p=root+'owner_bindings/run_invocation.ts';s=fs.readFileSync(p,'utf8').replace('import { executeGraphTraversalEffect }','import { executeOwnedGraphTraversalEffect as executeGraphTraversalEffect }');fs.writeFileSync(p,s);
