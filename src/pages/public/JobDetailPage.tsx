import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Clock, DollarSign, Users, Calendar, Share2, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/shared/PageTransition';
import { ApplyModal } from '@/components/shared/ApplyModal';
import { useJob } from '@/hooks/useJobs';
import { useAuthStore } from '@/stores/authStore';
import { useSavedJobs, useToggleSaveJob } from '@/hooks/useSavedJobs';
import { formatSalary, formatRelativeDate, employmentTypeLabels, locationTypeLabels, experienceLevelLabels } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useUIStore } from '@/stores/uiStore';

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: rawJob, isLoading } = useJob(slug || '');
  const { user } = useAuthStore();
  const { data: savedJobs } = useSavedJobs();
  const toggleSave = useToggleSaveJob();
  const [applyOpen, setApplyOpen] = useState(false);
  const { t, language } = useUIStore();
  const locale = language === 'id' ? 'id-ID' : 'en-US';

  if (isLoading) {
    return <PageTransition><div className="container space-y-6 py-12">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div></PageTransition>;
  }

  const job = rawJob ? { ...rawJob, category: (rawJob as any).job_categories, skills: rawJob.skills || [], banner_url: (rawJob as any).banner_url } : null;

  if (!job) {
    return (
      <PageTransition>
        <div className="container py-20 text-center">
          <h1 className="mb-2 font-heading text-2xl font-bold">{t('jobDetail.notFoundTitle')}</h1>
          <p className="mb-4 text-muted-foreground">{t('jobDetail.notFoundSubtitle')}</p>
          <Link to="/jobs"><Button>{t('footer.browseJobs')}</Button></Link>
        </div>
      </PageTransition>
    );
  }

  const isSaved = (savedJobs || []).some((s: any) => s.job_id === job.id);

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setApplyOpen(true);
  };

  const handleSaveClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleSave.mutate({ jobId: job.id, isSaved });
  };

  return (
    <PageTransition>
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> {t('common.backToJobs')}
          </Link>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-8">
            {job.banner_url && (
              <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
                <img
                  src={job.banner_url}
                  alt={t('jobDetail.previewAlt', { title: job.title })}
                  className="aspect-[16/7] w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div>
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-bold"
                  style={{ backgroundColor: job.category?.color ? `${job.category.color}20` : undefined, color: job.category?.color }}>
                  {job.department.charAt(0)}
                </div>
                <div>
                  <h1 className="font-heading text-2xl font-bold text-foreground lg:text-3xl">{job.title}</h1>
                  <p className="mt-1 text-muted-foreground">{job.department}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="pill-badge bg-primary/10 text-primary">{employmentTypeLabels[job.employment_type]}</span>
                <span className="pill-badge bg-accent text-accent-foreground">{locationTypeLabels[job.location_type]}</span>
                <span className="pill-badge bg-accent text-accent-foreground">{experienceLevelLabels[job.experience_level]}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="card-elevated p-4">
                <MapPin className="mb-1 h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{t('jobDetail.location')}</p>
                <p className="text-sm font-medium text-foreground">{job.location}</p>
              </div>
              {job.salary_visible && (
                <div className="card-elevated p-4">
                  <DollarSign className="mb-1 h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{t('jobDetail.salary')}</p>
                  <p className="text-sm font-medium text-foreground">{formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined, job.salary_currency ?? undefined)}</p>
                </div>
              )}
              <div className="card-elevated p-4">
                <Users className="mb-1 h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{t('jobDetail.openings')}</p>
                <p className="text-sm font-medium text-foreground">{job.headcount}</p>
              </div>
              <div className="card-elevated p-4">
                <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{t('jobDetail.posted')}</p>
                <p className="text-sm font-medium text-foreground">{formatRelativeDate(job.created_at)}</p>
              </div>
            </div>

            <div className="space-y-8">
              <ContentSection title={t('jobDetail.description')} html={job.description} />
              <ContentSection title={t('jobDetail.responsibilities')} html={job.responsibilities} />
              <ContentSection title={t('jobDetail.requirements')} html={job.requirements} />
              {job.nice_to_have && <ContentSection title={t('jobDetail.niceToHave')} html={job.nice_to_have} />}
              {job.benefits && <ContentSection title={t('jobDetail.benefits')} html={job.benefits} />}
            </div>

            {job.skills.length > 0 && (
              <div>
                <h3 className="mb-3 font-heading text-lg font-semibold text-foreground">{t('jobDetail.requiredSkills')}</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string) => <span key={skill} className="pill-badge bg-secondary text-secondary-foreground">{skill}</span>)}
                </div>
              </div>
            )}
          </div>

          <aside className="w-full shrink-0 lg:w-80">
            <div className="card-elevated space-y-4 p-6 lg:sticky lg:top-24">
              <Button className="w-full" size="lg" onClick={handleApplyClick}>{t('common.applyNow')}</Button>
              <Button variant="outline" className="w-full" size="lg" onClick={handleSaveClick}>
                <Heart className={`mr-2 h-4 w-4 ${isSaved ? 'fill-primary text-primary' : ''}`} />
                {isSaved ? t('common.saved') : t('common.saveJob')}
              </Button>
              <Button variant="ghost" className="w-full" size="sm" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success(t('jobDetail.linkCopied')); }}>
                <Share2 className="mr-2 h-4 w-4" /> {t('common.copyLink')}
              </Button>
              {job.deadline && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('jobDetail.deadline')}:</span>
                    <span className="font-medium text-foreground">{new Date(job.deadline).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              )}
              <div className="border-t border-border pt-4 text-center">
                <p className="text-xs text-muted-foreground">{t('jobDetail.peopleViewed', { count: String(job.views_count) })}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ApplyModal open={applyOpen} onOpenChange={setApplyOpen} jobId={job.id} jobTitle={job.title} />
    </PageTransition>
  );
}

function ContentSection({ title, html }: { title: string; html: string }) {
  return (
    <div>
      <h3 className="mb-3 font-heading text-lg font-semibold text-foreground">{title}</h3>
      <div className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:marker:text-primary" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
