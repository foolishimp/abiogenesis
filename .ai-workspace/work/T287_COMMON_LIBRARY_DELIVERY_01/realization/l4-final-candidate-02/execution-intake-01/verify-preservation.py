from pathlib import Path
import json,hashlib,stat,os,sys,datetime
scope=Path(sys.argv[1]);out=Path(sys.argv[2]);sha=lambda b:hashlib.sha256(b).hexdigest()
def check(p,row):
 p=Path(p);s=p.lstat();assert stat.S_IMODE(s.st_mode)==(int(row['mode'],0) if isinstance(row['mode'],str) else row['mode']),(str(p),'mode')
 if row.get('kind',row.get('type'))=='symlink':assert p.is_symlink() and os.readlink(p)==row['target'],str(p)
 else:assert p.is_file() and s.st_size==row['bytes'] and sha(p.read_bytes())==row['sha256'],str(p)
s=json.loads(scope.read_text());counts=[]
for item in s['scopes']:
 check(item['pin']['path'],item['pin']);o=json.loads(Path(item['pin']['path']).read_text());rows=o[item['rows']]
 for row in rows:check(Path(item['root'])/row['path'],row)
 counts.append({'inventory':item['pin'],'count':len(rows),'mismatches':0})
for row in s['pins']:check(row['path'],row)
with out.open('x') as f:json.dump({'status':'satisfied','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scopes':counts,'exactPins':s['pins'],'scopeSha256':sha(scope.read_bytes()),'mismatches':0},f,indent=2);f.write('\n')
print(json.dumps({'status':'satisfied','scopeCounts':[x['count'] for x in counts],'exactPins':len(s['pins'])}))
