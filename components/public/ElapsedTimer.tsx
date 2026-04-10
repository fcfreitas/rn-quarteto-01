'use client'

import { useEffect, useState } from 'react'

interface ElapsedTimerProps {
  startTime: string
  endTime?: string | null   // se fornecido, o timer para e exibe o tempo final
  label?: string
  size?: 'sm' | 'lg'
  color?: string
}

export default function ElapsedTimer({
  startTime,
  endTime,
  label = 'Tempo decorrido',
  size = 'lg',
  color = 'var(--color-warning)',
}: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    function format(ms: number): string {
      if (ms < 0) return '00:00:00'
      const totalSeconds = Math.floor(ms / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // Se a prova acabou, mostra o tempo fixo e para
    if (endTime) {
      const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime()
      setElapsed(format(diffMs))
      return
    }

    function update() {
      const diffMs = Date.now() - new Date(startTime).getTime()
      setElapsed(format(diffMs))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startTime, endTime])

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
