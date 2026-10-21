import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),semver=require('/opt/homebrew/lib/node_modules/npm/node_modules/semver');
const input=JSON.parse(readFileSync(process.argv[2],'utf8')),meta=input.metadata;
const root=meta['package.json'].package;
assert.deepEqual([...root.bundleDependencies].sort(),Object.keys(root.dependencies).sort());
const queue=[''],visited=new Set(),edges=[];
while(queue.length){
 const dir=queue.shift();if(visited.has(dir))continue;visited.add(dir);
 const item=meta[dir?dir+'/package.json':'package.json'];assert.ok(item,dir);
 const p=item.package;
 if(p.engines?.node)assert.ok(semver.satisfies(process.version,p.engines.node),p.name+' node engine');
 for(const [relation,dependencies] of [['dependencies',p.dependencies??{}],['optionalDependencies',p.optionalDependencies??{}],['peerDependencies',p.peerDependencies??{}]])for(const [name,range] of Object.entries(dependencies)){
  let parent=dir,target;const candidates=[];
  while(true){if(path.posix.basename(parent)!=='node_modules'){const candidate=(parent?parent+'/':'')+'node_modules/'+name+'/package.json';candidates.push(candidate);if(meta[candidate]){target=candidate;break;}}if(!parent)break;const next=path.posix.dirname(parent);parent=next==='.'?'':next;}
  const optional=relation==='optionalDependencies'||(relation==='peerDependencies'&&p.peerDependenciesMeta?.[name]?.optional===true);
  if(!target){assert.ok(optional,JSON.stringify({from:dir,name,range,candidates}));edges.push({from:dir||'.',relation,name,range,optional,disposition:'absent-optional',candidates});continue;}
  const actual=meta[target].package;assert.equal(actual.name,name);assert.ok(semver.satisfies(actual.version,range),JSON.stringify({from:dir,name,range,version:actual.version}));
  edges.push({from:dir||'.',relation,name,range,optional,target,version:actual.version,metadataSha256:meta[target].sha256});queue.push(target.slice(0,-'/package.json'.length));
 }
}
const result={status:'satisfied',subjectId:'candidate',archive:input.archive,membersVerified:input.membersVerified,packageCount:visited.size,packages:[...visited],edges,missingRequired:[],cacheSelection:{kind:'explicit_empty_seed',files:[],globalCacheRead:false,globalCacheWrite:false,networkFallback:false},scope:'All required runtime dependencies and peers resolve in exact bundled archive by Node node_modules ancestor lookup and satisfy declared versions. Dev dependencies are outside installed runtime closure. No Product imports or execution.'};
writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:result.status,packageCount:result.packageCount,edges:edges.length,membersVerified:result.membersVerified}));
