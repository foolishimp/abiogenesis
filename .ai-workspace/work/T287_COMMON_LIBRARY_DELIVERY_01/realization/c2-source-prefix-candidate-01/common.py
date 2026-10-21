from pathlib import Path
import hashlib, json, os, stat

ROOT = Path('/Users/jim/src/apps/abiogenesis')
WORK = Path(__file__).resolve().parent
DELIVERY = WORK.parent.parent
TENANT = Path('build_tenants/abiogenesis/typescript')

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def row(path, relative):
    result = {'path': str(relative), 'mode': oct(stat.S_IMODE(path.lstat().st_mode))}
    if path.is_symlink():
        result.update(kind='symlink', target=os.readlink(path))
    else:
        data = path.read_bytes()
        result.update(kind='file', bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
    return result

def inventory(base):
    return [row(path, path.relative_to(base)) for path in sorted(base.rglob('*')) if path.is_file() or path.is_symlink()]

def verify(path, expected):
    actual = row(path, expected['path'])
    for key in ['sha256', 'bytes', 'mode', 'target']:
        if key in expected:
            assert actual.get(key) == expected[key], (str(path), key, expected[key], actual.get(key))
    if 'link' in expected:
        assert actual.get('target') == expected['link'], str(path)
    return actual

def write(name, value):
    path = WORK / name
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as stream:
        json.dump(value, stream, indent=2)
        stream.write('\n')
