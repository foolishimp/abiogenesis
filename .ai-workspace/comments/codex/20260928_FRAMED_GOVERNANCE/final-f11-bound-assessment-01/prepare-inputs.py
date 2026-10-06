"""Construct truthful external qualification inputs; never execute a native owner."""
from pathlib import Path
import base64, hashlib, json, time

D = Path(__file__).resolve().parent
G = D.parent
R = G.parents[3]
C = G / 'final-candidate-construction-02'
Q = G / 'final-qualification-inputs-02'
M = G / 'final-f11-material-selection-02'
A = G / 'final-f11-attribution-correspondence-02'
S = G / 'final-f11-session-correspondence-03'
I = C / 'install/node_modules/@abiogenesis/typescript-tenant'
start = time.monotonic()
inputs = []
records = {}

def sha(b):
    return 'sha256:' + hashlib.sha256(b).hexdigest()

def save(name, value):
    p = D / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, indent=2) + '\n')
    return p

def read(p):
    p = Path(p)
    assert not p.is_symlink(), str(p)
    b = p.read_bytes()
    inputs.append({'path': str(p), 'bytes': len(b), 'sha256': sha(b)[7:]})
    return b

freezes = {}
for root, expected in [(C, '7256ca2e716e73912f4937fdddc6d8a980a217ecf965cac1512ba5162dac4469'),
                       (Q, 'a4c2b5afd94fd7402b6bbfc732e691eb345dbcf4334a0300de490f607b9aad79'),
                       (M, '54411d51f4e8391963f067f28323ace96381be4a6c081206d4482d2761596700')]:
    b = read(root / 'freeze.json')
    assert sha(b)[7:] == expected
    freezes[root] = {r['path']: r for r in json.loads(b)['records']}

def frozen(root, rel):
    b = read(root / rel)
    row = freezes[root][rel]
    assert len(b) == row['bytes'] and sha(b)[7:] == row['sha256'], rel
    return b

for rel, row in freezes[M].items():
    if row.get('kind', 'file') == 'file':
        frozen(M, rel)

def original(p, ref=None):
    p = Path(p)
    b = read(p)
    rel = str(p.relative_to(R))
    ref = ref or 'external-record://abiogenesis/' + rel
    result = {'ref': ref, 'path': rel, 'digest': sha(b), 'byteCount': len(b),
              'contentBase64': base64.b64encode(b).decode()}
    if ref in records:
        assert records[ref] == result, ref
    records[ref] = result
    return result

def derived(name, value, ref=None):
    p = save('derived/' + name, value)
    return original(p, ref or 'derived-record://abiogenesis/' + str(p.relative_to(R)))

def span(record, begin=0, end=None):
    b = base64.b64decode(record['contentBase64'])
    end = len(b) if end is None else end
    assert 0 <= begin < end <= len(b)
    return {'sourceRef': record['ref'], 'startByte': begin, 'endByte': end,
            'spanDigest': sha(b[begin:end])}

selection = json.loads(frozen(M, 'selection.json'))
selected = selection['subjectMembers']
bank = {r['member']['path']: r for r in json.loads(frozen(M, 'current-material-bank.json'))['members']}
for m in selected:
    b = read(bank[m['path']]['physicalOrigin'])
    assert len(b) == m['byteCount'] and sha(b) == m['digest']
    records[m['ref']] = {**m, 'contentBase64': base64.b64encode(b).decode()}

request = original(G / 'final-f11-bound-assessment-controls-01/request.txt')
assert request['byteCount'] == 7151 and request['digest'] == 'sha256:a29dd3612468ea851904f9744f06b3a1afd75bac91642d4942219fb18b341ac6'
authority = 'actor-capability://abiogenesis/qualification/product-owner@5'
mandate = derived('owner-mandate-correspondence.json', {
    'kind': 'source_grounded_current_evaluation_mandate',
    'sourceGrant': {k: request[k] for k in ['ref', 'digest', 'byteCount']},
    'source': 'The exact Root grant records the Product owner authorization of this bounded evaluation, current Product/Goal mandate and clarified RC2 control selection.',
    'selectedAuthoritySlot': authority,
    'meaning': 'Current evaluation authority over this exact C02/Q02 rule task and its imported external evidence; not retrospective construction authorization or proof that historical author-grants occupied this native capability.',
    'historicalAuthorityCorrespondence': 'For independent J to judge from original source grants; no established attribution result is asserted.',
    'writer': '/root/f11_binding_plan',
    'subjectMembers': selected,
    'nativeGrant': 'Actual invocation/capability facts belong to the separately activated native caller and admission owner.'})

