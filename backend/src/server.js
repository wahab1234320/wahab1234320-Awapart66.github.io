import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import 'dotenv/config';

const { Pool } = pg;
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: true } : undefined });
const uploadDir = process.env.UPLOAD_DIR || './uploads';
fs.mkdirSync(uploadDir, { recursive: true });
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || false }));
app.use(express.json({ limit: '200kb' }));
app.use(rateLimit({ windowMs: 15*60*1000, limit: 180 }));
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req,_file,cb)=>cb(null,uploadDir),
    filename: (_req,file,cb)=>cb(null,crypto.randomUUID()+path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 5*1024*1024, files: 1 },
  fileFilter: (_req,file,cb)=>cb(null, ['image/jpeg','image/png','image/webp','application/pdf'].includes(file.mimetype))
});

async function init(){
 await pool.query(`
 CREATE TABLE IF NOT EXISTS admins(id SERIAL PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,created_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE IF NOT EXISTS units(id SERIAL PRIMARY KEY,name TEXT NOT NULL,location TEXT NOT NULL,description TEXT DEFAULT '',price_daily BIGINT NOT NULL CHECK(price_daily>=0),active BOOLEAN DEFAULT true,created_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE IF NOT EXISTS bookings(id TEXT PRIMARY KEY,customer_name TEXT NOT NULL,phone TEXT NOT NULL,unit_id INT REFERENCES units(id),check_in DATE NOT NULL,days INT NOT NULL CHECK(days BETWEEN 1 AND 90),total BIGINT NOT NULL,status TEXT NOT NULL DEFAULT 'MENUNGGU_TRANSFER',proof_file TEXT,created_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE IF NOT EXISTS partners(id SERIAL PRIMARY KEY,owner_name TEXT NOT NULL,phone TEXT NOT NULL,property_name TEXT NOT NULL,property_type TEXT NOT NULL DEFAULT 'Apartemen',cooperation_type TEXT NOT NULL DEFAULT 'Pengelolaan sewa',status TEXT NOT NULL DEFAULT 'BARU',created_at TIMESTAMPTZ DEFAULT now());
 CREATE TABLE IF NOT EXISTS audit_logs(id BIGSERIAL PRIMARY KEY,admin_email TEXT,action TEXT,booking_id TEXT,created_at TIMESTAMPTZ DEFAULT now());
 `);
 const email=process.env.ADMIN_EMAIL, password=process.env.ADMIN_PASSWORD;
 if(email && password && password!=='CHANGE_THIS_BEFORE_DEPLOY'){
   const hash=await bcrypt.hash(password,12);
   await pool.query('INSERT INTO admins(email,password_hash) VALUES($1,$2) ON CONFLICT(email) DO NOTHING',[email,hash]);
 }
}
function auth(req,res,next){
 try{const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');req.admin=jwt.verify(token,process.env.JWT_SECRET);next();}
 catch{res.status(401).json({error:'Autentikasi diperlukan'});}
}
const asyncRoute=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
app.get('/health',(_req,res)=>res.json({ok:true,service:'AWAPART 66 API'}));
app.post('/api/admin/login',rateLimit({windowMs:15*60*1000,limit:8}),asyncRoute(async(req,res)=>{
 const {email,password}=req.body||{};
 const q=await pool.query('SELECT * FROM admins WHERE email=$1',[email||'']);
 if(!q.rowCount || !await bcrypt.compare(password||'',q.rows[0].password_hash)) return res.status(401).json({error:'Email atau password salah'});
 const token=jwt.sign({email:q.rows[0].email,role:'admin'},process.env.JWT_SECRET,{expiresIn:'8h'});
 res.json({token,expiresIn:28800});
}));
app.get('/api/units',asyncRoute(async(_req,res)=>{
 const q=await pool.query('SELECT id,name,location,description,price_daily FROM units WHERE active=true ORDER BY id');
 res.json(q.rows);
}));
app.post('/api/partners',asyncRoute(async(req,res)=>{
 const {owner_name,phone,property_name,property_type='Apartemen',cooperation_type='Pengelolaan sewa'}=req.body||{};
 if(!owner_name?.trim()||!/^\+?[0-9]{8,16}$/.test(String(phone||'').replace(/[\s-]/g,''))||!property_name?.trim()) return res.status(400).json({error:'Data pengajuan kerja sama tidak valid'});
 const q=await pool.query('INSERT INTO partners(owner_name,phone,property_name,property_type,cooperation_type) VALUES($1,$2,$3,$4,$5) RETURNING id,status,created_at',[owner_name.trim(),String(phone).replace(/[\s-]/g,''),property_name.trim(),property_type,cooperation_type]);
 res.status(201).json(q.rows[0]);
}));
app.get('/api/admin/partners',auth,asyncRoute(async(_req,res)=>{
 const q=await pool.query('SELECT id,owner_name,phone,property_name,property_type,cooperation_type,status,created_at FROM partners ORDER BY created_at DESC');res.json(q.rows);
}));
app.patch('/api/admin/partners/:id/status',auth,asyncRoute(async(req,res)=>{
 const allowed=['BARU','DIHUBUNGI','DISETUJUI','DITOLAK'];if(!allowed.includes(req.body?.status))return res.status(400).json({error:'Status tidak valid'});
 const q=await pool.query('UPDATE partners SET status=$1 WHERE id=$2 RETURNING id,status',[req.body.status,req.params.id]);if(!q.rowCount)return res.status(404).json({error:'Pengajuan tidak ditemukan'});res.json(q.rows[0]);
}));
app.get('/api/bookings/lookup',asyncRoute(async(req,res)=>{
 const phone=String(req.query.phone||'').replace(/[\s-]/g,'');const id=String(req.query.id||'');
 if(!/^\+?[0-9]{8,16}$/.test(phone)||!id) return res.status(400).json({error:'Nomor WhatsApp dan kode booking wajib diisi'});
 const q=await pool.query(`SELECT b.id,b.check_in,b.days,b.total,b.status,u.name AS unit_name FROM bookings b JOIN units u ON u.id=b.unit_id WHERE b.id=$1 AND b.phone=$2`,[id,phone]);
 if(!q.rowCount)return res.status(404).json({error:'Booking tidak ditemukan'});res.json(q.rows[0]);
}));
app.post('/api/admin/units',auth,asyncRoute(async(req,res)=>{
 const {name,location,description='',price_daily}=req.body||{};
 if(!name||!location||!Number.isSafeInteger(Number(price_daily))||Number(price_daily)<0) return res.status(400).json({error:'Data unit tidak valid'});
 const q=await pool.query('INSERT INTO units(name,location,description,price_daily) VALUES($1,$2,$3,$4) RETURNING *',[name,location,description,price_daily]);
 res.status(201).json(q.rows[0]);
}));
app.patch('/api/admin/units/:id',auth,asyncRoute(async(req,res)=>{
 const {name,location,description='',price_daily,active=true}=req.body||{};
 if(!name?.trim()||!location?.trim()||!Number.isSafeInteger(Number(price_daily))||Number(price_daily)<0)return res.status(400).json({error:'Data unit tidak valid'});
 const q=await pool.query('UPDATE units SET name=$1,location=$2,description=$3,price_daily=$4,active=$5 WHERE id=$6 RETURNING *',[name.trim(),location.trim(),description,price_daily,!!active,req.params.id]);
 if(!q.rowCount)return res.status(404).json({error:'Unit tidak ditemukan'});res.json(q.rows[0]);
}));
app.post('/api/bookings',asyncRoute(async(req,res)=>{
 const {customer_name,phone,unit_id,check_in,days}=req.body||{};
 if(!customer_name||!phone||!unit_id||!/^\\d{4}-\\d{2}-\\d{2}$/.test(check_in||'')||!Number.isInteger(Number(days))||days<1||days>90) return res.status(400).json({error:'Data booking tidak valid'});
 const client=await pool.connect();
 try{
  await client.query('BEGIN');
  const u=await client.query('SELECT * FROM units WHERE id=$1 AND active=true FOR UPDATE',[unit_id]);
  if(!u.rowCount){await client.query('ROLLBACK');return res.status(404).json({error:'Unit tidak ditemukan'});}
  const total=Number(u.rows[0].price_daily)*Number(days);
  if(!Number.isSafeInteger(total)){await client.query('ROLLBACK');return res.status(400).json({error:'Total di luar batas'});}
  const id='AW66-'+crypto.randomBytes(4).toString('hex').toUpperCase();
  const b=await client.query('INSERT INTO bookings(id,customer_name,phone,unit_id,check_in,days,total) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,total,status',[id,customer_name,phone,unit_id,check_in,days,total]);
  await client.query('COMMIT');res.status(201).json({...b.rows[0],bank:'BCA',account_number:'6037152805',account_name:'Abdul Wahhab'});
 }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}));
app.post('/api/bookings/:id/proof',upload.single('proof'),asyncRoute(async(req,res)=>{
 if(!req.file)return res.status(400).json({error:'Lampirkan JPG, PNG, WEBP, atau PDF maksimal 5 MB'});
 const q=await pool.query("UPDATE bookings SET proof_file=$1,status='MENUNGGU_VERIFIKASI' WHERE id=$2 AND status IN ('MENUNGGU_TRANSFER','MENUNGGU_VERIFIKASI') RETURNING id,status",[req.file.filename,req.params.id]);
 if(!q.rowCount){fs.unlinkSync(req.file.path);return res.status(404).json({error:'Booking tidak ditemukan atau tidak dapat diubah'});}
 res.json(q.rows[0]);
}));
app.get('/api/admin/bookings',auth,asyncRoute(async(_req,res)=>{
 const q=await pool.query(`SELECT b.id,b.customer_name,b.phone,b.check_in,b.days,b.total,b.status,b.proof_file,u.name AS unit_name FROM bookings b JOIN units u ON u.id=b.unit_id ORDER BY b.created_at DESC`);
 res.json(q.rows);
}));
app.patch('/api/admin/bookings/:id/status',auth,asyncRoute(async(req,res)=>{
 const allowed=['PEMBAYARAN_DIVERIFIKASI','DITOLAK','DIBATALKAN'];
 if(!allowed.includes(req.body?.status))return res.status(400).json({error:'Status tidak valid'});
 const q=await pool.query('UPDATE bookings SET status=$1 WHERE id=$2 RETURNING id,status',[req.body.status,req.params.id]);
 if(!q.rowCount)return res.status(404).json({error:'Booking tidak ditemukan'});
 await pool.query('INSERT INTO audit_logs(admin_email,action,booking_id) VALUES($1,$2,$3)',[req.admin.email,req.body.status,req.params.id]);
 res.json(q.rows[0]);
}));
app.get('/api/admin/summary',auth,asyncRoute(async(_req,res)=>{
 const q=await pool.query(`SELECT COUNT(*)::int AS bookings,COALESCE(SUM(total) FILTER(WHERE status='PEMBAYARAN_DIVERIFIKASI'),0)::bigint AS verified_revenue FROM bookings`);
 res.json(q.rows[0]);
}));
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:'Terjadi kesalahan server'});});
const port=Number(process.env.PORT||8080);
init().then(()=>app.listen(port,'0.0.0.0',()=>console.log(`AWAPART 66 API listening on ${port}`))).catch(e=>{console.error(e);process.exit(1);});
