import { createPortal } from 'react-dom'
import './InfoModal.css'

interface InfoModalProps {
  open: boolean
  onClose: () => void
}

const AUTHOR_EMAIL = 'marcopragliola@gmail.com'
const DONATE_URL = 'https://www.paypal.com/donate' // Replace with your preferred donate link

export function InfoModal({ open, onClose }: InfoModalProps) {
  if (!open) return null

  const modal = (
    <div
      className="info-modal-backdrop"
      aria-hidden
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="info-modal"
        role="dialog"
        aria-modal="true"
        aria-label="About Pedalboard Planner"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="info-modal-header">
          <h2 className="info-modal-title">About Pedalboard Planner</h2>
          <button type="button" className="info-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="info-modal-body">
          <p className="info-modal-intro">
            Pedalboard Planner helps you plan pedalboard layouts by placing boards and pedals on a canvas.
            You can arrange gear, compare sizes, and export a price-estimate prompt for an LLM.
          </p>

          <h3 className="info-modal-heading">Features</h3>
          <ul className="info-modal-list">
            <li>Add boards and pedals from the catalog (filter by brand, type, size)</li>
            <li>Drag objects to arrange; rotate, send to back, delete</li>
            <li>Undo / redo; zoom and pan; optional grid (mm or inches)</li>
            <li>State is saved automatically in your browser</li>
            <li>GPT button: build a prompt to ask an LLM for a price estimate (with optional location and materials)</li>
          </ul>

          <h3 className="info-modal-heading">Author</h3>
          <p className="info-modal-author">
            <a href={`mailto:${AUTHOR_EMAIL}`}>Marco Pragliola</a>
            {' · '}
            <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
              Donate
            </a>
          </p>

          <div className="info-modal-disclaimers">
            <p className="info-modal-disclaimer">
              All brands, models and depictions of any gear shown are property of their respective owners.
            </p>
            <p className="info-modal-disclaimer">
              The database creation process is tedious; we cannot guarantee that the information presented is accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  return createPortal(modal, document.body)
}
