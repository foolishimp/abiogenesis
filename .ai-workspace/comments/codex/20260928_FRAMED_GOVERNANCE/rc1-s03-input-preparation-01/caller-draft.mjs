// External caller preparation only. No execution or filesystem/resource acquisition at import.
// Installed C03 product/public/ABG closures and authentic environment are injected later.
import assert from 'node:assert/strict';
const schemaVersion='5.0.0';
const operationId='abg.operation.run.invoke';

export async function constructInstalledStartCall({
  environment,
  publicApi,
  eventResource,
  input,
  identity = "st-1",
  eventTime,
  runEnvironmentResourceFactory,
  programRef,
  rootMode = "direct",
  declaredStartRef,
  inputFactory,
}) {
  const {
    product,
    abg,
    catalog,
    catalogView,
    admittedInstalls,
    workspaceBinding,
    additionalProducts: [fixture] = [],
  } = environment;
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: programRef ?? fixture.ids.programRef,
    selection: Object.freeze({
      kind: "start",
      scope: "program",
      target: declaredStartRef ?? "next",
      ...(declaredStartRef === undefined ? {} : { startRef: declaredStartRef }),
      until: "converged",
      rootMode,
    }),
  });
  assert.equal(
    resolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(resolution),
  );
  if (inputFactory !== undefined) input = await inputFactory({ resolution, program: resolution.program, workspaceBinding });
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
    valueRef: `value://abiogenesis/t287/s03a/${identity}/input`,
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
    target: declaredStartRef === undefined ? Object.freeze({ kind: "next" }) : Object.freeze({
      kind: "declared_start", start: Object.freeze({
        ref: resolution.resolvedProgramStart.start.startRef,
        digest: product.sha256Canonical(resolution.resolvedProgramStart.start),
      }),
    }),
    until: "converged",
    catalogView: view,
    allowlist: Object.freeze([...catalogView.allowlist]),
    input: contractBoundInput,
    fhMode: "direct",
    rootMode,
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
    workAuthority: authority,
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
      requestRef: `public-request://abiogenesis/t287/s03a/${identity}/run-start`,
      correlationRef: `correlation://abiogenesis/t287/s03a/${identity}/run-start`,
      eventTime,
      provenanceRefs: [`provenance://abiogenesis/t287/s03a/${identity}-worker`],
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

function readAuthoritySlots(environment, packet, grants) {
  const { admittedInstalls, workspaceBinding } = environment;
  return Object.freeze({
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
    catalog_scope: null,
    execution_program: null,
    graph_function: null,
    input_contract: null,
    session_policy: null,
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([...packet.metadata.capabilityRefs]),
      grants: Object.freeze(grants.map((grant) => Object.freeze({
        ref: grant.grantRef,
        digest: grant.grantDigest,
      }))),
    }),
    actor: null,
    transport_steering: null,
    verification_references: null,
    execution_basis: null,
  });
}

export function constructInstalledRunReadCall({
  environment,
  publicApi,
  projectReadContracts,
  memberKey,
  selector,
  source,
  eventResource,
  identity,
  eventTime,
  contractCatalogOverride = null,
  definitionContractCoordinatesOverride = null,
  mutateRequest = (request) => request,
  mutateSlots = (slots) => slots,
}) {
  const { product, admittedInstalls, workspaceBinding } = environment;
  const packet = projectReadContracts.ABG_PROJECT_READ_CONTRACTS[memberKey];
  const grantBasis = Object.freeze({
    admittedInstalls,
    workspaceBinding,
    fixedPacket: packet,
  });
  const grants = Object.freeze(packet.metadata.capabilityRefs.map(
    (capabilityRef) => product.constructCapabilityGrant(
      environment.workspaceAuthority,
      workspaceBinding.authorizedActorRef,
      packet.definitionKey.operationId,
      capabilityRef,
      grantBasis,
    ),
  ));
  const request = mutateRequest(Object.freeze({
    caseKey: memberKey,
    source: Object.freeze({
      sourceKind: "run",
      sourceRef: source.ref,
      sourceDigest: source.digest,
    }),
    projectionBasis: Object.freeze({
      projectionBasisRef: eventResource.closeHandoff.prefix.eventLogRef,
      projectionBasisDigest:
        eventResource.closeHandoff.prefix.coordinateDigest,
    }),
    selector,
  }));
  const slots = mutateSlots(
    readAuthoritySlots(environment, packet, grants),
    grants,
  );
  const installedContractCatalog =
    environment.verified.definitionContractCoordinates
    ?.operations.find((candidate) =>
      candidate.operationId === packet.definitionKey.operationId
    )
    ?.members.find((candidate) => candidate.memberKey === memberKey)
    ?.slots.request.contractCatalog;
  assert.ok(
    installedContractCatalog,
    `${memberKey} requires its installed contract catalog coordinate`,
  );
  const contractCatalog = contractCatalogOverride ?? installedContractCatalog;
  return Object.freeze({
    packet,
    grants,
    call: publicApi.constructInstalledPublicDefinitionCall({
      product,
      installedPublic: publicApi,
      definitionContractCoordinates:
        definitionContractCoordinatesOverride ??
          environment.verified.definitionContractCoordinates,
      contractCatalog,
      operationId: packet.definitionKey.operationId,
      memberKey,
      request,
      slots,
      resources: Object.freeze({
        kind: "abg_project_read_resource_assertion",
        schemaVersion,
        eventResource,
      }),
      requestRef: `public-request://abiogenesis/t287/s03a/${identity}`,
      correlationRef: `correlation://abiogenesis/t287/s03a/${identity}`,
      eventTime,
      provenanceRefs: [`provenance://abiogenesis/t287/s03a/${identity}-worker`],
    }),
  });
}


