// Projects admitted GTL C-algebra data into the legacy normalized HoG carrier.
// T-271 interprets the complete C tree; this lowerer remains the compatibility
// surface for direct forms that older consumers still understand.

import type {
  CAlgebraDiagnostic,
  CProgramDeclarationNode,
  CProgramNode
} from "../../../gtl/m01/algebra/c_algebra.js";
import {
  admitCProgramSyntax,
  constructCAlgebraDiagnostic,
  serializeCProgramCanonical
} from "../../../gtl/m01/algebra/c_algebra.js";
import type {
  HogProgramDeclaration,
  HogProgramStage
} from "./hog_program.js";
import { admitHogProgram } from "./hog_program.js";
import { deriveCRetryPolicyProjection } from "./c_retry_policy.js";

export interface CAlgebraHogCompilation {
  readonly accepted: boolean;
  readonly program: HogProgramDeclaration | null;
  readonly canonicalSource: string | null;
  readonly diagnostics: readonly CAlgebraDiagnostic[];
}

interface FlattenResult {
  readonly stages: readonly HogProgramStage[];
  readonly diagnostics: readonly CAlgebraDiagnostic[];
}

function flattenTerm(term: CProgramNode, path: string): FlattenResult {
  switch (term.kind) {
    case "c_of":
      return Object.freeze({
        stages: Object.freeze([
          Object.freeze({
            stageRole: term.stageRole,
            defaultRegime: term.fibre,
            armId: term.armId,
            resultBearing: term.resultBearing,
            ...(term.instructionCategoryRefs === undefined
              ? {}
              : {
                  instructionCategoryRefs: Object.freeze([
                    ...term.instructionCategoryRefs
                  ])
                })
          })
        ]),
        diagnostics: Object.freeze([])
      });
    case "c_identity":
      return Object.freeze({
        stages: Object.freeze([]),
        diagnostics: Object.freeze([])
      });
    case "c_compose": {
      const left = flattenTerm(term.left, `${path}.left`);
      const right = flattenTerm(term.right, `${path}.right`);
      return Object.freeze({
        stages: Object.freeze([...left.stages, ...right.stages]),
        diagnostics: Object.freeze([
          ...left.diagnostics,
          ...right.diagnostics
        ])
      });
    }
    case "c_edge": {
      const transform = flattenTerm(term.transform, `${path}.transform`);
      const evaluate = flattenTerm(term.evaluate, `${path}.evaluate`);
      const consequence = flattenTerm(
        term.consequence,
        `${path}.consequence`
      );
      return Object.freeze({
        stages: Object.freeze([
          ...transform.stages,
          ...evaluate.stages,
          ...consequence.stages
        ]),
        diagnostics: Object.freeze([
          ...transform.diagnostics,
          ...evaluate.diagnostics,
          ...consequence.diagnostics
        ])
      });
    }
    case "c_workflow":
      return Object.freeze({
        stages: Object.freeze([]),
        diagnostics: Object.freeze([
          constructCAlgebraDiagnostic({
            diagnosticId: "gtl-c-unrealized-workflow-lift",
            path,
            message:
              `workflow.C(${JSON.stringify(term.graphFunctionRef)}) is lawful ` +
              "algebra but this mixed expression requires a normalized " +
              "ordering carrier beyond the direct workflow runtime",
            repairAffordances: Object.freeze([
              "use_flat_composition",
              "await_runtime_realization"
            ])
          })
        ])
      });
    case "c_batch":
      return Object.freeze({
        stages: Object.freeze([]),
        diagnostics: Object.freeze([
          constructCAlgebraDiagnostic({
            diagnosticId: "gtl-c-unrealized-batch",
            path,
            message:
              `C.batch(${JSON.stringify(term.batchRef)}) is lawful algebra ` +
              "but the current normalized HoG carrier cannot retain parent " +
              "batch identity and one-spine-per-task structure",
            repairAffordances: Object.freeze([
              "use_flat_composition",
              "await_runtime_realization"
            ])
          })
        ])
      });
    case "c_retry":
      return Object.freeze({
        stages: Object.freeze([]),
        diagnostics: Object.freeze([
          constructCAlgebraDiagnostic({
            diagnosticId: "gtl-c-unrealized-retry",
            path,
            message:
              `C.retry budget ${String(term.budget)} is lawful algebra but ` +
              "the current normalized HoG carrier cannot retain the declared " +
              "attempt budget under the one retry law",
            repairAffordances: Object.freeze([
              "use_flat_composition",
              "await_runtime_realization"
            ])
          })
        ])
      });
  }
}

