import { createHash } from "node:crypto";

type JsonValue =
  | boolean
  | null
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

interface ArtifactBasis {
  readonly productId: string;
  readonly artifactDigest: `sha256:${string}`;
  readonly productContentDigest: `sha256:${string}`;
  readonly productManifestDigest: `sha256:${string}`;
  readonly packageName: string;
  readonly packageVersion: string;
}

const PACKAGE_NAME = "@abiogenesis-fixtures/developer-mini-product";
const PACKAGE_VERSION = "5.0.0";

export const DEVELOPER_MINI_IDS = Object.freeze({
  moduleRef: "module://developer.example/greeting@5",
  programRef: "program://developer.example/greeting@5",
  startRef: "start://developer.example/greeting@5",
  graphFunctionRef: "graph-function://developer.example/greeting/render@5",
  graphRef: "graph://developer.example/greeting/render@5",
  nodeRef: "node://developer.example/greeting/render@5",
  ticketProgramRef: "program://developer.example/ticket/work@5",
  ticketStartRef: "start://developer.example/ticket/work@5",
  ticketGraphFunctionRef: "graph-function://developer.example/ticket/work@5",
  ticketGraphRef: "graph://developer.example/ticket/work@5",
  ticketNodeRef: "node://developer.example/ticket/work@5",
  ticketInputContractRef: "contract://developer.example/ticket/work-input@5",
  ticketOutputContractRef: "contract://developer.example/ticket/work-output@5",
  ticketClosureContractRef: "contract://developer.example/ticket/closure@5",
  ticketJudgmentPredicateRef:
    "predicate://developer.example/ticket/work-completed@5",
  ticketImplementationBindingRef:
    "implementation-binding://developer.example/ticket/work-fd@5",
  ticketImplementationRef:
    "implementation://developer.example/ticket/work-fd@5",
  spanProgramRef: "program://developer.example/greeting/span-reentry@5",
  spanStartRef: "start://developer.example/greeting/span-reentry@5",
  spanGraphFunctionRef:
    "graph-function://developer.example/greeting/span-reentry@5",
  spanGraphRef: "graph://developer.example/greeting/span-reentry@5",
  spanNodeRef: "node://developer.example/greeting/span-reentry@5",
  spanInitializeLocusRef:
    "locus://developer.example/greeting/span-reentry/initialize@5",
  spanTargetLocusRef:
    "locus://developer.example/greeting/span-reentry/target@5",
  spanSelectorLocusRef:
    "locus://developer.example/greeting/span-reentry/select@5",
  spanFinalizeLocusRef:
    "locus://developer.example/greeting/span-reentry/finalize@5",
  spanStateContractRef:
    "contract://developer.example/greeting/span-state@5",
  spanSelectionContractRef:
    "contract://developer.example/greeting/span-selection@5",
  spanJudgmentPredicateRef:
    "predicate://developer.example/greeting/span-valid@5",
  spanInitializeImplementationBindingRef:
    "implementation-binding://developer.example/greeting/span-initialize@5",
  spanInitializeImplementationRef:
    "implementation://developer.example/greeting/span-initialize@5",
  spanTargetImplementationBindingRef:
    "implementation-binding://developer.example/greeting/span-target@5",
  spanTargetImplementationRef:
    "implementation://developer.example/greeting/span-target@5",
  spanSelectorImplementationBindingRef:
    "implementation-binding://developer.example/greeting/span-select@5",
  spanSelectorImplementationRef:
    "implementation://developer.example/greeting/span-select@5",
  spanSelectorRepeatImplementationRef:
    "implementation://developer.example/greeting/span-select-repeat@5",
  spanFinalizeImplementationBindingRef:
    "implementation-binding://developer.example/greeting/span-finalize@5",
  spanFinalizeImplementationRef:
    "implementation://developer.example/greeting/span-finalize@5",
  inputContractRef: "contract://developer.example/greeting/input@5",
  outputContractRef: "contract://developer.example/greeting/output@5",
  evidenceContractRef: "contract://developer.example/greeting/evidence@5",
  failureContractRef: "contract://developer.example/greeting/failure@5",
  refusalContractRef: "contract://developer.example/greeting/refusal@5",
  judgmentContractRef: "contract://developer.example/greeting/judgment@5",
  transitionContractRef: "contract://developer.example/greeting/transition@5",
  closureContractRef: "contract://developer.example/greeting/closure@5",
  judgmentPredicateRef: "predicate://developer.example/greeting/satisfied@5",
  implementationBindingRef:
    "implementation-binding://developer.example/greeting/render-fd@5",
  implementationRef: "implementation://developer.example/greeting/render-fd@5",
  identityProgramRef:
    "program://developer.example/greeting/identity-then-render@5",
  identityGraphFunctionRef:
    "graph-function://developer.example/greeting/identity-then-render@5",
  identityGraphRef:
    "graph://developer.example/greeting/identity-then-render@5",
  identityNodeRef:
    "node://developer.example/greeting/identity-then-render/identity@5",
  identityResultNodeRef:
    "node://developer.example/greeting/identity-then-render/result@5",
  mixedProgramRef: "program://developer.example/greeting/mixed-fibres@5",
  mixedGraphFunctionRef:
    "graph-function://developer.example/greeting/mixed-fibres@5",
  mixedGraphRef: "graph://developer.example/greeting/mixed-fibres@5",
  mixedNodeRef: "node://developer.example/greeting/mixed-fibres@5",
  mixedCompositionRef:
    "composition://developer.example/greeting/fd-fp-fh@5",
  probabilisticRawResultContractRef:
    "contract://developer.example/greeting/probabilistic-raw-result@5",
  deterministicLocusRef:
    "locus://developer.example/greeting/mixed-fibres/fd@5",
  probabilisticLocusRef:
    "locus://developer.example/greeting/mixed-fibres/fp@5",
  interactionLocusRef:
    "locus://developer.example/greeting/mixed-fibres/fh@5",
  probabilisticEvidenceContractRef:
    "contract://developer.example/greeting/probabilistic-evidence@5",
  continuationContractRef:
    "contract://developer.example/greeting/continuation@5",
  mixedClosureContractRef:
    "contract://developer.example/greeting/mixed-closure@5",
  greetingAssetRef:
    "asset://developer.example/greeting/welcome-message@5",
  greetingAssetHandle: "greeting",
  preservePredicateRef:
    "predicate://developer.example/greeting/preserved@5",
  probabilisticImplementationBindingRef:
    "implementation-binding://developer.example/greeting/pass-fp@5",
  probabilisticImplementationRef:
    "implementation://developer.example/greeting/pass-fp@5",
  deterministicPassImplementationBindingRef:
    "implementation-binding://developer.example/greeting/pass-fd@5",
  deterministicPassImplementationRef:
    "implementation://developer.example/greeting/pass-fd@5",
  interactionKind: "developer_greeting_approval",
  actorCapabilityRef:
    "capability://developer.example/greeting/approve@5",
  workerActorRef: "actor://developer.example/greeting/worker@5",
  workerBindingRef: "worker-binding://developer.example/greeting/pass@5",
  materializationPlanRef:
    "prompt-plan://developer.example/greeting/pass@5",
  rendererRef: "renderer://developer.example/greeting/pass@5",
  semanticsBindingRef: "product-semantics://developer.example/greeting@5",
});

