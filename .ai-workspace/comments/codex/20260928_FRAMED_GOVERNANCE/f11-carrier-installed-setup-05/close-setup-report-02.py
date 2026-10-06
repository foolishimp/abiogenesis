from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import stat
import time

report_started = time.monotonic()
payload_reuse = {}

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
                cached = payload_reuse.get(str(p))
                if cached is not None:
                    assert s.st_size == cached['bytes'] and row['mode'] == cached['mode']
                    row.update(kind='file', bytes=s.st_size, sha256=cached['sha256'])
                else:
                    row.update(kind='file', bytes=s.st_size, sha256=digest_file(p))
                files.append(row)
            else:
                row.update(kind='nonregular', physicalType=stat.S_IFMT(s.st_mode))
                files.append(row)
    return sorted(files, key=lambda x:x['path']), sorted(directories, key=lambda x:x['path'])

activation = read('report-writer-activation.json')
assert activation['operation'] == 'T287_C05_SETUP_REPORT_COORDINATE_CLOSURE_01'
state = read('setup-state.json')
env = read('setup-closed-environment.json')
supervisor = read('setup-supervisor-close.json')
population = read('installed-physical-population.json')['products']
for product_population in population:
    for member in product_population['completeFiles']:
        payload_reuse[str(Path(product_population['installedRoot'])/member['path'])] = member
# Runtime and all completed reports are read-only; preserve every protected body.
for pin in activation['protectedPreimages']:
    p = root/pin['path']
    assert p.stat().st_size == pin['bytes'] and digest_file(p) == pin['sha256']
