import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export function useSavedJobs() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ['saved-jobs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*, job_postings(*, job_categories(*))')
        .eq('user_id', user!.id)
        .order('saved_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useToggleSaveJob() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: string; isSaved: boolean }) => {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user!.id)
          .eq('job_id', jobId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .insert({ user_id: user!.id, job_id: jobId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });
}
