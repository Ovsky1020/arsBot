import type { ReactNode } from 'react'

/** Resaltado mínimo: **negrilla** y `código` */
function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      )
    } else {
      nodes.push(
        <code key={`${keyBase}-c${i}`} className="rounded bg-surface-2 px-1 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      )
    }
    last = match.index + token.length
    i++
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/** Markdown muy básico para las notas: títulos, listas, líneas. */
export function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  let list: { ordered: boolean; items: ReactNode[] } | null = null

  const flush = (key: number) => {
    if (!list) return
    const Tag = list.ordered ? 'ol' : 'ul'
    out.push(
      <Tag
        key={`l${key}`}
        className={`my-1 space-y-1 pl-5 ${list.ordered ? 'list-decimal' : 'list-disc'} text-[14.5px] leading-relaxed text-text/90`}
      >
        {list.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Tag>,
    )
    list = null
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trimEnd()
    if (!trimmed.trim()) {
      flush(idx)
      return
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed)
    if (heading) {
      flush(idx)
      const level = heading[1].length
      const cls =
        level === 1 ? 'text-base font-semibold mt-2 mb-1' : 'text-[15px] font-semibold mt-2 mb-1'
      out.push(
        <p key={idx} className={cls}>
          {inline(heading[2], `h${idx}`)}
        </p>,
      )
      return
    }
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line)
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (bullet || numbered) {
      const ordered = Boolean(numbered)
      const content = (bullet ?? numbered)![1]
      if (list && list.ordered !== ordered) flush(idx)
      if (!list) list = { ordered, items: [] }
      list.items.push(inline(content, `i${idx}`))
      return
    }
    flush(idx)
    out.push(
      <p key={idx} className="text-[14.5px] leading-relaxed text-text/90">
        {inline(trimmed, `p${idx}`)}
      </p>,
    )
  })

  flush(lines.length)
  return <>{out}</>
}
