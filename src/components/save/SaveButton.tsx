'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface SaveButtonProps {
  onSave: () => void | Promise<void>
  disabled?: boolean
  label?: string
  loadingLabel?: string
}

export default function SaveButton({
  onSave,
  disabled = false,
  label = "Publish Standard",
  loadingLabel = "Publishing..."
}: SaveButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePress = async () => {
    if (loading || disabled || !mounted) return
    setLoading(true)
    try {
      await onSave()
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePress}
      disabled={disabled || loading || !mounted}
      className="w-full bg-[#16A34A] text-white rounded-2xl py-4 font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  )
}
