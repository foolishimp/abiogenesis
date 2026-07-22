import type { CProgramNode } from "./c_algebra.js";
import type { GraphTemplate } from "./contracts.js";

export type CSourcePath = readonly string[];

export interface CSourcePathRefusal {
  readonly kind: "c_source_path_refusal";
  readonly schemaVersion: "5.0.0";
  readonly code: "invalid_source_path" | "term_path_missing";
  readonly message: string;
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
