from pathlib import Path
import json, hashlib, os, subprocess, datetime
N=Path(__file__).parent;F=Path('/private/tmp/abg-rc11-foundation-20261110-01'); R=N/'runtime-001'
calls=[];seen=set()
for p in (R/'resources/archives').glob('*stdout.log'):
 for line in p.open():
  try:v=json.loads(line)
  except (ValueError,UnicodeError):continue
  if v.get('type')!='assistant':continue
  for c in v.get('message',{}).get('content',[]):
   if c.get('type')=='tool_use' and c.get('id') not in seen:seen.add(c['id']);calls.append(c)
g=json.loads((N/'PRESERVATION_GUARDS.json').read_text());s=json.loads((N/'SOURCE_SUBJECT.json').read_text())
drift=[]
for x in g['indices']+g['mainTracking']+g['candidateTracking']+[g['builderPin'],g['archive'],g['workspaceManifest']]+s['readOnlyA']:
 p=Path(x['path']);b=p.read_bytes()
 if len(b)!=x['bytes'] or hashlib.sha256(b).hexdigest()!=x['sha256']:drift.append(x['path'])
status=subprocess.check_output(['/usr/bin/git','-C',str(F),'status','--porcelain=v1','--untracked-files=no'],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True)
process=subprocess.run(['/bin/ps','-p','9123,14446','-o','pid=,ppid=,pgid=,stat=,etime=,comm='],capture_output=True,text=True).stdout.strip()
v=dict(utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),publicToolCount=len(calls),latestPublicTools=[dict(id=c['id'],name=c['name'],description=c.get('input',{}).get('description'),file=c.get('input',{}).get('file_path')) for c in calls[-3:]],sourceWriteCalls=[dict(id=c['id'],name=c['name'],file=c.get('input',{}).get('file_path')) for c in calls if c['name'] in ['Write','Edit']],trackedStatus=status,optionalScopePresent=(F/s['optionalNewPath']['path']).exists(),protectionDrift=drift,process=process,finalPresent=(R/'FINAL.json').exists())
with (N/'MONITOR.jsonl').open('a') as h:h.write(json.dumps(v)+'\n')
v['sourceWriteCalls']=v['sourceWriteCalls'][-3:]
print(json.dumps(v))
