from pathlib import Path
import json
O=Path(__file__).resolve().parent;G=O.parent;N=G/'final-native-continuation-04';C=G/'final-candidate-construction-02';S=C/'source-freeze/repo/build_tenants/abiogenesis/typescript/code/src'
def show(k,v):print(k,json.dumps(v,separators=(',',':')))
def span(p,a,b):return '\n'.join(f'{i+1}:{s}' for i,s in enumerate(p.read_text().splitlines()) if a<=i+1<=b)
show('LOAD_RUNTIME',span(N/'public-support.mjs',24,36))
show('DECODER',span(S/'abg/event_store.ts',3140,3225))
show('REPLAY',span(S/'abg/replay.ts',758,788))
show('PREFIX1',span(S/'abg/event_prefix.ts',24,71))
show('PREFIX2',span(S/'abg/event_prefix.ts',185,223))
show('PROJECT_RUN_IDENTITY',span(S/'abg/replay.ts',1707,1745))
show('DRIVER_ORIGINAL_INPUT',span(N/'driver.mjs',1,15))
core=json.loads((C/'selected-core.json').read_text());P=Path(core['packageRoot'])
show('PACKAGE_STRUCTURE',[p.name for p in P.iterdir()])
show('PACKAGE_EXPORTS',json.loads((P/'package.json').read_text()).get('exports'))
events=[json.loads(s) for s in (N/'failure-native-prefix.jsonl').read_bytes().splitlines() if s.strip()]
show('EVENT_NAMES',[{'line':i+1,'kind':e['kind'],'eventId':e['eventId']} for i,e in enumerate(events)])
show('TRANSPORT_SHAPE',{'keys':list(json.loads((N/'continue-hello-root.jsonl').read_text())),'bytes':(N/'continue-hello-root.jsonl').stat().st_size})
