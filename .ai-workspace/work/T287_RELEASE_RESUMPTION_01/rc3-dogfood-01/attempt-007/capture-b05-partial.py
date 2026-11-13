#!/usr/bin/env python3
"""Retain B05 source and completed Construction stream; no native call."""
from pathlib import Path
import hashlib,io,json,subprocess,tarfile
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');dest=base/'attempt-007';work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood');sha=lambda b:hashlib.sha256(b).hexdigest()
grant=json.loads((base/'increment-b-01/grant.json').read_bytes());paths=grant['existingPaths']+grant['newPaths'];prior=json.loads((base/'increment-b-05/B04_SOURCE_CUSTODY.json').read_bytes());old={r['path']:r['current'] for r in prior['rows']}
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()=='927b8c0b84915ea2c926115902c2ceeef6df26a3'
status=subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],cwd=work)
changes={s[3:]:s[:2] for s in status.decode().split('\0') if s};assert len(changes)==14 and set(changes)<=set(paths)
rows=[];copies={}
for name in paths:
 p=work/name;before=p.stat();assert p.is_file() and not p.is_symlink();data=p.read_bytes();after=p.stat();assert (before.st_size,before.st_mtime_ns)==(after.st_size,after.st_mtime_ns)
 current={'state':'file','sha256':sha(data),'bytes':len(data)};rows.append({'path':name,'beforeB05':old[name],'current':current,'gitStatus':changes.get(name,'  ')})
 if name in changes:copies[name]=data
for name,data in copies.items():assert sha((work/name).read_bytes())==sha(data),'source drift during capture: '+name
adapter='build_tenants/abiogenesis/typescript/code/support/governed-context/host_adapter.py';assert sha((work/adapter).read_bytes())=='1eb6de41473ee6158c2a830d5188e98449c1ef2ea455644017b66217651eb6f3'
archive=dest/'b05-partial-source-local.tar'
with tarfile.open(archive,'x',format=tarfile.PAX_FORMAT) as out:
 for name,data in sorted(copies.items()):
  entry=tarfile.TarInfo(name);entry.size=len(data);entry.mode=0o644;entry.mtime=0;entry.uid=entry.gid=0;entry.uname=entry.gname='';out.addfile(entry,io.BytesIO(data))
root=base/'setup-001/resources/archives';stem='fp-b75611088e92b2b6';artifacts=[]
for suffix in ('stdout.log','stderr.log','prompt.txt','output.txt','transport.json'):
 p=root/(stem+'-'+suffix);before=p.stat();data=p.read_bytes();after=p.stat();assert (before.st_size,before.st_mtime_ns)==(after.st_size,after.st_mtime_ns);artifacts.append({'path':str(p),'sha256':sha(data),'bytes':len(data)})
raw=(root/(stem+'-stdout.log')).read_bytes();terminal=[]
for line in raw.splitlines():
 try:e=json.loads(line)
 except (UnicodeDecodeError,ValueError):continue
 if e.get('type')=='result':terminal.append(e)
assert len(terminal)==1 and terminal[0].get('subtype')=='success' and isinstance(terminal[0].get('structured_output'),dict)
ret=(json.dumps(terminal[0]['structured_output'],ensure_ascii=False,indent=2)+'\n').encode();target=dest/'B05_CONSTRUCTION_RETURN.json'
with target.open('xb') as f:f.write(ret)
record={'kind':'b05_partial_construction_source_and_trace_custody','status':'provider-return and source captured; native admission, final handoff and readbacks not inferred',
 'baseCommit':'927b8c0b84915ea2c926115902c2ceeef6df26a3','grantPaths':len(paths),'changedPaths':len(changes),'outsideGrant':[],
 'deltaFromB04':[r['path'] for r in rows if r['current']!=r['beforeB05']],'rows':rows,'sourceArchive':{'path':str(archive),'sha256':sha(archive.read_bytes()),'bytes':archive.stat().st_size},
 'adapterSha256':'1eb6de41473ee6158c2a830d5188e98449c1ef2ea455644017b66217651eb6f3','traceArtifacts':artifacts,'terminalRows':1,'terminalSubtype':'success',
 'reportedUsd':terminal[0].get('total_cost_usd'),'structuredReturn':{'path':str(target),'sha256':sha(ret),'bytes':len(ret)},
 'limits':['Current partial source is not accepted B outcome or native C2','Git final-state status cannot establish absence of transient effects','Provider terminal success does not imply owner admission or completed feature']}
b=(json.dumps(record,indent=2,sort_keys=True)+'\n').encode()
with (dest/'B05_PARTIAL_CUSTODY.json').open('xb') as f:f.write(b)
print(json.dumps({'changed':len(changes),'deltaFromB04':len(record['deltaFromB04']),'outsideGrant':record['outsideGrant'],'sourceArchiveSha256':record['sourceArchive']['sha256'],'sourceArchiveBytes':archive.stat().st_size,'structuredReturnSha256':sha(ret),'custodySha256':sha(b),'reportedUsd':record['reportedUsd']}))
