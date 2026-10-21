from pathlib import Path
import json,hashlib,stat,os,sys,shutil,subprocess,datetime
lane=Path(sys.argv[1]);config=json.loads((lane/'configuration.json').read_text());name=sys.argv[2]
assert name in ['public-preparation','partial-install','declared-execution','owner-resolution']
sha=lambda b:hashlib.sha256(b).hexdigest()
def write(path,value):
 with path.open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def row(p):
 s=p.lstat();v={'path':str(p),'mode':oct(stat.S_IMODE(s.st_mode)),'device':s.st_dev,'inode':s.st_ino}
 if p.is_symlink():v.update(type='symlink',target=os.readlink(p))
 elif p.is_file():v.update(type='file',bytes=s.st_size,sha256=sha(p.read_bytes()))
 elif p.is_dir():v.update(type='directory')
 else:raise AssertionError('unexpected physical node kind: '+str(p))
 return v
roots=({'evidence':config['outputRoot']} if name=='owner-resolution' else config['lanes'][name]['roots'])
if config.get('environment',{}).get('npm_config_cache'):roots={**roots,'npmCache':config['environment']['npm_config_cache']}
evidence=Path(roots['evidence']);destination=lane/'evidence';assert not destination.exists();destination.mkdir();mapping=[];excluded=[]
if evidence.exists():
 for src in sorted(evidence.rglob('*')):
  if src.is_dir() and not src.is_symlink():continue
  if src.relative_to(evidence).parts[:2]==('sandbox','installed'):
   excluded.append(str(src));continue
  assert src.is_file() and not src.is_symlink(),str(src)
  dst=destination/src.relative_to(evidence);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
  before=row(src);after=row(dst);assert before['sha256']==after['sha256'] and before['bytes']==after['bytes'] and before['mode']==after['mode']
  mapping.append({'original':before,'portable':after,'relation':'exact bytes and mode copy; distinct carrier, no inode identity claim'})
write(lane/'portable-evidence-map.json',{'sourceRoot':str(evidence),'portableRoot':str(destination),'files':mapping,'excludedInstalledPayloadFiles':len(excluded),'selection':'All case evidence except sandbox/installed package payload, which remains in actual root and full physical hash/mode inventory; no package bytes silently discarded.'})
physical=[];footprints=[]
for role,path in roots.items():
 root=Path(path)
 if not os.path.lexists(root):footprints.append({'role':role,'root':path,'present':False});continue
 rows=[row(root)]+[row(p) for p in sorted(root.rglob('*'))]
 physical.extend(rows);files=[x for x in rows if x['type']=='file'];links=[x for x in rows if x['type']=='symlink']
 du=subprocess.run(['/usr/bin/du','-sk',path],capture_output=True,env={'PATH':'/usr/bin:/bin','LANG':'C'});assert du.returncode==0,du.stderr.decode()
 footprints.append({'role':role,'root':path,'files':len(files),'logicalBytes':sum(x['bytes'] for x in files),'symlinks':len(links),'allocatedKiB':int(du.stdout.split()[0]),'duArgv':['/usr/bin/du','-sk',path],'duStdout':du.stdout.decode(),'duStderr':du.stderr.decode(),'scope':'post-endpoint retained root, not an allocation peak; logical bytes count names; CoW allocation may overlap'})
write(lane/'physical-resources.json',{'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'lane':name,'roots':roots,'files':physical,'scope':'Actual retained resource observation; later explicitly granted P2 may append P1 runtime event store. This record is immutable; original physical roots are not asserted eternally unchanged.'})
write(lane/'retained-footprints.json',{'footprints':footprints,'portableEvidenceFiles':len(mapping),'portableEvidenceLogicalBytes':sum(x['portable']['bytes'] for x in mapping),'measurement':'Post-endpoint inventory/copy overhead outside timed original endpoint. Original runner evidence overhead remains included in original endpoint. Cache measured separately. Internal counters unobserved, not zero.'})
print(json.dumps({'retainedFiles':len(physical),'portableEvidenceFiles':len(mapping),'footprints':[{'role':x['role'],'files':x.get('files'),'logicalBytes':x.get('logicalBytes'),'allocatedKiB':x.get('allocatedKiB')} for x in footprints]}))
