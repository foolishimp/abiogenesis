from pathlib import Path
from urllib.parse import urlparse, unquote
import datetime, hashlib, json, os, shutil, stat

X = Path(__file__).resolve().parent
R = X.parent
config = json.loads((X / 'configuration.json').read_text())
P = Path(config['resources']['parent'])
E = P / 'compose-retry/evidence'

def sha_bytes(data):
    return hashlib.sha256(data).hexdigest()

def pin(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path), 'sha256': sha_bytes(data), 'bytes': len(data)}

def put(name, value):
    path = X / name
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as out:
        json.dump(value, out, indent=2)
        out.write('\n')
    return pin(path)

failure = json.loads((E / 'first-failure.json').read_text())
command = json.loads((X / 'commands/hog.result.json').read_text())
assert command['exitCode'] == 1 and not command.get('timeout')
assert failure['case'] == 'compose-retry' and failure['completedCases'] == []
assert not (P / 'workflow-foldback').exists() and not (P / 'fanout-partial').exists()

# Copy original evidence bytes and explicitly map each physical source. No owner re-entry.
copies = []
for name, root in [('driver', P / 'driver-evidence'), ('compose-retry', E)]:
    for source in sorted(root.rglob('*')):
        if source.is_file():
            target = X / 'evidence' / name / source.relative_to(root)
            target.parent.mkdir(parents=True, exist_ok=True)
            data = source.read_bytes()
            with target.open('xb') as out:
                out.write(data)
            copies.append({'source': pin(source), 'copy': pin(target)})

handoff = json.loads((E / 'setup-close-handoff.json').read_text())
prefix = handoff['prefix']
log = Path(unquote(urlparse(prefix['eventLogRef']).path))
log_bytes = log.read_bytes()
log_stat = log.stat()
assert len(log_bytes) == prefix['prefixLength']
assert 'sha256:' + sha_bytes(log_bytes) == prefix['prefixDigest']
assert log_stat.st_dev == prefix['storeIdentity']['device']
assert log_stat.st_ino == prefix['storeIdentity']['inode']
copy_log = X / 'evidence/compose-retry/setup-events.jsonl'
with copy_log.open('xb') as out:
    out.write(log_bytes)
copies.append({'source': pin(log), 'copy': pin(copy_log)})
prefix_pin = put('actual-prefix.json', {
    'status': 'verified_actual_setup_prefix_only',
    'handoff': pin(E / 'setup-close-handoff.json'),
    'prefix': prefix,
    'physical': {**pin(log), 'realpath': str(log.resolve()), 'device': log_stat.st_dev,
                 'inode': log_stat.st_ino, 'mode': oct(stat.S_IMODE(log_stat.st_mode))},
    'retainedBytes': pin(copy_log),
    'scope': 'Actual closed setup prefix; no Public start, Run traversal, or fresh Result/replay proof occurred.'
})

# The original driver already captured every case file on failure. Extend that
# retained snapshot only for files written after it and the two driver records.
base = json.loads((E / 'failure-physical.json').read_text())
physical = [{**row, 'path': 'compose-retry/' + row['path']} for row in base['files']]
known = {row['path'] for row in physical}
supplement_paths = [E / 'failure-physical.json', E / 'failure-preservation.json']
supplement_paths += [p for p in (P / 'driver-evidence').iterdir() if p.is_file()]
for path in sorted(supplement_paths):
    rel = str(path.relative_to(P))
    assert rel not in known
    s = path.lstat()
    physical.append({'path': rel, 'type': 'file', 'mode': stat.S_IMODE(s.st_mode),
                     'bytes': s.st_size, 'sha256': pin(path)['sha256']})
physical.sort(key=lambda row: row['path'])
runtime_bytes = sum(row.get('bytes', 0) for row in physical)
physical_pin = put('physical-resources.json', {
    'root': str(P), 'files': physical, 'logicalFileBytes': runtime_bytes,
    'fileCount': len(physical), 'originalSnapshot': pin(E / 'failure-physical.json'),
    'supplement': [pin(p) for p in supplement_paths],
    'method': 'Reuse original driver failure snapshot and append only its subsequent failure-preservation, snapshot file and driver evidence. No full stage/main or runtime rescan.'
})

# Preserve actual npm receipts; these establish operations, not a zero-child claim.
npm_logs = []
for source in sorted((P / 'compose-retry/cache/_logs').glob('*.log')):
    target = X / 'evidence/npm-logs' / source.name
    target.parent.mkdir(parents=True, exist_ok=True)
    text = source.read_text()
    with target.open('xb') as out:
        out.write(source.read_bytes())
    copies.append({'source': pin(source), 'copy': pin(target)})
    npm_logs.append({'source': pin(source), 'copy': pin(target),
                     'selectedReceiptLines': [line for line in text.splitlines()
                       if any(term in line for term in ['verbose title', 'verbose argv', 'verbose exit', 'info ok'])]})
