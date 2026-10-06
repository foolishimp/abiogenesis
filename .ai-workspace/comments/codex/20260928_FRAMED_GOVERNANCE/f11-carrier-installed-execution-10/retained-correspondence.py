"""Saved contract-specific correspondence; no Product imports, generic field search or Runtime calls."""
from pathlib import Path
import json,hashlib
E=Path(__file__).resolve().parent
def read(n):return json.loads((E/n).read_bytes())
def canonical(v):return 'sha256:'+hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
def one(rows):
    assert len(rows)==1,'one exact saved admitted occurrence required'
    return rows[0]

cfg=read('driver-config.json');proof=read('retained/actual-assessment-proof.json')
J=proof['terminal']['value'];source=J['source'];cc=source['cCallRef']
events=read('retained/appended-runtime-records.json')['records']
evidence_event=one([e for e in events if e.get('kind')=='c_call_evidenced'and e.get('aggregateId')==cc])
result_event=one([e for e in events if e.get('kind')=='c_call_result_admitted'and e.get('aggregateId')==cc])
judged_event=one([e for e in events if e.get('kind')=='c_call_judged'and e.get('aggregateId')==cc])
artifact_event=one([e for e in events if e.get('kind')=='actor_result_artifact_observed'and
    e.get('aggregateId')==source['actorInvocationRef']and e.get('parentAggregateId')==cc])
evidence=evidence_event['payload'];artifact=artifact_event['payload'];result=result_event['payload']
# These are selected comparison columns from canonical J.source, not a new framework shape.
shared=['cCallRef','inputDigest','actorRef','workerBindingRef','actorInvocationRef',
    'transportBindingRef','transportBindingDigest','requestDigest','promptDigest']
shared_checks={k:source[k]==evidence[k]==artifact[k]for k in shared}
observation={k:v for k,v in artifact.items()if k not in ['cCallRef','requestRef','requestDigest']}
raw=json.loads(artifact['finalOutput'])
native=artifact['nativeResultAssessment'];verification=native['verification']
checks={
    'canonicalSharedSourceIdentity':all(shared_checks.values()),
    'observationAuthentication':canonical(observation)==source['observationDigest'],
    'rawValueAuthentication':raw==J['raw']and canonical(raw)==source['rawValueDigest'],
    'assessmentInputAuthentication':source['inputDigest']==canonical({'kind':'qualification_assessment_input','schemaVersion':'5.0.0','task':J['task'],'plan':J['plan']}),
    'admittedTransportAuthentication':evidence['evidenceClass']=='probabilistic_transport'and
        evidence['transportDigest']==artifact['transportDigest']and
        evidence['transportDisposition']==artifact['disposition']=='success'and
        evidence['transportFailureClass']==artifact['failureClass']is None,
    'admittedResultValueAuthentication':result['resultClass']=='success'and
        result['valueKind']=='qualification_judgment'and result['valueDigest']==canonical(J)==evidence['outputDigest']and
        evidence['evidenceRef']in result['evidenceRefs'],
    'nativeRawAndOutputBinding':native['disposition']=='admitted'and native['rawOutputDigest']==source['rawValueDigest']and
        verification['rawResultDigest']==source['rawValueDigest']and verification['inputDigest']==source['inputDigest']and
        verification['targetOutputContractRef']==result['contractRef']and J['nativeBasis']['cCallRef']==cc,
    'advanceJudgmentMatchesChildResult':judged_event['payload']['judgment']=='advance'and
        judged_event['payload']['resultRef']==result['resultRef']and judged_event['payload']['resultDigest']==result['resultDigest'],
}
assert all(checks.values()),{k:v for k,v in checks.items()if not v}
reads=[]
for name,member in [('flow-assess-run_result-stdout.json','run_result'),('flow-assess-run_replay-stdout.json','run_replay')]:
    receipt=read('retained/'+name)['receipt']
    assert receipt['definitionKey']['memberKey']==member and receipt['exitCode']==0 and receipt['ownerOutput']['outcomeKind']=='result'
    reads.append({'file':'retained/'+name,'memberKey':member,'invocationRef':receipt['invocationRef'],'source':receipt['ownerOutput']['value']['source']})
report={'status':'GO_SAVED_CONTRACT_CORRESPONDENCE_ONLY','checks':checks,'sharedSourceFields':shared,
    'sharedSourceComparisons':shared_checks,'judgmentSource':source,
    'transportEvidence':{k:evidence[k]for k in ['evidenceRef','evidenceDigest','transportDigest','transportDisposition','transportFailureClass']},
    'admittedEvidenceEvent':evidence_event['eventId'],'admittedChildResultEvent':result_event['eventId'],
    'advanceJudgmentEvent':judged_event['eventId'],'actorArtifactEvent':artifact_event['eventId'],
    'nativeVerification':verification,'nativeBasis':J['nativeBasis'],'originalChildFoldback':proof['childFoldback'],
    'originalTwoColdReadReceipts':reads,'RootPositiveAcceptance':cfg['originalPositiveAcceptance'],
    'contractSources':read('controls/subject-pins.json'),
    'observationProjectionAuthority':'frozen C09 abg/qualification_proof.ts projectQualificationJudgment: excludes cCallRef/requestRef/requestDigest from artifact payload',
    'statusColumnsAreNotJudgmentSourceColumns':True,'futureActualColdF11Consumption':'not executed; required after Root release',
    'ProductImports':0,'RunOrResourceEffects':0,'semanticQualification':False}
with(E/'retained-evidence-correspondence.json').open('x')as f:json.dump(report,f,indent=2);f.write('\n')
print(json.dumps({'status':report['status'],'checks':checks,'sharedFields':len(shared),'ProductImports':0,'RuntimeEffects':0}))
