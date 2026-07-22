# T-270 F_P Execution Authority Checkpoint

## Claim

Commit `d7cabbec374133687ebc286699e20504d06a4564` repairs the four material
F_P authority findings against the accepted M5 design. It is a review
checkpoint, not `ABG5-S02` closure. `workflow.C` remains unopened.

## Repaired Boundary

1. Product verifies the admitted install's complete manifest-bound payload and
   resolves packaged implementation descriptors. Public no longer imports or
   enumerates concrete implementation exports.
2. HoG receives one opaque admitted leaf port bound to the exact Product
   install, Module publication digest, and admitted implementation set. The
   port rechecks installed bytes before every leaf invocation.
3. ABG prepares and admits the exact transport binding before minting actor
   identity. The binding covers executable, arguments, lane, workspace-derived
   working and archive roots, sanitized environment, timeout and grace,
   response schema, worker binding, prompt, and artifact paths.
4. ABG records process exit only from an observed child `exit`. Timeout uses
   `SIGTERM`, bounded `SIGKILL`, and a distinct termination-unconfirmed event;
   it never fabricates an exit signal or status.
5. The F_P implementation emits only result candidates. ABG derives the
   probabilistic evidence candidate from its branded process observation and
   reconciles binding, process, stream, timeout, signal, artifact, output, and
   terminal events before evidence admission.
6. The installed `worker_executes` lane now crosses the ordinary
   GTL -> HoG -> ABG -> replay -> CLI path with tool activity admitted under
   that lane. The closed-prompt lane continues to reject tool activity.

No parser, lowering phase, generated plan, compiled carrier, alternate
language, or public traversal controller was added. GTL remains TypeScript,
validation remains non-lowering, and HoG traverses the admitted GTL graph.

## Proof

- `npm run test:m4`: `26/26` pass, serialized;
- `npm run test:m5`: `28/28` pass, serialized;
- post-install implementation substitution refuses before Run, CCall, actor,
  or leaf execution;
- admitted leaf exceptions and malformed returns still complete the uniform
  CCall failure spine and append `run_stopped`;
- timeout proof observes the real `SIGKILL` exit and confirms the child PID is
  gone;
- `git diff --check`: pass; and
- compiled-plan, lowering, Public dynamic-import, and HoG raw-install-root
  censuses: zero.

Exact candidate basis used by both installed gates:

- artifact: `sha256:8b4e09fa3d070710d126d99e8970bd86fdf063a0e95becb7884c1e5bd88dcdbe`;
- Product content: `sha256:9982837f47d3d935d88790d15d54f9576b132787cf6def9c41216c315bbf8558`;
- manifest: `sha256:4aa8caee14a8b786f25b0f28ef538a6cd6216b3fc2e58fdb215160c86e588037`.

## Open Frontier

`ABG5-S02` remains open. The next implementation slice is still transparent
`workflow.C`, followed by the same-path forty-row traversal matrix, fibre
substitution, one genuinely live F_P call, and remaining RC5 dispositions.
That work must not begin until this authority checkpoint is reviewed or
directly accepted.
