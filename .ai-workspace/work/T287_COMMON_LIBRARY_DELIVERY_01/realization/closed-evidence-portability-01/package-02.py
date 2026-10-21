"""Filesystem-only packaging of the single frozen PORTABILITY-INVENTORY-READER-02 whitelist."""
from pathlib import Path
import os,stat,json,hashlib,tarfile,gzip,collections,time,datetime,traceback
D=Path(__file__).parent;ROOT=D.parents[4];LIMIT=1024**3
WF='6a40b1435e5998efadd947c168bebbc2221c8f3e084a869859190e9a773241ff'
def digest(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def write(n,o):
 with (D/n).open('x') as f:json.dump(o,f,indent=2);f.write('\n')
def lstat_regular(p):
 for a in p.parents:
  if stat.S_ISLNK(os.lstat(a).st_mode):raise RuntimeError('Symlink ancestor: '+str(a))
 z=os.lstat(p)
 if not stat.S_ISREG(z.st_mode):raise RuntimeError('Source not regular: '+str(p))
 return z
started=datetime.datetime.now(datetime.timezone.utc).isoformat();done=[]
try:
 if digest(D/'whitelist-freeze-02.json')!=WF:raise RuntimeError('Whitelist freeze changed')
 frozen=json.loads((D/'whitelist-freeze-02.json').read_text())
 for r in frozen['records']:
  if digest(D/r['path'])!=r['sha256']:raise RuntimeError('Whitelist input changed: '+r['path'])
 plan=json.loads((D/'archive-object-plan-02.json').read_text());by_archive=collections.defaultdict(list)
 for row in plan['objects']:by_archive[row['archive']].append(row)
 for name,rows in sorted(by_archive.items()):
  start=time.monotonic();target=D/name
  with target.open('xb') as raw,gzip.GzipFile(filename='',mode='wb',fileobj=raw,mtime=0,compresslevel=6) as gz,tarfile.open(mode='w',fileobj=gz,format=tarfile.USTAR_FORMAT) as tf:
   for r in sorted(rows,key=lambda x:x['member']):
    p=Path(r['source']);z=lstat_regular(p)
    if z.st_size!=r['bytes'] or digest(p)!=r['sha256']:raise RuntimeError('Source changed before archive: '+str(p))
    info=tarfile.TarInfo(r['member']);info.size=r['bytes'];info.mode=0o644;info.uid=info.gid=0;info.uname=info.gname='';info.mtime=0
    with open(p,'rb') as src:tf.addfile(info,src)
  expected={r['member']:r for r in rows};seen=set()
  with tarfile.open(target,'r:gz') as tf:
   for m in tf:
    if not m.isfile() or m.name not in expected or m.name in seen:raise RuntimeError('Unexpected archive member: '+m.name)
    r=expected[m.name];h=hashlib.sha256();stream=tf.extractfile(m)
    for b in iter(lambda:stream.read(1024*1024),b''):h.update(b)
    if m.size!=r['bytes'] or h.hexdigest()!=r['sha256']:raise RuntimeError('Archive payload mismatch: '+m.name)
    seen.add(m.name)
  if seen!=set(expected):raise RuntimeError('Archive member set mismatch: '+name)
  raw_bytes=0;raw_hash=hashlib.sha256()
  with gzip.open(target,'rb') as g:
   for b in iter(lambda:g.read(1024*1024),b''):
    raw_bytes+=len(b);raw_hash.update(b)
    if raw_bytes>LIMIT:raise RuntimeError('Archive exceeds 1 GiB: '+name)
  done.append({'path':name,'sha256':digest(target),'compressed_bytes':target.stat().st_size,'uncompressed_tar_bytes':raw_bytes,'uncompressed_tar_sha256':raw_hash.hexdigest(),'payload_bytes':sum(x['bytes'] for x in rows),'objects':len(rows),'wall_seconds':time.monotonic()-start,'all_payloads_verified':True,'symlinks':0,'hardlinks':0})
 # Repeat all selected original source hashes and their current captured identity metadata.
 w=json.loads((D/'whitelist-02.json').read_text());meta={x['path']:x for x in json.loads((D/'original-metadata-02.json').read_text())['rows']}
 for row in w['rows']:
  p=Path(row['path']);z=lstat_regular(p);m=meta[str(p)]
  if (z.st_dev,z.st_ino,z.st_size,stat.S_IMODE(z.st_mode),z.st_nlink,z.st_mtime_ns,z.st_ctime_ns)!=(m['device'],m['inode'],m['size'],int(m['mode'],8),m['nlink'],m['mtime_ns'],m['ctime_ns']):raise RuntimeError('Original metadata changed during packaging: '+str(p))
  if digest(p)!=row['sha256']:raise RuntimeError('Original bytes changed during packaging: '+str(p))
 for s,m in meta.items():
  if m['kind']=='file':continue
  z=os.lstat(s)
  if (z.st_dev,z.st_ino,z.st_mtime_ns,z.st_ctime_ns)!=(m['device'],m['inode'],m['mtime_ns'],m['ctime_ns']):raise RuntimeError('Original residue metadata changed: '+s)
  if m['kind']=='symlink' and os.readlink(s)!=m['target']:raise RuntimeError('Original link changed: '+s)
 write('archives-02.json',{'kind':'closed_evidence_transport_archives','whitelist_freeze_sha256':WF,'started':started,'closed':datetime.datetime.now(datetime.timezone.utc).isoformat(),'archives':done,'original_source_count_rechecked':len(w['rows']),'original_metadata_count_rechecked':len(meta),'originals_unchanged':True,'no_event_owner_acquired':True,'copied_metadata_confers_original_authority':False})
 print(json.dumps({'archives':done,'sources_rechecked':len(w['rows']),'originals_unchanged':True}))
except Exception as e:
 write('packaging-first-failure-02.json',{'error':str(e),'traceback':traceback.format_exc(),'completed_archives':done,'stop':True,'originals_not_intentionally_changed':True})
 raise
