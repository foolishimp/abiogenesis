#!/usr/bin/env python3
"""Third and final bounded read/check group. Never executes captured commands."""
import base64, datetime, hashlib, json, pathlib, re, signal, time
signal.alarm(120)
began=time.monotonic()
O=pathlib.Path(__file__).resolve().parent;G=O.parent;R=G.parents[3]
A=G/'final-f11-attribution-correspondence-02'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
def save(name,obj):
    with (O/name).open('x') as f:json.dump(obj,f,indent=2,ensure_ascii=False);f.write('\n')
def loc(p):
    b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def texts(value):
    if isinstance(value,str):return [value]
    if isinstance(value,list):return [s for v in value for s in texts(v)]
    if isinstance(value,dict):return [s for k,v in value.items() if k in ['text','output','content'] for s in texts(v)]
    return []
g1=read(O/'acquisition-group-1.json');g2=read(O/'acquisition-group-2.json')
sessions={s['role']:s for s in g1['sessions']}
assert set(sessions)=={'parent','selected_action','s03_phase_b'}
expected={'parent':('01a0edbb-7c4f-7493-bf06-2a600644bbb6',None,None),
 'selected_action':('01a0edc1-320d-7403-98ce-670c97b96ecb','/root/selected_action','01a0edbb-7c4f-7493-bf06-2a600644bbb6'),
 's03_phase_b':('01a0f036-c7b5-7f40-b1d8-e53a1fcf24f4','/root/s03_phase_b','01a0edbb-7c4f-7493-bf06-2a600644bbb6')}
sourceChecks=[]
for role,s in sessions.items():
    p=pathlib.Path(s['path'])
    with p.open('rb') as f:
        prefix=f.read(s['capturedPrefixLength']);assert len(prefix)==s['capturedPrefixLength'] and sha(prefix)==s['capturedPrefixSha256']
        m=s['metadata'];raw=prefix[m['startByte']:m['endByte']];assert sha(raw)==m['recordSha256'];metadata=json.loads(raw)['payload']
        actual=(metadata.get('id'),metadata.get('agent_path'),metadata.get('parent_thread_id'));assert actual==expected[role]
        if role!='parent':
            spawn=metadata['source']['subagent']['thread_spawn'];assert spawn['agent_path']==actual[1] and spawn['parent_thread_id']==actual[2]
        for r in [x for x in g2['exactSourceRecordsAndProjections'] if x['sessionRole']==role]:
            b=prefix[r['startByte']:r['endByte']];assert sha(b)==r['containingRecordSha256']
            artifact=(O/r['path']).read_bytes();assert len(artifact)==r['bytes'] and sha(artifact)==r['sha256']
            if r['kind'].startswith('exact_original_'):assert artifact==b
            else:
                assert role=='parent' and r['sourceLine']==1215
                q=json.loads(b)['payload'];args=json.loads(q['arguments']);projection=json.loads(artifact)
                assert projection['target']==args['target']=='selected_action'
                assert projection['messageOmitted'] and not projection['messageReadOrDecoded']
            sourceChecks.append({'sessionRole':role,'line':r['sourceLine'],'range':[r['startByte'],r['endByte']],'containingRecordSha256':sha(b),'verified':True})

# The selected-action source tool bundled later source-reading diagnostics.
# Export only its actual first source-edit command and completed-call output
# envelope. These are labeled field projections, never claimed as full records.
for r in g2['exactSourceRecordsAndProjections']:
    if r['sessionRole']!='selected_action' or r['sourceLine'] not in [1354,1358]:continue
    p=O/r['path'];original=read(p);q=original['payload']
    if r['sourceLine']==1354:
        inp=q['input'];marker='text((await tools.exec_command';positions=[m.start() for m in re.finditer(re.escape(marker),inp)]
        assert len(positions)==2 and positions[0]==0
        value=inp[:positions[1]];projection={'kind':'source_tool_input_field_projection','timestamp':original['timestamp'],'call_id':q['call_id'],'tool':q['name'],
          'sourceField':'payload.input','decodedFieldUtf8StartByte':0,'decodedFieldUtf8EndByte':len(value.encode()),'decodedFieldSpanSha256':sha(value.encode()),
          'input':value,'omission':'The second bundled command performs source-reading diagnostics and is omitted. No captured command is executed.'}
    else:
        output=q['output'];assert len(output)>=2 and 'Script completed' in output[0]['text'] and output[1]['text']==''
        projection={'kind':'source_tool_output_field_projection','timestamp':original['timestamp'],'call_id':q['call_id'],
          'selectedSourceFields':['payload.output[0]','payload.output[1]'],'output':output[:2],
          'limit':'Outer tool completed; first inner exec output is empty. The original wrapper printed .output only, so its numeric exit code is not retained in this record. Later exact closure and endpoint evidence supplies the resulting-byte join. Subsequent bundled read output is omitted.'}
    b=(json.dumps(projection,indent=2,ensure_ascii=False)+'\n').encode();p.write_bytes(b)
    r['kind']='field_projection_not_original_complete_record';r['bytes']=len(b);r['sha256']=sha(b)
