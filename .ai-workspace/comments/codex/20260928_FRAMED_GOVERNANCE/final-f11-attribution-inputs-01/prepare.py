"""Bounded read-model construction. No candidate, history, or native mutation."""
from pathlib import Path
import base64, collections, hashlib, json, os, re, subprocess

R = Path('/Users/jim/src/apps/abiogenesis')
G = R / '.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
D = G / 'final-f11-attribution-inputs-01'
C = G / 'final-candidate-construction-01'
Q = G / 'final-qualification-inputs-01'
T = 'build_tenants/abiogenesis/typescript/'
consumed = {}
materials = {}

def sha(b): return hashlib.sha256(b).hexdigest()
def read(p):
    p = Path(p); b = p.read_bytes()
    consumed[str(p)] = {'path': str(p), 'bytes': len(b), 'sha256': sha(b)}
    return b
def obj(p): return json.loads(read(p))
def put(n, x): (D / n).write_text(json.dumps(x, indent=2) + '\n')
def equal(p, size, digest):
    b = read(p); assert len(b) == size and sha(b) == digest.removeprefix('sha256:'), str(p)
    return b
def rel(p): return str(Path(p).relative_to(R))
def mat(p, ref=None, path=None):
    p = Path(p); b = read(p); path = path or rel(p)
    ref = ref or ('external-record://abiogenesis/' + path)
    m = {'ref': ref, 'path': path, 'digest': 'sha256:' + sha(b),
         'byteCount': len(b), 'contentBase64': base64.b64encode(b).decode()}
    if ref in materials: assert materials[ref] == m
    materials[ref] = m
    return ref
def span(ref, start=0, end=None):
    b = base64.b64decode(materials[ref]['contentBase64']); end = end or len(b)
    if end < len(b): end = b.rfind(b'\n', start, end) + 1
    assert 0 <= start < end <= len(b)
    return {'sourceRef': ref, 'startByte': start, 'endByte': end,
            'spanDigest': 'sha256:' + sha(b[start:end])}
def source(m): return {k: m[k] for k in ('ref', 'path', 'digest', 'byteCount')}

assert sha(read(C / 'freeze.json')) == 'f6199e3f9ce72f99ecd16307eabc9ca92cc2ecdbc320c70bdd075962eb09650f'
assert sha(read(Q / 'freeze.json')) == '0a386fd10e1067abb3f09ba4d7f115b56593045ca0d0d1aa272fb7fcc0a46bbe'
assert read(D / 'controls/request.txt') == read(D / 'controls/joined-request.txt')
cf, qf = obj(C / 'freeze.json'), obj(Q / 'freeze.json')
frozen = {str(C / r['path']): r for r in cf['records'] if r['kind'] == 'file'}
frozen.update({str(Q / r['path']): r for r in qf['records']})
inv = obj(Q / 'qualification-inventory.json')
assert len(inv['members']) == 1950 and inv['inventoryDigest'] == 'sha256:ca5a28d01f72202e3fefe39ea35755b0cbc8a2e6fbecf57d4b8392a90742351d'
members = {m['path']: m for m in inv['members']}
src = obj(C / 'source-members.json')
source_rows = obj(Q / 'source-inventory.json')
origin_rows = {r['path']: r for r in source_rows}
origins = {}
for m in inv['members']:
    p = Path(origin_rows[m['path']]['origin']) if m['path'] in origin_rows else R / m['path']
    equal(p, m['byteCount'], m['digest']); origins[m['path']] = p
for owner in ['validator/qualification_contracts.js', 'validator/qualification.js', 'abg/qualification_proof.js', 'shared/digests.js']:
    read(C / 'install/node_modules/@abiogenesis/typescript-tenant/build/code/src' / owner)
for owner in ['validator/qualification_contracts.ts', 'validator/qualification.ts', 'abg/qualification_proof.ts']:
    read(C / 'source-freeze/repo' / T / 'code/src' / owner)
