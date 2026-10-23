import assert from 'node:assert/strict';
const queries=['{project="linkme13",service="nginx",stream="access"} | json','{project="linkme13",service="app"} | json | event="login_failed"','{project="linkme13",service="app"} | json | level="error"'];
const results=[];for(const q of queries){const url='http://loki:3100/loki/api/v1/query_range?query='+encodeURIComponent(q)+'&since=1h&limit=10';const r=await fetch(url);assert.ok(r.ok,await r.clone().text());const data=await r.json();assert.equal(data.status,'success');const count=data.data.result.reduce((n,s)=>n+s.values.length,0);assert.ok(count>0,'No log for '+q);results.push({query:q,lines:count});}
console.log(JSON.stringify({status:'PASS',queries:results,time:new Date().toISOString()}));
