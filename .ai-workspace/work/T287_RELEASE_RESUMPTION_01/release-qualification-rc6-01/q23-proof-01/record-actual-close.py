"""Record the actual failed proof close without repeating execution or C2."""
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlparse, unquote
import hashlib, json

P = Path(__file__).resolve().parent
D, A = P.parent, P.parent / 'q23-author-05'
C = Path('/Users/jim/src/apps/abiogenesis-rc6-local-cut')
M = Path('/Users/jim/src/apps/abiogenesis')
def read(p): return json.loads(p.read_text())
def digest(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda: f.read(1048576), b''): h.update(b)
    return h.hexdigest()
def pin(p): return {'path': str(p), 'bytes': p.stat().st_size, 'sha256': digest(p)}
def put(p, value):
    with p.open('x') as f: f.write(json.dumps(value, indent=2) + '\n')

at = datetime.now(timezone.utc).isoformat()
outcome = read(P / 'execution/outcome-summary.json')
fresh = {x['memberKey']: x for x in read(P / 'execution/fresh-reads.json')}
resume = read(P / 'execution/after-run-resume.json')
close = resume['state']['closeHandoff']
prefix = close['prefix']
log = Path(unquote(urlparse(prefix['eventLogRef']).path))
assert outcome['disposition'] == 'runtime_failed' and outcome['terminal'] is None
assert fresh['run_result']['ownerOutput'] == {'outcomeKind': 'refusal', 'value': {'code': 'not_found', 'evidenceRefs': [], 'issuePaths': []}}
replay = fresh['run_replay']['projection']
assert replay['status'] == 'failed' and replay['terminalResult'] is None
assert replay['subject'] == outcome['run'] == fresh['run_replay']['source']
assert fresh['run_replay']['ownerOutput']['value']['projection'] == replay
assert resume['state']['resource'] is None and resume['state']['selection'] is None
assert log.stat().st_size == prefix['prefixLength']
assert 'sha256:' + digest(log) == prefix['prefixDigest']
assert log.stat().st_ino == prefix['storeIdentity']['inode']
assert close['reopenAuthority']['eventLogDigest'] == prefix['prefixDigest']
subject = read(A / 'review-subject-001/SUBJECT.json')
for f in subject['files']:
    assert digest(C / f['path']) == f['sha256'], f['path']
source_before = read(P / 'SOURCE_BEFORE.json')
for f in source_before['files']:
    assert digest(C / f['relativePath']) == f['sha256'], f['relativePath']
c2 = read(P / 'ACTUAL_C2_SUMMARY.json')
assert c2['status'] == 'ACTUAL_SELECTED_C2_PREDICATES_SATISFIED'
assert len(c2['commands']) == 6 and all(x['exitStatus'] == 0 for x in c2['commands'])
assert sum(x['pass'] for x in c2['lanes']) == 62
assert all(x[k] == 0 for x in c2['lanes'] for k in ('fail', 'skipped', 'cancelled', 'todo'))
assert c2['sourceMatches'] == 342 and c2['protectedBeforeAfterEqual']
assert c2['productDeltaCount'] == 0 and c2['unmatchedTerritoryCount'] == 0
record = {
    'kind': 'q23_actual_native_proof_failed_close', 'at': at,
    'status': 'C2_SATISFIED_UAT_CONSTRUCTION_FAILED_SOURCE_UNACCEPTED',
    'source': pin(A / 'review-subject-001/SUBJECT.json'),
    'run': outcome['run'], 'actualOutcome': pin(P / 'execution/outcome-summary.json'),
    'freshReads': pin(P / 'execution/fresh-reads.json'),
    'freshResult': 'not_found', 'freshReplayStatus': replay['status'],
    'freshReplay': replay['replay'], 'terminal': None,
    'freshFailureProjectionsConsistent': True,
    'actualResume': pin(P / 'execution/after-run-resume.json'), 'prefix': prefix,
    'allFrozenLiveMembersEqual': len(subject['files']),
    'allProofInputMembersEqual': len(source_before['files']),
    'nativeC2': pin(P / 'ACTUAL_C2_SUMMARY.json'),
    'nativeUat': {'status': 'NOT_LAUNCHED', 'failureEventOrdinal': 77434,
                  'failure': pin(P / 'RUNTIME_FAILURE_OBSERVATION.json'),
                  'diagnostic': pin(P / 'UAT_CONSTRUCTION_FAILURE_DIAGNOSTIC.json')},
    'host': read(P / 'HOST_RESULT.json'),
    'limits': ['C2 remains valid bounded component evidence despite subsequent Run failure.',
               'No native UAT, independent source acceptance, production eligibility, qualification or release closure.',
               'Constructor duplicate-path violation is established; exact recovery route is under bounded owner readiness review.',
               'Prior capture script assumed blocked and failed on runtime_failed; this operator capture failure is preserved.'],
    'operatorProjectionCorrection': 'A generic recursive resume diagnostic printed excessive public metadata. It did not change the source or runtime. This close uses exact known fields and emits only bounded coordinates.'
}
put(P / 'FINAL_RUNTIME_CLOSE.json', record)

