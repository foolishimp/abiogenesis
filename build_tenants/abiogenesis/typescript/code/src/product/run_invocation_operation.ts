import { acquireQualificationResources, type QualificationResources } from "../validator/qualification_resources.js";
import { isQualificationAssessmentInput, establishQualificationAssessment, 
  type AdmittedQualificationRuleCatalog } from "../validator/qualification.js";
import { executingQualificationCatalogs } from "../validator/qualification_catalogs.js";
import { isSelfConformanceInput } from "../validator/self_conformance_contracts.js";
import { resolveSelfConformanceInput, isQualificationReferenceForm, resolveQualificationProof } from "../validator/qualification_resources.js";
import { qualificationScopeCorrespondence } from "../validator/qualification.js";
import type { QualificationResourceAssertion } from "../validator/qualification_contracts.js";
import { isRecord } from "../shared/admission_predicates.js";
import type { ComputeRegime } from "../gtl/contracts.js";
import { observeRunEnvironment, type RunEnvironmentResources } from "./stdo_environment.js";
import type { RunEnvironmentEvidence } from "../abg/stdo_environment.js";
import { isAbgTypedTerminalResult, type AbgHistoricalGraphCallSourceResource } from "../abg/terminal_result_contracts.js";
import type {
  AbgRunTruthProjection,
  AbgRunTruthRefusal,
} from "../abg/project_read_ports.js";
import { type JsonValue } from "../shared/canonical_json.js";
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
import { productInstallCoordinate, type ProductInstall, type WorkspaceBinding } from "./environment.js";
import {
  constructCapabilityGrant,
  constructExactDirectInvocation,
  constructExactStartInvocation,
  constructInvocationAuthority,
  constructRootInvocationPolicy,
  DIRECT_INVOKE_CAPABILITY,
  type CapabilityGrant,
  type ExactDirectRunInvocation,
  type ExactStartRunInvocation,
  type InvocationAuthority,
  type PublicInvocationCandidate,
} from "./invocation.js";
import { RUN_OPERATION_CONTRACTS } from "./run_operation_contracts.js";
import {
  admitInstalledProductInput,
  admitInstalledProductInputValue,
  validateInstalledInvocationBasis,
  type ProductInvocationSourceResultBasis,
  type GovernanceCoveredSourceUse,
} from "./semantics.js";
import { canonicalEquals } from "../shared/value/index.js";

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
  readonly historicalSource?: AbgHistoricalGraphCallSourceResource;
  readonly qualificationResources?: QualificationResourceAssertion;
  readonly runEnvironmentResources?: RunEnvironmentResources;
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogView: GraphFunctionCatalogView;
  readonly applications: readonly DeclarationApplication[];
  readonly source: ProductRunInvocationSourceAssertion;
}

export interface PreparedProductRunInvocation<M extends RunInvocationMemberKey> {
  readonly runEnvironment: RunEnvironmentEvidence | null;
  readonly qualificationResources?: QualificationResources;
  readonly kind: "prepared_product_run_invocation";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: M;
  readonly invocation: ExactRunInvocation<M>;
  readonly resolution: LoadedProductExecutionResolution;
  readonly workspaceBinding: WorkspaceBinding;
  readonly admittedInput: Readonly<Record<string, JsonValue>>;
  readonly rawInput: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
  readonly sourceResultBasis: ProductInvocationSourceResultBasis | null;
  /** @internal */
  readonly currentSourceUse?: GovernanceCoveredSourceUse;
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
            canonicalEquals(reconstructed, application);
        });
  } catch {
    return false;
  }
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

/** The session policy one run operation is admitted under: the exact
 * resolution's declared regimes and interaction leaves over the bound
 * workspace and applications. Population and every run owner share it. */
export function constructRunOperationPolicy(
  workspaceBinding: WorkspaceBinding,
  resolution: LoadedProductExecutionResolution,
  applications: readonly DeclarationApplication[],
): ReturnType<typeof constructRootInvocationPolicy> {
  const declaredRegimes = new Set<ComputeRegime>([
    ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
    ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  return constructRootInvocationPolicy(
    workspaceBinding,
    resolution.program,
    resolution.programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    })),
    (["F_D", "F_P", "F_H"] as const).filter((regime) =>
      declaredRegimes.has(regime)
    ),
    applications,
  );
}

/** The grants and invocation authority of one run.invoke member over the
 * exact policy; shared by population and preparation. */
