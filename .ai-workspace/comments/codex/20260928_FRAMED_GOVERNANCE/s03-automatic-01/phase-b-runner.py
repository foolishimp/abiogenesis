import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tarfile
import time

repo = Path('/Users/jim/src/apps/abiogenesis')
proof = repo / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s03-automatic-01'
controls = proof.parent / 's03-automatic-phase-b-controls-01'
env = {**os.environ, 'GIT_OPTIONAL_LOCKS': '0', 'PYTHONDONTWRITEBYTECODE': '1'}
def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(data):
    return hashlib.sha256(data).hexdigest()
def identity(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': digest(data)}
def save(name, value):
    with (proof / name).open('x') as output:
        output.write(json.dumps(value, indent=2) + '\n')
def verify_frozen():
    freeze = proof / 'phase-a-freeze.json'
    assert identity(freeze)['sha256'] == 'f78255b3cbcfdb6f34751d2195886ffef9c0ad9f596d17bacec90fe7b5f4e2ae'
    rows = json.loads(freeze.read_text())['records']
    for row in rows:
        actual = identity(repo / row['path'])
        assert actual['bytes'] == row['bytes'] and actual['sha256'] == row['sha256'], row['path']
    return rows

assert not (proof / 'phase-b-activation.json').exists(), 'Never rerun this launch'
assert not (proof / 'disposable').exists()
assert not (proof / 'phase-b-npm-cache').exists()
frozen = verify_frozen()
request = identity(controls / 'request.txt')
assert request['bytes'] == 8427 and request['sha256'] == '8a08bb97bc2d94cd7f9f5a7d57f3ca4406b193115638d8806c6fefe33cddc9f4'
joined = subprocess.run(['python3', str(repo / '.genesis/development-products/axiom-indexer/build_tenants/core/code/ac.py'), 'join', '--input', '/dev/stdin'], input=(controls / 'request-sections.json').read_bytes(), capture_output=True, check=True, cwd=repo, env=env)
assert joined.stdout == (controls / 'request.txt').read_bytes()
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, env=env, text=True).strip()
assert head == '55a8a452141caf180ea6cee6365d2a1bfb9da34e'
git_before = subprocess.check_output(['git', 'status', '--porcelain=v1'], cwd=repo, env=env, text=True)
prior = json.loads((proof.parent / 's7-pending-consumer-01/selected-action-09/same-basis/environment.json').read_text())
archive = identity(prior['artifactPaths'][0])
assert archive['sha256'] == 'c061fca61bc180e45b717527dc45f44dbeedcff69d67916d3801b85edb0c8c23'
assert prior['verified']['productContentDigest'] == 'sha256:6bb4ff556cd1368da8abca5a436b69a44370a39ae734043d8f699d202c5fbb9c'
core_members = []
with tarfile.open(archive['path']) as packed:
    for member in packed:
        if not member.isfile():
            continue
        relative = str(Path(member.name).relative_to('package'))
        data = packed.extractfile(member).read()
        installed = identity(Path(prior['installedRoot']) / relative)
        assert installed['bytes'] == len(data) and installed['sha256'] == digest(data), relative
        core_members.append({'path': relative, 'bytes': len(data), 'sha256': digest(data)})
