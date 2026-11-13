import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
export async function validateTransport(binding){
 const p=binding.transportContract,bytes=await readFile(p.source.path),sha=b=>createHash('sha256').update(b).digest('hex');
 assert.equal(bytes.length,p.source.bytes);assert.equal(sha(bytes),p.source.sha256);
 const text=bytes.toString(),start=text.indexOf('function resolveAbsoluteTimeoutMs('),end=text.indexOf('\nfunction countToolUses',start);
 assert(start>=0&&end>start);const fn=text.slice(start,end);assert.equal(Buffer.byteLength(fn),p.functionBytes);assert.equal(sha(fn),p.functionSha256);
 const resolve=runInNewContext('('+fn+')',{}, {timeout:1000});
 for(const key of ['inactivityTimeoutMs','absoluteTimeoutMs','maxTurns']){assert.equal(binding.provider[key],p[key]);assert(Number.isSafeInteger(p[key])&&p[key]>0);}
 assert.equal(resolve(p.inactivityTimeoutMs,p.absoluteTimeoutMs),p.absoluteTimeoutMs);
 assert.equal(binding.provider.model,'claude-opus-5-5');
 assert.deepEqual(binding.provider.appendArgs,['--effort','xhigh']);
 assert.throws(()=>resolve(300000,300000),/greater than its inactivity timeout/);
 return {status:'PASSED',source:p.source,functionSha256:p.functionSha256,selected:p,oldEqualTimeoutRejected:true,meaning:'Only the exact installed pure timeout validator executed; no runtime or provider allocation.'};
}
