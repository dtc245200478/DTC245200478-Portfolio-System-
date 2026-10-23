import assert from 'node:assert/strict';
const get=async(url)=>{const r=await fetch(url);assert.ok(r.ok,url);return r.json();};
const targets=await get('http://prometheus:9090/api/v1/targets');const jobs=['prometheus','linkme','nginx','mysql','cadvisor'];for(const j of jobs){const t=targets.data.activeTargets.find(t=>t.labels.job===j);assert.ok(t&&t.health==='up',j+' target must be up');}
const query=async q=>(await get('http://prometheus:9090/api/v1/query?query='+encodeURIComponent(q))).data.result;
const cpu=await query('container_cpu_usage_seconds_total{container_label_com_docker_compose_project="linkme13",image!=""}');const mem=await query('container_memory_working_set_bytes{container_label_com_docker_compose_project="linkme13",image!=""}');for(const service of ['app','nginx','mysql']){assert.ok(cpu.some(x=>x.metric.container_label_com_docker_compose_service===service),'missing CPU '+service);assert.ok(mem.some(x=>x.metric.container_label_com_docker_compose_service===service&&Number(x.value[1])>0),'missing RAM '+service);}
for(const q of ['nginx_http_requests_total','mysql_up','mysql_global_status_threads_connected','linkme_portfolio_views_total'])assert.ok((await query(q)).length,q);
console.log(JSON.stringify({status:'PASS',jobs,containerMetrics:['app','nginx','mysql'],time:new Date().toISOString()}));
