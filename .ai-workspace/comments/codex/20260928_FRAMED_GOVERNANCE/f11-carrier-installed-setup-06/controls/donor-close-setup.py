from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import stat
import tarfile

root = Path(__file__).resolve().parent
base = root.parent

def read(name):
    return json.loads((root / name).read_text())

def digest_file(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    return h.hexdigest()

def canonical(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()

def write(name, value):
    with (root / name).open('x') as f:
        json.dump(value, f, indent=2, ensure_ascii=False)
        f.write('\n')

def inventory(directory):
    files, directories = [], []
    for current, dirs, names in os.walk(directory, followlinks=False):
        dirs.sort()
        names.sort()
        for n in list(dirs) + names:
            p = Path(current) / n
            s = p.lstat()
            row = {'path': str(p.relative_to(directory)), 'mode': oct(stat.S_IMODE(s.st_mode))}
            if stat.S_ISLNK(s.st_mode):
                row.update(kind='symlink', target=os.readlink(p))
                files.append(row)
                if n in dirs:
                    dirs.remove(n)
            elif stat.S_ISDIR(s.st_mode):
                row.update(kind='directory')
                directories.append(row)
            elif stat.S_ISREG(s.st_mode):
                row.update(kind='file', bytes=s.st_size, sha256=digest_file(p))
                files.append(row)
            else:
                row.update(kind='nonregular', physicalType=stat.S_IFMT(s.st_mode))
                files.append(row)
    return sorted(files, key=lambda x:x['path']), sorted(directories, key=lambda x:x['path'])

state = read('setup-state.json')
env = read('setup-closed-environment.json')
supervisor = read('setup-supervisor-close.json')
assert supervisor['exitCode'] == 0 and not supervisor['timedOut']
assert supervisor['wait4ReapedMain'] and supervisor['processGroupAfterWait'] == 'absent'
assert len(state['calls']) == 14
assert all(r['outcomeKind'] == 'result' and r['processFailure'] is None for r in state['calls'])
assert all(r['before'] == r['afterTERM'] == 'absent' for r in supervisor['knownCLIProcessGroups'])
assert len(supervisor['knownCLIProcessGroups']) == 14
assert not (root / 'first-failure.json').exists()

pins = []
for original in read('preimages.json')['pins']:
    p = Path(original['path'])
    row = dict(original, actualBytes=p.stat().st_size, actualSha256=digest_file(p))
    row['unchanged'] = row['bytes'] == row['actualBytes'] and row['sha256'] == row['actualSha256']
    pins.append(row)
assert all(p['unchanged'] for p in pins)
source_freeze = base / 'install-bin-policy-realization-01/freeze.json'
assert digest_file(source_freeze) == '6eb4695cd12d1284afd6bb96757cf98f0b35fd377e45b023b68c853fa662f3a4'
write('conservation.json', {'status':'passed', 'exactFinitePins':pins, 'acceptedC05WholePopulationAssurance':'reused; no repeat full source or law investigation', 'acceptedInstallerSourceFreeze':{'path':str(source_freeze),'sha256':digest_file(source_freeze)}, 'strictSymlinkAndChangedBodyNegatives':'accepted installer source readiness preserved; no Runtime tampering', 'oldRuntimeResources':'read-only; no append', 'sourceWrapperGitNetworkProviderEffects':0})

population = []
for item in state['items']:
    installed = Path(item['install']['installedRoot'])
    archive = Path(item['packed']['artifactPath'])
    expected = {}
    archive_nonregular = []
    with tarfile.open(archive, 'r:gz') as tf:
        for m in tf:
            assert m.name.startswith('package/')
            rel = m.name[len('package/'):]
            if m.isdir():
                continue
            if not m.isfile():
                archive_nonregular.append({'path':rel,'type':repr(m.type)})
                continue
            assert rel not in expected
            stream = tf.extractfile(m)
            h = hashlib.sha256()
            for b in iter(lambda: stream.read(1024 * 1024), b''):
                h.update(b)
            expected[rel] = {'bytes':m.size,'sha256':h.hexdigest(),'mode':oct(m.mode)}
    actual, directories = inventory(installed)
    actual_files = {r['path']:r for r in actual if r['kind'] == 'file'}
    nonregular = [r for r in actual if r['kind'] != 'file']
    missing = sorted(set(expected) - set(actual_files))
    extra = sorted(set(actual_files) - set(expected))
    changed = [{'path':p,'expected':expected[p],'actual':actual_files[p]} for p in sorted(set(expected)&set(actual_files)) if any(expected[p][k] != actual_files[p][k] for k in ['bytes','sha256'])]
    modes = [{'path':p,'archiveMode':expected[p]['mode'],'installedMode':actual_files[p]['mode']} for p in sorted(set(expected)&set(actual_files)) if expected[p]['mode'] != actual_files[p]['mode']]
    row = {'name':item['name'],'archive':str(archive),'archiveSha256':digest_file(archive),'installedRoot':str(installed),'archiveRegularMembers':len(expected),'installedRegularMembers':len(actual_files),'installedDirectories':len(directories),'archiveNonregular':archive_nonregular,'installedNonregular':nonregular,'missing':missing,'extra':extra,'changedBodies':changed,'modeDifferences':modes,'completeFiles':actual,'completeDirectories':directories}
    population.append(row)
write('installed-physical-population.json', {'kind':'actual_complete_installed_payload_population','filtering':'none; all filesystem entries included','products':population,'sourcePolicy':'installed C05 owner passes --bin-links=false; physical strict reader unchanged'})
assert all(not r['archiveNonregular'] and not r['installedNonregular'] and not r['missing'] and not r['extra'] and not r['changedBodies'] for r in population)

npm_receipts = []
for p in sorted((root/'task-cache/_logs').glob('*.log')):
    lines = p.read_text().splitlines()
    picked = [s for s in lines if any(k in s for k in ['verbose cli','info using','verbose argv','verbose exit','info ok','verbose cwd'])]
    assert any('verbose argv' in s and '"--bin-links" "false"' in s for s in picked)
    assert any('verbose exit 0' in s for s in picked)
    npm_receipts.append({'path':str(p),'sha256':digest_file(p),'actualLines':picked})
assert len(npm_receipts) == 2
write('installer-policy-receipts.json', {'hostileEnvironment':{'npm_config_bin_links':'true'}, 'actualOwnedArguments':'--bin-links=false in accepted C05 emitted installer owner', 'npm':npm_receipts, 'completePopulationComparison':'installed-physical-population.json', 'postInstallLinkDeletionFilteringOrRepacking':False})

handoff = state['closeHandoff']
event = Path(handoff['reopenAuthority']['eventLogPath'])
a = event.stat()
event_sha = digest_file(event)
b = event.stat()
physical = {'path':str(event),'bytes':b.st_size,'sha256':event_sha,'device':b.st_dev,'inode':b.st_ino,'mode':oct(stat.S_IMODE(b.st_mode))}
assert (a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns) == (b.st_dev,b.st_ino,b.st_size,b.st_mtime_ns)
assert 'sha256:'+event_sha == handoff['prefix']['prefixDigest'] == handoff['reopenAuthority']['eventLogDigest']
assert b.st_size == handoff['prefix']['prefixLength'] == handoff['reopenAuthority']['durableByteLength']
assert b.st_dev == handoff['prefix']['storeIdentity']['device'] == handoff['reopenAuthority']['device']
assert b.st_ino == handoff['prefix']['storeIdentity']['inode'] == handoff['reopenAuthority']['inode']
lock = root/'task-tmp/abiogenesis-event-store-locks-v5'/f'{b.st_dev}-{b.st_ino}.lock'
assert not lock.exists()
last_physical = read('setup-conformance-parent-after-physical.json')
assert all(last_physical[k] == physical[k] for k in ['path','bytes','sha256','device','inode'])
assert env['closeHandoff'] == handoff and env['prefix'] == handoff['prefix']
assert len(state['environment']['productInstalls']) == 2
assert state['environment']['workspaceBinding'] == state['binding']
handoff_digest = canonical(handoff)
write('closed-event-resource-handoff.json', {'status':'CLOSED_REOPENABLE_COMPLETE_SETUP','closeHandoff':handoff,'handoffDigest':handoff_digest,'physical':physical,'stableAfterSupervisorClose':True,'eventLockPresent':False,'productInstalls':state['environment']['productInstalls'],'workspaceBinding':state['binding'],'workspaceBindingCandidate':state['environment']['workspaceBindingCandidate'],'resolvedLock':{'ref':state['resolvedLock']['lockId'],'digest':state['resolvedLock']['lockDigest']},'catalog':{'basisDigest':state['catalog']['basisDigest']},'catalogView':{'catalogBasisDigest':state['catalogView']['catalogBasisDigest'],'viewDigest':state['catalogView']['viewDigest'],'allowlist':state['catalogView']['allowlist']},'futureReopen':'requires this exact authentic closeHandoff/handoffDigest and separately activated Root grant; this Worker stops writes','F11TaskRun':'STOPPED'})

inputs = read('publication-inputs.json')
assert len(inputs['modulePublications']) == len(state['catalog']['boundPublications']) == 12
selected_refs = ['program://abiogenesis/qualification/assess@5','program://abiogenesis/qualification/self-conformance@5','program://abiogenesis/qualification/exact-candidate@5','program://abiogenesis-fixture/f11-carrier/parent@5']
selected_programs, publications = [], []
for p in inputs['modulePublications']:
    summary = {k:p[k] for k in ['owningProductId','productContentDigest','productManifestDigest','moduleRef','moduleVersion']}
    summary.update(publicationBinding=next(r for i in state['items'] if i['verified']['productId'] == p['owningProductId'] for r in i['verified']['contributionManifest']['publicationBindings'] if r['moduleRef'] == p['moduleRef']), inventoryCounts={k:len(p.get(k,[])) for k in ['graphFunctions','programs','runEnvironments','implementationBindings','rules','contracts','closureContracts','evaluators']})
    publications.append(summary)
    for pg in p.get('programs',[]):
        if pg['programRef'] in selected_refs:
            selected_programs.append({'program':pg,'publication':summary,'actualConformance':json.loads((root/('setup-conformance-'+pg['programRef'].split('/')[-1].split('@')[0]+'-stdout.json')).read_text())['receipt']})
assert len(selected_programs) == 4
assert all(p['actualConformance']['exitCode'] == 0 and p['actualConformance']['ownerOutput']['outcomeKind'] == 'result' and p['actualConformance']['ownerOutput']['value']['disposition'] == 'passed' for p in selected_programs)
selected_callables = [e for e in state['catalogView']['entries'] if e['handle'] in state['catalogView']['allowlist']]
write('installed-authority-handoff.json', {'kind':'actual_installed_setup_authority_handoff','currentActor':state['workspaceAuthority']['authorizedActorRef'],'workspaceAuthority':state['workspaceAuthority'],'workspaceManifest':state['workspaceManifest'],'workspaceBindingCandidate':state['environment']['workspaceBindingCandidate'],'workspaceBinding':state['binding'],'roots':state['roots'],'productInstalls':state['environment']['productInstalls'],'productSet':state['environment']['productSet'],'resolvedLock':state['resolvedLock'],'contractCatalog':state['contractCatalog'],'completePublications':publications,'catalog':{k:state['catalog'][k] for k in ['kind','basisDigest','readinessBasisDigest','workspaceBindingId','workspaceBindingDigest','lockId','lockDigest','productSetId','productSetDigest']},'catalogCounts':{'graphFunctionEntries':len(state['catalog']['entries']),'declarationEntries':len(state['catalog']['declarationEntries']),'publications':12},'catalogView':{k:state['catalogView'][k] for k in ['kind','catalogBasisDigest','viewDigest','allowlist']},'selectedPrograms':selected_programs,'actualParentChildCallables':selected_callables,'semanticExecution':'NOT RUN; ordinary conformance proves declaration readiness only'})

calls = []
for call in state['calls']:
    stem = 'setup-'+call['label']
    receipt = read(stem+'-stdout.json')['receipt']
    timing = read(stem+'-timing.json')
    native = read(stem+'-native-process.json')
    assert receipt['ownerOutput']['outcomeKind'] == 'result' and receipt['exitCode'] == 0
    assert timing['terminal']['code'] == native['exitCode'] == 0 and not timing['terminal']['timedOut']
    calls.append(dict(call, typedExitCode=receipt['exitCode'], declaredDefinition=receipt['definitionKey'], nativeProcess=native, timing=timing))
write('accounting.json', {'status':'CLOSED','supervisor':supervisor,'actualOrdinaryPublicCalls':len(calls),'calls':calls,'sumMeasuredCLIElapsedMs':sum(c['elapsedMs'] for c in calls),'nominalPreflight':read('nominal-preflight-completion.json'),'heap':'unchanged/default','HOME':'/Users/jim','managedOuterGroupBeforeImports':True,'wait4':'main and all14 actual native CLI processes reaped; all14 recorded CLI groups and main absent at close','unknowns':{'npmInternalChildPids':'not individually enumerated; finite owner CLI boundary returned exit0 and recorded groups absent','ambientProcessPopulation':'not enumerated; no ps privilege dependency','F11SemanticChildRunAF22QUAL056Release':'not executed under this grant'},'providerTaskRunHelperQualificationNetworkGitEffects':0,'additionalRuntimeCallsAfterSetup':0})

lock_summary = {}
for name in ['singleton','mixed']:
    result = read('pure-'+name+'-resolution.json')['outcome']
    lock_summary[name] = {k:result[k] for k in ['kind','lockId','lockDigest','nativeContractClosureDigest']}
    lock_summary[name]['products'] = [r['productId'] for r in result['rows']]
native_counts = {}
for name in ['core','fixture']:
    nominal = read('nominal-'+name+'-verification.json')
    verified = nominal['verifiedArtifact']
    evidence = verified['nativeDeclarationEvidence']
    native_counts[name] = {'publicContracts':len(verified['publicContracts']), 'nativeContracts':len(evidence['contracts']), 'sources':len(evidence['sources']), 'closures':len(evidence['closures']), 'packageMetadata':len(evidence['packageMetadata']), 'pendingExternalSelectors':nominal['pendingExternalSelectors']}
write('closure.json', {'status':'CLOSED','operation':'T287_F11_C05_INSTALLED_SETUP_05','actor':'/root/native_applicability_design','workResult':'actual_complete_ordinary_installed_setup_passed','rootAcceptedConstruction':'sha256:c996a24f9b96b12d31272582b6345e715253a2308def3f9ced11c4b5c7d4d74f','candidateFreeze':'sha256:ac42878a8191fecc5718eb8aa4dbcbf6b30b2a3f0e1e29161f94203f56d9c47e','locks':lock_summary,'actualNativeEvidence':native_counts,'admittedInstalls':2,'completePublications':12,'selectedProgramConformance':'4 passed result/declaredexit0; genuine conformance only','firstDiscrepancy':None,'sourceOwnedBinLinksFlag':'actual npm --bin-links false despite hostile true; no links/filter/deletion','strictReader':'unchanged; exact admitted complete payloads','closeHandoffDigest':handoff_digest,'resourceHandoff':'closed-event-resource-handoff.json','authorityHandoff':'installed-authority-handoff.json','eventPhysical':physical,'writesAfterFreeze':'STOPPED','Q06F11TaskRunHelperProviderQualification':'STOPPED pending separate independent GO and Root grant','independentReviewActivatedByWorker':False})

report = f'''CLOSED — actual complete C05 ordinary installed setup passed.

The accepted C05 artifact and unchanged regular USTAR wrapper passed same-process nominal verification and actual Public singleton/mixed resolution. Both Public Product.install operations returned declared result/exit 0 and produced actual ABG-admitted installs. Actual npm receipts retain --bin-links false under npm_config_bin_links=true; no payload filtering, link deletion or wrapper repacking occurred. Complete admitted payloads contain {population[0]['installedRegularMembers']} core and {population[1]['installedRegularMembers']} wrapper regular files, with zero links/nonregular entries and exact archive bodies. All file and directory modes, including any role-specific differences, are recorded in installed-physical-population.json.

The actual fresh workspace bound both admitted Products to mixed lock {state['resolvedLock']['lockDigest']}. All 12 exact installed publications were materialized and admitted; the catalog contains {len(state['catalog']['entries'])} graph functions and {len(state['catalog']['declarationEntries'])} declarations. Its common View carries the assessor, self-conformance, exact-candidate and wrapper-parent functions. Ordinary Public conformance passed result/exit 0 for all four selected Programs. Actual Program/start/parent/child/publication/binding/catalog/actor/root coordinates are in installed-authority-handoff.json; full actual setup-state.json, publication-inputs.json and setup-closed-environment.json remain frozen.

One pre-import supervised setup completed in {supervisor['elapsedMs']/1000:.3f} seconds, including {len(calls)} actual Public calls and {supervisor['phaseCompletion']['elapsedMs']/1000:.3f} seconds nominal preflight. Default heap/HOME remained unchanged, no timeout occurred, main and all 14 known CLI groups were absent at close, and all observed main/native CLI processes were wait4-reaped. Peak main RSS was {supervisor['rssBytes']} bytes. npm internal child PIDs and ambient processes were not individually enumerated. accounting.json retains actual typed outcomes, declared exits, native process receipts and cost boundaries.

Authentic closed event resource: {event}; {physical['bytes']} bytes / SHA256 {physical['sha256']} / device {physical['device']} / inode {physical['inode']}. Prefix {handoff['prefix']['coordinateDigest']}; handoff {handoff_digest}. It remained byte/inode stable after supervisor close and has no event lock. closed-event-resource-handoff.json carries the exact actual reopen authority; future reopening requires a separate Root grant.

There was no new failure, repair/retry, source/wrapper/Git/network/provider mutation or append to old Runtime resources. All finite original pins remained unchanged. Q06/F11 Task, Run, helper, child/J/foldback/parent/cold whole-path evaluation, QUAL056/AF22 green and release remain outside this setup grant and unknown. Worker is CLOSED; all writes stop after freeze.
'''
with (root/'return.md').open('x') as f:
    f.write(report)
frozen_at = datetime.now(timezone.utc).isoformat()
records, dirs = inventory(root)
assert not any(r['kind'] == 'nonregular' for r in records)
freeze = {'status':'CLOSED','operation':'T287_F11_C05_INSTALLED_SETUP_05','role':'Runtime Worker','actor':'/root/native_applicability_design','frozenAt':frozen_at,'workResult':'actual_complete_ordinary_installed_setup_passed','return':'return.md','closure':'closure.json','resourceHandoff':'closed-event-resource-handoff.json','resourceHandoffDigest':handoff_digest,'authorityHandoff':'installed-authority-handoff.json','recordCount':len(records),'recordBytes':sum(r.get('bytes',0) for r in records),'symlinks':sum(r['kind']=='symlink' for r in records),'directoryCount':len(dirs),'records':records,'directories':dirs,'excludedSelf':'freeze.json only; all other actual territory file/link/directory populations included'}
write('freeze.json', freeze)
print(json.dumps({'status':'CLOSED','freeze':str(root/'freeze.json'),'freezeBytes':(root/'freeze.json').stat().st_size,'freezeSha256':digest_file(root/'freeze.json'),'records':freeze['recordCount'],'bytes':freeze['recordBytes'],'symlinks':freeze['symlinks'],'directories':freeze['directoryCount'],'actualCalls':14,'elapsedMs':supervisor['elapsedMs'],'eventPhysical':physical,'handoffDigest':handoff_digest,'authorityHandoff':str(root/'installed-authority-handoff.json')}))