for p in [C/'activation.json', C/'source-overlay.json', C/'source-freeze-manifest.json', C/'generated-before.json', C/'generated-after.json',
          C/'generated-delta.json', C/'build.started.json', C/'build.json', C/'return.md',
          Q/'activation.json', Q/'return.md', Q/'prepare-inputs.py', Q/'complete-inputs.py', Q/'bind-far-side.py',
          G/'final-qualification-input-controls-01/request.txt', G/'final-candidate-construction-controls-01/request.txt']:
    read(p)
context = obj(Q / 'external-construction-context.json')
for chain in context['chains']:
    for r in chain['records']: equal(R / r['path'], r['bytes'], r['sha256'])

# Git is an observed predecessor binding only. No commit author is promoted to
# semantic author of every file present in the commit's tree.
env = dict(os.environ, GIT_OPTIONAL_LOCKS='0')
head = obj(C / 'source-overlay.json')['head']
tree_bytes = read(D / 'git-tree-at-frozen-head.bin')
tree = {}
for row in tree_bytes.split(b'\0'):
    if not row: continue
    meta, path = row.split(b'\t', 1); mode, typ, blob = meta.decode().split()
    tree[path.decode()] = {'mode': mode, 'type': typ, 'blob': blob}
blob_ids = sorted({tree[r['path']]['blob'] for r in src if r['path'] in tree})
batch = subprocess.check_output(['git', '--no-optional-locks', 'cat-file', '--batch'],
    input=('\n'.join(blob_ids) + '\n').encode(), cwd=R, env=env)
at = 0; blobs = {}
for expected in blob_ids:
    end = batch.index(b'\n', at); oid, typ, n = batch[at:end].decode().split(); size = int(n)
    assert oid == expected and typ == 'blob'; at = end + 1
    b = batch[at:at+size]; at += size
    assert batch[at:at+1] == b'\n'; at += 1
    assert hashlib.sha1(b'blob ' + str(len(b)).encode() + b'\0' + b).hexdigest() == expected
    blobs[oid] = {'bytes': len(b), 'sha256': sha(b)}
assert at == len(batch)
git_rows = []
for r in src:
    old = tree.get(r['path'])
    git_rows.append({'path': r['path'], 'currentDigest': 'sha256:' + r['sha256'],
        'head': head, 'git': old, 'blobBytes': None if old is None else blobs[old['blob']],
        'sameBytesAtHead': old is not None and blobs[old['blob']]['sha256'] == r['sha256'],
        'authorshipLimit': 'Tree/blob membership only; no blanket semantic authorship or actor correspondence follows.'})
put('git-blob-correspondence.json', {'head': head, 'records': git_rows})
git_map = {r['path']: r for r in git_rows}

# Check the actual original unified patch, without rendering a replacement.
# This diagnostic accepts the original before/after headers to verify that a
# real transition exists; it is not an alternative Product provenance owner.
def apply_original(patch, path, before):
    lines = patch.splitlines(keepends=True)
    targets = [i for i,l in enumerate(lines) if l.rstrip('\n') in ['+++ b/'+path, '+++ after/'+path, '+++ '+path]]
    assert len(targets) == 1, path
    idx = targets[0]; prior_header = lines[idx-1].rstrip('\n')
    assert prior_header in ['--- a/'+path, '--- before/'+path, '--- '+path]
    old = before.splitlines(keepends=True); out = []; cursor = 0; idx += 1; hunks = 0
    while idx < len(lines) and not lines[idx].startswith(('--- ', 'diff --git ')):
        match = re.match(r'^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@', lines[idx])
        if not match: idx += 1; continue
        start = int(match[1]); old_n = int(match[2] or 1); new_n = int(match[4] or 1)
        off = start if old_n == 0 else start-1
        assert cursor <= off <= len(old)
        out += old[cursor:off]; cursor = off; idx += 1; removed = added = 0
        while removed + added < old_n + new_n:
            line = lines[idx]; idx += 1; flag = line[:1]; value = line[1:]
            assert flag in ' +-'
            if idx < len(lines) and lines[idx].startswith('\\ No newline at end of file'):
                value = value.removesuffix('\n'); idx += 1
            if flag in ' -': assert old[cursor] == value; cursor += 1; removed += 1
            if flag in ' +': out.append(value); added += 1
        assert removed == old_n and added == new_n; hunks += 1
    out += old[cursor:]; assert hunks
    return ''.join(out).encode(), hunks

