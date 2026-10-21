from pathlib import Path
import json,hashlib,stat,os,sys,urllib.parse,datetime
root=Path('/Users/jim/src/apps/abiogenesis');d=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();sha=lambda b:hashlib.sha256(b).hexdigest();basis=json.loads((d/'preflight-basis.json').read_text())
def check(row,base=root):
 p=Path(base)/row['path'];s=p.lstat()
 if 'mode'in row:assert stat.S_IMODE(s.st_mode)==(int(row['mode'],0) if isinstance(row['mode'],str) else row['mode']),str(p)+' mode'
 if row.get('type',row.get('kind'))=='symlink':assert p.is_symlink() and os.readlink(p)==row['target'];assert p.resolve().is_relative_to(Path(base).resolve())
 else:
  assert p.is_file() and sha(p.read_bytes())==row['sha256'],str(p)
  if 'bytes'in row:assert s.st_size==row['bytes'],str(p)
counts=[];prefixes=[]
try:
 for item in basis['freezes']:
  check(item['freeze']);o=json.loads(Path(item['freeze']['path']).read_text());rows=o.get('files',o.get('records',[]))
  for row in rows:check(row)
  counts.append({'scope':item['subject'],'rows':len(rows),'mismatches':0})
 for item in basis['inventories']:
  inv=item['inventory'];check(inv);rows=json.loads(Path(inv['path']).read_text())['files']
  for row in rows:check(row,inv['root'])
  counts.append({'scope':item['lane']+' '+inv['path'],'rows':len(rows),'mismatches':0})
 for item in basis['emittedModules']:check(item)
 for item in basis['originalExactPins']:check(item)
 for name in ['l4-p1-baseline-01','l4-p3-baseline-successor-01']:
  q=root/'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization'/name/'result.json';v=json.loads(q.read_text());h=v.get('actualCloseHandoff',v.get('closeHandoff'));assert h,name
  prefix=h['prefix'];p=Path(urllib.parse.urlparse(prefix['eventLogRef']).path);b=p.read_bytes();assert len(b)==prefix['prefixLength'] and 'sha256:'+sha(b)==prefix['prefixDigest'];s=p.stat();assert s.st_dev==prefix['storeIdentity']['device'] and s.st_ino==prefix['storeIdentity']['inode'];prefixes.append({'subject':name,'prefix':prefix,'unchanged':True})
 main=basis['protectedMain']['inventory'];check(main);rows=json.loads(Path(main['path']).read_text())['files']
 for row in rows:check(row)
 counts.append({'scope':'protected main','rows':len(rows),'mismatches':0})
 answer={'status':'satisfied','counts':counts,'originalEndpointPrefixes':prefixes,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Read-only exact preserved stages and old endpoint files; no old EventStore acquisition'}
except Exception as e:answer={'status':'stopped','firstCause':repr(e),'countsSoFar':counts,'stop':'Return Root; no repair/retry/next lane'}
with out.open('x') as f:json.dump(answer,f,indent=2);f.write('\n')
print(json.dumps({'status':answer['status'],'firstCause':answer.get('firstCause'),'counts':len(counts)}))
if answer['status']!='satisfied':sys.exit(1)
