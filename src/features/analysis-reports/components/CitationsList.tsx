import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import type { Citation } from '@/shared/types/analysisReportTypes'

type Props = {
  citations: Citation[]
}

export const CitationsList = ({ citations }: Props) => {
  if (!citations || citations.length === 0) return null

  return (
    <div className="border-t pt-2">
      <div className="text-xs font-semibold mb-2">Nguồn tham khảo</div>
      <Accordion type="single" collapsible>
        {citations.map((citation) => (
          <AccordionItem
            key={`${citation.sourceType}-${citation.sourceId}-${citation.citationNumber}`}
            value={`${citation.sourceType}-${citation.sourceId}-${citation.citationNumber}`}
          >
            <AccordionTrigger className="text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">[{citation.citationNumber}]</Badge>
                <span className="font-medium">{citation.title}</span>
                <Badge variant="secondary">{citation.sourceType}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {citation.excerpt}
              </div>
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {citation.url}
                </a>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
