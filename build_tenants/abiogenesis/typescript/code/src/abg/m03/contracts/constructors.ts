import { materializeGraphFunction } from "../../../gtl/m01/contracts/carriers.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  resolvePublishedGraphFunction,
  resolveSemanticJobForGraphFunction,
  type ModuleLookupAuthority
} from "../../../gtl/m02/contracts/lookup.js";
import type {
  ExecutionBasis,
  StartIntent
} from "./carriers.js";

export interface ExecutionBasisInit {
  readonly basisId: string;
  readonly startIntent: StartIntent;
  readonly module: Module;
  readonly lookupAuthority: ModuleLookupAuthority;
  readonly runtimeIdentity: ExecutionBasis["runtimeIdentity"];
  readonly resolvedPolicy: ExecutionBasis["resolvedPolicy"];
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly frameId: string | null;
  readonly frameLineageId: string | null;
}

export function constructExecutionBasis(input: ExecutionBasisInit): ExecutionBasis {
  const graphFunction = resolvePublishedGraphFunction(
    input.lookupAuthority,
    input.startIntent.target.handle
  );
  const job = resolveSemanticJobForGraphFunction(
    input.lookupAuthority,
    graphFunction.id
  );
  const graph = materializeGraphFunction(graphFunction);

  return Object.freeze({
    id: input.basisId,
    workspaceRoot: input.startIntent.scope.workspaceRoot,
    moduleName: input.module.name,
    graphFunction,
    graph,
    job,
    modulePolicyHooks: input.module.policyHooks,
    runtimeIdentity: input.runtimeIdentity,
    resolvedPolicy: input.resolvedPolicy,
    startIntent: input.startIntent,
    runId: input.runId,
    workKey: input.workKey,
    frameId: input.frameId,
    frameLineageId: input.frameLineageId
  });
}

export * from "./event_factories.js";
export * from "./iteration_state_action.js";
export * from "./leaf_task.js";
export * from "./projection.js";
export * from "./retry_repair.js";
