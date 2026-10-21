from pathlib import Path
import datetime, hashlib, json, posixpath, re, tarfile

R = Path(__file__).resolve().parent
W = R.parent.parent
REPO = W.parents[2]
PURE = W / 'realization/pure'
C = W / 'realization/c0-potential-effect-successor-06'
T = C / 'stage/build_tenants/abiogenesis/typescript'
F = W / 'realization/l4-final-candidate-04'
P = Path('/private/tmp/abg-stdo3-final-04-6f42d9a31e5870bc')
S7 = W / 'realization/p5-installed-final-04/successor07'
PREFIX = 'build_tenants/abiogenesis/typescript/'

def load(path):
    return json.loads(path.read_text())

def digest(data):
    return hashlib.sha256(data).hexdigest()

def pin(path):
    data = path.read_bytes()
    return {'path': str(path), 'sha256': digest(data), 'bytes': len(data),
            'mode': oct(path.stat().st_mode & 0o777)}

def put(name, value):
    with (R / name).open('x') as out:
        json.dump(value, out, indent=2)
        out.write('\n')
    return pin(R / name)

def rows(path):
    return {row['path']: row for row in load(path)['files']}

def checked(path, sha):
    value = pin(path)
    assert value['sha256'] == sha, str(path)
    return value

def block(text, name):
    match = re.search(r'^(?:export )?function ' + re.escape(name) + r'(?:\b|<)', text, re.M)
    if match is None:
        match = re.search(r'^(?:export )?const ' + re.escape(name) + r'\s*=', text, re.M)
        if match is None:
            return None
        end = text.index(';', match.start()) + 1
    else:
        end = text.index('\n}', match.start()) + 2
    return {'line': text[:match.start()].count('\n') + 1, 'text': text[match.start():end]}

audit = load(PURE / 'retirement-audit.json')
state_path = P / 'p1/evidence/p1-owner-state.json'
state = load(state_path)
admitted_root = Path(state['installations'][0]['installedRoot'])
command_paths = [P / 'p1/evidence/commands' / name for name in
                 ['5-product-verify-0.json', '7-product-resolve.json', '10-workspace-bind.json']]
bootstrap_root = Path(load(command_paths[0])['args'][0]).parents[4]
assert bootstrap_root.name == 'typescript-tenant'
archive = C / 'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz'
inputs = {
    'retirementAudit': checked(PURE / 'retirement-audit.json', 'a5c006c40230abb3e112078ca69153f46d6dccdb1b86510f3b62eeead2645ff7'),
    'pureFreeze': checked(PURE / 'freeze.json', 'ce01cdb084f5b0c3827ac9cce481d12e63193a24a1467c9409c9be9a768acca4'),
    'final06Freeze': checked(C / 'freeze.json', '80c749e3ad666b8d6ae08e9b4c4f8e56a274072926f1005e6d8049b40b5671cd'),
    'archive': checked(archive, '25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079'),
    'final04Freeze': checked(F / 'freeze.json', 'e58e78c1a3c1b4086ba5d5f16dd1676105c99059a5fc31377c00eaa37e24fbce'),
    'actualP1OwnerState': checked(state_path, '506cc1088d44acd3fd981d6518d85b3f94760a379889ddeebe1c8b2b3004ccf1'),
    'P5S07FailureFreeze': checked(S7 / 'failure-freeze.json', 'd0f9dd2979ad4fa57202235cf7f89a01cb7353a1529d8632f4dd5d736f922a56'),
    'L2': checked(W / 'L2-execution-contract.md', '65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'),
    'pureSourceEmission': pin(PURE / 'source-generated-correspondence.json'),
    'pureSourceInventory': pin(PURE / 'stage-inputs-02.json'),
    'pureGeneratedInventory': pin(PURE / 'generated-output-inventory.json'),
    'finalSourceInventory': pin(F / 'intake/stage-source-inventory.json'),
    'finalGeneratedInventory': pin(C / 'generated-inventory.json'),
    'archiveInventory': pin(C / 'archive-members.json'),
    'originalRunner': pin(W / 'proof/run-installed.mjs'),
}
pure_sources = rows(PURE / 'stage-inputs-02.json')
pure_emitted = rows(PURE / 'generated-output-inventory.json')
final_sources = rows(F / 'intake/stage-source-inventory.json')
final_emitted = rows(C / 'generated-inventory.json')
archive_rows = rows(C / 'archive-members.json')
pure_freeze = load(PURE / 'freeze.json')
pure_frozen_records = {row['path']: row for row in pure_freeze['records']}
retirement_row = pure_frozen_records[str((PURE / 'retirement-audit.json').relative_to(REPO))]
assert retirement_row['sha256'] == inputs['retirementAudit']['sha256']

