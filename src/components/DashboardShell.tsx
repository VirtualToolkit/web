'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { DesktopConnectionProvider } from '@/providers/DesktopConnectionProvider';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <DesktopConnectionProvider>
      <div className="flex min-h-[calc(100vh-3.5rem)] bg-card">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
        <div
          className="flex-1 rounded-tl-[.5rem] border-l border-t border-shy-moment bg-background transition-[margin-left] duration-300 ease-in-out"
          style={{ marginLeft: collapsed ? '3.5rem' : '13.5rem' }}
        >
          <div className="p-6">{children}</div>
        </div>
      </div>
    </DesktopConnectionProvider>
  );
}
