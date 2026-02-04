import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
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

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null)

export function useConfirmation() {
  const ctx = useContext(ConfirmationContext)
  if (!ctx) throw new Error('useConfirmation must be used within ConfirmationProvider')
  return ctx
}

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<(ConfirmationOptions & { resolve: (value: boolean) => void }) | null>(null)

  const requestConfirmation = useCallback((options: ConfirmationOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    pending?.resolve(true)
    setPending(null)
  }, [pending])

  const handleCancel = useCallback(() => {
    pending?.resolve(false)
    setPending(null)
  }, [pending])

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
