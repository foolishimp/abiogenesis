// data_mapper internal induction scenario.
// Mirrors the lane proven by test_t087_t091_t096_internal_data_mapper_induction_sandbox.

import { FG_CONFORM_PROJECT } from "../../../build/semantic/code/src/index.js";
import {
  INTERNAL_DATA_MAPPER_FIXTURE_ROOT,
  INTERNAL_DATA_MAPPER_SOURCE_FILES
} from "../../fixtures/internal_data_mapper_fixture.mjs";

export const dataMapperInternalScenario = Object.freeze({
  scenarioId: "scenario_data_mapper_internal",
  installedPackageName: "odd-sdlc-scenario-data-mapper-internal",
  fixture: {
    root: INTERNAL_DATA_MAPPER_FIXTURE_ROOT,
    sourceFiles: INTERNAL_DATA_MAPPER_SOURCE_FILES
  },
  expectations: {
    firstEdge: FG_CONFORM_PROJECT,
    firstStartStatus: "converged",
    firstEventKinds: [
      "graph_call_opened",
      "frame_opened",
      "vector_traversal_planned",
      "vector_evaluated",
      "vector_closed"
    ],
    requirementIds: ["REQ-LDM-001", "REQ-COV-008"],
    archiveArtifacts: ["conform_project_report.json"]
  },
  maxAdvances: 1
});
