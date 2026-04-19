"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import DevPanel from "./DevPanel";

const isDev = process.env.NODE_ENV !== "production";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-card flex min-h-[calc(100vh-3.5rem)]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className="border-shy-moment bg-background flex-1 rounded-tl-[.5rem] border-t border-l transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: collapsed ? "3.5rem" : "13.5rem" }}
      >
        <div className="p-6">{children}</div>
      </div>
      {isDev && <DevPanel />}
    </div>
  );
}
