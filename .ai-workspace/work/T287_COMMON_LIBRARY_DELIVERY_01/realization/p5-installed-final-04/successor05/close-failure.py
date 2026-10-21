from pathlib import Path
import os,json,hashlib,stat,shutil,datetime
N=Path(__file__).resolve().parent;D=N.parent;W=D.parent.parent;X=Path('/private/tmp/abg-stdo3-p5-05-7ca935e280b14df6');E=X/'evidence';env=json.loads((E/'environment.json').read_text());scratch=Path(env['scratch'])
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def dump(name,x):
 with (N/name).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
archive=N/'archive';archive.mkdir();pairs=[]
for src in sorted(E.rglob('*')):
 if src.is_file():
  dst=archive/'test-evidence'/src.relative_to(E);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);assert pin(src)['sha256']==pin(dst)['sha256'];pairs.append({'original':pin(src),'copy':pin(dst)})
for base,dirs,files in os.walk(scratch):
 dirs[:]=[d for d in dirs if d not in ['consumer','node_modules']]
 for name in files:
  src=Path(base)/name;dst=archive/'scratch-evidence'/src.relative_to(scratch);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);assert pin(src)['sha256']==pin(dst)['sha256'];pairs.append({'original':pin(src),'copy':pin(dst)})
dump('portable-evidence-correspondence.json',{'pairs':pairs,'copies':len(pairs),'allBytesExact':True,'scope':'Original evidence, process archives, fixture executable and durable log, excluding installed package copies; original roots retained'})
rows=[];total=0
for p in [X,*sorted(X.rglob('*'))]:
 s=p.lstat();row={'path':str(p),'kind':'symlink' if p.is_symlink() else 'directory' if p.is_dir() else 'file','mode':oct(stat.S_IMODE(s.st_mode)),'device':s.st_dev,'inode':s.st_ino}
 if p.is_symlink():row['target']=os.readlink(p)
 elif p.is_file():row.update(pin(p));total+=row['bytes']
 rows.append(row)
