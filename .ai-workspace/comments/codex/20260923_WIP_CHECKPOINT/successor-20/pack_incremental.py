#!/usr/bin/env python3
import gzip,hashlib,importlib.util,json,os,sys
sys.dont_write_bytecode=True
from pathlib import Path
repo=Path(sys.argv[1]).resolve();root=repo/'.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-20';previous=root.parent/'successor-01';out=root/'transport-01'
spec=importlib.util.spec_from_file_location('transport',previous/'checkpoint_transport.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
selected=[os.fsdecode(x)for x in(root/'selected-archive-paths.nul').read_bytes().split(b'\0')if x]
out.mkdir(exist_ok=False);m.CHECKPOINT=str(out.relative_to(repo));m.prepare(repo,out,[],selected=selected)
restoration=Path('/private/tmp')/('20260924-checkpoint-successor20-'+repo.name+'-'+str(os.getpid()));restoration.mkdir(exist_ok=False)
result=m.verify(out,repo,restoration);m.write_json(out/'restoration-verification.json',result);m.write_json(out/'verification.json',result)
with gzip.open(out/'members.jsonl.gz','rt')as f:rows={r['path']:r for r in map(json.loads,f)}
expected=json.loads((root/'freeze-expectations.json').read_text());checked=[]
for p,e in expected.items():
 assert p in rows,p
 row=rows[p];assert row['sha256']==e['sha256'],p
 if e['byteLength']is not None:assert row['byteLength']==e['byteLength'],p
 checked.append(p)
m.write_json(root/'frozen-member-correspondence.json',{'status':'all selected original freeze identities exact','checked':len(checked),'paths':checked,'noRuntimeResourceMutation':True,'restoration':str(restoration)})
print(json.dumps({'status':'CLOSED transport and restoration','repository':repo.name,'members':len(rows),'freezeMembersVerified':len(checked),'catalog':str(out/'catalog.json')}),flush=True)