function canonicalJson(value: JsonValue): string {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  return `{${Object.entries(value)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`)
    .join(",")}}`;
}

function sha256Canonical(value: JsonValue): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function isGreetingInput(value: unknown): value is Readonly<{
  kind: "developer_greeting_input";
  schemaVersion: "5.0.0";
  name: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "name", "schemaVersion"]) &&
    value.kind === "developer_greeting_input" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.name === "string" &&
    value.name.trim().length > 0;
}

function isGreetingOutput(value: unknown): value is Readonly<{
  kind: "developer_greeting_output";
  schemaVersion: "5.0.0";
  message: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, ["kind", "message", "schemaVersion"]) &&
    value.kind === "developer_greeting_output" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.message === "string" &&
    value.message.length > 0;
}

function isTicketWorkInput(value: unknown): value is Readonly<{
  kind: "developer_ticket_work_input";
  schemaVersion: "5.0.0";
  ticketRef: string;
  requestedOutcome: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "requestedOutcome",
      "schemaVersion",
      "ticketRef",
    ]) &&
    value.kind === "developer_ticket_work_input" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.ticketRef === "string" &&
    value.ticketRef.length > 0 &&
    typeof value.requestedOutcome === "string" &&
    value.requestedOutcome.length > 0;
}

function isTicketWorkOutput(value: unknown): value is Readonly<{
  kind: "developer_ticket_work_output";
  schemaVersion: "5.0.0";
  ticketRef: string;
  disposition: "completed";
  summary: string;
}> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "disposition",
      "kind",
      "schemaVersion",
      "summary",
      "ticketRef",
    ]) &&
    value.kind === "developer_ticket_work_output" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.ticketRef === "string" &&
    value.ticketRef.length > 0 &&
    value.disposition === "completed" &&
    typeof value.summary === "string" &&
    value.summary.length > 0;
}

interface DeveloperSpanState {
  readonly kind: "developer_span_state";
  readonly schemaVersion: "5.0.0";
  readonly name: string;
  readonly targetVisits: number;
  readonly reentryApplications: number;
}

interface DeveloperSpanContinuation {
  readonly kind: "graph_span_selection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "continue";
  readonly state: DeveloperSpanState;
}

interface DeveloperGraphSpanReentryProjection {
  readonly kind: "graph_span_selection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "re_enter";
  readonly projectionRef: string;
  readonly projectionDigest: `sha256:${string}`;
  readonly applicationRef: string;
  readonly graphFunctionRef: string;
  readonly sourceProgramLocusRef: string;
  readonly targetProgramLocusRef: string;
  readonly targetInputRef: string;
  readonly targetInputDigest: `sha256:${string}`;
  readonly targetInput: DeveloperSpanState;
}

function isSpanState(value: unknown): value is Readonly<DeveloperSpanState> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "kind",
      "name",
      "reentryApplications",
      "schemaVersion",
      "targetVisits",
    ]) &&
    value.kind === "developer_span_state" &&
    value.schemaVersion === "5.0.0" &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    Number.isSafeInteger(value.targetVisits) &&
    Number(value.targetVisits) >= 0 &&
    Number.isSafeInteger(value.reentryApplications) &&
    Number(value.reentryApplications) >= 0;
}

function isGraphSpanReentryProjection(
  value: unknown,
): value is Readonly<DeveloperGraphSpanReentryProjection> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, [
      "applicationRef",
      "disposition",
      "graphFunctionRef",
      "kind",
      "projectionDigest",
      "projectionRef",
      "schemaVersion",
      "sourceProgramLocusRef",
      "targetInput",
      "targetInputDigest",
      "targetInputRef",
      "targetProgramLocusRef",
    ]) ||
    value.kind !== "graph_span_selection" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "re_enter" ||
    typeof value.projectionRef !== "string" ||
    typeof value.projectionDigest !== "string" ||
    typeof value.applicationRef !== "string" ||
    typeof value.graphFunctionRef !== "string" ||
    typeof value.sourceProgramLocusRef !== "string" ||
    typeof value.targetProgramLocusRef !== "string" ||
    typeof value.targetInputRef !== "string" ||
    typeof value.targetInputDigest !== "string" ||
    !isSpanState(value.targetInput)
  ) {
    return false;
  }
  const {
    projectionRef,
    projectionDigest,
    ...body
  } = value;
  const targetInputDigest = sha256Canonical(value.targetInput);
  return projectionDigest === sha256Canonical(body as JsonValue) &&
    projectionRef ===
      `graph-span-reentry-projection://product/${projectionDigest.slice("sha256:".length)}` &&
    value.targetInputDigest === targetInputDigest &&
    value.targetInputRef ===
      `graph-span-input://product/${targetInputDigest.slice("sha256:".length)}`;
}

function isSpanContinuation(
  value: unknown,
): value is Readonly<DeveloperSpanContinuation> {
  return isRecord(value) &&
    hasExactKeys(value, [
      "disposition",
      "kind",
      "schemaVersion",
      "state",
    ]) &&
    value.kind === "graph_span_selection" &&
    value.schemaVersion === "5.0.0" &&
    value.disposition === "continue" &&
    isSpanState(value.state);
}

function isSpanSelection(value: unknown): boolean {
  return isGraphSpanReentryProjection(value) || isSpanContinuation(value);
}

const descriptorBody = {
  implementationRef: DEVELOPER_MINI_IDS.implementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeDeveloperGreeting",
  computeRegime: "F_D",
  inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
} as const;

export const DEVELOPER_GREETING_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(descriptorBody),
  ...descriptorBody,
});

const ticketDescriptorBody = {
  implementationRef: DEVELOPER_MINI_IDS.ticketImplementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeDeveloperTicketWork",
  computeRegime: "F_D",
  inputContractRef: DEVELOPER_MINI_IDS.ticketInputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
} as const;

export const DEVELOPER_TICKET_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(ticketDescriptorBody),
  ...ticketDescriptorBody,
});

const probabilisticDescriptorBody = {
  implementationRef: DEVELOPER_MINI_IDS.probabilisticImplementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeDeveloperProbabilisticPass",
  computeRegime: "F_P",
  inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
} as const;

export const DEVELOPER_PROBABILISTIC_PASS_IMPLEMENTATION_DESCRIPTOR =
  deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(probabilisticDescriptorBody),
    ...probabilisticDescriptorBody,
  });

const deterministicPassDescriptorBody = {
  implementationRef: DEVELOPER_MINI_IDS.deterministicPassImplementationRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  modulePath: "build/index.js",
  namedSymbol: "realizeDeveloperDeterministicPass",
  computeRegime: "F_D",
  inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
  failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
  refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
} as const;

export const DEVELOPER_DETERMINISTIC_PASS_IMPLEMENTATION_DESCRIPTOR =
  deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(deterministicPassDescriptorBody),
    ...deterministicPassDescriptorBody,
  });

