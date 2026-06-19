import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { delimiter, dirname, isAbsolute, join } from "node:path";
import { deriveSdlcConformProjectProfileFromWorkspace } from "../workspace/index.js";

type JsonRecord = Record<string, unknown>;

interface DeclaredToolEnvironment {
  readonly directories: readonly string[];
  readonly environmentVariables: Readonly<Record<string, string>>;
}

const TENANT_STACK_SPEC_FILENAMES = Object.freeze([
  "TECH_STACK.json",
  "TESTING_TECH_STACK.json",
  "EXECUTION_CONTRACT.json"
] as const);

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function objectRecord(value: unknown): JsonRecord | null {
  return isJsonRecord(value) ? value : null;
}

function stringFromUnknown(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  const record = objectRecord(value);
  if (record !== null && typeof record["value"] === "string") {
    return stringFromUnknown(record["value"]);
  }
  return null;
}

function stringListFromUnknown(value: unknown): readonly string[] {
  if (Array.isArray(value)) {
    return Object.freeze(value.flatMap((entry) => {
      const text = stringFromUnknown(entry);
      return text === null ? [] : [text];
    }));
  }
  const text = stringFromUnknown(value);
  return Object.freeze(text === null ? [] : [text]);
}

function environmentVariablesFromUnknown(
  value: unknown
): Readonly<Record<string, string>> {
  const record = objectRecord(value);
  if (record === null) {
    return Object.freeze({});
  }
  const variables: Record<string, string> = {};
  for (const [key, entry] of Object.entries(record)) {
    const name = key.trim();
    const variableValue = stringFromUnknown(entry);
    if (/^[A-Za-z_][A-Za-z0-9_]*$/u.test(name) && variableValue !== null) {
      variables[name] = variableValue;
    }
  }
  return Object.freeze(variables);
}

function collectDeclaredToolEnvironment(value: unknown): DeclaredToolEnvironment {
  const record = objectRecord(value);
  if (record === null) {
    return Object.freeze({
      directories: Object.freeze([]),
      environmentVariables: Object.freeze({})
    });
  }
  const directories = [
    ...stringListFromUnknown(record["workspaceLocalDirectories"]),
    ...stringListFromUnknown(record["workspace_local_directories"]),
    ...stringListFromUnknown(record["localDirectories"]),
    ...stringListFromUnknown(record["local_directories"]),
    ...stringListFromUnknown(record["cacheDirectories"]),
    ...stringListFromUnknown(record["cache_directories"]),
    ...stringListFromUnknown(record["createdDirectories"]),
    ...stringListFromUnknown(record["created_directories"])
  ];
  const environmentVariables = {
    ...environmentVariablesFromUnknown(record["environmentVariables"]),
    ...environmentVariablesFromUnknown(record["environment_variables"]),
    ...environmentVariablesFromUnknown(record["environment"]),
    ...environmentVariablesFromUnknown(record["env"])
  };
  const nestedKeys = [
    "executionEnvironment",
    "execution_environment",
    "toolEnvironment",
    "tool_environment",
    "testingTechStack",
    "testing_tech_stack",
    "testTechStack",
    "test_tech_stack"
  ];
  const nested = nestedKeys.map((key) =>
    collectDeclaredToolEnvironment(record[key])
  );
  const mergedEnvironmentVariables: Record<string, string> = {};
  for (const entry of nested) {
    for (const [name, variableValue] of Object.entries(entry.environmentVariables)) {
      mergedEnvironmentVariables[name] = variableValue;
    }
  }
  for (const [name, variableValue] of Object.entries(environmentVariables)) {
    mergedEnvironmentVariables[name] = variableValue;
  }
  return Object.freeze({
    directories: Object.freeze([
      ...directories,
      ...nested.flatMap((entry) => entry.directories)
    ]),
    environmentVariables: Object.freeze(mergedEnvironmentVariables)
  });
}

function expandTenantStackValue(input: {
  readonly value: string;
  readonly workspaceRoot: string;
  readonly selectedOutputRoot: string;
}): string {
  const tenantRoot = join(input.workspaceRoot, input.selectedOutputRoot);
  return input.value
    .replaceAll("${workspaceRoot}", input.workspaceRoot)
    .replaceAll("{{workspaceRoot}}", input.workspaceRoot)
    .replaceAll("${selectedOutputRoot}", input.selectedOutputRoot)
    .replaceAll("{{selectedOutputRoot}}", input.selectedOutputRoot)
    .replaceAll("${tenantRoot}", tenantRoot)
    .replaceAll("{{tenantRoot}}", tenantRoot);
}

function workspacePath(input: {
  readonly workspaceRoot: string;
  readonly path: string;
}): string {
  return isAbsolute(input.path) ? input.path : join(input.workspaceRoot, input.path);
}

function tenantStackSpecFiles(input: {
  readonly workspaceRoot: string;
  readonly selectedOutputRoot: string;
}): readonly string[] {
  const specRoot = join(input.workspaceRoot, input.selectedOutputRoot, "spec");
  return Object.freeze(
    TENANT_STACK_SPEC_FILENAMES
      .map((name) => join(specRoot, name))
      .filter((filePath) => existsSync(filePath))
  );
}

function gitCeilingDirectoriesForWorkspace(input: {
  readonly workspaceRoot: string;
  readonly declaredValue: string | undefined;
}): string {
  const workspaceParent = dirname(input.workspaceRoot);
  if (input.declaredValue === undefined || input.declaredValue.trim().length === 0) {
    return workspaceParent;
  }
  return `${workspaceParent}${delimiter}${input.declaredValue}`;
}

export function sdlcWorkspaceLocalToolEnvironment(
  workspaceRoot: string
): Readonly<Record<string, string>> {
  const profile = deriveSdlcConformProjectProfileFromWorkspace(workspaceRoot);
  const declarations = tenantStackSpecFiles({
    workspaceRoot,
    selectedOutputRoot: profile.selectedOutputRoot
  }).map((filePath) => {
    try {
      return collectDeclaredToolEnvironment(
        JSON.parse(readFileSync(filePath, "utf8"))
      );
    } catch {
      return Object.freeze({
        directories: Object.freeze([]),
        environmentVariables: Object.freeze({})
      });
    }
  });
  const declaredDirectories = new Set<string>();
  const environment: Record<string, string> = {};
  for (const declaration of declarations) {
    for (const directory of declaration.directories) {
      const expanded = expandTenantStackValue({
        value: directory,
        workspaceRoot,
        selectedOutputRoot: profile.selectedOutputRoot
      });
      declaredDirectories.add(
        workspacePath({ workspaceRoot, path: expanded })
      );
    }
    for (const [name, value] of Object.entries(
      declaration.environmentVariables
    )) {
      environment[name] = expandTenantStackValue({
        value,
        workspaceRoot,
        selectedOutputRoot: profile.selectedOutputRoot
      });
    }
  }
  environment["GIT_CEILING_DIRECTORIES"] = gitCeilingDirectoriesForWorkspace({
    workspaceRoot,
    declaredValue: environment["GIT_CEILING_DIRECTORIES"]
  });
  for (const directory of declaredDirectories) {
    mkdirSync(directory, { recursive: true });
  }
  return Object.freeze(environment);
}
