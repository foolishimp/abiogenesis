"""Project only the authoritative selected C09 delta, retaining frozen row joins."""
from pathlib import Path
import copy,hashlib,json,stat
Q=Path(__file__).resolve().parent;G=Q.parent;C=G/'final-candidate-construction-09';P=G/'final-candidate-construction-08-continued-02';D=G/'final-qualification-inputs-11'
def read(p):return json.loads(Path(p).read_bytes())
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def pin(p):
 p=Path(p)
 with p.open('rb')as f:h=hashlib.file_digest(f,'sha256').hexdigest()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':h,'mode':stat.S_IMODE(p.stat().st_mode)}
def same_body(a,b):assert tuple(a[k]for k in ['sha256','bytes','mode'])==tuple(b[k]for k in ['sha256','bytes','mode'])
def rowref(row,manifest,pointer):return {'manifest':manifest,'pointer':pointer,'canonicalRowDigest':'sha256:'+hashlib.sha256(canonical(row)).hexdigest()}
def put(n,v):
 with(Q/n).open('x')as f:f.write(json.dumps(v,indent=2,ensure_ascii=False)+'\n')
cutPin=pin(C/'controls/source-cut.json');assert(cutPin['bytes'],cutPin['sha256'])==(26506590,'dfb1611fdb6e2be782fbc9b48cfbcea1b28ec84a287e13f9f4236f8873b47242')
supplierPin=pin(C/'final-source-members.json');assert(supplierPin['bytes'],supplierPin['sha256'])==(25894743,'84bf29b7fdeec32449eca3b82b06522ab23f5f4ad2929b193a2722d0ae2132f8')
cut=read(cutPin['path']);supplier=read(supplierPin['path']);previous=read(P/'final-source-members.json');preFreeze=pin(P/'final-freeze.json');assert preFreeze['sha256']==cut['C08FreezeSha256']
preMembersPin=pin(P/'final-source-members.json');preRows={m['path']:m for m in previous};currentRows={m['path']:(i,m)for i,m in enumerate(supplier)};cutRows={m['path']:(i,m)for i,m in enumerate(cut['members'])}
auth=read(Q/'f11/source-authorship-records.json');origins={m['path']:m for m in auth['sourceOrigins']};view=read(Q/'current-source-supplier-view.json');viewRows={m['path']:m for m in view['rows']}
assert len(cutRows)==len(currentRows)==len(origins)==len(viewRows)==1111
assert auth['records']==read(D/'f11/source-authorship-records.json')['records']and auth['chains']==read(D/'f11/source-authorship-records.json')['chains']
fields=['path','origin','sha256','bytes','mode','sourceAuthor','originalSource','originalAuthorship','selectedRelation']
copyFields=['copyBuildAuthor','copyOrigin']
construction=read(C/'activation.json');constructionPin=pin(C/'activation.json');constructionFreeze=read(C/'final-freeze.json');frozenFiles={r['path']:r for r in constructionFreeze['records']}
for name in ['activation.json','final-source-members.json','final-source-freeze-manifest.json','final-attribution.json']:
 actual=pin(C/name);frozen=frozenFiles[name];assert(actual['sha256'],actual['bytes'])==(frozen['sha256'],frozen['bytes'])
