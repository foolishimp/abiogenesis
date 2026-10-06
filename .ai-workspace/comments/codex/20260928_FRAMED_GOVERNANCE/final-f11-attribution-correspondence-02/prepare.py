#!/usr/bin/env python3
"""Construct bounded external record views. No source, Product or runtime effects."""
import base64, copy, datetime, hashlib, json, os, pathlib, re, time

O = pathlib.Path(__file__).resolve().parent
G = O.parent
R = G.parents[3]
A = G / 'final-f11-attribution-inputs-01'
V = G / 'final-f11-attribution-review-01'
C = G / 'final-candidate-construction-01'
D = G / 'default-library-publication-repair-01'
started = time.monotonic()
consumed = {}

def sha(b): return hashlib.sha256(b).hexdigest()
def save(p, v):
    p = O / p
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: f.write(json.dumps(v, indent=2, ensure_ascii=False) + '\n')
def read(p, expected=None):
    p = pathlib.Path(p)
    b = p.read_bytes()
    if expected: assert sha(b) == expected, str(p)
    consumed[str(p)] = {'path':str(p), 'bytes':len(b), 'sha256':sha(b)}
    return b
def js(p, expected=None): return json.loads(read(p, expected))
def record(p, ref=None, logical=None):
    p=pathlib.Path(p); b=read(p)
    return {'ref':ref or 'external-record://abiogenesis/'+str(p.relative_to(R)),
            'path':logical or str(p.relative_to(R)), 'digest':'sha256:'+sha(b),
            'byteCount':len(b),'contentBase64':base64.b64encode(b).decode()}
def body(m): return base64.b64decode(m['contentBase64'], validate=True)
def span(m, lo=0, hi=None):
    b=body(m); hi=len(b) if hi is None else hi
    assert 0<=lo<hi<=len(b)
    return {'sourceRef':m['ref'],'startByte':lo,'endByte':hi,'spanDigest':'sha256:'+sha(b[lo:hi])}
def member(m): return {k:m[k] for k in ['ref','path','digest','byteCount']}
def verify_records(root, freeze, selected=None):
    checked=[]
    for row in freeze['records']:
        if selected is not None and row['path'] not in selected: continue
        b=read(root/row['path'],row['sha256']); assert len(b)==row['bytes']
        checked.append(row['path'])
    if selected is not None: assert set(checked)==set(selected)
    return checked

request=read(O/'controls/request.txt','b91b75e382fadc3a7b6d6f7b49eacf104164fddabb87b63bed6be33912c00924')
assert len(request)==7189 and read(O/'controls/joined-request.txt')==request
definition=read(R/'stdo_abiogenesis.json','2c13b1fd28f3aaa624d941537a858f67ca8784f0710f490522147f57964c4051')
stdo_root=pathlib.Path('/Users/jim/Library/Application Support/STDO/releases/v2.5.1-rc.1')
manifest=read(stdo_root/'manifest.json','5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64')
vf=js(V/'freeze.json','974e76464c9834eac24ba69957987428a2bc3e0069838de420aad5508f65fef5')
vchecked=verify_records(V,vf)
assert len(vchecked)==9
af=js(A/'freeze.json','54aa8df9e8b68c0ec35e00d4bc76535deb52698ec925b28e7444e28a23e0c845')
achecked=verify_records(A,af,{'external-record-materials.json','source-chain-inputs.json','source-transition-checks.json'})
df=js(D/'freeze.json','19f97fe0758b204829d4f4695c83f49cc641d1c4affdd7defd46022c36eaa01d')
dchecked=verify_records(D,df,{'activation.json','preimages.json','source.patch','closed-state.json','source-attribution.json','return.md'})
attribution=js(D/'source-attribution.json','7002ae5e6a739a7aed7cbf879ffe978d64aac43743695ae106f67cf0cf0ba6e3')
chains=js(A/'source-chain-inputs.json')
orig=js(A/'external-record-materials.json')['records']
transitions=js(A/'source-transition-checks.json')['checks']
transitions_by_ref={x['member']['ref']:x for x in transitions}
original_locations=[]
for m in orig:
    b=body(m); assert len(b)==m['byteCount'] and 'sha256:'+sha(b)==m['digest']
    p=pathlib.Path(transitions_by_ref[m['ref']]['originalPostimage']) if m['ref'] in transitions_by_ref else R/m['path']
    assert read(p)==b
    original_locations.append({'ref':m['ref'],'sourcePath':str(p),'bytes':len(b),'sha256':sha(b)})

