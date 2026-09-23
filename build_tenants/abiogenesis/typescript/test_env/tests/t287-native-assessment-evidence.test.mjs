import assert from 'node:assert/strict';
import test from 'node:test';
import {projectCCallRuntimeFailureSignal} from '../../build/code/src/abg/c_call.js';
import {selectValidatedRuntimeEventPrefix} from '../../build/code/src/abg/event_prefix.js';
import {classifyWorkerTransportFailure} from '../../build/code/src/abg/transport_contracts.js';
import {deepFreeze} from '../../build/code/src/shared/immutable.js';

// Self-contained component premises for this projector, not native admission.
// These 13 CCall/actor records retain the malformed installed05 observation and
// owner-planned failure close. They are locally indexed; unrelated setup causes
// are omitted. No resource, reopen token, external proof bank or actor is used.
// The separate finite implementation probe tests real evidence admission against
// the exact retained prefix and rejected candidate digest. Keep this permanent
// regression on ordinary compiled imports and these checked-in input values.
const expected = {
  "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
  "resultRef": "result://abiogenesis/d74ff2e3dc288a9fa7affcb8130464bd5b173962155cb0817e77e3f719aa846f",
  "judgmentRef": "judgment://abiogenesis/e18a9fee89f00f0382013d4a6375f0489112425ffc14de2878deb84f1cd80e10",
  "signal": {
    "kind": "c_call_runtime_failure_signal",
    "schemaVersion": "5.0.0",
    "failureClass": "contract_failure",
    "sourceClass": "probabilistic_transport",
    "sourceDigest": "sha256:466a0b0f7a836833f937d5963c086cef28be2987a0d11ea8000120ee83ae208a",
    "failureSignalDigest": "sha256:038161b8041954f973b6538a34fe99eac004891e06dad6421a2355c1078ae72f",
    "failureSignalRef": "retry-failure-signal://abiogenesis/038161b8041954f973b6538a34fe99eac004891e06dad6421a2355c1078ae72f"
  }
};
const scope = {
  "basisId": "execution-basis://abiogenesis/1111dfcef5827356e0a52ae2d04f779e1ffd42c477561e6a953833d231ca5e55",
  "frameId": "frame://abiogenesis/a0e6a05a02d0b0eb456eb1a9a15963e7a62a01c104165fd06cef62b7bf9f593d",
  "graphCallId": "graph-call://abiogenesis/f3557f03d27b1aaec59718fcf8d7abd7917021fb236384b46ec3c3b05720933b",
  "graphFunctionRef": "graph-function://abiogenesis/conformance/fp-retry-hello@5",
  "runId": "run://abiogenesis/2ac7eef505b84bdb8148d31dfdc7ed511bbf0f9505a4c239085708901010747a",
  "scopeClass": "run",
  "workflowVersion": "5.0.0",
  "eventContractDigest": "sha256:4196aaeb231aaf98b5d3da74c9d7eddaff17140cab0e6af5cfd94e3bd17590f0"
};
const rows = [
  {
    "aggregateId": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
    "aggregateType": "c_call",
    "causationEventRefs": [],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/open",
    "eventTime": "2026-09-23T11:01:09.506Z",
    "frameLineageId": "frame-lineage://abiogenesis/c79190f3607b08f0177996081f93a1be5684e2da31d6542a1752863479984d01",
    "kind": "c_call_opened",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "frame://abiogenesis/a0e6a05a02d0b0eb456eb1a9a15963e7a62a01c104165fd06cef62b7bf9f593d",
    "payload": {
      "attempt": 1,
      "basisId": "execution-basis://abiogenesis/1111dfcef5827356e0a52ae2d04f779e1ffd42c477561e6a953833d231ca5e55",
      "batchRef": null,
      "cCallDigest": "sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "callClass": "leaf",
      "cursorDigest": "sha256:31ddd7a57ae81a8bf6f2068bae592af5d313a233602ace9aa3f82349c9e28902",
      "cursorRef": "traversal-cursor://abiogenesis/31ddd7a57ae81a8bf6f2068bae592af5d313a233602ace9aa3f82349c9e28902",
      "edgeRef": "graph-function://abiogenesis/conformance/fp-retry-hello@5",
      "frameId": "frame://abiogenesis/a0e6a05a02d0b0eb456eb1a9a15963e7a62a01c104165fd06cef62b7bf9f593d",
      "graphCallId": "graph-call://abiogenesis/f3557f03d27b1aaec59718fcf8d7abd7917021fb236384b46ec3c3b05720933b",
      "graphFunctionRef": "graph-function://abiogenesis/conformance/fp-retry-hello@5",
      "programLocusRef": "locus://abiogenesis/conformance/fp-retry-hello@5",
      "retryPath": [
        1,
        1
      ],
      "stageRole": "result",
      "taskOrdinal": null,
      "vectorIndex": 0
    },
    "eventId": "event://abiogenesis/88092b7206cc8d5b6be92985ff12b87c27114bcc4d77549c2cdf5c8d8966f6e1",
    "admissionOrdinal": 1,
    "payloadDigest": "sha256:c3cd0a894e9769e460c22f225e315309a353c5d44ae4e3dfa970672a5e01c86c"
  },
  {
    "aggregateId": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
    "aggregateType": "c_call",
    "causationEventRefs": [
      "event://abiogenesis/88092b7206cc8d5b6be92985ff12b87c27114bcc4d77549c2cdf5c8d8966f6e1"
    ],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/open",
    "eventTime": "2026-09-23T11:01:09.506Z",
    "frameLineageId": "frame-lineage://abiogenesis/c79190f3607b08f0177996081f93a1be5684e2da31d6542a1752863479984d01",
    "kind": "c_call_fibre_selected",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "frame://abiogenesis/a0e6a05a02d0b0eb456eb1a9a15963e7a62a01c104165fd06cef62b7bf9f593d",
    "payload": {
      "armId": "arm://abiogenesis/conformance/fp-hello@5",
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "callClass": "leaf",
      "compositionRef": null,
      "implementationBindingRef": "implementation-binding://abiogenesis/conformance/fp-hello@5",
      "implementationRef": "implementation://abiogenesis/conformance/fp-hello@5",
      "implementationRequirementKey": "executable-leaf://abiogenesis/bfb62fc56c9d9bce4a40a374928bd64751664b76460747861fc7a608a1b162f2",
      "implementationSetRef": "implementation-set://abiogenesis/aa01586943e95081dbbac4c44fbe9589781e11c7df9a475779053c60adc4655b",
      "regime": "F_P"
    },
    "eventId": "event://abiogenesis/b555cd46a1f94b30ef17106d37270a076db87387a85d4f590873ce9a64fd7275",
    "admissionOrdinal": 2,
    "payloadDigest": "sha256:10ffb0376ad60e518ad3b480a223b1d99e5da8adb54bd27c57c45fc1d07eaf6c"
  },
  {
    "aggregateId": "transport-binding://abiogenesis/5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
    "aggregateType": "transport_binding",
    "causationEventRefs": [
      "event://abiogenesis/b555cd46a1f94b30ef17106d37270a076db87387a85d4f590873ce9a64fd7275"
    ],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/actor-process",
    "eventTime": "2026-09-23T11:01:09.987Z",
    "kind": "actor_transport_binding_admitted",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
    "payload": {
      "absoluteTimeoutMs": 3600000,
      "actorRef": "actor://abiogenesis/conformance/claude-worker@5",
      "agentKey": "claude",
      "archiveRoot": "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-04/episode-01/resources/archives",
      "args": [
        "-p",
        "--disable-slash-commands",
        "--no-session-persistence",
        "--output-format",
        "stream-json",
        "--include-partial-messages",
        "--verbose",
        "--permission-mode",
        "bypassPermissions",
        "--safe-mode",
        "--tools",
        "",
        "--json-schema",
        "{\"type\":\"object\",\"additionalProperties\":false,\"required\":[\"kind\",\"schemaVersion\",\"resultContractRef\",\"actorRef\",\"message\"],\"properties\":{\"kind\":{\"const\":\"fp_hello_output\"},\"schemaVersion\":{\"const\":\"5.0.0\"},\"resultContractRef\":{\"const\":\"contract://abiogenesis/conformance/fp-hello-output@5\"},\"actorRef\":{\"const\":\"actor://abiogenesis/conformance/claude-worker@5\"},\"message\":{\"const\":\"Hello World\"}}}"
      ],
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "command": "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-carrier-02/simulated-fp.cjs",
      "cwd": "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-04/episode-01",
      "dispatchOrdinal": 1,
      "environmentDigest": "sha256:707a323df4c524729215a543a0bac301873559d54636b1977c41b624f2c4555b",
      "environmentPolicyDigest": "sha256:28d63718c9607b33c1099e84e0bc3dd234d6a9543f54585e46f4366663278cc6",
      "implementationBindingRef": "implementation-binding://abiogenesis/conformance/fp-hello@5",
      "implementationRef": "implementation://abiogenesis/conformance/fp-hello@5",
      "inputDigest": "sha256:e675038f34423b7aefcc63bf312db35fbd81c83ce8697a209c9abf0b4f9b9cf7",
      "lane": "closed_prompt_proof",
      "livenessBinding": {
        "clockKind": "native_monotonic_elapsed",
        "clockOriginRef": "runtime-clock://abiogenesis/491136c160f7e0b4fcfdf857fb4ec23085f88ad1216126a7d6d7b73b081f8979",
        "kind": "runtime_liveness_binding",
        "policy": {
          "hardCapMs": 3600000,
          "inactivityMs": 60000,
          "kind": "runtime_watchdog_policy",
          "policyDigest": "sha256:b73722489c99bbb3a2a0a93cd7229d645becea630a93e0f1e1035721b64a862f",
          "policyRef": "runtime-watchdog-policy://abiogenesis/b73722489c99bbb3a2a0a93cd7229d645becea630a93e0f1e1035721b64a862f",
          "schemaVersion": "5.0.0",
          "startupMs": 60000,
          "terminationGraceMs": 1000
        },
        "schemaVersion": "5.0.0",
        "sources": [
          "stdout",
          "stderr",
          "structured_output",
          "tool_progress",
          "api_progress",
          "process_lifecycle",
          "archive",
          "result_artifact"
        ]
      },
      "parser": "claude_stream_json",
      "paths": {
        "output": "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-04/episode-01/resources/archives/fp-8769973f56432dc9-output.txt",
        "prompt": "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-04/episode-01/resources/archives/fp-8769973f56432dc9-prompt.txt",
        "stderr": "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-04/episode-01/resources/archives/fp-8769973f56432dc9-stderr.log",
        "stdout": "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-04/episode-01/resources/archives/fp-8769973f56432dc9-stdout.log",
        "transport": "/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260923_RC1_QUALIFICATION_RECIPE/s02-installed-continuation-04/episode-01/resources/archives/fp-8769973f56432dc9-transport.json"
      },
      "promptDigest": "sha256:bc3c5ee568267afdc0e237559599d94ec02867817e48d8cf8e72a9447afc01be",
      "promptTransport": "stdin",
      "responseJsonSchemaDigest": "sha256:c30a3ddce802c09eca826be8f6f0f73605ce0e0434a475672583ecf8ee8f2196",
      "terminationGraceMs": 1000,
      "timeoutMs": 60000,
      "transportBindingDigest": "sha256:5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "transportBindingRef": "transport-binding://abiogenesis/5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "transportContractDigest": "sha256:4adf5569c7d84130bfc42423f59796fc8d5811c0695cd74591421066666f4e84",
      "transportPlanDigest": "sha256:212f7fdf1d46661b6bf6155e098f8e0f4177a4c9d5bd821019a901ba4e5a4e21",
      "workerBindingRef": "worker-binding://abiogenesis/conformance/claude-worker@5"
    },
    "eventId": "event://abiogenesis/78f6173f0f7ed9479190958607fcc5607dee70d1c32a85d3e286d1b71d594871",
    "admissionOrdinal": 3,
    "payloadDigest": "sha256:d16a1d10798358403da7b45f59c019cbb0d61c520b6c240204dd27d848ca2a9f"
  },
  {
    "aggregateId": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
    "aggregateType": "actor_invocation",
    "causationEventRefs": [
      "event://abiogenesis/78f6173f0f7ed9479190958607fcc5607dee70d1c32a85d3e286d1b71d594871"
    ],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/actor-process",
    "eventTime": "2026-09-23T11:01:09.987Z",
    "kind": "actor_invocation_started",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
    "payload": {
      "actorInvocationRef": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
      "actorRef": "actor://abiogenesis/conformance/claude-worker@5",
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "dispatchOrdinal": 1,
      "implementationRef": "implementation://abiogenesis/conformance/fp-hello@5",
      "inputDigest": "sha256:e675038f34423b7aefcc63bf312db35fbd81c83ce8697a209c9abf0b4f9b9cf7",
      "promptDigest": "sha256:bc3c5ee568267afdc0e237559599d94ec02867817e48d8cf8e72a9447afc01be",
      "requestDigest": "sha256:91a84a354b782107e2d1490a4ac4a9f3bf60b44761dd35916c92dc30c1c369aa",
      "requestRef": "probabilistic-request://abiogenesis/91a84a354b782107e2d1490a4ac4a9f3bf60b44761dd35916c92dc30c1c369aa",
      "transportBindingDigest": "sha256:5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "transportBindingRef": "transport-binding://abiogenesis/5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "workerBindingRef": "worker-binding://abiogenesis/conformance/claude-worker@5"
    },
    "eventId": "event://abiogenesis/47acd16f1f3a520eedb3668a144bb726d8b23b63f63923cf62ff0e15ff4e54fa",
    "admissionOrdinal": 4,
    "payloadDigest": "sha256:2c2f7052bb013754d137d9dcf868cf9d8129059b8a7df0afbbbca1b8bfcf83f4"
  },
  {
    "aggregateId": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
    "aggregateType": "process",
    "causationEventRefs": [
      "event://abiogenesis/47acd16f1f3a520eedb3668a144bb726d8b23b63f63923cf62ff0e15ff4e54fa"
    ],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/actor-process",
    "eventTime": "2026-09-23T11:01:09.996Z",
    "kind": "actor_process_started",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
    "payload": {
      "actorInvocationRef": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "processId": 5341,
      "processRef": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee"
    },
    "eventId": "event://abiogenesis/ede9c397e9406cdb1950aea8492197c0e65fd711d44aba2fe8d9e9c183ba0f6a",
    "admissionOrdinal": 5,
    "payloadDigest": "sha256:5bc2972975ecc0c6a02b2358eb716c3c0a83215b000c8fb69ba08fe0566c44c5"
  },
  {
    "aggregateId": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
    "aggregateType": "process",
    "causationEventRefs": [],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/actor-process",
    "eventTime": "2026-09-23T11:01:10.045Z",
    "kind": "actor_process_stdout_observed",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
    "payload": {
      "actorInvocationRef": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
      "byteLength": 35,
      "chunkDigest": "sha256:e66222adb1f551c74c3886c5a93950c239218f1c11120a3f4d9e45c80205d0dd",
      "processRef": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
      "streamOrdinal": 1
    },
    "eventId": "event://abiogenesis/dcd75d6038a113f877b2e6b80674245def41214a90435b675d4bbeabac2229f5",
    "admissionOrdinal": 6,
    "payloadDigest": "sha256:1e22d04fce14d1f9384d75abaf9e6d622635b4a8f940da54dd6d4ca2ef97e799"
  },
  {
    "aggregateId": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
    "aggregateType": "process",
    "causationEventRefs": [
      "event://abiogenesis/dcd75d6038a113f877b2e6b80674245def41214a90435b675d4bbeabac2229f5"
    ],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/actor-process",
    "eventTime": "2026-09-23T11:01:10.051Z",
    "kind": "actor_process_stdout_observed",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
    "payload": {
      "actorInvocationRef": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
      "byteLength": 139,
      "chunkDigest": "sha256:49cac33f18234da425ebb796d42d046a3d5002f421e68e35242584c0836110ad",
      "processRef": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
      "streamOrdinal": 2
    },
    "eventId": "event://abiogenesis/87ba11012812476bcf8cbb20fc0c9be8e3dbfd6e5fa235d6afabc67881f1192c",
    "admissionOrdinal": 7,
    "payloadDigest": "sha256:bb5f3bc9e2e24535d6348e9bb1de983fc3ea8d190c03fdf74197ff9abe3c0b87"
  },
  {
    "aggregateId": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
    "aggregateType": "process",
    "causationEventRefs": [],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/actor-process",
    "eventTime": "2026-09-23T11:01:10.065Z",
    "kind": "actor_process_exited",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
    "payload": {
      "actorInvocationRef": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
      "processRef": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
      "signal": null,
      "status": 0
    },
    "eventId": "event://abiogenesis/e88a88005313cc1b253aa1fcbccc3df9372bd7bd89e4b3dd3fa8a87885d03f0a",
    "admissionOrdinal": 8,
    "payloadDigest": "sha256:096d46d68daa515217955b44fc77397b3811e93a5324c95b50a470679fdbbac3"
  },
  {
    "aggregateId": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
    "aggregateType": "actor_invocation",
    "causationEventRefs": [
      "event://abiogenesis/e88a88005313cc1b253aa1fcbccc3df9372bd7bd89e4b3dd3fa8a87885d03f0a"
    ],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/actor-process",
    "eventTime": "2026-09-23T11:01:10.071Z",
    "kind": "actor_result_artifact_observed",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
    "payload": {
      "actorInvocationRef": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
      "actorRef": "actor://abiogenesis/conformance/claude-worker@5",
      "apiRetryCount": 0,
      "artifactDigests": {
        "output": "sha256:f1dec6e9ee608550bd1c39ff2b90134059bac5d02e4e78f6410aed2fbd870bd0",
        "prompt": "sha256:66009700b70e98cbf140d6fa346a242b73d6e918ce781fe89a5ced912e899d05",
        "stderr": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "stdout": "sha256:163899de51a121bf15cd119e6a4d18f4dfb78eabf9d96e2456f3fc6a8c2b8d91",
        "transport": "sha256:32aa8f1dbbc6f5fff73ea4d506a7b3055cef60347c27e177af623b60f21c9039"
      },
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "disposition": "failure",
      "exitObserved": true,
      "failureClass": "contract_failure",
      "finalOutput": "{not-json",
      "implementationRef": "implementation://abiogenesis/conformance/fp-hello@5",
      "inputDigest": "sha256:e675038f34423b7aefcc63bf312db35fbd81c83ce8697a209c9abf0b4f9b9cf7",
      "instructionContractRef": "contract://abiogenesis/conformance/fp-hello-instruction@5",
      "materializationPlanRef": "prompt-plan://abiogenesis/conformance/fp-hello@5",
      "nativeResultAssessment": {
        "disposition": "rejected",
        "inputDigest": "sha256:e675038f34423b7aefcc63bf312db35fbd81c83ce8697a209c9abf0b4f9b9cf7",
        "kind": "native_worker_result_assessment",
        "rawOutputDigest": "sha256:f1dec6e9ee608550bd1c39ff2b90134059bac5d02e4e78f6410aed2fbd870bd0",
        "resultContractRef": "contract://abiogenesis/conformance/fp-hello-output@5",
        "schemaVersion": "5.0.0",
        "verification": null
      },
      "observedOutputDigest": "sha256:2f4149cda6f0f448d27f4addbd440a7045b66ab9ee51d2eb593f9402ad0c79e5",
      "processRef": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
      "processSignal": null,
      "processStatus": 0,
      "progressEventCount": 1,
      "promptDigest": "sha256:bc3c5ee568267afdc0e237559599d94ec02867817e48d8cf8e72a9447afc01be",
      "rendererRef": "renderer://abiogenesis/conformance/fp-hello@5",
      "requestDigest": "sha256:91a84a354b782107e2d1490a4ac4a9f3bf60b44761dd35916c92dc30c1c369aa",
      "requestRef": "probabilistic-request://abiogenesis/91a84a354b782107e2d1490a4ac4a9f3bf60b44761dd35916c92dc30c1c369aa",
      "resultContractRef": "contract://abiogenesis/conformance/fp-hello-output@5",
      "signalSequence": [],
      "stderrByteLength": 0,
      "stdoutByteLength": 174,
      "structuredEventCount": 3,
      "terminationConfirmed": true,
      "timedOut": false,
      "timeoutClass": null,
      "toolCallCount": 0,
      "toolInvocations": [],
      "transportBindingDigest": "sha256:5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "transportBindingRef": "transport-binding://abiogenesis/5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "transportDigest": "sha256:32aa8f1dbbc6f5fff73ea4d506a7b3055cef60347c27e177af623b60f21c9039",
      "transportLane": "closed_prompt_proof",
      "workerBindingRef": "worker-binding://abiogenesis/conformance/claude-worker@5"
    },
    "eventId": "event://abiogenesis/45be644fc60cfb7e31e38e1bf18f8e084d9d18c16687ee9b0dfe852a23e3a5aa",
    "admissionOrdinal": 9,
    "payloadDigest": "sha256:a5c40dcb8adf3f23bbaaef3e69d4158f0d064809bb43e0094e073f9c1e194b76"
  },
  {
    "aggregateId": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
    "aggregateType": "actor_invocation",
    "causationEventRefs": [
      "event://abiogenesis/45be644fc60cfb7e31e38e1bf18f8e084d9d18c16687ee9b0dfe852a23e3a5aa"
    ],
    "correlationId": "correlation://abiogenesis/t287/s02/552fc8b2687aea1f78b27f09bb37a8373c1b8bc24d1c189d95c1e9b2454fc4c4/hog/leaf/0/actor-process",
    "eventTime": "2026-09-23T11:01:10.081Z",
    "kind": "actor_invocation_failed",
    "materializationRef": "graph-materialization://abiogenesis/be6a4de3b3d48ff9a6acac9551c0594918406a6b926b6cd3a1c607c9f4a77b14",
    "parentAggregateId": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
    "payload": {
      "actorInvocationRef": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "consumedArtifactEventRef": "event://abiogenesis/45be644fc60cfb7e31e38e1bf18f8e084d9d18c16687ee9b0dfe852a23e3a5aa",
      "consumedStderrEventRefs": [],
      "consumedStdoutEventRefs": [
        "event://abiogenesis/dcd75d6038a113f877b2e6b80674245def41214a90435b675d4bbeabac2229f5",
        "event://abiogenesis/87ba11012812476bcf8cbb20fc0c9be8e3dbfd6e5fa235d6afabc67881f1192c"
      ],
      "consumedTransportBindingRef": "transport-binding://abiogenesis/5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "disposition": "failure",
      "failureClass": "contract_failure",
      "processRef": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
      "transportBindingDigest": "sha256:5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "transportBindingRef": "transport-binding://abiogenesis/5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "transportDigest": "sha256:32aa8f1dbbc6f5fff73ea4d506a7b3055cef60347c27e177af623b60f21c9039"
    },
    "eventId": "event://abiogenesis/c9e4496398536128ec30de1af5b1e2015b2dec9de40d819c89763f4b45825bbe",
    "admissionOrdinal": 10,
    "payloadDigest": "sha256:a0ba8e8c79bd2049acd3077734995a381c1c3b7088db0dd1b809b8e988aae3ce"
  },
  {
    "aggregateId": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
    "aggregateType": "c_call",
    "causationEventRefs": [
      "event://abiogenesis/b555cd46a1f94b30ef17106d37270a076db87387a85d4f590873ce9a64fd7275",
      "event://abiogenesis/c9e4496398536128ec30de1af5b1e2015b2dec9de40d819c89763f4b45825bbe"
    ],
    "correlationId": "component://native-assessment-evidence",
    "eventTime": "2026-09-23T11:30:53.727Z",
    "kind": "c_call_evidenced",
    "parentAggregateId": "frame://abiogenesis/a0e6a05a02d0b0eb456eb1a9a15963e7a62a01c104165fd06cef62b7bf9f593d",
    "payload": {
      "actorInvocationRef": "actor-invocation://abiogenesis/fdb77bb8a651c011ca698626f1aaaf4c4b35a7c32aad8634963e3e89aa861f93",
      "actorRef": "actor://abiogenesis/conformance/claude-worker@5",
      "apiRetryCount": 0,
      "artifactDigests": {
        "output": "sha256:f1dec6e9ee608550bd1c39ff2b90134059bac5d02e4e78f6410aed2fbd870bd0",
        "prompt": "sha256:66009700b70e98cbf140d6fa346a242b73d6e918ce781fe89a5ced912e899d05",
        "stderr": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "stdout": "sha256:163899de51a121bf15cd119e6a4d18f4dfb78eabf9d96e2456f3fc6a8c2b8d91",
        "transport": "sha256:32aa8f1dbbc6f5fff73ea4d506a7b3055cef60347c27e177af623b60f21c9039"
      },
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "candidateDigest": null,
      "candidateRef": null,
      "contractRef": "contract://abiogenesis/conformance/fp-hello-evidence@5",
      "evidenceClass": "probabilistic_transport",
      "evidenceDigest": "sha256:cf3e0f9e2e0a2eba40db2cd1bda5361e26bc42bf21c9cd5c7a129670a95ef902",
      "evidenceRef": "evidence://abiogenesis/cf3e0f9e2e0a2eba40db2cd1bda5361e26bc42bf21c9cd5c7a129670a95ef902",
      "exitObserved": true,
      "implementationRef": "implementation://abiogenesis/conformance/fp-hello@5",
      "inputDigest": "sha256:e675038f34423b7aefcc63bf312db35fbd81c83ce8697a209c9abf0b4f9b9cf7",
      "instructionContractRef": "contract://abiogenesis/conformance/fp-hello-instruction@5",
      "materializationPlanRef": "prompt-plan://abiogenesis/conformance/fp-hello@5",
      "nativeResultAssessment": {
        "disposition": "rejected",
        "inputDigest": "sha256:e675038f34423b7aefcc63bf312db35fbd81c83ce8697a209c9abf0b4f9b9cf7",
        "kind": "native_worker_result_assessment",
        "rawOutputDigest": "sha256:f1dec6e9ee608550bd1c39ff2b90134059bac5d02e4e78f6410aed2fbd870bd0",
        "resultContractRef": "contract://abiogenesis/conformance/fp-hello-output@5",
        "schemaVersion": "5.0.0",
        "verification": null
      },
      "observedOutputDigest": "sha256:2f4149cda6f0f448d27f4addbd440a7045b66ab9ee51d2eb593f9402ad0c79e5",
      "outputDigest": "sha256:4bffa0bb9a50dc0cfbccc6932c846c4df57cc96575f2df0de1416bbb9f4e70ba",
      "processRef": "process://abiogenesis/35cb567df66680cd5cd10ff0af2e1954c926a112ced58fe1cc94bce9ec9555ee",
      "processSignal": null,
      "processStatus": 0,
      "progressEventCount": 1,
      "promptDigest": "sha256:bc3c5ee568267afdc0e237559599d94ec02867817e48d8cf8e72a9447afc01be",
      "rawOutputDigest": "sha256:f1dec6e9ee608550bd1c39ff2b90134059bac5d02e4e78f6410aed2fbd870bd0",
      "rendererRef": "renderer://abiogenesis/conformance/fp-hello@5",
      "requestDigest": "sha256:91a84a354b782107e2d1490a4ac4a9f3bf60b44761dd35916c92dc30c1c369aa",
      "requestRef": "probabilistic-request://abiogenesis/91a84a354b782107e2d1490a4ac4a9f3bf60b44761dd35916c92dc30c1c369aa",
      "resultContractRef": "contract://abiogenesis/conformance/fp-hello-output@5",
      "signalSequence": [],
      "stderrByteLength": 0,
      "stdoutByteLength": 174,
      "structuredEventCount": 3,
      "terminationConfirmed": true,
      "timedOut": false,
      "timeoutClass": null,
      "toolCallCount": 0,
      "transportBindingDigest": "sha256:5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "transportBindingRef": "transport-binding://abiogenesis/5fe0203a65fff946418ab050c2313520fa2c531691713856f38fe461b9f547f0",
      "transportDigest": "sha256:32aa8f1dbbc6f5fff73ea4d506a7b3055cef60347c27e177af623b60f21c9039",
      "transportDisposition": "failure",
      "transportFailureClass": "contract_failure",
      "transportLane": "closed_prompt_proof",
      "workerBindingRef": "worker-binding://abiogenesis/conformance/claude-worker@5"
    },
    "eventId": "event://abiogenesis/70e40585563ef3cff137a2893ce96041c55b370cc43fc538af80f398b5733c4d",
    "admissionOrdinal": 11,
    "payloadDigest": "sha256:20d8a1b7052931238abcc575be425e993c240bb07424496dbf6925c0dfc792fa"
  },
  {
    "aggregateId": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
    "aggregateType": "c_call",
    "causationEventRefs": [
      "event://abiogenesis/70e40585563ef3cff137a2893ce96041c55b370cc43fc538af80f398b5733c4d"
    ],
    "correlationId": "component://native-assessment-evidence",
    "eventTime": "2026-09-23T11:01:10.081Z",
    "kind": "c_call_result_admitted",
    "parentAggregateId": "frame://abiogenesis/a0e6a05a02d0b0eb456eb1a9a15963e7a62a01c104165fd06cef62b7bf9f593d",
    "payload": {
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "contractRef": "contract://abiogenesis/conformance/fp-hello-failure@5",
      "evidenceRefs": [
        "evidence://abiogenesis/cf3e0f9e2e0a2eba40db2cd1bda5361e26bc42bf21c9cd5c7a129670a95ef902"
      ],
      "resultClass": "failure",
      "resultDigest": "sha256:d74ff2e3dc288a9fa7affcb8130464bd5b173962155cb0817e77e3f719aa846f",
      "resultRef": "result://abiogenesis/d74ff2e3dc288a9fa7affcb8130464bd5b173962155cb0817e77e3f719aa846f",
      "value": {
        "diagnosticRef": "diagnostic://abiogenesis/transport/contract-failure@5",
        "failureCandidateDigest": "sha256:4bffa0bb9a50dc0cfbccc6932c846c4df57cc96575f2df0de1416bbb9f4e70ba",
        "failureClass": "contract_failure",
        "failureSignalRef": "retry-failure-signal://abiogenesis/038161b8041954f973b6538a34fe99eac004891e06dad6421a2355c1078ae72f",
        "failureSourceRef": "runtime-failure-source://abiogenesis/466a0b0f7a836833f937d5963c086cef28be2987a0d11ea8000120ee83ae208a",
        "kind": "fp_hello_failure",
        "schemaVersion": "5.0.0"
      },
      "valueDigest": "sha256:fd4d3fc75e54cae6e4946dd43b0b116655492a8bb696720834724f3df26a1dca",
      "valueKind": "fp_hello_failure"
    },
    "eventId": "event://abiogenesis/f313833c409d50de03f54694cad9bc66fe714ba01c57535f0cb69a6b21ced38a",
    "admissionOrdinal": 12,
    "payloadDigest": "sha256:4cb7ebdc02d648884923a1b101125ac633ce84cbc560cd1ebeff95775e3f7453"
  },
  {
    "aggregateId": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
    "aggregateType": "c_call",
    "causationEventRefs": [
      "event://abiogenesis/f313833c409d50de03f54694cad9bc66fe714ba01c57535f0cb69a6b21ced38a"
    ],
    "correlationId": "component://native-assessment-evidence",
    "eventTime": "2026-09-23T11:01:10.081Z",
    "kind": "c_call_judged",
    "parentAggregateId": "frame://abiogenesis/a0e6a05a02d0b0eb456eb1a9a15963e7a62a01c104165fd06cef62b7bf9f593d",
    "payload": {
      "cCallRef": "c-call:sha256:70cc52e3b3a7a9979aa6400dc070c27c679878910d66f2bc4967b528e9ad0d3c",
      "contractRef": "contract://abiogenesis/conformance/fp-hello-judgment@5",
      "judgment": "retry",
      "judgmentDigest": "sha256:e18a9fee89f00f0382013d4a6375f0489112425ffc14de2878deb84f1cd80e10",
      "judgmentRef": "judgment://abiogenesis/e18a9fee89f00f0382013d4a6375f0489112425ffc14de2878deb84f1cd80e10",
      "predicateRef": "predicate://abiogenesis/conformance/fp-hello-result@5",
      "reasonRef": "retry-failure-signal://abiogenesis/038161b8041954f973b6538a34fe99eac004891e06dad6421a2355c1078ae72f",
      "replayStateDigest": "sha256:fb6c183f4aa633668eb29c1c83ec3dc982411c18a3b86bfab07797c3c16d0688",
      "resultDigest": "sha256:d74ff2e3dc288a9fa7affcb8130464bd5b173962155cb0817e77e3f719aa846f",
      "resultRef": "result://abiogenesis/d74ff2e3dc288a9fa7affcb8130464bd5b173962155cb0817e77e3f719aa846f",
      "retryAttemptRef": "retry-attempt://abiogenesis/e24ba2702438b3a8356e490bb7be0708d82210b75f05ae573bb116c0ddaca455"
    },
    "eventId": "event://abiogenesis/a0cab17b9879ceec19a2fcfbe9f1b2f83082a8af561182c7f52d3b86523579ea",
    "admissionOrdinal": 13,
    "payloadDigest": "sha256:359f1b95f63ea0f6fee7c998a10c0b9f670bc37e586fb08b2846d1c0a255a373"
  }
];

