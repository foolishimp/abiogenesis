"""Derives a new unbound preparation from Q03, preserving its valid populations."""
import ast
import json
import pathlib

REPO=pathlib.Path('/Users/jim/src/apps/abiogenesis')
G=REPO/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=G/'final-qualification-inputs-04'
PREVIOUS=G/'final-qualification-inputs-03'
assert not (Q/'freeze.json').exists()
assert json.loads((Q/'readiness-result.json').read_bytes())['status']=='passed'

def put(name,text):
    assert (Q/name).parent==Q
    with (Q/name).open('x')as f:f.write(text)
def replace_once(text,old,new):
    assert text.count(old)==1,old
    return text.replace(old,new)
def current(text):
    return text.replace('final-qualification-inputs-03','final-qualification-inputs-04').replace('abiogenesis/q03/','abiogenesis/q04/').replace('T287_FINAL_QUALIFICATION_INPUTS_03','T287_FINAL_QUALIFICATION_INPUTS_04')

for name in ['recipe.mjs','compare-generated.mjs','test-environment.mjs']:
    put(name,current((PREVIOUS/name).read_text()))
stage=current((PREVIOUS/'recipe-stage.mjs').read_text())
stage=replace_once(stage,"['verification-recipe.json','test-environment.mjs','staging-fixtures.json']", "['verification-recipe.json','test-environment.mjs','staging-fixtures.json','component-stage-plan.json','component-stage.mjs']")
put('recipe-stage.mjs',stage)
put('component-stage.mjs',"""// Pure declared derivation of an isolated historical component tool.
// Current qualification law and its output population are not overwritten.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const plan=JSON.parse(fs.readFileSync('.recipe/component-stage-plan.json','utf8'));
const root=path.resolve('.components/retained-carrier');
if(fs.existsSync(root))throw Error('component output must be absent');
const copies=plan.members.map(row=>{
 for(const relative of [row.source,row.destination])if(path.isAbsolute(relative)||relative.split('/').includes('..'))throw Error('unsafe component path');
 const source=path.resolve(row.source);
 if(fs.realpathSync(source)!==source||!fs.lstatSync(source).isFile())throw Error('noncanonical component source');
 const bytes=fs.readFileSync(source);
 if(bytes.length!==row.bytes||hash(bytes)!==row.sha256)throw Error('component source differs: '+row.source);
 return {row,bytes,mode:fs.statSync(source).mode&0o777};
});
if(new Set(copies.map(x=>x.row.destination)).size!==copies.length)throw Error('duplicate component destination');
for(const {row,bytes,mode}of copies){const target=path.join(root,row.destination);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx',mode});}
const report={kind:'isolated_component_staging',componentRoot:plan.destinationRoot,files:copies.length,bytes:copies.reduce((n,x)=>n+x.bytes.length,0),roles:plan.counts,
 historicalCatalogSHA256:plan.historicalCatalogSHA256,currentCatalogSHA256:plan.currentCatalogSHA256,currentQualificationTenantOverwritten:false};
fs.writeFileSync('reports/component-staging.json',JSON.stringify(report)+'\\n',{flag:'wx'});
console.log(JSON.stringify(report));
""")
consumer=current((PREVIOUS/'output-checks.mjs').read_text())
addition="""
  const componentDescriptor=protectedInputs.find(r=>r.target==='recipe/component-stage-plan.json');assert.ok(componentDescriptor);
  const componentPlanBytes=await readOutput('recipe/component-stage-plan.json');assert.equal(componentPlanBytes.length,componentDescriptor.bytes);assert.equal(product.sha256Bytes(componentPlanBytes),'sha256:'+componentDescriptor.sha256);
  const componentPlan=JSON.parse(componentPlanBytes),componentReport=JSON.parse(await readOutput('verification/reports/component-staging.json'));
  assert.deepEqual(componentReport,{kind:'isolated_component_staging',componentRoot:componentPlan.destinationRoot,files:componentPlan.members.length,bytes:componentPlan.members.reduce((n,r)=>n+r.bytes,0),roles:componentPlan.counts,historicalCatalogSHA256:componentPlan.historicalCatalogSHA256,currentCatalogSHA256:componentPlan.currentCatalogSHA256,currentQualificationTenantOverwritten:false});
  for(const r of componentPlan.members){const bytes=await readOutput(join('verification',componentPlan.destinationRoot,r.destination));assert.equal(bytes.length,r.bytes);assert.equal(product.sha256Bytes(bytes),'sha256:'+r.sha256);}mark('all declared historical component outputs use actual helper snapshot');
"""
consumer=replace_once(consumer,"  const result={status:'passed',outputRoot",addition+"  const result={status:'passed',componentReport,outputRoot")
put('output-checks.mjs',consumer)

prepare=current((PREVIOUS/'prepare-data.py').read_text())
prepare=replace_once(prepare,"selected['totalSelectedTitles'] = sum(t['expectedTestCount'] for t in tests)","""carrier_test = next(t for t in tests if t['commandId'].endswith('/t287-qualification-carrier-resource'))
carrier_test['originalSourceFiles'] = carrier_test['files'][:]
carrier_test['files'] = ['.components/retained-carrier/' + p for p in carrier_test['files']]
carrier_test['meaning'] = 'unchanged six historical RC1 carrier oracles with current C03 compiled implementation; both test import and owned catalog URL resolve in the isolated component tenant'
carrier_test['componentStagePlan'] = record(Q / 'component-stage-plan.json')
selected['totalSelectedTitles'] = sum(t['expectedTestCount'] for t in tests)""")
prepare=prepare.replace('Pins old RC1 whole-F11 basis but imports actual current RC2 tenant law. No source mutation, crossed-law fixture or skipped-test green; whole current C03 installed F11 is a separate pending discriminator.',
    'Historical whole-F11 case is outside this six-case component selection; it requires its own historical basis/tenant and gives no current C03 installed F11 credit. The current whole installed discriminator remains required; no skipped-test green is permitted.')
