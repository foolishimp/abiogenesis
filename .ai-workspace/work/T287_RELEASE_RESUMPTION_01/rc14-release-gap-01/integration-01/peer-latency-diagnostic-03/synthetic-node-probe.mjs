// Synthetic Node-only control probe. No ABI source, helpers or Product imports.
import {execFile,spawn} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile),node=process.execPath;
if(process.argv.includes('--unhandled'))spawn('/abg-diagnostic-deliberately-absent-executable');
else{
 const cases=[];
 const error=e=>({name:e.name,code:e.code??null,signal:e.signal??null,killed:e.killed??null,
  stdout:String(e.stdout??''),stderr:String(e.stderr??'')});
 async function one(name,source,options={}){
  try{const value=await run(node,['-e',source],options);cases.push({name,disposition:'success',...value});}
  catch(e){cases.push({name,disposition:'error',...error(e)});}
 }
 await one('success','process.stdout.write("alpha\\n");process.stderr.write("diagnostic\\n")');
 await one('exit7','process.stdout.write("before-exit\\n");process.stderr.write("original-error\\n");process.exitCode=7');
 await one('timeout','process.stdout.write("before-timeout\\n");setInterval(()=>{},1000)',{timeout:200});
 await one('maxBuffer','process.stdout.write("x".repeat(8192))',{maxBuffer:128});
 try{await run('/abg-diagnostic-deliberately-absent-executable',[]);}catch(e){cases.push({name:'ENOENT',disposition:'error',...error(e)});}
 let callbackCount=0;
 await new Promise(resolve=>execFile(node,['-e','process.stdout.write("callback\\n")'],(err,stdout,stderr)=>{
  callbackCount++;cases.push({name:'callback',error:err?error(err):null,stdout,stderr});resolve();
 }));
 cases.push({name:'callbackCount',callbackCount});
 await new Promise((resolve,reject)=>{
  const child=spawn(node,['-e','setTimeout(()=>process.stdout.write("unconsumed-until-selected\\n"),50)']);
  let stdout='';child.on('error',reject);
  setTimeout(()=>child.stdout.on('data',x=>stdout+=x.toString()),20);
  child.on('close',(code,signal)=>{cases.push({name:'lateConsumer',code,signal,stdout});resolve();});
 });
 process.stdout.write(JSON.stringify(cases)+'\n');
}
