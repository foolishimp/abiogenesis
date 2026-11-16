// Standard-library mocks execute only the exact observer wrapper body.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {compileFunction} from 'node:vm';

const dir=dirname(fileURLToPath(import.meta.url));
const host=readFileSync(join(dir,'HOST.mjs'),'utf8');
const begin=host.indexOf('async function observeTopology(');
const end=host.indexOf('\nconst installed=',begin);
assert(begin>0&&end>begin);
const factory=compileFunction(host.slice(begin,end)+'\nreturn observeTopology;',
  ['execFile','record','assert','process','Buffer','dir','join','JSON']);
const cases=[];
const layout={worksite:'/mock/worksite',writePaths:['/mock/worksite/file'],protectedRoots:['/mock/protected'],archiveRoot:'/mock/archive'};

async function check(name,{stdout='{"ok":true,"disposition":"separated"}',stderr='observer stderr',childError=null,inputError=null,status=0,signal=null,captureNames=[],expect='success',allCaptureFail=false,stderrWriteFails=false}={}){
  const records=new Map(),order=[],stderrWrites=[];
  const captureError=new Error('mock capture failure');
  let actualInput=null,parseError=null,assertionError=null;
  const execFile=(command,args,options,callback)=>{
    assert.equal(command,'/usr/bin/python3');
    assert.deepEqual(args,[join(dir,'physical-topology.py'),'-']);
    assert.equal(options.timeout,60000);assert.equal(options.maxBuffer,4*1024*1024);
    let onInputError;
    const child={exitCode:status,signalCode:signal,stdin:{on(event,handler){assert.equal(event,'error');onInputError=handler;},end(bytes){actualInput=bytes;if(inputError)onInputError(inputError);queueMicrotask(()=>callback(childError,Buffer.from(stdout),Buffer.from(stderr)));}}};
    return child;
  };
  const record=async(path,value,raw)=>{
    order.push('record:'+path);
    if(allCaptureFail||captureNames.some(n=>path.endsWith('/'+n)))throw captureError;
    records.set(path,{value,raw});
  };
  const json={stringify:JSON.stringify,parse(value){order.push('parse');try{return JSON.parse(value);}catch(error){parseError=error;throw error;}}};
  const assertions={equal(...args){order.push('assert');try{return assert.equal(...args);}catch(error){assertionError=error;throw error;}}};
  const observe=factory(execFile,record,assertions,{stderr:{write(value){if(stderrWriteFails)throw new Error('mock host stderr failure');stderrWrites.push(value);}}},Buffer,dir,join,json);
  let returned=null,thrown=null;
  try{returned=await observe('mock-boundary',layout);}catch(error){thrown=error;}
  const prefix='topology-observations/mock-boundary/';
  assert.deepEqual(actualInput,Buffer.from(JSON.stringify(layout)));
  if(!allCaptureFail&&!captureNames.includes('input.raw'))assert.deepEqual(records.get(prefix+'input.raw').value,actualInput);
  if(!allCaptureFail&&!captureNames.includes('stdout.raw'))assert.deepEqual(records.get(prefix+'stdout.raw').value,Buffer.from(stdout));
  if(!allCaptureFail&&!captureNames.includes('stderr.raw'))assert.deepEqual(records.get(prefix+'stderr.raw').value,Buffer.from(stderr));
  if(!allCaptureFail&&!captureNames.includes('execution.json')){
    const facts=records.get(prefix+'execution.json').value;
    assert.equal(facts.status,status);assert.equal(facts.signal,signal);
    assert.equal(facts.error?.message??null,childError?.message??null);
  }
  const firstParse=order.indexOf('parse');
  if(firstParse>=0)assert(order.slice(0,firstParse).filter(x=>x.startsWith('record:')).length===4);
  if(expect==='success'){assert.equal(thrown,null);assert.equal(returned.disposition,'separated');}
  else if(expect==='child')assert.strictEqual(thrown,childError);
  else if(expect==='input')assert.strictEqual(thrown,inputError);
  else if(expect==='parse'){assert(thrown instanceof SyntaxError);assert.strictEqual(thrown,parseError);}
  else if(expect==='assert'){assert(thrown instanceof assert.AssertionError);assert.strictEqual(thrown,assertionError);}
  else if(expect==='capture')assert.strictEqual(thrown,captureError);
  else throw new Error('unknown expectation');
  if((captureNames.length||allCaptureFail)&&!stderrWriteFails){
    assert(stderrWrites.length>0);
    assert.equal(JSON.parse(stderrWrites[0]).kind,'topology_capture_failures');
    assert(stderrWrites[0].includes(captureError.message));
    if(allCaptureFail)assert(stderrWrites.some(x=>JSON.parse(x).kind==='topology_capture_failure_record_error'));
  }
  if(stderrWriteFails)assert(records.get(prefix+'capture-failures.json').value.failures.some(x=>x.name==='host-stderr'));
  cases.push({name,passed:true,recordsRetained:records.size,secondaryStderrRecords:stderrWrites.length});
}

await check('successful_observation_retains_all_actual_streams_before_parse_assert');
const nonzero=Object.assign(new Error('original nonzero child'),{code:2,signal:null,killed:false});
await check('nonzero_child_preserves_original_error_and_all_output',{childError:nonzero,status:2,stdout:'{"ok":false}',expect:'child'});
await check('signal_child_retains_actual_status_signal',{childError:Object.assign(new Error('original signalled child'),{code:null,signal:'SIGTERM',killed:true}),status:null,signal:'SIGTERM',expect:'child'});
await check('parse_error_retains_actual_raw_output',{stdout:'{invalid',expect:'parse'});
await check('child_primary_survives_secondary_capture_error',{childError:nonzero,status:2,captureNames:['stdout.raw'],expect:'child'});
await check('parse_primary_survives_secondary_capture_error',{stdout:'{invalid',captureNames:['stdout.raw'],expect:'parse'});
await check('capture_only_error_fails',{captureNames:['stdout.raw'],expect:'capture'});
await check('separation_assertion_survives_secondary_capture_error',{stdout:'{"ok":false,"disposition":"indeterminate","reason":"mock refusal"}',captureNames:['stdout.raw'],expect:'assert'});
await check('all_capture_failures_keep_original_child_and_separate_stderr',{childError:nonzero,status:2,allCaptureFail:true,expect:'child'});
await check('host_stderr_failure_cannot_replace_original_child',{childError:nonzero,status:2,captureNames:['stdout.raw'],stderrWriteFails:true,expect:'child'});
await check('input_stream_error_is_original_primary',{inputError:new Error('original stdin error'),expect:'input'});
console.log(JSON.stringify({cases,limits:'Only the exact HOST observer-wrapper body with standard-library in-memory mocks. No physical observer, Product import, setup, provider, native call, real filesystem capture or physical separation claim.'}));
