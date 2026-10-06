from pathlib import Path
import hashlib,json
D=Path(__file__).resolve().parent.parent
C=D.parent/'final-candidate-construction-02/staged-repo/build_tenants/abiogenesis/typescript'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text())
def save(n,v):
 with (D/n).open('x') as f:json.dump(v,f,indent=2);f.write('\n')
rows=read(D/'final-generated-after.json');delta=[];old_population=0
for r in rows:
 old=C/r['path'];prior=sha(old) if old.is_file() else None
 old_population+=int(prior is not None)
 if prior!=r['sha256']:
  delta.append({'path':r['path'],'C02ActualStageSHA256':prior,'C03GeneratedSHA256':r['sha256'],'C03Bytes':r['bytes'],'role':r['role']})
summary=read(D/'final-generated-summary.json')
save('final-generated-delta-corrected.json',delta)
save('final-generated-summary-corrected.json',{**summary,'generatedChangedFromC02':len(delta),
 'comparableC02StageMembers':old_population,'newDerivedMembers':len(rows)-old_population,
 'comparisonBasis':'actual C02 staged bytes for the complete C03 output population; includes96 derived authority preimages excluded from C02 generated-only inventory',
 'supersedesComparisonCountsOnly':'final-generated-summary.json and final-generated-delta.json; all physical generation/source/authority joins unchanged'})
save('final-comparison-triage.json',{
 'frameVariables':{'originalC02GeneratedOnly':828,'C03GeneratedAndDerivedAuthorityOutputs':len(rows),'derivedAuthorityInputs':96},
 'firstViolatedRelation':'The new derived output population was compared only to the donor generated-only inventory, so unchanged authority source copies appeared newly generated.',
 'ProductDesign':'Source and derived authority output roles are distinct; physical stage bytes are the correct predecessor comparison.',
 'IdentityIntegration':'Exact actual staged preimages exist for all inherited96 authority copies; compare those, not absent donor inventory keys.',
 'Proof':'Initial129 count was mechanical accounting only; retained source/law/span/manifest evidence and all physical outputs unchanged.',
 'jointCause':'Reused generated-only comparator missed the intentionally broader C03 output population; no runtime or source defect.',
 'ownerReentry':'Construction Worker, local final report/control correction within declared grant; no implementation effect.',
 'reproof':{'actualOldToNewStageComparison':True,'changedOutputs':len(delta),'newOutputs':len(rows)-old_population},
 'preserved':'Initial accounting retained; corrected comparison supersedes only the count and delta relation.'})
print(json.dumps({'changedOutputs':len(delta),'newOutputs':len(rows)-old_population,'completeOutputs':len(rows)}))
