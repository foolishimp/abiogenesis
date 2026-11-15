"""Exact read-only npm tree input; native compiler closure belongs to Writer."""
import hashlib
import json
import os
from pathlib import Path
import stat


def inventory(root):
    root = Path(root)
    rows = []
    total = 0
    for base, dirs, names in os.walk(root, followlinks=False):
        for name in sorted(dirs + names):
            path = Path(base) / name
            relative = str(path.relative_to(root))
            before = path.lstat()
            if path.is_symlink():
                target = os.readlink(path)
                assert not os.path.isabs(target) and path.resolve().is_relative_to(root.resolve()), relative
                rows.append({'path': relative, 'kind': 'symlink', 'target': target})
            elif path.is_file():
                data = path.read_bytes()
                after = path.lstat()
                assert (before.st_dev, before.st_ino, before.st_mtime_ns, before.st_size) == (after.st_dev, after.st_ino, after.st_mtime_ns, after.st_size), relative
                total += len(data)
                assert total <= 1024 * 1024 * 1024 and len(rows) < 30000, 'dependency inventory bound'
                rows.append({'path': relative, 'kind': 'file', 'mode': stat.S_IMODE(before.st_mode),
                             'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    rows.sort(key=lambda row: row['path'])
    encoded = json.dumps(rows, sort_keys=True, separators=(',', ':')).encode()
    return {'rows': rows, 'bytes': total, 'sha256': hashlib.sha256(encoded).hexdigest()}


def main():
    here = Path(__file__).resolve().parent
    act = json.loads((here/'ACTIVATION.json').read_text())
    source = Path('/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript')
    result = inventory(source/'node_modules')
    raw = Path(act['rawRoot'])/'DEPENDENCY_PREIMAGE.json'
    with raw.open('x') as stream:
        json.dump(result, stream, indent=2)
        stream.write('\n')
    lock = (source/'package-lock.json').read_bytes()
    assert lock == (Path(act['sourceWorktree'])/'build_tenants/abiogenesis/typescript/package-lock.json').read_bytes()
    compact = {'kind': 'operator_read_only_dependency_input', 'path': str(source/'node_modules'),
               'inventorySha256': result['sha256'], 'filesAndLinks': len(result['rows']), 'bytes': result['bytes'],
               'lockSha256': hashlib.sha256(lock).hexdigest(), 'rawInventory': str(raw),
               'use': 'Verify before/after copying to an external proof mirror. No writes to this source dependency tree. No install/network.'}
    with (here/'DEPENDENCY_INPUTS.json').open('x') as stream:
        json.dump(compact, stream, indent=2)
        stream.write('\n')
    print(json.dumps(compact))


if __name__ == '__main__':
    main()
