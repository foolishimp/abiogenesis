import { type WorksiteExecutionTask } from "../product/worksite_revision.js";
/** Pure, prefix-owned provenance for the bounded worksite retention relation. */
import { type JsonValue } from "../shared/canonical_json.js";
import { type RawAdmittedValue } from "../validator/raw_admission.js";
import { type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import type { ExecutionBasis } from "./execution_basis.js";
import type { RuntimeEvent } from "./event_store.js";
/** Resolve an exact admitted input through transparent, closed workflow
 * foldbacks. Equal-valued results elsewhere are never candidate producers.
 * The caller still authenticates the selected native leaf's implementation and
 * outcome; this owner establishes only its exact input/foldback provenance. */
export declare function projectWorksiteInputLeafResultAtPrefix(prefix: ValidatedRuntimeEventPrefix, inputRef: string, inputDigest: string): RuntimeEvent | null;
export interface RetainedWorksiteInputProjection {
    readonly input: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
    readonly entryBasis: ExecutionBasis;
    readonly sourceBasis: ExecutionBasis;
    readonly sourceResult: RuntimeEvent;
    readonly sourceJudgment: RuntimeEvent;
    readonly foldback: RuntimeEvent;
    /** Present only after the exact same-Run preparation owner has joined it. */
    readonly preparationResult?: RuntimeEvent;
    readonly preparationJudgment?: RuntimeEvent;
}
/** Version the relations read by retained-input provenance, including new
 * matches that can invalidate cardinality. This selects no runtime truth: the
 * unchanged projector below still authenticates every changed relation. */
export declare function retainedWorksiteInputRelationVersion(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent): string;
/** Revalidates admitted route provenance, without loading an install or executing replay. */
export declare function projectRetainedWorksiteInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, route: RuntimeEvent): RetainedWorksiteInputProjection | null;
/** The observed arm claims preparation and file observation, never file authorship.
 * Start at the actual current occurrence before inspecting any equal-valued history. */
export declare function projectObservedWorksiteCommandChildAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
    parentBasis: ExecutionBasis;
    parentCCallRef: string;
    runId: string;
    task: unknown;
}>): {
    preparationResult: RuntimeEvent;
    preparationJudgment: RuntimeEvent;
    preparationCall: RuntimeEvent;
    acquisitionEvent: RuntimeEvent;
    inputRef: string;
    inputDigest: `sha256:${string}`;
    route: RuntimeEvent;
    sourceObservedInput: Readonly<{
        kind: "observed_worksite_input";
        sourceSetRef: string;
        sourceSetDigest: import("../shared/digests.js").Sha256Digest;
    }>;
    protectedObservations: readonly import("../product/worksite_command_execution.js").WorksiteProtectedObservation[];
} | null;
/** Source selection is obtained by following the actual preparation input/result edge. */
export declare function projectSameRunWorksiteCommandSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
    parentBasis: ExecutionBasis;
    parentCCallRef: string;
    runId: string;
    task: WorksiteExecutionTask;
}>): RetainedWorksiteInputProjection | null;
/** E_D is admitted from the actual D2 bridge edge, not a caller's root input. */
export declare function revisionEntryHasNativeBridge(prefix: ValidatedRuntimeEventPrefix, entry: ExecutionBasis): boolean;
export declare function revisionPreparationHasNativeBridgeSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
    parentBasis: ExecutionBasis;
    parentCCallRef: string;
    entry: unknown;
}>): boolean;
export declare function readDependencyEntryHasNativeBridge(prefix: ValidatedRuntimeEventPrefix, entry: ExecutionBasis): boolean;
export declare function readDependencyPreparationHasNativeBridgeSourceAtPrefix(prefix: ValidatedRuntimeEventPrefix, input: Readonly<{
    parentBasis: ExecutionBasis;
    parentCCallRef: string;
    entry: unknown;
}>): boolean;
