from pathlib import Path
import hashlib, json, os, subprocess, sys, time
R=Path(__file__).resolve().parent;L=R/sys.argv[1]
obj=lambda p:json.loads(Path(p).read_text())
def write(p,v):
    with p.open('x') as f:json.dump(v,f,indent=2);f.write('\n')
def pin(p):
    p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
assert obj(L/'process-result.json')['exitCode']==0
c=obj(L/'diagnostic-configuration.json');runtime=obj(c['originalConfiguration']['path']);evidence=Path(runtime['lanes'][c['lane']]['roots']['evidence'])
assert obj(evidence/'result.json')['status']=='satisfied'
O=R/'operations'/L.name;O.mkdir(parents=True)
commands=[
 ('analyse',[c['node']['path'],str(R.parent/'final-proof-preparation-01/diagnostic-analyse.mjs'),c['diagnosticRoot']]),
 ('coverage',[sys.executable,str(R/'check-coverage.py'),str(L)]),
 ('retain',[sys.executable,str(R.parent/'baseline-diagnostics-01/retain-diagnostic.py'),str(L)]),
 ('measure',[sys.executable,str(R/'measure-and-close.py'),str(L)])]
for name,argv in commands:
    write(O/(name+'.command.json'),{'argv':argv,'cwd':str(R),'script':pin(argv[1]),'noRuntimeRepeat':True})
    env=dict(os.environ);env['NODE_OPTIONS']=''
    start=time.monotonic()
    with (O/(name+'.stdout')).open('xb') as out,(O/(name+'.stderr')).open('xb') as err:
        child=subprocess.Popen(argv,cwd=R,env=env,stdout=out,stderr=err);rc=child.wait()
    write(O/(name+'.result.json'),{'exitCode':rc,'pid':child.pid,'wallMs':(time.monotonic()-start)*1000,'stdout':pin(O/(name+'.stdout')),'stderr':pin(O/(name+'.stderr'))})
    print(json.dumps({'phase':name,'exitCode':rc}),flush=True)
    if rc!=0:
        print((O/(name+'.stdout')).read_text()[-3000:]);print((O/(name+'.stderr')).read_text()[-3000:]);sys.exit(rc)
print((O/'measure.stdout').read_text(),end='')
