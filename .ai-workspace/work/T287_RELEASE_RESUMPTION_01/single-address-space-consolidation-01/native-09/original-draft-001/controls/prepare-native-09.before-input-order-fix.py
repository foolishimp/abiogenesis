"""Selected operator/evidence preparation only; never runs installed prepare or dispatch.
Requires exact genuine native08 close and Root selection09. No Product edits.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import shutil
import subprocess

X = Path(__file__).resolve().parent
S = Path('/Users/jim/src/apps/abiogenesis-single-address-space')
R = Path('/Users/jim/src/apps/abiogenesis-rc5-performance')
P = 'build_tenants/abiogenesis/typescript/'
BASE = 'f49e7533ebedff0946383cb0c5380a6ecac7889d'
A, oldA = X / 'native-09', X / 'native-08'
I, oldI = S / 'consolidation-inputs/native-09', S / 'consolidation-inputs/native-08'
SELECTION_SHA = '9a4321873b6638cef5f6a3fad907a2b7240e29ad3b7ca6279af94905ad3146ff'
CONJUNCTION_SHA = '16613c500832f38aa692710fea57a21f303cb0cd96812f8534afd2c91132e18a'
SUBJECT_SHA = 'e2e638a8e78ea3b5f4fa853bde0209e34e4947cd828010c7d59cd3c643479bb0'
sha = lambda value: hashlib.sha256(value).hexdigest()
read = lambda path: json.loads(path.read_text())
def pin(path):
    data = path.read_bytes()
    return {'path': str(path), 'bytes': len(data), 'sha256': sha(data)}
def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as out:
        out.write(value if isinstance(value, str) else json.dumps(value, indent=2) + '\n')
def verify(value):
    data = Path(value['path']).read_bytes()
    assert len(data) == value['bytes'] and sha(data) == value['sha256'], value['path']
def old_source(path):
    if path in held_map:
        return Path(held_map[path]['snapshot']).read_bytes()
    return subprocess.check_output(['git', '-C', str(R), 'show', BASE + ':' + path])
def current09(value):
    if isinstance(value, str):
        return value.replace('command://abiogenesis/single-address-space/native-08/', 'command://abiogenesis/single-address-space/native-09/')
    if isinstance(value, list): return [current09(x) for x in value]
    if isinstance(value, dict): return {k: current09(v) for k, v in value.items()}
    return value

selection = X / 'ROOT_REENTRY_SELECTION_09.md'
conjunction_path = oldA / 'ROOT_CONJUNCTION.json'
subject_path = oldA / 'review-subject-001/SUBJECT.json'
assert sha(selection.read_bytes()) == SELECTION_SHA
assert sha(conjunction_path.read_bytes()) == CONJUNCTION_SHA
assert sha(subject_path.read_bytes()) == SUBJECT_SHA
conjunction, subject = read(conjunction_path), read(subject_path)
assert conjunction['nextContinuationSelected'] is True
assert conjunction['closure']['wholeOriginalOutcome'] is False
assert conjunction['hostFailure'] is False and conjunction['native08ReadbackRecovery'] is False
assert conjunction['freshStanding'] == {'result':'not_found','replay':'blocked','terminal':None,'agree':True,'acceptedTerminal':False}
for key in ['actualFinalClose', 'freshReadbacks', 'actualOutcome', 'sourceAfterFinalClose', 'closeCoordinates']:
    verify(conjunction[key])
close_path = Path(conjunction['actualFinalClose']['path'])
closed = read(close_path)
assert closed['state']['closeHandoff']['prefix']['prefixLength'] == 755445926
assert closed['state'].get('environment') is None
assert read(Path(conjunction['sourceAfterFinalClose']['path']))['allEqual'] is True
assert subprocess.check_output(['git','-C',str(S),'rev-parse','HEAD'],text=True).strip() == BASE
assert not subprocess.check_output(['git','-C',str(S),'diff','--cached','--name-only'],text=True).strip()
assert set(subprocess.check_output(['git','-C',str(S),'diff','--name-only'],text=True).splitlines()) == set(subject['trackedChangedPaths'])
held_map = {row['path']: row for row in subject['files']}
for row in subject['files']:
    data = (S / row['path']).read_bytes()
    assert len(data) == row['bytes'] and sha(data) == row['sha256'], row['path']
for name in ['return.json','readiness.json','progress.json']:
    assert (subject_path.parent/name).read_bytes() == (S/'consolidation-scratch/native-08'/name).read_bytes()
scope_path = A / 'AFFECTED_INTERFACE_CONE.json'
scope = read(scope_path)
assert scope['counts']['exactPermittedProductPaths'] == 43
permitted = scope['productEffects']
for path in permitted:
    assert (S/path).read_bytes() == old_source(path), path
assert not I.exists() and not (S/'tmp09').exists() and not (A/'workload.json').exists()
now = datetime.now(timezone.utc).isoformat()
basis = json.loads(subprocess.check_output(['stdo','status','--definition',str(S/'stdo_abiogenesis.json'),'--verify'],text=True))
assert basis['definition_id'] == 'urn:stdo:product-definition:abiogenesis'
assert basis['manifest_sha256'] == '102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b'
assert basis['installed'] and basis['valid'] and not basis['failures']
A.mkdir(exist_ok=True)
I.mkdir(parents=True)
(S/'consolidation-scratch/native-09/tmp').mkdir(parents=True)
(S/'tmp09').mkdir()
write(A/'WRITER_ACTIVATION.json', {
    'recordedUtc':now,'role':'Separately activated operator/evidence Writer, formerly independent Reviewer',
    'authority':pin(selection),'closedPredecessorConjunction':pin(conjunction_path),
    'basisVerification':{k:basis[k] for k in ['definition','definition_id','basis','manifest_sha256','installed','valid','failures']},
    'entry':'Installed304 stdo-work sufficient direct Writer branch; Root owns downstream native issue/admission',
    'effects':['Exact controls/source-custody and finite inputs under native-09; prepare-native-09.py; new declared scratch'],
    'exclusions':['No Product/test/HOW edit, prior input/report/log/status/Git mutation or cleanup','No installed prepare/dispatch/provider/runtime admission or test/build execution'],
    'independence':'This Writer is not independent assurance of these authored controls. Prior reconciliation remains immutable.',
    'host':'Unrestricted host and inherited history; declared read/effect scopes are not universal filesystem confinement'})

# Existing test modules; historical conditions stay their own conditions.
roots = read(A/'C2_AFFECTED_TEST_ROOTS.json')
job = P+'test_env/tests/t287-native-semantic-job.test.mjs'
revision = P+'test_env/tests/t287-native-semantic-revision.test.mjs'
sas = P+'test_env/tests/t287-single-address-space-consolidation.test.mjs'
component_files = [p.removeprefix(P) for p in roots if p not in [job,revision,sas]]
assert len(roots) == 28 and len(component_files) == 25
lanes = [
 {'id':'single-address-space-whole-path','files':[sas.removeprefix(P)],'timeoutMs':1200000,'minimumPasses':12,'requireNoSkips':True},
 {'id':'native-semantic-job','files':[job.removeprefix(P)],'timeoutMs':900000,'minimumPasses':9,'requireNoSkips':True},
 {'id':'native-semantic-revision','files':[revision.removeprefix(P)],'timeoutMs':900000,'minimumPasses':5,'requireNoSkips':False},
 {'id':'semantic-interface-and-fixture-consumers','files':component_files,'timeoutMs':1500000,'minimumPasses':62,'requireNoSkips':False}]
write(A/'AFFECTED_PROOF_LANES.json', {'lanes':lanes,
 'population':'28 unique existing test modules; no duplicate scheduling',
 'minimumBasis':'Whole-path retains10 existing cases and adds two required no-skip IR behavior/work cases. Native semantic job has9 current unconditional cases; native semantic revision has5 current plus2 existing captured-envelope historical gates. Component62 is a conservative source-derived unguarded-case floor, excluding known optional native/evidence gates; actual nested populations may be higher.',
 'historicalGates':'Existing D2 captured-envelope, old native retained job/selector/D1/predecessor/STDO-pilot/full-job proof inputs remain unselected. Preserve their exact gate reasons and label skipped branches unverified; no new skip of selected positive/negative/work cases.',
 'requiredNewClaims':['IR-01 all three real cut callers preserve exclusive cut, values/order/profile/digests/refusals and avoid full-body filter/revalidation','IR-02 all seven ordinary callers preserve semantic/transport/source/authority facts/refusals and avoid materializing wrappers; all four old wrappers gone with synthetic export consumers migrated'],
 'unchangedEvidence':'No new execution credit from any native06/07/08 retained row; Product package bytes change, so old package-equality reuse is not selected.',
 'limits':'Source-derived minima are preparation predicates, not observations or acceptance. Existing optional historical skips cannot satisfy selected new claims.'})

# Exact predecessor code for meaningful same-input comparisons. These are read-only
# evidence copies outside the Product worktree, not alternate callable authority.
preimages=[]
for short in ['abg/instruction_assembly.ts','abg/semantic_stage.ts','abg/semantic_job.ts','abg/semantic_revision.ts','abg/worksite_revision.ts','implementation/leaf_invocation_port.ts','implementation/semantic_revision.ts','implementation/semantic_stage.ts']:
    path=P+'code/src/'+short;data=old_source(path);destination=A/'preimages'/short
    destination.parent.mkdir(parents=True,exist_ok=True)
    with destination.open('xb') as out: out.write(data)
    preimages.append({'sourcePath':path,**pin(destination),'origin':SUBJECT_SHA if path in held_map else BASE,
      'consumer':'Selected09 predecessor/candidate same-input behavior and work comparison only'})
preimage_index={'kind':'exact_selected_predecessor_source_inputs','readOnly':True,'subjectSha256':SUBJECT_SHA,'files':preimages,
 'limits':'No old package/current-type identity substitution. Tests may load exact predecessor code with disclosed dependencies/lower-owner premises; preserve full behavior and report the comparison scope.'}
write(A/'IR_PREIMAGES.json',preimage_index)
write(I/'IR_PREIMAGES.json',preimage_index)

# Current coordinated inputs are copied once only where the existing relative
# observed-source/assessment contract needs them. Ancestors stay at their old paths.
for filename,source in {
 'ROOT_REENTRY_SELECTION_09.md':selection,
 'PRIOR_ACTIVATION_CONJUNCTION.json':conjunction_path,
 'PREVIOUS_NATIVE_RETURN.json':subject_path.parent/'return.json',
 'INDEPENDENT_FH_PROOF_REVIEW.json':oldA/'INDEPENDENT_FH_PROOF_REVIEW.json',
 'INTERFACE_RECONCILIATION.json':oldA/'INTERFACE_RECONCILIATION.json',
 'UAT_EVIDENCE_TRIAGE.json':oldA/'UAT_EVIDENCE_TRIAGE.json',
 'NATIVE_C2_CLOSED_RESULT.json':oldA/'NATIVE_C2_CLOSED_RESULT.json',
 'NATIVE_UAT_CLOSED_RESULT.json':oldA/'NATIVE_UAT_CLOSED_RESULT.json',
 'PRIOR_ACTUAL_C2_SUMMARY.json':oldA/'ACTUAL_C2_SUMMARY.json',
 'AFFECTED_INTERFACE_CONE.json':scope_path,
 'AFFECTED_PROOF_LANES.json':A/'AFFECTED_PROOF_LANES.json'
}.items(): shutil.copyfile(source,I/filename)
write(I/'HISTORICAL_EVIDENCE_ROUTES.json', {'kind':'preserved_existing_custody','readOnly':True,
 'ancestors':'Existing consolidation-inputs/native-08 read roots remain protected/readable; current09 task/selection/conjunction alone select work.',
 'closedNative08Conjunction':pin(conjunction_path),'source':pin(subject_path),
 'actualFinalClose':conjunction['actualFinalClose'],'sourceAfterClose':conjunction['sourceAfterFinalClose'],
 'earlierProofAndReviews':'Follow exact identities in Root conjunction and preserved old controls; do not recopy or requalify all old bodies.',
 'packageStanding':'Old candidate archives and lane executions remain historical evidence; no new candidate equality asserted.'})

scratch=['consolidation-scratch/native-09/'+n for n in ['return.json','readiness.json','progress.json','tmp']]+['tmp09']
future=scratch[:3]
custody=sorted(set(held_map)|set(permitted))
grant=read(oldA/'NATIVE_GRANT.json')
grant.update(taskId='T287_SINGLE_ADDRESS_SPACE_NATIVE_09',status='ROOT_SELECTED_CONTINUATION_PREPARATION',
 productWritePaths=custody,newFilesExpectedAfterConstruction=future,scratchWriteRoots=scratch,
 sourceStanding='Exact native08 uncommitted successor plus selected09 correction; immutable f49 is builder, not candidate source.',
 permittedProductEffects={'paths':permitted,'effects':'One native Worker only: IR-01/IR-02 existing-owner migration, four obsolete wrapper retirements, complete affected test/support migration, meaningful proof and factual owning HOW. Wider source population is custody only.'},
 readAccess='Complete exact selected owner/caller/test cone, current installed304, immutable RC5/toolchain and exact declared historical source/proof inputs. Current controls/assessment sources are relative observed inputs. Actual C2 returned-evidence read permission is limited to the c2Report.path and report.nativeTestProof.path pins in the authenticated affected-proof stdout, after bytes/SHA verification. Do not assume snapshotRoot/worksiteDelta in assessor input, guess archive attempts or use cleanup-prone producerPath. Unrestricted host does not imply blanket filesystem confidentiality/confinement.',
 continuation={'heldSubject':pin(subject_path),'afterObservationDigest':subject['afterObservationDigest'],'priorActualClose':conjunction['actualFinalClose'],
 'rootSelection':pin(selection),'rootConjunction':pin(conjunction_path),'selectedResiduals':conjunction['selectedResiduals'],'unchangedCoverage':'Full original R1-R7/C1-C5; all valid predecessor judgments/failures preserved'},
 conditionalOwnerEffects=[])
for key,outkey in [('nativeAbsoluteTimeoutMs','absoluteTimeoutMs'),('nativeInactivityTimeoutMs','inactivityTimeoutMs'),('outerTimeoutMs','outerTimeoutMs')]:grant['limits'][outkey]=conjunction[key]
grant['limitRationale']=conjunction['budgetRationale']
write(A/'NATIVE_GRANT.json',grant);write(I/'NATIVE_GRANT.json',grant)
write(A/'SOURCE_BEFORE.json',{'kind':'held_source_continuation_before_snapshot','recordedUtc':now,'baselineCommit':BASE,
 'heldSubject':pin(subject_path),'files':[dict(pin(S/p),relativePath=p) for p in custody],
 'preservedChangedPaths':subject['changedPaths'],'permittedEffectPaths':permitted,'accepted':False})
write(A/'EXPECTED_FUTURE_FILES.json',future)

task='''# Complete the selected existing semantic-owner migration, then return

Product Frame: ABIogenesis5 fixed fifteen families / GOAL-035 / T-287 / exact STDO3.0.4 manifest102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b, empty composition. Original complete R1-R7/C1-C5 and five-family outcome remain governing. Immutable RC5/f49 builds the uncommitted successor; this is no new release or Product law.

Apply exact installed304 stdo-work under ROOT_REENTRY_SELECTION_09 and the genuine closed native08 PRIOR_ACTIVATION_CONJUNCTION. Native08 RAW F_H proof/C2 is bounded accepted; its UAT remains indeterminate, fresh result not_found/replay blocked/no terminal. Do not repeat or rewrite it. Complete only the selected original C1 omissions IR-01/IR-02 and necessary proof/HOW. Read the exact INTERFACE_RECONCILIATION and AFFECTED_INTERFACE_CONE, and follow all aliases/imports/synthetic harness exports. Eight Product implementation files, all affected existing tests/support, existing SAS proof/support and HOW are enumerated in permittedProductEffects.paths. Wider productWritePaths is SOURCE CUSTODY, not extra write permission.

IR-01: semantic_revision jobRevisionSubjectAtBasis and revisionEvidenceComponentsAtBasis, and worksite_revision projectionFacts, rebuild earlier cuts with events.filter/freeze/validated selection. Use existing validatedRuntimeEventPrefixBeforeEvent over the authenticated owner; existing private cut parameters may accept RuntimeEventPrefix. Preserve exact exclusive boundary, profile, source/cause checks, origin/dependency order, raw/scoped refusal domain, stale/foreign/cold and actual mutable-worksite checks. No new cache/store/prefix abstraction, authority, gate or protocol.

IR-02: seven ordinary calls in instruction_assembly, leaf_invocation_port, implementation/semantic_revision and implementation/semantic_stage must use authenticateOwnedSemanticStageBasis/JobBasis. They do not consume owner.events. Retire authenticateSemanticStageBasis, authenticateSemanticJobBasis, projectJobRevisionSubject and projectRevisionSelectionSubject after migrating every real consumer and fixture override. Do not retain a forwarding alias. No current production consumer justifies the two complete-subject wrappers in the frozen census; return a concrete different supported consumer if one exists, not a hypothetical compatibility reason. Do not remove genuine completePublicOutcome/transition/F_H/deferred/replay/attestation outputs, RAW fallbacks or real cold/current/effect checks.

Use existing actual semantic stage/job/revision and retained-origin fixtures and existing instrumentation. Add two no-skip whole-path cases, IR-01 and IR-02, so the12-case whole-path lane cannot pass with the old behavior. They must distinguish information-losing shortcuts from genuine reuse: exact same-input before/after values, roles, origins/dependency order, digest/profile, transport/source/currentness and refusal/first-cause behavior; and measured full-body filter/materialization/revalidation work at all three cuts and seven ordinary consumers. IR_PREIMAGES.json supplies exact readonly predecessor source pins outside Product territory. Compare through legitimate existing fixture/module owners, state any lower premises, and do not mix module-family ownership or substitute old RC5 package identity for the native08 source. Existing source instrumentation suffices; do not invent broad thresholds/frameworks. Record count/byte/wall/CPU/allocation scope and unknowns honestly; local savings are not total workflow performance. No whole-history output is required merely to preserve an obsolete test assertion.

The affected four C2 lanes are declared in AFFECTED_PROOF_LANES: whole-path12 no skips, current native semantic job9 no skips, current native semantic revision5 plus two existing captured-envelope gates, and the complete25-file semantic/interface fixture lane with conservative62 current-case floor. Preserve already-declared historical/native fixture gates and their reasons; skips earn no new claim. Newly selected work/positive/negative cases must run. Migrate synthetic exports/imports instead of keeping obsolete interfaces alive. Do not activate old unselected qualification/full-job/provider/replay histories. Old native06/07/08 lanes are retained HISTORY, not new execution: Product package bytes change, so the old package equality receipt is not reused.

Only native coding Worker edits Product/test/HOW. Use tmp09 and consolidation-scratch/native-09 only for new scratch. No /tmp/dummy_ignore, arbitrary cache cleanup, subagents, git mutation or control/input/log/release mutation. Preserve the disclosed earlier off-grant write/delete and incomplete older scratch TAP custody; do not claim they were harmless or that the host is universally confined. Reserve handoff time. Use focused selfchecks with exact TAP/output custody; actual prescribed C2 runs once after returned source is frozen, alongside independent review. Do not rehearse unchanged long lanes.

Assessment consumes complete command stdout/predicates and causal coordinates. The corrected existing wrapper emits c2Report.path/bytes/sha256 beside its compact report and existing report.nativeTestProof.path/bytes/sha256. It preserves actual package/proof before cleanup. It does not put snapshotRoot/worksiteDelta or full proof into every role. Root alone conjoins future independent review and post-UAT fresh-close evidence; neither is an input this earlier actor may fabricate. Preserve the full original rubric and residuals; an honest satisfied increment does not assert original C1-C5 complete. UAT_EVIDENCE_TRIAGE and current compact conjunction govern these ownership distinctions.

Return the standard return.json/readiness.json/progress.json with exact modified files/hashes, complete original-family/caller/retirement dispositions, actual executed proofs and artifacts, all failures, supported retained contracts and unresolveds. Keep prior bounded judgments separate from new evidence. Freeze and stop after the one coherent increment. Root alone admits dispatch, reviews and decides original-outcome closure. No new cut/install/qualification/stable/merge/push claim.
'''
write(A/'task.md',task);write(I/'TASK.md',task)

profile=read(oldA/'PROVIDER_PROFILE.json')
profile['provider']['command']=str(A/'claude-provider.sh');profile['providerScratch']=str(S/'tmp09')
profile['continuationStanding']='Selected09 complete IR-01/IR-02 migration from genuine native08 close; one coding Worker, no automatic retry'
# Preserve the actual host/CLI namespace. The existing provider wrapper already
# selects its own declared scratch; test commands receive declared09 scratch.
environment_ruling=read(A/'ENVIRONMENT_SELECTION.json')
assert environment_ruling['authoritySha256']==SELECTION_SHA
assert environment_ruling['hostTMPDIR']=='/private/tmp/abg-rc5'
profile['runtimeEnvironment']['TMPDIR']=environment_ruling['hostTMPDIR']
for k in ['BASH_DEFAULT_TIMEOUT_MS','BASH_MAX_TIMEOUT_MS']:profile['runtimeEnvironment'][k]=str(conjunction['helperShellTimeoutMs'])
assert profile['runtimeEnvironment']['NODE_OPTIONS']=='--max-old-space-size=8192'
write(A/'PROVIDER_PROFILE.json',profile)
write(A/'claude-provider.sh',(oldA/'claude-provider.sh').read_text().replace('tmp08','tmp09'));(A/'claude-provider.sh').chmod(0o755)
prepare=(oldA/'prepare.mjs').read_text().replace('native-07/execution/after-run-resume.json','native-08/execution/after-run-resume.json').replace("runId:'single-address-space-native-08'","runId:'single-address-space-native-09'")
assert 'getHeapStatistics' in prepare and 'Apply declared host Node heap policy at launch' in prepare
write(A/'prepare.mjs',prepare)
dispatch=(oldA/'dispatch.mjs').read_text();assert 'environment:null' in dispatch and 'getHeapStatistics' in dispatch
write(A/'dispatch.mjs',dispatch)
write(A/'freeze-source.mjs',(oldA/'freeze-source.mjs').read_text().replace('consolidation-scratch/native-08','consolidation-scratch/native-09').replace('tmp08/runs','tmp09/runs'))
write(A/'observe-progress.py',(oldA/'observe-progress.py').read_text().replace('native-07/execution/outcome-summary.json','native-08/execution/outcome-summary.json').replace('native-07/ACTUAL_FINAL_CLOSE_COORDINATES.json','native-08/ACTUAL_FINAL_CLOSE_COORDINATES.json').replace("'activation':'native-08'","'activation':'native-09'").replace('consolidation-scratch/native-08','consolidation-scratch/native-09'))
capacity=(oldA/'selector-size-preflight.mjs').read_text()
capacity=capacity.replace('allowanceBytes:4096','allowanceBytes:65536').replace('allowanceBytes:36864','allowanceBytes:98304').replace('assessorAllowance=4096','assessorAllowance=65536')
capacity=capacity.replace('4KiB allowance','64KiB allowance').replace('4KiB future metadata allowance','64KiB future metadata allowance').replace('4KiB metadata allowance','64KiB metadata allowance').replace('4KiB formatting/metadata allowance','64KiB formatting/metadata allowance')
capacity+='\n//09 uses64KiB finite future handoff/source/report metadata allowance for43 permitted paths, plus32KiB adverse text and the unchanged128KiB reserve; predictions are not arbitrary-output guarantees.\n'
write(A/'selector-size-preflight.mjs',capacity)

# Same C2 orchestration, without invalid package-equality reuse, plus exact report pin.
wrapper=(oldA/'c2-proof.mjs').read_text().replace('consolidation-inputs/native-08','consolidation-inputs/native-09').replace('single-address-space-native-08','single-address-space-native-09')
begin=wrapper.index('let retainedEvidenceVerification=null;');end=wrapper.index('for(const lane of manifest.lanes){',begin)
archive='''let retainedEvidenceVerification=null;
// Product code changes: preserve current actual bytes, never compare them as old execution.
try {
  const sourcePath=manifest.candidatePackageRelativePath;
  const packed=await readFile(join(work,sourcePath));
  await mkdir(reportRoot,{recursive:true});
  await writeFile(join(reportRoot,'candidate-package.tgz'),packed,{flag:'wx'});
  const observation={sourcePath,bytes:packed.length,sha256:h(packed),integrity:'sha512-'+createHash('sha512').update(packed).digest('base64'),standing:'Actual new candidate package retained before fixture cleanup; no old package-equality or retained-execution credit'};
  await writeFile(join(reportRoot,'candidate-package-observation.json'),JSON.stringify(observation,null,2)+'\\n',{flag:'wx'});
} catch(error) { failures.push({lane:'candidate-package-custody',reason:'Actual candidate package unavailable',detail:String(error.message)}); }

'''
wrapper=wrapper[:begin]+archive+wrapper[end:]
old="await writeFile(join(reportRoot,'single-address-space-c2.json'),JSON.stringify(report,null,2)+'\\n',{flag:'wx'});"
new="const c2ReportBytes=Buffer.from(JSON.stringify(report,null,2)+'\\n');\nconst c2ReportPath=join(reportRoot,'single-address-space-c2.json');\nawait writeFile(c2ReportPath,c2ReportBytes,{flag:'wx'});\nconst c2Report={path:c2ReportPath,bytes:c2ReportBytes.length,sha256:h(c2ReportBytes)};"
assert old in wrapper;wrapper=wrapper.replace(old,new)
assert "'SELECTED_C2_LANES_FAILED',report}" in wrapper
wrapper=wrapper.replace("'SELECTED_C2_LANES_FAILED',report}","'SELECTED_C2_LANES_FAILED',c2Report,report}")
write(A/'c2-proof.mjs',wrapper);write(I/'c2-proof.mjs',wrapper)

w=current09(read(oldA/'workload.json'))
w['taskRef']='task://abiogenesis/t287/single-address-space/native-09'
w['task']='Complete the existing-owner IR-01/IR-02 cut and semantic-caller migration, retire all four obsolete wrappers and affected fixture exports, and prove behavior/work conservation while preserving original R1-R7/C1-C5.'
w['authorityRefs'].append(selection.as_uri())
for command in w['testing']['commands']:
    if 'environment' in command:command['environment']['TMPDIR']=environment_ruling['testTMPDIR']
w['testing']['commands'][-1]['args']=['consolidation-inputs/native-09/c2-proof.mjs']
w['testing']['commands'][-1]['timeoutMs']=conjunction['proofCommandTimeoutMs']
# Earlier qualification fixture environment is not selected in09; preserve its old record.
for command in w['testing']['commands']:
    for key in list(command.get('environment',{})):
        if key.startswith('ABI5_PRODUCER_'):del command['environment'][key]
assert w['testing']['commands'][5]['args']==['pack','--ignore-scripts','--silent','--pack-destination','artifacts']

inputs=read(oldI/'C2_INPUTS.json')
inputs.update(sourceStanding='Exact native08 source plus returned09 effect set; HEAD is only baseline',heldSourceSubjectSha256=SUBJECT_SHA,
 sourceCorrespondencePaths=custody+future,futureNativeFiles=future,lanes=lanes,retainedEvidence=[],
 retainedEvidenceManifest=None,candidatePackageRelativePath=P+'artifacts/abiogenesis-typescript-tenant-5.0.0-rc.5.tgz',
 requiredCurrentUnskippedClaims=['Whole-path12 includes two new complete IR behavior/work discriminators; no skips','Native semantic job9 no skips','Native semantic revision current5 and full fixture consumer component62; existing historical gates remain explicit'],
 declaredHistoricalExclusions=['All previous unselected historical qualification/provider/replay inputs remain excluded','Existing captured-envelope, D1/progenitor/STDO-pilot/full-job gates retain their source reasons; no new work-discriminator skip is permitted'],
 additionalExternalResources=['IR_PREIMAGES.json'],externalResources='EXTERNAL_READ_RESOURCES.json',
 historicalEvidence='HISTORICAL_EVIDENCE_ROUTES.json')
write(I/'C2_INPUTS.json',inputs)
external=read(oldI/'EXTERNAL_READ_RESOURCES.json');external.update(selected09SourcePreimages=preimage_index,
 meaning='Exact existing read-only runtime/toolchain/history custody plus finite09 same-input predecessor source. Do not copy complete logs/archives into ordinary context; no old package equivalence credit.')
write(I/'EXTERNAL_READ_RESOURCES.json',external)
current_names=['TASK.md','NATIVE_GRANT.json','ROOT_REENTRY_SELECTION_09.md','PRIOR_ACTIVATION_CONJUNCTION.json','PREVIOUS_NATIVE_RETURN.json','INTERFACE_RECONCILIATION.json','INDEPENDENT_FH_PROOF_REVIEW.json','UAT_EVIDENCE_TRIAGE.json','NATIVE_C2_CLOSED_RESULT.json','NATIVE_UAT_CLOSED_RESULT.json','PRIOR_ACTUAL_C2_SUMMARY.json','AFFECTED_INTERFACE_CONE.json','AFFECTED_PROOF_LANES.json','IR_PREIMAGES.json','HISTORICAL_EVIDENCE_ROUTES.json','C2_INPUTS.json','EXTERNAL_READ_RESOURCES.json','c2-proof.mjs']
stable_names=['CONTEXT_AND_CAUSAL_MAP.md','ROOT_TRIAGE_AND_SELECTION.md','rubric.json','REMAINING_OWNER_CLASSIFICATION.md','CENSUS_FOLLOWUP_CLASSIFICATION.md','PERFORMANCE_DETAIL.md','MEASURED_BASELINE.json']
readfirst=['consolidation-inputs/native-09/'+n for n in current_names]+['consolidation-inputs/native-08/'+n for n in stable_names]
assessment_instruction=('Evaluate this selected09 increment against the unchanged full rubric and exact current subject/C2. Preserve original C1-C5/R1-R7 residuals and report their standing; do not claim the original outcome satisfied from local green. Closed08 reviews/C2/UAT/Root dispositions are explicit inputs; concurrent09 independent review and this Run\'s future post-UAT fresh reads/Root conjunction are later Root predicates unless actually supplied, not fictitious earlier inputs. Actual testing command stdout/predicates and causal coordinates are carried. Parse the final affected-proof stdout: it contains c2Report.path/bytes/sha256 and report.nativeTestProof.path/bytes/sha256. You are explicitly permitted to read exactly those returned evidence files, verify their actual bytes/SHA256, compare the parsed report with the carried stdout report, then assess the full native proof. Do not assume snapshotRoot/worksiteDelta in this role, derive archive/attempt siblings, use artifacts producerPath, or request the full delta/proof be duplicated into the prompt. A failed lane or missing/tampered returned artifact remains failed/unresolved. The C2 execution Worker only invokes the prescribed helper and returns its result; this assessment permission is not extra execution authority.')
for role,order in w['workOrders'].items():
    order['readFirst']=readfirst
    order['outcome']=w['task']
    order['writeRoots']=permitted+scratch if role=='construction' else []
    order['instructions']=[task] if role=='construction' else [
      'Use current selection09/conjunction, original map/rubric and exact selected increment. Only construction writes Product. Preserve every prior valid result/failure, all original obligations, exact cold/current/raw/full-output contracts and disclosed scope limits.']
w['workOrders']['uat']['instructions'].append(assessment_instruction)
w['workOrders']['testing']['instructions'].append('Perform only the prescribed C2 helper invocation and result return. Its final stdout carries exact c2Report/native-proof locators for later assessment; do not invent or execute extra archive reads.')

selected=set(w['testing']['selectedPaths'])|set(custody)|set(roots)|set(readfirst)|set(future)
selected.update(read(A/'C2_AFFECTED_TEST_ROOTS.json'))
selected.update(row['path'] for row in read(A/'AFFECTED_TEST_LITERAL_CLOSURE.json')['added'])
selected.update('consolidation-inputs/native-09/'+n for n in ['C2_SELECTED_INPUTS.json','INPUT_SUFFICIENCY.json'])
write(A/'C2_LITERAL_IMPORT_SEEDS.json',sorted(selected))
check=subprocess.run(['node',str(X/'check-c2-literal-imports.mjs'),str(S),str(A/'C2_LITERAL_IMPORT_SEEDS.json')],capture_output=True,text=True)
assert check.stdout,check.stderr
closure=json.loads(check.stdout);write(A/'C2_LITERAL_IMPORT_CLOSURE.json',closure)
assert check.returncode==0 and not closure['missing'],closure['missing']
selected.update(row['path'] for row in closure['added'])
# The already-proved finite data cone remains protected; literal imports alone
# do not claim discovery of data reads. Known new inputs are generated fixtures
# or declared optional historical branches; the retained31 UAT assets stay selected.
for path in selected:
    assert not (S/path).exists() if path in future else (S/path).is_file(),path
write(I/'C2_SELECTED_INPUTS.json',{'kind':'operator_selected_file_guide','selectedPaths':sorted(selected),'futureFiles':future,
 'meaning':'Finite exact source/fixture/data and current controls; preserve relative paths. Full prior inputs remain unchanged at existing paths, no blanket historical body copy.'})
w['testing']['selectedPaths']=sorted(selected)
w['readRoots']=sorted(set(w['readRoots'])|selected|set(readfirst))
w['testing']['commands'][0]['args']=w['testing']['commands'][0]['args'][:2]+inputs['sourceCorrespondencePaths']
write(I/'INPUT_SUFFICIENCY.json',{'kind':'finite_operator_input_sufficiency','heldSubject':pin(subject_path),
 'scope':pin(scope_path),'literalModuleClosure':pin(A/'C2_LITERAL_IMPORT_CLOSURE.json'),
 'testRoots':roots,'newLiteralModules':read(A/'AFFECTED_TEST_LITERAL_CLOSURE.json')['added'],
 'dynamicData':'Preserve old918 selected compiler/config/fixture/data inputs, including all31 scenario assets and config.example.json. New current semantic fixtures construct their data locally through existing support. Gated historical predecessor/full-native/STDO evidence is not silently selected or fabricated. Exact09 predecessor source files are explicitly pinned readonly external inputs.',
 'sourceCorrespondence':len(custody)+3,'selectedFiles':len(selected),'futureFiles':future,
 'retainedHistoricalEvidence':'Original records/archives remain in existing custody with exact pins. No old package-equality or new lane execution credit.',
 'limits':['File-only import/data classification, not executed tests or installed-owner preparation','Actual build/testing/field reachability/capacity/source correspondence remain later Root conjunction','No universal filesystem confinement or complete cache-observation claim']})
framework=[v['path'] for v in w['sources'] if not v['path'].startswith('consolidation-inputs/')]
inline=framework+['consolidation-inputs/native-09/'+n for n in ['TASK.md','NATIVE_GRANT.json','ROOT_REENTRY_SELECTION_09.md','PRIOR_ACTIVATION_CONJUNCTION.json']]+['consolidation-inputs/native-08/'+n for n in stable_names]
assert len(inline)==20 and len(set(inline))==20
w['sources']=[{'path':p,'digest':'sha256:'+sha((S/p).read_bytes())} for p in inline]
source_paths=list(dict.fromkeys(framework+readfirst+['consolidation-inputs/native-09/INPUT_SUFFICIENCY.json']))
w['assessment']['sources']=[p for p in source_paths if p!=w['assessment']['rubricPath']]
assert w['assessment']['rubricPath']=='consolidation-inputs/native-08/rubric.json'
assert not set(source_paths)&set(custody)
write(A/'SOURCE_EXTENT_CLASSIFICATION.json',{'kind':'existing_operator_carriers_by_consumer',
 'selectorInline':[pin(S/p) for p in inline],
 'assessmentSources':[pin(S/p) for p in w['assessment']['sources']],
 'referenceOnlyFullInputs':[pin(S/p) for p in source_paths if p not in inline],
 'preserved':'Full original Product/map/rubric, current09 decisions/grant/task/conjunction and every known limit inline; detailed current reports have real relative observed read/assessment routes. Old evidence stays at its existing paths.',
 'limits':'Selector has no external reads; reference-only details do not fill an omitted decision premise. Current controls are authored Writer output, not independent assurance or admission.'})
write(A/'workload.json',w)
write(A/'PACKET_PREPARATION_COMPLETE.json',{'status':'READY_FOR_ROOT_CONTROL_REVIEW_AND_INSTALLED_PREFLIGHT','recordedUtc':now,
 'selection':pin(selection),'predecessorConjunction':pin(conjunction_path),'sourcePreimage':pin(A/'SOURCE_BEFORE.json'),
 'permittedProductPaths':len(permitted),'custodySourcePaths':len(custody),'testModules':len(roots),'lanes':lanes,
 'selectedFiles':len(selected),'existingSelectedBytes':sum((S/p).stat().st_size for p in selected if p not in future),
 'futureFiles':future,'sourcePins':len(w['sources']),'commands':len(w['testing']['commands']),
 'workload':pin(A/'workload.json'),'providerCalls':0,'RunAdmissions':0,'installedPrepareExecuted':False,'nativeDispatched':False,
 'previousActualClose':conjunction['actualFinalClose'],'previousPrefixLength':755445926,
 'capacityStanding':'Existing current-role multi-phase owner check retained with128KiB reserve and explicit64KiB09 metadata allowance; NOT executed here. Root must run the installed preflight before admission.'})
print(json.dumps({'status':'CONTROL_INPUT_PREPARATION_COMPLETE_NOT_PREFLIGHTED_OR_DISPATCHED','permittedPaths':len(permitted),'custodyPaths':len(custody),'testModules':len(roots),'selectedFiles':len(selected),'sources':len(inline),'lanes':len(lanes)}))
