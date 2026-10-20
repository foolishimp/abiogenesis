import fs from 'node:fs';
import ts from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript/lib/typescript.js';
const root='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/hog/';
for(const file of ['judgment.ts','route_proposal.ts']){
 const path=root+file;let s=fs.readFileSync(path,'utf8');
 const sf=ts.createSourceFile(path,s,ts.ScriptTarget.Latest,true), edits=[];
 for(const fn of sf.statements.filter(ts.isFunctionDeclaration)){
  if(!fn.body)continue;
  const start=fn.getStart(sf), end=fn.body.getStart(sf);const signature=s.slice(start,end);
  const priv=signature.replaceAll('ReplayState','RuntimeReplayGuard').replaceAll('JudgedCCallOutcomeReceipt','OwnedJudgedCCallOutcomeReceipt').replaceAll('BlockedCCallOutcomeReceipt','OwnedBlockedCCallOutcomeReceipt');
  if(priv===signature)continue;
  const exported=fn.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword);
  edits.push({start,end,text:exported?signature.trimEnd()+';\n/** @internal Same candidate construction from authenticated current guard facts. */\n'+priv.trimEnd()+';\n'+priv:priv});
 }
 for(const e of edits.reverse())s=s.slice(0,e.start)+e.text+s.slice(e.end);
 s='import type { RuntimeReplayGuard } from "../abg/replay.js";\nimport type { OwnedJudgedCCallOutcomeReceipt, OwnedBlockedCCallOutcomeReceipt } from "../abg/c_call_outcome.js";\n'+s;fs.writeFileSync(path,s);
}