function deterministicStageDescriptor(
  implementationRef: string,
  namedSymbol: string,
  inputContractRef: string,
  outputContractRef: string,
): Readonly<object> {
  const body = {
    implementationRef,
    packageName: PACKAGE_NAME,
    packageVersion: PACKAGE_VERSION,
    modulePath: "build/index.js",
    namedSymbol,
    computeRegime: "F_D",
    inputContractRef,
    outputContractRef,
    failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
    refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
  };
  return deepFreeze({
    kind: "packaged_leaf_implementation_descriptor" as const,
    schemaVersion: "5.0.0" as const,
    descriptorDigest: sha256Canonical(body),
    ...body,
  });
}

const DEVELOPER_SPAN_REENTRY_APPLICATION_BODY = deepFreeze({
  kind: "graph_function_application" as const,
  relationKind: "re_enter" as const,
  inputContractRef: DEVELOPER_MINI_IDS.spanSelectionContractRef,
  outputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
  graphFunctionRef: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
  sourceProgramLocusRef: DEVELOPER_MINI_IDS.spanSelectorLocusRef,
  targetProgramLocusRef: DEVELOPER_MINI_IDS.spanTargetLocusRef,
  maxApplications: 1,
});
const DEVELOPER_SPAN_REENTRY_APPLICATION = deepFreeze({
  applicationRef:
    `graph-function-application://abiogenesis/${
      sha256Canonical(
        DEVELOPER_SPAN_REENTRY_APPLICATION_BODY,
      ).slice("sha256:".length)
    }`,
  ...DEVELOPER_SPAN_REENTRY_APPLICATION_BODY,
});

export const DEVELOPER_SPAN_INITIALIZE_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanInitializeImplementationRef,
    "realizeDeveloperSpanInitialize",
    DEVELOPER_MINI_IDS.inputContractRef,
    DEVELOPER_MINI_IDS.spanStateContractRef,
  );

export const DEVELOPER_SPAN_TARGET_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanTargetImplementationRef,
    "realizeDeveloperSpanTarget",
    DEVELOPER_MINI_IDS.spanStateContractRef,
    DEVELOPER_MINI_IDS.spanStateContractRef,
  );

export const DEVELOPER_SPAN_SELECTOR_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanSelectorImplementationRef,
    "realizeDeveloperSpanSelector",
    DEVELOPER_MINI_IDS.spanStateContractRef,
    DEVELOPER_MINI_IDS.spanSelectionContractRef,
  );

export const DEVELOPER_SPAN_SELECTOR_REPEAT_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanSelectorRepeatImplementationRef,
    "realizeDeveloperSpanSelectorRepeat",
    DEVELOPER_MINI_IDS.spanStateContractRef,
    DEVELOPER_MINI_IDS.spanSelectionContractRef,
  );

export const DEVELOPER_SPAN_FINALIZE_IMPLEMENTATION_DESCRIPTOR =
  deterministicStageDescriptor(
    DEVELOPER_MINI_IDS.spanFinalizeImplementationRef,
    "realizeDeveloperSpanFinalize",
    DEVELOPER_MINI_IDS.spanSelectionContractRef,
    DEVELOPER_MINI_IDS.outputContractRef,
  );

export function realizeDeveloperGreeting(input: unknown): Readonly<object> {
  if (!isGreetingInput(input)) {
    throw new TypeError("developer greeting requires its exact input contract");
  }
  const resultCandidate = deepFreeze({
    kind: "developer_greeting_output" as const,
    schemaVersion: "5.0.0" as const,
    message: `Welcome ${input.name}.`,
  });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: DEVELOPER_MINI_IDS.implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

export function realizeDeveloperTicketWork(
  input: unknown,
): Readonly<object> {
  if (!isTicketWorkInput(input)) {
    throw new TypeError("developer ticket work requires its exact input contract");
  }
  const resultCandidate = deepFreeze({
    kind: "developer_ticket_work_output" as const,
    schemaVersion: "5.0.0" as const,
    ticketRef: input.ticketRef,
    disposition: "completed" as const,
    summary: `Completed: ${input.requestedOutcome}`,
  });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: DEVELOPER_MINI_IDS.ticketImplementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

interface LeafExecutionOccurrence {
  readonly cCallRef: string;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly programLocusRef: string;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
}

interface ActorProcessCarrierValidation {
  readonly kind: "actor_process_carrier_validation";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "valid";
  readonly request: Readonly<Record<string, JsonValue>>;
  readonly observation: Readonly<{
    readonly disposition: "failure" | "success";
    readonly failureClass: string | null;
    readonly finalOutput: string;
  }>;
}

function parseGreetingCandidate(value: string): Readonly<Record<string, JsonValue>> {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (isGreetingOutput(parsed)) return deepFreeze({ ...parsed });
  } catch {
    // The transport artifacts preserve malformed output for ABG admission.
  }
  return deepFreeze({
    kind: "developer_greeting_failure",
    schemaVersion: "5.0.0",
    diagnosticRef: "diagnostic://developer.example/greeting/malformed-worker-output@5",
  });
}

export function constructDeveloperProbabilisticPassRequest(
  input: unknown,
): Readonly<Record<string, JsonValue>> {
  if (!isGreetingOutput(input)) {
    throw new TypeError(
      "developer probabilistic pass requires its exact greeting output input",
    );
  }
  return deepFreeze({
    actorRef: DEVELOPER_MINI_IDS.workerActorRef,
    workerBindingRef: DEVELOPER_MINI_IDS.workerBindingRef,
    implementationRef: DEVELOPER_MINI_IDS.probabilisticImplementationRef,
    inputDigest: sha256Canonical(input),
    materializationPlanRef: DEVELOPER_MINI_IDS.materializationPlanRef,
    rendererRef: DEVELOPER_MINI_IDS.rendererRef,
    instructionContractRef: DEVELOPER_MINI_IDS.outputContractRef,
    resultContractRef:
      DEVELOPER_MINI_IDS.probabilisticRawResultContractRef,
    transportLane: "closed_prompt_proof",
    prompt: [
      "Return the declared developer greeting output unchanged.",
      JSON.stringify(input),
    ].join("\n"),
    responseJsonSchema: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "schemaVersion", "message"],
      properties: {
        kind: { const: "developer_greeting_output" },
        schemaVersion: { const: "5.0.0" },
        message: { const: input.message },
      },
    },
  });
}

