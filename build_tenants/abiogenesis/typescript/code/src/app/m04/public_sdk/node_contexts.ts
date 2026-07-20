// Implements: T-223 DS-1 Node effect contexts for the source-blind public SDK

import { accessSync, constants, writeFileSync } from "node:fs";
import {
  delimiter,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep
} from "node:path";
import {
  mkdir,
  readFile,
  writeFile
} from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { createRuntimeEventLogSink } from "../../../abg/m03/events/index.js";
import {
  contractForKnownAgent,
  constructAgentTransportContract
} from "../../../shared/abg_library/index.js";
import { constructLiveCapabilityBinding } from "../live_capability.js";
import { createNodeProductIntakeEffects } from "../product_intake/node_effects.js";
import { TOOLCHAIN_BINDING_RELATIVE_PATH } from "../toolchain_binding/resolve.js";
import { WORKSPACE_MANIFEST_RELATIVE_PATH } from "../workspace/operations.js";
import {
  admitProductVerificationRecord,
  admitPublicContractCatalog,
  admitPublicSdkWorkspaceManifest,
  admitToolchainWorkspaceBindingV3
} from "./carrier_admission.js";
import {
  admitIJsonText,
  canonicalizeIJson,
  type IJsonValue
} from "./canonical.js";
import type {
  AdmittedSteeringCapabilityFactory,
  BoundWorkspaceContext,
  InstalledProductRecord,
  OperatorCapabilityFactory,
  ProductIntakeContext,
  PublicContractCatalog,
  ToolchainWorkspaceBindingV3,
  TransportSteering,
  WorkspaceBindingContext,
  WorkspacePathContext
} from "./carriers.js";

export const ABG_CATALOG_INVOKE_GRAPH_FUNCTION_CAPABILITY_REF =
  "abg.capability.catalog.invoke-graph-function@5";

function isErrorWithCode(
  error: unknown
): error is Error & { readonly code: unknown } {
  return error instanceof Error && "code" in error;
}

function hasErrorCode(error: unknown, code: string): boolean {
  return isErrorWithCode(error) && error.code === code;
}

function absolutePath(input: string, label: string): string {
  if (!isAbsolute(input)) {
    throw new TypeError(`${label} must be an absolute path`);
  }
  return resolve(input);
}

async function readBytesOrNull(path: string): Promise<Uint8Array | null> {
  try {
    return new Uint8Array(await readFile(path));
  } catch (error: unknown) {
    if (hasErrorCode(error, "ENOENT")) {
      return null;
    }
    throw error;
  }
}

function runtimeRecordPath(runtimeRoot: string, relativePath: string): string {
  if (
    relativePath.length === 0 ||
    isAbsolute(relativePath) ||
    relativePath.includes("\\")
  ) {
    throw new TypeError("runtime record path must be product-relative");
  }
  const target = resolve(runtimeRoot, relativePath);
  const fromRoot = relative(runtimeRoot, target);
  if (
    fromRoot.length === 0 ||
    fromRoot === ".." ||
    fromRoot.startsWith(`..${sep}`) ||
    isAbsolute(fromRoot)
  ) {
    throw new TypeError("runtime record path escapes the runtime root");
  }
  return target;
}

export async function readNodeCanonicalJsonFile(
  absoluteFilePath: string,
  label = "JSON file"
): Promise<IJsonValue> {
  const path = absolutePath(absoluteFilePath, label);
  const bytes = await readFile(path);
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return admitIJsonText(text, label);
}

export async function loadNodePublicContractCatalog(
  absoluteCatalogPath: string
): Promise<PublicContractCatalog> {
  return admitPublicContractCatalog(
    await readNodeCanonicalJsonFile(
      absoluteCatalogPath,
      "installed public contract catalog"
    )
  );
}

export function createNodeWorkspacePathContext(input: {
  readonly targetRoot: string;
  readonly publicContractCatalog: PublicContractCatalog;
}): WorkspacePathContext {
  const targetRoot = absolutePath(input.targetRoot, "workspace root");
  return Object.freeze({
    kind: "workspace_path",
    targetRoot,
    publicContractCatalog: admitPublicContractCatalog(
      input.publicContractCatalog
    ),
    effects: Object.freeze({
      readBytes: readBytesOrNull,
      async writeBytes(path: string, bytes: Uint8Array): Promise<void> {
        await writeFile(absolutePath(path, "workspace write path"), bytes);
      },
      async makeDirectory(path: string): Promise<void> {
        await mkdir(absolutePath(path, "workspace directory"), {
          recursive: true
        });
      }
    })
  });
}

