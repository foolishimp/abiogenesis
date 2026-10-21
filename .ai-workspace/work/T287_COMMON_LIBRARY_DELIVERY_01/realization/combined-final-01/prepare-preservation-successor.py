from pathlib import Path
import json
from common import ROOT, WORK, digest, inventory, row, verify, write

prior = json.loads((WORK / 'protected-prior-trees.json').read_text())
sibling = '.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01/realization/final-proof-preparation-01'
sibling_freeze = ROOT / sibling / 'freeze.json'
assert digest(sibling_freeze) == 'e7bf015a4cc2bf9246d2aedd9800a8b0c41aef5255b5b30fdfd78a69627b12aa'
assert digest(WORK / 'first-cause.json') == '8eff9b83a8060a46b8d02897864868d293478a67e483b1336189d30e177c1276'
assert digest(WORK / 'finalize.py') == '94167ee1397e95ef0818c2e8888c39c23c94513c2a4f575f61c5560413388e62'
closed = json.loads(sibling_freeze.read_text())
assert closed['recordCount'] == len(closed['records']) == 29
for record in closed['records']:
    verify(ROOT / record['path'], record)
old = {str(Path(r['path']).relative_to(sibling)): {**r, 'path': str(Path(r['path']).relative_to(sibling))}
       for r in prior['files'] if r['path'].startswith(sibling + '/')}
new = {r['path']: r for r in inventory(ROOT / sibling)}
assert set(new) == {str(Path(r['path']).relative_to(sibling)) for r in closed['records']} | {'freeze.json'}
changed = [{'before': old[p], 'after': new[p]} for p in sorted(old.keys() & new.keys()) if old[p] != new[p]]
added = [new[p] for p in sorted(new.keys() - old.keys())]
removed = [old[p] for p in sorted(old.keys() - new.keys())]
assert len(old) == 16 and len(new) == 30 and len(changed) == 4 and len(added) == 14 and not removed
assert [r['before']['path'] for r in changed] == ['HOW.md', 'diagnostic-preload.mjs', 'diagnostic-probes.mjs', 'owner-resolution.configuration.template.json']
write('concurrent-preparation-delta.json', {
    'kind': 'observed_in_progress_to_closed_sibling_delta', 'territory': sibling,
    'historicalSnapshotCount': 16, 'closedFileCount': 30, 'changed': changed, 'added': added, 'removed': removed,
    'unchangedHistoricalFiles': sorted(p for p in old.keys() & new.keys() if old[p] == new[p]),
    'closedFreeze': row(sibling_freeze, sibling_freeze.relative_to(ROOT)),
    'classification': 'Separately authorized concurrent Writer output; old snapshot retained as historical in-progress evidence',
})
original_records = []
for path in sorted(WORK.rglob('*')):
    rel = path.relative_to(WORK)
    if rel.parts[0] in ['source', 'stage', 'preimages', 'tmp', 'npm-cache', 'npm-logs']:
        continue
    if rel.parts[0] in ['PRESERVATION-HOW.md', 'prepare-preservation-successor.py', 'concurrent-preparation-delta.json']:
        continue
    if path.is_file() or path.is_symlink():
        original_records.append(row(path, path.relative_to(ROOT)))
write('stopped-cut-records.json', {
    'kind': 'immutable_existing_evidence_records_at_preservation_reentry', 'files': original_records,
    'sourceAndStage': 'Bound by unchanged source and post-generation inventories; not copied or regenerated',
    'originalFinalizationExitCodeObserved': 1,
    'originalOutputProvenance': 'Tool transcript only; no raw local stdout/stderr hash is claimed. Local first-cause retains traceback.',
})
write('preservation-reentry.json', {
    'activation': 'COMBINED-FINAL-PRESERVATION-01', 'actor': '/root/stdo3_k11_successor_writer',
    'executive': '/root', 'writeTerritory': str(WORK),
    'HOW': row(WORK / 'PRESERVATION-HOW.md', (WORK / 'PRESERVATION-HOW.md').relative_to(ROOT)),
    'historicalFirstCause': row(WORK / 'first-cause.json', (WORK / 'first-cause.json').relative_to(ROOT)),
    'originalFinalizer': row(WORK / 'finalize.py', (WORK / 'finalize.py').relative_to(ROOT)),
    'originalRequest': row(WORK / 'commands/finalize.request.json', (WORK / 'commands/finalize.request.json').relative_to(ROOT)),
    'originalCapture': row(WORK / 'protected-prior-trees.json', (WORK / 'protected-prior-trees.json').relative_to(ROOT)),
    'stoppedRecords': row(WORK / 'stopped-cut-records.json', (WORK / 'stopped-cut-records.json').relative_to(ROOT)),
    'concurrentTerritory': sibling, 'concurrentClosedFreeze': row(sibling_freeze, sibling_freeze.relative_to(ROOT)),
    'observedDelta': row(WORK / 'concurrent-preparation-delta.json', (WORK / 'concurrent-preparation-delta.json').relative_to(ROOT)),
    'requiredOtherPriorRoots': len(prior['roots']) - 1,
    'requiredOtherPriorEntries': len(prior['files']) - len(old),
    'disposition': 'Classify exactly one previously active sibling as separately closed; preserve historical capture and first cause. Require every other originally captured root exactly unchanged.',
    'allowed': ['Add successor evidence records', 'Reverify necessary preservation', 'Finish candidate/support/report/freeze'],
    'notAuthorized': ['Build', 'Generator', 'Pack', 'Material/payload/structural rerun', 'Source mutation', 'Test', 'Install', 'Native workload', 'Git', 'Network'],
})

