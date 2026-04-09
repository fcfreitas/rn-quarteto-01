'use client'

import { useEffect, useState } from 'react'

interface ElapsedTimerProps {
  startTime: string
  label?: string
  size?: 'sm' | 'lg'
  color?: string
}

export default function ElapsedTimer({
  startTime,
  label = 'Tempo decorrido',
  size = 'lg',
  color = 'var(--color-warning)',
}: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    function update() {
      const start = new Date(startTime).getTime()
      const now = Date.now()
      const diffMs = now - start
      if (diffMs < 0) {
        setElapsed('00:00:00')
        return
      }
      const totalSeconds = Math.floor(diffMs / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      setElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <div className="flex flex-col items-center">
      <span
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
      <span
        className={`font-mono font-bold tabular-nums mt-1 ${size === 'lg' ? 'text-4xl' : 'text-2xl'}`}
        style={{ color }}
      >
        {elapsed}
      </span>
    </div>
  )
}
