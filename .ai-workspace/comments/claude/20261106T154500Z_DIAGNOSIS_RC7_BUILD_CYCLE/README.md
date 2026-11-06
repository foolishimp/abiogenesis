# Diagnosis: why the RC7 build cycle is slow and why HS01 did not integrate

Commentary, not ratified design. Reviewer: Claude Fable 5.1. Pen stays with
Codex. Nothing is pushed. Subject: the status report "As of 02:31 AEDT,
7 November" and the Root records it summarizes. Times below are AEDT (UTC+11)
unless marked Z.

## 0. One correction to the report

The report says the Worker is "running now" with a limit around 03:20. The
Worker returned at 02:36:58, five minutes after the report, with
`disposition: completed`, a passed stage build (compile 7.6 s, generate 22.6 s,
lifecycle check clean, source freeze `4ee90cb4…`, 12 changed paths) and
`completedLanesObserved: 0`. It refused to invoke any lane because the supplied
helper's line 81 throws unless `lane.timeoutMs === 300000`, and the two primary
lanes are bound at 600000. The frozen build exists; the test evidence for it
does not. The corrected helper is prepared but not bound to any grant.

## 1. Verdict

Three causes, in order of weight. They compound.

1. **The fixed cost per task is about 56 minutes and the task bodies are
   5 to 10 minutes.** Between HS01's close and HS02's host start the Root
   spent 48.5 minutes on review, disposition, proof, and preparation; the
   launch then took 8.1 minutes. Each Worker activation is wrapped in about
   forty custody records, the 713 KB ticket is copied into each task two or
   three times, and the lane helper is copied per task with hand edits. One such
   edit left the `300000` literal, and because control inputs are frozen at
   admission, that one literal cost an entire Worker session's lanes.
2. **The builder is immutable RC6 running on one log that grows every
   session, and its launch cost is CPU in the product, not I/O.** The log is
   2.05 GB and grew 160, 113 and 141 MB in the last three sessions. Reading
   all of it takes 0.13 s and hashing it 0.96 s; RC6 took 190 s to acquire
   and 254 s to prepare the environment. Nothing in RC7's source reduces
   this until RC7 is cut, installed and used as the builder.
3. **The host is memory-starved, and the last launch ran 3 to 4 times slower
   in every phase, including the ones that never touch the log.** At 02:44
   the machine shows 126 GB of 128 GB used, 30 GB in the compressor, 3.8 GB
   of swap, 935 MB free, `fseventsd` at 23 GB resident, load 8, uptime
   32 days, and the data volume at 99 % with 28 GB free.

## 2. The launches

| Launch (AEDT) | Log at entry | spawn to host | identity | acquire | environment | construct | prepared to actor | total to actor |
|---|---|---|---|---|---|---|---|---|
| Fixed-proof host, 20:11 6 Nov | 1.52 GB | | | 38.2 s | 46.1 s | 1.9 s | | 86 s prepared |
| HS01 author, 23:54 6 Nov | 1.80 GB | 1.0 s | 1.3 s | 47.1 s | 61.5 s | 2.2 s | 7.2 s | 120 s |
| HS02 author, 01:41 7 Nov | 1.91 GB | 4.4 s | 3.8 s | 189.6 s | 253.9 s | 9.0 s | 26.0 s | 487 s |

Source: `rc7-held-session-author-02/operator-custody-001/ROOT_SESSION_COSTS.json`,
`PREPARATION_PHASES.json`, and the F host's `outcome-summary.json`.

Acquire per gigabyte: 25 s, 26 s, 99 s. The log grew 6 % between the last
two launches; the cost grew 4×. The phases that do not read the log grew
by the same factor: process spawn to host marker 1.0 s to 4.4 s, identity
1.3 s to 3.8 s, prepared to actor start 7.2 s to 26.0 s. A uniform factor
across unrelated phases is host contention, not log growth. The same
contention is visible inside HS01: its stage-01 generate step was killed by
`spawnSync node ETIMEDOUT` at 180 s, and the identical step in HS02 took
22.6 s. The Root's host sample was taken after actor start and shows the host
waiting on the SDK stream, so it cannot attribute the acquisition cost; the
figures above are the attribution.

