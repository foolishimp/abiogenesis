from pathlib import Path
import json,hashlib,tarfile,difflib,shutil
repo=Path('/Users/jim/src/apps/abiogenesis'); tenant=repo/'build_tenants/abiogenesis/typescript'; out=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-fulfillment-implementation'
def identity(p):
 b=p.read_bytes();return {'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(p,v):
 with p.open('x') as f:json.dump(v,f,indent=2);f.write('\n')
paths=['code/src/product/default_library.ts','code/src/product/default_library_fulfillment.ts','code/src/abg/default_library.ts','code/src/abg/instruction_assembly.ts','code/src/gtl/default_library.ts','code/src/gtl/semantic_stage.ts','code/src/product/requirement_handoff.ts','code/src/product/semantic_job.ts','design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md','test_env/support/default-library-fulfillment.mjs','test_env/tests/t287-default-library-fulfillment.test.mjs','test_env/tests/t287-default-library.test.mjs']
unchanged=['code/src/implementation/default_library.ts','code/src/product/index.ts','test_env/support/default-library.mjs','test_env/support/registered-graph-selection.mjs','test_env/support/root-installed-environment.mjs','test_env/fixtures/default-library-product/index.mjs']
rows=[];patch=[];added=removed=0
for path in paths:
 p=tenant/path;pre=out/'preimages'/path;post=out/'subject'/path;post.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,post)
 before=pre.read_text().splitlines(keepends=True) if pre.exists() else [];after=p.read_text().splitlines(keepends=True)
 diff=list(difflib.unified_diff(before,after,fromfile='before/'+path,tofile='after/'+path));patch+=diff
 a=sum(x.startswith('+') and not x.startswith('+++') for x in diff);r=sum(x.startswith('-') and not x.startswith('---') for x in diff);added+=a;removed+=r
 rows.append({'path':path,**identity(p),'before':identity(pre) if pre.exists() else None,'addedLines':a,'removedLines':r})
(out/'source.patch').write_text(''.join(patch))
generated=['contracts/capabilities/capability-definition-graph.json','product-toolchain-manifest.json']
for path in paths:
 if path.startswith('code/'):
  generated += ['build/'+path[:-3]+ext for ext in ['.js','.d.ts'] if (tenant/('build/'+path[:-3]+ext)).exists()]
source={'selectedBase':'b8bffae0654b83804ecd0e76aee263be98283805','changed':rows,'unchangedReused':[{'path':p,**identity(tenant/p)} for p in unchanged],'generated':[{'path':p,**identity(tenant/p)} for p in generated],'net':{'addedLines':added,'removedLines':removed,'netLines':added-removed}}
save(out/'source-generated.json',source)
setup=json.loads((out/'setup.json').read_text()); archives={};mismatches=[]
for i,name in enumerate(['core','consumer']):
 archive=out/(name+'.tgz');root=Path(setup['installedRoots'][i]);members=[]
 with tarfile.open(archive) as tar:
  for member in tar.getmembers():
   if not member.isfile():continue
   b=tar.extractfile(member).read();path=member.name.removeprefix('package/');digest=hashlib.sha256(b).hexdigest();installed=root/path
   ok=installed.is_file() and identity(installed)['sha256']==digest
   if not ok:mismatches.append(name+':'+path)
   members.append({'path':path,'sha256':digest,'bytes':len(b),'installedMatch':ok})
 archives[name]={'archive':identity(archive),'installedRoot':str(root),'members':members}
assert not mismatches,mismatches
save(out/'archive-installed-correspondence.json',archives)
save(out/'preimages/complete-manifest.json',{str(p.relative_to(out/'preimages')):identity(p) for p in (out/'preimages').rglob('*') if p.is_file()})
proof={str(p.relative_to(out)):identity(p) for p in out.rglob('*') if p.is_file() and 'frozen-host' not in p.parts and p.suffix!='.tgz' and p.name!='proof-manifest.json'}
save(out/'proof-manifest.json',proof)
save(out/'freeze.json',{'sourceGenerated':identity(out/'source-generated.json'),'proofManifest':identity(out/'proof-manifest.json'),'installedCorrespondence':identity(out/'archive-installed-correspondence.json'),'core':identity(out/'core.tgz'),'consumer':identity(out/'consumer.tgz'),'readiness':identity(out/'readiness.json'),'input':identity(out/'input.json'),'prospectiveContract':identity(out.parent/'s6-witness-contract.md'),'net':source['net'],'providerCalls':0,'runtimeRunStarted':False})
print(json.dumps(json.loads((out/'freeze.json').read_text()),indent=2))
