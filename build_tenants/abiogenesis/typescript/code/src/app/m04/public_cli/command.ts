// Implements the singular ABIogenesis 5.0 source-blind abg.cli adapter.

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { CanonicalRuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
import {
  appendRuntimeEventsToLog,
  createRuntimeEventLogSink,
  type RuntimeEventLogSink
} from "../../../abg/m03/events/index.js";
import {
  admitWorkspaceRuntimeEventBytes
} from "../../../abg/m03/runner/public_runtime_projections.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  defaultToolchainMutableStateRoots
} from "../toolchain_binding/resolve.js";
import {
  abiogenesisPublicSdk,
  admitCatalogBindRequest,
  admitCatalogResolveRequest,
  admitCatalogVerifyRequest,
  admitInstallProductRequest,
  admitTransportSteering,
  canonicalizeIJson,
  createNodeBoundWorkspaceContext,
  createNodeProductIntakeContext,
  createNodeStandardLiveCapabilityFactory,
  createNodeWorkspaceBindingContext,
  createNodeWorkspacePathContext,
  loadNodePublicContractCatalog,
  readNodeCanonicalJsonFile,
  type AbiogenesisPublicSdk5,
  type AdmittedSteeringCapabilityFactory,
  type BoundWorkspaceContext,
  type CatalogBindRequest,
  type ProductIntakeContext,
  type PublicContractCatalog,
  type PublishedPublicOperationDefinitionMember,
  type WorkspaceBindingContext,
  type WorkspacePathContext
} from "../public_sdk/index.js";
import {
  assertAbiogenesisPublicInvocationCatalogBinding
} from "../public_sdk/sdk.js";

const INVOCATION_FLAG = "invocation";
const CONTRACT_CATALOG_FLAG = "contract-catalog";
const WORKSPACE_ROOT_FLAG = "workspace-root";
const OWNER_REQUEST_FLAG = "owner-request";
const IMPORT_AUTHORITY_FLAG = "import-authority";
const LIVE_STEERING_FILE_FLAG = "live-steering-file";
const ADAPTER_FLAGS = new Set([
  INVOCATION_FLAG,
  CONTRACT_CATALOG_FLAG,
  WORKSPACE_ROOT_FLAG,
  OWNER_REQUEST_FLAG,
  IMPORT_AUTHORITY_FLAG,
  LIVE_STEERING_FILE_FLAG
]);

export interface AbgCliIo {
  readonly cwd: () => string;
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
}

export interface AbgCliRuntime {
  readonly sdk: AbiogenesisPublicSdk5;
  readonly readCanonicalJsonFile: (
    absolutePath: string,
    label: string
  ) => Promise<unknown>;
  readonly readBytes: (absolutePath: string) => Promise<Uint8Array>;
  readonly loadPublicContractCatalog: (
    absolutePath: string
  ) => Promise<PublicContractCatalog>;
  readonly createWorkspacePathContext: (input: {
    readonly targetRoot: string;
    readonly publicContractCatalog: PublicContractCatalog;
  }) => WorkspacePathContext;
  readonly createProductIntakeContext: (input: {
    readonly publicContractCatalog: PublicContractCatalog;
  }) => ProductIntakeContext;
  readonly createWorkspaceBindingContext: (input: {
    readonly workspaceRoot: string;
    readonly publicContractCatalog: PublicContractCatalog;
    readonly installedProductRecords: CatalogBindRequest["installedProductRecords"];
  }) => Promise<WorkspaceBindingContext>;
  readonly createBoundWorkspaceContext: (input: {
    readonly workspaceRoot: string;
    readonly publicContractCatalog: PublicContractCatalog;
    readonly operatorCapabilityFactoriesBySteeringRef?: Readonly<
      Record<string, AdmittedSteeringCapabilityFactory>
    >;
  }) => Promise<BoundWorkspaceContext>;
  readonly appendRuntimeEvents: (
    eventLogPath: string,
    events: readonly CanonicalRuntimeEvent[]
  ) => void;
  readonly createRuntimeEventLog: (
    eventLogPath: string
  ) => RuntimeEventLogSink;
}

