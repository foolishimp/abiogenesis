from pathlib import Path
import copy, datetime, difflib, hashlib, json, os, shutil, stat
R=Path(__file__).resolve().parent;W=R.parent.parent;REPO=W.parents[2]
D=R.parent/'hog-ordinary-owner-driver-preparation-01';H=R.parent/'hog-retained-laws-proof-preparation-01'
C=R.parent/'c0-potential-effect-successor-06';E=R.parent/'l4-final-candidate-04'
S=C/'stage/build_tenants/abiogenesis/typescript';T=Path('/private/tmp/abg-stdo3-hog-fea4398de7a145e9')
sha=lambda b:hashlib.sha256(b).hexdigest();obj=lambda p:json.loads(Path(p).read_text())
def pin(p,expected=None):
    p=Path(p);b=p.read_bytes();v=dict(path=str(p),sha256=sha(b),bytes=len(b),mode=oct(stat.S_IMODE(p.stat().st_mode)))
    if expected is not None:assert v['sha256']==expected,str(p)
    return v
def write(p,x):
    with Path(p).open('x') as f:json.dump(x,f,indent=2);f.write('\n')
def normalized(row,path=None):
    v={k:copy.deepcopy(row[k]) for k in ['path','mode','bytes','sha256','target'] if k in row}
    if path is not None:v['path']=path
    v['type']=row.get('type',row.get('kind','file'))
    assert v['type'] in ['file','symlink']
    if v['type']=='file':assert all(k in v for k in ['bytes','sha256','mode'])
    else:assert 'target' in v and 'mode' in v
    return v