function project(change=()=>{}) {
  const events=rows.map(row=>({...structuredClone(scope),...structuredClone(row)}));
  change(events);
  return projectCCallRuntimeFailureSignal(selectValidatedRuntimeEventPrefix(deepFreeze(events)),expected.cCallRef,expected.resultRef,expected.judgmentRef);
}

test('CCall failure projection conserves the authenticated malformed-result assessment',()=>{
  const artifact=rows.find(e=>e.kind==='actor_result_artifact_observed');
  assert.equal(artifact.payload.finalOutput,'{not-json');
  assert.equal(artifact.payload.processStatus,0);
  assert.equal(artifact.payload.nativeResultAssessment.disposition,'rejected');
  assert.deepEqual(project(),expected.signal);
});

test('CCall failure projection refuses foreign producer, assessment and artifact correspondence',()=>{
  const changes=[
    ['foreign producer',e=>e.actorInvocationRef='actor-invocation://abiogenesis/foreign'],
    ['foreign assessment input',e=>e.nativeResultAssessment.inputDigest='sha256:'+'f'.repeat(64)],
    ['changed assessment disposition',e=>e.nativeResultAssessment.disposition='absent'],
    ['missing current assessment',e=>delete e.nativeResultAssessment],
  ];
  for(const [label,change] of changes) {
    assert.equal(project(events=>change(events.find(e=>e.kind==='actor_result_artifact_observed').payload)),null,label);
  }
  assert.equal(project(events=>{
    const terminal=events.find(e=>e.kind==='actor_invocation_failed');
    terminal.payload.consumedArtifactEventRef=events.find(e=>e.kind==='actor_process_stdout_observed').eventId;
  }),null,'a different admitted producer event cannot become the result artifact');
});

test('historical absent-assessment classification and ordinary failure classes retain their meaning',()=>{
  const base={parser:'claude_stream_json',lane:'closed_prompt_proof',processStatus:0,timedOut:false,terminationConfirmed:true,processSpawnFailed:false,structuredEventCount:3,toolCallCount:0,apiRetryCount:0,finalOutput:'{not-json'};
  assert.equal(classifyWorkerTransportFailure(base),null,'legacy unassessed text is not retrospectively payload-assessed');
  assert.equal(classifyWorkerTransportFailure({...base,finalOutput:''}),'no_output');
  assert.equal(classifyWorkerTransportFailure({...base,processStatus:1}),'transport_failure');
  assert.equal(classifyWorkerTransportFailure({...base,toolCallCount:1}),'contract_failure');
  assert.equal(classifyWorkerTransportFailure({...base,nativeResultDisposition:'rejected'}),'contract_failure');
  assert.equal(classifyWorkerTransportFailure({...base,processStatus:1,nativeResultDisposition:'admitted'}),null,'existing admitted-result salvage policy is unchanged');
});
