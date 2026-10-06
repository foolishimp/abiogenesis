from pathlib import Path
import hashlib,json,shutil,stat,datetime
repo=Path('/Users/jim/src/apps/abiogenesis')
report=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/native-declaration-applicability-realization-01'
c03=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-03'
tenant=repo/'build_tenants/abiogenesis/typescript'
stage=report/'copied-tenant'
assert not stage.exists()
inputs=[]
def pin(p):
    return {'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'mode':stat.S_IMODE(p.stat().st_mode)}
def copy(src,dst,exclude_generated=False):
    if src.is_dir():
        for p in sorted(src.rglob('*')):
            if p.is_file() and p.name != '.DS_Store' and not (exclude_generated and any(x in {'node_modules','build','test_runs','proof'} for x in p.relative_to(src).parts)):
                copy(p,dst/p.relative_to(src),exclude_generated)
    else:
        assert src.is_file() and not src.is_symlink(), str(src)
        dst.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(src,dst)
        a,b=pin(src),pin(dst)
        assert (a['bytes'],a['sha256'],a['mode'])==(b['bytes'],b['sha256'],b['mode'])
        inputs.append({'input':a,'copy':b})
for name in ['code','contracts','design','scripts','package.json','package-lock.json','tsconfig.json','.gitignore']:
    copy(tenant/name,stage/name)
for name in ['downstream','falsifiers','fixtures','support','tests']:
    copy(tenant/'test_env'/name,stage/'test_env'/name,True)
copy(c03/'final-stage/build_tenants/abiogenesis/typescript/node_modules',stage/'node_modules')
installed=c03/'final-install/node_modules/@abiogenesis/typescript-tenant'
copy(installed/'build/toolchain',stage/'build/toolchain')
copy(installed/'product-toolchain-manifest.json',stage/'product-toolchain-manifest.json')
node=c03/'source-freeze/toolchain/bin/node'
node_pin=pin(node)
assert node_pin['sha256']=='fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
(report/'readiness/preparation.json').write_text(json.dumps({'kind':'isolated_complete_tenant_preparation','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'copiedTenant':str(stage),'source':'current tenant source only; generated ambient outputs excluded','dependencies':'exact frozen C03 final-stage dependencies','toolchain':'exact frozen C03 installed compiler host and manifest; mechanical compiler-basis use only, not successor identity','frozenNode':node_pin,'files':len(inputs),'copiedBytes':sum(x['copy']['bytes'] for x in inputs),'inputs':inputs},indent=2)+'\n')
print(json.dumps({'files':len(inputs),'bytes':sum(x['copy']['bytes'] for x in inputs),'node':node_pin['sha256']}))
