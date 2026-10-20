import assert from 'node:assert/strict';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {join,basename} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {setupInstalledRootExecutionBasis,publicOperationBasis,requireRawAdmission} from './root-installed-environment.mjs';
import {prepareRegisteredSelectionProduct} from './registered-graph-selection.mjs';
import {declarations,ref,contract,fixtureInput,hash,model,gap,next,refreshModel,refreshGap,finish,spanApplication,selectedDeclaredAction} from '../fixtures/t287-selected-action-product/index.mjs';
const proof=process.env.ABI5_SELECTED_ACTION_EVIDENCE_ROOT;
const isMain=process.argv[1]===fileURLToPath(import.meta.url);
if(isMain)assert.ok(proof);
const save=(name,value)=>fs.writeFileSync(join(proof,name),JSON.stringify(value,null,2)+'\n');
const root=new URL('../..',import.meta.url).pathname,started=performance.now(),accounting={wallMs:{}};
let e;
if(isMain && process.env.ABI5_SELECTED_ACTION_PUBLIC_START) {
 await runPublicStart(JSON.parse(fs.readFileSync(process.env.ABI5_SELECTED_ACTION_PUBLIC_START,'utf8')));
} else if(isMain) try {
 e=await setupInstalledRootExecutionBasis({after:()=>{}},root,{candidateBasisSource:'packed_artifact',workspaceProductIndex:1,programRef:ref('program','root'),graphFunctionRef:ref('graph-function','root'),inputContractRef:contract('request'),setupAccounting:accounting,
 prepareAdditionalProducts:async basis=>[process.env.ABI5_SELECTED_ACTION_FROZEN_FIXTURE_ENV ? await reuseFixture(basis,JSON.parse(fs.readFileSync(process.env.ABI5_SELECTED_ACTION_FROZEN_FIXTURE_ENV,'utf8'))) : await prepareRegisteredSelectionProduct({...basis,declarationFactory:declarations,fixtureFiles:[{path:'build/index.js',source:new URL('../fixtures/t287-selected-action-product/index.mjs',import.meta.url)}]})],
 inputFactory:fixtureInput});
 // Both branches use the actual installed Program and one declared kind per output.
 const checks=[];
 for(const phase of [0,1]){
  const input={...e.input,phase,task:{...e.input.task,payload:phase===0?'first action':'selected second action'}};
  const initial=gap(model(input).resultCandidate).resultCandidate, selection=next(initial).resultCandidate;
  const evaluation={kind:'identity_precheck_evaluation',observationSnapshot:input,constructionIntentRef:ref('precheck','intent'),targetOutcomeRef:ref('outcome','echo'),edgeClosureDecision:{decisionRef:ref('precheck','decision')}};
  const refresh=refreshModel(evaluation).resultCandidate;
  assert.deepEqual(initial.admittedActionCatalog,e.program.actionCatalog);assert.deepEqual(initial.declaredPolicy,e.program.constructionComposition.closurePolicy);
  const refreshDeclaration=e.publication.contracts.find(c=>c.contractRef===contract('refresh-model'));assert.equal(refresh.kind,refreshDeclaration.valueKind);assert.equal(refresh.kind,'graph_span_selection');
  if(phase===0){assert.equal(refresh.disposition,'re_enter');assert.deepEqual(refresh.targetInput.priorRefreshedModel.observationSnapshot,input);assert.deepEqual(refresh.targetInput.priorRefreshedModel.evaluation,evaluation);assert.deepEqual(refresh.targetInput.actionCatalog,e.program.actionCatalog);assert.equal(next(gap(model(refresh.targetInput).resultCandidate).resultCandidate).resultCandidate.selectedActionRef,ref('action','consumer'));}
  else{assert.equal(refresh.disposition,'continue');assert.deepEqual(refresh.state.observationSnapshot,input);assert.deepEqual(refresh.state.evaluation,evaluation);const refreshed=refreshGap(refresh).resultCandidate;assert.deepEqual(refreshed.admittedActionCatalog,e.program.actionCatalog);const terminal=finish(refreshed).resultCandidate;assert.equal(terminal.kind,e.publication.contracts.find(c=>c.contractRef===contract('final')).valueKind);assert.equal(terminal.disposition,'converged');}
  const selected=e.program.actionCatalog.rows.find(row=>row.actionRef===ref('action',phase===0?'initial':'consumer'));
  assert.equal(selection.selectedActionRef,selected.actionRef);assert.deepEqual(selection.targetObligationRefs,selected.targetObligationRefs);assert.deepEqual(selection.inputAssetRefs,selected.inputAssetRefs);assert.deepEqual(selection.outputAssetRefs,selected.outputAssetRefs);
  assert.equal(e.executionBasis.actionCatalogRef,e.program.actionCatalog.catalogRef);assert.equal(e.executionBasis.actionCatalogDigest,e.program.actionCatalog.catalogDigest);assert.equal(e.executionBasis.programDigest,e.product.sha256Canonical(e.program));
  assert.equal(e.policy.policyDigest,e.invocationAdmission.policyDigest);assert.equal(e.executionBasis.invocationAdmissionRef,e.invocationAdmission.invocationAdmissionRef);
  checks.push({phase,initialCatalogDigest:initial.admittedActionCatalog.catalogDigest,refreshKind:refresh.kind,refreshDisposition:refresh.disposition,selectedActionRef:selection.selectedActionRef,programDigest:e.executionBasis.programDigest,policyDigest:e.policy.policyDigest});
 }
 const terms=e.graphFunction.template.nodes[0].term.terms;assert.equal(terms.length,8);assert.equal(terms[5].compositionRef,e.program.constructionComposition.compositionRef);assert.equal(terms[5].programLocusRef,spanApplication.sourceProgramLocusRef);assert.equal(terms[5].outputCarrierRef,spanApplication.inputContractRef);assert.equal(terms[0].programLocusRef,spanApplication.targetProgramLocusRef);assert.equal(terms[0].inputCarrierRef,spanApplication.outputContractRef);assert.equal(terms[7].outputCarrierRef,contract('final'));
 save('installed-identity-precheck.json',{status:'passed',checks,application:spanApplication,termCount:terms.length,compositionRef:terms[5].compositionRef,source:'actual installed Program -> admitted input and two exact refresh-model branches; terminal refresh-next remains next_action_projection',archiveDigests:await Promise.all(e.artifactPaths.map(p=>e.product.sha256File(p)))});
 const selectedKeys=['scratch','installedRoot','installedRoots','artifactPaths','verified','workspaceAuthority','workspaceBinding','admittedInstalls','catalog','catalogView','policy','actorRef','invocationAuthority','invocationAdmission','input','executionBasis','publication','productSet','lock'];
 save('environment.json',Object.fromEntries(selectedKeys.map(k=>[k,e[k]])));
 save('setup.json',{setupMs:performance.now()-started,accounting,archiveDigests:await Promise.all(e.artifactPaths.map(p=>e.product.sha256File(p))),artifactPaths:e.artifactPaths,installedRoot:e.installedRoot});
 const eventLogPath=join(e.scratch,'runtime/events.jsonl'),identity=fs.statSync(eventLogPath);
 save('initial-origin.json',{initialOrigin:{newResourceRequest:{kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath},device:identity.dev,inode:identity.ino},ownerPid:process.pid});
 const {abg}=e,opened=abg.openTraversalScope(e.store,e.durablePrefix,{kind:'root',executionBasis:e.executionBasis},{eventTime:'2026-09-30T00:00:00.000Z',correlationId:'correlation://selected-action/initial',causationEventRefs:[]});
 assert.equal(opened.kind,'traversal_scope_open_admission',JSON.stringify(opened));save('opened.json',opened);
 const runStarted=performance.now(),nativeFsync=fs.fsyncSync;
 fs.fsyncSync=function(fd){nativeFsync(fd);const bytes=fs.readFileSync(eventLogPath);if(bytes.length===0||bytes.at(-1)!==10)return;const events=bytes.toString().trim().split('\n').map(JSON.parse);const selections=events.filter(v=>v.kind==='construction_intent_selected'&&v.runId===opened.scope.runId);if(selections.length===2){
  fs.writeFileSync(join(proof,'interrupted-prefix.jsonl'),bytes);
  save('interruption.json',{hook:'test-only node:fs fsyncSync wrapper after native fsync; no runtime bytes patched',processId:process.pid,signal:'SIGKILL',eventCount:events.length,selectionCount:selections.length,selectedEvent:selections.at(-1),initialTraversalMs:performance.now()-runStarted});
  process.kill(process.pid,'SIGKILL');
 }};syncBuiltinESMExports();
 const completion=await e.hog.executeGraphTraversal({store:e.store,predecessorPrefix:opened.successorPrefix,executionBasis:e.executionBasis,openedTraversalScope:opened.scope,program:e.program,programPublication:e.publication,graphFunction:e.graphFunction,graph:e.graph,graphValidation:e.graphValidation,programValidation:e.programValidation,implementationSet:e.implementationSet,interactionSet:e.executionBasisAdmission.interactionSet,leafPort:e.leafPort,closureContract:e.closureContract,actorRuntimeBinding:{workspaceBinding:e.workspaceBinding,artifactTruth:e.artifactTruth},input:e.input,inputDigest:e.rawInput.subjectDigest,eventTime:'2026-09-30T00:00:00.000Z',correlationId:'correlation://selected-action/initial'});
 fs.fsyncSync=nativeFsync;syncBuiltinESMExports();save('initial-traversal-timing.json',{wallMs:performance.now()-runStarted});save('unexpected-completion.json',completion);save('unexpected-events.json',e.store.readAll());save('unexpected-handoff.json',e.store.projectReopenAuthorityAndClose());throw new Error('Selected second action boundary was not reached');
} catch(error){save('host-failure.json',{message:error.message,stack:error.stack,scratch:e?.scratch??null});throw error;}

