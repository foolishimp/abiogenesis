import hashlib
import json
import os
import stat
import subprocess
import time
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

root = Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE')
output = root / 'rc1-provider-path-01'
exe = Path('/Users/jim/.local/share/claude/versions/2.1.280')


def url_metadata(value):
    try:
        parsed = urllib.parse.urlsplit(value)
        return {'scheme': parsed.scheme, 'host': parsed.hostname, 'port': parsed.port,
                'userinfoPresent': parsed.username is not None,
                'pathPresent': parsed.path not in ('', '/'), 'queryPresent': bool(parsed.query)}
    except Exception:
        return {'malformedUrl': True}


endpoint_keys = ['ANTHROPIC_BASE_URL', 'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY',
                 'http_proxy', 'https_proxy', 'all_proxy']
auth_keys = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'CLAUDE_CODE_OAUTH_TOKEN',
             'CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR', 'AWS_ACCESS_KEY_ID',
             'GOOGLE_APPLICATION_CREDENTIALS']
switch_keys = ['CLAUDE_CODE_USE_BEDROCK', 'CLAUDE_CODE_USE_VERTEX', 'CLAUDE_CODE_USE_FOUNDRY']
pins = []
for relative in ['rc1-sunny-day-steel-thread-01/provider-request.txt',
                 'final-f11-native-assessment-01/freeze.json',
                 'final-f11-bound-assessment-01/freeze.json',
                 'final-f11-native-assessment-execution-01/freeze.json',
                 'final-f11-native-assessment-execution-01/final-handoff.json']:
    path = root / relative
    content = path.read_bytes()
    pins.append({'path': str(path), 'bytes': len(content), 'sha256': hashlib.sha256(content).hexdigest()})

info = exe.stat()
meta = {
    'observedAt': datetime.now(timezone.utc).isoformat(),
    'subjectPins': pins,
    'executable': {'path': str(exe), 'bytes': info.st_size,
                   'mode': oct(stat.S_IMODE(info.st_mode)), 'executable': os.access(exe, os.X_OK)},
    'currentCwd': str(Path.cwd()),
    'inheritedEndpointEnvironment': {key: url_metadata(os.environ[key]) for key in endpoint_keys if key in os.environ},
    'authEnvironmentPresence': {key: bool(os.environ.get(key)) for key in auth_keys},
    'providerSwitchEnvironment': {key: os.environ[key] for key in switch_keys if key in os.environ},
    'claudeConfigDirPresent': bool(os.environ.get('CLAUDE_CONFIG_DIR')),
    'noProxyPresent': bool(os.environ.get('NO_PROXY') or os.environ.get('no_proxy')),
    'settings': [],
}
paths = [Path('/Users/jim/.claude/settings.json'), Path('/Users/jim/.claude/settings.local.json'),
         Path('/Library/Application Support/ClaudeCode/managed-settings.json'),
         Path('/Users/jim/src/apps/abiogenesis/.claude/settings.json'),
         Path('/Users/jim/src/apps/abiogenesis/.claude/settings.local.json'),
         root / 'final-native-setup-03/.claude/settings.json',
         root / 'final-native-setup-03/.claude/settings.local.json']
if os.environ.get('CLAUDE_CONFIG_DIR'):
    paths += [Path(os.environ['CLAUDE_CONFIG_DIR']) / 'settings.json',
              Path(os.environ['CLAUDE_CONFIG_DIR']) / 'settings.local.json']
for path in dict.fromkeys(paths):
    setting = {'path': str(path), 'exists': path.exists()}
    if path.exists():
        try:
            content = path.read_bytes()
            value = json.loads(content)
            setting['bytes'] = len(content)
            setting['sha256'] = hashlib.sha256(content).hexdigest()
            setting['topLevelKeyNames'] = sorted(value) if isinstance(value, dict) else []
            env = value.get('env', {}) if isinstance(value, dict) else {}
            if isinstance(env, dict):
                setting['endpointEnvironment'] = {key: url_metadata(env[key]) for key in endpoint_keys if isinstance(env.get(key), str)}
                setting['authEnvironmentPresence'] = {key: bool(env.get(key)) for key in auth_keys}
                setting['providerSwitchEnvironment'] = {key: env[key] for key in switch_keys if key in env}
        except Exception as error:
            setting['readErrorType'] = type(error).__name__
    meta['settings'].append(setting)
meta['authFilePresence'] = {str(path): path.exists() for path in
                           [Path('/Users/jim/.claude/.credentials.json'), Path('/Users/jim/.claude.json')]}
digest = hashlib.sha256()
markers = {host: False for host in ['api.anthropic.com', 'console.anthropic.com']}
previous = b''
with exe.open('rb') as stream:
    while part := stream.read(1024 * 1024):
        digest.update(part)
        data = previous + part
        for host in markers:
            markers[host] = markers[host] or host.encode() in data
        previous = part[-64:]
meta['executable']['sha256'] = digest.hexdigest()
meta['binaryPublicEndpointMarkers'] = markers
(output / 'context-metadata.json').write_text(json.dumps(meta, indent=2) + '\n')
print(json.dumps(meta, indent=2))

start = time.monotonic()
command = [str(exe), '--version']
version = {'command': command, 'cwd': str(Path.cwd()), 'timeoutSeconds': 10,
           'observedAt': datetime.now(timezone.utc).isoformat(), 'modelDispatch': False}
try:
    completed = subprocess.run(command, cwd=Path.cwd(), capture_output=True, text=True, timeout=10)
    version.update({'exitCode': completed.returncode, 'stdout': completed.stdout, 'stderr': completed.stderr})
except subprocess.TimeoutExpired as error:
    version.update({'timedOut': True, 'stdout': (error.stdout or b'').decode(errors='replace') if isinstance(error.stdout, bytes) else error.stdout,
                    'stderr': (error.stderr or b'').decode(errors='replace') if isinstance(error.stderr, bytes) else error.stderr})
version['elapsedMs'] = round((time.monotonic() - start) * 1000, 3)
(output / 'version-probe.json').write_text(json.dumps(version, indent=2) + '\n')
print(json.dumps(version, indent=2))
