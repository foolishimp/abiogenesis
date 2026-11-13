from pathlib import Path
import json, hashlib, subprocess, os, datetime
N=Path(__file__).parent;R=N/'runtime-001';F=Path('/private/tmp/abg-rc11-foundation-20261110-01')
calls=[];seen=set()
for p in (R/'resources/archives').glob('*stdout.log'):
 for line in p.open():
  try:v=json.loads(line)
  except (ValueError,UnicodeError):continue
  if v.get('type')!='assistant':continue
  for c in v.get('message',{}).get('content',[]):
   if c.get('type')=='tool_use' and c.get('id') not in seen:seen.add(c['id']);calls.append(c)
g=json.loads((N/'PRESERVATION_GUARDS.json').read_text());s=json.loads((N/'SOURCE_SUBJECT.json').read_text());drift=[]
for x in g['pins']+s['readOnlyA']:
 p=Path(x['path']);b=p.read_bytes()
 if len(b)!=x['bytes'] or hashlib.sha256(b).hexdigest()!=x['sha256']:drift.append(x['path'])
before=json.loads(Path(s['sourceInventory']['path']).read_text());changed=[]
for x in before['rows']:
 p=F/x['path'];b=p.read_bytes()
 if len(b)!=x['bytes'] or hashlib.sha256(b).hexdigest()!=x['sha256']:changed.append(x['path'])
target=str(Path(s['onlyTarget']['path']).relative_to(F));offscope=[x for x in changed if x!=target]
process=subprocess.run(['/bin/ps','-p','8454,10528','-o','pid=,ppid=,pgid=,stat=,etime=,comm='],capture_output=True,text=True).stdout.strip()
v=dict(utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),publicToolCount=len(calls),latestPublicTools=[dict(id=c['id'],name=c['name'],description=c.get('input',{}).get('description'),file=c.get('input',{}).get('file_path')) for c in calls[-3:]],sourceWriteCalls=[dict(id=c['id'],name=c['name'],file=c.get('input',{}).get('file_path')) for c in calls if c['name'] in ['Write','Edit']],changedPaths=changed,offScopeChangedPaths=offscope,protectionDrift=drift,process=process,finalPresent=(R/'FINAL.json').exists())
with (N/'MONITOR.jsonl').open('a') as h:h.write(json.dumps(v)+'\n')
v['sourceWriteCalls']=v['sourceWriteCalls'][-3:];print(json.dumps(v))
