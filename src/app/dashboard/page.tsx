"use client";

import { useEffect, useState } from "react";
import { Users, UserRound, MessageSquare, Layers } from "lucide-react";
import Link from "next/link";
import { useVRChatAuth } from "@/providers/VRChatAuthProvider";
import VRChatGate from "@/components/VRChatGate";
import { cn } from "@/lib/utils";

type UserStatus = "active" | "ask me" | "busy" | "join me" | "offline";

interface Friend {
  id: string;
  status: UserStatus;
}

interface StatusCounts {
  total: number;
  joinMe: number;
  active: number;
  busy: number;
  askMe: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: string;
  loading?: boolean;
}) {
  return (
    <div className="border-border/60 bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span
          className={cn("flex size-7 items-center justify-center rounded-lg", accent ?? "bg-muted")}
        >
          <Icon className="size-3.5" />
        </span>
      </div>
      {loading ? (
        <div className="bg-muted h-7 w-12 animate-pulse rounded" />
      ) : (
        <span className="text-2xl font-semibold">{value}</span>
      )}
    </div>
  );
}

function VRChatStats() {
  const { isConnected } = useVRChatAuth();
  const [counts, setCounts] = useState<StatusCounts | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected) return;
    setLoading(true);
    fetch("/api/vrchat/social/friends?offline=false")
      .then((r) => r.json())
      .then((data: Friend[]) => {
        if (!Array.isArray(data)) return;
        const counts: StatusCounts = {
          total: data.length,
          joinMe: 0,
          active: 0,
          busy: 0,
          askMe: 0,
        };
        for (const f of data) {
          if (f.status === "join me") counts.joinMe++;
          else if (f.status === "active") counts.active++;
          else if (f.status === "busy") counts.busy++;
          else if (f.status === "ask me") counts.askMe++;
        }
        setCounts(counts);
      })
      .catch(() => setCounts(null))
      .finally(() => setLoading(false));
  }, [isConnected]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Friends Online"
        value={counts?.total ?? 0}
        icon={Users}
        accent="bg-emerald-500/15 text-emerald-500"
        loading={loading}
      />
      <StatCard
        label="Join Me"
        value={counts?.joinMe ?? 0}
        icon={UserRound}
        accent="bg-sky-500/15 text-sky-500"
        loading={loading}
      />
      <StatCard
        label="Active"
        value={counts?.active ?? 0}
        icon={UserRound}
        accent="bg-emerald-500/15 text-emerald-500"
        loading={loading}
      />
      <StatCard
        label="Busy"
        value={counts?.busy ?? 0}
        icon={UserRound}
        accent="bg-red-500/15 text-red-500"
        loading={loading}
      />
    </div>
  );
}

const tools = [
  {
    href: "/dashboard/vrchat/social",
    icon: Users,
    label: "Social",
    description: "Friends list & status",
  },
  {
    href: "/dashboard/vrchat/instance",
    icon: Layers,
    label: "Instance Browser",
    description: "Browse public instances",
  },
  {
    href: "/dashboard/magic-chatbox",
    icon: MessageSquare,
    label: "Magic Chatbox",
    description: "Custom OSC messages",
  },
];

export default function Dashboard_Index() {
  const { displayName, avatarUrl } = useVRChatAuth();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        {avatarUrl && (
          <span className="block size-10 shrink-0 overflow-hidden rounded-full">
            <img src={avatarUrl} alt={displayName ?? ""} className="size-full object-cover" />
          </span>
        )}
        <div>
          <h1 className="text-lg font-semibold">
            {displayName ? `Hey, ${displayName}` : "Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm">Here's what's going on.</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">VRChat</h2>
        <VRChatGate>
          <VRChatStats />
        </VRChatGate>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Tools</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="border-border/60 bg-card hover:bg-muted/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
            >
              <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
                <tool.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{tool.label}</p>
                <p className="text-muted-foreground text-xs">{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
