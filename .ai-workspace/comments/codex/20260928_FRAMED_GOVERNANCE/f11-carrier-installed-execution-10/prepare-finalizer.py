"""Bounded adaptation of the saved Runtime09 finalizer; no execution of either finalizer."""
from pathlib import Path
import hashlib,json
E=Path(__file__).resolve().parent;R=E.parent/'f11-carrier-installed-execution-09'
text=(R/'close-runtime.py').read_text()
changes=[]
def replace(old,new):
    global text
    assert old in text,old
    text=text.replace(old,new);changes.append({'before':old,'after':new})
replace("assert operation==cfg['operation']","assert operation==cfg['runtimeOperation']")
replace("accepted=read(activation['inputAcceptance']['path'])","accepted=read('base-input-acceptance.json')\ncurrentRelease=read(activation['inputAcceptance']['path'])")
replace("assert accepted['releasedConditionalOperation']==operation","assert currentRelease is not None and operation==read('runtime-release.json')['operation']")
replace("state=optional('actual-positive-flow-state.json')","state=optional('actual-continuation-state.json')")
replace("root/'setup09-initial-durable-prefix.bin'","root/'runtime09-initial-durable-prefix.bin'")
replace("'exactCurrentPacket':pin(root/'f11-bound-packet.json'),'exactCurrentResourceManifest':pin(root/'f11-bound-resource-manifest.json'),",
        "'exactCurrentPacket':pin(cfg['inputPacket']['path']),'exactCurrentResourceManifest':pin(cfg['inputManifest']['path']),")
start=text.index("ten=['transportDigest'");end=text.index('if success:\n',start)
text=text[:start]+"""correspondence=read('retained-evidence-correspondence.json')
check(all(correspondence['checks'].values()),'saved original J/transport/artifact/native correspondence')
write('result-evidence-contract-correspondence.json',{'canonicalRetainedCorrespondence':correspondence,
    'actualNewColdF11Consumption':consumption,'RootAcceptedOriginalCompanion':cfg['originalPositiveAcceptance'],
    'statusColumnsNotInventedInJudgmentSource':True,'completeRemainingPath':success})
"""+text[end:]
changes.append({'delta':'replace recursive ten-field bag collector with exact canonical retained correspondence and actual cold consumer'})
replace("check(len(completed)==3,'three actually completed Runs',len(completed))",
        "check(len(completed)==2,'two new actually completed Runs plus accepted original parent',len(completed))")
replace("check(len(good_reads)==6 and len({r['call']['label']for r in good_reads})==6,'six distinct fresh CLI readbacks',len(good_reads))",
        "check(len(good_reads)==4 and len({r['call']['label']for r in good_reads})==4,'four distinct new reads plus two accepted original reads',len(good_reads))")
replace("flow.get('mechanicalPath')=='completed'","flow.get('mechanicalPath')=='completed_remaining_path'")
replace("    check(bool(matches),'all ten metadata fields conserved in actual admitted evidence and original J')\n",'')
replace("'completedRunReceipts':run_calls,'freshCLIReadReceipts':read_calls,'originalChildJProof':proof,",
        "'newCompletedRunReceipts':run_calls,'newFreshCLIReadReceipts':read_calls,'originalChildJProof':read('retained/actual-assessment-proof.json'),\n        'acceptedOriginalParentAndTwoReads':cfg['originalPositiveAcceptance'],'totalCompletedRuns':len(completed)+1,'totalFreshReads':len(good_reads)+2,")
replace("proof=optional('actual-assessment-proof.json')","proof=read('retained/actual-assessment-proof.json')")
replace("'complete mechanical carrier'","'complete remaining mechanical carrier'")if "'complete mechanical carrier'"in text else None
replace("check(all(r['afterActorExit']=='absent'for r in helper_probes),'all recorded helpers absent')",
        "check(all(r['afterActorExit']=='absent'for r in helper_probes),'all recorded helpers absent')\ncheck(not helper_pids,'remaining deterministic path did not dispatch an actor',helper_pids)")
replace("'controlledActorStarts':len(helper_pids),'helperPidAfterClose':helper_probes,",
        "'controlledActorStarts':len(helper_pids),'helperPidAfterClose':helper_probes,\n    'acceptedOriginalCompletedRuns':1,'acceptedOriginalFreshReads':2,'totalCompletedRuns':len(completed)+1,'totalFreshCLIReads':len(good_reads)+2,\n    'borrowedInputBodies':[cfg['inputPacket'],cfg['inputManifest']],'RootOriginalCompanionAcceptance':cfg['originalPositiveAcceptance'],")
replace("'futureReopen':'separate exact Root grant required','semanticQualification':False}",
        "'futureReopen':'separate exact Root grant required','semanticQualification':False,'acceptedOriginalParentAndReads':cfg['originalPositiveAcceptance']}")
replace("'originalPrefixUnchanged':prefix_ok,'actualPublicCalls':len(calls),'completedRuns':len(completed),'freshCLIReads':len(good_reads),",
        "'originalPrefixUnchanged':prefix_ok,'actualPublicCalls':len(calls),'completedRuns':len(completed),'freshCLIReads':len(good_reads),\n    'acceptedOriginalCompletedRuns':1,'acceptedOriginalFreshReads':2,'totalCompletedRuns':len(completed)+1,'totalFreshCLIReads':len(good_reads)+2,")
text=text.replace("print(json.dumps({'status':'CLOSED'","print(json.dumps({'status':'CLOSED'")
compile(text,str(E/'close-runtime.py'),'exec')
with(E/'close-runtime.py').open('x')as f:f.write(text)
with(E/'finalizer-adaptations.json').open('x')as f:json.dump({'donor':str(R/'close-runtime.py'),
    'donorSHA256':hashlib.sha256((R/'close-runtime.py').read_bytes()).hexdigest(),
    'currentSHA256':hashlib.sha256(text.encode()).hexdigest(),'changes':changes,
    'ProductImports':0,'RuntimeCalls':0,'successAndFirstFailureBranches':True},f,indent=2);f.write('\n')
print(json.dumps({'status':'SUCCESS_AND_FIRST_FAILURE_FINALIZER_PREPARED','changes':len(changes),'RuntimeCalls':0}))
