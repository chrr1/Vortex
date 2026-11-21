# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# PERSONAL FINANCE ASSISTANT

**Versi:** 1.0  
**Status:** Draft  
**Platform:** Web Application / Progressive Web App (PWA)  
**Target Perangkat:** Mobile-first, Android, dan Desktop  
**Deployment:** Vercel

---

# 1. PRODUCT OVERVIEW

## 1.1 Deskripsi Produk

Personal Finance Assistant adalah aplikasi pengelolaan keuangan pribadi yang menggabungkan pencatatan keuangan konvensional dengan kemampuan Artificial Intelligence (AI).

Aplikasi memungkinkan pengguna mengelola pemasukan, pengeluaran, anggaran, dan target keuangan melalui tiga metode input:

1. Manual Input — mencatat transaksi melalui formulir.
2. AI Chat Input — mencatat transaksi menggunakan perintah teks bahasa sehari-hari.
3. Voice Input — mencatat transaksi menggunakan perintah suara.

Selain pencatatan, AI berfungsi sebagai asisten keuangan yang mampu memahami kondisi keuangan pengguna berdasarkan data transaksi aktual.

Aplikasi dirancang sebagai PWA agar dapat diakses melalui browser maupun dipasang ke layar utama perangkat Android.

## 1.2 Product Vision

Membangun asisten keuangan pribadi yang mempermudah pengguna memahami, mencatat, dan mengelola kondisi keuangan tanpa harus melakukan pencatatan secara manual setiap saat.

## 1.3 Problem Statement

Pengelolaan keuangan pribadi sering menghadapi beberapa permasalahan:

- Pengguna malas mencatat transaksi karena prosesnya terlalu panjang.
- Pengguna kesulitan mengetahui ke mana uang mereka digunakan.
- Pencatatan keuangan membutuhkan konsistensi.
- Aplikasi pencatat keuangan konvensional kurang fleksibel dalam menerima input.
- Pengguna kesulitan menganalisis kondisi keuangan berdasarkan riwayat transaksi.

## 1.4 Proposed Solution

Menghadirkan satu aplikasi dengan sistem pencatatan fleksibel dan asisten AI.

Pengguna dapat mencatat transaksi secara manual, mengetik perintah, atau berbicara.

AI membantu memahami transaksi dan menganalisis keuangan, sementara seluruh perhitungan finansial tetap dilakukan oleh sistem backend.

---

# 2. TARGET USERS

## 2.1 Target Pengguna

Aplikasi ditujukan untuk:

- Mahasiswa.
- Pekerja dan karyawan.
- Freelancer.
- Pengguna yang ingin mengelola keuangan pribadi.
- Pengguna yang membutuhkan pencatatan keuangan sederhana.

## 2.2 User Needs

Pengguna membutuhkan:

- Pencatatan transaksi yang cepat.
- Informasi saldo secara aktual.
- Riwayat pemasukan dan pengeluaran.
- Analisis penggunaan uang.
- Pengelolaan anggaran.
- Asisten yang dapat menjawab pertanyaan mengenai keuangan pribadi.

---

# 3. CORE PRODUCT FEATURES

## 3.1 Authentication

Sistem autentikasi untuk mengelola akun dan memisahkan data setiap pengguna.

Fitur:
- Register.
- Login.
- Logout.
- Forgot password.
- Reset password.
- Session management.
- User profile.

Ketentuan:
- Pengguna harus login untuk mengakses data keuangan.
- Setiap pengguna hanya dapat mengakses data miliknya.
- Autentikasi menggunakan Supabase Auth.

## 3.2 Dashboard

Dashboard merupakan halaman utama yang menampilkan kondisi keuangan pengguna.

Informasi yang ditampilkan:

**Financial Overview**
- Total saldo.
- Total pemasukan bulan berjalan.
- Total pengeluaran bulan berjalan.
- Selisih pemasukan dan pengeluaran.

**Financial Charts**
- Grafik pemasukan dan pengeluaran.
- Grafik pengeluaran berdasarkan kategori.
- Tren keuangan bulanan.

**Recent Transactions**
- Daftar transaksi terbaru.
- Jenis transaksi.
- Nominal.
- Kategori.
- Tanggal transaksi.

