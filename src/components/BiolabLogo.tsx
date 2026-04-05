interface BiolabLogoProps {
  size?: number
  /** 'color' usa gradiente azul, 'white' usa fundo semitransparente branco */
  variant?: 'color' | 'white'
}

export function BiolabLogo({ size = 36, variant = 'color' }: BiolabLogoProps) {
  const id = variant === 'color' ? 'biolab-lg-color' : 'biolab-lg-white'
  const rectFill = variant === 'color' ? `url(#${id})` : 'rgba(255,255,255,0.15)'

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="10" fill={rectFill} />
      <path
        d="M12 8h12M15 8v6l-5 10a2 2 0 001.8 2.9h12.4A2 2 0 0026 24l-5-10V8"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15.5" cy="19.5" r="1" fill="#bfdbfe" />
      <circle cx="20" cy="22" r="1.5" fill="#bfdbfe" />
      {variant === 'color' && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      )}
    </svg>
  )
}
