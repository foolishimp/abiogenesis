"""Retain actual original source records. This projection grants no authorship."""
from pathlib import Path
import base64,copy,hashlib,json,gzip
R=Path('/Users/jim/src/apps/abiogenesis');G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=G/'final-qualification-inputs-06'
def read(p):return json.loads(Path(p).read_bytes())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def put(n,v):
 p=Q/n;assert not p.exists(),str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
old=read(G/'final-f11-bound-assessment-01/provenance.json')
records=copy.deepcopy(old['records']);chains=copy.deepcopy(old['chains'])
for m in records:
 b=base64.b64decode(m['contentBase64'],validate=True);assert len(b)==m['byteCount']and sha(b)==m['digest']
def material(p,ref=None):
 p=Path(p);b=p.read_bytes();relative=str(p.relative_to(R));m={'ref':ref or 'external-record://abiogenesis/'+relative,'path':relative,'digest':sha(b),'byteCount':len(b),'contentBase64':base64.b64encode(b).decode()}
 prior=next((x for x in records if x['ref']==m['ref']),None)
 if prior is None:records.append(m)
 else:assert prior==m
 return m
def source(path,p,expected):
 b=Path(p).read_bytes();assert sha(b)==expected
 return {'ref':'repo://abiogenesis/'+path,'path':path,'digest':expected,'byteCount':len(b)}
def span(m):return {'sourceRef':m['ref'],'startByte':0,'endByte':m['byteCount'],'spanDigest':m['digest']}
cut=read(G/'rc1-successor-construction-controls-05/source-cut.json');current={m['path']:m for m in cut['members']}
carrier=G/'f11-carrier-realization-01'
posts=read(carrier/'source-postimages.json');activation=material(carrier/'activation.json');pre=material(carrier/'source-preimages.json');delta=material(carrier/'source.delta.patch');closed=material(carrier/'return.md');postrecord=material(carrier/'source-postimages.json');originalGrant=material(G/'f11-carrier-implementation-controls-01/request.txt');assert originalGrant['digest']=='sha256:4426248f90e1741ba69e7e3f88a23819dc3d887aee4ea9bb4822fe4a55c1d18d'
selected=[m for m in posts if m['changed']and m['path']in current and current[m['path']]['sha256']==m['sha256']]
for m in selected:
 if m['preimage']['existed']:
  body=material(carrier/'preimages'/m['path'],'external-preimage://abiogenesis/f11-carrier/'+m['path'])
  assert body['digest']=='sha256:'+m['preimage']['sha256']and body['byteCount']==m['preimage']['bytes']
chains.append({'activationRef':activation['ref'],'preimageRef':pre['ref'],'deltaRef':delta['ref'],'closureRef':closed['ref'],
 'authorRef':'/root/f11_carrier_design_worker','actorIdentityRef':'/root/f11_carrier_design_worker','authorityRef':'external-record://abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/f11-carrier-implementation-controls-01/request.txt',
 'scopeRefs':['repo://abiogenesis/'+m['path']for m in selected],
 'postimageMembers':[source(m['path'],carrier/m['postimagePath'],'sha256:'+m['sha256'])for m in selected],
 'changes':[{'memberRef':'repo://abiogenesis/'+m['path'],'patchPath':m['path'],'preimageMemberRef':'external-preimage://abiogenesis/f11-carrier/'+m['path']if m['preimage']['existed']else None,'postimageMemberRef':'repo://abiogenesis/'+m['path']}for m in selected],
 'attributionSources':[span(activation),span(closed),span(postrecord),span(originalGrant)]})
native=G/'native-declaration-applicability-realization-01'
activation=material(native/'activation.json');pre=material(native/'preimages.json');closed=material(native/'closure.json');postrecord=material(native/'postimages.json')
for row in read(native/'postimages.json')['records']:
 path=str(Path(row['source']['path']).relative_to(R));m=current[path];assert m['sha256']==row['snapshot']['sha256']
 delta=material(native/row['diff']);prebody=material(native/row['preimage']['path'],'external-preimage://abiogenesis/native-applicability/'+path)
 chains.append({'activationRef':activation['ref'],'preimageRef':pre['ref'],'deltaRef':delta['ref'],'closureRef':closed['ref'],
  'authorRef':'/root/native_applicability_design','actorIdentityRef':'/root/native_applicability_design','authorityRef':'external-record://abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/native-declaration-applicability-source-controls-01/request.txt',
  'scopeRefs':['repo://abiogenesis/'+path],'postimageMembers':[source(path,native/row['snapshot']['path'],'sha256:'+m['sha256'])],
  'changes':[{'memberRef':'repo://abiogenesis/'+path,'patchPath':path,'preimageMemberRef':prebody['ref'],'postimageMemberRef':'repo://abiogenesis/'+path}],
  'attributionSources':[span(activation),span(closed),span(postrecord)]})
