import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, Plus, Video, Phone, MapPin, Laptop, Users, Clock, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type InterviewType = 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

interface InterviewForm {
  application_id: string;
  scheduled_at: string;
  duration_minutes: number;
  type: InterviewType;
  location: string;
  meeting_url: string;
  interviewer_name: string;
  interviewer_email: string;
  notes: string;
}

const EMPTY_FORM: InterviewForm = {
  application_id: '',
  scheduled_at: '',
  duration_minutes: 60,
  type: 'video',
  location: '',
  meeting_url: '',
  interviewer_name: '',
  interviewer_email: '',
  notes: '',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVIEW_TYPES: { value: InterviewType; label: string; icon: React.ReactNode }[] = [
  { value: 'video',     label: 'Video',     icon: <Video className="h-4 w-4" /> },
  { value: 'phone',     label: 'Phone',     icon: <Phone className="h-4 w-4" /> },
  { value: 'onsite',    label: 'On-site',   icon: <MapPin className="h-4 w-4" /> },
  { value: 'technical', label: 'Technical', icon: <Laptop className="h-4 w-4" /> },
  { value: 'hr',        label: 'HR',        icon: <Users className="h-4 w-4" /> },
];

const statusColors: Record<InterviewStatus, string> = {
  scheduled:   'bg-primary/10 text-primary',
  completed:   'bg-success/10 text-success',
  cancelled:   'bg-destructive/10 text-destructive',
  rescheduled: 'bg-warning/10 text-warning',
};

const typeIcon: Record<InterviewType, React.ReactNode> = {
  video:     <Video className="h-4 w-4" />,
  phone:     <Phone className="h-4 w-4" />,
  onsite:    <MapPin className="h-4 w-4" />,
  technical: <Laptop className="h-4 w-4" />,
  hr:        <Users className="h-4 w-4" />,
};

// ─── Notification helper — throws on error so mutations catch it ──────────────

async function sendNotification({
  userId,
  title,
  message,
  referenceId,
}: {
  userId: string;
  title: string;
  message: string;
  referenceId: string;
}) {
  const { error } = await supabase.from('notifications').insert({
    user_id:        userId,
    title,
    message,
    type:           'interview',
    reference_id:   referenceId,
    reference_type: 'application',
    is_read:        false,
  });
  // Throw so the parent mutation surfaces this as an error
  if (error) throw new Error(`Notification failed: ${error.message}`);
}

function formatScheduledDate(isoString: string) {
  return new Date(isoString).toLocaleString('en-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InterviewsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<InterviewForm>(EMPTY_FORM);

  // ── Fetch interviews ───────────────────────────────────────────────────────

  const { data: interviews, isLoading } = useQuery({
    queryKey: ['admin-interviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          applications (
            id, status,
            profiles!applicant_id (full_name, email),
            job_postings!job_id (title, department)
          )
        `)
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // ── Fetch eligible applications ────────────────────────────────────────────

  const { data: eligibleApps } = useQuery({
    queryKey: ['admin-eligible-applications'],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('id, profiles!applicant_id(full_name), job_postings!job_id(title)')
        .in('status', ['shortlisted', 'interview_scheduled'])
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ── Create interview ───────────────────────────────────────────────────────

  const createInterview = useMutation({
    mutationFn: async (payload: InterviewForm) => {
      // 1. Insert interview
      const { error: insertError } = await supabase.from('interviews').insert({
        application_id:    payload.application_id,
        scheduled_at:      payload.scheduled_at,
        duration_minutes:  payload.duration_minutes,
        type:              payload.type,
        location:          payload.location || null,
        meeting_url:       payload.meeting_url || null,
        interviewer_name:  payload.interviewer_name || null,
        interviewer_email: payload.interviewer_email || null,
        notes:             payload.notes || null,
        status:            'scheduled',
      });
      if (insertError) throw insertError;

      // 2. Bump application status → interview_scheduled
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'interview_scheduled' })
        .eq('id', payload.application_id);
      if (updateError) throw updateError;

      // 3. Get applicant_id
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('applicant_id')
        .eq('id', payload.application_id)
        .single();
      if (appError) throw appError;

      // 4. Send notification — will throw if RLS blocks it
      if (appData?.applicant_id) {
        const scheduledDate = formatScheduledDate(payload.scheduled_at);
        const locationNote = payload.meeting_url
          ? ` Meeting link: ${payload.meeting_url}`
          : payload.location
          ? ` Location: ${payload.location}`
          : '';

        await sendNotification({
          userId:      appData.applicant_id,
          title:       'Interview Scheduled',
          message:     `Your ${payload.type} interview has been scheduled for ${scheduledDate}. Duration: ${payload.duration_minutes} minutes.${locationNote}`,
          referenceId: payload.application_id,
        });
      }
    },
    onSuccess: () => {
      toast.success('Interview scheduled & notification sent!');
      qc.invalidateQueries({ queryKey: ['admin-interviews'] });
      qc.invalidateQueries({ queryKey: ['admin-eligible-applications'] });
      setOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (err: any) => toast.error(err.message),
  });

  // ── Update interview status ────────────────────────────────────────────────

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InterviewStatus }) => {
      const { error } = await supabase
        .from('interviews')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      // Notify on cancelled / rescheduled
      if (status === 'cancelled' || status === 'rescheduled') {
        const { data: iv, error: ivError } = await supabase
          .from('interviews')
          .select('application_id, applications(applicant_id)')
          .eq('id', id)
          .single();
        if (ivError) throw ivError;

        const applicantId = (iv?.applications as any)?.applicant_id;
        if (applicantId && iv?.application_id) {
          await sendNotification({
            userId:      applicantId,
            title:       status === 'cancelled' ? 'Interview Cancelled' : 'Interview Rescheduled',
            message:     status === 'cancelled'
              ? 'Your scheduled interview has been cancelled. Our team will reach out to you soon.'
              : 'Your interview schedule has been updated. Please check the latest schedule.',
            referenceId: iv.application_id,
          });
        }
      }
    },
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['admin-interviews'] });
      setEditing(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  const set = (field: keyof InterviewForm, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = () => {
    if (!form.application_id) return toast.error('Please select an application.');
    if (!form.scheduled_at)   return toast.error('Please set a date and time.');
    createInterview.mutate(form);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-heading text-xl font-bold text-foreground">
            Interviews ({(interviews || []).length})
          </h1>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Schedule interview
          </Button>
        </div>

        {!(interviews || []).length ? (
          <div className="text-center py-20">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No interviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Schedule interview" to add one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(interviews || []).map((i: any) => (
              <div
                key={i.id}
                className="card-elevated p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-border bg-background p-2.5 text-muted-foreground shrink-0">
                    {typeIcon[i.type as InterviewType]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {i.applications?.profiles?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {i.applications?.job_postings?.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{i.type}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{i.duration_minutes} min</span>
                      {i.interviewer_name && (
                        <>
                          <span>•</span>
                          <span>{i.interviewer_name}</span>
                        </>
                      )}
                      {(i.location || i.meeting_url) && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[180px]">
                            {i.location || i.meeting_url}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    {new Date(i.scheduled_at).toLocaleString('en-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className={cn('border-0 capitalize', statusColors[i.status as InterviewStatus])}>
                      {i.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => setEditing(i)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Schedule dialog ──────────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setForm(EMPTY_FORM); }}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-heading">Schedule interview</DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-5 overflow-y-auto py-2 pr-1">
            <Field label="Application *">
              <select
                value={form.application_id}
                onChange={(e) => set('application_id', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a candidate…</option>
                {(eligibleApps || []).map((app: any) => (
                  <option key={app.id} value={app.id}>
                    {app.profiles?.full_name} — {app.job_postings?.title}
                  </option>
                ))}
              </select>
              {eligibleApps?.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No eligible applications. Set an application to "Shortlisted" first.
                </p>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Date & Time *">
                <Input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => set('scheduled_at', e.target.value)}
                />
              </Field>
              <Field label="Duration (min)">
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={form.duration_minutes}
                  onChange={(e) => set('duration_minutes', Number(e.target.value))}
                />
              </Field>
            </div>

            <Field label="Type *">
              <div className="grid grid-cols-5 gap-2">
                {INTERVIEW_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set('type', t.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs transition-colors',
                      form.type === t.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            {form.type === 'onsite' && (
              <Field label="Location">
                <Input
                  placeholder="e.g. Office Floor 3, Room A"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                />
              </Field>
            )}
            {(form.type === 'video' || form.type === 'technical') && (
              <Field label="Meeting URL">
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={form.meeting_url}
                  onChange={(e) => set('meeting_url', e.target.value)}
                />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Interviewer name">
                <Input
                  placeholder="John Doe"
                  value={form.interviewer_name}
                  onChange={(e) => set('interviewer_name', e.target.value)}
                />
              </Field>
              <Field label="Interviewer email">
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={form.interviewer_email}
                  onChange={(e) => set('interviewer_email', e.target.value)}
                />
              </Field>
            </div>

            <Field label="Notes">
              <Textarea
                placeholder="Preparation notes, topics to cover…"
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </Field>
          </div>

          <DialogFooter className="shrink-0 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createInterview.isPending}>
              {createInterview.isPending ? 'Scheduling…' : 'Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit status dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-heading">Update status</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            {editing?.applications?.profiles?.full_name} —{' '}
            {editing?.applications?.job_postings?.title}
          </p>
          <div className="space-y-2 py-2">
            {(['scheduled', 'completed', 'cancelled', 'rescheduled'] as InterviewStatus[]).map((s) => (
              <button
                key={s}
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: editing?.id, status: s })}
                className={cn(
                  'w-full rounded-xl border p-3 text-left text-sm capitalize transition-colors disabled:opacity-50',
                  editing?.status === s
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border bg-background text-foreground hover:bg-accent'
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{s}</span>
                  {(s === 'cancelled' || s === 'rescheduled') && s !== editing?.status && (
                    <span className="text-xs text-muted-foreground">sends notification</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}