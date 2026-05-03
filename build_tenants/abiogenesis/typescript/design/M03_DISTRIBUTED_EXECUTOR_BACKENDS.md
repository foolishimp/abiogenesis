# M03 Distributed Executor Backends

## Status

Design note. Not active implementation scope for RC7.

## Re-Entry Class

`design_reframe`

The local traced-process implementation is current reality. This note records the
design decisions needed before moving agent actor or worker execution to AWS
Lambda, Fargate, Step Functions, direct SDK calls, or another distributed
executor.

## Current Seam

Framework-owned `agent.actor` and `agent.worker` call-outs enter through:

```text
runAgentActorWorkerCallout(...)
  -> runTracedProcess(...)
```

The long-lived contract is the request/result/event/archive shape, not local
`spawn`.

Current local archive shape:

```text
meta.json
command.json
events.ndjson
stdout.raw
stderr.raw
final_output.txt
result.json
```

The same shape maps naturally to an object prefix such as:

```text
s3://abg-traces/<sessionId>/
```

## AWS-Native Mapping

Runtime event flow:

- local: append runtime events to local files and in-memory sinks
- AWS target: publish runtime events to Kinesis, EventBridge, DynamoDB Streams,
  or another event stream through the existing `RuntimeEventSink` boundary

Archive flow:

- local: write `TracedProcessPaths` to filesystem paths
- AWS target: write archive resources to S3 or another durable store

Execution flow:

- local: subprocess or local CLI
- Lambda: short-lived SDK-backed agent execution
- Fargate/ECS: long-running CLI or shell sessions
- Step Functions: orchestration, retry, fan-out, and timeout governance

## Design Decisions To Preserve

### Resource refs, not local paths

`TracedProcessPaths` fields are strings and should be treated as resource refs.
Local implementation currently returns local filesystem paths. Distributed
implementations may return refs such as:

```text
file:///...
s3://bucket/prefix/stdout.raw
kinesis://stream-name/shard/sequence
eventbridge://bus/rule/event-id
job://executor/session-id
```

Callers must not assume `readFileSync(paths.stdout)` is lawful for every
executor.

### Sink abstraction before Lambda

The local implementation writes raw stdout/stderr and trace events with
filesystem calls. Before a Lambda or remote executor ships, extract write
surfaces into substrate-owned sinks:

- trace event sink
- stdout stream sink
- stderr stream sink
- final result/archive sink

The local backend can keep file sinks. AWS backends can publish to Kinesis,
EventBridge, or S3 without changing framework callers.

### Executor profile

Executor selection should be typed at the substrate boundary, not inferred from
environment alone.

Candidate shape:

```text
executorProfile:
  | "local"
  | "lambda"
  | "fargate"
  | "remote_event_stream"
  | "replay"
```

Short SDK-backed calls fit Lambda. Long-running CLI, shell, or retry-heavy
sessions should use Fargate/ECS or another executor that is not constrained by
Lambda's hard execution cap.

### SDK direct versus CLI

Local development can keep CLI execution. AWS Lambda should prefer direct SDK
execution where available:

- lower cold-start cost
- no CLI binary packaging dependency
- no PATH dependency
- direct access to SDK retry/error metadata

The traced call-out contract must preserve the same archive and event semantics
for both SDK and CLI executors.

### Deterministic session identity

Distributed execution retries are at-least-once. The substrate should allow a
caller-controlled deterministic `sessionId` before distributed executors ship.

Without this, a Lambda retry can create a second archive for the same logical
invocation. A deterministic session id lets the archive and projection layer
dedupe or overwrite intentionally.

Candidate rule:

```text
sessionId = hash(actorInvocationId | workerRef | attemptIndex | promptDigest)
```

Random ids remain acceptable for local ad hoc runs, not for governed distributed
execution.

### Streaming semantics

Stream callbacks are best-effort observations:

- preserve FIFO ordering within stdout
- preserve FIFO ordering within stderr
- do not guarantee exact timing
- do not guarantee cross-stream interleaving

Distributed executors may batch chunks. Callers must not treat chunk timing as
semantic truth.

## Out Of Scope For This Note

- choosing a specific AWS service mix
- implementing Lambda, Fargate, Step Functions, Kinesis, or S3 writers
- replacing local traced process execution
- changing ABG traversal, retry, projection, or closure law

## Migration Trigger

Open an implementation ticket when a downstream runtime requires a non-local
agent actor or worker executor.

That ticket must first decide:

- URI/resource ref shape for `TracedProcessPaths`
- deterministic session id input
- sink interfaces
- executor profile vocabulary
- SDK-direct versus CLI policy for each agent backend
