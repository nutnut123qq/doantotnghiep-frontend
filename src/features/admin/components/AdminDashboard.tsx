import { PageHeader } from '@/shared/components/PageHeader'
import { SystemStats } from './SystemStats'

export function AdminDashboard() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="System monitoring and management"
      />
      <SystemStats />
    </div>
  )
}
