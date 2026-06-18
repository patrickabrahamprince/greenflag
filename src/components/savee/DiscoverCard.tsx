'use client'

import { useEffect, useState } from 'react'

export default function DiscoverCard() {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    // SSR safe access to localStorage / window
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
  }, [])

  return (
    <div className="p-4 rounded-xl bg-surface border border-border">
      <h3 className="text-lg font-bold text-text">Discover Card</h3>
      <p className="text-xs text-text-muted">Theme: {theme}</p>
    </div>
  )
}
