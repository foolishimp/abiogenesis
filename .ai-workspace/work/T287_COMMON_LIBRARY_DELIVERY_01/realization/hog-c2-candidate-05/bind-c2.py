from pathlib import Path
import copy,datetime,hashlib,json,shutil
R=Path(__file__).resolve().parent;W=R.parent.parent;REPO=W.parents[2]
P=R.parent/'l4-c2-candidate-05';C=R.parent/'c2-source-prefix-candidate-01';S=C/'stage/build_tenants/abiogenesis/typescript'
D=R.parent/'hog-direct-owner-driver-preparation-02';OLD=R.parent/'hog-final06-binding-01'
ROOT=Path('/private/tmp/abg-stdo3-hog-c2-05-732bf95a0d8e1c64')
def obj(p):return json.loads(p.read_text())
def pin(p,expected=None):
 b=p.read_bytes();v={'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'mode':oct(p.stat().st_mode&0o777)}
 if expected is not None:assert v['sha256']==expected,str(p)
 return v
def put(p,x):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(x,f,indent=2);f.write('\n')
 return pin(p)
def norm(r,path=None):
 v={k:copy.deepcopy(r[k]) for k in ['path','mode','bytes','sha256','target'] if k in r};v['type']=r.get('type',r.get('kind','file'))
 if path is not None:v['path']=path
 assert v['type'] in ['file','symlink'];return v
assert not ROOT.exists()
B=obj(P/'intake/binding-result.json');runtime=Path(B['runtime'])
prerequisites=[]
for lane in ['p1','owner-resolution','p2','p3']:
 result=runtime/lane/('result.json' if lane=='owner-resolution' else 'evidence/result.json')
 value=obj(result);assert value['status']=='satisfied' and value['subjectId']=='candidate'
 assert obj(P/lane/'commands'/f'{lane}.result.json')['exitCode']==0
 assert not (P/lane/'STOP.json').exists();prerequisites.append(pin(result))
pins={'candidateFreeze':pin(C/'freeze.json','96b9ce2062ab04f1a456ba28d3122160e1093d8b6ecdfb88ae1cd8b6f0338ee8'),'driverPreparation':pin(D/'freeze.json','37d70b4745985374dc776a167f0d6bc89a55d004dbedc61fb0837d7e31d007f2'),'source':pin(P/'intake/stage-source-inventory.json'),'emitted':pin(C/'generated-inventory.json'),'dependencies':pin(C/'dependency-inputs.json'),'rawArchiveMembers':pin(C/'archive-members.json','4623ff7a5c388cd43ffb9726bad5824811ae06cfb3b3d9dfc2920babb2a6c850'),'actualP1Physical':pin(P/'p1/physical-resources.json'),'actualP1Freeze':pin(P/'p1/freeze.json'),'actualP2Freeze':pin(P/'p2/freeze.json'),'actualP3Freeze':pin(P/'p3/freeze.json'),'protectedMain':pin(OLD/'protected-main-inventory.json','3f70a97f214843676a214957437599509cea76e5a8c4c173da5cf28277fd4c3d'),'mainClosedProtection':pin(C/'main-generated-protection.json'),'originalConfig':pin(OLD/'configuration.NOT_GRANTED.json','14fb2113791748d14da814abf40322290c1d10d4ea0c7064325675bdcf498883'),'originalGrant':pin(OLD/'effect-grant.NOT_GRANTED.json','ea0b9051ba6e05ba25222b7003984dbd366c1424c5ea439fe2008af05820538e')}
for n,h in [('run.mjs','f55fadc04332f2e2f34bb6e8a3bf9161bb59eadec08711f78316ef55a98898bc'),('oracle.mjs','871bb6ad42dac58effa9deb211e07afd1886ed6b8d8c3291c54dc15b2389162b'),('inspected-inputs.json','5b7daf7af1e7683798e45177edcd0ac0b332cc83072227f123987f8f75baebb8')]:
 pins[n]=pin(D/n,h);shutil.copy2(D/n,R/n);assert pin(R/n)['sha256']==h
prefix='build_tenants/abiogenesis/typescript/'
all_sources=obj(Path(pins['source']['path']))['files'];source=[norm(x,x['path'][len(prefix):]) for x in all_sources if x['path'].startswith(prefix)];context=[x for x in all_sources if not x['path'].startswith(prefix)]
assert len(source)==1214 and len(context)==106
source_map={x['path']:x for x in source};inspected=obj(R/'inspected-inputs.json');pairs=[]
for group in ['support','owners']:
 for row in inspected[group]:
  actual=source_map[row['tenantRelativePath']]
  for k in ['sha256','bytes','mode']:assert actual[k]==row[k],(row['tenantRelativePath'],k)
  pairs.append({'group':group,'relative':row['tenantRelativePath'],'sha256':row['sha256'],'unchanged':True})
assert len(pairs)==21
put(R/'support-binding.json',{'status':'all21_exact_unchanged','pairs':pairs,'basis':pins['driverPreparation'],'historicalSupportDelta':'Previously attributed root-installed-environment setupInstalledRootInvocation change is already present in these exact pins. This driver still calls unchanged setupInstalledRootCatalog.'})
put(R/'source-inventory.json',{'files':source,'sourceCarrier':pins['source'],'outsideTenantContextRows':context,'translation':'Exact tenant prefix removal only; all hashes, sizes, modes conserved.'})
put(R/'emitted-inventory.json',{'files':[norm(x,x['path'][len(prefix):]) for x in obj(C/'generated-inventory.json')['files']],'sourceCarrier':pins['emitted'],'translation':'kind to type and exact tenant prefix removal only.'})
put(R/'dependency-inventory.json',{'files':[norm(x,'node_modules/'+x['path']) for x in obj(C/'dependency-inputs.json')['files']],'sourceCarrier':pins['dependencies'],'translation':'Prefix node_modules; preserve type, hashes, sizes, modes, internal symlink targets.'})
support_set={x['path'] for x in obj(P/'intake/selected-support.json')['files']}|{x['tenantRelativePath'] for x in inspected['support']}
assert len(support_set)==17
put(R/'support-inventory.json',{'files':[source_map[x] for x in sorted(support_set)],'sourceCarrier':pins['source'],'selected':'Same 17 selected P1 plus structural fixture/helper members.'})
shutil.copy2(OLD/'protected-main-inventory.json',R/'protected-main-inventory.json');assert pin(R/'protected-main-inventory.json')['sha256']==pins['protectedMain']['sha256']
shutil.copy2(C/'archive-members.json',R/'raw-tar-inventory.json')
raw=obj(R/'raw-tar-inventory.json');assert len(raw['files'])==5271
bins=obj(S/'package.json')['bin'];targets=sorted(set(x.removeprefix('./') for x in bins.values()));assert targets==['build/code/src/public/cli.js','build/code/src/public/codex_cli.js']
physical=obj(P/'p1/physical-resources.json')['files'];physical_map={x['path']:x for x in physical};host=runtime/'p1/host/node_modules/@abiogenesis/typescript-tenant'
expected=[];changes=[]
for row in raw['files']:
 x=norm(row);observed=physical_map[str(host/row['path'])]
 assert observed['sha256']==row['sha256'] and observed['bytes']==row['bytes']
 if row['path'] in targets:
  assert row['mode']=='0o644' and observed['mode']=='0o755';x['mode']='0o755';changes.append({'path':row['path'],'rawMode':row['mode'],'installedMode':x['mode'],'actual':observed})
 else:assert observed['mode']==row['mode']
 expected.append(x)
assert len(changes)==2
put(R/'installed-expected-inventory.json',{'files':expected,'rawTar':pins['rawArchiveMembers'],'declaredBins':bins,'modeChanges':changes,'actualP1Physical':pins['actualP1Physical'],'relation':'All 5271 names, bytes, digests and other modes exact; only two package.json-declared bins gain execute bits in actual new P1 npm installation.'})
put(R/'installed-mode-relation.json',{'status':'bound_to_actual_new_P1','rawTar':pin(R/'raw-tar-inventory.json'),'installedExpected':pin(R/'installed-expected-inventory.json'),'changes':changes,'runtimeChanges':0})
cache=runtime/'caches/p1';seed=[]
for row in physical:
 p=Path(row['path'])
 if row['type']!='file' or not p.is_relative_to(cache):continue
 relative=str(p.relative_to(cache))
 if not relative.startswith(('_cacache/content-v2/','_cacache/index-v5/')):continue
 actual=pin(p,row['sha256']);assert actual['bytes']==row['bytes'] and actual['mode']==row['mode'];seed.append(norm(row,relative))
assert seed and any(x['path'].startswith('_cacache/content-v2/') for x in seed) and any(x['path'].startswith('_cacache/index-v5/') for x in seed)
put(R/'npm-cache-seed-inventory.json',{'files':seed,'sourceRoot':str(cache),'actualP1Physical':pins['actualP1Physical'],'selection':'Finite actual new P1 content/index files only; no ambient cache, log or temp seed.'})
subject=B['subject'];content=obj(S/'product-toolchain-manifest.json')['productContentDigest']
put(R/'candidate-record.json',{'status':'ready_for_separately_granted_L4','subjectId':'candidate','archive':subject['archive'],'manifest':subject['manifest'],'productContentDigest':content,'archiveMembers':5271,'sourceFreeze':pins['candidateFreeze'],'actualPrerequisites':prerequisites,'adapterMeaning':'Driver readiness carrier for this exact closed C2 candidate and actual new P1/P2/P3; no relabelled prior HoG outcome or L5 acceptance.'})
config=obj(OLD/'configuration.NOT_GRANTED.json');config['status']='activated';config['activationFile']=str(R/'execution/effect-grant.json')
config['subject'].update(stageTenant=str(S),freeze=pins['candidateFreeze'],candidateRecord=pin(R/'candidate-record.json'),archive=subject['archive'],manifest=subject['manifest'],productContentDigest=content,packageInventory=pin(R/'installed-expected-inventory.json'))
config['subject']['inventories']=[dict(role=role,**pin(R/n),root=str(S)) for role,n in [('source','source-inventory.json'),('emitted','emitted-inventory.json'),('dependencies','dependency-inventory.json'),('support','support-inventory.json')]]
config['protectedMain']=dict(**pin(R/'protected-main-inventory.json'),root=str(REPO));config['npmCacheSeed']=dict(**pin(R/'npm-cache-seed-inventory.json'),root=str(cache));config['prerequisites']=prerequisites
oldroot=config['resources']['parent']
def rebase(v):
 if isinstance(v,str):return v.replace(oldroot,str(ROOT))
 if isinstance(v,list):return [rebase(x) for x in v]
 if isinstance(v,dict):return {k:rebase(x) for k,x in v.items()}
 return v
config['resources']=rebase(config['resources'])
for kind in ['user','global']:
 p=R/(kind+'.npmrc')
 with p.open('x'):pass
 config['environment']['npm_config_'+kind+'config']=str(p)
e=R/'execution';e.mkdir(exist_ok=False);configuration=put(e/'configuration.json',config)
grant=obj(OLD/'effect-grant.NOT_GRANTED.json');grant.update(status='granted',configurationSha256=configuration['sha256'],runnerSha256=pin(R/'run.mjs')['sha256'],oracleSha256=pin(R/'oracle.mjs')['sha256'],inspectedInputsSha256=pin(R/'inspected-inputs.json')['sha256'],resources=config['resources'],npmCacheSeed=config['npmCacheSeed'],preparationActivation='HOG-DIRECT-OWNER-DRIVER-02',preparationOnly=False,rootActivation='L4-C2-CANDIDATE-INTEGRATION-05')
put(e/'effect-grant.json',grant)
put(R/'activation.json',{'activation':'L4-C2-CANDIDATE-INTEGRATION-05','selectedLane':'three repaired ordinary HoG cases','issuedBy':'/root','writer':'/root/stdo3_final_proof_writer','frame':'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration','candidate':pins['candidateFreeze'],'prerequisites':prerequisites,'effects':'Exact new parent, finite P1 cache seed copies, three bootstrap installs and original fixture packs/installs/Public starts/reads; retain all outputs/roots. No optional cases or native/provider calls.','stop':'First actual failure stops all later cases; no repair or retry.','maxRetainedBytes':4294967296,'rootAbsentBeforeActivation':not ROOT.exists()})
put(R/'binding-inputs.json',pins)
(R/'HOW.md').write_text('# Repaired ordinary HoG integration on the C2 candidate\n\nUse the frozen driver preparation 02 sequence and original oracle unchanged. Direct starts omit caller-selected startRef, then assert owner next/default resolves the authored fixture start. Read logical events through the installed ABG owner, slice after the exact setup logical boundary, and separately conserve raw setup bytes.\n\nAll 21 inspected source pins are unchanged. Source/emitted/dependency/support/main carriers reuse closed metadata through explicit path/type translation. The original driver performs the actual complete preflight once. Actual new P1 installation supplies all 5271 member identities and the only two bin-mode normalizations; raw tar remains distinct. Its finite nonempty npm content/index cache seeds each fresh cache. Distinct empty task npmrc files and the explicit offline environment exclude ambient config/cache/network fallback.\n\nThe Executive grant selects compose-retry, workflow-foldback and fanout-partial once sequentially after actual new P1, owner-resolution, P2 and P3 success. The existing 1800000 ms process-group supervisor stops on failure/timeout. Keep cleanup hooks without invocation, all physical roots, exact returned prefixes, actual owner projections and raw receipts. No optional law tests, Product changes, main936 effects, continuation17 access, Git, native/provider calls, P4 or L5.\n')
supervisor=Path(B['supervisor']['path']);shutil.copyfile(supervisor,e/'run-command.py');assert pin(e/'run-command.py')['sha256']==B['supervisor']['sha256']
put(e/'command-environment.json',config['environment']);argv=['/usr/bin/time','-l',config['toolchains']['node']['path'],str(R/'run.mjs'),str(e/'configuration.json')]
put(e/'commands-config.json',{'hog':{'argv':argv,'cwd':str(e)}});(e/'commands').mkdir();(e/'command-freezes').mkdir()
files=[pin(p) for p in sorted(R.rglob('*')) if p.is_file()]
freeze=put(R/'binding-freeze.json',{'status':'frozen_before_HoG_effects','files':files,'runtimeRoot':str(ROOT),'runtimeRootAbsent':not ROOT.exists(),'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()})
put(e/'command-freezes/hog.json',{'bindingFreeze':freeze,'configuration':configuration,'grant':pin(e/'effect-grant.json'),'runner':pin(R/'run.mjs'),'oracle':pin(R/'oracle.mjs'),'supervisor':pin(e/'run-command.py'),'outerCeilingMs':1800000,'outerNODE_OPTIONS':'cleared; explicit runtime environment omits it'})
print(json.dumps({'status':'bound_frozen_granted','freeze':freeze,'configuration':configuration,'runtimeRoot':str(ROOT),'seedFiles':len(seed),'seedBytes':sum(x['bytes'] for x in seed),'unchangedSourcePins':len(pairs),'argv':argv}))