status_path = D / 'STATUS.json'
handoffs = [D / 'HANDOFF.md', A / 'HANDOFF.md', P / 'HANDOFF.md']
central = [M / 'specification/GOALS.md', M / '.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md']
history = P / 'close-record-preimages'
history.mkdir()
preimages = []
for i, path in enumerate([status_path] + handoffs + central):
    target = history / (str(i) + '-' + path.name)
    target.write_bytes(path.read_bytes())
    preimages.append({'source': str(path), 'preimage': pin(target)})
put(history / 'MANIFEST.json', {'at': at, 'files': preimages})
old = read(status_path)
status = {k: old[k] for k in ('baseline', 'activeSourceWorktree', 'activeSourceCommit', 'activeSourceTree', 'plan', 'setupDisposition', 'independencePolicy', 'policyHowSelection', 'scenarioEvidenceMap', 'originalAttributionSourceResolution', 'scenarioEvidenceCorrection', 'currentProfileDisposition') if k in old}
status.update({
    'recordedUtc': at, 'status': record['status'],
    'currentIncrement': 'Q23 configured identity and pre-invocation policy, prospective RC7 source',
    'nativeCodingWorkers': 0, 'nativeCodingState': 'Stopped; 13-file frozen source unchanged and unaccepted.',
    'currentNativeProcess': None, 'currentNativeProofProcess': None,
    'currentSubject': record['source'], 'currentRun': outcome['run'],
    'nativeAuthorClose': pin(A / 'FINAL_RUNTIME_CLOSE.json'),
    'nativeTesting': {'commands': 6, 'pass': 62, 'fail': 0, 'skipped': 0, 'sourceMatches': 342, 'evidence': record['nativeC2']},
    'nativeUat': record['nativeUat'], 'freshResultReplay': 'not_found and failed with null terminal; consistent failed Run',
    'currentClose': record['actualResume'], 'freshClose': pin(P / 'FINAL_RUNTIME_CLOSE.json'),
    'currentCloseStanding': 'Latest authentic close; prefix431855279/8603143a3d6c1488140e44c9ce6b432ef3a55c762c2f1982aa52af48d3370d35. No older resume may substitute.',
    'independentReview': 'External different-family review blocked by authentication; no review returned. Separate Codex counterexample review active with explicit same-family-to-architect limitation.',
    'reviewAuthFailureRecord': pin(A / 'gemini-review-002/REVIEW_FAILURE_REDACTED.json'),
    'pendingOwnerDecision': 'Credential revocation/replacement and local ADC reauthentication, or another configured independent reviewer route; existing asynchronous request remains pending.',
    'd5Readiness': pin(D / 'D5_PROFILE_RETIREMENT_READINESS.json'),
    'next': 'Close bounded UAT recovery readiness, select existing-owner UAT-only continuation without rerunning valid C2, then conjoin source review. D5 recovery proof readiness proceeds read-only.',
    'qualification': 'Open; no whole-5.0 claim', 'publication': 'Not authorized',
    'handoff': str(D / 'HANDOFF.md'), 'priorStatus': preimages[0]['preimage']
})
status_path.write_text(json.dumps(status, indent=2) + '\n')
paragraph = (f'Current progress, {at}: **C2_SATISFIED_UAT_CONSTRUCTION_FAILED_SOURCE_UNACCEPTED**. '
    'RC6 is building the prospective RC7. Q23 author completed; 13 changed files are frozen at subject `60da1eb6`. '
    'Actual native C2 passed all six commands and 62 tests, with 342 source/input matches and no protected-source delta. '
    'The subsequent Run failed constructing UAT at event77434 before an assessor launched. '
    'Three duplicate readFirst paths in the Root packet violate the existing task constructor; UAT-only recovery readiness is being closed without discarding or repeating C2. '
    'Fresh run_result is not_found and replay failed with null terminal, consistently; latest genuine resume is `q23-proof-01/execution/after-run-resume.json` '
    '(431855279 bytes / prefix SHA8603143a). No coding Worker or proof process remains active. '
    'External independent review returned no review because both credential routes failed; credential replacement is pending. '
    'A separate bounded Codex source review carries an explicit same-family-to-architect limit. '
    'D5 retirement remains open before RC7 profile acceptance, with a finite six-owner scope; QR02, production eligibility, whole qualification and release remain open. '
    'All earlier accepted evidence and failures are preserved. Earlier dated states below are historical.\n\n')
for path in handoffs: path.write_text(paragraph + path.read_text())
for path in central:
    content = path.read_text()
    marker = '## Current Selection\n' if path.name == 'GOALS.md' else '## Current disposition\n'
    if marker in content: content = content.replace(marker, marker + '\n' + paragraph, 1)
    else:
        first = content.find('\n') + 1
        content = content[:first] + '\n' + paragraph + content[first:]
    path.write_text(content)
print(json.dumps({'status': record['status'], 'close': pin(P / 'FINAL_RUNTIME_CLOSE.json'),
                  'sourceMembers': len(subject['files']), 'proofInputMembers': len(source_before['files']),
                  'prefixLength': prefix['prefixLength'], 'nativePass': 62, 'activeWorkers': 0}))