function programShapeDiagnostics(
  stages: readonly HogProgramStage[]
): readonly CAlgebraDiagnostic[] {
  const diagnostics: CAlgebraDiagnostic[] = [];
  if (stages.length === 0) {
    diagnostics.push(
      constructCAlgebraDiagnostic({
        diagnosticId: "gtl-c-empty-executable-program",
        path: "$.term",
        message: "the flat C term contains no executable C.of leaf",
        repairAffordances: Object.freeze(["declare_executable_leaf"])
      })
    );
    return Object.freeze(diagnostics);
  }
  const resultBearingCount = stages.filter(
    (stage) => stage.resultBearing
  ).length;
  if (resultBearingCount === 0) {
    diagnostics.push(
      constructCAlgebraDiagnostic({
        diagnosticId: "gtl-c-no-result-bearing-stage",
        path: "$.term",
        message: "the flat C program must declare one result-bearing stage",
        repairAffordances: Object.freeze([
          "declare_exactly_one_result_stage"
        ])
      })
    );
  } else if (resultBearingCount > 1) {
    diagnostics.push(
      constructCAlgebraDiagnostic({
        diagnosticId: "gtl-c-multiple-result-bearing-stages",
        path: "$.term",
        message:
          `the flat C program declares ${String(resultBearingCount)} ` +
          "result-bearing stages; exactly one is required",
        repairAffordances: Object.freeze([
          "declare_exactly_one_result_stage"
        ])
      })
    );
  }
  return Object.freeze(diagnostics);
}

