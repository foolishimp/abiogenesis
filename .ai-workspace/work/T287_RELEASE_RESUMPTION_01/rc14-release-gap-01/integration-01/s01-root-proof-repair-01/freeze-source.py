#!/usr/bin/env python3
"""Freeze exact materialized tracked bytes after Root's pushed checkpoint.
Preparation mode records an initial preimage without granting dispatch.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ACT = json.loads((HERE / 'ACTIVATION.json').read_text())
SOURCE = Path(ACT['sourceWorktree'])
RAW = Path(ACT['rawRoot'])


def main():
    assert len(sys.argv) in (2, 3), 'expected source HEAD [--preparation]'
    head = sys.argv[1]
    preparation = len(sys.argv) == 3 and sys.argv[2] == '--preparation'
    assert len(sys.argv) == 2 or preparation
    git = lambda *args: subprocess.check_output(['/usr/bin/git', '-C', str(SOURCE), *args])
    assert git('rev-parse', 'HEAD').decode().strip() == head
    status = git('status', '--porcelain=v1', '--untracked-files=all').decode()
    if not preparation:
        assert status == '', 'advance/refreeze only a clean pushed checkpoint'
        binding = json.loads((HERE / 'SOURCE_BINDING.json').read_text())
        assert git('merge-base', '--is-ancestor', binding['preparationBase'], head) == b''
        assert git('rev-parse', head + ':build_tenants/abiogenesis/typescript').decode().strip() == binding['tenantTree'], 'selected tenant changed before author'
        for row in json.loads((HERE / 'SOURCE_INPUTS.json').read_text())['rows']:
            path = SOURCE / row['path']
            assert path.is_file() and not path.is_symlink(), row['path']
            assert path.stat().st_size == row['bytes'] and hashlib.sha256(path.read_bytes()).hexdigest() == row['sha256'], row['path']
    rows = []
    absent = 0
    for entry in git('ls-files', '--stage', '-z').split(b'\0'):
        if not entry:
            continue
        metadata, relative = entry.split(b'\t', 1)
        mode, oid, stage = metadata.decode().split()
        assert stage == '0'
        path = SOURCE / relative.decode()
        if not path.exists():
            absent += 1
            continue
        assert path.is_file() and not path.is_symlink(), str(path)
        data = path.read_bytes()
        assert hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest() == oid, str(path)
        rows.append({'path': relative.decode(), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'gitBlob': oid, 'mode': mode})
    value = {'kind': 'materialized_source_preimage', 'head': head, 'source': str(SOURCE),
             'preparationOnly': preparation, 'sparseAbsentTrackedPaths': absent,
             'rows': rows, 'gitStatusAtCapture': status}
    name = 'SOURCE_PREIMAGE_PREPARATION.json' if preparation else 'SOURCE_PREIMAGE.json'
    with (RAW / name).open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')
    assert git('rev-parse', 'HEAD').decode().strip() == head
    print(json.dumps({'file': str(RAW / name), 'head': head, 'files': len(rows), 'bytes': sum(r['bytes'] for r in rows), 'preparationOnly': preparation}))


if __name__ == '__main__':
    main()
