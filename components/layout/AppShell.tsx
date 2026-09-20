'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { HackathonTourModal } from '../demo/HackathonTourModal';
import { usePathname } from 'next/navigation';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [isHackathonTourOpen, setIsHackathonTourOpen] = useState(false);

  // If on landing page '/' or login page '/login', render clean without command sidebar
  const isMinimalView = pathname === '/' || pathname === '/login';

  if (isMinimalView) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Command Header */}
      <Header onOpenHackathonModal={() => setIsHackathonTourOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#080d19] aerospace-grid">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>

          {/* Research Demonstrator Footer */}
          <footer className="max-w-7xl mx-auto mt-12 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="text-cyan-400 font-semibold">AEGIS-TWIN</span> | DRDO / iDEX Aero Piston Engine Health Demonstrator
            </div>
            <div className="text-center sm:text-right">
              AEGIS-TWIN is a software demonstrator using simulated/synthetic engine data. It is intended for research, development and demonstration purposes and is not a certified flight-control or safety-critical system.
            </div>
          </footer>
        </main>
      </div>

      {/* Guided Hackathon Tour Modal */}
      <HackathonTourModal
        isOpen={isHackathonTourOpen}
        onClose={() => setIsHackathonTourOpen(false)}
      />
    </div>
  );
};
