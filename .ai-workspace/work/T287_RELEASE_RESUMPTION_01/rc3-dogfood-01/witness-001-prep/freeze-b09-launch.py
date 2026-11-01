#!/usr/bin/env python3
"""Freeze only the already-prepared actual witness; no setup or runtime call."""
from pathlib import Path
from urllib.parse import urlparse,unquote
import hashlib,json,re,stat
HERE=Path(__file__).resolve().parent;ROOT=HERE/'runtime-b11-004'
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for block in iter(lambda:f.read(1048576),b''):h.update(block)
 return h.hexdigest()
def pin(p):
 p=Path(p);s=p.lstat();assert str(p.resolve(strict=True))==str(p) and stat.S_ISREG(s.st_mode),str(p)
 return {'path':str(p),'bytes':s.st_size,'sha256':sha(p)}
def canon(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def digest(v):return 'sha256:'+hashlib.sha256(canon(v)).hexdigest()
saved=json.loads((ROOT/'operator-resume-material.json').read_text());call=json.loads((ROOT/'witness-call.json').read_text());work=json.loads((ROOT/'witness-workload.json').read_text());profile=json.loads((HERE/'provider-profile-b09.json').read_text())
assert call['resources']['source']['kind']=='none' and work['observations']==[] and work['synthesis']is None
assert all(not x['writeRoots']for x in work['original']['workOrders'].values())
assert saved['config']['dependencyResources']==call['resources']['runEnvironmentResources']['dependencies']
assert saved['config']['dependencyResources']==json.loads((ROOT/'dependency-resources.json').read_text())
assert saved['state']['closeHandoff']==call['resources']['eventResource']['closeHandoff']
prefix=saved['state']['closeHandoff']['prefix'];event=Path(unquote(urlparse(prefix['eventLogRef']).path));ep=pin(event);es=event.stat()
assert ep['bytes']==prefix['prefixLength'] and 'sha256:'+ep['sha256']==prefix['prefixDigest']
assert es.st_dev==prefix['storeIdentity']['device'] and es.st_ino==prefix['storeIdentity']['inode']
marker=ROOT/'NATIVE_LAUNCH_STARTED.json';assert not marker.exists()
files={HERE/'guard-b09-launch.py',HERE/'freeze-b09-launch.py',HERE/'provider-profile-b09.json',HERE/'selected-c2-b11-004.json',HERE/'B11_004_PREPARATION_CUSTODY.json',event}
files.update(ROOT/n for n in ['operator-resume-material.json','witness-call.json','witness-workload.json','ACTIVATION_PENDING.json','dependency-resources.json','generated-policy.json','selected-producer.json','workspace-manifest.json','summary.json','run.json','bootstrap-installation.json','bootstrap-lock.json','bootstrap-verification.json'])
files.update((ROOT/'worksite'/n)for n in ['task.md','rubric.json','fixture.txt'])
files.update(p for p in (ROOT/'gc03-policy').iterdir()if p.is_file())
# Actual declared installed payloads cover the CLI, Product imports, consumer
# semantics and their packaged dependencies before any Node/Product import.
installed=[]
for install in saved['setup']['installations']:
 root=Path(install['installedRoot']);mp=root/'product-toolchain-manifest.json';m=json.loads(mp.read_text());assert digest(m)==install['manifestDigest']
 locators=m['productRelativeLocators'];assert len(set(locators))==len(locators)
 inventory=[]
 for rel in sorted(locators):
  p=root/rel;assert p.resolve().is_relative_to(root);row=pin(p);files.add(p);inventory.append({'path':rel,'sha256':'sha256:'+row['sha256']})
 assert digest(inventory)==install['productContentDigest'];files.add(mp)
 installed.append({'root':str(root),'members':len(locators),'manifestDigest':install['manifestDigest'],'productContentDigest':install['productContentDigest']})
for dependency in saved['config']['dependencyResources']:
 record=Path(dependency['recordPath']);files.add(record);inventory=json.loads(record.read_text());rows=inventory if isinstance(inventory,list)else inventory['members']
 for row in rows:
  assert row['type']=='file' and row['target']is None
  p=Path(dependency['root'])/row['path'];assert 'sha256:'+sha(p)==row['digest'];files.add(p)
# Freeze the current adapter/Python/released GC03 and source authority files
# actually named by this prepared policy; these are finite read_scope members.
policy=json.loads((ROOT/'gc03-policy/gc03-policy.json').read_text())
for source in policy['sources'].values():
 for scope in source['read_scope']:
  assert scope['kind']=='file';files.add(Path(source['path'])/scope['path'])
# Enumerate local static/literal imports without importing/evaluating any module.
graph={};static=re.compile(r"^import\s+(?:.*?\s+from\s+)?['\"]([^'\"]+)['\"]",re.M);dynamic=re.compile(r"\bimport\(\s*['\"]([^'\"]+)['\"]\s*\)")
def visit(p):
 p=p.resolve(strict=True)
 if p in graph:return
 local=[];text=p.read_text()
 for spec in sorted(set(static.findall(text)+dynamic.findall(text))):
  if spec.startswith('node:'):continue
  assert spec.startswith('.'),spec
  q=(p.parent/spec).resolve(strict=True);local.append(q)
 graph[p]=local;files.add(p)
 for q in local:visit(q)
visit(HERE/'run-b07.mjs')
aliases=[]
for name,row in profile['executablePins'].items():
 assert str(Path(row['configuredPath']).resolve())==row['realPath'];p=Path(row['realPath']);assert sha(p)==row['sha256'];files.add(p);aliases.append({'configuredPath':row['configuredPath'],'realPath':row['realPath']})
python=Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12');assert sha(python)=='a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539';files.add(python)
manifest={'kind':'b10_exact_prepared_witness_launch','status':'PREPARED_NOT_LAUNCHED','files':[pin(p)for p in sorted(files)],'eventResource':{**ep,'device':es.st_dev,'inode':es.st_ino,'coordinateDigest':prefix['coordinateDigest']},'installedPayloads':installed,'operatorExecutableClosure':[{'path':str(p),'localImports':[str(q)for q in graph[p]]}for p in sorted(graph)],'executableAliases':aliases,'python':str(python),'node':profile['executablePins']['node']['realPath'],'launcher':str(HERE/'run-b07.mjs'),'profile':str(HERE/'provider-profile-b09.json'),'profileSha256':sha(HERE/'provider-profile-b09.json'),'startMarker':str(marker),'limits':['Existing prepared input/call/resume/policy/profile bytes unchanged','No new runtime/admission authority or Result','Guard verifies then execs existing launcher once; no retry','Root alone controls launch after actual policy/call review']}
p=HERE/'B11_004_LAUNCH_MANIFEST.json'
with p.open('x')as f:json.dump(manifest,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'manifestPath':str(p),'sha256':sha(p),'files':len(files),'operatorModules':len(graph),'eventBytes':ep['bytes']}))
