import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export async function acquireNewEmptyAppendSinkResource(
  createNewEmptyAppendSink,
  label = "abi5-event-store-",
) {
  const scratch = await mkdtemp(join(tmpdir(), label));
  const eventLogPath = join(scratch, "events.jsonl");
  const acquired = createNewEmptyAppendSink({
    kind: "new_empty_append_sink_request",
    schemaVersion: "5.0.0",
    eventLogPath,
  });
  if (!("store" in acquired)) {
    await rm(scratch, { force: true, recursive: true });
    throw new TypeError(
      `new-empty fixture acquisition refused: ${acquired.code}: ${acquired.message}`,
    );
  }
  const dispose = async () => {
    acquired.store.closeDurableLog();
    await rm(scratch, { force: true, recursive: true });
  };
  return { ...acquired, dispose };
}

export async function acquireNewEmptyAppendSinkFixture(
  context,
  createNewEmptyAppendSink,
  label = "abi5-event-store-",
) {
  const acquired = await acquireNewEmptyAppendSinkResource(
    createNewEmptyAppendSink,
    label,
  );
  context.after(acquired.dispose);
  return acquired;
}

export async function cloneEventPrefixResource(
  abg,
  eventStore,
  events,
  label = "abi5-event-prefix-clone-",
  sourceArtifactTruth,
) {
  const acquired = await acquireNewEmptyAppendSinkResource(
    abg.createNewEmptyAppendSink,
    label,
  );
  try {
    let predecessorPrefix = acquired.prefix;
    for (const expected of events) {
      if (expected.kind === "public_operation_artifact_admitted") {
        const payload = expected.payload;
        const basis = {
          operationId: payload.operationId,
          memberKey: payload.memberKey,
          definitionDigest: payload.definitionDigest,
          authorityScopeRef: payload.authorityScopeRef,
          authorityScopeDigest: payload.authorityScopeDigest,
          invocationRef: payload.invocationRef,
          invocationPayloadDigest: payload.invocationPayloadDigest,
          invocationDigest: payload.invocationDigest,
          correlationId: payload.correlationId,
          eventTime: expected.eventTime,
          causationEventRefs: payload.causationEventRefs,
          predecessorPrefix,
        };
        let admitted;
        if (payload.operationId === "abg.operation.product.install") {
          const sourceInstall = sourceArtifactTruth === undefined
            ? null
            : abg.projectAdmittedProductInstallByAdmissionEventRef(
                sourceArtifactTruth,
                expected.eventId,
              );
          if (sourceArtifactTruth !== undefined && sourceInstall === null) {
            throw new TypeError("event-prefix clone lacks its exact source install owner");
          }
          admitted = abg.admitProductInstall(
            acquired.store,
            sourceInstall?.candidate ?? structuredClone(payload.artifact),
            // The hydrated install is owner input; its stored lock-body cause
            // is reconstructed by the owner from the exact cloned predecessor.
            sourceInstall === null ? basis : { ...basis, causationEventRefs: [] },
            sourceInstall?.resolvedLock ?? structuredClone(payload.resolvedLock),
          );
        } else if (payload.operationId === "abg.operation.workspace.bind") {
          admitted = abg.admitWorkspaceBinding(
            acquired.store,
            structuredClone(payload.artifact),
            basis,
            structuredClone(payload.workspaceAuthorityBasis),
          );
        } else {
          throw new TypeError(
            `event-prefix owner clone encountered closed operation ${String(payload.operationId)}`,
          );
        }
        if (
          admitted.kind !== "artifact_owner_result" ||
          admitted.admissionEventRef !== expected.eventId
        ) {
          throw new TypeError(
            `event-prefix owner clone diverged: ${JSON.stringify(admitted)}`,
          );
        }
        predecessorPrefix = admitted.successorPrefix;
        continue;
      }
      const candidate = structuredClone(expected);
      delete candidate.eventId;
      delete candidate.admissionOrdinal;
      delete candidate.payloadDigest;
      delete candidate.eventContractDigest;
      const admitted = eventStore.admitRuntimeEvent(acquired.store, candidate);
      if (admitted.eventId !== expected.eventId) {
        throw new TypeError(
          `event-prefix runtime clone diverged at ${expected.eventId}`,
        );
      }
    }
    return acquired;
  } catch (error) {
    await acquired.dispose();
    throw error;
  }
}

export async function cloneEventPrefixFixture(
  context,
  abg,
  eventStore,
  events,
  label = "abi5-event-prefix-clone-",
  sourceArtifactTruth,
) {
  const acquired = await cloneEventPrefixResource(
    abg,
    eventStore,
    events,
    label,
    sourceArtifactTruth,
  );
  context.after(acquired.dispose);
  return acquired;
}