# Actual C02 import/preservation operation. This later view is not a historical
# source-edit patch: each unchanged import is represented by an identity hunk.
preserved = [m for m in selected if not m['path'].endswith('/gtl/default_library.ts')]
c_activation = original(C / 'activation.json')
c_operation = original(C / 'operation-attribution.json')
c_grant = original(C / 'source-freeze/controls/final-candidate-construction-controls-02/request.txt')
c_script = original(C / 'prepare.py')
c_manifest = original(C / 'source-members.json')
c_return = original(C / 'return.md')
preimages, changes, patch = [], [], []
for m in preserved:
    p = G / 'final-candidate-construction-01/source-freeze/repo' / m['path']
    pre = original(p, 'external-preimage://abiogenesis/C01/' + m['path'])
    assert pre['digest'] == m['digest'] and pre['byteCount'] == m['byteCount']
    preimages.append({'path': m['path'], 'digest': pre['digest'], 'byteCount': pre['byteCount'], 'sourceRef': pre['ref']})
    text = base64.b64decode(pre['contentBase64']).decode('utf8')
    assert text.endswith('\n'), 'identity view currently requires newline-terminated source'
    lines = text.splitlines()
    patch.extend(['--- a/' + m['path'], '+++ b/' + m['path'], '@@ -1,%d +1,%d @@' % (len(lines), len(lines))])
    patch.extend('-' + l for l in lines)
    patch.extend('+' + l for l in lines)
    changes.append({'memberRef': m['ref'], 'patchPath': m['path'],
                    'preimageMemberRef': pre['ref'], 'postimageMemberRef': m['ref']})
pre_manifest = derived('c02-preservation-preimage-view.json', {'kind': 'derived_import_preimage_view',
    'originalDonor': 'final-candidate-construction-01/source-freeze/repo', 'members': preimages})
patch_path = D / 'derived/c02-preservation-identity-view.patch'
patch_path.write_text('\n'.join(patch) + '\n')
patch_record = original(patch_path, 'derived-record://abiogenesis/' + str(patch_path.relative_to(R)))
closure = derived('c02-preservation-closure-view.json', {'kind': 'derived_import_closure_view',
    'operation': 'T287_FINAL_CANDIDATE_CONSTRUCTION_02', 'actor': '/root/s03_phase_b',
    'originalClosure': {k: c_manifest[k] for k in ['ref', 'digest', 'byteCount']},
    'meaning': 'These exact existing bodies were imported/preserved into C02. No original semantic authorship is assigned to the importing operator.',
    'members': preserved})
import_derivation = derived('c02-preservation-derivation.json', {'kind': 'source_preserving_import_representation',
    'originalActivation': c_activation['ref'], 'originalGrant': c_grant['ref'],
    'originalOperation': c_operation['ref'], 'actualCopyImplementation': c_script['ref'],
    'originalClosure': c_manifest['ref'], 'originalReturn': c_return['ref'],
    'preimageView': pre_manifest['ref'], 'identityDeltaView': patch_record['ref'], 'closureView': closure['ref'],
    'limits': 'New truthful representation of original copying. The identity hunks were not performed as historical source edits. The importer is not substituted for unknown inherited semantic authors.',
    'writer': '/root/f11_binding_plan', 'writerGrant': request['ref']})
import_chain = {'activationRef': c_activation['ref'], 'preimageRef': pre_manifest['ref'],
    'deltaRef': patch_record['ref'], 'closureRef': closure['ref'],
    'authorRef': '/root/s03_phase_b', 'actorIdentityRef': '/root/s03_phase_b',
    'authorityRef': authority, 'scopeRefs': [m['ref'] for m in preserved],
    'postimageMembers': preserved, 'changes': changes,
    'attributionSources': [span(x) for x in [c_activation, c_operation, c_grant, closure, import_derivation, mandate]]}

# D's original delta and source-preserving closure representation already exist.
operations = json.loads(read(A / 'operation-inputs-with-supplements.json'))['operations']
d = next(x for x in operations if x['operation'] == 'T287_DEFAULT_LIBRARY_PUBLICATION_REPAIR_01')
d_chain = d['candidateChain']
all_existing = []
for name in ['original-record-materials.json', 'derived-record-materials.json', 'supplemental-record-materials.json']:
    value = json.loads(read(A / name))
    if isinstance(value, dict):
        value = value.get('materials', value.get('records', value.get('members', [])))
    all_existing += value
