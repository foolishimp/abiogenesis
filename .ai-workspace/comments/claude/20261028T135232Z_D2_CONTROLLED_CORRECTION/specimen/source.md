# Mechanical lifecycle specimen

This is a scratch component workload. It does not implement Data Mapper or
establish application acceptance.

The only writable candidate is fixture/value.txt. First, the native
Construction actor deliberately writes the exact bytes "broken\n". The
independent, unchanged fixture/checker.mjs must execute through the existing
native C2 owner and report FIXTURE_VALUE_BAD with exit status 1.

After that actual diagnostic has been observed, the selected native repair
changes only fixture/value.txt to the exact bytes "fixed\n". C2 then executes
the same command and reports FIXTURE_VALUE_FIXED with exit status 0. Preserve
both measurements, the original task, the failed producer and its literal
diagnostic citation. Never edit this source, the checker or the rubric.

The deterministic responder supplies fixture decisions, not semantic
assessment. The support obligation remains unresolved, terminal stays false,
and the selector explicitly gaps. A later supported invocation must reuse the
recorded work and actual files without rerunning their authors or measurements.