def recursive_member(o, path, digest):
    if isinstance(o, list): return any(recursive_member(x,path,digest) for x in o)
    if not isinstance(o, dict): return False
    if o.get('path') == path and any(o.get(k) in [digest, digest.removeprefix('sha256:')] for k in ['sha256','digest','contentDigest']): return True
    return any(recursive_member(x,path,digest) for x in o.values())

chain_inputs = []; transitions = []; current_transition_members = set()
handoff = G / 's03-public-handoff-repair-01'
selected = G / 's7-pending-consumer-01/selected-action-07'
specs = [
 {'id':'T287_S03_PUBLIC_HANDOFF_REPAIR_01', 'root':handoff,
  'activation':handoff/'activation.json', 'preimage':handoff/'activation.json',
  'closure':handoff/'freeze.json', 'patch':handoff/'source.patch', 'return':handoff/'return.md',
  'grant':G/'s03-public-handoff-repair-controls-01/request.txt',
  'rows':obj(handoff/'final-sources.json'), 'prefix':'s03'},
 {'id':'T287_S7_SELECTED_ACTION_INSTALLED_07', 'root':selected,
  'activation':selected/'request.txt', 'preimage':selected/'preimages.json',
  'closure':selected/'freeze.json', 'patch':selected/'source.patch', 'return':selected/'return.md',
  'grant':selected/'request.txt',
  'rows':obj(selected/'checks.json')['preimageComparisons'], 'prefix':'selected07'}]
for s in specs:
    refs = {key:mat(s[key]) for key in ['activation','preimage','closure','patch','return','grant']}
    patch = read(s['patch']).decode(); closure = obj(s['closure']); pre = obj(s['preimage'])
    changes = []; posts = []; excluded = []
    for row in s['rows']:
        path = row['path'].removeprefix(str(R)+'/')
        current = members.get(path)
        is_source = path in origin_rows and origin_rows[path]['role'] == 'selected_source'
        if not row.get('changed',False) or current is None or not is_source or current['digest'] != 'sha256:'+row['sha256']:
            excluded.append({'path':path,'changedAtOriginalCut':row.get('changed',False),
                'originalPostimageSha256':row['sha256'], 'currentSha256':None if current is None else current['digest'],
                'reason':'unchanged at this activation' if not row.get('changed',False) else 'current generated output belongs to C generation relation' if not is_source else 'postimage is not the current inventory member'})
            continue
        prior_path = R / row['preimage'] if s['prefix']=='s03' else s['root']/'preimages'/path
        before = equal(prior_path, prior_path.stat().st_size, row['preimageSha256'])
        post = equal(origins[path], current['byteCount'], current['digest'])
        reconstructed,hunks = apply_original(patch,path,before.decode())
        assert reconstructed == post
        pre_ref = mat(prior_path)
        post_ref = mat(origins[path], ref=current['ref'], path=path)
        changes.append({'memberRef':current['ref'],'patchPath':path,'preimageMemberRef':pre_ref,'postimageMemberRef':post_ref})
        posts.append(source(current)); current_transition_members.add(path)
        owner_headers = ('+++ b/'+path+'\n') in patch or ('+++ '+path+'\n') in patch
        owner_closure = recursive_member(closure,path,current['digest'])
        owner_preimage = recursive_member(pre,path,'sha256:'+sha(before))
        transitions.append({'activation':s['id'],'member':source(current),'originalPatch':rel(s['patch']),
            'originalPreimage':rel(prior_path),'originalPostimage':str(origins[path]),'hunks':hunks,
            'actualOriginalPatchReconstructsCurrentBytes':True,'currentOwnerAcceptsOriginalPatchHeader':owner_headers,
            'currentOwnerClosurePathMemberMatch':owner_closure,'currentOwnerPreimageMemberMatch':owner_preimage,
            'headerOrClosureRewritten':False})
    activation_body = base64.b64decode(materials[refs['activation']]['contentBase64'])
    closure_body = base64.b64decode(materials[refs['closure']]['contentBase64'])
    chain_inputs.append({'sourceActivation':s['id'], 'readiness':'incomplete_original_carrier_and_identity_joins',
        'candidateChain':{'activationRef':refs['activation'],'preimageRef':refs['preimage'],'deltaRef':refs['patch'],
            'closureRef':refs['closure'],'authorRef':s['id'],
            'actorIdentityRef':None,'authorityRef':None,'scopeRefs':[m['ref'] for m in posts],
            'postimageMembers':posts,'changes':changes,
            'attributionSources':[span(refs['activation'],0,min(len(activation_body),900)),
                span(refs['closure'],0,min(len(closure_body),500)),span(refs['return'],0,min(materials[refs['return']]['byteCount'],1450))]},
        'sourceClaims':{'authorRefMeaning':'Exact original Worker activation label, not an established concrete actor identity.',
            'grantRef':refs['grant'],'closedReturnRef':refs['return']},
        'pending':['original carrier compatibility','source-grounded Worker-to-concrete-actor correspondence',
            'grant-chain correspondence to published Product authority slot','actual independent attribution assessment'],
        'excludedRows':excluded})
