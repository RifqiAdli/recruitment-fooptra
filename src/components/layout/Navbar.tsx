import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, LogOut, User, Bell, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useNotifications } from '@/hooks/useNotifications';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuthStore();
  const { t, language, setLanguage } = useUIStore();
  const { data: notifications } = useNotifications();
  const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length;

  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.jobs'), href: '/jobs' },
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.faq'), href: '/faq' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleLang = () => setLanguage(language === 'id' ? 'en' : 'id');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <span className="font-heading text-sm font-bold text-primary-foreground">F</span>
          </div>
          <span className="font-heading text-xl font-bold text-foreground">Fooptra</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}
              className={cn('px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                location.pathname === link.href ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Switch language">
            <Globe className="h-4 w-4" />
            <span className="uppercase text-xs font-bold">{language}</span>
          </button>
          {user ? (
            <>
              <Link to="/dashboard/notifications" className="relative p-2 text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {profile?.full_name?.split(' ')[0] || t('nav.dashboard')}
                </Button>
              </Link>
              {role === 'admin' && (
                <Link to="/admin"><Button variant="outline" size="sm">{t('nav.admin')}</Button></Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="h-4 w-4" /></Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">{t('nav.signIn')}</Button></Link>
              <Link to="/register"><Button size="sm">{t('nav.getStarted')}</Button></Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={toggleLang} className="p-2 text-foreground" title="Switch language">
            <Globe className="h-5 w-5" />
          </button>
          <button className="p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
              className={cn('block px-4 py-2.5 rounded-md text-sm font-medium transition-colors',
                location.pathname === link.href ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}>
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border flex gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">{t('nav.dashboard')}</Button>
                </Link>
                <Button className="flex-1" size="sm" onClick={() => { handleSignOut(); setMobileOpen(false); }}>{t('common.signOut')}</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">{t('nav.signIn')}</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full" size="sm">{t('nav.getStarted')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