modules = sorted({row['path'].split('/code/src/')[1] for row in audit['rows']} |
                 {'shared/admission_predicates.ts', 'product/exact_match.ts'})
correspondence = []
with tarfile.open(archive, 'r:gz') as tar:
    for module in modules:
        source = 'code/src/' + module
        emission = 'build/code/src/' + module[:-3] + '.js'
        source_pin, emitted_pin = pin(T / source), pin(T / emission)
        for saved in [pure_sources[PREFIX + source], final_sources[PREFIX + source]]:
            assert source_pin['sha256'] == saved['sha256'] and source_pin['bytes'] == saved['bytes']
        for saved in [pure_emitted[PREFIX + emission], final_emitted[PREFIX + emission], archive_rows[emission]]:
            assert emitted_pin['sha256'] == saved['sha256'] and emitted_pin['bytes'] == saved['bytes']
        member = tar.getmember('package/' + emission)
        data = tar.extractfile(member).read()
        assert digest(data) == emitted_pin['sha256']
        actuals = []
        for label, root in [('P1_bootstrap_owner', bootstrap_root), ('P1_admitted_install', admitted_root)]:
            actual = pin(root / emission)
            assert actual['sha256'] == emitted_pin['sha256'] and actual['bytes'] == emitted_pin['bytes']
            assert int(actual['mode'], 8) == member.mode == int(emitted_pin['mode'], 8)
            actuals.append({'role': label, 'root': str(root), **actual})
        correspondence.append({'module': module, 'source': source_pin, 'emission': emitted_pin,
          'pureSourceRow': pure_sources[PREFIX + source], 'pureEmissionRow': pure_emitted[PREFIX + emission],
          'finalSourceRow': final_sources[PREFIX + source], 'finalEmissionRow': final_emitted[PREFIX + emission],
          'archiveMember': {'name': member.name, 'sha256': digest(data), 'bytes': len(data), 'mode': oct(member.mode)},
          'actualInstalled': actuals, 'sourceEmissionRelation': 'Same source and emitted bytes as the closed pure compilation/correspondence; no rebuild performed.',
          'packageScope': 'Published JavaScript member; TypeScript source is retained in the frozen source cut and is not a tar member.'})

