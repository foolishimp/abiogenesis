from pathlib import Path
import hashlib,json,os,shutil,subprocess,time,traceback,difflib
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'final-finite-proof-successor-05';S=W.parent/'c0-potential-effect-successor-06';T=S/'stage/build_tenants/abiogenesis/typescript';P=Path('/private/tmp/abg-stdo3-finite-06-6bf37a128940ead5');N='/opt/homebrew/Cellar/node/24.7.0/bin/node'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def pin(p):p=Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
try:
 assert not (W/'STOP.json').exists() and not P.exists()
 oldFreeze=json.loads((O/'freeze.json').read_text());assert sha(O/'freeze.json')=='c886e40487ecc4a653bfbc7d2e00b7e62c02b68fbfae18d77f8b95b747d3359b'
 oldRows={x['path']:x for x in oldFreeze['files']}
 for name in ['preservation-after.json','overlay-binding.json','commands-config.json','command-environment.json','run-command.py']:
  assert sha(O/name)==oldRows[name]['sha256']
 previous=json.loads((O/'overlay-binding.json').read_text())
 for key in ['archive','adapter','node','template','sourceFreeze','stageInventory','oldHostCorrespondence']:
  assert sha(previous[key]['path'])==previous[key]['sha256'],key
 overlay=W/'overlay';(overlay/'test_env/tests').mkdir(parents=True);source=R/'build_tenants/abiogenesis/typescript/test_env/tests/m5-event-store-reopen.test.mjs';shutil.copy2(source,overlay/'test_env/tests'/source.name)
 diff=''.join(difflib.unified_diff((W/'preimages'/source.name).read_text().splitlines(True),source.read_text().splitlines(True),fromfile='stopped05',tofile='successor06',n=3));(W/'test.diff').write_text(diff)
 links={'build':T/'build','node_modules':T/'node_modules','test_env/support':T/'test_env/support'}
 for rel,target in links.items():(overlay/rel).symlink_to(target,target_is_directory=True)
 stageRows={x['path']:x for x in json.loads((S/'stage-post-generation-inventory.json').read_text())['files']};focused=[]
 for rel in ['build/code/src/abg/event_store.js','build/code/src/abg/runtime_history.js','test_env/support/root-installed-environment.mjs','test_env/support/new-empty-append-sink.mjs','test_env/support/t287-entry212-reopen-worker.mjs']:
  p=T/rel;assert sha(p)==stageRows['build_tenants/abiogenesis/typescript/'+rel]['sha256'];focused.append(pin(p))
 (W/'commands').mkdir();(W/'command-freezes').mkdir();P.mkdir();assert P.resolve()==P
 env=json.loads((O/'command-environment.json').read_text());oldRoot='/private/tmp/abg-stdo3-finite-05-81459ad62ef037bc';env={k:v.replace(oldRoot,str(P)) for k,v in env.items()}
 for child in ['cache','npm-logs']:(P/child).mkdir()
 configs=json.loads((O/'commands-config.json').read_text());resources=[]
 for label,c in configs.items():
  c['cwd']=str(overlay) if label=='reopen18' else str(T);c['environment']={k:v.replace(oldRoot,str(P)) for k,v in c['environment'].items()};case=P/f"{c['templateOrdinal']:02d}-{label}";case.mkdir();(case/'tmp').mkdir();resources.append({'id':label,'root':str(case),'canonical':str(case.resolve()),'initiallyAbsent':True})
 wr('commands-config.json',configs);wr('command-environment.json',env);wr('resources.json',{'root':str(P),'initiallyAbsent':True,'cases':resources,'retainedByteLimit':3*1024**3,'bootstrapHostReadOnly':env['ABI5_WAVE1_FROZEN_INSTALL_HOST'],'archive':previous['archive']})
 shutil.copy2(O/'run-command.py',W/'run-command.py')
 request={'argv':[N,'--check',str(source)],'cwd':str(R),'environment':env,'timeoutMs':600000};wr('commands/syntax.request.json',request);start=time.monotonic()
 with (W/'commands/syntax.stdout').open('xb') as out,(W/'commands/syntax.stderr').open('xb') as err:
  child=subprocess.Popen(request['argv'],cwd=R,env=env,stdout=out,stderr=err);status=child.wait(timeout=600)
 result={'pid':child.pid,'exitCode':status,'wallMs':(time.monotonic()-start)*1000,'stdoutSha256':sha(W/'commands/syntax.stdout'),'stderrSha256':sha(W/'commands/syntax.stderr')};wr('commands/syntax.result.json',result);assert status==0,'syntax check failed'
 binding={'test':pin(source),'overlayTest':pin(overlay/'test_env/tests'/source.name),'unchangedLinks':[{'path':str(overlay/rel),'target':str(target),'canonicalTarget':str(target.resolve())} for rel,target in links.items()],'reusedCompletePreservation':pin(O/'preservation-after.json'),'predecessorFreeze':pin(O/'freeze.json'),'focusedCurrentPins':focused,**{key:previous[key] for key in ['stageInventory','sourceFreeze','oldHostInventory','oldHostCorrespondence','archive','adapter','node','template']},'mainGeneratedAndBootstrapPolicy':'Reuse exact closed05 preservation; no new whole-tree scan or writes. Focused checks bind actual loaded owner sources and immutable archive.'};wr('overlay-binding.json',binding)
 wr('preflight-freeze.json',{'activation':'REOPEN18-TEST-SUCCESSOR-06','binding':pin(W/'overlay-binding.json'),'how':pin(W/'HOW-binding.md'),'test':pin(source),'syntax':result,'runner':pin(W/'run-command.py'),'config':pin(W/'commands-config.json'),'environment':pin(W/'command-environment.json'),'resources':pin(W/'resources.json'),'preimage':pin(W/'preimages'/source.name),'delta':pin(W/'test.diff')})
 for label,c in configs.items():wr('command-freezes/'+label+'.json',{'id':label,'configuration':c,'effectiveEnvironment':{**env,**c['environment']},'preflight':pin(W/'preflight-freeze.json'),'runner':pin(W/'run-command.py'),'test':pin(Path(c['cwd'])/c['argv'][-1]),'sourceFreeze':previous['sourceFreeze'],'archive':previous['archive'],'adapter':previous['adapter'] if c['templateOrdinal']==8 else None,'timeoutMs':600000,'order':'Only after preceding selected command passed; first failure stops'})
 print(json.dumps({'testSha256':sha(source),'preflightFreezeSha256':sha(W/'preflight-freeze.json'),'syntax':result,'focusedCurrentFiles':len(focused),'fullScansRepeated':0}))
except BaseException:
 if not (W/'STOP.json').exists():wr('STOP.json',{'kind':'selected preflight failure','traceback':traceback.format_exc(),'disposition':'stop before repair/retry/runtime'})
 raise
