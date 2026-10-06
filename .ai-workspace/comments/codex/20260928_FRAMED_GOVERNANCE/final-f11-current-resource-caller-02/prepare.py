from pathlib import Path
import datetime, hashlib, json, os, stat, difflib

D = Path(__file__).resolve().parent
G = D.parent
P = G / 'final-f11-native-assessment-01'
B = G / 'final-f11-bound-assessment-01'
X = G / 'final-f11-native-assessment-execution-01'
FUTURE = G / 'final-f11-native-assessment-execution-02'
OP = 'T287_F11_NATIVE_ASSESSMENT_02'

def read(p): return json.loads(Path(p).read_bytes())
def digest(p):
    h = hashlib.sha256()
    with Path(p).open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''): h.update(b)
    return h.hexdigest()
def record(p):
    p = Path(p)
    assert not p.is_symlink(), p
    return {'path': str(p), 'bytes': p.stat().st_size, 'sha256': digest(p)}
def put(n, v):
    p = D / n
    assert p.parent.resolve().is_relative_to(D)
    with p.open('x') as f: json.dump(v, f, indent=2); f.write('\n')
def copy(n, target=None):
    src, dst = P / n, D / (target or n)
    with dst.open('xb') as f: f.write(src.read_bytes())
def transform(n, replacements):
    text = (P / n).read_text()
    for old, new in replacements:
        assert old in text, (n, old)
        text = text.replace(old, new)
    (D / n).write_text(text)
    (D / 'deltas' / (n + '.patch')).write_text(''.join(difflib.unified_diff(
        (P / n).read_text().splitlines(True), text.splitlines(True),
        fromfile=str(P / n), tofile=str(D / n))))

activation = read(D / 'worker-activation.json')
assert activation['status'] == 'ACTIVE'
assert activation['operation'] == 'T287_F11_CURRENT_RESOURCE_CALLER_02'
assert D.resolve() == D and not FUTURE.exists()
for p in [D, P, B, X]: assert p.resolve() == p and not p.is_symlink(), p
for sub in ['preimages', 'deltas', 'tmp', 'cache', 'config']:
    (D / sub).mkdir()

dependencies = []
for root, expected in [(P, 'f1937dec28204ef6790f9650edb27c031ee62f1abb7960b80119517339d570a6'),
                       (B, 'f32d6de072d65f922c15e388b5827f605469ed0ace0e5cbc4b3edfc3b5c6477e'),
                       (X, '31162ce8dadbcbb1572d1043c009fba71be4303875165ff562461b84b70c3feb')]:
    r = record(root / 'freeze.json'); assert r['sha256'] == expected
    freeze = read(root / 'freeze.json')
    for item in freeze['records']:
        actual = record(root / item['path'])
        assert actual['bytes'] == item['bytes'] and actual['sha256'] == item['sha256'], item['path']
    dependencies.append({'freeze': r, 'verifiedRecords': len(freeze['records']), 'conserved': True})

handoff_record = record(X / 'final-handoff.json')
assert handoff_record['bytes'] == 1330
assert handoff_record['sha256'] == 'b0cbc1aa5fb746cb2892fd889d03077c01c7fd99dc108900cd35874a256f1a2a'
handoff = read(X / 'final-handoff.json')
event = Path(handoff['reopenAuthority']['eventLogPath'])
assert event.resolve() == event
physical = record(event); st = event.stat()
assert physical['bytes'] == 73530699
assert physical['sha256'] == '146ff8220cfb3e4a9edae4148a955ae936a3dc9aa4c8b1e0da4345ead771d20c'
assert (st.st_dev, st.st_ino) == (16777230, 464012478)
assert handoff['prefix']['coordinateDigest'] == 'sha256:bf357bac4ba5677870972d63726db8e1ab50fd349b48d87ad8e4768201bb80ce'
snapshot_record = record(X / 'final-native-prefix.jsonl')
assert physical['bytes'] == snapshot_record['bytes'] and physical['sha256'] == snapshot_record['sha256']
event_count = 0
with event.open('rb') as f:
    for line in f:
        if line.strip(): event_count += 1
assert event_count == 136
old = read(P / 'initial-resource-snapshot.json')
with event.open('rb') as f:
    assert hashlib.sha256(f.read(old['bytes'])).hexdigest() == old['sha256']
rp = read(P / 'resource-plan.json')
lock = Path(rp['lockDirectory']) / '16777230-464012478.lock'
assert not lock.exists() and not lock.is_symlink()
put('consumed-inputs.json', {'dependencies': dependencies, 'currentHandoff': handoff_record,
    'currentSnapshot': snapshot_record, 'control': activation['control'],
    'assessmentDeclarations': record(P / 'assessment-declarations.json'),
    'reusedFullRender': read(P / 'bound-input-pin.json'),
    'staticConformance': record(X / 'f11-conformance-assess-stdout.json')})
