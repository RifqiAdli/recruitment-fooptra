import { Link } from 'react-router-dom';
import { Search, Briefcase, Users, Award, ArrowRight, CheckCircle, Code2, Palette, Megaphone, TrendingUp, DollarSign, Settings, UserCheck, Box, BarChart3, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageTransition } from '@/components/shared/PageTransition';
import { useFeaturedJobs, useJobCategories, useJobs } from '@/hooks/useJobs';
import { JobCard } from '@/components/shared/JobCard';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore } from '@/stores/uiStore';

const iconMap: Record<string, React.ElementType> = {
  Code2, Palette, Megaphone, TrendingUp, DollarSign, Settings, Users: UserCheck, Box, BarChart3, Scale,
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: featuredJobs, isLoading: jobsLoading } = useFeaturedJobs();
  const { data: categories, isLoading: catsLoading } = useJobCategories();
  const { data: allJobs } = useJobs();
  const t = useUIStore((s) => s.t);

  const stats = [
    { label: t('home.stats.openPositions'), value: '120+', icon: Briefcase },
    { label: t('home.stats.departments'), value: '10', icon: Users },
    { label: t('home.stats.candidatesPlaced'), value: '2,500+', icon: Award },
    { label: t('home.stats.successRate'), value: '94%', icon: CheckCircle },
  ];

  const steps = [
    { step: '01', title: t('home.step1.title'), description: t('home.step1.desc') },
    { step: '02', title: t('home.step2.title'), description: t('home.step2.desc') },
    { step: '03', title: t('home.step3.title'), description: t('home.step3.desc') },
  ];

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-navy py-20 lg:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-primary-dark blur-3xl" />
        </div>
        <div className="container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-foreground leading-tight mb-6">
              {t('home.hero.title1')}<span className="text-primary">{t('home.hero.titleHighlight')}</span>{t('home.hero.title2')}
            </h1>
            <p className="text-lg text-navy-foreground/70 mb-10 max-w-xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('home.hero.searchPlaceholder')} className="pl-10 h-12 bg-card border-border" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Link to={`/jobs${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`}>
                <Button size="lg" className="h-12 px-8 w-full sm:w-auto">{t('home.hero.searchBtn')}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-border bg-card">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-heading text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">{t('home.featured.title')}</h2>
              <p className="text-muted-foreground mt-2">{t('home.featured.subtitle')}</p>
            </div>
            <Link to="/jobs" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {t('home.featured.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {jobsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredJobs || []).map((job: any, i: number) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <JobCard job={{ ...job, category: job.job_categories, skills: job.skills || [] }} />
                </motion.div>
              ))}
            </div>
          )}
          <div className="mt-8 text-center sm:hidden">
            <Link to="/jobs"><Button variant="outline">{t('home.featured.viewAllBtn')}</Button></Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24 bg-card border-y border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground">{t('home.categories.title')}</h2>
            <p className="text-muted-foreground mt-2">{t('home.categories.subtitle')}</p>
          </div>
          {catsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {(categories || []).map((cat: any, i: number) => {
                const Icon = iconMap[cat.icon || ''] || Briefcase;
                const jobCount = (allJobs || []).filter((j: any) => j.category_id === cat.id).length;
                return (
                  <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/jobs?category=${cat.slug}`} className="card-elevated p-5 flex flex-col items-center text-center hover:border-primary/30 transition-all duration-200">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="font-heading font-semibold text-sm text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{jobCount} {jobCount === 1 ? t('home.categories.job') : t('home.categories.jobs')}</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground">{t('home.howItWorks.title')}</h2>
            <p className="text-muted-foreground mt-2">{t('home.howItWorks.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary mb-4">
                  <span className="font-heading font-bold text-primary-foreground">{step.step}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 gradient-navy">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-navy-foreground mb-4">{t('home.cta.title')}</h2>
            <p className="text-navy-foreground/70 mb-8 max-w-lg mx-auto">{t('home.cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register"><Button size="lg" className="px-8">{t('home.cta.register')}</Button></Link>
              <Link to="/jobs"><Button size="lg" variant="outline" className="px-8 border-navy-foreground/30 text-navy-foreground hover:bg-navy-foreground/10">{t('home.cta.browseJobs')}</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
