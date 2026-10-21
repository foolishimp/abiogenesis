from pathlib import Path
import json,hashlib,stat,os
r=Path.cwd();w=r/'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01';real=w/'realization';checks=[]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
expected=[('L2-execution-contract.md','65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'),('proof/L2-report.md','7beb5ee434076ed1e9e89759f4c237264318fbdb7c479f241a4893e41c337487'),('realization/final-proof-preparation-01/freeze.json','e7bf015a4cc2bf9246d2aedd9800a8b0c41aef5255b5b30fdfd78a69627b12aa'),('realization/p5-installed-preparation-01/freeze.json','b8859cda37f284ef928360059664b14b4304c131b23e21f453cdc4cf135e92b6'),('realization/hog-ordinary-owner-driver-preparation-01/freeze.json','12239d043ac3ad63f65f844be2691601b5119ff0a90110bb273ed73a7f9c2243'),('realization/combined-final-02/freeze.json','245a11505b2c3f372da001fa0f3202d4554fea30d9d593e2fe3b5ede61906fe2'),('realization/combined-final-02/protected-main-generated.json','b6273def4c3e1db1dcb5d350db81f65019bc8a07ca189c0ac08cf41655bc1b96')]
for p,h in expected:assert sha(w/p)==h,p
for name,key,relative in [('final-proof-preparation-01','records',False),('p5-installed-preparation-01','files',True),('hog-ordinary-owner-driver-preparation-01','records',False),('combined-final-02','files',False)]:
 base=real/name;d=json.loads((base/'freeze.json').read_text());rows=d[key]
 for x in rows:
  p=(base if relative else r)/x['path'];assert 'continuation-17' not in str(p) and '/P0_' not in str(p)
  s=p.lstat();assert stat.S_ISREG(s.st_mode),(str(p),'nonregular');assert s.st_size==x['bytes'],str(p)
  assert sha(p)==x['sha256'],str(p)
  if 'mode' in x:assert oct(stat.S_IMODE(s.st_mode))==x['mode'],str(p)
 checks.append([name,len(rows),'match'])
d=json.loads((real/'combined-final-02/protected-main-generated.json').read_text())
for x in d['files']:
 p=r/x['path'];s=p.lstat();assert s.st_size==x['bytes'] and sha(p)==x['sha256'] and oct(stat.S_IMODE(s.st_mode))==x['mode'],str(p)
checks.append(['main-generated',len(d['files']),'match'])
print(json.dumps({'selectedPins':len(expected),'closedRecords':checks,'targetAbsent':not(real/'route-obligation-proof-preparation-01').exists()},indent=2))
b=json.loads((w/'proof/baseline/source-manifest.json').read_text());print('baseline first row',b['files'][0])
for suffix in ['code/src/abg/worksite_input_provenance.ts','code/src/abg/event_prefix.ts','code/src/abg/runtime_derivation.ts','code/src/product/installed_module.ts']:
 matches=[x for x in b['files'] if x['path'].endswith(suffix)];print('baseline',suffix,matches)