**Budget Overview**
- Total anggaran.
- Anggaran yang sudah digunakan.
- Sisa anggaran.
- Persentase penggunaan anggaran.

**AI Financial Summary**
- Ringkasan kondisi keuangan.
- Informasi pengeluaran terbesar.
- Insight singkat berdasarkan data aktual.

Dashboard harus menampilkan kondisi keuangan berdasarkan periode yang dapat dipilih.

## 3.3 Transaction Management

Fitur untuk mengelola seluruh pemasukan dan pengeluaran.

### A. Manual Input

Pengguna dapat menambahkan transaksi melalui formulir.

Field transaksi:
- Transaction Type: Income / Expense.
- Amount.
- Category.
- Description.
- Date.
- Wallet.
- Payment Method (opsional).
- Notes (opsional).

Validasi:
- Nominal harus lebih besar dari nol.
- Jenis transaksi wajib dipilih.
- Kategori harus valid.
- Tanggal transaksi harus valid.
- Pengguna harus memiliki akses terhadap dompet yang dipilih.

### B. AI Chat Input

Pengguna dapat mencatat transaksi menggunakan bahasa sehari-hari.

Contoh:

"Hari ini saya beli makan 20 ribu, bensin 25 ribu, dan dapat uang freelance 500 ribu."

AI mengidentifikasi:
- Jenis transaksi.
- Nominal.
- Kategori.
- Deskripsi.
- Tanggal jika disebutkan.

Hasil ekstraksi ditampilkan dalam bentuk daftar transaksi yang dapat diperiksa pengguna.

Pengguna dapat:
- Mengonfirmasi seluruh transaksi.
- Mengedit transaksi tertentu.
- Menghapus transaksi tertentu dari hasil ekstraksi.
- Membatalkan proses.

Transaksi hanya disimpan setelah pengguna memberikan konfirmasi.

### C. Voice Input

Pengguna dapat mencatat transaksi menggunakan suara.

Alur:
1. Pengguna menekan tombol mikrofon.
2. Browser meminta izin mikrofon.
3. Pengguna berbicara.
4. Sistem mengubah suara menjadi teks.
5. Teks dikirim ke AI.
6. AI mengekstrak informasi transaksi.
7. Sistem menampilkan hasil ekstraksi.
8. Pengguna mengonfirmasi transaksi.
9. Backend menyimpan transaksi.

Contoh:

"Tadi saya beli kopi dua puluh ribu, kemudian makan siang lima belas ribu."

Catatan teknis:
- Menggunakan Web Speech API sebagai pendekatan awal.
- Menyediakan fallback berupa input teks jika browser tidak mendukung speech recognition.
- Tidak menyimpan rekaman suara secara permanen pada MVP.

### D. Transaction History

Fitur:
- Melihat seluruh transaksi.
- Pencarian transaksi.
- Filter berdasarkan tanggal.
- Filter berdasarkan kategori.
- Filter berdasarkan tipe transaksi.
- Filter berdasarkan dompet.
- Mengedit transaksi.
- Menghapus transaksi.
- Melihat detail transaksi.

---

# 4. AI FINANCIAL ASSISTANT

Fitur utama yang membedakan aplikasi ini dari aplikasi pencatat keuangan biasa.

AI dapat memahami pertanyaan pengguna dan menjalankan tindakan berdasarkan instruksi.

## 4.1 AI Conversation

Pengguna dapat berinteraksi dengan AI melalui percakapan.

Contoh pertanyaan:

- Berapa pengeluaran saya bulan ini?
- Apa kategori pengeluaran terbesar?
- Berapa total pemasukan saya?
- Bandingkan pengeluaran bulan ini dengan bulan lalu.
- Apakah pengeluaran saya meningkat?
- Berapa saldo seluruh dompet saya?

AI harus memberikan jawaban berdasarkan data aktual dari database.

## 4.2 AI Actions

AI dapat membantu menjalankan tindakan berikut:

- Membuat transaksi.
- Mengubah transaksi.
- Menghapus transaksi.
- Membuat anggaran.
- Mengubah anggaran.
- Membuat target keuangan.
- Menghasilkan ringkasan keuangan.

