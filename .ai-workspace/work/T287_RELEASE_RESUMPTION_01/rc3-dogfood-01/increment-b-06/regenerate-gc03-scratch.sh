#!/bin/sh
# Operator-only diagnostic recipe: selected B05 inputs and current unqualified adapter.
# Creates only a fresh disposable scratch tree; no native admission, provider or Product edits.
set -eu
umask 077
source_dir='/Users/jim/src/apps/abiogenesis-rc3-dogfood/rc3-operator-inputs/increment-b-05/declared-gc03'
adapter='/Users/jim/src/apps/abiogenesis-rc3-dogfood/build_tenants/abiogenesis/typescript/code/support/governed-context/host_adapter.py'
expected='1eb6de41473ee6158c2a830d5188e98449c1ef2ea455644017b66217651eb6f3'
python='/Library/Frameworks/Python.framework/Versions/3.12/bin/python3.12'
actual=$(/usr/bin/shasum -a 256 "$adapter" | /usr/bin/awk '{print $1}')
[ "$actual" = "$expected" ] || { printf '%s\n' 'refused: current adapter digest differs' >&2; exit 2; }
scratch=$(/usr/bin/mktemp -d "${TMPDIR:-/tmp}/abg-gc03-policy.XXXXXXXX")
scratch=$(cd "$scratch" && /bin/pwd -P)
/bin/cp -R "$source_dir/governed-context-sources" "$scratch/governed-context-sources"
for name in make-gc03-candidate.py make-activation-template.py validate-gc03-candidate.py task.md rubric.json fixture.txt; do
  /bin/cp "$source_dir/$name" "$scratch/$name"
done
/bin/mkdir "$scratch/dependency"
/bin/cp "$adapter" "$scratch/dependency/host_adapter.py"
[ "$(/usr/bin/shasum -a 256 "$scratch/dependency/host_adapter.py" | /usr/bin/awk '{print $1}')" = "$expected" ] || { printf '%s\n' 'refused: copied adapter digest differs' >&2; exit 2; }
[ "$(/usr/bin/shasum -a 256 "$adapter" | /usr/bin/awk '{print $1}')" = "$expected" ] || { printf '%s\n' 'refused: source adapter drifted during copy' >&2; exit 2; }
"$python" -B "$scratch/make-gc03-candidate.py" --adapter "$scratch/dependency/host_adapter.py" --adapter-sha256 "$expected" --out-dir "$scratch/gc03-candidate-b04-source-001"
"$python" -B "$scratch/make-activation-template.py" "$scratch/gc03-candidate-b04-source-001"
"$python" -B "$scratch/validate-gc03-candidate.py"
printf 'scratch=%s\n' "$scratch"
printf '%s\n' 'Diagnostic only: current source is not an installed RC3 artifact or a native admission.'
