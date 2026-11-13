from pathlib import Path
import subprocess, os, json, hashlib, time, signal, shutil
F=Path('/private/tmp/abg-rc11-foundation-20261110-01');T=F/'build_tenants/abiogenesis/typescript'
O=Path('/Users/jim/src/apps/abiogenesis/.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc11-foundation-correction-01/operator')
node='/opt/homebrew/Cellar/node/24.7.0/bin/node'
def pin(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def record(name,x):
 with (O/name).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
assert not (O/'GENERATION_ADMISSION.json').exists()
assert shutil.disk_usage(F).free>4*1024**3
scratch=F/'.foundation-generation';scratch.mkdir();(scratch/'tmp').mkdir();(scratch/'npm-cache').mkdir()
environment={**os.environ,'GIT_OPTIONAL_LOCKS':'0','NODE_OPTIONS':'--max-old-space-size=8192','TMPDIR':str(scratch/'tmp'),'NPM_CONFIG_CACHE':str(scratch/'npm-cache'),'NPM_CONFIG_OFFLINE':'true','npm_config_offline':'true','NPM_CONFIG_AUDIT':'false','NPM_CONFIG_FUND':'false','PATH':'/opt/homebrew/Cellar/node/24.7.0/bin:/opt/homebrew/bin:/usr/bin:/bin'}
commands=[
 ('tsc',[node,str(T/'node_modules/typescript/bin/tsc'),'-p','tsconfig.json'],600),
 ('qualification-authorities',[node,'scripts/generate-qualification-rule-catalog.mjs','--stage-authorities',str(F),'/Users/jim/Library/Application Support/STDO/releases/v3.0.4'],300),
 ('product-manifest',[node,'scripts/generate-product-manifest.mjs'],600),
 ('qualification-law',[node,'--experimental-vm-modules','--test','--test-reporter=tap','--test-concurrency=1','test_env/tests/t287-qualification-law.test.mjs'],600),
]
record('GENERATION_ADMISSION.json',{'owner':'Root','decision':'FOUNDATION-BASIS-01 generator extension and one focused qualification-law invocation; no positive qualification verdict','subject':str(F),'script':pin(__file__),'node':pin(node),'compiler':pin(T/'node_modules/typescript/bin/tsc'),'generators':[pin(T/'scripts/generate-qualification-rule-catalog.mjs'),pin(T/'scripts/generate-product-manifest.mjs')],'commands':[{'id':n,'argv':a,'timeoutSeconds':s} for n,a,s in commands],'outputs':['build/','contracts/','product-toolchain-manifest.json',str(scratch),str(O)],'reserveBytes':4*1024**3,'outputCapBytes':16*1024**2,'environment':{k:environment[k] for k in ['NODE_OPTIONS','TMPDIR','NPM_CONFIG_CACHE','NPM_CONFIG_OFFLINE','PATH']}})
results=[]
for name,argv,cap in commands:
 assert shutil.disk_usage(F).free>4*1024**3
 start=time.monotonic();out=O/(name+'.stdout');err=O/(name+'.stderr')
 with out.open('xb') as so,err.open('xb') as se:
  p=subprocess.Popen(argv,cwd=T,env=environment,stdout=so,stderr=se,start_new_session=True)
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
  record('GENERATION_RETURN.json',{'status':'STOPPED','results':results});raise SystemExit(1)
record('GENERATION_RETURN.json',{'status':'PASSED','results':results,'claim':'compiler, generated authority definitions and one focused test only; no runtime qualification or release'})