insertion="""component_stage = copy.deepcopy(stage_law)
component_stage.update(commandId='command://abiogenesis/rc1-qual056/stage-historical-component',
                       args=['.recipe/component-stage.mjs'],timeoutMs=30000,
                       expectedReports=[{'reportIdentity':'report://abiogenesis/rc1-qual056/component-staging',
                                         'relativePath':'verification/reports/component-staging.json'}])
commands.insert(next(i for i,c in enumerate(commands)if c['commandId'].endswith('/generate'))+1,component_stage)
"""
prepare=replace_once(prepare,"config['outcomePredicates'] =",insertion+"config['outcomePredicates'] =")
prepare=prepare.replace('assert len(commands) == 17 and len(config[\'outcomePredicates\']) == 18','assert len(commands) == 18 and len(config[\'outcomePredicates\']) == 19')
prepare=prepare.replace("'stage-current-authorities', 'generate']", "'stage-current-authorities', 'generate', 'stage-historical-component']")
prepare=replace_once(prepare,"'test-environment.mjs', 'staging-fixtures.json', 'verification-recipe.json']", "'test-environment.mjs', 'staging-fixtures.json', 'component-stage.mjs', 'component-stage-plan.json', 'verification-recipe.json']")
prepare=replace_once(prepare,"controls.extend((C / name, ['qualification', 'manifest']) for name in suppliers)","""controls.extend((C / name, ['qualification', 'manifest']) for name in suppliers)
controls.extend([(G / 'final-qualification-inputs-03/freeze.json',['proof']),
                 (G / 'rc1-q04-and-native-scope-controls-01/received-q03-review.md',['proof'])])""")
prepare=prepare.replace("'new authority stage, six carrier/cold cases, six law cases and four current context cases; no command executed'", "'new authority stage and isolated historical-component derivation, six carrier/cold cases, six law cases and four current context cases; prospective observed recipe unexecuted; separate six-case component readiness passed'")
prepare=prepare.replace('finite proposal; actual runtime selection remains pending','finite proposal; actual runtime selection remains pending')
ast.parse(prepare)
put('prepare-data.py',prepare)
exec(compile(prepare,str(Q/'prepare-data.py'),'exec'),{'__name__':'__main__'})

verify=current((PREVIOUS/'verify-data.py').read_text())
verify=verify.replace('3275','3277').replace('len(commands)==17','len(commands)==18').replace("len(config['outcomePredicates'])==18","len(config['outcomePredicates'])==19").replace('range(17)','range(18)').replace("{'commands':17,'predicates':18}","{'commands':18,'predicates':19}").replace('==1262000','==1293000')
verify=verify.replace("'testsExecuted':0","'prospectiveObservedTestsExecuted':0,'isolatedCarrierReadinessExecuted':6")
verify=verify.replace("'mutationsOutsideQ03':0","'mutationsOutsideQ04':0")
verify=replace_once(verify,"(Q/'mechanical-checks.json').write_text", """plan=read(Q/'component-stage-plan.json');readiness=read(Q/'readiness-result.json')
check('isolated component has complete declared current implementation and historical source bindings',len(plan['members'])==835 and plan['counts']=={'current_C03_compiled_implementation':735,'historical_RC1_contract_not_current_qualification_law':4,'historical_RC1_source_projection':95,'unchanged_existing_source_case':1},plan['counts'])
check('one actual existing six-case readiness passed without omission or changed oracles',readiness['status']=='passed' and readiness['processExit']==0 and readiness['selectedCount']==6 and all(c['passed']and not c['skip']and not c['todo']for c in readiness['cases']),{'commandInvocations':1,'actualNativeQualification':False})
stage=next(c for c in commands if c['commandId'].endswith('/stage-historical-component'))
case=next(t for t in selection['tests']if t['commandId'].endswith('/t287-qualification-carrier-resource'))
check('prospective import and owned catalog both resolve within staged historical tenant',names.index('generate')<names.index('stage-historical-component')<names.index('t287-qualification-carrier-resource') and case['files']==['.components/retained-carrier/test_env/tests/t287-qualification-carrier-resource.test.mjs'] and stage['args']==['.recipe/component-stage.mjs'],{'currentRC2TenantUnchanged':True})
check('snapshot consumer includes all isolated component outputs without original-root fallback',\"readOutput('recipe/component-stage-plan.json')\"in consumer and \"readOutput('verification/reports/component-staging.json')\"in consumer and 'componentPlan.destinationRoot,r.destination' in consumer,{'stagedComponentOutputs':len(plan['members']),'currentCandidateOutputs':927})
(Q/'mechanical-checks.json').write_text""")
ast.parse(verify)
put('verify-data.py',verify)
exec(compile(verify,str(Q/'verify-data.py'),'exec'),{'__name__':'__main__'})
print('new Q04 formal input/recipe/inventory populations and mechanical checks derived; no observed recipe command executed')
