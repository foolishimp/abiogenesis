// One read-only physical-envelope tail observation; no Product import or truth admission.
import {opendir,lstat,open,realpath} from 'node:fs/promises';
import {join} from 'node:path';
const [root]=process.argv.slice(2);const out={at:new Date().toISOString(),standing:'Physical envelope metadata only; no ABG admission, replay, assertion or whole-history progress claim.',rows:[]};
try{
 if(root!=='/private/tmp/abg-r9-owner-diagnosis-006/tmp')throw Error('unexpected owned root');
 if(await realpath(root)!==root)throw Error('owned root is not canonical');
 const dirs=[];let names=0;const iterator=await opendir(root);
 for await(const entry of iterator){if(++names>128)throw Error('directory enumeration cap');if(entry.name.startsWith('abi5-root-env-')&&entry.isDirectory()&&!entry.isSymbolicLink())dirs.push(entry.name);}
 out.directoryNamesExamined=names;out.matchingFixtureDirectories=dirs.length;if(dirs.length!==1)throw Error('exactly one current fixture directory required');
 const fixture=join(root,dirs[0]),runtime=join(fixture,'runtime'),path=join(runtime,'events.jsonl');
 for(const p of [fixture,runtime,path]){const st=await lstat(p);if(st.isSymbolicLink())throw Error('symlink in observation path');}
 if(await realpath(path)!==path)throw Error('noncanonical event path');
 const fd=await open(path,'r');try{
  const st=await fd.stat();if(!st.isFile())throw Error('event path is not regular');const start=Math.max(0,st.size-1048576),buf=Buffer.alloc(st.size-start);
  const {bytesRead}=await fd.read(buf,0,buf.length,start);let tail=buf.subarray(0,bytesRead);out.fileSize=st.size;out.readOffset=start;out.bytesRead=bytesRead;out.partialInitialRowDiscarded=start>0;
  if(start>0){const first=tail.indexOf(10);tail=first<0?Buffer.alloc(0):tail.subarray(first+1);}
  const last=tail.lastIndexOf(10);out.partialFinalRowDiscarded=last!==tail.length-1;tail=last<0?Buffer.alloc(0):tail.subarray(0,last+1);
  const lines=tail.toString('utf8').split('\n').filter(Boolean);out.completeRowsInWindow=lines.length;out.rowsLimited=lines.length>256;let invalidRows=0;
  for(const line of lines.slice(-256)){try{
   const raw=JSON.parse(line);const e=raw?.kind==='abg_admitted_body_reference_record'?raw.event:raw;
   if(!e||typeof e.kind!=='string'||e.kind.length>128||!Number.isSafeInteger(e.admissionOrdinal)||e.admissionOrdinal<1)throw Error('invalid envelope');
   const row={kind:e.kind,admissionOrdinal:e.admissionOrdinal};
   if(Object.hasOwn(e,'eventTime')){const t=JSON.stringify(e.eventTime);if(t.length>2048)throw Error('eventTime metadata bound');row.eventTime=e.eventTime;}
   if(e.runId!==undefined){if(typeof e.runId!=='string'||e.runId.length>512)throw Error('runId metadata bound');row.runId=e.runId;}
   out.rows.push(row);
  }catch{invalidRows++;}}
  out.invalidRows=invalidRows;out.status=out.rows.length?'PHYSICAL_ROWS_OBSERVED':'UNKNOWN';out.partialOrAbsentMeans='unknown, never no progress';
 }finally{await fd.close();}
}catch(e){out.status='UNKNOWN';out.failure=String(e);}
process.stdout.write(JSON.stringify(out)+'\n');
