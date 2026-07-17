// Implements: T-270 AF-15 neutral execution-ingress projection.
// M04 admits native public packets and reduces them to this payload-free M03
// carrier. Selection remains with AF-13/AF-14.

import type { ExecutionBasis } from "./carriers.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export const T270_ROOT_PAYLOAD_BODY_GAP =
  "gap://abg/t270/root-payload-body-not-admitted";
export const T270_RUNTIME_COMPATIBILITY_GAP =
  "gap://abg/t270/runtime-policy-steering-capability-rejoin";

const RUN_INVOKE_EXECUTION_INGRESS = Symbol(
  "RUN_INVOKE_EXECUTION_INGRESS"
);

export interface RunInvokeSerializedInputContract {
  readonly owningProductId: string;
  readonly owningProductVersion: string;
  readonly productManifestDigest: string;
  readonly publicContractCatalogId: string;
  readonly publicContractCatalogVersion: string;
  readonly publicContractCatalogDigest: string;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly contractDigest: string;
  readonly sourceInterface: readonly Readonly<{
    readonly nodeRef: string;
    readonly schemaRef: string;
  }>[];
  readonly asset: Readonly<{
    relativePath: string;
    mediaType: string;
    schemaId: string;
    schemaVersion: string;
    digest: string;
  }>;
}

export type RunInvokeConstraint =
  | Readonly<{
      kind: "exact_graph_function_constraint";
      graphFunctionRef: string;
      graphFunctionDigest: string;
      selectedEntryRef: string;
      selectedExecutionBindingDigest: `sha256:${string}`;
      inputContract: RunInvokeSerializedInputContract;
      inputPayloadRef: string;
      inputPayloadDigest: string;
      payloadAdmissionState: "pending_af14_rejoin";
      payloadAdmissionGapRef: typeof T270_ROOT_PAYLOAD_BODY_GAP;
    }>
  | Readonly<{
      kind: "start_constraints";
      scopeRef: string;
      scopeDigest: string;
      targetKind: "next" | "graph_function" | "asset";
      targetHandle: string | null;
      until: "first_traversal" | "blocked" | "converged";
      fhMode: "direct" | "human-proxy";
      rootMode: "direct" | "supervised";
    }>;

export interface RunInvokeExecutionIngressBasis {
  readonly authorityClass: "subordinate_rejoin_only";
  readonly variant: "invoke" | "start";
  readonly definitionDigest: string;
  readonly invocation: Readonly<{
    ref: string;
    digest: string;
    authorityRef: string;
    authorityDigest: string;
    witnessDigest: string;
  }>;
  readonly workspace: Readonly<{
    bindingRef: string;
    bindingDigest: string;
    workspaceId: string;
    workspaceRoot: string;
  }>;
  readonly catalog: Readonly<{
    basisRef: string;
    catalogId: string;
    resolvedLockRef: string;
    viewRef: string;
    viewDigest: string;
    allowedEntryRefs: readonly string[];
  }>;
  readonly program: Readonly<{
    ref: string;
    digest: string;
  }>;
  readonly constraint: RunInvokeConstraint;
  readonly invocationAuthority: Readonly<{
    authorityBasisRef: string;
    authorityBasisDigest: string;
    actor: Readonly<{
      actorRef: string;
      attributionRef: string;
      attributionDigest: string;
    }>;
    capabilityGrants: readonly Readonly<{
      kind: "capability_grant";
      grantRef: string;
      grantDigest: string;
      capabilityId: string;
      capabilityDefinitionRef: string;
      capabilityDefinitionDigest: string;
      actorRef: string;
      approvalRef: string;
      policyRef: string;
      scopeRef: string;
      scopeDigest: string;
      authorityBasisRef: string;
      authorityBasisDigest: string;
    }>[];
    invocationPolicy: Readonly<{
      policyRef: string;
      policyDigest: string;
      sessionPolicyRef: string;
      sessionPolicyDigest: string;
    }>;
    transportSteering: Readonly<{
      steeringRef: string;
      steeringDigest: string;
      provenanceRefs: readonly string[];
    }>;
    compatibilityState: "pending_af15_rejoin";
    compatibilityGapRef: typeof T270_RUNTIME_COMPATIBILITY_GAP;
  }>;
  readonly runtimeProfile: Readonly<{
    profileDigest: string;
    runtimeIdentity: ExecutionBasis["runtimeIdentity"];
    resolvedPolicy: ExecutionBasis["resolvedPolicy"];
    standardPluginRefs: readonly string[];
  }>;
  readonly sourceWitnessRefs: readonly string[];
}

