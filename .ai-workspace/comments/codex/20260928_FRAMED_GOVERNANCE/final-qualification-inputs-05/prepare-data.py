"""Q05-only pure projections and external caller preparation; no Product execution."""
from pathlib import Path
import copy, hashlib, json, stat

R=Path('/Users/jim/src/apps/abiogenesis')
G=R/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
Q=G/'final-qualification-inputs-05'
OLD=G/'final-qualification-inputs-04'
C=G/'final-candidate-construction-04'
C3=G/'final-candidate-construction-03'
CALL=G/'qualification-command-preparation-01'
F=G/'f11-carrier-installed-input-preparation-01'
TR='build_tenants/abiogenesis/typescript/'
S=C/'final-source'; T=C/'final-stage'/TR
SELECT='selection://abiogenesis/rc1/final-qualification-inputs-05/source-and-material'
assert not (Q/'freeze.json').exists()
def read(p): return json.loads(Path(p).read_bytes())
def sha(b): return hashlib.sha256(b).hexdigest()
def canonical(v): return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def digest(v): return 'sha256:'+sha(canonical(v))
def pin(p):
 p=Path(p)
 with p.open('rb')as f: h=hashlib.file_digest(f,'sha256').hexdigest()
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':h,'mode':stat.S_IMODE(p.stat().st_mode)}
def put(n,v):
 p=Q/n;assert p.is_relative_to(Q),str(p)
 body=json.dumps(v,indent=2,ensure_ascii=False)+'\n'
 if p.exists():assert p.read_text()==body,str(p);return
 p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(body)
def text(n,s):
 p=Q/n;assert p.is_relative_to(Q),str(p)
 if p.exists():assert p.read_text()==s,str(p);return
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
def row(p,target,classification,ref,**extra):
 v=pin(p);v.pop('path')
 return {**v,'origin':str(p),'target':target,'classification':classification,'memberRef':ref,**extra}
def exact_copy(origin,name):
 p=Q/name
 if p.exists():assert p.read_bytes()==Path(origin).read_bytes(),str(p);return
 p.parent.mkdir(parents=True,exist_ok=True)
 p.write_bytes(Path(origin).read_bytes());assert pin(p)['sha256']==pin(origin)['sha256']
def replace(s,old,new):
 assert s.count(old)==1,(old,s.count(old));return s.replace(old,new)

for n in ['compare-generated.mjs','test-environment.mjs','recipe-stage.mjs','component-stage.mjs','staging-fixtures.json']:
 exact_copy(OLD/n,n)
exact_copy(CALL/'command-environment.mjs','command-environment.mjs')
exact_copy(G/'rc1-c03-conformance-caller-repair-01/conformance-resources.mjs','f11/conformance-resources.mjs')
for n in ['public-support.mjs','setup-driver.mjs','controlled-helper.mjs','prepare-resources.mjs','child-wrapper-parts.mjs','proof-oracles.mjs','observe-process.py']:
 exact_copy(F/n,'f11/'+n)
for n in ['accounting-plan.json','companion-negatives.json','input-construction-plan.md','operation-plan.json','pending-bindings.json']:
 exact_copy(F/n,'historical-f11-donor/'+n)
exact_copy(OLD/'readiness-result.json','historical-q04/readiness-result.json')
exact_copy(OLD/'readiness-copy.json','historical-q04/readiness-copy.json')
exact_copy(OLD/'readiness-command.json','historical-q04/readiness-command.json')

