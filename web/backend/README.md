# Nike Sales Data Backend

Backend FastAPI untuk aplikasi visualisasi data penjualan Nike. Mengatasi masalah CORS dan menyediakan API yang lebih terstruktur.

## Fitur

- ✅ API endpoints terstruktur
- ✅ CORS enabled
- ✅ Data caching (1 jam)
- ✅ Error handling yang baik
- ✅ Data processing dan preprocessing
- ✅ Health check endpoint

## Struktur API

### Endpoints

- `GET /` - Info API
- `GET /api/data` - Data penjualan lengkap (summary + chart data + raw data)
- `GET /api/data/summary` - Hanya summary statistics
- `GET /api/data/raw` - Raw data dengan limit
- `GET /api/health` - Health check

### Response Format

```json
{
  "success": true,
  "data": {
    "summary": {
      "total_sales": 1234567.89,
      "total_units": 9876,
      "total_records": 1000,
      "regions_count": 5
    },
    "region_stats": {...},
    "chart_data": {
      "sales_by_region": {...},
      "units_by_region": {...},
      "monthly_trends": {...},
      "product_performance": {...},
      "regional_comparison": {...}
    },
    "raw_data": [...]
  }
}
```

## Instalasi dan Menjalankan

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Jalankan Server

**Opsi 1: Menggunakan run.py (Recommended)**
```bash
python run.py
```

**Opsi 2: Menggunakan uvicorn langsung**
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Akses API

- Server: http://localhost:8001
- API Documentation: http://localhost:8001/docs
- Health Check: http://localhost:8001/api/health

## Integrasi dengan Frontend

Frontend telah diupdate untuk menggunakan backend API:

1. **Konfigurasi**: Menggunakan `http://localhost:8001/api/data`
2. **Error Handling**: Menangani koneksi ke backend
3. **Fallback**: Tetap menggunakan data dummy jika backend down
4. **Caching**: Frontend caching 1 jam (sesuai backend)

## Keunggulan vs Direct Fetch

| Aspek | Direct Fetch | Backend API |
|-------|-------------|-------------|
| CORS | ❌ Bermasalah | ✅ Diatur dengan CORSMiddleware |
| Error Handling | ⚠️ Terbatas | ✅ Komprehensif |
| Data Processing | ⚠️ Di frontend | ✅ Di server (lebih efisien) |
| Caching | ⚠️ localStorage | ✅ Server-side + file cache |
| Scalability | ❌ Terbatas | ✅ Mudah dikembangkan |

## Troubleshooting

### Backend tidak bisa diakses
1. Pastikan port 8001 tidak digunakan: `lsof -i :8001`
2. Check dependencies: `pip list | grep fastapi`
3. Restart server

### CORS error di frontend
1. Pastikan backend berjalan di port 8001
2. Check console untuk error koneksi
3. Frontend akan fallback ke data dummy

### Data tidak muncul
1. Check endpoint `/api/health`
2. Check console backend untuk error
3. Frontend akan menggunakan cache atau fallback