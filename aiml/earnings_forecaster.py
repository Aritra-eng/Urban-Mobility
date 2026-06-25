"""
Upgrade 3 — Earnings Forecasting (XGBoost + optional Prophet)
Predicts daily earnings N days into the future for a specific driver.
"""
import os
import joblib
import numpy as np
import pandas as pd
from datetime import date, timedelta

XGB_PATH    = os.path.join(os.path.dirname(__file__), "../models/earnings_model.pkl")
PROPHET_PATH = os.path.join(os.path.dirname(__file__), "../models/prophet_model.pkl")

_xgb_payload    = None
_prophet_model  = None


def _load_xgb():
    global _xgb_payload
    if _xgb_payload is None:
        _xgb_payload = joblib.load(XGB_PATH)
    return _xgb_payload


def _load_prophet():
    global _prophet_model
    if _prophet_model is None and os.path.exists(PROPHET_PATH):
        _prophet_model = joblib.load(PROPHET_PATH)
    return _prophet_model


def _build_lag_row(history: pd.Series, target_date: pd.Timestamp) -> dict:
    """Build a single feature row for the target_date using history series."""
    row = {}
    for lag in [1, 2, 3, 7, 14]:
        idx = target_date - timedelta(days=lag)
        row[f"lag_{lag}"] = history.get(idx, history.mean())
    row["rolling_7"]  = history[history.index < target_date].tail(7).mean()
    row["rolling_14"] = history[history.index < target_date].tail(14).mean()
    row["dow"]        = target_date.dayofweek
    row["month"]      = target_date.month
    row["is_weekend"] = int(target_date.dayofweek >= 5)
    return row


def forecast(
    driver_rides: list[dict],
    days_ahead: int = 7,
    use_prophet: bool = False,
) -> dict:
    """
    Parameters
    ----------
    driver_rides : list of {"date": "YYYY-MM-DD", "profit": float}
                   Historical daily earnings for ONE driver.
    days_ahead   : how many future days to forecast.
    use_prophet  : toggle Prophet model (if installed).

    Returns
    -------
    dict with 'history' and 'forecast' lists.
    """
    # Build history series
    if driver_rides:
        hist_df = pd.DataFrame(driver_rides)
        hist_df["date"] = pd.to_datetime(hist_df["date"])
        hist_df = hist_df.groupby("date")["profit"].sum().sort_index()
    else:
        # Fallback: empty series — model will use global means from pkl
        hist_df = pd.Series(dtype=float)

    # ---- XGBoost rolling forecast ----
    payload      = _load_xgb()
    model        = payload["model"]
    feature_cols = payload["feature_cols"]
    global_daily = payload["daily"]      # global training series for filling gaps

    # Merge driver series with global for lag fill
    global_series = global_daily.set_index("ds")["y"]
    combined      = global_series.copy()
    combined.update(hist_df)

    today       = pd.Timestamp(date.today())
    future_dates = [today + timedelta(days=i + 1) for i in range(days_ahead)]
    predictions  = []

    for fd in future_dates:
        row    = _build_lag_row(combined, fd)
        X_row  = pd.DataFrame([row])[feature_cols]
        pred   = float(model.predict(X_row)[0])
        pred   = max(pred, 0)
        predictions.append({"date": fd.strftime("%Y-%m-%d"), "predicted_profit": round(pred, 2)})
        # Update combined so next lag uses this prediction
        combined[fd] = pred

    # ---- Optional Prophet ----
    prophet_predictions = []
    if use_prophet:
        pm = _load_prophet()
        if pm is not None:
            future = pm.make_future_dataframe(periods=days_ahead)
            fc     = pm.predict(future)
            last_n = fc.tail(days_ahead)[["ds", "yhat", "yhat_lower", "yhat_upper"]]
            for _, r in last_n.iterrows():
                prophet_predictions.append({
                    "date":              r["ds"].strftime("%Y-%m-%d"),
                    "predicted_profit":  round(max(r["yhat"], 0), 2),
                    "lower":             round(max(r["yhat_lower"], 0), 2),
                    "upper":             round(max(r["yhat_upper"], 0), 2),
                })

    # History summary (last 14 days of driver data if available)
    history_out = []
    if not hist_df.empty:
        for ts, val in hist_df.tail(14).items():
            history_out.append({"date": ts.strftime("%Y-%m-%d"), "profit": round(float(val), 2)})

    return {
        "model_used":  "xgboost" + ("+prophet" if prophet_predictions else ""),
        "history":     history_out,
        "forecast":    predictions,
        "prophet":     prophet_predictions,
        "summary": {
            "today":    round(predictions[0]["predicted_profit"], 2) if predictions else 0,
            "tomorrow": round(predictions[1]["predicted_profit"], 2) if len(predictions) > 1 else 0,
            "week_avg": round(np.mean([p["predicted_profit"] for p in predictions]), 2),
            "week_total": round(sum(p["predicted_profit"] for p in predictions), 2),
        }
    }
