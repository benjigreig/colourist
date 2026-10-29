import json, urllib.request, time, statistics, datetime as dt, sys, urllib.parse
H={"Accept":"application/vnd.github+json","User-Agent":"colourist-research"}
def get(url):
    r=urllib.request.urlopen(urllib.request.Request(url,headers=H),timeout=30); return json.load(r)
def search(q):
    time.sleep(7)
    return get("https://api.github.com/search/issues?per_page=8&sort=created&order=desc&q="+urllib.parse.quote(q))
out={}
for rp in sys.argv[1:]:
  try:
      opened=search(f"repo:{rp} is:issue created:2025-10-28..2026-10-28")
      closed=search(f"repo:{rp} is:issue created:2025-10-28..2026-10-28 is:closed")
      samp=search(f"repo:{rp} is:issue created:2026-08-01..2026-09-30")
      resp=[]
      for i in samp["items"][:2]:
          t0=dt.datetime.fromisoformat(i["created_at"].replace("Z","+00:00"))
          cm=get(i["comments_url"]+"?per_page=10") if i["comments"] else []
          f=[c for c in cm if c["user"]["login"]!=i["user"]["login"] and c["user"]["type"]!="Bot"]
          if f: resp.append((dt.datetime.fromisoformat(f[0]["created_at"].replace("Z","+00:00"))-t0).total_seconds()/3600)
          elif i["closed_at"]: resp.append((dt.datetime.fromisoformat(i["closed_at"].replace("Z","+00:00"))-t0).total_seconds()/3600)
      d=dict(issues_opened_12m=opened["total_count"],issues_closed_of_those=closed["total_count"],
             close_rate=round(closed["total_count"]/opened["total_count"],2) if opened["total_count"] else None,
             sample=len(samp["items"][:2]),responded=len(resp),median_first_response_h=round(statistics.median(resp),1) if resp else None)
      out[rp]=d; print(rp,d,flush=True)
  except Exception as e:
    print(rp,'error',e)
json.dump(out,open("issues.json","w"),indent=1)
