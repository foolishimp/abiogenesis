import * as Effect from "effect/Effect";

import {
  type DefinitionCall,
  type DefinitionExecutionFault,
  type DefinitionReturn,
  type ExactDefinitionCallable,
} from "../shared/effect_definition.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  admitRuntimeContract,
  type OwnerSemanticOutput,
} from "../shared/public_function_contracts.js";
import {
  RELEASE_OPERATION_CONTRACTS,
  ReleaseSnapshotPort,
  type ReleaseSnapshotOperationResult,
} from "./release_snapshot_operations.js";

type PublishedRcPacket =
  typeof RELEASE_OPERATION_CONTRACTS.snapshot.published_rc;
type TappedReleasePacket =
  typeof RELEASE_OPERATION_CONTRACTS.snapshot.tapped_release;
type ReleaseSnapshotPacket = PublishedRcPacket | TappedReleasePacket;

function fault<TPacket extends ReleaseSnapshotPacket>(
  call: DefinitionCall<TPacket, null>,
  stage: string,
  code: string,
  message: string,
): DefinitionExecutionFault<TPacket["definitionKey"]> {
  return deepFreeze({
    kind: "definition_execution_fault" as const,
    schemaVersion: "5.0.0" as const,
    definitionKey: call.invocation.definitionKey,
    stage,
    code,
    message,
    evidence: {},
  });
}

function publishedRcOutput(
  nativeOutput: Awaited<ReturnType<typeof ReleaseSnapshotPort.published_rc>>,
): OwnerSemanticOutput<PublishedRcPacket> {
  switch (nativeOutput.outcomeKind) {
    case "result":
      throw new TypeError(
        "published RC owner returned a result before release publication authority exists",
      );
    case "refusal": {
      const operationResult: ReleaseSnapshotOperationResult = nativeOutput.value;
      switch (operationResult.kind) {
        case "release_snapshot_refusal": {
          if (operationResult.memberKey !== "published_rc") {
            throw new TypeError(
              "published RC owner returned another release member's refusal",
            );
          }
          const ownerOutput = Object.freeze({
            outcomeKind: "refusal" as const,
            value: operationResult,
          });
          if (
            admitRuntimeContract(
              RELEASE_OPERATION_CONTRACTS.snapshot.published_rc.refusalSchema,
              ownerOutput.value,
            ).disposition !== "admitted"
          ) {
            throw new TypeError(
              "published RC owner refusal differs from its exact contract",
            );
          }
          return ownerOutput;
        }
      }
    }
  }
}

function tappedReleaseOutput(
  nativeOutput: Awaited<ReturnType<typeof ReleaseSnapshotPort.tapped_release>>,
): OwnerSemanticOutput<TappedReleasePacket> {
  switch (nativeOutput.outcomeKind) {
    case "result":
      throw new TypeError(
        "tapped release owner returned a result before release publication authority exists",
      );
    case "refusal": {
      const operationResult: ReleaseSnapshotOperationResult = nativeOutput.value;
      switch (operationResult.kind) {
        case "release_snapshot_refusal": {
          if (operationResult.memberKey !== "tapped_release") {
            throw new TypeError(
              "tapped release owner returned another release member's refusal",
            );
          }
          const ownerOutput = Object.freeze({
            outcomeKind: "refusal" as const,
            value: operationResult,
          });
          if (
            admitRuntimeContract(
              RELEASE_OPERATION_CONTRACTS.snapshot.tapped_release.refusalSchema,
              ownerOutput.value,
            ).disposition !== "admitted"
          ) {
            throw new TypeError(
              "tapped release owner refusal differs from its exact contract",
            );
          }
          return ownerOutput;
        }
      }
    }
  }
}

const published_rc: ExactDefinitionCallable<PublishedRcPacket, null, null> =
  (call) => {
    if (call.resources !== null) {
      return Effect.fail(fault(
        call,
        "resource_admission",
        "invalid_resource_assertion",
        "published RC is a T0 value-only definition and requires null resources",
      ));
    }
    return Effect.tryPromise({
      try: () => Promise.resolve(ReleaseSnapshotPort.published_rc(call.invocation)),
      catch: (cause) => fault(
        call,
        "owner_execution",
        "release_snapshot_execution_failure",
        String(cause),
      ),
    }).pipe(Effect.flatMap((nativeOutput) => Effect.try({
      try: (): DefinitionReturn<PublishedRcPacket, null> => deepFreeze({
        ownerOutput: publishedRcOutput(nativeOutput),
        resources: null,
      }),
      catch: (cause) => fault(
        call,
        "owner_projection",
        "invalid_release_snapshot_owner_output",
        String(cause),
      ),
    })));
  };

const tapped_release: ExactDefinitionCallable<TappedReleasePacket, null, null> =
  (call) => {
    if (call.resources !== null) {
      return Effect.fail(fault(
        call,
        "resource_admission",
        "invalid_resource_assertion",
        "tapped release is a T0 value-only definition and requires null resources",
      ));
    }
    return Effect.tryPromise({
      try: () => Promise.resolve(ReleaseSnapshotPort.tapped_release(call.invocation)),
      catch: (cause) => fault(
        call,
        "owner_execution",
        "release_snapshot_execution_failure",
        String(cause),
      ),
    }).pipe(Effect.flatMap((nativeOutput) => Effect.try({
      try: (): DefinitionReturn<TappedReleasePacket, null> => deepFreeze({
        ownerOutput: tappedReleaseOutput(nativeOutput),
        resources: null,
      }),
      catch: (cause) => fault(
        call,
        "owner_projection",
        "invalid_release_snapshot_owner_output",
        String(cause),
      ),
    })));
  };

export const RELEASE_SNAPSHOT_DEFINITION_BINDINGS = Object.freeze({
  snapshot: Object.freeze({
    published_rc,
    tapped_release,
  }),
});