interface ParsedAbgCliCommand {
  readonly semanticArgv: readonly string[];
  readonly invocationPath: string;
  readonly contractCatalogPath: string;
  readonly workspaceRoot: string | null;
  readonly ownerRequestPath: string | null;
  readonly importAuthorityPath: string | null;
  readonly liveSteeringFilePath: string | null;
}

interface AdapterDiagnostic {
  readonly kind: "invalid_invocation" | "adapter_failure";
  readonly operationId: string | null;
  readonly message: string;
  readonly exitClassification: "invalid_invocation" | "adapter_failure";
}

type DefinitionKey = Readonly<{
  operationId: string;
  memberKind: "variant" | "project_read_case";
  member: string;
}>;

class AbgCliInputError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AbgCliInputError";
  }
}

function defaultRuntime(): AbgCliRuntime {
  return Object.freeze({
    sdk: abiogenesisPublicSdk,
    readCanonicalJsonFile: readNodeCanonicalJsonFile,
    async readBytes(absolutePath: string) {
      return new Uint8Array(await readFile(absolutePath));
    },
    loadPublicContractCatalog: loadNodePublicContractCatalog,
    createWorkspacePathContext: createNodeWorkspacePathContext,
    createProductIntakeContext: createNodeProductIntakeContext,
    createWorkspaceBindingContext: createNodeWorkspaceBindingContext,
    createBoundWorkspaceContext: createNodeBoundWorkspaceContext,
    appendRuntimeEvents: appendRuntimeEventsToLog,
    createRuntimeEventLog: createRuntimeEventLogSink
  });
}

function requiredFlag(
  flags: ReadonlyMap<string, string>,
  name: string
): string {
  const value = flags.get(name);
  if (value === undefined || value.length === 0) {
    throw new AbgCliInputError(`--${name} is required`);
  }
  return value;
}

function splitAdapterFlags(argv: readonly string[]): Readonly<{
  semanticArgv: readonly string[];
  flags: ReadonlyMap<string, string>;
}> {
  const semanticArgv: string[] = [];
  const flags = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === undefined || !token.startsWith("--")) {
      if (token !== undefined) semanticArgv.push(token);
      continue;
    }
    const name = token.slice(2);
    if (!ADAPTER_FLAGS.has(name)) {
      semanticArgv.push(token);
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new AbgCliInputError(`--${name} requires one explicit value`);
    }
    if (flags.has(name)) {
      throw new AbgCliInputError(`duplicate --${name}`);
    }
    flags.set(name, value);
    index += 1;
  }
  return Object.freeze({
    semanticArgv: Object.freeze(semanticArgv),
    flags
  });
}

function parseCommand(
  argv: readonly string[],
  cwd: string
): ParsedAbgCliCommand {
  const parsed = splitAdapterFlags(argv);
  if (parsed.semanticArgv.length === 0) {
    throw new AbgCliInputError("a published abg.cli command is required");
  }
  const optionalPath = (name: string): string | null => {
    const value = parsed.flags.get(name);
    return value === undefined ? null : resolve(cwd, value);
  };
  return Object.freeze({
    semanticArgv: parsed.semanticArgv,
    invocationPath: resolve(
      cwd,
      requiredFlag(parsed.flags, INVOCATION_FLAG)
    ),
    contractCatalogPath: resolve(
      cwd,
      requiredFlag(parsed.flags, CONTRACT_CATALOG_FLAG)
    ),
    workspaceRoot: optionalPath(WORKSPACE_ROOT_FLAG),
    ownerRequestPath: optionalPath(OWNER_REQUEST_FLAG),
    importAuthorityPath: optionalPath(IMPORT_AUTHORITY_FLAG),
    liveSteeringFilePath: optionalPath(LIVE_STEERING_FILE_FLAG)
  });
}

function exactSha256(input: unknown, label: string): `sha256:${string}` {
  if (typeof input !== "string" || !/^sha256:[0-9a-f]{64}$/u.test(input)) {
    throw new AbgCliInputError(`${label} must be a sha256 digest`);
  }
  return input as `sha256:${string}`;
}

