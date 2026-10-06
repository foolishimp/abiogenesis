from pathlib import Path
import json,hashlib,stat,os,difflib,datetime,shutil
repo=Path('/Users/jim/src/apps/abiogenesis')
base=repo/'.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE'
report=base/'native-declaration-applicability-realization-01'
assert not (report/'freeze.json').exists()
def digest(b):return hashlib.sha256(b).hexdigest()
def pin(p,relative=None):
    if p.is_symlink():
        t=os.readlink(p);return {'path':relative or str(p),'kind':'symlink','target':t,'sha256':digest(t.encode()),'mode':stat.S_IMODE(p.lstat().st_mode)}
    b=p.read_bytes();return {'path':relative or str(p),'kind':'file','bytes':len(b),'sha256':digest(b),'mode':stat.S_IMODE(p.stat().st_mode)}
def save(name,value):
    p=report/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(value,indent=2)+'\n')
activation=json.loads((report/'activation.json').read_text())
preimages=json.loads((report/'preimages.json').read_text())
mutables=[Path(x) for x in activation['writeTerritory'][:3]]
postimages=[]
for p in mutables:
    relative=p.relative_to(repo);before=report/'preimages'/relative
    after=report/'postimages'/relative;after.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,after)
    copied=report/'copied-tenant'/p.relative_to(repo/'build_tenants/abiogenesis/typescript')
    assert pin(p)['sha256']==pin(copied)['sha256']==pin(after)['sha256']
    delta=''.join(difflib.unified_diff(before.read_text().splitlines(keepends=True),p.read_text().splitlines(keepends=True),fromfile='preimage/'+str(relative),tofile='postimage/'+str(relative)))
    target=report/'diffs'/(p.name+'.diff');target.parent.mkdir(exist_ok=True);target.write_text(delta)
    postimages.append({'source':pin(p),'snapshot':pin(after,str(after.relative_to(report))),'preimage':pin(before,str(before.relative_to(report))),'diff':str(target.relative_to(report))})
save('postimages.json',{'kind':'exact_three_authorized_postimages','records':postimages})
# Fresh authority preserves WHAT, other HOW, and all historical accepted/failed cuts.
oldpins=json.loads((base/'native-declaration-applicability-how-01/pins.json').read_text())['records']
fresh=[];unexpected=[]
for old in oldpins:
    p=Path(old['path']);current=pin(p);changed=(current['sha256'],current.get('bytes'),current['mode'])!=(old['sha256'],old.get('bytes'),old['mode'])
    classification='authorized source increment' if p in mutables else 'Root-owned T287 tracking progress' if str(p).endswith('/.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md') else 'unchanged reference'
    if changed and classification=='unchanged reference':unexpected.append(str(p))
    fresh.append({'reference':old,'current':current,'changed':changed,'classification':classification})
assert not unexpected,unexpected
save('readiness/source-authority-freshness.json',{'passed':True,'records':fresh,'originalHOWPins':len(fresh),'WHATandOtherNativeOwnersConserved':True,'sourceLinkedRC1MapUsed':False})
freezeReferences=[]
for name,filename,expected in [('C03','final-candidate-construction-03/final-freeze.json','a4095d2a472f234d32bf063c5433b59003c536d66455ebed011ef7f7472f8d8a'),('Runtime03','f11-carrier-installed-execution-03/freeze.json','4be65227944eebcf0d07d2434a943e8dd61489349f2952d31fd0e4d7c2d5f0ef'),('HOW','native-declaration-applicability-how-01/freeze.json','3c6fe0f069ade5386eb95d583bceaddadd7b8a27a7255fdc925c1d60a4b425d3')]:
    p=base/filename;assert pin(p)['sha256']==expected
    j=json.loads(p.read_text());matched=[]
    for record in j['records']:
        member=p.parent/record['path'];actual=pin(member)
        assert (actual.get('bytes'),actual['sha256'],actual['mode'])==(record.get('bytes'),record['sha256'],record['mode']),str(member)
        matched.append(actual)
    freezeReferences.append({'name':name,'freeze':pin(p),'recordsChecked':len(matched),'recordBytes':sum(x.get('bytes',0) for x in matched),'passed':True})
