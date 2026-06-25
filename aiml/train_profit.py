"""
Upgrade 1 & 2 — Profit Prediction + Intelligent Ride Ranking
Trains a RandomForestRegressor on historical rides.
Saves: models/profit_model.pkl + models/ride_ranker.pkl
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, r2_score

DATA_PATH   = os.path.join(os.path.dirname(__file__), "../data/rides.csv")
MODELS_DIR  = os.path.join(os.path.dirname(__file__), "../models")
os.makedirs(MODELS_DIR, exist_ok=True)


def load_and_prepare(path):
    df = pd.read_csv(path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df


def build_pipeline(model):
    cat_features = ["ride_type"]
    num_features = ["distance", "traffic", "fuel_price", "surge", "hour", "is_peak", "is_weekend"]

    preprocessor = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_features),
        ("num", "passthrough", num_features),
    ])
    return Pipeline([("pre", preprocessor), ("model", model)])


def train_profit_model(df):
    print("\n=== Training Profit Prediction Model ===")
    features = ["distance", "traffic", "fuel_price", "surge", "hour", "is_peak", "is_weekend", "ride_type"]
    X = df[features]
    y = df["profit"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipe = build_pipeline(RandomForestRegressor(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1
    ))
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2  = r2_score(y_test, y_pred)
    print(f"  MAE : ₹{mae:.2f}   R² : {r2:.4f}")

    # Feature importance (num features only for display)
    rf    = pipe.named_steps["model"]
    enc   = pipe.named_steps["pre"].transformers_[0][1]
    cat_names = list(enc.get_feature_names_out(["ride_type"]))
    num_names = ["distance", "traffic", "fuel_price", "surge", "hour", "is_peak", "is_weekend"]
    all_names = cat_names + num_names
    importances = dict(zip(all_names, rf.feature_importances_))
    top5 = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
    print("  Top-5 features:", top5)

    model_path = os.path.join(MODELS_DIR, "profit_model.pkl")
    joblib.dump(pipe, model_path)
    print(f"  Saved → {model_path}")
    return pipe


def train_ride_ranker(df):
    """
    Upgrade 2 — instead of hardcoded weights, learn which ride features
    lead to highest profitability.  We rank by predicted profit percentile.
    We train a separate GBR so the ranker can be tuned independently.
    """
    print("\n=== Training Ride Ranker ===")
    # Target = profit rank bucket (0–9) so ranking is ordinal
    df = df.copy()
    df["profit_decile"] = pd.qcut(df["profit"], q=10, labels=False)

    features = ["distance", "traffic", "fuel_price", "surge", "hour", "is_peak", "is_weekend", "ride_type"]
    X = df[features]
    y = df["profit_decile"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipe = build_pipeline(GradientBoostingRegressor(
        n_estimators=150, learning_rate=0.08, max_depth=5, random_state=42
    ))
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test).round().clip(0, 9)
    acc = (y_pred == y_test.values).mean()
    print(f"  Decile accuracy: {acc:.2%}")

    model_path = os.path.join(MODELS_DIR, "ride_ranker.pkl")
    joblib.dump(pipe, model_path)
    print(f"  Saved → {model_path}")
    return pipe


if __name__ == "__main__":
    df = load_and_prepare(DATA_PATH)
    print(f"Loaded {len(df)} rides")
    train_profit_model(df)
    train_ride_ranker(df)
    print("\nAll models trained successfully.")
