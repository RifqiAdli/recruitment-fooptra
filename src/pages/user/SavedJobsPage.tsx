import { useSavedJobs, useToggleSaveJob } from '@/hooks/useSavedJobs';
import { JobCard } from '@/components/shared/JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function SavedJobsPage() {
  const { data: savedJobs, isLoading } = useSavedJobs();
  const toggleSave = useToggleSaveJob();

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>;

  if (!savedJobs?.length) {
    return (
      <div className="text-center py-16">
        <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-heading text-xl font-semibold text-foreground mb-2">No Saved Jobs</h2>
        <p className="text-sm text-muted-foreground mb-4">Bookmark jobs you're interested in to view them later.</p>
        <Link to="/jobs"><Button>Browse Jobs</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-bold text-foreground">Saved Jobs ({savedJobs.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {savedJobs.map((saved: any) => (
          <JobCard
            key={saved.id}
            job={{ ...saved.job_postings, category: saved.job_postings?.job_categories, skills: saved.job_postings?.skills || [] }}
            isSaved
            onSave={() => toggleSave.mutate({ jobId: saved.job_id, isSaved: true })}
          />
        ))}
      </div>
    </div>
  );
}