g2['extractedBytes']=sum(r['bytes'] for r in g2['exactSourceRecordsAndProjections'])
g2['minimalityRefinement']='Selected-action bundled source-read diagnostics removed; source-edit input and paired completion/empty-first-output are explicit field projections with unchanged original containing-record coordinates.'
(O/'acquisition-group-2.json').write_text(json.dumps(g2,indent=2)+'\n')

# Reacquire only the exact accepted A02 input cut and its routed immutable
# originals. The old unavailable observations remain unchanged at that cut.
fbytes=(A/'freeze.json').read_bytes();assert len(fbytes)==10777 and sha(fbytes)=='df4ff0bfe902a52b306565c5766d7042f73e0c94270dadb8369c4808b58daeac'
af=json.loads(fbytes);assert len(af['records'])==48
oldChecked=[]
for row in af['records']:
    p=A/row['path'];b=p.read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256'];oldChecked.append(row)
assert sha((A/'return.md').read_bytes())=='32003ec812e3dd1a827f9da8a981c114d4ad99d96f37c1c7990ecebb60f62cc4'
ops=read(A/'operation-inputs-with-supplements.json')['operations']
oldmaterial=read(A/'original-record-materials.json')['records'];oldderived=read(A/'derived-record-materials.json')['records'];oldsupp=read(A/'supplemental-record-materials.json')['records']
bym={m['ref']:m for m in oldmaterial+oldderived+oldsupp}
for m in bym.values():
    b=base64.b64decode(m['contentBase64'],validate=True);assert len(b)==m['byteCount'] and 'sha256:'+sha(b)==m['digest']
for row in read(A/'original-source-locations.json')['records']:
    p=pathlib.Path(row['sourcePath']);b=p.read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256']
for op in ops:
    for s in op['candidateChain']['attributionSources']:
        b=base64.b64decode(bym[s['sourceRef']]['contentBase64'],validate=True)
        assert 'sha256:'+sha(b[s['startByte']:s['endByte']])==s['spanDigest']
endpoint=read(A/'endpoint-reconstruction.json');check=read(A/'correspondence-checks.json')
assert len(endpoint['checks'])==11 and len(check['tests'])==3 and check['oldEightUnionStatus']=='insufficient'
assert sum(len(t['negatives']) for t in check['tests'])==18

extracts={(r['sessionRole'],r['sourceLine']):r for r in g2['exactSourceRecordsAndProjections']}
def payload(role,line):
    v=read(O/extracts[(role,line)]['path']);return v.get('payload',v)
def inp(role,line):
    q=payload(role,line);return q.get('input',q.get('arguments',''))
def outcome(role,line):
    q=payload(role,line);ss=texts(q.get('output'));text='\n'.join(ss)
    codes=[]
    for s in ss:
        try:v=json.loads(s)
        except (ValueError,TypeError):continue
        if isinstance(v,dict) and 'exit_code' in v:codes.append(v['exit_code'])
    return {'outerScriptCompleted':'Script completed' in text,'explicitInnerExitCodes':codes,
       'innerExitCodeUnavailable':not codes,'text':text}
calls=[]
for r in g2['callSummaries']:
    role,line=r['role'],r['line'];paired=r['outputLines'];assert len(paired)==1
    result=outcome(role,paired[0]);isdispatch=role=='parent' and line==1215
    if not isdispatch:assert result['outerScriptCompleted'],(role,line)
    calls.append({**r,'inputRecord':extracts[(role,line)],'outputRecord':extracts[(role,paired[0])],
      'outcome':{k:v for k,v in result.items() if k!='text'},
      'observationClass':'dispatch_target_only' if isdispatch else 'original_tool_call_and_paired_completed_outer_result',
      'notExecutedByThisWorker':True})
