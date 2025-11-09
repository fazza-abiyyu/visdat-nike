from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta
import json
from typing import List, Dict, Any, Optional
import os
import io
import asyncio
from concurrent.futures import ThreadPoolExecutor

app = FastAPI(title="Nike Sales Data API", version="2.0.0", description="API untuk analisis data penjualan Nike U.S. sesuai spesifikasi Jupyter Notebook")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants sesuai dengan Jupyter Notebook
CSV_URL = "https://raw.githubusercontent.com/ham407/Analisis-Penjualan-Produk-Nike-U.S.-Tahun-2020---2021/main/Nike%20Dataset.csv"

class NikeDataProcessor:
    """Processor data Nike sesuai dengan logika dan spesifikasi Jupyter Notebook"""
    
    def __init__(self):
        self.df = None
        self.last_fetch = None
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def load_data(self) -> pd.DataFrame:
        """Load data dari sumber eksternal sesuai notebook"""
        if self.df is not None and self.last_fetch and (datetime.now() - self.last_fetch).seconds < 300:
            return self.df
        
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                self.executor, 
                lambda: requests.get(CSV_URL, timeout=30)
            )
            response.raise_for_status()
            
            # Process CSV data sesuai notebook
            csv_content = response.text
            self.df = pd.read_csv(io.StringIO(csv_content))
            
            # Validasi kolom sesuai notebook
            required_columns = ['Invoice Date', 'Product', 'Region', 'Retailer', 
                              'Sales Method', 'State', 'Price per Unit', 
                              'Total Sales', 'Units Sold']
            
            for col in required_columns:
                if col not in self.df.columns:
                    raise HTTPException(status_code=500, detail=f"Kolom {col} tidak ditemukan dalam data")
            
            # Preprocessing data sesuai notebook
            self.df = self._preprocess_data(self.df)
            self.last_fetch = datetime.now()
            
            return self.df
            
        except requests.RequestException as e:
            raise HTTPException(status_code=503, detail=f"Gagal mengambil data: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing data: {str(e)}")
    
    def _preprocess_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Preprocessing data sesuai dengan notebook"""
        # Membersihkan nama kolom
        df.columns = df.columns.str.strip()
        
        # Konversi tanggal sesuai notebook
        df['Invoice Date'] = pd.to_datetime(df['Invoice Date'], dayfirst=True)
        df['Year'] = df['Invoice Date'].dt.year
        df['Month'] = df['Invoice Date'].dt.month
        
        # Konversi kolom numerik
        df['Price per Unit'] = pd.to_numeric(df['Price per Unit'], errors='coerce')
        df['Total Sales'] = pd.to_numeric(df['Total Sales'], errors='coerce')
        df['Units Sold'] = pd.to_numeric(df['Units Sold'], errors='coerce')
        
        # Hapus data yang tidak valid
        df = df.dropna(subset=['Price per Unit', 'Total Sales', 'Units Sold'])
        
        return df
    
    async def get_summary_statistics(self) -> Dict[str, Any]:
        """Statistik summary sesuai notebook"""
        df = await self.load_data()
        
        return {
            "total_records": len(df),
            "total_sales": float(df['Total Sales'].sum()),
            "total_units": int(df['Units Sold'].sum()),
            "avg_price_per_unit": float(df['Price per Unit'].mean()),
            "unique_products": int(df['Product'].nunique()),
            "unique_regions": int(df['Region'].nunique()),
            "unique_retailers": int(df['Retailer'].nunique()),
            "unique_states": int(df['State'].nunique()),
            "data_period": {
                "start_date": df['Invoice Date'].min().strftime('%Y-%m-%d'),
                "end_date": df['Invoice Date'].max().strftime('%Y-%m-%d'),
                "years": sorted(df['Year'].unique().tolist())
            }
        }
    
    async def get_monthly_trends(self, year: Optional[int] = None) -> Dict[str, Any]:
        """Analisis tren bulanan sesuai notebook (Visualisasi 1)"""
        df = await self.load_data()
        
        # Validasi data: pastikan tidak ada data outlier yang tidak realistis
        # Batasi data dengan filter yang masuk akal untuk bisnis retail
        df = df[(df['Total Sales'] > 0) & (df['Total Sales'] < 100000)]  # Batas realistis untuk transaksi retail
        df = df[(df['Units Sold'] > 0) & (df['Units Sold'] < 1000)]      # Batas realistis untuk unit terjual
        
        if year:
            df = df[df['Year'] == year]
        
        monthly_data = df.groupby(['Year', 'Month']).agg({
            'Total Sales': 'sum',
            'Units Sold': 'sum',
            'Price per Unit': 'mean'
        }).reset_index()
        
        # Format untuk chart
        trends = {}
        for year_val in monthly_data['Year'].unique():
            year_data = monthly_data[monthly_data['Year'] == year_val]
            trends[str(year_val)] = {
                'months': year_data['Month'].tolist(),
                'sales': year_data['Total Sales'].tolist(),
                'units': year_data['Units Sold'].tolist(),
                'avg_price': year_data['Price per Unit'].tolist()
            }
        
        return trends
    
    async def get_top_products(self, limit: int = 10) -> Dict[str, Any]:
        """Analisis top produk sesuai notebook (Visualisasi 2)"""
        df = await self.load_data()
        
        # Validasi data untuk menghindari outlier
        df = df[(df['Total Sales'] > 0) & (df['Total Sales'] < 100000)]
        df = df[(df['Units Sold'] > 0) & (df['Units Sold'] < 1000)]
        
        product_performance = df.groupby('Product').agg({
            'Total Sales': 'sum',
            'Units Sold': 'sum',
            'Price per Unit': 'mean',
            'Invoice Date': 'count'
        }).rename(columns={'Invoice Date': 'Transaction Count'})
        
        # Urutkan berdasarkan penjualan dan ambil top produk
        top_products = product_performance.nlargest(limit, 'Total Sales')
        
        # Hitung persentase distribusi
        total_sales_all = product_performance['Total Sales'].sum()
        top_sales = top_products['Total Sales'].sum()
        percentage = (top_sales / total_sales_all) * 100
        
        return {
            'top_products': [
                {
                    'product': product,
                    'total_sales': float(sales),
                    'units_sold': int(units),
                    'avg_price': float(avg_price),
                    'transactions': int(transactions)
                }
                for product, (sales, units, avg_price, transactions) in top_products.iterrows()
            ],
            'summary': {
                'total_products': len(product_performance),
                'total_sales_all': float(total_sales_all),
                'top_products_sales': float(top_sales),
                'top_products_percentage': float(percentage),
                'analysis': f'Top {limit} produk menyumbang {percentage:.1f}% dari total penjualan'
            }
        }
    
    async def get_region_distribution(self) -> Dict[str, Any]:
        """Distribusi wilayah sesuai notebook (Visualisasi 3)"""
        df = await self.load_data()
        
        region_stats = df.groupby('Region').agg({
            'Total Sales': 'sum',
            'Units Sold': 'sum',
            'Price per Unit': 'mean',
            'Invoice Date': 'count'
        }).rename(columns={'Invoice Date': 'Transaction Count'})
        
        return {
            'regions': region_stats.index.tolist(),
            'sales': region_stats['Total Sales'].tolist(),
            'units': region_stats['Units Sold'].tolist(),
            'avg_price': region_stats['Price per Unit'].tolist(),
            'transactions': region_stats['Transaction Count'].tolist(),
            'sales_percentage': (region_stats['Total Sales'] / region_stats['Total Sales'].sum() * 100).tolist()
        }
    
    async def get_price_correlation(self) -> Dict[str, Any]:
        """Korelasi harga vs unit terjual sesuai notebook (Visualisasi 4)"""
        df = await self.load_data()
        
        # Validasi data dan hapus outlier
        df = df[(df['Price per Unit'] > 0) & (df['Price per Unit'] < 200)]  # Harga realistis untuk produk retail
        df = df[(df['Units Sold'] > 0) & (df['Units Sold'] < 1000)]         # Unit terjual realistis
        
        # Hitung korelasi Pearson yang sebenarnya
        correlation = df['Price per Unit'].corr(df['Units Sold'])
        
        # Sample data untuk scatter plot (maksimal 200 titik untuk performa)
        sample_data = df.sample(min(200, len(df)), random_state=42)
        
        return {
            'correlation': float(correlation) if not pd.isna(correlation) else 0.0,
            'price_per_unit': sample_data['Price per Unit'].tolist(),
            'units_sold': sample_data['Units Sold'].tolist(),
            'total_sales': sample_data['Total Sales'].tolist(),
            'products': sample_data['Product'].tolist(),
            'sample_size': len(sample_data),
            'interpretation': 'Korelasi Pearson antara harga per unit dan jumlah unit terjual'
        }
    
    async def get_state_analysis(self, limit: int = 15) -> Dict[str, Any]:
        """Analisis per negara bagian sesuai notebook (Visualisasi 5)"""
        df = await self.load_data()
        
        # Validasi data untuk menghindari outlier
        df = df[(df['Total Sales'] > 0) & (df['Total Sales'] < 100000)]
        df = df[(df['Units Sold'] > 0) & (df['Units Sold'] < 1000)]
        
        state_stats = df.groupby('State').agg({
            'Total Sales': 'sum',
            'Units Sold': 'sum',
            'Region': 'first',
            'Price per Unit': 'mean',
            'Invoice Date': 'count'
        }).rename(columns={'Invoice Date': 'Transaction Count'}).nlargest(limit, 'Total Sales')
        
        # Hitung persentase dan harga per unit
        total_sales_all = df['Total Sales'].sum()
        
        return {
            'state_analysis': [
                {
                    'state': state,
                    'total_sales': float(sales),
                    'units_sold': int(units),
                    'region': region,
                    'avg_price': float(avg_price),
                    'transactions': int(transactions),
                    'sales_percentage': float((sales / total_sales_all) * 100),
                    'avg_price_per_unit': float(sales / units) if units > 0 else 0.0
                }
                for state, (sales, units, region, avg_price, transactions) in state_stats.iterrows()
            ],
            'summary': {
                'total_states_analyzed': len(state_stats),
                'total_sales_all': float(total_sales_all),
                'analysis': f'Analisis penjualan untuk {len(state_stats)} negara bagian teratas'
            }
        }
    
    async def get_retailer_analysis(self) -> Dict[str, Any]:
        """Analisis performa retailer"""
        df = await self.load_data()
        
        retailer_stats = df.groupby('Retailer').agg({
            'Total Sales': 'sum',
            'Units Sold': 'sum',
            'Price per Unit': 'mean',
            'Invoice Date': 'count'
        }).rename(columns={'Invoice Date': 'Transaction Count'})
        
        return {
            'retailers': retailer_stats.index.tolist(),
            'sales': retailer_stats['Total Sales'].tolist(),
            'units': retailer_stats['Units Sold'].tolist(),
            'avg_price': retailer_stats['Price per Unit'].tolist(),
            'transactions': retailer_stats['Transaction Count'].tolist()
        }
    
    async def get_sales_method_analysis(self) -> Dict[str, Any]:
        """Analisis metode penjualan"""
        df = await self.load_data()
        
        method_stats = df.groupby('Sales Method').agg({
            'Total Sales': 'sum',
            'Units Sold': 'sum',
            'Price per Unit': 'mean',
            'Invoice Date': 'count'
        }).rename(columns={'Invoice Date': 'Transaction Count'})
        
        return {
            'methods': method_stats.index.tolist(),
            'sales': method_stats['Total Sales'].tolist(),
            'units': method_stats['Units Sold'].tolist(),
            'avg_price': method_stats['Price per Unit'].tolist(),
            'transactions': method_stats['Transaction Count'].tolist()
        }
    
    async def get_filtered_data(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Data dengan filter untuk frontend"""
        df = await self.load_data()
        
        # Apply filters
        filtered_df = df.copy()
        
        if 'years' in filters and filters['years']:
            filtered_df = filtered_df[filtered_df['Year'].isin(filters['years'])]
        
        if 'regions' in filters and filters['regions']:
            filtered_df = filtered_df[filtered_df['Region'].isin(filters['regions'])]
        
        if 'products' in filters and filters['products']:
            filtered_df = filtered_df[filtered_df['Product'].isin(filters['products'])]
        
        if 'retailers' in filters and filters['retailers']:
            filtered_df = filtered_df[filtered_df['Retailer'].isin(filters['retailers'])]
        
        # Convert to JSON serializable format
        result_data = filtered_df.head(1000).to_dict('records')
        for record in result_data:
            for key, value in record.items():
                if isinstance(value, (np.integer, np.floating)):
                    record[key] = value.item()
                elif isinstance(value, (pd.Timestamp, datetime)):
                    record[key] = value.strftime('%Y-%m-%d')
        
        return {
            'filtered_data': result_data,
            'total_records': len(filtered_df),
            'applied_filters': filters
        }