retirement_checks = []
for index, original in enumerate(audit['rows'], 1):
    relative = original['path'].removeprefix(PREFIX)
    current = (T / relative).read_text()
    emission = 'build/' + relative[:-3] + '.js'
    emitted = (T / emission).read_text()
    preimage = PURE / 'preimages' / original['path']
    prior = preimage.read_text()
    selected = original.get('retired_local', original.get('retained_projection'))
    old_block, new_block = block(prior, selected), block(current, selected)
    assert old_block is not None, (original['path'], selected)
    if 'retired_local' in original:
        assert new_block is None and block(emitted, selected) is None
        called = 'hasExactKeys' if selected == 'exactKeys' else selected
        counts = [len(re.findall(r'\b' + called + r'\s*\(', text)) for text in [current, emitted]]
        assert counts == [original['preserved_call_count']] * 2
        algorithm = 'Selected local function definition absent; existing call sites import the common function.'
    else:
        assert new_block is not None and 'resolveExactMatch(' in new_block['text']
        assert '.filter(' in old_block['text'] and '.filter(' not in new_block['text']
        emitted_block = block(emitted, selected)
        assert emitted_block is not None and 'resolveExactMatch(' in emitted_block['text'] and '.filter(' not in emitted_block['text']
        counts = None
        algorithm = 'Private filter/cardinality body absent; owner projection remains and delegates to common resolveExactMatch.'
    specifier = original['shared']
    if specifier == 'product/exact_match.ts::resolveExactMatch':
        specifier = './exact_match.js' if '/product/' in relative else '../product/exact_match.js'
    assert ('from "' + specifier + '"') in current
    assert ('from "' + specifier + '"') in emitted
    target_emission = posixpath.normpath(posixpath.join(posixpath.dirname(emission), specifier))
    target = next(row for row in correspondence if row['emission']['path'] == str(T / target_emission))
    retirement_checks.append({'id': 'R' + str(index), 'original': original,
        'preimage': pin(preimage), 'priorSelectedBody': old_block,
        'currentSelectedBody': new_block, 'sourceAndEmissionStaticCallSiteCounts': counts,
        'retirement': algorithm,
        'imports': [{'line': n, 'text': line} for n, line in enumerate(current.splitlines(), 1)
                    if 'import ' in line and any(term in line for term in ['definition_binding_mechanics', 'admission_predicates', 'resolveExactMatch'])],
        'selectedImport': {'specifier': specifier, 'targetEmission': target_emission,
            'targetSha256': target['emission']['sha256'],
            'actualInstalledTargetPaths': [row['path'] for row in target['actualInstalled']]},
        'packageAndInstalledConclusion': 'Identical emitted bytes carry this same absence/delegation/import relation into tar and both actual P1 roots.'})

# Actual P1 receipts establish caller outcomes; mandatory branches in the exact
# matching owner modules support a bounded reachability inference, not counters.
owner_receipts = []
for label, command_path in zip(['product-verify-0', 'product-resolve', 'workspace-bind'], command_paths):
    path = P / 'p1/evidence/calls' / (label + '.outcome.json')
    receipt = load(path)['receipt']
    assert receipt['exitCode'] == 0 and receipt['failure'] is None and receipt['ownerOutput']['outcomeKind'] == 'result'
    owner_receipts.append({'label': label, 'receipt': pin(path), 'command': pin(command_path),
       'definitionKey': receipt['definitionKey'], 'exitCode': receipt['exitCode'],
       'failure': receipt['failure'], 'outcomeKind': receipt['ownerOutput']['outcomeKind'],
       'disposition': receipt['ownerOutput']['value'].get('disposition')})
resolutions = []
for name in ['resolution-first.json', 'resolution-warm.json']:
    p = P / 'p1/evidence' / name
    value = load(p)
    assert value['kind'] == 'loaded_product_execution_resolution'
    resolutions.append({'record': pin(p), 'kind': value['kind'], 'resolutionRef': value['resolution']['resolutionRef']})

# The extension uses only the already recorded C1 readAll result and exact raw
# source cutoff. No runtime owner or codec is imported or evaluated here.
failure7 = load(S7 / 'failure-freeze.json')
frozen7 = {row['path']: row for row in failure7['files']}
external7 = {row['path']: row for row in failure7['externalFiles']}
source_handoff_path = S7 / 'archive/test-evidence/source-close-handoff.json'
source_events_path = S7 / 'archive/test-evidence/source-events.json'
source_handoff = load(source_handoff_path)
source_prefix = source_handoff['prefix']
for path in [source_handoff_path, source_events_path]:
    assert pin(path)['sha256'] == frozen7[str(path.relative_to(S7))]['sha256']
raw_path = Path(source_handoff['reopenAuthority']['eventLogPath'])
with raw_path.open('rb') as stream:
    raw_bytes = stream.read(source_prefix['prefixLength'])
