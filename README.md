# AWAPART 66 PRO — paket pengembangan v1.1

Identitas: **PT AWAPART SUKSES BERSAMA**  
Aplikasi Android: `id.co.awapart66.app`  
Versi Android: `1.1.0`  
Domain target: `awapart66.com`

## Isi paket
- `app/`: aplikasi Android berbasis WebView dengan UI responsif dalam `assets/index.html`.
- `backend/`: starter API Node.js + PostgreSQL, autentikasi admin JWT, upload bukti transfer, booking, dan pengajuan mitra.
- `.github/workflows/android-apk.yml`: workflow build APK debug di GitHub Actions.

## Fitur prototipe UI saat ini
- Beranda, pencarian/katalog apartemen.
- Formulir booking dan estimasi biaya.
- Halaman cek booking berdasarkan nomor WhatsApp (data lokal pada prototipe).
- Form pengajuan kerja sama pemilik properti.
- Dashboard demo untuk melihat booking/mitra dan menambah unit secara lokal.
- Kontak admin WhatsApp dan email.

## Backend starter v1.1
Backend menyediakan API untuk katalog, booking, lookup booking dengan kode+nomor telepon, upload bukti, login admin, CRUD dasar unit (tambah/perbarui), status booking, ringkasan, dan pengajuan mitra. Lihat `backend/API.md`.

**Penting:** UI Android saat ini belum dihubungkan ke backend. UI masih menyimpan data demo di `localStorage`. Dashboard admin UI belum memakai login JWT, katalog belum mengambil data API, dan upload bukti pada UI demo belum mengirim file ke server. Karena itu paket ini belum boleh dipakai menerima reservasi/pembayaran pelanggan secara live.

## Build APK debug melalui GitHub
1. Upload isi folder `AWAPART66-Android` ke repository GitHub (folder `.github/workflows` harus ikut terunggah).
2. Buka tab **Actions** di repository.
3. Pilih workflow **Build AWAPART 66 APK**.
4. Tekan **Run workflow** atau push ke branch `main`.
5. Setelah workflow hijau, buka hasil run dan unduh artifact `AWAPART66-debug-apk`.

APK debug bukan APK rilis Play Store. Untuk rilis, perlu signing key milik perusahaan dan pengujian di perangkat fisik.

## Menjalankan backend
1. Salin `backend/.env.example` menjadi `backend/.env`.
2. Isi `DB_PASSWORD`, `JWT_SECRET` acak yang panjang, `ADMIN_EMAIL`, `ADMIN_PASSWORD` kuat, dan `CORS_ORIGIN` dengan domain HTTPS yang benar.
3. Jalankan `docker compose up -d --build` dari folder `backend` pada VPS yang mendukung Docker.
4. Pasang reverse proxy HTTPS (misalnya Nginx/Caddy) di depan port API.
5. Uji `GET /health`.

Jangan masukkan password, token, OTP, private key, atau keystore ke GitHub maupun chat. Jangan gunakan rekening demo untuk transaksi produksi tanpa verifikasi dan persetujuan pemilik rekening.

## Sebelum operasional
Wajib menyelesaikan integrasi UI↔API, kalender ketersediaan dan pencegahan double-booking, keamanan admin, upload privat, backup, kebijakan privasi, syarat sewa/refund, serta pengujian end-to-end. Pembayaran transfer hanya diverifikasi setelah admin memeriksa mutasi rekening secara langsung.
