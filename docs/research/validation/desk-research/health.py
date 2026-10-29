import json, urllib.request, time, statistics, datetime as dt, sys
H={"Accept":"application/vnd.github+json","User-Agent":"colourist-research"}
def get(url):
    for _ in range(4):
        r=urllib.request.urlopen(urllib.request.Request(url,headers=H),timeout=30)
        if r.status==202: time.sleep(4); continue
        return json.load(r)
    return None
repos=sys.argv[1:]
now=dt.datetime(2026,10,28,tzinfo=dt.timezone.utc); since=now-dt.timedelta(days=365)
out={}
for rp in repos:
    d={}
    info=get(f"https://api.github.com/repos/{rp}")
    d.update(stars=info["stargazers_count"],licence=(info.get("license") or {}).get("spdx_id"),open_issues=info["open_issues_count"],created=info["created_at"][:10])
    rel=get(f"https://api.github.com/repos/{rp}/releases?per_page=100")
    rs=[r for r in rel if r["published_at"] and r["published_at"]>=since.isoformat()[:19]]
    d["releases_12m"]=len(rs); d["latest_release"]=rel[0]["tag_name"]+" "+rel[0]["published_at"][:10] if rel else None
    st=get(f"https://api.github.com/repos/{rp}/stats/contributors")
    cut=int(since.timestamp()); counts={}
    for c in st or []:
        n=sum(w["c"] for w in c["weeks"] if w["w"]>=cut)
        if n: counts[c["author"]["login"] if c["author"] else "?"]=n
    tot=sum(counts.values()); top=sorted(counts.values(),reverse=True)
    d["commits_12m"]=tot; d["active_contributors_12m"]=len(counts)
    d["top_contributor_share"]=round(top[0]/tot,2) if tot else None
    # bus factor: min people covering 50% of commits
    acc=0;bf=0
    for v in top:
        acc+=v;bf+=1
        if acc>=tot/2: break
    d["bus_factor_50pct"]=bf
    out[rp]=d; print(rp,d,flush=True); continue
    iss=get(f"https://api.github.com/repos/{rp}/issues?state=all&per_page=40&sort=created&direction=desc")
    iss=[i for i in iss if "pull_request" not in i and i["created_at"]<= (now-dt.timedelta(days=14)).isoformat()[:19]][:7]
    resp=[];closed=0
    for i in iss:
        if i["state"]=="closed": closed+=1
        cm=get(i["comments_url"]+"?per_page=10") if i["comments"] else []
        t0=dt.datetime.fromisoformat(i["created_at"].replace("Z","+00:00"))
        first=[c for c in cm if c["user"]["login"]!=i["user"]["login"] and c["user"]["type"]!="Bot"]
        if first:
            resp.append((dt.datetime.fromisoformat(first[0]["created_at"].replace("Z","+00:00"))-t0).total_seconds()/3600)
        elif i["state"]=="closed" and i["closed_at"]:
            resp.append((dt.datetime.fromisoformat(i["closed_at"].replace("Z","+00:00"))-t0).total_seconds()/3600)
    d["sample_issues"]=len(iss); d["sample_closed"]=closed; d["responded"]=len(resp)
    d["median_first_response_h"]=round(statistics.median(resp),1) if resp else None
    out[rp]=d; print(rp,d,flush=True)
json.dump(out,open("health.json","w"),indent=1)
