#!/usr/bin/env python3
"""Bind all historical provider telemetry after B04's actual final handoff."""
from pathlib import Path
from decimal import Decimal
import json,subprocess
b=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');a=b/'attempt-007';prior=b/'attempt-006'
assert all((prior/n).is_file() for n in ['execution.json','after-run-resume.json','fresh-reads.json','outcome-summary.json'])
assert not (a/'prior-b04-streams.json').exists() and not (a/'B05_BUDGET_BASELINE.json').exists()
excluded=set(json.loads((a/'baseline-fp-streams.json').read_bytes())['names']);archive=b/'setup-001/resources/archives'
names=sorted(p.name for p in archive.glob('fp-*-stdout.log') if p.name not in excluded)
expected={'fp-7039f62840e47eb4-stdout.log','fp-95e0c01a4a6ac5c9-stdout.log','fp-b35290ed2a921c20-stdout.log','fp-91c8dc01ceb1afa5-stdout.log'}
assert expected<=set(names)
with (a/'prior-b04-streams.json').open('x') as f:json.dump({'kind':'b05_prior_b_family_stdout_names','names':names},f,indent=2);f.write('\n')
out=subprocess.check_output(['/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12','-B',str(a/'monitor-budget.py')]);x=json.loads(out)
assert x['b03RecordedTransportTerminated'] is True and x['activeOrAmbiguousNewStreams']==[] and x['otherUnresolvedStreams']==[]
assert abs(Decimal(x['allReportedNativeTotalUsd'])-Decimal('71.5636234'))<Decimal('0.000001')
assert abs(Decimal(x['effectiveConservativeTotalUsd'])-Decimal('79.5636234'))<Decimal('0.000001')
assert Decimal(x['beforeAnotherProviderWithWitnessReserveUsd'])<=Decimal('100') and x['rootAction']=='MONITOR'
with (a/'B05_BUDGET_BASELINE.json').open('xb') as f:f.write(out)
print(json.dumps({'streams':len(names),'known':x['allReportedNativeTotalUsd'],'conservative':x['effectiveConservativeTotalUsd'],'beforeAnotherProviderWithWitnessReserve':x['beforeAnotherProviderWithWitnessReserveUsd'],'otherCharges':'unknown'}))
