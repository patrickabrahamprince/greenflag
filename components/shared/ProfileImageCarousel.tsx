'use client'

import { useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProfileImageCarouselProps {
  images: (string | null | undefined)[]
}

export function ProfileImageCarousel({ images }: ProfileImageCarouselProps) {
  const validImages = images.filter(Boolean) as string[]
  const total = validImages.length

  const [mainIdx, setMainIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  if (total === 0) return null

  const mainImage = validImages[mainIdx]

  const otherIndices: number[] = []
  for (let i = 0; i < total; i++) {
    if (i !== mainIdx && otherIndices.length < 2) {
      otherIndices.push(i)
    }
  }

  const handleSwipe = (dx: number, dy: number) => {
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      setMainIdx(prev => {
        if (dx > 0) return (prev - 1 + total) % total
        return (prev + 1) % total
      })
    }
  }

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx)
    setLightboxOpen(true)
  }

  const handleMainClick = () => openLightbox(mainIdx)

  const handleSmallClick = (idx: number) => {
    setMainIdx(idx)
  }

  return (
    <>
      <div
        className="select-none relative"
        onTouchStart={e => {
          touchStartX.current = e.touches[0].clientX
          touchStartY.current = e.touches[0].clientY
        }}
        onTouchEnd={e => {
          if (touchStartX.current === null) return
          handleSwipe(
            e.changedTouches[0].clientX - touchStartX.current,
            e.changedTouches[0].clientY - (touchStartY.current ?? 0),
          )
          touchStartX.current = null
          touchStartY.current = null
        }}
      >
        {total === 1 ? (
          <div
            className="relative overflow-hidden cursor-pointer w-full"
            style={{ aspectRatio: '3/4', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            onClick={handleMainClick}
          >
            <img
              src={mainImage}
              alt=""
              className="w-full h-full object-cover"
              onError={e => { e.currentTarget.src = '/placeholder-avatar.svg' }}
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <div
              className="relative overflow-hidden cursor-pointer flex-[0_0_65%]"
              style={{ aspectRatio: '3/4', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              onClick={handleMainClick}
            >
              {total > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setMainIdx(prev => (prev - 1 + total) % total) }}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setMainIdx(prev => (prev + 1) % total) }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </>
              )}
              <img
                src={mainImage}
                alt=""
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.src = '/placeholder-avatar.svg' }}
              />
            </div>
            <div className="flex flex-col gap-2 flex-[0_0_calc(35%-8px)]">
              {otherIndices.map((imgIdx) => (
                <div
                  key={imgIdx}
                  className="relative overflow-hidden cursor-pointer flex-1"
                  style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  onClick={() => handleSmallClick(imgIdx)}
                >
                  <img
                    src={validImages[imgIdx]}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = '/placeholder-avatar.svg' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center gap-1.5 z-10">
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setMainIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === mainIdx ? 'bg-[#00C853] w-5' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          {total > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIdx(prev => (prev - 1 + total) % total) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setLightboxIdx(prev => (prev + 1) % total) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
          <img
            src={validImages[lightboxIdx]}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
            onError={e => { e.currentTarget.src = '/placeholder-avatar.svg' }}
          />
        </div>
      )}
    </>
  )
}
