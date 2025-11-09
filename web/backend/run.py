#!/usr/bin/env python3
"""
Script untuk menjalankan backend FastAPI
"""

import subprocess
import sys
import os

def install_requirements():
    """Install dependencies"""
    print("Menginstall dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Dependencies berhasil diinstall")
    except subprocess.CalledProcessError as e:
        print(f"✗ Gagal menginstall dependencies: {e}")
        sys.exit(1)

def run_server():
    """Jalankan server FastAPI"""
    print("Menjalankan server FastAPI...")
    print("Server akan berjalan di: http://localhost:8001")
    print("API Documentation: http://localhost:8001/docs")
    print("Tekan Ctrl+C untuk menghentikan server")
    print("-" * 50)
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8001",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\nServer dihentikan")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Pastikan kita berada di direktori yang benar
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print("=== Nike Sales Data Backend ===")
    
    # Install dependencies jika requirements.txt ada
    if os.path.exists("requirements.txt"):
        install_requirements()
    
    # Jalankan server
    run_server()