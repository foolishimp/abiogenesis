#!/usr/bin/env python3
"""Pin retained cross-store provider logs; no provider or Public call."""
from pathlib import Path
import hashlib,json
b=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');att=b/'attempt-009'
archives=[b/'setup-001/resources/archives',b/'setup-002/resources/archives',b/'sunny-day-001/runs/basic-cli/2026-10-31T17-39-58-824Z-8a923ee9-ae9b-4ffa-9d35-0a85a0b5df64/resources/archives']
recovery=list((b/'recovery-001/runtime/tmp').glob('*/workspace/.ai-workspace/archive'));assert len(recovery)==1;archives+=recovery
rows=[];groups=[]
for d in archives:
 names=sorted(p.name for p in d.glob('fp-*-stdout.log'));groups.append({'directory':str(d),'names':names})
 for name in names:
  p=d/name
  with p.open('rb') as f:h=hashlib.file_digest(f,'sha256').hexdigest()
  rows.append({'path':str(p),'sha256':h,'bytes':p.stat().st_size})
out={'kind':'b07_prior_provider_stream_inventory','classification':'prior raw logs retained locally; digests support continuity of reported ledger, not invented cost','archives':groups,'streams':rows}
data=(json.dumps(out,indent=2,sort_keys=True)+'\n').encode()
with (att/'PRIOR_PROVIDER_STREAMS.json').open('xb') as f:f.write(data)
print(json.dumps({'archives':len(groups),'streams':len(rows),'sha256':hashlib.sha256(data).hexdigest()}))
