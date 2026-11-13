from pathlib import Path
import json,hashlib,subprocess,os,datetime
O=Path(__file__).parent;R=Path('/Users/jim/src/apps/abiogenesis');F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T=Path('build_tenants/abiogenesis/typescript');P=O.parents[1]/'rc11-qualification-01'
env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],env=env)
def pin(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def row(p,root):
 q=pin(root/p);return {'path':str(p),'bytes':q['bytes'],'sha256':q['sha256']}
def write(name,x):
 p=O/name
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n')
 return pin(p)
component=json.loads((O/'AUTHORITY_COMPONENT_FREEZE.json').read_text())
for r in component['rows']:assert row(r['path'],F)==r
tracking=json.loads((O/'AUTHORITY_EDIT_RECEIPT.json').read_text())
for x in tracking['tracking']:
 assert pin(Path(x['path']))==x['after'];data=Path(x['path']).read_bytes();assert hashlib.sha256(data[-x['beforeBytes']:]).hexdigest()==x['beforeSha256']
indexStanding=[]
for x in tracking['indicesConserved']:
 actual=pin(Path(x['path']))
 if 'abg-rc11-foundation-20261110-01' in x['path']:
  assert git(F,'diff','--cached','--name-only')==b''
  indexStanding.append({'before':x,'after':actual,'byteEqual':actual==x,'logicalStagedContentEqualsBase':True,'disposition':'Root accepts read-only staged equivalence; metadata difference retained, not attributed or restored.'})
 else:assert actual==x;indexStanding.append({'before':x,'after':actual,'byteEqual':True})
activation=json.loads((O/'ACTIVATION.json').read_text())
preserved=[]
for x in activation['preservationPins']:
 if x['path'] in [t['path'] for t in tracking['tracking']]:continue
 assert pin(Path(x['path']))==x,x['path'];preserved.append(x)
oldPlan=P/'root-cause-01/operator/ROOT_CAUSE_AND_PLAN.md';assert pin(oldPlan)['sha256']=='d9a9b7343dd5c66ce7c6eef11bfe18ec921d8b570a450fcc8514619e6d76e88c'
assert git(F,'rev-parse','HEAD').decode().strip()=='e2ba05da572f4a7e68d0629ecc83b9153a15e7c4';assert git(R,'rev-parse','HEAD').decode().strip()=='dd6938dd84fac37a76128d14cf1b5f0fa8aec299'
assert git(F,'diff','--cached','--name-only')==b''
changed=git(F,'diff','--name-only').decode().splitlines()
generated=[str(T/p) for p in ['contracts/capabilities/capability-definition-graph.json','contracts/qualification/authority-inputs.json','contracts/qualification/coverage.json','contracts/qualification/law-basis.json','contracts/qualification/rule-catalog.json','contracts/qualification/sources/PRODUCT.md','contracts/qualification/sources/REQ-R-ABG3-SAGA-FRONTIER.md','product-toolchain-manifest.json']]
expected={x['path'] for x in component['rows']}|set(generated)|{'specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md'}
assert set(changed)==expected,(set(changed)-expected,expected-set(changed))
basePath=P/'native-02/source-freeze.json';base=json.loads(basePath.read_text());rows=[row(x['path'],F) for x in base['rows']];sourceChanged=[r['path'] for a,r in zip(base['rows'],rows) if a!=r];assert set(sourceChanged)<=expected
sourceDigest=hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest()
compiledPath=P/'proof-01/reentry-01/COMPILED_BUILD_INVENTORY.json';compiled=json.loads(compiledPath.read_text());newCompiled=[row(x['path'],F/T) for x in compiled['rows']];compiledChanged=[r['path'] for a,r in zip(compiled['rows'],newCompiled) if a!=r];assert set(compiledChanged)=={str(Path(x).relative_to(T)) for x in generated},compiledChanged
mirror=[('specification/PRODUCT.md','contracts/qualification/sources/PRODUCT.md'),('specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md','contracts/qualification/sources/REQ-R-ABG3-SAGA-FRONTIER.md')]
for a,b in mirror:assert (F/a).read_bytes()==(F/T/b).read_bytes()
beforeInput=json.loads(git(F,'show','HEAD:'+str(T/'contracts/qualification/authority-inputs.json')));afterInput=json.loads((F/T/'contracts/qualification/authority-inputs.json').read_text());changedSources=[b['ref'] for a,b in zip(beforeInput['sources'],afterInput['sources']) if a!=b];assert changedSources==['repo://abiogenesis/specification/PRODUCT.md','repo://abiogenesis/specification/requirements/abg/REQ-R-ABG3-SAGA-FRONTIER.md']
snapshot=[]
for p in changed:
 target=O/'frozen-amendment'/p;target.parent.mkdir(parents=True,exist_ok=True)
 with target.open('xb') as f:f.write((F/p).read_bytes())
 snapshot.append({**row(p,F),'frozenPath':str(target)})
diff=git(F,'diff','--binary','--',*changed)
with (O/'AMENDMENT.diff').open('xb') as f:f.write(diff)
stdout=(O/'qualification-law-02.stdout').read_text();counts={}
for line in stdout.splitlines():
 for k in ['tests','pass','fail','cancelled','skipped','todo']:
  if line.startswith('# '+k+' '):counts[k]=int(line.split()[-1])
assert counts=={'tests':11,'pass':7,'fail':0,'cancelled':0,'skipped':4,'todo':0}
skips=[s for s in stdout.splitlines() if '# SKIP' in s]
freeze=write('AMENDMENT_FREEZE.json',{'status':'FROZEN_FOUNDATION_AMENDMENT_AWAITING_ROOT_CONJUNCTION','sourceRoot':str(F),'baseCommit':'e2ba05da572f4a7e68d0629ecc83b9153a15e7c4','baseTree':'1aabb06494de37a644b645161c6491d5b005cc73','branch':'codex/rc11-foundation-correction','preimage':pin(basePath),'sourceRows':len(rows),'sourceDigest':sourceDigest,'digestMethod':'sha256(JSON.stringify compact ordered rows using path,bytes,sha256 fields), same prior freeze method','sourceChangedPaths':sourceChanged,'unchangedSourceRows':len(rows)-len(sourceChanged),'selectedChangedPaths':changed,'snapshot':snapshot,'authorityComponentFreeze':pin(O/'AUTHORITY_COMPONENT_FREEZE.json'),'diff':pin(O/'AMENDMENT.diff'),'compiledPreimage':pin(compiledPath),'compiledRows':len(newCompiled),'compiledChangedPaths':compiledChanged,'compiledInventoryDigest':hashlib.sha256(json.dumps(newCompiled,separators=(',',':')).encode()).hexdigest(),'allOtherCompiledRowsEqual':True,'generatedAuthoritySourceChanges':changedSources,'mirrorByteEquality':True,'standing':'Product realization-profile text/design amendment and generated immutable definitions only. No production/test source change, new native Run, release or positive qualification.'})
post=write('POSTGUARDS.json',{'status':'MAIN_AND_DELIVERED_BYTES_PRESERVED_SUCCESSOR_INDEX_LOGICALLY_EQUAL','preserved':preserved,'tracking':tracking['tracking'],'indices':indexStanding,'originalDiagnosisPlan':pin(oldPlan),'sourceRoot':str(F),'originalSourceRowsConservedOutsideSelectedDelta':True,'productionAndTestSourceUnchanged':True,'mainSourceExceptTwoAuthorizedTrackingPrefixesUnchangedByThisWriter':True,'noWorkspaceRuntimeAllocated':not (F/'.abiogenesis/workspace-manifest.json').exists()})
ret=write('RETURN.json',{'status':'FOUNDATION_AUTHORITY_AMENDMENT_FROZEN_NATIVE_HELD','sourceFreeze':freeze,'postguards':post,'rootAdmission':pin(O/'ROOT_FOUNDATION_BASIS_01.json'),'triage':[pin(O.parent/'triage/ASSESSMENT.md'),pin(O.parent/'triage/ASSESSMENT.json')],'repairPlan':pin(O/'REPAIR_PLAN.md'),'actualChecks':{'compiler':pin(O/'tsc.json'),'authorityGeneration':pin(O/'qualification-authorities.json'),'successfulContinuation':pin(O/'GENERATION_CONTINUATION_RETURN.json'),'qualificationLaw':{'receipt':pin(O/'qualification-law-02.json'),'counts':counts,'skips':skips,'scope':'whole existing file, no qualification verdict'}},'preservedControlFailures':[pin(O/'GENERATION_RETURN.json'),pin(O/'GENERATION_REENTRY_RETURN.json')],'generatedFootprint':{'changedTrackedOutputs':generated,'unchangedRewrittenDefinitions':'Other generator outputs, including self-conformance.schema.json, match the retained compiled/contracts inventory; no positive evidence generated.','successorLocalCompiledRowsCompared':len(newCompiled),'codeRowsChanged':0,'scratch':str(F/'.foundation-generation'),'dependencies':'4576 file/link entries and authentic directory/hidden-lock metadata verified by unchanged accepted copy recipe'},'trackingReceipt':pin(O/'AUTHORITY_EDIT_RECEIPT.json'),'nextOwner':'Root consumes independent review and assesses complete Functional approach; revise repair plan before any native pilot. No setup/runtime prepared or launched.','nativeRoute':'Existing installed RC10 fresh create.imported setup route, actual native Program distinct from setup library Program, current nominal resource and same held caller; exact task/admission still absent.','limits':['Local delivered RC11 remains unqualified/unpublished; RC10 operational pin unchanged.','Active D2 restriction established, specific later author-failure causation unproved.','Both qualification debts and original failures remain open.','Metadata-dependent package reproduction limit unchanged; no new package was cut.']})
print(json.dumps({'return':ret,'freeze':freeze,'postguards':post,'sourceDigest':sourceDigest,'sourceRows':len(rows),'sourceChangedPaths':sourceChanged,'compiledChangedPaths':compiledChanged,'counts':counts},indent=2))
