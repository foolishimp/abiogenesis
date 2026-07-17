import type {
  OwnerNativeDefinitionKey
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import { isPlainObject } from "../../../shared/validation/primitives.js";

/** @internal */
export type PrivatePublicOperationActorAttributionWitness =
  | Readonly<{ readonly state: "forbidden" }>
  | Readonly<{
      readonly state: "admitted_actor";
      readonly actorRef: string;
      readonly attributionRef: string;
      readonly attributionDigest: string;
    }>;

/** @internal */
export type PrivatePublicOperationWorkspaceBindingWitness =
  | Readonly<{ readonly state: "forbidden" }>
  | Readonly<{
      readonly state: "admitted_workspace";
      readonly bindingRef: string;
      readonly bindingDigest: string;
    }>;

/** @internal */
export interface PrivatePublicOperationIngressAdmissionWitness<
  K extends OwnerNativeDefinitionKey = OwnerNativeDefinitionKey
> {
  readonly kind: "private_public_operation_ingress_admitted";
  readonly definitionKey: K;
  readonly definitionDigest: string;
  readonly eventAdmission: "owning_semantic_authority";
  readonly invocationRef: string;
  readonly invocationDigest: string;
  readonly invocationAuthorityRef: string;
  readonly invocationAuthorityDigest: string;
  readonly actorAttribution: PrivatePublicOperationActorAttributionWitness;
  readonly workspaceBindingRequirement: "forbidden" | "exactly_one";
  readonly workspaceBindingWitness:
    PrivatePublicOperationWorkspaceBindingWitness;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
}

function assertExactOwnFields(
  input: object,
  expected: readonly string[],
  label: string
): void {
  const actual = Reflect.ownKeys(input);
  if (
    !actual.every((key): key is string => typeof key === "string") ||
    actual.length !== expected.length ||
    !expected.every((key) => actual.includes(key))
  ) {
    throw new TypeError(`${label} must contain exactly ${expected.join(",")}`);
  }
}

function assertNonEmptyString(value: unknown, label: string): void {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}

function assertSha256Digest(value: unknown, label: string): void {
  if (
    typeof value !== "string" ||
    !/^sha256:[0-9a-f]{64}$/u.test(value)
  ) {
    throw new TypeError(`${label} must be a sha256:<64-hex> digest`);
  }
}

function assertDefinitionKey(value: unknown, label: string): void {
  if (!isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  if (value["memberKind"] === "variant") {
    assertExactOwnFields(
      value,
      ["operationId", "memberKind", "variant"],
      label
    );
    assertNonEmptyString(value["operationId"], `${label}.operationId`);
    assertNonEmptyString(value["variant"], `${label}.variant`);
    if (value["operationId"] === "abg.operation.project.read") {
      throw new TypeError(`${label} project.read requires a project_read_case`);
    }
    return;
  }
  assertExactOwnFields(
    value,
    ["operationId", "memberKind", "caseKey"],
    label
  );
  if (
    value["memberKind"] !== "project_read_case" ||
    value["operationId"] !== "abg.operation.project.read"
  ) {
    throw new TypeError(`${label} must be a structural definition key`);
  }
  assertNonEmptyString(value["caseKey"], `${label}.caseKey`);
}

function assertActorAttribution(value: unknown, label: string): void {
  if (!isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  if (value["state"] === "forbidden") {
    assertExactOwnFields(value, ["state"], label);
    return;
  }
  assertExactOwnFields(
    value,
    ["state", "actorRef", "attributionRef", "attributionDigest"],
    label
  );
  if (value["state"] !== "admitted_actor") {
    throw new TypeError(`${label}.state must be forbidden or admitted_actor`);
  }
  assertNonEmptyString(value["actorRef"], `${label}.actorRef`);
  assertNonEmptyString(value["attributionRef"], `${label}.attributionRef`);
  assertSha256Digest(value["attributionDigest"], `${label}.attributionDigest`);
}

function assertWorkspaceBinding(
  value: unknown,
  label: string
): "forbidden" | "admitted_workspace" {
  if (!isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  if (value["state"] === "forbidden") {
    assertExactOwnFields(value, ["state"], label);
    return "forbidden";
  }
  assertExactOwnFields(
    value,
    ["state", "bindingRef", "bindingDigest"],
    label
  );
  if (value["state"] !== "admitted_workspace") {
    throw new TypeError(
      `${label}.state must be forbidden or admitted_workspace`
    );
  }
  assertNonEmptyString(value["bindingRef"], `${label}.bindingRef`);
  assertSha256Digest(value["bindingDigest"], `${label}.bindingDigest`);
  return "admitted_workspace";
}

/** @internal */
export function assertPrivatePublicOperationIngressAdmissionWitness(
  witness: unknown
): void {
  const label = "PrivatePublicOperationIngressAdmissionWitness";
  if (!isPlainObject(witness)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  assertExactOwnFields(
    witness,
    [
      "kind",
      "definitionKey",
      "definitionDigest",
      "eventAdmission",
      "invocationRef",
      "invocationDigest",
      "invocationAuthorityRef",
      "invocationAuthorityDigest",
      "actorAttribution",
      "workspaceBindingRequirement",
      "workspaceBindingWitness",
      "causationEventRefs",
      "correlationId"
    ],
    label
  );
  if (witness["kind"] !== "private_public_operation_ingress_admitted") {
    throw new TypeError(`${label}.kind is invalid`);
  }
  if (witness["eventAdmission"] !== "owning_semantic_authority") {
    throw new TypeError(`${label}.eventAdmission is not eligible`);
  }
  assertDefinitionKey(witness["definitionKey"], `${label}.definitionKey`);
  for (const field of [
    "definitionDigest",
    "invocationDigest",
    "invocationAuthorityDigest"
  ]) {
    assertSha256Digest(witness[field], `${label}.${field}`);
  }
  assertNonEmptyString(witness["invocationRef"], `${label}.invocationRef`);
  assertNonEmptyString(
    witness["invocationAuthorityRef"],
    `${label}.invocationAuthorityRef`
  );
  assertActorAttribution(
    witness["actorAttribution"],
    `${label}.actorAttribution`
  );
  const bindingRequirement = witness["workspaceBindingRequirement"];
  if (bindingRequirement !== "forbidden" && bindingRequirement !== "exactly_one") {
    throw new TypeError(`${label}.workspaceBindingRequirement is invalid`);
  }
  const bindingState = assertWorkspaceBinding(
    witness["workspaceBindingWitness"],
    `${label}.workspaceBindingWitness`
  );
  if (
    (bindingRequirement === "forbidden" && bindingState !== "forbidden") ||
    (bindingRequirement === "exactly_one" &&
      bindingState !== "admitted_workspace")
  ) {
    throw new TypeError(`${label} binding witness does not satisfy requirement`);
  }
  const causationRefs = witness["causationEventRefs"];
  if (
    !Array.isArray(causationRefs) ||
    !causationRefs.every((entry) => typeof entry === "string")
  ) {
    throw new TypeError(`${label}.causationEventRefs must be a string array`);
  }
  assertNonEmptyString(witness["correlationId"], `${label}.correlationId`);
}
