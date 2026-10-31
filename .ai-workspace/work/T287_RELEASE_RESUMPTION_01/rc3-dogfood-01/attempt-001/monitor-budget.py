#!/usr/bin/env python3
"""Read-only projection of native stream usage; no provider control or content output."""
import datetime,json,os,sys,tempfile
from decimal import Decimal
from pathlib import Path

BASE=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')

def project(archive,started):
 rows=[];known=Decimal('0');unknown=0
 for path in sorted(archive.glob('fp-*-stdout.log')):
  final=[];invalid=False
  with path.open('rb') as f:
   for raw in f:
    if not raw.endswith(b'\n'):continue
    if len(raw)>16*1024*1024:invalid=True;continue
    try:event=json.loads(raw,parse_float=Decimal)
    except (ValueError,UnicodeDecodeError):continue
    if isinstance(event,dict) and event.get('type')=='result':final.append(event)
  cost=None
  if len(final)==1 and not invalid:
   value=final[0].get('total_cost_usd')
   if isinstance(value,(int,Decimal)) and not isinstance(value,bool) and Decimal(value).is_finite() and Decimal(value)>=0:cost=Decimal(value)
  if cost is None:unknown+=1
  else:known+=cost
  rows.append({'stream':path.name,'bytes':path.stat().st_size,'terminalResultRows':len(final),
   'reportedUsd':None if cost is None else str(cost),'unresolved':cost is None})
 aggregate=Decimal('35.6671188')+known
 return {'kind':'rc3_a01_usage_projection','atUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
  'streams':rows,'knownReportedIncrementUsd':str(known),'historicalReportedNativeUsd':'35.6671188',
  'historicalPlusKnownUsd':str(aggregate),'unresolvedProcesses':unknown,'startedWithoutObservedStream':started and not rows,
  'rootAction':'STOP_FOR_TRIAGE' if known>=Decimal('10') or aggregate>=Decimal('90') else 'MONITOR',
  'limits':['Root monitors and controls the process; this projection does not enforce a cap',
   'A running or ambiguous stream is unknown, not zero; proxy and other host charges remain unknown',
   'Reported amounts are provider telemetry, not verified billed spend','Raw streams remain in their native archives']}

def main():
 if sys.argv[1:] not in ([],['--write']):raise SystemExit('usage: monitor-budget.py [--write]')
 attempt=BASE/'attempt-001';result=project(BASE/'setup-001/resources/archives',(attempt/'STARTED.json').exists())
 text=json.dumps(result,indent=2)+'\n'
 if sys.argv[1:]==['--write']:
  fd,tmp=tempfile.mkstemp(prefix='.budget-latest-',dir=attempt)
  try:
   with os.fdopen(fd,'w') as f:f.write(text)
   os.replace(tmp,attempt/'budget-latest.json')
  finally:
   if os.path.exists(tmp):os.unlink(tmp)
 print(text,end='')
if __name__=='__main__':main()
