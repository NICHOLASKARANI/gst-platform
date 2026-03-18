from fastapi import FastAPI
import uvicorn
from datetime import datetime
import random

app = FastAPI(title="GST Weather AI Service")

@app.get("/")
async def root():
    return {
        "service": "GST Weather AI",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "weather-ai"}

@app.get("/api/forecast/{lat}/{lon}")
async def get_forecast(lat: float, lon: float):
    # Sample weather data
    return {
        "location": {"lat": lat, "lon": lon},
        "current": {
            "temperature": round(20 + random.uniform(-5, 5), 1),
            "humidity": round(60 + random.uniform(-10, 10), 1),
            "conditions": random.choice(["Sunny", "Partly Cloudy", "Cloudy", "Rain"]),
            "wind_speed": round(5 + random.uniform(0, 10), 1)
        },
        "forecast": [
            {"day": "Today", "temp_high": 25, "temp_low": 18, "conditions": "Sunny"},
            {"day": "Tomorrow", "temp_high": 26, "temp_low": 19, "conditions": "Partly Cloudy"},
            {"day": "Day 3", "temp_high": 24, "temp_low": 17, "conditions": "Cloudy"},
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
