from pathlib import Path
import datetime, hashlib, json, os, stat

D = Path(__file__).resolve().parent
G = D.parent
C = G / 'final-candidate-construction-03'
P = G / 'rc1-s03-input-preparation-01'
H = G / 'f11-carrier-installed-input-preparation-01'

def read(p):
    return json.loads(p.read_text())

def sha(p):
    h = hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

def record(p):
    return {'path': str(p), 'bytes': p.stat().st_size, 'sha256': sha(p)}

def save(name, value):
    with (D / name).open('x') as f:
        json.dump(value, f, indent=2)
        f.write('\n')

def verify(root, records):
    for r in records:
        p = root / r['path']
        assert p.is_file() and p.stat().st_size == r['bytes'] and sha(p) == r['sha256'], str(p)
    return len(records)

grant = G / 'rc1-c03-installed-discriminators-controls-01/s03-request.txt'
acceptance = G / 'rc1-c03-acceptance-01/acceptance.json'
assert sha(grant) == '58331ab54f4b9da983f627bbd273d332d9554560adae0fc9caa566cd14047651'
assert sha(acceptance) == 'bc9b3004543d2338487cb76f8ab98f44181d1b0a58421a53d2d734a4a0491e5f'
assert sha(C / 'final-freeze.json') == 'a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'
assert sha(P / 'freeze.json') == '86992e2d7be5ca6c59d9c049b29fb8f65d11fc68ad7c652ecf82993b5cc087ec'

freeze_records = verify(C, read(C / 'final-freeze.json')['records'])
source_records = verify(C, read(C / 'final-source-freeze-manifest.json')['members'])
identity = read(C / 'final-package-identity.json')
archive_members = read(C / 'final-archive-members.json')
bootstrap_members = verify(Path(identity['packageRoot']), archive_members)
runtime_core = D / 'resources/installed/core/node_modules/@abiogenesis/typescript-tenant'
runtime_members = verify(runtime_core, archive_members)
preparation_records = verify(P, read(P / 'freeze.json')['records'])
external_pins = read(P / 'source-pins.json')['records']
external_close_changes = []
for r in external_pins:
    p = Path(r['path'])
    current = record(p)
    if current['bytes'] != r['bytes'] or current['sha256'] != r['sha256']:
        external_close_changes.append({'preparationPin': r, 'current': current})
origins = read(D / 'input-correspondence.json')['originalCopiesAndCallerOrigins']
for r in origins:
    if r.get('copiedByteExact'):
        assert sha(D / r['path']) == r['sha256'] == sha(Path(r['origin']))
donor = read(P / 'donor-selection.json')
assert sha(Path(donor['archive']['path'])) == donor['archive']['sha256']
preservation = {
    'C03Freeze': record(C / 'final-freeze.json'),
    'C03FreezeRecordsVerified': freeze_records,
    'C03SourceMembersVerified': source_records,
    'C03Archive': record(Path(identity['artifactPath'])),
    'bootstrapPayloadMembersVerified': bootstrap_members,
    'newRuntimePayloadMembersVerified': runtime_members,
    'S03PreparationFreeze': record(P / 'freeze.json'),
    'S03PreparationRecordsVerified': preparation_records,
    'externalPinsVerifiedBeforeEffects': len(external_pins),
    'externalPinsUnchangedAtClose': len(external_pins) - len(external_close_changes),
    'externalChangesAtClose': external_close_changes,
    'fixtureArchive': record(Path(donor['archive']['path'])),
    'originalCopiesUnchanged': [r['path'] for r in origins if r.get('copiedByteExact')],
    'candidateSourceFixtureRepairEffects': 0,
    'comparisonScope': 'Frozen C03 source, construction reports/archive, bootstrap payload, new ordinary runtime payload, closed S03 preparation and original donor bytes.'
}
save('preservation.json', preservation)

