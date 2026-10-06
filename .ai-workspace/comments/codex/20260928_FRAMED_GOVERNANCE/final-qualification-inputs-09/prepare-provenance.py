"""Conserve all Q08 records/chains; add actual C07 GTL/test and Root tracking origins."""
from pathlib import Path
import base64,copy,difflib,hashlib,json
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE';Q=Path(__file__).resolve().parent;C=G/'final-candidate-construction-07';OLD=G/'final-qualification-inputs-08'
assert not(Q/'freeze.json').exists()
def read(p):return json.loads(Path(p).read_bytes())
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def put(n,v):
 p=Q/n;assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
auth=copy.deepcopy(read(OLD/'f11/source-authorship-records.json'));oldRecords=copy.deepcopy(auth['records']);oldChains=copy.deepcopy(auth['chains']);records=auth['records'];chains=auth['chains'];assert len(oldRecords)==110 and len(oldChains)==10
for m in records:
 b=base64.b64decode(m['contentBase64'],validate=True);assert len(b)==m['byteCount']and digest(b)==m['digest']
def material(p,ref=None):
 p=Path(p);b=p.read_bytes();relative=str(p.relative_to(R));m={'ref':ref or 'external-record://abiogenesis/'+relative,'path':relative,'digest':digest(b),'byteCount':len(b),'contentBase64':base64.b64encode(b).decode()}
 prior=next((v for v in records if v['ref']==m['ref']),None)
 if prior is None:records.append(m)
 else:assert prior==m
 return m
def span(m):return {'sourceRef':m['ref'],'startByte':0,'endByte':m['byteCount'],'spanDigest':m['digest']}
cut=read(C/'controls/source-cut.json');current={v['path']:v for v in cut['members']}
def post(path):
 m=current[path];p=C/'final-source'/path;b=p.read_bytes();assert len(b)==m['bytes']and digest(b)=='sha256:'+m['sha256']
 return {'ref':'repo://abiogenesis/'+path,'path':path,'digest':digest(b),'byteCount':len(b)}
