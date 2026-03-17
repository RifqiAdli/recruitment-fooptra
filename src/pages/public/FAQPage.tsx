import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageTransition } from '@/components/shared/PageTransition';
import { useUIStore } from '@/stores/uiStore';

const faqDataById = [
  { category: 'Umum', question: 'Apa itu Fooptra?', answer: 'Fooptra adalah platform food waste tracking berbasis AI yang membantu mengurangi pemborosan makanan. Halaman karir ini adalah portal rekrutmen untuk bergabung dengan tim Fooptra.' },
  { category: 'Umum', question: 'Apakah melamar kerja di Fooptra gratis?', answer: 'Ya! Membuat akun, menjelajahi lowongan, dan mengirim lamaran sepenuhnya gratis untuk semua kandidat.' },
  { category: 'Lamaran', question: 'Bagaimana cara melamar pekerjaan?', answer: 'Temukan lowongan yang Anda minati, klik "Lamar Sekarang", dan kirimkan CV beserta informasi yang diperlukan. Anda perlu membuat akun terlebih dahulu.' },
  { category: 'Lamaran', question: 'Bisakah saya melacak status lamaran?', answer: 'Ya, setelah login Anda dapat melihat semua lamaran dan pembaruan status real-time dari dashboard Anda.' },
  { category: 'Akun', question: 'Bagaimana cara mereset password?', answer: 'Klik "Lupa Password" di halaman login, masukkan email Anda, dan ikuti instruksi di email reset.' },
];

const faqDataByEn = [
  { category: 'General', question: 'What is Fooptra?', answer: 'Fooptra is an AI-powered food waste tracking platform that helps reduce food waste. This careers page is the recruitment portal to join the Fooptra team.' },
  { category: 'General', question: 'Is applying at Fooptra free?', answer: 'Yes! Creating an account, browsing jobs, and submitting applications is completely free for all candidates.' },
  { category: 'Application', question: 'How do I apply for a job?', answer: 'Find a job you like, click "Apply Now", and submit your CV along with any required information. You\'ll need to create an account first.' },
  { category: 'Application', question: 'Can I track my application status?', answer: 'Yes, once logged in you can view all your applications and their real-time status updates from your dashboard.' },
  { category: 'Account', question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions in the reset email.' },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t, language } = useUIStore();

  const faqData = language === 'id' ? faqDataById : faqDataByEn;

  const filtered = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(filtered.map((f) => f.category))];

  return (
    <PageTransition>
      <section className="gradient-navy py-16">
        <div className="container text-center">
          <h1 className="font-heading text-4xl font-bold text-navy-foreground mb-4">{t('faq.title')}</h1>
          <p className="text-navy-foreground/70 mb-8">{t('faq.subtitle')}</p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('faq.searchPlaceholder')}
              className="pl-10 bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container py-12 max-w-3xl">
        {categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">{cat}</h2>
            <div className="space-y-3">
              {filtered
                .filter((f) => f.category === cat)
                .map((faq, i) => {
                  const globalIndex = faqData.indexOf(faq);
                  const isOpen = openIndex === globalIndex;
                  return (
                    <div key={i} className="card-elevated overflow-hidden">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="font-medium text-sm text-foreground">{faq.question}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('faq.noResults')}</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
