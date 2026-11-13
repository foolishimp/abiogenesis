import sys, collections, numpy as np
sys.path.insert(0, sys.argv[3])
from snapdiff import view
A = view(sys.argv[1]); ids_a = set(A["N"][:, A["col"]["id"]].tolist()); del A
B = view(sys.argv[2]); N,E,S,col,ecol = B["N"],B["E"],B["strings"],B["col"],B["ecol"]
nt, et = B["node_types"], B["edge_types"]; n=B["n"]; fe=B["first_edge"]; nfc=B["nfc"]
to = E[:, ecol["to_node"]] // nfc; etype = E[:, ecol["type"]]; ename = E[:, ecol["name_or_index"]]
weak = et.index("weak")
skip = set(i for i in range(min(n, 200)) if S[N[i, col["name"]]] in ("(Internalized strings)", "(String table)", "(Weak collections)", "(Compilation cache)", "(Extensions)"))
# Propagate a class label along BFS: label of a node = label of its BFS parent, except
# ModuleWrap objects define a label from their url.
cls = [None]*n
def mwlabel(v):
    # native ModuleWrap: find a url string via its JS wrapper
    return None
parent = np.full(n, -1, np.int64); parent[0]=0; fr=[0]; cls[0]="root"
names = [S[x] for x in N[:, col["name"]].tolist()]
types = [nt[x] for x in N[:, col["type"]].tolist()]
while fr:
    nx=[]
    for u in fr:
        if u in skip: continue
        cu = cls[u]
        for e in range(fe[u], fe[u+1]):
            if etype[e]==weak: continue
            v=to[e]
            if parent[v]==-1:
                parent[v]=u; nx.append(v)
                c = cu
                if types[v]=="native" and names[v]=="Node / ModuleWrap": c = "module"
                elif cu=="module" and types[v]=="string" and names[v].startswith("file:///") and "abi5-root-env" in names[v] and False: pass
                cls[v]=c
    fr=nx
ids = N[:, col["id"]].tolist(); sizes = N[:, col["self_size"]].tolist()
agg = collections.Counter(); cnt=collections.Counter()
for i in range(n):
    if ids[i] in ids_a: continue
    c = cls[i] if parent[i]!=-1 else "unreached-strong"
    if c != "module":
        c = c + ":" + types[i]
    agg[c]+=sizes[i]; cnt[c]+=1
tot = sum(agg.values())
for k,v in agg.most_common(15): print(f"{v/1048576:8.2f} MB {cnt[k]:8d} {k}")
print(f"total new {tot/1048576:.2f} MB")
