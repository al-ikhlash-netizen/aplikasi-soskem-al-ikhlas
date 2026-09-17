# SOSKEM DKM Jami Al-Ikhlash — PWA FIX V2.3

Aplikasi PWA administrasi sosial kematian DKM Jami Al-Ikhlash.

## GitHub Pages
- Site: `https://al-ikhlash-netizen.github.io/aplikasi-soskem-al-ikhlas/`
- Source: `main` / root
- Semua URL aplikasi memakai path relatif agar kompatibel dengan project site GitHub Pages.
- Ikon dan logo yang digunakan adalah file PNG di root repository (`icon-192.png`, `icon-512.png`, `logomasjid.png`), sesuai struktur repository aktual.

## Data
Data disimpan lokal pada browser melalui localStorage. Backup mengekspor database lengkap beserta metadata versi dan juga mempertahankan format root lama. Restore mendukung format baru `{data:{...}}`, format lama root, serta beberapa nama field kompatibel; record dan ID tidak direkonstruksi atau diringkas. Restore menolak JSON kosong/tidak valid, meminta konfirmasi, menyimpan, lalu memverifikasi seluruh koleksi.

## PWA
Manifest, service worker, start URL, scope, ikon, dan seluruh asset menggunakan URL relatif. Service worker memakai cache berversi, menghapus cache aplikasi lama, melakukan network-first untuk memperoleh rilis terbaru, dan mengklaim halaman setelah aktivasi.
