"""Rebind the retained physical-member bijection to exact C09 bodies and Q07 assertions."""
from pathlib import Path
import copy,hashlib,json
Q=Path(__file__).resolve().parent;G=Q.parent;C=G/'final-candidate-construction-09';R=G.parents[3]
def read(p):return json.loads(Path(p).read_bytes())
def pin(p):
 p=Path(p);return {'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'mode':p.stat().st_mode&511}
a=copy.deepcopy(read(G/'final-qualification-inputs-06/f11/member-alias-trace.json'));sources={v['path']:v for v in read(Q/'source-inventory.json')};catalog=read(C/'final-stage/build_tenants/abiogenesis/typescript/contracts/qualification/rule-catalog.json');authorities={v['ref']:v for v in catalog['sources']};manifest=read(Q/'input-manifest.json');declared={v['memberRef']:v for name in ['sourceFiles','authoritySources','lawMembers','toolFiles','fixtureFiles','dependencies']for v in manifest[name]}
for row in a['bijection']:
 v=sources.get(row['physicalMember']['path'])or declared[row['originalRef']];assert (row['physicalMember']['digest'],row['physicalMember']['byteCount'])==('sha256:'+v['sha256'],v['bytes'])
 assert row['canonicalGoverningSource']==authorities[row['originalRef']]
 row['qualifiedMemberRef']=row['qualifiedMemberRef'].replace('/q06/','/q07/');row['physicalMember']['classificationEvidenceRefs']=['selection://abiogenesis/rc1/final-qualification-inputs-07/source-and-material']
 row['physicalOrigin']={**row['physicalOrigin'],**pin(v['origin']),'ref':row['originalRef'],'path':row['physicalMember']['path'],'origin':v['origin'],'copyBuildAuthor':v.get('copyBuildAuthor',row['physicalOrigin'].get('copyBuildAuthor')),'sourceAuthor':v.get('sourceAuthor',row['physicalOrigin'].get('sourceAuthor'))}
a.update(activation='T287_FINAL_QUALIFICATION_INPUTS_12',aliasRoot='qualification-source-member://abiogenesis/q07/',candidateConstructionFreeze=pin(C/'final-freeze.json'),selectedGrant=pin(Q/'request.txt'),sourceAuthRecordBytesUnchanged=True,claims='Q07 reuses the accepted material role bijection; no source path or canonical packaged law tuple changes, authorship and independence unknown')
a.pop('physicalMemberCensusBeforeAliases',None)
auth=read(Q/'f11/source-authorship-records.json');affected={r['originalRef']for r in a['bijection']};assert not any(m['ref']in affected for ch in auth['chains']for m in ch['postimageMembers']);a['sourceAuthPostimageRefsAffected']=0
p=Q/'f11/member-alias-trace.json';assert not p.exists();p.write_text(json.dumps(a,indent=2,ensure_ascii=False)+'\n')
ctx=copy.deepcopy(read(G/'final-qualification-inputs-06/f11/member-alias-context.json'));ctx['traceSHA256']='sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();ctx['traceBytes']=p.stat().st_size
ctx['bijection']=[[r['originalRef'],r['qualifiedMemberRef'],r['physicalMember']['path'],r['canonicalGoverningSource']['path'],r['physicalMember']['digest'],r['physicalMember']['byteCount']]for r in a['bijection']]
c=Q/'f11/member-alias-context.json';assert not c.exists();c.write_text(json.dumps(ctx,separators=(',',':'),ensure_ascii=False)+'\n')
print(json.dumps({'aliases':len(a['bijection']),'oldAndNewChainPostimageIntersections':0,'physicalPathChanges':0,'canonicalGoverningTupleChanges':0}))