put('initial-resource-snapshot.json', {**snapshot_record, 'events': 136, 'handoff': handoff})
put('initial-handoff.json', handoff)
put('initial-resource-physical.json', {**physical, 'events': event_count,
    'device': st.st_dev, 'inode': st.st_ino, 'lockPath': str(lock), 'lockPresent': False,
    'original84BytesConserved': True, 'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()})

# Helpers are retained byte-for-byte. Only this successor's request/report paths
# and the legal predecessor handoff are changed. No effectful helper is imported.
unchanged = ['public-support.mjs', 'owner-checks.mjs', 'native-checks.mjs', 'observe-process.py',
             'selected-core.json', 'prospective-cases.json', 'retained-bootstrap-core.json',
             'retained-catalog.json', 'assessment-view.json', 'bound-input-pin.json', 'budgets.json']
for n in unchanged: copy(n)
for n in ['driver.mjs', 'ordinary-caller.mjs', 'runtime-environment.json', 'resource-plan.json', 'effect-plan.json']:
    copy(n, 'preimages/' + n)
transform('ordinary-caller.mjs', [
    ('final-f11-native-assessment-execution-01', FUTURE.name),
    ('final-f11-native-assessment-01', D.name)])
transform('driver.mjs', [
    ('final-f11-native-assessment-execution-01', FUTURE.name),
    ('T287_F11_NATIVE_ASSESSMENT_01', OP),
    ("join(here,'assessment-declarations.json')", "join(here,'../final-f11-native-assessment-01/assessment-declarations.json')"),
    ('exact original84 prefix/A-W/install/lock/productSet/root actor verified current',
     'exact genuine136 prefix/A-W/install/lock/productSet/root actor verified current'),
    ("assert.equal(activation.assessmentDispatches,1);", "assert.equal(activation.assessmentDispatches,1);\nassert.deepEqual(activation.initialHandoff,(await read(join(here,'consumed-inputs.json'))).currentHandoff);\nawait verifyRecord(activation.initialHandoff);\nassert.equal(activation.providerPrerequisite,'usable_actual_native_provider_access');")])

environment = read(P / 'runtime-environment.json')
environment = {k: v.replace(str(X), str(FUTURE)) for k, v in environment.items()}
assert not any(k in environment for k in ['HOME', 'home', 'CODEX_HOME'])
assert environment['TMPDIR'] == rp['originalLockNamespace']
put('runtime-environment.json', environment)
preparation_environment = {'TMPDIR': str(D / 'tmp'), 'npm_config_cache': str(D / 'cache/npm'),
    'npm_config_prefix': str(D / 'cache/npm-prefix'), 'npm_config_userconfig': str(D / 'config/user.npmrc'),
    'npm_config_globalconfig': str(D / 'config/global.npmrc'), 'GIT_CONFIG_GLOBAL': str(D / 'config/global.gitconfig'),
    'GIT_CONFIG_SYSTEM': str(D / 'config/system.gitconfig'), 'GIT_CONFIG_NOSYSTEM': '1',
    'GIT_OPTIONAL_LOCKS': '0', 'NODE_OPTIONS': '--max-old-space-size=4096'}
put('preparation-environment.json', preparation_environment)
for name in ['user.npmrc', 'global.npmrc', 'global.gitconfig', 'system.gitconfig']:
    (D / 'config' / name).write_text('')

resource = dict(rp)
resource.update(status='offline_successor_preparation_no_native_grant', initialCloseHandoff=handoff,
    ownedReports=str(FUTURE), frozenCallerRoot=str(D), originalPrefixEvents=136,
    initialHandoffRecord=handoff_record,
    activationGuard='Later exact Root grant, this CLOSED caller freeze, unchanged bound freeze and actual136 handoff; provider-access prerequisite must be satisfied. No execution during preparation.')
resource['executionArgv'] = [arg.replace(str(P), str(D)).replace(str(X), str(FUTURE)) for arg in rp['executionArgv']]
put('resource-plan.json', resource)

effect = read(P / 'effect-plan.json')
def relocate(v):
    if isinstance(v, str): return v.replace(str(P), str(D)).replace(str(X), str(FUTURE)).replace('T287_F11_NATIVE_ASSESSMENT_01', OP)
    if isinstance(v, dict): return {k: relocate(x) for k, x in v.items()}
    if isinstance(v, list): return [relocate(x) for x in v]
    return v
effect = relocate(effect)
effect['initialPrefix'] = handoff['prefix']
effect['initialHandoff'] = handoff_record
effect['readOnly'].extend([str(P), str(X)])
effect['transport']['environment'] = environment
effect['writes'][1]['operations'] = 'Runtime-only append from exact genuine136-event/73,530,699-byte prefix, same device/inode; no overwrite/truncate/rebase'
effect['activationFields']['initialHandoff'] = handoff_record
effect['activationFields']['providerPrerequisite'] = 'usable_actual_native_provider_access'
effect['prerequisites'] = ['Root declares a separate native Worker and exact grants for all five listed effect territories',
    'Usable provider resolution/access in the actual permitted native Worker context; no blind dispatch while unavailable',
    'Unchanged current136 close, immutable dependencies and output territory without alias/symlink escape',
    'Live same-process Product verification; this pure preparation uses retained genuine verification coordinates only']
effect['activationFields']['providerAccessEvidence'] = 'Later Root-supplied exact evidence record; not fabricated by this readiness cut'
effect['futureSetup'] = {'owner': 'separately activated native Worker', 'create': [str(FUTURE), str(FUTURE / 'cache'), str(FUTURE / 'config')],
    'activationPath': str(FUTURE / 'native-activation.json'), 'grantsAreProspective': True}
effect['singleAssessmentOnly'] = True
effect['changedPrefixC2'] = 'No C2 preparation/dispatch; later C2 must consume F11 actual successor close, not this predecessor.'
put('effect-plan.json', effect)
put('delta-summary.json', {'unchangedByteCopies': [record(D / n) for n in unchanged],
    'changed': ['initial handoff/snapshot pointers and136-prefix/environment', 'distinct caller request/provenance and future execution output paths',
                'exact later activation operation/handoff/provider-prerequisite guards'],
    'declarations': 'Referenced in frozen predecessor rather than copied/restaged',
    'boundInputPromptLawTaskPlan': 'unchanged', 'scope': 'external caller realization_refactor; no Product/requirements/HOW/runtime change'})
print(json.dumps({'status': 'PREPARED_FILES', 'dependencies': [x['verifiedRecords'] for x in dependencies],
    'initialEvents': event_count, 'futureOutput': str(FUTURE), 'nativeCalls': 0}))
