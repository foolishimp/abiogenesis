"""Pure saved-evidence descriptor arrangement; no framework imports or owner calls."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, os, resource, shutil, stat, time, traceback

E = Path(__file__).resolve().parent
G = E.parent
D = G / 'f11-carrier-installed-execution-10'
R = G / 'f11-carrier-installed-execution-09'
C = G / 'rc1-runtime10-cold-triage-runtime11-controls-01'
began = time.monotonic()
operation = 'T287_F11_C09_NATIVE_CHILD_SELECTION_PREPARATION_11'

def read(p):
    return json.loads(Path(p).read_bytes())

def digest(value):
    body = json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
    return 'sha256:' + hashlib.sha256(body).hexdigest()

def pin(p):
    p = Path(p)
    with p.open('rb') as f:
        sha = hashlib.file_digest(f, 'sha256').hexdigest()
    return dict(path=str(p), bytes=p.stat().st_size, sha256=sha,
                mode=stat.S_IMODE(p.stat().st_mode))

def put(name, value):
    with (E / name).open('x') as f:
        json.dump(value, f, indent=2, ensure_ascii=False)
        f.write('\n')

def one(rows):
    assert len(rows) == 1, ('one exact saved occurrence required', len(rows))
    return rows[0]

copies = []
def exact_copy(src, dst):
    src, dst = Path(src), E / dst
    assert not dst.exists()
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dst)
    os.chmod(dst, stat.S_IMODE(src.stat().st_mode))
    a, b = pin(src), pin(dst)
    assert (a['bytes'], a['sha256'], a['mode']) == (b['bytes'], b['sha256'], b['mode'])
    copies.append(dict(source=a, copy=b, bodyExact=True, originalAttributionTransferred=False))

def freeze(work_result, checks=None):
    elapsed = (time.monotonic() - began) * 1000
    put('preparation-accounting.json', dict(operation=operation, elapsedMs=elapsed,
        maxRSSBytesMacOS=resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
        HOME=os.environ.get('HOME'), heap='default unchanged', ProductImports=0,
        ownerCalls=0, resourceReopens=0, RuntimeEffects=0, providerCalls=0,
        syntaxAndDiagnostic='accepted Preparation10 evidence reused; no affected module body',
        inputManifestBorrowed=True, fullOwnerPreparationRepeated=False))
    put('preparation-closure.json', dict(status='CLOSED', operation=operation, role='Worker',
        workResult=work_result, Runtime11Activated=False, ProductImports=0, RuntimeEffects=0,
        firstFailurePolicy='no retry', writesAfterFreeze='STOPPED',
        unknowns=['full child cold projection', 'F11/AF22 continuation and four new reads',
                  'parent-alias release applicability', 'genuine semantic qualification']))
    records, directories = [], []
    for current, sub, names in os.walk(E, followlinks=False):
        sub.sort(); names.sort()
        for name in sub:
            p = Path(current) / name
            assert not p.is_symlink()
            directories.append(dict(path=str(p.relative_to(E)), mode=stat.S_IMODE(p.stat().st_mode)))
        for name in names:
            p = Path(current) / name
            assert p.is_file() and not p.is_symlink()
            r = pin(p); r['path'] = str(p.relative_to(E)); r['kind'] = 'file'
            records.append(r)
    put('preparation-freeze.json', dict(status='CLOSED', workResult=work_result,
        operation=operation, role='Worker', records=sorted(records, key=lambda r:r['path']),
        directories=sorted(directories, key=lambda r:r['path']), recordCount=len(records),
        bodyBytes=sum(r['bytes'] for r in records), directoryCount=len(directories), links=0,
        checks=checks, Runtime11Activated=False, ProductImports=0, RuntimeEffects=0,
        frozenAt=datetime.now(timezone.utc).isoformat(), excludedSelf='preparation-freeze.json',
        writesAfterFreeze='STOPPED'))
    print(json.dumps(dict(status='CLOSED', workResult=work_result,
        freeze=pin(E/'preparation-freeze.json'), records=len(records), directories=len(directories))))

try:
    activation = read(E/'preparation-activation.json')
    assert activation['operation'] == operation and not activation['runtimeActivated']
    donor_freeze = read(D/'preparation-freeze.json')
    donor_map = {r['path']:r for r in donor_freeze['records']}
    for name in ['run-continuation.mjs', 'close-runtime.py', 'supervise.py', 'observe-process.py',
                 'diagnostic-trap-probe.mjs', 'budgets.json', 'caller-budget-proposal.json',
                 'selected-core.json', 'prospective-cases.json', 'parent-selection.json',
                 'base-input-acceptance.json', 'freeze.json', 'setup09-initial-entry-pins.json',
                 'retained-evidence-correspondence.json', 'syntax-and-module-closure.json',
                 'diagnostic-probe-result.json', 'diagnostic-probe-close.json',
                 'reachable-serialization-inspection.json', 'resource-plan.json']:
        p = D/name; q = pin(p); old = donor_map[name]
        assert (q['bytes'],q['sha256'],q['mode']) == (old['bytes'],old['sha256'],old['mode'])
        exact_copy(p, name)
    for p in sorted((D/'f11').glob('*.mjs')):
        exact_copy(p, 'f11/'+p.name)
    for p in sorted((D/'retained').iterdir()):
        if p.is_file(): exact_copy(p, 'retained/'+p.name)
    for name in ['worker-request.txt','subject-pins.json','triage.md','runtime-request.txt']:
        exact_copy(C/name, 'controls/'+name)
    for name in ['npmrc','globalnpmrc']:
        exact_copy(D/'task-config'/name, 'task-config/'+name)
    for name in ['task-tmp','task-cache']:(E/name).mkdir()

    original = read(D/'retained/actual-assessment-proof.json')
    snapshot = R/'closed-runtime-events.jsonl'
    raw = snapshot.read_bytes()
    plan = read(E/'resource-plan.json')
    assert len(raw) == plan['initialPrefixBytes']
    assert hashlib.sha256(raw).hexdigest() == plan['initialPrefixSha256']
    decoded, inline, references = [], {}, []
    slots = {'basis_admitted':('basis_input','rawInputValue'),
             'c_call_result_admitted':('c_call_result_value','value')}
    for index, record in enumerate(json.loads(line) for line in raw.splitlines()):
        if record.get('kind') == 'abg_admitted_body_reference_record':
            assert set(record) == {'kind','codecVersion','event','bodyReference'}
            assert record['codecVersion'] == 1
            ref, event = record['bodyReference'], copy.deepcopy(record['event'])
            assert set(ref) == {'sourceEventRef','sourcePayloadDigest','sourceSlot','bodyDigest'}
            source = inline[ref['sourceEventRef']]
            target_slot, target_field = slots[event['kind']]
            assert target_field not in event['payload']
            assert ref['sourcePayloadDigest'] == source['event']['payloadDigest']
            assert ref['sourceSlot'] == source['slot'] and ref['bodyDigest'] == source['digest']
            event['payload'][target_field] = source['value']
            assert digest(event['payload']) == event['payloadDigest']
            references.append(dict(recordIndex=index, restoredEventRef=event['eventId'],
                sourceEventRef=ref['sourceEventRef'], sourcePayloadDigest=ref['sourcePayloadDigest'],
                sourceSlot=ref['sourceSlot'], bodyDigest=ref['bodyDigest'],
                restoredPayloadDigest=event['payloadDigest'], sourceIndex=source['index']))
        else:
            event = record
            if event.get('kind') in slots:
                slot, field = slots[event['kind']]
                if field in event['payload']:
                    assert digest(event['payload']) == event['payloadDigest']
                    inline[event['eventId']] = dict(event=event, slot=slot,
                        value=event['payload'][field], digest=digest(event['payload'][field]), index=index)
        decoded.append(event)

    terminal, J = original['terminal'], original['terminal']['value']
    child_ref = J['source']['cCallRef']
    child = one([e for e in decoded if e.get('kind')=='c_call_opened' and e['aggregateId']==child_ref])
    result = one([e for e in decoded if e.get('kind')=='c_call_result_admitted' and e['aggregateId']==child_ref])
    judgment = one([e for e in decoded if e.get('kind')=='c_call_judged' and e['aggregateId']==child_ref])
    basis = one([e for e in decoded if e.get('kind')=='basis_admitted' and e['payload']['basisRef']==child['basisId']])
    parent = one([e for e in decoded if e.get('kind')=='c_call_result_admitted' and e['payload'].get('resultRef')==terminal['result']['ref']])
    assert child['payload']['callClass']=='leaf'
    assert result['payload']['value']==J==parent['payload']['value']
    assert digest(J)==terminal['valueDigest']==result['payload']['valueDigest']==parent['payload']['valueDigest']
    assert result['payload']['resultClass']=='success' and judgment['payload']['judgment']=='advance'
    assert judgment['payload']['resultRef']==result['payload']['resultRef']
    assert judgment['payload']['resultDigest']==result['payload']['resultDigest']
    selection = copy.deepcopy(original['selection'])
    selection['result'] = dict(ref=result['payload']['resultRef'], digest=result['payload']['resultDigest'])
    assert selection['result']!=original['selection']['result']
    assert basis['payload']['programRef']==selection['programRef']==terminal['producer']['program']['ref']
    assert basis['payload']['invocationAdmissionRef']==selection['invocationAdmissionRef']==terminal['producer']['invocationAdmissionRef']
    assert basis['payload']['rawInputValue']['task']==J['task']
    assert basis['payload']['rawInputValue']['plan']==J['plan']
    slot = one([s for s in J['plan']['slots'] if s['slotRef']==selection['slotRef']])
    assert slot['task']==selection['task']==dict(ref=J['task']['taskRef'],digest=J['task']['taskDigest'])
    assert child['payload']['graphFunctionRef']==basis['payload']['graphFunctionRef']==slot['graphFunctionRef']
    assert child['payload']['programLocusRef']==slot['programLocusRef']
    assert original['proof']['resource']==J['task']['resource']
    fold_refs = original['childFoldback']
    witnesses = {name:one([e for e in decoded if e['eventId']==ref]) for name,ref in fold_refs.items() if name.endswith('EventRef')}
    fold = witnesses['foldbackEventRef']
    assert fold['payload']['parentCCallRef']==terminal['producer']['cCallRef']
    assert fold['payload']['childGraphCallId']==child['graphCallId']==fold_refs['childGraphCallRef']
    assert fold['payload']['outputDigest']==terminal['valueDigest']
    assert result['runId']==parent['runId']==terminal['producer']['runRef']
    assert len(references)==2 and all(r['sourceIndex']<r['recordIndex'] for r in references)
    assert parent['eventId'] in [r['restoredEventRef'] for r in references]
    assert basis['eventId'] in [r['restoredEventRef'] for r in references]
    derived = copy.deepcopy(original)
    derived['selection'] = selection
    derived['proof']['selections'] = [selection]
    assert derived['terminal']==original['terminal'] and derived['childFoldback']==original['childFoldback']
    assert {k:v for k,v in derived['proof'].items()if k!='selections'}=={k:v for k,v in original['proof'].items()if k!='selections'}
    put('selected-native-child-proof.json', derived)
    put('native-child-selection-checks.json', dict(status='GO_SAVED_NATIVE_CHILD_SELECTION_ONLY',
        originalProof=pin(D/'retained/actual-assessment-proof.json'), derivedProof=pin(E/'selected-native-child-proof.json'),
        snapshot=pin(snapshot), bodyReferenceRelations=references, selectedChild=selection,
        originalParentSelection=original['selection'], originalJValueDigest=terminal['valueDigest'],
        originalJJudgmentDigest=J['judgmentDigest'], childResultEventRef=result['eventId'],
        childOpenedEventRef=child['eventId'], childBasisEventRef=basis['eventId'],
        childGraphFunction=slot['graphFunctionRef'], childLocus=slot['programLocusRef'],
        parentCompanion=fold_refs, allChecksPassed=True, originalTerminalPreserved=True,
        parentResultPresentThroughCanonicalBodyReference=True,
        wrongParentSelection='existing opened-workflow reconstruction lacks sourceCursor/graphFunction; source-backed triage, not missing Result or changed J',
        parentAliasReleaseApplicability='unresolved', fullChildColdPass='unknown; no Product import or owner call',
        decoderSource=pin(G/'final-candidate-construction-09/final-install/node_modules/@abiogenesis/typescript-tenant/build/code/src/abg/event_body_encoding.js')))

    cfg = read(D/'driver-config.json')
    old_cfg = copy.deepcopy(cfg)
    cfg.update(runtimeOperation='T287_F11_C09_CARRIER_EXECUTION_11', preparationOperation=operation,
               Q08Root=str(E), originalProof=pin(E/'selected-native-child-proof.json'),
               currentClosedHandoff=pin(E/'retained/closed-event-resource-handoff.json'))
    cfg['sourceCopies'] = [r for r in copies if r['copy']['path'].endswith(('.mjs','.py'))]
    put('driver-config.json',cfg)
    env = read(D/'runtime-environment.json')
    env = {k:v.replace(str(D),str(E)) if isinstance(v,str)else v for k,v in env.items()}
    put('runtime-environment.json',env)
    pre = read(D/'preimages.json')
    pre['finiteDependencyPins'].extend([pin(C/'worker-request.txt'), pin(C/'triage.md'),
        pin(C/'subject-pins.json'),pin(D/'final-runtime-freeze.json'),pin(D/'preparation-freeze.json')])
    put('preimages.json',pre)
    for name in ['runtime-activation.template.json','runtime-release.template.json']:
        template = read(D/name)
        template['operation']=cfg['runtimeOperation']
        if 'executionRoot' in template:template['executionRoot']=str(E)
        put(name,template)
    put('donor-correspondence.json',dict(operation=operation, copies=copies,
        delta='only derived observation selection.result and proof.selections[0].result; operation/root/config pins rebind',
        originalDescriptorChanged=False, canonicalFrameworkDefinitionsChanged=False,
        controllerOracleCallerFinalizerBodyExact=True, fullPopulationsBorrowedUnchanged=True,
        oldConfig=pin(D/'driver-config.json'), newConfig=pin(E/'driver-config.json'),
        unchangedConfigFields=[k for k in old_cfg if old_cfg[k]==cfg[k]]))
    modules=[E/'run-continuation.mjs',E/'diagnostic-trap-probe.mjs',*sorted((E/'f11').glob('*.mjs'))]
    import re
    for p in modules:
        for rel in re.findall(r"from\s+['\"](\.[^'\"]+)['\"]",p.read_text()):assert(p.parent/rel).is_file()
    assert len(modules)==10
    assert read(E/'diagnostic-probe-result.json')['fullOwnerToJSONCalls']==0
    assert all(read(E/'retained-evidence-correspondence.json')['checks'].values())
    event=Path(plan['eventLogPath']);s=event.stat()
    assert pin(event)['sha256']==plan['initialPrefixSha256'] and s.st_size==plan['initialPrefixBytes']
    assert(s.st_dev,s.st_ino)==(plan['eventDevice'],plan['eventInode'])
    put('preparation-checks.json',dict(status='GO_PREPARED_NATIVE_CHILD_CONTINUATION_ONLY',
        nativeChildSavedChecks='native-child-selection-checks.json', modules=10,
        syntax='exact module bodies reuse accepted Preparation10 syntax; local relative closures checked',
        diagnosticProbe='accepted unchanged Preparation10 success/wrong-kind trap reused, not rerun',
        dependentIdentities='existing framework recomputes proof-bearing input identities at future owner preparation',
        Runtime11Activated=False, event=pin(event), eventDevice=s.st_dev,eventInode=s.st_ino,
        preservedOriginalParentAndTwoReads=True, fullColdPassUnknown=True, parentAliasApplicabilityUnknown=True,
        ProductImports=0, ownerCalls=0, RuntimeEffects=0))
    put('destination-lifecycle.json',dict(borrowedImmutable=['C09/Setup09/Q15','Runtime09 original parent/J/fold/closures/two reads','Runtime10 failure and Preparation10 accepted code/checks'],
        newlyDerived=['selected-native-child-proof.json','current driver config/environment/templates'],
        freshFutureOutputs=['runtime-activation.json','runtime-release.json','flow supervisor/call/read receipts','final-runtime-freeze.json'],
        consumedProducersReplayed=False, Runtime11Activated=False))
    with(E/'preparation-return.md').open('x')as f:
        f.write('CLOSED PREPARED_NATIVE_CHILD_CONTINUATION_ONLY. Original admitted native child Result selected in two descriptor locations; original parent terminal/J/fold/closures/two reads preserved. Exact accepted controller, oracle, strict caller and success/failure finalizer reused. Saved child/Task/plan/Program/admission/body-reference relations and local module closure pass; actual child cold projection and parent-alias release applicability remain unknown. Zero Product imports, owner calls or Runtime/resource effects. All writes stop at preparation-freeze.json.\n')
    freeze('PREPARED_NATIVE_CHILD_CONTINUATION_ONLY', dict(savedChildRelations=True, originalCompanionPreserved=True, localClosure=True))
except Exception as error:
    put('preparation-first-failure.json', dict(errorType=type(error).__name__,message=str(error),trace=traceback.format_exc(), noRetry=True, ProductImports=0,RuntimeEffects=0))
    freeze('STOPPED_FIRST_PREPARATION_FAILURE')
    raise
