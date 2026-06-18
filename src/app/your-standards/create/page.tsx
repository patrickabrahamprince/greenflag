'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IntentionsGrid } from '@/components/IntentionsGrid'
import { generateTasksFromIntentions } from '@/lib/generate-tasks'
import { INTENTION_CONFIG, IntentionId } from '@/lib/task-templates'
import { parseTaskDescription } from "@/lib/task-utils"
import { supabase } from '@/lib/supabase'
import { Loader2, Shuffle, Camera, Video, Music, MapPin, ArrowLeft } from 'lucide-react'

export default function CreateStandard() {
  const [authLoading, setAuthLoading] = useState(true)
  const [step, setStep] = useState<'intentions' | 'preview'>('intentions')
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const [intentions, setIntentions] = useState<IntentionId[]>([])
  const [tasks, setTasks] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login")

      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!data || data.role !== "woman") {
            router.replace("/discover")
            return
          }
          setAuthLoading(false)
        })
    })
  }, [router])

  const toggleIntention = (id: IntentionId) => {
    setIntentions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleGenerate = () => {
    if (intentions.length === 0) return
    const generated = generateTasksFromIntentions(intentions)
    setTasks(generated)
    const labels = intentions.map(i => INTENTION_CONFIG.find(c => c.id === i)?.label).join(' & ')
    setTitle(`Looking for ${labels} Partner`)
    setStep('preview')
  }

  const handleShuffle = () => {
    const generated = generateTasksFromIntentions(intentions)
    setTasks(generated)
  }

  const handleSave = async () => {
    if (intentions.length === 0 || tasks.length !== 8 || !title.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/standards/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, intentions, tasks, language: lang }),
      })
      if (res.ok) {
        router.push('/your-standards')
      } else {
        const data = await res.json()
        alert(data.error || "Failed to publish standard")
        setLoading(false)
      }
    } catch {
      alert("Something went wrong")
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#16A34A] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (step === 'intentions') {
    return (
      <div className="max-w-md mx-auto p-6 pb-32 min-h-screen bg-[#0A0A0A] text-text">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 border border-border flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </button>
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-border text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer text-[#16A34A]"
          >
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
        </div>

        <IntentionsGrid
          selected={intentions}
          onToggle={toggleIntention}
          max={3}
          min={1}
          lang={lang}
          title={lang === "hi" ? "आपका स्टैंडर्ड किस बारे में है?" : "What's your Standard about?"}
          subtitle={lang === "hi" ? "1-3 इरादे (Intentions) चुनें। पुरुष ये देखेंगे।" : "Pick 1-3 intentions. Men with matching interests will see you first."}
        />
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0A0A0A]/95 border-t border-border backdrop-blur-lg">
          <button
            onClick={handleGenerate}
            disabled={intentions.length === 0}
            className="w-full bg-[#16A34A] text-white rounded-2xl py-4 font-semibold text-base disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-[0.98]"
          >
            {lang === "hi" ? "टास्क बनाएं" : "Generate Tasks"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 pb-32 min-h-screen bg-[#0A0A0A] text-text">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setStep('intentions')}
          className="w-10 h-10 rounded-full bg-white/5 border border-border flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </button>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-2 text-xs font-semibold text-[#16A34A] cursor-pointer hover:underline"
        >
          <Shuffle className="w-4 h-4" /> {lang === "hi" ? "फिर से शफल करें" : "Shuffle Again"}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
            {lang === "hi" ? "स्टैंडर्ड" : "Standard"}
          </p>
          <h1 className="text-xl font-bold mt-1">{title}</h1>
        </div>

        <div className="space-y-3">
          {tasks.map((taskStr, i) => {
            const detail = parseTaskDescription(taskStr)
            return (
              <div
                key={i}
                className="flex items-start gap-4 bg-surface border border-border rounded-2xl p-4 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 flex items-center justify-center shrink-0 mt-0.5">
                  {detail.verification_method === "photo" ? (
                    <Camera className="w-4 h-4 text-[#16A34A]" />
                  ) : detail.verification_method === "video" ? (
                    <Video className="w-4 h-4 text-[#16A34A]" />
                  ) : detail.verification_method === "voice" ? (
                    <Music className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <MapPin className="w-4 h-4 text-[#16A34A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-semibold text-xs">
                      {lang === "hi" ? `दिन ${i + 1}` : `Day ${i + 1}`}
                    </span>
                    <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-full">
                      {detail.time_estimate}
                    </span>
                    {i === 4 && (
                      <span className="text-[#16A34A] text-[10px] font-semibold uppercase tracking-wider ml-auto">
                        {lang === "hi" ? "चैट अनलॉक" : "Messages unlock"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-text mt-1">{detail.title}</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{detail.instruction}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0A0A0A]/95 border-t border-border backdrop-blur-lg">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#16A34A] text-white rounded-2xl py-4 font-semibold text-base flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {lang === "hi" ? "पब्लिश करें" : "Go Live"}
        </button>
      </div>
    </div>
  )
}
