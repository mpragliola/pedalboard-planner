import './Grid.css'

interface GridProps {
  visible: boolean
  gridSizeCss: string
  transform: string
}

export function Grid({ visible, gridSizeCss, transform }: GridProps) {
  if (!visible) return null
  return (
    <div
      className="canvas-grid"
      style={{
        transform,
        ['--grid-size' as string]: gridSizeCss,
      }}
      aria-hidden
    />
  )
}
