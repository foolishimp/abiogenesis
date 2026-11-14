# Source records and local execution evidence

GitHub carries authored source, specifications, tests, scripts, reviews, decisions
and compact status/provenance records. A request to checkpoint or push everything
does not include raw execution artifacts.

Keep raw event stores, model/command output, by-value invocation and result bodies,
profiles, copied source/install trees, compiler caches, large generated diffs and
recovery archives local. Do not move them to Git LFS merely to make a push succeed.
A durable summary names the source/cut, result, limits, local evidence location
and digest. Runtime evidence and qualification claims remain distinct.

The repository ignore rules cover recurring generated paths. Exact older bodies
are also excluded locally by the retained publication-correction census. Small
authored patches and concise verification summaries may be deliberately tracked;
a raw capture's small size does not make it an authored record.

Before publication, inspect the actual new Git objects and LFS pointers, not only
the working-tree status. Original evidence/history preservation is local and does
not imply that the recovery bundle belongs in the remote repository.
