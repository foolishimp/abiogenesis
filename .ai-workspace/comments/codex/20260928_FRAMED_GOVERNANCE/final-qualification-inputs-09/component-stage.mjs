// Pure declared derivation of an isolated historical component tool.
// Current qualification law and its output population are not overwritten.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const plan=JSON.parse(fs.readFileSync('.recipe/component-stage-plan.json','utf8'));
const root=path.resolve('.components/retained-carrier');
if(fs.existsSync(root))throw Error('component output must be absent');
const copies=plan.members.map(row=>{
 for(const relative of [row.source,row.destination])if(path.isAbsolute(relative)||relative.split('/').includes('..'))throw Error('unsafe component path');
 const source=path.resolve(row.source);
 if(fs.realpathSync(source)!==source||!fs.lstatSync(source).isFile())throw Error('noncanonical component source');
 const bytes=fs.readFileSync(source);
 if(bytes.length!==row.bytes||hash(bytes)!==row.sha256)throw Error('component source differs: '+row.source);
 return {row,bytes,mode:fs.statSync(source).mode&0o777};
});
if(new Set(copies.map(x=>x.row.destination)).size!==copies.length)throw Error('duplicate component destination');
for(const {row,bytes,mode}of copies){const target=path.join(root,row.destination);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx',mode});}
const report={kind:'isolated_component_staging',componentRoot:plan.destinationRoot,files:copies.length,bytes:copies.reduce((n,x)=>n+x.bytes.length,0),roles:plan.counts,
 historicalCatalogSHA256:plan.historicalCatalogSHA256,currentCatalogSHA256:plan.currentCatalogSHA256,currentQualificationTenantOverwritten:false};
fs.writeFileSync('reports/component-staging.json',JSON.stringify(report)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
