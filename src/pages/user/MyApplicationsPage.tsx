import { useMyApplications } from '@/hooks/useApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  reviewing: 'bg-primary/10 text-primary',
  shortlisted: 'bg-info/10 text-info',
  interview_scheduled: 'bg-purple-100 text-purple-700',
  interviewed: 'bg-info/10 text-info',
  offered: 'bg-warning/10 text-warning',
  hired: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  withdrawn: 'bg-muted text-muted-foreground',
};

export default function MyApplicationsPage() {
  const { data: applications, isLoading } = useMyApplications();

  if (isLoading) return <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;

  if (!applications?.length) {
    return (
      <div className="text-center py-16">
        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">No Applications Yet</h2>
        <p className="text-sm text-muted-foreground mb-4">Start exploring jobs and submit your first application.</p>
        <Link to="/jobs"><Button>Browse Jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-foreground">My Applications ({applications.length})</h1>
      {applications.map((app: any) => (
        <div key={app.id} className="card-elevated p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-heading font-semibold text-foreground">{app.job_postings?.title}</p>
            <p className="text-sm text-muted-foreground">{app.job_postings?.department} • Applied {new Date(app.applied_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`pill-badge ${statusColors[app.status] || 'bg-muted text-muted-foreground'}`}>
              {app.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
