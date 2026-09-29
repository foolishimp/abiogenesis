from pathlib import Path
import json,hashlib
out=Path(__file__).resolve().parent;base=out.parent;records=base.parent;repo=records.parents[3];tenant=repo/'build_tenants/abiogenesis/typescript';old=records/'s6-declared-source-projection-01/installed-live-03'
def ident(p):
 b=p.read_bytes();return {'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(n,v):
 with (out/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
preserved=[]
for folder,name in [(out,'proof-manifest.json'),(out,'launcher-manifest.json'),(base,'proof-manifest.json'),(old,'run-proof-manifest.json'),(old,'proof-manifest.json')]:
 rows=json.loads((folder/name).read_text())
 for path,v in rows.items():assert ident(folder/path)==v,(str(folder),path)
 preserved.append({'manifest':str(folder/name),**ident(folder/name),'members':len(rows)})
assert ident(out/'return.md')['sha256']=='4bc20a3e8d0bebcd8c8b30c34041da0491a8989ec0dbca50e606e4dc9af90afe'
assert ident(out/'readiness-freeze.json')['sha256']=='0a9a9d9bdcf9393ca1b657133d33abe66f16e555d250726905d8d00037117bca'
source=json.loads((base/'source-generated.json').read_text());checked=[]
for key,rows in source.items():
 if isinstance(rows,list):
  for row in rows:
   if isinstance(row,dict) and all(k in row for k in ['path','sha256','bytes']):
    assert ident(tenant/row['path'])=={k:row[k] for k in ['sha256','bytes']},row['path'];checked.append(row['path'])
correspondence=json.loads((out/'archive-installed-correspondence.json').read_text());installed=[]
for name,record in correspondence.items():
 assert ident(out/(name+'.tgz'))==record['archive']
 for member in record['members']:assert ident(Path(record['installedRoot'])/member['path'])=={k:member[k] for k in ['sha256','bytes']},member['path']
 installed.append({'name':name,'archive':record['archive'],'installedRoot':record['installedRoot'],'members':len(record['members']),'unchanged':True})
save('run-preservation.json',{'oldManifests':preserved,'installed':installed,'sourceGeneratedMembers':checked,'sourceGenerated':ident(base/'source-generated.json'),'readinessReturn':ident(out/'return.md'),'readinessFreeze':ident(out/'readiness-freeze.json'),'priorRunReturn':ident(old/'run-return.md'),'analysisCorrection':'Initial summary used seeded pre-dispatch event3 timestamp for a runtime gap. Corrected summary excludes beforeEventCount3 and retains original summary/script/log as .initial. No Run/event/receipt/response changed.'})
prior=set(json.loads((out/'proof-manifest.json').read_text()))
files=[p for p in out.iterdir() if p.is_file() and p.name not in prior and p.name not in ['run-proof-manifest.json','run-freeze.json','run-return.md','core.tgz','consumer.tgz']]
files += [p for p in (out/'worksite-result').rglob('*') if p.is_file()]
inventory={str(p.relative_to(out)):ident(p) for p in sorted(files)};save('run-proof-manifest.json',inventory)
save('run-freeze.json',{'readinessFreeze':ident(out/'readiness-freeze.json'),'sourceFreeze':ident(base/'freeze.json'),'core':ident(out/'core.tgz'),'consumer':ident(out/'consumer.tgz'),'input':ident(out/'input.json'),'launcherReadiness':ident(out/'return.md'),'proofManifest':ident(out/'run-proof-manifest.json'),'proofMembers':len(inventory),'events':ident(out/'events.jsonl'),'execution':ident(out/'execution.json'),'firstFailure':ident(out/'first-failure.json'),'diagnosis':ident(out/'fold-diagnosis.json'),'prerequisites':ident(out/'fold-prerequisites.json'),'actualAssessment':ident(out/'actual-assessment.json'),'rawCorrespondence':ident(out/'assessment-raw-correspondence.json'),'chain':ident(out/'admitted-chain.json'),'nativeScopeEvidence':ident(out/'native-scope-evidence.json'),'outcomeEvidence':ident(out/'outcome-evidence.json'),'reads':{k:ident(out/('read-'+k+'.json')) for k in ['run_result','run_replay']},'outcome':'runtime_failed','firstCausalEvidenceOrdinal':26497,'firstFailureResultOrdinal':26499,'providerCalls':12,'runClosed':False,'nativeAssessmentCompleted':True,'assessmentFoldAccepted':False,'coverageAccepted':False,'sourceAndOldProofPreserved':True,'nativeSettingsUnchanged':True,'qualificationKind':'new whole-witness instance; no live-03 recovery credit'})
print(json.dumps({'freeze':ident(out/'run-freeze.json'),'proof':ident(out/'run-proof-manifest.json'),'members':len(inventory),'evidence':json.loads((out/'run-freeze.json').read_text())},indent=2))
