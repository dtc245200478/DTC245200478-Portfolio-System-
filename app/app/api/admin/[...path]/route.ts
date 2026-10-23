import {NextRequest,NextResponse} from 'next/server';
import {randomUUID,timingSafeEqual} from 'node:crypto';import {writeFile,mkdir,unlink} from 'node:fs/promises';
import sharp from 'sharp';import {query,pool,Entry} from '@/lib/db';import {hash,passwordValid,passwordHash,session,sameOrigin,csrf,createSession,cookie} from '@/lib/auth';import {resources,validate} from '@/lib/resources';import {telemetry,log} from '@/lib/telemetry';
export const runtime='nodejs';export const dynamic='force-dynamic';
async function handle(req:NextRequest,context:{params:Promise<{path:string[]}>}){const start=performance.now();const {path}=await context.params;const [resource,id]=path;let status=200;const json=(body:unknown,code=200)=>{status=code;return NextResponse.json(body,{status:code,headers:{'Cache-Control':'no-store'}});};
try{
 if(req.method!=='GET'&&!sameOrigin(req))return json({error:'Nguồn yêu cầu không hợp lệ'},403);
 if(req.method!=='GET'&&resource!=='media'&&!req.headers.get('content-type')?.includes('application/json'))return json({error:'Cần nội dung JSON'},415);
 if(resource==='login'&&req.method==='POST'){
 const body=await req.json();const username=String(body.username||'').slice(0,80),password=String(body.password||'');if(password.length>200)return json({error:'Thông tin đăng nhập không hợp lệ'},400);
 const key=hash((req.headers.get('x-real-ip')||'local')+'|'+username);
 await query('INSERT INTO login_attempts(attempt_key,attempts,window_start) VALUES(?,0,UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE attempts=IF(window_start<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 15 MINUTE),0,attempts),window_start=IF(window_start<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 15 MINUTE),UTC_TIMESTAMP(),window_start)',[key]);
 await query('UPDATE login_attempts SET attempts=attempts+1 WHERE attempt_key=?',[key]);
 const [attempt]=await query<Entry>('SELECT attempts FROM login_attempts WHERE attempt_key=?',[key]);if(attempt.attempts>5){log('login_rate_limited');return json({error:'Quá nhiều lần thử. Vui lòng chờ 15 phút.'},429);}
 const [admin]=await query<Entry>('SELECT * FROM admins WHERE username=?',[username]);if(!admin||!passwordValid(password,admin.password_hash)){log('login_failed');return json({error:'Tên đăng nhập hoặc mật khẩu chưa đúng'},401);}
 await query('DELETE FROM login_attempts WHERE attempt_key=?',[key]);const token=await createSession(admin.id);log('login_success');return cookie(json({ok:true,csrf:csrf(token)}),token,28800);
 }
 const auth=await session(req);if(!auth)return json({error:'Vui lòng đăng nhập'},401);
 if(resource==='session'&&req.method==='GET')return json({username:'admin',csrf:auth.csrf});
 if(req.method!=='GET'){const h=req.headers.get('x-csrf-token')||'';const a=Buffer.from(h),b=Buffer.from(auth.csrf);if(a.length!==b.length||!timingSafeEqual(a,b))return json({error:'Phiên xác nhận không hợp lệ, vui lòng tải lại trang'},403);}
 if(resource==='logout'&&req.method==='POST'){await query('DELETE FROM sessions WHERE token_hash=?',[hash(auth.token)]);log('logout');return cookie(json({ok:true}),'',0);}
 if(resource==='password'&&req.method==='POST'){const b=await req.json();if(typeof b.newPassword!=='string'||b.newPassword.length<12||b.newPassword.length>128)return json({error:'Mật khẩu mới cần từ 12 đến 128 ký tự'},400);const [admin]=await query<Entry>('SELECT password_hash FROM admins WHERE id=?',[auth.id]);if(!passwordValid(String(b.currentPassword||''),admin.password_hash))return json({error:'Mật khẩu hiện tại chưa đúng'},400);await query('UPDATE admins SET password_hash=? WHERE id=?',[passwordHash(b.newPassword),auth.id]);await query('DELETE FROM sessions WHERE admin_id=?',[auth.id]);log('password_changed');return cookie(json({ok:true}),'',0);}
 if(resource==='diagnostics'&&id==='error'&&req.method==='POST'){log('app_error',{message:'Lỗi thử nghiệm có kiểm soát cho demo LogQL'});return json({error:'Lỗi thử nghiệm đã được ghi log'},500);}
 if(resource==='media'){
 if(req.method==='GET')return json(await query('SELECT * FROM media ORDER BY id DESC LIMIT 100'));
 if(req.method==='POST') {if(Number(req.headers.get('content-length')||0)>5500000)return json({error:'Ảnh tối đa 5 MB'},413);const form=await req.formData(),file=form.get('file');if(!(file instanceof File)||file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))return json({error:'Chọn ảnh JPG, PNG hoặc WebP không quá 5 MB'},400);let buffer:Buffer;try{buffer=await sharp(Buffer.from(await file.arrayBuffer()),{limitInputPixels:20000000}).rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();}catch{return json({error:'Tệp ảnh bị lỗi hoặc không hợp lệ'},400);}const filename=randomUUID()+'.webp';await mkdir('/data/uploads',{recursive:true});await writeFile('/data/uploads/'+filename,buffer);try{await query('INSERT INTO media(filename,mime,size_bytes) VALUES(?,?,?)',[filename,'image/webp',buffer.length]);}catch(e){await unlink('/data/uploads/'+filename);throw e;}log('media_uploaded');return json({url:'/media/'+filename},201);}
 return json({error:'Thao tác ảnh không hỗ trợ'},405);
 }
 if(!resources[resource])return json({error:'Không tìm thấy nội dung'},404);
 const isProfile=resource==='profile';if(id&&!/^\d+$/.test(id))return json({error:'ID không hợp lệ'},400);
 if(req.method==='GET')return json(await query(`SELECT * FROM ${resource} ORDER BY ${isProfile?'id':'sort_order,id'}`));
 if(req.method==='DELETE'){if(isProfile||!id)return json({error:'Không thể xóa hồ sơ'},400);const [result]=await pool().execute(`DELETE FROM ${resource} WHERE id=?`,[id]);if(!(result as {affectedRows:number}).affectedRows)return json({error:'Nội dung không tồn tại'},404);log('content_deleted',{resource,id});return json({ok:true});}
 if(!['POST','PUT'].includes(req.method))return json({error:'Thao tác không hỗ trợ'},405);
 let data:Record<string,string|number>;try{data=validate(resource,await req.json());}catch(e){return json({error:(e as Error).message},400);}
 const keys=Object.keys(data),values=Object.values(data);if(req.method==='POST'&&!isProfile){const [result]=await pool().execute(`INSERT INTO ${resource}(${keys.join(',')}) VALUES(${keys.map(()=>'?').join(',')})`,values);log('content_created',{resource});return json({ok:true,id:(result as {insertId:number}).insertId},201);}
 const rowId=isProfile?1:Number(id);if(!rowId)return json({error:'Thiếu ID'},400);const exists=await query(`SELECT id FROM ${resource} WHERE id=?`,[rowId]);if(!exists.length)return json({error:'Nội dung không tồn tại'},404);await query(`UPDATE ${resource} SET ${keys.map(k=>k+'=?').join(',')} WHERE id=?`,[...values,rowId]);log('content_updated',{resource,id:rowId});return json({ok:true});
}catch(e){const error=e as Error&{code?:string};if(error.code==='ER_DUP_ENTRY')return json({error:'Slug đã tồn tại, vui lòng chọn đường dẫn khác'},409);if(error instanceof SyntaxError)return json({error:'JSON không hợp lệ'},400);log('app_error',{message:error.message.slice(0,160)});return json({error:'Có lỗi xử lý. Vui lòng thử lại hoặc kiểm tra log.'},500);
}finally{const t=telemetry();t.requests.inc({route:resources[resource]?resource:['login','logout','session','password','media','diagnostics'].includes(resource)?resource:'unknown',method:req.method,status:String(status)});t.duration.observe({route:resources[resource]?resource:'auth',method:req.method},(performance.now()-start)/1000);}}
export const GET=handle;export const POST=handle;export const PUT=handle;export const DELETE=handle;
