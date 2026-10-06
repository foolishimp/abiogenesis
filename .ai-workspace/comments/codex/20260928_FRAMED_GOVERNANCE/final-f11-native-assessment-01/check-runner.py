from pathlib import Path
import subprocess, os, signal, time, json, ast
D=Path(__file__).resolve().parent
started=time.monotonic()
jobs=[('offline-readiness',['node','--max-old-space-size=4096',str(D/'offline-readiness.mjs')])]
jobs += [('syntax-'+n,['node','--check',str(D/n)]) for n in ['driver.mjs','ordinary-caller.mjs','public-support.mjs','native-checks.mjs','owner-checks.mjs']]
for label,argv in jobs:
    began=time.monotonic()
    with (D/(label+'.stdout')).open('xb') as out,(D/(label+'.stderr')).open('xb') as err:
        p=subprocess.Popen(['python3',str(D/'observe-process.py'),str(D/(label+'.process.json')),*argv],cwd=D,stdout=out,stderr=err,start_new_session=True)
        try: code=p.wait(timeout=min(120,300-(time.monotonic()-started)))
        except subprocess.TimeoutExpired:
            os.killpg(p.pid,signal.SIGTERM)
            try: p.wait(timeout=1)
            except subprocess.TimeoutExpired: os.killpg(p.pid,signal.SIGKILL);p.wait()
            raise
    assert code==0,(label,code,(D/(label+'.stderr')).read_text())
    assert time.monotonic()-started<300
for n in ['prepare.py','finalize-prep.py','observe-process.py','check-runner.py']:
    ast.parse((D/n).read_text(),filename=str(D/n))
(D/'check-summary.json').write_text(json.dumps({'status':'PASSED','jobs':[j[0] for j in jobs],
 'pythonSyntax':True,'aggregateElapsedMs':round((time.monotonic()-started)*1000,3),
 'driverImported':False,'nativeCalls':0,'movingResourceReads':0},indent=2)+'\n')
print(json.dumps({'status':'PASSED','elapsedMs':round((time.monotonic()-started)*1000,3)}))
