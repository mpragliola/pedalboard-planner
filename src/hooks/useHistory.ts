import { useState, useCallback } from 'react'

export function useHistory<T>(initialState: T, depth = 200) {
  const [state, _setState] = useState<T>(initialState)
  const [past, setPast] = useState<T[]>([])
  const [future, setFuture] = useState<T[]>([])

  const setState = useCallback((action: T | ((prev: T) => T), saveToHistory = true) => {
    _setState((prev) => {
      const next = typeof action === 'function' ? (action as (prev: T) => T)(prev) : action

      if (next === prev) return prev

      if (saveToHistory) {
        setPast((p) => [...p, prev].slice(-depth))
        setFuture([])
      }

      return next
    })
  }, [depth])

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p

      const previous = p[p.length - 1]
      const newPast = p.slice(0, p.length - 1)

      _setState((currentState) => {
        setFuture((f) => [currentState, ...f])
        return previous
      })

      return newPast
    })
  }, [])

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f

      const next = f[0]
      const newFuture = f.slice(1)

      _setState((currentState) => {
        setPast((p) => [...p, currentState])
        return next
      })

      return newFuture
    })
  }, [])

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}
