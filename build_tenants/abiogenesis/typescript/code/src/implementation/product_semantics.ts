import {
  FAN_OUT_HELLO_IDS,
  FP_HELLO_IDS,
  HELLO_WORLD_IDS,
  RECURSION_HELLO_IDS,
  constructBoundedRecursionState,
  constructFpHelloInstruction,
  constructHelloWorldInput,
  isBoundedRecursionState,
  isFanOutHelloVectorInput,
  isFpHelloInstruction,
  isHelloWorldInput,
  resolveConformanceJudgmentRelation,
} from "../gtl/index.js";
import { isDeclaredConformanceValue } from "../gtl/hello_world.js";
import {
  ABI5_PACKAGE_NAME,
  ABI5_PACKAGE_VERSION,
} from "../product/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type { ProductSemanticsProvider } from "./contracts.js";

function admitInput(
  contractRef: string,
  value: unknown,
): Readonly<Record<string, JsonValue>> | null {
  if (contractRef === HELLO_WORLD_IDS.inputContractRef && isHelloWorldInput(value)) {
    return constructHelloWorldInput(value.subject) as unknown as Readonly<
      Record<string, JsonValue>
    >;
  }
  if (contractRef === FP_HELLO_IDS.inputContractRef && isFpHelloInstruction(value)) {
    return constructFpHelloInstruction(
      value.subject,
      value.instruction,
      value.transportLane,
    ) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === RECURSION_HELLO_IDS.inputContractRef &&
    isBoundedRecursionState(value) &&
    value.trace.length === 0 &&
    value.terminal === (value.remaining === 0)
  ) {
    return constructBoundedRecursionState(
      value.remaining,
      value.blockedChildRemaining,
    ) as unknown as Readonly<Record<string, JsonValue>>;
  }
  if (
    contractRef === FAN_OUT_HELLO_IDS.inputVectorRef &&
    isFanOutHelloVectorInput(value) &&
    value.members.filter((member) => member.value.block).length <= 1
  ) {
    return deepFreeze({
      kind: "fan_out_hello_vector_input",
      schemaVersion: "5.0.0",
      members: value.members.map((member) => ({
        ordinal: member.ordinal,
        memberRef: member.memberRef,
        value: {
          kind: "fan_out_hello_member_input",
          schemaVersion: "5.0.0",
          block: member.value.block,
          subject: member.value.subject,
        },
      })),
    }) as Readonly<Record<string, JsonValue>>;
  }
  return null;
}

export const ABI5_PRODUCT_SEMANTICS = Object.freeze({
  kind: "product_semantics_provider" as const,
  schemaVersion: "5.0.0" as const,
  bindingRef: "product-semantics://abiogenesis/conformance@5",
  packageName: ABI5_PACKAGE_NAME,
  packageVersion: ABI5_PACKAGE_VERSION,
  admitInput,
  validateContractValue(
    valueKind: string,
    value: unknown,
  ): value is Readonly<Record<string, JsonValue>> {
    return isDeclaredConformanceValue(value, valueKind);
  },
  resolveJudgmentRelation: resolveConformanceJudgmentRelation,
}) satisfies ProductSemanticsProvider;