call = read(D / 's03-conformance-s03.jsonl')
receipt = read(D / 's03-conformance-s03-stdout.json')['receipt']
resources = call['invocation']['resources']
owner_keys = {'kind', 'schemaVersion', 'packet', 'conformanceLaw', 'declaredInventory', 'declarationCatalog'}
after_wrapper = set(resources) - {'admissionAuthority'}
assert after_wrapper - owner_keys == {'artifactTruth'}
assert owner_keys - after_wrapper == set()
assert receipt['ownerOutput'] is None and receipt['exitCode'] == 70
fault = receipt['failure']['fault']
assert fault['stage'] == 'resource_admission' and fault['code'] == 'invalid_resource_assertion'
source = C / 'final-source/build_tenants/abiogenesis/typescript/code/src/validator/conformance_definition_bindings.ts'
source_member = next(r for r in read(C / 'final-source-freeze-manifest.json')['members'] if r['path'].endswith('/conformance_definition_bindings.ts'))
assert sha(source) == sha(Path(source_member['origin']))
comparisons = []
for name, expected_exit, expected_extra in [
    ('rc1-s02-substitution-01/s02-conformance-hello-substitute.jsonl', 0, set()),
    ('rc1-s02-continuation-02/s02-conformance-hello-compose.jsonl', 0, set()),
    ('final-native-setup-03/setup-conformance-hello-world.jsonl', 70, {'artifactTruth'}),
]:
    p = G / name
    prior = read(p)
    prior_output = p.with_name(p.name.replace('.jsonl', '-stdout.json'))
    prior_receipt = read(prior_output)['receipt']
    keys = set(prior['invocation']['resources']) - {'admissionAuthority'}
    assert keys - owner_keys == expected_extra
    assert prior_receipt['exitCode'] == expected_exit
    assert prior['invocation']['invocation']['definitionDigest'] == call['invocation']['invocation']['definitionDigest']
    comparisons.append({
        'packet': record(p), 'receipt': record(prior_output),
        'resourceKeys': sorted(prior['invocation']['resources']),
        'extraOwnerResourceKeys': sorted(keys - owner_keys),
        'exitCode': prior_receipt['exitCode'],
        'outcomeKind': None if prior_receipt['ownerOutput'] is None else prior_receipt['ownerOutput']['outcomeKind'],
        'sameDefinitionDigestAsC03Call': True,
        'interpretation': 'historical successful exact caller contract' if expected_exit == 0 else 'historical same malformed caller pattern',
        'C03ScenarioCredit': False,
    })
