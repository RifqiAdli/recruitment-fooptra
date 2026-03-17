import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { slugify } from '@/lib/utils';
import { useJobCategories } from '@/hooks/useJobs';
import { useAuthStore } from '@/stores/authStore';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const initialForm = {
  title: '',
  department: '',
  category_id: '',
  employment_type: 'full-time',
  experience_level: 'mid',
  location: '',
  location_type: 'onsite',
  salary_min: '',
  salary_max: '',
  salary_currency: 'IDR',
  salary_visible: true,
  description: '',
  responsibilities: '',
  requirements: '',
  nice_to_have: '',
  benefits: '',
  skills: '',
  headcount: '1',
  deadline: '',
  status: 'draft',
  is_featured: false,
  banner_url: '',
};

export default function JobCreatePage() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const qc = useQueryClient();
  const isEditing = Boolean(jobId);
  const { data: categories } = useJobCategories();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState(initialForm);
  const [bannerUploading, setBannerUploading] = useState(false);

  const { data: existingJob, isLoading: isJobLoading } = useQuery({
    queryKey: ['admin-job', jobId],
    enabled: isEditing,
    queryFn: async () => {
      const { data, error } = await supabase.from('job_postings').select('*').eq('id', jobId!).single();
      if (error) throw error;
      return data as any;
    },
  });

  useEffect(() => {
    if (!existingJob) return;
    setForm({
      title: existingJob.title || '',
      department: existingJob.department || '',
      category_id: existingJob.category_id || '',
      employment_type: existingJob.employment_type || 'full-time',
      experience_level: existingJob.experience_level || 'mid',
      location: existingJob.location || '',
      location_type: existingJob.location_type || 'onsite',
      salary_min: existingJob.salary_min ? String(existingJob.salary_min) : '',
      salary_max: existingJob.salary_max ? String(existingJob.salary_max) : '',
      salary_currency: existingJob.salary_currency || 'IDR',
      salary_visible: existingJob.salary_visible ?? true,
      description: existingJob.description || '',
      responsibilities: existingJob.responsibilities || '',
      requirements: existingJob.requirements || '',
      nice_to_have: existingJob.nice_to_have || '',
      benefits: existingJob.benefits || '',
      skills: Array.isArray(existingJob.skills) ? existingJob.skills.join(', ') : '',
      headcount: existingJob.headcount ? String(existingJob.headcount) : '1',
      deadline: existingJob.deadline || '',
      status: existingJob.status || 'draft',
      is_featured: existingJob.is_featured ?? false,
      banner_url: existingJob.banner_url || '',
    });
  }, [existingJob]);

  const update = (k: string, v: any) => setForm((current) => ({ ...current, [k]: v }));

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Banner must be an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Banner is too large. Maximum size is 8MB.');
      return;
    }

    setBannerUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
      const filePath = `jobs/${jobId || Date.now()}-${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from('company').upload(filePath, file);
      if (error) throw error;
      const { data } = supabase.storage.from('company').getPublicUrl(filePath);
      update('banner_url', data.publicUrl);
      toast.success('Banner uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload banner');
    } finally {
      setBannerUploading(false);
      e.target.value = '';
    }
  };

  const saveJob = useMutation({
    mutationFn: async (status: string) => {
      const payload: Record<string, any> = {
        title: form.title,
        department: form.department,
        category_id: form.category_id || null,
        employment_type: form.employment_type,
        experience_level: form.experience_level,
        location: form.location,
        location_type: form.location_type,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        salary_currency: form.salary_currency,
        salary_visible: form.salary_visible,
        description: form.description,
        responsibilities: form.responsibilities,
        requirements: form.requirements,
        nice_to_have: form.nice_to_have || null,
        benefits: form.benefits || null,
        skills: form.skills ? form.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        headcount: parseInt(form.headcount) || 1,
        deadline: form.deadline || null,
        status,
        is_featured: form.is_featured,
        banner_url: form.banner_url || null,
      };

      if (isEditing) {
        const { error } = await supabase.from('job_postings').update(payload).eq('id', jobId!);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from('job_postings').insert({
        ...payload,
        slug: `${slugify(form.title)}-${Date.now().toString(36)}`,
        created_by: user?.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      qc.invalidateQueries({ queryKey: ['jobs'] });
      qc.invalidateQueries({ queryKey: ['featured-jobs'] });
      if (jobId) qc.invalidateQueries({ queryKey: ['admin-job', jobId] });
      toast.success(isEditing ? 'Job updated!' : 'Job created!');
      navigate('/admin/jobs');
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isJobLoading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-heading text-xl font-bold text-foreground">{isEditing ? 'Edit Job Posting' : 'Create Job Posting'}</h1>

      <div className="card-elevated space-y-5 p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label className="text-sm">Banner image</Label>
              <p className="text-xs text-muted-foreground">Upload a banner to show on the public job detail page.</p>
            </div>
            <label>
              <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={bannerUploading} />
              <Button type="button" variant="outline" asChild>
                <span>{bannerUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><ImagePlus className="mr-2 h-4 w-4" /> Upload banner</>}</span>
              </Button>
            </label>
          </div>

          {form.banner_url ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <img src={form.banner_url} alt="Job banner preview" className="aspect-[16/7] w-full object-cover" loading="lazy" />
              <div className="flex justify-end border-t border-border p-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => update('banner_url', '')}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remove banner
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
              No banner uploaded yet.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><Label className="text-sm">Job Title *</Label><Input value={form.title} onChange={(e) => update('title', e.target.value)} className="mt-1.5" required /></div>
          <div><Label className="text-sm">Department *</Label><Input value={form.department} onChange={(e) => update('department', e.target.value)} className="mt-1.5" required /></div>
          <div>
            <Label className="text-sm">Category</Label>
            <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select category</option>
              {(categories || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><Label className="text-sm">Location *</Label><Input value={form.location} onChange={(e) => update('location', e.target.value)} className="mt-1.5" required /></div>
          <div>
            <Label className="text-sm">Employment Type</Label>
            <select value={form.employment_type} onChange={(e) => update('employment_type', e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-sm">Experience Level</Label>
            <select value={form.experience_level} onChange={(e) => update('experience_level', e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['entry', 'mid', 'senior', 'lead', 'executive'].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-sm">Location Type</Label>
            <select value={form.location_type} onChange={(e) => update('location_type', e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['remote', 'onsite', 'hybrid'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><Label className="text-sm">Headcount</Label><Input type="number" value={form.headcount} onChange={(e) => update('headcount', e.target.value)} className="mt-1.5" min="1" /></div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div><Label className="text-sm">Salary Min</Label><Input type="number" value={form.salary_min} onChange={(e) => update('salary_min', e.target.value)} className="mt-1.5" /></div>
          <div><Label className="text-sm">Salary Max</Label><Input type="number" value={form.salary_max} onChange={(e) => update('salary_max', e.target.value)} className="mt-1.5" /></div>
          <div>
            <Label className="text-sm">Currency</Label>
            <select value={form.salary_currency} onChange={(e) => update('salary_currency', e.target.value)} className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {['IDR', 'USD', 'SGD'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div><Label className="text-sm">Description *</Label><Textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="mt-1.5" rows={4} required /></div>
        <div><Label className="text-sm">Responsibilities *</Label><Textarea value={form.responsibilities} onChange={(e) => update('responsibilities', e.target.value)} className="mt-1.5" rows={4} required /></div>
        <div><Label className="text-sm">Requirements *</Label><Textarea value={form.requirements} onChange={(e) => update('requirements', e.target.value)} className="mt-1.5" rows={4} required /></div>
        <div><Label className="text-sm">Nice to Have</Label><Textarea value={form.nice_to_have} onChange={(e) => update('nice_to_have', e.target.value)} className="mt-1.5" rows={3} /></div>
        <div><Label className="text-sm">Benefits</Label><Textarea value={form.benefits} onChange={(e) => update('benefits', e.target.value)} className="mt-1.5" rows={3} /></div>
        <div><Label className="text-sm">Skills (comma-separated)</Label><Input value={form.skills} onChange={(e) => update('skills', e.target.value)} className="mt-1.5" placeholder="React, TypeScript, Node.js" /></div>
        <div><Label className="text-sm">Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} className="mt-1.5" /></div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.salary_visible} onChange={(e) => update('salary_visible', e.target.checked)} className="rounded" /> Show salary
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="rounded" /> Featured
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={() => saveJob.mutate('draft')} variant="outline" disabled={saveJob.isPending || bannerUploading}>Save as Draft</Button>
          <Button onClick={() => saveJob.mutate('published')} disabled={saveJob.isPending || bannerUploading}>{isEditing ? 'Save Changes' : 'Publish'}</Button>
        </div>
      </div>
    </div>
  );
}
