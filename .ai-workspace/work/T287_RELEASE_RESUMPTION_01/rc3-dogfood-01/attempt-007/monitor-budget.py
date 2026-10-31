#!/usr/bin/env python3
"""Read-only usage projection; recorded end and unknown B03 cost remain separate."""
from pathlib import Path
from decimal import Decimal
import datetime,json,os,sys,tempfile
BASE=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
ATT=BASE/'attempt-007'; UNKNOWN='fp-91c8dc01ceb1afa5-stdout.log'
def project():
 archive=BASE/'setup-001/resources/archives';excluded=set(json.loads((ATT/'baseline-fp-streams.json').read_text())['names']);prior=set(json.loads((ATT/'prior-b04-streams.json').read_text())['names']);rows=[];known=Decimal(0);unresolved=[]
 for p in sorted(archive.glob('fp-*-stdout.log')):
  if p.name in excluded:continue
  result=[];invalid=False
  with p.open('rb') as f:
   for raw in f:
    if not raw.endswith(b'\n'):continue
    if len(raw)>16*1024*1024:invalid=True;continue
    try:x=json.loads(raw,parse_float=Decimal)
    except (ValueError,UnicodeDecodeError):continue
    if isinstance(x,dict) and x.get('type')=='result':result.append(x)
  cost=None
  if len(result)==1 and not invalid:
   v=result[0].get('total_cost_usd')
   if isinstance(v,(int,Decimal)) and not isinstance(v,bool) and Decimal(v).is_finite() and Decimal(v)>=0:cost=Decimal(v)
  if cost is not None:known+=cost
  elif p.name!=UNKNOWN:unresolved.append(p.name)
  rows.append({'stream':p.name,'bytes':p.stat().st_size,'terminalResultRows':len(result),'reportedUsd':None if cost is None else str(cost),'classification':'ended_transport_unknown_cost' if p.name==UNKNOWN else ('reported' if cost is not None else 'active_or_ambiguous')})
 b03=next(x for x in rows if x['stream']==UNKNOWN);assert b03['reportedUsd'] is None and b03['terminalResultRows']==0
 transport=json.loads((archive/'fp-91c8dc01ceb1afa5-transport.json').read_bytes());assert transport['terminationConfirmed'] is True
 total=known+Decimal('46.3959266');effective=total+Decimal('8');new=[r for r in rows if r['stream'] not in prior]
 active=[r['stream'] for r in new if r['reportedUsd'] is None];started_without=(ATT/'STARTED.json').exists() and not new
 active_count=len(active)+(1 if started_without else 0);with_active=effective+Decimal('4.5')*active_count;next_bound=with_active+Decimal('4.5')+Decimal('6')
 return {'kind':'rc3_b05_usage_projection','atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'streams':rows,'knownReportedBFamilyUsd':str(known),'historicalPreBUsd':'46.3959266','allReportedNativeTotalUsd':str(total),'endedB03UnknownCostReserveUsd':'8','effectiveConservativeTotalUsd':str(effective),'b03RecordedTransportTerminated':True,'activeOrAmbiguousNewStreams':active,'otherUnresolvedStreams':unresolved,'startedWithoutObservedNewStream':started_without,'effectiveWithActiveProcessReservesUsd':str(with_active),'beforeAnotherProviderWithWitnessReserveUsd':str(next_bound),
  'rootAction':'STOP_FOR_TRIAGE' if effective>=Decimal('94') or next_bound>Decimal('100') else 'REVIEW_90' if effective>=Decimal('90') else 'REVIEW_82' if effective>=Decimal('82') else 'MONITOR',
  'reviewCheckpointsUsd':['82','90'],'preWitnessStopUsd':'94','userAllocationUsd':'100','perActiveB05ProcessReserveUsd':'4.5','laterWitnessReserveUsd':'6','limits':['Unknown B03 cost is reserved, not estimated as billed or active','Other charges and active process costs remain unknown','This is a manual monitoring projection, not an enforced aggregate cap; Root makes each provider decision']}
if __name__=='__main__':
 if sys.argv[1:] not in ([],['--write']):raise SystemExit('usage: monitor-budget.py [--write]')
 out=json.dumps(project(),indent=2)+'\n'
 if sys.argv[1:]==['--write']:
  fd,tmp=tempfile.mkstemp(prefix='.budget-latest-',dir=ATT)
  try:
   with os.fdopen(fd,'w') as f:f.write(out)
   os.replace(tmp,ATT/'budget-latest.json')
  finally:
   if os.path.exists(tmp):os.unlink(tmp)
 print(out,end='')
