// Implements: T-223 DS-1 source-blind abg.cli adapter
// Implements: REQ-P-POLICY, REQ-P-PUBLIC-CONTRACTS

import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

import {
  abiogenesisPublicSdk,
  admitDs1OperationRequest,
  canonicalizeIJson,
  constructPublicOperationInvocation,
  createNodeBoundWorkspaceContext,
  createNodeProductIntakeContext,
  createNodeWorkspaceBindingContext,
  createNodeWorkspacePathContext,
  loadNodePublicContractCatalog,
  readNodeCanonicalJsonFile,
  resolvePublicOperationContract,
  type AbiogenesisPublicSdk,
  type AnyPublicOperationInvocationEnvelope,
  type BoundWorkspaceContext,
  type CatalogBindRequest,
  type ProductIntakeContext,
  type PublicContractCatalog,
  type PublicOperationId,
  type PublicOperationOutcome,
  type WorkspaceBindingContext,
  type WorkspacePathContext
} from "../public_sdk/index.js";

const REQUEST_FLAG = "request";
const CONTRACT_CATALOG_FLAG = "contract-catalog";
const WORKSPACE_ROOT_FLAG = "workspace-root";
const ACTOR_FLAG = "actor";

export interface AbgCliIo {
  readonly cwd: () => string;
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
}

export interface AbgCliRuntime {
  readonly sdk: AbiogenesisPublicSdk;
  readonly readCanonicalJsonFile: (
    absolutePath: string,
    label: string
  ) => Promise<unknown>;
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
  }) => Promise<BoundWorkspaceContext>;
}

interface ParsedAbgCliCommand {
  readonly operationId: PublicOperationId;
  readonly requestPath: string;
  readonly contractCatalogPath: string;
  readonly workspaceRoot: string | null;
  readonly actorRef: string | null;
}

interface AdapterDiagnostic {
  readonly kind: "invalid_invocation" | "adapter_failure";
  readonly operationId: PublicOperationId | null;
  readonly message: string;
  readonly exitClassification: "invalid_invocation" | "adapter_failure";
}

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
    loadPublicContractCatalog: loadNodePublicContractCatalog,
    createWorkspacePathContext: createNodeWorkspacePathContext,
    createProductIntakeContext: createNodeProductIntakeContext,
    createWorkspaceBindingContext: createNodeWorkspaceBindingContext,
    createBoundWorkspaceContext: createNodeBoundWorkspaceContext
  });
}

export function resolveAbgCliOperationId(
  command: string,
  subcommand: string | null
): PublicOperationId {
  if (command === "workspace") {
    if (subcommand === "create") {
      return "abg.operation.workspace.create";
    }
    if (subcommand === "open") {
      return "abg.operation.workspace.open";
    }
  }
  if (command === "catalog") {
    switch (subcommand) {
      case "resolve":
        return "abg.operation.catalog.resolve";
      case "verify":
        return "abg.operation.catalog.verify";
      case "bind":
        return "abg.operation.catalog.bind";
      case "admit":
        return "abg.operation.catalog.admit";
      case "list":
        return "abg.operation.catalog.list";
      case "describe":
        return "abg.operation.catalog.describe";
      case "allow":
        return "abg.operation.catalog.allow";
      case "invoke":
        return "abg.operation.catalog.invoke";
      case null:
      default:
        break;
    }
  }
  if (subcommand === null) {
    if (command === "install") {
      return "abg.operation.install.install";
    }
    if (command === "result") {
      return "abg.operation.read.result";
    }
    if (command === "replay") {
      return "abg.operation.read.replay";
    }
  }
  throw new AbgCliInputError("command is outside the DS-1 abg.cli grammar");
}

function commandWordCount(command: string): number {
  return command === "workspace" || command === "catalog" ? 2 : 1;
}

function operationNeedsWorkspace(operationId: PublicOperationId): boolean {
  return (
    operationId === "abg.operation.workspace.create" ||
    operationId === "abg.operation.workspace.open" ||
    operationId === "abg.operation.catalog.bind" ||
    operationId === "abg.operation.catalog.admit" ||
    operationId === "abg.operation.catalog.list" ||
    operationId === "abg.operation.catalog.describe" ||
    operationId === "abg.operation.catalog.allow" ||
    operationId === "abg.operation.catalog.invoke" ||
    operationId === "abg.operation.read.result" ||
    operationId === "abg.operation.read.replay"
  );
}

