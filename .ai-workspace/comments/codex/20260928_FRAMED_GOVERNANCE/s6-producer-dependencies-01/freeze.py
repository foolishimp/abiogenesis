from pathlib import Path
import json,hashlib,tarfile,difflib,shutil
repo=Path('/Users/jim/src/apps/abiogenesis');tenant=repo/'build_tenants/abiogenesis/typescript';out=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-producer-dependencies-01';old=out.parent/'s6-declared-source-projection-01'
def ident(p):
 b=p.read_bytes();return {'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(n,v):
 with (out/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
paths=['code/src/abg/default_library.ts','design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md','test_env/tests/t287-default-library-fulfillment.test.mjs'];rows=[];patch=[];added=removed=0
for path in paths:
 p=tenant/path;pre=out/'preimages'/path;dest=out/'subject'/path;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
 diff=list(difflib.unified_diff(pre.read_text().splitlines(keepends=True),p.read_text().splitlines(keepends=True),fromfile='before/'+path,tofile='after/'+path));patch+=diff;a=sum(l.startswith('+') and not l.startswith('+++') for l in diff);r=sum(l.startswith('-') and not l.startswith('---') for l in diff);added+=a;removed+=r;rows.append({'path':path,**ident(p),'before':ident(pre),'addedLines':a,'removedLines':r})
(out/'source.patch').write_text(''.join(patch));before={};members=[]
with tarfile.open(old/'core.tgz') as tar:
 for member in tar.getmembers():
  if member.isfile():
   b=tar.extractfile(member).read();before[member.name.removeprefix('package/')]={'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
with tarfile.open(out/'core.tgz') as tar:
 for member in tar.getmembers():
  if member.isfile():
   b=tar.extractfile(member).read();path=member.name.removeprefix('package/');identity={'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)};assert ident(tenant/path)==identity,path;members.append({'path':path,**identity,'matchesBuiltTenant':True})
after={m['path']:{k:m[k] for k in ['sha256','bytes']} for m in members};delta=[{'path':p,'before':before.get(p),'after':after.get(p)} for p in sorted(set(before)|set(after)) if before.get(p)!=after.get(p)]
for row in delta:
 p=row['path'];dest=out/'subject'/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(tenant/p,dest)
inherited=[]
prior=json.loads((old/'source-generated.json').read_text())
for row in prior['changed']+prior['inheritedUnchanged']:
 if row['path'] in paths:continue
 actual=ident(tenant/row['path']);assert actual['sha256']==row['sha256'];inherited.append({'path':row['path'],**actual})
source={'predecessorSourceFreeze':ident(old/'freeze.json'),'changed':rows,'inheritedUnchanged':inherited,'generated':[{'path':r['path'],**ident(tenant/r['path'])} for r in delta],'net':{'addedLines':added,'removedLines':removed,'netLines':added-removed}}
save('source-generated.json',source);save('archive-correspondence.json',{'archive':ident(out/'core.tgz'),'memberCount':len(members),'members':members,'delta':delta,'installed':False})
preserved=[]
for folder,name in [(old,'proof-manifest.json'),(old/'installed-live-03','run-proof-manifest.json')]:
 j=json.loads((folder/name).read_text())
 for p,v in j.items():assert ident(folder/p)==v,(str(folder),p)
 preserved.append({'manifest':str(folder/name),**ident(folder/name),'members':len(j)})
assert ident(old/'installed-live-03/run-return.md')['sha256']=='6ecbf5d923a43257c5f356cd34f75e8b7f9728733f84f37b400a4b203891af34'
save('preservation.json',{'manifests':preserved,'priorRunReturn':ident(old/'installed-live-03/run-return.md'),'priorCore':ident(old/'core.tgz'),'priorConsumer':ident(old/'installed-live-03/consumer.tgz'),'originalInput':ident(old/'installed-live-03/input.json'),'prospectiveCase':ident(out.parent/'s6-witness-contract.md')})
proof={str(p.relative_to(out)):ident(p) for p in sorted(out.rglob('*')) if p.is_file() and p.suffix!='.tgz' and p.name not in ['proof-manifest.json','freeze.json','return.md']};save('proof-manifest.json',proof)
save('freeze.json',{'sourceGenerated':ident(out/'source-generated.json'),'proofManifest':ident(out/'proof-manifest.json'),'proofMembers':len(proof),'core':ident(out/'core.tgz'),'archiveCorrespondence':ident(out/'archive-correspondence.json'),'checks':ident(out/'checks.json'),'assessmentRender':ident(out/'assessment-render.json'),'net':source['net'],'installed':False,'providerCalls':0,'runtimeAdmission':False})
print(json.dumps({'freeze':ident(out/'freeze.json'),'record':json.loads((out/'freeze.json').read_text()),'archiveDelta':[r['path'] for r in delta]},indent=2))
