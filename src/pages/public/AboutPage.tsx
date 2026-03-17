import { PageTransition } from '@/components/shared/PageTransition';
import { Target, Leaf, Lightbulb, Users } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export default function AboutPage() {
  const t = useUIStore((s) => s.t);

  const values = [
    { icon: Target, title: t('about.value1.title'), description: t('about.value1.desc') },
    { icon: Leaf, title: t('about.value2.title'), description: t('about.value2.desc') },
    { icon: Lightbulb, title: t('about.value3.title'), description: t('about.value3.desc') },
    { icon: Users, title: t('about.value4.title'), description: t('about.value4.desc') },
  ];

  return (
    <PageTransition>
      <section className="gradient-navy py-16">
        <div className="container text-center">
          <h1 className="font-heading text-4xl font-bold text-navy-foreground mb-4">{t('about.title')}</h1>
          <p className="text-navy-foreground/70 max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </div>
      </section>

      <section className="py-16 container max-w-3xl">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-4">{t('about.story.title')}</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">{t('about.story.p1')}</p>
        <p className="text-muted-foreground leading-relaxed">{t('about.story.p2')}</p>
      </section>

      <section className="py-16 bg-card border-y border-border">
        <div className="container">
          <h2 className="font-heading text-2xl font-bold text-foreground text-center mb-10">{t('about.values.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="card-elevated p-6 text-center">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