root_cause = {
    'kind': 'multi_frame_first_failure_triage',
    'activation': 'T287_RC1_S03_INSTALLED_PAIR_03',
    'selectedOutcome': 'Original S03a positive correction and truthful no_action pair on accepted C03',
    'firstViolatedRelation': 'The external caller passes artifactTruth after admissionAuthority is stripped, but the installed conformance owner requires an exact packet without artifactTruth.',
    'actualFault': fault,
    'faultReceipt': record(D / 's03-conformance-s03-stdout.json'),
    'submittedCall': record(D / 's03-conformance-s03.jsonl'),
    'submittedResourceKeys': list(resources),
    'ownerResourceKeys': sorted(owner_keys),
    'extraOwnerResourceKeys': ['artifactTruth'],
    'ownerSource': {**record(source), 'lines': [329, 342]},
    'sameC02OwnerSource': record(Path(source_member['origin'])),
    'admissionWrapper': {**record(C / 'final-source/build_tenants/abiogenesis/typescript/code/src/product/admission_authority.ts'), 'lines': [307, 334]},
    'callerOrigins': [r for r in origins if r['path'] == 'ordinary-caller.mjs'],
    'donorHelper': record(H / 'ordinary-caller.mjs'),
    'historicalComparisons': comparisons,
    'frames': [
        {'frame': 'Product/Owner', 'finding': 'Existing conformance owner already defines the exact resource assertion; no new Product capability or source contract is needed.'},
        {'frame': 'Design/Effects', 'finding': 'The exact admitted boundEnvironment supplies artifact truth. The caller-supplied artifactTruth is neither required nor accepted.'},
        {'frame': 'Integration', 'finding': 'The external proof helper retained a stale resource field instead of consuming the current owner assertion. Admission removes admissionAuthority only, so the extra field reaches exact-key validation.'},
        {'frame': 'Identity', 'finding': 'C03 archive/bootstrap/runtime payload and frozen source are unchanged; this conformance owner source and definition digest agree with the historical successful S02 contract.'},
        {'frame': 'Lifecycle', 'finding': 'The failure is before Program conformance result and before either start. Last genuine catalog/View close handoff remains the valid continuation basis.'},
        {'frame': 'Proof', 'finding': 'Preparation syntax, inventory and hash checks did not establish the caller-to-owner resource join. Previously successful S02 callers already omit the extra key. This attempt supplied an observed counterexample, not S03 pair acceptance.'},
        {'frame': 'Reuse/Cost', 'finding': 'A stale helper was reused despite available successful caller evidence. Repeating packaging, installation or Hello would not address this relation; current admitted setup and exact prefix are reusable subject to Root selection.'},
    ],
    'supportedCause': 'Stale external conformance helper reused without joining its exact resource keys to the unchanged installed owner contract.',
    'escape': 'Preparatory checks established syntax/bytes/declaration correspondence but did not check the conformance assertion shape against the actual owner or successful retained callers.',
    'missingEndToEndJoin': 'External caller assertion -> admission stripping -> exact owner resource contract -> environment-derived artifact truth.',
    'applicabilityCone': ['S03 ordinary Public conformance caller', 'the shared F11 preparation helper and copies of its conformance method'],
    'implementationDefectEstablished': False,
    'smallestReentry': 'realization_refactor',
    'repairOwner': 'External caller/proof preparation under a separate exact Root Worker activation',
    'minimumRepair': 'Omit artifactTruth from the caller conformance assertion, then derive the exact resource digest, approval and grants again from the genuine current handoff. Keep catalog, inventory, Program, fixture and installed C03 unchanged.',
    'minimumReproof': 'Actual installed conformance result, original two S03a starts, original causal oracles and eight separate fresh Public CLI reads on the same exact C03 and original fixture. Preserve the existing three-event prefix as historical input; Root selects its lawful reuse.',
    'repairsOrRetriesPerformed': 0,
    'notification': 'Root was told immediately after the first failure, then given the caller/owner cause and applicability to parallel F11.',
}
save('root-cause.json', root_cause)

failure = read(D / 'failure.json')
calls = failure['actualCalls']
assert len(calls) == 10 and calls[-1]['label'] == 'conformance-s03'
assert all(c['outcomeKind'] == 'result' for c in calls[:-1])
assert not any(c['definitionKey']['operationId'] == 'abg.operation.program.start' for c in calls)
processes = []
for c in calls:
    name = 's03-' + c['label']
    process = read(D / (name + '-native-process.json'))
    timing = read(D / (name + '-timing.json'))
    assert process['signal'] is None and timing['terminal']['signal'] is None and not timing['terminal']['timedOut']
    assert process['exitCode'] == (70 if c['label'] == 'conformance-s03' else 0)
    processes.append({'label': c['label'], **process, 'terminal': timing['terminal'], 'stageElapsedMs': timing['elapsedMs']})
