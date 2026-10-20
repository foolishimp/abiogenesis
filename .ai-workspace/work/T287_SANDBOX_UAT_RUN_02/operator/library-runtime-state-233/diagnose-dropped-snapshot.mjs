import inspector from 'node:inspector';
import fs from 'node:fs';
import {join} from 'node:path';
const post=(session,method,params={})=>new Promise((resolve,reject)=>session.post(method,params,(error,value)=>error?reject(error):resolve(value)));
const later=()=>new Promise(resolve=>setImmediate(resolve));
export async function diagnoseDroppedSnapshot(weak,root) {
 const session=new inspector.Session();session.connect();globalThis.__233DroppedWeak=weak;
 const paths=[join(root,'heap-diagnostic-01.heapsnapshot'),join(root,'heap-diagnostic-02.heapsnapshot')];
 async function snapshot(path) {const fd=fs.openSync(path,'wx');const chunk=m=>fs.writeSync(fd,m.params.chunk);session.on('HeapProfiler.addHeapSnapshotChunk',chunk);
  try{await post(session,'HeapProfiler.takeHeapSnapshot',{reportProgress:false});}finally{session.off('HeapProfiler.addHeapSnapshotChunk',chunk);fs.closeSync(fd);}}
 try {
  await post(session,'HeapProfiler.enable');
  const remote=await post(session,'Runtime.evaluate',{expression:'globalThis.__233DroppedWeak.deref()',objectGroup:'233-drop'});
  if(remote.result.objectId===undefined)return {kind:'finite_drop_retainer_diagnostic',collectedBeforeHeapSnapshot:true,heap:process.memoryUsage().heapUsed};
  await snapshot(paths[0]);
  const {heapSnapshotObjectId:targetId}=await post(session,'HeapProfiler.getHeapObjectId',{objectId:remote.result.objectId});
  await post(session,'Runtime.releaseObjectGroup',{objectGroup:'233-drop'});
  await later();await snapshot(paths[1]);
  const parsed=JSON.parse(fs.readFileSync(paths[1],'utf8'));
  const {nodes,edges,strings,snapshot:{meta}}=parsed,nf=meta.node_fields.length,ef=meta.edge_fields.length;
  const at=Object.fromEntries(meta.node_fields.map((n,i)=>[n,i])),et=Object.fromEntries(meta.edge_fields.map((n,i)=>[n,i]));
  const nt=meta.node_types[at.type],types=meta.edge_types[et.type];
  let target=-1;for(let n=0;n<nodes.length;n+=nf)if(String(nodes[n+at.id])===targetId){target=n/nf;break;}
  if(target<0)return {kind:'finite_drop_retainer_diagnostic',targetId,collectedAfterDebuggerHandleReleased:true,heap:process.memoryUsage().heapUsed};
  const count=nodes.length/nf,start=new Uint32Array(count+1);let next=0;
  for(let n=0;n<count;n++){start[n]=next;next+=nodes[n*nf+at.edge_count]*ef;}start[count]=next;
  const parent=new Int32Array(count);parent.fill(-2);parent[0]=-1;const parentEdge=new Int32Array(count);const queue=[0];
  for(let q=0;q<queue.length&&parent[target]===-2;q++){const from=queue[q];for(let e=start[from];e<start[from+1];e+=ef){
   if(types[edges[e+et.type]]==='weak')continue;
   const to=edges[e+et.to_node]/nf;if(parent[to]!==-2)continue;parent[to]=from;parentEdge[to]=e;queue.push(to);}}
  const name=n=>{const type=nt[nodes[n*nf+at.type]],value=strings[nodes[n*nf+at.name]];return {type,name:type.includes('string')?'[string length '+value.length+']':value.length>96?value.slice(0,60)+'[redacted length '+value.length+']':value,id:nodes[n*nf+at.id]};};
  const path=[];if(parent[target]!==-2)for(let n=target;n>=0;n=parent[n]){const e=parentEdge[n],type=n===0?'root':types[edges[e+et.type]];
   const index=edges[e+et.name_or_index],label=n===0?'root':['element','hidden'].includes(type)?String(index):strings[index];path.push({...name(n),edgeType:type,edge:label.length>96?label.slice(0,60)+'[redacted]':label});}
  path.reverse();return {kind:'finite_drop_retainer_diagnostic',targetId,target:name(target),strongRootPath:path,reachableNodes:queue.length,totalNodes:count,
   heap:process.memoryUsage().heapUsed,limits:['Finite disposable fixture only; weak edges excluded; debugger handle released before measured snapshot; raw snapshots erased; fatal campaign retainer not inferred']};
 }finally{delete globalThis.__233DroppedWeak;session.disconnect();for(const path of paths)if(fs.existsSync(path))fs.unlinkSync(path);}
}