readonly_paths = [proof / name for name in sorted(os.listdir(proof)) if (proof / name).is_file() and name != 'phase-b-runner.py']
readonly_paths += [controls / 'request.txt', controls / 'request-sections.json', repo / 'build_tenants/abiogenesis/typescript/test_env/support/root-installed-environment.mjs', repo / 'build_tenants/abiogenesis/typescript/test_env/support/registered-graph-selection.mjs']
readonly = [identity(path) for path in readonly_paths]
activation = {'status': 'active', 'role': 'Worker', 'activation': 'T287_S03_AUTOMATIC_COMPOSITION_01_PHASE_B', 'at': now(), 'reentry': 'realization_refactor', 'head': head, 'request': request, 'a_c_join_verified': True, 'frame': 'stdo://releases/v2.5.1-rc.1/standards/STDO_REFERENCE_FRAME_BASELINE.md#derived-worker-frame', 'local_frame': 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration', 'write_territory': str(proof), 'grant': 'New Phase B evidence, fixture staging/package, cache and one disposable native population only; frozen source and predecessor records read-only; one positive then one no-action, first failure stops dependent effects and retries.', 'preimages': {'disposable': 'absent', 'phase-b-npm-cache': 'absent', 'phase-b-runner.py': 'absent before authoring', 'phase-b-activation.json': 'absent'}, 'frozen_records_verified': len(frozen), 'readonly': readonly, 'core_archive': archive, 'core_product': prior['verified']['productContentDigest'], 'core_archive_install_correspondence': {'status': 'satisfied', 'members': len(core_members)}, 'method': {'basis': 'stdo://releases/v2.5.1-rc.1/', 'manifest_sha256': '5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64', 'retained_companion_verification': '.ai-workspace/comments/codex/20260921_STDO_251_RC1_ADOPTION/consumer-verification.json', 'root_reuse_disposition': 'Current STDO status plus exact request join and retained verification suffice at this boundary; no broad requalification.'}, 'git_status_before': git_before, 'no_provider_calls': True, 'independent_review': 'Root only; no Worker activation'}
save('phase-b-activation.json', activation)
save('phase-b-core-inventory.json', {'installed_root': prior['installedRoot'], 'archive': archive, 'records': core_members})
method = subprocess.run(['stdo', 'verify', 'v2.5.1-rc.1', '--manifest-sha256', activation['method']['manifest_sha256']], cwd=repo, env=env, capture_output=True, text=True)
assert method.returncode == 0, method.stderr
save('phase-b-method-verification.json', json.loads(method.stdout))
command = ['node', '--test', '--test-name-pattern=S03 Phase B ordinary installed', 'build_tenants/abiogenesis/typescript/test_env/tests/t287-s03-automatic.test.mjs']
selection = {'TMPDIR': str(proof / 'disposable'), 'npm_config_cache': str(proof / 'phase-b-npm-cache'), 'ABI5_S03_EVIDENCE_ROOT': str(proof), 'ABI5_S03_PHASE_B_RELEASE': 'ROOT_RELEASED_PHASE_B', 'GIT_OPTIONAL_LOCKS': '0', 'PYTHONDONTWRITEBYTECODE': '1'}
started = now()
timer = time.monotonic()
with (proof / 'phase-b-stdout.log').open('x') as out, (proof / 'phase-b-stderr.log').open('x') as err:
    process = subprocess.Popen(command, cwd=repo, env={**env, **selection}, stdout=out, stderr=err)
    save('phase-b-launch.json', {'started_at': started, 'pid': process.pid, 'cwd': str(repo), 'command': command, 'selected_environment': selection, 'retry_allowed': False})
    print(json.dumps({'milestone': 'launched', 'pid': process.pid, 'at': started}), flush=True)
    result = process.wait()
elapsed = time.monotonic() - timer
preserved = verify_frozen()
changes = [row['path'] for row in readonly if identity(row['path']) != row]
save('phase-b-process-result.json', {'started_at': started, 'finished_at': now(), 'pid': process.pid, 'exit_code': result, 'elapsed_seconds': elapsed, 'frozen_records_preserved': len(preserved), 'readonly_changes': changes, 'git_status_after': subprocess.check_output(['git', 'status', '--porcelain=v1'], cwd=repo, env=env, text=True), 'test_process_state': 'exited and waited', 'stdout': 'phase-b-stdout.log', 'stderr': 'phase-b-stderr.log'})
print(json.dumps({'milestone': 'process_closed', 'exit_code': result, 'elapsed_seconds': elapsed, 'readonly_changes': changes}), flush=True)
