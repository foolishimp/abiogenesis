import json, time, traceback
from common import ROOT, WORK, TENANT, digest, inventory, row, verify, write

started = time.monotonic()
assert not (WORK / 'first-cause.json').exists()
write('commands/generation-correspondence.request.json', {'scriptSha256': digest(WORK / 'verify-generation.py'),
      'prebuildFreezeSha256': digest(WORK / 'prebuild-freeze.json'), 'scope': 'File correspondence only; no build or owner workload'})
try:
    previous = WORK.parent / 'combined-final-01'
    stage = WORK / 'stage'
    source = json.loads((WORK / 'source-union-manifest.json').read_text())['files']
    assert len(inventory(WORK / 'source')) == len(source)
    allowed = {str(TENANT / p) for p in ['contracts/capabilities/capability-definition-graph.json', 'contracts/worksite/command-execution-context.inventory.json']}
    derived = []
    for expected in source:
        verify(WORK / 'source' / expected['path'], expected)
        actual = row(stage / expected['path'], expected['path'])
        if actual['sha256'] != expected['sha256']:
            assert expected['path'] in allowed
            derived.append({'before': expected, 'after': actual, 'producer': 'scripts/generate-product-manifest.mjs',
                            'receipt': 'commands/generate.result.json'})
        else:
            verify(stage / expected['path'], expected)
    assert {r['after']['path'] for r in derived} == allowed
    deps = json.loads((WORK / 'dependency-inventory.json').read_text())['files']
    assert inventory(stage / TENANT / 'node_modules') == deps
    old_generated = json.loads((previous / 'generated-inventory.json').read_text())['files']
    generated = [row(stage / r['path'], r['path']) for r in old_generated]
    code = {r['path']: r for r in generated if r['path'].startswith(str(TENANT / 'build/code') + '/')}
    old_code = {r['path']: r for r in old_generated if r['path'] in code}
    expected_emissions = json.loads((WORK / 'expected-c0-emissions.json').read_text())['files']
    changed_code = [p for p in code if code[p] != old_code[p]]
    assert set(changed_code) == {r['path'] for r in expected_emissions}
    for expected in expected_emissions:
        verify(stage / expected['path'], expected)
    all_changed = [r['path'] for r, old in zip(generated, old_generated) if r != old]
    assert set(all_changed) == set(changed_code) | {str(TENANT / p) for p in ['product-toolchain-manifest.json', 'contracts/capabilities/capability-definition-graph.json']}
    complete_stage = inventory(stage)
    before = json.loads((WORK / 'stage-prebuild-inventory.json').read_text())['files']
    assert {r['path'] for r in complete_stage} == {r['path'] for r in before} | {r['path'] for r in old_generated}
    write('generated-inventory.json', {'files': generated})
    write('stage-post-generation-inventory.json', {'files': complete_stage})
    write('source-generated-correspondence.json', {'immutable_source_union_preserved': True, 'all_other_source_inputs_unchanged': True,
          'derived_source_successors': derived, 'generated_entries': len(generated), 'source_entries': len(source),
          'stage_entries': len(complete_stage), 'dependency_entries_unchanged': len(deps), 'generator_runs': 1, 'compile_runs': 1})
    write('emitted-correspondence.json', {'predecessor': 'combined-final-01', 'codeEntries': len(code),
          'unchangedCodeEntries': len(code) - len(changed_code), 'changedCode': [{'before': old_code[p], 'after': code[p]} for p in changed_code],
          'allOtherCodeBytesAndModesUnchanged': True, 'closedC0EmissionPinsMatch': True,
          'pureK11E03CommonOwnerEmissionsUnchanged': True, 'changedGeneratedPaths': all_changed,
          'declarationRelation': 'Exactly one c_call_outcome.d.ts; actual type-reference equivalence checked by verify-metadata.mjs'})
    write('commands/generation-correspondence.result.json', {'exitCode': 0, 'wallMs': (time.monotonic()-started)*1000,
          'codeEntries': len(code), 'changedCodeEntries': len(changed_code), 'changedGeneratedEntries': len(all_changed)})
    print(json.dumps({'status':'satisfied','generatedEntries':len(generated),'stageEntries':len(complete_stage),
                      'codeEntries':len(code),'changedCodeEntries':len(changed_code),'changedGeneratedEntries':len(all_changed)}),flush=True)
except BaseException:
    write('first-cause.json', {'kind':'generation_correspondence_failure','traceback':traceback.format_exc(),'disposition':'Stopped without repair/retry'})
    raise
