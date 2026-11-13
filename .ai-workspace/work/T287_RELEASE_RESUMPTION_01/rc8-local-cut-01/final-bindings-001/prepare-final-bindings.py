"""Bind recorded Root acceptance into a held cut preparation; no execution."""
import copy,difflib,hashlib,json,os,pathlib,re,shlex
from datetime import datetime,timezone
R=pathlib.Path('/Users/jim/src/apps/abiogenesis');B=R/'.ai-workspace/work/T287_RELEASE_RESUMPTION_01';P=B/'rc8-reference-preservation-01';C=B/'rc8-local-cut-01';F=C/'final-preparation-001';O=pathlib.Path(__file__).resolve().parent
AT=datetime.now(timezone.utc).isoformat();checked=[]
def load(p):return json.loads(pathlib.Path(p).read_text())
def pin(p):
 p=pathlib.Path(p);b=p.read_bytes();return dict(path=str(p),bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def check(q):
 assert pin(q['path'])=={k:q[k] for k in ['path','bytes','sha256']},q['path'];checked.append(q);return q
def save(n,d):(O/n).write_text(json.dumps(d,indent=2)+'\n')
ap=check(dict(path=str(P/'author-12/ROOT_SOURCE_ACCEPTANCE.json'),bytes=26861,sha256='17dcbe89e79fa638a9792e86d8e3242a90e6125c451cb04b35317de8e2a590c6'))
bp=check(dict(path=str(B/'rc8-resumption-20261108/ROOT_SOURCE_BROAD_CONJUNCTION.json'),bytes=51978,sha256='2fdc2bd5c58ad400183462c3357768eb513f645d4b86bcb4d85b8823d27958b8'))
book=check(dict(path=str(P/'author-12/BOOKKEEPING_RETURN.json'),bytes=3604,sha256='5fc419c6cf5dac253694aab739a87580e73bd89bef7ade94fb672dd437fb258f'))
a=load(ap['path']);b=load(bp['path']);prev=load(F/'CUT8_BUILD_BINDINGS.prepared.json')
assert a['sourceAccepted'] is True and a['casewiseAccepted'] is True
assert a['sourceDigest']==b['sourceDigest']==prev['source']['sourceDigest']
assert b['sourceAcceptance']==ap and a['reviewStanding']['verdict']=='satisfied'
assert b['summary']['broadCreditedFiles']==192 and b['summary']['broadActualPasses']==986 and b['summary']['broadHistoricalSkips']==227
assert b['summary']['separateWholeProofs']==4 and b['summary']['acceptedCasewisePopulations']==3 and b['summary']['openResidualPopulations']==9
assert b['executionEnabled'] is False and b['wholeBroadGreen'] is False
for q in [a['sourceFreeze'],a['ready'],a['operatorReturn'],a['sourceReview'],a['focusedProof'],a['focusedReporter'],a['actualSdk'],a['actualClose'],a['freshReadResult'],b['sourceInventory'],b['selectedSourceDelta'],b['declaredSourceArtifactRelation'],b['finalPreparation'],b['productArchive'],b['testedManifest'],b['broadReturn'],b['broadCustodyCorrection']]:check(q)
assert a['sourceReview']['sha256'].startswith('69d03be0') and a['operatorReturn']['sha256'].startswith('522582d8') and a['freshReadResult']['sha256'].startswith('26a204b2')
for q in b['finalDeliveryRecord']['pins']:check(q)
prior_return=load(F/'PREPARATION_RETURN.json')
for q in prior_return['documents']:check(q)
check(prev['preparationManifest'])
driver=check(load(C/'preparation-resumption-001/CONTROL_RECONCILIATION.json')['driver'])
assert prev['source']['inventory']==b['sourceInventory'] and prev['source']['expectedChangedPaths']==load(b['selectedSourceDelta']['path'])['expectedChangedPaths']

relation={'kind':'accepted_a12_source_to_retained_exact_tested_archive','status':'ROOT_ACCEPTED_SOURCE_CORRESPONDENCE_CLEAN_CHECKPOINT_REPRODUCTION_FORTHCOMING','at':AT,'sourceDigest':a['sourceDigest'],'sourceRows':1339,'sourceFreeze':a['sourceFreeze'],'sourceInventory':b['sourceInventory'],'selectedSourceDelta':b['selectedSourceDelta'],'sourceAcceptance':ap,'sourceBroadConjunction':bp,'sourceReview':a['sourceReview'],'operatorReturn':a['operatorReturn'],'freshReadResult':a['freshReadResult'],'originalProductSourceAcceptance':a['originalProductSourceAcceptance'],'originalProductSourceRelation':a['originalProductSourceRelation'],'retainedArchive':b['productArchive'],'testedManifest':b['testedManifest'],'acceptedCorrespondence':a['sourceArtifactCorrespondence'],'casewiseCoverage':a['coverageConjunction'],'limits':b['limits'],'futureEvidence':{'sourceCheckpointCommit':None,'sourceCheckpointTree':None,'cleanReproduction':None,'exactPackagingReview':None,'immutableInstall':None,'actualInstalledSmoke':None},'executionEnabled':False}
save('SOURCE_ARTIFACT_RELATION.json',relation)

bound=copy.deepcopy(prev)
bound['status']='PREPARED_ACCEPTED_RC8_SOURCE_BROAD_CONJUNCTION_EXECUTION_HELD'
bound['activation']=None
bound['source'].update(cumulativeSourceCoverageDisposition=ap,finalTestOnlySourceAcceptance=ap,nativeTestedArchiveSourceRelation=pin(O/'SOURCE_ARTIFACT_RELATION.json'))
bound['acceptance'].update(source=ap,focusedAndReview=ap,broadClose=bp)
bound['proofBindings'].update(finalA12SourceReview=a['sourceReview'],finalA12SdkCloseReadbacks=a['operatorReturn'],finalA12FreshReadResult=a['freshReadResult'],finalA12SourceAcceptance=ap,finalRootBroadConjunction=bp)
bound['proofBindings']['retainedPopulationMap']=bp
bound['limits']=b['limits']+['Accepted exact source60f8e595/1339 rows/27 selected paths (24 tracked modifications and three new files); checkpoint and byte-equal clean reproduction await separate Root build selection.','Use unchanged run-local-cut.corrected-002.mjs and PREPARATION_MANIFEST_CORRECTED_002.json; retain 20-minute install and 15-minute installed-owner ceilings.','Ship only the exact tested archive; preserve unrelated source, existing immutable cuts and original failure evidence.','Independent exact packaging review and separate Root install admission precede immutable custody and the narrower actual-installed smoke.','No push, tag, merge, publication, global selector, qualified claim, cleanup or automatic retry.']
bound['executionStanding']='A12 source/casewise proof and final source/broad conjunction accepted only for the unqualified local REF01 cut. Source checkpoint/reproduction and later review/install/smoke remain forthcoming. activation:null; executionEnabled:false.'
bound['predecessorPreparedBinding']=pin(F/'CUT8_BUILD_BINDINGS.prepared.json')
bound['deliveryRecord']=b['finalDeliveryRecord'];bound['executionEnabled']=False
save('CUT8_BUILD_BINDINGS.prepared.json',bound)

claim=f'''**Local, explicitly unqualified RC8 REF-01 candidate — source/proof acceptance recorded; checkpoint, reproduction and installation forthcoming.**

Root [accepted A12 source and case-wise proof]({ap['path']}) on sourceDigest `{a['sourceDigest']}`: 1,339 rows and 27 selected paths (24 tracked modifications, three new files). The [final source/broad conjunction]({bp['path']}) accepts this exact bounded local candidate while preserving all prior evidence identities and limits. The tested archive remains `sha256:{b['productArchive']['sha256']}`, with compiled manifest `sha256:{b['testedManifest']['sha256']}`. No new executable artifact, clean reproduction or immutable installation is claimed by that source acceptance.

A12 changes exactly two witness-reprice profile-reference uses. Its [independent source review]({a['sourceReview']['path']}) is satisfied with no findings; the complete selected case passed once with zero skips. Root conjoined that case with fourteen unchanged original024 passes, preserving the original red and source identity. This is case-wise coverage of fifteen intended cases, with no new whole-file credit. The profile case uses injected Product/environment premises while exercising native store/admission/transaction/close/reopen/cold correspondence; it does not prove an installed L-to-W bridge. Physical-byte tamper assertions remain in the retained other cases. The [final native Operator return]({a['operatorReturn']['path']}) and [fresh Result/replay parity]({a['freshReadResult']['path']}) are accepted on their exact closed subject; bounded known-PID/log observations do not establish universal descendant absence or quota enforcement. Observed model/effort arguments are configuration evidence, not provider telemetry assurance, and timings imply no speedup.

The retained broad ledger contains **192 files, 986 actual passes and 227 historical skips**. All 208 inventoried files are accounted for as 192 ledger credits plus **16 separate populations: four accepted whole proofs, three case-wise acceptances and nine OPEN residuals**. Coordinate, native-worksite, registered-selection and RP2 are the four whole proofs; required-operation, ST2A-E and witness-reprice are the three case-wise acceptances. Separate proofs retain their original identities and do not restamp the A6 ledger. There is no whole-broad-green claim.

The separately [accepted configured C2 positive]({b['configuredC2Positive']['evidence']['acceptance']['path']}) proves one installed large-log observation/replay case: one pass, zero skips, eleven excluded cases. Six original component passes remain separately credited. Its 21 owner-local refusal checks do not close the five installed-negative variants, establish whole-C2 qualification or prove universal escaped-descendant absence.

The [accepted matched measurement]({bound['acceptance']['referenceAfter']['path']}) retains its original exact-archive installed scratch scope. Setup admitted one Catalog and constructed one view, unchanged across three calls. Per-call transport detach, verifier reattachment, Catalog/view comparison and additional input-copy counts were zero; input reuse was one. Warm history decode/reopen/cold-read deltas and held-read body work were zero. Each new construction still copied/admitted input once and performed one establishment walk; each call copied one worker contract. Worker schema copies were zero; deep-frozen checks were one on the first call, then zero. This is not blanket zero-copy or an unmeasured native-linking claim.

One unprofiled before/after sample per size reduced SDK wall time by 16.8% at 1 MiB and 12.0% at 4 MiB; construction time increased and RSS changes were mixed. No statistical speedup, consistent memory gain, provider-productivity or whole-workflow claim follows. The exact-archive installed scratch lifecycle retained warm/cold terminal and owner equality, actual close and 2,617-byte Results; a separate third call supplied the parent-only CPU profile. No native RC8 coding-workflow qualification is claimed.

The forthcoming checkpoint/reproduction must preserve the exact tested archive and manifest, with independent review on the resulting commit/tree and artifact correspondence before a separately admitted install. The driver creates the [source/artifact map](SOURCE_ARTIFACT_EVIDENCE_MAP.json) before installation. Actual immutable installation and subsequent narrow export/verification/empty-resource read/close smoke must be established by the later [FINAL_INSTALL_VERIFICATION.json]({C/'actual-001/FINAL_INSTALL_VERIFICATION.json'}); no such future receipt is asserted here. Full lifecycle/performance remains scoped to the accepted installed scratch proof.

All [nine OPEN residuals](RESIDUALS.md), twelve cold-read residuals, S7, fixed fifteen-family/full 5.0 and human gates remain. [Root authority](ROOT_AUTHORITY.md) preserves the local unqualified boundary. No stable/released/qualified status, publication or global selector change follows.
'''
(O/'BOUNDED_CANDIDATE_CLAIM.md').write_text(claim)
res=(F/'RESIDUALS.md').read_text()
res=res.replace('**PREPARED DRAFT — nine retained OPEN assurance residuals; no new disposition.**','**Nine retained OPEN assurance residuals under the accepted local unqualified REF-01 conjunction; no residual closure.**')
res=res.replace('The final Root broad conjunction, referenced by the [source/artifact evidence map](SOURCE_ARTIFACT_EVIDENCE_MAP.json), must preserve their adopted evidence and exact exclusions.',f'The [accepted Root source/broad conjunction]({bp["path"]}), later referenced by the [source/artifact evidence map](SOURCE_ARTIFACT_EVIDENCE_MAP.json), preserves their adopted evidence and exact exclusions.')
res=res.replace('No automatic retry, deadline increase, optimization or repair follows from these drafts.','No automatic retry, deadline increase, optimization or repair follows from this accepted residual disposition.')
res=res.replace('The four separate whole proofs and two case-wise conjunctions','The four separate whole proofs and three case-wise conjunctions')
res=res.replace('A12 has one observed focused pass and remains a pending case-wise acceptance dependency, not a tenth residual. Final Root source/broad conjunction remains pending.','A12 is accepted case-wise through fourteen original024 passes plus one final focused pass; it creates neither a tenth residual nor new whole-file credit. Root has accepted the final source/broad conjunction for this same unqualified local boundary.')
(O/'RESIDUALS.md').write_text(res)
auth=f'''**Root authority envelope — accepted source/proof; concrete execution selection remains separate.**

The user's continuing RC7-to-RC8 instruction and “ok continue on” supply upstream authority under Root Executive, fixed fifteen-family [Project Reference-Frame Basis]({R/'build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md'}), GOAL035/T-287/REF-01, exact STDO 3.0.4 manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b` and empty composition.

[A12 source/case-wise acceptance]({ap['path']}) and the [final source/broad conjunction]({bp['path']}) accept sourceDigest `{a['sourceDigest']}`, 1,339 rows and 27 selected paths (24 tracked modifications, three new files), with unchanged tested archive `a178e960a04d29175e5488e58b9975bab1f0026828e5a85e40c7f4f9752796b9`. Their scope is the explicitly unqualified local REF-01 cut. The 192-file ledger and 16 separate populations retain their exact identities: four whole proofs, three case-wise acceptances and [nine OPEN residuals](RESIDUALS.md). Configured C2 positive acceptance remains separate from its five open installed-negative variants. All inherited qualification, custody, measurement and human-gate limits remain.

This Writer may prepare concrete bindings only. A later exact Root build selection must supply the activation and admit the selected local source checkpoint plus one clean reproduction through existing owners. The unchanged corrected002 driver will preserve unrelated source/history and existing immutable cuts, stage only the exact selected paths, reproduce a clean source archive, and require byte-equal tested archive, manifest and member correspondence. No identity bridge or source rewrite is permitted.

An independent satisfied packaging review over the actual checkpoint commit/tree and reproduction evidence precedes a separate Root install selection. Only then may existing Product verification/resolved-lock/install owners allocate fresh local RC8 custody and run the narrower actual-installed export/verification/empty-resource read/close smoke. Outer custody ceilings remain 20 minutes for installation and 15 minutes for installed-owner smoke; they are not performance guarantees. Full lifecycle/performance remains with the accepted exact-archive installed scratch proof.

The driver’s [preinstall source/artifact map](SOURCE_ARTIFACT_EVIDENCE_MAP.json) binds completed preinstall evidence. Actual subsequent installation/smoke standing belongs to [FINAL_INSTALL_VERIFICATION.json]({C/'actual-001/FINAL_INSTALL_VERIFICATION.json'}). These execution receipts are forthcoming; acceptance of source/proof does not assert their existence or success.

The prepared binding has `activation:null` and `executionEnabled:false`. No push, tag, merge, publication, global selector change, stable/released/qualified claim, history deletion, immutable-release modification or automatic retry is included. Existing authority and separate concrete Root bindings control; this preparation creates no additional user-approval round.
'''
(O/'ROOT_AUTHORITY.md').write_text(auth)

summary={'status':'ACCEPTED_POPULATION_SUMMARY_NO_LEDGER_RESTAMP','sourceAcceptance':ap,'sourceBroadConjunction':bp,'summary':b['summary'],'separatePopulations':[{'file':x['file'],'standing':x['standing'],'acceptance':x.get('acceptance') or x.get('finalA12Acceptance'),'residual':x.get('residual')} for x in b['separatePopulations']],'configuredC2Positive':b['configuredC2Positive'],'allNineResidualsOpen':True,'limits':b['limits']}
save('ACCEPTED_POPULATION_SUMMARY.json',summary)
diff={}
def differences(x,y,path=''):
 if isinstance(x,dict) and isinstance(y,dict):
  for k in sorted(set(x)|set(y)):
   yield from differences(x.get(k),y.get(k),path+'/'+k)
 elif x!=y:yield {'field':path,'before':x,'after':y}
save('BINDING_DIFF.json',{'predecessor':pin(F/'CUT8_BUILD_BINDINGS.prepared.json'),'successor':pin(O/'CUT8_BUILD_BINDINGS.prepared.json'),'changes':list(differences(prev,bound))})
absences=[{'path':bound['paths'][k],'absent':not os.path.lexists(bound['paths'][k])} for k in ['output','temp','releaseRoot','installHost']]
assert all(x['absent'] for x in absences)
links=[]
future={'SOURCE_ARTIFACT_EVIDENCE_MAP.json',str(C/'actual-001/FINAL_INSTALL_VERIFICATION.json')}
for n in ['BOUNDED_CANDIDATE_CLAIM.md','RESIDUALS.md','ROOT_AUTHORITY.md']:
 for target in re.findall(r'\]\(([^)]+)\)',(O/n).read_text()):
  clean=target.split('#')[0];p=pathlib.Path(clean)
  if not p.is_absolute():p=O/p
  assert p.is_file() or clean in future,(n,target)
  links.append({'document':n,'target':target,'exists':p.is_file(),'declaredFutureOutput':clean in future})
assert bound['boundsMs']['install']==1200000 and bound['boundsMs']['installedOwner']==900000
assert bound['activation'] is None and bound['executionEnabled'] is False
assert len(bound['source']['expectedChangedPaths'])==27 and len(bound['source']['expectedNewPaths'])==3
assert all(bound['acceptance'][k] for k in ['source','focusedAndReview','broadClose','referenceAfter'])
save('STATIC_CHECKS.json',{'status':'STATIC_BINDING_AND_ABSENCE_CHECKS_PASSED_EXECUTION_HELD','at':AT,'checkedPins':checked,'sourceInventoryAndDeltaReusedWithoutRepeatRowAudit':True,'allExecutionAcceptanceSlotsBound':True,'pathsAndModesUnchangedFromAcceptedDelta':True,'boundsUnchanged':bound['boundsMs'],'outputAbsences':absences,'links':links,'noDriverImportOrExecution':True,'activation':None,'executionEnabled':False,'mismatches':[]})
held=pin(O/'CUT8_BUILD_BINDINGS.prepared.json')
argv=['/opt/homebrew/bin/node',driver['path'],'build',held['path'],held['sha256']]
save('LAUNCH_PROPOSAL.json',{'status':'EXACT_HELD_BINDING_COMMAND_FOR_REVIEW_NOT_EXECUTABLE_ADMISSION','at':AT,'driver':driver,'binding':held,'commandArgv':argv,'command':shlex.join(argv),'executeNow':False,'currentGuardResult':'Driver rejects held status/activation before effects. This exact command is a static proposal only.','requiredSeparateAdmission':{'status':'ROOT_SELECTED_LOCAL_RC8_BUILD_ONLY','activation':'Exact separately recorded Root build activation pin','executionEnabled':True,'finalCommandRule':'Materialize a separate admitted binding from this held subject, record its exact bytes/SHA256, and use its path/digest in argv. No future admission pin is supplied.'},'expectedOutputs':load(F/'BUILD_COMMAND.prepared.json')['expectedBuildOutputs'],'outputRoot':bound['paths']['output'],'afterBuild':'Exact independent packaging review, then a separate Root install binding; no automatic continuation.','boundsMs':bound['boundsMs']})
files=['SOURCE_ARTIFACT_RELATION.json','CUT8_BUILD_BINDINGS.prepared.json','BOUNDED_CANDIDATE_CLAIM.md','RESIDUALS.md','ROOT_AUTHORITY.md','ACCEPTED_POPULATION_SUMMARY.json','BINDING_DIFF.json','STATIC_CHECKS.json','LAUNCH_PROPOSAL.json','prepare-final-bindings.py']
save('PREPARATION_RETURN.json',{'status':'FINAL_ACCEPTED_SOURCE_BROAD_BINDINGS_PREPARED_EXECUTION_HELD','at':AT,'actor':'/root/rc8_cut_preparation','consumer':'/root','result':'satisfied','predicate':'Final held binding and claim preparation from actual Root acceptance; no execution admission.','sourceAcceptance':ap,'sourceBroadConjunction':bp,'bookkeepingReturn':book,'sourceDigest':a['sourceDigest'],'sourceInventory':b['sourceInventory'],'selectedDelta':b['selectedSourceDelta'],'summary':b['summary'],'binding':held,'documents':[pin(O/n) for n in files],'verified':{'directPinsMatched':len(checked),'originalInventoryModesDeltaReused':True,'sourceReviewAndFinalOperatorFreshResultPinsMatched':True,'allFourOutputLocationsAbsent':True,'allExistingMarkdownLinksResolve':True,'onlyDeclaredFutureOutputLinksAbsent':True,'mismatches':[]},'remaining':['Separate concrete Root build activation and admitted binding/command','Successful exact checkpoint and byte-equal clean reproduction','Independent exact packaging review and separate Root install activation','Actual installation and post-install verification receipts'],'activation':None,'executionEnabled':False,'effects':{'writesOnly':str(O),'git':0,'index':0,'source':0,'tests':0,'builds':0,'repack':0,'install':0,'sdk':0,'providers':0,'cleanup':0},'returnBoundary':'Frozen; stop pending separate activation.'})
print(json.dumps({'return':pin(O/'PREPARATION_RETURN.json'),'binding':held,'sourceRelation':pin(O/'SOURCE_ARTIFACT_RELATION.json'),'claim':pin(O/'BOUNDED_CANDIDATE_CLAIM.md'),'launchProposal':pin(O/'LAUNCH_PROPOSAL.json'),'directPinsMatched':len(checked),'outputAbsences':absences,'activation':None,'executionEnabled':False},indent=2))
