from pathlib import Path
import hashlib,json,os,traceback,shutil,difflib,subprocess,time
W=Path(__file__).resolve().parent;O=W.parent/'final-finite-proof-successor-08';P=Path('/private/tmp/abg-stdo3-finite-09-62eaf731c98b405d')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):p=Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
try:
 assert not P.exists() and not (W/'STOP.json').exists()
 assert sha(O/'freeze.json')=='6d6aff5c485bf77e4ee8dd62dd093e9aa3a92966738d84f0b8267e675c5e1326'
 oldRows={x['path']:x for x in json.loads((O/'freeze.json').read_text())['files']}
 for name in ['commands-config.json','command-environment.json','run-command.py','input-binding.json','preservation-after.json']:
  assert sha(O/name)==oldRows[name]['sha256'],name
 previous=json.loads((O/'input-binding.json').read_text())
 for key in ['support','test','archive','adapter','node','template','sourceFreeze','stageInventory','oldHostCorrespondence']:
  assert sha(previous[key]['path'])==previous[key]['sha256'],key
 assert sha(W/'run-command.py')==sha(O/'run-command.py')
 oldRoot='/private/tmp/abg-stdo3-finite-08-9d3470afc2b618e5'
 env={k:v.replace(oldRoot,str(P)) for k,v in json.loads((O/'command-environment.json').read_text()).items()}
 configs={k:v for k,v in json.loads((O/'commands-config.json').read_text()).items() if v['templateOrdinal']>=6}
 assert [c['templateOrdinal'] for c in configs.values()]==[6,7,8]
 stageRows={x['path']:x for x in json.loads(Path(previous['stageInventory']['path']).read_text())['files']}
 T=Path(previous['sourceFreeze']['path']).parent/'stage/build_tenants/abiogenesis/typescript';R=Path('/Users/jim/src/apps/abiogenesis');source=R/'build_tenants/abiogenesis/typescript/test_env/tests/t287-native-workspace-work.test.mjs'
 assert sha(W/'preimages'/source.name)=='3de46feacb8e255cfd0361d289e44e52ff1e8c785e62bce3f7190b806e6da384'
 overlay=W/'overlay';(overlay/'test_env/tests').mkdir(parents=True);shutil.copy2(source,overlay/'test_env/tests'/source.name)
 links={'build':T/'build','node_modules':T/'node_modules','test_env/support':T/'test_env/support'}
 for rel,target in links.items():(overlay/rel).symlink_to(target,target_is_directory=True)
 diff=''.join(difflib.unified_diff((W/'preimages'/source.name).read_text().splitlines(True),source.read_text().splitlines(True),fromfile='stopped08-test',tofile='successor09-test',n=3));(W/'test.diff').write_text(diff)
 testPins=[]
 for label,c in configs.items():
  c['environment']={k:v.replace(oldRoot,str(P)) for k,v in c['environment'].items()}
  selected=T/c['argv'][-1];expected=stageRows['build_tenants/abiogenesis/typescript/'+c['argv'][-1]]
  assert sha(selected)==expected['sha256'] and selected.stat().st_size==expected['bytes'],label
  if label=='native-workspace-physical-regression':c['cwd']=str(overlay);selected=overlay/c['argv'][-1];assert sha(selected)==sha(source)
  testPins.append(pin(selected))
 ownerPins=[]
 for rel in ['code/src/abg/c_call_outcome.ts','build/code/src/abg/c_call_outcome.js','build/code/src/abg/event_calculus.js','build/code/src/abg/native_work_effect.js','build/code/src/abg/native_worksite_execution.js','build/code/src/abg/runtime_history.js','build/code/src/abg/actor_process.js','build/code/src/abg/worker_transport.js','test_env/support/t287-generic-job-worksite.mjs','test_env/support/new-empty-append-sink.mjs']:
  p=T/rel;expected=stageRows['build_tenants/abiogenesis/typescript/'+rel];assert sha(p)==expected['sha256'];ownerPins.append(pin(p))
 P.mkdir();assert P.is_dir() and P.resolve()==P
 for child in ['cache','npm-logs']:(P/child).mkdir()
 resources=[]
 for label,c in configs.items():
  case=P/f"{c['templateOrdinal']:02d}-{label}";assert not case.exists();case.mkdir();(case/'tmp').mkdir()
  assert case.resolve()==case and case.is_dir()
  assert Path(c['environment']['TMPDIR']).resolve()==case/'tmp'
  roots=[case,case/'tmp']
  if label=='route-self-contained':
   scratch=Path(c['environment']['ABI5_ROUTE_PROJECTION_SCRATCH']);assert scratch==case/'route-scratch' and not scratch.exists();scratch.mkdir();assert scratch.is_dir() and scratch.resolve()==scratch;roots.append(scratch)
  for p in roots:
   st=p.stat();resources.append({'command':label,'path':str(p),'canonical':str(p.resolve()),'kind':'directory','dev':st.st_dev,'inode':st.st_ino,'mode':oct(st.st_mode&0o7777),'createdFromAbsent':True})
 assert len({x['canonical'] for x in resources})==len(resources)
 (W/'commands').mkdir();(W/'command-freezes').mkdir()
 wr('commands-config.json',configs);wr('command-environment.json',env)
 wr('resources.json',{'root':str(P),'initiallyAbsent':True,'directories':resources,'routeScratchNotSelected':True,'limitBytes':3*1024**3,'oldRootsWritable':False})
 binding={'changedTest':pin(source),'overlayTest':pin(overlay/'test_env/tests'/source.name),'ownerPins':ownerPins,'overlayLinks':[{'path':str(overlay/rel),'target':str(target),'canonicalTarget':str(target.resolve())} for rel,target in links.items()],'predecessorFreeze':pin(O/'freeze.json'),'previousOverlayBinding':pin(O/'input-binding.json'),'reusedPreservation':pin(O/'preservation-after.json'),'selectedTests':testPins,**{k:previous[k] for k in ['support','test','archive','adapter','node','template','sourceFreeze','stageInventory','oldHostCorrespondence']},'fullScansRepeated':0,'runtimeOrArchiveChanges':False,'testSourceOnlyChanged':True}
 wr('input-binding.json',binding)
 request={'argv':[previous['node']['path'],'--check',str(source)],'cwd':str(R),'environment':env,'timeoutMs':600000};wr('commands/syntax.request.json',request);start=time.monotonic()
 with (W/'commands/syntax.stdout').open('xb') as out,(W/'commands/syntax.stderr').open('xb') as err:
  child=subprocess.Popen(request['argv'],cwd=R,env=env,stdout=out,stderr=err);status=child.wait(timeout=600)
 result={'pid':child.pid,'exitCode':status,'wallMs':(time.monotonic()-start)*1000,'stdoutSha256':sha(W/'commands/syntax.stdout'),'stderrSha256':sha(W/'commands/syntax.stderr')};wr('commands/syntax.result.json',result);assert status==0,'syntax check failed'
 wr('preflight-freeze.json',{'activation':'FINITE-REST-09','binding':pin(W/'input-binding.json'),'how':pin(W/'HOW-binding.md'),'runner':pin(W/'run-command.py'),'config':pin(W/'commands-config.json'),'environment':pin(W/'command-environment.json'),'resources':pin(W/'resources.json'),'changedTest':pin(source),'syntax':result,'preimage':pin(W/'preimages'/source.name),'delta':pin(W/'test.diff')})
 for label,c in configs.items():
  wr('command-freezes/'+label+'.json',{'id':label,'configuration':c,'effectiveEnvironment':{**env,**c['environment']},'preflight':pin(W/'preflight-freeze.json'),'runner':pin(W/'run-command.py'),'test':pin(Path(c['cwd'])/c['argv'][-1]),'sourceFreeze':previous['sourceFreeze'],'archive':previous['archive'],'adapter':previous['adapter'] if c['templateOrdinal']==8 else None,'timeoutMs':600000,'order':'Original6-8 once in order; first failure stops remaining commands'})
 print(json.dumps({'preflightFreezeSha256':sha(W/'preflight-freeze.json'),'testSha256':sha(source),'syntax':result,'selectedCommands':list(configs),'fullScansRepeated':0}))
except BaseException:
 if not (W/'STOP.json').exists():wr('STOP.json',{'kind':'selected preflight failure','traceback':traceback.format_exc(),'disposition':'stop before repair/retry/runtime'})
 raise
