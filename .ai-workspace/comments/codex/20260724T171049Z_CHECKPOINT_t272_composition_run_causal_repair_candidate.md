# T-272 Composition And Run-Causal Repair Candidate

## Identity

- candidate commit:
  `686d18bf31eb0dd5881dea9e031eca2a47a128ea`
- complete M05 design SHA-256:
  `d1be9081198d47f31e9b2de58451c7e73ec2ce6afee2505c5035635152f49cb0`
- Product artifact SHA-256:
  `b215d75566e82cb2be701cc9fb3a083f05f559835afe83e6c695bcc2dde21ffe`
- Product content digest:
  `sha256:c57ce2d3f71ee0db5c0fb72142e467b1b2994aafa2924e532ed2438061c394a9`
- Product manifest digest:
  `sha256:4d0feee33799375a0bb9b8d36dbfa55d3a1257c3e8cb7bdae2b7cf2ccc75f063`

## Exact Repair

This candidate keeps Product, requirements, scenarios, and ticket topology
unchanged. It repairs the bounded T-272/Section 12 authority boundary:

1. The Program publishes one admitted composition containing the exact four
   One Surface semantic authorities and Product closure policy.
2. Initial evaluation and refresh use the same authority identities.
   Descriptive stage-role strings carry no semantic authority.
3. Continuation binds actual admitted evidence, exact workspace, catalog,
   intent, Product policy, and causal runtime events.
4. ABG admits and replay-verifies one immutable action-evaluation carrier
   inside the existing construction-delta event.
5. Closure requires every run-causal intent across Frames and GraphCalls to
   have a matching admitted evaluation and delta.
6. Failure after admitted resume becomes causal ABG runtime-failure truth.

Installed mutations cover role renaming, Product-policy substitution,
unadmitted action selection, unproven output assets, workspace substitution,
cross-Frame pending intent, incomplete evaluation evidence, and post-resume
installed-byte failure.

## Verification

- `npm run test:m5`: `88/88`
- `npm run test:m5:external`: `17/17`
- `npm run test:m4`: `26/26`
- two independent packs:
  `b215d75566e82cb2be701cc9fb3a083f05f559835afe83e6c695bcc2dde21ffe`
- `git diff --check`: pass

The retained live F_P receipt was not rerun and belongs to an earlier package.
It is not evidence for this exact candidate.

## Gate

This checkpoint does not accept the Section 12 design and does not close S03.
The next consumer-visible S03 slice remains held pending exact review of the
candidate and design digest above. No Product reprice, migration, new ticket,
compiler, lowering carrier, Public controller, alternate runtime, or new
event family was introduced.
