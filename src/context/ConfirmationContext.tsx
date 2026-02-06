import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ConfirmationDialog } from '../components/confirmation/ConfirmationDialog'

export interface ConfirmationOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmationContextValue {
  requestConfirmation: (options: ConfirmationOptions) => Promise<boolean>
}

type ConfirmationRequest = ConfirmationOptions & { resolve: (value: boolean) => void }

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null)

export function useConfirmation() {
  const ctx = useContext(ConfirmationContext)
  if (!ctx) throw new Error('useConfirmation must be used within ConfirmationProvider')
  return ctx
}

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ConfirmationRequest[]>([])
  const queueRef = useRef<ConfirmationRequest[]>([])
  const pending = queue[0] ?? null

  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  useEffect(() => {
    return () => {
      for (const req of queueRef.current) req.resolve(false)
      queueRef.current = []
    }
  }, [])

  const requestConfirmation = useCallback((options: ConfirmationOptions) => {
    return new Promise<boolean>((resolve) => {
      setQueue((prev) => [...prev, { ...options, resolve }])
    })
  }, [])

  const resolveNext = useCallback((value: boolean) => {
    setQueue((prev) => {
      if (prev.length === 0) return prev
      const [current, ...rest] = prev
      current.resolve(value)
      return rest
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolveNext(true)
  }, [resolveNext])

  const handleCancel = useCallback(() => {
    resolveNext(false)
  }, [resolveNext])

  const value = useMemo(() => ({ requestConfirmation }), [requestConfirmation])

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
      {pending &&
        createPortal(
          <ConfirmationDialog
            open
            title={pending.title}
            message={pending.message}
            confirmLabel={pending.confirmLabel}
            cancelLabel={pending.cancelLabel}
            danger={pending.danger}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />,
          document.body
        )}
    </ConfirmationContext.Provider>
  )
}
