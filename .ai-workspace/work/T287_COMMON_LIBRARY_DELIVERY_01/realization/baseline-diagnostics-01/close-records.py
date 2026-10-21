#!/usr/bin/env python3
"""Close retained diagnostic evidence only; no workload/owner/classifier execution."""
from pathlib import Path
import datetime
import hashlib
import json
import re
import stat

D = Path(__file__).resolve().parent
W = D.parent.parent
L = D / 'p1'
X = Path('/private/tmp/abg-stdo3-baseline-diag-aa3f6c60f8d944cb/p1/diagnostic')
E = X.parent / 'evidence'

def read(p):
    return json.loads(Path(p).read_text())

def pin(p):
    p = Path(p)
    s = p.lstat()
    assert stat.S_ISREG(s.st_mode), str(p)
    h = hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    return dict(path=str(p), sha256=h.hexdigest(), bytes=s.st_size,
                mode=oct(stat.S_IMODE(s.st_mode)))

def write(p, value):
    with Path(p).open('x') as f:
        f.write(json.dumps(value, indent=2) + '\n')

result = read(E / 'result.json')
owner = read(E / 'p1-owner-state.json')
summary = read(X / 'diagnostic-summary.json')
failure = read(L / 'coverage-result.json')
process = read(L / 'process-result.json')
resources = read(D / 'resource-plan.json')
assert result['status'] == 'satisfied' and result['subjectId'] == 'baseline'
assert result['nativeCalls'] == 0 and result['closeHandoff'] == owner['closeHandoff']
assert process['completionConfirmed'] and process['exitCode'] == 0
assert failure['status'] == 'stopped'
assert read(L / 'preservation-after.json')['status'] == 'satisfied'
assert read(L / 'retention-result.json')['exitCode'] == 0
for row in read(L / 'input-freeze.json')['files']:
    actual = pin(row['path'])
    assert all(actual[k] == row[k] for k in ('sha256', 'bytes', 'mode')), row['path']
p3 = resources['lanes']['p3']
p3paths = [p3['diagnosticRoot'], p3['cacheRoot'], *p3['runtimeRoots'].values()]
assert not (D / 'p3').exists()
assert all(not Path(p).exists() for p in p3paths)
handoff = result['closeHandoff']
prefix = handoff['prefix']
authority = handoff['reopenAuthority']
event_path = Path(authority['eventLogPath'])
event = pin(event_path)
s = event_path.stat()
assert event['bytes'] == prefix['prefixLength'] == authority['durableByteLength']
assert 'sha256:' + event['sha256'] == prefix['prefixDigest'] == authority['eventLogDigest']
assert s.st_dev == prefix['storeIdentity']['device'] == authority['device']
assert s.st_ino == prefix['storeIdentity']['inode'] == authority['inode']
write(L / 'owner-handoff.json', {
    'status': 'retained_actual_P1_close_handoff', 'subjectId': 'baseline',
    'lane': 'public-preparation', 'workloadResult': pin(E / 'result.json'),
    'ownerState': pin(E / 'p1-owner-state.json'),
    'setupIdentity': pin(E / 'setup-identity.json'), 'closeHandoff': handoff,
    'eventLog': {**event, 'device': s.st_dev, 'inode': s.st_ino},
    'verification': 'Read-only hash/length/device/inode equality to actual returned handoff; no EventStore acquisition or append',
    'scope': 'This diagnostic repetition has its own exact prefix. No equality to earlier endpoint prefix is asserted.',
})

