"""Confined derivation and one existing six-case readiness command only."""
import datetime
import hashlib
import json
import os
import pathlib
import resource
import signal
import stat
import subprocess
import tarfile
import time

REPO = pathlib.Path('/Users/jim/src/apps/abiogenesis')
G = REPO / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q = G / 'final-qualification-inputs-04'
PREVIOUS = G / 'final-qualification-inputs-03'
C = G / 'final-candidate-construction-03'
T = C / 'final-stage/build_tenants/abiogenesis/typescript'
S = C / 'final-source/build_tenants/abiogenesis/typescript'
ROOT = Q / 'readiness/copied-tenant'
assert not (Q / 'freeze.json').exists()
assert not (Q / 'readiness').exists(), 'one new readiness copy and one invocation'

def read(p): return json.loads(pathlib.Path(p).read_bytes())
def sha(b): return hashlib.sha256(b).hexdigest()
def pin(p):
    p = pathlib.Path(p); raw = p.read_bytes()
    return {'path': str(p), 'bytes': len(raw), 'sha256': sha(raw)}
def put(name, value):
    p = Q / name
    assert p.parent == Q
    with p.open('x') as f: json.dump(value, f, indent=2); f.write('\n')
def copy_body(origin, relative, classification, expected=None):
    origin = pathlib.Path(origin); raw = origin.read_bytes()
    if expected: assert (len(raw), sha(raw)) == (expected['bytes'], expected['sha256'])
    p = ROOT / relative
    assert not p.exists() and not pathlib.Path(relative).is_absolute() and '..' not in pathlib.Path(relative).parts
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('xb') as f: f.write(raw)
    os.chmod(p, stat.S_IMODE(origin.stat().st_mode))
    rows.append({'path': relative, 'origin': str(origin), 'bytes': len(raw), 'sha256': sha(raw),
                 'mode': stat.S_IMODE(p.stat().st_mode), 'classification': classification})

started = time.monotonic()
manifest = read(PREVIOUS / 'input-manifest.json')
fixtures = manifest['fixtureFiles']
old_contracts = {r['path']: r for r in fixtures if r['classification'] == 'retained_RC1_component_reproduction'}
catalog_row = old_contracts['contracts/qualification/rule-catalog.json']
catalog = read(catalog_row['origin'])
assert catalog_row['sha256'] == 'e9aa4d0a863050f17ca8ed89b1911ae237df08ce1727ee24e3016f2f7297f5c4'
carrier = next(r for r in fixtures if r['classification'] == 'retained_1950_member_carrier_component_fixture')
embedded = read(carrier['origin'])
assert embedded['task']['catalog']['digest'] == 'sha256:' + catalog_row['sha256']
assert all(row in catalog['sources'] for row in embedded['task']['role']['sourceBindings'])
assert {r['ruleRef'] for r in catalog['rules']} == {r for g in embedded['task']['scope']['ruleGroups'] for r in g['ruleRefs']}
del embedded

# The prospective component uses generated current implementation bodies and
# already protected historical fixture inputs. It changes no candidate member.
expected = read(PREVIOUS / 'expected-output-inventory.json')['paths']
plan = []
for row in expected:
    if row['path'].startswith('build/'):
        plan.append({'source': row['path'], 'destination': row['path'], **{k: row[k] for k in ['bytes','sha256']},
                     'role': 'current_C03_compiled_implementation', 'sourceAuthor': 'accepted C03 source authors',
                     'copyBuildAuthor': '/root/rc1_successor_builder'})
for name in ['authority-inputs.json', 'rule-catalog.json', 'law-basis.json', 'coverage.json']:
    row = old_contracts['contracts/qualification/' + name]
    plan.append({'source': '.fixtures/' + row['target'].removeprefix('fixture-inputs/'),
                 'destination': row['path'], **{k:row[k] for k in ['bytes','sha256']},
                 'role': 'historical_RC1_contract_not_current_qualification_law', 'originalInput': row['memberRef']})
