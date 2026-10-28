// T-287 Phase D, D5-c item 2: the time projection of the assessment plan from the D3 natives' observed per-call latency.
// The D3 natives are the provider calls of the six Hello workloads on the candidate pack (phase_d.md "D3 record"): each
// call's prompt bytes (its archived prompt file), and from its archived provider stream's result row its turns, wall
// duration, API duration, time to first token and token usage. The projection per slot is a least-squares fit of the
// wall duration of the D3 calls of one structured response (two turns) on their prompt bytes and output tokens,
// applied to the slot's prompt and modelled output: an extrapolation, since no D3 prompt is near the slots' size, and
// labelled so with its ratio. Concurrent assess@5 runs are not permitted by the runtime (one exclusive append lock on the
// durable event sink, abg/event_store.ts:1594-1597), so the projection is sequential only.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

export const D3_RUNS = Object.freeze(['rust-cli/2026-10-28T12-16-56-187Z-f038597f-3224-43da-b940-43d209006f72',
  'basic-cli/2026-10-28T12-31-34-745Z-acf2deb3-b674-4cca-b649-235cb73c1d3e', 'js-tenant-test/2026-10-28T12-44-51-631Z-630c7d9c-519d-4ecb-9b45-87e89bc1b8c2',
  'rust-service/2026-10-28T13-26-41-551Z-acada2d7-2c7f-4908-8da1-167dbd6abb56', 'parallel-js/2026-10-28T13-45-09-711Z-a9dfda84-381e-46a6-9b50-2148bbc1fbc7',
  'js-sdlc-bootstrap/2026-10-28T15-49-00-793Z-a668d062-3e5d-407c-abd5-6b7794dd427a']);

/** Every provider call of the D3 runs, from their archives. */
export async function d3Calls(sandboxRoot) {
  const calls = [];
  for (const run of D3_RUNS) {
    const archive = join(sandboxRoot, run, 'resources/archives');
    for (const name of (await readdir(archive)).filter(n => n.endsWith('-stdout.log')).sort()) {
      const label = name.slice(0, -'-stdout.log'.length), lines = (await readFile(join(archive, name), 'utf8')).trim().split('\n');
      const result = lines.map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(r => r?.type === 'result').at(-1);
      if (result === undefined) continue;
      const promptBytes = (await stat(join(archive, label + '-prompt.txt'))).size, u = result.usage ?? {};
      calls.push({ run, label, promptBytes, turns: result.num_turns, durationMs: result.duration_ms, apiDurationMs: result.duration_api_ms ?? null,
        ttftMs: result.ttft_ms ?? null, inputTokens: u.input_tokens ?? 0, cacheCreationTokens: u.cache_creation_input_tokens ?? 0,
        cacheReadTokens: u.cache_read_input_tokens ?? 0, outputTokens: u.output_tokens ?? 0, usd: result.total_cost_usd ?? null, isError: result.is_error === true });
    }
  }
  return calls;
}

/** Least squares by the normal equations (Gaussian elimination with partial pivoting). */
function leastSquares(rows, ys) {
  const k = rows[0].length, a = Array.from({ length: k }, () => new Array(k + 1).fill(0));
  rows.forEach((x, n) => { for (let i = 0; i < k; i++) { for (let j = 0; j < k; j++) a[i][j] += x[i] * x[j]; a[i][k] += x[i] * ys[n]; } });
  for (let c = 0; c < k; c++) {
    let p = c; for (let r = c + 1; r < k; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    if (Math.abs(a[c][c]) < 1e-12) throw new TypeError('singular latency fit');
    for (let r = 0; r < k; r++) if (r !== c) { const f = a[r][c] / a[c][c]; for (let j = c; j <= k; j++) a[r][j] -= f * a[c][j]; }
  }
  return a.map((row, i) => row[k] / row[i]);
}

/** The latency model over the D3 calls of one structured response (two provider turns, the shape of an assess@5
 * call): wall ms = intercept + ms per prompt byte × prompt bytes + ms per output token × output tokens, by least squares.
 * Applied to a slot it is an extrapolation by the ratio of the slot's prompt to the largest D3 prompt. */
export function fitLatency(calls) {
  const used = calls.filter(c => !c.isError && Number.isFinite(c.durationMs) && c.turns === 2);
  const [interceptMs, perPromptByteMs, perOutputTokenMs] = leastSquares(used.map(c => [1, c.promptBytes, c.outputTokens]), used.map(c => c.durationMs));
  const predicted = used.map(c => interceptMs + perPromptByteMs * c.promptBytes + perOutputTokenMs * c.outputTokens);
  const residual = Math.sqrt(used.reduce((s, c, n) => s + (c.durationMs - predicted[n]) ** 2, 0) / used.length);
  const bytesPerToken = used.map(c => c.promptBytes / (c.inputTokens + c.cacheCreationTokens + c.cacheReadTokens));
  const span = key => ({ min: Math.min(...used.map(c => c[key])), max: Math.max(...used.map(c => c[key])) });
  return { calls: used.length, allCalls: calls.length, interceptMs, perPromptByteMs, perOutputTokenMs, rmsResidualMs: Math.round(residual),
    observedPromptBytesPerInputToken: { mean: Number((bytesPerToken.reduce((s, x) => s + x, 0) / bytesPerToken.length).toFixed(3)),
      basis: 'archived prompt bytes over all input tokens of each two-turn call (C-call prompts: JSON with digests)' },
    observed: { promptBytes: span('promptBytes'), outputTokens: span('outputTokens'), durationMs: { ...span('durationMs'), total: used.reduce((s, c) => s + c.durationMs, 0) },
      allCallsDurationMs: calls.reduce((s, c) => s + (c.durationMs ?? 0), 0) } };
}

/** The plan's time: each slot one structured response with its prompt bytes and modelled output tokens, sequential. */
export function projectTime(rows, model, { c2Ms = null } = {}) {
  const perSlot = rows.map(r => Math.max(0, model.interceptMs + model.perPromptByteMs * r.promptBytes + model.perOutputTokenMs * r.outputTokens));
  const assessMs = perSlot.reduce((s, ms) => s + ms, 0), sequentialMs = assessMs + (c2Ms ?? 0);
  const largest = Math.max(...rows.map(r => r.promptBytes));
  return { calls: rows.length + (c2Ms === null ? 0 : 1), assessCalls: rows.length, perSlotMs: { min: Math.round(Math.min(...perSlot)), max: Math.round(Math.max(...perSlot)),
    mean: Math.round(assessMs / rows.length) }, assessMs: Math.round(assessMs), c2Ms, sequentialMs: Math.round(sequentialMs), sequentialHours: Number((sequentialMs / 3.6e6).toFixed(1)),
    extrapolation: { largestSlotPromptBytes: largest, largestObservedPromptBytes: model.observed.promptBytes.max, ratio: Number((largest / model.observed.promptBytes.max).toFixed(1)) },
    parallelism4: { permitted: false, reason: 'One exclusive append lock on the durable event sink (abg/event_store.ts:1594-1597): a second assess@5 run against the same event resource is refused while one holds the lock; the F11 fold reads every judgment from that one prefix (abg/qualification_proof.ts:507-511, :677-700)' } };
}