effects_pin = put('observed-effects.json', {
    'candidateProductRepacks': 0, 'bootstrapInstalls': 1,
    'setupProductInstalls': 1, 'originalStructuralFixturePacks': 1,
    'setupStructuralFixtureInstalls': 1,
    'npmReceiptCount': len(npm_logs), 'npmReceipts': npm_logs,
    'directDriverCommandReceipts': [pin(p) for p in sorted((E / 'commands').glob('*.json'))],
    'publicStarts': 0, 'freshPublicReads': 0, 'completedCases': 0,
    'nativeProviderCalls': 0, 'executionRetries': 0,
    'cleanupHooksCaptured': failure['cleanupHooksCaptured'], 'cleanupHooksInvoked': 0,
    'unknown': ['Complete helper-internal child-command census and per-child CPU/memory/IO were not observed.',
                'Successful helper-internal npm raw stdout/stderr and parent exit receipts are not exposed by existing support; retained npm debug logs report exit 0.'],
    'basis': 'Counts above come from actual retained npm title/argv/exit receipts and original driver evidence. Native/provider zero does not mean zero process execution.'
})
root_states = []
for path in [config['resources']['parent'], config['resources']['evidence']] + [p for roots in config['resources']['cases'].values() for p in roots.values()]:
    p = Path(path)
    root_states.append({'path': path, 'exists': p.exists(), 'realpath': str(p.resolve()) if p.exists() else None})
roots_pin = put('resource-root-states.json', root_states)
map_pin = put('portable-evidence-map.json', {'files': copies, 'scope': 'Exact original receipts, failure/residue inventories, npm logs and actual setup-prefix bytes; installed trees remain retained at their physical roots.'})
preservation = json.loads((E / 'failure-preservation.json').read_text())
assert all(row['status'] == 'unchanged' for row in preservation)

execution_bytes_before_return = sum(p.stat().st_size for p in X.rglob('*') if p.is_file())
binding_bytes = sum(p.stat().st_size for p in R.iterdir() if p.is_file())
assert runtime_bytes + execution_bytes_before_return + binding_bytes < 4294967296

return_pin = put('return.json', {
    'activation': 'HOG-FINAL06-EXECUTION-01', 'writer': '/root/stdo3_final_proof_writer',
    'returnTo': '/root', 'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'failed_stopped_for_executive_triage',
    'frame': 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration',
    'method': config['method'], 'preparationFreeze': pin(R / 'freeze.json'),
    'configuration': pin(X / 'configuration.json'), 'grant': pin(X / 'effect-grant.json'),
    'executiveDecision': pin(X / 'executive-decision.json'),
    'subject': {k: config['subject'][k] for k in ['id', 'freeze', 'archive', 'manifest', 'productContentDigest']},
    'actualFinalP1': config['prerequisites'][0],
    'runner': pin(R / 'run.mjs'), 'oracle': pin(R / 'oracle.mjs'),
    'execution': {'request': pin(X / 'commands/hog.request.json'), 'result': pin(X / 'commands/hog.result.json'),
                  'stdout': pin(X / 'driver.stdout'), 'stderr': pin(X / 'driver.stderr'),
                  'exitCode': 1, 'wallMs': command['wallMs'], 'outerCeilingMs': 1800000,
                  'outerCeilingReached': False, 'supervisorSignals': 0},
    'firstFailure': {'record': pin(E / 'first-failure.json'), 'phase': failure['phase'],
                     'case': failure['case'], 'error': failure['error'],
                     'preciseBoundary': 'constructInstalledStartCall resolution assertion at original run.mjs:180, after setup close handoff and before start-call-and-resolution or Public start.'},
    'reached': ['Original full input preflight satisfied', 'Offline bootstrap and all 5271 installed member checks passed',
                'Original structural fixture pack/install and setup catalog owner calls completed',
                'Actual setup store close handoff retained', 'Start-call construction received catalog refusal'],
    'notReached': ['No compose-retry Public start or outcome oracle', 'No workflow-foldback allocation or execution',
                   'No fanout-partial allocation or execution', 'No fresh Result/replay checks'],
    'actualPrefix': prefix_pin, 'physicalResources': physical_pin, 'resourceRoots': roots_pin,
    'observedEffects': effects_pin, 'portableEvidence': map_pin,
    'preservation': {'record': pin(E / 'failure-preservation.json'), 'results': preservation,
                     'scope': 'Original driver checked exact source/emitted/dependency/support and protected main inventories once after failure; no extra full inventories were run.'},
    'retention': {'runtimeLogicalBytes': runtime_bytes, 'executionLogicalBytesBeforeReturn': execution_bytes_before_return,
                  'preparationBindingBytes': binding_bytes, 'maxAdditionalBytes': 4294967296,
                  'scope': 'Logical retained file bytes, not exclusive disk allocation; compact return/freeze metadata follows.'},
    'limits': ['No independent semantic acceptance, L5 or release acceptance.',
               'The refusal establishes failure of this exact prepared HoG call path; causal repair and scope selection remain Executive work.',
               'One observed failed run and raw time/resource output do not establish a performance distribution or causal comparison.'],
    'disposition': 'Stopped before repair, retry, cleanup, next case or optional law tests. Preserve this cut and return Root for multi-frame triage.'
})
frozen_files = [pin(p) for p in sorted(X.rglob('*')) if p.is_file()]
freeze_pin = put('freeze.json', {'kind': 'frozen_hog_failed_execution_return', 'activation': 'HOG-FINAL06-EXECUTION-01',
                               'status': 'closed_failed_return', 'files': frozen_files,
                               'preparationFreeze': pin(R / 'freeze.json'), 'physicalResources': physical_pin,
                               'noAcceptance': True})
for row in frozen_files:
    assert pin(row['path']) == row
total = runtime_bytes + binding_bytes + sum(p.stat().st_size for p in X.rglob('*') if p.is_file())
assert total < 4294967296
print(json.dumps({'return': return_pin, 'freeze': freeze_pin, 'frozenFiles': len(frozen_files),
                  'actualPrefix': prefix_pin, 'retainedLogicalBytes': total, 'status': 'failed_stopped_for_executive_triage'}))
