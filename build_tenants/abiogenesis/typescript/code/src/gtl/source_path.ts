import type { CProgramNode } from "./c_algebra.js";
import type { GraphTemplate } from "./contracts.js";

export type CSourcePath = readonly string[];

export interface CSourcePathRefusal {
  readonly kind: "c_source_path_refusal";
  readonly schemaVersion: "5.0.0";
  readonly code: "invalid_source_path" | "term_path_missing";
  readonly message: string;
}

export interface CSourceContinuation {
  readonly kind: "c_source_continuation";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "advance" | "terminal";
  readonly relation:
    | "batch_next"
    | "compose_next"
    | "edge_next"
    | "root_complete";
  readonly sourcePath: CSourcePath;
  readonly targetPath: CSourcePath | null;
  readonly targetTaskOrdinal: number | null;
  readonly targetRetryDepth: number;
}

function refusal(
  code: CSourcePathRefusal["code"],
  message: string,
): CSourcePathRefusal {
  return {
    kind: "c_source_path_refusal",
    schemaVersion: "5.0.0",
    code,
    message,
  };
}

function safeOrdinal(value: string | undefined): number | null {
  if (value === undefined || !/^(0|[1-9][0-9]*)$/.test(value)) return null;
  const ordinal = Number(value);
  return Number.isSafeInteger(ordinal) ? ordinal : null;
}

function taskOrdinalAtPath(path: CSourcePath): number | null {
  let ordinal: number | null = null;
  for (let index = 3; index < path.length - 1; index += 1) {
    if (path[index] !== "tasks") continue;
    const candidate = safeOrdinal(path[index + 1]);
    if (candidate !== null) ordinal = candidate;
  }
  return ordinal;
}

function retryDepthAtPath(path: CSourcePath): number {
  return path.slice(3).filter((segment) => segment === "term").length;
}

function continuation(
  sourcePath: CSourcePath,
  relation: CSourceContinuation["relation"],
  targetPath: CSourcePath | null,
): CSourceContinuation {
  return {
    kind: "c_source_continuation",
    schemaVersion: "5.0.0",
    disposition: targetPath === null ? "terminal" : "advance",
    relation,
    sourcePath: Object.freeze([...sourcePath]),
    targetPath: targetPath === null ? null : Object.freeze([...targetPath]),
    targetTaskOrdinal: targetPath === null ? null : taskOrdinalAtPath(targetPath),
    targetRetryDepth: targetPath === null ? 0 : retryDepthAtPath(targetPath),
  };
}

export function rootCSourcePath(nodeRef: string): CSourcePath {
  return Object.freeze(["node", nodeRef, "c"]);
}

export function resolveCProgramTermAtSourcePath(
  template: Readonly<GraphTemplate>,
  nodeRef: string,
  termPath: CSourcePath,
): CProgramNode | CSourcePathRefusal {
  if (
    nodeRef.length === 0 ||
    termPath.length < 3 ||
    termPath[0] !== "node" ||
    termPath[1] !== nodeRef ||
    termPath[2] !== "c"
  ) {
    return refusal(
      "invalid_source_path",
      "GTL term paths must be rooted at the exact declared node",
    );
  }

  const node = template.nodes.find((candidate) => candidate.nodeRef === nodeRef);
  if (node === undefined) {
    return refusal(
      "term_path_missing",
      `GTL node ${nodeRef} is absent from the original Graph`,
    );
  }

  let term: CProgramNode = node.term;
  let offset = 3;
  while (offset < termPath.length) {
    const segment = termPath[offset];
    switch (term.kind) {
      case "c_compose": {
        if (segment !== "terms") {
          return refusal(
            "term_path_missing",
            "C.compose path requires a terms segment",
          );
        }
        const ordinal = safeOrdinal(termPath[offset + 1]);
        const child = ordinal === null ? undefined : term.terms[ordinal];
        if (child === undefined) {
          return refusal("term_path_missing", "C.compose term ordinal is absent");
        }
        term = child;
        offset += 2;
        break;
      }
      case "c_edge": {
        if (
          segment !== "transform" &&
          segment !== "evaluate" &&
          segment !== "consequence"
        ) {
          return refusal(
            "term_path_missing",
            "C.edge path requires a declared role segment",
          );
        }
        term = term[segment];
        offset += 1;
        break;
      }
      case "c_batch": {
        if (segment !== "tasks") {
          return refusal(
            "term_path_missing",
            "C.batch path requires a tasks segment",
          );
        }
        const ordinal = safeOrdinal(termPath[offset + 1]);
        const child = ordinal === null ? undefined : term.tasks[ordinal];
        if (child === undefined) {
          return refusal("term_path_missing", "C.batch task ordinal is absent");
        }
        term = child;
        offset += 2;
        break;
      }
      case "c_retry":
        if (segment !== "term") {
          return refusal(
            "term_path_missing",
            "C.retry path requires its term segment",
          );
        }
        term = term.term;
        offset += 1;
        break;
      case "c_of":
      case "c_identity":
      case "c_workflow":
        return refusal(
          "term_path_missing",
          `${term.kind} has no nested GTL term at the requested source path`,
        );
    }
  }
  return term;
}

