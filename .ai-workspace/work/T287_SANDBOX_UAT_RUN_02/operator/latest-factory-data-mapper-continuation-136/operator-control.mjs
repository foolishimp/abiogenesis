import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const controlPath=fileURLToPath(new URL('./operator-control.json',import.meta.url));
export async function readOperatorControl(){
 const bytes=await readFile(controlPath),value=JSON.parse(bytes.toString('utf8'));
 assert.equal(value.anchor,'nativeCLIcommand.request.started');assert.equal(value.durationMs,18000000);
 assert.equal(typeof value.declaration,'string');assert.ok(value.declaration.length>0);
 return {value,pin:{path:controlPath,sha256:createHash('sha256').update(bytes).digest('hex'),byteCount:bytes.length}};
}
export function effectiveWorkerConfiguration(configuration,control){
 const original=configuration.provider.appendArgs??[];
 assert.ok(!original.some(x=>/^--(?:append-)?system-prompt(?:-file)?(?:=|$)/u.test(x)),'Existing system-prompt argument conflicts with selected single append');
 return {...configuration,provider:{...configuration.provider,appendArgs:[...original,'--append-system-prompt',control.declaration]}};
}
export function qualityClock(control,nativeRequest){
 assert.equal(control.anchor,'nativeCLIcommand.request.started');
 const t0=Date.parse(nativeRequest.started);assert.ok(Number.isFinite(t0),'Actual native command request.started is required');
 return {nativeT0:nativeRequest.started,qualityCheckpointUTC:new Date(t0+control.durationMs).toISOString(),durationMs:control.durationMs,anchor:control.anchor};
}