text = (WORK / 'finalize.py').read_text()
def replace(old, new):
    global text
    assert text.count(old) == 1, old[:120]
    text = text.replace(old, new)

replace("assert not (WORK / 'first-cause.json').exists()", "assert digest(WORK / 'first-cause.json') == '8eff9b83a8060a46b8d02897864868d293478a67e483b1336189d30e177c1276'\nassert not (WORK / 'first-cause-successor.json').exists()")
text = text.replace("'commands/finalize.request.json'", "'commands/finalize-successor.request.json'")
text = text.replace("'commands/finalize.result.json'", "'commands/finalize-successor.result.json'")
text = text.replace("'label': 'finalize'", "'label': 'finalize-successor'")
text = text.replace("'grant': 'COMBINED-FINAL-BUILD-01'", "'grant': 'COMBINED-FINAL-PRESERVATION-01'")
text = text.replace("WORK / 'finalize.py'", "WORK / 'finalize-successor.py'")
replace("    exact_rows(ROOT, read('prebuild-freeze.json')['files'])", """    exact_rows(ROOT, read('prebuild-freeze.json')['files'])
    exact_rows(ROOT, read('stopped-cut-records.json')['files'])
    reentry = read('preservation-reentry.json')
    for key in ['HOW', 'historicalFirstCause', 'originalFinalizer', 'originalRequest', 'originalCapture', 'stoppedRecords', 'observedDelta', 'concurrentClosedFreeze']:
        verify(ROOT / reentry[key]['path'], reentry[key])
    concurrent_root = reentry['concurrentTerritory']
    concurrent_freeze = json.loads((ROOT / reentry['concurrentClosedFreeze']['path']).read_text())
    assert concurrent_freeze['recordCount'] == len(concurrent_freeze['records']) == 29
    exact_rows(ROOT, concurrent_freeze['records'])
    concurrent_rows = [row(ROOT / r['path'], str(Path(r['path']).relative_to(concurrent_root))) for r in concurrent_freeze['records']]
    concurrent_rows.append(row(ROOT / reentry['concurrentClosedFreeze']['path'], 'freeze.json'))
    exact_tree(ROOT / concurrent_root, concurrent_rows)
    delta = read('concurrent-preparation-delta.json')
    assert (delta['historicalSnapshotCount'], delta['closedFileCount'], len(delta['changed']), len(delta['added']), len(delta['removed'])) == (16, 30, 4, 14, 0)
    concurrent = {'territory': concurrent_root, 'freeze': reentry['concurrentClosedFreeze'],
                  'boundRecordsVerified': 29, 'closedFilesVerified': 30,
                  'historicalSnapshotIsNotAnImmutablePriorCut': True,
                  'observedDelta': record('concurrent-preparation-delta.json')}
""")
replace("    for root in prior['roots']:\n        selected", "    for root in prior['roots']:\n        if root == concurrent_root:\n            continue\n        selected")
replace("    assert sum(r['entries'] for r in prior_roots) == len(prior['files'])", "    preserved_prior_count = sum(r['entries'] for r in prior_roots)\n    assert preserved_prior_count == reentry['requiredOtherPriorEntries'] == 87344\n    assert len(prior_roots) == reentry['requiredOtherPriorRoots'] == 22")
replace("    print(json.dumps({'phase': 'all_prior_cuts_preserved', 'roots': len(prior_roots),\n                      'entries': len(prior['files'])}), flush=True)", "    print(json.dumps({'phase': 'other_prior_cuts_preserved_and_concurrent_cut_verified', 'roots': len(prior_roots),\n                      'unchangedEntries': preserved_prior_count, 'concurrentBoundRecords': 29}), flush=True)")
replace("        'priorCutEntriesUnchanged': len(prior['files']), 'priorRoots': prior_roots,", "        'priorCutEntriesUnchanged': preserved_prior_count, 'priorRoots': prior_roots,\n        'separatelyClosedConcurrentPreparation': concurrent,\n        'classificationCorrection': record('preservation-reentry.json'),\n        'originalFinalizationFailure': record('first-cause.json'),")
replace("        'firstUnexpectedBuildOrCorrespondenceFailure': None,", "        'originalFinalizationFailure': record('first-cause.json'),\n        'preservationClassificationCorrection': record('preservation-reentry.json'),\n        'concurrentPreparation': concurrent, 'newUnexpectedFailure': None,")
replace("    report = f'''# COMBINED-FINAL-BUILD-01 closed Writer return", "    report = f'''# COMBINED-FINAL-BUILD-01 closed Writer return with preservation successor")
replace("Material, payload and structural correspondence each ran once and passed. No failed build/correspondence command or repair/retry occurred.", "Material, payload and structural correspondence each ran once and passed. None was rerun during the separately authorized preservation successor. The first finalization attempt exited 1 at the prior-directory preservation comparison; its script, request, historical capture and first-cause record remain exact. Executive COMBINED-FINAL-PRESERVATION-01 corrected the classification of one concurrently active sibling territory and authorized this new finalization script/receipt. No source or candidate change was selected.")
replace("The final preservation comparison found zero differences across {len(prior['files']):,} entries in {len(prior_roots)} prior roots, including old/failed cuts and baseline material; all 936 main generated entries and {len(main_inputs)} captured live input files remain exact.", "The successor preservation comparison found zero differences across {preserved_prior_count:,} entries in all {len(prior_roots)} other originally captured roots, including old/failed cuts and baseline material. Exactly `final-proof-preparation-01` is separately classified as an explicitly concurrent Writer territory at the original capture. Its historical sixteen-file snapshot has four changed files, fourteen additions and zero removals; it is not claimed unchanged. `concurrent-preparation-delta.json` preserves every before/after row. Its separately closed freeze `e7bf015a4cc2bf9246d2aedd9800a8b0c41aef5255b5b30fdfd78a69627b12aa` and all 29 bound rows (30 directory files including the freeze) were verified exactly. No other exception or inventory refresh occurred. All 936 main generated entries and {len(main_inputs)} captured live input files remain exact.")
replace("        'priorPreservedEntries': len(prior['files']), 'mainGeneratedPreservedEntries': len(main_generated),", "        'priorPreservedEntries': preserved_prior_count, 'mainGeneratedPreservedEntries': len(main_generated),\n        'separatelyClosedConcurrentRecordsVerified': 29, 'originalFailurePreserved': record('first-cause.json'),")
replace("        'supportEntries': len(support), 'firstUnexpectedBuildOrCorrespondenceFailure': None,", "        'supportEntries': len(support), 'newUnexpectedFailure': None,")
replace("        'independentAcceptance': False, 'L5Claim': False,", "        'preservationSuccessorGrant': 'COMBINED-FINAL-PRESERVATION-01',\n        'historicalFirstCause': record('first-cause.json'), 'classificationCorrection': record('preservation-reentry.json'),\n        'independentAcceptance': False, 'L5Claim': False,")
replace("    if not (WORK / 'first-cause.json').exists():\n        write('first-cause.json', {'kind': 'first_unexpected_final_preservation_or_freeze_failure',", "    if not (WORK / 'first-cause-successor.json').exists():\n        write('first-cause-successor.json', {'kind': 'first_unexpected_preservation_successor_failure',")
with (WORK / 'finalize-successor.py').open('x') as stream:
    stream.write('# Separate Executive-authorized preservation classification successor. Original finalize.py remains immutable.\n' + text)
print(json.dumps({'prepared': 'COMBINED-FINAL-PRESERVATION-01', 'delta': {'changed': 4, 'added': 14, 'removed': 0},
                  'siblingFreezeRecordsVerified': 29, 'originalEvidenceRecordsPinned': len(original_records),
                  'successorScriptSha256': digest(WORK / 'finalize-successor.py')}), flush=True)
