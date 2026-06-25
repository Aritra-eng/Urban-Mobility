"""
Upgrade 1 — Real ML Profit Prediction
"""
import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/profit_model.pkl")
_model = None


def _load():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


def predict_profit(
    distance: float,
    traffic: float,
    fuel_price: float,
    surge: float,
    hour: int = None,
    is_peak: int = None,
    is_weekend: int = None,
    ride_type: str = "local",
) -> dict:
    """
    Predict profit for a single ride.
    All monetary values in ₹.
    """
    if hour is None:
        hour = datetime.now().hour
    if is_peak is None:
        is_peak = 1 if hour in list(range(7, 10)) + list(range(17, 21)) else 0
    if is_weekend is None:
        is_weekend = 1 if datetime.now().weekday() >= 5 else 0

    row = pd.DataFrame([{
        "distance":   distance,
        "traffic":    traffic,
        "fuel_price": fuel_price,
        "surge":      surge,
        "hour":       hour,
        "is_peak":    is_peak,
        "is_weekend": is_weekend,
        "ride_type":  ride_type,
    }])

    model = _load()
    predicted_profit = float(model.predict(row)[0])

    # Confidence interval via individual tree predictions
    trees     = model.named_steps["model"].estimators_
    pre       = model.named_steps["pre"]
    X_trans   = pre.transform(row)
    tree_preds = np.array([t.predict(X_trans)[0] for t in trees])
    std        = float(np.std(tree_preds))

    return {
        "predicted_profit": round(predicted_profit, 2),
        "confidence_low":   round(predicted_profit - 1.96 * std, 2),
        "confidence_high":  round(predicted_profit + 1.96 * std, 2),
        "inputs": {
            "distance":   distance,
            "traffic":    traffic,
            "fuel_price": fuel_price,
            "surge":      surge,
            "hour":       hour,
            "is_peak":    bool(is_peak),
            "is_weekend": bool(is_weekend),
            "ride_type":  ride_type,
        }
    }
