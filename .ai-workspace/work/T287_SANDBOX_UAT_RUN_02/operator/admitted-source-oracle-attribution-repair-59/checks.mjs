import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { commandRecorder } from '../../../../../build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';

const phase=fileURLToPath(new URL('.',import.meta.url));
const repo=fileURLToPath(new URL('../../../../../',import.meta.url));
const tenant=join(repo,'build_tenants/abiogenesis/typescript');
const tmp=join(phase,'tmp');await mkdir(tmp,{recursive:true});
const environment={...process.env,TMPDIR:tmp,ABI5_UAT_UNIT_ROOT:join(phase,'unit-runs'),
  ABI5_ORACLE_SOURCE_OWNER_ROOT:join(repo,'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/installed-stopped-boundary-reproof-54/reader-host/node_modules/@abiogenesis/typescript-tenant'),
  ABI5_AUTHENTIC_C2_EVENT:join(repo,'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/authenticated-read-source-reuse-repair-51/inputs/c2-1932.json'),
  ABI5_AUTHENTIC_C2_EVENT_DIGEST:'sha256:f9ebfddaa07c663833d1db3e6be261b65beefabf9fdd0e38e36492d47f3221c0',
  ABI5_AUTHENTIC_C2_PROVENANCE:join(repo,'.ai-workspace/work/T287_SANDBOX_UAT_RUN_02/operator/authenticated-read-source-reuse-repair-51/inputs/c2-provenance.json')};
const command=commandRecorder(phase,{environment,timeoutMs:120000,maxOutputBytes:4*1024*1024});
if(process.argv[2]==='acquisition') {
  const result=await command('acquisition-tests',process.execPath,['--test',
    '--test-name-pattern=Seven exact original|Archived judgment',join(tenant,'test_env/uat/harness.test.mjs')],{cwd:repo});
  process.stdout.write(JSON.stringify({exitCode:result.exitCode,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated})+'\n');
  process.exit(result.exitCode??1);
}
for(const [i,path]of ['test_env/uat/runner.mjs','test_env/uat/public-setup.mjs','test_env/uat/harness.test.mjs','test_env/fixtures/sandbox-uat/independent-oracle.mjs'].entries()) {
  const result=await command('syntax-'+i,process.execPath,['--check',join(tenant,path)],{cwd:repo});
  if(result.exitCode!==0)process.exit(1);
}
const result=await command('focused-tests',process.execPath,['--test',
  '--test-name-pattern=Source-use|Terminal-null admitted Run|Rust-service mechanical oracle|Acquisition',
  join(tenant,'test_env/uat/harness.test.mjs')],{cwd:repo});
process.stdout.write(JSON.stringify({exitCode:result.exitCode,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated})+'\n');
process.exitCode=result.exitCode??1;