source=read(C/'final-source-members.json');generated=read(C/'final-generated-after.json')
src={v['path']:v for v in source};gen={v['path']:v for v in generated}
effective=[];donors=[]
for v in source:
 p=v['path'];original=S/p;before=pin(original)
 assert (before['bytes'],before['sha256'])==(v['bytes'],v['sha256'])
 emitted=gen.get(p[len(TR):])if p.startswith(TR)else None
 derived=emitted is not None and emitted['role']=='derived_authority_copy'
 origin=T/emitted['path']if derived else original;a=pin(origin)
 effective.append({'path':p,'bytes':a['bytes'],'sha256':a['sha256'],'mode':a['mode'],'origin':str(origin),
  'role':'current_derived_authority'if derived else 'selected_source','sourceAuthor':v['sourceAuthor'],
  'copyBuildAuthor':v['copyBuildAuthor'],'selectedSourcePreimage':before if derived else None})
 if derived:
  donors.append({'path':p,**{k:before[k]for k in ['bytes','sha256','mode']},'origin':str(original),
   'memberRef':'construction-input://abiogenesis/c04/'+p,'role':'conserved_construction_authority_preimage',
   'sourceAuthor':v['sourceAuthor'],'copyBuildAuthor':v['copyBuildAuthor'],'currentDerived':a,'changed':before['sha256']!=a['sha256']})
for v in generated:
 if v['role']!='generated_output':continue
 a=pin(T/v['path']);assert (a['bytes'],a['sha256'])==(v['bytes'],v['sha256'])
 effective.append({'path':TR+v['path'],'bytes':a['bytes'],'sha256':a['sha256'],'mode':a['mode'],'origin':a['path'],
  'role':'emitted_generated_output','sourceAuthor':'derived; no semantic source authorship assigned','copyBuildAuthor':read(C/'final-attribution.json')['builderReportActor']})
effective.sort(key=lambda v:v['path']);assert len({v['path']for v in effective})==len(effective)==1936
assert len(source)==1106 and len(generated)==926 and len(donors)==96 and sum(v['changed']for v in donors)==12
put('source-inventory.json',effective);put('donor-authority-preimages.json',donors)
law=read(T/'contracts/qualification/law-basis.json');catalog=read(T/'contracts/qualification/rule-catalog.json')
coverage=read(T/'contracts/qualification/coverage.json');product=read(T/'product-toolchain-manifest.json')
core=read(C/'final-selected-core.json');acceptance=G/'rc1-c04-acceptance-and-installed-setup-controls-01/acceptance.json'

source_files=[]
for v in source:
 p=v['path']
 if not p.startswith(TR)or p.startswith(TR+'design/')or p==TR+'.gitignore':continue
 ref=('construction-input://abiogenesis/c04/'if p[len(TR):]in gen and gen[p[len(TR):]]['role']=='derived_authority_copy'else 'repo://abiogenesis/')+p
 source_files.append(row(S/p,'subject/'+p[len(TR):],'selected_build_or_proof_source',ref,path=p[len(TR):],
  role='selected_source',sourceAuthor=v['sourceAuthor'],copyBuildAuthor=v['copyBuildAuthor']))
for v in read(C/'final-schema-seeds.json'):
 p=str(Path(v['path']).relative_to(Path('final-stage')/TR));seed=Path(v['origin'])
 assert pin(seed)['sha256']==v['sha256']
 source_files.append(row(seed,'subject/'+p,'declared_schema_seed','repo://abiogenesis/'+TR+p,path=p,role='schema_seed',
  sourceAuthor='inherited exact schema seed',copyBuildAuthor=read(C/'final-attribution.json')['builderReportActor']))
source_files.sort(key=lambda v:v['path']);assert len(source_files)==693
authority=[]
for v in read(C/'final-authority-joins.json'):
 if not v['ref'].startswith('repo://abiogenesis/'):continue
 p=v['ref'][len('repo://abiogenesis/'):]
 authority.append(row(S/p,'authority-source/'+p,'current_authority_source',v['ref'],path=p,stageDestination=v['path'],
  sourceAuthor=src[p]['sourceAuthor'],copyBuildAuthor=src[p]['copyBuildAuthor']))
