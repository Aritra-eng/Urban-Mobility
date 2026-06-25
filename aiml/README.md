# 🚗 Driver AI Service

## Setup & Run

```bash
cd ai-service
pip install -r requirements.txt

# 1. Train all models (one time)
python training/train_all.py

# 2. Start the AI server
python app.py
# → http://localhost:5001
```

---

## Endpoints

### Upgrade 1 — Profit Prediction
`POST /api/predict-profit`
```json
{ "distance": 18, "traffic": 7, "fuel_price": 105, "surge": 1.8, "ride_type": "airport" }
```
Returns `predicted_profit`, `confidence_low`, `confidence_high`

---

### Upgrade 2 — Intelligent Ride Ranking
`POST /api/rank-rides`
```json
{ "rides": [{ "ride_id": "R1", "distance": 5, "traffic": 8, "fuel_price": 105, "surge": 1.2, "ride_type": "local" }] }
```
Returns rides sorted by `profit_score` (0–100) with `recommendation_label`

---

### Upgrade 3 — Earnings Forecasting
`POST /api/forecast-earnings`
```json
{ "driver_rides": [{ "date": "2026-06-01", "profit": 1800 }], "days_ahead": 7 }
```
Returns `summary.today`, `summary.tomorrow`, `forecast[]`

---

### Upgrade 4 — Driver Persona
`POST /api/driver-persona`
```json
{ "driver_id": "DRV_001", "rides": [...] }
```
Returns `persona`, `strength`, `weakness`, `insights[]`, `stats`

---

### Health Check
`GET /api/health`

---

## Connecting to Node.js Backend

```js
// In your Express route
const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";

const { data } = await axios.post(`${AI_URL}/api/predict-profit`, {
  distance, traffic, fuel_price, surge, ride_type
});
res.json(data);
```
