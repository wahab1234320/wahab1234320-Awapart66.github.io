# AWAPART 66 — Panduan dari HP Android

Paket ini adalah source code untuk membuat APK melalui cloud. Paket ini **belum berisi APK siap instal**.

## A. Unggah source ke GitHub
1. Minta pemilik/perwakilan perusahaan yang berwenang membuat atau menggunakan akun GitHub.
2. Buat repository baru bernama `awapart66-android`.
3. Ekstrak ZIP ini di HP menggunakan aplikasi pengelola arsip.
4. Buka folder `AWAPART66-Android` dan unggah **seluruh isi foldernya** ke root repository, termasuk folder tersembunyi `.github/workflows`.
5. Pastikan file `settings.gradle`, `build.gradle`, folder `app`, `backend`, dan `.github` terlihat di root repository.

## B. Jalankan build APK
1. Di repository GitHub, buka tab **Actions**.
2. Pilih workflow **Build AWAPART 66 APK**.
3. Tekan **Run workflow** pada branch `main`.
4. Tunggu sampai proses berstatus hijau / Success.
5. Buka hasil proses tersebut, cari bagian **Artifacts**, lalu unduh `AWAPART66-debug-apk`.
6. Ekstrak ZIP artifact dan file `app-debug.apk` akan terlihat.

Jika tab Actions tidak terlihat, pastikan Actions diaktifkan pada repository. Jika build gagal, buka log langkah yang merah dan bagikan pesan error-nya (jangan bagikan token, password, atau secret).

## C. Instalasi dan batasan
- APK debug hanya untuk uji coba internal.
- Saat Android meminta izin instalasi dari sumber tersebut, minta bantuan orang dewasa/pengelola perangkat untuk memeriksa sumber file dan mengatur izin dengan aman.
- Jangan bagikan APK ke pelanggan sebelum diuji.
- Backend belum dideploy. Integrasi API, autentikasi pelanggan, pengecekan bentrok jadwal, verifikasi pembayaran, akses bukti transfer, kebijakan privasi, dan pengamanan produksi masih perlu diselesaikan.
- Jangan unggah file `.env` asli, password, token, OTP, atau signing keystore ke repository.

## D. Bantuan
Kontak admin AWAPART untuk kebutuhan bisnis: 085785402106 / awapartsukses@gmail.com.
