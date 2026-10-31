#!/usr/bin/env python3
"""Capture B02 source and raw structured-return identities, not a Run handoff."""
from pathlib import Path
import hashlib,io,json,subprocess,tarfile
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
dest=base/'increment-b-03';work=Path('/Users/jim/src/apps/abiogenesis-rc3-dogfood')
sha=lambda x:hashlib.sha256(x).hexdigest()
grant=json.loads((base/'increment-b-01/grant.json').read_bytes());paths=grant['existingPaths']+grant['newPaths']
prior=json.loads((base/'increment-b-02/PARTIAL_CUSTODY.json').read_bytes());old={r['path']:r['current'] for r in prior['rows']}
expected='927b8c0b84915ea2c926115902c2ceeef6df26a3';assert subprocess.check_output(['/usr/bin/git','rev-parse','HEAD'],cwd=work,text=True).strip()==expected
raw=subprocess.check_output(['/usr/bin/git','status','--porcelain=v1','-z','--untracked-files=all','--','build_tenants/abiogenesis/typescript'],cwd=work)
changes={s[3:]:s[:2] for s in raw.decode().split('\0') if s};assert len(changes)==13 and set(changes)<=set(paths)
rows=[];copies={}
for path in paths:
 p=work/path;assert p.is_file() and not p.is_symlink(),path;data=p.read_bytes()
 row={'path':path,'beforeB02':old[path],'current':{'state':'file','sha256':sha(data),'bytes':len(data)},'gitStatus':changes.get(path,'  ')}
 rows.append(row)
 if path in changes:copies[path]=data
archive=dest/'b02-source-local.tar'
with tarfile.open(archive,'x',format=tarfile.PAX_FORMAT) as tar:
 for path,data in sorted(copies.items()):
  entry=tarfile.TarInfo(path);entry.size=len(data);entry.mode=0o644;entry.mtime=0;entry.uid=entry.gid=0;entry.uname=entry.gname='';tar.addfile(entry,io.BytesIO(data))
stream=base/'setup-001/resources/archives/fp-7e1b1b843f520577-stdout.log';data=stream.read_bytes()
events=[json.loads(line) for line in data.splitlines() if line.strip()];terminal=[e for e in events if e.get('type')=='result']
assert len(terminal)==1 and terminal[0]['subtype']=='success' and isinstance(terminal[0].get('structured_output'),dict)
structured=terminal[0]['structured_output'];out=(json.dumps(structured,indent=2,ensure_ascii=False)+'\n').encode()
with (dest/'B02_STRUCTURED_RETURN.json').open('xb') as f:f.write(out)
receipt={'kind':'b02_native_construction_source_custody','status':'source and native stream snapshot; final Run handoff pending',
 'baseCommit':expected,'grantSha256':sha((base/'increment-b-01/grant.json').read_bytes()),'changedPaths':len(changes),'grantPaths':len(paths),'outsideGrant':[],
 'rows':rows,'sourceArchive':{'path':str(archive),'sha256':sha(archive.read_bytes()),'bytes':archive.stat().st_size},
 'nativeStructuredReturn':{'streamPath':str(stream),'streamSha256':sha(data),'streamBytes':len(data),'terminalSubtype':terminal[0]['subtype'],
 'reportedUsd':terminal[0].get('total_cost_usd'),'structuredReturnPath':str(dest/'B02_STRUCTURED_RETURN.json'),'structuredReturnSha256':sha(out)},
 'rootReportedAdmittedResult':'result://abiogenesis/88948ba2a35094fd1a9bb3bcf70f84bd93758438860bd812b291144f8a9dd7fd',
 'limits':['Source and structured return custody is not a successful B outcome or whole-product qualification',
 'Admitted Result coordinate is reported by Root; final independent cold handoff remains pending',
 'Git status cannot prove absence of transient or out-of-scope effects']}
b=(json.dumps(receipt,indent=2,sort_keys=True)+'\n').encode()
with (dest/'B02_SOURCE_CUSTODY.json').open('xb') as f:f.write(b)
print(json.dumps({'changed':len(changes),'archiveSha256':receipt['sourceArchive']['sha256'],'archiveBytes':archive.stat().st_size,
 'structuredSha256':sha(out),'custodySha256':sha(b),'streamSha256':sha(data)}))
