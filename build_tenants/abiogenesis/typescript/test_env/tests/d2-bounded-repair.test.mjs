import test from "node:test";
import assert from "node:assert/strict";
import {packageRoot,load,projectionHarness,capturedEnvelopeSkip} from "../support/d2-bounded-harness.mjs";
import {nativePublications,constructD2FrameDeclarations} from "../support/d2-frame-fixture.mjs";
import {runStaticD2} from "../support/d2-static-smoke.mjs";

test("actual four-Program fixture and prior five raw/closure discriminators remain valid",async()=>{
  const [product,gtl,validator]=await Promise.all([load("build/code/src/product/index.js"),load("build/code/src/gtl/index.js"),load("build/code/src/validator/index.js")]);
  const h=n=>`sha256:${String(n).repeat(64)}`,abiArtifact={productId:product.ABI5_PRODUCT_ID,packageName:product.ABI5_PACKAGE_NAME,packageVersion:product.ABI5_PACKAGE_VERSION,artifactDigest:h(1),productContentDigest:h(2),manifestDigest:h(3)};
  const natives=nativePublications(gtl,abiArtifact),bundle=constructD2FrameDeclarations({product,gtl,abiArtifact,abiPublications:natives}),publications=[...natives,bundle.sourcePublication,bundle.consumerPublication];
  assert.deepEqual(bundle.lifecycle.stages.map(stage=>stage.assembly.contentPolicy),Array(4).fill("role_scoped_worksite"));
  assert.deepEqual(bundle.lifecycle.stages.map(stage=>stage.assembly.worksiteContentByRole),[
    ...Array.from({length:3},()=>({author:"not_required",assessor:"not_required"})),
    {author:"current_inventory",assessor:"current_inventory"}]);
  const unique=(rows,key)=>[...new Map(rows.map(row=>[row[key],row])).values()],raw=(value,kind)=>{const r=validator.rawAdmitValue(value,kind,`contract://unit/d2/${kind}`);assert.equal(r.kind,"raw_admitted_value");return r;};
  let count=0;
  for(const publication of [bundle.sourcePublication,bundle.consumerPublication])for(const program of publication.programs){
    const p=raw(publication,"module_publication"),result=validator.validateProgram({declarationBasisDigest:p.subjectDigest,programPublication:p,program:raw(program,"gtl_program"),
      graphFunctions:unique(publications.flatMap(p=>p.graphFunctions).filter(g=>program.callableMembership.includes(g.name)),"name").map(g=>raw(g,"graph_function")),
      contracts:unique(publications.flatMap(p=>p.contracts),"contractRef").map(c=>raw(c,"contract_declaration")),implementationBindings:unique(publications.flatMap(p=>p.implementationBindings),"bindingRef").map(b=>raw(b,"implementation_binding")),
      closureContracts:unique(publications.flatMap(p=>p.closureContracts),"closureContractRef").map(c=>raw(c,"closure_contract")),rules:[],evaluators:[],
      ...(publication.semanticLifecycle===undefined?{}:{semanticLifecyclePublication:raw(bundle.consumerPublication,"module_publication"),semanticSourcePublication:raw(bundle.sourcePublication,"module_publication")})});
    assert.equal(result.kind,"program_validation",JSON.stringify(result));count++;
    for(const ref of program.callableMembership)assert.equal(publications.flatMap(p=>p.contributions).filter(c=>c.kind==="graph_function"&&c.declarationOrContractRef===ref).length,1,`exact published owner contribution: ${ref}`);
  }
  assert.equal(count,4);
  const smoke=await runStaticD2({packageRoot,sourcePublication:bundle.sourcePublication,lifecyclePublication:bundle.consumerPublication});assert.equal(smoke.results.length,5);
});

test("selection accepts the new C2 success/advance observation cause and conserves the old arm (guard/lookup stubs)",{skip:capturedEnvelopeSkip},async()=>{
  const h=await projectionHarness(),next=h.state("new-command",h.newCommand,{ordinal:51,invocation:h.first.execution.invocationAdmissionRef});
  assert.ok(h.select(h.first,next),"new C2 failed command can reach selection despite native success/advance");
  assert.ok(h.select(h.root,h.oldCause),"old C2 cause unchanged");
  const foreign=h.state("foreign-command",h.newCommand,{ordinal:52,invocation:"invocation://unit/foreign"});
  assert.equal(h.select(h.first,foreign),null,"command kind does not grant foreign invocation ancestry");
  const notObservation=h.state("ordinary-success",{kind:"unit_non_observation"},{ordinal:53,invocation:h.first.execution.invocationAdmissionRef});
  assert.equal(h.select(h.first,notObservation),null);
});

test("revision-projection parent recovers the native ancestor seed after later C1 failure (lookup stubs)",{skip:capturedEnvelopeSkip},async()=>{
  const h=await projectionHarness();
  assert.equal(h.first.execution.rawInputValue.kind,"semantic_revision_request","recorded seed counterexample");
  const result=h.project(h.second.request);assert.ok(result);
  assert.equal(h.originCalls.length,1);
  const [,seed,historical,current,eligible]=h.originCalls[0];
  assert.equal(seed,h.root.execution,"origin projection receives exact authenticated root basis, not revision request basis");
  assert.deepEqual(historical,h.first.call.result.value.current.worksite);assert.deepEqual(current,h.current);
  assert.ok(eligible.includes(h.root.execution.invocationAdmissionRef));assert.ok(eligible.includes(h.partial.execution.invocationAdmissionRef),"earlier successful C0s on partial-failure invocation stay eligible for unchanged currentness checks");
  assert.deepEqual(result.revisionBasis.retainedBindings,h.second.call.result.value.revisionBasis.retainedBindings);
  assert.deepEqual(result.current.assets,h.first.call.result.value.current.assets);
});

for(const mutation of ["missing-parent","crossed-coordinate","non-advancing-parent","future-parent","foreign-seed","request-not-seed"]){
  test(`ancestor seed refuses ${mutation} (lookup stubs)`,{skip:capturedEnvelopeSkip},async()=>{
    const h=await projectionHarness();
    if(mutation==="missing-parent")h.states.delete(h.root.coordinate.cCallRef);
    if(mutation==="crossed-coordinate")h.root.call.result.resultDigest=h.product.sha256Canonical("crossed-result");
    if(mutation==="non-advancing-parent")h.root.call.judgment.judgment="block";
    if(mutation==="future-parent")h.lookupOrder.find(row=>row.eventId===h.root.coordinate.judgmentEventRef).admissionOrdinal=100;
    if(mutation==="foreign-seed"){const input=structuredClone(h.stage);input.worksite.workspaceBinding.workspaceId="workspace://unit/foreign";h.root.execution.rawInputValue=input;}
    if(mutation==="request-not-seed")h.root.execution.rawInputValue=h.first.request;
    assert.equal(h.project(h.second.request),null);assert.equal(h.originCalls.length,0,"refuse before origin/currentness dependency reliance");
  });
}

test("revision projection reads its origins from the root input basis (lookup stubs)",{skip:capturedEnvelopeSkip},async()=>{
  const h=await projectionHarness();assert.ok(h.project(h.first.request));assert.equal(h.originCalls[0][1],h.root.execution);
});
