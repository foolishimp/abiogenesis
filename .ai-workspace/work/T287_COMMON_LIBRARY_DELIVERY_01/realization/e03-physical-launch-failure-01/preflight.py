from pathlib import Path
import json, hashlib, os, re, sys, traceback
ROOT=Path('/Users/jim/src/apps/abiogenesis')
W=ROOT/'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01'
D=Path(__file__).resolve().parent
R=W/'realization/lifetime-stream-repair-01'
S=R/'stage'
TENANT=Path('build_tenants/abiogenesis/typescript')
def load(p):return json.loads(p.read_text())
def row(p):
 data=p.read_bytes();return {'path':str(p),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
def check(p,expected):
 actual=row(p);assert actual['sha256']==expected['sha256'],(str(p),expected,actual)
 if 'bytes' in expected:assert actual['bytes']==expected['bytes']
 return actual
def inventory(base,rows):
 for r in rows:
  p=base/r['path'];target=r.get('link',r.get('target'))
  if target is not None:assert p.is_symlink() and os.readlink(p)==target,str(p)
  else:check(p,r)
 return len(rows)
try:
 config=load(D/'config.json')
 for key in ['scratchRoot','evidenceRoot']:
  p=Path(config[key]);assert not p.exists() and not p.is_symlink(),str(p)
  assert p.parent.resolve()==Path('/private/tmp'),str(p)
 anchors=[check(R/'freeze.json',{'sha256':'8668dfa9ddbfb2fcfa860659e383e0527b009afb532e385e876384eba5b1b155'}),
  check(R/'report.md',{'sha256':'a97f98136375a20f0d3c1bcc34a3e23d30ed96d539c09d09ea669943a71e2307'}),
  check(W/'L2-execution-contract.md',{'sha256':'65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'})]
 counts={'closedRecords':inventory(R,load(R/'freeze.json')['files']),
  'frozenOutputCopies':inventory(R/'subject-final',load(R/'freeze.json')['ownedOutputs']),
  'stage':inventory(S,load(R/'stage-post-generation-inventory.json')),
  'dependencies':inventory(S/TENANT/'node_modules',load(R/'dependencies.json')['files']),
  'emitted':inventory(S/TENANT/'build',load(R/'emitted-inventory.json')),
  'protectedMain':inventory(ROOT,load(R/'protected-main-before.json')['files'])}
 main=ROOT/TENANT
 main_paths={str(p.relative_to(ROOT)) for folder in [main/'build',main/'contracts'] for p in folder.rglob('*') if p.is_file()}
 main_paths.add(str((main/'product-toolchain-manifest.json').relative_to(ROOT)))
 assert main_paths=={r['path'] for r in load(R/'protected-main-before.json')['files']},'protected main member set'
 node=check(Path(config['nodeExecutable']),{'sha256':config['nodeSha256']})
 definition=load(ROOT/'stdo_abiogenesis.json')
 assert definition['composition']==[]
 assert definition['constitution']['stdo']['basis']['manifest_sha256']=='069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232'
 source_rows=[]
 for stem in ['abg/worker_transport','abg/transport_contracts','implementation/worksite_command_helper','shared/owned_process_lifetime']:
  source_rows.append({'owner':stem,'source':row(S/TENANT/'code/src'/f'{stem}.ts'),'emitted':row(S/TENANT/'build/code/src'/f'{stem}.js')})
 helper=S/TENANT/'build/code/src/implementation/worksite_command_helper.js'
 source=helper.read_text();source=re.sub(r'^#!.*\n','',source)
 assert len(re.findall(r'await main\(\);\s*$',source))==1
 exposed=re.sub(r'await main\(\);\s*$','export { runCommand };\n',source)
 (D/'exposed-helper.js.txt').write_text(exposed)
 support=[row(R/'diagnostic-host.mjs'),row(R/'run-F2-discriminator.py'),row(S/TENANT/'test_env/tests/t287-owned-process-lifetime.test.mjs')]
 authority=[row(ROOT/p) for p in ['AGENTS.md','stdo_abiogenesis.json','specification/PRODUCT.md','specification/GOALS.md',
  'specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md','build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md']]
 result={'activation':config['activation'],'status':'ready_for_definition_only_preparation','anchors':anchors,'counts':counts,
  'node':node,'frozenTenant':str(S/TENANT),'sourceCorrespondence':source_rows,'support':support,'authorityReadBasis':authority,
  'rootsInitiallyAbsent':{k:config[k] for k in ['scratchRoot','evidenceRoot','absentExecutable']},
  'helperExposure':{'original':row(helper),'exposed':row(D/'exposed-helper.js.txt'),'transformation':'remove shebang; replace only final await main() with runCommand export; unchanged owner bodies/imports'},
  'inputs':[row(D/p) for p in ['HOW.md','config.json','preflight.py','prepare.mjs','host.mjs','run.py']]}
 (D/'preflight.json').write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps({'status':result['status'],'counts':counts,'helperExposure':result['helperExposure']}))
except BaseException as error:
 failure={'phase':'preflight','type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc()}
 (D/'first-failure.json').write_text(json.dumps(failure,indent=2)+'\n');print(json.dumps(failure));sys.exit(1)
