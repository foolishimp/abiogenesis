from pathlib import Path
import hashlib,json,os,shutil,stat,traceback
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-realization-01';T=Path('build_tenants/abiogenesis/typescript')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def verify(p,x):
 st=p.lstat();assert oct(stat.S_IMODE(st.st_mode))==x['mode'],str(p)
 if 'sha256' in x:assert sha(p)==x['sha256'] and st.st_size==x['bytes'],str(p)
 else:assert p.is_symlink() and os.readlink(p)==x['target'],str(p)
def copy(src,dst,x,scope):
 verify(src,x);dst.parent.mkdir(parents=True,exist_ok=True)
 if src.is_symlink():assert src.resolve().is_relative_to(scope);dst.symlink_to(os.readlink(src))
 else:shutil.copy2(src,dst)
 verify(dst,x);assert (src.lstat().st_dev,src.lstat().st_ino)!=(dst.lstat().st_dev,dst.lstat().st_ino)
try:
 assert not (W/'STOP.json').exists() and not (W/'stage').exists()
 assert sha(O/'freeze.json')=='8f19f66fa30a969f4cf00352cde8e1d9cf2b0a18c037e8a22baa076982663563'
 original=json.loads((O/'source-inputs.json').read_text());deps=json.loads((O/'dependency-inputs.json').read_text())['files'];source=[]
 target='build_tenants/abiogenesis/typescript/code/src/abg/worksite_revision.ts';activation=json.loads((W/'activation.json').read_text())
 assert sha(R/target)==activation['afterimageSha256']
 for x in original['files']:
  verify(O/'source'/x['path'],x);new=dict(x);src=O/'source'/x['path']
  if x['path']==target:src=R/target;new.update(sha256=sha(src),bytes=src.stat().st_size)
  source.append(new);copy(src,W/'source'/x['path'],new,O/'source');copy(src,W/'stage'/x['path'],new,O/'source')
 for x in deps:copy(O/'stage'/T/'node_modules'/x['path'],W/'stage'/T/'node_modules'/x['path'],x,O/'stage'/T/'node_modules')
 assert len(source)==1319 and len(deps)==4576
 for x in deps:
  p=W/'stage'/T/'node_modules'/x['path']
  if p.is_symlink():assert p.resolve().is_relative_to(W/'stage'/T/'node_modules')
 main=json.loads((O/'main-generated-preservation-after.json').read_text())['files']
 for x in main:assert sha(R/x['path'])==x['sha256'],x['path']
 physical=Path(activation['physical_root']);assert not physical.exists() and not physical.is_symlink();assert physical.parent.resolve()==Path('/private/tmp/abg-c0-potential-25ac62e990e141ce');physical.mkdir()
 for n in ['commands','tmp','npm-cache','npm-logs','artifacts']:(W/n).mkdir()
 write('source-inputs.json',{'root':str(W/'source'),'files':source,'predecessorSourceInputsSha256':sha(O/'source-inputs.json'),'delta':[{'path':target,'before':activation['preimageSha256'],'after':activation['afterimageSha256']}],'other1318SourceRecordsExact':True})
 write('dependency-inputs.json',{'root':str(W/'stage'/T/'node_modules'),'files':deps,'noSharedWritableInodes':True,'allLinksContained':True})
 write('main-generated-preservation-before.json',{'count':936,'files':main,'verified':True})
 write('resource-preflight.json',{'physicalRoot':str(physical),'absentBeforeCreation':True,'canonicalParent':str(physical.parent.resolve()),'initialChildren':[],'predecessorLogicalBytes':184816977,'sourceRows':len(source),'dependencyRows':len(deps),'newCopyLogicalBytes':sum(x.get('bytes',0)*2 for x in source)+sum(x.get('bytes',0) for x in deps),'limitBytes':10737418240})
 print(json.dumps({'source':len(source),'dependencies':len(deps),'main936':'unchanged','physicalRoot':str(physical)}))
except BaseException:
 write('STOP.json',{'kind':'successor preparation failure','traceback':traceback.format_exc(),'disposition':'stop before repair/retry'});raise
