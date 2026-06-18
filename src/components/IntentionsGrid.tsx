'use client'
import { INTENTION_CONFIG, IntentionId } from '@/lib/task-templates'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function IntentionsGrid({
  selected,
  onToggle,
  max = 3,
  min = 1,
  lang = 'en',
  title,
  subtitle,
  showCounter = true
}: {
  selected: IntentionId[]
  onToggle: (id: IntentionId) => void
  max?: number
  min?: number
  lang?: 'en' | 'hi'
  title: string
  subtitle: string
  showCounter?: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold leading-tight text-text">{title}</h1>
        <p className="text-text-muted text-base">{subtitle}</p>
        {showCounter && (
          <div className="text-sm font-medium text-[#16A34A]">
            {selected.length} of {max} selected
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INTENTION_CONFIG.map(item => {
          const isSelected = selected.includes(item.id)
          const isDisabled = !isSelected && selected.length >= max

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !isDisabled && onToggle(item.id)}
              disabled={isDisabled}
              className={cn(
                "relative rounded-2xl border-2 p-5 text-left transition-all duration-200 cursor-pointer",
                "active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
                isSelected
                  ? "border-[#16A34A] bg-[#16A34A]/[0.08]"
                  : "border-border bg-surface hover:border-border-hover/80"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 bg-[#16A34A] rounded-full p-1">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="font-semibold text-sm leading-tight text-text">
                {lang === 'hi' ? item.label_hi : item.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
