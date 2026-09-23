import assert from "node:assert/strict";
import { readFile, mkdir, writeFile, realpath, lstat } from "node:fs/promises";
import { dirname, join, basename, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolveInstalledPackageExport } from "./root-cli-environment.mjs";
import { pathToFileURL, fileURLToPath } from "node:url";
const exec = promisify(execFile);
export async function resolveFreshSdkReplayModule(cliHost) {
  return pathToFileURL(await resolveInstalledPackageExport({cliHost}, "@abiogenesis/typescript-tenant/abg")).href;
}
// Select retained caller evidence only. Existing installed owners reconstruct its basis below.
export function selectPreservedCatalogReceipt(priorCall, receipt) {
  assert.deepEqual(priorCall.invocation.definitionKey, {operationId:"abg.operation.catalog.admit",memberKey:"admit"});
  assert.deepEqual(receipt.definitionKey, priorCall.invocation.definitionKey);
  assert.equal(receipt.invocationRef, priorCall.invocation.invocationRef);
  assert.equal(receipt.resources.disposition,"read_only_unchanged");
  const closeHandoff=receipt.resources.eventResource.closeHandoff;
  assert.deepEqual(closeHandoff.prefix,receipt.resources.eventResource.entryPrefix);
  assert.deepEqual(closeHandoff,priorCall.resources.eventResource.closeHandoff);
  if(receipt.ownerOutput.outcomeKind==="result") {
    assert.equal(receipt.exitCode,0);
    assert.deepEqual(receipt.ownerOutput.value.catalog,receipt.resources.catalog);
    return {closeHandoff,preservedCatalogReceipt:receipt};
  }
  assert.equal(receipt.ownerOutput.outcomeKind,"refusal");
  assert.equal(receipt.ownerOutput.value.code,"conservation_failure");
  return {closeHandoff,preservedCatalogReceipt:null};
}
export function validateRetainedStdoSourceEvidence(evidence,{product,abg}) {
  const {setup,source,missing,catalogReceipt,viewCall,viewReceipt}=evidence;
  const closeHandoff=missing.closeHandoff;
  assert.equal(source.call.invocation.request.program.ref,PILOT_IDS.sourceProgramRef);
  assert.equal(source.ran.exitCode,0);assert.equal(source.ran.ownerOutput.outcomeKind,"result");
  assert.equal(source.ran.ownerOutput.value.disposition,"completed");
  assert.equal(source.ran.invocationRef,source.call.invocation.invocationRef);
  assert.deepEqual(source.closeHandoff,closeHandoff);
  const events=abg.readRuntimeEventsAtDurablePrefix(closeHandoff.prefix),prefix=abg.selectValidatedRuntimeEventPrefix(events);
  const admission=abg.rehydrateInvocationAdmissionAtPrefix(prefix,source.ran.resources.invocationAdmission.ref);
  assert.ok(admission);
  const resultBasis=abg.deriveInvocationSourceResultBasisAtPrefix(prefix,{publicAuthorityDigest:source.call.invocation.invocationDigest,
    runtimeInvocationRef:admission.invocationRef,invocationAdmissionRef:source.ran.resources.invocationAdmission.ref,
    runId:source.ran.ownerOutput.value.run.ref,resultRef:source.ran.ownerOutput.value.result.ref});
  assert.ok(resultBasis);assert.deepEqual(resultBasis,source.resultBasis,"saved source equals current installed-owner projection");
  for(const read of Object.values(source.reads)){
    assert.equal(read.exitCode,0);assert.equal(read.ownerOutput.outcomeKind,"result");
    assert.deepEqual(read.resources.eventResource.closeHandoff,closeHandoff);
  }
  assert.deepEqual(source.reads.run_result.ownerOutput.value.projection.result,source.ran.ownerOutput.value.result);
  const replay=abg.projectRunSemanticReplayProjection(prefix,source.ran.ownerOutput.value.run.ref);
  assert.deepEqual(source.reads.run_replay.ownerOutput.value.projection.replay,
    {ref:replay.physicalCoordinates.scopedReplayRef,digest:replay.physicalCoordinates.scopedReplayDigest});
  assert.deepEqual(source.input,setup.fixture.source.input);
  assert.deepEqual(resultBasis.sourceResultValue.declaration,setup.fixture.source.declaration);
  assert.equal(resultBasis.sourceResultValue.coverage.obligations.length,2);
  const envelope=product.constructSemanticStageEnvelope({sourceHandoff:resultBasis.sourceResultValue,lifecycle:setup.fixture.lifecycle,
    taskData:setup.fixture.scenario,evaluationData:setup.fixture.oracle,worksite:null});
  const refused=missing.outcome.receipt;
  assert.equal(missing.call.invocation.request.program.ref,PILOT_IDS.programRef);
  assert.equal(missing.call.resources.stdoEnvironmentResources,undefined);
  assert.equal(refused.invocationRef,missing.call.invocation.invocationRef);
  assert.equal(refused.ownerOutput.outcomeKind,"refusal");assert.equal(refused.ownerOutput.value.code,"invalid_capability");
  assert.ok(refused.ownerOutput.value.issuePaths.includes("/stdoEnvironment/cause/missing_binding"));
  assert.deepEqual(refused.resources.eventResource.closeHandoff,closeHandoff);
  assert.deepEqual(refused.resources.eventResource.entryPrefix,closeHandoff.prefix);
  assert.deepEqual(missing.call.invocation.request.input.value,envelope,"retained refusal applies to the exact reconstructed native input");
  assert.deepEqual(missing.call.resources.catalog,setup.catalog);assert.deepEqual(missing.call.resources.catalogView,setup.catalogView);
  assert.equal(events.filter(event=>event.kind==="actor_transport_binding_admitted").length,0);
  assert.equal(catalogReceipt.exitCode,0);assert.equal(catalogReceipt.ownerOutput.outcomeKind,"result");
  assert.deepEqual(catalogReceipt.ownerOutput.value.catalog,setup.catalogScope.catalog);
  assert.equal(viewReceipt.invocationRef,viewCall.invocation.invocationRef);
  assert.equal(viewReceipt.exitCode,0);assert.equal(viewReceipt.ownerOutput.outcomeKind,"result");
  assert.deepEqual(viewReceipt.ownerOutput.value.view,setup.catalogScope.view);
  assert.deepEqual(viewCall.invocation.request.catalog,setup.catalogScope.catalog);
  return {...evidence,closeHandoff,envelope,eventCount:events.length};
}
export async function readRetainedStdoSourceEvidence(path,{product,abg}) {
  const packet=JSON.parse(await readFile(path,"utf8"));
  assert.equal(packet.kind,"stdo_pilot_source_evidence");
  const evidence={};
  for(const name of ["setup","source","missing","catalogReceipt","viewCall","viewReceipt"]){
    const member=packet.members[name],bytes=await readFile(member.path);
    assert.equal(product.sha256Bytes(bytes),"sha256:"+member.sha256,`retained ${name} bytes`);
    const value=JSON.parse(bytes);evidence[name]=name.endsWith("Receipt")?value.receipt:name==="viewCall"?value.invocation:value;
  }
  const current=evidence.missing.closeHandoff.prefix;
  assert.equal(current.coordinateDigest,packet.prefixCoordinateDigest);
  const eventPath=fileURLToPath(current.eventLogRef),bytes=await readFile(eventPath),info=await lstat(eventPath);
  assert.equal(bytes.length,current.prefixLength);assert.equal(product.sha256Bytes(bytes),current.prefixDigest);
  assert.equal(info.dev,current.storeIdentity.device);assert.equal(info.ino,current.storeIdentity.inode);
  return validateRetainedStdoSourceEvidence(evidence,{product,abg});
}
export async function proveFreshSdkReplay({cliHost,runRoot,scratch,prefix,runId,cliReplay,externalRoots,deadline}) {
  const packetPath=join(scratch,"fresh-sdk-replay-input.json"),outputPath=join(scratch,"fresh-sdk-replay-output.json");
  const moduleUrl=await resolveFreshSdkReplayModule(cliHost);
  const packet={prefix,runId,cliReplay,externalRoots};
  await writeFile(packetPath,JSON.stringify(packet,null,2)+"\n",{flag:"wx"});
  const script=`import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const packet=JSON.parse(await readFile(process.argv[1],"utf8"));
const abg=await import(process.argv[2]);
const access=packet.externalRoots.map(path=>({path,readAllowed:process.permission.has("fs.read",path)}));
assert.ok(access.every(row=>row.readAllowed===false));
assert.equal(process.permission.has("child"),false);
const events=abg.readRuntimeEventsAtDurablePrefix(packet.prefix);
const prefix=abg.selectValidatedRuntimeEventPrefix(events);
const projection=abg.projectRunSemanticReplayProjection(prefix,packet.runId);
assert.equal(projection.runId,packet.runId);
assert.deepEqual({ref:projection.physicalCoordinates.scopedReplayRef,digest:projection.physicalCoordinates.scopedReplayDigest},packet.cliReplay);
const changed=structuredClone(events),admission=changed.find(event=>event.kind==="invocation_admitted"&&event.payload.stdoEnvironment!==undefined);
assert.ok(admission);
admission.payload.stdoEnvironment.accesses[0].stdout.base64="e30=";
const freeze=value=>{if(value!==null&&typeof value==="object"){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
assert.throws(()=>abg.projectRunSemanticReplayProjection(abg.selectValidatedRuntimeEventPrefix(freeze(changed)),packet.runId));
console.log(JSON.stringify({kind:"installed_public_sdk_fresh_replay",prefix:packet.prefix,runId:packet.runId,
cliReplay:packet.cliReplay,moduleUrl:process.argv[2],externalAccess:access,childProcessAllowed:false,tamperedCopiedEvidence:"rejected_by_native_projection",projection}));`;
  const arguments_=["--permission","--allow-fs-read="+cliHost,"--allow-fs-read="+runRoot,"--allow-fs-read="+scratch,"--input-type=module","-e",script,packetPath,moduleUrl];
  const startedAt=new Date().toISOString(),pending=exec(process.execPath,arguments_,{cwd:cliHost,env:{...process.env,NODE_OPTIONS:""},
    timeout:Math.min(120_000,Math.max(1,Date.parse(deadline)-Date.now())),maxBuffer:128*1024*1024});
  await writeFile(join(scratch,"fresh-sdk-replay-launch.json"),JSON.stringify({pid:pending.child.pid,startedAt,command:process.execPath,arguments_},null,2)+"\n",{flag:"wx"});
  let result;
  try {result=await pending;}
  catch(error){await writeFile(join(scratch,"fresh-sdk-replay-failure.json"),JSON.stringify({name:error.name,message:error.message,code:error.code,signal:error.signal,
    stdout:error.stdout,stderr:error.stderr},null,2)+"\n",{flag:"wx"});throw error;}
  await writeFile(outputPath,result.stdout,{flag:"wx"});
  await writeFile(join(scratch,"fresh-sdk-replay-stderr.log"),result.stderr,{flag:"wx"});
  return JSON.parse(result.stdout);
}
export const PILOT_IDS = Object.freeze({
  productId:"product://stdo-note.example/pilot@5.0.0",packageName:"@abiogenesis-fixtures/stdo-note-pilot",packageVersion:"5.0.0",
  sourceModuleRef:"module://stdo-note.example/source@5",moduleRef:"module://stdo-note.example/note@5",
  sourceProgramRef:"program://stdo-note.example/source@5",programRef:"program://stdo-note.example/note@5",
  sourceGraphFunctionRef:"graph-function://stdo-note.example/source@5",graphFunctionRef:"graph-function://stdo-note.example/note@5",
  stageRef:"declaration://stdo-note.example/note-stage@5",stageGraphFunctionRef:"graph-function://stdo-note.example/note-stage@5",
  authorLocusRef:"locus://stdo-note.example/note/author@5",assessorLocusRef:"locus://stdo-note.example/note/assessor@5",
  sourceDeclarationRef:"declaration://stdo-note.example/source@5",environmentRef:"declaration://stdo-note.example/stdo-environment@5",
  descriptorRef:"descriptor://stdo-note.example/pilot@5",contributionManifestRef:"contribution-manifest://stdo-note.example/pilot@5",
});
function recordMembers(text) {
  return text.split("\n").flatMap(line=>{
    const m=/^\| (file|symlink) \| \x60([^\x60]+)\x60(?: -> \x60([^\x60]+)\x60)? \| \x60([a-f0-9]{64})\x60 \|$/u.exec(line);
    return m?[{type:m[1],path:m[2],target:m[3]??null,digest:"sha256:"+m[4]}]:[];
  }).sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
}
function exactHeading(bytes, heading) {
  const marker=Buffer.from("## "+heading+"\n"),startByte=bytes.indexOf(marker);
  assert.ok(startByte>=0);
  const next=bytes.indexOf(Buffer.from("\n## "),startByte+marker.length);
  const endByte=next<0?bytes.length:next+1;
  return {startByte,endByte,text:bytes.subarray(startByte,endByte).toString("utf8")};
}
export async function pilotEnvironmentDeclaration({gtl,product,inputRoot}) {
  const sourceRoot=await realpath("/Users/jim/Library/Application Support/STDO/releases/v2.5.0-rc.7");
  const representationRoot=await realpath("/Users/jim/Library/Application Support/STDO Representation/releases/v2.5.0-rc.7");
  const axiomRoot=await realpath("/Users/jim/Library/Application Support/Axiom Indexer/releases/v2.5.0-rc.7");
  const pythonPath=await realpath("/usr/local/bin/python3");
  const representationRecordPath=await realpath(join(inputRoot,"representation-release-record.md"));
  const axiomRecordPath=await realpath(join(inputRoot,"axiom-release-record.md"));
  const recordUri=child=>"https://raw.githubusercontent.com/foolishimp/specification_methodology/4824d5a05619e6957110b7ac97464b42ac84c096/"+child+"/releases/v2.5.0.md";
  const representationRecord=await readFile(representationRecordPath),axiomRecord=await readFile(axiomRecordPath);
  assert.equal(product.sha256Bytes(representationRecord),"sha256:6809a569ef20f8a3dcc41dc589752dd6f9de9df67e09eb4b4aca16dce45b83c4");
  assert.equal(product.sha256Bytes(axiomRecord),"sha256:d56528364f59265b2128b03af8abbae07ca1256acef19b11885c1fb11663c878");
  assert.equal(product.sha256Bytes(await readFile(join(sourceRoot,"manifest.json"))),"sha256:1f56029380604b0879fe322047fa8b38060297ba86b54bc8db8450d01ec034ae");
  const programPath="build_tenants/axiom_indexer/representation/stdo-v2.5.0-rc.7/axiomatic-program.json";
  const mapPath="build_tenants/axiom_indexer/representation/stdo-v2.5.0-rc.7/logical-constraint-map.json";
  const programBytes=await readFile(join(representationRoot,programPath)),mapBytes=await readFile(join(representationRoot,mapPath));
  const program=JSON.parse(programBytes),map=JSON.parse(mapBytes),hash=x=>product.sha256Canonical(x),bytes=x=>product.sha256Bytes(x);
  const framePath="standards/STDO_REFERENCE_FRAME_BASELINE.md",frameBytes=await readFile(join(sourceRoot,framePath));
  const contextRef="context://stdo-note.example/role-frame@5",memberRef="member://stdo-note.example/role-frame@5";
  const members=[{memberRef,path:framePath,byteCount:frameBytes.length,digest:bytes(frameBytes)}];
  const spans={author:exactHeading(frameBytes,"Derived Worker Frame"),assessor:exactHeading(frameBytes,"Derived Reviewer Frame")};
  const sourceBindings=role=>[{contextRef,memberRef,memberDigest:bytes(frameBytes),startByte:spans[role].startByte,endByte:spans[role].endByte,
    spanDigest:bytes(frameBytes.subarray(spans[role].startByte,spans[role].endByte))}];
  const companion=(role,record,tagObject)=>{
    const members=recordMembers(record.toString("utf8"));return {productRef:role==="representation"?"product://stdo-representation":"product://axiom-indexer",
      releaseRef:"refs/tags/"+(role==="representation"?"stdo_representation":"axiom_indexer")+"/v2.5.0-rc.7",tagObject,
      recordUri:recordUri(role==="representation"?"stdo_representation":"axiom_indexer"),recordDigest:bytes(record),
      inventoryDigest:gtl.stdoInventoryDigest(members),members};
  };
  const policyText={
    author:"Act as the bounded Worker for this declared note task. Apply the supplied source-owned Worker frame and explicit task constraints. Use the retrieved view as corpus evidence; preserve its conditions and unresolved judgments. For sourceQuotes, only member://stdo-note.example/task@5 in the original source section is eligible. The role-frame member and retrieved corpus member refs are not semantic source-citation targets. Return candidate content through the existing semantic author contract.",
    assessor:"Act as the independent Evaluator for this exact note candidate under the supplied source-owned Reviewer frame. Assess the declared rubric against original source and retrieved content, preserving uncertainty. For sourceQuotes, only member://stdo-note.example/task@5 in the original source section is eligible. The role-frame member and retrieved corpus member refs are not semantic source-citation targets. Return assessment only through the existing semantic assessor contract.",
  };
  const declaration=gtl.constructStdoRunEnvironmentDeclaration({
    kind:"stdo_run_environment_declaration",schemaVersion:"5.0.0",declarationRef:PILOT_IDS.environmentRef,
    source:{releaseUri:"stdo://releases/v2.5.0-rc.7/",manifestDigest:bytes(await readFile(join(sourceRoot,"manifest.json")))},
    representation:{...companion("representation",representationRecord,"a010992bd0b403c032f68df9496386bb06bbfa65"),
      program:{path:programPath,uri:program.uri,byteDigest:bytes(programBytes),canonicalDigest:hash(program)},
      map:{path:mapPath,uri:"urn:stdo-representation:map:stdo-v2.5.0-rc.7",byteDigest:bytes(mapBytes),canonicalDigest:map.map_sha256}},
    axiom:{...companion("axiom",axiomRecord,"95c5c4d268f7a5969a0d79d6384b47044788d346"),executablePath:"build_tenants/core/code/ac.py",
      outputContractPath:"skills/axiomatize-corpus/references/output-contract.md",outputContractVersion:"axiom-indexer.frame-projection@1",
      pythonExecutableDigest:bytes(await readFile(pythonPath))},
    contexts:[{contextRef,sourceLocator:"stdo://releases/v2.5.0-rc.7/",inventoryDigest:hash(members),members}],
    accesses:[{accessRef:"access://stdo-note.example/worker-index@5",operation:"project",mode:"materialized",
      frameIndexRefs:["urn:stdo-representation:frame-index:t009:complete-update-worker"],maxOutputBytes:2_000_000,timeoutMs:30_000}],
    roles:["author","assessor"].map(role=>({graphFunctionRef:PILOT_IDS.stageGraphFunctionRef,
      programLocusRef:role==="author"?PILOT_IDS.authorLocusRef:PILOT_IDS.assessorLocusRef,role,
      frameRefs:["stdo://releases/v2.5.0-rc.7/standards/STDO_REFERENCE_FRAME_BASELINE.md#derived-"+(role==="author"?"worker":"reviewer")+"-frame"],
      policy:{policyRef:"policy://stdo-note.example/"+role+"@5",text:policyText[role],digest:bytes(Buffer.from(policyText[role]))},
      accessRefs:["access://stdo-note.example/worker-index@5"],sourceBindings:sourceBindings(role)})),
  });
  return {declaration,roots:{sourceRoot,representationRoot,axiomRoot,representationRecordPath,axiomRecordPath,pythonPath},spans};
}
export function pilotResources(product,environment,authority,program,temporaryRoot) {
  const roots={...environment.roots,temporaryRoot};
  return {kind:"stdo_environment_resources",schemaVersion:"5.0.0",roots,permission:{
    authorityRef:authority.authorityRef,authorityDigest:authority.authorityDigest,actorRef:authority.actorRef,
    programRef:program.programRef,environmentRef:environment.declaration.declarationRef,environmentDigest:product.sha256Canonical(environment.declaration),
    operation:"project",roots}};
}
export async function prepareStdoNoteProduct({scratch,product,gtl,abiArtifact,inputRoot}) {
  const ids=PILOT_IDS,env=await pilotEnvironmentDeclaration({gtl,product,inputRoot}),hash=x=>product.sha256Canonical(x);
  const placeholder="sha256:"+"0".repeat(64),identity={productId:ids.productId,packageName:ids.packageName,packageVersion:ids.packageVersion,
    artifactDigest:placeholder,productContentDigest:placeholder,productManifestDigest:placeholder};
  const abiBasis={productId:abiArtifact.productId,packageName:abiArtifact.packageName,packageVersion:abiArtifact.packageVersion,
    artifactDigest:abiArtifact.artifactDigest,productContentDigest:abiArtifact.productContentDigest,productManifestDigest:abiArtifact.manifestDigest};
  const nativePublication=gtl.constructRequirementHandoffModulePublication(abiBasis),nativeSemantic=gtl.constructSemanticStageModulePublication(abiBasis);
  const question="Write a short source-grounded note identifying one practical condition governing a bounded construction task, using the retrieved worker-index material and the quoted original source. Identify any uncertainty that prevents an unconditional conclusion. This is a note, not a complete consumer update or an authorization to perform one.";
  const taskData={question},evaluationData={};
  const packet="# STDO note task\n\n"+question+"\n\n## Exact upstream source excerpt\n\n"+
    "Source: stdo://releases/v2.5.0-rc.7/standards/STDO_REFERENCE_FRAME_BASELINE.md#derived-worker-frame\n"+
    "Member and half-open byte-span identities: "+JSON.stringify(env.declaration.roles[0].sourceBindings[0])+"\n\n"+env.spans.author.text;
  const sourceBytes=Buffer.from(packet),contextRef="context://stdo-note.example/task@5",memberRef="member://stdo-note.example/task@5";
  const members=[{memberRef,path:"source-packet.md",byteCount:sourceBytes.length,digest:product.sha256Bytes(sourceBytes)}];
  const bindings=[{contextRef,memberRef,memberDigest:members[0].digest,startByte:0,endByte:sourceBytes.length,spanDigest:members[0].digest}];
  const requirementRef="requirement://stdo-note.example/source-grounded-note@5",obligationRef="obligation://stdo-note.example/note@5";
  const realizationContractRef="contract://stdo-note.example/future-realization@5",proofContractRef="contract://stdo-note.example/future-proof@5";
  const proofPolicyRef="policy://stdo-note.example/non-closing@5",proofShapeRef="shape://stdo-note.example/non-closing@5";
  const declaration=gtl.constructRequirementHandoffDeclaration({declarationRef:ids.sourceDeclarationRef,graphFunctionRef:ids.sourceGraphFunctionRef,
    sourceRoleRef:"role://stdo-note.example/source@5",context:{contextRef,sourceLocator:ids.productId,inventoryDigest:hash(members),members},
    terms:[{requirementRef,sourceBindings:bindings}],fulfillmentBindings:[{requirementRef,obligationRef,realizationContractRef,proofContractRef,proofPolicyRef,proofShapeRef}]});
  const sourceInput=product.constructRequirementHandoffInput({kind:"requirement_handoff_input",schemaVersion:"5.0.0",
    declarationRef:declaration.declarationRef,sourceRoleRef:declaration.sourceRoleRef,members:[{memberRef,base64:sourceBytes.toString("base64")}]});
  const sourcePublication=gtl.constructRequirementHandoffConsumerPublication(identity,nativePublication,declaration,{
    moduleRef:ids.sourceModuleRef,programRef:ids.sourceProgramRef,startRef:ids.sourceProgramRef+"/start",graphRef:ids.sourceGraphFunctionRef+"/graph",
    closureContractRef:"contract://stdo-note.example/source/closure@5",descriptorRef:ids.descriptorRef,contributionManifestRef:ids.contributionManifestRef},[
      {contractRef:realizationContractRef,contractVersion:"5.0.0",contractKind:"output",valueKind:"worksite_construction_result"},
      {contractRef:proofContractRef,contractVersion:"5.0.0",contractKind:"output",valueKind:"worksite_command_execution_observation"}]);
  const stage={declarationRef:ids.stageRef,graphFunctionRef:ids.stageGraphFunctionRef,authorLocusRef:ids.authorLocusRef,assessorLocusRef:ids.assessorLocusRef,
    predecessorStageRefs:[],assetSurface:{kind:"source_grounded_note",requiredContexts:[contextRef],standardsRefs:env.declaration.roles[0].frameRefs,
      outputContractRefs:[gtl.SEMANTIC_STAGE_IDS.workerContractRef],constructorRef:gtl.SEMANTIC_STAGE_IDS.constructorRef,
      rendererRef:gtl.SEMANTIC_STAGE_IDS.rendererRef,proofObligationRefs:[obligationRef],authoritySlots:[]},
    purpose:question,requiredContent:["A bounded source-grounded note and any unresolved pressure."],
    rubric:[{criterionRef:"criterion://stdo-note.example/source-grounding@5",instruction:"Assess whether the note follows from the exact original source and retrieved material. Require accurate unique source quotations and preserve conditions or uncertainty that materially limit its conclusion."}],
    bodyCapabilities:[],assembly:{ruleRef:ids.stageRef+"/assembly",graphFunctionRef:ids.stageGraphFunctionRef,
      sectionOrder:["role","source","obligations","predecessors","worksite","evidence","task","response"],
      proportionalityPolicy:"declared_semantic_assessment",maxPromptBytes:1_000_000,contentPolicy:"full_source_and_predecessors"}};
  const lifecycle=gtl.constructSemanticLifecycleDeclaration({declarationRef:"declaration://stdo-note.example/lifecycle@5",sourceDeclarationRef:ids.sourceDeclarationRef,
    taskDataDigest:hash(taskData),evaluationDataDigest:hash(evaluationData),
    proofPolicies:[{policyRef:proofPolicyRef,sourceRequirementRef:requirementRef,sourceBindings:bindings,scope:"Non-closing note only",
      realizationMeaning:[],proofMeaning:[],unprovedScope:["Application realization and proof are not undertaken by this note."],
      closureRule:"This note never claims application closure.",obligationRef}],
    proofShapes:[{proofShapeRef,requiredEvidenceRoles:["semantic_assessment"],sharedBasis:[contextRef],requiredContent:["Source-grounded note assessment"],
      nativeCarrierBoundary:"Existing native semantic candidate and assessment; no worksite construction is selected.",requirementRef,obligationRef,
      roleContractRefs:{realization:realizationContractRef,proof:proofContractRef}}],stages:[stage]});
  const closureRef="contract://stdo-note.example/note/closure@5",childClosureRef="contract://stdo-note.example/note/child-closure@5",
    terminalClosureRef="contract://stdo-note.example/note/terminal-closure@5";
  const stageGraph=gtl.constructSemanticStageGraphFunction(stage,childClosureRef);
  const terminal=gtl.constructSemanticBridgeGraphFunction({graphFunctionRef:ids.graphFunctionRef+"/terminal",nodeRef:ids.graphFunctionRef+"/terminal/node",closureContractRef:terminalClosureRef,operation:"envelope_output"});
  const graphFunctions=[{kind:"graph_function",name:ids.graphFunctionRef,version:"5.0.0",
    environment:{requires:[gtl.SEMANTIC_STAGE_IDS.envelopeContractRef],provides:[gtl.SEMANTIC_STAGE_IDS.outputContractRef],carries:[gtl.SEMANTIC_STAGE_IDS.envelopeContractRef]},
    inputs:[gtl.SEMANTIC_STAGE_IDS.envelopeContractRef],outputs:[gtl.SEMANTIC_STAGE_IDS.outputContractRef],effects:[],tags:["stdo-note-pilot"],
    declarations:{"abg.compute_regime":"mixed","abg.closure_contract":closureRef,"abg.evidence_contract":gtl.SEMANTIC_STAGE_IDS.evidenceContractRef,
      "abg.judgment_contract":gtl.SEMANTIC_STAGE_IDS.judgmentContractRef,"abg.judgment_predicate":gtl.SEMANTIC_STAGE_IDS.terminalPredicateRef,
      "abg.transition_contract":gtl.SEMANTIC_STAGE_IDS.transitionContractRef,"abg.failure_contract":gtl.SEMANTIC_STAGE_IDS.failureContractRef},
    template:{kind:"inline_graph",graphRef:ids.graphFunctionRef+"/graph",startNodeRef:ids.graphFunctionRef+"/stage",terminalNodeRefs:[ids.graphFunctionRef+"/close"],
      nodes:[stageGraph,terminal].map((g,i)=>({nodeRef:ids.graphFunctionRef+(i===0?"/stage":"/close"),nodeKind:"c_locus",
        term:gtl.workflow.C(gtl.cGraphFunctionRef({graphFunctionRef:g.name,input:gtl.cCarrier(g.inputs[0]),output:gtl.cCarrier(g.outputs[0])}))})),
      edges:[gtl.graphEdge({fromNodeRef:ids.graphFunctionRef+"/stage",toNodeRef:ids.graphFunctionRef+"/close"})],applications:[]}},stageGraph,terminal];
  const consumerPublication=gtl.modulePublication({kind:"module_publication",moduleVersion:"5.0.0",moduleRef:ids.moduleRef,
    owningProductId:ids.productId,artifactDigest:placeholder,productContentDigest:placeholder,productManifestDigest:placeholder,
    descriptorRef:ids.descriptorRef,contributionManifestRef:ids.contributionManifestRef,productSemanticsBinding:nativeSemantic.productSemanticsBinding,
    semanticLifecycle:lifecycle,stdoRunEnvironments:[env.declaration],contracts:[],evaluators:[],rules:[],implementationBindings:[],
    closureContracts:[gtl.constructSemanticClosureContract({closureContractRef:closureRef,predicateRef:gtl.SEMANTIC_STAGE_IDS.terminalPredicateRef,resultContractRef:gtl.SEMANTIC_STAGE_IDS.outputContractRef,closureScope:"run"}),
      gtl.constructSemanticClosureContract({closureContractRef:childClosureRef,predicateRef:gtl.SEMANTIC_STAGE_IDS.assessorPredicateRef,resultContractRef:gtl.SEMANTIC_STAGE_IDS.envelopeContractRef,closureScope:"graph_call"}),
      gtl.constructSemanticClosureContract({closureContractRef:terminalClosureRef,predicateRef:gtl.SEMANTIC_STAGE_IDS.terminalPredicateRef,resultContractRef:gtl.SEMANTIC_STAGE_IDS.outputContractRef,closureScope:"graph_call"})],
    graphFunctions,programs:[{kind:"gtl_program",programRef:ids.programRef,version:"5.0.0",moduleRef:ids.moduleRef,
      starts:[{startRef:ids.programRef+"/start",graphFunctionRef:ids.graphFunctionRef}],callableMembership:graphFunctions.map(g=>g.name),closureContractRef:closureRef,
      policies:{"abg.root_mode":"direct","abg.compute_regime":"mixed","abg.default_start_ref":ids.programRef+"/start",
        "abg.semantic_lifecycle":lifecycle.declarationRef,"abg.stdo_run_environment":env.declaration.declarationRef}}],
    contributions:graphFunctions.map(g=>({handle:g.name,kind:"graph_function",declarationOrContractRef:g.name,owningProductId:ids.productId,
      programMembershipRefs:[ids.programRef],readinessPrerequisiteRefs:[ids.programRef],compatibilityRefs:["compatibility://abiogenesis/major/5"],provenanceRefs:[placeholder]}))});
  const sourceRoot=join(scratch,"stdo-note-product-source");await mkdir(join(sourceRoot,"build"),{recursive:true});
  await mkdir(join(sourceRoot,"contracts/capabilities"),{recursive:true});
  const publications=[sourcePublication,consumerPublication],paths=["build/source-publication.json","build/publication.json"];
  const payload={"package.json":{name:ids.packageName,version:ids.packageVersion,type:"module",
    exports:{"./publication":"./build/publication.json","./source-publication":"./build/source-publication.json"},files:["build","contracts","product-toolchain-manifest.json"]},
    "contracts/public-contract-catalog.schema.json":{$schema:"https://json-schema.org/draft/2020-12/schema",type:"object"},
    "build/source-publication.json":sourcePublication,"build/publication.json":consumerPublication,"build/source-input.json":sourceInput};
  for(const [p,value] of Object.entries(payload)){await mkdir(dirname(join(sourceRoot,p)),{recursive:true});await writeFile(join(sourceRoot,p),product.canonicalJson(value)+"\n");}
  const graph=product.constructCapabilityDefinitionGraph([]),graphBytes=product.capabilityDefinitionGraphAssetBytes(graph),graphCoordinate=product.capabilityDefinitionGraphCoordinate(graph);
  await writeFile(join(sourceRoot,product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH),graphBytes);
  const productRelativeLocators=Object.keys(payload).sort(),payloadInventory=await Promise.all(productRelativeLocators.map(async path=>({path,sha256:await product.sha256File(join(sourceRoot,path))})));
  const productContentDigest=product.payloadInventoryDigest(payloadInventory);
  const materialize=(identity,data)=>gtl.modulePublication({...structuredClone(data),artifactDigest:identity.artifactDigest,productContentDigest:identity.productContentDigest,
    productManifestDigest:identity.manifestDigest,contributions:data.contributions.map(c=>({...c,provenanceRefs:[identity.artifactDigest,identity.manifestDigest]}))});
  const draft=publications.map(p=>materialize({artifactDigest:placeholder,productContentDigest,manifestDigest:placeholder},p));
  const catalogBody={schemaVersion:"5.0.0",catalogId:"catalog://stdo-note.example/public@5",catalogVersion:"5.0.0",catalogSchemaPath:"contracts/public-contract-catalog.schema.json",
    catalogSchemaDigest:await product.sha256File(join(sourceRoot,"contracts/public-contract-catalog.schema.json")),rows:[]};
  const publicContractCatalog={...catalogBody,catalogDigest:hash(catalogBody)},provenanceRef="provenance://stdo-note.example/pilot@5";
  const contributionManifest={kind:"product_contribution_manifest",schemaVersion:"5.0.0",contributionManifestRef:ids.contributionManifestRef,
    productId:ids.productId,productVersion:ids.packageVersion,descriptorRef:ids.descriptorRef,productContentDigest,
    publicContractCatalogId:publicContractCatalog.catalogId,publicContractCatalogDigest:publicContractCatalog.catalogDigest,capabilityDefinitionGraph:graphCoordinate,
    publicationBindings:draft.map(p=>({moduleRef:p.moduleRef,publicationDigest:product.modulePublicationSemanticDigest(p)})),
    rows:draft.flatMap(p=>p.contributions.map(c=>({moduleRef:p.moduleRef,handle:c.handle,kind:c.kind,declarationOrContractRef:c.declarationOrContractRef,
      owningProductId:c.owningProductId,programMembershipRefs:c.programMembershipRefs,compatibilityRefs:c.compatibilityRefs,provenanceRef,readinessPrerequisiteRefs:c.readinessPrerequisiteRefs})))};
  const manifest={kind:"abg_product_toolchain_manifest",schemaVersion:"5.0.0",productId:ids.productId,packageName:ids.packageName,packageVersion:ids.packageVersion,
    productContentDigest,productRelativeLocators,descriptorRef:ids.descriptorRef,publisherNamespace:"stdo-note.example",contributionManifestRef:ids.contributionManifestRef,
    contributionManifestDigest:hash(contributionManifest),contributionManifest,compatibilityRefs:["compatibility://abiogenesis/major/5"],
    declaredDependencies:[{kind:"requires",productId:abiArtifact.productId,packageVersion:abiArtifact.packageVersion,compatibilityRef:"compatibility://abiogenesis/major/5",
      requiredContractRefs:["abg.contract.gtl.root-declaration","abg.schema.public-operation-invocation"],requiredCapabilityRefs:["abg.capability.catalog.invoke-graph-function@5","abg.capability.gtl.declare@5"]}],
    provenanceRef,declaredCapabilityRefs:[],capabilityDefinitionGraph:{...graphCoordinate,assetLocator:{path:product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
      mediaType:"application/json",schemaVersion:"5.0.0",contentDigest:product.sha256Bytes(graphBytes)}},publicContractCatalog};
  await writeFile(join(sourceRoot,"product-toolchain-manifest.json"),product.canonicalJson(manifest)+"\n");
  const artifacts=join(sourceRoot,"artifacts");await mkdir(artifacts);
  const {stdout}=await exec("npm",["pack","--ignore-scripts","--json","--pack-destination",artifacts],{cwd:sourceRoot,maxBuffer:10_000_000});
  const artifactPath=join(artifacts,JSON.parse(stdout)[0].filename),basis={artifactDigest:await product.sha256File(artifactPath),manifestDigest:hash(manifest),
    productContentDigest,productId:ids.productId,packageName:ids.packageName,packageVersion:ids.packageVersion};
  return {ids,env,lifecycle,scenario:taskData,oracle:evaluationData,source:{input:sourceInput,declaration},basis,artifactPath,artifactRef:basename(artifactPath),manifest,sourceRoot,
    async loadInstalledPublications({installedRoot}){
      return Promise.all(paths.map(async path=>{const b=await readFile(join(installedRoot,path));assert.equal(product.sha256Bytes(b),payloadInventory.find(m=>m.path===path).sha256);
        return materialize(basis,JSON.parse(b));}));
    }};
}
