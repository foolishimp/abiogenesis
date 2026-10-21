from pathlib import Path
import copy, datetime, hashlib, json, os, stat, subprocess

R = Path(__file__).resolve().parent
W = R.parent.parent
P = W / 'realization/final-proof-preparation-01'
E = W / 'realization/l4-final-candidate-04'
B = W / 'realization/baseline-diagnostics-01'
T = Path('/private/tmp/abg-stdo3-candidate-diag-947f3a62d1ce48b0')
sha = lambda b: hashlib.sha256(b).hexdigest()
obj = lambda p: json.loads(Path(p).read_text())

def pin(p, expected=None):
    p = Path(p)
    b = p.read_bytes()
    value = dict(path=str(p), sha256=sha(b), bytes=len(b), mode=oct(stat.S_IMODE(p.stat().st_mode)))
    if expected is not None:
        assert value['sha256'] == expected, str(p)
    return value

def write(p, value):
    with Path(p).open('x') as f:
        json.dump(value, f, indent=2)
        f.write('\n')

assert not T.exists()
pins = {
    'design': pin(W.parents[2] / 'build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md', 'cb8dae9f7e684f9b6be730b74125294524ecd7e4d1f035fc03734d7ff1d1160b'),
    'L2': pin(W / 'L2-execution-contract.md', '65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'),
    'preparation': pin(P / 'freeze.json', 'e7bf015a4cc2bf9246d2aedd9800a8b0c41aef5255b5b30fdfd78a69627b12aa'),
    'launcher': pin(P / 'diagnostic-runner.mjs', '1ee5db3e8640b1c2cd5e4acab4249d710f61415c42fa00ca40a12595674792fa'),
    'preload': pin(P / 'diagnostic-preload.mjs', '5420045ebd31cb00bb27ab408e623cd141b3a8691d4a2e8b24f058c821c90852'),
    'probes': pin(P / 'diagnostic-probes.mjs', 'b54dc5c3b1da3016c4113a0edfc9929f433491c095445939c0e98cdd2731da01'),
    'analyse': pin(P / 'diagnostic-analyse.mjs', 'dad5f922ffe6df46bd223774603b24c8c535918d33db1dc66a0254c0af969da0'),
    'runner': pin(W / 'proof/run-installed.mjs', 'fb20ffc2a5f3bdfcbbbebc51e68d17ac1ec52b4fc20093aaa652efcfd84a7164'),
    'oracle': pin(W / 'realization/proof/oracle.mjs', 'dee13b0b642c9b3184d5ed27a5ee1bbd07a951c19b7481469bc4a681aff995dc'),
    'endpoints': pin(E / 'return.json', '9f655bfdd4c8f0f970b4f189015a1840a7628faff7d7c2641b8499f9024928b6'),
    'endpointsFreeze': pin(E / 'freeze.json', 'e58e78c1a3c1b4086ba5d5f16dd1676105c99059a5fc31377c00eaa37e24fbce'),
    'candidateFreeze': pin(W / 'realization/c0-potential-effect-successor-06/freeze.json', '80c749e3ad666b8d6ae08e9b4c4f8e56a274072926f1005e6d8049b40b5671cd'),
    'baselineP1Coverage': pin(B / 'p1-coverage-successor-02/freeze.json', '0270d388acf82cc8555edb6e38e148686288e949931498b87300ed2fe162560c'),
    'baselineP3': pin(B / 'p3/freeze.json', 'eaefd2bc14601f4d2e71a67e1df572f4c2082be7ec33c0d6451c87c256b50fef'),
    'method': pin('/Users/jim/Library/Application Support/STDO/releases/v3.0.0-rc.1/manifest.json', '069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232'),
    'correspondence': pin(P / 'output-correspondence.json'),
    'archiveClosure': pin(E / 'intake/archive-closure.json'),
}