save('readiness/preserved-freezes.json',{'passed':True,'records':freezeReferences,'credit':'preserved evidence cuts only; no rerun, restamping or successor identity'})
# Every copied input remains separately pinned, including inherited C03 dependencies/toolchain.
preparation=json.loads((report/'readiness/preparation.json').read_text())
inputFresh=[]
for record in preparation['inputs']:
    p=Path(record['input']['path']);actual=pin(p)
    expected=record['input']
    if actual!=expected:
        assert p in mutables and p.name=='m5-s06-prime.test.mjs',(actual,expected)
        inputFresh.append({'historicalPreparation':expected,'finalAuthorizedOverlay':actual,'reason':'Root-selected zero-owner physical-relation fixture propagation; previous exact test body retained in focused-native-failed-test-01.mjs'})
    else:inputFresh.append(actual)
node=Path(activation['node']['path']);assert pin(node)['sha256']==activation['node']['sha256']
save('readiness/input-freshness.json',{'passed':True,'preparedInputs':len(inputFresh),'inputs':inputFresh,'node':pin(node),'sourceOverlay':'final repaired test overlay is captured in postimages.json and exact report inventory; initial overlay copy retained in failed-test snapshot'})
checks={}
for name in ['compile-01','focused-native-01','focused-direct-native-02','conservation-01','touched-test-syntax-01','declaration-comparison-03','assertion-conservation-02']:
    checks[name]=json.loads((report/'commands'/f'{name}.json').read_text())
