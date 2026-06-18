'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IntentionsGrid } from '@/components/IntentionsGrid'
import { INTENTION_CONFIG, IntentionId } from '@/lib/task-templates'
import { supabase } from '@/lib/supabase'
import { Loader2, Shuffle, Camera, Video, Music, MapPin, ArrowLeft, Trash2, Edit2, RefreshCw, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SaveButton from '@/components/save/SaveButton'

type TaskItem = {
  day_number: number
  task_type: 'photo' | 'video' | 'voice' | 'location'
  title: string
  description: string
  verification_hint?: string
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export default function CreateStandard() {
  const [mounted, setMounted] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [step, setStep] = useState<'intentions' | 'edit-tasks'>('intentions')
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const [intentions, setIntentions] = useState<IntentionId[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleGenerate = async () => {
    if (intentions.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch("/api/generate-standard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentions })
      })
      const data = await res.json()
      if (res.ok && data.tasks) {
        setTasks(data.tasks)
        const labels = intentions.map(i => INTENTION_CONFIG.find(c => c.id === i)?.label).join(' & ')
        setTitle(`Looking for ${labels} Partner`)
        setStep('edit-tasks')
      } else {
        setError(data.error || "Failed to generate tasks")
      }
    } catch {
      setError("Something went wrong while generating tasks.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshTask = async (index: number, dayNumber: number) => {
    try {
      setError('')
      const { data, error: dbErr } = await supabase
        .from('task_templates')
        .select('*')
        .in('intention', intentions)
        .eq('day_number', dayNumber)
      
      if (dbErr) throw dbErr
      
      if (data && data.length > 0) {
        const currentTitle = tasks[index]?.title
        const candidates = data.filter(t => t.title !== currentTitle)
        const chosen = candidates.length > 0 
          ? getRandomElement(candidates) 
          : getRandomElement(data)

        const updated = [...tasks]
        updated[index] = {
          day_number: dayNumber,
          task_type: chosen.task_type,
          title: chosen.title,
          description: chosen.description,
          verification_hint: chosen.verification_hint || ''
        }
        setTasks(updated)
      } else {
        // Fallback local random tasks
        const fallbacks = [
          { task_type: "photo" as const, title: "Selfie Check", description: "Daily selfie with timestamp" },
          { task_type: "voice" as const, title: "Voice Journal", description: "Speak about your highlights today" },
          { task_type: "location" as const, title: "Favorite Outdoor Spot", description: "Share your outdoor location" }
        ]
        const chosen = getRandomElement(fallbacks)
        const updated = [...tasks]
        updated[index] = {
          day_number: dayNumber,
          task_type: chosen.task_type,
          title: chosen.title,
          description: chosen.description,
          verification_hint: ''
        }
        setTasks(updated)
      }
    } catch (err: any) {
      console.error(err)
      setError("Could not refresh task.")
    }
  }

  const handleDeleteTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index))
    if (editingIndex === index) setEditingIndex(null)
  }

  const handleAddTask = () => {
    if (tasks.length >= 8) return
    const nextDay = tasks.length + 1
    const newTask: TaskItem = {
      day_number: nextDay,
      task_type: 'photo',
      title: 'New Task',
      description: 'Perform a task and upload a photo proof.',
      verification_hint: ''
    }
    setTasks(prev => [...prev, newTask])
    setEditingIndex(tasks.length)
  }

  const handleUpdateTaskField = (index: number, field: keyof TaskItem, value: any) => {
    const updated = [...tasks]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setTasks(updated)
  }

  const handleSave = async () => {
    setError('')
    if (tasks.length !== 8) {
      setError(lang === "hi" ? "कृपया कुल 8 टास्क पूरा करें।" : "Exactly 8 tasks are required to publish.")
      return
    }
    if (!title.trim()) {
      setError(lang === "hi" ? "स्टैंडर्ड का नाम आवश्यक है।" : "Standard name is required.")
      return
    }
    
    setSaving(true)
    try {
      const res = await fetch("/api/save-standard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, intentions, tasks, language: lang }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/your-standards')
      } else {
        setError(data.error || "Failed to publish standard")
        setSaving(false)
      }
    } catch {
      setError("Something went wrong while saving.")
      setSaving(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#16A34A] border-t-transparent animate-spin" />
      </div>
    )
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
        {error && <p className="text-xs text-red-500 mt-4 text-center">{error}</p>}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0A0A0A]/95 border-t border-border backdrop-blur-lg">
          <button
            onClick={handleGenerate}
            disabled={intentions.length === 0 || loading}
            className="w-full bg-[#16A34A] text-white rounded-2xl py-4 font-semibold text-base disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
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
        <div className="text-sm font-semibold text-[#16A34A]">
          {tasks.length} of 8 Tasks
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs text-text-muted uppercase tracking-wider font-semibold">
            {lang === "hi" ? "स्टैंडर्ड का नाम" : "Standard Name"}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-text focus:outline-none focus:border-[#16A34A] transition-all font-semibold"
          />
        </div>

        {error && <p className="text-xs text-red-500 text-center font-medium bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">{error}</p>}

        {/* EditableTaskList */}
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {tasks.map((task, index) => {
              const isEditing = editingIndex === index
              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-surface border border-border rounded-2xl overflow-hidden transition-all"
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 flex items-center justify-center shrink-0">
                      {task.task_type === "photo" ? (
                        <Camera className="w-4 h-4 text-[#16A34A]" />
                      ) : task.task_type === "video" ? (
                        <Video className="w-4 h-4 text-[#16A34A]" />
                      ) : task.task_type === "voice" ? (
                        <Music className="w-4 h-4 text-[#16A34A]" />
                      ) : (
                        <MapPin className="w-4 h-4 text-[#16A34A]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-[#16A34A] font-bold">
                        {lang === "hi" ? `दिन ${task.day_number || index + 1}` : `Day ${task.day_number || index + 1}`}
                      </div>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => handleUpdateTaskField(index, 'title', e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-text border-none focus:outline-none p-0 mt-0.5 focus:border-[#16A34A] transition-all"
                        placeholder="Task Title"
                      />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingIndex(isEditing ? null : index)}
                        className={`p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer ${isEditing ? 'text-[#16A34A]' : 'text-text-muted'}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRefreshTask(index, task.day_number || index + 1)}
                        className="p-2 rounded-lg hover:bg-white/5 text-text-muted transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(index)}
                        className="p-2 rounded-lg hover:bg-white/5 text-red-500/70 hover:text-red-500 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t border-border bg-[#161616]/40 p-4 space-y-3 text-xs"
                    >
                      <div className="space-y-1">
                        <label className="text-text-muted font-medium">Task Type</label>
                        <select
                          value={task.task_type}
                          onChange={(e) => handleUpdateTaskField(index, 'task_type', e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-[#222] border border-border text-text focus:outline-none focus:border-[#16A34A] cursor-pointer"
                        >
                          <option value="photo">Photo Upload</option>
                          <option value="video">Video Upload</option>
                          <option value="voice">Voice Note</option>
                          <option value="location">Location Pin</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-text-muted font-medium">Instruction / Description</label>
                        <textarea
                          rows={2}
                          value={task.description}
                          onChange={(e) => handleUpdateTaskField(index, 'description', e.target.value)}
                          className="w-full p-3 rounded-lg bg-[#222] border border-border text-text focus:outline-none focus:border-[#16A34A] resize-none"
                          placeholder="What should they do?"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-text-muted font-medium">Verification Hint (Optional)</label>
                        <input
                          type="text"
                          value={task.verification_hint || ''}
                          onChange={(e) => handleUpdateTaskField(index, 'verification_hint', e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-[#222] border border-border text-text focus:outline-none focus:border-[#16A34A]"
                          placeholder="e.g. Must show watermark"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {tasks.length < 8 && (
          <button
            onClick={handleAddTask}
            className="w-full py-4 border border-dashed border-border rounded-2xl text-xs font-semibold text-text-muted hover:text-text hover:border-text-muted/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {lang === "hi" ? "टास्क जोड़ें" : "Add Task"}
          </button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0A0A0A]/95 border-t border-border backdrop-blur-lg">
        <SaveButton
          onSave={handleSave}
          disabled={saving}
          label={lang === "hi" ? "पब्लिश करें" : "Publish"}
          loadingLabel={lang === "hi" ? "पब्लिश हो रहा है..." : "Publishing..."}
        />
      </div>
    </div>
  )
}
