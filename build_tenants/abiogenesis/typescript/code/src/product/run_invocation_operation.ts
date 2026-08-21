import type { ComputeRegime } from "../gtl/contracts.js";
import type {
  AbgRunTruthProjection,
  AbgRunTruthRefusal,
} from "../abg/project_read_ports.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  admitRuntimeContract,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import { rawAdmitValue, type RawAdmittedValue } from "../validator/index.js";
import {
  applyCatalogDeclaration,
  type DeclarationApplication,
  type GraphFunctionCatalogView,
  type ReadyGraphFunctionCatalog,
} from "./catalog.js";
import {
  ProductExecutionResolutionPort,
  type LoadedProductExecutionResolution,
  type ProductExecutionResolutionRefusal,
  type ProductExecutionSelection,
} from "./execution_resolution.js";
import {
  isProductInstall,
  verifiedArtifactMatchesResolvedLock,
  type ProductInstall,
  type WorkspaceBinding,
} from "./environment.js";
import {
  constructCapabilityGrant,
  constructExactDirectInvocation,
  constructExactStartInvocation,
  constructInvocationAuthority,
  constructRootInvocationPolicy,
  type CapabilityGrant,
  type ExactDirectRunInvocation,
  type ExactStartRunInvocation,
  type InvocationAuthority,
  type PublicInvocationCandidate,
} from "./invocation.js";
import { RUN_OPERATION_CONTRACTS } from "./run_operation_contracts.js";
import {
  admitInstalledProductInput,
  validateInstalledInvocationBasis,
  type ProductInvocationSourceResultBasis,
} from "./semantics.js";

export type RunInvocationMemberKey = "invoke" | "start";
type InvokePacket = typeof RUN_OPERATION_CONTRACTS.invoke.invoke;
type StartPacket = typeof RUN_OPERATION_CONTRACTS.invoke.start;
type RunPacket<M extends RunInvocationMemberKey> = M extends "invoke"
  ? InvokePacket
  : StartPacket;
type ExactRunInvocation<M extends RunInvocationMemberKey> = M extends "invoke"
  ? ExactDirectRunInvocation
  : ExactStartRunInvocation;

export type ProductRunInvocationSourceAssertion =
  | Readonly<{ readonly kind: "none" }>
  | Readonly<{
      readonly kind: "admitted_source_result";
      readonly basis: ProductInvocationSourceResultBasis;
    }>;

export interface ProductRunInvocationResourceAssertion {
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogView: GraphFunctionCatalogView;
  readonly applications: readonly DeclarationApplication[];
  readonly source: ProductRunInvocationSourceAssertion;
}

export interface PreparedProductRunInvocation<M extends RunInvocationMemberKey> {
  readonly kind: "prepared_product_run_invocation";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: M;
  readonly invocation: ExactRunInvocation<M>;
  readonly resolution: LoadedProductExecutionResolution;
  readonly workspaceBinding: WorkspaceBinding;
  readonly admittedInput: Readonly<Record<string, JsonValue>>;
  readonly rawInput: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
  readonly sourceResultBasis: ProductInvocationSourceResultBasis | null;
  readonly policy: ReturnType<typeof constructRootInvocationPolicy>;
  readonly grants: readonly CapabilityGrant[];
  readonly authority: InvocationAuthority;
  readonly candidate: PublicInvocationCandidate;
}

export interface ProductRunInvocationPreparationRefusal<
  M extends RunInvocationMemberKey,
> {
  readonly kind: "product_run_invocation_preparation_refusal";
  readonly memberKey: M;
  readonly ownerOutput: OwnerSemanticOutput<RunPacket<M>>;
}

export type ProductRunInvocationPreparation<M extends RunInvocationMemberKey> =
  | PreparedProductRunInvocation<M>
  | ProductRunInvocationPreparationRefusal<M>;

export type ProductRunInvocationOwnerRefusal = Readonly<{
  readonly stage:
    | "setup"
    | "observation"
    | "invocation_admission"
    | "graph_validation"
    | "execution_basis"
    | "open_call"
    | "traversal"
    | "run_truth";
  readonly code: string;
  readonly evidenceRefs?: readonly string[];
}>;

