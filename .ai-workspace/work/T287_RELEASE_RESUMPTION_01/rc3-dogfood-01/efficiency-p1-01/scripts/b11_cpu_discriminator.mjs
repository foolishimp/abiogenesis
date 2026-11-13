import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {pathToFileURL} from 'node:url';
const base='/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01';
const source=base+'/setup-006/resources/events/runtime.events.jsonl', fd=fs.openSync(source,'r');
const {sha256Canonical}=await import(pathToFileURL(base+'/setup-006/sandbox/installed/abg/node_modules/@abiogenesis/typescript-tenant/build/code/src/shared/digests.js').href);
function time(label,fn){const before=process.cpuUsage(),start=performance.now();const value=fn();const cpu=process.cpuUsage(before);return {label,wallMs:performance.now()-start,cpuMs:(cpu.user+cpu.system)/1000,value};}
const bytes=Buffer.allocUnsafe(124233329);let read=0;const io=time('read_exact_event',()=>{while(read<bytes.length){const n=fs.readSync(fd,bytes,read,bytes.length-read,688934717+read);if(!n)throw Error('short read');read+=n}return read});fs.closeSync(fd);
const hash=time('raw_sha256',()=>createHash('sha256').update(bytes).digest('hex'));if(hash.value!=='ec97d13f1c27bbaa451e3cc7626db84c1397c6f0b498c053f741a94cef0a7b32')throw Error('wrong event bytes');
const decode=time('decode_utf8',()=>bytes.toString('utf8'));const parse=time('JSON_parse',()=>JSON.parse(decode.value));const event=parse.value;
if(event.admissionOrdinal!==2982||event.payload.resultRef!=='result://abiogenesis/6a33512a7df328ba9452f1aaf8ef5085ae9ab89ba1be67c094d9ea2693f69167')throw Error('wrong event');
const value=event.payload.value;const hashes=[];for(let i=0;i<2;i++){const t=time('installed_sha256Canonical_full_'+(i+1),()=>sha256Canonical(value));if(t.value!==event.payload.valueDigest)throw Error('canonical digest mismatch');hashes.push(t)}
const native=value.task.sourceNativeWork;
const meta=ctx=>({observationRef:ctx.observationRef,observationDigest:ctx.observationDigest,entries:ctx.entries.map(({relativePath,byteLength,digest,state,encoding})=>({relativePath,byteLength,digest,state,encoding}))});
const model={kind:'analysis_only_non_equivalent_projection',originalResultRef:event.payload.resultRef,originalValueDigest:event.payload.valueDigest,before:meta(native.before),taskContext:meta(native.task.context),after:meta(native.after)};
const projection=time('projection_JSON_stringify',()=>JSON.stringify(model));const compact=projection.value;const compactParse=time('projection_JSON_parse',()=>JSON.parse(compact));
const compactHash=[];for(let i=0;i<2;i++)compactHash.push(time('installed_sha256Canonical_projection_'+(i+1),()=>sha256Canonical(model)));
const out={recordBytes:bytes.length,recordSha256:hash.value,verifiedValueDigest:event.payload.valueDigest,projectionBytes:Buffer.byteLength(compact),entriesPerContext:native.before.entries.length,samples:[io,hash,{...decode,value:undefined},{...parse,value:undefined},...hashes.map(t=>({...t,value:undefined})),{...projection,value:undefined},{...compactParse,value:undefined},...compactHash.map(t=>({...t,value:undefined}))],limits:['single local warm-cache diagnostic, not production profiling','projection omits source bytes, is not schema-equivalent and cannot replace admitted result','no claim of end-to-end speedup or attribution of all waiting time']};
console.log(JSON.stringify(out,null,2));
