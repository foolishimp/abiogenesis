#!/usr/bin/env node
// Controlled process/protocol fixture only. It never writes runtime events or
// supplies observations, grants, admission, currentness, assessment or app proof.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,readdir,realpath,writeFile} from 'node:fs/promises';
import {isAbsolute,join,resolve} from 'node:path';
const args=process.argv.slice(2);
const argument=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
const mode=argument('--fixture-mode');
if(mode==='owned-residue-child'){
  process.on('SIGTERM',()=>{});
  setInterval(()=>{},1000);
  // A local safety bound, never ABG liveness or termination evidence.
  setTimeout(()=>process.exit(0),30000);
}else{
  assert(['r01-leader-exit','r02-channel-conflict'].includes(mode),'explicit finite fixture mode required');
  const chunks=[];for await(const b of process.stdin)chunks.push(Buffer.from(b));
  const suppliedPrompt=Buffer.concat(chunks);assert(suppliedPrompt.length>0);
  const result=report=>({type:'result',subtype:'success',is_error:false,structured_output:report});
  if(mode==='r01-leader-exit'){
    const child=spawn(process.execPath,[process.argv[1],'--fixture-mode','owned-residue-child'],
      {cwd:process.cwd(),env:process.env,detached:false,stdio:'ignore'});
    await new Promise((resolveStarted,reject)=>{child.once('spawn',resolveStarted);child.once('error',reject);});
    process.stderr.write(`FIXTURE_ONLY owned-group-descendant-pid=${child.pid}\n`);
    process.stdout.write(JSON.stringify(result({summary:'Controlled leader returned with an owned same-group descendant.',gaps:[]}))+'\n');
    process.exit(0);
  }
  const archiveArgument=argument('--fixture-archive-root');assert(isAbsolute(archiveArgument??''));
  const archiveRoot=await realpath(archiveArgument);assert.equal(archiveRoot,resolve(archiveArgument));
  // The ordinary Claude profile passes the real prompt on stdin but has no
  // output-path argv. Match one exact owner-written prompt within the supplied
  // Binding archive root. Derive only its already-selected companion output
  // asset; never infer actor/task/admission identity or inspect the event log.
  const matches=[];
  for(const name of await readdir(archiveRoot)){
    if(!/^fp-[0-9a-f]{16}-prompt\.txt$/u.test(name))continue;
    if((await readFile(join(archiveRoot,name))).equals(suppliedPrompt))matches.push(name);
  }
  assert.equal(matches.length,1,'one exact current owner prompt asset required');
  const output=join(archiveRoot,matches[0].slice(0,-'-prompt.txt'.length)+'-output.txt');
  await writeFile(join(process.cwd(),'target-a.txt'),'controlled partial native edit\n');
  await writeFile(output,JSON.stringify({summary:'Controlled file-channel report.',gaps:[]})+'\n');
  process.stdout.write(JSON.stringify(result({summary:'Controlled unequal stream-channel report.',gaps:[]}))+'\n');
  process.exit(0);
}