put('source-chain-inputs.json',{'kind':'external_attribution_input_read_model','notLaunchReady':True,
    'subjectInventory':{'ref':inv['inventoryRef'],'digest':inv['inventoryDigest']},
    'chains':chain_inputs,'scopeMapping':'Exact member refs only; per-rule group mapping remains a later separately constructed input.'})
put('source-transition-checks.json',{'checks':transitions,'transitionMemberCount':len(current_transition_members),
    'limits':'Reconstructs original patch transitions only. Does not assert original carrier acceptance, true attribution, native admission or qualification.'})
put('external-record-materials.json',{'kind':'external_record_set_inputs','records':list(materials.values()),
    'notLaunchReady':True,'recordSet':'Computed by installed canonical digest owner in validate-inputs.mjs.'})

generated_before = {r['path']:r for r in obj(C/'generated-before.json')}
generated_delta = {r['path']:r for r in obj(C/'generated-delta.json')}
donor = R/'.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/successor-06'
donor_copy_names = ['recipe.mjs','compare-generated.mjs','test-selection.json','recipe-stage.mjs','test-environment.mjs']
copy_relations = {}
for name in donor_copy_names:
    b=read(donor/name); target=read(Q/name)
    copy_relations[rel(Q/name)]={'donorPath':rel(donor/name),'donorBytes':len(b),'donorSha256':sha(b),
        'sameBytes':b==target,'operationSource':rel(Q/'prepare-inputs.py')}
claim_pre = read(C/'source-freeze/release-claims.json')
copy_relations[rel(Q/'release-claims.json')]={'donorPath':rel(C/'source-freeze/release-claims.json'),
    'donorBytes':len(claim_pre),'donorSha256':sha(claim_pre),'sameBytes':claim_pre==read(Q/'release-claims.json'),
    'operationSource':rel(Q/'prepare-inputs.py')}
