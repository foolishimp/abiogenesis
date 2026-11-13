"""Read-only physical-envelope timings, kept separate from runtime verdict proof."""
import json, hashlib, datetime, sys
from pathlib import Path
C=Path(__file__).resolve().parent; name=sys.argv[1]; D=C/name
read=lambda p:json.loads(p.read_text())
pre=read(D/'execution/PREPARED_CALL.json');start=read(D/'execution/STARTED.json')
stop=(read(D/'execution/after-run-resume.json')['state']['closeHandoff']['prefix']['prefixLength']
      if (D/'execution/after-run-resume.json').exists() else None)
log=C/'runtime-001/resources/events/runtime.events.jsonl'
events=[]; consumed=pre['eventPrefix']['prefixLength'];last=None
with log.open('rb') as f:
 f.seek(consumed)
 while stop is None or consumed<stop:
  raw=f.readline()
  if not raw or not raw.endswith(b'\n'):break
  r=json.loads(raw);e=r.get('event',r);last=e.get('admissionOrdinal')
  if e.get('kind') in ['actor_process_started','actor_process_exited','c_call_result_admitted','run_stopped','run_closed']:
   p=e['payload'];events.append({'ordinal':last,'eventRef':e['eventId'],'time':e['eventTime'],'kind':e['kind'],
    'graph':e.get('graphFunctionRef'),'runId':e.get('runId'),'pid':p.get('processId'),
    'processRef':p.get('processRef'),'resultRef':p.get('resultRef'),'valueKind':p.get('valueKind'),'offset':consumed,
    'rowBytes':len(raw),'rowSha256':hashlib.sha256(raw).hexdigest()})
  consumed+=len(raw)
def ms(a,b):return round((datetime.datetime.fromisoformat(b.replace('Z','+00:00'))-datetime.datetime.fromisoformat(a.replace('Z','+00:00'))).total_seconds()*1000,3)
starts=[e for e in events if e['kind']=='actor_process_started']
processes=[]
for e in starts:
 exit=next((r for r in events if r['kind']=='actor_process_exited' and r['processRef']==e['processRef']),None)
 result=next((r for r in events if r['kind']=='c_call_result_admitted' and r['graph']==e['graph'] and r['ordinal']>e['ordinal']),None)
 processes.append({'start':e,'exit':exit,'nextGraphResult':result,
 'processMs':ms(e['time'],exit['time']) if exit else None,
 'processToAdmittedResultMs':ms(e['time'],result['time']) if result else None})
native=next((p for p in processes if p['start']['graph']=='graph-function://abiogenesis/worksite/native-work@5'),None)
c2=next((p for p in processes if p['start']['graph']=='graph-function://abiogenesis/worksite/command-execution@5'),None)
prep=next((e for e in events if e['kind']=='c_call_result_admitted' and e['graph']=='graph-function://abiogenesis/default-library/construction@5'),None)
outcome=read(D/'execution/outcome-summary.json') if (D/'execution/outcome-summary.json').exists() else None
report={'kind':'actual_native_workflow_timing_observation','activation':name,'recordedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'sourceCommit':start['sourceCommit'],'closed':stop is not None,'outcome':outcome,'eventLog':str(log),
 'fromByte':pre['eventPrefix']['prefixLength'],'throughCompleteByte':consumed,'throughOrdinal':last,
 'sdkSetupMs':27849.5,'artifactVerificationMs':18897.741833,
 'dispatchToInitialSelectorProcessMs':ms(start['startedUtc'],starts[0]['time']) if starts else None,
 'dispatchToNativeWorkerProcessMs':ms(start['startedUtc'],native['start']['time']) if native else None,
 'nativeTaskAdmissionToWorkerProcessMs':ms(prep['time'],native['start']['time']) if native and prep else None,
 'nativeResultToC2ProcessMs':ms(native['nextGraphResult']['time'],c2['start']['time']) if native and native['nextGraphResult'] and c2 else None,
 'processes':processes,'events':events,
 'limits':['Physical-envelope timestamp projection only; not runtime admission/replay or acceptance proof.',
 'Process duration includes native tools and model work. No provider-only compute or causal speedup is inferred.',
 'Initial launch includes cold history, input and runtime work; differing histories and inputs prevent causal comparison.',
 'Between separately selected coding tasks includes Root evaluation, failed proof, input repair and preparation; report separately from in-Run transition delay.']}
if name=='f4-01' and native:
 prior=read(C/'method-01/execution/COMPLETE_FIRST_ATTEMPT_TIMING.json')
 prev=next(e for e in prior['events'] if e['kind']=='c_call_result_admitted' and e['graph']=='graph-function://abiogenesis/worksite/native-work@5')
 report['betweenCodingTaskWallMsIncludingRootAndProof']=ms(prev['time'],native['start']['time'])
 report['previousCodingResult']=prev
if name in ['f4-02','f4-03','f4-03-r1'] and native:
 prior=read(C/('f4-01' if name=='f4-02' else 'f4-02')/'execution/TIMING_OBSERVATION.json')
 prev=next(e for e in prior['events'] if e['kind']=='c_call_result_admitted' and e['graph']=='graph-function://abiogenesis/worksite/native-work@5')
 report['betweenNativeAttemptsWallMsIncludingRootAndProof']=ms(prev['time'],native['start']['time'])
 report['previousNativeAttemptResult']=prev
 report['previousAttemptStanding']=('runtime_failed: native turn cap; incomplete source preserved' if name=='f4-02' else ('blocked: installed fixture failure; exact candidate and green component proof preserved' if name=='f4-03' else 'Last coding return is f4-02; intervening f4-03 failed selector bound before any actor'))
(D/'execution/TIMING_OBSERVATION.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['events','processes','limits','previousCodingResult','outcome']}|{'processes':[{'graph':p['start']['graph'],'start':p['start']['time'],'processMs':p['processMs']} for p in processes],'disposition':outcome and outcome['disposition']}))
