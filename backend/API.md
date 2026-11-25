# AWAPART 66 API — endpoint starter v1.1

Base URL contoh: `https://api.awapart66.com`

## Publik
- `GET /health` — status API.
- `GET /api/units` — katalog unit aktif.
- `POST /api/bookings` — buat permintaan booking. Body: `customer_name`, `phone`, `unit_id`, `check_in` (`YYYY-MM-DD`), `days` (1–90). Respons memuat kode booking dan instruksi transfer.
- `GET /api/bookings/lookup?phone=...&id=...` — cek satu booking dengan kombinasi nomor WhatsApp dan kode booking.
- `POST /api/bookings/:id/proof` — unggah bukti JPG/PNG/WEBP/PDF maksimal 5 MB, multipart field `proof`.
- `POST /api/partners` — ajukan kerja sama. Body: `owner_name`, `phone`, `property_name`, `property_type`, `cooperation_type`.

## Admin (header `Authorization: Bearer <token>`)
- `POST /api/admin/login` — login email/password; token berlaku 8 jam.
- `POST /api/admin/units` — tambah unit.
- `PATCH /api/admin/units/:id` — ubah data dan status aktif unit.
- `GET /api/admin/bookings` — daftar booking.
- `PATCH /api/admin/bookings/:id/status` — `PEMBAYARAN_DIVERIFIKASI`, `DITOLAK`, atau `DIBATALKAN`.
- `GET /api/admin/summary` — ringkasan booking dan pendapatan terverifikasi.
- `GET /api/admin/partners` — daftar pengajuan mitra.
- `PATCH /api/admin/partners/:id/status` — `BARU`, `DIHUBUNGI`, `DISETUJUI`, atau `DITOLAK`.

## Batasan versi ini
Ini adalah backend starter, bukan layanan yang sudah live. Belum ada kalender ketersediaan/anti-double-booking, pembayaran gateway, notifikasi WhatsApp, manajemen foto unit, alur lupa password, maupun UI admin yang terhubung ke API. Upload bukti belum menjadi verifikasi pembayaran. Admin harus mencocokkan mutasi rekening secara manual. Endpoint lookup mensyaratkan kode booking dan nomor WhatsApp; tetap gunakan HTTPS dan batasi log akses.
