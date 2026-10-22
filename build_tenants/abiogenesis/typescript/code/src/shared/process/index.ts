// The `shared/process/` family (design §4.6). The physical lifetime keeps its
// module, `shared/owned_process_lifetime.ts`; this directory re-exports it
// beside the atoms it adds.
export {
  createMonotonicDeadline,
  createOwnedProcessLifetime,
  type MonotonicTimerHost,
  type OwnedProcessFacts,
  type OwnedProcessHost,
  type OwnedProcessLifetimeBounds,
  type OwnedProcessObservations,
  type OwnedProcessScopeAbsence,
} from "../owned_process_lifetime.js";
export {
  classifyOwnedProcessTerminal,
  encodeOwnedProcessFacts,
  hasConfirmedOwnedProcessBoundary,
  type OwnedProcessTerminal,
} from "./facts.js";
