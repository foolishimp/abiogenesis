import fs from 'node:fs';import ts from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript/lib/typescript.js';
const root='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/';
let p=root+'hog/route_proposal.ts',s=fs.readFileSync(p,'utf8'),sf=ts.createSourceFile(p,s,ts.ScriptTarget.Latest,true),edits=[];
for(const fn of sf.statements.filter(ts.isFunctionDeclaration))if(!fn.body)for(const param of fn.parameters)if(param.initializer){
 const text=param.getText(sf),eq=text.lastIndexOf('=',param.initializer.getStart(sf)-param.getStart(sf));
 let noDefault=text.slice(0,eq).trimEnd();if(!param.questionToken){const n=param.name.getText(sf);noDefault=n+'?'+noDefault.slice(n.length);}
 edits.push({start:param.getStart(sf),end:param.getEnd(),text:noDefault});
}
for(const e of edits.reverse())s=s.slice(0,e.start)+e.text+s.slice(e.end);fs.writeFileSync(p,s);
p=root+'abg/traversal_route.ts';s=fs.readFileSync(p,'utf8').replace('import { runtimeEventPrefixDigest,','import { indexedRuntimeEventEnvelopes, runtimeEventPrefixDigest,');fs.writeFileSync(p,s);
p=root+'abg/fan_out.ts';s=fs.readFileSync(p,'utf8');
s='import { projectOwnedRuntimeEventPrefixAtDurablePrefix, selectRuntimeEventPrefixFromStore, runtimeEventBodiesAtPrefix, indexedRuntimeEvents, selectRuntimeEventPrefixFromAuthority } from "./event_prefix.js";\nimport { projectRuntimeReplayGuard, type RuntimeReplayGuard } from "./replay.js";\n'+s;
const signature='export function admitFanOutCompletion(\n  input: AdmitFanOutCompletionInput,\n): FanOutCompletionResult {';
s=s.replace(signature,'export function admitFanOutCompletion(input: AdmitFanOutCompletionInput): FanOutCompletionResult;\n/** @internal Same exact admission checks from the ordinary guard receipt. */\nexport function admitFanOutCompletion(input: Omit<AdmitFanOutCompletionInput, "replayState"> & { readonly replayState: RuntimeReplayGuard }): FanOutCompletionResult;\nexport function admitFanOutCompletion(input: Omit<AdmitFanOutCompletionInput, "replayState"> & { readonly replayState: RuntimeReplayGuard }): FanOutCompletionResult {');
s=s.replace('const predecessorEvents = readRuntimeEventsAtDurablePrefix(\n    input.predecessorPrefix,\n  );\n  const authorityPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents);','const authorityPrefix = projectOwnedRuntimeEventPrefixAtDurablePrefix(input.predecessorPrefix);');
s=s.replace('const snapshot = input.store.readAll();\n        const prefix = selectValidatedRuntimeEventPrefix(snapshot);\n        const currentReplay = replayValidatedRuntimeEventPrefix(\n          selectValidatedRuntimeEventPrefix(snapshot, {\n          runId: input.sourceCursor.runId,\n          }),\n          selectValidatedRuntimeEventPrefix(snapshot),\n        );','const prefix = selectRuntimeEventPrefixFromStore(input.store);\n        const currentReplay = projectRuntimeReplayGuard(\n          selectRuntimeEventPrefixFromAuthority(prefix, { runId: input.sourceCursor.runId }), prefix);');
s=s.replace('snapshot.some(', 'indexedRuntimeEvents(prefix, "kind:fan_out_completion_admitted").some(');
fs.writeFileSync(p,s);