coverage = []
for m in inv['members']:
    path=m['path']; base={'member':source(m),'surfaceRoles':m['surfaceRoles'],'physicalOrigin':str(origins[path]),
        'currentBytesVerified':True,'launchReadyAttribution':False,'originalAuthorIdentity':None}
    if path in current_transition_members:
        base.update(classification='retained_actual_source_transition', recordRelations=[r for r in transitions if r['member']['path']==path],
            unresolved=['original carrier compatibility','concrete author/authority correspondence','actual attribution judgment'])
    elif path in origin_rows and origin_rows[path]['role']=='selected_source':
        gr=git_map[path]
        base.update(classification='inherited_selected_source' if gr['sameBytesAtHead'] else 'changed_selected_source_without_complete_routed_chain',
            gitEvidence=gr,unresolved=['original relevant construction/grant/preimage/delta/closure chain','concrete author/authority correspondence'])
    elif path in origin_rows and origin_rows[path]['role']=='generated_output':
        gp=path.removeprefix(T); before=generated_before[gp]; change=generated_delta.get(gp)
        base.update(classification='deterministic_generated_output',constructionActivation='T287_FINAL_CANDIDATE_CONSTRUCTION_01',
            buildRecord=rel(C/'build.json'),generationInputs=rel(C/'source-freeze-manifest.json'),
            preimage=before,actualChangedOutput=change is not None,deltaRecord=rel(C/'generated-delta.json'),
            sourceAuthorLimit='The build Worker owns the build operation; source/tool authorship is inherited and is not relabeled.',
            unresolved=['existing provenance consumer representation of recorded deterministic generation','source/tool author/authority correspondence'])
    elif path.startswith(rel(Q)+'/'):
        cr=copy_relations.get(path)
        label='inherited_unchanged_external_control_copy' if cr and cr['sameBytes'] else 'new_or_modified_external_control'
        base.update(classification=label,constructionActivation='T287_FINAL_QUALIFICATION_INPUTS_01',
            activationRecord=rel(Q/'activation.json'),closureRecord=rel(Q/'freeze.json'),copyOrDeltaSource=cr,
            constructionScripts=[rel(Q/n) for n in ['prepare-inputs.py','complete-inputs.py','bind-far-side.py']],
            unresolved=['actual external control transition carrier','original inherited author where copied','concrete author/authority correspondence'])
    else:
        assert path.startswith(rel(C)+'/'),path
        base.update(classification='supplied_archive_dependency_or_toolchain_manifest',
            constructionActivation='T287_FINAL_CANDIDATE_CONSTRUCTION_01',activationRecord=rel(C/'activation.json'),closureRecord=rel(C/'freeze.json'),
            meaning='Actual package/dependency/toolchain observation manifest; not original authorship of described supplier bytes.',
            unresolved=['actual manifest construction carrier and author/authority correspondence','supplier attribution only where applicable'])
    coverage.append(base)
counts=dict(collections.Counter(r['classification'] for r in coverage))
put('inventory-attribution-coverage.json',{'subjectInventory':{'ref':inv['inventoryRef'],'digest':inv['inventoryDigest']},
    'counts':counts,'members':coverage,'completeBytePopulation':True,'completeAttribution':False,
    'attributionReadyMembers':0,'laterInputs':['closed per-rule scope mapping','actual admitted independent assessor/peer occurrences']})
put('construction-class-summary.json',{'counts':counts,'members':len(coverage),
    'actualRoutedCurrentTransitions':len(current_transition_members),'generatedChanged':len(generated_delta),
    'generatedUnchanged':len(generated_before)-len(generated_delta),
    'git':dict(collections.Counter('unchanged_at_frozen_head' if x['sameBytesAtHead'] else 'different_at_frozen_head' if x['git'] else 'absent_at_frozen_head' for x in git_rows)),
    'copyRelations':copy_relations,'semanticAuthorshipFromGitCommit':False,'allMemberSnapshotAuthorClaim':False})

# Reacquire hashes of every consumed frozen record against its immutable owner
# manifest. Original routed records are separately digest-bound by Q/context.
checked=0
for path,row in list(consumed.items()):
    expected=frozen.get(path)
    if expected:
        assert row['bytes']==expected['bytes'] and row['sha256']==expected['sha256'],path
        checked+=1
put('input-joins.json',{'frozenC':consumed[str(C/'freeze.json')],'frozenQ':consumed[str(Q/'freeze.json')],
    'consumedFrozenMembersVerified':checked,'records':list(consumed.values()),
    'basisCoordinateCorrection':{'requestLabel':'stdo_abiogenesis.json SHA2565d306da1...',
        'actualDefinitionFileSha256':sha(read(C/'source-freeze/repo/stdo_abiogenesis.json')),
        'definitionSelectedInstalledManifestSha256':'5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64',
        'meaning':'Both are distinct correct coordinates of the same unambiguous v2.5.1-rc.1 selection; no basis substitution.'}})
print(json.dumps({'memberCounts':counts,'transitions':len(transitions),'materialRecords':len(materials),
    'materialBytes':sum(m['byteCount'] for m in materials.values()),'frozenConsumedChecked':checked}))
