#!/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_G2_GTL_CORE_CANONICAL_SCALAR_CONTINUATION_01/toolchain/bin/node
// Controlled ActorProcess fixture; zero real model/provider calls.
import assert from 'node:assert/strict';
import {readFileSync,appendFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root="/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_INSTALLED_CONSERVATION_SUCCESSOR_01",read=n=>JSON.parse(readFileSync(root+'/'+n,'utf8'));
const binding=read('controlled-binding.json'),raw=read('controlled-raw.json'),chunks=[];
for await(const chunk of process.stdin)chunks.push(chunk);
const bytes=Buffer.concat(chunks);
assert.equal(bytes.length,binding.promptBytes);assert.equal('sha256:'+createHash('sha256').update(bytes).digest('hex'),binding.promptDigest);
appendFileSync(root+'/actor-exchanges.jsonl',JSON.stringify({pid:process.pid,execPath:process.execPath,promptDigest:binding.promptDigest,promptBytes:bytes.length,controlledTransport:true,realProviderCalls:0})+'\n');
console.log(JSON.stringify({type:'system',subtype:'init'}));
console.log(JSON.stringify({type:'result',subtype:'success',is_error:false,result:JSON.stringify(raw),structured_output:raw}));
