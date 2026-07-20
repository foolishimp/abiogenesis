# T-286 R10 Installed CLI Root Green

## Claim

`ABI5-ROOT-001` satisfies `R1` through `R10` on one exact packed candidate.
The candidate is installed into a source-blind host, the caller submits every
public operation and target identity explicitly, HoG traverses the original
validated GTL, ABG admits the causal runtime spine, two replay folds agree, and
the installed `abg.cli` returns the replay-derived typed Hello World outcome.

This is root-green evidence. It does not discharge the rival-path mutation
contract, exact-candidate review, or M4 closure.

## Exact Implementation

- commit: `39a0b6bc5acccae25b091a5c167c1ac4891591db`
- branch: `codex/t286-abi5-root`
- root binding: `ABI5-ROOT-001`
- artifact digest:
  `sha256:13279585e9dc3e6e904acbff58f2ba7077a0595b23594d74a176a764d7d42717`
- admitted runtime invocation:
  `invocation://abiogenesis/dc3ba301a7cec34364c0f876a8c3ee04ccae05542b1e79e74e1a468be9f86e4d`

## Installed Public Path

The CLI receives six caller-authored public requests in an explicit JSONL
transcript:

```text
product.verify
  -> product.install
  -> workspace.bind
  -> catalog.admit
  -> catalog.view
  -> run.invoke(direct)
```

No operation, target, Program, GraphFunction, implementation, or execution
basis is supplied by an omitted default. The CLI parses, transports, and
renders. The fixed public operation application delegates owner work to
Product, validator, ABG, HoG, and the admitted leaf port.

## Replay And Outcome

- durable ABG events: `22`
- first replay digest:
  `sha256:4268e8266d3c423774d1ce7ed0d3296a72d8d9d6e125deca9bcf7e476065f954`
- second replay digest: identical
- durable event-log digest:
  `sha256:f486ed89427214b6a383c66885d7e7b0970e3c4780f3abf3b978e2bb4046a513`
- output contract:
  `contract://abiogenesis/conformance/hello-output@5`
- typed result: `hello_world_output { message: "Hello World" }`

Success requires exactly one C-call, closed replay truth, matching admitted
result contract, all four closure refs, equal replay folds, and an event-log
payload whose event digest equals the replayed store digest.

## Verification

- strict TypeScript build: pass
- root suite through R10: `11/11` pass
- package audit: `0` vulnerabilities
- `git diff --check`: pass
- installed binary proof: pass
- evidence: `test_env/evidence/abi5-root-r10.json`

## Remaining M4 Work

1. Execute the real-path rival-authority mutation set in T-286 B8.
2. Run focused root-altitude code review over the exact candidate.
3. Freeze and independently review the M4 evidence cut.
4. Close T-286 only if the positive and negative halves agree.
