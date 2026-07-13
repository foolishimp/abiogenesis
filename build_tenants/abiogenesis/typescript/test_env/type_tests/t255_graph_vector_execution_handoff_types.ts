// Native type-law proof for the T-255 manifest and startup boundaries.

import type {
  CompileGraphVectorExecutionHandoffInput,
  GraphVectorExecutionHandoffPublished
} from "../../code/src/abg/m03/contracts/graph_vector_execution_handoff.js";
import type {
  AdmittedTenantConformanceManifest,
  TenantConformanceManifest
} from "../../code/src/shared/abg_library/tenant_conformance_manifest.js";

declare const rawManifest: TenantConformanceManifest;
declare const admittedManifest: AdmittedTenantConformanceManifest;

const admittedInput: CompileGraphVectorExecutionHandoffInput["admittedTenantConformanceManifest"] =
  admittedManifest;
void admittedInput;

// @ts-expect-error M03 accepts only the M04-admitted carrier or explicit absence.
const rawInput: CompileGraphVectorExecutionHandoffInput["admittedTenantConformanceManifest"] =
  rawManifest;
void rawInput;

declare const published: GraphVectorExecutionHandoffPublished;
const startupBlocked: "startup_blocked_awaiting_t267" =
  published.handoff.startupBlock.status;
const runtimeAddressable: false =
  published.handoff.startupBlock.runtimeAddressable;
const effectsPermitted: false = published.handoff.startupBlock.effectsPermitted;
void startupBlocked;
void runtimeAddressable;
void effectsPermitted;