// Reuse the passed immutable fixture archive; only this case's Install and event resource are new.
async function reuseFixture({product},prior) {
 const artifactPath=prior.artifactPaths[1],manifest=JSON.parse(fs.readFileSync(join(prior.installedRoots[1],'product-toolchain-manifest.json'),'utf8'));
 const basis={artifactDigest:await product.sha256File(artifactPath),manifestDigest:product.sha256Canonical(manifest),productContentDigest:manifest.productContentDigest,productId:manifest.productId,packageName:manifest.packageName,packageVersion:manifest.packageVersion};
 return {artifactPath,artifactRef:basename(artifactPath),basis,async loadInstalledPublication({installedRoot,gtl}) {
  const data=JSON.parse(fs.readFileSync(join(installedRoot,'build/publication.json'),'utf8'));
  return gtl.modulePublication({kind:'module_publication',moduleVersion:'5.0.0',...data,artifactDigest:basis.artifactDigest,productContentDigest:basis.productContentDigest,productManifestDigest:basis.manifestDigest,contributions:data.contributions.map(row=>({...row,provenanceRefs:[basis.artifactDigest,basis.manifestDigest]}))});
 }};
}

// Test-only process host: the actual installed Public CLI owns start/admission.
// This wrapper observes native fsync only and never constructs current runtime facts.
async function runPublicStart(saved) {
 const {environment,call,closeHandoff,selectionCount}=saved;
 const load=p=>import(pathToFileURL(join(environment.installedRoot,`build/code/src/${p}.js`)).href);
 const product=await load('product/index'),abg=await load('abg/index'),scopeOwner=await load('abg/open_call'),truth=await load('abg/invocation_execution_truth');
 const eventLogPath=join(environment.scratch,'runtime/events.jsonl'),identity=fs.statSync(eventLogPath),before=fs.readFileSync(eventLogPath).toString().trim().split('\n').length;
 save('initial-origin.json',{initialOrigin:{newResourceRequest:{kind:'new_empty_append_sink_request',schemaVersion:'5.0.0',eventLogPath},device:identity.dev,inode:identity.ino},ownerPid:process.pid});
 const nativeFsync=fs.fsyncSync,started=performance.now();
 fs.fsyncSync=function(fd){nativeFsync(fd);const bytes=fs.readFileSync(eventLogPath);if(bytes.length===0||bytes.at(-1)!==10)return;const rows=bytes.toString().trim().split('\n').map(JSON.parse),selections=rows.slice(before).filter(e=>e.kind==='construction_intent_selected');if(selections.length!==selectionCount)return;
  const selected=selections.at(-1),prefix=abg.selectValidatedRuntimeEventPrefix(rows),scope=scopeOwner.projectOpenedTraversalScopeForFrameAtPrefix(prefix,selected.frameId),executionBasis=truth.projectExactExecutionBasisAtPrefix(prefix,selected.basisId);assert.ok(scope);assert.ok(executionBasis);
  const invocationAdmission=truth.projectExactInvocationAdmissionAtPrefix(prefix,executionBasis.invocationAdmissionRef);assert.ok(invocationAdmission);assert.equal(invocationAdmission.catalogBasisDigest,environment.catalog.basisDigest);assert.equal(invocationAdmission.catalogViewDigest,environment.catalogView.viewDigest);assert.equal(invocationAdmission.workspaceBindingDigest,environment.workspaceBinding.bindingDigest);assert.equal(invocationAdmission.policyDigest,environment.policy.policyDigest);
  save('environment.json',{...environment,executionBasis,invocationAdmission});save('opened.json',{kind:'actual_public_start_scope_projection',scope});fs.writeFileSync(join(proof,'interrupted-prefix.jsonl'),bytes);save('interruption.json',{hook:'test-only fsyncSync wrapper after native fsync of actual installed Public start',processId:process.pid,signal:'SIGKILL',eventCount:rows.length,selectionCount:selections.length,selectedEvent:selected,initialTraversalMs:performance.now()-started});process.kill(process.pid,'SIGKILL');
 };syncBuiltinESMExports();
 const requestPath=join(proof,'public-start-transport.jsonl'),cliPath=join(environment.installedRoot,'build/code/src/public/cli.js');fs.writeFileSync(requestPath,JSON.stringify({kind:'abg_cli_transport_request',schemaVersion:'5.0.0',acquisition:{kind:'reopen',closeHandoff},invocation:call})+'\n');process.argv=[process.execPath,cliPath,'--jsonl',requestPath];
 await import(pathToFileURL(cliPath).href);fs.fsyncSync=nativeFsync;syncBuiltinESMExports();save('unexpected-public-completion.json',{exitCode:process.exitCode??0});
}

