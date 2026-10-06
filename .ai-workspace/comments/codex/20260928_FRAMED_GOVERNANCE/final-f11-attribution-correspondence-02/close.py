#!/usr/bin/env python3
"""One frozen bounded Worker return. Does not qualify or activate work."""
import base64, datetime, hashlib, json, pathlib, time
O=pathlib.Path(__file__).resolve().parent;G=O.parent;R=G.parents[3]
C=G/'final-candidate-construction-01';source=C/'source-freeze/repo'
read=lambda p:json.loads((O/p).read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
def save(p,v):
    with (O/p).open('x') as f:json.dump(v,f,indent=2,ensure_ascii=False);f.write('\n')
def file(p):
    b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
def span(m):return {'sourceRef':m['ref'],'startByte':0,'endByte':m['byteCount'],'spanDigest':m['digest']}
originals=read('original-record-materials.json')['records'];derived=read('derived-record-materials.json')['records'];supp=read('supplemental-record-materials.json')['records']
byref={m['ref']:m for m in originals+derived+supp}
ops=read('operation-inputs-with-supplements.json')['operations'];checks=read('correspondence-checks.json');endpoints=read('endpoint-reconstruction.json')
assert len(endpoints['checks'])==11 and checks['oldEightUnionStatus']=='insufficient'
assert all(t['derivedByteBranch']['status']=='insufficient' and t['originalCarrierStatus']=='invalid' and all(x=='invalid' for x in t['negatives'].values()) for t in checks['tests'])
assert [o['candidateChain']['actorIdentityRef'] for o in ops]==['/root/s03_phase_b',None,'/root/s03_phase_b']
assert all(o['candidateChain']['authorityRef'] is None for o in ops)

# Bind exact authority excerpts rather than promoting commentary to law.
authority=[]
for logical,lo,hi in [
 ('specification/requirements/product/REQ-P-QUAL.md',219,263),
 ('specification/requirements/product/REQ-P-QUAL.md',338,371),
 ('build_tenants/abiogenesis/typescript/design/T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md',53,63),
 ('build_tenants/abiogenesis/typescript/code/src/validator/qualification_contracts.ts',109,141),
 ('build_tenants/abiogenesis/typescript/code/src/validator/qualification.ts',644,714)]:
    p=source/logical;b=p.read_bytes();lines=b.splitlines(keepends=True)
    start=sum(map(len,lines[:lo-1]));end=sum(map(len,lines[:hi]));excerpt=b[start:end]
    authority.append({'sourceRef':'repo://abiogenesis/'+logical,'frozenSourcePath':str(p),'sourceBytes':len(b),'sourceDigest':'sha256:'+sha(b),
      'startLine':lo,'endLine':hi,'startByte':start,'endByte':end,'spanDigest':'sha256:'+sha(excerpt),'text':excerpt.decode()})
save('authority-spans.json',{'basis':'C01 frozen source authority and unchanged installed owner, selected by the exact current request','spans':authority,
 'limits':'Definition-file and installed-manifest identities are separately verified. These source routes confer no missing historical actor or current authority-slot occupancy.'})

identity=[]
for op in ops:
    chain=op['candidateChain'];claims=op['sourceClaims'];sources=chain['attributionSources']
    identity.append({'operation':op['operation'],'exactScope':chain['postimageMembers'],'authorRefMeaning':'Original operation activation identifier, not a substitute concrete actor',
      'authorRef':chain['authorRef'],'actorIdentityRef':chain['actorIdentityRef'],'sourceClaims':claims,'sourceSpans':sources,
      'scopeStatus':op['identityStatus'],'grantRef':claims['grantRef'],'grantSpan':span(byref[claims['grantRef']]),
      'authorityRef':None,'authorityCorrespondence':'An authentic source operation grant is known. Correspondence to the published qualification Product-owner capability is not established by these records.',
      'separateSessionIdentifier':None,'nativeABGAuthorship':False,'attributionSemanticJudgment':None,'actualAssessorIdentity':None,'independenceEstablished':False})
save('identity-correspondence.json',{'kind':'source_grounded_external_input_correspondence_not_assurance','operations':identity,
 'sameActualAgentObservation':'S03 and D cite the same external agent /root/s03_phase_b. Do not rename either operation into a distinct person or assessor.',
 'selectedActionAssignmentOnly':'/root/selected_action retains assignment and safe-stop, but cannot establish its performance of the source operation. candidateChain.actorIdentityRef remains null.',
 'semanticAuthorshipLimit':'The statements concern exactly these source operations. They do not attribute inherited code or every copied/generated file to the operation author or later preservation/build operator.',
 'publishedAuthoritySlot':'actor-capability://abiogenesis/qualification/product-owner@5',
 'slotIsNotGrant':True,'nativeEventsOrAssessmentProduced':False})

selected=ops[1];s03=ops[0];d=ops[2]
residuals=[
 {'id':'selected-action07-performance-actor','status':'missing_source_grounded_performance_correspondence',
  'operation':selected['operation'],'scopeRefs':selected['candidateChain']['scopeRefs'],
  'exactOriginals':[{k:selected['originalChain'][k]} for k in ['activationRef','preimageRef','deltaRef','closureRef']],
  'originalSpans':selected['originalChain']['attributionSources'],'presentAccounts':selected['sourceClaims']['supplementalEvidence'],
  'missingObservation':'A truthful operation-to-performing-actor correspondence for the exact selected-action07 patch and four retained endpoints. The known present account establishes assignment only, and Root lacks a retained direct past dispatch/tool observation establishing performance. No further identity is inferred.',
  'unavailableSessionId':None,'nextLawfulRoute':'Acquire an actually supported narrowly routed performance/grant record or retain insufficient attribution for the existing scoped present-owner route after valid correspondence. No broad historical census, fabricated identifier or automatic acknowledgment.'},
 {'id':'all-three-product-authority-correspondence','status':'unestablished',
  'publishedSlot':'actor-capability://abiogenesis/qualification/product-owner@5',
  'originalGrantSpans':[x['grantSpan'] for x in identity],
  'missingObservation':'Authentic correspondence from the actual source grants/authorized owner to the published Product authority slot. The constant and Root work delegation alone do not establish that relation.',
  'nextLawfulRoute':'Actual source-grounded grant/identity assessment, or the existing conditional scoped F_H attribution acknowledgment when applicable; no universal owner acknowledgment and no request made here.'},
 {'id':'attribution-assessment-and-independence','status':'not_executed',
  'missingObservation':'An actual admitted assessor with the published role, real transport/grant and sufficient source-grounded J over the relevant semantic author relation. Compare the actual actor with established authors and peers; operation labels and empty raw attributions cannot prove independence.',
  'nativeJudgments':0,'authorityOrIndependenceWaiver':False},
 {'id':'successor-member-binding','status':'deliberately_unbound',
  'oldBinding':ops[0]['applicability']['subjectInventory'],'DMemberCount':3,'successorInventory':None,
  'missingObservation':'A separately CLOSED and explicitly routed successor source/inventory/material basis and current grant selecting it. Verify all eleven member identities at that basis before carrying forward any correspondence; old C/Q and D source cuts remain distinct.',
  'preconditions':['Reacquire exact CLOSED successor and source-member identities under a separate grant','Verify the old eight survive unchanged and the D three match their closed repair endpoints; affected differences require their own actual relation','Select actual task rule/surface/criterion scope and adequate material before constructing complete provenance','Conserve current record-set identities or calculate new identities for explicitly changed records','Obtain required attribution/authority and actual native assessor independence; do not turn these partial diagnostics into ready tasks'],
  'excludedWork':['whole-inventory preservation/generated/Q-control chains','remaining eighteen source acquisitions','final source inventory and scope material adequacy','seven seeds','native assessment/F_H/AF22 or release']}
]
save('residuals.json',{'status':'bounded_input_cut_complete_dependent_claims_open','residuals':residuals,'requestToUser':None})

triage={
 'newMaterialMismatch':'D closed-state.sources uses logicalPath plus a nested postimage.path prefixed postimages/. The unchanged consumer searches an exact member.path paired with a digest. Original D returns invalid at that structural join.',
 'originAndSymptom':{'origin':'External closure representation and downstream selected-member coordinate convention were not explicitly joined in the original source repair record. Original bytes and logical source paths are internally coherent.',
  'symptom':'F11 pure external-attribution projection cannot match the source member in the original closed-state carrier; it returns invalid before attribution sufficiency.'},
 'frames':{
  'ProductRequirementDesign':{'variables':['exact source inventory/candidate','external construction/grant evidence','actual attribution','no historical ABG event invention'],
    'sources':'Accepted D4/D5 Section3 and QUAL057/064; separately authored CLOSED attribution review',
    'finding':'Existing law permits source-grounded external construction and truthful derived carrier correspondence. The mismatch does not establish a missing Product outcome or need for owner repair.'},
  'Integration':{'variables':['D.sources[i].logicalPath','D.sources[i].postimage path/digest/bytes','qualification manifestHasMember path/digest','chain postimageMembers and changes','selected material'],
    'finding':'The missing relation is the explicit logicalPath-to-selected-member path binding across original producer records and this consumer. a/b patch headers and the preimage path manifest already correspond.'},
  'IdentityAuthority':{'variables':['operation activation','actual /root/s03_phase_b','unknown separate session','Root source grant','published Product capability slot','exact source record spans'],
    'finding':'The view adds no actor or grant claim. D has a concrete external source author record; published authority correspondence remains null. S03 gains only a present retrospective performance statement; selected-action gains assignment only.'},
  'LifecycleEffect':{'variables':['immutable original preimages/delta/closure','derived present correspondence','old C01/Q01','independent D source cut','excluded successor','admitted runtime events'],
    'finding':'Derivation is a present input-construction effect in this Worker territory. It neither re-performs the old operation nor mutates source/candidate/history nor rebinds the successor.'},
  'Proof':{'variables':['original carrier branch','derived branch','eleven endpoint reconstructions','required-member union','source/material guards','empty raw attributions'],
    'finding':'Original invalid -> derived insufficient with exact endpoints and eighteen meaningful rejections. This proves representability only; attribution, authority, assessment and independence remain separate.'}},
 'escapeAndRecurrence':'The original publication repair and its independent review proved source/component behavior, not F11 attribution-input readiness. That bounded acceptance remains valid. The same class of integration obligation recurs when historical source records are fed to a consumer without a retained exact coordinate correspondence: S03 absolute paths, selected-action before/after headers, and D logicalPath are distinct concrete instances. Treating the source repair as qualification-ready would repeat the Executive proof-conjunction failure; no such broad closure is claimed here.',
 'alternativesAndUncertainty':['Teach the Product consumer another historical carrier layout: not necessary for this exact task because truthful derived views work under unchanged owners. No current Product defect is inferred.','Rewrite old closures or call a derived carrier original: rejected because it would destroy the evidence relation.','Use a newly rendered record to assign author/authority: rejected; source-grounded identity and current native independence require their own evidence.','Source data alone may be sufficient for a later actual semantic attribution judgment, but this Worker performs no such judgment.'],
 'completeAffectedCone':['D three exact pre/post endpoints','unchanged original a/b patch','original closed-state and source-attribution records','derived logical member view','chain member/ref/path mapping','attribution spans and record-set identities','pure owner checks and meaningful negative boundaries','later separate scope/authority/independence/native binding'],
 'smallestReentry':'realization_refactor of external input correspondence under the current exact grant; no Product, requirements, design, code or installed-owner mutation',
 'boundedAction':'Retain original closed-state/source-attribution/freeze bytes and expose explicit logicalPath -> member.path with exact digest/bytes. It is labeled derived, separate from all original bodies.',
 'reproof':'Eleven independent original/view endpoint reconstructions; all three original carriers invalid and derived carriers insufficient; six negative checks per operation fail, including actual uncovered member and crossed postimage; eight-only original Q union remains insufficient.'
}
save('triangulation.json',triage)

# Recheck conserved external originals and source spans at the close boundary.
guards=[]
for row in read('original-source-locations.json')['records']:
    got=file(pathlib.Path(row['sourcePath']));assert got['bytes']==row['bytes'] and got['sha256']==row['sha256'];guards.append(got)
for m in supp:
    p=R/m['path'];got=file(p);assert got['bytes']==m['byteCount'] and 'sha256:'+got['sha256']==m['digest'];guards.append(got)
for op in ops:
    for s in op['candidateChain']['attributionSources']:
        b=base64.b64decode(byref[s['sourceRef']]['contentBase64'],validate=True)
        assert 0<=s['startByte']<s['endByte']<=len(b) and 'sha256:'+sha(b[s['startByte']:s['endByte']])==s['spanDigest']
for s in read('source-spans.json')['rootSelectionObservations']:
    b=(R/s['sourcePath']).read_bytes()[s['startByte']:s['endByte']]
    assert 'sha256:'+sha(b)==s['spanDigest'] and b==(O/s['acquiredPath']).read_bytes()
for x in checks['installedOwners']:
    b=pathlib.Path(x['path']).read_bytes();assert len(b)==x['byteCount'] and 'sha256:'+sha(b)==x['digest']
for x in endpoints['checks']:
    b=(O/x['reconstructedPath']).read_bytes();assert len(b)==x['postimageBytes'] and 'sha256:'+sha(b)==x['postimageDigest']
save('conservation.json',{'status':'all_scoped_originals_spans_installed_owners_and_reconstructions_unchanged','originalMaterialBodies':40,'supplementalBodies':4,'derivedBodies':4,
 'verifiedExternalOriginals':guards,'rootSelectionSpansConserved':3,'nativeEffects':0,'sourceEffects':0,'GitCommandsOrEffects':0,
 'effects':'Only files under this newly granted Worker output territory were created. Pure installed imports and eleven independent scratch reconstructions; no provider/native/build/package/install effects.'})

now=datetime.datetime.now(datetime.timezone.utc);activation=read('activation.json');elapsed=(now-datetime.datetime.fromisoformat(activation['at'])).total_seconds()
save('costs.json',{'elapsedSecondsSinceDeclaredActivation':elapsed,'originalMaterialBodyCount':40,'originalMaterialBytes':sum(x['byteCount'] for x in originals),
 'derivedMaterialBodyCount':4,'derivedMaterialBytes':sum(x['byteCount'] for x in derived),'supplementalMaterialBodyCount':4,'supplementalMaterialBytes':sum(x['byteCount'] for x in supp),
 'independentEndpointReconstructions':11,'pureOwnerCheckExecutions':2,'reasonForSecondCheck':'New exact supplemental identity evidence changed two operation record sets; initial results were retained.',
 'perFinalCheck':{'originalCarrierRedChecks':3,'derivedAttributionInsufficientChecks':3,'negativeCases':18,'oldEightUnionCheck':1},
 'nativeCalls':0,'providerCalls':0,'buildPackageInstallCalls':0,'GitCommands':0,'monetaryCostKnown':False})
sets=read('record-sets.json')['operations']
digest_lines='\n'.join(f'- `{x["operation"]}`: `{x["recordSet"]["digest"]}`.' for x in sets)
text=f'''# T287 F11 external attribution correspondence02 — CLOSED Worker return

The bounded input-construction task is complete. All eleven source transitions reconstruct exactly at their own operation cuts. The unchanged installed owner accepts each truthful derived representation through its structural branch and returns `insufficient` attribution. **This is not launch-ready provenance, qualified source, a semantic attribution judgment, or native independence evidence.**

Worker `/root/f11_attribution_inputs` explicitly transitioned from the CLOSED publication review to `T287_F11_EXTERNAL_ATTRIBUTION_CORRESPONDENCE_02`. Its exact installed-a_c grant is 7,189 bytes, SHA256 `b91b75e382fadc3a7b6d6f7b49eacf104164fddabb87b63bed6be33912c00924`. Root remains Executive. The separately authored attribution review was consumed; this Worker does not independently assure its own return.

The verified Definition file SHA256 is `2c13b1fd28f3aaa624d941537a858f67ca8784f0710f490522147f57964c4051`. The separately verified installed STDO v2.5.1-rc.1 manifest digest is `5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64`. Neither label substitutes for the other. [Authority spans](authority-spans.json) preserve the relevant frozen qualification/design/consumer sources; the fifteen-family Product and GOAL035/T287 remain unchanged.

## Exact bounded result

| Original operation | Members and applicability | Source-preserving view | Actual available actor evidence |
|---|---|---|---|
| S03 Public handoff | Four exact C01/Q01 members | Original absolute closure paths become a separately labeled repository-relative member view | New present firsthand statement from `/root/s03_phase_b` asserts performance of the exact operation; no recovered contemporaneous dispatch transcript |
| Selected-action07 | Four separate exact C01/Q01 members | Only original `before/after` patch header prefixes become `a/b`; every hunk and endpoint remains identical | `/root/selected_action` confirms assignment/safe-stop but cannot establish performance; operation actor remains null |
| Default-library publication repair | Three members at D's independent CLOSED operation cut | Original `logicalPath`/postimage coordinates bind an explicit derived closure-member view; original `a/b` patch and preimage manifest already correspond | Original D activation and source-attribution records name `/root/s03_phase_b`; separate session unavailable |

Eight members are bound to the original C01/Q01 source inventory. D's three postimages are not inserted into that inventory. No eleven-member candidate union or successor binding was constructed, and `final-candidate-construction-02` was not consumed. All three per-operation `authorityRef` fields remain null.

[Operation inputs with supplements](operation-inputs-with-supplements.json) are the current reusable partial carrier. [Original records](original-record-materials.json) conserve 40 bodies; [derived records](derived-record-materials.json) hold four distinctly labeled views; [supplemental records](supplemental-record-materials.json) conserve the four CLOSED present-account bodies. The initial operation input and first check results remain present. Originals were not rewritten to contain later identities.

The final per-operation record-set identities, computed by the unchanged installed canonical digest owner, are:

{digest_lines}

[Record sets](record-sets.json) contain exact actual source material and operation coordinates. These identities address the constructed input sets; they confer no authority or assessment result.

## Checks and their limits

[Independent reconstruction](endpoint-reconstruction.json) applies the original and derived patches to each exact preimage and obtains the same eleven recorded postimages. The original S03/selected07 attribution spans are retained unchanged; all original, supplemental and new view spans verify. [Conservation](conservation.json) rechecks all 40 original bodies, four supplemental bodies, the three narrowly captured Root selection spans, installed owners and eleven reconstructed outputs at close.

[Pure consumer checks](correspondence-checks.json) show original `invalid` and derived `insufficient` for each operation. The two old operations conjoin as exactly eight original-Q members and remain `insufficient`. Each operation rejects a crossed postimage, an actual uncovered member, wrong selected material, a changed attribution span, wrong record bytes and substitution of the unestablished published authority slot: 18 final negative cases. All material/source shapes validate; full provenance deliberately rejects the remaining nulls. No full task or judgment was constructed, and every diagnostic `raw.attributions` array is empty. Null chain authority and null partial-plan authority are held equal only to isolate the byte branch; this is not a lawful complete plan.

The second pure check was necessary only because Root routed new CLOSED firsthand-account evidence. [Initial checks](correspondence-checks.initial.json) are retained. No source/build/native tests were rerun.

## Root cause and scope

[Triangulation](triangulation.json) binds Product/design, integration, identity/authority, lifecycle/effect and proof variables. D's additional mismatch is exact: its original closure uses `logicalPath` plus an evidence-storage postimage path, while the consumer matches a repository member `path` plus digest. The logical coordinate relation was absent from the input carrier. A derived view resolves that representation gap without changing the original, the Product consumer, or author/grant meaning.

The older two representations were already independently reviewed; this work did not reopen those investigations. The recurring integration obligation is to retain the producer-record-to-consumer-coordinate relation, rather than treating a bounded source/component closure as qualification-input readiness. The original repair review established source/component behavior and did not claim F11 readiness. This evidence supports a bounded external-input realization refactor; it does not establish a new Product defect, missing shared law, or a need to widen the qualification owner.

## Exact remaining inputs

[Identity correspondence](identity-correspondence.json) and [residuals](residuals.json) preserve exact record refs and byte spans:

1. Selected-action07's performing actor remains unknown. Its original request, preimages, patch and closure identify the operation; the new actual-agent account establishes assignment only. A supported performance correspondence is still missing. Root's current compacted context has no retained direct old dispatch/tool observation establishing that performance. No unavailable session identifier is invented, and no broad history search or user request is made.
2. All three genuine source grants are retained, but correspondence to `actor-capability://abiogenesis/qualification/product-owner@5` remains unestablished. The published constant supplies a slot, not proof these grants occupy it.
3. S03 and D identify the same external agent at their stated evidence scopes. Actual semantic attribution sufficiency, task applicability, inherited relevant authorship and actual admitted assessor/peer independence remain to be evaluated. New actor labels, copying/building bytes, or this Worker return cannot establish them.
4. A separately granted and routed CLOSED successor must bind exact inventory/material/task scope before these operation records can serve it. Verify survival of the old eight and exact D endpoints; no implicit rebind follows from the successor merely being CLOSED elsewhere.

The existing scoped present-owner acknowledgment route is conditional after valid correspondence. It cannot repair wrong endpoints, uncovered members, invented actors, self-review or missing native past events, and it is not a universal prerequisite. No acknowledgment is requested or performed here.

## Effects and stop

Sole writes are under this new Worker territory. No canonical source, prior cut, Product/install, Git/index/ref, native resource, provider, build/package/install, sibling, assessment, F_H or AF22 effect occurred. No whole-inventory/preservation/generated/control chains, remaining-source acquisition, scope/seed construction or successor work was undertaken. The complete local material cost and check counts are in [costs](costs.json); elapsed declared Worker time was {elapsed:.1f} seconds. Monetary usage is not available.

Freeze once and return to Root. This Worker is CLOSED and performs no successor activation.
'''
with (O/'return.md').open('x') as f:f.write(text)
rows=[]
for p in sorted(O.rglob('*')):
    if p.is_file():
        b=p.read_bytes();rows.append({'path':str(p.relative_to(O)),'bytes':len(b),'sha256':sha(b)})
result={'status':'CLOSED','work_result':'bounded_source_correspondence_complete_attribution_and_successor_binding_unresolved',
 'activation':'T287_F11_EXTERNAL_ATTRIBUTION_CORRESPONDENCE_02','worker':'/root/f11_attribution_inputs','frozenAt':now.isoformat(),
 'return':next(x for x in rows if x['path']=='return.md'),'records':rows,'recordSets':[{'operation':x['operation'],'recordSet':x['recordSet']} for x in sets],
 'counts':{'originalC01Q01Members':8,'independentDOperationMembers':3,'originalBodies':40,'derivedBodies':4,'supplementalBodies':4,'endpointReconstructions':11,'negativeChecks':18},
 'fullProvenanceOrTaskReady':False,'successorBinding':None,'nativeJudgments':0,'nativeEffects':0,
 'stop':'One frozen authored input cut returned to Root; no independent assurance or successor activation.'}
save('freeze.json',result)
# Read-only verification of the one written freeze; no resealing.
frozen=json.loads((O/'freeze.json').read_text())
for row in frozen['records']:
    b=(O/row['path']).read_bytes();assert len(b)==row['bytes'] and sha(b)==row['sha256']
print(json.dumps({'freeze':file(O/'freeze.json'),'return':file(O/'return.md'),'records':len(rows),'bytes':sum(r['bytes'] for r in rows),'status':'CLOSED'},indent=2))
