from pathlib import Path
import json, hashlib, subprocess, os, shutil, shlex
P=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01'); N=P/'native-b01'; O=P/'native-04'; F=Path('/private/tmp/abg-rc11-foundation-20261110-01')
NODE='/opt/homebrew/Cellar/node/24.7.0/bin/node'; env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def pin(p):
 p=Path(p); b=p.read_bytes(); return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def write(p,v):
 with p.open('xb') as h:h.write((json.dumps(v,indent=2)+'\n').encode())
checks=[]
def pins(v):
 if isinstance(v,dict):
  if {'path','bytes','sha256'}<=v.keys():
   actual=pin(v['path']);assert actual['bytes']==v['bytes'] and actual['sha256']==v['sha256'],v['path'];checks.append(v['path'])
  for x in v.values():pins(x)
 elif isinstance(v,list):
  for x in v:pins(x)
b=json.loads((N/'BINDING.json').read_text()); task=json.loads((N/'TASK.json').read_text()); g=json.loads((N/'PRESERVATION_GUARDS.json').read_text()); prep=json.loads((N/'PREPARATION.json').read_text());subject=json.loads((N/'SOURCE_SUBJECT.json').read_text())
for v in [b,g,subject,json.loads((N/'ROOT_SCOPE.json').read_text())]:pins(v)
for root,head in g['heads'].items():assert subprocess.check_output(['/usr/bin/git','-C',root,'rev-parse','HEAD'],env=env,text=True).strip()==head
source=json.loads(Path(b['sourceInventory']['path']).read_text())
for row in source['rows']:
 actual=pin(F/row['path']);assert actual['bytes']==row['bytes'] and actual['sha256']==row['sha256'],row['path']
assert not (F/subject['optionalNewPath']['path']).exists()
assert not subprocess.check_output(['/usr/bin/git','-C',str(F),'status','--porcelain=v1','--untracked-files=no'],env=env)
assert not subprocess.check_output(['/usr/bin/git','-C',str(F),'diff','--cached','--name-only'],env=env)
prior=set(Path(g['excludedUntrackedPreimage']['receipt']['path']).read_bytes().split(b'\0'))-{b''}
now=set(subprocess.check_output(['/usr/bin/git','-C',str(F),'ls-files','--others','--exclude-standard','-z'],env=env).split(b'\0'))-{b''}
assert prior<=now
added=sorted(x.decode() for x in now-prior); assert all(x.startswith('qualification-inputs/rc11-effect-phase2-01/native-b01/') for x in added),added
for argv in [[NODE,'--check',str(N/'host.mjs')],['/bin/sh','-n',str(N/'claude-provider.sh')]]:
 result=subprocess.run(argv,capture_output=True,text=True,timeout=15);assert result.returncode==0,result.stderr
