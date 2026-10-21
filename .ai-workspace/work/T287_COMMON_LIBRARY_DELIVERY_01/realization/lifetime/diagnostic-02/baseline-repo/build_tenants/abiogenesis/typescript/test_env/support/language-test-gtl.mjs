// Tests import their authored program here, never from the Product API.
import * as gtl from "../../build/code/src/gtl/index.js";
import { constructLanguageTestPublication } from "./language-smoke-fixture.mjs";
export * from "../../build/code/src/gtl/index.js";
export { LANGUAGE_TEST_IDS, LANGUAGE_TEST_DIRECT_IDS, constructLanguageTestInput, evaluateLanguageTestResult } from "./language-smoke-fixture.mjs";
export function constructLanguageTestModulePublication(artifact) {
  return constructLanguageTestPublication(gtl, artifact);
}
