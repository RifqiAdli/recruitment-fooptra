import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Heart, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { JobPosting } from '@/types';
import { formatSalary, formatRelativeDate, employmentTypeLabels, locationTypeLabels } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: JobPosting;
  isSaved?: boolean;
  onSave?: () => void;
  variant?: 'grid' | 'list';
}

export function JobCard({ job, isSaved, onSave, variant = 'grid' }: JobCardProps) {
  if (variant === 'list') {
    return (
      <div className="card-elevated p-5 flex flex-col sm:flex-row sm:items-center gap-4 group">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0 font-heading font-bold text-sm"
            style={{ backgroundColor: job.category?.color ? `${job.category.color}20` : undefined, color: job.category?.color }}
          >
            {job.department.charAt(0)}
          </div>
          <div className="min-w-0">
            <Link to={`/jobs/${job.slug}`} className="font-heading font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
              {job.title}
            </Link>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{employmentTypeLabels[job.employment_type]}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatRelativeDate(job.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:shrink-0">
          <span className="pill-badge bg-accent text-accent-foreground text-xs">
            {locationTypeLabels[job.location_type]}
          </span>
          {job.salary_visible && (
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
            </span>
          )}
          <Link to={`/jobs/${job.slug}`}>
            <Button size="sm" variant="outline">View</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 flex flex-col h-full group">
      <div className="flex items-start justify-between mb-4">
        <div
          className="h-12 w-12 rounded-lg flex items-center justify-center font-heading font-bold text-sm"
          style={{ backgroundColor: job.category?.color ? `${job.category.color}20` : undefined, color: job.category?.color }}
        >
          {job.department.charAt(0)}
        </div>
        {onSave && (
          <button onClick={onSave} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Save job">
            <Heart className={cn('h-5 w-5', isSaved && 'fill-destructive text-destructive')} />
          </button>
        )}
      </div>

      <Link to={`/jobs/${job.slug}`} className="font-heading font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">
        {job.title}
      </Link>
      <p className="text-sm text-muted-foreground mb-3">{job.department}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="pill-badge bg-primary/10 text-primary">{employmentTypeLabels[job.employment_type]}</span>
        <span className="pill-badge bg-accent text-accent-foreground">{locationTypeLabels[job.location_type]}</span>
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{job.location}</span>
        </div>
        {job.salary_visible && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <DollarSign className="h-3.5 w-3.5" />
            <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{formatRelativeDate(job.created_at)}</span>
          <Link to={`/jobs/${job.slug}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