assert not T.exists()
pins={
 'driverPreparation':pin(D/'freeze.json','12239d043ac3ad63f65f844be2691601b5119ff0a90110bb273ed73a7f9c2243'),
 'supportPreparation':pin(H/'freeze.json','8c0af8cdc2e3ae01d12e05a3baf328ce1637093444659cf0b8540859c241e49b'),
 'candidateFreeze':pin(C/'freeze.json','80c749e3ad666b8d6ae08e9b4c4f8e56a274072926f1005e6d8049b40b5671cd'),
 'archive':pin(C/'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.1.tgz','25e7f390a899f3bd9c49fa11a15feba1f59cb2a1d2ba4bad1f62c1abc4224079'),
 'manifest':pin(S/'product-toolchain-manifest.json','a782e3bc49c703b3ea254e45edb54d3f7bf0402b42ff3bd34356dc0c13111ab4'),
 'rawArchiveMembers':pin(C/'archive-members.json','404c0be5cc48bbc85e5b80685c01072458c720a513aca5465f543d4f47b475fb'),
 'finalP1':pin('/private/tmp/abg-stdo3-final-04-6f42d9a31e5870bc/p1/evidence/result.json','231d13b475ac77dd4c1468500aa73a2639233822e7252014105d84ae6acf74fc'),
 'finalP1Freeze':pin(E/'p1/freeze.json','4793655ce521c45cc1d2e1cc11378430318b26df6e98e60f1f0eef0c9ed96011'),
 'finalP1Physical':pin(E/'p1/physical-resources.json','c408959e4751e2d316ec85d02bf217a5547f995c6b272eeadcd72026d170e6eb'),
 'source':pin(E/'intake/stage-source-inventory.json','1d4d796594268adc906f75f984958adab5a533f01357d5a7fb7e7e1dd4ca12dc'),
 'emitted':pin(C/'generated-inventory.json','b0b38bf971f06aaff83889f2f4dd4301b5e08fd8d1f503afc12fcc8b48349d99'),
 'dependencies':pin(C/'dependency-inputs.json','1bbaaf2dab1b689cf1540f7f04e27e8ccb9088a5d6d802d786c803a4ef4a9705'),
 'selectedSupport':pin(E/'intake/selected-support.json','00eff68a7329e05420c7669dac48fdbc717acca880a361e865aecb934b549665'),
 'protectedMain':pin(R.parent/'combined-final-01/protected-main-generated.json','b6273def4c3e1db1dcb5d350db81f65019bc8a07ca189c0ac08cf41655bc1b96'),
 'mainLatestClosedCheck':pin(C/'main-generated-preflight.json'),
 'mainIdentityBasis':pin(R.parent/'u1-c0-physical-currentness-01/main-generated-preimage.json','8838a89cc91b09a64e587294c7ce8c206d26543c099409503bb15e97a0828677'),
 'design':pin(REPO/'build_tenants/abiogenesis/typescript/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md','cb8dae9f7e684f9b6be730b74125294524ecd7e4d1f035fc03734d7ff1d1160b'),
 'L2':pin(W/'L2-execution-contract.md','65f4007521634d808a3fd94bc87707ae4183ddb00ec4ec0da49e37381ee403c1'),
 'runner':pin(D/'run.mjs','ac3ce1aa03a9b7b47184a25d9338300be87b5a4a606573a3e364a53a7376c7c7'),
 'oracle':pin(D/'oracle.mjs','871bb6ad42dac58effa9deb211e07afd1886ed6b8d8c3291c54dc15b2389162b'),
 'originalInspected':pin(D/'inspected-inputs.json','603969137ea499c886fab2cd9d466ff427290fcaf4c6130e73ad4111c0e2abc5'),
 'methodManifest':pin('/Users/jim/Library/Application Support/STDO/releases/v3.0.0-rc.1/manifest.json','069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232')
}
assert obj(pins['finalP1']['path'])['status']=='satisfied' and obj(pins['finalP1']['path'])['subjectId']=='candidate'
authority=[pin(REPO/p) for p in ['AGENTS.md','stdo_abiogenesis.json','specification/PRODUCT.md','specification/GOALS.md','.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md','specification/requirements/abg/REQ-R-ABG3-EVENTS.md','specification/requirements/abg/REQ-R-ABG3-PROJECTION.md','specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md','build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md']]
write(R/'activation.json',dict(activation='HOG-FINAL06-BINDING-01',issuedBy='/root',writer='/root/stdo3_final_proof_writer',returnTo='/root',status='preparation_only',frame='repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration',productFrame='Fixed fifteen-family ABI5.0; T287 common-library prerequisite. Ordinary F_D compose/retry, workflow foldback and partial fan-out must pass declared owners, ABG admission and fresh replay. GTL remains sole Program; no rival runtime, private writer, provider or success inferred from blocked truth.',methodBasis='stdo://releases/v3.0.0-rc.1/',composition=[],pins=pins,currentAuthority=authority,effects='New compact binding records, exact original runner/oracle copies, translated inventory metadata and finite existing cache seed inventory only. No cache copy/install/traversal/build/pack/Git/old-cut mutation.',maxAdditionalRetainedBytes=4*1024**3,stop='First source or precondition mismatch returns to Root before repair or runtime.',utc=datetime.datetime.now(datetime.timezone.utc).isoformat()))
for name in ['run.mjs','oracle.mjs']:
    shutil.copy2(D/name,R/name)
    assert pin(R/name)['sha256']==pin(D/name)['sha256']

