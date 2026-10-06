"""Select the explicit 95 dual-role physical member aliases; retain every physical tuple."""
from pathlib import Path
from urllib.parse import quote
import hashlib,json
Q=Path(__file__).resolve().parent
assert not(Q/'freeze.json').exists()
def read(p):return json.loads(Path(p).read_bytes())
inventory=read(Q/'qualification-inventory.json');origins={x['ref']:x for x in read(Q/'inventory-origin-correspondence.json')}
catalog=read(read(Q/'candidate-binding.json')['catalog']['path'])
members={m['ref']:m for m in inventory['members']};rows=[]
for authority in catalog['sources']:
 original=authority['ref'];physical=members[original];origin=origins[original]
 assert (physical['digest'],physical['byteCount'])==(authority['digest'],authority['byteCount'])
 assert physical['path']!=authority['path']
 rows.append({'originalRef':original,'qualifiedMemberRef':'qualification-source-member://abiogenesis/q06/'+quote(original,safe=''),
  'physicalMember':physical,'canonicalGoverningSource':authority,'physicalOrigin':origin,
  'physicalPathUnchanged':True,'governingPathUnchanged':True,'bodyCorrespondence':'exact digest and byteCount, distinct material path roles',
  'sourceAuthSufficiency':'unknown'})
assert len(rows)==95 and len({r['originalRef']for r in rows})==95 and len({r['qualifiedMemberRef']for r in rows})==95
assert not any(r['qualifiedMemberRef']in members for r in rows)
auth=read(Q/'f11/source-authorship-records.json');affected={r['originalRef']for r in rows}
assert not any(m['ref']in affected for c in auth['chains']for m in c['postimageMembers'])
body={'kind':'current_physical_member_governing_law_role_bijection','schemaVersion':'1',
 'activation':'T287_FINAL_QUALIFICATION_INPUTS_06','aliasRoot':'qualification-source-member://abiogenesis/q06/',
 'candidateConstructionFreeze':read(Q/'candidate-binding.json')['constructionFreeze'],
 'selectedGrant':read(Q/'material-identity-continuation.json')['grant'],'bijection':rows,'aliasCount':95,
 'physicalMemberCensusBeforeAliases':len(inventory['members']),'physicalCensusDeltaFromAliases':0,
 'orderedPartitionTranslation':'member refs are substituted in their existing order before current adaptation; governing rule source refs remain canonical',
 'sourceAuthRecordBytesUnchanged':True,'sourceAuthPostimageRefsAffected':0,'sourceAuthPathChanges':0,
 'semanticClassification':'unknown','groupingSufficiency':'unknown','sourceAuthSufficiency':'unknown','independence':'unknown',
 'claims':'Q06 caller-authored material role derivation only; not original source authorship, actual admission or semantic acceptance'}
p=Q/'f11/member-alias-trace.json';assert not p.exists();p.write_text(json.dumps(body,indent=2,ensure_ascii=False)+'\n')
context={'kind':'qualification_material_role_alias_derivation_context','traceSHA256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),
 'traceBytes':p.stat().st_size,'sourceAuthPostimageRefsAffected':0,'sourceAuthRecordsAndPathsUnchanged':True,
 'claim':'Preparation derivation only; original source authorship and independence remain unknown.',
 'fields':['originalGoverningRef','physicalMemberAlias','originalPhysicalPath','packagedGoverningPath','bodyDigest','byteCount'],
 'bijection':[[r['originalRef'],r['qualifiedMemberRef'],r['physicalMember']['path'],r['canonicalGoverningSource']['path'],r['physicalMember']['digest'],r['physicalMember']['byteCount']]for r in rows]}
c=Q/'f11/member-alias-context.json';assert not c.exists();c.write_text(json.dumps(context,separators=(',',':'),ensure_ascii=False)+'\n')
print(json.dumps({'aliases':95,'sourceAuthPostimageRefsAffected':0,'traceBytes':p.stat().st_size,'traceSHA256':hashlib.sha256(p.read_bytes()).hexdigest()}))
