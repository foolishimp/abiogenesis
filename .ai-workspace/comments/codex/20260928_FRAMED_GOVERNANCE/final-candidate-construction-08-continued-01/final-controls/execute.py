from pathlib import Path
import hashlib, json, os, signal, subprocess, sys, time, resource
D = Path(__file__).resolve().parent.parent
T = D / 'final-stage/build_tenants/abiogenesis/typescript'
F = D / 'final-source'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
read = lambda p: json.loads(p.read_text())

def save(name, value):
    with (D / name).open('x') as f:
        json.dump(value, f, indent=2); f.write('\n')

operation_basis_path = D / 'controls/operation-basis.json'
assert sha(operation_basis_path) == '55ddf5217581fc7a8fcee8ff171e315df9e62885d25c9deeab7a364bdfdde558'
operation_basis = read(operation_basis_path)
assert operation_basis['effectTerritory'] == str(D)
assert read(D / 'activation.json')['activation'] == operation_basis['operation']
assert read(D / 'activation.json')['actor'] == operation_basis['actor']
assert read(D / 'construction-execution-grant.json')['activation'] == operation_basis['operation']
assert read(D / 'construction-execution-grant.json')['actor'] == operation_basis['actor']
def check_inputs():
    staged_derived = []
    staged_law = (D / 'final-authority-stage.json').exists() and read(D / 'final-authority-stage.json')['exitCode'] == 0
    for row in read(D / 'final-source-members.json'):
        p = F / row['path']; assert p.stat().st_size == row['bytes'] and sha(p) == row['sha256'], str(p)
        p = D / 'final-stage' / row['path']
        rel = Path(row['path'])
        if staged_law and str(rel).startswith('build_tenants/abiogenesis/typescript/contracts/qualification/'):
            staged_derived.append(row['path']); continue
        assert p.is_file() and not p.is_symlink() and sha(p) == row['sha256'], str(p)
    for row in read(D / 'final-law-verification.json')['members']:
        p = D / row['path']; assert p.stat().st_size == row['bytes'] and sha(p) == row['sha256']
    return staged_derived

