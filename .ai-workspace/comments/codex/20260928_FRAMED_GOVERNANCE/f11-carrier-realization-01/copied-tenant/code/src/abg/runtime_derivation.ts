import type { RuntimeEvent } from "./event_store.js";

const SNAPSHOT = Symbol("owner_runtime_derivation_snapshot");

/** Disposable computation territory, never event or durable authority. Each
 * owner key names its one ordered relation. A rollback abandons the territory. */
export class RuntimeDerivationScope {
  readonly #owners = new Map<symbol, unknown>();
  #events: readonly RuntimeEvent[] = [];
  accepts(events: readonly RuntimeEvent[]): boolean {
    if (!sharesRuntimeEventPrefix(events, this.#events)) return false;
    if (events.length > this.#events.length) this.#events = events;
    return true;
  }
  invalidate(): void { this.#owners.clear(); this.#events = []; }
  owner<T>(key: symbol, construct: () => T): T {
    if (!this.#owners.has(key)) this.#owners.set(key, construct());
    return this.#owners.get(key) as T;
  }
}

export class RuntimeDerivationSource {
  readonly #scopes = new Map<string, RuntimeDerivationScope>();
  invalidate(): void { for (const scope of this.#scopes.values()) scope.invalidate(); this.#scopes.clear(); }
  snapshot(events: readonly RuntimeEvent[]): readonly RuntimeEvent[] {
    if (SnapshotProof.source(events) === this) return events;
    const snapshot = [...events];
    Object.defineProperty(snapshot, SNAPSHOT, { value: new SnapshotProof(snapshot, this) });
    return Object.freeze(snapshot);
  }
  append(events: readonly RuntimeEvent[], suffix: readonly RuntimeEvent[]): readonly RuntimeEvent[] {
    if (suffix.length === 0) return this.snapshot(events);
    const snapshot = [...events, ...suffix];
    Object.defineProperty(snapshot, SNAPSHOT, { value: new SnapshotProof(snapshot, this,
      SnapshotProof.source(events) === this ? events : undefined, events.length) });
    return Object.freeze(snapshot);
  }
  prefix(events: readonly RuntimeEvent[], length: number): readonly RuntimeEvent[] {
    if (!Number.isSafeInteger(length) || length < 0 || length > events.length) throw new TypeError("invalid snapshot prefix length");
    if (length === events.length) return this.snapshot(events);
    const snapshot = events.slice(0, length);
    Object.defineProperty(snapshot, SNAPSHOT, { value: new SnapshotProof(snapshot, this,
      SnapshotProof.source(events) === this ? events : undefined, length) });
    return Object.freeze(snapshot);
  }
  hasPrefix(events: readonly RuntimeEvent[], prefix: readonly RuntimeEvent[]): boolean {
    return events.length >= prefix.length && sharesRuntimeEventPrefix(events, prefix);
  }
  scope(key: string, events: readonly RuntimeEvent[]): RuntimeDerivationScope {
    let scope = this.#scopes.get(key);
    if (scope === undefined || !scope.accepts(events)) {
      scope = new RuntimeDerivationScope();
      scope.accepts(events);
      this.#scopes.set(key, scope);
    }
    return scope;
  }
}

class SnapshotProof {
  readonly #snapshot: WeakRef<readonly RuntimeEvent[]>;
  readonly #source: RuntimeDerivationSource;
  readonly #parent: SnapshotProof | undefined;
  readonly #shared: number;
  constructor(snapshot: readonly RuntimeEvent[], source: RuntimeDerivationSource,
    parent?: readonly RuntimeEvent[], shared = 0) {
    this.#snapshot = new WeakRef(snapshot); this.#source = source;
    this.#parent = parent === undefined ? undefined : SnapshotProof.for(parent);
    this.#shared = shared; Object.freeze(this);
  }
  static for(events: readonly RuntimeEvent[]): SnapshotProof | undefined {
    const proof: unknown = Object.getOwnPropertyDescriptor(events, SNAPSHOT)?.value;
    return typeof proof === "object" && proof !== null && #snapshot in proof && proof.#snapshot.deref() === events
      ? proof : undefined;
  }
  static source(events: readonly RuntimeEvent[]): RuntimeDerivationSource | undefined {
    const proof = this.for(events);
    return proof === undefined ? undefined : proof.#source;
  }
  /** Only an owner-constructed append/cut proves an unchanged prefix. Raw
   * snapshots and unrelated branches retain the event-identity comparison. */
  static sharesPrefix(left: readonly RuntimeEvent[], right: readonly RuntimeEvent[]): boolean {
    const common = Math.min(left.length, right.length);
    const follows = (proof: SnapshotProof | undefined, target: SnapshotProof | undefined): boolean => {
      if (target === undefined) return false;
      while (proof !== target) {
        if (proof === undefined || proof.#parent === undefined || proof.#shared < common) return false;
        proof = proof.#parent;
      }
      return true;
    };
    const a = this.for(left), b = this.for(right);
    return follows(a, b) || follows(b, a);
  }
}

/** Exact owner snapshot identity; it does not certify payload immutability. */
export function ownedRuntimeDerivationSource(events: readonly RuntimeEvent[]): RuntimeDerivationSource | undefined {
  return SnapshotProof.source(events);
}
export function runtimeDerivationSource(events: readonly RuntimeEvent[]): RuntimeDerivationSource {
  return ownedRuntimeDerivationSource(events) ?? new RuntimeDerivationSource();
}

/** Structural identity only; no payload or durable-resource authentication. */
function sharesRuntimeEventPrefix(events: readonly RuntimeEvent[], prior: readonly RuntimeEvent[]): boolean {
  if (events === prior || SnapshotProof.sharesPrefix(events, prior)) return true;
  const common = Math.min(events.length, prior.length);
  for (let i = 0; i < common; i++) if (events[i] !== prior[i]) return false;
  return true;
}
