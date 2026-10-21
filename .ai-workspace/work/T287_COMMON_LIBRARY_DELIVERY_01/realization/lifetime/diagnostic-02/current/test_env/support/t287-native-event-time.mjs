import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile} from 'node:fs/promises';
import {join,resolve,relative,isAbsolute} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export async function loadTimeOwners(packageRoot) {
  const load = name => import(pathToFileURL(join(packageRoot,'build/code/src',name+'.js')));
  const [clock,hog,events,prefix,calculus,replay] = await Promise.all([
    load('abg/native_event_time'),load('hog/operator_support'),load('abg/event_store'),
    load('abg/event_prefix'),load('abg/event_calculus'),load('abg/replay'),
  ]);
  return {clock,hog,events,prefix,calculus,replay};
}

export async function freshTimeFixture(context, owners, proofRoot) {
  assert.ok(proofRoot && isAbsolute(proofRoot),'explicit absolute proof territory required');
  const relativeTmp=relative(resolve(proofRoot),resolve(tmpdir()));
  assert.ok(relativeTmp && !relativeTmp.startsWith('..') && !isAbsolute(relativeTmp),
    'fresh event-store lock directory must also be under the explicit proof territory');
  await mkdir(join(proofRoot,'fixtures'),{recursive:true});
  const scratch=await mkdtemp(join(proofRoot,'fixtures','event-time-'));
  const eventLogPath=join(scratch,'events.jsonl');
  const acquired=owners.events.createNewEmptyAppendSink({kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath});
  assert.ok('store' in acquired,JSON.stringify(acquired));
  context.after(()=>acquired.store.closeDurableLog());
  return {...acquired,eventLogPath};
}

// Explicit synthetic admission fixtures, not Public calls or an installed Run.
// This is the existing EventStore test envelope, used to discriminate native
// clock -> candidate -> pure preflight -> ordinary append -> historical replay.
export function timeFixtureCandidate(eventTime, ordinal, causationEventRefs=[]) {
  const invocationRef=`invocation://abiogenesis/event-time-unit/${ordinal}`;
  return {kind:'public_operation_admitted',eventTime,aggregateType:'workspace',aggregateId:invocationRef,
    parentAggregateId:null,causationEventRefs,correlationId:`correlation://abiogenesis/event-time-unit/${ordinal}`,
    workflowVersion:'5.0.0',scopeClass:'workspace',basisId:'basis://abiogenesis/event-time-unit',
    payload:{invocationDigest:'sha256:'+'1'.repeat(64),invocationRef,operationId:'abg.operation.project.read',variant:'status'}};
}

export const selectedTimeOwners = Object.freeze({
  'abg/actor_process.ts': {native:5, preserved:{'event.eventTime':1}},
  'abg/c_call.ts': {native:10, preserved:{'basis.eventTime':6}},
  'abg/closure.ts': {native:4},
  'abg/execution_basis.ts': {native:4},
  'abg/invocation_admission.ts': {native:0, sharedNativeSamples:1, preserved:{invocationAdmissionEventTime:2}},
  'abg/open_call.ts': {native:3},
  'abg/traversal_cursor.ts': {native:1},
  'abg/traversal_route.ts': {native:4},
  'hog/operator_support.ts': {native:1},
  'owner_bindings/run_invocation.ts': {native:7},
});

