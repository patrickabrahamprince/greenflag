'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IntentionsGrid } from '@/components/IntentionsGrid'
import { supabase } from '@/lib/supabase'
import { IntentionId } from '@/lib/task-templates'
import { Loader2 } from 'lucide-react'

export default function OnboardingInterests() {
  const [interests, setInterests] = useState<IntentionId[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleInterest = (id: IntentionId) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleContinue = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ interests })
          .eq('id', user.id)
        if (error) {
          alert(error.message || "Failed to update interests")
          setLoading(false)
          return
        }
      }
      router.push('/discover')
    } catch {
      alert("Something went wrong saving interests.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 pb-32 min-h-screen bg-[#0A0A0A] text-text flex flex-col">
      <div className="flex-1">
        <IntentionsGrid
          selected={interests}
          onToggle={toggleInterest}
          max={8}
          min={3}
          title="What are you into?"
          subtitle="Pick at least 3. We'll show Standards matching your vibe."
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0A0A0A]/95 border-t border-border backdrop-blur-lg">
        <button
          onClick={handleContinue}
          disabled={interests.length < 3 || loading}
          className="w-full bg-[#16A34A] text-white rounded-2xl py-4 font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Continue
        </button>
      </div>
    </div>
  )
}