driver = read(D / 'driver-process.json')
assert driver['ownedExitObserved'] and driver['exitCode'] == 1 and driver['signal'] is None and not driver['timedOut']
cost = {
    'actualNativePublicCalls': len(processes),
    'successfulSetupCalls': len(processes) - 1,
    'failedConformanceCalls': 1,
    'ProgramStarts': 0,
    'freshResultReplayStatusGapsReads': 0,
    'providerModelCalls': 0,
    'networkGitSourceBuildFixtureRepairEffects': 0,
    'driver': driver,
    'totalNativeCLIElapsedMs': sum(p['elapsedMs'] for p in processes),
    'totalStageElapsedMs': sum(p['stageElapsedMs'] for p in processes),
    'maximumNativeCLIPeakRSSBytes': max(p['peakRSSBytes'] for p in processes),
    'sumPerCallPeakRSSBytes': sum(p['peakRSSBytes'] for p in processes),
    'RSSInterpretation': 'Sum of independent per-call peaks is recorded input, not concurrent peak memory or model traffic.',
    'nativeUserSeconds': sum(p['userSeconds'] for p in processes),
    'nativeSystemSeconds': sum(p['systemSeconds'] for p in processes),
    'processes': processes,
    'allOwnedExitsObserved': True,
    'noTimeoutOrSignal': True,
    'cleanupCalls': driver['cleanup'],
}
save('cost-and-process-closure.json', cost)

