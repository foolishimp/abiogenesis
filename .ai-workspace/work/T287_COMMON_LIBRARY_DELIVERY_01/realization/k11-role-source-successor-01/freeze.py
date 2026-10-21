from pathlib import Path
import datetime, hashlib, json, os, stat

root = Path('/Users/jim/src/apps/abiogenesis')
work = Path(__file__).resolve().parent
assert not (work / 'freeze.json').exists()

def row(path):
    relative = str(path.relative_to(root))
    mode = oct(stat.S_IMODE(path.lstat().st_mode))
    if path.is_symlink():
        return {'path': relative, 'kind': 'symlink', 'target': os.readlink(path), 'mode': mode}
    data = path.read_bytes()
    return {'path': relative, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'mode': mode}

inputs = json.loads((work / 'inputs.json').read_text())
stage = {r['path']: r for r in json.loads((work / 'stage-output-inventory.json').read_text())['files']}
for rel in inputs['allowed_main_edits']:
    actual = row(root / rel)
    assert all(actual[k] == stage[rel][k] for k in actual)
test_path = inputs['allowed_main_edits'][1]
marker = "test('K11 actual Product acquisition checks manifest, complete source inventory, spans and permission without Python'"
assert (root / test_path).read_text().split(marker, 1)[1] == (work / 'preimages' / test_path).read_text().split(marker, 1)[1]
closed = datetime.datetime.now(datetime.timezone.utc).isoformat()
readiness = {'closed_utc': closed, 'work_result': 'candidate_ready', 'core_value': 'satisfied',
             'predicate': 'A frozen candidate is available for the bounded K11 structural role-source successor',
             'compile_exit': 0, 'selected_test_cases_passed': 4, 'selected_test_cases_failed': 0,
             'selected_test_cases_skipped': 0, 'old_specialization_acceptances': 2,
             'successor_specialization_refusals_on_identical_inputs': 2, 'generic_acceptances_retained': 2,
             'unexpected_integration_failures': [], 'retries': 0, 'first_failure': None,
             'independent_acceptance': False, 'combined_proof': 'pending exact successor integration',
             'native_P4': 'not executed', 'library_L5': 'open', 'release_resumption_gate': 'closed',
             'unchanged_K11_acquisition_test_body': True, 'support_helper_changes': 0,
             'main_generated_preserved': 936, 'old_stage_preserved': 6632, 'stage_dependencies_preserved': 4576}
(work / 'readiness.json').write_text(json.dumps(readiness, indent=2) + '\n')
records = [row(path) for path in sorted(work.rglob('*'))
           if (path.is_file() or path.is_symlink()) and path.relative_to(work).parts[0] not in ['stage', 'resources']]
freeze = {'kind': 'bounded_writer_successor_freeze', 'closed_utc': closed,
          'writer': '/root/stdo3_k11_successor_writer', 'activation': 'K11-ROLE-SOURCE-SUCCESSOR-01', 'return_to': '/root',
          'work_result': 'candidate_ready', 'scope': 'K11 constructor role-native-source join only',
          'method_basis': 'stdo://releases/v3.0.0-rc.1/',
          'method_manifest_sha256': '069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232',
          'composition': [], 'not_whole_moving_tree': True,
          'owning_how': row(work / 'L2-supplement.md'), 'antecedent_pins': inputs['pins'],
          'owned_outputs': [row(root / rel) for rel in inputs['allowed_main_edits']], 'records': records,
          'stage_binding': {'source_inputs': 'candidate-inputs.json', 'outputs': 'stage-output-inventory.json',
                            'original': 'old-stage-inventory.json', 'correspondence': 'source-generated-correspondence.json',
                            'dependency_count': 4576, 'preservation': 'preservation.json', 'toolchain': 'toolchain.json'},
          'physical_resources': 'resources-inventory.json',
          'exclusions': ['no generator/package/install identity claim', 'no native or corpus-tool execution',
                         'no runtime admission or successor prefix claim', 'no final combined proof or P4 semantic sufficiency',
                         'no independent assessment, L5 acceptance or release qualification', 'no Git or Reviewer activation']}
(work / 'freeze.json').write_text(json.dumps(freeze, indent=2) + '\n')
print(json.dumps({'freeze': row(work / 'freeze.json'), 'report': row(work / 'report.md'),
                  'owned_outputs': freeze['owned_outputs'], 'record_count': len(records), 'status': 'candidate_ready'}))
