from pathlib import Path
import json,hashlib,shutil,subprocess,time
repo=Path('/Users/jim/src/apps/abiogenesis'); tenant=repo/'build_tenants/abiogenesis/typescript'; out=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s6-context-projection-01'; release=Path('/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.1')
def ident(p):
 b=p.read_bytes();return {'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(n,v):
 with (out/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
inputs=json.loads((tenant/'contracts/qualification/authority-inputs.json').read_text())
paths=sorted([str(p.relative_to(tenant)) for p in (tenant/'contracts').rglob('*') if p.is_file()]+['product-toolchain-manifest.json'])
before={p:ident(tenant/p) for p in paths};save('authority-generated-before.json',before)
preserve=['contracts/qualification/authority-inputs.json','contracts/qualification/rule-catalog.json','contracts/qualification/law-basis.json','contracts/qualification/coverage.json','contracts/schemas/self-conformance.schema.json','product-toolchain-manifest.json']
originals={}
for row in inputs['sources']:
 ref=row['ref'];orig=repo/ref.removeprefix('repo://abiogenesis/') if ref.startswith('repo://') else release/ref.removeprefix(inputs['method']['releaseRef'])
 originals[ref]=ident(orig)
 if ident(orig)!=ident(tenant/row['path']):preserve.append(row['path'])
for p in preserve:
 dest=out/'authority-preimages'/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(tenant/p,dest)
commands=[['node','scripts/generate-qualification-rule-catalog.mjs','--stage-authorities',str(repo),str(release)],['node','scripts/generate-product-manifest.mjs']];timings=[]
for i,cmd in enumerate(commands):
 start=time.monotonic()
 with (out/f'authority-generation-{i+1:02}.log').open('x') as log:r=subprocess.run(cmd,cwd=tenant,stdout=log,stderr=subprocess.STDOUT)
 timings.append({'command':cmd,'exitCode':r.returncode,'elapsedMs':(time.monotonic()-start)*1000});assert r.returncode==0,timings
current=json.loads((tenant/'contracts/qualification/authority-inputs.json').read_text());assert current['method']==inputs['method']
joins=[]
for row in current['sources']:
 ref=row['ref'];orig=repo/ref.removeprefix('repo://abiogenesis/') if ref.startswith('repo://') else release/ref.removeprefix(current['method']['releaseRef'])
 a=ident(orig);b=ident(tenant/row['path']);assert a==b==originals[ref];assert row['digest']=='sha256:'+a['sha256'] and row['byteCount']==a['bytes'];joins.append({'ref':ref,'copy':row['path'],**a})
after={str(p.relative_to(tenant)):ident(p) for p in (tenant/'contracts').rglob('*') if p.is_file()};after['product-toolchain-manifest.json']=ident(tenant/'product-toolchain-manifest.json')
delta=[{'path':p,'before':before.get(p),'after':v} for p,v in after.items() if before.get(p)!=v]
oldcoverage=json.loads((out/'authority-preimages/contracts/qualification/coverage.json').read_text());newcoverage=json.loads((tenant/'contracts/qualification/coverage.json').read_text());assert oldcoverage['claims']==newcoverage['claims']
save('authority-refresh.json',{'commands':timings,'method':current['method'],'joins':joins,'generatedDelta':delta,'coverageClaimsUnchanged':True,'authorityOriginalsUnchanged':True,'qualificationSemanticsChanged':False})
print(json.dumps({'joins':len(joins),'changed':[x['path'] for x in delta],'timings':timings},indent=2))
