'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface DesktopConnectionContextValue {
  isConnected: boolean
}

const DesktopConnectionContext = createContext<DesktopConnectionContextValue>({ isConnected: false })

export function DesktopConnectionProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/desktop/status')
        if (res.ok) setIsConnected((await res.json()).connected)
      } catch {}
    }

    check()
    const id = setInterval(check, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <DesktopConnectionContext.Provider value={{ isConnected }}>
      {children}
    </DesktopConnectionContext.Provider>
  )
}

export function useDesktopConnection() {
  return useContext(DesktopConnectionContext)
}
