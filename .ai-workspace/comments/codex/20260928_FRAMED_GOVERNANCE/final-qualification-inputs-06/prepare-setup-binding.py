"""Project exact already admitted Setup05 coordinates; no Runtime or source mutation."""
from pathlib import Path
import hashlib,json,stat
Q=Path(__file__).resolve().parent;G=Q.parent
assert not(Q/'freeze.json').exists()
def pin(p):
 p=Path(p)
 with p.open('rb')as f:h=hashlib.file_digest(f,'sha256').hexdigest()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':h,'mode':stat.S_IMODE(p.stat().st_mode)}
acceptance=G/'rc1-c05-installed-setup-acceptance-01/acceptance.json';a=pin(acceptance)
assert(a['bytes'],a['sha256'])==(5219,'8b730d544806534d799282ba45e474289f53a985cc19decf222989b848c8ff2d')
accepted=json.loads(acceptance.read_bytes());freeze=Path(accepted['setup']['freeze']);f=pin(freeze)
assert f['sha256']==accepted['setup']['freezeSHA256']=='3aa1948357cbce79b8c029f0be610fda129e325d6b0a267501e9e690cdd92f82'
records={r['path']:r for r in json.loads(freeze.read_bytes())['records']};pins=[];values={}
for name in ['setup-state.json','installed-authority-handoff.json']:
 p=freeze.parent/name;actual=pin(p);r=records[name]
 assert(actual['sha256'],actual['bytes'])==(r['sha256'],r['bytes']);assert actual['mode']==int(r['mode'],8)
 pins.append(actual);values[name]=json.loads(p.read_bytes())
s=values['setup-state.json'];h=values['installed-authority-handoff.json'];A=s['environment']['workspaceAuthorityBasis'];W=s['environment']['workspaceBinding']
assert W['kind']=='workspace_binding'and W['admissionEventRef']and W['bindingId']==accepted['setup']['fullBinding']['ref']and W['bindingDigest']==accepted['setup']['fullBinding']['digest']
assert A==h['workspaceAuthority']and A['authorizedActorRef']==W['authorizedActorRef']==accepted['setup']['currentActor']
assert all(s['catalog'][k]==v for k,v in h['catalog'].items())and all(s['catalogView'][k]==v for k,v in h['catalogView'].items())
assert s['closeHandoff']==accepted['setup']['closeHandoff']
core=next(i for i in s['environment']['productInstalls']if i['productContentDigest']==accepted['candidate']['productContentDigest'])
assert core in h['productInstalls']and core['disposition']=='admitted'and core['artifactDigest']=='sha256:'+accepted['candidate']['artifactSHA256']
body={'kind':'assertion_parameters_over_already_admitted_Setup05','coordinateStatus':'actual_admitted','newRuntimeEffects':0,
 'acceptance':a,'freeze':f,'selectedOriginalRecordPins':pins,'workspaceAuthorityBasis':A,'workspaceBinding':W,
 'currentRootActorRef':accepted['setup']['currentActor'],'coreInstall':core,'catalog':s['catalog'],'catalogView':s['catalogView'],
 'currentInstalledRoot':accepted['setup']['coreInstalledRoot'],'closeHandoff':s['closeHandoff'],
 'historicalDeclarationProofConstruction':'Exact current closed catalog and catalogView are the published proof body; no new declaration readiness or admission is claimed.',
 'semanticExecution':False,'newTaskOrRunAdmission':False}
p=Q/'f11/actual-setup-coordinates.json';assert not p.exists();p.write_text(json.dumps(body,separators=(',',':'),ensure_ascii=False)+'\n')
print(json.dumps({'status':'existing_admitted_coordinates_bound','projectionBytes':p.stat().st_size,'actualW':W['bindingId'],'originalRecordsVerified':len(pins)}))
