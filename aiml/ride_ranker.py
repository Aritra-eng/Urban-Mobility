"""
Upgrade 2 — Intelligent Ride Ranking
Ranks a list of candidate rides by learned profitability score.
"""
import os
import joblib
import pandas as pd
from datetime import datetime

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/ride_ranker.pkl")
_model = None


def _load():
    global _model
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    return _model


def rank_rides(rides: list[dict]) -> list[dict]:
    """
    Input:  list of ride dicts with keys:
            ride_id, distance, traffic, fuel_price, surge,
            ride_type, hour (optional), is_peak (optional), is_weekend (optional)
    Output: same list sorted by descending profit_score (0–100),
            with 'rank', 'profit_score', 'recommendation_label' added.
    """
    now      = datetime.now()
    cur_hour = now.hour
    cur_peak = 1 if cur_hour in list(range(7, 10)) + list(range(17, 21)) else 0
    cur_wknd = 1 if now.weekday() >= 5 else 0

    rows = []
    for r in rides:
        rows.append({
            "distance":   r.get("distance", 10),
            "traffic":    r.get("traffic", 5),
            "fuel_price": r.get("fuel_price", 100),
            "surge":      r.get("surge", 1.0),
            "hour":       r.get("hour", cur_hour),
            "is_peak":    r.get("is_peak", cur_peak),
            "is_weekend": r.get("is_weekend", cur_wknd),
            "ride_type":  r.get("ride_type", "local"),
        })

    df     = pd.DataFrame(rows)
    model  = _load()
    scores = model.predict(df)          # 0–9 decile scores

    # Normalise to 0–100
    scores_norm = ((scores - scores.min()) /
                   (scores.max() - scores.min() + 1e-9)) * 100

    enriched = []
    for i, ride in enumerate(rides):
        sc = round(float(scores_norm[i]), 1)
        if sc >= 75:
            label = "🔥 High Profit"
        elif sc >= 45:
            label = "✅ Moderate Profit"
        else:
            label = "⚠️ Low Profit"

        enriched.append({**ride, "profit_score": sc, "recommendation_label": label})

    enriched.sort(key=lambda x: x["profit_score"], reverse=True)
    for i, r in enumerate(enriched):
        r["rank"] = i + 1

    return enriched