by_ref = {x['ref']: x for x in all_existing}
needed = {d_chain[k] for k in ['activationRef', 'preimageRef', 'deltaRef', 'closureRef']}
needed.update(s['sourceRef'] for s in d_chain['attributionSources'])
for c in d_chain['changes']:
    needed.update([c['postimageMemberRef'], c['preimageMemberRef']])
for ref in needed:
    if ref is None:
        continue
    record = by_ref[ref]
    b = base64.b64decode(record['contentBase64'])
    assert len(b) == record['byteCount'] and sha(b) == record['digest']
    records[ref] = record
d_member = next(m for m in selected if m['path'].endswith('/gtl/default_library.ts'))
d_chain = {**d_chain, 'authorityRef': authority, 'actorIdentityRef': '/root/s03_phase_b',
           'scopeRefs': [d_member['ref']], 'postimageMembers': [d_member],
           'changes': [c for c in d_chain['changes'] if c['memberRef'] == d_member['ref']]}
session = original(S / 's03_phase_b-session-metadata.json')
session_corr = original(S / 'session-operation-correspondence.json')
d_chain['attributionSources'] += [span(session), span(mandate)]

# The new material selection is actual external construction. Its single new
# rationale body is represented as create-from-absence, not candidate code.
m_activation = original(M / 'activation.json')
m_attribution = original(M / 'construction-attribution.json')
m_grant = original(M / 'request.txt')
m_freeze = original(M / 'freeze.json')
m_checks = original(M / 'construction-checks.json')
rationale = next(row for row in selection['materialSelection'] if row['member']['path'].endswith('/selection-rationale.json'))
r = rationale['member']
rb = read(rationale['physicalOrigin'])
assert len(rb) == r['byteCount'] and sha(rb) == r['digest']
records[r['ref']] = {**r, 'contentBase64': base64.b64encode(rb).decode()}
m_pre = derived('material02-rationale-preimage.json', {'kind': 'derived_new_file_preimage_view',
    'originalActivation': m_activation['ref'], 'meaning': 'Material02 explicitly created this new derivation in its new territory; no donor rationale preimage is claimed.', 'members': []})
mp = D / 'derived/material02-rationale-create-view.patch'
lines = rb.decode().splitlines()
mp.write_text('\n'.join(['--- /dev/null', '+++ b/' + r['path'], '@@ -0,0 +1,%d @@' % len(lines)] + ['+' + l for l in lines]) + '\n')
m_delta = original(mp, 'derived-record://abiogenesis/' + str(mp.relative_to(R)))
m_closure = derived('material02-rationale-closure-view.json', {'kind': 'derived_new_file_closure_view',
    'actor': '/root/f11_attribution_inputs', 'originalFreeze': {k: m_freeze[k] for k in ['ref', 'digest', 'byteCount']},
    'members': [r], 'meaning': 'Actual new Material02 selection rationale; this view does not replace the original operation record.'})
m_chain = {'activationRef': m_activation['ref'], 'preimageRef': m_pre['ref'], 'deltaRef': m_delta['ref'], 'closureRef': m_closure['ref'],
    'authorRef': '/root/f11_attribution_inputs', 'actorIdentityRef': '/root/f11_attribution_inputs', 'authorityRef': authority,
    'scopeRefs': [r['ref']], 'postimageMembers': [r],
    'changes': [{'memberRef': r['ref'], 'patchPath': r['path'], 'preimageMemberRef': None, 'postimageMemberRef': r['ref']}],
    'attributionSources': [span(x) for x in [m_activation, m_attribution, m_grant, m_closure, mandate]]}

save('provenance-body.json', {'kind': 'external_construction', 'subjectInventory': json.loads(frozen(Q, 'basis-template.json'))['body']['sourceInventory'],
    'records': list(records.values()), 'chains': [import_chain, d_chain, m_chain], 'acknowledgmentSelectionRef': None})
