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

