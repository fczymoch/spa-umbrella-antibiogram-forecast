interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function Spinner({ size = 'md', label = 'Carregando...' }: SpinnerProps) {
  const sizes = { sm: '14px', md: '20px', lg: '32px' }
  const px = sizes[size]

  return (
    <span
      className="spinner"
      role="status"
      aria-label={label}
      style={{ width: px, height: px }}
    />
  )
}
