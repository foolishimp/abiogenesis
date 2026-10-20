from pathlib import Path
import json,hashlib,datetime,subprocess
phase=Path(__file__).parent
archive=Path('/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/test_env/test_runs/sandbox-uat/data-mapper-full/2026-10-08T17-40-42-399Z-9331fc68-b309-49fb-a8f1-9a544450add9')
log=archive/'resources/events/runtime.events.jsonl'
state=json.loads((phase/'read-cursor.json').read_text()) if (phase/'read-cursor.json').exists() else {'offset':0,'lastOrdinal':0}
if 'lastActorPID' not in state and (phase/'milestones.jsonl').exists():
 for line in reversed((phase/'milestones.jsonl').read_text().splitlines()):
  prior=json.loads(line)
  if prior.get('kind')=='actor_process_started':state['lastActorPID']=prior['facts']['processId'];break
interest={'run_segment_opened','c_call_result_admitted','actor_transport_binding_admitted','actor_process_started','actor_process_exited','actor_invocation_failed','runtime_failure_observed','graph_call_failed','actor_process_termination_unconfirmed'}
rows=[]
if log.exists():
 with log.open('rb') as f:
  f.seek(state['offset'])
  while True:
   offset=f.tell();raw=f.readline()
   if not raw or not raw.endswith(b'\n'):break
   event=json.loads(raw);state['offset']=f.tell();state['lastOrdinal']=event.get('admissionOrdinal',state['lastOrdinal'])
   if event.get('kind') not in interest:continue
   payload=event.get('payload',{});value=payload.get('value',{})
   row={'kind':event.get('kind'),'ordinal':event.get('admissionOrdinal'),'eventTime':event.get('eventTime'),'eventId':event.get('eventId'),'offset':offset,'byteCount':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'aggregateId':event.get('aggregateId'),'graphFunctionRef':event.get('graphFunctionRef'),'runId':event.get('runId')}
   scalar=['runId','runRef','actorRef','actorInvocationRef','actorProcessRef','processId','pid','exitCode','exitStatus','processSignal','signal','timedOut','terminationConfirmed','transportBindingRef','resultRef','resultDigest','cCallRef','valueKind','failureKind','reason']
   row['facts']={key:payload[key] for key in scalar if key in payload and isinstance(payload[key],(str,int,float,bool,type(None)))}
   if isinstance(value,dict):
    row['valueKind']=value.get('kind')
    if value.get('kind')=='worksite_command_execution_observation':
     row['commands']=[{key:c.get(key) for key in ['commandId','exitStatus','timedOut','processSignal','terminationConfirmed','reportCount']} for c in value.get('commandResults',[])]
     row['reportStates']=[r.get('state') for c in value.get('commandResults',[]) for r in c.get('reports',[])]
     row['snapshotMembers']=len(value.get('snapshotMembers',[]));row['productDeltaCount']=len(value.get('productDelta',[]))
     row['helperSandboxRoot']=value.get('provenance',{}).get('helperPlan',{}).get('sandboxRoot')
    elif value.get('kind')=='governance_work_state':
     row['observations']=len(value.get('observations',[]));row['terminal']=value.get('terminal');row['unresolvedSupportRefs']=len(value.get('unresolvedSupportRefs',[]))
    elif value.get('kind')=='framed_synthesis_result':row['selectorKeys']=list(value)
   rows.append(row)
   if event.get('kind')=='actor_process_started':state['lastActorPID']=payload.get('processId')
 (phase/'read-cursor.json').write_text(json.dumps(state)+'\n')
 if rows:
  with (phase/'milestones.jsonl').open('a') as f:
   for row in rows:f.write(json.dumps({'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),**row})+'\n')
start=archive/'commands/lifecycle-start.request.json'
selectedPIDs=[88828]+([state['lastActorPID']] if state.get('lastActorPID') else [])
sample=subprocess.run(['ps','-o','pid,ppid,pgid,rss,etime,comm','-p',','.join(map(str,selectedPIDs))],capture_output=True,text=True).stdout
cells=[]
for line in sample.splitlines()[1:]:
 parts=line.split(None,5)
 if len(parts)==6:cells.append(dict(zip(['pid','ppid','pgid','rssKiB','elapsed','command'],[int(x) for x in parts[:4]]+parts[4:])))
native=next((c for c in cells if c['pid']==88828),None)
if native:state['highestObservedNativeRSSKiB']=max(state.get('highestObservedNativeRSSKiB',1252032),native['rssKiB'])
report={'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'archive':str(archive),'storeBytes':log.stat().st_size if log.exists() else None,'cursor':state,'newMilestones':rows[-16:],'newMilestoneCount':len(rows),'nativeStart':json.loads(start.read_text()).get('started') if start.exists() else None,'ownedProcessSample':cells}
(phase/'read-cursor.json').write_text(json.dumps(state)+'\n')
with (phase/'milestones.jsonl').open('a') as f:f.write(json.dumps({'kind':'operator_process_sample',**{k:report[k] for k in ['observedAt','storeBytes','cursor','ownedProcessSample']}})+'\n')
print(json.dumps(report))