function parseFlags(argv: readonly string[]): ReadonlyMap<string, string> {
  const parsed = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (
      flag === undefined ||
      value === undefined ||
      !flag.startsWith("--") ||
      flag.length <= 2 ||
      value.startsWith("--")
    ) {
      throw new AbgCliInputError("flags require one explicit value each");
    }
    const name = flag.slice(2);
    if (parsed.has(name)) {
      throw new AbgCliInputError(`duplicate --${name}`);
    }
    parsed.set(name, value);
  }
  return parsed;
}

function requiredFlag(flags: ReadonlyMap<string, string>, name: string): string {
  const value = flags.get(name);
  if (value === undefined || value.length === 0) {
    throw new AbgCliInputError(`--${name} is required`);
  }
  return value;
}

function parseCommand(
  argv: readonly string[],
  cwd: string
): ParsedAbgCliCommand {
  const command = argv[0];
  if (command === undefined) {
    throw new AbgCliInputError("a DS-1 command is required");
  }
  const wordCount = commandWordCount(command);
  const subcommand = wordCount === 2 ? argv[1] ?? null : null;
  const operationId = resolveAbgCliOperationId(command, subcommand);
  const flags = parseFlags(argv.slice(wordCount));
  const allowed = new Set([REQUEST_FLAG, CONTRACT_CATALOG_FLAG]);
  if (operationNeedsWorkspace(operationId)) {
    allowed.add(WORKSPACE_ROOT_FLAG);
  }
  for (const name of flags.keys()) {
    if (!allowed.has(name) && name !== ACTOR_FLAG) {
      throw new AbgCliInputError(`--${name} is not valid for ${operationId}`);
    }
  }
  return Object.freeze({
    operationId,
    requestPath: resolve(cwd, requiredFlag(flags, REQUEST_FLAG)),
    contractCatalogPath: resolve(
      cwd,
      requiredFlag(flags, CONTRACT_CATALOG_FLAG)
    ),
    workspaceRoot: operationNeedsWorkspace(operationId)
      ? resolve(cwd, requiredFlag(flags, WORKSPACE_ROOT_FLAG))
      : null,
    actorRef: flags.get(ACTOR_FLAG) ?? null
  });
}

export function constructAbgCliInvocation(input: {
  readonly operationId: PublicOperationId;
  readonly request: unknown;
  readonly publicContractCatalog: PublicContractCatalog;
  readonly actorRef: string | null;
  readonly identity?: string;
}): AnyPublicOperationInvocationEnvelope {
  const identity = input.identity ?? randomUUID();
  const common = Object.freeze({
    publicContractCatalog: input.publicContractCatalog,
    invocationId: `abg-cli-invocation:${identity}`,
    requestId: `abg-cli-request:${identity}`,
    actorRef: input.actorRef,
    adapter: Object.freeze({ kind: "abg_cli", ref: "abg.cli" }),
    provenanceRefs: Object.freeze([]),
    correlationId: `abg-cli-invocation:${identity}`
  });
  const requestLabel = `${input.operationId}.request`;
  switch (input.operationId) {
    case "abg.operation.workspace.create":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.workspace.open":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.catalog.resolve":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.catalog.verify":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.install.install":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.catalog.bind":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.catalog.admit":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.catalog.list":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.catalog.describe":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.catalog.allow":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.catalog.invoke":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.read.result":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
    case "abg.operation.read.replay":
      return constructPublicOperationInvocation({
        ...common,
        operationId: input.operationId,
        request: admitDs1OperationRequest(input.operationId, input.request, requestLabel)
      });
  }
}

function workspaceRoot(command: ParsedAbgCliCommand): string {
  if (command.workspaceRoot === null) {
    throw new AbgCliInputError(
      `${command.operationId} requires an explicit workspace root`
    );
  }
  return command.workspaceRoot;
}

