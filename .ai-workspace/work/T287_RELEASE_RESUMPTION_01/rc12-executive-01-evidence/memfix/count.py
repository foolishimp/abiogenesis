import sys, collections
sys.path.insert(0, sys.argv[2])
from snapdiff import view
B = view(sys.argv[1]); N,S,col = B["N"],B["strings"],B["col"]; nt=B["node_types"]
want = set(sys.argv[3].split(","))
c = collections.Counter(); sz = collections.Counter()
for t, nm, s in zip(N[:,col["type"]].tolist(), N[:,col["name"]].tolist(), N[:,col["self_size"]].tolist()):
    name = S[nm]
    if nt[t] == "object" and name in want: c[name]+=1; sz[name]+=s
for k in sorted(want): print(k, c[k])
