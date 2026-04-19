'use client';

import { Button } from "@/components/ui/button";
import { useVRChatAuth } from "@/providers/VRChatAuthProvider";
import { RefreshCw, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VRChatSocialProfilePage() {
    const { isConnected, isLoading: authLoading, openModal } = useVRChatAuth()
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>({}); // TODO: add type

    function fetchByID() {
        setLoading(true);
        fetch(`/api/vrchat/user/by_id?id=${id}`)
            .then(r => r.json())
            .then(data => setData(data))
            .catch(() => setData({}))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        if (!isConnected) return;
        fetchByID();
    }, [isConnected]);

    if (authLoading || loading) {
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

    return <>{data.displayName}</>
}