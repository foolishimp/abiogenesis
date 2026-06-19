// Implements: T-161

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  type Stats
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { SdlcFdRunAnalysisInspectedKind } from "./types.js";

export interface SdlcFdRunAnalysisResolvedRoot {
  readonly inspectedKind: SdlcFdRunAnalysisInspectedKind;
  readonly inspectedRoot: string;
  readonly operatorRunRoots: readonly string[];
  readonly workspaceRoot: string | null;
  readonly scenarioRunRoot: string | null;
}

export type LoadedJson<T> =
  | { readonly status: "present"; readonly data: T; readonly bytes: number; readonly path: string }
  | { readonly status: "malformed"; readonly bytes: number; readonly path: string; readonly detail: string }
  | { readonly status: "missing" };

export type LoadedJsonl<T> =
  | { readonly status: "present"; readonly data: readonly T[]; readonly bytes: number; readonly path: string }
  | { readonly status: "malformed"; readonly bytes: number; readonly path: string; readonly detail: string }
  | { readonly status: "missing" };

export interface SdlcFdRunAnalysisFileInfo {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly byteSize: number;
  readonly mtimeMs: number;
}

const SCENARIO_INDICATOR_FILES = Object.freeze([
  "run_summary.json",
  "install.process.json"
] as const);

function isDirectory(target: string): boolean {
  if (!existsSync(target)) {
    return false;
  }
  try {
    return statSync(target).isDirectory();
  } catch {
    return false;
  }
}

function statOrNull(target: string): Stats | null {
  try {
    return statSync(target);
  } catch {
    return null;
  }
}

function operatorRunRootBaseName(target: string): string {
  return path.basename(target);
}

function isOperatorRunDirName(name: string): boolean {
  return /^\d{8}T\d{9}Z(_pid\d+)?$/u.test(name);
}

function workspaceOperatorRunRoot(workspaceRoot: string): string {
  return path.join(
    workspaceRoot,
    ".ai-workspace/runtime/odd_sdlc/operator-runs"
  );
}

function isWorkspaceRoot(target: string): boolean {
  if (!isDirectory(target)) {
    return false;
  }
  if (isDirectory(workspaceOperatorRunRoot(target))) {
    return true;
  }
  if (
    isDirectory(path.join(target, "specification")) ||
    isDirectory(path.join(target, ".ai-workspace"))
  ) {
    return true;
  }
  return false;
}

function isScenarioRunRoot(target: string): boolean {
  if (!isDirectory(target)) {
    return false;
  }
  for (const indicator of SCENARIO_INDICATOR_FILES) {
    if (existsSync(path.join(target, indicator))) {
      return true;
    }
  }
  return isDirectory(path.join(target, "workspace")) &&
    isDirectory(path.join(target, "workspace/.ai-workspace"));
}

function isOperatorRunRoot(target: string): boolean {
  if (!isDirectory(target)) {
    return false;
  }
  if (!isOperatorRunDirName(operatorRunRootBaseName(target))) {
    return false;
  }
  return (
    existsSync(path.join(target, "operator_summary.json")) ||
    existsSync(path.join(target, "worker_run.json")) ||
    existsSync(path.join(target, "handoff_manifest.json")) ||
    existsSync(path.join(target, "worker_process_started.json")) ||
    existsSync(path.join(target, "traversal_intent_package.json"))
  );
}

function operatorRunRootsNewestFirst(operatorRunsRoot: string): readonly string[] {
  if (!isDirectory(operatorRunsRoot)) {
    return Object.freeze([]);
  }
  const entries = readdirSync(operatorRunsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(operatorRunsRoot, entry.name))
    .filter((entryPath) => isOperatorRunRoot(entryPath));
  const stats = entries.map((entryPath) => Object.freeze({
    entryPath,
    mtimeMs: statOrNull(entryPath)?.mtimeMs ?? 0
  }));
  stats.sort((left, right) => right.mtimeMs - left.mtimeMs);
  return Object.freeze(stats.map((entry) => entry.entryPath));
}

export function resolveSdlcFdRunAnalysisRoot(inspectedRoot: string): SdlcFdRunAnalysisResolvedRoot {
  const absolute = path.resolve(inspectedRoot);
  if (!existsSync(absolute) || !isDirectory(absolute)) {
    throw new TypeError(`analyze-run: inspected root does not exist: ${absolute}`);
  }
  if (isOperatorRunRoot(absolute)) {
    return Object.freeze({
      inspectedKind: "operator-run" as const,
      inspectedRoot: absolute,
      operatorRunRoots: Object.freeze([absolute]),
      workspaceRoot: null,
      scenarioRunRoot: null
    });
  }
  if (isScenarioRunRoot(absolute)) {
    const workspaceRoot = path.join(absolute, "workspace");
    return Object.freeze({
      inspectedKind: "run-archive" as const,
      inspectedRoot: absolute,
      operatorRunRoots: operatorRunRootsNewestFirst(
        workspaceOperatorRunRoot(workspaceRoot)
      ),
      workspaceRoot,
      scenarioRunRoot: absolute
    });
  }
  if (isWorkspaceRoot(absolute)) {
    return Object.freeze({
      inspectedKind: "workspace" as const,
      inspectedRoot: absolute,
      operatorRunRoots: operatorRunRootsNewestFirst(
        workspaceOperatorRunRoot(absolute)
      ),
      workspaceRoot: absolute,
      scenarioRunRoot: null
    });
  }
  return Object.freeze({
    inspectedKind: "workspace" as const,
    inspectedRoot: absolute,
    operatorRunRoots: Object.freeze([]),
    workspaceRoot: absolute,
    scenarioRunRoot: null
  });
}

