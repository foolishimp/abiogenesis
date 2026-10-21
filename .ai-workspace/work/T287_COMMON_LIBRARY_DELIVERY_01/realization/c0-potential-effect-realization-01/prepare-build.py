from pathlib import Path
import hashlib,json,os,shutil,stat,traceback,time
R=Path('/Users/jim/src/apps/abiogenesis'); W=Path(__file__).resolve().parent; T=Path('build_tenants/abiogenesis/typescript'); O=W.parent/'combined-final-02'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(n,x):
 p=W/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,indent=2)+'\n')
def row(p,n):
 s=p.lstat();v={'path':str(n),'mode':oct(stat.S_IMODE(s.st_mode))}
 if p.is_symlink():v.update(kind='symlink',target=os.readlink(p))
 else:
  assert p.is_file(),str(p);v.update(kind='file',bytes=s.st_size,sha256=sha(p))
 return v
def verify(p,x):
 a=row(p,x['path']);assert all(a.get(k)==x[k] for k in ['sha256','bytes','mode','target'] if k in x),(str(p),a,x);return a
def copied(src,dst,x):
 dst.parent.mkdir(parents=True,exist_ok=True)
 if src.is_symlink():
  assert src.resolve().is_relative_to(O/'stage'/T/'node_modules'),str(src)
  dst.symlink_to(os.readlink(src))
 else:shutil.copy2(src,dst)
 verify(dst,x);assert (src.lstat().st_dev,src.lstat().st_ino)!=(dst.lstat().st_dev,dst.lstat().st_ino)
try:
 assert not (W/'STOP.json').exists(); assert not (W/'stage').exists(); assert not (W/'source').exists()
 pins={'freeze.json':'245a11505b2c3f372da001fa0f3202d4554fea30d9d593e2fe3b5ede61906fe2','runner-source-inventory.json':'0a1ca82089f10f29ed87e7a36542f93cf7a6cb01684d88c7fd49f3018561a252','runner-dependencies-inventory.json':'5837cd319a0e1230c8a44f3f4c14d52f5eb6a4d7750d3e7261b20753b381fecb'}
 for n,d in pins.items():assert sha(O/n)==d,(n,sha(O/n),d)
 activation=json.loads((W/'activation.json').read_text()); owned=set(activation['source_paths'])
 old=json.loads((O/'runner-source-inventory.json').read_text())['files']; deps=json.loads((O/'runner-dependencies-inventory.json').read_text())['files']
 assert len(old)==1319 and len(deps)==4576
 physical=Path(activation['physical_root']);assert not physical.exists() and not physical.is_symlink()
 assert physical.parent.resolve()==Path('/private/tmp');assert not W.is_relative_to(physical) and not physical.is_relative_to(W)
 rows=[];delta=[]
 for x in old:
  p=x['path'];assert 'continuation17' not in p and 'continuation-17' not in p
  verify(O/'source'/p,x);current=row(R/p,p)
  if current.get('sha256')!=x.get('sha256'):
   if p.startswith(str(T/'code')+'/') or p.startswith(str(T/'scripts')+'/') or p in [str(T/'package.json'),str(T/'package-lock.json'),str(T/'tsconfig.json')]:assert p in owned,('unselected code input differs',p)
   delta.append({'before':x,'after':current,'selectedSource':p in owned})
  rows.append(current)
 main=json.loads((W.parent/'u1-c0-physical-currentness-01/main-generated-preimage.json').read_text())
 mainrows=main['files'] if isinstance(main,dict) else main
 for x in mainrows:verify(R/x['path'],x)
 assert len(mainrows)==936
 for x in deps:verify(O/'stage'/T/'node_modules'/x['path'],x)
 for x in rows:
  copied(R/x['path'],W/'source'/x['path'],x);copied(R/x['path'],W/'stage'/x['path'],x)
 for x in deps:copied(O/'stage'/T/'node_modules'/x['path'],W/'stage'/T/'node_modules'/x['path'],x)
 for x in deps:
  p=W/'stage'/T/'node_modules'/x['path']
  if p.is_symlink():assert p.resolve().is_relative_to(W/'stage'/T/'node_modules')
 physical.mkdir()
 for name in ['commands','artifacts','tmp','npm-cache','npm-logs']:(W/name).mkdir(exist_ok=True)
 write('source-inputs.json',{'kind':'complete exact current selected source set','root':str(W/'source'),'files':rows,'closedPredecessorPins':pins,'deltaFromClosedFinal02':delta})
 write('dependency-inputs.json',{'kind':'independent copied exact dependencies','root':str(W/'stage'/T/'node_modules'),'files':deps,'count':len(deps),'noSharedInodes':True})
 write('main-generated-preservation-before.json',{'files':mainrows,'count':936,'verified':True})
 write('resource-preflight.json',{'physicalParent':str(physical),'absentBeforeCreation':True,'canonicalParent':str(physical.parent.resolve()),'stageSourceRows':len(rows),'dependencyRows':len(deps),'retainedBytesAtPreparation':sum(x.get('bytes',0)*2 for x in rows)+sum(x.get('bytes',0) for x in deps),'limitBytes':10737418240})
 print(json.dumps({'source':len(rows),'dependencies':len(deps),'delta':len(delta),'main936':'unchanged','stage':str(W/'stage'),'physicalParent':str(physical)}))
except BaseException:
 write('STOP.json',{'kind':'preparation precondition/effect failure','traceback':traceback.format_exc(),'disposition':'stopped before repair or retry'});raise