for name in ['compile-01','focused-direct-native-02','conservation-01','touched-test-syntax-01','declaration-comparison-03','assertion-conservation-02']:assert checks[name]['passed'] and checks[name]['reaped']
assert not checks['focused-native-01']['passed']
focused=(report/'commands/focused-native-01.stdout.txt').read_text(); assert 'pass 43' in focused and 'fail 1' in focused and 'skipped 0' in focused
assert 'skipped 0' in (report/'commands/focused-direct-native-02.stdout.txt').read_text()
conserved=json.loads((report/'proof/focused.json').read_text());assert conserved['passed'] and len(conserved['reports'])==11
pub=json.loads((report/'proof/declaration-conservation.json').read_text());assert pub['passed'] and pub['nativeRows']==37 and pub['emittedDeclarationFiles']==261
assertions=json.loads((report/'proof/assertion-conservation.json').read_text());assert assertions['passed'] and assertions['originalAssertions']==122
save('readiness/summary.json',{'status':'SOURCE_MECHANICALLY_READY','coherentSubject':'three exact postimages; current test overlay; production compiled once with frozen C03 source/tools','compile':{'passed':True,'seconds':checks['compile-01']['elapsedSeconds']},'focusedNative':{'selectedExistingTests':5,'newParentTests':1,'newSubcases':38,'initialPasses':43,'initialFailures':1,'initialFailurePreserved':'readiness/first-source-readiness-failure.json','affectedTestRerunPassed':True,'unaffectedInitialPassesCarried':True,'skips':0,'allSelectedFinalDispositions':'passed'},'conservation':{'passed':True,'cases':conserved['reports'],'completeOrderedOutputBytesEqual':True,'skips':0},'declarations':{'passed':True,'emittedFiles':261,'nativeRows':37,'completeNativeInventoriesExactC03':True,'generatedContractAndCapabilityConservation':'pending successor generation and actual packaged C03 comparison; frozen source versus generated installed populations explicitly separated'},'assertionConservation':{'originalAssertions':122,'exactOriginalCalls':121,'oneInputPropagation':'duplicateAlpha exact target evidence is nested inside original actual-expression; expected oracle and description bytes unchanged','allOriginalOraclesPreserved':True},'lint':{'productionTS':'not applicable: existing finite lint accepts only mjs/json; full isolated TypeScript compile passed','touchedMJS':'node --check passed initially; final affected test parser/execution passed'},'cost':{'defaultHeapUnchanged':True,'allRequiredProcessesReaped':True,'commands':{k:{f:v[f] for f in ['elapsedSeconds','deadlineSeconds','exitCode','timedOut','childUserCPUSeconds','childSystemCPUSeconds','childMaxResidentSetSizePlatformBytes']} for k,v in checks.items()}},'effects':'only exact three mutable source/design/test paths and this new report territory','limits':['source readiness only','no successor candidate/archive/install generated','no actual installed Public singleton/mixed lock','no F11 child invocation/physical append/J closure','no cold QUAL056/AF22 integrated/release/network claim','no Hello rerun or accepted cut restamping']})
return_text='''# CLOSED source Worker return

Worker T287_NATIVE_DECLARATION_APPLICABILITY_SOURCE_01 returns one coherent mechanically ready source cut under the adopted NativeDefinition/NCC-F02 design_reframe. Product Frame is fixed15/GOAL035/T287, F01/F05/F13/F11, operative STDO2.5.1RC2; selected frame is `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration`, composed NativeDefinition/Design/Identity/Effects/Proof/Cost.

Only the exact three granted paths changed: present-tense existing package-owned design, private applicability/metadata factors within `product/declaration_exports.ts`, and one existing source-unit test file. WHAT, Public signatures/carriers, verifier, environment forwarding, owners and original all-Product/dependency/global boundaries remain. Metadata integrity precedes native selection; actual advertisements must agree with exact identity-matched evidence. Genuine empty Products retain metadata and original indexes but contribute no declaration host/package selection. Genuine native ownership and external occurrence semantics remain.

Frozen Node/C03 compiler built the complete isolated C03 source population with the three postimages. Five original native tests plus the new applicability parent/38 meaningful subcases have passing final dispositions: the first run's 43 passes carry, and its one zero-owner fixture failure is preserved and repaired by Root-selected independent local native root. The affected original test rerun passes. All eleven exact C03-baseline conservation cases pass with complete ordered output bytes equal and no skips. All 261 emitted declarations and all 37 native-row declaration inventories equal actual packaged C03 bytes. All 122 original assertion oracles remain; 121 exact original call bodies remain and the authorized duplicateAlpha evidence setup changes only its nested actual-input arrangement.

Three fixture arrangements propagate the complete relation: empty intermediate gains exact current root metadata; duplicateAlpha gains its matching evidence contract without changing the ambiguous_dependency oracle; zero-owned physical relation retains its original external source/closure while gaining a separate genuinely local native root/contract. Zero-owned physical meaning is distinct from a zero-native verified Product. No production weakening, direct authority addition or assertion weakening occurs. Exact failed/prepared subjects, commands, costs, preimages/postimages, tool/input pins and diffs remain in this freeze.

C03 source inputs and C03 generated installed contract/capability/authority payloads are distinct populations. This Worker proves emitted Native/public declaration conservation and preserves source inputs; successor construction must regenerate current authority/capability/manifest outputs and compare actual wrapper rows to packaged C03. It does not assume generated-row conservation. C03, Runtime03 and HOW freeze records freshly match; other Native/WHAT authority pins match apart from this increment and explicit Root tracking progress.

Root alone independently assures/adopts this source cut and separately activates successor construction. Actual installed verify, singleton/mixed Public locks, F11 child and physical-prefix/J/closure proof, cold QUAL056/AF22, integrated qualification and release/network facts remain subsequent work. No Hello rerun, provider action, candidate/install/Git/runtime mutation or accepted evidence restamping occurred. Source Worker is CLOSED and stops; no Reviewer activation.
'''
(report/'return.md').write_text(return_text)
save('closure.json',{'status':'CLOSED','role':'Worker','activation':activation['activation'],'workResult':'source_ready_for_independent_review','consumer':'Root Executive /root','scope':'exact three postimages plus this report','noFurtherEdits':True,'reviewerActivated':False,'sourceAccepted':False,'sourceAcceptanceOwner':'Root after independent Source review','readiness':'readiness/summary.json','return':'return.md','at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
# Exact report population: everything, including retained failed preparations/tests/comparisons.
records=[]
for p in sorted(report.rglob('*')):
    if p.is_file() or p.is_symlink():records.append(pin(p,str(p.relative_to(report))))
freeze={'status':'CLOSED','activation':activation['activation'],'actor':activation['actor'],'role':'Worker','workResult':'source_ready_for_independent_review','productFrame':activation['productFrame'],'frame':activation['frame'],'owner':'NativeDefinition/NCC-F02','changeClass':'design_reframe','frozenAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourcePostimages':postimages,'readiness':'readiness/summary.json','return':'return.md','closure':'closure.json','records':records,'recordCount':len(records),'recordBytes':sum(x.get('bytes',0) for x in records),'outsideTerritoryEffects':[],'sourceAccepted':False,'stop':'no further edits or Reviewer activation; Root independently assures and constructs distinct successor'}
save('freeze.json',freeze)
# Readback only after freeze; no mutable report additions thereafter.
for record in records:
    actual=pin(report/record['path'],record['path']);assert actual==record,(actual,record)
for item in postimages:assert pin(Path(item['source']['path']))==item['source']
print(json.dumps({'status':'CLOSED','freeze':str(report/'freeze.json'),'freezeSHA256':pin(report/'freeze.json')['sha256'],'recordCount':len(records),'recordBytes':freeze['recordBytes'],'postimages':[x['source'] for x in postimages],'allReadbackMatched':True},indent=2))