Tindakan yang mengubah data harus mendapatkan konfirmasi pengguna sebelum dieksekusi.

## 4.3 AI Financial Insights

AI menganalisis data keuangan untuk memberikan informasi yang berguna.

Contoh:

"Pengeluaran makanan kamu bulan ini mencapai Rp450.000. Angka tersebut lebih tinggi dibandingkan bulan sebelumnya."

Insight dapat mencakup:
- Kategori pengeluaran terbesar.
- Perubahan pola pengeluaran.
- Peningkatan atau penurunan pengeluaran.
- Potensi pengeluaran berlebihan.
- Rekomendasi pengelolaan anggaran.

AI tidak boleh membuat kesimpulan berdasarkan data yang tidak tersedia.

## 4.4 AI Architecture

AI menggunakan Gemini API melalui backend Next.js.

Alur:

User Input
→ Next.js Backend
→ Gemini API
→ Structured Response
→ Zod Validation
→ User Confirmation
→ Backend Execution
→ Supabase Database

Ketentuan:
- API Key hanya disimpan di server.
- AI tidak memiliki akses langsung ke database.
- Backend menjadi penghubung antara AI dan database.
- AI tidak menentukan saldo secara mandiri.
- Perhitungan keuangan dilakukan oleh backend atau query database.
- Hasil AI harus divalidasi sebelum digunakan.

## 4.5 AI Provider Abstraction

Arsitektur AI dibuat agar tidak terikat pada satu provider.

Provider awal:
- Google Gemini API.

Provider alternatif untuk pengembangan berikutnya:
- Groq.
- OpenRouter.

Pergantian provider tidak boleh mengharuskan perubahan besar pada business logic aplikasi.

---

# 5. BUDGET MANAGEMENT

Fitur pengelolaan batas pengeluaran.

Fitur:
- Membuat anggaran bulanan.
- Menentukan kategori anggaran.
- Menentukan nominal anggaran.
- Melihat jumlah yang sudah digunakan.
- Melihat sisa anggaran.
- Mengedit anggaran.
- Menghapus anggaran.
- Melihat riwayat anggaran.

Contoh:

| Kategori | Anggaran | Terpakai |
|---|---:|---:|
| Makanan | Rp500.000 | Rp350.000 |
| Transportasi | Rp300.000 | Rp200.000 |
| Hiburan | Rp200.000 | Rp150.000 |

Sistem dapat memberikan peringatan ketika penggunaan anggaran mencapai batas tertentu.

AI juga dapat membantu menganalisis penggunaan anggaran.

---

# 6. FINANCIAL ANALYTICS

Halaman untuk menganalisis kondisi keuangan secara lebih mendalam.

Fitur:

- Grafik pemasukan.
- Grafik pengeluaran.
- Grafik berdasarkan kategori.
- Perbandingan pengeluaran antarbulan.
- Tren pemasukan dan pengeluaran.
- Total tabungan bersih.
- Persentase pengeluaran terhadap pemasukan.
- Filter periode analisis.

Perhitungan analitik harus menggunakan data transaksi aktual.

---

# 7. FINANCIAL GOALS

Fitur untuk membuat dan memantau target keuangan.

Contoh:
- Target tabungan Rp5.000.000.
- Target membeli laptop.
- Target dana darurat.
- Target mengurangi pengeluaran.

Field:
- Goal Name.
- Target Amount.
- Current Amount.
- Target Date.
- Description.
- Status.

Fitur:
- Membuat target.
- Mengedit target.
- Menghapus target.
- Memantau progres.
- Melihat persentase pencapaian.
- Mendapatkan rekomendasi AI.

---

# 8. RECURRING TRANSACTIONS

Fitur untuk mengelola transaksi berulang.

Contoh:
- Biaya kos.
- Tagihan internet.
- Langganan aplikasi.
- Uang bulanan.
- Pendapatan rutin.

Fitur:
- Membuat transaksi berulang.
- Menentukan nominal.
- Menentukan kategori.
- Menentukan frekuensi.
- Menentukan tanggal mulai dan berakhir.
- Mengaktifkan atau menonaktifkan jadwal.

