'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/lib/useAppState';
import {
  LayoutDashboard,
  Cpu,
  HeartPulse,
  Activity,
  Brain,
  Hourglass,
  PlaneTakeoff,
  History,
  AlertOctagon,
  Flame,
  Wrench,
  LineChart,
  Gauge,
  Bell,
  FileText,
  Binary,
  Database,
  Sliders,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const state = useAppState();
  const [collapsed, setCollapsed] = React.useState(false);

  const activeAlertsCount = state.alerts.filter((a) => !a.acknowledged).length;
  const pendingAdvisories = state.maintenanceAdvisories.filter((m) => m.status === 'PENDING').length;
  const activeFaultCount = state.faults.length;

  const sections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Executive Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Live Digital Twin', href: '/digital-twin', icon: Cpu },
        { name: 'Engine Health Index', href: '/health', icon: HeartPulse },
        { name: 'Real-Time Telemetry', href: '/telemetry', icon: Activity },
      ],
    },
    {
      title: 'AI & DIAGNOSTICS',
      items: [
        { name: 'AI Diagnostics (XAI)', href: '/diagnostics', icon: Brain },
        { name: 'RUL Prediction', href: '/rul', icon: Hourglass },
        { name: 'Fault Analysis', href: '/fault-analysis', icon: AlertOctagon, badge: activeFaultCount > 0 ? activeFaultCount : undefined },
        { name: 'Fault Injection Lab', href: '/fault-lab', icon: Flame },
      ],
    },
    {
      title: 'MISSION & SENSORS',
      items: [
        { name: 'Mission Simulator', href: '/mission-simulator', icon: PlaneTakeoff },
        { name: 'Mission Replay', href: '/mission-replay', icon: History },
        { name: 'Software CAN Bus', href: '/can-bus', icon: Binary },
      ],
    },
    {
      title: 'MAINTENANCE & DATA',
      items: [
        { name: 'Maintenance Advisory', href: '/maintenance', icon: Wrench, badge: pendingAdvisories > 0 ? pendingAdvisories : undefined },
        { name: 'Historical Trends', href: '/historical-trends', icon: LineChart },
        { name: 'Engine Performance', href: '/performance', icon: Gauge },
        { name: 'Alerts Center', href: '/alerts', icon: Bell, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
        { name: 'Mission Reports', href: '/reports', icon: FileText },
      ],
    },
    {
      title: 'SYSTEM CONTROL',
      items: [
        { name: 'System Architecture', href: '/architecture', icon: Layers },
        { name: 'Data Management', href: '/data-management', icon: Database },
        { name: 'Admin & Parameters', href: '/admin', icon: Sliders },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#080d1a] border-r border-slate-800 transition-all duration-200 flex flex-col justify-between shrink-0 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full overflow-y-auto py-3">
        {/* Navigation Sections */}
        <div className="space-y-4 px-2">
          {sections.map((sec) => (
            <div key={sec.title}>
              {!collapsed && (
                <div className="px-3 mb-1 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                  {sec.title}
                </div>
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{item.name}</span>
                          {item.badge !== undefined && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Toggle & Disclaimer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#060a14] space-y-2">
        {!collapsed && (
          <div className="text-[10px] font-mono text-slate-500 leading-tight">
            <span className="text-cyan-400/80 font-bold block">DRDO / iDEX MALE UAV</span>
            PROPULSION DIGITAL TWIN DEMONSTRATOR
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
