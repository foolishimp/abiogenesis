import sys, collections, numpy as np
sys.path.insert(0, sys.argv[3])
from snapdiff import view
A = view(sys.argv[1]); ids_a = set(A["N"][:, A["col"]["id"]].tolist()); del A
B = view(sys.argv[2]); N,E,S,col,ecol = B["N"],B["E"],B["strings"],B["col"],B["ecol"]
nt, et = B["node_types"], B["edge_types"]; n=B["n"]; fe=B["first_edge"]; nfc=B["nfc"]
to = E[:, ecol["to_node"]] // nfc; etype = E[:, ecol["type"]]; ename = E[:, ecol["name_or_index"]]
weak = et.index("weak")
skip = set(i for i in range(min(n, 200)) if S[N[i, col["name"]]] in ("(Internalized strings)", "(String table)", "(Weak collections)", "(Compilation cache)", "(Extensions)"))
parent = np.full(n, -1, np.int64); pedge = np.full(n, -1, np.int64); parent[0]=0; fr=[0]
while fr:
    nx=[]
    for u in fr:
        if u in skip: continue
        for e in range(fe[u], fe[u+1]):
            if etype[e]==weak: continue
            v=to[e]
            if parent[v]==-1: parent[v]=u; pedge[v]=e; nx.append(v)
    fr=nx
ids = N[:, col["id"]]; sizes = N[:, col["self_size"]]
def label(i): return f"{nt[N[i,col['type']]]}:{S[N[i,col['name']]][:70]!r}"
def elabel(e):
    t=et[etype[e]]; nm = ename[e] if t in ("element","hidden") else S[ename[e]]
    return f"-[{t}:{str(nm)[:40]}]->"
def path(i):
    out=[]; v=i; k=0
    while v!=0 and parent[v]!=-1 and k<60: out.append(elabel(pedge[v])+label(v)); v=parent[v]; k+=1
    return "\n    ".join(reversed(out))
want = sys.argv[4].split("|")
strtypes = {nt.index(t) for t in ("string","concatenated string","sliced string") if t in nt}
found = collections.Counter()
for i in range(n):
    if ids[i] in ids_a or parent[i] in (-1,): continue
    if N[i,col["type"]] not in strtypes: continue
    e = pedge[i]; t=et[etype[e]]
    if t != "property": continue
    nm = S[ename[e]]
    if nm in want and found[nm] < 1 and sizes[i] > 64:
        found[nm]+=1
        print(f"== {nm} {sizes[i]} bytes {S[N[i,col['name']]][:80]!r}\n    {path(i)}\n")
