import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";
/** Package-internal Effect host membrane shared by every installed program. */
export function runEffectProgram(program) {
    return Effect.runPromiseExit(program);
}
/**
 * The package's sole Effect-to-Promise execution membrane. Callers may
 * project this receipt, but they may not reinterpret an execution failure as
 * an owner refusal.
 */
export async function runExactDefinition(call, program) {
    const exit = await runEffectProgram(program);
    if (Exit.isSuccess(exit)) {
        const { ownerOutput, resources } = exit.value;
        return Object.freeze({
            kind: "definition_host_receipt",
            schemaVersion: "5.0.0",
            definitionKey: call.invocation.definitionKey,
            invocationRef: call.invocation.invocationRef,
            exitCode: ownerOutput.outcomeKind === "result"
                ? 0
                : ownerOutput.outcomeKind === "refusal"
                    ? 1
                    : 3,
            ownerOutput,
            resources,
            failure: null,
        });
    }
    const failure = Cause.failureOption(exit.cause);
    const typedFault = Option.isSome(failure) ? failure.value : null;
    return Object.freeze({
        kind: "definition_host_receipt",
        schemaVersion: "5.0.0",
        definitionKey: call.invocation.definitionKey,
        invocationRef: call.invocation.invocationRef,
        exitCode: 70,
        ownerOutput: null,
        resources: null,
        failure: Object.freeze({
            failureKind: typedFault === null
                ? "defect_or_interruption"
                : "typed_execution_fault",
            fault: typedFault,
            cause: Cause.pretty(exit.cause),
        }),
    });
}
