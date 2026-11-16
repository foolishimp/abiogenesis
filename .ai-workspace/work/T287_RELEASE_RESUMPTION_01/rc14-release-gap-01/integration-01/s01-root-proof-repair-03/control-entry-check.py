"""Control-only discriminator; never executes the post-guard attempt owner."""
import ast
import json
from pathlib import Path
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
source = (HERE / 'operate.py').read_text()
tree = ast.parse(source)
boundary = next(i for i, node in enumerate(tree.body)
                if isinstance(node, ast.Assign)
                and any(isinstance(t, ast.Name) and t.id == 'started' for t in node.targets))
prefix = compile(ast.Module(body=tree.body[:boundary], type_ignores=[]), str(HERE / 'operate.py'), 'exec')
cases = []

with tempfile.TemporaryDirectory(prefix='s01-control03-mock-') as scratch:
    root = Path(scratch)
    launch = root / 'launch.json'
    activation = json.loads((HERE / 'ACTIVATION.json').read_text())
    launch.write_text(json.dumps({'executionControlRoot': activation['executionControlRoot']}))
    copied = root / 'wrong-copy'
    copied.mkdir()
    (copied / 'operate.py').write_text(source)
    copy_activation = dict(activation, rawRoot=str(root / 'never-created-raw'))
    (copied / 'ACTIVATION.json').write_text(json.dumps(copy_activation))
    # Execute the actual wrong-copy script. Its guard must fail even before
    # trying to read this nonexistent launch input or touching raw state.
    result = subprocess.run([sys.executable, str(copied / 'operate.py'), str(root / 'absent-launch')],
                            capture_output=True, text=True)
    assert result.returncode != 0
    assert 'accepted external executionControlRoot' in result.stderr
    assert not (root / 'never-created-raw').exists()
    cases.append({'name': 'actual_wrong_copy_rejected_before_launch_read_clock_raw_host', 'passed': True})

    previous = sys.argv
    try:
        sys.argv = [str(HERE / 'operate.py'), str(launch)]
        namespace = {'__file__': str(HERE / 'operate.py')}
        exec(prefix, namespace)
        assert namespace['entry_launch']['executionControlRoot'] == str(HERE)
        assert 'started' not in namespace and 'child' not in namespace
        cases.append({'name': 'correct_external_coordinate_reaches_ordinary_checks_boundary', 'passed': True})
        original = namespace['entry_launch_bytes']
        launch.write_text(json.dumps({'executionControlRoot': str(copied)}))
        staged_raw = root / 'stage-target'
        staged_raw.mkdir()
        try:
            namespace['stage_launch'](launch, staged_raw, activation['id'], original)
        except AssertionError as error:
            assert 'launch changed after execution-coordinate check' in str(error)
        else:
            raise AssertionError('changed launch staged')
        assert list(staged_raw.iterdir()) == []
        cases.append({'name': 'launch_changed_after_guard_rejected_before_staging_write', 'passed': True})
        namespace = {'__file__': str(HERE / 'operate.py')}
        try:
            exec(prefix, namespace)
        except AssertionError as error:
            assert 'launch executionControlRoot differs' in str(error)
        else:
            raise AssertionError('mismatched launch accepted')
        assert 'started' not in namespace and 'child' not in namespace
        cases.append({'name': 'launch_coordinate_mismatch_rejected_before_clock_raw_host', 'passed': True})
    finally:
        sys.argv = previous

print(json.dumps({'cases': cases, 'limits': 'Correct-coordinate path executes only the exact AST prefix before the clock. No physical observer, Product import, host, native call or real source/raw attempt is executed.'}))
