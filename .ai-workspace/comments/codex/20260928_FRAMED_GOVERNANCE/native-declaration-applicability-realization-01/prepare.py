from pathlib import Path
import hashlib,json,shutil,stat,datetime,os
repo=Path('/Users/jim/src/apps/abiogenesis')
report=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/native-declaration-applicability-realization-01'
c03=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/final-candidate-construction-03'
source=c03/'final-source/build_tenants/abiogenesis/typescript'
stage=report/'copied-tenant'
assert not stage.exists()
inputs=[]
def pin(p):
    if p.is_symlink():
        return {'path':str(p),'kind':'symlink','target':os.readlink(p),'sha256':hashlib.sha256(os.readlink(p).encode()).hexdigest(),'mode':stat.S_IMODE(p.lstat().st_mode)}
    return {'path':str(p),'kind':'file','bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'mode':stat.S_IMODE(p.stat().st_mode)}
def copy(src,dst,boundary):
    if src.is_symlink():
        target=os.readlink(src)
        assert not Path(target).is_absolute() and src.resolve().is_relative_to(boundary.resolve()),str(src)
        dst.parent.mkdir(parents=True,exist_ok=True); dst.symlink_to(target)
    elif src.is_dir():
        for p in sorted(src.iterdir()):
            if p.name != '.DS_Store':copy(p,dst/p.name,boundary)
        return
    else:
        assert src.is_file(),str(src)
        dst.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(src,dst)
    a,b=pin(src),pin(dst)
    assert {k:v for k,v in a.items() if k!='path'}=={k:v for k,v in b.items() if k!='path'}
    inputs.append({'input':a,'copy':b})
copy(source,stage,source)
postimages=['design/T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN.md','code/src/product/declaration_exports.ts','test_env/tests/m5-s06-prime.test.mjs']
for relative in postimages:
    current=repo/'build_tenants/abiogenesis/typescript'/relative
    copy(current,stage/relative,current.parent)
copy(c03/'final-stage/build_tenants/abiogenesis/typescript/node_modules',stage/'node_modules',c03/'final-stage/build_tenants/abiogenesis/typescript/node_modules')
installed=c03/'final-install/node_modules/@abiogenesis/typescript-tenant'
copy(installed/'build/toolchain',stage/'build/toolchain',installed/'build/toolchain')
copy(installed/'product-toolchain-manifest.json',stage/'product-toolchain-manifest.json',installed)
node=c03/'source-freeze/toolchain/bin/node'; node_pin=pin(node)
assert node_pin['sha256']=='fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
(report/'readiness/preparation.json').write_text(json.dumps({'kind':'isolated_complete_tenant_preparation','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'copiedTenant':str(stage),'source':'complete frozen C03 source population plus exact three current authorized postimages','dependencies':'exact frozen C03 final-stage dependencies with contained relative symlinks','toolchain':'exact frozen C03 installed compiler host and manifest; mechanical compiler-basis use only, not successor identity','frozenNode':node_pin,'files':len(inputs),'copiedBytes':sum(x['copy'].get('bytes',0) for x in inputs),'inputs':inputs},indent=2)+'\n')
print(json.dumps({'files':len(inputs),'bytes':sum(x['copy'].get('bytes',0) for x in inputs),'node':node_pin['sha256']}))