async function invokeSdk(input: {
  readonly command: ParsedAbgCliCommand;
  readonly invocation: AnyPublicOperationInvocationEnvelope;
  readonly catalog: PublicContractCatalog;
  readonly runtime: AbgCliRuntime;
}): Promise<PublicOperationOutcome<PublicOperationId>> {
  const invocation = input.invocation;
  switch (invocation.operationId) {
    case "abg.operation.workspace.create":
      return await input.runtime.sdk.workspaceCreate(
        input.runtime.createWorkspacePathContext({
          targetRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.workspace.open":
      return await input.runtime.sdk.workspaceOpen(
        input.runtime.createWorkspacePathContext({
          targetRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.catalog.resolve":
      return await input.runtime.sdk.catalogResolve(
        input.runtime.createProductIntakeContext({
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.catalog.verify":
      return await input.runtime.sdk.catalogVerify(
        input.runtime.createProductIntakeContext({
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.install.install":
      return await input.runtime.sdk.installProduct(
        input.runtime.createProductIntakeContext({
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.catalog.bind":
      return await input.runtime.sdk.catalogBind(
        await input.runtime.createWorkspaceBindingContext({
          workspaceRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog,
          installedProductRecords: invocation.request.installedProductRecords
        }),
        invocation
      );
    case "abg.operation.catalog.admit":
      return await input.runtime.sdk.catalogAdmit(
        await input.runtime.createBoundWorkspaceContext({
          workspaceRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.catalog.list":
      return await input.runtime.sdk.catalogList(
        await input.runtime.createBoundWorkspaceContext({
          workspaceRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.catalog.describe":
      return await input.runtime.sdk.catalogDescribe(
        await input.runtime.createBoundWorkspaceContext({
          workspaceRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.catalog.allow":
      return await input.runtime.sdk.catalogAllow(
        await input.runtime.createBoundWorkspaceContext({
          workspaceRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.catalog.invoke":
      return await input.runtime.sdk.catalogInvoke(
        await input.runtime.createBoundWorkspaceContext({
          workspaceRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.read.result":
      return await input.runtime.sdk.readResult(
        await input.runtime.createBoundWorkspaceContext({
          workspaceRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog
        }),
        invocation
      );
    case "abg.operation.read.replay":
      return await input.runtime.sdk.readReplay(
        await input.runtime.createBoundWorkspaceContext({
          workspaceRoot: workspaceRoot(input.command),
          publicContractCatalog: input.catalog
        }),
        invocation
      );
  }
}

function exitCodeForOutcome(
  outcome: PublicOperationOutcome<PublicOperationId>,
  catalog: PublicContractCatalog
): number {
  const operation = resolvePublicOperationContract(
    catalog,
    outcome.operationId
  ).row.operationContract;
  if (operation === null) {
    return 70;
  }
  switch (outcome.exitClassification) {
    case "accepted_terminal":
      return operation.adapterExitMap.acceptedTerminal;
    case "accepted_non_terminal":
      return operation.adapterExitMap.acceptedNonTerminal ?? 70;
    case "refused":
      return operation.adapterExitMap.refused;
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
  let command: ParsedAbgCliCommand | null = null;
  let catalog: PublicContractCatalog | null = null;
  let invocationAdmitted = false;
  try {
    command = parseCommand(argv, io.cwd());
    catalog = await runtime.loadPublicContractCatalog(
      command.contractCatalogPath
    );
    const request = await runtime.readCanonicalJsonFile(
      command.requestPath,
      `${command.operationId} request`
    );
    const invocation = constructAbgCliInvocation({
      operationId: command.operationId,
      request,
      publicContractCatalog: catalog,
      actorRef: command.actorRef
    });
    invocationAdmitted = true;
    const outcome = await invokeSdk({ command, invocation, catalog, runtime });
    io.stdout(`${canonicalizeIJson(outcome)}\n`);
    return exitCodeForOutcome(outcome, catalog);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (!invocationAdmitted) {
      io.stderr(diagnostic({
        kind: "invalid_invocation",
        operationId: command?.operationId ?? null,
        message,
        exitClassification: "invalid_invocation"
      }));
      return catalog === null || command === null
        ? 2
        : resolvePublicOperationContract(catalog, command.operationId)
            .row.operationContract?.adapterExitMap.invalidInvocation ?? 2;
    }
    io.stderr(diagnostic({
      kind: "adapter_failure",
      operationId: command?.operationId ?? null,
      message,
      exitClassification: "adapter_failure"
    }));
    return catalog === null || command === null
      ? 70
      : resolvePublicOperationContract(catalog, command.operationId)
          .row.operationContract?.adapterExitMap.adapterFailure ?? 70;
  }
}
