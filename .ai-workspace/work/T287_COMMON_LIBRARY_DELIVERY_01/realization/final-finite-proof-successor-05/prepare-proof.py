from pathlib import Path
import hashlib,json,os,stat,shutil,subprocess,time,traceback
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;S=W.parent/'c0-potential-effect-successor-06';T=S/'stage/build_tenants/abiogenesis/typescript';P=Path('/private/tmp/abg-stdo3-finite-05-81459ad62ef037bc');N='/opt/homebrew/Cellar/node/24.7.0/bin/node'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def pin(p):p=Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def verify(p,row):
 if row.get('kind')=='symlink':assert p.is_symlink() and os.readlink(p)==row['target'],str(p)
 else:assert p.is_file() and sha(p)==row['sha256'] and p.stat().st_size==row['bytes'],str(p)
 assert oct(stat.S_IMODE(p.lstat().st_mode))==row['mode'],str(p)
try:
 assert not (W/'STOP.json').exists() and not P.exists()
 assert sha(S/'freeze.json')=='80c749e3ad666b8d6ae08e9b4c4f8e56a274072926f1005e6d8049b40b5671cd'
 for row in json.loads((S/'stage-post-generation-inventory.json').read_text())['files']:verify(S/'stage'/row['path'],row)
 main=json.loads((W.parent/'u1-c0-physical-currentness-01/main-generated-preimage.json').read_text());main=main if isinstance(main,list) else main['files']
 for row in main:verify(R/row['path'],row)
 artifact=S/'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz';assert sha(artifact)=='25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079'
 oldPhysical=json.loads((S/'physical-inventory.json').read_text());host=Path(oldPhysical['root'])/'unavailable/host';hostPrefix='unavailable/host/node_modules/@abiogenesis/typescript-tenant/'
 selected=[row for row in oldPhysical['files'] if row['path'].startswith(hostPrefix)]
 for row in selected:verify(Path(oldPhysical['root'])/row['path'],row)
 assert len(selected)>5000
 adapter=Path('/private/tmp/abg-stdo3-final-04-6f42d9a31e5870bc/owner-resolution/calls/preparation-resolve.json');assert sha(adapter)=='70299b7965b7402c3923b814ca3f36a0b1699c31aa66d5e35a03d911a99d123d'
 assert sha(N)=='fe1c0128a4c0163b034ec06b8b290494830ccb49922b5ce9ca4edf497a083e5f'
 overlay=W/'overlay';(overlay/'test_env/tests').mkdir(parents=True);source=R/'build_tenants/abiogenesis/typescript/test_env/tests/m5-event-store-reopen.test.mjs';shutil.copy2(source,overlay/'test_env/tests'/source.name)
 links={'build':T/'build','node_modules':T/'node_modules','test_env/support':T/'test_env/support'}
 for rel,target in links.items():(overlay/rel).symlink_to(target,target_is_directory=True)
 (W/'commands').mkdir();(W/'command-freezes').mkdir();P.mkdir();assert P.resolve()==P
 template=W.parent/'final-proof-preparation-01/remaining-execution.template.json';assert sha(template)=='25a6573b7fe685e7af9cf571befcec91354f12d7a7453618924cf96621804142'
 env=json.loads((W.parent/'final-finite-proof-04/command-environment.json').read_text())
 env.update(TMPDIR=str(P)+'/',npm_config_cache=str(P/'cache'),npm_config_logs_dir=str(P/'npm-logs'),ABI5_WAVE1_FROZEN_ARTIFACT_PATH=str(artifact),ABI5_WAVE1_FROZEN_ARTIFACT_SHA256='sha256:'+sha(artifact),ABI5_WAVE1_FROZEN_INSTALL_HOST=str(host))
 for child in ['cache','npm-logs']:(P/child).mkdir()
 configs={};resources=[]
 for ordinal,c in enumerate(json.loads(template.read_text())['commands'],1):
  if ordinal<3:continue
  label=c['id'];case=P/f'{ordinal:02d}-{label}';case.mkdir();(case/'tmp').mkdir();ce={'TMPDIR':str(case/'tmp')+'/'}
  if ordinal==5:ce['ABI5_ROUTE_PROJECTION_SCRATCH']=str(case/'route-scratch')
  if ordinal==8:ce['ABI5_PREPARATION_RESOLVE_CALL']=str(adapter)
  configs[label]={'argv':[N if x=='<EXACT_NODE>' else x for x in c['argv']],'cwd':str(overlay if ordinal==3 else T),'environment':ce,'noCredit':c.get('noCredit',[]),'condition':c.get('precondition'),'templateOrdinal':ordinal}
  resources.append({'id':label,'root':str(case),'canonical':str(case.resolve()),'initiallyAbsent':True})
 wr('commands-config.json',configs);wr('command-environment.json',env);wr('resources.json',{'root':str(P),'initiallyAbsent':True,'cases':resources,'retainedByteLimit':3*1024**3,'bootstrapHostReadOnly':str(host),'archive':pin(artifact)})
 shutil.copy2(W.parent/'final-finite-proof-04/run-command.py',W/'run-command.py')
 request={'argv':[N,'--check',str(source)],'cwd':str(R),'environment':env,'timeoutMs':600000};wr('commands/syntax.request.json',request)
 start=time.monotonic()
 with (W/'commands/syntax.stdout').open('xb') as out,(W/'commands/syntax.stderr').open('xb') as err:
  child=subprocess.Popen(request['argv'],cwd=R,env=env,stdout=out,stderr=err);status=child.wait(timeout=600)
 result={'pid':child.pid,'exitCode':status,'wallMs':(time.monotonic()-start)*1000,'stdoutSha256':sha(W/'commands/syntax.stdout'),'stderrSha256':sha(W/'commands/syntax.stderr')};wr('commands/syntax.result.json',result);assert status==0,'syntax check failed'
 binding={'test':pin(source),'overlayTest':pin(overlay/'test_env/tests'/source.name),'unchangedLinks':[{'path':str(overlay/rel),'target':str(target),'canonicalTarget':str(target.resolve())} for rel,target in links.items()],'stageInventory':pin(S/'stage-post-generation-inventory.json'),'sourceFreeze':pin(S/'freeze.json'),'oldHostInventory':pin(S/'physical-inventory.json'),'hostPackageFilesRechecked':len(selected),'oldHostCorrespondence':pin(S/'unavailable-host-correspondence.json'),'archive':pin(artifact),'adapter':pin(adapter),'node':pin(N),'template':pin(template),'mainGeneratedExact':len(main),'noAbiPack':True,'noStageOrOldHostWrites':True};wr('overlay-binding.json',binding)
 preflight={'activation':'REOPEN18-TEST-SUCCESSOR-05','binding':pin(W/'overlay-binding.json'),'how':pin(W/'HOW-binding.md'),'test':pin(source),'syntax':result,'runner':pin(W/'run-command.py'),'config':pin(W/'commands-config.json'),'environment':pin(W/'command-environment.json'),'resources':pin(W/'resources.json'),'preimage':pin(W/'preimages'/source.name)};wr('preflight-freeze.json',preflight)
 for label,c in configs.items():
  testpath=Path(c['cwd'])/c['argv'][-1]
  wr('command-freezes/'+label+'.json',{'id':label,'configuration':c,'effectiveEnvironment':{**env,**c['environment']},'preflight':pin(W/'preflight-freeze.json'),'runner':pin(W/'run-command.py'),'test':pin(testpath),'sourceFreeze':pin(S/'freeze.json'),'archive':pin(artifact),'adapter':pin(adapter) if c['templateOrdinal']==8 else None,'timeoutMs':600000,'order':'Only after preceding selected command passed; first failure stops'})
 print(json.dumps({'testSha256':sha(source),'preflightFreezeSha256':sha(W/'preflight-freeze.json'),'hostRows':len(selected),'syntax':result}))
except BaseException:
 if not (W/'STOP.json').exists():wr('STOP.json',{'kind':'selected preflight failure','traceback':traceback.format_exc(),'disposition':'stop before repair/retry/runtime'})
 raise
