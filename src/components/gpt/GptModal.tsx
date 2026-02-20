import { useState, useCallback, useEffect, useMemo } from 'react'
import { useBoard } from '../../context/BoardContext'
import { useCable } from '../../context/CableContext'
import { useUi } from '../../context/UiContext'
import { LocationLoader } from '../../lib/locationLoader'
import { PromptBuilder } from '../../lib/promptBuilder'
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
  const [includeLocation, setIncludeLocation] = useState(false)
  const [location, setLocation] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  /** Pending location from "Load from browser"; applied to location in effect so input updates. */
  const [loadedPlacePending, setLoadedPlacePending] = useState<string | null>(null)
  const [locationInputKey, setLocationInputKey] = useState(0)

  const builtPrompt = useMemo(() => {
    const promptBuilder = new PromptBuilder(objects, {
      includeMaterials,
      includeCommentsAndTips,
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

  // Apply loaded location in effect so the input re-renders with new value (state, not ref, so React commits it)
  useEffect(() => {
    if (!locationLoading && loadedPlacePending !== null) {
      setLocation(loadedPlacePending)
      setLocationInputKey((k) => k + 1)
      setLoadedPlacePending(null)
    }
  }, [locationLoading, loadedPlacePending])

  const loadLocationFromBrowser = useCallback(async () => {
    setLocationLoading(true)
    setLocationError(null)
    try {
      const place = await locationLoader.loadFromBrowser({ timeout: 10000 })
      setLoadedPlacePending(place)
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : 'Could not get location.')
    } finally {
      setLocationLoading(false)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
              key={`location-${locationInputKey}`}
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
