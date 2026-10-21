from pathlib import Path
import json,hashlib,os,shutil,datetime
D=Path(__file__).resolve().parent;R=Path('/Users/jim/src/apps/abiogenesis');W=R/'.ai-workspace/work/T287_COMMON_LIBRARY_DELIVERY_01';P=W/'realization/p5-installed-preparation-01';S=W/'realization/c0-potential-effect-successor-06';T=S/'stage/build_tenants/abiogenesis/typescript';F=W/'realization/combined-final-02/source/build_tenants/abiogenesis/typescript';Q=D/'proof/build_tenants/abiogenesis/typescript';X=Path('/private/tmp/abg-stdo3-p5-04-7ca935e280b14df6')
def dump(name,value):
 with (D/name).open('x') as f:json.dump(value,f,indent=2);f.write('\n')
def pin(path):
 b=path.read_bytes();return {'path':str(path),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def check(path,row):
 p=pin(path);assert p['bytes']==row['bytes'] and p['sha256']==row['sha256'],str(path);return p
try:
 stop=pin(D/'binding-stop-freeze.json');assert stop['sha256']=='331bab10734d99453aec507afe592b97f56471a87e47f1cf67471163cfcace68'
 for row in json.loads((D/'binding-stop-freeze.json').read_text())['files']:check(D/row['path'],row)
 triage={'source':'Root CORRECT_BINDING_AND_CONTINUE_GRANTED_P5 message, attributed transcription','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'firstSubject':stop,'cause':'Old E03 setup precedes already-selected P3 fixture dependency repair; exact P5 input predicate correctly refused the substitution. Zero install/runtime.','selectedRoute':str(F/'test_env/support/root-installed-environment.mjs'),'expectedSha256':'18dc4b6b428a4925924fe04de28eba3e7a8e0727bb749649e91e1df857c6490e','scope':'Support acquisition only; no Product/E03/test/support edit or new packaging/review cycle. Reuse previous full readiness by exact frozen inventory identities; no repeated full readiness scan.','ordinarySourceSelection':'Other transitive routes selected from extant sources only where exact bytes match the existing P5 frozen pin.','stop':'First genuine new predicate/runtime failure stops before repair/retry.'}
 dump('source-route-triage-02.json',triage)
 assert not Q.exists() and not X.exists()
 pins=[pin(P/'freeze.json'),pin(S/'proof-freeze.json')]
 assert pins[0]['sha256']=='b8859cda37f284ef928360059664b14b4304c131b23e21f453cdc4cf135e92b6'
 assert pins[1]['sha256']=='b60eca3e6fa641206eda37658b42285cf888a1a42b3cae259be5e2be75a5ce37'
 final=json.loads((S/'proof-freeze.json').read_text()); frozen={row['path']:row for row in final['records']}
 for name in ['stage-post-generation-inventory.json','dependency-inputs.json','archive-members.json','offline-closure.json','mode-relation-pins.json']:
  pins.append(check(S/name,frozen[str(S/name)]))
 main=W/'realization/u1-c0-physical-currentness-01/main-generated-preimage.json';mpin=pin(main);assert mpin['sha256']=='8838a89cc91b09a64e587294c7ce8c206d26543c099409503bb15e97a0828677';pins.append(mpin)
 archive=Path(final['archive']['path']);pins.append(check(archive,final['archive']))
 sources=[];deps=json.loads((P/'source-support-dependencies.json').read_text())
 for row in deps['files']:
  src=(T if row['path']=='test_env/falsifiers/runtime-retained-projections-worker.mjs' else F)/row['path'];pins.append(check(src,row));sources.append((src,row['path']))
 prep=json.loads((P/'freeze.json').read_text())
 for row in prep['ownedOutputs']:
  src=P/'subject-final'/row['path'];pins.append(check(src,row));sources.append((src,str(Path(row['path']).relative_to('build_tenants/abiogenesis/typescript'))))
 lang='test_env/fixtures/language-smoke/program.mjs';src=T/lang;pins.append(check(src,frozen[str(src)]));sources.append((src,lang))
 manifest=T/'product-toolchain-manifest.json';m=pin(manifest);assert m['sha256']=='a782e3bc49c703b3ea254e45edb54d3f7bf0402b42ff3bd34356dc0c13111ab4';pins.append(m);sources.append((manifest,'product-toolchain-manifest.json'))
 for path in ['/opt/homebrew/Cellar/node/24.7.0/bin/node','/opt/homebrew/lib/node_modules/npm/bin/npm-cli.js','/opt/homebrew/lib/node_modules/npm/package.json']:pins.append(pin(Path(path)))
 assert next(p for p in pins if p['path'].endswith('/bin/node'))['sha256']=='fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
 dump('binding-successor-inputs.json',{'pins':pins,'sourceRoutes':[{'source':str(a),'destinationRelative':b} for a,b in sources],'reusedReadiness':json.loads((D/'binding-failure.json').read_text())['checked'],'reuseRelation':'Exact unchanged preparation/final06 freezes and input inventories; no repeat full readiness walk. Root continuation admits this route repair.','physicalRootInitiallyAbsent':True,'proofRootInitiallyAbsent':True})
 for src,rel in sources:
  dst=Q/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);check(dst,pin(src))
 for name in ['build','node_modules']:
  target=T/name;assert not target.is_symlink() and str(target.resolve())==str(target);os.symlink(target,Q/name,target_is_directory=True)
 cfg=json.loads((P/'installed-configuration.NOT-GRANTED.json').read_text());cfg.update(effectGrant='P5_INSTALLED_EXECUTION_GRANTED_BY_EXECUTIVE',proofPackageRoot=str(Q),artifactPath=str(archive),artifactSha256=final['archive']['sha256'],installHost=str(X/'host'),hostManifestSha256=m['sha256'],scratchParent=str(X/'scratch'),evidenceRoot=str(X/'evidence'));dump('configuration.json',cfg)
 env={'PATH':'/opt/homebrew/Cellar/node/24.7.0/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin','HOME':'/Users/jim','LANG':'en_AU.UTF-8','TMPDIR':str(X/'scratch'),'NODE_OPTIONS':'','npm_config_offline':'true','npm_config_ignore_scripts':'true','npm_config_audit':'false','npm_config_fund':'false','npm_config_update_notifier':'false','npm_config_cache':str(X/'cache'),'npm_config_logs_dir':str(X/'npm-logs'),'npm_config_userconfig':'/dev/null','npm_config_globalconfig':'/dev/null','ABG_T287_C2_PROOF_CONFIG':str(D/'configuration.json')};dump('environment.json',env)
 launches={'install':{'executable':cfg['nodeExecutable'],'args':['/opt/homebrew/lib/node_modules/npm/bin/npm-cli.js','install','--bin-links=false','--offline','--ignore-scripts','--no-audit','--no-fund','--package-lock=true',str(archive)],'cwd':str(X/'host'),'timeoutMs':120000,'terminationGraceMs':1000,'lifetimeModule':str(T/'build/code/src/shared/owned_process_lifetime.js')},'test':{'executable':cfg['nodeExecutable'],'args':['--test','--test-name-pattern','^T-287 C2 compact acknowledgment preserves installed large-log observation and replay$','test_env/tests/t287-worksite-command-execution.test.mjs'],'cwd':str(Q),'timeoutMs':630000,'terminationGraceMs':1000,'lifetimeModule':str(X/'host/node_modules/@abiogenesis/typescript-tenant/build/code/src/shared/owned_process_lifetime.js')}};dump('launches.json',launches)
 dump('proof-copy-inventory.json',{'files':[pin(Q/rel) for _,rel in sources],'symlinks':[{'path':str(Q/name),'target':str(T/name),'targetInventory':str(S/('stage-post-generation-inventory.json' if name=='build' else 'dependency-inputs.json'))} for name in ['build','node_modules']]})
 dump('binding-successor-result.json',{'status':'exact selected inputs bound','sourceFiles':len(sources),'requiredSetup':pin(Q/'test_env/support/root-installed-environment.mjs'),'proofPackageRoot':str(Q),'sourceEffects':0,'runtimeLaunchCount':0,'priorFailurePreserved':True})
 print(json.dumps({'status':'exact selected inputs bound','sourceFiles':len(sources),'proofRoot':str(Q)}))
except BaseException as error:
 dump('binding-successor-failure.json',{'error':repr(error)});raise
