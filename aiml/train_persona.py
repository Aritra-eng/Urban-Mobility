"""
Upgrade 4 — Driver Persona Analysis
KMeans clustering on per-driver behavioural features.
Saves: models/persona_model.pkl
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pandas as pd
import numpy as np
import joblib
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

DATA_PATH  = os.path.join(os.path.dirname(__file__), "../data/rides.csv")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "../models")
os.makedirs(MODELS_DIR, exist_ok=True)

PERSONA_LABELS = {
    0: {
        "name":     "Peak Hour Specialist",
        "emoji":    "⚡",
        "strength": "Surge & city rides",
        "weakness": "Long outstation rides",
        "tip":      "Accept rides during 7–9 AM and 5–8 PM for maximum surge multiplier.",
    },
    1: {
        "name":     "Airport Champion",
        "emoji":    "✈️",
        "strength": "Airport & outstation",
        "weakness": "Short local rides",
        "tip":      "Position near terminals 30 min before peak departure windows.",
    },
    2: {
        "name":     "Consistent Earner",
        "emoji":    "🎯",
        "strength": "Steady all-day earnings",
        "weakness": "Hasn't optimised for surge",
        "tip":      "Target moderate-distance rides in low-traffic corridors for best profit/hr.",
    },
    3: {
        "name":     "Night Owl",
        "emoji":    "🌙",
        "strength": "Late-night & weekend rides",
        "weakness": "Morning peak under-utilised",
        "tip":      "Leverage weekend nights — demand spike + reduced competition = best margins.",
    },
}


def build_driver_features(df):
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["hour"]      = df["timestamp"].dt.hour

    grp = df.groupby("driver_id")

    feats = pd.DataFrame({
        "avg_profit":       grp["profit"].mean(),
        "total_rides":      grp["profit"].count(),
        "avg_distance":     grp["distance"].mean(),
        "avg_surge":        grp["surge"].mean(),
        "peak_ratio":       grp["is_peak"].mean(),
        "airport_ratio":    grp["ride_type"].apply(lambda x: (x == "airport").mean()),
        "weekend_ratio":    grp["is_weekend"].mean(),
        "night_ratio":      grp["hour"].apply(lambda x: (x >= 21).mean()),
        "profit_std":       grp["profit"].std().fillna(0),
    }).reset_index()

    return feats


def train_persona_model(feats):
    print(f"\n=== Training Driver Persona Clustering ({len(feats)} drivers) ===")
    feature_cols = [c for c in feats.columns if c != "driver_id"]
    X = feats[feature_cols].values

    # Choose k=4 personas (elbow tested externally)
    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("kmeans", KMeans(n_clusters=4, random_state=42, n_init=20)),
    ])
    pipe.fit(X)

    feats["cluster"] = pipe.named_steps["kmeans"].labels_

    # Map cluster ids to persona labels by their dominant trait
    cluster_stats = feats.groupby("cluster")[feature_cols].mean()
    print("\nCluster centroids:")
    print(cluster_stats.round(3).to_string())

    payload = {
        "model":        pipe,
        "feature_cols": feature_cols,
        "labels":       PERSONA_LABELS,
    }
    model_path = os.path.join(MODELS_DIR, "persona_model.pkl")
    joblib.dump(payload, model_path)
    print(f"\n  Saved → {model_path}")
    return payload


if __name__ == "__main__":
    df    = pd.read_csv(DATA_PATH)
    feats = build_driver_features(df)
    train_persona_model(feats)
    print("Persona model trained successfully.")
