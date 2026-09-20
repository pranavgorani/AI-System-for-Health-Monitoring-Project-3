"""
CLI Inference Tool for Aero Engine Anomaly & Fault Classification
"""

import os
import sys
import json
import math

def predict_sample(sample: dict):
    model_path = os.path.join(os.path.dirname(__file__), "model_artifact.json")
    if not os.path.exists(model_path):
        print("[ERROR] model_artifact.json not found. Run train.py first.")
        return

    with open(model_path, "r", encoding="utf-8") as f:
        artifact = json.load(f)

    baselines = artifact["baselines"]
    contributions = {}
    total_z = 0

    for k, b in baselines.items():
        val = float(sample.get(k, b["mean"]))
        z = abs(val - b["mean"]) / b["std"]
        total_z += z
        contributions[k] = round(z, 2)

    anomaly_score = round(1.0 - math.exp(-0.35 * total_z / len(baselines)), 2)
    classification = "NORMAL"
    if anomaly_score > 0.75:
        classification = "SEVERE ANOMALY"
    elif anomaly_score > 0.50:
        classification = "SIGNIFICANT ANOMALY"
    elif anomaly_score > 0.30:
        classification = "MINOR ANOMALY"

    result = {
        "anomaly_score": anomaly_score,
        "classification": classification,
        "is_anomaly": anomaly_score >= 0.35,
        "parameter_z_scores": contributions,
        "input_sample": sample
    }
    return result

def main():
    sample = {
        "rpm": 5350,
        "cht": 154.2,
        "egt": 875.0,
        "oil_pressure": 3.1,
        "oil_temperature": 124.0,
        "fuel_flow": 28.5,
        "vibration": 4.8,
        "battery_voltage": 28.1
    }
    print("[INFO] Running CLI inference on sample flight telemetry frame...")
    res = predict_sample(sample)
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