function constructRunInvocationAuthorityBasis<M extends RunInvocationMemberKey>(
  memberKey: M,
  actorRef: string,
  workspaceBinding: WorkspaceBinding,
  admittedInstalls: readonly ProductInstall[],
  catalogView: GraphFunctionCatalogView,
  resolution: LoadedProductExecutionResolution,
  policy: ReturnType<typeof constructRootInvocationPolicy>,
): Readonly<{
  grants: readonly CapabilityGrant[];
  authority: ReturnType<typeof constructInvocationAuthority>;
}> {
  const fixedPacket = packet(memberKey);
  const grants = Object.freeze([
    constructCapabilityGrant(
      policy,
      actorRef,
      "abg.operation.run.invoke",
      DIRECT_INVOKE_CAPABILITY,
      { admittedInstalls, workspaceBinding, fixedPacket },
    ),
  ]);
  const authority = constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    resolution.program.programRef,
    resolution.selectedCatalogEntry,
    policy,
    grants,
    { admittedInstalls, workspaceBinding, fixedPacket },
  );
  return Object.freeze({ grants, authority });
}

type RunOperationKey =
  | Readonly<{ operationId: "abg.operation.run.invoke"; memberKey: RunInvocationMemberKey }>
  | Readonly<{ operationId: "abg.operation.run.continue"; memberKey: "current_intent" }>;

type Coordinate = Readonly<{ ref: string; digest: Sha256Digest }>;

/** The expected run-operation authority coordinates one exact resolution,
 * binding, catalog scope, policy, grants and attribution determine. Population
 * emits them; `runOperationAuthorityMatches` compares the supplied slots with
 * the same values. Input and execution-basis slots stay with their owners. */
export function expectedRunOperationAuthoritySlots(
  key: RunOperationKey,
  graphFunctionSelected: boolean,
  resources: Pick<ProductRunInvocationResourceAssertion, "catalog" | "catalogView">,
  resolution: LoadedProductExecutionResolution,
  workspaceBinding: WorkspaceBinding,
  admittedInstalls: readonly ProductInstall[],
  policy: ReturnType<typeof constructRootInvocationPolicy>,
  grants: readonly CapabilityGrant[],
  authority: Pick<InvocationAuthority, "authorityRef" | "authorityDigest">,
  transportResourceAssertion: JsonValue,
) {
  const requiredCapabilityRefs = key.operationId === "abg.operation.run.continue"
    ? RUN_OPERATION_CONTRACTS.continue[key.memberKey].metadata.capabilityRefs
    : packet(key.memberKey).metadata.capabilityRefs;
  const steeringDigest = sha256Canonical(transportResourceAssertion);
  const coordinate = (ref: string, digest: Sha256Digest): Coordinate =>
    Object.freeze({ ref, digest });
  return Object.freeze({
    workspace_binding: coordinate(workspaceBinding.bindingId, workspaceBinding.bindingDigest),
    product_set: Object.freeze(admittedInstalls.map(productInstallCoordinate)),
    dependency_lock: coordinate(workspaceBinding.lockId, workspaceBinding.lockDigest),
    catalog_scope: Object.freeze({
      catalog: coordinate(catalogRef(resources.catalog.basisDigest), resources.catalog.basisDigest),
      view: coordinate(catalogViewRef(resources.catalogView.viewDigest), resources.catalogView.viewDigest),
      allowlist: Object.freeze([...resources.catalogView.allowlist]),
    }),
    execution_program: coordinate(resolution.resolution.programRef, resolution.resolution.programDigest),
    graph_function: graphFunctionSelected
      ? Object.freeze({
          graphFunction: coordinate(resolution.resolution.graphFunctionRef, resolution.resolution.graphFunctionDigest),
          membership: coordinate(
            resolution.resolution.programGraphFunctionMembership.ref,
            resolution.resolution.programGraphFunctionMembership.digest,
          ),
        })
      : null,
    session_policy: coordinate(policy.policyRef, policy.policyDigest),
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([...requiredCapabilityRefs]),
      grants: Object.freeze(grants.map((grant) => coordinate(grant.grantRef, grant.grantDigest))),
    }),
    actor: Object.freeze({
      actor: coordinate(
        workspaceBinding.authorizedActorRef,
        sha256Canonical({ actorRef: workspaceBinding.authorizedActorRef }),
      ),
      attribution: coordinate(authority.authorityRef, authority.authorityDigest),
    }),
    transport_steering: coordinate(
      `transport-steering://abiogenesis/${steeringDigest.slice("sha256:".length)}`,
      steeringDigest,
    ),
  });
}

