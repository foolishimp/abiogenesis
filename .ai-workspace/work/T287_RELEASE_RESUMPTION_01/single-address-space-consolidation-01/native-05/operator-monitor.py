"""Root passive observation only; never runtime truth or source acceptance."""
from pathlib import Path
import json, subprocess, hashlib
from datetime import datetime, timezone
A=Path(__file__).resolve().parent
S=Path('/Users/jim/src/apps/abiogenesis-single-address-space')
r=subprocess.run(['python3',str(A/'observe-progress.py')],capture_output=True,text=True,check=True)
o=json.loads(r.stdout)
out={k:v for k,v in o.items() if k not in ['processes','rootBetweenActivationMs','dispatchToInitialSelectorMs','dispatchToNativeWorkerMs']}
out['observedUtc']=datetime.now(timezone.utc).isoformat()
source=json.loads((A/'SOURCE_BEFORE.json').read_text())
out['incrementChangedPaths']=[f['relativePath'] for f in source['files'] if hashlib.sha256((S/f['relativePath']).read_bytes()).hexdigest()!=f['sha256']]
p=S/'consolidation-scratch/native-05/progress.json'
if p.exists():out['authorProgress']=json.loads(p.read_text())
p=A.parent/'runtime-001/resources/archives/fp-a5cd3c2bb5354fdf-stdout.log'
if p.exists():
 calls={};completed=set();heartbeats={}
 for line in p.read_text().splitlines():
  try:r=json.loads(line)
  except json.JSONDecodeError:continue
  if r.get('type')=='tool_progress':heartbeats[r.get('parent_tool_use_id',r.get('tool_use_id'))]=r.get('elapsed_time_seconds')
  for b in r.get('message',{}).get('content',[]) if isinstance(r.get('message',{}).get('content',[]),list) else []:
   if not isinstance(b,dict):continue
   if b.get('type')=='tool_use':calls[b.get('id')]=b
   elif b.get('type')=='tool_result':completed.add(b.get('tool_use_id'))
 out['pendingToolObservations']=[{'id':k,'name':b.get('name'),'elapsedHeartbeatSeconds':heartbeats.get(k),'commandPreview':b.get('input',{}).get('command','')[:240]} for k,b in calls.items() if k not in completed]
 out['recentToolDescriptions']=[{'name':b.get('name'),'description':b.get('input',{}).get('description')} for b in list(calls.values())[-3:]]
 out['nativeStdoutModifiedUtc']=datetime.fromtimestamp(p.stat().st_mtime,timezone.utc).isoformat()
 out['toolObservationStanding']='Passive physical stdout metadata only; no hidden thinking inspected or source acceptance inferred'
print(json.dumps(out))
