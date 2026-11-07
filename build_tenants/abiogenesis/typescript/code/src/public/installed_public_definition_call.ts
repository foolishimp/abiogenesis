import { admitJson } from "../shared/admit/index.js";
import { isRecord } from "../shared/admission_predicates.js";
import * as abg from "../abg/index.js";
import * as product from "../product/index.js";
import { PUBLIC_FUNCTION_DEFINITION_FAMILY, PUBLIC_OPERATION_CONTRACT_PROJECTIONS } from "./binding/public_function_family.js";
import { PUBLIC_PROJECTION_PAYLOADS } from "./binding/public_function_projections.js";
import { admitExactDefinitionCall } from "./binding/definition_binding_mechanics.js";
import { OWNER_CONTRACT_SOURCES } from "./binding/owner_contract_source_set.js";
import type { JsonValue } from "../shared/canonical_json.js";
import type { Sha256Digest } from "../shared/digests.js";
import type {
  CompleteDefinitionContractCoordinateMap,
} from "../shared/public_function_contracts.js";
import type {
  IntrinsicPublicFunctionDefinition,
  IntrinsicPublicFunctionFamily,
  IntrinsicPublicOperationContractProjection,
} from "./binding/public_function_family.js";
import type { PublicProjectionPayloads } from "./binding/public_function_projections.js";
import type {
  AdmittedPublicInvocation,
  InvocationAuthoritySlotName,
  InvocationAuthoritySlotsOf,
  PublicContractCatalogCoordinate,
  PublicContractCoordinate,
  PublicContractSlot,
  PublicDefinitionKeyLike,
} from "../shared/public_invocation.js";
import type {
  OwnerCallableDefinitionMember,
  OwnerDefinitionRequestOf,
} from "./binding/owner_contract_source_set.js";

/** Explicit installed inputs for pure construction; no input is admitted here. */
export interface InstalledPublicDefinitionCallEnvironment {
  readonly product: Readonly<{
    canonicalJson: (value: JsonValue) => string;
    sha256Canonical: (value: JsonValue) => Sha256Digest;
  }>;
  readonly installedPublic: Readonly<{
    PUBLIC_FUNCTION_DEFINITION_FAMILY: IntrinsicPublicFunctionFamily;
    PUBLIC_OPERATION_CONTRACT_PROJECTIONS:
      readonly IntrinsicPublicOperationContractProjection[];
    PUBLIC_PROJECTION_PAYLOADS: PublicProjectionPayloads;
  }>;
  readonly definitionContractCoordinates:
    CompleteDefinitionContractCoordinateMap | null;
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly requestRef: string;
  readonly correlationRef: string;
  readonly eventTime: string;
  readonly provenanceRefs: readonly string[];
}

type RequiredAuthoritySlotNames<K extends PublicDefinitionKeyLike, R> = {
  readonly [S in InvocationAuthoritySlotName]:
    [InvocationAuthoritySlotsOf<K, R>[S]] extends [null] ? never : S;
}[InvocationAuthoritySlotName];

type SameSlotNames<A, B> = [A] extends [B] ? [B] extends [A] ? true : false
  : false;

type RequestPropertyVariant<R, P extends keyof R> = R[P] extends infer V
  ? V extends unknown ? { readonly [Q in keyof R]: Q extends P ? V : R[Q] }
  : never
  : never;

// A request property is split only when one of its variants changes the
// required authority-slot set; other unions stay whole.
type SlotRelevantRequestKeys<K extends PublicDefinitionKeyLike, R> = {
  readonly [P in keyof R]-?: RequestPropertyVariant<R, P> extends infer V
    ? V extends unknown
      ? SameSlotNames<
        RequiredAuthoritySlotNames<K, V>,
        RequiredAuthoritySlotNames<K, R>
      > extends true ? never
      : P
    : never
    : never;
}[keyof R];

type LastOfUnion<U> =
  (U extends unknown ? (value: () => U) => void : never) extends
    (value: infer I) => void ? I extends () => infer L ? L : never
    : never;