export function runOperationAuthorityMatches(
  invocation: ExactDirectRunInvocation | ExactStartRunInvocation | import("../shared/effect_definition.js").DefinitionCall<typeof RUN_OPERATION_CONTRACTS.continue.current_intent, unknown>["invocation"],
  resources: ProductRunInvocationResourceAssertion,
  resolution: LoadedProductExecutionResolution,
  workspaceBinding: WorkspaceBinding,
  admittedInstalls: readonly ProductInstall[],
  policy: ReturnType<typeof constructRootInvocationPolicy>,
  grants: readonly CapabilityGrant[],
  authority: Pick<InvocationAuthority, "authorityRef" | "authorityDigest">,
  transportResourceAssertion: JsonValue,
): boolean {
  const slots = invocation.invocationAuthority.slots;
  const workspace = slots.workspace_binding;
  const lock = slots.dependency_lock;
  const productSet = slots.product_set;
  const catalogScope = slots.catalog_scope;
  const program = slots.execution_program;
  const graphFunction = slots.graph_function;
  const actor = slots.actor;
  const sessionPolicy = slots.session_policy;
  const capabilities = slots.capability_grants;
  const steering = slots.transport_steering;
  const isContinue = invocation.definitionKey.operationId === "abg.operation.run.continue";
  const authorityRequest = invocation.request;
  const inputSlot = slots.input_contract;
  // The public binder authenticates slot syntax/digests; this owner joins the
  // exact asserted input to the selected request, just as the other coordinates.
  const exactInputAuthority = inputSlot !== null && (isContinue
    ? isRecord(authorityRequest.continuationInput) && inputSlot.valueDigest === authorityRequest.continuationInput.digest
    : invocation.definitionKey.memberKey === "start"
    ? authorityRequest.input !== undefined &&
      canonicalEquals(inputSlot, authorityRequest.input)
    : authorityRequest.inputContract !== undefined &&
      canonicalEquals(inputSlot.contract, authorityRequest.inputContract) &&
      authorityRequest.input !== undefined && canonicalEquals(inputSlot.value, authorityRequest.input) &&
      inputSlot.valueDigest === sha256Canonical(authorityRequest.input!));
  const requestTarget = isRecord(authorityRequest.target)
    ? authorityRequest.target
    : null;
  const requiresGraphFunction = isContinue || invocation.definitionKey.memberKey ===
      "invoke" || requestTarget?.kind === "graph_function";
  const expected = expectedRunOperationAuthoritySlots(
    invocation.definitionKey as RunOperationKey,
    requiresGraphFunction,
    resources,
    resolution,
    workspaceBinding,
    admittedInstalls,
    policy,
    grants,
    authority,
    transportResourceAssertion,
  );
  const exactGraphFunctionAuthority = expected.graph_function !== null
    ? graphFunction !== null &&
      graphFunction.graphFunction.ref === expected.graph_function.graphFunction.ref &&
      graphFunction.graphFunction.digest === expected.graph_function.graphFunction.digest &&
      graphFunction.membership.ref === expected.graph_function.membership.ref &&
      graphFunction.membership.digest === expected.graph_function.membership.digest
    : graphFunction === null;
  return workspace !== null && workspace.ref === expected.workspace_binding.ref &&
    workspace.digest === expected.workspace_binding.digest &&
    lock !== null && lock.ref === expected.dependency_lock.ref &&
    lock.digest === expected.dependency_lock.digest &&
    productSet !== null && productSet.length === expected.product_set.length &&
    expected.product_set.every((install) => productSet.some((row) =>
      row.ref === install.ref && row.digest === install.digest
    )) &&
    catalogScope !== null && "view" in catalogScope &&
    catalogScope.catalog.ref === expected.catalog_scope.catalog.ref &&
    catalogScope.catalog.digest === expected.catalog_scope.catalog.digest &&
    catalogScope.view.ref === expected.catalog_scope.view.ref &&
    catalogScope.view.digest === expected.catalog_scope.view.digest &&
    canonicalEquals(catalogScope.allowlist, expected.catalog_scope.allowlist) &&
    program !== null && program.ref === expected.execution_program.ref &&
    program.digest === expected.execution_program.digest &&
    exactGraphFunctionAuthority && exactInputAuthority &&
    sessionPolicy !== null && sessionPolicy.ref === expected.session_policy.ref &&
    sessionPolicy.digest === expected.session_policy.digest &&
    capabilities !== null &&
    canonicalEquals(capabilities.requiredCapabilityRefs, expected.capability_grants.requiredCapabilityRefs) &&
    capabilities.grants.length === expected.capability_grants.grants.length &&
    expected.capability_grants.grants.every((grant) => capabilities.grants.some((row) =>
      row.ref === grant.ref && row.digest === grant.digest
    )) &&
    actor !== null && actor.actor.ref === expected.actor.actor.ref &&
    actor.actor.digest === expected.actor.actor.digest &&
    actor.attribution.ref === expected.actor.attribution.ref &&
    actor.attribution.digest === expected.actor.attribution.digest &&
    steering !== null && steering.digest === expected.transport_steering.digest &&
    steering.ref === expected.transport_steering.ref;
}

