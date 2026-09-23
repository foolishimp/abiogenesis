#!/usr/bin/env python3
"""Finalize the already-authorized WIP checkpoint after verified payload pushes."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

repo = Path(sys.argv[1]).resolve()
root = repo / '.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT'


def git(*args, capture=True):
    return subprocess.check_output(['git', *args], cwd=repo) if capture else subprocess.run(['git', *args], cwd=repo, check=True)


def paths(*args):
    return {p.decode() for p in git(*args, '-z').split(b'\0') if p}


def remote():
    rows = git('ls-remote', 'origin', 'refs/heads/main').decode().splitlines()
    assert len(rows) == 1
    return rows[0].split()[0]


def write(name, value):
    (root / name).write_text(json.dumps(value, indent=2) + '\n')


plan = json.loads((root / 'publication-plan.json').read_text())
published = [json.loads(line) for line in (root / 'transport-publication.jsonl').read_text().splitlines()]
expected = [r for r in plan['batches'] if r['phase'] == 'transport_only']
assert [r['batch'] for r in published] == [r['batch'] for r in expected], 'Transport publication incomplete'
last = published[-1]['remoteMain']
assert git('rev-parse', 'HEAD').decode().strip() == last
assert remote() == last, 'Unexpected remote divergence'
assert not git('diff', '--cached', '--name-only', '-z')

source_rows = []
if repo.name == 'abiogenesis':
    subject = repo / '.ai-workspace/comments/codex/20260923_RETAINED_TRANSITION_REUSE/cursor-01/subject.json'
    assert hashlib.sha256(subject.read_bytes()).hexdigest() == '958805566246bb8d1cf2331424b6a935f41b0bae118e06fb4b0fc455c30e564e'
    value = json.loads(subject.read_text())
    for row in value['files']:
        path = Path(value['tenantRoot']) / row['path']
        sha = hashlib.sha256(path.read_bytes()).hexdigest()
        assert sha == row['after'], 'Accepted source changed: ' + str(path)
        source_rows.append({'path': str(path.relative_to(repo)), 'sha256': sha})
    write('final-accepted-source-verification.json', {'selectedPaths': len(source_rows), 'allMatchAcceptedSubject': True, 'files': source_rows})

ignored = json.loads((root / 'transport-backed-ignore-receipt.json').read_text())['files']
receipt = {'kind': 'wip_checkpoint_publication_receipt',
    'scope': 'All approved authored work and lossless retained proof; reproducible install/dependency/compiler/cache exclusions remain explicit.',
    'payloadPushes': published, 'finalSourceCommit': 'The commit containing this receipt.',
    'finalRemoteVerification': 'Performed after the final push and reported in the Executive handoff; no self-referential commit hash is invented.',
    'acceptedSource': '958805566246bb8d1cf2331424b6a935f41b0bae118e06fb4b0fc455c30e564e' if source_rows else None,
    'restoration': 'All archived members were restored and compared with unchanged originals; verification receipts and portable reconstruction code are included.',
    'originalRawFiles': 'Remain physically present. Exact transport-backed ignore patterns suppress only captured originals and named reproducible exclusions; new authored filenames remain visible.',
    'outcome': 'WIP; prior generic Run failed before assessment. Source fixes are accepted. Installed continuation, applicable qualification and reserved human acceptance remain open.',
    'gitEffects': 'Ordinary main commits and fast-forward pushes only; no force, amend, reset, clean, tag, default or release publication.'}
write('publication-receipt.json', receipt)
for name in ['final-staged-whitespace-check.txt', 'final-staged-check.json']:
    if not (root / name).exists():
        (root / name).write_text('{}\n' if name.endswith('.json') else '')

selected = paths('ls-files', '--cached') | paths('ls-files', '--others', '--exclude-standard')
selected.update(row['path'] for row in ignored)
if source_rows:
    selected.add('build_tenants/abiogenesis/typescript/product-toolchain-manifest.json')
listing = root / 'final-stage-paths.nul'
selected.add(str(listing.relative_to(repo)))
listing.write_bytes(b''.join(p.encode() + b'\0' for p in sorted(selected)))
reconciliation = json.loads((root / 'final-path-reconciliation.json').read_text())
reconciliation.update(status='Final publication inventory under the accepted Root grant',
    directPathCount=len(selected), finalDirectStageInventory='final-stage-paths.nul',
    acceptedSubjectVerifiedPaths=len(source_rows),
    stageIncludesAlreadyCommittedPayloads=True,
    explicitIgnoreMetadataFiles=len(ignored),
    pending=[],
    sourceAcceptance=('Root accepted exact ABI subject 958805566246bb8d1cf2331424b6a935f41b0bae118e06fb4b0fc455c30e564e after independent review d0c67865; no installed qualification inferred.' if source_rows else 'GLC checkpoint preserves its selected RC4 work; ABI source acceptance does not qualify GLC.'))
write('final-path-reconciliation.json', reconciliation)
git('--literal-pathspecs', 'add', '--all', '--force', '--pathspec-from-file=' + str(listing), '--pathspec-file-nul', capture=False)
staged = paths('diff', '--cached', '--name-only')
assert staged

entries = {}
all_entries = {}
for row in git('ls-files', '--stage', '-z').split(b'\0'):
    if row:
        fields, path = row.split(b'\t', 1)
        all_entries[path.decode()] = fields.split()[1].decode()
        if path.decode() in staged:
            entries[path.decode()] = fields.split()[1].decode()
source_index_checks = 0
for row in source_rows:
    if not row['path'].startswith('build_tenants/abiogenesis/typescript/build/'):
        assert row['path'] in all_entries, 'Accepted canonical source omitted from Git: ' + row['path']
    if row['path'] in all_entries:
        assert hashlib.sha256(git('cat-file', 'blob', all_entries[row['path']])).hexdigest() == row['sha256'], 'Git transformed accepted source: ' + row['path']
        source_index_checks += 1
catalog_roots = [root]
if source_rows:
    catalog_roots += [root / 'cursor-supplement', root / 'scratch-supplement']
transport_blob_checks = 0
transport_blob_bytes = 0
for catalog_root in catalog_roots:
    catalog = json.loads((catalog_root / 'catalog.json').read_text())
    for asset in catalog['assets']:
        for part in asset['parts']:
            path = str((catalog_root / part['path']).relative_to(repo))
            process = subprocess.Popen(['git', 'cat-file', 'blob', all_entries[path]], cwd=repo, stdout=subprocess.PIPE)
            digest = hashlib.sha256()
            length = 0
            for block in iter(lambda: process.stdout.read(1024 * 1024), b''):
                digest.update(block)
                length += len(block)
            process.stdout.close()
            assert process.wait() == 0
            assert length == part['byteLength'] and digest.hexdigest() == part['sha256'], 'Git transformed transport: ' + path
            transport_blob_checks += 1
            transport_blob_bytes += length
objects = sorted(set(entries.values()))
raw = subprocess.check_output(['git', 'cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'], cwd=repo, input=('\n'.join(objects) + '\n').encode())
sizes = {row.split()[0].decode(): int(row.split()[2]) for row in raw.splitlines()}
assert max(sizes.values()) <= 100 * 1024 * 1024, 'Oversized staged blob'
pattern = re.compile(rb'(?<![A-Za-z0-9_])(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-(?:proj-|ant-api03-)?[A-Za-z0-9_-]{40,})')
findings = []
for path, oid in entries.items():
    if Path(path).suffix in {'.md', '.json', '.ts', '.mjs', '.py', '.txt'} or Path(path).name == '.gitignore':
        if pattern.search(git('cat-file', 'blob', oid)):
            findings.append(path)
assert not findings, ('Credential-shaped staged content requires disposition', findings)
check = subprocess.run(['git', 'diff', '--cached', '--check'], cwd=repo, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
(root / 'final-staged-whitespace-check.txt').write_bytes(check.stdout)
extra_checks = {str((root / name).relative_to(repo)) for name in ['final-staged-whitespace-check.txt', 'final-staged-check.json']}
write('final-staged-check.json', {'stagedPathCountAtValidation': len(staged), 'finalStagedPathCount': len(staged | extra_checks), 'largestStagedBlobBytes': max(sizes.values()),
    'unresolvedCredentialShapedFindings': findings, 'whitespaceExitCode': check.returncode,
    'whitespaceReport': 'final-staged-whitespace-check.txt',
    'whitespaceDisposition': 'Pass.' if check.returncode == 0 else 'Historical/user-authored bytes retained exactly; report preserved without rewriting frozen evidence.',
    'acceptedSubjectCurrentHashCheck': len(source_rows), 'acceptedSourceGitBlobChecks': source_index_checks,
    'transportGitBlobChecks': transport_blob_checks, 'transportGitBlobBytesVerified': transport_blob_bytes})
git('add', '--', str((root / 'final-staged-whitespace-check.txt').relative_to(repo)), str((root / 'final-staged-check.json').relative_to(repo)), capture=False)
assert remote() == last, 'Remote changed before final commit'
message = 'checkpoint: preserve accepted cursor fixes and current ABI 5 work' if source_rows else 'checkpoint: preserve current generic lifecycle development work'
git('commit', '--quiet', '-m', message, capture=False)
commit = git('rev-parse', 'HEAD').decode().strip()
print(json.dumps({'stage': 'final_committed', 'repo': repo.name, 'commit': commit, 'stagedPaths': len(staged)}), flush=True)
git('push', 'origin', 'HEAD:refs/heads/main', capture=False)
actual = remote()
assert actual == commit, 'Final remote equality not established'
dirty = git('status', '--porcelain=v1', '-z', '--untracked-files=all').decode().split('\0')
dirty = [x for x in dirty if x]
result = {'status': 'CLOSED' if not dirty else 'REMOTE_EQUAL_WITH_RESIDUAL', 'repository': repo.name,
    'localHead': commit, 'actualRemoteMain': actual, 'remoteEquality': True,
    'commitLink': f'https://github.com/foolishimp/{repo.name}/commit/{commit}',
    'dirtyOrUntracked': dirty, 'payloadPushCount': len(published), 'finalPush': 'succeeded'}
output = Path('/private/tmp') / f'{repo.name}-20260923-checkpoint-final-publication.json'
output.write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result), flush=True)
