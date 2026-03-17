import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, LayoutList, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/shared/JobCard';
import { PageTransition } from '@/components/shared/PageTransition';
import { useJobs, useJobCategories } from '@/hooks/useJobs';
import { employmentTypeLabels, locationTypeLabels, experienceLevelLabels, cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore } from '@/stores/uiStore';

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocationType, setSelectedLocationType] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const t = useUIStore((s) => s.t);

  const { data: categories } = useJobCategories();
  const { data: rawJobs, isLoading } = useJobs();

  const toggleFilter = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const filteredJobs = useMemo(() => {
    return (rawJobs || []).filter((job: any) => {
      if (query && !job.title.toLowerCase().includes(query.toLowerCase()) && !job.department.toLowerCase().includes(query.toLowerCase())) return false;
      if (selectedTypes.length && !selectedTypes.includes(job.employment_type)) return false;
      if (selectedLocationType.length && !selectedLocationType.includes(job.location_type)) return false;
      if (selectedLevel.length && !selectedLevel.includes(job.experience_level)) return false;
      if (selectedCategory && job.job_categories?.slug !== selectedCategory) return false;
      return true;
    });
  }, [rawJobs, query, selectedTypes, selectedLocationType, selectedLevel, selectedCategory]);

  const hasFilters = selectedTypes.length > 0 || selectedLocationType.length > 0 || selectedLevel.length > 0 || selectedCategory !== '';

  const clearFilters = () => { setSelectedTypes([]); setSelectedLocationType([]); setSelectedLevel([]); setSelectedCategory(''); setQuery(''); };

  return (
    <PageTransition>
      <section className="gradient-navy py-12">
        <div className="container">
          <h1 className="font-heading text-3xl font-bold text-navy-foreground mb-2">{t('jobs.title')}</h1>
          <p className="text-navy-foreground/70 mb-6">{t('jobs.subtitle', { count: String(filteredJobs.length) })}</p>
          <div className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('jobs.searchPlaceholder')} className="pl-10 h-11 bg-card border-border" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11 bg-card border-border shrink-0 lg:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="flex gap-8">
          <aside className={cn('w-64 shrink-0 space-y-6', showFilters ? 'fixed inset-0 z-50 bg-background p-6 overflow-y-auto lg:static lg:p-0 lg:z-auto' : 'hidden lg:block')}>
            {showFilters && (
              <div className="flex items-center justify-between lg:hidden mb-4">
                <h3 className="font-heading font-semibold">{t('jobs.filters')}</h3>
                <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
              </div>
            )}
            {hasFilters && <button onClick={clearFilters} className="text-sm text-primary hover:underline">{t('jobs.clearFilters')}</button>}

            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">{t('jobs.category')}</h4>
              <div className="space-y-1.5">
                {(categories || []).map((cat: any) => (
                  <button key={cat.slug} onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                    className={cn('block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors',
                      selectedCategory === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">{t('jobs.employmentType')}</h4>
              <div className="space-y-2">
                {Object.entries(employmentTypeLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={selectedTypes.includes(key)} onChange={() => toggleFilter(selectedTypes, key, setSelectedTypes)} className="rounded border-border text-primary focus:ring-primary" />
                    <span className="text-muted-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">{t('jobs.workArrangement')}</h4>
              <div className="space-y-2">
                {Object.entries(locationTypeLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={selectedLocationType.includes(key)} onChange={() => toggleFilter(selectedLocationType, key, setSelectedLocationType)} className="rounded border-border text-primary focus:ring-primary" />
                    <span className="text-muted-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">{t('jobs.experienceLevel')}</h4>
              <div className="space-y-2">
                {Object.entries(experienceLevelLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={selectedLevel.includes(key)} onChange={() => toggleFilter(selectedLevel, key, setSelectedLevel)} className="rounded border-border text-primary focus:ring-primary" />
                    <span className="text-muted-foreground">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showFilters && <Button className="w-full lg:hidden" onClick={() => setShowFilters(false)}>{t('jobs.showResults', { count: String(filteredJobs.length) })}</Button>}
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filteredJobs.length}</span> {t('jobs.jobsFound')}</p>
              <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
                <button onClick={() => setView('grid')} className={cn('p-1.5 rounded', view === 'grid' ? 'bg-accent' : '')} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setView('list')} className={cn('p-1.5 rounded', view === 'list' ? 'bg-accent' : '')} aria-label="List view"><LayoutList className="h-4 w-4" /></button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{t('jobs.noJobs.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('jobs.noJobs.subtitle')}</p>
                <Button variant="outline" onClick={clearFilters}>{t('jobs.clearFilters')}</Button>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredJobs.map((job: any) => <JobCard key={job.id} job={{ ...job, category: job.job_categories, skills: job.skills || [] }} variant="grid" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job: any) => <JobCard key={job.id} job={{ ...job, category: job.job_categories, skills: job.skills || [] }} variant="list" />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
