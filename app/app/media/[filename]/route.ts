import {readFile} from 'node:fs/promises';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:Promise<{filename:string}>}){const {filename}=await params;if(!/^[a-f0-9-]{36}\.webp$/.test(filename))return new Response('Not found',{status:404});try{const data=await readFile('/data/uploads/'+filename);return new Response(new Uint8Array(data),{headers:{'Content-Type':'image/webp','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=86400'}});}catch{return new Response('Not found',{status:404});}}
