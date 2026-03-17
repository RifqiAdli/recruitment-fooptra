import { useAllApplications, useUpdateApplicationStatus } from '@/hooks/useApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const columns = ['pending', 'reviewing', 'shortlisted', 'interview_scheduled', 'offered', 'hired', 'rejected'];
const columnLabels: Record<string, string> = {
  pending: 'Pending', reviewing: 'Reviewing', shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview', offered: 'Offered', hired: 'Hired', rejected: 'Rejected',
};
const columnColors: Record<string, string> = {
  pending: 'border-t-muted-foreground', reviewing: 'border-t-primary', shortlisted: 'border-t-info',
  interview_scheduled: 'border-t-purple-500', offered: 'border-t-warning', hired: 'border-t-success', rejected: 'border-t-destructive',
};

export default function KanbanPage() {
  const { data: applications, isLoading } = useAllApplications();
  const updateStatus = useUpdateApplicationStatus();

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    if (appId) {
      updateStatus.mutate({ id: appId, status: newStatus }, {
        onSuccess: () => toast.success('Status updated'),
      });
    }
  };

  if (isLoading) return <div className="flex gap-4 overflow-x-auto">{columns.map((c) => <Skeleton key={c} className="w-64 h-96 rounded-xl shrink-0" />)}</div>;

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-foreground">Kanban Board</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((status) => {
          const cards = (applications || []).filter((a: any) => a.status === status);
          return (
            <div
              key={status}
              className={`w-64 shrink-0 bg-accent/30 rounded-xl border-t-4 ${columnColors[status]}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="p-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{columnLabels[status]}</h3>
                <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">{cards.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {cards.map((app: any) => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('appId', app.id)}
                    className="bg-card p-3 rounded-lg border border-border cursor-grab hover:shadow-card"
                  >
                    <p className="text-sm font-medium text-foreground">{app.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{app.job_postings?.title}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
