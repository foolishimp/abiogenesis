from pathlib import Path
import json,hashlib,shutil,os,datetime,subprocess
N=Path(__file__).resolve().parent; P=N.parent; D=N/'runtime-001'; C=Path('/private/tmp/abg-rc11-qualification-20261109'); R=Path('/Users/jim/src/apps/abiogenesis')
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p); b=p.read_bytes(); return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def read(p):return json.loads(Path(p).read_text())
def write(name,x):
 p=N/name
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n')
 return pin(p)
def check(p):
 got=pin(p['path']);assert got==p,(p,got);return got
final=read(D/'FINAL.json');assert final['actualPhysicalClose'] and final['readbackFailure'] is None
base=read(N/'SOURCE_INVENTORY.json'); B=read(N/'BINDING.json'); W=read(N/'WRITE_PREIMAGES.json'); tracking=read(N/'RUNNING_TRACKING_RECEIPT.json'); guard=read(P/'PRESERVATION_BASELINE.json')
allowed={str(Path(x['path']).relative_to(C)) for x in W['existing']}|set(W['newAbsent']); old={x['path']:x for x in base['rows']}
rows=[];changed=[]; F=N/'frozen-source';F.mkdir()
for rel in sorted(set(old)|set(W['newAbsent'])):
 src=C/rel;assert src.is_file() and not src.is_symlink(),rel
 b=src.read_bytes(); row={'path':rel,'bytes':len(b),'sha256':sha(b)}; rows.append(row)
 if old.get(rel)!=row:changed.append(rel)
 dst=F/rel;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(b);shutil.copymode(src,dst);assert pin(dst)['sha256']==row['sha256']
assert set(changed)<=allowed,changed
# Inventory all materialized tenant files without following dependency symlinks.
tenant='build_tenants/abiogenesis/typescript';extras=[];symlinks=[]
for root,dirs,files in os.walk(C/tenant,followlinks=False):
 for name in list(dirs):
  q=Path(root)/name
  if q.is_symlink():symlinks.append(str(q.relative_to(C)));dirs.remove(name)
 for name in files:
  q=Path(root)/name;rel=str(q.relative_to(C))
  if q.is_symlink():symlinks.append(rel)
  elif rel not in {r['path'] for r in rows}:extras.append(rel)
assert not extras,extras
assert symlinks==[tenant+'/node_modules'],symlinks
readonly=[check(x) for x in W['readonlyFixtures']]+[check(x) for x in B['readOnlyInputPins']]
fixed=[]
for x in W['fixedPostimages']:
 got=pin(C/x['target']);assert got['sha256']==x['postimage']['sha256'] and got['bytes']==x['postimage']['bytes'];fixed.append(got)
conserved=[check(guard[k]) for k in ['mainIndex','rc10Pin','rc9Pin']]+[check(x) for x in guard['builderInputs']]+[check(x['after']) for x in tracking['tracking']]+[check(B['workspaceOpenManifest'])]+[check(x) for x in B['dependencyPins']]
env=dict(os.environ,GIT_OPTIONAL_LOCKS='0')
for root,expected in [(C,base['sourceCommit']),(R,guard['mainHead'])]:assert subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],env=env,text=True).strip()==expected
log=D/'resources/events/runtime.events.jsonl';events=[json.loads(l) for l in log.read_text().splitlines()];result=[x for x in events if x.get('kind')=='c_call_result_admitted' and x.get('payload',{}).get('value',{}).get('kind') in ['native_workspace_work_failure','native_workspace_work_report']];assert len(result)==1
entry=result[0];v=entry['payload']['value'];assert sorted(v['changedPaths'])==changed
# Correspondence is for every actual file entry observed by native owner; missing scope outside this is not absence evidence.
correspond=[]
for e in v['after']['entries']:
 if e['state']=='file':
  got=pin(C/e['relativePath']);assert got['bytes']==e['byteLength'] and 'sha256:'+got['sha256']==e['digest'],e['relativePath'];correspond.append(e['relativePath'])
after=write('NATIVE_AFTER_OBSERVATION.json',{'status':'EXACT_ADMITTED_VALUE_RETAINED','sourceEventLog':pin(log),'eventId':entry['eventId'],'payloadDigest':entry.get('payloadDigest'),'value':v})
sourceDigest=sha(json.dumps(rows,separators=(',',':')).encode())
freeze=write('source-freeze.json',{'status':'CLOSED_NATIVE02_PARTIAL_SOURCE_FROZEN_AWAITING_ROOT_DISPOSITION','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceRoot':str(C),'frozenRoot':str(F),'sourceCommit':base['sourceCommit'],'sourceDigest':sourceDigest,'rows':rows,'preimage':pin(N/'SOURCE_INVENTORY.json'),'changedPaths':changed,'newPaths':W['newAbsent'],'nativeAfter':after,'nativeAfterFileCorrespondence':correspond,'actualPhysicalClose':pin(D/'resource-close.json'),'hostFinal':pin(D/'FINAL.json'),'standing':'Partial source from failed absolute-limit author. No tests, build, acceptance, qualification, or release; Root controls next effects.'})
custody=write('SOURCE_CUSTODY.json',{'status':'FROZEN_POSTIMAGE_CONSERVED','sourceFreeze':freeze,'sourceDigest':sourceDigest,'sourceRows':len(rows),'sourceBytes':sum(x['bytes'] for x in rows),'changedPaths':changed,'unchangedPreexistingRows':sum(old.get(x['path'])==x for x in rows),'allChangesInsideTenSelectedSourcePaths':set(changed)<=allowed,'unexpectedTenantFiles':extras,'dependencySymlinks':symlinks,'readonlyInputsConserved':readonly,'fixedPostimagesMatch':fixed,'mainBuilderAndControlGuards':conserved,'operatorProductEdits':False,'scopeLimitation':'Physical inventory covers original source rows, declared new targets, tenant files and named guards; no global absence or complete read-scope-conformance claim.'})
print(json.dumps({'freeze':freeze,'custody':custody,'sourceDigest':sourceDigest,'rows':len(rows),'changedPaths':changed}))
