from pathlib import Path
import json,hashlib,tarfile,difflib,shutil,subprocess
repo=Path('/Users/jim/src/apps/abiogenesis');tenant=repo/'build_tenants/abiogenesis/typescript';records=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE';out=records/'s6-context-projection-01';old=records/'s6-fulfillment-implementation'
def identity(p):
 b=p.read_bytes();return {'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(n,v):
 with (out/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
paths=['code/src/product/default_library.ts','code/src/abg/instruction_assembly.ts','design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md'];rows=[];patch=[];added=removed=0
for path in paths:
 p=tenant/path;pre=out/'preimages'/path;post=out/'subject'/path;post.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,post)
 diff=list(difflib.unified_diff(pre.read_text().splitlines(keepends=True),p.read_text().splitlines(keepends=True),fromfile='before/'+path,tofile='after/'+path));patch+=diff
 a=sum(x.startswith('+') and not x.startswith('+++') for x in diff);r=sum(x.startswith('-') and not x.startswith('---') for x in diff);added+=a;removed+=r
 rows.append({'path':path,**identity(p),'before':identity(pre),'addedLines':a,'removedLines':r})
(out/'source.patch').write_text(''.join(patch))
refresh=json.loads((out/'authority-refresh.json').read_text());generated=[x['path'] for x in refresh['generatedDelta']]
for path in paths:
 if path.startswith('code/'):
  generated += ['build/'+path[:-3]+ext for ext in ['.js','.d.ts','.js.map'] if (tenant/('build/'+path[:-3]+ext)).exists()]
for path in generated:
 dest=out/'subject'/path;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(tenant/path,dest)
prior=json.loads((old/'source-generated.json').read_text());inherited=[]
for row in prior['changed']+prior['unchangedReused']:
 if row['path'] in paths:continue
 actual=identity(tenant/row['path']);assert actual['sha256']==row['sha256'],row['path'];inherited.append({'path':row['path'],**actual})
source={'selectedHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip(),'predecessorFreeze':identity(old/'freeze.json'),'changed':rows,'inheritedUnchanged':inherited,'generated':[{'path':p,**identity(tenant/p)} for p in generated],'authorityRefresh':identity(out/'authority-refresh.json'),'net':{'addedLines':added,'removedLines':removed,'netLines':added-removed}}
save('source-generated.json',source)
setup=json.loads((out/'setup.json').read_text());archives={};mismatches=[];deltas={}
for i,name in enumerate(['core','consumer']):
 archive=out/(name+'.tgz');root=Path(setup['installedRoots'][i]);members=[];before={}
 with tarfile.open(old/(name+'.tgz')) as tar:
  for member in tar.getmembers():
   if member.isfile():
    b=tar.extractfile(member).read();before[member.name.removeprefix('package/')]={'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 with tarfile.open(archive) as tar:
  for member in tar.getmembers():
   if not member.isfile():continue
   b=tar.extractfile(member).read();path=member.name.removeprefix('package/');digest=hashlib.sha256(b).hexdigest();installed=root/path
   ok=installed.is_file() and identity(installed)['sha256']==digest
   if not ok:mismatches.append(name+':'+path)
   members.append({'path':path,'sha256':digest,'bytes':len(b),'installedMatch':ok})
 archives[name]={'archive':identity(archive),'installedRoot':str(root),'members':members}
 after={m['path']:{'sha256':m['sha256'],'bytes':m['bytes']} for m in members};deltas[name]=[{'path':p,'before':before.get(p),'after':after.get(p)} for p in sorted(set(before)|set(after)) if before.get(p)!=after.get(p)]
assert not mismatches,mismatches
save('archive-installed-correspondence.json',archives);save('archive-delta.json',deltas)
preserve={'return.md':'9ea519b0475540d3cd19cd623a7ca25aa9e238d3ba3527869a16251a35204698','freeze.json':'3bfda7ac23bd8fd7ad5274d0875c3c13bdbf6033805370665055749e04e2d8e8','core.tgz':'64712d9e3f480236f3a90f7c3c124eb8140ffee5ba426dafc1c7d02767008d4d','consumer.tgz':'f70349590488054f940e818628d0009c950dde6d91e513d27c6b934a54636b98','live-01/return.md':'ef4b22d0736d4eb1b39fb1f853b413665699e0b3efca10b4a2b45bc2d3ea5b13','live-01/launcher-manifest.json':'f1da19fd49122aea10855763e5382121f522b7c1c7d2b029598681f90ba07f73','live-01/run-return.md':'293d2bc5b1ac47efa3ef711bdd0420446b02734a0ba57ba785c18c8871b7aa15','live-01/run-proof-manifest.json':'6fdd2c05c274aa7fc3e602b6dceb37ea713083e52daa5c40139b9c292befb9c5'}
for p,digest in preserve.items():assert identity(old/p)['sha256']==digest,p
for manifest in ['proof-manifest.json','live-01/run-proof-manifest.json']:
 base=old if '/' not in manifest else old/'live-01';data=json.loads((old/manifest).read_text())
 for path,row in data.items():assert identity(base/path)==row,(manifest,path)
save('preserved-subjects.json',{'predecessor':preserve,'priorMechanicalProofMembers':len(json.loads((old/'proof-manifest.json').read_text())),'priorRunProofMembers':len(json.loads((old/'live-01/run-proof-manifest.json').read_text())),'oldInstalledRoot':json.loads((old/'setup.json').read_text())['installedRoots'][0],'unchangedCase':identity(out/'unchanged-case.json')})
proof={str(p.relative_to(out)):identity(p) for p in sorted(out.rglob('*')) if p.is_file() and 'frozen-host' not in p.parts and p.suffix!='.tgz' and p.name not in ['proof-manifest.json','freeze.json','return.md']}
save('proof-manifest.json',proof)
save('freeze.json',{'sourceGenerated':identity(out/'source-generated.json'),'proofManifest':identity(out/'proof-manifest.json'),'installedCorrespondence':identity(out/'archive-installed-correspondence.json'),'core':identity(out/'core.tgz'),'consumer':identity(out/'consumer.tgz'),'readiness':identity(out/'readiness.json'),'input':identity(out/'input.json'),'prospectiveContract':identity(records/'s6-witness-contract.md'),'checks':identity(out/'checks.json'),'net':source['net'],'providerCalls':0,'runtimeRunStarted':False})
print(json.dumps(json.loads((out/'freeze.json').read_text()),indent=2))