export function createNodeProductIntakeContext(input: {
  readonly publicContractCatalog: PublicContractCatalog;
  readonly temporaryRoot?: string;
  readonly environment?: Readonly<
    Partial<Record<"ABG_TOOLCHAIN_ROOT", string>>
  >;
}): ProductIntakeContext {
  return Object.freeze({
    kind: "product_intake",
    publicContractCatalog: admitPublicContractCatalog(
      input.publicContractCatalog
    ),
    effects: createNodeProductIntakeEffects({
      ...(input.temporaryRoot === undefined
        ? {}
        : { temporaryRoot: input.temporaryRoot }),
      ...(input.environment === undefined
        ? {}
        : { environment: input.environment })
    })
  });
}

async function readWorkspaceManifest(workspaceRoot: string) {
  return admitPublicSdkWorkspaceManifest(
    await readNodeCanonicalJsonFile(
      join(workspaceRoot, WORKSPACE_MANIFEST_RELATIVE_PATH),
      "workspace manifest"
    )
  );
}

function verificationRecordPath(record: InstalledProductRecord): string {
  return join(dirname(record.descriptorRecordPath), "verification-result.json");
}

export async function createNodeWorkspaceBindingContext(input: {
  readonly workspaceRoot: string;
  readonly publicContractCatalog: PublicContractCatalog;
  readonly installedProductRecords: readonly InstalledProductRecord[];
}): Promise<WorkspaceBindingContext> {
  const workspaceRoot = absolutePath(input.workspaceRoot, "workspace root");
  const workspaceManifest = await readWorkspaceManifest(workspaceRoot);
  const bindingPath = join(workspaceRoot, TOOLCHAIN_BINDING_RELATIVE_PATH);
  const installedRecords = new Map(
    input.installedProductRecords.map((record) => [
      record.installedProductId,
      record
    ])
  );
  return Object.freeze({
    kind: "workspace_binding",
    workspaceManifest,
    publicContractCatalog: admitPublicContractCatalog(
      input.publicContractCatalog
    ),
    effects: Object.freeze({
      async readBinding() {
        const bytes = await readBytesOrNull(bindingPath);
        if (bytes === null) {
          return null;
        }
        return admitToolchainWorkspaceBindingV3(
          admitIJsonText(
            new TextDecoder("utf-8", { fatal: true }).decode(bytes),
            "workspace binding"
          )
        );
      },
      async readInstalledProductRecord(installedProductId: string) {
        const supplied = installedRecords.get(installedProductId);
        if (supplied === undefined) {
          return null;
        }
        const value = await readNodeCanonicalJsonFile(
          verificationRecordPath(supplied),
          `verification record for ${installedProductId}`
        );
        const durable = admitProductVerificationRecord(value)
          .installedProductRecord;
        return durable.installedProductId === installedProductId
          ? durable
          : null;
      },
      async writeBinding(binding: ToolchainWorkspaceBindingV3) {
        await mkdir(dirname(bindingPath), { recursive: true });
        await writeFile(bindingPath, canonicalizeIJson(binding), "utf8");
      },
      async createMutableRoot(path: string) {
        await mkdir(absolutePath(path, "mutable state root"), {
          recursive: true
        });
      }
    })
  });
}

function filePathForInputRef(inputRef: string): string | null {
  if (isAbsolute(inputRef)) {
    return resolve(inputRef);
  }
  if (inputRef.startsWith("file://")) {
    return resolve(fileURLToPath(inputRef));
  }
  return null;
}

function contractForSteering(steering: TransportSteering) {
  const base = contractForKnownAgent(steering.agent);
  if (steering.model === null) {
    return base;
  }
  let argsTemplate: readonly string[];
  switch (steering.agent) {
    case "codex": {
      const modelIndex = base.argsTemplate.indexOf("--model");
      if (modelIndex < 0) {
        throw new TypeError("Codex transport contract has no model slot");
      }
      argsTemplate = Object.freeze(
        base.argsTemplate.map((value, index) =>
          index === modelIndex + 1 ? steering.model ?? value : value
        )
      );
      break;
    }
    case "claude":
    case "gemini":
      argsTemplate = Object.freeze([
        "--model",
        steering.model,
        ...base.argsTemplate
      ]);
      break;
    case "generic":
      throw new TypeError(
        "generic live transport does not publish a model-selection grammar"
      );
  }
  return constructAgentTransportContract({
    agentKey: base.agentKey,
    command: base.command,
    argsTemplate,
    sanitizedEnvironmentPolicy: base.sanitizedEnvironmentPolicy
  });
}

