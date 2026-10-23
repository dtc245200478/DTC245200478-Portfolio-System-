import { appendFileSync, mkdirSync } from 'node:fs';
import client from 'prom-client';
const g=globalThis as unknown as { telemetry?: {registry:client.Registry; requests:client.Counter; duration:client.Histogram; views:client.Counter} };
export function telemetry() {
 if(g.telemetry) return g.telemetry;
 const registry=new client.Registry(); client.collectDefaultMetrics({register:registry});
 const requests=new client.Counter({name:'linkme_http_requests_total',help:'Admin API requests',labelNames:['route','method','status'],registers:[registry]});
 const duration=new client.Histogram({name:'linkme_http_duration_seconds',help:'API latency',labelNames:['route','method'],registers:[registry],buckets:[.01,.05,.1,.3,1,3]});
 const views=new client.Counter({name:'linkme_portfolio_views_total',help:'Portfolio renders',registers:[registry]});
 return g.telemetry={registry,requests,duration,views};
}
export function log(event:string,fields:Record<string,unknown>={}) { const line=JSON.stringify({time:new Date().toISOString(),level:event==='app_error'?'error':'info',event,...fields}); console.log(line); try {mkdirSync('/var/log/app',{recursive:true});appendFileSync('/var/log/app/app.log',line+'\n');} catch {} }
