import { Link } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';

export function Footer() {
  const t = useUIStore((s) => s.t);

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <span className="font-heading text-sm font-bold text-primary-foreground">F</span>
              </div>
              <span className="font-heading text-xl font-bold text-foreground">Fooptra</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-4">{t('footer.forCandidates')}</h4>
            <ul className="space-y-2.5">
              <li><Link to="/jobs" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.browseJobs')}</Link></li>
              <li><Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.createAccount')}</Link></li>
              <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-muted-foreground">{t('footer.privacy')}</span></li>
              <li><span className="text-sm text-muted-foreground">{t('footer.terms')}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fooptra. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
