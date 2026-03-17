import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

export default function FAQManagePage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General' });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data } = await supabase.from('faq_items').select('*').order('order_index');
      return data || [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('faq_items').insert(form);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); setShowForm(false); setForm({ question: '', answer: '', category: 'General' }); toast.success('Created'); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('faq_items').delete().eq('id', id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); toast.success('Deleted'); },
  });

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-foreground">FAQ Management</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> New</Button>
      </div>

      {showForm && (
        <div className="card-elevated p-5 space-y-3">
          <div><Label className="text-sm">Question</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="mt-1.5" /></div>
          <div><Label className="text-sm">Answer</Label><Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="mt-1.5" rows={3} /></div>
          <div><Label className="text-sm">Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1.5" /></div>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>Create</Button>
        </div>
      )}

      {!(faqs || []).length ? (
        <div className="text-center py-16"><HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground">No FAQ items.</p></div>
      ) : (
        <div className="space-y-3">
          {(faqs || []).map((faq: any) => (
            <div key={faq.id} className="card-elevated p-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{faq.question}</p>
                <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                <span className="pill-badge bg-accent text-accent-foreground text-xs mt-2">{faq.category}</span>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => { if (confirm('Delete?')) del.mutate(faq.id); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
