from pathlib import Path
import json,hashlib,re,os,subprocess,ast,shlex,difflib
O=Path(__file__).parent;N=O.parent;P=N.parent;F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T='build_tenants/abiogenesis/typescript';Q=Path('/private/tmp/abg-rc11-effect-phase2-a-r2-proof-20261110-01');Q1=Path('/private/tmp/abg-rc11-effect-phase1-proof-20261110-01');C=P.parent/'rc11-effect-phase1-01/proof-01';S=F/'qualification-scratch/rc11-effect-phase2-01/native-04/tenant'
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=sha(b))
def check(x):assert pin(x['path'])==x,x['path']
def write(p,v):
 with p.open('xb') as h:h.write(v if isinstance(v,bytes) else (json.dumps(v,indent=2)+'\n').encode())
freeze=json.loads((N/'source-freeze.json').read_text());assert freeze['sourceDigest']=='cbc3e5270839a31535a75e3c59483c1109c465e27b4fd89eeb91da6631f638a4';frozen=Path(freeze['frozenRoot']);assert not Q.exists()
bnative=json.loads((N/'BINDING.json').read_text());g=json.loads((N/'PRESERVATION_GUARDS.json').read_text());ext=json.loads((F/'qualification-inputs/rc11-effect-phase2-01/native-04/EXTERNAL_TOOLS.json').read_text());node=ext['node']
prior=json.loads((P/'native-03/immediate-probe-discriminator-01/BINDING.json').read_text());baseline=prior['subjects']['baseline'];modulePins=[pin(S/f'build/code/src/shared/{x}.js') for x in ['owned_process_lifetime','owned_process_state']]
for c,script in [('r1-probe','probe-reentry.mjs'),('r2-immediate','immediate-probe.mjs')]:
 write(O/(c+'.BINDING.json'),dict(status='PREPARED_FROZEN_R2_PROBE_HELD',sourceInventory=pin(N/'source-freeze.json'),script=pin(O/script),subjects=dict(candidate=dict(ownerModule=modulePins[0]['path'],modulePins=modulePins,outputRoot=str(Q/c/'observation'))),standing='Same byte-identical preserved fixture; only actual repaired module/output bindings change. No execution yet.'))
testRel='test_env/tests/t287-owned-process-lifetime.test.mjs';test=frozen/T/testRel;text=test.read_text();names=re.findall(r"^test\('([^']+)'",text,re.M);assert len(names)==28
baselineName='controlled lifetime: re-entrant signal notices strengthen or finish the attempt and no obsolete signal follows'
assert names.count(baselineName)==1
block=lambda text,name:next(x for x in re.findall(r"(?ms)^test\('[^\n]*.*?^\}\);",text) if x.startswith("test('"+name+"'"))
baselineBlock=block(text,baselineName);oldTest=P/'native-02/frozen-source'/T/testRel;assert baselineBlock==block(oldTest.read_text(),baselineName)
oldControls=json.loads((C/'CONTROLS.json').read_text());oldBase=json.loads(Path(oldControls['controlledBaseline']['path']).read_text());handback=oldBase['handback'];handbackBlock=block(text,handback['name']);oldPhase1=Q1/'source'/T/testRel
if not oldPhase1.exists():oldPhase1=Q1/'work'/T/testRel
assert block(oldPhase1.read_text(),handback['name'])==handbackBlock
stage=[dict(relativePath=p,source=pin(frozen/T/p)) for p in [testRel,'test_env/support/t287-publication-observer.mjs','package.json']]
baseEnv=dict(HOME='/Users/jim',USER='jim',LOGNAME='jim',PATH='/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin',LANG='en_US.UTF-8',LC_ALL='en_US.UTF-8',NODE_OPTIONS='',NODE_PATH='',NODE_DISABLE_COMPILE_CACHE='1',GIT_OPTIONAL_LOCKS='0',NPM_CONFIG_OFFLINE='true',NPM_CONFIG_UPDATE_NOTIFIER='false')
commands=[]
for cid,script,cap in [('r1-probe','probe-reentry.mjs',10),('r2-immediate','immediate-probe.mjs',10),('baseline-signal',None,30),('owned-lifetime',None,300)]:
 env={**baseEnv,'TMPDIR':str(Q/cid/'tmp'),'ABI5_TEST_EVIDENCE_DIR':str(Q/cid/'evidence'),'NPM_CONFIG_CACHE':str(Q/cid/'tmp/npm-cache')}
 if script:
  pb=pin(O/(cid+'.BINDING.json'));argv=[node['path'],str(O/script),pb['path'],pb['sha256'],'candidate'];cwd=str(O);kind='probe'
 else:
  env['ABI5_OWNED_PROCESS_PACKAGE_ROOT']=str(Path(baseline['ownerModule']).parents[4]) if cid=='baseline-signal' else str(S)
  assert Path(env['ABI5_OWNED_PROCESS_PACKAGE_ROOT'])/'build/code/src/shared/owned_process_lifetime.js'==Path(baseline['ownerModule']) if cid=='baseline-signal' else True
  argv=[node['path'],'--experimental-vm-modules','--test','--test-concurrency=1','--test-reporter=tap']
  if cid=='baseline-signal':argv+=['--test-name-pattern=^'+re.escape(baselineName)+'$']
  argv+=[testRel];cwd=str(Q/'test-tenant');kind='testfile'
 command=dict(id=cid,kind=kind,argv=argv,cwd=cwd,environment=env,capSeconds=cap,outputBytes=1048576 if script else 104857600)
 if script:command['observation']=str(Q/cid/'observation/OBSERVATION.json')
 else:command.update(expectedNames=[baselineName] if cid=='baseline-signal' else names,expectedSkipped=0)
 if cid=='baseline-signal':command['expectedFailureMessage']='no KILL after the attempt finished during its own notice';command['comparisonPolicy']='A complete exact-case assertion failure with this message is anticipated baseline evidence and does not skip whole current lifetime. Any other failure/incomplete/import/timeout stops. A baseline pass is recorded as such, never a fabricated failing-before claim.'
 commands.append(command)
