// Resume helper retired by T-197 A2.
//
// The old helper resumed data_mapper by running:
//   odd-sdlc-ts start --until converged
//
// That duplicated ABG layered command/control in SDLC. Full data_mapper
// convergence must resume through ABG.CLI / ABG control-loop command binding
// over the admitted SDLC GTL program.

import { liveOperatorRuntimePolicy } from "./operator_runtime_policy.mjs";

const RUNTIME_POLICY = liveOperatorRuntimePolicy();

throw new Error(
  [
    "T-164 data_mapper resume is retired for odd-sdlc-ts start --until converged.",
    `Configured worker transport remains ${RUNTIME_POLICY.liveHarnessDataMapperWorkerTransport}.`,
    "Use or implement the ABG-owned layered command/control lane instead."
  ].join(" ")
);
