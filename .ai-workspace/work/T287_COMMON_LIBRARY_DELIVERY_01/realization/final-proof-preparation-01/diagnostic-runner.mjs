#!/usr/bin/env node
// Executes only a separately activated deterministic diagnostic repetition.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {isAbsolute,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=p=>{assert.ok(isAbsolute(p.path));const b=fs.readFileSync(p.path);assert.equal(sha(b),p.sha256,p.path);return b;};
assert.equal(process.argv.length,3,'node diagnostic-runner.mjs ABSOLUTE_CONFIG');
const configPath=process.argv[2],bytes=fs.readFileSync(configPath),c=JSON.parse(bytes);
assert.equal(c.kind,'t287_passive_diagnostic_configuration');assert.equal(c.status,'activated');
const g=JSON.parse(fs.readFileSync(c.activationFile));assert.equal(g.status,'granted');assert.equal(g.configurationSha256,sha(bytes));
assert.equal(g.launcherSha256,sha(fs.readFileSync(fileURLToPath(import.meta.url))));
assert.equal(g.nativeCalls,0);assert.equal(g.diagnosticRoot,c.diagnosticRoot);
assert.ok(['public-preparation','declared-execution'].includes(c.lane));
for(const p of [c.node,c.preload,c.probes,c.originalRunner,c.originalOracle,c.originalConfiguration,c.originalGrant,c.referenceEndpoint,...c.requiredPins])pin(p);
const endpoint=JSON.parse(pin(c.referenceEndpoint));assert.equal(endpoint.status,'satisfied');assert.equal(endpoint.subjectId,c.subjectId);assert.equal(endpoint.lane,c.lane);
const actual=JSON.parse(pin(c.originalConfiguration)),originalGrant=JSON.parse(pin(c.originalGrant));
assert.equal(actual.status,'activated');assert.equal(actual.subject.id,c.subjectId);assert.equal(originalGrant.configurationSha256,c.originalConfiguration.sha256);
assert.equal(actual.activationFile,c.originalGrant.path);assert.equal(actual.environment.NODE_OPTIONS,undefined);assert.equal(actual.environment.ABG_TS_CLAUDE_COMMAND,undefined);
assert.deepEqual(originalGrant.lanes,[c.lane]);assert.equal(originalGrant.maxNativePositiveCalls,0);
assert.deepEqual(g.runtimeRoots,actual.lanes[c.lane].roots);
for(const root of [c.diagnosticRoot,...Object.values(g.runtimeRoots)]){assert.ok(isAbsolute(root)&&root.startsWith('/private/tmp/')&&!/continuation17/i.test(root));assert.equal(fs.existsSync(root),false,'new resource root');}
assert.equal(new Set(c.emittedModules.map(x=>x.member)).size,3);assert.equal(c.emittedModules.length,3);
for(const x of c.emittedModules)assert.match(x.sha256,/^[a-f0-9]{64}$/u);
fs.mkdirSync(c.diagnosticRoot,{recursive:true});assert.equal(fs.realpathSync(c.diagnosticRoot),c.diagnosticRoot);
const record=(name,value)=>fs.writeFileSync(join(c.diagnosticRoot,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
const preload=pathToFileURL(c.preload.path);preload.searchParams.set('configuration',configPath);preload.searchParams.set('sha256',sha(bytes));
const argv=['-l',c.node.path,'--trace-event-categories=node.fs.sync,node.fs.async',
  '--trace-event-file-pattern='+join(c.diagnosticRoot,'fs-${pid}-${rotation}.json'),'--import',preload.href,
  c.originalRunner.path,'--configuration',c.originalConfiguration.path,'--lane',c.lane];
record('activation.json',{configurationSha256:sha(bytes),originalConfiguration:c.originalConfiguration,originalRunner:c.originalRunner,originalOracle:c.originalOracle,
  command:'/usr/bin/time',argv,cwd:c.diagnosticRoot,environment:actual.environment,diagnostic:true,nativeCalls:0,
  limits:'Original runner preflight remains unchanged and is executed. This separate grant authorizes only explicit observer flags/child edges. No semantic acceptance or timing threshold.'});
const stdout=fs.openSync(join(c.diagnosticRoot,'execution.stdout'),'wx'),stderr=fs.openSync(join(c.diagnosticRoot,'execution.stderr'),'wx');
const start={wall:performance.now(),cpu:process.cpuUsage(),memory:process.memoryUsage(),resource:process.resourceUsage()};
let child,outcome;
try{child=spawn('/usr/bin/time',argv,{cwd:c.diagnosticRoot,env:actual.environment,stdio:['ignore',stdout,stderr]});const [exitCode,signal]=await once(child,'exit');outcome={exitCode,signal,pid:child.pid};}
catch(error){outcome={exitCode:null,signal:null,pid:child?.pid??null,error:{name:error.name,message:error.message,code:error.code??null}};}
finally{fs.closeSync(stdout);fs.closeSync(stderr);}
record('execution.json',{...outcome,start,end:{wall:performance.now(),cpu:process.cpuUsage(),memory:process.memoryUsage(),resource:process.resourceUsage()},
  scope:'launcher PID only; time -l raw stderr labels measured child; diagnostic process records separately identify each Node PID',retention:'No retry or cleanup'});
if(outcome.exitCode!==0||outcome.signal!==null||outcome.error)process.exitCode=1;
