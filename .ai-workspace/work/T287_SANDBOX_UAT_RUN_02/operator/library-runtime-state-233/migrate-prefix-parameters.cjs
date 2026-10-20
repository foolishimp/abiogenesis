const ts = require('/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript');
const fs = require('node:fs'), path = require('node:path');
const tenant='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const phase='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/library-runtime-state-233';
const names=process.argv.slice(2);
for(const name of names){
 const file=path.join(tenant,'code/src/abg',name+'.ts');let text=fs.readFileSync(file,'utf8');
 const pre=path.join(phase,'preimages/code/src/abg',name+'.ts');if(!fs.existsSync(pre)){fs.mkdirSync(path.dirname(pre),{recursive:true});fs.copyFileSync(file,pre);}
 const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS),edits=[];const counts=new Map();
 for(const node of sf.statements)if(ts.isFunctionDeclaration(node)&&node.name)counts.set(node.name.text,(counts.get(node.name.text)||0)+1);
 let changed=0,skipped=[];
 function visit(node){
  if(ts.isFunctionDeclaration(node)&&node.body){
   const start=node.getStart(sf),end=node.body.getStart(sf),header=text.slice(start,end);
   if(header.includes('ValidatedRuntimeEventPrefix')&&!/(?<!Validated)RuntimeEventPrefix/.test(header)){
    const exported=node.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword);
    if(exported&&(counts.get(node.name.text)>1||!node.type||node.parameters.some(p=>p.initializer&&!p.type))){skipped.push(node.name.text);}
    else{
     const replacement=header.replace(/\bValidatedRuntimeEventPrefix\b/g,'RuntimeEventPrefix');
     if(!exported){edits.push({start,end,value:replacement});}
     else{
      const remove=[];for(const p of node.parameters)if(p.initializer){let at=p.initializer.getStart(sf)-1;while(text[at]!=='=')at--;remove.push({start:at-start,end:p.initializer.end-start,value:''});if(!p.questionToken)remove.push({start:p.name.end-start,end:p.name.end-start,value:'?'});}
      let signature=header;for(const e of remove.sort((a,b)=>b.start-a.start))signature=signature.slice(0,e.start)+e.value+signature.slice(e.end);
      edits.push({start,end,value:signature.trimEnd()+';\n/** @internal */\n'+signature.replace(/\bValidatedRuntimeEventPrefix\b/g,'RuntimeEventPrefix').trimEnd()+';\n'+replacement});
     }changed++;
    }
   }
  }
  ts.forEachChild(node,visit);
 }visit(sf);
 for(const e of edits.sort((a,b)=>b.start-a.start))text=text.slice(0,e.start)+e.value+text.slice(e.end);
 if(changed){if(!/type RuntimeEventPrefix[, }]/.test(text))text='import type { RuntimeEventPrefix } from "./event_prefix.js";\n'+text;fs.writeFileSync(file,text);}
 console.log(JSON.stringify({name,changed,skipped}));
}
