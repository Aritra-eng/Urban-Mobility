"""
Upgrade 3 — Earnings Forecasting
Uses XGBoost with time-series lag features + Prophet fallback.
Saves: models/earnings_model.pkl + models/prophet_model.pkl
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pandas as pd
import numpy as np
import joblib
import warnings
warnings.filterwarnings("ignore")

from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import TimeSeriesSplit

DATA_PATH  = os.path.join(os.path.dirname(__file__), "../data/rides.csv")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "../models")
os.makedirs(MODELS_DIR, exist_ok=True)


def build_daily_series(df):
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["date"]      = df["timestamp"].dt.date
    daily = (df.groupby("date")["profit"].sum()
               .reset_index()
               .rename(columns={"date": "ds", "profit": "y"}))
    daily["ds"] = pd.to_datetime(daily["ds"])
    daily = daily.sort_values("ds").reset_index(drop=True)
    return daily


def add_lag_features(daily):
    d = daily.copy()
    for lag in [1, 2, 3, 7, 14]:
        d[f"lag_{lag}"] = d["y"].shift(lag)
    d["rolling_7"]  = d["y"].shift(1).rolling(7).mean()
    d["rolling_14"] = d["y"].shift(1).rolling(14).mean()
    d["dow"]        = d["ds"].dt.dayofweek
    d["month"]      = d["ds"].dt.month
    d["is_weekend"] = (d["dow"] >= 5).astype(int)
    return d.dropna()


def train_xgboost_forecaster(daily):
    print("\n=== Training XGBoost Earnings Forecaster ===")
    d = add_lag_features(daily)

    feature_cols = [c for c in d.columns if c not in ("ds", "y")]
    X = d[feature_cols].values
    y = d["y"].values

    tscv = TimeSeriesSplit(n_splits=4)
    maes = []
    for train_idx, val_idx in tscv.split(X):
        model = XGBRegressor(n_estimators=300, learning_rate=0.05,
                             max_depth=4, subsample=0.8,
                             colsample_bytree=0.8, random_state=42,
                             verbosity=0)
        model.fit(X[train_idx], y[train_idx])
        preds = model.predict(X[val_idx])
        maes.append(mean_absolute_error(y[val_idx], preds))

    print(f"  CV MAE: ₹{np.mean(maes):.2f} ± ₹{np.std(maes):.2f}")

    # Final fit on all data
    final_model = XGBRegressor(n_estimators=300, learning_rate=0.05,
                               max_depth=4, subsample=0.8,
                               colsample_bytree=0.8, random_state=42,
                               verbosity=0)
    final_model.fit(X, y)

    # Save model + column list for inference
    payload = {"model": final_model, "feature_cols": feature_cols, "daily": daily}
    model_path = os.path.join(MODELS_DIR, "earnings_model.pkl")
    joblib.dump(payload, model_path)
    print(f"  Saved → {model_path}")
    return payload


def train_prophet_forecaster(daily):
    """Optional Prophet model — gracefully skips if not installed."""
    try:
        from prophet import Prophet
    except ImportError:
        print("  Prophet not installed — skipping (pip install prophet to enable).")
        return

    print("\n=== Training Prophet Earnings Forecaster ===")
    m = Prophet(daily_seasonality=False, weekly_seasonality=True,
                yearly_seasonality=True, changepoint_prior_scale=0.1)
    m.fit(daily[["ds", "y"]])

    model_path = os.path.join(MODELS_DIR, "prophet_model.pkl")
    joblib.dump(m, model_path)
    print(f"  Saved → {model_path}")
    return m


if __name__ == "__main__":
    df    = pd.read_csv(DATA_PATH)
    daily = build_daily_series(df)
    print(f"Daily series: {len(daily)} days  "
          f"({daily['ds'].min().date()} → {daily['ds'].max().date()})")

    train_xgboost_forecaster(daily)
    train_prophet_forecaster(daily)
    print("\nEarnings models trained successfully.")