assert 'sha256:' + digest(raw_bytes) == source_prefix['prefixDigest']
raw_stat = raw_path.stat()
assert raw_stat.st_dev == source_prefix['storeIdentity']['device'] and raw_stat.st_ino == source_prefix['storeIdentity']['inode']
physical = [json.loads(line) for line in raw_bytes.splitlines()]
logical = load(source_events_path)
assert len(physical) == len(logical) == 186
reference_pairs = []
for i, physical_row in enumerate(physical):
    if physical_row.get('kind') != 'abg_admitted_body_reference_record':
        continue
    observed = logical[i]
    assert physical_row['event']['eventId'] == observed['eventId']
    assert physical_row['event']['admissionOrdinal'] == observed['admissionOrdinal'] == i + 1
    reference_pairs.append({'zeroBasedPhysicalIndex': i, 'eventId': observed['eventId'],
        'admissionOrdinal': observed['admissionOrdinal'], 'physicalKind': physical_row['kind'],
        'logicalKind': observed['kind'], 'codecVersion': physical_row['codecVersion'],
        'logicalPayloadFieldsAbsentFromPhysicalPayload': sorted(set(observed['payload']) - set(physical_row['event']['payload']))})
assert [row['zeroBasedPhysicalIndex'] for row in reference_pairs] == [66, 109, 154, 171]
environment_path = S7 / 'archive/test-evidence/environment.json'
environment = load(environment_path)
assert pin(environment_path)['sha256'] == frozen7[str(environment_path.relative_to(S7))]['sha256']
p5_root = Path(environment['installedRoot'])
codec_members = []
with tarfile.open(archive, 'r:gz') as tar:
    for rel in ['abg/event_body_encoding', 'shared/admission_predicates', 'abg/event_store', 'abg/runtime_history']:
        emission = 'build/code/src/' + rel + '.js'
        actual_path = p5_root / emission
        actual = pin(actual_path)
        assert actual['sha256'] == external7[str(actual_path)]['sha256']
        assert actual['sha256'] == pin(T / emission)['sha256'] == digest(tar.extractfile('package/' + emission).read())
        codec_members.append({'module': rel, 'source': pin(T / ('code/src/' + rel + '.ts')),
                             'emission': pin(T / emission), 'actualInstalled': actual,
                             'archiveMember': 'package/' + emission, 'failureFreezeRow': external7[str(actual_path)]})
test_path = S7 / 'proof/build_tenants/abiogenesis/typescript/test_env/tests/t287-worksite-command-execution.test.mjs'
assert pin(test_path)['sha256'] == frozen7[str(test_path.relative_to(S7))]['sha256']
assert 'await proof.write("source-events.json", environment.store.readAll());' in test_path.read_text()
codec_evidence = {'status': 'bounded_codec_common_route_supported_by_recorded_installed_owner',
    'failedExecutionFreeze': inputs['P5S07FailureFreeze'], 'archive': inputs['archive'],
    'actualProducer': {'test': pin(test_path), 'line': 518, 'call': 'environment.store.readAll()'},
    'provenanceCorrection': 'The archived test producer is readAll, not readRuntimeEventsAtDurablePrefix. Root accepted this correction. No separate later diagnostic is needed or claimed here.',
    'sourceHandoff': pin(source_handoff_path), 'sourceLogicalEvents': pin(source_events_path),
    'prefix': source_prefix, 'rawPrefixRead': {'path': str(raw_path), 'bytesRead': len(raw_bytes),
        'sha256': digest(raw_bytes), 'device': raw_stat.st_dev, 'inode': raw_stat.st_ino,
        'laterTailBytesExcluded': raw_stat.st_size - len(raw_bytes)},
    'physicalRows': len(physical), 'logicalEvents': len(logical), 'referencePairs': reference_pairs,
    'installedEnvironment': pin(environment_path), 'members': codec_members,
    'necessaryCallGraph': [
       'test:518 -> AbgEventStore.readAll (event_store.ts:2470-2473)',
       'durable store owns RuntimeHistory (event_store.ts:2610-2623)',
       'readAll -> RuntimeHistorySelection.materialize; fresh selectedBodies map (runtime_history.ts:487-491)',
       'materialize -> event -> bound durable body reader (runtime_history.ts:302-311)',
       'durable body reader -> decodeEventBody (event_store.ts:3502-3534)',
       'body-reference success -> shared hasExactKeys(record) and hasExactKeys(reference) (event_body_encoding.ts:155-166)'],
    'claim': 'Recorded logical output at the exact C1 source prefix contains the restored fields for four actual physical references. Its mandatory installed owner path reaches the imported common predicate. This is call-graph inference from retained execution, not an instrumented invocation count.',
    'limits': 'No new body expansion or decoder execution; no codec-version-2 or all-refusal coverage claim. Later C2 array/view failure remains failed and uncredited.'}

