from pathlib import Path
import hashlib,json,re
O=Path(__file__).resolve().parent;G=O.parent;R=G.parents[3];N=G/'final-native-continuation-04';records=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def selected(p,terms,context=2):
 b=p.read_bytes();ls=b.decode().splitlines();ids=set()
 for i,l in enumerate(ls):
  if any(t in l for t in terms):ids.update(range(max(0,i-context),min(len(ls),i+context+1)))
 rec={'path':str(p),'bytes':len(b),'sha256':sha(b),'lines':[{'line':i+1,'text':ls[i]} for i in sorted(ids)]};records.append(rec);return rec
for name,terms in [('observe-process.py',['fork','wait4','exec','pid','exitCode']),('ordinary-caller.mjs',['observe-process.py','process-start','spawn','native-process','physical','freshReads'])]:
 print(name,json.dumps(selected(N/name,terms,1),separators=(',',':')))
repo=Path('/Users/jim/src/apps/abiogenesis')
for p in (repo/'specification/requirements').rglob('*.md'):
 s=p.read_text()
 if 'REQ-P-SCENARIOS-008' in s:
  ls=s.splitlines();first=next(i for i,l in enumerate(ls) if 'REQ-P-SCENARIOS-008' in l);end=next((i for i in range(first+1,len(ls)) if ls[i].startswith('## ') and 'REQ-P-SCENARIOS-008' not in ls[i]),min(len(ls),first+130));
  rec={'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes()),'firstLine':first+1,'text':'\n'.join(ls[first:end])};records.append(rec);print('SCENARIO_AUTHORITY',json.dumps(rec,separators=(',',':')))
for p in (repo/'build_tenants/abiogenesis/typescript/design').glob('ABI5_REALIZATION_CONSTITUTION.md'):
 print('REALIZATION_AUTHORITY',json.dumps(selected(p,['5.3.2','SP-03','SP-08'],3),separators=(',',':')))
(O/'process-authority-sources.json').write_text(json.dumps(records,indent=2)+'\n')
