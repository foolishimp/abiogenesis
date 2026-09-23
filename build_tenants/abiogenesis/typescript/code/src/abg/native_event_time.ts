/**
 * Native observation time, sampled before constructing an event candidate or
 * admission basis. This is diagnostic wall time, never ordering or liveness law.
 *
 * Prepared plans retain their one explicit sample through rederivation and
 * admission. The event store and historical projectors do not read this clock
 * or replace timestamps on already-constructed candidates.
 * @internal
 */
export function sampleNativeEventTime(): string {
  return new Date().toISOString();
}
