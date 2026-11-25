# Build APK AWAPART 66 dari HP Android

Proyek ini disiapkan untuk dibangun di cloud menggunakan GitHub Actions. Workflow berada di `.github/workflows/android-apk.yml`.

## Ringkasan
- Workflow membangun APK debug saat ada push ke branch `main` atau dijalankan manual.
- File hasil: `app/build/outputs/apk/debug/app-debug.apk`.
- APK debug untuk uji coba, bukan rilis produksi yang ditandatangani.
- Workflow menggunakan Gradle 8.9, Java 17, Android SDK 35.

## Sebelum build
Buat repositori GitHub milik perusahaan, lalu unggah **isi** folder `AWAPART66-Android` ke akar repositori (jangan membuat folder `AWAPART66-Android` bersarang). Pastikan folder `.github/workflows` ikut terunggah. Setelah branch `main` berisi source, buka tab Actions dan jalankan workflow `Build AWAPART 66 APK`.

## Mengambil APK
Pada hasil workflow yang sukses, buka ringkasan run lalu unduh artifact `AWAPART66-debug-apk`. Ekstrak ZIP artifact dan pasang APK untuk pengujian pada perangkat Android.

## Catatan penting
Build yang berhasil hanya membuktikan APK dapat dikompilasi. Backend belum dipasang di server dan beberapa fitur produksi masih perlu dilengkapi serta diuji. Jangan gunakan untuk transaksi pelanggan sungguhan sebelum keamanan, autentikasi, konflik jadwal, verifikasi pembayaran, privasi, dan backup diselesaikan.
