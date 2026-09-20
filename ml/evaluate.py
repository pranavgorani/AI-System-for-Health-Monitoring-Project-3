"""
Model Evaluation Script for Aero Engine Anomaly & Fault Classification
Calculates classification metrics across synthetic validation sets.
"""

import os
import csv
import json
import math

def evaluate():
    model_path = os.path.join(os.path.dirname(__file__), "model_artifact.json")
    if not os.path.exists(model_path):
        print("[ERROR] model_artifact.json not found. Run train.py first.")
        return

    with open(model_path, "r", encoding="utf-8") as f:
        artifact = json.load(f)

    baselines = artifact["baselines"]
    print(f"[INFO] Evaluating {artifact['model_name']}...")

    # Validate against normal and anomalous test sets
    data_dir = os.path.join(os.path.dirname(__file__), "..", "public", "data")
    test_files = [
        ("normal_engine.csv", False),
        ("overheating.csv", True),
        ("vibration_fault.csv", True),
        ("misfire.csv", True),
    ]

    tp, fp, tn, fn = 0, 0, 0, 0

    for fname, is_anomaly_truth in test_files:
        path = os.path.join(data_dir, fname)
        if not os.path.exists(path):
            continue

        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Compute multi-channel z-score
                z_sum = 0
                for k, b in baselines.items():
                    val = float(row[k])
                    z = abs(val - b["mean"]) / b["std"]
                    z_sum += z

                avg_z = z_sum / len(baselines)
                pred_anomaly = avg_z > 1.8

                if is_anomaly_truth and pred_anomaly:
                    tp += 1
                elif is_anomaly_truth and not pred_anomaly:
                    fn += 1
                elif not is_anomaly_truth and pred_anomaly:
                    fp += 1
                else:
                    tn += 1

    total = tp + fp + tn + fn
    accuracy = (tp + tn) / total if total > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

    metrics = {
        "accuracy": round(accuracy * 100, 2),
        "precision": round(precision * 100, 2),
        "recall": round(recall * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "total_test_samples": total,
        "confusion_matrix": {
            "true_positive": tp,
            "false_positive": fp,
            "true_negative": tn,
            "false_negative": fn
        }
    }

    metrics_path = os.path.join(os.path.dirname(__file__), "evaluation_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"[SUCCESS] Evaluation Complete:")
    print(f"  - Accuracy:  {metrics['accuracy']}%")
    print(f"  - Precision: {metrics['precision']}%")
    print(f"  - Recall:    {metrics['recall']}%")
    print(f"  - F1 Score:  {metrics['f1_score']}%")
    print(f"[OK] Saved metrics to {metrics_path}")

if __name__ == "__main__":
    evaluate()
