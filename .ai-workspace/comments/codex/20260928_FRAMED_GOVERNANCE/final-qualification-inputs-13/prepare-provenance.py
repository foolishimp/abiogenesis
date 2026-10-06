"""Two truthful derived metadata views; original Q10/C09 metadata remains immutable."""
from pathlib import Path
import base64,copy,hashlib,json
Q=Path(__file__).resolve().parent;G=Q.parent;D=G/'final-qualification-inputs-10';C=G/'final-candidate-construction-09'
assert not(Q/'freeze.json').exists()
def read(p):return json.loads(Path(p).read_bytes())
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def sha(b):return hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p)
 with p.open('rb')as f:h=hashlib.file_digest(f,'sha256').hexdigest()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':h,'mode':p.stat().st_mode&511}
def put(n,v):
 p=Q/n;assert not p.exists();p.write_text(json.dumps(v,separators=(',',':'),ensure_ascii=False)+'\n')
fields=['path','origin','sha256','bytes','mode','sourceAuthor','originalSource','originalAuthorship','selectedRelation','copyBuildAuthor','copyOrigin']
def project(rows,manifest,arrayPointer):
 projected=[];checks=[]
 for index,row in enumerate(rows):
  selected={k:copy.deepcopy(row[k])for k in fields if k in row};assert all(not isinstance(v,(list,dict))for v in selected.values())
  pointer=arrayPointer+'/'+str(index);rowDigest='sha256:'+sha(canonical(row));historyKeys=[k for k,v in row.items()if isinstance(v,(list,dict))]
  selected['frozenRow']={'pointer':pointer,'canonicalRowDigest':rowDigest,'historyRelationFields':historyKeys}
  selected['unprovidedTupleFields']=[k for k in fields if k not in row]
  for k in fields:
   assert(k in selected)==(k in row)
   if k in row:assert selected[k]==row[k]
  assert selected['frozenRow']['canonicalRowDigest']=='sha256:'+sha(canonical(rows[index]))
  # Exact full-row hash and JSON pointer retain every history relation without copying it.
  for k in historyKeys:assert k in rows[index]and isinstance(rows[index][k],(list,dict))
  body=C/'final-source'/row['path'];a=pin(body);assert(a['sha256'],a['bytes'],a['mode'])==(row['sha256'],row['bytes'],row['mode'])
  projected.append(selected);checks.append({'path':row['path'],'pointer':pointer,'canonicalRowDigest':rowDigest,'frozenCurrentBody':a,'tupleFieldsVerified':[k for k in fields if k in row],'historyRelationFieldsVerified':historyKeys})
 assert len(projected)==len(rows)==1111 and len({r['path']for r in projected})==len(projected)
 return projected,checks
original=read(D/'f11/source-authorship-records.json');auth=copy.deepcopy(original);cutPath=C/'controls/source-cut.json';cut=read(cutPath)
assert auth['sourceOrigins']==cut['members'];originRows,originChecks=project(cut['members'],cutPath,'/members')
auth['sourceOrigins']=originRows
auth['sourceOriginsProjection']={'kind':'derived_flat_source_origin_projection','classification':'external_preparation_metadata_view','originalAuthorshipContainer':pin(D/'f11/source-authorship-records.json'),'frozenSourceManifest':pin(cutPath),'rowPointerBasis':'/members/<index>','canonicalRowDigestAlgorithm':'sha256 of UTF8 canonical JSON with sorted object keys, compact separators, original Unicode values','completeSourceRowPopulation':1111,'allCurrentTupleValuesPreserved':True,'allOriginalHistorySubtreesRemainAccessible':True,'projectedSourceAuthorship':False,'sourceAttributionSufficiency':'unknown','independence':'unknown'}
put('f11/source-authorship-records.json',auth)
supplierPath=C/'final-source-members.json';supplier=read(supplierPath);supplierRows,supplierChecks=project(supplier,supplierPath,'')
view={'kind':'derived_current_source_supplier_control_view','schemaVersion':'1','classification':'external_preparation_projection_not_original_supplier','sourceSupplier':pin(supplierPath),'candidateSourceFreeze':pin(C/'final-source-freeze-manifest.json'),'constructionFreeze':pin(C/'final-freeze.json'),'rows':supplierRows,'sourceRowCount':1111,'rowPointerBasis':'/<index>','canonicalRowDigestAlgorithm':auth['sourceOriginsProjection']['canonicalRowDigestAlgorithm'],'originalFullSupplierAccessible':True,'originalSupplierBodySubstitution':False,'semanticAdequacy':'unknown','originalAuthorshipTransfer':False}
body=canonical(view);h=sha(body);view={'projectionRef':'qualification-derivation://abiogenesis/q07/current-source-supplier/'+h,'projectionDigest':'sha256:'+h,**view};put('current-source-supplier-view.json',view)
assert auth['records']==original['records']and auth['chains']==original['chains'];assert(len(auth['records']),len(auth['chains']),sum(len(c['attributionSources'])for c in auth['chains']))==(174,23,90)
for m in auth['records']:
 b=base64.b64decode(m['contentBase64'],validate=True);assert len(b)==m['byteCount']and'sha256:'+sha(b)==m['digest']
put('source-auth-current-correspondence.json',{**read(D/'source-auth-current-correspondence.json'),'metadataProjectionOnly':True,'all174RecordValues23Chains90SpansUnchanged':True,'sourceOriginsProjection':pin(Q/'f11/source-authorship-records.json'),'fullOriginalAccessible':pin(D/'f11/source-authorship-records.json'),'originalAuthorshipTransfer':False})
put('metadata-projection-conservation.json',{'status':'PREPAYLOAD_VERIFIED','operation':'T287_FINAL_QUALIFICATION_INPUTS_13','originalSourceOriginsContainer':pin(D/'f11/source-authorship-records.json'),'originalSourceCut':pin(cutPath),'originalSupplier':pin(supplierPath),'projectedSourceOriginsContainer':pin(Q/'f11/source-authorship-records.json'),'projectedSupplier':pin(Q/'current-source-supplier-view.json'),'recordsUnchanged':174,'chainsUnchanged':23,'spansUnchanged':90,'sourceOriginsRows':len(originRows),'supplierRows':len(supplierRows),'originChecks':originChecks,'supplierChecks':supplierChecks,'allHistoryRelationsAccessibleByExactFrozenRow':True,'allSelectedCurrentSourceBodiesVerified':True,'sourceAuthorshipTransfer':False,'semanticApplicability':'unknown'})
print(json.dumps({'projectedSourceOriginsContainerBytes':(Q/'f11/source-authorship-records.json').stat().st_size,'projectedSupplierBytes':(Q/'current-source-supplier-view.json').stat().st_size,'records':174,'chains':23,'spans':90,'rowsEach':1111}))