check_inputs()
label = sys.argv[1]
tools = D / 'source-freeze/toolchain/bin'
node, npm = str(tools / 'node'), str(tools / 'npm')
if label == 'dependencies': command, cwd = [npm, 'ci', '--offline', '--ignore-scripts', '--no-audit', '--no-fund'], T
elif label == 'clean': command, cwd = [node, 'scripts/clean.mjs'], T
elif label == 'compile': command, cwd = [node, 'node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], T
elif label == 'authority-stage': command, cwd = [node, 'scripts/generate-qualification-rule-catalog.mjs', '--stage-authorities', str(F), '/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.2'], T
elif label == 'manifest': command, cwd = [node, 'scripts/generate-product-manifest.mjs'], T
elif label == 'pack': command, cwd = [npm, 'pack', '--ignore-scripts', '--json', '--pack-destination', str(D / 'final-artifacts')], T
elif label == 'install':
    rows = read(D / 'final-pack.stdout'); assert len(rows) == 1
    archive = D / 'final-artifacts' / rows[0]['filename']; assert archive.is_file()
    command, cwd = [npm, 'install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', str(archive)], D / 'final-install'
elif label == 'verify': command, cwd = [node, str(D / 'final-controls/verify-installed.mjs')], D
elif label == 'installed-publications': command, cwd = [node, str(D / 'final-controls/validate-installed-publications.mjs')], D
elif label == 'wrapper-compatibility': command, cwd = [node, str(D / 'final-controls/compare-wrapper.mjs')], D
else: raise ValueError(label)
budgets = read(D / 'final-budgets.json'); cap = budgets['operationCapsMs'][label]
prior = read(D / 'final-preparation-result.json')['elapsedMs']
for operation in budgets['operationCapsMs']:
    p = D / ('final-' + operation + '.json')
    if p.exists(): prior += read(p)['elapsedMs']
assert prior + cap + budgets['terminationGraceMs'] <= budgets['maximumMs']
name = 'final-' + label
assert not (D / (name + '.json')).exists() and not (D / (name + '.started.json')).exists(), 'one selected operation'
env = {**os.environ, 'PATH': str(tools)+':/usr/bin:/bin:/usr/sbin:/sbin', 'TMPDIR': str(D / 'final-tmp'),
       'npm_config_cache': str(D / 'final-npm-cache'), 'npm_config_userconfig': str(D / 'final-npmrc'),
       'npm_config_globalconfig': str(D / 'final-globalnpmrc'), 'npm_config_prefix': str(D / 'final-npm-prefix'),
       'npm_config_offline': 'true', 'npm_config_audit': 'false', 'npm_config_fund': 'false',
       'npm_config_update_notifier': 'false', 'GIT_OPTIONAL_LOCKS': '0'}
for key in ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS']: env.pop(key,None)
record = {'activation': operation_basis['operation'], 'command': command, 'cwd': str(cwd),
          'effectTerritory': str(D), 'environment': {k: env[k] for k in ['PATH','TMPDIR','npm_config_cache','npm_config_userconfig','npm_config_globalconfig','npm_config_prefix','npm_config_offline','GIT_OPTIONAL_LOCKS']},
          'HOMEUnchanged': env.get('HOME') == os.environ.get('HOME'), 'capMs': cap, 'priorExecutionMs': prior,
          'maximumMs': budgets['maximumMs'], 'scriptsDisabled': label in ['dependencies','pack','install'], 'defaultHeapUnchanged': True}
save(name+'.started.json', record); start=time.monotonic(); timedout=False
with (D / (name+'.stdout')).open('x') as out, (D / (name+'.stderr')).open('x') as err:
    p = subprocess.Popen(command, cwd=cwd, env=env, stdout=out, stderr=err, start_new_session=True)
    save(name+'.process-start.json', {'pid': p.pid, 'ownedProcessGroup': p.pid, 'streamsOpenedBeforeSpawn': True})
    def collect(deadline):
        while True:
            child, status, usage = os.wait4(p.pid, os.WNOHANG)
            if child: return status, usage
            if time.monotonic() >= deadline: return None
            time.sleep(0.025)
    result = collect(start + cap/1000)
    if result is None:
        timedout = True
        try: os.killpg(p.pid, signal.SIGTERM)
        except ProcessLookupError: pass
        result = collect(time.monotonic() + budgets['terminationGraceMs']/1000)
        if result is None:
            try: os.killpg(p.pid, signal.SIGKILL)
            except ProcessLookupError: pass
            child, status, usage = os.wait4(p.pid, 0)
            result = (status, usage)
    status, usage = result
    code = os.waitstatus_to_exitcode(status); p.returncode = code
record.update(pid=p.pid, exitCode=code if code>=0 else None, signal=signal.Signals(-code).name if code<0 else None,
              timedOut=timedout, ownedExitObserved=True, elapsedMs=(time.monotonic()-start)*1000,
              stdoutSHA256=sha(D/(name+'.stdout')), stderrSHA256=sha(D/(name+'.stderr')))
record.update(wait4OwnedPID=p.pid, wait4Status=status, wait4Reaped=True)
record.update(childUserCPUSeconds=usage.ru_utime,childSystemCPUSeconds=usage.ru_stime,childMaxResidentSetSizePlatformBytes=usage.ru_maxrss)
save(name+'.json', record)
print(json.dumps({k:record[k] for k in ['pid','exitCode','signal','timedOut','elapsedMs']}), flush=True)
if code or timedout: raise SystemExit(1)
derived = check_inputs()
if label == 'authority-stage':
    save('final-staged-derived-input-paths.json', {'derivedAuthorityInputPreimages': derived,
         'preservation': 'final-source inputs retain original C02 bytes; final-stage authority copies are derived from exact new source and verified RC2'})
