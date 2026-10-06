"""Conserve accepted current material; rebase only owned preparation descriptors."""
from pathlib import Path
import copy,hashlib,json
Q=Path(__file__).resolve().parent;D=Q.parent/'final-qualification-inputs-10'
assert not(Q/'freeze.json').exists()
manifest=copy.deepcopy(json.loads((D/'input-manifest.json').read_bytes()));aliases=json.loads((D/'f11/member-alias-trace.json').read_bytes());reverse={r['qualifiedMemberRef']:r['originalRef']for r in aliases['bijection']}
for name in ['sourceFiles','authoritySources','lawMembers','toolFiles','fixtureFiles','dependencies']:
 for row in manifest[name]:
  row['memberRef']=reverse.get(row['memberRef'],row['memberRef'])
  assert not row['origin'].startswith(str(D)),row['origin']
(Q/'input-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'status':'all_original_material_populations_conserved','protectedNonRecipeMembers':sum(len(manifest[n])for n in ['sourceFiles','authoritySources','lawMembers','toolFiles','fixtureFiles','dependencies']),'fiveC07fixtures':sum(v['classification']=='retained_C07_component_compiled_delta'for v in manifest['fixtureFiles'])}))
