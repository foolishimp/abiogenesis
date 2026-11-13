from pathlib import Path
import json, hashlib, os, subprocess, datetime, shutil
N=Path(__file__).parent;R=N/'runtime-001';F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T='build_tenants/abiogenesis/typescript'
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def write(p,v):
 with p.open('xb') as h:h.write((json.dumps(v,indent=2)+'\n').encode())
binding=json.loads((N/'BINDING.json').read_text());task=json.loads((N/'TASK.json').read_text());subject=json.loads((N/'SOURCE_SUBJECT.json').read_text());g=json.loads((N/'PRESERVATION_GUARDS.json').read_text());final=json.loads((R/'FINAL.json').read_text())
assert final['actualPhysicalClose'] is True,'Do not freeze moving or physically unclosed subject'
for pid in [9123,14446]:
 try:os.kill(pid,0)
 except ProcessLookupError:pass
 else:raise AssertionError(f'owned process still live:{pid}')
try:os.killpg(14446,0)
except ProcessLookupError:pass
else:raise AssertionError('actor group still live')
old=json.loads(Path(binding['sourceInventory']['path']).read_text());prior={x['path']:x for x in old['rows']};newPath=subject['optionalNewPath']['path'];allPaths=list(prior)
if (F/newPath).exists():allPaths.append(newPath)
allowed=set(task['writeRoots']);rows=[];changed=[];new=[];snapshot=N/'frozen-source';assert not snapshot.exists();snapshot.mkdir()
for rel in sorted(allPaths):
 src=F/rel;assert src.is_file() and not src.is_symlink(),rel;b=src.read_bytes();row=dict(path=rel,bytes=len(b),sha256=sha(b));rows.append(row)
 if rel not in prior:new.append(rel);changed.append(rel)
 elif row!=prior[rel]:changed.append(rel)
 dest=snapshot/rel;dest.parent.mkdir(parents=True,exist_ok=True)
 assert not dest.exists();shutil.copy2(src,dest)
 assert src.read_bytes()==dest.read_bytes()==b,rel
offscope=[x for x in changed if x not in allowed]
gitEnv={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
git=lambda *a:subprocess.check_output(['/usr/bin/git','-C',str(F),*a],env=gitEnv,text=True)
assert git('rev-parse','HEAD').strip()==binding['sourceCommit']
diff=git('diff','--binary','--',*[x for x in task['writeRoots'] if x.startswith(T+'/')]);(N/'SOURCE_DELTA.diff').write_text(diff)
frozen=dict(status='CLOSED_NATIVE_B_SOURCE_FROZEN_UNACCEPTED',utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),sourceRoot=str(F),frozenRoot=str(snapshot),sourceCommit=binding['sourceCommit'],sourceInventoryBefore=binding['sourceInventory'],sourceDigest=sha(json.dumps(rows,separators=(',',':')).encode()),rows=rows,changedPaths=changed,newPaths=new,offScopeChangedPaths=offscope,standing='Actual closed postimage only; no source/proof acceptance. Optional absent-before file is independently inventoried, not retroactively added to native initial observation.')
write(N/'source-freeze.json',frozen)
guards=[]
for x in g['indices']+g['mainTracking']+g['candidateTracking']+[g['builderPin'],g['archive'],g['workspaceManifest']]+binding['readOnlyInputPins']+binding['prebuiltPins']:
 actual=pin(x['path']);guards.append(dict(before=x,after=actual,exact=actual['bytes']==x['bytes'] and actual['sha256']==x['sha256']))
codeReadonly=[dict(pin=pin(x['path']),exact=pin(x['path'])['sha256']==x['sha256']) for x in subject['readOnlyA']]
http=[];helper=(F/T/'code/src/implementation/worksite_command_helper.ts').read_text()
for x in subject['readOnlyHttpBodies']:
 try:a=helper.index(x['startMarker']);z=helper.index(x['endMarker'],a);b=helper[a:z].encode();http.append(dict(name=x['name'],bytes=len(b),sha256=sha(b),exact=len(b)==x['bytes'] and sha(b)==x['sha256']))
 except ValueError:http.append(dict(name=x['name'],exact=False,reason='Expected readonly body marker absent'))
receipt=dict(status='CLOSED_B_POSTIMAGE_FROZEN_FOR_ROOT_CONJUNCTION',sourceFreeze=pin(N/'source-freeze.json'),sourceDigest=frozen['sourceDigest'],rowCount=len(rows),changedPaths=changed,newPaths=new,offScopeChangedPaths=offscope,delta=pin(N/'SOURCE_DELTA.diff'),guards=guards,readOnlyA=codeReadonly,readOnlyHttp=http,git=dict(head=git('rev-parse','HEAD').strip(),trackedStatus=git('status','--porcelain=v1','--untracked-files=no'),stagedPaths=git('diff','--cached','--name-only')),nativeFinal=pin(R/'FINAL.json'),processesAbsent=[9123,14446],actorGroupAbsent=True,optionalNewFileCustody=dict(path=newPath,absentBefore=True,presentAfter=newPath in new,observationLimit='Initial readRoots omitted absent path; actual owner after observation must be assessed separately. Operator froze exact new bytes without claiming prior owner observation.'),qualified=False)
write(N/'FREEZE_RECEIPT.json',receipt)
print(json.dumps({n:pin(N/n) for n in ['source-freeze.json','FREEZE_RECEIPT.json','SOURCE_DELTA.diff']}));print(json.dumps(dict(sourceDigest=frozen['sourceDigest'],rows=len(rows),changed=changed,offScope=offscope,allGuardsExact=all(x['exact'] for x in guards),AExact=all(x['exact'] for x in codeReadonly),HTTPExact=all(x['exact'] for x in http))))