function runInvokeSteeringCoordinate(rawInvocation: unknown): Readonly<{
  steeringRef: string;
  steeringDigest: `sha256:${string}`;
}> {
  const authority = ownValue(rawInvocation, "authority");
  const steering = ownValue(authority, "transportSteering");
  if (ownValue(steering, "state") !== "declared_transport_steering") {
    throw new AbgCliInputError(
      "run.invoke live steering requires declared transport-steering authority"
    );
  }
  return Object.freeze({
    steeringRef: nonEmptyText(
      ownValue(steering, "steeringRef"),
      "invocation.authority.transportSteering.steeringRef"
    ),
    steeringDigest: exactSha256(
      ownValue(steering, "steeringDigest"),
      "invocation.authority.transportSteering.steeringDigest"
    )
  });
}

async function prepareLiveSteeringFactories(input: {
  readonly command: ParsedAbgCliCommand;
  readonly key: DefinitionKey;
  readonly rawInvocation: unknown;
  readonly runtime: AbgCliRuntime;
}): Promise<Readonly<
  Record<string, AdmittedSteeringCapabilityFactory>
> | undefined> {
  const path = input.command.liveSteeringFilePath;
  if (path === null) return undefined;
  if (input.key.operationId !== "abg.operation.run.invoke") {
    throw new AbgCliInputError(
      "--live-steering-file is valid only for abg.operation.run.invoke"
    );
  }
  const coordinate = runInvokeSteeringCoordinate(input.rawInvocation);
  const steering = admitTransportSteering(
    await input.runtime.readCanonicalJsonFile(
      path,
      "run.invoke live steering file"
    ),
    "run.invoke live steering file"
  );
  const steeringDigest = stableSha256Digest(steering);
  if (
    coordinate.steeringDigest !== steeringDigest ||
    coordinate.steeringRef !== `steering:${steeringDigest}`
  ) {
    throw new AbgCliInputError(
      "run.invoke live steering body differs from admitted authority"
    );
  }
  const standardFactory = createNodeStandardLiveCapabilityFactory();
  const factory: AdmittedSteeringCapabilityFactory = (factoryInput) => {
    if (
      factoryInput.steeringRef !== coordinate.steeringRef ||
      factoryInput.steeringDigest !== coordinate.steeringDigest
    ) {
      throw new AbgCliInputError(
        "run.invoke live steering factory identity differs from admitted authority"
      );
    }
    return standardFactory({
      workspaceRoot: factoryInput.workspaceRoot,
      archiveRoot: factoryInput.archiveRoot,
      steering
    });
  };
  return Object.freeze({ [coordinate.steeringRef]: factory });
}

function ownValue(input: unknown, key: PropertyKey): unknown {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(input, key);
  return descriptor !== undefined && "value" in descriptor
    ? descriptor.value
    : undefined;
}

function nonEmptyText(input: unknown, label: string): string {
  if (typeof input !== "string" || input.length === 0) {
    throw new AbgCliInputError(`${label} must be a non-empty string`);
  }
  return input;
}

function invocationDefinitionKey(rawInvocation: unknown): DefinitionKey {
  const rawKey = ownValue(rawInvocation, "definitionKey");
  const operationId = nonEmptyText(
    ownValue(rawKey, "operationId"),
    "invocation.definitionKey.operationId"
  );
  const memberKind = ownValue(rawKey, "memberKind");
  if (memberKind === "variant") {
    return Object.freeze({
      operationId,
      memberKind,
      member: nonEmptyText(
        ownValue(rawKey, "variant"),
        "invocation.definitionKey.variant"
      )
    });
  }
  if (memberKind === "project_read_case") {
    return Object.freeze({
      operationId,
      memberKind,
      member: nonEmptyText(
        ownValue(rawKey, "caseKey"),
        "invocation.definitionKey.caseKey"
      )
    });
  }
  throw new AbgCliInputError(
    "invocation.definitionKey.memberKind is not published"
  );
}