function compileAdmittedProgram(
  source: CProgramDeclarationNode
): CAlgebraHogCompilation {
  const canonicalSource = serializeCProgramCanonical(source);
  if (source.term.kind === "c_workflow") {
    const admission = admitHogProgram({
      kind: "hog_program_declaration",
      programRef: source.programRef,
      stages: Object.freeze([]),
      proportionalityClass: source.proportionalityClass,
      workflow: Object.freeze({
        kind: "hog_workflow_lift",
        inputCarrierRef: source.term.inputCarrierRef,
        outputCarrierRef: source.term.outputCarrierRef,
        graphFunctionRef: source.term.graphFunctionRef
      })
    });
    if (!admission.accepted || admission.program === null) {
      return Object.freeze({
        accepted: false,
        program: null,
        canonicalSource,
        diagnostics: Object.freeze(
          admission.issues.map((message, index) =>
            constructCAlgebraDiagnostic({
              diagnosticId: "gtl-c-hog-admission-failed",
              path: `$.compiled[${index}]`,
              message,
              repairAffordances: Object.freeze(["fix_declaration_shape"])
            })
          )
        )
      });
    }
    return Object.freeze({
      accepted: true,
      program: admission.program,
      canonicalSource,
      diagnostics: Object.freeze([])
    });
  }
  if (source.term.kind === "c_batch") {
    const tasks = [];
    for (const [index, task] of source.term.tasks.entries()) {
      if (task.kind !== "c_of") {
        return Object.freeze({
          accepted: false,
          program: null,
          canonicalSource,
          diagnostics: Object.freeze([
            constructCAlgebraDiagnostic({
              diagnosticId: "gtl-c-unrealized-batch",
              path: `$.term.tasks[${String(index)}]`,
              message:
                "T-260 direct C.batch realization accepts one direct C.of " +
                `leaf per task; observed ${JSON.stringify(task.kind)}`,
              repairAffordances: Object.freeze([
                "use_flat_composition",
                "await_runtime_realization"
              ])
            })
          ])
        });
      }
      const flattened = flattenTerm(task, `$.term.tasks[${String(index)}]`);
      const stage = flattened.stages[0];
      if (flattened.diagnostics.length !== 0 || stage === undefined) {
        return Object.freeze({
          accepted: false,
          program: null,
          canonicalSource,
          diagnostics: flattened.diagnostics
        });
      }
      tasks.push(
        Object.freeze({
          kind: "hog_batch_stage_task" as const,
          ordinal: index,
          stage
        })
      );
    }
    const admission = admitHogProgram({
      kind: "hog_program_declaration",
      programRef: source.programRef,
      stages: Object.freeze([]),
      proportionalityClass: source.proportionalityClass,
      batch: Object.freeze({
        kind: "hog_batch_declaration",
        batchRef: source.term.batchRef,
        inputCarrierRef: source.term.inputCarrierRef,
        outputCarrierRef: source.term.outputCarrierRef,
        tasks: Object.freeze(tasks)
      })
    });
    if (!admission.accepted || admission.program === null) {
      return Object.freeze({
        accepted: false,
        program: null,
        canonicalSource,
        diagnostics: Object.freeze(
          admission.issues.map((message, index) =>
            constructCAlgebraDiagnostic({
              diagnosticId: "gtl-c-hog-admission-failed",
              path: `$.compiled.batch[${String(index)}]`,
              message,
              repairAffordances: Object.freeze(["fix_declaration_shape"])
            })
          )
        )
      });
    }
    return Object.freeze({
      accepted: true,
      program: admission.program,
      canonicalSource,
      diagnostics: Object.freeze([])
    });
  }
  if (source.term.kind === "c_retry") {
    if (source.term.term.kind !== "c_of") {
      return Object.freeze({
        accepted: false,
        program: null,
        canonicalSource,
        diagnostics: Object.freeze([
          constructCAlgebraDiagnostic({
            diagnosticId: "gtl-c-unrealized-retry",
            path: "$.term.term",
            message:
              "T-261 direct C.retry realization accepts one direct C.of " +
              `leaf; observed ${JSON.stringify(source.term.term.kind)}`,
            repairAffordances: Object.freeze([
              "use_flat_composition",
              "await_runtime_realization"
            ])
          })
        ])
      });
    }
    const flattened = flattenTerm(source.term.term, "$.term.term");
    const stage = flattened.stages[0];
    if (flattened.diagnostics.length !== 0 || stage === undefined) {
      return Object.freeze({
        accepted: false,
        program: null,
        canonicalSource,
        diagnostics: flattened.diagnostics
      });
    }
    if (stage.resultBearing !== true) {
      return Object.freeze({
        accepted: false,
        program: null,
        canonicalSource,
        diagnostics: Object.freeze([
          constructCAlgebraDiagnostic({
            diagnosticId: "gtl-c-no-result-bearing-stage",
            path: "$.term.term.resultBearing",
            message: "direct root C.retry requires one result-bearing C.of leaf",
            repairAffordances: Object.freeze([
              "declare_exactly_one_result_stage"
            ])
          })
        ])
      });
    }
    const policy = deriveCRetryPolicyProjection();
    const admission = admitHogProgram({
      kind: "hog_program_declaration",
      programRef: source.programRef,
      stages: Object.freeze([]),
      proportionalityClass: source.proportionalityClass,
      retry: Object.freeze({
        kind: "hog_retry_declaration",
        inputCarrierRef: source.term.inputCarrierRef,
        outputCarrierRef: source.term.outputCarrierRef,
        maxAttempts: source.term.budget,
        stage,
        retryPolicyRef: policy.policyRef,
        retryPolicyDigest: policy.policyDigest
      })
    });
    if (!admission.accepted || admission.program === null) {
      return Object.freeze({
        accepted: false,
        program: null,
        canonicalSource,
        diagnostics: Object.freeze(
          admission.issues.map((message, index) =>
            constructCAlgebraDiagnostic({
              diagnosticId: "gtl-c-hog-admission-failed",
              path: `$.compiled.retry[${String(index)}]`,
              message,
              repairAffordances: Object.freeze(["fix_declaration_shape"])
            })
          )
        )
      });
    }
    return Object.freeze({
      accepted: true,
      program: admission.program,
      canonicalSource,
      diagnostics: Object.freeze([])
    });
  }
  const flattened = flattenTerm(source.term, "$.term");
  if (flattened.diagnostics.length > 0) {
    return Object.freeze({
      accepted: false,
      program: null,
      canonicalSource,
      diagnostics: flattened.diagnostics
    });
  }
  const shapeDiagnostics = programShapeDiagnostics(flattened.stages);
  if (shapeDiagnostics.length > 0) {
    return Object.freeze({
      accepted: false,
      program: null,
      canonicalSource,
      diagnostics: shapeDiagnostics
    });
  }
  const admission = admitHogProgram({
    kind: "hog_program_declaration",
    programRef: source.programRef,
    stages: flattened.stages,
    proportionalityClass: source.proportionalityClass
  });
  if (!admission.accepted || admission.program === null) {
    return Object.freeze({
      accepted: false,
      program: null,
      canonicalSource,
      diagnostics: Object.freeze(
        admission.issues.map((message, index) =>
          constructCAlgebraDiagnostic({
            diagnosticId: "gtl-c-hog-admission-failed",
            path: `$.compiled[${index}]`,
            message,
            repairAffordances: Object.freeze(["fix_declaration_shape"])
          })
        )
      )
    });
  }
  return Object.freeze({
    accepted: true,
    program: admission.program,
    canonicalSource,
    diagnostics: Object.freeze([])
  });
}

export function compileCAlgebraToHog(
  input: unknown
): CAlgebraHogCompilation {
  const admission = admitCProgramSyntax(input);
  if (!admission.accepted || admission.program === null) {
    return Object.freeze({
      accepted: false,
      program: null,
      canonicalSource: null,
      diagnostics: admission.diagnostics
    });
  }
  return compileAdmittedProgram(admission.program);
}
