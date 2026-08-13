import assert from "node:assert/strict";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let bytes = "";
for await (const chunk of process.stdin) bytes += chunk;
const input = JSON.parse(bytes);
const abg = await import(
  `${pathToFileURL(join(
    input.installedPackageRoot,
    "build/code/src/abg/index.js",
  )).href}?fresh=${process.pid}`
);
const reopened = abg.reopenEventStore(
  input.reopenAuthority,
  input.prefix,
);
assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
const store = reopened.store;

const state = abg.rehydrateAdmittedCCallState(
  store,
  input.cCall,
  input.result,
  input.judgment,
);
assert.ok(state);
const result = structuredClone(state.result);
const judgment = structuredClone(state.judgment);
const prefix = abg.selectValidatedRuntimeEventPrefix(store.readAll(), {
  runId: state.cCall.runId,
});
const accepted = abg.projectAdmittedCCallOutcomeAtPrefix(
  prefix,
  state.cCall,
  result,
  judgment,
) !== null;
const substituted = structuredClone(judgment);
substituted.reasonRef = "reason://abiogenesis/s06/ax-f10/substituted@5";
const substitutedAccepted = abg.projectAdmittedCCallOutcomeAtPrefix(
  prefix,
  state.cCall,
  result,
  substituted,
) !== null;
const replay = abg.replay(store, { runId: state.cCall.runId });
store.closeDurableLog();
process.stdout.write(JSON.stringify({
  processId: process.pid,
  historicalCCallBranded: abg.isCCall(state.cCall),
  historicalResultBranded: abg.isAdmittedCCallResult(state.result),
  historicalJudgmentBranded: abg.isAdmittedCCallJudgment(state.judgment),
  accepted,
  substitutedAccepted,
  replayDigest: replay.replayDigest,
  cCallProjection: replay.cCalls.find(
    (candidate) => candidate.cCallRef === state.cCall.cCallRef,
  ),
  routeProjection: replay.routes.find(
    (candidate) => candidate.cCallRef === state.cCall.cCallRef,
  ),
}));
