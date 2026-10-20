import {commandRecorder,exclusiveRecord} from '/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/uat/runner.mjs';
const root=new URL('.',import.meta.url).pathname;
const inherited=Object.fromEntries(['HOME','PATH','TMPDIR','LANG','LC_ALL'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
await exclusiveRecord(root,'recorder-pid.json',{pid:process.pid,started:new Date().toISOString(),defaultHeap:true,noNodeOptions:true});
const command=commandRecorder(root,{environment:inherited,timeoutMs:19260000,maxOutputBytes:536870912});
const r=await command('boundary-reproof','/opt/homebrew/bin/node',[root+'reproof.mjs'],{cwd:'/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript'});
console.log(JSON.stringify({stage:'reproof-closed',exitCode:r.exitCode,signal:r.signal,wallMs:r.wallMs,timedOut:r.timedOut,truncated:r.truncated,failure:r.failure}));process.exitCode=r.exitCode===0?0:1;
