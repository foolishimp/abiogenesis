from pathlib import Path
import hashlib
import json
import difflib

D = Path(__file__).resolve().parent
G = D.parent
DONOR = G / 'final-c2-current-resource-caller-02'
def sha(b): return hashlib.sha256(b).hexdigest()
def put(name, value):
    data = value if isinstance(value, bytes) else (json.dumps(value, indent=2) + '\n').encode()
    with (D / name).open('xb') as f: f.write(data)
request = G / 'final-f11-native-assessment-controls-01/request.txt'
b = request.read_bytes()
assert len(b) == 6946 and sha(b) == '65861539ac2c4a1e76b8f83a097cc893e2a67cb0d816cb364670b901a4edcc22'
put('worker-activation.json', {'role':'Worker','activation':'T287_F11_NATIVE_CALLER_PREP_01',
    'actor':'/root/f11_validation_path_plan','grant':{'path':str(request),'bytes':len(b),'sha256':sha(b)},
    'writeTerritory':str(D),'governingMethod':'stdo://releases/v2.5.1-rc.2/',
    'candidateLaw':'stdo://releases/v2.5.1-rc.1/','reentry':'realization_refactor',
    'effects':'External offline caller construction only; no native/provider/network/moving-resource operations',
    'resultAuthority':'Worker readiness only; Root owns follow-on native activation and acceptance'})
inputs = []
def consume(root, name):
    p = root / name; raw = p.read_bytes()
    freeze = json.loads((root / 'freeze.json').read_bytes())
    row = next(r for r in freeze['records'] if r['path'] == name)
    assert len(raw) == row['bytes'] and sha(raw) == row['sha256'], str(p)
    inputs.append({'path':str(p),'bytes':len(raw),'sha256':sha(raw)})
    return raw
def adapt(name, transform):
    before = consume(DONOR,name); after = transform(before.decode()).encode()
    (D/'preimages').mkdir(exist_ok=True)
    with (D/'preimages'/name).open('xb') as f: f.write(before)
    put(name,after)
    patch = ''.join(difflib.unified_diff(before.decode().splitlines(True),after.decode().splitlines(True),fromfile='donor/'+name,tofile='caller/'+name))
    put(name+'.patch',patch.encode())
for n in ['selected-core.json','prospective-cases.json','observe-process.py']:
    put(n,consume(DONOR,n))
env = json.loads(consume(DONOR,'runtime-environment.json'))
for k,v in list(env.items()):
    if str(DONOR) in v: env[k] = v.replace(str(DONOR),str(D))
put('runtime-environment.json',env)
retained = json.loads(consume(G/'final-native-continuation-04','retained-environment.json'))
slots = json.loads(consume(G/'final-native-continuation-04','runtime-slots.json'))
projection = json.loads(consume(DONOR,'offline-current-projection.json'))
handoff = json.loads(consume(G/'final-observed-c2-01','final-handoff.json'))
snapshot = consume(G/'final-observed-c2-01','failure-native-prefix.jsonl')
assert len(snapshot) == 5577377 and len(snapshot.decode().strip().splitlines()) == 84
assert sha(snapshot) == 'e2bb5df3f58b91a49f7324a487e9e79b93d05b03c368c339c82a6edc9d359ec0'
assert handoff['prefix']['coordinateDigest'] == 'sha256:81cefea619af712a416d8680efa40fc2bed1f3248460022e4e625eef0ed46c0c'
assert projection['prefix'] == handoff['prefix']
put('initial-handoff.json',handoff)
put('closed-current-environment.json',projection)
put('retained-catalog.json',retained['catalog'])
put('retained-slots.json',slots)
put('initial-resource-snapshot.json',{'path':str(G/'final-observed-c2-01/failure-native-prefix.jsonl'),
    'bytes':len(snapshot),'sha256':sha(snapshot),'events':84,'handoff':handoff})
def support(s):
    start=s.index("  assert.equal(selection.programRef, 'program://abiogenesis/worksite/command-execution@5'")
    end=s.index('  const policy = product.constructRootInvocationPolicy(',start)
    s=s[:start]+'''  assert.equal(selection.programRef, 'program://abiogenesis/qualification/assess@5');
  assert.equal(selection.selection.graphFunctionHandle, 'graph-function://abiogenesis/qualification/assess@5');
  assert.deepEqual([...declaredRegimes], ['F_P']);
  assert.equal(resolution.programValidation.executableLeafRows.length,1);
  assert.equal(resolution.programValidation.interactionLeafRows.length,0);
  assert.equal(resolution.program.policies['abg.run_environment'], undefined);
  assert.deepEqual(resolution.programPublication.runEnvironments, []);
''' + s[end:]
    s=s.replace('  const runEnvironmentResources=await environment.runEnvironmentResourceFactory({authority,resolution,declaration});\n','')
    s=s.replace('    runEnvironmentResources,\n','')
    return s
adapt('public-support.mjs',support)
def caller(s):
    s=s.replace('final-c2-current-resource-caller-02','final-f11-native-assessment-01')
    s=s.replace("'exact three-call population/order'","'exact assessment view/conformance/start/two-read population/order'")
    s=s.replace('async function prepareStart(programRef,graphFunctionHandle,inputFactory,label,runEnvironmentResourceFactory)', 'async function prepareStart(programRef,graphFunctionHandle,inputFactory,label)')
    s=s.replace('verified,runEnvironmentResourceFactory}', 'verified}')
    return s
adapt('ordinary-caller.mjs',caller)
def checks(s):
    start=s.index('export async function checkStart(')
    end=s.index('export async function checkReadCall(',start)
    return s[:start]+s[end:]
adapt('owner-checks.mjs',checks)
put('consumed-inputs.json',inputs)
put('resource-plan.json',{'status':'offline_preparation_no_native_grant','eventLogPath':handoff['reopenAuthority']['eventLogPath'],
    'initialCloseHandoff':handoff,'storeIdentity':handoff['prefix']['storeIdentity'],
    'originalLockNamespace':env['TMPDIR'],'lockDirectory':str(Path(env['TMPDIR'])/'abiogenesis-event-store-locks-v5'),
    'archiveRoot':projection['workspaceBinding']['roots']['archiveRoot'],
    'workspaceRoot':projection['workspaceAuthorityBasis']['canonicalRoot'],
    'rootActorRef':projection['workspaceBinding']['authorizedActorRef'],
    'ownedReports':str(D),'writeOriginalWorksite':False,'restartHello':False,'C2Calls':0,
    'nativeCalls':['assessment-view','conformance-assess','assess-rule','assess-rule-run_result','assess-rule-run_replay'],
    'activationGuard':'driver requires later Root-supplied native-activation.json matching closed caller and bound-input freezes before reading moving resource or invoking native CLI',
    'proof':'Only after actual admitted J; its slot/task/Program/invocation/Result select the native producer'})
print(json.dumps({'status':'constructed_donor_adaptation','inputs':len(inputs),'nativeCalls':0}))