inspected=obj(D/'inspected-inputs.json');changes=[];pairs=[]
changed='test_env/support/root-installed-environment.mjs'
for group in ['support','owners']:
    for row in inspected[group]:
        before=copy.deepcopy(row);relative=row['tenantRelativePath'];expected='e7bcbfd831e1e710c6b4c0cee6eeeb1bf3d245b4409cc9cc4089ead21d0239d3' if relative==changed else row['sha256']
        actual=pin(S/relative,expected)
        if relative!=changed:assert actual['bytes']==row['bytes'] and actual['mode']==row['mode']
        else:
            assert row['sha256']=='18dc4b6b428a4925924fe04de28eba3e7a8e0727bb749649e91e1df857c6490e' and actual['bytes']==40294
            delta=''.join(difflib.unified_diff(Path(row['path']).read_text().splitlines(True),(S/relative).read_text().splitlines(True),fromfile=row['path'],tofile=str(S/relative)))
            with (R/'support-binding.diff').open('x') as f:f.write(delta)
            changes.append(dict(before=before,after=actual,rootDisposition='Approved by HOG-FINAL06-BINDING-01: only setupInstalledRootInvocation existingEnvironment and invocationRef override changed; the original driver directly calls unchanged setupInstalledRootCatalog. No new runtime law or helper repair.'))
        row.update(actual);row['tenantRelativePath']=relative
        pairs.append(dict(group=group,relative=relative,oldSha256=before['sha256'],newSha256=actual['sha256'],changed=relative==changed))
assert len(pairs)==21 and len(changes)==1
inspected['meaning']='Final06 support/owner binding. Historical authority entries remain original inspection context; activation.json currentAuthority governs this activation. Exactly one Root-attributed support delta; all other inspected bytes unchanged.'
inspected['bindingDisposition']=changes
write(R/'inspected-inputs.json',inspected)
write(R/'support-binding.json',dict(status='bound_under_root_disposition',pairs=pairs,changes=changes,originalDriver=pin(R/'run.mjs'),unreachableChangedHelper='runCase uses setupInstalledRootCatalog directly; no setupInstalledRootInvocation call appears in the frozen driver',inspectedInputs=pin(R/'inspected-inputs.json')))

prefix='build_tenants/abiogenesis/typescript/'
sourceRows=obj(pins['source']['path'])['files'];within=[normalized(x,x['path'][len(prefix):]) for x in sourceRows if x['path'].startswith(prefix)];outside=[x for x in sourceRows if not x['path'].startswith(prefix)]
assert len(within)==1214 and len(outside)==106
write(R/'source-inventory.json',dict(files=within,sourceCarrier=pins['source'],translation='Remove exact build_tenants/abiogenesis/typescript/ path prefix; all file identities/modes preserved.',outsideTenantContextRows=outside,outsideScope='Context rows remain pinned through the original whole-stage inventory and candidate freeze; not silently promoted into this tenant-relative driver inventory.'))
emittedRows=obj(pins['emitted']['path'])['files'];assert all(x['path'].startswith(prefix) for x in emittedRows)
write(R/'emitted-inventory.json',dict(files=[normalized(x,x['path'][len(prefix):]) for x in emittedRows],sourceCarrier=pins['emitted'],translation='kind -> type; remove exact tenant prefix; hashes, bytes and modes unchanged'))
deps=obj(pins['dependencies']['path'])['files'];write(R/'dependency-inventory.json',dict(files=[normalized(x,'node_modules/'+x['path']) for x in deps],sourceCarrier=pins['dependencies'],translation='Prefix node_modules/; preserve internal symlink targets and all original metadata'))
sourceByPath={x['path']:x for x in within};supportPaths=set(x['path'] for x in obj(pins['selectedSupport']['path'])['files'])|set(x['tenantRelativePath'] for x in inspected['support'])
supportRows=[sourceByPath[p] for p in sorted(supportPaths)];assert len(supportRows)==17
write(R/'support-inventory.json',dict(files=supportRows,sourceCarrier=pins['source'],selection='Closed finalP1 support set plus three structural helper/declaration/leaf members required by the original HoG driver',selectedSupport=pins['selectedSupport'],inspectedBinding=pin(R/'inspected-inputs.json')))
mainRows=[normalized(x) for x in obj(pins['protectedMain']['path'])['files']];baseline=obj(pins['mainIdentityBasis']['path']);assert len(mainRows)==len(baseline)==936
mainMap={x['path']:x for x in mainRows}
for x in baseline:assert all(mainMap[x['path']][k]==x[k] for k in ['bytes','sha256'])
write(R/'protected-main-inventory.json',dict(files=mainRows,sourceCarrier=pins['protectedMain'],latestClosedCheck=pins['mainLatestClosedCheck'],identityBasis=pins['mainIdentityBasis'],translation='kind -> type only; closed mode inventory joined to final06 preserved 936 byte identities; no current main scan in binding'))

