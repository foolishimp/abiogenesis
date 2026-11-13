#!/usr/bin/env python3
"""Capture B03 partial work and trace identities; no Product writes or calls."""
from pathlib import Path
import hashlib,io,json,subprocess,tarfile
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
dest=base/'attempt-005';work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood');sha=lambda b:hashlib.sha256(b).hexdigest()
grant=json.loads((base/'increment-b-01/grant.json').read_bytes());paths=grant['existingPaths']+grant['newPaths']
prior=json.loads((base/'increment-b-03/B02_SOURCE_CUSTODY.json').read_bytes());old={r['path']:r['current'] for r in prior['rows']}
assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()=='927b8c0b84915ea2c926115902c2ceeef6df26a3'
status=subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],cwd=work)
changes={s[3:]:s[:2] for s in status.decode().split('\0') if s};assert len(changes)==14 and set(changes)<=set(paths)
rows=[];copies={}
for p in paths:
 file=work/p;assert file.is_file() and not file.is_symlink(),p;data=file.read_bytes()
 current={'state':'file','sha256':sha(data),'bytes':len(data)};rows.append({'path':p,'beforeB03':old[p],'current':current,'gitStatus':changes.get(p,'  ')})
 if p in changes:copies[p]=data
archive=dest/'b03-partial-source-local.tar'
with tarfile.open(archive,'x',format=tarfile.PAX_FORMAT) as out:
 for path,data in sorted(copies.items()):
  entry=tarfile.TarInfo(path);entry.size=len(data);entry.mode=0o644;entry.mtime=0;entry.uid=entry.gid=0;entry.uname=entry.gname='';out.addfile(entry,io.BytesIO(data))
archiveRoot=base/'setup-001/resources/archives';stem='fp-91c8dc01ceb1afa5';artifacts=[]
for suffix in ('stdout.log','stderr.log','prompt.txt','output.txt','transport.json'):
 p=archiveRoot/(stem+'-'+suffix);before=p.stat();data=p.read_bytes();after=p.stat()
 assert (before.st_size,before.st_mtime_ns)==(after.st_size,after.st_mtime_ns),p
 artifacts.append({'path':str(p),'sha256':sha(data),'bytes':len(data)})
stdout=(archiveRoot/(stem+'-stdout.log')).read_bytes();tools=[];terminal=0
for line in stdout.splitlines():
 try:e=json.loads(line)
 except (UnicodeDecodeError,ValueError):continue
 if e.get('type')=='result':terminal+=1
 if e.get('type')!='assistant':continue
 for block in e.get('message',{}).get('content',[]):
  if block.get('type')!='tool_use':continue
  i=block.get('input',{});raw=json.dumps(i,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
  tools.append({'tool':block.get('name'),'toolUseId':block.get('id'),'inputSha256':sha(raw),'inputBytes':len(raw),
   'filePath':i.get('file_path') if isinstance(i.get('file_path'),str) else None})
transport=json.loads((archiveRoot/(stem+'-transport.json')).read_bytes())
record={'kind':'b03_partial_source_and_trace_custody','status':'no successful Construction Result; parent closing',
 'sourceBase':'927b8c0b84915ea2c926115902c2ceeef6df26a3','grantPaths':len(paths),'changedPaths':len(changes),'outsideGrant':[],
 'rows':rows,'archive':{'path':str(archive),'bytes':archive.stat().st_size,'sha256':sha(archive.read_bytes())},
 'traceArtifacts':artifacts,'providerTerminalResultRows':terminal,'providerCostUsd':None,'toolUseCount':len(tools),'lastTools':tools[-12:],
 'transportReported':{k:transport.get(k) for k in ['disposition','failureClass','timedOut','timeoutClass','status','signal','terminationConfirmed','nativeResultAssessment']},
 'budget':{'knownReportedUsd':'64.4884394','constructionCost':'unknown','reserveUsd':'8','effectiveCeilingUsd':'72.4884394'},
 'limits':['Git final-state status does not prove no transient/off-scope effects','Raw trace retained at native paths; tool inputs shown only by digest',
 'Transport fields do not alone establish the cause or exact physical termination instant','No Product acceptance, native Construction Result or cost estimate is invented']}
out=(json.dumps(record,sort_keys=True,indent=2)+'\n').encode()
with (dest/'B03_PARTIAL_CUSTODY.json').open('xb') as f:f.write(out)
print(json.dumps({'changed':len(changes),'archiveBytes':archive.stat().st_size,'archiveSha256':sha(archive.read_bytes()),'custodySha256':sha(out),'terminalResultRows':terminal,'toolUses':len(tools)}))
