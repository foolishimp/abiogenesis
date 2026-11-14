import { pathRelation, pathWithin } from "./path_confinement.js";
import type { PhysicalProgram } from "./physical_path_observation.js";
import { physicalSeparationProgram, type PhysicalRelationMode } from "./physical_path_relation.js";

// The existing C2 WorkspaceBinding root boundary (T-287 C2 section 5, T-293
// B21). The synchronous host and the asynchronous helper each run this one
// program independently over the roots they themselves derived from the exact
// admitted task; neither trusts the other's result and no flag or task field
// carries it. Each caller keeps its own canonical-spelling derivation and its
// attempt-locus checks. Overlap and unproved separation both refuse through
// the existing TypeError refusal before any snapshot, result, launch or
// command effect.

/** The six binding roots, each in its caller's planned canonical spelling. */
export interface WorksiteCommandBindingRoots {
  readonly productRoot: string;
  readonly toolchainRoot: string;
  readonly eventLogRoot: string;
  readonly runtimeStateRoot: string;
  readonly projectionRoot: string;
  readonly archiveRoot: string;
}

function* requireSeparation(
  targets: readonly string[],
  protectedRoots: readonly string[],
  mode: PhysicalRelationMode,
  label: string,
): PhysicalProgram<void> {
  const finding = yield* physicalSeparationProgram({ targets, protectedRoots, mode });
  if (finding !== null) {
    throw new TypeError(finding.separation === "overlap"
      ? `${label} overlaps a protected workspace root (${finding.reason})`
      : `${label}: protected-root separation cannot be established: ${finding.reason}`);
  }
}

/**
 * 1. The archive is recursive: lexical or physical equality, containment or
 *    enclosure with any other binding root refuses.
 * 2. The directional Product-root rule: toolchain, event-log, runtime-state
 *    and projection roots must not equal or lie inside the Product root,
 *    lexically or physically; a proven enclosing ancestor remains lawful.
 */
export function* worksiteCommandRootBoundary(roots: WorksiteCommandBindingRoots): PhysicalProgram<void> {
  const nonArchiveRoots = [roots.productRoot, roots.toolchainRoot, roots.eventLogRoot, roots.runtimeStateRoot, roots.projectionRoot];
  if (nonArchiveRoots.some((root) =>
    pathWithin(pathRelation(root, roots.archiveRoot)) || pathWithin(pathRelation(roots.archiveRoot, root)))) {
    throw new TypeError("command execution archive root overlaps a protected workspace root");
  }
  yield* requireSeparation([roots.archiveRoot], nonArchiveRoots, "enclosing", "command execution archive root");
  const mechanicsRoots = [roots.eventLogRoot, roots.runtimeStateRoot, roots.projectionRoot, roots.toolchainRoot];
  if (mechanicsRoots.some((root) => pathWithin(pathRelation(roots.productRoot, root)))) {
    throw new TypeError("command execution workspace mechanics overlap the Product root");
  }
  yield* requireSeparation(mechanicsRoots, [roots.productRoot], "contained", "command execution workspace mechanics");
}
