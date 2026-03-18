from fastapi import FastAPI
import uvicorn
from datetime import datetime

app = FastAPI(title="GST Satellite Engine")

@app.get("/")
async def root():
    return {
        "service": "GST Satellite Engine",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "satellite-engine"}

@app.get("/api/satellites")
async def get_satellites():
    # Sample satellite data
    satellites = [
        {"norad_id": 25544, "name": "ISS (ZARYA)", "country": "International"},
        {"norad_id": 33591, "name": "CANX-2", "country": "Canada"},
        {"norad_id": 37820, "name": "SKYSAT-1", "country": "USA"},
        {"norad_id": 40069, "name": "AIST-2D", "country": "Russia"},
        {"norad_id": 41622, "name": "KMS-4", "country": "USA"},
    ]
    return {"count": len(satellites), "satellites": satellites}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