## 3. Between tasks: where the 48.5 minutes went

| Interval (AEDT, 7 Nov) | Minutes | Work |
|---|---|---|
| 00:53 to 01:06 | 13 | independent review (`reviews/held-stage03-001`), post-return controls, Root disposition, proof selection |
| 01:07 to 01:18 | 12 | two operator proof runs, 260 s and 287 s, one test each, 3.1 and 3.3 GB resident; post-proof disposition |
| 01:18 to 01:40 | 22 | HS02 task preparation: workload 190 KB, grant, bindings, admission, dispatch manifest, ticket copy 713 KB |
| 01:40 to 01:42 | 2 | host start |

The 22 minutes of preparation produced the helper with the stale literal.
The admission checked JSON bounds against JSON bounds and could not see a
literal inside code. This is the stale-pin class from the RC3 review: a value
copied into a second place instead of referenced from one.

## 4. Why HS01 did not integrate

HS01's task text already contained the four items from my plan review: read
owners, maintained caller migration, mandatory owner-contract and catalog
regeneration, and the HS03 flush location (`inputs/TASK.md` lines 10, 11,
19, 42; `inputs/HELD_SESSION_REVIEW.md` is that review). The Worker had
59 minutes. It delivered the eleven-path delta, the borrowed read owners,
completion and R5. It lost at least 3 minutes to the generate timeout, hit a
measured red at stage 03, and returned with two items open that the Root
named `HS01-RUNNER-001` (runner lacks the abg binding on the completed-Run
readback path) and `HS01-ASSESSMENT-001` (direct UAT assessment identity and
the Program-declared response and closure relation). The post-author proof
then confirmed both halves: HS02 passed on the 3.5 MB fixture (one
acquisition, two warm Runs and two held reads with zero decodes and zero
reopens, four refusals, cold equality), and the maintained caller "refused
at run-environment declaration", which is the report's incomplete
declaration set.

So the integration defects are not new discoveries. They are the part of a
correctly scoped bundle that did not fit in one session, split into a second
task, whose session was then consumed by the control defect. The scope was
sized to the design; the session is sized by the builder. Each lane on the
cold machinery costs 4 to 5 minutes and 3 GB for a single test, six lanes were
bound for HS02, and a stage build can lose 3 minutes to a timeout, so a
session carries one build and a handful of lanes, not a bundle.

## 5. What changes the slope

- **Run the lanes, not a new Worker.** The frozen build `4ee90cb4…` is the
  subject. The corrected helper plus the six bound lanes is an operator step
  against that build. A new Worker session adds 8 minutes of launch and
  140 MB of log for work that is already built.
- **One task for the rest of HS01.** Runner binding, assessment relation,
  the large-log HS02 measurement and the S2/S7 residue are one activation
  with one review at its close. Three tasks cost three fixed costs.
- **Fresh runtime for the remaining RC7 author tasks.** This is an owner
  decision. The 2.05 GB log stays as the record of what it holds; the next
  tasks start a new runtime. Acquisition on a small log is under a second
  (0.46 s on the 3.5 MB fixture); on this log it is now over three minutes
  and rising about 7 % per session even without contention.
- **Clear the host before the next launch.** `fseventsd` at 23 GB resident
  and 30 GB in the compressor are not a product matter. A restart, closing
  the watchers over `.ai-workspace/work` and the sandbox install trees, and
  removing the roughly 250 GB of suite worktrees noted on 1 November, are
  the cheapest minutes available.
- **Reference, do not copy, per task.** The ticket, the helper and the
  bounds should be pinned by digest from one place. Every copy is a place
  for a `300000` to survive.

## 6. Limits

No product code was run; the only commands were a sequential read and a
hash of the log and host statistics at 02:44. The host state at 01:41 is
inferred from the uniform slowdown and the HS01 timeout, not sampled. Records
read: the three Root dispositions and proof summaries under
`rc7-held-session-author-01/preparation-reconciliation-001`, the HS02
custody, phases, control finding, correction, session costs, stage build,
outcome and close under `rc7-held-session-author-02`, and the HS01 task
inputs. Same model family as the HS01 and HS02 Workers.