code="import {readFile} from 'node:fs/promises'; import {validateTransport} from "+json.dumps((N/'transport-preflight.mjs').as_uri())+"; const binding=JSON.parse(await readFile(process.argv[1],'utf8')); const result=await validateTransport(binding); console.log(JSON.stringify(result,null,2));"
result=subprocess.run([NODE,'--input-type=module','-e',code,str(N/'BINDING.json')],capture_output=True,text=True,timeout=15);assert result.returncode==0,result.stderr
write(N/'TRANSPORT_PREFLIGHT.json',json.loads(result.stdout))
assert b['provider']['absoluteTimeoutMs']==b['transportContract']['absoluteTimeoutMs']==1800000
assert b['provider']['inactivityTimeoutMs']==180000 and b['provider']['maxTurns']==100
for key in ['environment','workerEnvironment']:assert b[key]['BASH_MAX_TIMEOUT_MS']=='300000'
assert isinstance(task['instructions'],list) and all(isinstance(x,str) and x for x in task['instructions'])
assert b['runtimeRoot']==str(N/'runtime-001') and not Path(b['runtimeRoot']).exists() and not Path(b['scratchRoot']).exists()
assert pin(N/'host.mjs')['sha256']==pin(O/'host.mjs')['sha256']=='3da8af91ca199bf6d2324d4efb66a91fea690c6993f8bf7eec705a2fc8ca143e'
assert pin(N/'transport-preflight.mjs')['sha256']==pin(O/'transport-preflight.mjs')['sha256']=='b86bd881a4b0c2452503d490964d2dbc29deddab5ddefcf803e0277e55f5081a'
free=shutil.disk_usage(F).free; assert free>=b['reserveBytes']
pre=dict(status='PASSED',sourceDigest=source['sourceDigest'],sourceRows=len(source['rows']),sourceInventory=b['sourceInventory'],sourceSubject=pin(N/'SOURCE_SUBJECT.json'),binding=pin(N/'BINDING.json'),basis=pin(N/'BASIS.json'),hostSyntaxExit=0,providerShellSyntaxExit=0,transport=pin(N/'TRANSPORT_PREFLIGHT.json'),referencedPinChecks=len(checks),protectedHeadIndexTrackingPinsVerified=True,candidateTrackedClean=True,candidateIndexStagedEmpty=True,priorUntrackedPreserved=len(prior),newUntrackedOnlyDeclaredInputs=added,optionalScopeModuleAbsent=True,runtimeAndHostScratchAbsent=True,context=prep['context'],instructionContract='Canonical string[]; actual installed task constructor validates during separately admitted setup before provider.',effects='Control syntax and exact installed pure timeout validator only. No runtime/provider/source/build/test allocation.')
write(N/'STATIC_PREFLIGHT.json',pre)
write(N/'CONTROL_DELTA.json',dict(predecessorBinding=pin(O/'BINDING.json'),binding=pin(N/'BINDING.json'),hostUnchanged=pin(N/'host.mjs'),validatorUnchanged=pin(N/'transport-preflight.mjs'),changes=['Fresh native-b01 runtime-001/host-scratch and qualification inputs/scratch; same supported Public open route','Accepted A checkpoint source/commit and new scoped B task with six existing targets plus optional absent scope module','Prospective absolute timeout900000->1800000 in provider AND transportContract; inactivity180000/maxTurns100 unchanged; Bash max300000 in both environments','Exact lifetime ^controlled selector24 old+6 new prospective cases; scratch compilation; no physical/full proof inside author','Authorized main prefix only; all candidate source/indices/HEADs preserved'],launch='Direct pinned Node argv, tty:true/login:false. No stdin-consuming wrapper, heredoc, redirection or pipeline.',standing='Setup/provider held; no actual call/resource identity exists yet.'))
argv=[NODE,str(N/'host.mjs'),str(N/'BINDING.json'),pin(N/'BINDING.json')['sha256'],str(N/'ROOT_SETUP_ADMISSION.json'),'<Root setup admission SHA256>']
ready=dict(status='PHASE2_B_SETUP_READY_SETUP_PROVIDER_HELD',scope=pin(N/'ROOT_SCOPE.json'),task=pin(N/'TASK.json'),binding=pin(N/'BINDING.json'),host=pin(N/'host.mjs'),validator=pin(N/'transport-preflight.mjs'),sourceInventory=b['sourceInventory'],sourceDigest=source['sourceDigest'],sourceRows=len(source['rows']),sourceCommit=b['sourceCommit'],sourceSubject=pin(N/'SOURCE_SUBJECT.json'),preflight=pin(N/'STATIC_PREFLIGHT.json'),controlDelta=pin(N/'CONTROL_DELTA.json'),tracking=pin(N/'TRACKING.json'),preservationGuards=pin(N/'PRESERVATION_GUARDS.json'),context=prep['context'],native=dict(model='claude-opus-5-5',effort='xhigh',absoluteMs=1800000,inactivityMs=180000,maxTurns=100),selfchecks=dict(compileSeconds=240,compileBashMs=300000,controlledSeconds=60,controlledBashMs=90000,selector='^controlled ',census=pin(N/'CONTROLLED_CENSUS.json')),setupBudgetMs=900000,setupPerCommandMs=300000,reserveBytes=b['reserveBytes'],freeBytes=free,launchArgv=argv,launchCommand=shlex.join(argv),launchOptions=dict(tty=True,login=False),nativeScratchRoot=b['nativeScratchRoot'],runtimeRoot=b['runtimeRoot'],inputRoot=str(F/'qualification-inputs/rc11-effect-phase2-01/native-b01'),writeRoots=task['writeRoots'],optionalModuleObservationLimit=subject['optionalNewPath'],nextProof='After actual B freeze, normal successor build, earliest two helper cases, one configured installed compact-ack C2 positive, affected lifetime/m5/carrier and original nine-file unit. No execution or exact frozen binding now.',standing='Source and accepted A code preserved. No setup/provider/runtime allocated. B and joint Phase2 acceptance open; original failures, both capsules and qualification limits retained. Root sole next-step owner.')
write(N/'READY.json',ready)
print(json.dumps({n:pin(N/n) for n in ['READY.json','BINDING.json','TASK.json','ROOT_SCOPE.json','STATIC_PREFLIGHT.json','TRACKING.json','SOURCE_SUBJECT.json']}));print(json.dumps(prep['context']))
