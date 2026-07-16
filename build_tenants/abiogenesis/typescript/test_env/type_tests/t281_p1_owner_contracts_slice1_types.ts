import * as v from "valibot";

import {
  PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES
} from "../../code/src/app/m04/product_intake/operation_contracts.js";
import {
  RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES
} from "../../code/src/app/m04/result_assessment/operation_contracts.js";
import {
  TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES
} from "../../code/src/app/m04/toolchain_binding/operation_contracts.js";
import {
  WORKSPACE_NATIVE_CONTRACT_SOURCES
} from "../../code/src/app/m04/workspace/operation_contracts.js";

const cleanRequestSchema =
  WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.request.schema;
type CleanRequest = v.InferOutput<typeof cleanRequestSchema>;

export const cleanRequest: CleanRequest = v.parse(cleanRequestSchema, {
  targetRoot: "/tmp/t281-owner-slice",
  createPolicy: "clean"
});

const wrongCreatePolicy: CleanRequest = {
  targetRoot: cleanRequest.targetRoot,
  // @ts-expect-error The clean definition cannot admit an imported policy.
  createPolicy: "imported"
};
void wrongCreatePolicy;

const cleanResultSchema =
  WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_create.clean.result.schema;
type CleanResult = v.InferOutput<typeof cleanResultSchema>;
declare const cleanResult: CleanResult;

// @ts-expect-error Workspace provenance is an immutable owner-contract list.
cleanResult.provenanceRefs.push("evidence:forged");

const openResultSchema =
  WORKSPACE_NATIVE_CONTRACT_SOURCES.workspace_open.open.result.schema;
type OpenResult = v.InferOutput<typeof openResultSchema>;
declare const openResult: OpenResult;

// @ts-expect-error Workspace configuration identity is immutable after admission.
openResult.configurationRefs.push("configuration:forged");

if (openResult.readiness === "ready") {
  const selectedBindingRef: string = openResult.selectedBindingRef;
  void selectedBindingRef;
}

const resolveRequestSchema =
  PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_resolve.resolve.request.schema;
type ResolveRequest = v.InferOutput<typeof resolveRequestSchema>;
declare const resolveRequest: ResolveRequest;
export const selectedProductVersion: string =
  resolveRequest.candidates[0]?.version ?? "5.0.0";

const installResultSchema =
  PRODUCT_INTAKE_NATIVE_CONTRACT_SOURCES.product_install.install.result.schema;
type InstallResult = v.InferOutput<typeof installResultSchema>;
declare const installResult: InstallResult;
export const verifiedInstall: "verified" = installResult.verificationDisposition;
export const materializationDisposition: "materialized" | "idempotent" =
  installResult.materializationDisposition;

const bindingRequestSchema =
  TOOLCHAIN_BINDING_NATIVE_CONTRACT_SOURCES.workspace_bind.bind.request.schema;
type BindingRequest = v.InferOutput<typeof bindingRequestSchema>;
declare const bindingRequest: BindingRequest;

// @ts-expect-error Plain strings cannot mint an admitted absolute-path value.
const forgedDeclaredRoot: BindingRequest["declaredRoots"][number] = "relative";
void forgedDeclaredRoot;

const assessmentResultSchema =
  RESULT_ASSESSMENT_NATIVE_CONTRACT_SOURCES.result_assess.assess.result.schema;
type AssessmentResult = v.InferOutput<typeof assessmentResultSchema>;
declare const assessmentResult: AssessmentResult;
export const assessed: "assessed" = assessmentResult.admittedDisposition;

// @ts-expect-error Retry is a nonterminal, not a terminal assessment result.
const retryAsTerminal: AssessmentResult["admittedDisposition"] = "retry";
void retryAsTerminal;