function assertExecutableCommand(command: string): void {
  const candidates = isAbsolute(command) || command.includes("/")
    ? [resolve(command)]
    : (process.env["PATH"] ?? "")
        .split(delimiter)
        .filter((entry) => entry.length > 0)
        .map((entry) => join(entry, command));
  for (const candidate of candidates) {
    try {
      accessSync(candidate, constants.X_OK);
      return;
    } catch {
      // Continue through the bounded PATH candidates.
    }
  }
  throw new TypeError(`live transport command is unavailable: ${command}`);
}

export function createNodeStandardLiveCapabilityFactory(): OperatorCapabilityFactory {
  return ({ workspaceRoot, archiveRoot, steering }) => {
    const agentContract = contractForSteering(steering);
    assertExecutableCommand(agentContract.command);
    const capability = Object.freeze({
      agentContract,
      archiveRoot,
      cwd: workspaceRoot,
      timeoutMs: steering.timeoutMs,
      executorProfile: steering.profile,
      ...(steering.profile === "pty-terminal"
        ? { terminalSessionKeyPrefix: "abg-live" }
        : {})
    });
    return constructLiveCapabilityBinding({
      workspaceRoot,
      agentKey: steering.agent,
      agentKeySource: "flag",
      executorProfile: steering.profile,
      executorProfileSource: "flag",
      timeoutMs: steering.timeoutMs,
      timeoutMsSource: "flag",
      pluginCapabilities: Object.freeze({
        liveFpDispatch: capability,
        liveFpEvaluator: capability
      })
    });
  };
}

export async function createNodeBoundWorkspaceContext(input: {
  readonly workspaceRoot: string;
  readonly publicContractCatalog: PublicContractCatalog;
  readonly operatorCapabilityFactories?: Readonly<
    Record<string, OperatorCapabilityFactory>
  >;
  readonly operatorCapabilityFactoriesBySteeringRef?: Readonly<
    Record<string, AdmittedSteeringCapabilityFactory>
  >;
}): Promise<BoundWorkspaceContext> {
  const workspaceRoot = absolutePath(input.workspaceRoot, "workspace root");
  const workspaceManifest = await readWorkspaceManifest(workspaceRoot);
  const binding = admitToolchainWorkspaceBindingV3(
    await readNodeCanonicalJsonFile(
      join(workspaceRoot, TOOLCHAIN_BINDING_RELATIVE_PATH),
      "workspace binding"
    )
  );
  const eventLogPath = binding.mutableStateRoots.eventLogPath;
  const runtimeRoot = absolutePath(
    binding.mutableStateRoots.runtimeRoot,
    "bound workspace runtime root"
  );
  const operatorCapabilityFactories = Object.freeze({
    [ABG_CATALOG_INVOKE_GRAPH_FUNCTION_CAPABILITY_REF]:
      createNodeStandardLiveCapabilityFactory(),
    ...(input.operatorCapabilityFactories ?? {})
  });
  return Object.freeze({
    kind: "bound_workspace",
    workspaceManifest,
    binding,
    publicContractCatalog: admitPublicContractCatalog(
      input.publicContractCatalog
    ),
    effects: Object.freeze({
      async readRecord(path: string) {
        try {
          return await readNodeCanonicalJsonFile(path, "bound product record");
        } catch (error: unknown) {
          if (hasErrorCode(error, "ENOENT")) {
            return null;
          }
          throw error;
        }
      },
      async readInputAsset(inputRef: string) {
        const inputPath = filePathForInputRef(inputRef);
        if (inputPath === null) {
          return null;
        }
        try {
          return await readNodeCanonicalJsonFile(inputPath, "invocation input asset");
        } catch (error: unknown) {
          if (hasErrorCode(error, "ENOENT")) {
            return null;
          }
          throw error;
        }
      },
      async writeImmutableRuntimeRecord(
        relativePath: string,
        value: IJsonValue
      ) {
        const target = runtimeRecordPath(runtimeRoot, relativePath);
        const content = canonicalizeIJson(value);
        await mkdir(dirname(target), { recursive: true });
        try {
          writeFileSync(target, content, { encoding: "utf8", flag: "wx" });
        } catch (error: unknown) {
          if (!hasErrorCode(error, "EEXIST")) {
            throw error;
          }
          const existing = await readFile(target, "utf8");
          if (existing !== content) {
            throw new TypeError(
              "immutable runtime record already exists with different content"
            );
          }
        }
      },
      async readRuntimeEventBytes() {
        return (await readBytesOrNull(eventLogPath)) ?? new Uint8Array();
      },
      createRuntimeEventSink() {
        return createRuntimeEventLogSink(eventLogPath).sink;
      },
      operatorCapabilityFactories,
      operatorCapabilityFactoriesBySteeringRef: Object.freeze({
        ...(input.operatorCapabilityFactoriesBySteeringRef ?? {})
      })
    })
  });
}
