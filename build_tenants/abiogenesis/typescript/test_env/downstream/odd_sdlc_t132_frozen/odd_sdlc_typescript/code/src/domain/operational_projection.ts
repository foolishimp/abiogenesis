import {
  type SdlcOperationalResult,
  type SdlcOperationalState,
  type SdlcOperationalStateProjection,
  type SdlcOperationalTransitionCommand
} from "./carriers.js";

function selectState(
  results: readonly SdlcOperationalResult[]
): SdlcOperationalState {
  if (results.some((result) => result.status === "failed")) {
    return "failed";
  }
  if (results.some((result) => result.status === "succeeded")) {
    return "succeeded";
  }
  return "pending";
}

export function projectSdlcOperationalState(input: {
  readonly command: SdlcOperationalTransitionCommand;
  readonly results: readonly SdlcOperationalResult[];
  readonly runtimeFactRefs: readonly string[];
}): SdlcOperationalStateProjection {
  for (const result of input.results) {
    if (result.commandId !== input.command.commandId) {
      throw new TypeError(
        `SdlcOperationalStateProjection rejects result ${JSON.stringify(result.resultId)} for another command`
      );
    }
  }
  const sourceResultIds = Object.freeze(
    input.results.map((result) => result.resultId)
  );
  const sourceRuntimeFactRefs = Object.freeze([...input.runtimeFactRefs]);

  return Object.freeze({
    kind: "sdlc_operational_state_projection",
    projectionId: `sdlc_operational_state:${input.command.commandId}:${sourceResultIds.join(",")}:${sourceRuntimeFactRefs.join(",")}`,
    commandId: input.command.commandId,
    lane: input.command.lane,
    state: selectState(input.results),
    sourceResultIds,
    sourceRuntimeFactRefs
  });
}
