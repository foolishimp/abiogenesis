from pathlib import Path
import json,hashlib,subprocess
A=Path('/Users/jim/src/apps/abiogenesis');G=Path('/Users/jim/src/apps/odd_glc');rel='.ai-workspace/comments/codex/20260923_WIP_CHECKPOINT/successor-04';C=A/'.ai-workspace/comments/codex';Q=C/'20260923_RC1_QUALIFICATION_RECIPE';GG=G/'.ai-workspace/comments/codex/20260923_GENERIC_DATA_MAPPER_CONTINUATION'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
lookup={}
for sub in ['compiled-02/check-inputs.json','compiled-03/accepted-current-authored.json','compiled-03/build-inputs.json','compiled-03/check-inputs.json','compiled-03/generated-after.json']:
 for row in json.loads((C/'20260923_COMPOSITE_READINESS'/sub).read_text()):lookup[row['path']]={**row,'source':sub}
freezes=[
(C/'20260923_COMPACT_ADMISSION_SELECTION/implementation-01/freeze.json',None),
(C/'20260923_COMPOSITE_READINESS/compiled-02/freeze.json',None),
(C/'20260923_COMPOSITE_READINESS/compiled-03/freeze.json',None),
(C/'20260923_CURRENT_STATUS_RECONCILIATION/successor-03/freeze.json',None),
(Q/'s02-installed-continuation-05/execution-01/freeze.json',Q/'s02-installed-continuation-05'),
(Q/'s02-installed-continuation-05-evidence-repair-01/freeze.json',None),
(Q/'s02-installed-continuation-05-evidence-repair-01/successor-01/freeze.json',None),
(Q/'s02-installed-continuation-06/execution-01/freeze.json',Q/'s02-installed-continuation-06'),
(GG/'execution-10-readiness/freeze.json',None),
(GG/'execution-10-readiness-02/freeze.json',None)]
posts=[C/'20260923_COMPACT_ADMISSION_SELECTION/review-01/return.md',C/'20260923_WHOLE_PATH_SCOPE_REVIEW/review.md',Q/'s02-installed-continuation-05-diagnosis-01/diagnosis.md',Q/'s02-installed-continuation-05-evidence-repair-01/review-01/return.md',GG/'execution-10-readiness-review/return.md']
for repo in [A,G]:
 root=repo/rel
 changes=subprocess.check_output(['git','diff','--name-only'],cwd=repo,text=True).splitlines()
 if repo==A:changes.append('build_tenants/abiogenesis/typescript/test_env/tests/t287-native-assessment-evidence.test.mjs')
 direct={}
 for path in changes:
  assert path not in direct
  actual=sha(repo/path)
  if path in ['specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md','.ai-workspace/tickets/active/T-043-deliver-generic-live-llm-scenario-mvp.md']:kind='Root-authorized_current_tracking'
  else:
   expected=lookup.get(path);assert expected and expected['sha256']==actual,('Unexpected canonical change',path);kind='accepted_compiled03_source_component_or_generated'
  direct[path]={'sha256':actual,'classification':kind,'proof':lookup.get(path,{}).get('source')}
 (root/'preimages.json').write_text(json.dumps([{'path':p,**e}for p,e in direct.items()],indent=2)+'\n')
 selection={'directExpected':direct,'closedProofSelections':[{'freeze':str(f),'sha256':sha(f),'memberBase':str(base)if base else None}for f,base in freezes],'adjoiningClosedPosts':[{'path':str(p),'sha256':sha(p)}for p in posts],'pending':['Active s02-installed-continuation-06-diagnosis-01 (read-only diagnosis output may appear later)','Original mutable GLC history/worksite and S02 runtime resource/install trees; no snapshot','Unselected build_tenants/abiogenesis/scratch outputs preserved in place'],'scope':'Accepted compact/caller/CCall source and component/compiled evidence, actual bounded installed05/06 success/failures, and four current tracking projections; no RC qualification or publication','generatedCoverage':'Tracked current contracts/manifest staged directly; ignored emitted build outputs are reproduced and fully represented by accepted compiled03 archive and generated inventory/correspondence, not omitted evidence'}
 (root/'selection.json').write_text(json.dumps(selection,indent=2)+'\n')
 print(json.dumps({'repository':repo.name,'canonicalSelected':len(direct),'closedFreezes':len(freezes),'closedPosts':len(posts)}))
