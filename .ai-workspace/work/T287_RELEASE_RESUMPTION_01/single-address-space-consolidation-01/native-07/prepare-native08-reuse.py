"""Root evidence preparation only, after the actual native07 final close.

No execution credit is reassigned. No Product/test source or old evidence is edited.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

A = Path(__file__).resolve().parent
X = A.parent
S = Path('/Users/jim/src/apps/abiogenesis-single-address-space')
T = 'build_tenants/abiogenesis/typescript/'
read = lambda p: json.loads(p.read_text())
sha = lambda b: hashlib.sha256(b).hexdigest()


def pin(p):
    b = p.read_bytes()
    return {'path': str(p), 'bytes': len(b), 'sha256': sha(b)}


assert (X / 'ROOT_REENTRY_SELECTION_08.md').is_file()
close = A / 'execution/after-run-resume.json'
read(close)
assert (A / 'execution/fresh-reads.json').is_file()
assert (A / 'SOURCE_AFTER_FINAL_CLOSE.json').is_file()
current = read(A / 'ACTUAL_C2_SUMMARY.json')
admitted = read(A / 'NATIVE_C2_CLOSED_RESULT.json')
assert current['status'] == 'ACTUAL_SELECTED_C2_PREDICATES_SATISFIED'
assert current['sourceCorrespondence']['allEqualFrozenSourceAndHandoff']
assert current['protectedBeforeEqualsAfter'] and current['productDelta'] == []
assert current['retainedEvidenceVerification']['unchangedFiles'] == 879
coordinates = read(A / 'C2_HELPER_COORDINATES.json')
task = read(Path(coordinates['task']['path']))
sandbox = Path(coordinates['attempt']['root']) / 'sandbox'
prior = read(X / 'native-06/NATIVE07_EVIDENCE_REUSE.json')
prior_result = prior['actualC2ResultRef']
current_result = admitted['coordinates']['resultRef']
assert prior_result == current['retainedEvidenceVerification']['actualPriorC2ResultRef']
assert current['retainedPriorEvidence'] == prior['retainedLanes']

retained = []
for lane in prior['retainedLanes']:
    retained.append({**lane, 'executionProvenance': {
        'activation': 'native-06', 'resultRef': prior_result,
        'summary': pin(X / 'native-06/ACTUAL_C2_SUMMARY.json'),
        'correspondenceRevalidatedBy': current_result, 'newExecution': False}})
selected_current = {'retry-entry-consumers', 'current-f09-retry-consumers'}
for lane in current['lanes']:
    if lane['id'] in selected_current:
        assert lane['exitCode'] == 0 and lane['fail'] == 0 and lane['skipped'] == 0 and not lane['unmet']
        retained.append({**lane, 'executionProvenance': {
            'activation': 'native-07', 'resultRef': current_result,
            'summary': pin(A / 'ACTUAL_C2_SUMMARY.json'), 'newExecution': False}})
assert len(retained) == 10 and len({l['id'] for l in retained}) == 10

changed = {
    T + 'test_env/tests/t287-single-address-space-consolidation.test.mjs',
    T + 'test_env/support/single-address-space-consolidation.mjs',
    T + 'design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md'}
rewritten = {'TASK.md', 'NATIVE_GRANT.json', 'INPUT_SUFFICIENCY.json',
             'C2_INPUTS.json', 'C2_SELECTED_INPUTS.json', 'c2-proof.mjs',
             'HELD_SOURCE_AND_EVIDENCE.json', 'PRIOR_ACTIVATION_CONJUNCTION.json',
             'PRIOR_ACTUAL_C2_SUMMARY.json', 'PREVIOUS_NATIVE_RETURN.json',
             'NATIVE_UAT_CLOSED_RESULT.json', 'NATIVE_C2_CLOSED_RESULT.json',
             'INDEPENDENT_PROOF_REVIEW.json', 'INDEPENDENT_RUNTIME_PROOF_REVIEW.json',
             'FH_COMPLETION_INTAKE_TRIAGE.json'}
guards, exclusions = [], []
for item in task['protectedObservations']:
    rel = item['subject']['relativePath']
    obs = item['observation']
    assert obs['state'] == 'file'
    b = (sandbox / rel).read_bytes()
    assert len(b) == obs['byteLength'] and 'sha256:' + sha(b) == obs['fileDigest'], rel
    assert (S / rel).read_bytes() == b, rel
    if rel in changed or rel.startswith('consolidation-scratch/native-07/'):
        reason = 'Selected changed F_H proof/HOW or prior handoff; whole-path, shared-owner declarations and current-intent lanes execute again because they import the permitted support file.'
    elif rel.startswith('consolidation-inputs/native-07/') and Path(rel).name in rewritten:
        reason = 'Rewritten continuation control/evidence projection; retained test lanes do not import these controls.'
    else:
        guards.append({'relativePath': rel.replace('consolidation-inputs/native-07/', 'consolidation-inputs/native-08/'),
                       'priorRelativePath': rel, 'bytes': len(b), 'sha256': sha(b)})
        continue
    exclusions.append({'priorRelativePath': rel, 'reason': reason})
assert len(guards) + len(exclusions) == len(task['protectedObservations'])
assert len({f['relativePath'] for f in guards}) == len(guards)
package = read(A / 'actual-c2-001/CANDIDATE_PACKAGE_IDENTITY.json')
archive = Path(package['retainedArchive']['path'])
b = archive.read_bytes()
assert len(b) == package['bytes'] and sha(b) == package['sha256']

record = {
    'kind': 'root_retained_bounded_c2_evidence',
    'status': 'ROOT_SELECTED_FROM_CLOSED_NATIVE07',
    'recordedUtc': datetime.now(timezone.utc).isoformat(),
    'actualC2ResultRef': current_result,
    'sourceSubject': pin(A / 'review-subject-001/SUBJECT.json'),
    'actualC2Close': pin(A / 'NATIVE_C2_CLOSED_RESULT.json'),
    'actualFinalClose': pin(close),
    'sourceAfterClose': pin(A / 'SOURCE_AFTER_FINAL_CLOSE.json'),
    'priorReuseManifest': pin(X / 'native-06/NATIVE07_EVIDENCE_REUSE.json'),
    'packageArchive': {k: package[k] for k in ['relativePath', 'bytes', 'integrity', 'sha256']},
    'priorPackageIdentity': pin(A / 'actual-c2-001/CANDIDATE_PACKAGE_IDENTITY.json'),
    'retainedArchive': pin(archive), 'retainedLanes': retained,
    'unchangedSourceFiles': guards, 'excludedSourceRows': exclusions,
    'selectedChangedProofPaths': sorted(changed),
    'dependencyRelation': 'All actual native07 selected static source/test/helper/config/fixture members are guarded except enumerated changed proof/HOW, prior handoffs and rewritten control projections. Whole-path, shared-owner declarations and current-intent execute again; their tests import the permitted SAS support file. Package bytes remain exact. Each retained lane names its original actual execution; native07 revalidation of native06 evidence is not a new native07 execution.',
    'invalidators': ['Any package-byte mismatch', 'Any guarded file mismatch',
                     'Any newly discovered retained-lane dependency on changed proof/support',
                     'Any changed external immutable-resource identity or original applicability'],
    'credit': {'priorPasses': sum(l['pass'] for l in retained),
               'historicalSkips': sum(l['skipped'] for l in retained), 'newExecution': False},
    'standing': 'Conditional reuse of ten passing lanes; every row retains original native06/native07 execution provenance. No whole-outcome, UAT, qualification or fresh-execution credit.'}
p = A / 'NATIVE08_EVIDENCE_REUSE.json'
with p.open('x') as f:
    f.write(json.dumps(record, indent=2) + '\n')
print(json.dumps({'record': pin(p), 'guards': len(guards), 'exclusions': len(exclusions),
                  'retainedLanes': len(retained), 'credit': record['credit']}))
