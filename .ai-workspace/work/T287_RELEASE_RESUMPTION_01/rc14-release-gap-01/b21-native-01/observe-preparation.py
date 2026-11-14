#!/usr/bin/env python3
"""One-shot Operator observer falsifiers; no Product imports or filesystem effects beyond receipts."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ACT = json.loads((HERE / 'ACTIVATION.json').read_text())
OUT = Path(ACT['rawRoot']) / 'topology-preparation'


def emit(name, value):
    with (OUT / name).open('x') as stream:
        json.dump(value, stream, indent=2, sort_keys=True)
        stream.write('\n')


def observation(name, layout, expected):
    done = subprocess.run(['/usr/bin/python3', str(HERE / 'physical-topology.py'), '-'],
                          input=json.dumps(layout).encode(), capture_output=True, timeout=60)
    with (OUT / (name + '.stdout.json')).open('xb') as stream:
        stream.write(done.stdout)
    with (OUT / (name + '.stderr.raw')).open('xb') as stream:
        stream.write(done.stderr)
    value = json.loads(done.stdout)
    row = {'name': name, 'expected': expected, 'actual': value['disposition'],
           'exitCode': done.returncode, 'sha256': hashlib.sha256(done.stdout).hexdigest(),
           'bytes': len(done.stdout), 'elapsedMs': value['elapsedMs']}
    assert value['disposition'] == expected and done.returncode == {'separated': 0, 'overlap': 1, 'indeterminate': 2}[expected], row
    return row, value


def main():
    layout = json.loads((HERE / 'LAYOUT.json').read_text())
    rows = []
    bridge = copy.deepcopy(layout)
    bridge['protectedRoots'] = ['/System/Volumes/Data']
    rows.append(observation('real-data-bridge', bridge, 'overlap')[0])
    absent = copy.deepcopy(layout)
    absent_path = layout['worksite'] + '/b21-observer-absent-suffix-must-stay-absent'
    assert not Path(absent_path).exists()
    absent['writePaths'] = [absent_path + '/child']
    absent['protectedRoots'] = ['/System/Volumes/Data' + absent_path]
    row, value = observation('real-absent-alias', absent, 'overlap')
    assert any(r['left'] == absent['writePaths'][0] and r['right'] == absent['protectedRoots'][0] and r['disposition'] == 'overlap' for r in value['relations'])
    rows.append(row)
    siblings = copy.deepcopy(layout)
    siblings['protectedRoots'] = ['/Users/jim/src/apps/abiogenesis']
    row, value = observation('real-lawful-siblings', siblings, 'separated')
    rows.append(row)
    spec = importlib.util.spec_from_file_location('operator_topology', HERE / 'physical-topology.py')
    mod = importlib.util.module_from_spec(spec)
    # Avoid Python import caches anywhere in source.
    sys.dont_write_bytecode = True
    spec.loader.exec_module(mod)
    by_path = {a['path']: a for a in value['anchors']}
    left, right = by_path[siblings['worksite']], by_path[siblings['protectedRoots'][0]]
    synthetic = {'mount': {'mountedOn': siblings['worksite'] + '/controlled-unhandled-mount'},
                 'parent': siblings['worksite'], 'backingLocation': left['backingPath'] + '/controlled-unhandled-mount'}
    disposition, reason = mod.assess_pair(left, right, value['mounts'], value['attachments'] + [synthetic])
    assert disposition == 'indeterminate'
    rows.append({'name': 'controlled-relevant-attachment', 'kind': 'pure injected observation, no actual mount', 'actual': disposition, 'reason': reason})
    duplicate = copy.deepcopy(left['descriptorMount'])
    duplicate['mountedOn'] = '/controlled-duplicate-mount-instance'
    disposition, reason = mod.assess_pair(left, right, value['mounts'] + [duplicate], value['attachments'])
    assert disposition == 'indeterminate'
    rows.append({'name': 'controlled-duplicate-membership', 'kind': 'pure injected observation, no actual mount', 'actual': disposition, 'reason': reason})
    result = {'kind': 'operator_preparation_falsifiers', 'productTestsRun': 0, 'providerCalls': 0,
              'observerSha256': hashlib.sha256((HERE / 'physical-topology.py').read_bytes()).hexdigest(),
              'cases': rows, 'atomicMountLockClaim': False, 'qualified': False}
    emit('FALSIFIERS.json', result)
    print(json.dumps(result))


if __name__ == '__main__':
    main()