derived=[]
def derive(name,value):
    p=O/'derived'/name; p.parent.mkdir(exist_ok=True)
    b=value if isinstance(value,bytes) else (json.dumps(value,indent=2,ensure_ascii=False)+'\n').encode()
    with p.open('xb') as f:f.write(b)
    m={'ref':'derived-record://abiogenesis/'+str(p.relative_to(R)),'path':str(p.relative_to(R)),
       'digest':'sha256:'+sha(b),'byteCount':len(b),'contentBase64':base64.b64encode(b).decode()}
    derived.append(m); return m
maps={m['ref']:m for m in orig}
ops=[]
all_spans=[]
for f in chains['chains']:
    old=copy.deepcopy(f['candidateChain']); chain=copy.deepcopy(old)
    original_spans=copy.deepcopy(old['attributionSources'])
    for s in original_spans:
        assert span(maps[s['sourceRef']],s['startByte'],s['endByte'])==s
    if f['sourceActivation']=='T287_S03_PUBLIC_HANDOFF_REPAIR_01':
        source=maps[old['closureRef']]; v=json.loads(body(source)); normalized=[]
        for row in v['sources']:
            p=pathlib.Path(row['path']); assert p.is_absolute() and p.is_relative_to(R)
            normalized.append({**row,'path':str(p.relative_to(R))})
        view=derive('s03-closure-member-view.json',{
            'kind':'derived_original_record_path_view','original':member(source),'originalSpan':span(source),
            'repositoryRoot':str(R),'rule':'Only absolute source paths under this exact repository root become repository-relative paths; other source-row fields remain identical.',
            'members':normalized,'limit':'Representation of original closure bytes, not a historical closure, performed source edit, grant or author observation.'})
        chain['closureRef']=view['ref'];chain['attributionSources'].append(span(view));view_refs=[view['ref']]
    else:
        source=maps[old['deltaRef']]; original=body(source)
        converted=re.sub(rb'^--- before/',b'--- a/',original,flags=re.M)
        converted=re.sub(rb'^\+\+\+ after/',b'+++ b/',converted,flags=re.M)
        old_lines=original.splitlines(keepends=True);new_lines=converted.splitlines(keepends=True)
        assert len(old_lines)==len(new_lines)
        changes=[]
        offset=0
        for i,(a,b) in enumerate(zip(old_lines,new_lines)):
            if a!=b:
                assert (a.startswith(b'--- before/') and b==b'--- a/'+a[len(b'--- before/'):]) or (a.startswith(b'+++ after/') and b==b'+++ b/'+a[len(b'+++ after/'):])
                changes.append({'line':i+1,'originalStartByte':offset,'originalEndByte':offset+len(a),'originalLine':a.decode(),'derivedLine':b.decode()})
            offset+=len(a)
        assert changes
        view=derive('selected-action07-header-view.patch',converted)
        relation=derive('selected-action07-header-relation.json',{
            'kind':'derived_original_delta_representation','original':member(source),'originalSpan':span(source),
            'derived':member(view),'rule':'Only --- before/ and +++ after/ header prefixes become a/ and b/. All other bytes, hunk contents and endpoints remain identical.',
            'changedHeaderLines':changes,'limit':'This is a derived view, not the original patch or a newly performed source edit.'})
        chain['deltaRef']=view['ref'];chain['attributionSources'].append(span(relation));view_refs=[view['ref'],relation['ref']]
    grant=maps[f['sourceClaims']['grantRef']];chain['attributionSources'].append(span(grant))
    refs={old[k] for k in ['activationRef','preimageRef','deltaRef','closureRef']}
    refs.update(s['sourceRef'] for s in chain['attributionSources']);refs.update(view_refs)
    for change in chain['changes']:refs.update([change['preimageMemberRef'],change['postimageMemberRef']])
    ops.append({'operation':f['sourceActivation'],'applicability':{'kind':'eight_original_C01_Q01_members','subjectInventory':chains['subjectInventory'],'successorInventory':None},
                'originalChain':old,'candidateChain':chain,'recordRefs':sorted(refs),'sourceClaims':f['sourceClaims'],
                'identityStatus':'Concrete dispatch recipient and Product authority correspondence unresolved; original activation label retained.'})
    all_spans.append({'operation':f['sourceActivation'],'originalAttributionSources':original_spans,'currentAttributionSources':chain['attributionSources']})

