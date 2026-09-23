#!/usr/bin/env python3
import importlib.util,json,os,sys
from pathlib import Path
repo=Path(sys.argv[1]).resolve();root=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-01';out=root/sys.argv[2]
spec=importlib.util.spec_from_file_location('transport',root/'checkpoint_transport.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
selected=[os.fsdecode(x)for x in Path(sys.argv[3]).read_bytes().split(b'\0')if x]
out.mkdir(exist_ok=False);m.CHECKPOINT=str(out.relative_to(repo))
m.prepare(repo,out,[],selected=selected)
restoration=Path('/private/tmp')/('20260923-checkpoint-'+repo.name+'-'+out.name+'-'+str(os.getpid()));restoration.mkdir(exist_ok=False)
result=m.verify(out,repo,restoration);m.write_json(out/'restoration-verification.json',result)
m.write_json(out/'verification.json',result)
print(json.dumps({'closed':True,'repository':repo.name,'transport':str(out),'restored':str(restoration)}),flush=True)
