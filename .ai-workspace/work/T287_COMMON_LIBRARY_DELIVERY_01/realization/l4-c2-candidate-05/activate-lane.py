from pathlib import Path
import datetime,hashlib,json,shutil,sys
R=Path(__file__).resolve().parent
W=R.parent.parent
def load(p):return json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'mode':oct(p.stat().st_mode&0o777)}
def put(p,x):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n')
 return pin(p)
B=load(R/'intake/binding-result.json');runtime=Path(B['runtime'])
name=sys.argv[1];assert name in ['p1','owner-resolution','p2','p3']
D=R/name;D.mkdir(exist_ok=False)
c=load(R/'intake'/f'{name}.configuration.template.json');g=load(R/'intake'/f'{name}.grant.template.json')
def actual(lane):
 path=runtime/lane/('result.json' if lane=='owner-resolution' else 'evidence/result.json')
 v=load(path);assert v['status']=='satisfied' and v['subjectId']=='candidate';return pin(path)
if name=='p1':
 assert not runtime.exists()
else:
 prior=['p1'] if name=='owner-resolution' else ['p1','owner-resolution'] if name=='p2' else ['p1','owner-resolution','p2']
 for n in prior:
  assert not (R/n/'STOP.json').exists()
  assert load(R/n/'commands'/f'{n}.result.json')['exitCode']==0
  actual(n)
 p1root=runtime/'p1/evidence';state=load(p1root/'p1-owner-state.json')
 if name=='owner-resolution':
  install=state['installations'][0];assert install['artifactDigest']=='sha256:'+B['subject']['archive']['sha256']
  c['installedRoot']=install['installedRoot']
  labels={x['label'] for x in state['calls']}
  assert {'catalog-admit','catalog-view','product-resolve','product-verify-0'}<=labels
  c['p1']={'result':actual('p1'),'ownerState':pin(p1root/'p1-owner-state.json')}
  for key,filename in {'catalogCall':'catalog-admit.request.jsonl','catalogOutcome':'catalog-admit.outcome.json','viewCall':'catalog-view.request.jsonl','resolveCall':'product-resolve.request.jsonl','resolveOutcome':'product-resolve.outcome.json'}.items():c['p1'][key]=pin(p1root/'calls'/filename)
  handoff=state['closeHandoff'];raw=Path(handoff['reopenAuthority']['eventLogPath']);p=pin(raw)
  assert p['bytes']==handoff['prefix']['prefixLength'] and 'sha256:'+p['sha256']==handoff['prefix']['prefixDigest']
  put(R/'p1/owner-handoff.json',{'status':'actual_P1_handoff_pinned','subjectId':'candidate','installedRoot':c['installedRoot'],'p1':c['p1'],'closeHandoff':handoff,'fullEventLog':p,'actualPublicCalls':state['calls'],'rule':'Read-only owner resolution before P2; no reconstructed outcome.'})
  c['requiredPins'].append(pin(R/'p1/freeze.json'))
 else:
  c['requiredEvidence']=[{**actual(n),'obligations':[{'p1':'P1','owner-resolution':'D03-owner','p2':'P2'}[n]]} for n in prior]
  if name=='p2':
   x=c['lanes']['partial-install'];x['preparationResult']=actual('p1');x['preparationSetup']=pin(p1root/'p1-owner-state.json')
   x['verificationCall']=pin(p1root/'calls/product-verify-0.request.jsonl');x['verificationOutcome']=pin(p1root/'calls/product-verify-0.outcome.json')
c['status']='activated';c['activationFile']=str(D/'effect-grant.json')
configuration=put(D/'configuration.json',c)
g['status']='granted';g['configurationSha256']=configuration['sha256'];g['rootDecision']='L4-C2-CANDIDATE-INTEGRATION-05: sequential original endpoints once, exact prerequisite outputs, first failure stops.'
grant=put(D/'effect-grant.json',g)
shutil.copyfile(B['supervisor']['path'],D/'run-command.py');assert pin(D/'run-command.py')['sha256']==B['supervisor']['sha256']
lane={'p1':'public-preparation','p2':'partial-install','p3':'declared-execution','owner-resolution':'owner-resolution'}[name]
argv=['/usr/bin/time','-l','/opt/homebrew/Cellar/node/24.7.0/bin/node']
argv+=([B['owner']['path'],str(D/'configuration.json')] if name=='owner-resolution' else [B['runner']['path'],'--configuration',str(D/'configuration.json'),'--lane',lane])
assert 'NODE_OPTIONS' not in c['environment']
env=put(D/'command-environment.json',c['environment']);commands=put(D/'commands-config.json',{name:{'argv':argv,'cwd':str(D)}})
(D/'commands').mkdir();(D/'command-freezes').mkdir()
input_paths=[R/'activation.json',R/'HOW.md',R/'bind-c2.mjs',R/'activate-lane.py',R/'intake/binding-result.json',R/'intake/input-pins.json',R/'intake/npmrc.user',R/'intake/npmrc.global',D/'configuration.json',D/'effect-grant.json',D/'run-command.py',D/'commands-config.json',D/'command-environment.json']
freeze=put(D/'input-freeze.json',{'status':'frozen_before_effect','files':[pin(p) for p in input_paths],'candidate':B['freeze'],'runner':B['runner'],'oracle':B['oracle'],'owner':B['owner'],'retryCount':0,'lane':name,'actualPrerequisites':c.get('requiredEvidence',c.get('p1',{}))})
put(D/'command-freezes'/f'{name}.json',{'inputFreeze':freeze,'configuration':configuration,'grant':grant,'command':commands,'environment':env,'supervisor':pin(D/'run-command.py'),'outerCeilingMs':1800000,'originalEndpointCeilings':'unchanged','outerNodeOptions':'cleared before launch; explicit child environment omits NODE_OPTIONS'})
if name!='owner-resolution':
 cache=Path(c['environment']['npm_config_cache']);assert not cache.exists();cache.mkdir(parents=True)
 put(D/'cache-allocation.json',{'root':str(cache),'seedInventory':B['seed'],'files':[],'globalCacheAccess':False,'networkFallback':False,'allocatedAfterInputFreeze':freeze})
print(json.dumps({'status':'activated_and_frozen','lane':name,'configuration':configuration,'grant':grant,'inputFreeze':freeze,'argv':argv}))