export function fileSizeOrZero(filePath: string): number {
  const stats = statOrNull(filePath);
  return stats === null || !stats.isFile() ? 0 : stats.size;
}

export function fileMtimeMsOrNull(filePath: string): number | null {
  const stats = statOrNull(filePath);
  return stats === null || !stats.isFile() ? null : stats.mtimeMs;
}

export function dirMtimeMsOrNull(dirPath: string): number | null {
  const stats = statOrNull(dirPath);
  return stats === null || !stats.isDirectory() ? null : stats.mtimeMs;
}

export function loadJsonFile<T>(
  filePath: string,
  guard: (value: unknown) => value is T
): LoadedJson<T> {
  if (!existsSync(filePath)) {
    return { status: "missing" } as const;
  }
  const stats = statOrNull(filePath);
  if (stats === null || !stats.isFile()) {
    return { status: "missing" } as const;
  }
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch (error) {
    return Object.freeze({
      status: "malformed" as const,
      bytes: stats.size,
      path: filePath,
      detail: error instanceof Error ? error.message : String(error)
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return Object.freeze({
      status: "malformed" as const,
      bytes: stats.size,
      path: filePath,
      detail: error instanceof Error ? error.message : String(error)
    });
  }
  if (!guard(parsed)) {
    return Object.freeze({
      status: "malformed" as const,
      bytes: stats.size,
      path: filePath,
      detail: "schema_guard_rejected"
    });
  }
  return Object.freeze({
    status: "present" as const,
    data: parsed,
    bytes: stats.size,
    path: filePath
  });
}

export function loadJsonlFile<T>(
  filePath: string,
  guard: (value: unknown) => value is T
): LoadedJsonl<T> {
  if (!existsSync(filePath)) {
    return { status: "missing" } as const;
  }
  const stats = statOrNull(filePath);
  if (stats === null || !stats.isFile()) {
    return { status: "missing" } as const;
  }
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch (error) {
    return Object.freeze({
      status: "malformed" as const,
      bytes: stats.size,
      path: filePath,
      detail: error instanceof Error ? error.message : String(error)
    });
  }
  const lines = raw.split(/\r?\n/u).filter((line) => line.trim().length > 0);
  const parsed: T[] = [];
  for (const line of lines) {
    let entry: unknown;
    try {
      entry = JSON.parse(line);
    } catch (error) {
      return Object.freeze({
        status: "malformed" as const,
        bytes: stats.size,
        path: filePath,
        detail: error instanceof Error ? error.message : String(error)
      });
    }
    if (guard(entry)) {
      parsed.push(entry);
    }
  }
  return Object.freeze({
    status: "present" as const,
    data: Object.freeze(parsed),
    bytes: stats.size,
    path: filePath
  });
}

export function walkDirectoryFiles(rootDir: string): readonly SdlcFdRunAnalysisFileInfo[] {
  const out: SdlcFdRunAnalysisFileInfo[] = [];
  const visit = (absoluteDir: string, relativeDir: string): void => {
    let entries: ReadonlyArray<{ readonly name: string; isDirectory(): boolean; isFile(): boolean }>;
    try {
      entries = readdirSync(absoluteDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const childAbsolute = path.join(absoluteDir, entry.name);
      const childRelative =
        relativeDir.length === 0 ? entry.name : `${relativeDir}/${entry.name}`;
      if (entry.isDirectory()) {
        visit(childAbsolute, childRelative);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      const stats = statOrNull(childAbsolute);
      if (stats === null) {
        continue;
      }
      out.push(Object.freeze({
        absolutePath: childAbsolute,
        relativePath: childRelative,
        byteSize: stats.size,
        mtimeMs: stats.mtimeMs
      }));
    }
  };
  if (isDirectory(rootDir)) {
    visit(rootDir, "");
  }
  return Object.freeze(out);
}

export function fileRef(filePath: string): string {
  return pathToFileURL(filePath).href;
}

export function operatorRunRef(operatorRunRoot: string): string {
  return pathToFileURL(operatorRunRoot).href;
}
