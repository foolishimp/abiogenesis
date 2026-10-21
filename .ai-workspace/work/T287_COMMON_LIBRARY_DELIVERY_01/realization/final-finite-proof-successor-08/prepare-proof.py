from pathlib import Path
import hashlib,json,os,traceback
W=Path(__file__).resolve().parent;O=W.parent/'final-finite-proof-successor-07';P=Path('/private/tmp/abg-stdo3-finite-08-9d3470afc2b618e5')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):p=Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def wr(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
try:
 assert not P.exists() and not (W/'STOP.json').exists()
 assert sha(O/'freeze.json')=='04c6e9dbdf22eb68ec3024240c7e7e64b951b9fa85f2aa849080e2f0fc09bd89'
 oldRows={x['path']:x for x in json.loads((O/'freeze.json').read_text())['files']}
 for name in ['commands-config.json','command-environment.json','run-command.py','overlay-binding.json','preservation-after.json']:
  assert sha(O/name)==oldRows[name]['sha256'],name
 previous=json.loads((O/'overlay-binding.json').read_text())
 for key in ['support','test','archive','adapter','node','template','sourceFreeze','stageInventory','oldHostCorrespondence']:
  assert sha(previous[key]['path'])==previous[key]['sha256'],key
 assert sha(W/'run-command.py')==sha(O/'run-command.py')
 oldRoot='/private/tmp/abg-stdo3-finite-07-f2e530a8c69d417b'
 env={k:v.replace(oldRoot,str(P)) for k,v in json.loads((O/'command-environment.json').read_text()).items()}
 configs={k:v for k,v in json.loads((O/'commands-config.json').read_text()).items() if v['templateOrdinal']>=5}
 assert [c['templateOrdinal'] for c in configs.values()]==[5,6,7,8]
 stageRows={x['path']:x for x in json.loads(Path(previous['stageInventory']['path']).read_text())['files']}
 testPins=[]
 for label,c in configs.items():
  c['environment']={k:v.replace(oldRoot,str(P)) for k,v in c['environment'].items()}
  selected=Path(c['cwd'])/c['argv'][-1];expected=stageRows['build_tenants/abiogenesis/typescript/'+c['argv'][-1]]
  assert sha(selected)==expected['sha256'] and selected.stat().st_size==expected['bytes'],label
  testPins.append(pin(selected))
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
 wr('resources.json',{'root':str(P),'initiallyAbsent':True,'directories':resources,'routeScratchExistingBeforeCommand':True,'limitBytes':3*1024**3,'oldRootsWritable':False})
 binding={'predecessorFreeze':pin(O/'freeze.json'),'previousOverlayBinding':pin(O/'overlay-binding.json'),'reusedPreservation':pin(O/'preservation-after.json'),'selectedTests':testPins,**{k:previous[k] for k in ['support','test','archive','adapter','node','template','sourceFreeze','stageInventory','oldHostCorrespondence']},'fullScansRepeated':0,'sourceOrArchiveChanges':False}
 wr('input-binding.json',binding)
 wr('preflight-freeze.json',{'activation':'FINITE-REST-08','binding':pin(W/'input-binding.json'),'how':pin(W/'HOW-binding.md'),'runner':pin(W/'run-command.py'),'config':pin(W/'commands-config.json'),'environment':pin(W/'command-environment.json'),'resources':pin(W/'resources.json'),'sourceChanges':False})
 for label,c in configs.items():
  wr('command-freezes/'+label+'.json',{'id':label,'configuration':c,'effectiveEnvironment':{**env,**c['environment']},'preflight':pin(W/'preflight-freeze.json'),'runner':pin(W/'run-command.py'),'test':pin(Path(c['cwd'])/c['argv'][-1]),'sourceFreeze':previous['sourceFreeze'],'archive':previous['archive'],'adapter':previous['adapter'] if c['templateOrdinal']==8 else None,'timeoutMs':600000,'order':'Original5-8 once in order; first failure stops remaining commands'})
 print(json.dumps({'preflightFreezeSha256':sha(W/'preflight-freeze.json'),'routeScratchExisting':str(P/'05-route-self-contained/route-scratch'),'selectedCommands':list(configs),'fullScansRepeated':0}))
except BaseException:
 if not (W/'STOP.json').exists():wr('STOP.json',{'kind':'selected preflight failure','traceback':traceback.format_exc(),'disposition':'stop before repair/retry/runtime'})
 raise
