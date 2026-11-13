"""Ephemeron-aware reachability: an edge whose name says 'part of key (... @K)' is
followed only once node K is reached. Reports bytes that become unreachable when
the named nodes (by constructor name, or by id) are removed."""
import sys, re, collections, numpy as np
sys.path.insert(0, sys.argv[2])
from snapdiff import view
B = view(sys.argv[1]); N,E,S,col,ecol = B["N"],B["E"],B["strings"],B["col"],B["ecol"]
nt, et = B["node_types"], B["edge_types"]; n=B["n"]; fe=B["first_edge"]; nfc=B["nfc"]
to = (E[:, ecol["to_node"]] // nfc).tolist(); etype = E[:, ecol["type"]].tolist(); ename = E[:, ecol["name_or_index"]].tolist()
weak = et.index("weak"); internal = et.index("internal")
names=[S[x] for x in N[:,col["name"]].tolist()]; types=[nt[x] for x in N[:,col["type"]].tolist()]
sizes=N[:,col["self_size"]].tolist(); ids=N[:,col["id"]].tolist()
id2idx = {v:i for i,v in enumerate(ids)}
keyre = re.compile(r"part of key \([^@]*@(\d+)\)")
ekey = {}
for e,(t,nm) in enumerate(zip(etype, ename)):
    if t == internal:
        s = S[nm] if isinstance(nm, int) and nm < len(S) else ""
        if "part of key" in s:
            m = keyre.search(s)
            if m and int(m.group(1)) in id2idx: ekey[e] = id2idx[int(m.group(1))]
skipnames = ("(Internalized strings)", "(String table)", "(Weak collections)", "(Compilation cache)", "(Extensions)")
skip = set(i for i in range(min(n, 200)) if names[i] in skipnames)
fe = fe.tolist()
def reach(excluded):
    seen = bytearray(n); seen[0]=1; stack=[0]; pending = collections.defaultdict(list)
    while stack:
        u = stack.pop()
        if u in skip: continue
        if u in pending:
            for v in pending.pop(u):
                if not seen[v] and v not in excluded: seen[v]=1; stack.append(v)
        for e in range(fe[u], fe[u+1]):
            if etype[e]==weak: continue
            v = to[e]
            if seen[v] or v in excluded: continue
            k = ekey.get(e)
            if k is not None and not seen[k]:
                pending[k].append(v); continue
            seen[v]=1; stack.append(v)
    return seen
base = reach(set())
total = sum(s for i,s in enumerate(sizes) if base[i])
print(f"reachable {total/1048576:.1f} MB")
for spec in sys.argv[3:]:
    kind, val = spec.split("=",1)
    if kind == "name": ex = {i for i in range(n) if names[i]==val and types[i] in ("object","native")}
    elif kind == "edge":   # exclude targets of property/context edges with this name
        ex = set()
        for u in range(n):
            for e in range(fe[u], fe[u+1]):
                if S[ename[e]] == val if et[etype[e]] in ("property","context") else False: ex.add(to[e])
    r = reach(ex)
    lost = [i for i in range(n) if base[i] and not r[i]]
    by = collections.Counter()
    for i in lost: by[types[i]] += sizes[i]
    print(f"{spec}: excluded {len(ex)} nodes; unreachable {sum(sizes[i] for i in lost)/1048576:.2f} MB in {len(lost)} nodes; by type " +
          ", ".join(f"{k} {v/1048576:.1f}" for k,v in by.most_common(5)))
