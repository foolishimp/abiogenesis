from pathlib import Path, PurePosixPath
import hashlib, json, os, stat, tarfile

work = Path(__file__).resolve().parent
binding = json.loads((work / 'binding.json').read_text())
activation = json.loads((work / 'activation.json').read_text())
assert binding['operation'] == activation['operation']
pack = json.loads((work / 'pack.stdout').read_text())
assert isinstance(pack, list) and len(pack) == 1
record = pack[0]
filename = record['filename']
assert filename == Path(filename).name and filename.endswith('.tgz')
archive = work / 'packs' / filename
assert [p.name for p in (work / 'packs').iterdir()] == [filename]
assert archive.is_file() and not archive.is_symlink()
body = archive.read_bytes()
assert len(body) == record['size']
assert hashlib.sha1(body).hexdigest() == record['shasum']
destination = Path(binding['consumerPackageRoot'])
assert not destination.exists()
destination.mkdir(parents=True)
rows = []
seen = set()
with tarfile.open(archive, 'r:gz') as tar:
    members = tar.getmembers()
    for member in members:
        path = PurePosixPath(member.name)
        assert not path.is_absolute() and path.parts[0] == 'package'
        assert all(part not in ('', '.', '..') for part in path.parts)
        assert member.isdir() or member.isfile(), (member.name, member.type)
        assert member.name not in seen, member.name
        seen.add(member.name)
        relative = Path(*path.parts[1:])
        target = destination / relative
        assert target == destination or destination in target.parents
        if member.isdir():
            target.mkdir(parents=True, exist_ok=True)
            os.chmod(target, member.mode)
            continue
        assert not member.name.startswith('package/code/src/'), 'consumer must be Source-blind'
        target.parent.mkdir(parents=True, exist_ok=True)
        data = tar.extractfile(member).read()
        assert len(data) == member.size
        with target.open('xb') as stream:
            stream.write(data)
        os.chmod(target, member.mode)
        assert target.read_bytes() == data and stat.S_IMODE(target.stat().st_mode) == member.mode
        rows.append({'path': relative.as_posix(), 'bytes': len(data), 'mode': member.mode, 'sha256': hashlib.sha256(data).hexdigest()})
file_rows = record['files']
assert isinstance(file_rows, list)
expected = {row['path']: row['size'] for row in file_rows}
actual = {row['path']: row['bytes'] for row in rows}
assert expected == actual, 'npm file census equals actual archive regular-file members'
tests = []
for name in ['t287-gtl-serialization-publication.test.mjs', 't287-gtl-language-corpus.test.mjs']:
    source = Path(binding['newStage']) / 'test_env/tests' / name
    target = work / 'consumer' / name
    assert not target.exists()
    data = source.read_bytes()
    with target.open('xb') as stream:
        stream.write(data)
    os.chmod(target, stat.S_IMODE(source.stat().st_mode))
    tests.append({'name': name, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)})
result = {'operation': activation['operation'], 'kind': 'EXACT_ARCHIVE_EXTRACTED_SOURCE_BLIND_CONSUMER',
          'archive': {'path': str(archive), 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest(), 'shasum': record['shasum'], 'integrity': record['integrity']},
          'packageRoot': str(destination), 'fileCount': len(rows), 'logicalBytes': sum(row['bytes'] for row in rows),
          'archiveExtractionBodyModeCorrespondence': True, 'noArchiveSymlinksOrSource': True, 'rows': rows, 'testCopies': tests}
with (work / 'extract-result.json').open('x') as stream:
    json.dump(result, stream, indent=2)
    stream.write('\n')
print(json.dumps({key: value for key, value in result.items() if key != 'rows'}))
