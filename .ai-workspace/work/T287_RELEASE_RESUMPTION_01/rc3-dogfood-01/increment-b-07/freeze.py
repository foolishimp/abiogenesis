#!/usr/bin/env python3
"""Freeze an actual prepared B07 call; no native dispatch."""
from pathlib import Path
import hashlib,json,subprocess
b=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');inc=b/'increment-b-07';att=b/'attempt-009';release=Path('/Users/jim/.local/share/a_c/development-supplements/gc03-adb3d8ee-1');first=b/'increment-b-01'
def row(p):
 with p.open('rb') as f:h=hashlib.file_digest(f,'sha256').hexdigest()
 return {'path':str(p),'sha256':h,'bytes':p.stat().st_size}
files=[att/x for x in ['ACTIVATE_B07.json','PREPARED_CALL.json','prepared-call.json','input.json','run.json','prepare-call.mjs','dispatch.mjs','PRIOR_PROVIDER_STREAMS.json','PREPARED_CALL.superseded-status.json']]
files += [inc/x for x in ['task.md','HOW.md','rubric.json','NAMED_INTEGRATION_CHECK.json','B07_SOURCE_BINDINGS.json','B07_BUDGET_BASELINE.json','FRESH_SETUP_SELECTION.json','fresh-setup-input.json','SETUP_PRESELECTION_CUSTODY.json','FRESH_SETUP_MANIFEST.json','prepare-fresh.mjs','public-setup.mjs','bind-fresh-setup.py','monitor-budget.py','factory.py','rubric.setup-selection-preimage.json','preflight.refused-role-overlap.stderr','model-free-preflight.superseded-status.json','workload.json','snapshot-census.json','model-free-preflight.json','preflight.mjs','RETAINED_PREFLIGHT_AUTHORITY.json','PHYSICAL_BOUNDARY.json','capture-retained-context.mjs','capture-physical.py','check-retained-preflight.mjs','freeze.py']]
files += [b/x for x in ['OPERATOR.md','operator-client/consumer.mjs','operator-client/runner.mjs','operator-client/scenarios.mjs','increment-a-01/toolchain-census.py','increment-a-01/toolchain-census.json','attempt-008/B06_PARTIAL_CUSTODY.json','attempt-008/execution.json','attempt-008/fresh-reads.json','attempt-008/outcome-summary.json','attempt-007/baseline-fp-streams.json','setup-003/operator-resume-material.json','setup-003/summary.json']]
files += [p for p in (b/'setup-003/calls').glob('*.outcome.json')]
files += [release/'archive.tgz',release/'contents/INVENTORY.json',release/'release-installation.json',Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12')]
files += [first/x for x in ['task.md','HOW.md','rubric.json','grant.json','provider-custody.json','A_C2_IDENTITY.json']]
files += [Path(x['path']) for x in json.loads((att/'PRIOR_PROVIDER_STREAMS.json').read_bytes())['streams']]
bindings=json.loads((inc/'B07_SOURCE_BINDINGS.json').read_bytes());files += [Path(x['path']) for x in [bindings['stdo']['resolvedEntrypoint'],bindings['stdo']['interpreter'],bindings['stdo']['releaseManifest'],*bindings['stdo']['toolchainModuleSources']]]
provider=json.loads((first/'provider-custody.json').read_bytes())
for n in provider['files']:
 if n.startswith('gc03/a_c/'):files.append(release/'contents'/n[len('gc03/'):])
identity=json.loads((first/'A_C2_IDENTITY.json').read_bytes());files.extend([Path(identity['helperResult']),Path(identity['artifactPath'])])
assert not list((b/'setup-003/resources/archives').glob('fp-*-stdout.log'))
claude=Path('/Users/jim/.local/bin/claude');actual=claude.resolve(strict=True);node=Path('/opt/homebrew/bin/node').resolve(strict=True);version=subprocess.check_output([str(claude),'--version'],text=True).strip();assert version=='2.1.306 (Claude Code)'
assert row(release/'archive.tgz')['sha256']=='cf6b1fcdebda5c6c90a644f17f7d1d01b298f53e6e0b17051b38971b14703a35'
assert row(Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12'))['sha256']=='a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539'
x={'kind':'rc3_b07_prepared_source_manifest','status':'NOT_DISPATCHED','files':{str(p):row(p) for p in files},'claude':{**row(actual),'configuredPath':str(claude),'version':version},'node':row(node),'limits':['No B07 admission or provider dispatched','Selected source and physical inputs checked before Root dispatch','No native installed-RC3 context witness or qualification claim']};raw=(json.dumps(x,indent=2,sort_keys=True)+'\n').encode()
with (att/'PREPARATION_MANIFEST.json').open('xb') as f:f.write(raw)
print(json.dumps({'manifestSha256':hashlib.sha256(raw).hexdigest(),'files':len(x['files']),'dispatchSha256':row(att/'dispatch.mjs')['sha256']}))