dump('retained-physical-inventory.json',{'root':str(X),'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'nodes':rows,'regularFileBytes':total,'retained':True,'cleanup':False})
checks=[]
for row in json.loads((N/'preexecution-freeze.json').read_text())['files']:
 p=N/row['path'];v=pin(p);assert v['bytes']==row['bytes'] and v['sha256']==row['sha256'];checks.append(str(p))
requirements=json.loads((D.parent/'p5-installed-preparation-01/emitted-source-requirements.json').read_text());owners=[]
for r in requirements['requiredE03Correspondence']:
 p=Path(env['installedRoot'])/r['emitted']['path'];v=pin(p);assert v['bytes']==r['emitted']['bytes'] and v['sha256']==r['emitted']['sha256'];owners.append(v)
dump('post-preservation.json',{'frozenPreexecutionFilesExact':len(checks),'actualInstalledConsumerE03EmittedOwners':owners,'mainAndStageNotReacquired':'Original exact readiness reused; no main/build/dependency/stage write was selected or performed.','priorStopClosureFreeze':pin(D/'install-stop-closure-freeze.json'),'proofPackageRootUnchanged':True})
c1=json.loads((E/'source-completion.json').read_text());events=json.loads((E/'source-events.json').read_text());transport=next(e for e in events if e['kind']=='actor_result_artifact_observed');cleanup=json.loads((E/'cleanup.json').read_text());outer=json.loads((N/'commands/test.completion.json').read_text());failure=json.loads((E/'failure.json').read_text())
result={'activation':'P5-INSTALL-CONFIG-05','status':'STOPPED at first C1 failure; no C2/HTTP/replay credit','firstAssertion':{'file':'t287-worksite-command-execution.test.mjs','line':522,'phase':failure['phase'],'expected':'closed','actual':c1['disposition']},'sourceCompletion':{k:c1[k] for k in ['cCallRef','resultRef','judgmentRef','diagnosticRef','resultValue']},'admittedRuntime':{'status':c1['replayState']['runtimeStatus'],'eventCount':len(events),'prefix':c1['successorPrefix']},'observedTransport':transport['payload'],'testHost':outer,'cleanup':{'deferredCleanupHookCount':cleanup['deferredCleanupHookCount'],'deferredCleanupHooksInvoked':cleanup['deferredCleanupHooksInvoked'],'originalStoreCloseAttempted':cleanup['originalStoreCloseAttempted'],'closeError':cleanup['closeError'],'replayStoreCloseAttempted':cleanup['replayStoreCloseAttempted']},'notReached':['C2 DefinitionCall','C2 command helper','HTTP probe','two fresh replay children','owner-local negatives','N2 child/result PID equality'],'actualRuns':{'offlineInstall':1,'selectedTest':1,'controlledConstruction':1,'C2':0,'HTTP':0,'freshReplay':0},'physicalInventory':pin(N/'retained-physical-inventory.json'),'preservedPortableFiles':len(pairs),'newRootRegularBytes':total,'allRootsRetained':True,'noRetry':True,'productionDefectEstablished':False}
dump('result.json',result)
with (N/'report.md').open('x') as f:f.write(f'''# P5 config05 stopped at C1

The single offline install succeeded on final06 archive25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079; all5271 host member bytes/membership matched, with only the two declared executable mode normalizations. The original exact selected P5 test then ran once and failed at line522: C1 disposition was failed, expected closed. No C2 DefinitionCall, command helper, HTTP, fresh replay, negative population or N2 PID equality ran.

Actual ABG history has42 events and admits a worksite_construction_failure with result_contract_failure and its declared diagnostic. The upstream transport artifact records no_output, finalOutput empty, stdout1621B/two structured events, normal process exit0/no signal/no timeout and confirmed termination. The raw request/schema in transport args, prompt, output/stdout/stderr archives, generated controlled fixture, admitted failure and durable log are retained exactly. These observations localize a candidate/transport boundary; no production defect is established by this return.

Test host20133/group20133 exited1 after297125.453125ms with actual close, absent owned scope, streams disposed, no firstError or timeout. Test child20135, supervisor20131 and construction PID/group23186 were independently absent. The construction owner reports normal exit0 and confirmed termination separately from failed result admission. The setup's one deferred deletion hook was never invoked; the held original store was closed without error. Every root remains retained. There was no runtime retry, cleanup, source mutation, real provider call or historical Run activity.

This closure archives{len(pairs)} raw evidence files exactly and inventories{len(rows)} physical nodes/{total} regular-file bytes. Preexecution41 records and actual installed-consumer six E03 emitted owners remain exact. Main/final-stage readiness is reused by the existing exact inventory relation rather than a repeated whole acquisition. Prior final04 failures and compile-cache residue remain preserved. Product/L2/qualification acceptance is not claimed. Root has separately selected read-only C1 contract triage after this failure cut closes.
''')
files=[]
for p in sorted(N.rglob('*')):
 if p.is_file() and not p.is_symlink():
  q=pin(p);q['path']=str(p.relative_to(N));files.append(q)
external=[{k:r[k] for k in ['path','bytes','sha256']} for r in rows if r['kind']=='file']
copybytes=sum(r['bytes'] for r in files);assert total+copybytes+249941<3*1024**3
f=N/'failure-freeze.json';f.write_text(json.dumps({'activation':'P5-INSTALL-CONFIG-05','closedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'STOPPED at actual C1 failure; no retry','files':files,'externalFiles':external,'priorClosedStop':pin(D/'install-stop-closure-freeze.json'),'physicalRoot':str(X),'newRootRegularFileBytes':total,'recordBytesExcludingFreeze':copybytes,'resourceCapBytes':3*1024**3,'noLaterRuntimeAuthorizedByThisFreeze':True},indent=2)+'\n');print(json.dumps({**pin(f),'records':len(files),'externalPins':len(external),'physicalBytes':total,'copies':len(pairs)}))
