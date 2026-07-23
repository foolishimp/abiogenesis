import {
  FIBRE_SUBSTITUTION_HELLO_IDS,
  FP_HELLO_IDS,
  isFpHelloInstruction,
  isFpHelloOutput,
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
import type { ProbabilisticLeafEffectPort } from "./contracts.js";

interface FpHelloLeafCandidate {
  readonly kind: "leaf_realization_candidate";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "failure" | "success";
  readonly evidenceCandidates: readonly [];
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

const deterministicDescriptorBody = {
  implementationRef: FIBRE_SUBSTITUTION_HELLO_IDS.implementationRef,
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  modulePath: "build/code/src/implementation/fp_hello.js",
  namedSymbol: "realizeDeterministicFpHello",
  computeRegime: "F_D" as const,
  inputContractRef: FP_HELLO_IDS.inputContractRef,
  outputContractRef: FP_HELLO_IDS.outputContractRef,
  failureContractRef: FP_HELLO_IDS.failureContractRef,
  refusalContractRef: FP_HELLO_IDS.refusalContractRef,
};

export const DETERMINISTIC_FP_HELLO_IMPLEMENTATION_DESCRIPTOR = deepFreeze({
  kind: "packaged_leaf_implementation_descriptor" as const,
  schemaVersion: "5.0.0" as const,
  descriptorDigest: sha256Canonical(deterministicDescriptorBody),
  ...deterministicDescriptorBody,
}) as PackagedLeafImplementationDescriptor;

function renderInstruction(input: Readonly<FpHelloInstruction>): string {
  return [
    "Execute the declared ABIogenesis F_P conformance instruction.",
    `Instruction contract: ${input.instructionContractRef}`,
    `Result contract: ${input.resultContractRef}`,
    `Attributed actor: ${input.workerActorRef}`,
    `Subject: ${JSON.stringify(input.subject)}`,
    `Instruction: ${input.instruction}`,
    `The message field must equal exactly ${JSON.stringify(`Hello ${input.subject}`)}.`,
    "Return only the declared JSON result. Do not call tools.",
  ].join("\n");
}

function responseSchema(
  input: Readonly<FpHelloInstruction>,
): Readonly<Record<string, JsonValue>> {
  return {
    type: "object",
    additionalProperties: false,
    required: ["kind", "schemaVersion", "resultContractRef", "actorRef", "message"],
    properties: {
      kind: { const: "fp_hello_output" },
      schemaVersion: { const: "5.0.0" },
      resultContractRef: { const: FP_HELLO_IDS.outputContractRef },
      actorRef: { const: FP_HELLO_IDS.workerActorRef },
      message: { const: `Hello ${input.subject}` },
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
  effects: Readonly<ProbabilisticLeafEffectPort>,
): Promise<Readonly<FpHelloLeafCandidate>> {
  if (!isFpHelloInstruction(input)) {
    throw new TypeError("F_P Hello implementation requires the exact admitted instruction envelope");
  }
  const prompt = renderInstruction(input);
  const inputDigest = sha256Canonical(input);
  const transport = await effects.invokeWorker({
    actorRef: input.workerActorRef,
    workerBindingRef: input.workerBindingRef,
    implementationRef: FP_HELLO_IDS.implementationRef,
    inputDigest,
    materializationPlanRef: input.materializationPlanRef,
    rendererRef: input.rendererRef,
    instructionContractRef: input.instructionContractRef,
    resultContractRef: input.resultContractRef,
    transportLane: input.transportLane,
    prompt,
    responseJsonSchema: responseSchema(input),
  });
  const parsedCandidate = parseCandidate(transport.finalOutput);
  const salvaged = transport.disposition === "failure" &&
    transport.failureClass === "transport_failure" &&
    isFpHelloOutput(parsedCandidate);
  const disposition = transport.disposition === "success" || salvaged
    ? "success" as const
    : "failure" as const;
  const diagnosticRef = disposition === "success" || transport.failureClass === null
    ? null
    : `diagnostic://abiogenesis/transport/${transport.failureClass.replaceAll("_", "-")}@5`;
  const resultCandidate = disposition === "success"
    ? parsedCandidate
    : deepFreeze({
      kind: "fp_hello_failure",
      schemaVersion: "5.0.0",
      failureClass: transport.failureClass ?? "transport_failure",
      diagnosticRef: diagnosticRef ?? "diagnostic://abiogenesis/transport/failure@5",
    });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    evidenceCandidates: [] as const,
    resultCandidate,
    ...(diagnosticRef === null ? {} : { diagnosticRef }),
  }) as Readonly<FpHelloLeafCandidate>;
}

export function realizeDeterministicFpHello(
  input: Readonly<FpHelloInstruction>,
) {
  if (!isFpHelloInstruction(input)) {
    throw new TypeError(
      "deterministic fibre-substitution implementation requires the exact instruction envelope",
    );
  }
  const resultCandidate = deepFreeze({
    kind: "fp_hello_output" as const,
    schemaVersion: "5.0.0" as const,
    resultContractRef: input.resultContractRef,
    actorRef: input.workerActorRef,
    message: `Hello ${input.subject}`,
  });
  return deepFreeze({
    kind: "leaf_realization_candidate" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "success" as const,
    evidenceCandidates: [{
      kind: "deterministic_evidence_candidate" as const,
      schemaVersion: "5.0.0" as const,
      implementationRef: FIBRE_SUBSTITUTION_HELLO_IDS.implementationRef,
      inputDigest: sha256Canonical(input),
      outputDigest: sha256Canonical(resultCandidate),
    }] as const,
    resultCandidate,
  });
}
