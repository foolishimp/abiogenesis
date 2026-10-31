import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const root='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const productPath=root+'/setup-001/sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant/build/code/src/product/index.js';
const product=await import(pathToFileURL(productPath));
const lines=(await readFile(root+'/setup-001/resources/events/runtime.events.jsonl','utf8')).trim().split('\n');
const event=lines.map(JSON.parse).find(e=>e.kind==='c_call_result_admitted'&&e.payload?.resultRef==='result://abiogenesis/0ea0c3ddbd421c88a68b79378164227daaad6af1fbf259893e8a9ed432f62b2e');
if(!event)throw Error('exact admitted selector task not found');
const task=event.payload.value,view=product.projectFramedSynthesisPromptTask(task),size=x=>Buffer.byteLength(JSON.stringify(x));
const sources=view.worksite.files.filter(x=>x.content!==undefined).map(x=>({path:x.path,bytes:size(x.content)})).sort((a,b)=>b.bytes-a.bytes);
console.log(JSON.stringify({ref:event.payload.resultRef,ordinal:event.admissionOrdinal,maxPromptBytes:task.state.original.maxPromptBytes,
 projectionJsonBytes:size(view),worksiteJsonBytes:size(view.worksite),sources,workOrdersBytes:size(view.workOrders),testingBytes:size(view.testing),
 declaredSourceCount:sources.length,observedFileCount:view.worksite.files.length},null,2));
