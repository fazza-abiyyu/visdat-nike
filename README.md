# Analisis Data Penjualan NIKE U.S. (2020-2021)

> **Mata Kuliah:** Visualisasi Data

## 🔗 Live Demo
Akses dashboard interaktif di sini: **[Nike Analytics Dashboard](https://visdat.leci.app)**

## 🔗 Link Video
Akses video presentasi : **[Video Presentation](https://telkomuniversityofficial-my.sharepoint.com/:v:/g/personal/evanrafifpradana_student_telkomuniversity_ac_id/EbW5WEG6oLlLlrNmLIvgsr8BHHpf5CoTSJGXV_J8EZD2Lg?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=jgRPkf)**

---

## 👥 Anggota Tim & Kontribusi
Proyek ini dikerjakan oleh kelompok dengan pembagian tugas sebagai berikut:

| Nama | NIM | Peran | Tanggung Jawab Utama |
| :--- | :--- | :--- | :--- |
| **Muhammad Faza Abiyyu** | 2211102010 | Dashboard Developer | Menyusun tampilan dashboard utama |
| **Muhammad Rizqi** | 2211102016 | Data Analyst | Pembersihan data (data cleaning) dan analisis awal |
| **Evan Rafif Pradana** | 2211102017 | Data Researcher | Pencarian dataset dan eksplorasi data awal |
| **Muhammad Marganda Zuhdi** | 2211102041 | Report Writer | Penyusunan laporan tugas akhir dari latar belakang hingga kesimpulan |
| **Revan Kurniawan** | 2211102167 | Visualization Specialist | Pembuatan grafik dashboard agar rapi dan menarik |

---

## 📝 Latar Belakang
Dalam bisnis ritel modern, data penjualan adalah aset strategis untuk merekam perilaku konsumen. Laporan ini bertujuan mengonversi data mentah penjualan Nike di A.S. (periode 2020-2021) menjadi wawasan visual yang dapat ditindaklanjuti, mengungkap pola musiman, preferensi produk, dominasi wilayah, dan sensitivitas harga.

---

## 📁 Tentang Dataset
Dataset yang digunakan dalam proyek ini diambil dari platform **Kaggle**, berjudul *"Nike Sales"*.
* **Cakupan Data:** Transaksi penjualan produk Nike di Amerika Serikat.
* **Periode Waktu:** Tahun 2020 hingga 2021.
* **Isi Dataset:** Mencakup informasi terkait tanggal invoice, wilayah penjualan, produk, harga per unit, dan jumlah unit terjual.

---

## 🎯 Rumusan Masalah
Analisis ini difokuskan untuk menjawab empat pertanyaan bisnis utama:
1. Bagaimana perbandingan tren penjualan bulanan antara tahun 2020 dan 2021 (Year-on-Year)?
2. Produk apa saja yang menjadi pendorong utama pendapatan (Top 5)?
3. Wilayah mana yang mendominasi pasar penjualan di AS?
4. Apakah kenaikan harga unit berdampak signifikan terhadap volume penjualan?

---

## 🛠️ Metodologi
Proses analisis dilakukan dengan tahapan:
* **Data Loading & Cleaning:** Menggunakan **Pandas** untuk memuat dataset dan mengubah format tanggal menjadi tipe datetime.
* **Feature Engineering:** Membuat kolom *Total Sales* (hasil perkalian *Price per Unit* * *Units Sold*) untuk mendapatkan nilai pendapatan aktual.
* **Visualization:** Menggunakan **Matplotlib** dan **Seaborn** untuk membuat grafik yang relevan dengan rumusan masalah.

---

## 📊 Ringkasan Metrik Dataset
Berdasarkan dashboard yang telah dikembangkan:
* **Total Records:** 9,360
* **Total Sales:** \$8,629,275
* **Total Units Sold:** 241,984
* **Avg Price/Unit:** \$44.74
* **Unique Products:** 6
* **Unique Regions:** 5

---

## 💡 Hasil Analisis & Pembahasan

### 1. Tren Penjualan Bulanan (2020 vs 2021)
* **Dampak Awal 2020:** Penurunan tajam terjadi pada Maret-Mei 2020, berkorelasi dengan awal pandemi COVID-19 di AS.
* **Pemulihan 2021:** Tahun 2021 menunjukkan tren yang jauh lebih positif dan stabil, dengan penjualan hampir setiap bulan lebih tinggi dibanding 2020.
* **Puncak Musiman:** Tren kenaikan signifikan terlihat menuju akhir tahun (Oktober-Desember), mengindikasikan pengaruh kuat musim liburan (*holiday season*).

### 2. Produk Terlaris (Top 5 Products)
* **Men's Street Footwear** menduduki peringkat pertama dengan total penjualan tertinggi (\$2,668K).
* **Women's Apparel** (\$2,312K) muncul sebagai pesaing kuat di posisi kedua, menunjukkan permintaan tinggi di lini pakaian wanita.
* **Strategi Stok:** Manajemen harus memprioritaskan ketersediaan stok untuk kategori teratas ini karena kontribusinya yang masif.

### 3. Kontribusi Wilayah (Regional Sales Share)
* **Pasar Utama:** Wilayah **West** (27.6%) dan **Northeast** (21.7%) adalah kontributor terbesar.
* **Negara Bagian Kunci:** New York, California, dan Florida terlihat sangat menonjol dibandingkan negara bagian lain.
* **Implikasi:** Strategi pemasaran dan logistik harus difokuskan untuk mempertahankan dominasi di wilayah Barat dan Timur Laut.

### 4. Korelasi Harga vs. Unit Terjual
* **Inelastisitas Relatif:** Konsumen cenderung tidak terlalu sensitif terhadap perubahan harga dalam rentang saat ini; produk dengan harga lebih tinggi masih mencatatkan volume penjualan tinggi.
* Hal ini menunjukkan kuatnya *brand equity* Nike.

---

## 🎨 Rationale Desain
Keputusan desain visual diambil untuk memastikan informasi tersampaikan efektif:

### Visual Encodings & Alternatif
* **Tren Waktu (Line Chart):** Kami memilih *multi-line chart* karena dianggap paling efektif untuk menunjukkan perubahan data *time-series* secara kontinu.
    * *Alternatif:* Bar chart terpisah per tahun.
    * *Keputusan Akhir:* Line chart dipilih agar audiens dapat membandingkan pola fluktuasi antara 2020 dan 2021 secara langsung dalam satu bidang pandang.
* **Kategori Banyak (Horizontal Bar Chart):** Digunakan untuk analisis per negara bagian.
    * *Alternatif:* Vertical bar chart.
    * *Keputusan Akhir:* Grafik horizontal dipilih karena banyaknya jumlah negara bagian. Ini memberikan ruang yang lebih baik agar label tetap terbaca jelas tanpa perlu memiringkan teks.
* **Proporsi Wilayah (Donut Chart - Agregasi):**
    * *Alternatif:* Pie chart yang menampilkan seluruh negara bagian.
    * *Keputusan Akhir:* Berdasarkan eksplorasi awal, menampilkan seluruh negara bagian dalam satu pie chart terlalu padat. Diputuskan untuk melakukan agregasi ke tingkat Wilayah (Region) menggunakan Donut Chart agar proporsi kontribusi pasar lebih mudah dipahami.

### Interaksi
* **Filtering:** Dashboard dilengkapi filter interaktif (Year, Region, Product, Retailer) untuk memungkinkan pengguna mengeksplorasi data secara spesifik sesuai kebutuhan analisis mereka.

---

## ⚙️ Proses Pengembangan

### Pembagian Tugas
Pekerjaan dibagi berdasarkan keahlian anggota tim untuk efisiensi:
* **Data Preparation:** Evan (Pencarian Dataset & Eksplorasi Awal) dan Rizqi (Pembersihan Data & Analisis Awal).
* **Visualization & Dashboarding:** Faza (Pengembang Dashboard Utama) dan Revan (Spesialis Visualisasi/Polishing).
* **Reporting:** Marganda (Penyusunan Laporan & Storytelling).

### Estimasi Waktu & Tantangan
* **Total Waktu Pengembangan:** Sekitar 13 hari kerja (akumulasi waktu seluruh anggota), dengan rincian:
    * Rizqi, Faza, Revan: ~3 hari/orang
    * Evan, Zuhdi: ~2 hari/orang
* **Aspek Tersulit:** Mengimplementasikan fitur **filter data** pada dashboard web agar dapat berfungsi secara responsif dan akurat terhadap keseluruhan visualisasi.

---

## 📑 Kesimpulan
1.  **Pemulihan Pasca-Pandemi:** Kinerja penjualan Nike pulih sangat kuat di tahun 2021 setelah volatilitas awal 2020.
2.  **Produk Andalan:** *Men's Street Footwear* adalah tulang punggung pendapatan, namun *Women's Apparel* menunjukkan potensi pertumbuhan krusial.
3.  **Fokus Geografis:** Wilayah West AS dan negara bagian padat (seperti New York) wajib diprioritaskan.
4.  **Kekuatan Brand:** Nike memiliki fleksibilitas penetapan harga karena loyalitas konsumen yang tinggi.

---

## 📚 Referensi & Acknowledgments
* **Dataset:** [Kaggle - Nike Sales](https://www.kaggle.com/datasets/krishnavamsis/nike-sales)
* **Inspirasi Visualisasi:** [Tableau Public Dashboard](https://public.tableau.com/app/profile/hamizan.hibatullah/viz/NIKEDashboardSalesReport/Dashboard1)