type SplitRequestAt<R, P> = [P] extends [never] ? R
  : LastOfUnion<P> extends infer L extends keyof R
    ? RequestPropertyVariant<R, L> extends infer V
      ? V extends unknown ? SplitRequestAt<V, Exclude<P, L>> : never
    : never
  : never;

/** Concrete request variants distribute before the conditional slot law. */
type SlotRequestVariants<K extends PublicDefinitionKeyLike, R> = R extends
  unknown ? SplitRequestAt<R, SlotRelevantRequestKeys<K, R>>
  : never;

type InstalledPublicDefinitionCallSelectionOf<
  M extends OwnerCallableDefinitionMember,
  R,
> = {
  readonly operationId: M["definitionKey"]["operationId"];
  readonly memberKey: M["definitionKey"]["memberKey"];
  readonly request: R;
  readonly slots: InvocationAuthoritySlotsOf<M["definitionKey"], R>;
  readonly resources: M["binding"]["resources"];
};

/** One callable member, one owner request variant, its exact authority slots
 * and its installed callable resource assertion. */
export type InstalledPublicDefinitionCallSelection<
  M extends OwnerCallableDefinitionMember = OwnerCallableDefinitionMember,
> = M extends unknown
  ? SlotRequestVariants<M["definitionKey"], OwnerDefinitionRequestOf<M>> extends
    infer R ? R extends unknown ? InstalledPublicDefinitionCallSelectionOf<M, R>
    : never
  : never
  : never;

export type InstalledPublicDefinitionCallInput<
  S extends InstalledPublicDefinitionCallSelection =
    InstalledPublicDefinitionCallSelection,
> = InstalledPublicDefinitionCallEnvironment & S;

/** The constructed envelope keeps the selected key, request and resources.
 * A union of selections stays a union of calls: each alternative keeps its
 * own key, request variant, slots and resources. */
export type InstalledPublicDefinitionCall<
  S extends InstalledPublicDefinitionCallSelection =
    InstalledPublicDefinitionCallSelection,
> = S extends unknown ? Readonly<{
  invocation: AdmittedPublicInvocation<
    Readonly<{ operationId: S["operationId"]; memberKey: S["memberKey"] }>,
    S["request"] & Readonly<Record<string, JsonValue>>
  >;
  resources: S["resources"];
}>
  : never;

type ConstructionProduct = InstalledPublicDefinitionCallEnvironment["product"];

function exact<T>(
  values: readonly T[],
  predicate: (value: T) => boolean,
  label: string,
): T {
  const matches = values.filter(predicate);
  if (matches.length !== 1) {
    throw new TypeError(`${label} must select one exact installed value`);
  }
  return matches[0]!;
}

/** Both sides are admitted through `admitJson` before the installed codec
 * compares them; a refusal, or a throw (a cycle), is inequality. */
function sameJson(product: ConstructionProduct, left: unknown, right: unknown): boolean {
  try {
    const admittedLeft = admitJson(left);
    const admittedRight = admitJson(right);
    return admittedLeft.kind === "ok" && admittedRight.kind === "ok" &&
      product.canonicalJson(admittedLeft.value) ===
        product.canonicalJson(admittedRight.value);
  } catch {
    return false;
  }
}

function requireSlot({
  product,
  coordinate,
  contractCatalog,
  definition,
  slot,
  definitionRef,
}: {
  readonly product: ConstructionProduct;
  readonly coordinate: PublicContractCoordinate | null;
  readonly contractCatalog: PublicContractCatalogCoordinate;
  readonly definition: IntrinsicPublicFunctionDefinition;
  readonly slot: PublicContractSlot;
  readonly definitionRef: string;
}): PublicContractCoordinate {
  if (
    coordinate === null ||
    !sameJson(product, coordinate.contractCatalog, contractCatalog) ||
    coordinate.flatRow.contractId !== definition.definitionKey.operationId ||
    coordinate.flatRow.contractVersion !== "5.0.0" ||
    coordinate.nestedSelector.selectorKind !== "operation_definition_slot" ||
    !sameJson(
      product,
      coordinate.nestedSelector.definitionKey,
      definition.definitionKey,
    ) ||
    coordinate.nestedSelector.slot !== slot ||
    coordinate.nestedSelector.definitionRef !== definitionRef
  ) {
    throw new TypeError(
      `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey} ${slot} lacks its exact owner-issued coordinate`,
    );
  }
  return coordinate;
}