dm=[]
for name in ['activation.json','preimages.json','source.patch','closed-state.json','source-attribution.json','return.md','freeze.json']:
    dm.append(record(D/name))
dgrant=record(G/'default-library-publication-repair-controls-01/request.txt');dm.append(dgrant)
dc={pathlib.Path(m['path']).name:m for m in dm}
postmembers=[];changes=[];endpoint_rows=[]
for row in attribution['sources']:
    p=row['logicalPath'];assert row['actualAuthor']['agent']=='/root/s03_phase_b'
    pre=record(D/row['preimage']['path']);post=record(D/row['postimage']['path'])
    for item,k in [(pre,'preimage'),(post,'postimage')]:
        assert item['byteCount']==row[k]['bytes'] and item['digest']=='sha256:'+row[k]['sha256']
    assert next(x for x in df['sources'] if x['logicalPath']==p)['sha256']==row['postimage']['sha256']
    dm.extend([pre,post]);m={'ref':'repo://abiogenesis/'+p,'path':p,'digest':post['digest'],'byteCount':post['byteCount']};postmembers.append(m)
    changes.append({'memberRef':m['ref'],'patchPath':p,'preimageMemberRef':pre['ref'],'postimageMemberRef':post['ref']})
    endpoint_rows.append({'path':p,'preimage':member(pre),'postimage':member(post),'member':m})
dold={'activationRef':dc['activation.json']['ref'],'preimageRef':dc['preimages.json']['ref'],'deltaRef':dc['source.patch']['ref'],'closureRef':dc['closed-state.json']['ref'],
      'authorRef':'T287_DEFAULT_LIBRARY_PUBLICATION_REPAIR_01','actorIdentityRef':'/root/s03_phase_b','authorityRef':None,
      'scopeRefs':[m['ref'] for m in postmembers],'postimageMembers':postmembers,'changes':changes,
      'attributionSources':[span(dc[k]) for k in ['activation.json','closed-state.json','source-attribution.json','return.md']]+[span(dgrant)]}
dview=derive('publication-repair-closure-member-view.json',{
    'kind':'derived_original_logical_member_view','originalClosure':member(dc['closed-state.json']),'originalClosureSpan':span(dc['closed-state.json']),
    'originalSourceAttribution':member(dc['source-attribution.json']),'originalSourceAttributionSpan':span(dc['source-attribution.json']),
    'originalFreeze':member(dc['freeze.json']),
    'rule':'Each original sources[i].logicalPath denotes the repository-relative member path; sources[i].postimage denotes its exact retained body. Bind path to logicalPath and digest/bytes to that postimage without changing either original.',
    'members':[{'path':r['path'],'digest':r['postimage']['digest'],'byteCount':r['postimage']['byteCount'],'originalSourceIndex':i,'originalPostimageRef':r['postimage']['ref']} for i,r in enumerate(endpoint_rows)],
    'limit':'An explicitly derived coordinate view of the CLOSED three-file operation. Not original closure bytes, new source edits, authority or a successor inventory.'})
