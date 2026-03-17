import { Badge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  reviewing: { label: 'Reviewing', className: 'bg-primary/10 text-primary' },
  shortlisted: { label: 'Shortlisted', className: 'bg-info/10 text-info' },
  interview_scheduled: { label: 'Interview', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  interviewed: { label: 'Interviewed', className: 'bg-info/10 text-info' },
  offered: { label: 'Offered', className: 'bg-warning/10 text-warning' },
  hired: { label: 'Hired', className: 'bg-success/10 text-success' },
  rejected: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
  withdrawn: { label: 'Withdrawn', className: 'bg-muted text-muted-foreground' },
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('pill-badge', config.className)}>
      {config.label}
    </span>
  );
}
