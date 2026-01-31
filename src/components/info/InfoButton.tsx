import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { InfoModal } from './InfoModal'
import './InfoButton.css'

export function InfoButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="info-btn"
        onClick={() => setOpen(true)}
        title="About Pedalboard Planner"
        aria-label="About Pedalboard Planner"
      >
        <FontAwesomeIcon icon={faCircleInfo} />
      </button>
      <InfoModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
