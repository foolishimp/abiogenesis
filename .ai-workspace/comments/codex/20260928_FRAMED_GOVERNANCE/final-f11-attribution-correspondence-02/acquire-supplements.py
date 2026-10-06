#!/usr/bin/env python3
"""Acquire CLOSED present accounts; never rewrite historical records."""
import base64, copy, hashlib, json, pathlib
O=pathlib.Path(__file__).resolve().parent;G=O.parent;R=G.parents[3];S=G/'source-author-observation-01'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p,d=None,n=None):
    b=p.read_bytes()
    if d:assert sha(b)==d
    if n is not None:assert len(b)==n
    return b
def save(p,v):
    with (O/p).open('x') as f:json.dump(v,f,indent=2,ensure_ascii=False);f.write('\n')
def material(p):
    b=read(p);return {'ref':'external-record://abiogenesis/'+str(p.relative_to(R)),
     'path':str(p.relative_to(R)),'digest':'sha256:'+sha(b),'byteCount':len(b),'contentBase64':base64.b64encode(b).decode()}
def span(m):return {'sourceRef':m['ref'],'startByte':0,'endByte':m['byteCount'],'spanDigest':m['digest']}
frozen=read(S/'freeze.json','03373c18ea01825317ab3f02a07698b5eb5c17eb030ba53a7c1fff26a46c76fd',2403);f=json.loads(frozen)
for row in f['records']:read(S/row['path'],row['sha256'],row['bytes'])
for row in f['originalInputs']:read(G/row['path'],row['sha256'],row['bytes'])
records=[material(S/row['path']) for row in f['records']]+[material(S/'freeze.json')]
byname={pathlib.Path(m['path']).name:m for m in records}
op_input=json.loads((O/'operation-inputs.json').read_text())
spans=[]
for op in op_input['operations'][:2]:
    s03=op['operation']=='T287_S03_PUBLIC_HANDOFF_REPAIR_01';name='s03-account.md' if s03 else 'selected-action-account.md'
    selected=[byname['record.json'],byname[name],byname['freeze.json']]
    op['recordRefs']=sorted(set(op['recordRefs']+[m['ref'] for m in selected]))
    op['candidateChain']['attributionSources'].extend(span(m) for m in selected)
    op['sourceClaims']['supplementalEvidence']={
       'kind':'present_retrospective_source_statement','recordRef':byname['record.json']['ref'],'accountRef':byname[name]['ref'],'freezeRef':byname['freeze.json']['ref'],
       'recordedDate':'2026-09-30','recordingActor':'/root',
       'actualAddressedAgent':'/root/s03_phase_b' if s03 else '/root/selected_action',
       'supportsOperationPerformance':s03,'supportsAssignmentCorrespondence':True,
       'separateSessionIdentifier':None,'nativeABGAttribution':False,'productOwnerAuthority':None,
       'limit':'New source-grounded statement retained with exact originals. No recovered contemporaneous dispatch transcript, historical rewrite, native event, authority grant or independent assessment.'}
    if s03:
        op['candidateChain']['actorIdentityRef']='/root/s03_phase_b'
        op['identityStatus']='Present actual-agent performance statement supplies a source-grounded external identity claim. Attribution sufficiency and authority/assessor joins remain unassessed.'
    else:
        assert op['candidateChain']['actorIdentityRef'] is None
        op['identityStatus']='Present assignment correspondence to /root/selected_action is known, but that actor cannot establish performance. Actual source-operation author remains unknown.'
    spans.append({'operation':op['operation'],'supplementalAttributionSources':[span(m) for m in selected]})
op_input['supplementalEvidenceStatus']='Source-grounded input assertions only; no admitted semantic attribution judgment.'
save('supplemental-record-materials.json',{'kind':'new_present_accounts_supplementing_conserved_originals','records':records,'verifiedOriginalJoins':f['originalInputs'],'limits':f['limits']})
save('operation-inputs-with-supplements.json',op_input)
save('supplemental-source-spans.json',{'records':spans,'actualSourcePaths':[str(S/row['path']) for row in f['records']]+[str(S/'freeze.json')],
  'sourceFreeze':{'path':str(S/'freeze.json'),'bytes':len(frozen),'sha256':sha(frozen)}})
print(json.dumps({'supplementalRecords':len(records),'verifiedOldJoins':len(f['originalInputs']),'S03SourceGroundedPerformanceClaim':'/root/s03_phase_b','selectedActionAssignment':'/root/selected_action','selectedActionPerformanceActor':None,'authorityCorrespondence':None}))
