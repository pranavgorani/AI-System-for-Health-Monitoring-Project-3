'use client';

import React, { useState } from 'react';
import { Database, Upload, Download, Trash2, CheckCircle2, AlertTriangle, FileText, Check } from 'lucide-react';

const REQUIRED_COLUMNS = [
  'timestamp',
  'engine_id',
  'mission_id',
  'rpm',
  'cht',
  'egt',
  'oil_pressure',
  'oil_temperature',
  'fuel_flow',
  'vibration',
  'battery_voltage',
  'alternator_current',
  'injection_timing',
  'throttle',
  'altitude',
  'ambient_temperature',
  'ambient_pressure',
  'engine_load',
];

export default function DataManagementPage() {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [importedCount, setImportedCount] = useState(1450);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setValidationErrors(['File appears empty or does not contain a header line.']);
        setUploadStatus('FAILED');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const missing = REQUIRED_COLUMNS.filter((rc) => !headers.includes(rc));

      if (missing.length > 0) {
        setValidationErrors([
          `Schema Validation Failed: Missing ${missing.length} mandatory column(s): ${missing.join(', ')}`,
        ]);
        setUploadStatus('FAILED');
        setParsedRows([]);
      } else {
        setValidationErrors([]);
        setUploadStatus('SUCCESS');

        // Parse preview of first 5 rows
        const rows: Record<string, string>[] = [];
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const values = lines[i].split(',').map((v) => v.trim());
          const rowObj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx] || '';
          });
          rows.push(rowObj);
        }
        setParsedRows(rows);
        setImportedCount((prev) => prev + (lines.length - 1));
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const headers = REQUIRED_COLUMNS.join(',');
    const sampleRows = [
      '2026-09-20T10:00:00Z,AEGIS-ENG-001,MSN-2026-09,4650,122.4,745.2,4.2,92.1,19.5,3.2,28.2,32.0,24.2,65,6500,18.5,1013,72.4',
      '2026-09-20T10:00:01Z,AEGIS-ENG-001,MSN-2026-09,4655,122.6,746.0,4.2,92.2,19.6,3.1,28.2,32.1,24.2,65,6500,18.5,1013,72.5',
      '2026-09-20T10:00:02Z,AEGIS-ENG-001,MSN-2026-09,4648,122.5,745.8,4.1,92.1,19.4,3.3,28.1,31.9,24.2,65,6500,18.5,1013,72.3',
    ];
    const csvContent = [headers, ...sampleRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_aero_engine_telemetry.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>TELEMETRY DATA MANAGEMENT & CSV INGESTION</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Import, validate, preview, and map external UAV flight recorder CSV datasets into the digital twin telemetry pipeline.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow transition"
        >
          <Download className="w-4 h-4" />
          <span>Download Sample Dataset</span>
        </button>
      </div>

      {/* CSV Upload & Validation Area */}
      <div className="aerospace-panel p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
          INGEST EXTERNAL TELEMETRY CSV
        </h3>

        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center space-y-3 transition bg-slate-900/40">
          <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
          <div>
            <label className="cursor-pointer text-sm font-bold text-cyan-400 hover:text-cyan-300 underline">
              Choose CSV File to Upload
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
            <p className="text-xs text-slate-400 mt-1">
              Supports standard 18-column FADEC / black-box flight logs.
            </p>
          </div>
        </div>

        {/* Validation Feedback */}
        {uploadStatus === 'SUCCESS' && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Schema Validated Successfully. All 18 required telemetry parameters present.</span>
          </div>
        )}

        {uploadStatus === 'FAILED' && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Validation Error:</span>
            </div>
            {validationErrors.map((err, i) => (
              <p key={i} className="pl-6 font-mono text-[11px]">{err}</p>
            ))}
          </div>
        )}

        {/* Preview of Ingested Rows */}
        {parsedRows.length > 0 && (
          <div className="space-y-2 pt-4">
            <div className="text-xs font-mono text-slate-400 uppercase font-bold">
              Data Preview (First 5 Rows):
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono border border-slate-800">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    {Object.keys(parsedRows[0]).map((k) => (
                      <th key={k} className="p-2 border-b border-slate-800">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {parsedRows.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      {Object.values(r).map((v, j) => (
                        <td key={j} className="p-2 text-slate-300">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Database Storage Statistics */}
      <div className="aerospace-panel p-6 space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase">
          STORED TELEMETRY SAMPLES & DEMO DATASET REPOSITORY
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Telemetry Records Cached</span>
            <div className="text-2xl font-bold text-white">{importedCount.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-400">Storage status: Active Buffer</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Pre-loaded Synthetic Sets</span>
            <div className="text-2xl font-bold text-cyan-300">6 Sets</div>
            <span className="text-[10px] text-slate-500">Normal, Degraded, Thermal, Misfire...</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase">Database Persistence Mode</span>
            <div className="text-2xl font-bold text-amber-400">In-Memory / Local</div>
            <span className="text-[10px] text-slate-500">PostgreSQL Adapter Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