function definitionMember(
  catalog: PublicContractCatalog,
  key: DefinitionKey
): PublishedPublicOperationDefinitionMember {
  const rows = catalog.rows.filter(
    (row) => row.contractId === key.operationId
  );
  const row = rows[0];
  if (
    rows.length !== 1 ||
    row?.operationContract?.kind !==
      "abg_public_operation_definition_family"
  ) {
    throw new AbgCliInputError(
      `invocation selects unpublished operation ${key.operationId}`
    );
  }
  const definitions = row.operationContract.definitions.filter((definition) => {
    const definitionKey = definition.definitionKey;
    const member = definitionKey.memberKind === "variant"
      ? definitionKey.variant
      : definitionKey.caseKey;
    return definitionKey.memberKind === key.memberKind && member === key.member;
  });
  const definition = definitions[0];
  if (definitions.length !== 1 || definition === undefined) {
    throw new AbgCliInputError(
      `invocation selects unpublished definition ${key.operationId}/${key.member}`
    );
  }
  return definition;
}

function assertDefinitionDigest(
  rawInvocation: unknown,
  definition: PublishedPublicOperationDefinitionMember
): void {
  if (
    ownValue(rawInvocation, "definitionDigest") !== definition.definitionDigest
  ) {
    throw new AbgCliInputError(
      "invocation definition digest differs from the published family"
    );
  }
}

function assertCliCoordinate(
  semanticArgv: readonly string[],
  definition: PublishedPublicOperationDefinitionMember,
  member: string
): void {
  const coordinate = definition.cliCoordinate.split(/\s+/u);
  if (coordinate.length !== semanticArgv.length) {
    throw new AbgCliInputError(
      `command does not match published coordinate ${definition.cliCoordinate}`
    );
  }
  for (let index = 0; index < coordinate.length; index += 1) {
    const expected = coordinate[index];
    const actual = semanticArgv[index];
    if (expected === undefined || actual === undefined) {
      throw new AbgCliInputError("command coordinate is incomplete");
    }
    if (/^<[^>]+>$/u.test(expected)) {
      if (actual !== member) {
        throw new AbgCliInputError(
          `command member ${actual} differs from invocation member ${member}`
        );
      }
    } else if (expected !== actual) {
      throw new AbgCliInputError(
        `command does not match published coordinate ${definition.cliCoordinate}`
      );
    }
  }
}

function workspaceRoot(command: ParsedAbgCliCommand): string {
  if (command.workspaceRoot === null) {
    throw new AbgCliInputError("--workspace-root is required");
  }
  return command.workspaceRoot;
}

function assertNoAdapterFiles(
  command: ParsedAbgCliCommand,
  allowed: readonly ("owner" | "import")[]
): void {
  if (command.ownerRequestPath !== null && !allowed.includes("owner")) {
    throw new AbgCliInputError("--owner-request is not valid for this definition");
  }
  if (command.importAuthorityPath !== null && !allowed.includes("import")) {
    throw new AbgCliInputError(
      "--import-authority is not valid for this definition"
    );
  }
}

async function priorEventsForBoundContext(
  context: BoundWorkspaceContext
): Promise<readonly CanonicalRuntimeEvent[]> {
  return admitWorkspaceRuntimeEventBytes(
    await context.effects.readRuntimeEventBytes()
  ).orderedEvents;
}

async function priorEventsFromFile(
  runtime: AbgCliRuntime,
  path: string
): Promise<readonly CanonicalRuntimeEvent[]> {
  try {
    return admitWorkspaceRuntimeEventBytes(
      await runtime.readBytes(path)
    ).orderedEvents;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return Object.freeze([]);
    }
    throw error;
  }
}

