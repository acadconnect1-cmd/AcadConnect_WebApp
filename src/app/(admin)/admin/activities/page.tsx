import { getActivityLogsAction } from '@/features/admin/actions'
import { ActivitiesClient } from './ActivitiesClient'
import { ErrorState } from '@/components/shared/ErrorState'

export const dynamic = 'force-dynamic'

export default async function AdminActivitiesPage() {
  const res = await getActivityLogsAction({ page: 1, limit: 15 })

  if (!res.success) {
    return (
      <ErrorState
        title="Failed to load system logs"
        message={res.error}
      />
    )
  }

  return (
    <ActivitiesClient initialLogsData={res.data} />
  )
}
