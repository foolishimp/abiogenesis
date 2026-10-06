// Prospective declared snapshot copy. This preparation does not execute it.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync('recipe/input-manifest.json','utf8'));
if(fs.existsSync('verification'))throw Error('verification must be absent at recipe entry');
const rows=[
 ...manifest.sourceFiles.map(row=>({...row,destination:row.path})),
 ...manifest.authoritySources.map(row=>({...row,destination:'.authority-source/'+row.path})),
 ...manifest.lawMembers.map(row=>({...row,destination:'.law-source/currentRC2/'+row.path})),
 ...manifest.toolFiles.map(row=>({...row,destination:'.toolchain/'+row.path})),
 ...manifest.fixtureFiles.map(row=>({...row,destination:'.fixtures/'+row.target.slice('fixture-inputs/'.length)}))
];
// All bytes are checked before the first output write; donor inputs are conserved.
const copies=rows.map(row=>{
 const bytes=fs.readFileSync(row.target);
 if(bytes.length!==row.bytes||createHash('sha256').update(bytes).digest('hex')!==row.sha256)throw Error('changed selected input: '+row.target);
 if(path.isAbsolute(row.destination)||row.destination.split('/').includes('..'))throw Error('unsafe declared destination');
 return {row,bytes};
});
if(new Set(rows.map(row=>row.destination)).size!==rows.length)throw Error('duplicate destination');
for(const {row,bytes}of copies){
 const destination=path.join('verification',row.destination);
 fs.mkdirSync(path.dirname(destination),{recursive:true});
 fs.writeFileSync(destination,bytes,{flag:'wx',mode:row.mode});
}
// Links are recreated only inside the copied npm toolchain, never protected inputs.
const links=JSON.parse(fs.readFileSync('recipe/toolchain-links.json','utf8'));
const toolRoot=path.resolve('verification/.toolchain');
for(const row of links){
 const destination=path.join(toolRoot,row.path),target=path.resolve(path.dirname(destination),row.target);
 const relative=path.relative(toolRoot,target);
 if(!relative||relative==='..'||relative.startsWith('../')||path.isAbsolute(relative))throw Error('crossed tool link');
 if(!fs.statSync(target).isFile())throw Error('missing exact tool link body');
 fs.mkdirSync(path.dirname(destination),{recursive:true});fs.symlinkSync(row.target,destination);
}
fs.mkdirSync('verification/.recipe',{recursive:true});
for(const name of ['verification-recipe.json','test-environment.mjs','staging-fixtures.json','component-stage-plan.json','component-stage.mjs'])fs.copyFileSync(path.join('recipe',name),path.join('verification/.recipe',name),fs.constants.COPYFILE_EXCL);
for(const name of ['reports','.npm-cache','.npm-prefix','.tmp'])fs.mkdirSync(path.join('verification',name),{recursive:true});
for(const name of ['.user.npmrc','.global.npmrc','.global.gitconfig','.system.gitconfig'])fs.writeFileSync(path.join('verification',name),'',{flag:'wx'});
console.log(JSON.stringify({kind:'selected_build_copy',files:rows.length,bytes:rows.reduce((n,row)=>n+row.bytes,0),
 sourcePreimages:manifest.sourceFiles.length,currentAuthoritySources:manifest.authoritySources.length,
 currentLawMembers:manifest.lawMembers.length,tools:manifest.toolFiles.length,fixtures:manifest.fixtureFiles.length,
 dependencyInstall:'not_yet_run',authorityStaging:'separate_explicit_command'}));