sourceRows=[]
opSpecs=[
 (ops[0],'s03_phase_b',[c['line'] for c in calls if c['role']=='s03_phase_b' and 815<c['line']<1396],815,[1396]),
 (ops[1],'selected_action',[1354],1354,[1460,1474,1483]),
 (ops[2],'s03_phase_b',[2672],2660,[2767,2788,2795])]
for op,role,effectLines,activationLine,closureLines in opSpecs:
    actor=expected[role][1];sid=expected[role][0];chain=op['candidateChain'];members=chain['postimageMembers']
    membersWithCalls=[]
    for m in members:
        basename=pathlib.Path(m['path']).name
        matches=[]
        for line in effectLines:
            code=inp(role,line)
            if basename in code and any(x in code for x in ['apply_patch','write_text','write_bytes','writeFileSync']):
                matches.append({'line':line,'callId':extracts[(role,line)]['callId'],'recordPath':extracts[(role,line)]['path']})
        assert matches,(op['operation'],basename,effectLines)
        ep=next(e for e in endpoint['checks'] if e['operation']==op['operation'] and e['memberRef']==m['ref'])
        membersWithCalls.append({'member':m,'sourceEffectRecords':matches,'retainedEndpointProof':ep})
    grant=bym[op['sourceClaims']['grantRef']]
    anchors=[]
    # Direct digest sightings are distinguished from path/manifest joins.
    related=[c for c in calls if c['role']==role and c['line'] in [activationLine,*effectLines,*closureLines]]
    allInput='\n'.join(inp(role,c['line']) for c in related)
    allOutput='\n'.join(outcome(role,c['outputLines'][0])['text'] for c in related)
    if role=='selected_action':
        allInput+='\n'+inp('parent',1208);allOutput+='\n'+outcome('parent',1213)['text']
    for key,ref in [('request',grant['ref']),('activation',op['originalChain']['activationRef']),('preimage',op['originalChain']['preimageRef']),('delta',op['originalChain']['deltaRef']),('closure',op['originalChain']['closureRef']),('return',op['sourceClaims']['closedReturnRef'])]:
        m=bym[ref];dg=m['digest'][7:]
        anchors.append({'relation':key,'ref':ref,'path':m['path'],'digest':m['digest'],'bytes':m['byteCount'],
          'digestObservedInSelectedToolInput':dg in allInput,'digestObservedInSelectedToolOutput':dg in allOutput,
          'basis':'Exact immutable A02 original bytes verified; tool-call paths/manifests bind capture/closure. Direct hash observation is reported separately, never inferred from a label.'})
    # Existing original manifests supply request joins, without rewriting them.
    pre=json.loads(base64.b64decode(bym[op['originalChain']['preimageRef']]['contentBase64']))
    requestField=pre.get('requestSha256') or pre.get('grant',{}).get('sha256') or pre.get('request',{}).get('sha256')
    if requestField is not None:assert requestField==grant['digest'][7:]
    sourceRows.append({'operation':op['operation'],'applicabilityConserved':op['applicability'],'actualExternalAgentPath':actor,'actualSessionId':sid,
      'parentSessionId':expected[role][2],'sessionMetadata':role+'-session-metadata.json','actualModel':None,'actualModelProfile':None,'explicitModelProvider':'openai',
      'sourceEffectLines':effectLines,'activationCaptureLine':activationLine,'closureLines':closureLines,
      'sourceOperationMemberJoins':membersWithCalls,'originalRecordJoins':anchors,
      'requestDigestFieldObservedInOriginalPreimageOrActivation':requestField,
      'changedEvidenceStatus':'Newly acquired original session metadata and actual source-operation records support the performing external actor/session correspondence. Earlier unknown/unavailable statements remain true descriptions of the evidence available at their cut.',
      'proofSeparation':{'assignment':'Original request and dispatch/capture context, with selected-action parent target metadata; opaque message content not consumed.',
       'attemptedEffect':'Exact source-edit tool call attributed to the actual child session; captured command inspected only.',
       'toolOutcome':'Exact paired outer tool completion, with numeric inner exit codes only where actually retained. An omitted numeric code is not invented.',
       'finalBytes':'Original capture/closure records plus unchanged A02 eleven endpoint reconstruction proof. No source test or patch execution rerun.',
       'inference':'Correspondence of an externally performed operation to its actual session is grounded by the conjunction above. It does not establish all inherited semantic authorship or a qualified/native attribution judgment.'},
      'qualificationAuthorityRef':None,'nativeABGAuthorIdentity':None,'actualAssessorIdentity':None,'nativeIndependenceEstablished':False})
