import { useAuthStore } from '@/stores/authStore';
import { useMyApplications } from '@/hooks/useApplications';
import { useSavedJobs } from '@/hooks/useSavedJobs';
import { useNotifications } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Heart, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UserDashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const { data: applications } = useMyApplications();
  const { data: savedJobs } = useSavedJobs();
  const { data: notifications } = useNotifications();

  const pending = (applications || []).filter((a: any) => a.status === 'pending').length;
  const shortlisted = (applications || []).filter((a: any) => a.status === 'shortlisted').length;
  const unread = (notifications || []).filter((n: any) => !n.is_read).length;

  const stats = [
    { label: 'Total Applications', value: (applications || []).length, icon: FileText, color: 'text-primary' },
    { label: 'Pending Review', value: pending, icon: Briefcase, color: 'text-warning' },
    { label: 'Shortlisted', value: shortlisted, icon: Heart, color: 'text-info' },
    { label: 'Unread Notifications', value: unread, icon: Bell, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card-elevated p-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your job search progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-elevated p-5">
            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
            <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Recent Applications</h2>
          <Link to="/dashboard/applications" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {(applications || []).length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No applications yet</p>
            <Link to="/jobs"><Button size="sm">Browse Jobs</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(applications || []).slice(0, 5).map((app: any) => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{app.job_postings?.title}</p>
                  <p className="text-xs text-muted-foreground">{app.job_postings?.department} • {new Date(app.applied_at).toLocaleDateString()}</p>
                </div>
                <span className={`pill-badge text-xs ${
                  app.status === 'pending' ? 'bg-muted text-muted-foreground' :
                  app.status === 'reviewing' ? 'bg-primary/10 text-primary' :
                  app.status === 'shortlisted' ? 'bg-info/10 text-info' :
                  app.status === 'hired' ? 'bg-success/10 text-success' :
                  app.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {app.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