// TD-23: byte streams over durable logs that the store owner writes. Each log
// is written through a new empty sink and read back; the streams recombine its
// rows with framing and logical faults. `owner` supplies the build's
// createNewEmptyAppendSink, admitRuntimeEvent and sha256Canonical.
const TD23_READ = 64 * 1024;
async function td23Log(owner, correlations) {
  const acquired = await acquireNewEmptyAppendSinkResource(owner.createNewEmptyAppendSink, "abi5-td23-log-");
  try {
    const eventLogPath = fileURLToPath(acquired.prefix.eventLogRef);
    correlations.forEach((correlationId, index) => {
      const invocationRef = `invocation://m5/td23/${index + 1}`;
      owner.admitRuntimeEvent(acquired.store, {
        kind: "public_operation_admitted", eventTime: `2026-10-24T00:00:0${index}.000Z`, aggregateType: "workspace",
        aggregateId: invocationRef, parentAggregateId: null, causationEventRefs: [], correlationId, workflowVersion: "5.0.0",
        scopeClass: "workspace", basisId: "basis://abiogenesis/m5/td23",
        payload: { invocationDigest: owner.sha256Canonical({ invocationRef, correlationId }), invocationRef,
          operationId: "abg.operation.project.read", variant: "status" },
      });
    });
    const bytes = await readFile(eventLogPath), events = acquired.store.readAll(), rows = [];
    for (let start = 0; start < bytes.length;) { const end = bytes.indexOf(10, start); rows.push(bytes.subarray(start, end + 1)); start = end + 1; }
    return { bytes, events, rows };
  } finally { await acquired.dispose(); }
}