export function realizeDeveloperProbabilisticPass(
  input: unknown,
  _occurrence: Readonly<LeafExecutionOccurrence>,
): Readonly<object> {
  const workerRequest = constructDeveloperProbabilisticPassRequest(input);
  const admittedInput = input as Readonly<{
    kind: "developer_greeting_output";
    schemaVersion: "5.0.0";
    message: string;
  }>;
  return deepFreeze({
    kind: "prepared_probabilistic_leaf_invocation" as const,
    schemaVersion: "5.0.0" as const,
    workerRequest,
    complete(actorProcessExchange: Readonly<ActorProcessCarrierValidation>) {
      const transport = actorProcessExchange.observation;
      const resultCandidate = parseGreetingCandidate(transport.finalOutput);
      const success =
        transport.disposition === "success" &&
        isGreetingOutput(resultCandidate) &&
        resultCandidate.message === admittedInput.message;
      return deepFreeze({
        kind: "leaf_realization_candidate" as const,
        schemaVersion: "5.0.0" as const,
        disposition: success ? "success" as const : "failure" as const,
        evidenceCandidates: [] as const,
        resultCandidate: success
          ? resultCandidate
          : {
              kind: "developer_greeting_failure",
              schemaVersion: "5.0.0",
              diagnosticRef:
                transport.failureClass === null
                  ? "diagnostic://developer.example/greeting/worker-output-refused@5"
                  : `diagnostic://developer.example/greeting/${transport.failureClass}@5`,
            },
      });
    },
  });
}

export function realizeDeveloperDeterministicPass(
  input: unknown,
): Readonly<object> {
  if (!isGreetingOutput(input)) {
    throw new TypeError(
      "developer deterministic pass requires its exact greeting output input",
    );
  }
  const resultCandidate = deepFreeze({ ...input });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef:
        DEVELOPER_MINI_IDS.deterministicPassImplementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

function deterministicStageCandidate(
  input: JsonValue,
  resultCandidate: Readonly<Record<string, JsonValue>>,
  implementationRef: string,
): Readonly<object> {
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }],
    resultCandidate,
  });
}

export function realizeDeveloperSpanInitialize(
  input: unknown,
): Readonly<object> {
  if (!isGreetingInput(input)) {
    throw new TypeError("span initialization requires the exact greeting input");
  }
  return deterministicStageCandidate(
    input,
    deepFreeze({
      kind: "developer_span_state",
      schemaVersion: "5.0.0",
      name: input.name,
      targetVisits: 0,
      reentryApplications: 0,
    }),
    DEVELOPER_MINI_IDS.spanInitializeImplementationRef,
  );
}

export function realizeDeveloperSpanTarget(
  input: unknown,
): Readonly<object> {
  if (
    !isSpanState(input) ||
    !(
      (
        input.reentryApplications === 0 &&
        input.targetVisits === 0
      ) ||
      (
        input.reentryApplications === 1 &&
        input.targetVisits === 1
      )
    )
  ) {
    throw new TypeError("span target requires the exact bounded state");
  }
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...input,
      targetVisits: input.targetVisits + 1,
    }),
    DEVELOPER_MINI_IDS.spanTargetImplementationRef,
  );
}

function spanReentryCandidate(
  input: Readonly<DeveloperSpanState>,
  implementationRef: string,
): Readonly<object> {
  const targetInput = deepFreeze({
    ...input,
    reentryApplications: input.reentryApplications + 1,
  });
  const targetInputDigest = sha256Canonical(targetInput);
  const body = deepFreeze({
    kind: "graph_span_selection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "re_enter" as const,
    applicationRef: DEVELOPER_SPAN_REENTRY_APPLICATION.applicationRef,
    graphFunctionRef: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    sourceProgramLocusRef: DEVELOPER_MINI_IDS.spanSelectorLocusRef,
    targetProgramLocusRef: DEVELOPER_MINI_IDS.spanTargetLocusRef,
    targetInputRef:
      `graph-span-input://product/${targetInputDigest.slice("sha256:".length)}`,
    targetInputDigest,
    targetInput,
  });
  const projectionDigest = sha256Canonical(body);
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      ...body,
      projectionRef:
        `graph-span-reentry-projection://product/${projectionDigest.slice("sha256:".length)}`,
      projectionDigest,
    }),
    implementationRef,
  );
}

export function realizeDeveloperSpanSelector(
  input: unknown,
): Readonly<object> {
  if (!isSpanState(input)) {
    throw new TypeError("span selector requires the exact admitted state");
  }
  if (input.reentryApplications === 0 && input.targetVisits === 1) {
    return spanReentryCandidate(
      input,
      DEVELOPER_MINI_IDS.spanSelectorImplementationRef,
    );
  }
  if (input.reentryApplications === 1 && input.targetVisits === 2) {
    return deterministicStageCandidate(
      input as unknown as JsonValue,
      deepFreeze({
        kind: "graph_span_selection",
        schemaVersion: "5.0.0",
        disposition: "continue",
        state: input,
      }),
      DEVELOPER_MINI_IDS.spanSelectorImplementationRef,
    );
  }
  throw new TypeError("span selector refuses an undeclared re-entry state");
}

export function realizeDeveloperSpanSelectorRepeat(
  input: unknown,
): Readonly<object> {
  if (
    !isSpanState(input) ||
    !(
      (
        input.reentryApplications === 0 &&
        input.targetVisits === 1
      ) ||
      (
        input.reentryApplications === 1 &&
        input.targetVisits === 2
      )
    )
  ) {
    throw new TypeError(
      "span repeat selector requires an exact selectable state",
    );
  }
  return spanReentryCandidate(
    input,
    DEVELOPER_MINI_IDS.spanSelectorRepeatImplementationRef,
  );
}

export function realizeDeveloperSpanFinalize(
  input: unknown,
): Readonly<object> {
  if (
    !isSpanContinuation(input) ||
    input.state.reentryApplications !== 1 ||
    input.state.targetVisits !== 2
  ) {
    throw new TypeError(
      "span finalization requires one exact completed re-entry",
    );
  }
  return deterministicStageCandidate(
    input as unknown as JsonValue,
    deepFreeze({
      kind: "developer_greeting_output",
      schemaVersion: "5.0.0",
      message: `Welcome ${input.state.name}.`,
    }),
    DEVELOPER_MINI_IDS.spanFinalizeImplementationRef,
  );
}

