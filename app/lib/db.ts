import mysql from 'mysql2/promise';
import { readFileSync } from 'node:fs';
export function secret(name: string) { const p = process.env[name + '_FILE']; return p ? readFileSync(p, 'utf8').trim() : process.env[name] || ''; }
const g = globalThis as unknown as { db?: mysql.Pool };
export function pool() { return g.db ||= mysql.createPool({host:process.env.DB_HOST||'mysql', port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'linkme_app',password:secret('DB_PASSWORD'),database:process.env.DB_NAME||'linkme',connectionLimit:8,charset:'utf8mb4',timezone:'Z',dateStrings:true}); }
export async function query<T = Record<string, unknown>>(sql:string, values:unknown[] = []):Promise<T[]> { const [rows]=await pool().execute(sql,values as never[]); return rows as T[]; }
export type Entry = { id:number; [key:string]: any };
export async function content(table:string):Promise<Entry[]> { if(!['skills','education','experience','projects','social_links'].includes(table)) throw new Error('Invalid table'); return query<Entry>(`SELECT * FROM ${table} ORDER BY sort_order,id`); }
export async function profile():Promise<Entry> { return (await query<Entry>('SELECT * FROM profile WHERE id=1'))[0]; }
