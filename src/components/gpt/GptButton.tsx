import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { GptModal } from './GptModal'
import './GptButton.scss'

export function GptButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="gpt-btn"
        onClick={() => setOpen(true)}
        title="Build price estimate prompt for LLM"
        aria-label="Build price estimate prompt for LLM"
      >
        <FontAwesomeIcon icon={faWandMagicSparkles} />
      </button>
      <GptModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
