export interface QualificationGapRef<K extends string> {
  readonly kind: K;
  readonly ref: string;
}

export type QualificationGapFactory<K extends string, G> = (
  kind: K,
  ref: string
) => G;

export interface QualificationObligation<K extends string> {
  readonly satisfied: boolean;
  readonly gapKind: K;
  readonly ref: string;
}

export function qualificationObligation<K extends string>(
  satisfied: boolean,
  kind: K,
  ref: string
): QualificationObligation<K> {
  return Object.freeze({
    satisfied,
    gapKind: kind,
    ref
  });
}

export function collectQualificationObligationGaps<K extends string, G>(input: {
  readonly obligations: readonly QualificationObligation<K>[];
  readonly constructGap: QualificationGapFactory<K, G>;
}): readonly G[] {
  return Object.freeze(
    input.obligations
      .filter((obligation) => !obligation.satisfied)
      .map((obligation) =>
        input.constructGap(obligation.gapKind, obligation.ref)
      )
  );
}

export function collectMissingRequiredRefs<K extends string, G>(input: {
  readonly observed: readonly string[];
  readonly required: readonly string[];
  readonly refPrefix: string;
  readonly missingKind: K;
  readonly constructGap: QualificationGapFactory<K, G>;
}): readonly G[] {
  return collectQualificationObligationGaps({
    constructGap: input.constructGap,
    obligations: input.required.map((ref) =>
      qualificationObligation(
        input.observed.includes(ref),
        input.missingKind,
        `${input.refPrefix}:${ref}`
      )
    )
  });
}

export function collectRequiredScenarioCardinalityGaps<
  Scenario,
  K extends string,
  G
>(input: {
  readonly scenarios: readonly Scenario[];
  readonly scenarioName: string;
  readonly getScenarioName: (scenario: Scenario) => string;
  readonly constructGap: QualificationGapFactory<K, G>;
  readonly missingKind: K;
  readonly duplicateKind: K;
}): {
  readonly matches: readonly Scenario[];
  readonly gaps: readonly G[];
} {
  const matches = input.scenarios.filter(
    (scenario) => input.getScenarioName(scenario) === input.scenarioName
  );
  const gaps = collectQualificationObligationGaps({
    constructGap: input.constructGap,
    obligations: Object.freeze([
      qualificationObligation(
        matches.length > 0,
        input.missingKind,
        input.scenarioName
      ),
      qualificationObligation(
        matches.length <= 1,
        input.duplicateKind,
        input.scenarioName
      )
    ])
  });

  return Object.freeze({
    matches: Object.freeze(matches),
    gaps
  });
}

export function collectMissingEventKindGaps<K extends string, G>(input: {
  readonly observedEventKinds: readonly string[];
  readonly requiredEventKinds: readonly string[];
  readonly refPrefix: string;
  readonly constructGap: QualificationGapFactory<K, G>;
  readonly missingKind: K;
}): readonly G[] {
  return collectMissingRequiredRefs({
    observed: input.observedEventKinds,
    required: input.requiredEventKinds,
    refPrefix: input.refPrefix,
    missingKind: input.missingKind,
    constructGap: input.constructGap
  });
}
