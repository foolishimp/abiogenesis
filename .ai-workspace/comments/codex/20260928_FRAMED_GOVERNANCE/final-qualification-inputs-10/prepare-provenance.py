"""Preserve Q09 bytes/spans and bind genuine accepted successor author records."""
from pathlib import Path
import base64,copy,difflib,hashlib,json
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE';Q=Path(__file__).resolve().parent;C=G/'final-candidate-construction-09';D=G/'final-qualification-inputs-09'
assert not(Q/'freeze.json').exists()
def read(p):return json.loads(Path(p).read_bytes())
def digest(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def put(n,v):
 p=Q/n;assert not p.exists();p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
auth=copy.deepcopy(read(D/'f11/source-authorship-records.json'));oldRecords=copy.deepcopy(auth['records']);oldChains=copy.deepcopy(auth['chains']);records=auth['records'];chains=auth['chains']
assert(len(oldRecords),len(oldChains),sum(len(c['attributionSources'])for c in oldChains))==(121,12,46)
for m in records:
 b=base64.b64decode(m['contentBase64'],validate=True);assert len(b)==m['byteCount']and digest(b)==m['digest']
def material(p,ref=None):
 p=Path(p);b=p.read_bytes();rel=str(p.relative_to(R));m={'ref':ref or 'external-record://abiogenesis/'+rel,'path':rel,'digest':digest(b),'byteCount':len(b),'contentBase64':base64.b64encode(b).decode()}
 prior=next((v for v in records if v['ref']==m['ref']),None)
 if prior is None:records.append(m)
 else:assert prior==m
 return m
def span(m):return {'sourceRef':m['ref'],'startByte':0,'endByte':m['byteCount'],'spanDigest':m['digest']}
def member(path,body,ref=None):
 b=Path(body).read_bytes();return {'ref':ref or 'repo://abiogenesis/'+path,'path':path,'digest':digest(b),'byteCount':len(b)}
def chain(worker,grant,paths,preBodies,postBodies,patch,author,historical=False,preManifest=None,closure=None):
 a=material(worker/'activation.json');closed=material(closure or worker/'closure.json');authority=material(grant);source=material(worker/'source-authorship.json')if(worker/'source-authorship.json').exists()else closed
 pre=material(preManifest or worker/'source-authorship.json')if(preManifest or(worker/'source-authorship.json').exists())else a
 delta=material(patch);members=[];changes=[]
 for path,preBody,postBody in zip(paths,preBodies,postBodies):
  postBytes=Path(postBody).read_bytes();ref=('external-authored-postimage://abiogenesis/'+digest(postBytes)[7:]+'/'+path)if historical else 'repo://abiogenesis/'+path
  m=member(path,postBody,ref);members.append(m);postRecord=material(postBody,'external-source-body://abiogenesis/'+digest(postBytes)[7:]+'/'+path)
  prior=material(preBody,'external-preimage://abiogenesis/'+digest(Path(preBody).read_bytes())[7:]+'/'+path)if preBody is not None else None
  changes.append({'memberRef':m['ref'],'patchPath':path,'preimageMemberRef':prior['ref']if prior else None,'postimageMemberRef':postRecord['ref']})
 ch={'activationRef':a['ref'],'preimageRef':pre['ref'],'deltaRef':delta['ref'],'closureRef':closed['ref'],'authorRef':author,'actorIdentityRef':author,'authorityRef':authority['ref'],'scopeRefs':[m['ref']for m in members],'postimageMembers':members,'changes':changes,'attributionSources':[span(a),span(closed),span(source),span(authority)]}
 chains.append(ch);return ch
TR='build_tenants/abiogenesis/typescript/';outcome=TR+'code/src/abg/c_call_outcome.ts';regression=TR+'test_env/tests/t287-result-evidence-lineage-projection.test.mjs';typeTest=TR+'test_env/tests/t287-result-evidence-lineage-type-contract.test.mjs'
w=G/'result-lineage-evidence-realization-01';sa=read(w/'source-authorship.json');oldTest=w/'postimages'/Path(regression).name;oldSource=w/'postimages'/Path(outcome).name
assert digest(oldTest.read_bytes())=='sha256:'+sa['newTest']['sha256'];assert digest(oldSource.read_bytes())=='sha256:'+sa['sourcePostimage']['sha256']
chain(w,G/'rc1-result-lineage-repair-controls-01/worker-request.txt',[outcome,regression],[w/'c_call_outcome.ts.preimage',None],[oldSource,oldTest],w/'source.delta','/root/native_applicability_design',historical=True)
w=G/'result-lineage-evidence-test-fixture-repair-01';chain(w,G/'rc1-result-lineage-fixture-triangulation-controls-01/request.txt',[regression],[w/'preimage.test.mjs'],[w/'postimage.test.mjs'],w/'test.delta','/root/native_applicability_design')
w=G/'result-lineage-typed-contract-realization-01';sa=read(w/'source-authorship.json')
for row in sa['chains']:
 path=str(Path(row['postimage']['path']).relative_to(R));original=w/'postimages'/path
 assert len(original.read_bytes())==row['postimage']['bytes']and digest(original.read_bytes())=='sha256:'+row['postimage']['sha256']
 before=Path(row['preservedPreimage']['path'])if isinstance(row['preservedPreimage'],dict)else None
 if path!=typeTest:assert(C/'final-source'/path).read_bytes()==original.read_bytes()
 chain(w,Path(row['grant']['path']),[path],[before],[original],w/'deltas'/Path(path+'.diff'),row['authorAgent'],historical=path==typeTest)
w=G/'result-lineage-type-fixture-repair-01';sa=read(w/'source-authorship.json');assert(C/'final-source'/typeTest).read_bytes()==(w/'postimage.test.mjs').read_bytes();chain(w,Path(sa['grant']['path']),[typeTest],[Path(sa['savedPreimage']['path'])],[w/'postimage.test.mjs'],w/'test.delta','/root/q03_input_review')
w=G/'rc1-result-lineage-integration-design-01';sa=read(w/'design-acceptance.json');rootPaths=[TR+'design/T287_F11_CARRIER_RESOURCE_DESIGN.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'];preBodies=[];postBodies=[];parts=[]
for path in rootPaths:
 before=next(r for r in sa['preimages']if r['source']['path']==str(R/path));preBody=Path(before['frozenPreimage']['path']);postBody=C/'final-source'/path
 assert digest(preBody.read_bytes())=='sha256:'+before['source']['sha256'];preBodies.append(preBody);postBodies.append(postBody);parts.extend(difflib.unified_diff(preBody.read_text().splitlines(True),postBody.read_text().splitlines(True),fromfile='a/'+path,tofile='b/'+path))
patch=Q/'f11/root-tracking-derivation.patch';patch.write_text(''.join(parts));chain(w,w/'request.txt',rootPaths,preBodies,postBodies,patch,'/root',preManifest=w/'design-acceptance.json')
assert records[:len(oldRecords)]==oldRecords and chains[:len(oldChains)]==oldChains
refs={m['ref']for m in records};assert len(refs)==len(records)
for ch in chains:
 for k in ['activationRef','preimageRef','deltaRef','closureRef']:assert ch[k]in refs
 for s in ch['attributionSources']:
  m=next(v for v in records if v['ref']==s['sourceRef']);b=base64.b64decode(m['contentBase64']);assert digest(b[s['startByte']:s['endByte']])==s['spanDigest']
cut=read(C/'controls/source-cut.json');auth.update(records=records,chains=chains,sourceOrigins=cut['members'],retainedQ09Records=len(oldRecords),retainedQ09Chains=len(oldChains),retainedQ09Spans=46,newAcceptedC09AuthorChains=len(chains)-len(oldChains),currentSourceCutDigest=digest((C/'controls/source-cut.json').read_bytes()),originalRecordBytesUnchanged=True,originalAuthorsPreserved=True,independence='unknown',attributionSufficiency='unknown',historicalPostimages='Distinct historical authored postimage refs bind physical original paths and bodies; no current relabeling or authorship transfer',rootTrackingDeltaDerivation={'author':'/root/q03_input_review derives ordinary difference from genuine Root frozen pre/post bodies','sourceAuthorship':'/root Writer T287_RESULT_LINEAGE_INTEGRATION_DESIGN_WRITER_01','newSourceAuthorship':False})
put('f11/source-authorship-records.json',auth)
put('source-auth-current-correspondence.json',{'status':'CLOSED','retainedRecords':len(oldRecords),'retainedChains':len(oldChains),'retainedSpans':46,'newChains':len(chains)-len(oldChains),'allHistoricalChainsAndSpansUnchanged':True,'sourceCopyOrBuildIsAuthorship':False,'recordBytes':sum(m['byteCount']for m in records),'records':len(records),'chains':len(chains),'spans':sum(len(c['attributionSources'])for c in chains),'attributionSufficiency':'unknown','independence':'unknown','currentSourceAuthorship':'typed six production bodies and canonical type-test successor by /root/q03_input_review; HOW/T by /root; ten-field/regression donor by /root/native_applicability_design'})
print(json.dumps({'records':len(records),'chains':len(chains),'retainedRecords':len(oldRecords),'retainedChains':len(oldChains),'spans':sum(len(c['attributionSources'])for c in chains),'recordBytes':sum(m['byteCount']for m in records)}))
