import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, updateProfile } = useAuthStore();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    headline: profile?.headline || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    linkedin_url: profile?.linkedin_url || '',
    portfolio_url: profile?.portfolio_url || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, val: string) => setForm({ ...form, [key]: val });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-heading text-xl font-bold text-foreground">Profile Settings</h1>

      <div className="card-elevated p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Full Name</Label>
            <Input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label className="text-sm">Email</Label>
            <Input value={profile?.email || ''} disabled className="mt-1.5 opacity-60" />
          </div>
          <div>
            <Label className="text-sm">Phone</Label>
            <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1.5" placeholder="+62..." />
          </div>
          <div>
            <Label className="text-sm">Location</Label>
            <Input value={form.location} onChange={(e) => update('location', e.target.value)} className="mt-1.5" placeholder="Jakarta, Indonesia" />
          </div>
        </div>
        <div>
          <Label className="text-sm">Headline</Label>
          <Input value={form.headline} onChange={(e) => update('headline', e.target.value)} className="mt-1.5" placeholder="e.g. Senior Frontend Developer" />
        </div>
        <div>
          <Label className="text-sm">Bio</Label>
          <Textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} className="mt-1.5" rows={4} placeholder="Tell us about yourself..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">LinkedIn URL</Label>
            <Input value={form.linkedin_url} onChange={(e) => update('linkedin_url', e.target.value)} className="mt-1.5" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <Label className="text-sm">Portfolio URL</Label>
            <Input value={form.portfolio_url} onChange={(e) => update('portfolio_url', e.target.value)} className="mt-1.5" placeholder="https://..." />
          </div>
        </div>
        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>
    </div>
  );
}
