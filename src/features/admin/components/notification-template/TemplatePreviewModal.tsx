import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface TemplatePreviewModalProps {
  subject: string
  body: string
  onClose: () => void
}

export function TemplatePreviewModal({ subject, body, onClose }: TemplatePreviewModalProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Template Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Subject</Label>
            <div className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-sm text-[hsl(var(--text))] mt-2">
              {subject}
            </div>
          </div>

          <div>
            <Label>Body</Label>
            <div className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-sm text-[hsl(var(--text))] whitespace-pre-wrap mt-2">
              {body}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
