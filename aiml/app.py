"""
AI Service — Flask/FastAPI hybrid entry point.
Run: python app.py
Endpoints:
  POST /api/predict-profit
  POST /api/rank-rides
  POST /api/forecast-earnings
  POST /api/driver-persona
  GET  /api/health
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback, os

app = Flask(__name__)
CORS(app)   # Allow React frontend on any port

# Lazy-import services so models load on first request (faster cold start)
def _profit():
    from services.profit_predictor import predict_profit
    return predict_profit

def _ranker():
    from services.ride_ranker import rank_rides
    return rank_rides

def _forecaster():
    from services.earnings_forecaster import forecast
    return forecast

def _persona():
    from services.persona_engine import get_persona
    return get_persona


def ok(data):
    return jsonify({"success": True, "data": data})

def err(msg, code=400):
    return jsonify({"success": False, "error": msg}), code


# ──────────────────────────────────────────────
# Upgrade 1 — Profit Prediction
# ──────────────────────────────────────────────
@app.route("/api/predict-profit", methods=["POST"])
def predict_profit_endpoint():
    """
    Body: {
      distance, traffic, fuel_price, surge,
      ride_type?, hour?, is_peak?, is_weekend?
    }
    """
    try:
        b = request.json or {}
        result = _profit()(
            distance   = float(b["distance"]),
            traffic    = float(b["traffic"]),
            fuel_price = float(b["fuel_price"]),
            surge      = float(b["surge"]),
            ride_type  = b.get("ride_type", "local"),
            hour       = b.get("hour"),
            is_peak    = b.get("is_peak"),
            is_weekend = b.get("is_weekend"),
        )
        return ok(result)
    except KeyError as e:
        return err(f"Missing field: {e}")
    except Exception:
        return err(traceback.format_exc(), 500)


# ──────────────────────────────────────────────
# Upgrade 2 — Intelligent Ride Ranking
# ──────────────────────────────────────────────
@app.route("/api/rank-rides", methods=["POST"])
def rank_rides_endpoint():
    """
    Body: { "rides": [ { ride_id, distance, traffic, fuel_price, surge, ride_type }, ... ] }
    """
    try:
        rides = (request.json or {}).get("rides", [])
        if not rides:
            return err("'rides' list is required and must be non-empty.")
        result = _ranker()(rides)
        return ok(result)
    except Exception:
        return err(traceback.format_exc(), 500)


# ──────────────────────────────────────────────
# Upgrade 3 — Earnings Forecasting
# ──────────────────────────────────────────────
@app.route("/api/forecast-earnings", methods=["POST"])
def forecast_earnings_endpoint():
    """
    Body: {
      "driver_rides": [ { "date": "YYYY-MM-DD", "profit": float }, ... ],
      "days_ahead": 7,
      "use_prophet": false
    }
    """
    try:
        b = request.json or {}
        result = _forecaster()(
            driver_rides = b.get("driver_rides", []),
            days_ahead   = int(b.get("days_ahead", 7)),
            use_prophet  = bool(b.get("use_prophet", False)),
        )
        return ok(result)
    except Exception:
        return err(traceback.format_exc(), 500)


# ──────────────────────────────────────────────
# Upgrade 4 — Driver Persona Analysis
# ──────────────────────────────────────────────
@app.route("/api/driver-persona", methods=["POST"])
def driver_persona_endpoint():
    """
    Body: {
      "driver_id": "DRV_0001",
      "rides": [ { timestamp, profit, distance, surge, ride_type, is_peak, is_weekend }, ... ]
    }
    """
    try:
        b         = request.json or {}
        driver_id = b.get("driver_id", "unknown")
        rides     = b.get("rides", [])
        if not rides:
            return err("'rides' list is required for persona analysis.")
        result = _persona()(driver_id, rides)
        return ok(result)
    except Exception:
        return err(traceback.format_exc(), 500)


# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    loaded = [f for f in os.listdir(models_dir) if f.endswith(".pkl")] if os.path.isdir(models_dir) else []
    return ok({
        "status":        "running",
        "models_loaded": loaded,
        "endpoints": [
            "POST /api/predict-profit",
            "POST /api/rank-rides",
            "POST /api/forecast-earnings",
            "POST /api/driver-persona",
        ]
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"\n🚀  AI Service running on http://localhost:{port}")
    print("   Make sure you have trained models: python training/train_all.py\n")
    app.run(host="0.0.0.0", port=port, debug=False)
