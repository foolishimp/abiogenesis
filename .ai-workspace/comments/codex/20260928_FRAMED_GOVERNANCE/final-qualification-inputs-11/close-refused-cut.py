"""Close the first actual Q11 preparation refusal; no owner call or retry."""
from pathlib import Path
from collections import defaultdict
import datetime, hashlib, json, os, stat
Q = Path(__file__).resolve().parent
assert not (Q / 'freeze.json').exists()
def read(p):
    return json.loads(Path(p).read_bytes())
def pin(p):
    p = Path(p)
    with p.open('rb') as f:
        digest = hashlib.file_digest(f, 'sha256').hexdigest()
    return {'path': str(p), 'bytes': p.stat().st_size, 'sha256': digest, 'mode': stat.S_IMODE(p.stat().st_mode)}
def put(name, value):
    p = Q / name
    with p.open('x') as f:
        f.write(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
first = read(Q / 'first-readiness-refusal.json')
task = read(Q / 'readiness-result.json')
failure = read(Q / 'f11-packet-readiness.json')
command = read(Q / 'command-supervisor-close.json')
packet = read(Q / 'packet-supervisor-close.json')
assert task['workResult'] == 'GO_MECHANICAL_ONLY' and command['exitCode'] == 0
assert failure['workResult'] == 'NO_GO' and packet['exitCode'] == 2
assert first['actualMatches'] == 0 and first['matchedPaths'] == []
assert all(r['wait4Reaped'] and r['groupAfterWait'] == 'absent' and not r['timedOut'] for r in (command, packet))
labels = first['currentQ11SourceOriginsLabelCounts']
assert labels == {'accepted_actual_callback_lineage_component_regression': 1, 'immutable_C07_input_preimage': 1101, 'owning_HOW_or_current_tracking': 2, 'shared_functional_typed_evidence_join': 7}
assert all(first[k] == labels for k in ('originalQ10SourceOriginsLabelCounts', 'originalC09CutLabelCounts', 'originalC09SupplierLabelCounts', 'currentDerivedSupplierLabelCounts'))
assert len(first['currentC09SelectedSourceChanges']) == 9
inventory = read(Q / 'qualification-inventory.json')
origins = read(Q / 'inventory-origin-correspondence.json')
by_ref = {m['ref']: m for m in inventory['members']}
assert len(by_ref) == len(inventory['members']) == 4643
roles = defaultdict(lambda: {'members': 0, 'rawBytes': 0, 'base64Bytes': 0})
for o in origins:
    m = by_ref[o['ref']]
    role = roles[o.get('sourceRole', 'unknown')]
    role['members'] += 1
    role['rawBytes'] += m['byteCount']
    role['base64Bytes'] += 4 * ((m['byteCount'] + 2) // 3)
assert {o['ref'] for o in origins} == set(by_ref)
raw = sum(m['byteCount'] for m in by_ref.values())
encoded = sum(4 * ((m['byteCount'] + 2) // 3) for m in by_ref.values())
assert (raw, encoded) == (358765630, 478360272)
auth = read(Q / 'f11/source-authorship-records.json')
assert len(auth['records']) == 174 and len(auth['chains']) == 23
spans = sum(len(c['attributionSources']) for c in auth['chains'])
assert spans == 90
old_auth = read(Q.parent / 'final-qualification-inputs-10/f11/source-authorship-records.json')
assert auth['records'] == old_auth['records'] and auth['chains'] == old_auth['chains']
projection = {'sourceOriginsContainer': pin(Q / 'f11/source-authorship-records.json'), 'derivedCurrentSourceSupplier': pin(Q / 'current-source-supplier-view.json'), 'conservationReceipt': pin(Q / 'metadata-projection-conservation.json'), 'originalQ10SourceAuthContainer': pin(Q.parent / 'final-qualification-inputs-10/f11/source-authorship-records.json'), 'records': 174, 'chains': 23, 'spans': 90, 'original174RecordValuesAnd23ChainsUnchanged': True, 'retainedQ09RecordsChainsSpans': [121, 12, 46], 'currentSourceRows': 1111, 'sourceAuthSufficiency': 'unknown', 'independence': 'unknown', 'newAuthorshipFromProjection': False}
meaning = {'immutable_C07_input_preimage': {'count': 1101, 'meaning': 'Inherited immutable C07 Source preimages preserved by C09; not new typed C09 changes.'}, 'shared_functional_typed_evidence_join': {'count': 7, 'meaning': 'Five existing production Source replacements (c_call, c_call_outcome, implementation/contracts, leaf_invocation_port, product/semantics) plus new result_evidence_lineage_contracts.ts and new type-contract test. Exact original authors and row pins are retained in currentC09SelectedSourceChanges.'}, 'owning_HOW_or_current_tracking': {'count': 2, 'meaning': 'C09 owning HOW T287_F11_CARRIER_RESOURCE_DESIGN.md and current T-287 tracking replacements, authored by Root Writer.'}, 'accepted_actual_callback_lineage_component_regression': {'count': 1, 'meaning': 'Current inherited callback lineage regression t287-result-evidence-lineage-projection.test.mjs, retained from the accepted predecessor; not one of C09 typed-cut nine new increments.'}}
put('actual-population-and-byte-decomposition.json', {'inventoryMembers': len(by_ref), 'effectiveSourceGeneratedMembers': len(read(Q / 'source-inventory.json')), 'selectedSourceMembers': 1111, 'generatedRosterRows': 928, 'expectedPhysicalOutputMembers': 929, 'derivedAuthorityPreimages': len(read(Q / 'donor-authority-preimages.json')), 'historicalComponentMembers': len(read(Q / 'component-stage-plan.json')['members']), 'protectedInputs': task['protectedInputs'], 'protectedBytes': task['protectedBytes'], 'inventoryRawBodyBytes': raw, 'inventoryBase64BodyBytes': encoded, 'bySourceRole': dict(sorted(roles.items())), 'largestCurrentInventoryBodies': [{'ref': m['ref'], 'path': m['path'], 'bytes': m['byteCount'], 'digest': m['digest']} for m in sorted(by_ref.values(), key=lambda m: m['byteCount'], reverse=True)[:12]], 'actualFullResourceSerializationBytes': None, 'actualAssertionSerializationBytes': None, 'actualPromptBytes': None, 'resourceVolumeStatus': 'Later reference resource/assertion serialization was not reached; pre-payload bounds are forecasts only.'})
put('selected-relation-correspondence.json', {'allFiveOriginalCurrentLabelCounts': {k: first[k] for k in ('originalQ10SourceOriginsLabelCounts', 'originalC09CutLabelCounts', 'currentQ11SourceOriginsLabelCounts', 'originalC09SupplierLabelCounts', 'currentDerivedSupplierLabelCounts')}, 'all1111CurrentLabelsUnchanged': True, 'currentLabelMeanings': meaning, 'staleExternalWhitelist': first['whitelist'], 'matchedCount': 0, 'matchedPaths': [], 'selectedCurrentC09Changes': first['currentC09SelectedSourceChanges'], 'failedPredicate': first['failedPredicate'], 'producer': first['producer'], 'consumer': first['consumer'], 'noLabelsAlteredToGainAcceptance': True})
result = {'status': 'CLOSED', 'role': 'Worker', 'actor': '/root/q03_input_review', 'operation': 'T287_FINAL_QUALIFICATION_INPUTS_11', 'workResult': 'NO_GO_EXTERNAL_SUCCESSOR_DELTA_SELECTOR', 'reentry': 'realization_refactor of external preparation', 'ProductFrame': 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration; unchanged WHAT and accepted HOW/runtime', 'candidate': read(Q / 'candidate-binding.json'), 'currentDependencyPin': pin(Q / 'current-dependency-pin.json'), 'actualSetupCoordinates': pin(Q / 'f11/actual-setup-coordinates.json'), 'completeTaskPass': {'taskRef': task['taskRef'], 'taskDigest': task['taskDigest'], 'commands': task['commands'], 'predicates': task['predicates'], 'protectedInputs': task['protectedInputs'], 'protectedBytes': task['protectedBytes'], 'producerDigests': task['actualTaskDigests'], 'receipt': pin(Q / 'readiness-result.json'), 'RuntimeAdmission': False}, 'firstActualRefusal': first, 'selectedRelations': pin(Q / 'selected-relation-correspondence.json'), 'actualExecutedFrontier': first['actualCompletedBeforeStop'], 'notReached': first['notReached'], 'projectionConservation': projection, 'populations': read(Q / 'actual-population-and-byte-decomposition.json'), 'retainedStrictCaller': pin(Q / 'f11/ordinary-caller.mjs'), 'retainedParentChildDriver': pin(Q / 'f11/flow-driver.mjs'), 'processClosures': {'completeTask': command, 'packet': packet}, 'effects': {'SourceChanges': 0, 'builds': 0, 'qualificationCommandsExecuted': 0, 'nativeTaskRunJHelperProviderCalls': 0, 'eventOrResourceReopening': 0, 'candidateChanges': 0, 'GitEffects': 0, 'networkEffects': 0}, 'unknowns': ['Actual complete reference resource/assertion bytes, identity, published reference owner preparation and current reference request/prompt readiness', 'Semantic applicability/material sufficiency/context/grouping/source attribution/independence', 'Actual installed parent/child/J/foldback/F11/AF22/cold traversal and eighteen-command qualification/QUAL056', 'Release acceptance and human ruling'], 'noProductDefectInferred': True, 'retries': 0, 'budgetChanges': 0, 'noAutonomousRepair': True, 'independentAssuranceClaim': False, 'consumer': 'Root Executive', 'allWritesStopAfterFreeze': True}
put('worker-result.json', result)
put('accounting.json', {'actualPayloads': 2, 'completeTask': command, 'packet': packet, 'actualCompleted': first['actualCompletedBeforeStop'], 'prePayloadForecasts': first['predictedLaterVolumes'], 'actualResourceSerializationBytes': None, 'actualAssertionSerializationBytes': None, 'actualEmbeddedRequestOrPromptBytes': None, 'embeddedRendererReturned': True, 'requestAndPromptBytesNotRetainedAtFirstStop': True, 'actualReferenceRequestOrPromptBytes': None, 'forecastNotActualOwnerEvidence': True, 'defaultHeap': True, 'ordinaryHOME': '/Users/jim', 'allPayloadsWait4ReapedGroupsAbsent': True, 'qualificationCommandsExecuted': 0, 'nativeCalls': 0, 'retries': 0})
put('closure.json', {'status': 'CLOSED', 'role': 'Worker', 'operation': result['operation'], 'workResult': result['workResult'], 'closedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'writesStopAfterFreeze': True, 'returnsTo': 'Root Executive', 'noRetryOrRepair': True, 'independentAssuranceClaim': False})
return_text = '''CLOSED Q11: NO_GO_EXTERNAL_SUCCESSOR_DELTA_SELECTOR.

The complete published command Task passed with 3,294 protected inputs/252,164,602 bytes; 18 commands and 19 predicates remain unexecuted. Task digest 04d68a12df4533de8f2b96011bb84f531bacedfab8a2b43c4d5a985ad9a0c263.

The first packet refusal is prepare-resources.mjs:22, lawfulSuccessorChanges.sourceChanges.length > 0. current-resources.mjs:170 filters by four inherited labels. Exact matches: 0 of 1,111 current rows. Original Q10 origins, immutable C09 cut, current Q11 origins, original C09 supplier and current derived supplier all preserve the same counts: immutable_C07_input_preimage 1,101; shared_functional_typed_evidence_join 7; owning_HOW_or_current_tracking 2; accepted_actual_callback_lineage_component_regression 1. The seven typed rows are five production replacements plus the new shared module and type test; the two HOW/tracking replacements belong to Root Writer; the callback regression is an inherited accepted predecessor. Exact nine C09 changes, author/path/body/immutable row pins are recorded in selected-relation-correspondence.json. No labels were changed and no Product defect is inferred.

Actual completed stages: scope correspondence; 4,643 individually verified inventory bodies totaling 358,765,630 raw/478,360,272 base64 bytes; 95 authority bodies; published embedded assessment input guard; embedded request renderer returned. Embedded request/prompt bytes were not retained at the first stop. Resource construction, reference owner preparation and current reference request renderer were not reached. Predicted later resource 504,137,345 bytes and assertion 523,257,131 bytes are pre-payload upper bounds, not measured outputs or owner evidence.

All 174 original records/23 chains/90 spans and prior 121/12/46 are unchanged; both projections retain truthful derived identity and immutable row references. Source attribution sufficiency and independence remain unknown. Command exit 0, 6.670s, peak RSS 628,670,464 bytes; packet exit 2, 5.783s, peak RSS 2,568,536,064 bytes. Both wait4 reaped, groups absent, no timeout, default heap/ordinary HOME. No Runtime, Source, candidate, provider, network, Git or qualification-command effect. No repair or retry; Root alone selects continuation.
'''
with (Q / 'return.md').open('x') as f:
    f.write(return_text)
rows, directories = [], []
for p in sorted(Q.rglob('*')):
    if p.is_symlink():
        rows.append({'path': str(p.relative_to(Q)), 'kind': 'symlink', 'target': os.readlink(p), 'mode': stat.S_IMODE(p.lstat().st_mode)})
    elif p.is_file():
        row = pin(p); row['path'] = str(p.relative_to(Q)); rows.append(row)
    elif p.is_dir():
        directories.append({'path': str(p.relative_to(Q)), 'mode': stat.S_IMODE(p.stat().st_mode)})
freeze = {'status': 'CLOSED', 'role': 'Worker', 'operation': result['operation'], 'workResult': result['workResult'], 'records': rows, 'recordCount': len(rows), 'bodyBytes': sum(r.get('bytes', 0) for r in rows), 'directories': directories, 'directoryCount': len(directories), 'linkCount': sum(r.get('kind') == 'symlink' for r in rows), 'candidateFreeze': result['candidate']['constructionFreeze'], 'actualSetupAcceptance': read(Q / 'current-dependency-pin.json')['actualSetupAcceptance'], 'allWritesStopped': True}
put('freeze.json', freeze)
os.chmod(Q / 'freeze.json', 0o444)
print(json.dumps({'status': 'CLOSED', 'workResult': result['workResult'], 'freeze': pin(Q / 'freeze.json'), 'records': len(rows), 'directories': len(directories), 'links': freeze['linkCount'], 'bodyBytes': freeze['bodyBytes']}))
