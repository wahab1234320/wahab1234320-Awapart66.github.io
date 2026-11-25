# AWAPART 66 API (starter backend)

Backend REST awal: PostgreSQL, admin JWT login, katalog unit, booking, unggah bukti transfer, verifikasi admin, ringkasan transaksi.

## Menjalankan di VPS
1. Salin `.env.example` menjadi `.env`.
2. Isi `DB_PASSWORD`, `JWT_SECRET` (acak panjang), `ADMIN_PASSWORD` kuat, `CORS_ORIGIN` domain HTTPS.
3. Tambahkan `DB_PASSWORD=...` ke `.env` (dipakai docker-compose).
4. Jalankan `docker compose up -d --build`.
5. Pasang reverse proxy HTTPS (Caddy/Nginx) di depan port lokal 8080.
6. Seed unit awal melalui `POST /api/admin/units` setelah login.

## Catatan sebelum produksi
- Endpoint upload saat ini menyimpan berkas ke volume privat; tambahkan endpoint admin untuk melihat bukti secara terautentikasi sebelum operasional.
- Perlu uji tanggal bentrok/ketersediaan unit dan alur pembatalan/refund.
- Tambahkan verifikasi nomor telepon, kebijakan privasi, rate-limit lanjutan, backup terenkripsi, monitoring, dan audit keamanan.
- Status pembayaran hanya boleh diubah admin setelah cek mutasi rekening BCA secara independen.
- Jangan mengekspos port database; gunakan HTTPS, firewall, secret yang kuat, dan backup.
