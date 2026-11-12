import {join} from 'node:path';
// Explicit two-member C2 component task for carrier and helper-artifact tests.
// Every receipt and admission coordinate below is a supplied premise.
// No file, donor, event store, actor, command or admission owner is read or run.
export function constructC2ComponentTask(product) {
  const scratch='/component/forward',canonicalRoot=scratch+'/worksite';
  const digest = label => product.sha256Canonical({ label });
  const id = (scheme, value) => `${scheme}://abiogenesis/${value.slice(7)}`;
  const manifest = { workspaceId: "workspace://generic-worksite/test", canonicalRoot,
    authorityMode: "trusted_developer", authorizedActorRef: "actor://generic-worksite/test" };
  const workspaceAuthorityBasis = product.constructWorkspaceAuthorityBasis({ ...manifest,
    authorityManifestRef: "manifest://generic-worksite/authority", authorityManifestDigest: product.sha256Canonical(manifest) });
  const bindingBody = { workspaceId: manifest.workspaceId, authorityBasisId: workspaceAuthorityBasis.authorityBasisId,
    authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest, authorizedActorRef: manifest.authorizedActorRef,
    productSetId: "product-set://generic-worksite/test", productSetDigest: digest("products"), lockId: "lock://generic-worksite/test", lockDigest: digest("lock"),
    roots: Object.fromEntries(["toolchain", "product", "eventLog", "runtimeState", "projection", "archive"].map(name => [`${name}Root`, join(scratch, name)])) };
  const bindingDigest = product.sha256Canonical(bindingBody);
  const workspaceBinding = { kind: "workspace_binding", schemaVersion: "5.0.0", bindingId: id("workspace-binding", bindingDigest), bindingDigest,
    ...bindingBody, admissionEventRef: "event://generic-worksite/binding" };
  const grantBody = {
    definitionKey: { operationId: "abg.operation.run.invoke", memberKey: "invoke" }, definitionRef: "definition://generic-worksite/invoke", definitionDigest: digest("definition"),
    capabilityDefinition: { graphId: "capability-graph://generic-worksite/test", graphVersion: "5.0.0", graphDigest: digest("capability-graph"),
      capabilityId: "capability://abiogenesis/run.invoke", capabilityDefinitionRef: "capability-definition://generic-worksite/test", capabilityDefinitionDigest: digest("capability-definition") },
    operationContract: {
      contractCatalog: { productId: "product://generic-worksite/test", productContentDigest: digest("product"), catalogId: "catalog://generic-worksite/test", catalogVersion: "5.0.0", catalogDigest: digest("catalog") },
      flatRow: { contractId: "contract://generic-worksite/request", contractVersion: "5.0.0", contractDigest: digest("contract") },
      nestedSelector: { selectorKind: "flat_contract", definitionKey: null, slot: null, definitionRef: null },
    }, operationId: "abg.operation.run.invoke", capabilityRef: "capability://abiogenesis/run.invoke", actorRef: manifest.authorizedActorRef,
    approvalRef: workspaceAuthorityBasis.authorityBasisId, approvalDigest: workspaceAuthorityBasis.authorityBasisDigest,
    policyRef: "policy://generic-worksite/test", policyDigest: digest("policy"), scopeRef: workspaceBinding.bindingId, scopeDigest: bindingDigest,
    authorityBasisRef: workspaceAuthorityBasis.authorityBasisId, authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest,
  };
  const grantDigest = product.sha256Canonical(grantBody);
  const capabilityGrant = { kind: "capability_grant", schemaVersion: "5.0.0", grantRef: id("capability-grant", grantDigest), grantDigest, ...grantBody };

  const protectedObservations=['source.mjs','check.mjs'].map((relativePath,i)=>{
    const subject=product.constructWorksiteSubject({workspaceAuthorityBasis,workspaceBinding,relativePath,subjectUri:'file://'+canonicalRoot+'/'+relativePath});
    const observation=product.constructWorksiteObservation({subject,state:'file',fileIdentity:'component:file:'+i,fileDigest:digest('member-'+i),byteLength:i+1});
    return {sourceMemberRef:'component:member:'+i,subject,observation};
  });
  const members=protectedObservations.map(({sourceMemberRef,observation},ordinal)=>{
    const body={authorizationRef:'component:authorization:'+ordinal,authorizationDigest:digest('authorization-'+ordinal),
      beforeObservationRef:'component:before:'+ordinal,beforeObservationDigest:digest('before-'+ordinal),
      afterObservationRef:observation.observationRef,afterObservationDigest:observation.observationDigest,writtenDigest:observation.fileDigest,committed:true};
    const receiptDigest=product.sha256Canonical(body),receipt={kind:'worksite_file_replace_receipt',schemaVersion:'5.0.0',receiptRef:id('worksite-file-replace-receipt',receiptDigest),receiptDigest,...body};
    return {ordinal,inputMemberRef:sourceMemberRef,outputMemberRef:'component:output:'+ordinal,receipt,successorObservation:observation};
  });
  const constructionBody={sourceApplicationRef:product.WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef,members},resultDigest=product.sha256Canonical(constructionBody);
  const sourceConstructionResult={kind:'worksite_construction_result',schemaVersion:'5.0.0',resultRef:id('worksite-construction-result',resultDigest),resultDigest,...constructionBody};
  const originalTask=product.constructWorksiteCommandExecutionTask({workspaceAuthorityBasis,workspaceBinding,capabilityGrant,
    sourceConstructionResultRef:sourceConstructionResult.resultRef,sourceConstructionResultDigest:resultDigest,sourceConstructionResult,protectedObservations,
    commands:[{commandId:'component:command',executable:'/usr/bin/true',args:[],relativeCwd:'.',environment:{},timeoutMs:1000,terminationGraceMs:100,expectedReports:[]}],
    outcomePredicates:[{predicateId:'component:exit',predicateKind:'process_exit',declaration:{validationCommandId:'component:command',equals:0}}],allowedWriteTerritories:[{pathKind:'subtree',relativePath:'evidence'}]});
  return originalTask;
}
