# B29 closed triage and disposition

Product Frame: T292 consolidates the fixed 15-family 5.0 scope toward local,
unqualified RC13. Exact revision evidence and physical worksite identity remain
Product obligations. Fixtures are observation/evidence with explicitly declared
lookup/filesystem premises; they never create ABG-admitted history. The verified
Definition and STDO3.0.4 basis are unchanged.

Root conjoins its Product/typed-owner/Proof trace with closed read-only
`T292-B29-VM-CONTEXT-01` from `/root/b29_vm_triage`. Exact failed subject and
raw/source pins are in `INPUTS.json`. The reviewer independently verified them
and the basis, performed no test/mutation, and returned `falsified` for the
existing proof claim. Same-host technical QA only.

TD85a source `9e846f9f2`, merged `686d67db3`, replaces inline realpath checks
with correctly imported `spelledAsStored`. Its actual helper uses
`storedSpelling(path) === path`, where storedSpelling calls realpathSync.native.
The collector fixture extracts the compiled collector and selector without
module imports, retaining the former realpathSync context entry. Its free-name
guard correctly finds the missing helper before every case. Dropping the guard
would let the collector's catch disguise the defect as an ordinary null.

Snapshot I/O is deliberately virtual: mapped bytes from the workflow fixture,
with no created historical snapshot tree. Importing the helper natively would
silently replace that premise with host filesystem dependence.

The same new dependency crosses a second reached fixture boundary. The binding
harness mocks node:fs, but natively imports the shared helper. Its explicit
physical control now calls unobserved native root resolution before the mocked
lstat. The unchanged aggregate count of one masks which operation was observed.
This is a proof interception leak, not demonstrated physical reads on replay-only
paths; those traced paths do not reach the spelling helper.

Complete bounded cone: the collector harness and its sole test consumer; the
binding harness, binding-transition test and unchanged native-semantic-revision
consumer. Binding-query-reuse extracts another function without spelling calls.
Other D2 modules exercise historical/projection routes through real imports;
no reached spelling-interception defect was identified there. Other function
extractors and filesystem mocks address unrelated bodies/operations. All ten
production helper importers have the import; their complete behavior is not
re-evaluated by this triage.

TD85a's 27-file battery omitted the collector consumer: selecting source-name
occurrences did not traverse the support-harness -> test dependency. Its own
process count reports no semantic-revision spelling site reached. The binding
test was present, but its aggregate counter permitted the later stat to replace
the earlier intercepted path resolution. This explains both misses.

Reviewer assessment: technical S2 because the proof is unconstructable. Root
disposition: S4/P1 under T293's explicit scale (test/diagnostic defect), with
repair before the next continuation/cut. No supported ordinary-use data loss,
incorrect runtime admission or production defect is established. The severity
distinction is retained; no obligation is waived.

Selected realization repair is the two support seams and two test files, using
actual compiled helper computations at controlled filesystem seams. Keep the
free-name tripwire, original assertions and mechanical-only standing. Add exact
root/member spelling, missing/different spelling controls and operation/path
observation of the first native root resolution. Reprove all three complete
affected test files once, freeze, then refresh inventory/source bindings before
any separately selected continuation. No global mocking framework, production
change, automatic retry, provider call or deadline reset is authorized.
