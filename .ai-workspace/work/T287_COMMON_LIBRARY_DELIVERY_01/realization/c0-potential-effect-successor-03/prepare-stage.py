from pathlib import Path
import os,json,hashlib,shutil,stat,traceback
R=Path('/Users/jim/src/apps/abiogenesis');W=Path(__file__).resolve().parent;O=W.parent/'c0-potential-effect-successor-02';B=W.parent/'combined-final-02';T=Path('build_tenants/abiogenesis/typescript')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(n,x):
 with (W/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def verify(p,x):
 s=p.lstat();assert oct(stat.S_IMODE(s.st_mode))==x['mode'],str(p)
 if 'sha256' in x:assert sha(p)==x['sha256'] and s.st_size==x['bytes'],str(p)
 else:assert p.is_symlink() and os.readlink(p)==x['target'],str(p)
def cp(src,dst,x):
 verify(src,x);assert not src.is_symlink();dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst);verify(dst,x);assert not os.path.samefile(src,dst)
def dirs(root):
 paths=[root]+[p for p in sorted(root.rglob('*')) if p.is_dir() and not p.is_symlink()]
 return [{'path':str(p.relative_to(root)),'mode':oct(stat.S_IMODE(p.stat().st_mode)),'mtime_ns':p.stat().st_mtime_ns,'dev':p.stat().st_dev,'inode':p.stat().st_ino} for p in paths]
try:
 assert not (W/'STOP.json').exists() and not (W/'stage').exists()
 assert sha(O/'freeze.json')=='7579fe86579c0c90e64cc02c497ae8d3e9c4af2aa90ee360bb3de55fe2c671bd'
 assert sha(B/'freeze.json')=='245a11505b2c3f372da001fa0f3202d4554fea30d9d593e2fe3b5ede61906fe2'
 src=json.loads((O/'source-inputs.json').read_text())['files'];stage=json.loads((O/'stage-stopped-inventory.json').read_text())['files'];deps=json.loads((B/'runner-dependencies-inventory.json').read_text())['files']
 for x in src:cp(O/'source'/x['path'],W/'source'/x['path'],x)
 dep_prefix=str(T/'node_modules')+'/'
 for x in stage:
  if not x['path'].startswith(dep_prefix):cp(O/'stage'/x['path'],W/'stage'/x['path'],x)
 donor=B/'stage'/T/'node_modules';dest=W/'stage'/T/'node_modules';before=dirs(donor)
 for x in deps:verify(donor/x['path'],x)
 shutil.copytree(donor,dest,symlinks=True,copy_function=shutil.copy2)
 after=dirs(dest);assert len(before)==len(after)
 for a,b in zip(before,after):
  assert all(a[k]==b[k] for k in ['path','mode','mtime_ns']),(a,b);assert (a['dev'],a['inode'])!=(b['dev'],b['inode'])
 for x in deps:
  verify(dest/x['path'],x);assert not os.path.samefile(donor/x['path'],dest/x['path'])
  if (dest/x['path']).is_symlink():assert (dest/x['path']).resolve().is_relative_to(dest)
 for x in stage:verify(W/'stage'/x['path'],x)
 a=json.loads((W/'activation.json').read_text());source_by={x['path']:x for x in src}
 for p in a['source_paths']:assert sha(R/p)==source_by[p]['sha256'],p
 physical=Path(a['physical_root']);assert not physical.exists() and not physical.is_symlink();physical.mkdir()
 for n in ['commands','tmp','npm-cache','npm-logs','artifacts']:(W/n).mkdir()
 write('source-inputs.json',{'root':str(W/'source'),'files':src,'exactSuccessfulCompilerInputSha256':sha(O/'source-inputs.json')})
 write('dependency-inputs.json',{'root':str(dest),'files':deps,'source':str(donor),'copiedIndependent':True,'noSharedWritableInodes':True})
 write('dependency-directory-metadata.json',{'source':str(donor),'destination':str(dest),'sourceRows':before,'copiedRows':after,'consumedFields':['mode','mtime_ns'],'allConsumedFieldsExact':True,'physicalIdentity':'copy identity is not source identity or runtime authority','hiddenLock':{'sha256':sha(dest/'.package-lock.json'),'mtime_ns':(dest/'.package-lock.json').stat().st_mtime_ns},'sourceLogRoute':'combined-final-02/npm-logs/2026-10-21T03_14_47_187Z-debug-0.log'})
 write('stage-pre-generation-inventory.json',{'root':str(W/'stage'),'files':stage,'allFileAndLinkBytesExactToSuccessfulCompiledStage':True,'newCompileCount':0})
 write('resource-preflight.json',{'physicalRoot':str(physical),'absentBeforeCreation':True,'initialChildren':[],'predecessorsLogicalBytes':410372372,'stageFiles':len(stage),'sourceFiles':len(src),'dependencies':len(deps),'dependencyDirectories':len(before),'limitBytes':10737418240})
 print(json.dumps({'stageFiles':len(stage),'sourceFiles':len(src),'dependencies':len(deps),'dependencyDirectories':len(before),'compileCount':0}))
except BaseException:
 write('STOP.json',{'kind':'metadata successor staging failure','traceback':traceback.format_exc(),'disposition':'stop before repair/retry'});raise
