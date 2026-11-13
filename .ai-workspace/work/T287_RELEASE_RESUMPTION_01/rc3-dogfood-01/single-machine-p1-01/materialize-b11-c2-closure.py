#!/usr/bin/env python3
"""Preserve the previously selected C2 closure; does not select P1's final task."""
import hashlib,json,os,stat,sys
from pathlib import Path,PurePosixPath
CARRIER=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01/single-machine-p1-01')
MANIFEST=CARRIER/'B11_C2_961_PREPARATION.json'
PIN='554172089688e2ba1768856f91d7d3b8a2409a170011fc46da5667282aa3696f'
ROOT=Path('/Users/jim/src/apps/abiogenesis-single-machine-p1')
RECEIPT=CARRIER/'B11_C2_961_MATERIALIZATION.json'
def digest(v):return hashlib.sha256(v).hexdigest()
def verify(r,data):
 if len(data)!=r['bytes'] or digest(data)!=r['sha256']:raise ValueError('source mismatch: '+r['path'])
def safe_parts(name):
 p=PurePosixPath(name)
 if p.is_absolute() or not p.parts or any(x in ('','.','..') for x in p.parts):raise ValueError('unsafe path')
 return p.parts
def main():
 if sys.argv[1:] not in ([],['--materialize']):raise ValueError('expected no argument or --materialize')
 raw=MANIFEST.read_bytes()
 if digest(raw)!=PIN:raise ValueError('manifest changed')
 d=json.loads(raw); rows=d['paths']; source=Path(d['snapshotRoot'])
 if len(rows)!=961 or len({r['path'] for r in rows})!=961 or d['targetRoot']!=str(ROOT):raise ValueError('closure identity mismatch')
 if RECEIPT.exists():raise ValueError('materialization receipt already exists')
 pending=[]
 for r in rows:
  parts=safe_parts(r['path']); original=source.joinpath(*parts); target=ROOT.joinpath(*parts)
  if not original.is_file() or original.is_symlink():raise ValueError('snapshot is not a regular file: '+r['path'])
  data=original.read_bytes();verify(r,data)
  if r['successorAtCensus']=='matched':
   if not target.is_file() or target.is_symlink():raise ValueError('matched source absent: '+r['path'])
   verify(r,target.read_bytes())
  elif r['successorAtCensus']=='missing':
   if parts[0] not in ('rc3-operator-inputs','.claude'):raise ValueError('unexpected materialization root')
   if target.exists() or target.is_symlink():raise ValueError('expected target is no longer absent: '+r['path'])
   pending.append((r,original,target))
  else:raise ValueError('unexpected census state')
 if len(pending)!=260:raise ValueError('unexpected input count')
 if not sys.argv[1:]:print(json.dumps({'status':'verified_no_write','paths':len(rows),'wouldCreate':len(pending)}));return
 for r,source_file,target in pending:
  cur=ROOT
  for part in safe_parts(r['path'])[:-1]:
   cur=cur/part
   try:cur.mkdir(mode=0o755)
   except FileExistsError:pass
   if cur.is_symlink() or not cur.is_dir():raise ValueError('unsafe parent '+str(cur))
  data=source_file.read_bytes();verify(r,data)
  fd=os.open(target,os.O_WRONLY|os.O_CREAT|os.O_EXCL|getattr(os,'O_NOFOLLOW',0),stat.S_IMODE(source_file.stat().st_mode))
  with os.fdopen(fd,'wb') as f:f.write(data)
  verify(r,target.read_bytes())
 with RECEIPT.open('x') as f:json.dump({'kind':'single_machine_p1_b11_c2_materialization','manifestSha256':PIN,'created':len(pending),'verifiedPaths':len(rows),'qualification':False,'nativeAdmission':False},f,indent=2,sort_keys=True);f.write('\n')
 print(json.dumps({'status':'materialized','created':len(pending),'receipt':str(RECEIPT)}))
if __name__=='__main__':
 try:main()
 except (ValueError,KeyError,OSError,TypeError) as e:print(json.dumps({'status':'refused_or_failed','reason':str(e)}),file=sys.stderr);sys.exit(2)
