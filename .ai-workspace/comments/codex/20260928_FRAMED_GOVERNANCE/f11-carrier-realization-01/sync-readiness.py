import json,pathlib,shutil
r=pathlib.Path('.');o=r/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/f11-carrier-realization-01';c=o/'copied-tenant';j=json.loads((o/'source-preimages.json').read_text())
for p in j:
 f=r/p['path']
 if f.exists():dest=c/pathlib.Path(p['path']).relative_to('build_tenants/abiogenesis/typescript');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dest)
