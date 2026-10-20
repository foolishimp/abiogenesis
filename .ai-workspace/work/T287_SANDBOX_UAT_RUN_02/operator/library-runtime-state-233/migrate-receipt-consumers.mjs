import fs from 'node:fs';
import ts from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript/lib/typescript.js';
const src='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/';
const rename=(s, map)=>{for(const [a,b] of Object.entries(map))s=s.replace(new RegExp('\\b'+a+'\\b','g'),b);return s;};
function migrate(name, exportedNames, typeMap, additions, bodyMap={}){
 const path=src+'hog/'+name+'.ts', orig=fs.readFileSync(path,'utf8');
 const ast=ts.createSourceFile(path,orig,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const fns=ast.statements.filter(ts.isFunctionDeclaration), first=fns[0].getStart(ast);
 const targets=fns.filter(f=>exportedNames.includes(f.name.text));
 let header=orig.slice(0,first), body=orig.slice(first);
 const names=Object.fromEntries(exportedNames.map(n=>[n,n.replace(/^(project|evaluate|begin|complete|restore|hold|advance)/,m=>m+'Owned')]));
 body=rename(body,{...names,...typeMap,...bodyMap});
 for(const n of Object.values(names))body=body.replace('export function '+n, '/** @internal Same owner computation with a selected guard receipt. */\nexport function '+n);
 let wrappers='';
 for(const fn of targets){
  const n=fn.name.text, newName=names[n];
  const generics=fn.typeParameters?.length ? '<'+fn.typeParameters.map(p=>p.getText(ast)).join(', ')+'>':'';
  const params=fn.parameters.map(p=>p.getText(ast)).join(',\n  '), args=fn.parameters.map(p=>p.name.getText(ast)).join(', ');
  const ret=fn.type?.getText(ast)??'unknown';
  let expr;
  if(ret.startsWith('Effect.Effect<')){
   const inner=ret.slice('Effect.Effect<'.length,-1);
   // These existing lifecycle effects have only their success parameter.
   expr=`Effect.map(${newName}(${args}), value => completePublicOutcome<${inner}>(value))`;
  }else expr=`completePublicOutcome<${ret}>(${newName}(${args}))`;
  wrappers+=`\nexport function ${n}${generics}(\n  ${params}\n): ${ret} {\n  return ${expr};\n}\n`;
 }
 fs.writeFileSync(path,header+'\n'+additions+'\n'+body+wrappers);
 return names;
}
const baseImport='import { completePublicOutcome, type OwnedOutcomeValue } from "../abg/c_call_outcome.js";\nimport type { RuntimeReplayGuard } from "../abg/replay.js";\n';
migrate('traversal_completion',['projectExecutableTraversalCompletion','projectHeldTraversalCompletion','projectBlockedRetryTraversalCompletion'],{
 'ExecutableTraversalCompletion':'OwnedExecutableTraversalCompletion','ReplayState':'RuntimeReplayGuard','RouteTransitionAdmission':'OwnedRouteTransitionAdmission',
},baseImport+'/** @internal */\nexport type OwnedExecutableTraversalCompletion = Omit<ExecutableTraversalCompletion, "replayState"> & { readonly replayState: RuntimeReplayGuard };\n/** @internal */\ntype OwnedRouteTransitionAdmission = OwnedOutcomeValue<RouteTransitionAdmission>;');
const outcomeImports='import * as OwnedOutcome from "../abg/c_call_outcome.js";\nimport * as OwnedReplay from "../abg/replay.js";\n';
const abgFunctions={};for(const n of ['admitCCallResult','admitCCallJudgment','admitCCallCompletion','admitCCallRejection'])abgFunctions['Abg.'+n]='OwnedOutcome.'+n.replace('admit','admitOwned');
function lifecycle(n,exports,types,extra=''){
 const aliases=Object.entries(types).map(([a,b])=>`/** @internal */\nexport type ${b} = OwnedOutcomeValue<${a}>;`).join('\n');
 const names=migrate(n,exports,types,baseImport+outcomeImports+extra+'\n'+aliases);
 const p=src+'hog/'+n+'.ts';let s=fs.readFileSync(p,'utf8');
 // Namespace calls are deliberately replaced only in implementation bodies.
 const start=s.indexOf('function ');let head=s.slice(0,start),body=s.slice(start);
 for(const [a,b]of Object.entries(abgFunctions))body=body.split(a).join(b);
 body=body.replaceAll('Abg.projectRuntimeTruthAtDurablePrefix','OwnedReplay.projectOwnedRuntimeTruthAtDurablePrefix').replaceAll('Abg.projectActiveRuntimeTransaction','OwnedReplay.projectOwnedActiveRuntimeTransaction');
 body=body.replaceAll('Abg.ReplayState','RuntimeReplayGuard');
 body=body.replaceAll('Abg.CCallCompletionAdmission','OwnedOutcome.OwnedCCallCompletionAdmission').replaceAll('Abg.JudgedCCallOutcomeReceipt','OwnedOutcome.OwnedJudgedCCallOutcomeReceipt');
 fs.writeFileSync(p,head+body);return names;
}
lifecycle('ccall_lifecycle',['projectCCallCompletion','evaluateExecutableCCall'],{
 'CCallLifecycleEvaluation':'OwnedCCallLifecycleEvaluation','CCallLifecycleStep':'OwnedCCallLifecycleStep','ExecutableTraversalCompletion':'OwnedExecutableTraversalCompletion',
 'BlockedCCallOutcomeReceipt':'OwnedBlockedCCallOutcomeReceipt','JudgedCCallOutcomeReceipt':'OwnedJudgedCCallOutcomeReceipt','RetryCCallOutcomeReceipt':'OwnedRetryCCallOutcomeReceipt',
});
lifecycle('workflow_lifecycle',['beginWorkflowLocus','completeWorkflowLocus'],{
 'ExecutableTraversalCompletion':'OwnedExecutableTraversalCompletion','TraversalLocusEvaluation':'OwnedTraversalLocusEvaluation','WorkflowLocusStep':'OwnedWorkflowLocusStep',
});
lifecycle('recursion_lifecycle',['restoreDeferredRecursion','beginRecursionApplication','completeRecursionChild'],{
 'ExecutableTraversalCompletion':'OwnedExecutableTraversalCompletion','RecursionChildFoldFrame':'OwnedRecursionChildFoldFrame','RecursionApplicationStep':'OwnedRecursionApplicationStep',
});
// Use the owned constructors within those implementations, retaining old names only in public wrappers.
for(const n of ['ccall_lifecycle','workflow_lifecycle','recursion_lifecycle']){
 const p=src+'hog/'+n+'.ts';let s=fs.readFileSync(p,'utf8');
 s=s.replace('  projectExecutableTraversalCompletion,','  projectOwnedExecutableTraversalCompletion as projectExecutableTraversalCompletion,').replace('  projectExecutableTraversalCompletion as completion,','  projectOwnedExecutableTraversalCompletion as completion,');
 s=s.replace('import { projectCCallCompletion }','import { projectOwnedCCallCompletion as projectCCallCompletion }').replace('  projectCCallCompletion,','  projectOwnedCCallCompletion as projectCCallCompletion,');fs.writeFileSync(p,s);
}
