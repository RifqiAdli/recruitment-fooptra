import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Trash2, Megaphone } from 'lucide-react';

export default function AnnouncementsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'info', target_role: 'all' });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('announcements').insert(form);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-announcements'] }); setShowForm(false); setForm({ title: '', content: '', type: 'info', target_role: 'all' }); toast.success('Created'); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('announcements').delete().eq('id', id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-announcements'] }); toast.success('Deleted'); },
  });

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">Announcements</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> New</Button>
      </div>

      {showForm && (
        <div className="card-elevated p-5 space-y-3">
          <div><Label className="text-sm">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" /></div>
          <div><Label className="text-sm">Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1.5" rows={3} /></div>
          <div className="flex gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['info', 'warning', 'success', 'urgent'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['all', 'user', 'admin'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>Create</Button>
        </div>
      )}

      {!(announcements || []).length ? (
        <div className="text-center py-16"><Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No announcements.</p></div>
      ) : (
        <div className="space-y-3">
          {(announcements || []).map((a: any) => (
            <div key={a.id} className="card-elevated p-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{a.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                <div className="flex gap-2 mt-2">
                  <span className="pill-badge bg-primary/10 text-primary text-xs">{a.type}</span>
                  <span className="pill-badge bg-accent text-accent-foreground text-xs">{a.target_role}</span>
                  <span className="pill-badge bg-accent text-accent-foreground text-xs">{a.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => { if (confirm('Delete?')) del.mutate(a.id); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
