"""Passive, incremental physical-envelope observation; never runtime authority."""
from pathlib import Path
import json, hashlib
from datetime import datetime, timezone

A=Path(__file__).resolve().parent
X=A.parent
E=A/'execution'
read=lambda p:json.loads(p.read_text())
started=read(E/'STARTED.json')
prepared=read(E/'PREPARED_CALL.json')
log=X/'runtime-001/resources/events/runtime.events.jsonl'
path=E/'TIMING_OBSERVATION_ENVELOPES.json'
now=datetime.now(timezone.utc).isoformat()
if path.exists():
    state=read(path)
else:
    state={'kind':'incremental_physical_envelope_metadata_timing_observation','activation':'q23-author-04',
           'startedUtc':started['startedUtc'],'eventLog':str(log),
           'fromByte':prepared['eventPrefix']['prefixLength'],
           'throughCompleteByte':prepared['eventPrefix']['prefixLength'],
           'counts':{},'processes':[],'results':[],
           'setupReused':True,'sdkSetupMs':None,'artifactVerificationMs':None,
           'setupProcessEndedUtc':None,
           'limits':['Incremental physical envelope metadata, not runtime admission or acceptance.',
                     'No raw provider thinking/text/tool-result/stdout is output or inspected for semantic content.',
                     'Wall intervals are not CPU attribution or matched causal speedup.',
                     'Setup-to-dispatch includes separate Root audit/control/preflight time, not between-task runtime latency.']}
with log.open('rb') as stream:
    stream.seek(state['throughCompleteByte'])
    while True:
        offset=stream.tell();line=stream.readline()
        if not line or not line.endswith(b'\n'):break
        raw=json.loads(line);event=raw.get('event',raw);kind=event.get('kind','encoded_body_reference')
        c=state['counts'].setdefault(kind,{'rows':0,'physicalBytes':0});c['rows']+=1;c['physicalBytes']+=len(line)
        state['throughCompleteByte']=stream.tell()
        if 'admissionOrdinal' in event:state['throughOrdinal']=event['admissionOrdinal']
        if 'eventTime' in event:state['latestEventTime']=event['eventTime']
        payload=event.get('payload',{})
        if kind in ['actor_process_started','actor_process_exited','c_call_result_admitted']:
            row={k:event.get(k) for k in ['kind','admissionOrdinal','eventId','eventTime','graphFunctionRef','runId']}
            row.update(offset=offset,rowBytes=len(line),rowSha256=hashlib.sha256(line).hexdigest())
            if kind.startswith('actor_process_'):
                row.update(processRef=payload.get('processRef'),pid=payload.get('processId'))
                state['processes'].append(row)
            else:
                row.update(resultRef=payload.get('resultRef'),valueKind=payload.get('valueKind') or payload.get('value',{}).get('kind'))
                state['results'].append(row)
def ms(a,b):return (datetime.fromisoformat(b.replace('Z','+00:00'))-datetime.fromisoformat(a.replace('Z','+00:00'))).total_seconds()*1000
state['setupToDispatchOperatorPreparationMs']=None
state['rootBetweenActivationMs']=None
starts=[r for r in state['processes'] if r['kind']=='actor_process_started']
native=next((r for r in starts if r['graphFunctionRef']=='graph-function://abiogenesis/worksite/native-work@5'),None)
c2=next((r for r in starts if r['graphFunctionRef']=='graph-function://abiogenesis/worksite/command-execution@5'),None)
native_result=next((r for r in state['results'] if r['graphFunctionRef']=='graph-function://abiogenesis/worksite/native-work@5'),None)
state['dispatchToInitialSelectorProcessMs']=ms(started['startedUtc'],starts[0]['eventTime']) if starts else None
state['dispatchToNativeWorkerProcessMs']=ms(started['startedUtc'],native['eventTime']) if native else None
state['nativeResultToC2ProcessMs']=ms(native_result['eventTime'],c2['eventTime']) if native_result and c2 else None
state['recordedUtc']=now
state['outcomeReturned']=(E/'outcome-summary.json').exists()
state['closed']=(E/'after-run-resume.json').exists()
if state['outcomeReturned']:state['outcome']=read(E/'outcome-summary.json')
path.write_text(json.dumps(state,indent=2)+'\n')
progress=Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut/qualification-scratch/q23-author-04/progress.json')
print(json.dumps({'throughOrdinal':state.get('throughOrdinal'),'throughCompleteByte':state['throughCompleteByte'],
                  'latestEventTime':state.get('latestEventTime'),'closed':state['closed'],
                  'dispatchToInitialSelectorMs':state['dispatchToInitialSelectorProcessMs'],
                  'dispatchToNativeWorkerMs':state['dispatchToNativeWorkerProcessMs'],
                  'rootBetweenActivationMs':state['rootBetweenActivationMs'],
                  'processes':state['processes'][-8:],'nativeResult':native_result,
                  'progressExists':progress.exists()}))
