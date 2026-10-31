#!/usr/bin/env python3
"""Freeze actual B11 prepared call; hashes only, no owner/provider operation."""
from pathlib import Path
import json,hashlib,re
BASE=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');INC=BASE/'increment-b-11';ATT=BASE/'attempt-013';SETUP=BASE/'setup-006'
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
repair=json.loads((BASE/'increment-b-08/EXECUTABLE_CLOSURE_REPAIR.json').read_text());files={p for p in INC.iterdir()if p.is_file()}
files.update(ATT/n for n in ['ACTIVATE_B11.json','input.json','prepared-call.json','PREPARED_CALL.json','run.json','prepare-call.mjs','dispatch.mjs'])
files.update(SETUP/n for n in ['operator-resume-material.json','summary.json'])
source=json.loads((INC/'SOURCE_AND_ELIGIBILITY.json').read_text())
for k in ['sourceCustody','failedRunStatus','actualFailureCustody']:files.add(Path(source[k]['path']))
files.add(BASE/'increment-b-08/EXECUTABLE_CLOSURE_REPAIR.json')
for row in repair['offlineDependencyVerification'].values():
 if isinstance(row,dict):assert pin(Path(row['path']))==row;files.add(Path(row['path']))
graph={};static=re.compile(r"^import\s+(?:.*?\s+from\s+)?['\"]([^'\"]+)['\"]",re.M);dynamic=re.compile(r"\bimport\(\s*['\"]([^'\"]+)['\"]\s*\)")
def visit(p):
 p=p.resolve(strict=True)
 if p in graph:return
 local=[];text=p.read_text()
 for spec in sorted(set(static.findall(text)+dynamic.findall(text))):
  if spec.startswith('node:'):continue
  assert spec.startswith('.'),spec
  q=(p.parent/spec).resolve(strict=True);assert q.is_relative_to(BASE);local.append(q)
 graph[p]=local;files.add(p)
 for q in local:visit(q)
visit(ATT/'dispatch.mjs');visit(ATT/'prepare-call.mjs')
manifest={'kind':'b11_actual_prepared_call_manifest','status':'NOT_DISPATCHED','files':[pin(p)for p in sorted(files)],'sourceBasis':'none','ProductWriteRoots':source['ProductWriteRoots'],'executableLocalClosure':{'method':'relative static imports and literal dynamic imports, recursively; no module evaluation','modules':[{'path':str(p),'localImports':[str(q)for q in graph[p]]}for p in sorted(graph)]},'limits':['Only3 selected original Product paths writable by native Construction','Root owns actual call/launch review; no auto retry','No prior Results or witnesses imported']}
p=ATT/'PREPARATION_MANIFEST.json'
with p.open('x')as f:json.dump(manifest,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'sha256':pin(p)['sha256'],'files':len(files),'operatorModules':len(graph)}))