write(O/'CONTROLS.json',dict(id='PHASE2-A-R2-PROOF-01',status='PREPARED_EXECUTION_HELD',proofRoot=str(Q),commands=commands,campaignSeconds=450,scope='Exactly R1/R2 repaired-owner probes, baseline-only signal-notice case and whole repaired lifetime. No other test/build/compile/pack/provider.',cleanup='Only owned subprocess groups;1sTERM/1sKILL safety handback if needed, any cleanup necessity is failure. Physical child closure remains per unchanged fixture owner/oracles.',output='Per-command combined stdout/stderr1MiB probes,100MiB tests; final burst rechecked. Evidence retained before original assertions/cleanup as supplied by existing test owners.'))
relations=[pin(N/x) for x in ['source-freeze.json','FREEZE_RECEIPT.json','RETURN.json','SOURCE_CUSTODY.json','COMPILED_SCRATCH_INVENTORY.json','SCRATCH_COMPILE_RELATION.json','NATIVE_CHECKS.json']]+[pin(P/'native-03/immediate-probe-discriminator-01/INPUT_RELATION.json'),pin(P/'native-03/immediate-probe-discriminator-01/RETURN.json'),pin(P/'native-02/probe-discriminator-01/INPUT_RELATION.json')]
protection=g['indices']+g['mainTracking']+g['candidateTracking']+[g['builderPin'],g['archive'],g['workspaceManifest']]+bnative['dependencyPins']+baseline['modulePins']+[pin(O/'probe-reentry.mjs'),pin(O/'immediate-probe.mjs')]
b=dict(status='FROZEN_PHASE2_A_R2_PROOF_EXECUTION_HELD',driver=pin(O/'run.py'),controls=pin(O/'CONTROLS.json'),node=node,proofRoot=str(Q),sourceRoot=str(F),frozenRoot=str(frozen),sourceInventory=pin(N/'source-freeze.json'),compiledInventory=pin(N/'COMPILED_SCRATCH_INVENTORY.json'),baselineCompiledInventory=pin(Q1/'COMPILED_BUILD_INVENTORY.json'),dependencyInventory=bnative['dependencyInventory'],dependencyRoot=bnative['dependencyRoot'],relationPins=relations,protectionPins=protection,heads=g['heads'],fixtureBindings=[pin(O/(x+'.BINDING.json')) for x in ['r1-probe','r2-immediate']],stageFiles=stage,handback=handback,campaignSeconds=450,reserveBytes=4294967296,meaning='Native scratch compiler output reused by exact source/output provenance, no second compile. All commands execute only after separate Root admission. Baseline red is separate comparison evidence; no old failure erased.')
write(O/'BINDING.json',b)
# Mechanical preflight only: exact source/compiled/dependency bytes, parser on preserved historical TAP; no owner import or tests.
for root in [F,frozen]:
 for row in freeze['rows']:
  p=pin(root/row['path']);assert(p['bytes'],p['sha256'])==(row['bytes'],row['sha256'])
