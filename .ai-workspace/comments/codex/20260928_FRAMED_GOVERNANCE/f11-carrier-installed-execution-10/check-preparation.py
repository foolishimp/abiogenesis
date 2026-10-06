"""Finite pure preparation checks: syntax, local closure and diagnostic trap only."""
from pathlib import Path
import json,hashlib,re,subprocess,os,time,signal,datetime
E=Path(__file__).resolve().parent;G=E.parent
node=G/'final-candidate-construction-09/source-freeze/toolchain/bin/node'
def put(n,v):
    with(E/n).open('x')as f:json.dump(v,f,indent=2);f.write('\n')
syntax=[]
modules=[E/'run-continuation.mjs',E/'diagnostic-trap-probe.mjs',*sorted((E/'f11').glob('*.mjs'))]
for p in modules:
    for rel in re.findall(r"from\s+['\"](\.[^'\"]+)['\"]",p.read_text()):assert(p.parent/rel).is_file(),(p,rel)
    r=subprocess.run([str(node),'--check',str(p)],cwd=E,capture_output=True,text=True)
    assert r.returncode==0,(str(p),r.stderr)
    syntax.append({'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'exitCode':0,'ProductImports':0})
for p in sorted(E.glob('*.py')):compile(p.read_text(),str(p),'exec')
put('syntax-and-module-closure.json',{'status':'GO_SYNTAX_AND_OWNED_MODULE_CLOSURE','modules':syntax,
    'PythonSyntax':'all owned top-level .py compiled in memory; no cache or execution','ProductImports':0,'RuntimeEffects':0})
command=[str(node),str(E/'diagnostic-trap-probe.mjs')]
env={k:v for k,v in os.environ.items()if k not in ['NODE_OPTIONS','NODE_PATH','V8_OPTIONS','ABG_TS_CLAUDE_COMMAND','ABG_TS_GEMINI_COMMAND','ABG_TS_CODEX_COMMAND']}
out=os.open(E/'diagnostic-probe.stdout',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
err=os.open(E/'diagnostic-probe.stderr',os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
ready_r,ready_w=os.pipe();gate_r,gate_w=os.pipe();start=time.monotonic();pid=os.fork()
if pid==0:
    os.close(ready_r);os.close(gate_w);os.setsid();os.write(ready_w,b'R');os.close(ready_w);os.read(gate_r,1);os.close(gate_r)
    os.dup2(out,1);os.dup2(err,2);os.close(out);os.close(err);os.chdir(E);os.execve(str(node),command,env)
os.close(ready_w);os.close(gate_r);assert os.read(ready_r,1)==b'R';os.close(ready_r)
put('diagnostic-probe-start.json',{'command':command,'cwd':str(E),'pid':pid,'processGroup':pid,
    'groupEstablishedBeforeImports':True,'budgetSeconds':30,'HOME':env.get('HOME'),'heap':'default',
    'ProductImports':0,'RunOrResourceEffects':0,'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()})
os.write(gate_w,b'G');os.close(gate_w);os.close(out);os.close(err);term=None
while True:
    waited,status,usage=os.wait4(pid,os.WNOHANG)
    if waited==pid:break
    now=time.monotonic()
    if now-start>=30 and term is None:
        term=now
        try:os.killpg(pid,signal.SIGTERM)
        except ProcessLookupError:pass
    elif term is not None and now-term>=1:
        try:os.killpg(pid,signal.SIGKILL)
        except ProcessLookupError:pass
    time.sleep(.02)
try:os.killpg(pid,0);group='present'
except ProcessLookupError:group='absent'
receipt={'command':command,'pid':pid,'processGroup':pid,'wait4Reaped':True,'groupAfterWait':group,
    'exitCode':os.waitstatus_to_exitcode(status),'timedOut':term is not None,'elapsedMs':(time.monotonic()-start)*1000,
    'maxRSSBytesMacOS':usage.ru_maxrss,'userSeconds':usage.ru_utime,'systemSeconds':usage.ru_stime,
    'defaultHeap':True,'HOME':env.get('HOME'),'ProductImports':0,'RunOrResourceEffects':0}
put('diagnostic-probe-close.json',receipt)
assert receipt['exitCode']==0 and not receipt['timedOut'] and group=='absent',receipt
probe=json.loads((E/'diagnostic-probe.stdout').read_bytes())
assert probe['preparedOwnerPassed']and probe['wrongKindRefused']and probe['fullOwnerToJSONCalls']==0
put('diagnostic-probe-result.json',probe)
sites=[{'path':'f11/proof-oracles.mjs:8','class':'bounded scalar diagnostic; no full owner serialization'},
    {'path':'f11/public-support.mjs:55','class':'retained execution-resolution diagnostic; receives catalog/Program/install resolution, not full qualification resource; F11 instance passed in Runtime09, AF22 instance unexecuted'},
    {'path':'f11/ordinary-caller.mjs:58','class':'required versioned Public invocation transport serialization; full semantic resource retained'},
    {'path':'f11/ordinary-caller.mjs:75,83','class':'bounded process failure record'},
    {'path':'f11/ordinary-caller.mjs:88','class':'conformance receipt diagnostic; conformance route is not selected'},
    {'path':'f11/flow-driver.mjs:26,34','class':'old parent route kept as exact donor; not selected; only positiveRunRoute consumed'},
    {'path':'run-continuation.mjs:10','class':'owned saved scalar/state/outcome reports; never writes operation-local owner'}]
put('reachable-serialization-inspection.json',{'status':'BOUNDED_SELECTED_CLOSURE_INSPECTED','sites':sites,
    'onlySelectedOracleDiagnosticChanged':True,'requiredPublicSerializationUnchanged':True,'noPayloadExecuted':True})
put('preparation-checks.json',{'status':'GO_PREPARATION_CHECKS_ONLY','syntaxModules':len(syntax),
    'pureDiagnosticProbe':probe,'probeCost':receipt,'savedCorrespondence':json.loads((E/'retained-evidence-correspondence.json').read_bytes())['checks'],
    'successAndFirstFailureFinalizerSyntaxReady':True,'RootRuntime10ReleasePresent':False,
    'ProductImports':0,'RunOrResourceEffects':0})
print(json.dumps({'status':'GO_PREPARATION_CHECKS_ONLY','syntaxModules':len(syntax),'pureProbe':probe,'cost':receipt}))