export async function sourceTimeExpressions(packageRoot) {
  const imported=await import(pathToFileURL(join(packageRoot,'node_modules/typescript/lib/typescript.js')));
  const ts=imported.default??imported,rows=[];
  for(const [path,expected] of Object.entries(selectedTimeOwners)) {
    const source=await readFile(join(packageRoot,'code/src',path),'utf8');
    const tree=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true);
    const fields=[];
    const visit=node=>{
      if(ts.isPropertyAssignment(node)&&node.name.getText(tree)==='eventTime') {
        let owner=node.parent;
        while(owner&&!ts.isFunctionDeclaration(owner))owner=owner.parent;
        fields.push({path,line:tree.getLineAndCharacterOfPosition(node.getStart(tree)).line+1,
          expression:node.initializer.getText(tree),owner:owner?.name?.getText(tree)??'<callback>'});
      }
      ts.forEachChild(node,visit);
    };
    visit(tree);
    if(expected.sharedNativeSamples) {
      const captures=[];
      const capture=node=>{
        if(ts.isVariableDeclaration(node)&&node.name.getText(tree)==='invocationAdmissionEventTime')
          captures.push(node.initializer?.getText(tree));
        ts.forEachChild(node,capture);
      };
      capture(tree);
      assert.deepEqual(captures,['sampleNativeEventTime()'],'one native capture covers both paired fields');
    }
    const native=fields.filter(row=>row.expression==='sampleNativeEventTime()');
    assert.equal(native.length,expected.native,`${path}: native producer coverage`);
    const preserved=fields.filter(row=>row.expression!=='sampleNativeEventTime()');
    assert.equal(preserved.length,Object.values(expected.preserved??{}).reduce((a,b)=>a+b,0),`${path}: no unclassified caller seed`);
    for(const [expression,count] of Object.entries(expected.preserved??{}))assert.equal(preserved.filter(row=>row.expression===expression).length,count);
    if(path==='abg/c_call.ts')for(const row of preserved)assert.ok(
      ['planCCallRuntimeFailureClose','planPendingInteractionAdmission'].includes(row.owner),
      `only deterministic prepared plans retain basis time: ${row.owner}:${row.line}`);
    rows.push(...fields);
  }
  return rows;
}

// Executes the exact production field expression, not a retyped clock model.
// It is a field-level discriminator; it does not claim to run an entire owner.
export function evaluateTimeExpression(row, clock, fixedTime) {
  return Function('sampleNativeEventTime','basis','event','invocationAdmissionEventTime',`"use strict"; return (${row.expression});`)(
    clock.sampleNativeEventTime,{eventTime:fixedTime},{eventTime:fixedTime},fixedTime);
}

// Execute the exact compiled owner tail: digest/ref construction, native sample
// capture, complete transaction callback and receipt construction. Outer input
// validation is deliberately outside this component fixture's evidence scope.
export async function loadInvocationPairProducer(packageRoot, owners, afterAdmission) {
  const imported=await import(pathToFileURL(join(packageRoot,'node_modules/typescript/lib/typescript.js')));
  const ts=imported.default??imported;
  const source=await readFile(join(packageRoot,'build/code/src/abg/invocation_admission.js'),'utf8');
  const tree=ts.createSourceFile('invocation_admission.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  const owner=tree.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='admitInvocationWithRequest');
  assert.ok(owner?.body,'complete compiled owner required');
  const start=owner.body.statements.find(node=>ts.isVariableStatement(node)&&node.declarationList.declarations.some(d=>d.name.getText(tree)==='invocationAdmissionDigest'));
  assert.ok(start,'exact owner tail entry required');
  const tail=source.slice(start.getStart(tree),owner.body.end-1);
  const catalogHelper=tree.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text==='catalogViewRef');
  assert.ok(catalogHelper);
  const load=name=>import(pathToFileURL(join(packageRoot,'build/code/src',name+'.js')));
  const [digests,immutable,clock]=await Promise.all([load('shared/digests'),load('shared/immutable'),load('abg/native_event_time')]);
  const run=Function('store','input','basis','admissionBody','sha256Canonical','deepFreeze','sampleNativeEventTime',
    'admitNonEmptyRuntimeEventTransactionAtDurablePrefix','admitRuntimeEvent',
    `"use strict"; ${catalogHelper.getText(tree)}\n${tail}`);
  return {compiledTailSha256:sha256(tail),run:(store,input,basis,body)=>run(store,input,basis,body,
    digests.sha256Canonical,immutable.deepFreeze,clock.sampleNativeEventTime,
    owners.events.admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
    (store,candidate)=>{const event=owners.events.admitRuntimeEvent(store,candidate);afterAdmission(event);return event;})};
}
