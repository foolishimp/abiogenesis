"""Record the actual failed proof close without repeating execution or C2."""
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import urlparse, unquote
import hashlib, json

P = Path(__file__).resolve().parent
D, A = P.parent, P.parent / 'q23-author-06'
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

assert read(P / 'HOST_RESULT.json')['exitCode'] == 0
uat = read(P / 'NATIVE_UAT_CLOSED_RESULT.json')
assert uat['status'] == 'CLOSED_WITHOUT_NATIVE_UAT_RESULT' and not uat['nativeActorLaunched']
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
assert sum(x['pass'] for x in c2['lanes']) == 63
assert all(x[k] == 0 for x in c2['lanes'] for k in ('fail', 'skipped', 'cancelled', 'todo'))
assert c2['sourceMatches'] == 367 and c2['protectedBeforeAfterEqual']
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
    'nativeUat': {'status': 'NOT_LAUNCHED', 'capture': pin(P / 'NATIVE_UAT_CLOSED_RESULT.json'),
                  'constructionFailureResultRef': 'result://abiogenesis/47e64c8cee515b477762c0a3a711f80d0a424db1a4f0b46b9f8d7387cfbf0409'},
    'host': read(P / 'HOST_RESULT.json'),
    'sourceReview': pin(A / 'codex-review-001/REVIEW.json'),
    'limits': ['C2 remains valid bounded component evidence despite subsequent Run failure.',
               'No native UAT, formal independent source acceptance, production eligibility, qualification or release closure.',
               'Exact recurrent UAT constructor cause is under bounded owner triage; no retry selected.',
               'Prior successful checks and failures remain scoped to their exact source.']
}
put(P / 'FINAL_RUNTIME_CLOSE.json', record)

print(json.dumps({'status':record['status'],'close':pin(P/'FINAL_RUNTIME_CLOSE.json'),'prefixLength':prefix['prefixLength'],'sourceMembers':len(subject['files']),'proofInputs':len(source_before['files']),'nativePass':63,'freshFailureProjectionsConsistent':True}))
