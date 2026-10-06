from pathlib import Path
import json
O=Path(__file__).resolve().parent;G=O.parent;N=G/'final-native-continuation-04';N3=G/'final-native-setup-03';S=G/'final-candidate-construction-02/source-freeze/repo/build_tenants/abiogenesis/typescript/code/src'
def j(p):return json.loads(p.read_bytes())
def show(k,v):print(k,json.dumps(v,separators=(',',':')))
def small(x):
 if isinstance(x,dict):return {k:(v if not isinstance(v,(dict,list)) else {'type':type(v).__name__,'size':len(v),'keys':list(v)[:15] if isinstance(v,dict) else None}) for k,v in x.items()}
 return x
def span(p,a,b):return '\n'.join(f'{i+1}:{s}' for i,s in enumerate(p.read_text().splitlines()) if a<=i+1<=b)
show('REPLAY_CONTEXT',span(S/'abg/replay.ts',1950,2015))
show('DECODER_FINAL',span(S/'abg/event_store.ts',3216,3265))
events=[json.loads(s) for s in (N/'failure-native-prefix.jsonl').read_bytes().splitlines() if s.strip()]
selected=[]
for i,e in enumerate(events):
 if e['kind'] not in ['runtime_activity_probe_observed','public_operation_artifact_admitted']:
  selected.append({'line':i+1,'kind':e['kind'],'eventId':e['eventId'],'aggregateId':e['aggregateId'],'basisId':e['basisId'],'runId':e.get('runId'),'graphCallId':e.get('graphCallId'),'frameId':e.get('frameId'),'causationEventRefs':e['causationEventRefs'],'payload':small(e['payload'])})
(O/'causal-event-shapes.json').write_text(json.dumps(selected,indent=2)+'\n')
for e in selected:
 if e['kind'] in ['invocation_admitted','basis_admitted','c_call_result_admitted','c_call_judged','traversal_route_admitted','terminal_reached']:show('EVENT',e)
for name in ['continue-hello-root-run_result-command.json','continue-hello-root-run_result-native-process.json','continue-hello-root-run_result-process-start.json','continue-hello-root-run_result-physical.json','driver-process.json']:
 show(name,j(N/name))
show('N03_SUCCESS_RECEIPTS',[(p.name,small(j(p))) for p in sorted(N3.glob('*-stdout.json')) if p.name!='setup-conformance-hello-world-stdout.json'])
for name in ['continue-conformance-hello-world-stdout.json','continue-conformance-command-execution-stdout.json']:show(name,j(N/name)['receipt']['ownerOutput'])