/** @internal Finite raw/cold acquisition before dependent invocation effects.
 * The rule catalog is the executing ABIogenesis package's law, not the selected
 * Program's: it is taken at the first qualification input from the executing
 * package's admitted catalogs (`executingQualificationCatalogs`), for the
 * operation and for the owner bindings (`owner_bindings/run_invocation.ts`). */
export function prepareRunQualificationResources(resources: ProductRunInvocationResourceAssertion, value: unknown): QualificationResources | undefined {
  let qualificationResources: QualificationResources | undefined, rules: AdmittedQualificationRuleCatalog | undefined;
  const rulesOf = (): AdmittedQualificationRuleCatalog => rules ??= { rules: executingQualificationCatalogs().rules };
    if (resources.qualificationResources !== undefined) {
      const existing = [{ kind: "abg_historical_declaration_proof" as const, schemaVersion: "5.0.0" as const, catalog: resources.catalog, catalogView: resources.catalogView },
        ...(resources.historicalSource === undefined ? [] : [resources.historicalSource.declarationProof, ...(resources.historicalSource.declarationDependencies ?? [])])];
      // Current/historical proofs are explicit alternate sources. Duplicate exact dependencies refuse.
      const selected = resources.qualificationResources.manifests.flatMap(m => m.declarationSelections);
      const extras = existing.filter(p => selected.some(d => d.catalogBasisDigest === p.catalog.basisDigest && d.readinessBasisDigest === p.catalog.readinessBasisDigest && d.viewDigest === p.catalogView.viewDigest && d.proofDigest === sha256Canonical(p)));
      qualificationResources = acquireQualificationResources(resources.qualificationResources, extras);
    }
    const establish = (value: unknown): void => {
      if (isRecord(value) && value.kind === "qualification_assessment_input" && isQualificationAssessmentInput(value, rulesOf())) {
        const established = establishQualificationAssessment(value, qualificationResources, rulesOf());
        if ("representation" in value.task && !established.task.declarations.some(p => p.catalog.basisDigest === resources.catalog.basisDigest && p.catalogView.viewDigest === resources.catalogView.viewDigest))
          throw new TypeError("qualification invoking declaration dependency missing");
        return;
      }
      if (isSelfConformanceInput(value)) {
        const view = resolveSelfConformanceInput(value, qualificationResources), scope = view.input.scope;
        if (scope !== undefined) { const { catalog, digest } = rulesOf().rules; if (qualificationScopeCorrespondence(scope, catalog, digest, view.normalizedScope).length > 0) throw new TypeError("qualification scope differs"); }
        if (view.input.qualification !== undefined) resolveQualificationProof(view.input.qualification.proof, qualificationResources);
        return;
      }
      if (isRecord(value)) {
        if (isQualificationReferenceForm(value.proof)) resolveQualificationProof(value.proof as never, qualificationResources);
        // Declared wrapper/child inputs are finite data; acquisition grants no new call rights.
        for (const [key, child] of Object.entries(value)) if (key !== "task" && key !== "plan" && child !== null && typeof child === "object") establish(child);
      } else if (Array.isArray(value)) for (const child of value) establish(child);
    };
    establish(value);
    return qualificationResources;
}
// Observation-only §10.11 identity probe: weak references to the subjects the
// last preparation received. It retains nothing and changes no admission.
let lastPreparationSubjects: Readonly<{
  invocation: WeakRef<object>;
  request: WeakRef<object>;
  input: WeakRef<object> | null;
  catalog: WeakRef<object>;
  catalogView: WeakRef<object>;
}> | null = null;

/** @internal The subjects the last preparation received, while they live;
 * `input` is the request payload it hands to Product input admission. */