function packet<M extends RunInvocationMemberKey>(memberKey: M): RunPacket<M> {
  return RUN_OPERATION_CONTRACTS.invoke[memberKey] as RunPacket<M>;
}

function validatedOutput<M extends RunInvocationMemberKey>(
  memberKey: M,
  output: OwnerSemanticOutput<RunPacket<M>>,
): OwnerSemanticOutput<RunPacket<M>> {
  const ownerPacket = packet(memberKey);
  const schema = output.outcomeKind === "result"
    ? ownerPacket.resultSchema
    : output.outcomeKind === "refusal"
    ? ownerPacket.refusalSchema
    : ownerPacket.nonTerminalSchema;
  if (
    schema === null ||
    admitRuntimeContract(schema, output.value).disposition !== "admitted"
  ) {
    throw new TypeError(
      "Product.RunInvocation output differs from its exact owner contract",
    );
  }
  return deepFreeze(output) as OwnerSemanticOutput<RunPacket<M>>;
}

function refusal<M extends RunInvocationMemberKey>(
  memberKey: M,
  code:
    | "invalid_program"
    | "invalid_graph_function"
    | "invalid_input"
    | "invalid_view"
    | "invalid_intent"
    | "invalid_capability"
    | "invalid_target"
    | "invalid_mode"
    | "invalid_until",
  issuePaths: readonly string[],
  evidenceRefs: readonly string[] = [],
): OwnerSemanticOutput<RunPacket<M>> {
  return validatedOutput(memberKey, {
    outcomeKind: "refusal",
    value: { code, issuePaths, evidenceRefs },
  } as OwnerSemanticOutput<RunPacket<M>>);
}

