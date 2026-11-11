#!/usr/bin/env node
// Single-observation comparison for the amendment witness: one bare model CLI
// invocation on a copy of the same amended seed, with the amendment as its
// prompt, then the same test commands and the same outcome measures as the
// governed Run. Prepared, not run by any test.
//
//   node test_env/uat/amendment-witness-bare-cli.mjs <cli-path> [--out <dir>] [--amendment <name>] [-- <cli args, {prompt} replaced>]
//
// Without <cli-path> it prints this usage and does nothing. The default CLI
// arguments are those of a Claude Code style CLI: -p {prompt} --output-format
// stream-json --verbose. No retry; the first observation is the result.
import {readFile,writeFile,mkdir,mkdtemp,cp,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import * as product from '../../build/code/src/product/index.js';
import {amendmentWitnessInput,witnessFixtureRoot,assessUnderRubric} from '../support/amendment-witness.mjs';

const argv=process.argv.slice(2),dash=argv.indexOf('--'),own=dash<0?argv:argv.slice(0,dash),cliArgs=dash<0?null:argv.slice(dash+1);
const option=name=>{const i=own.indexOf(name);return i<0?undefined:own[i+1];};
const cli=own[0];
if(!cli||cli.startsWith('--')){process.stderr.write('usage: amendment-witness-bare-cli.mjs <cli-path> [--out <dir>] [--amendment approval-threshold] [-- <cli args with {prompt}>]\n');process.exit(2);}
const out=option('--out')??await mkdtemp(join(tmpdir(),'amendment-bare-cli-')),worksite=join(out,'worksite');
await mkdir(out,{recursive:true});
const definition=JSON.parse(await readFile(join(witnessFixtureRoot,'process-definition.json'),'utf8'));
const amendment=JSON.parse(await readFile(join(witnessFixtureRoot,`amendment-${option('--amendment')??'approval-threshold'}.json`),'utf8'));
await cp(join(witnessFixtureRoot,'seed'),worksite,{recursive:true});
const {state,derivation}=await amendmentWitnessInput({processDefinition:definition,amendment,seedRoot:worksite,product});
async function tree(root,prefix=''){const m=new Map();for(const e of await readdir(join(root,prefix),{withFileTypes:true})){const rel=prefix?prefix+'/'+e.name:e.name;
  if(e.isDirectory())for(const [k,v] of await tree(root,rel))m.set(k,v);else if(e.isFile())m.set(rel,product.sha256Bytes(await readFile(join(root,rel))));}return m;}
const initial=await tree(worksite);

const prompt=`${amendment.statement}\n\n${amendment.text}`;
const args=(cliArgs??['-p','{prompt}','--output-format','stream-json','--verbose']).map(a=>a==='{prompt}'?prompt:a);
await writeFile(join(out,'prompt.txt'),prompt);
const started=performance.now();
const r=spawnSync(cli,args,{cwd:worksite,encoding:'utf8',maxBuffer:256*1024*1024,timeout:3_600_000});
const elapsedMs=performance.now()-started;
await writeFile(join(out,'cli-stdout.jsonl'),r.stdout??'');await writeFile(join(out,'cli-stderr.txt'),String(r.stderr??'')+(r.error?'\n'+r.error.message:''));
const stream=(r.stdout??'').split('\n').flatMap(l=>{try{return [JSON.parse(l)];}catch{return [];}}),result=stream.findLast(x=>x.type==='result');
const usage=result?.usage??null;

// The same test commands, then the same outcome facts the governed Run asserts.
const commands=state.original.testing.commands.map(c=>{const x=spawnSync(c.executable,c.args,{cwd:worksite,encoding:'utf8',timeout:c.timeoutMs,env:{PATH:process.env.PATH}});
  return {commandId:c.commandId,exitStatus:x.status,stdoutTail:String(x.stdout).slice(-2000)};});
const final=await tree(worksite);
const changed=[...new Set([...initial.keys(),...final.keys()])].filter(p=>initial.get(p)!==final.get(p)).sort();
const within=(p,roots)=>roots.some(x=>x===p||p.startsWith(x+'/'));
const unrelated=[...derivation.roles['@other.requirements'],...derivation.roles['@other.realization'],...derivation.roles['@other.tests']];
const seedBytes=async p=>product.sha256Bytes(await readFile(join(witnessFixtureRoot,'seed',p)));
const verdict=async(name,assessment)=>{const v=await assessUnderRubric({reviewName:name,rubricText:await readFile(join(worksite,assessment.rubricPath),'utf8'),root:worksite,
  candidatePath:assessment.candidatePath,sources:assessment.sources.map(path=>({path,digest:initial.get(path)??final.get(path)})),producer:{commandResults:commands}}).catch(e=>({disposition:'indeterminate',reason:e.message,unresolvedCriteria:[]}));
  return {disposition:v.disposition,unresolvedCriteria:v.unresolvedCriteria,reason:v.reason};};
const measures={elapsedMs,steps:[{step:'bare-cli',elapsedMs}],cliExit:r.status,costUsd:result?.total_cost_usd??null,
  tokens:usage===null?null:(usage.input_tokens??0)+(usage.output_tokens??0)+(usage.cache_read_input_tokens??0)+(usage.cache_creation_input_tokens??0),usage,
  models:[...new Set(stream.flatMap(x=>[x.model,x.message?.model,...Object.keys(x.modelUsage??{})]).filter(Boolean))],actorCalls:1,
  humanInterventions:0,humanInterventionsBasis:'one non-interactive CLI invocation and no further input',
  tests:commands.map(c=>({commandId:c.commandId,exitStatus:c.exitStatus})),changed,outsideWriteRoots:changed.filter(p=>!within(p,derivation.writeRoots)),
  unrelatedByteIdentical:Object.fromEntries(await Promise.all(unrelated.map(async p=>[p,final.get(p)===await seedBytes(p)]))),
  deterministicChecks:{acceptance:await verdict('acceptance',state.original.assessment),
    ...Object.fromEntries(await Promise.all(state.original.reviews.map(async rv=>[rv.reviewRef,rv.assessment.candidatePath==='design/impact-assessment.md'&&!final.has(rv.assessment.candidatePath)?{disposition:'not_produced'}:await verdict(rv.reviewRef.replace(/^.*\/([^/@]+)@.*$/,'$1'),rv.assessment)])))},
  limits:'One observation; no stages, reviews or prerequisites govern the CLI. Deterministic checks are the stand-in rubric readers, not an independent assessment.'};
await writeFile(join(out,'measures.json'),JSON.stringify(measures,null,2)+'\n');
process.stdout.write(out+'\n');
