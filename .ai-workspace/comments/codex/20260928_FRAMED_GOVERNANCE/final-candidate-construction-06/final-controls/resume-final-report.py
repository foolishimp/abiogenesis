from pathlib import Path
import hashlib, json, time, datetime, os

D = Path(__file__).resolve().parent.parent
started = time.monotonic()
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
activation = read(D / 'report-finalization-activation.json')
assert activation['operation'] == 'T287_C06_REPORT_FINALIZATION_01'
assert activation['status'] == 'ACTIVE'
control = (D / 'final-controls/finalize.py').read_text()
old = (D / 'final-controls/finalize-failed-attempt-01.py').read_text()
assert control == old.replace("'contracts/capability-definition-graph.json'",
    "'contracts/capabilities/capability-definition-graph.json'")
ctx = {'__file__': str(D / 'final-controls/finalize.py')}
# Definitions only; the completed producer/check/population phase is not run.
exec(control[:control.index("assert read(D/'activation.json')")], ctx)
ctx['ops'] = [read(D / ('final-' + name + '.json'))
    for name in read(D / 'final-budgets.json')['operationCapsMs']]
assert len(ctx['ops']) == 10
assert all(r['activation'] == 'T287_RC1_SUCCESSOR_CONSTRUCTION_06' and
    r['exitCode'] == 0 and not r['timedOut'] for r in ctx['ops'])
for name, filename in [('source', 'final-source-members.json'),
    ('identity', 'final-package-identity.json'), ('selected', 'final-selected-core.json'),
    ('generated', 'final-generated-summary.json'), ('pub', 'final-installed-publication-results.json'),
    ('wrapper', 'final-required-wrapper-rows.json')]:
    ctx[name] = read(D / filename)
assert ctx['pub']['status'] == 'passed' and len(ctx['pub']['rows']) == 11
assert ctx['wrapper']['status'] == 'REQUIRED_WRAPPER_ROWS_COMPATIBLE'
assert not ctx['wrapper']['intrinsicWrapperRepackRequired']
metadata_preimages = read(D / 'report-finalization-preimage-pins.json')
for row in metadata_preimages:
    path = Path(row['path'])
    assert path.stat().st_size == row['bytes'] and sha(path) == row['sha256']
    original = D / path.name
    if original.is_file():
        assert sha(original) == row['sha256']
closure = {'status': 'CLOSED', 'operation': 'T287_C06_REPORT_FINALIZATION_01',
    'actor': '/root/native_applicability_design', 'role': 'Worker report-only',
    'requestSHA256': activation['request']['sha256'], 'correctedOnlyRoute': activation['actualRoute'],
    'originalTenCommandOperation': 'T287_RC1_SUCCESSOR_CONSTRUCTION_06',
    'failedAttempt': 'final-report-refusal-01.json', 'failedScript': 'final-controls/finalize-failed-attempt-01.py',
    'completedPopulationPreimages': 'report-finalization-preimage-pins.json',
    'controlPostimageSHA256': sha(D / 'final-controls/finalize.py'),
    'payloadSourceGeneratedRuntimeEffects': 0, 'allNativeBuildPackInstallTestChecksRepeated': 0,
    'remainingNativeAndSemanticObligations': 'unknown; no qualification credit',
    'allWritesAfterFinalFreeze': 'STOPPED', 'return': 'Root Executive; independent review follows',
    'reportedAt': datetime.datetime.now(datetime.timezone.utc).isoformat()}
(D / 'report-finalization-closure.json').write_text(json.dumps(closure, indent=2) + '\n')
base_save = ctx['save']
def report_save(name, value):
    if name in ['final-closure.json', 'final-freeze.json', 'final-costs.json', 'final-attribution.json']:
        value['reportFinalization'] = closure
        if name == 'final-costs.json':
            value['reportOnlyElapsedBeforeRemainingClosureMs'] = (time.monotonic() - started) * 1000
    base_save(name, value)
ctx['save'] = report_save
# Resume at the corrected measured-delta join and retain the ordinary remaining
# accounting, source author, process closure and full inventory readbacks.
remaining = control[control.index("assert generated['sourceInputsPreserved']==1107"):]
exec(remaining, ctx)
