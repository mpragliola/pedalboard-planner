import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../../context/AppContext'
import type { BoardTemplate } from '../../data/boards'
import type { DeviceTemplate } from '../../data/devices'
import './CatalogModal.css'

const GRID_MIN_COL_WIDTH = 100
const GRID_GAP = 12
const SCROLL_PADDING = 12

export type CatalogModalMode = 'boards' | 'devices'

interface CatalogModalProps {
  open: boolean
  onClose: () => void
}

function CatalogModal({ open, onClose }: CatalogModalProps) {
  const { catalogMode, filters, onBoardSelect, onDeviceSelect } = useApp()
  const list = catalogMode === 'boards' ? filters.filteredBoards : filters.filteredDevices
  const [visibleCount, setVisibleCount] = useState(0)
  const columnsRef = useRef(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const visibleItems = list.slice(0, visibleCount)
  const hasMore = visibleCount < list.length

  const loadMore = useCallback(() => {
    const cols = columnsRef.current
    setVisibleCount((c) => Math.min(c + cols, list.length))
  }, [list.length])

  const recalcFromViewport = useCallback(() => {
    const scrollEl = scrollRef.current
    const cardEl = scrollEl?.querySelector('.catalog-modal-card') as HTMLElement | null
    if (!scrollEl || !cardEl || list.length === 0) return

    const contentWidth = scrollEl.clientWidth - SCROLL_PADDING * 2
    const contentHeight = scrollEl.clientHeight - SCROLL_PADDING * 2
    const cols = Math.max(1, Math.floor((contentWidth + GRID_GAP) / (GRID_MIN_COL_WIDTH + GRID_GAP)))
    const cardHeight = cardEl.getBoundingClientRect().height
    const rowHeight = cardHeight + GRID_GAP
    const rows = Math.max(1, Math.floor((contentHeight + GRID_GAP) / rowHeight))
    const targetCount = cols * (rows + 1)

    columnsRef.current = cols
    setVisibleCount((c) => Math.max(c, Math.min(targetCount, list.length)))
  }, [list.length])

  useEffect(() => {
    if (!open) return
    setVisibleCount(list.length > 0 ? 1 : 0)
  }, [open, catalogMode, list.length])

  useEffect(() => {
    if (!open || visibleCount < 1 || list.length === 0) return
    const scrollEl = scrollRef.current
    if (!scrollEl) return
    const rafId = requestAnimationFrame(recalcFromViewport)
    const resizeObserver = new ResizeObserver(() => recalcFromViewport())
    resizeObserver.observe(scrollEl)
    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
    }
  }, [open, visibleCount, list.length, catalogMode, recalcFromViewport])

  useEffect(() => {
    if (!open || !hasMore) return
    const scrollEl = scrollRef.current
    const sentinel = sentinelRef.current
    if (!scrollEl || !sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root: scrollEl, rootMargin: '100px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, hasMore, loadMore, catalogMode])

  const handleSelect = (id: string) => {
    if (catalogMode === 'boards') onBoardSelect(id)
    else onDeviceSelect(id)
    onClose()
  }

  if (!open) return null

  const title = catalogMode === 'boards' ? 'Add board' : 'Add device'
  // Original images (same as canvas objects); thumbnail system can be added later
  const imageBase = catalogMode === 'boards' ? 'images/boards/' : 'images/devices/'

  const modal = (
    <div className="catalog-modal-backdrop" aria-hidden>
      <div
        className="catalog-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="catalog-modal-header">
          <h2 className="catalog-modal-title">{title}</h2>
          <button
            type="button"
            className="catalog-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div ref={scrollRef} className="catalog-modal-scroll">
          <div className="catalog-modal-grid">
            {visibleItems.map((item: BoardTemplate | DeviceTemplate) => (
              <button
                key={item.id}
                type="button"
                className="catalog-modal-card"
                onClick={() => handleSelect(item.id)}
              >
                <span className="catalog-modal-card-image-wrap">
                  {item.image ? (
                    <img
                      src={`${imageBase}${item.image}`}
                      alt=""
                      className="catalog-modal-card-image"
                      loading="lazy"
                    />
                  ) : (
                    <span
                      className="catalog-modal-card-placeholder"
                      style={{
                        backgroundColor: (item as { color?: string }).color ?? '#444',
                      }}
                    />
                  )}
                </span>
                <span className="catalog-modal-card-name">{item.name}</span>
              </button>
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="catalog-modal-sentinel" aria-hidden />
          )}
        </div>
      </div>
    </div>
  )
  return createPortal(modal, document.body)
}

export { CatalogModal }
