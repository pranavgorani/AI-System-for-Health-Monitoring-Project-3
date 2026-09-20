"""
Synthetic Aero Piston Engine Telemetry Dataset Generator
Generates realistic multi-channel flight datasets for DRDO / iDEX MALE UAV demonstrators.
Produces:
- normal_engine.csv
- degraded_engine.csv
- overheating.csv
- vibration_fault.csv
- sensor_drift.csv
- misfire.csv
"""

import os
import math
import random
from datetime import datetime, timedelta

COLUMNS = [
  "timestamp",
  "engine_id",
  "mission_id",
  "rpm",
  "cht",
  "egt",
  "oil_pressure",
  "oil_temperature",
  "fuel_flow",
  "vibration",
  "battery_voltage",
  "alternator_current",
  "injection_timing",
  "throttle",
  "altitude",
  "ambient_temperature",
  "ambient_pressure",
  "engine_load"
]

def generate_flight_profile(scenario: str, row_count: int = 600, engine_id: str = "AEGIS-ENG-001"):
    base_time = datetime(2026, 9, 20, 8, 0, 0)
    rows = []

    for i in range(row_count):
        t = base_time + timedelta(seconds=i)
        ts = t.strftime("%Y-%m-%dT%H:%M:%SZ")

        # Flight states
        if i < 60:
            state = "TAKEOFF"
            throttle = 100.0
            rpm = 5650 + random.uniform(-20, 20)
            alt = 1000 + i * 25
            load = 96.0
        elif i < 180:
            state = "CLIMB"
            throttle = 85.0
            rpm = 5150 + random.uniform(-15, 15)
            alt = 2500 + (i - 60) * 35
            load = 82.0
        elif i < 480:
            state = "CRUISE"
            throttle = 65.0
            rpm = 4650 + random.uniform(-15, 15)
            alt = 6700
            load = 68.0
        else:
            state = "DESCENT"
            throttle = 35.0
            rpm = 3200 + random.uniform(-20, 20)
            alt = max(500, 6700 - (i - 480) * 45)
            load = 38.0

        # Physical formulas
        amb_temp = 22.0 - (alt / 1000.0) * 1.98
        amb_press = 1013.0 * math.exp(-alt / 27000.0)

        fuel = 7.2 + (load / 100.0) * 22.5 + random.uniform(-0.3, 0.3)
        egt = 620.0 + load * 2.1 + random.uniform(-3, 3)
        cht = 90.0 + load * 0.52 + amb_temp * 0.25 + random.uniform(-1.5, 1.5)
        oil_p = 2.2 + (rpm / 5800.0) * 2.6 - max(0, cht - 110.0) * 0.008 + random.uniform(-0.05, 0.05)
        oil_t = 65.0 + load * 0.45 + random.uniform(-1, 1)
        vib = 2.1 + (rpm / 5800.0) * 1.4 + random.uniform(-0.1, 0.1)

        batt = 28.2 + random.uniform(-0.1, 0.1)
        alt_curr = 24.0 + load * 0.18 + random.uniform(-0.5, 0.5)
        timing = 22.0 + (rpm / 5800.0) * 3.8

        # Apply specific scenario distortions
        if scenario == "degraded_engine":
            egt += 35.0
            fuel += 2.8
            vib += 0.8
            oil_p -= 0.4
        elif scenario == "overheating" and i > 200:
            cht += min(38.0, (i - 200) * 0.25)
            egt += min(65.0, (i - 200) * 0.4)
            oil_t += min(28.0, (i - 200) * 0.2)
        elif scenario == "vibration_fault" and i > 150:
            vib += 4.5 + math.sin(i * 0.3) * 0.8
        elif scenario == "sensor_drift":
            # Linear drift +1 C per minute
            cht += (i / 60.0) * 1.0
        elif scenario == "misfire" and i > 180:
            egt -= 140.0
            vib += 3.4
            fuel += 1.5

        row = [
            ts,
            engine_id,
            f"MSN-SYN-{scenario[:4].upper()}",
            f"{rpm:.0f}",
            f"{cht:.1f}",
            f"{egt:.1f}",
            f"{oil_p:.2f}",
            f"{oil_t:.1f}",
            f"{fuel:.1f}",
            f"{vib:.2f}",
            f"{batt:.1f}",
            f"{alt_curr:.1f}",
            f"{timing:.1f}",
            f"{throttle:.0f}",
            f"{alt:.0f}",
            f"{amb_temp:.1f}",
            f"{amb_press:.0f}",
            f"{load:.1f}"
        ]
        rows.append(",".join(row))

    return "\n".join([",".join(COLUMNS)] + rows)

def main():
    data_dir = os.path.join(os.path.dirname(__file__), "..", "public", "data")
    os.makedirs(data_dir, exist_ok=True)

    scenarios = [
        ("normal_engine", 800),
        ("degraded_engine", 600),
        ("overheating", 600),
        ("vibration_fault", 600),
        ("sensor_drift", 600),
        ("misfire", 600),
    ]

    for sc, count in scenarios:
        content = generate_flight_profile(sc, row_count=count)
        out_path = os.path.join(data_dir, f"{sc}.csv")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[OK] Generated {out_path} ({count} rows)")

if __name__ == "__main__":
    main()
