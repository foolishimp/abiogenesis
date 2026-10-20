const ts=require('/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/node_modules/typescript'),fs=require('node:fs'),path=require('node:path');
const r='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
for (const name of process.argv.slice(2)) {
const file=path.join(r,'code/src/abg',name+'.ts'),pub=path.join(r,'build/code/src/abg',name+'.d.ts');
let source=fs.readFileSync(file,'utf8');const p=ts.createSourceFile(pub,fs.readFileSync(pub,'utf8'),ts.ScriptTarget.Latest,true),returns=new Map();
for(const n of p.statements)if(ts.isFunctionDeclaration(n)&&n.name&&n.type)returns.set(n.name.text,n.type.getText(p));
const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true),edits=[];
for(const n of sf.statements)if(ts.isFunctionDeclaration(n)&&n.body&&n.name&&!n.type&&n.parameters.some(p=>p.type?.getText(sf)==='ValidatedRuntimeEventPrefix')&&returns.has(n.name.text)){
 const start=n.getStart(sf),end=n.body.getStart(sf),head=source.slice(start,end).trimEnd()+': '+returns.get(n.name.text)+' ',priv=head.replace(/\bValidatedRuntimeEventPrefix\b/g,'RuntimeEventPrefix');
 edits.push({start,end,value:head.trimEnd()+';\n/** @internal */\n'+priv.trimEnd()+';\n'+priv});
}
for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.value+source.slice(e.end);
fs.writeFileSync(file,source);console.log(name,edits.length);
}
