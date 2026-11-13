#!/usr/bin/env python3
"""Read-only cross-store budget projection; never launches or controls a provider."""
from pathlib import Path
from decimal import Decimal
import datetime,json,sys
BASE=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
UNKNOWN='fp-91c8dc01ceb1afa5-stdout.log'
def project():
 excluded=set(json.loads((BASE/'attempt-007/baseline-fp-streams.json').read_text())['names']);rows=[];known=Decimal(0);unknown=[]
 for store in ('setup-001','setup-002'):
  archive=BASE/store/'resources/archives'
  for p in sorted(archive.glob('fp-*-stdout.log')):
   if store=='setup-001' and p.name in excluded:continue
   terminal=[];invalid=False
   with p.open('rb') as f:
    for line in f:
     if not line.endswith(b'\n'):continue
     if len(line)>16*1024*1024:invalid=True;continue
     try:x=json.loads(line,parse_float=Decimal)
     except (ValueError,UnicodeDecodeError):continue
     if isinstance(x,dict) and x.get('type')=='result':terminal.append(x)
   cost=None
   if len(terminal)==1 and not invalid:
    v=terminal[0].get('total_cost_usd')
    if isinstance(v,(int,Decimal)) and not isinstance(v,bool) and Decimal(v).is_finite() and Decimal(v)>=0:cost=Decimal(v)
   if cost is None:unknown.append((store,p.name))
   else:known+=cost
   rows.append({'store':store,'stream':p.name,'bytes':p.stat().st_size,'terminalResultRows':len(terminal),'reportedUsd':None if cost is None else str(cost)})
 assert ('setup-001',UNKNOWN) in unknown,'known B03 uncertainty is not represented'
 transport=json.loads((BASE/'setup-001/resources/archives/fp-91c8dc01ceb1afa5-transport.json').read_bytes());assert transport['terminationConfirmed'] is True
 total=Decimal('46.3959266')+known;effective=total+Decimal(8);new=[r for r in rows if r['store']=='setup-002'];ambiguous=[r['stream'] for r in new if r['reportedUsd'] is None]
 old_unknown=[name for store,name in unknown if store=='setup-001' and name!=UNKNOWN]
 started=(BASE/'attempt-008/STARTED.json').exists();unseen=started and not new;active_count=len(ambiguous)+(1 if unseen else 0)
 projected=effective+Decimal('2.5')*active_count;next_upper=projected+Decimal('2.5')+Decimal('4')
 status='STOP_OR_TRIAGE' if old_unknown or effective>=Decimal(96) else 'NO_FURTHER_PROVIDER' if next_upper>Decimal(100) or len(new)>=3 else 'REVIEW_94' if effective>=Decimal(94) else 'REVIEW_90' if effective>=Decimal(90) else 'MONITOR'
 return {'kind':'b06_cross_store_usage_projection','classification':'draft; not selected for execution','atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'streams':rows,
  'reportedTotalUsd':str(total),'unknownB03ReserveUsd':'8','effectiveConservativeUsd':str(effective),'priorOtherUnknown':old_unknown,
  'b06ObservedStreams':len(new),'b06UnreportedStreams':ambiguous,'startedWithoutObservedStream':unseen,'activeProcessReserveEachUsd':'2.50',
  'effectiveWithActiveReservesUsd':str(projected),'beforeAnotherProviderIncludingWitnessReserveUsd':str(next_upper),'maximumB06Processes':3,
  'witnessReserveUsd':'4','preWitnessStopUsd':'96','reviewsUsd':['90','94'],'userAllocationUsd':'100','rootAction':status,
  'limits':['Do not interpret an unknown cost as zero','Root controls provider transitions; this projection is not an aggregate cap','Current active process is not automatically stopped by a next-provider decision']}
if __name__=='__main__':
 if sys.argv[1:]:raise SystemExit('usage: monitor-budget.DRAFT.py')
 print(json.dumps(project(),indent=2))
