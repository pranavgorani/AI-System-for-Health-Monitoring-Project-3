'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setRole } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { Shield, Lock, User, ArrowRight, Plane, Info } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [username, setUsername] = useState('admin.drdo@aegis.mil');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
    router.push('/dashboard');
  };

  const handleDemoPreset = (role: UserRole, user: string) => {
    setSelectedRole(role);
    setUsername(user);
    setRole(role);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070b14] aerospace-grid">
      <div className="w-full max-w-md bg-[#0c1220]/95 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2">
            <Plane className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider font-mono">
            AEGIS-TWIN
          </h1>
          <p className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest">
            DRDO / iDEX MALE UAV Propulsion Health Platform
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
              Operator Callsign / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
              Security Token / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
              Operational Role Clearance
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
            >
              <option value="ADMIN">ADMIN (Full GCS & Simulation Control)</option>
              <option value="OPERATOR">OPERATOR (Live Telemetry & Mission Tracking)</option>
              <option value="MAINTENANCE_ENGINEER">MAINTENANCE ENGINEER (Faults & RUL)</option>
              <option value="ANALYST">ANALYST (Historical Analytics & Reports)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition"
          >
            <span>Authenticate Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Roles Quick Select */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click to auto-authenticate in Demo Mode:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => handleDemoPreset('ADMIN', 'admin.drdo@aegis.mil')}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-cyan-300 hover:border-cyan-400 transition"
            >
              <div className="font-bold">ADMIN</div>
              <div className="text-[10px] text-slate-500 truncate">admin.drdo@...</div>
            </button>
            <button
              onClick={() => handleDemoPreset('OPERATOR', 'operator.gcs@aegis.mil')}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-emerald-300 hover:border-emerald-400 transition"
            >
              <div className="font-bold">OPERATOR</div>
              <div className="text-[10px] text-slate-500 truncate">operator.gcs@...</div>
            </button>
            <button
              onClick={() => handleDemoPreset('MAINTENANCE_ENGINEER', 'maint.eng@aegis.mil')}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-amber-300 hover:border-amber-400 transition"
            >
              <div className="font-bold">MAINT ENG</div>
              <div className="text-[10px] text-slate-500 truncate">maint.eng@...</div>
            </button>
            <button
              onClick={() => handleDemoPreset('ANALYST', 'analyst.flight@aegis.mil')}
              className="p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left text-indigo-300 hover:border-indigo-400 transition"
            >
              <div className="font-bold">ANALYST</div>
              <div className="text-[10px] text-slate-500 truncate">analyst.flight@...</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