/** Call only under later accepted-C03 execution grant. Saved verification JSON is not nominal authority. */
export async function verifyInstalledCurrent({product, packet, expected}) {
  const {verifiedArtifact: ignoredSavedBody, ...freshPacket}=packet;
  const actual=await product.ProductVerificationPort.verify(freshPacket);
  assert.equal(actual.kind,'product_verification_success',JSON.stringify(actual));
  assert.strictEqual(product.selectOwnedProductVerification(freshPacket.request,actual.verifiedArtifact),actual.verifiedArtifact);
  for(const [key,value] of Object.entries(expected)) assert.deepEqual(actual.verifiedArtifact[key],value,key);
  assert.ok(actual.verifiedArtifact.definitionContractCoordinates);
  return actual;
}

/** No stage loop: prepares one ordinary declared start, then the existing Product owner checks the complete resource assertion. */
export async function preparePairCase({environment, publicApi, eventResource, fixture, caseKey, identity, eventTime}) {
  assert.ok(['positive','no-action'].includes(caseKey));assert.ok(identity&&eventTime);
  const made=await constructInstalledStartCall({environment,publicApi,eventResource,identity,eventTime,
    programRef:fixture.ref('program','root'),declaredStartRef:fixture.ref('start','root'),rootMode:'supervised',
    inputFactory:args=>fixture.fixtureInput(args,caseKey==='positive')});
  assert.deepEqual(made.call.resources.applications,[]);
  assert.equal(Object.hasOwn(made.call.resources,'runEnvironmentResources'),false);
  assert.equal(made.resolution.program.policies['abg.run_environment'],undefined);
  assert.equal(made.resolution.programPublication.runEnvironments,undefined);
  const ownerPrepared=await environment.product.ProductRunInvocationPort.prepare({memberKey:'start',
    invocation:made.call.invocation,resources:made.call.resources,admittedInstalls:environment.admittedInstalls,
    workspaceBinding:environment.workspaceBinding,
    verifyInstallAdmission:i=>environment.abg.hasAdmittedProductInstall(environment.artifactTruth,i),
    transportResourceAssertion:eventResource});
  assert.equal(ownerPrepared.kind,'prepared_product_run_invocation',JSON.stringify(ownerPrepared));
  assert.deepEqual(ownerPrepared.authority,made.workAuthority);assert.equal(ownerPrepared.runEnvironment,null);
  return {made,ownerPrepared};
}

export function preparePairColdRead({environment,publicApi,projectReadContracts,memberKey,run,eventResource,identity,eventTime}) {
  assert.ok(['run_result','run_replay','run_status','run_gaps'].includes(memberKey));assert.ok(identity&&eventTime);
  return constructInstalledRunReadCall({environment,publicApi,projectReadContracts,memberKey,
    selector:memberKey==='run_replay'?{kind:'ordinal_page',fromOrdinal:0,limit:2048}:{kind:'none'},
    source:run,eventResource,identity,eventTime});
}
