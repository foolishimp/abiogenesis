import { TextEncoder } from "node:util";

import {
  constructPublicContractCatalog,
  publicContractCatalogCoordinate
} from "../../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  buildPrivatePublicOperationDefinitionFamily
} from "../../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";
import {
  admitPublicResultAssessmentRequest
} from "../../../build/semantic/code/src/app/m04/result_assessment/admission.js";
import {
  abiogenesisPublicSdk
} from "../../../build/semantic/code/src/app/m04/public_sdk/index.js";
import {
  stableSha256Digest
} from "../../../build/semantic/code/src/shared/runtime_identity.js";
import { constructT281PrivateP1Invocation } from "./t281-private-ingress-fixture.mjs";

const encoder = new TextEncoder();

function assessmentCatalog(definition) {
  const rows = [
    definition.requestContract.contract.schemaCoordinate,
    definition.resultContract.contract.schemaCoordinate,
    definition.refusalContract.contract.schemaCoordinate
  ];
  if (definition.nonTerminalContract !== null) {
    rows.push(definition.nonTerminalContract.contract.schemaCoordinate);
  }
  return constructPublicContractCatalog({
    catalogId: `abg.catalog.m05-assessment-negative.${definition.definitionDigest.slice(-12)}`,
    catalogVersion: "5.0.0",
    rows
  });
}

function eventBytes(events) {
  return events.length === 0
    ? new Uint8Array()
    : encoder.encode(
        `${events.map((event) => JSON.stringify(event)).join("\n")}\n`
      );
}

export async function invokeCanonicalResultAssessmentWithoutReplayEvidence(input) {
  const admittedAssessment = admitPublicResultAssessmentRequest(
    input.assessmentRequest
  );
  const familyAdmission = await buildPrivatePublicOperationDefinitionFamily();
  if (familyAdmission.kind !== "exact_family_admitted") {
    throw new TypeError(
      `canonical assessment fixture requires the exact operation family: ${familyAdmission.gaps
        .map((gap) => `${gap.fieldPath}:${gap.reason}`)
        .join(",")}`
    );
  }
  const family = familyAdmission.family;
  const definition = family["abg.operation.result.assess"].assess;
  const catalog = assessmentCatalog(definition);
  const seed = stableSha256Digest({
    kind: "m05_result_assessment_negative",
    resultRef: admittedAssessment.dispatchRequest.resultRef
  });
  const workspaceManifest = Object.freeze({
    workspaceId: `workspace://m05/result-assessment/${seed.slice(-12)}`,
    authorityMode: "clean_no_project_authority",
    configurationRefs: Object.freeze([])
  });
  const binding = Object.freeze({
    bindingId: `workspace-binding://m05/result-assessment/${seed.slice(-12)}`,
    bindingDigest: stableSha256Digest({ binding: seed }),
    workspaceId: workspaceManifest.workspaceId,
    workspaceManifestDigest: stableSha256Digest(workspaceManifest),
    productSetDigest: stableSha256Digest({ products: [] }),
    resolvedLockId: `resolved-lock://m05/result-assessment/${seed.slice(-12)}`,
    resolvedLockDigest: stableSha256Digest({ lock: seed }),
    products: Object.freeze([]),
    provenanceRefs: Object.freeze([])
  });
  const events = input.events;
  const context = Object.freeze({
    kind: "bound_workspace",
    workspaceManifest,
    binding,
    publicContractCatalog: catalog,
    effects: Object.freeze({
      async readRecord() {
        return null;
      },
      async readInputAsset() {
        return null;
      },
      async readRuntimeEventBytes() {
        return eventBytes(events);
      },
      createRuntimeEventSink() {
        return (event) => events.push(event);
      },
      operatorCapabilityFactories: Object.freeze({})
    })
  });
  const rawInvocation = constructT281PrivateP1Invocation({
    family,
    definition,
    request: {
      runtimeResultRef: admittedAssessment.dispatchRequest.resultRef,
      runtimeResultDigest: stableSha256Digest(admittedAssessment.artifact),
      assessmentContractRef: admittedAssessment.assessmentContract.ref,
      assessmentContractDigest: admittedAssessment.assessmentContract.digest,
      assessment: input.assessmentRequest,
      evidenceRefs: []
    },
    actorRef: "actor://m05/result-assessor",
    workspaceBinding: {
      ref: binding.bindingId,
      digest: binding.bindingDigest
    },
    productSet: {
      ref: `product-set:${binding.productSetDigest}`,
      digest: binding.productSetDigest
    },
    dependencyLock: {
      ref: binding.resolvedLockId,
      digest: binding.resolvedLockDigest
    },
    contractCatalogCoordinate: publicContractCatalogCoordinate(catalog)
  });
  const outcome = await abiogenesisPublicSdk.invoke({
    rawInvocation,
    execution: {
      kind: "bound_workspace_write",
      context,
      priorEvents: Object.freeze([...events]),
      eventSink: context.effects.createRuntimeEventSink()
    }
  });
  return Object.freeze({
    outcome,
    admittedAssessment,
    events
  });
}