physical = read(D / 'failure-final-physical.json')
path = Path(physical['path'])
before = path.stat()
actual_raw = path.read_bytes()
after = path.stat()
assert (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
assert len(actual_raw) == physical['bytes'] == 2490961
assert hashlib.sha256(actual_raw).hexdigest() == physical['sha256']
assert (before.st_dev, before.st_ino) == (physical['device'], physical['inode'])
assert actual_raw == (D / 'failure-final-prefix.jsonl').read_bytes()
assert not Path(physical['lockPath']).exists()
handoff = read(D / 'failure-final-handoff.json')
assert handoff == read(D / 's03-catalog-view-handoff.json')['closeHandoff']
assert handoff == read(D / 's03-conformance-s03-handoff.json')['closeHandoff']
events = [json.loads(line) for line in actual_raw.splitlines() if line]
assert len(events) == 3 and all(e['kind'] == 'public_operation_artifact_admitted' for e in events)
assert not any(e['kind'] == 'run_segment_opened' for e in events)
physical_close = {
    **physical,
    'verifiedAtClose': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'eventCount': len(events), 'RunCount': 0,
    'eventKinds': [e['kind'] for e in events],
    'eventRefs': [e['eventId'] for e in events],
    'noConformanceAppend': True,
    'sameGenuineCatalogViewAndFailureHandoff': True,
    'failurePrefixByteExact': True,
    'emptyPairTerritories': {'positive': list((D / 'positive').iterdir()) == [], 'no-action': list((D / 'no-action').iterdir()) == []},
    'sourceAndCoreReadonly': True,
}
save('physical-prefix-closure.json', physical_close)

root_text = f'''# S03 installed pair: first failure and triangulated caller cause

Activation `T287_RC1_S03_INSTALLED_PAIR_03` is CLOSED at the first actual failure. C03 conformance rejected the external caller's extra `artifactTruth` resource key before either S03 start. The positive/no_action pair and eight fresh Public reads are unexecuted. No candidate implementation defect is established.

The installed owner returned CLI exit 70, `typed_execution_fault`, `resource_admission / invalid_resource_assertion`, with no owner output. The receipt says “GTL Program conformance requires one exact typed publication and Program packet.” The actual submitted assertion has the six permitted owner keys plus `artifactTruth`; the admission wrapper removes only `admissionAuthority`.

| Frame | Supported relation |
|---|---|
| Product / Owner | The existing conformance owner defines an exact assertion. Its contract does not require another runtime mechanism. |
| Design / Effects | Artifact truth comes from the admitted `boundEnvironment`; the caller's duplicate field is unaccepted. |
| Integration | The borrowed F11 preparation helper submits a stale resource shape. That field survives the wrapper into exact-key validation. |
| Identity | The C03 owner source matches its C02 preimage byte for byte, `{sha(source)}`. The definition digest matches both successful S02 comparison calls. C03 source, archive, bootstrap and new runtime payload were reverified unchanged. |
| Lifecycle | Conformance failed before any Program start. The genuine catalog/View close handoff remains the continuation basis. |
| Proof | Syntax, hash and catalog correspondence checks did not verify this caller-to-owner assertion relation. Existing accepted S02 callers already omit the field. |
| Reuse / Cost | Reusing the stale helper ignored available successful caller evidence. Current admitted installation, binding, catalog and View can supply a bounded continuation basis; Root selects reuse. |

The supported cause is external proof caller reconstruction without consuming the exact owner resource contract. The missing integration join is caller assertion → admission stripping → exact owner shape → admitted environment truth. This is a caller/proof preparation realization defect; it does not require ABG calculus, Product, fixture or core source change.

The unchanged frozen owner is [conformance_definition_bindings.ts]({source}:329), and the wrapper is [admission_authority.ts]({C / 'final-source/build_tenants/abiogenesis/typescript/code/src/product/admission_authority.ts'}:307). Compare historical successful [S02 substitution]({G / 'rc1-s02-substitution-01/s02-conformance-hello-substitute.jsonl'}) and [S02 composition]({G / 'rc1-s02-continuation-02/s02-conformance-hello-compose.jsonl'}) packets, both with exit 0 and the same definition digest. The retained [N03 packet]({G / 'final-native-setup-03/setup-conformance-hello-world.jsonl'}) already contains the same extra key and exit-70 failure. These are contract comparisons, not C03 scenario credit.

Smallest re-entry is `realization_refactor` in the external caller/proof preparation. A separate Root activation can remove `artifactTruth` from the assertion and derive its approval, resource digest and grants again from the actual current close handoff. Keep the original Program, fixture, oracles, C03 and bound catalog unchanged. Reprove installed conformance, the original two S03a starts, original causal oracles and eight separate fresh Public Result/replay/status/gaps reads. The shared F11 helper has the same applicability; Root has been alerted.

The store is conserved at {len(actual_raw):,} bytes, three setup admission events, zero Runs, device {before.st_dev}, inode {before.st_ino}. Raw digest `{physical['sha256']}` and the genuine handoff agree with the preserved failure snapshot. Conformance appended no event; the lock is absent. All ten native CLI exits and the driver exit were observed; no timeout or signal occurred. No retry or repair was performed.

Full measured cause, evidence pins, historical comparisons and reproof scope are in [root-cause.json]({D / 'root-cause.json'}). [physical-prefix-closure.json]({D / 'physical-prefix-closure.json'}), [preservation.json]({D / 'preservation.json'}) and [cost-and-process-closure.json]({D / 'cost-and-process-closure.json'}) bind the closed boundary.
'''
with (D / 'root-cause.md').open('x') as f:
    f.write(root_text)
returned = f'''# T287 C03 installed S03a pair — CLOSED first failure

The selected pair stopped at ordinary Public Program conformance, before either start. The external caller passed an extra `artifactTruth` key; the unchanged installed owner rejects it. Successful retained S02 callers already provide the correct assertion. [Triangulated root cause]({D / 'root-cause.md'}) localizes repair to external caller/proof preparation, `realization_refactor`.

Nine ordinary setup calls succeeded: clean workspace, exact Product verify/resolve/install, binding, catalog and View. The tenth call returned exit 70 / `resource_admission` / `invalid_resource_assertion`. No Runtime oracle was reached; the positive correction, truthful no_action case and eight fresh CLI reads remain unproved on C03.

The sole C03 is unchanged. Closure reverified {freeze_records} construction freeze records, {source_records} frozen source members, {bootstrap_members} bootstrap payload members and {runtime_members} new ordinary installed payload members, plus all {preparation_records} closed S03 preparation records and original copied fixture/oracle material. External pins were verified before effects; current close correspondence is explicit in preservation.json.

Three setup events and zero Runs are retained. The same genuine catalog/View handoff identifies the physical {len(actual_raw):,}-byte store, dev/inode `{before.st_dev}/{before.st_ino}`, raw SHA `{physical['sha256']}`. Failure snapshot and current store match; conformance appended no event and no lock remains.

Actual driver elapsed was {driver['elapsedMs']/1000:.3f}s within its 1,200s budget; all ten native calls and the driver exited without timeout or signal. Maximum native CLI peak RSS was {cost['maximumNativeCLIPeakRSSBytes']:,} bytes. Provider/model calls, source/build/fixture/core mutations, network and Git effects were zero. Full measured costs are retained; no broad suites or Hello lifecycle were repeated.

No retry or repair was performed. Root alone selects a separate exact caller repair/continuation on the preserved admitted setup and same C03. F11 helper applicability was reported immediately. This return makes no qualification, acceptance, full-S03, F11, AF22 or release claim. Runtime effects and report writes stop at freeze.
'''
with (D / 'return.md').open('x') as f:
    f.write(returned)
save('closed-state.json', {
    'status': 'CLOSED', 'activation': 'T287_RC1_S03_INSTALLED_PAIR_03',
    'workResult': 'first_failure_stopped', 'actor': '/root/rc1_successor_builder',
    'role': 'Runtime-only Worker', 'qualificationClaim': False, 'acceptanceClaim': False,
    'actualNativeCalls': len(processes), 'ProgramStarts': 0, 'freshReadbacks': 0,
    'providerModelCalls': 0, 'repairsRetries': 0, 'allOwnedExitsObserved': True,
    'candidateSourceFixtureReadonly': True, 'physicalEventCount': len(events),
    'lastGenuineHandoff': 'failure-final-handoff.json', 'writeStop': 'After freeze.json creation; no further writes by this activation.',
})

records = []
directories = []
for root, dirs, names in os.walk(D, followlinks=False):
    for name in list(dirs):
        p = Path(root) / name
        if p.is_symlink():
            names.append(name)
            dirs.remove(name)
        else:
            directories.append(str(p.relative_to(D)))
    for name in names:
        p = Path(root) / name
        if p.name == 'freeze.json' and p.parent == D:
            continue
        st = p.lstat()
        r = {'path': str(p.relative_to(D)), 'mode': stat.S_IMODE(st.st_mode)}
        if p.is_symlink():
            target = os.readlink(p)
            resolved = p.resolve()
            assert resolved.is_relative_to(D) and resolved.exists(), str(p)
            r.update({'kind': 'symlink', 'target': target, 'targetResolved': str(resolved)})
        else:
            assert p.is_file(), str(p)
            r.update({'kind': 'file', 'bytes': st.st_size, 'sha256': sha(p)})
        records.append(r)
records.sort(key=lambda r: r['path'])
freeze = {
    'kind': 'installed_s03a_pair_first_failure_freeze', 'status': 'CLOSED',
    'activation': 'T287_RC1_S03_INSTALLED_PAIR_03', 'actor': '/root/rc1_successor_builder',
    'role': 'Runtime-only Worker', 'workResult': 'first_failure_stopped',
    'frozenAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'request': record(grant), 'RootAcceptance': record(acceptance),
    'C03Freeze': record(C / 'final-freeze.json'), 'S03PreparationFreeze': record(P / 'freeze.json'),
    'qualificationClaim': False, 'acceptanceClaim': False, 'ProgramStarts': 0, 'freshReadbacks': 0,
    'return': 'return.md', 'triage': 'root-cause.json', 'records': records,
    'directories': sorted(directories),
    'inventory': {'files': sum(r['kind'] == 'file' for r in records), 'symlinks': sum(r['kind'] == 'symlink' for r in records), 'fileBytes': sum(r.get('bytes', 0) for r in records)},
    'stop': 'All owned native processes exited; first failure retained; no retries or repairs; this Worker stops all effects/writes at freeze. Root separately assures and selects any continuation.',
}
save('freeze.json', freeze)
print(json.dumps({'status': 'CLOSED', 'workResult': freeze['workResult'], 'freeze': record(D / 'freeze.json'), 'inventory': freeze['inventory'], 'externalCloseChanges': len(external_close_changes), 'eventCount': len(events), 'RunCount': 0}))
