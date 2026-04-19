"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  Globe,
  MapPin,
  Monitor,
  Smartphone,
  UserRound,
  Radio,
} from "lucide-react";
import { useVRChatAuth } from "@/providers/VRChatAuthProvider";
import { useDesktopEvents } from "@/hooks/useDesktopEvents";
import { cn } from "@/lib/utils";

interface InstanceUser {
  id: string;
  displayName: string;
  thumbnailUrl: string;
  platform: string;
  status: string;
  isFriend: boolean;
}

interface InstanceData {
  name: string;
  type: string;
  region: string;
  n_users: number;
  capacity: number;
  full: boolean;
  ownerId: string | null;
  tags: string[];
  platforms: { android: number; ios?: number; standalonewindows: number };
  users: InstanceUser[] | null;
  world: {
    name: string;
    description: string;
    authorName: string;
    thumbnailImageUrl: string;
  };
}

const instanceTypeLabel: Record<string, string> = {
  public: "Public",
  friends: "Friends",
  "friends+": "Friends+",
  invite: "Invite",
  "invite+": "Invite+",
  group: "Group",
  groupPublic: "Group Public",
  hidden: "Hidden",
};

const statusColors: Record<string, string> = {
  "join me": "bg-sky-400",
  active: "bg-emerald-400",
  "ask me": "bg-amber-400",
  busy: "bg-red-400",
  offline: "bg-zinc-500",
};

const eventLabels: Record<string, string> = {
  player_joined: "joined",
  player_left: "left",
  instance_changed: "moved to",
  avatar_changed: "now wearing",
};

function WorldThumbnail({ src, name }: { src: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className="bg-muted flex aspect-video w-full items-center justify-center rounded-lg">
        <Globe className="text-muted-foreground size-8" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className="aspect-video w-full rounded-lg object-cover"
    />
  );
}