dchain=copy.deepcopy(dold);dchain['closureRef']=dview['ref'];dchain['attributionSources'].append(span(dview))
ops.append({'operation':'T287_DEFAULT_LIBRARY_PUBLICATION_REPAIR_01','applicability':{'kind':'independent_closed_three_file_operation','sourceCut':{'path':str((D/'freeze.json').relative_to(R)),'digest':'sha256:'+sha(read(D/'freeze.json'))},'subjectInventory':None,'successorInventory':None,'notC01Q01Postimages':True},
            'originalChain':dold,'candidateChain':dchain,'recordRefs':sorted([m['ref'] for m in dm]+[dview['ref']]),
            'sourceClaims':{'grantRef':dgrant['ref'],'closedReturnRef':dc['return.md']['ref'],'actualExternalAgent':'/root/s03_phase_b','sessionId':None,'sessionRecordText':'not separately available','nativeABGAuthorship':False},
            'identityStatus':'Source records identify the external task agent; grant-to-Product authority correspondence and actual native assessor comparison unresolved.'})
all_spans.append({'operation':ops[-1]['operation'],'originalAttributionSources':dold['attributionSources'],'currentAttributionSources':dchain['attributionSources']})
for m in dm:
    original_locations.append({'ref':m['ref'],'sourcePath':str(R/m['path']),'bytes':m['byteCount'],'sha256':m['digest'][7:]})
orig.extend(dm)
assert len({m['ref'] for m in orig})==len(orig)

# These are narrowly routed contemporaneous selection records, not a broad
# history search or proof of identities that the text does not contain.
execution=read(G/'execution.md');lines=execution.splitlines(keepends=True)
dispatch=[]
for name,lo,hi in [('selected-action07-selection',3748,3767),('s03-handoff-selection',4324,4378),('publication-repair-selection',4917,4925)]:
    start=sum(map(len,lines[:lo-1]));end=sum(map(len,lines[:hi]));b=execution[start:end]
    p=O/'acquired'/f'{name}.txt';p.parent.mkdir(exist_ok=True);p.write_bytes(b)
    dispatch.append({'name':name,'sourcePath':str((G/'execution.md').relative_to(R)),'observedWholeFileBytes':len(execution),'observedWholeFileSha256':sha(execution),
       'startLine':lo,'endLine':hi,'startByte':start,'endByte':end,'spanDigest':'sha256:'+sha(b),'acquiredPath':str(p.relative_to(O)),
       'establishes':'Original selection and bounded grant, not concrete dispatch recipient or Product authority-slot occupancy.'})

save('original-record-materials.json',{'kind':'acquired_original_external_records','records':orig,'limits':'Original bodies, references, digests and byte spans conserved. Body acquisition creates no attribution judgment.'})
save('derived-record-materials.json',{'kind':'truthful_derived_external_correspondence','records':derived,'limits':'Views are new representation artifacts; original historical bytes remain separately present.'})
save('operation-inputs.json',{'kind':'partial_external_correspondence_operations','notLaunchReady':True,'operations':ops,'counts':{'originalC01Q01Members':8,'independentDOperationMembers':3,'combinedCurrentCandidateMembers':None},'fullProvenanceOrTask':False,'nativeEffects':0})
save('source-spans.json',{'operations':all_spans,'rootSelectionObservations':dispatch})
save('original-source-locations.json',{'records':original_locations})
save('input-verification.json',{'status':'selected_inputs_byte_verified','separatelyAuthoredReviewLocalRecords':vchecked,'originalASelectedRecords':achecked,'DSelectedRecords':dchecked,
 'originalRecordCount':len(orig),'originalRecordBytes':sum(m['byteCount'] for m in orig),'originalAttributionSpansConserved':sum(len(x['originalAttributionSources']) for x in all_spans),
 'actualDefinitionFileSha256':sha(definition),'actualInstalledManifestSha256':sha(manifest),'a_cJoinEqualsExactGrant':True,'successorConsumed':False,'wholeInventoryProcessed':False,
 'consumedInputs':list(consumed.values()),'elapsedSeconds':time.monotonic()-started})
print(json.dumps({'originalRecords':len(orig),'derivedRecords':len(derived),'operations':[(o['operation'],len(o['candidateChain']['changes'])) for o in ops],'pendingIdentityJoins':True,'successorBinding':None}))