// Bounded Public envelope acquisition adapted from constructInstalledStartCall.
export async function constructSelectedPublicStart({
  environment,
  publicApi,
  eventResource,
  input,
  identity = "st-1",
  runEnvironmentResourceFactory,
}) {
  const operationId="abg.operation.run.invoke",schemaVersion="5.0.0";
  const {
    product,
    abg,
    catalog,
    catalogView,
    admittedInstalls,
    workspaceBinding,

  } = environment;
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: ref('program','root'),
    selection: Object.freeze({
      kind: "start",
      scope: "program",
      target: "next",
      until: "converged",
      rootMode: "supervised",
    }),
  });
  assert.equal(
    resolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(resolution),
  );
  const admittedInput = product.admitInstalledProductInput(
    resolution.productSemantics,
    resolution.resolution.inputContract.contractRef,
    input,
  );
  assert.ok(admittedInput);
  const inputContract = Object.freeze({
    ref: resolution.resolution.inputContract.contractRef,
    digest: resolution.resolution.inputContractDigest,
  });
  const contractBoundInput = Object.freeze({
    contract: inputContract,
    valueRef: `value://odd-glc/${identity}/hello-input`,
    valueDigest: product.sha256Canonical(input),
    value: input,
  });
  const declaredRegimes = new Set([
    ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
    ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    resolution.program,
    resolution.programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    })),
    ["F_D", "F_P", "F_H"].filter((regime) => declaredRegimes.has(regime)),
    [],
  );
  const actorRef = workspaceBinding.authorizedActorRef;
  const fixedPacket = product.RUN_OPERATION_CONTRACTS.invoke.start;
  const grants = Object.freeze([
    product.constructCapabilityGrant(
      policy,
      actorRef,
      operationId,
      product.DIRECT_INVOKE_CAPABILITY,
      {
        admittedInstalls,
        workspaceBinding,
        fixedPacket,
      },
    ),
  ]);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    resolution.program.programRef,
    resolution.selectedCatalogEntry,
    policy,
    grants,
    {
      admittedInstalls,
      workspaceBinding,
      fixedPacket,
    },
  );
  const program = Object.freeze({
    ref: resolution.resolution.programRef,
    digest: resolution.resolution.programDigest,
  });
  const view = Object.freeze({
    ref: `graph-function-catalog-view://abiogenesis/${catalogView.viewDigest.slice("sha256:".length)}`,
    digest: catalogView.viewDigest,
  });
  const request = Object.freeze({
    program,
    scope: "program",
    target: Object.freeze({ kind: "next" }),
    until: "converged",
    catalogView: view,
    allowlist: Object.freeze([...catalogView.allowlist]),
    input: contractBoundInput,
    fhMode: "direct",
    rootMode: "supervised",
    sourceBasis: Object.freeze({ kind: "none" }),
  });
  const steeringDigest = product.sha256Canonical(eventResource);
  const slots = Object.freeze({
    workspace_binding: Object.freeze({
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    }),
    product_set: Object.freeze(admittedInstalls.map((install) => Object.freeze({
      ref: install.installId,
      digest: install.productContentDigest,
    }))),
    dependency_lock: Object.freeze({
      ref: workspaceBinding.lockId,
      digest: workspaceBinding.lockDigest,
    }),
    catalog_scope: Object.freeze({
      catalog: Object.freeze({
        ref: `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice("sha256:".length)}`,
        digest: catalog.basisDigest,
      }),
      view,
      allowlist: request.allowlist,
    }),
    execution_program: program,
    graph_function: null,
    input_contract: contractBoundInput,
    session_policy: Object.freeze({
      ref: policy.policyRef,
      digest: policy.policyDigest,
    }),
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([
        ...product.RUN_OPERATION_CONTRACTS.invoke.start.metadata.capabilityRefs,
      ]),
      grants: Object.freeze(grants.map((grant) => Object.freeze({
        ref: grant.grantRef,
        digest: grant.grantDigest,
      }))),
    }),
    actor: Object.freeze({
      actor: Object.freeze({
        ref: actorRef,
        digest: product.sha256Canonical({ actorRef }),
      }),
      attribution: Object.freeze({
        ref: authority.authorityRef,
        digest: authority.authorityDigest,
      }),
    }),
    transport_steering: Object.freeze({
      ref: `transport-steering://abiogenesis/${steeringDigest.slice("sha256:".length)}`,
      digest: steeringDigest,
    }),
    verification_references: null,
    execution_basis: null,
  });
  const contractCatalog = environment.verified.definitionContractCoordinates
    ?.operations.find((candidate) => candidate.operationId === operationId)
    ?.members.find((candidate) => candidate.memberKey === "start")
    ?.slots.request.contractCatalog;
  assert.ok(
    contractCatalog,
    "verified ABIogenesis truth must issue the installed start contract catalog",
  );
  const resources = Object.freeze({
    kind: "run_invocation_resource_assertion",
    schemaVersion,
    eventResource,
    catalog,
    catalogView,
    applications: Object.freeze([]),
    source: Object.freeze({ kind: "none" }),
    ...(runEnvironmentResourceFactory === undefined ? {} : {runEnvironmentResources:await runEnvironmentResourceFactory({authority,program:resolution.program,workspaceBinding,product})}),
  });
  return {
    authority, policy,
    call: publicApi.constructInstalledPublicDefinitionCall({
      product,
      installedPublic: publicApi,
      definitionContractCoordinates:
        environment.verified.definitionContractCoordinates,
      contractCatalog,
      operationId,
      memberKey: "start",
      request,
      slots,
      resources,
      requestRef: `public-request://odd-glc/${identity}/run-start`,
      correlationRef: `correlation://odd-glc/${identity}/run-start`,
      eventTime: identity === "st-1"
        ? "2026-08-21T00:00:00.000Z"
        : "2026-08-22T01:00:00.000Z",
      provenanceRefs: [`provenance://odd-glc/${identity}-worker`],
    }),
    resolution,
    capabilityBasis: Object.freeze({
      actorRef,
      capabilityGrants: grants,
      policy,
      productInstalls: admittedInstalls,
      program: resolution.program,
      programValidation: resolution.programValidation,
      workspaceBinding,
    }),
  };
}

