from pathlib import Path
import json,tarfile,hashlib
out=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-producer-dependencies-01/installed-live-04');base=out.parent;old=base.parent/'s6-declared-source-projection-01/installed-live-03'
def ident(p):
 b=p.read_bytes();return {'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(n,v):
 with (out/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
setup=json.loads((out/'setup.json').read_text());archives={};deltas={}
for index,name in enumerate(['core','consumer']):
 archive=out/(name+'.tgz');root=Path(setup['installedRoots'][index]);members=[];prior={}
 with tarfile.open(old/(name+'.tgz')) as tar:
  for m in tar.getmembers():
   if m.isfile():
    b=tar.extractfile(m).read();prior[m.name.removeprefix('package/')]={'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
 with tarfile.open(archive) as tar:
  for m in tar.getmembers():
   if not m.isfile():continue
   b=tar.extractfile(m).read();path=m.name.removeprefix('package/');v={'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)};assert ident(root/path)==v
   if name=='core':assert ident(out/'bootstrap/package'/path)==v
   members.append({'path':path,**v,'installedMatch':True,**({'bootstrapMatch':True} if name=='core' else {})})
 current={m['path']:{k:m[k] for k in ['sha256','bytes']} for m in members};deltas[name]=[{'path':p,'before':prior.get(p),'after':current.get(p)} for p in sorted(set(prior)|set(current)) if prior.get(p)!=current.get(p)]
 archives[name]={'archive':ident(archive),'installedRoot':str(root),'memberCount':len(members),'unpackedBytes':sum(m['bytes'] for m in members),'members':members}
assert [x['path'] for x in deltas['consumer']]==['package.json','product-toolchain-manifest.json']
save('archive-installed-correspondence.json',archives);save('archive-delta.json',deltas)
preserved=[]
for folder,name in [(base,'proof-manifest.json'),(old,'run-proof-manifest.json')]:
 rows=json.loads((folder/name).read_text())
 for path,v in rows.items():assert ident(folder/path)==v
 preserved.append({'path':str(folder/name),**ident(folder/name),'members':len(rows)})
for name in ['input.json','input-files.json','assessment.schema.json','fulfillment-policy.json']:assert ident(out/name)==ident(old/name)
assert ident(base/'core.tgz')['sha256']=='6311b520520efb19f6d042fb11c00bf7abe5ad335f0b274915726c482d7bdf07'
save('preservation.json',{'proofs':preserved,'priorRunReturn':ident(old/'run-return.md'),'sourceFreeze':ident(base/'freeze.json'),'unchangedInput':ident(out/'input.json'),'unchangedCase':ident(base.parent/'s6-witness-contract.md'),'consumerExecutableAndSchemaUnchanged':True,'oldRunResumed':False,'recoveryProved':False})
save('freeze.json',{'sourceFreeze':ident(base/'freeze.json'),'sourceReturn':ident(base/'return.md'),'core':ident(out/'core.tgz'),'consumer':ident(out/'consumer.tgz'),'installedCorrespondence':ident(out/'archive-installed-correspondence.json'),'input':ident(out/'input.json'),'readiness':ident(out/'readiness.json'),'closeHandoff':ident(out/'handoff-before-start.json'),'preparedStart':ident(out/'start-prepared.json'),'qualificationKind':'separately selected fresh instance; not recovery','providerCalls':0,'runStarted':False})
print(json.dumps({'freeze':ident(out/'freeze.json'),'archives':{k:{p:v[p] for p in ['archive','installedRoot','memberCount','unpackedBytes']} for k,v in archives.items()},'readiness':json.loads((out/'readiness.json').read_text())},indent=2))
