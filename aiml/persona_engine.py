"""
Upgrade 4 — Driver Persona Analysis
Classifies a driver into a behavioural persona and returns actionable insights.
"""
import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/persona_model.pkl")
_payload   = None


def _load():
    global _payload
    if _payload is None:
        _payload = joblib.load(MODEL_PATH)
    return _payload


def _build_driver_features(rides: list[dict]) -> dict:
    """Aggregate ride-level data into per-driver behavioural features."""
    if not rides:
        return None

    df = pd.DataFrame(rides)
    df["timestamp"] = pd.to_datetime(df.get("timestamp", [datetime.now().isoformat()] * len(df)))
    df["hour"]      = df["timestamp"].dt.hour

    if "profit" not in df.columns:
        df["profit"] = 0.0
    if "distance" not in df.columns:
        df["distance"] = 10.0
    if "surge" not in df.columns:
        df["surge"] = 1.0
    if "is_peak" not in df.columns:
        df["is_peak"] = df["hour"].apply(lambda h: 1 if h in list(range(7, 10)) + list(range(17, 21)) else 0)
    if "ride_type" not in df.columns:
        df["ride_type"] = "local"
    if "is_weekend" not in df.columns:
        df["is_weekend"] = df["timestamp"].dt.dayofweek.apply(lambda d: 1 if d >= 5 else 0)

    return {
        "avg_profit":    df["profit"].mean(),
        "total_rides":   len(df),
        "avg_distance":  df["distance"].mean(),
        "avg_surge":     df["surge"].mean(),
        "peak_ratio":    df["is_peak"].mean(),
        "airport_ratio": (df["ride_type"] == "airport").mean(),
        "weekend_ratio": df["is_weekend"].mean(),
        "night_ratio":   (df["hour"] >= 21).mean(),
        "profit_std":    df["profit"].std() if len(df) > 1 else 0.0,
    }


def _build_insights(feats: dict, persona: dict) -> list[str]:
    insights = [persona["tip"]]

    if feats["peak_ratio"] < 0.3:
        insights.append("You're missing peak-hour surges. Try logging in at 7 AM and 5 PM.")
    if feats["airport_ratio"] < 0.1 and feats["avg_distance"] < 15:
        insights.append("Consider airport rides — they yield 40% higher profit on average.")
    if feats["profit_std"] > 200:
        insights.append("High earnings variance — focus on consistent moderate-distance rides.")
    if feats["avg_surge"] < 1.3:
        insights.append("Move to high-demand zones to capture better surge multipliers.")

    return insights[:3]   # top 3 insights


def get_persona(driver_id: str, rides: list[dict]) -> dict:
    """
    Parameters
    ----------
    driver_id : str
    rides     : list of ride dicts for this driver

    Returns
    -------
    Persona dict with label, strengths, weaknesses, and personalised insights.
    """
    payload      = _load()
    model        = payload["model"]
    feature_cols = payload["feature_cols"]
    labels       = payload["labels"]

    feats = _build_driver_features(rides)
    if feats is None:
        return {"error": "No ride history provided."}

    X         = pd.DataFrame([feats])[feature_cols].values
    cluster   = int(model.predict(X)[0])
    # Clamp to defined labels
    cluster   = cluster % len(labels)
    persona   = labels[cluster]
    insights  = _build_insights(feats, persona)

    return {
        "driver_id":   driver_id,
        "persona":     persona["name"],
        "emoji":       persona["emoji"],
        "strength":    persona["strength"],
        "weakness":    persona["weakness"],
        "insights":    insights,
        "stats": {
            "total_rides":    int(feats["total_rides"]),
            "avg_profit":     round(feats["avg_profit"], 2),
            "peak_ratio_pct": round(feats["peak_ratio"] * 100, 1),
            "airport_pct":    round(feats["airport_ratio"] * 100, 1),
            "avg_surge":      round(feats["avg_surge"], 2),
        }
    }
