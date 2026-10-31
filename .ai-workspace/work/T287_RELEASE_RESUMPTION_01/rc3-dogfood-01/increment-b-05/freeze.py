#!/usr/bin/env python3
"""Freeze exact B05 prepared inputs only after the actual handoff; no dispatch."""
from pathlib import Path
import hashlib,json,subprocess
b=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');inc=b/'increment-b-05';att=b/'attempt-007';release=Path('/Users/jim/.local/share/a_c/development-supplements/gc03-adb3d8ee-1');first=b/'increment-b-01'
def sha(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def row(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
files=[att/x for x in ['ACTIVATE_B05.json','PREPARED_CALL.json','prepared-call.json','input.json','run.json','prepare-call.mjs','dispatch.mjs','monitor-budget.py','baseline-fp-streams.json','prior-b04-streams.json','B05_BUDGET_BASELINE.json']]
files += [inc/x for x in ['task.md','HOW.md','NAMED_INTEGRATION_CHECK.json','B04_DISPOSITION.DRAFT.md','B04_SOURCE_CUSTODY.json','B04_THREE_STREAM_CUSTODY.json','DECLARATION_CUSTODY.json','fp-7039f62840e47eb4-structured-return.json','fp-95e0c01a4a6ac5c9-structured-return.json','fp-b35290ed2a921c20-structured-return.json','b04-source-local.tar','workload.json','snapshot-census.json','model-free-preflight.json','preflight.mjs','RETAINED_PREFLIGHT_AUTHORITY.json','PHYSICAL_BOUNDARY.json','capture-retained-context.mjs','check-retained-preflight.mjs']]
files += [b/x for x in ['OPERATOR.md','operator-client/consumer.mjs','operator-client/public-setup.mjs','operator-client/runner.mjs','operator-client/scenarios.mjs','increment-a-01/toolchain-census.py','increment-a-01/toolchain-census.json','attempt-006/after-run-resume.json','attempt-006/execution.json','attempt-006/fresh-reads.json','attempt-006/outcome-summary.json','attempt-005/B03_PARTIAL_CUSTODY.json','setup-001/operator-resume-material.json']]
files += [release/'archive.tgz',release/'contents/INVENTORY.json',release/'release-installation.json',Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12')]
files += [first/x for x in ['task.md','HOW.md','rubric.json','grant.json','provider-custody.json','A_C2_IDENTITY.json']]
custody=json.loads((inc/'B04_THREE_STREAM_CUSTODY.json').read_bytes());files += [Path(r['path']) for s in custody['streams'] for r in s['artifacts']]
archive=b/'setup-001/resources/archives';names=json.loads((att/'prior-b04-streams.json').read_bytes())['names'];files += [archive/name for name in names]
provider=json.loads((first/'provider-custody.json').read_bytes())
for n in provider['files']:
 if n.startswith('gc03/a_c/'):files.append(release/'contents'/n[len('gc03/'):])
identity=json.loads((first/'A_C2_IDENTITY.json').read_bytes());files.extend([Path(identity['helperResult']),Path(identity['artifactPath'])])
claude=Path('/Users/jim/.local/bin/claude');actual=claude.resolve(strict=True);node=Path('/opt/homebrew/bin/node').resolve(strict=True);version=subprocess.check_output([str(claude),'--version'],text=True).strip();assert version=='2.1.306 (Claude Code)'
assert sha(release/'archive.tgz')=='cf6b1fcdebda5c6c90a644f17f7d1d01b298f53e6e0b17051b38971b14703a35'
assert sha(Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12'))=='a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539'
x={'kind':'rc3_b05_prepared_source_manifest','status':'NOT_DISPATCHED','files':{str(p):row(p) for p in files},'claude':{**row(actual),'configuredPath':str(claude),'version':version},'node':row(node),'limits':['No B05 admission or provider dispatched','All selected source and event preimages checked again before Root dispatch','No native installed-RC3 witness or qualification claim']}
out=(json.dumps(x,indent=2,sort_keys=True)+'\n').encode()
with (att/'PREPARATION_MANIFEST.json').open('xb') as f:f.write(out)
print(json.dumps({'manifestSha256':hashlib.sha256(out).hexdigest(),'files':len(files),'dispatchSha256':sha(att/'dispatch.mjs')}))