raw=obj(pins['rawArchiveMembers']['path']);assert len(raw['files'])==5271
shutil.copy2(C/'archive-members.json',R/'raw-tar-inventory.json');assert pin(R/'raw-tar-inventory.json')['sha256']==pins['rawArchiveMembers']['sha256']
packagePin=pin(S/'package.json');bins=obj(S/'package.json')['bin'];targets=sorted(set(x.removeprefix('./') for x in bins.values()));assert targets==['build/code/src/public/cli.js','build/code/src/public/codex_cli.js']
rawMap={x['path']:x for x in raw['files']};assert rawMap['package.json']['sha256']==packagePin['sha256']
physical=obj(pins['finalP1Physical']['path'])['files'];p1Host=Path('/private/tmp/abg-stdo3-final-04-6f42d9a31e5870bc/p1/host/node_modules/@abiogenesis/typescript-tenant');physicalMap={x['path']:x for x in physical};modeChanges=[];expectedRows=[]
for row in raw['files']:
    expected=normalized(row)
    if row['path'] in targets:
        before=int(row['mode'],8) if isinstance(row['mode'],str) else row['mode'];assert before==0o644
        expected['mode']=oct(before|0o111)
        observed=physicalMap[str(p1Host/row['path'])]
        assert observed['mode']=='0o755' and observed['sha256']==row['sha256'] and observed['bytes']==row['bytes']
        modeChanges.append(dict(path=row['path'],archiveMode=row['mode'],expectedInstalledMode=expected['mode'],sha256=row['sha256'],bytes=row['bytes'],actualFinalP1=observed))
    expectedRows.append(expected)
assert len(modeChanges)==2
write(R/'installed-expected-inventory.json',dict(files=expectedRows,rawTar=pins['rawArchiveMembers'],packageJson=packagePin,declaredBins=bins,modeChanges=modeChanges,relation='Exact raw tar names/count/bytes/all other modes; only the two declared bin targets gain execute bits under npm extraction even with --bin-links=false.',actualFinalP1Physical=pins['finalP1Physical']))
write(R/'installed-mode-relation.json',dict(status='root_selected_explicit_binding_correction',rawTar=pin(R/'raw-tar-inventory.json'),installedExpected=pin(R/'installed-expected-inventory.json'),modeChanges=modeChanges,archiveMembers=5271,rule='Installed metadata is checked against explicit npm-derived installed expectation, not falsely equated to raw tar modes. No chmod, package, runtime or original driver/oracle change.'))

cache=Path('/private/tmp/abg-stdo3-final-04-6f42d9a31e5870bc/caches/p1');cacheRows=[]
for row in physical:
    p=Path(row['path'])
    if row['type']!='file' or not p.is_relative_to(cache):continue
    relative=str(p.relative_to(cache))
    if not (relative.startswith('_cacache/content-v2/') or relative.startswith('_cacache/index-v5/')):continue
    actual=pin(p,row['sha256']);assert actual['bytes']==row['bytes'] and actual['mode']==row['mode']
    cacheRows.append(normalized(row,relative))
assert len(cacheRows)==8 and sum(x['bytes'] for x in cacheRows)==10690996
write(R/'npm-cache-seed-inventory.json',dict(files=cacheRows,sourceRoot=str(cache),actualFinalP1Physical=pins['finalP1Physical'],selection='Only finite finalP1 _cacache content-v2 and index-v5 regular files; exclude logs, notifier and temp. No ambient cache or copying in this activation.'))