export interface AdmittedRunInvokeExecutionIngress
  extends RunInvokeExecutionIngressBasis {
  readonly [RUN_INVOKE_EXECUTION_INGRESS]: true;
  readonly kind: "admitted_run_invoke_execution_ingress";
  readonly ingressRef: string;
  readonly ingressDigest: `sha256:${string}`;
}

function freezeConstraint(input: RunInvokeConstraint): RunInvokeConstraint {
  return input.kind === "exact_graph_function_constraint"
    ? Object.freeze({
        ...input,
        inputContract: Object.freeze({
          ...input.inputContract,
          sourceInterface: Object.freeze(
            input.inputContract.sourceInterface.map((row) =>
              Object.freeze({ ...row })
            )
          ),
          asset: Object.freeze({ ...input.inputContract.asset })
        })
      })
    : Object.freeze({ ...input });
}

function freezeBasis(
  input: RunInvokeExecutionIngressBasis
): RunInvokeExecutionIngressBasis {
  return Object.freeze({
    authorityClass: input.authorityClass,
    variant: input.variant,
    definitionDigest: input.definitionDigest,
    invocation: Object.freeze({ ...input.invocation }),
    workspace: Object.freeze({ ...input.workspace }),
    catalog: Object.freeze({
      ...input.catalog,
      allowedEntryRefs: Object.freeze([...input.catalog.allowedEntryRefs])
    }),
    program: Object.freeze({ ...input.program }),
    constraint: freezeConstraint(input.constraint),
    invocationAuthority: Object.freeze({
      ...input.invocationAuthority,
      actor: Object.freeze({ ...input.invocationAuthority.actor }),
      capabilityGrants: Object.freeze(
        input.invocationAuthority.capabilityGrants.map((grant) =>
          Object.freeze({ ...grant })
        )
      ),
      invocationPolicy: Object.freeze({
        ...input.invocationAuthority.invocationPolicy
      }),
      transportSteering: Object.freeze({
        ...input.invocationAuthority.transportSteering,
        provenanceRefs: Object.freeze([
          ...input.invocationAuthority.transportSteering.provenanceRefs
        ])
      })
    }),
    runtimeProfile: Object.freeze({
      ...input.runtimeProfile,
      runtimeIdentity: Object.freeze({ ...input.runtimeProfile.runtimeIdentity }),
      resolvedPolicy: Object.freeze({ ...input.runtimeProfile.resolvedPolicy }),
      standardPluginRefs: Object.freeze([
        ...input.runtimeProfile.standardPluginRefs
      ])
    }),
    sourceWitnessRefs: Object.freeze([...input.sourceWitnessRefs])
  });
}

function assertConstraint(input: RunInvokeExecutionIngressBasis): void {
  if (input.variant === "invoke") {
    const sourceInterface = input.constraint.kind ===
      "exact_graph_function_constraint"
      ? input.constraint.inputContract.sourceInterface
      : [];
    if (
      input.constraint.kind !== "exact_graph_function_constraint" ||
      input.catalog.allowedEntryRefs.length === 0 ||
      input.constraint.payloadAdmissionState !== "pending_af14_rejoin" ||
      input.constraint.payloadAdmissionGapRef !== T270_ROOT_PAYLOAD_BODY_GAP ||
      sourceInterface.length === 0 ||
      sourceInterface.some(
        (row) => row.nodeRef.length === 0 || row.schemaRef.length === 0
      )
    ) {
      throw new TypeError("run.invoke exact function constraint is incomplete");
    }
    return;
  }
  if (
    input.constraint.kind !== "start_constraints" ||
    (input.constraint.targetKind === "next" &&
      input.constraint.targetHandle !== null) ||
    (input.constraint.targetKind !== "next" &&
      input.constraint.targetHandle === null)
  ) {
    throw new TypeError("run.invoke start target projection differs");
  }
}

