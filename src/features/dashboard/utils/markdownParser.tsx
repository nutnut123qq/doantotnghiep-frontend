import React from 'react'

/**
 * Parse markdown bold text (**text**) and render as styled JSX elements
 * @param text - The text to parse
 * @param boldColor - Tailwind color class for bold text (e.g., 'text-red-600')
 * @returns Array of React nodes with formatted text
 */
export function parseMarkdownBold(text: string, boldColor: string = 'text-slate-900'): React.ReactNode[] {
  if (!text) return []

  // Regex to match **text** patterns
  const regex = /\*\*(.+?)\*\*/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add the bold text with specified color
    parts.push(
      <strong key={key++} className={`font-semibold ${boldColor}`}>
        {match[1]}
      </strong>
    )

    lastIndex = regex.lastIndex
  }

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  // If no matches found, return original text
  if (parts.length === 0) {
    return [text]
  }

  return parts
}

export interface RenderMarkdownAnalysisOptions {
  headingClassName?: string
  boldColorClass?: string
  blockClassName?: string
  paragraphClassName?: string
}

const defaultMarkdownAnalysis: Required<RenderMarkdownAnalysisOptions> = {
  headingClassName: 'mt-3 mb-1 font-semibold text-purple-900 dark:text-purple-200',
  boldColorClass: 'text-purple-900 dark:text-purple-200',
  blockClassName: 'space-y-2',
  paragraphClassName: '',
}

/**
 * Renders AI-style markdown: headings (#), bullets (-/*), numbered lists, **bold**, ignores ---.
 */
export function renderMarkdownAnalysis(
  text: string,
  options?: RenderMarkdownAnalysisOptions
): React.ReactNode {
  const headingClassName = options?.headingClassName ?? defaultMarkdownAnalysis.headingClassName
  const boldColorClass = options?.boldColorClass ?? defaultMarkdownAnalysis.boldColorClass
  const blockClassName = options?.blockClassName ?? defaultMarkdownAnalysis.blockClassName
  const paragraphClassName = options?.paragraphClassName ?? defaultMarkdownAnalysis.paragraphClassName

  const lines = text.split(/\r?\n/)
  const elements: JSX.Element[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line || /^---+$/.test(line)) {
      i++
      continue
    }

    if (/^#{1,6}\s+/.test(line)) {
      const headingText = line.replace(/^#{1,6}\s+/, '')
      elements.push(
        <h5 key={`h-${key++}`} className={headingClassName}>
          {parseMarkdownBold(headingText, boldColorClass)}
        </h5>
      )
      i++
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${key++}`} className="list-disc ml-5 space-y-1">
          {items.map((item, idx) => (
            <li key={`uli-${idx}`}>{parseMarkdownBold(item, boldColorClass)}</li>
          ))}
        </ul>
      )
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${key++}`} className="list-decimal ml-5 space-y-1">
          {items.map((item, idx) => (
            <li key={`oli-${idx}`}>{parseMarkdownBold(item, boldColorClass)}</li>
          ))}
        </ol>
      )
      continue
    }

    if (/^\|/.test(line)) {
      const tableLines: string[] = []
      while (i < lines.length && /^\|/.test(lines[i].trim())) {
        tableLines.push(lines[i].trim())
        i++
      }
      // Remove separator lines (only dashes, pipes, spaces, colons)
      const rows = tableLines
        .filter((l) => !/^\|?[\s\-:|]+\|?$/.test(l))
        .map((l) => l.split('|').map((c) => c.trim()).filter(Boolean))

      if (rows.length >= 1) {
        const header = rows[0]
        const body = rows.slice(1)
        elements.push(
          <div key={`tbl-${key++}`} className="overflow-x-auto my-2">
            <table className="min-w-full text-sm border-collapse border border-blue-200 dark:border-blue-800">
              <thead>
                <tr className="bg-blue-50 dark:bg-blue-900/30">
                  {header.map((cell, idx) => (
                    <th
                      key={`th-${idx}`}
                      className="border border-blue-200 dark:border-blue-800 px-3 py-2 text-left font-semibold text-blue-900 dark:text-blue-100"
                    >
                      {parseMarkdownBold(cell, boldColorClass)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ridx) => (
                  <tr
                    key={`tr-${ridx}`}
                    className={ridx % 2 === 1 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                  >
                    {row.map((cell, cidx) => (
                      <td
                        key={`td-${cidx}`}
                        className="border border-blue-200 dark:border-blue-800 px-3 py-2 text-blue-800 dark:text-blue-200"
                      >
                        {parseMarkdownBold(cell, boldColorClass)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    elements.push(
      <p key={`p-${key++}`} className={paragraphClassName || undefined}>
        {parseMarkdownBold(line, boldColorClass)}
      </p>
    )
    i++
  }

  if (elements.length === 0) {
    return <p className={paragraphClassName || undefined}>{text}</p>
  }

  return <div className={blockClassName}>{elements}</div>
}

