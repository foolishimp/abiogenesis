from pathlib import Path
import json,hashlib,subprocess,os,shutil,shlex
P=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-effect-phase2-01');N=P/'native-04';O=P/'native-03';F=Path('/private/tmp/abg-rc11-foundation-20261110-01');NODE='/opt/homebrew/Cellar/node/24.7.0/bin/node'
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def write(p,v):
 with p.open('xb') as f:f.write((json.dumps(v,indent=2)+'\n').encode())
write(N/'CONTROL_CHECK_FAILURE_001.json',dict(status='PRESERVED_CONTROL_SYNTAX_FAILURE',effect='Inline Node --input-type=module pure validator launcher failed parsing before import or validation; no runtime/provider/source effect.',error="SyntaxError: Unexpected token ')'",cause='One extra closing parenthesis in Operator inline JSON.stringify wrapper; unchanged validator/host/task/binding.',disposition='Routine same-scope wrapper correction; separate binding/result below, no source or native envelope change.'))
checks=[]
def pins(v):
 if isinstance(v,dict):
  if set(['path','bytes','sha256'])<=v.keys():
   p=pin(v['path']);assert p['bytes']==v['bytes'] and p['sha256']==v['sha256'],v['path'];checks.append(v['path'])
  for x in v.values():pins(x)
 elif isinstance(v,list):
  for x in v:pins(x)
b=json.loads((N/'BINDING.json').read_text());t=json.loads((N/'TASK.json').read_text());g=json.loads((N/'PRESERVATION_GUARDS.json').read_text());p=json.loads((N/'PREPARATION.json').read_text())
for v in [b,g,json.loads((N/'SOURCE_SUBJECT.json').read_text()),json.loads((N/'ROOT_SCOPE.json').read_text())]:pins(v)
for root,head in g['heads'].items():assert subprocess.check_output(['/usr/bin/git','-C',root,'rev-parse','HEAD'],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip()==head
for args in [[NODE,'--check',str(N/'host.mjs')],['/bin/sh','-n',str(N/'claude-provider.sh')]]:
 r=subprocess.run(args,capture_output=True,text=True,timeout=15);assert r.returncode==0,r.stderr
code="import {readFile} from 'node:fs/promises'; import {validateTransport} from "+json.dumps((N/'transport-preflight.mjs').as_uri())+"; const binding=JSON.parse(await readFile(process.argv[1],'utf8')); const result=await validateTransport(binding); console.log(JSON.stringify(result,null,2));"
r=subprocess.run([NODE,'--input-type=module','-e',code,str(N/'BINDING.json')],capture_output=True,text=True,timeout=15);assert r.returncode==0,r.stderr
write(N/'TRANSPORT_PREFLIGHT.json',json.loads(r.stdout))
assert isinstance(t['instructions'],list) and all(isinstance(x,str) for x in t['instructions'])
assert b['runtimeRoot']==str(N/'runtime-001') and not Path(b['runtimeRoot']).exists() and not Path(b['scratchRoot']).exists()
assert b['provider']=={**json.loads((O/'BINDING.json').read_text())['provider'],'command':str(N/'claude-provider.sh')}
assert pin(N/'host.mjs')['sha256']==pin(O/'host.mjs')['sha256']=='3da8af91ca199bf6d2324d4efb66a91fea690c6993f8bf7eec705a2fc8ca143e'
free=shutil.disk_usage(F).free;assert free>=b['reserveBytes']
pre=dict(status='PASSED',sourceDigest=json.loads((O/'source-freeze.json').read_text())['sourceDigest'],sourceRows=1345,sourceInventory=pin(O/'source-freeze.json'),sourceSubject=pin(N/'SOURCE_SUBJECT.json'),binding=pin(N/'BINDING.json'),hostSyntaxExit=0,providerShellSyntaxExit=0,transport=pin(N/'TRANSPORT_PREFLIGHT.json'),referencedPinChecks=len(checks),protectedHeadIndexTrackingPinsVerified=True,runtimeAndHostScratchAbsent=True,context=p['context'],instructionContract='Canonical string[]; actual installed task constructor validates during admitted setup before provider.',basisVerificationReuse=pin(O/'STATIC_PREFLIGHT.json'),preservedControlFailure=pin(N/'CONTROL_CHECK_FAILURE_001.json'),effects='Static control syntax/pure installed timeout validator only. No runtime/provider/build/test.')
write(N/'STATIC_PREFLIGHT.json',pre)
write(N/'CONTROL_DELTA.json',dict(predecessorBinding=pin(O/'BINDING.json'),binding=pin(N/'BINDING.json'),hostUnchanged=pin(N/'host.mjs'),validatorUnchanged=pin(N/'transport-preflight.mjs'),changes=['Fresh native04 runtime-001/host-scratch and qualification inputs/scratch','Same4 paths on native03 freeze; R2 task/conjunction, four-source pins and actual paired evidence','Authorized main tracking prefix; all indices/heads conserved','Same pinned RC10/provider900000>180000,maxTurns100; Bash max300000 in both environments'],launch='Direct pinned Node argv; tty:true/login:false; no stdin-consuming wrapper, heredoc, redirection or pipeline.',standing='Preparation only; no setup/provider admission created.'))
a=[NODE,str(N/'host.mjs'),str(N/'BINDING.json'),pin(N/'BINDING.json')['sha256'],str(N/'ROOT_SETUP_ADMISSION.json'),'<Root setup admission SHA256>']
ready=dict(status='PHASE2_A_R2_SETUP_READY_SETUP_PROVIDER_HELD',scope=pin(N/'ROOT_SCOPE.json'),task=pin(N/'TASK.json'),binding=pin(N/'BINDING.json'),host=pin(N/'host.mjs'),validator=pin(N/'transport-preflight.mjs'),sourceInventory=pin(O/'source-freeze.json'),sourceDigest=pre['sourceDigest'],sourceRows=1345,sourceSubject=pin(N/'SOURCE_SUBJECT.json'),preflight=pin(N/'STATIC_PREFLIGHT.json'),controlDelta=pin(N/'CONTROL_DELTA.json'),tracking=pin(N/'TRACKING.json'),preservationGuards=pin(N/'PRESERVATION_GUARDS.json'),context=p['context'],native=dict(model='claude-opus-5-5',effort='xhigh',absoluteMs=900000,inactivityMs=180000,maxTurns=100),selfchecks=dict(compileSeconds=240,compileBashMs=300000,controlledSeconds=60,controlledBashMs=90000,selector='^controlled (timing|lifetime):'),setupBudgetMs=900000,setupPerCommandMs=300000,reserveBytes=b['reserveBytes'],freeBytes=free,launchArgv=a,launchCommand=shlex.join(a),launchOptions=dict(tty=True,login=False),nativeScratchRoot=b['nativeScratchRoot'],runtimeRoot=b['runtimeRoot'],inputRoot=str(F/'qualification-inputs/rc11-effect-phase2-01/native-04'),writeRoots=t['writeRoots'],heldNextProof='After future freeze: preserved R1 probe, R2 immediate fixture, whole lifetime and baseline-only signal-notice. B held.',standing='Source/build/old evidence protected. No setup/provider/runtime allocated. Root sole next-step owner; no acceptance/qualification claim.')
write(N/'READY.json',ready)
print(json.dumps({n:pin(N/n) for n in ['READY.json','BINDING.json','TASK.json','ROOT_SCOPE.json','STATIC_PREFLIGHT.json','TRACKING.json','SOURCE_SUBJECT.json']}));print(json.dumps(p['context']))