function assertBasis(input: RunInvokeExecutionIngressBasis): void {
  const uniqueAllowed = new Set(input.catalog.allowedEntryRefs);
  const uniqueSources = new Set(input.sourceWitnessRefs);
  if (
    input.authorityClass !== "subordinate_rejoin_only" ||
    uniqueAllowed.size !== input.catalog.allowedEntryRefs.length ||
    uniqueSources.size !== input.sourceWitnessRefs.length
  ) {
    throw new TypeError("run.invoke execution ingress refs are incomplete");
  }
  assertConstraint(input);
  const grants = input.invocationAuthority.capabilityGrants;
  const grantRefs = grants.map((grant) => grant.grantRef);
  if (
    input.invocationAuthority.compatibilityState !== "pending_af15_rejoin" ||
    input.invocationAuthority.compatibilityGapRef !==
      T270_RUNTIME_COMPATIBILITY_GAP ||
    grants.length === 0 ||
    new Set(grantRefs).size !== grantRefs.length ||
    new Set(
      input.invocationAuthority.transportSteering.provenanceRefs
    ).size !==
      input.invocationAuthority.transportSteering.provenanceRefs.length ||
    grants.some((grant) =>
      grant.grantDigest !== stableSha256Digest({
        capabilityId: grant.capabilityId,
        capabilityDefinitionRef: grant.capabilityDefinitionRef,
        capabilityDefinitionDigest: grant.capabilityDefinitionDigest,
        actorRef: grant.actorRef,
        approvalRef: grant.approvalRef,
        policyRef: grant.policyRef,
        scopeRef: grant.scopeRef,
        scopeDigest: grant.scopeDigest,
        authorityBasisRef: grant.authorityBasisRef,
        authorityBasisDigest: grant.authorityBasisDigest
      }) ||
      grant.grantRef !== `capability-grant:${grant.grantDigest}` ||
      grant.actorRef !== input.invocationAuthority.actor.actorRef ||
      grant.authorityBasisRef !==
        input.invocationAuthority.authorityBasisRef ||
      grant.authorityBasisDigest !==
        input.invocationAuthority.authorityBasisDigest ||
      grant.scopeRef !== input.workspace.bindingRef ||
      grant.scopeDigest !== input.workspace.bindingDigest
    )
  ) {
    throw new TypeError(
      "run.invoke invocation authority rejoin projection differs"
    );
  }
  const runtimeProfileBasis = Object.freeze({
    kind: "abg_runtime_system_profile" as const,
    runtimeIdentity: input.runtimeProfile.runtimeIdentity,
    resolvedPolicy: input.runtimeProfile.resolvedPolicy,
    standardPluginRefs: input.runtimeProfile.standardPluginRefs
  });
  if (
    input.runtimeProfile.profileDigest !==
      stableSha256Digest(runtimeProfileBasis)
  ) {
    throw new TypeError("run.invoke runtime profile digest differs");
  }
}

export function admitRunInvokeExecutionIngress(
  input: RunInvokeExecutionIngressBasis
): AdmittedRunInvokeExecutionIngress {
  const basis = freezeBasis(input);
  assertBasis(basis);
  const ingressDigest = stableSha256Digest(basis);
  return Object.freeze({
    [RUN_INVOKE_EXECUTION_INGRESS]: true as const,
    kind: "admitted_run_invoke_execution_ingress" as const,
    ...basis,
    ingressRef:
      `abg://one-surface/execution-ingress/${ingressDigest.slice("sha256:".length)}`,
    ingressDigest
  });
}

export function assertAdmittedRunInvokeExecutionIngress(
  ingress: AdmittedRunInvokeExecutionIngress
): void {
  const expected = admitRunInvokeExecutionIngress(ingress);
  if (
    ingress[RUN_INVOKE_EXECUTION_INGRESS] !== true ||
    !stableJsonEquals(ingress, expected)
  ) {
    throw new TypeError("AdmittedRunInvokeExecutionIngress seal differs");
  }
}