for source in catalog['sources']:
    matches = [r for r in fixtures if r['sha256'] == source['digest'].removeprefix('sha256:') and r['bytes'] == source['byteCount']]
    assert matches, 'every historical catalog source has a preserved exact fixture input: ' + source['ref']
    row = sorted(matches, key=lambda r:r['target'])[0]
    plan.append({'source': '.fixtures/' + row['target'].removeprefix('fixture-inputs/'),
                 'destination': source['path'], 'bytes': row['bytes'], 'sha256': row['sha256'],
                 'role': 'historical_RC1_source_projection', 'sourceRef': source['ref'], 'originalInput': row['memberRef']})
oracle = 'test_env/tests/t287-qualification-carrier-resource.test.mjs'
b = (S / oracle).read_bytes()
plan.append({'source': oracle, 'destination': oracle, 'bytes': len(b), 'sha256': sha(b),
             'role': 'unchanged_existing_source_case', 'sourceAuthor': 'accepted C03 carrier-source author'})
assert len({r['destination'] for r in plan}) == len(plan)
put('component-stage-plan.json', {'kind':'isolated_historical_component_derivation', 'destinationRoot':'.components/retained-carrier',
    'members':plan, 'counts':{role:sum(r['role']==role for r in plan) for role in sorted({r['role']for r in plan})},
    'currentCatalogSHA256':'bd58d739d6efddf466d2bee99c95bc0e49ca9ff3de820ec5aab217557f9afa16',
    'historicalCatalogSHA256':catalog_row['sha256'], 'additionalFixtureInputAssets':0,
    'distinction':'all historical bodies already occur in the 102 protected Q03 fixtures; these are separate staged component outputs, never current candidate outputs'})

ROOT.mkdir(parents=True)
rows = []
archive = pathlib.Path(read(C / 'final-freeze.json')['package']['artifactPath'])
assert sha(archive.read_bytes()) == 'f779058d1cc3c1867f8d53c1dda9100a136d7fa460772b6084e2f67c0cd982c6'
with tarfile.open(archive, 'r:gz') as tar:
    for member in tar.getmembers():
        relative = str(pathlib.PurePosixPath(member.name).relative_to('package'))
        if not relative.startswith(('build/', 'node_modules/')): continue
        assert member.isfile() and '..' not in pathlib.PurePosixPath(relative).parts
        raw = tar.extractfile(member).read(); p = ROOT / relative
        p.parent.mkdir(parents=True, exist_ok=True)
        with p.open('xb') as f: f.write(raw)
        os.chmod(p, member.mode)
        rows.append({'path':relative,'origin':str(archive)+'#package/'+relative,'bytes':len(raw),'sha256':sha(raw),
                     'mode':member.mode,'classification':'exact_C03_archive_implementation_or_dependency'})
for row in plan:
    if row['role'] == 'current_C03_compiled_implementation':
        assert pin(ROOT/row['destination'])['sha256'] == row['sha256']; continue
    source = next((r['origin'] for r in fixtures if '.fixtures/'+r['target'].removeprefix('fixture-inputs/') == row['source']), None)
    copy_body(source if source else S/row['source'], row['destination'], row['role'], row)
copy_body(S/'scripts/node-test-evidence-reporter.mjs','scripts/node-test-evidence-reporter.mjs','unchanged_observed_event_reporter')
copy_body(PREVIOUS/'test-environment.mjs','.recipe/test-environment.mjs','confined_environment_preload')
copy_body(carrier['origin'],'.fixtures/carrier/assessment-input.json','unchanged_1950_member_component_fixture',carrier)
for name in ['.tmp','.npm-cache','.npm-prefix','reports']:(ROOT/name).mkdir()
for name in ['.user.npmrc','.global.npmrc','.global.gitconfig','.system.gitconfig']:(ROOT/name).write_bytes(b'')
for row in plan:
    actual = pin(ROOT/row['destination']); assert (actual['bytes'],actual['sha256']) == (row['bytes'],row['sha256'])
