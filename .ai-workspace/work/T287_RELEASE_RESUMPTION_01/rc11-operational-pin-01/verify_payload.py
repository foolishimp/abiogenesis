import datetime, hashlib, json, os, signal, stat, subprocess, tarfile, time
from pathlib import Path, PurePosixPath

R = Path('/Users/jim/src/apps/abiogenesis')
W = R / '.ai-workspace/work/T287_RELEASE_RESUMPTION_01'
N = W / 'rc11-operational-pin-01'
F = Path('/private/tmp/abg-rc11-foundation-20261110-01')
C11 = Path('/private/tmp/abg-rc11-qualification-20261109')
S = Path('/Users/jim/Library/Application Support/STDO/releases/v3.0.4')
A = Path('/Users/jim/Library/Application Support/ABIogenesis')
release = A / 'releases/5.0.0-rc.11'
installed = A / 'installs/5.0.0-rc.11/node_modules/@abiogenesis/typescript-tenant'
archive = release / 'abiogenesis-typescript-tenant-5.0.0-rc.11.tgz'
env = {**os.environ, 'GIT_OPTIONAL_LOCKS': '0', 'PYTHONDONTWRITEBYTECODE': '1'}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def pin(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': sha(data)}

def check_pin(expected):
    assert pin(expected['path']) == expected, expected['path']

def git(root, *args):
    return subprocess.check_output(['git', '-c', 'core.fsmonitor=false', *args], cwd=root, env=env, timeout=10).decode().strip()

def git_observation(root):
    index = Path(git(root, 'rev-parse', '--git-path', 'index'))
    if not index.is_absolute():
        index = root / index
    return {'root': str(root), 'head': git(root, 'rev-parse', 'HEAD'), 'tree': git(root, 'rev-parse', 'HEAD^{tree}'), 'index': pin(index), 'stagedPaths': git(root, 'diff', '--cached', '--name-only').splitlines(), 'trackedStatus': git(root, 'status', '--porcelain=v1', '--untracked-files=no').splitlines()}

def write_once(name, value):
    with (N / name).open('x') as out:
        json.dump(value, out, indent=2)
        out.write('\n')

def verify():
    started = time.monotonic()
    expected_tracking = [
        {'path': str(R / 'specification/GOALS.md'), 'bytes': 197474, 'sha256': 'be5ce1f10610921f684479f3365b05ff027deea9e8198ba1a50275eda0d6a7e7'},
        {'path': str(R / '.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'), 'bytes': 849109, 'sha256': 'dae25367bc204a6c150ef85546ed0218213676aa7daece0a2b14f35d56876b43'}]
    for item in expected_tracking:
        check_pin(item)
    basis = json.loads((R / 'stdo_abiogenesis.json').read_text())
    assert pin(R / 'stdo_abiogenesis.json')['sha256'] == 'b5720642ff00ebcb47f77ae68df3a960ab70f82cd1227c0712edda9d40745f44'
    assert basis['product']['definition_id'] == 'urn:stdo:product-definition:abiogenesis' and basis['composition'] == []
    assert basis['constitution']['stdo']['basis']['uri'] == 'stdo://releases/v3.0.4/'
    assert pin(S / 'manifest.json')['sha256'] == basis['constitution']['stdo']['basis']['manifest_sha256'] == '102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b'
    assert pin(R / 'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md')['sha256'] == '2c2a3295928b4a40cd423623145c029b08f0f79576a086df7506f002627a1f10'
    manifest = json.loads((S / 'manifest.json').read_text())
    selected_method_members = []
    for group, names in [(manifest['standards'], ['frames/bootstrap.md', 'ACTIVATION.md', 'FOUNDATIONS.md', 'EXECUTIVE_BASELINE.md']), (manifest['auxiliary']['plugin'], ['skills/stdo-work/SKILL.md', 'references/PRODUCT_BASIS.md', 'references/COORDINATED_HANDOFF.md'])]:
        entries = {x['path']: x for x in group['members']}
        for name in names:
            item = pin(S / group['installed_root'] / name)
            assert item['sha256'] == entries[name]['sha256'], name
            selected_method_members.append(item)
    before_git = [git_observation(p) for p in [R, F, C11]]
    assert before_git[0]['head'] == 'df7e5f80f5bbe3916bb97e3843c570f619de06ad'
    assert sorted(x.strip() for x in before_git[0]['trackedStatus']) == sorted(['M specification/GOALS.md', 'M .ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'])
    assert before_git[1]['head'] == 'b7cf409fc74eca639525fccbea52e666be7743d4' and before_git[1]['trackedStatus'] == []
    assert before_git[2]['head'] == 'e2ba05da572f4a7e68d0629ecc83b9153a15e7c4'
    assert before_git[2]['tree'] == '1aabb06494de37a644b645161c6491d5b005cc73'
    assert all(x['stagedPaths'] == [] for x in before_git)
    subprocess.run(['git', 'merge-base', '--is-ancestor', before_git[2]['head'], before_git[1]['head']], cwd=F, env=env, check=True, timeout=10)
    old_pin = pin(W / 'rc10-operational-pin-01/BUILDER_PIN.json')
    assert old_pin['bytes'] == 7591 and old_pin['sha256'] == '05a9280f375c23b2e21e85f6834488bf6cc9d3dad8ff7ebbd383bb5a2b40f5f0'
    disposition_path = W / 'rc11-qualification-01/ROOT_FINAL_DISPOSITION.json'
    disposition = json.loads(disposition_path.read_text())
    final_install_pin = disposition['evidence']['installationVerification']
    check_pin(final_install_pin)
    final_install = json.loads(Path(final_install_pin['path']).read_text())
    protected = [old_pin, pin(disposition_path), final_install_pin]
    for item in final_install['checksums']:
        check_pin(item)
        protected.append(item)
    for key in ['packagingReview', 'reproduction', 'installationReturn', 'postguards']:
        item = disposition['evidence'][key]
        check_pin(item)
        protected.append(item)
    for name in ['ROOT_FINAL_ACCEPTANCE.json', 'CHECKPOINT_RETURN.json']:
        protected.append(pin(W / 'rc11-effect-phase2-01/native-b02/proof-01' / name))
    expected_archive = {'path': str(archive), 'bytes': 11045484, 'sha256': 'f0f5717edd50db30599683e8a6077ba4ac41461208b1a6f334419a014b223455'}
    check_pin(expected_archive)
    assert not installed.is_symlink() and installed.is_dir()
    rows = []
    names = set()
    with tarfile.open(archive, 'r:gz') as tar:
        for member in tar:
            parts = member.name.split('/')
            assert member.isfile() and not member.issym() and not member.islnk(), ('nonregular', member.name)
            assert len(parts) > 1 and parts[0] == 'package' and all(x not in ['', '.', '..'] for x in parts), ('unsafe', member.name)
            assert not member.name.startswith('/') and '\\' not in member.name and '\0' not in member.name, ('unsafe', member.name)
            rel = '/'.join(parts[1:])
            assert str(PurePosixPath(rel)) == rel and rel not in names, ('duplicate_or_noncanonical', rel)
            names.add(rel)
            path = installed / rel
            st = path.lstat()
            assert stat.S_ISREG(st.st_mode) and st.st_nlink == 1, ('installed_nonregular_or_link', rel)
            for parent in path.parents:
                if parent == installed:
                    break
                assert not parent.is_symlink(), ('linked_parent', str(parent))
            archived = tar.extractfile(member).read()
            actual = path.read_bytes()
            assert len(archived) == member.size and actual == archived, ('payload_mismatch', rel)
            rows.append({'path': rel, 'bytes': len(archived), 'sha256': sha(archived)})
    observed = set()
    for directory, dirs, files in os.walk(installed, followlinks=False):
        for name in dirs:
            assert stat.S_ISDIR((Path(directory) / name).lstat().st_mode), ('linked_or_nonregular_directory', directory, name)
        for name in files:
            path = Path(directory) / name
            st = path.lstat()
            assert stat.S_ISREG(st.st_mode) and st.st_nlink == 1, ('installed_nonregular_or_link', str(path))
            observed.add(path.relative_to(installed).as_posix())
    assert observed == names, {'missing': sorted(names - observed), 'extra': sorted(observed - names)}
    assert len(rows) == 5327
    rows.sort(key=lambda row: row['path'])
    verification = json.loads((release / 'verification.json').read_text())
    installation = json.loads((release / 'installation.json').read_text())
    lock = json.loads((release / 'resolved-lock.json').read_text())
    product_manifest = json.loads((installed / 'product-toolchain-manifest.json').read_text())
    package = json.loads((installed / 'package.json').read_text())
    assert package['name'] == '@abiogenesis/typescript-tenant' and package['version'] == '5.0.0-rc.11'
    assert verification['disposition'] == 'verified' and installation['disposition'] == 'materialized'
    for obj in [verification, installation, product_manifest]:
        assert obj['productContentDigest'] == 'sha256:ed3cc99b0dc268b2d7eb2cc8da29dcc68127c996e8f805957d74f23d9fcf2381'
        assert obj['productId'] == 'product://abiogenesis/typescript-tenant@5.0.0-rc.11'
    for obj in [verification, installation]:
        assert obj['manifestDigest'] == 'sha256:feafd6a00103a8e11db2d46b5777eeb5e62382c877aab65b3ada93fcf5afa706'
        assert obj['artifactDigest'] == 'sha256:' + expected_archive['sha256']
    assert installation['resolvedLockDigest'] == lock['lockDigest']
    assert installation['installedRoot'] == str(installed) and installation['installId'] == disposition['subject']['installId']
    for item in protected + expected_tracking:
        check_pin(item)
    after_git = [git_observation(p) for p in [R, F, C11]]
    assert after_git == before_git
    return {'status': 'SATISFIED_EXACT_IDENTITY_ONLY', 'observedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'wallMs': (time.monotonic() - started) * 1000, 'archive': expected_archive, 'installedRoot': str(installed), 'members': len(rows), 'payloadBytes': sum(x['bytes'] for x in rows), 'memberInventorySha256': sha(json.dumps(rows, separators=(',', ':'), ensure_ascii=False).encode()), 'inventoryEncoding': 'UTF-8 JSON compact rows ordered by canonical POSIX relative path, each object keys path,bytes,sha256; raw byte SHA-256, not Product semantic digest.', 'mismatches': [], 'extraFiles': [], 'missingFiles': [], 'duplicateUnsafeNonregularOrLinkedMembers': [], 'rawPackage': pin(installed / 'package.json'), 'rawManifest': pin(installed / 'product-toolchain-manifest.json'), 'retainedSemanticIdentity': {key: verification[key] for key in ['productId', 'productContentDigest', 'manifestDigest', 'contributionManifestDigest', 'verificationRef', 'verificationDigest']}, 'semanticDigestProvenance': 'Retained exact owner receipts, not recomputed by importing/executing Product; fresh whole-payload equality links those original identities to these bytes.', 'retainedOwnerCheckedPayloadFiles': verification['checkedPayloadFiles'], 'retainedOwnerCountIsNotArchiveMemberCount': True, 'installId': installation['installId'], 'resolvedLockDigest': lock['lockDigest'], 'protectedReceipts': protected, 'beforeGit': before_git, 'afterGit': after_git, 'trackingPreimages': expected_tracking, 'exactSTDOMembers': selected_method_members, 'sourceRelation': 'Immutable installed RC11 e2ba05da is an ancestor of accepted continuation b7cf409f, whose later foundation/Phase2 edits are not shipped in RC11.', 'ProductExecution': False, 'runtimeAcquired': False, 'actorProviderBuildTestInstallCalls': 0, 'qualified': False, 'published': False}

if __name__ == '__main__':
    signal.signal(signal.SIGALRM, lambda *_: (_ for _ in ()).throw(TimeoutError('60-second read-only verification bound')))
    signal.alarm(60)
    try:
        result = verify()
        write_once('VERIFICATION.json', result)
        print(json.dumps({'verification': pin(N / 'VERIFICATION.json'), 'status': result['status'], 'members': result['members'], 'payloadBytes': result['payloadBytes'], 'inventorySha256': result['memberInventorySha256']}))
    except BaseException as error:
        write_once('FAILURE.json', {'status': 'FALSIFIED_OR_INCOMPLETE_STOPPED', 'class': type(error).__name__, 'message': str(error), 'repr': repr(error), 'noPinOrTrackingWritten': True})
        raise
    finally:
        signal.alarm(0)
