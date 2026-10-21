from pathlib import Path
import hashlib,json,os,shutil,subprocess,time,traceback,difflib
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'final-finite-proof-successor-06';S=W.parent/'c0-potential-effect-successor-06';T=S/'stage/build_tenants/abiogenesis/typescript';P=Path('/private/tmp/abg-stdo3-finite-07-f2e530a8c69d417b');N='/opt/homebrew/Cellar/node/24.7.0/bin/node'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def pin(p):p=Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
try:
 assert not (W/'STOP.json').exists() and not P.exists()
 oldFreeze=json.loads((O/'freeze.json').read_text());assert sha(O/'freeze.json')=='b4e11378c241054005d02138f0c2396a0a3c0d6a5242036c33cc4369caa61de1'
 oldRows={x['path']:x for x in oldFreeze['files']}
 for name in ['preservation-after.json','overlay-binding.json','commands-config.json','command-environment.json','run-command.py']:
  assert sha(O/name)==oldRows[name]['sha256']
 previous=json.loads((O/'overlay-binding.json').read_text())
 assert sha(R/'build_tenants/abiogenesis/typescript/test_env/tests/m5-event-store-reopen.test.mjs')=='2f47abc4d95073f9f4528e01db3a0e90a7f543e10cc331f7ecc3a4e114ac3e69'
 assert sha(W/'preimages/new-empty-append-sink.mjs')=='0d13d5d882d3d30ab8af2cc613b9d9540db4b4aa001349811726f0983d4f9a02'
 for key in ['archive','adapter','node','template','sourceFreeze','stageInventory','oldHostCorrespondence']:
  assert sha(previous[key]['path'])==previous[key]['sha256'],key
 overlay=W/'overlay';(overlay/'test_env/tests').mkdir(parents=True);source=R/'build_tenants/abiogenesis/typescript/test_env/tests/m5-event-store-reopen.test.mjs';shutil.copy2(source,overlay/'test_env/tests'/source.name)
 support=R/'build_tenants/abiogenesis/typescript/test_env/support/new-empty-append-sink.mjs';(overlay/'test_env/support').mkdir();shutil.copy2(support,overlay/'test_env/support'/support.name)
 diff=''.join(difflib.unified_diff((W/'preimages'/support.name).read_text().splitlines(True),support.read_text().splitlines(True),fromfile='stopped06-support',tofile='successor07-support',n=3));(W/'support.diff').write_text(diff)
 links={'build':T/'build','node_modules':T/'node_modules','test_env/support/root-installed-environment.mjs':T/'test_env/support/root-installed-environment.mjs','test_env/support/t287-entry212-reopen-worker.mjs':T/'test_env/support/t287-entry212-reopen-worker.mjs'}
 for rel,target in links.items():(overlay/rel).symlink_to(target,target_is_directory=target.is_dir())
 stageRows={x['path']:x for x in json.loads((S/'stage-post-generation-inventory.json').read_text())['files']};focused=[]
 for rel in ['build/code/src/abg/event_store.js','build/code/src/abg/runtime_history.js','build/code/src/abg/environment_admission.js','build/code/src/abg/artifact_truth.js','test_env/support/root-installed-environment.mjs','test_env/support/new-empty-append-sink.mjs','test_env/support/t287-entry212-reopen-worker.mjs']:
  p=T/rel;assert sha(p)==stageRows['build_tenants/abiogenesis/typescript/'+rel]['sha256'];focused.append(pin(p))
 (W/'commands').mkdir();(W/'command-freezes').mkdir();P.mkdir();assert P.resolve()==P
 env=json.loads((O/'command-environment.json').read_text());oldRoot='/private/tmp/abg-stdo3-finite-06-6bf37a128940ead5';env={k:v.replace(oldRoot,str(P)) for k,v in env.items()}
 for child in ['cache','npm-logs']:(P/child).mkdir()
 configs=json.loads((O/'commands-config.json').read_text());resources=[]
 for label,c in configs.items():
  c['cwd']=str(overlay) if label=='reopen18' else str(T);c['environment']={k:v.replace(oldRoot,str(P)) for k,v in c['environment'].items()};case=P/f"{c['templateOrdinal']:02d}-{label}";case.mkdir();(case/'tmp').mkdir();resources.append({'id':label,'root':str(case),'canonical':str(case.resolve()),'initiallyAbsent':True})
 wr('commands-config.json',configs);wr('command-environment.json',env);wr('resources.json',{'root':str(P),'initiallyAbsent':True,'cases':resources,'retainedByteLimit':3*1024**3,'bootstrapHostReadOnly':env['ABI5_WAVE1_FROZEN_INSTALL_HOST'],'archive':previous['archive']})
 shutil.copy2(O/'run-command.py',W/'run-command.py')
 request={'argv':[N,'--check',str(support)],'cwd':str(R),'environment':env,'timeoutMs':600000};wr('commands/syntax.request.json',request);start=time.monotonic()
 with (W/'commands/syntax.stdout').open('xb') as out,(W/'commands/syntax.stderr').open('xb') as err:
  child=subprocess.Popen(request['argv'],cwd=R,env=env,stdout=out,stderr=err);status=child.wait(timeout=600)
 result={'pid':child.pid,'exitCode':status,'wallMs':(time.monotonic()-start)*1000,'stdoutSha256':sha(W/'commands/syntax.stdout'),'stderrSha256':sha(W/'commands/syntax.stderr')};wr('commands/syntax.result.json',result);assert status==0,'syntax check failed'
 binding={'support':pin(support),'overlaySupport':pin(overlay/'test_env/support'/support.name),'test':pin(source),'overlayTest':pin(overlay/'test_env/tests'/source.name),'unchangedLinks':[{'path':str(overlay/rel),'target':str(target),'canonicalTarget':str(target.resolve())} for rel,target in links.items()],'reusedCompletePreservation':previous['reusedCompletePreservation'],'reusedFocusedPreservation':pin(O/'preservation-after.json'),'predecessorFreeze':pin(O/'freeze.json'),'focusedCurrentPins':focused,**{key:previous[key] for key in ['stageInventory','sourceFreeze','oldHostInventory','oldHostCorrespondence','archive','adapter','node','template']},'mainGeneratedAndBootstrapPolicy':'Reuse exact closed05 preservation; no new whole-tree scan or writes. Focused checks bind actual loaded owner sources and immutable archive.'};wr('overlay-binding.json',binding)
 wr('preflight-freeze.json',{'activation':'REOPEN18-OWNER-CLONE-SUCCESSOR-07','binding':pin(W/'overlay-binding.json'),'how':pin(W/'HOW-binding.md'),'support':pin(support),'test':pin(source),'syntax':result,'runner':pin(W/'run-command.py'),'config':pin(W/'commands-config.json'),'environment':pin(W/'command-environment.json'),'resources':pin(W/'resources.json'),'preimage':pin(W/'preimages'/support.name),'delta':pin(W/'support.diff')})
 for label,c in configs.items():wr('command-freezes/'+label+'.json',{'id':label,'configuration':c,'effectiveEnvironment':{**env,**c['environment']},'preflight':pin(W/'preflight-freeze.json'),'runner':pin(W/'run-command.py'),'test':pin(Path(c['cwd'])/c['argv'][-1]),'sourceFreeze':previous['sourceFreeze'],'archive':previous['archive'],'adapter':previous['adapter'] if c['templateOrdinal']==8 else None,'timeoutMs':600000,'order':'Only after preceding selected command passed; first failure stops'})
 print(json.dumps({'supportSha256':sha(support),'testSha256':sha(source),'preflightFreezeSha256':sha(W/'preflight-freeze.json'),'syntax':result,'focusedCurrentFiles':len(focused),'fullScansRepeated':0}))
except BaseException:
 if not (W/'STOP.json').exists():wr('STOP.json',{'kind':'selected preflight failure','traceback':traceback.format_exc(),'disposition':'stop before repair/retry/runtime'})
 raise
