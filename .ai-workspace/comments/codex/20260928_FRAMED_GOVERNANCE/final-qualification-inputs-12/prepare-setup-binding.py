"""Bind actual accepted Setup09 coordinates; zero Runtime effects."""
from pathlib import Path
import hashlib,json,stat
Q=Path(__file__).resolve().parent;G=Q.parent
assert not(Q/'freeze.json').exists()
def read(p):return json.loads(Path(p).read_bytes())
def pin(p):
 p=Path(p)
 with p.open('rb')as f:h=hashlib.file_digest(f,'sha256').hexdigest()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':h,'mode':stat.S_IMODE(p.stat().st_mode)}
acceptance=G/'rc1-setup09-acceptance-01/acceptance.json';a=pin(acceptance)
assert(a['bytes'],a['sha256'])==(9596,'4696d73552536c99a47e3a9db6cf277d7d318bf725ced3b2e95225aa0c8bba74')
accepted=read(acceptance);freeze=Path(accepted['setupFreeze']['path']);f=pin(freeze);assert f==accepted['setupFreeze']
records={r['path']:r for r in read(freeze)['records']};pins=[];values={}
for name in ['setup-state.json','installed-authority-handoff.json']:
 p=freeze.parent/name;actual=pin(p);row=records[name];mode=row['mode'];mode=int(mode,8)if isinstance(mode,str)else mode
 assert(actual['sha256'],actual['bytes'],actual['mode'])==(row['sha256'],row['bytes'],mode)
 pins.append(actual);values[name]=read(p)
s=values['setup-state.json'];h=values['installed-authority-handoff.json'];A=s['environment']['workspaceAuthorityBasis'];W=s['environment']['workspaceBinding']
assert W['kind']=='workspace_binding'and W['admissionEventRef']and W['bindingId']==accepted['workspaceBinding']['ref']and W['bindingDigest']==accepted['workspaceBinding']['digest']
assert A==h['workspaceAuthority']and A['authorizedActorRef']==W['authorizedActorRef']==accepted['currentActor']
assert all(s['catalog'][k]==v for k,v in h['catalog'].items())and all(s['catalogView'][k]==v for k,v in h['catalogView'].items())
assert s['closeHandoff']==accepted['authenticCloseHandoff']
current=read(G/'final-candidate-construction-09/final-selected-core.json')
core=next(i for i in s['environment']['productInstalls']if i['productContentDigest']==current['basis']['productContentDigest'])
assert core in h['productInstalls']and core['disposition']=='admitted'and core['artifactDigest']==current['basis']['artifactDigest']
body={'kind':'assertion_parameters_over_already_admitted_Setup09','coordinateStatus':'actual_admitted','newRuntimeEffects':0,'acceptance':a,'freeze':f,'selectedOriginalRecordPins':pins,'workspaceAuthorityBasis':A,'workspaceBinding':W,'currentRootActorRef':accepted['currentActor'],'coreInstall':core,'catalog':s['catalog'],'catalogView':s['catalogView'],'currentInstalledRoot':accepted['resourceRoots']['productRoot'],'closeHandoff':s['closeHandoff'],'historicalDeclarationProofConstruction':'Exact current closed catalog and catalogView are the published proof body; no new declaration readiness or admission is claimed.','setupOperationMapping':{'actualOperation':'T287_F11_C09_INSTALLED_SETUP_09','source':'actual accepted Setup09 producer; no historical tracking counter used'},'semanticExecution':False,'newTaskOrRunAdmission':False}
p=Q/'f11/actual-setup-coordinates.json';assert not p.exists();p.write_text(json.dumps(body,separators=(',',':'),ensure_ascii=False)+'\n')
print(json.dumps({'status':'existing_admitted_coordinates_bound','projectionBytes':p.stat().st_size,'actualW':W['bindingId'],'originalRecordsVerified':len(pins)}))
