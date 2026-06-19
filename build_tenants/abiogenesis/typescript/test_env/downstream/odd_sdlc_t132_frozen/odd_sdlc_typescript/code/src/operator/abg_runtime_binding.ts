// Implements: T-197

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";
import path, { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type {
  ExecutionBasis,
  EngineRunnerPluginSet,
  RuntimeEvent,
  RuntimeRegime
} from "@abiogenesis/typescript-tenant";
import { admitResolvedPolicyIdentity } from "@abiogenesis/typescript-tenant";
import {
  constructSdlcGtlModule,
  FG_CONFORM_PROJECT
} from "../graph/index.js";
import { projectSdlcQueryDomain } from "../projection/index.js";
import {
  projectSdlcWorkerAttachment,
  publicStartOnce,
  type SdlcPublicStartUntil
} from "../start/index.js";
import {
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcConformProjectReportFromWorkspace,
  deriveSdlcProjectConstraintsFromWorkspace,
  deriveSdlcSourceInput,
  deriveSdlcWorkspaceIngressReport,
  type SdlcSourceInput
} from "../workspace/index.js";
import { createSdlcInstalledOperatorAbgPluginSession } from "./installed_operator.js";

const DEFAULT_SOURCE_PATHS = Object.freeze([
  "README.md",
  "specification/GOALS.md",
  "specification/INTENT.md",
  "specification/PRODUCT.md",
  "specification/REQUIREMENTS.md",
  ".ai-workspace/context/project_constraints.yml"
] as const);

const SOURCE_DISCOVERY_EXTENSIONS = Object.freeze([
  ".md",
  ".markdown",
  ".txt",
  ".yml",
  ".yaml"
] as const);

const SOURCE_DISCOVERY_EXTENSION_SET: ReadonlySet<string> = new Set(
  SOURCE_DISCOVERY_EXTENSIONS
);

const SOURCE_DISCOVERY_IGNORED_DIRS = Object.freeze([
  ".abiogenesis",
  ".genesis",
  ".git",
  "node_modules",
  "build_tenants"
] as const);

export interface OddSdlcAbgRuntimeBindingPluginFactoryInput {
  readonly workspaceRoot: string;
  readonly targetGraphFunction: string;
  readonly until?: SdlcPublicStartUntil | undefined;
  readonly replayEvents: readonly RuntimeEvent[];
  readonly eventSink: (event: RuntimeEvent) => void;
  readonly workerTransport?: string | null | undefined;
}

export interface OddSdlcAbgRuntimeBindingPolicyInput {
  readonly targetGraphFunction: string;
}

export function oddSdlcAbgRuntimeWorkerTransportFromEnv(
  env: Record<string, string | undefined> = process.env
): string | null {
  return (
    env["ODD_SDLC_TS_WORKER_TRANSPORT"] ??
    env["ODD_SDLC_TS_DATA_MAPPER_WORKER"] ??
    env["ODD_SDLC_WORKER_TRANSPORT"] ??
    null
  );
}

function sourceFilePaths(workspaceRoot: string): readonly string[] {
  const paths = new Set<string>();
  for (const relativePath of DEFAULT_SOURCE_PATHS) {
    if (existsSync(path.join(workspaceRoot, relativePath))) {
      paths.add(relativePath);
    }
  }
  const requirementsRoot = path.join(workspaceRoot, "specification/requirements");
  if (existsSync(requirementsRoot)) {
    for (const fileName of readdirSync(requirementsRoot)) {
      const relativePath = `specification/requirements/${fileName}`;
      const absolutePath = path.join(workspaceRoot, relativePath);
      if (statSync(absolutePath).isFile() && fileName.endsWith(".md")) {
        paths.add(relativePath);
      }
    }
  }
  const ignored = new Set<string>(SOURCE_DISCOVERY_IGNORED_DIRS);
  const visit = (absoluteDir: string, relativeDir: string): void => {
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      const relativePath =
        relativeDir.length === 0 ? entry.name : `${relativeDir}/${entry.name}`;
      const absolutePath = path.join(absoluteDir, entry.name);
      if (entry.isDirectory()) {
        if (
          !ignored.has(entry.name) &&
          !relativePath.startsWith(".ai-workspace/runtime") &&
          !relativePath.startsWith(".ai-workspace/events")
        ) {
          visit(absolutePath, relativePath);
        }
      } else if (
        entry.isFile() &&
        SOURCE_DISCOVERY_EXTENSION_SET.has(path.extname(entry.name).toLowerCase())
      ) {
        paths.add(relativePath);
      }
    }
  };
  visit(workspaceRoot, "");
  return Object.freeze([...paths].sort());
}

function readSourceInputs(workspaceRoot: string): readonly SdlcSourceInput[] {
  return Object.freeze(
    sourceFilePaths(workspaceRoot).map((relativePath) => {
      const absolutePath = path.join(workspaceRoot, relativePath);
      return deriveSdlcSourceInput({
        uri: `${pathToFileURL(workspaceRoot).href}/${relativePath}`,
        relativePath,
        content: readFileSync(absolutePath, "utf8")
      });
    })
  );
}

function defaultRegimeForGraphFunction(graphFunctionName: string): RuntimeRegime {
  return graphFunctionName === FG_CONFORM_PROJECT ? "F_D" : "F_P";
}

export function resolveOddSdlcAbgRuntimeBindingPolicy(
  input: OddSdlcAbgRuntimeBindingPolicyInput
): ExecutionBasis["resolvedPolicy"] {
  const defaultRegime = defaultRegimeForGraphFunction(input.targetGraphFunction);
  return admitResolvedPolicyIdentity({
    resolvedPolicyBundleRef: `policy://odd-sdlc/start/${defaultRegime}`,
    defaultRegime,
    dispatchRef:
      defaultRegime === "F_P" ? "dispatch://odd-sdlc/public-start" : null,
    approvalSubjectRef: null
  });
}

export function createOddSdlcAbgRuntimeBindingPlugins(
  input: OddSdlcAbgRuntimeBindingPluginFactoryInput
): EngineRunnerPluginSet {
  const workspaceRoot = resolve(input.workspaceRoot);
  const module = constructSdlcGtlModule();
  const conformedProject =
    deriveSdlcConformProjectProfileFromWorkspace(workspaceRoot);
  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: pathToFileURL(workspaceRoot).href,
    projectConstraints: deriveSdlcProjectConstraintsFromWorkspace(workspaceRoot),
    sourceInputs: readSourceInputs(workspaceRoot)
  });
  const queryDomain = projectSdlcQueryDomain({
    module,
    ingressReport,
    projectConformance: deriveSdlcConformProjectReportFromWorkspace(workspaceRoot)
  });
  const workerTransport = input.workerTransport ?? null;
  const start = publicStartOnce({
    request: {
      kind: "sdlc_public_start_request",
      workspaceRoot,
      target: {
        kind: "graph_function",
        handle: input.targetGraphFunction
      },
      until: input.until ?? "converged",
      defaultRegime: defaultRegimeForGraphFunction(input.targetGraphFunction)
    },
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: workerTransport
    })
  });
  if (start.executionContract === null) {
    const blockingReason =
      "blockingReason" in start ? start.blockingReason : start.kind;
    throw new TypeError(
      `odd_sdlc ABG runtime binding could not construct an execution contract: ${blockingReason}`
    );
  }
  return createSdlcInstalledOperatorAbgPluginSession({
    workspaceRoot,
    start,
    workerTransport,
    replayEvents: input.replayEvents,
    effectiveReplayEvents: input.replayEvents,
    basis: start.executionContract.basis,
    eventSink: input.eventSink
  }).plugins;
}
