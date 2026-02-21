import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react'

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

interface ConfirmationDialogState {
  pending: ConfirmationOptions | null
  handleConfirm: () => void
  handleCancel: () => void
}

type ConfirmationRequest = ConfirmationOptions & { resolve: (value: boolean) => void }

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null)
const ConfirmationDialogStateContext = createContext<ConfirmationDialogState | null>(null)

export function useConfirmation() {
  const ctx = useContext(ConfirmationContext)
  if (!ctx) throw new Error('useConfirmation must be used within ConfirmationProvider')
  return ctx
}

export function useConfirmationDialogState() {
  const ctx = useContext(ConfirmationDialogStateContext)
  if (!ctx) throw new Error('useConfirmationDialogState must be used within ConfirmationProvider')
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
  const dialogState = useMemo(
    () => ({
      pending,
      handleConfirm,
      handleCancel,
    }),
    [pending, handleConfirm, handleCancel]
  )

  return (
    <ConfirmationContext.Provider value={value}>
      <ConfirmationDialogStateContext.Provider value={dialogState}>{children}</ConfirmationDialogStateContext.Provider>
    </ConfirmationContext.Provider>
  )
}
