from pathlib import Path
import json,hashlib,subprocess,os,time,signal,shutil,stat
O=Path(__file__).parent;F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T=F/'build_tenants/abiogenesis/typescript'
def pin(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def record(n,x):
 with (O/n).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
b=json.loads((O/'ROOT_GENERATION_REENTRY_02.json').read_text());prior=json.loads((O/'GENERATION_ADMISSION.json').read_text());commands=b['commands'][1:]
assert pin(Path(b['unchangedRecipe']['path']))==b['unchangedRecipe'];assert pin(Path(b['metadata']['path']))==b['metadata']
env={**os.environ,**prior['environment'],'GIT_OPTIONAL_LOCKS':'0','npm_config_offline':'true','NPM_CONFIG_AUDIT':'false','NPM_CONFIG_FUND':'false'}
record('GENERATION_CONTINUATION_ADMISSION.json',{'status':'ROOT_ADMITTED_REMAINING_SEQUENCE','rootDisposition':'Existing FOUNDATION-GENERATION-02 grant remains effective; misplaced verification is a control-order error, not revoked authority. Preserve and proceed with exact unlink/copy/manifest/unexecuted test.','prior':pin(O/'ROOT_GENERATION_REENTRY_02.json'),'failedOrdering':pin(O/'GENERATION_REENTRY_RETURN.json'),'script':pin(__file__),'commands':commands})
dest=Path(b['symlink']['path']);assert stat.S_ISLNK(dest.lstat().st_mode);assert os.readlink(dest)==b['symlink']['target'];dest.unlink()
results=[]
for c in commands:
 assert shutil.disk_usage(F).free>4*1024**3
 start=time.monotonic();out=O/(c['id']+'.stdout');err=O/(c['id']+'.stderr')
 with out.open('xb') as so,err.open('xb') as se:
  p=subprocess.Popen(c['argv'],cwd=T,env=env,stdout=so,stderr=se,start_new_session=True)
  try:rc=p.wait(timeout=c['timeoutSeconds'])
  except subprocess.TimeoutExpired:
   os.killpg(p.pid,signal.SIGTERM)
   try:p.wait(timeout=3)
   except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()
   rc='timeout'
 try:os.killpg(p.pid,0);absent=False
 except ProcessLookupError:absent=True
 r={**c,'exitCode':rc,'elapsedSeconds':time.monotonic()-start,'groupAbsent':absent,'stdout':pin(out),'stderr':pin(err)};results.append(r);record(c['id']+'.json',r);print(json.dumps(r),flush=True)
 if rc!=0 or not absent or out.stat().st_size+err.stat().st_size>16*1024**2:
  record('GENERATION_CONTINUATION_RETURN.json',{'status':'STOPPED','results':results});raise SystemExit(1)
record('GENERATION_CONTINUATION_RETURN.json',{'status':'PASSED','results':results,'claim':'definition readiness only; no positive qualification/release'})