installer=G/'install-bin-policy-realization-01';activation=material(installer/'activation.json');pre=material(installer/'install_product.preimage.ts','external-preimage://abiogenesis/installer-policy/install_product.ts');delta=material(installer/'source.diff');closed=material(installer/'closure.json')
path='build_tenants/abiogenesis/typescript/code/src/product/install_product.ts';m=current[path]
chains.append({'activationRef':activation['ref'],'preimageRef':pre['ref'],'deltaRef':delta['ref'],'closureRef':closed['ref'],
 'authorRef':'/root/native_applicability_design','actorIdentityRef':'/root/native_applicability_design','authorityRef':'external-record://abiogenesis/.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/rc1-install-bin-policy-source-controls-01/request.txt',
 'scopeRefs':['repo://abiogenesis/'+path],'postimageMembers':[source(path,installer/'install_product.postimage.ts','sha256:'+m['sha256'])],
 'changes':[{'memberRef':'repo://abiogenesis/'+path,'patchPath':path,'preimageMemberRef':pre['ref'],'postimageMemberRef':'repo://abiogenesis/'+path}],
 'attributionSources':[span(activation),span(closed)]})
for p in [G/'rc1-successor-construction-controls-05/source-cut.json',G/'rc1-successor-construction-controls-05/source-acceptance.json',G/'rc1-install-bin-policy-source-controls-01/request.txt',G/'native-declaration-applicability-source-controls-01/request.txt',G/'source-author-observation-01/record.json',G/'source-author-observation-01/s03-account.md',G/'source-author-observation-01/selected-action-account.md']:
 material(p)
refs={m['ref']for m in records}
for ch in chains:
 for k in ['activationRef','preimageRef','deltaRef','closureRef']:assert ch[k]in refs,(k,ch[k])
 for change in ch['changes']:
  if ch in chains[len(old['chains']):]and change['preimageMemberRef']is not None:assert change['preimageMemberRef']in refs
 for s in ch['attributionSources']:
  record=next(m for m in records if m['ref']==s['sourceRef']);b=base64.b64decode(record['contentBase64']);assert 0<=s['startByte']<s['endByte']<=len(b)and sha(b[s['startByte']:s['endByte']])==s['spanDigest']
put('f11/source-authorship-records.json',{'records':records,'chains':chains,'acknowledgmentSelectionRef':old['acknowledgmentSelectionRef'],
 'historicalOriginalChains':len(old['chains']),'currentIncrementChains':len(chains)-len(old['chains']),
 'sourceOrigins':cut['members'],'independence':'unknown','attributionSufficiency':'unknown',
 'limits':['Original historical records/chains remain historical; source-cut copy/build actors are not promoted to source authors.',
 'Inherited source authorship and independent attribution remain unresolved. Whole records bind to resource selectors; only retained attribution spans enter the selected prompt.']})
scope=read(G/'final-f11-bound-assessment-01/assessment-input.json')['task']['scope']
# An exact compressed data preimage avoids adding a second uncompressed 49 MB
# declaration body to the complete resource population. Expansion is caller HOW.
body=json.dumps(scope,ensure_ascii=False,separators=(',',':')).encode()
(Q/'f11/historical-partition-preimage.json.gz').write_bytes(gzip.compress(body,mtime=0))
put('f11/historical-partition-preimage-pin.json',{'expandedBytes':len(body),'expandedSHA256':sha(body),'historicalOnly':True,'ruleGroups':len(scope['ruleGroups'])})
print(json.dumps({'records':len(records),'recordBytes':sum(m['byteCount']for m in records),'chains':len(chains),'spanBytes':sum(s['endByte']-s['startByte']for c in chains for s in c['attributionSources']),'historicalRuleGroups':len(scope['ruleGroups'])}))
