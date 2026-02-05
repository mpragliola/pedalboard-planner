import './Grid.scss'

interface GridProps {
  visible: boolean
  gridSizeCss: string
}

export function Grid({ visible, gridSizeCss }: GridProps) {
  if (!visible) return null
  return (
    <div
      className="canvas-grid"
      style={{ ['--grid-size' as string]: gridSizeCss }}
      aria-hidden
    />
  )
}