export function observeRunPreparationSubjects(): Readonly<{
  invocation: object | undefined;
  request: object | undefined;
  input: object | undefined;
  catalog: object | undefined;
  catalogView: object | undefined;
}> | null {
  return lastPreparationSubjects === null ? null : Object.freeze({
    invocation: lastPreparationSubjects.invocation.deref(),
    request: lastPreparationSubjects.request.deref(),
    input: lastPreparationSubjects.input?.deref(),
    catalog: lastPreparationSubjects.catalog.deref(),
    catalogView: lastPreparationSubjects.catalogView.deref(),
  });
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
  /** @internal Owner-bound preparation, never a raw resource/assertion field. */
  readonly deriveCurrentSourceUse?: (source: ProductInvocationSourceResultBasis, resolution: LoadedProductExecutionResolution) => GovernanceCoveredSourceUse | null;
}>): Promise<ProductRunInvocationPreparation<M>> {
  const { memberKey, invocation, resources } = input;
  const observedInput: unknown = memberKey === "invoke"
    ? invocation.request.input
    : isRecord(invocation.request.input) ? invocation.request.input.value : undefined;
  lastPreparationSubjects = Object.freeze({ invocation: new WeakRef(invocation),
    request: new WeakRef(invocation.request),
    input: typeof observedInput === "object" && observedInput !== null ? new WeakRef(observedInput) : null,
    catalog: new WeakRef(resources.catalog),
    catalogView: new WeakRef(resources.catalogView) });
  if (
    invocation.definitionKey.memberKey !== memberKey ||
    !exactApplications(resources.catalogView, resources.applications)
  ) {
    return preparationRefusal(memberKey, "invalid_view", ["/catalogView"]);
  }
  const request = invocation.request;
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
    programCoordinate.digest !==
      sha256Canonical(resolution.program) ||
    !isRecord(request.catalogView) ||
    request.catalogView.ref !== catalogViewRef(resolution.resolution.catalogViewDigest) ||
    request.catalogView.digest !== resolution.resolution.catalogViewDigest ||
    request.allowlist === undefined ||
    !canonicalEquals(request.allowlist, resources.catalogView.allowlist)
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
  let qualificationResources: QualificationResources | undefined;
  try { qualificationResources = prepareRunQualificationResources(resources, inputCarrier.value); }
  catch { return preparationRefusal(memberKey, "invalid_input", ["/qualificationResources"]); }
  const admittedSource = sourceBasis(request, resources.source);
  if (admittedSource === false) {
    return preparationRefusal(memberKey, "invalid_input", ["/sourceBasis"]);
  }
  const admittedInput = admitInstalledProductInput(
    resolution.productSemantics,
    inputCarrier.contract.ref as string,
    inputCarrier.value,
  );
  const currentSourceUse = admittedSource !== null && (admittedSource.workspaceBindingId !== input.workspaceBinding.bindingId ||
    admittedSource.workspaceBindingDigest !== input.workspaceBinding.bindingDigest)
    ? input.deriveCurrentSourceUse?.(admittedSource, resolution) ?? null : null;
  if (
    admittedInput === null ||
    !validateInstalledInvocationBasis(resolution.productSemantics, {
      input: admittedInput,
      workspaceBindingId: input.workspaceBinding.bindingId,
      workspaceBindingDigest: input.workspaceBinding.bindingDigest,
      workspaceId: input.workspaceBinding.workspaceId,
      actionCatalog: resolution.program.actionCatalog === undefined
        ? null
        : resolution.program.actionCatalog,
      catalogView: resources.catalogView,
      catalogApplications: resources.applications,
      sourceResultBasis: admittedSource,
      ...(currentSourceUse === null ? {} : { currentSourceUse: () => currentSourceUse }),
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
  const policy = constructRunOperationPolicy(
    input.workspaceBinding,
    resolution,
    resources.applications,
  );
  const actorRef = invocation.invocationAuthority.slots.actor?.actor.ref ?? "";
  const { grants, authority } = constructRunInvocationAuthorityBasis(
    memberKey,
    actorRef,
    input.workspaceBinding,
    input.admittedInstalls,
    resources.catalogView,
    resolution,
    policy,
  );
  if (
    authority.kind !== "invocation_authority" ||
    !runOperationAuthorityMatches(
      invocation,
      resources,
      resolution,
      input.workspaceBinding,
      input.admittedInstalls,
      policy,
      grants,
      authority,
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
  const environmentObservation = await observeRunEnvironment({
    publication: resolution.programPublication, program: resolution.program,
    graphFunctions: resolution.programDeclarationClosure.publications.flatMap(p => p.graphFunctions),
    authority: { authorityRef: authority.authorityRef, authorityDigest: authority.authorityDigest, actorRef: authority.actorRef },
    archiveRoot: input.workspaceBinding.roots.archiveRoot,
    ...(resources.runEnvironmentResources === undefined ? {} : { resources: resources.runEnvironmentResources }),
  });
  if (environmentObservation.kind === "run_environment_refusal") return preparationRefusal(memberKey,
    environmentObservation.cause === "unsupported_declaration" ? "invalid_program" : environmentObservation.cause === "identity_mismatch" ? "invalid_input" : "invalid_capability",
    [environmentObservation.issuePath, "/runEnvironment/cause/" + environmentObservation.cause]);
  return deepFreeze({
    kind: "prepared_product_run_invocation" as const,
    runEnvironment: environmentObservation.evidence,
    ...(qualificationResources === undefined ? {} : { qualificationResources }),
    schemaVersion: "5.0.0" as const,
    memberKey,
    invocation,
    resolution,
    workspaceBinding: input.workspaceBinding,
    admittedInput,
    rawInput,
    sourceResultBasis: admittedSource,
    ...(currentSourceUse === null ? {} : { currentSourceUse }),
    policy,
    grants,
    authority,
    candidate,
  });
}

/** One explicit run.invoke selection: a start target with its explicit
 * root and F_H modes, or one direct GraphFunction catalog handle. */
export type ProductRunInvocationSelectionIntent =
  | Readonly<{
      memberKey: "start";
      target:
        | Readonly<{ kind: "next" }>
        | Readonly<{ kind: "graph_function"; handle: string }>
        | Readonly<{ kind: "asset"; handle: string }>
        | Readonly<{ kind: "declared_start"; startRef: string }>;
      rootMode: "direct" | "supervised";
      fhMode: "direct" | "human-proxy";
    }>
  | Readonly<{ memberKey: "invoke"; catalogHandle: string }>;

/** The caller's source intent: none, or one owner-derived admitted source
 * result with the Public projection authority it was read under. */
export type ProductRunInvocationSourceIntent =
  | Readonly<{ kind: "none" }>
  | Readonly<{
      kind: "admitted_source_result";
      basis: ProductInvocationSourceResultBasis;
      projectionAuthority: Readonly<{ ref: string; digest: Sha256Digest }>;
    }>;

export type ProductRunInvocationInputIntent =
  | Readonly<{ value: JsonValue }>
  | Readonly<{
      factory: (resolved: Readonly<{
        resolution: LoadedProductExecutionResolution;
        workspaceBinding: WorkspaceBinding;
        grants: readonly CapabilityGrant[];
      }>) => JsonValue | Promise<JsonValue>;
    }>;

export interface ProductRunInvocationPopulationInput<
  S extends ProductRunInvocationSelectionIntent = ProductRunInvocationSelectionIntent,
> {
  readonly selection: S;
  readonly programRef: string;
  readonly catalog: ReadyGraphFunctionCatalog;
  readonly catalogView: GraphFunctionCatalogView;
  readonly applications: readonly DeclarationApplication[];
  readonly admittedInstalls: readonly ProductInstall[];
  readonly workspaceBinding: WorkspaceBinding;
  readonly verifyInstallAdmission: (install: ProductInstall) => boolean;
  readonly actorRef: string;
  readonly input: ProductRunInvocationInputIntent;
  readonly inputValueRef: string;
  readonly source: ProductRunInvocationSourceIntent;
  /** The exact event-resource assertion the constructed call carries. */
  readonly transportResourceAssertion: JsonValue;
}

export interface PopulatedProductRunInvocation<M extends RunInvocationMemberKey> {
  readonly kind: "populated_product_run_invocation";
  readonly memberKey: M;
  readonly request: ExactRunInvocation<M>["request"];
  readonly slots: ExactRunInvocation<M>["invocationAuthority"]["slots"];
  readonly sourceAssertion: ProductRunInvocationSourceAssertion;
  readonly resolution: LoadedProductExecutionResolution;
  readonly admittedInput: Readonly<Record<string, JsonValue>>;
  readonly policy: ReturnType<typeof constructRootInvocationPolicy>;
  readonly grants: readonly CapabilityGrant[];
  readonly authority: InvocationAuthority;
}

export type ProductRunInvocationPopulation<M extends RunInvocationMemberKey> =
  | PopulatedProductRunInvocation<M>
  | ProductRunInvocationPreparationRefusal<M>;

/**
 * Populate one exact run.invoke request and its authority slots from the
 * caller's explicit selection, input and source intent through the existing
 * Product owners: execution resolution, installed input admission, the shared
 * run policy, grant and authority construction, and the expected authority
 * slots `runOperationAuthorityMatches` compares. Construction only: the
 * installed binding still admits the call, its resources and currentness.
 */
export async function populateProductRunInvocation<
  S extends ProductRunInvocationSelectionIntent,
>(
  input: ProductRunInvocationPopulationInput<S>,
): Promise<ProductRunInvocationPopulation<S["memberKey"]>> {
  type M = S["memberKey"];
  const selectionIntent: ProductRunInvocationSelectionIntent = input.selection;
  const memberKey = selectionIntent.memberKey as M;
  const startTarget = selectionIntent.memberKey === "start"
    ? selectionIntent.target.kind === "declared_start"
      ? { kind: "declared_start", start: { ref: selectionIntent.target.startRef } }
      : selectionIntent.target
    : null;
  // The start request's own selection law selects for population as for preparation.
  const selection: ProductExecutionSelection | null = selectionIntent.memberKey === "invoke"
    ? selectionIntent.catalogHandle.length === 0
      ? null
      : { kind: "direct", catalogHandle: selectionIntent.catalogHandle }
    : startSelection({
        scope: "program",
        target: startTarget,
        until: "converged",
        rootMode: selectionIntent.rootMode,
      } as unknown as ExactStartRunInvocation["request"]);
  if (selection === null) {
    return preparationRefusal(memberKey, "invalid_target", ["/target"]);
  }
  const resolution = await ProductExecutionResolutionPort.resolve({
    catalog: input.catalog,
    catalogView: input.catalogView,
    admittedInstalls: input.admittedInstalls,
    verifyInstallAdmission: input.verifyInstallAdmission,
    programRef: input.programRef,
    selection,
  });
  if (resolution.kind !== "loaded_product_execution_resolution") {
    return preparationRefusal(memberKey, resolutionRefusalCode(resolution), ["/program"]);
  }
  // Policy and grants depend on the resolved declaration only; an input
  // factory may name the grant it observes under.
  const policy = constructRunOperationPolicy(input.workspaceBinding, resolution, input.applications);
  // Grants, authority and the actor slot name one actor: the binding's
  // authorized actor, which `runOperationAuthorityMatches` compares.
  if (input.actorRef !== input.workspaceBinding.authorizedActorRef) {
    return preparationRefusal(memberKey, "invalid_capability", ["/invocationAuthority"]);
  }
  const { grants, authority } = constructRunInvocationAuthorityBasis(
    memberKey,
    input.actorRef,
    input.workspaceBinding,
    input.admittedInstalls,
    input.catalogView,
    resolution,
    policy,
  );
  if (authority.kind !== "invocation_authority") {
    return preparationRefusal(memberKey, "invalid_capability", ["/invocationAuthority"]);
  }
  const suppliedValue = "value" in input.input
    ? input.input.value
    : await input.input.factory(Object.freeze({ resolution, workspaceBinding: input.workspaceBinding, grants }));
  const inputContractRef = resolution.resolution.inputContract.contractRef;
  // §10.11 X2: the request carries the detached admitted input, so a later
  // change to the caller's value cannot reach the call; digests are canonical.
  const inputAdmission = admitInstalledProductInputValue(resolution.productSemantics, inputContractRef, suppliedValue);
  const admittedInput = inputAdmission?.admitted ?? null;
  if (inputAdmission === null || admittedInput === null) {
    return preparationRefusal(memberKey, "invalid_input", ["/input"]);
  }
  const value = inputAdmission.value;
  const coordinate = (ref: string, digest: Sha256Digest) => Object.freeze({ ref, digest });
  const program = coordinate(resolution.resolution.programRef, resolution.resolution.programDigest);
  const view = coordinate(catalogViewRef(input.catalogView.viewDigest), input.catalogView.viewDigest);
  const allowlist = Object.freeze([...input.catalogView.allowlist]);
  const inputContract = coordinate(inputContractRef, resolution.resolution.inputContractDigest);
  const sourceBasisRequest = input.source.kind === "none"
    ? Object.freeze({ kind: "none" as const })
    : Object.freeze({
        kind: "admitted_source_result" as const,
        projectionAuthority: coordinate(input.source.projectionAuthority.ref, input.source.projectionAuthority.digest),
        sourceResult: coordinate(input.source.basis.sourceResultRef, input.source.basis.sourceResultDigest),
      });
  const sourceAssertion: ProductRunInvocationSourceAssertion = input.source.kind === "none"
    ? Object.freeze({ kind: "none" })
    : Object.freeze({ kind: "admitted_source_result", basis: input.source.basis });
  const contractBoundInput = Object.freeze({
    contract: inputContract,
    valueRef: input.inputValueRef,
    valueDigest: sha256Canonical(value),
    value,
  });
  let request: Readonly<Record<string, JsonValue>>;
  let graphFunctionSelected: boolean;
  if (selectionIntent.memberKey === "invoke") {
    graphFunctionSelected = true;
    request = Object.freeze({
      program,
      catalogHandle: selectionIntent.catalogHandle,
      inputContract,
      input: value,
      catalogView: view,
      allowlist,
      sourceBasis: sourceBasisRequest,
    });
  } else {
    const target = selectionIntent.target;
    graphFunctionSelected = target.kind === "graph_function";
    const resolvedStart = resolution.resolvedProgramStart;
    if (target.kind === "declared_start" && (resolvedStart === null || resolvedStart.start.startRef !== target.startRef)) {
      return preparationRefusal(memberKey, "invalid_target", ["/target"]);
    }
    request = Object.freeze({
      program,
      scope: "program",
      target: target.kind === "declared_start"
        ? Object.freeze({
            kind: "declared_start",
            start: coordinate(resolvedStart!.start.startRef, sha256Canonical(resolvedStart!.start as unknown as JsonValue)),
          })
        : Object.freeze({ ...target }),
      until: "converged",
      catalogView: view,
      allowlist,
      input: contractBoundInput,
      fhMode: selectionIntent.fhMode,
      rootMode: selectionIntent.rootMode,
      sourceBasis: sourceBasisRequest,
    });
  }
  const expected = expectedRunOperationAuthoritySlots(
    { operationId: "abg.operation.run.invoke", memberKey },
    graphFunctionSelected,
    { catalog: input.catalog, catalogView: input.catalogView },
    resolution,
    input.workspaceBinding,
    input.admittedInstalls,
    policy,
    grants,
    authority,
    input.transportResourceAssertion,
  );
  const slots = Object.freeze({
    ...expected,
    input_contract: selectionIntent.memberKey === "invoke"
      ? Object.freeze({ contract: inputContract, valueRef: input.inputValueRef, valueDigest: sha256Canonical(value), value })
      : contractBoundInput,
    verification_references: null,
    execution_basis: null,
  });
  return Object.freeze({
    kind: "populated_product_run_invocation" as const,
    memberKey,
    request: request as unknown as ExactRunInvocation<M>["request"],
    slots: slots as unknown as ExactRunInvocation<M>["invocationAuthority"]["slots"],
    sourceAssertion,
    resolution,
    admittedInput,
    policy,
    grants,
    authority,
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
      evidenceRefs: truth.diagnosticRef === undefined ? [] : [truth.diagnosticRef],
    });
  }
  if (
    truth.evidence.length === 0 ||
    (memberKey === "invoke" && truth.graphCall === null)
  ) {
    return refusal(memberKey, "invalid_intent", ["/run"]);
  }
  const stopped = truth.stopStatement === null ? {} : { stopStatement: truth.stopStatement };
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
        ...stopped,
      },
    } as OwnerSemanticOutput<RunPacket<M>>);
  }
  if (["active", "workspace"].includes(truth.runtimeStatus)) {
    return refusal(memberKey, "invalid_intent", ["/run"]);
  }
  if (truth.runtimeStatus === "closed" &&
      (!isAbgTypedTerminalResult(truth.terminalResult) || truth.result === null ||
       truth.result.ref !== truth.terminalResult.result.ref || truth.result.digest !== truth.terminalResult.result.digest ||
       truth.terminalResult.producer.runRef !== truth.run.ref ||
       truth.terminalResult.producer.graphCallRef !== truth.graphCall?.ref)) {
    return refusal(memberKey, "invalid_intent", ["/terminalResult"]);
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
      result: truth.runtimeStatus === "closed" ? truth.terminalResult!.result : null,
      terminalResult: truth.runtimeStatus === "closed" ? truth.terminalResult : null,
      stop: truth.stop,
      gap: truth.gap,
      interaction: truth.interaction,
      evidence: truth.evidence,
      replay: truth.replay,
      ...stopped,
    },
  } as OwnerSemanticOutput<RunPacket<M>>);
}

export const ProductRunInvocationPort = Object.freeze({
  prepare: prepareProductRunInvocation,
  projectOutcome: constructRunInvocationOutcome,
  projectOwnerRefusal: constructRunInvocationOwnerRefusal,
});
