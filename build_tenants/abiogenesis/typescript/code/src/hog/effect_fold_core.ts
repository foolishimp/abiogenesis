import * as Effect from "effect/Effect";

/**
 * Authority-neutral state for one direct fold evaluation.
 *
 * The type parameters are existing GTL step and owner-receipt types at the
 * call site. This module does not define an owner command, lifecycle event, or
 * semantic receipt algebra.
 */
export interface DirectEffectFoldEvaluate<
  Coordinate,
  Value,
  ReturnFrame,
  Step,
> {
  readonly stateKind: "evaluate";
  readonly coordinate: Readonly<Coordinate>;
  readonly value: Readonly<Value>;
  readonly returns: readonly Readonly<ReturnFrame>[];
  readonly step: Readonly<Step>;
}

export interface DirectEffectFoldReturn<
  Coordinate,
  Value,
  ReturnFrame,
  Receipt,
> {
  readonly stateKind: "return";
  readonly coordinate: Readonly<Coordinate>;
  readonly value: Readonly<Value>;
  readonly returns: readonly Readonly<ReturnFrame>[];
  readonly receipt: Readonly<Receipt>;
}

export interface DirectEffectFoldDone<Receipt> {
  readonly stateKind: "done";
  readonly receipt: Readonly<Receipt>;
}

export type DirectEffectFoldOpenState<
  Coordinate,
  Value,
  ReturnFrame,
  Step,
  Receipt,
> =
  | DirectEffectFoldEvaluate<Coordinate, Value, ReturnFrame, Step>
  | DirectEffectFoldReturn<Coordinate, Value, ReturnFrame, Receipt>;

export type DirectEffectFoldState<
  Coordinate,
  Value,
  ReturnFrame,
  Step,
  Receipt,
> =
  | DirectEffectFoldOpenState<Coordinate, Value, ReturnFrame, Step, Receipt>
  | DirectEffectFoldDone<Receipt>;

function immutableReturnStack<ReturnFrame>(
  returns: readonly Readonly<ReturnFrame>[],
): readonly Readonly<ReturnFrame>[] {
  return Object.freeze([...returns]);
}

export function evaluateDirectEffectFold<
  Coordinate,
  Value,
  ReturnFrame,
  Step,
>(input: Readonly<{
  coordinate: Readonly<Coordinate>;
  value: Readonly<Value>;
  returns: readonly Readonly<ReturnFrame>[];
  step: Readonly<Step>;
}>): DirectEffectFoldEvaluate<Coordinate, Value, ReturnFrame, Step> {
  return Object.freeze({
    stateKind: "evaluate" as const,
    coordinate: input.coordinate,
    value: input.value,
    returns: immutableReturnStack(input.returns),
    step: input.step,
  });
}

export function returnDirectEffectFold<
  Coordinate,
  Value,
  ReturnFrame,
  Receipt,
>(input: Readonly<{
  coordinate: Readonly<Coordinate>;
  value: Readonly<Value>;
  returns: readonly Readonly<ReturnFrame>[];
  receipt: Readonly<Receipt>;
}>): DirectEffectFoldReturn<Coordinate, Value, ReturnFrame, Receipt> {
  return Object.freeze({
    stateKind: "return" as const,
    coordinate: input.coordinate,
    value: input.value,
    returns: immutableReturnStack(input.returns),
    receipt: input.receipt,
  });
}

export function completeDirectEffectFold<Receipt>(
  receipt: Readonly<Receipt>,
): DirectEffectFoldDone<Receipt> {
  return Object.freeze({
    stateKind: "done" as const,
    receipt,
  });
}

/**
 * One stack-safe fold. The supplied transition is the only place where an
 * existing exact owner Effect may be invoked. This function deliberately
 * returns an Effect and never runs it.
 */
export function directEffectFold<
  Coordinate,
  Value,
  ReturnFrame,
  Step,
  Receipt,
  Error = never,
  Requirements = never,
>(
  initial: DirectEffectFoldOpenState<
    Coordinate,
    Value,
    ReturnFrame,
    Step,
    Receipt
  >,
  transition: (
    state: DirectEffectFoldOpenState<
      Coordinate,
      Value,
      ReturnFrame,
      Step,
      Receipt
    >,
  ) => Effect.Effect<
    DirectEffectFoldState<Coordinate, Value, ReturnFrame, Step, Receipt>,
    Error,
    Requirements
  >,
): Effect.Effect<Readonly<Receipt>, Error, Requirements> {
  type State = DirectEffectFoldState<
    Coordinate,
    Value,
    ReturnFrame,
    Step,
    Receipt
  >;
  type OpenState = DirectEffectFoldOpenState<
    Coordinate,
    Value,
    ReturnFrame,
    Step,
    Receipt
  >;

  return Effect.suspend(() =>
    Effect.map(
      Effect.iterate<State, OpenState, Requirements, Error>(initial, {
        while: (state): state is OpenState => state.stateKind !== "done",
        body: (state) => Effect.suspend(() => transition(state)),
      }),
      (state) => (state as DirectEffectFoldDone<Receipt>).receipt,
    )
  );
}
