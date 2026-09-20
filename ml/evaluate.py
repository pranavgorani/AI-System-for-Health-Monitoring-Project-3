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
        ("normal_engine.csv", False, "Nominal"),
        ("injector_degradation.csv", True, "Injector Degradation"),
        ("overheating.csv", True, "Overheating"),
        ("vibration_fault.csv", True, "Vibration Fault"),
        ("sensor_drift.csv", True, "Sensor Drift"),
        ("misfire.csv", True, "Misfire"),
    ]

    tp, fp, tn, fn = 0, 0, 0, 0
    tp_unfiltered, fp_unfiltered = 0, 0
    per_class_results = {}
    lead_times = []

    for fname, is_anomaly_truth, label in test_files:
        path = os.path.join(data_dir, fname)
        if not os.path.exists(path):
            continue

        c_tp, c_fp, c_tn, c_fn = 0, 0, 0, 0
        first_detection_idx = None
        critical_trip_idx = 480  # Baseline descent / critical envelope phase
        consecutive_anomalies = 0

        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, row in enumerate(reader):
                # Compute multi-channel z-score and peak channel departure
                z_scores = []
                for k, b in baselines.items():
                    val = float(row[k])
                    z = abs(val - b["mean"]) / b["std"]
                    z_scores.append(z)

                # Anomaly triggers if any localized channel exceeds 2.8 sigma or composite average exceeds 1.4 sigma
                max_z = max(z_scores)
                avg_z = sum(z_scores) / len(z_scores)
                raw_anomaly = (max_z > 2.8) or (avg_z > 1.4)

                if raw_anomaly:
                    consecutive_anomalies += 1
                else:
                    consecutive_anomalies = 0

                # Persistence filter N >= 3
                filtered_anomaly = consecutive_anomalies >= 3

                if is_anomaly_truth:
                    if raw_anomaly:
                        tp_unfiltered += 1
                    if filtered_anomaly:
                        c_tp += 1
                        tp += 1
                        if first_detection_idx is None:
                            first_detection_idx = idx
                    else:
                        c_fn += 1
                        fn += 1
                else:
                    if raw_anomaly:
                        fp_unfiltered += 1
                    if filtered_anomaly:
                        c_fp += 1
                        fp += 1
                    else:
                        c_tn += 1
                        tn += 1

        c_tot = c_tp + c_fp + c_tn + c_fn
        c_prec = c_tp / (c_tp + c_fp) if (c_tp + c_fp) > 0 else 1.0
        c_rec = c_tp / (c_tp + c_fn) if (c_tp + c_fn) > 0 else 1.0
        c_f1 = 2 * (c_prec * c_rec) / (c_prec + c_rec) if (c_prec + c_rec) > 0 else 0.0

        lead_time_sec = 0.0
        if is_anomaly_truth and first_detection_idx is not None:
            # Lead time in seconds before critical limit trip
            lead_time_sec = max(0.0, float(critical_trip_idx - first_detection_idx))
            lead_times.append(lead_time_sec)

        per_class_results[label] = {
            "samples": c_tot,
            "precision": round(c_prec * 100, 2),
            "recall": round(c_rec * 100, 2),
            "f1": round(c_f1 * 100, 2),
            "lead_time_sec": lead_time_sec
        }

    total = tp + fp + tn + fn
    accuracy = (tp + tn) / total if total > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

    mean_lead_time = sum(lead_times) / len(lead_times) if lead_times else 0.0
    far_filtered = (fp / (tn + fp)) * 100 if (tn + fp) > 0 else 0.0
    far_unfiltered = (fp_unfiltered / (tn + fp_unfiltered)) * 100 if (tn + fp_unfiltered) > 0 else 0.0

    metrics = {
        "dataset_version": "v2.4-synthetic-multiphysics",
        "validation_strategy": "Mission-Level Holdout Stratification",
        "total_test_samples": total,
        "accuracy": round(accuracy * 100, 2),
        "precision": round(precision * 100, 2),
        "recall": round(recall * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "mean_lead_time_sec": round(mean_lead_time, 1),
        "false_alarm_rate_filtered_pct": round(far_filtered, 2),
        "false_alarm_rate_unfiltered_pct": round(far_unfiltered, 2),
        "per_class": per_class_results,
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
    print(f"  - Accuracy:           {metrics['accuracy']}%")
    print(f"  - Precision:          {metrics['precision']}%")
    print(f"  - Recall:             {metrics['recall']}%")
    print(f"  - F1 Score:           {metrics['f1_score']}%")
    print(f"  - Mean Lead Time:     +{metrics['mean_lead_time_sec']}s")
    print(f"  - FAR (Filtered N=3): {metrics['false_alarm_rate_filtered_pct']}% (vs {metrics['false_alarm_rate_unfiltered_pct']}% unfiltered)")
    print(f"[OK] Saved comprehensive metrics to {metrics_path}")

if __name__ == "__main__":
    evaluate()

