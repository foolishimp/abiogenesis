#!/usr/bin/env python3
"""Execute the Root-authorized bounded WIP Git transport batches only."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

repo = Path(sys.argv[1]).resolve()
root = repo / '.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT'
plan = json.loads((root / 'publication-plan.json').read_text())


def git(*args, capture=True):
    return subprocess.check_output(['git', *args], cwd=repo) if capture else subprocess.run(['git', *args], cwd=repo, check=True)


def head():
    return git('rev-parse', 'HEAD').decode().strip()


def remote():
    rows = git('ls-remote', 'origin', 'refs/heads/main').decode().splitlines()
    assert len(rows) == 1
    return rows[0].split()[0]


assert git('branch', '--show-current').decode().strip() == 'main'
assert not git('diff', '--cached', '--name-only', '-z')
published = remote()
assert published == plan['expectedPublishedBase'], ('Unexpected remote divergence', published)
git('merge-base', '--is-ancestor', published, 'HEAD', capture=False)
receipt = root / 'transport-publication.jsonl'
with receipt.open('x') as stream:
    for batch in plan['batches']:
        if batch['phase'] != 'transport_only':
            continue
        listing = repo / batch['pathList']
        assert hashlib.sha256(listing.read_bytes()).hexdigest() == batch['pathListSha256']
        paths = [x for x in listing.read_bytes().split(b'\0') if x]
        assert all((repo / p.decode()).stat().st_size <= 49 * 1024 * 1024 for p in paths)
        assert remote() == published, 'Remote changed before the next batch'
        git('--literal-pathspecs', 'add', '--pathspec-from-file=' + str(listing), '--pathspec-file-nul', capture=False)
        staged = {x for x in git('diff', '--cached', '--name-only', '-z') .split(b'\0') if x}
        assert staged == set(paths), 'Unexpected staged scope'
        git('diff', '--cached', '--check', capture=False)
        git('commit', '--quiet', '-m', f'checkpoint: preserve {repo.name} WIP proof transport {batch["batch"]:02d}', capture=False)
        commit = head()
        print(json.dumps({'stage': 'batch_committed', 'repo': repo.name, 'batch': batch['batch'], 'commit': commit, 'bytes': batch['payloadBytes']}), flush=True)
        git('push', 'origin', 'HEAD:refs/heads/main', capture=False)
        observed = remote()
        assert observed == commit, 'Remote equality not established'
        result = {'batch': batch['batch'], 'commit': commit, 'previousRemote': published,
                  'remoteMain': observed, 'payloadBytes': batch['payloadBytes'], 'push': 'succeeded'}
        stream.write(json.dumps(result) + '\n')
        stream.flush()
        published = observed
        print(json.dumps({'stage': 'batch_pushed_verified', 'repo': repo.name, **result}), flush=True)