manifest=obj(S/'product-toolchain-manifest.json')
write(R/'candidate-record.json',dict(status='ready_for_separately_granted_L4',subjectId='candidate',archive=pins['archive'],manifest=pins['manifest'],productContentDigest=manifest['productContentDigest'],archiveMembers=5271,adapterMeaning='Driver readiness-coordinate adapter to already closed final06 archive/source and actual finalP1 result; not a new HoG execution result, acceptance or relabelling of prior failure.',sourceFreeze=pins['candidateFreeze'],actualPrerequisite=pins['finalP1'],rawArchiveInventory=pin(R/'raw-tar-inventory.json'),installedModeRelation=pin(R/'installed-mode-relation.json')))
config=obj(D/'configuration.NOT_GRANTED.json');config['activationFile']=str(R/'execution/effect-grant.json');config['subject'].update(stageTenant=str(S),freeze=pins['candidateFreeze'],candidateRecord=pin(R/'candidate-record.json'),archive=pins['archive'],manifest=pins['manifest'],productContentDigest=manifest['productContentDigest'],packageInventory=pin(R/'installed-expected-inventory.json'))
config['subject']['inventories']=[dict(role=role,**pin(R/name),root=str(S)) for role,name in [('source','source-inventory.json'),('emitted','emitted-inventory.json'),('dependencies','dependency-inventory.json'),('support','support-inventory.json')]]
config['protectedMain']=dict(**pin(R/'protected-main-inventory.json'),root=str(REPO));config['npmCacheSeed']=dict(**pin(R/'npm-cache-seed-inventory.json'),root=str(cache));config['prerequisites']=[pins['finalP1']]
for kind in ['user','global']:
    p=R/(kind+'.npmrc')
    with p.open('x'):pass
    config['environment']['npm_config_'+kind+'config']=str(p)
for tool in config['toolchains'].values():
    actual=pin(tool['path'],tool['sha256']);assert actual['bytes']==tool['bytes'] and actual['mode']==tool['mode']
write(R/'configuration.NOT_GRANTED.json',config)
grant=obj(D/'effect-grant.NOT_GRANTED.json');grant.update(configurationSha256=pin(R/'configuration.NOT_GRANTED.json')['sha256'],inspectedInputsSha256=pin(R/'inspected-inputs.json')['sha256'],npmCacheSeed=config['npmCacheSeed'],maxAdditionalRetainedBytes=4*1024**3,preparationActivation='HOG-FINAL06-BINDING-01',preparationOnly=True)
write(R/'effect-grant.NOT_GRANTED.json',grant)
write(R/'commands.NOT_GRANTED.json',dict(status='NOT_GRANTED',prospectiveArgv=['/usr/bin/time','-l',config['toolchains']['node']['path'],str(R/'run.mjs'),str(R/'execution/configuration.json')],cwd=str(R/'execution'),stdout=str(R/'execution/driver.stdout'),stderr=str(R/'execution/driver.stderr'),outerEnvironmentOverride={'NODE_OPTIONS':''},runtimeEnvironment='Exact explicit config environment omits NODE_OPTIONS and ABG_TS_CLAUDE_COMMAND; case cache assigned by original driver.',activationTransition='Root independently verifies binding, separately grants execution, then new execution/configuration.json has status activated and new execution/effect-grant.json has status granted with that exact configuration digest. Preserve all NOT_GRANTED bytes.',cases=grant['cases'],optionalLawTestsSelected=False,nativeProviderCalls=0,retryCount=0,cleanup=False))
with (R/'HOW-binding.md').open('x') as f:
    f.write('''# Final06 ordinary HoG binding\n\nProduct Frame: fixed fifteen-family ABI5.0; active T287 common-library prerequisite. This preparation binds the existing compose/retry, workflow-foldback and fan-out partial-stop proof. GTL declares, HoG traverses, exact owners perform effects, ABG admits, and fresh Public reads project admitted truth. No native actor, optional law suite, release acceptance or new runtime is selected.\n\nReuse the sequence, three independent oracles and failure boundary in ../hog-ordinary-owner-driver-preparation-01/HOW.md and case-map.json unchanged. Final06 and its actual finalP1 predecessor are the only execution subjects. Source/emitted/dependency/support and protected-main carriers are explicit format/path translations of closed inventories; no broad stage/main scan occurs during binding. The original driver's preflight still checks their actual files before effects.\n\nRoot admitted one support binding delta: root-installed-environment.mjs 18dc4b6b… -> e7bcbfd8…. Only setupInstalledRootInvocation's existingEnvironment and invocationRef overrides changed. The unchanged driver calls setupInstalledRootCatalog directly; it never calls the changed helper. The 20 remaining inspected support/owner pairs match exactly. Full attributed delta and raw diff are retained.\n\nThe package verifier's installed expectation is explicitly derived from the unchanged raw 5,271-member tar inventory. npm extraction makes the two package.json-declared bin targets executable: cli.js and codex_cli.js, 0644 -> 0755. Every member name, byte identity, byte length and other mode remains exact. FinalP1's actual installed receipts establish this relation. Raw tar metadata remains separately pinned; neither package bytes nor the original driver/oracle changes.\n\nThe candidate-record adapter satisfies the original driver's readiness-carrier contract using final06's actual manifest/content/archive and closed finalP1 proof. It makes no HoG result or acceptance claim. The finite seed consists only of the eight actual finalP1 _cacache content/index files. It has been inventoried but not copied. The later granted driver copies it to each new owned cache; offline/no-script settings and distinct empty user/global npmrc files prevent ambient cache/network fallback and npm config aliasing.\n\nThe NOT_GRANTED configuration and grant cannot execute. Root receives this exact preparation for independent binding verification and a separate execution activation. All future runtime roots remain absent under /private/tmp/abg-stdo3-hog-fea4398de7a145e9. No current install, traversal, pack, build, provider, Git or cleanup effect occurred.\n''')