async function invokeWorkspaceCreate(input: {
  readonly command: ParsedAbgCliCommand;
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
  readonly definition: PublishedPublicOperationDefinitionMember;
  readonly key: DefinitionKey;
  readonly runtime: AbgCliRuntime;
}) {
  assertNoAdapterFiles(input.command, ["import"]);
  if (
    input.key.member === "clean" &&
    input.command.importAuthorityPath !== null
  ) {
    throw new AbgCliInputError(
      "workspace.create clean forbids --import-authority"
    );
  }
  if (
    input.key.member === "imported" &&
    input.command.importAuthorityPath === null
  ) {
    throw new AbgCliInputError(
      "workspace.create imported requires --import-authority"
    );
  }
  const root = workspaceRoot(input.command);
  const eventLogPath = defaultToolchainMutableStateRoots({
    targetRoot: root
  }).eventLogPath;
  const bufferedEvents: CanonicalRuntimeEvent[] = [];
  let outcome;
  try {
    outcome = await input.runtime.sdk.invoke({
      rawInvocation: input.rawInvocation,
      execution: {
        kind: "workspace_path",
        context: input.runtime.createWorkspacePathContext({
          targetRoot: root,
          publicContractCatalog: input.catalog
        }),
        priorEvents: Object.freeze([]),
        eventSink(event) {
          bufferedEvents.push(event);
        },
        ...(input.command.importAuthorityPath === null
          ? {}
          : {
              importAuthorityBytes: await input.runtime.readBytes(
                input.command.importAuthorityPath
              )
            })
      }
    });
  } finally {
    if (
      bufferedEvents.some(
        (event) => event.kind === "public_operation_artifact_admitted"
      )
    ) {
      input.runtime.appendRuntimeEvents(eventLogPath, bufferedEvents);
      await priorEventsFromFile(input.runtime, eventLogPath);
    }
  }
  return outcome;
}

async function invokeProductResolve(input: {
  readonly command: ParsedAbgCliCommand;
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
  readonly runtime: AbgCliRuntime;
}) {
  assertNoAdapterFiles(input.command, ["owner"]);
  if (input.command.ownerRequestPath === null) {
    throw new AbgCliInputError("product.resolve requires --owner-request");
  }
  return await input.runtime.sdk.invoke({
    rawInvocation: input.rawInvocation,
    execution: {
      kind: "product_resolve",
      context: input.runtime.createProductIntakeContext({
        publicContractCatalog: input.catalog
      }),
      ownerRequest: admitCatalogResolveRequest(
        await input.runtime.readCanonicalJsonFile(
          input.command.ownerRequestPath,
          "product.resolve owner request"
        )
      ),
      priorEvents: Object.freeze([])
    }
  });
}

async function invokeProductVerify(input: {
  readonly command: ParsedAbgCliCommand;
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
  readonly runtime: AbgCliRuntime;
}) {
  assertNoAdapterFiles(input.command, ["owner"]);
  if (input.command.ownerRequestPath === null) {
    throw new AbgCliInputError("product.verify requires --owner-request");
  }
  return await input.runtime.sdk.invoke({
    rawInvocation: input.rawInvocation,
    execution: {
      kind: "product_verify",
      context: input.runtime.createProductIntakeContext({
        publicContractCatalog: input.catalog
      }),
      ownerRequest: admitCatalogVerifyRequest(
        await input.runtime.readCanonicalJsonFile(
          input.command.ownerRequestPath,
          "product.verify owner request"
        )
      ),
      priorEvents: Object.freeze([])
    }
  });
}

async function invokeProductInstall(input: {
  readonly command: ParsedAbgCliCommand;
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
  readonly runtime: AbgCliRuntime;
}) {
  assertNoAdapterFiles(input.command, ["owner"]);
  if (input.command.ownerRequestPath === null) {
    throw new AbgCliInputError("product.install requires --owner-request");
  }
  const root = workspaceRoot(input.command);
  const eventLogPath = defaultToolchainMutableStateRoots({
    targetRoot: root
  }).eventLogPath;
  return await input.runtime.sdk.invoke({
    rawInvocation: input.rawInvocation,
    execution: {
      kind: "product_install",
      context: input.runtime.createProductIntakeContext({
        publicContractCatalog: input.catalog
      }),
      ownerRequest: admitInstallProductRequest(
        await input.runtime.readCanonicalJsonFile(
          input.command.ownerRequestPath,
          "product.install owner request"
        )
      ),
      priorEvents: await priorEventsFromFile(input.runtime, eventLogPath),
      eventSink: input.runtime.createRuntimeEventLog(eventLogPath).sink
    }
  });
}