rawtime = (X / 'execution.stderr').read_text()
timing = re.search(r'([\d.]+) real\s+([\d.]+) user\s+([\d.]+) sys', rawtime)
assert timing
maximum_rss = int(re.search(r'(\d+)\s+maximum resident set size', rawtime).group(1))
peak_footprint = int(re.search(r'(\d+)\s+peak memory footprint', rawtime).group(1))
reference_path = W / 'realization/l4-p1-baseline-01/measurement-return.json'
reference = read(reference_path)
write(L / 'measurement-return.json', {
    'status': 'observations_retained_coverage_stopped', 'subjectId': 'baseline',
    'lane': 'public-preparation', 'rawTimeEvidence': pin(X / 'execution.stderr'),
    'command': {'reportedWallSeconds': float(timing.group(1)),
                'reportedUserSeconds': float(timing.group(2)),
                'reportedSystemSeconds': float(timing.group(3)),
                'maximumResidentSetSizeBytes': maximum_rss,
                'peakMemoryFootprintBytes': peak_footprint,
                'wrapperWallSeconds': process['wrapperWallSeconds'],
                'scope': '/usr/bin/time -l measured original runner with awaited children and passive observer overhead; no per-external-child attribution'},
    'launcherSamples': pin(X / 'execution.json'),
    'nodeObservationSummary': pin(X / 'diagnostic-summary.json'),
    'nodeProcessRecords': len(summary['processes']), 'nativeTraceRecords': len(summary['traces']),
    'traceBytes': summary['traceBytes'], 'observerRecordBytes': summary['observerRecordBytes'],
    'analyserFailures': summary['failures'],
    'perPidSamples': [{k: p[k] for k in ('pid', 'ppid', 'wallMs', 'cpuUs', 'maxRSSKiB')} for p in summary['processes']],
    'counterScope': 'Per-PID per-API read/write/hash/JSON/canonical and actual RuntimeHistory observations remain separate in the pinned summary; overlapping channels are not summed. Native trace unsized/error fields are retained. Later exit handlers are outside each JS snapshot; memory samples are not heap peaks.',
    'overheadScope': 'Observer record serialization/hashing is excluded from JS counters where the frozen observer specifies; native fs trace includes preflight/evidence/observer IO. Exact trace and observer record bytes are separate overhead, never subtracted from filesystem channels. Post-run analysis, retention, copies and inventories are outside the timed endpoint.',
    'referenceEndpoint': pin(reference_path),
    'referenceRawTimes': reference['command'],
    'comparisonLimit': 'One uninstrumented and one diagnostic baseline P1 observation, with explicit fresh empty diagnostic npm cache versus earlier endpoint ambient cache boundary. Raw timing difference does not isolate instrumentation overhead and supports no statistical speed or heap claim.',
    'externalChildEvidence': pin(L / 'non-node-child-edges.json'),
    'footprints': pin(L / 'footprints.json'), 'nativeCalls': 0,
    'unobserved': ['tar/du per-PID CPU, memory and internal read/write bytes',
                   'OS-wide IO totals and unique or CoW-exclusive allocation',
                   'unsized native fs completion bytes and unprobed APIs',
                   'cold causal-iteration internal work and later exit-handler work',
                   'isolated observer overhead and statistical performance distribution'],
    'unobservedIsZero': False, 'coverageFailure': pin(L / 'coverage-result.json'),
})

write(L / 'result.json', {
    'status': 'stopped', 'activation': 'BASELINE-DIAGNOSTICS-01',
    'subjectId': 'baseline', 'lane': 'public-preparation',
    'frontier': 'post-execution diagnostic coverage check',
    'underlyingWorkload': {'status': result['status'], 'oracle': result['oracle'],
                           'result': pin(E / 'result.json'), 'process': pin(L / 'process-result.json')},
    'firstFailure': pin(L / 'coverage-result.json'),
    'unchangedCoverageContract': pin(L / 'coverage-contract.json'),
    'unchangedChecker': pin(D / 'check-coverage.py'),
    'localization': pin(L / 'failure-localization.json'),
    'externalChildEvidence': pin(L / 'non-node-child-edges.json'),
    'rawObservationSummary': pin(X / 'diagnostic-summary.json'),
    'ownerHandoff': pin(L / 'owner-handoff.json'),
    'measurement': pin(L / 'measurement-return.json'),
    'preservation': pin(L / 'preservation-after.json'),
    'physicalResources': pin(L / 'physical-resources.json'),
    'cacheInventory': pin(L / 'cache-inventory.json'),
    'portableEvidenceMap': pin(L / 'portable-evidence-map.json'),
    'P3': {'status': 'not_configured_or_executed', 'rootsStillAbsent': p3paths},
    'nativeCalls': 0, 'retry': False, 'cleanup': False,
    'claims': 'Original P1 owner/oracle success remains bounded evidence. Diagnostic coverage is stopped at the frozen external-child whitelist. No Product failure or complete measurement acceptance inferred. Root successor required before analysis reclassification or P3.',
})

