'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home, LucideIcon, Gamepad, BookUser, HardDrive, MessageCircleDashed, UserSearch, Watch } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className="bg-card fixed top-14 bottom-0 left-0 z-40 flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{ width: collapsed ? '3.5rem' : '13.5rem' }}
    >
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        <SidebarButton label="Feed" icon={Home} link="/dashboard" active />
        <SidebarButton label="Magic Chatbox" icon={MessageCircleDashed} link="/dashboard" />
        <SidebarGroup label="VRChat" icon={Gamepad} collapsed={collapsed}>
          <SidebarButton label="Instance" icon={HardDrive} link="/dashboard" />
          <SidebarButton label="Social" icon={BookUser} link="/dashboard" />
          <SidebarButton label="Avatar Search" icon={UserSearch} link="/dashboard" />
        </SidebarGroup>
        <SidebarButton label="Wrist Overlay" icon={Watch} link="/dashboard" />
      </nav>

      <div className="shrink-0 mx-3 mb-3 flex items-center gap-2.5 rounded-md py-2 px-2.5 bg-background/60">
        <div className="shrink-0 bg-red-400 rounded-full w-2 h-2" />
        {!collapsed && <span className="text-sm text-muted-foreground whitespace-nowrap">Not connected</span>}
      </div>
    </aside>
  );
}

function SidebarButton({ label, icon: Icon, link, active }: { label: string; icon: LucideIcon; link: string; active?: boolean }) {
  return (
    <Link
      href={link}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-semibold transition-colors',
        active
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

function SidebarGroup({ label, icon: Icon, collapsed, children }: { label: string; icon: LucideIcon; collapsed: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{label}</span>
            <ChevronRight className={cn('size-3.5 transition-transform duration-200', open && 'rotate-90')} />
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="ml-3 pl-3 border-l border-border/50 mt-0.5 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}
