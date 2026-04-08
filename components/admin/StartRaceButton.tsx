'use client'

import { useState } from 'react'

interface StartRaceButtonProps {
  isStarted: boolean
  startTime: string | null
  onStart: () => Promise<void>
  onReset: () => Promise<void>
}

export default function StartRaceButton({
  isStarted,
  startTime,
  onStart,
  onReset,
}: StartRaceButtonProps) {
  const [showStartModal, setShowStartModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetConfirm, setResetConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  function openStartModal() {
    const now = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
    setCurrentTime(now)
    setShowStartModal(true)
  }

  async function handleStart() {
    setLoading(true)
    await onStart()
    setLoading(false)
    setShowStartModal(false)
  }

  async function handleReset() {
    if (resetConfirm !== 'RESETAR') return
    setLoading(true)
    await onReset()
    setLoading(false)
    setShowResetModal(false)
    setResetConfirm('')
  }

  if (isStarted && startTime) {
    const startedAt = new Date(startTime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
    return (
      <div className="flex flex-col gap-3">
        <div
          className="rounded-lg px-5 py-3 flex items-center gap-3"
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid var(--color-success)' }}
        >
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-white">Prova em andamento</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Start às {startedAt}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="text-xs px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-80 self-start"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid #f87171' }}
        >
          Resetar prova
        </button>

        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="rounded-xl p-6 w-full max-w-sm" style={{ background: 'var(--color-surface)', border: '1px solid #f87171' }}>
              <h3 className="text-lg font-bold text-white mb-2">Resetar prova</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Isso irá apagar todos os horários registrados e resetar a prova. Para confirmar, digite <strong className="text-white">RESETAR</strong> abaixo.
              </p>
              <input
                type="text"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder="RESETAR"
                className="w-full px-3 py-2 rounded-lg mb-4 text-white font-mono"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary-mid)' }}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  disabled={resetConfirm !== 'RESETAR' || loading}
                  className="flex-1 py-2 rounded-lg font-semibold transition-opacity disabled:opacity-40"
                  style={{ background: '#ef4444', color: 'white' }}
                >
                  {loading ? 'Resetando...' : 'Confirmar reset'}
                </button>
                <button
                  onClick={() => { setShowResetModal(false); setResetConfirm('') }}
                  className="flex-1 py-2 rounded-lg font-semibold"
                  style={{ background: 'var(--color-primary-dark)', color: 'white' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={openStartModal}
        className="w-full py-4 px-8 rounded-xl text-xl font-extrabold uppercase tracking-widest transition-all hover:scale-105 hover:shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
          color: 'white',
          boxShadow: '0 4px 24px rgba(139,53,204,0.5)',
        }}
      >
        ▶ Dar start na prova
      </button>

      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-6 w-full max-w-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-primary)' }}>
            <h3 className="text-lg font-bold text-white mb-2">Confirmar largada</h3>
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Registrar largada às:
            </p>
            <p className="text-3xl font-mono font-bold text-center my-4" style={{ color: 'var(--color-warning)' }}>
              {currentTime}
            </p>
            <p className="text-xs mb-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
              (horário de Brasília)
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-bold text-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                {loading ? 'Salvando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowStartModal(false)}
                className="flex-1 py-3 rounded-lg font-semibold"
                style={{ background: 'var(--color-primary-dark)', color: 'white' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