reachability = [
 {'id':'R1','status':'supported_receipt_and_mandatory_call_graph','evidence':['P1 product-resolve','P1 workspace-bind'],
  'route':'resolve -> validateResolveResources:240/252; bind -> validateBindResources:535/560/567/569 -> imported sameJson. Successful owner results require these resource predicates to pass.','limit':'Eight static call sites are preserved; no per-site dynamic census.'},
 {'id':'R2','status':'supported_receipt_and_mandatory_call_graph','evidence':['P1 product-resolve','P1 workspace-bind'],
  'route':'resolve verified-preimage validation:218 and bind resource relations:563/568 -> imported sameCoordinate. Actual nonempty ABI/fixture installs and successful binding establish passage.','limit':'Three static call sites preserved; no instrumented count.'},
 {'id':'R3','status':'supported_receipt_and_mandatory_call_graph','evidence':['P1 product-verify-0'],
  'route':'verify:351-360 -> admitResources -> artifactMatchesRequest:97-100 and result projection:260 -> imported sameCoordinate. Packed artifact verification returned locally_verified.','limit':'Packed branch supports new common route; all eight static call sites are not asserted dynamically covered.'},
 {'id':'R4','status':'open_installed_topology_route_witness','evidence':[],
  'route':'deriveCanonicalRootedTopologyPartition:155 -> validateCanonicalRootedTopologyWitness:68 -> imported hasExactKeys:76/107 exists in exact package/installed bytes.',
  'limit':'No selected retained installed topology witness establishes actual passage. Planned three-case HoG route/foldback evidence must be bound to its real owner path; import presence alone gives no execution credit.'},
 {'id':'R5','status':'supported_retained_P5_C1_owner_materialization','evidence':['P5 successor07 exact C1 raw prefix / recorded readAll logical events'],
  'route':'readAll -> durable RuntimeHistory.materialize -> body loader -> decodeEventBody -> imported hasExactKeys for four actual physical references.',
  'limit':'Preserve later C2 failure. P1/P2/P3 alone have zero body-reference rows and do not prove this predicate branch.'},
 {'id':'R6','status':'supported_receipt_and_mandatory_call_graph','evidence':['P1 resolution-first','P1 resolution-warm'],
  'route':'ProductExecutionResolutionPort.resolve -> mandatory owner-install selection:699/703 -> exactInstallForPublication/Coordinate -> retained exact projection -> resolveExactMatch.',
  'limit':'Exact projection retains owner absent/ambiguous mapping; it is not a duplicate cardinality algorithm.'},
 {'id':'R7','status':'supported_receipt_and_mandatory_call_graph','evidence':['P1 product-verify-0','P1 product-resolve','P1 workspace-bind'],
  'route':'successful exact definition calls -> admitExactDefinitionCall:337 -> selectedDefinition:119 -> resolveExactMatch.',
  'limit':'selectedDefinition retains the owner one/null projection. No all-branch or per-import dynamic claim.'},
]

