"""
One-shot training script.
Run from ai-service root: python training/train_all.py
"""
import subprocess, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

steps = [
    ("Generating synthetic ride data",  [sys.executable, "data/generate_data.py"]),
    ("Training profit + ranker models", [sys.executable, "training/train_profit.py"]),
    ("Training earnings forecaster",    [sys.executable, "training/train_earnings.py"]),
    ("Training driver persona model",   [sys.executable, "training/train_persona.py"]),
]

for label, cmd in steps:
    print(f"\n{'='*55}\n  {label}\n{'='*55}")
    result = subprocess.run(cmd, cwd=ROOT)
    if result.returncode != 0:
        print(f"ERROR in step: {label}")
        sys.exit(1)

print("\n✅  All models trained. Start the server: python app.py")
