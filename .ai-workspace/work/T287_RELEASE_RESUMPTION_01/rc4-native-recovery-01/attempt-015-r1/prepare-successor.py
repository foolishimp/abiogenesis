from pathlib import Path
import json,hashlib,shutil,datetime,subprocess
N=Path(__file__).resolve().parent;D=N.with_name('attempt-015');W=Path('/Users/jim/src/apps/abiogenesis-rc4-native-recovery')
def load(p):return json.loads(p.read_text())
def write(p,x):p.write_text(json.dumps(x,indent=2)+'\n')
def pin(p):p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
old=load(D/'CALL_PREPARATION_BINDING.json');cust=load(N/'BASELINE_CUSTODY.json');before={str(p):pin(p) for p in D.iterdir() if p.is_file()}
# Frozen semantic inputs are reused by reference except the baseline locator and dependent readiness-root list.
exclude={'ROOT_ADMISSION.json','PREPARATION_FAILURE.json','CALL_PREPARATION_BINDING.json','PACKET_MANIFEST.json','FILE_ONLY_READINESS.json','NEGATIVE_CONTROLS.json','SYNTAX_CHECK.json','INPUT_MATERIALIZATION.json'}
for p in D.iterdir():
 if p.is_file() and p.name not in exclude:shutil.copy2(p,N/p.name)
route='REVIEWED_ROUTES_AND_PRIOR_RESULTS.md';readiness='readiness-inputs.json'
newroot='rc4-operator-inputs/native-recovery-15-r1';oldroot='rc4-operator-inputs/native-recovery-15'
(N/route).write_text((N/route).read_text().replace(old['readOnlyBaselineArchive']['path'],cust['copy']['path']))
r=(N/readiness).read_text().replace(oldroot+'/'+route,newroot+'/'+route).replace(oldroot+'/'+readiness,newroot+'/'+readiness);(N/readiness).write_text(r)
rows=load(D/'INPUT_MATERIALIZATION.json')['rows']
(W/newroot).mkdir()
for row in rows:
 name=Path(row['target']).name
 if name in [route,readiness]:
  target=newroot+'/'+name;shutil.copyfile(N/name,W/target);row.update(source=pin(N/name),target=target,bytes=(W/target).stat().st_size,sha256=pin(W/target)['sha256'])
write(N/'INPUT_MATERIALIZATION.json',{'rows':rows,'meaning':'Only baseline locator and its readiness-root reference materialized in successor; other six immutable015 inputs reused.'})
w=load(D/'workload.json');raw=json.dumps(w)
for name in [route,readiness]:raw=raw.replace(oldroot+'/'+name,newroot+'/'+name)
w=json.loads(raw);w['testing']['commands'][5]['environment']['ABI5_HC1_BASELINE_PACKAGE_PATH']=cust['copy']['path']
for s in w['sources']:
 if s['path'].startswith(newroot+'/'):s['digest']='sha256:'+pin(W/s['path'])['sha256']
write(N/'workload.json',w)
profile=load(N/'PROVIDER_PROFILE.json');profile['provider']['command']=str(N/'claude-provider.sh');write(N/'PROVIDER_PROFILE.json',profile)
p=N/'setup-state.mjs';p.write_text(p.read_text().replace("runId:'rc4-native-recovery-01-attempt-015'","runId:'rc4-native-recovery-01-attempt-015-r1'"))
# Local operators derive all other paths from import.meta.url; source/scratch/task/grant remain unchanged.
(N/'HANDOFF.md').write_text('015-r1 is the zero-provider preparation revision of frozen015. The only command configuration change is the neutral byte-copy path for ABI5_HC1_BASELINE_PACKAGE_PATH. Original failure, packet and inputs remain unchanged. Pure owner comparison reproduces the original refusal and accepts the revised eight-command configuration. No Product change or admission.\n\nRoot: materialize ROOT_ADMISSION.json from template after review; then run the pinned Node prepare-native-call.mjs with the final binding digest. Freeze and dispatch require separate Root selections. Source5331, grant, all eight command purposes/predicates and budgets remain unchanged.\n')
for name,args in [('FILE_ONLY_READINESS.json',[]),('NEGATIVE_CONTROLS.json',['--negative-control'])]:
 result=subprocess.run(['/usr/bin/python3',str(N/'operator-preflight.py'),*args],check=True,text=True,capture_output=True);(N/name).write_text(result.stdout)