assert len(sourceRows)==3 and sum(len(x['sourceOperationMemberJoins']) for x in sourceRows)==11
save('session-operation-correspondence.json',{'status':'new_original_external_session_and_source_effect_correspondence_acquired','operations':sourceRows,
 'sameActorConservation':'S03 and D share /root/s03_phase_b and the same session ID. Operation labels do not create independent actors.',
 'oldCutPreserved':{'freeze':'sha256:df4ff0bfe902a52b306565c5766d7042f73e0c94270dadb8369c4808b58daeac','return':'sha256:32003ec812e3dd1a827f9da8a981c114d4ad99d96f37c1c7990ecebb60f62cc4'},
 'successorBinding':None,'fullQualificationTaskOrSchemaEvaluation':False})
save('source-tool-records.json',{'calls':calls,'commandsExecutedByThisWorker':0,'limits':'Inspect-only original records. Call completion and exact final endpoints are distinct observations; hidden message content and suppressed inner exit codes remain unobserved.'})
save('verification.json',{'group':3,'status':'all_exact_scoped_checks_passed','sourceRangeChecks':sourceChecks,
 'sessionPrefixCoordinates':[{'role':s['role'],'path':s['path'],'prefixLength':s['capturedPrefixLength'],'prefixSha256':s['capturedPrefixSha256'],'throughLine':s['capturedThroughLine']} for s in sessions.values()],
 'prefixMeaning':'Fixed captured prefixes in append-active files; no later whole-file hash is treated as the original subject.',
 'A02LocalRecordsVerified':oldChecked,'A02OriginalBodiesVerified':len(oldmaterial),'A02DerivedBodiesVerified':len(oldderived),'A02SupplementalBodiesVerified':len(oldsupp),
 'A02EndpointProofReused':11,'A02NegativeChecksReused':18,'sourceTestsRerun':0,'nativeOrQualificationChecksRun':0,
 'newMaterialMismatch':None,'privacyChecks':{'onlyThreeRoutedSessions':True,'noFullRolloutsExported':True,'noSystemDeveloperInstructionsExported':True,'noPrivateReasoningExported':True,'noOpaqueMessageExportOrDecryption':True,'noTranscriptCommandsExecuted':True}})
save('residuals.json',{'resolvedAtThisNewCut':['Concrete original session IDs for both external agents','Original performing actor-to-source-operation correspondence for selected-action07, S03 and D at their exact scopes'],
 'stillOpen':['Product qualification authority-slot correspondence for actual source grants','Actual source-grounded semantic attribution sufficiency for the eventually selected task/criteria','Actual native assessor/peer identity, transport, grant and author/assessor independence','Any inherited relevant semantic authorship outside these exact source operations','Explicit later successor inventory/material/task binding'],
 'notAssumed':['Product-owner capability from a policy constant','A renamed actor providing independence','Historic ABG-native author events','Exact runtime model/profile from requested Astra/xhigh text','Successful numeric inner process exit when the old wrapper retained output only'],
 'noNewScope':'No moving native/Q outputs, successor inventory, whole-population records, source implementation, Product or Git changes were selected.'})
