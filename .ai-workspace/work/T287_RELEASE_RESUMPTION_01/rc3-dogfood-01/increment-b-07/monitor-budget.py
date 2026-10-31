#!/usr/bin/env python3
"""Report retained cross-store provider usage; never launch/control a provider."""
from pathlib import Path
from decimal import Decimal
import json
B=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
excluded=set(json.loads((B/'attempt-007/baseline-fp-streams.json').read_text())['names'])
archives=[('setup-001',B/'setup-001/resources/archives'),('setup-002',B/'setup-002/resources/archives'),('setup-003',B/'setup-003/resources/archives'),('sunny-day',B/'sunny-day-001/runs/basic-cli/2026-10-31T17-39-58-824Z-8a923ee9-ae9b-4ffa-9d35-0a85a0b5df64/resources/archives')]
archives += [('recovery-001',p) for p in (B/'recovery-001/runtime/tmp').glob('*/workspace/.ai-workspace/archive')]
rows=[];total=Decimal('46.3959266');unknown=[]
for label,d in archives:
 for p in sorted(d.glob('fp-*-stdout.log')):
  if label=='setup-001' and p.name in excluded:continue
  terminal=[]
  with p.open('rb') as f:
   for line in f:
    if not line.endswith(b'\n') or len(line)>16*1024*1024:continue
    try:x=json.loads(line,parse_float=Decimal)
    except (ValueError,UnicodeDecodeError):continue
    if isinstance(x,dict) and x.get('type')=='result':terminal.append(x)
  cost=terminal[0].get('total_cost_usd') if len(terminal)==1 else None
  if isinstance(cost,(Decimal,int)) and not isinstance(cost,bool) and Decimal(cost).is_finite() and Decimal(cost)>=0:total+=Decimal(cost);v=str(cost)
  else:unknown.append({'archive':label,'stream':p.name});v=None
  rows.append({'archive':label,'stream':p.name,'reportedUsd':v,'terminalRows':len(terminal)})
b03=[x for x in unknown if x['archive']=='setup-001' and x['stream']=='fp-91c8dc01ceb1afa5-stdout.log'];assert len(b03)==1
other=[x for x in unknown if x not in b03]
print(json.dumps({'kind':'b07_cross_store_usage_projection','reportedTotalUsd':str(total),'unknownB03ReserveUsd':'8','reportedPlusB03ReserveUsd':str(total+Decimal(8)),
 'otherUnknownStreams':other,'streams':rows,'previous100DollarLimit':'removed by owner','limits':['Unknown B03 reserve is not a known charge','Unreported streams and other host charges remain unknown','No automatic spend cap, retry or provider control']},indent=2))