for p in [b['compiledInventory'],b['baselineCompiledInventory']]:
 check(p);ci=json.loads(Path(p['path']).read_text())
 for row in ci['rows']:
  actual=pin(Path(ci['root'])/row['path']);assert(actual['bytes'],actual['sha256'])==(row['bytes'],row['sha256'])
for p in protection+relations+[node,b['driver'],b['controls']]+b['fixtureBindings']:check(p)
for root,head in g['heads'].items():assert subprocess.check_output(['/usr/bin/git','-C',root,'rev-parse','HEAD'],env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'},text=True).strip()==head
for row in json.loads(Path(b['dependencyInventory']['path']).read_text())['rows']:
 p=Path(b['dependencyRoot'])/row['path']
 if row['kind']=='symlink':assert p.is_symlink() and os.readlink(p)==row['target']
 else:
  actual=pin(p);assert(actual['bytes'],actual['sha256'])==(row['bytes'],row['sha256'])
source=(O/'run.py').read_text();tree=ast.parse(source);compile(tree,str(O/'run.py'),'exec')
parser=ast.Module(body=[x for x in tree.body if isinstance(x,ast.FunctionDef) and x.name in ['untap','tap']],type_ignores=[]);ns={'re':re,'json':json,'b':b};exec(compile(parser,'<retained-parser-only>','exec'),ns)
oldCommand=next(c for c in oldControls['commands'] if c['id']=='owned-lifetime');parsed=ns['tap']((Q1/'owned-lifetime/stdout.log').read_text(),oldCommand)
assert parsed['counts']['pass']==18 and len(parsed['diagnostics'])>=8
pre=dict(status='PASSED_STATIC_ONLY',sourceRows=1345,compiledRows=582,baselineCompiledRows=996,sourceDigest=freeze['sourceDigest'],sourceAndAllGuardsExact=True,proofRootAbsent=True,parser=dict(source='AST-selected untap/tap functions only; runner main not executed',retainedStdout=pin(Q1/'owned-lifetime/stdout.log'),counts=parsed['counts'],diagnosticRows=len(parsed['diagnostics'])),testPopulation=dict(total=28,skips=0,names=names),baselineCase=dict(name=baselineName,bytes=len(baselineBlock.encode()),sha256=sha(baselineBlock.encode()),unchangedFrom=pin(oldTest)),handbackBlock=dict(bytes=len(handbackBlock.encode()),sha256=sha(handbackBlock.encode()),sameAsRetainedPhase1=True),ownerImports=0,executions=0)
write(O/'STATIC_PREFLIGHT.json',pre)
oldDriver=P/'native-03/immediate-probe-discriminator-01/run.py';delta=''.join(difflib.unified_diff(oldDriver.read_text().splitlines(keepends=True),source.splitlines(keepends=True),fromfile=str(oldDriver),tofile=str(O/'run.py')));write(O/'DRIVER_DELTA.diff',delta.encode())
argv=['/usr/bin/python3',str(O/'run.py'),str(O/'BINDING.json'),pin(O/'BINDING.json')['sha256'],str(O/'ROOT_EXECUTION_ADMISSION.json'),'<Root admission SHA256>']
write(O/'READY.json',dict(status='PHASE2_A_R2_FOUR_MEMBER_PROOF_READY_EXECUTION_HELD',binding=pin(O/'BINDING.json'),controls=pin(O/'CONTROLS.json'),driver=pin(O/'run.py'),driverDelta=pin(O/'DRIVER_DELTA.diff'),preflight=pin(O/'STATIC_PREFLIGHT.json'),sourceInventory=pin(N/'source-freeze.json'),sourceDigest=freeze['sourceDigest'],sourceRows=1345,compiledInventory=b['compiledInventory'],compiledRelation=pin(N/'SCRATCH_COMPILE_RELATION.json'),fixturePins=[pin(O/'probe-reentry.mjs'),pin(O/'immediate-probe.mjs')],modulePins=modulePins,baselineModulePins=baseline['modulePins'],proofRoot=str(Q),commandIds=[c['id'] for c in commands],capsSeconds=[10,10,30,300],campaignSeconds=450,launchArgv=argv,launchCommand=shlex.join(argv),baselinePolicy=commands[2]['comparisonPolicy'],standing='No execution/staging/owner import or source/tracking changes. Advanced-clock hypothesis excluded; Root source/proof conjunction and exact execution admission remain pending.'))
print(json.dumps({x:pin(O/x) for x in ['READY.json','BINDING.json','CONTROLS.json','run.py','STATIC_PREFLIGHT.json']}))
