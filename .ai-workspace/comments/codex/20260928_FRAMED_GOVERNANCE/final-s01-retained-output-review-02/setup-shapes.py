from pathlib import Path
import json
O=Path(__file__).resolve().parent;G=O.parent;N3=G/'final-native-setup-03';C=G/'final-candidate-construction-02';S=C/'source-freeze/repo/build_tenants/abiogenesis/typescript/code/src'
def show(k,v):print(k,json.dumps(v,separators=(',',':')))
for label in ['setup-workspace','setup-verify-core','setup-resolve','setup-install-core','setup-bind','setup-catalog','setup-catalog-view']:
 d=json.loads((N3/(label+'-stdout.json')).read_bytes())['receipt'];v=d['ownerOutput']['value'];
 show(label,{'valueKeys':list(v),'fields':{k:({'keys':list(x)[:22]} if isinstance(x,dict) else {'listCount':len(x)} if isinstance(x,list) else x) for k,x in v.items()},'resourceKeys':list(d['resources'])})
for rel,terms in [('public/cli.ts',['import','run','invoke','definition']),('owner_bindings/run_invocation.ts',['export','invoke','dispatch','execute','start']),('abg/index.ts',['hello','runInvocation','run_invocation','replay'])]:
 p=S/rel;ls=p.read_text().splitlines();hits=[{'line':i+1,'text':l} for i,l in enumerate(ls) if any(t in l for t in terms)];show('SOURCE_ROUTE',{'path':rel,'lines':hits[:50]})
for directory in ['public','owner_bindings','abg','hog']:
 hits=[]
 for p in (S/directory).glob('*.ts'):
  for i,l in enumerate(p.read_text().splitlines()):
   if any(t in l for t in ['HELLO_WORLD_FD_IMPLEMENTATION','hello-world-fd','function runInstalledDefinition','function executeDefinition','function invokePublicRoot','function startRootRun','function invokeRoot']):hits.append({'path':str(p.relative_to(S)),'line':i+1,'text':l})
 show('FUNCTION_ROUTE',hits[:18])
