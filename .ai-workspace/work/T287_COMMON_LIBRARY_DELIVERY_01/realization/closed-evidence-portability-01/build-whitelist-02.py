"""One-shot task-local reader for Root's finite closed evidence carriers; no Product execution."""
from pathlib import Path, PurePosixPath
import os, stat, json, hashlib, tarfile, subprocess, collections, datetime, traceback
ROOT=Path('/Users/jim/src/apps/abiogenesis')
W=ROOT/'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01'
R=W/'realization'; OUT=R/'closed-evidence-portability-01'
LIMIT=1024**3
selected={}; exclusions=[]; pinned={}; metadata={}; packages={}; package_by_digest={}; source_mappings=[]
blocked=('continuation17','combined-final-02','l4-final-candidate-02/realization')
def write(n,o):
 p=OUT/n
 if p.exists():raise RuntimeError('Refuse replacement: '+str(p))
 p.write_text(json.dumps(o,indent=2)+'\n')
def digest(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def permitted(p):
 s=str(p)
 if any(x in s for x in blocked):raise RuntimeError('Excluded path: '+s)
 if not (s.startswith(str(ROOT)+'/') or s.startswith('/private/tmp/')):raise RuntimeError('Ung ranted external source: '+s)
 return p
checked_parents=set()
def no_parent_links(p):
 for a in p.parents:
  if str(a) in checked_parents:break
  z=os.lstat(a)
  if stat.S_ISLNK(z.st_mode):raise RuntimeError('Symlink ancestor: '+str(a))
  checked_parents.add(str(a))
def path_of(s,base):
 p=Path(s)
 if p.is_absolute():return permitted(p)
 if s.startswith(('.ai-workspace/','build_tenants/','specification/')) or s in ['AGENTS.md','CLAUDE.md','stdo_abiogenesis.json']:return permitted(ROOT/p)
 return permitted(base/p)
def add(p,expected,route,group='component',role='closed_record',expected_bytes=None):
 p=permitted(Path(p));s=str(p)
 if s in selected:
  if selected[s]['sha256']!=expected:raise RuntimeError('Conflicting selected identities: '+s)
  if route not in selected[s]['routes']:selected[s]['routes'].append(route)
  return
 selected[s]={'path':s,'sha256':expected,'expected_bytes':expected_bytes,'routes':[route],'group':group,'role':role}
def pin(p,expected=None,role='source_index'):
 p=Path(p);no_parent_links(p);z=os.lstat(p)
 if not stat.S_ISREG(z.st_mode):raise RuntimeError('Source index not regular: '+str(p))
 h=digest(p)
 if expected and expected!=h:raise RuntimeError('Changed source index: '+str(p))
 pinned[str(p)]={'path':str(p),'sha256':h,'bytes':z.st_size,'role':role}
 add(p,h,'exact source index',role=role,expected_bytes=z.st_size)
 return json.loads(p.read_text()) if p.suffix=='.json' else None
def add_rows(rows,base,route,group='component',role='closed_record'):
 for f in rows:add(path_of(f['path'],base),f['sha256'],route,group,role,f.get('bytes'))
def file_stats(p):
 no_parent_links(p);z=os.lstat(p)
 return z,{'path':str(p),'device':z.st_dev,'inode':z.st_ino,'mode':oct(stat.S_IMODE(z.st_mode)),'nlink':z.st_nlink,'size':z.st_size,'mtime_ns':z.st_mtime_ns,'ctime_ns':z.st_ctime_ns,'observed_at':NOW}
def add_directory(p,route,expected=None):
 p=permitted(Path(p));z,m=file_stats(p)
 if not stat.S_ISDIR(z.st_mode):raise RuntimeError('Expected retained directory: '+str(p))
 m.update(kind='directory',route=route)
 if expected:
  for k,a in [('device','device'),('inode','inode'),('dev','device'),('ino','inode')]:
   if k in expected and expected[k]!=m[a]:raise RuntimeError('Changed original directory identity: '+str(p))
 metadata[str(p)]=m
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
try:
 # Closed predecessor remains immutable; never interpreted as a completed archive.
 for n,h in [('stopped-freeze.json','3310fe6f140b414ba3daa05176bafd2d9a58e86476ad7e1839421b26fc376fc0'),('STOP.json','8cd26bf398c6b1f4d722de940bace980bde69d45498e444b4bcf998dd0173e68'),('stopped-manifest.json','402de0d0d0fac4cde279360041f3843435b7d2553bf68ad3aa4dbc7d7b2bb2a6')]:
  if digest(OUT/n)!=h:raise RuntimeError('Stopped predecessor changed: '+n)
 freezes={
 'u1-c0-physical-currentness-01':'c4a9b7100861c5f89b98399076aef7bda002f191bc0e54ab95532d074146b0f5',
 'u1-c0-physical-currentness-successor-02':'0abc3970a4bff7e7bf64db227a98e0fab9cd201d9b7d593589bd9de7636b2c8a',
 'lifetime-stream-repair-01':'8668dfa9ddbfb2fcfa860659e383e0527b009afb532e385e876384eba5b1b155',
 'e03-physical-launch-failure-01':'ca36254cec018a529ee2f92bfba29111eab93d9035e99a0787c000dcf66ef8eb',
 'e04-retained-owner-execution-01':'3c47dfc7a0c0a95374f3535e53d27273e0ce1644f254e9ac9ae31d3d0f53890b',
 'final-review-dispositions-01':'7431459688b7d57614bc451056195ff84030bc1c78fddb13a7ee81d20592efa5',
 'l4-p1-baseline-01':'5af8841ae028de12ec51f6e02402ebbe1f53fdc4b1b45e388ef3127857e8a816',
 'l4-p1-candidate-01':'a5441d50e282e6e33537c09a5b50102e383091a0dc4e7dbb0bf00fbb406ec0bb',
 'l4-p3-baseline-01':'8e0d5de565bb94670b81e09a0251755e6d53b90e8d11fa4d943272116d4cb30b',
 'l4-p3-baseline-successor-01':'5cc9b52989fa0136f850a11dee1f41cda1d6b9de858612bf3209d2c158cfe087'}
 freeze_objects={}
 for name,h in freezes.items():
  p=R/name/'freeze.json';o=pin(p,h,'closed_freeze');freeze_objects[name]=o
  if 'files' in o:add_rows(o['files'],p.parent,str(p))
  if 'manifest_sha256' in o:
   mp=p.parent/'manifest.json';m=pin(mp,o['manifest_sha256']);add_rows(m['records'],p.parent,str(mp))
 # Verify native index bytes before interpreting separate P1/P3 field variants.
 l4_inputs=[]
 for name in ['l4-p1-baseline-01','l4-p1-candidate-01','l4-p3-baseline-01','l4-p3-baseline-successor-01']:
  d=R/name;f=freeze_objects[name]
  c=pin(d/'configuration.json',f['configurationSha256'])
  inv=pin(d/'retained-resource-inventory.json',f['resourceInventorySha256'])
  variant='P1 rootFootprints + files' if 'p1' in name else 'P3 summaries + files'
  expected_kind=None if 'p1' in name else ('read_only_failure_residue_at_closed_cut' if name=='l4-p3-baseline-01' else 'closed_installed_lane_resource_cut')
  if expected_kind and inv.get('kind')!=expected_kind:raise RuntimeError('Unexpected native inventory kind: '+name)
  roots=[v for a in c['lanes'].values() for v in a['roots'].values()]
  summary=inv['rootFootprints'] if 'p1' in name else inv['summaries']
  source_mappings.append({'carrier':str(d/'retained-resource-inventory.json'),'sha256':f['resourceInventorySha256'],'variant':variant,'kind':inv.get('kind'),'file_count':len(inv['files']),'summary_count':len(summary),'selection':'files path/sha256/bytes/mode only; summaries do not select sources'})
  for row in inv['files']:
   s=row['path']
   if not any(s.startswith(x+'/') for x in roots):raise RuntimeError('Inventory path outside configured roots: '+s)
   if '/node-compile-cache/' in s:
    exclusions.append({'path':s,'sha256':row.get('sha256'),'bytes':row.get('bytes'),'route':str(d/'retained-resource-inventory.json'),'reason':'V8 generated code cache; not selected proof/source/fixture bytes; no cache portability or original executable-environment reconstruction claim'})
   else:
    add(Path(s),row['sha256'],str(d/'retained-resource-inventory.json'),'p1-baseline' if name=='l4-p1-baseline-01' else 'p1-candidate' if name=='l4-p1-candidate-01' else 'p3','closed_physical_or_installed_file',row.get('bytes'))
    selected[s]['recorded_mode']=row.get('mode')
  subject=c['subject']
  for k in ['archive','manifest','packageInventory','supportManifest']:
   row=subject[k];add(Path(row['path']),row['sha256'],str(d/'configuration.json'),role='package_archive' if k=='archive' else 'source_index')
  pm=pin(Path(subject['packageInventory']['path']),subject['packageInventory']['sha256'])
  archive=Path(subject['archive']['path']);packages[str(archive)]={'path':str(archive),'sha256':subject['archive']['sha256'],'inventory':subject['packageInventory'],'files':pm['files']}
  sm=pin(Path(subject['supportManifest']['path']),subject['supportManifest']['sha256'])
  add_rows(sm['files'],Path(sm['origin']),str(subject['supportManifest']['path']),role='closed_fixture_source')
  for row in subject['inventories']:
   pin(Path(row['path']),row['sha256'])
  l4_inputs.append((name,inv,c))
 # Original mechanically prepared package provenance; follow its explicit frozen files.
 bp=W/'proof/baseline-preparation/freeze.json';bo=pin(bp,role='closed_freeze');add_rows(bo['files'],bp.parent,str(bp))
 # Exact C0 physical inventories, original identity metadata and isolated source/emitted stage cuts.
 for name,stage in [('u1-c0-physical-currentness-01','stage-01'),('u1-c0-physical-currentness-successor-02','stage-02')]:
  d=R/name;f=freeze_objects[name];ip=d/'physical-final-inventory.json';pin(ip,selected[str(ip)]['sha256']);phys=json.loads(ip.read_text())
  for row in phys:
   if row.get('kind')=='directory':add_directory(row['path'],str(ip),row)
   else:add(Path(row['path']),row['sha256'],str(ip),role='C0_physical_residue',expected_bytes=row['bytes'])
  sp=d/'stage-execution-freeze.json';so=pin(sp,f['stage_execution_sha256']);
  for row in so['files']:add(d/stage/row['path'],row['sha256'],str(sp),role='closed_source_or_emission',expected_bytes=row.get('bytes'))
 # Exact old emitted owner used by the CX-1 falsifier, via the previous physical-scope freeze.
 pred=R/'u1-physical-scope-successor-01';po=pin(pred/'freeze.json','1d8ec427aa2486c31763bf3d40ac1afc0f0cf9dafa3032165cd996096ed868ce','closed_source_predecessor')
 pm=pin(path_of(po['manifest']['path'],pred),po['manifest']['sha256']);sp=pred/'stage-execution-freeze.json'
 bound_stage=next(x for x in pm['records'] if x['path'].endswith('/stage-execution-freeze.json'))
 so=pin(sp,bound_stage['sha256'])
 # Scope to the complete original emitted owner and source/support used by the falsifier.
 for row in so['files']:
  if row['path'].startswith('build_tenants/abiogenesis/typescript/'):
   add(pred/'stage-01'/row['path'],row['sha256'],str(sp),role='CX1_prior_source_or_emission',expected_bytes=row.get('bytes'))
 # Stream-repair source/emission stage and already-retained physical records.
 d=R/'lifetime-stream-repair-01';ip=d/'stage-post-generation-inventory.json';io=pin(ip,selected[str(ip)]['sha256']);
 for row in io:add(d/'stage'/row['path'],row['sha256'],str(ip),role='E03_closed_source_or_emission',expected_bytes=row.get('bytes'))
 exclusions.append({'source_record':str(d/'retained-case-observations.json'),'reason':'Temporary ordinary E03 case roots were governed by original cleanup hooks; their retained observations/receipts are selected, their removed scratch paths are not newly selected or reconstructed.'})
 # No-PID physical inputs and retained empty scratch directories.
 d=R/'e03-physical-launch-failure-01';f=freeze_objects[d.name];add_rows(f['externalFiles'],d,str(d/'freeze.json'),role='E03_physical_evidence')
 fp=pin(d/'preservation-and-footprint.json',selected[str(d/'preservation-and-footprint.json')]['sha256'])
 for s in fp['rootsRetained']+fp['scratchDirectories']:add_directory(s,str(d/'preservation-and-footprint.json'))
 # E04 exact external inputs except explicitly ungranted system runtime binary.
 d=R/'e04-retained-owner-execution-01';f=freeze_objects[d.name]
 for row in f['externalInputs']:
  if row['path'].startswith('/opt/'):
   exclusions.append({**row,'route':str(d/'freeze.json'),'reason':'System runtime executable is outside private proof-worksite archival grant; exact original identity remains in old input record.'})
  else:add(Path(row['path']),row['sha256'],str(d/'freeze.json'),role='E04_closed_input_or_evidence',expected_bytes=row['bytes'])
 sp=d/'scratch-retained.json';s=pin(sp,selected[str(sp)]['sha256']);root=Path(s['scratchRoot'])
 for row in s['rows']:
  p=root/row['relativePath']
  if row['kind']=='file':add(p,row['sha256'],str(sp),role='E04_physical_residue',expected_bytes=row['byteLength'])
  elif row['kind']=='directory':add_directory(p,str(sp),row)
  elif row['kind']=='symlink':
   z,m=file_stats(p);target=os.readlink(p)
   if not stat.S_ISLNK(z.st_mode) or target!=row['target']:raise RuntimeError('Changed original symlink: '+str(p))
   lexical=Path(os.path.normpath(target if os.path.isabs(target) else str(p.parent/target)))
   if not lexical.is_relative_to(root):raise RuntimeError('Uncontained symlink literal: '+str(p))
   m.update(kind='symlink',target=target,lexical_target=str(lexical),within_granted_scratch=True,target_followed=False,route=str(sp));metadata[str(p)]=m
 # Archive original artifacts, validating their entire native exact member inventory by streaming tar reads.
 for p,pack in packages.items():
  if digest(p)!=pack['sha256']:raise RuntimeError('Changed package: '+p)
  expected={x['path']:x for x in pack['files']};seen=set();rows=[]
  with tarfile.open(p,'r:gz') as tf:
   for m in tf:
    if m.isdir():continue
    if not m.isfile():raise RuntimeError('Unsupported package link or special member: '+m.name)
    if not m.name.startswith('package/') or '..' in PurePosixPath(m.name).parts:raise RuntimeError('Unsafe package member: '+m.name)
    rel=m.name[len('package/'):];row=expected.get(rel)
    if row is None or rel in seen:raise RuntimeError('Unindexed/duplicate package member: '+m.name)
    h=hashlib.sha256(tf.extractfile(m).read()).hexdigest()
    if h!=row['sha256'] or m.size!=row['bytes']:raise RuntimeError('Package member mismatch: '+m.name)
    seen.add(rel);rec={'archive_source':p,'archive_sha256':pack['sha256'],'member':m.name,'sha256':h,'bytes':m.size};rows.append(rec);package_by_digest.setdefault((h,m.size),rec)
  if seen!=set(expected):raise RuntimeError('Package member set mismatch: '+p)
  pack['verified_members']=rows
 # Fix exact source whitelist before any copy/archive. Every selected regular file is checked, including repeated installed members.
 for i,(s,row) in enumerate(selected.items()):
  p=Path(s);z,m=file_stats(p)
  if not stat.S_ISREG(z.st_mode):raise RuntimeError('Selected source not regular: '+s)
  if row['expected_bytes'] is not None and z.st_size!=row['expected_bytes']:raise RuntimeError('Changed source size: '+s)
  if row.get('recorded_mode') is not None and int(row['recorded_mode'],8)!=stat.S_IMODE(z.st_mode):raise RuntimeError('Changed source mode: '+s)
  h=digest(p)
  if h!=row['sha256']:raise RuntimeError('Changed selected source bytes: '+s)
  row['bytes']=z.st_size;m['kind']='file';metadata[s]=m
 # Original C0/E04 inode coordinates are preserved as observations, never copied authority.
 for name in ['u1-c0-physical-currentness-01','u1-c0-physical-currentness-successor-02']:
  for row in json.loads((R/name/'physical-final-inventory.json').read_text()):
   for k in ['device','inode']:
    if k in row and row[k]!=metadata[row['path']][k]:raise RuntimeError('Changed physical identity: '+row['path'])
 # Preserve E04 original identity topology as metadata, without recreating it.
 for row in json.loads((R/'e04-retained-owner-execution-01/scratch-retained.json').read_text())['rows']:
  path=str(Path('/private/tmp/abiogenesis-e04-owner-scratch-20261021-8ce2164f')/row['relativePath']);m=metadata[path]
  if any(row[k]!=m[v] for k,v in [('dev','device'),('ino','inode'),('nlink','nlink')]):raise RuntimeError('Changed E04 original identity: '+path)
 # Read-only ignore routing; 0=matches, 1=no matches are both ordinary results.
 rels=[str(Path(s).relative_to(ROOT)) for s in selected if Path(s).is_relative_to(ROOT)]
 cp=subprocess.run(['git','check-ignore','--no-index','--stdin','-z'],cwd=ROOT,input=('\0'.join(rels)+'\0').encode(),capture_output=True)
 if cp.returncode not in (0,1):raise RuntimeError('git check-ignore failed: '+cp.stderr.decode())
 ignored=set(cp.stdout.decode().strip('\0').split('\0')) if cp.stdout else set()
 repo_by_digest={}
 for s,row in selected.items():
  p=Path(s)
  if p.is_relative_to(ROOT) and str(p.relative_to(ROOT)) not in ignored:repo_by_digest.setdefault((row['sha256'],row['bytes']),str(p.relative_to(ROOT)))
 objects={}; counts=collections.Counter()
 for s,row in selected.items():
  p=Path(s);key=(row['sha256'],row['bytes']);rel=str(p.relative_to(ROOT)) if p.is_relative_to(ROOT) else None
  if rel is not None and rel not in ignored:representation={'kind':'repository_file','path':rel}
  elif row['role']!='package_archive' and key in repo_by_digest:representation={'kind':'repository_file','path':repo_by_digest[key],'relation':'byte-equal existing frozen record'}
  elif row['role']!='package_archive' and key in package_by_digest:representation={'kind':'package_member',**package_by_digest[key]}
  else:
   h=row['sha256']
   if h not in objects:objects[h]={'sha256':h,'bytes':row['bytes'],'source':s,'archive':row['group']+'-bytes.tar.gz','member':'objects/sha256/'+h}
   representation={'kind':'archive_object',**{k:objects[h][k] for k in ['archive','member']}}
  row['transport']=representation;row['repo_ignored']=rel in ignored if rel is not None else None;row.pop('expected_bytes',None);counts[representation['kind']]+=1
 # Package artifacts may have arrived first through a generic freeze row; force their exact archive representation, never resolve to their own member.
 for p,pack in packages.items():
  if selected[p]['transport']['kind']=='package_member':raise RuntimeError('Invalid self-referential package mapping')
  pack['transport']=selected[p]['transport'];pack.pop('files',None)
 estimates=collections.defaultdict(lambda:{'objects':0,'payload_bytes':0,'tar_bytes_upper_bound':10240})
 for o in objects.values():
  e=estimates[o['archive']];e['objects']+=1;e['payload_bytes']+=o['bytes'];e['tar_bytes_upper_bound']+=512+((o['bytes']+511)//512)*512
 for n,e in estimates.items():
  if e['tar_bytes_upper_bound']>LIMIT:raise RuntimeError('Archive over 1 GiB: '+n+' '+str(e))
 write('native-source-mappings-02.json',source_mappings)
 write('source-pins-02.json',list(pinned.values()))
 write('explicit-exclusions-02.json',exclusions)
 write('original-metadata-02.json',{'semantics':'Original lstat observations; copied bytes cannot reproduce eventLogRef/device/inode authority. No symlink target followed.','rows':list(metadata.values())})
 write('package-member-inventory-02.json',list(packages.values()))
 write('whitelist-02.json',{'activation':'PORTABILITY-INVENTORY-READER-02','fixed_before_archives':True,'selected_count':len(selected),'rows':list(selected.values())})
 write('archive-object-plan-02.json',{'objects':list(objects.values()),'estimates':dict(estimates),'uncompressed_limit_per_archive':LIMIT})
 summary={'selected_sources':len(selected),'representation_counts':dict(counts),'excluded_cache_files':sum('node-compile-cache' in x.get('path','') for x in exclusions),'original_metadata_count':len(metadata),'objects':len(objects),'archives':dict(estimates),'old_source_pins':len(pinned),'package_count':len(packages),'package_member_count':sum(len(p['verified_members']) for p in packages.values()),'original_sources_verified':True,'copy_or_archive_started':False}
 write('whitelist-preflight-02.json',summary)
 bound=['HOW-successor-02.md','build-whitelist-02.py','native-source-mappings-02.json','source-pins-02.json','explicit-exclusions-02.json','original-metadata-02.json','package-member-inventory-02.json','whitelist-02.json','archive-object-plan-02.json','whitelist-preflight-02.json']
 write('whitelist-freeze-02.json',{'kind':'exact_portability_whitelist_before_copy','activation':'PORTABILITY-INVENTORY-READER-02','at':NOW,'records':[{'path':n,'sha256':digest(OUT/n),'bytes':(OUT/n).stat().st_size} for n in bound],'archive_count_at_freeze':0})
 print(json.dumps(summary));print('whitelist_freeze_sha256',digest(OUT/'whitelist-freeze-02.json'))
except Exception as e:
 write('successor-first-failure-02.json',{'at':NOW,'error':str(e),'traceback':traceback.format_exc(),'selected_prefix_count':len(selected),'pinned_prefix_count':len(pinned),'script_sha256':digest(OUT/'build-whitelist-02.py'),'archive_count':0,'stop':True})
 raise