async function invokeWorkspaceBind(input: {
  readonly command: ParsedAbgCliCommand;
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
  readonly runtime: AbgCliRuntime;
}) {
  assertNoAdapterFiles(input.command, ["owner"]);
  if (input.command.ownerRequestPath === null) {
    throw new AbgCliInputError("workspace.bind requires --owner-request");
  }
  const root = workspaceRoot(input.command);
  const ownerRequest = admitCatalogBindRequest(
    await input.runtime.readCanonicalJsonFile(
      input.command.ownerRequestPath,
      "workspace.bind owner request"
    )
  );
  const eventLogPath = ownerRequest.mutableStateRoots?.eventLogPath ??
    defaultToolchainMutableStateRoots({ targetRoot: root }).eventLogPath;
  const priorEvents = await priorEventsFromFile(input.runtime, eventLogPath);
  const eventLog = input.runtime.createRuntimeEventLog(eventLogPath);
  const outcome = await input.runtime.sdk.invoke({
    rawInvocation: input.rawInvocation,
    execution: {
      kind: "workspace_binding",
      context: await input.runtime.createWorkspaceBindingContext({
        workspaceRoot: root,
        publicContractCatalog: input.catalog,
        installedProductRecords: ownerRequest.installedProductRecords
      }),
      ownerRequest,
      priorEvents,
      eventSink: eventLog.sink
    }
  });
  await priorEventsFromFile(input.runtime, eventLogPath);
  return outcome;
}

async function invokeProjectRead(input: {
  readonly command: ParsedAbgCliCommand;
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
  readonly runtime: AbgCliRuntime;
}) {
  assertNoAdapterFiles(input.command, []);
  const context = await input.runtime.createBoundWorkspaceContext({
    workspaceRoot: workspaceRoot(input.command),
    publicContractCatalog: input.catalog
  });
  return await input.runtime.sdk.invoke({
    rawInvocation: input.rawInvocation,
    execution: {
      kind: "bound_workspace",
      context,
      priorEvents: await priorEventsForBoundContext(context)
    }
  });
}

async function invokeBoundWorkspaceWrite(input: {
  readonly command: ParsedAbgCliCommand;
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
  readonly runtime: AbgCliRuntime;
  readonly liveSteeringFactories?: Readonly<
    Record<string, AdmittedSteeringCapabilityFactory>
  >;
}) {
  assertNoAdapterFiles(input.command, []);
  const context = await input.runtime.createBoundWorkspaceContext({
    workspaceRoot: workspaceRoot(input.command),
    publicContractCatalog: input.catalog,
    ...(input.liveSteeringFactories === undefined
      ? {}
      : {
          operatorCapabilityFactoriesBySteeringRef:
            input.liveSteeringFactories
        })
  });
  const priorEvents = await priorEventsForBoundContext(context);
  const outcome = await input.runtime.sdk.invoke({
    rawInvocation: input.rawInvocation,
    execution: {
      kind: "bound_workspace_write",
      context,
      priorEvents,
      eventSink: context.effects.createRuntimeEventSink()
    }
  });
  await priorEventsForBoundContext(context);
  return outcome;
}

async function invokeCatalogView(input: {
  readonly command: ParsedAbgCliCommand;
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
  readonly runtime: AbgCliRuntime;
}) {
  assertNoAdapterFiles(input.command, []);
  const context = await input.runtime.createBoundWorkspaceContext({
    workspaceRoot: workspaceRoot(input.command),
    publicContractCatalog: input.catalog
  });
  return await input.runtime.sdk.invoke({
    rawInvocation: input.rawInvocation,
    execution: {
      kind: "bound_workspace",
      context,
      priorEvents: await priorEventsForBoundContext(context)
    }
  });
}

