# Rencana penyelesaian menuju operasional AWAPART 66

## Sudah ada dalam paket v1.1
- Android WebView wrapper dan UI prototipe.
- Starter API Node.js + PostgreSQL.
- Login admin API berbasis bcrypt/JWT.
- Endpoint katalog, booking, lookup booking dengan dua faktor data (kode + nomor), unggah bukti, status booking, ringkasan, dan pengajuan mitra.
- Workflow GitHub Actions untuk menghasilkan APK debug.

## Belum selesai dan harus dikerjakan sebelum menerima pelanggan
1. Hubungkan UI Android/website ke API HTTPS (saat ini UI masih localStorage/demo).
2. Buat kalender ketersediaan per unit dan transaksi booking atomik untuk mencegah double-booking.
3. Terapkan login JWT pada dashboard admin dan kontrol role.
4. Simpan foto unit dan bukti transfer di object storage privat, bukan URL publik.
5. Tambahkan admin UI untuk mengelola unit, mitra, booking, dan status pembayaran dari API.
6. Tambahkan notifikasi resmi WhatsApp/email dengan persetujuan pengguna.
7. Buat backup database, audit akses, kebijakan privasi, syarat sewa, pembatalan/refund.
8. Uji Android fisik, keamanan, backup/restore, dan alur booking end-to-end.
9. Buat APK signed release menggunakan keystore yang disimpan aman oleh pemilik.

## Informasi deployment yang diperlukan
- VPS bulanan sesuai anggaran dan akses panel/SSH.
- Akses DNS domain `awapart66.com` untuk mengarahkan domain dan subdomain API.
- Email admin dan password awal yang kuat (buat sendiri di server; jangan kirim lewat chat).
- Konfirmasi rekening pembayaran produksi dan persetujuan pemilik rekening.

Jangan menyebut sistem live atau pembayaran lunas sebelum integrasi, deployment, dan verifikasi benar-benar selesai.
