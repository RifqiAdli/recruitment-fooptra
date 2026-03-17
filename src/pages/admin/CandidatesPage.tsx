import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export default function CandidatesPage() {
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['admin-candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-foreground">Candidates ({(candidates || []).length})</h1>
      {!(candidates || []).length ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No candidates registered yet.</p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(candidates || []).map((c: any) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="p-3 font-medium text-foreground">{c.full_name}</td>
                  <td className="p-3 text-muted-foreground">{c.email}</td>
                  <td className="p-3 text-muted-foreground">{c.phone || '—'}</td>
                  <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
