#!/usr/bin/env python3
"""Freeze a prepared new Run; pure hashes, no runtime/test/provider operation."""
from pathlib import Path
import json,hashlib,re
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');root=base/'attempt-011';inc=base/'increment-b-08'
def pin(p):
 d=p.read_bytes();return {'path':str(p),'bytes':len(d),'sha256':hashlib.sha256(d).hexdigest()}
selection=json.loads((root/'SELECTION.json').read_text());prior=json.loads(Path(selection['priorB08Manifest']['path']).read_text());assert pin(Path(selection['priorB08Manifest']['path']))==selection['priorB08Manifest']
activation=json.loads((root/'ACTIVATE_B09.json').read_text());repair=json.loads((inc/'EXECUTABLE_CLOSURE_REPAIR.json').read_text())
# Reuse the complete reviewed operator import closure, replacing only dispatcher
# and adding the new preparation entry. No old input/call/Result becomes authority.
graph={};static=re.compile(r"^import\s+(?:.*?\s+from\s+)?['\"]([^'\"]+)['\"]",re.M);dynamic=re.compile(r"\bimport\(\s*['\"]([^'\"]+)['\"]\s*\)")
def visit(p):
 p=p.resolve(strict=True)
 if p in graph:return
 assert p.is_relative_to(base);imports=set(static.findall(p.read_text())+dynamic.findall(p.read_text()));local=[]
 for spec in sorted(imports):
  if spec.startswith('node:'):continue
  assert spec.startswith('.'),spec
  q=(p.parent/spec).resolve(strict=True);assert q.suffix=='.mjs';local.append(q)
 graph[p]=local
 for q in local:visit(q)
visit(root/'dispatch.mjs');visit(root/'prepare-call.mjs')
files=set(root/n for n in ['workload.json','SELECTION.json','bind-current.py','prepare-call.mjs','dispatch.mjs','freeze.py','HANDOFF.md','PREPARATION_CUSTODY.json','retained-runtime.json','ACTIVATE_B09.json','input.json','prepared-call.json','PREPARED_CALL.json','run.json'])
files.update(graph);files.add(Path(selection['priorB08Manifest']['path']))
for k in ['priorB08Workload','priorB08Custody','initialSetupResume','criteria','sourceAndTools','launcherRepair','additionalSource']:files.add(Path(selection[k]['path']))
source=json.loads(Path(selection['sourceAndTools']['path']).read_text())
for k in ['sourceCustody','failedRunStatus']:files.add(Path(source[k]['path']))
for row in repair['offlineDependencyVerification'].values():
 if isinstance(row,dict):assert pin(Path(row['path']))==row;files.add(Path(row['path']))
files.add(inc/'PROVIDER_BINDING.json')
for row in activation['actualB08Return']:assert pin(Path(row['path']))==row;files.add(Path(row['path']))
x={'kind':'b09_actual_prepared_call_manifest','status':'NOT_DISPATCHED','files':[pin(p)for p in sorted(files)],'sourceBasis':'none','ProductWriteRoots':[],
 'executableLocalClosure':{'method':'relative static imports and literal dynamic imports, recursively; no module evaluation','modules':[{'path':str(p),'localImports':[str(q)for q in graph[p]]}for p in sorted(graph)]},
 'limits':['Fresh sourceBasis:none Run in existing setup004/catalog','No B08 Result authority imported','Root controls single later dispatch']}
p=root/'PREPARATION_MANIFEST.json'
with p.open('x') as f:json.dump(x,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'manifest':pin(p),'executableModules':len(graph)}))
