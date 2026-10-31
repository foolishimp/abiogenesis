#!/usr/bin/env python3
"""Bind cumulative reported usage only after completed B02 handoff."""
from pathlib import Path
import json,subprocess
from decimal import Decimal
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');attempt=base/'attempt-005'
assert (base/'attempt-004/after-run-resume.json').is_file() and (base/'attempt-004/execution.json').is_file()
assert not (attempt/'prior-b02-streams.json').exists() and not (attempt/'B03_BUDGET_BASELINE.json').exists()
prior=set(json.loads((attempt/'baseline-fp-streams.json').read_bytes())['names']);archive=base/'setup-001/resources/archives'
names=sorted(p.name for p in archive.glob('fp-*-stdout.log') if p.name not in prior)
assert names and 'fp-28892d06774fc613-stdout.log' in names
with (attempt/'prior-b02-streams.json').open('x') as f:json.dump({'kind':'b03_prior_b_family_stdout_names','names':names},f,indent=2);f.write('\n')
out=subprocess.check_output(['/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12','-B',str(attempt/'monitor-budget.py')])
x=json.loads(out);assert x['unresolvedProcesses']==0 and x['rootAction']=='MONITOR'
assert abs(Decimal(x['knownReportedIncrementUsd'])-Decimal('16.2241088'))<Decimal('0.000001')
assert abs(Decimal(x['historicalPlusKnownUsd'])-Decimal('62.6200354'))<Decimal('0.000001')
with (attempt/'B03_BUDGET_BASELINE.json').open('xb') as f:f.write(out)
print(json.dumps({'streams':len(names),'bFamily':x['knownReportedIncrementUsd'],'total':x['historicalPlusKnownUsd'],'otherCharges':'unknown'}))
