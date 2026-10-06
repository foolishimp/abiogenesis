import {readFile,writeFile} from "node:fs/promises";
import {resolve,relative,isAbsolute} from "node:path";
import {createRequire} from "node:module";
import {pathToFileURL} from "node:url";
import {createHash} from "node:crypto";
const dir="/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/native-d2-01/bootstrap-preparation-03";
const read=async n=>JSON.parse(await readFile(dir+"/"+n,"utf8"));
const [prepared,record,transport,basis,selection,attempt,previous]=await Promise.all([read("prepared.json"),read("native-prepared.json"),read("live-start.jsonl"),read("readback-basis.json"),read("selection.json"),read("live-attempt.json"),readFile(new URL("authority-probe.json",import.meta.url),"utf8").then(JSON.parse)]);
const root=prepared.core.packageRoot,src=root+"/build/code/src/",load=p=>import(pathToFileURL(src+p).href);
const [inv,{rawAdmitValue},{sha256Canonical},{canonicalJson},{RUN_OPERATION_CONTRACTS},env]=await Promise.all([load("product/invocation.js"),load("validator/raw_admission.js"),load("shared/digests.js"),load("shared/canonical_json.js"),load("product/run_operation_contracts.js"),load("product/stdo_environment.js")]);
const require=createRequire(root+"/package.json"),v=await import(pathToFileURL(require.resolve("valibot")).href);
const i=transport.invocation.invocation,r=transport.invocation.resources,b=basis.environment,program=basis.publication.programs.find(p=>p.programRef===i.request.program.ref),exact=(a,b)=>canonicalJson(a)===canonicalJson(b);
const policy=inv.constructRootInvocationPolicy(b.workspaceBinding,program,[],previous.programValidation.regimes,r.applications),gb={admittedInstalls:b.productInstalls,workspaceBinding:b.workspaceBinding,fixedPacket:RUN_OPERATION_CONTRACTS.invoke.start};
const grants=[inv.constructCapabilityGrant(policy,basis.actorRef,"abg.operation.run.invoke",inv.DIRECT_INVOKE_CAPABILITY,gb)];
const row=r.catalogView.entries.find(row=>row.definitionRef===previous.route.resolvedGraph),authority=inv.constructInvocationAuthority(basis.actorRef,b.workspaceBinding,r.catalogView,program.programRef,row,policy,grants,gb);
const raw=rawAdmitValue(i.request.input.value,"invocation_input",i.request.input.contract.ref);
const candidate=inv.constructExactStartInvocation(i,b.workspaceBinding,r.catalogView,program,row,raw,policy,grants,authority);
const source=await readFile(src+"product/stdo_environment.js","utf8"),s=source.indexOf("if (!v.is(RUN_ENVIRONMENT_RESOURCES_SCHEMA, r)"),end=source.indexOf("\n            throw new ObservationFailure",s),condition=source.slice(s+4,end-1);
if(s<0||end<0)throw Error("permission guard boundary absent");
const rejected=Function("v","RUN_ENVIRONMENT_RESOURCES_SCHEMA","hash","inside","resolve","input","r","p","d","return ("+condition+");");
const permission=r.runEnvironmentResources.permission,declaration=basis.publication.runEnvironments.find(e=>e.declarationRef===permission.environmentRef);
const inside=(root,value)=>{const p=relative(root,value);return p!==""&&!p.startsWith("../")&&p!==".."&&!isAbsolute(p);};
const denied=rejected(v,env.RUN_ENVIRONMENT_RESOURCES_SCHEMA,sha256Canonical,inside,resolve,{authority,program,archiveRoot:b.workspaceBinding.roots.archiveRoot},r.runEnvironmentResources,permission,declaration);
const caller=await readFile(dir+"/caller/test/full-sandbox-support.mjs","utf8"),cs=caller.indexOf("export function fullSandboxTransportEnvironment("),ce=caller.indexOf("\n}",cs)+2,body=caller.slice(cs+7,ce);
const makeEnv=Function("return ("+body+");")(),controls=makeEnv(record.transport,{});
const {transportDigest,...transportBody}=record.transport;
const report={kind:"finite_remaining_invocation_joins",candidateConstruction:{kind:candidate.kind,code:candidate.code??null,limit:"Pure constructor only; current authority predicate is still false and no candidate was admitted."},
 runEnvironmentPermission:{exactInstalledGuardRejects:denied,guardSha256:createHash("sha256").update(condition).digest("hex"),schemaValid:v.is(env.RUN_ENVIRONMENT_RESOURCES_SCHEMA,r.runEnvironmentResources),declaredOperations:permission.operations,expectedOperations:[...new Set(["read_context",...declaration.accesses.map(a=>a.operation)])].sort(),scope:"Complete pre-physical-read guard only; no dependency, tool or corpus observation performed."},
 controls:{selectionToPrepared:exact(selection.transportConfiguration,prepared.transport.configuration),preparedToRecord:exact(prepared.transport,record.transport),recordToAttempt:exact(record.transport,attempt.transport),transportDigestValid:transportDigest===sha256Canonical(transportBody),actualLauncherEnvironmentProjection:controls,wholeRunTimeoutMs:record.transport.configuration.wholeRunMs,readbackBudgetMs:prepared.readbackMs,declaredMaximumActorOccurrences:record.maximumActorOccurrences,actualProgramProbabilisticLeafCount:previous.programValidation.probabilisticLeafCount,afterReceiptPath:attempt.afterReceiptPath,processWasRefusedBeforeActor:true},
 identities:{currentBuilderSourceRoots:[root,record.abiRoot],ownerModuleBytesEqual:await Promise.all(["product/run_invocation_operation.js","product/invocation.js"].map(async path=>({path,equal:Buffer.compare(await readFile(src+path),await readFile(record.abiRoot+"/build/code/src/"+path))===0}))),historicalInputDigest:record.inputDigest,originalLifecycleDigest:sha256Canonical(basis.declaration)},
 preflight:{owner:"ProductRunInvocationPort.prepare / prepareProductRunInvocation",scope:"The actual owner preparation consumes exact setup facts, admission verifier, resources and transport assertion, but continues into physical STDO observation. This describes an existing seam, not a selected preflight or new gate.",sideEffects:"Not strictly pure: this declared STDO environment causes dependency reads, deterministic corpus-tool calls and temporary files cleaned by observeRunEnvironment. No actor or Run admission belongs to preparation. Not executed in this diagnostic."}};
await writeFile(new URL("remaining-joins-probe.json",import.meta.url),JSON.stringify(report,null,2)+"\n",{flag:"wx"});console.log(JSON.stringify(report,null,2));
