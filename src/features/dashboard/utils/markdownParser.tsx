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