assert supervisor['exitCode'] == 0 and not supervisor['timedOut']
assert len(state['calls']) == 14
projected_binding = state['environment']['workspaceBinding']
projected_coordinate = {'ref':projected_binding['bindingId'],'digest':projected_binding['bindingDigest']}
assert projected_coordinate == state['binding']
assert read('setup-bind-stdout.json')['receipt']['ownerOutput']['value']['binding'] == projected_coordinate
assert state['environment']['workspaceBindingCandidate']['bindingId'] == projected_coordinate['ref']
assert state['environment']['workspaceBindingCandidate']['bindingDigest'] == projected_coordinate['digest']
report_disposition = {'operation':activation['operation'],'grant':activation['control'],'changeClass':'realization_refactor; report coordinate join','failedComparison':'full projected WorkspaceBinding == Public ref/digest; preserved byte-exact','selectedComparison':{'projectedCoordinate':projected_coordinate,'actualPublicCoordinate':state['binding'],'equal':True},'fullProjection':projected_binding,'fullProjectionPreservedSeparately':True,'actualRuntimeStateEffects':0,'payloadComparisonRepeats':0,'originalCompletedReports':'unchanged; reused','returnRole':'Executive after CLOSED; no mutation authority'}
write('report-coordinate-disposition.json', report_disposition)
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
handoff_digest = canonical(handoff)
write('closed-event-resource-handoff.json', {'status':'CLOSED_REOPENABLE_COMPLETE_SETUP','closeHandoff':handoff,'handoffDigest':handoff_digest,'physical':physical,'stableAfterSupervisorClose':True,'eventLockPresent':False,'productInstalls':state['environment']['productInstalls'],'workspaceBinding':state['binding'],'fullProjectedWorkspaceBinding':projected_binding,'workspaceBindingCandidate':state['environment']['workspaceBindingCandidate'],'resolvedLock':{'ref':state['resolvedLock']['lockId'],'digest':state['resolvedLock']['lockDigest']},'catalog':{'basisDigest':state['catalog']['basisDigest']},'catalogView':{'catalogBasisDigest':state['catalogView']['catalogBasisDigest'],'viewDigest':state['catalogView']['viewDigest'],'allowlist':state['catalogView']['allowlist']},'futureReopen':'requires this exact authentic closeHandoff/handoffDigest and separately activated Root grant; this Worker stops writes','F11TaskRun':'STOPPED'})

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
write('accounting.json', {'status':'CLOSED','supervisor':supervisor,'actualOrdinaryPublicCalls':len(calls),'calls':calls,'sumMeasuredCLIElapsedMs':sum(c['elapsedMs'] for c in calls),'nominalPreflight':read('nominal-preflight-completion.json'),'heap':'unchanged/default','HOME':'/Users/jim','managedOuterGroupBeforeImports':True,'wait4':'main and all14 actual native CLI processes reaped; all14 recorded CLI groups and main absent at close','unknowns':{'npmInternalChildPids':'not individually enumerated; finite owner CLI boundary returned exit0 and recorded groups absent','ambientProcessPopulation':'not enumerated; no ps privilege dependency','F11SemanticChildRunAF22QUAL056Release':'not executed under this grant'},'providerTaskRunHelperQualificationNetworkGitEffects':0,'additionalRuntimeCallsAfterSetup':0,'reportWriter':report_disposition,'reportScriptElapsedMsAtAccounting':(time.monotonic()-report_started)*1000})

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
write('closure.json', {'status':'CLOSED','operation':'T287_C05_SETUP_REPORT_COORDINATE_CLOSURE_01','actualRuntimeOperation':'T287_F11_C05_INSTALLED_SETUP_05','role':'Report Writer','reportWriter':report_disposition,'actor':'/root/native_applicability_design','workResult':'actual_complete_ordinary_installed_setup_passed','rootAcceptedConstruction':'sha256:c996a24f9b96b12d31272582b6345e715253a2308def3f9ced11c4b5c7d4d74f','candidateFreeze':'sha256:ac42878a8191fecc5718eb8aa4dbcbf6b30b2a3f0e1e29161f94203f56d9c47e','locks':lock_summary,'actualNativeEvidence':native_counts,'admittedInstalls':2,'completePublications':12,'selectedProgramConformance':'4 passed result/declaredexit0; genuine conformance only','firstDiscrepancy':None,'sourceOwnedBinLinksFlag':'actual npm --bin-links false despite hostile true; no links/filter/deletion','strictReader':'unchanged; exact admitted complete payloads','closeHandoffDigest':handoff_digest,'resourceHandoff':'closed-event-resource-handoff.json','authorityHandoff':'installed-authority-handoff.json','eventPhysical':physical,'writesAfterFreeze':'STOPPED','Q06F11TaskRunHelperProviderQualification':'STOPPED pending separate independent GO and Root grant','independentReviewActivatedByWorker':False})