write(R / 'activation.json', {
    'activation': 'FINAL-CANDIDATE-DIAGNOSTICS-01', 'issuedBy': '/root', 'writer': '/root/stdo3_final_proof_writer',
    'returnTo': '/root', 'role': 'Proof and measurement Writer; no independent Reviewer or acceptance authority',
    'frame': 'repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration',
    'productFrame': 'Fixed fifteen-family ABI5.0, GOAL035/T287 common-library prerequisite. GTL declares, HoG traverses, exact owners perform effects, ABG admits, replay projects. This observation/evidence surface establishes bounded deterministic workload and cost only. No rival runtime, semantic acceptance, F_P/F_H claim or release decision.',
    'basis': 'stdo://releases/v3.0.0-rc.1/', 'manifestSha256': pins['method']['sha256'], 'composition': [],
    'effect': 'One fresh P1 then one fresh P3 passive repetition of unchanged runner/oracle against final06; compact records, fresh runtime/trace roots and explicit empty offline caches. No source/build/pack/Git/provider effects or cleanup.',
    'stop': 'First integration/assertion/attachment/owner/oracle/coverage failure returns to Root before another lane, repair or retry.',
    'maxAdditionalRetainedBytes': 10 * 1024**3, 'retryCount': 0,
    'nodeOptions': 'Outer launch explicitly NODE_OPTIONS empty; original explicit runtime environment omits NODE_OPTIONS as immutable launcher/preload require. Root confirmed this distinction.',
    'pins': pins, 'utc': datetime.datetime.now(datetime.timezone.utc).isoformat()
})
with (R / 'HOW.md').open('x') as f:
    f.write('''# Candidate passive diagnostics\n\nProduct Frame: fixed ABI5.0 fifteen-family Product; active T287 common-library L4 observation only. GTL/HoG/exact owner/ABG/fresh replay authority is unchanged. No semantic or release acceptance is inferred.\n\n```mermaid\nsequenceDiagram\n  participant G as Frozen grant\n  participant D as Existing diagnostic launcher\n  participant R as Original installed runner\n  participant O as Installed owners and ABG\n  participant P as Passive observer\n  G->>D: Exact final06 subject, endpoint, fresh resources\n  D->>R: Same P1 or P3 workload and oracle\n  R->>O: Ordinary preparation or declared F_D execution\n  O-->>R: Owner results, admitted prefix, fresh replay\n  P-->>D: Per-PID counters and native filesystem trace\n  R-->>D: Original result and retained resources\n```\n\nThe original configuration and effect-grant contracts are instantiated with fresh roots, run identities, empty offline cache and distinct empty npmrc files. The passive configuration uses the existing prepared contract. Stage/package/support bytes are referenced unchanged; the original runner performs its own required inventory preflight. The observer attaches only after exact module authentication and keeps original bodies and oracles unchanged.\n\nExternal tar archive-list/member-read and du footprint edges use the closed baseline coverage rule and remain uninstrumented. Actual archive identities are bound through their producers after successful work, never normalized away. Unexpected edges or failed observations return to Executive. Existing measurement.md and output-correspondence.json govern units, overlaps, unsized channels, original scopes and limitations. No repeated baseline, P4 or speed threshold.\n\nNo concurrent host workload is controlled by this proof. Start/end load snapshots are context, not causal attribution or an isolated overhead estimate. Physical roots and raw outputs remain retained.\n''')

baseChildren = obj(B / 'p3/diagnostic-configuration.json')['childCommands']
node = obj(E / 'p1/configuration.json')['toolchains']['node']
pin(node['path'], node['sha256'])
for child in baseChildren:
    if 'script' in child: pin(child['script']['path'], child['script']['sha256'])
