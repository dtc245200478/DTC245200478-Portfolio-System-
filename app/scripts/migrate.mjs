import mysql from 'mysql2/promise';
import {readFileSync} from 'node:fs';import {scryptSync,randomBytes} from 'node:crypto';
const pass=n=>readFileSync(process.env[n+'_FILE'],'utf8').trim();
let db;for(let attempt=0;attempt<60;attempt++){try{db=await mysql.createConnection({host:process.env.DB_HOST||'mysql',user:'linkme_migrate',password:pass('DB_PASSWORD'),database:'linkme',multipleStatements:true});break;}catch(e){if(attempt===59)throw e;await new Promise(r=>setTimeout(r,1000));}}
await db.query(readFileSync(new URL('../db/schema.sql',import.meta.url),'utf8'));
const [a]=await db.query('SELECT id FROM admins WHERE username=?',['admin']);
if(!a.length){const salt=randomBytes(16).toString('hex'),p=pass('ADMIN_PASSWORD');await db.execute('INSERT INTO admins(username,password_hash) VALUES(?,?)',['admin',salt+':'+scryptSync(p,salt,64).toString('hex')]);}
await db.execute("INSERT IGNORE INTO profile VALUES(1,?,?,?,?,?,?,?)",['Trần Trung Dũng','Sinh viên Công nghệ thông tin','Tôi là Trần Trung Dũng, sinh viên lớp CNTT K23D. Link Me là không gian giới thiệu bản thân và các sản phẩm thực hành. Nội dung kỹ năng, kinh nghiệm và dự án dưới đây là dữ liệu minh họa cho bài tập.', 'dtc245200478@ictu.edu.vn','Việt Nam','/avatar.svg','Cùng trao đổi về một ý tưởng mới']);
const [seeded]=await db.query("SELECT version FROM schema_migrations WHERE version='001-seed'");
if(!seeded.length){await db.beginTransaction();try{
for(const x of [['React & Next.js','Phát triển web',80],['TypeScript','Ngôn ngữ',75],['MySQL','Dữ liệu',75],['Docker & Nginx','Triển khai',80],['Prometheus & Grafana','Vận hành',70],['Git & GitHub','Công cụ',85]]) await db.execute('INSERT INTO skills(name,category,level) VALUES(?,?,?)',x);
await db.execute('INSERT INTO education(title,organization,period,description) VALUES(?,?,?,?)',['Công nghệ thông tin','Lớp CNTT K23D','Khóa K23','MSSV dtc245200478. Thông tin trường được cập nhật bởi quản trị viên.']);
await db.execute('INSERT INTO experience(title,organization,period,description) VALUES(?,?,?,?)',['Thực hành triển khai hệ thống','Dự án học phần — minh họa','2026','Đóng gói website với Docker, theo dõi số liệu và truy vấn log tập trung.']);
const projects=[['link-me','Link Me','Một không gian cá nhân, được xây dựng để kết nối.','Portfolio có quản trị nội dung, cơ sở dữ liệu MySQL và hệ thống giám sát đầy đủ. Đây là dự án bài thực hành đề 13.','Next.js, TypeScript, MySQL, Docker','/projects/link-me.svg','https://github.com/dtc245200478/DTC245200478-Portfolio-System-','',1,1],['study-board','Study Board','Sắp xếp việc học, từng bước rõ ràng hơn.','Dữ liệu minh họa: ý tưởng bảng công việc cá nhân phục vụ việc trình bày portfolio. Không mô tả sản phẩm đã triển khai.','React, TypeScript, UI Design','/projects/study-board.svg','','',1,2],['data-notes','Data Notes','Biến những ghi chú thành điều dễ tìm thấy.','Dữ liệu minh họa: ý tưởng ứng dụng ghi chú và phân loại thông tin, dùng để minh họa trang dự án.','MySQL, Node.js, REST API','/projects/data-notes.svg','','',1,3]];
for(const p of projects) await db.execute('INSERT INTO projects(slug,title,summary,description,technologies,image_url,github_url,demo_url,published,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?)',p);
await db.execute('INSERT INTO social_links(label,url) VALUES(?,?)',['GitHub','https://github.com/dtc245200478']);
await db.execute("INSERT INTO schema_migrations(version) VALUES('001-seed')");await db.commit();}catch(e){await db.rollback();throw e;}}
console.log('Migration 001 và seed hoàn tất; dữ liệu và mật khẩu cũ được giữ nguyên.');await db.end();
