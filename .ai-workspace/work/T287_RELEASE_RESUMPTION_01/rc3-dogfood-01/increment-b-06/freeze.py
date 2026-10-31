#!/usr/bin/env python3
"""Freeze exact B06 prepared inputs only after the actual handoff; no dispatch."""
from pathlib import Path
import hashlib,json,subprocess
b=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');inc=b/'increment-b-06';att=b/'attempt-008';release=Path('/Users/jim/.local/share/a_c/development-supplements/gc03-adb3d8ee-1');first=b/'increment-b-01'
def sha(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def row(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
files=[att/x for x in ['ACTIVATE_B06.json','PREPARED_CALL.json','prepared-call.json','input.json','run.json','prepare-call.mjs','dispatch.mjs','monitor-budget.py','prior-setup001-streams.json','B06_BUDGET_BASELINE.json']]
files += [inc/x for x in ['task.md','HOW.md','NAMED_INTEGRATION_CHECK.json','B05_FINAL_DISPOSITION.md','HISTORICAL_INPUT_PROJECTION.json','FRESH_SETUP_SELECTION.json','fresh-setup-input.json','SETUP_PRESELECTION_CUSTODY.json','FRESH_SETUP_CUSTODY.json','PROBE_CUSTODY.json','b05-probe-diagnostic-result.json','b05-probe-gc03-policy.json','regenerate-gc03-scratch.sh','workload.json','snapshot-census.json','model-free-preflight.json','preflight.mjs','RETAINED_PREFLIGHT_AUTHORITY.json','PHYSICAL_BOUNDARY.json','capture-retained-context.mjs','capture-physical.py','check-retained-preflight.mjs','public-setup.mjs','prepare-fresh.mjs','bind-fresh-setup.py','factory.py','freeze.py']]
files += [b/x for x in ['OPERATOR.md','operator-client/consumer.mjs','operator-client/runner.mjs','operator-client/scenarios.mjs','increment-a-01/toolchain-census.py','increment-a-01/toolchain-census.json','attempt-007/B05_PARTIAL_CUSTODY.json','attempt-007/execution.json','attempt-007/fresh-reads.json','attempt-007/outcome-summary.json','setup-002/operator-resume-material.json','setup-002/summary.json','attempt-007/baseline-fp-streams.json']]
files += [release/'archive.tgz',release/'contents/INVENTORY.json',release/'release-installation.json',Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12')]
files += [first/x for x in ['task.md','HOW.md','rubric.json','grant.json','provider-custody.json','A_C2_IDENTITY.json']]
archive=b/'setup-001/resources/archives';names=json.loads((att/'prior-setup001-streams.json').read_bytes())['names'];files += [archive/name for name in names]
assert not list((b/'setup-002/resources/archives').glob('fp-*-stdout.log'))
files += [Path(r['path']) for r in json.loads((inc/'FRESH_SETUP_CUSTODY.json').read_bytes())['files']]
provider=json.loads((first/'provider-custody.json').read_bytes())
for n in provider['files']:
 if n.startswith('gc03/a_c/'):files.append(release/'contents'/n[len('gc03/'):])
identity=json.loads((first/'A_C2_IDENTITY.json').read_bytes());files.extend([Path(identity['helperResult']),Path(identity['artifactPath'])])
claude=Path('/Users/jim/.local/bin/claude');actual=claude.resolve(strict=True);node=Path('/opt/homebrew/bin/node').resolve(strict=True);version=subprocess.check_output([str(claude),'--version'],text=True).strip();assert version=='2.1.306 (Claude Code)'
assert sha(release/'archive.tgz')=='cf6b1fcdebda5c6c90a644f17f7d1d01b298f53e6e0b17051b38971b14703a35'
assert sha(Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12'))=='a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539'
x={'kind':'rc3_b06_prepared_source_manifest','status':'NOT_DISPATCHED','files':{str(p):row(p) for p in files},'claude':{**row(actual),'configuredPath':str(claude),'version':version},'node':row(node),'limits':['No B06 admission or provider dispatched','All selected source and event preimages checked again before Root dispatch','No native installed-RC3 witness or qualification claim']}
out=(json.dumps(x,indent=2,sort_keys=True)+'\n').encode()
with (att/'PREPARATION_MANIFEST.json').open('xb') as f:f.write(out)
print(json.dumps({'manifestSha256':hashlib.sha256(out).hexdigest(),'files':len(files),'dispatchSha256':sha(att/'dispatch.mjs')}))