Catatan:
Transaksi otomatis harus diproses menggunakan scheduler atau mekanisme terjadwal yang sesuai dengan batasan deployment Vercel.

---

# 9. MULTIPLE WALLETS

Fitur untuk memisahkan sumber uang pengguna.

Contoh:

| Wallet | Saldo |
|---|---:|
| Cash | Rp300.000 |
| BCA | Rp1.500.000 |
| DANA | Rp250.000 |
| GoPay | Rp150.000 |

Fitur:
- Menambahkan dompet.
- Mengedit dompet.
- Menghapus dompet.
- Melihat saldo masing-masing.
- Memindahkan uang antardompet.
- Melihat riwayat transfer.

Transfer antardompet tidak boleh dihitung sebagai pemasukan atau pengeluaran agar laporan tidak mengalami penghitungan ganda.

---

# 10. REPORTS & EXPORT

Fitur laporan keuangan:

- Laporan harian.
- Laporan mingguan.
- Laporan bulanan.
- Laporan tahunan.
- Laporan berdasarkan kategori.
- Laporan pemasukan.
- Laporan pengeluaran.

Format ekspor:
- CSV.
- PDF.

---

# 11. SETTINGS

Fitur pengaturan aplikasi:

**Account**
- Profil pengguna.
- Email.
- Password.
- Logout.

**Preferences**
- Mata uang.
- Format tanggal.
- Preferensi tampilan.

**Categories**
- Melihat kategori.
- Menambah kategori.
- Mengedit kategori.
- Menghapus kategori yang tidak digunakan.

**AI Settings**
- Pengaturan provider AI.
- Preferensi AI.
- Pengelolaan riwayat percakapan.

**Application**
- Notifikasi.
- Instalasi PWA.
- Pengaturan akun.

---

# 12. USER INTERFACE & NAVIGATION

## 12.1 Design Direction

Aplikasi menggunakan pendekatan:

- Minimalist.
- Modern.
- Clean.
- Mobile-first.
- Mudah digunakan.
- Mengutamakan keterbacaan data keuangan.

Hindari tampilan dashboard yang terlalu padat dan penggunaan elemen dekoratif yang tidak memiliki fungsi.

## 12.2 Main Navigation

Navigasi utama untuk mobile:

1. Home.
2. Transactions.
3. AI Assistant.
4. Budgets.
5. Profile.

Navigasi desktop dapat menggunakan sidebar.

## 12.3 Quick Input

Tiga metode pencatatan harus mudah diakses.

Quick Input menyediakan:

- Manual.
- AI Chat.
- Voice.

Ketiganya harus memiliki pengalaman penggunaan yang konsisten.

## 12.4 Responsive Design

Aplikasi harus mendukung:
- Smartphone Android.
- Tablet.
- Desktop.
- Browser modern.

---

# 13. TECHNICAL REQUIREMENTS

## 13.1 Technology Stack

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js |
| Programming Language | TypeScript |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL |
| Database Platform | Supabase |
| Authentication | Supabase Auth |
| AI Provider | Gemini API |
| AI Validation | Zod |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Voice Recognition | Web Speech API |
| PWA | Next.js PWA implementation |
| Deployment | Vercel |

Pemilihan teknologi dapat dievaluasi kembali jika ditemukan kebutuhan teknis yang lebih sesuai selama pengembangan.

## 13.2 Deployment Architecture

User Device
→ Next.js Application (Vercel)
→ Next.js Route Handlers
→ Supabase PostgreSQL / Auth

Untuk AI:

Next.js Backend
→ Gemini API
→ Structured Response
→ Validation
→ Backend Processing

## 13.3 Environment Variables

Konfigurasi sensitif disimpan di environment variables.

Contoh:

SUPABASE_URL  
SUPABASE_ANON_KEY  
SUPABASE_SERVICE_ROLE_KEY  
GEMINI_API_KEY

Ketentuan:
- Service Role Key hanya boleh digunakan di server.
- Gemini API Key hanya boleh digunakan di server.
- Jangan mengekspos secret melalui variabel NEXT_PUBLIC.
- Gunakan environment variables terpisah untuk development dan production.

---

# 14. DATABASE REQUIREMENTS

