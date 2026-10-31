#!/usr/bin/env python3
# Freeze actual prepared invocation only; no ABG/provider call and no new census.
from pathlib import Path
import hashlib,json,re
base=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc3-dogfood-01');inc=base/'increment-b-08';att=base/'attempt-010';setup=base/'setup-004'
def pin(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
# These selected modules use one-line static declarations. Literal dynamic imports are
# included too. Computed installed-Product imports and the unused runScenario oracle
# are not operator-local module dependencies; no module is imported/evaluated here.
static=re.compile(r"^import\s+(?:.*?\s+from\s+)?['\"]([^'\"]+)['\"]",re.M)
export=re.compile(r"^export\s+.*?\s+from\s+['\"]([^'\"]+)['\"]",re.M)
dynamic=re.compile(r"\bimport\(\s*['\"]([^'\"]+)['\"]\s*\)")
graph={}
def visit(p):
 p=p.resolve(strict=True)
 if p in graph:return
 assert p.is_relative_to(base),str(p)
 text=p.read_text();imports=set(static.findall(text)+export.findall(text)+dynamic.findall(text));local=[]
 for spec in sorted(imports):
  if spec.startswith('node:'):continue
  if not spec.startswith('.'):raise ValueError('unsupported operator module import: '+spec+' in '+str(p))
  target=(p.parent/spec).resolve(strict=True);assert target.suffix=='.mjs',str(target);local.append(target)
 graph[p]=local
 for target in local:visit(target)
visit(att/'dispatch.mjs')
repair=json.loads((inc/'EXECUTABLE_CLOSURE_REPAIR.json').read_text())
for row in repair['preservedPreparedInputs']:assert pin(Path(row['path']))==row,row['path']
for row in repair['offlineDependencyVerification'].values():
 if isinstance(row,dict):assert pin(Path(row['path']))==row,row['path']
files=[p for p in inc.iterdir() if p.is_file() and not p.name.endswith('.TEMPLATE.json')]
files += [att/n for n in ['ACTIVATE_B08.json','PREPARED_CALL.json','prepared-call.json','input.json','run.json','prepare-call.mjs','dispatch.mjs']]
files += [setup/'operator-resume-material.json',setup/'summary.json']
source=json.loads((inc/'SOURCE_AND_ELIGIBILITY.json').read_text())
files += [Path(source[k]['path']) for k in ['sourceCustody','failedRunStatus']]
files += list(graph)+[Path(repair['supersededManifest']['path'])]
files += [Path(row['path']) for row in repair['offlineDependencyVerification'].values() if isinstance(row,dict)]
files=sorted(set(files))
x={'kind':'b08_actual_prepared_call_manifest','status':'NOT_DISPATCHED','files':[pin(p)for p in files],
 'executableLocalClosure':{'method':'relative static imports and literal dynamic imports, recursively; no module evaluation','modules':[{'path':str(p),'localImports':[str(q)for q in graph[p]]}for p in sorted(graph)]},
 'supersedes':repair['supersededManifest'],'sourceBasis':'none','ProductWriteRoots':[],
 'limits':['No native Run or spend','No old Result imported','Root controls the single later dispatch']}
p=att/'PREPARATION_MANIFEST.json'
with p.open('x') as f:json.dump(x,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps({'manifestSha256':pin(p)['sha256'],'files':len(files),'executableModules':len(graph)}))