/**
 * Construct the exact installed Public invocation envelope and resource assertion.
 * Coordinates must come from Product verification. This function selects and
 * hashes declared values only; the installed transport and owners still admit
 * the invocation, authority, request and resources before any execution.
 */
export function constructInstalledPublicDefinitionCall<
  S extends InstalledPublicDefinitionCallSelection,
>({
  product,
  installedPublic,
  definitionContractCoordinates,
  contractCatalog,
  operationId,
  memberKey,
  request,
  slots,
  resources,
  requestRef,
  correlationRef,
  eventTime,
  provenanceRefs,
}: InstalledPublicDefinitionCallInput<S>): InstalledPublicDefinitionCall<S> {
  if (definitionContractCoordinates === null) {
    throw new TypeError(
      "installed Public DefinitionCall requires verified definition coordinates",
    );
  }
  const definition = exact(
    installedPublic.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions,
    (candidate) =>
      candidate.definitionKey.operationId === operationId &&
      candidate.definitionKey.memberKey === memberKey,
    "installed Public definition",
  );
  const operation = exact(
    definitionContractCoordinates.operations,
    (candidate) => candidate.operationId === operationId,
    "verified operation coordinates",
  );
  const member = exact(
    operation.members,
    (candidate) => candidate.memberKey === memberKey,
    "verified member coordinates",
  );
  const installedOperation = exact(
    installedPublic.PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
    (candidate) => candidate.operationId === operationId,
    "installed operation projection",
  );
  const installedMember = exact(
    installedOperation.definitions,
    (candidate) => candidate.definitionKey.memberKey === memberKey,
    "installed member projection",
  );
  const requestCoordinate = requireSlot({
    product,
    coordinate: member.slots.request,
    contractCatalog,
    definition,
    slot: "request",
    definitionRef: installedMember.requestContract.definitionRef,
  });
  const resultCoordinate = requireSlot({
    product,
    coordinate: member.slots.result,
    contractCatalog,
    definition,
    slot: "result",
    definitionRef: installedMember.resultContract.definitionRef,
  });
  const refusalCoordinate = requireSlot({
    product,
    coordinate: member.slots.refusal,
    contractCatalog,
    definition,
    slot: "refusal",
    definitionRef: installedMember.refusalContract.definitionRef,
  });
  const nonTerminalCoordinate = installedMember.nonTerminalContract === null
    ? member.slots.nonTerminal === null
      ? null
      : (() => {
          throw new TypeError("installed terminal definition has an extra coordinate");
        })()
    : requireSlot({
        product,
        coordinate: member.slots.nonTerminal,
        contractCatalog,
        definition,
        slot: "non_terminal",
        definitionRef: installedMember.nonTerminalContract.definitionRef,
      });
  const invocationAuthorityBody = Object.freeze({
    kind: "invocation_authority" as const,
    definitionKey: definition.definitionKey,
    slots,
  });
  const invocationAuthority = Object.freeze({
    ...invocationAuthorityBody,
    authorityDigest: product.sha256Canonical(invocationAuthorityBody as unknown as JsonValue),
  });
  const requestDigest = product.sha256Canonical(request);
  const invocationBody = Object.freeze({
    kind: "public_invocation" as const,
    schemaVersion: "5.0.0" as const,
    invocationContract: Object.freeze({
      contractCatalog,
      flatRow: Object.freeze({
        contractId: "abg.schema.public-operation-invocation",
        contractVersion: "5.0.0" as const,
        contractDigest:
          installedPublic.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset
            .contentDigest,
      }),
      nestedSelector: Object.freeze({
        selectorKind: "schema_definition" as const,
        definitionKey: null,
        slot: null,
        definitionRef: "#/$defs/PublicInvocation",
      }),
    }),
    definitionRef: definition.definitionRef,
    definitionVersion: "5.0.0" as const,
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog,
    invocationAuthority,
    requestContract: requestCoordinate,
    requestRef,
    requestDigest,
    request,
    expectedResultContract: resultCoordinate,
    expectedRefusalContract: refusalCoordinate,
    expectedNonTerminalContract: nonTerminalCoordinate,
    correlationRef,
    eventTime,
    provenanceRefs: Object.freeze([...provenanceRefs]),
  });
  const invocationDigest = product.sha256Canonical(invocationBody as unknown as JsonValue);
  // The exact installed selection above is the selected key; request, slots
  // and resources keep their supplied identity.
  return Object.freeze({
    invocation: Object.freeze({
      ...invocationBody,
      invocationRef:
        `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
      invocationDigest,
    }),
    resources,
  }) as unknown as InstalledPublicDefinitionCall<S>;
}

/** Explicit envelope identity of one constructed installed call. */
export interface InstalledCallEnvelopeIdentity {
  readonly definitionContractCoordinates: CompleteDefinitionContractCoordinateMap;
  readonly requestRef: string;
  readonly correlationRef: string;
  readonly eventTime: string;
  readonly provenanceRefs: readonly string[];
}

const INSTALLED_PUBLIC = Object.freeze({
  PUBLIC_FUNCTION_DEFINITION_FAMILY,
  PUBLIC_OPERATION_CONTRACT_PROJECTIONS,
  PUBLIC_PROJECTION_PAYLOADS,
});

/** The verified request-slot contract catalog of one exact member. */
function verifiedContractCatalog(
  coordinates: CompleteDefinitionContractCoordinateMap,
  operationId: string,
  memberKey: string,
): PublicContractCatalogCoordinate {
  const member = exact(
    exact(coordinates.operations, (row) => row.operationId === operationId, "verified operation coordinates").members,
    (row) => row.memberKey === memberKey,
    "verified member coordinates",
  );
  if (member.slots.request === null) {
    throw new TypeError(`${operationId}#${memberKey} lacks its verified request coordinate`);
  }
  return member.slots.request.contractCatalog;
}

type CallableMemberAt<O extends string, K extends string> = Extract<
  OwnerCallableDefinitionMember,
  Readonly<{ definitionKey: Readonly<{ operationId: O; memberKey: K }> }>
>;

type MemberSelection<O extends string, K extends string> =
  InstalledPublicDefinitionCallSelection<CallableMemberAt<O, K>>;

/** The `run.invoke` alternative one selection intent names: the start
 * variant of its target kind, or the direct GraphFunction member. */
export type InstalledStartCallSelection<
  S extends product.ProductRunInvocationSelectionIntent =
    product.ProductRunInvocationSelectionIntent,
> = S extends Readonly<{ memberKey: "start"; target: Readonly<{ kind: infer T }> }>
  ? Extract<
    MemberSelection<"abg.operation.run.invoke", "start">,
    Readonly<{ request: Readonly<{ target: Readonly<{ kind: T }> }> }>
  >
  : MemberSelection<"abg.operation.run.invoke", "invoke">;

/** The `run.continue` alternative one continuation intent names. */
export type InstalledPendingCallSelection<
  S extends product.RunContinuationSelectionIntent =
    product.RunContinuationSelectionIntent,
> = S extends Readonly<{ kind: "selected_action" }>
  ? MemberSelection<"abg.operation.run.continue", "selected_action">
  : Extract<
    MemberSelection<"abg.operation.run.continue", "current_intent">,
    Readonly<{
      request: S extends Readonly<{ kind: "pending_execution" }>
        ? Readonly<{ pendingCursor: unknown }>
        : Readonly<{ currentIntent: unknown }>;
    }>
  >;

type RunReadCallSelections = {
  readonly [K in abg.AbgRunReadMemberKey]:
    MemberSelection<"abg.operation.project.read", K>;
};

/** The `project.read` member one run-read key names. */
export type InstalledRunReadCallSelection<
  K extends abg.AbgRunReadMemberKey = abg.AbgRunReadMemberKey,
> = RunReadCallSelections[K];

/**
 * The checked boundary between owner population and the correlated call
 * type. Product and ABG own the populated request and slots; the constructed
 * invocation is typed as the selected member and variant only after it
 * satisfies that installed member's own exact invocation contract (key,
 * request schema, the variant's conditional slots, digests and coordinates)
 * and names the requested variant. A crossed population is an owner defect,
 * never a call. The transport and the owner still admit the call, its
 * resources, authority and currentness; this check admits nothing.
 */
function checkedInstalledCall<S extends InstalledPublicDefinitionCallSelection>(
  envelope: InstalledCallEnvelopeIdentity,
  key: Readonly<{ operationId: S["operationId"]; memberKey: S["memberKey"] }>,
  population: Readonly<{ request: JsonValue; slots: unknown; resources: unknown }>,
  variant: (request: Readonly<Record<string, unknown>>) => boolean,
): InstalledPublicDefinitionCall<S> {
  // The one typing step: bound to S here and released below only after the
  // member contract and variant checks.
  const selection = {
    operationId: key.operationId,
    memberKey: key.memberKey,
    request: population.request,
    slots: population.slots,
    resources: population.resources,
  } as unknown as S;
  const environment: InstalledPublicDefinitionCallEnvironment = {
    product: product,
    installedPublic: INSTALLED_PUBLIC,
    definitionContractCoordinates: envelope.definitionContractCoordinates,
    contractCatalog: verifiedContractCatalog(envelope.definitionContractCoordinates, key.operationId, key.memberKey),
    requestRef: envelope.requestRef,
    correlationRef: envelope.correlationRef,
    eventTime: envelope.eventTime,
    provenanceRefs: envelope.provenanceRefs,
  };
  const call = constructInstalledPublicDefinitionCall<S>({ ...environment, ...selection });
  const sources = OWNER_CONTRACT_SOURCES.filter(({ packet }) =>
    packet.definitionKey.operationId === key.operationId &&
    packet.definitionKey.memberKey === key.memberKey
  );
  const request: unknown = call.invocation.request;
  if (
    sources.length !== 1 ||
    admitExactDefinitionCall(call, sources[0]!.declaration) === null ||
    !isRecord(request) || !variant(request)
  ) {
    throw new TypeError(
      `${key.operationId}#${key.memberKey} population differs from its installed member contract or variant`,
    );
  }
  return call;
}

/** Optional run resources the caller supplies explicitly; none is defaulted. */
export interface InstalledRunCallResourceIntent {
  readonly runEnvironmentResources?:
    | product.RunEnvironmentResources
    | ((populated: Readonly<{
        authority: Readonly<{ authorityRef: string; authorityDigest: Sha256Digest; actorRef: string }>;
        program: product.LoadedProductExecutionResolution["program"];
        workspaceBinding: product.WorkspaceBinding;
      }>) => product.RunEnvironmentResources | Promise<product.RunEnvironmentResources>);
  readonly applicationResources?: readonly product.CatalogApplicationResources[];
  readonly historicalSource?: NonNullable<product.ProductRunInvocationResourceAssertion["historicalSource"]>;
  readonly qualificationResources?: NonNullable<product.ProductRunInvocationResourceAssertion["qualificationResources"]>;
}

async function runResources(
  intent: InstalledRunCallResourceIntent,
  populated: Parameters<Exclude<InstalledRunCallResourceIntent["runEnvironmentResources"], undefined | product.RunEnvironmentResources>>[0],
) {
  const environment = typeof intent.runEnvironmentResources === "function"
    ? await intent.runEnvironmentResources(populated)
    : intent.runEnvironmentResources;
  return Object.freeze({
    ...(environment === undefined ? {} : { runEnvironmentResources: environment }),
    ...(intent.applicationResources === undefined ? {} : { applicationResources: Object.freeze([...intent.applicationResources]) }),
    ...(intent.historicalSource === undefined ? {} : { historicalSource: intent.historicalSource }),
    ...(intent.qualificationResources === undefined ? {} : { qualificationResources: intent.qualificationResources }),
  });
}

/**
 * Construct one installed `run.invoke` call: a `start` (next, graph_function,
 * asset or declared_start) or a direct GraphFunction `invoke`. The Product
 * run owner populates the request and authority slots from the explicit
 * selection, input and source intent; this shell assembles the resource
 * assertion and the exact Public envelope. The installed binding still admits
 * everything; a population refusal is returned unchanged.
 */
export async function constructInstalledStartCall<
  S extends product.ProductRunInvocationSelectionIntent,
>(input: Omit<product.ProductRunInvocationPopulationInput<S>, "transportResourceAssertion"> &
  InstalledRunCallResourceIntent & Readonly<{
    eventResource: abg.AbgEventResourceInput;
    envelope: InstalledCallEnvelopeIdentity;
  }>): Promise<
  | Readonly<{
      kind: "installed_start_call";
      call: InstalledPublicDefinitionCall<InstalledStartCallSelection<S>>;
      population: product.PopulatedProductRunInvocation<S["memberKey"]>;
    }>
  | product.ProductRunInvocationPreparationRefusal<S["memberKey"]>
> {
  const population = await product.populateProductRunInvocation({
    ...input,
    transportResourceAssertion: input.eventResource as unknown as JsonValue,
  });
  if (population.kind !== "populated_product_run_invocation") return population;
  const resources = Object.freeze({
    kind: "run_invocation_resource_assertion" as const,
    schemaVersion: "5.0.0" as const,
    eventResource: input.eventResource,
    catalog: input.catalog,
    catalogView: input.catalogView,
    applications: Object.freeze([...input.applications]),
    source: population.sourceAssertion,
    ...await runResources(input, {
      authority: population.authority,
      program: population.resolution.program,
      workspaceBinding: input.workspaceBinding,
    }),
  });
  const selection: product.ProductRunInvocationSelectionIntent = input.selection;
  if (population.memberKey !== selection.memberKey) {
    throw new TypeError("run.invoke population differs from its selected member");
  }
  return Object.freeze({
    kind: "installed_start_call" as const,
    call: checkedInstalledCall<InstalledStartCallSelection<S>>(
      input.envelope,
      { operationId: "abg.operation.run.invoke", memberKey: population.memberKey },
      { request: population.request, slots: population.slots, resources },
      (request) => selection.memberKey === "invoke" ||
        isRecord(request.target) && request.target.kind === selection.target.kind,
    ),
    population,
  });
}

/**
 * Construct one installed `run.continue` call for the current-intent,
 * pending-execution or selected-action variant at the reopened event
 * resource's exact durable prefix. ABG and Product owners reconstruct the
 * continuation, resolution, policy, grant and attribution from the log; no
 * prior start object supplies authority.
 */
export async function constructInstalledPendingCall<
  S extends product.RunContinuationSelectionIntent,
>(input: InstalledRunCallResourceIntent & Readonly<{
  selection: S;
  catalog: product.ReadyGraphFunctionCatalog;
  catalogView: product.GraphFunctionCatalogView;
  applications: readonly product.DeclarationApplication[];
  eventResource: abg.ReopenedAbgEventResourceInput;
  envelope: InstalledCallEnvelopeIdentity;
}>): Promise<
  | Readonly<{
      kind: "installed_pending_call";
      call: InstalledPublicDefinitionCall<InstalledPendingCallSelection<S>>;
      population: product.PopulatedRunContinuation;
    }>
  | product.RunContinuationPopulationRefusal
> {
  const population = await product.populateRunContinuationAtDurablePrefix({
    selection: input.selection,
    prefix: abg.abgEventResourceInputPrefix(input.eventResource),
    catalog: input.catalog,
    catalogView: input.catalogView,
    applications: input.applications,
    transportResourceAssertion: input.eventResource as unknown as JsonValue,
  });
  if (population.kind !== "populated_run_continuation") return population;
  const resources = Object.freeze({
    kind: "run_invocation_resource_assertion" as const,
    schemaVersion: "5.0.0" as const,
    eventResource: input.eventResource,
    catalog: input.catalog,
    catalogView: input.catalogView,
    applications: Object.freeze([...input.applications]),
    source: Object.freeze({ kind: "none" as const }),
    ...await runResources(input, {
      authority: population.authority,
      program: population.resolution.program,
      workspaceBinding: population.workspaceBinding,
    }),
  });
  const selection: product.RunContinuationSelectionIntent = input.selection;
  const memberKey = selection.kind === "selected_action" ? "selected_action" : "current_intent";
  if (population.memberKey !== memberKey) {
    throw new TypeError("run.continue population differs from its selected member");
  }
  return Object.freeze({
    kind: "installed_pending_call" as const,
    call: checkedInstalledCall<InstalledPendingCallSelection<S>>(
      input.envelope,
      { operationId: "abg.operation.run.continue", memberKey },
      { request: population.request, slots: population.slots, resources },
      (request) => selection.kind === "selected_action" ||
        Object.hasOwn(request, selection.kind === "pending_execution" ? "pendingCursor" : "currentIntent"),
    ),
    population,
  });
}

/**
 * Construct one installed run read (`run_status`, `run_result`,
 * `run_replay`, `run_gaps`, `graph_call_result` or `graph_call_replay`) at
 * the reopened or held event resource's exact durable prefix. ABG populates the
 * source coordinate and the same authority the read kernel admits.
 */
export function constructInstalledRunReadCall<K extends abg.AbgRunReadMemberKey>(input: Readonly<{
  memberKey: K;
  workspaceBinding: Readonly<{ ref: string; digest: Sha256Digest }>;
  sourceRef: string;
  selector: JsonValue;
  eventResource: abg.ReopenedAbgEventResourceInput;
  declarationProof?: abg.AbgHistoricalDeclarationProof;
  envelope: InstalledCallEnvelopeIdentity;
}>):
  | Readonly<{
      kind: "installed_run_read_call";
      call: InstalledPublicDefinitionCall<InstalledRunReadCallSelection<K>>;
      population: Extract<ReturnType<typeof abg.populateRunReadAtDurablePrefix<K>>, { readonly kind: "populated_run_read" }>;
    }>
  | Extract<ReturnType<typeof abg.populateRunReadAtDurablePrefix<K>>, { readonly kind: "run_read_population_refusal" }> {
  const population = abg.populateRunReadAtDurablePrefix({
    memberKey: input.memberKey,
    prefix: abg.abgEventResourceInputPrefix(input.eventResource),
    workspaceBinding: input.workspaceBinding,
    sourceRef: input.sourceRef,
    selector: input.selector,
  });
  if (population.kind !== "populated_run_read") return population;
  const resources = Object.freeze({
    kind: "abg_project_read_resource_assertion" as const,
    schemaVersion: "5.0.0" as const,
    eventResource: input.eventResource,
    ...(input.declarationProof === undefined ? {} : { declarationProof: input.declarationProof }),
  });
  return Object.freeze({
    kind: "installed_run_read_call" as const,
    call: checkedInstalledCall<InstalledRunReadCallSelection<K>>(
      input.envelope,
      { operationId: population.packet.definitionKey.operationId, memberKey: population.memberKey },
      { request: population.request, slots: population.slots, resources },
      () => true,
    ),
    population,
  });
}
