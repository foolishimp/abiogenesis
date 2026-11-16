// Static evaluation of the actual pure layout producer. No filesystem observer.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,dirname,isAbsolute,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
const C=dirname(fileURLToPath(import.meta.url)),host=await readFile(join(C,'HOST.mjs'),'utf8');
const start=host.indexOf('function topologyLayouts('),end=host.indexOf('\nlet caller,summary=',start);assert(start>0&&end>start);
const make=runInNewContext('('+host.slice(start,end).trim()+')',{assert});
const b=JSON.parse(await readFile(join(C,'BINDING.template.json'),'utf8'));
const closed=JSON.parse(await readFile(join(C,'CLOSED_SOURCE.json'),'utf8'));
const tool=JSON.parse(await readFile(join(C,'TOOLCHAIN.json'),'utf8'));
const R=join(b.rawRoot,'witness'),worksite=b.worksiteRoot;
const roots={toolchainRoot:join(R,'sandbox/installed/abg'),productRoot:join(R,'sandbox/installed/test-consumer/node_modules/@abiogenesis-fixtures/registered-selection'),eventLogRoot:dirname(closed.eventLog.path),runtimeStateRoot:join(R,'resources/runtime'),projectionRoot:join(R,'resources/projections'),archiveRoot:join(R,'resources/archives')};
const environment={workspaceBinding:{bindingId:null,roots},productInstalls:[{installedRoot:join(R,'sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant')},{installedRoot:roots.productRoot}]};
const writes=['application','semantic-assets','evidence','source/d2-input.json','source/d2-rubric.md','source/d1-admitted-source.json'].map(p=>join(worksite,p));
const base=make(environment,writes,b,C,worksite);
const actual=make(environment,writes,{...b,protectedRoots:[...b.protectedRoots,tool.stateRoot,tool.receiptRoot]},C,worksite);
const protectedRoots=[...new Set(base.layouts.flatMap(({layout})=>[layout.worksite,layout.archiveRoot,...layout.protectedRoots]).concat(tool.frozenRoot))];
actual.layouts.push({role:'consumer-tool-state',layout:{worksite:tool.stateRoot,writePaths:[join(tool.stateRoot,'attempts')],archiveRoot:tool.receiptRoot,protectedRoots}});
const planned=[{role:'planned-operator',layout:{worksite,writePaths:writes,archiveRoot:b.rawRoot,protectedRoots:[...new Set([b.controlSourceRoot,C,b.rawRoot,b.candidate.archivePath,b.candidate.bootstrapPackageRoot,...b.protectedRoots,tool.stateRoot,tool.receiptRoot])].sort()}},{role:'planned-tool',layout:{worksite:tool.stateRoot,writePaths:[join(tool.stateRoot,'attempts')],archiveRoot:tool.receiptRoot,protectedRoots:[...new Set([b.controlSourceRoot,C,b.rawRoot,worksite,b.candidate.archivePath,b.candidate.bootstrapPackageRoot,...b.protectedRoots])].sort()}}];
const counts=[...planned,...actual.layouts].map(({role,layout})=>{
 const counted=layout.writePaths.length+layout.protectedRoots.length+2;assert(counted<=64,role);
 for(const p of layout.writePaths){const rel=relative(layout.worksite,p);assert(rel&&!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('../'));}
 assert(layout.archiveRoot!==layout.worksite);return {role,writePaths:layout.writePaths.length,protectedRoots:layout.protectedRoots.length,counted,bound:64};
});
console.log(JSON.stringify({kind:'prospective_layout_shape_only',actualProducerEvaluated:true,runtimeEnvironment:false,physicalObservation:false,scope:'Paths derived from the selected setup producer and exact package names; future actual owner roots replace this static model',counts,completeWritePaths:writes,completeProtectedUnion:actual.completeProtectedRoots,observerUnchanged:true,qualified:false}));
