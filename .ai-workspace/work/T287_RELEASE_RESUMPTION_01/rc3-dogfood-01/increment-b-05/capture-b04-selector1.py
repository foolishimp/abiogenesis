#!/usr/bin/env python3
"""Preserve the first B04 selector and complete the three-stream cost ledger."""
from pathlib import Path
from decimal import Decimal
import hashlib,json
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');dest=base/'increment-b-05';archives=base/'setup-001/resources/archives';sha=lambda b:hashlib.sha256(b).hexdigest();stem='fp-7039f62840e47eb4'
artifacts=[]
for suffix in ('stdout.log','stderr.log','prompt.txt','output.txt','transport.json'):
 p=archives/(stem+'-'+suffix);before=p.stat();data=p.read_bytes();after=p.stat();assert (before.st_size,before.st_mtime_ns)==(after.st_size,after.st_mtime_ns);artifacts.append({'path':str(p),'sha256':sha(data),'bytes':len(data)})
raw=(archives/(stem+'-stdout.log')).read_bytes();events=[]
for line in raw.splitlines():
 try:e=json.loads(line,parse_float=Decimal)
 except (UnicodeDecodeError,ValueError):continue
 if e.get('type')=='result':events.append(e)
assert len(events)==1 and events[0].get('subtype')=='success' and isinstance(events[0].get('structured_output'),dict)
value=events[0]['structured_output'];out=(json.dumps(value,ensure_ascii=False,indent=2,default=str)+'\n').encode();target=dest/'fp-7039f62840e47eb4-structured-return.json'
with target.open('xb') as f:f.write(out)
prev=json.loads((dest/'B04_SOURCE_CUSTODY.json').read_bytes());rows=[{'stem':stem,'costUsdExactTelemetry':str(events[0]['total_cost_usd']),'reportedUsdRounded':'2.0387932','artifacts':artifacts,'structuredReturn':{'path':str(target),'bytes':len(out),'sha256':sha(out)}}]
for item,rounded in zip(prev['nativeStreams'],['2.9622148','2.074176']):rows.append({'stem':item['stem'],'costUsdExactTelemetry':str(item['reportedUsd']),'reportedUsdRounded':rounded,'artifacts':item['artifacts'],'structuredReturn':item['structuredReturn']})
assert sum(Decimal(x['reportedUsdRounded']) for x in rows)==Decimal('7.075184')
r={'kind':'b04_three_stream_cost_and_trace_custody','status':'actual provider telemetry; native handoff and final readbacks pending','streams':rows,'reportedB04UsdRounded':'7.075184','reportedNativeTotalUsdRounded':'71.5636234','unknownB03ReserveUsd':'8','effectiveConservativeUsdRounded':'79.5636234','otherCharges':'unknown','limits':['Provider telemetry is not billed-spend proof','Root-reported native Result remains pending final independent handoff','No other provider may be assumed absent from the final telemetry audit']}
b=(json.dumps(r,indent=2,sort_keys=True)+'\n').encode()
with (dest/'B04_THREE_STREAM_CUSTODY.json').open('xb') as f:f.write(b)
print(json.dumps({'custodySha256':sha(b),'streams':len(rows),'reportedB04UsdRounded':r['reportedB04UsdRounded']}))
