import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Bell, Check, CheckCheck, Calendar, Clock,
  Video, Phone, MapPin, Laptop, Users,
  ExternalLink, User, Mail as MailIcon, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeDate } from '@/lib/utils';

// ─── Type icons ───────────────────────────────────────────────────────────────

const typeIcon: Record<string, React.ReactNode> = {
  video:     <Video className="h-4 w-4" />,
  phone:     <Phone className="h-4 w-4" />,
  onsite:    <MapPin className="h-4 w-4" />,
  technical: <Laptop className="h-4 w-4" />,
  hr:        <Users className="h-4 w-4" />,
};

const notifTypeIcon: Record<string, React.ReactNode> = {
  interview:     <Calendar className="h-4 w-4 text-primary" />,
  status_update: <FileText className="h-4 w-4 text-info" />,
  application:   <FileText className="h-4 w-4 text-muted-foreground" />,
  offer:         <FileText className="h-4 w-4 text-success" />,
  system:        <Bell className="h-4 w-4 text-muted-foreground" />,
};

const statusColors: Record<string, string> = {
  scheduled:   'bg-primary/10 text-primary',
  completed:   'bg-success/10 text-success',
  cancelled:   'bg-destructive/10 text-destructive',
  rescheduled: 'bg-warning/10 text-warning',
};

// ─── Interview detail fetcher ─────────────────────────────────────────────────

function useInterviewDetail(applicationId: string | null) {
  return useQuery({
    queryKey: ['notif-interview-detail', applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          applications (
            id, status, expected_salary,
            profiles!applicant_id (full_name, email, phone),
            job_postings!job_id (title, department, location, location_type)
          )
        `)
        .eq('application_id', applicationId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

  const unread = (notifications || []).filter((n: any) => !n.is_read).length;

  // Fetch interview detail only when an interview notification is selected
  const isInterviewNotif = selectedNotif?.type === 'interview';
  const { data: interviewDetail, isLoading: isDetailLoading } = useInterviewDetail(
    isInterviewNotif ? selectedNotif?.reference_id : null
  );

  const handleClick = (notif: any) => {
    setSelectedNotif(notif);
    if (!notif.is_read) markRead.mutate(notif.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-xl font-bold text-foreground">
            Notifications
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {unread}
              </span>
            )}
          </h1>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead.mutate()}
              className="text-primary"
            >
              <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
            </Button>
          )}
        </div>

        {!notifications?.length ? (
          <div className="text-center py-16">
            <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="font-heading text-xl font-semibold text-foreground mb-2">No Notifications</h2>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif: any) => (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={cn(
                  'card-elevated p-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-accent/50',
                  !notif.is_read && 'border-primary/30 bg-primary/5'
                )}
              >
                {/* Dot indicator */}
                <div className={cn(
                  'h-2 w-2 rounded-full mt-2 shrink-0',
                  notif.is_read ? 'bg-transparent' : 'bg-primary'
                )} />

                {/* Icon by type */}
                <div className="shrink-0 mt-0.5">
                  {notifTypeIcon[notif.type] ?? <Bell className="h-4 w-4 text-muted-foreground" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{formatRelativeDate(notif.created_at)}</p>
                </div>

                {/* Unread checkmark / click hint */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {!notif.is_read && <Check className="h-4 w-4 text-muted-foreground" />}
                  {notif.type === 'interview' && (
                    <span className="text-[10px] text-muted-foreground">View details</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Interview detail dialog ──────────────────────────────────────────── */}
      <Dialog open={!!selectedNotif} onOpenChange={(v) => !v && setSelectedNotif(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              {notifTypeIcon[selectedNotif?.type] ?? <Bell className="h-4 w-4" />}
              {selectedNotif?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Notification message */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {selectedNotif?.message}
            </p>

            {/* Interview detail — only for interview type */}
            {isInterviewNotif && (
              <>
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Interview details
                  </p>

                  {isDetailLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 rounded-xl" />
                      <Skeleton className="h-10 rounded-xl" />
                      <Skeleton className="h-10 rounded-xl" />
                    </div>
                  ) : interviewDetail ? (
                    <div className="space-y-2">
                      {/* Job */}
                      <DetailRow
                        icon={<FileText className="h-4 w-4" />}
                        label="Position"
                        value={`${interviewDetail.applications?.job_postings?.title} — ${interviewDetail.applications?.job_postings?.department}`}
                      />

                      {/* Type */}
                      <DetailRow
                        icon={typeIcon[interviewDetail.type] ?? <Calendar className="h-4 w-4" />}
                        label="Type"
                        value={interviewDetail.type.charAt(0).toUpperCase() + interviewDetail.type.slice(1)}
                      />

                      {/* Date */}
                      <DetailRow
                        icon={<Calendar className="h-4 w-4" />}
                        label="Date & Time"
                        value={new Date(interviewDetail.scheduled_at).toLocaleString('en-ID', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                        })}
                      />

                      {/* Duration */}
                      <DetailRow
                        icon={<Clock className="h-4 w-4" />}
                        label="Duration"
                        value={`${interviewDetail.duration_minutes} minutes`}
                      />

                      {/* Location or meeting URL */}
                      {interviewDetail.meeting_url && (
                        <DetailRow
                          icon={<Video className="h-4 w-4" />}
                          label="Meeting link"
                          value={
                            <a
                              href={interviewDetail.meeting_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-primary underline underline-offset-2"
                            >
                              Join meeting <ExternalLink className="h-3 w-3" />
                            </a>
                          }
                        />
                      )}
                      {interviewDetail.location && (
                        <DetailRow
                          icon={<MapPin className="h-4 w-4" />}
                          label="Location"
                          value={interviewDetail.location}
                        />
                      )}

                      {/* Interviewer */}
                      {interviewDetail.interviewer_name && (
                        <DetailRow
                          icon={<User className="h-4 w-4" />}
                          label="Interviewer"
                          value={interviewDetail.interviewer_name}
                        />
                      )}
                      {interviewDetail.interviewer_email && (
                        <DetailRow
                          icon={<MailIcon className="h-4 w-4" />}
                          label="Interviewer email"
                          value={interviewDetail.interviewer_email}
                        />
                      )}

                      {/* Status */}
                      <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
                        <span className="text-xs text-muted-foreground">Status</span>
                        <Badge className={cn('border-0 capitalize', statusColors[interviewDetail.status] ?? 'bg-muted text-muted-foreground')}>
                          {interviewDetail.status}
                        </Badge>
                      </div>

                      {/* Notes */}
                      {interviewDetail.notes && (
                        <div className="rounded-xl border border-border bg-background p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Notes from interviewer</p>
                          <p className="text-sm text-foreground leading-relaxed">{interviewDetail.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Interview details not found.</p>
                  )}
                </div>
              </>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground/60 text-right">
              {selectedNotif && formatRelativeDate(selectedNotif.created_at)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Detail row helper ────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <span className="shrink-0 text-muted-foreground mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  );
}