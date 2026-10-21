#!/usr/bin/env node
const {spawnSync}=require('node:child_process');const fs=require('node:fs');let prompt='';
process.stdin.setEncoding('utf8');process.stdin.on('data',chunk=>prompt+=chunk);
process.stdin.on('end',()=>{
fs.writeFileSync("/prospective-evidence/command-prompt.txt",prompt,{flag:'wx'});
fs.writeFileSync("/prospective-evidence/command-process.json",JSON.stringify({pid:process.pid,provider:'controlled-command'}),{flag:'wx'});
const input=JSON.parse(prompt.split('\n\n')[1]);
fs.writeFileSync("/prospective-evidence/command-tool-input.json",JSON.stringify(input),{flag:'wx'});
const tool={type:'tool_use',id:'toolu_c2_ack',name:'Bash',input};
console.log(JSON.stringify({type:'system',subtype:'init',model:'c2-ack-proof'}));
console.log(JSON.stringify({type:'assistant',message:{content:[tool]}}));
const helper=spawnSync('/bin/sh',['-c',input.command],{encoding:'utf8',maxBuffer:4*1024*1024});
fs.writeFileSync("/prospective-evidence/transport-helper-stdout.txt",helper.stdout??'',{flag:'wx'});
fs.writeFileSync("/prospective-evidence/transport-helper-stderr.txt",helper.stderr??'',{flag:'wx'});
fs.writeFileSync("/prospective-evidence/transport-helper.json",JSON.stringify({pid:helper.pid,status:helper.status,signal:helper.signal,error:helper.error?{name:helper.error.name,message:helper.error.message,code:helper.error.code}:null}),{flag:'wx'});
if(helper.status!==0)throw Error(helper.stderr);
fs.writeFileSync("/prospective-scratch/actual-helper-stdout.txt",helper.stdout);
console.log(JSON.stringify({type:'result',subtype:'success',result:helper.stdout.trimEnd()}));
});
