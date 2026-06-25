"""
Synthetic ride data generator.
Run once to create rides.csv for training.
Replace with real MongoDB exports in production.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random

np.random.seed(42)
random.seed(42)

N = 5000

def generate_rides(n):
    now = datetime.now()
    records = []

    ride_types = ["airport", "local", "outstation", "peak_city"]
    drivers    = [f"DRV_{i:04d}" for i in range(1, 51)]   # 50 synthetic drivers

    for _ in range(n):
        ts          = now - timedelta(days=random.randint(0, 180),
                                      hours=random.randint(0, 23),
                                      minutes=random.randint(0, 59))
        hour        = ts.hour
        is_peak     = 1 if hour in list(range(7, 10)) + list(range(17, 21)) else 0
        is_weekend  = 1 if ts.weekday() >= 5 else 0
        ride_type   = random.choice(ride_types)

        distance    = np.random.uniform(2, 60)
        traffic     = np.random.uniform(1, 10)              # 1=clear, 10=jammed
        fuel_price  = np.random.uniform(90, 115)            # ₹/L
        surge       = round(np.random.uniform(1.0, 3.0) if is_peak else np.random.uniform(1.0, 1.5), 1)

        # Revenue model
        base_fare   = 15 + distance * 12
        revenue     = base_fare * surge + (200 if ride_type == "airport" else 0)
        revenue    += 50 if is_weekend else 0

        # Cost model
        fuel_cost   = (distance / 15) * fuel_price           # 15 km/L mileage
        time_cost   = (distance / max(30 - traffic * 2, 5)) * 60 * 2   # ₹2/min opportunity cost
        wear_cost   = distance * 0.8

        profit      = revenue - fuel_cost - time_cost - wear_cost
        profit      = round(profit + np.random.normal(0, 20), 2)

        records.append({
            "driver_id":   random.choice(drivers),
            "timestamp":   ts.isoformat(),
            "hour":        hour,
            "is_peak":     is_peak,
            "is_weekend":  is_weekend,
            "ride_type":   ride_type,
            "distance":    round(distance, 2),
            "traffic":     round(traffic, 1),
            "fuel_price":  round(fuel_price, 2),
            "surge":       surge,
            "revenue":     round(revenue, 2),
            "profit":      profit,
        })

    return pd.DataFrame(records)

if __name__ == "__main__":
    df = generate_rides(N)
    df.to_csv("rides.csv", index=False)
    print(f"Generated {N} rides → rides.csv")
    print(df.describe())