save('actor-correspondence.json', {'knownExternalActors': [
    {'identity': '/root/s03_phase_b', 'meaning': 'C02 preservation/import operator and separately observed narrow D repair performer; not all inherited semantic authors',
     'knownDSession': '01a0f036-c7b5-7f40-b1d8-e53a1fcf24f4', 'DSessionEvidence': session['ref'], 'C02OperationSession': None},
    {'identity': '/root/f11_attribution_inputs', 'meaning': 'Material02 selection rationale constructor', 'session': None},
    {'identity': '/root/f11_binding_plan', 'meaning': 'Current external binding/representation writer', 'grant': request['ref'], 'session': None}],
    'publishedProspectiveNativeAssessor': 'actor://abiogenesis/qualification/assessor-primary@5',
    'actualNativeActorInvocation': None, 'independence': 'Native transport occurrence and source-grounded J must establish required relations; labels alone establish no acceptance',
    'unresolved': ['Relevant inherited semantic authorship outside retained operation chains', 'Historical source-grant-to-qualification capability correspondence', 'Actual future assessor invocation/transport identity and independence']})
projection_path = G / 'final-c2-current-resource-caller-02/offline-current-projection.json'
projection = json.loads(read(projection_path))
assert projection['prefix']['prefixLength'] == 5577377 and projection['artifactTruth']['prefixEventCount'] == 84
assert projection['prefix']['coordinateDigest'] == 'sha256:81cefea619af712a416d8680efa40fc2bed1f3248460022e4e625eef0ed46c0c'
assert projection['prefix']['prefixDigest'] == 'sha256:e2bb5df3f58b91a49f7324a487e9e79b93d05b03c368c339c82a6edc9d359ec0'
assert len(projection['productInstalls']) == 1
save('runtime-facts.json', {'install': projection['productInstalls'][0], 'workspaceBinding': projection['workspaceBinding'],
    'prefix': projection['prefix'], 'originalProjection': inputs[-1], 'movingResourceRead': False})
manifest = json.loads(frozen(C, 'install/node_modules/@abiogenesis/typescript-tenant/product-toolchain-manifest.json'))
graph = json.loads(frozen(C, 'install/node_modules/@abiogenesis/typescript-tenant/contracts/capabilities/capability-definition-graph.json'))
claims, no_contract_rows = [], []
pub_by_id = {row['contractId']: row for row in manifest['publicContractCatalog']['rows']}
for row in graph['rows']:
    contracts = sorted(set(c['flatRow']['contractId'] for c in row['owningPublicContracts']))
    contracts = [ref for ref in contracts if ref in pub_by_id and row['capabilityId'] in pub_by_id[ref]['capabilityIdentities'] and pub_by_id[ref]['owningProduct'] == manifest['productId']]
    if not contracts:
        no_contract_rows.append(row['capabilityId'])
        continue
    claims.append({'claimRef': 'tenant-claim://abiogenesis/final-f11-bound-assessment-01/' + row['capabilityId'],
        'capabilityRef': row['capabilityId'], 'publicContractRefs': contracts,
        'evidenceRefs': list(dict.fromkeys(row['boundedProofRefs'] + [
            'external-record://abiogenesis/' + str((C/'installed-publication-results.json').relative_to(R)),
            'external-record://abiogenesis/' + str((C/'product-verification-summary.json').relative_to(R))]))})
save('tenant-body.json', {'kind': 'tenant_conformance_manifest', 'schemaVersion': '5.0.0', 'productId': manifest['productId'],
    'capabilityDefinitionGraph': {'ref': graph['graphId'], 'digest': graph['graphDigest']},
    'publicContractCatalog': {'ref': manifest['publicContractCatalog']['catalogId'], 'digest': manifest['publicContractCatalog']['catalogDigest']}, 'claims': claims})
save('tenant-declaration-rationale.json', {'source': 'Exact C02 published capability rows and owned Public contracts',
    'claimMeaning': 'Declares the existing capability/Public ownership and referenced proof population; no green realized conformance verdict is asserted',
    'declaredClaims': len(claims), 'rowsWithoutOwnedPublicContracts': no_contract_rows,
    'originalProofReferences': 'Taken unchanged from the actual published graph; retained references are not independently accepted proof adequate for a release claim',
    'realizationAndEvidenceAdequacy': 'Unassessed; required downstream independent tenant J remains open',
    'actualWriter': '/root/f11_binding_plan', 'grant': request['ref']})
save('acquired-inputs.json', {'records': list({r['path']: r for r in inputs}.values()), 'elapsedMs': (time.monotonic()-start)*1000,
    'nativeCalls': 0, 'movingResourceReads': 0, 'providerCalls': 0, 'sourceMutation': 0})
print(json.dumps({'status': 'constructed', 'selectedHosts': len(selected), 'records': len(records), 'chains': 3,
                  'tenantClaims': len(claims), 'elapsedMs': (time.monotonic()-start)*1000}))
