import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
  closed: 'bg-destructive/10 text-destructive',
};

export default function AdminJobsPage() {
  const qc = useQueryClient();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['admin-all-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*, job_categories(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('job_postings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-all-jobs'] }); toast.success('Job deleted'); },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('job_postings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-all-jobs'] }); toast.success('Status updated'); },
  });

  if (isLoading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">Jobs ({(jobs || []).length})</h1>
        <Link to="/admin/jobs/create"><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Create Job</Button></Link>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Department</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(jobs || []).map((job: any) => (
                <tr key={job.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="p-3">
                    <p className="font-medium text-foreground">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.location}</p>
                  </td>
                  <td className="p-3 text-muted-foreground">{job.department}</td>
                  <td className="p-3 text-muted-foreground capitalize">{job.employment_type}</td>
                  <td className="p-3">
                    <select
                      value={job.status}
                      onChange={(e) => toggleStatus.mutate({ id: job.id, status: e.target.value })}
                      className={cn('pill-badge border-0 cursor-pointer', statusColors[job.status])}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/jobs/${job.slug}`}><Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button></Link>
                      <Link to={`/admin/jobs/${job.id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button></Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                        if (confirm('Delete this job?')) deleteMutation.mutate(job.id);
                      }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