put('activation.json', {'activation':'RETIREMENT-INSTALLED-CORRESPONDENCE-01','issuedBy':'/root',
    'writer':'/root/stdo3_final_proof_writer','returnTo':'/root','frame':'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration',
    'productFrame':'Fixed fifteen-family ABI5.0, T287 common-library prerequisite; exact owners and ABG truth retained. L2 section 7 two-sided retirement applies only to the seven named pure bodies.',
    'method':'stdo://releases/v3.0.0-rc.1/','manifestSha256':'069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232','composition':[],
    'effects':'Read selected source/emission/archive members and retained receipts/installed members; write compact audit records only.',
    'extension':'Root authorized exact P5 successor07 C1 codec evidence and accepted actual readAll producer correction.',
    'exclusions':['No new runtime, tests, mutation probes or instrumentation','No whole filesystem inventories','E03/E04 separately retained','No main936, continuation17 or Git effects','No L5 acceptance'],
    'successor':'Private C2 repair is expected to leave these members unchanged; new candidate package correspondence remains pending explicit rebinding.'})
put('input-pins.json', inputs)
put('module-correspondence.json', {'modules':correspondence,'distinctModules':8,
     'actualOwnerInstall':{k:state['installations'][0][k] for k in ['kind','disposition','installId','installedRoot','artifactDigest','productContentDigest','admissionEventRef']},
     'actualBootstrapOwnerRoot':str(bootstrap_root), 'status':'all_selected_bytes_and_modes_correspond'})
put('retirement-checks.json', {'rows':retirement_checks,'sourceBodyCount':7,'staticNotRuntimeCounts':True})
put('owner-receipts.json', {'receipts':owner_receipts,'resolutions':resolutions,
     'P1':pin(P/'p1/evidence/result.json'),'P2':pin(P/'p2/evidence/result.json'),'P3':pin(P/'p3/evidence/result.json'),
     'interpretation':'Successful actual owner receipts plus the exact mandatory owner branches support bounded route reachability. They are not direct function-level traces.'})
put('codec-C1-correspondence.json', codec_evidence)
put('reachability.json', {'rows':reachability,'supportedRoutes':6,'openRoutes':['R4'],
     'noDynamicImportCensus':True,'noNewRuntime':True})
put('successor-rebind.json', {'status':'pending_new_candidate_package_binding','modules':[row['module'] for row in correspondence],
     'steps':['Bind new exact candidate freeze, archive, manifest and emitted inventory.','Compare only these eight named source/emitted/package members and their relative import targets with this cut; account for any actual delta explicitly.','Bind selected actual installed roots and owner-call evidence to that candidate without relabelling old runtime receipts.','Conserve this actual final06 P5 C1 codec relation separately from the later failed C2 claim.','Close R4 with selected HoG topology owner witness/call graph and actual returned event cuts; byte correspondence alone is insufficient.'],
     'notAcceptance':'Executive conjoins applicable results; no L5 or release acceptance here.'})
put('return.json', {'activation':'RETIREMENT-INSTALLED-CORRESPONDENCE-01','status':'bounded_correspondence_closed_with_one_explicit_open',
     'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceBodies':7,'distinctModules':8,
     'sourceEmissionArchiveActualP1Correspondence':'closed for all selected modules and target imports',
     'supersededAlgorithms':'All seven selected private bodies absent or delegated through retained owner projection; same emission bytes in archive and actual installed roots.',
     'newRouteReachability':{'supported':6,'open':['R4 rooted topology actual installed witness']},
     'inputs':pin(R/'input-pins.json'),'modules':pin(R/'module-correspondence.json'),'retirement':pin(R/'retirement-checks.json'),
     'receipts':pin(R/'owner-receipts.json'),'codec':pin(R/'codec-C1-correspondence.json'),'reachability':pin(R/'reachability.json'),'successor':pin(R/'successor-rebind.json'),
     'limits':['P5 C1 readAll/body materialization is the actual codec producer; later C2 remains failed.','Static sites and imports do not establish every branch was dynamically called.','E03/E04 remain separate; new candidate rebinding pending; no L5 acceptance.'],
     'effects':'Audit records only; zero runtime/test/install/probe/instrumentation or main/Git changes.', 'returnTo':'/root'})
print(json.dumps({'status':'audit_records_written','moduleCount':8,'supportedRoutes':6,'open':['R4'],'return':pin(R/'return.json')}))