export async function td23HistoryStreams(owner) {
  const B = (...parts) => Buffer.concat(parts.map(part => typeof part === "string" ? Buffer.from(part, "utf8") : part));
  const replaceAt = (row, marker, bytes) => { const at = row.indexOf(marker); return B(row.subarray(0, at), bytes, row.subarray(at + 1)); };
  const small = await td23Log(owner, [1, 2, 3, 4].map(i => `correlation://m5/td23/${i}`));
  const [R1, R2, R3, R4] = small.rows, notJson = B("not json\n"), nonCanonical = row => B("{ ", row.subarray(1));
  const withCr = row => B(row.subarray(0, 1), "\r", row.subarray(1));
  const list = [
    ["well-formed", B(R1, R2, R3, R4), small.events],
    ["cr-inside-row", B(R1, withCr(R2), R3, R4)],
    ["cr-at-end", B(R1, R2, R3, R4, "\r")],
    ["crlf-endings", B(...small.rows.map(row => B(row.subarray(0, -1), "\r\n")))],
    ["blank-at-start", B("\n", R1, R2, R3, R4)],
    ["blank-in-middle", B(R1, R2, "\n", R3, R4)],
    ["blank-at-end", B(R1, R2, R3, R4, "\n")],
    ["utf8-lone-continuation", B(R1, replaceAt(R2, "td23", Buffer.from([0x80])), R3, R4)],
    ["utf8-truncated-multibyte", B(R1, replaceAt(R2, "td23", Buffer.from([0xe2, 0x82])), R3, R4)],
    ["utf8-overlong", B(R1, replaceAt(R2, "td23", Buffer.from([0xc1, 0xb4])), R3, R4)],
    ["utf8-outside-string", B(R1, Buffer.from([0x80]), R2.subarray(1), R3, R4)],
    ["noncanonical-json", B(R1, nonCanonical(R2), R3, R4)],
    ["not-json", B(R1, notJson, R3, R4)],
    ["missing-final-lf", B(R1, R2, R3, R4.subarray(0, -1))],
    ["empty", B(), []],
    ["one-lf", B("\n")],
    ["ordinal-gap", B(R1, R3, R4)],
    ["logical-then-blank", B(R1, notJson, R3, "\n", R4)],
    ["blank-then-logical", B(R1, "\n", notJson, R4)],
    ["logical-then-cr", B(R1, notJson, R3, withCr(R4))],
    ["cr-then-logical", B(R1, withCr(R2), notJson, R4)],
    ["logical-then-missing-lf", B(R1, notJson, R3, R4.subarray(0, -1))],
    ["two-logical", B(R1, notJson, nonCanonical(R3), R4)],
    ["two-logical-reversed", B(R1, nonCanonical(R2), notJson, R4)],
  ];
  // Streams longer than one 64 KiB read, with rows sized to place boundaries
  // at exact positions around the first cut. A correlation of n ASCII bytes
  // adds n bytes to its row.
  const base = (await td23Log(owner, ["c1", "c2", "c3", "c4"])).rows.map(row => row.length - 2);
  const pad = (length, insert = "", at = 0) => "p".repeat(at) + insert + "p".repeat(length - at - Buffer.byteLength(insert));
  const sized = (lengths, inserts = {}) => td23Log(owner, lengths.map((length, i) => pad(length - base[i], ...(inserts[i] ?? []))));
  const check = (condition, label) => { if (!condition) throw new TypeError(`TD-23 stream placement ${label}`); };
  // Row 2 straddles the first cut, which splits a 4-byte character 2|2.
  const lengthsA = [40000, 40000, 20000, 2000], clef = "\u{1d11e}";
  const probe = await sized(lengthsA, { 1: [clef, 0] }), at = probe.rows[1].indexOf(Buffer.from(clef));
  const a = await sized(lengthsA, { 1: [clef, TD23_READ - lengthsA[0] - 2 - at] });
  check(a.rows.every((row, i) => row.length === lengthsA[i]) && a.bytes.subarray(TD23_READ - 2, TD23_READ + 2).equals(Buffer.from(clef)), "A");
  const [S1, S2, S3, S4] = a.rows;
  list.push(["big-straddle-multibyte", a.bytes, a.events],
    ["big-bad-then-cr", B(notJson, S1, S2, S3, withCr(S4))],
    ["big-bad-then-blank", B(notJson, S1, S2, S3, "\n", S4)],
    ["big-bad-then-missing-lf", B(notJson, S1, S2, S3, S4.subarray(0, -1))],
    ["big-bad-only", B(notJson, S1, S2, S3, S4)],
    ["big-bad-straddling", B(S1, "x", S2.subarray(1), S3, S4)],
    ["big-two-bad-second-after-cut", B(S1, notJson, S2, nonCanonical(S3), S4)],
    ["big-valid-then-bad-after-cut", B(S1, S2, notJson, S4)],
    ["big-valid-then-cr-after-cut", B(S1, S2, withCr(S3), S4)],
    ["big-valid-then-blank-after-cut", B(S1, S2, "\n", S3, S4)]);
  // An LF as byte 0 of the second read; the row it ends is not blank.
  const b = await sized([32768, 32769, 2000]);
  check(b.bytes[TD23_READ] === 10 && b.bytes[TD23_READ - 1] !== 10, "B");
  // An LF as the last byte of the first read, then a row or a blank record.
  const c = await sized([32768, 32768, 2000]);
  check(c.bytes[TD23_READ - 1] === 10, "C");
  // A row longer than two reads: its prefix is carried in two pieces.
  const d = await sized([1000, 140000, 1000]);
  list.push(["big-lf-first-of-second-read", b.bytes, b.events],
    ["big-lf-last-of-first-read", c.bytes, c.events],
    ["big-lf-last-then-blank", B(c.rows[0], c.rows[1], "\n", c.rows[2])],
    ["big-row-longer-than-read", d.bytes, d.events]);
  return list.map(([name, bytes, events]) => ({ name, bytes, events }));
}

// Chunk partitions of a stream of `length` bytes with LFs at `lfs`: the
// natural reads; every cut set up to 12 bytes; otherwise every single cut
// (below one read) or the cuts around the first read and each LF (above it),
// and sixteen seeded random multi-cut partitions.
export function td23Partitions(length, lfs) {
  const result = [{ name: "natural", cuts: [] }];
  if (length <= 1) return result;
  if (length <= 12) {
    for (let mask = 1; mask < 2 ** (length - 1); mask++) {
      const set = []; for (let i = 1; i < length; i++) if (mask & 2 ** (i - 1)) set.push(i);
      result.push({ name: "set:" + set.join(","), cuts: set });
    }
    return result;
  }
  const singles = length < TD23_READ ? Array.from({ length: length - 1 }, (_, i) => i + 1)
    : [...new Set([TD23_READ - 2, TD23_READ - 1, TD23_READ, TD23_READ + 1, ...lfs.flatMap(e => [e, e + 1, e + 2])])]
      .filter(cut => cut > 0 && cut < length).sort((x, y) => x - y);
  for (const cut of singles) result.push({ name: "cut:" + cut, cuts: [cut] });
  let seed = length * 31 + 7;
  const random = () => { seed |= 0; seed = seed + 0x6d2b79f5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const widest = length < TD23_READ ? 300 : 9000;
  for (let k = 0; k < 16; k++) {
    const set = []; for (let at = 1 + Math.floor(random() * widest); at < length; at += 1 + Math.floor(random() * widest)) set.push(at);
    result.push({ name: "random:" + k, cuts: set });
  }
  return result;
}
