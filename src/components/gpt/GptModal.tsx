import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useBoard } from '../../context/BoardContext'
import { useCable } from '../../context/CableContext'
import { useUi } from '../../context/UiContext'
import { LocationLoader } from '../../lib/prompt/locationLoader'
import { PromptBuilder } from '../../lib/prompt/promptBuilder'
import { Modal } from '../common/Modal'
import './GptModal.scss'

interface GptModalProps {
  open: boolean
  onClose: () => void
}

const locationLoader = new LocationLoader()

export function GptModal({ open, onClose }: GptModalProps) {
  const { objects } = useBoard()
  const { cables } = useCable()
  const { unit } = useUi()
  const getObjectName = useCallback(
    (id: string) => objects.find((o) => o.id === id)?.name ?? id,
    [objects]
  )
  const [includeMaterials, setIncludeMaterials] = useState(false)
  const [includeCommentsAndTips, setIncludeCommentsAndTips] = useState(false)
  const [includeBestRouting, setIncludeBestRouting] = useState(false)
  const [includeBestSettings, setIncludeBestSettings] = useState(false)
  const [includeLocation, setIncludeLocation] = useState(false)
  const [location, setLocation] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const builtPrompt = useMemo(() => {
    // Prompt is derived from board + modal options; memo avoids rebuilding on unrelated renders.
    const promptBuilder = new PromptBuilder(objects, {
      includeMaterials,
      includeCommentsAndTips,
      includeBestRouting,
      includeBestSettings,
      location: includeLocation ? location : '',
      cables,
      unit,
      getObjectName,
    })
    return promptBuilder.build()
  }, [
    objects,
    includeMaterials,
    includeCommentsAndTips,
    includeBestRouting,
    includeBestSettings,
    includeLocation,
    location,
    cables,
    unit,
    getObjectName,
  ])
  const [promptText, setPromptText] = useState(builtPrompt)

  useEffect(() => {
    if (open) setPromptText(builtPrompt)
  }, [open, builtPrompt])

  const loadLocationFromBrowser = useCallback(async () => {
    // Single-state location flow:
    // when geolocation resolves, write directly to `location` input state.
    // This removes extra "pending + rerender key" coordination state.
    setLocationLoading(true)
    setLocationError(null)
    try {
      const place = await locationLoader.loadFromBrowser({ timeout: 10000 })
      // Directly storing the loaded place keeps location flow single-state.
      setLocation(place)
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : 'Could not get location.')
    } finally {
      setLocationLoading(false)
    }
  }, [])

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText)
      setCopied(true)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [promptText])

  useEffect(() => {
    if (!open) {
      setCopied(false)
      setLocationError(null)
    }
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Price estimate prompt"
      className="gpt-modal modal-dialog--compact-close"
      ariaLabel="Price estimate prompt"
    >
      <p className="gpt-modal-intro">
        Build a prompt for an LLM (ChatGPT, Claude, Gemini, etc.) to estimate the
        total price of your pedalboard and have tips and suggestions.
        Copy it and paste into your favourite LLM. <br />
        <small>Disclaimer: the prices will be estimated and there is no guarantee of accuracy.
          Always check the results and use your best judgement.</small>
      </p>

      <div className="gpt-modal-options">
        <label className="gpt-modal-check">
          <input
            type="checkbox"
            checked={includeLocation}
            onChange={(e) => setIncludeLocation(e.target.checked)}
          />
          <span>Include my location (prices and stores near me)</span>
        </label>
        {includeLocation && (
          <div className="gpt-modal-location-row">
            <input
              type="text"
              className="gpt-modal-location-input"
              placeholder="e.g. Rome, Italy"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Your location"
            />
            <button
              type="button"
              className="gpt-modal-location-btn"
              onClick={loadLocationFromBrowser}
              disabled={locationLoading}
              title="Use browser location"
            >
              {locationLoading ? '…' : 'Load from browser'}
            </button>
          </div>
        )}
        {includeLocation && locationError && (
          <p className="gpt-modal-error" role="alert">
            {locationError}
          </p>
        )}

        <label className="gpt-modal-check">
          <input
            type="checkbox"
            checked={includeMaterials}
            onChange={(e) => setIncludeMaterials(e.target.checked)}
          />
          <span>Include materials (cables, velcro, etc.) in the estimate</span>
        </label>

        <label className="gpt-modal-check">
          <input
            type="checkbox"
            checked={includeCommentsAndTips}
            onChange={(e) => setIncludeCommentsAndTips(e.target.checked)}
          />
          <span>Include comments and tips</span>
        </label>

        <label className="gpt-modal-check">
          <input
            type="checkbox"
            checked={includeBestRouting}
            onChange={(e) => setIncludeBestRouting(e.target.checked)}
          />
          <span>Ask for the best routing (signal and cable/power path)</span>
        </label>

        <label className="gpt-modal-check">
          <input
            type="checkbox"
            checked={includeBestSettings}
            onChange={(e) => setIncludeBestSettings(e.target.checked)}
          />
          <span>Ask for the best settings (starting values per pedal)</span>
        </label>
      </div>

      <div className="gpt-modal-prompt-wrap">
        <label className="gpt-modal-label" htmlFor="gpt-prompt-text">
          Prompt (you can edit before copying)
        </label>
        <textarea
          id="gpt-prompt-text"
          className="gpt-modal-textarea"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={14}
          spellCheck={false}
        />
      </div>

      <div className="gpt-modal-actions">
        <button type="button" className="gpt-modal-copy-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
        <button type="button" className="gpt-modal-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}
