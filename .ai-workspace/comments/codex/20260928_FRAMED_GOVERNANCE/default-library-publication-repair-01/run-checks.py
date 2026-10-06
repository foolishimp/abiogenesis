import json,os,subprocess,time,sys
from pathlib import Path
N=Path(__file__).resolve().parent;root=N/'component';node='/opt/homebrew/Cellar/node/24.7.0/bin/node';env=os.environ.copy();env.update({'TMPDIR':str(N/'tmp'),'npm_config_cache':str(N/'cache'),'GIT_OPTIONAL_LOCKS':'0','NODE_OPTIONS':''})
names=['default library preserves cumulative wrapper bindings and rejects duplicate carried refs','installed root publication precondition rejects a bad non-selected publication','default catalogue publishes conditional purposes over fixed native/C2 children and mandatory parent evaluation']
steps=[('compile',[node,str(root/'node_modules/typescript/bin/tsc'),'-p',str(root/'tsconfig.json'),'--declaration','false','--incremental','false','--pretty','false'],120),('helper-syntax',[node,'--check',str(root/'test_env/support/root-installed-environment.mjs')],30),('test-syntax',[node,'--check',str(root/'test_env/tests/t287-default-library.test.mjs')],30),('pure-named-tests',[node,'--test','--test-reporter=tap','--test-name-pattern=^(?:'+'|'.join(names)+')$',str(root/'test_env/tests/t287-default-library.test.mjs')],60)]
results=[]
for label,command,cap in steps:
 with (N/(label+'-command.json')).open('x') as f:json.dump({'command':command,'cwd':str(root),'timeoutSeconds':cap,'selectedNames':names if label=='pure-named-tests' else None,'HOMEUnchanged':env.get('HOME')==os.environ.get('HOME'),'componentOnly':True},f,indent=2)
 began=time.monotonic()
 with (N/(label+'.stdout')).open('x') as out,(N/(label+'.stderr')).open('x') as err:
  p=subprocess.run(command,cwd=root,env=env,stdout=out,stderr=err,timeout=cap)
 result={'name':label,'exitCode':p.returncode,'elapsedMs':(time.monotonic()-began)*1000};results.append(result)
 with (N/(label+'-result.json')).open('x') as f:json.dump(result,f,indent=2)
 print(json.dumps(result),flush=True)
 if p.returncode:sys.exit(p.returncode)
with (N/'component-checks.json').open('x') as f:json.dump({'status':'passed','checks':results,'fullMixedFileRun':False,'selectedPureNames':names},f,indent=2)
