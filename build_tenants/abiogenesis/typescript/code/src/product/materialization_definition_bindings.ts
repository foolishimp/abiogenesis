/**
 * The statically composed callables the route row
 * `MATERIALIZATION_DEFINITION_BINDINGS` declares for
 * `abg.operation.product.materialize` (`context_bootstrap`, `configuration`).
 *
 * The admission authority admits the call. This binding admits the declared
 * request against the bound environment, projects it onto the native
 * materialization owner, returns the declared result from the owner's, and
 * admits the owner's result as one `public_operation_artifact_admitted` event
 * through the admission authority's artifact step: the scope is the manifest
 * pair, the artifact the content pair, the cause the workspace binding's
 * admission. The owner keeps the materialization and its files.
 *
 * Workspace: the owner's workspace coordinate is the bound environment's
 * admitted authority basis, `workspaceRef` its `workspaceId` and
 * `workspaceDigest` its `authorityBasisDigest`, never a caller value.
 */
import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import * as Effect from "effect/Effect";
import * as v from "valibot";

import { projectExactPrefixArtifactTruth } from "../abg/artifact_truth.js";
import {
  abandonAbgEventResource,
  abgEventResourceInputPrefix,
  abgEventResourceOutcomePrefix,
  acquireAbgEventResource,
  completeAbgEventResource,
  validateAbgEventResourceOutcome,
  validateReopenedAbgEventResourceInput,
  type AbgEventResourceOutcome,
  type AcquiredAbgEventResource,
  type ReopenedAbgEventResourceInput,
} from "../abg/definition_event_resource.js";
import { projectEffectfulPublicInvocationTruthAtPrefix } from "../abg/effectful_invocation_truth.js";
import { admitArtifact, type ExactPrefixWorkspaceEnvironment } from "../abg/environment_admission.js";
import {
  authenticateRuntimePrefixAncestry,
  readRuntimeEventsAtDurablePrefix,
  selectHeldEventStoreDurablePrefix,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import {
  definitionFault,
  isDefinitionFault,
  reference,
  sameJson,
  validatedOwnerOutput,
} from "../public/binding/definition_binding_mechanics.js";
import { bindStaticOwner } from "../public/binding/static_definition_bindings.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";
import type {
  DefinitionCall,
  DefinitionExecutionFault,
  ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import type { OwnerSemanticOutput } from "../shared/public_function_contracts.js";

import {
  admissionAuthorityResourceStructure,
  withAdmissionAuthority,
  type AdmissionAuthorityResource,
} from "./admission_authority.js";
import { productInstallCoordinate } from "./environment.js";
import { MATERIALIZATION_OPERATION_CONTRACTS } from "./materialization_operation_contracts.js";
import {
  materializeConfiguration,
  materializeContextBootstrap,
  type MaterializationWorkspaceCoordinate,
  type ProductMaterializationMember,
  type ProductMaterializationRefusalCode,
  type ProductMaterializationResult,
  type ProductMaterializePacketByMember,
} from "./materialization_operations.js";

type Member = ProductMaterializationMember;
type Packet<M extends Member> = (typeof MATERIALIZATION_OPERATION_CONTRACTS)[M];
type Output<M extends Member> = OwnerSemanticOutput<Packet<M>>;
type DeclaredRefusalCode = Extract<Output<Member>, { outcomeKind: "refusal" }>["value"]["code"];
type Coordinate = Readonly<{ ref: string; digest: string }>;

/** The owner-authored structural resource contract: one reopened event resource. */
export interface ProductMaterializeResourceAssertion {
  readonly kind: "product_materialize_resource_assertion";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: ReopenedAbgEventResourceInput;
  readonly admissionAuthority: AdmissionAuthorityResource;
}

export interface ProductMaterializeResourceReceipt {
  readonly kind: "product_materialize_resource_receipt";
  readonly schemaVersion: "5.0.0";
  readonly eventResource: AbgEventResourceOutcome;
}

type AuthorizedResources = Omit<ProductMaterializeResourceAssertion, "admissionAuthority">;

const assertionSchema = v.strictObject({
  kind: v.literal("product_materialize_resource_assertion"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<ReopenedAbgEventResourceInput>((value) =>
    validateReopenedAbgEventResourceInput(value),
  "one reopened ABG event resource"),
  // Lazy across the Product/ABG import cycle; withAdmissionAuthority
  // reconstructs and compares every complete grant before the owner runs.
  admissionAuthority: v.lazy(() => admissionAuthorityResourceStructure),
});
const typedAssertionSchema = assertionSchema as unknown as
  v.GenericSchema<ProductMaterializeResourceAssertion, ProductMaterializeResourceAssertion>;
const receiptSchema = v.strictObject({
  kind: v.literal("product_materialize_resource_receipt"),
  schemaVersion: v.literal("5.0.0"),
  eventResource: v.custom<AbgEventResourceOutcome>((value) =>
    validateAbgEventResourceOutcome(value),
  "owner-issued reopened ABG successor"),
});

/** Owner refusal code onto the declared reason, stem to stem. */
const DECLARED_REFUSAL: Readonly<Record<ProductMaterializationRefusalCode, DeclaredRefusalCode>> = Object.freeze({
  workspace_not_ready: "workspace_mismatch",
  binding_mismatch: "binding_mismatch",
  input_invalid: "input_mismatch",
  authority_overwrite_forbidden: "authority_mismatch",
  contract_invalid: "contract_mismatch",
  mutable_default_forbidden: "mutable_default",
  filesystem_failure: "filesystem_failure",
});

/** The owner's refusal names no path; the binding names the one request member
 * each owner code attributes. The owner writes under the projection root of the
 * workspace binding the request's `binding` names, so its write refusals are
 * attributed to `/binding`. */
const OWNER_REFUSAL_PATH: Readonly<{ [M in Member]: Readonly<Record<ProductMaterializationRefusalCode, string>> }> =
  Object.freeze({
    context_bootstrap: Object.freeze({
      workspace_not_ready: "/workspace",
      binding_mismatch: "/binding",
      input_invalid: "/contextInputs",
      authority_overwrite_forbidden: "/binding",
      contract_invalid: "/contextInputs",
      mutable_default_forbidden: "/contextInputs",
      filesystem_failure: "/binding",
    }),
    configuration: Object.freeze({
      workspace_not_ready: "/binding",
      binding_mismatch: "/binding",
      input_invalid: "/inputs",
      authority_overwrite_forbidden: "/binding",
      contract_invalid: "/configurationContract",
      mutable_default_forbidden: "/inputs",
      filesystem_failure: "/binding",
    }),
  });

type InstalledContract = Readonly<{
  install: ExactPrefixWorkspaceEnvironment["productInstalls"][number];
  row: ExactPrefixWorkspaceEnvironment["productInstalls"][number]["publicContracts"][number];
}>;

/** The one installed Product contract catalog row the coordinate names, from the bound environment only. */
function installedContract(environment: ExactPrefixWorkspaceEnvironment, coordinate: Coordinate): InstalledContract | null {
  const rows = environment.productInstalls.flatMap((install) =>
    install.publicContracts.filter((row) => row.contractId === coordinate.ref).map((row) => ({ install, row })));
  return rows.length === 1 && rows[0]!.row.contractDigest === coordinate.digest ? rows[0]! : null;
}

/**
 * A value is admitted under an installed contract only through that row's
 * installed JSON Schema (the schema_asset convention of catalog application):
 * the digest-checked bytes under the install root, the 2020-12 dialect, strict
 * Ajv, and the row's `$defs` selection. A row with no executable schema admits
 * no value. Returns the request member that fails: the contract or the value.
 */
function admitUnderInstalledContract(
  environment: ExactPrefixWorkspaceEnvironment,
  coordinate: Coordinate,
  value: JsonValue,
): "admitted" | "contract" | "value" {
  const selected = installedContract(environment, coordinate);
  const locator = selected?.row.assetLocator;
  if (selected === null || locator === undefined || locator.mediaType !== "application/schema+json") return "contract";
  let validate: (candidate: unknown) => boolean;
  try {
    const path = resolve(selected.install.installedRoot, locator.path);
    const within = relative(selected.install.installedRoot, path);
    if (isAbsolute(within) || within === ".." || within.startsWith("../")) return "contract";
    const bytes = readFileSync(path);
    if (sha256Bytes(bytes) !== locator.contentDigest || sha256Bytes(bytes) !== selected.row.contractDigest) return "contract";
    const schema: unknown = JSON.parse(bytes.toString("utf8"));
    if (typeof schema !== "object" || schema === null || Array.isArray(schema)) return "contract";
    const document = schema as Readonly<Record<string, unknown>>;
    if (document.$schema !== "https://json-schema.org/draft/2020-12/schema") return "contract";
    const definitionRef = locator.definitionRef;
    const definitions = document.$defs;
    const named = definitionRef === undefined ? null : /^#\/\$defs\/([^/~]+)$/u.exec(definitionRef)?.[1];
    if (named === undefined || (named !== null && (typeof definitions !== "object" || definitions === null ||
        !Object.hasOwn(definitions, named)))) return "contract";
    const ajv = new Ajv2020({ strict: true, allErrors: true, validateSchema: true, validateFormats: true,
      coerceTypes: false, useDefaults: false, removeAdditional: false, $data: false });
    addFormats.default(ajv, { mode: "full", keywords: false });
    validate = ajv.compile(named === null ? document : { $schema: document.$schema, $defs: definitions, $ref: definitionRef });
  } catch {
    return "contract";
  }
  return validate(value) ? "admitted" : "value";
}

function workspaceCoordinate(environment: ExactPrefixWorkspaceEnvironment): MaterializationWorkspaceCoordinate {
  const basis = environment.workspaceAuthorityBasis, binding = environment.workspaceBinding;
  return deepFreeze({
    workspaceRef: basis.workspaceId,
    workspaceDigest: basis.authorityBasisDigest,
    authorityRef: binding.authorityBasisId,
    authorityDigest: binding.authorityBasisDigest,
  });
}

type RequestAdmission<M extends Member> =
  | Readonly<{ kind: "packet"; packet: ProductMaterializePacketByMember[M] }>
  | Readonly<{ kind: "refusal"; code: DeclaredRefusalCode; path: string }>;

const refusedAt = (code: DeclaredRefusalCode, path: string) => deepFreeze({ kind: "refusal" as const, code, path });

/** The declared request against the bound environment, before the owner. */
const ADMIT_REQUEST: { readonly [M in Member]: (
  request: DefinitionCall<Packet<M>, AuthorizedResources>["invocation"]["request"],
  environment: ExactPrefixWorkspaceEnvironment,
) => RequestAdmission<M> } = {
  context_bootstrap: (request, environment) => {
    const binding = environment.workspaceBinding, workspace = workspaceCoordinate(environment);
    if (!sameJson(request.binding, reference(binding.bindingId, binding.bindingDigest))) return refusedAt("binding_mismatch", "/binding");
    if (!sameJson(request.workspace, reference(workspace.workspaceRef, workspace.workspaceDigest))) {
      return refusedAt("workspace_mismatch", "/workspace");
    }
    for (const [index, input] of request.contextInputs.entries()) {
      const admitted = admitUnderInstalledContract(environment, input.contract, input.value);
      if (admitted !== "admitted") return refusedAt("input_mismatch", `/contextInputs/${index}/${admitted}`);
    }
    return { kind: "packet", packet: {
      kind: "product_materialize_packet",
      schemaVersion: "5.0.0",
      memberKey: "context_bootstrap",
      workspace,
      binding,
      contextInputs: request.contextInputs.map((input) => ({
        kind: "declared_context_input" as const,
        inputRef: input.name,
        inputDigest: sha256Canonical(input.value),
        content: input.value,
      })),
    } };
  },
  configuration: (request, environment) => {
    const binding = environment.workspaceBinding;
    if (!sameJson(request.binding, reference(binding.bindingId, binding.bindingDigest))) return refusedAt("binding_mismatch", "/binding");
    const contract = installedContract(environment, request.configurationContract);
    const admitted = contract === null ? "contract" : admitUnderInstalledContract(environment, request.configurationContract, request.inputs);
    if (admitted === "contract") return refusedAt("contract_mismatch", "/configurationContract");
    if (admitted === "value") return refusedAt("input_mismatch", "/inputs");
    return { kind: "packet", packet: {
      kind: "product_materialize_packet",
      schemaVersion: "5.0.0",
      memberKey: "configuration",
      workspace: workspaceCoordinate(environment),
      binding,
      configurationContract: contract!.row,
      inputs: request.inputs,
    } };
  },
};

const OWNERS: { readonly [M in Member]: (packet: ProductMaterializePacketByMember[M]) =>
  ReturnType<typeof materializeContextBootstrap> | ReturnType<typeof materializeConfiguration> } = {
  context_bootstrap: materializeContextBootstrap,
  configuration: materializeConfiguration,
};

/** The declared result: the owner's result without paths; `subject` the workspace pair. */
function declaredResult(native: ProductMaterializationResult) {
  return {
    materializationKind: native.materializationKind,
    subject: reference(native.subject.workspaceRef, native.subject.workspaceDigest),
    content: reference(native.content.contentRef, native.content.contentDigest),
    manifest: reference(native.manifest.manifestRef, native.manifest.manifestDigest),
    rows: native.rows.map((row) => ({ disposition: row.disposition, content: reference(row.assetRef, row.assetDigest) })),
    residuals: [],
    provenance: native.provenance.map((row) => reference(row.provenanceRef, row.provenanceDigest)),
  };
}

/** The successor is the unchanged entry on refusal or an idempotent repeat, or
 * the entry plus exactly the one artifact event at the scope and pair. */
function materializeTransitionCorresponds(
  entry: DurablePrefixCoordinate,
  successor: DurablePrefixCoordinate,
  member: Member,
  admitted: Readonly<{ scope: Coordinate; artifact: Coordinate }> | null,
): boolean {
  try {
    if (admitted === null) return successor.coordinateDigest === entry.coordinateDigest;
    if (!sameJson(entry.storeIdentity, successor.storeIdentity) ||
        !authenticateRuntimePrefixAncestry(entry, successor)) return false;
    const before = readRuntimeEventsAtDurablePrefix(entry).length;
    const after = readRuntimeEventsAtDurablePrefix(successor);
    const last = after.at(-1);
    const payload = last?.payload as Record<string, unknown> | undefined;
    return after.length === before + 1 && last?.kind === "public_operation_artifact_admitted" &&
      payload?.operationId === "abg.operation.product.materialize" && payload.memberKey === member &&
      payload.authorityScopeRef === admitted.scope.ref && payload.authorityScopeDigest === admitted.scope.digest &&
      payload.artifactRef === admitted.artifact.ref && payload.artifactDigest === admitted.artifact.digest;
  } catch {
    return false;
  }
}

function materializeOwner<M extends Member>(
  member: M,
  call: DefinitionCall<Packet<M>, AuthorizedResources>,
  approved: AdmissionAuthorityResource,
  boundEnvironment: ExactPrefixWorkspaceEnvironment | null,
  heldResource: AcquiredAbgEventResource | null,
): ReturnType<ExactDefinitionCallable<Packet<M>, AuthorizedResources, ProductMaterializeResourceReceipt>> {
  const packet = MATERIALIZATION_OPERATION_CONTRACTS[member] as Packet<M>;
  const key = packet.definitionKey;
  const fault = (stage: string, code: string, message: string) =>
    definitionFault(key, stage, code, message) as DefinitionExecutionFault<Packet<M>["definitionKey"]>;
  return Effect.tryPromise({
    try: async () => {
      const acquired = heldResource === null ? acquireAbgEventResource(call.resources.eventResource) :
        { kind: "acquired_abg_event_resource" as const, resource: heldResource };
      if (acquired.kind !== "acquired_abg_event_resource") throw fault("resource_acquisition", acquired.code, acquired.message);
      const resource = acquired.resource;
      try {
        const invocation = call.invocation;
        const slots = invocation.invocationAuthority.slots;
        const actor = slots.actor?.actor;
        const environment = boundEnvironment;
        const grant = approved.grants.length === 1 ? approved.grants[0]! : null;
        if (environment?.kind !== "exact_prefix_workspace_environment" ||
            !sameJson(environment.prefix, resource.entryPrefix) ||
            !sameJson(slots.workspace_binding, reference(environment.workspaceBinding.bindingId,
              environment.workspaceBinding.bindingDigest)) ||
            actor === undefined || actor.ref !== environment.workspaceAuthorityBasis.authorizedActorRef ||
            actor.ref !== approved.authority.actorRef ||
            !sameJson(slots.product_set, environment.productInstalls.map(productInstallCoordinate)) ||
            !sameJson(slots.dependency_lock, reference(environment.resolvedProductLock.lockId,
              environment.resolvedProductLock.lockDigest)) ||
            grant === null || grant.actorRef !== actor.ref || grant.operationId !== key.operationId ||
            !packet.metadata.capabilityRefs.includes(grant.capabilityRef) ||
            !sameJson(grant.operationContract.contractCatalog, invocation.contractCatalog)) {
          throw fault("resource_admission", "resource_relation_mismatch",
            "product materialization requires the approved exact acquired environment, actor and grant");
        }
        let ownerOutput: Output<Member>;
        let native: ProductMaterializationResult | null = null;
        let admitted: Readonly<{ scope: Coordinate; artifact: Coordinate }> | null = null;
        const request = ADMIT_REQUEST[member](invocation.request, environment);
        if (request.kind === "refusal") {
          ownerOutput = { outcomeKind: "refusal", value: { code: request.code, issuePaths: [request.path], evidenceRefs: [] } };
        } else {
          // A repeated invocation identity is refused before any effect, as the release form refuses it.
          if (projectEffectfulPublicInvocationTruthAtPrefix(resource.entryPrefix, invocation.invocationRef).disposition !== "available") {
            throw fault("resource_admission", "duplicate_invocation", "product materialization invocation must be fresh in valid native history");
          }
          const owned = await OWNERS[member](request.packet);
          if (owned.kind === "product_materialization_refusal") {
            ownerOutput = { outcomeKind: "refusal", value: {
              code: DECLARED_REFUSAL[owned.code],
              issuePaths: [OWNER_REFUSAL_PATH[member][owned.code]],
              evidenceRefs: [],
            } };
          } else {
            native = owned;
            ownerOutput = { outcomeKind: "result", value: declaredResult(owned) };
          }
        }
        // The declared output is checked before the artifact is admitted.
        const output = validatedOwnerOutput(packet, ownerOutput as Output<M>, "product materialization");
        if (native !== null) {
          const scope = reference(native.manifest.manifestRef, native.manifest.manifestDigest);
          const artifact = reference(native.content.contentRef, native.content.contentDigest);
          const truth = projectExactPrefixArtifactTruth(resource.entryPrefix);
          if (truth.kind !== "exact_prefix_artifact_truth_projection") {
            throw fault("abg_admission", "artifact_truth_invalid", JSON.stringify(truth));
          }
          // One truth row per scope: the same pair already admitted at the
          // scope is the idempotent repeat, with no second event.
          const repeat = truth.rows.some((row) => row.authorityScopeRef === scope.ref &&
            row.authorityScopeDigest === scope.digest && row.operationId === key.operationId &&
            row.memberKey === member && row.artifactRef === artifact.ref && row.artifactDigest === artifact.digest);
          if (!repeat) {
            const coordinate = constructExactOperationInvocationCoordinate({ operationId: key.operationId, memberKey: member,
              definitionDigest: invocation.definitionDigest }, invocation.invocationRef, invocation.requestDigest);
            const binding = environment.workspaceBinding;
            const body = deepFreeze({
              kind: "product_materialization_artifact",
              schemaVersion: "5.0.0",
              memberKey: member,
              invocation: coordinate,
              entryPrefix: resource.entryPrefix,
              workspaceBinding: reference(binding.bindingId, binding.bindingDigest),
              request: invocation.request,
              result: native,
            }) as unknown as JsonValue;
            const admission = admitArtifact(resource.store, {
              ...coordinate,
              operationId: key.operationId,
              authorityScopeRef: scope.ref,
              authorityScopeDigest: scope.digest,
              correlationId: invocation.correlationRef,
              eventTime: invocation.eventTime,
              causationEventRefs: [binding.admissionEventRef],
              predecessorPrefix: resource.entryPrefix,
            }, key.operationId, artifact.ref, artifact.digest, { artifact: body });
            if (admission.disposition !== "admitted" && admission.disposition !== "idempotent") {
              throw fault("abg_admission", "product_materialization_artifact_refused", JSON.stringify(admission));
            }
            admitted = { scope, artifact };
          }
        }
        const successor = selectHeldEventStoreDurablePrefix(resource.store);
        if (!materializeTransitionCorresponds(resource.entryPrefix, successor, member, admitted)) {
          throw fault("receipt_admission", "invalid_resource_receipt",
            "product materialization returned neither its unchanged entry nor exactly its one admitted artifact");
        }
        const eventResource = completeAbgEventResource(resource, successor);
        if (eventResource.entryPrefix.coordinateDigest !== abgEventResourceInputPrefix(call.resources.eventResource).coordinateDigest ||
            abgEventResourceOutcomePrefix(eventResource).coordinateDigest !== successor.coordinateDigest) {
          throw fault("receipt_admission", "invalid_resource_receipt", "product materialization close differs from its checked transition");
        }
        return deepFreeze({
          ownerOutput: output,
          resources: { kind: "product_materialize_resource_receipt" as const, schemaVersion: "5.0.0" as const, eventResource },
        });
      } catch (cause) {
        abandonAbgEventResource(resource);
        throw cause;
      }
    },
    catch: (cause) => isDefinitionFault(cause)
      ? cause as DefinitionExecutionFault<Packet<M>["definitionKey"]>
      : fault("owner_execution", "product_materialize_execution_failure", String(cause)),
  });
}

function materializeMember<M extends Member>(member: M) {
  const packet = MATERIALIZATION_OPERATION_CONTRACTS[member] as Packet<M>;
  const callable: ExactDefinitionCallable<Packet<M>, ProductMaterializeResourceAssertion, ProductMaterializeResourceReceipt> =
    (call) => withAdmissionAuthority(packet,
      (authorized: DefinitionCall<Packet<M>, AuthorizedResources>, environment, resource) =>
        materializeOwner(member, authorized, call.resources.admissionAuthority, environment, resource))(call);
  return bindStaticOwner(packet, callable, typedAssertionSchema, receiptSchema);
}

/** The two declared members; no wildcard materialization grant. */
export const MATERIALIZATION_DEFINITION_BINDINGS = Object.freeze({
  context_bootstrap: materializeMember("context_bootstrap"),
  configuration: materializeMember("configuration"),
});
