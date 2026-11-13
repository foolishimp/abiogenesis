import pathlib,json,hashlib,datetime,subprocess,collections
N=pathlib.Path(__file__).parent; R=N/'runtime-001'; W=pathlib.Path('/private/tmp/abg-rc10-retention-20261109'); S=W/'qualification-scratch/rc10-retention-01/proof-01/frozen-proof'
statepath=N/'MONITOR_OFFSETS.json'; state=json.loads(statepath.read_text()) if statepath.exists() else {}
def added(p):
 key=str(p);offset=state.get(key,0)
 with p.open('rb') as f:f.seek(offset);data=f.read()
 cut=data.rfind(b'\n')+1;state[key]=offset+cut
 out=[]
 for line in data[:cut].splitlines():
  try:out.append(json.loads(line))
  except:pass
 return out
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
events=added(R/'resources/events/runtime.events.jsonl'); kinds=dict(collections.Counter(e.get('kind') for e in events));tools=[];results=[]
for p in (R/'resources/archives').glob('*-stdout.log'):
 for e in added(p):
  if e.get('type')=='result':results.append({k:e.get(k) for k in ['subtype','is_error','duration_ms','duration_api_ms','num_turns','total_cost_usd','usage']})
  for b in e.get('message',{}).get('content',[]):
   if b.get('type')=='tool_use':tools.append({'name':b.get('name'),'description':str(b.get('input',{}).get('description',''))[:180]})
rows=[]
for line in subprocess.check_output(['ps','-axo','pid=,ppid=,etime=,comm='],text=True).splitlines():
 try:pid,ppid,elapsed,cmd=line.strip().split(None,3);rows.append((int(pid),int(ppid),elapsed,cmd))
 except:pass
ids={43282}
while True:
 new=ids|{r[0] for r in rows if r[1] in ids}
 if new==ids:break
 ids=new
status=subprocess.check_output(['git','-C',str(W),'status','--porcelain=v1','--untracked-files=no'],text=True).splitlines()
a={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'eventBytes':(R/'resources/events/runtime.events.jsonl').stat().st_size,'newEventKinds':kinds,'latestTools':tools[-4:],'providerResults':results,'processes':[{'pid':p,'ppid':q,'elapsed':t,'command':c} for p,q,t,c in rows if p in ids],'trackedChangedCount':len(status),'requiredNewTestExists':(W/'build_tenants/abiogenesis/typescript/test_env/tests/t287-held-basis-lifetime.test.mjs').exists(),'receipts':{}}
for rel in ['stage-01/source-freeze.json','stage-01/RESULT.json','focused-01/RESULT.json']:
 p=S/rel
 if p.exists():
  a['receipts'][rel]=pin(p)
  try:d=json.loads(p.read_text());a['receipts'][rel]['summary']={k:d[k] for k in ['status','sourceDigest','ok','failures','kind'] if k in d}
  except:a['receipts'][rel]['parseable']=False
for rel in ['NATIVE_RETURN.json','FAILURE.json','resource-close.json','FRESH_READBACKS.json','READBACK_FAILURE.json','FINAL.json']:
 p=R/rel
 if p.exists():a['receipts'][rel]=pin(p)
statepath.write_text(json.dumps(state,indent=2)+'\n');(N/'LATEST_OBSERVATION.json').write_text(json.dumps(a,indent=2)+'\n')
with (N/'MONITOR_OBSERVATIONS.jsonl').open('a') as f:f.write(json.dumps(a)+'\n')
print(json.dumps(a,indent=2))
