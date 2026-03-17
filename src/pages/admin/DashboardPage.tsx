import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, FileText, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(142,71%,45%)', 'hsl(38,92%,50%)', 'hsl(187,94%,43%)', 'hsl(0,84%,60%)', 'hsl(260,60%,50%)', 'hsl(142,76%,36%)'];

export default function AdminDashboardPage() {
  const { data: jobsData } = useQuery({
    queryKey: ['admin-jobs-count'],
    queryFn: async () => {
      const { count: total } = await supabase.from('job_postings').select('*', { count: 'exact', head: true });
      const { count: active } = await supabase.from('job_postings').select('*', { count: 'exact', head: true }).eq('status', 'published');
      return { total: total || 0, active: active || 0 };
    },
  });

  const { data: appsData } = useQuery({
    queryKey: ['admin-apps-count'],
    queryFn: async () => {
      const { count: total } = await supabase.from('applications').select('*', { count: 'exact', head: true });
      const { count: pending } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: shortlisted } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'shortlisted');
      const { count: hired } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'hired');
      return { total: total || 0, pending: pending || 0, shortlisted: shortlisted || 0, hired: hired || 0 };
    },
  });

  const { data: recentApps, isLoading } = useQuery({
    queryKey: ['admin-recent-apps'],
    queryFn: async () => {
      const { data } = await supabase
        .from('applications')
        .select('*, job_postings(title, department), profiles(full_name, email)')
        .order('applied_at', { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const { data: statusBreakdown } = useQuery({
    queryKey: ['admin-status-breakdown'],
    queryFn: async () => {
      const { data } = await supabase.from('applications').select('status');
      const counts: Record<string, number> = {};
      (data || []).forEach((a: any) => { counts[a.status] = (counts[a.status] || 0) + 1; });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  const stats = [
    { label: 'Total Jobs', value: jobsData?.total || 0, icon: Briefcase, color: 'text-primary' },
    { label: 'Active Jobs', value: jobsData?.active || 0, icon: TrendingUp, color: 'text-success' },
    { label: 'Total Applications', value: appsData?.total || 0, icon: FileText, color: 'text-info' },
    { label: 'Pending Review', value: appsData?.pending || 0, icon: Clock, color: 'text-warning' },
    { label: 'Shortlisted', value: appsData?.shortlisted || 0, icon: Users, color: 'text-purple-500' },
    { label: 'Hired', value: appsData?.hired || 0, icon: CheckCircle, color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-foreground">Admin Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-elevated p-4">
            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
            <p className="font-heading text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="card-elevated p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Applications by Status</h2>
          {statusBreakdown && statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`}>
                  {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card-elevated p-6">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Recent Applications</h2>
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {(recentApps || []).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{app.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{app.job_postings?.title}</p>
                  </div>
                  <span className="pill-badge bg-primary/10 text-primary text-xs">{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