law_rows=[]
for v in read(C/'final-law-verification.json')['members']:
 p=str(Path(v['path']).relative_to('final-law'));a=row(C/v['path'],'law-source/currentRC2/'+p,'immutable_current_RC2_law','stdo://releases/v2.5.1-rc.2/'+p,path=p)
 assert (a['sha256'],a['bytes'])==(v['sha256'],v['bytes'])
 assert pin(Path(v['origin']))['sha256']==a['sha256'];law_rows.append(a)
assert len(authority)==87 and len(law_rows)==53
previous=read(OLD/'input-manifest.json')
tools=copy.deepcopy(previous['toolFiles']);dependencies=copy.deepcopy(previous['dependencies'])
fixtures=copy.deepcopy(previous['fixtureFiles'])
for v in fixtures:v['memberRef']=v['memberRef'].replace('/q04/','/q05/')
historical_path='build/code/src/product/declaration_exports.js'
historical=C3/'final-stage'/TR/historical_path
fixtures.append(row(historical,'fixture-inputs/retainedC03compiled/'+historical_path,'retained_C03_component_compiled_delta',
 'fixture-input://abiogenesis/q05/retainedC03compiled/'+historical_path,path=historical_path,fixtureClass='historical_component_only',
 sourceAuthor='exact C03 source attribution retained',historicalOrigin=str(historical),copyBuildAuthor='inherited C03 component preimage'))
for v in tools+dependencies+fixtures:
 a=pin(Path(v['origin']));assert (a['bytes'],a['sha256'],a['mode'])==(v['bytes'],v['sha256'],v['mode'])
put('fixture-inventory.json',{'members':fixtures,'meaning':'103 exact historical fixture preimages; no current execution credit'})
manifest=copy.deepcopy(previous)
manifest.update(candidate={'freeze':pin(C/'final-freeze.json'),'sourceFreeze':pin(C/'final-source-freeze-manifest.json'),
 'contentDigest':core['basis']['productContentDigest'],'productManifestDigest':core['basis']['manifestDigest'],'acceptance':pin(acceptance)},
 sourceFiles=source_files,sourceBytes=sum(v['bytes']for v in source_files),authoritySources=authority,lawMembers=law_rows,
 toolFiles=tools,fixtureFiles=fixtures,dependencies=dependencies)
manifest['inputOutputSeparation'].update(currentDerivedLaw=str(T/'contracts/qualification/law-basis.json'))
put('input-manifest.json',manifest)
for n in ['npm-toolchain-inventory.json','toolchain-links.json'] : exact_copy(OLD/n,n)
toolchain=read(OLD/'toolchain.json');toolchain['PATH']='absolute immutable C03 frozen Node origin, outside original/protected workspace roots, followed by exact system directories'
put('toolchain.json',toolchain)
expected=[]
for p in sorted(T.rglob('*')):
 if p.is_file()and(str(p.relative_to(T)).startswith(('build/','contracts/'))or p.name=='product-toolchain-manifest.json'):
  a=pin(p);expected.append({'path':str(p.relative_to(T)),'bytes':a['bytes'],'sha256':a['sha256']})
assert len(expected)==927
put('expected-output-inventory.json',{'basisInventorySha256':sha(canonical(expected)),'paths':expected,
 'roles':{'emittedOrGenerated':830,'derivedAuthorityCopies':96,'unchangedRC1DefaultLibraryStandard':1},
 'basis':'exact accepted C04 final-stage; 926 generated entries plus separately conserved unchanged default-library standard'})
component=read(OLD/'component-stage-plan.json')
changed=[]
for v in component['members']:
 if v['source']==historical_path:
  assert pin(historical)['sha256']==v['sha256']and pin(historical)['bytes']==v['bytes']
  v['source']='.fixtures/retainedC03compiled/'+historical_path;changed.append(v['destination'])
 elif v['role']=='current_C03_compiled_implementation':
  a=pin(T/v['source']);assert (a['sha256'],a['bytes'])==(v['sha256'],v['bytes']),v['source']
