// Finite C2 test invocation/assertion only; all behavior remains existing/native-authored tests.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(process.cwd(),'build_tenants/abiogenesis/typescript');
const specs={"harness": {"file": "test_env/uat/harness.test.mjs", "required": ["Both retained install roots are checked before dispatch and before fresh reads; missing or false owner results refuse", "Caller run-environment support is canonical, strictly contained and admitted by the existing resource owner", "Native refusal without an admitted Run is preserved before any refresh, reopen or read", "Admitted failed and blocked Runs retain both fresh reads and unchanged event bytes", "Maintained setup retains actual owner verification through ten native calls and preserves configured environment"]}, "raw": {"file": "test_env/tests/t287-w2-05-static-binding-algebra.test.mjs", "required": ["native transport delegates one complete admission to the real fixed Run owner and conserves refusal ordering", "preparation resolution retains its established native link and raw lock refusals", "native detachment retains only actual immutable verifier bodies and detaches raw copies"], "pattern": "^(?:native\\ transport\\ delegates\\ one\\ complete\\ admission\\ to\\ the\\ real\\ fixed\\ Run\\ owner\\ and\\ conserves\\ refusal\\ ordering|preparation\\ resolution\\ retains\\ its\\ established\\ native\\ link\\ and\\ raw\\ lock\\ refusals|native\\ detachment\\ retains\\ only\\ actual\\ immutable\\ verifier\\ bodies\\ and\\ detaches\\ raw\\ copies)$"}, "physical": {"file": "test_env/tests/t287-wave2-installed-product-verification.test.mjs", "required": ["W2 Product verification detects stale bytes in an ABG-admitted install", "W2 Product verification walks the artifact bytes once and refuses an unreadable archive at its stage's code"], "pattern": "^(?:W2\\ Product\\ verification\\ detects\\ stale\\ bytes\\ in\\ an\\ ABG\\-admitted\\ install|W2\\ Product\\ verification\\ walks\\ the\\ artifact\\ bytes\\ once\\ and\\ refuses\\ an\\ unreadable\\ archive\\ at\\ its\\ stage's\\ code)$"}};
const mode=process.argv[2],s=specs[mode];assert(s,'Unknown selected proof lane');
const args=['--experimental-vm-modules','--test','--test-reporter=tap'];
if(s.pattern)args.push('--test-name-pattern='+s.pattern);args.push(s.file);
const env={...process.env};
if(mode==='raw'){const p=join(root,'artifacts/setup020/preparation-resolve-call.json');assert(existsSync(p),'Required genuine setup resolve-call evidence missing');env.ABI5_PREPARATION_RESOLVE_CALL=p;}
const r=spawnSync(process.execPath,args,{cwd:root,env,encoding:'utf8',maxBuffer:16777216});
const stdout=r.stdout??'',stderr=r.stderr??'';process.stdout.write(stdout);process.stderr.write(stderr);
const evidence=join(root,'artifacts/setup020-c2');mkdirSync(evidence,{recursive:true});
writeFileSync(join(evidence,mode+'-stdout.tap'),stdout,{flag:'wx'});writeFileSync(join(evidence,mode+'-stderr.txt'),stderr,{flag:'wx'});
if(r.error)throw r.error;assert.equal(r.signal,null);assert.equal(r.status,0,'Selected test lane failed');
const lines=stdout.split('\n');for(const name of s.required){const line=lines.find(x=>x.startsWith('ok ')&&x.includes(' - '+name));assert(line&&!/# (SKIP|TODO)/iu.test(line),'Required named case did not execute: '+name);}
assert(!/^# fail [1-9]/mu.test(stdout));
console.log(JSON.stringify({kind:'selected_setup_proof_execution',mode,requiredExecuted:s.required,childExit:r.status}));