function preparationRefusal<M extends RunInvocationMemberKey>(
  memberKey: M,
  code: Parameters<typeof refusal<M>>[1],
  issuePaths: readonly string[],
): ProductRunInvocationPreparationRefusal<M> {
  return deepFreeze({
    kind: "product_run_invocation_preparation_refusal" as const,
    memberKey,
    ownerOutput: refusal(memberKey, code, issuePaths),
  });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactJson(left: unknown, right: unknown): boolean {
  try {
    return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
  } catch {
    return false;
  }
}

function catalogRef(digest: Sha256Digest): string {
  return `graph-function-catalog://abiogenesis/${digest.slice("sha256:".length)}`;
}

function catalogViewRef(digest: Sha256Digest): string {
  return `graph-function-catalog-view://abiogenesis/${digest.slice("sha256:".length)}`;
}

function exactApplications(
  view: GraphFunctionCatalogView,
  applications: readonly DeclarationApplication[],
): boolean {
  try {
    return new Set(applications.map((row) => row.applicationRef)).size ===
        applications.length && applications.every((application) => {
          const reconstructed = applyCatalogDeclaration(view, {
            applicationKind: application.declaration.declarationKind,
            handle: application.declaration.handle,
            targetRef: application.targetRef,
            targetDigest: application.targetDigest,
            appliedValueRef: application.appliedValueRef,
            appliedValueDigest: application.appliedValueDigest,
          });
          return reconstructed.kind === "declaration_application" &&
            exactJson(reconstructed, application);
        });
  } catch {
    return false;
  }
}

function exactInstalledDefinitionContracts<M extends RunInvocationMemberKey>(
  invocation: ExactRunInvocation<M>,
  resources: ProductRunInvocationResourceAssertion,
  admittedInstalls: readonly ProductInstall[],
  verifyInstallAdmission: (install: ProductInstall) => boolean,
): boolean {
  const lock = resources.catalog.readinessBasis.resolvedLock;
  const matches = resources.catalog.readinessBasis.verifiedProducts.flatMap(
    (verified) => {
      const operation = verified.definitionContractCoordinates?.operations.find(
        (candidate) =>
          candidate.operationId === invocation.definitionKey.operationId,
      );
      const member = operation?.members.find(
        (candidate) =>
          candidate.memberKey === invocation.definitionKey.memberKey,
      );
      return member === undefined ? [] : [{ verified, slots: member.slots }];
    },
  );
  if (matches.length !== 1) return false;
  const { verified, slots } = matches[0]!;
  const catalog = slots.request.contractCatalog;
  const installs = admittedInstalls.filter(
    (install) => install.productId === verified.productId,
  );
  if (installs.length !== 1) return false;
  const install = installs[0]!;
  if (
    catalog.productId !== verified.productId ||
    catalog.productContentDigest !== verified.productContentDigest ||
    catalog.catalogId !== verified.catalogId ||
    catalog.catalogDigest !== verified.catalogDigest ||
    !verifiedArtifactMatchesResolvedLock(verified, lock) ||
    !isProductInstall(install, lock) ||
    !verifyInstallAdmission(install) ||
    install.manifestDigest !== verified.manifestDigest ||
    install.productContentDigest !== verified.productContentDigest ||
    install.catalogId !== verified.catalogId ||
    install.catalogDigest !== verified.catalogDigest
  ) return false;
  return exactJson(invocation.contractCatalog, catalog) &&
    exactJson(invocation.invocationContract.contractCatalog, catalog) &&
    exactJson(invocation.requestContract, slots.request) &&
    exactJson(invocation.expectedResultContract, slots.result) &&
    exactJson(invocation.expectedRefusalContract, slots.refusal) &&
    exactJson(invocation.expectedNonTerminalContract, slots.nonTerminal);
}

function exactContractBoundInput(
  value: unknown,
  resolution: LoadedProductExecutionResolution,
  rawInput: RawAdmittedValue<Readonly<Record<string, JsonValue>>>,
): boolean {
  return isRecord(value) &&
    isRecord(value.contract) &&
    value.contract.ref === resolution.resolution.inputContract.contractRef &&
    value.contract.digest === resolution.resolution.inputContractDigest &&
    value.valueRef === rawInput.admissionRef &&
    value.valueDigest === rawInput.subjectDigest &&
    exactJson(value.value, rawInput.value);
}

function startSelection(
  request: ExactStartRunInvocation["request"],
): ProductExecutionSelection | null {
  if (
    request.scope !== "program" || request.until !== "converged" ||
    (request.rootMode !== "direct" && request.rootMode !== "supervised") ||
    !isRecord(request.target)
  ) return null;
  if (request.target.kind === "next") {
    return {
      kind: "start",
      scope: "program",
      target: "next",
      until: "converged",
      rootMode: request.rootMode,
    };
  }
  if (
    request.target.kind === "graph_function" &&
    typeof request.target.handle === "string"
  ) {
    return {
      kind: "start",
      scope: "program",
      target: "graph_function",
      graphFunctionHandle: request.target.handle,
      until: "converged",
      rootMode: request.rootMode,
    };
  }
  if (
    request.target.kind === "asset" &&
    typeof request.target.handle === "string"
  ) {
    return {
      kind: "start",
      scope: "program",
      target: `asset:${request.target.handle}`,
      until: "converged",
      rootMode: request.rootMode,
    };
  }
  if (
    request.target.kind === "declared_start" &&
    isRecord(request.target.start) &&
    typeof request.target.start.ref === "string"
  ) {
    return {
      kind: "start",
      scope: "program",
      target: request.target.start.ref,
      startRef: request.target.start.ref,
      until: "converged",
      rootMode: request.rootMode,
    };
  }
  return null;
}

function resolutionRefusalCode(
  result: ProductExecutionResolutionRefusal,
): Parameters<typeof refusal<RunInvocationMemberKey>>[1] {
  return result.stage === "catalog"
    ? "invalid_target"
    : result.stage === "implementation"
    ? "invalid_graph_function"
    : "invalid_program";
}

function sourceBasis(
  request: Readonly<Record<string, JsonValue>>,
  assertion: ProductRunInvocationSourceAssertion,
): ProductInvocationSourceResultBasis | null | false {
  if (!isRecord(request.sourceBasis)) return false;
  if (request.sourceBasis.kind === "none") {
    return assertion.kind === "none" ? null : false;
  }
  if (
    request.sourceBasis.kind !== "admitted_source_result" ||
    assertion.kind !== "admitted_source_result" ||
    !isRecord(request.sourceBasis.projectionAuthority) ||
    !isRecord(request.sourceBasis.sourceResult)
  ) return false;
  return request.sourceBasis.projectionAuthority.digest ===
      assertion.basis.publicAuthorityDigest &&
      request.sourceBasis.sourceResult.ref === assertion.basis.sourceResultRef &&
      request.sourceBasis.sourceResult.digest === assertion.basis.sourceResultDigest
    ? assertion.basis
    : false;
}

function authorityMatches<M extends RunInvocationMemberKey>(
  invocation: ExactRunInvocation<M>,
  resources: ProductRunInvocationResourceAssertion,
  resolution: LoadedProductExecutionResolution,
  workspaceBinding: WorkspaceBinding,
  admittedInstalls: readonly ProductInstall[],
  policy: ReturnType<typeof constructRootInvocationPolicy>,
  grants: readonly CapabilityGrant[],
  authority: InvocationAuthority,
  rawInput: RawAdmittedValue<Readonly<Record<string, JsonValue>>>,
  transportResourceAssertion: JsonValue,
): boolean {
  const slots = invocation.invocationAuthority.slots;
  const workspace = slots.workspace_binding;
  const lock = slots.dependency_lock;
  const productSet = slots.product_set;
  const catalogScope = slots.catalog_scope;
  const program = slots.execution_program;
  const graphFunction = slots.graph_function;
  const inputContract = slots.input_contract;
  const actor = slots.actor;
  const sessionPolicy = slots.session_policy;
  const capabilities = slots.capability_grants;
  const steering = slots.transport_steering;
  const requiredCapabilities = packet(invocation.definitionKey.memberKey)
    .metadata.capabilityRefs;
  const steeringDigest = sha256Canonical(transportResourceAssertion);
  const authorityRequest = invocation.request as Readonly<
    Record<string, JsonValue>
  >;
  const requestTarget = isRecord(authorityRequest.target)
    ? authorityRequest.target
    : null;
  const requiresGraphFunction = invocation.definitionKey.memberKey ===
      "invoke" || requestTarget?.kind === "graph_function";
  const exactGraphFunctionAuthority = requiresGraphFunction
    ? graphFunction !== null &&
      graphFunction.graphFunction.ref ===
        resolution.resolution.graphFunctionRef &&
      graphFunction.graphFunction.digest ===
        resolution.resolution.graphFunctionDigest &&
      graphFunction.membership.ref ===
        resolution.resolution.programGraphFunctionMembership.ref &&
      graphFunction.membership.digest ===
        resolution.resolution.programGraphFunctionMembership.digest
    : graphFunction === null;
  return workspace !== null && workspace.ref === workspaceBinding.bindingId &&
    workspace.digest === workspaceBinding.bindingDigest &&
    lock !== null && lock.ref === workspaceBinding.lockId &&
    lock.digest === workspaceBinding.lockDigest &&
    productSet !== null && productSet.length === admittedInstalls.length &&
    admittedInstalls.every((install) => productSet.some((row) =>
      row.ref === install.installId && row.digest === install.productContentDigest
    )) &&
    catalogScope !== null && "view" in catalogScope &&
    catalogScope.catalog.ref === catalogRef(resources.catalog.basisDigest) &&
    catalogScope.catalog.digest === resources.catalog.basisDigest &&
    catalogScope.view.ref === catalogViewRef(resources.catalogView.viewDigest) &&
    catalogScope.view.digest === resources.catalogView.viewDigest &&
    exactJson(catalogScope.allowlist, resources.catalogView.allowlist) &&
    program !== null && program.ref === resolution.resolution.programRef &&
    program.digest === resolution.resolution.programDigest &&
    exactGraphFunctionAuthority &&
    exactContractBoundInput(inputContract, resolution, rawInput) &&
    sessionPolicy !== null && sessionPolicy.ref === policy.policyRef &&
    sessionPolicy.digest === policy.policyDigest &&
    capabilities !== null &&
    exactJson(capabilities.requiredCapabilityRefs, requiredCapabilities) &&
    capabilities.grants.length === grants.length &&
    grants.every((grant) => capabilities.grants.some((row) =>
      row.ref === grant.grantRef && row.digest === grant.grantDigest
    )) &&
    actor !== null && actor.actor.ref === workspaceBinding.authorizedActorRef &&
    actor.actor.digest === sha256Canonical({
      actorRef: workspaceBinding.authorizedActorRef,
    }) &&
    actor.attribution.ref === authority.authorityRef &&
    actor.attribution.digest === authority.authorityDigest &&
    steering !== null && steering.digest === steeringDigest &&
    steering.ref ===
      `transport-steering://abiogenesis/${steeringDigest.slice("sha256:".length)}`;
}

export async function prepareProductRunInvocation<
  M extends RunInvocationMemberKey,
>(input: Readonly<{
  readonly memberKey: M;
  readonly invocation: ExactRunInvocation<M>;
  readonly resources: ProductRunInvocationResourceAssertion;
  readonly admittedInstalls: readonly ProductInstall[];
  readonly workspaceBinding: WorkspaceBinding;
  readonly verifyInstallAdmission: (install: ProductInstall) => boolean;
  readonly transportResourceAssertion: JsonValue;
}>): Promise<ProductRunInvocationPreparation<M>> {
  const { memberKey, invocation, resources } = input;
  if (
    invocation.definitionKey.memberKey !== memberKey ||
    !exactApplications(resources.catalogView, resources.applications)
  ) {
    return preparationRefusal(memberKey, "invalid_view", ["/catalogView"]);
  }
  const request = invocation.request as Readonly<Record<string, JsonValue>>;
  const programCoordinate = request.program;
  if (!isRecord(programCoordinate) || typeof programCoordinate.ref !== "string") {
    return preparationRefusal(memberKey, "invalid_program", ["/program"]);
  }
  const programRef = programCoordinate.ref;
  const selection: ProductExecutionSelection = memberKey === "invoke"
    ? typeof request.catalogHandle === "string"
      ? { kind: "direct", catalogHandle: request.catalogHandle }
      : { kind: "direct", catalogHandle: "" }
    : startSelection(
        invocation.request as ExactStartRunInvocation["request"],
      ) ?? {
        kind: "start",
        scope: "program",
        target: "",
        until: "converged",
        rootMode: "direct",
      };
  if (
    (selection.kind === "direct" && selection.catalogHandle.length === 0) ||
    (selection.kind === "start" && selection.target.length === 0)
  ) {
    return preparationRefusal(memberKey, "invalid_target", ["/target"]);
  }
  const resolution = await ProductExecutionResolutionPort.resolve({
    catalog: resources.catalog,
    catalogView: resources.catalogView,
    admittedInstalls: input.admittedInstalls,
    verifyInstallAdmission: input.verifyInstallAdmission,
    programRef,
    selection,
  });
  if (resolution.kind !== "loaded_product_execution_resolution") {
    return preparationRefusal(
      memberKey,
      resolutionRefusalCode(resolution),
      ["/program"],
    );
  }
  if (
    !exactInstalledDefinitionContracts(
      invocation,
      resources,
      input.admittedInstalls,
      input.verifyInstallAdmission,
    )
  ) {
    return preparationRefusal(
      memberKey,
      "invalid_view",
      ["/contractCatalog"],
    );
  }
  if (
    programCoordinate.digest !==
      sha256Canonical(resolution.program as unknown as JsonValue) ||
    !isRecord(request.catalogView) ||
    request.catalogView.ref !== catalogViewRef(resolution.resolution.catalogViewDigest) ||
    request.catalogView.digest !== resolution.resolution.catalogViewDigest ||
    !exactJson(request.allowlist, resources.catalogView.allowlist)
  ) {
    return preparationRefusal(memberKey, "invalid_view", ["/catalogView"]);
  }
  const inputCarrier = memberKey === "invoke"
    ? { contract: request.inputContract, value: request.input }
    : isRecord(request.input)
    ? { contract: request.input.contract, value: request.input.value }
    : null;
  if (
    inputCarrier === null || !isRecord(inputCarrier.contract) ||
    inputCarrier.contract.ref !== resolution.resolution.inputContract.contractRef ||
    inputCarrier.contract.digest !== resolution.resolution.inputContractDigest
  ) {
    return preparationRefusal(memberKey, "invalid_input", ["/input"]);
  }
  const admittedSource = sourceBasis(request, resources.source);
  if (admittedSource === false) {
    return preparationRefusal(memberKey, "invalid_input", ["/sourceBasis"]);
  }
  const admittedInput = admitInstalledProductInput(
    resolution.productSemantics,
    inputCarrier.contract.ref as string,
    inputCarrier.value,
  );
  if (
    admittedInput === null ||
    !validateInstalledInvocationBasis(resolution.productSemantics, {
      input: admittedInput,
      workspaceBindingId: input.workspaceBinding.bindingId,
      workspaceBindingDigest: input.workspaceBinding.bindingDigest,
      workspaceId: input.workspaceBinding.workspaceId,
      actionCatalog: resolution.program.actionCatalog === undefined
        ? null
        : resolution.program.actionCatalog as unknown as JsonValue,
      catalogView: resources.catalogView,
      catalogApplications: resources.applications,
      sourceResultBasis: admittedSource,
    })
  ) {
    return preparationRefusal(memberKey, "invalid_input", ["/input"]);
  }
  const rawInput = rawAdmitValue<Readonly<Record<string, JsonValue>>>(
    admittedInput,
    "invocation_input",
    inputCarrier.contract.ref as string,
  );
  if (rawInput.kind !== "raw_admitted_value") {
    return preparationRefusal(memberKey, "invalid_input", ["/input"]);
  }
  if (
    !exactContractBoundInput(
      invocation.invocationAuthority.slots.input_contract,
      resolution,
      rawInput,
    ) ||
    (
      memberKey === "start" &&
      !exactContractBoundInput(request.input, resolution, rawInput)
    )
  ) {
    return preparationRefusal(memberKey, "invalid_input", ["/input"]);
  }
  const declaredRegimes = new Set<ComputeRegime>([
    ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
    ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const policy = constructRootInvocationPolicy(
    input.workspaceBinding,
    resolution.program,
    resolution.programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    })),
    (["F_D", "F_P", "F_H"] as const).filter((regime) =>
      declaredRegimes.has(regime)
    ),
    resources.applications,
  );
  const actorRef = input.workspaceBinding.authorizedActorRef;
  const interactionCapabilityRefs = [
    ...new Set(resolution.programValidation.interactionLeafRows.map(
      (row) => row.requirement.actorCapabilityRef,
    )),
  ].sort();
  const grants = Object.freeze([
    constructCapabilityGrant(policy, actorRef),
    ...interactionCapabilityRefs.flatMap((capabilityRef) => [
      constructCapabilityGrant(
        policy,
        actorRef,
        "abg.operation.interaction.respond",
        capabilityRef,
      ),
      constructCapabilityGrant(
        policy,
        actorRef,
        "abg.operation.run.continue",
        capabilityRef,
      ),
    ]),
  ]);
  const authority = constructInvocationAuthority(
    actorRef,
    input.workspaceBinding,
    resources.catalogView,
    resolution.program.programRef,
    resolution.selectedCatalogEntry,
    policy,
    grants,
  );
  if (
    authority.kind !== "invocation_authority" ||
    !authorityMatches(
      invocation,
      resources,
      resolution,
      input.workspaceBinding,
      input.admittedInstalls,
      policy,
      grants,
      authority,
      rawInput,
      input.transportResourceAssertion,
    )
  ) {
    return preparationRefusal(
      memberKey,
      "invalid_capability",
      ["/invocationAuthority"],
    );
  }
  const candidate = memberKey === "invoke"
    ? constructExactDirectInvocation(
        invocation as ExactDirectRunInvocation,
        input.workspaceBinding,
        resources.catalogView,
        resolution.program,
        resolution.selectedCatalogEntry,
        rawInput,
        policy,
        grants,
        authority,
      )
    : constructExactStartInvocation(
        invocation as ExactStartRunInvocation,
        input.workspaceBinding,
        resources.catalogView,
        resolution.program,
        resolution.selectedCatalogEntry,
        rawInput,
        policy,
        grants,
        authority,
      );
  if (candidate.kind !== "public_invocation_candidate") {
    return preparationRefusal(
      memberKey,
      candidate.code === "contract_mismatch"
        ? "invalid_input"
        : candidate.code === "capability_mismatch"
        ? "invalid_capability"
        : "invalid_intent",
      ["/request"],
    );
  }
  return deepFreeze({
    kind: "prepared_product_run_invocation" as const,
    schemaVersion: "5.0.0" as const,
    memberKey,
    invocation,
    resolution,
    workspaceBinding: input.workspaceBinding,
    admittedInput,
    rawInput,
    sourceResultBasis: admittedSource,
    policy,
    grants,
    authority,
    candidate,
  });
}