export const DEVELOPER_MINI_PRODUCT_SEMANTICS = Object.freeze({
  kind: "product_semantics_provider" as const,
  schemaVersion: "5.0.0" as const,
  bindingRef: DEVELOPER_MINI_IDS.semanticsBindingRef,
  packageName: PACKAGE_NAME,
  packageVersion: PACKAGE_VERSION,
  admitInput(contractRef: string, value: unknown) {
    if (
      contractRef === DEVELOPER_MINI_IDS.inputContractRef &&
      isGreetingInput(value)
    ) {
      return deepFreeze({
        kind: value.kind,
        schemaVersion: value.schemaVersion,
        name: value.name.trim(),
      });
    }
    if (
      contractRef === DEVELOPER_MINI_IDS.outputContractRef &&
      isGreetingOutput(value)
    ) {
      return deepFreeze({ ...value });
    }
    if (
      contractRef === DEVELOPER_MINI_IDS.ticketInputContractRef &&
      isTicketWorkInput(value)
    ) {
      return deepFreeze({ ...value });
    }
    if (
      contractRef === DEVELOPER_MINI_IDS.ticketOutputContractRef &&
      isTicketWorkOutput(value)
    ) {
      return deepFreeze({ ...value });
    }
    return null;
  },
  validateContractValue(valueKind: string, value: unknown) {
    switch (valueKind) {
      case "developer_greeting_output":
      case "developer_greeting_raw_result":
        return isGreetingOutput(value);
      case "developer_ticket_work_output":
        return isTicketWorkOutput(value);
      case "developer_span_state":
        return isSpanState(value);
      case "graph_span_selection":
        return isSpanSelection(value);
      default:
        return false;
    }
  },
  resolveProbabilisticWorkerContracts(basis: Readonly<{
    inputContractRef: string;
    outputContractRef: string;
    input: Readonly<Record<string, JsonValue>>;
  }>) {
    if (
      basis.inputContractRef === DEVELOPER_MINI_IDS.outputContractRef &&
      basis.outputContractRef === DEVELOPER_MINI_IDS.outputContractRef &&
      isGreetingOutput(basis.input)
    ) {
      return Object.freeze({
        instructionContractRef: DEVELOPER_MINI_IDS.outputContractRef,
        resultContractRef:
          DEVELOPER_MINI_IDS.probabilisticRawResultContractRef,
      });
    }
    return Object.freeze({
      instructionContractRef: basis.inputContractRef,
      resultContractRef: basis.outputContractRef,
    });
  },
  resolveJudgmentRelation(predicateRef: string) {
    if (predicateRef === DEVELOPER_MINI_IDS.spanJudgmentPredicateRef) {
      return Object.freeze({
        predicateRef,
        advanceReasonRef:
          "reason://developer.example/greeting/span-valid@5",
        rejectionReasonRef:
          "reason://developer.example/greeting/span-invalid@5",
        evaluate: (input: unknown, output: unknown) => {
          if (isGreetingInput(input) && isSpanState(output)) {
            return output.name === input.name &&
              output.targetVisits === 0 &&
              output.reentryApplications === 0;
          }
          if (isSpanState(input) && isSpanState(output)) {
            return output.name === input.name &&
              output.targetVisits === input.targetVisits + 1 &&
              output.reentryApplications === input.reentryApplications;
          }
          if (
            isSpanState(input) &&
            isGraphSpanReentryProjection(output)
          ) {
            return output.applicationRef ===
                DEVELOPER_SPAN_REENTRY_APPLICATION.applicationRef &&
              output.graphFunctionRef ===
                DEVELOPER_MINI_IDS.spanGraphFunctionRef &&
              output.sourceProgramLocusRef ===
                DEVELOPER_MINI_IDS.spanSelectorLocusRef &&
              output.targetProgramLocusRef ===
                DEVELOPER_MINI_IDS.spanTargetLocusRef &&
              output.targetInput.name === input.name &&
              output.targetInput.targetVisits === input.targetVisits &&
              output.targetInput.reentryApplications ===
                input.reentryApplications + 1;
          }
          if (isSpanState(input) && isSpanContinuation(output)) {
            return output.state.name === input.name &&
              output.state.targetVisits === input.targetVisits &&
              output.state.reentryApplications ===
                input.reentryApplications;
          }
          return isSpanContinuation(input) &&
            isGreetingOutput(output) &&
            output.message === `Welcome ${input.state.name}.`;
        },
      });
    }
    if (predicateRef === DEVELOPER_MINI_IDS.ticketJudgmentPredicateRef) {
      return Object.freeze({
        predicateRef,
        advanceReasonRef:
          "reason://developer.example/ticket/work-completed@5",
        rejectionReasonRef:
          "reason://developer.example/ticket/work-incomplete@5",
        evaluate: (input: unknown, output: unknown) =>
          isTicketWorkInput(input) &&
          isTicketWorkOutput(output) &&
          output.ticketRef === input.ticketRef &&
          output.summary === `Completed: ${input.requestedOutcome}`,
      });
    }
    if (predicateRef === DEVELOPER_MINI_IDS.preservePredicateRef) {
      return Object.freeze({
        predicateRef,
        advanceReasonRef:
          "reason://developer.example/greeting/preserved@5",
        rejectionReasonRef:
          "reason://developer.example/greeting/not-preserved@5",
        evaluate: (input: unknown, output: unknown) =>
          isGreetingOutput(input) &&
          isGreetingOutput(output) &&
          output.message === input.message,
      });
    }
    if (predicateRef !== DEVELOPER_MINI_IDS.judgmentPredicateRef) return null;
    return Object.freeze({
      predicateRef,
      advanceReasonRef: "reason://developer.example/greeting/satisfied@5",
      rejectionReasonRef: "reason://developer.example/greeting/rejected@5",
      evaluate: (input: unknown, output: unknown) =>
        isGreetingInput(input) &&
        isGreetingOutput(output) &&
        output.message === `Welcome ${input.name}.`,
    });
  },
});

