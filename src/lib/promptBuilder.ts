import type { CanvasObjectType, Connector } from '../types'

export interface PricePromptOptions {
  includeMaterials: boolean
  location: string
  connectors: Connector[]
  getObjectName: (id: string) => string
}

/**
 * Builds a prompt for an LLM to estimate pedalboard price from canvas objects and options.
 */
export class PromptBuilder {
  constructor(
    private readonly objects: CanvasObjectType[],
    private readonly options: PricePromptOptions
  ) { }

  /** List of components as bullet lines (name, optional brand/model). */
  getComponentsList(): string {
    if (this.objects.length === 0) return '(no components on canvas)'
    return this.objects
      .map((o) => {
        const extra = o.brand || o.model ? ` (${[o.brand, o.model].filter(Boolean).join(' ')})` : ''
        return `- ${o.name}${extra}`
      })
      .join('\n')
  }

  /** Connector list formatted for the prompt. */
  getConnectorList(): string {
    if (this.options.connectors.length === 0) return ''
    const { getObjectName } = this.options
    return this.options.connectors
      .map(
        (c) =>
          `- ${c.type} cable, from ${getObjectName(c.deviceA)} (${c.connectorA}) to ${getObjectName(c.deviceB)} (${c.connectorB})`
      )
      .join('\n')
  }

  /** Full prompt string for copy/paste into an LLM. */
  build(): string {
    const componentsList = this.getComponentsList()
    const parts: string[] = [
      'I am assembling a guitar pedalboard with the following setup. Please estimate the total price.',
      '',
      'Components:',
      componentsList,
      '',
    ]
    if (this.options.includeMaterials) {
      parts.push('Include cables, velcro and similar materials in the estimate.')
      const connectorList = this.getConnectorList()
      if (connectorList) {
        parts.push('', 'Connector list:', connectorList)
      }
    } else {
      parts.push('Exclude from the estimate: cables, velcro, and similar materials.')
    }
    parts.push('', 'If you have web search capabilities, search the most recent prices.')
    const location = this.options.location.trim()
    if (location) {
      parts.push('', `Look up prices and stores considering I live in ${location}.`)
    }
    return parts.join('\n')
  }
}
