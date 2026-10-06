"""Retain original Q06 records; add exact accepted C06 author chains without assigning new authorship."""
from pathlib import Path
import base64,copy,difflib,hashlib,json
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE';Q=Path(__file__).resolve().parent;C=G/'final-candidate-construction-06';OLD=G/'final-qualification-inputs-06'
assert not (Q/'freeze.json').exists()
def read(p):return json.loads(Path(p).read_bytes())
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def put(n,v):
 p=Q/n;assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
auth=copy.deepcopy(read(OLD/'f11/source-authorship-records.json'));oldRecords=copy.deepcopy(auth['records']);oldChains=copy.deepcopy(auth['chains']);records=auth['records'];chains=auth['chains']
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
worker=G/'f11-fp-proof-delivery-realization-01';a=material(worker/'activation.json');pre=material(worker/'source-preimage-pins.json');delta=material(worker/'source.delta');closed=material(worker/'closure.json');author=material(worker/'source-authorship.json');grant=material(G/'rc1-f11-fp-delivery-repair-controls-01/source-request.txt')
leaf='build_tenants/abiogenesis/typescript/code/src/implementation/leaf_invocation_port.ts';test='build_tenants/abiogenesis/typescript/test_env/tests/t287-qualification-fp-proof-delivery.test.mjs'
leafpre=material(worker/'preimages/leaf_invocation_port.ts','external-preimage://abiogenesis/c06-fp-proof-delivery/'+leaf)
assert leafpre['digest']=='sha256:4a51cfe4adc7d5a200affb5b2ac8a704c01ead72a83e4fd1b632a4133f3ef997'
assert read(worker/'source-authorship.json')['testPreimage']=='ABSENT'
chains.append({'activationRef':a['ref'],'preimageRef':pre['ref'],'deltaRef':delta['ref'],'closureRef':closed['ref'],'authorRef':'/root/native_applicability_design','actorIdentityRef':'/root/native_applicability_design','authorityRef':grant['ref'],'scopeRefs':['repo://abiogenesis/'+leaf,'repo://abiogenesis/'+test],'postimageMembers':[post(leaf),post(test)],'changes':[{'memberRef':'repo://abiogenesis/'+leaf,'patchPath':leaf,'preimageMemberRef':leafpre['ref'],'postimageMemberRef':'repo://abiogenesis/'+leaf},{'memberRef':'repo://abiogenesis/'+test,'patchPath':test,'preimageMemberRef':None,'postimageMemberRef':'repo://abiogenesis/'+test}],'attributionSources':[span(a),span(closed),span(author),span(grant)]})
root=G/'rc1-successor-construction-controls-06';a=material(root/'activation.json');pre=material(root/'preimages.json');closed=material(root/'closure.json');ticket='.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'
prebody=material(root/'preimages/T-287.md','external-preimage://abiogenesis/c06-root-tracking/'+ticket)
prepin=next(x['preimage']for x in read(root/'preimages.json')if x['target']==str(R/ticket));assert prebody['digest']=='sha256:'+prepin['sha256']
# This ordinary difference is derived from actual Root frozen pre/post records; it is not an authored Source effect.
patch=''.join(difflib.unified_diff(base64.b64decode(prebody['contentBase64']).decode().splitlines(True),(C/'final-source'/ticket).read_text().splitlines(True),fromfile='a/'+ticket,tofile='b/'+ticket))
(Q/'f11/root-tracking-derivation.patch').write_text(patch);delta=material(Q/'f11/root-tracking-derivation.patch')
chains.append({'activationRef':a['ref'],'preimageRef':pre['ref'],'deltaRef':delta['ref'],'closureRef':closed['ref'],'authorRef':'/root','actorIdentityRef':'/root','authorityRef':a['ref'],'scopeRefs':['repo://abiogenesis/'+ticket],'postimageMembers':[post(ticket)],'changes':[{'memberRef':'repo://abiogenesis/'+ticket,'patchPath':ticket,'preimageMemberRef':prebody['ref'],'postimageMemberRef':'repo://abiogenesis/'+ticket}],'attributionSources':[span(a),span(closed)]})
assert records[:len(oldRecords)]==oldRecords and chains[:len(oldChains)]==oldChains
refs={m['ref']for m in records};assert len(refs)==len(records)
for ch in chains:
 for key in ['activationRef','preimageRef','deltaRef','closureRef']:assert ch[key]in refs
 for s in ch['attributionSources']:
  m=next(v for v in records if v['ref']==s['sourceRef']);b=base64.b64decode(m['contentBase64']);assert digest(b[s['startByte']:s['endByte']])==s['spanDigest']
auth.update(records=records,chains=chains,sourceOrigins=cut['members'],retainedQ06Records=len(oldRecords),retainedQ06Chains=len(oldChains),newAcceptedAuthorChains=len(chains)-len(oldChains),currentSourceCutDigest='sha256:'+hashlib.sha256((C/'controls/source-cut.json').read_bytes()).hexdigest(),originalRecordBytesUnchanged=True,rootTrackingDeltaDerivation={'author':'/root/q03_input_review only derives a difference from actual frozen Root pre/post body records','sourceAuthorship':'/root Writer under T287_F11_REPAIR_ACCEPTANCE_AND_C06_CONSTRUCTION_GRANT_01','newSourceAuthorship':False},independence='unknown',attributionSufficiency='unknown')
put('f11/source-authorship-records.json',auth)
put('source-auth-current-correspondence.json',{'status':'CLOSED','retainedRecords':len(oldRecords),'retainedChains':len(oldChains),'newChains':len(chains)-len(oldChains),'currentPostimages':[post(leaf),post(test),post(ticket)],'historicalLeaf4a51ChainUnchanged':True,'sourceCopyOrBuildIsAuthorship':False,'testPreimage':'ABSENT','recordBytes':sum(m['byteCount']for m in records),'chains':len(chains),'attributionSufficiency':'unknown','independence':'unknown'})
print(json.dumps({'records':len(records),'chains':len(chains),'retainedChains':len(oldChains),'currentPostimageMembers':3,'recordBytes':sum(m['byteCount']for m in records)}))