worker=G/'qualification-raw-contract-realization-01';a=material(worker/'activation.json');pre=material(worker/'preimages.json');delta=material(worker/'source.delta.patch');closed=material(worker/'closed-result.json');author=material(worker/'source-authorship.json');grant=material(G/'rc1-runtime07-triangulation-and-raw-contract-repair-01/request.txt')
gtl='build_tenants/abiogenesis/typescript/code/src/gtl/self_conformance.ts';test='build_tenants/abiogenesis/typescript/test_env/tests/t287-qualification-raw-contract-preimage.test.mjs';prebody=material(worker/'preimages/self_conformance.ts','external-preimage://abiogenesis/c07-raw-contract/'+gtl)
assert read(worker/'activation.json')['actor']=='/root/q03_input_review'and read(worker/'closed-result.json')['status']=='CLOSED';assert read(worker/'source-authorship.json')['testPreimage']=='ABSENT'
chains.append({'activationRef':a['ref'],'preimageRef':pre['ref'],'deltaRef':delta['ref'],'closureRef':closed['ref'],'authorRef':'/root/q03_input_review','actorIdentityRef':'/root/q03_input_review','authorityRef':grant['ref'],'scopeRefs':['repo://abiogenesis/'+gtl,'repo://abiogenesis/'+test],'postimageMembers':[post(gtl),post(test)],'changes':[{'memberRef':'repo://abiogenesis/'+gtl,'patchPath':gtl,'preimageMemberRef':prebody['ref'],'postimageMemberRef':'repo://abiogenesis/'+gtl},{'memberRef':'repo://abiogenesis/'+test,'patchPath':test,'preimageMemberRef':None,'postimageMemberRef':'repo://abiogenesis/'+test}],'attributionSources':[span(a),span(closed),span(author),span(grant)]})
root=G/'rc1-successor-construction-controls-07';a=material(root/'activation.json');closed=material(root/'closure.json');ticket='.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md';prebody=material(root/'preimages'/ticket,'external-preimage://abiogenesis/c07-root-tracking/'+ticket)
prepin=next(m for m in read(root/'activation.json')['preimages']if m['path']==str(R/ticket));assert prebody['digest']=='sha256:'+prepin['sha256']and prebody['byteCount']==prepin['bytes']
postpin=next(m for m in read(root/'closure.json')['postimages']if m['path']==str(R/ticket));assert post(ticket)['digest']=='sha256:'+postpin['sha256']
patch=''.join(difflib.unified_diff(base64.b64decode(prebody['contentBase64']).decode().splitlines(True),(C/'final-source'/ticket).read_text().splitlines(True),fromfile='a/'+ticket,tofile='b/'+ticket))
(Q/'f11/root-tracking-derivation.patch').write_text(patch);delta=material(Q/'f11/root-tracking-derivation.patch')
chains.append({'activationRef':a['ref'],'preimageRef':a['ref'],'deltaRef':delta['ref'],'closureRef':closed['ref'],'authorRef':'/root','actorIdentityRef':'/root','authorityRef':a['ref'],'scopeRefs':['repo://abiogenesis/'+ticket],'postimageMembers':[post(ticket)],'changes':[{'memberRef':'repo://abiogenesis/'+ticket,'patchPath':ticket,'preimageMemberRef':prebody['ref'],'postimageMemberRef':'repo://abiogenesis/'+ticket}],'attributionSources':[span(a),span(closed)]})
assert records[:len(oldRecords)]==oldRecords and chains[:len(oldChains)]==oldChains
refs={m['ref']for m in records};assert len(refs)==len(records)
for ch in chains:
 for k in ['activationRef','preimageRef','deltaRef','closureRef']:assert ch[k]in refs
 for s in ch['attributionSources']:
  m=next(v for v in records if v['ref']==s['sourceRef']);b=base64.b64decode(m['contentBase64']);assert digest(b[s['startByte']:s['endByte']])==s['spanDigest']
auth.update(records=records,chains=chains,sourceOrigins=cut['members'],retainedQ08Records=len(oldRecords),retainedQ08Chains=len(oldChains),newAcceptedC07AuthorChains=len(chains)-len(oldChains),currentSourceCutDigest=digest((C/'controls/source-cut.json').read_bytes()),originalRecordBytesUnchanged=True,rootTrackingDeltaDerivation={'author':'/root/q03_input_review derives only an ordinary difference from actual frozen Root pre/post bodies','sourceAuthorship':'/root Writer under T287_RAW_CONTRACT_ACCEPTANCE_AND_C07_CONSTRUCTION_GRANT_01','newSourceAuthorship':False,'preimageManifest':'Root activation preimages field, preserved exactly'},independence='unknown',attributionSufficiency='unknown')
put('f11/source-authorship-records.json',auth)
put('source-auth-current-correspondence.json',{'status':'CLOSED','retainedRecords':len(oldRecords),'retainedChains':len(oldChains),'newChains':len(chains)-len(oldChains),'currentPostimages':[post(gtl),post(test),post(ticket)],'allHistoricalChainsUnchanged':True,'sourceCopyOrBuildIsAuthorship':False,'testPreimage':'ABSENT','recordBytes':sum(m['byteCount']for m in records),'records':len(records),'chains':len(chains),'currentGtlAndTestAuthor':'/root/q03_input_review under T287_QUALIFICATION_RAW_CONTRACT_PUBLICATION_REALIZATION_01','preparationAuthorSameAsGtlTestAuthor':True,'attributionSufficiency':'unknown','independence':'unknown'})
print(json.dumps({'records':len(records),'chains':len(chains),'retainedRecords':len(oldRecords),'retainedChains':len(oldChains),'newCurrentPostimages':3,'recordBytes':sum(m['byteCount']for m in records)}))
