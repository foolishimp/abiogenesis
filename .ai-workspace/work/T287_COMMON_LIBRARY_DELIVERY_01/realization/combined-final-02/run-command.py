from pathlib import Path
import datetime, hashlib, json, os, subprocess, sys, time
from common import ROOT, WORK, TENANT, digest, write

node = '/opt/homebrew/Cellar/node/24.7.0/bin/node'
npm = '/opt/homebrew/bin/npm'
commands = {
    'tsc': [node, 'node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'],
    'generate': [node, 'scripts/generate-product-manifest.mjs'],
    'material': [node, str(WORK / 'verify-metadata.mjs')],
    'pack': [npm, 'pack', '--ignore-scripts', '--json', '--pack-destination', str(WORK / 'artifacts')],
    'payload': [node, str(WORK / 'verify-payload.mjs')],
}
dependencies = {'generate': ['tsc'], 'material': ['generate'], 'pack': ['material'], 'payload': ['pack']}
label = sys.argv[1]
assert label in commands
assert not (WORK / 'first-cause.json').exists(), 'stopped at first failure'
for prior in dependencies.get(label, []):
    assert json.loads((WORK / 'commands' / (prior + '.result.json')).read_text())['exitCode'] == 0
assert digest(Path(node)) == 'fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
assert digest(Path(npm)) == '8e5f6f3429f8cdbe693cdc29904e9d5a7b127a494bd15c804bd54c7403bfcbe7'
assert digest(WORK / 'stage' / TENANT / 'package-lock.json') == 'df8d50ad51f46c58d9a38bcc3dd864de0e43337dc8990886b93ad46ab298ef12'
environment = {'PATH': '/opt/homebrew/Cellar/node/24.7.0/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',
               'HOME': os.environ['HOME'], 'LANG': 'en_AU.UTF-8', 'TMPDIR': str(WORK / 'tmp'),
               'npm_config_offline': 'true', 'npm_config_ignore_scripts': 'true', 'npm_config_audit': 'false',
               'npm_config_fund': 'false', 'npm_config_update_notifier': 'false',
               'npm_config_logs_dir': str(WORK / 'npm-logs'), 'npm_config_cache': str(WORK / 'npm-cache')}
prefix = WORK / 'commands' / label
for suffix in ['.request.json', '.result.json', '.stdout', '.stderr']:
    assert not prefix.with_suffix(suffix).exists(), 'no overwrite or retry'
request = {'label': label, 'argv': commands[label], 'cwd': str(WORK / 'stage' / TENANT), 'environment': environment,
           'grant': 'COMBINED-FINAL-02', 'prebuild_freeze_sha256': digest(WORK / 'prebuild-freeze.json'),
           'runner_sha256': digest(Path(__file__)), 'startedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat()}
if label in ['material', 'payload']:
    request['verification_script_sha256'] = digest(Path(commands[label][1]))
write('commands/' + label + '.request.json', request)
started = time.monotonic()
with prefix.with_suffix('.stdout').open('xb') as out, prefix.with_suffix('.stderr').open('xb') as err:
    result = subprocess.run(commands[label], cwd=request['cwd'], env=environment, stdout=out, stderr=err)
receipt = {'label': label, 'exitCode': result.returncode, 'wallMs': (time.monotonic() - started) * 1000,
           'completedUtc': datetime.datetime.now(datetime.timezone.utc).isoformat()}
for stream in ['stdout', 'stderr']:
    path = prefix.with_suffix('.' + stream)
    receipt[stream] = {'bytes': path.stat().st_size, 'sha256': digest(path)}
write('commands/' + label + '.result.json', receipt)
print(json.dumps(receipt), flush=True)
if result.returncode:
    write('first-cause.json', {'kind': 'first_unexpected_combined_build_failure', 'request': request, 'receipt': receipt,
          'disposition': 'Stopped; no repair, retry, later build or hidden cleanup authorized', 'residue': str(WORK / 'stage')})
    print(prefix.with_suffix('.stdout').read_text(errors='replace')[-10000:])
    print(prefix.with_suffix('.stderr').read_text(errors='replace')[-10000:])
sys.exit(result.returncode)
