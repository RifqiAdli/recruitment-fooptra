import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useJobs(filters?: {
  query?: string;
  category?: string;
  employmentType?: string[];
  locationType?: string[];
  experienceLevel?: string[];
  status?: string;
}) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      let q = supabase
        .from('job_postings')
        .select('*, job_categories(*)');

      if (filters?.status) {
        q = q.eq('status', filters.status);
      } else {
        q = q.eq('status', 'published');
      }

      if (filters?.query) {
        q = q.or(`title.ilike.%${filters.query}%,department.ilike.%${filters.query}%`);
      }
      if (filters?.category) {
        q = q.eq('job_categories.slug', filters.category);
      }
      if (filters?.employmentType?.length) {
        q = q.in('employment_type', filters.employmentType);
      }
      if (filters?.locationType?.length) {
        q = q.in('location_type', filters.locationType);
      }
      if (filters?.experienceLevel?.length) {
        q = q.in('experience_level', filters.experienceLevel);
      }

      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useJob(slug: string) {
  return useQuery({
    queryKey: ['job', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*, job_categories(*)')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useFeaturedJobs() {
  return useQuery({
    queryKey: ['featured-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*, job_categories(*)')
        .eq('status', 'published')
        .eq('is_featured', true)
        .limit(6);
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useJobCategories() {
  return useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