save('triangulation.json',{'trigger':'Earlier records exposed activation labels and incomplete present recollections; Root now routed exact original session metadata and source effects.',
 'ProductDesign':'Existing external-construction law permits actual source-grounded correspondence and does not require invented past ABG events. No Product or design change is demonstrated.',
 'Identity':'Actual session_meta establishes actor paths and thread/parent IDs. Source-operation call and closure records join those identities to these eleven endpoints.',
 'Authority':'Original grants are conserved. A source-operation grant and actual performer are different variables from occupancy of the published qualification Product-owner capability. The latter remains unestablished.',
 'LifecycleEffect':'Original historical edits and this present acquisition are distinct effects. Old unavailable statements are not rewritten; the newly routed original evidence changes the current available evidence set.',
 'IntegrationProof':'Assignment metadata, concrete source-edit calls, actual paired outputs and final immutable endpoint proof are conjoined. Assignment alone was insufficient at A02; source commands are never re-executed to manufacture evidence.',
 'escapeRecurrence':'The earlier author gap arose from incomplete source-record acquisition, not demonstrated missing design or source-code behavior. Exact existing local-session routes now supply the omitted observation. Broad history sweeps and new runtime identity mechanisms are unnecessary.',
 'smallestReentry':'realization_refactor of bounded external evidence; unchanged owners and original operation scopes',
 'rulingLimit':'External factual correspondence only; no independent assurance, native J/O, authority ruling, readiness or release claim.'})
elapsed=time.monotonic()-began;total=g1['elapsedSeconds']+g2['elapsedSeconds']+elapsed;assert total<363
now=datetime.datetime.now(datetime.timezone.utc);activation=read(O/'activation.json');wall=(now-datetime.datetime.fromisoformat(activation['at'])).total_seconds()
save('costs.json',{'serialReadCheckGroups':3,'perGroupTimeoutSeconds':120,'perGroupGraceAllowanceMilliseconds':1000,'aggregateLimitSeconds':363,
 'measuredGroupSeconds':[g1['elapsedSeconds'],g2['elapsedSeconds'],elapsed],'aggregateMeasuredReadCheckSeconds':total,
 'elapsedWorkerWallSecondsIncludingReasoning':wall,'sessionPrefixBytesHashed':sum(s['capturedPrefixLength'] for s in sessions.values()),
 'minimalExtractBytes':g2['extractedBytes'],'selectedToolCalls':len(calls),'selectedToolAndOutputExtracts':len(g2['exactSourceRecordsAndProjections']),
 'fullRolloutsCopied':0,'actualSourceEdits':0,'nativeProviderCalls':0,'newQualificationChecks':0,'monetaryCostKnown':False})