export function constructDeveloperMiniPublication(
  artifact: ArtifactBasis,
): Readonly<Record<string, JsonValue>> {
  if (
    artifact.packageName !== PACKAGE_NAME ||
    artifact.packageVersion !== PACKAGE_VERSION
  ) {
    throw new TypeError("developer mini publication requires its own exact package basis");
  }
  const contracts = [
    ["input", DEVELOPER_MINI_IDS.inputContractRef, "developer_greeting_input"],
    ["output", DEVELOPER_MINI_IDS.outputContractRef, "developer_greeting_output"],
    [
      "output",
      DEVELOPER_MINI_IDS.probabilisticRawResultContractRef,
      "developer_greeting_raw_result",
    ],
    [
      "input",
      DEVELOPER_MINI_IDS.ticketInputContractRef,
      "developer_ticket_work_input",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.ticketOutputContractRef,
      "developer_ticket_work_output",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.spanStateContractRef,
      "developer_span_state",
    ],
    [
      "output",
      DEVELOPER_MINI_IDS.spanSelectionContractRef,
      "graph_span_selection",
    ],
    ["evidence", DEVELOPER_MINI_IDS.evidenceContractRef, "deterministic_evidence_candidate"],
    ["failure", DEVELOPER_MINI_IDS.failureContractRef, "developer_greeting_failure"],
    ["refusal", DEVELOPER_MINI_IDS.refusalContractRef, "developer_greeting_refusal"],
    ["judgment", DEVELOPER_MINI_IDS.judgmentContractRef, "developer_greeting_judgment"],
    ["transition", DEVELOPER_MINI_IDS.transitionContractRef, "developer_greeting_transition"],
    ["closure", DEVELOPER_MINI_IDS.closureContractRef, "developer_greeting_closure"],
    [
      "evidence",
      DEVELOPER_MINI_IDS.probabilisticEvidenceContractRef,
      "probabilistic_transport_evidence_candidate",
    ],
    [
      "judgment",
      DEVELOPER_MINI_IDS.continuationContractRef,
      "fh_pending_result",
    ],
    [
      "closure",
      DEVELOPER_MINI_IDS.mixedClosureContractRef,
      "developer_mixed_greeting_closure",
    ],
    [
      "closure",
      DEVELOPER_MINI_IDS.ticketClosureContractRef,
      "developer_ticket_work_closure",
    ],
  ].map(([contractKind, contractRef, valueKind]) => ({
    contractRef: contractRef!,
    contractVersion: "5.0.0",
    contractKind: contractKind!,
    valueKind: valueKind!,
  }));
  const graphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.graphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.graphRef,
      startNodeRef: DEVELOPER_MINI_IDS.nodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.nodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.nodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_of",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          programLocusRef: DEVELOPER_MINI_IDS.nodeRef,
          stageRole: "result",
          fibre: "F_D",
          armId: "arm://developer.example/greeting/render-fd@5",
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef: DEVELOPER_MINI_IDS.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              DEVELOPER_MINI_IDS.implementationBindingRef,
            inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
            outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
            evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
            failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
            refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
            judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
          },
        },
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://developer.example/greeting/render@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": DEVELOPER_MINI_IDS.closureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate": DEVELOPER_MINI_IDS.judgmentPredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: ["developer-authored", "external-product", "all-fd"],
  };
  const program = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.programRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: DEVELOPER_MINI_IDS.startRef,
      graphFunctionRef: DEVELOPER_MINI_IDS.graphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.graphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.default_start_ref": DEVELOPER_MINI_IDS.startRef,
      "abg.root_mode": "direct",
    },
    publicAssetTargets: [{
      kind: "program_public_asset_target",
      handle: DEVELOPER_MINI_IDS.greetingAssetHandle,
      assetRef: DEVELOPER_MINI_IDS.greetingAssetRef,
      startRef: DEVELOPER_MINI_IDS.startRef,
    }],
  };
  const ticketGraphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.ticketGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.ticketInputContractRef],
      provides: [DEVELOPER_MINI_IDS.ticketOutputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.ticketInputContractRef,
        DEVELOPER_MINI_IDS.ticketOutputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.ticketInputContractRef],
    outputs: [DEVELOPER_MINI_IDS.ticketOutputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.ticketGraphRef,
      startNodeRef: DEVELOPER_MINI_IDS.ticketNodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.ticketNodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.ticketNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_of",
          inputCarrierRef: DEVELOPER_MINI_IDS.ticketInputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
          programLocusRef: DEVELOPER_MINI_IDS.ticketNodeRef,
          stageRole: "ticket-work",
          fibre: "F_D",
          armId: "arm://developer.example/ticket/work-fd@5",
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef:
            DEVELOPER_MINI_IDS.ticketJudgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              DEVELOPER_MINI_IDS.ticketImplementationBindingRef,
            inputContractRef: DEVELOPER_MINI_IDS.ticketInputContractRef,
            outputContractRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
            evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
            failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
            refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
            judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
          },
        },
      }],
      edges: [],
      applications: [],
    },
    effects: ["effect://developer.example/ticket/complete@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": DEVELOPER_MINI_IDS.ticketClosureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        DEVELOPER_MINI_IDS.ticketJudgmentPredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: [
      "developer-authored",
      "external-product",
      "ticket-work",
    ],
  };
  const ticketProgram = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.ticketProgramRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: DEVELOPER_MINI_IDS.ticketStartRef,
      graphFunctionRef: DEVELOPER_MINI_IDS.ticketGraphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.ticketGraphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.ticketClosureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.root_mode": "direct",
    },
  };
  const spanGraphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.spanStateContractRef,
        DEVELOPER_MINI_IDS.spanSelectionContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.spanGraphRef,
      startNodeRef: DEVELOPER_MINI_IDS.spanNodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.spanNodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.spanNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_compose",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          terms: [{
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.spanStateContractRef,
            programLocusRef:
              DEVELOPER_MINI_IDS.spanInitializeLocusRef,
            stageRole: "initialize",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/span-reentry/initialize@5",
            compositionRef: null,
            vectorIndex: 0,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.spanInitializeImplementationBindingRef,
              inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.spanStateContractRef,
              evidenceContractRef:
                DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef:
                DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef:
                DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef:
                DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.spanStateContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.spanStateContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.spanTargetLocusRef,
            stageRole: "span-target",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/span-reentry/target@5",
            compositionRef: null,
            vectorIndex: 1,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.spanTargetImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.spanStateContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.spanStateContractRef,
              evidenceContractRef:
                DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef:
                DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef:
                DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef:
                DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef: DEVELOPER_MINI_IDS.spanStateContractRef,
            outputCarrierRef:
              DEVELOPER_MINI_IDS.spanSelectionContractRef,
            programLocusRef: DEVELOPER_MINI_IDS.spanSelectorLocusRef,
            stageRole: "select-span-route",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/span-reentry/select@5",
            compositionRef:
              DEVELOPER_SPAN_REENTRY_APPLICATION.applicationRef,
            vectorIndex: 2,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
            resultBearing: false,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.spanSelectorImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.spanStateContractRef,
              outputContractRef:
                DEVELOPER_MINI_IDS.spanSelectionContractRef,
              evidenceContractRef:
                DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef:
                DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef:
                DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef:
                DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }, {
            kind: "c_of",
            inputCarrierRef:
              DEVELOPER_MINI_IDS.spanSelectionContractRef,
            outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
            programLocusRef:
              DEVELOPER_MINI_IDS.spanFinalizeLocusRef,
            stageRole: "result",
            fibre: "F_D",
            armId:
              "arm://developer.example/greeting/span-reentry/finalize@5",
            compositionRef: null,
            vectorIndex: 3,
            judgmentPredicateRef:
              DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
            resultBearing: true,
            requirement: {
              kind: "executable_leaf_requirement",
              implementationBindingRef:
                DEVELOPER_MINI_IDS.spanFinalizeImplementationBindingRef,
              inputContractRef:
                DEVELOPER_MINI_IDS.spanSelectionContractRef,
              outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
              evidenceContractRef:
                DEVELOPER_MINI_IDS.evidenceContractRef,
              failureContractRef:
                DEVELOPER_MINI_IDS.failureContractRef,
              refusalContractRef:
                DEVELOPER_MINI_IDS.refusalContractRef,
              judgmentContractRef:
                DEVELOPER_MINI_IDS.judgmentContractRef,
            },
          }],
        },
      }],
      edges: [],
      applications: [DEVELOPER_SPAN_REENTRY_APPLICATION],
    },
    effects: [
      "effect://developer.example/greeting/span-reentry@5",
    ],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": DEVELOPER_MINI_IDS.closureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate":
        DEVELOPER_MINI_IDS.spanJudgmentPredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: [
      "developer-authored",
      "external-product",
      "graph-span-reentry",
    ],
  };
  const spanProgram = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.spanProgramRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: DEVELOPER_MINI_IDS.spanStartRef,
      graphFunctionRef: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.spanGraphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.default_start_ref": DEVELOPER_MINI_IDS.spanStartRef,
      "abg.root_mode": "direct",
    },
  };
  const identityEdgeBody = {
    fromNodeRef: DEVELOPER_MINI_IDS.identityNodeRef,
    toNodeRef: DEVELOPER_MINI_IDS.identityResultNodeRef,
  };
  const identityGraphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.identityGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.identityGraphRef,
      startNodeRef: DEVELOPER_MINI_IDS.identityNodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.identityResultNodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.identityNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_identity",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
        },
      }, {
        nodeRef: DEVELOPER_MINI_IDS.identityResultNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_of",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          programLocusRef: DEVELOPER_MINI_IDS.identityResultNodeRef,
          stageRole: "result",
          fibre: "F_D",
          armId:
            "arm://developer.example/greeting/identity-then-render/fd@5",
          compositionRef: null,
          vectorIndex: 0,
          judgmentPredicateRef:
            DEVELOPER_MINI_IDS.judgmentPredicateRef,
          resultBearing: true,
          requirement: {
            kind: "executable_leaf_requirement",
            implementationBindingRef:
              DEVELOPER_MINI_IDS.implementationBindingRef,
            inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
            outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
            evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
            failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
            refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
            judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
          },
        },
      }],
      edges: [{
        edgeRef:
          `graph-vector://abiogenesis/${
            sha256Canonical(identityEdgeBody).slice("sha256:".length)
          }`,
        ...identityEdgeBody,
      }],
      applications: [],
    },
    effects: ["effect://developer.example/greeting/render@5"],
    declarations: {
      "abg.compute_regime": "F_D",
      "abg.closure_contract": DEVELOPER_MINI_IDS.closureContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.evidenceContractRef,
      "abg.judgment_contract": DEVELOPER_MINI_IDS.judgmentContractRef,
      "abg.judgment_predicate": DEVELOPER_MINI_IDS.judgmentPredicateRef,
      "abg.transition_contract": DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: [
      "developer-authored",
      "external-product",
      "nonterminal-c-identity",
    ],
  };
  const identityProgram = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.identityProgramRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef:
        "start://developer.example/greeting/identity-then-render@5",
      graphFunctionRef: DEVELOPER_MINI_IDS.identityGraphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.identityGraphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
    policies: {
      "abg.compute_regime": "F_D",
      "abg.root_mode": "direct",
    },
  };
  const mixedGraphFunction = {
    kind: "graph_function",
    name: DEVELOPER_MINI_IDS.mixedGraphFunctionRef,
    version: "5.0.0",
    environment: {
      requires: [DEVELOPER_MINI_IDS.inputContractRef],
      provides: [DEVELOPER_MINI_IDS.outputContractRef],
      carries: [
        DEVELOPER_MINI_IDS.inputContractRef,
        DEVELOPER_MINI_IDS.outputContractRef,
      ],
    },
    inputs: [DEVELOPER_MINI_IDS.inputContractRef],
    outputs: [DEVELOPER_MINI_IDS.outputContractRef],
    template: {
      kind: "inline_graph",
      graphRef: DEVELOPER_MINI_IDS.mixedGraphRef,
      startNodeRef: DEVELOPER_MINI_IDS.mixedNodeRef,
      terminalNodeRefs: [DEVELOPER_MINI_IDS.mixedNodeRef],
      nodes: [{
        nodeRef: DEVELOPER_MINI_IDS.mixedNodeRef,
        nodeKind: "c_locus",
        term: {
          kind: "c_compose",
          inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
          outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
          terms: [
            {
              kind: "c_of",
              inputCarrierRef: DEVELOPER_MINI_IDS.inputContractRef,
              outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              programLocusRef: DEVELOPER_MINI_IDS.deterministicLocusRef,
              stageRole: "transform",
              fibre: "F_D",
              armId: "arm://developer.example/greeting/mixed-fibres/fd@5",
              compositionRef: DEVELOPER_MINI_IDS.mixedCompositionRef,
              vectorIndex: 0,
              judgmentPredicateRef:
                DEVELOPER_MINI_IDS.judgmentPredicateRef,
              resultBearing: false,
              requirement: {
                kind: "executable_leaf_requirement",
                implementationBindingRef:
                  DEVELOPER_MINI_IDS.implementationBindingRef,
                inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
                outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
                failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
                refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
                judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
              },
            },
            {
              kind: "c_of",
              inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              programLocusRef: DEVELOPER_MINI_IDS.probabilisticLocusRef,
              stageRole: "evaluate",
              fibre: "F_P",
              armId: "arm://developer.example/greeting/mixed-fibres/fp@5",
              compositionRef: DEVELOPER_MINI_IDS.mixedCompositionRef,
              vectorIndex: 1,
              judgmentPredicateRef:
                DEVELOPER_MINI_IDS.preservePredicateRef,
              resultBearing: false,
              requirement: {
                kind: "executable_leaf_requirement",
                implementationBindingRef:
                  DEVELOPER_MINI_IDS.probabilisticImplementationBindingRef,
                inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                evidenceContractRef:
                  DEVELOPER_MINI_IDS.probabilisticEvidenceContractRef,
                failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
                refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
                judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
              },
            },
            {
              kind: "c_of",
              inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              programLocusRef: DEVELOPER_MINI_IDS.interactionLocusRef,
              stageRole: "consequence",
              fibre: "F_H",
              armId: "arm://developer.example/greeting/mixed-fibres/fh@5",
              compositionRef: DEVELOPER_MINI_IDS.mixedCompositionRef,
              vectorIndex: 2,
              judgmentPredicateRef:
                DEVELOPER_MINI_IDS.preservePredicateRef,
              resultBearing: false,
              requirement: {
                kind: "interaction_leaf_requirement",
                interactionKind: DEVELOPER_MINI_IDS.interactionKind,
                actorCapabilityRef:
                  DEVELOPER_MINI_IDS.actorCapabilityRef,
                requestContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                responseContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                continuationContractRef:
                  DEVELOPER_MINI_IDS.continuationContractRef,
              },
            },
            {
              kind: "c_of",
              inputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              outputCarrierRef: DEVELOPER_MINI_IDS.outputContractRef,
              programLocusRef:
                "locus://developer.example/greeting/mixed-fibres/post-fh@5",
              stageRole: "result",
              fibre: "F_D",
              armId:
                "arm://developer.example/greeting/mixed-fibres/post-fh@5",
              compositionRef: DEVELOPER_MINI_IDS.mixedCompositionRef,
              vectorIndex: 3,
              judgmentPredicateRef:
                DEVELOPER_MINI_IDS.preservePredicateRef,
              resultBearing: true,
              requirement: {
                kind: "executable_leaf_requirement",
                implementationBindingRef:
                  DEVELOPER_MINI_IDS.deterministicPassImplementationBindingRef,
                inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
                evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
                failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
                refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
                judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
              },
            },
          ],
        },
      }],
      edges: [],
      applications: [],
    },
    effects: [
      "effect://developer.example/greeting/render@5",
      "effect://developer.example/greeting/worker-pass@5",
      "effect://developer.example/greeting/human-approval@5",
    ],
    declarations: {
      "abg.compute_regime": "mixed",
      "abg.closure_contract":
        DEVELOPER_MINI_IDS.mixedClosureContractRef,
      "abg.raw_result_contract":
        DEVELOPER_MINI_IDS.probabilisticRawResultContractRef,
      "abg.evidence_contract": DEVELOPER_MINI_IDS.outputContractRef,
      "abg.judgment_contract":
        DEVELOPER_MINI_IDS.continuationContractRef,
      "abg.judgment_predicate":
        DEVELOPER_MINI_IDS.preservePredicateRef,
      "abg.transition_contract":
        DEVELOPER_MINI_IDS.transitionContractRef,
    },
    tags: [
      "developer-authored",
      "external-product",
      "mixed-fd-fp-fh",
    ],
  };
  const mixedProgram = {
    kind: "gtl_program",
    programRef: DEVELOPER_MINI_IDS.mixedProgramRef,
    version: "5.0.0",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    starts: [{
      startRef: "start://developer.example/greeting/mixed-fibres@5",
      graphFunctionRef: DEVELOPER_MINI_IDS.mixedGraphFunctionRef,
    }],
    callableMembership: [DEVELOPER_MINI_IDS.mixedGraphFunctionRef],
    closureContractRef: DEVELOPER_MINI_IDS.mixedClosureContractRef,
    policies: {
      "abg.compute_regime": "mixed",
      "abg.root_mode": "direct",
    },
  };
  const contribution = {
    handle: DEVELOPER_MINI_IDS.graphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: DEVELOPER_MINI_IDS.graphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.programRef],
    readinessPrerequisiteRefs: [DEVELOPER_MINI_IDS.programRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const ticketContribution = {
    handle: DEVELOPER_MINI_IDS.ticketGraphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: DEVELOPER_MINI_IDS.ticketGraphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.ticketProgramRef],
    readinessPrerequisiteRefs: [DEVELOPER_MINI_IDS.ticketProgramRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const spanContribution = {
    handle: DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef:
      DEVELOPER_MINI_IDS.spanGraphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.spanProgramRef],
    readinessPrerequisiteRefs: [DEVELOPER_MINI_IDS.spanProgramRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const mixedContribution = {
    handle: DEVELOPER_MINI_IDS.mixedGraphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef: DEVELOPER_MINI_IDS.mixedGraphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.mixedProgramRef],
    readinessPrerequisiteRefs: [DEVELOPER_MINI_IDS.mixedProgramRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  const identityContribution = {
    handle: DEVELOPER_MINI_IDS.identityGraphFunctionRef,
    kind: "graph_function",
    declarationOrContractRef:
      DEVELOPER_MINI_IDS.identityGraphFunctionRef,
    owningProductId: artifact.productId,
    programMembershipRefs: [DEVELOPER_MINI_IDS.identityProgramRef],
    readinessPrerequisiteRefs: [DEVELOPER_MINI_IDS.identityProgramRef],
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    provenanceRefs: [
      artifact.artifactDigest,
      artifact.productManifestDigest,
    ],
  };
  return deepFreeze({
    kind: "module_publication",
    moduleRef: DEVELOPER_MINI_IDS.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: "descriptor://developer.example/greeting@5",
    contributionManifestRef:
      "contribution-manifest://developer.example/greeting@5",
    productSemanticsBinding: {
      kind: "product_semantics_binding",
      bindingRef: DEVELOPER_MINI_IDS.semanticsBindingRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "DEVELOPER_MINI_PRODUCT_SEMANTICS",
    },
    contracts,
    evaluators: [],
    rules: [],
    implementationBindings: [{
      kind: "implementation_binding",
      bindingRef: DEVELOPER_MINI_IDS.implementationBindingRef,
      implementationRef: DEVELOPER_MINI_IDS.implementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperGreeting",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef: DEVELOPER_MINI_IDS.ticketImplementationBindingRef,
      implementationRef: DEVELOPER_MINI_IDS.ticketImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperTicketWork",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.ticketInputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.spanInitializeImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.spanInitializeImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperSpanInitialize",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.inputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.spanTargetImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.spanTargetImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperSpanTarget",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.spanSelectorImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.spanSelectorImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperSpanSelector",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.spanStateContractRef,
      outputContractRef:
        DEVELOPER_MINI_IDS.spanSelectionContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.spanFinalizeImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.spanFinalizeImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperSpanFinalize",
      computeRegime: "F_D",
      inputContractRef:
        DEVELOPER_MINI_IDS.spanSelectionContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.probabilisticImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.probabilisticImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperProbabilisticPass",
      computeRegime: "F_P",
      inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    }, {
      kind: "implementation_binding",
      bindingRef:
        DEVELOPER_MINI_IDS.deterministicPassImplementationBindingRef,
      implementationRef:
        DEVELOPER_MINI_IDS.deterministicPassImplementationRef,
      packageName: PACKAGE_NAME,
      packageVersion: PACKAGE_VERSION,
      modulePath: "build/index.js",
      namedSymbol: "realizeDeveloperDeterministicPass",
      computeRegime: "F_D",
      inputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      outputContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      failureContractRef: DEVELOPER_MINI_IDS.failureContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
    },],
    closureContracts: [{
      kind: "closure_contract",
      closureContractRef: DEVELOPER_MINI_IDS.closureContractRef,
      predicateRef: "predicate://developer.example/greeting/terminal@5",
      evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
      resultContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      refusalValueKind: "developer_greeting_refusal",
      judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
      rejectionContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      transitionContractRef: DEVELOPER_MINI_IDS.transitionContractRef,
      replayProjectionRef: "projection://developer.example/greeting/replay@5",
      terminalKind: "completed",
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    }, {
      kind: "closure_contract",
      closureContractRef: DEVELOPER_MINI_IDS.mixedClosureContractRef,
      predicateRef:
        "predicate://developer.example/greeting/mixed-terminal@5",
      evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
      resultContractRef: DEVELOPER_MINI_IDS.outputContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      refusalValueKind: "developer_greeting_refusal",
      judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
      rejectionContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      transitionContractRef: DEVELOPER_MINI_IDS.transitionContractRef,
      replayProjectionRef:
        "projection://developer.example/greeting/mixed-replay@5",
      terminalKind: "completed",
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    }, {
      kind: "closure_contract",
      closureContractRef: DEVELOPER_MINI_IDS.ticketClosureContractRef,
      predicateRef:
        "predicate://developer.example/ticket/terminal@5",
      evidenceContractRef: DEVELOPER_MINI_IDS.evidenceContractRef,
      resultContractRef: DEVELOPER_MINI_IDS.ticketOutputContractRef,
      refusalContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      refusalValueKind: "developer_greeting_refusal",
      judgmentContractRef: DEVELOPER_MINI_IDS.judgmentContractRef,
      rejectionContractRef: DEVELOPER_MINI_IDS.refusalContractRef,
      transitionContractRef: DEVELOPER_MINI_IDS.transitionContractRef,
      replayProjectionRef:
        "projection://developer.example/ticket/replay@5",
      terminalKind: "completed",
      closureScope: "run",
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
    }],
    programs: [
      program,
      ticketProgram,
      spanProgram,
      identityProgram,
      mixedProgram,
    ],
    graphFunctions: [
      graphFunction,
      ticketGraphFunction,
      spanGraphFunction,
      identityGraphFunction,
      mixedGraphFunction,
    ],
    contributions: [
      contribution,
      ticketContribution,
      spanContribution,
      identityContribution,
      mixedContribution,
    ],
  }) as Readonly<Record<string, JsonValue>>;
}
