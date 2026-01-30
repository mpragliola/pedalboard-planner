import { useState } from 'react'
import { GptModal } from './GptModal'
import './GptButton.css'

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
        GPT
      </button>
      <GptModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