# Initialize processor
processor = NikeDataProcessor()

# API Endpoints sesuai dengan spesifikasi Jupyter Notebook

@app.get("/")
async def root():
    """Root endpoint dengan informasi API"""
    return {
        "message": "Nike Sales Data API v2.0",
        "description": "API untuk analisis data penjualan Nike U.S. sesuai spesifikasi Jupyter Notebook",
        "endpoints": {
            "/summary": "Statistik summary data",
            "/monthly-trends": "Analisis tren bulanan",
            "/top-products": "Analisis top produk",
            "/region-distribution": "Distribusi wilayah",
            "/price-correlation": "Korelasi harga vs unit terjual",
            "/state-analysis": "Analisis per negara bagian",
            "/retailer-analysis": "Analisis performa retailer",
            "/sales-method-analysis": "Analisis metode penjualan",
            "/filtered-data": "Data dengan filter"
        }
    }

@app.get("/summary")
async def get_summary():
    """Endpoint untuk statistik summary sesuai notebook"""
    try:
        summary = await processor.get_summary_statistics()
        return JSONResponse(content=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting summary: {str(e)}")

@app.get("/monthly-trends")
async def get_monthly_trends(year: Optional[int] = None):
    """Endpoint untuk analisis tren bulanan sesuai notebook"""
    try:
        trends = await processor.get_monthly_trends(year)
        return JSONResponse(content=trends)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting monthly trends: {str(e)}")

@app.get("/top-products")
async def get_top_products(limit: int = 10):
    """Endpoint untuk analisis top produk sesuai notebook"""
    try:
        top_products = await processor.get_top_products(limit)
        return JSONResponse(content=top_products)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting top products: {str(e)}")

@app.get("/region-distribution")
async def get_region_distribution():
    """Endpoint untuk distribusi wilayah sesuai notebook"""
    try:
        region_data = await processor.get_region_distribution()
        return JSONResponse(content=region_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting region distribution: {str(e)}")

@app.get("/price-correlation")
async def get_price_correlation():
    """Endpoint untuk korelasi harga vs unit terjual sesuai notebook"""
    try:
        correlation_data = await processor.get_price_correlation()
        return JSONResponse(content=correlation_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting price correlation: {str(e)}")

@app.get("/state-analysis")
async def get_state_analysis(limit: int = 15):
    """Endpoint untuk analisis per negara bagian sesuai notebook"""
    try:
        state_data = await processor.get_state_analysis(limit)
        return JSONResponse(content=state_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting state analysis: {str(e)}")

@app.get("/retailer-analysis")
async def get_retailer_analysis():
    """Endpoint untuk analisis performa retailer"""
    try:
        retailer_data = await processor.get_retailer_analysis()
        return JSONResponse(content=retailer_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting retailer analysis: {str(e)}")

@app.get("/sales-method-analysis")
async def get_sales_method_analysis():
    """Endpoint untuk analisis metode penjualan"""
    try:
        method_data = await processor.get_sales_method_analysis()
        return JSONResponse(content=method_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting sales method analysis: {str(e)}")

@app.post("/filtered-data")
async def get_filtered_data(filters: Dict[str, Any] = None):
    """Endpoint untuk data dengan filter"""
    try:
        # Jika filters None atau kosong, gunakan filter default kosong
        if filters is None:
            filters = {}
        filtered_data = await processor.get_filtered_data(filters)
        return JSONResponse(content=filtered_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting filtered data: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/debug-data")
async def debug_data():
    """Endpoint untuk debugging data yang tersedia"""
    try:
        df = await processor.load_data()
        
        # Cek data yang tersedia
        available_data = {
            "total_records": len(df),
            "years_available": sorted(df['Year'].unique().tolist()) if 'Year' in df.columns else [],
            "regions_available": df['Region'].unique().tolist() if 'Region' in df.columns else [],
            "products_available": df['Product'].unique().tolist()[:20] if 'Product' in df.columns else [],  # Batasi 20 produk pertama
            "retailers_available": df['Retailer'].unique().tolist() if 'Retailer' in df.columns else [],
            "states_available": df['State'].unique().tolist()[:20] if 'State' in df.columns else [],  # Batasi 20 state pertama
            "date_range": {
                "start": df['Invoice Date'].min().strftime('%Y-%m-%d') if 'Invoice Date' in df.columns else None,
                "end": df['Invoice Date'].max().strftime('%Y-%m-%d') if 'Invoice Date' in df.columns else None
            },
            "sample_data": df.head(5).to_dict('records') if len(df) > 0 else []
        }
        
        return JSONResponse(content=available_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting debug data: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)