function UserAvatar({ src, name }: { src: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <span className="bg-muted flex size-8 items-center justify-center rounded-full">
        <UserRound className="text-muted-foreground size-4" />
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className="size-8 rounded-full object-cover"
    />
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function VRChatInstancePage() {
  const { isConnected, isLoading: authLoading, openModal } = useVRChatAuth();
  const desktop = useDesktopEvents();
  const [instance, setInstance] = useState<InstanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fetchInstance() {
    setLoading(true);
    setError(null);
    fetch("/api/vrchat/instance/current")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setInstance(null);
        } else {
          setInstance(data);
        }
      })
      .catch(() => setError("Failed to fetch instance"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!isConnected) return;
    fetchInstance();
  }, [isConnected]);

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-border/60 bg-card flex flex-col items-center gap-4 rounded-xl border p-8 text-center shadow-lg">
          <p className="text-muted-foreground text-sm">
            Connect your VRChat account to use instance tools.
          </p>
          <button
            onClick={openModal}
            className="bg-shy-moment/90 hover:bg-shy-moment rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Connect VRChat
          </button>
        </div>
      </div>
    );
  }

  const langTags =
    instance?.tags
      .filter((t) => t.startsWith("language_"))
      .map((t) => t.replace("language_", "")) ?? [];

  const playerSource: "desktop" | "api" | null = desktop.connected
    ? "desktop"
    : instance?.users
      ? "api"
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Instance</h1>
          <p className="text-muted-foreground text-sm">Your current VRChat instance.</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
              desktop.connected
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                : "border-border/60 text-muted-foreground bg-muted/40",
            )}
          >
            <Radio className="size-3" />
            {desktop.connected ? "Desktop live" : "Desktop offline"}
          </span>
          {instance && (
            <button
              onClick={fetchInstance}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="border-border/60 bg-card flex h-48 items-center justify-center rounded-xl border">
          <RefreshCw className="text-muted-foreground size-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="border-border/60 bg-card flex h-48 items-center justify-center rounded-xl border">
          <p className="text-muted-foreground text-sm">
            {error === "Not currently in an instance"
              ? "You're not currently in an instance."
              : error}
          </p>
        </div>
      ) : instance ? (
        <div className="flex flex-col gap-4">
          <div className="border-border/60 bg-card rounded-xl border p-6">
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="w-full sm:w-56 sm:shrink-0">
                <WorldThumbnail src={instance.world.thumbnailImageUrl} name={instance.world.name} />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div>
                  <h2 className="text-base font-semibold">{instance.world.name}</h2>
                  <p className="text-muted-foreground text-sm">by {instance.world.authorName}</p>
                </div>

                {instance.world.description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {instance.world.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="border-border/60 bg-muted/40 flex items-center gap-1.5 rounded-md border px-2.5 py-1">
                    <Users className="size-3.5" />
                    {desktop.connected ? desktop.players.length : instance.n_users}
                    {instance.capacity ? ` / ${instance.capacity}` : ""}
                    {instance.full && (
                      <span className="text-destructive ml-1 font-medium">Full</span>
                    )}
                  </span>
                  <span className="border-border/60 bg-muted/40 flex items-center gap-1.5 rounded-md border px-2.5 py-1">
                    <Globe className="size-3.5" />
                    {instanceTypeLabel[instance.type] ?? instance.type}
                  </span>
                  <span className="border-border/60 bg-muted/40 flex items-center gap-1.5 rounded-md border px-2.5 py-1">
                    <MapPin className="size-3.5" />
                    {instance.region.toUpperCase()}
                  </span>
                  {instance.platforms.standalonewindows > 0 && (
                    <span className="border-border/60 bg-muted/40 flex items-center gap-1.5 rounded-md border px-2.5 py-1">
                      <Monitor className="size-3.5" />
                      {instance.platforms.standalonewindows} PC
                    </span>
                  )}
                  {(instance.platforms.android ?? 0) + (instance.platforms.ios ?? 0) > 0 && (
                    <span className="border-border/60 bg-muted/40 flex items-center gap-1.5 rounded-md border px-2.5 py-1">
                      <Smartphone className="size-3.5" />
                      {(instance.platforms.android ?? 0) + (instance.platforms.ios ?? 0)} Mobile
                    </span>
                  )}
                </div>

                {langTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {langTags.map((lang) => (
                      <span
                        key={lang}
                        className="border-border/60 bg-muted/40 rounded-md border px-2 py-0.5 text-xs capitalize"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-muted-foreground text-xs">{instance.name}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {playerSource && (
              <div className="border-border/60 bg-card rounded-xl border">
                <div className="border-border/60 flex items-center justify-between border-b px-4 py-3">
                  <h3 className="text-sm font-medium">
                    Players (
                    {playerSource === "desktop" ? desktop.players.length : instance.users!.length})
                  </h3>
                  {playerSource === "desktop" && (
                    <span className="text-muted-foreground text-xs">Live</span>
                  )}
                </div>
                <div className="divide-border/40 divide-y">
                  {playerSource === "desktop"
                    ? desktop.players.map((player) => (
                        <div
                          key={player.displayName}
                          className="flex items-center gap-3 px-4 py-2.5"
                        >
                          <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full">
                            <UserRound className="text-muted-foreground size-4" />
                          </span>
                          <span className="flex-1 truncate text-sm font-medium">
                            {player.displayName}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatTime(player.joinedAt)}
                          </span>
                        </div>
                      ))
                    : instance.users!.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 px-4 py-2.5">
                          <div className="relative shrink-0">
                            <UserAvatar src={user.thumbnailUrl} name={user.displayName} />
                            <span
                              className={cn(
                                "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-[hsl(var(--card))]",
                                statusColors[user.status] ?? "bg-zinc-500",
                              )}
                            />
                          </div>
                          <span className="flex-1 truncate text-sm font-medium">
                            {user.displayName}
                          </span>
                          {user.isFriend && (
                            <span className="text-muted-foreground text-xs">Friend</span>
                          )}
                          <span className="text-muted-foreground shrink-0">
                            {user.platform === "android" || user.platform === "ios" ? (
                              <Smartphone className="size-3.5" />
                            ) : (
                              <Monitor className="size-3.5" />
                            )}
                          </span>
                        </div>
                      ))}
                </div>
              </div>
            )}

            {desktop.connected && desktop.recentEvents.length > 0 && (
              <div className="border-border/60 bg-card rounded-xl border">
                <div className="border-border/60 border-b px-4 py-3">
                  <h3 className="text-sm font-medium">Recent Events</h3>
                </div>
                <div className="divide-border/40 divide-y">
                  {desktop.recentEvents.slice(0, 15).map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          ev.type === "player_joined" && "bg-emerald-400",
                          ev.type === "player_left" && "bg-red-400",
                          ev.type === "instance_changed" && "bg-sky-400",
                          ev.type === "avatar_changed" && "bg-amber-400",
                        )}
                      />
                      <span className="flex-1 truncate text-sm">
                        {ev.displayName && <span className="font-medium">{ev.displayName} </span>}
                        <span className="text-muted-foreground">
                          {eventLabels[ev.type]}
                          {ev.detail && ` ${ev.detail}`}
                        </span>
                      </span>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {formatTime(ev.ts)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
