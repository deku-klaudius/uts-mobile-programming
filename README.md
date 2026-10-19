# UTS Mobile Programming - Sistem Login & Register (React Native + Expo + Supabase)

Tugas Ujian Tengah Semester (UTS) Tahun Ajaran 2026/2027  
**Lembaga Pendidikan dan Pengembangan Profesi Indonesia (LP3I)**  
**Mata Kuliah:** Mobile Programming  
**Dosen Pengampu:** Sata Lesmana, M.Kom.  

---

## 👨‍🎓 Identitas Mahasiswa
* **Nama Lengkap:** Klaudius Oe Naimnou
* **NIM:** 240444020010
* **Kelas:** Informatika Komputer (IK-24)
* **Semester / SKS:** I / 4 SKS
* **Pilihan UI Desain:** **Style 6** (Tercatat di Spreadsheet & Figma)
* **Akun GitHub:** dekuizuku811@gmail.com / [deku-klaudius](https://github.com/deku-klaudius)

---

## 📱 Daftar Halaman / Screen Aplikasi (Sesuai Ketentuan Soal)

1. **Welcome Page / Splash Screen (`src/app/index.tsx`)**
   * Menampilkan ilustrasi sambutan (Gadis mengendarai vespa mint).
   * Kartu identitas mahasiswa (Nama, NIM, Kelas, Mata Kuliah, Dosen).
   * Tombol navigasi menuju **Login** dan **Register**.
   * Pengecekan otomatis sesi aktif (bisa langsung masuk dashboard jika sudah login).

2. **Login Page (`src/app/login.tsx`) - Sesuai Figma Style 6**
   * Ilustrasi dua pebisnis berjabat tangan dalam card rounded.
   * Input Email & Input Password dengan tombol toggle tampil/sembunyikan password (👁).
   * Tombol "Lupa password?".
   * Tombol utama **MASUK** warna biru (`#2B92E4`) dengan indikator loading.
   * Pemisah *"Atau masuk menggunakan"*.
   * Tombol login sosial media (Google & Facebook).
   * Tautan pendaftaran *"Belum punya akun? Mendaftar sekarang"*.

3. **Register Page (`src/app/register.tsx`) - Sesuai Figma Style 6**
   * Ilustrasi gadis bersandar di vespa merah.
   * Input form lengkap:
     * Nama Lengkap
     * Email
     * Nomor HP
     * Password (dengan eye toggle)
     * Konfirmasi Password (dengan eye toggle)
   * Validasi form lengkap (format email, panjang password min. 6 karakter, kecocokan password).
   * Tombol utama **MENDAFTAR** warna biru.
   * Pemisah *"Atau daftar menggunakan"*.
   * Tombol sosial Google & Facebook.
   * Tautan *"Sudah punya akun? silahkan masuk"*.

4. **Success / Verification Notice Page (`src/app/success.tsx`) - Layar Kiri Figma Style 6**
   * Ilustrasi vespa mint.
   * Judul: **SELAMAT! ANDA SUDAH BERHASIL MENDAFTAR**.
   * Teks: *"Silahkan periksa email anda untuk melakukan verifikasi sebelum melakukan Login."*
   * Rincian data akun yang baru saja didaftarkan.
   * Tombol **LANJUTKAN** menuju halaman login.

5. **Main Page / Dashboard (`src/app/dashboard.tsx`) - Sesuai Ketentuan Soal UTS**
   * Header sapaan personal: *"Halo, [Nama Pengguna]! 👋"*.
   * **Informasi Lengkap Nama dan Kelas Mahasiswa**:
     * Nama: Klaudius Oe Naimnou
     * NIM: 240444020010
     * Kelas: Informatika Komputer (IK-24)
     * Dosen: Sata Lesmana, M.Kom.
   * Status Koneksi Database (Supabase Cloud / Local Offline Fallback Mode).
   * Ringkasan Akademik (Beban SKS, Waktu Ujian, Status Tugas).
   * Jadwal Kuliah Hari Ini.
   * **Fitur Interaktif Catatan Cepat (Quick Notes)**: Mahasiswa dapat menambah, melihat, dan menghapus catatan (tersimpan permanen di `AsyncStorage`).
   * Tombol **Keluar / Logout Akun** dengan dialog konfirmasi.

---

## 🛠️ Arsitektur & Teknologi

* **Framework:** React Native + Expo (Expo Router v57)
* **Language:** TypeScript
* **State & Storage:**
  * `@supabase/supabase-js` (Autentikasi Cloud & Database).
  * `@react-native-async-storage/async-storage` (Penyimpanan Sesi & Offline Fallback).
* **Fail-Safe Mechanism:**
  * Aplikasi dirancang tahan gangguan jaringan/DNS. Jika kredensial Supabase aktif, otentikasi diarahkan ke Supabase Cloud. Jika offline atau proyek Supabase terhenti, aplikasi otomatis beralih ke cache lokal tanpa error atau force close.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Jalankan di Web Browser (Rekomendasi Cepat & Stabil):
```bash
npx expo start --web
```
Buka browser di `http://localhost:8081`.

### 2. Jalankan di Expo Go (HP Android / iOS):
```bash
npx expo start
```
Scan QR code yang muncul menggunakan aplikasi **Expo Go**.

---

## 🔐 Konfigurasi Supabase (`.env`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

*Dibuat oleh Klaudius Oe Naimnou (240444020010) untuk Ujian Tengah Semester (UTS) Mobile Programming 2026/2027.*
