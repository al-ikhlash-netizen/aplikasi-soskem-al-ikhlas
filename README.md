# SOSKEM DKM Jami Al-Ikhlash — PWA FIX V2

Versi ini memperbaiki dua masalah:
1. PWA/ikon/service worker untuk instalasi Android.
2. Restore JSON dengan pemeriksaan jumlah data sebelum mengganti data lokal.

## WAJIB upload seluruh struktur
Jangan hanya mengganti `index.html`. Upload juga folder `assets/` dan file:
- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `assets/icon-192.png`
- `assets/icon-512.png`
- `assets/logomasjid.png`

Jika `assets/` tidak ikut di-upload, logo akan rusak dan Chrome dapat memperlakukan situs hanya sebagai shortcut.

## GitHub Pages
Repository: `main` / `(root)`.

URL aplikasi:
`https://al-ikhlash-netizen.github.io/aplikasi-soskem-al-ikhlas/`

Setelah upload, tunggu deployment selesai lalu buka ulang situs.

## Restore JSON
Aplikasi akan:
- membaca file JSON;
- menghitung data Master KK, Iuran, Santunan, dan Mutasi Kas;
- menolak restore jika 0 data ditemukan;
- menampilkan jumlah data sebelum restore;
- mengecek kembali jumlah data setelah disimpan.

Data aplikasi tetap tersimpan lokal pada perangkat melalui localStorage.
