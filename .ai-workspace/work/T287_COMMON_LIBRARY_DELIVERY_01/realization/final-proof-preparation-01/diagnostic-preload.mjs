// Only an explicitly granted URL may load this observer. No NODE_OPTIONS route.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import cp from 'node:child_process';
import {registerHooks,syncBuiltinESMExports} from 'node:module';
import {isAbsolute,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createProbes} from './diagnostic-probes.mjs';
const original={read:fs.readFileSync,write:fs.writeFileSync,realpath:fs.realpathSync,hash:crypto.createHash,stringify:JSON.stringify,spawn:cp.ChildProcess.prototype.spawn,hashUpdate:crypto.Hash.prototype.update};
const digest=b=>Reflect.apply(original.hash,crypto,['sha256']).update(b).digest('hex');
const pin=p=>{assert.ok(isAbsolute(p.path));const b=original.read(p.path);assert.equal(digest(b),p.sha256,p.path);return b;};
const url=new URL(import.meta.url),configurationPath=url.searchParams.get('configuration');
assert.ok(configurationPath&&isAbsolute(configurationPath),'explicit diagnostic configuration URL');
const configurationBytes=original.read(configurationPath);
assert.equal(digest(configurationBytes),url.searchParams.get('sha256'));
const c=JSON.parse(configurationBytes);assert.equal(c.kind,'t287_passive_diagnostic_configuration');assert.equal(c.status,'activated');
const grant=JSON.parse(original.read(c.activationFile));assert.equal(grant.status,'granted');
assert.equal(grant.configurationSha256,digest(configurationBytes));assert.equal(grant.nativeCalls,0);
assert.equal(grant.diagnosticRoot,c.diagnosticRoot);assert.equal(process.env.NODE_OPTIONS,undefined);
assert.equal(process.env.ABG_TS_CLAUDE_COMMAND,undefined);assert.equal(process.version,c.node.version);
pin(c.node);assert.equal(original.realpath(process.execPath),original.realpath(c.node.path));
for(const p of [c.preload,c.probes,c.originalRunner,c.originalOracle,c.originalConfiguration,c.originalGrant,c.referenceEndpoint,...c.requiredPins])pin(p);
assert.equal(original.realpath(fileURLToPath(url)),original.realpath(c.preload.path));
assert.ok(['public-preparation','declared-execution'].includes(c.lane));
const inRoot=(root,path)=>{const r=relative(root,path);return r===''||(!r.startsWith('..')&&!isAbsolute(r));};
assert.equal(original.realpath(c.diagnosticRoot),c.diagnosticRoot);
for(const r of c.moduleRoots)assert.ok(isAbsolute(r)&&!r.includes('continuation17'));
const errors=[],loaded=[],launches=[],start={wall:performance.now(),cpu:process.cpuUsage(),memory:process.memoryUsage(),resource:process.resourceUsage()};
const probes=createProbes({observeError:e=>errors.push(String(e))});
globalThis[Symbol.for('t287.passive.diagnostic')]=probes;
const attachment={
  'build/code/src/abg/runtime_history.js':'instrumentHistory(RuntimeHistory,RuntimeHistorySelection,import.meta.url)',
  'build/code/src/abg/event_prefix.js':'instrumentIndex(RuntimeEventIndex,import.meta.url)',
  'build/code/src/shared/canonical_json.js':null
};
registerHooks({load(specifier,context,nextLoad){
  const result=nextLoad(specifier,context);if(!specifier.startsWith('file:'))return result;
  const path=fileURLToPath(specifier),member=Object.keys(attachment).find(x=>path.endsWith('/'+x));if(!member)return result;
  return probes.scope(()=>{
    assert.equal(original.realpath(path),path,'diagnostic module must be canonical physical file');
    assert.ok(c.moduleRoots.some(r=>inRoot(r,path)),'diagnostic module outside declared roots');
    const expected=c.emittedModules.find(x=>x.member===member);assert.ok(expected,'missing emitted-body pin');
    const source=typeof result.source==='string'?result.source:Buffer.from(result.source).toString('utf8');
    assert.equal(digest(Buffer.from(source)),expected.sha256,'actual loaded emitted-body digest');
    assert.equal(digest(original.read(path)),expected.sha256,'on-disk emitted-body digest');
    const suffix=member.endsWith('/canonical_json.js')?'writeCanonicalJson = globalThis[Symbol.for("t287.passive.diagnostic")].canonical(writeCanonicalJson);':
      'globalThis[Symbol.for("t287.passive.diagnostic")].'+attachment[member]+';';
    loaded.push({url:specifier,path,member,sha256:expected.sha256,suffix,originalPrefixUnchanged:true});
    return {...result,source:source+'\n// Explicit diagnostic attachment; original emitted body above is unchanged.\n'+suffix+'\n'};
  });
}});
crypto.Hash.prototype.update=probes.hashUpdate(original.hashUpdate);
JSON.stringify=probes.jsonStringify(original.stringify);
// Successful UTF-8 writeFileSync fast-path bytes are a separate API channel.
fs.writeFileSync=probes.delegate(original.write,args=>{const encoding=typeof args[2]==='string'?args[2]:args[2]?.encoding;
  if(typeof args[1]==='string'&&(encoding===undefined||['utf8','utf-8'].includes(encoding)))probes.record('fs.writeFileSync.successfulUtf8InputBytes',Buffer.byteLength(args[1]));
  else probes.record('fs.writeFileSync.otherSuccessfulCalls',1);
});
const diagnosticFlags=['--trace-event-categories=node.fs.sync,node.fs.async','--trace-event-file-pattern='+join(c.diagnosticRoot,'fs-${pid}-${rotation}.json'),'--import',url.href];
cp.ChildProcess.prototype.spawn=function(options){
  let selected=options,classification='external-uninstrumented';
  const file=options.file;
  if(c.childCommands.some(x=>x.file===file)){
    const command=c.childCommands.find(x=>x.file===file);
    if(command.kind==='node'){selected=options.args.includes(url.href)?options:{...options,args:[options.args[0],...diagnosticFlags,...options.args.slice(1)]};classification='node-preloaded';}
    else if(command.kind==='npm-node-script'){
      probes.scope(()=>pin(command.script));
      selected={...options,file:c.node.path,args:[c.node.path,...diagnosticFlags,command.script.path,...options.args.slice(1)]};classification='npm-explicit-node-preloaded';
    }else throw new Error('unsupported declared diagnostic child edge');
  }
  assert.ok(!/claude|codex/i.test(file),'native provider edge prohibited in deterministic diagnostics');
  const childResult=Reflect.apply(original.spawn,this,[selected]);
  probes.scope(()=>launches.push({pid:this.pid??null,file,args:options.args,effectiveFile:selected.file,effectiveArgs:selected.args,classification,returnValue:childResult}));
  return childResult;
};
syncBuiltinESMExports();
process.once('exit',code=>{probes.scope(()=>{
  const end={wall:performance.now(),cpu:process.cpuUsage(),memory:process.memoryUsage(),resource:process.resourceUsage()};
  const body={kind:'t287_passive_process_observation',pid:process.pid,ppid:process.ppid,argv:process.argv,execArgv:process.execArgv,configurationSha256:url.searchParams.get('sha256'),exitCode:code,
    start,end,wallMs:end.wall-start.wall,cpuUs:{user:end.cpu.user-start.cpu.user,system:end.cpu.system-start.cpu.system},maxRSSKiB:end.resource.maxRSS,
    counters:probes.counts,historyOwners:probes.owners,modules:probes.modules,loaded,launches,probeErrors:errors,
    scope:'This PID after authenticated preload through this exit handler. Later exit handlers are outside its JS snapshot. Parent/child CPU and maxima are separate; memory samples are not heap peaks. Module hashing and observer serialization are excluded from JS counters, but native fs trace includes observer/preflight/evidence IO.',
    exclusions:probes.limits,ownRecordIO:'One synchronous JSON write after this snapshot; exact file bytes are separate observer overhead.'};
  original.write(join(c.diagnosticRoot,'process-'+process.pid+'.json'),original.stringify(body,null,2)+'\n',{flag:'wx'});
});});