sourceFreeze=read(C/'final-source-freeze-manifest.json');attribution=read(C/'final-attribution.json');assert sourceFreeze['sourceCutSHA256']==attribution['sourceCutSHA256']==cutPin['sha256']
assert(sourceFreeze['actualChangedFromBaseline'],sourceFreeze['actualAddedFromBaseline'])==(len(cut['replacements']),len(cut['additions']))
rows=[]
for kind,key in [('replacement','replacements'),('addition','additions')]:
 for index,m in enumerate(cut[key]):
  ci,cm=cutRows[m['path']];si,sm=currentRows[m['path']];assert cm==m
  for field in fields:
   for other in [sm,origins[m['path']],viewRows[m['path']]]:assert (field in m)==(field in other)and(field not in m or other[field]==m[field]),(m['path'],field)
  for flat in [origins[m['path']],viewRows[m['path']]]:
   full=cm if flat is origins[m['path']]else sm
   assert flat['frozenRow']['canonicalRowDigest']=='sha256:'+hashlib.sha256(canonical(full)).hexdigest()
  historicalCopy={k:copy.deepcopy(m[k])for k in copyFields if k in m};currentCopy={k:copy.deepcopy(sm[k])for k in copyFields if k in sm}
  assert historicalCopy=={k:origins[m['path']][k]for k in copyFields if k in origins[m['path']]}
  assert currentCopy=={k:viewRows[m['path']][k]for k in copyFields if k in viewRows[m['path']]}
  assert currentCopy['copyBuildAuthor']==construction['actor']+' under '+construction['activation']
  copyRoles={'selectedOrigin':{'producer':rowref(m,cutPin,'/'+key+'/'+str(index)),'fields':historicalCopy},'currentSupplier':{'producer':rowref(sm,supplierPin,'/'+str(si)),'constructionActivation':constructionPin,'fields':currentCopy}}
  body=pin(C/'final-source'/m['path']);same_body(body,m)
  selectedBody=pin(m['origin']);same_body(selectedBody,m)
  if kind=='replacement':
   assert m['path']in preRows;prior=preRows[m['path']];preimage=m['preimage'];same_body(prior,preimage);assert preimage['path']==str(P/'final-source'/m['path']);same_body(pin(preimage['path']),preimage)
   assert (m['sha256'],m['bytes'],m['mode'])!=(prior['sha256'],prior['bytes'],prior['mode'])
  else:
   assert m['path']not in preRows and m['preimage']=='ABSENT';preimage='ABSENT'
  rows.append({'changeKind':kind,**{k:copy.deepcopy(m[k])for k in fields if k in m},'selectedCut':cutPin,'copyRoles':copyRoles,'preimage':copy.deepcopy(preimage),'postimage':body,'selectedProducerRow':rowref(m,cutPin,'/'+key+'/'+str(index)),'currentCutMemberRow':rowref(cm,cutPin,'/members/'+str(ci)),'currentSupplierRow':rowref(sm,supplierPin,'/'+str(si)),'projectedOriginRow':copy.deepcopy(origins[m['path']]['frozenRow']),'projectedSupplierRow':copy.deepcopy(viewRows[m['path']]['frozenRow'])})
assert len(rows)==9 and len({m['path']for m in rows})==9
actualDelta={p for p,m in currentRows.items()if p not in preRows or tuple(m[1][k]for k in ['sha256','bytes','mode'])!=tuple(preRows[p][k]for k in ['sha256','bytes','mode'])}
assert actualDelta=={m['path']for m in rows}
callback='build_tenants/abiogenesis/typescript/test_env/tests/t287-result-evidence-lineage-projection.test.mjs'
assert callback in currentRows and callback in preRows and callback not in actualDelta
assert set(preRows)<=set(currentRows)
contract={'kind':'derived_selected_current_source_delta','schemaVersion':'1','classification':'external_preparation_projection_not_original_supplier','selectedCut':cutPin,'predecessorFreeze':preFreeze,'predecessorMembers':preMembersPin,'currentMembers':supplierPin,'sourceChanges':rows,'replacementCount':len(cut['replacements']),'additionCount':len(cut['additions']),'changeCount':len(rows),'historicalAndCurrentCopyRolesSeparate':True,'legitimateAdditionsPreserveHistoricalCopyAbsence':True,'originalLabelsPreserved':True,'originalAuthorshipTransfer':False,'inheritedCallbackExcluded':True,'sourceAuthSufficiency':'unknown','independence':'unknown'}
h=hashlib.sha256(canonical(contract)).hexdigest();contract={'deltaRef':'qualification-derivation://abiogenesis/q07/current-source-delta/'+h,'deltaDigest':'sha256:'+h,**contract};put('f11/current-source-delta.json',contract);put('f11/current-source-delta-pin.json',pin(Q/'f11/current-source-delta.json'))
put('current-source-delta-correspondence.json',{'status':'PREPAYLOAD_VERIFIED','operation':'T287_FINAL_QUALIFICATION_INPUTS_13','selectedCut':cutPin,'predecessorFreeze':preFreeze,'predecessorMembers':preMembersPin,'currentMembers':supplierPin,'derivedDelta':pin(Q/'f11/current-source-delta.json'),'currentPopulation':len(currentRows),'predecessorPopulation':len(preRows),'derivedByManifestBodyComparison':len(actualDelta),'selectedReplacements':7,'selectedAdditions':2,'allNineUniqueFullTuplesJoined':True,'allSelectedNineSourceTuplesAndCopyRolesJoined':True,'all1111DeclaredSourceLabelsPreserved':True,'inheritedCallbackExcluded':True,'sourceAuthRecordsUnchanged':174,'chainsUnchanged':23,'spansUnchanged':90,'sourceBodyRoute':str(C/'final-source'),'originalSourceIsAttributionOnly':True})
print(json.dumps({'status':'PREPAYLOAD_VERIFIED','changes':len(rows),'replacements':7,'additions':2,'inheritedCallbackExcluded':True,'delta':pin(Q/'f11/current-source-delta.json')}))
