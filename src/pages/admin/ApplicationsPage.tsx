import { useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAllApplications, useUpdateApplicationStatus } from '@/hooks/useApplications';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Eye, FileText, Mail, Phone, Wallet } from 'lucide-react';

const statusOptions = ['pending', 'reviewing', 'shortlisted', 'interview_scheduled', 'interviewed', 'offered', 'hired', 'rejected'];
const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  reviewing: 'bg-primary/10 text-primary',
  shortlisted: 'bg-info/10 text-info',
  interview_scheduled: 'bg-secondary text-secondary-foreground',
  interviewed: 'bg-info/10 text-info',
  offered: 'bg-warning/10 text-warning',
  hired: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

const humanizeStatus = (status: string) => status.replace(/_/g, ' ');

export default function AdminApplicationsPage() {
  const { data: applications, isLoading } = useAllApplications();
  const updateStatus = useUpdateApplicationStatus();
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

  const { data: signedCvUrl, isLoading: isCvLoading } = useQuery({
    queryKey: ['admin-cv-url', selectedApplication?.id, selectedApplication?.cv_url],
    enabled: !!selectedApplication,
    queryFn: async () => {
      if (!selectedApplication?.cv_url) return null;
      const storagePath = getBucketFilePath('cvs', selectedApplication.cv_url);
      if (!storagePath) return selectedApplication.cv_url;
      const { data, error } = await supabase.storage.from('cvs').createSignedUrl(storagePath, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });

  const previousApplications = useMemo(() => {
    if (!selectedApplication || !applications) return [];
    return applications
      .filter((app: any) => app.applicant_id === selectedApplication.applicant_id && app.id !== selectedApplication.id)
      .sort((a: any, b: any) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime());
  }, [applications, selectedApplication]);

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast.success('Status updated');
          if (selectedApplication?.id === id) {
            setSelectedApplication((current: any) => current ? { ...current, status } : current);
          }
        },
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  if (isLoading) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <h1 className="font-heading text-xl font-bold text-foreground">Applications ({(applications || []).length})</h1>

        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50">
                  <th className="p-3 text-left font-medium text-muted-foreground">Candidate</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Job</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Applied</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(applications || []).map((app: any) => (
                  <tr key={app.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="p-3">
                      <p className="font-medium text-foreground">{app.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{app.profiles?.email}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-foreground">{app.job_postings?.title}</p>
                      <p className="text-xs text-muted-foreground">{app.job_postings?.department}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={cn('pill-badge cursor-pointer border-0', statusColors[app.status])}
                      >
                        {statusOptions.map((s) => <option key={s} value={s}>{humanizeStatus(s)}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                          <Eye className="mr-2 h-4 w-4" /> View details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Dialog ── */}
      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        {/* flex+col so DialogHeader stays pinned and only the body scrolls */}
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl lg:max-w-6xl">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle className="font-heading text-xl">
              {selectedApplication?.profiles?.full_name || 'Application details'}
            </DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            /* scrollable area */
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
              {/* two-column on lg, single on smaller */}
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

                {/* ── LEFT COLUMN ── */}
                <div className="space-y-6">
                  {/* Candidate info card */}
                  <section className="card-elevated p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Applied for</p>
                        <h2 className="font-heading text-lg font-semibold text-foreground">{selectedApplication.job_postings?.title}</h2>
                        <p className="text-sm text-muted-foreground">{selectedApplication.job_postings?.department}</p>
                      </div>
                      <Badge className={cn('border-0 capitalize', statusColors[selectedApplication.status])}>
                        {humanizeStatus(selectedApplication.status)}
                      </Badge>
                    </div>

                    {/* Info rows — 1 col on mobile, 2 on sm+ */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={selectedApplication.profiles?.email || '—'} />
                      <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={selectedApplication.profiles?.phone || '—'} />
                      <InfoRow label="Applied on" value={new Date(selectedApplication.applied_at).toLocaleString()} />
                      <InfoRow
                        icon={<Wallet className="h-4 w-4" />}
                        label="Expected salary"
                        value={
                          selectedApplication.expected_salary
                            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(selectedApplication.expected_salary)
                            : '—'
                        }
                      />
                    </div>

                    {/* Status + portfolio — stack on mobile, side-by-side on sm */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Update status</label>
                        <select
                          value={selectedApplication.status}
                          onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{humanizeStatus(status)}</option>
                          ))}
                        </select>
                      </div>
                      {selectedApplication.portfolio_url && (
                        <Button asChild variant="outline" className="shrink-0">
                          <a href={selectedApplication.portfolio_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Portfolio
                          </a>
                        </Button>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 font-heading text-base font-semibold text-foreground">Cover letter</h3>
                      <div className="rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-muted-foreground">
                        {selectedApplication.cover_letter || 'No cover letter submitted.'}
                      </div>
                    </div>
                  </section>

                  {/* CV card */}
                  <section className="card-elevated p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-base font-semibold text-foreground">CV</h3>
                        <p className="text-sm text-muted-foreground">{selectedApplication.cv_filename}</p>
                      </div>
                      {signedCvUrl && (
                        <Button asChild>
                          <a href={signedCvUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Open CV
                          </a>
                        </Button>
                      )}
                    </div>

                    {isCvLoading ? (
                      <Skeleton className="h-[380px] rounded-xl" />
                    ) : isPdfFile(selectedApplication.cv_filename) && signedCvUrl ? (
                      <iframe
                        title={`CV ${selectedApplication.cv_filename}`}
                        src={signedCvUrl}
                        className="h-[380px] w-full rounded-xl border border-border"
                      />
                    ) : (
                      <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-6 text-center">
                        <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Preview is not available for this file type.</p>
                      </div>
                    )}
                  </section>
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div className="space-y-6">
                  <section className="card-elevated p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-base font-semibold text-foreground">Previous submissions</h3>
                        <p className="text-sm text-muted-foreground">Other applications from this candidate.</p>
                      </div>
                      <Badge variant="secondary">{previousApplications.length}</Badge>
                    </div>

                    {!previousApplications.length ? (
                      <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                        No previous applications from this candidate.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {previousApplications.map((app: any) => (
                          <button
                            key={app.id}
                            onClick={() => setSelectedApplication(app)}
                            className="w-full rounded-xl border border-border bg-background p-4 text-left transition-colors hover:bg-accent"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">{app.job_postings?.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{new Date(app.applied_at).toLocaleString()}</p>
                              </div>
                              <span className={cn('pill-badge shrink-0 border-0 text-xs capitalize', statusColors[app.status])}>
                                {humanizeStatus(app.status)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="break-all text-sm text-foreground">{value}</p>
    </div>
  );
}

function getBucketFilePath(bucket: string, rawValue: string | null | undefined) {
  if (!rawValue) return null;
  if (!rawValue.includes('://') && !rawValue.startsWith('/')) return rawValue;
  const marker = `/${bucket}/`;
  const markerIndex = rawValue.indexOf(marker);
  if (markerIndex === -1) return null;
  return decodeURIComponent(rawValue.slice(markerIndex + marker.length).split('?')[0]);
}

function isPdfFile(filename: string | null | undefined) {
  return Boolean(filename?.toLowerCase().endsWith('.pdf'));
}