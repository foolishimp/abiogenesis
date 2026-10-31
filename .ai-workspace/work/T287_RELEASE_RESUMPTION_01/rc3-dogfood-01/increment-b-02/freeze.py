#!/usr/bin/env python3
"""Freeze the prepared call and exact local inputs; never dispatch."""
from pathlib import Path
import hashlib,json,os,subprocess
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01')
inc=base/'increment-b-02';priorInc=base/'increment-b-01';att=base/'attempt-004';released=Path('/Users/jim/.local/share/a_c/development-supplements/gc03-adb3d8ee-1')
def sha(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def row(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
files=[att/x for x in ['ACTIVATE_B02.json','PREPARED_CALL.json','prepared-call.json','input.json','run.json','prepare-call.mjs','dispatch.mjs','monitor-budget.py','baseline-fp-streams.json','prior-b01-streams.json']]
files += [inc/x for x in ['task.md','HOW.md','workload.json','snapshot-census.json','model-free-preflight.json','preflight.mjs','PARTIAL_CUSTODY.json','partial-source-local.tar']]
files += [base/x for x in ['OPERATOR.md','operator-client/consumer.mjs','operator-client/public-setup.mjs','operator-client/runner.mjs','operator-client/scenarios.mjs',
 'increment-a-01/toolchain-census.py','increment-a-01/toolchain-census.json','attempt-003/after-run-resume.json','attempt-003/outcome-summary.json','attempt-003/fresh-reads.json','setup-001/operator-resume-material.json']]
files += [released/'archive.tgz',released/'contents/INVENTORY.json',released/'release-installation.json',Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12')]
files += [priorInc/x for x in ['task.md','HOW.md','rubric.json','grant.json','provider-custody.json','A_C2_IDENTITY.json']]
partial=json.loads((inc/'PARTIAL_CUSTODY.json').read_bytes());files += [Path(x['path']) for x in partial['nativeStreams']]
custody=json.loads((priorInc/'provider-custody.json').read_bytes())
for name in custody['files']:
 if name.startswith('gc03/a_c/'):files.append(released/'contents'/name[len('gc03/'):])
identity=json.loads((priorInc/'A_C2_IDENTITY.json').read_bytes());files.extend([Path(identity['helperResult']),Path(identity['artifactPath'])])
claude=Path('/Users/jim/.local/bin/claude');realclaude=claude.resolve(strict=True);node=Path('/opt/homebrew/bin/node').resolve(strict=True)
version=subprocess.check_output([str(claude),'--version'],text=True).strip()
assert version=='2.1.306 (Claude Code)'
assert sha(released/'archive.tgz')=='cf6b1fcdebda5c6c90a644f17f7d1d01b298f53e6e0b17051b38971b14703a35'
assert sha(Path('/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12'))=='a7f5b535d61d1c7326824204ac80f045a97a652abb154421e2c74fcc365a3539'
data={'kind':'rc3_b02_prepared_source_manifest','status':'NOT_DISPATCHED','files':{str(p):row(p) for p in files},
 'claude':{**row(realclaude),'configuredPath':str(claude),'version':version},'node':row(node),
 'limits':['No native B02 Run or provider dispatched','Source and event preimages checked again by Root dispatch','No host-wide confinement or actual native witness claim']}
out=(json.dumps(data,indent=2,sort_keys=True)+'\n').encode();target=att/'PREPARATION_MANIFEST.json'
with target.open('xb') as f:f.write(out)
print(json.dumps({'manifest':str(target),'sha256':hashlib.sha256(out).hexdigest(),'files':len(files),'dispatchSha256':sha(att/'dispatch.mjs')}))
