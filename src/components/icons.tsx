type IconProps = { className?: string; size?: number }

function svg(path: React.ReactNode, { className = '', size = 22 }: IconProps, viewBox = '0 0 24 24') {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}

export const IconHoy = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
    p,
  )

export const IconHorario = (p: IconProps) =>
  svg(
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>,
    p,
  )

export const IconTareas = (p: IconProps) =>
  svg(
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4 18l1.2 1.2L7.5 17" />
    </>,
    p,
  )

export const IconNotas = (p: IconProps) =>
  svg(
    <>
      <path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
      <path d="M14 4v5h5M8 13h8M8 17h5" />
    </>,
    p,
  )

export const IconAjustes = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15H2.9a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.1V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>,
    p,
  )

export const IconPlus = (p: IconProps) =>
  svg(
    <>
      <path d="M12 5v14M5 12h14" />
    </>,
    p,
  )

export const IconX = (p: IconProps) =>
  svg(
    <>
      <path d="M18 6 6 18M6 6l12 12" />
    </>,
    p,
  )

export const IconCheck = (p: IconProps) =>
  svg(
    <>
      <path d="M20 6 9 17l-5-5" />
    </>,
    p,
  )

export const IconTrash = (p: IconProps) =>
  svg(
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>,
    p,
  )

export const IconChevronDown = (p: IconProps) =>
  svg(
    <>
      <path d="m6 9 6 6 6-6" />
    </>,
    p,
  )

export const IconChevronLeft = (p: IconProps) =>
  svg(
    <>
      <path d="m15 18-6-6 6-6" />
    </>,
    p,
  )

export const IconChevronRight = (p: IconProps) =>
  svg(
    <>
      <path d="m9 18 6-6-6-6" />
    </>,
    p,
  )

export const IconSun = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>,
    p,
  )

export const IconMoon = (p: IconProps) =>
  svg(
    <>
      <path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10Z" />
    </>,
    p,
  )

export const IconMonitor = (p: IconProps) =>
  svg(
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>,
    p,
  )

export const IconDownload = (p: IconProps) =>
  svg(
    <>
      <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
    </>,
    p,
  )

export const IconUpload = (p: IconProps) =>
  svg(
    <>
      <path d="M12 17V5M7 9l5-5 5 5M4 20h16" />
    </>,
    p,
  )

export const IconClock = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
    p,
  )

export const IconPin = (p: IconProps) =>
  svg(
    <>
      <path d="M12 17v5M8 3h8l-1 6 3 3H6l3-3-1-6Z" />
    </>,
    p,
  )

export const IconSearch = (p: IconProps) =>
  svg(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
    p,
  )

export const IconPencil = (p: IconProps) =>
  svg(
    <>
      <path d="M4 20h4L20 8l-4-4L4 16v4Z" />
      <path d="M14 6l4 4" />
    </>,
    p,
  )

export const IconLocation = (p: IconProps) =>
  svg(
    <>
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>,
    p,
  )
