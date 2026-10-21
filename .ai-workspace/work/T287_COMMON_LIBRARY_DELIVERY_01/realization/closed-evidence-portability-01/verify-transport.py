"""Read-only verifier for this closed evidence handoff. Never runs ABIogenesis or opens original absolute paths."""
from pathlib import Path, PurePosixPath
import argparse,collections,gzip,hashlib,io,json,tarfile
p=argparse.ArgumentParser();p.add_argument('--repo-root',type=Path);args=p.parse_args()
D=Path(__file__).resolve().parent;ROOT=(args.repo_root or D.parents[4]).resolve();LIMIT=1024**3

def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def exact(p,h,n=None):
 if p.is_symlink() or not p.is_file():raise RuntimeError('Missing/nonregular transport file: '+str(p))
 if n is not None and p.stat().st_size!=n:raise RuntimeError('Size mismatch: '+str(p))
 if sha(p)!=h:raise RuntimeError('Hash mismatch: '+str(p))
def read(n):return json.loads((D/n).read_text())
def safe_relative(s):
 p=PurePosixPath(s)
 if p.is_absolute() or '..' in p.parts:raise RuntimeError('Unsafe portable path: '+s)
 return p
# A reviewer externally pins freeze.json; it binds manifest.json and every final carrier file.
final_frozen=(D/'freeze.json').exists()
if final_frozen:
 f=read('freeze.json');exact(D/'manifest.json',f['manifest_sha256'])
 for row in read('manifest.json')['records']:exact(D/row['path'],row['sha256'],row['bytes'])
for row in read('transport-manifest-02.json')['records']:exact(D/row['path'],row['sha256'],row['bytes'])
exact(D/'whitelist-freeze-02.json','6a40b1435e5998efadd947c168bebbc2221c8f3e084a869859190e9a773241ff')
for row in read('whitelist-freeze-02.json')['records']:exact(D/row['path'],row['sha256'],row['bytes'])
objects=read('archive-object-plan-02.json')['objects'];groups=collections.defaultdict(dict)
for o in objects:groups[o['archive']][o['member']]=o
package_rows=read('package-member-inventory-02.json');wanted={p['transport']['member'] for p in package_rows};package_payload={};verified_objects={}
for a in read('archives-02.json')['archives']:
 path=D/a['path'];exact(path,a['sha256'],a['compressed_bytes']);seen=set()
 with tarfile.open(path,'r:gz') as tf:
  for m in tf:
   safe_relative(m.name)
   if not m.isfile() or m.name not in groups[a['path']] or m.name in seen:raise RuntimeError('Unexpected member: '+m.name)
   expected=groups[a['path']][m.name];stream=tf.extractfile(m);h=hashlib.sha256();chunks=[] if m.name in wanted else None
   for b in iter(lambda:stream.read(1024*1024),b''):
    h.update(b)
    if chunks is not None:chunks.append(b)
   if h.hexdigest()!=expected['sha256'] or m.size!=expected['bytes']:raise RuntimeError('Payload mismatch: '+m.name)
   if chunks is not None:package_payload[m.name]=b''.join(chunks)
   seen.add(m.name);verified_objects[(a['path'],m.name)]=(h.hexdigest(),m.size)
 if seen!=set(groups[a['path']]):raise RuntimeError('Incomplete archive: '+a['path'])
 n=0;h=hashlib.sha256()
 with gzip.open(path,'rb') as g:
  for b in iter(lambda:g.read(1024*1024),b''):n+=len(b);h.update(b)
 if n>LIMIT or n!=a['uncompressed_tar_bytes'] or h.hexdigest()!=a['uncompressed_tar_sha256']:raise RuntimeError('Uncompressed extent mismatch: '+a['path'])
package_members={}
for package in package_rows:
 data=package_payload[package['transport']['member']]
 if hashlib.sha256(data).hexdigest()!=package['sha256']:raise RuntimeError('Original package archive mismatch')
 expected={x['member']:x for x in package['verified_members']};seen=set()
 with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as tf:
  for m in tf:
   if m.isdir():continue
   safe_relative(m.name)
   if not m.isfile() or m.name not in expected or m.name in seen:raise RuntimeError('Unexpected original package member')
   row=expected[m.name];h=hashlib.sha256(tf.extractfile(m).read()).hexdigest()
   if h!=row['sha256'] or m.size!=row['bytes']:raise RuntimeError('Original package member mismatch: '+m.name)
   seen.add(m.name);package_members[(package['sha256'],m.name)]=(h,m.size)
 if seen!=set(expected):raise RuntimeError('Original package member set mismatch')
repo_checked={};counts=collections.Counter();w=read('whitelist-02.json')
for row in w['rows']:
 t=row['transport'];want=(row['sha256'],row['bytes']);counts[t['kind']]+=1
 if t['kind']=='repository_file':
  rel=str(safe_relative(t['path']))
  if rel not in repo_checked:exact(ROOT/rel,*want);repo_checked[rel]=want
  if repo_checked[rel]!=want:raise RuntimeError('Conflicting repository identity: '+rel)
 elif t['kind']=='archive_object':
  if verified_objects[(t['archive'],t['member'])]!=want:raise RuntimeError('Object address mismatch')
 elif t['kind']=='package_member':
  if package_members[(t['archive_sha256'],t['member'])]!=want:raise RuntimeError('Package address mismatch')
 else:raise RuntimeError('Unknown representation')
print(json.dumps({'verified':True,'final_freeze_present':final_frozen,'selected_source_addresses':len(w['rows']),'unique_repository_files_verified':len(repo_checked),'representations':dict(counts),'archive_count':len(groups),'archive_objects_verified':len(verified_objects),'package_members_verified':len(package_members),'original_absolute_paths_opened':0,'Product_execution':0,'copy_identity_is_original_authority':False},indent=2))