Database awal dirancang menggunakan PostgreSQL.

Entitas utama:

## 14.1 users
Menyimpan informasi profil pengguna.

Field:
- id
- full_name
- email
- created_at

Identitas autentikasi mengikuti Supabase Auth.

## 14.2 wallets
Menyimpan informasi dompet pengguna.

Field:
- id
- user_id
- name
- initial_balance
- currency
- created_at

## 14.3 categories
Menyimpan kategori transaksi.

Field:
- id
- user_id
- name
- type
- icon
- created_at

Kategori sistem dan kategori khusus pengguna harus dapat dibedakan.

## 14.4 transactions
Menyimpan seluruh transaksi.

Field:
- id
- user_id
- wallet_id
- category_id
- type
- amount
- description
- transaction_date
- input_method
- notes
- created_at
- updated_at

Input method:
- manual
- ai_chat
- voice

## 14.5 budgets
Menyimpan anggaran pengguna.

Field:
- id
- user_id
- category_id
- amount
- period
- start_date
- end_date
- created_at

## 14.6 financial_goals
Menyimpan target keuangan.

Field:
- id
- user_id
- name
- target_amount
- current_amount
- target_date
- status
- created_at

## 14.7 recurring_transactions
Menyimpan jadwal transaksi berulang.

Field:
- id
- user_id
- wallet_id
- category_id
- type
- amount
- frequency
- next_execution
- end_date
- is_active
- created_at

## 14.8 ai_conversations
Menyimpan riwayat percakapan AI.

Field:
- id
- user_id
- title
- created_at
- updated_at

## 14.9 ai_messages
Menyimpan pesan percakapan.

Field:
- id
- conversation_id
- role
- content
- created_at

Seluruh tabel yang menyimpan data pengguna wajib memiliki mekanisme isolasi data berdasarkan user_id.

---

# 15. SECURITY REQUIREMENTS

Keamanan menjadi bagian penting karena aplikasi menyimpan informasi keuangan pribadi.

Ketentuan:

1. Menggunakan Supabase Row Level Security (RLS).
2. Setiap pengguna hanya dapat membaca dan mengubah data miliknya.
3. Seluruh API harus memverifikasi autentikasi pengguna.
4. API Key tidak boleh terekspos ke frontend.
5. Validasi seluruh input dari pengguna.
6. Validasi nominal dan tipe transaksi.
7. Menerapkan rate limiting pada endpoint AI.
8. Mencegah transaksi ganda akibat pengiriman request berulang.
9. Tidak memberikan akses database langsung kepada AI.
10. Menggunakan konfirmasi sebelum tindakan yang mengubah data.

---

# 16. NON-FUNCTIONAL REQUIREMENTS

## Performance
- Dashboard harus memuat data secara efisien.
- Query database harus menggunakan filter dan indeks yang sesuai.
- Riwayat transaksi menggunakan pagination.
- Pemanggilan AI hanya dilakukan ketika diperlukan.

## Reliability
- Transaksi tidak boleh tersimpan sebagian ketika satu proses gagal.
- Perubahan saldo harus konsisten dengan transaksi.
- Sistem harus menangani kegagalan API AI.
- Pengguna tetap dapat mencatat transaksi manual ketika AI tidak tersedia.

## Usability
- Proses pencatatan transaksi harus sederhana.
- Formulir harus mudah digunakan di smartphone.
- Hasil ekstraksi AI harus mudah diperiksa.
- Pesan kesalahan harus jelas.

## Compatibility
- Mendukung browser modern.
- Mendukung instalasi PWA.
- Voice recognition harus memiliki fallback.

---

# 17. MVP DEVELOPMENT SCOPE

Tidak seluruh fitur harus dikembangkan sekaligus.

## Phase 1 — Core Finance

Fokus: membangun sistem pencatatan keuangan yang berfungsi.

Fitur:
- Authentication.
- Dashboard.
- Manual transaction.
- Transaction history.
- Edit dan hapus transaksi.
- Kategori transaksi.
- Multiple wallets dasar.

## Phase 2 — AI Integration

Fokus: mengintegrasikan AI ke sistem keuangan.

