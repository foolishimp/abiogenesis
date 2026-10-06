from pathlib import Path
import json,hashlib,difflib,datetime
O=Path(__file__).resolve().parent;G=O.parent;D=G/'final-f11-scope-inputs-01'
def sha(b):return hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_bytes())
def save(n,v):(O/n).write_text(json.dumps(v,indent=2)+'\n')
def record(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':sha(b)}
assert not (O/'freeze.json').exists()
checks=read(O/'owner-checks.json');construction=read(O/'construction-checks.json')
assert checks['status']=='passed' and construction['status']=='passed' and checks['scopeCorrespondenceErrors']==[]
assert not checks['genuinelyBoundRequest'] and not checks['fullRequestRendered']
df=read(D/'freeze.json');assert sha((D/'freeze.json').read_bytes())=='e6ef1710c98f26da61bde1111ec71af5739e829e2dbee25c5de1b6c2977f5545'
(O/'preimages').mkdir()
transitions=[]
for before,after in [('bind-assessment-input.mjs','bind-assessment-input.mjs'),('construct-inputs.py','construct-selection.py')]:
 p=D/before;b=p.read_bytes();r=next(r for r in df['records'] if r['path']==before);assert len(b)==r['bytes'] and sha(b)==r['sha256']
 original=O/'preimages'/before;original.write_bytes(b);post=O/after
 patch=O/(after+'.patch');patch.write_text(''.join(difflib.unified_diff(b.decode().splitlines(True),post.read_text().splitlines(True),fromfile='preimages/'+before,tofile=after)))
 transitions.append({'preimage':record(original),'originalSource':str(p),'delta':record(patch),'postimage':record(post),'relation':'Bounded successor external implementation; no full-campaign equivalence or original-author replacement claimed.'})
scope=read(O/'scope-transform.json')
ledger=[json.loads(x) for x in (O/'process-ledger.jsonl').read_text().splitlines()]
total=sum(r['elapsedMs'] for r in ledger);assert total<300000 and all(r['elapsedMs']<120000 for r in ledger)
save('costs-summary.json',{'pureCheckProcesses':len(ledger),'elapsedMs':total,'aggregateCapMs':300000,'perProcessCapMs':120000,'ownedGraceMs':1000,'processes':ledger,'nativeCalls':0,'providerCalls':0,'scope':'Recorded construction/check subprocesses. Acquisition reads and model reasoning are not presented as measured process cost. Final report/hash work is separate.'})
save('construction-attribution.json',{'actor':'/root/f11_attribution_inputs','role':'Worker T287_F11_MATERIAL_SELECTION_02','separateSessionId':None,'unknownSessionIdentityPreserved':True,
 'grant':record(O/'request.txt'),'actualNewEffects':'Files in this sole granted directory; construction/check process records retain actual commands and results.',
 'sourceTransitions':transitions,'scopeTransition':{'preimage':scope['preimage'],'delta':record(O/'scope-transform.json'),'postimageCanonicalDigest':scope['postimageBodyCanonicalDigest'],'construction':'Deterministic in-memory reconstruction through loadScopeBody; original scope stays frozen.'},
 'newExternalDerivation':record(O/'selection-rationale.json'),'independence':'Author of this external successor; supplies no independent qualification J.',
 'authority':'Root external construction grant only; no Product-owner capability or historical candidate authorship inferred.',
 'originalConstructionRecords':'Whole originals remain under frozen Scope01/C02/Q02 records and exact current-material-bank origins; they are neither normalized nor replaced by this statement.',
 'bindingLimit':'This authentic current author/operation statement is not a complete native provenance/authority/independence binding.'})
save('disposition.json',{'status':'CLOSED','work_result':'candidate_ready','scope':'One bounded external C02/Q02 015B material-selection and fail-closed existing-owner binding path',
 'inventoryMembers':1950,'rules':2137,'sources':95,'preparedResponsibilities':1,'selectedBodies':39,'selectedRawBytes':832398,'ownerSourceSegmentBytes':860584,
 'mechanicalStatus':'passed','independentSemanticAssessment':'not performed','genuinelyBoundRequest':False,'nativeReadiness':'incomplete','P2':'remains open through first genuine bound assessment','priorCuts':'unchanged','effectsExcluded':['native','provider','model','moving resource','source','package/build/install','test suite','Git'],
 'remainingGenuineBinding':checks['missingBinding'],'finitePlan':'absent','nextAuthority':'Root only; no Worker activation'})
records=[]
for p in sorted(O.rglob('*')):
 if p.is_file():
  r=record(p);r['path']=str(p.relative_to(O));records.append(r)
ret=next(r for r in records if r['path']=='return.md')
freeze={'status':'CLOSED','work_result':'candidate_ready','activation':'T287_F11_MATERIAL_SELECTION_02','actor':'/root/f11_attribution_inputs','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'records':records,'recordCount':len(records),'return':ret,
 'subject':'bounded external 015B material-selection/binding candidate only','genuinelyBoundAssessment':False,'P2Open':True,'pureCheckElapsedMs':total,'nativeCalls':0,'providerCalls':0}
save('freeze.json',freeze)
for r in records:
 p=O/r['path'];b=p.read_bytes();assert len(b)==r['bytes'] and sha(b)==r['sha256']
assert read(O/'freeze.json')==freeze
print(json.dumps({'status':'CLOSED candidate_ready','records':len(records),'return':ret,'freeze':record(O/'freeze.json'),'pureCheckElapsedMs':total,'ownRecordBytes':sum(r['bytes'] for r in records),'nativeCalls':0,'genuinelyBoundAssessment':False},indent=2))
