import type { ProbabilisticTransportEvidenceCandidate } from "../abg/c_call.js";
import {
  FP_HELLO_IDS,
  isFpHelloInstruction,
} from "../gtl/hello_world.js";
import type { FpHelloInstruction } from "../gtl/contracts.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { PackagedLeafImplementationDescriptor } from "../product/implementation_resolution.js";
import { constructKnownWorkerTransportContract } from "./transport_contracts.js";
import { runWorkerTransport } from "./worker_transport.js";

export interface FpLeafRuntimeContext {
  readonly cwd: string;
  readonly archiveRoot: string;
  readonly label: string;
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly timeoutMs: number;
}

interface FpHelloLeafCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure" | "success";
  readonly evidenceCandidates: readonly [ProbabilisticTransportEvidenceCandidate];
  readonly resultCandidate: Readonly<Record<string, JsonValue>>;
  readonly diagnosticRef?: string;
}

const descriptorBody = {
  implementationRef: FP_HELLO_IDS.implementationRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/fp_hello.js",
  namedSymbol: "realizeFpHello",
  computeRegime: "F_P" as const,
  inputContractRef: FP_HELLO_IDS.inputContractRef,
  outputContractRef: FP_HELLO_IDS.outputContractRef,
  failureContractRef: FP_HELLO_IDS.failureContractRef,
  refusalContractRef: FP_HELLO_IDS.refusalContractRef,
};

export const FP_HELLO_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(descriptorBody),
  ...descriptorBody,
}) as PackagedLeafImplementationDescriptor;

function renderInstruction(input: Readonly<FpHelloInstruction>): string {
  return [
    "Execute the declared ABIogenesis F_P conformance instruction.",
    `Instruction contract: ${input.instructionContractRef}`,
    `Result contract: ${input.resultContractRef}`,
    `Attributed actor: ${input.workerActorRef}`,
    `Subject: ${JSON.stringify(input.subject)}`,
    `Instruction: ${input.instruction}`,
    "Return only the declared JSON result. Do not call tools.",
  ].join("\n");
}

function responseSchema(): Readonly<Record<string, JsonValue>> {
  return {
    type: "object",
    additionalProperties: false,
    required: ["kind", "schemaVersion", "resultContractRef", "actorRef", "message"],
    properties: {
      kind: { const: "fp_hello_output" },
      schemaVersion: { const: "5.0.0" },
      resultContractRef: { const: FP_HELLO_IDS.outputContractRef },
      actorRef: { const: FP_HELLO_IDS.workerActorRef },
      message: { type: "string", minLength: 1 },
    },
  } as Readonly<Record<string, JsonValue>>;
}

function parseCandidate(output: string): Readonly<Record<string, JsonValue>> {
  try {
    const value = JSON.parse(output) as unknown;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return value as Readonly<Record<string, JsonValue>>;
    }
  } catch {
    // The raw output remains preserved in the transport artifacts and evidence digest.
  }
  return deepFreeze({
    kind: "malformed_fp_output",
    schemaVersion: "5.0.0",
    rawOutputDigest: sha256Canonical(output),
  });
}

export async function realizeFpHello(
  input: Readonly<FpHelloInstruction>,
  context: Readonly<FpLeafRuntimeContext>,
): Promise<Readonly<FpHelloLeafCandidate>> {
  if (!isFpHelloInstruction(input)) {
    throw new TypeError("F_P Hello implementation requires the exact admitted instruction envelope");
  }
  const prompt = renderInstruction(input);
  const inputDigest = sha256Canonical(input);
  const promptDigest = sha256Canonical(prompt);
  const actorInvocationRef = `actor-invocation://abiogenesis/${sha256Canonical({
    implementationRef: FP_HELLO_IDS.implementationRef,
    inputDigest,
    promptDigest,
    label: context.label,
  }).slice("sha256:".length)}`;
  const command = context.environment.ABG_TS_CLAUDE_COMMAND;
  if (command !== undefined && command.length === 0) {
    throw new TypeError("ABG_TS_CLAUDE_COMMAND must be a non-empty command");
  }
  const transport = await runWorkerTransport({
    contract: constructKnownWorkerTransportContract("claude", {
      command: command ?? "claude",
      environment: context.environment,
    }),
    prompt,
    lane: "closed_prompt_proof",
    cwd: context.cwd,
    archiveRoot: context.archiveRoot,
    label: context.label,
    timeoutMs: context.timeoutMs,
    responseJsonSchema: responseSchema(),
    environment: context.environment,
  });
  const diagnosticRef = transport.failureClass === null
    ? null
    : `diagnostic://abiogenesis/transport/${transport.failureClass.replaceAll("_", "-")}@5`;
  const resultCandidate = transport.disposition === "success"
    ? parseCandidate(transport.finalOutput)
    : deepFreeze({
      kind: "fp_hello_failure",
      schemaVersion: "5.0.0",
      failureClass: transport.failureClass ?? "transport_failure",
      diagnosticRef: diagnosticRef ?? "diagnostic://abiogenesis/transport/failure@5",
    });
  const outputDigest = sha256Canonical(resultCandidate as unknown as JsonValue);
  const evidence = deepFreeze({
    kind: "probabilistic_transport_evidence_candidate" as const,
    schemaVersion: "5.0.0" as const,
    implementationRef: FP_HELLO_IDS.implementationRef,
    inputDigest,
    outputDigest,
    actorInvocationRef,
    actorRef: input.workerActorRef,
    materializationPlanRef: input.materializationPlanRef,
    rendererRef: input.rendererRef,
    instructionContractRef: input.instructionContractRef,
    resultContractRef: input.resultContractRef,
    promptDigest,
    transportDigest: transport.artifacts.transport.digest,
    transportLane: transport.lane,
    transportDisposition: transport.disposition,
    transportFailureClass: transport.failureClass,
    processStatus: transport.status,
    processSignal: transport.signal,
    timedOut: transport.timedOut,
    progressEventCount: transport.progressEventCount,
    toolCallCount: transport.toolCallCount,
    artifactDigests: {
      output: transport.artifacts.output.digest,
      prompt: transport.artifacts.prompt.digest,
      stderr: transport.artifacts.stderr.digest,
      stdout: transport.artifacts.stdout.digest,
      transport: transport.artifacts.transport.digest,
    },
  }) as ProbabilisticTransportEvidenceCandidate;
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: transport.disposition,
    evidenceCandidates: [evidence] as const,
    resultCandidate,
    ...(diagnosticRef === null ? {} : { diagnosticRef }),
  }) as Readonly<FpHelloLeafCandidate>;
}