report = f'''CLOSED — actual complete C05 ordinary installed setup passed.

The accepted C05 artifact and unchanged regular USTAR wrapper passed same-process nominal verification and actual Public singleton/mixed resolution. Both Public Product.install operations returned declared result/exit 0 and produced actual ABG-admitted installs. Actual npm receipts retain --bin-links false under npm_config_bin_links=true; no payload filtering, link deletion or wrapper repacking occurred. Complete admitted payloads contain {population[0]['installedRegularMembers']} core and {population[1]['installedRegularMembers']} wrapper regular files, with zero links/nonregular entries and exact archive bodies. All file and directory modes, including any role-specific differences, are recorded in installed-physical-population.json.

The actual fresh workspace bound both admitted Products to mixed lock {state['resolvedLock']['lockDigest']}. All 12 exact installed publications were materialized and admitted; the catalog contains {len(state['catalog']['entries'])} graph functions and {len(state['catalog']['declarationEntries'])} declarations. Its common View carries the assessor, self-conformance, exact-candidate and wrapper-parent functions. Ordinary Public conformance passed result/exit 0 for all four selected Programs. Actual Program/start/parent/child/publication/binding/catalog/actor/root coordinates are in installed-authority-handoff.json; full actual setup-state.json, publication-inputs.json and setup-closed-environment.json remain frozen.

One pre-import supervised setup completed in {supervisor['elapsedMs']/1000:.3f} seconds, including {len(calls)} actual Public calls and {supervisor['phaseCompletion']['elapsedMs']/1000:.3f} seconds nominal preflight. Default heap/HOME remained unchanged, no timeout occurred, main and all 14 known CLI groups were absent at close, and all observed main/native CLI processes were wait4-reaped. Peak main RSS was {supervisor['rssBytes']} bytes. npm internal child PIDs and ambient processes were not individually enumerated. accounting.json retains actual typed outcomes, declared exits, native process receipts and cost boundaries.

Authentic closed event resource: {event}; {physical['bytes']} bytes / SHA256 {physical['sha256']} / device {physical['device']} / inode {physical['inode']}. Prefix {handoff['prefix']['coordinateDigest']}; handoff {handoff_digest}. It remained byte/inode stable after supervisor close and has no event lock. closed-event-resource-handoff.json carries the exact actual reopen authority; future reopening requires a separate Root grant.

There was no new failure, repair/retry, source/wrapper/Git/network/provider mutation or append to old Runtime resources. All finite original pins remained unchanged. Q06/F11 Task, Run, helper, child/J/foldback/parent/cold whole-path evaluation, QUAL056/AF22 green and release remain outside this setup grant and unknown. Actual Runtime remains CLOSED. Separately activated Report Writer T287_C05_SETUP_REPORT_COORDINATE_CLOSURE_01 used Root's exact 2560-byte grant 22d46a8389f9a663c6c679f129b6ee2c2765a19247275fa76f0720ff07ba6ca0 to select the correct projected bindingId/bindingDigest coordinate join. The full WorkspaceBinding projection is preserved separately; the original failed script and failed report remain byte-exact. Completed physical/conservation/installer reports were reused without repeating any payload comparison. Report Writer is CLOSED and returns to Executive; all writes stop after freeze.
'''
with (root/'return.md').open('x') as f:
    f.write(report)
frozen_at = datetime.now(timezone.utc).isoformat()
records, dirs = inventory(root)
assert not any(r['kind'] == 'nonregular' for r in records)
freeze = {'status':'CLOSED','operation':'T287_C05_SETUP_REPORT_COORDINATE_CLOSURE_01','actualRuntimeOperation':'T287_F11_C05_INSTALLED_SETUP_05','role':'Report Writer','returnRole':'Executive after CLOSED; no mutation authority','actor':'/root/native_applicability_design','frozenAt':frozen_at,'workResult':'actual_complete_ordinary_installed_setup_passed','return':'return.md','closure':'closure.json','resourceHandoff':'closed-event-resource-handoff.json','resourceHandoffDigest':handoff_digest,'authorityHandoff':'installed-authority-handoff.json','recordCount':len(records),'recordBytes':sum(r.get('bytes',0) for r in records),'symlinks':sum(r['kind']=='symlink' for r in records),'directoryCount':len(dirs),'records':records,'directories':dirs,'excludedSelf':'freeze.json only; all other actual territory file/link/directory populations included','payloadDigestPopulationSource':'installed-physical-population.json; completed actual post-Runtime file-body measurement reused; no archive comparison or installed body rehash; member sizes/modes read at closure','reportWriter':{'grant':activation['control'],'activatedAt':activation['activatedAt'],'elapsedMsToInventory':(time.monotonic()-report_started)*1000,'actualRuntimeEffects':0,'payloadComparisonRepeats':0,'protectedPreimagesUnchanged':True}}
write('freeze.json', freeze)
print(json.dumps({'status':'CLOSED','freeze':str(root/'freeze.json'),'freezeBytes':(root/'freeze.json').stat().st_size,'freezeSha256':digest_file(root/'freeze.json'),'records':freeze['recordCount'],'bytes':freeze['recordBytes'],'symlinks':freeze['symlinks'],'directories':freeze['directoryCount'],'actualCalls':14,'elapsedMs':supervisor['elapsedMs'],'eventPhysical':physical,'handoffDigest':handoff_digest,'authorityHandoff':str(root/'installed-authority-handoff.json')}))
