from pathlib import Path
import hashlib
import json
import os
import stat

ROOT = Path('/Users/jim/src/apps/abiogenesis')
WORK = ROOT / '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01'
REALIZATION = WORK / 'realization'
OUTPUT = REALIZATION / 'route-obligation-proof-preparation-02'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def file_row(path):
    s = path.lstat()
    assert stat.S_ISREG(s.st_mode), (str(path), 'expected regular file')
    return {'path': str(path.relative_to(ROOT)), 'kind': 'file',
            'sha256': sha(path), 'bytes': s.st_size,
            'mode': oct(stat.S_IMODE(s.st_mode))}

PINS = [
    ('L2-execution-contract.md', '65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'),
    ('proof/L2-report.md', '7beb5ee434076ed1e9e89759f4c237264318fbdb7c479f241a4893e41c337487'),
    ('realization/final-proof-preparation-01/freeze.json', 'e7bf015a4cc2bf9246d2aedd9800a8b0c41aef5255b5b30fdfd78a69627b12aa'),
    ('realization/p5-installed-preparation-01/freeze.json', 'b8859cda37f284ef928360059664b14b4304c131b23e21f453cdc4cf135e92b6'),
    ('realization/hog-ordinary-owner-driver-preparation-01/freeze.json', '12239d043ac3ad63f65f844be2691601b5119ff0a90110bb273ed73a7f9c2243'),
    ('realization/combined-final-02/freeze.json', '245a11505b2c3f372da001fa0f3202d4554fea30d9d593e2fe3b5ede61906fe2'),
    ('realization/combined-final-02/protected-main-generated.json', 'b6273def4c3e1db1dcb5d350db81f65019bc8a07ca189c0ac08cf41655bc1b96'),
    ('realization/route-obligation-proof-preparation-01/freeze-stopped-01.json', '1b199141a606886883536badffa53435719e2e8a7e39ad277468cebe9a313b14'),
    ('realization/route-obligation-proof-preparation-01/first-cause.json', '93e090eca14db67a2876232d04a81937cefd74e2c6eebf42a9dded25cb02ce4d'),
]

def verify_row(base, row, explicit_kind):
    relative = Path(row['path'])
    assert not relative.is_absolute() and '..' not in relative.parts, row['path']
    path = base / relative
    assert 'continuation-17' not in str(path) and '/P0_' not in str(path), str(path)
    kind = row['kind'] if explicit_kind else 'file'
    s = path.lstat()
    mode = oct(stat.S_IMODE(s.st_mode))
    if 'mode' in row:
        assert mode == row['mode'], (str(path), 'mode')
    if kind == 'file':
        assert stat.S_ISREG(s.st_mode), (str(path), 'file kind')
        assert s.st_size == row['bytes'], (str(path), 'bytes')
        assert sha(path) == row['sha256'], (str(path), 'sha256')
        return kind, mode
    assert kind == 'symlink', (str(path), 'unsupported declared kind')
    assert stat.S_ISLNK(s.st_mode), (str(path), 'symlink kind')
    assert os.readlink(path) == row['target'], (str(path), 'link target')
    return kind, mode

def main():
    observed_pins = []
    for path, expected in PINS:
        actual = file_row(WORK / path)
        assert actual['sha256'] == expected, path
        observed_pins.append(actual)
    manifests = [
        ('final-proof-preparation-01/freeze.json', 'records', ROOT, False, 29),
        ('p5-installed-preparation-01/freeze.json', 'files', REALIZATION / 'p5-installed-preparation-01', False, 57),
        ('hog-ordinary-owner-driver-preparation-01/freeze.json', 'records', ROOT, False, 17),
        ('combined-final-02/freeze.json', 'files', ROOT, True, 8640),
        ('route-obligation-proof-preparation-01/freeze-stopped-01.json', 'records', ROOT, False, 8),
        ('combined-final-02/protected-main-generated.json', 'files', ROOT, True, 936),
    ]
    reports = []
    for name, key, base, explicit_kind, expected_count in manifests:
        rows = json.loads((REALIZATION / name).read_text())[key]
        assert len(rows) == expected_count, (name, 'row count')
        assert len({row['path'] for row in rows}) == len(rows), (name, 'duplicate path')
        counts = {'file': 0, 'symlink': 0}
        observed_undeclared_modes = {}
        for row in rows:
            kind, mode = verify_row(base, row, explicit_kind)
            counts[kind] += 1
            if 'mode' not in row:
                observed_undeclared_modes[row['path']] = mode
        reports.append({'manifest': name, 'rowKey': key, 'rowBase': str(base),
                        'records': len(rows), 'kinds': counts, 'mismatches': 0,
                        'observedModesNotPreviouslyDeclared': observed_undeclared_modes})
    p5 = json.loads((REALIZATION / 'p5-installed-preparation-01/freeze.json').read_text())
    source_base = REALIZATION / 'combined-final-02/source'
    owned = []
    for row in p5['ownedOutputs']:
        verify_row(source_base, row, False)
        owned.append({'originalPath': row['path'], 'frozenCopy': file_row(source_base / row['path'])})
    result = {'status': 'satisfied', 'activation': 'ROUTE-TYPED-INVENTORY-02',
              'originalSevenPins': 7, 'additionalStoppedCutPins': 2, 'pins': observed_pins,
              'inventories': reports, 'p5OwnedOutputFrozenCopyRelations': owned,
              'mainGeneratedRecords': 936, 'runtimeImports': 0, 'nativeCalls': 0,
              'correctedPreservationExecutionCount': 1, 'retryCount': 0,
              'limit': 'Declared rows verified; no moving-tree completeness or undeclared prior P5 mode claim.'}
    with (OUTPUT / 'preservation.json').open('x') as stream:
        json.dump(result, stream, indent=2)
        stream.write('\n')
    print(json.dumps({'status': 'satisfied', 'inventories': [(x['manifest'], x['records'], x['kinds']) for x in reports],
                      'ownedFrozenCopies': len(owned), 'main936': 'exact', 'mismatches': 0}))

main()
