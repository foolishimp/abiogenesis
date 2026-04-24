import type {
  DispatchAssessmentExpectation,
  DispatchExpectation
} from "./carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeAssessments(
  values: readonly string[]
): readonly DispatchAssessmentExpectation[] {
  return Object.freeze(
    values.map((id) =>
      Object.freeze({
        id
      })
    )
  );
}

function normalizeAssessmentIds(values: readonly string[]): readonly string[] {
  const normalized = values.filter((value) => value.length > 0);
  const unique = new Set<string>();
  for (const value of normalized) {
    if (unique.has(value)) {
      throw new TypeError(
        `DispatchExpectation.assessments: duplicate value ${JSON.stringify(value)}`
      );
    }
    unique.add(value);
  }
  return freezeStringArray([...unique]);
}

export function constructDispatchExpectation(input: {
  readonly expectedEdge: string | null;
  readonly assessmentIds: readonly string[];
}): DispatchExpectation {
  return Object.freeze({
    expectedEdge: input.expectedEdge,
    assessments: freezeAssessments(normalizeAssessmentIds(input.assessmentIds))
  });
}

export function deriveDispatchExpectation(input: {
  readonly sourceKinds: readonly string[];
  readonly targetKind: string | null;
  readonly assessmentIds: readonly string[];
}): DispatchExpectation {
  const sourceKinds = input.sourceKinds.filter((kind) => kind.length > 0);
  const targetKind = input.targetKind ?? "";
  const expectedEdge =
    sourceKinds.length === 0 || targetKind.length === 0
      ? null
      : `${sourceKinds.join("&")}→${targetKind}`;
  return constructDispatchExpectation({
    expectedEdge,
    assessmentIds: input.assessmentIds
  });
}

export function projectDispatchExpectedEdge(
  expectation: DispatchExpectation
): string | null {
  return expectation.expectedEdge;
}

export function projectDispatchAssessmentIds(
  expectation: DispatchExpectation
): readonly string[] {
  return freezeStringArray(
    expectation.assessments.map((assessment) => assessment.id)
  );
}
