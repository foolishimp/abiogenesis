// Root-only one-shot direct arm; existing commandRecorder owns process capture.
import assert from 'node:assert/strict';
import {readFile,lstat,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const D=dirname(fileURLToPath(import.meta.url)),hash=b=>createHash('sha256').update(b).digest('hex');
const configBytes=await readFile(join(D,'DIRECT_CONFIG.DRAFT.json'));
assert.equal(process.argv[2],hash(configBytes),'Root must select exact reviewed direct configuration');
const c=JSON.parse(configBytes),pins=JSON.parse(await readFile(join(D,'INPUT_PINS.json'),'utf8'));
const check=async r=>{const b=await readFile(r.path);assert.equal(b.length,r.bytes);assert.equal(hash(b),r.sha256,r.path);return b;};
await check(c.providerExecutable);const prompt=(await check(c.prompt)).toString('utf8');
for(const r of pins.runnerAndCallerPins)await check(r);
const st=await lstat(c.proposedCwd);assert(st.isDirectory()&&!st.isSymbolicLink());
for(const r of pins.initialApplicationFiles){const b=await readFile(join(c.proposedCwd,r.path));assert.equal(hash(b),r.source.sha256,r.path);}
for(const rel of pins.allowedOutputs)await lstat(join(c.proposedCwd,rel)).then(()=>{throw Error('Solved output already present: '+rel);},e=>{if(e.code!=='ENOENT')throw e;});
for(let root=c.proposedCwd;;root=dirname(root)){
 for(const rel of ['AGENTS.md','CLAUDE.md','.claude/CLAUDE.md','.claude/settings.json','.claude/settings.local.json','.git'])await lstat(join(root,rel)).then(()=>{throw Error('Unexpected inherited project instruction/repository path: '+join(root,rel));},e=>{if(e.code!=='ENOENT')throw e;});
 if(root===dirname(root))break;
}
const environment=Object.fromEntries(c.environment.inheritKeys.filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));Object.assign(environment,c.environment.literal);assert(environment.CLAUDE_CODE_OAUTH_TOKEN,'Normal provider credential must be supplied by Root');
for(const prefix of c.environment.excludedPrefixes)assert(!Object.keys(environment).some(k=>k.startsWith(prefix)));
const args=c.args.map(a=>a==='<EXACT_DIRECT_PROMPT_ARGUMENT>'?prompt:a);
const output=join(D,'direct-run');await mkdir(output); // exclusive absence; no automatic retry
const runner=pins.runnerAndCallerPins.find(r=>r.path.endsWith('/test_env/uat/runner.mjs'));assert(runner);
const {commandRecorder}=await import(pathToFileURL(runner.path).href);
const command=commandRecorder(output,{environment,timeoutMs:c.absoluteTimeoutMs,maxOutputBytes:536870912});
const result=await command('direct-agent',c.providerExecutable.path,args,{cwd:c.proposedCwd,environment,timeoutMs:c.absoluteTimeoutMs});
await writeFile(join(output,'DIRECT_RETURN.json'),JSON.stringify({exitCode:result.exitCode,signal:result.signal,wallMs:result.wallMs,timedOut:result.timedOut,truncated:result.truncated,failure:result.failure,externalAcceptance:'PENDING independent exact CLI/node:test/content checks; host exit is not acceptance'},null,2)+'\n',{flag:'wx'});
process.exitCode=result.exitCode===0&&!result.timedOut&&!result.failure?0:1;
