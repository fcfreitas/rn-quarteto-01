'use client'

interface TestModeToggleProps {
  testMode: boolean
  onToggle: (val: boolean) => void
}

export default function TestModeToggle({ testMode, onToggle }: TestModeToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onToggle(!testMode)}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
          testMode ? 'bg-yellow-400' : 'bg-gray-600'
        }`}
        aria-pressed={testMode}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            testMode ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm font-semibold" style={{ color: testMode ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
        MODO TESTE
      </span>
      {testMode && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold animate-pulse"
          style={{ background: 'rgba(250,204,21,0.2)', color: 'var(--color-warning)', border: '1px solid var(--color-warning)' }}
        >
          ⚠️ ATIVO
        </span>
      )}
    </div>
  )
}