assert changed==[historical_path] and len(component['members'])==835
component['currentCatalogSHA256']=pin(T/'contracts/qualification/rule-catalog.json')['sha256']
component['additionalFixtureInputAssets']=1
component['distinction']='All835 exact Q04 historical component bodies retained. One changed compiled file reads an explicit C03 fixture preimage. Q04 six-case run is historical, not a C04 execution.'
put('component-stage-plan.json',component)
for n in ['test-selection.json','lint-population.json','release-claims.json']:
 v=read(OLD/n)
 if n=='test-selection.json':
  for t in v['tests']:
   if t['commandId'].endswith('/t287-qualification-carrier-resource'):
    t['meaning']='unchanged historical Q04 six-case component oracles; exact835 old bodies reproduced, no C04 six-case execution claimed'
    t['componentStagePlan']=pin(Q/'component-stage-plan.json')
 put(n,v)
raw=read(OLD/'config.json');raw['sourceSelection']={'kind':'pending_actual_observed_source_set','preparation':'Q05 exact C04; actual A/W/producer source observation remains unknown'}
raw['claim']='unexecuted18-command current C04 proposal; complete mechanical caller constructability alone is checked'
put('raw-config.json',raw)
config=copy.deepcopy(raw)
for command in config['commands']:
 for entry in command['environment']:
  if entry['name']=='PATH':
   assert entry['value']in ['toolchain/bin:/usr/bin:/bin:/usr/sbin:/sbin','.toolchain/bin:/usr/bin:/bin:/usr/sbin:/sbin']
   entry['value']=str(C3/'source-freeze/toolchain/bin')+':/usr/bin:/bin:/usr/sbin:/sbin'
put('config.json',config)
assert len(config['commands'])==18 and len(config['outcomePredicates'])==19
reader=(OLD/'output-checks.mjs').read_text();text('output-checks.mjs',reader)
caller=(OLD/'recipe.mjs').read_text().replace('Q03 preparation','Q05 preparation')
caller=replace(caller,"const directory=dirname(fileURLToPath(import.meta.url));","import {materializeCommandEnvironment,constructPreparedObservedTask} from './command-environment.mjs';\nconst directory=dirname(fileURLToPath(import.meta.url));")
caller=replace(caller,"classification:'declared_recipe'","classification:'declared_recipe',memberRef:'recipe-input://abiogenesis/q05/'+name")
start=caller.index('export async function constructObservedProducerTask')
caller=caller[:start]+'''export async function constructObservedProducerTask({product,workspaceAuthorityBasis,workspaceBinding,capabilityGrant}){
 const files=await selectedFiles(),pin=files.find(row=>row.target==='toolchain/bin/node');
 const sourceConfig=await read('raw-config.json'),declared=await read('config.json');
 const preparation=await materializeCommandEnvironment({product,sourceConfig,pin,workspaceAuthorityBasis,workspaceBinding});
 if(product.sha256Canonical(preparation.configuration)!==product.sha256Canonical(declared))throw Error('actual environment/configuration differs from Q05');
 const constructed=await constructPreparedObservedTask({product,preparation,pin,workspaceAuthorityBasis,workspaceBinding,capabilityGrant,selectedFiles:files});
 const recipe=await read('verification-recipe.json');
 for(const key of ['commandConfigurationDigest','predicateConfigurationDigest','writeTerritoriesDigest'])if(constructed.digests[key]!==recipe[key])throw Error('actual task/recipe digest differs: '+key);
 return constructed.task;
}
'''
text('recipe.mjs',caller)

# F11 external adapters are authored separately below before inventory closure.
text('preparation-stage-marker.txt','Projection complete; finish caller/F11 adapters before qualification inventory closure.\n')
print(json.dumps({'projectedSource':len(effective),'generated':len(generated),'expectedOutputs':len(expected),
 'fixtures':len(fixtures),'historicalComponent':len(component['members']),'catalogSHA256':component['currentCatalogSHA256']}))
