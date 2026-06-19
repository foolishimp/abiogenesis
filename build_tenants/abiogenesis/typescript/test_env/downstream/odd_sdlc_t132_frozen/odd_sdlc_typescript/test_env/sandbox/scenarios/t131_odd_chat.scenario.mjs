// T-131 guided odd_chat scenario.
// Uses the bootstrap.md scenario contract under test_env/fixtures/t131_guided_odd_chat
// as the source-of-truth project the harness copies into a fresh sandbox before
// installing odd_sdlc.
//
// The deterministic single-advance run inducts the bootstrap document through
// conform_project_authority. Opt into a live multi-advance build by setting
// liveWorker and bumping maxAdvances when invoking the harness.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { FG_CONFORM_PROJECT } from "../../../build/semantic/code/src/index.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = resolve(HERE, "../../fixtures/t131_guided_odd_chat");

export const T131_ODD_CHAT_FIXTURE_ROOT = FIXTURE_ROOT;
export const T131_ODD_CHAT_SOURCE_FILES = Object.freeze([
  "bootstrap.md",
  "domains/document_to_requirements/domain.json",
  "domains/document_to_requirements/README.md",
  "examples/start_document.md"
]);

// The bootstrap-only fixture inducts through conform_project as the first
// lawful edge; it is the same conformance gate the data_mapper internal lane
// converges on before any domain-specific traversal opens.
export const t131OddChatScenario = Object.freeze({
  scenarioId: "scenario_t131_odd_chat",
  installedPackageName: "odd-sdlc-scenario-t131-odd-chat",
  fixture: {
    root: FIXTURE_ROOT,
    sourceFiles: T131_ODD_CHAT_SOURCE_FILES
  },
  expectations: {
    firstEdge: FG_CONFORM_PROJECT,
    firstStartStatus: "converged"
  },
  maxAdvances: 1
});

export function t131OddChatLiveScenario({
  worker,
  maxAdvances = 12,
  startUntil = "converged"
}) {
  if (typeof worker !== "string" || worker.length === 0) {
    throw new Error("t131OddChatLiveScenario requires a worker URI");
  }
  return Object.freeze({
    ...t131OddChatScenario,
    scenarioId: "scenario_t131_odd_chat_live",
    installedPackageName: "odd-sdlc-scenario-t131-odd-chat-live",
    expectations: {
      firstEdge: FG_CONFORM_PROJECT,
      firstStartStatus: "converged"
    },
    liveWorker: worker,
    startTarget: "next",
    startUntil,
    maxAdvances,
    continueOnEdgeConverge: true
  });
}
