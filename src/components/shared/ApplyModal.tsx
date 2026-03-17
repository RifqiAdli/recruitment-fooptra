import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { useApplyToJob } from '@/hooks/useApplications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface ApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
}

export function ApplyModal({ open, onOpenChange, jobId, jobTitle }: ApplyModalProps) {
  const { user, profile } = useAuthStore();
  const t = useUIStore((s) => s.t);
  const applyMutation = useApplyToJob();
  const [step, setStep] = useState(1);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url || '');
  const [expectedSalary, setExpectedSalary] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('apply.error.fileTooLarge'));
      return;
    }
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error(t('apply.error.invalidFormat'));
      return;
    }
    setCvFile(file);
  };

  const handleSubmit = async () => {
    if (!user || !cvFile) return;
    setUploading(true);
    try {
      const ext = cvFile.name.split('.').pop();
      const filePath = `${user.id}/${jobId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('cvs').upload(filePath, cvFile);
      if (uploadError) throw uploadError;

      await applyMutation.mutateAsync({
        job_id: jobId,
        applicant_id: user.id,
        cv_url: filePath,
        cv_filename: cvFile.name,
        cover_letter: coverLetter || undefined,
        portfolio_url: portfolioUrl || undefined,
        expected_salary: expectedSalary ? parseInt(expectedSalary) : undefined,
      });

      setStep(3);
      toast.success(t('apply.success.toast'));
    } catch (err: any) {
      if (err?.code === '23505') {
        toast.error(t('apply.error.duplicate'));
      } else {
        toast.error(err?.message || t('apply.error.failed'));
      }
    } finally {
      setUploading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setCvFile(null);
    setCoverLetter('');
    setPortfolioUrl(profile?.portfolio_url || '');
    setExpectedSalary('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {step === 3 ? t('apply.submittedTitle') : t('apply.title', { jobTitle })}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>{t('apply.fullName')}</Label>
              <Input value={profile?.full_name || ''} disabled className="bg-muted" />
            </div>
            <div>
              <Label>{t('apply.email')}</Label>
              <Input value={profile?.email || ''} disabled className="bg-muted" />
            </div>
            <div>
              <Label>{t('apply.uploadCv')}</Label>
              <div className="mt-1.5 rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50">
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="cv-upload" />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  {cvFile ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <FileText className="h-5 w-5" />
                      <span className="text-sm font-medium">{cvFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{t('apply.uploadHint')}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep(2)} disabled={!cvFile}>
              {t('apply.continue')}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>{t('apply.coverLetter')}</Label>
              <Textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder={t('apply.coverLetterPlaceholder')}
              />
            </div>
            <div>
              <Label>{t('apply.portfolioUrl')}</Label>
              <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>{t('apply.expectedSalary')}</Label>
              <Input type="number" value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="e.g. 15000000" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>{t('apply.back')}</Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={uploading}>
                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('apply.submitting')}</> : t('apply.submit')}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-primary" />
            <p className="mb-1 font-medium text-foreground">{t('apply.successTitle')}</p>
            <p className="mb-6 text-sm text-muted-foreground">{t('apply.successSubtitle')}</p>
            <Button onClick={resetAndClose}>{t('apply.close')}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
