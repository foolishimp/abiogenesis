#!/usr/bin/env python3
"""One offline SBT owner resolution; no application compile, test or run."""
import ast,datetime,hashlib,importlib.util,json,os,re,shutil,subprocess,sys,time
from pathlib import Path
sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
def module(name,filename):
 s=importlib.util.spec_from_file_location(name,HERE/filename);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
freeze=module('exact_freeze','freeze.py');owner=module('finite_owner','process-owner.py')
ACT=freeze.ACT;RAW=freeze.RAW;sha=freeze.sha;write=freeze.write
def pinned(path):
 p=Path(path);return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)}
def verify_frozen(record):
 for item in record['toolInputs']:
  assert sha(item['inventory'])==item['sha256'];rows=json.loads(Path(item['inventory']).read_text())['rows']
  assert freeze.inventory(item['path'])==rows,item['kind']
 for name in ['launcher','repositoryConfig','bootConfig','applicationInputs']:assert sha(record[name]['path'])==record[name]['sha256']
def main():
 proof=RAW/'preflight-01';assert not proof.exists(),'one preflight; no retry'
 proof.mkdir();started=datetime.datetime.now(datetime.timezone.utc);clock=time.monotonic()
 end=clock+ACT['limits']['preflightMs']/1000;stop=end-ACT['limits']['cleanupReserveMs']/1000
 end_utc=started+datetime.timedelta(milliseconds=ACT['limits']['preflightMs'])
 write(proof/'CONTROL_START.json',{'activationId':ACT['id'],'startedUtc':started.isoformat(),'deadlineUtc':end_utc.isoformat(),
  'monotonicStart':clock,'monotonicDeadline':end,'executionStopMonotonic':stop,'cleanupReserveMs':ACT['limits']['cleanupReserveMs'],'oneAttempt':True})
 failure=None;commands=[];graph=[];conserved=False;work=RAW/'work';frozen=RAW/'frozen'
 try:
  record=json.loads((RAW/'FREEZE_RETURN.json').read_text());verify_frozen(record)
  assert not work.exists();work.mkdir()
  for n in ['home','global','ivy','coursier','tmp']: (work/n).mkdir()
  shutil.copytree(frozen/'boot',work/'boot')
  shutil.copytree(frozen/'source/application/scala_spark',work/'application')
  java=frozen/'jdk/bin/java';assert sha(java)==ACT['inputs']['javaSha256']
  profile=['(version 1)','(allow default)','(deny network*)','(deny file-write*)',
   '(allow file-write* (subpath '+json.dumps(str(work))+'))','(allow file-write* (literal "/dev/null"))']
  for name in ['001-java-version','002-sbt-resolution']:
   for stream in ['stdout.raw','stderr.raw']:profile.append('(allow file-write* (literal '+json.dumps(str(proof/name/stream))+'))')
  (proof/'offline.sb').write_text('\n'.join(profile)+'\n')
  env={'HOME':str(work/'home'),'JAVA_HOME':str(frozen/'jdk'),'PATH':str(frozen/'jdk/bin')+':/usr/bin:/bin',
   'TMPDIR':str(work/'tmp'),'LANG':'en_US.UTF-8','LC_ALL':'C','COURSIER_CACHE':str(work/'coursier'),
   'COURSIER_REPOSITORIES':(frozen/'maven2').as_uri()+'/','SBT_NATIVE_CLIENT':'false','SBT_SERVER_AUTOSTART':'false'}
  java_options=['-Xmx2g','-Duser.home='+str(work/'home'),'-Djava.io.tmpdir='+str(work/'tmp'),'-Djava.awt.headless=true',
   '-Dsbt.boot.directory='+str(work/'boot'),'-Dsbt.global.base='+str(work/'global'),'-Dsbt.ivy.home='+str(work/'ivy'),
   '-Dsbt.coursier.home='+str(work/'coursier'),'-Dcoursier.cache='+str(work/'coursier'),
   '-Dsbt.boot.properties='+(frozen/'sbt.boot.properties').as_uri(),'-Dsbt.repository.config='+str(frozen/'repositories'),
   '-Dsbt.override.build.repos=true','-Dsbt.server.autostart=false','-Dsbt.client=false','-Dsbt.io.virtual=false',
   '-Dsbt.supershell=false','-Dsbt.color=false','-Dsbt.log.noformat=true','-Dsbt.ci=true','-Dsbt.version=1.11.7']
  base=['/usr/bin/sandbox-exec','-f',str(proof/'offline.sb'),str(java),*java_options]
  queries=['projects','show scalaVersion','show sbtVersion','show update','show Compile / externalDependencyClasspath',
   'show Test / externalDependencyClasspath','show scalaInstance','show scalaCompilerBridgeSource','show scalaCompilerBridgeBinaryJar','exit']
  write(proof/'EXECUTION.json',{'environment':env,'versionArgv':[*base,'-version'],
   'resolutionArgv':[*base,'-jar',str(frozen/'sbt-launch.jar'),*queries],'cwd':str(work/'application'),
   'sandbox':pinned(proof/'offline.sb'),'repository':pinned(frozen/'repositories'),'bootProperties':pinned(frozen/'sbt.boot.properties'),
   'queryMeaning':'SBT build-definition loading and managed external dependency/compiler classpaths only; no application compile/fullClasspath/test/run',
   'offlineMeaning':'Only frozen file repository; all network denied. No cached-report-only shortcut replaces fresh dependency resolution.'})
  for name,argv in [('001-java-version',[*base,'-version']),('002-sbt-resolution',[*base,'-jar',str(frozen/'sbt-launch.jar'),*queries])]:
   assert time.monotonic()<stop and shutil.disk_usage(RAW).free>ACT['limits']['reserveBytes']
   print(json.dumps({'starting':name,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}),flush=True)
   receipt=owner.run(proof/name,argv,work/'application',env,max(.001,stop-time.monotonic()),ACT['limits']['maxCaptureBytesPerCommand'],stop)
   commands.append({'name':name,'receipt':receipt})
   print(json.dumps({'closed':name,'exitCode':receipt['exitCode'],'elapsedMs':receipt['elapsedMs']}),flush=True)
   output=(proof/name/'stdout.raw').read_text(errors='replace')+(proof/name/'stderr.raw').read_text(errors='replace')
   assert not re.search(r'(?:downloading|download error|trying|fetching)\s+https?://|(?:network|socket).*(?:denied|prohibited)|UnknownHostException|ConnectException',output,re.I),'network acquisition attempt/error observed'
  # Preserve owner-produced update reports; no reconstructed Maven resolver.
  for p in sorted((work/'application').rglob('*')):
   if p.is_file() and ('update' in p.parts or any(x.startswith('update_cache') for x in p.parts)):
    graph.append(pinned(p))
  write(proof/'OWNER_GRAPH_FILES.json',{'files':graph,'authority':'Actual SBT update outputs; no custom dependency resolution'})
  text=(proof/'002-sbt-resolution/stdout.raw').read_text(errors='replace')
  paths=set(re.findall(r'Attributed\(([^\n\r()]+\.jar)\)',text))
  selected=[]
  for s in sorted(paths):
   p=Path(s);assert p.is_file() and (p.is_relative_to(frozen) or p.is_relative_to(work)),s
   selected.append(pinned(p))
  write(proof/'RESOLVED_CLASSPATH.json',{'files':selected,'basis':'SBT show externalDependencyClasspath output; graph reports retained separately','applicationCompiled':False})
  assert selected and graph,'owner graph/classpath evidence absent; no closure claim'
 except BaseException as error:
  failure={'name':type(error).__name__,'message':str(error)}
  write(proof/'FIRST_FAILURE.json',failure)
 finally:
  try:
   record=json.loads((RAW/'FREEZE_RETURN.json').read_text());verify_frozen(record)
   inputs=json.loads(Path(record['applicationInputs']['path']).read_text())['rows']
   for r in inputs:
    assert sha(r['path'])==r['sha256'];assert sha(frozen/'source'/r['relativePath'])==r['sha256']
    if work.exists():assert sha(work/r['relativePath'].replace('application/scala_spark/','application/',1))==r['sha256']
   for item in record['toolInputs']:
    inv=json.loads(Path(item['inventory']).read_text());source=Path(inv['source'])
    for r in inv['rows']:
     p=source/r['path']
     if r['kind']=='file':assert p.stat().st_size==r['bytes'] and sha(p)==r['sha256']
     else:assert os.readlink(p)==r['target']
   assert sha(ACT['inputs']['launcher'])==ACT['inputs']['launcherSha256'];conserved=True
  except BaseException as error:failure=failure or {'name':type(error).__name__,'message':'conservation: '+str(error)}
  actual=[]
  for name in ['001-java-version','002-sbt-resolution']:
   p=proof/name/'RETURN.json'
   if p.exists():actual.append({'name':name,'receipt':json.loads(p.read_text())})
  completed=datetime.datetime.now(datetime.timezone.utc);within=time.monotonic()<end and completed<end_utc
  if not within:failure=failure or {'name':'DeadlineExceeded','message':'Original 15-minute preflight, including conservation/cleanup, expired'}
  logs='\n'.join(p.read_text(errors='replace') for p in proof.glob('*/std*.raw'))
  missing=[line for line in logs.splitlines() if re.search(r'not found|notfound|unresolved|ResolveException|ResolutionError|download error',line,re.I)]
  result={'activationId':ACT['id'],'disposition':'offline_resolution_completed' if failure is None and conserved and len(actual)==2 else 'stopped_unresolved',
   'failure':failure,'commands':actual,'completedUtc':completed.isoformat(),'deadlineUtc':end_utc.isoformat(),'withinDeadline':within,
   'originalAndFrozenInputsConserved':conserved,'observedMissingDiagnostics':missing,'sourceBuildDefinitionChanged':False,'applicationCompileTestRun':False,
   'providerOrABG':False,'networkPermission':'All network denied by exact sandbox profile; file repository only; no Spark loopback exercised',
   'limits':['Acquisition superset is not the selected dependency graph','Build-definition compilation is SBT startup work, not application compilation',
    'Compiler-bridge selection and dependency resolution do not prove future application compilation, five-minute C2 capacity or application acceptance',
    'Process-group closure only; no universal unrelated-process absence claim']}
  write(proof/'RETURN.json',result);print(json.dumps({'disposition':result['disposition'],'failure':failure,'conserved':conserved,'withinDeadline':within,'commands':len(actual)}),flush=True)
 return 0 if result['disposition']=='offline_resolution_completed' else 1
if __name__=='__main__':raise SystemExit(main())
