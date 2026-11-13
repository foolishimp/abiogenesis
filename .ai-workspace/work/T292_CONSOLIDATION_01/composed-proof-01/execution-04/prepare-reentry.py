#!/usr/bin/env python3
"""One T292 B30 proof re-entry preparation; no tests or retries are launched."""
import argparse, copy, hashlib, importlib.util, json, subprocess, tarfile
from pathlib import Path

ROOT = Path('/Users/jim/src/apps/abiogenesis')
CAMPAIGN = Path('/private/tmp/abg-rc13-composed-proof-20261113')
RUNNER = ROOT / '.ai-workspace/work/T292_CONSOLIDATION_01/composed-proof-01/final-runner/run-composed.py'
T = 'build_tenants/abiogenesis/typescript'
FIRST = '21e6d7571e1897322cb73e96045c08c78413e8d0'
SHA = '12d49bada287be7e0690af355107d6ffda7734452288f5153c785bb92f3b98b0'
spec = importlib.util.spec_from_file_location('t292_frozen_runner', RUNNER)
r = importlib.util.module_from_spec(spec); spec.loader.exec_module(r)
p = argparse.ArgumentParser(); p.add_argument('--worktree', required=True)
p.add_argument('--cut-record', required=True); p.add_argument('--out', required=True)
a = p.parse_args(); wt = Path(a.worktree).resolve(); tenant = wt/T
out = Path(a.out).resolve(); assert out.is_dir()
old = json.loads((CAMPAIGN/'reentry-03/BROAD_CONFIG.json').read_text())
assert r.digest(RUNNER) == old['runnerSha256']
clock = r.read_campaign(old)
commit = r.git(wt, 'rev-parse', 'HEAD'); tree = r.git(wt, 'rev-parse', 'HEAD^{tree}')
assert commit != FIRST and not r.git(wt, 'status', '--porcelain=v1', '--untracked-files=no')
assert r.git(wt, 'rev-parse', '--abbrev-ref', 'HEAD') == 'HEAD'
delta = r.git(wt, 'diff', '--name-only', FIRST, commit, '--', T).splitlines()
allowed = {T+'/'+x for x in ['test_env/tests/integration-shared-seams.test.mjs','test_env/qualification/inventory.json']}
assert set(delta) == allowed, delta
cutpath = Path(a.cut_record).resolve(); cut = json.loads(cutpath.read_text())
assert cut['status'] == 'DRY_RUN_COMPLETE_NOTHING_WRITTEN_OUTSIDE_SCRATCH'
assert cut['verification']['disposition'] == 'verified' and cut['verification']['checkedPayloadFiles'] == 5291
assert cut['source']['commit'] == commit and cut['source']['tree'] == tree
assert cut['source']['scratchStampDelta'] is None and cut['source']['scratchClaimDelta'] is None
assert cut['archive']['sha256'] == SHA and cut['candidateBasis']['exactArchiveIdentity']
assert cut['comparison']['added'] == cut['comparison']['removed'] == []
assert cut['comparison']['changed'] == 0 and cut['comparison']['unchanged'] == 5293
archive = r.checked(cut['archive']); member_count = 0
with tarfile.open(archive, 'r:gz') as tf:
    for m in tf.getmembers():
        if m.isdir(): continue
        assert m.isfile() and m.name.startswith('package/'), m.name
        rel = r.relative(m.name[len('package/'):]); data = tf.extractfile(m).read()
        assert (tenant/rel).read_bytes() == data, str(rel)
        member_count += 1
assert member_count == 5293
inventory = json.loads((tenant/'test_env/qualification/inventory.json').read_text())
for m in inventory['members']:
    actual = r.pin(wt/r.relative(m['path']))
    assert 'sha256:'+actual['sha256'] == m['digest'] and actual['bytes'] == m['byteCount'], m['path']
assert len(inventory['members']) == 1280
pins = []
for pin in old['subject']['buildPins']:
    new = {**pin, 'path': str(wt/Path(pin['path']).relative_to(old['subject']['worktree']))}
    r.checked(new); pins.append(new)
correspondence = {'activation':'T292-B30-REENTRY-PREP-01', 'sourceCommit':commit, 'sourceTree':tree,
    'priorFailedSource':FIRST, 'testOnlyAndInventoryTenantDelta':delta, 'cutRecord':r.pin(cutpath),
    'archive':r.pin(archive), 'archiveMembers':member_count, 'archiveShaEqualsPayloadCheckpoint':True,
    'zeroArchiveMemberDeltas':True, 'allFinalWorktreePayloadMembersByteEqual':True,
    'sourceInventoryMembers':len(inventory['members']), 'allSourceInventoryMembersByteEqual':True,
    'runtimeBuildReusedFromExactUnchangedSource':FIRST, 'independentCleanSourceCompilationInCut':True,
    'basisMatchesArchive':True, 'installed':False, 'qualification':False}
