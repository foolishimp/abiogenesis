"""Pure prepayload envelope accounting over actual declared inputs and retained shapes."""
from pathlib import Path
import base64,hashlib,json,os,re
Q=Path(__file__).resolve().parent;G=Q.parent;D=G/'final-qualification-inputs-10';P=G/'final-qualification-inputs-09'
def read(p):return json.loads(Path(p).read_bytes())
def compact(v):return json.dumps(v,separators=(',',':'),ensure_ascii=False).encode()
def enc(n):return 4*((n+2)//3)
def pin(p):
 p=Path(p)
 with p.open('rb')as f:h=hashlib.file_digest(f,'sha256').hexdigest()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':h,'mode':p.stat().st_mode&511}
inventory=read(Q/'qualification-inventory.json');origins=read(Q/'inventory-origin-correspondence.json');protected=read(Q/'protected-inputs.json');by_ref={m['ref']:m for m in inventory['members']};old=read(P/'qualification-inventory.json');oldByRef={m['ref']:m for m in old['members']}
for o in origins:
 m=by_ref[o['ref']];a=pin(o['origin']);assert(a['sha256'],a['bytes'])==(m['digest'][7:],m['byteCount'])
for m in protected['members']:
 a=pin(m['origin']);assert(a['sha256'],a['bytes'],a['mode'])==(m['sha256'],m['bytes'],m.get('sourceMode',m['mode']))
auth=read(Q/'f11/source-authorship-records.json');priorAuth=read(D/'f11/source-authorship-records.json');assert auth['records']==priorAuth['records']and auth['chains']==priorAuth['chains']
assert(len(auth['records']),len(auth['chains']),sum(len(c['attributionSources'])for c in auth['chains']))==(174,23,90)
raw=sum(m['byteCount']for m in inventory['members']);encoded=sum(enc(m['byteCount'])for m in inventory['members']);assert encoded<500000000
# Exact material-entry envelope sizes require only body lengths; no body strings are constructed.
sourceEntryBytes=0
for m in inventory['members']:
 material={k:m[k]for k in ['ref','path','digest','byteCount']};material['contentBase64']=''
 sourceEntryBytes+=len(compact({'entryKind':'material','coordinate':{'ref':m['ref'],'digest':m['digest']},'value':material}))+enc(m['byteCount'])
recordEntryBytes=0
for m in auth['records']:
 stub={**m,'contentBase64':''};recordEntryBytes+=len(compact({'entryKind':'material','coordinate':{'ref':m['ref'],'digest':m['digest']},'value':stub}))+len(m['contentBase64'])
coords=read(Q/'f11/actual-setup-coordinates.json');proof={'kind':'abg_historical_declaration_proof','schemaVersion':'5.0.0','catalog':coords['catalog'],'catalogView':coords['catalogView']};proofBytes=len(compact(proof))
# Retained resource format/normalized partition shape; growth is bounded by actual population delta,
# maximum current ref length and the retained reference-set count. Identity digests have fixed size.
priorReady=read(P/'f11-packet-readiness.json');priorAuth9=read(P/'f11/source-authorship-records.json');priorEncoded=sum(enc(m['byteCount'])for m in old['members']);overhead=priorReady['resourceSerializationBytes']-priorEncoded
currentMaxRef=max(len(m['ref'].encode())for m in inventory['members']);oldMaxRef=max(len(m['ref'].encode())for m in old['members']);addedCount=max(0,len(inventory['members'])-len(old['members']))
commonRefGrowth=sum(max(0,len(m['ref'].encode())-len(oldByRef[ref]['ref'].encode()))for ref,m in by_ref.items()if ref in oldByRef)
refsetGrowthBound=priorReady['referenceSets']*(addedCount*currentMaxRef+commonRefGrowth)
recordGrowth=sum(enc(m['byteCount'])for m in auth['records'])-sum(enc(m['byteCount'])for m in priorAuth9['records'])
headerGrowth=max(0,len(compact(inventory))-len(compact(old)))+max(0,len(compact(auth['chains']))-len(compact(priorAuth9['chains'])))
# Current resource has extra record entries and new identity/control headers. Each header is bounded
# by actual longest current record/member envelope plus its full ref. This is a conservative bound.
maxHeader=max(len(compact({**m,'contentBase64':''}))for m in auth['records'])+currentMaxRef
entryCountGrowth=len(auth['records'])-len(priorAuth9['records'])+addedCount
newHeaderBound=maxHeader*entryCountGrowth+len(read(Q/'current-source-supplier-view.json')['projectionRef'].encode())
resourceUpper=encoded+overhead+max(0,recordGrowth)+refsetGrowthBound+headerGrowth+newHeaderBound
assertionUpper=resourceUpper+proofBytes+4096
# The actual current complete embedded task retains at most one full inventory per scope plus
# member refs in the inherited finite per-rule domains; this avoids source-body encoding in context.
rawScopeRefUpper=len(inventory['members'])*currentMaxRef*(priorReady['perRuleDomains']+1)
embeddedUpper=rawScopeRefUpper+len(compact(inventory))+len(compact(auth))+proofBytes+len(compact(auth['chains']))+1000000
spanBytes=sum(s['endByte']-s['startByte']for c in auth['chains']for s in c['attributionSources'])
promptUpper=spanBytes+priorReady['promptBytes']+headerGrowth+newHeaderBound+1000000
limit=536870888
assert max(resourceUpper,assertionUpper,embeddedUpper,promptUpper)<limit,(resourceUpper,assertionUpper,embeddedUpper,promptUpper)
writeNames=set()
for name in ['readiness-driver.mjs','f11/packet-readiness.mjs']:
 writeNames.update(re.findall(r"(?:write|writeFile|open)\('([a-zA-Z0-9_.-]+)'",(Q/name).read_text()))
writeNames.update(['readiness.stdout','readiness.stderr','command-supervisor-start.json','command-supervisor-close.json','packet-readiness.stdout','packet-readiness.stderr','packet-supervisor-start.json','packet-supervisor-close.json','f11-bound-resource-manifest.json','f11-bound-prompt.txt','f11-bound-worker-request.json'])
for name in writeNames:assert not(Q/name).exists(),name
for name in ['mechanical-worksite','unit-protected-roots']:assert not(Q/name).exists()
for m in protected['members']:assert '..'not in Path(m['target']).parts and (Q/'mechanical-worksite'/m['target']).is_relative_to(Q/'mechanical-worksite')
receipt={'status':'PREPAYLOAD_READY','operation':'T287_FINAL_QUALIFICATION_INPUTS_15','inventoryMembers':len(inventory['members']),'rawInventoryBytes':raw,'inventoryBase64Bytes':encoded,'base64Guard':500000000,'frozenNodeMaxString':limit,'sourceMaterialEntrySerializationBytes':sourceEntryBytes,'authorshipMaterialEntrySerializationBytes':recordEntryBytes,'declarationProofSerializationBytes':proofBytes,'retainedNormalizedReferenceSets':priorReady['referenceSets'],'inheritedResourceOverheadBytes':overhead,'referenceSetGrowthUpperBound':refsetGrowthBound,'authorshipBase64GrowthBytes':recordGrowth,'headerGrowthBytes':headerGrowth,'newEntryHeaderUpperBound':newHeaderBound,'resourceJSONAndCanonicalUpperBound':resourceUpper,'assertionJSONAndCanonicalUpperBound':assertionUpper,'embeddedTaskJSONAndCanonicalUpperBound':embeddedUpper,'promptUTF8AndCurrentRequestUpperBound':promptUpper,'boundsArePredictionsNotOwnerEvidence':True,'actualVolumesMustBeRecordedAfterOnePayload':True,'all174Records23Chains90SpansUnchanged':True,'allInventoryBodiesOriginsVerified':len(origins),'protectedInputsVerified':protected['total'],'ownedFutureWriteNames':sorted(writeNames),'allProspectiveTargetsOwned':True,'defaultHeap':True,'HOME':os.environ['HOME'],'process':'preimportPIDPGID/gate/wait4/180s/knownclosure','nativeEffects':0}
(Q/'pre-payload-envelope-accounting.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