checks=[]
for name in ['setup-state.mjs','prepare-native-call.mjs','dispatch.mjs','pure-config-readiness.mjs']:
 x=subprocess.run(['/opt/homebrew/bin/node','--check',str(N/name)],capture_output=True,text=True);assert x.returncode==0,x.stderr;checks.append({'file':name,'exit':0})
write(N/'SYNTAX_CHECK.json',{'checks':checks,'runtimeCalls':0})
# Repoint old local pin records to exact successor bytes; materialized old inputs remain pinned unless replaced.
replacements={str(D/p.name):str(p) for p in N.iterdir() if p.is_file() and p.name not in ['ROOT_ADMISSION.template.json']}
replacements[old['readOnlyBaselineArchive']['path']]=cust['copy']['path']
for name in [route,readiness]:replacements[str(W/oldroot/name)]=str(W/newroot/name)
def refresh(x):
 if isinstance(x,dict):
  if {'path','bytes','sha256'}<=x.keys():
   p=replacements.get(x['path'],x['path']);return {**x,**pin(p)}
  return {k:refresh(v) for k,v in x.items()}
 if isinstance(x,list):return [refresh(v) for v in x]
 return x
b=refresh(old);b['readOnlyBaselineArchive']=pin(cust['copy']['path']);b['changedSemantics']=['Only baseline artifact location changes: protected live archive -> exact neutral immutable byte-copy; request/output identity015-r1. All source/grant/task/proof purposes preserved.'];b['predecessorPreparationFailure']=pin(D/'PREPARATION_FAILURE.json')
b['files']+= [pin(N/f) for f in ['BASELINE_CUSTODY.json','PURE_CONFIG_READINESS.json','pure-config-readiness.mjs']]
# Deduplicate exact pin records.
b['files']=list({r['path']:r for r in b['files']}.values());write(N/'CALL_PREPARATION_BINDING.json',b)
a=load(D/'ROOT_ADMISSION.template.json');a['bindingSha256']=pin(N/'CALL_PREPARATION_BINDING.json')['sha256'];a['decision']='Root selection pending: zero-provider installed preflight/call construction for015-r1 neutral baseline correction only; frozen-call review required before dispatch. HC2 and005 remain required.';write(N/'ROOT_ADMISSION.template.json',a)
m=refresh(load(D/'PACKET_MANIFEST.json'));m['createdUtc']=datetime.datetime.now(datetime.timezone.utc).isoformat();m['binding']=pin(N/'CALL_PREPARATION_BINDING.json');m['files']=[pin(replacements.get(r['path'],r['path'])) for r in load(D/'PACKET_MANIFEST.json')['files']];m['files']=[r for r in m['files'] if Path(r['path']).name!='ROOT_ADMISSION.template.json']+[pin(N/'ROOT_ADMISSION.template.json')]+[pin(N/f) for f in ['BASELINE_CUSTODY.json','PURE_CONFIG_READINESS.json','pure-config-readiness.mjs']];m['WriterInstalledUse']='Pure existing whole command configuration comparison only; no Public/Runtime/store/preflight/provider or Run.';write(N/'PACKET_MANIFEST.json',m)
for p,oldpin in before.items():assert pin(p)==oldpin,p
for name in ['CALL_PREPARATION_BINDING.json','PACKET_MANIFEST.json']:
 x=load(N/name)
 for r in x['files']:assert pin(r['path'])==r,r['path']
 print(name,pin(N/name)['sha256'],len(x['files']))
print('Original015 preserved; no admission; two successor materialized input files; task/grant unchanged.')
