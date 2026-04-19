'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useUser } from '@/providers/UserProvider';

export default function Topbar() {
   const { user, logout } = useUser()
   const router = useRouter()

   if (!user) return null

   async function handleLogout() {
      await logout()
      router.push('/login')
   }

   return (
      <header className="bg-card fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-3">
         <Link href={'/dashboard'} className="absolute left-0 flex items-center justify-center font-bold" style={{ width: '13.5rem' }}>
            <span className="relative">
               Virtual<span className='text-shy-moment'>Toolkit</span>
               <span className="absolute -bottom-1 -left-2 -right-2 h-px rounded-full bg-shy-moment/50" />
            </span>
         </Link>

         <div className="flex-1" />

         <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
               <button className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 text-sm outline-none">
                  <img
                     src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.username ?? 'guest'}`}
                     alt="Profile"
                     className="h-7 w-7 rounded-full object-cover"
                  />
                  <ChevronDown className="h-3.5 w-3.5" />
               </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
               <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="bg-card border-border/60 z-50 min-w-36 rounded-md border p-1 shadow-md"
               >
                  <DropdownMenu.Item
                     onSelect={handleLogout}
                     className="text-muted-foreground hover:text-foreground hover:bg-muted flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none"
                  >
                     <LogOut className="h-3.5 w-3.5" />
                     Log out
                  </DropdownMenu.Item>
               </DropdownMenu.Content>
            </DropdownMenu.Portal>
         </DropdownMenu.Root>
      </header>
   );
}
