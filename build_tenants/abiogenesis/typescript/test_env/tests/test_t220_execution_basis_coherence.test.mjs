// Validates: REQ-L-GTL3-C-ALGEBRA-010/-013/-016.
// Malformed authored GTL must fail during basis compilation.

import test from "node:test";
import assert from "node:assert/strict";

import {
  buildThreeStageBasis
} from "./support/m03-iteration-fixtures.mjs";
import {
  compileHogProgramLadder
} from "../../build/semantic/code/src/abg/m03/index.js";

test("basis admission compiles authored execution declarations before effects", () => {
  assert.throws(
    () =>
      buildThreeStageBasis({
        defaultRegime: "F_D",
        dispatchRef: null,
        graphFunctionDeclarationEntries: [
          {
            key: "abg.hog_program",
            value: {
              kind: "json_blob",
              value: {
                kind: "object",
                entries: [
                  { key: "syntaxVersion", value: "hog-syntax/unknown" },
                  { key: "programRef", value: "gtl://t220/unknown" }
                ]
              }
            }
          }
        ]
      }),
    /unknown program syntaxVersion/u
  );
});

test("basis compilation rejects malformed handler-binding output", () => {
  assert.throws(
    () =>
      buildThreeStageBasis({
        defaultRegime: "F_D",
        dispatchRef: null,
        graphFunctionDeclarationEntries: [
          {
            key: "abg.hog_handler_bindings",
            value: {
              kind: "json_blob",
              value: { kind: "array", items: [null] }
            }
          }
        ]
      }),
    /handler binding \[0\] must be an object row/u
  );
});

test("basis compilation preserves authored regimes for downstream composition judgment", () => {
  const stages = ["transform", "evaluate", "consequence"].map((stageRole) => ({
    kind: "object",
    entries: [
      { key: "stageRole", value: stageRole },
      { key: "defaultRegime", value: "F_H" },
      { key: "armId", value: `arm://t220/unsupported/${stageRole}` },
      { key: "resultBearing", value: stageRole === "transform" }
    ]
  }));
  assert.doesNotThrow(
    () =>
      buildThreeStageBasis({
        defaultRegime: "F_D",
        dispatchRef: null,
        graphFunctionDeclarationEntries: [
          {
            key: "abg.hog_program",
            value: {
              kind: "json_blob",
              value: {
                kind: "object",
                entries: [
                  { key: "syntaxVersion", value: "hog-syntax/1" },
                  { key: "programRef", value: "gtl://t220/unsupported" },
                  { key: "proportionalityClass", value: "P1" },
                  { key: "stages", value: { kind: "array", items: stages } }
                ]
              }
            }
          }
        ]
      })
  );
});

test("basis compilation preserves an open program without invented interpreter anchors", () => {
  assert.doesNotThrow(
    () =>
      buildThreeStageBasis({
        defaultRegime: "F_D",
        dispatchRef: null,
        graphFunctionDeclarationEntries: [
          {
            key: "abg.hog_program",
            value: {
              kind: "json_blob",
              value: {
                kind: "object",
                entries: [
                  { key: "syntaxVersion", value: "hog-syntax/1" },
                  { key: "programRef", value: "gtl://t220/custom-only" },
                  { key: "proportionalityClass", value: "P1" },
                  {
                    key: "stages",
                    value: {
                      kind: "array",
                      items: [
                        {
                          kind: "object",
                          entries: [
                            { key: "stageRole", value: "inspect" },
                            { key: "defaultRegime", value: "F_D" },
                            { key: "armId", value: "arm://t220/inspect" },
                            { key: "resultBearing", value: true }
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        ]
      })
  );
});

test("HoG ladder admission rejects invented rung semantics", () => {
  const result = compileHogProgramLadder([
    {
      programRef: "gtl://t220/ladder/one",
      fromAttempt: 1,
      untilAttempt: 2
    }
  ]);
  assert.equal(result.accepted, false);
  assert.match(result.issues.join("; "), /untilAttempt: unknown rung field/u);
});

test("basis compilation preserves authored stage order without imposing a canonical chain", () => {
  const stages = ["evaluate", "transform", "consequence"].map((stageRole) => ({
    kind: "object",
    entries: [
      { key: "stageRole", value: stageRole },
      { key: "defaultRegime", value: "F_D" },
      { key: "armId", value: `arm://t220/reordered/${stageRole}` },
      { key: "resultBearing", value: stageRole === "transform" }
    ]
  }));
  assert.doesNotThrow(
    () =>
      buildThreeStageBasis({
        defaultRegime: "F_D",
        dispatchRef: null,
        graphFunctionDeclarationEntries: [
          {
            key: "abg.hog_program",
            value: {
              kind: "json_blob",
              value: {
                kind: "object",
                entries: [
                  { key: "syntaxVersion", value: "hog-syntax/1" },
                  { key: "programRef", value: "gtl://t220/reordered" },
                  { key: "proportionalityClass", value: "P1" },
                  { key: "stages", value: { kind: "array", items: stages } }
                ]
              }
            }
          }
        ]
      })
  );
});
