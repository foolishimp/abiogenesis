import {commandRecorder} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=new URL('.',import.meta.url).pathname,cwd='/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript';
const command=commandRecorder(root,{timeoutMs:180000,maxOutputBytes:1048576,environment:{PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin'}});
for(const file of ['test_env/uat/runner.mjs','test_env/uat/public-setup.mjs','test_env/uat/harness.test.mjs']) {
 const r=await command('syntax-'+file.split('/').at(-1),'/opt/homebrew/bin/node',['--check',file],{cwd});
 console.log(JSON.stringify({stage:'syntax',file,exitCode:r.exitCode,wallMs:r.wallMs}));if(r.exitCode!==0){process.exitCode=1;break;}
}
if(!process.exitCode) {
 const r=await command('terminal-null-oracle','/opt/homebrew/bin/node',['--test','--test-concurrency=1','--test-name-pattern=Terminal-null admitted Run','test_env/uat/harness.test.mjs'],{cwd,environment:{PATH:'/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',ABI5_AUTHENTIC_C2_EVENT:root+'inputs/c2-1932.json',ABI5_AUTHENTIC_C2_EVENT_DIGEST:'sha256:f9ebfddaa07c663833d1db3e6be261b65beefabf9fdd0e38e36492d47f3221c0',ABI5_AUTHENTIC_C2_PROVENANCE:root+'inputs/c2-provenance.json'}});
 console.log(JSON.stringify({stage:'terminal-null-oracle',exitCode:r.exitCode,wallMs:r.wallMs,timedOut:r.timedOut,truncated:r.truncated}));if(r.exitCode!==0)process.exitCode=1;
}
