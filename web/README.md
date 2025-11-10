# Nike Sales Dashboard

Dashboard visualisasi data penjualan Nike di Amerika Serikat dengan filter interaktif dan chart yang responsif.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+ (untuk development tools)

### Installation & Run

#### Backend (API Server)
```bash
cd backend

# Install dependencies
npm run install-deps
# atau
pip install -r requirements.txt

# Run development server
npm run dev
# atau
python run.py

# Server akan berjalan di http://localhost:8001
```

#### Frontend (Dashboard)
```bash
cd frontend

# Run development server
npm run dev
# atau
npm start

# Dashboard akan berjalan di http://localhost:8080
```

## 📁 Project Structure

```
web/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── run.py               # Server runner script
│   ├── requirements.txt     # Python dependencies
│   └── package.json         # NPM scripts
└── frontend/
    ├── index.html           # Main dashboard page
    ├── dashboard.js         # Dashboard logic & charts
    ├── styles.css           # Styling
    └── package.json         # NPM scripts
```

## 🛠️ Available Scripts

### Backend Scripts
- `npm start` - Run production server
- `npm run dev` - Run development server with auto-reload
- `npm run prod` - Run production server
- `npm run install-deps` - Install Python dependencies
- `npm test` - Run tests

### Frontend Scripts
- `npm start` - Run development server on port 8080
- `npm run dev` - Same as start
- `npm run serve` - Serve static files
- `npm run build` - Build for production (no-op for static files)

## 🚀 Deployment Options

### Option 1: Local Deployment
1. Jalankan backend: `cd backend && npm start`
2. Jalankan frontend: `cd frontend && npm start`
3. Buka http://localhost:8080 di browser

### Option 2: Production Deployment

#### Backend (VPS/Cloud)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

#### Frontend (Static Hosting)
```bash
cd frontend
# Upload index.html, dashboard.js, styles.css ke static hosting
# Contoh: Netlify, Vercel, GitHub Pages, atau Nginx
```

### Option 3: Docker (Coming Soon)
```dockerfile
# Dockerfile untuk backend
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Option 4: Heroku

#### Backend (Procfile)
```
web: python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### Frontend (Netlify/Vercel)
- Upload file frontend ke platform static hosting
- Set environment variable untuk API URL

## 🔧 Configuration

### Backend Configuration
Edit `backend/main.py` untuk:
- Port server
- CORS settings
- Data file path

### Frontend Configuration
Edit `frontend/dashboard.js` line 31:
```javascript
this.apiBaseUrl = 'https://your-backend-url.com'; // Ganti untuk production
```

## 📊 Features

- ✅ Interactive filters (Year, Region, Product)
- ✅ Multiple chart types (Line, Bar, Pie, Radar, Scatter)
- ✅ Responsive design
- ✅ Empty data handling
- ✅ Chart zoom & pan
- ✅ Real-time data updates

## 🌐 API Endpoints

- `POST /summary` - Get summary statistics
- `POST /monthly-trends` - Get monthly sales trends
- `POST /top-products` - Get top products data
- `POST /region-distribution` - Get region distribution
- `POST /price-correlation` - Get price correlation data
- `POST /state-analysis` - Get state analysis
- `POST /sales-method-analysis` - Get sales method data
- `POST /retailer-analysis` - Get retailer performance data
- `POST /filtered-data` - Get all filtered data at once

## 🐛 Troubleshooting

### Backend Connection Error
- Pastikan backend server berjalan di port yang benar
- Cek firewall settings
- Cek CORS configuration di backend

### Frontend Not Loading
- Pastikan file `index.html`, `dashboard.js`, `styles.css` ada
- Cek browser console untuk JavaScript errors
- Pastikan API URL benar di `dashboard.js`

### Data Not Showing
- Cek backend console untuk error messages
- Pastikan data file tersedia
- Cek network tab di browser dev tools