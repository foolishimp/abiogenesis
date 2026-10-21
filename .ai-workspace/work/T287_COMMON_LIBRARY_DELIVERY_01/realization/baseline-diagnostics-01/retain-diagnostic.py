from pathlib import Path
import json,hashlib,stat,os,sys,subprocess,datetime,shutil
lane=Path(sys.argv[1]).resolve();c=json.loads((lane/'diagnostic-configuration.json').read_text());runtime=json.loads(Path(c['originalConfiguration']['path']).read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
def write(p,v):
 with p.open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def row(p):
 s=p.lstat();x={'path':str(p),'mode':oct(stat.S_IMODE(s.st_mode)),'device':s.st_dev,'inode':s.st_ino}
 if p.is_symlink():x.update(type='symlink',target=os.readlink(p))
 elif p.is_dir():x.update(type='directory')
 elif p.is_file():x.update(type='file',bytes=s.st_size,sha256=sha(p.read_bytes()))
 else:raise AssertionError('Unexpected node kind '+str(p))
 return x
roots={**runtime['lanes'][c['lane']]['roots'],'diagnostic':c['diagnosticRoot'],'cache':runtime['environment']['npm_config_cache']};rows=[];footprints=[]
for label,path in roots.items():
 root=Path(path)
 if not os.path.lexists(root):footprints.append({'label':label,'root':path,'present':False});continue
 selected=[row(root)]+[row(q) for q in sorted(root.rglob('*'))];rows.extend(selected);files=[x for x in selected if x['type']=='file']
 du=subprocess.run(['/usr/bin/du','-sk',path],capture_output=True,env={'PATH':'/usr/bin:/bin','LANG':'C'});assert du.returncode==0,du.stderr.decode()
 footprints.append({'label':label,'root':path,'files':len(files),'logicalBytes':sum(x['bytes'] for x in files),'links':sum(x['type']=='symlink' for x in selected),'allocatedKiB':int(du.stdout.split()[0]),'argv':['/usr/bin/du','-sk',path],'stdout':du.stdout.decode(),'stderr':du.stderr.decode(),'scope':'Retained exit root; no peak, unique-data or CoW-exclusive allocation claim'})
write(lane/'physical-resources.json',{'roots':roots,'files':rows,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'retention':'No cleanup. Raw traces/process records stay at exact diagnostic root; installed payload stays at actual fresh roots.'})
write(lane/'footprints.json',{'roots':footprints,'scope':'After original workload and passive analysis; includes retained observer trace and result overhead. Post-run inventory/du work is outside the timed workload.'})
evidence=Path(roots['evidence']);target=lane/'evidence';target.mkdir();mapping=[];excluded=0
if evidence.exists():
 for q in sorted(evidence.rglob('*')):
  if q.is_dir() and not q.is_symlink():continue
  if q.relative_to(evidence).parts[:2]==('sandbox','installed'):excluded+=1;continue
  assert q.is_file() and not q.is_symlink(),str(q)
  dst=target/q.relative_to(evidence);dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(q,dst);a=row(q);b=row(dst);assert (a['sha256'],a['bytes'],a['mode'])==(b['sha256'],b['bytes'],b['mode']);mapping.append({'original':a,'portable':b})
write(lane/'portable-evidence-map.json',{'files':mapping,'excludedInstalledPayloadFiles':excluded,'relation':'Exact bytes/modes, not inode identity; full installed payload retained and inventoried in original physical roots'})
cache=Path(roots['cache']);cacheRows=[{**x,'path':str(Path(x['path']).relative_to(cache))} for x in rows if Path(x['path'])==cache or cache in Path(x['path']).parents]
write(lane/'cache-inventory.json',{'root':str(cache),'initialSeed':{'kind':'explicit_empty_seed','files':[]},'files':cacheRows,'globalCacheSelected':False,'networkFallback':False})
print(json.dumps({'physicalEntries':len(rows),'portableCaseFiles':len(mapping),'footprints':footprints}))
