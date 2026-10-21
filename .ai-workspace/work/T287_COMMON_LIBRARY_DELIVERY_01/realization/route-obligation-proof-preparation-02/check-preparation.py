from pathlib import Path
import hashlib
import json
import re
import stat

ROOT = Path('/Users/jim/src/apps/abiogenesis')
HERE = ROOT / '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/route-obligation-proof-preparation-02'

def read_json(name):
    return json.loads((HERE / name).read_text())

def check_pin(row):
    path = ROOT / row['path']
    st = path.lstat()
    assert stat.S_ISREG(st.st_mode), (row['path'], 'regular-file pin')
    assert hashlib.sha256(path.read_bytes()).hexdigest() == row['sha256'], (row['path'], 'sha256')
    assert st.st_size == row['bytes'], (row['path'], 'bytes')
    assert oct(stat.S_IMODE(st.st_mode)) == row['mode'], (row['path'], 'mode')

template = read_json('prospective-inputs.json')
assert template['status'] == 'NOT_GRANTED'
assert all(template[key] is None for key in ['finalCandidate', 'finalInstalledRoot', 'finalArchiveSha256', 'executionGrant', 'executionResult'])
assert template['acceptance'] is False
assert template['nativeCallsAdded'] == template['producerWorkloadsAdded'] == 0
assert template['retainedGraphInput']['status'] == 'AUTHENTIC_PREMISE_NOT_SUPPLIED'
assert template['retainedGraphInput']['positiveHistoryMayBeManufactured'] is False
assert (HERE / template['recipe']).is_file()

preservation = read_json('preservation.json')
assert preservation['status'] == 'satisfied'
assert preservation['mainGeneratedRecords'] == 936
assert preservation['correctedPreservationExecutionCount'] == 1 and preservation['retryCount'] == 0
assert all(row['mismatches'] == 0 for row in preservation['inventories'])
# Consume the completed preservation receipt, do not rerun its inventories.

pins = read_json('source-pins.json')
assert pins['candidateBinding'] is None
assert len(pins['rows']) == 31 and len(pins['otherPins']) == 27
for row in pins['rows']:
    check_pin(row['frozenCopy'])
for row in pins['otherPins']:
    check_pin(row)

unchanged = [
    'abg/worksite_input_provenance.ts', 'abg/registered_selection_provenance.ts',
    'abg/event_prefix.ts', 'abg/runtime_derivation.ts', 'abg/replay.ts',
    'abg/event_store.ts', 'abg/traversal_cursor.ts', 'abg/invocation_execution_truth.ts',
    'abg/execution_basis.ts', 'product/declaration_closure.ts',
    'product/implementation_resolution.ts', 'product/installed_module.ts',
    'gtl/public_start.ts',
]
for name in unchanged:
    row = next(row for row in pins['rows'] if row['originalPath'].endswith('/code/src/' + name))
    assert row['baseline']['exactBytesEqual'] is True, name
    assert row['baseline']['sha256'] == row['frozenCopy']['sha256'], name

links = []
for path in HERE.glob('*.md'):
    for target in re.findall(r'\]\(([^)]+)\)', path.read_text()):
        if '://' in target:
            continue
        local = re.sub(r':\d+$', '', target.split('#')[0])
        selected = Path(local) if Path(local).is_absolute() else path.parent / local
        assert selected.is_file(), (path.name, target)
        links.append({'from': path.name, 'target': target})

companion = (HERE / 'c0-f5-public-assessment.md').read_text()
assert companion.startswith('Product Frame: fixed fifteen families F01–07/F09–11/F13–17;')
assert companion.endswith('</oai-mem-citation>\n')
assert 'all 38 source pins against closed subjects' in companion
assert 'the reported 38-pin verification belongs to that earlier assessment' in (HERE / 'c0-f5-attribution.md').read_text().lower()
result = {'status': 'satisfied', 'scope': 'source pins, metadata, NOT_GRANTED template and local link readiness only',
          'sourceRows': 31, 'otherPins': 27, 'localLinksChecked': len(links),
          'unchangedOwnerSourcesChecked': unchanged, 'preservationReceiptConsumedWithoutRerun': True,
          'runtimeImports': 0, 'nativeCalls': 0, 'applicationTests': 0,
          'verbatimAssessment': 'Retained from the public conversation; no original raw local transcript hash exists.',
          'finalCandidateBound': False, 'executionGrant': 'NOT_GRANTED'}
with (HERE / 'readiness.json').open('x') as stream:
    json.dump(result, stream, indent=2)
    stream.write('\n')
print(json.dumps(result))