brief='\n'.join(f'- `{x["operation"]}` → `{x["actualExternalAgentPath"]}` / `{x["actualSessionId"]}`; source effects at lines `{", ".join(map(str,x["sourceEffectLines"]))}`.' for x in sourceRows)
report=f'''# F11 session correspondence03 — CLOSED Worker supplement

Original session metadata and actual source-edit tool records now establish the performing external actor/session correspondence for the three already bounded source operations. This is newly acquired original evidence. A02 and its earlier unknown/unavailable observations remain unchanged.

{brief}

Both child sessions identify parent `01a0edbb-7c4f-7493-bf06-2a600644bbb6`. The exact actor/session metadata is exported as a labeled field projection, not a complete session record. It records provider `openai`; no exact runtime model/profile is asserted from the original requested Astra/xhigh labels.

## Evidence and joins

Selected-action07's actual source edit is `call_ahIzrSfqxJKrJ6PUavkIESxW`, recorded at `2026-09-29T17:05:53.346Z`, line1354. It captures original preimages and the request digest and writes all four retained members. Its paired line1358 records completed outer execution; the original wrapper printed only inner `.output`, so no numeric inner exit status is invented. The original capture/closure calls at1460/1474/1483 and their outputs bind the preserved source patch, return and freeze. Root's request-construction output binds the original request SHA `b4de58f9016ed4006cfac55947a6f0310b0df8e6e7e1abe4d763f42ff428af6f`; followup metadata targets `selected_action`. Its opaque message is omitted and was not decoded.

S03's line815 records activation/preimage capture. The intervening actual source-edit records and paired outputs are bound per member in [session-operation-correspondence.json](session-operation-correspondence.json), followed by the original closure at1396. D's line2660 records its separate activation, line2672 is the actual three-file apply_patch, and2767/2788/2795 record source attribution, closure and freeze. Direct observed digest anchors are listed separately from exact path/manifest joins; a matching filename is never described as an observed digest.

[Source-tool records](source-tool-records.json) join {len(calls)} selected calls to their actual paired outputs. The first two selected-action extracts are explicit field projections that omit bundled unrelated source-read diagnostics. All other retained source tool records are exact original record bytes; the parent dispatch is a target/time/call-id projection. The extracts total {g2['extractedBytes']:,} bytes. No command from any transcript was executed.

[Verification](verification.json) binds exact byte ranges and containing-record hashes within three fixed prefix coordinates. The files are append-active; these prefix lengths/hashes are the acquired subject, not their later whole-file identity. All48 A02 local records,40 original material bodies,4 derived bodies,4 prior supplemental bodies and attribution spans verify unchanged. Its eleven exact endpoint reconstructions and eighteen negative checks are reused, not rerun. Eight members remain at C01/Q01 and D's three remain its separate operation cut. No successor or moving native/Q inputs were consumed.

## Interpretation and remaining limits

The new observation closes the factual acquisition gap behind selected-action07's former unknown performer and the formerly unavailable session identifiers. [Triangulation](triangulation.json) separates identity, assignment, attempted source effect, paired tool outcome, immutable resulting bytes and authority. The evidence points to incomplete record acquisition in the prior bounded input task, not a demonstrated missing Product design or need for new runtime machinery.

The original source grants still do not establish the qualification Product-owner capability correspondence. Actual semantic attribution sufficiency, the eventual task/criterion scope, inherited relevant semantic authorship, actual native assessor/peer identity and independence remain separate. S03 and D are the same actual external actor/session; labels cannot make them independent. No historical ABG author event, full provenance/task validation, native J/O, F_H, AF22, qualification readiness or release claim is produced. [Residuals](residuals.json) retain these limits.

## Scope and stop

Worker `/root/f11_attribution_inputs` explicitly transitioned from CLOSED correspondence02 to `T287_F11_SESSION_CORRESPONDENCE_03` under the exact6518-byte installed-a_c request SHA `f4c776df74886347e886d354ff150b6326685683edda8152e09f5bf8edfb05de`. The same STDO v2.5.1-rc.1, Product/QUAL057 and accepted D4/D5 Section3 govern. Root remains Executive; this Worker does not assure its own cut.

Only this new output territory was written. Exactly three routed session files were read. No entire rollout, system/developer instruction, private reasoning, unrelated conversation, opaque encrypted message, credential or unrelated user data is exported. No source/Product/prior-cut/session/Git/native mutation occurred. Three capped read/check groups consumed {total:.3f} measured seconds; Worker wall time including reasoning was {wall:.1f} seconds. Full costs are in [costs.json](costs.json).

One new supplement is frozen and returned to Root. Worker CLOSED; no Reviewer or successor activated.
'''
with (O/'return.md').open('x') as f:f.write(report)
rows=[]
for p in sorted(O.rglob('*')):
    if p.is_file():
        b=p.read_bytes();rows.append({'path':str(p.relative_to(O)),'bytes':len(b),'sha256':sha(b)})
freeze={'status':'CLOSED','activation':'T287_F11_SESSION_CORRESPONDENCE_03','worker':'/root/f11_attribution_inputs','frozenAt':now.isoformat(),
 'return':next(x for x in rows if x['path']=='return.md'),'records':rows,'oldA02FreezeSha256':'df4ff0bfe902a52b306565c5766d7042f73e0c94270dadb8369c4808b58daeac',
 'sourceSessionPrefixes':[{k:s[k] for k in ['role','path','capturedPrefixLength','capturedPrefixSha256','capturedThroughLine']} for s in sessions.values()],
 'actualSourceOperationCount':3,'memberScope':{'originalC01Q01':8,'independentD':3},'qualificationAuthorityRef':None,'nativeIndependenceEstablished':False,'successorBinding':None,
 'effects':'New bounded evidence supplement only; captured original commands never executed','stop':'Frozen once; returned to Root; no further actor or work activation.'}
save('freeze.json',freeze)
for row in rows:
    b=(O/row['path']).read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256']
print(json.dumps({'status':'CLOSED','freeze':loc(O/'freeze.json'),'return':loc(O/'return.md'),'records':len(rows),'totalRecordBytes':sum(r['bytes'] for r in rows),'extractBytes':g2['extractedBytes'],'sourceOperations':[{k:x[k] for k in ['operation','actualExternalAgentPath','actualSessionId','sourceEffectLines']} for x in sourceRows],'readCheckSeconds':total},indent=2))