r.save(out/'ARTIFACT_SOURCE_CORRESPONDENCE.json', correspondence)
files = sorted('test_env/tests/'+f.name for f in (tenant/'test_env/tests').glob('*.test.mjs'))+['test_env/uat/harness.test.mjs']
population = {'sourceCommit':commit, 'sourceTree':tree,
    'files':[{**r.pin(tenant/f), 'path':f} for f in files]}
assert len(files) == 225
r.save(out/'FINAL_POPULATION.json', population)
auditpath = out/'FINAL_TIMEOUT_AUDIT.json'
audit = json.loads(auditpath.read_text())
assert [(x['path'],x['sha256']) for x in audit['rows']] == [(x['path'],x['sha256']) for x in population['files']]
prior_ruling = json.loads((CAMPAIGN/'reentry-03/INPUT_RULING.json').read_text())
manual = prior_ruling['dynamicResolutionsReusedByExactFileHash']; timeouts = {}
for row in audit['rows']:
    if row['unresolved']:
        resolution = manual[row['path']]
        assert resolution['sourceSha256'] == row['sha256']
        timeouts[row['path']] = resolution['proposedOuterMs']
    else: timeouts[row['path']] = row['proposedOuterMs']
    assert timeouts[row['path']] >= row['historicalFloorMs']
assert timeouts == old['fileTimeoutMs'], 'Any changed timeout requires Root decision'
r.save(out/'INPUT_RULING.json', {'activation':'T292-B30-REENTRY-PREP-01', 'subject':commit,
    'population':r.pin(out/'FINAL_POPULATION.json'), 'timeoutAudit':r.pin(auditpath),
    'dynamicResolutionsReusedByExactFileHash':manual, 'timeoutMap':timeouts,
    'limitsUnchanged':old['limits'], 'campaign':old['campaign'],
    'standing':'Root-selected re-entry after closed B30 triage/repair. Original failure preserved; no automatic retry or clock reset.'})
r.save(out/'EXECUTION_ACTIVATION.json', {'activation':'T292-COMPOSED-EXECUTION-04', 'role':'Proof Operator',
    'sourceCommit':commit, 'sourceTree':tree, 'artifactSha256':SHA, 'runner':r.pin(RUNNER),
    'inputRuling':r.pin(out/'INPUT_RULING.json'), 'correspondence':r.pin(out/'ARTIFACT_SOURCE_CORRESPONDENCE.json'),
    'campaign':old['campaign'], 'supersedesFailedAttemptOnly':str(CAMPAIGN/'broad-03/HALT.json'),
    'standing':'Bounded mechanical re-entry after test-only B30 repair. No provider, qualification, deadline extension or automatic retry.'})
configs = []
for phase in ['broad','history']:
    c = copy.deepcopy(old); c['phase'] = phase
    c['activationRef'] = str(out/'EXECUTION_ACTIVATION.json')
    c['subject'] = {'worktree':str(wt),'commit':commit,'tree':tree,'artifact':r.pin(archive),
        'artifactSourceReceipt':r.pin(out/'ARTIFACT_SOURCE_CORRESPONDENCE.json'),'buildPins':pins}
    c['population'] = r.pin(out/'FINAL_POPULATION.json'); c['timeoutPopulationSha256'] = c['population']['sha256']
    c['timeoutAudit'] = r.pin(auditpath); c['fileTimeoutMs'] = timeouts
    c['limitsRuling'] = str(out/'INPUT_RULING.json')
    c['outputRoot'] = str(CAMPAIGN/(phase+'-04')); c['tmpRoot'] = str(CAMPAIGN/(phase+'-tmp-04'))
    r.save(out/(phase.upper()+'_CONFIG.json'), c); configs.append(r.pin(out/(phase.upper()+'_CONFIG.json')))
r.checked(old['campaign']); r.save(out/'CONFIG_PINS.json',configs)
print(json.dumps({'sourceCommit':commit,'sourceTree':tree,'archiveMembers':member_count,
    'inventoryMembers':len(inventory['members']),'population':len(files),'configs':configs},indent=2))
