import type { GraphFunction } from "../../m01/contracts/carriers.js";
import type { Job, Module } from "./carriers.js";

export interface GraphFunctionHandleBinding {
  readonly handle: string;
  readonly graphFunctions: readonly GraphFunction[];
}

export interface SemanticJobBinding {
  readonly graphFunctionId: string;
  readonly jobs: readonly Job[];
}

export interface ModuleLookupAuthority {
  readonly moduleName: string;
  readonly graphFunctionHandles: readonly GraphFunctionHandleBinding[];
  readonly semanticJobs: readonly SemanticJobBinding[];
}

function compareStrings(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function freezeGraphFunctions(
  graphFunctions: readonly GraphFunction[]
): readonly GraphFunction[] {
  return Object.freeze([...graphFunctions]);
}

function freezeJobs(jobs: readonly Job[]): readonly Job[] {
  return Object.freeze([...jobs]);
}

function dedupeGraphFunctionHandles(
  graphFunction: GraphFunction
): readonly string[] {
  if (graphFunction.id === graphFunction.name) {
    return Object.freeze([graphFunction.id]);
  }
  return Object.freeze([graphFunction.id, graphFunction.name]);
}

function findGraphFunctionBucket(
  bindings: readonly GraphFunctionHandleBinding[],
  handle: string
): GraphFunctionHandleBinding | null {
  let low = 0;
  let high = bindings.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const candidate = bindings[mid];
    if (candidate === undefined) {
      break;
    }
    const comparison = compareStrings(handle, candidate.handle);
    if (comparison === 0) {
      return candidate;
    }
    if (comparison < 0) {
      high = mid - 1;
      continue;
    }
    low = mid + 1;
  }

  return null;
}

function findSemanticJobBucket(
  bindings: readonly SemanticJobBinding[],
  graphFunctionId: string
): SemanticJobBinding | null {
  let low = 0;
  let high = bindings.length - 1;

  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    const candidate = bindings[mid];
    if (candidate === undefined) {
      break;
    }
    const comparison = compareStrings(graphFunctionId, candidate.graphFunctionId);
    if (comparison === 0) {
      return candidate;
    }
    if (comparison < 0) {
      high = mid - 1;
      continue;
    }
    low = mid + 1;
  }

  return null;
}

function buildGraphFunctionHandleBindings(
  module: Module
): readonly GraphFunctionHandleBinding[] {
  const buckets = new Map<string, GraphFunction[]>();

  for (const graphFunction of module.graphFunctions) {
    for (const handle of dedupeGraphFunctionHandles(graphFunction)) {
      const existing = buckets.get(handle);
      if (existing === undefined) {
        buckets.set(handle, [graphFunction]);
        continue;
      }
      existing.push(graphFunction);
    }
  }

  return Object.freeze(
    [...buckets.entries()]
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([handle, graphFunctions]) =>
        Object.freeze({
          handle,
          graphFunctions: freezeGraphFunctions(graphFunctions)
        })
      )
  );
}

function buildSemanticJobBindings(module: Module): readonly SemanticJobBinding[] {
  const buckets = new Map<string, Job[]>();

  for (const job of module.jobs) {
    const targetIds = new Set(
      job.contracts
        .filter((contract) => contract.kind === "graph_function")
        .map((contract) => contract.targetId)
    );

    for (const graphFunctionId of targetIds) {
      const existing = buckets.get(graphFunctionId);
      if (existing === undefined) {
        buckets.set(graphFunctionId, [job]);
        continue;
      }
      existing.push(job);
    }
  }

  return Object.freeze(
    [...buckets.entries()]
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([graphFunctionId, jobs]) =>
        Object.freeze({
          graphFunctionId,
          jobs: freezeJobs(jobs)
        })
      )
  );
}

export function constructModuleLookupAuthority(
  module: Module
): ModuleLookupAuthority {
  return Object.freeze({
    moduleName: module.name,
    graphFunctionHandles: buildGraphFunctionHandleBindings(module),
    semanticJobs: buildSemanticJobBindings(module)
  });
}

export function resolvePublishedGraphFunction(
  authority: ModuleLookupAuthority,
  handle: string
): GraphFunction {
  const bucket = findGraphFunctionBucket(authority.graphFunctionHandles, handle);
  if (bucket === null) {
    throw new TypeError(
      `Module ${JSON.stringify(authority.moduleName)} publishes no graph function for handle ${JSON.stringify(handle)}`
    );
  }
  if (bucket.graphFunctions.length > 1) {
    throw new TypeError(
      `Module ${JSON.stringify(authority.moduleName)} publishes multiple graph functions for handle ${JSON.stringify(handle)}`
    );
  }
  const graphFunction = bucket.graphFunctions[0];
  if (graphFunction === undefined) {
    throw new TypeError(
      `Module ${JSON.stringify(authority.moduleName)} could not resolve graph function for handle ${JSON.stringify(handle)}`
    );
  }
  return graphFunction;
}

export function resolveSemanticJobForGraphFunction(
  authority: ModuleLookupAuthority,
  graphFunctionId: string
): Job {
  const bucket = findSemanticJobBucket(authority.semanticJobs, graphFunctionId);
  if (bucket === null) {
    throw new TypeError(
      `Module ${JSON.stringify(authority.moduleName)} publishes no semantic job for graph function ${JSON.stringify(graphFunctionId)}`
    );
  }
  if (bucket.jobs.length > 1) {
    throw new TypeError(
      `Module ${JSON.stringify(authority.moduleName)} publishes multiple semantic jobs for graph function ${JSON.stringify(graphFunctionId)}`
    );
  }
  const job = bucket.jobs[0];
  if (job === undefined) {
    throw new TypeError(
      `Module ${JSON.stringify(authority.moduleName)} could not resolve semantic job for graph function ${JSON.stringify(graphFunctionId)}`
    );
  }
  return job;
}
