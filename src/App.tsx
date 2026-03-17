import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { UserLayout } from "@/components/layout/UserLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute, AdminRoute } from "@/components/shared/ProtectedRoute";
import { lazy, Suspense, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

const HomePage = lazy(() => import("./pages/public/HomePage"));
const JobsPage = lazy(() => import("./pages/public/JobsPage"));
const JobDetailPage = lazy(() => import("./pages/public/JobDetailPage"));
const AboutPage = lazy(() => import("./pages/public/AboutPage"));
const FAQPage = lazy(() => import("./pages/public/FAQPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// User dashboard
const UserDashboard = lazy(() => import("./pages/user/DashboardPage"));
const MyApplications = lazy(() => import("./pages/user/MyApplicationsPage"));
const SavedJobs = lazy(() => import("./pages/user/SavedJobsPage"));
const Notifications = lazy(() => import("./pages/user/NotificationsPage"));
const Profile = lazy(() => import("./pages/user/ProfilePage"));

// Admin dashboard
const AdminDashboard = lazy(() => import("./pages/admin/DashboardPage"));
const AdminJobs = lazy(() => import("./pages/admin/JobsListPage"));
const AdminJobCreate = lazy(() => import("./pages/admin/JobCreatePage"));
const AdminApplications = lazy(() => import("./pages/admin/ApplicationsPage"));
const AdminKanban = lazy(() => import("./pages/admin/KanbanPage"));
const AdminCandidates = lazy(() => import("./pages/admin/CandidatesPage"));
const AdminInterviews = lazy(() => import("./pages/admin/InterviewsPage"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AnnouncementsPage"));
const AdminFAQ = lazy(() => import("./pages/admin/FAQManagePage"));
const AdminSettings = lazy(() => import("./pages/admin/SettingsPage"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => { initialize(); }, [initialize]);
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:slug" element={<JobDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FAQPage />} />
              </Route>

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/dashboard/applications" element={<MyApplications />} />
                <Route path="/dashboard/saved" element={<SavedJobs />} />
                <Route path="/dashboard/notifications" element={<Notifications />} />
                <Route path="/dashboard/profile" element={<Profile />} />
              </Route>

              <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/jobs" element={<AdminJobs />} />
                <Route path="/admin/jobs/create" element={<AdminJobCreate />} />
                <Route path="/admin/jobs/:jobId/edit" element={<AdminJobCreate />} />
                <Route path="/admin/applications" element={<AdminApplications />} />
                <Route path="/admin/applications/kanban" element={<AdminKanban />} />
                <Route path="/admin/candidates" element={<AdminCandidates />} />
                <Route path="/admin/interviews" element={<AdminInterviews />} />
                <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                <Route path="/admin/faq" element={<AdminFAQ />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
