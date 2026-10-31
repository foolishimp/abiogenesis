#!/usr/bin/env python3
"""Capture B04 source and native provider-return bytes; not a final handoff."""
from pathlib import Path
import hashlib,io,json,subprocess,tarfile
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');dest=base/'increment-b-05';work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood');sha=lambda b:hashlib.sha256(b).hexdigest()
grant=json.loads((base/'increment-b-01/grant.json').read_bytes());paths=grant['existingPaths']+grant['newPaths'];prior=json.loads((base/'attempt-005/B03_PARTIAL_CUSTODY.json').read_bytes());old={r['path']:r['current'] for r in prior['rows']}
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()=='927b8c0b84915ea2c926115902c2ceeef6df26a3'
status=subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],cwd=work)
changes={s[3:]:s[:2] for s in status.decode().split('\0') if s};assert len(changes)==14 and set(changes)<=set(paths)
rows=[];copies={}
for name in paths:
 p=work/name;st=p.stat();assert p.is_file() and not p.is_symlink();data=p.read_bytes();after=p.stat();assert (st.st_size,st.st_mtime_ns)==(after.st_size,after.st_mtime_ns)
 current={'state':'file','sha256':sha(data),'bytes':len(data)};rows.append({'path':name,'beforeB04':old[name],'current':current,'gitStatus':changes.get(name,'  ')})
 if name in changes:copies[name]=data
delta=[x['path'] for x in rows if x['beforeB04']!=x['current']];expected={'build_tenants/abiogenesis/typescript/code/src/abg/actor_process.ts','build_tenants/abiogenesis/typescript/code/src/abg/governed_context.ts','build_tenants/abiogenesis/typescript/test_env/tests/t287-governed-context.test.mjs','build_tenants/abiogenesis/typescript/design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md','build_tenants/abiogenesis/typescript/design/T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md','build_tenants/abiogenesis/typescript/release-claim.md'}
assert set(delta)==expected,(delta,expected)
archive=dest/'b04-source-local.tar'
with tarfile.open(archive,'x',format=tarfile.PAX_FORMAT) as out:
 for name,data in sorted(copies.items()):
  entry=tarfile.TarInfo(name);entry.size=len(data);entry.mode=0o644;entry.mtime=0;entry.uid=entry.gid=0;entry.uname=entry.gname='';out.addfile(entry,io.BytesIO(data))
archives=base/'setup-001/resources/archives';traces=[]
for stem in ['fp-95e0c01a4a6ac5c9','fp-b35290ed2a921c20']:
 artifacts=[]
 for suffix in ('stdout.log','stderr.log','prompt.txt','output.txt','transport.json'):
  p=archives/(stem+'-'+suffix);before=p.stat();data=p.read_bytes();after=p.stat();assert (before.st_size,before.st_mtime_ns)==(after.st_size,after.st_mtime_ns)
  artifacts.append({'path':str(p),'sha256':sha(data),'bytes':len(data)})
 raw=(archives/(stem+'-stdout.log')).read_bytes();events=[]
 for line in raw.splitlines():
  try:event=json.loads(line)
  except (UnicodeDecodeError,ValueError):continue
  if event.get('type')=='result':events.append(event)
 assert len(events)==1 and events[0].get('subtype')=='success' and isinstance(events[0].get('structured_output'),dict)
 output=(json.dumps(events[0]['structured_output'],ensure_ascii=False,indent=2)+'\n').encode();out=dest/(stem+'-structured-return.json')
 with out.open('xb') as f:f.write(output)
 traces.append({'stem':stem,'artifacts':artifacts,'terminalSubtype':'success','reportedUsd':events[0].get('total_cost_usd'),'structuredReturn':{'path':str(out),'bytes':len(output),'sha256':sha(output)}})
receipt={'kind':'b04_native_construction_source_custody','status':'provider-return and partial source retained; final native handoff and readbacks pending',
 'baseCommit':'927b8c0b84915ea2c926115902c2ceeef6df26a3','grantSha256':sha((base/'increment-b-01/grant.json').read_bytes()),'changedPaths':len(changes),'deltaFromB03':delta,'outsideGrant':[],
 'rows':rows,'sourceArchive':{'path':str(archive),'sha256':sha(archive.read_bytes()),'bytes':archive.stat().st_size},'nativeStreams':traces,
 'rootReportedAdmittedResult':'result://abiogenesis/805f22b9f6fb550e8383b0f9003e27665f78ce724d34aa235ed15bbab23d705f',
 'limits':['Admitted Result coordinate is reported by Root; actual final handoff and readbacks remain pending','Partial work is not accepted B outcome, actual C2 or whole Product qualification','Git status cannot prove absence of transient or out-of-scope effects']}
b=(json.dumps(receipt,indent=2,sort_keys=True)+'\n').encode()
with (dest/'B04_SOURCE_CUSTODY.json').open('xb') as f:f.write(b)
print(json.dumps({'changed':len(changes),'deltaFromB03':len(delta),'archiveSha256':receipt['sourceArchive']['sha256'],'archiveBytes':archive.stat().st_size,'custodySha256':sha(b),'terminalCosts':[t['reportedUsd'] for t in traces]}))
