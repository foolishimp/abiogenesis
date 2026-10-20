import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';

const root=dirname(fileURLToPath(import.meta.url));
const campaign=dirname(dirname(root));
const publication=join(campaign,'operator/portable-close-handoff-successor-227');
const tenant='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const environment={...process.env,
  ABI5_UAT_UNIT_ROOT:join(root,'fixtures'),
  ABI5_UAT_CONTINUATION_INSTALLED_ROOT:join(publication,'host-preparation/host/node_modules/@abiogenesis/typescript-tenant'),
  ABI5_UAT_CONTINUATION_NATIVE_ACQUISITION:join(publication,'host-preparation/host31-acquisition.json'),
  ABI5_UAT_CONTINUATION_CONSUMER_ACQUISITION:join(publication,'consumer-proof/consumer31-acquisition.json'),
  ABI5_UAT_CONTINUATION_LOCK_REF:'product-lock://abiogenesis/b95fabf29c14e09b22ad3f45af6292583a4cddc82c265e209a4b890fd295cc09',
  ABI5_UAT_CONTINUATION_LOCK_DIGEST:'sha256:b95fabf29c14e09b22ad3f45af6292583a4cddc82c265e209a4b890fd295cc09'};
const command=commandRecorder(root,{environment,timeoutMs:19260000,maxOutputBytes:536870912});
const result=await command('focused-caller-corrected',process.execPath,['--test','--test-concurrency=1',join(tenant,'test_env/uat/continuation.test.mjs')],{cwd:tenant});
process.stdout.write(JSON.stringify({exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,
  timedOut:result.timedOut,truncated:result.truncated,failure:result.failure})+'\n');
if(result.exitCode!==0||result.signal||result.timedOut||result.truncated||result.failure)process.exitCode=1;
