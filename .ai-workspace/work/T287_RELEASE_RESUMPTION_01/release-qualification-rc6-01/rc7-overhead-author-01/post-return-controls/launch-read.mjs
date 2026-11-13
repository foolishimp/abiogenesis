// One finite host invocation through the unchanged existing command owner.
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandRecorder,exclusiveRecord} from '../../operator-client/runner.mjs';
const [path,expected,member]=process.argv.slice(2),inputPath=resolve(path),bytes=await readFile(inputPath);
assert.equal(createHash('sha256').update(bytes).digest('hex'),expected);const input=JSON.parse(bytes);
assert(['run_result','run_replay'].includes(member)&&input.members.includes(member));assert.equal(input.heapMiB,8192);
assert(Number.isSafeInteger(input.hostTimeoutMs)&&input.hostTimeoutMs>input.timeoutMs&&input.hostTimeoutMs<=10800000);
const root=join(dirname(inputPath),member+'-host');await mkdir(root);
const command=commandRecorder(root,{environment:input.config.setupEnvironment,timeoutMs:input.hostTimeoutMs,maxOutputBytes:1048576});
const observed=await command(member+'-host',input.config.nodePath,['--max-old-space-size=8192',join(dirname(fileURLToPath(import.meta.url)),'read-one.mjs'),inputPath,expected,member]);
const result={member,exitCode:observed.exitCode,signal:observed.signal,timedOut:observed.timedOut,truncated:observed.truncated,failure:observed.failure,wallMs:observed.wallMs,
 summaryPath:join(dirname(inputPath),member,'SUMMARY.json'),failurePath:join(dirname(inputPath),member,'FAILURE.json'),automaticRetry:false};
await exclusiveRecord(root,'HOST_RESULT.json',result);console.log(JSON.stringify(result));
if(observed.exitCode!==0||observed.signal!==null||observed.timedOut||observed.truncated||observed.failure!==null)process.exitCode=1;