export function constructRunInvocationOwnerRefusal<
  M extends RunInvocationMemberKey,
>(
  memberKey: M,
  owner: ProductRunInvocationOwnerRefusal,
): OwnerSemanticOutput<RunPacket<M>> {
  const code = owner.stage === "setup"
    ? "invalid_program"
    : owner.stage === "observation"
    ? "invalid_input"
    : owner.stage === "graph_validation" || owner.stage === "execution_basis"
    ? "invalid_graph_function"
    : owner.stage === "open_call" || owner.stage === "traversal"
    ? "invalid_target"
    : owner.stage === "invocation_admission" &&
        owner.code === "capability_mismatch"
    ? "invalid_capability"
    : owner.stage === "invocation_admission" &&
        owner.code === "catalog_view_not_admitted"
    ? "invalid_view"
    : owner.stage === "invocation_admission" &&
        owner.code === "contract_mismatch"
    ? "invalid_input"
    : "invalid_intent";
  return refusal(
    memberKey,
    code,
    [`/${owner.stage}`],
    owner.evidenceRefs ?? [],
  );
}

export function constructRunInvocationOutcome<
  M extends RunInvocationMemberKey,
>(
  memberKey: M,
  truth: AbgRunTruthProjection | AbgRunTruthRefusal,
): OwnerSemanticOutput<RunPacket<M>> {
  if (truth.kind === "abg_run_truth_refusal") {
    return constructRunInvocationOwnerRefusal(memberKey, {
      stage: "run_truth",
      code: truth.code,
    });
  }
  if (
    truth.evidence.length === 0 ||
    (memberKey === "invoke" && truth.graphCall === null)
  ) {
    return refusal(memberKey, "invalid_intent", ["/run"]);
  }
  if (truth.runtimeStatus === "held" || truth.runtimeStatus === "gap_stopped") {
    return validatedOutput(memberKey, {
      outcomeKind: "nonterminal",
      value: {
        invocationKind: memberKey,
        disposition: truth.runtimeStatus === "held" ? "held" : "gap_stop",
        run: truth.run,
        graphCall: truth.graphCall,
        interaction: truth.interaction,
        gap: truth.gap,
        evidence: truth.evidence,
        replay: truth.replay,
      },
    } as OwnerSemanticOutput<RunPacket<M>>);
  }
  if (["active", "workspace"].includes(truth.runtimeStatus)) {
    return refusal(memberKey, "invalid_intent", ["/run"]);
  }
  return validatedOutput(memberKey, {
    outcomeKind: "result",
    value: {
      invocationKind: memberKey,
      run: truth.run,
      graphCall: truth.graphCall,
      disposition: truth.runtimeStatus === "closed"
        ? "completed"
        : truth.runtimeStatus === "blocked"
        ? "blocked"
        : "runtime_failed",
      result: truth.result,
      stop: truth.stop,
      gap: truth.gap,
      interaction: truth.interaction,
      evidence: truth.evidence,
      replay: truth.replay,
    },
  } as OwnerSemanticOutput<RunPacket<M>>);
}

export const ProductRunInvocationPort = Object.freeze({
  prepare: prepareProductRunInvocation,
  projectOutcome: constructRunInvocationOutcome,
  projectOwnerRefusal: constructRunInvocationOwnerRefusal,
});