return_text = f'''BASELINE-DIAGNOSTICS-01 is closed at a diagnostic coverage stop. The original baseline P1 workload and frozen oracle completed successfully once (exit 0, result `{pin(E / 'result.json')['sha256']}`); no native call occurred. P3 was never configured, allocated or executed.

The first failed predicate was the concrete external-child whitelist in `p1/coverage-contract.json`: it allowed `/usr/bin/du` but omitted ordinary `tar` archive reads. The frozen preload correctly retained those calls as external-uninstrumented. The unchanged checker and original failure remain in this cut. No workload retry, classifier change or Product failure is claimed.

`p1/non-node-child-edges.json` retains all 68 external calls: 16 tar listings, 48 tar member reads and 4 du calls. Baseline `verify_product.ts` lines 1797–1829 owns the two tar operations. Recorded PATH resolves tar through `/usr/bin/tar` to `/usr/bin/bsdtar`, SHA `1d2c90ce52b691db5e4a8b566cb162805de0ddc46d2aadff120009260f3a24a5`; this is post-run path resolution, not kernel executable attestation. Spawn return values are not child exit statuses. Tar/du per-PID CPU, memory and IO remain unobserved.

The raw summary retains 16 Node process records, 16 traces, separate overlapping byte/work channels, and no analyser failures. `/usr/bin/time -l` reported {timing.group(1)} s real, {timing.group(2)} s user and {timing.group(3)} s system; maximum RSS {maximum_rss:,} bytes. Trace overhead is {summary['traceBytes']:,} bytes plus {summary['observerRecordBytes']:,} observer-record bytes. No speedup, isolated overhead, OS-wide IO or heap-bound claim follows. Exact scopes and raw reference times are in `p1/measurement-return.json`.

The actual close handoff and {event['bytes']:,}-byte event prefix are pinned in `p1/owner-handoff.json`. The full physical inventory retains 18,298 entries; 66 portable evidence files preserve bytes/modes without claiming original inode identity. All selected immutable source/generated/dependency inputs, protected main 936 files and both original endpoint prefixes passed the post-run preservation check. All physical roots and raw diagnostic files remain retained.

Return to Root for the already identified measurement-HOW disclosure/coverage successor. No successor or P3 execution is implied by this closed stop.
'''
with (D / 'return.md').open('x') as f:
    f.write(return_text)

local_files = sorted(p for p in D.rglob('*') if p.is_file())
raw_files = sorted(p for p in X.rglob('*') if p.is_file())
files = [pin(p) for p in local_files + raw_files + [event_path]]
freeze = {
    'kind': 't287_closed_passive_diagnostic_stop', 'status': 'stopped',
    'activation': 'BASELINE-DIAGNOSTICS-01', 'writer': '/root/stdo3_proof_writer',
    'returnTo': '/root', 'subjectId': 'baseline', 'lane': 'public-preparation',
    'createdUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'archiveSha256': '192356a4291696de676128394d355e9a2d371c8828ba17d60d2daead79ac34b5',
    'originalWorkloadResultSha256': pin(E / 'result.json')['sha256'],
    'resultSha256': pin(L / 'result.json')['sha256'],
    'recordCount': len(files), 'localRecordCount': len(local_files),
    'rawDiagnosticRecords': len(raw_files), 'directEventPrefixRecords': 1,
    'files': files, 'physicalResourceEntries': len(read(L / 'physical-resources.json')['files']),
    'portableEvidenceFiles': len(read(L / 'portable-evidence-map.json')['files']),
    'nativeCalls': 0, 'P3': 'not_configured_or_executed',
    'scope': 'New records plus raw retained diagnostic files and actual closed prefix; full retained physical/cache membership is bound by the corresponding inventories. Immutable inputs remain references. Frozen failure predicate is preserved; no successor analysis or workload retry.',
}
write(D / 'freeze.json', freeze)
for row in freeze['files']:
    assert pin(row['path']) == row, row['path']
print(json.dumps({'freeze': pin(D / 'freeze.json'), 'recordCount': len(files),
                  'localRecords': len(local_files), 'rawDiagnosticRecords': len(raw_files),
                  'result': pin(L / 'result.json'), 'workloadResult': pin(E / 'result.json'),
                  'failure': pin(L / 'coverage-result.json'),
                  'nonNodeEdges': pin(L / 'non-node-child-edges.json'),
                  'handoff': pin(L / 'owner-handoff.json'), 'mismatches': 0}, indent=2))