write(R/'return.json',dict(status='bound_for_root_verification_NOT_GRANTED',activation='HOG-FINAL06-BINDING-01',configuration=pin(R/'configuration.NOT_GRANTED.json'),effectGrantDraft=pin(R/'effect-grant.NOT_GRANTED.json'),commands=pin(R/'commands.NOT_GRANTED.json'),runner=pin(R/'run.mjs'),oracle=pin(R/'oracle.mjs'),inspectedInputs=pin(R/'inspected-inputs.json'),modeRelation=pin(R/'installed-mode-relation.json'),rawTar=pin(R/'raw-tar-inventory.json'),installedExpected=pin(R/'installed-expected-inventory.json'),candidateRecord=pin(R/'candidate-record.json'),cacheSeed=config['npmCacheSeed'],sourceRows=len(within),contextRowsRetained=len(outside),emittedRows=len(emittedRows),dependencyRows=len(deps),supportRows=len(supportRows),protectedMainRows=len(mainRows),inspectedPairs=21,attributedSupportChanges=1,cacheSeedFiles=len(cacheRows),cacheSeedBytes=sum(x['bytes'] for x in cacheRows),physicalRoot=str(T),physicalRootAbsent=not T.exists(),effects='Binding records only; no cache copy/install/traversal/build/pack/Git/provider or old-cut changes',resultConsumer='/root',next='Root verifies exact binding and separately authorizes execution; Writer stops.'))
write(R/'freeze.json',dict(status='closed_preparation_only',files=[pin(p) for p in sorted(R.iterdir()) if p.is_file()],dependencies=list(pins.values()),currentAuthority=authority,utc=datetime.datetime.now(datetime.timezone.utc).isoformat(),runtimeExecuted=False))
print(json.dumps({'status':'bound_for_root_verification_NOT_GRANTED','return':pin(R/'return.json'),'freeze':pin(R/'freeze.json'),'configuration':pin(R/'configuration.NOT_GRANTED.json'),'inspectedInputs':pin(R/'inspected-inputs.json'),'runtimeRootAbsent':not T.exists()}))
