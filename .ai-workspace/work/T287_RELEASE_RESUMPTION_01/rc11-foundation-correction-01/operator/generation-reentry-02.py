from pathlib import Path
import json,hashlib,subprocess,os,stat,time,signal,shutil
O=Path(__file__).parent;F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T=F/'build_tenants/abiogenesis/typescript'
P=O.parents[1]/'rc11-qualification-01';old=P/'local-cut-03/DEPENDENCY_METADATA.json';recipe=P/'local-cut-03/stage-dependencies.py'
def pin(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def record(n,x):
 with (O/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
assert pin(old)['sha256']=='76e95e5611c5c96c9069ffe231865f35e0abcb2d73e38fae4015a10911922ad1'
m=json.loads(old.read_text());dest=T/'node_modules';assert stat.S_ISLNK(dest.lstat().st_mode);target=os.readlink(dest);assert Path(target)==Path(m['donorRoot'])
m['reproductionRoot']=str(dest);record('DEPENDENCY_METADATA.successor.json',m);mp=pin(O/'DEPENDENCY_METADATA.successor.json')
prior=json.loads((O/'GENERATION_ADMISSION.json').read_text());env={**os.environ,**prior['environment'],'GIT_OPTIONAL_LOCKS':'0','npm_config_offline':'true','NPM_CONFIG_AUDIT':'false','NPM_CONFIG_FUND':'false'}
node=prior['node']['path'];commands=[('dependency-preflight',['python3',str(recipe),'verify',mp['path'],mp['sha256'],str(dest)],120),('dependency-copy',['python3',str(recipe),'copy',mp['path'],mp['sha256'],str(dest)],120),('product-manifest-02',[node,'scripts/generate-product-manifest.mjs'],600),('qualification-law-02',[node,'--experimental-vm-modules','--test','--test-reporter=tap','--test-concurrency=1','test_env/tests/t287-qualification-law.test.mjs'],600)]
record('ROOT_GENERATION_REENTRY_02.json',{'id':'FOUNDATION-GENERATION-02','status':'ROOT_ADMITTED_CONTROL_INPUT_REENTRY','cause':'Existing generator line460 refuses symlink-resolved bundled dependency outside exact package root. No Product source defect.','failure':pin(O/'product-manifest.json'),'stderr':pin(O/'product-manifest.stderr'),'priorReturn':pin(O/'GENERATION_RETURN.json'),'symlink':{'path':str(dest),'target':target,'lstatConfirmedSymlink':True},'metadata':mp,'unchangedRecipe':pin(recipe),'effect':'Unlink only exact successor symlink, then existing copytree/copy2 metadata-preserving copy; resume manifest and unexecuted qualification-law test only. No compile repetition.','commands':[{'id':n,'argv':a,'timeoutSeconds':s} for n,a,s in commands]})
results=[]
for name,argv,cap in commands:
 assert shutil.disk_usage(F).free>4*1024**3
 if name=='dependency-copy':assert dest.is_symlink() and os.readlink(dest)==target;dest.unlink()
 start=time.monotonic();out=O/(name+'.stdout');err=O/(name+'.stderr')
 with out.open('xb') as so,err.open('xb') as se:
  p=subprocess.Popen(argv,cwd=T,env=env,stdout=so,stderr=se,start_new_session=True)
  try:rc=p.wait(timeout=cap)
  except subprocess.TimeoutExpired:
   os.killpg(p.pid,signal.SIGTERM)
   try:p.wait(timeout=3)
   except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()
   rc='timeout'
 try:os.killpg(p.pid,0);absent=False
 except ProcessLookupError:absent=True
 r={'id':name,'argv':argv,'exitCode':rc,'elapsedSeconds':time.monotonic()-start,'groupAbsent':absent,'stdout':pin(out),'stderr':pin(err)};results.append(r);record(name+'.json',r);print(json.dumps(r),flush=True)
 if rc!=0 or not absent or out.stat().st_size+err.stat().st_size>16*1024**2:
  record('GENERATION_REENTRY_RETURN.json',{'status':'STOPPED','results':results});raise SystemExit(1)
record('GENERATION_REENTRY_RETURN.json',{'status':'PASSED','results':results,'claim':'generated authority/manifest readiness and focused test only; no qualification/release'})
