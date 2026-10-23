import { randomBytes, createHash, createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { query,secret } from './db';
export const COOKIE='linkme_session';
export function hash(s:string) {return createHash('sha256').update(s).digest('hex');}
export function passwordHash(p:string) {const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(p,salt,64).toString('hex');}
export function passwordValid(p:string,stored:string) { const [salt,key]=stored.split(':'); if(!salt||!key) return false;const a=scryptSync(p,salt,64),b=Buffer.from(key,'hex');return a.length===b.length&&timingSafeEqual(a,b);}
export function csrf(raw:string) {return createHmac('sha256',secret('SESSION_SECRET')).update(raw).digest('hex');}
export function sameOrigin(req:NextRequest) {const origin=req.headers.get('origin');const host=req.headers.get('x-forwarded-host')||req.headers.get('host');return !!origin&&new URL(origin).host===host;}
export async function session(req:NextRequest) {const token=req.cookies.get(COOKIE)?.value; if(!token) return null; const rows=await query<{admin_id:number}>('SELECT admin_id FROM sessions WHERE token_hash=? AND expires_at>UTC_TIMESTAMP()',[hash(token)]);return rows[0]?{id:rows[0].admin_id,token,csrf:csrf(token)}:null;}
export function cookie(res:NextResponse,value:string,maxAge:number) {res.cookies.set(COOKIE,value,{httpOnly:true,sameSite:'strict',secure:process.env.COOKIE_SECURE==='true',path:'/',maxAge});return res;}
export async function createSession(id:number) {const token=randomBytes(32).toString('hex'); await query('DELETE FROM sessions WHERE expires_at<UTC_TIMESTAMP()');await query('INSERT INTO sessions(token_hash,admin_id,expires_at) VALUES(?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 8 HOUR))',[hash(token),id]);return token;}