export function resolveEnclosingCBatchRef(
  template: Readonly<GraphTemplate>,
  nodeRef: string,
  sourcePath: CSourcePath,
): string | null | CSourcePathRefusal {
  const source = resolveCProgramTermAtSourcePath(template, nodeRef, sourcePath);
  if (source.kind === "c_source_path_refusal") return source;

  let currentPath = [...sourcePath];
  while (currentPath.length > 3) {
    const last = currentPath.at(-1);
    const penultimate = currentPath.at(-2);
    let parentPath: string[];
    if (penultimate === "terms" || penultimate === "tasks") {
      if (safeOrdinal(last) === null) {
        return refusal("invalid_source_path", "ordered C child path has an invalid ordinal");
      }
      parentPath = currentPath.slice(0, -2);
    } else if (
      last === "transform" ||
      last === "evaluate" ||
      last === "consequence" ||
      last === "term"
    ) {
      parentPath = currentPath.slice(0, -1);
    } else {
      return refusal("invalid_source_path", "C term has no declared parent relation");
    }
    const parent = resolveCProgramTermAtSourcePath(template, nodeRef, parentPath);
    if (parent.kind === "c_source_path_refusal") return parent;
    if (parent.kind === "c_batch") return parent.batchRef;
    currentPath = parentPath;
  }
  return null;
}

export function deriveCSourceContinuation(
  template: Readonly<GraphTemplate>,
  nodeRef: string,
  sourcePath: CSourcePath,
): CSourceContinuation | CSourcePathRefusal {
  const source = resolveCProgramTermAtSourcePath(template, nodeRef, sourcePath);
  if (source.kind === "c_source_path_refusal") return source;

  let completedPath = [...sourcePath];
  while (completedPath.length > 3) {
    const last = completedPath.at(-1);
    const penultimate = completedPath.at(-2);
    let parentPath: string[];
    let childOrdinal: number | null = null;
    let childRole: string | null = null;

    if (penultimate === "terms" || penultimate === "tasks") {
      childOrdinal = safeOrdinal(last);
      if (childOrdinal === null) {
        return refusal("invalid_source_path", "ordered C child path has an invalid ordinal");
      }
      childRole = penultimate;
      parentPath = completedPath.slice(0, -2);
    } else if (
      last === "transform" ||
      last === "evaluate" ||
      last === "consequence" ||
      last === "term"
    ) {
      childRole = last;
      parentPath = completedPath.slice(0, -1);
    } else {
      return refusal("invalid_source_path", "completed C term has no declared parent relation");
    }

    const parent = resolveCProgramTermAtSourcePath(template, nodeRef, parentPath);
    if (parent.kind === "c_source_path_refusal") return parent;
    switch (parent.kind) {
      case "c_compose": {
        if (childRole !== "terms" || childOrdinal === null) {
          return refusal("invalid_source_path", "C.compose child path is malformed");
        }
        if (childOrdinal + 1 < parent.terms.length) {
          return continuation(
            sourcePath,
            "compose_next",
            [...parentPath, "terms", String(childOrdinal + 1)],
          );
        }
        completedPath = parentPath;
        break;
      }
      case "c_edge": {
        if (childRole === "transform") {
          return continuation(sourcePath, "edge_next", [...parentPath, "evaluate"]);
        }
        if (childRole === "evaluate") {
          return continuation(sourcePath, "edge_next", [...parentPath, "consequence"]);
        }
        if (childRole !== "consequence") {
          return refusal("invalid_source_path", "C.edge child path is malformed");
        }
        completedPath = parentPath;
        break;
      }
      case "c_batch": {
        if (childRole !== "tasks" || childOrdinal === null) {
          return refusal("invalid_source_path", "C.batch child path is malformed");
        }
        if (childOrdinal + 1 < parent.tasks.length) {
          return continuation(
            sourcePath,
            "batch_next",
            [...parentPath, "tasks", String(childOrdinal + 1)],
          );
        }
        completedPath = parentPath;
        break;
      }
      case "c_retry":
        if (childRole !== "term") {
          return refusal("invalid_source_path", "C.retry child path is malformed");
        }
        completedPath = parentPath;
        break;
      case "c_of":
      case "c_identity":
      case "c_workflow":
        return refusal(
          "invalid_source_path",
          `${parent.kind} cannot own a nested completed C term`,
        );
    }
  }

  return continuation(sourcePath, "root_complete", null);
}