for short, lane, endpointSha in [
    ('p1', 'public-preparation', '231d13b475ac77dd4c1468500aa73a2639233822e7252014105d84ae6acf74fc'),
    ('p3', 'declared-execution', 'fb9f5208b6cc3396ddeee320a9e89eb3ef7e365f18dddd2cd8c8bcfe0e731aea')]:
    L = R / short
    L.mkdir()
    original = obj(E / short / 'configuration.json')
    oldResult = obj(E / short / 'result.json')
    assert oldResult['status'] == 'satisfied' and oldResult['lane'] == lane
    actualEndpoint = pin(oldResult['actualResult']['path'], endpointSha)
    assert obj(actualEndpoint['path'])['status'] == 'satisfied'
    runtime = copy.deepcopy(original)
    runtime['activationFile'] = str(L / 'runtime-effect-grant.json')
    roots = {k: str(T / short / k) for k in original['lanes'][lane]['roots']}
    runtime['lanes'][lane] = {'runId': 't287-candidate-diag-' + short + '-947f3a62d1ce48b0', 'roots': roots}
    runtime['environment']['npm_config_cache'] = str(T / 'caches' / short)
    for kind in ['user', 'global']:
        p = L / (kind + '.npmrc')
        with p.open('x'): pass
        runtime['environment']['npm_config_' + kind + 'config'] = str(p)
    assert 'NODE_OPTIONS' not in runtime['environment']
    write(L / 'runtime-configuration.json', runtime)
    cache = {'root': runtime['environment']['npm_config_cache'], 'seed': {'kind': 'explicit_empty_seed', 'files': []}, 'closure': pins['archiveClosure'], 'globalCacheRead': False, 'globalCacheWrite': False, 'networkFallback': False, 'effects': 'offline npm content/index/tmp/log writes only', 'retain': True}
    grant = dict(kind='t287_installed_proof_effect_grant', status='granted', issuedBy='/root', activation='FINAL-CANDIDATE-DIAGNOSTICS-01', subjectId='candidate', configurationSha256=pin(L / 'runtime-configuration.json')['sha256'], runnerSha256=pins['runner']['sha256'], oracleSha256=pins['oracle']['sha256'], lanes=[lane], resources={lane: roots}, maxNativePositiveCalls=0, retryCount=0, cleanup=False, npmCache=cache, maxAdditionalRetainedBytes=10*1024**3)
    write(L / 'runtime-effect-grant.json', grant)
    stage = Path(runtime['subject']['stageTenant'])
    emitted = [{'member': x, 'sha256': pin(stage / x)['sha256']} for x in ['build/code/src/abg/runtime_history.js', 'build/code/src/abg/event_prefix.js', 'build/code/src/shared/canonical_json.js']]
    for item in [runtime['subject'][k] for k in ['archive','manifest','packageInventory','supportManifest']] + runtime['subject']['inventories']:
        pin(item['path'], item['sha256'])
    required = [pins[k] for k in ['candidateFreeze','endpoints','endpointsFreeze','correspondence','archiveClosure','baselineP1Coverage','baselineP3']]
    required += [pin(E / short / name) for name in ['configuration.json','effect-grant.json','freeze.json','result.json']]
    required += [pin(L / (kind + '.npmrc')) for kind in ['user','global']]
    diag = dict(kind='t287_passive_diagnostic_configuration',status='activated',activationFile=str(L/'diagnostic-effect-grant.json'),subjectId='candidate',lane=lane,diagnosticRoot=str(T/short/'diagnostic'),node=node,preload=pins['preload'],probes=pins['probes'],originalRunner=pins['runner'],originalOracle=pins['oracle'],originalConfiguration=pin(L/'runtime-configuration.json'),originalGrant=pin(L/'runtime-effect-grant.json'),referenceEndpoint=actualEndpoint,requiredPins=required,moduleRoots=[str(stage),*roots.values()],emittedModules=emitted,childCommands=baseChildren)
    write(L / 'diagnostic-configuration.json', diag)
    write(L / 'diagnostic-effect-grant.json',dict(kind='t287_passive_diagnostic_effect_grant',status='granted',issuedBy='/root',activation='FINAL-CANDIDATE-DIAGNOSTICS-01',configurationSha256=pin(L/'diagnostic-configuration.json')['sha256'],launcherSha256=pins['launcher']['sha256'],nativeCalls=0,diagnosticRoot=diag['diagnosticRoot'],runtimeRoots=roots,cache=cache,retryCount=0,cleanup=False,stop='First actual failure returns to Root before next lane or repair'))
    oldEvidence = Path(original['lanes'][lane]['roots']['evidence'])
    reference = {'endpointConfiguration':pin(E/short/'configuration.json'),'endpointGrant':pin(E/short/'effect-grant.json'),'endpointResult':actualEndpoint,'wrapperResult':pin(E/short/'result.json'),'measurement':pin(oldEvidence/'measurements.json'),'rawTime':pin(E/short/'stderr-time.txt')}
    if short == 'p1': reference['ownerState']=pin(oldEvidence/'p1-owner-state.json','506cc1088d44acd3fd981d6518d85b3f94760a379889ddeebe1c8b2b3004ccf1')
    write(L / 'reference-endpoint.json', reference)
    write(L / 'coverage-contract.json',dict(status='frozen_before_execution',subjectId='candidate',lane=lane,allowedDuRoots=list(roots.values()),externalTarForms=['tar -tzf actual verified archive','tar -xOzf actual verified archive named package member'],members=['package/product-toolchain-manifest.json','package/package.json','package/contracts/capabilities/capability-definition-graph.json'],archiveRule='Candidate exact configured archive plus one actual fixture archive bound through P1 setup/owner state or P3 installed-environment/artifact receipts and source. Full source package bytes and archive inventory retained.',requirements=['Original result and oracle satisfied','Exact lane and zero native calls','All preloaded child PIDs have observation and trace; no probe errors','All three emitted module identities observed and exact','P1 selected Program and ten operation labels/contracts/outcomes equal reference; P3 literal Hello World and fresh reads exact','External tar/du omission boundary preserved'],unexpectedChildren='stop to Root',limits='External tar/du per-PID CPU/memory/IO unobserved; spawn return is not exit status. Native trace and JS byte channels overlap; unsized is not zero. No summed maxima or OS-wide total.'))
    local = [pin(p) for p in sorted(L.iterdir()) if p.is_file()]
    write(L / 'input-freeze.json',dict(status='frozen_before_execution',files=local,dependencies=required,emittedModules=emitted,runtimeRootsInitiallyAbsent=all(not Path(x).exists() for x in roots.values()),diagnosticRootInitiallyAbsent=not Path(diag['diagnosticRoot']).exists(),cacheSeedFiles=0))

write(R/'preflight.json',dict(status='satisfied',pins=pins,physicalRoot=str(T),physicalRootInitiallyAbsent=True,sourceInventoryRepetition=False,originalRunnerOwnPreflightRetained=True,emptyCaches=True,npmConfigDistinct=True,utc=datetime.datetime.now(datetime.timezone.utc).isoformat()))
print(json.dumps({'status':'satisfied','root':str(R),'physicalRoot':str(T),'p1Configuration':pin(R/'p1/diagnostic-configuration.json'),'p3Configuration':pin(R/'p3/diagnostic-configuration.json')}))