put('readiness-copy.json', {'status':'exact_before_single_readiness','root':str(ROOT),'files':rows,
    'copiedFiles':len(rows),'copiedBytes':sum(r['bytes']for r in rows),'copyElapsedSeconds':time.monotonic()-started,
    'currentCompiledImplementation':pin(ROOT/'build/code/src/validator/qualification.js'),
    'testImportURL':(ROOT/oracle).as_uri(),'ownerCatalogURL':(ROOT/'contracts/qualification/rule-catalog.json').as_uri(),
    'roleSourceBindingsMatchHistoricalCatalog':True,'historicalSourceCopies':len(catalog['sources']),
    'currentC03TenantUnchanged':True,'nativeOrQualificationClaim':False})

# Exactly one selected existing command. A failure is retained, never retried.
command = next(c for c in read(PREVIOUS/'config.json')['commands'] if c['commandId'].endswith('/t287-qualification-carrier-resource'))
node = pathlib.Path(next(r for r in manifest['toolFiles'] if r['path']=='bin/node')['origin'])
args = command['args']
environment = {e['name']:e['value'] for e in command['environment']}
for key, relative in [('TMPDIR','.tmp'),('npm_config_cache','.npm-cache'),('npm_config_prefix','.npm-prefix'),
                      ('npm_config_userconfig','.user.npmrc'),('npm_config_globalconfig','.global.npmrc'),
                      ('GIT_CONFIG_GLOBAL','.global.gitconfig'),('GIT_CONFIG_SYSTEM','.system.gitconfig')]:
    environment[key] = str(ROOT/relative)
environment['PATH'] = str(node.parent)+':/usr/bin:/bin:/usr/sbin:/sbin'
environment['ABI5_F11_CARRIER_FULL_FIXTURE'] = str(ROOT/'.fixtures/carrier/assessment-input.json')
environment['ABI5_F11_CARRIER_REPORT'] = str(ROOT/'reports/carrier-component')
receipt={'kind':'bounded_existing_component_readiness','status':'running','startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'executable':pin(node),'args':args,'cwd':str(ROOT),'environment':environment,'outerManagedDeadlineMs':600000,
    'heap':'unchanged default; NODE_OPTIONS absent','commandsExecuted':1,'actualNativeQualification':False}
put('readiness-command.json',receipt)
t0=time.monotonic()
stdout=Q/'readiness/stdout.jsonl';stderr=Q/'readiness/stderr.txt'
with stdout.open('xb')as out,stderr.open('xb')as err:
    process=subprocess.Popen([str(node),*args],cwd=ROOT,env=environment,stdout=out,stderr=err,start_new_session=True)
    try: code=process.wait(timeout=600)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid,signal.SIGTERM)
        try:process.wait(timeout=1)
        except subprocess.TimeoutExpired:os.killpg(process.pid,signal.SIGKILL);process.wait()
        code=None
usage=resource.getrusage(resource.RUSAGE_CHILDREN)
events=[json.loads(line)for line in stdout.read_text().splitlines()]
cases=[e for e in events if e['type']=='case' and not e['suite']]
selection=next(t for t in read(PREVIOUS/'test-selection.json')['tests']if t['commandId']==command['commandId'])
exact=(len(cases)==6 and {c['name']for c in cases}==set(selection['selectedTitles']) and all(c['passed']and not c['skip']and not c['todo']for c in cases))
passed=code==0 and exact and events[0]['type']=='begin' and events[-1]['type']=='end'
put('readiness-result.json',{'status':'passed'if passed else 'failed_return_to_Root','processExit':code,'elapsedSeconds':time.monotonic()-t0,
    'directManagedChildrenMaxRSS':usage.ru_maxrss,'RSSScope':'OS RUSAGE_CHILDREN value; no whole-native/runtime memory claim',
    'selectedCount':len(cases),'expectedCount':6,'allOriginalAssertionsReachedAndPassed':passed,'cases':cases,
    'summaries':[e for e in events if e['type']=='summary'],'stdout':pin(stdout),'stderr':pin(stderr),
    'oneCommandOnly':True,'retryOrPatchAfterFailure':False,'allKnownCommandProcessesStopped':True,
    'qualification':'not observed QUAL056, native F11, independent J or AF22; existing isolated mechanical component readiness only'})
print(json.dumps({'status':'passed'if passed else 'failed_return_to_Root','exit':code,'selected':len(cases),'seconds':time.monotonic()-t0}))
