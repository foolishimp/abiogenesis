import type { EnginePluginInput } from "../contracts/plugins.js";

// Resume authority is object identity minted only by the engine after it has
// projected an admitted dangling C-call spine. Keeping the authority outside
// EnginePluginInput prevents structural callers from forging it with a field.
const RESUMABLE_PLUGIN_INPUTS = new WeakSet<EnginePluginInput>();

export function admitEngineCCallResumeAuthority(
  input: EnginePluginInput
): EnginePluginInput {
  RESUMABLE_PLUGIN_INPUTS.add(input);
  return input;
}

export function hasEngineCCallResumeAuthority(
  input: EnginePluginInput
): boolean {
  return RESUMABLE_PLUGIN_INPUTS.has(input);
}
