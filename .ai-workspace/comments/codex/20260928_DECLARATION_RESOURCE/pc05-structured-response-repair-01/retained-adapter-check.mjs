import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {createWorkerTransportOutputObserver} from '../../../../../build_tenants/abiogenesis/typescript/build/code/src/abg/worker_transport.js';
import {canonicalJson} from '../../../../../build_tenants/abiogenesis/typescript/build/code/src/shared/canonical_json.js';
import {admitIJsonText} from '../../../../../build_tenants/abiogenesis/typescript/build/code/src/shared/i_json.js';
const started=performance.now();
const base='/Users/jim/src/apps/odd_glc/.ai-workspace/comments/codex/20260928_DECLARATION_RESOURCE/';
const constructorPath=base+'pc05-02/invocation/archives/fp-08e209781c147e26-transport.json';
const failedPath=base+'pc05-07/invocation/archives/fp-fa29af369848375a-output.txt';
const digest=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
const bytes=await readFile(constructorPath); const transport=JSON.parse(bytes);
assert(transport.args.includes('--json-schema'));
const final=transport.stdout.split('\n').filter(Boolean).map(line=>JSON.parse(line)).filter(row=>row.type==='result').at(-1);
assert.equal(final.subtype,'success'); assert.equal(final.is_error,false);
assert.deepEqual(final.structured_output,JSON.parse(final.result));
const observer=createWorkerTransportOutputObserver(true); observer.observe(transport.stdout); const observed=observer.finish();
assert.deepEqual(JSON.parse(observed.finalOutput),JSON.parse(transport.finalOutput));
const {result:ordinaryText,...structuredOnly}=final;
const only=createWorkerTransportOutputObserver(true); only.observe(JSON.stringify(structuredOnly)+'\n');
assert.equal(only.finish().finalOutput,canonicalJson(final.structured_output));
const failed=await readFile(failedPath); assert.equal(digest(failed),'sha256:f3ef35a058acfed2823065d2c49ef5721e1b3ef51f6194ef18073f830865a2c0');
let refusal; try {admitIJsonText(failed.toString('utf8'),'retained PC05-07');} catch(error) {refusal={name:error.name,code:error.code,message:error.message};}
assert(refusal); assert.deepEqual(await readFile(failedPath),failed);
const report={scope:'Pure adapter check of already-retained host data; no dispatch, admission, journal recovery or semantic verdict',elapsedMs:performance.now()-started,
 constructor:{path:constructorPath,bytes:bytes.length,sha256:digest(bytes),hostSchemaRequested:true,oldTextAndStructuredValuesEqual:true,newSelectedValueEqualsRetainedOutput:true,structuredOnlyFinalAccepted:true,selectedBytes:Buffer.byteLength(observed.finalOutput),toolCallCount:observed.toolCallCount},
 failedPC0507:{path:failedPath,bytes:failed.length,sha256:digest(failed),unchanged:true,refusal}};
await writeFile(new URL('./retained-adapter-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n'); console.log(JSON.stringify(report));
