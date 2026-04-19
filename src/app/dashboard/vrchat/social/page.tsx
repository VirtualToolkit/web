'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, UserRound, ExternalLink, MoreHorizontal } from 'lucide-react'
import { useVRChatAuth } from '@/providers/VRChatAuthProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type UserStatus = 'active' | 'ask me' | 'busy' | 'join me' | 'offline'

interface Friend {
  id: string
  displayName: string
  status: UserStatus
  statusDescription: string
  currentAvatarThumbnailImageUrl?: string
  location: string
}

const statusConfig: Record<UserStatus, { label: string; dot: string }> = {
  'join me': { label: 'Join Me',  dot: 'bg-sky-400' },
  'active':    { label: 'Active',   dot: 'bg-emerald-400' },
  'ask me':  { label: 'Ask Me',   dot: 'bg-amber-400' },
  'busy':      { label: 'Busy',     dot: 'bg-red-400' },
  'offline':   { label: 'Offline',  dot: 'bg-zinc-500' },
}

function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.offline
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-2 rounded-full', cfg.dot)} />
      <span className="text-muted-foreground text-sm">{cfg.label}</span>
    </span>
  )
}

function AvatarThumb({ src, name }: { src?: string; name: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <span className="bg-muted flex size-8 items-center justify-center rounded-full">
        <UserRound className="text-muted-foreground size-4" />
      </span>
    )
  }
  return (
    <span className="block size-8 shrink-0 overflow-hidden rounded-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className="size-full object-cover"
      />
    </span>
  )
}

export default function VRChatSocialPage() {
  const { isConnected, isLoading: authLoading, openModal } = useVRChatAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [showOffline, setShowOffline] = useState(false)

  function fetchFriends(offline: boolean) {
    setLoading(true)
    fetch(`/api/vrchat/social/friends?offline=${offline}`)
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? setFriends(data) : setFriends([])))
      .catch(() => setFriends([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isConnected) return
    fetchFriends(showOffline)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, showOffline])

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="text-muted-foreground size-5 animate-spin" />
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-border/60 bg-card flex flex-col items-center gap-4 rounded-xl border p-8 text-center shadow-lg">
          <div className="bg-shy-moment/15 text-shy-moment flex size-10 items-center justify-center rounded-lg">
            <UserRound className="size-5" />
          </div>
          <div>
            <p className="font-medium">VRChat not connected</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Connect your account to see your friends list.
            </p>
          </div>
          <Button onClick={openModal} className="bg-shy-moment/90 hover:bg-shy-moment text-white">
            Connect VRChat
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Social</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOffline((v) => !v)}
          >
            {showOffline ? 'Online only' : 'Show offline'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchFriends(showOffline)}
            disabled={loading}
          >
            <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      <div className="border-border/60 bg-card rounded-xl border">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <RefreshCw className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : friends.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground text-sm">No friends found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border/60 border-b">
                <th className="text-muted-foreground w-10 py-3 pl-4 text-left font-medium" />
                <th className="text-muted-foreground py-3 pl-3 pr-4 text-left font-medium">
                  Display Name
                </th>
                <th className="text-muted-foreground py-3 pr-4 text-left font-medium">Status</th>
                <th className="text-muted-foreground hidden py-3 pr-4 text-left font-medium md:table-cell">
                  Note
                </th>
                <th className="text-muted-foreground py-3 pr-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {friends.map((friend, i) => (
                <tr
                  key={friend.id}
                  className={cn(
                    'hover:bg-muted/40 transition-colors',
                    i !== friends.length - 1 && 'border-border/40 border-b',
                  )}
                >
                  <td className="py-3 pl-4">
                    <AvatarThumb
                      src={friend.currentAvatarThumbnailImageUrl}
                      name={friend.displayName}
                    />
                  </td>
                  <td className="py-3 pl-3 pr-4 font-medium">{friend.displayName}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={friend.status} />
                  </td>
                  <td className="text-muted-foreground hidden py-3 pr-4 md:table-cell">
                    {friend.statusDescription || '—'}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild title="Open VRChat profile">
                        <a
                          href={`https://vrchat.com/home/user/${friend.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="More actions">
                        <MoreHorizontal className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
