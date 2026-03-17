import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useMyApplications() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['my-applications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, job_postings(*, job_categories(*))')
        .eq('applicant_id', user!.id)
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllApplications() {
  return useQuery({
    queryKey: ['all-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, job_postings(title, department, slug), profiles(full_name, email, avatar_url, phone)')
        .order('applied_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes, rating, rejection_reason }: {
      id: string; status: string; notes?: string; rating?: number; rejection_reason?: string;
    }) => {
      const update: Record<string, unknown> = { status };
      if (notes !== undefined) update.notes = notes;
      if (rating !== undefined) update.rating = rating;
      if (rejection_reason !== undefined) update.rejection_reason = rejection_reason;

      const { error } = await supabase.from('applications').update(update).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-applications'] });
      qc.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      job_id: string;
      applicant_id: string;
      cv_url: string;
      cv_filename: string;
      cover_letter?: string;
      portfolio_url?: string;
      expected_salary?: number;
    }) => {
      const { error } = await supabase.from('applications').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
}