async function invokeSdk(input: {
  readonly command: ParsedAbgCliCommand;
  readonly rawInvocation: unknown;
  readonly catalog: PublicContractCatalog;
  readonly definition: PublishedPublicOperationDefinitionMember;
  readonly key: DefinitionKey;
  readonly runtime: AbgCliRuntime;
  readonly liveSteeringFactories?: Readonly<
    Record<string, AdmittedSteeringCapabilityFactory>
  >;
}) {
  if (input.key.operationId === "abg.operation.workspace.create") {
    return await invokeWorkspaceCreate(input);
  }
  if (input.key.operationId === "abg.operation.product.resolve") {
    return await invokeProductResolve(input);
  }
  if (input.key.operationId === "abg.operation.product.verify") {
    return await invokeProductVerify(input);
  }
  if (input.key.operationId === "abg.operation.product.install") {
    return await invokeProductInstall(input);
  }
  if (input.key.operationId === "abg.operation.workspace.bind") {
    return await invokeWorkspaceBind(input);
  }
  if (
    input.key.operationId === "abg.operation.project.read" &&
    input.definition.authoritySlotRequirements.workspace === "exactly_one"
  ) {
    return await invokeProjectRead(input);
  }
  if (input.key.operationId === "abg.operation.catalog.admit") {
    return await invokeBoundWorkspaceWrite(input);
  }
  if (input.key.operationId === "abg.operation.catalog.view") {
    return await invokeCatalogView(input);
  }
  if (input.key.operationId === "abg.operation.catalog.apply") {
    return await invokeBoundWorkspaceWrite(input);
  }
  if (input.key.operationId === "abg.operation.run.invoke") {
    return await invokeBoundWorkspaceWrite(input);
  }
  if (input.key.operationId === "abg.operation.result.assess") {
    return await invokeBoundWorkspaceWrite(input);
  }
  throw new Error(
    `public SDK owner is not connected for ${input.key.operationId}/${input.key.member}`
  );
}

function exitCodeForOutcome(
  outcome: Awaited<ReturnType<AbiogenesisPublicSdk5["invoke"]>>,
  definition: PublishedPublicOperationDefinitionMember
): number {
  switch (outcome.outcomeKind) {
    case "result":
      return definition.adapterExitMap.acceptedTerminal;
    case "refusal":
      return definition.adapterExitMap.refused;
    case "nonterminal":
      return definition.adapterExitMap.acceptedNonTerminal ??
        definition.adapterExitMap.adapterFailure;
  }
}

function diagnostic(input: AdapterDiagnostic): string {
  return `${canonicalizeIJson(input)}\n`;
}

export async function runAbgCli(
  argv: readonly string[],
  io: AbgCliIo,
  runtime: AbgCliRuntime = defaultRuntime()
): Promise<number> {
  let operationId: string | null = null;
  let definition: PublishedPublicOperationDefinitionMember | null = null;
  let dispatchStarted = false;
  try {
    const command = parseCommand(argv, io.cwd());
    const catalog = await runtime.loadPublicContractCatalog(
      command.contractCatalogPath
    );
    const rawInvocation = await runtime.readCanonicalJsonFile(
      command.invocationPath,
      "public invocation"
    );
    const key = invocationDefinitionKey(rawInvocation);
    operationId = key.operationId;
    assertAbiogenesisPublicInvocationCatalogBinding({
      rawInvocation,
      catalog
    });
    definition = definitionMember(catalog, key);
    assertDefinitionDigest(rawInvocation, definition);
    assertCliCoordinate(command.semanticArgv, definition, key.member);
    const liveSteeringFactories = await prepareLiveSteeringFactories({
      command,
      key,
      rawInvocation,
      runtime
    });
    dispatchStarted = true;
    const outcome = await invokeSdk({
      command,
      rawInvocation,
      catalog,
      definition,
      key,
      runtime,
      ...(liveSteeringFactories === undefined
        ? {}
        : { liveSteeringFactories })
    });
    io.stdout(`${canonicalizeIJson(outcome)}\n`);
    return exitCodeForOutcome(outcome, definition);
  } catch (error: unknown) {
    const debugIssues =
      error instanceof Error && "issues" in error
        ? JSON.stringify(error.issues)
        : null;
    const message =
      process.env["ABG_DEBUG_STACK"] === "1" && error instanceof Error
        ? `${error.stack ?? error.message}${
            debugIssues === null ? "" : `\nissues=${debugIssues}`
          }`
        : error instanceof Error ? error.message : String(error);
    const kind = dispatchStarted ? "adapter_failure" : "invalid_invocation";
    io.stderr(diagnostic({
      kind,
      operationId,
      message,
      exitClassification: kind
    }));
    if (definition === null) {
      return kind === "invalid_invocation" ? 2 : 70;
    }
    return kind === "invalid_invocation"
      ? definition.adapterExitMap.invalidInvocation
      : definition.adapterExitMap.adapterFailure;
  }
}
