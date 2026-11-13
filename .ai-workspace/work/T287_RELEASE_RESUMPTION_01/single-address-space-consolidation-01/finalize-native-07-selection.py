"""Root operator/evidence Writer: conjoin genuine native06 close and select completion.

No Product source mutation, runtime admission, provider call or release effect.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil

X = Path(__file__).resolve().parent
A = X / 'native-06'
S = Path('/Users/jim/src/apps/abiogenesis-single-address-space')
T = 'build_tenants/abiogenesis/typescript/'
now = datetime.now(timezone.utc).isoformat()
read = lambda p: json.loads(p.read_text())
sha = lambda b: hashlib.sha256(b).hexdigest()


def pin(p):
    b = p.read_bytes()
    return {'path': str(p), 'bytes': len(b), 'sha256': sha(b)}


def write(p, value):
    with p.open('x') as out:
        out.write(value if isinstance(value, str) else json.dumps(value, indent=2) + '\n')


assert not (X / 'native-07').exists()
subject = A / 'review-subject-001/SUBJECT.json'
assert pin(subject)['sha256'] == '8fe230782673ff859a756245a6041eb6a9e6ce0da0c54fa3cd00fef933173670'
capacity = A / 'UAT_CAPACITY_TRIAGE.json'
assert pin(capacity)['sha256'] == '2935089131df4d0f7b1a95eee587e05cbd8ad96cc041a8cebd44009735fef9ac'
coords = read(A / 'ACTUAL_FINAL_CLOSE_COORDINATES.json')
close = A / 'execution/after-run-resume.json'
assert pin(close)['sha256'] == '2e8c3683018a6a9b0600c6b07518270255fad4106089cfd11778451985165e18'
outcome = read(A / 'execution/outcome-summary.json')
assert outcome['disposition'] == 'runtime_failed' and outcome['terminal'] is None
c2 = read(A / 'ACTUAL_C2_SUMMARY.json')
closed_c2 = read(A / 'NATIVE_C2_CLOSED_RESULT.json')
actual_c2_ref = 'result://abiogenesis/cfd2f57237bd028e6e63dd54d81ab0b20f60d96cdad30c1c5b0a1a8188a04b60'
assert actual_c2_ref in json.dumps(closed_c2)
recipe = read(X / 'NATIVE07_AFFECTED_RECIPE_DRAFT.json')
retained = [next(r for r in c2['lanes'] if r['id'] == lane) for lane in recipe['conditionallyRetainPriorLanes']]
assert all(r['exitCode'] == 0 and r['fail'] == 0 and r['unmet'] == [] for r in retained)
assert sum(r['pass'] for r in retained) == 261
assert sum(r['skipped'] for r in retained) == 41

changed_proof = [T + p for p in [
    'test_env/tests/t287-retry-run-prefix.test.mjs',
    'test_env/tests/t287-calculus-fold.test.mjs',
    'test_env/tests/t287-single-address-space-consolidation.test.mjs',
    'test_env/support/single-address-space-consolidation.mjs',
    'test_env/tests/t287-exact-construction-intent.test.mjs',
    'design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md']]
rewritten = {'TASK.md', 'NATIVE_GRANT.json', 'INPUT_SUFFICIENCY.json', 'C2_INPUTS.json',
    'C2_SELECTED_INPUTS.json', 'c2-proof.mjs', 'HELD_SOURCE_AND_EVIDENCE.json',
    'PRIOR_ACTIVATION_CONJUNCTION.json', 'PRIOR_ACTUAL_C2_SUMMARY.json',
    'PREVIOUS_NATIVE_RETURN.json', 'NATIVE_UAT_CLOSED_RESULT.json', 'NATIVE_C2_CLOSED_RESULT.json'}
helper = read(A / 'actual-c2-001/HELPER_RESULT.json')
unchanged, excluded = [], []
for row in helper['snapshotMembers']:
    old = row['relativePath']
    if old in changed_proof or old.startswith('consolidation-scratch/'):
        excluded.append({'priorRelativePath': old, 'reason': 'Selected changed proof or prior mutable handoff; no retained lane imports these proof modules.'})
        continue
    prefix = 'consolidation-inputs/native-06/'
    if old.startswith(prefix) and old[len(prefix):] in rewritten:
        excluded.append({'priorRelativePath': old, 'reason': 'Continuation control/evidence projection; prior test modules do not consume these controls.'})
        continue
    b = (S / old).read_bytes()
    assert len(b) == row['byteLength'] and 'sha256:' + sha(b) == row['digest'], old
    current = old.replace(prefix, 'consolidation-inputs/native-07/', 1)
    unchanged.append({'relativePath': current, 'priorRelativePath': old, 'bytes': len(b), 'sha256': sha(b)})
package = read(A / 'actual-c2-001/CANDIDATE_PACKAGE_IDENTITY.json')
assert package['bytes'] == 11003160
reuse = {
    'kind': 'root_retained_bounded_c2_evidence', 'status': 'ROOT_SELECTED_FROM_CLOSED_NATIVE06',
    'recordedUtc': now, 'actualC2ResultRef': actual_c2_ref,
    'sourceSubject': pin(subject), 'actualC2Close': pin(A / 'NATIVE_C2_CLOSED_RESULT.json'),
    'actualFinalClose': pin(close), 'sourceAfterClose': pin(A / 'SOURCE_AFTER_FINAL_CLOSE.json'),
    'packageArchive': {k: package[k] for k in ['relativePath', 'bytes', 'integrity']},
    'priorPackageIdentity': pin(A / 'actual-c2-001/CANDIDATE_PACKAGE_IDENTITY.json'),
    'priorFullPackMetadata': pin(A / 'actual-c2-001/NPM_PACK_METADATA.json'),
    'retainedLanes': retained, 'unchangedSourceFiles': unchanged,
    'excludedSourceRows': excluded, 'selectedChangedProofPaths': changed_proof,
    'dependencyRelation': 'All actual native06 selected static source/test/helper/config/fixture members are guarded, including copied contract seeds and unchanged control resources. Only selected changed proof modules, handoffs and rewritten operator controls are excluded. Searches find no retained lane imports of those changed proof modules; only rerun calculus and whole-path tests import the changed whole-path helper. Package bytes must remain identical. Historical external resources retain their exact immutable declared identities and original applicability.',
    'invalidators': ['Any package-byte mismatch', 'Any guarded source/dependency mismatch', 'A newly discovered dependency on a selected changed proof module', 'A changed material external input or runtime environment'],
    'credit': {'priorPasses': 261, 'historicalSkips': 41, 'newExecution': False},
    'standing': 'Conditional reuse of eight passing lanes only; no new case, whole acceptance, UAT or qualification credit.'}
write(A / 'NATIVE07_EVIDENCE_REUSE.json', reuse)

selection = (X / 'NATIVE07_PROSPECTIVE_SELECTION_R1.md').read_text()
selection = selection.replace('# Prospective completion of the retained consolidation', '# Root selection07: complete the retained consolidation', 1)
start = selection.index('Root Executive planning under selection06;')
end = selection.index('Product Frame:', start)
selection = selection[:start] + f'Root Executive selection, {now}. Native06 has genuinely closed runtime_failed. This selects preparation and the exact completion increment; native dispatch still requires installed-owner preflight and Root admission. All original obligations and historical failures remain.\n\n' + selection[end:]
start = selection.index('At 2026-11-04T02:14:40Z,')
end = selection.index('The next increment', start)
selection = selection[:start] + '''Actual C2 closed with 303 passes, zero test failures and 44 skips across all12 lanes. Eleven lanes satisfy their predicates. Retry-entry has zero passes and three required skips; the other41 skips remain declared historical exclusions. All124 source/handoff bytes agree,899 protected inputs are unchanged and Product delta is empty. Native UAT never launched: real instruction assembly refused maxPromptBytes. Fresh result is not_found, replay failed and the genuine final close was saved at2026-11-04T03:12:03.116508Z. Source is still byte-equal after close. These are closed observations, not a satisfied assessment or terminal Result.

''' + selection[end:]
selection = selection.replace('Prospective extra Product test write path:', 'Additional selected Product test write path:')
selection = selection.replace('No additional Product\n   optimization is selected by this draft.', 'No additional Product\n   optimization is selected by this continuation.')
start = selection.index('The final affected recipe is selected after actual native06 closes')
end = selection.index('Independent max review', start)
selection = selection[:start] + '''The affected recipe executes five lanes without skips: whole-path, shared-owner declaration regressions, retry-entry, current F09 consumers and current-intent complete-pair. Eight native06 passing lanes may be retained only under native-06/NATIVE07_EVIDENCE_REUSE.json: exact package byte length/SHA512 and every enumerated dependency must remain equal. That retains261 prior passes and41 excluded historical skips, never new execution. Every changed case still executes. A mismatch invalidates reuse and returns for recipe selection; it cannot be ignored to get green. Actual final-source correspondence remains mandatory.

''' + selection[end:]
selection += '''
## Closed operator-capacity correction

The independent UAT_CAPACITY_TRIAGE.json pins the actual assessor work order and real role projection: 1,092,985 bytes against the unchanged1,048,576-byte cap. A 5,325-file npm pack inventory is repeated in the command-result carriage. Its serialized command record is770,039 bytes. The pure installed-renderer counterfactual replacing only that stdout with the package filename/newline is323,588 bytes, leaving724,988 bytes of headroom. This predicts formatting sufficiency; it is not future admission or UAT evidence.

Use existing npm pack --ignore-scripts --silent --pack-destination artifacts. Retain the actual new archive plus byte length/SHA256/SHA512 through the existing operator C2 wrapper before tests can clean artifacts. Preserve the complete old npm inventory and real failed prompt. No selected predicate consumes inventory files[]. Preserve the full native proof in its actual helper-observed file and emit only its exact locator/digest in the compact C2 stdout report. Await standard stdout completion before any failing assertion. This reduces redundant carriage using existing npm, file and crypto owners; it adds no Product mechanism and does not raise any prompt cap.

Downstream assessors may read actual typed C2 outputs: observation.snapshotRoot plus worksiteDelta selects the report; verify its after.byteLength/digest, then read nativeTestProof.path and verify bytes/SHA256. Do not guess archive attempts or use the cleanup-prone producerPath. This is finite returned-evidence access, not a future input claim. Keep the execution Worker restricted to its prescribed helper invocation/result.

Before dispatch check the final initial context and downstream predictive capacity through installed owners. Preserve the predictive/actual distinction. Independent review covers final materially changed controls and conditional dependency reuse; it is not another broad Product review. Native source work remains restricted to the six named test/support/HOW paths. Any need for Product code or another fixture write returns to Root with the exact missing relation. The old wider source snapshot is retained for complete custody/correspondence, not permission to reopen completed repairs.
'''
selection_path = X / 'ROOT_REENTRY_SELECTION_07.md'
write(selection_path, selection)
shutil.copyfile(X / 'native07-c2-proof-template-r3.mjs', X / 'native07-c2-proof-template.mjs')

review_names = ['INDEPENDENT_FINAL_SOURCE_DELTA_REVIEW.json', 'INDEPENDENT_INTERIM_CODE_RECHECK_002.json',
    'INDEPENDENT_INTERIM_QUALIFICATION_PROOF_REVIEW.json', 'INDEPENDENT_INTERIM_INSTALL_PROOF_REVIEW.json',
    'INDEPENDENT_INTERIM_R1_PAIR_PROOF_REVIEW.json', 'LAYERED_ALLOCATION_BOUND_TRIAGE.json',
    'REMAINING_PAIR_PROOF_TRIAGE.json', 'FH_POSITIVE_PREMISE_TRIAGE.json',
    'PROSPECTIVE_COMPLETION_REVIEW.json', 'PROSPECTIVE_REUSE_CONTROL_REVIEW.json',
    'PROSPECTIVE_REUSE_CONTROL_RECHECK.json', 'PROSPECTIVE_C2_OUTPUT_REVIEW.json', 'UAT_CAPACITY_TRIAGE.json']
old = read(X / 'native-05/ROOT_CONJUNCTION.json')
conjunction = {
    'recordedUtc': now, 'role': 'Root Executive conjunction and bounded re-entry',
    'basis': old['basis'], 'frameUri': old['frameUri'], 'subject': pin(subject),
    'subjectSha256': pin(subject)['sha256'], 'sourceStanding': 'Partial successor after genuine native06 failure; immutable RC5 baseline retained.',
    'nativeAuthorReadiness': pin(A / 'review-subject-001/readiness.json'),
    'closedReviews': [pin(A / n) for n in review_names],
    'actualC2': pin(A / 'ACTUAL_C2_SUMMARY.json'), 'admittedC2Result': pin(A / 'NATIVE_C2_CLOSED_RESULT.json'),
    'actualUATPreparationRefusal': pin(A / 'NATIVE_UAT_CLOSED_RESULT.json'), 'nativeUATAssessment': None,
    'actualOutcome': pin(A / 'execution/outcome-summary.json'), 'freshReadbacks': pin(A / 'execution/fresh-reads.json'),
    'actualFinalClose': pin(close), 'closeCoordinates': pin(A / 'ACTUAL_FINAL_CLOSE_COORDINATES.json'),
    'sourceAfterFinalClose': pin(A / 'SOURCE_AFTER_FINAL_CLOSE.json'),
    'rootRulings': ['No current concrete Product defect remains in the reviewed native06 code delta; missing proof is not supplied by that review.', 'Retry-entry producer remains stale and three required cases did not execute.', 'Native UAT preparation refusal is operator carriage overflow, not a failed assessment or new Product defect.', 'Keep all original R1-R7/C1-C5 open until their exact final conjunction is supported.'],
    'nextContinuationSelected': True, 'selection': str(selection_path), 'selectionPin': pin(selection_path),
    'additionalProductWritePaths': [T + 'test_env/tests/t287-exact-construction-intent.test.mjs'],
    'conditionalOwnerEffects': [], 'permittedProductEffects': {'paths': changed_proof, 'effects': 'Only selected tests/support/HOW proof completion and current retry producer migration; no Product code/law change. Wider observed source paths are custody, not repair scope.'},
    'additionalReadPaths': [T + 'test_env/tests/t287-exact-construction-intent.test.mjs'],
    'selectedResiduals': ['Current retry-entry producer with all three current cases and original controls', 'Finite actual validation-fork and successive-cut budget queries', 'Current-intent complete pair, actual unrelated Run, duplicate ambiguity and bounded RAW F_H premise', 'Precise separate allocation units and source-derived bound', 'Complete original caller/R1-R7/C1-C5 dispositions; actual C2, required independent review, UAT and fresh closure'],
    'affectedLanes': recipe['lanes'], 'retainedEvidence': retained,
    'retainedEvidenceManifest': pin(A / 'NATIVE07_EVIDENCE_REUSE.json'),
    'requiredNoSkips': ['All five newly selected lanes', 'Every changed retry/fork/pair/allocation claim; no missing case earns credit from old lanes'],
    'excludedHistoricalBranches': old['excludedHistoricalBranches'],
    'nativeAbsoluteTimeoutMs': 9000000, 'nativeInactivityTimeoutMs': 7200000,
    'outerTimeoutMs': 18000000, 'helperShellTimeoutMs': 7200000,
    'proofCommandTimeoutMs': recipe['proofCommandTimeoutMs'],
    'budgetRationale': 'Retain existing 150min native absolute,120min inactivity/helper and5h outer ceilings; reduce affected C2 proof command to45min by conditionally reusing eight unchanged passing lanes. Expected Worker35-60min/C2 10-25min are estimates, not timeout or retry rules. Final installed-owner budget check is required.',
    'operatorControls': {'wrapper': pin(X / 'native07-c2-proof-template.mjs'), 'capacityTriage': pin(capacity), 'promptCapUnchanged': True, 'packStdout': 'filename only; actual archive/digests retained before fixture cleanup', 'fullProof': 'Actual helper-observed file and exact locator/digest; no duplicated full proof in stdout'},
    'timing': pin(A / 'STAGE_TIMING_COMPLETE.json'),
    'forbidden': old['forbidden'], 'closure': {'originalOutcomeAccepted': False, 'qualified': False, 'published': False, 'nextNativeDispatched': False}}
write(A / 'ROOT_CONJUNCTION.json', conjunction)
print(json.dumps({'status': 'ROOT_SELECTED_NATIVE07_PREPARATION', 'selection': pin(selection_path), 'conjunction': pin(A / 'ROOT_CONJUNCTION.json'), 'reuse': pin(A / 'NATIVE07_EVIDENCE_REUSE.json'), 'guardedFiles': len(unchanged), 'excludedRows': len(excluded), 'newExecution': False}))
