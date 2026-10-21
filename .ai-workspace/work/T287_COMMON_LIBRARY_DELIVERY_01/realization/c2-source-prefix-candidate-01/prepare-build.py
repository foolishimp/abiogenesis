from pathlib import Path
import hashlib,json,shutil,difflib,os,stat,traceback
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-successor-06';H=W.parent/'c2-source-prefix-repair-01';T=Path('build_tenants/abiogenesis/typescript')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def pin(p):return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def row(p,rel):return {'path':str(rel),'mode':oct(stat.S_IMODE(p.stat().st_mode)),'kind':'file','bytes':p.stat().st_size,'sha256':sha(p)}
try:
 assert not (W/'STOP.json').exists() and json.loads((W/'copy-result.json').read_text())['exitCode']==0
 grant=json.loads((W/'build-activation.json').read_text());assert sha(H/'freeze.json')==grant['sourceWriterFreeze']['sha256']
 outputs=grant['sourceOutputs'];assert len(outputs)==2
 expected={str(T/'code/src/abg/execution_basis.ts'):'1b3dbf39b6713f575a3456975de76747e06cdcab289c77ba5fee4a05d6b75389',str(T/'design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md'):'dfb98d80113aaf150e05a09577d4cc3898b339e33426790f878ed02c90b89d5c'}
 (W/'preimages').mkdir();changes=[]
 for x in outputs:
  src=Path(x['path']);rel=src.relative_to(R);dest=W/'stage'/rel;frozen=H/'outputs'/src.name
  assert sha(src)==sha(frozen)==x['sha256']==expected[str(rel)]
  before=row(dest,rel);assert sha(O/'stage'/rel)==before['sha256']
  shutil.copy2(dest,W/'preimages'/src.name);shutil.copy2(src,dest)
  assert sha(src)==sha(frozen)==sha(dest)==x['sha256'];assert not os.path.samefile(src,dest)
  after=row(dest,rel);changes.append({'before':before,'after':after,'frozenSource':pin(frozen),'mainSource':pin(src)})
  (W/(src.name+'.diff')).write_text(''.join(difflib.unified_diff((W/'preimages'/src.name).read_text().splitlines(True),dest.read_text().splitlines(True),fromfile='closed06/'+str(rel),tofile='C2-selected/'+str(rel),n=3)))
 previous=json.loads((W/'prepared-source-inputs.json').read_text())['files'];source=[]
 for x in previous:
  p=W/'stage'/x['path'];current=row(p,x['path']);assert current==x or x['path'] in expected,x['path'];source.append(current)
 wr('source-inputs.json',{'root':str(W/'stage'),'donor':pin(O/'source-inputs.json'),'closedDonorBytes':pin(O/'stage-post-generation-inventory.json'),'files':source,'selectedDelta':changes,'sourceWriterFreeze':pin(H/'freeze.json'),'noOtherSourceDelta':True})
 for name in ['common.py','run-command.py','verify-archive.py','verify-payload.mjs']:shutil.copy2(O/name,W/name)
 s=(O/'verify-generation.py').read_text().replace("old=WORK.parent/'c0-potential-effect-successor-03'", "old=WORK.parent/'c0-potential-effect-successor-06'")
 s=s.replace("allowed_code={str(TENANT/'build/code/src/abg/c_call_outcome')+ext for ext in ['.js','.d.ts','.js.map']}","allowed_code={str(TENANT/'build/code/src/abg/execution_basis.js')}")
 s=s.replace(",'contracts/worksite/command-execution-context.inventory.json'",'')
 (W/'verify-generation.py').write_text(s)
 s=(O/'verify-metadata.mjs').read_text().replace('../c0-potential-effect-successor-03/stage/','../c0-potential-effect-successor-06/stage/')
 s=s.replace("const ownedDeclarations = new Set(['build/code/src/abg/c_call_outcome.d.ts']);","const ownedDeclarations = new Set();")
 s=s.replace("assert.equal(oldCatalog.rows.length, newCatalog.rows.length);","assert.equal(oldCatalog.rows.length, 75);\nassert.deepEqual(oldCatalog, newCatalog, 'all 75 catalog contracts unchanged');\nassert.equal(oldCatalog.rows.length, newCatalog.rows.length);")
 (W/'verify-metadata.mjs').write_text(s)
 for name in ['verify-generation.py','verify-metadata.mjs']:
  (W/(name+'.diff')).write_text(''.join(difflib.unified_diff((O/name).read_text().splitlines(True),(W/name).read_text().splitlines(True),fromfile='closed06-tooling/'+name,tofile='C2-bound-tooling/'+name,n=3)))
 oldConfigs=json.loads((O/'commands-config.json').read_text());order=['tsc','generate','material','generation-correspondence','pack','archive-check','payload']
 configs={k:json.loads(json.dumps(oldConfigs[k]).replace(str(O),str(W))) for k in order};wr('commands-config.json',configs)
 env={k:v.replace(str(O),str(W)) for k,v in json.loads((O/'command-environment.json').read_text()).items()};wr('command-environment.json',env)
 for name in ['commands','tmp','npm-cache','npm-logs','artifacts']:(W/name).mkdir()
 producer=json.loads((O/'producer-input-predecessor-pins.json').read_text());configsObserved=[]
 for x in producer['configs']:
  p=Path(x['path'])
  if '/stage/' in str(p):p=W/'stage'/T/'.npmrc'
  assert p.exists()==x['exists'],str(p)
  if p.exists():assert sha(p)==x['sha256'],str(p)
  configsObserved.append({'path':str(p),'exists':p.exists(),**({'sha256':sha(p),'bytes':p.stat().st_size} if p.exists() else {})})
 wr('effective-producer-binding.json',{'previousProducerPins':pin(O/'producer-input-predecessor-pins.json'),'tools':json.loads((W/'tool-pins.json').read_text()),'configs':configsObserved,'environment':pin(W/'command-environment.json'),'directoryMetadata':pin(W/'dependency-directory-metadata.json'),'configurationCredentialContentsRead':False,'npmExecutableCanonical':str(Path('/opt/homebrew/bin/npm').resolve())})
 files=['activation.json','build-activation.json','preparation-freeze.json','PREPARATION.md','prepare-build.py','source-inputs.json','dependency-inputs.json','dependency-directory-metadata.json','stage-prepared-inventory.json','main-generated-protection.json','tool-pins.json','effective-producer-binding.json','commands-config.json','command-environment.json','common.py','run-command.py','verify-generation.py','verify-metadata.mjs','verify-archive.py','verify-payload.mjs']
 wr('prebuild-freeze.json',{'activation':'C2-CANDIDATE-BUILD-01','sourceWriterFreeze':pin(H/'freeze.json'),'files':[pin(W/n) for n in files],'selectedSources':[pin(W/'stage'/rel) for rel in expected],'tools':json.loads((W/'tool-pins.json').read_text())['tools'],'order':order,'expectedEmittedDelta':'execution_basis.js only; all declarations and public exports exact','derivedMetadata':'Existing Product manifest/capability graph producers, exact locator population, 75 unchanged catalog contract rows','main936Protected':True,'runtimeOrInstalledWorkload':False,'perCommandBoundMs':600000,'additionalByteLimit':2147483648})
 print(json.dumps({'prebuildFreezeSha256':sha(W/'prebuild-freeze.json'),'sourceRows':len(source),'sourceDelta':len(changes),'order':order}))
except BaseException:
 if not (W/'STOP.json').exists():wr('STOP.json',{'kind':'exact source build preflight failure','traceback':traceback.format_exc(),'disposition':'Stopped before repair/retry'})
 raise