Fitur:
- Gemini API integration.
- AI Chat.
- AI transaction extraction.
- Structured JSON response.
- Zod validation.
- Transaction confirmation.
- AI financial questions.
- AI conversation history.

## Phase 3 — Voice Integration

Fokus: menyediakan pencatatan menggunakan suara.

Fitur:
- Microphone permission.
- Speech-to-text.
- Voice transaction input.
- AI voice command processing.
- Text fallback.

## Phase 4 — Financial Management

Fokus: pengelolaan dan analisis keuangan.

Fitur:
- Budget management.
- Financial analytics.
- Financial goals.
- Monthly reports.
- AI financial insights.

## Phase 5 — Advanced Features

Fokus: meningkatkan kemampuan aplikasi.

Fitur:
- Recurring transactions.
- Budget alerts.
- CSV/PDF export.
- Advanced AI actions.
- PWA improvements.

---

# 18. ACCEPTANCE CRITERIA

Aplikasi dianggap memenuhi kebutuhan MVP apabila:

1. Pengguna dapat membuat akun dan login.
2. Pengguna dapat mencatat pemasukan dan pengeluaran secara manual.
3. Pengguna dapat mengedit dan menghapus transaksi.
4. Dashboard menampilkan saldo dan ringkasan keuangan yang benar.
5. Pengguna dapat mencatat beberapa transaksi menggunakan satu perintah AI.
6. AI dapat menghasilkan data transaksi terstruktur.
7. Pengguna dapat memeriksa hasil ekstraksi sebelum menyimpan.
8. Pengguna dapat mencatat transaksi menggunakan suara pada browser yang mendukungnya.
9. Pengguna dapat bertanya tentang kondisi keuangan berdasarkan data aktual.
10. Data antar pengguna terisolasi.
11. Aplikasi tetap dapat digunakan ketika layanan AI tidak tersedia.
12. Aplikasi dapat diakses melalui smartphone dan desktop.

---

# 19. PROJECT CONSTRAINTS

Beberapa batasan pengembangan:

- Proyek ditargetkan menggunakan layanan gratis selama masih berada dalam kuota yang tersedia.
- Gemini API menggunakan free tier.
- Supabase menggunakan free tier.
- Deployment menggunakan Vercel Hobby.
- Tidak membutuhkan VPS untuk MVP.
- Tidak membutuhkan server AI lokal.
- Tidak membutuhkan Langflow.
- Voice recognition bergantung pada dukungan browser.
- Fitur yang membutuhkan scheduler harus disesuaikan dengan batasan platform deployment.

Tidak ada jaminan seluruh penggunaan akan selalu gratis. Batas kuota dan kebijakan provider dapat berubah.

---

# 20. PRODUCT SUCCESS METRICS

Keberhasilan aplikasi diukur berdasarkan:

**Transaction Usability**
- Pengguna berhasil mencatat transaksi melalui ketiga metode input.
- Proses pencatatan mudah dipahami.

**AI Accuracy**
- AI mampu mengekstrak nominal, tipe, dan deskripsi dengan benar.
- Hasil ekstraksi dapat diperbaiki sebelum disimpan.
- AI tidak membuat transaksi tanpa persetujuan.

**Financial Data Accuracy**
- Saldo sesuai dengan data transaksi.
- Total pemasukan dan pengeluaran akurat.
- Perhitungan anggaran konsisten.

**Application Reliability**
- Aplikasi dapat digunakan tanpa AI.
- Data tersimpan dengan aman.
- Tidak terjadi kebocoran data antar pengguna.

---

# 21. FINAL PRODUCT DEFINITION

Personal Finance Assistant bukan sekadar aplikasi pencatat pemasukan dan pengeluaran.

Produk ini merupakan asisten pengelolaan keuangan pribadi dengan tiga metode interaksi:

1. Manual — pengguna mengontrol seluruh proses pencatatan.
2. Text AI — pengguna memberikan perintah menggunakan bahasa sehari-hari.
3. Voice AI — pengguna memberikan perintah melalui suara.

AI membantu memahami dan menganalisis informasi, sedangkan backend bertanggung jawab atas validasi, perhitungan, dan penyimpanan data.

**Prinsip utama produk:**

"Manage your money naturally, understand your finances intelligently."